import { act } from 'react';

import {
  Form,
  FormErrorCode,
  type FormHandle,
  type FormProps,
  type JSONSchema,
  ValidationMode,
  registerPlugin,
} from '@canard/schema-form';
import Ajv from 'ajv';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';

import { createValidator, plugin } from '../index';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

/** One occurrence the Form delivers through `onError`. */
type FormErrorRecord = Parameters<NonNullable<FormProps['onError']>>[0];

/**
 * Builds fresh roots that branch on `isEven`, so no case reuses a root another case compiled.
 * @returns `ifSchema` puts `evenField` in `then` and `oddField` in `else`; `oneOfIfSchema` chooses
 *   between the same two fields with one `if` and `else: false` per branch; `bareOneOfSchema` uses
 *   the keyword inside its branches without `if`, gate or discriminator
 */
const createIsEvenBranchSchemas = () => ({
  ifSchema: {
    type: 'object',
    properties: { n: { type: 'number' } },
    if: {
      type: 'object',
      properties: { n: { isEven: true } },
      required: ['n'],
    },
    then: { properties: { evenField: { type: 'string' } } },
    else: { properties: { oddField: { type: 'string' } } },
  } satisfies JSONSchema,
  oneOfIfSchema: {
    type: 'object',
    properties: { n: { type: 'number' } },
    oneOf: [
      {
        if: {
          type: 'object',
          properties: { n: { isEven: true } },
          required: ['n'],
        },
        then: { properties: { evenField: { type: 'string' } } },
        else: false,
      },
      {
        if: {
          type: 'object',
          properties: { n: { isEven: false } },
          required: ['n'],
        },
        then: { properties: { oddField: { type: 'string' } } },
        else: false,
      },
    ],
  } satisfies JSONSchema,
  bareOneOfSchema: {
    type: 'object',
    properties: { n: { type: 'number' } },
    oneOf: [
      { properties: { n: { isEven: true }, evenField: { type: 'string' } } },
      { properties: { n: { isEven: false }, oddField: { type: 'string' } } },
    ],
  } satisfies JSONSchema,
});

/** A non-strict instance with `isEven`: `true` accepts an even number, `false` an odd one. */
const withIsEven = () => {
  const ajv = new Ajv({ strict: false });
  ajv.addKeyword({
    keyword: 'isEven',
    schemaType: 'boolean',
    validate: (schema: boolean, data: unknown) =>
      typeof data === 'number' && (data % 2 === 0) === schema,
  });
  return ajv;
};

/**
 * Hands an instance to the Form the way a consumer does.
 * @param mode - `createValidator` returns a per-instance validator; `bind` binds and registers the plugin
 * @param ajv - Instance carrying the consumer's keywords and formats
 * @returns The `validatorFactory` prop; undefined lets the Form use the registered plugin
 */
const supply = (
  mode: 'createValidator' | 'bind',
  ajv: Parameters<typeof createValidator>[0],
) => {
  if (mode === 'createValidator') return createValidator(ajv);
  plugin.validator.bind(ajv);
  registerPlugin(plugin);
  return undefined;
};

/** Lists which of the two branch-owned fields the form currently holds. */
const branchFields = (form: FormHandle) =>
  ['/evenField', '/oddField'].filter((path) => form.findNode(path) !== null);

/**
 * Mounts a Form the way a consumer renders it and keeps every `onError` record.
 * @param props - Schema, default value and validation settings; without `validatorFactory` the Form uses the registered plugin
 * @returns The form handle, the records delivered so far and an unmount function
 */
const mountForm = async (
  props: Pick<
    FormProps,
    'jsonSchema' | 'defaultValue' | 'validatorFactory' | 'validationMode'
  >,
) => {
  const container = document.body.appendChild(document.createElement('div'));
  const reactRoot = createRoot(container);
  const records: FormErrorRecord[] = [];
  let handle: FormHandle | null = null;
  await act(async () => {
    reactRoot.render(
      <Form
        {...props}
        ref={(form) => void (handle = form)}
        onError={(record) => records.push(record)}
      />,
    );
  });
  const unmount = async () => {
    await act(async () => reactRoot.unmount());
    container.remove();
  };
  return { form: handle!, records, unmount };
};

