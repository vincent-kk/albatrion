// r3-agents-assets-sync: unusual but legal asset names (angle BS3), installed
// and then re-run. A second run must be a no-op (AC-ASSET-PATH-APPLY).
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { installPackage, makeRoot, removeRoot, runCliCode } from './fixture.js';

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) removeRoot(root);
});

const LONG = `${'l'.repeat(240)}.md`;
const NAMES = [
  'skills/my skill/SKILL.md',
  'skills/my skill/knowledge/a..b notes.md',
  'skills/한글 스킬/SKILL.md',
  'skills/emoji-🚀/SKILL.md',
  'skills/percent%20name/SKILL.md',
  'skills/hash#name/SKILL.md',
  `skills/long/${LONG}`,
  'rules/team rule.md',
  'rules/규칙.md',
  'rules/a:b.md',
  `rules/${LONG}`,
];

describe('r3-agents-assets-sync: asset names with spaces, dots, non-Latin text and length', () => {
  it.each(['claude', 'codex'] as const)(
    '%s installs every name and the re-run is a no-op',
    async (agent) => {
      const root = makeRoot(`names-${agent}`);
      roots.push(root);
      installPackage(root, {
        name: '@probe/names',
        assets: Object.fromEntries(NAMES.map((n) => [n, `body of ${n}\n`])),
        manifest: true,
      });
      const args = [
        '--package=@probe/names',
        `--agent=${agent}`,
        '--scope=project',
        `--root=${root}`,
        '--no-interactive',
      ];
      const first = await runCliCode(args);
      const second = await runCliCode(args);
      const forced = await runCliCode([...args, '--force', '--yes']);

      let blocks = 0;
      if (agent === 'codex') {
        const md = readFileSync(join(root, 'AGENTS.md'), 'utf8');
        blocks = md.split('AGENTS-ASSETS-SYNC:START:').length - 1;
      }
      const skillsRoot =
        agent === 'claude'
          ? join(root, '.claude/skills')
          : join(root, '.agents/skills');
      expect({
        first,
        second,
        forced,
        blocks,
        skillDirs: readdirSync(skillsRoot).sort(),
      }).toEqual({
        first: 0,
        second: 0,
        forced: 0,
        blocks: agent === 'codex' ? 4 : 0,
        skillDirs: [
          'emoji-🚀',
          'hash#name',
          'long',
          'my skill',
          'percent%20name',
          '한글 스킬',
        ].sort(),
      });
    },
  );
});
