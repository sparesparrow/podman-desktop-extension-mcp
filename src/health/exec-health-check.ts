import { HealthCheckStrategy } from './health-check-strategy';
import { MCPServerConfig } from '../types/mcp-types';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class ExecHealthCheck implements HealthCheckStrategy {
  async check(config: MCPServerConfig): Promise<boolean> {
    if (!config.readinessProbe?.exec) {
      return false;
    }

    const { command } = config.readinessProbe.exec;
    try {
      await execAsync(command.join(' '));
      return true;
    } catch (error) {
      return false;
    }
  }
} 