describe('a custom keyword on the supplied AJV 7 instance', () => {
  it.each(['createValidator', 'bind'] as const)(
    'decides if/then/else (%s)',
    async (mode) => {
      const { ifSchema } = createIsEvenBranchSchemas();
      const { form, records, unmount } = await mountForm({
        jsonSchema: ifSchema,
        defaultValue: { n: 2 },
        validatorFactory: supply(mode, withIsEven()),
      });
      expect(branchFields(form)).toEqual(['/evenField']);
      await act(async () => form.setValue({ n: 3 }));
      expect(branchFields(form)).toEqual(['/oddField']);
      expect(records).toEqual([]);
      await unmount();
    },
  );

  it.each(['createValidator', 'bind'] as const)(
    'chooses a oneOf branch written with if and else: false, reporting nothing (%s)',
    async (mode) => {
      const { oneOfIfSchema } = createIsEvenBranchSchemas();
      const { form, records, unmount } = await mountForm({
        jsonSchema: oneOfIfSchema,
        defaultValue: { n: 2 },
        validatorFactory: supply(mode, withIsEven()),
      });
      expect(branchFields(form)).toEqual(['/evenField']);
      await act(async () => form.setValue({ n: 3 }));
      expect(branchFields(form)).toEqual(['/oddField']);
      expect(records).toEqual([]);
      await unmount();
    },
  );

  it.each(['createValidator', 'bind'] as const)(
    'is what decides: a non-strict instance without it keeps then for an odd n (%s)',
    async (mode) => {
      const { ifSchema } = createIsEvenBranchSchemas();
      const { form, unmount } = await mountForm({
        jsonSchema: ifSchema,
        defaultValue: { n: 3 },
        validatorFactory: supply(mode, new Ajv({ strict: false })),
      });
      expect(branchFields(form)).toEqual(['/evenField']);
      await unmount();
    },
  );

  it.each(['createValidator', 'bind'] as const)(
    'does not choose a bare oneOf branch: both branch fields stay (%s)',
    async (mode) => {
      const { bareOneOfSchema } = createIsEvenBranchSchemas();
      const { form, unmount } = await mountForm({
        jsonSchema: bareOneOfSchema,
        defaultValue: { n: 2 },
        validatorFactory: supply(mode, withIsEven()),
      });
      expect(branchFields(form)).toEqual(['/evenField', '/oddField']);
      await act(async () => form.setValue({ n: 3 }));
      expect(branchFields(form)).toEqual(['/evenField', '/oddField']);
      await unmount();
    },
  );

  it('applies a format added after createValidator to an if condition', async () => {
    const ajv = new Ajv({ strict: false });
    const validator = createValidator(ajv);
    ajv.addFormat('even-digits', /^[02468]+$/);
    const { form, records, unmount } = await mountForm({
      jsonSchema: {
        type: 'object',
        properties: { code: { type: 'string' } },
        if: {
          type: 'object',
          properties: { code: { format: 'even-digits' } },
          required: ['code'],
        },
        then: { properties: { evenField: { type: 'string' } } },
        else: { properties: { oddField: { type: 'string' } } },
      },
      defaultValue: { code: '24' },
      validatorFactory: validator,
    });
    expect(branchFields(form)).toEqual(['/evenField']);
    await act(async () => form.setValue({ code: '13' }));
    expect(branchFields(form)).toEqual(['/oddField']);
    expect(records).toEqual([]);
    await unmount();
  });
});

describe('an if condition the supplied AJV 7 instance cannot compile', () => {
  it('fails the guard of a strict instance lacking the keyword: both branches off, one record, later writes throw', async () => {
    const { ifSchema } = createIsEvenBranchSchemas();
    const { form, records, unmount } = await mountForm({
      jsonSchema: ifSchema,
      defaultValue: { n: 2 },
      // None keeps out the whole-schema compile, which fails on the same unknown keyword.
      validationMode: ValidationMode.None,
      validatorFactory: createValidator(new Ajv({ strict: true })),
    });
    expect(branchFields(form)).toEqual([]);
    expect(records).toEqual([
      expect.objectContaining({
        level: 'error',
        code: FormErrorCode.GuardFailed,
        schemaPath: '#/if',
        origin: 'load',
        details: {
          cause: expect.objectContaining({
            message: 'strict mode: unknown keyword: "isEven"',
          }),
        },
      }),
    ]);
    await act(async () => {
      expect(() => form.setValue({ n: 3 })).toThrow(
        expect.objectContaining({ code: FormErrorCode.GuardFailed }),
      );
    });
    expect(form.getValue()).toEqual({ n: 3 });
    expect(branchFields(form)).toEqual([]);
    expect(records).toHaveLength(1);
    await unmount();
  });

  it('refuses an asynchronous keyword in an if condition', () => {
    const ajv = new Ajv({ strict: false });
    ajv.addKeyword({
      keyword: 'isEven',
      async: true,
      schemaType: 'boolean',
      validate: async () => true,
    });
    const { ifSchema } = createIsEvenBranchSchemas();
    expect(() => createValidator(ajv).compileGuard(ifSchema, '/if')).toThrow(
      'async keyword in sync schema',
    );
  });
});
