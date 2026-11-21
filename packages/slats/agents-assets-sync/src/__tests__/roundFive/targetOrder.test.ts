import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, expect, it } from 'vitest';

import { readWrittenFiles } from '../../__tests__/roundFour/helpers/readWrittenFiles.js';
import {
  installPackage,
  makeRoot,
  removeRoot,
  runCliCode,
  writeAt,
} from '../../__tests__/roundThree/fixture.js';

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) removeRoot(root);
});

async function scenario(packageArgs: string[], agents: string) {
  const root = makeRoot('r5-order');
  roots.push(root);
  for (const name of ['a', 'b'])
    installPackage(root, {
      name: `@probe/${name}`,
      assets: {
        [`skills/shared/${name}.md`]: `# ${name}\n`,
        [`rules/${name}.md`]: `# rule ${name}\n`,
      },
      manifest: true,
    });
  writeAt(join(root, 'AGENTS.md'), '# Team\n');
  const base = [
    ...packageArgs,
    `--agent=${agents}`,
    '--scope=project',
    '--no-interactive',
    `--root=${root}`,
  ];
  const codes = [await runCliCode(base)];
  writeAt(join(root, '.claude/skills/shared/a.md'), 'user edit\n');
  codes.push(await runCliCode(base));
  codes.push(await runCliCode([...base, '--force', '--yes']));
  codes.push(await runCliCode(base));
  const files = readWrittenFiles(root);
  const blocks = readFileSync(join(root, 'AGENTS.md'), 'utf8')
    .split('\n')
    .filter((line) => line.startsWith('<!-- AGENTS-ASSETS-SYNC:START'))
    .sort();
  delete files['AGENTS.md'];
  return { codes, files, blocks };
}

it('control: --package=a,b and --package=b,a give the same exits, files and blocks', async () => {
  const forward = await scenario(
    ['--package=@probe/a,@probe/b'],
    'claude,codex,agents',
  );
  const backward = await scenario(
    ['--package=@probe/b,@probe/a'],
    'agents,codex,claude',
  );
  expect(backward).toEqual(forward);
  expect(forward.codes).toEqual([0, 2, 0, 0]);
});

it('control: a duplicated target and the scope alias give the same result as the plain list', async () => {
  const plain = await scenario(['--package=@probe/a,@probe/b'], 'claude,codex');
  const duplicated = await scenario(
    ['--package=@probe/a,@probe/b,@probe/a', '--package=@probe'],
    'claude,codex,claude',
  );
  expect(duplicated).toEqual(plain);
});
