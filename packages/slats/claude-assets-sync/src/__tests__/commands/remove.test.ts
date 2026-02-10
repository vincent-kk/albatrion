/**
 * Unit tests for remove command
 */
import { existsSync } from 'node:fs';
import * as fs from 'node:fs';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { runRemoveCommand } from '../../commands/remove';
import { ensureDir } from '../../core/filesystem';
import { readUnifiedSyncMeta, writeUnifiedSyncMeta } from '../../core/syncMeta';
import { packageNameToPrefix } from '../../utils/packageName';
import { getDestinationDir, getFlatDestinationDir } from '../../utils/paths';
import type { FileMapping, UnifiedSyncMeta } from '../../utils/types';
import { type TestFixture, createTestFixture } from '../helpers';

// Mock console and readline
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
const mockProcessExit = vi
  .spyOn(process, 'exit')
  .mockImplementation((() => {}) as never);

describe('remove command', () => {
  let fixture: TestFixture;

  beforeEach(() => {
    fixture = createTestFixture([]);
    mockConsoleLog.mockClear();
    mockProcessExit.mockClear();
  });

  afterEach(() => {
    fixture.cleanup();
  });

  describe('runRemoveCommand', () => {
    it('should exit with error if package not synced', async () => {
      await runRemoveCommand(
        { package: '@non/existent', yes: true, dryRun: false },
        fixture.tempDir,
      );

      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });

    it('should list files to remove in dry-run mode', async () => {
      const prefix = packageNameToPrefix('@canard/schema-form');
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: '2025-02-01T10:00:00.000Z',
        packages: {
          [prefix]: {
            originalName: '@canard/schema-form',
            version: '0.10.0',
            files: {
              commands: ['schema-form.md', 'generate.md'],
              skills: ['expert.md'],
            },
          },
        },
      };

      writeUnifiedSyncMeta(fixture.tempDir, meta);

      // Create actual files
      const commandsDir = getDestinationDir(
        fixture.tempDir,
        '@canard/schema-form',
        'commands',
      );
      ensureDir(commandsDir);
      fs.writeFileSync(join(commandsDir, 'schema-form.md'), 'content');

      await runRemoveCommand(
        { package: '@canard/schema-form', yes: true, dryRun: true },
        fixture.tempDir,
      );

      // Verify dry-run message (logger.info uses console.log(pc.blue('info'), message))
      // picocolors adds ANSI codes, so we check if any call contains the message
      const dryRunCall = mockConsoleLog.mock.calls.find((call) =>
        call.some((arg) => String(arg).includes('[DRY RUN]')),
      );
      expect(dryRunCall).toBeDefined();

      // Verify files still exist
      expect(existsSync(commandsDir)).toBe(true);
    });

    it('should remove nested structure files and update metadata', async () => {
      const prefix = packageNameToPrefix('@canard/schema-form');
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: '2025-02-01T10:00:00.000Z',
        packages: {
          [prefix]: {
            originalName: '@canard/schema-form',
            version: '0.10.0',
            files: {
              commands: ['schema-form.md', 'generate.md'],
            },
          },
        },
      };

      writeUnifiedSyncMeta(fixture.tempDir, meta);

      // Create actual files
      const commandsDir = getDestinationDir(
        fixture.tempDir,
        '@canard/schema-form',
        'commands',
      );
      ensureDir(commandsDir);
      fs.writeFileSync(join(commandsDir, 'schema-form.md'), 'content');
      fs.writeFileSync(join(commandsDir, 'generate.md'), 'content');

      await runRemoveCommand(
        { package: '@canard/schema-form', yes: true, dryRun: false },
        fixture.tempDir,
      );

      // Verify directory removed
      expect(existsSync(commandsDir)).toBe(false);

      // Verify metadata updated
      const updatedMeta = readUnifiedSyncMeta(fixture.tempDir);
      expect(updatedMeta).not.toBeNull();
      expect(updatedMeta!.packages[prefix]).toBeUndefined();
    });

    it('should remove flat structure files and update metadata', async () => {
      const prefix = packageNameToPrefix('@canard/schema-form');
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: '2025-02-01T10:00:00.000Z',
        packages: {
          [prefix]: {
            originalName: '@canard/schema-form',
            version: '0.10.0',
            files: {
              skills: [
                {
                  original: 'expert.md',
                  transformed: 'canard-schema-form-expert.md',
                } as FileMapping,
                {
                  original: 'validator.md',
                  transformed: 'canard-schema-form-validator.md',
                } as FileMapping,
              ],
            },
          },
        },
      };

      writeUnifiedSyncMeta(fixture.tempDir, meta);

      // Create actual flat structure files
      const skillsDir = getFlatDestinationDir(fixture.tempDir, 'skills');
      ensureDir(skillsDir);
      fs.writeFileSync(
        join(skillsDir, 'canard-schema-form-expert.md'),
        'content',
      );
      fs.writeFileSync(
        join(skillsDir, 'canard-schema-form-validator.md'),
        'content',
      );

      await runRemoveCommand(
        { package: '@canard/schema-form', yes: true, dryRun: false },
        fixture.tempDir,
      );

      // Verify individual files removed
      expect(existsSync(join(skillsDir, 'canard-schema-form-expert.md'))).toBe(
        false,
      );
      expect(
        existsSync(join(skillsDir, 'canard-schema-form-validator.md')),
      ).toBe(false);

      // Verify metadata updated
      const updatedMeta = readUnifiedSyncMeta(fixture.tempDir);
      expect(updatedMeta!.packages[prefix]).toBeUndefined();
    });

    it('should handle mixed nested and flat structures', async () => {
      const prefix = packageNameToPrefix('@canard/schema-form');
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: '2025-02-01T10:00:00.000Z',
        packages: {
          [prefix]: {
            originalName: '@canard/schema-form',
            version: '0.10.0',
            files: {
              commands: ['cmd.md'], // nested
              skills: [
                {
                  original: 'skill.md',
                  transformed: 'canard-schema-form-skill.md',
                } as FileMapping,
              ], // flat
            },
          },
        },
      };

      writeUnifiedSyncMeta(fixture.tempDir, meta);

      // Create nested files
      const commandsDir = getDestinationDir(
        fixture.tempDir,
        '@canard/schema-form',
        'commands',
      );
      ensureDir(commandsDir);
      fs.writeFileSync(join(commandsDir, 'cmd.md'), 'content');

      // Create flat files
      const skillsDir = getFlatDestinationDir(fixture.tempDir, 'skills');
      ensureDir(skillsDir);
      fs.writeFileSync(
        join(skillsDir, 'canard-schema-form-skill.md'),
        'content',
      );

      await runRemoveCommand(
        { package: '@canard/schema-form', yes: true, dryRun: false },
        fixture.tempDir,
      );

      // Verify both structures removed
      expect(existsSync(commandsDir)).toBe(false);
      expect(existsSync(join(skillsDir, 'canard-schema-form-skill.md'))).toBe(
        false,
      );
    });

    it('should show files to be removed before confirmation', async () => {
      const prefix = packageNameToPrefix('@test/pkg');
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: '2025-02-01T10:00:00.000Z',
        packages: {
          [prefix]: {
            originalName: '@test/pkg',
            version: '1.0.0',
            files: {
              commands: ['test.md'],
            },
          },
        },
      };

      writeUnifiedSyncMeta(fixture.tempDir, meta);

      await runRemoveCommand(
        { package: '@test/pkg', yes: true, dryRun: true },
        fixture.tempDir,
      );

      // Verify file list is shown
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Files to remove'),
      );
    });

    it('should handle missing files gracefully', async () => {
      const prefix = packageNameToPrefix('@test/pkg');
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: '2025-02-01T10:00:00.000Z',
        packages: {
          [prefix]: {
            originalName: '@test/pkg',
            version: '1.0.0',
            files: {
              commands: ['missing.md'],
            },
          },
        },
      };

      writeUnifiedSyncMeta(fixture.tempDir, meta);

      // Don't create the files - they're missing

      await runRemoveCommand(
        { package: '@test/pkg', yes: true, dryRun: false },
        fixture.tempDir,
      );

      // Verify metadata still updated
      const updatedMeta = readUnifiedSyncMeta(fixture.tempDir);
      expect(updatedMeta!.packages[prefix]).toBeUndefined();
    });

    it('should update syncedAt timestamp when removing', async () => {
      const prefix = packageNameToPrefix('@test/pkg');
      const originalSyncedAt = '2025-02-01T10:00:00.000Z';
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: originalSyncedAt,
        packages: {
          [prefix]: {
            originalName: '@test/pkg',
            version: '1.0.0',
            files: { commands: ['test.md'] },
          },
        },
      };

      writeUnifiedSyncMeta(fixture.tempDir, meta);

      await runRemoveCommand(
        { package: '@test/pkg', yes: true, dryRun: false },
        fixture.tempDir,
      );

      const updatedMeta = readUnifiedSyncMeta(fixture.tempDir);
      expect(updatedMeta!.syncedAt).not.toBe(originalSyncedAt);
      expect(new Date(updatedMeta!.syncedAt).getTime()).toBeGreaterThan(
        new Date(originalSyncedAt).getTime(),
      );
    });

    it('should handle custom asset types', async () => {
      const prefix = packageNameToPrefix('@custom/pkg');
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: '2025-02-01T10:00:00.000Z',
        packages: {
          [prefix]: {
            originalName: '@custom/pkg',
            version: '1.0.0',
            files: {
              docs: ['doc.md'],
              rules: [
                {
                  original: 'rule.md',
                  transformed: 'custom-pkg-rule.md',
                } as FileMapping,
              ],
            },
          },
        },
      };

      writeUnifiedSyncMeta(fixture.tempDir, meta);

      // Create files
      const docsDir = getDestinationDir(fixture.tempDir, '@custom/pkg', 'docs');
      ensureDir(docsDir);
      fs.writeFileSync(join(docsDir, 'doc.md'), 'content');

      const rulesDir = getFlatDestinationDir(fixture.tempDir, 'rules');
      ensureDir(rulesDir);
      fs.writeFileSync(join(rulesDir, 'custom-pkg-rule.md'), 'content');

      await runRemoveCommand(
        { package: '@custom/pkg', yes: true, dryRun: false },
        fixture.tempDir,
      );

      // Verify both removed
      expect(existsSync(docsDir)).toBe(false);
      expect(existsSync(join(rulesDir, 'custom-pkg-rule.md'))).toBe(false);
    });
  });
});
