import * as extensionApi from '@podman-desktop/api';
import { MCPServerManager } from './interfaces/mcp-server-manager';
import { MCPServerConfig } from './types/mcp-types';

// Default MCP server configuration
const defaultConfig: MCPServerConfig = {
  name: 'mcp-server',
  image: 'ghcr.io/sparesparrow/podman-desktop-extension-mcp',
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
  },
  cache: {
    enabled: true,
    directory: '/var/cache/mcp-models',
    maxSize: '10GB',
    ttl: 7 * 24 * 60 * 60, // 7 days in seconds
    preloadModels: [
      'ggerganov/whisper.cpp',  // For Audio to Text
      'yolov8n.pt'  // For Object Detection
    ]
  },
  optimization: {
    modelCaching: true,
    modelCompression: true,
    batchProcessing: true,
    concurrentDownloads: 2,
    useGPUIfAvailable: true
  }
};

export class CommandRegistrar {
  constructor(private serverManager: MCPServerManager) {}

  registerCommands(context: extensionApi.ExtensionContext): void {
    // Register core server management commands
    context.subscriptions.push(
      extensionApi.commands.registerCommand('mcp.startServer', async (config: MCPServerConfig = defaultConfig) => {
        try {
          await this.serverManager.startServer(config);
          extensionApi.window.showInformationMessage(`Started MCP server: ${config.name}`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          extensionApi.window.showErrorMessage(`Failed to start MCP server: ${errorMessage}`);
          throw error;
        }
      })
    );

    context.subscriptions.push(
      extensionApi.commands.registerCommand('mcp.stopServer', async (name: string) => {
        try {
          await this.serverManager.stopServer(name);
          extensionApi.window.showInformationMessage(`Stopped MCP server: ${name}`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          extensionApi.window.showErrorMessage(`Failed to stop MCP server: ${errorMessage}`);
          throw error;
        }
      })
    );

    // Register server interaction commands
    context.subscriptions.push(
      extensionApi.commands.registerCommand('mcp.listServerTools', async (name: string) => {
        return this.serverManager.listServerTools(name);
      })
    );

    context.subscriptions.push(
      extensionApi.commands.registerCommand('mcp.callServerTool', async (name: string, toolName: string, args: any) => {
        return this.serverManager.callServerTool(name, toolName, args);
      })
    );

    context.subscriptions.push(
      extensionApi.commands.registerCommand('mcp.listServerResources', async (name: string) => {
        return this.serverManager.listServerResources(name);
      })
    );

    context.subscriptions.push(
      extensionApi.commands.registerCommand('mcp.readServerResource', async (name: string, uri: string) => {
        return this.serverManager.readServerResource(name, uri);
      })
    );

    context.subscriptions.push(
      extensionApi.commands.registerCommand('mcp.listServerPrompts', async (name: string) => {
        return this.serverManager.listServerPrompts(name);
      })
    );

    context.subscriptions.push(
      extensionApi.commands.registerCommand('mcp.getServerPrompt', async (name: string, promptName: string) => {
        return this.serverManager.getServerPrompt(name, promptName);
      })
    );

    // Create status bar item
    const statusBarItem = extensionApi.window.createStatusBarItem(extensionApi.StatusBarAlignLeft);
    statusBarItem.text = 'MCP Server';
    statusBarItem.command = 'mcp.showMenu';
    statusBarItem.show();

    context.subscriptions.push(statusBarItem);
  }
} 