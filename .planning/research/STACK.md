# Stack Research

**Domain:** Privacy-preserving multi-agent AI orchestration on Midnight Network
**Researched:** 2026-03-29
**Confidence:** MEDIUM

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|------------------|
| Node.js | LTS (v20+) | Runtime | Required by Midnight.js; v20+ has stable crypto APIs |
| TypeScript | ^5.3 | Language | Midnight.js is TypeScript-first; Compact type safety |
| Midnight.js | ^4.0.2 | Blockchain SDK | Official TypeScript SDK for Midnight Network; v4.0.2 is latest (Mar 2026) |
| Compact | v1 | Smart Contract Language | Midnight's TypeScript-inspired ZK contract language |
| Ink | ^6.0 | TUI Framework | Industry standard for React-based CLI apps; component-based architecture |
| Gemini API | Latest | AI Provider | Per PROJECT.md requirement; real intelligence for demo |

### Blockchain & Privacy

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|------------------|
| @midnight-ntwrk/midnight-js-contracts | ^4.0.2 | Contract deployment & interaction | Core SDK for BlindSwarm.compact contract |
| @midnight-ntwrk/midnight-js-level-private-state-provider | ^4.0.2 | Encrypted persistent storage | AES-256-GCM encryption, PBKDF2 key derivation |
| @midnight-ntwrk/midnight-js-http-client-proof-provider | ^4.0.2 | ZK proof generation | Offloads proof computation to proof server |
| @midnight-ntwrk/midnight-js-utils | ^4.0.2 | Utilities | Hex encoding, bech32m, assertions |

### AI Agent Orchestration

| Technology | Version | Purpose | When to Use |
|------------|---------|---------|--------------|
| Custom implementation | N/A | Agent orchestration | Best for BlindSwarm's specific privacy requirements |
| Mastra | Latest | TypeScript AI framework | Alternative for simpler agent patterns |
| VoltAgent | Latest | TypeScript agent framework | Alternative if full framework needed |

### Cryptography & Storage

| Technology | Version | Purpose | When to Use |
|------------|---------|---------|--------------|
| Node.js crypto (built-in) | N/A | ECDH key exchange | Per PROJECT.md: real ECDH, not mocked |
| classic-level | ^3.0.0 | LevelDB wrapper | Encrypted task storage (AES-256-GCM via Midnight.js provider) |
| level | ^10.0.0 | Abstract-level DB | Cross-environment storage compatibility |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|--------------|
| pino | ^9.0 | Logging | Midnight.js logger provider integration |
| zod | ^3.22 | Validation | Request/response validation for agent messages |
| axios | ^1.7 | HTTP client | External AI provider communication |
| viem | ^2.0 | Ethereum utilities | If bridging to other chains needed |
| dotenv | ^16.0 | Config | Environment variable management |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ts-node | TypeScript execution | For running CLI/demo scripts |
| nodemon | Dev watcher | Auto-restart during development |
| ESLint + Prettier | Code quality | Standard TypeScript tooling |
| Midnight CLI | Contract compilation | `npx @midnight-ntwrk/midnight-js-compact` |

## Installation

```bash
# Core runtime
npm install node@20

# Midnight.js core packages
npm install @midnight-ntwrk/midnight-js-types@^4.0.2
npm install @midnight-ntwrk/midnight-js-contracts@^4.0.2
npm install @midnight-ntwrk/midnight-js-network-id@^4.0.2
npm install @midnight-ntwrk/midnight-js-utils@^4.0.2

# Providers
npm install @midnight-ntwrk/midnight-js-level-private-state-provider@^4.0.2
npm install @midnight-ntwrk/midnight-js-indexer-public-data-provider@^4.0.2
npm install @midnight-ntwrk/midnight-js-http-client-proof-provider@^4.0.2
npm install @midnight-ntwrk/midnight-js-fetch-zk-config-provider@^4.0.2
npm install @midnight-ntwrk/midnight-js-logger-provider@^4.0.2

# TUI
npm install ink@^6.0 react@^18

# Storage
npm install classic-level@^3.0.0 level@^10.0.0

# Utilities
npm install zod@^3.22 axios@^1.7 pino@^9.0 dotenv@^16.0

# Dev
npm install -D typescript ts-node nodemon @types/node
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|------------------------|
| Midnight.js | Mesh SDK (community) | If prefer TypeScript DApp patterns over modular providers |
| Ink | Blessed | If need more terminal control, but Ink has better React integration |
| Custom orchestration | agent-orchestrator-ts | If want pre-built orchestration patterns, but may not fit privacy model |
| Node.js crypto (built-in) | eciesjs | If need ECIES encryption beyond ECDH key exchange |
| classic-level | SQLite | If prefer SQL, but LevelDB better for encrypted key-value |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| ethers.js / viem (primary) | These are Ethereum SDKs; Midnight.js is separate | Midnight.js for Midnight; viem only if bridging |
| Web3.js | Outdated for Ethereum, not designed for Midnight | Midnight.js |
| Mock ECDH | Per PROJECT.md: winning prototype requires real privacy | Node.js crypto ECDH |
| Real-time chat infrastructure | Out of scope per PROJECT.md | Task-based collaboration only |
| Web frontend | Explicitly out of scope | Terminal-based only |

## Stack Patterns by Variant

**If building for Midnight Testnet only:**
- Use `@midnight-ntwrk/midnight-js-node-zk-config-provider` for filesystem ZK artifacts
- Point indexer to testnet GraphQL endpoint

**If adding mainnet support later:**
- Swap network ID configuration
- Update indexer URLs to mainnet
- Increase PBKDF2 iterations for production key derivation

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Midnight.js 4.0.x | Node.js 18+ | Requires native crypto APIs |
| Ink 6.x | React 18.x | Uses react-reconciler |
| classic-level 3.x | Node.js 14+ | Native addon compatibility |
| Node.js crypto | ECDH secp256k1 | Midnight uses secp256k1 curve |

## Sources

- **Midnight.js API Reference v4.0.2** — https://docs.midnight.network/api-reference/midnight-js — Current SDK documentation (Mar 2026)
- **Midnight SDKs Overview** — https://docs.midnight.network/sdks — Official SDK ecosystem
- **Compact JavaScript Implementation** — https://docs.midnight.network/guides/use-compact-javascript-implementation — Contract interaction
- **Ink Documentation** — https://github.com/vadimdemedes/ink — React CLI framework
- **Level v10.0.0** — https://www.npmjs.com/package/level — Abstract-level DB
- **Classic-level v3.0.0** — https://www.npmjs.com/package/classic-level — LevelDB wrapper
- **Node.js Crypto** — https://nodejs.org/api/crypto.html — ECDH key exchange

---

*Stack research for: BlindSwarm — Privacy-preserving multi-agent AI orchestration on Midnight Network*
*Researched: 2026-03-29*
