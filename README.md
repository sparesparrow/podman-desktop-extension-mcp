# MCP Server Manager Extension for Podman Desktop

A Podman Desktop extension for managing Model Context Protocol (MCP) servers. This extension allows you to easily start, stop, and monitor MCP servers using Podman containers.

## Features

- Start MCP servers with configurable options
- Stop running MCP servers
- Check server status
- List all running MCP servers
- Monitor server health
- Support for standard MCP capabilities (resources, tools, prompts, logging)

## Requirements

- Podman Desktop >= 1.10.0
- Podman installed and configured on your system
- Node.js >= 16.x
- pnpm >= 8.x

## Installation

1. Clone the repository:
```bash
git clone https://github.com/sparesparrow/mcp-server-manager-extension.git
cd mcp-server-manager-extension
```

2. Install dependencies:
```bash
pnpm install
```

3. Build the extension:
```bash
pnpm run build
```

4. Install the extension in Podman Desktop:
   - Open Podman Desktop
   - Go to Settings > Extensions
   - Click "Install from Directory"
   - Select the built extension directory

## Usage

The extension adds the following commands to Podman Desktop:

- `MCP: Start Server` - Start a new MCP server
- `MCP: Stop Server` - Stop a running MCP server
- `MCP: Get Status` - Check the status of an MCP server
- `MCP: List Servers` - List all running MCP servers

You can access these commands through the Podman Desktop command palette (Ctrl/Cmd + Shift + P).

### Configuration

The default MCP server configuration:

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

## Development

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Build the extension: `pnpm run build`
4. Watch for changes: `pnpm run watch`

### Testing

Run the test suite:

```bash
pnpm test
```

### Linting

Check code style:

```bash
pnpm run lint
```

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request

## License

Apache-2.0 - see [LICENSE](LICENSE) for details.

## Related

- [Model Context Protocol (MCP) Specification](https://modelcontextprotocol.io)
- [Podman Desktop](https://podman-desktop.io)
- [MCP Servers Repository](https://github.com/sparesparrow/mcp-servers)


![MCP Server Manager Extension](/images/5c0c0e9fe4def0b584c04d37849941da55e5e71c-2401x1000.webp)