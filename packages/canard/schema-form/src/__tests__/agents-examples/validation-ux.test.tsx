import { createRef } from 'react';

import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
} from '@testing-library/react';
import Ajv from 'ajv';
import { afterEach, expect, it, vi } from 'vitest';

import {
  ErrorVisibility,
  type FieldInputProps,
  FieldNodeState,
  type FieldRendererProps,
  Form,
  type FormHandle,
  type JSONSchema,
  type ValidationIssue,
  ValidationMode,
  type ValidatorFactory,
  isValidationError,
} from '@/schema-form';

/** Isolated synchronous AJV adapter for these examples; applications select a validator plugin. */
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
              dataPath:
                error.keyword === 'required'
                  ? `${error.instancePath}/${String(error.params.missingProperty)}`
                  : error.instancePath,
              keyword: error.keyword,
              message: error.message,
              schemaPath: error.schemaPath,
            }),
          );
  },
  compileGuard(schema, pointer) {
    const ajv = new Ajv({ strict: false });
    ajv.addSchema(schema, 'urn:example:validation-ux');
    const guard = ajv.getSchema(`urn:example:validation-ux#${pointer}`);
    if (!guard) throw new Error('Example guard was not found');
    return (value) => guard(value) === true;
  },
};

/** A present string still needs a content constraint. */
const nameSchema = {
  type: 'object',
  required: ['name'],
  properties: { name: { type: 'string', minLength: 3 } },
} satisfies JSONSchema;

/** Render the library's resolved display decision beside a custom input.
 * @param props - FieldInput props supplied by Form; publishes edits and blur state.
 * @returns The editable field and its eligible first error. */
function NameInput({
  value,
  onChange,
  node,
  errors,
  errorVisible,
}: FieldInputProps<string>) {
  return (
    <>
      <input
        aria-label="Name"
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value || undefined)}
        onBlur={() => node.setState({ [FieldNodeState.Touched]: true })}
      />
      {errorVisible && errors[0] && (
        <span role="alert">{errors[0].message}</span>
      )}
    </>
  );
}

/** Let the custom input own the message so the default renderer does not duplicate it.
 * @param props - Renderer props supplied by Form.
 * @returns The resolved input, including its children for a branch. */
const InputOnly = ({ Input }: FieldRendererProps) => <Input />;

