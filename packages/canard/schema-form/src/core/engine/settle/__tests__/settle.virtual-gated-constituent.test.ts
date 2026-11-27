import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { createTestValidator } from '@/schema-form/core/__tests__/fixtures/createTestValidator';

import type { AuthoredSchema } from '../../types/jsonSchema';
import { ValidationMode } from '../../types/state';

/** Live node of a mounted test tree. */
type Node = NonNullable<
  ReturnType<ReturnType<typeof nodeFromJSONSchema>['find']>
>;

/** One narrowing of the constituent `data` and the readings that tell it apart from the broad schema. */
interface Variant {
  /** Schema of `data` declared in `properties`. */
  readonly base: AuthoredSchema;
  /** Fragment applied to `data` while `flag` is true. */
  readonly narrow: AuthoredSchema;
  /** Effective schema of `data` while `flag` is false. */
  readonly broad: object;
  /** Effective schema of `data` while `flag` is true. */
  readonly narrowed: object;
  /** Value loaded into `data`. */
  readonly loaded: unknown;
  /** Value written to `data` through the group or the field. */
  readonly written: unknown;
  /** Value of `data` read back after `written` under the narrowed schema. */
  readonly read: unknown;
  /** Misfit flag of `data` after `written` under the narrowed schema. */
  readonly isMisfit: boolean;
}

/** A string narrowed by a constraint, a number narrowed to integer and a union narrowed to one kind. */
const VARIANTS: readonly (readonly [string, Variant])[] = [
  [
    'minLength',
    {
      base: { type: 'string' },
      narrow: { minLength: 3 },
      broad: { type: 'string' },
      narrowed: { type: 'string', minLength: 3 },
      loaded: 'abcd',
      written: 'ab',
      read: 'ab',
      isMisfit: false,
    },
  ],
  [
    'integer',
    {
      base: { type: 'number' },
      narrow: { type: 'integer' },
      broad: { type: 'number' },
      narrowed: { type: ['integer'] },
      loaded: 4,
      written: 4.5,
      read: 4.5,
      isMisfit: true,
    },
  ],
  [
    'union',
    {
      base: { type: ['string', 'number'] },
      narrow: { type: 'number' },
      broad: { type: ['string', 'number'] },
      narrowed: { type: ['number'] },
      loaded: 4,
      written: '5',
      read: 5,
      isMisfit: false,
    },
  ],
];

/**
 * Build an object whose constituent `data` is narrowed while its sibling `flag` is true.
 * @param variant - Narrowing applied to `data`
 * @param gate - `active` narrows through an allOf fragment with controls.active, `if` through if/then
 * @param group - Extra keys of the virtual group `pair` over `data` and `y`; omitted for the same object without the group
 * @returns Authored object schema
 */
const host = (
  variant: Variant,
  gate: 'active' | 'if',
  group?: object,
): AuthoredSchema => ({
  type: 'object',
  properties: {
    flag: { type: 'boolean' },
    groupOn: { type: 'boolean' },
    data: variant.base,
    y: { type: 'string' },
  },
  ...(group && {
    options: { virtual: { pair: { fields: ['data', 'y'], ...group } } },
  }),
  ...(gate === 'active'
    ? {
        allOf: [
          {
            controls: { active: './flag === true' },
            properties: { data: variant.narrow },
          },
        ],
      }
    : {
        if: { properties: { flag: { const: true } }, required: ['flag'] },
        then: { properties: { data: variant.narrow } },
      }),
});

/**
 * Mount a tree with the core test validator, which an if/then gate needs to evaluate.
 * @param schema - Authored root schema
 * @param defaultValue - Loaded value
 * @returns Mounted root
 */
const load = (schema: AuthoredSchema, defaultValue: unknown): Node =>
  nodeFromJSONSchema({
    jsonSchema: schema,
    defaultValue,
    validationMode: ValidationMode.None,
    validator: createTestValidator(),
  });

/**
 * Find a live node, failing the case when the path is absent.
 * @param root - Mounted root
 * @param path - Absolute pointer of the node
 * @returns The live node at the path
 */
const at = (root: Node, path: string): Node => {
  const node = root.find(path);
  if (!node) throw new Error(`No node at ${path}`);
  return node;
};

/**
 * Read the constituent's effective schema, value and misfit flag with the tree's settlement status.
 * @param root - Mounted root
 * @param prefix - Pointer of the object holding `data`
 * @returns Comparable observation
 */
const observe = (root: Node, prefix = '') => {
  const data = at(root, prefix + '/data');
  return {
    schema: data.jsonSchema,
    value: data.value,
    isMisfit: data.isMisfit,
    status: root.diagnostics.status,
  };
};

/**
 * Expect the observation to equal a fresh mount of the same schema with the committed value.
 * @param schema - Schema of the observed tree
 * @param root - Observed root
 * @param prefix - Pointer of the object holding `data`
 */
const expectFresh = (schema: AuthoredSchema, root: Node, prefix = '') =>
  expect(observe(root, prefix)).toEqual(
    observe(load(schema, root.value), prefix),
  );

