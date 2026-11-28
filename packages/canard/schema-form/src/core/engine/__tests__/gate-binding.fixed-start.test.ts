import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { createTestValidator } from '@/schema-form/core/__tests__/fixtures/createTestValidator';

import { isArrayNode } from '../../surface';
import { ValidationMode } from '../types/state';

/*
 * A host wheel starts every reset child from its fixed start schema: round 0
 * reads the child's value and output as computed under that schema, so a branch that changes an
 * option its own condition reads through the output cannot keep itself selected after a write.
 * Every scene compares the live form with a fresh load of its value.
 */

const validator = createTestValidator();

type ProbeRoot = ReturnType<typeof nodeFromJSONSchema>;

const mount = (schema: object, value: unknown): ProbeRoot =>
  nodeFromJSONSchema({
    jsonSchema: schema,
    defaultValue: value,
    validationMode: ValidationMode.None,
    validator,
  });

const read = (root: ProbeRoot, paths: readonly string[]) =>
  paths.map((path) => {
    const node = root.find(path);
    return node
      ? `${path} ${JSON.stringify(node.jsonSchema)} ${JSON.stringify(node.outputValue ?? null)}`
      : `${path} absent`;
  });

const againstFresh = (
  schema: object,
  root: ProbeRoot,
  paths: readonly string[],
) =>
  [
    read(root, paths),
    read(mount(schema, structuredClone(root.value)), paths),
  ] as const;

const minLengthAt = (root: ProbeRoot, path: string): unknown =>
  Reflect.get(Object(root.find(path)?.jsonSchema), 'minLength');

/** `then` turns off `c`'s default `omitEmpty`, so an empty `c` stays in the output and keeps `required: ['c']` true. */
const keepEmpty = {
  type: 'object',
  properties: { c: { type: 'string' }, g: { type: 'string' } },
  if: { required: ['c'] },
  then: {
    properties: {
      c: { options: { omitEmpty: false } },
      g: { minLength: 3 },
    },
  },
};
const KEEP_EMPTY_PATHS = ['', '/c', '/g'];

/** `then` stops the trailing trim, so a trailing empty item keeps `minItems: 2` true. */
const keepTrailing = {
  type: 'object',
  properties: {
    list: {
      type: 'array',
      items: { type: 'string' },
      options: { omitTrailingEmpty: true },
    },
    g: { type: 'string' },
  },
  if: { properties: { list: { minItems: 2 } }, required: ['list'] },
  then: {
    properties: {
      list: { options: { omitTrailingEmpty: false } },
      g: { minLength: 3 },
    },
  },
};

/** `then` keeps an empty object child in the output, so `required: ['o']` stays true. */
const keepEmptyObject = {
  type: 'object',
  properties: {
    o: { type: 'object', properties: { x: { type: 'string' } } },
    g: { type: 'string' },
  },
  if: { required: ['o'] },
  then: {
    properties: { o: { options: { omitEmpty: false } }, g: { minLength: 3 } },
  },
};

describe('fixed start: a branch cannot keep itself through an option its condition reads', () => {
  it('omitEmpty: writing an empty c selects else, as a fresh load does', () => {
    const root = mount(keepEmpty, { c: 'x', g: 'z' });
    expect(minLengthAt(root, '/g')).toBe(3);
    root.find('/c')?.setValue('');
    expect(minLengthAt(root, '/g')).toBeUndefined();
    expect(root.outputValue).toEqual({ g: 'z' });
    const [live, fresh] = againstFresh(keepEmpty, root, KEEP_EMPTY_PATHS);
    expect(live).toEqual(fresh);
  });

  it('omitEmpty: the same write inside a batch with a write to g', () => {
    const root = mount(keepEmpty, { c: 'x', g: 'z' });
    root.batch(() => {
      root.find('/c')?.setValue('');
      root.find('/g')?.setValue('zz');
    });
    expect(minLengthAt(root, '/g')).toBeUndefined();
    expect(root.outputValue).toEqual({ g: 'zz' });
    const [live, fresh] = againstFresh(keepEmpty, root, KEEP_EMPTY_PATHS);
    expect(live).toEqual(fresh);
  });

  it('omitEmpty in array items: the written item selects else, also after a later push', () => {
    const schema = {
      type: 'object',
      properties: { list: { type: 'array', items: keepEmpty } },
    };
    const paths = ['/list', '/list/0/g', '/list/1/g', '/list/2/g'];
    const root = mount(schema, {
      list: [
        { c: 'x', g: 'z' },
        { c: '', g: 'z' },
      ],
    });
    expect(minLengthAt(root, '/list/0/g')).toBe(3);
    root.find('/list/0/c')?.setValue('');
    expect(minLengthAt(root, '/list/0/g')).toBeUndefined();
    const [written, freshWritten] = againstFresh(schema, root, paths);
    expect(written).toEqual(freshWritten);
    const list = root.find('/list');
    if (!isArrayNode(list))
      throw new Error('the scene needs the array at /list');
    list.push({ c: 'x', g: 'z' });
    expect(minLengthAt(root, '/list/0/g')).toBeUndefined();
    expect(minLengthAt(root, '/list/2/g')).toBe(3);
    const [pushed, freshPushed] = againstFresh(schema, root, paths);
    expect(pushed).toEqual(freshPushed);
  });

  it('omitTrailingEmpty: a trailing empty item selects else, as a fresh load does', () => {
    const root = mount(keepTrailing, { list: ['a', 'b'], g: 'z' });
    expect(minLengthAt(root, '/g')).toBe(3);
    root.find('/list/1')?.setValue('');
    expect(minLengthAt(root, '/g')).toBeUndefined();
    expect(root.outputValue).toEqual({ list: ['a'], g: 'z' });
    const [live, fresh] = againstFresh(keepTrailing, root, ['', '/list', '/g']);
    expect(live).toEqual(fresh);
  });

  it('omitEmpty on an object child: emptying it selects else, as a fresh load does', () => {
    const root = mount(keepEmptyObject, { o: { x: 'x' }, g: 'z' });
    expect(minLengthAt(root, '/g')).toBe(3);
    root.find('/o/x')?.setValue(undefined);
    expect(minLengthAt(root, '/g')).toBeUndefined();
    expect(root.outputValue).toEqual({ g: 'z' });
    const [live, fresh] = againstFresh(keepEmptyObject, root, ['', '/o', '/g']);
    expect(live).toEqual(fresh);
  });
});
