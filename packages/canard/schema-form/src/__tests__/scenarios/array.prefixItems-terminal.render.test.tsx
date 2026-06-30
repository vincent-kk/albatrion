import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';

import type { JsonSchema } from '@winglet/json-schema';

import { renderForm } from '../renderForm';

/**
 * prefixItems (tuple) rendering + terminal-mode arrays.
 *
 * Mirrors stories/35.PrefixItems and stories/27.OptimizeArrayUsecase.
 *
 * Focus / gap coverage:
 *  - Per-index tuple slots each render their typed input (string/number/boolean)
 *    and the node tree value at that index agrees with the DOM.
 *  - maxItems gates the "add item" button (FormTypeInputArray renders it only
 *    when `node.maxItems > node.length`).
 *  - GAP-6: array append (`push` / addItem / full setValue → applyValue) — the
 *    new row appears in the DOM and existing rows are reused (not remounted).
 *  - GAP-7: array removal re-labels surviving rows (data-path) and keeps their
 *    DOM values correct, in lockstep with the node tree.
 *  - terminal arrays expose the value on the array node only — no child
 *    `[data-path]` rows are rendered, yet the node value uses prefixItems
 *    position defaults.
 *
 * Every test asserts BOTH the rendered DOM ([data-path]/value/checked/count)
 * and the node tree (node(path)?.value / getValue()).
 */

const itemPaths = (
  form: Awaited<ReturnType<typeof renderForm>>,
  base: string,
) => form.renderedPaths().filter((p) => p.startsWith(base + '/'));

describe('prefixItems fixed tuple — per-index typed slots', () => {
  it('renders a homogeneous numeric tuple with each position default', async () => {
    const schema = {
      type: 'object',
      properties: {
        coordinate: {
          type: 'array',
          prefixItems: [
            { type: 'number', default: 0 },
            { type: 'number', default: 0 },
            { type: 'number', default: 0 },
          ],
          minItems: 3,
        },
      },
    } satisfies JsonSchema;

    const form = await renderForm(schema);

    // DOM: one rendered slot per prefixItems position.
    expect(form.exists('/coordinate/0')).toBe(true);
    expect(form.exists('/coordinate/1')).toBe(true);
    expect(form.exists('/coordinate/2')).toBe(true);
    expect(form.exists('/coordinate/3')).toBe(false);
    expect(itemPaths(form, '/coordinate')).toEqual([
      '/coordinate/0',
      '/coordinate/1',
      '/coordinate/2',
    ]);
    expect(form.value('/coordinate/0')).toBe('0');
    expect(form.value('/coordinate/2')).toBe('0');

    // Node tree agrees.
    expect(form.node('/coordinate')?.value).toEqual([0, 0, 0]);
    expect(form.getValue()).toEqual({ coordinate: [0, 0, 0] });
  });

  it('renders a heterogeneous [string, number, boolean] tuple with typed inputs', async () => {
    const schema = {
      type: 'object',
      properties: {
        person: {
          type: 'array',
          prefixItems: [
            { type: 'string', default: 'Anonymous' },
            { type: 'number', default: 0 },
            { type: 'boolean', default: true },
          ],
          minItems: 3,
        },
      },
    } satisfies JsonSchema;

    const form = await renderForm(schema);

    // DOM: each slot rendered with the input type for its prefixItems schema.
    expect(form.field('/person/0')?.getAttribute('type')).not.toBe('checkbox');
    expect(form.value('/person/0')).toBe('Anonymous');
    expect(form.field('/person/1')?.getAttribute('type')).toBe('number');
    expect(form.value('/person/1')).toBe('0');
    expect(form.field('/person/2')?.getAttribute('type')).toBe('checkbox');
    expect(form.checked('/person/2')).toBe(true);

    // Node tree agrees, preserving per-position primitive types.
    expect(form.node('/person')?.value).toEqual(['Anonymous', 0, true]);
    expect(form.node('/person/2')?.value).toBe(true);
  });

  it('routes typing into a tuple slot to that index only', async () => {
    const schema = {
      type: 'object',
      properties: {
        person: {
          type: 'array',
          prefixItems: [
            { type: 'string', default: 'Anonymous' },
            { type: 'number', default: 0 },
            { type: 'boolean', default: true },
          ],
          minItems: 3,
        },
      },
    } satisfies JsonSchema;

    const form = await renderForm(schema);
    await form.type('/person/0', 'Zaphod');

    // DOM reflects the edit at index 0; siblings untouched.
    expect(form.value('/person/0')).toBe('Zaphod');
    expect(form.value('/person/1')).toBe('0');
    expect(form.checked('/person/2')).toBe(true);

    // Node tree: only index 0 changed.
    expect(form.node('/person/0')?.value).toBe('Zaphod');
    expect(form.node('/person')?.value).toEqual(['Zaphod', 0, true]);
  });

  it('hides the add button when maxItems equals prefixItems length (closed tuple)', async () => {
    const schema = {
      type: 'object',
      properties: {
        rgb: {
          type: 'array',
          prefixItems: [
            { type: 'number', default: 128 },
            { type: 'number', default: 128 },
            { type: 'number', default: 128 },
          ],
          items: false,
          minItems: 3,
        },
      },
    } satisfies JsonSchema;

    const form = await renderForm(schema);

    // DOM: full tuple rendered, no "add item" affordance (maxItems === length).
    expect(itemPaths(form, '/rgb')).toHaveLength(3);
    expect(form.container.querySelectorAll('[title="add item"]').length).toBe(
      0,
    );

    // Node tree: bounded to prefixItems length.
    const node = form.node('/rgb') as any;
    expect(node?.maxItems).toBe(3);
    expect(node?.length).toBe(3);
    expect(form.node('/rgb')?.value).toEqual([128, 128, 128]);
  });
});

