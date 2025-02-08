import { MCPServerConfig, MCPHealthCheckError } from '../types/mcp-types';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class HealthCheckService {
  async checkHealth(config: MCPServerConfig): Promise<boolean> {
    const strategy = this.getCheckStrategy(config);
    if (!strategy) throw new MCPHealthCheckError('Unsupported check type');
    return strategy.check();
  }

  private getCheckStrategy(config: MCPServerConfig) {
    if (config.readinessProbe.httpGet) {
      return new HttpHealthCheck(config);
    }
    if (config.readinessProbe.exec) {
      return new ExecHealthCheck(config);
    }
    return null;
  }
}

class HttpHealthCheck {
  constructor(private config: MCPServerConfig) {}

  async check(): Promise<boolean> {
    const { path, port } = this.config.readinessProbe.httpGet!;
    try {
      const { stdout } = await execAsync(`curl -f http://localhost:${port}${path}`);
      return stdout.trim().length > 0;
    } catch (error) {
      return false;
    }
  }
}

class ExecHealthCheck {
  constructor(private config: MCPServerConfig) {}

  async check(): Promise<boolean> {
    const { command } = this.config.readinessProbe.exec!;
    try {
      await execAsync(command.join(' '));
      return true;
    } catch (error) {
      return false;
    }
  }
} 