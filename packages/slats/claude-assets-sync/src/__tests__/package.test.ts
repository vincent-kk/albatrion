import { describe, expect, it } from 'vitest';

import {
  buildAssetPath,
  buildVersionTag,
  parseGitHubRepo,
} from '../utils/package';
import type { RepositoryInfo } from '../utils/types';

describe('parseGitHubRepo', () => {
  it('should parse HTTPS URL', () => {
    const repository: RepositoryInfo = {
      type: 'git',
      url: 'https://github.com/vincent-kk/albatrion.git',
      directory: 'packages/canard/schema-form',
    };

    const result = parseGitHubRepo(repository);

    expect(result).toEqual({
      owner: 'vincent-kk',
      repo: 'albatrion',
      directory: 'packages/canard/schema-form',
    });
  });

  it('should parse HTTPS URL without .git suffix', () => {
    const repository: RepositoryInfo = {
      type: 'git',
      url: 'https://github.com/owner/repo',
    };

    const result = parseGitHubRepo(repository);

    expect(result).toEqual({
      owner: 'owner',
      repo: 'repo',
      directory: undefined,
    });
  });

  it('should parse SSH URL', () => {
    const repository: RepositoryInfo = {
      type: 'git',
      url: 'git@github.com:owner/repo.git',
    };

    const result = parseGitHubRepo(repository);

    expect(result).toEqual({
      owner: 'owner',
      repo: 'repo',
      directory: undefined,
    });
  });

  it('should parse GitHub shorthand', () => {
    const repository: RepositoryInfo = {
      type: 'git',
      url: 'github:owner/repo',
    };

    const result = parseGitHubRepo(repository);

    expect(result).toEqual({
      owner: 'owner',
      repo: 'repo',
      directory: undefined,
    });
  });

  it('should return null for invalid URL', () => {
    const repository: RepositoryInfo = {
      type: 'git',
      url: 'invalid-url',
    };

    const result = parseGitHubRepo(repository);

    expect(result).toBeNull();
  });

  it('should return null for non-GitHub URL', () => {
    const repository: RepositoryInfo = {
      type: 'git',
      url: 'https://gitlab.com/owner/repo.git',
    };

    const result = parseGitHubRepo(repository);

    expect(result).toBeNull();
  });
});

describe('buildVersionTag', () => {
  it('should build version tag for scoped package', () => {
    const tag = buildVersionTag('@canard/schema-form', '0.10.0');
    expect(tag).toBe('@canard/schema-form@0.10.0');
  });

  it('should build version tag for unscoped package', () => {
    const tag = buildVersionTag('my-package', '1.0.0');
    expect(tag).toBe('my-package@1.0.0');
  });
});

describe('buildAssetPath', () => {
  it('should return asset path without directory', () => {
    const path = buildAssetPath('docs/claude');
    expect(path).toBe('docs/claude');
  });

  it('should combine directory with asset path', () => {
    const path = buildAssetPath('docs/claude', 'packages/canard/schema-form');
    expect(path).toBe('packages/canard/schema-form/docs/claude');
  });
});
