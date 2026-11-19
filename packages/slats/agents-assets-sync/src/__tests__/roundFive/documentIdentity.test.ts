import { linkSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { chown } from 'node:fs/promises';
import { join } from 'node:path';

import { afterEach, expect, it, vi } from 'vitest';

import {
  installPackage,
  makeRoot,
  removeRoot,
  runCliCode,
} from '../../__tests__/roundThree/fixture.js';
import { setAlternateGroup } from './helpers/setAlternateGroup.js';

vi.mock('node:fs/promises', async (original) => {
  const actual = await original<typeof import('node:fs/promises')>();
  return { ...actual, chown: vi.fn(actual.chown) };
});

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) removeRoot(root);
  vi.mocked(chown).mockReset();
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
  const { agents, args } = setup();
  const group = setAlternateGroup(agents, process.getgroups?.() ?? []);
  const before = statSync(agents);
  if (group === undefined)
    vi.mocked(chown).mockRejectedValueOnce(
      Object.assign(new Error('ownership denied'), { code: 'EPERM' }),
    );
  const code = await runCliCode(args);
  const after = statSync(agents);
  expect({ code, group: after.gid }).toEqual({ code: 0, group: before.gid });
  expect(readFileSync(agents, 'utf8')).toContain(
    'AGENTS-ASSETS-SYNC:START:@probe/kit:rules/r.md',
  );
  expect(chown).toHaveBeenCalledOnce();
  if (group === undefined) expect(after.ino).toBe(before.ino);
});
