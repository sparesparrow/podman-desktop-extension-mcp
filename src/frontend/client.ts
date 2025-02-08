import type { MCPServer } from '../types';

export class MCPClient {
  private servers: MCPServer[] = [];

  async listServers(): Promise<MCPServer[]> {
    // TODO: Implement actual server listing
    return this.servers;
  }

  async addServer(server: Omit<MCPServer, 'id'>): Promise<MCPServer> {
    const newServer: MCPServer = {
      ...server,
      id: crypto.randomUUID(),
      status: 'disconnected'
    };
    this.servers.push(newServer);
    return newServer;
  }

  async connectServer(id: string): Promise<void> {
    const server = this.servers.find(s => s.id === id);
    if (!server) {
      throw new Error(`Server with id ${id} not found`);
    }
    server.status = 'connected';
  }

  async disconnectServer(id: string): Promise<void> {
    const server = this.servers.find(s => s.id === id);
    if (!server) {
      throw new Error(`Server with id ${id} not found`);
    }
    server.status = 'disconnected';
  }

  async deleteServer(id: string): Promise<void> {
    const index = this.servers.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error(`Server with id ${id} not found`);
    }
    this.servers.splice(index, 1);
  }
}

// Create and export a singleton instance
export const mcpClient = new MCPClient();
