# Feature Research

**Domain:** Privacy-Preserving Multi-Agent AI Orchestration
**Researched:** 2026-03-29
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Multi-Agent Orchestration** | Core requirement - multiple agents must coordinate | HIGH | CrewAI, LangGraph, AutoGen all provide hierarchical/peer-to-peer patterns. Required for any multi-agent system. |
| **Task/Workflow Definition** | Users need to define multi-step tasks | MEDIUM | Sequential and parallel task execution. CrewAI's "crew" concept is industry standard. |
| **Agent Registration & Identity** | Agents must be identifiable and trackable | MEDIUM | Registry pattern - Databricks Unity Catalog, AgentRegistry contracts |
| **Tool/Function Calling** | Agents need to execute external actions | MEDIUM | MCP (Model Context Protocol) emerging as standard. LangChain/CrewAI have extensive tool support. |
| **Context Sharing** | Agents must share state/outputs | HIGH | Context window management critical - Google's ADK explicitly separates Session from Working Context |
| **Role-Based Assignment** | Different agents for different subtasks | LOW | CrewAI native feature - agents with defined roles delegate work |
| **Monitoring & Tracing** | Debug agent execution flows | MEDIUM | LangGraph, CrewAI AMP provide detailed tracing. Essential for production. |
| **Access Control** | Prevent unauthorized actions | MEDIUM | Role-based access control expected in enterprise. Databricks Unity Catalog reference. |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable. **Privacy-preservation is BlindSwarm's core differentiator.**

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **ZK Proof-Based Privacy** | Verify correctness without revealing data | VERY HIGH | Midnight Network core capability - enables "confidential AI" per Opaque Systems research |
| **Selective Disclosure** | Agents share only required data | HIGH | Midnight's flagship feature - proves compliance without exposing records |
| **Blockchain Accountability** | On-chain attestations for workflow integrity | HIGH | Immutable audit trails. Midnight's ZK execution attestations |
| **Escrow & Financial Trust** | Value exchange without intermediaries | MEDIUM | Task payment held in escrow until completion verified |
| **Real ECDH Encryption** | Actual privacy, not mocks | HIGH | Required for winning prototypes. PROJECT.md explicitly requires real ECDH |
| **Decentralized Governance** | No single point of control/failure | HIGH | Midnight's distributed consensus provides this |
| **Cross-Agent Key Exchange** | Agents establish private channels | HIGH | Each agent pair can have unique encryption keys |
| **Workflow Integrity Verification** | Prove tasks executed correctly | HIGH | ZK proofs verify off-chain execution on-chain |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems or are explicitly out of scope per PROJECT.md.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Real-Time Chat Between Agents** | Intuitive collaboration model | Task-based orchestration doesn't need chat. Adds latency/complexity. | Task handoff patterns (CrewAI model) |
| **Web/Graphical Frontend** | Easier UX | Out of scope per PROJECT.md. Terminal-based only. | Ink-based TUI (React for CLI) |
| **Production Beyond Testnet** | Real value creation | PROJECT.md explicitly out of scope. Hackathon timeline. | Testnet only for v1 |
| **Mock Encryption** | Simpler development | PROJECT.md explicitly rejects. "Real ECDH encryption, not mock" is key decision. | Real ECDH from day one |
| **Universal LLM Support** | Flexibility | Adds complexity without value for demo. Gemini API selected. | Mock deterministic + Gemini only |
| **Data Consolidation** | Simpler queries | Opposite of privacy-preserving. Midnight enables zero-copy federation. | Distributed data access |

## Feature Dependencies

```
[ZK Proof Engine]
    └──requires──> [Selective Disclosure Layer]
                        └──requires──> [Agent Registry]

[ECDH Key Exchange]
    └──requires──> [Encrypted Context Channels]

[Task Definition]
    └──requires──> [Orchestrator]
            └──requires──> [Agent Runtime]

[Escrow Contract]
    └──requires──> [Task Verification]
            └──requires──> [ZK Attestation]

[Monitoring] ──enhances──> [Debugging]
[Tracing] ──enhances──> [Monitoring]
```

### Dependency Notes

