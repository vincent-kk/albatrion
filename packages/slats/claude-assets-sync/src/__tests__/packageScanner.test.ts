import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { scanPackageAssets } from '../core/packageScanner';
import type { PackageInfo } from '../utils/types';
import {
  type TestFixture,
  createTestFixture,
  mockSchemaFormPackage,
  restoreFetchMock,
  setupFetchMock,
} from './helpers';

// Mock console to suppress output during tests
vi.spyOn(console, 'log').mockImplementation(() => {});

describe('scanRemoteAssets - local source fallback', () => {
  let fixture: TestFixture;
  let originalCwd: () => string;

  beforeEach(() => {
    fixture = createTestFixture([mockSchemaFormPackage]);
    originalCwd = process.cwd;
  });

  afterEach(() => {
    process.cwd = originalCwd;
    fixture.cleanup();
    restoreFetchMock();
  });

  it('should return TreeNode from local docs when ref is not specified', async () => {
    // Setup local docs in node_modules
    const docsPath = join(
      fixture.tempDir,
      'node_modules',
      '@canard/schema-form',
      'docs/claude',
    );
    mkdirSync(join(docsPath, 'skills'), { recursive: true });
    writeFileSync(join(docsPath, 'skills', 'expert.md'), '# Expert Skill');
    writeFileSync(join(docsPath, 'skills', 'guide.md'), '# Guide Skill');

    // Mock process.cwd() to point to temp dir
    process.cwd = () => fixture.tempDir;

    // No fetch mock — should not call GitHub
    const mockFetch = setupFetchMock({ notFound: true });

    const trees = await scanPackageAssets('@canard/schema-form', {
      local: false,
    });

    // Should have found skills from local docs
    expect(trees.length).toBeGreaterThan(0);
    const skillsTree = trees.find((t) => t.label === 'skills');
    expect(skillsTree).toBeDefined();
    expect(skillsTree!.children!.length).toBe(2);

    // GitHub API should NOT be called
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should fallback to GitHub when local docs directory is empty', async () => {
    // Setup empty local docs (no asset type directories)
    const docsPath = join(
      fixture.tempDir,
      'node_modules',
      '@canard/schema-form',
      'docs/claude',
    );
    mkdirSync(docsPath, { recursive: true });

    // Mock process.cwd()
    process.cwd = () => fixture.tempDir;

    // Setup GitHub mock for fallback
    setupFetchMock({
      directoryEntries: {
        skills: [
          {
            name: 'remote-skill.md',
            path: 'packages/canard/schema-form/docs/claude/skills/remote-skill.md',
            type: 'file',
            download_url: 'https://raw.githubusercontent.com/...',
            sha: 'abc123',
          },
        ],
      },
    });

    const trees = await scanPackageAssets('@canard/schema-form', {
      local: false,
    });

    // Should have used GitHub since local docs were empty
    expect(trees.length).toBeGreaterThan(0);
    const skillsTree = trees.find((t) => t.label === 'skills');
    expect(skillsTree).toBeDefined();
  });

  it('should skip local docs and use GitHub when ref is specified', async () => {
    // Setup local docs
    const docsPath = join(
      fixture.tempDir,
      'node_modules',
      '@canard/schema-form',
      'docs/claude',
    );
    mkdirSync(join(docsPath, 'skills'), { recursive: true });
    writeFileSync(join(docsPath, 'skills', 'local-skill.md'), '# Local');

    // Mock process.cwd()
    process.cwd = () => fixture.tempDir;

    // Setup GitHub mock — should be called
    const mockFetch = setupFetchMock({
      directoryEntries: {
        skills: [
          {
            name: 'remote-skill.md',
            path: 'packages/canard/schema-form/docs/claude/skills/remote-skill.md',
            type: 'file',
            download_url: 'https://raw.githubusercontent.com/...',
            sha: 'abc123',
          },
        ],
      },
    });

    const trees = await scanPackageAssets('@canard/schema-form', {
      local: false,
      ref: 'v0.9.0',
    });

    // Should have called GitHub API (not using local docs)
    expect(mockFetch).toHaveBeenCalled();

    expect(trees.length).toBeGreaterThan(0);
    const skillsTree = trees.find((t) => t.label === 'skills');
    expect(skillsTree).toBeDefined();
    // Should contain the remote skill, not the local one
    const fileNames = skillsTree!.children!.map((c) => c.label);
    expect(fileNames).toContain('remote-skill.md');
    expect(fileNames).not.toContain('local-skill.md');
  });

  it('should throw when package has no claude.assetPath', async () => {
    const noClaudePackage: PackageInfo = {
      name: '@some/package',
      version: '1.0.0',
      repository: { type: 'git', url: 'https://github.com/owner/repo.git' },
    };
    const noClaudeFixture = createTestFixture([noClaudePackage]);
    process.cwd = () => noClaudeFixture.tempDir;

    await expect(
      scanPackageAssets('@some/package', { local: false }),
    ).rejects.toThrow('claude.assetPath');

    noClaudeFixture.cleanup();
  });
});
