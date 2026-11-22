import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it } from 'vitest';

import { resolveArm } from '../resolveArm';

it('rejects escaped dist and non-public exports', async () => {
  const root = await mkdtemp(join(tmpdir(), 'speed-arm-'));
  const outside = await mkdtemp(join(tmpdir(), 'speed-dist-'));
  const pkg = join(root, 'pkg');
  try {
    await mkdir(pkg);
    await writeFile(join(root, 'yarn.lock'), 'lock');
    await writeFile(join(outside, 'index.mjs'), 'export {}');
    await symlink(outside, join(pkg, 'dist'));
    const manifest = async (exports: unknown) =>
      writeFile(
        join(pkg, 'package.json'),
        JSON.stringify({ name: 'test-package', version: '1', exports }),
      );
    await manifest({ '.': { import: './dist/index.mjs' } });
    await expect(
      resolveArm(root, 'pkg', 'test-package', '.'),
    ).rejects.toThrow();
    await rm(join(pkg, 'dist'));
    await mkdir(join(pkg, 'dist'));
    await writeFile(join(pkg, 'dist/index.mjs'), 'export {}');
    await manifest({ '.': null });
    await expect(
      resolveArm(root, 'pkg', 'test-package', '.'),
    ).rejects.toThrow();
    await manifest({ '.': { source: './dist/index.mjs' } });
    await expect(
      resolveArm(root, 'pkg', 'test-package', '.'),
    ).rejects.toThrow();
  } finally {
    await rm(root, { recursive: true, force: true });
    await rm(outside, { recursive: true, force: true });
  }
});
