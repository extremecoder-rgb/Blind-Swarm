import OpenAI from 'openai';
import { type AIAdapter, type ExecutionResult } from './types.js';

export class GroqAdapter implements AIAdapter {
  private client: OpenAI;
  private model: string;
  private systemPrompt: string;

  constructor(apiKey: string, model: string = 'llama-3.1-8b-instant', systemPrompt: string = '') {
    this.client = new OpenAI({ apiKey, baseURL: 'https://api.groq.com/openai/v1' });
    this.model = model;
    this.systemPrompt = systemPrompt;
  }

  async execute(prompt: string, context: Record<string, unknown>): Promise<ExecutionResult> {
    try {
      const fullPrompt = this.systemPrompt ? `${this.systemPrompt}\n\nUser: ${prompt}` : prompt;
      
      const result = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          ...(this.systemPrompt ? [{ role: 'system' as const, content: this.systemPrompt }] : []),
          { role: 'user' as const, content: fullPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2048,
      });

      const text = result.choices[0]?.message?.content || '';

      return {
        result: text,
        confidence: 90,
        metadata: {
          model: this.model,
          provider: 'groq',
          processedAt: Date.now(),
          context,
          systemPromptHash: this.systemPrompt.length > 0 ? true : false
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to execute Groq AI task: ${error.message}`);
    }
  }
}

export function createGroqAdapter(apiKey: string, model?: string, systemPrompt?: string): GroqAdapter {
  return new GroqAdapter(apiKey, model, systemPrompt);
}