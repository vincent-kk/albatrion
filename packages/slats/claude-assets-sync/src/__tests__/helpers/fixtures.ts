import type {
  GitHubEntry,
  GitHubRepoInfo,
  PackageInfo,
  SyncMeta,
} from '../../utils/types';

/**
 * Mock package info for @canard/schema-form
 */
export const mockSchemaFormPackage: PackageInfo = {
  name: '@canard/schema-form',
  version: '0.10.0',
  repository: {
    type: 'git',
    url: 'https://github.com/vincent-kk/albatrion.git',
    directory: 'packages/canard/schema-form',
  },
  claude: {
    assetPath: 'docs/claude',
  },
};

/**
 * Mock package info for @lerx/promise-modal
 */
export const mockPromiseModalPackage: PackageInfo = {
  name: '@lerx/promise-modal',
  version: '0.10.0',
  repository: {
    type: 'git',
    url: 'https://github.com/vincent-kk/albatrion.git',
    directory: 'packages/lerx/promise-modal',
  },
  claude: {
    assetPath: 'docs/claude',
  },
};

/**
 * Mock package without claude config
 */
export const mockPackageWithoutClaude: PackageInfo = {
  name: '@some/package',
  version: '1.0.0',
  repository: {
    type: 'git',
    url: 'https://github.com/owner/repo.git',
  },
};

/**
 * Mock GitHub repo info
 */
export const mockRepoInfo: GitHubRepoInfo = {
  owner: 'vincent-kk',
  repo: 'albatrion',
  directory: 'packages/canard/schema-form',
};

/**
 * Mock GitHub entries for commands directory
 */
export const mockCommandEntries: GitHubEntry[] = [
  {
    name: 'schema-form.md',
    path: 'packages/canard/schema-form/docs/claude/commands/schema-form.md',
    type: 'file',
    download_url:
      'https://raw.githubusercontent.com/vincent-kk/albatrion/main/packages/canard/schema-form/docs/claude/commands/schema-form.md',
    sha: 'abc123',
  },
];

/**
 * Mock GitHub entries for skills directory
 */
export const mockSkillEntries: GitHubEntry[] = [
  {
    name: 'schema-form-expert.md',
    path: 'packages/canard/schema-form/docs/claude/skills/schema-form-expert.md',
    type: 'file',
    download_url:
      'https://raw.githubusercontent.com/vincent-kk/albatrion/main/packages/canard/schema-form/docs/claude/skills/schema-form-expert.md',
    sha: 'def456',
  },
  {
    name: 'validation.md',
    path: 'packages/canard/schema-form/docs/claude/skills/validation.md',
    type: 'file',
    download_url:
      'https://raw.githubusercontent.com/vincent-kk/albatrion/main/packages/canard/schema-form/docs/claude/skills/validation.md',
    sha: 'ghi789',
  },
];

/**
 * Mock file content for commands
 */
export const mockCommandContent = `# Schema Form Command

Use this command to generate forms from JSON Schema.

## Usage
\`\`\`
/schema-form generate
\`\`\`
`;

/**
 * Mock file content for skills
 */
export const mockSkillContent = `# Schema Form Expert Skill

This skill provides expertise in JSON Schema form generation.
`;

/**
 * Mock sync meta
 */
export const mockSyncMeta: SyncMeta = {
  version: '0.10.0',
  syncedAt: '2025-02-01T00:00:00.000Z',
  files: ['schema-form.md'],
};

/**
 * Create a mock package.json content
 */
export function createMockPackageJson(info: PackageInfo): string {
  return JSON.stringify(info, null, 2);
}

/**
 * Create a mock GitHub API response for directory listing
 */
export function createGitHubDirectoryResponse(entries: GitHubEntry[]): string {
  return JSON.stringify(entries);
}