/** Shared consumer configuration used by the runnable examples. */
const formProps = {
  jsonSchema: nameSchema,
  defaultValue: { name: 'ab' },
  validatorFactory: validator,
  validationMode: ValidationMode.OnRequest,
  errorVisibility: ErrorVisibility.AfterTouch,
  fieldInputMap: { '/name': NameInput },
  FieldRenderer: InputOnly,
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

it('separates an OnRequest verdict from the moment a touched field shows it', async () => {
  const formRef = createRef<FormHandle>();
  const view = render(<Form ref={formRef} {...formProps} />);
  expect(formRef.current!.getErrors()).toEqual([]);
  await act(async () => {
    await formRef.current!.validate();
  });
  expect(formRef.current!.getErrors()).toEqual([
    expect.objectContaining({ dataPath: '/name', keyword: 'minLength' }),
  ]);
  expect(view.queryByRole('alert')).toBeNull();
  fireEvent.blur(view.getByLabelText('Name'));
  expect(view.getByRole('alert').textContent).not.toBe('');
  fireEvent.change(view.getByLabelText('Name'), { target: { value: 'Ada' } });
  await act(async () => {
    await formRef.current!.validate();
  });
  expect(formRef.current!.getValue()).toEqual({ name: 'Ada' });
  expect(formRef.current!.getErrors()).toEqual([]);
  expect(view.queryByRole('alert')).toBeNull();
  expect(formRef.current!.findNode('/name')!.isEdited).toBe(true);
  expect(formRef.current!.findNode('/name')!.isTouched).toBe(true);
});

it('routes server errors through the form and clears them independently of schema validation', async () => {
  const formRef = createRef<FormHandle>();
  const view = render(
    <Form ref={formRef} {...formProps} defaultValue={{ name: 'Ada' }} />,
  );
  const serverErrors: ValidationIssue[] = [
    { dataPath: '/name', keyword: 'server', message: 'This name is taken.' },
  ];
  view.rerender(<Form ref={formRef} {...formProps} errors={serverErrors} />);
  act(() => formRef.current!.revealErrors());
  await waitFor(() =>
    expect(view.getByRole('alert').textContent).toBe('This name is taken.'),
  );
  await act(async () => {
    await formRef.current!.validate();
  });
  expect(formRef.current!.getErrors()).toEqual(serverErrors);
  expect(formRef.current!.findNode('/name')!.errors).toEqual(serverErrors);
  view.rerender(
    <Form
      ref={formRef}
      {...formProps}
      errors={[]}
      errorVisibility={ErrorVisibility.Always}
    />,
  );
  expect(formRef.current!.getErrors()).toEqual([]);
  expect(view.queryByRole('alert')).toBeNull();
});

it('aggregates node-local server errors and clears them explicitly or on input', () => {
  const formRef = createRef<FormHandle>();
  const view = render(
    <Form
      ref={formRef}
      {...formProps}
      defaultValue={{ name: 'Ada' }}
      errorVisibility={ErrorVisibility.Always}
    />,
  );
  const field = formRef.current!.findNode('/name')!;
  const serverErrors: ValidationIssue[] = [
    { dataPath: '/name', keyword: 'server', message: 'This name is taken.' },
  ];
  act(() => field.setExternalErrors(serverErrors));
  expect(formRef.current!.getErrors()).toEqual(serverErrors);
  expect(view.getByRole('alert').textContent).toBe('This name is taken.');
  act(() => field.clearExternalErrors());
  expect(formRef.current!.getErrors()).toEqual([]);
  expect(view.queryByRole('alert')).toBeNull();
  act(() => field.setExternalErrors(serverErrors));
  expect(formRef.current!.getErrors()).toEqual(serverErrors);
  fireEvent.change(view.getByLabelText('Name'), { target: { value: 'Grace' } });
  expect(formRef.current!.getValue()).toEqual({ name: 'Grace' });
  expect(formRef.current!.getErrors()).toEqual([]);
  expect(view.queryByRole('alert')).toBeNull();
});

/** The conditional requirement and its input are declared together. */
const receiptSchema = {
  type: 'object',
  properties: { receipt: { type: 'boolean' } },
  allOf: [
    {
      if: { properties: { receipt: { const: true } }, required: ['receipt'] },
      then: {
        properties: { email: { type: 'string', minLength: 3 } },
        required: ['email'],
      },
    },
  ],
} satisfies JSONSchema;

it('activates a conditional required field without duplicating the condition in component state', async () => {
  const formRef = createRef<FormHandle>();
  const view = render(
    <Form
      ref={formRef}
      jsonSchema={receiptSchema}
      defaultValue={{ receipt: false }}
      validatorFactory={validator}
      validationMode={ValidationMode.OnRequest}
      errorVisibility={ErrorVisibility.Always}
    />,
  );
  expect(formRef.current!.findNode('/email')).toBeNull();
  act(() => formRef.current!.setValue({ receipt: true }));
  expect(formRef.current!.findNode('/email')!.isRequired).toBe(true);
  await act(async () => {
    await formRef.current!.validate();
  });
  expect(formRef.current!.getErrors()).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ dataPath: '/email', keyword: 'required' }),
    ]),
  );
  expect(view.container.querySelector('[data-path="/email"]')).not.toBeNull();
  act(() => formRef.current!.setValue({ receipt: true, email: 'ab' }));
  await act(async () => {
    await formRef.current!.validate();
  });
  expect(formRef.current!.getErrors()).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ dataPath: '/email', keyword: 'minLength' }),
    ]),
  );
  act(() =>
    formRef.current!.setValue({ receipt: true, email: 'a@example.test' }),
  );
  await act(async () => {
    await formRef.current!.validate();
  });
  expect(formRef.current!.getErrors()).toEqual([]);
  act(() => formRef.current!.findNode('/receipt')!.setValue(false));
  await act(async () => {
    await formRef.current!.validate();
  });
  expect(formRef.current!.getErrors()).toEqual([]);
  expect(formRef.current!.getValue()).toEqual({ receipt: false });
  expect(view.container.querySelector('[data-path="/email"]')).toBeNull();
});

it.each([
  { mode: ValidationMode.OnChange, automatic: true },
  { mode: ValidationMode.OnRequest, automatic: false },
  { mode: ValidationMode.None, automatic: false },
])(
  'mode $mode exposes only the expected automatic verdicts',
  async ({ mode, automatic }) => {
    vi.useFakeTimers();
    const formRef = createRef<FormHandle>();
    const onValidate = vi.fn();
    const onSubmit = vi.fn();
    const view = render(
      <Form
        ref={formRef}
        {...formProps}
        validationMode={mode}
        onValidate={onValidate}
        onSubmit={onSubmit}
      />,
    );
    expect(onValidate).not.toHaveBeenCalled();
    if (mode === ValidationMode.None) {
      await act(async () => {
        await formRef.current!.submit();
      });
      expect(onSubmit).toHaveBeenCalledWith({ name: 'ab' });
    }
    await act(async () => {
      await vi.advanceTimersByTimeAsync(150);
    });
    expect(onValidate).toHaveBeenCalledTimes(automatic ? 1 : 0);
    fireEvent.change(view.getByLabelText('Name'), { target: { value: 'Ada' } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(150);
    });
    expect(onValidate).toHaveBeenCalledTimes(automatic ? 2 : 0);
    expect(formRef.current!.getValue()).toEqual({ name: 'Ada' });
  },
);

