import 'dotenv/config';
export interface ClientConfig {
    providerUrl: string;
    indexerUrl: string;
    seed: string;
    mnemonicPhrase?: string;
    contractAddress?: string;
}
export interface DeployResult {
    contractAddress: string;
    transactionId: string;
}
/**
 * BlindSwarm Real Production Client (SDK Pure)
 */
declare class MidnightClient {
    private config;
    private providers;
    private wallet;
    private contract;
    constructor(config: ClientConfig);
    /**
     * Initialize the real HD Wallet.
     * Supports both a pre-derived 64-char hex seed OR a 24-word mnemonic phrase.
     */
    initWallet(): Promise<void>;
    get walletAddress(): string;
    /**
     * ACTUAL deployment of the provided contract logic.
     */
    deployContract(compiledContract: any): Promise<DeployResult>;
    /**
     * ACTUAL joining of an existing contract.
     */
    joinContract(compiledContract: any, contractAddress: string): Promise<void>;
    registerAgent(capabilities: string[], stake: bigint): Promise<{
        agentId: string;
    }>;
    createTask(taskId: string, escrow: bigint, deadline: number): Promise<{
        taskId: string;
    }>;
    assignStep(taskId: string, stepIndex: number, agentId: string): Promise<void>;
    submitAttestation(taskId: string, stepBytes: Uint8Array, outputHash: string): Promise<{
        success: boolean;
    }>;
    getContractState(): Promise<any>;
    watchEvent(eventName: string, handler: (data: any) => void): void;
}
export declare function createClient(config: any): Promise<MidnightClient>;
export { MidnightClient };
//# sourceMappingURL=index.d.ts.map