export interface DemoConfig {
    useMockAI: boolean;
    showTUI: boolean;
    geminiApiKey?: string;
}
export declare class DemoRunner {
    private config;
    private dashboard;
    private logs;
    constructor(config: DemoConfig);
    private addLog;
    run(): Promise<void>;
}
export declare function runDemo(config?: Partial<DemoConfig>): Promise<void>;
//# sourceMappingURL=index.d.ts.map