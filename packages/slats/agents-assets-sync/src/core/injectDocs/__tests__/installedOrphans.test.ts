import { chmodSync, existsSync, readFileSync, rmSync, symlinkSync } from 'node:fs';
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
  expect(existsSync(join(projectRoot, '.claude/agents-assets-sync.json'))).toBe(true);
  expect(existsSync(join(projectRoot, '.agents-assets-sync'))).toBe(false);

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

it('cleans a Codex skill when the package removes the whole namespace', async () => {
  const { assetRoot, run } = prepare({
    'skills/retired/SKILL.md': '# retired\n',
    'skills/active/SKILL.md': '# active\n',
    'rules/current.md': '# current rule\n',
  });
  const agent = ['codex'];
  const retired = join(projectRoot, '.agents/skills/retired/SKILL.md');
  expect((await run({ agent })).exitCode).toBe(0);
  expect(existsSync(retired)).toBe(true);
  const record = readFileSync(join(projectRoot, '.agents/agents-assets-sync.json'), 'utf8');
  expect(record).toContain('skills/retired/SKILL.md');
  expect(record).not.toContain('rules/current.md');

  rmSync(join(assetRoot, 'skills/retired'), { recursive: true });
  expect((await run({ agent })).exitCode).toBe(2);
  expect(existsSync(retired)).toBe(true);

  expect((await run({ agent, force: true, yes: true })).exitCode).toBe(0);
  expect(existsSync(retired)).toBe(false);
  expect(readFileSync(join(projectRoot, 'AGENTS.md'), 'utf8')).toContain(
    '# current rule',
  );
});

