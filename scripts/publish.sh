#!/bin/bash
set -e

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Read version from package.json
VERSION=$(node -p "require('$PROJECT_DIR/package.json').version")

# Check if logged into registry
echo "Checking registry login..."
podman login ghcr.io || {
    echo "Please login to ghcr.io first"
    exit 1
}

# Build the extension first
echo "Building extension..."
"$SCRIPT_DIR/build.sh" || {
    echo "Build failed"
    exit 1
}

# Tag with version
echo "Tagging version $VERSION..."
podman tag ghcr.io/sparesparrow/mcp-server-manager-extension:latest \
  ghcr.io/sparesparrow/mcp-server-manager-extension:$VERSION || {
    echo "Failed to tag image"
    exit 1
}

# Push to registry
echo "Pushing to registry..."
podman push ghcr.io/sparesparrow/mcp-server-manager-extension:latest || {
    echo "Failed to push latest tag"
    exit 1
}
podman push ghcr.io/sparesparrow/mcp-server-manager-extension:$VERSION || {
    echo "Failed to push version tag"
    exit 1
}

echo "Published version $VERSION successfully!"

# Update extension in Podman Desktop if installed
if podman-desktop extension list | grep -q "mcp-server-manager"; then
    echo "Updating extension in Podman Desktop..."
    podman-desktop extension update ghcr.io/sparesparrow/mcp-server-manager-extension:latest || {
        echo "Failed to update extension in Podman Desktop"
        exit 1
    }
fi
