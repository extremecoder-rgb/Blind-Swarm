# Pitfalls Research

**Domain:** Privacy-Preserving Multi-Agent AI Orchestration (Midnight Network)
**Researched:** 2026-03-29
**Confidence:** MEDIUM

## Critical Pitfalls

### Pitfall 1: Orchestrator-Induced Data Leakage (OMNI-LEAK)

**What goes wrong:**
The central orchestrator becomes a data leakage point. Research shows "Orchestrator Multi-Agent Network Induced Data Leakage" is a documented vulnerability where the coordination layer inadvertently exposes private data meant to remain hidden between agents.

**Why it happens:**
Developers assume the orchestrator only routes messages but doesn't inspect or log them. In privacy-preserving systems, the orchestrator often has privileged access to manage agent state, creating an information asymmetry that attackers exploit.

**How to avoid:**
- Implement end-to-end encryption where agents encrypt messages directly to each other, not through orchestrator
- Use threshold encryption so orchestrator cannot decrypt individual messages
- Audit all orchestrator logging to ensure no sensitive data is persisted
- Design so orchestrator only sees encrypted commitments, not plaintext

**Warning signs:**
- Agents send all messages through central orchestrator without encryption
- Orchestrator has access to raw agent inputs/outputs in logs
- No mechanism for agents to verify other agents' identities independently

**Phase to address:** Phase 1-2 (Contract Design + Agent Runtime)

---

### Pitfall 2: ZK Proof Soundness Vulnerabilities

**What goes wrong:**
Critical vulnerabilities in ZK proof implementations allow forging proofs. The Solana ZK ElGamal bug (June 2025) allowed malicious provers to forge sigma OR proofs. Similar issues affect other ZK systems.

**Why it happens:**
ZK proof libraries have complex constraints. Developers trust library implementations without auditing for soundness bugs. The "ZK whitespace" — where proofs appear valid but allow false statements — is invisible during normal testing.

**How to avoid:**
- Use audited ZK libraries with active security communities
- Implement proof verification redundancy (verify with multiple implementations)
- Add soundness checks: test that invalid statements are rejected
- For Midnight: leverage Midnight's built-in ZK verification rather than rolling own
- Include cryptographic agility — ability to swap proof systems if vulnerabilities found

**Warning signs:**
- Using experimental ZK libraries without security audits
- No test cases attempting to forge invalid proofs
- Single implementation without independent verification

**Phase to address:** Phase 1-2 (Contract Design + Cryptographic Utilities)

---

### Pitfall 3: Multi-Agent Error Cascade (17x Error Trap)

**What goes wrong:**
Research shows multi-agent LLM systems fail 41-86% of the time in production. Errors propagate between agents causing multiplicative failure modes — one agent's error corrupts downstream agents, creating cascading failures.

**Why it happens:**
Agents lack proper error boundaries. A failure in agent A passes corrupted output to agent B, which compounds the error. Without isolation and validation gates, errors propagate unchecked through the workflow.

**How to avoid:**
- Implement explicit validation gates between agent handoffs
- Each agent should validate inputs before processing (not assume correct)
- Add timeout and retry limits per agent
- Build "circuit breakers" that halt workflow on repeated failures
- Design with agent idempotency — same input should produce same output on retry
- Log all agent states for debugging cascades after they occur

**Warning signs:**
- No input validation between agent handoffs
- Single point of failure if any agent crashes
- No retry/backoff logic for transient failures

**Phase to address:** Phase 2-3 (Agent Runtime + Orchestrator Client)

---

### Pitfall 4: ECDH Key Exchange Implementation Flaws

**What goes wrong:**
Cryptographic mistakes in ECDH implementation (non-contributory keys, weak curve selection, improper nonce handling) allow attackers to recover shared secrets or impersonate agents. The Signal "Signalgate" and Matrix cryptography vulnerabilities stem from human implementation errors.

**Why it happens:**
ECDH appears simple (just point multiplication) but has subtle requirements. Developers use textbook implementations without understanding curve parameters, validation requirements, or forward secrecy implications.

**How to avoid:**
- Use established crypto libraries (libsodium, TweetNaCl, or Node.js native crypto with proper validation)
- Validate all public keys received before computation (reject points on wrong curves, ensure proper format)
- Implement forward secrecy with ephemeral keys (each session gets new key pair)
- For multi-party: use authenticating key exchange protocols, not raw ECDH
- Test key exchange with known vectors to verify implementation correctness

**Warning signs:**
- Raw ECDH without any validation on incoming public keys
- No forward secrecy (static key pairs reused across sessions)
- Custom "optimized" crypto implementations

**Phase to address:** Phase 2 (Cryptographic Utilities)

---

### Pitfall 5: Selective Disclosure Privacy Leaks

**What goes wrong:**
Selective disclosure claims privacy but leaks information through timing, access patterns, or metadata. An attacker observing which data is disclosed and when can infer sensitive information about the underlying private data.

**Why it happens:**
Developers focus on content privacy (the actual data) but ignore channel privacy (who accessed what, when). Blockchain's public nature makes timing attacks especially dangerous.

**How to avoid:**
- Use commitment schemes (hash first, reveal later) to prevent timing correlation
- Implement uniform disclosure timing (all-or-nothing with fixed delays)
- Consider zero-knowledge set membership for private subset queries
- Add decoy queries or batch disclosures to obscure access patterns
- Document exactly what metadata is visible on-chain and communicate to users

**Warning signs:**
- Direct on-chain disclosure of private data after ZK proof verification
- No commitment phase before reveal
- Unique transaction patterns that correlate to specific private data

**Phase to address:** Phase 1-2 (Contract Design + Cryptographic Utilities)

---

