# BlindSwarm 🕸️

**Privacy-Preserving Multi-Agent AI Orchestration on Midnight Network**

A hackathon-ready implementation featuring:
- 🔐 **Real Ed25519 Cryptographic Signatures** - Each agent has real keypairs
- 🔒 **ECDH Encryption** - End-to-end encrypted agent communication
- 🤖 **Gemini 1.5 Flash Integration** - Live AI for Market/Risk/Compliance analysis
- ⛓️ **Midnight Network Ready** - Can deploy to testnet with real ZK proofs
- 📊 **Luminance Studio Web Dashboard** - Beautiful React/Vite visualization
- 🖥️ **Live TUI Dashboard** - Optional terminal visualization for CLI users
- 🌐 **Express & WebSocket API** - Real-time orchestration updates via socket stream

## Quick Start

```bash
# Install dependencies
npm install

# Build
npm run build

# Option 1: Run with Web Dashboard (Recommended)
# Terminal 1: Backend Server
npm run start:server

# Terminal 2: Frontend Dashboard
cd frontend
npm install
npm run dev

# Option 2: CLI Demo
# Build and run the TUI version
npm run build
npm run demo
```

## Configuration

Copy `.env.example` to `.env`:

```bash
# Required for live Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# For real Midnight testnet deployment:
# 1. Get testnet tokens: https://faucet.preprod.midnight.network/
# 2. Set your deployed contract address:
MIDNIGHT_DEPLOYED_ADDRESS=0x...
```

## Features

### ✅ Implemented

1. **Smart Contract** (`contracts/BlindSwarm.ts`)
   - AgentRegistry - Register/deregister agents with stake
   - TaskRegistry - DAG-based task management with escrow
   - DisputeRegistry - Resolution with selective disclosure

2. **Cryptography** (`src/crypto/`)
   - Ed25519 signatures (real @noble/ed25519)
   - SHA256 hashing
   - ECDH key exchange for agent-to-agent encryption

3. **AI Integration** (`src/adapters/`)
   - Gemini 2.5 Flash with structured prompts
   - Mock adapter for testing
   - Automatic fallback on API failure

4. **Demo** (`src/demo/`)
   - 3-agent workflow: Market → Risk → Compliance
   - Real cryptographic attestations
   - TUI visualization

## Deploy to Midnight Testnet

### Prerequisites

1. **Docker** - Running for proof server
2. **Testnet Tokens** - Get from https://faucet.preprod.midnight.network/

### Steps

```bash
# 1. Start proof server (separate terminal)
npm run start-proof-server

# 2. Build
npm run build

# 3. Deploy to testnet
npm run deploy

# This will:
# - Create or restore wallet
# - Request testnet tokens
# - Register for DUST (gas)
# - Deploy contract
# - Save address to deployment.json
```

### After Deployment

Set the address in `.env`:

```bash
MIDNIGHT_DEPLOYED_ADDRESS=0xyour_contract_address
```

Now run with real network:

```bash
npm run demo
```

## Project Structure

```
blindswarm/
├── contracts/           # Midnight Compact contracts
│   └── BlindSwarm.ts
├── src/
│   ├── adapters/        # AI adapters (Gemini, Mock)
│   ├── agents/         # AgentNode runtime
│   ├── client/         # Midnight client
│   ├── crypto/         # Ed25519, ECDH, SHA256
│   ├── demo/           # 3-agent demo
│   ├── midnight/       # SDK utilities
│   ├── orchestrator/   # DAG validation, escrow
│   ├── storage/        # Persistent storage
│   ├── tui/           # Terminal dashboard
│   ├── types/          # Shared type definitions
│   └── server.ts       # Backend API & WebSocket Server
├── frontend/           # Luminance Studio React/Vite App
│   ├── src/
│   │   ├── App.tsx     # Dashboard logic
│   │   └── index.css   # Premium design system
├── .env               # API keys
└── package.json
```

## Hackathon Judges - What Makes This Special

### Novel Features

1. **Cryptographic Agent Identity**
   - Each AI agent has real Ed25519 keypair
   - Signs execution outputs
   - Verifiable on-chain

2. **Privacy-Preserving Communication**
   - ECDH key exchange between agents
   - AES-256-GCM encryption
   - Intermediate data stays private

3. **Selective Disclosure**
   - Dispute resolution without revealing full data
   - ZK-ready contract structure

4. **Real Midnight Integration**
   - Uses official @midnight-ntwrk SDKs
   - Proper wallet with shielded/unshielded/DUST
   - ZK proof generation via proof server

### Demo Output

```
Step 1: Market Analysis → "NEUTRAL" (confidence: 85%)
         Output Hash: a3f2b8... 
         Ed25519 Signature: 8a7c3d...

Step 2: Risk Analysis → "HIGH risk" (confidence: 85%)
         Output Hash: 4d9e2a...
         Ed25519 Signature: 1b6c8f...

Step 3: Compliance → "NEEDS_REVIEW" (confidence: 85%)
         Output Hash: 7f1c4b...
         Ed25519 Signature: 9a2d5e...
```

## API Reference

### CLI Commands

```bash
blindswarm --help
blindswarm demo --run
blindswarm register-agent --capabilities market_analysis,risk_analysis
blindswarm create-task --dag '{"steps":[...]}'
blindswarm task-status --task-id xxx
```

### Programmatic

```typescript
import { createClient } from 'blindswarm';
import { createGeminiAdapter } from 'blindswarm';
import { generateKeyPair, sign } from 'blindswarm';

// Create client
const client = await createClient({
  providerUrl: 'https://testnet.midnight.network',
  walletPrivateKey: '...',
});

// Generate agent keys
const { publicKey, privateKey } = generateKeyPair();

// Sign attestation
const signature = sign(payload, privateKey);
```

## License

MIT
