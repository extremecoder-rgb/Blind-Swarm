# Phase 1: Smart Contracts & Core Backend - Research

**Researched:** 2026-03-29
**Domain:** Midnight Network smart contracts, TypeScript backend, cryptographic utilities
**Confidence:** HIGH

## Summary

Phase 1 establishes the cryptographic foundation for BlindSwarm by deploying a unified Midnight Compact contract with AgentRegistry, TaskRegistry, and DisputeRegistry modules, plus the TypeScript backend infrastructure for contract interaction, cryptographic utilities, and persistent storage.

**Primary recommendation:** Use Midnight.js v4.0.2 with official deployment workflow, Node.js native crypto for utilities, and classic-level for encrypted storage. DAG validation uses custom topological sort with cycle detection.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @midnight-ntwrk/midnight-js-contracts | 4.0.2 | Contract deployment and interaction | Official SDK |
| @midnight-ntwrk/ledger-v8 | 8.0.3 | Blockchain data types and operations | Required for wallet/ledger |
| @midnight-ntwrk/compact-runtime | 0.15.0 | Compact contract execution runtime | Required for contract logic |
| Node.js crypto | built-in | SHA256, Ed25519 signatures | Native, audited, stable |
| typescript | ^5.9.3 | Type-safe development | Per official docs |
| tsx | ^4.21.0 | TypeScript execution | Official docs choice |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| classic-level | ^3.0.0 | LevelDB with encrypted support | Persistent storage |
| canonical-json | ^2.0.0 | Deterministic JSON serialization | Task/agent signatures |
| tsort | ^0.0.1 | Topological sort | DAG validation |
| @midnight-ntwrk/wallet-sdk-hd | 3.1.0 | HD wallet for agent keys | Agent wallet derivation |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| classic-level | better-sqlite3 | LevelDB simpler K-V store, better Midnight integration |
| tsort | graph-sequencer | tsort simpler for basic needs |
| canonical-json | json-stable-stringify | canonical-json RFC 8785 compliant |

**Installation:**
```bash
npm install @midnight-ntwrk/midnight-js-contracts@4.0.2 @midnight-ntwrk/ledger-v8@8.0.3 @midnight-ntwrk/compact-runtime@0.15.0 @midnight-ntwrk/wallet-sdk-hd@3.1.0 @midnight-ntwrk/wallet-sdk-facade@3.0.0 @midnight-ntwrk/wallet-sdk-shielded@2.1.0 @midnight-ntwrk/wallet-sdk-unshielded-wallet@2.1.0 @midnight-ntwrk/wallet-sdk-dust-wallet@3.0.0 @midnight-ntwrk/midnight-js-http-client-proof-provider@4.0.2 @midnight-ntwrk/midnight-js-indexer-public-data-provider@4.0.2 @midnight-ntwrk/midnight-js-level-private-state-provider@4.0.2 @midnight-ntwrk/midnight-js-node-zk-config-provider@4.0.2 @midnight-ntwrk/midnight-js-network-id@4.0.2 @midnight-ntwrk/midnight-js-types@4.0.2 canonical-json tsort classic-level
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── contracts/              # Compact contract source
│   └── BlindSwarm.compact
├── contract/              # Compiled contract artifacts
├── src/
│   ├── deploy.ts          # Contract deployment script
│   ├── utils.ts           # Wallet and provider utilities
│   ├── index.ts           # Main entry point
│   ├── api/
│   │   ├── agent.ts       # Agent registry API
│   │   ├── task.ts        # Task registry API
│   │   └── dispute.ts     # Dispute registry API
│   ├── crypto/
│   │   ├── json.ts        # Deterministic JSON
│   │   ├── sha256.ts      # SHA256 hashing
│   │   └── signatures.ts  # Ed25519 verification
│   ├── storage/
│   │   └── db.ts          # LevelDB persistence
│   └── dag/
│       └── validator.ts   # DAG validation
└── package.json
```

