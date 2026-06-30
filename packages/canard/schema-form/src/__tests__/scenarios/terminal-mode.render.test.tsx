import { type FC } from 'react';

import '@testing-library/jest-dom';
import { act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { JsonSchema } from '@winglet/json-schema';

import type { ArrayNode, FormTypeInputProps, ObjectNode } from '@/schema-form';
import { SetValueOption } from '@/schema-form/core';

import { renderForm } from '../renderForm';

/**
 * Terminal-mode rendering — terminal arrays/objects render a SINGLE custom
 * FormTypeInput and own no per-item / per-property child node, whereas a
 * `terminal:false` branch node keeps its child node tree even when the same
 * custom input renders.
 *
 * Load-bearing facts (verified against src/):
 *   - `getNodeGroup`: an object/array becomes `terminal` when `schema.terminal`
 *     is `true` (or a schema-level `FormTypeInput` component is present);
 *     `terminal:false` forces `branch`. A terminal node's strategy returns
 *     `children === null`, so `findNode('/arr/0')` is `null` and no
 *     `[data-path="/arr/0"]` is rendered.
 *   - The custom FormTypeInput below renders a CONTROLLED `<input id={path}>`
 *     serialising `props.value`, so the harness `value(path)` mirrors the node
 *     value on every reactive re-render (UpdateValue), and it deliberately does
 *     NOT render `ChildNodeComponents` — a branch node's children therefore live
 *     in the tree but never reach the DOM.
 *   - Terminal array (`TerminalStrategy`): `push`/`update`/`remove`/`clear`
 *     mutate an immutable copy; `minItems` padding only runs when NO default is
 *     supplied (an explicit `default` wins as-is). Item defaults come from
 *     `items.default` (or the assembled object default for object items).
 *   - Terminal object (`getObjectDefaultValue`): the object-level `default`
 *     seeds the value first (`overwrite:false`), then nested property `default`s
 *     fill the gaps — so object-level defaults take precedence. `propertyKeys`
 *     only REORDERS the assembled value keys; it does not filter them.
 *   - A nullable terminal object with `default:null` stays `null` on mount only
 *     when it has no nested defaults; nested defaults assemble an object.
 *
 * Every test asserts BOTH layers: the rendered DOM (`value`/`exists`/`field`)
 * AND the node tree (`node(path)?.value` / `getValue()` / `children`).
 *
 * Schemas mirror stories/02.TerminalMode.
 */

// ---------------------------------------------------------------------------
// A single custom FormTypeInput, applied to every terminal/branch node under
// test via the `formType: 'box'` marker. Controlled input → reliable DOM mirror.
// ---------------------------------------------------------------------------

const Box: FC<FormTypeInputProps<any>> = ({ path, value }: any) => (
  <input
    id={path}
    readOnly
    data-box="1"
    value={value == null ? '' : JSON.stringify(value)}
  />
);

const boxDefs = [{ test: { formType: 'box' }, Component: Box }] as any;

const render = (jsonSchema: JsonSchema) =>
  renderForm(jsonSchema, { formTypeInputDefinitions: boxDefs });

/** Run an imperative node mutation inside act() and drain the cascade. */
const mutate = async (fn: () => void) => {
  await act(async () => {
    fn();
    await new Promise((r) => setTimeout(r, 0));
  });
};

// ---------------------------------------------------------------------------
// Schemas (mirrored from stories/02.TerminalMode)
// ---------------------------------------------------------------------------

const branchArraySchema = {
  type: 'object',
  properties: {
    arr: {
      type: 'array',
      terminal: false,
      formType: 'box',
      items: { type: 'string' },
      default: ['x', 'y'],
    },
  },
} satisfies JsonSchema;

const terminalArraySeededSchema = {
  type: 'object',
  properties: {
    arr: {
      type: 'array',
      terminal: true,
      formType: 'box',
      items: { type: 'string' },
      default: ['a', 'b'],
    },
  },
} satisfies JsonSchema;

const minItemsNoDefaultSchema = {
  type: 'object',
  properties: {
    arr: {
      type: 'array',
      terminal: true,
      formType: 'box',
      items: { type: 'string', default: 'ARRAY ITEM' },
      minItems: 3,
    },
  },
} satisfies JsonSchema;

const minItemsWithDefaultSchema = {
  type: 'object',
  properties: {
    arr: {
      type: 'array',
      terminal: true,
      formType: 'box',
      items: { type: 'string', default: 'ARRAY ITEM' },
      default: ['AAA', 'BBB'],
      minItems: 3,
    },
  },
} satisfies JsonSchema;

const objectItemsSchema = {
  type: 'object',
  properties: {
    arr: {
      type: 'array',
      terminal: true,
      formType: 'box',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', default: 'John Doe' },
          age: { type: 'number', default: 20 },
        },
      },
      minItems: 2,
    },
  },
} satisfies JsonSchema;

