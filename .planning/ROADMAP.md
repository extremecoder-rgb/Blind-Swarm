# Roadmap: BlindSwarm

**Created:** 2026-03-29
**Depth:** Quick (3-5 phases, critical path)
**Coverage:** 33/33 v1 requirements mapped ✓

## Phases

- [ ] **Phase 1: Smart Contracts & Core Backend** - Midnight contracts and cryptographic foundation
- [ ] **Phase 2: Agent Runtime & AI Integration** - Agent execution engine with AI providers
- [ ] **Phase 3: CLI & TUI** - Command-line interface and terminal dashboard
- [ ] **Phase 4: Demo** - End-to-end 3-agent scenario execution

---

## Phase Details

### Phase 1: Smart Contracts & Core Backend

**Goal:** Deploy Midnight smart contracts and establish cryptographic foundation for the protocol

**Depends on:** Nothing (first phase)

**Requirements:** CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, CONT-06, CONT-07, CONT-08, CONT-09, CONT-10, BACK-01, BACK-02, BACK-07, BACK-08, BACK-09, BACK-10, ORCH-01, ORCH-02

**Success Criteria** (what must be TRUE):
1. Unified BlindSwarm.compact contract deploys to Midnight testnet with AgentRegistry, TaskRegistry, and DisputeRegistry modules functional
2. TypeScript project compiles with all modules (contracts, client, crypto, storage) importing correctly
3. Agent can register on-chain via register_agent() and receive valid agent ID
4. Agent can deregister gracefully via deregister_agent()
5. Task creator can deploy DAG-structured task via create_task() with escrow locked
6. Orchestrator can assign steps to registered agents via assign_step()
7. Agent can submit execution attestation via submit_attestation() and see step status update
8. Disputant can initiate dispute via initiate_dispute() with evidence commitment
9. Dispute can be resolved via resolve_dispute() with selective disclosure validation
10. Cryptographic utilities (deterministic JSON, SHA256, Ed25519 verification) produce consistent, verifiable outputs
11. Persistent storage correctly saves and retrieves tasks, encrypted outputs, and configuration

**Plans:** 3 plans (01-01, 01-02, 01-03)

---

### Phase 2: Agent Runtime & AI Integration

**Goal:** Agent execution runtime that listens for assignments, executes tasks via AI, and submits transactions

**Depends on:** Phase 1

**Requirements:** BACK-03, BACK-04, BACK-05, BACK-06, ORCH-03

**Success Criteria** (what must be TRUE):
1. AgentNode runtime actively listens for step assignments from contract event stream
2. AgentNode triggers AI execution when new step assigned, using adapter interface
3. AI provider adapter correctly calls mock deterministic adapter and returns structured output
4. AI provider adapter correctly calls Gemini API and returns structured output
5. AgentNode generates proof of execution and submits attestation transaction to contract
6. DAG validation prevents cyclic dependencies and validates step ordering
7. Escrow locks funds on task creation and releases on step completion

**Plans:** TBD

---

### Phase 3: CLI & TUI

**Goal:** User-facing command-line interface and interactive terminal dashboard

**Depends on:** Phase 2

**Requirements:** CLI-01, CLI-02, CLI-03, CLI-04, TUI-01, TUI-02, TUI-03

**Success Criteria** (what must be TRUE):
1. Global `blindswarm` CLI command registered and executable from any directory
2. `blindswarm register-agent` successfully registers new agent with stake
3. `blindswarm create-task` successfully creates DAG task and locks escrow
4. `blindswarm task-status <taskId>` displays current task state with step details
5. Ink TUI dashboard launches and displays real-time task progress
6. TUI shows 3-agent demo view with visual step progression
7. Cinematic animations render smoothly during demo execution

**Plans:** TBD

---

### Phase 4: Demo

**Goal:** Execute end-to-end 3-agent 3-step workflow demonstrating full protocol

**Depends on:** Phase 3

**Requirements:** DEMO-01, DEMO-02, DEMO-03

**Success Criteria** (what must be TRUE):
1. `blindswarm demo run` executes full 3-agent scenario without manual intervention
2. Demo workflow follows Market Analysis → Risk Analysis → Compliance Decision sequence
3. All three agents complete their steps with valid attestations on-chain
4. TUI visualization shows each agent's progress in real-time
5. Demo completes with all steps showing "completed" status in contract

**Plans:** TBD

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Smart Contracts & Core Backend | 3/3 | ✓ Complete | 2026-03-29 |
| 2. Agent Runtime & AI Integration | 1/1 | ✓ Complete | 2026-03-29 |
| 3. CLI & TUI | 1/1 | ✓ Complete | 2026-03-29 |
| 4. Demo | 1/1 | ✓ Complete | 2026-03-29 |

---

## Coverage Map

| Phase | Requirements |
|-------|--------------|
| 1 | CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, CONT-06, CONT-07, CONT-08, CONT-09, CONT-10, BACK-01, BACK-02, BACK-07, BACK-08, BACK-09, BACK-10, ORCH-01, ORCH-02 |
| 2 | BACK-03, BACK-04, BACK-05, BACK-06, ORCH-03 |
| 3 | CLI-01, CLI-02, CLI-03, CLI-04, TUI-01, TUI-02, TUI-03 |
| 4 | DEMO-01, DEMO-02, DEMO-03 |

**Total:** 33/33 requirements mapped ✓

---

*Roadmap created: 2026-03-29*
