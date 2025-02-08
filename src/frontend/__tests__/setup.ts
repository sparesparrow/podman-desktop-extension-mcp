import { vi } from 'vitest';

// Mock functions
const fn = () => vi.fn();

// Consolidated mock for @podman-desktop/api
const mockPodmanDesktopApi = {
  provider: {
    createProvider: fn().mockReturnValue({
      name: 'MCP Server Manager',
      id: 'mcp-server-manager',
      status: 'ready',
      updateStatus: fn(),
      dispose: fn()
    })
  },
  window: {
    showInformationMessage: fn(),
    showErrorMessage: fn(),
    createStatusBarItem: fn().mockReturnValue({
      text: '',
      command: '',
      show: fn(),
      hide: fn(),
      dispose: fn()
    }),
    createWebviewPanel: fn().mockReturnValue({
      webview: {
        html: '',
        onDidReceiveMessage: fn(),
        postMessage: fn()
      },
      dispose: fn()
    })
  },
  commands: {
    registerCommand: fn().mockReturnValue({
      dispose: fn()
    }),
    executeCommand: fn()
  },
  workspace: {
    getConfiguration: fn().mockReturnValue({
      get: fn(),
      update: fn()
    })
  }
};

// Mock the API module
vi.mock('@podman-desktop/api', () => mockPodmanDesktopApi);

// Mock child_process.exec
vi.mock('child_process', () => ({
  exec: fn()
}));

// Mock util.promisify
vi.mock('util', () => ({
  promisify: fn().mockImplementation((fn: Function) => fn)
}));

// Clear all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

export { mockPodmanDesktopApi }; 