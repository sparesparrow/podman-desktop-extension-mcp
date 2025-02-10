import { HealthCheckStrategy } from './health-check-strategy';
import { MCPServerConfig } from '../types/mcp-types';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class HttpHealthCheck implements HealthCheckStrategy {
  async check(config: MCPServerConfig): Promise<boolean> {
    if (!config.readinessProbe?.httpGet) {
      return false;
    }

    const { path, port } = config.readinessProbe.httpGet;
    try {
      await execAsync(`curl -f http://localhost:${port}${path}`);
      return true;
    } catch (error) {
      return false;
    }
  }
} 