import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';

import type { JsonSchema } from '@winglet/json-schema';

import { renderForm } from '../renderForm';

/**
 * GAP-10 — Computed `readOnly` / `disabled` driven by sibling values, plus the
 * form-level `readOnly` / `disabled` props.
 *
 * Load-bearing render facts (verified against src/):
 *   - `SchemaNodeInput` passes `readOnly={rootReadOnly || node.readOnly}` and
 *     `disabled={rootDisabled || node.disabled}` FRESH on every render
 *     (`SchemaNodeInput.tsx:111-112`). These are NOT memorized off the
 *     RequestRefresh `version`, so a computed flip reaches the DOM purely via the
 *     `UpdateComputedProperties` re-render (in `REACTIVE_RERENDERING_EVENTS`).
 *   - `node.readOnly` / `node.disabled` reflect ONLY the computed property
 *     (`AbstractNode.ts:440-450`); the form-level props live in
 *     `InputControlContext`. So with a form-level prop set, the DOM attribute is
 *     present while `node.readOnly` / `node.disabled` stays `false` — a genuine
 *     two-layer divergence this suite pins.
 *   - Built-in string/number inputs render `readOnly` + `disabled` attributes
 *     directly; the enum `<select>` has no readonly attribute and instead renders
 *     `disabled={disabled || readOnly}` (`FormTypeInputStringEnum.tsx:65`).
 *
 * Every case asserts BOTH layers: rendered DOM (attribute presence via jest-dom)
 * AND the node tree (`node(path)?.readOnly` / `.disabled` / `getValue()`).
 */

// ---------------------------------------------------------------------------
// Schemas (mirrored from stories/11.ComputedProps)
// ---------------------------------------------------------------------------

/** name.readOnly = !prepared; age.disabled depends on name; nationality on age. */
const computedSchema = {
  type: 'object',
  properties: {
    prepared: { type: 'boolean' },
    name: {
      type: 'string',
      computed: { readOnly: '!(/prepared)' },
    },
    age: {
      type: 'number',
      computed: { disabled: '(../name)===undefined||(../name).length<5' },
    },
    nationality: {
      type: 'string',
      enum: ['', 'US', 'UK', 'JP', 'KR'],
      computed: { disabled: '(../age)===undefined||(../age)<10' },
    },
  },
} satisfies JsonSchema;

/** enum select whose computed.readOnly is driven by a sibling boolean. */
const selectReadOnlySchema = {
  type: 'object',
  properties: {
    unlock: { type: 'boolean' },
    nationality: {
      type: 'string',
      enum: ['', 'US', 'KR'],
      computed: { readOnly: '!(/unlock)' },
    },
  },
} satisfies JsonSchema;

const isReadOnly = (el: Element | null): boolean =>
  !!el && (el as HTMLInputElement).readOnly === true;

// ---------------------------------------------------------------------------

describe('GAP-10 computed.readOnly driven by a sibling value', () => {
  it('marks the field readOnly when the controlling sibling is falsy (DOM + tree)', async () => {
    const form = await renderForm(computedSchema);

    // prepared is undefined -> !(/prepared) === true -> name readOnly.
    expect(form.exists('/name')).toBe(true);
    expect(form.field('/name')).toHaveAttribute('readonly');
    expect(isReadOnly(form.field('/name'))).toBe(true);
    // tree agrees
    expect(form.node('/name')?.readOnly).toBe(true);
    expect(form.caughtErrors()).toEqual([]);
  });

  it('clears readOnly when the controlling sibling flips true via setValue and re-applies it on flip back', async () => {
    const form = await renderForm(computedSchema);
    expect(form.field('/name')).toHaveAttribute('readonly');

    await form.setValue({ prepared: true });
    // DOM attribute gone, tree computed flag false.
    expect(form.field('/name')).not.toHaveAttribute('readonly');
    expect(isReadOnly(form.field('/name'))).toBe(false);
    expect(form.node('/name')?.readOnly).toBe(false);
    expect(form.getValue()?.prepared).toBe(true);

    await form.setValue({ prepared: false });
    expect(form.field('/name')).toHaveAttribute('readonly');
    expect(form.node('/name')?.readOnly).toBe(true);
  });

  it('flips readOnly on a real checkbox toggle of the controlling sibling', async () => {
    const form = await renderForm(computedSchema);
    expect(form.node('/name')?.readOnly).toBe(true);

    await form.toggle('/prepared'); // -> true
    expect(form.getValue()?.prepared).toBe(true);
    expect(form.field('/name')).not.toHaveAttribute('readonly');
    expect(form.node('/name')?.readOnly).toBe(false);

    await form.toggle('/prepared'); // -> false
    expect(form.field('/name')).toHaveAttribute('readonly');
    expect(form.node('/name')?.readOnly).toBe(true);
  });
});

