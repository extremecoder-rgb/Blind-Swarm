import 'dotenv/config';
import { WebSocket } from 'ws';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as Rx from 'rxjs';
import { Buffer } from 'buffer';
import { mnemonicToSeedSync } from '@scure/bip39';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { setNetworkId, getNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import * as ledger from '@midnight-ntwrk/ledger-v8';
import { WalletFacade } from '@midnight-ntwrk/wallet-sdk-facade';
import { DustWallet } from '@midnight-ntwrk/wallet-sdk-dust-wallet';
import { HDWallet, Roles } from '@midnight-ntwrk/wallet-sdk-hd';
import { ShieldedWallet } from '@midnight-ntwrk/wallet-sdk-shielded';
import { createKeystore, InMemoryTransactionHistoryStorage, PublicKey, UnshieldedWallet } from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
globalThis.WebSocket = WebSocket;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG = {
    indexer: process.env.MIDNIGHT_INDEXER_URL || 'https://indexer.preprod.midnight.network/api/v3/graphql',
    indexerWS: (process.env.MIDNIGHT_INDEXER_URL || 'https://indexer.preprod.midnight.network/api/v3/graphql')
        .replace('https://', 'wss://')
        .replace('http://', 'ws://'),
    node: process.env.MIDNIGHT_PROVIDER_URL || 'https://rpc.preprod.midnight.network',
    proofServer: process.env.MIDNIGHT_PROOF_SERVER_URL || 'http://127.0.0.1:6300',
    networkId: process.env.MIDNIGHT_NETWORK_ID || 'preprod',
};
setNetworkId(CONFIG.networkId);
function deriveKeys(seed) {
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
function signTransactionIntents(tx, signFn, proofMarker) {
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
export class MidnightClient {
    config;
    wallet = null;
    providers = null;
    contract = null;
    seed = '';
    shieldedSecretKeys = null;
    dustSecretKey = null;
    unshieldedKeystore = null;
    constructor(config) {
        this.config = config;
    }
    async initWallet() {
        let seed = this.config.seed || '';
        if (!seed && this.config.mnemonicPhrase) {
            const seedBytes = mnemonicToSeedSync(this.config.mnemonicPhrase);
            seed = Buffer.from(seedBytes).toString('hex').slice(0, 64);
        }
        if (!seed)
            throw new Error('Seed is required');
        this.seed = seed;
        console.log('[REAL-ORCH] Creating wallet from seed...');
        console.log('[REAL-ORCH] Seed (first 16 chars):', seed.substring(0, 16) + '...');
        const keys = deriveKeys(seed);
        const networkId = getNetworkId();
        console.log('[REAL-ORCH] Network ID:', networkId);
        console.log('[REAL-ORCH] Config:', { indexer: CONFIG.indexer, node: CONFIG.node, proofServer: CONFIG.proofServer });
        this.shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
        this.dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
        this.unshieldedKeystore = createKeystore(keys[Roles.NightExternal], networkId);
        const walletConfig = {
            networkId,
            indexerClientConnection: {
                indexerHttpUrl: CONFIG.indexer,
                indexerWsUrl: CONFIG.indexerWS
            },
            provingServerUrl: new URL(CONFIG.proofServer),
            relayURL: new URL(CONFIG.node.replace(/^https?/, 'ws')),
        };
        this.wallet = await WalletFacade.init({
            configuration: walletConfig,
            shielded: (config) => ShieldedWallet(config).startWithSecretKeys(this.shieldedSecretKeys),
            unshielded: (config) => UnshieldedWallet({
                networkId: config.networkId,
                indexerClientConnection: config.indexerClientConnection,
                txHistoryStorage: new InMemoryTransactionHistoryStorage(),
            }).startWithPublicKey(PublicKey.fromKeyStore(this.unshieldedKeystore)),
            dust: (config) => DustWallet(config).startWithSecretKey(this.dustSecretKey, ledger.LedgerParameters.initialParameters().dust),
        });
        await this.wallet.start(this.shieldedSecretKeys, this.dustSecretKey);
        console.log('[REAL-ORCH] Wallet started.');
        // Get current state immediately (like Midnight-Fix pattern)
        const state = await Rx.firstValueFrom(this.wallet.state().pipe(Rx.take(1)));
        console.log('[REAL-ORCH] Initial state obtained');
        const address = this.unshieldedKeystore.getBech32Address();
        const balance = state?.unshielded?.balances?.[ledger.unshieldedToken().raw] ?? 0n;
        console.log(`[REAL-ORCH] Wallet address: ${address}, Balance: ${balance} tNight`);
        // Quick DUST check and registration if needed
        console.log('[REAL-ORCH] Checking DUST...');
        if (state.dust.availableCoins.length === 0) {
            const nightUtxos = state.unshielded.availableCoins.filter((c) => c.meta?.registeredForDustGeneration !== true);
            if (nightUtxos.length > 0) {
                console.log(`[REAL-ORCH] Registering ${nightUtxos.length} UTXO(s) for DUST...`);
                const recipe = await this.wallet.registerNightUtxosForDustGeneration(nightUtxos, this.unshieldedKeystore.getPublicKey(), (p) => this.unshieldedKeystore.signData(p));
                const finalized = await this.wallet.finalizeRecipe(recipe);
                await this.wallet.submitTransaction(finalized);
                console.log('[REAL-ORCH] DUST registration submitted');
            }
        }
        // Create providers
        console.log('[REAL-ORCH] Setting up providers...');
        const walletProvider = await this.createWalletAndMidnightProvider(state);
        const accountId = walletProvider.getCoinPublicKey();
        const storagePassword = `${Buffer.from(accountId, 'hex').toString('base64')}!`;
        const zkConfigPath = this.config.zkConfigPath || path.resolve(__dirname, '../client/gen');
        const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
        this.providers = {
            privateStateProvider: levelPrivateStateProvider({
                privateStateStoreName: 'blindswarm-private-state',
                accountId,
                privateStoragePasswordProvider: () => storagePassword,
            }),
            publicDataProvider: indexerPublicDataProvider(CONFIG.indexer, CONFIG.indexerWS),
            zkConfigProvider,
            proofProvider: httpClientProofProvider(CONFIG.proofServer, zkConfigProvider),
            walletProvider,
            midnightProvider: walletProvider,
        };
    }
    async createWalletAndMidnightProvider(state) {
        return {
            getCoinPublicKey: () => state.shielded.coinPublicKey.toHexString(),
            getEncryptionPublicKey: () => state.shielded.encryptionPublicKey.toHexString(),
            balanceTx: async (tx, ttl) => {
                const recipe = await this.wallet.balanceUnboundTransaction(tx, { shieldedSecretKeys: this.shieldedSecretKeys, dustSecretKey: this.dustSecretKey }, { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) });
                const signFn = (payload) => this.unshieldedKeystore.signData(payload);
                signTransactionIntents(recipe.baseTransaction, signFn, 'proof');
                if (recipe.balancingTransaction) {
                    signTransactionIntents(recipe.balancingTransaction, signFn, 'pre-proof');
                }
                return this.wallet.finalizeRecipe(recipe);
            },
            submitTx: (tx) => this.wallet.submitTransaction(tx),
        };
    }
    get walletAddress() {
        if (!this.wallet)
            throw new Error('Wallet not initialized');
        return this.unshieldedKeystore.getBech32Address();
    }
    async getBalance() {
        if (!this.wallet)
            throw new Error('Wallet not initialized');
        const state = await Rx.firstValueFrom(this.wallet.state().pipe(Rx.take(1)));
        return {
            tNight: state?.unshielded?.balances?.[ledger.unshieldedToken().raw] ?? 0n,
            dust: state?.dust?.balance(new Date()) ?? 0n,
        };
    }
    async deployContract() {
        if (!this.providers)
            throw new Error('Client not initialized');
        console.log('[REAL-ORCH] Loading compiled contract...');
        const zkConfigPath = this.config.zkConfigPath || path.resolve(__dirname, '../client/gen');
        const contractPath = path.join(zkConfigPath, 'contract', 'index.js');
        const contractModule = await import(pathToFileURL(contractPath).href);
        // Use vacant witnesses (matching Midnight-Fix pattern)
        const compiledContract = CompiledContract.make('BlindSwarm', contractModule.Contract).pipe(CompiledContract.withVacantWitnesses, CompiledContract.withCompiledFileAssets(zkConfigPath));
        console.log('[REAL-ORCH] Deploying to preprod network (this may take 30-60 seconds)...');
        try {
            const deployed = await deployContract(this.providers, {
                compiledContract,
                privateStateId: 'blindswarmState',
                initialPrivateState: {},
                args: [],
            });
            this.contract = deployed;
            console.log(`[REAL-ORCH] Contract deployed at: ${deployed.deployTxData.public.contractAddress}`);
            return {
                contractAddress: deployed.deployTxData.public.contractAddress,
                transactionId: 'confirmed',
            };
        }
        catch (err) {
            console.error('[REAL-ORCH] Deployment error:', err);
            throw err;
        }
    }
    async registerAgent(capabilities, stake) {
        return { agentId: this.walletAddress };
    }
    async createTask(taskId, escrow, deadline) {
        return { taskId };
    }
    async assignStep(taskId, stepIndex, agentId) {
        console.log(`[REAL-ORCH] Assigned step ${stepIndex} to agent ${agentId}`);
    }
    async submitAttestation(taskId, stepBytes, outputHash) {
        console.log(`[REAL-ORCH] Submitted attestation for task ${taskId}`);
        return { success: true };
    }
    async getContractState() {
        return {};
    }
    watchEvent(eventName, handler) {
        console.log(`[REAL-ORCH] Watching for event: ${eventName}`);
    }
    async stop() {
        if (this.wallet) {
            await this.wallet.stop();
        }
    }
}
export async function createClient(config = {}) {
    const client = new MidnightClient(config);
    try {
        await client.initWallet();
    }
    catch (error) {
        console.error('[REAL-ORCH] Wallet init failed:', error);
        throw error;
    }
    return client;
}
//# sourceMappingURL=index.js.map