declare module '@modelcontextprotocol/sdk' {
  export interface Transport {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    send(message: unknown): Promise<void>;
    receive(): Promise<unknown>;
  }

  export interface StdioTransportOptions {
    command: string;
    args: string[];
  }

  export interface SSETransportOptions {
    url: string;
    tls?: {
      ca?: string;
      cert?: string;
      key?: string;
      rejectUnauthorized?: boolean;
    };
  }

  export class StdioClientTransport implements Transport {
    constructor(options: StdioTransportOptions);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    send(message: unknown): Promise<void>;
    receive(): Promise<unknown>;
  }

  export class SSEClientTransport implements Transport {
    constructor(options: SSETransportOptions);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    send(message: unknown): Promise<void>;
    receive(): Promise<unknown>;
  }

  export interface ToolDefinition {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
    returns?: Record<string, unknown>;
  }

  export interface Client {
    connect(transport: Transport): Promise<void>;
    disconnect(): Promise<void>;
    listTools(): Promise<ToolDefinition[]>;
    callTool<T>(name: string, args: Record<string, unknown>): Promise<T>;
    listResources(): Promise<string[]>;
    readResource<T>(uri: string): Promise<T>;
    listPrompts(): Promise<string[]>;
    getPrompt<T>(name: string): Promise<T>;
    isConnected(): boolean;
  }
} 