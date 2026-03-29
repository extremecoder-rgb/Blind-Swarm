export interface AIAdapter {
  execute(prompt: string, context: any): Promise<ExecutionResult>;
}

export interface ExecutionResult {
  result: string;
  confidence: number;
  metadata: Record<string, any>;
}

export class MockAdapter implements AIAdapter {
  private capability: string;

  constructor(capability: string = 'general') {
    this.capability = capability;
  }

  async execute(prompt: string, context: any): Promise<ExecutionResult> {
    // Return deterministic output based on inputs
    const hash = this.simpleHash(prompt + JSON.stringify(context));
    
    const results: Record<string, string> = {
      market_analysis: `Mock market analysis for: ${prompt.substring(0, 20)}... Recommended action: BUY based on trend analysis. Confidence: ${(hash % 30) + 70}%`,
      risk_analysis: `Mock risk analysis for: ${prompt.substring(0, 20)}... Risk level: ${hash % 3 === 0 ? 'HIGH' : hash % 3 === 1 ? 'MEDIUM' : 'LOW'}. Confidence: ${(hash % 30) + 70}%`,
      compliance: `Mock compliance check for: ${prompt.substring(0, 20)}... Status: ${hash % 2 === 0 ? 'COMPLIANT' : 'NEEDS_REVIEW'}. Confidence: ${(hash % 30) + 70}%`,
      general: `Mock response to: ${prompt.substring(0, 20)}... Processed successfully. Confidence: ${(hash % 30) + 70}%`,
    };

    const result = results[this.capability] || results.general;

    return {
      result,
      confidence: (hash % 30) + 70,
      metadata: {
        capability: this.capability,
        processedAt: Date.now(),
        context,
        deterministic: true,
      },
    };
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}

export function createMockAdapter(capability?: string): MockAdapter {
  return new MockAdapter(capability);
}
