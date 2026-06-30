import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';

import type { JsonSchema } from '@winglet/json-schema';

import { renderForm } from '../renderForm';

/**
 * GAP-12 — Initial default-value application (schema.default & Form defaultValue
 * prop), and the ArrayNode `hasDefault` → minItems auto-fill interaction.
 *
 * When a node mounts, its terminal FormTypeInput is UNCONTROLLED: `defaultValue`
 * is memorised at mount and only re-syncs through a `RequestRefresh`. The node
 * tree seeds defaults during the initial cascade; the rendered DOM must mirror
 * those seeds once the cascade drains. Every test asserts BOTH layers — the
 * rendered DOM (`value` / `checked` / row count via `renderedPaths`) AND the
 * node tree (`node(path).value` / `getValue()`).
 *
 * Array auto-fill rule (commit 1ed54c09, mirrored from stories/10.DefaultValue):
 *   - No default anywhere  → auto-fill empty items up to `minItems`.
 *   - schema.default OR Form `defaultValue` prop present for that array
 *     → use it verbatim, auto-fill DISABLED (row count == default length).
 *   - Each nesting level checks `hasDefault` independently.
 */

// ---------------------------------------------------------------------------
// Schemas (mirrored from stories/10.DefaultValue)
// ---------------------------------------------------------------------------

const schemaDefaultShape = {
  type: 'object',
  properties: {
    string: { type: 'string', default: 'default value' },
    number: { type: 'number', default: 10 },
    boolean: { type: 'boolean', default: true },
    array: {
      type: 'array',
      items: { type: 'number', default: 0 },
      minItems: 2,
    },
    object: {
      type: 'object',
      properties: {
        name: { type: 'string', default: 'adult' },
        age: { type: 'number', default: 19 },
      },
    },
    objectArray: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', default: 'anonymous' },
          age: { type: 'number', default: 0 },
        },
      },
      minItems: 3,
    },
    null: { type: 'null', nullable: true, default: null },
  },
} satisfies JsonSchema;

const noDefaultShape = {
  type: 'object',
  properties: {
    string: { type: 'string' },
    number: { type: 'number' },
    boolean: { type: 'boolean' },
    array: { type: 'array', items: { type: 'number' }, minItems: 2 },
    object: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
    },
    objectArray: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
      },
      minItems: 3,
    },
    null: { type: 'null', nullable: true },
  },
} satisfies JsonSchema;

const parentChildDefaultSchema = {
  type: 'object',
  properties: {
    profile: {
      type: 'object',
      default: { name: 'ron' },
      properties: {
        name: { type: 'string', default: 'harry' },
        age: { type: 'number', default: 9 },
      },
    },
  },
} satisfies JsonSchema;

const arrayMatrixSchema = {
  type: 'object',
  properties: {
    autoFillArray: {
      type: 'array',
      items: { type: 'string', default: 'auto-filled' },
      minItems: 3,
    },
    schemaDefaultArray: {
      type: 'array',
      items: { type: 'string', default: 'item' },
      minItems: 3,
      default: ['one'],
    },
    emptyDefaultArray: {
      type: 'array',
      items: { type: 'string', default: 'item' },
      minItems: 3,
      default: [],
    },
    objectArrayAutoFill: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', default: 'anonymous' },
          age: { type: 'number', default: 0 },
        },
      },
      minItems: 2,
    },
    objectArrayWithDefault: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', default: 'anonymous' },
          age: { type: 'number', default: 0 },
        },
      },
      minItems: 3,
      default: [{ name: 'preset' }],
    },
  },
} satisfies JsonSchema;

const defaultValuePropArraySchema = {
  type: 'object',
  properties: {
    partialArray: {
      type: 'array',
      items: { type: 'string', default: 'x' },
      minItems: 5,
    },
    emptyArray: {
      type: 'array',
      items: { type: 'string', default: 'x' },
      minItems: 3,
    },
    autoFillArray: {
      type: 'array',
      items: { type: 'string', default: 'auto' },
      minItems: 2,
    },
  },
} satisfies JsonSchema;

