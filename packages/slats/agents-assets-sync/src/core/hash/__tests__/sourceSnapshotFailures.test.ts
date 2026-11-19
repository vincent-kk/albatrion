import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { open } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { expect, it, vi } from 'vitest';

import { readSourceSnapshot } from '../utils/readSourceSnapshot.js';

vi.mock('node:fs/promises', async (original) => {
  const actual = await original<typeof import('node:fs/promises')>();
  return { ...actual, open: vi.fn(actual.open) };
});
it.each(['open', 'read', 'stat', 'close'])(
  'keeps the source path and reason on %s failure',
  async (operation) => {
    const root = mkdtempSync(join(tmpdir(), 'source-failure-'));
    const path = join(root, 'source.md');
    writeFileSync(path, 'source');
    const handle = await open(path, 'r');
    const release = handle.close.bind(handle);
    const failure = Object.assign(new Error(`injected ${operation} failure`), {
      code: 'EIO',
    });
    if (operation === 'open') vi.mocked(open).mockRejectedValueOnce(failure);
    else {
      vi.mocked(open).mockResolvedValueOnce(handle);
      if (operation === 'read')
        vi.spyOn(handle, 'readFile').mockRejectedValueOnce(failure);
      if (operation === 'stat')
        vi.spyOn(handle, 'stat').mockRejectedValueOnce(failure);
      if (operation === 'close')
        vi.spyOn(handle, 'close').mockRejectedValueOnce(failure);
    }
    try {
      await expect(readSourceSnapshot(path)).rejects.toMatchObject({
        path,
        message: failure.message,
        code: 'EIO',
      });
    } finally {
      vi.restoreAllMocks();
      if (handle.fd >= 0) await release();
      rmSync(root, { recursive: true, force: true });
    }
  },
);
