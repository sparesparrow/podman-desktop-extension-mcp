import { jest } from '@jest/globals';

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
  createProvider: jest.fn().mockReturnValue({
    name: 'MCP Server Manager',
    id: 'mcp-server-manager',
    status: 'ready',
    updateStatus: jest.fn(),
    dispose: jest.fn()
  })
};

export const window = {
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
};

export const commands = {
  registerCommand: jest.fn().mockReturnValue({
    dispose: jest.fn()
  }),
  executeCommand: jest.fn()
};

export const workspace = {
  getConfiguration: jest.fn().mockReturnValue({
    get: jest.fn(),
    update: jest.fn()
  })
};

// Re-export everything
export default {
  provider,
  window,
  commands,
  workspace
}; 