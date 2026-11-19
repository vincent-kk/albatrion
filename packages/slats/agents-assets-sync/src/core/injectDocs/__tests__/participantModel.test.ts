import { expect, it } from 'vitest';

import { resolveAgentTarget } from '../../agentTarget/index.js';
import { mergePlans } from '../utils/session/mergePlans.js';
import type { RunUnit } from '../utils/session/types.js';

it('matches a complete-knowledge deletion model for 4000 seeded participant sets', () => {
  let seed = 0x51a75;
  for (let sequence = 0; sequence < 4000; sequence++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const initialSeed = seed;
    const count = 1 + ((seed >>> 8) % 3);
    const failed = (seed >>> 16) % (count + 1);
    const force = !!(seed & 1);
    const agent = (['claude', 'codex', 'agents'] as const)[(seed >>> 4) % 3];
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
                  relPath: 'skills/shared/installed.md',
                  target: { kind: 'file', dstAbs: destination },
                },
              ],
      },
    }));
    const discoverFailure = sequence % 5 === 0;
    const result = mergePlans(
      units,
      discoverFailure ? ['discover: injected participant failure'] : [],
    );
    const actual = result
      .flatMap((unit) => unit.plan.actions)
      .filter(
        (action) => action.kind === 'delete' || action.kind === 'warn-orphan',
      );
    const reference =
      failed < count || discoverFailure
        ? []
        : units.flatMap((unit) => unit.plan.actions);
    expect(actual, `seed=${initialSeed}, sequence=${sequence}`).toEqual(
      reference,
    );
  }
});
