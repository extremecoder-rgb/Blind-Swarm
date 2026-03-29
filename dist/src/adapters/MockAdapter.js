export class MockAdapter {
    capability;
    constructor(capability = 'general') {
        this.capability = capability;
    }
    async execute(prompt, context) {
        // Return deterministic output based on inputs
        const hash = this.simpleHash(prompt + JSON.stringify(context));
        const results = {
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
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }
}
export function createMockAdapter(capability) {
    return new MockAdapter(capability);
}
//# sourceMappingURL=MockAdapter.js.map