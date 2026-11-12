import { createRef } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import {
  type ErrorMessageRendererProps,
  ErrorVisibility,
  type FieldInputProps,
  FieldNodeState,
  type FieldRendererProps,
  Form,
  type FormHandle,
  FormProvider,
  type InputRendererProps,
  type LabelRendererProps,
  ValidationMode,
  useFieldErrors,
} from '@/schema-form';

/** Stable shared props let memoized parts retain their presentation. */
const NOTE_STYLE = { color: 'crimson' };

/**
 * Own the label root and its accessibility addresses.
 * @param props - Bound label metadata and caller content.
 * @returns One associated label with a decorative required mark.
 */
const PartLabel = ({
  htmlFor,
  id,
  children,
  required,
  style,
  className,
}: LabelRendererProps) => (
  <label htmlFor={htmlFor} id={id} style={style} className={className}>
    {children}
    {required && <span aria-hidden="true"> *</span>}
  </label>
);

/**
 * Own the error root without selecting another message.
 * @param props - Explicit content and presentation props.
 * @returns The caller's message in an error root.
 */
const PartError = ({
  children,
  style,
  className,
}: ErrorMessageRendererProps) => (
  <em style={style} className={className}>
    {children}
  </em>
);

/**
 * Assemble the parts supplied for this field.
 * @param props - Group metadata and bound components.
 * @returns A root input or a labeled leaf with its formatted error.
 */
const PartsGroup = ({
  isRoot,
  Input,
  Label,
  ErrorMessage,
  errorMessage,
  context,
}: FieldRendererProps) =>
  isRoot ? (
    <Input />
  ) : (
    <div>
      <Label context={context} />
      <Input />
      {errorMessage != null && (
        <ErrorMessage style={NOTE_STYLE}>{errorMessage}</ErrorMessage>
      )}
    </div>
  );

/**
 * Show field errors beside the input without changing its ancestor path.
 * @param props - The bound input and its own field node.
 * @returns An unconditional input and a formatted message.
 */
const ErrorFrame = ({ node, children }: InputRendererProps) => {
  const { errors, errorVisible, errorMessage } = useFieldErrors(node);
  return (
    <section
      data-frame={node.path}
      data-field-error={
        (!node.isRoot && errorVisible && errors.length > 0) || undefined
      }
    >
      {children}
      <output>{errorMessage}</output>
    </section>
  );
};

/**
 * Request error presentation only for an input that uses it.
 * @param props - Binding-owned value, callback and live node.
 * @returns An uncontrolled input and its currently eligible message.
 */
const ErrorAwareInput = ({
  node,
  path,
  defaultValue,
  onChange,
}: FieldInputProps) => {
  const { errorMessage } = useFieldErrors(node);
  return (
    <>
      <input
        id={path}
        defaultValue={defaultValue}
        onChange={(event) => onChange(event.target.value)}
      />
      <span role="alert">{errorMessage}</span>
    </>
  );
};

afterEach(cleanup);

it('assembles registered label and error roots with the field name and explicit context', () => {
  const view = render(
    <Form
      jsonSchema={{
        type: 'object',
        required: ['name'],
        properties: { name: { type: 'string', title: 'Schema title' } },
      }}
      FieldRenderer={PartsGroup}
      LabelRenderer={PartLabel}
      ErrorMessageRenderer={PartError}
      errors={[{ dataPath: '/name', message: 'Check name' }]}
      errorVisibility={ErrorVisibility.Always}
      validationMode={ValidationMode.None}
    />,
  );
  const label = view.container.querySelector('label')!;
  expect(label.textContent).toBe('name *');
  expect(label.htmlFor).toBe('/name');
  expect(label.id).toBe('label:/name');
  expect(label.querySelector('span')?.getAttribute('aria-hidden')).toBe('true');
  expect(view.container.querySelector('em')?.style.color).toBe('crimson');
  expect(view.getByText('Check name')).toBeTruthy();
});

it('reads eligible errors in a real input and keeps its edit callback working', () => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      defaultValue="initial"
      fieldInputDefinitions={[
        { test: { type: 'string' }, Component: ErrorAwareInput },
      ]}
      errorVisibility={ErrorVisibility.Always}
      validationMode={ValidationMode.None}
    />,
  );
  act(() =>
    ref.current!.node!.setExternalErrors([
      { dataPath: '', message: 'Input issue' },
    ]),
  );
  expect(view.getByRole('alert').textContent).toBe('Input issue');
  fireEvent.change(view.container.querySelector('input')!, {
    target: { value: 'typed' },
  });
  expect(ref.current!.getValue()).toBe('typed');
  expect(view.getByRole('alert').textContent).toBe('');
});

