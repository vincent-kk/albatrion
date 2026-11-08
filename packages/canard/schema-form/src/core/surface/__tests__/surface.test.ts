import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import type { BlueprintSchema } from '@/schema-form/core/engine';
import { PathKeyedSet, blueprint } from '@/schema-form/core/engine';

import { FieldNode as RuntimeFieldNode } from '../runtime/FieldNode';
import { fieldNodeFactory } from '../utils/fieldNodeFactory';
import {
  isArrayNode,
  isFieldNode,
  isObjectNode,
  isTerminalNode,
} from '../utils/guards';

/** Create a tree with only the genuine PR-2 runtime inputs. */
const makeTree = (schema: BlueprintSchema, snapshot: unknown = undefined) =>
  fieldNodeFactory(blueprint(schema), {
    diagnostics: { status: 'stable' },
    loadSnapshot: snapshot,

    misfitPaths: new PathKeyedSet(),
  });

describe('FieldNode PR-2 surface', () => {
  it('26C-01 surface-members preserves runtime names and descriptors', () => {
    const detail = readFileSync(
      new URL('../DETAIL.md', import.meta.url),
      'utf8',
    );
    expect(detail).toMatch(/^### surface-members —/m);
    const rows = [
      { name: 'type', kind: 'getter' },
      { name: 'strategy', kind: 'getter' },
      { name: 'schemaType', kind: 'getter' },
      { name: 'jsonSchema', kind: 'getter' },
      { name: 'isRequired', kind: 'getter' },
      { name: 'nullable', kind: 'getter' },
      { name: 'depth', kind: 'getter' },
      { name: 'isRoot', kind: 'getter' },
      { name: 'rootNode', kind: 'getter' },
      { name: 'parentNode', kind: 'getter' },
      { name: 'name', kind: 'getter' },
      { name: 'escapedName', kind: 'getter' },
      { name: 'path', kind: 'getter' },
      { name: 'children', kind: 'getter' },
      { name: 'source', kind: 'getter' },
      { name: 'extras', kind: 'getter' },
      { name: 'value', kind: 'getter' },
      { name: 'outputValue', kind: 'getter' },
      { name: 'inactiveValues', kind: 'getter' },
      { name: 'isActive', kind: 'getter' },
      { name: 'isVisible', kind: 'getter' },
      { name: 'isPresent', kind: 'getter' },
      { name: 'isReadOnly', kind: 'getter' },
      { name: 'isDisabled', kind: 'getter' },
      { name: 'watchValues', kind: 'getter' },
      { name: 'context', kind: 'getter' },
      { name: 'isMisfit', kind: 'getter' },
      { name: 'misfits', kind: 'getter' },
      { name: 'diagnostics', kind: 'getter' },
      { name: 'defaultValue', kind: 'getter' },
      { name: 'find', kind: 'method' },
      { name: 'findNodes', kind: 'method' },
      { name: 'visitSubtree', kind: 'method' },
      { name: 'setValue', kind: 'method' },
      { name: 'push', kind: 'method' },
      { name: 'pop', kind: 'method' },
      { name: 'update', kind: 'method' },
      { name: 'remove', kind: 'method' },
      { name: 'insert', kind: 'method' },
      { name: 'clear', kind: 'method' },
      { name: 'resetSubtree', kind: 'method' },
      { name: 'request', kind: 'method' },
      { name: 'onInactive', kind: 'method' },
      { name: 'subscribe', kind: 'method' },
      { name: 'revision', kind: 'method' },
      { name: 'validate', kind: 'method' },
      { name: 'errors', kind: 'getter' },
      { name: 'setExternalErrors', kind: 'method' },
      { name: 'clearExternalErrors', kind: 'method' },
      { name: 'state', kind: 'getter/setter' },
      { name: 'isEdited', kind: 'getter' },
      { name: 'isTouched', kind: 'getter' },
      { name: 'isDivergent', kind: 'getter' },
      { name: 'setState', kind: 'method' },
      { name: 'globalState', kind: 'getter' },
      { name: 'globalErrors', kind: 'getter' },
      { name: 'setSubtreeState', kind: 'method' },
      { name: 'clearSubtreeState', kind: 'method' },
      { name: 'batch', kind: 'method' },
    ];
    expect(rows).toHaveLength(59);
    const prototype = RuntimeFieldNode.prototype;
    expect(
      Object.getOwnPropertyNames(prototype)
        .filter((name) => name !== 'constructor')
        .sort(),
    ).toEqual(rows.map((row) => row.name).sort());
    for (const row of rows) {
      const descriptor = Object.getOwnPropertyDescriptor(prototype, row.name);
      expect(
        typeof (row.kind.startsWith('getter')
          ? descriptor?.get
          : descriptor?.value),
      ).toBe('function');
      if (row.kind === 'getter/setter')
        expect(typeof descriptor?.set).toBe('function');
    }
  });

  it('28C-02 enabled is active and visible, regardless of disabled', () => {
    const root = makeTree({
      type: 'object',
      properties: {
        shown: { type: 'boolean' },
        target: {
          type: 'string',
          controls: {
            active: '../shown',
            visible: true,
            disabled: true,
          },
        },
        hidden: { type: 'string', controls: { visible: false } },
      },
    });
    root.setValue({ shown: true, target: 'value', hidden: 'hidden' });
    const target = root.find('/target');
    expect(target?.isPresent).toBe(true);
    expect(target?.isDisabled).toBe(true);
    expect(root.find('/hidden')?.isPresent).toBe(false);
    root.find('/shown')?.setValue(false);
    expect(target?.isActive).toBe(false);
    expect(target?.isVisible).toBe(true);
    expect(target?.isPresent).toBe(false);
  });

  it('TEST-069 active getter reads the settled node gate', () => {
    const root = makeTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        target: { type: 'string', controls: { active: '../flag' } },
      },
    });
    root.setValue({ flag: true, target: 'shown' });
    const target = root.find('/target');
    expect(target?.isActive).toBe(true);
    expect(root.find('/flag')?.isActive).toBe(true);
    expect(isFieldNode(target)).toBe(true);
    root.find('/flag')?.setValue(false);
    expect(root.find('/target')).toBeNull();
    expect(target?.isActive).toBe(false);
    expect(target?.value).toBe('shown');
    root.find('/flag')?.setValue(true);
    expect(root.find('/target')).not.toBe(target);
    expect(root.find('/target')?.isActive).toBe(true);
    expect(target?.isActive).toBe(false);
  });

  it('children returns the exact stored array reference', () => {
    const root = makeTree({
      type: 'object',
      properties: {
        first: { type: 'string' },
        second: { type: 'number' },
      },
    });
    root.setValue({ first: 'one', second: 2 });
    expect(root.children).toBe(Reflect.get(root, 'storedChildren'));
    expect(root.children).toEqual([root.find('/first'), root.find('/second')]);
  });

  it('TEST-070 26C-01 returns the stored array children by reference', () => {
    const root = makeTree({ type: 'array', items: { type: 'string' } });
    root.setValue(['a']);
    expect(root.children).toBe(Reflect.get(root, 'storedChildren'));
  });

  it('SURFACE-005 GOAL-058 delegates synchronous verbs and ERROR-197 rejects strings', () => {
    const array = makeTree({ type: 'array', items: { type: 'string' } });
    if (!isArrayNode(array)) throw new Error('Expected an array node');
    expect(array.push('x')).toBe(1);
    expect(array.update(0, 'y')).toBe('y');
    expect(array.remove(0)).toBe('y');
    expect(array.push('z')).toBe(1);
    expect(array.pop()).toBe('z');
    expect(array.clear()).toBeUndefined();
    const string = makeTree({ type: 'string' });
    expect(() => Reflect.get(string, 'push').call(string, 'x')).toThrowError(
      expect.objectContaining({
        code: 'SCHEMA_FORM_ERROR.ARRAY_METHOD_ON_NON_ARRAY',
        details: { path: '', method: 'push' },
      }),
    );
  });

  it('SURFACE-005 delegates insert synchronously and ERROR-197 names insert on strings', () => {
    const array = makeTree({ type: 'array', items: { type: 'string' } });
    if (!isArrayNode(array)) throw new Error('Expected an array node');
    expect(array.push('a')).toBe(1);
    expect(array.insert(0, 'x')).toBe(2);
    expect(array.insert(2, 'y')).toBe(3);
    expect(array.insert(5, 'z')).toBe(3);
    expect(array.value).toEqual(['x', 'a', 'y']);
    const string = makeTree({ type: 'string' });
    expect(() =>
      Reflect.get(string, 'insert').call(string, 0, 'x'),
    ).toThrowError(
      expect.objectContaining({
        code: 'SCHEMA_FORM_ERROR.ARRAY_METHOD_ON_NON_ARRAY',
        details: { path: '', method: 'insert' },
      }),
    );
  });

  it('TEST-069 isTerminalNode object includes terminal object nodes', () => {
    const root = makeTree({ type: 'object', options: { terminal: true } });
    root.setValue({ retained: true });
    expect(root.type).toBe('object');
    expect(isObjectNode(root)).toBe(true);
    expect(isTerminalNode(root)).toBe(true);
    expect(root.children).toBeNull();
    expect(root.value).toEqual({ retained: true });
  });

  it('delegates defaultValue and resetSubtree to the load snapshot', () => {
    const root = makeTree(
      {
        type: 'object',
        properties: {
          value: { type: 'string' },
        },
      },
      { value: 'loaded' },
    );
    root.setValue({ value: 'edited', extra: 1 });
    expect(root.extras).toEqual({ extra: 1 });
    expect(root.find('/value')?.defaultValue).toBe('loaded');
    root.find('/value')?.resetSubtree();
    expect(root.find('/value')?.value).toBe('loaded');
    expect(root.diagnostics.status).toBe('stable');
  });
});
