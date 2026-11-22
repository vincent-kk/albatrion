// r3-agents-assets-sync: dot-prefixed files directly under a kind directory.
// core/DETAIL.md:10 and core/agentTarget/DETAIL.md:14 reserve dot-prefixed
// *skill directories* for the agent (Codex's `skills/.system/`). A placeholder
// such as `rules/.gitkeep` is neither a skill nor a directory, yet the hasher
// ships it (its noise list is `.omc`, `.DS_Store`, `*.log`).
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { installPackage, makeRoot, removeRoot, runCliCode } from './fixture.js';

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) removeRoot(root);
});

describe('r3-agents-assets-sync: a dot-prefixed placeholder file', () => {
  it.each([
    ['claude', 'rules/.gitkeep'],
    ['codex', 'rules/.gitkeep'],
    ['claude', 'commands/.gitkeep'],
  ] as const)(
    '%s: a package shipping %s still installs its skill and rule',
    async (agent, placeholder) => {
      const root = makeRoot('dot');
      roots.push(root);
      installPackage(root, {
        name: '@probe/dot',
        assets: {
          'skills/s/SKILL.md': '# skill\n',
          'rules/r.md': 'rule body\n',
          [placeholder]: '',
        },
      });
      const code = await runCliCode([
        '--package=@probe/dot',
        `--agent=${agent}`,
        '--scope=project',
        `--root=${root}`,
        '--no-interactive',
      ]);
      const skillDir = agent === 'claude' ? '.claude/skills' : '.agents/skills';
      const ruleInstalled =
        agent === 'claude'
          ? existsSync(join(root, '.claude/rules/r.md'))
          : existsSync(join(root, 'AGENTS.md')) &&
            readFileSync(join(root, 'AGENTS.md'), 'utf8').includes(
              'rule body',
            );
      expect({
        code,
        skillInstalled: existsSync(join(root, skillDir, 's/SKILL.md')),
        ruleInstalled,
      }).toEqual({ code: 0, skillInstalled: true, ruleInstalled: true });
    },
  );
});
