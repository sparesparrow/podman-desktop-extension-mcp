import * as extensionApi from '@podman-desktop/api';
import { MCPServerManager } from './interfaces/mcp-server-manager';
import { MCPServerConfig, MCPServerStatus, MCPServerError, MCPErrorCode, MCPServerTransport } from './types/mcp-types';
import { MCPRouter } from './mcp-router';
import { HealthCheckService } from './health/health-check.service';
import { PodmanService } from './podman/podman-service';
import { PodmanServiceImpl } from './podman/podman-service-impl';
import { TransportAdapter } from './transport/transport-adapter';

export class MCPServerServiceImpl implements MCPServerManager {
  private servers: Map<string, MCPServerStatus> = new Map();
  private provider: extensionApi.Provider;
  private healthChecks: Map<string, NodeJS.Timeout> = new Map();
  private router: MCPRouter;
  private healthCheck: HealthCheckService;
  private podmanService: PodmanService;
  private transport: TransportAdapter;

  constructor(transport: MCPServerTransport) {
    this.provider = extensionApi.provider.createProvider({
      name: 'MCP Server Manager',
      id: 'mcp-server-manager',
      status: 'ready',
      images: {
        icon: './resources/icon.png',
        logo: './resources/logo.png'
      }
    });
    this.router = new MCPRouter();
    this.healthCheck = new HealthCheckService();
    this.transport = new TransportAdapter(transport);
    this.podmanService = new PodmanServiceImpl(this.transport);
  }

  async startServer(config: MCPServerConfig): Promise<void> {
    try {
      this.provider.updateStatus('starting');
      
      // Check if container already exists
      const exists = await this.podmanService.checkContainerExists(config.name);
      if (exists) {
        throw new MCPServerError(
          `Server ${config.name} already exists`,
          MCPErrorCode.CONTAINER_ERROR
        );
      }

      // Start the container
      const containerId = await this.podmanService.runContainer(config);
      
      // Create server status
      const serverStatus: MCPServerStatus = {
        name: config.name,
        containerStatus: 'running',
        port: config.transport.port,
        tools: 0,
        resources: 0
      };
      this.servers.set(config.name, serverStatus);
      
      // Start health checking if configured
      if (config.readinessProbe) {
        await this.startHealthCheck(config.name, config);
      }

      // Connect to the MCP server
      await this.router.connectServer(config);

      this.provider.updateStatus('ready');
      extensionApi.window.showInformationMessage(
        `MCP server ${config.name} started with container ID: ${containerId}`
      );
    } catch (error) {
      this.provider.updateStatus('error');
      throw error instanceof MCPServerError ? error : new MCPServerError(
        String(error),
        MCPErrorCode.UNKNOWN_ERROR
      );
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
      await this.podmanService.stopContainer(name);
      await this.podmanService.removeContainer(name);

      this.servers.delete(name);
      this.provider.updateStatus('stopped');

      extensionApi.window.showInformationMessage(`MCP server ${name} stopped and removed`);
    } catch (error) {
      this.provider.updateStatus('error');
      throw error instanceof MCPServerError ? error : new MCPServerError(
        String(error),
        MCPErrorCode.UNKNOWN_ERROR
      );
    }
  }

  async listServers(): Promise<MCPServerStatus[]> {
    try {
      const containerNames = await this.podmanService.listContainers();
      const statuses = await Promise.all(
        containerNames.map(async (name) => {
          const status = this.servers.get(name) || {
            name,
            containerStatus: await this.podmanService.getContainerStatus(name),
            port: undefined,
            tools: 0,
            resources: 0
          };
          return status;
        })
      );
      return statuses;
    } catch (error) {
      console.error('Failed to list servers:', error);
      return [];
    }
  }

  async listServerTools(name: string): Promise<any[]> {
    return this.router.listServerTools(name);
  }

  async callServerTool(name: string, toolName: string, args: any): Promise<any> {
    return this.router.callServerTool(name, toolName, args);
  }

  async listServerResources(name: string): Promise<any[]> {
    return this.router.listServerResources(name);
  }

  async readServerResource<T>(name: string, uri: string): Promise<T> {
    return this.router.readServerResource(name, uri);
  }

  async listServerPrompts(name: string): Promise<any[]> {
    return this.router.listServerPrompts(name);
  }

  async getServerPrompt<T>(name: string, promptName: string): Promise<T> {
    return this.router.getServerPrompt(name, promptName);
  }

  isServerConnected(name: string): boolean {
    return this.router.isServerConnected(name);
  }

  getConnectedServers(): string[] {
    return this.router.getConnectedServers();
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
      const isReady = await this.healthCheck.checkHealth(config);
      
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

  async getServerStatus(name: string): Promise<MCPServerStatus> {
    try {
      const containerStatus = await this.podmanService.getContainerStatus(name);
      return {
        name,
        containerStatus,
        port: this.servers.get(name)?.port,
        tools: this.servers.get(name)?.tools || 0,
        resources: this.servers.get(name)?.resources || 0
      };
    } catch (error) {
      return {
        name,
        containerStatus: 'stopped',
        port: undefined,
        tools: 0,
        resources: 0
      };
    }
  }
} 