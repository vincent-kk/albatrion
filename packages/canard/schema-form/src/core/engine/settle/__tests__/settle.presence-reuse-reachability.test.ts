import { afterEach, expect, it, vi } from 'vitest';

import { pinSlotShipping } from '../../../__tests__/fixtures/pinSlotShipping';
import type { DispatchTestNode } from '../../__tests__/fixtures/createDispatchTree';
import { engineModes } from '../../utils/cache/engineModes';
import { dispatchInsert, dispatchPop, dispatchPush } from '../../write';
import type { SettlementContext } from '../types/settlement';
import * as reuse from '../utils/compute/childSelection/canReuseArrayChildren';
import * as registration from '../utils/dependencies/registerPresenceChanges';
import * as settlement from '../utils/settlement/createSettlementContext';
import { mountPresenceTree } from './helpers/mountPresenceTree';

afterEach(() => {
  vi.restoreAllMocks();
  engineModes.setMode('gateWheel', 'skip');
});

it.each(['append', 'pop', 'splice'] as const)(
  'M9 reachability: %s reuse excludes presence registration and evaluation clocks',
  (kind) => {
    const root = mountPresenceTree(
      {
        type: 'array',
        items: { type: 'object', properties: { n: { type: 'number' } } },
      },
      [{ n: 1 }, { n: 2 }],
    );
    let latest: SettlementContext<DispatchTestNode> | undefined;
    const create = settlement.createSettlementContext;
    vi.spyOn(settlement, 'createSettlementContext').mockImplementation(
      (...args) => {
        const context = create(...args);
        latest = context as SettlementContext<DispatchTestNode>;
        return context;
      },
    );
    const canReuse = reuse.canReuseArrayChildren;
    let admitted = 0;
    vi.spyOn(reuse, 'canReuseArrayChildren').mockImplementation((...args) => {
      const result = canReuse(...args);
      if (result) {
        admitted++;
        expect(args[1].hasGates).toBe(false);
        expect(
          args[1].arrayAppend?.valid ||
            args[1].arrayPop?.valid ||
            args[1].arraySplice?.valid,
        ).toBe(true);
      }
      return result;
    });
    const register = vi.spyOn(registration, 'registerPresenceChanges');
    if (kind === 'append') dispatchPush(root, { n: 3 });
    else if (kind === 'pop') dispatchPop(root);
    else dispatchInsert(root, 1, { n: 3 });
    expect(admitted).toBeGreaterThan(0);
    expect(register).not.toHaveBeenCalled();
    expect(latest?.hasGates).toBe(false);
    expect(latest?.presenceComputeStarts?.size ?? 0).toBe(0);
    expect(latest?.presenceRoundStarts?.size ?? 0).toBe(0);
    expect(latest?.presenceRegistrations ?? 0).toBe(0);
    expect(latest?.presenceHosts?.size ?? 0).toBe(0);
  },
);

it.each(['push', 'pop', 'insert'] as const)(
  'M9 exclusivity: gated-array %s counts presence calls and never reuses children',
  (kind) => {
    // Shipping presence-call counts exclude independent slot replay.
    pinSlotShipping();
    engineModes.setMode('gateWheel', 'record');
    let latest: SettlementContext<DispatchTestNode> | undefined;
    const create = settlement.createSettlementContext;
    vi.spyOn(settlement, 'createSettlementContext').mockImplementation(
      (...args) => {
        const context = create(...args);
        latest = context as SettlementContext<DispatchTestNode>;
        return context;
      },
    );
    const canReuse = vi.spyOn(reuse, 'canReuseArrayChildren');
    const register = vi.spyOn(registration, 'registerPresenceChanges');
    const root = mountPresenceTree(
      {
        type: 'array',
        items: {
          type: 'object',
          controls: { active: 'true' },
          properties: { n: { type: 'number' } },
        },
      },
      [{ n: 1 }, { n: 2 }],
    );
    expect(register).toHaveBeenCalled();
    expect(latest?.presenceMetrics?.calls).toBe(register.mock.calls.length);
    canReuse.mockClear();
    register.mockClear();
    if (kind === 'push') dispatchPush(root, { n: 3 });
    else if (kind === 'pop') dispatchPop(root);
    else dispatchInsert(root, 1, { n: 3 });
    expect(canReuse).toHaveBeenCalled();
    for (const result of canReuse.mock.results) {
      expect(result.type).toBe('return');
      expect(result.value).toBe(false);
    }
    expect(latest?.hasGates).toBe(true);
    expect(latest?.presenceMetrics?.calls).toBe(register.mock.calls.length);
    if (kind !== 'pop') expect(register).toHaveBeenCalled();
  },
);
