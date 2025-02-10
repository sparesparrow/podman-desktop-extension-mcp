import { Transport } from '@modelcontextprotocol/sdk';

export type MCPTransport = Transport;

export interface TransportConfig {
  type: string;
  host?: string;
  port?: number;
  path?: string;
  options?: Record<string, any>;
} 