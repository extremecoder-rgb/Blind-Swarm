import { type AIAdapter, type ExecutionResult } from './types.js';
/**
 * Real production implementation of the Gemini API adapter for BlindSwarm.
 * Uses the Google Generative AI SDK to perform private inference for agents.
 */
export declare class GeminiAdapter implements AIAdapter {
    private genAI;
    private model;
    private systemPrompt;
    constructor(apiKey: string, modelName?: string, systemPrompt?: string);
    execute(prompt: string, context: any): Promise<ExecutionResult>;
}
/**
 * Helper to easily create a new Gemini adapter instance.
 */
export declare function createGeminiAdapter(apiKey: string, model?: string, systemPrompt?: string): GeminiAdapter;
/**
 * Default prompts for the gaming studio demo scenario.
 */
export declare const AGENT_PROMPTS: Record<string, string>;
//# sourceMappingURL=GeminiAdapter.d.ts.map