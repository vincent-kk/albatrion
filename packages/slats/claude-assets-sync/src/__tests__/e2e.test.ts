import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { syncPackage, syncPackages } from '../core/sync';
import { readUnifiedSyncMeta } from '../core/syncMeta';
import { toFlatFileName } from '../utils/nameTransform';
import { packageNameToPrefix } from '../utils/packageName';
import { getDestinationDir, getFlatDestinationDir } from '../utils/paths';
import type { PackageInfo, UnifiedSyncMeta } from '../utils/types';
import { VERSION } from '../version';
import {
  type TestFixture,
  createTestFixture,
  mockCommandContent,
  mockCommandEntries,
  mockSchemaFormPackage,
  mockSkillContent,
  mockSkillEntries,
  restoreFetchMock,
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
        { force: false, dryRun: false, local: false, flat: true },
        fixture.tempDir,
      );

      // Verify result
      expect(result.success).toBe(true);
      expect(result.skipped).toBe(false);

      // Verify hybrid directory structure:
      // - Commands use NESTED structure
      // - Skills use FLAT structure
      const commandsDir = getDestinationDir(
        fixture.tempDir,
        '@canard/schema-form',
        'commands',
      );
      const skillsDir = getFlatDestinationDir(fixture.tempDir, 'skills');

      expect(existsSync(commandsDir)).toBe(true);
      expect(existsSync(skillsDir)).toBe(true);

      // Calculate file names
      const prefix = packageNameToPrefix('@canard/schema-form');
      // Commands: original filename (nested structure)
      const commandFile = 'schema-form.md';
      // Skills: transformed filename (flat structure)
      const skillFile1 = toFlatFileName(prefix, 'schema-form-expert.md');
      const skillFile2 = toFlatFileName(prefix, 'validation.md');

      // Verify files exist in correct locations
      expect(existsSync(join(commandsDir, commandFile))).toBe(true);
      expect(existsSync(join(skillsDir, skillFile1))).toBe(true);
      expect(existsSync(join(skillsDir, skillFile2))).toBe(true);

      // Verify file contents
      const commandContent = readFileSync(
        join(commandsDir, commandFile),
        'utf-8',
      );
      expect(commandContent).toBe(mockCommandContent);

      // Verify unified sync meta
      const unifiedMeta = readUnifiedSyncMeta(fixture.tempDir);
      expect(unifiedMeta).not.toBeNull();
      expect(unifiedMeta!.schemaVersion).toBe(VERSION);
      expect(unifiedMeta!.packages[prefix]).toBeDefined();
      expect(unifiedMeta!.packages[prefix].version).toBe('0.10.0');
      expect(unifiedMeta!.packages[prefix].originalName).toBe(
        '@canard/schema-form',
      );

      // Verify synced files structure:
      // - commands: string[] (original filenames)
      // - skills: FileMapping[] (with original and transformed)
      const commandFiles = unifiedMeta!.packages[prefix].files.commands;
      expect(commandFiles).toHaveLength(1);
      expect(commandFiles[0]).toBe('schema-form.md');

      const skillFiles = unifiedMeta!.packages[prefix].files.skills;
      expect(skillFiles).toHaveLength(2);
      expect(
        skillFiles.find(
          (f) =>
            typeof f !== 'string' && f.original === 'schema-form-expert.md',
        ),
      ).toBeDefined();
      expect(
        skillFiles.find(
          (f) => typeof f !== 'string' && f.original === 'validation.md',
        ),
      ).toBeDefined();
    });

    it('should skip sync when version matches', async () => {
      // Setup existing unified sync meta
      const prefix = packageNameToPrefix('@canard/schema-form');

      const unifiedMeta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: new Date().toISOString(),
        packages: {
          [prefix]: {
            originalName: '@canard/schema-form',
            version: '0.10.0',
            files: {
              commands: ['schema-form.md'],
              skills: [],
              agents: [],
            },
          },
        },
      };

      // Write unified meta manually
      const metaPath = join(fixture.tempDir, '.claude/.sync-meta.json');
      const claudeDir = join(fixture.tempDir, '.claude');
      const { mkdirSync, writeFileSync } = await import('node:fs');
      mkdirSync(claudeDir, { recursive: true });
      writeFileSync(metaPath, JSON.stringify(unifiedMeta, null, 2));

      const result = await syncPackage(
        '@canard/schema-form',
        { force: false, dryRun: false, local: false, flat: true },
        fixture.tempDir,
      );

      expect(result.success).toBe(true);
      expect(result.skipped).toBe(true);
      expect(result.reason).toContain('Already synced');
    });

    it('should re-sync when version changes', async () => {
      // Setup existing unified sync meta with older version
      const prefix = packageNameToPrefix('@canard/schema-form');

      const unifiedMeta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: new Date().toISOString(),
        packages: {
          [prefix]: {
            originalName: '@canard/schema-form',
            version: '0.9.0',
            files: {
              commands: ['old-command.md'],
              skills: [],
              agents: [],
            },
          },
        },
      };

      const metaPath = join(fixture.tempDir, '.claude/.sync-meta.json');
      const claudeDir = join(fixture.tempDir, '.claude');
      const { mkdirSync, writeFileSync } = await import('node:fs');
      mkdirSync(claudeDir, { recursive: true });
      writeFileSync(metaPath, JSON.stringify(unifiedMeta, null, 2));

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
        { force: false, dryRun: false, local: false, flat: true },
        fixture.tempDir,
      );

      expect(result.success).toBe(true);
      expect(result.skipped).toBe(false);

      // Verify new version in unified meta
      const updatedMeta = readUnifiedSyncMeta(fixture.tempDir);
      expect(updatedMeta).not.toBeNull();
      expect(updatedMeta!.packages[prefix].version).toBe('0.10.0');
    });

    it('should clean old files when re-syncing', async () => {
      // Setup existing unified sync meta with different files
      // Commands use NESTED structure with original filenames
      const prefix = packageNameToPrefix('@canard/schema-form');

      const unifiedMeta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: new Date().toISOString(),
        packages: {
          [prefix]: {
            originalName: '@canard/schema-form',
            version: '0.9.0',
            files: {
              // Commands: string[] (original filenames)
              commands: ['old-command.md'],
              skills: [],
              agents: [],
            },
          },
        },
      };

      const metaPath = join(fixture.tempDir, '.claude/.sync-meta.json');
      // Commands use nested structure
      const commandsDir = getDestinationDir(
        fixture.tempDir,
        '@canard/schema-form',
        'commands',
      );
      const { mkdirSync, writeFileSync } = await import('node:fs');
      mkdirSync(commandsDir, { recursive: true });
      writeFileSync(metaPath, JSON.stringify(unifiedMeta, null, 2));

      // Create old file in nested directory
      writeFileSync(join(commandsDir, 'old-command.md'), '# Old content');

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
        { force: false, dryRun: false, local: false, flat: true },
        fixture.tempDir,
      );

      // Old file should be removed (cleanAssetDir removes entire nested directory)
      expect(existsSync(join(commandsDir, 'old-command.md'))).toBe(false);
      // New file should exist with original filename in nested structure
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
        { force: false, dryRun: false, local: false, flat: true },
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
        { force: false, dryRun: false, local: false, flat: true },
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
        { force: false, dryRun: true, local: false, flat: true },
        fixture.tempDir,
      );

      expect(result.success).toBe(true);

      // In hybrid mode:
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

      // Verify no directories were created
      const claudeDir = join(fixture.tempDir, '.claude');
      expect(existsSync(claudeDir)).toBe(false);
    });
  });

  describe('Force mode E2E', () => {
    it('should re-sync even when version matches', async () => {
      // Setup existing unified sync with same version
      // Commands use string[] (original filenames) in hybrid mode
      const prefix = packageNameToPrefix('@canard/schema-form');

      const unifiedMeta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: '2020-01-01T00:00:00.000Z',
        packages: {
          [prefix]: {
            originalName: '@canard/schema-form',
            version: '0.10.0',
            files: {
              // Commands: string[] (original filenames)
              commands: ['old-file.md'],
              skills: [],
              agents: [],
            },
          },
        },
      };

      const metaPath = join(fixture.tempDir, '.claude/.sync-meta.json');
      const claudeDir = join(fixture.tempDir, '.claude');
      const { mkdirSync, writeFileSync } = await import('node:fs');
      mkdirSync(claudeDir, { recursive: true });
      writeFileSync(metaPath, JSON.stringify(unifiedMeta, null, 2));

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
        { force: true, dryRun: false, local: false, flat: true },
        fixture.tempDir,
      );

      expect(result.success).toBe(true);
      expect(result.skipped).toBe(false);

      // Verify unified sync meta was updated
      const updatedMeta = readUnifiedSyncMeta(fixture.tempDir);
      expect(updatedMeta).not.toBeNull();

      // Should have new timestamp
      expect(updatedMeta!.syncedAt).not.toBe('2020-01-01T00:00:00.000Z');
      // Commands use string[] with original filenames in hybrid mode
      expect(updatedMeta!.packages[prefix].files.commands).toContain(
        'schema-form.md',
      );
      expect(updatedMeta!.packages[prefix].files.commands).not.toContain(
        'old-file.md',
      );
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
        { force: false, dryRun: false, local: false, flat: true },
        fixture.tempDir,
      );

      expect(result.success).toBe(true);
      expect(result.syncedFiles?.commands).toHaveLength(1);
      expect(result.syncedFiles?.skills).toBeUndefined();

      // Commands use NESTED structure with original filenames
      const commandsDir = getDestinationDir(
        fixture.tempDir,
        '@canard/schema-form',
        'commands',
      );
      expect(existsSync(commandsDir)).toBe(true);

      // Commands keep original filename in nested directory
      expect(existsSync(join(commandsDir, 'schema-form.md'))).toBe(true);
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
        { force: false, dryRun: false, local: false, flat: true },
        fixture.tempDir,
      );

      expect(result.success).toBe(true);
      expect(result.syncedFiles?.commands).toBeUndefined();
      expect(result.syncedFiles?.skills).toHaveLength(2);

      // Skills use FLAT structure with transformed filenames
      const skillsDir = getFlatDestinationDir(fixture.tempDir, 'skills');
      const prefix = packageNameToPrefix('@canard/schema-form');
      expect(
        existsSync(
          join(skillsDir, toFlatFileName(prefix, 'schema-form-expert.md')),
        ),
      ).toBe(true);
      expect(
        existsSync(join(skillsDir, toFlatFileName(prefix, 'validation.md'))),
      ).toBe(true);
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
        { force: false, dryRun: false, local: false, flat: true },
        unscopedFixture.tempDir,
      );

      expect(result.success).toBe(true);

      // Commands use NESTED structure even for unscoped packages
      const commandsDir = getDestinationDir(
        unscopedFixture.tempDir,
        'my-package',
        'commands',
      );
      expect(commandsDir).toBe(
        join(unscopedFixture.tempDir, '.claude/commands/my-package'),
      );

      // Commands keep original filename in nested directory
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
        { force: false, dryRun: false, local: false, flat: true },
        fixture.tempDir,
      );

      // Commands use NESTED structure with original filename
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
