import {
  MCPProtocolVersion,
  MCPProtocolCapabilities,
  MCPProtocolError,
  MCPProtocolNegotiation
} from '../mcp-types';

export class ProtocolNegotiator {
  private static readonly CURRENT_VERSION: MCPProtocolVersion = {
    major: 1,
    minor: 0,
    patch: 0
  };

  private static readonly MIN_VERSION: MCPProtocolVersion = {
    major: 1,
    minor: 0,
    patch: 0
  };

  private static readonly SUPPORTED_CAPABILITIES: MCPProtocolCapabilities = {
    streaming: true,
    compression: true,
    authentication: true,
    encryption: true,
    batchProcessing: true
  };

  static getNegotiationInfo(): MCPProtocolNegotiation {
    return {
      version: this.CURRENT_VERSION,
      minVersion: this.MIN_VERSION,
      capabilities: this.SUPPORTED_CAPABILITIES
    };
  }

  static validateVersion(serverVersion: MCPProtocolVersion): void {
    if (!this.isVersionCompatible(serverVersion)) {
      throw new MCPProtocolError(
        'Incompatible protocol version',
        serverVersion,
        this.CURRENT_VERSION
      );
    }
  }

  static negotiateCapabilities(
    serverCapabilities: MCPProtocolCapabilities
  ): MCPProtocolCapabilities {
    return {
      streaming: serverCapabilities.streaming && this.SUPPORTED_CAPABILITIES.streaming,
      compression: serverCapabilities.compression && this.SUPPORTED_CAPABILITIES.compression,
      authentication: serverCapabilities.authentication && this.SUPPORTED_CAPABILITIES.authentication,
      encryption: serverCapabilities.encryption && this.SUPPORTED_CAPABILITIES.encryption,
      batchProcessing: serverCapabilities.batchProcessing && this.SUPPORTED_CAPABILITIES.batchProcessing
    };
  }

  private static isVersionCompatible(version: MCPProtocolVersion): boolean {
    if (version.major !== this.CURRENT_VERSION.major) {
      return false;
    }

    if (version.major === this.MIN_VERSION.major) {
      if (version.minor < this.MIN_VERSION.minor) {
        return false;
      }
      if (version.minor === this.MIN_VERSION.minor && version.patch < this.MIN_VERSION.patch) {
        return false;
      }
    }

    return true;
  }

  static compareVersions(a: MCPProtocolVersion, b: MCPProtocolVersion): number {
    if (a.major !== b.major) {
      return a.major - b.major;
    }
    if (a.minor !== b.minor) {
      return a.minor - b.minor;
    }
    return a.patch - b.patch;
  }

  static versionToString(version: MCPProtocolVersion): string {
    return `${version.major}.${version.minor}.${version.patch}`;
  }

  static parseVersion(versionStr: string): MCPProtocolVersion {
    const parts = versionStr.split('.').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) {
      throw new Error('Invalid version string format. Expected "major.minor.patch"');
    }
    const [major, minor, patch] = parts;
    if (typeof major !== 'number' || typeof minor !== 'number' || typeof patch !== 'number') {
      throw new Error('Invalid version parts. All parts must be numbers.');
    }
    return {
      major,
      minor,
      patch
    };
  }
} 