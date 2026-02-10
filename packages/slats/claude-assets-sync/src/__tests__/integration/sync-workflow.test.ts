/**
 * Integration tests for complete sync workflow
 * Tests the full lifecycle: sync -> list -> status -> remove
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { runListCommand } from '../../commands/list';
import { runRemoveCommand } from '../../commands/remove';
import { runStatusCommand } from '../../commands/status';
import { syncPackage } from '../../core/sync';
import { readUnifiedSyncMeta, writeUnifiedSyncMeta } from '../../core/syncMeta';
import { toFlatFileName } from '../../utils/nameTransform';
import { packageNameToPrefix } from '../../utils/packageName';
import type { UnifiedSyncMeta } from '../../utils/types';
import {
  type TestFixture,
  createTestFixture,
  mockCommandContent,
  mockCommandEntries,
  mockPromiseModalPackage,
  mockSchemaFormPackage,
  mockSkillContent,
  mockSkillEntries,
  restoreFetchMock,
  setupFetchMock,
} from '../helpers';

// Mock console
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

describe('Sync Workflow Integration', () => {
  let fixture: TestFixture;

  beforeEach(() => {
    fixture = createTestFixture([
      mockSchemaFormPackage,
      mockPromiseModalPackage,
    ]);
    mockConsoleLog.mockClear();
  });

  afterEach(() => {
    fixture.cleanup();
    restoreFetchMock();
  });

  describe('Full workflow: sync -> list -> status -> remove', () => {
    it('should complete full workflow successfully', async () => {
      // Step 1: Sync a package
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

      const syncResult = await syncPackage(
        '@canard/schema-form',
        { force: false, dryRun: false, local: false, ref: '', flat: true },
        fixture.tempDir,
      );

      expect(syncResult.success).toBe(true);
      expect(syncResult.skipped).toBe(false);

      // Step 2: List synced packages
      mockConsoleLog.mockClear();
      await runListCommand({ json: true }, fixture.tempDir);

      const listCall = mockConsoleLog.mock.calls.find((call) => {
        if (
          !call[0] ||
          typeof call[0] !== 'string' ||
          !call[0].startsWith('[')
        ) {
          return false;
        }
        // Verify it's valid JSON
        try {
          JSON.parse(call[0]);
          return true;
        } catch {
          return false;
        }
      });
      expect(listCall).toBeDefined();

      const listOutput = JSON.parse(listCall![0]);
      expect(listOutput).toHaveLength(1);
      expect(listOutput[0].name).toBe('@canard/schema-form');
      expect(listOutput[0].assetCount).toBeGreaterThan(0);

      mockConsoleLog.mockClear();

      // Step 3: Check status
      const mockFetch = vi.fn(async (url: string) => {
        if (url.includes('registry.npmjs.org')) {
          return new Response(JSON.stringify({ version: '0.11.0' }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          });
        }
        return new Response('Not found', { status: 404 });
      });
      vi.stubGlobal('fetch', mockFetch);

      await runStatusCommand({ noRemote: false }, fixture.tempDir);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('@canard/schema-form'),
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Update available'),
      );

      // Step 4: Remove the package
      await runRemoveCommand(
        { package: '@canard/schema-form', yes: true, dryRun: false },
        fixture.tempDir,
      );

      // Step 5: Verify removal
      const metaAfterRemove = readUnifiedSyncMeta(fixture.tempDir);
      const prefix = packageNameToPrefix('@canard/schema-form');
      expect(metaAfterRemove!.packages[prefix]).toBeUndefined();

      mockConsoleLog.mockClear();

      // Step 6: List should show no packages
      await runListCommand({ json: true }, fixture.tempDir);

      const emptyListCall = mockConsoleLog.mock.calls.find((call) =>
        call[0].startsWith('['),
      );
      const emptyListOutput = JSON.parse(emptyListCall![0]);
      expect(emptyListOutput).toHaveLength(0);
    });

    it('should handle multiple package syncs in sequence', async () => {
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

      // Sync first package
      const result1 = await syncPackage(
        '@canard/schema-form',
        { force: false, dryRun: false, local: false, ref: '', flat: true },
        fixture.tempDir,
      );
      expect(result1.success).toBe(true);

      // Sync second package
      const result2 = await syncPackage(
        '@lerx/promise-modal',
        { force: false, dryRun: false, local: false, ref: '', flat: true },
        fixture.tempDir,
      );
      expect(result2.success).toBe(true);

      // List should show both
      mockConsoleLog.mockClear();
      await runListCommand({ json: true }, fixture.tempDir);

      const listCall = mockConsoleLog.mock.calls.find((call) => {
        if (
          !call[0] ||
          typeof call[0] !== 'string' ||
          !call[0].startsWith('[')
        ) {
          return false;
        }
        // Verify it's valid JSON
        try {
          JSON.parse(call[0]);
          return true;
        } catch {
          return false;
        }
      });
      expect(listCall).toBeDefined();
      const listOutput = JSON.parse(listCall![0]);

      expect(listOutput).toHaveLength(2);
      expect(listOutput.map((p: { name: string }) => p.name)).toContain(
        '@canard/schema-form',
      );
      expect(listOutput.map((p: { name: string }) => p.name)).toContain(
        '@lerx/promise-modal',
      );
    });

    it('should handle force re-sync after initial sync', async () => {
      setupFetchMock({
        directoryEntries: {
          commands: mockCommandEntries,
        },
        fileContents: {
          'schema-form.md': mockCommandContent,
        },
      });

      // Initial sync
      const result1 = await syncPackage(
        '@canard/schema-form',
        { force: false, dryRun: false, local: false, ref: '', flat: true },
        fixture.tempDir,
      );
      expect(result1.success).toBe(true);
      expect(result1.skipped).toBe(false);

      // Try sync again without force - should skip
      const result2 = await syncPackage(
        '@canard/schema-form',
        { force: false, dryRun: false, local: false, ref: '', flat: true },
        fixture.tempDir,
      );
      expect(result2.success).toBe(true);
      expect(result2.skipped).toBe(true);
      expect(result2.reason).toContain('Already synced');

      // Force re-sync
      const result3 = await syncPackage(
        '@canard/schema-form',
        { force: true, dryRun: false, local: false, ref: '', flat: true },
        fixture.tempDir,
      );
      expect(result3.success).toBe(true);
      expect(result3.skipped).toBe(false);
    });

    it('should preserve metadata consistency across operations', async () => {
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

      // Sync package
      await syncPackage(
        '@canard/schema-form',
        { force: false, dryRun: false, local: false, ref: '', flat: true },
        fixture.tempDir,
      );

      // Read metadata
      const meta1 = readUnifiedSyncMeta(fixture.tempDir);
      expect(meta1).not.toBeNull();
      expect(meta1!.schemaVersion).toBeDefined();
      const prefix = packageNameToPrefix('@canard/schema-form');
      expect(meta1!.packages[prefix]).toBeDefined();

      // Sync another package
      await syncPackage(
        '@lerx/promise-modal',
        { force: false, dryRun: false, local: false, ref: '', flat: true },
        fixture.tempDir,
      );

      // Metadata should preserve first package and add second
      const meta2 = readUnifiedSyncMeta(fixture.tempDir);
      expect(meta2!.packages[prefix]).toBeDefined();
      expect(
        meta2!.packages[packageNameToPrefix('@lerx/promise-modal')],
      ).toBeDefined();

      // Remove first package
      await runRemoveCommand(
        { package: '@canard/schema-form', yes: true, dryRun: false },
        fixture.tempDir,
      );

      // Metadata should only have second package
      const meta3 = readUnifiedSyncMeta(fixture.tempDir);
      expect(meta3!.packages[prefix]).toBeUndefined();
      expect(
        meta3!.packages[packageNameToPrefix('@lerx/promise-modal')],
      ).toBeDefined();
    });

    it('should handle dry-run mode throughout workflow', async () => {
      setupFetchMock({
        directoryEntries: {
          commands: mockCommandEntries,
        },
        fileContents: {
          'schema-form.md': mockCommandContent,
        },
      });

      // Dry-run sync
      const syncResult = await syncPackage(
        '@canard/schema-form',
        { force: false, dryRun: true, local: false, ref: '', flat: true },
        fixture.tempDir,
      );
      expect(syncResult.success).toBe(true);

      // No files should be created
      const prefix = packageNameToPrefix('@canard/schema-form');
      const commandsDir = join(
        fixture.tempDir,
        '.claude',
        'commands',
        '@canard',
        'schema-form',
      );
      expect(existsSync(commandsDir)).toBe(false);

      // No metadata should be written
      let meta = readUnifiedSyncMeta(fixture.tempDir);
      expect(meta).toBeNull();

      // Actually sync
      await syncPackage(
        '@canard/schema-form',
        { force: false, dryRun: false, local: false, ref: '', flat: true },
        fixture.tempDir,
      );

      // Now files and metadata should exist
      meta = readUnifiedSyncMeta(fixture.tempDir);
      expect(meta!.packages[prefix]).toBeDefined();

      // Dry-run remove
      await runRemoveCommand(
        { package: '@canard/schema-form', yes: true, dryRun: true },
        fixture.tempDir,
      );

      // Files should still exist
      meta = readUnifiedSyncMeta(fixture.tempDir);
      expect(meta!.packages[prefix]).toBeDefined();

      // Actually remove
      await runRemoveCommand(
        { package: '@canard/schema-form', yes: true, dryRun: false },
        fixture.tempDir,
      );

      // Now should be removed
      meta = readUnifiedSyncMeta(fixture.tempDir);
      expect(meta!.packages[prefix]).toBeUndefined();
    });

    it('should handle flat and nested structures correctly', async () => {
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

      // Sync with flat structure (default)
      await syncPackage(
        '@canard/schema-form',
        { force: false, dryRun: false, local: false, ref: '', flat: true },
        fixture.tempDir,
      );

      const prefix = packageNameToPrefix('@canard/schema-form');

      // Commands should be in nested structure
      const commandsDir = join(
        fixture.tempDir,
        '.claude',
        'commands',
        '@canard',
        'schema-form',
      );
      expect(existsSync(join(commandsDir, 'schema-form.md'))).toBe(true);

      // Skills should be in flat structure
      const skillsDir = join(fixture.tempDir, '.claude', 'skills');
      expect(
        existsSync(
          join(skillsDir, toFlatFileName(prefix, 'schema-form-expert.md')),
        ),
      ).toBe(true);
      expect(
        existsSync(join(skillsDir, toFlatFileName(prefix, 'validation.md'))),
      ).toBe(true);

      // Metadata should reflect both structures
      const meta = readUnifiedSyncMeta(fixture.tempDir);
      expect(meta!.packages[prefix].files.commands).toBeDefined();
      expect(meta!.packages[prefix].files.skills).toBeDefined();
    });

    it('should handle version changes correctly', async () => {
      // Create initial metadata with old version
      const prefix = packageNameToPrefix('@canard/schema-form');
      const oldMeta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: '2025-01-01T00:00:00.000Z',
        packages: {
          [prefix]: {
            originalName: '@canard/schema-form',
            version: '0.9.0',
            files: { commands: ['old.md'] },
          },
        },
      };
      writeUnifiedSyncMeta(fixture.tempDir, oldMeta);

      setupFetchMock({
        directoryEntries: {
          commands: mockCommandEntries,
        },
        fileContents: {
          'schema-form.md': mockCommandContent,
        },
      });

      // Sync new version (package has 0.10.0)
      const result = await syncPackage(
        '@canard/schema-form',
        { force: false, dryRun: false, local: false, ref: '', flat: true },
        fixture.tempDir,
      );

      expect(result.success).toBe(true);
      expect(result.skipped).toBe(false);

      // Metadata should have new version
      const newMeta = readUnifiedSyncMeta(fixture.tempDir);
      expect(newMeta!.packages[prefix].version).toBe('0.10.0');
    });

    it('should handle status check for multiple packages', async () => {
      setupFetchMock({
        directoryEntries: {
          commands: mockCommandEntries,
        },
        fileContents: {
          'schema-form.md': mockCommandContent,
        },
      });

      // Sync multiple packages
      await syncPackage(
        '@canard/schema-form',
        { force: false, dryRun: false, local: false, ref: '', flat: true },
        fixture.tempDir,
      );
      await syncPackage(
        '@lerx/promise-modal',
        { force: false, dryRun: false, local: false, ref: '', flat: true },
        fixture.tempDir,
      );

      // Mock npm registry
      const mockFetch = vi.fn(async (url: string) => {
        if (url.includes('@canard/schema-form')) {
          return new Response(JSON.stringify({ version: '0.10.0' }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          });
        }
        if (url.includes('@lerx/promise-modal')) {
          return new Response(JSON.stringify({ version: '0.11.0' }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          });
        }
        return new Response('Not found', { status: 404 });
      });
      vi.stubGlobal('fetch', mockFetch);

      await runStatusCommand({ noRemote: false }, fixture.tempDir);

      // Verify both packages checked
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('@canard/schema-form'),
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('@lerx/promise-modal'),
      );
    });
  });
});
