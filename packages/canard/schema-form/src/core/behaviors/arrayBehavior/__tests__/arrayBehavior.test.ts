import { describe, expect, it } from 'vitest';
import { isArray } from '@winglet/common-utils/filter';

import { SchemaFormError } from '../../../../errors';
import { blueprint } from '../../../blueprint';
import type { BlueprintNode } from '../../../blueprint';
import type { ArrayOperation, Behavior, SchemaNodeRecord } from '../../../record';
import { BEHAVIORS } from '../../index';
import { arrayBehavior } from '../index';

/** Make a calculation record without constructing or settling child nodes. */
const makeRecord = (
  behavior: Behavior,
  template: BlueprintNode,
  raw: unknown = undefined,
  options: Record<string, unknown> = {},
): SchemaNodeRecord<unknown> => ({
  behavior,
  runtime: {
    blueprint: blueprint({ type: 'array' }), ifPredicates: new Map(),
    diagnostics: { status: 'stable' }, nodeFactory: () => undefined,
    loadSnapshot: undefined, latentRaw: new Map(),
    typeMismatchPaths: new Set(), inactiveValuesMemo: new Map(),
  },
  blueprintNode: template, parent: null, rootNode: undefined,
  name: '', escapedName: '', path: '/list', depth: 0,
  required: false, nullable: false, schemaType: template.schemaType,
  structure: null, children: null, itemKey: null, itemCount: 0, nextItemKey: 0,
  raw, extras: undefined, active: true, visible: true, readOnly: false,
  disabled: false, local: undefined, emit: undefined,
  schema: { schema: { options }, typeConflict: false },
  state: {}, revision: 0, detached: false,
});

