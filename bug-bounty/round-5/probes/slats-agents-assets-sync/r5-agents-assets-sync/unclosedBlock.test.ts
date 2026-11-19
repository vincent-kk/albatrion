// r5-agents-assets-sync: a managed START marker whose END line is no longer
// recognized keeps the common scan's block pending to the end of the document,
// with no boundary issue reported, and hides every later managed block.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, expect, it } from 'vitest';

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

const START_A = '<!-- AGENTS-ASSETS-SYNC:START:@probe/a:rules/a.md -->';
const START_B = '<!-- AGENTS-ASSETS-SYNC:START:@probe/b:rules/b.md -->';

function setup() {
  const root = makeRoot('r5-unclosed-block');
  roots.push(root);
  for (const name of ['a', 'b'])
    installPackage(root, {
      name: `@probe/${name}`,
      assets: { [`rules/${name}.md`]: `# rule ${name}\n` },
      manifest: true,
    });
  writeAt(join(root, 'AGENTS.md'), '# Team\n');
  const args = (packages: string) => [
    `--package=${packages}`,
    '--agent=codex',
    '--scope=project',
    '--no-interactive',
    `--root=${root}`,
  ];
  return { root, args, agents: join(root, 'AGENTS.md') };
}

const count = (path: string, line: string) =>
  readFileSync(path, 'utf8')
    .split('\n')
    .filter((candidate) => candidate === line).length;

it('a user who comments out one package rule (an HTML comment opened inside its block) does not make another package append a new copy on every run', async () => {
  const { args, agents } = setup();
  const installed = await runCliCode(args('@probe/a,@probe/b'));
  // Disable rule a by commenting out its body; the END marker's --> closes it.
  writeFileSync(
    agents,
    readFileSync(agents, 'utf8').replace(`${START_A}\n`, `${START_A}\n<!--\n`),
  );
  const codes = [
    await runCliCode(args('@probe/b')),
    await runCliCode(args('@probe/b')),
    await runCliCode(args('@probe/b')),
  ];
  expect({ installed, codes, copiesOfB: count(agents, START_B) }).toEqual({
    installed: 0,
    codes: [0, 0, 0],
    copiesOfB: 1,
  });
});

it('a START marker whose END line was deleted does not make every later run append another copy of other rules', async () => {
  const { args, agents } = setup();
  writeAt(
    agents,
    `# Team\n\n${START_A}\n# rule a\n\n## Our notes\n`,
  );
  const codes = [
    await runCliCode(args('@probe/b')),
    await runCliCode(args('@probe/b')),
    await runCliCode(args('@probe/b')),
  ];
  expect({ codes, copiesOfB: count(agents, START_B) }).toEqual({
    codes: [0, 0, 0],
    copiesOfB: 1,
  });
});
