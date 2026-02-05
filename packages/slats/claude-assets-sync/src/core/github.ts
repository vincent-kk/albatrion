import type { AssetType, GitHubEntry, GitHubRepoInfo } from '../utils/types';

/**
 * Error thrown when GitHub API rate limit is exceeded
 */
export class RateLimitError extends Error {
  constructor() {
    super(
      'GitHub API rate limit exceeded. Set GITHUB_TOKEN environment variable to increase the limit.',
    );
    this.name = 'RateLimitError';
  }
}

/**
 * Error thrown when GitHub resource is not found
 */
export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`GitHub resource not found: ${resource}`);
    this.name = 'NotFoundError';
  }
}

/**
 * Get GitHub API headers with optional authentication
 */
const getHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'claude-assets-sync',
  };

  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  return headers;
};

/**
 * Fetch directory contents from GitHub API
 * @param repoInfo - GitHub repository information
 * @param path - Path to the directory
 * @param tag - Git tag or ref to fetch from
 * @returns Array of GitHubEntry or null if directory doesn't exist
 */
export const fetchDirectoryContents = async (
  repoInfo: GitHubRepoInfo,
  path: string,
  tag: string,
): Promise<GitHubEntry[] | null> => {
  const url = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${path}?ref=${encodeURIComponent(tag)}`;

  const response = await fetch(url, {
    headers: getHeaders(),
  });

  // Handle rate limit
  if (response.status === 403) {
    const remaining = response.headers.get('x-ratelimit-remaining');
    if (remaining === '0') throw new RateLimitError();
  }

  // Handle not found (directory doesn't exist)
  if (response.status === 404) return null;

  if (!response.ok)
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`,
    );

  const data = await response.json();

  // Filter only files (exclude subdirectories for now)
  return (data as GitHubEntry[]).filter(
    (entry) => entry.type === 'file' && entry.name.endsWith('.md'),
  );
};

/**
 * Fetch asset files dynamically from GitHub
 * @param repoInfo - GitHub repository information
 * @param assetPath - Base path to Claude assets (e.g., "docs/claude")
 * @param tag - Git tag or ref to fetch from
 * @param assetTypes - Array of asset type names to fetch
 * @returns Record mapping asset type names to their GitHubEntry arrays
 */
export const fetchAssetFiles = async (
  repoInfo: GitHubRepoInfo,
  assetPath: string,
  tag: string,
  assetTypes: string[],
): Promise<Record<string, GitHubEntry[]>> => {
  // Build base path
  const basePath = repoInfo.directory
    ? `${repoInfo.directory}/${assetPath}`
    : assetPath;

  // Fetch all asset types in parallel
  const fetchPromises = assetTypes.map((assetType) =>
    fetchDirectoryContents(repoInfo, `${basePath}/${assetType}`, tag),
  );

  const results = await Promise.all(fetchPromises);

  // Build dynamic result object
  const assetFiles: Record<string, GitHubEntry[]> = {};
  assetTypes.forEach((assetType, index) => {
    assetFiles[assetType] = results[index] || [];
  });

  return assetFiles;
};

/**
 * Download file content from raw.githubusercontent.com
 * @param repoInfo - GitHub repository information
 * @param filePath - Full path to the file
 * @param tag - Git tag or ref
 * @returns File content as string
 */
export const downloadFile = async (
  repoInfo: GitHubRepoInfo,
  filePath: string,
  tag: string,
): Promise<string> => {
  const url = `https://raw.githubusercontent.com/${repoInfo.owner}/${repoInfo.repo}/${encodeURIComponent(tag)}/${filePath}`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'claude-assets-sync',
    },
  });

  if (response.status === 404) {
    throw new NotFoundError(filePath);
  }

  if (!response.ok) {
    throw new Error(
      `Failed to download file: ${response.status} ${response.statusText}`,
    );
  }

  return response.text();
};

/**
 * Download multiple files from a specific asset type
 * @param repoInfo - GitHub repository information
 * @param assetPath - Base path to Claude assets
 * @param assetType - Type of asset (commands or skills)
 * @param entries - Array of GitHubEntry to download
 * @param tag - Git tag or ref
 * @returns Map of filename to content
 */
export const downloadAssetFiles = async (
  repoInfo: GitHubRepoInfo,
  assetPath: string,
  assetType: AssetType,
  entries: GitHubEntry[],
  tag: string,
): Promise<Map<string, string>> => {
  const basePath = repoInfo.directory
    ? `${repoInfo.directory}/${assetPath}/${assetType}`
    : `${assetPath}/${assetType}`;

  const results = new Map<string, string>();

  // Download files sequentially to avoid rate limiting
  for (const entry of entries) {
    const filePath = `${basePath}/${entry.name}`;
    const content = await downloadFile(repoInfo, filePath, tag);
    results.set(entry.name, content);
  }

  return results;
};
