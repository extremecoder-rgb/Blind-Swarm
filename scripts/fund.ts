import 'dotenv/config';
import { WebSocket } from 'ws';
import { setNetworkId, getNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import * as ledger from '@midnight-ntwrk/ledger-v8';
import { WalletFacade } from '@midnight-ntwrk/wallet-sdk-facade';
import { DustWallet } from '@midnight-ntwrk/wallet-sdk-dust-wallet';
import { HDWallet, Roles } from '@midnight-ntwrk/wallet-sdk-hd';
import { ShieldedWallet } from '@midnight-ntwrk/wallet-sdk-shielded';
import { createKeystore, InMemoryTransactionHistoryStorage, PublicKey, UnshieldedWallet } from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import * as Rx from 'rxjs';

(globalThis as any).WebSocket = WebSocket;

const MASTER_SEED = '0000000000000000000000000000000000000000000000000000000000000001';
const RECIPIENT_SEED = 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2';

const CONFIG = {
  indexer: 'http://localhost:8088/api/v3/graphql',
  indexerWS: 'ws://localhost:8088/api/v3/graphql/ws',
  node: 'http://localhost:9944',
  proofServer: 'http://localhost:6300',
};

setNetworkId('undeployed');

function deriveKeys(seed: string) {
  const hdWallet = HDWallet.fromSeed(Buffer.from(seed, 'hex'));
  if (hdWallet.type !== 'seedOk') throw new Error('Invalid seed');
  
  const result = hdWallet.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);
  
  if (result.type !== 'keysDerived') throw new Error('Key derivation failed');
  
  hdWallet.hdWallet.clear();
  return result.keys;
}

async function createWalletFromSeed(seed: string, name: string) {
  const keys = deriveKeys(seed);
  const networkId = getNetworkId();
  
  const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
  const dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
  const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], networkId);
  
  const walletConfig: any = {
    networkId,
    indexerClientConnection: { 
      indexerHttpUrl: CONFIG.indexer, 
      indexerWsUrl: CONFIG.indexerWS 
    },
    provingServerUrl: new URL(CONFIG.proofServer),
    relayURL: new URL(CONFIG.node.replace(/^http/, 'ws')),
  };
  
  const walletCtx = await WalletFacade.init({
    configuration: walletConfig,
    shielded: (config: any) => ShieldedWallet(config).startWithSecretKeys(shieldedSecretKeys),
    unshielded: (config: any) => UnshieldedWallet({
      networkId: config.networkId,
      indexerClientConnection: config.indexerClientConnection,
      txHistoryStorage: new InMemoryTransactionHistoryStorage(),
    }).startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore)),
    dust: (config: any) => DustWallet(config).startWithSecretKey(dustSecretKey, ledger.LedgerParameters.initialParameters().dust),
  });
  
  await walletCtx.start(shieldedSecretKeys, dustSecretKey);
  
  const state: any = await Rx.firstValueFrom(
    walletCtx.state().pipe(
      Rx.throttleTime(5000), 
      Rx.filter((s: any) => s.isSynced)
    )
  );
  
  const address = unshieldedKeystore.getBech32Address();
  const balance = state.unshielded.balances[ledger.unshieldedToken().raw] ?? 0n;
  
  console.log(`[${name}] Address: ${address}`);
  console.log(`[${name}] NIGHT Balance: ${balance}`);
  
  return { wallet: walletCtx, address, keystore: unshieldedKeystore };
}

async function main() {
  console.log('=== Midnight Wallet Funder ===\n');
  
  console.log('Creating master wallet (genesis)...');
  const master = await createWalletFromSeed(MASTER_SEED, 'Master');
  
  console.log('\nCreating recipient wallet...');
  const recipient = await createWalletFromSeed(RECIPIENT_SEED, 'Recipient');
  
  console.log('\n=== Transferring NIGHT tokens ===');
  await master.wallet.transfer(recipient.address, 50000n * 1000000n);
  
  console.log('Waiting for transfer to confirm (20 seconds)...');
  await new Promise(r => setTimeout(r, 20000));
  
  const state: any = await Rx.firstValueFrom(
    recipient.wallet.state().pipe(Rx.filter((s: any) => s.isSynced))
  );
  const balance = state.unshielded.balances[ledger.unshieldedToken().raw] ?? 0n;
  console.log(`Recipient NIGHT balance: ${balance}`);
  
  console.log('\n=== Registering DUST ===');
  const dustState: any = await Rx.firstValueFrom(
    recipient.wallet.state().pipe(Rx.filter((s: any) => s.isSynced))
  );
  
  const dustAvailable = (dustState.dust as any).availableCoins?.length > 0;
  if (!dustAvailable) {
    const nightUtxos = dustState.unshielded.availableCoins.filter(
      (c: any) => !c.meta?.registeredForDustGeneration
    );
    
    if (nightUtxos.length > 0) {
      console.log('Registering for DUST...');
      const recipe = await recipient.wallet.registerNightUtxosForDustGeneration(
        nightUtxos,
        recipient.keystore.getPublicKey(),
        (payload: Uint8Array) => recipient.keystore.signData(payload),
      );
      await recipient.wallet.submitTransaction(
        await recipient.wallet.finalizeRecipe(recipe)
      );
      
      await Rx.firstValueFrom(
        recipient.wallet.state().pipe(
          Rx.throttleTime(5000),
          Rx.filter((s: any) => s.isSynced),
          Rx.filter((s: any) => (s.dust as any).availableCoins?.length > 0)
        ),
      );
    }
  }
  console.log('DUST ready!');
  
  console.log('\n=== Final Check ===');
  const finalState: any = await Rx.firstValueFrom(
    recipient.wallet.state().pipe(Rx.filter((s: any) => s.isSynced))
  );
  const finalNight = finalState.unshielded.balances[ledger.unshieldedToken().raw] ?? 0n;
  const finalDust = (finalState.dust as any).availableCoins?.length ?? 0;
  
  console.log(`NIGHT: ${finalNight}`);
  console.log(`DUST: ${finalDust} coins available`);
  console.log(`Recipient Address: ${recipient.address}`);
  
  console.log('\n✅ Funding complete!');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});