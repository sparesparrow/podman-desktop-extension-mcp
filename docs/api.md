# API Reference

This document provides detailed information about the MCP Server Manager extension's API.

## Core APIs

### MCPClient

The main client interface for interacting with MCP servers.

```typescript
interface MCPClientConfig {
  host: string;
  port: number;
  secure?: boolean;
  capabilities?: MCPCapabilities;
}

class MCPClient {
  constructor(config: MCPClientConfig);
  
  // Connection management
  async connect(): Promise<boolean>;
  async disconnect(): Promise<void>;
  
  // Server operations
  async startServer(config: ServerConfig): Promise<void>;
  async stopServer(name: string): Promise<void>;
  async getStatus(name: string): Promise<ServerStatus>;
  async listServers(): Promise<Server[]>;
  
  // Tool operations
  async listTools(): Promise<Tool[]>;
  async callTool(name: string, args: any): Promise<any>;
}
```

### Server Management

Types and interfaces for server management.

```typescript
interface ServerConfig {
  name: string;
  image: string;
  port: number;
  capabilities: MCPCapabilities;
  resources?: ResourceLimits;
}

interface Server {
  id: string;
  name: string;
  status: ServerStatus;
  startTime: Date;
  config: ServerConfig;
}

enum ServerStatus {
  STARTING = 'starting',
  RUNNING = 'running',
  STOPPING = 'stopping',
  STOPPED = 'stopped',
  ERROR = 'error'
}
```

### Health Monitoring

Health check and monitoring interfaces.

```typescript
interface HealthCheck {
  type: 'http' | 'exec';
  interval: number;
  timeout: number;
  retries: number;
  command?: string;
  endpoint?: string;
}

interface HealthStatus {
  healthy: boolean;
  lastCheck: Date;
  message?: string;
  details?: any;
}
```

## Extension Commands

Commands available through the Podman Desktop command palette:

### Server Management Commands

```typescript
// Start a new MCP server
interface StartServerCommand {
  command: 'mcp.startServer';
  args: ServerConfig;
}

// Stop a running server
interface StopServerCommand {
  command: 'mcp.stopServer';
  args: { name: string };
}

// Get server status
interface GetStatusCommand {
  command: 'mcp.getStatus';
  args: { name: string };
}

// List all servers
interface ListServersCommand {
  command: 'mcp.listServers';
  args: void;
}
```

## Events

Events emitted by the extension:

```typescript
interface ServerEvent {
  type: 'server';
  action: 'started' | 'stopped' | 'error';
  server: Server;
  timestamp: Date;
  details?: any;
}

interface HealthEvent {
  type: 'health';
  server: string;
  status: HealthStatus;
  timestamp: Date;
}
```

## Configuration

Extension configuration schema:

```typescript
interface ExtensionConfig {
  servers: {
    [key: string]: ServerConfig;
  };
  defaultConfig: Partial<ServerConfig>;
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    file?: string;
  };
  security: {
    tlsEnabled: boolean;
    certPath?: string;
    keyPath?: string;
  };
}
```

## Error Handling

Common error types and handling:

```typescript
class MCPError extends Error {
  constructor(message: string, code: string, details?: any);
  
  code: string;
  details?: any;
}

enum ErrorCodes {
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  SERVER_ERROR = 'SERVER_ERROR',
  INVALID_CONFIG = 'INVALID_CONFIG',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND'
}
```

## Usage Examples

### Starting a Server

```typescript
const client = new MCPClient({
  host: 'localhost',
  port: 3000
});

await client.connect();

await client.startServer({
  name: 'test-server',
  image: 'ghcr.io/sparesparrow/podman-desktop-extension-mcp:1.0.0',
  port: 3001,
  capabilities: {
    resources: true,
    tools: true,
    prompts: true,
    logging: true
  }
});
```

### Health Monitoring

```typescript
const healthCheck: HealthCheck = {
  type: 'http',
  interval: 5000,
  timeout: 1000,
  retries: 3,
  endpoint: '/health'
};

client.on('health', (event: HealthEvent) => {
  console.log(`Server ${event.server} health: ${event.status.healthy}`);
});
```

## Additional Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Podman Desktop Extension API](https://podman-desktop.io/docs/extensions/api)
- [MCP Protocol Specification](https://modelcontextprotocol.io/docs/) 