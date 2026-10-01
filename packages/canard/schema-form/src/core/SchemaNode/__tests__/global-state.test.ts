import { describe, expect, it } from 'vitest';

import { makeSchemaNodeTree } from '../../__tests__/makeSchemaNodeTree';
import { SchemaNodeEventType } from '../../record';
import { NodeState } from '../../types/state';

// filid:contract surface-members
describe('EVENT-062 43C-01 globalState surface', () => {
  it('counts true keys across nodes and removes a key only at zero', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      first: { type: 'string' }, second: { type: 'string' },
    } });
    root.setValue({ first: 'a', second: 'b' });
    const first = root.find('/first');
    const second = root.find('/second');
    if (!first || !second) throw new Error('Expected both children');
    const empty = root.globalState;
    expect(empty).toEqual({});
    first.state = { [NodeState.Dirty]: true };
    const one = root.globalState;
    expect(one).toEqual({ [NodeState.Dirty]: true });
    second.setState({ [NodeState.Dirty]: true, [NodeState.Touched]: true });
    expect(root.globalState).toEqual({
      [NodeState.Dirty]: true, [NodeState.Touched]: true,
    });
    first.setState({ [NodeState.Dirty]: false });
    const two = root.globalState;
    expect(two).toBe(root.globalState);
    second.setState({ [NodeState.Touched]: false });
    expect(root.globalState).toEqual({ [NodeState.Dirty]: true });
    second.clearSubtreeState();
    expect(root.globalState).toEqual({});
    expect(root.globalState).not.toBe(empty);
  });

  it('retains the aggregate reference and emits no root event without a zero crossing', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      first: { type: 'string' }, second: { type: 'string' },
    } });
    root.setValue({ first: 'a', second: 'b' });
    const first = root.find('/first');
    const second = root.find('/second');
    if (!first || !second) throw new Error('Expected both children');
    first.setState({ [NodeState.Dirty]: true });
    const before = root.globalState;
    const events: number[] = [];
    root.subscribe((event) => {
      if (event.type & SchemaNodeEventType.UpdateGlobalState) events.push(event.type);
    });
    second.setState({ [NodeState.Dirty]: true });
    first.setState({ [NodeState.Dirty]: false });
    expect(root.globalState).toBe(before);
    expect(events).toEqual([]);
  });

  it('queues one root event until the outer batch ends', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      first: { type: 'string' }, second: { type: 'string' },
    } });
    root.setValue({ first: 'a', second: 'b' });
    const first = root.find('/first');
    const second = root.find('/second');
    if (!first || !second) throw new Error('Expected both children');
    const events: number[] = [];
    root.subscribe((event) => {
      if (event.type & SchemaNodeEventType.UpdateGlobalState) events.push(event.type);
    });
    root.batch(() => {
      first.setState({ [NodeState.Dirty]: true });
      second.setState({ [NodeState.Dirty]: true });
      first.setState({ [NodeState.Dirty]: false });
      expect(events).toEqual([]);
    });
    expect(events).toHaveLength(1);
    expect(events[0] & SchemaNodeEventType.UpdateGlobalState).toBeTruthy();
  });

  it('delivers a root event synchronously when entry depth is zero', () => {
    const { root } = makeSchemaNodeTree({ type: 'string' });
    const events: number[] = [];
    root.subscribe((event) => {
      if (event.type & SchemaNodeEventType.UpdateGlobalState) events.push(event.type);
    });
    root.setState({ [NodeState.Dirty]: true });
    expect(events).toHaveLength(1);
    expect(root.globalState).toEqual({ [NodeState.Dirty]: true });
  });

  it('normalizes truthy nonboolean state values to true', () => {
    const { root } = makeSchemaNodeTree({ type: 'string' });
    root.setState({ custom: 'changed' });
    expect(root.globalState).toEqual({ custom: true });
    root.setState({ custom: '' });
    expect(root.globalState).toEqual({});
  });

  it('lowers a live node count when a subtree load clears its state', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      target: { type: 'string' },
    } }, { snapshot: { target: 'loaded' } });
    root.setValue({ target: 'edited' });
    const target = root.find('/target');
    if (!target) throw new Error('Expected the active target');
    target.setState({ [NodeState.Dirty]: true });
    target.resetSubtree();
    expect(root.globalState).toEqual({});
  });

  it('lowers counts on exit and lets detached references read the live aggregate', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      flag: { type: 'boolean' },
      target: { type: 'string', controls: { active: '../flag' } },
    } });
    root.setValue({ flag: true, target: 'value' });
    const old = root.find('/target');
    if (!old) throw new Error('Expected the active target');
    old.setState({ [NodeState.Dirty]: true });
    expect(root.globalState).toEqual({ [NodeState.Dirty]: true });
    root.find('/flag')?.setValue(false);
    expect(root.globalState).toEqual({});
    expect(old.globalState).toBe(root.globalState);
    root.find('/flag')?.setValue(true);
    const current = root.find('/target');
    if (!current || current === old) throw new Error('Expected a new target');
    current.setState({ [NodeState.Dirty]: true });
    expect(root.globalState).toEqual({ [NodeState.Dirty]: true });
    expect(old.globalState).toBe(root.globalState);
  });
});