const nestedArraySchema = {
  type: 'object',
  properties: {
    nestedAutoFill: {
      type: 'array',
      items: {
        type: 'array',
        items: { type: 'number', default: 0 },
        minItems: 2,
      },
      minItems: 2,
    },
    nestedInnerDefault: {
      type: 'array',
      items: {
        type: 'array',
        items: { type: 'number', default: 0 },
        minItems: 3,
        default: [99],
      },
      minItems: 2,
    },
    nestedOuterDefault: {
      type: 'array',
      items: {
        type: 'array',
        items: { type: 'number', default: 0 },
        minItems: 3,
      },
      minItems: 3,
      default: [[1], [2, 3]],
    },
  },
} satisfies JsonSchema;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Count rendered direct rows of an array (paths like `${arrayPath}/<index>`). */
const rowCount = (
  form: Awaited<ReturnType<typeof renderForm>>,
  arrayPath: string,
): number => {
  const re = new RegExp(`^${arrayPath}/\\d+$`);
  return form.renderedPaths().filter((p) => re.test(p)).length;
};

// ---------------------------------------------------------------------------
// schema.default seeding (DOM + tree)
// ---------------------------------------------------------------------------

describe('schema.default — every field seeded on mount', () => {
  it('seeds primitives, object, arrays and null from schema.default (DOM + tree)', async () => {
    const form = await renderForm(schemaDefaultShape);

    // primitives in DOM
    expect(form.value('/string')).toBe('default value');
    expect(form.value('/number')).toBe('10');
    expect(form.checked('/boolean')).toBe(true);
    // nested object primitives
    expect(form.value('/object/name')).toBe('adult');
    expect(form.value('/object/age')).toBe('19');
    // number-array auto-filled to minItems (no array-level default) with item default 0
    expect(rowCount(form, '/array')).toBe(2);
    expect(form.value('/array/0')).toBe('0');
    expect(form.value('/array/1')).toBe('0');
    // object-array auto-filled to minItems with item defaults
    expect(rowCount(form, '/objectArray')).toBe(3);
    expect(form.value('/objectArray/0/name')).toBe('anonymous');
    expect(form.value('/objectArray/2/age')).toBe('0');

    // node tree mirrors the whole shape
    expect(form.getValue()).toEqual({
      string: 'default value',
      number: 10,
      boolean: true,
      array: [0, 0],
      object: { name: 'adult', age: 19 },
      objectArray: [
        { name: 'anonymous', age: 0 },
        { name: 'anonymous', age: 0 },
        { name: 'anonymous', age: 0 },
      ],
      null: null,
    });
    expect(form.node('/object/name')?.value).toBe('adult');
    expect(form.node('/null')?.value).toBeNull();
    expect(form.caughtErrors()).toEqual([]);
  });
});

describe('Form defaultValue prop — same shape, no schema.default', () => {
  it('seeds the identical shape via the defaultValue prop (DOM + tree)', async () => {
    const form = await renderForm(noDefaultShape, {
      defaultValue: {
        string: 'default value',
        number: 10,
        boolean: true,
        array: [0, 0],
        object: { name: 'adult', age: 19 },
        objectArray: [
          { name: 'anonymous', age: 0 },
          { name: 'anonymous', age: 0 },
          { name: 'anonymous', age: 0 },
        ],
        null: null,
      },
    });

    expect(form.value('/string')).toBe('default value');
    expect(form.value('/number')).toBe('10');
    expect(form.checked('/boolean')).toBe(true);
    expect(form.value('/object/name')).toBe('adult');
    expect(rowCount(form, '/array')).toBe(2);
    expect(form.value('/array/1')).toBe('0');
    expect(rowCount(form, '/objectArray')).toBe(3);
    expect(form.value('/objectArray/0/name')).toBe('anonymous');

    expect(form.getValue()).toEqual({
      string: 'default value',
      number: 10,
      boolean: true,
      array: [0, 0],
      object: { name: 'adult', age: 19 },
      objectArray: [
        { name: 'anonymous', age: 0 },
        { name: 'anonymous', age: 0 },
        { name: 'anonymous', age: 0 },
      ],
      null: null,
    });
    expect(form.caughtErrors()).toEqual([]);
  });
});

