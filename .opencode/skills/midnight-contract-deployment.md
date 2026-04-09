---
name: midnight-contract-deployment
description: Use this skill when the user asks to deploy a Midnight smart contract, compile Compact 0.30.0 code, debug Midnight SDK 4.x errors, write integration tests for Midnight DApps, or set up a CLI to interact with a Midnight blockchain network (standalone/preprod). Apply this even if the user doesn't mention specific versions, as it provides critical project-specific workarounds for wallet signing bugs, testcontainers bootstrapping, and type-checking fixes.
---

# Midnight Contract Deployment

This skill guides you through deploying a Midnight smart contract using Midnight SDK `4.x` and Compact compiler `0.30.0`. It covers the specific workarounds, CLI scaffolding, and environment settings required across the entire project repository.

## Environment Details

This guide assumes the following environment/dependencies:
- **Compact CLI (Compiler)**: `0.30.0`
- **TypeScript Midnight SDK**: `4.x` (`@midnight-ntwrk/midnight-js: ^4.0.4`)
- **Node Execution**: `--no-warnings --experimental-specifier-resolution=node --loader ts-node/esm`

## Deployment Checklist

Follow these steps when attempting to deploy or integrate a contract CLI:

- [ ] **Step 1: Update the Compact Pragma & Disclosures**
- [ ] **Step 2: Implement Complete Witnesses**
- [ ] **Step 3: Fix the `Contract` generic type constraints**
- [ ] **Step 4: Scaffolding the Network Config (`config.ts`)**
- [ ] **Step 5: Update the `CompiledContract` Pipeline in `api.ts`**
- [ ] **Step 6: Apply the `signTransactionIntents` workaround**
- [ ] **Step 7: Bootstrapping Environments (`standalone.ts` & `preprod.ts`)**

Detailed instructions for each step are in the "How to Deploy" section.

## Gotchas and Known Errors

These are hard-won lessons that you will encounter if you don't implement the workarounds. Check this list if you face an error:

### 1. `Contract state constructor: expected X arguments, received Y`
**Symptom:** The contract compiles, but `deployContract` throws an initialization error.
**Cause:** The Compact `0.30.0` constructor expects multiple arguments (e.g., `creator: Bytes<32>`), but you didn't pass them in `args: []` during the `deployContract` call.
**Fix:** Provide the arguments in the `args` array relative to your `.compact` constructor signature!

### 2. `first (witnesses) argument to Contract constructor does not contain a function-valued field`
**Symptom:** SDK crashes when instantiating `Contract`.
**Cause:** Attempting to use `CompiledContract.withVacantWitnesses` in your `api.ts`. If the contract defines witnesses, `0.30.0` strictly verifies that every witness function exists during construction. 
**Fix:** Provide the actual `witnesses` object instead of vacant witnesses during compilation caching. See `assets/template-api.ts`.

### 3. Typescript Error: `Type 'Contract' is not generic.`
**Symptom:** `tsc` complains about `Contract<any>` when importing from your `@project/contract` workspace.
**Cause:** The new compiler output might strip expected generics for Midnight SDK.
**Fix:** Bypass parameter constraints by declaring the exports as `any`. (e.g., `export type GameContract = any;`).

### 4. Transactions stuck indefinitely or rejected by Node
**Symptom:** A transaction is submitted but never confirms.
**Cause:** The `signTransactionIntents` bug in the Wallet SDK. The transaction gets signed but is misidentified as a pre-proof intent instead of a proof.
**Fix:** You **MUST** implement the wrapper function provided in the code template `assets/template-api.ts`. 

### 5. `Compile Error: potential witness-value disclosure`
**Symptom:** The `.compact` file fails to compile.
**Fix:** Wrap the values in `.disclose()` inside your `.compact` code anywhere a dynamic parameter is used in a ledger or increment step.

---

## How to Deploy (CLI Scaffolding)

A robust Midnight DApp separates concerns across multiple files. For an architectural reference on how these layers wire together, see [`references/cli-structure.md`](references/cli-structure.md).

