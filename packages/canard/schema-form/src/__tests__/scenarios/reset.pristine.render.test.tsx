import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';

import type { JsonSchema } from '@winglet/json-schema';

import { NodeState } from '@/schema-form/core';

import { renderForm } from '../renderForm';

/**
 * Reset / pristine render tests (GAP-17).
 *
 * `handle.reset()` is wired to `Form`'s version bump (`reset: update`,
 * Form.tsx:167), which re-clones the schema + defaultValue and rebuilds the
 * whole node tree. Effectively a full remount whose value path is
 * `SetValueOption.StableReset = Reset | Refresh | Normalize` (type.ts:358) —
 * the `Refresh` bit is what re-mounts the uncontrolled FormTypeInput so its
 * `defaultValue` re-memorizes off the reset node value.
 *
 * Every case asserts BOTH layers: the rendered (uncontrolled) DOM input value
 * AND the rebuilt node tree (`node(path).value` / `getValue()` / `node.state`).
 * The pristine flag (`NodeState.Dirty`/`Touched`) must agree with the DOM:
 * after reset the input shows its default and the node carries no dirty/touched
 * state. Schemas mirror stories/20.Reset.stories.tsx and 37.Pristine.stories.tsx.
 */

// Flat object whose every field carries a schema default (mirrors
// ResetBehaviorTest's user/product schemas: string, enum<select>, boolean).
const userSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', default: 'Default User Name' },
    email: { type: 'string', default: 'user@example.com' },
    role: { type: 'string', enum: ['admin', 'user'], default: 'user' },
    inStock: { type: 'boolean', default: true },
  },
} satisfies JsonSchema;

// No schema defaults; defaults arrive via the `defaultValue` prop (mirrors
// ResetWithDefaultValueChange).
const profileSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number' },
    city: { type: 'string' },
  },
} satisfies JsonSchema;

const profileDefault = { name: 'John Doe', age: 25, city: 'New York' };

// oneOf discriminated by `mode`; each branch seeds its own defaults (mirrors
// WithOneOf in the Pristine stories, condensed).
const oneOfSchema = {
  type: 'object',
  properties: {
    mode: { type: 'string', enum: ['basic', 'advanced'], default: 'basic' },
  },
  oneOf: [
    {
      '&if': "./mode === 'basic'",
      properties: { basicSetting: { type: 'string', default: 'b-default' } },
    },
    {
      '&if': "./mode === 'advanced'",
      properties: {
        advancedSetting: { type: 'string', default: 'a-default' },
        extra: { type: 'number', default: 7 },
      },
    },
  ],
} satisfies JsonSchema;

// Nested object with defaults at both levels (mirrors the advanced config in
// ResetWithBothChanges).
const nestedSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', default: 'root-name' },
    preferences: {
      type: 'object',
      properties: {
        theme: { type: 'string', enum: ['light', 'dark'], default: 'dark' },
        notifications: { type: 'boolean', default: true },
      },
    },
  },
} satisfies JsonSchema;

const countPaths = (form: { renderedPaths: () => string[] }, path: string) =>
  form.renderedPaths().filter((p) => p === path).length;

describe('reset restores flat field defaults (DOM + tree)', () => {
  it('returns every edited input to its schema default in DOM and tree', async () => {
    const form = await renderForm(userSchema);

    // Baseline: schema defaults rendered uncontrolled.
    expect(form.value('/name')).toBe('Default User Name');
    expect(form.value('/email')).toBe('user@example.com');
    expect(form.value('/role')).toBe('user');
    expect(form.checked('/inStock')).toBe(true);

    // Edit every field.
    await form.type('/name', 'Alice');
    await form.type('/email', 'alice@corp.io');
    await form.selectOption('/role', 'admin');
    await form.toggle('/inStock');

    expect(form.value('/name')).toBe('Alice');
    expect(form.value('/role')).toBe('admin');
    expect(form.checked('/inStock')).toBe(false);
    expect(form.node('/name')?.value).toBe('Alice');

    await form.reset();
    await form.flush();

    // DOM back to defaults (uncontrolled inputs remounted via the Refresh bit).
    expect(form.value('/name')).toBe('Default User Name');
    expect(form.value('/email')).toBe('user@example.com');
    expect(form.value('/role')).toBe('user');
    expect(form.checked('/inStock')).toBe(true);
    // Rebuilt tree agrees.
    expect(form.node('/name')?.value).toBe('Default User Name');
    expect(form.getValue()).toEqual({
      name: 'Default User Name',
      email: 'user@example.com',
      role: 'user',
      inStock: true,
    });
  });

  it('clears dirty/touched state so reset nodes are pristine, matching the default DOM', async () => {
    const form = await renderForm(userSchema);

    await form.type('/name', 'Bob');
    // Typing marks the node dirty (SchemaNodeInput.handleChange).
    expect(form.node('/name')?.state[NodeState.Dirty]).toBe(true);

    await form.reset();
    await form.flush();

    // Pristine flag and DOM agree: default value shown, no dirty/touched state.
    expect(form.value('/name')).toBe('Default User Name');
    const state = form.node('/name')?.state ?? {};
    expect(state[NodeState.Dirty]).toBeFalsy();
    expect(state[NodeState.Touched]).toBeFalsy();
  });

  it('restores a toggled boolean checkbox to its default after reset', async () => {
    const form = await renderForm(userSchema);

    await form.toggle('/inStock');
    expect(form.checked('/inStock')).toBe(false);
    expect(form.node('/inStock')?.value).toBe(false);

    await form.reset();
    await form.flush();

    expect(form.checked('/inStock')).toBe(true);
    expect(form.node('/inStock')?.value).toBe(true);
  });
});

