import { PodmanService } from './podman-service';
import { MCPServerConfig, MCPServerError, MCPErrorCode } from '../types/mcp-types';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class PodmanServiceImpl implements PodmanService {
  async runContainer(config: MCPServerConfig): Promise<string> {
    const runCommand = this.buildContainerCommand(config);
    try {
      const { stdout } = await execAsync(runCommand);
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
        `Failed to start container: ${error}`,
        MCPErrorCode.CONTAINER_ERROR
      );
    }
  }

  async stopContainer(name: string): Promise<void> {
    try {
      await execAsync(`podman stop ${name}`);
    } catch (error) {
      throw new MCPServerError(
        `Failed to stop container ${name}: ${error}`,
        MCPErrorCode.CONTAINER_ERROR
      );
    }
  }

  async removeContainer(name: string): Promise<void> {
    try {
      await execAsync(`podman rm ${name}`);
    } catch (error) {
      throw new MCPServerError(
        `Failed to remove container ${name}: ${error}`,
        MCPErrorCode.CONTAINER_ERROR
      );
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
      const { stdout } = await execAsync(command);
      return stdout.trim() ? stdout.trim().split('\n') : [];
    } catch (error) {
      throw new MCPServerError(
        `Failed to list containers: ${error}`,
        MCPErrorCode.CONTAINER_ERROR
      );
    }
  }

  async getContainerStatus(name: string): Promise<string> {
    try {
      const { stdout } = await execAsync(
        `podman ps -a --filter name=${name} --format "{{.Status}}"`
      );
      return stdout.trim() || 'not found';
    } catch (error) {
      throw new MCPServerError(
        `Failed to get container status: ${error}`,
        MCPErrorCode.CONTAINER_ERROR
      );
    }
  }

  async checkContainerExists(name: string): Promise<boolean> {
    try {
      const { stdout } = await execAsync(
        `podman ps -a --filter name=${name} --format {{.Names}}`
      );
      return Boolean(stdout.trim());
    } catch (error) {
      throw new MCPServerError(
        `Failed to check container existence: ${error}`,
        MCPErrorCode.CONTAINER_ERROR
      );
    }
  }

  buildContainerCommand(config: MCPServerConfig): string {
    let runCommand = `podman run -d --name ${config.name}`;
    
    // Add transport configuration
    if (config.transport.type === 'http-sse' && config.transport.port) {
      runCommand += ` -p ${config.transport.port}:${config.transport.port}`;
    }
    
    // Add environment variables for capabilities
    if (config.capabilities) {
      Object.entries(config.capabilities).forEach(([key, value]) => {
        if (value) {
          runCommand += ` -e MCP_${key.toUpperCase()}=true`;
        }
      });
    }

    // Add cache configuration
    if (config.cache?.enabled) {
      runCommand += ` -v ${config.cache.directory}:/cache`;
      runCommand += ` -e MCP_CACHE_ENABLED=true`;
      runCommand += ` -e MCP_CACHE_DIR=/cache`;
      runCommand += ` -e MCP_CACHE_MAX_SIZE=${config.cache.maxSize}`;
      runCommand += ` -e MCP_CACHE_TTL=${config.cache.ttl}`;
      
      if (config.cache.preloadModels?.length) {
        runCommand += ` -e MCP_PRELOAD_MODELS=${config.cache.preloadModels.join(',')}`;
      }
    }

    // Add optimization settings
    if (config.optimization) {
      if (config.optimization.modelCaching) {
        runCommand += ` -e MCP_MODEL_CACHING=true`;
      }
      if (config.optimization.modelCompression) {
        runCommand += ` -e MCP_MODEL_COMPRESSION=true`;
      }
      if (config.optimization.batchProcessing) {
        runCommand += ` -e MCP_BATCH_PROCESSING=true`;
      }
      if (config.optimization.concurrentDownloads) {
        runCommand += ` -e MCP_CONCURRENT_DOWNLOADS=${config.optimization.concurrentDownloads}`;
      }
      if (config.optimization.useGPUIfAvailable) {
        runCommand += ` --device nvidia.com/gpu=all`;
      }
    }
    
    // Add image and version
    runCommand += ` ${config.image}:${config.version}`;

    return runCommand;
  }
} 