it('None skips whole compilation even when explicitly asked for a verdict', async () => {
  vi.useFakeTimers();
  const compile = vi.fn(validator.compile);
  const formRef = createRef<FormHandle>();
  render(
    <Form
      ref={formRef}
      {...formProps}
      validationMode={ValidationMode.None}
      validatorFactory={{ ...validator, compile }}
    />,
  );
  await act(async () => {
    await vi.advanceTimersByTimeAsync(150);
    expect(await formRef.current!.validate()).toEqual([]);
  });
  expect(compile).not.toHaveBeenCalled();
  expect(formRef.current!.getValue()).toEqual({ name: 'ab' });
});

it('submit rejects invalid input and sends a fresh valid value after explicit error reveal', async () => {
  const formRef = createRef<FormHandle>();
  const onSubmit = vi.fn();
  const view = render(
    <Form
      ref={formRef}
      {...formProps}
      onSubmit={onSubmit}
      validationMode={ValidationMode.OnChange | ValidationMode.OnRequest}
    />,
  );
  let rejection: unknown;
  await act(async () => {
    await formRef.current!.submit().catch((error: unknown) => {
      rejection = error;
    });
  });
  expect(isValidationError(rejection)).toBe(true);
  expect(onSubmit).not.toHaveBeenCalled();
  expect(view.queryByRole('alert')).toBeNull();
  act(() => formRef.current!.revealErrors());
  await waitFor(() => expect(view.queryByRole('alert')).not.toBeNull());
  fireEvent.change(view.getByLabelText('Name'), { target: { value: 'Ada' } });
  await act(async () => {
    await formRef.current!.submit();
  });
  expect(onSubmit).toHaveBeenCalledExactlyOnceWith({ name: 'Ada' });
  expect(view.queryByRole('alert')).toBeNull();
});

const unionSchema: JSONSchema = {
  type: 'object',
  properties: { kind: { type: 'string' }, shared: { type: 'string' } },
  oneOf: [
    {
      controls: { active: './kind === "a"' },
      properties: {
        kind: { const: 'a' },
        shared: { minLength: 3 },
        a: { type: 'string' },
      },
      required: ['kind', 'a'],
    },
    {
      controls: { active: './kind === "b"' },
      properties: { kind: { const: 'b' }, shared: { maxLength: 1 } },
      required: ['kind'],
    },
  ],
};

it('an inactive oneOf branch issue skips node assignment but stays in getErrors() and the submit verdict', async () => {
  const ref = createRef<FormHandle>();
  const onSubmit = vi.fn();
  render(
    <Form
      ref={ref}
      jsonSchema={unionSchema}
      defaultValue={{ kind: 'a', shared: 'xy' }}
      validatorFactory={validator}
      validationMode={ValidationMode.OnRequest}
      onSubmit={onSubmit}
    />,
  );
  await act(async () => {});
  let issues: readonly ValidationIssue[] = [];
  await act(async () => {
    issues = await ref.current!.validate();
  });
  const offBranch = issues.filter((issue) =>
    issue.schemaPath?.startsWith('#/oneOf/1/'),
  );
  expect(offBranch.map((issue) => issue.keyword).sort()).toEqual([
    'const',
    'maxLength',
  ]);
  expect(ref.current!.getErrors()).toEqual(issues);
  const nodeIssues = ['', '/kind', '/shared', '/a'].flatMap(
    (path) => ref.current!.findNode(path)?.errors ?? [],
  );
  for (const issue of offBranch) expect(nodeIssues).not.toContain(issue);
  expect(
    (ref.current!.findNode('/shared')?.errors ?? []).map((i) => i.keyword),
  ).toEqual(['minLength']);

  let rejection: unknown;
  await act(async () => {
    await ref.current!.submit().catch((error: unknown) => {
      rejection = error;
    });
  });
  expect(isValidationError(rejection)).toBe(true);
  expect(onSubmit).not.toHaveBeenCalled();
});
