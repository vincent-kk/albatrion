import { afterEach, expect, it, vi } from 'vitest';
import { isArray } from '@winglet/common-utils/filter';

import { SchemaNodeEventType } from '../../record';
import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount, writeSchemaNode } from '../index';
import { createTestTree } from './fixtures/createTestTree';
import { readDefault } from '../utils/transition/readDefault';
import { markCommitDeliveries } from '../utils/commit/markCommitDeliveries';
import { createSettlementContext } from '../utils/settlement/createSettlementContext';
import { getSettlementScratch } from '../utils/write/getSettlementScratch';

afterEach(() => vi.restoreAllMocks());

it('assembles independent leaf defaults once while keeping authored and delivery order', () => {
  const { root, visits } = createTestTree({ type: 'object', properties: {
    nested: { type: 'object', properties: {
      b: { type: 'number', default: 2 }, a: { type: 'string', default: 'a' },
    } }, last: { type: 'boolean', default: false },
  } });
  loadSchemaNodeAtMount(root, undefined, SetValueOption.Overwrite);
  expect(root.local).toEqual({ nested: { b: 2, a: 'a' }, last: false });
  expect(root.local).toBe(root.emit);
  expect([...root.runtime.deliveries ?? []].map(node => node.path))
    .toEqual(['', '/nested', '/nested/b', '/nested/a', '/last']);
  expect(root.runtime.typeMismatchRecords).toEqual([]);
  expect(visits.filter(path => !path.startsWith('select:')))
    .toEqual(['/nested/b', '/nested/a', '/nested', '/last', '']);
});

it('preserves input priority, container defaults, suppression and dependent defaults', () => {
  const scalar = createTestTree({ type: 'string', default: 'scalar' }).root;
  loadSchemaNodeAtMount(scalar, undefined, SetValueOption.Overwrite);
  expect(scalar.local).toBe('scalar');
  const schema = { type: 'object' as const, properties: {
    a: { type: 'number' as const, default: 1 },
    group: { type: 'object' as const, default: { b: 'container' }, properties: {
      b: { type: 'string' as const, default: 'leaf' },
    } },
  } };
  const { root } = createTestTree(schema);
  loadSchemaNodeAtMount(root, { a: 9 }, SetValueOption.Overwrite);
  expect(root.local).toEqual({ a: 9, group: { b: 'container' } });
  const suppressed = createTestTree(schema).root;
  loadSchemaNodeAtMount(suppressed, undefined, SetValueOption.DisableAutomaticWrites);
  expect(suppressed.structure!.a.local).toBeUndefined();
  expect(suppressed.structure!.group.structure!.b.local).toBeUndefined();
  const dependent = createTestTree({ type: 'object', properties: {
    a: { type: 'number', default: 1 },
    b: { type: 'number', controls: { derived: '../a + 1' } },
  } }).root;
  loadSchemaNodeAtMount(dependent, undefined, SetValueOption.Overwrite);
  expect(dependent.local).toEqual({ a: 1, b: 2 });
});

it('allocates no automatic, departing or duplicate ordered set for an empty delivery commit', () => {
  const { root } = createTestTree({ type: 'string' });
  loadSchemaNodeAtMount(root, 'same', SetValueOption.Overwrite);
  root.pendingDelivery = undefined;
  root.runtime.deliveries?.clear();
  const revision = root.revisionLedger;
  const context = createSettlementContext(root, 'input', SetValueOption.Overwrite,
    getSettlementScratch(root.runtime));
  let allocations = 0;
  const NativeSet = Set;
  class CountedSet<T> extends NativeSet<T> {
    constructor(values?: Iterable<T> | null) {
      super(values);
      allocations++;
    }
  }
  vi.stubGlobal('Set', CountedSet);
  try { markCommitDeliveries(context); }
  finally { vi.unstubAllGlobals(); }
  expect(allocations).toBeLessThanOrEqual(3);
  expect(root.revisionLedger).toBe(revision);
  expect(root.pendingDelivery).toBeUndefined();
});

it('shares ungated declarations without building an occurrence path index', () => {
  const { root } = createTestTree({ type: 'object', properties: {
    items: { type: 'array', items: { type: 'string', default: 'fallback' } },
    value: { type: 'string', controls: { default: 'control' }, default: 'schema' },
  } });
  loadSchemaNodeAtMount(root, { items: ['a', 'b'] }, SetValueOption.Overwrite);
  expect(root.local).toEqual({ items: ['a', 'b'], value: 'control' });
  expect(readDefault(root.structure!.value, new Map())).toBe('control');
  expect(readDefault(root.structure!.items.children![1], new Map())).toBe('fallback');
  expect(root.runtime.committedDeclarationIds?.size ?? 0).toBe(0);
  writeSchemaNode(root.structure!.value, 'next', 'input', SetValueOption.Overwrite);
  expect(readDefault(root.structure!.value, new Map())).toBe('control');
  expect(root.runtime.committedDeclarationIds?.size ?? 0).toBe(0);
});

it('keeps static nodes, property order, defaults, references and unsubscribed revisions', () => {
  const { root } = createTestTree({ type: 'object', properties: {
    'a/b': { type: 'number', default: 7 },
    group: { type: 'object', properties: { leaf: { type: 'string', default: 'x' } } },
  } });
  loadSchemaNodeAtMount(root, undefined, SetValueOption.Overwrite);
  expect(root.local).toEqual({ 'a/b': 7, group: { leaf: 'x' } });
  expect(root.children?.map(node => node.name)).toEqual(['a/b', 'group']);
  const child = root.structure!['a/b'];
  expect(child.path).toBe('/a~1b');
  const value = root.local;
  const children = root.children;
  const revision = child.revisionLedger[SchemaNodeEventType.UpdateValue];
  writeSchemaNode(child, 7, 'input', SetValueOption.Overwrite);
  expect(root.local).toBe(value);
  expect(root.children).toBe(children);
  writeSchemaNode(child, 8, 'input', SetValueOption.Overwrite);
  expect(child.revisionLedger[SchemaNodeEventType.UpdateValue]).toBe(revision + 1);
  expect(root.structure!['a/b']).toBe(child);
});

it('does not serialize empty pending-exit and latent lookups during static selection', () => {
  const { root } = createTestTree({ type: 'object', properties: {
    a: { type: 'number' }, b: { type: 'number' },
  } });
  const stringify = vi.spyOn(JSON, 'stringify');
  loadSchemaNodeAtMount(root, { a: 1, b: 2 }, SetValueOption.Overwrite);
  const selectionCalls = stringify.mock.calls.filter(([value]) =>
    isArray(value) && value.length === 2 &&
    (value[0] === '/a' || value[0] === '/b') && value[1] === 'number');
  // At most one committed declaration key is needed per child.
  expect(selectionCalls.length).toBeLessThanOrEqual(2);
  expect(root.local).toEqual({ a: 1, b: 2 });
});
