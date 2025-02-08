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
<<<<<<< Updated upstream

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
=======
>>>>>>> Stashed changes

- Podman Desktop >= 1.10.0
- Podman installed and configured on your system
- Node.js >= 16.x
- pnpm >= 8.x

<<<<<<< Updated upstream
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
=======
## Quick Start

1. Install from Podman Desktop:
```bash
# Install the extension directly from the registry
podman-desktop extension install ghcr.io/sparesparrow/mcp-server-manager-extension:latest
```

2. Verify installation:
```bash
podman-desktop extension list | grep mcp-server-manager
```

## Development Setup

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

4. Run tests:
```bash
pnpm test
```

## Building and Packaging

1. Build the extension container:
```bash
# Build using the Containerfile
podman build -t ghcr.io/sparesparrow/mcp-server-manager-extension:latest .

# Or use the build script
./scripts/build.sh
```

2. Test the built container:
```bash
# Run container tests
podman run --rm ghcr.io/sparesparrow/mcp-server-manager-extension:latest test

# Verify container health
podman run --rm ghcr.io/sparesparrow/mcp-server-manager-extension:latest health
```

3. Publish the extension:
```bash
# Login to the registry
podman login ghcr.io

# Push the image
podman push ghcr.io/sparesparrow/mcp-server-manager-extension:latest

# Or use the publish script
./scripts/publish.sh
```

## Installation Methods

### Method 1: Install from Registry

```bash
# Install latest version
podman-desktop extension install ghcr.io/sparesparrow/mcp-server-manager-extension:latest

# Install specific version
podman-desktop extension install ghcr.io/sparesparrow/mcp-server-manager-extension:1.0.0
```

### Method 2: Install from Local Build

1. Build the extension:
```bash
pnpm run build
```

2. Install in Podman Desktop:
   - Open Podman Desktop
   - Go to Settings > Extensions
   - Click "Install from Directory"
   - Select the `dist` directory

### Method 3: Development Mode

1. Start the extension in watch mode:
```bash
pnpm run watch
```

2. In Podman Desktop:
   - Go to Settings > Extensions
   - Click "Development"
   - Enable "Developer Mode"
   - Click "Load Extension..." and select the project directory

## Updating the Extension

```bash
# Update from registry
podman-desktop extension update ghcr.io/sparesparrow/mcp-server-manager-extension:latest

# Or remove and reinstall
podman-desktop extension remove mcp-server-manager
podman-desktop extension install ghcr.io/sparesparrow/mcp-server-manager-extension:latest
```

## Testing

### Unit Tests
```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test src/__tests__/mcp-server-manager.test.ts

# Run tests with coverage
pnpm test --coverage
```

### Integration Tests
```bash
# Run integration tests
pnpm run test:integration

# Test with specific MCP server
pnpm run test:integration --server-image=custom-mcp-server:latest
```

### Manual Testing Checklist

1. Extension Installation:
   - [ ] Extension installs without errors
   - [ ] Extension appears in Podman Desktop extensions list
   - [ ] Extension status shows as "ready"

2. Basic Functionality:
   - [ ] Can start MCP server
   - [ ] Can stop MCP server
   - [ ] Can list running servers
   - [ ] Server health monitoring works

3. MCP Capabilities:
   - [ ] Resources capability works
   - [ ] Tools capability works
   - [ ] Prompts capability works
   - [ ] Logging capability works

4. Error Handling:
   - [ ] Handles invalid configurations gracefully
   - [ ] Shows appropriate error messages
   - [ ] Recovers from failed operations

## Troubleshooting

### Common Issues

1. Installation Fails
```bash
# Check Podman Desktop logs
podman-desktop logs

# Verify registry access
podman login ghcr.io
podman pull ghcr.io/sparesparrow/mcp-server-manager-extension:latest
```

2. Server Start Fails
```bash
# Check container logs
podman logs mcp-server

# Check server status
podman ps -a --filter name=mcp-server
```

3. Extension Not Loading
```bash
# Clear extension cache
rm -rf ~/.config/podman-desktop/extensions/mcp-server-manager
podman-desktop extension install ghcr.io/sparesparrow/mcp-server-manager-extension:latest
```

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Run tests: `pnpm test`
4. Commit your changes: `git commit -am 'Add some feature'`
5. Push to the branch: `git push origin feature/my-new-feature`
6. Submit a pull request

## License

Apache-2.0 - see [LICENSE](LICENSE) for details.

## Related

- [Model Context Protocol (MCP) Specification](https://modelcontextprotocol.io)
- [Podman Desktop](https://podman-desktop.io)
- [MCP Servers Repository](https://github.com/sparesparrow/mcp-servers)

## Documentation

Detailed documentation can be found in:
- [Architecture Overview](docs/architecture.md)
- [API Reference](docs/api.md)
- [Configuration Guide](docs/configuration.md)
- [Development Guide](docs/development.md)



>>>>>>> Stashed changes
