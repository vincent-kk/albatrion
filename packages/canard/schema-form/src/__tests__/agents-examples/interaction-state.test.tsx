import { createRef, useEffect, useRef, useState } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Ajv from 'ajv';
import { afterEach, expect, it, vi } from 'vitest';

import {
  type FieldInputProps,
  type FieldNode,
  FieldNodeEventType,
  FieldNodeState,
  Form,
  type FormHandle,
  type FormProps,
  FormProvider,
  type JSONSchema,
  type ValidationIssue,
  ValidationMode,
  type ValidatorFactory,
  useFieldNodeTracker,
} from '@/schema-form';

/** Builds an isolated synchronous AJV adapter; applications select a validator plugin.
 * @param urn - Schema identifier the guard lookup registers under.
 * @returns Validator factory for the examples. */
const createValidator = (urn: string): ValidatorFactory => ({
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
    ajv.addSchema(schema, urn);
    const guard = ajv.getSchema(`${urn}#${pointer}`);
    if (!guard) throw new Error('Example guard was not found');
    return (value) => guard(value) === true;
  },
});

const validatorA = createValidator('urn:example:interaction-state');
const validatorB = createValidator('urn:example:interaction-state-b');

/** React owns the tracker subscriptions; root output changes can affect a child's divergence.
 * @param props - Current node supplied by a Form render callback.
 * @returns Whether this node's output differs from its loaded output. */
function UnsavedIndicator({ node }: { node: FieldNode }) {
  useFieldNodeTracker(
    node.rootNode,
    FieldNodeEventType.UpdateValue |
      FieldNodeEventType.UpdateState |
      FieldNodeEventType.RequestRefresh,
  );
  useFieldNodeTracker(node, FieldNodeEventType.UpdatePath);
  return (
    <output aria-label="Unsaved changes">{String(node.isDivergent)}</output>
  );
}

/** Custom inputs own the interaction boundary, including blur.
 * @param props - Controlled value and write callback supplied by Form.
 * @returns Input that publishes user edits and records touch. */
function EditableName({ value, onChange, node }: FieldInputProps<string>) {
  return (
    <input
      aria-label="Editable name"
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value)}
      onBlur={() => node.setState({ [FieldNodeState.Touched]: true })}
    />
  );
}

afterEach(cleanup);

it('distinguishes edited state from divergence and restores the current loaded defaults', () => {
  const formRef = createRef<FormHandle>();
  const onStateChange = vi.fn<NonNullable<FormProps['onStateChange']>>();
  const view = render(
    <Form
      ref={formRef}
      jsonSchema={{ type: 'string' }}
      defaultValue="Ada"
      validationMode={ValidationMode.None}
      onStateChange={onStateChange}
      fieldInputMap={{ '': EditableName }}
    >
      {({ node }) => (
        <>
          <Form.Input path="" />
          <UnsavedIndicator node={node!} />
        </>
      )}
    </Form>,
  );
  const output = view.getByLabelText('Unsaved changes');
  expect(output.textContent).toBe('false');
  act(() => formRef.current!.setValue('Grace'));
  expect(output.textContent).toBe('true');
  expect(formRef.current!.node!.isEdited).toBe(false);
  fireEvent.change(view.getByLabelText('Editable name'), {
    target: { value: 'Ada' },
  });
  fireEvent.blur(view.getByLabelText('Editable name'));
  expect(output.textContent).toBe('false');
  expect(formRef.current!.getState()).toMatchObject({
    [FieldNodeState.Edited]: true,
    [FieldNodeState.Touched]: true,
  });
  expect(onStateChange).toHaveBeenLastCalledWith(formRef.current!.getState());
  act(() => formRef.current!.setValue('Grace'));
  act(() => formRef.current!.clearState());
  expect(formRef.current!.node!.isEdited).toBe(false);
  expect(formRef.current!.getValue()).toBe('Grace');
  expect(output.textContent).toBe('true');
  act(() => formRef.current!.reset());
  expect(formRef.current!.getValue()).toBe('Ada');
  expect(formRef.current!.node!.isTouched).toBe(false);
  expect(output.textContent).toBe('false');
});

it('aggregates descendant state and clears flags without changing values', () => {
  const formRef = createRef<FormHandle>();
  const onStateChange = vi.fn();
  render(
    <Form
      ref={formRef}
      jsonSchema={{
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      }}
      defaultValue={{ name: 'Ada' }}
      validationMode={ValidationMode.None}
      onStateChange={onStateChange}
    />,
  );
  act(() =>
    formRef
      .current!.findNode('/name')!
      .setState({ [FieldNodeState.Edited]: true }),
  );
  expect(formRef.current!.getState()[FieldNodeState.Edited]).toBe(true);
  expect(onStateChange).toHaveBeenLastCalledWith(formRef.current!.getState());
  act(() => formRef.current!.setState({ [FieldNodeState.Touched]: true }));
  expect(formRef.current!.findNode('/name')!.isTouched).toBe(true);
  act(() => formRef.current!.clearState());
  expect(formRef.current!.findNode('/name')!.isTouched).toBe(false);
  expect(formRef.current!.findNode('/name')!.isEdited).toBe(false);
  expect(formRef.current!.getValue()).toEqual({ name: 'Ada' });
});

