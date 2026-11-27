import { act } from 'react';

import {
  FormErrorCode,
  type FormHandle,
  ValidationMode,
  registerPlugin,
} from '@canard/schema-form';
import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';

import { createValidator, plugin } from '../default';
import {
  createIsEvenBranchSchemas,
  isEvenKeyword,
} from './fixtures/isEvenBranchSchemas';
import { mountForm } from './utils/mountForm';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

/**
 * Hands an instance to the Form the way a consumer does.
 * @param mode - `createValidator` returns a per-instance validator; `bind` binds and registers the plugin
 * @param ajv - Instance carrying the consumer's keywords and formats
 * @returns The `validatorFactory` prop; undefined lets the Form use the registered plugin
 */
const supply = (mode: 'createValidator' | 'bind', ajv: Ajv) => {
  if (mode === 'createValidator') return createValidator(ajv);
  plugin.validator.bind(ajv);
  registerPlugin(plugin);
  return undefined;
};

/** Lists which of the two branch-owned fields the form currently holds. */
const branchFields = (form: FormHandle) =>
  ['/evenField', '/oddField'].filter((path) => form.findNode(path) !== null);

/** A non-strict instance with `isEven` registered. */
const withIsEven = () => {
  const ajv = new Ajv({ strict: false });
  ajv.addKeyword(isEvenKeyword);
  return ajv;
};

describe('a custom keyword on the supplied AJV 8 instance', () => {
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

describe('an if condition the supplied AJV 8 instance cannot compile', () => {
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

  it.each([
    ['with', true, ['/evenField'], []],
    ['without', false, [], [FormErrorCode.GuardFailed]],
  ] as const)(
    'evaluates on a strict instance with the keyword only %s type: "object" in the condition',
    async (_, typed, fields, codes) => {
      const ajv = new Ajv({ strict: true });
      ajv.addKeyword(isEvenKeyword);
      const { ifSchema } = createIsEvenBranchSchemas();
      const { form, records, unmount } = await mountForm({
        jsonSchema: {
          ...ifSchema,
          if: typed
            ? ifSchema.if
            : { properties: { n: { isEven: true } }, required: ['n'] },
        },
        defaultValue: { n: 2 },
        validatorFactory: createValidator(ajv),
      });
      expect(branchFields(form)).toEqual(fields);
      expect(records.map((record) => record.code)).toEqual(codes);
      await unmount();
    },
  );

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
