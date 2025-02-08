import { jest } from '@jest/globals';

// Consolidated mock for @podman-desktop/api
const mockPodmanDesktopApi = {
  provider: {
    createProvider: jest.fn().mockReturnValue({
      name: 'MCP Server Manager',
      id: 'mcp-server-manager',
      status: 'ready',
      updateStatus: jest.fn(),
      dispose: jest.fn()
    })
  },
  window: {
    showInformationMessage: jest.fn(),
    showErrorMessage: jest.fn(),
    createStatusBarItem: jest.fn().mockReturnValue({
      text: '',
      command: '',
      show: jest.fn(),
      hide: jest.fn(),
      dispose: jest.fn()
    }),
    createWebviewPanel: jest.fn().mockReturnValue({
      webview: {
        html: '',
        onDidReceiveMessage: jest.fn(),
        postMessage: jest.fn()
      },
      dispose: jest.fn()
    })
  },
  commands: {
    registerCommand: jest.fn().mockReturnValue({
      dispose: jest.fn()
    }),
    executeCommand: jest.fn()
  },
  workspace: {
    getConfiguration: jest.fn().mockReturnValue({
      get: jest.fn(),
      update: jest.fn()
    })
  }
};

jest.mock('@podman-desktop/api', () => mockPodmanDesktopApi);

// Mock child_process.exec and util.promisify functionality
jest.mock('child_process', () => ({
  exec: jest.fn()
}));

jest.mock('util', () => ({
  promisify: jest.fn((fn) => fn)
}));

// Clear all mocks before each test to ensure a clean state
beforeEach(() => {
  jest.clearAllMocks();
});

export { mockPodmanDesktopApi }; 