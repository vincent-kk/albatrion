import { createRef, useEffect, useRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { ErrorVisibility } from '@/schema-form';
import {
  Form,
  type FormHandle,
  type JSONSchema,
  type ValidationIssue,
  type ValidatorFactory,
} from '@/schema-form';

afterEach(cleanup);

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number' },
    password: { type: 'string' },
  },
} as const satisfies JSONSchema;

type Value = { name?: string; age?: number; password?: string };

/** Exposes the typed handle to the test once Form has mounted. */
function HandleHost({
  onHandle,
}: {
  onHandle: (handle: FormHandle<typeof schema, Value>) => void;
}) {
  // prettier-ignore
  const formRef = useRef<FormHandle<typeof schema, Value>>(null);
  useEffect(() => {
    onHandle(formRef.current!);
  }, [onHandle]);
  return (
    <Form<typeof schema, Value>
      ref={formRef}
      jsonSchema={schema}
      defaultValue={{ name: 'Ada' }}
    />
  );
}

it('types the handle with the documented ref line and reads the form through it', () => {
  let handle: FormHandle<typeof schema, Value> | undefined;
  render(<HandleHost onHandle={(next) => (handle = next)} />);
  expect(handle!.getValue()).toEqual({ name: 'Ada' });
  expect(handle!.findNode('/name')!.value).toBe('Ada');
});

// prettier-ignore
const layout = (
<Form jsonSchema={schema}>
  <div className="row">
    <Form.Label path="/name" />
    <Form.Input path="/name" />
    <Form.ErrorMessage path="/name" />
  </div>
</Form>
);

it('lets Form children take over the layout without filling in omitted fields', () => {
  const custom = render(layout);
  expect(
    custom.container.querySelector('.row [data-path="/name"]'),
  ).toBeTruthy();
  expect(custom.container.querySelector('[data-path="/age"]')).toBeNull();
  expect(custom.container.querySelector('[data-path="/password"]')).toBeNull();
  custom.unmount();
  const fallback = render(<Form jsonSchema={schema} />);
  expect(fallback.container.querySelector('[data-path="/age"]')).toBeTruthy();
});

// prettier-ignore
const passwordField = (
<Form.Render path="/password">
  {({ Input, errorMessage }) => (
    <div className="password-box">
      <Input />
      {errorMessage}
    </div>
  )}
</Form.Render>
);

it('hands Input and errorMessage to the Form.Render callback', () => {
  const errors: ValidationIssue[] = [
    { dataPath: '/password', keyword: 'server', message: 'Too short' },
  ];
  const view = render(
    <Form
      jsonSchema={schema}
      defaultValue={{ password: 'abc' }}
      errors={errors}
      errorVisibility={ErrorVisibility.Always}
    >
      {passwordField}
    </Form>,
  );
  const box = view.container.querySelector('.password-box')!;
  expect((box.querySelector('input') as HTMLInputElement).value).toBe('abc');
  expect(box.textContent).toContain('Too short');
});

const reloadSchema = {
  type: 'object',
  properties: { name: { type: 'string' } },
} as const satisfies JSONSchema;

const validatorOne: ValidatorFactory = {
  compile: () => () => null,
  compileGuard: () => () => true,
};

const validatorTwo: ValidatorFactory = {
  compile: () => () => null,
  compileGuard: () => () => true,
};

it('rebuild() reloads the committed defaultValue and discards edits', async () => {
  const ref = createRef<FormHandle<typeof reloadSchema>>();
  render(
    <Form
      ref={ref}
      jsonSchema={reloadSchema}
      defaultValue={{ name: 'loaded' }}
      validatorFactory={validatorOne}
    />,
  );
  await act(async () => {});
  act(() => ref.current!.setValue({ name: 'edited' }));
  expect(ref.current!.getValue()).toEqual({ name: 'edited' });

  act(() => ref.current!.rebuild());
  expect(ref.current!.getValue()).toEqual({ name: 'loaded' });
});

it('a new validator reloads the committed defaultValue and discards edits', async () => {
  const ref = createRef<FormHandle<typeof reloadSchema>>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={reloadSchema}
      defaultValue={{ name: 'loaded' }}
      validatorFactory={validatorOne}
    />,
  );
  await act(async () => {});
  act(() => ref.current!.setValue({ name: 'edited' }));
  expect(ref.current!.getValue()).toEqual({ name: 'edited' });

  view.rerender(
    <Form
      ref={ref}
      jsonSchema={reloadSchema}
      defaultValue={{ name: 'loaded' }}
      validatorFactory={validatorTwo}
    />,
  );
  await act(async () => {});
  expect(ref.current!.getValue()).toEqual({ name: 'loaded' });
});
