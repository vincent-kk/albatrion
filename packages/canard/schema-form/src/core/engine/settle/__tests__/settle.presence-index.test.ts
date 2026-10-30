import { afterEach, expect, it, vi } from 'vitest';

import type { DispatchTestNode } from '../../__tests__/fixtures/createDispatchTree';
import type { BlueprintSchema } from '../../blueprint';
import { engineModes } from '../../utils/cache/engineModes';
import { dispatchSetValue } from '../../write';
import type { SettlementContext } from '../types/settlement';
import { getGateRegistry } from '../utils/gates/getGateRegistry';
import * as settlement from '../utils/settlement/createSettlementContext';
import { getDispatchNode } from './fixtures/getDispatchNode';
import { mountPresenceTree } from './helpers/mountPresenceTree';
import { observePresenceTree } from './helpers/observePresenceTree';

const previousMode = engineModes.gateWheel;
afterEach(() => {
  vi.restoreAllMocks();
  engineModes.setMode('gateWheel', previousMode);
});

it.each(['record', 'skip', 'shadow'] as const)(
  '%s: presence location lookups scale with changed paths',
  (mode) => {
    let latest: SettlementContext<DispatchTestNode> | undefined;
    const create = settlement.createSettlementContext;
    vi.spyOn(settlement, 'createSettlementContext').mockImplementation(
      (...args) => {
        const context = create(...args);
        latest = context as SettlementContext<DispatchTestNode>;
        return context;
      },
    );
    const totals: number[] = [];
    for (const count of [250, 1_000]) {
      engineModes.setMode('gateWheel', mode);
      const schema: BlueprintSchema = {
        type: 'object',
        properties: {
          mode: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                active: { type: 'boolean' },
                name: {
                  type: 'string',
                  controls: { active: '../../0/active === true' },
                },
                c: {
                  type: 'string',
                  controls: { active: '../../../mode === "on"' },
                },
              },
            },
          },
        },
      };
      const value = {
        mode: 'on',
        items: Array.from({ length: count }, () => ({
          active: true,
          name: 'N',
          c: 'C',
        })),
      };
      const root = mountPresenceTree(schema, value);
      const registry = getGateRegistry(root.runtime);
      const query = registry.mayPresenceChangeAt;
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
      for (const modeValue of ['off', 'on']) {
        dispatchSetValue(getDispatchNode(root, 'mode'), modeValue);
        const lookups = latest?.presenceMetrics?.indexLookups;
        if (mode === 'record') {
          expect(lookups).toBeGreaterThan(0);
          if (modeValue === 'off') totals.push(lookups ?? 0);
        }
        expect(latest?.presenceLog?.length).toBe(latest?.changedPresence?.size);
        expect(observePresenceTree(root)).toEqual(
          observePresenceTree(
            mountPresenceTree(schema, { ...value, mode: modeValue }),
          ),
        );
      }
      expect(comparisons).toBeGreaterThan(0);
      expect(mismatches).toBe(0);
      spy.mockRestore();
    }
    if (mode === 'record')
      expect(totals[1]).toBeLessThanOrEqual(4.2 * totals[0]);
  },
  60_000,
);

it('compacts relocated watch records during 500 distinct item registrations', () => {
  const schema: BlueprintSchema = {
    type: 'object',
    properties: {
      mode: { type: 'string' },
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            active: { type: 'boolean' },
            name: {
              type: 'string',
              controls: {
                active: '../active === true && ../../../mode === "on"',
              },
            },
          },
        },
      },
    },
  };
  const root = mountPresenceTree(schema, {
    mode: 'on',
    items: [{ active: true, name: 'N' }],
  });
  const registry = getGateRegistry(root.runtime);
  const source = getDispatchNode(root, 'items', '0', 'name');
  const changed = new Set(['/unrelated']);
  const prefixes = new Set(['']);
  const cursor = { changed: 0, prefixes: 0, index: 0 };
  registry.mayPresenceChangeAt(
    '',
    changed,
    prefixes,
    [...changed],
    [...prefixes],
    cursor,
  );
  for (let index = 1; index <= 500; index++) {
    const item = { ...source, path: `/items/${index}/name` };
    registry.register(item);
    const indexes = Reflect.get(registry, 'watchIndex') as Map<
      string,
      { log: string[] }
    >;
    expect(indexes.get('')?.log.length).toBeLessThanOrEqual(15);
    expect(
      registry.mayPresenceChangeAt(
        '',
        changed,
        prefixes,
        [...changed],
        [...prefixes],
        cursor,
      ),
    ).toBe(registry.mayChangeAt('', changed, prefixes));
    registry.remove(item);
  }
});
