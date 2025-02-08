import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { MCPGrpcError, MCPServerGrpcTransport } from '../mcp-types';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { BaseTransport } from './base-transport';

export class GrpcTransport extends BaseTransport {
  private client: any;
  private protoDescriptor: any;
  private service: any;
  private keepaliveTimer: NodeJS.Timeout | null = null;

  constructor(config: MCPServerGrpcTransport) {
    super(config);
  }

  protected async doConnect(): Promise<void> {
    try {
      await this.loadProtoFile();
      this.createClient();
      await this.waitForReady();
      this.setupKeepalive();
    } catch (err) {
      throw new MCPGrpcError('Failed to connect to gRPC server', {
        error: err,
        config: this.config
      });
    }
  }

  private async loadProtoFile(): Promise<void> {
    try {
      const grpcConfig = this.config as MCPServerGrpcTransport;
      const protoPath = resolve(process.cwd(), grpcConfig.protoPath);
      const packageDefinition = await protoLoader.load(protoPath, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
      });

      this.protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
      const pkg = this.protoDescriptor[grpcConfig.packageName];
      if (!pkg) {
        throw new MCPGrpcError(`Package ${grpcConfig.packageName} not found in proto file`);
      }

      this.service = pkg[grpcConfig.serviceName];
      if (!this.service) {
        throw new MCPGrpcError(`Service ${grpcConfig.serviceName} not found in package ${grpcConfig.packageName}`);
      }
    } catch (err) {
      throw new MCPGrpcError('Failed to load proto file', {
        error: err,
        protoPath: (this.config as MCPServerGrpcTransport).protoPath
      });
    }
  }

  private createClient(): void {
    const credentials = this.createCredentials();
    const grpcConfig = this.config as MCPServerGrpcTransport;
    const options: grpc.ChannelOptions = {
      'grpc.max_receive_message_length': grpcConfig.options?.maxMessageSize || -1,
      'grpc.keepalive_time_ms': grpcConfig.options?.keepaliveTime || 30000,
      'grpc.keepalive_timeout_ms': grpcConfig.options?.keepaliveTimeout || 10000,
      'grpc.keepalive_permit_without_calls': 1
    };

    this.client = new this.service(
      `${grpcConfig.host || 'localhost'}:${grpcConfig.port}`,
      credentials,
      options
    );
  }

  private createCredentials(): grpc.ChannelCredentials {
    const grpcConfig = this.config as MCPServerGrpcTransport;
    if (grpcConfig.tls?.enabled && grpcConfig.options?.credentials) {
      const { rootCerts, privateKey, certChain } = grpcConfig.options.credentials;
      return grpc.credentials.createSsl(
        rootCerts ? readFileSync(rootCerts) : undefined,
        privateKey ? readFileSync(privateKey) : undefined,
        certChain ? readFileSync(certChain) : undefined
      );
    }
    return grpc.credentials.createInsecure();
  }

  private async waitForReady(): Promise<void> {
    return new Promise((resolve, reject) => {
      const deadline = new Date();
      deadline.setSeconds(deadline.getSeconds() + 5);

      this.client.waitForReady(deadline, (error: Error | undefined) => {
        if (error) {
          reject(new MCPGrpcError('Failed to connect to gRPC server', { error }));
        } else {
          resolve();
        }
      });
    });
  }

  private setupKeepalive(): void {
    if (this.keepaliveTimer) {
      clearInterval(this.keepaliveTimer);
    }

    const grpcConfig = this.config as MCPServerGrpcTransport;
    const keepaliveTime = grpcConfig.options?.keepaliveTime || 30000;
    this.keepaliveTimer = setInterval(() => {
      this.client.waitForReady(
        new Date(Date.now() + 5000),
        (error: Error | undefined) => {
          if (error) {
            this.emit('error', new MCPGrpcError('Keepalive check failed', { error }));
          }
        }
      );
    }, keepaliveTime);
  }

  protected async doSend(data: unknown): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.client) {
        reject(new MCPGrpcError('gRPC client not initialized'));
        return;
      }

      this.client.send(data, (error: Error | null, response: unknown) => {
        if (error) {
          reject(new MCPGrpcError('gRPC call failed', { error, data }));
        } else {
          this.emit('message', response);
          resolve();
        }
      });
    });
  }

  async startStream(method: string, data: unknown): Promise<void> {
    if (!this.client || !this.client[method]) {
      throw new MCPGrpcError(`Method ${method} not found`);
    }

    const stream = this.client[method](data);

    stream.on('data', (data: unknown) => {
      this.emit('message', data);
    });

    stream.on('error', (error: Error) => {
      this.emit('error', new MCPGrpcError('Stream error', { error, method }));
    });

    stream.on('end', () => {
      this.emit('disconnected', 'Stream ended');
    });
  }

  protected async doDisconnect(): Promise<void> {
    if (this.keepaliveTimer) {
      clearInterval(this.keepaliveTimer);
      this.keepaliveTimer = null;
    }

    if (this.client) {
      this.client.close();
      this.client = null;
    }
  }
} 