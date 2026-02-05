import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { parseGitHubRepo } from '../utils/package.js';
import type { GitHubEntry, PackageInfo, TreeNode } from '../utils/types.js';
import { DEFAULT_ASSET_TYPES } from './assetStructure.js';
import { fetchDirectoryContents } from './github.js';

/**
 * Read package.json from a given directory path
 */
function readPackageJsonFromPath(packagePath: string): PackageInfo | null {
  try {
    const packageJsonPath = join(packagePath, 'package.json');
    if (!existsSync(packageJsonPath)) {
      return null;
    }
    const content = readFileSync(packageJsonPath, 'utf-8');
    const json = JSON.parse(content);

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
 * Scan package assets from local workspace or GitHub
 *
 * @param packageName - Package name to scan
 * @param options - Scan options
 * @returns Tree structure of available assets
 */
export async function scanPackageAssets(
  packageName: string,
  options: { local: boolean; ref?: string; cwd?: string },
): Promise<TreeNode[]> {
  const cwd = options.cwd ?? process.cwd();

  if (options.local) {
    return scanLocalAssets(packageName, cwd);
  }

  return scanRemoteAssets(packageName, options.ref);
}

/**
 * Scan assets from local workspace
 */
async function scanLocalAssets(
  packageName: string,
  cwd: string,
): Promise<TreeNode[]> {
  // Find package in local workspaces
  const packagePath = findLocalPackage(packageName, cwd);
  if (!packagePath) {
    throw new Error(`Package ${packageName} not found in local workspace`);
  }

  // Read package.json to get claude config
  const pkgInfo = readPackageJsonFromPath(packagePath);
  if (!pkgInfo || !pkgInfo.claude?.assetPath) {
    throw new Error(
      `Package ${packageName} has no claude.assetPath configured`,
    );
  }

  const assetPath = join(packagePath, pkgInfo.claude.assetPath);
  if (!existsSync(assetPath)) {
    throw new Error(`Asset path ${assetPath} does not exist`);
  }

  // Scan each asset type directory
  const trees: TreeNode[] = [];
  for (const assetType of DEFAULT_ASSET_TYPES) {
    const assetDir = join(assetPath, assetType);
    if (!existsSync(assetDir)) {
      continue;
    }

    const tree = buildTreeFromLocalDir(assetType, assetDir, assetType);
    if (tree.children && tree.children.length > 0) {
      trees.push(tree);
    }
  }

  return trees;
}

/**
 * Scan assets from GitHub
 */
async function scanRemoteAssets(
  packageName: string,
  ref?: string,
): Promise<TreeNode[]> {
  // Read package.json from node_modules
  const nodeModulesPath = join(process.cwd(), 'node_modules', packageName);
  const pkgInfo = readPackageJsonFromPath(nodeModulesPath);

  if (!pkgInfo || !pkgInfo.claude?.assetPath) {
    throw new Error(
      `Package ${packageName} has no claude.assetPath configured`,
    );
  }

  if (!pkgInfo.repository) {
    throw new Error(`Package ${packageName} has no repository field`);
  }

  const repoInfo = parseGitHubRepo(pkgInfo.repository);
  if (!repoInfo) {
    throw new Error(`Invalid GitHub repository URL in package ${packageName}`);
  }
  const assetBasePath = pkgInfo.claude.assetPath;

  // Fetch asset files from GitHub
  const trees: TreeNode[] = [];
  for (const assetType of DEFAULT_ASSET_TYPES) {
    const assetPath = repoInfo.directory
      ? `${repoInfo.directory}/${assetBasePath}/${assetType}`
      : `${assetBasePath}/${assetType}`;

    try {
      const entries = await fetchDirectoryContents(
        repoInfo,
        assetPath,
        ref ?? 'HEAD',
      );

      if (entries && entries.length > 0) {
        const tree = buildTreeFromGitHubEntries(assetType, entries, assetType);
        if (tree.children && tree.children.length > 0) {
          trees.push(tree);
        }
      }
    } catch {
      // Skip asset types that don't exist
      continue;
    }
  }

  return trees;
}

/**
 * Build tree from local directory
 */
function buildTreeFromLocalDir(
  label: string,
  dirPath: string,
  basePath: string,
): TreeNode {
  const entries = readdirSync(dirPath);
  const children: TreeNode[] = [];

  for (const entry of entries) {
    const fullPath = join(dirPath, entry);
    const stat = statSync(fullPath);
    const relativePath = join(basePath, entry);

    if (stat.isDirectory()) {
      // Check if it's a directory-based skill (contains Skill.md)
      const isSkill = existsSync(join(fullPath, 'Skill.md'));

      if (isSkill) {
        // Treat as a single selectable item (directory skill)
        children.push({
          id: relativePath,
          label: entry,
          path: relativePath,
          type: 'skill-directory',
          selected: true,
          expanded: false,
        });
      } else {
        // Regular directory with nested content
        const subTree = buildTreeFromLocalDir(entry, fullPath, relativePath);
        if (subTree.children && subTree.children.length > 0) {
          children.push(subTree);
        }
      }
    } else {
      children.push({
        id: relativePath,
        label: entry,
        path: relativePath,
        type: 'file',
        selected: true,
        expanded: false,
      });
    }
  }

  return {
    id: basePath,
    label,
    path: basePath,
    type: 'directory',
    children,
    selected: true,
    expanded: true,
  };
}

/**
 * Build tree from GitHub entries
 */
function buildTreeFromGitHubEntries(
  label: string,
  entries: GitHubEntry[],
  basePath: string,
): TreeNode {
  const children: TreeNode[] = [];
  const grouped = groupByTopLevel(entries);

  for (const [name, items] of Object.entries(grouped)) {
    if (items.length === 1 && items[0].type === 'file') {
      // Single file
      const filePath = items[0].path;
      children.push({
        id: filePath,
        label: name,
        path: filePath,
        type: 'file',
        selected: true,
        expanded: false,
      });
    } else {
      // Directory (possibly with subdirectories)
      const isSkill = items.some(
        (item) => item.type === 'file' && item.name === 'Skill.md',
      );

      if (isSkill) {
        // Directory-based skill
        const skillPath = `${basePath}/${name}`;
        children.push({
          id: skillPath,
          label: name,
          path: skillPath,
          type: 'skill-directory',
          selected: true,
          expanded: false,
        });
      } else {
        // Regular directory
        const subTree = buildTreeFromGitHubEntries(
          name,
          items,
          `${basePath}/${name}`,
        );
        if (subTree.children && subTree.children.length > 0) {
          children.push(subTree);
        }
      }
    }
  }

  return {
    id: basePath,
    label,
    path: basePath,
    type: 'directory',
    children,
    selected: true,
    expanded: true,
  };
}

/**
 * Group GitHub entries by top-level name
 */
function groupByTopLevel(
  entries: GitHubEntry[],
): Record<string, GitHubEntry[]> {
  const groups: Record<string, GitHubEntry[]> = {};

  for (const entry of entries) {
    const parts = entry.path.split('/');
    const topLevel = parts[parts.length - (entry.type === 'file' ? 1 : 0)];

    if (!groups[topLevel]) {
      groups[topLevel] = [];
    }
    groups[topLevel].push(entry);
  }

  return groups;
}

/**
 * Check if entries represent a directory-based skill
 */
export function isDirectorySkill(entries: GitHubEntry[]): boolean {
  return entries.some(
    (entry) => entry.type === 'file' && entry.name === 'Skill.md',
  );
}

/**
 * Find local package in workspace
 */
function findLocalPackage(packageName: string, cwd: string): string | null {
  // Find monorepo root (directory with workspaces in package.json)
  const monorepoRoot = findMonorepoRoot(cwd);
  const searchRoot = monorepoRoot || cwd;

  // Try packages/ directory with nested structure support
  const packagesDir = join(searchRoot, 'packages');
  if (existsSync(packagesDir)) {
    const found = searchPackagesRecursively(packagesDir, packageName);
    if (found) return found;
  }

  // Try node_modules as fallback
  const nodeModulesPath = join(searchRoot, 'node_modules', packageName);
  if (existsSync(nodeModulesPath)) {
    return nodeModulesPath;
  }

  return null;
}

/**
 * Find monorepo root by looking for package.json with workspaces
 */
function findMonorepoRoot(startDir: string): string | null {
  let currentDir = startDir;
  const root = '/';

  while (currentDir !== root) {
    const pkgJsonPath = join(currentDir, 'package.json');
    if (existsSync(pkgJsonPath)) {
      try {
        const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
        if (pkgJson.workspaces) {
          return currentDir;
        }
      } catch {
        // Ignore parse errors
      }
    }
    currentDir = join(currentDir, '..');
  }

  return null;
}

/**
 * Search packages recursively in nested directories
 */
function searchPackagesRecursively(
  dir: string,
  packageName: string,
): string | null {
  try {
    const entries = readdirSync(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        // Check if this directory has a package.json
        const pkgJsonPath = join(fullPath, 'package.json');
        if (existsSync(pkgJsonPath)) {
          const pkgInfo = readPackageJsonFromPath(fullPath);
          if (pkgInfo && pkgInfo.name === packageName) {
            return fullPath;
          }
        }

        // Recursively search subdirectories
        const found = searchPackagesRecursively(fullPath, packageName);
        if (found) return found;
      }
    }
  } catch {
    // Ignore errors (permission denied, etc.)
  }

  return null;
}
