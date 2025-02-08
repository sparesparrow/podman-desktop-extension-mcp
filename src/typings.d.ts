declare module '@podman-desktop/api' {
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

  export interface Provider {
    name: string;
    id: string;
    status: ProviderStatus;
    updateStatus(status: ProviderStatus): void;
    dispose(): void;
  }

  export interface ExtensionContext {
    subscriptions: { dispose(): void }[];
    extensionPath: string;
  }

  export interface WebviewView {
    webview: {
      options: {
        enableScripts: boolean;
      };
      html: string;
    };
  }

  export interface WebviewViewProvider {
    resolveWebviewView(webviewView: WebviewView): void;
  }

  export const window: {
    showInformationMessage(message: string): Promise<void>;
    showErrorMessage(message: string): Promise<void>;
    registerWebviewViewProvider(viewId: string, provider: WebviewViewProvider): { dispose(): void };
  };

  export const commands: {
    registerCommand(command: string, callback: (...args: any[]) => any): { dispose(): void };
  };

  export const workspace: {
    getConfiguration(section: string): { get<T>(key: string): T };
  };

  export const provider: {
    createProvider(options: { name: string; id: string; status?: ProviderStatus }): Provider;
  };
} 