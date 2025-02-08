export interface MCPServerCapabilities {
  resources?: boolean;
  tools?: boolean;
  prompts?: boolean;
  logging?: boolean;
}

export interface MCPServerTLS {
  enabled: boolean;
  cert?: string;
  key?: string;
  ca?: string;
  rejectUnauthorized?: boolean;
}

export interface MCPServerTransportBase {
  host?: string;
  port?: number;
  basePath?: string;
  tls?: MCPServerTLS;
  compression?: 'gzip' | 'brotli';
  keepAlive?: number;
}

export interface MCPServerStdioTransport extends MCPServerTransportBase {
  type: 'stdio';
  command?: string[];
  args?: string[];
}

export interface MCPServerHttpSseTransport extends MCPServerTransportBase {
  type: 'http-sse';
  port: number;
}

export type MCPServerTransport = MCPServerStdioTransport | MCPServerHttpSseTransport;

export interface MCPServerReadinessProbe {
  initialDelaySeconds?: number;
  periodSeconds?: number;
  failureThreshold?: number;
  exec?: {
    command: string[];
  };
  httpGet?: {
    path: string;
    port: number;
  };
}

export interface MCPServerCache {
  enabled: boolean;
  directory: string;
  maxSize: string;
  ttl: number;
  preloadModels?: string[];
}

export interface MCPServerOptimization {
  modelCaching: boolean;
  modelCompression: boolean;
  batchProcessing: boolean;
  concurrentDownloads: number;
  useGPUIfAvailable: boolean;
}

export interface MCPServerConfig {
  name: string;
  image: string;
  version: string;
  transport: MCPServerTransport;
  capabilities?: MCPServerCapabilities;
  readinessProbe?: MCPServerReadinessProbe;
  cache?: MCPServerCache;
  optimization?: MCPServerOptimization;
}

export interface MCPServerStatus {
  name: string;
  containerStatus: string;
  port?: number;
  tools?: number;
  resources?: number;
}

export class MCPServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MCPServerError';
  }
}

export class MCPTransportError extends MCPServerError {
  constructor(message: string) {
    super(message);
    this.name = 'MCPTransportError';
  }
}

export class MCPHealthCheckError extends MCPServerError {
  constructor(message: string) {
    super(message);
    this.name = 'MCPHealthCheckError';
  }
} 