const terminalObjectSchema = {
  type: 'object',
  properties: {
    poster: {
      type: 'object',
      terminal: true,
      formType: 'box',
      properties: {
        url: { type: 'string' },
        format: { type: 'string' },
        size: {
          type: 'object',
          properties: {
            width: { type: 'number' },
            height: { type: 'number' },
          },
        },
      },
    },
  },
} satisfies JsonSchema;

const objectMixedDefaultSchema = {
  type: 'object',
  properties: {
    poster: {
      type: 'object',
      terminal: true,
      formType: 'box',
      properties: {
        url: { type: 'string' },
        format: { type: 'string', default: 'webp' },
        size: {
          type: 'object',
          properties: {
            width: { type: 'number', default: 50 },
            height: { type: 'number', default: 50 },
          },
        },
      },
      default: {
        url: 'http://example-cdn.com/poster.jpg',
        size: { width: 300 },
      },
    },
  },
} satisfies JsonSchema;

const propertyKeysSchema = {
  type: 'object',
  properties: {
    poster: {
      type: 'object',
      terminal: true,
      formType: 'box',
      propertyKeys: ['format', 'size', 'url'],
      properties: {
        url: { type: 'string', default: 'U' },
        format: { type: 'string', default: 'F' },
        size: { type: 'string', default: 'S' },
      },
    },
  },
} satisfies JsonSchema;

const nullableNullSchema = {
  type: 'object',
  properties: {
    config: {
      type: ['object', 'null'],
      terminal: true,
      default: null,
      formType: 'box',
      properties: {
        theme: { type: 'string' },
        language: { type: 'string' },
      },
    },
  },
} satisfies JsonSchema;

// ---------------------------------------------------------------------------
// Terminal vs branch structure
// ---------------------------------------------------------------------------

describe('terminal mode — structure (single custom input, no child nodes)', () => {
  it('terminal array renders one custom input and owns no item child node', async () => {
    const form = await render(terminalArraySeededSchema);

    // DOM: the single custom input is present and mirrors the array value.
    expect(form.field('/arr')).not.toBeNull();
    expect(form.value('/arr')).toBe('["a","b"]');
    // DOM: no per-item child wrapper rendered.
    expect(form.exists('/arr/0')).toBe(false);
    expect(form.renderedPaths()).not.toContain('/arr/0');

    // tree: terminal strategy → no children. findNode of a deeper path falls
    // back to the nearest resolvable ancestor (the terminal node itself), so
    // there is no distinct item node.
    expect(form.node('/arr')?.children).toBeNull();
    expect(form.node('/arr/0')).toBe(form.node('/arr'));
    expect(form.node('/arr')?.value).toEqual(['a', 'b']);
  });

  it('terminal:false branch array renders the custom input AND keeps its child node tree', async () => {
    const form = await render(branchArraySchema);

    // DOM: the custom input renders (branch node still resolves the FormTypeInput).
    expect(form.field('/arr')).not.toBeNull();
    expect(form.value('/arr')).toBe('["x","y"]');
    // DOM: the custom input does not render ChildNodeComponents → no child wrappers.
    expect(form.exists('/arr/0')).toBe(false);

    // tree: branch strategy → item child nodes exist.
    expect(form.node('/arr')?.children?.length).toBe(2);
    expect(form.node('/arr/0')?.value).toBe('x');
    expect(form.node('/arr/1')?.value).toBe('y');
    expect(form.getValue()?.arr).toEqual(['x', 'y']);
  });

  it('terminal object renders one custom input and owns no property child node', async () => {
    const form = await render(terminalObjectSchema);
    await mutate(() =>
      (form.node('/poster') as ObjectNode | null)?.setValue(
        { url: 'u', format: 'jpg', size: { width: 1, height: 2 } },
        SetValueOption.Overwrite,
      ),
    );

    // DOM: single custom input mirrors the whole object value.
    expect(form.field('/poster')).not.toBeNull();
    expect(form.value('/poster')).toBe(
      JSON.stringify({
        url: 'u',
        format: 'jpg',
        size: { width: 1, height: 2 },
      }),
    );
    expect(form.exists('/poster/url')).toBe(false);

    // tree: terminal object → no property children. A deeper findNode falls
    // back to the nearest ancestor (the terminal node itself).
    expect(form.node('/poster')?.children).toBeNull();
    expect(form.node('/poster/url')).toBe(form.node('/poster'));
    expect(form.getValue()?.poster?.url).toBe('u');
  });
});

