import { MCPServerConfig } from '../types/mcp-types';

export interface HealthCheckStrategy {
  check(config: MCPServerConfig): Promise<boolean>;
} 