### Pitfall 6: Premature Protocol Optimization

**What goes wrong:**
Projects optimize for throughput before establishing correct privacy guarantees. The "works but leaks" pattern — where the system functions but provides false privacy assurances.

**Why it happens:**
Hackathon pressure pushes for demo-able results. Privacy is hard to verify (you can't prove a negative) so developers defer it in favor of visible features.

**How to avoid:**
- Define privacy properties formally before implementation
- Create test cases that attempt to violate privacy (red team approach)
- Prioritize correctness of encryption/zk over performance
- Document exactly what threat model the privacy guarantees

**Warning signs:**
- "Good enough" encryption without formal verification
- Privacy as an afterthought, added after core functionality
- No formal privacy threat model defined

**Phase to address:** Phase 1 (Contract Design)

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Mock ECDH for demo | Faster initial demo | Must rewrite entire crypto layer | Never — real privacy requires real crypto |
| Skip ZK circuit audits | Faster development | Critical vulnerabilities in production | Only for testnet, must audit before mainnet |
| Log agent outputs for debugging | Easier debugging | Privacy violation if logs leak | Only with encryption at rest, never in production |
| Single agent retry logic | Simpler code | Cascading failures across agents | Never — requires circuit breaker pattern |
| Centralized key distribution | Simpler key management | Single point of compromise, breaks privacy | Never for privacy-preserving system |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Midnight Contracts | Treating contract state as private | Use off-chain encryption, only commitments on-chain |
| Gemini API | Sending sensitive prompts directly | Never send private data to external LLM; use local processing for privacy-critical tasks |
| Agent Communication | Orchestrator sees plaintext | End-to-end encryption with agent-to-agent keys |
| Task Registry | Storing task inputs on-chain | Store encrypted commitments only; keep plaintext off-chain |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| ZK proof generation too slow | Task timeouts, agents wait for proofs | Pre-compute proofs where possible, async generation | At 10+ concurrent tasks |
| ECDH key exchange per message | High latency per agent message | Establish session keys, reuse for multiple messages | Beyond 3-5 message exchanges |
| On-chain state checks | Slow task progression, chain congestion | Cache contract state locally, batch reads | Beyond 5 agents |
| Unbounded agent memory | Memory growth, OOM crashes | Clear agent state between tasks, set limits | At 100+ task executions |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Trusting agent identities without verification | Impersonation attacks | Require cryptographic proof of agent identity via Midnight signatures |
| No rate limiting on task submission | DoS attacks, resource exhaustion | Implement per-agent and global rate limits in orchestrator |
| Storing private keys in plaintext | Complete system compromise | Use encrypted key storage, hardware security modules where possible |
| No dispute resolution mechanism | Malicious agent behavior goes unpunished | Build dispute resolution into contract design from start |
| Assuming ZK = perfectly private | Side-channel, implementation bugs | Defense in depth: encryption + ZK + access controls |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No visibility into why task failed | Cannot debug multi-agent failures | Clear error messages with agent chain trace |
| Privacy guarantees unclear | Users accidentally expose sensitive data | Explicit warnings, privacy property documentation |
| All-or-nothing task execution | Partial work lost on failure | Checkpoint system, recoverable intermediate states |
| No way to cancel in-flight tasks | Wasted resources, stuck state | Cancellation protocol with graceful agent shutdown |

---

## "Looks Done But Isn't" Checklist

- [ ] **ZK Proofs:** Verified with invalid inputs (not just valid ones) — test soundness
- [ ] **ECDH:** Used established library, not custom implementation — verify with test vectors
- [ ] **Privacy:** Actually tested attack vectors, not just claimed secure
- [ ] **Error Handling:** Simulated agent failures and verified cascade prevention
- [ ] **Encryption:** Keys properly destroyed after use, forward secrecy implemented
- [ ] **Contracts:** Audit reviewed, not just functional tests passing

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| ZK soundness bug discovered | HIGH | Must upgrade proof system, may need contract migration |
| ECDH implementation compromised | MEDIUM | Rotate all keys, implement proper forward secrecy |
| Data leak through orchestrator | HIGH | Audit all logs, may need to rebuild trust model |
| Cascade failure causes data corruption | MEDIUM | Rollback to checkpoint, implement better circuit breakers |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| OMNI-LEAK | Phase 1-2: Contract Design + Agent Runtime | Audit message flow, verify E2E encryption |
| ZK Soundness | Phase 1-2: Contract Design + Cryptographic Utils | Test invalid proofs are rejected |
| Error Cascade | Phase 2-3: Agent Runtime + Orchestrator | Simulate failures, verify isolation |
| ECDH Flaws | Phase 2: Cryptographic Utilities | Use audited libs, verify with test vectors |
| Selective Disclosure Leaks | Phase 1-2: Contract Design + Cryptographic Utils | Red team privacy testing |
| Premature Optimization | Phase 1: Contract Design | Define privacy formally before features |

---

## Sources

- OMNI-LEAK: Orchestrator Multi-Agent Network Induced Data Leakage (OpenReview, 2025)
- Why Do Multi-Agent LLM Systems Fail? (Berkeley ARXIV, 2025) — 41-86% failure rate
- Solana ZK ElGamal Proof Bug Post-Mortem (June 2025)
- Zero-Knowledge Leaks: Implementation Flaws in ZK Proof Authentication (Medium, 2026)
- Analysis and Vulnerabilities in zkLogin (IACR, 2026)
- Signal "Signalgate" Cryptographic Weaknesses (2025)
- Common Smart Contract Development Mistakes (Multiple sources)

---

*Pitfalls research for: BlindSwarm — Privacy-Preserving Multi-Agent AI Orchestration*
*Researched: 2026-03-29*
