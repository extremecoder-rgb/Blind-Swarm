import 'dotenv/config';
export interface ClientConfig {
    providerUrl: string;
    walletPrivateKey: string;
    contractAddress?: string;
    network?: 'preprod' | 'local';
}
export interface DeployResult {
    contractAddress: string;
    transactionId: string;
}
/**
 * BlindSwarm Protocol Client
 * This client provides the bridge to the Midnight Network (via local simulation or testnet integration).
 * It enforces cryptographic verification of attestations before submitting proof-of-work to the chain.
 */
declare class MidnightClient {
    private config;
    private contract;
    private eventWatchers;
    constructor(config: ClientConfig);
    /**
     * Deploy the BlindSwarm orchestration contract.
     * In the production-minded prototype, this generates a unique deterministic address.
     */
    deployContract(): Promise<DeployResult>;
    getContractState(): Promise<any>;
    registerAgent(capabilities: string[], stake: bigint): Promise<{
        agentId: string;
    }>;
    createTask(dag: any, escrow: bigint, deadline: number): Promise<{
        taskId: string;
    }>;
    assignStep(taskId: string, stepIndex: number, agentId: string): Promise<{
        success: boolean;
    }>;
    /**
     * CRYPTOGRAPHICALLY VERIFIED ATTESTATION SUBMISSION
     * This is where the core BlindSwarm protocol innovation happens:
     * The client (or a future ZK prover) verifies that the agent signed the specific result
     * corresponding to the task ID and step index.
     */
    submitAttestation(taskId: string, stepIndex: number, signature: string, outputHash: string): Promise<{
        success: boolean;
    }>;
    initiateDispute(taskId: string, stepIndex: number, evidenceCommitment: string): Promise<{
        disputeId: string;
    }>;
    resolveDispute(disputeId: string, resolution: 'ruled_for_initiator' | 'ruled_against_initiator', selectiveData: any): Promise<{
        success: boolean;
    }>;
    watchEvent(eventName: string, callback: (data: any) => void): void;
    private emitEvent;
}
export declare function createClient(config: ClientConfig): Promise<MidnightClient>;
export { MidnightClient };
//# sourceMappingURL=index.d.ts.map