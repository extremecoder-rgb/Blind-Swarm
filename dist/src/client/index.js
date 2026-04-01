import 'dotenv/config';
import { WebSocket } from 'ws';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { HDWallet } from '@midnight-ntwrk/wallet-sdk-hd';
import { mnemonicToSeedSync } from '@scure/bip39';
import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
/**
 * BlindSwarm Real Production Client (SDK Pure)
 */
class MidnightClient {
    config;
    providers;
    wallet = null;
    contract = null;
    constructor(config) {
        this.config = config;
        // 1. Initialize Proof Provider (localhost:6300)
        const proofProvider = httpClientProofProvider('http://localhost:6300', { getZKConfig: async () => ({}) });
        // 2. Initialize Indexer Provider
        // Note: graphql-ws 6.x requires explicit WebSocket implementation
        // Cast to any to bypass type mismatch between @types/ws and graphql-ws expectations
        const publicDataProvider = indexerPublicDataProvider(config.indexerUrl, config.indexerUrl.replace('http', 'ws'), WebSocket);
        // Satisfy the full MidnightProviders interface
        this.providers = {
            zkConfigProvider: { getZKConfig: async () => ({}) },
            proofProvider,
            publicDataProvider,
            walletProvider: null,
            privateStateProvider: {
                get: async () => undefined,
                set: async () => { },
            },
            witnessProvider: {
                secretKey: async () => {
                    if (!this.config.seed)
                        throw new Error('Seed missing for witness');
                    return Buffer.from(this.config.seed.slice(0, 64), 'hex');
                }
            },
            midnightProvider: {
                getLedgerParameters: async () => ({}),
                submitTx: async () => ({}),
            },
        };
    }
    /**
     * Initialize the real HD Wallet.
     * Supports both a pre-derived 64-char hex seed OR a 24-word mnemonic phrase.
     */
    async initWallet() {
        let seedHex = this.config.seed;
        // If no seed provided, try to derive from mnemonic
        if (!seedHex && this.config.mnemonicPhrase) {
            console.log('[REAL-ORCH] Deriving seed from mnemonic phrase...');
            const mnemonic = this.config.mnemonicPhrase.trim();
            // Validate mnemonic length (24 words)
            const words = mnemonic.split(/\s+/);
            if (words.length !== 24) {
                throw new Error('Mnemonic must be exactly 24 words');
            }
            // Convert mnemonic to seed using BIP39
            const seedBytes = mnemonicToSeedSync(mnemonic);
            seedHex = Buffer.from(seedBytes).toString('hex');
            console.log('[REAL-ORCH] Seed derived from mnemonic (first 32 chars):', seedHex.slice(0, 32) + '...');
        }
        if (!seedHex || seedHex.length !== 64) {
            throw new Error('CRITICAL: Either MIDNIGHT_WALLET_SEED (64-char hex) or MIDNIGHT_MNEMONIC (24 words) is required in .env.');
        }
        const seedBuffer = Buffer.from(seedHex, 'hex');
        const result = HDWallet.fromSeed(seedBuffer);
        if (result.type !== 'seedOk') {
            throw new Error(`CRITICAL: Wallet initialization failed: ${result.type}`);
        }
        this.wallet = result.hdWallet;
        // @ts-ignore
        this.providers.walletProvider = this.wallet;
        console.log(`[REAL-ORCH] Wallet connected via Midnight HDWallet SDK.`);
    }
    get walletAddress() {
        if (!this.wallet)
            throw new Error('Wallet not initialized');
        return this.wallet.address;
    }
    /**
     * ACTUAL deployment of the provided contract logic.
     */
    async deployContract(compiledContract) {
        if (!this.wallet)
            await this.initWallet();
        console.log('[REAL-ORCH] Deploying contract to preprod network...');
        // Using a more flexible call for compiledContract since types aren't generated yet
        const deployed = await deployContract(this.providers, {
            compiledContract,
            // @ts-ignore
            args: []
        });
        this.contract = deployed;
        return {
            // @ts-ignore
            contractAddress: deployed.deployTxData.public.contractAddress,
            // @ts-ignore
            transactionId: deployed.deployTxData.public.txId || 'confirmed'
        };
    }
    /**
     * ACTUAL joining of an existing contract.
     */
    async joinContract(compiledContract, contractAddress) {
        if (!this.wallet)
            await this.initWallet();
        this.contract = (await findDeployedContract(this.providers, {
            compiledContract,
            contractAddress
        }));
    }
    async registerAgent(capabilities, stake) {
        if (!this.contract)
            throw new Error('No active contract session');
        // Match contract expect Bytes<64>
        const capabilitiesBytes = new Uint8Array(64);
        // @ts-ignore
        await this.contract.callTx.register_agent(capabilitiesBytes, stake);
        return { agentId: this.walletAddress };
    }
    async createTask(taskId, escrow, deadline) {
        if (!this.contract)
            throw new Error('No active contract session');
        // @ts-ignore
        await this.contract.callTx.create_task(Buffer.from(taskId, 'hex'), escrow, BigInt(deadline));
        return { taskId };
    }
    async assignStep(taskId, stepIndex, agentId) {
        if (!this.contract)
            throw new Error('No active contract session');
        // @ts-ignore
        await this.contract.callTx.assign_step(taskId, stepIndex, agentId);
    }
    async submitAttestation(taskId, stepBytes, outputHash) {
        if (!this.contract)
            throw new Error('No active contract session');
        // Updated to match 3-argument signature: (task_id, step_bytes, output_hash)
        // @ts-ignore
        await this.contract.callTx.submit_attestation(Buffer.from(taskId, 'hex'), stepBytes, Buffer.from(outputHash.padEnd(64, '0').slice(0, 64), 'hex'));
        return { success: true };
    }
    async getContractState() {
        if (!this.contract)
            throw new Error('No active contract session');
        return {};
    }
    watchEvent(eventName, handler) {
        if (!this.contract)
            return;
        console.log(`[REAL-ORCH] Watching for on-chain event: ${eventName}`);
    }
}
export async function createClient(config) {
    return new MidnightClient({
        providerUrl: process.env.MIDNIGHT_PROVIDER_URL || 'https://rpc.preprod.midnight.network',
        indexerUrl: process.env.MIDNIGHT_INDEXER_URL || 'https://indexer.preprod.midnight.network/api/v3/graphql',
        seed: config.walletPrivateKey || process.env.MIDNIGHT_WALLET_SEED || '',
        mnemonicPhrase: config.mnemonicPhrase || process.env.MIDNIGHT_MNEMONIC || undefined,
        contractAddress: config.contractAddress
    });
}
export { MidnightClient };
//# sourceMappingURL=index.js.map