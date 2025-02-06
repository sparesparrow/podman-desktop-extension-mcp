# Minimal Podman Desktop Extension API Requirements

## Core Extension Interface

```typescript
interface PodmanDesktopExtension {
  // Required lifecycle methods
  activate(): void | Promise<void>;    // Called when extension is activated
  deactivate(): void | Promise<void>;    // Called when extension is deactivated
}
```

## Essential API Namespaces

### 1. Provider Registration

```typescript
export interface Provider {
  // Basic provider properties
  id: string;
  name: string;
  status: ProviderStatus;
  
  // Status management
  updateStatus(status: ProviderStatus): void;
  
  // Connection status types
  connectionStatus: ProviderConnectionStatus;
}

// Status types
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

export type ProviderConnectionStatus = 
  | 'started' 
  | 'stopped' 
  | 'starting' 
  | 'stopping' 
  | 'unknown';
```

### 2. Configuration Management

```typescript
interface Configuration {
  // Get/update extension settings
  getConfiguration(section?: string): any;
  update(section: string, value: any): Promise<void>;
}
```

### 3. Command Registration

```typescript
interface Commands {
  // Register commands that can be called from the extension
  registerCommand(command: string, callback: (...args: any[]) => any): void;
}
```

### 4. Extension Context

```typescript
interface ExtensionContext {
  // Extension lifecycle and resource management
  subscriptions: { dispose(): any }[];
  extensionPath: string;
}
```

## Minimal Extension Example

```typescript
export async function activate(context: ExtensionContext) {
  // Register as a provider
  const provider = window.registerProvider({
    id: 'my-extension',
    name: 'My Extension'
  });
  
  // Update status
  provider.updateStatus('starting');
  
  // Register commands
  context.subscriptions.push(
    commands.registerCommand('my-extension.someCommand', () => {
      // Command implementation
    })
  );
  
  provider.updateStatus('started');
}

export function deactivate() {
  // Cleanup resources
}
```

## Key Points:
1. Extensions must implement `activate()` and `deactivate()` methods.
2. Provider registration is essential for integration.
3. Status management through ProviderStatus/ProviderConnectionStatus.
4. Basic configuration and command registration capabilities.
5. Resource management through ExtensionContext.

## References:
- [Podman Desktop Extensions Documentation](https://podman-desktop.io/docs/extensions)
- [Developing Extensions Guide](https://podman-desktop.io/docs/extensions/developing)

---

### Additional Context on MCP and AI Lab Integration

- **MCP Servers** provide a standardized API for AI models to interact with external tools and data services, enabling secure, containerized operations.
- **AI Lab Applications** in Podman Desktop serve as MCP clients that utilize these backend services to deliver AI-powered functions such as ChatBot, Summarizer, and more.
- This approach ensures separation of concerns where the MCP server handles container and tool management, while AI Lab applications focus on delivering enhanced user interactions.

For a detailed example of Docker's MCP implementation, see [Docker's blog post](https://www.docker.com/blog/the-model-context-protocol-simplifying-building-ai-apps-with-anthropic-claude-desktop-and-docker/). 