// filid:contract array-branch
describe('array branch calculation', () => {
  it('NODE-052 declares positions with templates and reuses their entries', () => {
    const template = blueprint({ type: 'array', prefixItems: [
      { type: 'string' }, { type: 'number' },
    ], items: false }).root;
    const node = makeRecord(arrayBehavior.branch, template);
    node.itemCount = 4;
    const first = arrayBehavior.branch.declareChildren(node);
    expect(first.map((entry) => entry.name)).toEqual(['0', '1']);
    expect(arrayBehavior.branch.declareChildren(node)).toBe(first);
    const other = makeRecord(arrayBehavior.branch, template);
    other.itemCount = 1;
    expect(arrayBehavior.branch.declareChildren(other).map((entry) => entry.name))
      .toEqual(['0']);
    const again = arrayBehavior.branch.declareChildren(node);
    expect(again).toEqual(first);
    again.forEach((entry, index) => expect(entry).toBe(first[index]));
    node.itemCount = 0;
    expect(arrayBehavior.branch.declareChildren(node)).toBe(
      arrayBehavior.branch.declareChildren(node));
  });

  it('VALUE-034 fills absent object, array, and leaf emissions by kind', () => {
    const template = blueprint({ type: 'array', prefixItems: [
      { type: 'object' }, { type: 'array' }, { type: 'string' },
    ], items: false }).root;
    const node = makeRecord(arrayBehavior.branch, template);
    node.itemCount = 3;
    expect(arrayBehavior.branch.assemble(node, [])).toEqual([{}, [], null]);
    expect(arrayBehavior.branch.interpret([1], { kinds: 'array', mask: 0,
      nullable: false })).toEqual([1]);
    const wrong = { unexpected: true };
    expect(arrayBehavior.branch.interpret(wrong, { kinds: 'array', mask: 0,
      nullable: false })).toBe(wrong);
  });

  it('VALUE-037 fills a union leaf whose empty object emitted nothing with null', () => {
    const template = blueprint({ type: 'array', items: {
      type: ['object', 'string'],
    } }).root;
    const node = makeRecord(arrayBehavior.branch, template);
    node.itemCount = 1;
    node.structure = { '0': { emit: undefined } };
    expect(arrayBehavior.branch.assemble(node, [])).toEqual([null]);
  });

  it('NODE-052 appends blueprint-less extras after declared positions', () => {
    const template = blueprint({ type: 'array', prefixItems: [
      { type: 'string' },
    ], items: false }).root;
    const node = makeRecord(arrayBehavior.branch, template);
    node.itemCount = 3;
    node.structure = { '0': { emit: 'first' } };
    node.extras = ['second', 'third'];
    const local = arrayBehavior.branch.assemble(node, []);
    expect(local).toEqual(['first', 'second', 'third']);
    node.local = local;
    expect(arrayBehavior.branch.assemble(node, [])).toBe(local);
  });

  it('LANDING-085 trims trailing holes and empty output without mutation', () => {
    const template = blueprint({ type: 'array', items: { type: 'string' } }).root;
    const node = makeRecord(arrayBehavior.branch, template,
      undefined, { omitTrailing: true });
    node.itemCount = 3;
    node.structure = { '0': { emit: 'kept' }, '1': { emit: null } };
    const local = arrayBehavior.branch.assemble(node, []);
    expect(local).toEqual(['kept', null, null]);
    const projected = arrayBehavior.branch.project(node, local);
    expect(projected).toEqual(['kept']);
    expect(arrayBehavior.branch.project(node, local)).toBe(projected);
    expect(local).toEqual(['kept', null, null]);
    node.structure = null;
    node.itemCount = 0;
    expect(arrayBehavior.branch.project(node, [])).toBeUndefined();
    node.schema = { schema: { options: { omitEmpty: false } },
      typeConflict: false };
    expect(arrayBehavior.branch.project(node, [])).toEqual([]);
    node.raw = { wrong: true };
    expect(arrayBehavior.branch.project(node, ['kept'])).toBeUndefined();
  });

  it('VALUE-034 keeps an emitted object before omitted host holes and tail nulls', () => {
    const template = blueprint({ type: 'array', prefixItems: [
      { type: 'object' }, { type: 'array' },
    ], items: false }).root;
    const node = makeRecord(arrayBehavior.branch, template,
      undefined, { omitTrailing: true });
    node.itemCount = 4;
    const emitted = {};
    node.structure = { '0': { emit: emitted } };
    node.extras = [null, undefined];
    const local = arrayBehavior.branch.assemble(node, []);
    expect(local).toEqual([{}, [], null, undefined]);
    const projected = arrayBehavior.branch.project(node, local);
    expect(projected).toEqual([{}]);
    if (isArray(projected)) expect(projected[0]).toBe(emitted);
    expect(local).toEqual([{}, [], null, undefined]);
  });

  it('NODE-005 plans branch push, pop, remove, update, and clear', () => {
    const node = makeRecord(arrayBehavior.branch,
      blueprint({ type: 'array', items: { type: 'string' } }).root);
    node.itemCount = 3;
    expect(arrayBehavior.branch.arrange(node, { kind: 'push', value: 'x' }))
      .toEqual({ kind: 'slots', slots: [{ from: 0 }, { from: 1 },
        { from: 2 }, { value: 'x' }], result: { source: 'length' } });
    expect(arrayBehavior.branch.arrange(node, { kind: 'pop' }))
      .toEqual({ kind: 'slots', slots: [{ from: 0 }, { from: 1 }],
        result: { source: 'removed', index: 2 } });
    expect(arrayBehavior.branch.arrange(node, { kind: 'remove', index: 1 }))
      .toEqual({ kind: 'slots', slots: [{ from: 0 }, { from: 2 }],
        result: { source: 'removed', index: 1 } });
    expect(arrayBehavior.branch.arrange(node, { kind: 'update', index: 1,
      value: 'y' })).toEqual({ kind: 'update', index: 1, value: 'y' });
    expect(arrayBehavior.branch.arrange(node, { kind: 'clear' }))
      .toEqual({ kind: 'slots', slots: [], result: { source: 'void' } });
  });

  it('35C-06 returns noop for invalid positions, empty, and null raw', () => {
    for (const row of [arrayBehavior.branch, arrayBehavior.terminal]) {
      const node = makeRecord(row,
        blueprint({ type: 'array', items: { type: 'string' } }).root,
        row.strategy === 'terminal' ? [] : undefined);
      expect(row.arrange(node, { kind: 'pop' })).toEqual({ kind: 'noop' });
      expect(row.arrange(node, { kind: 'clear' })).toEqual({ kind: 'noop' });
      for (const index of [-1, 0, 1.5]) {
        expect(row.arrange(node, { kind: 'remove', index })).toEqual({ kind: 'noop' });
        expect(row.arrange(node, { kind: 'update', index, value: 'x' }))
          .toEqual({ kind: 'noop' });
      }
    node.raw = null;
      for (const operation of [
        { kind: 'push', value: 'x' }, { kind: 'pop' },
        { kind: 'update', index: 0, value: 'x' },
        { kind: 'remove', index: 0 }, { kind: 'clear' },
      ] as const)
        expect(row.arrange(node, operation)).toEqual({ kind: 'noop' });
    }
  });
});

