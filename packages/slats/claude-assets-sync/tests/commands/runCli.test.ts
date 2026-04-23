import { describe, expect, it, vi } from 'vitest';

import { runInject } from '../../src/commands/runCli/utils/runInject.js';
import type { RunCliOptions } from '../../src/commands/runCli/type.js';

function trapExit(): { calls: number[]; restore: () => void } {
  const calls: number[] = [];
  const original = process.exit;
  process.exit = ((code?: number) => {
    calls.push(code ?? 0);
    throw new Error('test:exit');
  }) as typeof process.exit;
  return { calls, restore: () => (process.exit = original) };
}

describe('runInject — caller-supplied option validation', () => {
  it('exits with 2 when required options are missing', async () => {
    const loggerMock = vi.spyOn(console, 'error').mockImplementation(() => {});
    const exit = trapExit();

    try {
      await expect(
        runInject(
          {},
          {
            packageRoot: '',
            packageName: '',
            packageVersion: '',
            assetPath: '',
          } as RunCliOptions,
        ),
      ).rejects.toThrow('test:exit');
      expect(exit.calls).toContain(2);
    } finally {
      exit.restore();
      loggerMock.mockRestore();
    }
  });

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
          },
        ),
      ).rejects.toThrow('test:exit');
      expect(exit.calls).toContain(2);
    } finally {
      exit.restore();
      loggerMock.mockRestore();
    }
  });
});
