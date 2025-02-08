#!/bin/bash
set -eo pipefail

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Configuration
GITHUB_USERNAME="sparesparrow"
IMAGE_NAME="podman-desktop-extension-mcp"
REGISTRY="ghcr.io"
FULL_IMAGE_NAME="${REGISTRY}/${GITHUB_USERNAME}/${IMAGE_NAME}"

# Read version from package.json
VERSION=$(node -p "require('$PROJECT_DIR/package.json').version")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() { echo -e "${GREEN}ℹ️ $1${NC}"; }
log_warn() { echo -e "${YELLOW}⚠️ $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }

# Verify registry login
check_registry_login() {
    if ! podman login --get-login ghcr.io | grep -q "$GITHUB_USERNAME"; then
        log_error "Not logged in to ghcr.io"
        log_info "Please run: podman login ghcr.io --username $GITHUB_USERNAME"
        exit 1
    fi
}

# Validate version format
validate_version() {
    if ! [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9]+)?$ ]]; then
        log_error "Invalid version format in package.json: $VERSION"
        log_info "Version must follow semantic versioning (e.g., 1.0.0 or 1.0.0-beta)"
        exit 1
    fi
    log_success "Version format validated: $VERSION"
}

# Verify build artifacts
verify_build_artifacts() {
    log_info "Verifying build artifacts..."
    
    declare -a required_files=(
        "./dist/extension.js"
        "./resources/icon.png"
        "./package.json"
        "./dist/frontend/index.html"
    )

    missing_files=()
    for file in "${required_files[@]}"; do
        if ! ls $file &> /dev/null; then
            missing_files+=("$file")
        fi
    done

    if [ ${#missing_files[@]} -ne 0 ]; then
        log_error "Missing required build artifacts:"
        printf '  - %s\n' "${missing_files[@]}"
        exit 1
    fi
    
    log_success "All required build artifacts present"
}

# Build the container
build_container() {
    log_info "Building container image..."
    
    # Check if podman needs sudo
    local build_cmd="podman"
    local sudo_cmd=""
    if ! podman info &>/dev/null; then
        sudo_cmd="sudo"
        log_warn "Using sudo for podman commands..."
    fi

    if ! $sudo_cmd $build_cmd build -t "${FULL_IMAGE_NAME}:latest" .; then
        log_error "Container build failed"
        # Add diagnostic information
        log_info "Checking podman configuration..."
        $sudo_cmd $build_cmd info
        log_info "Checking build directory permissions..."
        ls -l dist/
        exit 1
    fi

    # Tag with version
    $sudo_cmd $build_cmd tag "${FULL_IMAGE_NAME}:latest" "${FULL_IMAGE_NAME}:${VERSION}"
    
    log_success "Container build and tagging complete"
}

# Push the container
push_container() {
    log_info "Pushing container images..."
    
    # Push version tag
    if ! podman push "${FULL_IMAGE_NAME}:${VERSION}"; then
        log_error "Failed to push version tag"
        exit 1
    fi
    
    # Push latest tag
    if ! podman push "${FULL_IMAGE_NAME}:latest"; then
        log_error "Failed to push latest tag"
        log_warn "Version tag was pushed, but latest tag failed"
        exit 1
    fi
    
    log_success "Container images pushed successfully"
}

# Update local extension if installed
update_local_extension() {
    if podman-desktop extension list | grep -q "${IMAGE_NAME}"; then
        log_info "Updating local Podman Desktop extension..."
        if ! podman-desktop extension update "${FULL_IMAGE_NAME}:latest"; then
            log_warn "Failed to update local extension"
            return 1
        fi
        log_success "Local extension updated"
    else
        log_info "Extension not installed locally - skipping update"
    fi
}

# Cleanup function
cleanup() {
    log_info "Cleaning up temporary files..."
    # Add cleanup tasks here if needed
}

# Main execution
main() {
    # Trap cleanup on exit
    trap cleanup EXIT
    
    log_info "Starting publish process for ${IMAGE_NAME}"
    
    # Pre-flight checks
    validate_version
    check_registry_login
    
    # Build process
    log_info "Running build process..."
    if [ "$1" != "--skip-build" ]; then
        pnpm build:extension || { log_error "Extension build failed"; exit 1; }
        pnpm build:frontend || { log_error "Frontend build failed"; exit 1; }
    else
        log_warn "Skipping build step due to --skip-build flag"
    fi
    
    # Verify builds
    verify_build_artifacts
    
    # Build and push container
    build_container
    push_container
    
    # Update local installation
    update_local_extension || true  # Don't fail if local update fails
    
    log_success "Publication process completed successfully!"
}

# Parse command line arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --skip-build) SKIP_BUILD=1 ;;
        --help) echo "Usage: $0 [--skip-build]"; exit 0 ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

# Execute main function
main "$@"

