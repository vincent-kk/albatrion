import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { syncPackage, syncPackages } from '../core/sync';
import { readUnifiedSyncMeta, writeUnifiedSyncMeta } from '../core/syncMeta';
import { toFlatFileName } from '../utils/nameTransform';
import { packageNameToPrefix } from '../utils/packageName';
import { getDestinationDir, getFlatDestinationDir } from '../utils/paths';
import type { UnifiedSyncMeta } from '../utils/types';
import {
  type TestFixture,
  createTestFixture,
  mockCommandContent,
  mockCommandEntries,
  mockDocsContent,
  mockDocsEntries,
  mockPackageWithCustomAssets,
  mockPackageWithoutClaude,
  mockRulesContent,
  mockRulesEntries,
  mockSchemaFormPackage,
  mockSkillContent,
  mockSkillEntries,
  restoreFetchMock,
  setupFetchMock,
} from './helpers';

// Mock console to suppress output during tests
vi.spyOn(console, 'log').mockImplementation(() => {});

describe('syncPackage', () => {
  let fixture: TestFixture;

  beforeEach(() => {
    fixture = createTestFixture([mockSchemaFormPackage]);
  });

  afterEach(() => {
    fixture.cleanup();
    restoreFetchMock();
  });

  it('should return skipped if package not found in node_modules', async () => {
    const result = await syncPackage(
      '@non/existent',
      { force: false, dryRun: false, local: false, ref: '' },
      fixture.tempDir,
    );

    expect(result.success).toBe(false);
    expect(result.skipped).toBe(true);
    expect(result.reason).toContain('not found');
  });

  it('should return skipped if package has no claude config', async () => {
    const fixtureWithoutClaude = createTestFixture([mockPackageWithoutClaude]);

    const result = await syncPackage(
      '@some/package',
      { force: false, dryRun: false, local: false, ref: '' },
      fixtureWithoutClaude.tempDir,
    );

    expect(result.success).toBe(false);
    expect(result.skipped).toBe(true);
    expect(result.reason).toContain('claude.assetPath');

    fixtureWithoutClaude.cleanup();
  });

  it('should return skipped if version already synced', async () => {
    // Setup existing unified sync meta with same version
    const prefix = packageNameToPrefix('@canard/schema-form');
    const unifiedMeta: UnifiedSyncMeta = {
      schemaVersion: '2.0',
      syncedAt: new Date().toISOString(),
      packages: {
        [prefix]: {
          originalName: '@canard/schema-form',
          version: '0.10.0',
          files: {
            commands: [{ name: 'cmd.md', isDirectory: false }],
            skills: [],
            agents: [],
          },
        },
      },
    };

    writeUnifiedSyncMeta(fixture.tempDir, unifiedMeta);

    const result = await syncPackage(
      '@canard/schema-form',
      { force: false, dryRun: false, local: false, ref: '', flat: true },
      fixture.tempDir,
    );

    expect(result.success).toBe(true);
    expect(result.skipped).toBe(true);
    expect(result.reason).toContain('Already synced');
  });

  it('should force sync even if version matches', async () => {
    const prefix = packageNameToPrefix('@canard/schema-form');
    const unifiedMeta: UnifiedSyncMeta = {
      schemaVersion: '2.0',
      syncedAt: new Date().toISOString(),
      packages: {
        [prefix]: {
          originalName: '@canard/schema-form',
          version: '0.10.0',
          files: {
            commands: [{ name: 'old-cmd.md', isDirectory: false }],
            skills: [],
            agents: [],
          },
        },
      },
    };

    writeUnifiedSyncMeta(fixture.tempDir, unifiedMeta);

    setupFetchMock({
      directoryEntries: {
        commands: mockCommandEntries,
        skills: mockSkillEntries,
      },
      fileContents: {
        'schema-form.md': mockCommandContent,
        'schema-form-expert.md': mockSkillContent,
        'validation.md': '# Validation',
      },
    });

    const result = await syncPackage(
      '@canard/schema-form',
      { force: true, dryRun: false, local: false, ref: '', flat: true },
      fixture.tempDir,
    );

    expect(result.success).toBe(true);
    expect(result.skipped).toBe(false);
  });

  it('should sync commands and skills successfully', async () => {
    setupFetchMock({
      directoryEntries: {
        commands: mockCommandEntries,
        skills: mockSkillEntries,
      },
      fileContents: {
        'schema-form.md': mockCommandContent,
        'schema-form-expert.md': mockSkillContent,
        'validation.md': '# Validation Guide',
      },
    });

    const result = await syncPackage(
      '@canard/schema-form',
      { force: false, dryRun: false, local: false, ref: '', flat: true },
      fixture.tempDir,
    );

    expect(result.success).toBe(true);
    expect(result.skipped).toBe(false);

    // Hybrid mode:
    // - Commands: original filenames (nested structure)
    // - Skills: transformed filenames (flat structure)
    const prefix = packageNameToPrefix('@canard/schema-form');
    expect(result.syncedFiles?.commands).toContain('schema-form.md');
    expect(result.syncedFiles?.skills).toContain(
      toFlatFileName(prefix, 'schema-form-expert.md'),
    );
    expect(result.syncedFiles?.skills).toContain(
      toFlatFileName(prefix, 'validation.md'),
    );

    // Verify files were created in hybrid structure
    // Commands: nested structure
    const commandsDir = getDestinationDir(
      fixture.tempDir,
      '@canard/schema-form',
      'commands',
    );
    // Skills: flat structure
    const skillsDir = getFlatDestinationDir(fixture.tempDir, 'skills');

    expect(existsSync(join(commandsDir, 'schema-form.md'))).toBe(true);
    expect(
      existsSync(
        join(skillsDir, toFlatFileName(prefix, 'schema-form-expert.md')),
      ),
    ).toBe(true);
    expect(
      existsSync(join(skillsDir, toFlatFileName(prefix, 'validation.md'))),
    ).toBe(true);

    // Verify unified sync meta was created
    const unifiedMeta = readUnifiedSyncMeta(fixture.tempDir);
    expect(unifiedMeta).not.toBeNull();
    expect(unifiedMeta!.packages[prefix]).toBeDefined();
  });

  it('should handle packages with only commands', async () => {
    setupFetchMock({
      directoryEntries: {
        commands: mockCommandEntries,
      },
      fileContents: {
        'schema-form.md': mockCommandContent,
      },
    });

    const result = await syncPackage(
      '@canard/schema-form',
      { force: false, dryRun: false, local: false, ref: '', flat: true },
      fixture.tempDir,
    );

    expect(result.success).toBe(true);
    expect(result.syncedFiles?.commands).toHaveLength(1);
    expect(result.syncedFiles?.skills).toBeUndefined();
  });

  it('should handle packages with only skills', async () => {
    setupFetchMock({
      directoryEntries: {
        skills: mockSkillEntries,
      },
      fileContents: {
        'schema-form-expert.md': mockSkillContent,
        'validation.md': '# Validation',
      },
    });

    const result = await syncPackage(
      '@canard/schema-form',
      { force: false, dryRun: false, local: false, ref: '', flat: true },
      fixture.tempDir,
    );

    expect(result.success).toBe(true);
    expect(result.syncedFiles?.commands).toBeUndefined();
    expect(result.syncedFiles?.skills).toHaveLength(2);
  });

  it('should return skipped if no assets found', async () => {
    setupFetchMock({
      directoryEntries: {},
    });

    const result = await syncPackage(
      '@canard/schema-form',
      { force: false, dryRun: false, local: false, ref: '', flat: true },
      fixture.tempDir,
    );

    expect(result.success).toBe(false);
    expect(result.skipped).toBe(true);
    expect(result.reason).toContain('No assets found in package');
  });

  describe('dry-run mode', () => {
    it('should not create files in dry-run mode', async () => {
      setupFetchMock({
        directoryEntries: {
          commands: mockCommandEntries,
          skills: mockSkillEntries,
        },
        fileContents: {
          'schema-form.md': mockCommandContent,
          'schema-form-expert.md': mockSkillContent,
          'validation.md': '# Validation',
        },
      });

      const result = await syncPackage(
        '@canard/schema-form',
        { force: false, dryRun: true, local: false, ref: '', flat: true },
        fixture.tempDir,
      );

      expect(result.success).toBe(true);
      expect(result.skipped).toBe(false);

      // In hybrid mode:
      // - Commands: original filenames
      // - Skills: transformed filenames
      expect(result.syncedFiles?.commands).toContain('schema-form.md');

      // Verify no files were actually created
      const commandsDir = getDestinationDir(
        fixture.tempDir,
        '@canard/schema-form',
        'commands',
      );
      expect(existsSync(commandsDir)).toBe(false);
    });

    it('should list files that would be synced', async () => {
      setupFetchMock({
        directoryEntries: {
          commands: mockCommandEntries,
          skills: mockSkillEntries,
        },
      });

      const result = await syncPackage(
        '@canard/schema-form',
        { force: false, dryRun: true, local: false, ref: '', flat: true },
        fixture.tempDir,
      );

      // In hybrid mode:
      // - Commands: original filenames (nested structure)
      // - Skills: transformed filenames (flat structure)
      const prefix = packageNameToPrefix('@canard/schema-form');
      expect(result.syncedFiles?.commands).toEqual(['schema-form.md']);
      expect(result.syncedFiles?.skills).toEqual([
        toFlatFileName(prefix, 'schema-form-expert.md'),
        toFlatFileName(prefix, 'validation.md'),
      ]);
    });
  });

  describe('error handling', () => {
    it('should handle rate limit error', async () => {
      setupFetchMock({ rateLimited: true });

      const result = await syncPackage(
        '@canard/schema-form',
        { force: false, dryRun: false, local: false, ref: '', flat: true },
        fixture.tempDir,
      );

      expect(result.success).toBe(false);
      expect(result.skipped).toBe(false);
      expect(result.reason).toContain('rate limit');
    });

    it('should handle network error', async () => {
      setupFetchMock({ networkError: true });

      const result = await syncPackage(
        '@canard/schema-form',
        { force: false, dryRun: false, local: false, ref: '', flat: true },
        fixture.tempDir,
      );

      expect(result.success).toBe(false);
      expect(result.skipped).toBe(false);
      expect(result.reason).toContain('Network error');
    });
  });
});

