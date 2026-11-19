import { join } from 'node:path';

import { afterEach, expect, it, vi } from 'vitest';

import {
  consumerOf,
  installPackage,
  makeRoot,
  removeRoot,
  writeAt,
} from '../roundThree/fixture.js';
import { readWrittenFiles } from './helpers/readWrittenFiles.js';
import { runSurface } from './helpers/runSurface.js';

let root: string | undefined;
const extraRoots: string[] = [];
afterEach(() => {
  if (root) removeRoot(root);
  extraRoots.splice(0).forEach(removeRoot);
  vi.restoreAllMocks();
});

it('keeps the documented exit-2 cancellation and reports no writes after declining force', async () => {
  const fixtureRoot = makeRoot('force-cancel');
  root = fixtureRoot;
  const targets = ['changed', 'clean'].map((name) =>
    consumerOf(
      installPackage(fixtureRoot, {
        name: `@probe/${name}`,
        assets: { [`skills/${name}/SKILL.md`]: '# shipped\n' },
      }),
      `@probe/${name}`,
      'directory',
    ),
  );
  writeAt(join(root, '.claude/skills/changed/SKILL.md'), '# user\n');
  writeAt(join(root, '.claude/skills/changed/orphan.md'), '# keep\n');
  const before = readWrittenFiles(root);
  const result = await runSurface(
    'ink',
    root,
    targets,
    {
      agent: ['claude'],
      scope: 'project',
      force: true,
      yes: false,
      interactive: true,
    },
    'decline',
  );
  expect(result.code).toBe(2);
  expect(result.files).toEqual(before);
  for (const unit of result.model.units) {
    expect(unit.report?.created).toEqual([]);
    expect(unit.report?.updated).toEqual([]);
    expect(unit.report?.deleted).toEqual([]);
  }
});

it.each(['plain', 'json', 'ink'] as const)(
  'does not report clean copies from a force-blocked unit: %s',
  async (mode) => {
    const fixtureRoot = makeRoot('blocked-report');
    extraRoots.push(fixtureRoot);
    const target = consumerOf(
      installPackage(fixtureRoot, {
        name: '@probe/blocked',
        assets: {
          'skills/changed/SKILL.md': '# shipped\n',
          'skills/new/SKILL.md': '# new\n',
        },
      }),
      '@probe/blocked',
      'directory',
    );
    writeAt(join(fixtureRoot, '.claude/skills/changed/SKILL.md'), '# user\n');
    const before = readWrittenFiles(fixtureRoot);
    const result = await runSurface(mode, fixtureRoot, [target], {
      agent: ['claude'],
      scope: 'project',
      yes: true,
    });
    expect(result.code).toBe(2);
    expect(result.files).toEqual(before);
    expect(result.model.units[0].report?.created).toEqual([]);
    expect(
      result.model.units[0].plan.actions.some(
        (action) => action.kind === 'copy',
      ),
    ).toBe(true);
  },
);

it.each([false, true])(
  'does not report orphan deletions from conflicting units, dryRun=%s',
  async (dryRun) => {
    const outcomes = [];
    for (const mode of ['plain', 'json', 'ink'] as const) {
      const fixtureRoot = makeRoot('conflict-report');
      extraRoots.push(fixtureRoot);
      const targets = ['a', 'b'].map((name) =>
        consumerOf(
          installPackage(fixtureRoot, {
            name: `@probe/${name}`,
            assets: { 'skills/shared/SKILL.md': name },
          }),
          `@probe/${name}`,
          'directory',
        ),
      );
      writeAt(join(fixtureRoot, '.claude/skills/shared/orphan.md'), '# keep\n');
      const before = readWrittenFiles(fixtureRoot);
      const result = await runSurface(mode, fixtureRoot, targets, {
        agent: ['claude'],
        scope: 'project',
        force: true,
        yes: true,
        dryRun,
      });
      expect(result.code).toBe(1);
      expect(result.files).toEqual(before);
      for (const unit of result.model.units) {
        expect(unit.report?.created).toEqual([]);
        expect(unit.report?.deleted).toEqual([]);
        expect(
          unit.plan.actions.some((action) => action.kind === 'delete'),
        ).toBe(true);
      }
      outcomes.push(result);
    }
    expect(outcomes[1]).toEqual(outcomes[0]);
    expect(outcomes[2]).toEqual(outcomes[0]);
  },
);
