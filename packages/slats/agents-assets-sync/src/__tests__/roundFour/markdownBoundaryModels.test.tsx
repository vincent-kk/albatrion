import { join } from 'node:path';

import { afterEach, expect, it, vi } from 'vitest';

import type * as core from '../../core/index.js';
import {
  consumerOf,
  installPackage,
  makeRoot,
  removeRoot,
  writeAt,
} from '../roundThree/fixture.js';
import { runSurface } from './helpers/runSurface.js';

const start = '<!-- AGENTS-ASSETS-SYNC:START:@probe/bad:rules/a.md -->';
const end = '<!-- AGENTS-ASSETS-SYNC:END:@probe/bad:rules/a.md -->';
const roots: string[] = [];
afterEach(() => {
  roots.splice(0).forEach(removeRoot);
  vi.restoreAllMocks();
});

it.each([
  { kind: 'source-open', body: 'intro\n```md\nexample\n', line: 2 },
  { kind: 'document-open', document: '# user\n```md\nexample\n', line: 2 },
  {
    kind: 'longer-close',
    body: `intro\n\x60\x60\x60md\n${start}\n${end}\n\x60\x60\x60\x60\n`,
  },
  { kind: 'tilde', body: `intro\n~~~md\n${start}\n${end}\n~~~~\n` },
  { kind: 'indented', body: `intro\n   ~~~md\n${start}\n${end}\n   ~~~\n` },
  { kind: 'blockquote', body: 'intro\n> ```md\n> example\n> ```\n', line: 2 },
  { kind: 'list', body: 'intro\n- ```md\n  example\n  ```\n', line: 2 },
  {
    kind: 'list-continuation',
    body: '- item\n\n  ```md\n  example\n  ```\n',
    line: 3,
  },
  { kind: 'html-comment-marker', document: `# user\n<!-- example\n${start}\n` },
  { kind: 'source-comment-open', body: 'intro\n<!-- example\n', line: 2 },
])(
  'shares Markdown boundary results in every mode: $kind',
  async (scenario) => {
    const outcomes = [];
    for (const mode of ['plain', 'json', 'ink'] as const) {
      const root = makeRoot('markdown-model');
      roots.push(root);
      const badRoot = installPackage(root, {
        name: '@probe/bad',
        assets: {
          'skills/bad/SKILL.md': '# bad unit\n',
          'rules/00.md': '# valid first rule\n',
          'rules/a.md': scenario.body ?? '# shipped\n',
        },
      });
      const goodRoot = installPackage(root, {
        name: '@probe/good',
        assets: { 'skills/good/SKILL.md': '# good unit\n' },
      });
      const document = scenario.document ?? '';
      if (document) writeAt(join(root, 'AGENTS.md'), document);
      const targets = [
        consumerOf(badRoot, '@probe/bad', 'directory'),
        consumerOf(goodRoot, '@probe/good', 'directory'),
      ];
      const flags = {
        agent: ['codex'],
        scope: 'project',
        yes: true,
        force: true,
        interactive: true,
      };
      const first = await runSurface(mode, root, targets, flags);
      expect(first.files['.agents/skills/good/SKILL.md']).toBeDefined();
      if (scenario.line) {
        expect(first.code).toBe(1);
        const filename =
          scenario.kind === 'document-open' ? 'AGENTS.md' : 'rules/a.md';
        expect(first.model.units[0].error).toContain(
          `${filename}:${scenario.line}:`,
        );
        expect(first.model.units[0].error).toMatch(/close|top level/i);
        expect(first.files['.agents/skills/bad/SKILL.md']).toBeUndefined();
        expect(first.files['AGENTS.md'] ?? '').toBe(
          Buffer.from(document).toString('hex'),
        );
        if (scenario.kind === 'document-open')
          writeAt(join(root, 'AGENTS.md'), document + '```\n');
        else if (scenario.kind === 'source-open')
          writeAt(
            join(badRoot, 'docs/agents/rules/a.md'),
            scenario.body + '```\n',
          );
        else if (scenario.kind === 'source-comment-open')
          writeAt(
            join(badRoot, 'docs/agents/rules/a.md'),
            scenario.body + '-->\n',
          );
        else writeAt(join(badRoot, 'docs/agents/rules/a.md'), '# fixed\n');
        expect((await runSurface(mode, root, targets, flags)).code).toBe(0);
      } else {
        expect(first.code).toBe(0);
        expect(
          first.files['AGENTS.md'].startsWith(
            Buffer.from(document).toString('hex'),
          ),
        ).toBe(true);
      }
      const second = await runSurface(mode, root, targets, flags);
      expect(second.code).toBe(0);
      expect(
        second.model.units.every((unit: core.RunUnit) =>
          unit.plan.actions.every(
            (action) =>
              action.kind === 'skip-uptodate' ||
              action.kind === 'skip-unsupported',
          ),
        ),
      ).toBe(true);
      outcomes.push({ first, second });
    }
    expect(outcomes[1]).toEqual(outcomes[0]);
    expect(outcomes[2]).toEqual(outcomes[0]);
  },
);
