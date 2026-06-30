import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';

import type { JsonSchema } from '@winglet/json-schema';

import { renderForm } from '../renderForm';

/**
 * GAP-10 — Computed visibility (`computed.visible` / `&active`) proxy null-gating.
 *
 * `SchemaNodeProxy` renders `null` when `!node.enabled`
 * (`enabled = __scoped__ && active && visible`). A hidden child stays in the
 * parent's child-component list but self-gates to `null`, so its `[data-path]`
 * wrapper is ABSENT from the DOM.
 *
 * The render-vs-tree contract this suite pins:
 *   - `visible:false`  → `[data-path]` absent, but the value is PRESERVED in the
 *     parent value and repopulates the (re-mounted) input when shown again.
 *   - `active:false`   → `[data-path]` absent AND the key is OMITTED from the
 *     parent value (`__processComputedProperties__` strips inactive children).
 *
 * Every case asserts BOTH layers: rendered DOM (`exists` / `value` /
 * `renderedPaths`) AND node tree (`node(path)?.value` / `getValue()`).
 */

// ---------------------------------------------------------------------------
// Schemas (mirrored from stories/29.VisibleUsecase + 11.ComputedProps)
// ---------------------------------------------------------------------------

/** showOptional (boolean) toggles a `&visible` string whose value is preserved. */
const visiblePreserveSchema = {
  type: 'object',
  properties: {
    showOptional: { type: 'boolean', default: true },
    optionalVisible: {
      type: 'string',
      default: 'init',
      '&visible': '../showOptional === true',
    },
    always: { type: 'string' },
  },
} satisfies JsonSchema;

/** enableOptional (boolean) toggles an `&active` string whose value is removed. */
const activeRemoveSchema = {
  type: 'object',
  properties: {
    enableOptional: { type: 'boolean', default: true },
    optionalActive: {
      type: 'string',
      default: 'init',
      '&active': '../enableOptional === true',
    },
  },
} satisfies JsonSchema;

/** enum discriminator switches which `&visible` date field is shown. */
const discriminatorSchema = {
  type: 'object',
  properties: {
    category: { type: 'string', enum: ['game', 'movie'], default: 'game' },
    openingDate: { type: 'string', '&visible': '../category === "game"' },
    releaseDate: { type: 'string', '&visible': '../category === "movie"' },
  },
} satisfies JsonSchema;

/** `computed.visible` with an explicit `watch` dependency list. */
const watchVisibleSchema = {
  type: 'object',
  properties: {
    trigger: { type: 'string', enum: ['off', 'on'], default: 'off' },
    detail: {
      type: 'string',
      default: 'd',
      computed: {
        visible: '../trigger === "on"',
        watch: ['../trigger'],
      },
    },
  },
} satisfies JsonSchema;

/** Side-by-side visible vs active driven by the same `mode` discriminator. */
const visibleVsActiveSchema = {
  type: 'object',
  properties: {
    mode: { type: 'string', enum: ['visible', 'active'], default: 'visible' },
    visibleField: { type: 'string', '&visible': '../mode === "visible"' },
    activeField: { type: 'string', '&active': '../mode === "visible"' },
  },
} satisfies JsonSchema;

describe('GAP-10 computed.visible — value preserved when hidden by sibling', () => {
  it('renders the gated field with its default when the sibling enables it', async () => {
    const form = await renderForm(visiblePreserveSchema);

    expect(form.exists('/optionalVisible')).toBe(true);
    expect(form.value('/optionalVisible')).toBe('init');
    // tree agrees
    expect(form.node('/optionalVisible')?.value).toBe('init');
    expect(form.getValue()?.optionalVisible).toBe('init');
    expect(form.caughtErrors()).toEqual([]);
  });

  it('hides [data-path] on user toggle-off yet keeps the value, repopulating on toggle-on', async () => {
    const form = await renderForm(visiblePreserveSchema);
    expect(form.exists('/optionalVisible')).toBe(true);

    // User unchecks showOptional -> only that field's value changes.
    await form.toggle('/showOptional');

    // DOM: gated wrapper gone; tree: value PRESERVED (visible, not active).
    expect(form.exists('/optionalVisible')).toBe(false);
    expect(form.renderedPaths()).not.toContain('/optionalVisible');
    expect(form.getValue()?.optionalVisible).toBe('init');
    expect(form.node('/optionalVisible')?.value).toBe('init');

    // Re-check -> field re-mounts with the preserved value in the DOM.
    await form.toggle('/showOptional');
    expect(form.exists('/optionalVisible')).toBe(true);
    expect(form.value('/optionalVisible')).toBe('init');
    expect(form.getValue()?.optionalVisible).toBe('init');
  });

  it('preserves a user-typed value across a hide/show cycle (DOM + tree)', async () => {
    const form = await renderForm(visiblePreserveSchema);

    await form.type('/optionalVisible', 'typed-value');
    expect(form.value('/optionalVisible')).toBe('typed-value');
    expect(form.node('/optionalVisible')?.value).toBe('typed-value');

    await form.toggle('/showOptional'); // hide
    expect(form.exists('/optionalVisible')).toBe(false);
    expect(form.getValue()?.optionalVisible).toBe('typed-value');

    await form.toggle('/showOptional'); // show -> remount with preserved value
    expect(form.exists('/optionalVisible')).toBe(true);
    expect(form.value('/optionalVisible')).toBe('typed-value');
    expect(form.node('/optionalVisible')?.value).toBe('typed-value');
  });

  it('hides the field on programmatic setValue and re-reveals it with the retained value', async () => {
    const form = await renderForm(visiblePreserveSchema);

    await form.setValue({ showOptional: false, optionalVisible: 'kept' });
    expect(form.exists('/optionalVisible')).toBe(false);
    expect(form.getValue()?.optionalVisible).toBe('kept');
    expect(form.node('/optionalVisible')?.value).toBe('kept');

    await form.setValue({ showOptional: true, optionalVisible: 'kept' });
    expect(form.exists('/optionalVisible')).toBe(true);
    expect(form.value('/optionalVisible')).toBe('kept');
    expect(form.getValue()?.optionalVisible).toBe('kept');
  });
});