### Pattern 1: Compact Contract Structure
**What:** Unified contract with logical module partitions for AgentRegistry, TaskRegistry, DisputeRegistry
**When to use:** Single contract deployment with distinct functional areas
**Example:**
```compact
// BlindSwarm.compact - Simplified structure
struct Agent {
  id: Bytes<32>,
  owner: Field,
  capabilities: Vector<10, Bool>,
  stake: Uint<64>,
  reputation: Uint<32>,
}

struct Task {
  id: Bytes<32>,
  creator: Field,
  dagData: Bytes<1024>,  // Encoded DAG
  status: Uint<8>,        // 0=created, 1=assigned, 2=completed, 3=disputed
  escrow: Uint<128>,
}

struct Dispute {
  taskId: Bytes<32>,
  challenger: Field,
  evidenceCommitment: Bytes<64>,
  resolved: Boolean,
}

ledger agentCount: Uint<32>;
ledger agents: Map<Bytes<32>, Agent>;
ledger tasks: Map<Bytes<32>, Task>;
ledger disputes: Map<Bytes<32>, Dispute>;

export circuit register_agent(agent_id: Bytes<32>, capabilities: Vector<10, Bool>, stake: Uint<64>): Bytes<32> { ... }
export circuit create_task(task_id: Bytes<32>, dag: Bytes<1024>, escrow: Uint<128>): Bytes<32> { ... }
export circuit assign_step(task_id: Bytes<32>, step_index: Uint<16>, agent: Bytes<32>): Boolean { ... }
export circuit submit_attestation(task_id: Bytes<32>, step_index: Uint<16>, signature: Bytes<64>): Boolean { ... }
export circuit initiate_dispute(task_id: Bytes<32>, evidence: Bytes<64>): Bytes<32> { ... }
export circuit resolve_dispute(dispute_id: Bytes<32>, resolution: Bool): Boolean { ... }
```

### Pattern 2: Midnight.js Deployment Flow
**What:** Standard deployment workflow from official docs
**When to use:** Any contract deployment to Midnight
**Example:**
```typescript
// Source: https://docs.midnight.network/getting-started/deploy-mn-app
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';

const deployed = await deployContract(providers, {
  compiledContract,
  privateStateId: 'blindSwarmState',
  initialPrivateState: {},
});
// deployed.deployTxData.public.contractAddress
```

### Pattern 3: DAG Validation with Cycle Detection
**What:** Validate task DAG on creation using topological sort
**When to use:** Task creation (ORCH-02 requirement)
**Example:**
```typescript
import tsort from 'tsort';

interface DAGNode {
  id: string;
  dependencies: string[];
}

function validateDAG(nodes: DAGNode[]): { valid: boolean; error?: string } {
  const graph = tsort();
  
  // Build graph
  for (const node of nodes) {
    graph.add(node.id);
    for (const dep of node.dependencies) {
      graph.add(dep);
      graph.addEdge(dep, node.id);
    }
  }
  
  try {
    const sorted = graph.sort();
    return { valid: true };
  } catch (e) {
    return { valid: false, error: 'Cycle detected in task DAG' };
  }
}
```

### Anti-Patterns to Avoid
- **Multiple separate contracts:** Use unified contract with module partitions per STATE.md decision
- **Mocking crypto:** Use real Node.js crypto per REQUIREMENTS.md BACK-07, BACK-08, BACK-09
- **SQLite for contract state:** Use LevelDB with Midnight's level-private-state-provider pattern

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JSON signing | Custom canonicalization | canonical-json | RFC 8785 compliant, tested |
| SHA256 | Custom implementation | node:crypto | Native, audited |
| Ed25519 | Custom signing | node:crypto | Full Ed25519 support |
| DAG sort | Custom algorithm | tsort | Simple, well-tested |
| Contract deployment | Custom scripts | @midnight-ntwrk/midnight-js-contracts | Official, supported |

**Key insight:** Midnight.js SDK provides battle-tested patterns. Custom crypto implementations risk security vulnerabilities.

## Common Pitfalls

### Pitfall 1: Proof Server Not Running
**What goes wrong:** Contract deployment fails with "Wallet.Proving: Failed to prove transaction"
**Why it happens:** Docker proof server not running or not accessible
**How to avoid:** Ensure `docker run -p 6300:6300 midnightntwrk/proof-server:8.0.3` is running before deployment
**Warning signs:** ZK proof generation timeout errors

