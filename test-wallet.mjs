import 'dotenv/config';
import { mnemonicToSeedSync } from '@scure/bip39';
import { Buffer } from 'buffer';
import { WalletFacade } from '@midnight-ntwrk/wallet-sdk-facade';
import { DustWallet } from '@midnight-ntwrk/wallet-sdk-dust-wallet';
import { HDWallet, Roles } from '@midnight-ntwrk/wallet-sdk-hd';
import { ShieldedWallet } from '@midnight-ntwrk/wallet-sdk-shielded';
import { createKeystore, PublicKey, UnshieldedWallet } from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import * as ledger from '@midnight-ntwrk/ledger-v8';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import * as Rx from 'rxjs';
import { WebSocket } from 'ws';

globalThis.WebSocket = WebSocket;

const MNEMONIC = process.env.MIDNIGHT_MNEMONIC || 'trumpet pioneer slide later awful diet bubble special fitness will zebra canvas alcohol disagree vibrant coin gauge evidence ski black float neutral sock about';

setNetworkId('preprod');

const seedBytes = mnemonicToSeedSync(MNEMONIC);
const seedHex = Buffer.from(seedBytes).toString('hex').slice(0, 64);
const seedBuffer = Buffer.from(seedHex, 'hex');

const hdWallet = HDWallet.fromSeed(seedBuffer);

if (hdWallet.type !== 'seedOk') {
  console.error('Invalid seed');
  process.exit(1);
}

const result = hdWallet.hdWallet.selectAccount(0).selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust]).deriveKeysAt(0);

if (result.type !== 'keysDerived') {
  console.error('Key derivation failed');
  process.exit(1);
}

const keys = result.keys;
hdWallet.hdWallet.clear();

const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
const dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], 'preprod');

const INDEXER = 'https://indexer.preprod.midnight.network/api/v3/graphql';
const INDEXER_WS = 'wss://indexer.preprod.midnight.network/api/v3/graphql/ws';
const NODE = 'https://rpc.preprod.midnight.network';
const PROOF_SERVER = 'http://127.0.0.1:6300';

const walletConfig = {
  networkId: 'preprod',
  indexerClientConnection: { indexerHttpUrl: INDEXER, indexerWsUrl: INDEXER_WS },
  provingServerUrl: new URL(PROOF_SERVER),
  relayURL: new URL(NODE.replace(/^https?/, 'ws')),
};

async function main() {
  console.log('Creating wallet...');
  
  const wallet = await WalletFacade.init({
    configuration: walletConfig,
    shielded: (cfg) => ShieldedWallet(cfg).startWithSecretKeys(shieldedSecretKeys),
    unshielded: (cfg) => UnshieldedWallet(cfg).startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore)),
    dust: (cfg) => DustWallet(cfg).startWithSecretKey(dustSecretKey, ledger.LedgerParameters.initialParameters().dust),
  });

  console.log('Starting wallet...');
  await wallet.start(shieldedSecretKeys, dustSecretKey);
  console.log('Wallet started');

  // Take current state (skip full sync)
  const state = await Rx.firstValueFrom(wallet.state().pipe(Rx.take(1)));
  console.log('Address:', unshieldedKeystore.getBech32Address());
  console.log('Balance:', state?.unshielded?.balances?.[ledger.unshieldedToken().raw] ?? 0n);
  console.log('DUST:', state?.dust?.balance(new Date()) ?? 0n);

  await wallet.stop();
  console.log('Done!');
}

main().catch(console.error);