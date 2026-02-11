/**
 * Unit tests for list command
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { runListCommand } from '../../commands/list';
import { writeUnifiedSyncMeta } from '../../core/syncMeta';
import type { UnifiedSyncMeta } from '../../utils/types';
import { type TestFixture, createTestFixture } from '../helpers';

// Mock console to capture output
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

describe('list command', () => {
  let fixture: TestFixture;

  beforeEach(() => {
    fixture = createTestFixture([]);
    mockConsoleLog.mockClear();
  });

  afterEach(() => {
    fixture.cleanup();
  });

  describe('runListCommand', () => {
    it('should show message when no packages are synced', async () => {
      await runListCommand({ json: false }, fixture.tempDir);

      // logger.info uses console.log(pc.blue('info'), message)
      // picocolors adds ANSI codes, so we check if any call contains the message
      const infoCall = mockConsoleLog.mock.calls.find((call) =>
        call.some((arg) => String(arg).includes('No packages synced yet')),
      );
      expect(infoCall).toBeDefined();
    });

    it('should output empty JSON array when no packages synced (json mode)', async () => {
      await runListCommand({ json: true }, fixture.tempDir);

      expect(mockConsoleLog).toHaveBeenCalledWith('[]');
    });

    it('should list synced packages with asset counts', async () => {
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: '2025-02-01T10:00:00.000Z',
        packages: {
          'canard-schema-form': {
            originalName: '@canard/schema-form',
            version: '0.10.0',
            files: {
              commands: [{ name: 'schema-form.md', isDirectory: false }, { name: 'generate.md', isDirectory: false }],
              skills: [{ name: 'expert.md', isDirectory: false }],
              agents: [],
            },
          },
          'lerx-promise-modal': {
            originalName: '@lerx/promise-modal',
            version: '0.5.0',
            files: {
              commands: [{ name: 'modal.md', isDirectory: false }],
              skills: [],
            },
          },
        },
      };

      writeUnifiedSyncMeta(fixture.tempDir, meta);

      await runListCommand({ json: false }, fixture.tempDir);

      // Verify output contains package names
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('@canard/schema-form'),
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('@lerx/promise-modal'),
      );

      // Verify asset counts
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('3 files'),
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('1 files'),
      );
    });

    it('should output JSON format correctly', async () => {
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: '2025-02-01T10:00:00.000Z',
        packages: {
          'canard-schema-form': {
            originalName: '@canard/schema-form',
            version: '0.10.0',
            files: {
              commands: [{ name: 'schema-form.md', isDirectory: false }],
              skills: [{ name: 'expert.md', isDirectory: false }, { name: 'validator.md', isDirectory: false }],
            },
          },
        },
      };

      writeUnifiedSyncMeta(fixture.tempDir, meta);

      await runListCommand({ json: true }, fixture.tempDir);

      // Parse the JSON output
      const jsonCall = mockConsoleLog.mock.calls.find((call) =>
        call[0].startsWith('['),
      );
      expect(jsonCall).toBeDefined();

      const output = JSON.parse(jsonCall![0]);
      expect(output).toHaveLength(1);
      expect(output[0]).toMatchObject({
        name: '@canard/schema-form',
        version: '0.10.0',
        assetCount: 3,
        assets: {
          commands: 1,
          skills: 2,
        },
      });
    });

    it('should sort packages alphabetically', async () => {
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: '2025-02-01T10:00:00.000Z',
        packages: {
          'winglet-react-utils': {
            originalName: '@winglet/react-utils',
            version: '1.0.0',
            files: { commands: [{ name: 'utils.md', isDirectory: false }] },
          },
          'canard-schema-form': {
            originalName: '@canard/schema-form',
            version: '0.10.0',
            files: { commands: [{ name: 'form.md', isDirectory: false }] },
          },
          'lerx-promise-modal': {
            originalName: '@lerx/promise-modal',
            version: '0.5.0',
            files: { commands: [{ name: 'modal.md', isDirectory: false }] },
          },
        },
      };

      writeUnifiedSyncMeta(fixture.tempDir, meta);

      await runListCommand({ json: true }, fixture.tempDir);

      const jsonCall = mockConsoleLog.mock.calls.find((call) =>
        call[0].startsWith('['),
      );
      const output = JSON.parse(jsonCall![0]);

      // Verify alphabetical order
      expect(output[0].name).toBe('@canard/schema-form');
      expect(output[1].name).toBe('@lerx/promise-modal');
      expect(output[2].name).toBe('@winglet/react-utils');
    });

    it('should show asset breakdown by type', async () => {
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: '2025-02-01T10:00:00.000Z',
        packages: {
          'canard-schema-form': {
            originalName: '@canard/schema-form',
            version: '0.10.0',
            files: {
              commands: [{ name: 'cmd1.md', isDirectory: false }, { name: 'cmd2.md', isDirectory: false }],
              skills: [{ name: 'skill1.md', isDirectory: false }, { name: 'skill2.md', isDirectory: false }, { name: 'skill3.md', isDirectory: false }],
              agents: [{ name: 'agent1.md', isDirectory: false }],
            },
          },
        },
      };

      writeUnifiedSyncMeta(fixture.tempDir, meta);

      await runListCommand({ json: false }, fixture.tempDir);

      // Verify breakdown is shown
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('2 commands'),
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('3 skills'),
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('1 agents'),
      );
    });

    it('should handle packages with empty asset arrays', async () => {
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: '2025-02-01T10:00:00.000Z',
        packages: {
          'test-package': {
            originalName: '@test/package',
            version: '1.0.0',
            files: {
              commands: [],
              skills: [],
            },
          },
        },
      };

      writeUnifiedSyncMeta(fixture.tempDir, meta);

      await runListCommand({ json: true }, fixture.tempDir);

      const jsonCall = mockConsoleLog.mock.calls.find((call) =>
        call[0].startsWith('['),
      );
      const output = JSON.parse(jsonCall![0]);

      expect(output[0].assetCount).toBe(0);
      expect(output[0].assets).toEqual({
        commands: 0,
        skills: 0,
      });
    });

    it('should show synced timestamp', async () => {
      const syncedAt = '2025-02-01T15:30:45.123Z';
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt,
        packages: {
          'test-pkg': {
            originalName: '@test/pkg',
            version: '1.0.0',
            files: { commands: [{ name: 'test.md', isDirectory: false }] },
          },
        },
      };

      writeUnifiedSyncMeta(fixture.tempDir, meta);

      await runListCommand({ json: true }, fixture.tempDir);

      const jsonCall = mockConsoleLog.mock.calls.find((call) =>
        call[0].startsWith('['),
      );
      const output = JSON.parse(jsonCall![0]);

      expect(output[0].syncedAt).toBe(syncedAt);
    });

    it('should handle custom asset types', async () => {
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: '2025-02-01T10:00:00.000Z',
        packages: {
          'custom-pkg': {
            originalName: '@custom/pkg',
            version: '1.0.0',
            files: {
              commands: [{ name: 'cmd.md', isDirectory: false }],
              skills: [{ name: 'skill.md', isDirectory: false }],
              docs: [{ name: 'doc1.md', isDirectory: false }, { name: 'doc2.md', isDirectory: false }],
              rules: [{ name: 'rule.md', isDirectory: false }],
            },
          },
        },
      };

      writeUnifiedSyncMeta(fixture.tempDir, meta);

      await runListCommand({ json: true }, fixture.tempDir);

      const jsonCall = mockConsoleLog.mock.calls.find((call) =>
        call[0].startsWith('['),
      );
      const output = JSON.parse(jsonCall![0]);

      expect(output[0].assets).toEqual({
        commands: 1,
        skills: 1,
        docs: 2,
        rules: 1,
      });
      expect(output[0].assetCount).toBe(5);
    });
  });
});
