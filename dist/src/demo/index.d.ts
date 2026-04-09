export interface Config {
    showTUI: boolean;
    geminiApiKey: string;
    groqApiKey?: string;
    useMockAI?: boolean;
    onUpdate?: (state: any) => void;
}
export interface AgentData {
    id: string;
    name: string;
    capability: string;
    role: string;
    publicKey: string;
    privateKey: string;
}
export declare function runPipeline(config?: Partial<Config>): Promise<void>;
export declare function runDemo(config?: Partial<Config>): Promise<void>;
//# sourceMappingURL=index.d.ts.map