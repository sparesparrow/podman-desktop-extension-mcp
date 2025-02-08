import { vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

// Consolidated mock for @podman-desktop/api
const mockPodmanDesktopApi = {
  provider: {
    createProvider: vi.fn().mockReturnValue({
      name: 'MCP Server Manager',
      id: 'mcp-server-manager',
      status: 'ready',
      updateStatus: vi.fn(),
      dispose: vi.fn()
    })
  },
  window: {
    showInformationMessage: vi.fn(),
    showErrorMessage: vi.fn(),
    createStatusBarItem: vi.fn().mockReturnValue({
      text: '',
      command: '',
      show: vi.fn(),
      hide: vi.fn(),
      dispose: vi.fn()
    }),
    createWebviewPanel: vi.fn().mockReturnValue({
      webview: {
        html: '',
        onDidReceiveMessage: vi.fn(),
        postMessage: vi.fn()
      },
      dispose: vi.fn()
    })
  },
  commands: {
    registerCommand: vi.fn().mockReturnValue({
      dispose: vi.fn()
    }),
    executeCommand: vi.fn()
  },
  workspace: {
    getConfiguration: vi.fn().mockReturnValue({
      get: vi.fn(),
      update: vi.fn()
    })
  }
};

vi.mock('@podman-desktop/api', () => mockPodmanDesktopApi);

// Mock child_process.exec and util.promisify functionality
vi.mock('child_process', () => ({
  exec: vi.fn()
}));

// Clear all mocks before each test to ensure a clean state
beforeEach(() => {
  vi.clearAllMocks();
});

export { mockPodmanDesktopApi }; 