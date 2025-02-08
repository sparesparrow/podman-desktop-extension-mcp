# Builder Stage: Building the extension using Node 18-alpine
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files and install dependencies
COPY ["package.json", "pnpm-lock.yaml", "./"]
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source code and build the extension
COPY . .
RUN pnpm run build

# Final Stage: Package only the necessary artifacts for the extension
FROM scratch

# Copy built assets from frontend build
COPY --from=builder /app/dist/frontend /extension/frontend
COPY --from=builder /app/dist /extension/dist
COPY --from=builder /app/resources /extension/resources
COPY --from=builder /app/package.json /extension/
COPY --from=builder /app/LICENSE /extension/
COPY --from=builder /app/README.md /extension/

# Provide metadata for Podman Desktop
LABEL org.opencontainers.image.title="MCP Server Manager Extension" \
      org.opencontainers.image.description="A Podman Desktop extension for managing Model Context Protocol (MCP) servers" \
      org.opencontainers.image.vendor="sparesparrow" \
      org.opencontainers.image.source="https://github.com/sparesparrow/mcp-server-manager-extension" \
      org.opencontainers.image.licenses="Apache-2.0" \
      io.podman-desktop.api.version=">= 1.10.0" \
      io.podman-desktop.extension="true" \
      io.podman-desktop.extension.icon="/extension/resources/icon.png"

# Command to verify extension
CMD ["pnpm", "test"]

