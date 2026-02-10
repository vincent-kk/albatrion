/**
 * Unit tests for status command
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { runStatusCommand } from '../../commands/status';
import { writeUnifiedSyncMeta } from '../../core/syncMeta';
import type { UnifiedSyncMeta } from '../../utils/types';
import { type TestFixture, createTestFixture } from '../helpers';

// Mock console
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

// Mock fetch for npm registry
const createMockFetch = (
  responses: Record<string, { version?: string; status?: number }>,
) => {
  return vi.fn(async (url: string) => {
    // Extract package name from URL
    const match = url.match(/registry\.npmjs\.org\/(@?[^/]+\/[^/]+)\//);
    if (!match) {
      return new Response('Not found', { status: 404 });
    }

    const packageName = match[1];
    const mockResponse = responses[packageName];

    if (!mockResponse) {
      return new Response('Not found', { status: 404 });
    }

    if (mockResponse.status === 404) {
      return new Response('Not found', { status: 404 });
    }

    return new Response(JSON.stringify({ version: mockResponse.version }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });
};

describe('status command', () => {
  let fixture: TestFixture;

  beforeEach(() => {
    fixture = createTestFixture([]);
    mockConsoleLog.mockClear();
  });

  afterEach(() => {
    fixture.cleanup();
    vi.unstubAllGlobals();
  });

  describe('runStatusCommand', () => {
    it('should show message when no packages synced', async () => {
      await runStatusCommand({ noRemote: false }, fixture.tempDir);

      // logger.info uses console.log(pc.blue('info'), message)
      // picocolors adds ANSI codes, so we check if any call contains the message
      const infoCall = mockConsoleLog.mock.calls.find((call) =>
        call.some((arg) => String(arg).includes('No packages synced yet')),
      );
      expect(infoCall).toBeDefined();
    });

    it('should check remote versions and show update status', async () => {
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: '2025-02-01T10:00:00.000Z',
        packages: {
          'canard-schema-form': {
            originalName: '@canard/schema-form',
            version: '0.10.0',
            files: { commands: ['test.md'] },
          },
        },
      };

      writeUnifiedSyncMeta(fixture.tempDir, meta);

      // Mock npm registry response
      const mockFetch = createMockFetch({
        '@canard/schema-form': { version: '0.11.0' },
      });
      vi.stubGlobal('fetch', mockFetch);

      await runStatusCommand({ noRemote: false }, fixture.tempDir);

      // Verify remote version checked
      expect(mockFetch).toHaveBeenCalled();

      // Verify status shown
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('@canard/schema-form'),
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Local:  0.10.0'),
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Remote: 0.11.0'),
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Update available'),
      );
    });

    it('should show up-to-date status when versions match', async () => {
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: '2025-02-01T10:00:00.000Z',
        packages: {
          'canard-schema-form': {
            originalName: '@canard/schema-form',
            version: '0.10.0',
            files: { commands: ['test.md'] },
          },
        },
      };

      writeUnifiedSyncMeta(fixture.tempDir, meta);

      // Mock npm registry response with same version
      const mockFetch = createMockFetch({
        '@canard/schema-form': { version: '0.10.0' },
      });
      vi.stubGlobal('fetch', mockFetch);

      await runStatusCommand({ noRemote: false }, fixture.tempDir);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Up to date'),
      );
    });

    it('should skip remote check when noRemote flag is set', async () => {
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

      await runStatusCommand({ noRemote: true }, fixture.tempDir);

      // Verify no remote checks made
      expect(mockFetch).not.toHaveBeenCalled();

      // Verify skipped message shown
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('(check skipped)'),
      );
    });

    it('should handle package not found on npm registry', async () => {
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: '2025-02-01T10:00:00.000Z',
        packages: {
          'private-pkg': {
            originalName: '@private/pkg',
            version: '1.0.0',
            files: { commands: ['test.md'] },
          },
        },
      };

      writeUnifiedSyncMeta(fixture.tempDir, meta);

      // Mock 404 response
      const mockFetch = createMockFetch({
        '@private/pkg': { status: 404 },
      });
      vi.stubGlobal('fetch', mockFetch);

      await runStatusCommand({ noRemote: false }, fixture.tempDir);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('(not available)'),
      );
    });

    it('should handle network errors gracefully', async () => {
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

      // Mock network error
      const mockFetch = vi.fn(async () => {
        throw new Error('Network error');
      });
      vi.stubGlobal('fetch', mockFetch);

      await runStatusCommand({ noRemote: false }, fixture.tempDir);

      // Should not crash, should show error
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('(not available)'),
      );
    });

    it('should show summary with counts', async () => {
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: '2025-02-01T10:00:00.000Z',
        packages: {
          pkg1: {
            originalName: '@test/pkg1',
            version: '1.0.0',
            files: { commands: ['test.md'] },
          },
          pkg2: {
            originalName: '@test/pkg2',
            version: '2.0.0',
            files: { commands: ['test.md'] },
          },
          pkg3: {
            originalName: '@test/pkg3',
            version: '3.0.0',
            files: { commands: ['test.md'] },
          },
        },
      };

      writeUnifiedSyncMeta(fixture.tempDir, meta);

      const mockFetch = createMockFetch({
        '@test/pkg1': { version: '1.0.0' }, // up to date
        '@test/pkg2': { version: '2.1.0' }, // update available
        '@test/pkg3': { version: '3.0.0' }, // up to date
      });
      vi.stubGlobal('fetch', mockFetch);

      await runStatusCommand({ noRemote: false }, fixture.tempDir);

      // Verify summary shown
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('2 up to date'),
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('1 updates available'),
      );
    });

    it('should sort packages alphabetically', async () => {
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: '2025-02-01T10:00:00.000Z',
        packages: {
          'z-pkg': {
            originalName: '@z/pkg',
            version: '1.0.0',
            files: { commands: ['test.md'] },
          },
          'a-pkg': {
            originalName: '@a/pkg',
            version: '1.0.0',
            files: { commands: ['test.md'] },
          },
          'm-pkg': {
            originalName: '@m/pkg',
            version: '1.0.0',
            files: { commands: ['test.md'] },
          },
        },
      };

      writeUnifiedSyncMeta(fixture.tempDir, meta);

      const mockFetch = createMockFetch({
        '@z/pkg': { version: '1.0.0' },
        '@a/pkg': { version: '1.0.0' },
        '@m/pkg': { version: '1.0.0' },
      });
      vi.stubGlobal('fetch', mockFetch);

      await runStatusCommand({ noRemote: false }, fixture.tempDir);

      // Get all package name log calls
      const packageCalls = mockConsoleLog.mock.calls
        .map((call) => call[0])
        .filter((log: string) => log.includes('@') && log.includes('/pkg'));

      // Verify order (first call should be @a/pkg)
      expect(packageCalls[0]).toContain('@a/pkg');
    });

    it('should handle fetch timeout', async () => {
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: '2025-02-01T10:00:00.000Z',
        packages: {
          'slow-pkg': {
            originalName: '@slow/pkg',
            version: '1.0.0',
            files: { commands: ['test.md'] },
          },
        },
      };

      writeUnifiedSyncMeta(fixture.tempDir, meta);

      // Mock fetch that throws timeout error immediately
      const mockFetch = vi.fn(async () => {
        throw new Error('The operation was aborted');
      });
      vi.stubGlobal('fetch', mockFetch);

      await runStatusCommand({ noRemote: false }, fixture.tempDir);

      // Should handle timeout gracefully (shows package even if remote fetch fails)
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('should show synced timestamp for each package', async () => {
      const syncedAt = '2025-02-01T15:30:00.000Z';
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt,
        packages: {
          'test-pkg': {
            originalName: '@test/pkg',
            version: '1.0.0',
            files: { commands: ['test.md'] },
          },
        },
      };

      writeUnifiedSyncMeta(fixture.tempDir, meta);

      const mockFetch = createMockFetch({
        '@test/pkg': { version: '1.0.0' },
      });
      vi.stubGlobal('fetch', mockFetch);

      await runStatusCommand({ noRemote: false }, fixture.tempDir);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Synced:'),
      );
    });

    it('should use version cache to reduce API calls', async () => {
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

      const mockFetch = createMockFetch({
        '@test/pkg': { version: '1.1.0' },
      });
      vi.stubGlobal('fetch', mockFetch);

      // First call - should fetch
      await runStatusCommand({ noRemote: false }, fixture.tempDir);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      mockFetch.mockClear();

      // Second call immediately - should use cache
      await runStatusCommand({ noRemote: false }, fixture.tempDir);
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });
  });
});