describe('reset with provided defaultValue (no schema defaults)', () => {
  it('returns inputs to the provided defaultValue rather than empty', async () => {
    const form = await renderForm(profileSchema, {
      defaultValue: profileDefault,
    });

    expect(form.value('/name')).toBe('John Doe');
    expect(form.value('/age')).toBe('25');
    expect(form.value('/city')).toBe('New York');

    await form.type('/name', 'Changed');
    await form.type('/age', '99');
    expect(form.value('/name')).toBe('Changed');
    expect(form.node('/age')?.value).toBe(99);

    await form.reset();
    await form.flush();

    expect(form.value('/name')).toBe('John Doe');
    expect(form.value('/age')).toBe('25');
    expect(form.value('/city')).toBe('New York');
    expect(form.node('/name')?.value).toBe('John Doe');
    expect(form.getValue()).toEqual(profileDefault);
  });

  it('leaves fields empty after reset when no default exists anywhere', async () => {
    const form = await renderForm(profileSchema);

    expect(form.value('/name')).toBe('');

    await form.type('/name', 'Temp');
    await form.type('/city', 'Nowhere');
    expect(form.value('/name')).toBe('Temp');
    expect(form.node('/name')?.value).toBe('Temp');

    await form.reset();
    await form.flush();

    // No default → DOM empty and tree values undefined.
    expect(form.value('/name')).toBe('');
    expect(form.value('/city')).toBe('');
    expect(form.node('/name')?.value).toBeUndefined();
    expect(form.getValue()?.name).toBeUndefined();
    expect(form.getValue()?.city).toBeUndefined();
  });
});

describe('reset and inactive oneOf branches', () => {
  it('restores the default branch field with no residual edited value', async () => {
    const form = await renderForm(oneOfSchema);

    expect(form.exists('/basicSetting')).toBe(true);
    expect(form.value('/basicSetting')).toBe('b-default');

    await form.type('/basicSetting', 'edited-basic');
    expect(form.value('/basicSetting')).toBe('edited-basic');
    expect(form.node('/basicSetting')?.value).toBe('edited-basic');

    await form.reset();
    await form.flush();

    expect(form.exists('/basicSetting')).toBe(true);
    expect(form.value('/basicSetting')).toBe('b-default');
    expect(form.node('/basicSetting')?.value).toBe('b-default');
  });

  it('drops the non-default branch on reset leaving no inactive-branch residue', async () => {
    const form = await renderForm(oneOfSchema);

    // Switch into the advanced branch and edit it.
    await form.selectOption('/mode', 'advanced');
    await form.type('/advancedSetting', 'typed-adv');
    expect(form.exists('/advancedSetting')).toBe(true);
    expect(form.exists('/basicSetting')).toBe(false);
    expect(form.value('/extra')).toBe('7');

    await form.reset();
    await form.flush();

    // Back to the default branch: advanced fields gone from DOM and tree.
    expect(form.value('/mode')).toBe('basic');
    expect(form.exists('/basicSetting')).toBe(true);
    expect(form.value('/basicSetting')).toBe('b-default');
    expect(form.exists('/advancedSetting')).toBe(false);
    expect(form.exists('/extra')).toBe(false);
    expect(form.node('/advancedSetting')?.enabled).toBe(false);
    expect(form.getValue().advancedSetting).toBeUndefined();
    expect(form.getValue().extra).toBeUndefined();
  });

  it('reset re-primes exactly one active branch with no duplicate fields', async () => {
    const form = await renderForm(oneOfSchema);

    await form.selectOption('/mode', 'advanced');
    await form.reset();
    await form.flush();

    expect(countPaths(form, '/basicSetting')).toBe(1);
    expect(countPaths(form, '/advancedSetting')).toBe(0);
    expect(form.node('/basicSetting')?.enabled).toBe(true);
  });
});

