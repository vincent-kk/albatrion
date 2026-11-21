import { join } from 'node:path';

import { afterEach, expect, it, vi } from 'vitest';

import type * as core from '../../core/index.js';
import type { DefaultFlags } from '../../types/index.js';
import {
  consumerOf,
  installPackage,
  makeRoot,
  removeRoot,
  writeAt,
} from '../roundThree/fixture.js';
import { readWrittenFiles as written } from './helpers/readWrittenFiles.js';
import { runSurface as surface } from './helpers/runSurface.js';

const roots: string[] = [];
afterEach(() => {
  vi.restoreAllMocks();
  roots.splice(0).forEach(removeRoot);
});

/** Exercise the same application request through each output mode twice. */
async function compare(
  kind: string,
  overrides: Partial<DefaultFlags> = {},
  interactive = false,
) {
  const outcomes = [];
  for (const mode of ['plain', 'json', 'ink'] as const) {
    const root = makeRoot('r4-model');
    roots.push(root);
    const names = [
      'shared',
      'conflict',
      'later-single',
      'comma',
      'repeated',
      'scope-alias',
    ].includes(kind)
      ? ['a', 'b']
      : ['a'];
    const targets = names.map((name) =>
      consumerOf(
        installPackage(root, {
          name: `@probe/${name}`,
          assets: {
            [kind === 'conflict'
              ? 'skills/shared/SKILL.md'
              : `skills/shared/${name}.md`]: name,
          },
          ...(kind === 'broken' ? { manifestText: '{' } : {}),
        }),
        `@probe/${name}`,
        kind === 'broken' ? 'manifest' : 'directory',
      ),
    );
    if (kind === 'diverged')
      writeAt(join(root, '.claude/skills/shared/a.md'), 'user');
    if (kind === 'orphan')
      writeAt(join(root, '.claude/skills/shared/old.md'), 'orphan');
    const flags: DefaultFlags = {
      agent: ['claude'],
      scope: 'project',
      yes: true,
      interactive: true,
      ...overrides,
    };
    const inputFlags =
      mode === 'ink' && interactive
        ? { ...flags, agent: undefined, scope: undefined, yes: false }
        : flags;
    if (kind === 'later-single') await surface(mode, root, targets, flags);
    const selected =
      kind === 'empty'
        ? []
        : kind === 'later-single'
          ? targets.slice(0, 1)
          : targets;
    const packageArgs =
      kind === 'comma'
        ? ['--package=@probe/a,@probe/b']
        : kind === 'repeated'
          ? ['--package=@probe/a', '--package=@probe/b']
          : kind === 'scope-alias'
            ? ['--package=@probe']
            : undefined;
    const beforeFiles = written(root);
    const first = await surface(
      mode,
      root,
      selected,
      inputFlags,
      interactive,
      packageArgs,
    );
    if (overrides.dryRun) {
      expect(first.files).toEqual(beforeFiles);
      await surface(mode, root, selected, {
        ...flags,
        dryRun: false,
        force: true,
        yes: true,
      });
    }
    const second = await surface(
      mode,
      root,
      selected,
      inputFlags,
      interactive,
      packageArgs,
    );
    outcomes.push({ first, second });
    if (kind === 'later-single') {
      expect(first.code).toBe(0);
      expect(first.files['.claude/skills/shared/a.md']).toBeDefined();
      expect(first.files['.claude/skills/shared/b.md']).toBeUndefined();
    } else if (kind === 'conflict') {
      expect(first.code).toBe(1);
      expect(Object.keys(first.files)).toEqual([]);
    } else if (kind === 'overlap') {
      expect(
        first.model.units.filter(
          (unit: core.RunUnit) => unit.plan.actions.length,
        ),
      ).toHaveLength(1);
      expect(first.model.units[1].aliasOf).toBe(first.model.units[0].key);
    }
    if (second.code === 0) {
      expect(
        second.model.units
          .flatMap((unit: core.RunUnit) => unit.plan.actions)
          .every(
            (action: core.Action) =>
              action.kind === 'skip-uptodate' ||
              action.kind === 'skip-unsupported',
          ),
      ).toBe(true);
    }
  }
  expect(outcomes[1]).toEqual(outcomes[0]);
  expect(outcomes[2]).toEqual(outcomes[0]);
}

it.each([
  ['shared', {}],
  ['conflict', {}],
  ['overlap', { agent: ['codex', 'agents'] }],
  ['overlap', { agent: ['agents', 'codex'] }],
  ['shared', { agent: ['claude', 'claude'] }],
  ['shared', { asset: ['skills', 'skills'] }],
  ['shared', { agent: ['claude', 'codex'] }],
  ['shared', { force: true }],
  ['later-single', { force: true }],
  ['comma', {}],
  ['repeated', {}],
  ['scope-alias', {}],
  ['diverged', { force: true }],
  ['diverged', {}],
  ['diverged', { dryRun: true }],
  ['orphan', { force: true }],
  ['broken', {}],
  ['empty', { agent: ['codx'] }],
  ['empty', { asset: ['rule'] }],
  ['empty', { scope: 'bad' }],
] satisfies [string, Partial<DefaultFlags>][])(
  'same plans, files, exit and settled rerun: %s %j',
  compare,
);

it.each(['shared', 'diverged'])(
  'interactive choices equal explicit flags: %s',
  (kind) => compare(kind, { force: true }, true),
);
