/// <reference types="node" />

import * as extensionApi from '@podman-desktop/api';
import { MCPServerService } from './mcp-server-service';
import { MCPServerConfig } from './types/mcp-types';

let service: MCPServerService;

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
  // Add cache configuration
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
  // Add optimization settings
  optimization: {
    modelCaching: true,
    modelCompression: true,
    batchProcessing: true,
    concurrentDownloads: 2,
    useGPUIfAvailable: true
  }
};

/**
 * Below is the "typical" extension.ts file that is used to activate and deactivate the extension.
 * this file as well as package.json are the two main files that are required to develop a Podman Desktop extension.
 */

// Activate MCP Server Manager Extension
export async function activate(context: extensionApi.ExtensionContext): Promise<void> {
  console.log('Activating MCP Server Manager Extension');
  extensionApi.window.showInformationMessage('MCP Server Manager Extension activated!');

  // Initialize the server service
  service = new MCPServerService();

  // Create provider
  const provider = extensionApi.provider.createProvider({
    name: 'MCP Server Manager',
    id: 'podman-desktop-extension-mcp',
    status: 'not-installed',
    images: {
      icon: './resources/icon.png',
      logo: './resources/logo.png'
    }
  });

  // Register commands
  const startServerCommand = extensionApi.commands.registerCommand('mcp-manager.startServer', async (config: MCPServerConfig) => {
    try {
      provider.updateStatus('starting');
      await service.startServer(config);
      provider.updateStatus('started');
      extensionApi.window.showInformationMessage(`Started MCP server: ${config.name}`);
    } catch (error) {
      provider.updateStatus('error');
      const errorMessage = error instanceof Error ? error.message : String(error);
      extensionApi.window.showErrorMessage(`Failed to start MCP server: ${errorMessage}`);
      throw error;
    }
  });

  const stopServerCommand = extensionApi.commands.registerCommand('mcp-manager.stopServer', async (name: string) => {
    try {
      provider.updateStatus('stopping');
      await service.stopServer(name);
      provider.updateStatus('stopped');
      extensionApi.window.showInformationMessage(`Stopped MCP server: ${name}`);
    } catch (error) {
      provider.updateStatus('error');
      const errorMessage = error instanceof Error ? error.message : String(error);
      extensionApi.window.showErrorMessage(`Failed to stop MCP server: ${errorMessage}`);
      throw error;
    }
  });

  // Create status bar item
  const statusBarItem = extensionApi.window.createStatusBarItem(extensionApi.StatusBarAlignLeft);
  statusBarItem.text = 'MCP Server';
  statusBarItem.command = 'mcp-manager.showMenu';
  statusBarItem.show();

  // Create webview panel
  const panel = extensionApi.window.createWebviewPanel('podman-desktop-extension-mcp', 'MCP Server Manager', {});

  // Set webview content
  panel.webview.html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>MCP Server Manager</title>
    </head>
    <body>
      <div id="root"></div>
    </body>
    </html>
  `;

  // Register disposables
  context.subscriptions.push(
    provider,
    startServerCommand,
    stopServerCommand,
    statusBarItem,
    panel,
    {
      dispose: () => service.dispose()
    }
  );

  // Set initial provider status
  provider.updateStatus('ready');

  // Register commands for managing MCP servers with unique names
  context.subscriptions.push(
    extensionApi.commands.registerCommand('mcp-manager.restartServer', restartServer)
  );

  context.subscriptions.push(
    extensionApi.commands.registerCommand('mcp-manager.listServerPrompts', listServerPrompts)
  );

  context.subscriptions.push(
    extensionApi.commands.registerCommand('mcp-manager.getServerPrompt', getServerPrompt)
  );

  // Add MCP-specific commands
  context.subscriptions.push(
    extensionApi.commands.registerCommand('mcp-manager.listServerTools', listServerTools)
  );

  context.subscriptions.push(
    extensionApi.commands.registerCommand('mcp-manager.callServerTool', callServerTool)
  );

  context.subscriptions.push(
    extensionApi.commands.registerCommand('mcp-manager.listServerResources', listServerResources)
  );

  context.subscriptions.push(
    extensionApi.commands.registerCommand('mcp-manager.readServerResource', readServerResource)
  );
}

// Deactivate the extension
export async function deactivate(): Promise<void> {
  console.log('Deactivating MCP Server Manager Extension');
  if (service) {
    await service.dispose();
  }
}

// Command: Restart MCP Server
async function restartServer() {
  try {
    extensionApi.window.showInformationMessage('Restarting MCP Server...');
    await service.stopServer(defaultConfig.name);
    await service.startServer(defaultConfig);
  } catch (error) {
    console.error('Error restarting MCP server:', error);
    extensionApi.window.showErrorMessage('Error restarting MCP server: ' + String(error));
  }
}

// Add new command implementations
async function listServerTools(serverName: string) {
  try {
    extensionApi.window.showInformationMessage(`Listing tools for MCP server ${serverName}...`);
    const tools = await service.listServerTools(serverName);
    if (tools.length > 0) {
      const toolList = tools
        .map(tool => `${tool.name}: ${tool.description || 'No description'}`)
        .join('\n');
      extensionApi.window.showInformationMessage(`Available tools:\n${toolList}`);
    } else {
      extensionApi.window.showInformationMessage('No tools available');
    }
  } catch (error) {
    console.error('Error listing server tools:', error);
    extensionApi.window.showErrorMessage('Error listing server tools: ' + String(error));
  }
}

async function callServerTool(serverName: string, toolName: string, args: Record<string, unknown>) {
  try {
    extensionApi.window.showInformationMessage(`Calling tool ${toolName} on MCP server ${serverName}...`);
    const result = await service.callServerTool(serverName, toolName, args);
    extensionApi.window.showInformationMessage(`Tool execution result: ${JSON.stringify(result)}`);
  } catch (error) {
    console.error('Error calling server tool:', error);
    extensionApi.window.showErrorMessage('Error calling server tool: ' + String(error));
  }
}

async function listServerResources(serverName: string) {
  try {
    extensionApi.window.showInformationMessage(`Listing resources for MCP server ${serverName}...`);
    const resources = await service.listServerResources(serverName);
    if (resources.length > 0) {
      const resourceList = resources
        .map(resource => `${resource.name}: ${resource.uri}`)
        .join('\n');
      extensionApi.window.showInformationMessage(`Available resources:\n${resourceList}`);
    } else {
      extensionApi.window.showInformationMessage('No resources available');
    }
  } catch (error) {
    console.error('Error listing server resources:', error);
    extensionApi.window.showErrorMessage('Error listing server resources: ' + String(error));
  }
}

async function readServerResource(serverName: string, uri: string) {
  try {
    extensionApi.window.showInformationMessage(`Reading resource ${uri} from MCP server ${serverName}...`);
    const resource = await service.readServerResource(serverName, uri);
    extensionApi.window.showInformationMessage(`Resource content: ${JSON.stringify(resource)}`);
  } catch (error) {
    console.error('Error reading server resource:', error);
    extensionApi.window.showErrorMessage('Error reading server resource: ' + String(error));
  }
}

async function listServerPrompts(serverName: string) {
  try {
    extensionApi.window.showInformationMessage(`Listing prompts for MCP server ${serverName}...`);
    const prompts = await service.listServerPrompts(serverName);
    if (prompts.length > 0) {
      const promptList = prompts
        .map(prompt => `${prompt.name}: ${prompt.description || 'No description'}`)
        .join('\n');
      extensionApi.window.showInformationMessage(`Available prompts:\n${promptList}`);
    } else {
      extensionApi.window.showInformationMessage('No prompts available');
    }
  } catch (error) {
    console.error('Error listing server prompts:', error);
    extensionApi.window.showErrorMessage('Error listing server prompts: ' + String(error));
  }
}

async function getServerPrompt(serverName: string, promptName: string) {
  try {
    extensionApi.window.showInformationMessage(`Getting prompt ${promptName} from MCP server ${serverName}...`);
    const prompt = await service.getServerPrompt(serverName, promptName);
    extensionApi.window.showInformationMessage(`Prompt content: ${JSON.stringify(prompt)}`);
  } catch (error) {
    console.error('Error getting server prompt:', error);
    extensionApi.window.showErrorMessage('Error getting server prompt: ' + String(error));
  }
}
