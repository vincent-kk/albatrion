import { PathKeyedMap } from '../../utils/pathIndex/PathKeyedMap';
import { PathKeyedSet } from '../../utils/pathIndex/PathKeyedSet';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { blueprint } from '../../blueprint';
import type { BlueprintSchema } from '../../blueprint';
import { SchemaNode as RuntimeSchemaNode } from '../SchemaNode';
import * as surface from '../index';
import { schemaNodeFactory } from '../index';

/** Create a tree with only the genuine PR-2 runtime inputs. */
const makeTree = (schema: BlueprintSchema, snapshot: unknown = undefined) =>
  schemaNodeFactory(blueprint(schema), {
  diagnostics: { status: 'stable' },
  loadSnapshot: snapshot,
  latentRaw: new PathKeyedMap('pair'),
  typeMismatchPaths: new PathKeyedSet(),
  inactiveValuesMemo: new PathKeyedMap<readonly { path: string; value: unknown }[]>('path'),
  });

describe('SchemaNode PR-2 surface', () => {
  it('26C-01 PR-4 member list matches the DETAIL table exactly', () => {
    const detail = readFileSync(new URL('../DETAIL.md', import.meta.url), 'utf8');
    const rows = [...detail.matchAll(/^\| `([^`]+)` \| (getter|setter|getter\/setter|method) \|/gm)]
      .map((match) => ({ name: match[1].replace(/\(.*/, ''), kind: match[2] }));
    expect(rows).toHaveLength(53);
    const prototype = RuntimeSchemaNode.prototype;
    expect(Object.getOwnPropertyNames(prototype).filter((name) => name !== 'constructor').sort())
      .toEqual(rows.map((row) => row.name).sort());
    for (const row of rows) {
      const descriptor = Object.getOwnPropertyDescriptor(prototype, row.name);
      expect(typeof (row.kind.startsWith('getter') ? descriptor?.get : descriptor?.value))
        .toBe('function');
      if (row.kind === 'getter/setter') expect(typeof descriptor?.set).toBe('function');
    }
  });

  it('28C-02 enabled is active and visible, regardless of disabled', () => {
    const root = makeTree({ type: 'object', properties: {
      shown: { type: 'boolean' },
      target: { type: 'string', controls: {
        active: '../shown', visible: true, disabled: true,
      } },
      hidden: { type: 'string', controls: { visible: false } },
    } });
    root.setValue({ shown: true, target: 'value', hidden: 'hidden' });
    const target = root.find('/target');
    expect(target?.enabled).toBe(true);
    expect(target?.disabled).toBe(true);
    expect(root.find('/hidden')?.enabled).toBe(false);
    root.find('/shown')?.setValue(false);
    expect(target?.active).toBe(false);
    expect(target?.visible).toBe(true);
    expect(target?.enabled).toBe(false);
  });

  it('TEST-069 SchemaNode index names the binding-only context channel', () => {
    expect(Object.keys(surface).sort()).toEqual([
      'SchemaNodeEventType', 'SchemaNodeRequestType', 'SetValueOption',
      'adoptSchemaNodeTree', 'buildSchemaNodeTree', 'finishSchemaNodeInput',
      'interpretSchemaNodeDraft',
      'isArrayNode', 'isBooleanNode', 'isBranchNode',
      'isNumberNode', 'isObjectNode', 'isSchemaNode', 'isStringNode',
      'isTerminalNode', 'isUnionNode', 'isVirtualNode', 'mountSchemaNode',
      'observeSchemaNodeReports',
      'readSchemaNodeInteractionReset', 'reloadSchemaNodeForm', 'schemaNodeFactory',
      'setContext', 'writeSchemaNodeInput',
    ]);
    expect(Object.keys(surface.SetValueOption)).toEqual([
      'Overwrite', 'Merge', 'DisableAutomaticWrites', 'EnableAutomaticWrites',
    ]);
  });

  it('TEST-069 active getter reads the settled node gate', () => {
    const root = makeTree({ type: 'object', properties: {
      flag: { type: 'boolean' },
      target: { type: 'string', controls: { active: '../flag' } },
    } });
    root.setValue({ flag: true, target: 'shown' });
    const target = root.find('/target');
    expect(target?.active).toBe(true);
    expect(root.find('/flag')?.active).toBe(true);
    expect(surface.isSchemaNode(target)).toBe(true);
    root.find('/flag')?.setValue(false);
    expect(root.find('/target')).toBeNull();
    expect(target?.active).toBe(false);
    expect(target?.value).toBe('shown');
    root.find('/flag')?.setValue(true);
    expect(root.find('/target')).not.toBe(target);
    expect(root.find('/target')?.active).toBe(true);
    expect(target?.active).toBe(false);
  });

  it('children returns the exact stored array reference', () => {
    const root = makeTree({ type: 'object', properties: {
      first: { type: 'string' }, second: { type: 'number' },
    } });
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
    if (!surface.isArrayNode(array)) throw new Error('Expected an array node');
    expect(array.push('x')).toBe(1);
    expect(array.update(0, 'y')).toBe('y');
    expect(array.remove(0)).toBe('y');
    expect(array.push('z')).toBe(1);
    expect(array.pop()).toBe('z');
    expect(array.clear()).toBeUndefined();
    const string = makeTree({ type: 'string' });
    expect(() => Reflect.get(string, 'push').call(string, 'x')).toThrowError(
      expect.objectContaining({ code: 'SCHEMA_FORM_ERROR.ARRAY_METHOD_ON_NON_ARRAY',
        details: { path: '', method: 'push' } }));
  });

  it('TEST-069 isTerminalNode object includes terminal object nodes', () => {
    const root = makeTree({ type: 'object', options: { terminal: true } });
    root.setValue({ retained: true });
    expect(root.type).toBe('object');
    expect(surface.isObjectNode(root)).toBe(true);
    expect(surface.isTerminalNode(root)).toBe(true);
    expect(root.children).toBeNull();
    expect(root.value).toEqual({ retained: true });
  });

  it('delegates defaultValue and resetSubtree to the load snapshot', () => {
    const root = makeTree({ type: 'object', properties: {
      value: { type: 'string' },
    } }, { value: 'loaded' });
    root.setValue({ value: 'edited', extra: 1 });
    expect(root.extras).toEqual({ extra: 1 });
    expect(root.find('/value')?.defaultValue).toBe('loaded');
    root.find('/value')?.resetSubtree();
    expect(root.find('/value')?.value).toBe('loaded');
    expect(root.diagnostics.status).toBe('stable');
  });
});
