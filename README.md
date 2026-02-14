# @daisi/sdk

TypeScript SDK for the [DAISI network](https://daisinet.com) — full parity with the .NET SDK, targeting both Node.js and browser environments.

## Installation

```bash
npm install @daisi/sdk
```

## Quick Start

### Node.js

```typescript
import { createDaisiClient, nodeTransportFactory } from "@daisi/sdk";

const client = await createDaisiClient({
  transportFactory: nodeTransportFactory,
  secretKey: process.env.DAISI_SECRET_KEY,
});

// Create an inference client (Orc picks the best host)
const inference = client.inference.create();
await inference.sessionManager.negotiateSession();

// Stream a response token by token
for await (const token of inference.send("What is the DAISI network?")) {
  process.stdout.write(token.Content ?? "");
}

// Clean up
await inference.close();
```

### Browser

```typescript
import { createDaisiClient, webTransportFactory } from "@daisi/sdk/web";

const client = await createDaisiClient({
  transportFactory: webTransportFactory,
  clientKey: "your-client-key", // Use clientKey in browsers, never secretKey
});
```

## Authentication

The SDK supports two authentication modes:

- **Secret Key** (server-side only): Pass `secretKey` to `createDaisiClient()`. The SDK exchanges it for a client key automatically, mirroring the .NET SDK's `UseDaisi()` behavior.
- **Client Key** (server or browser): Pass `clientKey` directly. Use this for browser apps or when you've already obtained a client key.

```typescript
// Server-side with secret key
const client = await createDaisiClient({
  transportFactory: nodeTransportFactory,
  secretKey: "sk-...",
});

// With pre-obtained client key
const client = await createDaisiClient({
  transportFactory: nodeTransportFactory,
  clientKey: "ck-...",
});
```

## Configuration

All options are optional except `transportFactory`:

```typescript
const client = await createDaisiClient({
  transportFactory: nodeTransportFactory,
  secretKey: "sk-...",

  // Orc connection (defaults shown)
  orcAddress: "orc.daisinet.com",
  orcPort: 443,
  orcUseSsl: true,
  networkName: "devnet",
});
```

## Available Clients

### Orc Clients

Orc clients communicate directly with the orchestrator:

| Client | Description |
|--------|-------------|
| `client.auth` | Authentication — create/validate client keys, auth codes |
| `client.sessions` | Session management — create, claim, close, connect |
| `client.accounts` | Account and user CRUD |
| `client.hosts` | Host management — list, register, update, stats |
| `client.drives` | Drive storage — upload, download, search, repositories, folders |
| `client.credits` | Credit accounts and transactions |
| `client.skills` | Skill CRUD and reviews |
| `client.marketplace` | Marketplace — browse, purchase, entitlements |
| `client.models` | Model listing |
| `client.networks` | Network CRUD |
| `client.dapps` | Dapp CRUD |
| `client.releases` | Release CRUD and activation |
| `client.orcs` | Orchestrator CRUD |
| `client.appCommands` | App command streaming (bidirectional) |
| `client.hostCommands` | Host command streaming (bidirectional) |

### Host Client Factories

Host clients use session management to connect to inference hosts:

```typescript
// Let the Orc choose the best host
const inference = client.inference.create();

// Target a specific host by ID
const inference = client.inference.createForHost("host-id");

// Direct connection to a host address
const inference = client.inference.createForAddress("192.168.1.100", 5000);
```

Available factories: `client.inference`, `client.peers`, `client.settings`.

## Streaming Inference

```typescript
const inference = client.inference.create();
await inference.sessionManager.negotiateSession();

// Simple API — auto-creates inference session
for await (const response of inference.send("Hello!")) {
  if (response.Content) {
    process.stdout.write(response.Content);
  }
}

// Full control
import { createDefaultSendInferenceRequest, ThinkLevels } from "@daisi/sdk";

const request = createDefaultSendInferenceRequest();
request.Text = "Explain quantum computing";
request.Temperature = 0.5;
request.ThinkLevel = ThinkLevels.ThinkLevelsSkilled;

for await (const response of inference.send(request)) {
  process.stdout.write(response.Content ?? "");
}
```

## File Operations (Drive)

```typescript
// Upload a file
const data = new Uint8Array(/* file content */);
const result = await client.drives.uploadFile(data, "document.pdf", {
  contentType: "application/pdf",
  repositoryId: "repo-id",
});

// Download a file
const fileData = await client.drives.downloadFile("file-id");

// Search files
const results = await client.drives.searchFiles("quarterly report");

// Vector search
const semanticResults = await client.drives.vectorSearch("AI market trends");
```

## Raw Client Access

Every client exposes a `.raw` property that gives direct access to the underlying nice-grpc client for advanced use cases:

```typescript
// Use any RPC method directly
const response = await client.accounts.raw.getAccount({ Id: "account-id" });
```

## Examples

The `examples/` folder contains ready-to-run demos for both Node.js and the browser.

### Node.js — Interactive Chat

A readline-based CLI chat with streaming responses and token stats.

```bash
cd examples/node-chat
npm install
DAISI_SECRET_KEY=sk-... npm start
```

### Node.js — One-Shot Prompt

Send a single prompt, stream the response to stdout, and exit. Great for scripts and pipelines.

```bash
cd examples/node-oneshot
npm install
DAISI_SECRET_KEY=sk-... npx tsx index.ts "What is the DAISI network?"

# Use --skilled for deeper reasoning
DAISI_SECRET_KEY=sk-... npx tsx index.ts --skilled "Explain quantum entanglement"
```

### Browser — Chat UI

A single-page chat app using grpc-web. Requires a client key (never use a secret key in the browser).

```bash
cd examples/browser-chat
npm install
npm run dev
# Open http://localhost:5173, enter your client key, and start chatting.
```

## Proto Code Generation

The SDK includes pre-generated TypeScript from the proto definitions. To regenerate:

```bash
npm run generate   # Requires buf CLI (installed as dev dependency)
npm run build      # Rebuild the SDK
```

## Development

```bash
npm install        # Install dependencies
npm run generate   # Generate TypeScript from protos
npm run build      # Build ESM + CJS bundles
npm test           # Run unit tests
npm run typecheck  # Type check without emitting
```

## Architecture

- **Transport**: `nice-grpc` for Node.js (full HTTP/2), `nice-grpc-web` for browsers (grpc-web)
- **Proto codegen**: `ts-proto` generates idiomatic TypeScript interfaces + nice-grpc service definitions
- **Build**: `tsup` produces dual ESM/CJS bundles with TypeScript declarations
- **Config**: Immutable options objects (not global mutable state) — safe for SSR and multi-instance use
- **Streaming**: Native `AsyncIterable<T>` pattern — works with `for await...of`

## License

MIT
