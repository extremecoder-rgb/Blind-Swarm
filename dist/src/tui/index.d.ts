export interface TaskProgress {
    taskId: string;
    status: string;
    steps: Array<{
        index: number;
        status: string;
        agent?: string;
    }>;
    logs: string[];
}
export type { TaskStep } from '../types/index.js';
export declare class Dashboard {
    private running;
    private agentCount;
    render(): Promise<void>;
    update(progress: Partial<TaskProgress>): void;
    addLog(log: string): void;
    stop(): void;
}
export declare function createDashboard(): Dashboard;
//# sourceMappingURL=index.d.ts.map