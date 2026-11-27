import { expect, it } from 'vitest';

import { FieldNodeEventType } from '@/schema-form/core/engine/record';
import {
  FieldNodeWriteKind,
  WriteOption,
} from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import { writeFieldNode } from '../utils/write/writeFieldNode';

it('preserves values, errors, delivery payloads, revisions, commits and empty rounds', () => {
  const { root } = createTestTree({
    type: 'object',
    properties: {
      value: { type: 'string' },
      sibling: { type: 'number', default: 3 },
    },
  });
  loadFieldNodeAtMount(root, { value: 'before' }, WriteOption.Overwrite);
  const leaf = root.__childrenByName__!.value;
  const sibling = root.__childrenByName__!.sibling;
  const siblingRevision = sibling.__revisionLedger__;
  let previous = 'before';
  for (let index = 0; index < 2; index++) {
    for (const node of root.runtime.deliveries ?? [])
      node.__pendingDelivery__ = undefined;
    root.runtime.deliveries?.clear();
    const value = index === 0 ? 'first' : 'later';
    const revision =
      leaf.__revisionLedger__[FieldNodeEventType.UpdateValue] ?? 0;
    expect(() =>
      writeFieldNode(
        leaf,
        value,
        FieldNodeWriteKind.Input,
        WriteOption.Overwrite,
      ),
    ).not.toThrow();
    expect(root.__outputValue__).toEqual({ value, sibling: 3 });
    expect(root.runtime.diagnostics.status).toBe('stable');
    expect(root.runtime.combinedErrors?.size ?? 0).toBe(0);
    expect(
      leaf.__pendingDelivery__?.payload?.[FieldNodeEventType.UpdateValue],
    ).toEqual({ previous, current: value });
    expect(
      leaf.__pendingDelivery__?.options?.[FieldNodeEventType.UpdateValue],
    ).toEqual({ source: FieldNodeWriteKind.Input });
    expect(leaf.__revisionLedger__[FieldNodeEventType.UpdateValue]).toBe(
      revision + 1,
    );
    expect(sibling.__revisionLedger__).toBe(siblingRevision);
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
  loadFieldNodeAtMount(root, { source: 1 }, WriteOption.Overwrite);
  const target = root.__childrenByName__!.target;
  for (const node of root.runtime.deliveries ?? [])
    node.__pendingDelivery__ = undefined;
  root.runtime.deliveries?.clear();
  const revision =
    target.__revisionLedger__[FieldNodeEventType.UpdateValue] ?? 0;
  writeFieldNode(
    root.__childrenByName__!['source'],
    2,
    FieldNodeWriteKind.Input,
    WriteOption.Overwrite,
  );
  expect(root.__outputValue__).toEqual({ source: 2, target: 3 });
  expect(root.runtime.commitNumber).toBe(2);
  expect(target.__revisionLedger__[FieldNodeEventType.UpdateValue]).toBe(
    revision + 1,
  );
  expect(
    target.__pendingDelivery__?.payload?.[FieldNodeEventType.UpdateValue],
  ).toEqual({ previous: 2, current: 3 });
  expect(
    target.__pendingDelivery__?.options?.[FieldNodeEventType.UpdateValue],
  ).toEqual({ source: FieldNodeWriteKind.Automatic });
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
      WriteOption.Overwrite,
    ),
  ).toThrow('Derive expression failed');
  expect(broken.__outputValue__).toEqual({ source: 1, target: 7 });
  expect(broken.runtime.commitNumber).toBe(1);
  expect(broken.runtime.diagnostics).toMatchObject({
    status: 'degraded',
    cause: 'expression',
  });
});
