export function ledger(stateOrChargedState: any): {
    agents: {
        isEmpty(...args_0: any[]): boolean;
        size(...args_0: any[]): bigint;
        member(...args_0: any[]): boolean;
        lookup(...args_0: any[]): {
            owner: Uint8Array<ArrayBufferLike>;
            capabilities: Uint8Array<ArrayBufferLike>;
            stake: bigint;
            reputation: bigint;
        };
        [Symbol.iterator](...args_0: any[]): any;
    };
    tasks: {
        isEmpty(...args_0: any[]): boolean;
        size(...args_0: any[]): bigint;
        member(...args_0: any[]): boolean;
        lookup(...args_0: any[]): {
            owner: Uint8Array<ArrayBufferLike>;
            escrow: bigint;
            deadline: bigint;
            is_completed: boolean;
        };
        [Symbol.iterator](...args_0: any[]): any;
    };
    attestations: {
        isEmpty(...args_0: any[]): boolean;
        size(...args_0: any[]): bigint;
        member(...args_0: any[]): boolean;
        lookup(...args_0: any[]): {
            agent_id: Uint8Array<ArrayBufferLike>;
            output_hash: Uint8Array<ArrayBufferLike>;
        };
        [Symbol.iterator](...args_0: any[]): any;
    };
};
export class Contract {
    constructor(...args_0: any[]);
    witnesses: any;
    circuits: {
        register_agent: (...args_1: any[]) => {
            result: any[];
            context: any;
            proofData: {
                input: {
                    value: Uint8Array<ArrayBufferLike>[];
                    alignment: __compactRuntime.AlignmentSegment[];
                };
                output: undefined;
                publicTranscript: never[];
                privateTranscriptOutputs: never[];
            };
            gasCost: any;
        };
        create_task: (...args_1: any[]) => {
            result: any[];
            context: any;
            proofData: {
                input: {
                    value: Uint8Array<ArrayBufferLike>[];
                    alignment: __compactRuntime.AlignmentSegment[];
                };
                output: undefined;
                publicTranscript: never[];
                privateTranscriptOutputs: never[];
            };
            gasCost: any;
        };
        submit_attestation: (...args_1: any[]) => {
            result: any[];
            context: any;
            proofData: {
                input: {
                    value: Uint8Array<ArrayBufferLike>[];
                    alignment: __compactRuntime.AlignmentSegment[];
                };
                output: undefined;
                publicTranscript: never[];
                privateTranscriptOutputs: never[];
            };
            gasCost: any;
        };
    };
    impureCircuits: {
        register_agent: (...args_1: any[]) => {
            result: any[];
            context: any;
            proofData: {
                input: {
                    value: Uint8Array<ArrayBufferLike>[];
                    alignment: __compactRuntime.AlignmentSegment[];
                };
                output: undefined;
                publicTranscript: never[];
                privateTranscriptOutputs: never[];
            };
            gasCost: any;
        };
        create_task: (...args_1: any[]) => {
            result: any[];
            context: any;
            proofData: {
                input: {
                    value: Uint8Array<ArrayBufferLike>[];
                    alignment: __compactRuntime.AlignmentSegment[];
                };
                output: undefined;
                publicTranscript: never[];
                privateTranscriptOutputs: never[];
            };
            gasCost: any;
        };
        submit_attestation: (...args_1: any[]) => {
            result: any[];
            context: any;
            proofData: {
                input: {
                    value: Uint8Array<ArrayBufferLike>[];
                    alignment: __compactRuntime.AlignmentSegment[];
                };
                output: undefined;
                publicTranscript: never[];
                privateTranscriptOutputs: never[];
            };
            gasCost: any;
        };
    };
    provableCircuits: {
        register_agent: (...args_1: any[]) => {
            result: any[];
            context: any;
            proofData: {
                input: {
                    value: Uint8Array<ArrayBufferLike>[];
                    alignment: __compactRuntime.AlignmentSegment[];
                };
                output: undefined;
                publicTranscript: never[];
                privateTranscriptOutputs: never[];
            };
            gasCost: any;
        };
        create_task: (...args_1: any[]) => {
            result: any[];
            context: any;
            proofData: {
                input: {
                    value: Uint8Array<ArrayBufferLike>[];
                    alignment: __compactRuntime.AlignmentSegment[];
                };
                output: undefined;
                publicTranscript: never[];
                privateTranscriptOutputs: never[];
            };
            gasCost: any;
        };
        submit_attestation: (...args_1: any[]) => {
            result: any[];
            context: any;
            proofData: {
                input: {
                    value: Uint8Array<ArrayBufferLike>[];
                    alignment: __compactRuntime.AlignmentSegment[];
                };
                output: undefined;
                publicTranscript: never[];
                privateTranscriptOutputs: never[];
            };
            gasCost: any;
        };
    };
    initialState(...args_0: any[]): {
        currentContractState: __compactRuntime.ContractState;
        currentPrivateState: any;
        currentZswapLocalState: __compactRuntime.EncodedZswapLocalState;
    };
    _persistentHash_0(value_0: any): Uint8Array<ArrayBufferLike>;
    _persistentHash_1(value_0: any): Uint8Array<ArrayBufferLike>;
    _secretKey_0(context: any, partialProofData: any): any;
    _callerPk_0(context: any, partialProofData: any): Uint8Array<ArrayBufferLike>;
    _attestationKey_0(task_id_0: any, step_bytes_0: any): Uint8Array<ArrayBufferLike>;
    _register_agent_0(context: any, partialProofData: any, capabilities_0: any, stake_0: any): never[];
    _create_task_0(context: any, partialProofData: any, task_id_0: any, escrow_0: any, deadline_0: any): never[];
    _submit_attestation_0(context: any, partialProofData: any, task_id_0: any, step_bytes_0: any, output_hash_0: any): never[];
}
export const pureCircuits: {};
export namespace contractReferenceLocations {
    let tag: string;
    let indices: {};
}
import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
//# sourceMappingURL=index.d.ts.map