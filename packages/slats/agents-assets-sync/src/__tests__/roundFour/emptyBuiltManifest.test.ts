import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

import { afterEach, expect, it, vi } from 'vitest';

import {
  PACKAGE_ROOT,
  makeRoot,
  removeRoot,
  runCliCode,
  writeAt,
} from '../../__tests__/roundThree/fixture.js';

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) removeRoot(root);
  vi.restoreAllMocks();
});

const BUILD_BIN = join(PACKAGE_ROOT, 'scripts/agents-build-hashes.mjs');

function setup(): { root: string; packageRoot: string } {
  const root = makeRoot('r4-empty-manifest');
  roots.push(root);
  const packageRoot = join(root, 'node_modules/@probe/kit');
  writeAt(
    join(packageRoot, 'package.json'),
    JSON.stringify({
      name: '@probe/kit',
      version: '1.0.0',
      agents: { assetPath: 'docs/agent' },
    }),
  );
  writeAt(join(packageRoot, 'docs/agents/rules/r.md'), '# rule\n');
  return { root, packageRoot };
}

const injectArgs = (root: string) => [
  '--package=@probe/kit',
  '--agent=codex',
  '--scope=project',
  `--root=${root}`,
  '--no-interactive',
];

it('the injector refuses an absent declared asset directory the same way before and after agents-build-hashes ran', async () => {
  const { root, packageRoot } = setup();
  const unbuilt = await runCliCode(injectArgs(root));
  spawnSync(process.execPath, [BUILD_BIN], { cwd: packageRoot });
  const built = await runCliCode(injectArgs(root));
  expect({ unbuilt, built }).toEqual({ unbuilt: 2, built: 2 });
});
