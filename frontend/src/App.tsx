import { useEffect, useState } from 'react';
import './index.css';

interface TaskStep {
  index: number;
  agentId: string | null;
  status: 'pending' | 'assigned' | 'completed';
  outputHash: string | null;
  attestation: string | null;
}

interface Agent {
  name: string;
  capability: string;
  publicKey: string;
}

interface State {
  logs: string[];
  status?: string;
  steps?: TaskStep[];
  agents?: Agent[];
  results?: {
    fetcher?: string;
    risk?: string;
    yield_opt?: string;
    report?: string;
  };
}

function App() {
  const [state, setState] = useState<State>({ logs: [], steps: [], agents: [], results: {} });
  const [connected, setConnected] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'pools' | 'report'>('overview');

  const completedSteps = state.steps?.filter(s => s.status === 'completed').length || 0;
  const totalSteps = 4;
  const progress = Math.round((completedSteps / totalSteps) * 100);

  useEffect(() => {
    // Particle Animation
    const canvas = document.getElementById('particleCanvas') as HTMLCanvasElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;
    let particles: Particle[] = [];
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
      x!: number; y!: number; vx!: number; vy!: number; size!: number; color!: string; opacity!: number;
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.size = Math.random() * 2 + 1;
        this.color = Math.random() > 0.5 ? '#00f5ff' : '#8b5cf6';
        this.opacity = Math.random() * 0.5 + 0.1;
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
      }
      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.fill();
      }
    }

    for (let i = 0; i < 60; i++) particles.push(new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      
      // Connect particles
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dist = Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = p1.color;
            ctx.globalAlpha = (1 - dist / 100) * 0.1;
            ctx.stroke();
          }
        });
      });
      animationFrame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:5001');
    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.message) {
          setState((s) => ({ ...s, logs: [...s.logs, data.message] }));
          const msg = data.message;
          if (msg.includes('On-Chain Fetcher Output:')) {
            setState((s) => ({ ...s, results: { ...s.results, fetcher: msg } }));
          } else if (msg.includes('Risk Analyst Output:')) {
            setState((s) => ({ ...s, results: { ...s.results, risk: msg } }));
          } else if (msg.includes('Yield Optimizer Output:')) {
            setState((s) => ({ ...s, results: { ...s.results, yield_opt: msg } }));
          } else if (msg.includes('Report Generator Output:')) {
            setState((s) => ({ ...s, results: { ...s.results, report: msg } }));
          }
        } else {
          setState((s) => ({ 
            ...s, 
            ...data, 
            logs: data.logs || s.logs,
            agents: data.agents?.length > 0 ? data.agents : s.agents || getDefaultAgents()
          }));
        }
      } catch {}
    };
    return () => ws.close();
  }, []);

  const getDefaultAgents = () => [
    { name: 'On-Chain Fetcher', capability: 'fetcher', publicKey: '0x1a2b3c...' },
    { name: 'Risk Analyst', capability: 'risk', publicKey: '0x4d5e6f...' },
    { name: 'Yield Optimizer', capability: 'yield', publicKey: '0x7g8h9i...' },
    { name: 'Report Generator', capability: 'report', publicKey: '0xj1k2l...' },
  ];

  const startPipeline = async () => {
    setLaunching(true);
    setState((s) => ({ ...s, logs: [], steps: [], results: {} }));
    setActiveTab('overview');
    try {
      await fetch('http://localhost:5001/api/start', { method: 'POST' });
    } catch {
      setLaunching(false);
    }
  };

  useEffect(() => {
    if (progress === 100) {
      setLaunching(false);
    }
  }, [progress]);

  const downloadReport = () => {
    if (!state.results?.report) return;
    const reportText = generateReportText();
    const blob = new Blob([reportText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `defi-report-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateReportText = () => {
    const lines = [
      '# Midnight DeFi Analytics Report',
      `**Generated:** ${new Date().toLocaleString()}`,
      '',
      '---',
      '',
      '## 📊 Executive Summary',
      '',
      state.results?.report?.split('**DeFi Analytics Report**')[1]?.split('Confidence:')[0]?.trim() || state.results?.report || 'No data',
      '',
      '---',
      '',
      '## ⛓ On-Chain Data',
      '',
      state.results?.fetcher?.split('**On-Chain Data Fetcher Response**')[1]?.split('Confidence:')[0]?.trim() || state.results?.fetcher || 'No data',
      '',
      '---',
      '',
      '## 🛡 Risk Analysis',
      '',
      state.results?.risk?.split('**Protocol Risk Profile Analysis**')[1]?.split('Confidence:')[0]?.trim() || state.results?.risk || 'No data',
      '',
      '---',
      '',
      '## 📈 Yield Strategy',
      '',
      state.results?.yield_opt?.split('**DeFi Yield Optimization Analysis**')[1]?.split('Confidence:')[0]?.trim() || state.results?.yield_opt || 'No data',
      '',
      '---',
      '',
      '## 🔐 Cryptographic Attestations',
      '',
      `All outputs signed with Ed25519:`,
      '',
      state.steps?.map((s, i) => `- Step ${i + 1}: ${s.outputHash?.substring(0, 16)}... (${s.attestation?.substring(0, 16)}...)`).join('\n') || 'No attestations',
      '',
      '---',
      '',
      '*Generated by Midnight DeFi Analytics Pipeline*',
    ];
    return lines.join('\n');
  };

  const mockPools = [
    { name: 'MIDNIGHT/USDC', tvl: '$42.5M', apy: '12.4%', vol24h: '$8.2M', risk: 'LOW' },
    { name: 'ETH/MIDNIGHT', tvl: '$18.2M', apy: '8.7%', vol24h: '$3.1M', risk: 'MEDIUM' },
    { name: 'BTC/MIDNIGHT', tvl: '$25.8M', apy: '6.2%', vol24h: '$5.4M', risk: 'LOW' },
    { name: 'USDT/MIDNIGHT', tvl: '$12.1M', apy: '15.8%', vol24h: '$2.8M', risk: 'HIGH' },
  ];

  const getAgentIcon = (cap: string) => {
    switch(cap) { case 'fetcher': return '⛓'; case 'risk': return '🛡'; case 'yield': return '📈'; case 'report': return '📋'; default: return '🤖'; }
  };

  const extractOutput = (text: string) => {
    if (!text) return '';
    const patterns = [
      /\*\*On-Chain Data Fetcher Response\*\*(.+?)(?=Confidence:|$)/s,
      /\*\*Protocol Risk Profile Analysis\*\*(.+?)(?=Confidence:|$)/s,
      /\*\*DeFi Yield Optimization Analysis\*\*(.+?)(?=Confidence:|$)/s,
      /\*\*DeFi Analytics Report\*\*(.+?)(?=Confidence:|$)/s,
    ];
    for (const p of patterns) {
      const m = text.match(p);
      if (m) return m[1].trim();
    }
    return text.split('Output:')[1]?.split('Confidence:')[0]?.trim() || text;
  };

  return (
    <div className="app">
      <canvas className="bg-canvas" id="particleCanvas"></canvas>
      
      <nav className="navbar">
        <div className="nav-brand">
          <div className="brand-icon">
            <svg viewBox="0 0 32 32" fill="none">
              <path d="M16 2L28 9v14l-12 7L4 23V9l12-7z" stroke="url(#grad)" strokeWidth="1.5"/>
              <path d="M16 8l8 4v8l-8 5-8-5v-8l8-4z" fill="url(#grad)" opacity="0.3"/>
              <circle cx="16" cy="16" r="3" fill="url(#grad)"/>
              <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#00f5ff"/><stop offset="100%" stopColor="#8b5cf6"/></linearGradient></defs>
            </svg>
          </div>
          <span className="brand-text">MIDNIGHT</span>
          <span className="brand-sub">DEFI ANALYTICS</span>
        </div>
        
        <div className="nav-center">
          <button className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Dashboard</button>
          <button className={`nav-link ${activeTab === 'pools' ? 'active' : ''}`} onClick={() => setActiveTab('pools')}>Pools</button>
          <button className={`nav-link ${activeTab === 'report' ? 'active' : ''}`} onClick={() => setActiveTab('report')}>Report</button>
        </div>

        <div className="nav-actions">
          <button className="btn-export" onClick={downloadReport} disabled={!state.results?.report}>
            📥 Export
          </button>
          <div className={`conn-badge ${connected ? 'connected' : ''}`}>
            <span className="conn-dot"></span>
            {connected ? 'Live' : 'Offline'}
          </div>
        </div>
      </nav>

      <main className="main">
        {activeTab === 'overview' && (
          <>
            <section className="hero">
              <div className="hero-content">
                <div className="hero-badge">
                  <span className="badge-pulse"></span>
                  Real-Time Analytics
                </div>
                <h1 className="hero-title">
                  <span className="title-line">Multi-Agent DeFi</span>
                  <span className="title-gradient">Intelligence Engine</span>
                </h1>
                <p className="hero-desc">
                  Get instant DeFi analytics with 4 specialized AI agents. 
                  On-chain data, risk analysis, yield optimization, and comprehensive reports.
                </p>
                <div className="hero-cta-wrapper">
                  <div className="hero-cta">
                    <button className={`btn-launch ${launching ? 'launching' : ''}`} onClick={startPipeline} disabled={!connected || launching}>
                      <span className="btn-text">{launching ? 'Analyzing...' : 'Analyze Now'}</span>
                    </button>
                    <div className="cta-progress-group">
                      <div className="cta-progress-track">
                        <div className="cta-progress-fill" style={{width: `${progress}%`}}></div>
                      </div>
                      <div className="cta-progress-details">
                        <span className="progress-percent">{progress}%</span>
                        <span className="progress-label">{launching ? 'Processing Protocol...' : 'Ready to Start'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hero-visual">
                <div className="orb-container">
                  <div className="orb orb-primary"></div>
                  <div className="orb orb-secondary"></div>
                  <div className="orb-glow"></div>
                </div>
                <div className="floating-cards">
                  <div className="float-card card-1"><span className="card-icon">📊</span><span className="card-value">$98.6M</span><span className="card-label">Total TVL</span></div>
                  <div className="float-card card-2"><span className="card-icon">⚡</span><span className="card-value">14.2%</span><span className="card-label">Best APY</span></div>
                  <div className="float-card card-3"><span className="card-icon">🎯</span><span className="card-value">{completedSteps}/4</span><span className="card-label">Analysis</span></div>
                </div>
              </div>
            </section>

            <section className="pipeline-hero">
              <div className="pipeline-progress-bar">
                <div className="progress-track">
                  <div className="progress-fill" style={{width: `${progress}%`}}></div>
                </div>
                <div className="pipeline-stages">
                  {[
                    { icon: '⛓', label: 'Fetch', key: 'fetcher' },
                    { icon: '🛡', label: 'Analyze', key: 'risk' },
                    { icon: '📈', label: 'Optimize', key: 'yield' },
                    { icon: '📋', label: 'Report', key: 'report' }
                  ].map((stage, i) => {
                    const isCompleted = i < completedSteps;
                    const isCurrent = state.steps?.[i]?.status === 'assigned';
                    return (
                      <div key={i} className={`stage-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'active' : ''}`}>
                        <div className="stage-icon-wrapper">
                          <div className="stage-icon">
                            {isCompleted ? '✓' : stage.icon}
                          </div>
                          {isCurrent && <div className="stage-pulse"></div>}
                        </div>
                        <span className="stage-label">{stage.label}</span>
                        {i < 3 && <div className={`stage-connector ${isCompleted ? 'filled' : ''}`}></div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="agents-section">
              <div className="section-header">
                <h2><span className="section-icon">◈</span> AI Agents</h2>
                <span className={`section-badge ${state.status === 'COMPLETED' ? 'complete' : state.status === 'RUNNING' ? 'running' : 'idle'}`}>
                  {state.status || 'READY'}
                </span>
              </div>
              <div className="agents-grid">
                {(state.agents && state.agents.length > 0 ? state.agents : getDefaultAgents()).map((agent, i) => {
                  const step = state.steps?.[i];
                  const status = step?.status || 'pending';
                  return (
                    <div key={i} className={`agent-card ${status}`}>
                      <div className="agent-glow"></div>
                      <div className="agent-header">
                        <div className={`agent-avatar ${status}`}>{getAgentIcon(agent.capability)}</div>
                        <div className={`status-indicator ${status}`}><span className="status-ring"></span></div>
                      </div>
                      <div className="agent-body">
                        <h3>{agent.name}</h3>
                        <span className="agent-role">{agent.capability.toUpperCase()}</span>
                        {step?.outputHash && (
                          <div className="agent-hash">✓ {step.outputHash.substring(0, 12)}...</div>
                        )}
                      </div>
                      <div className="agent-footer">
                        <span className={`status-tag ${status}`}>
                          {status === 'completed' ? '✓ Done' : status === 'assigned' ? '● Running' : '○ Ready'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {activeTab === 'pools' && (
          <section className="results-section">
            <div className="results-header">
              <h2>📈 Pool Analytics</h2>
              <button className="btn-refresh" onClick={startPipeline} disabled={launching}>🔄 Refresh</button>
            </div>
            <div className="pools-grid">
              {mockPools.map((pool, i) => (
                <div key={i} className="pool-card" style={{animationDelay: `${i * 0.1}s`}}>
                  <div className="pool-header">
                    <span className="pool-name">{pool.name}</span>
                    <span className={`risk-badge ${pool.risk.toLowerCase()}`}>{pool.risk}</span>
                  </div>
                  <div className="pool-metrics">
                    <div className="metric"><span className="metric-label">TVL</span><span className="metric-value">{pool.tvl}</span></div>
                    <div className="metric"><span className="metric-label">APY</span><span className="metric-value accent">{pool.apy}</span></div>
                    <div className="metric"><span className="metric-label">24h Vol</span><span className="metric-value">{pool.vol24h}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'report' && (
          <section className="results-section">
            <div className="results-header">
              <h2>📋 Analysis Report</h2>
              <div className="header-actions">
                <button className="btn-export-lg" onClick={downloadReport} disabled={!state.results?.report}>
                  📥 Download Report
                </button>
                <button className="btn-refresh" onClick={startPipeline} disabled={launching}>
                  🔄 Regenerate
                </button>
              </div>
            </div>

            {state.results?.fetcher && (
              <div className="report-section">
                <div className="section-header-flex">
                  <div className="section-title">⛓ On-Chain Data</div>
                  {state.steps?.[0]?.outputHash && (
                    <span className="attestation-tag">✓ {state.steps[0].outputHash.substring(0, 16)}...</span>
                  )}
                </div>
                <div className="section-output">{extractOutput(state.results.fetcher)}</div>
              </div>
            )}

            {state.results?.risk && (
              <div className="report-section">
                <div className="section-header-flex">
                  <div className="section-title">🛡 Risk Analysis</div>
                  {state.steps?.[1]?.outputHash && (
                    <span className="attestation-tag">✓ {state.steps[1].outputHash.substring(0, 16)}...</span>
                  )}
                </div>
                <div className="section-output">{extractOutput(state.results.risk)}</div>
              </div>
            )}

            {state.results?.yield_opt && (
              <div className="report-section">
                <div className="section-header-flex">
                  <div className="section-title">📈 Yield Strategy</div>
                  {state.steps?.[2]?.outputHash && (
                    <span className="attestation-tag">✓ {state.steps[2].outputHash.substring(0, 16)}...</span>
                  )}
                </div>
                <div className="section-output">{extractOutput(state.results.yield_opt)}</div>
              </div>
            )}

            {state.results?.report && (
              <div className="report-section final">
                <div className="section-header-flex">
                  <div className="section-title">📋 Executive Summary</div>
                  {state.steps?.[3]?.outputHash && (
                    <span className="attestation-tag">✓ {state.steps[3].outputHash.substring(0, 16)}...</span>
                  )}
                </div>
                <div className="section-output">{extractOutput(state.results.report)}</div>
              </div>
            )}

            {!state.results?.report && !launching && state.status !== 'RUNNING' && (
              <div className="report-empty">
                <span className="empty-icon">📊</span>
                <h3>No Analysis Yet</h3>
                <p>Click "Analyze Now" to generate your DeFi analytics report</p>
                <button className="btn-launch" onClick={startPipeline}>Start Analysis</button>
              </div>
            )}

            {launching && (
              <div className="analysis-progress">
                <div className="progress-steps">
                  {['Fetching Data', 'Analyzing Risk', 'Optimizing Yield', 'Generating Report'].map((label, i) => {
                    const stepStatus = state.steps?.[i]?.status || (i < completedSteps ? 'completed' : 'pending');
                    return (
                      <div key={i} className={`progress-step ${stepStatus}`}>
                        <div className="step-icon">{stepStatus === 'completed' ? '✓' : stepStatus === 'assigned' ? '●' : '○'}</div>
                        <div className="step-info">
                          <span className="step-name">{label}</span>
                          <span className="step-status">
                            {stepStatus === 'completed' ? 'Done' : 
                             stepStatus === 'assigned' ? 'Processing...' : 
                             state.status === 'STARTING' ? 'Provisioning...' : 'Waiting'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        )}

        <div className="dashboard-grid">
          <section className="panel pipeline-panel">
            <div className="panel-header">
              <h2>⚡ Pipeline</h2>
              <div className="progress-ring">
                <svg viewBox="0 0 36 36">
                  <path className="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                  <path className="ring-fill" strokeDasharray={`${progress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                </svg>
                <span className="ring-num">{completedSteps}/{totalSteps}</span>
              </div>
            </div>
            <div className="pipeline-flow">
              {['Fetch', 'Risk', 'Yield', 'Report'].map((label, i) => {
                const status = state.steps?.[i]?.status || 'pending';
                return (
                  <div key={i} className={`flow-step ${status}`}>
                    <div className="step-dot">{status === 'completed' ? '✓' : i + 1}</div>
                    <span className="step-label">{label}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="panel crypto-panel">
            <div className="panel-header">
              <h2>🔐 Security</h2>
              <span className="secure-badge">VERIFIED</span>
            </div>
            <div className="crypto-features">
              <div className="crypto-item"><span className="crypto-icon">🔑</span><div className="crypto-info"><span className="crypto-name">Ed25519</span><span className="crypto-status">Active</span></div><span className="crypto-check">✓</span></div>
              <div className="crypto-item"><span className="crypto-icon">🔗</span><div className="crypto-info"><span className="crypto-name">ECDH</span><span className="crypto-status">Enabled</span></div><span className="crypto-check">✓</span></div>
              <div className="crypto-item"><span className="crypto-icon">#️⃣</span><div className="crypto-info"><span className="crypto-name">SHA-256</span><span className="crypto-status">Verified</span></div><span className="crypto-check">✓</span></div>
              <div className="crypto-item"><span className="crypto-icon">⛓</span><div className="crypto-info"><span className="crypto-name">Midnight</span><span className="crypto-status">Synced</span></div><span className="crypto-check">✓</span></div>
            </div>
          </section>

          <section className="panel quick-stats">
            <div className="panel-header">
              <h2>📊 Quick Stats</h2>
            </div>
            <div className="stats-grid">
              <div className="stat-item"><span className="stat-icon">📈</span><div className="stat-content"><span className="stat-value">$98.6M</span><span className="stat-label">Total TVL</span></div></div>
              <div className="stat-item"><span className="stat-icon">🚀</span><div className="stat-content"><span className="stat-value">14.2%</span><span className="stat-label">Best APY</span></div></div>
              <div className="stat-item"><span className="stat-icon">🛡</span><div className="stat-content"><span className="stat-value">LOW</span><span className="stat-label">Avg Risk</span></div></div>
              <div className="stat-item"><span className="stat-icon">⛓</span><div className="stat-content"><span className="stat-value">4</span><span className="stat-label">Pools</span></div></div>
            </div>
          </section>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-left">
          <span className="footer-brand">Midnight DeFi Analytics</span>
          <span className="footer-version">v1.0.0</span>
        </div>
        <div className="footer-right">
          <span>Groq: {connected ? 'Ready' : 'Offline'}</span>
          <span className="footer-sep">•</span>
          <span>Midnight: Synced</span>
        </div>
      </footer>
    </div>
  );
}

export default App;