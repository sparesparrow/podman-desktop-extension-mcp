export interface MCPSettings {
  enabled: boolean;
  port: number;
  allowedOperations: string[];
  securityToken?: string;
}

export class MCPSettingsManager {
  // Default settings parameters – these might be replaced by values read from a configuration file or environment variables
  private settings: MCPSettings = {
    enabled: true,
    port: 3000,
    allowedOperations: ['containers', 'images']
  };

  async updateSettings(settings: Partial<MCPSettings>): Promise<void> {
    this.settings = { ...this.settings, ...settings };
    // Additional persistence logic could be added here (e.g., writing to disk or updating environment variables)
  }

  async getSettings(): Promise<MCPSettings> {
    return this.settings;
  }
} 