import { describe, expect, it } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';
import { FieldNodeEventType } from '@/schema-form/core/engine';
import { FieldNodeState } from '@/schema-form/core/engine';

import type { FieldNode } from '../type';

// filid:contract surface-members
describe('EVENT-062 43C-01 globalState surface', () => {
  it('counts true keys across nodes and removes a key only at zero', () => {
    const { root } = makeFieldNodeTree({
      type: 'object',
      properties: {
        first: { type: 'string' },
        second: { type: 'string' },
      },
    });
    root.setValue({ first: 'a', second: 'b' });
    const first = root.find('/first');
    const second = root.find('/second');
    if (!first || !second) throw new Error('Expected both children');
    const empty = root.globalState;
    expect(empty).toEqual({});
    first.state = { [FieldNodeState.Edited]: true };
    const one = root.globalState;
    expect(one).toEqual({ [FieldNodeState.Edited]: true });
    second.setState({
      [FieldNodeState.Edited]: true,
      [FieldNodeState.Touched]: true,
    });
    expect(root.globalState).toEqual({
      [FieldNodeState.Edited]: true,
      [FieldNodeState.Touched]: true,
    });
    first.setState({ [FieldNodeState.Edited]: false });
    const two = root.globalState;
    expect(two).toBe(root.globalState);
    second.setState({ [FieldNodeState.Touched]: false });
    expect(root.globalState).toEqual({ [FieldNodeState.Edited]: true });
    second.clearSubtreeState();
    expect(root.globalState).toEqual({});
    expect(root.globalState).not.toBe(empty);
  });

  it('retains the aggregate reference and emits no root event without a zero crossing', () => {
    const { root } = makeFieldNodeTree({
      type: 'object',
      properties: {
        first: { type: 'string' },
        second: { type: 'string' },
      },
    });
    root.setValue({ first: 'a', second: 'b' });
    const first = root.find('/first');
    const second = root.find('/second');
    if (!first || !second) throw new Error('Expected both children');
    first.setState({ [FieldNodeState.Edited]: true });
    const before = root.globalState;
    const events: number[] = [];
    root.subscribe((event) => {
      if (event.type & FieldNodeEventType.UpdateGlobalState)
        events.push(event.type);
    });
    second.setState({ [FieldNodeState.Edited]: true });
    first.setState({ [FieldNodeState.Edited]: false });
    expect(root.globalState).toBe(before);
    expect(events).toEqual([]);
  });

  it('queues one root event until the outer batch ends', () => {
    const { root } = makeFieldNodeTree({
      type: 'object',
      properties: {
        first: { type: 'string' },
        second: { type: 'string' },
      },
    });
    root.setValue({ first: 'a', second: 'b' });
    const first = root.find('/first');
    const second = root.find('/second');
    if (!first || !second) throw new Error('Expected both children');
    const events: number[] = [];
    root.subscribe((event) => {
      if (event.type & FieldNodeEventType.UpdateGlobalState)
        events.push(event.type);
    });
    root.batch(() => {
      first.setState({ [FieldNodeState.Edited]: true });
      second.setState({ [FieldNodeState.Edited]: true });
      first.setState({ [FieldNodeState.Edited]: false });
      expect(events).toEqual([]);
    });
    expect(events).toHaveLength(1);
    expect(events[0] & FieldNodeEventType.UpdateGlobalState).toBeTruthy();
  });

  it('delivers a root event synchronously when entry depth is zero', () => {
    const { root } = makeFieldNodeTree({ type: 'string' });
    const events: number[] = [];
    root.subscribe((event) => {
      if (event.type & FieldNodeEventType.UpdateGlobalState)
        events.push(event.type);
    });
    root.setState({ [FieldNodeState.Edited]: true });
    expect(events).toHaveLength(1);
    expect(root.globalState).toEqual({ [FieldNodeState.Edited]: true });
  });

  it('normalizes truthy nonboolean state values to true', () => {
    const { root } = makeFieldNodeTree({ type: 'string' });
    root.setState({ custom: 'changed' });
    expect(root.globalState).toEqual({ custom: true });
    root.setState({ custom: '' });
    expect(root.globalState).toEqual({});
  });

  it('lowers a live node count when a subtree load clears its state', () => {
    const { root } = makeFieldNodeTree(
      {
        type: 'object',
        properties: {
          target: { type: 'string' },
        },
      },
      { snapshot: { target: 'loaded' } },
    );
    root.setValue({ target: 'edited' });
    const target = root.find('/target');
    if (!target) throw new Error('Expected the active target');
    target.setState({ [FieldNodeState.Edited]: true });
    target.resetSubtree();
    expect(root.globalState).toEqual({});
  });

  it('lowers counts on exit and lets detached references read the live aggregate', () => {
    const { root } = makeFieldNodeTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        target: { type: 'string', controls: { active: '../flag' } },
      },
    });
    root.setValue({ flag: true, target: 'value' });
    const old = root.find('/target');
    if (!old) throw new Error('Expected the active target');
    old.setState({ [FieldNodeState.Edited]: true });
    expect(root.globalState).toEqual({ [FieldNodeState.Edited]: true });
    root.find('/flag')?.setValue(false);
    expect(root.globalState).toEqual({});
    expect(old.globalState).toBe(root.globalState);
    root.find('/flag')?.setValue(true);
    const current = root.find('/target');
    if (!current || current === old) throw new Error('Expected a new target');
    current.setState({ [FieldNodeState.Edited]: true });
    expect(root.globalState).toEqual({ [FieldNodeState.Edited]: true });
    expect(old.globalState).toBe(root.globalState);
  });

  it('publishes a flag as absent, then true, then absent again and never false', () => {
    const { root } = makeFieldNodeTree({
      type: 'object',
      properties: {
        first: { type: 'string' },
        second: { type: 'string' },
      },
    });
    root.setValue({ first: 'a', second: 'b' });
    const first = root.find('/first');
    const second = root.find('/second');
    if (!first || !second) throw new Error('Expected both children');
    const edited = FieldNodeState.Edited;
    expect(edited in root.globalState).toBe(false);
    first.setState({ [edited]: true });
    second.setState({ [edited]: true });
    expect(root.globalState[edited]).toBe(true);
    first.setState({ [edited]: false });
    expect(root.globalState[edited]).toBe(true);
    second.setState({ [edited]: false });
    expect(edited in root.globalState).toBe(false);
    expect(root.globalState[edited]).toBeUndefined();
    expect(Object.values(root.globalState)).not.toContain(false);
  });

  it('lets a globalState consumer such as onStateChange keep a boolean | undefined copy', () => {
    const copies: Record<string, boolean | undefined>[] = [];
    const onStateChange = (state: FieldNode['globalState']) => {
      const copy: Record<string, boolean | undefined> = { ...state };
      copy[FieldNodeState.Edited] = false;
      copy[FieldNodeState.Touched] = undefined;
      const spread: Record<string, boolean | undefined> = {
        ...state,
        [FieldNodeState.Edited]: false,
      };
      expect(spread[FieldNodeState.Edited]).toBe(false);
      copies.push(copy);
      const shared: FieldNode['globalState'] = copy;
      expect(shared).toBe(copy);
    };
    const { root } = makeFieldNodeTree({ type: 'string' });
    onStateChange(root.globalState);
    expect(copies).toEqual([
      { [FieldNodeState.Edited]: false, [FieldNodeState.Touched]: undefined },
    ]);
  });
});
