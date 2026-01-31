import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getDestinationDir } from '../core/filesystem';
import { syncPackage, syncPackages } from '../core/sync';
import type { PackageInfo, SyncMeta } from '../utils/types';
import {
  type TestFixture,
  createTestFixture,
  mockCommandContent,
  mockCommandEntries,
  mockSchemaFormPackage,
  mockSkillContent,
  mockSkillEntries,
  restoreFetchMock,
  setupExistingSyncMeta,
  setupFetchMock,
} from './helpers';

// Suppress console output during tests
vi.spyOn(console, 'log').mockImplementation(() => {});

describe('E2E: Full Sync Flow', () => {
  let fixture: TestFixture;

  beforeEach(() => {
    fixture = createTestFixture([mockSchemaFormPackage]);
  });

  afterEach(() => {
    fixture.cleanup();
    restoreFetchMock();
  });

  describe('Complete sync workflow', () => {
    it('should sync a package from scratch', async () => {
      setupFetchMock({
        directoryEntries: {
          commands: mockCommandEntries,
          skills: mockSkillEntries,
        },
        fileContents: {
          'schema-form.md': mockCommandContent,
          'schema-form-expert.md': mockSkillContent,
          'validation.md': '# Validation Guide\n\nValidation content here.',
        },
      });

      // Sync the package
      const result = await syncPackage(
        '@canard/schema-form',
        { force: false, dryRun: false },
        fixture.tempDir,
      );

      // Verify result
      expect(result.success).toBe(true);
      expect(result.skipped).toBe(false);

      // Verify directory structure
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

      expect(existsSync(commandsDir)).toBe(true);
      expect(existsSync(skillsDir)).toBe(true);

      // Verify files
      expect(existsSync(join(commandsDir, 'schema-form.md'))).toBe(true);
      expect(existsSync(join(skillsDir, 'schema-form-expert.md'))).toBe(true);
      expect(existsSync(join(skillsDir, 'validation.md'))).toBe(true);

      // Verify file contents
      const commandContent = readFileSync(
        join(commandsDir, 'schema-form.md'),
        'utf-8',
      );
      expect(commandContent).toBe(mockCommandContent);

      // Verify sync meta
      const commandsMeta: SyncMeta = JSON.parse(
        readFileSync(join(commandsDir, '.sync-meta.json'), 'utf-8'),
      );
      expect(commandsMeta.version).toBe('0.10.0');
      expect(commandsMeta.files).toEqual(['schema-form.md']);

      const skillsMeta: SyncMeta = JSON.parse(
        readFileSync(join(skillsDir, '.sync-meta.json'), 'utf-8'),
      );
      expect(skillsMeta.version).toBe('0.10.0');
      expect(skillsMeta.files).toContain('schema-form-expert.md');
      expect(skillsMeta.files).toContain('validation.md');
    });

    it('should skip sync when version matches', async () => {
      // Setup existing sync
      setupExistingSyncMeta(
        fixture.tempDir,
        '@canard/schema-form',
        'commands',
        {
          version: '0.10.0',
          syncedAt: new Date().toISOString(),
          files: ['schema-form.md'],
        },
      );

      const result = await syncPackage(
        '@canard/schema-form',
        { force: false, dryRun: false },
        fixture.tempDir,
      );

      expect(result.success).toBe(true);
      expect(result.skipped).toBe(true);
      expect(result.reason).toContain('Already synced');
    });

    it('should re-sync when version changes', async () => {
      // Setup existing sync with older version
      setupExistingSyncMeta(
        fixture.tempDir,
        '@canard/schema-form',
        'commands',
        {
          version: '0.9.0',
          syncedAt: new Date().toISOString(),
          files: ['old-command.md'],
        },
      );

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
        { force: false, dryRun: false },
        fixture.tempDir,
      );

      expect(result.success).toBe(true);
      expect(result.skipped).toBe(false);

      // Verify new version in meta
      const commandsDir = getDestinationDir(
        fixture.tempDir,
        '@canard/schema-form',
        'commands',
      );
      const meta: SyncMeta = JSON.parse(
        readFileSync(join(commandsDir, '.sync-meta.json'), 'utf-8'),
      );
      expect(meta.version).toBe('0.10.0');
    });

    it('should clean old files when re-syncing', async () => {
      // Setup existing sync with different files
      setupExistingSyncMeta(
        fixture.tempDir,
        '@canard/schema-form',
        'commands',
        {
          version: '0.9.0',
          syncedAt: new Date().toISOString(),
          files: ['old-command.md'],
        },
      );

      // Create old file
      const commandsDir = getDestinationDir(
        fixture.tempDir,
        '@canard/schema-form',
        'commands',
      );

      setupFetchMock({
        directoryEntries: {
          commands: mockCommandEntries,
        },
        fileContents: {
          'schema-form.md': mockCommandContent,
        },
      });

      await syncPackage(
        '@canard/schema-form',
        { force: false, dryRun: false },
        fixture.tempDir,
      );

      // Old files should be removed (directory was cleaned)
      expect(existsSync(join(commandsDir, 'old-command.md'))).toBe(false);
      // New file should exist
      expect(existsSync(join(commandsDir, 'schema-form.md'))).toBe(true);
    });
  });

  describe('Multiple packages sync', () => {
    it('should sync multiple packages independently', async () => {
      const promiseModalPackage: PackageInfo = {
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

      // Setup both packages
      const multiFixture = createTestFixture([
        mockSchemaFormPackage,
        promiseModalPackage,
      ]);

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

      const results = await syncPackages(
        ['@canard/schema-form', '@lerx/promise-modal'],
        { force: false, dryRun: false },
        multiFixture.tempDir,
      );

      expect(results).toHaveLength(2);
      expect(results[0].packageName).toBe('@canard/schema-form');
      expect(results[1].packageName).toBe('@lerx/promise-modal');

      multiFixture.cleanup();
    });

    it('should continue syncing if one package fails', async () => {
      setupFetchMock({
        directoryEntries: {
          commands: mockCommandEntries,
        },
        fileContents: {
          'schema-form.md': mockCommandContent,
        },
      });

      const results = await syncPackages(
        ['@non/existent', '@canard/schema-form'],
        { force: false, dryRun: false },
        fixture.tempDir,
      );

      expect(results).toHaveLength(2);
      expect(results[0].skipped).toBe(true); // Non-existent
      expect(results[1].success).toBe(true); // Schema form
    });
  });

  describe('Dry-run mode E2E', () => {
    it('should not modify filesystem in dry-run', async () => {
      setupFetchMock({
        directoryEntries: {
          commands: mockCommandEntries,
          skills: mockSkillEntries,
        },
      });

      const result = await syncPackage(
        '@canard/schema-form',
        { force: false, dryRun: true },
        fixture.tempDir,
      );

      expect(result.success).toBe(true);
      expect(result.syncedFiles?.commands).toContain('schema-form.md');

      // Verify no directories were created
      const claudeDir = join(fixture.tempDir, '.claude');
      expect(existsSync(claudeDir)).toBe(false);
    });
  });

  describe('Force mode E2E', () => {
    it('should re-sync even when version matches', async () => {
      // Setup existing sync with same version
      setupExistingSyncMeta(
        fixture.tempDir,
        '@canard/schema-form',
        'commands',
        {
          version: '0.10.0',
          syncedAt: '2020-01-01T00:00:00.000Z', // Old date
          files: ['old-file.md'],
        },
      );

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
        { force: true, dryRun: false },
        fixture.tempDir,
      );

      expect(result.success).toBe(true);
      expect(result.skipped).toBe(false);

      // Verify sync meta was updated
      const commandsDir = getDestinationDir(
        fixture.tempDir,
        '@canard/schema-form',
        'commands',
      );
      const meta: SyncMeta = JSON.parse(
        readFileSync(join(commandsDir, '.sync-meta.json'), 'utf-8'),
      );

      // Should have new timestamp
      expect(meta.syncedAt).not.toBe('2020-01-01T00:00:00.000Z');
      // Should have new files
      expect(meta.files).toContain('schema-form.md');
      expect(meta.files).not.toContain('old-file.md');
    });
  });

  describe('Edge cases', () => {
    it('should handle package with only commands', async () => {
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
        { force: false, dryRun: false },
        fixture.tempDir,
      );

      expect(result.success).toBe(true);
      expect(result.syncedFiles?.commands).toHaveLength(1);
      expect(result.syncedFiles?.skills).toHaveLength(0);

      // Only commands directory should exist
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

      expect(existsSync(commandsDir)).toBe(true);
      expect(existsSync(skillsDir)).toBe(false);
    });

    it('should handle package with only skills', async () => {
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
        { force: false, dryRun: false },
        fixture.tempDir,
      );

      expect(result.success).toBe(true);
      expect(result.syncedFiles?.commands).toHaveLength(0);
      expect(result.syncedFiles?.skills).toHaveLength(2);
    });

    it('should handle unscoped package names', async () => {
      const unscopedPackage: PackageInfo = {
        name: 'my-package',
        version: '1.0.0',
        repository: {
          type: 'git',
          url: 'https://github.com/owner/repo.git',
        },
        claude: {
          assetPath: 'docs/claude',
        },
      };

      const unscopedFixture = createTestFixture([unscopedPackage]);

      setupFetchMock({
        directoryEntries: {
          commands: [
            {
              name: 'command.md',
              path: 'docs/claude/commands/command.md',
              type: 'file',
              download_url: 'https://example.com/command.md',
              sha: 'abc',
            },
          ],
        },
        fileContents: {
          'command.md': '# Command',
        },
      });

      const result = await syncPackage(
        'my-package',
        { force: false, dryRun: false },
        unscopedFixture.tempDir,
      );

      expect(result.success).toBe(true);

      // Verify path structure for unscoped package
      const commandsDir = getDestinationDir(
        unscopedFixture.tempDir,
        'my-package',
        'commands',
      );
      expect(commandsDir).toBe(
        join(unscopedFixture.tempDir, '.claude/commands/my-package'),
      );
      expect(existsSync(join(commandsDir, 'command.md'))).toBe(true);

      unscopedFixture.cleanup();
    });

    it('should preserve file content exactly', async () => {
      const complexContent = `# Complex Content

\`\`\`typescript
const example = {
  key: "value",
  nested: {
    array: [1, 2, 3]
  }
};
\`\`\`

## Special Characters
- Unicode: 한글, 日本語, emoji 🚀
- Escapes: \t\n\\
`;

      setupFetchMock({
        directoryEntries: {
          commands: mockCommandEntries,
        },
        fileContents: {
          'schema-form.md': complexContent,
        },
      });

      await syncPackage(
        '@canard/schema-form',
        { force: false, dryRun: false },
        fixture.tempDir,
      );

      const commandsDir = getDestinationDir(
        fixture.tempDir,
        '@canard/schema-form',
        'commands',
      );
      const savedContent = readFileSync(
        join(commandsDir, 'schema-form.md'),
        'utf-8',
      );

      expect(savedContent).toBe(complexContent);
    });
  });
});
