import {
  chownSync,
  linkSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';

import { afterEach, expect, it } from 'vitest';

import {
  installPackage,
  makeRoot,
  removeRoot,
  runCliCode,
} from '../../__tests__/roundThree/fixture.js';

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) removeRoot(root);
});

function setup() {
  const root = makeRoot('r5-identity');
  roots.push(root);
  installPackage(root, {
    name: '@probe/kit',
    assets: { 'rules/r.md': '# rule\n' },
    manifest: true,
  });
  const agents = join(root, 'AGENTS.md');
  writeFileSync(agents, '# Team instructions\n');
  const args = [
    '--package=@probe/kit',
    '--agent=codex',
    '--scope=project',
    '--no-interactive',
    `--root=${root}`,
  ];
  return { root, agents, args };
}

it('a hard-linked AGENTS.md (CLAUDE.md as a second name) still shares one file after a block write', async () => {
  const { root, agents, args } = setup();
  const claude = join(root, 'CLAUDE.md');
  linkSync(agents, claude);
  const code = await runCliCode(args);
  expect({
    code,
    nlink: statSync(agents).nlink,
    sameInode: statSync(agents).ino === statSync(claude).ino,
    claudeHasBlock: readFileSync(claude, 'utf8').includes(
      'AGENTS-ASSETS-SYNC:START:@probe/kit:rules/r.md',
    ),
  }).toEqual({ code: 0, nlink: 2, sameInode: true, claudeHasBlock: true });
});

it('a block write keeps the group of AGENTS.md', async () => {
  const { root, agents, args } = setup();
  const directoryGroup = statSync(root).gid;
  // Any group the current user belongs to that differs from the directory's.
  const candidates = [20, 12, 80, 61];
  const group = candidates.find((gid) => gid !== directoryGroup);
  if (group === undefined) throw new Error('no second group');
  chownSync(agents, process.getuid?.() ?? -1, group);
  const before = statSync(agents).gid;
  const code = await runCliCode(args);
  expect({ code, before, after: statSync(agents).gid }).toEqual({
    code: 0,
    before: group,
    after: group,
  });
});