### Pitfall 2: Insufficient DUST Tokens
**What goes wrong:** Transaction fails due to lack of gas
**Why it happens:** DUST (Midnight's gas token) not registered or generated
**How to avoid:** Register UTXOs for DUST generation, wait for generation to complete
**Warning signs:** "Insufficient DUST" errors in wallet state

### Pitfall 3: Wallet Not Synced
**What goes wrong:** Contract calls fail with stale state
**Why it happens:** Wallet not synced with indexer before operations
**How to avoid:** Use RxJS filter to wait for `state.isSynced === true`
**Warning signs:** Stale balance or state errors

### Pitfall 4: Private State Mismatch
**What goes wrong:** Contract state diverges between parties
**Why it happens:** Incorrect private state initialization or witness provision
**How to avoid:** Validate private state structure matches circuit expectations
**Warning signs:** Proof verification failures

## Code Examples

### Deterministic JSON Serialization
```typescript
// Source: canonical-json npm package
import canonicalize from 'canonical-json';

const payload = { 
  taskId: '0x123', 
  steps: [{id: 1}, {id: 2}],
  timestamp: 1234567890 
};
const canonical = canonicalize(payload);
// Use canonical for SHA256 hashing and signing
```

### SHA256 Hashing
```typescript
import { createHash } from 'node:crypto';

function sha256(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}
```

### Ed25519 Signature Verification
```typescript
import { createVerify, createPublicKey } from 'node:crypto';

function verifyEd25519(message: string, signature: Buffer, publicKeyHex: string): boolean {
  const publicKey = createPublicKey({
    key: Buffer.from(publicKeyHex, 'hex'),
    type: 'spki',
    format: 'der',
  });  // Note: Midnight uses specific encoding - may need adjustment
  const verifier = createVerify('SHA256');
  verifier.update(message);
  return verifier.verify(publicKey, signature);
}
```

### Contract State Watching
```typescript
import * as Rx from 'rxjs';

const taskState$ = walletCtx.wallet.state().pipe(
  Rx.filter((s) => s.isSynced),
  Rx.map((s) => s.private.tasks.get(taskId))
);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Midnight.js v3 | v4.0.2 | 2026 | Current stable version |
| compact-runtime v0.14 | v0.15.0 | 2026 | Current stable |
| Webpack bundling | tsx direct execution | 2026 | Simpler dev workflow |

**Deprecated/outdated:**
- Web3.js-style ABIs: Midnight uses Compact + TypeScript SDK
- Solidity-style contracts: Compact is fundamentally different (ZK-native)

## Open Questions

1. **Ed25519 Key Format for Midnight**
   - What we know: Midnight uses Ed25519 for signatures
   - What's unclear: Exact encoding format for verification (DER vs raw)
   - Recommendation: Test with known vectors during Phase 1 implementation

2. **DAG Encoding on-Chain**
   - What we know: Tasks need DAG stored on contract
   - What's unclear: Efficient encoding for variable-size DAGs
   - Recommendation: Use CBOR or fixed-size chunks in Bytes<N>

3. **Proof Server Setup**
   - What we know: Requires Docker on local machine
   - What's unclear: CI/CD deployment patterns for proof generation
   - Recommendation: Document local setup requirements clearly

## Sources

### Primary (HIGH confidence)
- Midnight Deploy Hello World - https://docs.midnight.network/getting-started/deploy-mn-app - Deployment workflow
- Midnight SDKs Overview - https://docs.midnight.network/sdks - SDK packages
- Compact Reference - https://docs.midnight.network/develop/reference/compact/lang-ref - Contract language
- Node.js Crypto - https://nodejs.org/api/crypto.html - Native crypto

### Secondary (HIGH confidence)
- canonical-json npm - https://www.npmjs.com/package/json-canonicalize - Deterministic JSON
- tsort npm - https://www.npmjs.com/package/tsort - Topological sort
- classic-level npm - https://www.npmjs.com/package/classic-level - LevelDB wrapper

### Tertiary (MEDIUM confidence)
- Graph Sequencer - https://www.npmjs.com/package/graph-sequencer - Advanced DAG sorting
- Midnight.js API Reference - https://docs.midnight.network/api-reference/midnight-js - v3.1.0 reference

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Midnight docs, stable Node.js APIs
- Architecture: HIGH - Official deployment patterns, standard TypeScript project
- Pitfalls: HIGH - Documented in official troubleshooting

**Research date:** 2026-03-29
**Valid until:** 2026-04-29 (30 days - Midnight SDK is stable)

---

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CONT-01 | Unified BlindSwarm.compact contract with AgentRegistry module | Compact contract structure pattern |
| CONT-02 | Unified BlindSwarm.compact contract with TaskRegistry module | Compact contract structure pattern |
| CONT-03 | Unified BlindSwarm.compact contract with DisputeRegistry module | Compact contract structure pattern |
| CONT-04 | register_agent() circuit | Compact circuit definitions |
| CONT-05 | deregister_agent() circuit | Compact circuit definitions |
| CONT-06 | create_task() circuit | Compact circuit definitions |
| CONT-07 | assign_step() circuit | Compact circuit definitions |
| CONT-08 | submit_attestation() circuit | Compact circuit definitions |
| CONT-09 | initiate_dispute() circuit | Compact circuit definitions |
| CONT-10 | resolve_dispute() circuit | Compact circuit definitions |
| BACK-01 | TypeScript Node.js project with modular structure | Project structure pattern |
| BACK-02 | Midnight.js client integration | Midnight.js deployment flow |
| BACK-07 | Cryptographic utilities - deterministic JSON | canonical-json |
| BACK-08 | Cryptographic utilities - SHA256 hashing | Node.js crypto |
| BACK-09 | Cryptographic utilities - Ed25519/Midnight wallet signature verification | Node.js crypto |
| BACK-10 | Persistent storage for tasks | classic-level |
| ORCH-01 | Orchestrator client wiring agents, contracts, and AI adapters | Project structure |
| ORCH-02 | DAG validation for task creation | tsort DAG validation |
