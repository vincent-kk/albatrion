import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { chmod, chown } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, it, vi } from 'vitest';
import { replaceDocument } from '../utils/replaceDocument.js';
vi.mock('node:fs/promises', async (original) => {
  const actual = await original<typeof import('node:fs/promises')>();
  return { ...actual, chown: vi.fn(actual.chown), chmod: vi.fn(actual.chmod) };
});
afterEach(() => { vi.mocked(chmod).mockReset(); vi.mocked(chown).mockReset(); });
it.each([
  { operation: 'owner', code: 'ENOSYS' }, { operation: 'mode', code: 'ENOSYS' },
  { operation: 'owner', code: 'ENOTSUP' }, { operation: 'mode', code: 'ENOTSUP' },
  { operation: 'owner', code: 'EOPNOTSUPP' }, { operation: 'mode', code: 'EOPNOTSUPP' },
])('retains identity in place when $operation restoration is unsupported ($code)', async ({ operation, code }) => {
  const root = mkdtempSync(join(tmpdir(), 'metadata-fallback-'));
  try {
    const target = join(root, 'target'); writeFileSync(target, 'old', { mode: 0o640 });
    const before = statSync(target);
    vi.mocked(operation === 'owner' ? chown : chmod).mockRejectedValueOnce(Object.assign(new Error('metadata restoration unsupported'), { code }));
    await expect(replaceDocument(target, Buffer.from('new'))).resolves.toBeUndefined();
    const after = statSync(target);
    expect({ ino: after.ino, uid: after.uid, gid: after.gid, mode: after.mode }).toEqual({ ino: before.ino, uid: before.uid, gid: before.gid, mode: before.mode });
    expect(readFileSync(target, 'utf8')).toBe('new');
  } finally { rmSync(root, { recursive: true, force: true }); }
});