describe('GAP-10 computed.active — value omitted from parent when deactivated', () => {
  it('renders the active field with its default while the sibling enables it', async () => {
    const form = await renderForm(activeRemoveSchema);

    expect(form.exists('/optionalActive')).toBe(true);
    expect(form.value('/optionalActive')).toBe('init');
    expect(form.node('/optionalActive')?.value).toBe('init');
    expect(form.getValue()?.optionalActive).toBe('init');
  });

  it('removes [data-path] AND drops the key from parent value when deactivated', async () => {
    const form = await renderForm(activeRemoveSchema);
    expect(form.exists('/optionalActive')).toBe(true);

    await form.setValue({ enableOptional: false, optionalActive: 'drop' });

    // DOM gone, and unlike `visible`, the value is stripped from the parent.
    expect(form.exists('/optionalActive')).toBe(false);
    expect(form.renderedPaths()).not.toContain('/optionalActive');
    const value = form.getValue();
    expect(value?.enableOptional).toBe(false);
    expect('optionalActive' in (value ?? {})).toBe(false);
    expect(value?.optionalActive).toBeUndefined();
  });

  it('re-adds the field to the DOM when reactivated', async () => {
    const form = await renderForm(activeRemoveSchema);

    await form.setValue({ enableOptional: false });
    expect(form.exists('/optionalActive')).toBe(false);
    expect(form.getValue()?.optionalActive).toBeUndefined();

    await form.setValue({ enableOptional: true });
    expect(form.exists('/optionalActive')).toBe(true);
    // Field is back in the DOM; tree key is present again.
    expect(form.getValue()?.enableOptional).toBe(true);
    expect(form.node('/optionalActive')).not.toBeNull();
  });
});

describe('GAP-10 enum discriminator switches the visible field', () => {
  it('shows only the branch matching the default discriminator', async () => {
    const form = await renderForm(discriminatorSchema);

    expect(form.exists('/openingDate')).toBe(true);
    expect(form.exists('/releaseDate')).toBe(false);
    expect(form.node('/openingDate')).not.toBeNull();
  });

  it('swaps visible fields on selectOption with no duplicate wrappers', async () => {
    const form = await renderForm(discriminatorSchema);

    await form.selectOption('/category', 'movie');

    expect(form.value('/category')).toBe('movie');
    expect(form.getValue()?.category).toBe('movie');
    expect(form.exists('/openingDate')).toBe(false);
    expect(form.exists('/releaseDate')).toBe(true);

    const paths = form.renderedPaths();
    expect(paths.filter((p) => p === '/releaseDate')).toHaveLength(1);
    expect(paths).not.toContain('/openingDate');
  });
});

describe('GAP-10 computed.visible with explicit watch dependency', () => {
  it('toggles visibility when the watched sibling changes', async () => {
    const form = await renderForm(watchVisibleSchema);

    // trigger=off -> detail hidden in DOM.
    expect(form.exists('/trigger')).toBe(true);
    expect(form.exists('/detail')).toBe(false);

    await form.selectOption('/trigger', 'on');

    // Watched dependency fired -> detail revealed with its default value.
    expect(form.getValue()?.trigger).toBe('on');
    expect(form.exists('/detail')).toBe(true);
    expect(form.value('/detail')).toBe('d');
    expect(form.node('/detail')?.value).toBe('d');

    // Back to off -> hidden again, value still preserved (visible semantics).
    await form.selectOption('/trigger', 'off');
    expect(form.exists('/detail')).toBe(false);
    expect(form.getValue()?.detail).toBe('d');
  });
});

describe('GAP-10 visible vs active distinction under one discriminator', () => {
  it('hides both but preserves the visible value and omits the active value', async () => {
    const form = await renderForm(visibleVsActiveSchema);

    // mode=visible default -> both rendered.
    expect(form.exists('/visibleField')).toBe(true);
    expect(form.exists('/activeField')).toBe(true);

    await form.setValue({
      mode: 'active',
      visibleField: 'keep',
      activeField: 'drop',
    });

    // Both wrappers gone from the DOM.
    expect(form.exists('/visibleField')).toBe(false);
    expect(form.exists('/activeField')).toBe(false);

    // But the tree distinguishes them: visible preserved, active omitted.
    const value = form.getValue();
    expect(value?.visibleField).toBe('keep');
    expect('activeField' in (value ?? {})).toBe(false);
    expect(value?.activeField).toBeUndefined();
    expect(form.caughtErrors()).toEqual([]);
  });
});

describe('GAP-10 initial-mount priming of a visibility-gated field (two-phase)', () => {
  it('settles to the visible field present in the DOM after the cascade drains', async () => {
    const form = await renderForm(visiblePreserveSchema, {
      flushOnMount: false,
      defaultValue: { showOptional: true, optionalVisible: 'primed' },
    });

    // Synchronous snapshot: discriminator is always present at first paint.
    expect(form.exists('/showOptional')).toBe(true);

    // After the composition cascade drains, the gated field is present in the
    // DOM and the node tree agrees (no priming drift).
    await form.flush();
    expect(form.exists('/optionalVisible')).toBe(true);
    expect(form.value('/optionalVisible')).toBe('primed');
    expect(form.node('/optionalVisible')?.value).toBe('primed');
    expect(form.getValue()?.optionalVisible).toBe('primed');
    expect(form.caughtErrors()).toEqual([]);
  });
});
