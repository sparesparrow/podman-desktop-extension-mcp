import { MCPServerConfig } from '../types/mcp-types';

export interface PodmanService {
  runContainer(config: MCPServerConfig): Promise<string>;
  stopContainer(name: string): Promise<void>;
  removeContainer(name: string): Promise<void>;
  listContainers(labels?: Record<string, string>): Promise<string[]>;
  getContainerStatus(name: string): Promise<string>;
  checkContainerExists(name: string): Promise<boolean>;
  buildContainerCommand(config: MCPServerConfig): string;
} 