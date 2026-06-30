import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';

import type { JsonSchema } from '@winglet/json-schema';

import { ShowError } from '@/schema-form';

import { renderForm } from '../renderForm';

/**
 * Render-layer scenarios for JSON Schema composition:
 *   - `allOf`   — sub-schemas are merged into ONE object; every branch's
 *                 properties, defaults and constraints must surface as real
 *                 fields (GAP-1: the merged set must be present at first paint).
 *   - if/then/else + `computed.active` — a sibling value drives both which
 *                 fields render (conditional appear/disappear) and which fields
 *                 are required (GAP-3: a runtime sibling change must re-sync the
 *                 rendered field set AND the validation result).
 *
 * Each test asserts BOTH the rendered DOM ([data-path] presence, input values,
 * error <em> text) AND the node tree (node(path).value / getValue / getErrors).
 *
 * Schemas mirror stories/30.AllOfSchemaUsecase and stories/06.IfThenElse.
 */

// ---------------------------------------------------------------------------
// allOf — merged-object rendering
// ---------------------------------------------------------------------------
describe('allOf schema merge rendering', () => {
  it('merges properties from every allOf branch into one object (DOM + tree)', async () => {
    const schema = {
      type: 'object',
      allOf: [
        { properties: { firstName: { type: 'string', title: 'First Name' } } },
        { properties: { lastName: { type: 'string', title: 'Last Name' } } },
        {
          properties: {
            age: { type: 'number', title: 'Age', minimum: 0, maximum: 120 },
          },
        },
      ],
    } satisfies JsonSchema;

    // GAP-1: the merged field set must already exist at the synchronous paint.
    const form = await renderForm(schema, { flushOnMount: false });
    expect(form.exists('/firstName')).toBe(true);
    expect(form.exists('/lastName')).toBe(true);
    expect(form.exists('/age')).toBe(true);

    await form.flush();
    // DOM layer — all three merged fields rendered, addressable by path.
    expect(form.renderedPaths()).toEqual(
      expect.arrayContaining(['/firstName', '/lastName', '/age']),
    );
    // node-tree layer — the merged node carries all three properties.
    expect(form.node('/firstName')).not.toBeNull();
    expect(form.node('/lastName')).not.toBeNull();
    expect(form.node('/age')).not.toBeNull();
  });

  it('applies defaults declared across separate allOf branches (DOM + tree)', async () => {
    const schema = {
      type: 'object',
      allOf: [
        { properties: { firstName: { type: 'string', default: 'John' } } },
        { properties: { lastName: { type: 'string', default: 'Doe' } } },
        {
          properties: {
            country: {
              type: 'string',
              enum: ['USA', 'Canada', 'UK'],
              default: 'USA',
            },
          },
        },
      ],
    } satisfies JsonSchema;

    const form = await renderForm(schema);

    // DOM layer — uncontrolled inputs show each branch's default.
    expect(form.value('/firstName')).toBe('John');
    expect(form.value('/lastName')).toBe('Doe');
    expect(form.value('/country')).toBe('USA');
    // node-tree layer — merged value composed from all branch defaults.
    expect(form.getValue()).toMatchObject({
      firstName: 'John',
      lastName: 'Doe',
      country: 'USA',
    });
    expect(form.node('/country')?.value).toBe('USA');
  });

  it('merges top-level base properties together with allOf properties', async () => {
    const schema = {
      type: 'object',
      properties: {
        id: { type: 'number', title: 'ID', default: 1, readOnly: true },
      },
      allOf: [
        { properties: { name: { type: 'string', title: 'Name' } } },
        {
          properties: {
            role: {
              type: 'string',
              enum: ['admin', 'user', 'guest'],
              default: 'user',
            },
          },
        },
      ],
    } satisfies JsonSchema;

    const form = await renderForm(schema);

    // DOM layer — the base property and both allOf properties coexist.
    expect(form.exists('/id')).toBe(true);
    expect(form.exists('/name')).toBe(true);
    expect(form.exists('/role')).toBe(true);
    expect(form.value('/id')).toBe('1');
    expect(form.value('/role')).toBe('user');
    // node-tree layer — base default + allOf default merged.
    expect(form.getValue()).toMatchObject({ id: 1, role: 'user' });
  });

  it('enforces a numeric constraint merged from an allOf branch (DOM error + tree)', async () => {
    const schema = {
      type: 'object',
      allOf: [
        { properties: { age: { type: 'number', minimum: 0, maximum: 120 } } },
      ],
    } satisfies JsonSchema;

    const form = await renderForm(schema, {
      validator: true,
      showError: ShowError.Always,
    });
    await form.setValue({ age: 200 });
    const errors = await form.validate();
    await form.flush();

    // node-tree layer — the merged `maximum` constraint fired.
    expect(
      errors.some((e) => e.dataPath === '/age' && e.keyword === 'maximum'),
    ).toBe(true);
    expect(form.getErrors().some((e) => e.dataPath === '/age')).toBe(true);
    // DOM layer — the violation is surfaced as visible error text.
    expect(form.errorTexts().length).toBeGreaterThan(0);
  });

  it('enforces a `required` declared inside an allOf branch (DOM error + tree)', async () => {
    const schema = {
      type: 'object',
      allOf: [
        {
          properties: { name: { type: 'string', title: 'Name' } },
          required: ['name'],
        },
        {
          properties: { email: { type: 'string', format: 'email' } },
        },
      ],
    } satisfies JsonSchema;

    const form = await renderForm(schema, {
      validator: true,
      showError: ShowError.Always,
    });
    const errors = await form.validate();
    await form.flush();

    // node-tree layer — required from the branch is reported against /name.
    expect(
      errors.some((e) => e.dataPath === '/name' && e.keyword === 'required'),
    ).toBe(true);
    // DOM layer — fields render and the required violation shows.
    expect(form.exists('/name')).toBe(true);
    expect(form.errorTexts().length).toBeGreaterThan(0);
  });

  it('merges a nested allOf inside a property into nested fields (DOM + tree)', async () => {
    const schema = {
      type: 'object',
      allOf: [
        {
          properties: {
            user: {
              type: 'object',
              allOf: [
                { properties: { name: { type: 'string', default: 'Ada' } } },
                { properties: { age: { type: 'number', default: 30 } } },
              ],
            },
          },
        },
        {
          properties: {
            address: {
              type: 'object',
              properties: { city: { type: 'string', default: 'Seoul' } },
            },
          },
        },
      ],
    } satisfies JsonSchema;

    const form = await renderForm(schema);

    // DOM layer — nested merged fields are addressable by nested path.
    expect(form.exists('/user')).toBe(true);
    expect(form.exists('/user/name')).toBe(true);
    expect(form.exists('/user/age')).toBe(true);
    expect(form.exists('/address/city')).toBe(true);
    expect(form.value('/user/name')).toBe('Ada');
    expect(form.value('/user/age')).toBe('30');
    // node-tree layer — nested merge produces a coherent value object.
    expect(form.getValue()).toMatchObject({
      user: { name: 'Ada', age: 30 },
      address: { city: 'Seoul' },
    });
  });
});

