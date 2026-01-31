import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { GitHubRepoInfo, PackageInfo } from './types';

/** GitHub HTTPS URL pattern: https://github.com/owner/repo.git */
const GITHUB_HTTPS_URL_PATTERN =
  /https?:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?$/;

/** GitHub SSH URL pattern: git@github.com:owner/repo.git */
const GITHUB_SSH_URL_PATTERN = /git@github\.com:([^/]+)\/([^/]+?)(?:\.git)?$/;

/** GitHub shorthand pattern: github:owner/repo */
const GITHUB_SHORTHAND_PATTERN = /^github:([^/]+)\/([^/]+)$/;

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
  const httpsMatch = url.match(GITHUB_HTTPS_URL_PATTERN);
  if (httpsMatch) {
    return {
      owner: httpsMatch[1],
      repo: httpsMatch[2],
      directory: repository.directory,
    };
  }

  // SSH URL: git@github.com:owner/repo.git
  const sshMatch = url.match(GITHUB_SSH_URL_PATTERN);
  if (sshMatch) {
    return {
      owner: sshMatch[1],
      repo: sshMatch[2],
      directory: repository.directory,
    };
  }

  // GitHub shorthand: github:owner/repo
  const shorthandMatch = url.match(GITHUB_SHORTHAND_PATTERN);
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