### Set up Network Configurations (`config.ts`)
To communicate with Midnight, you need to point the Wallet and SDK providers to three separate URIs: the **Node (RPC)**, the **Indexer**, and the **Proof Server**.
- For standalone, `testcontainers` binds these to localhost ports.
- For `preprod`, public URLs must be mapped inside `Config` classes (making sure to execute `setNetworkId('preprod')`!).
See [`assets/template-config.ts`](assets/template-config.ts) for the required boilerplate.

### Define `api.ts` (The Adapter)
Your `api.ts` handles the interface between your application logic and `@midnight-ntwrk/midnight-js`.
1. Compile the contract using `.pipe(...)`. Make sure to avoid chained piping, and inject `witnesses` directly instead of vacants.
2. Ensure you patch the `signTransactionIntents` bug in this file.
See [`assets/template-api.ts`](assets/template-api.ts) for the exact implementation.

### Bootstrappers (`standalone.ts` & `preprod.ts`)
These scripts act as the entry point and must wire the `config.ts` network values directly into the `MidnightProviders` object.
If running `standalone`, this file is responsible for initializing the `testcontainers` environment *before* establishing connection.

```typescript
// standalone.ts usage example
const dockerEnv = new DockerComposeEnvironment(path.resolve(currentDir, '..'), 'standalone.yml');
const env = await dockerEnv.up();
// ... Initialize providers and kick off cli.ts
```

## Deep Architecture References

For deeper knowledge on extending the project beyond a basic deployment, load the following references via progressive disclosure:

- **[Writing Tests (Vitest & Testcontainers)](references/tests.md)**: Explains how to override timeouts and initialize localized Docker networks isolated per test suite.
- **[Script Lifecycles & Execution (`npm run`)](references/commands.md)**: Defines the required `node --experimental-specifier-resolution=node` flags and the differences between standalone bootups and preprod connection steps.
- **[Logging Context (Pino Streams)](references/logging.md)**: Covers how to map `stdout` logs through `pino-pretty` to prevent massive JSON blobs from hiding the user's CLI prompt during network sync events.

---

# Code Templates

## template-api.ts

```typescript
import { Contract, ledger, witnesses } from '@framed/contract';
import { type GameProviders, type DeployedGameContract } from './common-types.js';
import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js/contracts';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { WebSocket } from 'ws';
import type { WalletFacade, TransactionIntent } from '@midnight-ntwrk/wallet-sdk-facade';

// Required for GraphQL subscriptions (wallet sync) to work in Node.js
globalThis.WebSocket = WebSocket as any;

/**
 * -----------------------------------------------------------------------------
 * WORKAROUND: signTransactionIntents bug in Wallet SDK 4.x
 * -----------------------------------------------------------------------------
 * 
 * Midnight SDK 4.0.4 has a known bug where wallet-sdk misidentifies
 * TransactionIntents as "pre-proof" rather than "proof", causing network
 * rejection. We MUST wrap the wallet's signing method to manually override
 * the kind flag back to 'proof'.
 */
export const signTransactionIntents = async (
  wallet: WalletFacade,
  intents: TransactionIntent[],
): Promise<Uint8Array[]> => {
  const signed = await wallet.signTransactionIntents(intents);
  for (let i = 0; i < signed.length; i++) {
    const tx = signed[i];
    // Workaround: Patch 0x01 (pre-proof) with 0x02 (proof) at index 3
    if (intents[i].kind === 'proof' && tx.length > 3 && tx[3] === 0x01) {
      tx[3] = 0x02;
    }
  }
  return signed;
};

// -----------------------------------------------------------------------------
// CompiledContract Pipeline
// -----------------------------------------------------------------------------

// Make sure to bypass typescript generic constraints and provide actual witnesses!
const gameCompiledContract = ((CompiledContract as any).make('game', Contract)).pipe(
  (CompiledContract as any).withWitnesses(witnesses), 
  (CompiledContract as any).withCompiledFileAssets('./path/to/zk-config-path'),
) as any;

// -----------------------------------------------------------------------------
// Deployment 
// -----------------------------------------------------------------------------

export const deploy = async (
  providers: GameProviders,
  privateState: any, // Your specific private state interface
  creator: Uint8Array,
  maxPlayers: bigint,
): Promise<DeployedGameContract> => {
  const gameContract = await deployContract(providers as any, {
    compiledContract: gameCompiledContract,
    privateStateId: 'gamePrivateState',
    initialPrivateState: privateState,
    args: [creator, maxPlayers], // REQUIRED: Constructor arguments based on your .compact file
  });
  return gameContract;
};

// ... Join and Call functions use similar `(providers as any)` and `as any` casting for circuits.
```

