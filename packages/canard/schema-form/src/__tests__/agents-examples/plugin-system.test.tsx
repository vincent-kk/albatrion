import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import Ajv from 'ajv';
import { afterEach, expect, it } from 'vitest';

import {
  type FieldInputProps,
  Form,
  type FormHandle,
  type SchemaFormPlugin,
  type ValidateFunction,
  type ValidationIssue,
  registerPlugin,
} from '@/schema-form';

const customValidatorPlugin: SchemaFormPlugin = {
  validator: {
    // compile once per schema; return the validate function
    compile:
      (schema): ValidateFunction =>
      async (data) => {
        const issues: ValidationIssue[] = collectIssues(schema, data);
        return issues.length > 0 ? issues : null; // null = valid
      },
    // Required: a synchronous predicate for an authored `if` schema at `pointer`.
    compileGuard: (root, pointer) => (value) =>
      checkGuard(root, pointer, value),
  },
};

afterEach(cleanup);

/** Stand-in UI plugin: renders a recognizable input for every string field. */
const antd5Plugin: SchemaFormPlugin = {
  fieldInputDefinitions: [
    {
      test: { type: 'string' },
      Component: ({ value, onChange }: FieldInputProps<string>) => (
        <input
          aria-label="Stand-in input"
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
        />
      ),
    },
  ],
};

/** Stand-in validator plugin backed by a synchronous AJV adapter. */
const ajvValidatorPlugin: SchemaFormPlugin = {
  validator: {
    compile(schema) {
      const validate = new Ajv({ allErrors: true, strict: false }).compile(
        schema,
      );
      return (value) =>
        validate(value)
          ? null
          : (validate.errors ?? []).map((error) => ({
              dataPath: error.instancePath,
              keyword: error.keyword,
              message: error.message,
              schemaPath: error.schemaPath,
            }));
    },
    compileGuard(schema, pointer) {
      const ajv = new Ajv({ strict: false });
      ajv.addSchema(schema, 'urn:example:plugin-system');
      const guard = ajv.getSchema(`urn:example:plugin-system#${pointer}`);
      if (!guard) throw new Error('Example guard was not found');
      return (value) => guard(value) === true;
    },
  },
};

// prettier-ignore
function registerPlugins() {
registerPlugin(antd5Plugin); // 1. UI
registerPlugin(ajvValidatorPlugin); // 2. validator
}

it('renders the registered UI plugin input and validates with the registered validator', async () => {
  registerPlugins();
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string', minLength: 3 }}
      defaultValue="a"
    />,
  );
  expect(view.getByLabelText('Stand-in input')).toBeTruthy();
  await act(async () => {
    expect(await ref.current!.validate()).toEqual([
      expect.objectContaining({ keyword: 'minLength' }),
    ]);
  });
});

/** Example rule: a string needs at least three characters. */
function collectIssues(_schema: unknown, data: unknown): ValidationIssue[] {
  return typeof data === 'string' && data.length >= 3
    ? []
    : [{ dataPath: '', keyword: 'minLength', message: 'too short' }];
}

/** The example never authors `if` schemas, so every guard fails. */
function checkGuard(_root: unknown, _pointer: string, _value: unknown) {
  return false;
}

it('treats a null verdict as valid and a list as issues, through compile and Form', async () => {
  const validator = customValidatorPlugin.validator!;
  expect(typeof validator.compile).toBe('function');
  expect(typeof validator.compileGuard).toBe('function');
  const validate = validator.compile({ type: 'string' });
  expect(await validate('abcd')).toBeNull();
  expect(await validate('a')).toEqual([
    { dataPath: '', keyword: 'minLength', message: 'too short' },
  ]);
  expect(validator.compileGuard({ type: 'string' }, '')('x')).toBe(false);

  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      defaultValue="abcd"
      validatorFactory={validator}
    />,
  );
  await act(async () => {
    expect(await ref.current!.validate()).toEqual([]);
  });
  act(() => ref.current!.setValue('a'));
  await act(async () => {
    expect(await ref.current!.validate()).toEqual([
      expect.objectContaining({ keyword: 'minLength' }),
    ]);
  });
});
