# BlindSwarm - Midnight Testnet Deployment Guide

## Prerequisites

### 1. System Requirements
- **OS**: Linux or Mac (Windows not supported for development)
- **Docker**: Running for proof server
- **Node.js**: v20+

### 2. Midnight Toolchain

```bash
# Install Compact compiler
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh
source ~/.zshrc  # or source ~/.bashrc

# Verify installation
compact --version
```

### 3. Lace Wallet (Browser Extension)
1. Install Lace wallet from Chrome Web Store
2. Create Cardano wallet
3. Go to Settings → Enable Beta features
4. Add new wallet → Select Midnight network

### 4. Testnet Tokens
1. Visit: https://faucet.preprod.midnight.network/
2. Connect your Lace wallet
3. Request tNight tokens

## Quick Deploy

### Step 1: Start Proof Server

```bash
docker run -p 6300:6300 midnightntwrk/proof-server:latest midnight-proof-server -v
```

Keep this running in a separate terminal.

### Step 2: Configure

```bash
# Copy environment file
cp .env.example .env

# Edit with your values
GEMINI_API_KEY=your_gemini_key  # Optional
MIDNIGHT_WALLET_SEED=your_64_char_seed  # Optional - will generate if not set
```

### Step 3: Deploy

```bash
# Build project
npm run build

# Run demo (simulates deployment)
npm run demo
```

For actual contract deployment to testnet, you'll need to:

1. Install Midnight SDK dependencies:
```bash
npm install @midnight-ntwrk/compact-runtime @midnight-ntwrk/midnight-js-contracts \
  @midnight-ntwrk/midnight-js-http-client-proof-provider \
  @midnight-ntwrk/midnight-js-indexer-public-data-provider \
  @midnight-ntwrk/wallet-sdk-facade @midnight-ntwrk/wallet-sdk-hd
```

2. Create deployment script following Midnight docs:
   - https://docs.midnight.network/guides/deploy-mn-app

## Network Endpoints

| Network | Indexer | RPC Node |
|---------|---------|----------|
| Preprod | https://indexer.preprod.midnight.network/api/v3/graphql | https://rpc.preprod.midnight.network |
| Preview | https://indexer-preview.midnight.network/api/v3/graphql | https://rpc-preview.midnight.network |

## Troubleshooting

### Proof Server Connection Error
```bash
# Check Docker is running
docker ps

# Verify proof server
curl http://localhost:6300/health
```

### Insufficient DUST
- Wait for DUST generation (can take minutes)
- Ensure you have tNight tokens for DUST generation

### Wallet Sync Issues
- Ensure Lace wallet is synced
- Check network connection

## Current Demo Status

The demo currently runs with:
- ✅ Real Ed25519 signatures (every agent has unique keypair)
- ✅ ECDH encryption module
- ✅ Gemini AI integration (with mock fallback)
- ✅ Mock Midnight client (for testing)

To connect to real testnet, replace the mock client in `src/client/index.ts` with real Midnight SDK calls following the pattern in the Midnight deployment guide.

## Hackathon Demo Output

```
╔════════════════════════════════════════════════════════════╗
║          BlindSwarm - Multi-Agent Orchestration            ║
║              Privacy-Preserving AI Protocol               ║
╚════════════════════════════════════════════════════════════╝

Step 1: Market Analysis Agent
  - Public Key: 5f97a281...
  - Ed25519 Signature: a1b2c3d4...
  - Output Hash: sha256(...)
  [85% confidence]

Step 2: Risk Analysis Agent  
  - Public Key: 8a5b3443...
  - Ed25519 Signature: e5f6a7b8...
  - Output Hash: sha256(...)
  [87% confidence]

Step 3: Compliance Agent
  - Public Key: ad1b7da4...
  - Ed25519 Signature: 9c8d7e6f...
  - Output Hash: sha256(...)
  [85% confidence]

══════════ DEMO SUCCESSFUL: PROOF OF WORKFLOW VERIFIED ══════════
```
