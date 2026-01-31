import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import type { GitHubRepoInfo, PackageInfo, WorkspaceInfo } from './types';

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
export const readPackageJson = (
  packageName: string,
  cwd: string = process.cwd(),
): PackageInfo | null => {
  try {
    const packageJsonPath = join(
      cwd,
      'node_modules',
      packageName,
      'package.json',
    );
    const content = readFileSync(packageJsonPath, 'utf-8');
    const json = JSON.parse(content);

    // Validate required fields
    if (!json.name || !json.version || !json.repository) return null;

    return {
      name: json.name,
      version: json.version,
      repository: json.repository,
      claude: json.claude,
    };
  } catch {
    return null;
  }
};

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
export const parseGitHubRepo = (
  repository: PackageInfo['repository'],
): GitHubRepoInfo | null => {
  if (!repository || typeof repository.url !== 'string') return null;

  const url = repository.url;

  // HTTPS URL: https://github.com/owner/repo.git
  const httpsMatch = url.match(GITHUB_HTTPS_URL_PATTERN);
  if (httpsMatch)
    return {
      owner: httpsMatch[1],
      repo: httpsMatch[2],
      directory: repository.directory,
    };

  // SSH URL: git@github.com:owner/repo.git
  const sshMatch = url.match(GITHUB_SSH_URL_PATTERN);
  if (sshMatch)
    return {
      owner: sshMatch[1],
      repo: sshMatch[2],
      directory: repository.directory,
    };

  // GitHub shorthand: github:owner/repo
  const shorthandMatch = url.match(GITHUB_SHORTHAND_PATTERN);
  if (shorthandMatch)
    return {
      owner: shorthandMatch[1],
      repo: shorthandMatch[2],
      directory: repository.directory,
    };

  return null;
};

/**
 * Build version tag for GitHub
 * @param packageName - Package name (e.g., "@canard/schema-form")
 * @param version - Package version (e.g., "0.10.0")
 * @returns Version tag (e.g., "@canard/schema-form@0.10.0")
 */
export const buildVersionTag = (packageName: string, version: string): string =>
  `${packageName}@${version}`;

/**
 * Build asset path for a package
 * @param assetPath - Base asset path (e.g., "docs/claude")
 * @param directory - Repository directory (optional)
 * @returns Full asset path
 */
export const buildAssetPath = (
  assetPath: string,
  directory?: string,
): string => (directory ? `${directory}/${assetPath}` : assetPath);

/**
 * Find git repository root directory
 * @param cwd - Current working directory
 * @returns Git root path or null if not in a git repository
 */
export const findGitRoot = (cwd: string = process.cwd()): string | null => {
  try {
    const gitRoot = execSync('git rev-parse --show-toplevel', {
      cwd,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
    return gitRoot;
  } catch {
    return null;
  }
};

/**
 * Find the workspace root directory by looking for package.json with workspaces
 * @param startDir - Directory to start searching from
 * @returns Workspace root path or null if not found
 */
export const findWorkspaceRoot = (
  startDir: string = process.cwd(),
): string | null => {
  let currentDir = startDir;

  while (currentDir !== '/') {
    const packageJsonPath = join(currentDir, 'package.json');
    if (existsSync(packageJsonPath)) {
      try {
        const content = readFileSync(packageJsonPath, 'utf-8');
        const json = JSON.parse(content);
        if (json.workspaces) return currentDir;
      } catch {
        // Continue searching
      }
    }
    currentDir = dirname(currentDir);
  }

  return null;
};

/**
 * Get list of workspaces using yarn workspaces list
 * @param workspaceRoot - Workspace root directory
 * @returns Array of WorkspaceInfo
 */
export const getWorkspaceList = (workspaceRoot: string): WorkspaceInfo[] => {
  try {
    const output = execSync('yarn workspaces list --json', {
      cwd: workspaceRoot,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // yarn workspaces list --json outputs one JSON object per line
    return output
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line) as WorkspaceInfo);
  } catch {
    return [];
  }
};

/**
 * Find workspace location by package name
 * @param packageName - Package name to find
 * @param workspaceRoot - Workspace root directory
 * @returns Workspace location path or null if not found
 */
export const findWorkspaceLocation = (
  packageName: string,
  workspaceRoot: string,
): string | null => {
  const workspaces = getWorkspaceList(workspaceRoot);
  const workspace = workspaces.find((ws) => ws.name === packageName);
  return workspace ? join(workspaceRoot, workspace.location) : null;
};

/**
 * Read package.json from local workspace
 * @param packageName - Package name (e.g., "@canard/schema-form")
 * @param cwd - Current working directory
 * @returns PackageInfo or null if not found
 */
export const readLocalPackageJson = (
  packageName: string,
  cwd: string = process.cwd(),
): PackageInfo | null => {
  try {
    // Find workspace root
    const workspaceRoot = findWorkspaceRoot(cwd);
    if (!workspaceRoot) return null;

    // Find package location in workspaces
    const packageLocation = findWorkspaceLocation(packageName, workspaceRoot);
    if (!packageLocation) return null;

    const packageJsonPath = join(packageLocation, 'package.json');
    const content = readFileSync(packageJsonPath, 'utf-8');
    const json = JSON.parse(content);

    // Validate required fields
    if (!json.name || !json.version || !json.repository) return null;

    return {
      name: json.name,
      version: json.version,
      repository: json.repository,
      claude: json.claude,
    };
  } catch {
    return null;
  }
};
