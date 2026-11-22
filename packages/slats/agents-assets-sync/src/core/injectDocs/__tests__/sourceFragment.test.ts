import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, expect, it } from 'vitest';

import {
  consumerOf,
  installPackage,
  makeRoot,
  removeRoot,
  writeAt,
} from '../../../__tests__/roundThree/fixture.js';
import { runInjection } from '../utils/session/runInjection.js';

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) removeRoot(root);
});
it.each([
  { kind: 'double BOM fence', force: false },
  { kind: 'double BOM fence', force: true },
  { kind: 'managed markers', force: false },
  { kind: 'managed markers', force: true },
])(
  'refuses $kind before any unit write, force=$force',
  async ({ kind, force }) => {
    const root = makeRoot('source-fragment');
    roots.push(root);
    const body =
      kind === 'double BOM fence'
        ? '\uFEFF\uFEFF~~~\ncode\n~~~\n'
        : '<!-- AGENTS-ASSETS-SYNC:START:other:rules/a.md -->\nbody\n<!-- AGENTS-ASSETS-SYNC:END:other:rules/a.md -->\n';
    const packageRoot = installPackage(root, {
      name: '@probe/a',
      assets: { 'rules/a.md': body, 'skills/shared/new.md': 'new' },
      manifest: true,
    });
    const old = join(root, '.agents/skills/shared/old.md');
    writeAt(old, 'keep');
    const document = join(root, 'AGENTS.md');
    writeAt(document, '# user\n');
    const result = await runInjection({
      targets: [consumerOf(packageRoot, '@probe/a', 'manifest')],
      flags: { agent: ['codex'], scope: 'project', force, yes: true },
      originCwd: root,
    });
    expect(result.exitCode).toBe(1);
    expect(result.failures?.[0]).toMatchObject({
      stage: 'prepare',
      path: join(packageRoot, 'docs/agents/rules/a.md'),
    });
    expect(existsSync(join(root, '.agents/skills/shared/new.md'))).toBe(false);
    expect(readFileSync(old, 'utf8')).toBe('keep');
    expect(readFileSync(document, 'utf8')).toBe('# user\n');
  },
);
