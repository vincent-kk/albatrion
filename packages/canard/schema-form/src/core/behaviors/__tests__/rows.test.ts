import { describe, expect, it } from 'vitest';

import { blueprint } from '../../blueprint';
import type { BlueprintNode } from '../../blueprint';
import type { Behavior, SchemaNodeRecord, UnionSpec } from '../../record';
import { BEHAVIORS } from '../index';
import { booleanBehavior } from '../booleanBehavior';
import { nullBehavior } from '../nullBehavior';
import { numberBehavior } from '../numberBehavior';
import { objectBehavior } from '../objectBehavior';
import { stringBehavior } from '../stringBehavior';
import { unionBehavior } from '../unionBehavior';
import { getStaticChoices } from '../utils/options/getStaticChoices';
import { virtualBehavior } from '../virtualBehavior';

/** Stable analyzed object template for calculation-only row fixtures. */
const OBJECT_ANALYSIS = blueprint({
  type: 'object',
  properties: { first: { type: 'string' }, second: { type: 'string' } },
});
/** Object template of the row fixture's real analysis. */
const OBJECT_TEMPLATE = OBJECT_ANALYSIS.root;

/** Build a complete record with no engine instance or settlement mutation. */
const makeRecord = (
  behavior: Behavior,
  raw: unknown,
  options: Record<string, unknown> = {},
  blueprintNode: BlueprintNode = OBJECT_TEMPLATE,
): SchemaNodeRecord<unknown> => ({
  behavior,
  runtime: {
    blueprint: OBJECT_ANALYSIS,
    ifPredicates: new Map(),
    diagnostics: { status: 'stable' },
    budgets: { hostWheel: 1, transition: 1 },
    nodeFactory: () => undefined,
    loadSnapshot: undefined,
    latentRaw: new Map(),
    typeMismatchPaths: new Set(),
    inactiveValuesMemo: new Map(),
  },
  blueprintNode,
  parent: null,
  rootNode: undefined,
  name: '',
  escapedName: '',
  path: '',
  depth: 0,
  required: false,
  nullable: false,
  schemaType: blueprintNode.schemaType,
  structure: null,
  children: null,
  raw,
  extras: undefined,
  active: true,
  local: undefined,
  emit: undefined,
  schema: { schema: { options }, typeConflict: false },
  state: {},
  revision: 0,
  detached: false,
});

/** Construct the read-only scalar interpretation restriction. */
const spec = (kinds: UnionSpec['kinds']): UnionSpec => ({
  kinds,
  mask: 0,
  nullable: false,
});

