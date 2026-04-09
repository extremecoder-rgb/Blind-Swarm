import OpenAI from 'openai';
export class GroqAdapter {
    client;
    model;
    systemPrompt;
    constructor(apiKey, model = 'llama-3.1-8b-instant', systemPrompt = '') {
        this.client = new OpenAI({ apiKey, baseURL: 'https://api.groq.com/openai/v1' });
        this.model = model;
        this.systemPrompt = systemPrompt;
    }
    async execute(prompt, context) {
        try {
            const fullPrompt = this.systemPrompt ? `${this.systemPrompt}\n\nUser: ${prompt}` : prompt;
            const result = await this.client.chat.completions.create({
                model: this.model,
                messages: [
                    ...(this.systemPrompt ? [{ role: 'system', content: this.systemPrompt }] : []),
                    { role: 'user', content: fullPrompt }
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
        }
        catch (error) {
            throw new Error(`Failed to execute Groq AI task: ${error.message}`);
        }
    }
}
export function createGroqAdapter(apiKey, model, systemPrompt) {
    return new GroqAdapter(apiKey, model, systemPrompt);
}
//# sourceMappingURL=GroqAdapter.js.map