# LUMINANCE - Nightforge Local Development Guide

This guide shows how to run Luminance with Nightforge for real Midnight network operations (no mocks).

## Prerequisites

1. **Node.js** >= 22.0.0
2. **Docker** and **Docker Compose** (v2)
3. **Git**

## Architecture

```
┌─────────────────────────────────────────────┐
│              Luminance DApp                   │
│         (src/client/index.ts)               │
└──────────────────┬──────────────────────────┘
                   │ connects via WalletFacade
                   ▼
┌─────────────────────────────────────────────┐
│              Nightforge CLI                  │
│                                             │
│  - Wallet sync (walletsync service)         │
│  - Proof server management                  │
│  - Contract deployment                      │
└──────────────────┬──────────────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
┌──────────────┐    ┌──────────────────┐
│  Local Node  │    │  Proof Server    │
│   :9944      │    │    :6300         │
└──────────────┘    └──────────────────┘
        │
        ▼
┌──────────────┐
│   Indexer    │
│   :8088      │
└──────────────┘
```

## Step 1: Install Dependencies

```bash
# Install npm dependencies (includes nightforge)
npm install
```

## Step 2: Initialize Nightforge

```bash
# Create nightforge configuration files
npx nightforge sync --init

# This creates:
# - .env (wallet sync config)
# - walletsync.config.json
```

## Step 3: Configure Network

Edit `.env` file (created by nightforge sync --init):

```bash
# For local development (using Nightforge's built-in local network)
NETWORK=preprod
WALLETSYNC_PROVIDER_URL=http://localhost:9944
WALLETSYNC_INDEXER_URL=http://localhost:8088/api/v3/graphql

# Your wallet mnemonic (or create new one)
MNEMONIC=abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art

# Gemini API key for AI agents
GEMINI_API_KEY=your_gemini_api_key
```

## Step 4: Start Local Midnight Network

Nightforge can start the local network for you, or use an existing one.

### Option A: Start with Nightforge (Recommended)

```bash
# Start proof server
npx nightforge ps start

# Verify proof server
curl http://localhost:6300/version
```

### Option B: Start manually with Docker

```bash
# Start local Midnight network
docker compose -f docker-compose.yml up -d

# Wait for services to be healthy
docker compose ps
```

## Step 5: Start Wallet Sync Service

Nightforge provides a wallet sync service that keeps your wallet state synchronized:

```bash
# Start wallet sync server (run in background or separate terminal)
npx nightforge sync

# In another terminal, check balance
npx nightforge wallet balance
```

## Step 6: Compile Contract

```bash
# Compile Compact contract to TypeScript
npx nightforge compile
```

This compiles `contracts/BlindSwarm.compact` and outputs to `src/client/gen/`.

## Step 7: Build and Run Demo

```bash
# Build TypeScript
npm run build

# Run the demo with real network
npm run demo
```

## Nightforge Commands Reference

| Command | Description |
|---------|-------------|
| `npx nightforge init <name>` | Create new Midnight project |
| `npx nightforge compile` | Compile contracts |
| `npx nightforge sync --init` | Initialize wallet sync |
| `npx nightforge sync` | Start wallet sync server |
| `npx nightforge wallet create` | Create new wallet |
| `npx nightforge wallet restore` | Restore wallet from mnemonic |
| `npx nightforge wallet balance` | Check balance |
| `npx nightforge wallet dust` | Convert NIGHT to DUST |
| `npx nightforge ps start` | Start proof server |
| `npx nightforge deploy <contract>` | Deploy contract |
| `npx nightforge deploy --auto` | Auto-deploy (wallet + DUST + deploy) |

## Auto-Deploy (Simplest)

If you want Nightforge to handle everything:

```bash
# This will:
# 1. Create/find wallet
# 2. Wait for funding
# 3. Register DUST
# 4. Ensure proof server is ready
# 5. Deploy contract

npx nightforge deploy BlindSwarm --auto --network preprod
```

## Network Configuration

### Local Development
```bash
NETWORK=preprod
WALLETSYNC_PROVIDER_URL=http://localhost:9944
WALLETSYNC_INDEXER_URL=http://localhost:8088/api/v3/graphql
MIDNIGHT_PROOF_SERVER_URL=http://localhost:6300
```

### Preprod Testnet
```bash
NETWORK=preprod
WALLETSYNC_PROVIDER_URL=https://rpc.preprod.midnight.network
WALLETSYNC_INDEXER_URL=https://indexer.preprod.midnight.network/api/v3/graphql
MIDNIGHT_PROOF_SERVER_URL=https://proof.preprod.midnight.network
```

## Files Created by Nightforge

- `walletsync.config.json` - Wallet sync configuration
- `.env` - Environment variables (contains wallet info)
- `wallet.json` - Persisted wallet state (DO NOT COMMIT)
- `deployment.json` - Deployment metadata
- `proof-server-status.json` - Proof server state

## Troubleshooting

### Wallet sync not working
```bash
# Check sync status
npx nightforge sync --status
```

### Proof server not ready
```bash
# Check proof server status
curl http://localhost:6300/version

# Start if needed
npx nightforge ps start
```

### Insufficient balance
```bash
# Check balance
npx nightforge wallet balance

# Convert to DUST if needed
npx nightforge wallet dust
```

### Contract deployment fails
```bash
# Try auto-deploy mode
npx nightforge deploy BlindSwarm --auto
```

## Complete Workflow

```bash
# 1. Install
npm install

# 2. Initialize wallet sync
npx nightforge sync --init

# 3. Configure .env with your mnemonic

# 4. Start proof server
npx nightforge ps start

# 5. Start wallet sync
npx nightforge sync

# 6. Compile contract
npx nightforge compile

# 7. Build
npm run build

# 8. Run demo
npm run demo
```

This runs BlindSwarm with:
- Real wallet (via Nightforge walletsync)
- Real Midnight network (local or testnet)
- Real ZK proofs (via proof server)
- Real Gemini AI (if API key provided)