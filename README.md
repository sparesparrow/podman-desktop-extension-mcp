# MCP Server Manager for Podman Desktop

A [Podman Desktop](https://podman-desktop.io) extension that runs
[Model Context Protocol](https://modelcontextprotocol.io) servers as Podman containers and routes calls
between them, so one place can start an MCP server, wait until it is healthy, connect to it and use its
tools, resources and prompts. It came out of wanting an MCP host on Linux that keeps each server in its own
rootless container instead of running it directly on the desktop.

> **Status: early prototype (0.0.1).** The container lifecycle, health checks, transport layer and router
> are implemented, with a first unit test for the server manager; the UI, tests and several protocol
> features are still in progress — see
> [`TODO.txt`](TODO.txt) for the plan and what is done. There is no published release yet; build it from
> source as below.

## What it does

- **Runs MCP servers in containers.** The server manager pulls the configured image and runs one container
  per server through Podman, with optional CPU and memory limits, then waits for a readiness probe before
  connecting.
- **Checks health.** HTTP and `exec` health-check strategies (`src/health/`) with initial delay, period and
  failure threshold, as in a Kubernetes readiness probe.
- **Speaks several transports.** A transport registry (`src/transport/`) creates stdio, HTTP + SSE and
  WebSocket clients behind one interface; a gRPC transport is stubbed. Optional TLS, compression and
  keep-alive settings are part of the server configuration.
- **Routes between servers.** `MCPRouter` keeps one MCP client per running server and forwards
  `tools/list`, `tools/call`, `resources/list`, `resources/read`, `prompts/list` and `prompts/get` to the
  right one by name, so tools from several containers can be used side by side.
- **Typed errors.** An `MCPErrorCode` enum and error classes carry failures up to the UI instead of
  swallowing them.

## Commands

Registered by `src/command-registrar.ts` and available from the command palette:

| Command ID | What it does |
|---|---|
| `mcp.startServer` | Start a server container from a configuration (defaults below) and connect to it |
| `mcp.stopServer` | Disconnect and stop a server by name |
| `mcp.listServerTools` / `mcp.callServerTool` | List a server's tools / call one with arguments |
| `mcp.listServerResources` / `mcp.readServerResource` | List a server's resources / read one by URI |
| `mcp.listServerPrompts` / `mcp.getServerPrompt` | List a server's prompts / fetch one |

A status-bar item opens the MCP menu, and the extension contributes an **MCP Server Manager** view.

### Default server configuration

```typescript
{
  name: 'mcp-server',
  image: 'ghcr.io/sparesparrow/podman-desktop-extension-mcp',
  version: 'latest',
  transport: { type: 'http-sse', port: 3000 },
  capabilities: { resources: true, tools: true, prompts: true, logging: true },
  readinessProbe: {
    initialDelaySeconds: 5,
    periodSeconds: 10,
    failureThreshold: 3,
    httpGet: { path: '/health', port: 3000 }
  }
}
```

Point `image` at any MCP server image that exposes the chosen transport.

## Build and install from source

Requirements: Podman Desktop ≥ 1.10.0 with Podman configured, Node.js ≥ 20 and pnpm.

```bash
git clone https://github.com/sparesparrow/podman-desktop-extension-mcp.git
cd podman-desktop-extension-mcp
pnpm install
pnpm run build
```

Then in Podman Desktop: **Settings → Extensions → Install from directory**, and select this folder.
`Containerfile` packages the built extension as an OCI image for **Install from container image**; the
`publish.yaml` workflow pushes it to GitHub Container Registry once a release is tagged.

## Layout

| Path | What it is |
|---|---|
| `src/extension.ts`, `src/command-registrar.ts` | Activation and command registration |
| `src/mcp-server-manager.ts`, `src/mcp-server-service*.ts` | Server lifecycle: create, start, stop, track |
| `src/podman/` | Podman container operations |
| `src/health/` | HTTP and exec readiness / health checks |
| `src/transport/`, `src/protocol/` | Transport factories and adapter, protocol negotiation |
| `src/core/mcp-client.ts`, `src/mcp-router.ts` | MCP client and the multi-server router |
| `src/frontend/` | Svelte UI: server list and chat interface (work in progress) |
| `docs/` | [Architecture diagrams](docs/diagrams.md), [security notes](docs/security.md), [development guide](docs/development.md), [API reference](docs/api.md) |

The security notes describe the intended design (rootless containers, resource isolation, key storage);
not every item in them is implemented yet.

## Development

```bash
pnpm run type-check  # tsc --noEmit
pnpm run build       # extension (tsc) and frontend (Vite)
pnpm test            # Vitest unit tests in src/__tests__
pnpm run lint
```

CI (`.github/workflows/pr-check.yaml`, `main.yaml`) runs the same four steps with pnpm 8.

## License

Apache-2.0 — see [LICENSE](LICENSE).
