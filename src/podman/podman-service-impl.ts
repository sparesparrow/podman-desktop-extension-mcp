import { MCPTransport } from '../interfaces/mcp-transport';
import { execWithOptions } from '../utils/exec-async';
import { MCPServerError, MCPErrorCode, MCPServerConfig } from '../types/mcp-types';
import { PodmanService } from './podman-service';

export class PodmanServiceImpl extends PodmanService {
  constructor(transport: MCPTransport) {
    super(transport);
  }

  async checkPodmanInstallation(): Promise<boolean> {
    try {
      const { stdout } = await execWithOptions('podman --version');
      return stdout.trim().startsWith('podman version');
    } catch (error) {
      throw new MCPServerError('Podman is not installed or accessible', MCPErrorCode.CONTAINER_ERROR);
    }
  }

  async pullImage(image: string): Promise<void> {
    try {
      await execWithOptions(`podman pull ${image}`);
    } catch (error) {
      throw new MCPServerError(`Failed to pull image ${image}`, MCPErrorCode.CONTAINER_ERROR);
    }
  }

  async startContainer(name: string, image: string, port: number): Promise<void> {
    try {
      await execWithOptions(
        `podman run -d --name ${name} -p ${port}:${port} ${image}`
      );
    } catch (error) {
      throw new MCPServerError(
        `Failed to start container ${name}: ${error}`,
        MCPErrorCode.CONTAINER_ERROR
      );
    }
  }

  async stopContainer(name: string): Promise<void> {
    try {
      await execWithOptions(`podman stop ${name}`);
      await execWithOptions(`podman rm ${name}`);
    } catch (error) {
      throw new MCPServerError(
        `Failed to stop container ${name}: ${error}`,
        MCPErrorCode.CONTAINER_ERROR
      );
    }
  }

  async removeContainer(name: string): Promise<void> {
    try {
      await execWithOptions(`podman rm ${name}`);
    } catch (error) {
      throw new MCPServerError(
        `Failed to remove container ${name}: ${error}`,
        MCPErrorCode.CONTAINER_ERROR
      );
    }
  }

  async getContainerStatus(name: string): Promise<string> {
    try {
      const { stdout } = await execWithOptions(
        `podman inspect -f '{{.State.Status}}' ${name}`
      );
      return stdout.trim();
    } catch (error) {
      throw new MCPServerError(
        `Failed to get container status for ${name}: ${error}`,
        MCPErrorCode.CONTAINER_ERROR
      );
    }
  }

  async checkContainerExists(name: string): Promise<boolean> {
    try {
      await execWithOptions(`podman container exists ${name}`);
      return true;
    } catch {
      return false;
    }
  }

  async listContainers(labels?: Record<string, string>): Promise<string[]> {
    try {
      let command = 'podman ps -a --format "{{.Names}}"';
      if (labels) {
        const labelFilters = Object.entries(labels)
          .map(([key, value]) => `--filter label=${key}=${value}`)
          .join(' ');
        command += ` ${labelFilters}`;
      }
      const { stdout } = await execWithOptions(command);
      return stdout.trim() ? stdout.trim().split('\n') : [];
    } catch (error) {
      throw new MCPServerError(
        `Failed to list containers: ${error}`,
        MCPErrorCode.CONTAINER_ERROR
      );
    }
  }

  buildContainerCommand(config: MCPServerConfig): string {
    const { name, image, transport } = config;
    const port = transport.port || 3000;
    return `podman run -d --name ${name} -p ${port}:${port} ${image}`;
  }

  async runContainer(config: MCPServerConfig): Promise<string> {
    try {
      const command = this.buildContainerCommand(config);
      const { stdout } = await execWithOptions(command);
      const containerId = stdout.trim();
      if (!containerId) {
        throw new MCPServerError(
          'Failed to start container: no container ID returned',
          MCPErrorCode.CONTAINER_ERROR
        );
      }
      return containerId;
    } catch (error) {
      throw new MCPServerError(
        `Failed to run container: ${error}`,
        MCPErrorCode.CONTAINER_ERROR
      );
    }
  }
} 