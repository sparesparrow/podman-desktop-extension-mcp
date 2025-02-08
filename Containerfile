FROM node:18-alpine

# Install pnpm globally
RUN npm install -g pnpm

# Create extension directory
WORKDIR /extension

# Copy files
COPY . .

# Install dependencies and build
RUN pnpm install --frozen-lockfile && \
    pnpm run build

# Add metadata
LABEL org.opencontainers.image.title="MCP Server Manager Extension"
LABEL org.opencontainers.image.description="A Podman Desktop extension for managing Model Context Protocol (MCP) servers"
LABEL org.opencontainers.image.vendor="sparesparrow"
LABEL org.opencontainers.image.source="https://github.com/sparesparrow/mcp-server-manager-extension"
LABEL org.opencontainers.image.licenses="Apache-2.0"
LABEL io.podman-desktop.api.version=">= 1.10.0"
LABEL io.podman-desktop.extension="true"
LABEL io.podman-desktop.extension.icon="/extension/resources/icon.png"

# Command to verify extension
CMD ["pnpm", "test"]