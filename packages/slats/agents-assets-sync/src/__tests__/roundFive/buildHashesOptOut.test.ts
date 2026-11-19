import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, expect, it } from 'vitest';

import { PACKAGE_ROOT } from '../../__tests__/roundThree/fixture.js';

const BIN = join(PACKAGE_ROOT, 'scripts/agents-build-hashes.mjs');
const dirs: string[] = [];
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function consumer(pkg: Record<string, unknown>, assetDir?: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'r5-aas-optout-'));
  dirs.push(dir);
  writeFileSync(join(dir, 'package.json'), JSON.stringify(pkg));
  if (assetDir) {
    mkdirSync(join(dir, assetDir, 'rules'), { recursive: true });
    writeFileSync(join(dir, assetDir, 'rules/a.md'), '# a\n');
  }
  return dir;
}

function build(dir: string) {
  const result = spawnSync(process.execPath, [BIN], {
    cwd: dir,
    encoding: 'utf8',
  });
  return {
    status: result.status,
    stderr: result.stderr.trim().split('\n')[0],
  };
}

it.each([
  ['no agents field', {}],
  ['agents.assetPath not a string', { agents: { assetPath: 7 } }],
])(
  'agents-build-hashes silently no-ops for an opted-out package (%s), as the packaged knowledge states',
  (_label, extra) => {
    const dir = consumer({ name: '@probe/opted-out', version: '1.0.0', ...extra });
    const { status, stderr } = build(dir);
    expect({ status, stderr }).toEqual({ status: 0, stderr: '' });
  },
);

it('control: a declared, present asset directory builds a manifest', () => {
  const dir = consumer(
    {
      name: '@probe/wired',
      version: '1.0.0',
      agents: { assetPath: 'docs/agents' },
    },
    'docs/agents',
  );
  const { status } = build(dir);
  expect({
    status,
    manifest: existsSync(join(dir, 'dist/agents-hashes.json')),
  }).toEqual({ status: 0, manifest: true });
});
