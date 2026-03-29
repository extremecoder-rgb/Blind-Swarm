import React from 'react';
export interface TaskStep {
    index: number;
    agentId: string | null;
    status: 'PENDING' | 'EXECUTING' | 'COMPLETED' | 'FAILED';
    description: string;
}
export interface DashboardState {
    taskId: string;
    status: string;
    steps: TaskStep[];
    logs: string[];
}
export declare const DashboardApp: React.FC<DashboardState>;
//# sourceMappingURL=Dashboard.d.ts.map