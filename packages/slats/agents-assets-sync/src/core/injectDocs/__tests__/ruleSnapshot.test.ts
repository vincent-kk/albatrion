import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, expect, it } from 'vitest';

import {
  consumerOf,
  installPackage,
  makeRoot,
  removeRoot,
} from '../../../__tests__/roundThree/fixture.js';
import { findBlockBody } from '../../markerBlock/index.js';
import { runInjection } from '../utils/session/runInjection.js';

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) removeRoot(root);
});
it.each([
  { agents: ['claude'] },
  { agents: ['codex'] },
  { agents: ['claude', 'codex'] },
  { agents: ['codex', 'claude'] },
])(
  'writes the checked rule bytes after source changes, agents=$agents',
  async ({ agents }) => {
    const root = makeRoot('rule-snapshot');
    roots.push(root);
    const original = Buffer.from('\uFEFF~~~\r\nsafe\r\n~~~\r\n');
    const packageRoot = installPackage(root, {
      name: '@probe/a',
      assets: { 'rules/a.md': original },
      manifest: true,
    });
    const source = join(packageRoot, 'docs/agents/rules/a.md');
    const result = await runInjection({
      targets: [consumerOf(packageRoot, '@probe/a', 'manifest')],
      flags: { agent: agents, scope: 'project', force: true, yes: true },
      originCwd: root,
      onPlan: () => {
        writeFileSync(source, '~~~\nunchecked');
      },
    });
    expect(result.exitCode).toBe(0);
    if (agents.includes('claude'))
      expect(readFileSync(join(root, '.claude/rules/a.md'))).toEqual(original);
    if (agents.includes('codex'))
      expect(
        findBlockBody(
          readFileSync(join(root, 'AGENTS.md'), 'latin1'),
          '@probe/a:rules/a.md',
        ),
      ).toBe('~~~\nsafe\n~~~\n');
  },
);
