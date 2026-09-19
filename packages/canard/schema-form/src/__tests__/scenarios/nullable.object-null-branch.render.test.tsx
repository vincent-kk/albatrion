import '@testing-library/jest-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { JSONSchema } from '@winglet/json-schema';

import { renderForm } from '../renderForm';

type Branches = NonNullable<JSONSchema['oneOf']>;

const objectBranches: Branches = [
  {
    type: 'object',
    '&if': "./kind === 'a'",
    properties: { aValue: { type: 'string', minLength: 3 } },
  },
  {
    type: 'object',
    '&if': "./kind === 'b'",
    properties: { bValue: { type: 'string' } },
  },
];

/**
 * The standard JSON Schema way to let a nullable object with a composition
 * validate as `null`: one `{ type: 'null' }` branch, and object branches that
 * declare `type: 'object'` so `null` matches exactly one branch.
 * @param scope - Composition keyword carrying the branches
 * @param nullBranch - Where the null branch sits among the branches
 */
const pattern = (
  scope: 'oneOf' | 'anyOf',
  nullBranch: 'first' | 'middle' | 'last',
): JSONSchema => ({
  type: 'object',
  properties: {
    target: {
      type: ['object', 'null'],
      properties: { kind: { type: 'string', enum: ['a', 'b'], default: 'a' } },
      [scope]: {
        first: [{ type: 'null' }, ...objectBranches],
        middle: [objectBranches[0], { type: 'null' }, objectBranches[1]],
        last: [...objectBranches, { type: 'null' }],
      }[nullBranch],
    },
  },
});

describe('nullable.object-null-branch.render — the standard null-branch pattern', () => {
  afterEach(() => vi.restoreAllMocks());

  describe.each(['first', 'middle', 'last'] as const)(
    'null branch %s',
    (position) => {
      it('validates a preserved null and shows the blank form of the active object branch', async () => {
        const form = await renderForm(pattern('oneOf', position), {
          defaultValue: { target: null },
          validator: true,
        });

        expect(form.getValue()).toEqual({ target: null });
        expect(await form.validate()).toEqual([]);
        expect(form.exists('/target/aValue')).toBe(true);
        expect(form.exists('/target/bValue')).toBe(false);
      });

      it('validates an object value through its own branch', async () => {
        const form = await renderForm(pattern('oneOf', position), {
          defaultValue: { target: { kind: 'a', aValue: 'long enough' } },
          validator: true,
        });

        expect(await form.validate()).toEqual([]);
      });

      it('routes a constraint violation inside an object branch to that field', async () => {
        const form = await renderForm(pattern('oneOf', position), {
          defaultValue: { target: { kind: 'a', aValue: 'x' } },
          validator: true,
        });

        const errors = await form.validate();
        // Same as without a null branch: the field's own error and the `oneOf`
        // failure, and no "must be null" from the branch that is not in use.
        expect(errors.map((error) => [error.dataPath, error.keyword])).toEqual([
          ['/target/aValue', 'minLength'],
          ['/target', 'oneOf'],
        ]);
        expect(
          form.node('/target/aValue')?.errors.map((error) => error.keyword),
        ).toEqual(['minLength']);
        expect(
          form.node('/target')?.errors.map((error) => error.keyword),
        ).toEqual(['oneOf']);
      });
    },
  );

  it('promotes a null to the value a never-null form holds, and that value validates', async () => {
    const seeded = await renderForm(pattern('oneOf', 'first'), {
      defaultValue: { target: null },
      validator: true,
    });
    await seeded.type('/target/aValue', 'typed');
    const promoted = seeded.getValue();
    const validity = await seeded.validate();
    seeded.unmount();

    const fresh = await renderForm(pattern('oneOf', 'first'));
    await fresh.type('/target/aValue', 'typed');

    expect(promoted).toEqual({ target: { kind: 'a', aValue: 'typed' } });
    expect(promoted).toEqual(fresh.getValue());
    expect(validity).toEqual([]);
  });

  it('validates after the object is assigned null, and reset returns to the seeded null', async () => {
    const form = await renderForm(pattern('oneOf', 'first'), {
      defaultValue: { target: null },
      validator: true,
    });
    await form.type('/target/aValue', 'typed');

    await form.setValue({ target: null });
    expect(form.getValue()).toEqual({ target: null });
    expect(await form.validate()).toEqual([]);

    await form.type('/target/aValue', 'again');
    await form.reset();
    expect(form.getValue()).toEqual({ target: null });
    expect(await form.validate()).toEqual([]);
  });

  it('validates after the user switches the object branch', async () => {
    const form = await renderForm(pattern('oneOf', 'first'), {
      defaultValue: { target: null },
      validator: true,
    });

    await form.selectOption('/target/kind', 'b');

    expect(form.getValue()).toEqual({ target: { kind: 'b' } });
    expect(form.exists('/target/bValue')).toBe(true);
    expect(form.exists('/target/aValue')).toBe(false);
    expect(await form.validate()).toEqual([]);
  });

  it('gives the validator no schema it has to warn about', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const form = await renderForm(pattern('oneOf', 'first'), {
      defaultValue: { target: null },
      validator: true,
    });

    await form.validate();

    expect(
      warn.mock.calls.filter((call) => String(call[0]).includes('strict mode')),
    ).toEqual([]);
  });

  it('validates null and an object value with anyOf as well', async () => {
    const seeded = await renderForm(pattern('anyOf', 'first'), {
      defaultValue: { target: null },
      validator: true,
    });
    expect(seeded.getValue()).toEqual({ target: null });
    expect(await seeded.validate()).toEqual([]);
    seeded.unmount();

    const filled = await renderForm(pattern('anyOf', 'first'), {
      defaultValue: { target: { kind: 'a', aValue: 'long enough' } },
      validator: true,
    });
    expect(await filled.validate()).toEqual([]);
  });
});