// ---------------------------------------------------------------------------
// Terminal array mutations (push / update / remove / clear / setValue)
// ---------------------------------------------------------------------------

describe('terminal mode — array mutations reflect in DOM and tree', () => {
  it('push appends an item', async () => {
    const form = await render(terminalArraySeededSchema);
    expect(form.node('/arr')?.value).toEqual(['a', 'b']);

    await mutate(() => (form.node('/arr') as ArrayNode | null)?.push('c'));

    expect(form.node('/arr')?.value).toEqual(['a', 'b', 'c']);
    expect(form.getValue()?.arr).toEqual(['a', 'b', 'c']);
    expect(form.value('/arr')).toBe('["a","b","c"]');
  });

  it('update replaces an item by index', async () => {
    const form = await render(terminalArraySeededSchema);

    await mutate(() =>
      (form.node('/arr') as ArrayNode | null)?.update(1, 'WOW2'),
    );

    expect(form.node('/arr')?.value).toEqual(['a', 'WOW2']);
    expect(form.getValue()?.arr).toEqual(['a', 'WOW2']);
    expect(form.value('/arr')).toBe('["a","WOW2"]');
  });

  it('remove drops an item by index', async () => {
    const form = await render(terminalArraySeededSchema);

    await mutate(() => (form.node('/arr') as ArrayNode | null)?.remove(0));

    expect(form.node('/arr')?.value).toEqual(['b']);
    expect(form.getValue()?.arr).toEqual(['b']);
    expect(form.value('/arr')).toBe('["b"]');
  });

  it('clear empties the array', async () => {
    const form = await render(terminalArraySeededSchema);

    await mutate(() => (form.node('/arr') as ArrayNode | null)?.clear());

    // terminal clear emits [] (no minItems refill); empty array is omitted
    // from the root value via omitEmptyArray.
    expect(form.node('/arr')?.value).toEqual([]);
    expect(form.value('/arr')).toBe('[]');
    expect(form.getValue()?.arr).toBeUndefined();
  });

  it('setValue(undefined) removes all items and excludes the key from the value', async () => {
    const form = await render(terminalArraySeededSchema);

    await mutate(() => form.node('/arr')?.setValue(undefined));

    expect(form.node('/arr')?.value).toBeUndefined();
    expect(form.value('/arr')).toBe('');
    expect(form.getValue()?.arr).toBeUndefined();
    expect('arr' in (form.getValue() ?? {})).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Terminal array defaults & minItems
// ---------------------------------------------------------------------------

describe('terminal mode — array defaults & minItems padding', () => {
  it('pads to minItems with items.default when no array default is given', async () => {
    const form = await render(minItemsNoDefaultSchema);

    // No default → constructor pads up to minItems:3 using items.default.
    expect(form.node('/arr')?.value).toEqual([
      'ARRAY ITEM',
      'ARRAY ITEM',
      'ARRAY ITEM',
    ]);
    expect(form.getValue()?.arr).toHaveLength(3);
    expect(form.value('/arr')).toBe('["ARRAY ITEM","ARRAY ITEM","ARRAY ITEM"]');
  });

  it('uses an explicit array default as-is (minItems does not pad over it)', async () => {
    const form = await render(minItemsWithDefaultSchema);

    // hasDefault → only the default items are seeded; no minItems padding.
    expect(form.node('/arr')?.value).toEqual(['AAA', 'BBB']);
    expect(form.getValue()?.arr).toEqual(['AAA', 'BBB']);
    expect(form.value('/arr')).toBe('["AAA","BBB"]');
  });

  it('pads object-item arrays with the assembled object default', async () => {
    const form = await render(objectItemsSchema);

    // minItems:2, no array default → two items assembled from items defaults.
    const expected = { name: 'John Doe', age: 20 };
    expect(form.node('/arr')?.value).toEqual([expected, expected]);
    expect(form.getValue()?.arr).toEqual([expected, expected]);
    expect(form.value('/arr')).toBe(JSON.stringify([expected, expected]));
  });
});

// ---------------------------------------------------------------------------
// Terminal object defaults, precedence & propertyKeys
// ---------------------------------------------------------------------------

describe('terminal mode — object default assembly', () => {
  it('object-level default takes precedence and property defaults fill the gaps', async () => {
    const form = await render(objectMixedDefaultSchema);

    const expected = {
      url: 'http://example-cdn.com/poster.jpg', // object-level default
      format: 'webp', // property default fills the gap
      size: { width: 300, height: 50 }, // width from object default wins, height filled
    };
    expect(form.node('/poster')?.value).toEqual(expected);
    expect(form.getValue()?.poster).toEqual(expected);
    expect(form.value('/poster')).toBe(JSON.stringify(expected));
  });

  it('propertyKeys reorders the assembled value keys', async () => {
    const form = await render(propertyKeysSchema);

    // propertyKeys ['format','size','url'] reorders the keys (it does not filter).
    expect(Object.keys(form.node('/poster')?.value ?? {})).toEqual([
      'format',
      'size',
      'url',
    ]);
    expect(form.value('/poster')).toBe(
      JSON.stringify({ format: 'F', size: 'S', url: 'U' }),
    );
    expect(Object.keys(form.getValue()?.poster ?? {})).toEqual([
      'format',
      'size',
      'url',
    ]);
  });
});

// ---------------------------------------------------------------------------
// Nullable terminal object
// ---------------------------------------------------------------------------

describe('terminal mode — nullable object default:null', () => {
  it('stays null on mount when there are no nested defaults', async () => {
    const form = await render(nullableNullSchema);

    // default:null + no sub-defaults → value remains null on mount.
    expect(form.node('/config')?.value).toBeNull();
    expect(form.value('/config')).toBe('');
    expect(form.getValue()?.config).toBeNull();
    // the node still renders its single custom input.
    expect(form.field('/config')).not.toBeNull();
    expect(form.exists('/config/theme')).toBe(false);
  });

  it('toggles between an object value and null', async () => {
    const form = await render(nullableNullSchema);
    expect(form.node('/config')?.value).toBeNull();

    // null -> object
    await mutate(() =>
      (form.node('/config') as ObjectNode | null)?.setValue(
        { theme: 'dark', language: 'ko' },
        SetValueOption.Overwrite,
      ),
    );
    expect(form.node('/config')?.value).toEqual({
      theme: 'dark',
      language: 'ko',
    });
    expect(form.getValue()?.config).toEqual({ theme: 'dark', language: 'ko' });
    expect(form.value('/config')).toBe(
      JSON.stringify({ theme: 'dark', language: 'ko' }),
    );

    // object -> null
    await mutate(() =>
      (form.node('/config') as ObjectNode | null)?.setValue(
        null,
        SetValueOption.Overwrite,
      ),
    );
    expect(form.node('/config')?.value).toBeNull();
    expect(form.getValue()?.config).toBeNull();
    expect(form.value('/config')).toBe('');
  });
});
