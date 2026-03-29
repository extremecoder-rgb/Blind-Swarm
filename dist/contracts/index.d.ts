export * from './BlindSwarm.js';
export interface CompactContract {
    name: string;
    version: string;
    state: any;
    circuits: {
        [key: string]: (inputs: any) => Promise<any>;
    };
}
export declare function createBlindSwarmContract(): CompactContract;
//# sourceMappingURL=index.d.ts.map