import 'dotenv/config';
export interface ClientConfig {
    seed?: string;
    mnemonicPhrase?: string;
    zkConfigPath?: string;
}
export interface DeployResult {
    contractAddress: string;
    transactionId: string;
}
export declare class MidnightClient {
    private config;
    private wallet;
    private providers;
    private contract;
    private seed;
    private shieldedSecretKeys;
    private dustSecretKey;
    private unshieldedKeystore;
    constructor(config: ClientConfig);
    initWallet(): Promise<void>;
    private createWalletAndMidnightProvider;
    get walletAddress(): string;
    getBalance(): Promise<{
        tNight: bigint;
        dust: bigint;
    }>;
    deployContract(): Promise<DeployResult>;
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
    stop(): Promise<void>;
}
export declare function createClient(config?: ClientConfig): Promise<MidnightClient>;
//# sourceMappingURL=index.d.ts.map