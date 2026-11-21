import { existsSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, beforeEach, expect, it } from 'vitest';

import {
  consumerOf,
  installPackage,
  makeRoot,
  removeRoot,
  writeAt,
} from '../../../__tests__/roundThree/fixture.js';
import type { DefaultFlags } from '../../../types/index.js';
import { runInjection } from '../utils/session/runInjection.js';
import type { RunInput } from '../utils/session/types.js';

const packageName = '@probe/history';
let projectRoot: string;

beforeEach(() => {
  projectRoot = makeRoot('installed-orphans');
});

afterEach(() => removeRoot(projectRoot));

function prepare(assets: Record<string, string>, name = packageName) {
  const packageRoot = installPackage(projectRoot, { name, assets });
  const target = consumerOf(packageRoot, name, 'directory');
  const run = (flags: DefaultFlags = {}, confirm?: RunInput['confirm']) =>
    runInjection({
      targets: [target],
      flags: { agent: ['claude'], scope: 'project', ...flags },
      originCwd: projectRoot,
      confirm,
    });
  return { assetRoot: target.assetRoot, run };
}

it('cleans only unchanged files owned by an earlier installation', async () => {
  const { assetRoot, run } = prepare({
    'rules/old.md': '# old\n',
    'rules/edited.md': '# before edit\n',
    'skills/gone/SKILL.md': '# removed skill\n',
    'rules/current.md': '# current\n',
  });
  expect((await run()).exitCode).toBe(0);

  const removed = ['rules/old.md', 'skills/gone/SKILL.md', 'rules/edited.md'];
  for (const relPath of removed) rmSync(join(assetRoot, relPath));
  writeAt(join(projectRoot, '.claude/rules/edited.md'), '# my edit\n');
  writeAt(join(projectRoot, '.claude/rules/unmanaged.md'), '# local rule\n');

  const blocked = await run();
  expect(blocked.exitCode).toBe(2);
  expect(blocked.units[0].plan.actions).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ kind: 'warn-orphan', relPath: 'rules/old.md' }),
      expect.objectContaining({
        kind: 'warn-orphan',
        relPath: 'skills/gone/SKILL.md',
      }),
    ]),
  );
  for (const relPath of removed)
    expect(existsSync(join(projectRoot, '.claude', relPath))).toBe(true);

  expect((await run({ force: true, yes: true })).exitCode).toBe(0);
  expect(existsSync(join(projectRoot, '.claude/rules/old.md'))).toBe(false);
  expect(existsSync(join(projectRoot, '.claude/skills/gone/SKILL.md'))).toBe(
    false,
  );
  expect(
    readFileSync(join(projectRoot, '.claude/rules/edited.md'), 'utf8'),
  ).toBe('# my edit\n');
  expect(
    readFileSync(join(projectRoot, '.claude/rules/unmanaged.md'), 'utf8'),
  ).toBe('# local rule\n');
});

it('a preview does not record ownership of matching local content', async () => {
  const { assetRoot, run } = prepare({
    'rules/preview.md': '# local\n',
    'rules/current.md': '# current\n',
  });
  const local = join(projectRoot, '.claude/rules/preview.md');
  writeAt(local, '# local\n');

  expect((await run({ dryRun: true })).exitCode).toBe(0);
  rmSync(join(assetRoot, 'rules/preview.md'));
  expect((await run({ force: true, yes: true })).exitCode).toBe(0);
  expect(readFileSync(local, 'utf8')).toBe('# local\n');
});

it('retains a retired rule owned by another verified installation', async () => {
  const first = prepare({ 'rules/shared.md': '# first\n' });
  expect((await first.run()).exitCode).toBe(0);
  const second = prepare({ 'rules/shared.md': '# second\n' }, '@probe/second');
  expect((await second.run({ force: true, yes: true })).exitCode).toBe(0);

  rmSync(join(first.assetRoot, 'rules/shared.md'));
  const local = join(projectRoot, '.claude/rules/shared.md');
  writeAt(local, '# first\n');
  expect((await first.run({ force: true, yes: true })).exitCode).toBe(0);
  expect(readFileSync(local, 'utf8')).toBe('# first\n');
});

it('rechecks the installed bytes after waiting for confirmation', async () => {
  const { assetRoot, run } = prepare({ 'rules/retired.md': '# before\n' });
  expect((await run()).exitCode).toBe(0);
  rmSync(join(assetRoot, 'rules/retired.md'));
  const local = join(projectRoot, '.claude/rules/retired.md');

  const result = await run({ force: true }, async () => {
    writeAt(local, '# edited during prompt\n');
    return true;
  });
  expect(result.exitCode).toBe(1);
  expect(readFileSync(local, 'utf8')).toBe('# edited during prompt\n');
});
