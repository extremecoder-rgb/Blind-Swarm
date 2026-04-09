import type { DAG } from '../types/index.js';
export interface Agent {
    id: string;
    name: string;
    capability: 'fetcher' | 'risk' | 'yield' | 'report';
    description: string;
    role: string;
}
export interface Scenario {
    agents: Agent[];
    dag: DAG;
    expectedOutcome: string;
    projectName: string;
}
export declare function createDeFiAnalyticsScenario(): Scenario;
export declare const SCENARIO: Scenario;
//# sourceMappingURL=scenario.d.ts.map