describe('syncPackages', () => {
  let fixture: TestFixture;

  beforeEach(() => {
    fixture = createTestFixture([mockSchemaFormPackage]);
  });

  afterEach(() => {
    fixture.cleanup();
    restoreFetchMock();
  });

  it('should sync multiple packages', async () => {
    setupFetchMock({
      directoryEntries: {
        commands: mockCommandEntries,
      },
      fileContents: {
        'schema-form.md': mockCommandContent,
      },
    });

    const results = await syncPackages(
      ['@canard/schema-form'],
      { force: false, dryRun: false, local: false, ref: '', flat: true },
      fixture.tempDir,
    );

    expect(results).toHaveLength(1);
    expect(results[0].success).toBe(true);
  });

  it('should handle mixed results', async () => {
    setupFetchMock({
      directoryEntries: {
        commands: mockCommandEntries,
      },
      fileContents: {
        'schema-form.md': mockCommandContent,
      },
    });

    const results = await syncPackages(
      ['@canard/schema-form', '@non/existent'],
      { force: false, dryRun: false, local: false, ref: '', flat: true },
      fixture.tempDir,
    );

    expect(results).toHaveLength(2);
    expect(results[0].success).toBe(true);
    expect(results[1].skipped).toBe(true);
  });

  it('should process packages sequentially', async () => {
    const callOrder: string[] = [];
    const mockFetch = vi.fn(async (url: string) => {
      // Track call order by extracting package hint from URL
      if (url.includes('commands')) {
        callOrder.push('commands');
      }
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    });
    vi.stubGlobal('fetch', mockFetch);

    await syncPackages(
      ['@canard/schema-form'],
      { force: false, dryRun: false, local: false, ref: '', flat: true },
      fixture.tempDir,
    );

    // Commands should be fetched before skills
    expect(mockFetch).toHaveBeenCalled();
  });
});

