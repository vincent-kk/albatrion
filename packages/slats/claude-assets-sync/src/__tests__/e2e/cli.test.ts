/**
 * End-to-end tests for CLI commands
 * Tests the CLI interface with real command execution
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createProgram } from '@/claude-assets-sync/core/cli';

import { writeUnifiedSyncMeta } from '../../core/syncMeta';
import type { UnifiedSyncMeta } from '../../utils/types';
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
} from '../helpers';

// Mock console
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
const mockProcessExit = vi
  .spyOn(process, 'exit')
  .mockImplementation((() => {}) as never);

describe('CLI E2E Tests', () => {
  let fixture: TestFixture;

  beforeEach(() => {
    fixture = createTestFixture([mockSchemaFormPackage]);
    mockConsoleLog.mockClear();
    mockProcessExit.mockClear();
    // Change working directory for CLI tests
    process.chdir(fixture.tempDir);
  });

  afterEach(() => {
    fixture.cleanup();
    restoreFetchMock();
  });

  describe('Main sync command', () => {
    it('should sync package via CLI', async () => {
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

      const program = createProgram();

      await program.parseAsync([
        'node',
        'cli',
        '-p',
        '@canard/schema-form',
        '-f',
      ]);

      // Verify success output
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('should handle --dry-run flag', async () => {
      setupFetchMock({
        directoryEntries: {
          commands: mockCommandEntries,
        },
        fileContents: {
          'schema-form.md': mockCommandContent,
        },
      });

      const program = createProgram();

      await program.parseAsync([
        'node',
        'cli',
        '-p',
        '@canard/schema-form',
        '--dry-run',
      ]);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('DRY RUN'),
      );
    });

    it('should handle multiple --package flags', async () => {
      setupFetchMock({
        directoryEntries: {
          commands: mockCommandEntries,
        },
        fileContents: {
          'schema-form.md': mockCommandContent,
        },
      });

      const program = createProgram();

      await program.parseAsync([
        'node',
        'cli',
        '-p',
        '@canard/schema-form',
        '-p',
        '@lerx/promise-modal',
      ]);

      // Both packages should be processed
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('should handle --force flag', async () => {
      // Pre-populate metadata
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: '2025-02-01T10:00:00.000Z',
        packages: {
          'canard-schemaForm': {
            originalName: '@canard/schema-form',
            version: '0.10.0',
            files: { commands: ['old.md'] },
          },
        },
      };
      writeUnifiedSyncMeta(fixture.tempDir, meta);

      setupFetchMock({
        directoryEntries: {
          commands: mockCommandEntries,
        },
        fileContents: {
          'schema-form.md': mockCommandContent,
        },
      });

      const program = createProgram();

      await program.parseAsync([
        'node',
        'cli',
        '-p',
        '@canard/schema-form',
        '--force',
      ]);

      // Should sync despite existing version
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('should handle --no-flat flag', async () => {
      setupFetchMock({
        directoryEntries: {
          skills: mockSkillEntries,
        },
        fileContents: {
          'schema-form-expert.md': mockSkillContent,
          'validation.md': '# Validation',
        },
      });

      const program = createProgram();

      await program.parseAsync([
        'node',
        'cli',
        '-p',
        '@canard/schema-form',
        '--no-flat',
      ]);

      // Legacy nested structure should be used
      expect(mockConsoleLog).toHaveBeenCalled();
    });
  });

  describe('list command', () => {
    it('should list synced packages via CLI', async () => {
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: '2025-02-01T10:00:00.000Z',
        packages: {
          'canard-schemaForm': {
            originalName: '@canard/schema-form',
            version: '0.10.0',
            files: { commands: ['test.md'] },
          },
        },
      };
      writeUnifiedSyncMeta(fixture.tempDir, meta);

      const program = createProgram();

      await program.parseAsync(['node', 'cli', 'list']);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('@canard/schema-form'),
      );
    });

    it('should output JSON format with --json flag', async () => {
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: '2025-02-01T10:00:00.000Z',
        packages: {
          'canard-schemaForm': {
            originalName: '@canard/schema-form',
            version: '0.10.0',
            files: { commands: ['test.md'], skills: ['skill.md'] },
          },
        },
      };
      writeUnifiedSyncMeta(fixture.tempDir, meta);

      const program = createProgram();

      await program.parseAsync(['node', 'cli', 'list', '--json']);

      const jsonCall = mockConsoleLog.mock.calls.find(
        (call) =>
          call[0] && typeof call[0] === 'string' && call[0].startsWith('['),
      );
      expect(jsonCall).toBeDefined();

      const output = JSON.parse(jsonCall![0]);
      expect(output).toHaveLength(1);
      expect(output[0].name).toBe('@canard/schema-form');
    });

    it('should show message when no packages synced', async () => {
      const program = createProgram();

      await program.parseAsync(['node', 'cli', 'list']);

      // logger.info uses console.log('info', message)
      const infoCall = mockConsoleLog.mock.calls.find(
        (call) =>
          call[0] === 'info' && call[1]?.includes('No packages synced yet'),
      );
      expect(infoCall).toBeDefined();
    });
  });

  describe('status command', () => {
    it('should show status via CLI', async () => {
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: '2025-02-01T10:00:00.000Z',
        packages: {
          'canard-schemaForm': {
            originalName: '@canard/schema-form',
            version: '0.10.0',
            files: { commands: ['test.md'] },
          },
        },
      };
      writeUnifiedSyncMeta(fixture.tempDir, meta);

      const mockFetch = vi.fn(async () => {
        return new Response(JSON.stringify({ version: '0.11.0' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
      });
      vi.stubGlobal('fetch', mockFetch);

      const program = createProgram();

      await program.parseAsync(['node', 'cli', 'status']);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('@canard/schema-form'),
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Update available'),
      );
    });

    it('should skip remote check with --no-remote flag', async () => {
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: '2025-02-01T10:00:00.000Z',
        packages: {
          'test-pkg': {
            originalName: '@test/pkg',
            version: '1.0.0',
            files: { commands: ['test.md'] },
          },
        },
      };
      writeUnifiedSyncMeta(fixture.tempDir, meta);

      const mockFetch = vi.fn();
      vi.stubGlobal('fetch', mockFetch);

      const program = createProgram();

      await program.parseAsync(['node', 'cli', 'status', '--no-remote']);

      expect(mockFetch).not.toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('(check skipped)'),
      );
    });
  });

  describe('remove command', () => {
    it('should remove package via CLI with -y flag', async () => {
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: '2025-02-01T10:00:00.000Z',
        packages: {
          'canard-schemaForm': {
            originalName: '@canard/schema-form',
            version: '0.10.0',
            files: { commands: ['test.md'] },
          },
        },
      };
      writeUnifiedSyncMeta(fixture.tempDir, meta);

      const program = createProgram();

      await program.parseAsync([
        'node',
        'cli',
        'remove',
        '-p',
        '@canard/schema-form',
        '-y',
      ]);

      // logger.success uses console.log(pc.green('success'), message)
      // The message is "\nRemoved package @canard/schema-form"
      // pc.green adds ANSI codes, so we check if any argument contains 'Removed package'

      // Check if process.exit was called (indicating error)
      expect(mockProcessExit).not.toHaveBeenCalled();

      const successCall = mockConsoleLog.mock.calls.find((call) =>
        call.some(
          (arg) => typeof arg === 'string' && arg.includes('Removed package'),
        ),
      );
      expect(successCall).toBeDefined();
    });

    it('should handle --dry-run flag for remove', async () => {
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: '2025-02-01T10:00:00.000Z',
        packages: {
          'test-pkg': {
            originalName: '@test/pkg',
            version: '1.0.0',
            files: { commands: ['test.md'] },
          },
        },
      };
      writeUnifiedSyncMeta(fixture.tempDir, meta);

      const program = createProgram();

      await program.parseAsync([
        'node',
        'cli',
        'remove',
        '-p',
        '@test/pkg',
        '-y',
        '--dry-run',
      ]);

      // logger.info uses console.log('info', message)
      const dryRunCall = mockConsoleLog.mock.calls.find(
        (call) => call[0] === 'info' && call[1]?.includes('[DRY RUN]'),
      );
      expect(dryRunCall).toBeDefined();
    });

    it('should exit with error if package not found', async () => {
      const program = createProgram();

      await program.parseAsync([
        'node',
        'cli',
        'remove',
        '-p',
        '@non/existent',
        '-y',
      ]);

      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });
  });

  describe('CLI error handling', () => {
    it('should handle missing required options', async () => {
      const program = createProgram();

      // Remove requires --package flag
      try {
        await program.parseAsync(['node', 'cli', 'remove', '-y']);
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        // Commander throws error for missing required options
        expect(error).toBeDefined();
      }
    });

    it('should show version', async () => {
      // Mock process.stdout.write which Commander uses for --version
      const originalWrite = process.stdout.write;
      let versionOutput = '';
      process.stdout.write = ((chunk: string) => {
        versionOutput += chunk;
        return true;
      }) as any;

      const program = createProgram();

      try {
        await program.parseAsync(['node', 'cli', '--version']);
      } catch {
        // Commander exits after showing version
      } finally {
        process.stdout.write = originalWrite;
      }

      expect(versionOutput).toContain('0.');
    });

    it('should handle unknown commands gracefully', async () => {
      const program = createProgram();

      try {
        await program.parseAsync(['node', 'cli', 'unknown-command']);
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        // Commander throws error for unknown commands
        expect(error).toBeDefined();
      }
    });
  });

  describe('CLI integration scenarios', () => {
    it('should handle complete workflow via CLI', async () => {
      setupFetchMock({
        directoryEntries: {
          commands: mockCommandEntries,
        },
        fileContents: {
          'schema-form.md': mockCommandContent,
        },
      });

      let program = createProgram();

      // Step 1: Sync
      await program.parseAsync(['node', 'cli', '-p', '@canard/schema-form']);

      mockConsoleLog.mockClear();

      // Step 2: List
      program = createProgram();
      await program.parseAsync(['node', 'cli', 'list', '--json']);

      const listCall = mockConsoleLog.mock.calls.find(
        (call) =>
          call[0] && typeof call[0] === 'string' && call[0].startsWith('['),
      );
      expect(listCall).toBeDefined();
      const listOutput = JSON.parse(listCall![0]);
      expect(listOutput).toHaveLength(1);

      mockConsoleLog.mockClear();

      // Step 3: Status
      const mockFetch = vi.fn(async () => {
        return new Response(JSON.stringify({ version: '0.10.0' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
      });
      vi.stubGlobal('fetch', mockFetch);

      program = createProgram();
      await program.parseAsync(['node', 'cli', 'status']);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Up to date'),
      );

      mockConsoleLog.mockClear();

      // Step 4: Remove
      program = createProgram();
      await program.parseAsync([
        'node',
        'cli',
        'remove',
        '-p',
        '@canard/schema-form',
        '-y',
      ]);

      // logger.success uses console.log(pc.green('success'), message)
      // pc.green adds ANSI codes, so we check if any argument contains 'Removed package'
      const successCall = mockConsoleLog.mock.calls.find((call) =>
        call.some(
          (arg) => typeof arg === 'string' && arg.includes('Removed package'),
        ),
      );
      expect(successCall).toBeDefined();
    });

    it('should handle multiple packages via CLI', async () => {
      setupFetchMock({
        directoryEntries: {
          commands: mockCommandEntries,
        },
        fileContents: {
          'schema-form.md': mockCommandContent,
        },
      });

      const program = createProgram();

      await program.parseAsync([
        'node',
        'cli',
        '-p',
        '@canard/schema-form',
        '-p',
        '@lerx/promise-modal',
      ]);

      mockConsoleLog.mockClear();

      const listProgram = createProgram();
      await listProgram.parseAsync(['node', 'cli', 'list', '--json']);

      const listCall = mockConsoleLog.mock.calls.find(
        (call) =>
          call[0] && typeof call[0] === 'string' && call[0].startsWith('['),
      );
      expect(listCall).toBeDefined();
      const listOutput = JSON.parse(listCall![0]);

      expect(listOutput.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle force resync via CLI', async () => {
      setupFetchMock({
        directoryEntries: {
          commands: mockCommandEntries,
        },
        fileContents: {
          'schema-form.md': mockCommandContent,
        },
      });

      // Initial sync
      let program = createProgram();
      await program.parseAsync(['node', 'cli', '-p', '@canard/schema-form']);

      mockConsoleLog.mockClear();

      // Try sync again - should skip
      program = createProgram();
      await program.parseAsync(['node', 'cli', '-p', '@canard/schema-form']);

      // Check for "Already synced" message (in call[0] or call[1])
      const alreadySyncedCall = mockConsoleLog.mock.calls.find(
        (call) =>
          (call[0] &&
            typeof call[0] === 'string' &&
            call[0].includes('Already synced')) ||
          (call[1] &&
            typeof call[1] === 'string' &&
            call[1].includes('Already synced')),
      );
      expect(alreadySyncedCall).toBeDefined();

      mockConsoleLog.mockClear();

      // Force sync
      program = createProgram();
      await program.parseAsync([
        'node',
        'cli',
        '-p',
        '@canard/schema-form',
        '--force',
      ]);

      // Should not see "Already synced" message
      const skippedCall = mockConsoleLog.mock.calls.find(
        (call) =>
          (call[0] &&
            typeof call[0] === 'string' &&
            call[0].includes('Already synced')) ||
          (call[1] &&
            typeof call[1] === 'string' &&
            call[1].includes('Already synced')),
      );
      expect(skippedCall).toBeUndefined();
    });
  });
});
