import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, expect, it, vi } from 'vitest';

import {
  consumerOf,
  installPackage,
  makeRoot,
  removeRoot,
  writeAt,
} from '../roundThree/fixture.js';
import { runSurface } from './helpers/runSurface.js';

const START = '<!-- AGENTS-ASSETS-SYNC:START:@probe/bom:rules/a.md -->';
const END = '<!-- AGENTS-ASSETS-SYNC:END:@probe/bom:rules/a.md -->';
const roots: string[] = [];
afterEach(() => {
  roots.splice(0).forEach(removeRoot);
  vi.restoreAllMocks();
});

it.each([
  { name: 'closed-lf', eol: '\n', kind: 'closed' },
  { name: 'closed-crlf', eol: '\r\n', kind: 'closed' },
  { name: 'open', eol: '\n', kind: 'open' },
  { name: 'managed-first-line', eol: '\n', kind: 'managed' },
])(
  'preserves marked bytes and shares mode results: $name',
  async ({ eol, kind }) => {
    const outcomes = [];
    for (const mode of ['plain', 'json', 'ink'] as const) {
      const root = makeRoot('bom-context');
      roots.push(root);
      const lines =
        kind === 'managed'
          ? [START, '# old', END, '']
          : [
              '```md',
              START,
              '# example',
              END,
              ...(kind === 'closed' ? ['```'] : []),
              '',
            ];
      const document = Buffer.from('\uFEFF' + lines.join(eol));
      const source = Buffer.from('\uFEFF# shipped\n');
      const target = installPackage(root, {
        name: '@probe/bom',
        assets: { 'rules/a.md': source },
      });
      const path = join(root, 'AGENTS.md');
      writeAt(path, document);
      const targets = [consumerOf(target, '@probe/bom', 'directory')];
      const flags = {
        agent: ['codex'],
        scope: 'project',
        force: true,
        yes: true,
      };
      const result = await runSurface(mode, root, targets, flags);
      const after = readFileSync(path);
      expect(readFileSync(join(target, 'docs/agents/rules/a.md'))).toEqual(
        source,
      );
      if (kind === 'open') {
        expect(result.code).toBe(1);
        expect(after).toEqual(document);
        expect(result.model.units[0].error).toContain(
          'AGENTS.md:1: Unclosed fenced code block',
        );
      } else {
        expect(result.code).toBe(0);
        expect(after.subarray(0, 3)).toEqual(Buffer.from('\uFEFF'));
        if (kind === 'closed')
          expect(after.subarray(0, document.length)).toEqual(document);
        expect(
          after.includes(
            Buffer.from(
              source
                .toString('latin1')
                .replace(/^\xEF\xBB\xBF/, '')
                .replace(/\r\n/g, '\n'),
              'latin1',
            ),
          ),
        ).toBe(true);
        const second = await runSurface(mode, root, targets, flags);
        expect(second.code).toBe(0);
        expect(
          second.model.units[0].plan.actions.every(
            (action) => action.kind === 'skip-uptodate',
          ),
        ).toBe(true);
        expect(readFileSync(path)).toEqual(after);
      }
      outcomes.push(result);
    }
    expect(outcomes[1]).toEqual(outcomes[0]);
    expect(outcomes[2]).toEqual(outcomes[0]);
  },
);
