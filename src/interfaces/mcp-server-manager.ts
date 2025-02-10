import { MCPServerConfig, MCPServerStatus } from '../types/mcp-types';

export interface MCPServerManager {
  startServer(config: MCPServerConfig): Promise<void>;
  stopServer(name: string): Promise<void>;
  listServers(): Promise<MCPServerStatus[]>;
  getServerStatus(name: string): Promise<MCPServerStatus>;
  listServerTools(name: string): Promise<any[]>;
  callServerTool(name: string, toolName: string, args: any): Promise<any>;
  listServerResources(name: string): Promise<any[]>;
  readServerResource<T>(name: string, uri: string): Promise<T>;
  listServerPrompts(name: string): Promise<any[]>;
  getServerPrompt<T>(name: string, promptName: string): Promise<T>;
  isServerConnected(name: string): boolean;
  getConnectedServers(): string[];
  dispose(): void;
} 