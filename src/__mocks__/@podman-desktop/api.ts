import { vi } from 'vitest';

export type ProviderStatus =
  | 'not-installed'
  | 'installed'
  | 'configured'
  | 'ready'
  | 'started'
  | 'stopped'
  | 'starting'
  | 'stopping'
  | 'error'
  | 'unknown';

export interface ProviderOptions {
  name: string;
  id: string;
  status: ProviderStatus;
  images: {
    icon: string;
    logo: string;
  };
}

export interface Provider {
  updateStatus(status: ProviderStatus): void;
  dispose(): void;
}

export const provider = {
  createProvider: vi.fn().mockReturnValue({
    name: 'MCP Server Manager',
    id: 'mcp-server-manager',
    status: 'ready',
    updateStatus: vi.fn(),
    dispose: vi.fn()
  })
};

export const window = {
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
};

export const commands = {
  registerCommand: vi.fn().mockReturnValue({
    dispose: vi.fn()
  }),
  executeCommand: vi.fn()
};

export const workspace = {
  getConfiguration: vi.fn().mockReturnValue({
    get: vi.fn(),
    update: vi.fn()
  })
};

// Re-export everything
export default {
  provider,
  window,
  commands,
  workspace
}; 