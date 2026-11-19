import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, expect, it } from 'vitest';
import { consumerOf, installPackage, makeRoot, removeRoot } from '../../../__tests__/roundThree/fixture.js';
import { runInjection } from '../utils/session/runInjection.js';
const roots: string[] = [];
afterEach(() => { for (const root of roots.splice(0)) removeRoot(root); });
it('writes the planned skill bytes when the source changes before apply', async () => {
  const root = makeRoot('skill-snapshot');
  roots.push(root);
  const packageRoot = installPackage(root, {
    name: '@probe/a',
    assets: { 'skills/alpha/a.md': 'planned skill\n' },
    manifest: true,
  });
  const source = join(packageRoot, 'docs/agents/skills/alpha/a.md');
  const result = await runInjection({
    targets: [consumerOf(packageRoot, '@probe/a', 'directory')],
    flags: { agent: ['claude'], scope: 'project', force: true, yes: true },
    originCwd: root,
    onPlan: () => writeFileSync(source, 'mutated skill\n'),
  });
  expect(result.exitCode).toBe(0);
  expect(readFileSync(join(root, '.claude/skills/alpha/a.md'), 'utf8')).toBe(
    'planned skill\n',
  );
});

it('copies a snapshotted rule after the source file disappears', async () => {
  const root = makeRoot('rule-unlink');
  roots.push(root);
  const original = Buffer.from('planned rule\n');
  const packageRoot = installPackage(root, {
    name: '@probe/a',
    assets: { 'rules/a.md': original },
    manifest: true,
  });
  const source = join(packageRoot, 'docs/agents/rules/a.md');
  const result = await runInjection({
    targets: [consumerOf(packageRoot, '@probe/a', 'manifest')],
    flags: { agent: ['claude'], scope: 'project', force: true, yes: true },
    originCwd: root,
    onPlan: () => unlinkSync(source),
  });
  expect(result.exitCode, JSON.stringify(result.failures)).toBe(0);
  expect(existsSync(join(root, '.claude/rules/a.md'))).toBe(true);
  expect(readFileSync(join(root, '.claude/rules/a.md'))).toEqual(original);
});

