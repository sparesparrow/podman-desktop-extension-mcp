/// <reference types="node" />

import * as extensionApi from '@podman-desktop/api';
import { MCPServerManager } from './interfaces/mcp-server-manager';
import { MCPServerServiceImpl } from './mcp-server-service-impl';
import { CommandRegistrar } from './command-registrar';
import { MCPServerTransport } from './types/mcp-types';

let service: MCPServerManager;

// Default transport configuration
const defaultTransport: MCPServerTransport = {
  type: 'http-sse',
  port: 3000,
  host: 'localhost',
  basePath: '/api/v1'
};

// Activate MCP Server Manager Extension
export function activate(context: extensionApi.ExtensionContext): void {
  console.log('Activating MCP Server Manager Extension');
  extensionApi.window.showInformationMessage('MCP Server Manager Extension activated!');

  // Create service instance with default transport
  service = new MCPServerServiceImpl(defaultTransport);

  // Register commands using the CommandRegistrar
  const commandRegistrar = new CommandRegistrar(service);
  commandRegistrar.registerCommands(context);
}

// Deactivate the extension
export function deactivate(): void {
  console.log('Deactivating MCP Server Manager Extension');
  if (service) {
    service.dispose();
  }
}