// ---------------------------------------------------------------------------
// if/then/else + computed.active — sibling-driven conditional rendering
// ---------------------------------------------------------------------------
describe('if/then/else conditional field rendering', () => {
  // Mirrors stories/06.IfThenElse: `if/then/else` drives `required`, while
  // `computed.active` drives whether a field renders at all.
  const conditionalSchema = (): JsonSchema =>
    ({
      type: 'object',
      properties: {
        category: { type: 'string', enum: ['game', 'movie'], default: 'game' },
        title: { type: 'string' },
        releaseDate: {
          type: 'string',
          default: '2025-01-01',
          computed: { active: '../title === "wow"' },
        },
        price: { type: 'number', minimum: 50 },
      },
      if: { properties: { category: { enum: ['movie'] } } },
      then: { required: ['title', 'price'] },
      else: { required: ['title'] },
    }) satisfies JsonSchema;

  it('hides a computed.active field until the sibling value matches (DOM + tree)', async () => {
    const form = await renderForm(conditionalSchema());

    // Initially title is unset → releaseDate inactive → absent from DOM + tree.
    expect(form.exists('/releaseDate')).toBe(false);
    expect(form.node('/releaseDate')?.enabled ?? false).toBe(false);
    expect(form.renderedPaths()).not.toContain('/releaseDate');

    await form.setValue({ category: 'game', title: 'wow' });

    // Sibling now matches → field appears in DOM and becomes enabled in tree.
    expect(form.exists('/releaseDate')).toBe(true);
    expect(form.renderedPaths()).toContain('/releaseDate');
    expect(form.node('/releaseDate')?.enabled).toBe(true);
  });

  it('renders the activated field faithfully to its child node under whole-value setValue (DOM + tree)', async () => {
    const form = await renderForm(conditionalSchema());

    // Whole-value setValue (the provided object has no releaseDate key) only
    // flips activation; it does NOT seed the child node's own value.
    await form.setValue({ title: 'wow' });

    // The field renders, and the DOM input mirrors the CHILD node exactly —
    // both empty — so there is no DOM↔node divergence at the rendered field.
    expect(form.exists('/releaseDate')).toBe(true);
    expect(form.value('/releaseDate')).toBe('');
    expect(form.node('/releaseDate')?.value).toBeUndefined();
    // Only the aggregate value getter applies the schema default lazily;
    // pin this so a regression flipping either layer is caught.
    expect(form.getValue()).toMatchObject({ releaseDate: '2025-01-01' });
  });

  it('removes the conditional field and drops its value when the sibling changes back', async () => {
    const form = await renderForm(conditionalSchema());

    await form.setValue({ title: 'wow' });
    expect(form.exists('/releaseDate')).toBe(true);

    await form.setValue({ title: 'other' });

    // GAP-3-style: the sibling change re-syncs the rendered set — field gone…
    expect(form.exists('/releaseDate')).toBe(false);
    expect(form.renderedPaths()).not.toContain('/releaseDate');
    // …and its value is excluded from the form value.
    expect(form.getValue()?.releaseDate).toBeUndefined();
    expect(form.caughtErrors()).toEqual([]);
  });

  it('drives the conditional field via real user typing into the sibling (DOM + tree)', async () => {
    const form = await renderForm(conditionalSchema());

    await form.type('/title', 'wow');

    // Real DOM input event path, not only programmatic setValue.
    expect(form.exists('/releaseDate')).toBe(true);
    expect(form.value('/releaseDate')).toBe('2025-01-01');
    expect(form.node('/title')?.value).toBe('wow');
    expect(form.getValue()).toMatchObject({ title: 'wow' });
  });

  it('applies the `then` branch required fields when the discriminator matches', async () => {
    const form = await renderForm(conditionalSchema(), {
      validator: true,
      showError: ShowError.Always,
    });

    // category=movie selects `then` → requires title AND price (both unset).
    await form.setValue({ category: 'movie' });
    const errors = await form.validate();
    await form.flush();

    expect(
      errors.some((e) => e.dataPath === '/title' && e.keyword === 'required'),
    ).toBe(true);
    expect(
      errors.some((e) => e.dataPath === '/price' && e.keyword === 'required'),
    ).toBe(true);
    // DOM layer — discriminator + base fields render; violations are shown.
    expect(form.value('/category')).toBe('movie');
    expect(form.errorTexts().length).toBeGreaterThan(0);
  });

  it('applies the `else` branch required fields (title only) and stays convergent', async () => {
    const form = await renderForm(conditionalSchema(), {
      validator: true,
      showError: ShowError.Always,
    });

    // category=game selects `else` → requires title only, NOT price.
    await form.setValue({ category: 'game' });
    const errors = await form.validate();
    await form.flush();

    expect(
      errors.some((e) => e.dataPath === '/title' && e.keyword === 'required'),
    ).toBe(true);
    expect(
      errors.some((e) => e.dataPath === '/price' && e.keyword === 'required'),
    ).toBe(false);
    // DOM layer + convergence guard (no infinite cascade).
    expect(form.value('/category')).toBe('game');
    expect(form.caughtErrors()).toEqual([]);
  });
});
