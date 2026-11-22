import { expect, it } from 'vitest';

import { resolveAgentTarget } from '../../agentTarget/index.js';
import { mergePlans } from '../utils/session/mergePlans.js';
import type { RunUnit } from '../utils/session/types.js';

/** Construct a participant with one comparable file destination.
 * @param name Distinct package owner.
 * @param hash Bytes claimed by that owner.
 * @returns A prepared plan with a shared physical destination.
 */
function unit(name: string, hash: string): RunUnit {
  return {
    key: `claude:${name}`,
    target: {
      name,
      version: '1',
      packageRoot: '/tmp/package',
      assetRoot: '/tmp/package/docs',
      assetPath: 'docs',
      hashesPresent: true,
      hashSource: 'manifest',
    },
    agentTarget: resolveAgentTarget('claude', 'project', '/tmp/merge-model'),
    plan: {
      requiresForce: false,
      actions: [
        {
          kind: 'copy',
          relPath: 'skills/shared/a.md',
          sourceHash: hash,
          target: {
            kind: 'file',
            dstAbs: '/tmp/merge-model/.claude/skills/shared/a.md',
          },
        },
      ],
    },
  };
}

it('identical owners share one write while distinct bytes refuse both owners', async () => {
  const first = unit('first', 'a');
  const same = await mergePlans([first, unit('second', 'a')]);
  const different = await mergePlans([first, unit('second', 'b')]);
  expect(
    same
      .flatMap((entry) => entry.plan.actions)
      .filter((action) => action.kind === 'copy'),
  ).toHaveLength(1);
  expect(different.every((entry) => entry.error?.includes('Conflicting'))).toBe(
    true,
  );
});

it('discovery uncertainty suppresses deletion as a notice without force confirmation', async () => {
  const first = unit('first', 'a');
  const units = [
    {
      ...first,
      plan: {
        requiresForce: true,
        actions: first.plan.actions.map((action) => ({
          ...action,
          kind: 'delete' as const,
        })),
      },
    },
  ];
  const result = await mergePlans(units, ['broken package.json: participant second']);
  expect(result[0].plan).toEqual({ actions: [], requiresForce: false });
  expect(result[0].notices).toEqual([
    expect.objectContaining({ reason: expect.stringContaining('second') }),
  ]);
  expect(result[0].error).toBeUndefined();
});

it('unknown discovery ownership protects orphan blocks as well as directory entries', async () => {
  const first = unit('first', 'a');
  const result = await mergePlans(
    [
      {
        ...first,
        plan: {
          requiresForce: true,
          actions: [
            {
              kind: 'delete',
              relPath: 'rules/retired.md',
              target: {
                kind: 'block',
                fileAbs: '/tmp/merge-model/AGENTS.md',
                blockId: 'first:rules/retired.md',
              },
            },
          ],
        },
      },
    ],
    ['unknown participant: broken package.json'],
  );
  expect(result[0].plan).toEqual({ actions: [], requiresForce: false });
  expect(result[0].notices).toEqual([
    expect.objectContaining({
      path: '/tmp/merge-model/AGENTS.md',
      reason: expect.stringContaining('unknown participant'),
    }),
  ]);
});
