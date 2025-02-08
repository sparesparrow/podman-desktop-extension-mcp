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

export interface MCPServerWebSocketTransport extends MCPServerTransportBase {
  type: 'websocket';
  port: number;
  path?: string;
  protocols?: string[];
  pingInterval?: number;
  pingTimeout?: number;
  maxPayloadSize?: number;
}

export interface MCPServerGrpcTransport extends MCPServerTransportBase {
  type: 'grpc';
  port: number;
  protoPath: string;
  serviceName: string;
  packageName: string;
  options?: {
    maxMessageSize?: number;
    keepaliveTime?: number;
    keepaliveTimeout?: number;
    credentials?: {
      rootCerts?: string;
      privateKey?: string;
      certChain?: string;
    };
  };
}

export type MCPServerTransport = MCPServerStdioTransport | MCPServerHttpSseTransport | MCPServerWebSocketTransport | MCPServerGrpcTransport;

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

export interface MCPServerResourceLimits {
  cpu?: string;
  memory?: string;
  gpu?: {
    count?: number;
    memory?: string;
    type?: string;
  };
  storage?: {
    size?: string;
    path?: string;
  };
  network?: {
    ingressBandwidth?: string;
    egressBandwidth?: string;
  };
}

export interface MCPServerSecurityPolicy {
  authentication: {
    type: 'none' | 'basic' | 'token' | 'oauth2';
    credentials?: {
      username?: string;
      password?: string;
      token?: string;
    };
    oauth2?: {
      clientId: string;
      clientSecret: string;
      authorizationUrl: string;
      tokenUrl: string;
      scopes: string[];
    };
  };
  authorization?: {
    roles: string[];
    permissions: string[];
  };
  networkPolicy?: {
    allowedIPs?: string[];
    allowedPorts?: number[];
    denyIPs?: string[];
    denyPorts?: number[];
  };
}

export interface MCPServerMetrics {
  enabled: boolean;
  port?: number;
  path?: string;
  labels?: Record<string, string>;
  scrapeInterval?: number;
}

export interface MCPProtocolVersion {
  major: number;
  minor: number;
  patch: number;
}

export interface MCPProtocolCapabilities {
  streaming: boolean;
  compression: boolean;
  authentication: boolean;
  encryption: boolean;
  batchProcessing: boolean;
}

export interface MCPProtocolNegotiation {
  version: MCPProtocolVersion;
  minVersion: MCPProtocolVersion;
  capabilities: MCPProtocolCapabilities;
}

export interface MCPServerConfig {
  name: string;
  image: string;
  version: string;
  protocolVersion: MCPProtocolVersion;
  minProtocolVersion?: MCPProtocolVersion;
  transport: MCPServerTransport;
  capabilities?: MCPServerCapabilities;
  protocolCapabilities?: MCPProtocolCapabilities;
  readinessProbe?: MCPServerReadinessProbe;
  cache?: MCPServerCache;
  optimization?: MCPServerOptimization;
  resourceLimits?: MCPServerResourceLimits;
  securityPolicy?: MCPServerSecurityPolicy;
  metrics?: MCPServerMetrics;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
  env?: Record<string, string>;
  volumes?: Array<{
    name: string;
    mountPath: string;
    hostPath?: string;
    persistent?: boolean;
  }>;
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
  constructor(
    message: string,
    public readonly code: MCPErrorCode = MCPErrorCode.UNKNOWN_ERROR,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'MCPServerError';
  }
}

export class MCPTransportError extends MCPServerError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, MCPErrorCode.TRANSPORT_ERROR, details);
    this.name = 'MCPTransportError';
  }
}

export class MCPHealthCheckError extends MCPServerError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, MCPErrorCode.HEALTH_CHECK_ERROR, details);
    this.name = 'MCPHealthCheckError';
  }
}

export class MCPWebSocketError extends MCPTransportError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, { ...details, transportType: 'websocket' });
    this.name = 'MCPWebSocketError';
  }
}

export class MCPGrpcError extends MCPTransportError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, { ...details, transportType: 'grpc' });
    this.name = 'MCPGrpcError';
  }
}

export class MCPProtocolError extends MCPServerError {
  constructor(
    message: string,
    public readonly serverVersion: MCPProtocolVersion,
    public readonly clientVersion: MCPProtocolVersion,
    details?: Record<string, unknown>
  ) {
    super(message, MCPErrorCode.PROTOCOL_ERROR, {
      ...details,
      serverVersion,
      clientVersion
    });
    this.name = 'MCPProtocolError';
  }
} 