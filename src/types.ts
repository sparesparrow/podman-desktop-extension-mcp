export interface MCPServer {
  id: string;
  name: string;
  url: string;
  description?: string;
  status: 'connected' | 'disconnected' | 'error';
  capabilities?: {
    [key: string]: boolean;
  };
  error?: string;
}

export interface MCPServerEvent {
  type: 'connect' | 'disconnect' | 'error' | 'status-change';
  server: MCPServer;
  error?: Error;
}

export interface MCPServerManagerState {
  servers: MCPServer[];
  selectedServer: MCPServer | null;
  error: Error | null;
  isLoading: boolean;
} 