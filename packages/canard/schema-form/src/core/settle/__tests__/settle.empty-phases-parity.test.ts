import { expect, it } from 'vitest';

import { FieldNodeEventType } from '../../record';
import { SetValueOption } from '../../types/value';
import { loadFieldNodeAtMount, writeFieldNode } from '../index';
import { createTestTree } from './fixtures/createTestTree';

it('preserves values, errors, delivery payloads, revisions, commits and empty rounds', () => {
  const { root } = createTestTree({
    type: 'object',
    properties: {
      value: { type: 'string' },
      sibling: { type: 'number', default: 3 },
    },
  });
  loadFieldNodeAtMount(root, { value: 'before' }, SetValueOption.Overwrite);
  const leaf = root.structure!.value;
  const sibling = root.structure!.sibling;
  const siblingRevision = sibling.revisionLedger;
  let previous = 'before';
  for (let index = 0; index < 2; index++) {
    for (const node of root.runtime.deliveries ?? [])
      node.pendingDelivery = undefined;
    root.runtime.deliveries?.clear();
    const value = index === 0 ? 'first' : 'later';
    const revision = leaf.revisionLedger[FieldNodeEventType.UpdateValue] ?? 0;
    expect(() =>
      writeFieldNode(leaf, value, 'input', SetValueOption.Overwrite),
    ).not.toThrow();
    expect(root.emit).toEqual({ value, sibling: 3 });
    expect(root.runtime.diagnostics.status).toBe('stable');
    expect(root.runtime.combinedErrors?.size ?? 0).toBe(0);
    expect(
      leaf.pendingDelivery?.payload?.[FieldNodeEventType.UpdateValue],
    ).toEqual({ previous, current: value });
    expect(
      leaf.pendingDelivery?.options?.[FieldNodeEventType.UpdateValue],
    ).toEqual({ source: 'input' });
    expect(leaf.revisionLedger[FieldNodeEventType.UpdateValue]).toBe(
      revision + 1,
    );
    expect(sibling.revisionLedger).toBe(siblingRevision);
    expect(
      [...(root.runtime.deliveries ?? [])].map((node) => node.path),
    ).toEqual(['/value', '']);
    expect(root.runtime.commitNumber).toBe(index + 2);
    expect(root.runtime.settlementTrace?.rounds).toEqual([]);
    previous = value;
  }
});

it('preserves actual derive rounds, automatic delivery and deferred expression errors', () => {
  const { root } = createTestTree({
    type: 'object',
    properties: {
      source: { type: 'number' },
      target: { type: 'number', controls: { derived: '../source + 1' } },
    },
  });
  loadFieldNodeAtMount(root, { source: 1 }, SetValueOption.Overwrite);
  const target = root.structure!.target;
  for (const node of root.runtime.deliveries ?? [])
    node.pendingDelivery = undefined;
  root.runtime.deliveries?.clear();
  const revision = target.revisionLedger[FieldNodeEventType.UpdateValue] ?? 0;
  writeFieldNode(root.structure!.source, 2, 'input', SetValueOption.Overwrite);
  expect(root.emit).toEqual({ source: 2, target: 3 });
  expect(root.runtime.commitNumber).toBe(2);
  expect(target.revisionLedger[FieldNodeEventType.UpdateValue]).toBe(
    revision + 1,
  );
  expect(
    target.pendingDelivery?.payload?.[FieldNodeEventType.UpdateValue],
  ).toEqual({ previous: 2, current: 3 });
  expect(
    target.pendingDelivery?.options?.[FieldNodeEventType.UpdateValue],
  ).toEqual({ source: 'automatic' });
  expect(root.runtime.settlementTrace?.rounds).toHaveLength(2);
  expect(root.runtime.settlementTrace?.rounds[0]).toEqual([
    expect.objectContaining({
      kind: 'derived',
      result: 'applied',
      targetPath: '/target',
    }),
  ]);
  const broken = createTestTree({
    type: 'object',
    properties: {
      source: { type: 'number' },
      target: {
        type: 'number',
        controls: {
          derived: '(() => { throw new Error("phase-error"); })()',
        },
      },
    },
  }).root;
  expect(() =>
    loadFieldNodeAtMount(
      broken,
      { source: 1, target: 7 },
      SetValueOption.Overwrite,
    ),
  ).toThrow('Derive expression failed');
  expect(broken.emit).toEqual({ source: 1, target: 7 });
  expect(broken.runtime.commitNumber).toBe(1);
  expect(broken.runtime.diagnostics).toMatchObject({
    status: 'degraded',
    cause: 'expression',
  });
});