it('Codex installs rule blocks without creating an ownership record', async () => {
  const { run } = prepare({ 'rules/owned.md': '# block\n' });
  expect((await run({ agent: ['codex'], asset: ['rules'] })).exitCode).toBe(0);
  expect(existsSync(join(projectRoot, '.agents/agents-assets-sync.json'))).toBe(false);
  expect(readFileSync(join(projectRoot, 'AGENTS.md'), 'utf8')).toContain('# block');
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

it('records partial success through retry and cleans only owned retired files', async () => {
  const owned = 'rules/successful.md';
  const blocked = 'rules/blocked.md';
  const unmanaged = 'rules/matching.md';
  const { assetRoot, run } = prepare({
    [owned]: '# installed\n',
    [blocked]: '# replacement\n',
    [unmanaged]: '# existing\n',
  });
  const target = (path: string) => join(projectRoot, '.claude', path);
  writeAt(target(blocked), '# protected\n');
  chmodSync(target(blocked), 0o444);
  writeAt(target(unmanaged), '# existing\n');

  const partial = await run({ force: true, yes: true });
  expect(partial.exitCode).toBe(1);
  expect(partial.failures).toEqual([
    expect.objectContaining({ path: target(blocked), stage: 'apply' }),
  ]);
  expect(readFileSync(target(owned), 'utf8')).toBe('# installed\n');

  chmodSync(target(blocked), 0o644);
  expect((await run({ force: true, yes: true })).exitCode).toBe(0);
  rmSync(join(assetRoot, owned));
  rmSync(join(assetRoot, unmanaged));

  expect((await run()).exitCode).toBe(2);
  expect((await run({ force: true, yes: true })).exitCode).toBe(0);
  expect(existsSync(target(owned))).toBe(false);
  expect(readFileSync(target(unmanaged), 'utf8')).toBe('# existing\n');
});

it('reports a record write failure and leaves matching unrecorded files untouched', async () => {
  const asset = 'rules/unrecorded.md';
  const { assetRoot, run } = prepare({
    [asset]: '# installed\n',
    'rules/active.md': '# active\n',
  });
  const record = join(projectRoot, '.claude/agents-assets-sync.json');
  const installed = join(projectRoot, '.claude', asset);
  writeAt(record, '{}\n');
  chmodSync(record, 0o444);

  const result = await run();
  expect(result.exitCode).toBe(1);
  expect(result.failures).toEqual([
    expect.objectContaining({ path: record, stage: 'apply' }),
  ]);
  expect(readFileSync(record, 'utf8')).toBe('{}\n');
  expect(readFileSync(installed, 'utf8')).toBe('# installed\n');

  chmodSync(record, 0o644);
  expect((await run()).exitCode).toBe(0);
  rmSync(join(assetRoot, asset));
  expect((await run({ force: true, yes: true })).exitCode).toBe(0);
  expect(readFileSync(installed, 'utf8')).toBe('# installed\n');
});

it.each([true, false])(
  'distinguishes installed ownership from unrecorded matching bytes (installed: %s)',
  async (installed) => {
    const rule = 'rules/shared.md';
    const content = '# shared\n';
    const local = join(projectRoot, '.claude', rule);
    const first = prepare({ [rule]: content, 'rules/stays.md': '# first\n' });
    const second = prepare({ [rule]: content }, '@probe/second');
    if (!installed) writeAt(local, content);

    expect((await first.run()).exitCode).toBe(0);
    const matched = await second.run();
    expect(matched.exitCode).toBe(0);
    expect(matched.units[0].plan.actions[0].kind).toBe('skip-uptodate');

    rmSync(join(first.assetRoot, rule));
    expect((await first.run({ force: true, yes: true })).exitCode).toBe(0);
    expect(readFileSync(local, 'utf8')).toBe(content);

    const record = readFileSync(
      join(projectRoot, '.claude/agents-assets-sync.json'),
      'utf8',
    );
    expect(JSON.parse(record)['@probe/second'] !== undefined).toBe(installed);
  },
);

it('retains a retired rule whose case alias has a verified owner', async ({ skip }) => {
  writeAt(join(projectRoot, 'probeCase'), 'probe');
  if (!existsSync(join(projectRoot, 'PROBECASE')))
    skip('The temporary volume is case-sensitive');
  const upper = 'rules/SHARED.md';
  const lower = 'rules/shared.md';
  const first = prepare({ [upper]: 'same', 'rules/a.md': 'a' });
  const second = prepare(
    { [lower]: 'initially different', 'rules/b.md': 'b' },
    '@probe/second',
  );
  const flags = { force: true, yes: true };
  expect((await first.run(flags)).exitCode).toBe(0);
  expect((await second.run(flags)).exitCode).toBe(0);
  writeAt(join(second.assetRoot, lower), 'same');
  expect((await second.run(flags)).exitCode).toBe(0);

  const record = JSON.parse(
    readFileSync(join(projectRoot, '.claude/agents-assets-sync.json'), 'utf8'),
  );
  expect(record[packageName][upper]).toMatch(/^[a-f0-9]{64}$/);
  expect(record['@probe/second'][lower]).toBe(record[packageName][upper]);

  rmSync(join(first.assetRoot, upper));
  expect((await first.run(flags)).exitCode).toBe(0);
  expect(readFileSync(join(projectRoot, '.claude', upper), 'utf8')).toBe('same');
});

it('records a same-bytes case alias before the first owner retires', async ({ skip }) => {
  writeAt(join(projectRoot, 'probeCase'), 'probe');
  if (!existsSync(join(projectRoot, 'PROBECASE')))
    skip('The temporary volume is case-sensitive');

  const lower = 'rules/shared.md';
  const upper = 'rules/SHARED.md';
  const content = '# shared\n';
  const first = prepare({ [lower]: content, 'rules/a.md': '# A\n' });
  const second = prepare({ [upper]: content }, '@probe/second');
  expect((await first.run()).exitCode).toBe(0);
  const match = await second.run();
  expect(match.exitCode).toBe(0);
  expect(match.units[0].plan.actions[0]?.kind).toBe('skip-uptodate');

  rmSync(join(first.assetRoot, lower));
  expect((await first.run({ force: true, yes: true })).exitCode).toBe(0);
  expect(existsSync(join(projectRoot, '.claude', upper))).toBe(true);

  const record = JSON.parse(
    readFileSync(join(projectRoot, '.claude/agents-assets-sync.json'), 'utf8'),
  );
  expect(record['@probe/second'][upper]).toMatch(/^[a-f0-9]{64}$/);
  expect(record[packageName][lower]).toBeUndefined();
});

it('releases a retired co-owner while the other package still ships the rule', async () => {
  const rule = 'rules/shared.md';
  const content = '# shared\n';
  const first = prepare({ [rule]: content, 'rules/a.md': '# A\n' });
  const second = prepare(
    { [rule]: content, 'rules/b.md': '# B\n' },
    '@probe/second',
  );
  expect((await first.run()).exitCode).toBe(0);
  expect((await second.run()).exitCode).toBe(0);

  const flags = { force: true, yes: true };
  const destination = join(projectRoot, '.claude', rule);
  const record = join(projectRoot, '.claude/agents-assets-sync.json');
  rmSync(join(first.assetRoot, rule));
  expect((await first.run(flags)).exitCode).toBe(0);
  expect(readFileSync(destination, 'utf8')).toBe(content);
  expect(JSON.parse(readFileSync(record, 'utf8'))[packageName][rule]).toBeUndefined();

  rmSync(join(second.assetRoot, rule));
  expect((await second.run(flags)).exitCode).toBe(0);
  expect(existsSync(destination)).toBe(false);
  expect(JSON.parse(readFileSync(record, 'utf8'))['@probe/second'][rule]).toBeUndefined();
});

it('retires a rule when a separate same-hash peer path cannot be resolved', async () => {
  const rule = 'rules/retire.md';
  const other = 'rules/unrelated.md';
  const content = '# same hash\n';
  const first = prepare({ [rule]: content, 'rules/a.md': '# A\n' });
  const second = prepare({ [other]: content }, '@probe/second');
  expect((await first.run()).exitCode).toBe(0);
  expect((await second.run()).exitCode).toBe(0);

  const peer = join(projectRoot, '.claude', other);
  rmSync(peer);
  symlinkSync('unrelated.md', peer);
  rmSync(join(first.assetRoot, rule));

  const retired = await first.run({ force: true, yes: true });
  expect(retired.failures).toEqual([]);
  expect(retired.exitCode).toBe(0);
  expect(existsSync(join(projectRoot, '.claude', rule))).toBe(false);
});