it('uses the hook inside a provider frame while one Form.Input position is unwrapped', () => {
  const ref = createRef<FormHandle>();
  const view = render(
    <FormProvider InputRenderer={ErrorFrame}>
      <Form
        ref={ref}
        jsonSchema={{
          type: 'object',
          properties: { framed: { type: 'string' }, plain: { type: 'string' } },
        }}
        validationMode={ValidationMode.None}
        errorVisibility={ErrorVisibility.Always}
      >
        <Form.Input path="/framed" />
        <Form.Input path="/plain" unwrapped />
      </Form>
    </FormProvider>,
  );
  act(() =>
    ref
      .current!.findNode('/framed')!
      .setExternalErrors([{ dataPath: '/framed', message: 'Frame issue' }]),
  );
  expect(
    view.container.querySelector('[data-frame="/framed"] output')?.textContent,
  ).toBe('Frame issue');
  expect(view.container.querySelector('[data-frame="/plain"]')).toBeNull();
  expect(view.container.querySelectorAll('input')).toHaveLength(2);
});

it('skips a registered frame with the bound Input unwrapped prop', () => {
  const BareField = ({ Input }: FieldRendererProps) => <Input unwrapped />;
  const view = render(
    <Form
      jsonSchema={{ type: 'string' }}
      InputRenderer={ErrorFrame}
      FieldRenderer={BareField}
      validationMode={ValidationMode.None}
    />,
  );
  expect(view.container.querySelector('section')).toBeNull();
  expect(view.container.querySelector('input')).not.toBeNull();
});

it('lets standalone parts own their roots and accepts label children', () => {
  const view = render(
    <Form
      jsonSchema={{ type: 'object', properties: { name: { type: 'string' } } }}
      LabelRenderer={PartLabel}
      ErrorMessageRenderer={PartError}
      validationMode={ValidationMode.None}
    >
      <Form.Label path="/name">Display name</Form.Label>
      <Form.Input path="/name" />
      <Form.ErrorMessage path="/name" />
    </Form>,
  );
  expect(view.getByLabelText('Display name')).toBe(
    view.container.querySelector('input'),
  );
  expect(view.container.querySelectorAll('label')).toHaveLength(1);
  expect(
    view.container
      .querySelector('em')
      ?.parentElement?.getAttribute('data-path'),
  ).toBe('/name');
});

it('frames the root, object, array and leaf inputs without marking root aggregates as field errors', () => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'object',
        properties: {
          name: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          inner: { type: 'object', properties: { a: { type: 'string' } } },
        },
      }}
      defaultValue={{ name: 'Name', tags: ['tag'], inner: { a: 'A' } }}
      InputRenderer={ErrorFrame}
      errorVisibility={ErrorVisibility.Always}
      validationMode={ValidationMode.None}
    />,
  );
  expect(
    Array.from(view.container.querySelectorAll('[data-frame]'), (element) =>
      element.getAttribute('data-frame'),
    ),
  ).toEqual(['', '/name', '/tags', '/tags/0', '/inner', '/inner/a']);
  act(() =>
    ref
      .current!.findNode('/name')!
      .setExternalErrors([{ dataPath: '/name', message: 'Name issue' }]),
  );
  const rootFrame = view.container.querySelector('[data-frame=""]')!;
  const innerFrame = view.container.querySelector('[data-frame="/inner"]')!;
  expect(rootFrame.querySelector(':scope > output')?.textContent).toBe(
    'Name issue',
  );
  expect(innerFrame.querySelector(':scope > output')?.textContent).toBe('');
  expect(rootFrame.hasAttribute('data-field-error')).toBe(false);
  expect(innerFrame.hasAttribute('data-field-error')).toBe(false);
  expect(
    view.container
      .querySelector('[data-frame="/name"]')
      ?.getAttribute('data-field-error'),
  ).toBe('true');
});

it('renders an input without observation only when its props change', () => {
  const ref = createRef<FormHandle>();
  let renders = 0;
  const Input = ({ path, defaultValue }: FieldInputProps) => {
    renders++;
    return <input id={path} defaultValue={defaultValue} />;
  };
  render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      defaultValue="initial"
      fieldInputDefinitions={[{ test: { type: 'string' }, Component: Input }]}
      validationMode={ValidationMode.None}
      errorVisibility={ErrorVisibility.Always}
    />,
  );
  const node = ref.current!.node!;
  const initialRenders = renders;
  act(() => node.setExternalErrors([{ dataPath: '', message: 'Issue' }]));
  expect(renders).toBe(initialRenders);
  act(() => node.setState({ [FieldNodeState.Touched]: true }));
  expect(renders).toBe(initialRenders);
  act(() => node.setState({ [FieldNodeState.Edited]: true }));
  expect(renders).toBe(initialRenders);
  act(() => node.setState({ [FieldNodeState.ErrorVisibility]: false }));
  expect(renders).toBe(initialRenders);
  act(() => node.setValue('next'));
  expect(renders).toBe(initialRenders + 1);
});
