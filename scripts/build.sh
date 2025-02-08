#!/bin/bash
set -e

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Build TypeScript
echo "Building TypeScript..."
pnpm build:extension

if [ $? -eq 0 ]; then
  echo "Building frontend..."
  pnpm build:frontend
else
  echo "TypeScript build failed"
  exit 1
fi

# Build container
echo "Building container..."
podman build -t ghcr.io/sparesparrow/podman-desktop-extension-mcp:latest . || {
    echo "❌ Build failed"
    exit 1
}

echo "Build complete!" 