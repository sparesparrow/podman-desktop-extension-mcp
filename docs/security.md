# Security Guide

This document outlines the security features and best practices for the MCP Server Manager extension.

## Security Architecture

### Container Security

The MCP Server Manager leverages Podman's security-focused architecture to provide:

1. **Rootless Container Execution**
   - Containers run without root privileges
   - Reduced attack surface
   - Limited system access

2. **Resource Isolation**
   - CPU and memory limits
   - Network namespace isolation
   - Storage quotas

3. **Access Control**
   - Fine-grained permission management
   - Role-based access control
   - Secure API key storage

### Data Protection

1. **API Key Management**
   - Secure storage using system keyring
   - Encrypted at rest
   - Never exposed in logs or configuration files

2. **File System Security**
   - Sandboxed file system access
   - Read-only root filesystem
   - Temporary storage cleanup

3. **Communication Security**
   - TLS encryption for all network traffic
   - Certificate validation
   - Secure WebSocket connections

## Best Practices

### Configuration Security

1. **Server Configuration**
   ```typescript
   {
     // Use specific version tags instead of 'latest'
     image: 'ghcr.io/sparesparrow/mcp-server-manager-extension:1.0.0',
     // Avoid exposing unnecessary ports
     port: 3000,
     // Enable only required capabilities
     capabilities: {
       resources: true,
       tools: false,
       prompts: true,
       logging: true
     }
   }
   ```

2. **Network Security**
   - Use internal networks when possible
   - Limit exposed ports
   - Enable TLS for all connections

### Operational Security

1. **Regular Updates**
   - Keep the extension updated
   - Monitor security advisories
   - Apply security patches promptly

2. **Monitoring**
   - Enable audit logging
   - Monitor container resource usage
   - Track access patterns

3. **Incident Response**
   - Document security procedures
   - Maintain backup configurations
   - Plan for container isolation

## Security Checklist

- [ ] Use specific version tags for container images
- [ ] Enable only required capabilities
- [ ] Configure resource limits
- [ ] Implement secure API key storage
- [ ] Enable TLS encryption
- [ ] Set up monitoring and logging
- [ ] Regular security updates
- [ ] Document security procedures

## Additional Resources

- [Podman Security Guide](https://docs.podman.io/en/latest/markdown/podman.1.html#security)
- [Container Security Best Practices](https://www.redhat.com/en/topics/security/container-security)
- [MCP Security Documentation](https://modelcontextprotocol.io/docs/security) 