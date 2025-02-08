import { WebSocket } from 'ws';
import { MCPWebSocketError, MCPServerWebSocketTransport } from '../mcp-types';
import { BaseTransport } from './base-transport';

export class WebSocketTransport extends BaseTransport {
  private ws: WebSocket | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 1000;

  constructor(config: MCPServerWebSocketTransport) {
    super(config);
  }

  protected async doConnect(): Promise<void> {
    try {
      const url = this.buildWebSocketUrl();
      const wsConfig = this.config as MCPServerWebSocketTransport;
      this.ws = new WebSocket(url, wsConfig.protocols, {
        maxPayload: wsConfig.maxPayloadSize,
        handshakeTimeout: 5000,
        perMessageDeflate: wsConfig.compression === 'gzip'
      });

      await this.setupWebSocketHandlers();
      
      if (wsConfig.pingInterval) {
        this.startPingInterval();
      }
    } catch (err) {
      throw new MCPWebSocketError('Failed to connect to WebSocket server', {
        url: this.buildWebSocketUrl(),
        error: err
      });
    }
  }

  private buildWebSocketUrl(): string {
    const wsConfig = this.config as MCPServerWebSocketTransport;
    const protocol = wsConfig.tls?.enabled ? 'wss' : 'ws';
    const host = wsConfig.host || 'localhost';
    const path = wsConfig.path || '';
    return `${protocol}://${host}:${wsConfig.port}${path}`;
  }

  private async setupWebSocketHandlers(): Promise<void> {
    if (!this.ws) {
      throw new MCPWebSocketError('WebSocket not initialized');
    }

    return new Promise((resolve, reject) => {
      if (!this.ws) return reject(new MCPWebSocketError('WebSocket not initialized'));

      this.ws.on('open', () => {
        this.reconnectAttempts = 0;
        resolve();
      });

      this.ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          this.emit('message', message);
        } catch (err) {
          this.emit('error', new MCPWebSocketError('Failed to parse message', {
            data: data.toString(),
            error: err
          }));
        }
      });

      this.ws.on('close', (code: number, reason: string) => {
        this.emit('disconnected', reason);
        this.handleReconnect();
      });

      this.ws.on('error', (error: Error) => {
        this.emit('error', new MCPWebSocketError('WebSocket error', { error }));
      });

      this.ws.on('ping', () => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.pong();
        }
      });
    });
  }

  private startPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    const wsConfig = this.config as MCPServerWebSocketTransport;
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.ping();
      }
    }, wsConfig.pingInterval);
  }

  private async handleReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.emit('error', new MCPWebSocketError('Max reconnection attempts reached', {
        attempts: this.reconnectAttempts
      }));
      return;
    }

    this.reconnectAttempts++;
    await new Promise(resolve => setTimeout(resolve, this.reconnectDelay * this.reconnectAttempts));
    
    try {
      await this.connect();
    } catch (err) {
      this.emit('error', new MCPWebSocketError('Reconnection failed', {
        attempt: this.reconnectAttempts,
        error: err
      }));
    }
  }

  protected async doSend(data: unknown): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new MCPWebSocketError('WebSocket not connected');
    }

    try {
      const message = JSON.stringify(data);
      await new Promise<void>((resolve, reject) => {
        this.ws?.send(message, (error: Error | undefined) => {
          if (error) reject(error);
          else resolve();
        });
      });
    } catch (err) {
      throw new MCPWebSocketError('Failed to send message', {
        data,
        error: err
      });
    }
  }

  protected async doDisconnect(): Promise<void> {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
} 