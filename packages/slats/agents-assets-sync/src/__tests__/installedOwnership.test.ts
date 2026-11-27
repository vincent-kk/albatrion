import {
  existsSync,
  linkSync,
  readFileSync,
  rmSync,
  symlinkSync,
} from 'node:fs';
import { join } from 'node:path';

import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import {
  installPackage,
  makeRoot,
  removeRoot,
  runCliCode,
  writeAt,
} from './roundThree/fixture.js';

const packageName = '@probe/history';
let projectRoot: string;

beforeEach(() => {
  projectRoot = makeRoot('installed-ownership');
});
afterEach(() => removeRoot(projectRoot));

function prepare(
  assets: Record<string, string>,
  name = packageName,
  agent = 'claude',
) {
  const packageRoot = installPackage(projectRoot, { name, assets });
  const run = async ({ force = false, yes = false, dryRun = false } = {}) => {
    const chunks: string[] = [];
    const output = vi
      .spyOn(process.stdout, 'write')
      .mockImplementation((chunk) => {
        chunks.push(String(chunk));
        return true;
      });
    try {
      const exitCode = await runCliCode([
        `--package=${name}`,
        `--agent=${agent}`,
        '--scope=project',
        `--root=${projectRoot}`,
        '--json',
        ...(force ? ['--force'] : []),
        ...(yes ? ['--yes'] : []),
        ...(dryRun ? ['--dry-run'] : []),
      ]);
      const report: {
        readonly failures: readonly unknown[];
        readonly units: readonly { actions: readonly { kind: string }[] }[];
      } = JSON.parse(chunks.join(''));
      return { ...report, exitCode };
    } finally {
      output.mockRestore();
    }
  };
  return { assetRoot: join(packageRoot, 'docs/agents'), run };
}

it('records a same-bytes case alias before the first owner retires', async ({
  skip,
}) => {
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
  expect(match.units[0]?.actions[0]?.kind).toBe('skip-uptodate');

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
  expect(
    JSON.parse(readFileSync(record, 'utf8'))[packageName][rule],
  ).toBeUndefined();

  rmSync(join(second.assetRoot, rule));
  expect((await second.run(flags)).exitCode).toBe(0);
  expect(existsSync(destination)).toBe(false);
  expect(
    JSON.parse(readFileSync(record, 'utf8'))['@probe/second'][rule],
  ).toBeUndefined();
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

it.each([
  ['claude', '.claude', 'rules/retired.md'],
  ['codex', '.agents', 'skills/retired/SKILL.md'],
])(
  'previews and then removes a verified %s retirement (V2)',
  async (agent, home, rule) => {
    const { assetRoot, run } = prepare(
      { [rule]: '# retired\n', 'skills/stays/SKILL.md': '# active\n' },
      packageName,
      agent,
    );
    const destination = join(projectRoot, home, rule);
    const record = join(projectRoot, home, 'agents-assets-sync.json');
    expect((await run()).exitCode).toBe(0);
    expect(JSON.parse(readFileSync(record, 'utf8'))[packageName][rule]).toMatch(
      /^[a-f0-9]{64}$/,
    );

    rmSync(join(assetRoot, rule));
    expect((await run({ dryRun: true })).exitCode).toBe(0);
    expect(existsSync(destination)).toBe(true);
    expect((await run()).exitCode).toBe(2);
    expect((await run({ force: true, yes: true })).exitCode).toBe(0);
    expect(existsSync(destination)).toBe(false);
  },
);

it('refuses conflicting contents through a matching hard-link alias', async () => {
  const first = 'rules/matching.md';
  const second = 'rules/replacement.md';
  const firstPath = join(projectRoot, '.claude', first);
  const secondPath = join(projectRoot, '.claude', second);
  writeAt(firstPath, '# original\n');
  linkSync(firstPath, secondPath);
  const { run } = prepare({ [first]: '# original\n', [second]: '# other\n' });

  const report = await run({ force: true, yes: true });
  expect(report.exitCode).toBe(1);
  expect(report.failures).toEqual([
    expect.objectContaining({ stage: 'merge' }),
  ]);
  expect(readFileSync(firstPath, 'utf8')).toBe('# original\n');
  expect(readFileSync(secondPath, 'utf8')).toBe('# original\n');
});

it('preserves an unrecorded matching local file after the package retires it', async () => {
  const rule = 'rules/local.md';
  const content = '# local\n';
  const destination = join(projectRoot, '.claude', rule);
  const { assetRoot, run } = prepare({
    [rule]: content,
    'rules/stays.md': 'stays',
  });
  writeAt(destination, content);
  expect((await run()).exitCode).toBe(0);

  rmSync(join(assetRoot, rule));
  expect((await run({ force: true, yes: true })).exitCode).toBe(0);
  expect(readFileSync(destination, 'utf8')).toBe(content);
});

it('keeps an orphan scan from removing a local symbolic link target', async () => {
  const { run } = prepare({ 'skills/kit/SKILL.md': '# skill\n' });
  const local = join(projectRoot, 'notes.md');
  const path = join(projectRoot, '.claude/skills/kit/linked.md');
  writeAt(local, '# local\n');
  expect((await run()).exitCode).toBe(0);
  symlinkSync(local, path);
  expect((await run({ force: true, yes: true })).exitCode).toBe(0);
  expect(readFileSync(local, 'utf8')).toBe('# local\n');
});
