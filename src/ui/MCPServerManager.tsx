import React, { useState, useEffect } from 'react';
import * as extensionApi from '@podman-desktop/api';

interface ServerStatus {
  name: string;
  status: string;
  port: number;
  tools: number;
  resources: number;
}

export const MCPServerManager: React.FC = () => {
  const [servers, setServers] = useState<ServerStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadServers();
  }, []);

  const loadServers = async () => {
    try {
      setLoading(true);
      const result = await extensionApi.commands.executeCommand<ServerStatus[]>('mcp-manager.listServers');
      if (result) {
        setServers(result);
      }
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to load servers: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const startServer = async () => {
    try {
      await extensionApi.commands.executeCommand('mcp-manager.startServer');
      await loadServers();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to start server: ${message}`);
    }
  };

  const stopServer = async (name: string) => {
    try {
      await extensionApi.commands.executeCommand('mcp-manager.stopServer', name);
      await loadServers();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to stop server: ${message}`);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">MCP Server Manager</h1>
        <button
          onClick={startServer}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Start New Server
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : servers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No MCP servers running. Click "Start New Server" to begin.
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {servers.map((server) => (
            <div
              key={server.name}
              className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{server.name}</h3>
                  <p className="text-sm text-gray-500">Port: {server.port}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    server.status === 'running'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {server.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-lg font-semibold">{server.tools}</div>
                  <div className="text-xs text-gray-500">Tools</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-lg font-semibold">{server.resources}</div>
                  <div className="text-xs text-gray-500">Resources</div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => stopServer(server.name)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Stop
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 