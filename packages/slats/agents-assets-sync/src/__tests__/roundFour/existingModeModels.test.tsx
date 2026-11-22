import { join } from 'node:path';

import { afterEach, expect, it, vi } from 'vitest';

import type * as core from '../../core/index.js';
import type { ConsumerPackage, DefaultFlags } from '../../types/index.js';
import {
  consumerOf,
  installPackage,
  makeRoot,
  removeRoot,
  sha256,
  writeAt,
} from '../roundThree/fixture.js';
import { readWrittenFiles as written } from './helpers/readWrittenFiles.js';
import { runSurface } from './helpers/runSurface.js';

const faults = vi.hoisted(() => ({ kind: '' }));
vi.mock('../../core/injectDocs/utils/applyAction.js', async (load) => {
  const actual =
    await load<typeof import('../../core/injectDocs/utils/applyAction.js')>();
  return {
    applyAction: async (...args: Parameters<typeof actual.applyAction>) => {
      if (
        (faults.kind === 'copy' && args[0].kind === 'copy') ||
        (faults.kind === 'delete' && args[0].kind === 'delete')
      )
        throw new Error('injected IO failure');
      return actual.applyAction(...args);
    },
  };
});

const roots: string[] = [];
afterEach(() => {
  roots.splice(0).forEach(removeRoot);
  vi.restoreAllMocks();
  faults.kind = '';
});

/** Builds equivalent independent inputs for every renderer. */
function setup(kind: string, root: string): ConsumerPackage[] {
  const names = kind === 'mixed' ? ['good', 'blocked', 'partial'] : [kind];
  return names.map((name) => {
    const packageRoot = installPackage(root, {
      name: `@probe/${name}`,
      assets: { [`skills/${name}/SKILL.md`]: '# shipped\n' },
      ...(name === 'partial' ? { manifestText: '{' } : {}),
      ...(name === 'stale'
        ? { manifest: { 'skills/stale/SKILL.md': sha256('# old\n') } }
        : {}),
    });
    if (name === 'blocked')
      writeAt(join(root, `.claude/skills/${name}/SKILL.md`), '# user edit\n');
    if (name === 'delete')
      writeAt(join(root, `.claude/skills/${name}/old.md`), '# orphan\n');
    return consumerOf(
      packageRoot,
      `@probe/${name}`,
      name === 'partial' || name === 'stale' ? 'manifest' : 'directory',
    );
  });
}

it.each([
  ['good', false],
  ['good', true],
  ['blocked', false],
  ['blocked', true],
  ['partial', false],
  ['partial', true],
  ['copy', false],
  ['copy', true],
  ['delete', false],
  ['delete', true],
  ['mixed', false],
  ['mixed', true],
  ['stale', false],
  ['stale', true],
  ['blocked', false, true],
  ['blocked', true, true],
  ['partial', false, true],
  ['partial', true, true],
] as const)(
  'all existing output-mode scenarios share the full model: %s force=%s dryRun=%s',
  async (kind, force, dryRun: boolean = false) => {
    const outcomes = [];
    for (const mode of ['plain', 'json', 'ink'] as const) {
      const root = makeRoot('r4-existing-model');
      roots.push(root);
      const targets = setup(kind, root);
      const flags: DefaultFlags = {
        agent: ['claude'],
        scope: 'project',
        force,
        dryRun,
        yes: true,
        interactive: true,
      };
      faults.kind = kind;
      const beforeFiles = written(root);
      const first = await runSurface(mode, root, targets, flags);
      if (dryRun) expect(first.files).toEqual(beforeFiles);
      faults.kind = '';
      await runSurface(mode, root, targets, {
        ...flags,
        dryRun: false,
        force: true,
      });
      const second = await runSurface(mode, root, targets, flags);
      for (const unit of second.model.units) {
        if (unit.error) continue;
        expect(
          unit.plan.actions.every(
            (action: core.Action) =>
              action.kind === 'skip-uptodate' ||
              action.kind === 'skip-unsupported',
          ),
        ).toBe(true);
      }
      outcomes.push({ first, second });
    }
    expect(outcomes[1]).toEqual(outcomes[0]);
    expect(outcomes[2]).toEqual(outcomes[0]);
  },
);

it.each([
  { asset: ['rule'] },
  { agent: ['codx'] },
  { agent: ['claude', 'codx'] },
  { scope: 'bad' },
] satisfies Partial<DefaultFlags>[])(
  'existing flag failures share the full model: %j',
  async (overrides) => {
    const outcomes = [];
    for (const mode of ['plain', 'json', 'ink'] as const) {
      const root = makeRoot('r4-existing-flags');
      roots.push(root);
      const targets = setup('good', root);
      const flags: DefaultFlags = {
        agent: ['claude'],
        scope: 'project',
        yes: true,
        interactive: true,
        ...overrides,
      };
      const first = await runSurface(mode, root, targets, flags);
      const second = await runSurface(mode, root, targets, flags);
      expect(first.code).toBe(2);
      expect(first.files).toEqual({});
      expect(second).toEqual(first);
      outcomes.push(first);
    }
    expect(outcomes[1]).toEqual(outcomes[0]);
    expect(outcomes[2]).toEqual(outcomes[0]);
  },
);
