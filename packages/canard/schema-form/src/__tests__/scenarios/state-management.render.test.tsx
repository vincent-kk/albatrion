import '@testing-library/jest-dom';
import { act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { JsonSchema } from '@winglet/json-schema';

import {
  type FormTypeRendererProps,
  NodeEventType,
  NodeState,
  useSchemaNodeTracker,
} from '@/schema-form';
import { ValidationMode } from '@/schema-form/core';

import { type FormHarness, renderForm } from '../renderForm';

/**
 * State-management render suite — node *state* (Dirty / Touched / ShowError)
 * vs node *value* separation, observed through the public `FormHandle` and the
 * node API, asserting BOTH the node tree AND the rendered DOM.
 *
 * Load-bearing facts (verified against src/):
 *   - Typing fires the input `onChange`, which sets `NodeState.Dirty` on that
 *     node (`SchemaNodeInput.handleChange`). `NodeState.Touched` is set on BLUR
 *     via a `requestAnimationFrame` callback (`handleBlur`), so a touched
 *     assertion needs a focus-out + a macrotask drain (`flush(>16ms)`).
 *   - `handle.setState(s)` → `rootNode.setSubtreeState(s)`; `handle.clearState()`
 *     → `rootNode.clearSubtreeState()`; `handle.getState()` → `rootNode.globalState`.
 *   - `checkShowError` (FormTypeRendererProvider) evaluates the per-node
 *     `NodeState.ShowError` flag FIRST: when present it overrides the form-level
 *     `showError` mode. Default mode is `ShowError.DirtyTouched`, so an invalid
 *     value is hidden until dirty&touched OR an explicit `ShowError` flag.
 *   - `clearState()` clears flags but KEEPS values (no remount). `reset()` bumps
 *     the form version key → full remount → uncontrolled inputs revert to
 *     defaults AND flags clear. `node.resetSubtree()` resets only that subtree's
 *     values to defaults and clears its subtree state.
 *   - `NodeState.Dirty=1, Touched=2, ShowError=4`; `node.state` is keyed by these
 *     numeric flags. The default renderer shows NO dirty/touched indicator, so a
 *     `CustomFormTypeRenderer` exposes one as `[data-indicator]` data-attributes
 *     while still rendering the uncontrolled `<Input/>` and the error `<em>`.
 *
 * Schemas mirror stories/38.StateManagement and stories/15.NodeState.
 */

// ---------------------------------------------------------------------------
// Custom renderer exposing per-node state as queryable DOM data-attributes.
// `useSchemaNodeTracker(UpdateState)` forces a re-render on state-only changes
// (the memoised renderer would otherwise be skipped when value/error are equal).
// ---------------------------------------------------------------------------

const StateRenderer = ({
  depth,
  node,
  path,
  Input,
  errorMessage,
}: FormTypeRendererProps) => {
  useSchemaNodeTracker(
    node,
    NodeEventType.UpdateState | NodeEventType.UpdateError,
  );
  if (depth === 0) return <Input />;
  const state = node.state ?? {};
  const dirty = state[NodeState.Dirty] === true;
  const touched = state[NodeState.Touched] === true;
  const showError = state[NodeState.ShowError] === true;
  return (
    <div>
      <Input />
      <span
        data-indicator={path}
        data-dirty={String(dirty)}
        data-touched={String(touched)}
        data-show-error={String(showError)}
      />
      <em>{errorMessage}</em>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const indicatorOf = (form: FormHarness, path: string): HTMLElement | null =>
  form.container.querySelector(`[data-indicator="${path}"]`);

/** Run an imperative (non-React-event) call inside act, then drain the cascade. */
const runImperative = async (
  _form: FormHarness,
  fn: () => void,
): Promise<void> => {
  await act(async () => {
    fn();
    await new Promise((r) => setTimeout(r, 0));
  });
};

/** Move focus away from the currently-focused field to fire its blur (Touched). */
const blurInto = async (form: FormHarness, awayPath: string): Promise<void> => {
  await form.user.click(form.field(awayPath)!);
  // Touched is set inside requestAnimationFrame; drain past the rAF timer.
  await form.flush(30);
};

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const profileSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', default: 'John' },
    email: { type: 'string', default: 'john@example.com' },
    address: {
      type: 'object',
      properties: {
        city: { type: 'string', default: 'Seoul' },
        zip: { type: 'string', default: '00000' },
      },
    },
  },
} satisfies JsonSchema;

const validatedSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 3,
      errorMessages: { minLength: 'TOO_SHORT' },
    },
  },
} satisfies JsonSchema;