describe('parent object default merged with child defaults', () => {
  it('merges {name:"ron"} with child defaults — parent default wins per overlapping key, child fills the rest (DOM + tree)', async () => {
    const form = await renderForm(parentChildDefaultSchema);

    // parent default {name:'ron'} wins over the child default 'harry' for the
    // overlapping `name` key; `age` (absent in the parent default) is filled
    // from the child default 9.
    expect(form.value('/profile/name')).toBe('ron');
    expect(form.value('/profile/age')).toBe('9');

    expect(form.node('/profile/name')?.value).toBe('ron');
    expect(form.node('/profile/age')?.value).toBe(9);
    expect(form.getValue()).toEqual({ profile: { name: 'ron', age: 9 } });
    expect(form.caughtErrors()).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Array minItems auto-fill matrix (schema.default disables auto-fill)
// ---------------------------------------------------------------------------

describe('array minItems auto-fill matrix (schema.default)', () => {
  it('auto-fills a no-default array up to minItems with the item default', async () => {
    const form = await renderForm(arrayMatrixSchema);

    expect(rowCount(form, '/autoFillArray')).toBe(3);
    expect(form.value('/autoFillArray/0')).toBe('auto-filled');
    expect(form.value('/autoFillArray/2')).toBe('auto-filled');
    expect(form.getValue()?.autoFillArray).toEqual([
      'auto-filled',
      'auto-filled',
      'auto-filled',
    ]);
  });

  it('uses schema.default verbatim and disables auto-fill (1 row, not minItems=3)', async () => {
    const form = await renderForm(arrayMatrixSchema);

    expect(rowCount(form, '/schemaDefaultArray')).toBe(1);
    expect(form.value('/schemaDefaultArray/0')).toBe('one');
    expect(form.getValue()?.schemaDefaultArray).toEqual(['one']);
  });

  it('honours an empty schema.default array (0 rows, not minItems=3)', async () => {
    const form = await renderForm(arrayMatrixSchema);

    expect(rowCount(form, '/emptyDefaultArray')).toBe(0);
    expect(form.exists('/emptyDefaultArray/0')).toBe(false);
    // the array node holds [] (auto-fill disabled); the parent object prunes the
    // empty array from its emitted value, so the key is omitted from getValue().
    expect(form.node('/emptyDefaultArray')?.value).toEqual([]);
    expect(form.getValue()?.emptyDefaultArray).toBeUndefined();
  });

  it('auto-fills an object array up to minItems with item defaults', async () => {
    const form = await renderForm(arrayMatrixSchema);

    expect(rowCount(form, '/objectArrayAutoFill')).toBe(2);
    expect(form.value('/objectArrayAutoFill/0/name')).toBe('anonymous');
    expect(form.value('/objectArrayAutoFill/1/age')).toBe('0');
    expect(form.getValue()?.objectArrayAutoFill).toEqual([
      { name: 'anonymous', age: 0 },
      { name: 'anonymous', age: 0 },
    ]);
  });

  it('uses an object-array schema.default (1 row) filling omitted child defaults', async () => {
    const form = await renderForm(arrayMatrixSchema);

    expect(rowCount(form, '/objectArrayWithDefault')).toBe(1);
    expect(form.value('/objectArrayWithDefault/0/name')).toBe('preset');
    // age omitted in the default → backfilled from the item's child default 0
    expect(form.value('/objectArrayWithDefault/0/age')).toBe('0');
    expect(form.getValue()?.objectArrayWithDefault).toEqual([
      { name: 'preset', age: 0 },
    ]);
  });
});

// ---------------------------------------------------------------------------
// Form defaultValue prop overrides minItems auto-fill per field
// ---------------------------------------------------------------------------

describe('Form defaultValue prop overrides minItems auto-fill per field', () => {
  it('a partial defaultValue array wins over minItems (2 rows, not 5)', async () => {
    const form = await renderForm(defaultValuePropArraySchema, {
      defaultValue: { partialArray: ['a', 'b'], emptyArray: [] },
    });

    expect(rowCount(form, '/partialArray')).toBe(2);
    expect(form.value('/partialArray/0')).toBe('a');
    expect(form.value('/partialArray/1')).toBe('b');
    expect(form.getValue()?.partialArray).toEqual(['a', 'b']);
  });

  it('an empty defaultValue array wins over minItems (0 rows, not 3)', async () => {
    const form = await renderForm(defaultValuePropArraySchema, {
      defaultValue: { partialArray: ['a', 'b'], emptyArray: [] },
    });

    expect(rowCount(form, '/emptyArray')).toBe(0);
    expect(form.exists('/emptyArray/0')).toBe(false);
    // node holds [] (auto-fill disabled by the prop); object prunes the empty
    // array from the emitted value.
    expect(form.node('/emptyArray')?.value).toEqual([]);
    expect(form.getValue()?.emptyArray).toBeUndefined();
  });

  it('a field omitted from defaultValue still auto-fills to minItems', async () => {
    const form = await renderForm(defaultValuePropArraySchema, {
      defaultValue: { partialArray: ['a', 'b'], emptyArray: [] },
    });

    expect(rowCount(form, '/autoFillArray')).toBe(2);
    expect(form.value('/autoFillArray/0')).toBe('auto');
    expect(form.value('/autoFillArray/1')).toBe('auto');
    expect(form.getValue()?.autoFillArray).toEqual(['auto', 'auto']);
  });
});

// ---------------------------------------------------------------------------
// Nested array defaults evaluated independently per nesting level
// ---------------------------------------------------------------------------

describe('nested array default evaluated independently per level', () => {
  it('auto-fills both levels when neither has a default ([[0,0],[0,0]])', async () => {
    const form = await renderForm(nestedArraySchema);

    expect(rowCount(form, '/nestedAutoFill')).toBe(2);
    expect(rowCount(form, '/nestedAutoFill/0')).toBe(2);
    expect(rowCount(form, '/nestedAutoFill/1')).toBe(2);
    expect(form.value('/nestedAutoFill/0/0')).toBe('0');
    expect(form.value('/nestedAutoFill/1/1')).toBe('0');
    expect(form.getValue()?.nestedAutoFill).toEqual([
      [0, 0],
      [0, 0],
    ]);
  });

  it('auto-fills the outer level but uses the inner default per row ([[99],[99]])', async () => {
    const form = await renderForm(nestedArraySchema);

    expect(rowCount(form, '/nestedInnerDefault')).toBe(2);
    // inner default [99] disables inner auto-fill (1 element, not minItems=3)
    expect(rowCount(form, '/nestedInnerDefault/0')).toBe(1);
    expect(rowCount(form, '/nestedInnerDefault/1')).toBe(1);
    expect(form.value('/nestedInnerDefault/0/0')).toBe('99');
    expect(form.getValue()?.nestedInnerDefault).toEqual([[99], [99]]);
  });

  it('uses the outer default verbatim with no auto-fill ([[1],[2,3]])', async () => {
    const form = await renderForm(nestedArraySchema);

    expect(rowCount(form, '/nestedOuterDefault')).toBe(2);
    expect(rowCount(form, '/nestedOuterDefault/0')).toBe(1);
    expect(rowCount(form, '/nestedOuterDefault/1')).toBe(2);
    expect(form.value('/nestedOuterDefault/0/0')).toBe('1');
    expect(form.value('/nestedOuterDefault/1/0')).toBe('2');
    expect(form.value('/nestedOuterDefault/1/1')).toBe('3');
    expect(form.getValue()?.nestedOuterDefault).toEqual([[1], [2, 3]]);
  });
});
