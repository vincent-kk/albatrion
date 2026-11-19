// r4-agents-assets-sync, angle RG1 on round 3 item 7: the fix limited the
// dot-name refusal to skill *directories* (core/DETAIL.md:10,
// core/agentTarget/DETAIL.md:14), yet a placeholder file directly under
// `skills/` is still refused, which aborts the whole unit. Public API: `runCli`.
import { existsSync } from 'node:fs';
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

it.each([
  ['claude', '.claude/rules/r.md'],
  ['codex', 'AGENTS.md'],
] as const)(
  '%s: a package shipping skills/.gitkeep (an empty skills folder kept in git) still installs its rule',
  async (agent, ruleDestination) => {
    const root = makeRoot('r4-skills-gitkeep');
    roots.push(root);
    installPackage(root, {
      name: '@probe/kit',
      assets: { 'skills/.gitkeep': '', 'rules/r.md': '# rule\n' },
      manifest: true,
    });
    const code = await runCliCode([
      '--package=@probe/kit',
      `--agent=${agent}`,
      '--scope=project',
      `--root=${root}`,
      '--no-interactive',
    ]);
    expect({
      code,
      ruleInstalled: existsSync(join(root, ruleDestination)),
    }).toEqual({ code: 0, ruleInstalled: true });
  },
);
