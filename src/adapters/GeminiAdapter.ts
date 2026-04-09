import { GoogleGenerativeAI } from '@google/generative-ai';
import { type AIAdapter, type ExecutionResult } from './types.js';

/**
 * Real production implementation of the Gemini API adapter for BlindSwarm.
 * Uses the Google Generative AI SDK to perform private inference for agents.
 */
export class GeminiAdapter implements AIAdapter {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private systemPrompt: string;

  constructor(apiKey: string, modelName: string = 'gemini-2.0-flash', systemPrompt: string = '') {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: modelName,
      systemInstruction: systemPrompt 
    });
    this.systemPrompt = systemPrompt;
  }

  async execute(prompt: string, context: any): Promise<ExecutionResult> {
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
    } catch (error: any) {
      console.error('Gemini API Error details:', error.message);
      throw new Error(`Failed to execute Gemini AI task: ${error.message}`);
    }
  }
}

/**
 * Helper to easily create a new Gemini adapter instance.
 */
export function createGeminiAdapter(apiKey: string, model?: string, systemPrompt?: string): GeminiAdapter {
  return new GeminiAdapter(apiKey, model, systemPrompt);
}

/**
 * Default prompts for the gaming studio demo scenario.
 */
export const AGENT_PROMPTS: Record<string, string> = {
  modeling: "You are a 3D Modeler AI specialized in game asset creation. Create detailed 3D models, meshes, and textures. Provide technical specifications, polygon counts, and texture resolution recommendations. Be specific about modeling techniques and game engine compatibility.",
  coding: "You are a Gameplay Programmer AI specialized in game development. Write clean, optimized C++ or C# code for game mechanics. Provide complete code snippets with comments. Focus on performance, scalability, and game design patterns.",
  design: "You are a UI/UX Designer AI specialized in game interfaces. Design intuitive and visually appealing user interfaces. Consider accessibility, player flow, and modern design trends. Provide layout specifications and interaction patterns.",
  animation: "You are an Animation AI specialized in game character animation. Create smooth, realistic animations for game characters. Specify keyframes, timing, and blend weights. Consider game engine integration and performance constraints.",
  sound: "You are a Sound Designer AI specialized in game audio. Create or recommend sound effects and music. Specify audio formats, spatial settings, and implementation details.",
  qa: "You are a QA Tester AI specialized in game quality assurance. Identify potential bugs, gameplay issues, and user experience problems. Provide detailed test cases and priority levels.",
};
