import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';

import type { JsonSchema } from '@winglet/json-schema';

import { SetValueOption } from '@/schema-form/core';

import { renderForm } from '../renderForm';

/**
 * Nullable rendering — type:[T,'null'] and `nullable: true`.
 *
 * Targets GAP-12 (default-value application timing on branch/field entry) plus
 * the general nullable contract: a node whose value is `null` must keep the
 * node tree and the rendered DOM in agreement. Built-in uncontrolled inputs are
 * used (no custom FormTypeInput definitions) so DOM value assertions also
 * exercise the RequestRefresh / `defaultValue` re-memorize path.
 *
 * Observed contract (verified against src/):
 *  - A nullable terminal seeded with `null` keeps `node.value === null` while
 *    the uncontrolled input renders empty (`''`) / unchecked — `defaultValue =
 *    null ?? undefined` and `defaultChecked = null ?? undefined`.
 *  - A nullable OBJECT seeded `null` still renders its child `[data-path]`
 *    nodes (children stay mounted), while `node.value` is `null`.
 *  - A nullable ARRAY seeded `null` renders the array wrapper but NO item rows.
 *  - Clearing a string input emits `''` (omitEmpty), so the node value becomes
 *    `''` and the key is dropped from the propagated root value — it does NOT
 *    become `null`; only an explicit `setValue(null)` yields `null`.
 *
 * Schemas mirror stories 28 (Nullable Usecase), 09 (NullSchema), 29 (Nullable
 * Array Syntax), kept compact.
 */
