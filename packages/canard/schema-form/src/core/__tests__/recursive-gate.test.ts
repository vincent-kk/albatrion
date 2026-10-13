import { describe, expect, it } from 'vitest';

import {
  type FieldNode,
  type JSONSchema,
  ValidationMode,
  nodeFromJSONSchema,
} from '../index';
import { createTestValidator } from './fixtures/createTestValidator';

/** A recursive file tree under a root key containing "/" and "~" (07c composite.finding-recursive-nested-gate). */
const treeSchema = {
  $defs: {
    node: {
      type: 'object',
      properties: { kind: { type: 'string', enum: ['folder', 'file'] } },
      if: { properties: { kind: { const: 'folder' } }, required: ['kind'] },
      then: {
        properties: {
          children: { type: 'array', items: { $ref: '#/$defs/node' } },
        },
      },
      else: { properties: { size: { type: 'integer', minimum: 0 } } },
    },
  },
  type: 'object',
  properties: { 'a/b~c': { $ref: '#/$defs/node' } },
} as const;

const ROOT = '/a~1b~0c';

const mountTree = (value: Record<string, unknown>): FieldNode =>
  nodeFromJSONSchema({
    jsonSchema: treeSchema as JSONSchema,
    defaultValue: value,
    validationMode: ValidationMode.None,
    validator: createTestValidator(),
  });

/** Names of the live children of an object node. */
const shape = (node: FieldNode | null): string[] =>
  node ? (node.children ?? []).map((child) => child.name) : [];

describe('if/then/else gates inside a recursive $ref (211C-01 B)', () => {
  const three = {
    'a/b~c': {
      kind: 'folder',
      children: [{ kind: 'folder', children: [{ kind: 'file', size: 1 }] }],
    },
  };

  it('gates every nested instance by its own kind', () => {
    const root = mountTree(three);
    expect(shape(root.find(`${ROOT}/children/0/children/0`))).toEqual([
      'kind',
      'size',
    ]);
    expect(shape(root.find(`${ROOT}/children/0`))).toEqual([
      'kind',
      'children',
    ]);
    expect(root.outputValue).toEqual(three);
  });

  it('drops children from the shape and the output when a middle folder becomes a file', () => {
    const root = mountTree(three);
    const middle = root.find(`${ROOT}/children/0`)!;
    middle.find('kind')!.setValue('file');
    expect(shape(middle)).toEqual(['kind', 'size']);
    expect(root.outputValue).toEqual({
      'a/b~c': { kind: 'folder', children: [{ kind: 'file' }] },
    });
    middle.find('kind')!.setValue('folder');
    expect(shape(middle)).toEqual(['kind', 'children']);
    expect(root.outputValue).toEqual(three);
  });

  it('opens an empty children list when a deep file becomes a folder and sizes the top when it becomes a file', () => {
    const root = mountTree(three);
    const deep = root.find(`${ROOT}/children/0/children/0`)!;
    deep.find('kind')!.setValue('folder');
    expect(shape(deep)).toEqual(['kind', 'children']);
    expect(deep.find('children')!.value).toEqual([]);
    const top = root.find(ROOT)!;
    top.find('kind')!.setValue('file');
    expect(shape(top)).toEqual(['kind', 'size']);
    expect(root.outputValue).toEqual({ 'a/b~c': { kind: 'file' } });
  });
});

describe('gate controls that do not recurse (211C-01 B)', () => {
  it('keeps a flat if/then/else following its own kind', () => {
    const root = nodeFromJSONSchema({
      jsonSchema: {
        type: 'object',
        properties: { kind: { type: 'string' } },
        if: { properties: { kind: { const: 'folder' } }, required: ['kind'] },
        then: {
          properties: {
            children: { type: 'array', items: { type: 'string' } },
          },
        },
        else: { properties: { size: { type: 'integer' } } },
      },
      defaultValue: { kind: 'folder', children: ['x'] },
      validationMode: ValidationMode.None,
      validator: createTestValidator(),
    });
    expect(shape(root)).toEqual(['kind', 'children']);
    root.find('kind')!.setValue('file');
    expect(shape(root)).toEqual(['kind', 'size']);
  });

  it('keeps a $ref used once following its own kind', () => {
    const root = nodeFromJSONSchema({
      jsonSchema: {
        $defs: {
          node: {
            type: 'object',
            properties: { kind: { type: 'string' } },
            if: {
              properties: { kind: { const: 'folder' } },
              required: ['kind'],
            },
            then: {
              properties: {
                children: { type: 'array', items: { type: 'string' } },
              },
            },
            else: { properties: { size: { type: 'integer' } } },
          },
        },
        type: 'object',
        properties: { node: { $ref: '#/$defs/node' } },
      },
      defaultValue: { node: { kind: 'file', size: 3 } },
      validationMode: ValidationMode.None,
      validator: createTestValidator(),
    });
    expect(shape(root.find('/node'))).toEqual(['kind', 'size']);
    root.find('/node/kind')!.setValue('folder');
    expect(shape(root.find('/node'))).toEqual(['kind', 'children']);
  });
});
