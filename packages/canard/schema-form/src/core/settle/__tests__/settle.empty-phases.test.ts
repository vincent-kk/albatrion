import { afterEach, expect, it, vi } from 'vitest';

import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount, writeSchemaNode } from '../index';
import * as derive from '../utils/derivation/runDeriveRounds';
import * as transition from '../utils/transition/transitionSettlement';
import * as exits from '../utils/transition/finalizeExits';
import * as policies from '../utils/commit/snapshotExitedPolicies';
import * as rules from '../utils/commit/commitDeriveRules';
import * as exitRules from '../utils/commit/commitExitPolicyValues';
import * as trace from '../utils/commit/finalizeDeriveTrace';
import * as alignment from '../utils/load/alignArraySnapshotSlots';
import { createTestTree } from './fixtures/createTestTree';

afterEach(() => vi.restoreAllMocks());

it('does not enter any empty phase on first or later singleton writes', () => {
  const { root } = createTestTree({ type: 'object', properties: {
    value: { type: 'string' }, sibling: { type: 'number', default: 3 },
  } });
  loadSchemaNodeAtMount(root, { value: 'before' }, SetValueOption.Overwrite);
  const spies = [vi.spyOn(derive, 'runDeriveRounds'),
    vi.spyOn(transition, 'transitionSettlement'), vi.spyOn(exits, 'finalizeExits'),
    vi.spyOn(policies, 'snapshotExitedPolicies'), vi.spyOn(rules, 'commitDeriveRules'),
    vi.spyOn(exitRules, 'commitExitPolicyValues'), vi.spyOn(trace, 'finalizeDeriveTrace'),
    vi.spyOn(alignment, 'alignArraySnapshotSlots')];
  for (const value of ['first', 'later']) {
    writeSchemaNode(root.structure!.value, value, 'input', SetValueOption.Overwrite);
    expect(root.emit).toEqual({ value, sibling: 3 });
    expect(spies.map(spy => spy.mock.calls.length)).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
  }
});

it('keeps appearance fills and array finalization when their inputs exist', () => {
  const { root } = createTestTree({ type: 'array', items: {
    type: 'object', properties: { value: { type: 'string', default: 'filled' } },
  } });
  const fill = vi.spyOn(transition, 'transitionSettlement');
  const exit = vi.spyOn(exits, 'finalizeExits');
  const align = vi.spyOn(alignment, 'alignArraySnapshotSlots');
  const run = vi.spyOn(derive, 'runDeriveRounds');
  writeSchemaNode(root, [{}], 'callerReplace', SetValueOption.Overwrite);
  expect(root.emit).toEqual([{ value: 'filled' }]);
  expect(fill).toHaveBeenCalledTimes(1);
  expect(exit).toHaveBeenCalledTimes(1);
  expect(align).toHaveBeenCalledTimes(1);
  const departed = root.children![0];
  writeSchemaNode(root, [], 'callerReplace', SetValueOption.Overwrite);
  expect(root.emit).toEqual([]);
  expect(departed.detached).toBe(true);
  expect(exit).toHaveBeenCalledTimes(2);
  expect(align).toHaveBeenCalledTimes(2);
  expect(run).not.toHaveBeenCalled();
});

it('does not skip gates, rule evaluation or rule commits with actual work', () => {
  const { root } = createTestTree({ type: 'object', properties: {
    source: { type: 'number' },
    target: { type: 'number', controls: { derived: '../source + 1' } },
    gated: { type: 'string', default: 'filled', controls: {
      active: '../source > 0', unsetOnInactive: '../source === 0',
    } },
  } });
  loadSchemaNodeAtMount(root, { source: 1 }, SetValueOption.Overwrite);
  const run = vi.spyOn(derive, 'runDeriveRounds');
  const commit = vi.spyOn(rules, 'commitDeriveRules');
  const policy = vi.spyOn(exitRules, 'commitExitPolicyValues');
  const exit = vi.spyOn(exits, 'finalizeExits');
  const snapshot = vi.spyOn(policies, 'snapshotExitedPolicies');
  writeSchemaNode(root.structure!.source, 0, 'input', SetValueOption.Overwrite);
  expect(root.emit).toEqual({ source: 0, target: 1 });
  expect(run).toHaveBeenCalledTimes(1);
  expect(run.mock.calls[0][0].deriveRounds).toBe(1);
  expect(commit).toHaveBeenCalledTimes(1);
  expect(policy).toHaveBeenCalledTimes(1);
  expect(exit).toHaveBeenCalledTimes(1);
  expect(snapshot).toHaveBeenCalledTimes(1);
});
