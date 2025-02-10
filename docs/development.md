# Development Guide

## Overview

This extension is built using TypeScript and implements the Model Context Protocol (MCP) specification. It provides a bridge between Podman Desktop and MCP servers, enabling secure container-based deployment and management.

## Prerequisites

- Node.js >= 20.x
- pnpm >= 8.x
- Podman Desktop >= 1.10.0
- TypeScript knowledge
- Understanding of MCP specification

## Project Structure

```
src/
├── core/           # Core MCP client implementation
├── interfaces/     # TypeScript interfaces
├── podman/         # Podman service implementation
├── transport/      # MCP transport layer
├── types/         # TypeScript type definitions
└── extension.ts   # Extension entry point
```

## Transport Layer

The transport layer implements the MCP specification's transport requirements:

### Supported Transports

- HTTP SSE (Server-Sent Events)
  - Default transport for web-based communication
  - Supports bi-directional communication
  - Configurable host, port, and TLS settings

- STDIO
  - Used for direct process communication
  - Supports command execution with arguments
  - Useful for local development

### Transport Configuration

```typescript
interface MCPServerTransport {
  type: 'http-sse' | 'stdio';
  host?: string;
  port?: number;
  basePath?: string;
  tls?: {
    enabled: boolean;
    cert?: string;
    key?: string;
    ca?: string;
  };
}
```

## Development Workflow

1. Setup Development Environment:
```bash
# Install dependencies
pnpm install

# Start development build
pnpm run dev
```

2. Testing:
```bash
# Run unit tests
pnpm test

# Type checking
pnpm run type-check

# Linting
pnpm run lint
```

3. Building:
```bash
# Production build
pnpm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and type checking
5. Submit a pull request

### Code Style

- Follow TypeScript best practices
- Use strict type checking
- Document public APIs
- Write unit tests for new features

### Testing

- Write unit tests for new functionality
- Ensure existing tests pass
- Test both success and error cases
- Test transport layer implementations

## Debugging

1. Enable Debug Logging:
```typescript
console.debug('Detailed message');
```

2. Use VS Code Debug Configuration:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Extension",
  "program": "${workspaceFolder}/src/extension.ts",
  "outFiles": ["${workspaceFolder}/dist/**/*.js"]
}
```

## Release Process

1. Update version in package.json
2. Run full test suite
3. Create release branch
4. Build and verify extension
5. Create GitHub release
6. Publish to registries

## Documentation

- Keep README.md updated
- Document new features
- Update API documentation
- Maintain changelog

## Additional Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Podman Desktop Extension API](https://podman-desktop.io/docs/extensions/api)
- [MCP Protocol Specification](https://modelcontextprotocol.io/docs/) 