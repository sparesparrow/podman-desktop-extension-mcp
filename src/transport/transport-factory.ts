import type { Transport } from '@modelcontextprotocol/sdk';
import {
  MCPServerTransport,
  MCPTransportError,
  MCPServerWebSocketTransport,
  MCPServerGrpcTransport,
  MCPServerTLS
} from '../mcp-types';
import { WebSocketTransport } from './websocket-transport';
import { GrpcTransport } from './grpc-transport';

export interface MCPTransport extends Transport {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  send(data: unknown): Promise<void>;
  receive(): Promise<unknown>;
}

export interface TransportFactory {
  createTransport(config: MCPServerTransport): MCPTransport;
}

export abstract class BaseTransportFactory implements TransportFactory {
  abstract createTransport(config: MCPServerTransport): MCPTransport;

  protected validateTLS(tls?: MCPServerTLS): void {
    if (tls?.enabled) {
      if (!tls.cert) {
        throw new MCPTransportError('TLS certificate is required when TLS is enabled');
      }
      if (!tls.key) {
        throw new MCPTransportError('TLS private key is required when TLS is enabled');
      }
    }
  }

  protected validatePort(port?: number): void {
    if (!port) {
      throw new MCPTransportError('Port is required for transport');
    }
    if (port < 1024 || port > 65535) {
      throw new MCPTransportError('Port must be between 1024 and 65535');
    }
  }

  protected validateCompression(compression?: string): void {
    if (compression && !['gzip', 'brotli'].includes(compression)) {
      throw new MCPTransportError('Invalid compression type. Must be "gzip" or "brotli"');
    }
  }
}

export class StdioTransportFactory extends BaseTransportFactory {
  createTransport(config: MCPServerTransport): MCPTransport {
    if (config.type !== 'stdio') {
      throw new MCPTransportError('Invalid transport type for stdio factory');
    }
    return {
      connect: async () => {},
      disconnect: async () => {},
      send: async () => {},
      receive: async () => ({})
    };
  }
}

export class HttpSseTransportFactory extends BaseTransportFactory {
  createTransport(config: MCPServerTransport): MCPTransport {
    if (config.type !== 'http-sse') {
      throw new MCPTransportError('Invalid transport type for http-sse factory');
    }
    this.validatePort(config.port);
    this.validateTLS(config.tls);
    this.validateCompression(config.compression);
    return {
      connect: async () => {},
      disconnect: async () => {},
      send: async () => {},
      receive: async () => ({})
    };
  }
}

export class WebSocketTransportFactory extends BaseTransportFactory {
  createTransport(config: MCPServerTransport): MCPTransport {
    if (config.type !== 'websocket') {
      throw new MCPTransportError('Invalid transport type for websocket factory');
    }
    const wsConfig = config as MCPServerWebSocketTransport;
    this.validatePort(wsConfig.port);
    this.validateTLS(wsConfig.tls);
    this.validateCompression(wsConfig.compression);

    const wsTransport = new WebSocketTransport(wsConfig);
    return {
      connect: async () => wsTransport.connect(),
      disconnect: async () => wsTransport.disconnect(),
      send: async (data) => wsTransport.send(data),
      receive: async () => {
        return new Promise<unknown>((resolve) => {
          wsTransport.once('message', (data) => resolve(data));
        });
      }
    };
  }
}

export class GrpcTransportFactory extends BaseTransportFactory {
  createTransport(config: MCPServerTransport): MCPTransport {
    if (config.type !== 'grpc') {
      throw new MCPTransportError('Invalid transport type for gRPC factory');
    }
    const grpcConfig = config as MCPServerGrpcTransport;
    this.validatePort(grpcConfig.port);
    this.validateTLS(grpcConfig.tls);

    if (!grpcConfig.protoPath) {
      throw new MCPTransportError('Proto file path is required for gRPC transport');
    }
    if (!grpcConfig.serviceName) {
      throw new MCPTransportError('Service name is required for gRPC transport');
    }
    if (!grpcConfig.packageName) {
      throw new MCPTransportError('Package name is required for gRPC transport');
    }

    const grpcTransport = new GrpcTransport(grpcConfig);
    return {
      connect: async () => grpcTransport.connect(),
      disconnect: async () => grpcTransport.disconnect(),
      send: async (data) => {
        await grpcTransport.send('send', data);
      },
      receive: async () => {
        return new Promise<unknown>((resolve) => {
          grpcTransport.once('message', (data) => resolve(data));
        });
      }
    };
  }
}

export class TransportRegistry {
  private static instance: TransportRegistry;
  public factories = new Map<string, TransportFactory>();

  private constructor() {
    this.factories.set('stdio', new StdioTransportFactory());
    this.factories.set('http-sse', new HttpSseTransportFactory());
    this.factories.set('websocket', new WebSocketTransportFactory());
    this.factories.set('grpc', new GrpcTransportFactory());
  }

  public static getInstance(): TransportRegistry {
    if (!TransportRegistry.instance) {
      TransportRegistry.instance = new TransportRegistry();
    }
    return TransportRegistry.instance;
  }

  register(type: string, factory: TransportFactory): void {
    this.factories.set(type, factory);
  }

  create(config: MCPServerTransport): MCPTransport {
    const factory = this.factories.get(config.type);
    if (!factory) {
      throw new MCPTransportError(`Unsupported transport type: ${config.type}`);
    }
    return factory.createTransport(config);
  }
}

// Export the singleton instance
export const transportRegistry = TransportRegistry.getInstance(); 