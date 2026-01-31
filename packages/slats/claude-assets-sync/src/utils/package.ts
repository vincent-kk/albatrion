import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { GitHubRepoInfo, PackageInfo } from './types';

/**
 * Read package.json from node_modules
 * @param packageName - Package name (e.g., "@canard/schema-form")
 * @param cwd - Current working directory
 * @returns PackageInfo or null if not found
 */
export function readPackageJson(
  packageName: string,
  cwd: string = process.cwd(),
): PackageInfo | null {
  try {
    const packageJsonPath = join(cwd, 'node_modules', packageName, 'package.json');
    const content = readFileSync(packageJsonPath, 'utf-8');
    const json = JSON.parse(content);

    // Validate required fields
    if (!json.name || !json.version || !json.repository) {
      return null;
    }

    return {
      name: json.name,
      version: json.version,
      repository: json.repository,
      claude: json.claude,
    };
  } catch {
    return null;
  }
}

/**
 * Parse GitHub repository URL to extract owner and repo
 * Supports formats:
 * - https://github.com/owner/repo.git
 * - https://github.com/owner/repo
 * - git@github.com:owner/repo.git
 * - github:owner/repo
 *
 * @param repository - Repository info from package.json
 * @returns GitHubRepoInfo or null if parsing failed
 */
export function parseGitHubRepo(
  repository: PackageInfo['repository'],
): GitHubRepoInfo | null {
  if (!repository || typeof repository.url !== 'string') {
    return null;
  }

  const url = repository.url;

  // HTTPS URL: https://github.com/owner/repo.git
  const httpsMatch = url.match(
    /https?:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?$/,
  );
  if (httpsMatch) {
    return {
      owner: httpsMatch[1],
      repo: httpsMatch[2],
      directory: repository.directory,
    };
  }

  // SSH URL: git@github.com:owner/repo.git
  const sshMatch = url.match(/git@github\.com:([^/]+)\/([^/]+?)(?:\.git)?$/);
  if (sshMatch) {
    return {
      owner: sshMatch[1],
      repo: sshMatch[2],
      directory: repository.directory,
    };
  }

  // GitHub shorthand: github:owner/repo
  const shorthandMatch = url.match(/^github:([^/]+)\/([^/]+)$/);
  if (shorthandMatch) {
    return {
      owner: shorthandMatch[1],
      repo: shorthandMatch[2],
      directory: repository.directory,
    };
  }

  return null;
}

/**
 * Build version tag for GitHub
 * @param packageName - Package name (e.g., "@canard/schema-form")
 * @param version - Package version (e.g., "0.10.0")
 * @returns Version tag (e.g., "@canard/schema-form@0.10.0")
 */
export function buildVersionTag(packageName: string, version: string): string {
  return `${packageName}@${version}`;
}

/**
 * Build asset path for a package
 * @param assetPath - Base asset path (e.g., "docs/claude")
 * @param directory - Repository directory (optional)
 * @returns Full asset path
 */
export function buildAssetPath(assetPath: string, directory?: string): string {
  if (directory) {
    return `${directory}/${assetPath}`;
  }
  return assetPath;
}
