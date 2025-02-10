import type { Transport, ToolDefinition } from '@modelcontextprotocol/sdk';
import { MCPServerTransport, MCPTransportError } from '../types/mcp-types';
import { transportRegistry } from '../transport/transport-factory';

export interface MCPClient {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  send(message: any): Promise<void>;
  receive(): Promise<any>;
  listTools(): Promise<ToolDefinition[]>;
  callTool(name: string, args: any): Promise<any>;
  listResources(): Promise<string[]>;
  readResource<T>(uri: string): Promise<T>;
  listPrompts(): Promise<string[]>;
  getPrompt<T>(name: string): Promise<T>;
  isConnected(): boolean;
}

export class TypedMCPClient implements MCPClient {
  private transport: Transport;
  private connected = false;

  constructor(config: MCPServerTransport) {
    this.transport = transportRegistry.create(config);
  }

  async connect(): Promise<void> {
    if (this.connected) {
      throw new MCPTransportError('Client is already connected');
    }
    await this.transport.connect();
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    if (!this.connected) {
      throw new MCPTransportError('Client is not connected');
    }
    await this.transport.disconnect();
    this.connected = false;
  }

  async send(message: any): Promise<void> {
    if (!this.connected) {
      throw new MCPTransportError('Client is not connected');
    }
    await this.transport.send(message);
  }

  async receive(): Promise<any> {
    if (!this.connected) {
      throw new MCPTransportError('Client is not connected');
    }
    return this.transport.receive();
  }

  async listTools(): Promise<ToolDefinition[]> {
    if (!this.connected) {
      throw new MCPTransportError('Client is not connected');
    }
    const response = await this.transport.receive() as { tools: ToolDefinition[] };
    return response.tools || [];
  }

  async callTool(name: string, args: any): Promise<any> {
    if (!this.connected) {
      throw new MCPTransportError('Client is not connected');
    }
    await this.transport.send({ method: 'callTool', params: { name, args } });
    const response = await this.transport.receive() as { result: any };
    return response.result;
  }

  async listResources(): Promise<string[]> {
    if (!this.connected) {
      throw new MCPTransportError('Client is not connected');
    }
    await this.transport.send({ method: 'listResources' });
    const response = await this.transport.receive() as { resources: string[] };
    return response.resources || [];
  }

  async readResource<T>(uri: string): Promise<T> {
    if (!this.connected) {
      throw new MCPTransportError('Client is not connected');
    }
    await this.transport.send({ method: 'readResource', params: { uri } });
    const response = await this.transport.receive() as { resource: T };
    return response.resource;
  }

  async listPrompts(): Promise<string[]> {
    if (!this.connected) {
      throw new MCPTransportError('Client is not connected');
    }
    await this.transport.send({ method: 'listPrompts' });
    const response = await this.transport.receive() as { prompts: string[] };
    return response.prompts || [];
  }

  async getPrompt<T>(name: string): Promise<T> {
    if (!this.connected) {
      throw new MCPTransportError('Client is not connected');
    }
    await this.transport.send({ method: 'getPrompt', params: { name } });
    const response = await this.transport.receive() as { prompt: T };
    return response.prompt;
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export class MCPClientFactory {
  static createClient(config: MCPServerTransport): MCPClient {
    return new TypedMCPClient(config);
  }
}

// Remove unused interfaces and classes since we're using the transport from transport-factory 