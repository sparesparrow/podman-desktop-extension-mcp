import { MCPServerConfig, MCPHealthCheckError } from '../types/mcp-types';
import { HealthCheckStrategy } from './health-check-strategy';
import { HttpHealthCheck } from './http-health-check';
import { ExecHealthCheck } from './exec-health-check';

export class HealthCheckService {
  private strategies: Map<string, HealthCheckStrategy> = new Map();

  constructor() {
    this.registerStrategy('httpGet', new HttpHealthCheck());
    this.registerStrategy('exec', new ExecHealthCheck());
  }

  registerStrategy(type: string, strategy: HealthCheckStrategy): void {
    this.strategies.set(type, strategy);
  }

  async checkHealth(config: MCPServerConfig): Promise<boolean> {
    if (!config.readinessProbe) {
      return true;
    }

    const probeType = Object.keys(config.readinessProbe).find(key => key === 'httpGet' || key === 'exec');
    if (!probeType) {
      throw new MCPHealthCheckError('No valid health check probe type found');
    }

    const strategy = this.strategies.get(probeType);
    if (!strategy) {
      throw new MCPHealthCheckError(`Unsupported health check type: ${probeType}`);
    }

    return strategy.check(config);
  }
} 