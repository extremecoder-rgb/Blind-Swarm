export interface DemoConfig {
    showTUI: boolean;
    geminiApiKey: string;
    onUpdate?: (state: any) => void;
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