# Project Research Summary

**Project:** BlindSwarm
**Domain:** Privacy-Preserving Multi-Agent AI Orchestration (Midnight Network)
**Researched:** 2026-03-29
**Confidence:** MEDIUM-HIGH

## Executive Summary

BlindSwarm is a privacy-preserving multi-agent AI orchestration system built on Midnight Network that enables multiple AI agents to collaborate on tasks while maintaining cryptographic privacy. Unlike existing multi-agent frameworks (CrewAI, LangGraph), BlindSwarm uniquely combines blockchain-based accountability with ZK proofs and real ECDH encryption—no competitor offers this combination. The recommended approach uses Midnight.js v4.0.2 for blockchain interaction, TypeScript for type-safe development, and custom agent orchestration designed specifically for privacy requirements. Real ECDH encryption is mandatory (PROJECT.md requirement), not mocked.

The primary risk is orchestrator-induced data leakage (OMNI-LEAK), where the coordination layer inadvertently exposes private data between agents. Multi-agent systems fail 41-86% of the time in production due to error cascades, requiring explicit validation gates between agent handoffs. Privacy must be designed from Phase 1—deferring it creates false assurances that are hard to detect. The hackathon timeline (testnet only, no production) constrains scope but simplifies compliance.

## Key Findings

### Recommended Stack

Node.js LTS v20+ provides the required runtime with stable crypto APIs. Midnight.js v4.0.2 (March 2026) is the official TypeScript SDK for Midnight Network, handling smart contract interaction and ZK proof verification. Compact v1 serves as Midnight's ZK contract language with TypeScript-inspired syntax. Ink v6.0 builds the terminal UI using React component patterns. Gemini API (per PROJECT.md) provides AI capabilities for the demo.

**Core technologies:**
- **Node.js v20+** — Runtime with native crypto APIs for ECDH
- **TypeScript ^5.3** — Type-safe development, Midnight.js is TypeScript-first
- **Midnight.js ^4.0.2** — Blockchain SDK for contract interaction and ZK proofs
- **Compact v1** — Smart contract language for Midnight Network
- **Ink ^6.0** — React-based CLI framework for terminal UI
- **Node.js crypto (built-in)** — Real ECDH key exchange, not mocked per requirements
- **classic-level ^3.0.0** — Encrypted persistent storage via Midnight.js provider
- **Custom orchestration** — Best fit for BlindSwarm's specific privacy requirements

### Expected Features

**Must have (table stakes):**
- **Multi-Agent Orchestration** — Core requirement; hierarchical/peer-to-peer coordination patterns
- **Task/Workflow Definition** — Sequential and parallel task execution
- **Agent Registration & Identity** — Registry pattern on Midnight blockchain
- **Agent Runtime** — Listen, execute, prove, submit cycle
- **Real ECDH Encryption** — Mandatory (PROJECT.md explicitly rejects mocks)
- **Tool/Function Calling** — MCP emerging as standard
- **Context Sharing** — Critical for multi-agent workflows; needs encryption

