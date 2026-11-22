import { expect, it } from 'vitest';

import { resolveAgentTarget } from '../../agentTarget/index.js';
import { mergePlans } from '../utils/session/mergePlans.js';
import type { RunUnit } from '../utils/session/types.js';

it('matches a complete-knowledge deletion model for 4000 seeded participant sets', async () => {
  let seed = 0x51a75;
  for (let sequence = 0; sequence < 4000; sequence++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const initialSeed = seed;
    const count = 1 + ((seed >>> 8) % 3);
    const failed = (seed >>> 16) % (count + 1);
    const force = !!(seed & 1);
    const agent = (['claude', 'codex', 'agents'] as const)[(seed >>> 4) % 3];
    const block = sequence % 7 === 0 && agent !== 'claude';
    const agentTarget = resolveAgentTarget(
      agent,
      'project',
      '/tmp/participant-model',
    );
    const destination = `${agentTarget.directoryRoots.skills}/shared/installed.md`;
    const units: RunUnit[] = Array.from({ length: count }, (_, index) => ({
      key: `claude:pkg-${index}`,
      target: {
        name: `pkg-${index}`,
        version: '1',
        packageRoot: '/tmp/package',
        assetRoot: '/tmp/package/docs',
        assetPath: 'docs',
        hashesPresent: true,
        hashSource: 'manifest',
      },
      agentTarget,
      ...(index === failed
        ? { error: `stage-${sequence % 4}: injected failure` }
        : {}),
      plan: {
        requiresForce: true,
        actions:
          index === failed
            ? []
            : [
                {
                  kind: force ? 'delete' : 'warn-orphan',
                  relPath: block
                    ? 'rules/retired.md'
                    : 'skills/shared/installed.md',
                  target: block
                    ? {
                        kind: 'block',
                        fileAbs: '/tmp/participant-model/AGENTS.md',
                        blockId: `pkg-${index}:rules/retired.md`,
                      }
                    : { kind: 'file', dstAbs: destination },
                },
              ],
      },
    }));
    const discoverFailure = sequence % 5 === 0;
    const result = await mergePlans(
      units,
      discoverFailure ? ['discover: injected participant failure'] : [],
    );
    const actual = result
      .flatMap((unit) => unit.plan.actions)
      .filter(
        (action) => action.kind === 'delete' || action.kind === 'warn-orphan',
      );
    const reference =
      (failed < count && !block) || discoverFailure
        ? []
        : units.flatMap((unit) => unit.plan.actions);
    expect(actual, `seed=${initialSeed}, sequence=${sequence}`).toEqual(
      reference,
    );
  }
});

it('matches independent pairwise source-conflict ownership for 2000 participant sets (seed 0xc0111de)', async () => {
  let seed = 0xc0111de;
  const observed = new Set<string>();
  for (let sequence = 0; sequence < 2000; sequence++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const initialSeed = seed;
    const force = !!(seed & 1);
    const agent = (['claude', 'codex', 'agents'] as const)[sequence % 3];
    const agentTarget = resolveAgentTarget(
      agent,
      'project',
      '/tmp/participant-conflicts',
    );
    const count = 2 + (sequence % 3);
    const units: RunUnit[] = Array.from({ length: count }, (_, index) => ({
      key: `${agent}:pkg-${index}`,
      target: {
        name: `pkg-${index}`,
        version: '1',
        packageRoot: `/tmp/pkg-${index}`,
        assetRoot: `/tmp/pkg-${index}/docs`,
        assetPath: 'docs',
        hashesPresent: true,
        hashSource: 'manifest',
      },
      agentTarget,
      plan: {
        requiresForce: !force,
        actions: [
          {
            kind: force ? 'copy' : 'warn-diverged',
            relPath: `skills/pkg-${index}/source.md`,
            sourceHash: (seed >>> (index + 3)) & 1 ? 'source-a' : 'source-b',
            target: {
              kind: 'file',
              dstAbs: `${agentTarget.directoryRoots.skills}/${index === count - 1 && sequence % 2 ? 'separate' : 'shared'}.md`,
            },
          },
        ],
      },
    }));
    if (sequence % 2) units.reverse();
    // The reference compares every pair, then elects the first agreeing owner.
    const conflict = units.map((unit) =>
      units.some(
        (peer) =>
          unit.plan.actions[0].target.kind === 'file' &&
          peer.plan.actions[0].target.kind === 'file' &&
          unit.plan.actions[0].target.dstAbs ===
            peer.plan.actions[0].target.dstAbs &&
          unit.plan.actions[0].sourceHash !== peer.plan.actions[0].sourceHash,
      ),
    );
    const result = await mergePlans(units);
    for (let index = 0; index < units.length; index++) {
      const unit = units[index];
      const action = unit.plan.actions[0];
      const destination =
        action.target.kind === 'file' ? action.target.dstAbs : '';
      const priorOwner = units
        .slice(0, index)
        .findIndex(
          (peer, prior) =>
            !conflict[prior] &&
            peer.plan.actions.some(
              (value) =>
                value.target.kind === 'file' &&
                value.target.dstAbs === destination,
            ),
        );
      const actual = result[index];
      const label = `seed=${initialSeed}, sequence=${sequence}, index=${index}, force=${force}`;
      observed.add(
        conflict[index] ? 'conflict' : priorOwner >= 0 ? 'alias' : 'owner',
      );
      expect(actual.refused, label).toBe(conflict[index]);
      expect(actual.plan.requiresForce, label).toBe(
        !conflict[index] && priorOwner < 0 && !force,
      );
      expect(actual.plan.actions, label).toEqual(
        conflict[index] || priorOwner < 0 ? unit.plan.actions : [],
      );
      if (conflict[index]) {
        expect(actual.failures, label).toEqual([
          {
            unitKey: unit.key,
            path: destination,
            stage: 'merge',
            reason: `Conflicting source contents: ${action.relPath}`,
          },
        ]);
        expect(actual.error, label).toBe(
          `Conflicting source contents: ${action.relPath}`,
        );
      } else {
        expect(actual.error, label).toBeUndefined();
        expect(actual.aliasOf, label).toBe(
          priorOwner >= 0 ? units[priorOwner].key : undefined,
        );
      }
    }
  }
  expect([...observed].sort()).toEqual(['alias', 'conflict', 'owner']);
});
