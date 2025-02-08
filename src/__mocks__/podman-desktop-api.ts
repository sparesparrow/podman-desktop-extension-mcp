import { jest } from '@jest/globals';
import type { ProviderStatus } from '@podman-desktop/api';

export interface ProviderOptions {
  name: string;
  id: string;
  status: ProviderStatus;
  images: {
    icon: string;
    logo: string;
  };
}

export interface Disposable {
  dispose(): void;
}

export interface Provider {
  updateStatus(status: ProviderStatus): void;
  onDidUpdateStatus(listener: (status: ProviderStatus) => void): Disposable;
}

export class MockProvider implements Provider {
  private listeners: ((status: ProviderStatus) => void)[] = [];

  updateStatus(status: ProviderStatus): void {
    this.listeners.forEach(listener => listener(status));
  }

  onDidUpdateStatus(listener: (status: ProviderStatus) => void): Disposable {
    this.listeners.push(listener);
    return {
      dispose: () => {
        const index = this.listeners.indexOf(listener);
        if (index !== -1) {
          this.listeners.splice(index, 1);
        }
      }
    };
  }
}

export const provider = new MockProvider();

export const window = {
  showInformationMessage: jest.fn(),
  showErrorMessage: jest.fn(),
  showWarningMessage: jest.fn(),
  createStatusBarItem: jest.fn(),
};

export const commands = {
  registerCommand: jest.fn(),
  executeCommand: jest.fn(),
};

export const workspace = {
  getConfiguration: jest.fn(),
  onDidChangeConfiguration: jest.fn(),
}; 