export interface ClaudeConfig {
  assetPath?: string;
}

export interface PackageInfo {
  name: string;
  version: string;
  claude?: ClaudeConfig;
}

export type AssetType = 'skills' | 'commands' | 'rules' | string;
