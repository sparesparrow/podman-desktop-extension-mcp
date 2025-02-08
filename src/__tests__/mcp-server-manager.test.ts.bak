import { MCPServerService } from '../mcp-server-service';
import { MCPServerConfig } from '../types/mcp-types';
import { jest } from '@jest/globals';

// Mock modules
jest.mock('@podman-desktop/api', () => ({
  provider: {
    createProvider: jest.fn().mockReturnValue({
      updateStatus: jest.fn(),
      dispose: jest.fn(),
      name: 'MCP Server Manager',
      id: 'mcp-server-manager',
      status: 'ready'
    })
  },
  window: {
    showInformationMessage: jest.fn(),
    showErrorMessage: jest.fn()
  }
}));

const mockExec = jest.fn();

jest.mock('child_process', () => ({
  exec: jest.fn()
}));

jest.mock('util', () => ({
  promisify: () => mockExec
}));

// Get the mocked instances
const mockProvider = jest.mocked(require('@podman-desktop/api').provider.createProvider());

describe('MCPServerService', () => {
  let service: MCPServerService;
  let mockConfig: MCPServerConfig;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MCPServerService();
    mockConfig = {
      name: 'test-server',
      image: 'test-image',
      version: 'latest',
      transport: {
        type: 'http-sse',
        port: 3000
      },
      capabilities: {
        resources: true,
        tools: true,
        prompts: true,
        logging: true
      },
      readinessProbe: {
        initialDelaySeconds: 5,
        periodSeconds: 10,
        failureThreshold: 3,
        httpGet: {
          path: '/health',
          port: 3000
        }
      }
    };
  });

  describe('startServer', () => {
    it('should start a server successfully', async () => {
      mockExec.mockResolvedValueOnce({ stdout: 'container-id', stderr: '' });

      await service.startServer(mockConfig);

      expect(mockExec).toHaveBeenCalled();
      expect(mockProvider.updateStatus).toHaveBeenCalledWith('ready');
    });

    it('should handle errors when starting a server', async () => {
      mockExec.mockRejectedValueOnce(new Error('Failed to start'));

      await expect(service.startServer(mockConfig)).rejects.toThrow();
      expect(mockProvider.updateStatus).toHaveBeenCalledWith('error');
    });
  });

  describe('stopServer', () => {
    it('should stop a server successfully', async () => {
      mockExec.mockResolvedValueOnce({ stdout: '', stderr: '' });

      await service.stopServer('test-server');

      expect(mockExec).toHaveBeenCalled();
      expect(mockProvider.updateStatus).toHaveBeenCalledWith('stopped');
    });

    it('should handle errors when stopping a server', async () => {
      mockExec.mockRejectedValueOnce(new Error('Failed to stop'));

      await expect(service.stopServer('test-server')).rejects.toThrow();
      expect(mockProvider.updateStatus).toHaveBeenCalledWith('error');
    });
  });

  describe('listServers', () => {
    it('should list servers successfully', async () => {
      mockExec.mockResolvedValueOnce({ stdout: 'server1\nserver2', stderr: '' });

      const result = await service.listServers();

      expect(result).toHaveLength(2);
      expect(mockExec).toHaveBeenCalled();
    });

    it('should handle errors when listing servers', async () => {
      mockExec.mockRejectedValueOnce(new Error('Failed to list'));

      const result = await service.listServers();

      expect(result).toEqual([]);
      expect(mockExec).toHaveBeenCalled();
    });
  });
}); 