import { MCPServerConfig } from '../types/mcp-types';

export interface MCPServerService {
  startServer(config: MCPServerConfig): Promise<void>;
  stopServer(name: string): Promise<void>;
  listServers(): Promise<string[]>;
  removeServer(name: string): Promise<void>;
} 