describe('StableReset remounts uncontrolled inputs (instrument / mountOrdinal)', () => {
  it('remounts every terminal input on reset so the uncontrolled DOM refreshes', async () => {
    const form = await renderForm(userSchema, { instrument: true });

    const nameOrdinal = form.mountOrdinal('/name');
    const emailOrdinal = form.mountOrdinal('/email');
    expect(nameOrdinal).toBeGreaterThan(0);

    await form.type('/name', 'Mallory');
    await form.type('/email', 'm@x.io');
    expect(form.value('/name')).toBe('Mallory');

    await form.reset();
    await form.flush();

    // Full-remount reset gives every instrumented input a fresh mount ordinal,
    // and the refreshed uncontrolled DOM shows the default again.
    expect(form.mountOrdinal('/name')).toBeGreaterThan(nameOrdinal);
    expect(form.mountOrdinal('/email')).toBeGreaterThan(emailOrdinal);
    expect(form.value('/name')).toBe('Default User Name');
    expect(form.value('/email')).toBe('user@example.com');
    expect(form.node('/name')?.value).toBe('Default User Name');
  });

  it('refreshes an uncontrolled input whose typed value diverged from its default', async () => {
    const form = await renderForm(profileSchema, {
      defaultValue: profileDefault,
      instrument: true,
    });

    const baseOrdinal = form.mountOrdinal('/name');
    await form.type('/name', 'Diverged');
    // Typing must not remount the input mid-edit.
    expect(form.mountOrdinal('/name')).toBe(baseOrdinal);
    expect(form.value('/name')).toBe('Diverged');

    await form.reset();
    await form.flush();

    expect(form.mountOrdinal('/name')).toBeGreaterThan(baseOrdinal);
    expect(form.value('/name')).toBe('John Doe');
    expect(form.node('/name')?.value).toBe('John Doe');
  });
});

describe('reset convergence and idempotency', () => {
  it('never throws INFINITE_LOOP_DETECTED across edit/reset cycles', async () => {
    const form = await renderForm(oneOfSchema);

    await form.type('/basicSetting', 'x');
    await form.reset();
    await form.flush();
    await form.selectOption('/mode', 'advanced');
    await form.reset();
    await form.flush();

    expect(form.caughtErrors()).toEqual([]);
    expect(form.value('/basicSetting')).toBe('b-default');
    expect(countPaths(form, '/basicSetting')).toBe(1);
  });

  it('is idempotent: a second reset with no edits keeps DOM and tree at defaults', async () => {
    const form = await renderForm(userSchema);

    await form.type('/name', 'Once');
    await form.reset();
    await form.flush();
    expect(form.value('/name')).toBe('Default User Name');

    await form.reset();
    await form.flush();

    expect(form.value('/name')).toBe('Default User Name');
    expect(form.value('/role')).toBe('user');
    expect(form.checked('/inStock')).toBe(true);
    expect(form.node('/name')?.value).toBe('Default User Name');
    expect(form.caughtErrors()).toEqual([]);
  });
});

describe('nested object reset', () => {
  it('restores nested object field defaults in DOM and tree', async () => {
    const form = await renderForm(nestedSchema);

    expect(form.value('/name')).toBe('root-name');
    expect(form.value('/preferences/theme')).toBe('dark');
    expect(form.checked('/preferences/notifications')).toBe(true);

    await form.type('/name', 'edited');
    await form.selectOption('/preferences/theme', 'light');
    await form.toggle('/preferences/notifications');
    expect(form.value('/preferences/theme')).toBe('light');
    expect(form.node('/preferences/notifications')?.value).toBe(false);

    await form.reset();
    await form.flush();

    expect(form.value('/name')).toBe('root-name');
    expect(form.value('/preferences/theme')).toBe('dark');
    expect(form.checked('/preferences/notifications')).toBe(true);
    expect(form.node('/preferences/theme')?.value).toBe('dark');
    expect(form.getValue()).toEqual({
      name: 'root-name',
      preferences: { theme: 'dark', notifications: true },
    });
  });

  it('clears dirty state on nested children after reset, matching the DOM', async () => {
    const form = await renderForm(nestedSchema);

    await form.type('/name', 'dirtied');
    await form.selectOption('/preferences/theme', 'light');
    expect(form.node('/preferences/theme')?.state[NodeState.Dirty]).toBe(true);

    await form.reset();
    await form.flush();

    expect(form.value('/preferences/theme')).toBe('dark');
    const themeState = form.node('/preferences/theme')?.state ?? {};
    expect(themeState[NodeState.Dirty]).toBeFalsy();
    expect(themeState[NodeState.Touched]).toBeFalsy();
  });
});
