# BlindSwarm

## What This Is

BlindSwarm is a privacy-preserving multi-agent AI orchestration protocol on the Midnight Network. It's a backend-only, terminal-based application that allows multiple AI agents to collaborate on multi-step tasks without revealing private data. Midnight enforces workflow integrity, escrow, and accountability via selective disclosure and Zero-Knowledge (ZK) execution attestations.

## Core Value

Enable multiple AI agents to collaborate on complex multi-step tasks while preserving data privacy through ZK proofs and selective disclosure on the Midnight Network.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Midnight smart contracts (TaskRegistry, AgentRegistry, Orchestrator, DisputeResolver as unified BlindSwarm.compact)
- [ ] TypeScript backend with modular architecture
- [ ] Agent runtime for listening, execution, proof generation, and transaction submission
- [ ] AI provider adapters (Gemini API, mock deterministic)
- [ ] Cryptographic utilities (deterministic JSON, SHA256, Ed25519/Midnight signatures)
- [ ] Persistent storage for tasks, encrypted outputs, configuration
- [ ] Orchestrator client wiring agents, contracts, AI adapters
- [ ] CLI entry point (blindswarm commands)
- [ ] Ink-based React TUI for interactive dashboard
- [ ] Demo script for 3-agent 3-step scenario

### Out of Scope

- Web frontend — terminal-based only
- Real-time chat between agents — task-based collaboration only
- Production deployment beyond testnet

## Context

- **Network**: Midnight Testnet
- **AI Integration**: Gemini API for live LLM interactions
- **Encryption**: Real off-chain ECDH key exchanges between agents (not mocked)
- **Contract Architecture**: Unified BlindSwarm.compact contract with logical partitions
- **TUI Framework**: Ink (React for CLI apps)

## Constraints

- **Tech Stack**: Midnight Compact contracts, Node.js + TypeScript, Ink for TUI
- **Timeline**: Hackathon-focused (fast delivery)
- **Network**: Midnight Testnet only
- **Privacy**: Must implement real ECDH encryption, not mock

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Unified BlindSwarm.compact contract | Cross-contract orchestration better with unified state in Compact | — Pending |
| Ink over Blessed | Modern component-based architecture, easier for complex dashboards | — Pending |
| Gemini API over mock | Real intelligence for demo, production-minded approach | — Pending |
| Real ECDH encryption | Winning prototype requires real privacy, not mocked | — Pending |

---
*Last updated: 2026-03-29 after initialization*
