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

## Core Concepts

### Transport Layer

The transport layer provides communication between MCP clients and servers:

```typescript
interface MCPTransport {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  send(message: unknown): Promise<void>;
  receive(): Promise<unknown>;
  isConnected(): boolean;
}
```

#### Transport Types

1. HTTP SSE Transport
```typescript
interface MCPServerHttpSseTransport {
  type: 'http-sse';
  host?: string;
  port: number;
  basePath?: string;
  tls?: MCPServerTLS;
}
```

2. STDIO Transport
```typescript
interface MCPServerStdioTransport {
  type: 'stdio';
  command: string[];
  args?: string[];
}
```

### Server Management

The MCPServerManager interface provides methods for managing MCP servers:

```typescript
interface MCPServerManager {
  startServer(config: MCPServerConfig): Promise<void>;
  stopServer(name: string): Promise<void>;
  listServers(): Promise<MCPServerStatus[]>;
  getServerStatus(name: string): Promise<MCPServerStatus>;
  listServerTools(name: string): Promise<any[]>;
  callServerTool(name: string, toolName: string, args: any): Promise<any>;
  listServerResources(name: string): Promise<any[]>;
  readServerResource<T>(name: string, uri: string): Promise<T>;
  listServerPrompts(name: string): Promise<any[]>;
  getServerPrompt<T>(name: string, promptName: string): Promise<T>;
  isServerConnected(name: string): boolean;
  getConnectedServers(): string[];
  dispose(): Promise<void>;
}
```

### Server Configuration

```typescript
interface MCPServerConfig {
  name: string;
  image: string;
  version: string;
  transport: MCPServerTransport;
  capabilities: {
    resources: boolean;
    tools: boolean;
    prompts: boolean;
    logging: boolean;
  };
  readinessProbe?: {
    initialDelaySeconds: number;
    periodSeconds: number;
    failureThreshold: number;
    httpGet?: {
      path: string;
      port: number;
    };
    exec?: {
      command: string[];
    };
  };
}
```

### Error Handling

```typescript
enum MCPErrorCode {
  INVALID_CONFIG = 'INVALID_CONFIG',
  TRANSPORT_ERROR = 'TRANSPORT_ERROR',
  HEALTH_CHECK_ERROR = 'HEALTH_CHECK_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  RESOURCE_LIMIT_ERROR = 'RESOURCE_LIMIT_ERROR',
  CONTAINER_ERROR = 'CONTAINER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PROTOCOL_ERROR = 'PROTOCOL_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

class MCPServerError extends Error {
  constructor(message: string, code: MCPErrorCode);
}
```

## Extension Commands

The extension provides the following commands:

- `mcp.startServer`: Start a new MCP server
- `mcp.stopServer`: Stop a running server
- `mcp.listServers`: List all servers
- `mcp.getServerStatus`: Get status of a specific server
- `mcp.listServerTools`: List available tools on a server
- `mcp.callServerTool`: Call a tool on a server
- `mcp.listServerResources`: List available resources
- `mcp.readServerResource`: Read a specific resource
- `mcp.listServerPrompts`: List available prompts
- `mcp.getServerPrompt`: Get a specific prompt

## Events

The extension emits the following events:

- `mcp:server-started`: When a server starts
- `mcp:server-stopped`: When a server stops
- `mcp:server-error`: When a server encounters an error
- `mcp:status-changed`: When server status changes

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

1. Starting a Server:
```typescript
const config: MCPServerConfig = {
  name: 'test-server',
  image: 'ghcr.io/example/mcp-server:latest',
  version: '1.0.0',
  transport: {
    type: 'http-sse',
    port: 3000
  },
  capabilities: {
    resources: true,
    tools: true,
    prompts: true,
    logging: true
  }
};

await service.startServer(config);
```

2. Using the Transport Layer:
```typescript
const transport = new TransportAdapter({
  type: 'http-sse',
  port: 3000,
  host: 'localhost'
});

await transport.connect();
await transport.send({ type: 'request', method: 'listTools' });
const response = await transport.receive();
await transport.disconnect();
```

3. Error Handling:
```typescript
try {
  await service.startServer(config);
} catch (error) {
  if (error instanceof MCPServerError) {
    switch (error.code) {
      case MCPErrorCode.TRANSPORT_ERROR:
        console.error('Transport error:', error.message);
        break;
      case MCPErrorCode.CONTAINER_ERROR:
        console.error('Container error:', error.message);
        break;
      default:
        console.error('Unknown error:', error.message);
    }
  }
}
```

## Configuration Reference

### Server Configuration Options

```typescript
interface ServerConfig {
  // Basic Configuration
  name: string;           // Server name
  image: string;          // Container image
  version: string;        // Version tag
  
  // Transport Configuration
  transport: MCPServerTransport;
  
  // Feature Flags
  capabilities: {
    resources: boolean;   // Enable resource access
    tools: boolean;       // Enable tool execution
    prompts: boolean;     // Enable prompt templates
    logging: boolean;     // Enable detailed logging
  };
  
  // Health Checking
  readinessProbe?: {
    initialDelaySeconds: number;
    periodSeconds: number;
    failureThreshold: number;
    httpGet?: {
      path: string;
      port: number;
    };
    exec?: {
      command: string[];
    };
  };
  
  // Resource Management
  resources?: {
    memory: string;       // Memory limit
    cpu: string;         // CPU limit
    storage: string;     // Storage limit
  };
  
  // Security
  security?: {
    runAsUser?: number;
    allowPrivilegeEscalation: boolean;
    readOnlyRootFilesystem: boolean;
  };
}
```

### Environment Variables

The following environment variables can be used to configure the extension:

- `MCP_SERVER_IMAGE`: Default server image
- `MCP_SERVER_PORT`: Default server port
- `MCP_LOG_LEVEL`: Logging level (debug, info, warn, error)
- `MCP_TRANSPORT_TYPE`: Default transport type
- `MCP_TLS_ENABLED`: Enable TLS for HTTP transport
- `MCP_CACHE_DIR`: Cache directory path

## Additional Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Podman Desktop Extension API](https://podman-desktop.io/docs/extensions/api)
- [MCP Protocol Specification](https://modelcontextprotocol.io/docs/) 