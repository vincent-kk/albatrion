import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import type { BlueprintOptions, BlueprintSchema } from '../../blueprint';
import { dispatchMount, dispatchSetValue, subscribeSchemaNode } from '../../dispatch';
import { SchemaNodeEventType } from '../../record';
import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount, writeSchemaNode } from '../index';
import * as independentDefaults from '../utils/compute/utils/hasIndependentLeafDefaults';
import * as staticFirstLoad from '../utils/load/canLoadStaticFirstTree';
import { createTestTree } from './fixtures/createTestTree';
import type { PlainNode } from './fixtures/createPlainNode';

afterEach(() => vi.restoreAllMocks());
const genericFirstLoad = process.env.STATIC_FIRST_LOAD_GENERIC === '1';
beforeEach(() => {
  if (genericFirstLoad)
    vi.spyOn(staticFirstLoad, 'canLoadStaticFirstTree').mockReturnValue(false);
});

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
    snapshot: root.runtime.loadSnapshot,
    trace: root.runtime.settlementTrace,
    refresh: [...root.runtime.refreshTargets ?? []],
    errors: [...root.runtime.combinedErrors ?? []],
    globalErrors: root.runtime.globalErrors,
    nonSettle: root.pendingNonSettleDelivery };
};

/** Keep the oracle on the generic shape/transition path, including without v. */
const compare = (schema: BlueprintSchema, input?: unknown,
  option = SetValueOption.Overwrite, options: BlueprintOptions = {}) => {
  const oracle = createTestTree(schema, undefined, options).root;
  const actual = createTestTree(schema, undefined, options).root;
  const eligible = staticFirstLoad.canLoadStaticFirstTree(actual, input);
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
  return { actual, oracle, actualError, eligible };
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
  const { actual, actualError, eligible } = compare({ type: 'object', properties: { items: { type: 'array',
    default: Array.from({ length: count }, (_, index) => ({ value: index })),
    items: { type: 'object', properties: {
      value: { type: 'number' }, label: { type: 'string', default: 'item' },
    } },
  } } });
  expect(actualError).toBeUndefined();
  expect(eligible).toBe(!genericFirstLoad);
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

it('matches root container defaults, empty distributed objects, tuple tails and extras', () => {
  compare({ type: 'object', default: { group: {}, extra: 'retained' }, properties: {
    group: { type: 'object', default: { child: 'parent' }, properties: {
      child: { type: 'string', default: 'child' },
    } }, tuple: { type: 'array', default: [1, 'tail', true],
      prefixItems: [{ type: 'number' }], items: false },
  } });
});

it('matches literal null and wrong-kind defaults with ordered warning records', () => {
  compare({ type: 'object', properties: {
    nullable: { type: ['string', 'null'], default: null },
    first: { type: 'number', default: 'wrong' },
    last: { type: 'boolean', default: { nested: 'wrong' } },
  } });
});

it.each([
  ['control-default', { default: 'control' }],
  ['undefined-control-default', { default: undefined }],
  ['unset', { unsetValue: 'true' }],
  ['inject', { injectTo: () => '/target' }],
  ['watch', { watch: ['../target'] }],
  ['state-expression', { visible: 'true' }],
] as const)('matches %s fallback without spending an extra commit', (_name, controls) => {
  const { eligible } = compare({ type: 'object', properties: {
    target: { type: 'string', default: 'target' },
    value: { type: 'string', default: 'schema', controls },
  } });
  expect(eligible).toBe(false);
});

it('matches virtual and whole-value fallback', () => {
  compare({ type: 'object', properties: { value: { type: 'string', default: 'x' } },
    options: { virtual: { combined: { fields: ['value'] } } } });
  compare({ type: 'object', default: { value: 'whole' } }, undefined,
    SetValueOption.Overwrite, { isTerminal: () => true });
});

it('matches finite recursive-array fallback and retains stable diagnostics', () => {
  const { actualError } = compare({ type: 'object', $defs: {
    branch: { type: 'object', properties: { children: {
      type: 'array', default: [], items: { $ref: '#/$defs/branch' },
    } } },
  }, properties: { tree: { $ref: '#/$defs/branch' } } });
  expect(actualError).toBeUndefined();
});

it('does not expose intermediate values to a synchronous reporter during first load', () => {
  const { root } = createTestTree({ type: 'object', properties: {
    group: { type: 'object', properties: { mismatch: { type: 'number', default: 'bad' } } },
    tail: { type: 'number', default: 2 },
  } });
  const observed: unknown[] = [];
  const report = vi.fn(() => observed.push({ value: root.local,
    commit: root.runtime.commitNumber, revisions: root.revisionLedger }));
  root.runtime.errorReporter = { hasConsumer: () => true, report };
  const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  loadSchemaNodeAtMount(root, undefined, SetValueOption.Overwrite);
  expect(report).not.toHaveBeenCalled();
  expect(warning).not.toHaveBeenCalled();
  expect(observed).toEqual([]);
  expect(root.local).toEqual({ group: { mismatch: 'bad' }, tail: 2 });
  expect([...root.runtime.pendingWarningRecords?.values() ?? []].map(record => record.path))
    .toEqual(['/group/mismatch']);
});

it('delivers the same listener payloads after all nodes and global state are final', () => {
  const schema: BlueprintSchema = { type: 'object', properties: {
    '2': { type: 'number', default: 2 }, '1': { type: 'number', default: 1 },
    nested: { type: 'object', properties: { leaf: { type: 'string', default: 'leaf' } } },
  } };
  const run = (generic: boolean) => {
    const { root } = createTestTree(schema);
    root.runtime.validationMode = 0;
    root.interactionState = { touched: true };
    const delivered: unknown[] = [];
    const listen = (node: PlainNode) => subscribeSchemaNode(node, event => {
      const pending = root.runtime.commitNumber === 1 ? [root] : [];
      while (pending.length) {
        const current = pending.pop()!;
        expect(current.deliveryInitialized).toBe(true);
        expect(current.pendingRevision).toBe(0);
        expect(current.revisionLedger[SchemaNodeEventType.RequestRefresh]).toBe(1);
        for (const child of current.children ?? []) pending.push(child);
      }
      expect(root.runtime.globalState).toEqual({ touched: true });
      delivered.push({ path: node.path, event });
    });
    listen(root);
    const factory = root.runtime.nodeFactory;
    root.runtime.nodeFactory = (entry, parent, runtime) => {
      const node = factory(entry, parent, runtime);
      listen(node);
      return node;
    };
    const forceGeneric = generic ? vi.spyOn(independentDefaults,
      'hasIndependentLeafDefaults').mockReturnValue(false) : undefined;
    const forceStaticGeneric = generic ? vi.spyOn(staticFirstLoad,
      'canLoadStaticFirstTree').mockReturnValue(false) : undefined;
    dispatchMount(root, undefined, SetValueOption.Overwrite, { deferValidation: true });
    forceGeneric?.mockRestore();
    forceStaticGeneric?.mockRestore();
    for (const value of ['again', 'leaf', 'leaf'])
      dispatchSetValue(root.structure!.nested.structure!.leaf, value, SetValueOption.Overwrite);
    return { delivered, observations: observe(root) };
  };
  expect(run(false)).toEqual(run(true));
});
