import { describe, expect, it } from 'vitest';

import { SchemaNodeEventType as E } from '../../record';
import type { SchemaNodeDelivery } from '../../record';
import { writeSchemaNode } from '../../settle';
import { SetValueOption } from '../../types/value';
import { createTestValidator } from '../../__tests__/fixtures/createTestValidator';
import { dispatchRemove, dispatchSetState, dispatchSetValue, readSchemaNodeRevision,
  subscribeSchemaNode } from '../index';
import { runDeliveryWaves } from '../utils/chain/runDeliveryWaves';
import { createDispatchTree } from './fixtures/createDispatchTree';
import type { DispatchTestNode } from './fixtures/createDispatchTree';
import { getDispatchChild } from './fixtures/getDispatchChild';

/** Commit without draining, reproducing multiple commits inside one delivery boundary. */
const commit = (node: DispatchTestNode, value: unknown) =>
  writeSchemaNode(node, value, 'callerReplace', SetValueOption.Overwrite);

/** Observe the public value payload without depending on pending envelope layout. */
const value = (event: SchemaNodeDelivery) => event.payload?.[E.UpdateValue];

// Regression characterization: the same assertions run against the archived baseline.
describe('payload boundary differential characterization', () => {
  it('01 preserves baselines before and after subscription, including an unobserved wave', () => {
    const { root } = createDispatchTree({ type: 'string' });
    commit(root, 'A');
    commit(root, 'B');
    const seen: unknown[] = [];
    const unsubscribe = subscribeSchemaNode(root, event => seen.push(value(event)));
    runDeliveryWaves(root);
    expect(seen).toEqual([{ previous: undefined, current: 'B' }]);
    unsubscribe();
    dispatchSetValue(root, 'C');
    subscribeSchemaNode(root, event => seen.push(value(event)));
    expect(seen).toHaveLength(1);
    dispatchSetValue(root, 'D');
    expect(seen[1]).toEqual({ previous: 'C', current: 'D' });

    const late = createDispatchTree({ type: 'string' }).root;
    dispatchSetValue(late, 'A');
    commit(late, 'B');
    const lateEvents: SchemaNodeDelivery[] = [];
    const remove = subscribeSchemaNode(late, event => lateEvents.push(event));
    expect(lateEvents).toHaveLength(0);
    runDeliveryWaves(late);
    expect(value(lateEvents[0])).toEqual({ previous: 'A', current: 'B' });
    commit(late, 'C');
    remove();
    runDeliveryWaves(late);
    subscribeSchemaNode(late, event => lateEvents.push(event));
    dispatchSetValue(late, 'D');
    expect(value(lateEvents[1])).toEqual({ previous: 'C', current: 'D' });
  });

  it('02 merges two committed values into one wave without merging revisions', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    dispatchSetValue(root, 'A');
    const revision = readSchemaNodeRevision(root, E.UpdateValue);
    const number = runtime.commitNumber ?? 0;
    const events: SchemaNodeDelivery[] = [];
    subscribeSchemaNode(root, event => events.push(event));
    commit(root, 'B'); commit(root, 'C');
    expect(readSchemaNodeRevision(root, E.UpdateValue)).toBe(revision + 2);
    expect(runtime.commitNumber).toBe(number + 2);
    expect(events).toHaveLength(0);
    runDeliveryWaves(root);
    expect(events).toHaveLength(1);
    expect(value(events[0])).toEqual({ previous: 'A', current: 'C' });
    expect(events[0].options?.[E.UpdateValue]).toEqual({ source: 'callerReplace' });
  });

  it('03 keeps A to B to A across commits as an announced event', () => {
    const { root } = createDispatchTree({ type: 'string' });
    dispatchSetValue(root, 'A');
    const events: SchemaNodeDelivery[] = [];
    subscribeSchemaNode(root, event => events.push(event));
    commit(root, 'B'); commit(root, 'A'); runDeliveryWaves(root);
    expect(events).toHaveLength(1);
    expect(events[0].type & E.UpdateValue).toBe(E.UpdateValue);
    expect(value(events[0])).toEqual({ previous: 'A', current: 'A' });
  });

  it('04 fixes the whole wave before synchronous feedback and unsubscribe/resubscribe', () => {
    const { root } = createDispatchTree({ type: 'object', properties: {
      a: { type: 'string' }, b: { type: 'string' },
    } });
    dispatchSetValue(root, { a: 'A', b: 'A' });
    const a = getDispatchChild(root, 'a'), b = getDispatchChild(root, 'b');
    const seen: unknown[] = [];
    let remove = () => {};
    subscribeSchemaNode(a, () => {
      remove();
      subscribeSchemaNode(b, event => seen.push(['late', value(event)]));
      dispatchSetValue(b, 'C');
    });
    subscribeSchemaNode(b, event => seen.push(['kept', value(event)]));
    remove = subscribeSchemaNode(b, () => seen.push('removed'));
    dispatchSetValue(root, { a: 'B', b: 'B' });
    expect(seen).toEqual([
      ['kept', { previous: 'A', current: 'B' }],
      ['kept', { previous: 'B', current: 'C' }],
      ['late', { previous: 'B', current: 'C' }],
    ]);
  });

  it('05 advances only committed bits independently of subscriptions', () => {
    const { root } = createDispatchTree({ type: 'string' });
    dispatchSetValue(root, 'A');
    const valueRevision = readSchemaNodeRevision(root, E.UpdateValue);
    const stateRevision = readSchemaNodeRevision(root, E.UpdateState);
    const pathRevision = readSchemaNodeRevision(root, E.UpdatePath);
    const ledger = root.revisionLedger;
    dispatchSetValue(root, 'B');
    expect(readSchemaNodeRevision(root, E.UpdateValue)).toBe(valueRevision + 1);
    expect(readSchemaNodeRevision(root, E.UpdateState)).toBe(stateRevision);
    expect(readSchemaNodeRevision(root, E.UpdatePath)).toBe(pathRevision);
    for (let bit = 1; bit <= E.UpdateDiagnostics; bit <<= 1)
      expect(root.revisionLedger[bit] ?? 0, E[bit]).toBe((ledger[bit] ?? 0) + (bit === E.UpdateValue || bit === E.RequestRefresh ? 1 : 0));
    const subscribedLedger = root.revisionLedger;
    subscribeSchemaNode(root, () => {});
    dispatchSetValue(root, 'C');
    for (let bit = 1; bit <= E.UpdateDiagnostics; bit <<= 1)
      expect(root.revisionLedger[bit] ?? 0, E[bit]).toBe((subscribedLedger[bit] ?? 0) + (bit === E.UpdateValue || bit === E.RequestRefresh ? 1 : 0));

    const array = createDispatchTree({ type: 'array', items: { type: 'string' } }).root;
    dispatchSetValue(array, ['a', 'b']);
    const item = array.children![1];
    const pathEvents: SchemaNodeDelivery[] = [];
    subscribeSchemaNode(item, event => pathEvents.push(event));
    dispatchRemove(array, 0);
    expect(pathEvents[0].payload?.[E.UpdatePath]).toEqual({ previous: '/1', current: '/0' });
    expect(Object.isFrozen(pathEvents[0].payload?.[E.UpdatePath])).toBe(true);
  });

  it('06 preserves previous/current value references and shares one event among listeners', () => {
    const { root } = createDispatchTree({ type: 'object', properties: { a: { type: 'string' } } });
    dispatchSetValue(root, { a: 'A' });
    const before = root.local, beforeEmit = root.emit;
    const events: SchemaNodeDelivery[] = [];
    subscribeSchemaNode(root, event => events.push(event));
    subscribeSchemaNode(root, event => events.push(event));
    dispatchSetValue(root, { a: 'B' });
    expect(events[0]).toBe(events[1]);
    const payload = value(events[0]);
    expect(payload).toEqual({ previous: { local: before, emit: beforeEmit },
      current: { local: root.local, emit: root.emit } });
    expect((payload as { previous: { local: unknown } }).previous.local).toBe(before);
    expect((payload as { current: { local: unknown } }).current.local).toBe(root.local);
    expect((payload as { previous: { emit: unknown } }).previous.emit).toBe(beforeEmit);
    expect((payload as { current: { emit: unknown } }).current.emit).toBe(root.emit);
    expect(Object.isFrozen(payload)).toBe(true);
    expect(Object.isFrozen((payload as { current: object }).current)).toBe(false);
    expect(Object.keys(events[0]).sort()).toEqual(['options', 'payload', 'type']);
  });

  it('07 freezes the payload before the first listener and retains the existing shallow scope', () => {
    const { root } = createDispatchTree({ type: 'string' });
    let first: unknown;
    subscribeSchemaNode(root, event => {
      first = value(event);
      expect(Object.isFrozen(first)).toBe(true);
      expect(() => Object.assign(first as object, { current: 'broken' })).toThrow();
    });
    subscribeSchemaNode(root, event => expect(value(event)).toBe(first));
    dispatchSetValue(root, 'A');

    const conditional = createDispatchTree({ type: 'object', properties: {
      enabled: { type: 'boolean' }, value: { type: 'string' },
    }, if: { properties: { enabled: { const: true } }, required: ['enabled'] },
    then: { properties: { value: { minLength: 2 } } } }, undefined, createTestValidator()).root;
    dispatchSetValue(conditional, { enabled: false, value: 'a' });
    const child = getDispatchChild(conditional, 'value');
    const previous = child.schema.schema;
    const events: SchemaNodeDelivery[] = [];
    subscribeSchemaNode(child, event => events.push(event));
    dispatchSetValue(getDispatchChild(conditional, 'enabled'), true);
    const payload = events[0].payload?.[E.UpdateJsonSchema];
    expect(payload).toEqual({ previous, current: child.schema.schema });
    expect(Object.isFrozen(payload)).toBe(true);
  });

  it('08 keeps listener failures, global state and completion in order', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    dispatchSetValue(root, 'A');
    const seen: string[] = [];
    const failure = new Error('listener');
    runtime.onStateChange = () => seen.push('state-complete');
    subscribeSchemaNode(root, event => {
      if (event.type & E.UpdateValue) {
        seen.push('value'); dispatchSetState(root, { dirty: true }); throw failure;
      }
      if (event.type & E.UpdateState) seen.push('state');
      if (event.type & E.UpdateGlobalState) seen.push('global');
    });
    subscribeSchemaNode(root, event => {
      if (event.type & E.UpdateValue) seen.push('second-value');
    });
    expect(() => dispatchSetValue(root, 'B')).toThrow(failure);
    expect(seen).toEqual(['value', 'second-value', 'state', 'global', 'state-complete']);
    expect(runtime.globalState).toEqual({ dirty: true });
  });

  it('09 detects the read/subscribe gap without replay or baseline overwrite', () => {
    const { root } = createDispatchTree({ type: 'string' });
    dispatchSetValue(root, 'A');
    const before = readSchemaNodeRevision(root, E.UpdateValue);
    commit(root, 'B');
    const events: SchemaNodeDelivery[] = [];
    subscribeSchemaNode(root, event => events.push(event));
    expect(events).toHaveLength(0);
    expect(readSchemaNodeRevision(root, E.UpdateValue)).toBe(before + 1);
    runDeliveryWaves(root);
    expect(value(events[0])).toEqual({ previous: 'A', current: 'B' });
  });
});