describe('open tuple — prefixItems + items schema', () => {
  it('renders only the prefix slot initially and offers the add button', async () => {
    const schema = {
      type: 'object',
      properties: {
        cmd: {
          type: 'array',
          prefixItems: [{ type: 'string', default: 'echo' }],
          items: { type: 'string', default: '' },
          minItems: 1,
          maxItems: 3,
        },
      },
    } satisfies JsonSchema;

    const form = await renderForm(schema);

    // DOM: only the single prefix position rendered; add button present.
    expect(itemPaths(form, '/cmd')).toEqual(['/cmd/0']);
    expect(form.value('/cmd/0')).toBe('echo');
    expect(form.container.querySelectorAll('[title="add item"]').length).toBe(
      1,
    );

    // Node tree agrees.
    expect(form.node('/cmd')?.value).toEqual(['echo']);
    expect((form.node('/cmd') as any)?.maxItems).toBe(3);
  });

  it('appends a row using the items schema default (GAP-6 push)', async () => {
    const schema = {
      type: 'object',
      properties: {
        cmd: {
          type: 'array',
          prefixItems: [{ type: 'string', default: 'echo' }],
          items: { type: 'string', default: 'arg' },
          minItems: 1,
          maxItems: 3,
        },
      },
    } satisfies JsonSchema;

    const form = await renderForm(schema);
    await form.addItem('/cmd');

    // DOM: a second row appeared and shows the items-schema default.
    expect(itemPaths(form, '/cmd')).toEqual(['/cmd/0', '/cmd/1']);
    expect(form.value('/cmd/0')).toBe('echo');
    expect(form.value('/cmd/1')).toBe('arg');

    // Node tree: length incremented, position 0 still the prefix value.
    expect(form.node('/cmd')?.value).toEqual(['echo', 'arg']);
    expect((form.node('/cmd') as any)?.length).toBe(2);
  });

  it('reuses existing rows on append instead of remounting them (GAP-6 identity)', async () => {
    const schema = {
      type: 'object',
      properties: {
        cmd: {
          type: 'array',
          prefixItems: [{ type: 'string', default: 'echo' }],
          items: { type: 'string', default: '' },
          minItems: 1,
          maxItems: 4,
        },
      },
    } satisfies JsonSchema;

    const form = await renderForm(schema, {
      instrument: true,
      defaultValue: { cmd: ['a', 'b', 'c'] },
    });

    const m0 = form.mountOrdinal('/cmd/0');
    const m1 = form.mountOrdinal('/cmd/1');
    const m2 = form.mountOrdinal('/cmd/2');
    expect(Number.isNaN(m0)).toBe(false);

    await form.addItem('/cmd');

    // Existing rows reused (ordinal unchanged); only the new row added.
    expect(form.mountOrdinal('/cmd/0')).toBe(m0);
    expect(form.mountOrdinal('/cmd/1')).toBe(m1);
    expect(form.mountOrdinal('/cmd/2')).toBe(m2);
    expect(form.exists('/cmd/3')).toBe(true);

    // Node tree agrees.
    expect(form.node('/cmd')?.value).toEqual(['a', 'b', 'c', '']);
  });

  it('hides the add button once length reaches maxItems', async () => {
    const schema = {
      type: 'object',
      properties: {
        cmd: {
          type: 'array',
          prefixItems: [{ type: 'string', default: 'echo' }],
          items: { type: 'string', default: '' },
          minItems: 1,
          maxItems: 3,
        },
      },
    } satisfies JsonSchema;

    const form = await renderForm(schema);
    await form.addItem('/cmd');
    expect(form.container.querySelectorAll('[title="add item"]').length).toBe(
      1,
    ); // length 2 < max 3 → still offered
    await form.addItem('/cmd');

    // DOM: at maxItems the add affordance is gone.
    expect(itemPaths(form, '/cmd')).toEqual(['/cmd/0', '/cmd/1', '/cmd/2']);
    expect(form.container.querySelectorAll('[title="add item"]').length).toBe(
      0,
    );

    // Node tree agrees.
    expect((form.node('/cmd') as any)?.length).toBe(3);
    expect(form.node('/cmd')?.value).toEqual(['echo', '', '']);
  });

  it('renders every row when the whole array is set via setValue (GAP-6 applyValue)', async () => {
    const schema = {
      type: 'object',
      properties: {
        cmd: {
          type: 'array',
          prefixItems: [{ type: 'string', default: 'echo' }],
          items: { type: 'string', default: '' },
          minItems: 1,
          maxItems: 4,
        },
      },
    } satisfies JsonSchema;

    const form = await renderForm(schema);
    await form.setValue({ cmd: ['a', 'b', 'c'] });

    // DOM: the per-item suppressed-publish path still produces 3 rows.
    expect(itemPaths(form, '/cmd')).toEqual(['/cmd/0', '/cmd/1', '/cmd/2']);
    expect(form.value('/cmd/0')).toBe('a');
    expect(form.value('/cmd/1')).toBe('b');
    expect(form.value('/cmd/2')).toBe('c');

    // Node tree agrees.
    expect(form.node('/cmd')?.value).toEqual(['a', 'b', 'c']);
  });
});