- **ZK Proof Engine requires Selective Disclosure Layer:** Privacy-preserving verification depends on controlling what data is revealed
- **Selective Disclosure requires Agent Registry:** Agents must be registered to receive selective disclosures
- **ECDH Key Exchange requires Encrypted Context Channels:** Keys enable encrypted peer-to-peer communication
- **Task Definition requires Orchestrator:** Workflows need execution engine
- **Orchestrator requires Agent Runtime:** Agents must be able to run, listen, execute, prove, submit
- **Escrow requires Task Verification:** Payment release needs proof of completion
- **Task Verification requires ZK Attestation:** Midnight's ZK proofs verify off-chain execution

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [ ] **Agent Registration** — Register agents with identity on Midnight
- [ ] **Task Definition & Orchestration** — Multi-step task definition and execution
- [ ] **ECDH Key Exchange** — Real encryption between agents (not mocked)
- [ ] **Agent Runtime** — Listen, execute, prove, submit cycle
- [ ] **Demo Scenario** — 3-agent, 3-step workflow (PROJECT.md requirement)
- [ ] **CLI Entry Point** — blindswarm commands

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] **Selective Disclosure** — Fine-grained data sharing controls
- [ ] **Escrow Contracts** — Task payment with verification
- [ ] **ZK Attestations** — On-chain proof of correct execution
- [ ] **TUI Dashboard** — Ink-based interactive monitoring
- [ ] **AI Provider Adapters** — Beyond Gemini (OpenAI, Anthropic)

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] **Multi-Chain Integration** — Bridge to other networks
- [ ] **Agent Marketplace** — Discover and hire specialized agents
- [ ] **Reputation System** — Agent trust scores
- [ ] **Dispute Resolution** — On-chain arbitration

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Multi-Agent Orchestration | HIGH | HIGH | P1 |
| Task Definition | HIGH | MEDIUM | P1 |
| Agent Registry | HIGH | MEDIUM | P1 |
| Agent Runtime | HIGH | HIGH | P1 |
| Real ECDH Encryption | HIGH | HIGH | P1 |
| Tool Integration | HIGH | MEDIUM | P1 |
| Context Sharing | HIGH | HIGH | P1 |
| Monitoring/Tracing | MEDIUM | MEDIUM | P2 |
| ZK Proof Privacy | HIGH | VERY HIGH | P1 |
| Selective Disclosure | HIGH | HIGH | P2 |
| Escrow/Financial | MEDIUM | MEDIUM | P2 |
| Blockchain Attestations | HIGH | HIGH | P2 |
| TUI Dashboard | MEDIUM | MEDIUM | P2 |
| Access Control | MEDIUM | MEDIUM | P2 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | CrewAI | LangGraph | Opaque | BlindSwarm (Our Approach) |
|---------|--------|-----------|--------|--------------------------|
| Multi-agent orchestration | YES | YES | YES | YES |
| Privacy/ZK proofs | NO | NO | YES (confidential computing) | YES (Midnight ZK) |
| Blockchain-based | NO | NO | NO | YES (Midnight) |
| Selective disclosure | NO | NO | YES | YES |
| ECDH encryption | NO | NO | NO | YES |
| On-chain attestations | NO | NO | NO | YES |
| Escrow | NO | NO | NO | YES |
| Real (not mock) privacy | NO | NO | YES | YES |

### Key Insights

- **No competitor combines all features.** Opaque has privacy + confidential computing but no blockchain. CrewAI/LangGraph have orchestration but no privacy. BlindSwarm is unique: blockchain + ZK + orchestration.
- **Privacy is the gap.** None of the major orchestration frameworks (CrewAI, LangGraph, AutoGen) have built-in privacy. This is BlindSwarm's primary differentiation.
- **Blockchain is underexplored.** Privacy-preserving multi-agent systems use confidential computing (Opaque) but not blockchain-based verification. Midnight provides both.

## Sources

- [Promethium: Multi-Agent AI Platform Comparison 2026](https://promethium.ai/guides/multi-agent-ai-platform-comparison-2026/) — HIGH confidence
- [Opaque: Confidential AI for Multi-Agent Workflows](https://www.opaque.co/resources/articles/expanding-the-possibilities-of-confidential-ai-introducing-compound-ai-for-agents) — HIGH confidence
- [CrewAI Platform](https://www.crewai.com/) — HIGH confidence
- [Midnight Documentation](https://docs.midnight.network/) — HIGH confidence
- [Research: AgentCrypt - Privacy in AI Agent Collaboration](https://arxiv.org/pdf/2512.08104) — MEDIUM confidence
- [Axelar: AgentFlux Privacy-Preserving AI](https://www.axelar.network/blog/agentflux-launch) — MEDIUM confidence

---
*Feature research for: Privacy-Preserving Multi-Agent AI Orchestration*
*Researched: 2026-03-29*
