export class Dashboard {
    running = false;
    agentCount = 4;
    async render() {
        this.running = true;
        console.log('\n');
        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║               🌟 LUMINANCE Protocol                        ║');
        console.log('║           Privacy-Preserving AI Orchestration               ║');
        console.log('╚═══════════════════════════════════════════════════════════╝');
        console.log('\n');
    }
    update(progress) {
        if (!this.running)
            return;
        const totalSteps = progress.steps?.length || 4;
        const completedSteps = progress.steps?.filter(s => s.status === 'completed').length || 0;
        const pendingSteps = progress.steps?.filter(s => s.status === 'pending').length || totalSteps;
        const assignedSteps = progress.steps?.filter(s => s.status === 'assigned').length || 0;
        console.clear();
        console.log('\n');
        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║               🌟 LUMINANCE Protocol                        ║');
        console.log('║           Privacy-Preserving AI Orchestration               ║');
        console.log('╚═══════════════════════════════════════════════════════════╝');
        console.log('\n');
        console.log('┌─────────────────────────────────────────────────────────────┐');
        console.log('│                  AUTONOMOUS PRIVACY SWARM                  │');
        console.log('├─────────────────────────────────────────────────────────────┤');
        console.log('│                                                             │');
        console.log('│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────┐│');
        console.log('│  │    MODELER   │▶│    CODER     │▶│   DESIGNER   │▶│ ANI││');
        console.log('│  │   (3D Art)   │ │ (Gameplay)   │ │   (UI/UX)    │ │MAT ││');
        console.log('│  └──────────────┘ └──────────────┘ └──────────────┘ └────┘│');
        console.log('│                                                             │');
        const status = progress.status || 'RUNNING';
        const progressBar = '█'.repeat(completedSteps) + '░'.repeat(pendingSteps + assignedSteps);
        console.log(`│  Status: ${status}  Progress: ${progressBar} ${Math.round(completedSteps / totalSteps * 100)}%     │`);
        console.log(`│  Completed: ${completedSteps}/${totalSteps} steps                              │`);
        console.log('│                                                             │');
        console.log('└─────────────────────────────────────────────────────────────┘');
        if (progress.logs && progress.logs.length > 0) {
            console.log('\nRecent logs:');
            const recentLogs = progress.logs.slice(-6);
            recentLogs.forEach(log => {
                if (log.startsWith('---')) {
                    console.log(`  ${log}`);
                }
                else if (log.includes('✓') || log.includes('✅')) {
                    console.log(`  ${log}`);
                }
                else {
                    console.log(`  ${log.substring(0, 70)}`);
                }
            });
        }
    }
    addLog(log) {
        console.log(`  ${log}`);
    }
    stop() {
        this.running = false;
    }
}
export function createDashboard() {
    return new Dashboard();
}
//# sourceMappingURL=index.js.map