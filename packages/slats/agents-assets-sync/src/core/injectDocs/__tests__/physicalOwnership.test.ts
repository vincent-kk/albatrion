import { mkdirSync, readFileSync, symlinkSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, expect, it } from 'vitest';

import { consumerOf, installPackage, makeRoot, removeRoot } from '../../../__tests__/roundThree/fixture.js';
import { runInjection } from '../utils/session/runInjection.js';

/** User-scope links deliberately share one physical destination across agents. */
const roots: string[] = [];
/** Tests restore HOME before leaving the fixture. */
const home = process.env.HOME;
afterEach(() => { process.env.HOME = home; for (const root of roots.splice(0)) removeRoot(root); });

it.each([true, false])('physical aliases deduplicate equal bytes and reject differing bytes (%s)', async (same) => {
  const root = makeRoot('physical-owners');
  roots.push(root);
  process.env.HOME = root;
  mkdirSync(join(root, 'shared'));
  for (const agent of ['.codex', '.agents']) {
    mkdirSync(join(root, agent));
    symlinkSync(join(root, 'shared'), join(root, agent, 'skills'));
  }
  const first = installPackage(root, { name: '@probe/a', assets: { 'skills/s/a.md': '# a\n' }, manifest: true });
  const second = installPackage(root, { name: '@probe/b', assets: { 'skills/s/a.md': same ? '# a\n' : '# b\n' }, manifest: true });
  const result = await runInjection({ targets: [consumerOf(first, '@probe/a', 'manifest'), consumerOf(second, '@probe/b', 'manifest')], flags: { agent: ['codex', 'agents'], scope: 'user', yes: true }, originCwd: root });
  expect(result.exitCode).toBe(same ? 0 : 1);
  if (same) {
    expect(result.units.flatMap((unit) => unit.report?.created ?? [])).toHaveLength(1);
    expect(readFileSync(join(root, 'shared/s/a.md'), 'utf8')).toBe('# a\n');
  } else expect(result.failures?.every((failure) => failure.stage === 'merge')).toBe(true);
});
