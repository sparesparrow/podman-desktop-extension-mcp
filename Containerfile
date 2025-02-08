# Package the pre-built extension
FROM scratch

# Copy pre-built assets
COPY dist/frontend /extension/frontend
COPY dist /extension/dist
COPY resources /extension/resources
COPY package.json /extension/
COPY LICENSE /extension/
COPY README.md /extension/

# Provide metadata for Podman Desktop
LABEL org.opencontainers.image.title="MCP Server Manager Extension" \
      org.opencontainers.image.description="A Podman Desktop extension for managing Model Context Protocol (MCP) servers" \
      org.opencontainers.image.vendor="sparesparrow" \
      org.opencontainers.image.source="https://github.com/sparesparrow/podman-desktop-extension-mcp" \
      org.opencontainers.image.licenses="Apache-2.0" \
      io.podman-desktop.api.version=">= 1.10.0" \
      io.podman-desktop.extension="true" \
      io.podman-desktop.extension.icon="/extension/resources/icon.png"