const listSchema = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: { label: { type: 'string', default: 'item' } },
      },
    },
  },
} satisfies JsonSchema;

// ---------------------------------------------------------------------------
// Dirty / Touched from interaction
// ---------------------------------------------------------------------------

describe('state-management — interaction sets Dirty/Touched (tree + indicator)', () => {
  it('typing sets Dirty on the edited node and renders the dirty indicator', async () => {
    const form = await renderForm(profileSchema, {
      CustomFormTypeRenderer: StateRenderer,
    });

    await form.type('/name', 'Jane');

    // tree: Dirty set, Touched not yet (no blur)
    expect(form.node('/name')?.state[NodeState.Dirty]).toBe(true);
    expect(form.node('/name')?.state[NodeState.Touched]).toBeFalsy();
    // DOM: indicator mirrors the flag and the value reflects the edit
    expect(indicatorOf(form, '/name')?.dataset.dirty).toBe('true');
    expect(indicatorOf(form, '/name')?.dataset.touched).toBe('false');
    expect(form.value('/name')).toBe('Jane');
    expect(form.getValue()?.name).toBe('Jane');
    expect(form.caughtErrors()).toEqual([]);
  });

  it('blurring a typed field sets Touched in the tree and the indicator', async () => {
    const form = await renderForm(profileSchema, {
      CustomFormTypeRenderer: StateRenderer,
    });

    await form.type('/name', 'Jane');
    await blurInto(form, '/email');

    expect(form.node('/name')?.state[NodeState.Touched]).toBe(true);
    expect(form.node('/name')?.state[NodeState.Dirty]).toBe(true);
    expect(indicatorOf(form, '/name')?.dataset.touched).toBe('true');
    // value preserved through the blur
    expect(form.value('/name')).toBe('Jane');
  });

  it('leaves an untouched sibling clean in both layers', async () => {
    const form = await renderForm(profileSchema, {
      CustomFormTypeRenderer: StateRenderer,
    });

    await form.type('/name', 'Jane');

    expect(form.node('/email')?.state[NodeState.Dirty]).toBeFalsy();
    expect(indicatorOf(form, '/email')?.dataset.dirty).toBe('false');
    expect(form.value('/email')).toBe('john@example.com');
  });
});

// ---------------------------------------------------------------------------
// clearState / getState — flags clear, values stay
// ---------------------------------------------------------------------------

