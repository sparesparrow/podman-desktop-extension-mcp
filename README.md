# MCP Server Manager Extension for Podman Desktop

A comprehensive Podman Desktop extension that implements the Model Context Protocol (MCP), providing Linux users and others with a complete alternative to Claude Desktop. This extension enables secure deployment and management of MCP servers using Podman's container infrastructure.

## Overview

The MCP Server Manager extension leverages Podman Desktop's extension capabilities to deliver:

- Full MCP client and server implementation
- Secure container-based deployment
- Integrated AI assistant capabilities
- Native Linux support with enhanced security through Podman's rootless architecture

For detailed architecture and design information, see our [Technical Documentation](docs/diagrams.md).

## Core Features

- **Server Management**
  - Start/stop MCP servers with configurable options
  - Monitor server health and status
  - List and manage multiple server instances
  
- **MCP Client Integration**
  - Direct AI assistant interaction
  - File system integration for data management
  - Secure API key handling
  
- **Security Features**
  - Rootless container execution
  - Resource isolation
  - Access control enforcement
  - Encrypted communication

## Quick Start

### Requirements

- Podman Desktop >= 1.10.0
- Podman installed and configured
- Node.js >= 16.x
- pnpm >= 8.x

### Installation

1. Clone and setup:
```bash
git clone https://github.com/sparesparrow/mcp-server-manager-extension.git
cd mcp-server-manager-extension
pnpm install
pnpm run build
```

2. Install in Podman Desktop:
   - Open Podman Desktop
   - Go to Settings > Extensions
   - Click "Install from Directory"
   - Select the built extension directory

## Documentation

- [Architecture and Design](docs/diagrams.md) - Detailed technical architecture
- [Security Guide](docs/security.md) - Security features and best practices
- [Development Guide](docs/development.md) - Guide for contributors
- [API Reference](docs/api.md) - API documentation

## Usage

Access these commands through Podman Desktop's command palette (Ctrl/Cmd + Shift + P):

- `MCP: Start Server` - Deploy new MCP server
- `MCP: Stop Server` - Stop running server
- `MCP: Get Status` - Check server status
- `MCP: List Servers` - View all servers

### Default Configuration

```typescript
{
  name: 'mcp-server',
  image: 'ghcr.io/sparesparrow/mcp-server-manager-extension:latest',
  port: 3000,
  capabilities: {
    resources: true,
    tools: true,
    prompts: true,
    logging: true
  }
}
```

## Contributing

See our [Development Guide](docs/development.md) for details on:
- Setting up the development environment
- Running tests
- Code style guidelines
- Contribution workflow

## License

Apache-2.0 - see [LICENSE](LICENSE) for details.

## Related Projects

- [Model Context Protocol (MCP) Specification](https://modelcontextprotocol.io)
- [Podman Desktop](https://podman-desktop.io)
- [MCP Servers Repository](https://github.com/sparesparrow/mcp-servers)

![MCP Server Manager Extension](/images/5c0c0e9fe4def0b584c04d37849941da55e5e71c-2401x1000.webp)