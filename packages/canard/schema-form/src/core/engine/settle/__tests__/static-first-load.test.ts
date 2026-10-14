import { afterEach, expect, it, vi } from 'vitest';

import { isArray } from '@winglet/common-utils/filter';

import { FieldNodeEventType } from '@/schema-form/core/engine/record';
import { WriteOption } from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { markCommitDeliveries } from '../utils/commit/markCommitDeliveries';
import { loadFieldNodeAtMount } from '../utils/load/loadFieldNodeAtMount';
import { createSettlementContext } from '../utils/settlement/createSettlementContext';
import { readDefault } from '../utils/transition/readDefault';
import { getSettlementScratch } from '../utils/write/getSettlementScratch';
import { writeFieldNode } from '../utils/write/writeFieldNode';

afterEach(() => vi.restoreAllMocks());

it('assembles independent leaf defaults once while keeping authored and delivery order', () => {
  const { root, visits } = createTestTree({
    type: 'object',
    properties: {
      nested: {
        type: 'object',
        properties: {
          b: { type: 'number', default: 2 },
          a: { type: 'string', default: 'a' },
        },
      },
      last: { type: 'boolean', default: false },
    },
  });
  loadFieldNodeAtMount(root, undefined, WriteOption.Overwrite);
  expect(root.local).toEqual({ nested: { b: 2, a: 'a' }, last: false });
  expect(root.local).toBe(root.emit);
  expect([...(root.runtime.deliveries ?? [])].map((node) => node.path)).toEqual(
    ['', '/nested', '/nested/b', '/nested/a', '/last'],
  );
  expect(root.runtime.typeMismatchRecords).toEqual([]);
  expect(visits.filter((path) => !path.startsWith('select:'))).toEqual([
    '/nested/b',
    '/nested/a',
    '/nested',
    '/last',
    '',
  ]);
});

it('preserves input priority, container defaults, suppression and dependent defaults', () => {
  const scalar = createTestTree({ type: 'string', default: 'scalar' }).root;
  loadFieldNodeAtMount(scalar, undefined, WriteOption.Overwrite);
  expect(scalar.local).toBe('scalar');
  const schema = {
    type: 'object' as const,
    properties: {
      a: { type: 'number' as const, default: 1 },
      group: {
        type: 'object' as const,
        default: { b: 'container' },
        properties: {
          b: { type: 'string' as const, default: 'leaf' },
        },
      },
    },
  };
  const { root } = createTestTree(schema);
  loadFieldNodeAtMount(root, { a: 9 }, WriteOption.Overwrite);
  expect(root.local).toEqual({ a: 9, group: { b: 'container' } });
  const suppressed = createTestTree(schema).root;
  loadFieldNodeAtMount(
    suppressed,
    undefined,
    WriteOption.DisableAutomaticWrites,
  );
  expect(suppressed.structure!.a.local).toBeUndefined();
  expect(suppressed.structure!.group.structure!.b.local).toBeUndefined();
  const dependent = createTestTree({
    type: 'object',
    properties: {
      a: { type: 'number', default: 1 },
      b: { type: 'number', controls: { derived: '../a + 1' } },
    },
  }).root;
  loadFieldNodeAtMount(dependent, undefined, WriteOption.Overwrite);
  expect(dependent.local).toEqual({ a: 1, b: 2 });
});

it('preserves revisions and pending delivery for an empty delivery commit', () => {
  const { root } = createTestTree({ type: 'string' });
  loadFieldNodeAtMount(root, 'same', WriteOption.Overwrite);
  root.pendingDelivery = undefined;
  root.runtime.deliveries?.clear();
  const revision = root.revisionLedger;
  const context = createSettlementContext(
    root,
    'input',
    WriteOption.Overwrite,
    getSettlementScratch(root.runtime),
  );
  markCommitDeliveries(context);
  expect(root.local).toBe('same');
  expect(root.runtime.deliveries?.size).toBe(0);
  expect(root.revisionLedger).toBe(revision);
  expect(root.pendingDelivery).toBeUndefined();
});

it('shares ungated declarations without building an occurrence path index', () => {
  const { root } = createTestTree({
    type: 'object',
    properties: {
      items: { type: 'array', items: { type: 'string', default: 'fallback' } },
      value: {
        type: 'string',
        controls: { default: 'control' },
        default: 'schema',
      },
    },
  });
  loadFieldNodeAtMount(root, { items: ['a', 'b'] }, WriteOption.Overwrite);
  expect(root.local).toEqual({ items: ['a', 'b'], value: 'control' });
  expect(readDefault(root.structure!.value, new Map())).toBe('control');
  expect(readDefault(root.structure!.items.children![1], new Map())).toBe(
    'fallback',
  );
  expect(root.runtime.committedDeclarationIds?.size ?? 0).toBe(0);
  writeFieldNode(root.structure!.value, 'next', 'input', WriteOption.Overwrite);
  expect(readDefault(root.structure!.value, new Map())).toBe('control');
  expect(root.runtime.committedDeclarationIds?.size ?? 0).toBe(0);
});

it('keeps static nodes, property order, defaults, references and unsubscribed revisions', () => {
  const { root } = createTestTree({
    type: 'object',
    properties: {
      'a/b': { type: 'number', default: 7 },
      group: {
        type: 'object',
        properties: { leaf: { type: 'string', default: 'x' } },
      },
    },
  });
  loadFieldNodeAtMount(root, undefined, WriteOption.Overwrite);
  expect(root.local).toEqual({ 'a/b': 7, group: { leaf: 'x' } });
  expect(root.children?.map((node) => node.name)).toEqual(['a/b', 'group']);
  const child = root.structure!['a/b'];
  expect(child.path).toBe('/a~1b');
  const value = root.local;
  const children = root.children;
  const revision = child.revisionLedger[FieldNodeEventType.UpdateValue];
  writeFieldNode(child, 7, 'input', WriteOption.Overwrite);
  expect(root.local).toBe(value);
  expect(root.children).toBe(children);
  writeFieldNode(child, 8, 'input', WriteOption.Overwrite);
  expect(child.revisionLedger[FieldNodeEventType.UpdateValue]).toBe(
    revision + 1,
  );
  expect(root.structure!['a/b']).toBe(child);
});

it('does not serialize empty pending-exit and latent lookups during static selection', () => {
  const { root } = createTestTree({
    type: 'object',
    properties: {
      a: { type: 'number' },
      b: { type: 'number' },
    },
  });
  const stringify = vi.spyOn(JSON, 'stringify');
  loadFieldNodeAtMount(root, { a: 1, b: 2 }, WriteOption.Overwrite);
  const selectionCalls = stringify.mock.calls.filter(
    ([value]) =>
      isArray(value) &&
      value.length === 2 &&
      (value[0] === '/a' || value[0] === '/b') &&
      value[1] === 'number',
  );
  // At most one committed declaration key is needed per child.
  expect(selectionCalls.length).toBeLessThanOrEqual(2);
  expect(root.local).toEqual({ a: 1, b: 2 });
});
