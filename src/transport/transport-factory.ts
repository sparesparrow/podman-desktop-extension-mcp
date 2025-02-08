import type { Transport } from '@modelcontextprotocol/sdk';
import { MCPServerTransport, MCPTransportError } from '../types/mcp-types';

export interface TransportFactory {
  createTransport(config: MCPServerTransport): Transport;
}

export class StdioTransportFactory implements TransportFactory {
  createTransport(config: MCPServerTransport): Transport {
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

export class HttpSseTransportFactory implements TransportFactory {
  createTransport(config: MCPServerTransport): Transport {
    if (config.type !== 'http-sse') {
      throw new MCPTransportError('Invalid transport type for http-sse factory');
    }
    if (!config.port) {
      throw new MCPTransportError('Port is required for HTTP/SSE transport');
    }
    return {
      connect: async () => {},
      disconnect: async () => {},
      send: async () => {},
      receive: async () => ({})
    };
  }
}

const transportRegistry = new class TransportRegistry {
  public factories = new Map<string, TransportFactory>();

  constructor() {
    this.factories.set('stdio', new StdioTransportFactory());
    this.factories.set('http-sse', new HttpSseTransportFactory());
  }

  register(type: string, factory: TransportFactory): void {
    this.factories.set(type, factory);
  }

  create(config: MCPServerTransport): Transport {
    const factory = this.factories.get(config.type);
    if (!factory) {
      throw new MCPTransportError(`Unsupported transport type: ${config.type}`);
    }
    return factory.createTransport(config);
  }
}();

export { transportRegistry }; 