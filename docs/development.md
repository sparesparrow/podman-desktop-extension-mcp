# Development Guide

This guide provides detailed information for developers who want to contribute to the MCP Server Manager extension.

## Development Environment

### Prerequisites

- Node.js >= 16.x
- pnpm >= 8.x
- Podman Desktop >= 1.10.0
- Git
- A code editor (VS Code recommended)

### Setup

1. **Clone and Install**
   ```bash
   git clone https://github.com/sparesparrow/podman-desktop-extension-mcp.git
   cd podman-desktop-extension-mcp
   pnpm install
   ```

2. **Development Commands**
   ```bash
   # Build the extension
   pnpm run build
   
   # Watch for changes
   pnpm run watch
   
   # Run tests
   pnpm test
   
   # Lint code
   pnpm run lint
   
   # Format code
   pnpm run format
   ```

## Project Structure

```
podman-desktop-extension-mcp/
├── src/
│   ├── core/           # Core MCP client implementation
│   ├── health/         # Health check services
│   ├── settings/       # Extension settings management
│   ├── types/         # TypeScript type definitions
│   ├── ui/            # React components
│   └── transport/     # Communication layer
├── docs/              # Documentation
├── tests/            # Test files
└── scripts/          # Build and utility scripts
```

## Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/my-new-feature
   ```

2. **Development Process**
   - Write tests first (TDD approach)
   - Implement the feature
   - Ensure all tests pass
   - Update documentation

3. **Code Style**
   - Follow TypeScript best practices
   - Use ESLint and Prettier
   - Follow SOLID principles
   - Write meaningful commit messages

4. **Testing**
   - Unit tests with Vitest
   - Integration tests
   - E2E tests with Playwright
   - Test coverage requirements

## Testing Guidelines

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest';
import { MCPClient } from '../src/core/mcp-client';

describe('MCPClient', () => {
  it('should connect to server', async () => {
    const client = new MCPClient({
      port: 3000,
      host: 'localhost'
    });
    
    const result = await client.connect();
    expect(result).toBe(true);
  });
});
```

### Integration Tests

- Test server-client communication
- Verify container lifecycle
- Check resource management
- Validate security features

## Debugging

1. **Extension Debugging**
   - Use VS Code debugger
   - Enable extension logs
   - Monitor container logs

2. **Common Issues**
   - Port conflicts
   - Permission issues
   - Resource constraints

## Building for Production

1. **Production Build**
   ```bash
   pnpm run build:prod
   ```

2. **Release Process**
   - Version bump
   - Changelog update
   - Tag release
   - Build documentation

## Contributing Guidelines

1. **Pull Request Process**
   - Create feature branch
   - Write tests
   - Update documentation
   - Submit PR with description

2. **Code Review**
   - Follow review checklist
   - Address feedback
   - Maintain clean history

3. **Documentation**
   - Update relevant docs
   - Add inline comments
   - Update changelog

## Additional Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Podman Desktop Extension API](https://podman-desktop.io/docs/extensions/api)
- [MCP Protocol Specification](https://modelcontextprotocol.io/docs/) 