**Should have (competitive differentiators):**
- **ZK Proof-Based Privacy** — Verify correctness without revealing data (Midnight's core capability)
- **Selective Disclosure** — Agents share only required data; Midnight's flagship feature
- **Blockchain Accountability** — On-chain attestations for workflow integrity
- **Encrypted Context Channels** — Agent-to-agent encrypted communication

**Defer (v2+):**
- Multi-chain integration
- Agent marketplace
- Reputation system
- Dispute resolution
- Production beyond testnet (explicitly out of scope per PROJECT.md)

### Architecture Approach

The system follows a five-layer architecture: External (AI providers, Midnight Network), Orchestration (planning, execution, state, quality), Agent (worker, service, support), Privacy (ZK proofs, selective disclosure, encryption), and Blockchain (task/agent registries). This separation isolates cryptographic complexity from business logic and enables independent scaling.

**Major components:**
1. **Orchestrator** — Task decomposition, agent coordination, workflow state management
2. **Worker Agents** — Domain-specific task execution with ZK proof generation
3. **Privacy Layer** — ECDH key exchange, ZK proof verification, selective disclosure enforcement
4. **Midnight Contracts** — TaskRegistry, AgentRegistry for on-chain state and attestations
5. **TUI Dashboard** — Ink-based CLI for monitoring and interaction

### Critical Pitfalls

1. **OMNI-LEAK (Orchestrator Data Leakage)** — Central orchestrator becomes information leakage point. Avoid with end-to-end encryption where agents encrypt directly to each other, not through orchestrator.

2. **ZK Proof Soundness Vulnerabilities** — Library trust without audit allows forged proofs. Use audited libraries, implement verification redundancy, leverage Midnight's built-in verification.

3. **Multi-Agent Error Cascade (17x Error Trap)** — Errors propagate between agents causing multiplicative failures (41-86% failure rate in production). Implement validation gates between handoffs, circuit breakers, idempotent retry logic.

4. **ECDH Implementation Flaws** — Subtle requirements around curve parameters, validation, forward secrecy. Use established libraries (Node.js crypto), validate all incoming public keys, implement ephemeral key rotation.

5. **Selective Disclosure Privacy Leaks** — Timing, access patterns, metadata reveal sensitive information. Use commitment schemes, uniform disclosure timing, batch disclosures to obscure patterns.

## Implications for Roadmap

Based on research, the following phase structure emerges from dependencies and pitfall prevention:

### Phase 1: Foundation & Contract Design
**Rationale:** Privacy properties must be defined formally before implementation—deferring creates "works but leaks" patterns. Midnight contracts establish the blockchain foundation everything else depends on.

**Delivers:**
- Midnight smart contracts (TaskRegistry, AgentRegistry)
- ECDH key exchange utilities with proper validation
- Privacy threat model and formal property definitions
- Project structure setup

**Addresses:** Agent registration, real ECDH encryption (from FEATURES.md P1)

**Avoids:** OMNI-LEAK (E2E encryption design), ZK soundness (audit-ready design), premature optimization (privacy-first)

**Research Flags:** Midnight contract patterns—use official docs; well-documented, standard patterns apply.

### Phase 2: Agent Runtime & Orchestration
**Rationale:** Core execution engine must be solid before privacy layer integration. Agent runtime is complex; research shows 41-86% failure rates without proper error handling.

**Delivers:**
- Agent execution runtime (listen, execute, prove, submit cycle)
- Task orchestration and workflow execution
- Encrypted communication channels between agents
- Error handling with circuit breakers and validation gates

**Addresses:** Multi-agent orchestration, task definition, tool integration, context sharing (FEATURES.md P1)

**Avoids:** Error cascade (validation gates, circuit breakers), ECDH flaws (established crypto libs, test vector verification)

**Research Flags:** Agent runtime patterns—well-documented via CrewAI/LangGraph research; standard orchestration patterns apply.

### Phase 3: Privacy Layer Integration
**Rationale:** After runtime works, integrate privacy enforcement. Privacy should be tested with attack vectors, not just claimed secure.

**Delivers:**
- ZK proof generation and verification
- Selective disclosure layer with credential management
- Privacy enforcer component

**Addresses:** ZK proof privacy, selective disclosure, blockchain attestations (FEATURES.md P1/P2)

**Avoids:** Selective disclosure leaks (commitment schemes, timing uniformity)

**Research Flags:** ZK integration—complex, needs validation during implementation; Midnight's ZK APIs require careful integration research.

### Phase 4: Demo & CLI/TUI
**Rationale:** User-facing components after core logic is functional. PROJECT.md requires CLI entry point and 3-agent, 3-step demo.

**Delivers:**
- CLI entry point (`blindswarm` commands)
- Ink-based TUI dashboard for monitoring
- 3-agent, 3-step demo workflow

**Addresses:** CLI entry point, TUI dashboard (FEATURES.md P2)

**Research Flags:** Ink—well-documented, standard React patterns; skip deep research.

### Phase 5: Enhancements (Post-Hackathon)
**Rationale:** Features that add value but aren't required for demo validation.

**Delivers:**
- Escrow contracts for task payment
- Monitoring and tracing enhancements
- AI provider adapters beyond Gemini

**Addresses:** Escrow/financial, monitoring/tracing (FEATURES.md P2)

### Phase Ordering Rationale

- **Privacy first:** Defined in Phase 1 to avoid "works but leaks" anti-pattern
- **Foundation before integration:** Contracts must exist before agents can use them
- **Runtime before UI:** Core logic must work before adding presentation layer
- **Error handling baked in:** Phase 2 includes circuit breakers from pitfall research
- **Demo last:** All functional pieces in place before demo scenario implementation

### Research Flags

Phases needing deeper research during planning:
- **Phase 1:** Midnight contract deployment workflow—needs official docs validation
- **Phase 3:** ZK proof integration with Midnight.js—complex API, may need /gsd-research-phase

Phases with standard patterns (skip research):
- **Phase 2:** Agent orchestration—well-documented patterns from CrewAI/LangGraph
- **Phase 4:** Ink TUI—standard React patterns, well-documented

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Midnight.js v4.0.2 official docs, Node.js crypto well-established |
| Features | HIGH | Research from multiple sources (CrewAI, LangGraph, Opaque, Midnight docs) |
| Architecture | HIGH | Academic sources on multi-agent orchestration, zkAgent, DAO-Agent |
| Pitfalls | MEDIUM | Some pitfalls from recent research (2025-2026), some edge cases may emerge |

**Overall confidence:** MEDIUM-HIGH

Primary uncertainty: Midnight.js v4.0.2 ZK integration details—complex APIs may require iteration. Error cascade statistics from 2025 research may evolve as systems mature.

### Gaps to Address

- **ZK circuit design:** Not deeply researched—assumes Midnight provides verification; custom circuits may need security audit
- **Gemini API integration:** Per PROJECT.md but prompt engineering for multi-agent not validated
- **Testnet economics:** Escrow value calculations not researched; may need adjustment during planning
- **Agent identity verification:** Cryptographic proof of agent identity needs implementation detail

## Sources

### Primary (HIGH confidence)
- Midnight.js API Reference v4.0.2 — https://docs.midnight.network/api-reference/midnight-js
- Midnight SDKs Overview — https://docs.midnight.network/sdks
- Ink Documentation — https://github.com/vadimdemedes/ink
- Node.js Crypto — https://nodejs.org/api/crypto.html

### Secondary (HIGH confidence)
- CrewAI Platform — https://www.crewai.com/ — Agent orchestration patterns
- Opaque: Confidential AI for Multi-Agent Workflows — https://www.opaque.co/ — Privacy in multi-agent systems
- Promethium: Multi-Agent AI Platform Comparison 2026 — https://promethium.ai/guides/multi-agent-ai-platform-comparison-2026/

### Tertiary (MEDIUM confidence)
- The Orchestration of Multi-Agent Systems: Architectures, Protocols, and Enterprise Adoption (ArXiv 2601.13671) — Academic architecture patterns
- Why Do Multi-Agent LLM Systems Fail? (Berkeley ARXIV, 2025) — 41-86% failure rate statistics
- zkAgent: Verifiable Agent Execution via One-Shot Complete LLM Inference Proof (IACR 2026) — ZK + agent integration

---

*Research completed: 2026-03-29*
*Ready for roadmap: yes*
