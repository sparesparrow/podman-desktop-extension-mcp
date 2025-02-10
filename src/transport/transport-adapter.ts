import { Transport } from '@modelcontextprotocol/sdk';
import { MCPServerTransport, MCPServerHttpSseTransport, MCPServerStdioTransport, MCPTransportError } from '../types/mcp-types';
import { EventEmitter } from 'events';

function isHttpSseTransport(transport: MCPServerTransport): transport is MCPServerHttpSseTransport {
  return transport.type === 'http-sse';
}

function isStdioTransport(transport: MCPServerTransport): transport is MCPServerStdioTransport {
  return transport.type === 'stdio';
}

export class TransportAdapter implements Transport {
  private connected = false;
  private emitter = new EventEmitter();

  constructor(private serverTransport: MCPServerTransport) {}

  async connect(): Promise<void> {
    try {
      if (this.connected) {
        throw new MCPTransportError('Transport already connected');
      }

      // Implementation depends on transport type
      if (isHttpSseTransport(this.serverTransport)) {
        await this.setupHttpSseConnection();
      } else if (isStdioTransport(this.serverTransport)) {
        await this.setupStdioConnection();
      } else {
        throw new MCPTransportError(`Unsupported transport type: ${(this.serverTransport as any).type}`);
      }

      this.connected = true;
    } catch (error) {
      throw new MCPTransportError(`Failed to connect: ${error}`);
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (!this.connected) {
        throw new MCPTransportError('Transport not connected');
      }

      // Implementation depends on transport type
      if (this.serverTransport.type === 'http-sse') {
        await this.teardownHttpSseConnection();
      } else if (this.serverTransport.type === 'stdio') {
        await this.teardownStdioConnection();
      }

      this.connected = false;
      this.emitter.removeAllListeners();
    } catch (error) {
      throw new MCPTransportError(`Failed to disconnect: ${error}`);
    }
  }

  async send(message: unknown): Promise<void> {
    if (!this.connected) {
      throw new MCPTransportError('Transport not connected');
    }
    try {
      // Implementation depends on transport type
      await this.sendMessage(message);
    } catch (error) {
      throw new MCPTransportError(`Failed to send message: ${error}`);
    }
  }

  async receive(): Promise<unknown> {
    if (!this.connected) {
      throw new MCPTransportError('Transport not connected');
    }
    return new Promise((resolve, reject) => {
      this.emitter.once('message', (message: unknown) => resolve(message));
      this.emitter.once('error', (error: Error) => reject(error));
    });
  }

  isConnected(): boolean {
    return this.connected;
  }

  private async setupHttpSseConnection(): Promise<void> {
    if (!isHttpSseTransport(this.serverTransport)) {
      throw new MCPTransportError('Invalid transport type');
    }
    
    const { host = 'localhost', port = 3000 } = this.serverTransport;
    // TODO: Implement SSE connection using the host and port
    console.log(`Setting up SSE connection to ${host}:${port}`);
  }

  private async setupStdioConnection(): Promise<void> {
    if (!isStdioTransport(this.serverTransport)) {
      throw new MCPTransportError('Invalid transport type');
    }
    // TODO: Implement STDIO connection
  }

  private async teardownHttpSseConnection(): Promise<void> {
    // Implement HTTP SSE connection teardown
  }

  private async teardownStdioConnection(): Promise<void> {
    // Implement STDIO connection teardown
  }

  private async sendMessage(message: unknown): Promise<void> {
    // Implementation depends on transport type
    if (this.serverTransport.type === 'http-sse') {
      // HTTP SSE specific send logic
    } else if (this.serverTransport.type === 'stdio') {
      // STDIO specific send logic
    }
    this.emitter.emit('message', message);
  }
} 