import { afterEach, expect, it, vi } from 'vitest';

import type { BlueprintSchema } from '../blueprint';
import * as records from '../record';
import type { FieldNodeDelivery } from '../record';
import {
  dispatchMount,
  dispatchSetValue,
  readFieldNodeRevision,
  subscribeFieldNode,
} from '../write';
import { createDispatchTree } from './fixtures/createDispatchTree';

const counts = vi.hoisted(() => ({ constructors: 0 }));
vi.mock('../record', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../record')>();
  return {
    ...actual,
    FieldNodeRevisionLedger: class extends actual.FieldNodeRevisionLedger {
      constructor(previous: Readonly<Record<number, number>>, mask: number) {
        counts.constructors++;
        super(previous, mask);
      }
    },
  };
});

afterEach(() => {
  vi.restoreAllMocks();
  counts.constructors = 0;
});

it.each([100, 1000])(
  'omits unobserved mount envelopes for %i children without losing revisions',
  (count) => {
    const properties: Record<string, BlueprintSchema> = {};
    const input: Record<string, number> = {};
    for (let i = 0; i < count; i++) {
      properties['k' + i] = { type: 'number' };
      input['k' + i] = i;
    }
    const { root } = createDispatchTree({ type: 'object', properties });
    const marks = vi.spyOn(records, 'markFieldNodeEvent');
    dispatchMount(root, input, undefined, { deferValidation: true });
    expect(marks).toHaveBeenCalledTimes(0);
    expect(root.runtime.deliveries?.size).toBe(0);
    expect(root.local).toEqual(input);
    for (const node of [root, ...root.children!]) {
      expect(
        readFieldNodeRevision(node, records.FieldNodeEventType.UpdateValue),
      ).toBe(1);
      expect(
        readFieldNodeRevision(node, records.FieldNodeEventType.RequestRefresh),
      ).toBe(1);
      expect(node.pendingRevision).toBe(0);
    }
  },
);

it('shares immutable unobserved first-load transitions and releases the memo', () => {
  const { root } = createDispatchTree({
    type: 'object',
    properties: {
      a: { type: 'number', default: 1 },
      b: { type: 'number', default: 2 },
    },
  });
  dispatchMount(root, undefined, undefined, { deferValidation: true });
  const ledger = root.revisionLedger;
  expect(root.children!.every((child) => child.revisionLedger === ledger)).toBe(
    true,
  );
  expect(root.runtime.revisionTransitions).toBeUndefined();
  dispatchSetValue(root.children![0], 3);
  expect(ledger[records.FieldNodeEventType.UpdateValue]).toBe(1);
  expect(
    readFieldNodeRevision(
      root.children![0],
      records.FieldNodeEventType.UpdateValue,
    ),
  ).toBe(2);
  expect(
    readFieldNodeRevision(
      root.children![1],
      records.FieldNodeEventType.UpdateValue,
    ),
  ).toBe(1);
});

it.each(['generic', 'static-first'])(
  'keeps one constructor per observed node on %s load and write',
  (route) => {
    const { root } = createDispatchTree({
      type: 'object',
      properties: {
        a: { type: 'number', default: 0 },
        b: { type: 'number', default: 0 },
        c: { type: 'number', default: 0 },
      },
    });
    let event: FieldNodeDelivery | undefined;
    subscribeFieldNode(root, (next) => {
      event = next;
    });
    counts.constructors = 0;
    dispatchMount(
      root,
      route === 'generic' ? { a: 0, b: 0, c: 0 } : undefined,
      undefined,
      { deferValidation: true },
    );
    expect(counts.constructors).toBe(4);
    expect(root.runtime.revisionTransitions).toBeUndefined();
    counts.constructors = 0;
    dispatchSetValue(root, { a: 1, b: 1, c: 1 });
    expect(counts.constructors).toBe(4);
    expect(
      new Set([root, ...root.children!].map((node) => node.revisionLedger))
        .size,
    ).toBe(4);
    expect(root.runtime.revisionTransitions).toBeUndefined();
    expect(
      Object.isFrozen(event?.payload?.[records.FieldNodeEventType.UpdateValue]),
    ).toBe(true);
  },
);

it('retains payloads permanently after the first revision read', () => {
  const { root } = createDispatchTree({ type: 'number' });
  expect(readFieldNodeRevision(root)).toBe(0);
  const marks = vi.spyOn(records, 'markFieldNodeEvent');
  dispatchSetValue(root, 1);
  dispatchSetValue(root, 2);
  expect(
    marks.mock.calls
      .filter(([, bit]) => bit === records.FieldNodeEventType.UpdateValue)
      .map(([, , payload]) => payload),
  ).toEqual([
    { previous: undefined, current: 1 },
    { previous: 1, current: 2 },
  ]);
  expect(
    readFieldNodeRevision(root, records.FieldNodeEventType.UpdateValue),
  ).toBe(2);
});

it('retains an existing pending previous instead of entering bit-only mode', () => {
  const { root } = createDispatchTree({ type: 'number' });
  dispatchMount(root, 0, undefined, { deferValidation: true });
  root.pendingDelivery = {
    type: records.FieldNodeEventType.UpdateValue,
    payload: {
      [records.FieldNodeEventType.UpdateValue]: { previous: -1, current: 0 },
    },
  };
  root.runtime.deliveries!.add(root);
  const marks = vi.spyOn(records, 'markFieldNodeEvent');
  dispatchSetValue(root, 1);
  const value = marks.mock.calls.find(
    ([, bit]) => bit === records.FieldNodeEventType.UpdateValue,
  );
  expect(value?.[2]).toEqual({ previous: -1, current: 1 });
  expect(root.runtime.revisionTransitions).toBeUndefined();
});
