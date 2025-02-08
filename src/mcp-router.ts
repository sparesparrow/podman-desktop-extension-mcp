import { MCPClient } from './core/mcp-client';
import { MCPServerConfig, MCPServerError } from './types/mcp-types';
import { MCPClientFactory } from './core/mcp-client';

export class MCPRouter {
  private clients: Map<string, MCPClient> = new Map();

  async connectServer(config: MCPServerConfig): Promise<void> {
    try {
      if (this.clients.has(config.name)) {
        throw new MCPServerError(`Server ${config.name} is already connected`);
      }

      const client = MCPClientFactory.createClient(config.transport);
      await client.connect();
      this.clients.set(config.name, client);
    } catch (error) {
      throw new MCPServerError(`Failed to connect to server ${config.name}: ${error}`);
    }
  }

  async disconnectServer(name: string): Promise<void> {
    const client = this.clients.get(name);
    if (!client) {
      throw new MCPServerError(`Server ${name} not found`);
    }

    try {
      await client.disconnect();
      this.clients.delete(name);
    } catch (error) {
      throw new MCPServerError(`Failed to disconnect from server ${name}: ${error}`);
    }
  }

  async listServerTools(name: string): Promise<any[]> {
    const client = this.clients.get(name);
    if (!client) {
      throw new MCPServerError(`Server ${name} not found`);
    }

    try {
      return await client.listTools();
    } catch (error) {
      throw new MCPServerError(`Failed to list tools for server ${name}: ${error}`);
    }
  }

  async callServerTool(name: string, toolName: string, args: Record<string, unknown>): Promise<any> {
    const client = this.clients.get(name);
    if (!client) {
      throw new MCPServerError(`Server ${name} not found`);
    }

    try {
      return await client.callTool(toolName, args);
    } catch (error) {
      throw new MCPServerError(`Failed to call tool ${toolName} on server ${name}: ${error}`);
    }
  }

  async listServerResources(name: string): Promise<any[]> {
    const client = this.clients.get(name);
    if (!client) {
      throw new MCPServerError(`Server ${name} not found`);
    }

    try {
      return await client.listResources();
    } catch (error) {
      throw new MCPServerError(`Failed to list resources for server ${name}: ${error}`);
    }
  }

  async readServerResource(name: string, uri: string): Promise<any> {
    const client = this.clients.get(name);
    if (!client) {
      throw new MCPServerError(`Server ${name} not found`);
    }

    try {
      return await client.readResource(uri);
    } catch (error) {
      throw new MCPServerError(`Failed to read resource ${uri} from server ${name}: ${error}`);
    }
  }

  async listServerPrompts(name: string): Promise<any[]> {
    const client = this.clients.get(name);
    if (!client) {
      throw new MCPServerError(`Server ${name} not found`);
    }

    try {
      return await client.listPrompts();
    } catch (error) {
      throw new MCPServerError(`Failed to list prompts for server ${name}: ${error}`);
    }
  }

  async getServerPrompt(name: string, promptName: string): Promise<any> {
    const client = this.clients.get(name);
    if (!client) {
      throw new MCPServerError(`Server ${name} not found`);
    }

    try {
      return await client.getPrompt(promptName);
    } catch (error) {
      throw new MCPServerError(`Failed to get prompt ${promptName} from server ${name}: ${error}`);
    }
  }

  isServerConnected(name: string): boolean {
    const client = this.clients.get(name);
    return client ? client.isConnected() : false;
  }

  getConnectedServers(): string[] {
    return Array.from(this.clients.keys());
  }

  dispose(): void {
    for (const [name, client] of this.clients.entries()) {
      try {
        client.disconnect();
      } catch (error) {
        console.error(`Failed to disconnect from server ${name}:`, error);
      }
    }
    this.clients.clear();
  }
} 