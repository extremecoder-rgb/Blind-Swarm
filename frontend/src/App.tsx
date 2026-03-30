import { useEffect, useState, useRef } from 'react';
import './index.css';

interface TaskStep {
  index: number;
  agentId: string | null;
  status: 'pending' | 'assigned' | 'completed';
  dependencies: number[];
  inputHash: string;
  outputHash: string | null;
  attestation: string | null;
}

interface DemoState {
  logs: string[];
  taskId?: string;
  status?: string;
  steps?: TaskStep[];
}

function App() {
  const [state, setState] = useState<DemoState>({ logs: [] });
  const [connected, setConnected] = useState(false);
  const logsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8081');
    
    ws.onopen = () => {
      setConnected(true);
      setState((s) => ({ ...s, logs: [...s.logs, 'Connected to WebSocket Server...'] }));
    };

    ws.onclose = () => {
      setConnected(false);
      setState((s) => ({ ...s, logs: [...s.logs, 'Disconnected from WebSocket Server.'] }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.message) {
          setState((s) => ({ ...s, logs: [...s.logs, data.message] }));
        } else {
          // It's a DemoState partial update
          setState((s) => ({ ...s, ...data, logs: data.logs ? data.logs : s.logs }));
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    return () => ws.close();
  }, []);

  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [state.logs]);

  const startDemo = async () => {
    setState((s) => ({ ...s, logs: [...s.logs, 'Starting Demo...'] }));
    try {
      const res = await fetch('http://localhost:8081/api/start', { method: 'POST' });
      const data = await res.json();
      setState((s) => ({ ...s, logs: [...s.logs, data.message] }));
    } catch (err) {
      setState((s) => ({ ...s, logs: [...s.logs, 'Error starting demo. Is the backend server running?'] }));
    }
  };

  return (
    <div className="container">
      <header className="header">
        <div className="status-indicator">
          <div className={`status-dot ${connected ? 'status-connected' : 'status-disconnected'}`}></div>
          <span className="status-text">{connected ? 'Connected' : 'Disconnected'}</span>
        </div>
        <h1>Luminance Studio</h1>
        <p className="subtitle">Microzone Intelligence Dashboard</p>
      </header>

      <main className="main-content">
        <section className="control-panel">
          <button className="btn-primary" onClick={startDemo} disabled={!connected || state.status === 'EXECUTING'}>
            {state.status === 'EXECUTING' ? 'Running Orchestration...' : 'Start Protocol Demo'}
          </button>
          
          {state.taskId && (
            <div className="task-info">
              <h3>Active Task</h3>
              <code>{state.taskId}</code>
              <p>Status: <span className="status-badge">{state.status}</span></p>
            </div>
          )}
        </section>

        <section className="visualizer">
          <div className="steps-container">
            <h2>DAG Execution Map</h2>
            <div className="steps-grid">
              {state.steps?.map((step) => (
                <div key={step.index} className={`step-card step-${step.status}`}>
                  <div className="step-header">
                    <h4>Step {step.index + 1}</h4>
                    <span className="step-status">{step.status.toUpperCase()}</span>
                  </div>
                  <div className="step-body">
                    {step.agentId ? <p className="agent-id">Agent: {step.agentId.slice(0, 8)}...</p> : <p className="agent-id">Unassigned</p>}
                  </div>
                </div>
              ))}
              {!state.steps && <p className="empty-state">No steps actively executing. Start the demo to visualize the orchestration graph.</p>}
            </div>
          </div>
        </section>

        <section className="terminal" aria-label="Terminal Logs">
          <div className="terminal-header">
            <span>Orchestration Logs</span>
          </div>
          <div className="terminal-body" ref={logsRef}>
            {state.logs.map((log, i) => (
              <div key={i} className="log-line">
                <span className="log-prefix">&gt;</span> <span className="log-text">{log}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