describe('GAP-10 computed.disabled driven by a sibling value', () => {
  it('disables dependents while their controlling siblings are unset (DOM + tree)', async () => {
    const form = await renderForm(computedSchema);

    // name undefined -> age disabled; age undefined -> nationality disabled.
    expect(form.field('/age')).toBeDisabled();
    expect(form.node('/age')?.disabled).toBe(true);
    expect(form.field('/nationality')).toBeDisabled();
    expect(form.node('/nationality')?.disabled).toBe(true);
    expect(form.caughtErrors()).toEqual([]);
  });

  it('enables age once name reaches the required length', async () => {
    const form = await renderForm(computedSchema);
    expect(form.field('/age')).toBeDisabled();

    await form.setValue({ prepared: true, name: 'Vincent' });

    expect(form.getValue()?.name).toBe('Vincent');
    expect(form.field('/age')).not.toBeDisabled();
    expect(form.node('/age')?.disabled).toBe(false);
  });

  it('keeps age disabled when name is too short', async () => {
    const form = await renderForm(computedSchema);

    await form.setValue({ prepared: true, name: 'abc' });

    expect(form.getValue()?.name).toBe('abc');
    expect(form.field('/age')).toBeDisabled();
    expect(form.node('/age')?.disabled).toBe(true);
  });

  it('cascades enable down name -> age -> nationality', async () => {
    const form = await renderForm(computedSchema);

    await form.setValue({ prepared: true, name: 'Vincent', age: 20 });

    // age enabled by name length, nationality enabled by age >= 10.
    expect(form.field('/age')).not.toBeDisabled();
    expect(form.node('/age')?.disabled).toBe(false);
    expect(form.field('/nationality')).not.toBeDisabled();
    expect(form.node('/nationality')?.disabled).toBe(false);
    expect(form.getValue()).toMatchObject({ name: 'Vincent', age: 20 });
  });
});

describe('GAP-10 form-level readOnly prop overrides computed state', () => {
  it('forces inputs readOnly even when their computed readOnly is false', async () => {
    const form = await renderForm(computedSchema, { readOnly: true });
    // Make computed readOnly false (prepared true) and age computed enabled.
    await form.setValue({ prepared: true, name: 'Vincent', age: 20 });

    // DOM: readonly present because rootReadOnly || node.readOnly.
    expect(form.field('/name')).toHaveAttribute('readonly');
    expect(form.field('/age')).toHaveAttribute('readonly');
    // Tree: the node's OWN computed flag is false -> divergence is intentional.
    expect(form.node('/name')?.readOnly).toBe(false);
    expect(form.node('/age')?.readOnly).toBe(false);
  });

  it('maps form-level readOnly onto the enum select disabled attribute while node flags stay false', async () => {
    const form = await renderForm(computedSchema, { readOnly: true });
    // age >= 10 so nationality computed.disabled is false.
    await form.setValue({ prepared: true, name: 'Vincent', age: 20 });

    // select has no readonly attr; readOnly maps to disabled (disabled||readOnly).
    expect(form.field('/nationality')).toBeDisabled();
    // Neither computed flag is set on the node — purely the form-level prop.
    expect(form.node('/nationality')?.disabled).toBe(false);
    expect(form.node('/nationality')?.readOnly).toBe(false);
  });
});

describe('GAP-10 form-level disabled prop overrides computed state', () => {
  it('forces inputs disabled even when their computed disabled is false', async () => {
    const form = await renderForm(computedSchema, { disabled: true });

    // prepared has no computed.disabled, yet the DOM input is disabled.
    expect(form.field('/prepared')).toBeDisabled();
    expect(form.node('/prepared')?.disabled).toBe(false);
    // name likewise: computed flag false, DOM disabled via rootDisabled.
    expect(form.field('/name')).toBeDisabled();
    expect(form.node('/name')?.disabled).toBe(false);
    expect(form.caughtErrors()).toEqual([]);
  });
});

describe('GAP-10 enum select maps computed.readOnly to the disabled attribute', () => {
  it('disables the select when readOnly is computed true and re-enables it on flip', async () => {
    const form = await renderForm(selectReadOnlySchema);

    // unlock undefined -> nationality.readOnly true -> select disabled.
    expect(form.field('/nationality')).toBeDisabled();
    expect(form.node('/nationality')?.readOnly).toBe(true);

    await form.setValue({ unlock: true });
    expect(form.field('/nationality')).not.toBeDisabled();
    expect(form.node('/nationality')?.readOnly).toBe(false);
    expect(form.getValue()?.unlock).toBe(true);

    await form.setValue({ unlock: false });
    expect(form.field('/nationality')).toBeDisabled();
    expect(form.node('/nationality')?.readOnly).toBe(true);
  });
});

describe('GAP-10 initial-mount priming of computed readOnly/disabled (two-phase)', () => {
  it('settles computed flags into the DOM after the cascade drains', async () => {
    const form = await renderForm(computedSchema, {
      flushOnMount: false,
      defaultValue: { prepared: true, name: 'Vincent', age: 20 },
    });

    // Synchronous snapshot: the always-on discriminator is present at first paint.
    expect(form.exists('/prepared')).toBe(true);

    // After draining the composition cascade, every computed flag matches the
    // seeded sibling values in BOTH layers (no priming drift).
    await form.flush();
    expect(form.field('/name')).not.toHaveAttribute('readonly');
    expect(form.node('/name')?.readOnly).toBe(false);
    expect(form.field('/age')).not.toBeDisabled();
    expect(form.node('/age')?.disabled).toBe(false);
    expect(form.field('/nationality')).not.toBeDisabled();
    expect(form.node('/nationality')?.disabled).toBe(false);
    expect(form.caughtErrors()).toEqual([]);
  });
});

describe('GAP-10 convergence under repeated sibling flips', () => {
  it('keeps DOM and tree in sync across many toggles with no infinite loop', async () => {
    const form = await renderForm(computedSchema);

    for (let i = 0; i < 4; i++) await form.toggle('/prepared');

    // Even number of toggles -> prepared back to false -> name readOnly again.
    expect(form.getValue()?.prepared).toBe(false);
    expect(form.field('/name')).toHaveAttribute('readonly');
    expect(form.node('/name')?.readOnly).toBe(true);

    await form.toggle('/prepared'); // -> true
    expect(form.field('/name')).not.toHaveAttribute('readonly');
    expect(form.node('/name')?.readOnly).toBe(false);

    expect(form.caughtErrors()).toEqual([]);
    expect(
      form.caughtErrors().some((e) => e.includes('INFINITE_LOOP_DETECTED')),
    ).toBe(false);
  });
});
