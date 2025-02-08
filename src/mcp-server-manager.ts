import * as extensionApi from '@podman-desktop/api';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface MCPServerConfig {
  name: string;
  image: string;
  port: number;
  capabilities?: {
    resources?: boolean;
    tools?: boolean;
    prompts?: boolean;
    logging?: boolean;
  };
  readinessProbe?: {
    initialDelaySeconds?: number;
    periodSeconds?: number;
    timeoutSeconds?: number;
    successThreshold?: number;
    failureThreshold?: number;
    exec?: {
      command: string[];
    };
    httpGet?: {
      path: string;
      port: number;
    };
  };
  api?: {
    port: number;
    host?: string;
    basePath?: string;
    tls?: {
      enabled: boolean;
      cert?: string;
      key?: string;
    };
  };
}

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
        throw new Error(`Server ${config.name} already exists`);
      }

      // Prepare container run command with port mappings
      let runCommand = `podman run -d --name ${config.name}`;
      
      // Add main port mapping
      runCommand += ` -p ${config.port}:${config.port}`;
      
      // Add API port mapping if configured
      if (config.api?.port) {
        runCommand += ` -p ${config.api.port}:${config.api.port}`;
      }
      
      // Add image name
      runCommand += ` ${config.image}`;

      // Start the container
      const { stdout } = await execAsync(runCommand);
      if (!stdout.trim()) {
        this.provider.updateStatus('error');
        throw new Error('Failed to start server: no container ID returned');
      }

      this.servers.set(config.name, config);
      
      // Start health checking if configured
      if (config.readinessProbe) {
        await this.startHealthCheck(config.name, config);
        const isReady = await this.checkReadiness(config.name, config);
        if (!isReady) {
          this.provider.updateStatus('error');
          throw new Error('Server failed initial readiness check');
        }
        this.provider.updateStatus('ready');
      } else {
        this.provider.updateStatus('started');
      }

      extensionApi.window.showInformationMessage(
        `MCP server ${config.name} started with container ID: ${stdout.trim()}`
      );
    } catch (error) {
      this.provider.updateStatus('error');
      throw error;
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