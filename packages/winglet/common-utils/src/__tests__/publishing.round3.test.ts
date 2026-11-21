import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { expect, it } from 'vitest';

it('round-3 source-enabled consumers resolve the same published boundary as ordinary consumers', () => {
  const root = mkdtempSync(join(tmpdir(), 'common-published-'));
  const archive = join(root, 'package.tgz');
  const packed = spawnSync('yarn', ['pack', '--out', archive], { cwd: resolve(__dirname, '../..'), encoding: 'utf8' });
  expect(packed.status, packed.stderr).toBe(0);
  const extracted = spawnSync('tar', ['-xzf', archive, '-C', root], { encoding: 'utf8' });
  expect(extracted.status, extracted.stderr).toBe(0);
  const scope = join(root, 'node_modules/@winglet');
  mkdirSync(scope, { recursive: true });
  symlinkSync(join(root, 'package'), join(scope, 'common-utils'), 'dir');
  const resolvePackage = (conditions: string[]) => spawnSync(process.execPath, [...conditions, '-e', 'console.log(require.resolve("@winglet/common-utils"))'], { cwd: root, encoding: 'utf8' });
  const ordinary = resolvePackage([]);
  const source = resolvePackage(['--conditions=source']);
  expect(ordinary.status, ordinary.stderr).toBe(0);
  expect(source.status, source.stderr).toBe(ordinary.status);
  expect(source.stdout).toBe(ordinary.stdout);
});
