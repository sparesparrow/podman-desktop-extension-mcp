import * as extensionApi from '@podman-desktop/api';
import { exec } from 'child_process';
import { promisify } from 'util';
import {
  MCPServerConfig,
  MCPServerError,
  MCPErrorCode,
  MCPHealthCheckError
} from './mcp-types';

const execAsync = promisify(exec);

export class MCPServerManager {
  private servers: Map<string, MCPServerConfig> = new Map();
  private provider: extensionApi.Provider;
  private healthChecks: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.provider = extensionApi.provider.createProvider({
      name: 'MCP Server Manager',
      id: 'mcp-server-manager',
      status: 'ready',
      images: {
        icon: './icon.png',
        logo: './icon.png'
      }
    });
  }

  private async checkReadiness(name: string, config: MCPServerConfig): Promise<boolean> {
    try {
      if (config.readinessProbe?.exec) {
        const { command } = config.readinessProbe.exec;
        const { stdout } = await execAsync(command.join(' '));
        return stdout.trim().length > 0;
      }

      if (config.readinessProbe?.httpGet) {
        const { path, port } = config.readinessProbe.httpGet;
        await execAsync(`curl -f http://localhost:${port}${path}`);
        return true;
      }

      // Default to container running check
      const status = await this.getServerStatus(name);
      return status.toLowerCase().includes('up');
    } catch (error) {
      return false;
    }
  }

  private async startHealthCheck(name: string, config: MCPServerConfig): Promise<void> {
    if (!config.readinessProbe) return;

    const {
      initialDelaySeconds = 0,
      periodSeconds = 10,
      failureThreshold = 3
    } = config.readinessProbe;

    // Wait for initial delay
    await new Promise(resolve => setTimeout(resolve, initialDelaySeconds * 1000));

    let failures = 0;
    const interval = setInterval(async () => {
      const isReady = await this.checkReadiness(name, config);
      
      if (!isReady) {
        failures++;
        if (failures >= failureThreshold) {
          this.provider.updateStatus('error');
          throw new MCPHealthCheckError(
            `Server ${name} failed readiness check ${failures} times`,
            { failures, threshold: failureThreshold }
          );
        }
      } else {
        failures = 0;
        this.provider.updateStatus('ready');
      }
    }, periodSeconds * 1000);

    this.healthChecks.set(name, interval);
  }

  private buildContainerCommand(config: MCPServerConfig): string {
    let runCommand = `podman run -d --name ${config.name}`;

    // Add resource limits
    if (config.resourceLimits) {
      if (config.resourceLimits.cpu) {
        runCommand += ` --cpus=${config.resourceLimits.cpu}`;
      }
      if (config.resourceLimits.memory) {
        runCommand += ` --memory=${config.resourceLimits.memory}`;
      }
      if (config.resourceLimits.gpu) {
        runCommand += ` --device nvidia.com/gpu=${config.resourceLimits.gpu.count || 'all'}`;
        if (config.resourceLimits.gpu.memory) {
          runCommand += ` -e NVIDIA_VISIBLE_DEVICES=all`;
          runCommand += ` -e GPU_MEMORY_LIMIT=${config.resourceLimits.gpu.memory}`;
        }
      }
    }

    // Add network configuration
    if (config.transport.type === 'http-sse') {
      runCommand += ` -p ${config.transport.port}:${config.transport.port}`;
      if (config.transport.tls?.enabled) {
        runCommand += ` -v ${config.transport.tls.cert}:/certs/cert.pem:ro`;
        runCommand += ` -v ${config.transport.tls.key}:/certs/key.pem:ro`;
        if (config.transport.tls.ca) {
          runCommand += ` -v ${config.transport.tls.ca}:/certs/ca.pem:ro`;
        }
      }
    }

    // Add volumes
    if (config.volumes) {
      for (const volume of config.volumes) {
        if (volume.hostPath) {
          runCommand += ` -v ${volume.hostPath}:${volume.mountPath}`;
        } else if (volume.persistent) {
          runCommand += ` -v ${volume.name}:${volume.mountPath}`;
        }
      }
    }

    // Add environment variables
    if (config.env) {
      for (const [key, value] of Object.entries(config.env)) {
        runCommand += ` -e ${key}=${value}`;
      }
    }

    // Add labels
    if (config.labels) {
      for (const [key, value] of Object.entries(config.labels)) {
        runCommand += ` -l ${key}=${value}`;
      }
    }

    // Add metrics port if enabled
    if (config.metrics?.enabled && config.metrics.port) {
      runCommand += ` -p ${config.metrics.port}:${config.metrics.port}`;
    }

    // Add image and version
    runCommand += ` ${config.image}:${config.version}`;

    return runCommand;
  }

  async startServer(config: MCPServerConfig): Promise<void> {
    try {
      this.provider.updateStatus('starting');
      
      // Check if container already exists
      const { stdout: psOutput } = await execAsync(
        `podman ps -a --filter name=${config.name} --format {{.Names}}`
      );
      if (psOutput.trim()) {
        throw new MCPServerError(
          `Server ${config.name} already exists`,
          MCPErrorCode.CONTAINER_ERROR
        );
      }

      // Build and execute container run command
      const runCommand = this.buildContainerCommand(config);
      const { stdout } = await execAsync(runCommand);
      
      if (!stdout.trim()) {
        throw new MCPServerError(
          'Failed to start server: no container ID returned',
          MCPErrorCode.CONTAINER_ERROR
        );
      }

      this.servers.set(config.name, config);
      
      // Start health checking if configured
      if (config.readinessProbe) {
        await this.startHealthCheck(config.name, config);
        const isReady = await this.checkReadiness(config.name, config);
        if (!isReady) {
          throw new MCPHealthCheckError(
            'Server failed initial readiness check',
            { config }
          );
        }
        this.provider.updateStatus('ready');
      } else {
        this.provider.updateStatus('started');
      }

      extensionApi.window.showInformationMessage(
        `MCP server ${config.name} started with container ID: ${stdout.trim()}`
      );
    } catch (err: unknown) {
      this.provider.updateStatus('error');
      if (err instanceof MCPServerError) {
        throw err;
      }
      throw new MCPServerError(
        err instanceof Error ? err.message : 'Unknown error occurred',
        MCPErrorCode.UNKNOWN_ERROR,
        { originalError: err }
      );
    }
  }

  async stopServer(name: string): Promise<void> {
    try {
      this.provider.updateStatus('stopping');

      // Clear any active health checks
      const healthCheck = this.healthChecks.get(name);
      if (healthCheck) {
        clearInterval(healthCheck);
        this.healthChecks.delete(name);
      }

      // Stop and remove the container
      await execAsync(`podman stop ${name}`);
      await execAsync(`podman rm ${name}`);

      this.servers.delete(name);
      this.provider.updateStatus('stopped');

      extensionApi.window.showInformationMessage(`MCP server ${name} stopped and removed`);
    } catch (error) {
      this.provider.updateStatus('error');
      throw error;
    }
  }

  async getServerStatus(name: string): Promise<string> {
    try {
      const { stdout } = await execAsync(
        `podman ps -a --filter name=${name} --format "{{.Status}}"`
      );
      return stdout.trim() || 'not found';
    } catch (error) {
      throw error;
    }
  }

  async listServers(): Promise<string[]> {
    try {
      const { stdout } = await execAsync(
        `podman ps -a --filter name=mcp-server --format "{{.Names}}"`
      );
      return stdout.trim() ? stdout.trim().split('\n') : [];
    } catch (error) {
      console.error('Error listing servers:', error);
      return [];
    }
  }

  async checkServerHealth(name: string): Promise<boolean> {
    try {
      const status = await this.getServerStatus(name);
      return status.toLowerCase().includes('up');
    } catch (error) {
      return false;
    }
  }

  dispose(): void {
    // Clear all health checks
    for (const [name, interval] of this.healthChecks.entries()) {
      clearInterval(interval);
      this.healthChecks.delete(name);
    }
    
    // Cleanup resources
    this.provider.dispose();
  }
} 