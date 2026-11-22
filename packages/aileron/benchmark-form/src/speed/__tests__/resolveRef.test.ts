import { execFileSync } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it } from 'vitest';

import { resolveRef } from '../resolveRef';

it('checks a supplied prefix against the recorded full SHA', async () => {
  const root = await mkdtemp(join(tmpdir(), 'speed-ref-'));
  const sha = '0123456789abcdef0123456789abcdef01234567';
  try {
    await writeFile(join(root, '.speed-ref'), `${sha}\n`);
    await expect(resolveRef(root, '0123456')).resolves.toBe(sha);
    await expect(resolveRef(root, '012345')).rejects.toThrow();
    await expect(resolveRef(root, '0123457')).rejects.toThrow();
    await writeFile(join(root, '.speed-ref'), 'invalid\n');
    await expect(resolveRef(root, '0123456')).rejects.toThrow();
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

it('uses Git HEAD when the ref file is absent and fails without either source', async () => {
  const sha = execFileSync('git', ['rev-parse', 'HEAD'], {
    encoding: 'utf8',
  }).trim();
  const checkoutRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], {
    encoding: 'utf8',
  }).trim();
  await expect(resolveRef(checkoutRoot, sha.slice(0, 7))).resolves.toBe(sha);
  await expect(resolveRef(process.cwd(), sha.slice(0, 7))).rejects.toThrow();
  const root = await mkdtemp(join(tmpdir(), 'speed-no-ref-'));
  try {
    await expect(resolveRef(root, sha.slice(0, 7))).rejects.toThrow();
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
