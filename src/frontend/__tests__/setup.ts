import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { cleanup } from '@testing-library/svelte';

// Mock Podman Desktop API
vi.mock('@podman-desktop/api', () => ({
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
  }
}));

// Cleanup after each test
afterEach(() => {
  cleanup();
}); 