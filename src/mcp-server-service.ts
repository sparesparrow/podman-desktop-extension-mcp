import * as extensionApi from '@podman-desktop/api';
import { exec } from 'child_process';
import { promisify } from 'util';
import { MCPServerConfig, MCPServerStatus, MCPServerError } from './types/mcp-types';
import { MCPRouter } from './mcp-router';
import { HealthCheckService } from './health/health-check.service';

const execAsync = promisify(exec);

export class MCPServerService {
  private servers: Map<string, MCPServerStatus> = new Map();
  private provider: extensionApi.Provider;
  private healthChecks: Map<string, NodeJS.Timeout> = new Map();
  private router: MCPRouter;
  private healthCheck: HealthCheckService;

  constructor() {
    this.provider = extensionApi.provider.createProvider({
      name: 'MCP Server Manager',
      id: 'mcp-server-manager',
      status: 'ready',
      images: {
        icon: './resources/icon.png',
        logo: './resources/icon.png'
      }
    });
    this.router = new MCPRouter();
    this.healthCheck = new HealthCheckService();
  }

  private async checkReadiness(name: string, config: MCPServerConfig): Promise<boolean> {
    try {
      return await this.healthCheck.checkHealth(config);
    } catch (error) {
      console.error(`Health check failed for ${name}:`, error);
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
          extensionApi.window.showErrorMessage(
            `Server ${name} failed readiness check ${failures} times`
          );
          clearInterval(interval);
          this.healthChecks.delete(name);
        }
      } else {
        failures = 0;
        this.provider.updateStatus('ready');
      }
    }, periodSeconds * 1000);

    this.healthChecks.set(name, interval);
  }

  async startServer(config: MCPServerConfig): Promise<void> {
    try {
      this.provider.updateStatus('starting');
      
      // Check if container already exists
      const { stdout: psOutput } = await execAsync(
        `podman ps -a --filter name=${config.name} --format {{.Names}}`
      );
      if (psOutput.trim()) {
        this.provider.updateStatus('error');
        throw new MCPServerError(`Server ${config.name} already exists`);
      }

      // Prepare container run command
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
        // Create cache directory if it doesn't exist
        await execAsync(`mkdir -p ${config.cache.directory}`);
        
        // Mount cache directory
        runCommand += ` -v ${config.cache.directory}:/cache`;
        runCommand += ` -e MCP_CACHE_ENABLED=true`;
        runCommand += ` -e MCP_CACHE_DIR=/cache`;
        runCommand += ` -e MCP_CACHE_MAX_SIZE=${config.cache.maxSize}`;
        runCommand += ` -e MCP_CACHE_TTL=${config.cache.ttl}`;
        
        // Add preload models if specified
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
          // Check for GPU availability
          try {
            const { stdout: gpuOutput } = await execAsync('podman info --format "{{.Host.Security.Devices}}"');
            if (gpuOutput.includes('nvidia.com/gpu')) {
              runCommand += ` --device nvidia.com/gpu=all`;
            }
          } catch (error) {
            console.warn('Failed to check GPU availability:', error);
          }
        }
      }
      
      // Add image and version
      runCommand += ` ${config.image}:${config.version}`;

      // Start the container
      const { stdout } = await execAsync(runCommand);
      if (!stdout.trim()) {
        this.provider.updateStatus('error');
        throw new MCPServerError('Failed to start server: no container ID returned');
      }

      // Create server status
      const serverStatus: MCPServerStatus = {
        name: config.name,
        containerStatus: 'running',
        port: config.transport.type === 'http-sse' ? config.transport.port : undefined,
        tools: 0,
        resources: 0
      };
      this.servers.set(config.name, serverStatus);
      
      // Start health checking if configured
      if (config.readinessProbe) {
        await this.startHealthCheck(config.name, config);
        const isReady = await this.checkReadiness(config.name, config);
        if (!isReady) {
          this.provider.updateStatus('error');
          throw new MCPServerError('Server failed initial readiness check');
        }
      }

      // Connect to the MCP server
      await this.router.connectServer(config);

      this.provider.updateStatus('ready');
      extensionApi.window.showInformationMessage(
        `MCP server ${config.name} started with container ID: ${stdout.trim()}`
      );
    } catch (error) {
      this.provider.updateStatus('error');
      throw error instanceof MCPServerError ? error : new MCPServerError(String(error));
    }
  }

  async stopServer(name: string): Promise<void> {
    try {
      this.provider.updateStatus('stopping');

      // Disconnect from MCP server
      if (this.router.isServerConnected(name)) {
        await this.router.disconnectServer(name);
      }

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
      throw error instanceof MCPServerError ? error : new MCPServerError(String(error));
    }
  }

  private async getServerStatus(name: string): Promise<MCPServerStatus> {
    try {
      const { stdout } = await execAsync(`podman container inspect ${name} --format '{{.State.Status}}'`);
      return {
        name,
        containerStatus: stdout.trim(),
        port: this.servers.get(name)?.port,
        tools: this.servers.get(name)?.tools,
        resources: this.servers.get(name)?.resources
      };
    } catch (error) {
      return {
        name,
        containerStatus: 'stopped'
      };
    }
  }

  async listServers(): Promise<MCPServerStatus[]> {
    try {
      const { stdout } = await execAsync('podman container ls --filter "io.podman-desktop.extension=true" --format "{{.Names}}"');
      const names = stdout.split('\n').filter(Boolean);
      const statuses = await Promise.all(names.map(name => this.getServerStatus(name)));
      return statuses;
    } catch (error) {
      return [];
    }
  }

  async checkServerHealth(name: string): Promise<boolean> {
    try {
      const status = await this.getServerStatus(name);
      return status?.containerStatus?.toLowerCase().includes('up') ?? false;
    } catch (error) {
      return false;
    }
  }

  // Add methods for interacting with MCP servers through the router
  async listServerTools(name: string): Promise<any[]> {
    return await this.router.listServerTools(name);
  }

  async callServerTool(name: string, toolName: string, args: Record<string, unknown>): Promise<any> {
    return await this.router.callServerTool(name, toolName, args);
  }

  async listServerResources(name: string): Promise<any[]> {
    return await this.router.listServerResources(name);
  }

  async readServerResource(name: string, uri: string): Promise<any> {
    return await this.router.readServerResource(name, uri);
  }

  async listServerPrompts(name: string): Promise<any[]> {
    return await this.router.listServerPrompts(name);
  }

  async getServerPrompt(name: string, promptName: string): Promise<any> {
    return await this.router.getServerPrompt(name, promptName);
  }

  async dispose(): Promise<void> {
    // Clear all health checks
    for (const [name, interval] of this.healthChecks.entries()) {
      clearInterval(interval);
      this.healthChecks.delete(name);
    }
    
    // Dispose of the router
    this.router.dispose();
    
    // Cleanup resources
    this.provider.dispose();
  }
} 