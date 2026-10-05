import { afterEach, expect, it, vi } from 'vitest';

import type { BlueprintSchema } from '../../blueprint';
import { SchemaNodeEventType } from '../../record';
import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount, writeSchemaNode } from '../index';
import * as independentDefaults from '../utils/compute/utils/hasIndependentLeafDefaults';
import { createTestTree } from './fixtures/createTestTree';
import type { PlainNode } from './fixtures/createPlainNode';

afterEach(() => vi.restoreAllMocks());

/** Capture committed observations without serializing runtime/node cycles. */
const observe = (root: PlainNode) => {
  const nodes: unknown[] = [];
  const pending = [root];
  while (pending.length) {
    const node = pending.pop()!;
    expect(node.local).toBe(node.local);
    expect(node.children).toBe(node.children);
    nodes.push({ path: node.path, raw: node.raw, extras: node.extras,
      local: node.local, emit: node.emit, required: node.required,
      active: node.active, visible: node.visible, readOnly: node.readOnly,
      disabled: node.disabled, state: node.interactionState,
      revisions: { ...node.revisionLedger }, delivery: node.pendingDelivery,
      initialized: node.deliveryInitialized, itemKey: node.itemKey });
    const children = node.children;
    for (let index = (children?.length ?? 0) - 1; index >= 0; index--)
      if (children![index].parent === node) pending.push(children![index]);
  }
  return { nodes, commit: root.runtime.commitNumber,
    diagnostics: root.runtime.diagnostics, globalState: root.runtime.globalState,
    globalCounts: [...root.runtime.globalStateCounts],
    mismatches: [...root.runtime.typeMismatchPaths],
    warnings: root.runtime.typeMismatchRecords,
    warningRecords: [...root.runtime.pendingWarningRecords ?? []],
    order: [...root.runtime.deliveries ?? []].map(node => node.path),
    snapshot: root.runtime.loadSnapshot };
};

/** Keep the oracle on the generic shape/transition path, including without v. */
const compare = (schema: BlueprintSchema, input?: unknown,
  option = SetValueOption.Overwrite) => {
  const oracle = createTestTree(schema).root;
  const actual = createTestTree(schema).root;
  const forceGeneric = vi.spyOn(independentDefaults, 'hasIndependentLeafDefaults')
    .mockReturnValue(false);
  let oracleError: unknown;
  let actualError: unknown;
  try { writeSchemaNode(oracle, input, 'load', option); }
  catch (error) { oracleError = error; }
  oracle.runtime.loadSnapshot = input;
  forceGeneric.mockRestore();
  try { loadSchemaNodeAtMount(actual, input, option); }
  catch (error) { actualError = error; }
  expect(actualError).toEqual(oracleError);
  expect(observe(actual)).toEqual(observe(oracle));
  expect(actual.runtime.commitNumber).toBe(1);
  for (const node of actual.runtime.deliveries ?? []) {
    expect(node.deliveryInitialized).toBe(true);
    expect(node.revisionLedger[SchemaNodeEventType.RequestRefresh]).toBe(1);
  }
  return { actual, oracle, actualError };
};

it('matches flat defaults, integer and escaped names, required and subsequent writes', () => {
  const { actual, oracle } = compare({ type: 'object', required: ['2'], properties: {
    'a/b': { type: 'string', default: 'a' }, '2': { type: 'number', default: 2 },
    '1': { type: 'boolean', default: false }, '~tail': { type: 'string' },
  } });
  const sibling = actual.structure!['2'];
  for (const value of ['b', 'a', 'a']) {
    writeSchemaNode(actual.structure!['a/b'], value, 'input', SetValueOption.Overwrite);
    writeSchemaNode(oracle.structure!['a/b'], value, 'input', SetValueOption.Overwrite);
    expect(observe(actual)).toEqual(observe(oracle));
    expect(actual.structure!['2']).toBe(sibling);
  }
});

it('matches nested parent/child defaults and partial input', () => {
  const schema: BlueprintSchema = { type: 'object', properties: {
    group: { type: 'object', default: { leaf: 'parent' }, properties: {
      leaf: { type: 'string', default: 'child' }, count: { type: 'number', default: 4 },
    } }, tail: { type: 'string', default: 'tail' },
  } };
  compare(schema);
  compare(schema, { group: { count: 9 } });
});

it.each([0, 1, 1000])('matches array defaults with %i items', count => {
  const { actual, actualError } = compare({ type: 'object', properties: { items: { type: 'array',
    default: Array.from({ length: count }, (_, index) => ({ value: index })),
    items: { type: 'object', properties: {
      value: { type: 'number' }, label: { type: 'string', default: 'item' },
    } },
  } } });
  expect(actualError).toBeUndefined();
  expect(actual.runtime.diagnostics).toEqual({ status: 'stable' });
  expect(actual.emit).toEqual(count === 0 ? {} : { items: Array.from({ length: count }, (_, value) => ({
    value, label: 'item',
  })) });
});

it('matches disabled automatic writes', () => {
  compare({ type: 'object', properties: {
    items: { type: 'array', default: [1], items: { type: 'number' } },
    leaf: { type: 'string', default: 'x' },
  } }, undefined, SetValueOption.DisableAutomaticWrites);
});

it('matches static references and conjunctive declarations', () => {
  compare({ type: 'object', $defs: { text: { type: 'string', default: 'ref' } },
    properties: { value: { $ref: '#/$defs/text' } },
    allOf: [{ properties: { number: { type: 'number', default: 1 } } }],
  } as BlueprintSchema);
});

it('matches explicit null, undefined and wrong-kind fallback inputs', () => {
  const schema: BlueprintSchema = { type: 'object', properties: {
    value: { type: 'number', default: 1 }, nullable: { type: ['string', 'null'] },
  } };
  compare(schema, { value: undefined, nullable: null });
  compare(schema, { value: 'not-a-number' });
  compare(schema, null);
});

it('matches dependent and control-default fallback', () => {
  compare({ type: 'object', properties: {
    source: { type: 'number', default: 1 },
    derived: { type: 'number', controls: { derived: '../source + 1' } },
    value: { type: 'string', default: 'schema', controls: { default: 'control' } },
  } });
});

it('matches gate fallback', () => {
  compare({ type: 'object', properties: {
    value: { type: 'string', default: 'x', controls: { active: 'true' } },
  } });
});

it('finishes every revision before any queued delivery can be observed', () => {
  const { actual } = compare({ type: 'object', properties: {
    first: { type: 'number', default: 1 }, last: { type: 'number', default: 2 },
  } });
  const nodes = [...actual.runtime.deliveries ?? []];
  for (const _delivery of nodes)
    for (const node of nodes) {
      expect(node.deliveryInitialized).toBe(true);
      expect(node.pendingRevision).toBe(0);
      expect(node.revisionLedger[SchemaNodeEventType.UpdateValue]).toBe(1);
    }
});
