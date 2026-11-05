import { createRef } from 'react';

import { act, cleanup, render, screen } from '@testing-library/react';
import Ajv from 'ajv';
import { afterEach, expect, it, vi } from 'vitest';

import {
  Form,
  type FormHandle,
  type JSONSchema,
  type ValidationIssue,
  ValidationMode,
  type ValidatorFactory,
} from '@/schema-form';

afterEach(cleanup);

/** Compiles every schema except the one titled `broken`.
 * @returns The validator factory and its compile spy. */
const createFlakyValidator = () => {
  const compile = vi.fn((schema: JSONSchema) => {
    if (schema.title === 'broken') throw new Error('cannot compile');
    return () => null;
  });
  const validatorFactory: ValidatorFactory = {
    compile,
    compileGuard: () => () => true,
  };
  return { compile, validatorFactory };
};

const brokenSchema: JSONSchema = {
  title: 'broken',
  type: 'object',
  properties: { name: { type: 'string' } },
};

const correctedSchema: JSONSchema = {
  title: 'fixed',
  type: 'object',
  properties: { name: { type: 'string' } },
};

/** Reads whether validate() rejects.
 * @param ref - Handle of the mounted form.
 * @returns True when the call rejected. */
const rejects = async (ref: { current: FormHandle | null }) => {
  let rejected = false;
  await act(async () => {
    await ref.current!.validate().catch(() => {
      rejected = true;
    });
  });
  return rejected;
};

it('rebuild with the same schema object and validator reuses the cached compile failure', async () => {
  const { compile, validatorFactory } = createFlakyValidator();
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      jsonSchema={brokenSchema}
      validatorFactory={validatorFactory}
      validationMode={ValidationMode.OnRequest}
    />,
  );
  expect(await rejects(ref)).toBe(true);
  const compiled = compile.mock.calls.length;
  expect(compiled).toBeGreaterThan(0);

  act(() => ref.current!.rebuild());
  expect(await rejects(ref)).toBe(true);
  expect(compile.mock.calls.length).toBe(compiled);
});

it('a corrected schema object takes effect after its props commit and reset, not from the new prop alone', async () => {
  const { compile, validatorFactory } = createFlakyValidator();
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={brokenSchema}
      validatorFactory={validatorFactory}
      validationMode={ValidationMode.OnRequest}
    />,
  );
  expect(await rejects(ref)).toBe(true);
  const compiled = compile.mock.calls.length;

  view.rerender(
    <Form
      ref={ref}
      jsonSchema={correctedSchema}
      validatorFactory={validatorFactory}
      validationMode={ValidationMode.OnRequest}
    />,
  );
  expect(await rejects(ref)).toBe(true);
  expect(compile.mock.calls.length).toBe(compiled);

  act(() => ref.current!.reset());
  expect(await rejects(ref)).toBe(false);
  expect(compile.mock.calls.length).toBeGreaterThan(compiled);
  expect(compile.mock.calls.some(([schema]) => schema.title === 'fixed')).toBe(
    true,
  );
});

/** Isolated synchronous AJV adapter; applications select a validator plugin. */
const validator: ValidatorFactory = {
  compile(schema) {
    const validate = new Ajv({ allErrors: true, strict: false }).compile(
      schema,
    );
    return (value) =>
      validate(value)
        ? null
        : (validate.errors ?? []).map(
            (error): ValidationIssue => ({
              dataPath: error.instancePath,
              keyword: error.keyword,
              message: error.message,
              schemaPath: error.schemaPath,
            }),
          );
  },
  compileGuard(schema, pointer) {
    const ajv = new Ajv({ strict: false });
    ajv.addSchema(schema, 'urn:example:validation-failures');
    const guard = ajv.getSchema(`urn:example:validation-failures#${pointer}`);
    if (!guard) throw new Error('Example guard was not found');
    return (value) => guard(value) === true;
  },
};

const gateSchema: JSONSchema = {
  type: 'object',
  properties: { flag: { type: 'boolean' } },
  if: { properties: { flag: { const: true } }, required: ['flag'] },
  then: { properties: { thenField: { type: 'string' } } },
  else: { properties: { elseField: { type: 'string' } } },
};

/** Lists which gate-controlled fields exist in the mounted form.
 * @param ref - Handle of the mounted form.
 * @returns Names of the `then` and `else` fields that have a node. */
const presentBranchFields = (ref: { current: FormHandle | null }) =>
  ['/thenField', '/elseField'].filter((path) => ref.current!.findNode(path));

it('without a validator neither the then nor the else fields of an if become active', async () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      jsonSchema={gateSchema}
      defaultValue={{ flag: true }}
      validationMode={ValidationMode.OnRequest}
    />,
  );
  await act(async () => {});
  expect(screen.queryAllByRole('textbox')).toHaveLength(0);
  expect(presentBranchFields(ref)).toEqual([]);
  cleanup();

  const falseRef = createRef<FormHandle>();
  render(
    <Form
      ref={falseRef}
      jsonSchema={gateSchema}
      defaultValue={{ flag: false }}
      validationMode={ValidationMode.OnRequest}
    />,
  );
  await act(async () => {});
  expect(screen.queryAllByRole('textbox')).toHaveLength(0);
  expect(presentBranchFields(falseRef)).toEqual([]);
});

it('with a validator the same schema activates exactly one branch', async () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      jsonSchema={gateSchema}
      defaultValue={{ flag: true }}
      validatorFactory={validator}
      validationMode={ValidationMode.OnRequest}
    />,
  );
  await act(async () => {});
  expect(presentBranchFields(ref)).toEqual(['/thenField']);
  cleanup();

  const falseRef = createRef<FormHandle>();
  render(
    <Form
      ref={falseRef}
      jsonSchema={gateSchema}
      defaultValue={{ flag: false }}
      validatorFactory={validator}
      validationMode={ValidationMode.OnRequest}
    />,
  );
  await act(async () => {});
  expect(presentBranchFields(falseRef)).toEqual(['/elseField']);
});
