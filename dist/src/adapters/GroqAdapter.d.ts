import { type AIAdapter, type ExecutionResult } from './types.js';
export declare class GroqAdapter implements AIAdapter {
    private client;
    private model;
    private systemPrompt;
    constructor(apiKey: string, model?: string, systemPrompt?: string);
    execute(prompt: string, context: Record<string, unknown>): Promise<ExecutionResult>;
}
export declare function createGroqAdapter(apiKey: string, model?: string, systemPrompt?: string): GroqAdapter;
//# sourceMappingURL=GroqAdapter.d.ts.map