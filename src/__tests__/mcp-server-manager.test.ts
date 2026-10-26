import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { MCPServerConfig } from '../types/mcp-types';

// vi.mock factories are hoisted above the imports, so the mocks they share
// with the tests must be created with vi.hoisted.
const mocks = vi.hoisted(() => {
  const provider = { updateStatus: vi.fn(), dispose: vi.fn() };
  return {
    provider,
    createProvider: vi.fn(() => provider),
    showInformationMessage: vi.fn(),
    showErrorMessage: vi.fn(),
    execAsync: vi.fn(),
    connectServer: vi.fn(),
    disconnectServer: vi.fn(),
    isServerConnected: vi.fn(() => false),
  };
});

vi.mock('@podman-desktop/api', () => ({
  provider: { createProvider: mocks.createProvider },
  window: {
    showInformationMessage: mocks.showInformationMessage,
    showErrorMessage: mocks.showErrorMessage,
  },
}));

// The service wraps child_process.exec with util.promisify at import time.
vi.mock('util', () => ({ promisify: () => mocks.execAsync }));

vi.mock('../mcp-router', () => ({
  MCPRouter: vi.fn(() => ({
    connectServer: mocks.connectServer,
    disconnectServer: mocks.disconnectServer,
    isServerConnected: mocks.isServerConnected,
    dispose: vi.fn(),
  })),
}));

vi.mock('../health/health-check.service', () => ({
  HealthCheckService: vi.fn(() => ({ checkHealth: vi.fn(async () => true) })),
}));

import { MCPServerService } from '../mcp-server-service';

const config: MCPServerConfig = {
  name: 'test-server',
  image: 'test-image',
  version: 'latest',
  transport: { type: 'http-sse', port: 3000 },
  capabilities: { resources: true, tools: true, prompts: true, logging: true },
};

describe('MCPServerService', () => {
  let service: MCPServerService;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isServerConnected.mockReturnValue(false);
    service = new MCPServerService();
  });

  describe('startServer', () => {
    it('runs the container, connects to it and reports ready', async () => {
      mocks.execAsync
        .mockResolvedValueOnce({ stdout: '', stderr: '' }) // podman ps: no existing container
        .mockResolvedValueOnce({ stdout: 'container-id\n', stderr: '' }); // podman run

      await service.startServer(config);

      const runCommand = mocks.execAsync.mock.calls[1][0] as string;
      expect(runCommand).toContain('podman run -d --name test-server');
      expect(runCommand).toContain('-p 3000:3000');
      expect(runCommand).toContain('-e MCP_TOOLS=true');
      expect(runCommand).toContain('test-image:latest');
      expect(mocks.connectServer).toHaveBeenCalledWith(config);
      expect(mocks.provider.updateStatus).toHaveBeenLastCalledWith('ready');
      expect(mocks.showInformationMessage).toHaveBeenCalledWith(expect.stringContaining('container-id'));
    });

    it('refuses to start a server whose container already exists', async () => {
      mocks.execAsync.mockResolvedValueOnce({ stdout: 'test-server\n', stderr: '' });

      await expect(service.startServer(config)).rejects.toThrow('already exists');
      expect(mocks.execAsync).toHaveBeenCalledTimes(1);
      expect(mocks.provider.updateStatus).toHaveBeenLastCalledWith('error');
    });

    it('reports an error when podman fails', async () => {
      mocks.execAsync.mockRejectedValueOnce(new Error('podman not found'));

      await expect(service.startServer(config)).rejects.toThrow('podman not found');
      expect(mocks.provider.updateStatus).toHaveBeenLastCalledWith('error');
    });
  });

  describe('stopServer', () => {
    it('stops and removes the container', async () => {
      mocks.execAsync.mockResolvedValue({ stdout: '', stderr: '' });

      await service.stopServer('test-server');

      expect(mocks.execAsync).toHaveBeenCalledWith('podman stop test-server');
      expect(mocks.execAsync).toHaveBeenCalledWith('podman rm test-server');
      expect(mocks.provider.updateStatus).toHaveBeenLastCalledWith('stopped');
    });

    it('reports an error when stopping fails', async () => {
      mocks.execAsync.mockRejectedValueOnce(new Error('Failed to stop'));

      await expect(service.stopServer('test-server')).rejects.toThrow('Failed to stop');
      expect(mocks.provider.updateStatus).toHaveBeenLastCalledWith('error');
    });
  });

  describe('listServers', () => {
    it('returns the status of every extension container', async () => {
      mocks.execAsync
        .mockResolvedValueOnce({ stdout: 'server1\nserver2\n', stderr: '' })
        .mockResolvedValue({ stdout: 'running\n', stderr: '' });

      const result = await service.listServers();

      expect(result.map(s => s.name)).toEqual(['server1', 'server2']);
      expect(result.every(s => s.containerStatus === 'running')).toBe(true);
    });

    it('returns an empty list when podman fails', async () => {
      mocks.execAsync.mockRejectedValueOnce(new Error('Failed to list'));

      expect(await service.listServers()).toEqual([]);
    });
  });
});
