import 'dotenv/config';
import * as path from 'node:path';
import { WebSocket } from 'ws';
import * as Rx from 'rxjs';
import { Buffer } from 'buffer';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { setNetworkId, getNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import * as ledger from '@midnight-ntwrk/ledger-v8';
import { WalletFacade } from '@midnight-ntwrk/wallet-sdk-facade';
import { DustWallet } from '@midnight-ntwrk/wallet-sdk-dust-wallet';
import { HDWallet, Roles } from '@midnight-ntwrk/wallet-sdk-hd';
import { ShieldedWallet } from '@midnight-ntwrk/wallet-sdk-shielded';
import { createKeystore, InMemoryTransactionHistoryStorage, PublicKey, UnshieldedWallet } from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
globalThis.WebSocket = WebSocket;
setNetworkId('preprod');
export const CONFIG = {
    indexer: 'https://indexer.preprod.midnight.network/api/v3/graphql',
    indexerWS: 'wss://indexer.preprod.midnight.network/api/v3/graphql/ws',
    node: 'https://rpc.preprod.midnight.network',
    proofServer: 'http://127.0.0.1:6300',
};
export function deriveKeys(seed) {
    const hdWallet = HDWallet.fromSeed(Buffer.from(seed, 'hex'));
    if (hdWallet.type !== 'seedOk')
        throw new Error('Invalid seed');
    const result = hdWallet.hdWallet
        .selectAccount(0)
        .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
        .deriveKeysAt(0);
    if (result.type !== 'keysDerived')
        throw new Error('Key derivation failed');
    hdWallet.hdWallet.clear();
    return result.keys;
}
export async function createWallet(seed) {
    const keys = deriveKeys(seed);
    const networkId = getNetworkId();
    const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
    const dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
    const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], networkId);
    const walletConfig = {
        networkId,
        indexerClientConnection: {
            indexerHttpUrl: CONFIG.indexer,
            indexerWsUrl: CONFIG.indexerWS
        },
        provingServerUrl: new URL(CONFIG.proofServer),
        relayURL: new URL(CONFIG.node.replace(/^http/, 'ws')),
    };
    const shieldedWallet = ShieldedWallet(walletConfig)
        .startWithSecretKeys(shieldedSecretKeys);
    const unshieldedWallet = UnshieldedWallet({
        networkId,
        indexerClientConnection: walletConfig.indexerClientConnection,
        txHistoryStorage: new InMemoryTransactionHistoryStorage(),
    }).startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore));
    const dustWallet = DustWallet({
        ...walletConfig,
        costParameters: {
            additionalFeeOverhead: 300000000000000n,
            feeBlocksMargin: 5
        },
    }).startWithSecretKey(dustSecretKey, ledger.LedgerParameters.initialParameters().dust);
    const wallet = new WalletFacade(shieldedWallet, unshieldedWallet, dustWallet);
    await wallet.start(shieldedSecretKeys, dustSecretKey);
    return { wallet, shieldedSecretKeys, dustSecretKey, unshieldedKeystore };
}
export function signTransactionIntents(tx, signFn, proofMarker) {
    if (!tx.intents || tx.intents.size === 0)
        return;
    for (const segment of tx.intents.keys()) {
        const intent = tx.intents.get(segment);
        if (!intent)
            continue;
        const cloned = ledger.Intent.deserialize('signature', proofMarker, 'pre-binding', intent.serialize());
        const sigData = cloned.signatureData(segment);
        const signature = signFn(sigData);
        if (cloned.fallibleUnshieldedOffer) {
            const sigs = cloned.fallibleUnshieldedOffer.inputs.map((_, i) => cloned.fallibleUnshieldedOffer.signatures.at(i) ?? signature);
            cloned.fallibleUnshieldedOffer = cloned.fallibleUnshieldedOffer.addSignatures(sigs);
        }
        if (cloned.guaranteedUnshieldedOffer) {
            const sigs = cloned.guaranteedUnshieldedOffer.inputs.map((_, i) => cloned.guaranteedUnshieldedOffer.signatures.at(i) ?? signature);
            cloned.guaranteedUnshieldedOffer = cloned.guaranteedUnshieldedOffer.addSignatures(sigs);
        }
        tx.intents.set(segment, cloned);
    }
}
export async function createProviders(walletCtx) {
    const state = await Rx.firstValueFrom(walletCtx.wallet.state().pipe(Rx.filter((s) => s.isSynced)));
    const walletProvider = {
        getCoinPublicKey: () => state.shielded.coinPublicKey.toHexString(),
        getEncryptionPublicKey: () => state.shielded.encryptionPublicKey.toHexString(),
        async balanceTx(tx, ttl) {
            const recipe = await walletCtx.wallet.balanceUnboundTransaction(tx, {
                shieldedSecretKeys: walletCtx.shieldedSecretKeys,
                dustSecretKey: walletCtx.dustSecretKey
            }, { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) });
            const signFn = (payload) => walletCtx.unshieldedKeystore.signData(payload);
            signTransactionIntents(recipe.baseTransaction, signFn, 'proof');
            if (recipe.balancingTransaction) {
                signTransactionIntents(recipe.balancingTransaction, signFn, 'pre-proof');
            }
            return walletCtx.wallet.finalizeRecipe(recipe);
        },
        submitTx: (tx) => walletCtx.wallet.submitTransaction(tx),
    };
    const zkConfigProvider = new NodeZkConfigProvider(path.join(process.cwd(), 'contracts', 'managed', 'blind-swarm'));
    return {
        privateStateProvider: levelPrivateStateProvider({
            privateStateStoreName: 'blind-swarm-state',
            walletProvider
        }),
        publicDataProvider: indexerPublicDataProvider(CONFIG.indexer, CONFIG.indexerWS),
        zkConfigProvider,
        proofProvider: httpClientProofProvider(CONFIG.proofServer, zkConfigProvider),
        walletProvider,
        midnightProvider: walletProvider,
    };
}
//# sourceMappingURL=utils.js.map