it('keeps the tree and baseline on schema/default prop replacement until reset', () => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      defaultValue="Ada"
      validationMode={ValidationMode.None}
    />,
  );
  const root = ref.current!.node;
  act(() => ref.current!.setValue('Grace'));
  view.rerender(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string', minLength: 2 }}
      defaultValue="Grace"
      validationMode={ValidationMode.None}
    />,
  );
  expect(ref.current!.node).toBe(root);
  expect(root!.isDivergent).toBe(true);
  act(() => ref.current!.reset());
  expect(ref.current!.node).not.toBe(root);
  expect(root!.isDivergent).toBe(true);
  expect(ref.current!.getValue()).toBe('Grace');
  expect(ref.current!.node!.isDivergent).toBe(false);
});

const profileSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    bio: { type: 'string' },
  },
  required: ['name'],
} satisfies JSONSchema;

type Profile = { name: string; bio?: string };

function ReportDivergence({
  divergent,
  onDivergence,
}: {
  divergent: boolean;
  onDivergence: (divergent: boolean) => void;
}) {
  useEffect(() => {
    onDivergence(divergent);
  }, [divergent, onDivergence]);
  return null;
}

function ProfileEditor({ loaded }: { loaded: Profile }) {
  const formRef = useRef<FormHandle<typeof profileSchema>>(null);
  const [changed, setChanged] = useState(false);
  return (
    <>
      {changed && <p>Changed</p>}
      <Form ref={formRef} jsonSchema={profileSchema} defaultValue={loaded}>
        {({ node }) => (
          <>
            <Form.Field path="" />
            <ReportDivergence
              divergent={node?.isDivergent ?? false}
              onDivergence={setChanged}
            />
          </>
        )}
      </Form>
      <button type="button" onClick={() => formRef.current?.reset()}>
        Discard changes
      </button>
    </>
  );
}

it('shows the divergence indicator outside the form from function children', async () => {
  const user = userEvent.setup();
  const view = render(
    <FormProvider validatorFactory={validatorA}>
      <ProfileEditor loaded={{ name: 'Ada', bio: 'Engineer' }} />
    </FormProvider>,
  );
  expect(view.queryByText('Changed')).toBeNull();
  const name = view.getByDisplayValue('Ada');
  await user.type(name, 'x');
  expect(view.getByText('Changed')).toBeTruthy();
  await user.type(name, '{Backspace}');
  expect(view.queryByText('Changed')).toBeNull();
  await user.type(name, 'y');
  expect(view.getByText('Changed')).toBeTruthy();
  await user.click(view.getByText('Discard changes'));
  expect(view.queryByText('Changed')).toBeNull();
  expect((view.getByDisplayValue('Ada') as HTMLInputElement).value).toBe('Ada');
});

it('clears the indicator when a new validator reloads the same loaded value', async () => {
  const user = userEvent.setup();
  const loaded = { name: 'Ada', bio: 'Engineer' };
  const view = render(
    <FormProvider validatorFactory={validatorA}>
      <ProfileEditor loaded={loaded} />
    </FormProvider>,
  );
  await user.type(view.getByDisplayValue('Ada'), 'x');
  expect(view.getByText('Changed')).toBeTruthy();
  view.rerender(
    <FormProvider validatorFactory={validatorB}>
      <ProfileEditor loaded={loaded} />
    </FormProvider>,
  );
  expect((view.getByDisplayValue('Ada') as HTMLInputElement).value).toBe('Ada');
  expect(view.queryByText('Changed')).toBeNull();
});

it('clears the indicator when reset leaves the output unchanged', async () => {
  const user = userEvent.setup();
  const view = render(
    <FormProvider validatorFactory={validatorA}>
      <ProfileEditor loaded={{ name: 'Ada', bio: 'Engineer' }} />
    </FormProvider>,
  );
  await user.type(view.getByDisplayValue('Ada'), 'x');
  expect(view.getByText('Changed')).toBeTruthy();
  view.rerender(
    <FormProvider validatorFactory={validatorA}>
      <ProfileEditor loaded={{ name: 'Adax', bio: 'Engineer' }} />
    </FormProvider>,
  );
  await user.click(view.getByText('Discard changes'));
  expect(view.queryByText('Changed')).toBeNull();
});
