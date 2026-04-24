import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { runInject } from '../../src/commands/runCli/utils/runInject.js';
import type { ResolvedMetadata } from '../../src/commands/runCli/utils/resolvePackage.js';

function trapExit(): { calls: number[]; restore: () => void } {
  const calls: number[] = [];
  const original = process.exit;
  process.exit = ((code?: number) => {
    calls.push(code ?? 0);
    throw new Error('test:exit');
  }) as typeof process.exit;
  return { calls, restore: () => (process.exit = original) };
}

describe('runInject — dispatcher-resolved metadata validation', () => {
  it('exits with 2 when packageRoot is not absolute', async () => {
    const loggerMock = vi.spyOn(console, 'error').mockImplementation(() => {});
    const exit = trapExit();

    try {
      await expect(
        runInject(
          {},
          {
            packageRoot: 'relative/path',
            packageName: '@test/fixture',
            packageVersion: '1.0.0',
            assetPath: 'docs/claude',
          } satisfies ResolvedMetadata,
        ),
      ).rejects.toThrow('test:exit');
      expect(exit.calls).toContain(2);
    } finally {
      exit.restore();
      loggerMock.mockRestore();
    }
  });

  it('warns and returns when dist/claude-hashes.json is missing', async () => {
    const tmp = await mkdtemp(join(tmpdir(), 'slats-runinject-'));
    const packageRoot = join(tmp, 'pkg');
    await mkdir(join(packageRoot, 'docs', 'claude'), { recursive: true });

    const loggerWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const loggerStderr = vi
      .spyOn(process.stderr, 'write')
      .mockImplementation(() => true);
    const exit = trapExit();

    try {
      // dry-run avoids scope prompt requirement; missing hashes → warn + return.
      await runInject(
        { scope: 'project', dryRun: true, root: packageRoot },
        {
          packageRoot,
          packageName: '@test/fixture',
          packageVersion: '0.0.0',
          assetPath: 'docs/claude',
        } satisfies ResolvedMetadata,
      );
      expect(exit.calls).toEqual([]);
    } finally {
      exit.restore();
      loggerWarn.mockRestore();
      loggerStderr.mockRestore();
      await rm(tmp, { recursive: true, force: true });
    }
  });
});
