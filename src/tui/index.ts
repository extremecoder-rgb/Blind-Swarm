export interface TaskProgress {
  taskId: string;
  status: string;
  steps: Array<{ index: number; status: string; agent?: string }>;
  logs: string[];
}

export type { TaskStep } from '../types/index.js';

export class Dashboard {
  private running: boolean = false;

  async render(): Promise<void> {
    this.running = true;
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║          BlindSwarm - Multi-Agent Orchestration            ║');
    console.log('║              Privacy-Preserving AI Protocol               ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('\n');
  }

  update(progress: Partial<TaskProgress>): void {
    if (!this.running) return;
    
    console.clear();
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║          BlindSwarm - Multi-Agent Orchestration            ║');
    console.log('║              Privacy-Preserving AI Protocol               ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('\n');

    console.log('┌─────────────────────────────────────────────────────────────┐');
    console.log('│                    3-AGENT DEMO VIEW                        │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    console.log('│                                                             │');
    console.log('│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │');
    console.log('│  │   AGENT 1    │───▶│   AGENT 2    │───▶│   AGENT 3    │  │');
    console.log('│  │ Market       │    │ Risk         │    │ Compliance   │  │');
    console.log('│  │ Analysis     │    │ Analysis     │    │ Decision     │  │');
    console.log('│  └──────────────┘    └──────────────┘    └──────────────┘  │');
    console.log('│                                                             │');
    
    const status = progress.status || 'RUNNING';
    const step = progress.steps?.filter(s => s.status === 'completed').length || 0;
    const progressBar = '█'.repeat(step) + '░'.repeat(3 - step);
    console.log(`│  Status: ● ${status.padEnd(9)} Step: ${step}/3   Progress: ${progressBar} ${Math.round(step/3*100)}%   │`);
    console.log('│                                                             │');
    console.log('└─────────────────────────────────────────────────────────────┘');
    
    if (progress.logs && progress.logs.length > 0) {
      console.log('\nRecent logs:');
      progress.logs.slice(-5).forEach(log => console.log(`  ${log}`));
    }
  }

  addLog(log: string): void {
    console.log(`  ${log}`);
  }

  stop(): void {
    this.running = false;
  }
}

export function createDashboard(): Dashboard {
  return new Dashboard();
}
