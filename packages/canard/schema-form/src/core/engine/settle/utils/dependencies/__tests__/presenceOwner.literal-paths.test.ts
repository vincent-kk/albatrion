import { afterEach, expect, it, vi } from 'vitest';

import type { DispatchTestNode } from '../../../../__tests__/fixtures/createDispatchTree';
import { getDispatchNode } from '../../../__tests__/fixtures/getDispatchNode';
import { mountPresenceTree } from '../../../__tests__/helpers/mountPresenceTree';
import type { SettlementContext } from '../../../types/settlement';
import * as settlement from '../../settlement/createSettlementContext';
import { evaluatedPresenceAfter } from '../evaluatedPresenceAfter';
import { publishPresenceOwner } from '../publishPresenceOwner';

afterEach(() => vi.restoreAllMocks());

it.each(['.', '..', '*'])(
  'treats %s as an actual field name for evaluation time and publication',
  (name) => {
    let latest: SettlementContext<DispatchTestNode> | undefined;
    const create = settlement.createSettlementContext;
    vi.spyOn(settlement, 'createSettlementContext').mockImplementation(
      (...args) => {
        const context = create(...args);
        latest = context as SettlementContext<DispatchTestNode>;
        return context;
      },
    );
    const root = mountPresenceTree(
      {
        type: 'object',
        properties: {
          other: { type: 'number' },
          [name]: { type: 'object', properties: { leaf: { type: 'string' } } },
          gate: { type: 'string', controls: { active: '../other >= 0' } },
        },
      },
      { other: 1, [name]: { leaf: 'value' } },
    );
    const live = getDispatchNode(root, name);
    const context = latest!;
    context.presenceRoundStarts = new Map([[live, 20]]);
    context.stateDirtyNodes.clear();
    expect
      .soft(evaluatedPresenceAfter('/' + name + '/leaf', 10, context))
      .toBe(true);
    publishPresenceOwner('/' + name, context);
    expect(context.stateDirtyNodes.has(live)).toBe(true);
    expect([...context.stateDirtyNodes]).toEqual([live]);
  },
);
