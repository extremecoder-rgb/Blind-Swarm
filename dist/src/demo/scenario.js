export function createDemoScenario() {
    const agents = [
        {
            id: 'agent_market',
            name: 'Market Analysis Agent',
            capability: 'market_analysis',
            description: 'Analyzes market trends and provides investment recommendations',
        },
        {
            id: 'agent_risk',
            name: 'Risk Analysis Agent',
            capability: 'risk_analysis',
            description: 'Evaluates risks associated with investment recommendations',
        },
        {
            id: 'agent_compliance',
            name: 'Compliance Agent',
            capability: 'compliance',
            description: 'Validates compliance with regulatory requirements',
        },
    ];
    const dag = {
        steps: [
            {
                index: 0,
                dependencies: [],
                description: 'Analyze market conditions and provide investment recommendation',
            },
            {
                index: 1,
                dependencies: [0],
                description: 'Evaluate risks of the proposed investment',
            },
            {
                index: 2,
                dependencies: [0, 1],
                description: 'Validate compliance with regulatory requirements',
            },
        ],
    };
    return {
        agents,
        dag,
        expectedOutcome: 'All 3 steps completed with valid attestations on-chain',
    };
}
export const DEMO_SCENARIO = createDemoScenario();
//# sourceMappingURL=scenario.js.map