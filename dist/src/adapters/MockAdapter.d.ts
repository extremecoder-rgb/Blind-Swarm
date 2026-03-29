export interface AIAdapter {
    execute(prompt: string, context: any): Promise<ExecutionResult>;
}
export interface ExecutionResult {
    result: string;
    confidence: number;
    metadata: Record<string, any>;
}
export declare class MockAdapter implements AIAdapter {
    private capability;
    constructor(capability?: string);
    execute(prompt: string, context: any): Promise<ExecutionResult>;
    private simpleHash;
}
export declare function createMockAdapter(capability?: string): MockAdapter;
//# sourceMappingURL=MockAdapter.d.ts.map