import { describe, expect, it } from 'vitest';

import { isArray, isObject } from '@winglet/common-utils/filter';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import { ValidationMode } from '../../types/state';

/** Two declared constituents grouped as `/period` beside an ungrouped sibling. */
const schema = {
  type: 'object',
  properties: {
    start: { type: 'string' },
    end: { type: 'string' },
    note: { type: 'string' },
  },
  options: { virtual: { period: { fields: ['start', 'end'] } } },
} as const;

/** Mount the period form loaded with `{ start: 'a', end: 'b', note: 'n' }`. */
const load = () =>
  nodeFromJSONSchema({
    jsonSchema: schema,
    defaultValue: { start: 'a', end: 'b', note: 'n' },
    validationMode: ValidationMode.None,
  });

/** Narrow a tuple read to a mutable array, or fail the case. */
const requireTuple = (value: unknown) => {
  if (!isArray(value)) throw new Error('virtual default is not a tuple');
  return value;
};

/** Narrow a `find` result to a node, or fail the case. */
const requireNode = <Node>(node: Node | null | undefined): Node => {
  if (node == null) throw new Error('node not found');
  return node;
};

describe('virtual defaultValue identity', () => {
  it('returns the same tuple on consecutive reads', () => {
    const group = requireNode(load().find('/period'));
    const first = group.defaultValue;
    expect(first).toEqual(['a', 'b']);
    expect(group.defaultValue).toBe(first);
  });

  it('keeps the tuple after a caller write, which leaves the load snapshot unchanged', () => {
    const group = requireNode(load().find('/period'));
    const first = group.defaultValue;
    group.setValue(['c', 'd']);
    expect(group.value).toEqual(['c', 'd']);
    expect(group.defaultValue).toEqual(['a', 'b']);
    expect(group.defaultValue).toBe(first);
  });

  it('returns a new tuple after the snapshot host is edited in place, then keeps it', () => {
    const root = load();
    const group = requireNode(root.find('/period'));
    const first = group.defaultValue;
    const host = root.defaultValue;
    if (!isObject(host)) throw new Error('root default is not an object');
    Reflect.set(host, 'start', 'Z');
    const edited = group.defaultValue;
    expect(edited).toEqual(['Z', 'b']);
    expect(edited).not.toBe(first);
    expect(group.defaultValue).toBe(edited);
  });

  it('repairs a returned tuple that the consumer edited or extended', () => {
    const group = requireNode(load().find('/period'));
    requireTuple(group.defaultValue)[0] = 'x';
    const repaired = requireTuple(group.defaultValue);
    expect(repaired).toEqual(['a', 'b']);
    repaired.push(1);
    const shortened = group.defaultValue;
    expect(shortened).toEqual(['a', 'b']);
    expect(shortened).toHaveLength(2);
  });

  it('keeps a tuple holding NaN', () => {
    const group = requireNode(
      nodeFromJSONSchema({
        jsonSchema: {
          type: 'object',
          properties: { x: { type: 'number' }, y: { type: 'number' } },
          options: { virtual: { pair: { fields: ['x', 'y'] } } },
        },
        defaultValue: { x: Number.NaN, y: 1 },
        validationMode: ValidationMode.None,
      }).find('/pair'),
    );
    const first = group.defaultValue;
    expect(first).toEqual([Number.NaN, 1]);
    expect(group.defaultValue).toBe(first);
  });

  it('keeps the empty tuple of a group without constituents', () => {
    const group = requireNode(
      nodeFromJSONSchema({
        jsonSchema: {
          type: 'object',
          properties: { note: { type: 'string' } },
          options: { virtual: { empty: { fields: [] } } },
        },
        defaultValue: { note: 'n' },
        validationMode: ValidationMode.None,
      }).find('/empty'),
    );
    const first = group.defaultValue;
    expect(first).toEqual([]);
    expect(group.defaultValue).toBe(first);
  });

  it('shares the live tuple with the read captured at detach', () => {
    const root = nodeFromJSONSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          on: { type: 'boolean' },
          start: { type: 'string' },
          end: { type: 'string' },
        },
        options: {
          virtual: {
            period: {
              fields: ['start', 'end'],
              controls: { active: '../on === true' },
            },
          },
        },
      },
      defaultValue: { on: true, start: 'a', end: 'b' },
      validationMode: ValidationMode.None,
    });
    const group = requireNode(root.find('/period'));
    const live = group.defaultValue;
    requireNode(root.find('/on')).setValue(false);
    expect(root.find('/period')).toBeNull();
    expect(group.defaultValue).toBe(live);
  });

  it('answers a detached read with the captured tuple without repair', () => {
    const root = nodeFromJSONSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          on: { type: 'boolean' },
          start: { type: 'string' },
          end: { type: 'string' },
        },
        options: {
          virtual: {
            period: {
              fields: ['start', 'end'],
              controls: { active: '../on === true' },
            },
          },
        },
      },
      defaultValue: { on: true, start: 'a', end: 'b' },
      validationMode: ValidationMode.None,
    });
    const group = requireNode(root.find('/period'));
    const live = requireTuple(group.defaultValue);
    requireNode(root.find('/on')).setValue(false);
    expect(root.find('/period')).toBeNull();
    live[0] = 'x';
    const detached = requireTuple(group.defaultValue);
    expect(detached).toBe(live);
    expect(detached[0]).toBe('x');
  });
});
