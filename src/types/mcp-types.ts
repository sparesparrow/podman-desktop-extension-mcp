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
  command: string[];
  args?: string[];
}

export interface MCPServerHttpSseTransport extends MCPServerTransportBase {
  type: 'http-sse';
  port: number;
}

export type MCPServerTransport = MCPServerHttpSseTransport | MCPServerStdioTransport;

export interface MCPServerReadinessProbe {
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
}

export interface MCPServerConfig {
  name: string;
  image: string;
  version: string;
  transport: MCPServerTransport;
  capabilities: MCPServerCapabilities;
  readinessProbe: MCPServerReadinessProbe;
  cache?: MCPServerCache;
  optimization?: MCPServerOptimization;
}

export interface MCPServerCapabilities {
  resources: boolean;
  tools: boolean;
  prompts: boolean;
  logging: boolean;
}

export interface MCPServerCache {
  enabled: boolean;
  directory: string;
  maxSize: string;
  ttl: number;
  preloadModels: string[];
}

export interface MCPServerOptimization {
  modelCaching: boolean;
  modelCompression: boolean;
  batchProcessing: boolean;
  concurrentDownloads: number;
  useGPUIfAvailable: boolean;
}

export interface MCPServerStatus {
  name: string;
  containerStatus: string;
  port?: number;
  tools?: number;
  resources?: number;
}

export enum MCPErrorCode {
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

export class MCPServerError extends Error {
  constructor(message: string, public readonly code: MCPErrorCode = MCPErrorCode.UNKNOWN_ERROR) {
    super(message);
    this.name = 'MCPServerError';
  }
}

export class MCPTransportError extends MCPServerError {
  constructor(message: string) {
    super(message, MCPErrorCode.TRANSPORT_ERROR);
    this.name = 'MCPTransportError';
  }
}

export class MCPHealthCheckError extends MCPServerError {
  constructor(message: string) {
    super(message, MCPErrorCode.HEALTH_CHECK_ERROR);
    this.name = 'MCPHealthCheckError';
  }
} 