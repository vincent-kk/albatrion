import { afterEach, expect, it, vi } from 'vitest';

import type { DispatchTestNode } from '../../__tests__/fixtures/createDispatchTree';
import type { BlueprintSchema } from '../../blueprint';
import { dispatchSetValue } from '../../write';
import type { SettlementContext } from '../types/settlement';
import { getDependencyIndex } from '../utils/dependencies/getDependencyIndex';
import { gateWheelEvaluation } from '../utils/gates/gateWheelEvaluation';
import * as settlement from '../utils/settlement/createSettlementContext';
import { getDispatchNode } from './fixtures/getDispatchNode';
import { mountPresenceTree } from './helpers/mountPresenceTree';
import { observePresenceTree } from './helpers/observePresenceTree';

const previousMode = gateWheelEvaluation.mode;
afterEach(() => {
  vi.restoreAllMocks();
  gateWheelEvaluation.mode = previousMode;
});

it.each(['record', 'skip', 'shadow'] as const)(
  '%s: six registration scenes keep evaluation and lookup work linear',
  (mode) => {
    let latest: SettlementContext<DispatchTestNode> | undefined;
    let computes = 0;
    const create = settlement.createSettlementContext;
    vi.spyOn(settlement, 'createSettlementContext').mockImplementation(
      (...args) => {
        const context = create(...args);
        latest = context as SettlementContext<DispatchTestNode>;
        computes = 0;
        const starts = new Map();
        vi.spyOn(starts, 'set').mockImplementation((node, stamp) => {
          computes++;
          return Map.prototype.set.call(starts, node, stamp);
        });
        context.presenceComputeStarts = starts;
        return context;
      },
    );
    for (const kind of ['gated', 'fixed', 'whole'] as const) {
      const totals: { mount: number; write: number }[] = [];
      for (const count of [250, 1_000]) {
        gateWheelEvaluation.mode = mode;
        const items = Array.from({ length: count }, (_, index) => ({
          id: `id-${index}`,
          name: `name-${index}`,
          active: index % 2 === 0,
        }));
        const schema: BlueprintSchema = {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              default: items,
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: {
                    type: 'string',
                    controls: {
                      active:
                        kind === 'gated'
                          ? '../active === true'
                          : kind === 'fixed'
                            ? '../../0/active === true'
                            : '(../../)?.[0]?.active === true',
                    },
                  },
                  active: { type: 'boolean' },
                },
              },
            },
          },
        };
        const root = mountPresenceTree(schema);
        const mount = latest?.presenceMetrics
          ? [...latest.presenceMetrics.computes.values()].reduce(
              (a, b) => a + b,
              0,
            )
          : computes;
        expect.soft(mount).toBeGreaterThan(0);
        if (kind === 'gated')
          expect.soft(mount).toBeLessThanOrEqual(3.5 * count + 5);
        if (kind === 'fixed')
          expect.soft(mount).toBeLessThanOrEqual(6 * count + 5);
        expect(latest?.presenceMetrics?.indexLookups ?? 0).toBe(0);
        expect
          .soft(latest?.presenceLog?.length ?? 0)
          .toBe(latest?.changedPresence?.size ?? 0);
        const index = getDependencyIndex(root.runtime.blueprint);
        const lookup = vi.spyOn(
          index as unknown as {
            collectPresenceOwners: (...args: unknown[]) => void;
          },
          'collectPresenceOwners',
        );
        dispatchSetValue(getDispatchNode(root, 'items', '0', 'active'), false);
        const write = lookup.mock.calls.length;
        lookup.mockRestore();
        if (kind === 'fixed') expect.soft(write).toBeLessThanOrEqual(count);
        expect(latest?.presenceMetrics?.indexLookups ?? 0).toBe(0);
        expect
          .soft(latest?.presenceLog?.length ?? 0)
          .toBe(latest?.changedPresence?.size ?? 0);
        expect(observePresenceTree(root)).toEqual(
          observePresenceTree(
            mountPresenceTree(schema, {
              items: items.map((item, index) =>
                index === 0 ? { ...item, active: false } : item,
              ),
            }),
          ),
        );
        totals.push({ mount, write });
      }
      expect.soft(totals[1].mount).toBeLessThanOrEqual(4 * totals[0].mount);
      expect.soft(totals[1].write).toBeLessThanOrEqual(4 * totals[0].write);
    }
  },
  60_000,
);
