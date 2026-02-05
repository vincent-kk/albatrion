import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import type { AssetStructure, AssetsConfig } from '../utils/types';
import { DEFAULT_ASSET_TYPES } from './constants';

// Re-export for backward compatibility
export { DEFAULT_ASSET_TYPES };

/**
 * Default structure configuration for built-in asset types
 */
export const DEFAULT_ASSET_STRUCTURES: Record<string, AssetStructure> = {
  commands: 'nested',
  skills: 'flat',
  agents: 'flat',
};

/**
 * Get the structure type for a given asset type
 * @param assetType - The asset type to query
 * @param config - Optional ClaudeConfig or AssetsConfig
 * @returns The structure type ('nested' or 'flat')
 */
export function getAssetStructure(
  assetType: string,
  config?: AssetsConfig | { assetPath: string; assets?: AssetsConfig },
): AssetStructure {
  // Handle both ClaudeConfig (with assetPath) and direct AssetsConfig
  if (!config) {
    return DEFAULT_ASSET_STRUCTURES[assetType] || 'flat';
  }

  let assetsConfig: AssetsConfig | undefined;

  if ('assetPath' in config) {
    // It's ClaudeConfig - extract assets field
    // config satisfies { assetPath: string; assets?: AssetsConfig }
    assetsConfig = (config as { assetPath: string; assets?: AssetsConfig })
      .assets;
  } else {
    // It's direct AssetsConfig
    assetsConfig = config as AssetsConfig;
  }

  if (assetsConfig?.[assetType]?.structure) {
    return assetsConfig[assetType].structure;
  }
  return DEFAULT_ASSET_STRUCTURES[assetType] || 'nested';
}

/**
 * Detect the structure type of an asset directory
 * @param dir - Directory path to check
 * @returns Structure type ('flat' | 'nested') or null if directory doesn't exist
 */
export function detectStructureType(dir: string): AssetStructure | null {
  if (!existsSync(dir)) {
    return null;
  }

  try {
    const entries = readdirSync(dir);

    // Empty directory - assume flat
    if (entries.length === 0) {
      return 'flat';
    }

    // Check if there are subdirectories with files
    let hasSubdirectories = false;
    let hasFiles = false;

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        hasSubdirectories = true;
        // Check if subdirectory contains files
        const subEntries = readdirSync(fullPath);
        if (subEntries.some((sub) => statSync(join(fullPath, sub)).isFile())) {
          return 'nested'; // Has subdirectories with files
        }
      } else if (stat.isFile()) {
        hasFiles = true;
      }
    }

    // If we have files at root level, it's flat
    if (hasFiles) {
      return 'flat';
    }

    // If we have subdirectories but no nested files detected, assume flat
    return hasSubdirectories ? 'flat' : 'flat';
  } catch {
    return null;
  }
}

/**
 * Validate that an asset structure value is valid
 * @param structure - Structure value to validate
 * @returns True if valid, false otherwise
 */
export function validateAssetStructure(
  structure: unknown,
): structure is AssetStructure {
  return structure === 'nested' || structure === 'flat';
}

/**
 * Validate and normalize asset structure value
 * @param structure - Structure value to normalize
 * @param defaultValue - Default value if validation fails
 * @returns Validated structure or default
 */
export function normalizeAssetStructure(
  structure: unknown,
  defaultValue: AssetStructure = 'flat',
): AssetStructure {
  return validateAssetStructure(structure) ? structure : defaultValue;
}
