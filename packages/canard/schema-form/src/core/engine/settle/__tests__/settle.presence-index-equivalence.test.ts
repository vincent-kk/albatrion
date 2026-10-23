import { afterEach, expect, it, vi } from 'vitest';

import type { BlueprintSchema } from '../../blueprint';
import { dispatchContextChange } from '../../write';
import { gateWheelEvaluation } from '../utils/gates/gateWheelEvaluation';
import { getGateRegistry } from '../utils/gates/getGateRegistry';
import { mountPresenceTree } from './helpers/mountPresenceTree';
import { observePresenceTree } from './helpers/observePresenceTree';

const previousMode = gateWheelEvaluation.mode;
afterEach(() => {
  vi.restoreAllMocks();
  gateWheelEvaluation.mode = previousMode;
});

const scenes: { label: string; schema: BlueprintSchema; value: unknown }[] = [
  {
    label: 'M10 new occurrence after a false location query',
    schema: {
      type: 'object',
      properties: {
        q: { type: 'string', controls: { active: '../other === 1' } },
        other: { type: 'number' },
        side: {
          type: 'object',
          properties: {
            x: { type: 'string', controls: { active: '(@).on === true' } },
          },
        },
        p: {
          type: 'object',
          properties: {
            n: {
              type: 'object',
              controls: { active: '(@).on === true' },
              properties: {
                z: {
                  type: 'string',
                  controls: { active: "../../../side/x === 'v'" },
                },
              },
            },
          },
        },
      },
    },
    value: { q: 'Q', other: 1, side: { x: 'v' }, p: { n: { z: 'Z' } } },
  },
  {
    label: 'M11 strict prefix of a relocated watched path',
    schema: {
      type: 'object',
      properties: {
        q: { type: 'string', controls: { active: '../other === 1' } },
        other: { type: 'number' },
        a: {
          type: 'object',
          properties: {
            y: { type: 'string', controls: { active: '(@).on === true' } },
          },
        },
        g: {
          type: 'object',
          properties: {
            side: {
              type: 'object',
              controls: { active: '(@).on === true' },
              properties: {
                x: { type: 'string' },
              },
            },
          },
        },
        h: {
          type: 'object',
          properties: {
            r: {
              type: 'string',
              controls: { active: "../../g/side/x === 'v'" },
            },
          },
        },
      },
    },
    value: {
      q: 'Q',
      other: 1,
      a: { y: 'Y' },
      g: { side: { x: 'v' } },
      h: { r: 'R' },
    },
  },
];

for (const scene of scenes)
  for (const mode of ['record', 'skip', 'shadow'] as const)
    for (const start of [false, true])
      it(`${scene.label}: ${mode}, start=${start}`, () => {
        gateWheelEvaluation.mode = mode;
        const root = mountPresenceTree(scene.schema, scene.value, {
          on: start,
        });
        const registry = getGateRegistry(root.runtime);
        const query = registry.mayPresenceChangeAt;
        for (const on of [!start, start]) {
          let comparisons = 0;
          let mismatches = 0;
          const spy = vi
            .spyOn(registry, 'mayPresenceChangeAt')
            .mockImplementation((...args) => {
              const answer = query.apply(registry, args);
              comparisons++;
              if (answer !== registry.mayChangeAt(args[0], args[1], args[2]))
                mismatches++;
              return answer;
            });
          dispatchContextChange(root, { on });
          spy.mockRestore();
          expect(comparisons).toBeGreaterThan(0);
          expect(mismatches).toBe(0);
          expect(observePresenceTree(root)).toEqual(
            observePresenceTree(
              mountPresenceTree(scene.schema, scene.value, { on }),
            ),
          );
        }
      });