// filid:contract SETTLE-044
describe('a gate narrowing a virtual group constituent applies as it does without the group', () => {
  it.each(VARIANTS)(
    '%s: a load with the gate on narrows the constituent and settles',
    (_name, variant) => {
      const root = load(host(variant, 'active', {}), {
        flag: true,
        data: variant.loaded,
        y: 'a',
      });
      expect(observe(root)).toEqual({
        schema: variant.narrowed,
        value: variant.loaded,
        isMisfit: false,
        status: 'stable',
      });
      expect(at(root, '/pair').value).toEqual([variant.loaded, 'a']);
      expect(observe(root)).toEqual(
        observe(load(host(variant, 'active'), root.value)),
      );
    },
  );

  it.each(VARIANTS)(
    '%s: the narrowing follows the gate on, off and on',
    (_name, variant) => {
      const schema = host(variant, 'active', {});
      const root = load(schema, { flag: false, data: variant.loaded, y: 'a' });
      const schemas: unknown[] = [];
      for (const flag of [true, false, true]) {
        at(root, '/flag').setValue(flag);
        expectFresh(schema, root);
        schemas.push(observe(root).schema);
      }
      expect(schemas).toEqual([
        variant.narrowed,
        variant.broad,
        variant.narrowed,
      ]);
      expect(observe(root)).toEqual({
        schema: variant.narrowed,
        value: variant.loaded,
        isMisfit: false,
        status: 'stable',
      });
    },
  );

  it.each(VARIANTS)(
    '%s: a tuple written through the group is read under the narrowed schema',
    (_name, variant) => {
      const schema = host(variant, 'active', {});
      const root = load(schema, { flag: false, data: variant.loaded, y: 'a' });
      at(root, '/flag').setValue(true);
      at(root, '/pair').setValue([variant.written, 'b']);
      expect(observe(root)).toEqual({
        schema: variant.narrowed,
        value: variant.read,
        isMisfit: variant.isMisfit,
        status: 'stable',
      });
      expect(at(root, '/pair').value).toEqual([variant.read, 'b']);
      expectFresh(schema, root);
    },
  );

  it.each(VARIANTS)(
    '%s: a value written to the field is read under the narrowed schema',
    (_name, variant) => {
      const schema = host(variant, 'active', {});
      const root = load(schema, { flag: false, data: variant.loaded, y: 'a' });
      at(root, '/flag').setValue(true);
      at(root, '/data').setValue(variant.written);
      expect(observe(root)).toEqual({
        schema: variant.narrowed,
        value: variant.read,
        isMisfit: variant.isMisfit,
        status: 'stable',
      });
      expect(at(root, '/pair').value).toEqual([variant.read, 'a']);
      expectFresh(schema, root);
    },
  );

  it('an if/then gate narrows the constituent the same way', () => {
    for (const [name, variant] of VARIANTS) {
      const schema = host(variant, 'if', {});
      const root = load(schema, { flag: true, data: variant.loaded, y: 'a' });
      expect(observe(root), name).toEqual({
        schema: variant.narrowed,
        value: variant.loaded,
        isMisfit: false,
        status: 'stable',
      });
      at(root, '/flag').setValue(false);
      expect(observe(root).schema, name).toEqual(variant.broad);
      at(root, '/flag').setValue(true);
      at(root, '/pair').setValue([variant.written, 'b']);
      expect(observe(root), name).toEqual({
        schema: variant.narrowed,
        value: variant.read,
        isMisfit: variant.isMisfit,
        status: 'stable',
      });
      expectFresh(schema, root);
    }
  });

  it('a group nested in the object that owns the gate narrows the same way', () => {
    for (const [name, variant] of VARIANTS) {
      const schema: AuthoredSchema = {
        type: 'object',
        properties: { obj: host(variant, 'active', {}) },
      };
      const root = load(schema, {
        obj: { flag: true, data: variant.loaded, y: 'a' },
      });
      expect(observe(root, '/obj'), name).toEqual({
        schema: variant.narrowed,
        value: variant.loaded,
        isMisfit: false,
        status: 'stable',
      });
      at(root, '/obj/flag').setValue(false);
      expect(observe(root, '/obj').schema, name).toEqual(variant.broad);
      at(root, '/obj/flag').setValue(true);
      at(root, '/obj/pair').setValue([variant.written, 'b']);
      expect(observe(root, '/obj'), name).toEqual({
        schema: variant.narrowed,
        value: variant.read,
        isMisfit: variant.isMisfit,
        status: 'stable',
      });
      expectFresh(schema, root, '/obj');
    }
  });

  it("the group's own active and visible gates leave the constituent narrowed", () => {
    for (const [name, variant] of VARIANTS)
      for (const key of ['active', 'visible'] as const) {
        const label = `${name} ${key}`;
        const schema = host(variant, 'active', {
          controls: { [key]: '../groupOn === true' },
        });
        const root = load(schema, {
          flag: true,
          groupOn: false,
          data: variant.loaded,
          y: 'a',
        });
        expect(observe(root), label).toEqual({
          schema: variant.narrowed,
          value: variant.loaded,
          isMisfit: false,
          status: 'stable',
        });
        at(root, '/groupOn').setValue(true);
        expect(observe(root).schema, label).toEqual(variant.narrowed);
        expectFresh(schema, root);
        at(root, '/pair').setValue([variant.written, 'b']);
        expect(observe(root), label).toEqual({
          schema: variant.narrowed,
          value: variant.read,
          isMisfit: variant.isMisfit,
          status: 'stable',
        });
        at(root, '/groupOn').setValue(false);
        expect(observe(root).schema, label).toEqual(variant.narrowed);
        expectFresh(schema, root);
      }
  });
});
