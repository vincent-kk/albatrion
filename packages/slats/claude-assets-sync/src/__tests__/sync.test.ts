import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getDestinationDir, writeSyncMeta } from '../core/filesystem';
import { syncPackage, syncPackages } from '../core/sync';
import {
  type TestFixture,
  createTestFixture,
  mockCommandContent,
  mockCommandEntries,
  mockPackageWithoutClaude,
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
    // Setup existing sync meta with same version
    writeSyncMeta(fixture.tempDir, '@canard/schema-form', 'commands', {
      version: '0.10.0',
      syncedAt: new Date().toISOString(),
      files: ['cmd.md'],
    });

    const result = await syncPackage(
      '@canard/schema-form',
      { force: false, dryRun: false, local: false, ref: '' },
      fixture.tempDir,
    );

    expect(result.success).toBe(true);
    expect(result.skipped).toBe(true);
    expect(result.reason).toContain('Already synced');
  });

  it('should force sync even if version matches', async () => {
    writeSyncMeta(fixture.tempDir, '@canard/schema-form', 'commands', {
      version: '0.10.0',
      syncedAt: new Date().toISOString(),
      files: ['old-cmd.md'],
    });

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
      { force: true, dryRun: false, local: false, ref: '' },
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
      { force: false, dryRun: false, local: false, ref: '' },
      fixture.tempDir,
    );

    expect(result.success).toBe(true);
    expect(result.skipped).toBe(false);
    expect(result.syncedFiles?.commands).toContain('schema-form.md');
    expect(result.syncedFiles?.skills).toContain('schema-form-expert.md');
    expect(result.syncedFiles?.skills).toContain('validation.md');

    // Verify files were created
    const commandsDir = getDestinationDir(
      fixture.tempDir,
      '@canard/schema-form',
      'commands',
    );
    const skillsDir = getDestinationDir(
      fixture.tempDir,
      '@canard/schema-form',
      'skills',
    );

    expect(existsSync(join(commandsDir, 'schema-form.md'))).toBe(true);
    expect(existsSync(join(skillsDir, 'schema-form-expert.md'))).toBe(true);
    expect(existsSync(join(skillsDir, 'validation.md'))).toBe(true);

    // Verify sync meta was created
    expect(existsSync(join(commandsDir, '.sync-meta.json'))).toBe(true);
    expect(existsSync(join(skillsDir, '.sync-meta.json'))).toBe(true);
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
      { force: false, dryRun: false, local: false, ref: '' },
      fixture.tempDir,
    );

    expect(result.success).toBe(true);
    expect(result.syncedFiles?.commands).toHaveLength(1);
    expect(result.syncedFiles?.skills).toHaveLength(0);
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
      { force: false, dryRun: false, local: false, ref: '' },
      fixture.tempDir,
    );

    expect(result.success).toBe(true);
    expect(result.syncedFiles?.commands).toHaveLength(0);
    expect(result.syncedFiles?.skills).toHaveLength(2);
  });

  it('should return skipped if no assets found', async () => {
    setupFetchMock({
      directoryEntries: {},
    });

    const result = await syncPackage(
      '@canard/schema-form',
      { force: false, dryRun: false, local: false, ref: '' },
      fixture.tempDir,
    );

    expect(result.success).toBe(false);
    expect(result.skipped).toBe(true);
    expect(result.reason).toContain('No commands or skills found');
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
        { force: false, dryRun: true, local: false, ref: '' },
        fixture.tempDir,
      );

      expect(result.success).toBe(true);
      expect(result.skipped).toBe(false);
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
        { force: false, dryRun: true, local: false, ref: '' },
        fixture.tempDir,
      );

      expect(result.syncedFiles?.commands).toEqual(['schema-form.md']);
      expect(result.syncedFiles?.skills).toEqual([
        'schema-form-expert.md',
        'validation.md',
      ]);
    });
  });

  describe('error handling', () => {
    it('should handle rate limit error', async () => {
      setupFetchMock({ rateLimited: true });

      const result = await syncPackage(
        '@canard/schema-form',
        { force: false, dryRun: false, local: false, ref: '' },
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
        { force: false, dryRun: false, local: false, ref: '' },
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
      { force: false, dryRun: false, local: false, ref: '' },
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
      { force: false, dryRun: false, local: false, ref: '' },
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
      { force: false, dryRun: false, local: false, ref: '' },
      fixture.tempDir,
    );

    // Commands should be fetched before skills
    expect(mockFetch).toHaveBeenCalled();
  });
});