describe('behavior rows', () => {
  it('TEST-069 row combinations covers every kind and strategy choice', () => {
    const types = ['string', 'number', 'boolean', 'null', 'object',
      'array', 'virtual', 'union'];
    const strategies = ['branch', 'terminal'];
    const present: string[] = [];
    for (const type of types)
      for (const strategy of strategies) {
        const row = Object.entries(BEHAVIORS).find(([kind]) => kind === type)?.[1];
        const selected = strategy === 'branch' ? row?.branch : row?.terminal;
        if (selected) present.push(`${type}.${strategy}`);
      }
    expect(present).toEqual([
      'string.terminal', 'number.terminal', 'boolean.terminal',
      'null.terminal', 'object.branch', 'object.terminal',
      'virtual.branch', 'union.terminal',
    ]);
  });

  it('shares scalar interpretation and unchanged terminal slots', () => {
    expect(stringBehavior.interpret).toBe(numberBehavior.interpret);
    expect(numberBehavior.interpret).toBe(booleanBehavior.interpret);
    expect(booleanBehavior.interpret).toBe(unionBehavior.interpret);
    expect(stringBehavior.assemble).toBe(numberBehavior.assemble);
    expect(numberBehavior.declareChildren).toBe(booleanBehavior.declareChildren);
    expect(numberBehavior.finishInput).toBe(booleanBehavior.finishInput);
    expect(numberBehavior.project).toBe(booleanBehavior.project);
    expect(nullBehavior.project).toBe(numberBehavior.project);
    expect(objectBehavior.branch.interpret).toBe(objectBehavior.terminal.interpret);
    expect(objectBehavior.branch.project).toBe(objectBehavior.terminal.project);
    expect(objectBehavior.branch.declareChildren).toBe(virtualBehavior.declareChildren);
    expect(stringBehavior.interpret(3, spec('string'))).toBe('3');
    expect(numberBehavior.interpret('12', spec('number'))).toBe(12);
    expect(booleanBehavior.interpret('false', spec('boolean'))).toBe(false);
  });

  it('separates empty string projection and trim from the raw input', () => {
    const node = makeRecord(stringBehavior, '  text  ', { trim: true });
    expect(stringBehavior.assemble(node, [])).toBe('  text  ');
    expect(stringBehavior.finishInput(node)).toBe('text');
    expect(node.raw).toBe('  text  ');
    expect(stringBehavior.project(node, '')).toBeUndefined();
    const choices = getStaticChoices(node.schema);
    expect(getStaticChoices(node.schema)).toBe(choices);
    node.schema = { schema: { options: { omitEmpty: false } }, typeConflict: false };
    expect(stringBehavior.project(node, '')).toBe('');
  });

  it('leaves null inputs and opaque union values unchanged', () => {
    const object = { nested: [1] };
    const node = makeRecord(unionBehavior, object);
    expect(nullBehavior.interpret(object, spec('number'))).toBe(object);
    expect(unionBehavior.interpret(object, spec(['object', 'string']))).toBe(object);
    expect(unionBehavior.assemble(node, [])).toBe(object);
    expect(unionBehavior.project(node, object)).toBe(object);
    expect(unionBehavior.finishInput(makeRecord(unionBehavior, '  a ', { trim: true })))
      .toBe('a');
  });

  it('assembles virtual sibling values but emits no virtual field', () => {
    const node = makeRecord(virtualBehavior, undefined);
    const first = { value: 1 };
    const second = { value: 'two' };
    const tuple = virtualBehavior.assemble(node, [first, second]);
    expect(tuple).toEqual([1, 'two']);
    node.local = tuple;
    expect(virtualBehavior.assemble(node, [first, second])).toBe(tuple);
    expect(virtualBehavior.project(node, tuple)).toBeUndefined();
    expect(virtualBehavior.declareChildren(node)).toBe(node.blueprintNode.childEntries);
  });

  it('preserves terminal object identity and omits only an empty object', () => {
    const object = { first: 1 };
    const node = makeRecord(objectBehavior.terminal, object);
    expect(objectBehavior.terminal.assemble(node, [])).toBe(object);
    expect(objectBehavior.terminal.project(node, object)).toBe(object);
    expect(objectBehavior.terminal.declareChildren(node)).toEqual([]);
    expect(objectBehavior.terminal.project(node, {})).toBeUndefined();
  });

  it('returns static and gated blueprint child declarations without evaluating gates', () => {
    const template = blueprint({
      type: 'object',
      properties: { always: { type: 'string' } },
      if: { required: ['flag'] },
      then: { properties: { conditional: { type: 'number' } } },
    }).root;
    const node = makeRecord(objectBehavior.branch, {}, {}, template);
    const declared = objectBehavior.branch.declareChildren(node);
    expect(declared).toBe(template.childEntries);
    expect(declared.map((entry) => entry.name)).toEqual(['always', 'conditional']);
    expect(declared.some((entry) =>
      entry.declarations.some((declaration) => declaration.gates.length > 0),
    )).toBe(true);
  });

  it('assembles current object children in preferred, declaration, extras order', () => {
    const node = makeRecord(objectBehavior.branch, undefined, {
      propertyKeys: ['second'],
    });
    const children = [{ name: 'first', emit: 1 }, { name: 'second', emit: 2 }];
    node.extras = { other: 3 };
    const local = objectBehavior.branch.assemble(node, children);
    if (local === null || typeof local !== 'object') throw new Error('object assembly returned a scalar');
    expect(Object.keys(local)).toEqual(['second', 'first', 'other']);
    expect(local).toEqual({ second: 2, first: 1, other: 3 });
    node.local = local;
    expect(objectBehavior.branch.assemble(node, children)).toBe(local);
    children[0].emit = 4;
    const changed = objectBehavior.branch.assemble(node, children);
    expect(changed).not.toBe(local);
    expect(changed).toEqual({ second: 2, first: 4, other: 3 });
    node.local = changed;
    node.extras = { other: 3, last: 5 };
    const expanded = objectBehavior.branch.assemble(node, children);
    if (expanded === null || typeof expanded !== 'object') throw new Error('object assembly returned a scalar');
    expect(Object.keys(expanded)).toEqual([
      'second', 'first', 'other', 'last',
    ]);
  });
});
