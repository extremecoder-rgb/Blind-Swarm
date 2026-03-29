import type { DAG } from '../types/index.js';
export interface DemoAgent {
    id: string;
    name: string;
    capability: string;
    description: string;
}
export interface DemoScenario {
    agents: DemoAgent[];
    dag: DAG;
    expectedOutcome: string;
}
export declare function createDemoScenario(): DemoScenario;
export declare const DEMO_SCENARIO: DemoScenario;
//# sourceMappingURL=scenario.d.ts.map