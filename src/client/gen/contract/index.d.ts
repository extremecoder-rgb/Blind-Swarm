import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Agent = { owner: Uint8Array;
                      capabilities: Uint8Array;
                      stake: bigint;
                      reputation: bigint
                    };

export type Task = { owner: Uint8Array;
                     escrow: bigint;
                     deadline: bigint;
                     is_completed: boolean
                   };

export type StepAttestation = { agent_id: Uint8Array; output_hash: Uint8Array };

export type Witnesses<PS> = {
  secretKey(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  register_agent(context: __compactRuntime.CircuitContext<PS>,
                 capabilities_0: Uint8Array,
                 stake_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  create_task(context: __compactRuntime.CircuitContext<PS>,
              task_id_0: Uint8Array,
              escrow_0: bigint,
              deadline_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  submit_attestation(context: __compactRuntime.CircuitContext<PS>,
                     task_id_0: Uint8Array,
                     step_bytes_0: Uint8Array,
                     output_hash_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  register_agent(context: __compactRuntime.CircuitContext<PS>,
                 capabilities_0: Uint8Array,
                 stake_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  create_task(context: __compactRuntime.CircuitContext<PS>,
              task_id_0: Uint8Array,
              escrow_0: bigint,
              deadline_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  submit_attestation(context: __compactRuntime.CircuitContext<PS>,
                     task_id_0: Uint8Array,
                     step_bytes_0: Uint8Array,
                     output_hash_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  register_agent(context: __compactRuntime.CircuitContext<PS>,
                 capabilities_0: Uint8Array,
                 stake_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  create_task(context: __compactRuntime.CircuitContext<PS>,
              task_id_0: Uint8Array,
              escrow_0: bigint,
              deadline_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  submit_attestation(context: __compactRuntime.CircuitContext<PS>,
                     task_id_0: Uint8Array,
                     step_bytes_0: Uint8Array,
                     output_hash_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  agents: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Agent;
    [Symbol.iterator](): Iterator<[Uint8Array, Agent]>
  };
  tasks: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Task;
    [Symbol.iterator](): Iterator<[Uint8Array, Task]>
  };
  attestations: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): StepAttestation;
    [Symbol.iterator](): Iterator<[Uint8Array, StepAttestation]>
  };
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
