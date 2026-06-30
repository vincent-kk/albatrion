import { type FC } from 'react';

import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';

import type { JsonSchema } from '@winglet/json-schema';

import type { FormTypeInputProps } from '@/schema-form';

import { renderForm } from '../renderForm';

/**
 * BUG-2 regression — the user-supplied `defaultValue` prop must never be mutated.
 *
 * The node tree fills nested schema defaults into the default value IN PLACE
 * (`getObjectDefaultValue` via `setValue`, reached e.g. through a terminal
 * object node). `Form` therefore clones `defaultValue` once at mount (symmetric
 * with the schema clone), so the caller's object — which may be shared across
 * form instances or frozen — is left untouched.
 *
 * Without the clone: the schema default leaks into the caller's object, and a
 * frozen default throws during construction.
 */

// A terminal object renders a single custom input (and routes through
// getObjectDefaultValue at construction). The input itself is irrelevant here —
// the assertions are on the caller's object and the form value.
const Box: FC<FormTypeInputProps<any>> = ({ path, value }: any) => (
  <input
    id={path}
    readOnly
    value={value == null ? '' : JSON.stringify(value)}
  />
);
const boxDefs = [{ test: { formType: 'box' }, Component: Box }] as any;

describe('default value — user input immutability (BUG-2 regression)', () => {
  it('does not mutate the user-supplied defaultValue prop', async () => {
    const schema = {
      type: 'object',
      properties: {
        profile: {
          type: 'object',
          terminal: true,
          formType: 'box',
          properties: {
            name: { type: 'string' },
            age: { type: 'number', default: 99 },
          },
        },
      },
    } satisfies JsonSchema;
    const userDefault = { profile: { name: 'Alice' } };
    const snapshot = structuredClone(userDefault);

    const form = await renderForm(schema, {
      defaultValue: userDefault as any,
      formTypeInputDefinitions: boxDefs,
    });

    // the caller's object is untouched (no schema-filled `age` leaked in)...
    expect(userDefault).toEqual(snapshot);
    expect(
      (userDefault.profile as Record<string, unknown>).age,
    ).toBeUndefined();
    // ...while the form's own copy did receive the schema default.
    expect(form.getValue()?.profile).toMatchObject({ name: 'Alice', age: 99 });
    expect(form.caughtErrors()).toEqual([]);
  });

  it('renders with a frozen defaultValue without throwing', async () => {
    const schema = {
      type: 'object',
      properties: {
        config: {
          type: 'object',
          terminal: true,
          formType: 'box',
          properties: {
            theme: { type: 'string' },
            size: { type: 'number', default: 10 },
          },
        },
      },
    } satisfies JsonSchema;
    const frozen = { config: Object.freeze({ theme: 'dark' }) };

    const form = await renderForm(schema, {
      defaultValue: frozen as any,
      formTypeInputDefinitions: boxDefs,
    });

    expect(form.caughtErrors()).toEqual([]);
    expect(form.getValue()?.config).toMatchObject({ theme: 'dark', size: 10 });
  });
});