// filid:contract array-terminal
describe('array terminal calculation', () => {
  it('35C-12 retains raw identity and copies it for every valid change', () => {
    const raw = ['a', 'b', 'c'];
    const node = makeRecord(arrayBehavior.terminal,
      blueprint({ type: 'array' }).root, raw);
    expect(arrayBehavior.terminal.assemble(node, [])).toBe(raw);
    const operations: readonly ArrayOperation[] = [
      { kind: 'push', value: 'd' }, { kind: 'pop' },
      { kind: 'remove', index: 1 }, { kind: 'update', index: 1, value: 'x' },
      { kind: 'clear' },
    ];
    const expected = [
      ['a', 'b', 'c', 'd'], ['a', 'b'], ['a', 'c'], ['a', 'x', 'c'], [],
    ];
    operations.forEach((operation, index) => {
      const plan = arrayBehavior.terminal.arrange(node, operation);
      expect(plan.kind).toBe('raw');
      if (plan.kind === 'raw') {
        expect(plan.raw).toEqual(expected[index]);
        expect(plan.raw).not.toBe(raw);
      }
    });
    expect(raw).toEqual(['a', 'b', 'c']);
    expect(arrayBehavior.terminal.arrange(node, { kind: 'update', index: 1, value: 'x' }))
      .toMatchObject({ result: { source: 'updated', index: 1 } });
    node.raw = undefined;
    expect(arrayBehavior.terminal.arrange(node, { kind: 'push', value: 'x' }))
      .toEqual({ kind: 'raw', raw: ['x'], result: { source: 'length' } });
    expect(arrayBehavior.terminal.arrange(node, { kind: 'pop' }))
      .toEqual({ kind: 'noop' });
    expect(arrayBehavior.terminal.arrange(node, { kind: 'remove', index: 0 }))
      .toEqual({ kind: 'noop' });
    expect(arrayBehavior.terminal.arrange(node, { kind: 'update', index: 0,
      value: 'x' })).toEqual({ kind: 'noop' });
  });

  it('LANDING-085 projects trailing nullish values without changing raw', () => {
    const raw = ['kept', null, undefined];
    const node = makeRecord(arrayBehavior.terminal,
      blueprint({ type: 'array' }).root, raw, { omitTrailing: true });
    const projected = arrayBehavior.terminal.project(node, raw);
    expect(projected).toEqual(['kept']);
    expect(arrayBehavior.terminal.project(node, raw)).toBe(projected);
    expect(raw).toEqual(['kept', null, undefined]);
    node.schema = { schema: { options: { omitTrailing: false } },
      typeConflict: false };
    expect(arrayBehavior.terminal.project(node, raw)).toBe(raw);
    node.raw = 3;
    expect(arrayBehavior.terminal.project(node, raw)).toBeUndefined();
  });
});

// filid:contract array-arrange
describe('non-array arrangement', () => {
  it('NODE-014 ERROR-197 rejects five verbs on every non-array row with path and method', () => {
    const operations: readonly ArrayOperation[] = [
      { kind: 'push', value: 1 }, { kind: 'pop' },
      { kind: 'update', index: 0, value: 1 },
      { kind: 'remove', index: 0 }, { kind: 'clear' },
    ];
    for (const row of Object.values(BEHAVIORS).flatMap(Object.values)) {
      if (row.type === 'array') continue;
      const node = makeRecord(row, blueprint({ type: 'array' }).root);
      for (const operation of operations) {
        expect(() => row.arrange(node, operation)).toThrow(SchemaFormError);
        expect(() => row.arrange(node, operation)).toThrowError(
          expect.objectContaining({ code: 'SCHEMA_FORM_ERROR.ARRAY_METHOD_ON_NON_ARRAY',
            details: { path: '/list', method: operation.kind } }));
      }
    }
  });
});
