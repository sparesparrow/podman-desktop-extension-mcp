#!/bin/bash
set -eo pipefail

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Read version from package.json
VERSION=$(node -p "require('$PROJECT_DIR/package.json').version")

# Add explicit username handling
GITHUB_USERNAME="sparesparrow"

check_registry_login() {
  # Modified check to include username validation
  if ! podman login --get-login ghcr.io | grep -q "$GITHUB_USERNAME"; then
    echo "Please login to ghcr.io first"
    exit 1
  fi
}

# Update login command in script
login_to_registry() {
  podman login ghcr.io \
    --username "$GITHUB_USERNAME" \
    --password "$GITHUB_PERSONAL_ACCESS_TOKEN"
}

# Add build verification steps
function verify_build_artifacts() {
    declare -a required_files=(
        "./dist/extension.js"
        "./resources/icon.png"
        "./package.json"
        "./dist/frontend/assets/*"
    )
    
    missing_files=()
    for file in "${required_files[@]}"; do
        if ! ls $file &> /dev/null; then
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -ne 0 ]; then
        echo "Missing required build artifacts:"
        printf '  - %s\n' "${missing_files[@]}"
        exit 1
    fi
}

# Modified build_container function with explicit podman/docker selection
function build_container() {
    echo "Building container..."
    local build_cmd="podman"
    local sudo_cmd=""
    
    # Check if podman needs sudo
    if ! podman info &>/dev/null; then
        sudo_cmd="sudo"
        echo "Using sudo for podman commands..."
    fi

    echo "Running build with $build_cmd..."
    if ! $sudo_cmd $build_cmd build -t ghcr.io/sparesparrow/podman-desktop-extension-mcp:latest .; then
        echo "Container build failed - checking permissions..."
        # Add diagnostic commands
        $sudo_cmd $build_cmd info
        ls -l dist/ extension.js
        exit 1
    fi
    echo "Container build successful!"
}

# Main execution flow with artifact verification
try() {
    echo "▶️ Running: $@"
    "$@"
    local status=$?
    if [ $status -ne 0 ]; then
        echo "❌ Command failed: $@"
        exit $status
    fi
}

# Build process
try pnpm build:extension
try pnpm build:frontend

# Verify builds before containerization
verify_build_artifacts

# Build container
build_container

echo "✅ Build successful!"

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