describe('nullable.render — type:[T,null] / nullable primitives, objects, arrays', () => {
  describe('primitive nullable defaults (happy path)', () => {
    it('renders empty inputs while the node tree holds null (nullable: true)', async () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string', nullable: true },
          age: { type: 'number', nullable: true },
          active: { type: 'boolean', nullable: true },
        },
      } satisfies JsonSchema;

      const form = await renderForm(schema, {
        defaultValue: { name: null, age: null, active: null },
      });

      // Node tree: every nullable terminal is null (not undefined / not '').
      expect(form.node('/name')?.value).toBeNull();
      expect(form.node('/age')?.value).toBeNull();
      expect(form.node('/active')?.value).toBeNull();
      expect(form.getValue()).toEqual({ name: null, age: null, active: null });

      // DOM: present but empty / unchecked.
      expect(form.exists('/name')).toBe(true);
      expect(form.value('/name')).toBe('');
      expect(form.value('/age')).toBe('');
      expect(form.checked('/active')).toBe(false);
    });

    it('renders nullable boolean (array syntax) seeded null as unchecked with null tree', async () => {
      const schema = {
        type: 'object',
        properties: {
          consent: { type: ['boolean', 'null'], default: null },
          newsletter: { type: ['boolean', 'null'], default: null },
        },
      } satisfies JsonSchema;

      const form = await renderForm(schema);

      expect(form.node('/consent')?.value).toBeNull();
      expect(form.node('/newsletter')?.value).toBeNull();
      expect(form.checked('/consent')).toBe(false);
      expect(form.checked('/newsletter')).toBe(false);
      expect(form.getValue()).toEqual({ consent: null, newsletter: null });
    });

    it('primes array-syntax string/number defaults to null two-phase (sync + post-flush)', async () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: ['string', 'null'], default: null },
          age: { type: ['number', 'null'], default: null },
        },
      } satisfies JsonSchema;

      const form = await renderForm(schema, { flushOnMount: false });

      // Synchronous priming snapshot: fields present, null value -> empty input.
      expect(form.exists('/name')).toBe(true);
      expect(form.node('/name')?.value).toBeNull();
      expect(form.value('/name')).toBe('');

      await form.flush();

      // Settled: still null (the reconciliation cascade must not clobber it).
      expect(form.node('/name')?.value).toBeNull();
      expect(form.node('/age')?.value).toBeNull();
      expect(form.value('/name')).toBe('');
      expect(form.value('/age')).toBe('');
      expect(form.getValue()).toEqual({ name: null, age: null });
    });
  });

  describe('setting null at runtime clears the DOM via refresh', () => {
    it('setValue(null) on a nullable string sets tree null and empties the input', async () => {
      const schema = {
        type: 'object',
        properties: { name: { type: 'string', nullable: true } },
      } satisfies JsonSchema;

      const form = await renderForm(schema, { defaultValue: { name: 'John' } });
      expect(form.node('/name')?.value).toBe('John');
      expect(form.value('/name')).toBe('John');

      await form.setValue({ name: null }, SetValueOption.Merge);

      expect(form.node('/name')?.value).toBeNull();
      expect(form.value('/name')).toBe('');
      expect(form.getValue()).toEqual({ name: null });
    });

    it('setValue(null) on a nullable number remounts the input and clears it', async () => {
      const schema = {
        type: 'object',
        properties: { age: { type: ['number', 'null'] } },
      } satisfies JsonSchema;

      const form = await renderForm(schema, {
        defaultValue: { age: 25 },
        instrument: true,
      });
      const before = form.mountOrdinal('/age');
      expect(form.node('/age')?.value).toBe(25);
      expect(form.value('/age')).toBe('25');

      await form.setValue({ age: null }, SetValueOption.Merge);

      // Refresh-driven remount delivers the null value to the uncontrolled DOM.
      expect(form.mountOrdinal('/age')).toBeGreaterThan(before);
      expect(form.node('/age')?.value).toBeNull();
      expect(form.value('/age')).toBe('');
      expect(form.getValue()).toEqual({ age: null });
    });

    it('setValue(null) on a nullable boolean unchecks the checkbox', async () => {
      const schema = {
        type: 'object',
        properties: { consent: { type: ['boolean', 'null'], default: true } },
      } satisfies JsonSchema;

      const form = await renderForm(schema);
      expect(form.node('/consent')?.value).toBe(true);
      expect(form.checked('/consent')).toBe(true);

      await form.setValue({ consent: null }, SetValueOption.Merge);

      expect(form.node('/consent')?.value).toBeNull();
      expect(form.checked('/consent')).toBe(false);
      expect(form.getValue()).toEqual({ consent: null });
    });

    it('clearing a nullable string yields empty string (omitEmpty), not null', async () => {
      const schema = {
        type: 'object',
        properties: { name: { type: 'string', nullable: true } },
      } satisfies JsonSchema;

      const form = await renderForm(schema, { defaultValue: { name: 'John' } });

      await form.clear('/name');

      // User-clear emits '' -> node value '' (NOT null); root drops the key.
      expect(form.node('/name')?.value).toBe('');
      expect(form.value('/name')).toBe('');
      expect(form.getValue()).toEqual({});
    });
  });

  describe('nullable object', () => {
    it('keeps child fields mounted while value is null (default null)', async () => {
      const schema = {
        type: 'object',
        properties: {
          profile: {
            type: ['object', 'null'],
            properties: { bio: { type: 'string' } },
            default: null,
          },
        },
      } satisfies JsonSchema;

      const form = await renderForm(schema);

      // Tree: object value is null; DOM: wrapper and child input still rendered.
      expect(form.node('/profile')?.value).toBeNull();
      expect(form.exists('/profile')).toBe(true);
      expect(form.exists('/profile/bio')).toBe(true);
      expect(form.value('/profile/bio')).toBe('');
      expect(form.getValue()).toEqual({ profile: null });
    });

    it('round-trips value -> null and refreshes the child input', async () => {
      const schema = {
        type: 'object',
        properties: {
          profile: {
            type: ['object', 'null'],
            properties: { bio: { type: 'string' } },
            default: null,
          },
        },
      } satisfies JsonSchema;

      const form = await renderForm(schema);

      await form.setValue({ profile: { bio: 'dev' } });
      expect(form.node('/profile')?.value).toEqual({ bio: 'dev' });
      expect(form.value('/profile/bio')).toBe('dev');

      await form.setValue({ profile: null });
      expect(form.node('/profile')?.value).toBeNull();
      // Child node reset and the uncontrolled input re-mounted empty (no stale "dev").
      expect(form.node('/profile/bio')?.value).toBe('');
      expect(form.value('/profile/bio')).toBe('');
    });
  });

  describe('nullable array', () => {
    it('renders no item rows when the array value is null (default null)', async () => {
      const schema = {
        type: 'object',
        properties: {
          tags: {
            type: ['array', 'null'],
            items: { type: 'string' },
            default: null,
          },
        },
      } satisfies JsonSchema;

      const form = await renderForm(schema);

      expect(form.node('/tags')?.value).toBeNull();
      expect(form.exists('/tags')).toBe(true);
      // No item nodes rendered while null.
      expect(form.exists('/tags/0')).toBe(false);
      expect(
        form.renderedPaths().filter((p) => p.startsWith('/tags/')),
      ).toEqual([]);
      expect(form.getValue()).toEqual({ tags: null });
    });

    it('materializes rows on set-value and removes them again on set-null', async () => {
      const schema = {
        type: 'object',
        properties: {
          tags: {
            type: ['array', 'null'],
            items: { type: 'string' },
            default: null,
          },
        },
      } satisfies JsonSchema;

      const form = await renderForm(schema);

      await form.setValue({ tags: ['a', 'b'] });
      expect(form.node('/tags')?.value).toEqual(['a', 'b']);
      expect(form.exists('/tags/0')).toBe(true);
      expect(form.exists('/tags/1')).toBe(true);
      expect(form.value('/tags/0')).toBe('a');
      expect(form.value('/tags/1')).toBe('b');

      await form.setValue({ tags: null });
      expect(form.node('/tags')?.value).toBeNull();
      expect(form.exists('/tags/0')).toBe(false);
      expect(form.exists('/tags/1')).toBe(false);
    });

    it('renders nullable items: null entries are empty inputs, tree keeps nulls', async () => {
      const schema = {
        type: 'object',
        properties: {
          scores: {
            type: ['array', 'null'],
            items: { type: ['number', 'null'] },
          },
        },
      } satisfies JsonSchema;

      const form = await renderForm(schema);
      await form.setValue({ scores: [85, null, 92] });

      expect(form.node('/scores')?.value).toEqual([85, null, 92]);
      expect(form.node('/scores/1')?.value).toBeNull();
      expect(form.exists('/scores/1')).toBe(true);
      expect(form.value('/scores/0')).toBe('85');
      expect(form.value('/scores/1')).toBe('');
      expect(form.value('/scores/2')).toBe('92');
    });
  });

  describe('null-type and nullable-enum edge cases', () => {
    it('renders a pure type:"null" field with a null value in the tree', async () => {
      const schema = {
        type: 'object',
        properties: { nullField: { type: 'null' } },
      } satisfies JsonSchema;

      const form = await renderForm(schema, {
        defaultValue: { nullField: null },
      });

      expect(form.node('/nullField')?.value).toBeNull();
      expect(form.exists('/nullField')).toBe(true);
      expect(form.getValue()).toEqual({ nullField: null });
    });

    it('renders a nullable enum (null in enum, default null) as a select holding null', async () => {
      const schema = {
        type: 'object',
        properties: {
          category: {
            type: ['string', 'null'],
            enum: [null, 'a', 'b'],
            default: null,
          },
        },
      } satisfies JsonSchema;

      const form = await renderForm(schema);

      const field = form.field('/category');
      expect(field?.tagName).toBe('SELECT');
      expect(form.node('/category')?.value).toBeNull();
      // The select's null option is serialized as the string "null".
      expect(form.value('/category')).toBe('null');
      expect(form.getValue()).toEqual({ category: null });
    });

    it('shows a non-null default, then empties when overridden with null', async () => {
      const schema = {
        type: 'object',
        properties: {
          withDefault: { type: ['string', 'null'], default: 'seed' },
        },
      } satisfies JsonSchema;

      const form = await renderForm(schema, { instrument: true });
      const before = form.mountOrdinal('/withDefault');
      expect(form.node('/withDefault')?.value).toBe('seed');
      expect(form.value('/withDefault')).toBe('seed');

      await form.setValue({ withDefault: null }, SetValueOption.Merge);

      expect(form.mountOrdinal('/withDefault')).toBeGreaterThan(before);
      expect(form.node('/withDefault')?.value).toBeNull();
      expect(form.value('/withDefault')).toBe('');
      expect(form.getValue()).toEqual({ withDefault: null });
    });
  });
});
