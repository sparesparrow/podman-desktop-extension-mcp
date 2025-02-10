import { MCPTransport } from '../interfaces/mcp-transport';
import { MCPServerConfig } from '../types/mcp-types';

export abstract class PodmanService {
  constructor(protected transport: MCPTransport) {}

  abstract checkPodmanInstallation(): Promise<boolean>;
  abstract pullImage(image: string): Promise<void>;
  abstract startContainer(name: string, image: string, port: number): Promise<void>;
  abstract stopContainer(name: string): Promise<void>;
  abstract removeContainer(name: string): Promise<void>;
  abstract getContainerStatus(name: string): Promise<string>;
  abstract checkContainerExists(name: string): Promise<boolean>;
  abstract listContainers(labels?: Record<string, string>): Promise<string[]>;
  abstract buildContainerCommand(config: MCPServerConfig): string;
  abstract runContainer(config: MCPServerConfig): Promise<string>;
} 