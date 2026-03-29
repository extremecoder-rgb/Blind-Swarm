import { GoogleGenerativeAI } from '@google/generative-ai';
/**
 * Real production implementation of the Gemini API adapter for BlindSwarm.
 * Uses the Google Generative AI SDK to perform private inference for agents.
 */
export class GeminiAdapter {
    genAI;
    model;
    systemPrompt;
    constructor(apiKey, modelName = 'gemini-1.5-flash', systemPrompt = '') {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: systemPrompt
        });
        this.systemPrompt = systemPrompt;
    }
    async execute(prompt, context) {
        if (!this.genAI) {
            throw new Error('Gemini API key not configured or initialization failed');
        }
        try {
            // Execute the generation request to the Gemini API
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            // Return structured output for the protocol
            return {
                result: text,
                confidence: 95, // Gemini models typically provide high quality responses
                metadata: {
                    model: this.model.model,
                    processedAt: Date.now(),
                    context,
                    apiCall: true,
                    systemPromptHash: this.systemPrompt.length > 0 ? true : false
                },
            };
        }
        catch (error) {
            console.error('Gemini API Error details:', error.message);
            throw new Error(`Failed to execute Gemini AI task: ${error.message}`);
        }
    }
}
/**
 * Helper to easily create a new Gemini adapter instance.
 */
export function createGeminiAdapter(apiKey, model, systemPrompt) {
    return new GeminiAdapter(apiKey, model, systemPrompt);
}
/**
 * Default prompts for the demo scenario to ensure high quality analysis.
 */
export const AGENT_PROMPTS = {
    market_analysis: "You are a specialized Market Analyst AI for the BlindSwarm protocol. Provide clear, data-driven insights on market sentiment and trends. Keep responses concise and professional.",
    risk_analysis: "You are a Risk Officer AI for the BlindSwarm protocol. Identify potential hazards, financial instabilities, or red flags in the provided data. Be objective and cautious.",
    compliance: "You are a Regulatory Compliance AI. Check inputs against standard jurisdictional rules and internal protocol policies. Output must be definitive: COMPLIANT, NON-COMPLIANT, or REQUIRES_REVIEW."
};
//# sourceMappingURL=GeminiAdapter.js.map