export interface TaskProgress {
  taskId: string;
  status: string;
  steps: Array<{ index: number; status: string; agent?: string }>;
  logs: string[];
}

export type { TaskStep } from '../types/index.js';

export class Dashboard {
  private running: boolean = false;
  private agentCount: number = 4;

  async render(): Promise<void> {
    this.running = true;
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║          🎮 Gaming Studio Multi-Agent System                ║');
    console.log('║              AI-Powered Game Development                   ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('\n');
  }

  update(progress: Partial<TaskProgress>): void {
    if (!this.running) return;
    
    const totalSteps = progress.steps?.length || 4;
    const completedSteps = progress.steps?.filter(s => s.status === 'completed').length || 0;
    const pendingSteps = progress.steps?.filter(s => s.status === 'pending').length || totalSteps;
    const assignedSteps = progress.steps?.filter(s => s.status === 'assigned').length || 0;
    
    console.clear();
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║          🎮 Gaming Studio Multi-Agent System                ║');
    console.log('║              AI-Powered Game Development                   ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('\n');

    console.log('┌─────────────────────────────────────────────────────────────┐');
    console.log('│                  4-AGENT GAME DEV TEAM                     │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    console.log('│                                                             │');
    console.log('│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────┐│');
    console.log('│  │    MODELER   │▶│    CODER     │▶│   DESIGNER   │▶│ ANI││');
    console.log('│  │   (3D Art)   │ │ (Gameplay)   │ │   (UI/UX)    │ │MAT ││');
    console.log('│  └──────────────┘ └──────────────┘ └──────────────┘ └────┘│');
    console.log('│                                                             │');
    
    const status = progress.status || 'RUNNING';
    const progressBar = '█'.repeat(completedSteps) + '░'.repeat(pendingSteps + assignedSteps);
    console.log(`│  Status: ${status}  Progress: ${progressBar} ${Math.round(completedSteps/totalSteps*100)}%     │`);
    console.log(`│  Completed: ${completedSteps}/${totalSteps} steps                              │`);
    console.log('│                                                             │');
    console.log('└─────────────────────────────────────────────────────────────┘');
    
    if (progress.logs && progress.logs.length > 0) {
      console.log('\nRecent logs:');
      const recentLogs = progress.logs.slice(-6);
      recentLogs.forEach(log => {
        if (log.startsWith('---')) {
          console.log(`  ${log}`);
        } else if (log.includes('✓') || log.includes('✅')) {
          console.log(`  ${log}`);
        } else {
          console.log(`  ${log.substring(0, 70)}`);
        }
      });
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