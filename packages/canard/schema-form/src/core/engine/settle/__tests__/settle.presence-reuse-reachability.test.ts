import { afterEach, expect, it, vi } from 'vitest';

import type { DispatchTestNode } from '../../__tests__/fixtures/createDispatchTree';
import { dispatchInsert, dispatchPop, dispatchPush } from '../../write';
import type { SettlementContext } from '../types/settlement';
import * as reuse from '../utils/compute/childSelection/canReuseArrayChildren';
import * as registration from '../utils/dependencies/registerPresenceChanges';
import * as settlement from '../utils/settlement/createSettlementContext';
import { mountPresenceTree } from './helpers/mountPresenceTree';

afterEach(() => vi.restoreAllMocks());

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