describe('state-management — clearState clears flags but keeps values', () => {
  it('clears Dirty flags across the tree while preserving DOM and tree values', async () => {
    const form = await renderForm(profileSchema, {
      CustomFormTypeRenderer: StateRenderer,
    });

    await form.type('/name', 'Jane');
    await form.type('/address/city', 'Busan');
    expect(form.node('/name')?.state[NodeState.Dirty]).toBe(true);
    expect(form.node('/address/city')?.state[NodeState.Dirty]).toBe(true);

    await runImperative(form, () => form.handle.clearState());

    // flags cleared (tree + indicator)
    expect(form.node('/name')?.state[NodeState.Dirty]).toBeFalsy();
    expect(form.node('/address/city')?.state[NodeState.Dirty]).toBeFalsy();
    expect(indicatorOf(form, '/name')?.dataset.dirty).toBe('false');
    expect(indicatorOf(form, '/address/city')?.dataset.dirty).toBe('false');
    // values KEPT (DOM + tree) — this is the clearState contract
    expect(form.value('/name')).toBe('Jane');
    expect(form.value('/address/city')).toBe('Busan');
    expect(form.getValue()?.name).toBe('Jane');
    expect(form.getValue()?.address?.city).toBe('Busan');
  });

  it('reflects global Dirty via getState() then empties it after clearState()', async () => {
    const form = await renderForm(profileSchema, {
      CustomFormTypeRenderer: StateRenderer,
    });

    await form.type('/name', 'Jane');
    expect(form.handle.getState()[NodeState.Dirty]).toBe(true);

    await runImperative(form, () => form.handle.clearState());
    expect(form.handle.getState()).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// setState ShowError — error <em> appears without changing values
// ---------------------------------------------------------------------------

describe('state-management — setState drives error visibility, not value', () => {
  it('setState({Dirty,Touched,ShowError}) shows the error <em> without changing values', async () => {
    const form = await renderForm(validatedSchema, {
      validator: true,
      validationMode: ValidationMode.OnChange,
      CustomFormTypeRenderer: StateRenderer,
      defaultValue: { name: 'ab' },
    });
    await form.flush();

    // tree already holds the error, but the default DirtyTouched mode hides it
    expect(
      form.node('/name')?.errors.some((e) => e.keyword === 'minLength'),
    ).toBe(true);
    expect(form.errorTexts()).not.toContain('TOO_SHORT');

    await runImperative(form, () =>
      form.handle.setState({
        [NodeState.Dirty]: true,
        [NodeState.Touched]: true,
        [NodeState.ShowError]: true,
      }),
    );

    // DOM now shows the error; value is untouched
    expect(form.errorTexts()).toContain('TOO_SHORT');
    expect(form.value('/name')).toBe('ab');
    expect(form.getValue()?.name).toBe('ab');
    expect(form.node('/name')?.state[NodeState.ShowError]).toBe(true);
  });

  it('setState({ShowError}) alone forces the error visible regardless of dirty/touched', async () => {
    const form = await renderForm(validatedSchema, {
      validator: true,
      validationMode: ValidationMode.OnChange,
      CustomFormTypeRenderer: StateRenderer,
      defaultValue: { name: 'ab' },
    });
    await form.flush();
    expect(form.errorTexts()).not.toContain('TOO_SHORT');

    await runImperative(form, () =>
      form.handle.setState({ [NodeState.ShowError]: true }),
    );

    expect(form.errorTexts()).toContain('TOO_SHORT');
    // the override worked WITHOUT marking the node dirty or touched
    expect(form.node('/name')?.state[NodeState.Dirty]).toBeFalsy();
    expect(form.node('/name')?.state[NodeState.Touched]).toBeFalsy();
  });

  it('clearState() hides the error <em> again while the tree error persists', async () => {
    const form = await renderForm(validatedSchema, {
      validator: true,
      validationMode: ValidationMode.OnChange,
      CustomFormTypeRenderer: StateRenderer,
      defaultValue: { name: 'ab' },
    });
    await form.flush();

    await runImperative(form, () =>
      form.handle.setState({ [NodeState.ShowError]: true }),
    );
    expect(form.errorTexts()).toContain('TOO_SHORT');

    await runImperative(form, () => form.handle.clearState());

    // DOM error hidden, value intact, but the validation error is still in the tree
    expect(form.errorTexts()).not.toContain('TOO_SHORT');
    expect(form.value('/name')).toBe('ab');
    expect(
      form.node('/name')?.errors.some((e) => e.keyword === 'minLength'),
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Subtree state ops scoped to a node (setSubtreeState / clearSubtreeState)
// ---------------------------------------------------------------------------

describe('state-management — subtree ops affect only the target subtree', () => {
  it('setSubtreeState on /address flags only that subtree (tree + indicator)', async () => {
    const form = await renderForm(profileSchema, {
      CustomFormTypeRenderer: StateRenderer,
    });

    await runImperative(form, () =>
      form.node('/address')?.setSubtreeState({ [NodeState.Dirty]: true }),
    );

    expect(form.node('/address/city')?.state[NodeState.Dirty]).toBe(true);
    expect(form.node('/address/zip')?.state[NodeState.Dirty]).toBe(true);
    expect(form.node('/name')?.state[NodeState.Dirty]).toBeFalsy();
    // DOM
    expect(indicatorOf(form, '/address/city')?.dataset.dirty).toBe('true');
    expect(indicatorOf(form, '/name')?.dataset.dirty).toBe('false');
  });

  it('clearSubtreeState on /address clears only that subtree, keeping siblings', async () => {
    const form = await renderForm(profileSchema, {
      CustomFormTypeRenderer: StateRenderer,
    });

    // mark the whole tree dirty via the handle, then clear just /address
    await runImperative(form, () =>
      form.handle.setState({ [NodeState.Dirty]: true }),
    );
    expect(form.node('/name')?.state[NodeState.Dirty]).toBe(true);
    expect(form.node('/address/city')?.state[NodeState.Dirty]).toBe(true);

    await runImperative(form, () => form.node('/address')?.clearSubtreeState());

    expect(form.node('/address/city')?.state[NodeState.Dirty]).toBeFalsy();
    expect(form.node('/name')?.state[NodeState.Dirty]).toBe(true);
    // DOM mirrors the partial clear
    expect(indicatorOf(form, '/address/city')?.dataset.dirty).toBe('false');
    expect(indicatorOf(form, '/name')?.dataset.dirty).toBe('true');
  });
});

// ---------------------------------------------------------------------------
// reset() vs clearState() divergence + resetSubtree()
// ---------------------------------------------------------------------------

describe('state-management — reset vs clearState vs resetSubtree (values)', () => {
  it('reset() restores defaults and remounts the input (clearing flags)', async () => {
    const form = await renderForm(profileSchema, { instrument: true });

    await form.type('/name', 'Jane');
    const before = form.mountOrdinal('/name');
    expect(form.value('/name')).toBe('Jane');
    expect(form.node('/name')?.state[NodeState.Dirty]).toBe(true);

    await form.reset();

    // value reverted to default via a remount, flags cleared
    expect(form.value('/name')).toBe('John');
    expect(form.getValue()?.name).toBe('John');
    expect(form.mountOrdinal('/name')).toBeGreaterThan(before);
    expect(form.node('/name')?.state[NodeState.Dirty]).toBeFalsy();
    expect(form.caughtErrors()).toEqual([]);
  });

  it('clearState() keeps the modified value (diverging from reset)', async () => {
    const form = await renderForm(profileSchema, { instrument: true });

    await form.type('/name', 'Jane');
    const before = form.mountOrdinal('/name');

    await runImperative(form, () => form.handle.clearState());

    // value KEPT and NO remount — opposite of reset()
    expect(form.value('/name')).toBe('Jane');
    expect(form.getValue()?.name).toBe('Jane');
    expect(form.mountOrdinal('/name')).toBe(before);
    expect(form.node('/name')?.state[NodeState.Dirty]).toBeFalsy();
  });

  it('resetSubtree() on /address resets only that subtree to defaults, keeping siblings', async () => {
    const form = await renderForm(profileSchema, { instrument: true });

    await form.type('/name', 'Jane');
    await form.type('/address/city', 'Busan');

    await runImperative(form, () => form.node('/address')?.resetSubtree());
    await form.flush();

    // /address reverted to defaults; /name preserved
    expect(form.value('/address/city')).toBe('Seoul');
    expect(form.getValue()?.address?.city).toBe('Seoul');
    expect(form.value('/name')).toBe('Jane');
    expect(form.node('/address/city')?.state[NodeState.Dirty]).toBeFalsy();
  });
});

// ---------------------------------------------------------------------------
// Array item subtree state by index after push
// ---------------------------------------------------------------------------

describe('state-management — array item subtree state by index', () => {
  it('setSubtreeState on a pushed item flags only that item subtree', async () => {
    const form = await renderForm(listSchema, {
      CustomFormTypeRenderer: StateRenderer,
      defaultValue: { items: [{ label: 'first' }] },
    });

    await form.addItem('/items');
    expect(form.exists('/items/1')).toBe(true);

    await runImperative(form, () =>
      form.node('/items/1')?.setSubtreeState({ [NodeState.Dirty]: true }),
    );

    // item 1 subtree dirty, item 0 untouched (tree)
    expect(form.node('/items/1/label')?.state[NodeState.Dirty]).toBe(true);
    expect(form.node('/items/0/label')?.state[NodeState.Dirty]).toBeFalsy();
    // DOM indicators by index
    expect(indicatorOf(form, '/items/1/label')?.dataset.dirty).toBe('true');
    expect(indicatorOf(form, '/items/0/label')?.dataset.dirty).toBe('false');
  });
});