describe('item removal — surviving rows re-label (GAP-7)', () => {
  it('removes the middle row and re-labels survivors in DOM and tree', async () => {
    const schema = {
      type: 'object',
      properties: {
        cmd: {
          type: 'array',
          prefixItems: [{ type: 'string', default: 'echo' }],
          items: { type: 'string', default: '' },
          minItems: 1,
          maxItems: 5,
        },
      },
    } satisfies JsonSchema;

    const form = await renderForm(schema, {
      defaultValue: { cmd: ['a', 'b', 'c'] },
    });
    expect(itemPaths(form, '/cmd')).toHaveLength(3);

    await form.removeItem('/cmd', 1);

    // DOM: exactly two rows, re-labeled /0 and /1, with the surviving values.
    expect(itemPaths(form, '/cmd')).toEqual(['/cmd/0', '/cmd/1']);
    expect(form.value('/cmd/0')).toBe('a');
    expect(form.value('/cmd/1')).toBe('c');
    expect(form.exists('/cmd/2')).toBe(false);

    // Node tree agrees.
    expect(form.node('/cmd')?.value).toEqual(['a', 'c']);
    expect(form.node('/cmd/1')?.value).toBe('c');
  });

  it('removes the first row, shifting later values down in DOM and tree', async () => {
    const schema = {
      type: 'object',
      properties: {
        cmd: {
          type: 'array',
          prefixItems: [{ type: 'string', default: 'echo' }],
          items: { type: 'string', default: '' },
          minItems: 1,
          maxItems: 5,
        },
      },
    } satisfies JsonSchema;

    const form = await renderForm(schema, {
      defaultValue: { cmd: ['a', 'b', 'c'] },
    });
    await form.removeItem('/cmd', 0);

    // DOM: survivors shifted to /0 and /1.
    expect(itemPaths(form, '/cmd')).toEqual(['/cmd/0', '/cmd/1']);
    expect(form.value('/cmd/0')).toBe('b');
    expect(form.value('/cmd/1')).toBe('c');

    // Node tree agrees.
    expect(form.node('/cmd')?.value).toEqual(['b', 'c']);
  });
});

