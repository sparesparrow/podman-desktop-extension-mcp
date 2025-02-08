import { EventEmitter } from 'events';
import {
  MCPServerTransport,
  MCPTransportError,
  MCPProtocolCapabilities,
  MCPProtocolVersion
} from '../mcp-types';
import { ProtocolNegotiator } from '../protocol/protocol-negotiator';

export interface TransportEvents {
  connected: () => void;
  disconnected: (reason?: string) => void;
  message: (data: unknown) => void;
  error: (error: Error) => void;
  protocolNegotiated: (capabilities: MCPProtocolCapabilities) => void;
}

export declare interface BaseTransport {
  on<E extends keyof TransportEvents>(event: E, listener: TransportEvents[E]): this;
  once<E extends keyof TransportEvents>(event: E, listener: TransportEvents[E]): this;
  emit<E extends keyof TransportEvents>(event: E, ...args: Parameters<TransportEvents[E]>): boolean;
}

export abstract class BaseTransport extends EventEmitter {
  protected isConnected = false;
  protected negotiatedCapabilities?: MCPProtocolCapabilities;

  constructor(protected readonly config: MCPServerTransport) {
    super();
  }

  protected abstract doConnect(): Promise<void>;
  protected abstract doDisconnect(): Promise<void>;
  protected abstract doSend(data: unknown): Promise<void>;

  async connect(): Promise<void> {
    try {
      await this.doConnect();
      await this.negotiateProtocol();
      this.isConnected = true;
      this.emit('connected');
    } catch (err) {
      this.isConnected = false;
      throw new MCPTransportError('Failed to connect', {
        error: err,
        config: this.config
      });
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.doDisconnect();
      this.isConnected = false;
      this.emit('disconnected');
    } catch (err) {
      throw new MCPTransportError('Failed to disconnect', {
        error: err,
        config: this.config
      });
    }
  }

  async send(data: unknown): Promise<void> {
    if (!this.isConnected) {
      throw new MCPTransportError('Transport not connected');
    }

    try {
      await this.doSend(data);
    } catch (err) {
      throw new MCPTransportError('Failed to send data', {
        error: err,
        data
      });
    }
  }

  protected async negotiateProtocol(): Promise<void> {
    const negotiationInfo = ProtocolNegotiator.getNegotiationInfo();
    
    // Send negotiation request
    await this.doSend({
      type: 'protocol_negotiation',
      version: negotiationInfo.version,
      minVersion: negotiationInfo.minVersion,
      capabilities: negotiationInfo.capabilities
    });

    // Wait for server response
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new MCPTransportError('Protocol negotiation timeout'));
      }, 5000);

      this.once('message', (data: unknown) => {
        clearTimeout(timeout);
        try {
          const response = this.validateNegotiationResponse(data);
          this.negotiatedCapabilities = ProtocolNegotiator.negotiateCapabilities(response.capabilities);
          this.emit('protocolNegotiated', this.negotiatedCapabilities);
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  private validateNegotiationResponse(data: unknown): {
    version: MCPProtocolVersion;
    capabilities: MCPProtocolCapabilities;
  } {
    if (!data || typeof data !== 'object') {
      throw new MCPTransportError('Invalid negotiation response format');
    }

    const response = data as Record<string, unknown>;
    if (response.type !== 'protocol_negotiation_response') {
      throw new MCPTransportError('Invalid negotiation response type');
    }

    if (!response.version || typeof response.version !== 'object') {
      throw new MCPTransportError('Missing or invalid version in negotiation response');
    }

    if (!response.capabilities || typeof response.capabilities !== 'object') {
      throw new MCPTransportError('Missing or invalid capabilities in negotiation response');
    }

    const version = response.version as MCPProtocolVersion;
    ProtocolNegotiator.validateVersion(version);

    const capabilities = response.capabilities as MCPProtocolCapabilities;
    return { version, capabilities };
  }

  getCapabilities(): MCPProtocolCapabilities | undefined {
    return this.negotiatedCapabilities;
  }

  isTransportConnected(): boolean {
    return this.isConnected;
  }
} 