export class Dashboard {
    running = false;
    async render() {
        this.running = true;
        console.log('\n');
        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║          BlindSwarm - Multi-Agent Orchestration            ║');
        console.log('║              Privacy-Preserving AI Protocol               ║');
        console.log('╚════════════════════════════════════════════════════════════╝');
        console.log('\n');
    }
    update(progress) {
        if (!this.running)
            return;
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
        console.log(`│  Status: ● ${status.padEnd(9)} Step: ${step}/3   Progress: ${progressBar} ${Math.round(step / 3 * 100)}%   │`);
        console.log('│                                                             │');
        console.log('└─────────────────────────────────────────────────────────────┘');
        if (progress.logs && progress.logs.length > 0) {
            console.log('\nRecent logs:');
            progress.logs.slice(-5).forEach(log => console.log(`  ${log}`));
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