# Requirements: BlindSwarm

**Defined:** 2026-03-29
**Core Value:** Enable multiple AI agents to collaborate on complex multi-step tasks while preserving data privacy through ZK proofs and selective disclosure on the Midnight Network.

## v1 Requirements

### Smart Contracts

- [ ] **CONT-01**: Unified BlindSwarm.compact contract with AgentRegistry module (agent ID, owner, capabilities, stake, reputation)
- [ ] **CONT-02**: Unified BlindSwarm.compact contract with TaskRegistry module (task DAG, statuses, escrow, step details)
- [ ] **CONT-03**: Unified BlindSwarm.compact contract with DisputeRegistry module (active disputes, evidence commitments, resolution state)
- [ ] **CONT-04**: register_agent() circuit - validates agent registration with stake
- [ ] **CONT-05**: deregister_agent() circuit - handles graceful agent removal
- [ ] **CONT-06**: create_task() circuit - validates DAG structure and locks escrow
- [ ] **CONT-07**: assign_step() circuit - assigns task steps to agents
- [ ] **CONT-08**: submit_attestation() circuit - validates private execution signatures and updates step status
- [ ] **CONT-09**: initiate_dispute() circuit - creates dispute with evidence commitment
- [ ] **CONT-10**: resolve_dispute() circuit - handles selective disclosure validation

### Backend Architecture

- [ ] **BACK-01**: TypeScript Node.js project with modular structure
- [ ] **BACK-02**: Midnight.js client integration for contract deployment and state watching
- [ ] **BACK-03**: AgentNode runtime - listens for step assignments, triggers execution, generates proofs
- [ ] **BACK-04**: AgentNode runtime - submits transactions to contract
- [ ] **BACK-05**: AI provider adapter interface with mock deterministic adapter
- [ ] **BACK-06**: AI provider adapter - Gemini API integration
- [ ] **BACK-07**: Cryptographic utilities - deterministic JSON serialization
- [ ] **BACK-08**: Cryptographic utilities - SHA256 hashing
- [ ] **BACK-09**: Cryptographic utilities - Ed25519/Midnight wallet signature verification
- [ ] **BACK-10**: Persistent storage for tasks, encrypted outputs, configuration

### Orchestration

- [ ] **ORCH-01**: Orchestrator client wiring agents, contracts, and AI adapters
- [ ] **ORCH-02**: DAG validation for task creation (cycle detection, step dependency)
- [ ] **ORCH-03**: Escrow management - lock funds on task creation, release on completion

### CLI & TUI

- [ ] **CLI-01**: Global CLI entry point (blindswarm commands using Commander.js)
- [ ] **CLI-02**: Command: Register agent
- [ ] **CLI-03**: Command: Create task
- [ ] **CLI-04**: Command: View task status
- [ ] **TUI-01**: Ink-based React TUI for interactive dashboard
- [ ] **TUI-02**: Real-time task progress visualization
- [ ] **TUI-03**: 3-agent demo view with cinematic animations

### Demo

- [ ] **DEMO-01**: Scripted 3-agent 3-step scenario execution
- [ ] **DEMO-02**: Market Analysis -> Risk Analysis -> Compliance Decision workflow
- [ ] **DEMO-03**: Demo run command with full TUI visualization

## v2 Requirements

### Privacy Layer

- **PRIV-01**: ZK proof generation for execution attestations
- **PRIV-02**: Selective disclosure implementation
- **PRIV-03**: E2E encryption between agents (ECDH key exchange)
- **PRIV-04**: Commitment schemes to prevent timing/access pattern leaks

### Advanced Features

- **ADV-01**: Real-time agent-to-agent communication (A2A protocol)
- **ADV-02**: Agent tool integration (MCP protocol)
- **ADV-03**: Monitoring and logging dashboard
- **ADV-04**: Advanced dispute resolution workflows

## Out of Scope

| Feature | Reason |
|---------|--------|
| Web frontend | Terminal-based only per requirements |
| Real-time chat between agents | Task-based collaboration only |
| Production deployment beyond testnet | Hackathon focus, testnet only |
| OAuth login | Email/password sufficient for demo |
| Mobile app | Web-first, desktop CLI focus |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CONT-01 | Phase 1 | Pending |
| CONT-02 | Phase 1 | Pending |
| CONT-03 | Phase 1 | Pending |
| CONT-04 | Phase 1 | Pending |
| CONT-05 | Phase 1 | Pending |
| CONT-06 | Phase 1 | Pending |
| CONT-07 | Phase 1 | Pending |
| CONT-08 | Phase 1 | Pending |
| CONT-09 | Phase 1 | Pending |
| CONT-10 | Phase 1 | Pending |
| BACK-01 | Phase 1 | Pending |
| BACK-02 | Phase 1 | Pending |
| BACK-03 | Phase 1 | Pending |
| BACK-04 | Phase 1 | Pending |
| BACK-05 | Phase 2 | Pending |
| BACK-06 | Phase 2 | Pending |
| BACK-07 | Phase 1 | Pending |
| BACK-08 | Phase 1 | Pending |
| BACK-09 | Phase 1 | Pending |
| BACK-10 | Phase 1 | Pending |
| ORCH-01 | Phase 1 | Pending |
| ORCH-02 | Phase 1 | Pending |
| ORCH-03 | Phase 1 | Pending |
| CLI-01 | Phase 2 | Pending |
| CLI-02 | Phase 2 | Pending |
| CLI-03 | Phase 2 | Pending |
| CLI-04 | Phase 2 | Pending |
| TUI-01 | Phase 2 | Pending |
| TUI-02 | Phase 2 | Pending |
| TUI-03 | Phase 2 | Pending |
| DEMO-01 | Phase 2 | Pending |
| DEMO-02 | Phase 2 | Pending |
| DEMO-03 | Phase 2 | Pending |

**Coverage:**
- v1 requirements: 33 total
- Mapped to phases: 33
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-29*
*Last updated: 2026-03-29 after initial definition*
