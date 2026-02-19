import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { AssetType, GitHubEntry } from '@/claude-assets-sync/utils/types.js';

export interface LocalSourceResult {
  available: boolean;
  docsPath?: string;
  reason?: string;
}

/**
 * Check if local docs source is available in node_modules.
 * Returns available=true if:
 * 1. node_modules/<packageName>/<assetPath> directory exists
 * 2. Installed version matches requestedVersion
 */
export const canUseLocalSource = (
  packageName: string,
  requestedVersion: string,
  assetPath: string,
  cwd: string,
): LocalSourceResult => {
  const docsPath = join(cwd, 'node_modules', packageName, assetPath);

  if (!existsSync(docsPath)) {
    return { available: false, reason: `Local docs path not found: ${docsPath}` };
  }

  // Check installed version
  try {
    const pkgJsonPath = join(cwd, 'node_modules', packageName, 'package.json');
    const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
    if (pkgJson.version !== requestedVersion) {
      return {
        available: false,
        reason: `Version mismatch: installed=${pkgJson.version}, requested=${requestedVersion}`,
      };
    }
  } catch {
    return { available: false, reason: 'Failed to read package.json from node_modules' };
  }

  return { available: true, docsPath };
};

/**
 * Read directory contents and return .md files and subdirs in GitHubEntry format.
 * Returns null if the directory doesn't exist.
 */
export const fetchLocalDirectoryContents = (dirPath: string): GitHubEntry[] | null => {
  if (!existsSync(dirPath)) return null;

  try {
    const entries = readdirSync(dirPath);
    const result: GitHubEntry[] = [];

    for (const name of entries) {
      const fullPath = join(dirPath, name);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        result.push({
          name,
          path: fullPath,
          type: 'dir',
          download_url: null,
          sha: '',
        });
      } else if (stat.isFile() && name.endsWith('.md')) {
        result.push({
          name,
          path: fullPath,
          type: 'file',
          download_url: null,
          sha: '',
        });
      }
    }

    return result;
  } catch {
    return null;
  }
};

/**
 * Recursively expand directory entries into flat file entries with path prefixes.
 * Mirrors github.ts expandDirectoryEntries behaviour but reads from local filesystem.
 */
export const expandLocalDirectoryEntries = (
  dirPath: string,
  entries: GitHubEntry[],
  prefix: string = '',
): GitHubEntry[] => {
  const result: GitHubEntry[] = [];

  for (const entry of entries) {
    const entryPrefix = prefix ? `${prefix}/${entry.name}` : entry.name;

    if (entry.type === 'file') {
      result.push({
        ...entry,
        name: prefix ? entryPrefix : entry.name,
      });
    } else if (entry.type === 'dir') {
      const subDirPath = join(dirPath, entry.name);
      const subEntries = fetchLocalDirectoryContents(subDirPath);
      if (subEntries) {
        const expanded = expandLocalDirectoryEntries(subDirPath, subEntries, entryPrefix);
        result.push(...expanded);
      }
    }
  }

  return result;
};

/**
 * Fetch asset files from local filesystem.
 * Mirrors github.ts fetchAssetFiles but reads from node_modules instead of GitHub API.
 */
export const fetchLocalAssetFiles = async (
  docsBasePath: string,
  assetTypes: string[],
): Promise<Record<string, GitHubEntry[]>> => {
  const assetFiles: Record<string, GitHubEntry[]> = {};

  for (const assetType of assetTypes) {
    const assetDirPath = join(docsBasePath, assetType);
    const entries = fetchLocalDirectoryContents(assetDirPath);

    if (!entries) {
      assetFiles[assetType] = [];
      continue;
    }

    assetFiles[assetType] = expandLocalDirectoryEntries(assetDirPath, entries);
  }

  return assetFiles;
};

/**
 * Read file contents from local filesystem for the given entries.
 * Mirrors github.ts downloadAssetFiles but reads local files instead of HTTP requests.
 */
export const downloadLocalAssetFiles = async (
  docsBasePath: string,
  assetType: AssetType,
  entries: GitHubEntry[],
): Promise<Map<string, string>> => {
  const results = new Map<string, string>();

  for (const entry of entries) {
    const filePath = join(docsBasePath, assetType, entry.name);
    try {
      const content = readFileSync(filePath, 'utf-8');
      results.set(entry.name, content);
    } catch {
      // Skip files that can't be read
    }
  }

  return results;
};