describe('terminal-mode array with prefixItems', () => {
  it('uses prefixItems position defaults but renders no child rows', async () => {
    const schema = {
      type: 'object',
      properties: {
        nums: {
          type: 'array',
          terminal: true,
          prefixItems: [
            { type: 'number', default: 10 },
            { type: 'number', default: 20 },
            { type: 'number', default: 30 },
          ],
          items: { type: 'number', default: 0 },
          minItems: 3,
        },
      },
    } satisfies JsonSchema;

    const form = await renderForm(schema);

    // DOM: the array node is rendered, but terminal mode produces no child
    // [data-path] rows and no per-index input.
    expect(form.exists('/nums')).toBe(true);
    expect(itemPaths(form, '/nums')).toEqual([]);
    expect(form.field('/nums/0')).toBeNull();

    // Node tree: value still uses each prefixItems position default.
    expect(form.node('/nums')?.value).toEqual([10, 20, 30]);
    expect(form.getValue()).toEqual({ nums: [10, 20, 30] });
  });

  it('replaces the whole value via setValue without materializing child rows', async () => {
    const schema = {
      type: 'object',
      properties: {
        nums: {
          type: 'array',
          terminal: true,
          prefixItems: [
            { type: 'number', default: 10 },
            { type: 'number', default: 20 },
            { type: 'number', default: 30 },
          ],
          items: { type: 'number', default: 0 },
          minItems: 3,
        },
      },
    } satisfies JsonSchema;

    const form = await renderForm(schema);
    await form.setValue({ nums: [100, 200, 300, 400] });

    // DOM: still no child rows under a terminal array.
    expect(itemPaths(form, '/nums')).toEqual([]);
    expect(form.exists('/nums')).toBe(true);

    // Node tree: value replaced wholesale.
    expect(form.node('/nums')?.value).toEqual([100, 200, 300, 400]);
  });
});

describe('prefixItems priming (two-phase)', () => {
  it('mounts the tuple slots synchronously, then settles their defaults', async () => {
    const schema = {
      type: 'object',
      properties: {
        coordinate: {
          type: 'array',
          prefixItems: [
            { type: 'number', default: 1 },
            { type: 'number', default: 2 },
            { type: 'number', default: 3 },
          ],
          minItems: 3,
        },
      },
    } satisfies JsonSchema;

    const form = await renderForm(schema, { flushOnMount: false });

    // Synchronous snapshot: all tuple slots already present at first paint.
    expect(form.exists('/coordinate/0')).toBe(true);
    expect(form.exists('/coordinate/1')).toBe(true);
    expect(form.exists('/coordinate/2')).toBe(true);

    await form.flush();

    // Settled: DOM values and node tree both reflect the position defaults.
    expect(form.value('/coordinate/0')).toBe('1');
    expect(form.value('/coordinate/1')).toBe('2');
    expect(form.value('/coordinate/2')).toBe('3');
    expect(form.node('/coordinate')?.value).toEqual([1, 2, 3]);
  });
});