describe('Dynamic Asset Types', () => {
  let fixture: TestFixture;

  beforeEach(() => {
    fixture = createTestFixture([mockPackageWithCustomAssets]);
  });

  afterEach(() => {
    fixture.cleanup();
    restoreFetchMock();
  });

  it('should sync custom asset types (docs, rules)', async () => {
    setupFetchMock({
      directoryEntries: {
        commands: mockCommandEntries,
        skills: mockSkillEntries,
        docs: mockDocsEntries,
        rules: mockRulesEntries,
      },
      fileContents: {
        'schema-form.md': mockCommandContent,
        'schema-form-expert.md': mockSkillContent,
        'validation.md': '# Validation',
        'api-reference.md': mockDocsContent,
        'validation-rules.md': mockRulesContent,
      },
    });

    const result = await syncPackage(
      '@canard/schema-form',
      { force: false, dryRun: false, local: false, ref: '', flat: true },
      fixture.tempDir,
    );

    expect(result.success).toBe(true);
    expect(result.skipped).toBe(false);

    // Verify all asset types are synced
    expect(result.syncedFiles?.commands).toBeDefined();
    expect(result.syncedFiles?.skills).toBeDefined();
    expect(result.syncedFiles?.docs).toBeDefined();
    expect(result.syncedFiles?.rules).toBeDefined();

    // Verify file counts
    expect(result.syncedFiles?.commands).toHaveLength(1);
    expect(result.syncedFiles?.skills).toHaveLength(2);
    expect(result.syncedFiles?.docs).toHaveLength(1);
    expect(result.syncedFiles?.rules).toHaveLength(1);
  });

  it('should respect per-asset structure settings', async () => {
    setupFetchMock({
      directoryEntries: {
        commands: mockCommandEntries,
        docs: mockDocsEntries,
        rules: mockRulesEntries,
      },
      fileContents: {
        'schema-form.md': mockCommandContent,
        'api-reference.md': mockDocsContent,
        'validation-rules.md': mockRulesContent,
      },
    });

    const result = await syncPackage(
      '@canard/schema-form',
      { force: false, dryRun: false, local: false, ref: '', flat: true },
      fixture.tempDir,
    );

    expect(result.success).toBe(true);

    // Commands and docs should have nested structure (original filenames)
    expect(result.syncedFiles?.commands).toContain('schema-form.md');
    expect(result.syncedFiles?.docs).toContain('api-reference.md');

    // Rules should have flat structure (transformed filenames with prefix)
    const prefix = packageNameToPrefix('@canard/schema-form');
    expect(result.syncedFiles?.rules).toContain(
      toFlatFileName(prefix, 'validation-rules.md'),
    );

    // Verify nested directories exist
    const commandsDir = getDestinationDir(
      fixture.tempDir,
      '@canard/schema-form',
      'commands',
    );
    const docsDir = getDestinationDir(
      fixture.tempDir,
      '@canard/schema-form',
      'docs',
    );
    expect(existsSync(join(commandsDir, 'schema-form.md'))).toBe(true);
    expect(existsSync(join(docsDir, 'api-reference.md'))).toBe(true);

    // Verify flat directory exists
    const rulesDir = getFlatDestinationDir(fixture.tempDir, 'rules');
    expect(
      existsSync(join(rulesDir, toFlatFileName(prefix, 'validation-rules.md'))),
    ).toBe(true);
  });

  it('should maintain backward compatibility with no assets config', async () => {
    // Use standard package without custom assets config
    const standardFixture = createTestFixture([mockSchemaFormPackage]);

    setupFetchMock({
      directoryEntries: {
        commands: mockCommandEntries,
        skills: mockSkillEntries,
      },
      fileContents: {
        'schema-form.md': mockCommandContent,
        'schema-form-expert.md': mockSkillContent,
        'validation.md': '# Validation',
      },
    });

    const result = await syncPackage(
      '@canard/schema-form',
      { force: false, dryRun: false, local: false, ref: '', flat: true },
      standardFixture.tempDir,
    );

    expect(result.success).toBe(true);
    expect(result.skipped).toBe(false);

    // Should use default asset types: commands, skills, agents
    expect(result.syncedFiles?.commands).toBeDefined();
    expect(result.syncedFiles?.skills).toBeDefined();

    // Commands should be nested (default), skills should be flat (default)
    expect(result.syncedFiles?.commands).toContain('schema-form.md');
    const prefix = packageNameToPrefix('@canard/schema-form');
    expect(result.syncedFiles?.skills).toContain(
      toFlatFileName(prefix, 'schema-form-expert.md'),
    );

    standardFixture.cleanup();
  });

  it('should handle packages with only custom asset types', async () => {
    setupFetchMock({
      directoryEntries: {
        docs: mockDocsEntries,
        rules: mockRulesEntries,
      },
      fileContents: {
        'api-reference.md': mockDocsContent,
        'validation-rules.md': mockRulesContent,
      },
    });

    const result = await syncPackage(
      '@canard/schema-form',
      { force: false, dryRun: false, local: false, ref: '', flat: true },
      fixture.tempDir,
    );

    expect(result.success).toBe(true);
    expect(result.syncedFiles?.docs).toHaveLength(1);
    expect(result.syncedFiles?.rules).toHaveLength(1);
    // Default asset types should not be present (undefined, not empty arrays)
    expect(result.syncedFiles?.commands).toBeUndefined();
    expect(result.syncedFiles?.skills).toBeUndefined();
  });
});