## template-config.ts

```typescript
import path from 'node:path';
import { setNetworkId } from '@midnight-ntwrk/midnight-js/network-id';

// Configure the correct paths for the contract ZK file assets
export const currentDir = path.resolve(new URL(import.meta.url).pathname, '..');

export const contractConfig = {
  privateStateStoreName: 'my-private-state',
  zkConfigPath: path.resolve(currentDir, '..', '..', 'contract', 'src', 'managed', 'game'),
};

export interface Config {
  readonly logDir: string;
  readonly indexer: string;
  readonly indexerWS: string;
  readonly node: string;
  readonly proofServer: string;
}

/** 
 * Local Standalone Testnet Configuration
 * Matches the default exposed ports in `testcontainers` or docker-compose.
 */
export class StandaloneConfig implements Config {
  logDir = path.resolve(currentDir, '..', 'logs', 'standalone', `${new Date().toISOString()}.log`);
  indexer = 'http://127.0.0.1:8088/api/v3/graphql';
  indexerWS = 'ws://127.0.0.1:8088/api/v3/graphql/ws';
  node = 'http://127.0.0.1:9944';
  proofServer = 'http://127.0.0.1:6300';
  constructor() {
    setNetworkId('undeployed');
  }
}

/** 
 * Official Midnight Preprod configuration.
 * Note: The proof-server runs locally as a proxy bounding to preprod node.
 */
export class PreprodConfig implements Config {
  logDir = path.resolve(currentDir, '..', 'logs', 'preprod', `${new Date().toISOString()}.log`);
  indexer = 'https://indexer.preprod.midnight.network/api/v3/graphql';
  indexerWS = 'wss://indexer.preprod.midnight.network/api/v3/graphql/ws';
  node = 'https://rpc.preprod.midnight.network';
  proofServer = 'http://127.0.0.1:6300';
  constructor() {
     // REQUIRED: You must set the network ID correctly for signatures to work!
    setNetworkId('preprod');
  }
}
```

---

# Quick Start Example

After installing the skill, your AI agent can help you:

```typescript
// 1. Set up network configuration
const config = new StandaloneConfig();

// 2. Deploy a contract with proper witnesses
const contract = await deployContract(providers, {
  args: [creatorBytes], // Match constructor signature
  witnesses: actualWitnesses, // Never use vacant witnesses
});

// 3. Sign transactions with the workaround
const signedTx = await signTransactionIntentsWorkaround(
  wallet,
  transactionIntents
);
```

## Common Issues Solved

- ✅ "Contract state constructor: expected X arguments, received Y"
- ✅ "first (witnesses) argument does not contain a function-valued field"
- ✅ "Type 'Contract' is not generic" TypeScript errors
- ✅ Transactions stuck indefinitely or rejected by Node
- ✅ "potential witness-value disclosure" compile errors

## Requirements

- Node.js with ESM support
- Docker (for standalone network)
- TypeScript 4.x+
- Midnight SDK 4.x
- Compact compiler 0.30.0

## Project Structure

This skill follows the recommended Midnight DApp architecture:

```
project/
├── contract/              # Compact smart contract code
│   ├── src/
│   └── dist/
└── project-cli/          # CLI application
    ├── src/
    │   ├── api.ts        # SDK wrapper layer
    │   ├── cli.ts        # Presentation layer
    │   ├── config.ts     # Network configuration
    │   ├── standalone.ts # Local testnet bootstrapper
    │   └── preprod.ts    # Preprod network bootstrapper
    └── package.json
```