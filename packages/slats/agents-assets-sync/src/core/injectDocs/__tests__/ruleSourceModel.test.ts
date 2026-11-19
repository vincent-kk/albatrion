import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, it } from 'vitest';

import {
  consumerOf,
  installPackage,
  makeRoot,
  removeRoot,
  writeAt,
} from '../../../__tests__/roundThree/fixture.js';
import { normalizeModel } from '../../markerBlock/__tests__/helpers/normalizeModel.js';
import { readModelBlocks } from '../../markerBlock/__tests__/helpers/readModelBlocks.js';
import { runInjection } from '../utils/session/runInjection.js';

/** Seeded source model: file headers and embedded fragments have separate contexts. */
it('uses one checked snapshot across source contexts and agent orders (seed 0x51a9e)', async () => {
  let seed = 0x51a9e;
  const next = (size: number) => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return (seed >>> 8) % size;
  };
  const orders = [
    ['claude'],
    ['codex'],
    ['agents'],
    ['claude', 'codex'],
    ['codex', 'claude'],
    ['agents', 'claude'],
    ['claude', 'agents', 'codex'],
  ];
  const marker = '<!-- AGENTS-ASSETS-SYNC:START:example -->';
  for (let sequence = 0; sequence < 2000; sequence++) {
    const state = seed;
    const root = makeRoot('source-model');
    try {
      const agents = orders[next(orders.length)];
      const marks = next(4);
      const kind = next(6);
      const eol = ['\n', '\r\n', '\r'][next(3)];
      const fence = (next(2) ? '~' : '`').repeat(3 + next(6));
      const bodies = [
        'plain',
        `${fence}\n${marker}\n${fence}\n`,
        '<!--\nprose\n-->\n',
        `<!--\n${marker}\n-->\n`,
        `${marker}\nbody\n<!-- AGENTS-ASSETS-SYNC:END:example -->\n`,
        `prose\n${fence}\ncode\n${fence}`,
      ];
      const text =
        '\uFEFF'.repeat(marks) + bodies[kind] + (next(2) ? '\n' : '');
      const original = Buffer.from(text.replace(/\n/g, eol));
      const normalized = normalizeModel(text);
      const rawSafe = kind === 0 || kind === 2 || kind === 5 || marks <= 1;
      const blockSafe = rawSafe && kind !== 4;
      const mutate = Boolean(next(2));
      const force = Boolean(next(2));
      const hashSource = next(2) ? 'manifest' : 'directory';
      const packageRoot = installPackage(root, {
        name: '@probe/a',
        assets: { 'rules/a.md': original },
        manifest: true,
      });
      const source = join(packageRoot, 'docs/agents/rules/a.md');
      const file = join(root, '.claude/rules/a.md');
      const document = join(root, 'AGENTS.md');
      writeAt(document, '# user\n');
      const run = () =>
        runInjection({
          targets: [consumerOf(packageRoot, '@probe/a', hashSource)],
          flags: { agent: agents, scope: 'project', force, yes: true },
          originCwd: root,
          onPlan: () => {
            if (mutate) writeFileSync(source, '~~~\nunchecked');
          },
        });
      const first = await run();
      expect(first.exitCode).toBe(
        agents.every((agent) => (agent === 'claude' ? rawSafe : blockSafe))
          ? 0
          : 1,
      );
      for (const unit of first.units.filter((unit) => !unit.aliasOf))
        expect(Boolean(unit.error)).toBe(
          !(unit.agentTarget.agent === 'claude' ? rawSafe : blockSafe),
        );
      expect(existsSync(file)).toBe(agents.includes('claude') && rawSafe);
      if (existsSync(file)) expect(readFileSync(file)).toEqual(original);
      if (agents.some((agent) => agent !== 'claude') && blockSafe)
        expect(
          readModelBlocks(readFileSync(document, 'latin1')).find(
            (block) => block.blockId === '@probe/a:rules/a.md',
          )?.body,
        ).toBe(
          Buffer.from(
            normalized + (normalized.endsWith('\n') ? '' : '\n'),
          ).toString('latin1'),
        );
      else expect(readFileSync(document, 'utf8')).toBe('# user\n');
      const before = readFileSync(document);
      writeFileSync(source, original);
      const second = await run();
      expect(second.exitCode).toBe(first.exitCode);
      expect(readFileSync(document)).toEqual(before);
      if (existsSync(file)) expect(readFileSync(file)).toEqual(original);
      expect(
        second.units.every(
          (unit) =>
            !unit.plan.actions.some((action) =>
              ['copy', 'warn-diverged', 'delete'].includes(action.kind),
            ),
        ),
      ).toBe(true);
    } catch (error) {
      throw new Error(
        `seed=0x51a9e sequence=${sequence} state=${state}: ${String(error)}`,
      );
    } finally {
      removeRoot(root);
    }
  }
}, 120000);
