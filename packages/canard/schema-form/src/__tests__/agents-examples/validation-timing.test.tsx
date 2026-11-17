import { createRef } from 'react';

import { act, cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  ErrorVisibility,
  Form,
  type FormHandle,
  type FormProps,
  type JSONSchema,
  type ValidationIssue,
  ValidationMode,
  type ValidatorFactory,
} from '@/schema-form';

type ErrorRecord = Parameters<NonNullable<FormProps['onError']>>[0];

afterEach(cleanup);

const nameSchema = {
  type: 'object',
  properties: { name: { type: 'string' } },
} as const satisfies JSONSchema;

/** Builds a validator whose whole-schema runs are observable.
 * @param issues - Issues every run reports, or null for a clean verdict.
 * @returns The factory with spies for compilation and runs. */
const createObservedValidator = (issues: ValidationIssue[] | null = null) => {
  const run = vi.fn(() => issues);
  const compile = vi.fn(() => run);
  const validatorFactory: ValidatorFactory = {
    compile,
    compileGuard: () => () => true,
  };
  return { compile, run, validatorFactory };
};

/** Lets frames, tasks and promise callbacks pass.
 * @returns Nothing; resolves after a short real delay. */
const pass = () => act(() => new Promise<void>((r) => setTimeout(r, 120)));

it('an OnRequest form without if conditions compiles in the background after the first paint', async () => {
  const { compile, validatorFactory } = createObservedValidator();
  render(
    <Form
      jsonSchema={nameSchema}
      validatorFactory={validatorFactory}
      validationMode={ValidationMode.OnRequest}
    />,
  );
  expect(compile).not.toHaveBeenCalled();
  await waitFor(() => expect(compile).toHaveBeenCalled());
});

it('mount, reset, rebuild and a validator change each run one load validation after the next frame', async () => {
  const first = createObservedValidator();
  const second = createObservedValidator();
  const ref = createRef<FormHandle>();
  const element = (validatorFactory: ValidatorFactory) => (
    <Form
      ref={ref}
      jsonSchema={nameSchema}
      defaultValue={{ name: 'a' }}
      validatorFactory={validatorFactory}
      validationMode={ValidationMode.OnChange}
      errorVisibility={ErrorVisibility.Always}
    />
  );
  const view = render(element(first.validatorFactory));
  expect(first.run).not.toHaveBeenCalled();
  await pass();
  expect(first.run).toHaveBeenCalledTimes(1);

  act(() => ref.current!.reset());
  await pass();
  expect(first.run).toHaveBeenCalledTimes(2);

  act(() => ref.current!.rebuild());
  await pass();
  expect(first.run).toHaveBeenCalledTimes(3);

  view.rerender(element(second.validatorFactory));
  await pass();
  expect(second.run).toHaveBeenCalledTimes(1);
  expect(first.run).toHaveBeenCalledTimes(3);
});

const nameIssue: ValidationIssue = {
  dataPath: '/name',
  keyword: 'minLength',
  message: 'too short',
};

it('Form.Render receives the raw field errors while the display policy keeps errorVisible false', async () => {
  const { validatorFactory } = createObservedValidator([nameIssue]);
  const seen: Array<{ errors: number; visible: boolean }> = [];
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      jsonSchema={nameSchema}
      defaultValue={{ name: 'a' }}
      validatorFactory={validatorFactory}
      validationMode={ValidationMode.OnRequest}
      errorVisibility={ErrorVisibility.AfterTouch}
    >
      <Form.Render path="/name">
        {({ errors, errorVisible }) => {
          seen.push({ errors: errors.length, visible: errorVisible });
          return <span />;
        }}
      </Form.Render>
    </Form>,
  );
  await act(async () => {
    await ref.current!.validate();
  });
  await pass();
  expect(ref.current!.getErrors()).toEqual([nameIssue]);
  expect(ref.current!.findNode('/name')!.errors).toEqual([nameIssue]);
  expect(seen.at(-1)).toEqual({ errors: 1, visible: false });
});

it('Form children receive the raw form errors while the display policy keeps them hidden', async () => {
  const { validatorFactory } = createObservedValidator([nameIssue]);
  const seen: number[] = [];
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      jsonSchema={nameSchema}
      defaultValue={{ name: 'a' }}
      validatorFactory={validatorFactory}
      validationMode={ValidationMode.OnRequest}
      errorVisibility={ErrorVisibility.AfterTouch}
    >
      {({ errors }) => {
        seen.push(errors?.length ?? 0);
        return <span />;
      }}
    </Form>,
  );
  await act(async () => {
    await ref.current!.validate();
  });
  await pass();
  expect(seen.at(-1)).toBe(1);
});

it('a field hidden by controls.visible keeps its aggregate error', async () => {
  const { validatorFactory } = createObservedValidator([nameIssue]);
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'object',
        properties: {
          toggle: { type: 'boolean' },
          name: { type: 'string', controls: { visible: '../toggle === true' } },
        },
      }}
      defaultValue={{ toggle: false, name: 'a' }}
      validatorFactory={validatorFactory}
      validationMode={ValidationMode.OnRequest}
    />,
  );
  await act(async () => {
    await ref.current!.validate();
  });
  expect(
    document.querySelectorAll('input[type="text"], input:not([type])'),
  ).toHaveLength(0);
  expect(ref.current!.findNode('/name')!.isVisible).toBe(false);
  expect(ref.current!.getErrors()).toEqual([nameIssue]);
});

it('an automatic load compile failure is reported once per load', async () => {
  const hostReport = vi.fn();
  vi.stubGlobal('reportError', hostReport);
  const records: ErrorRecord[] = [];
  const compile = vi.fn(() => {
    throw new Error('cannot compile');
  });
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      jsonSchema={nameSchema}
      validatorFactory={{ compile, compileGuard: () => () => true }}
      validationMode={ValidationMode.OnChange}
      onError={(record) => records.push(record)}
    />,
  );
  await pass();
  const validateRecords = () =>
    records.filter((record) => record.origin === 'validate');
  expect(validateRecords()).toHaveLength(1);
  expect(hostReport).toHaveBeenCalledTimes(1);

  act(() => ref.current!.reset());
  await pass();
  expect(validateRecords()).toHaveLength(2);
  expect(hostReport).toHaveBeenCalledTimes(2);
  vi.unstubAllGlobals();
});

class Point {
  constructor(
    readonly x: number,
    readonly y: number,
  ) {}
}

/** Re-renders a Form with a fresh context value each time and records the context its field receives.
 * @param make - Builds the context for the n-th render.
 * @returns The distinct context objects the field received, in order. */
const observeContextSnapshots = async (make: (render: number) => object) => {
  const seen: object[] = [];
  const element = (renderNumber: number) => (
    <Form jsonSchema={nameSchema} context={make(renderNumber)}>
      <Form.Render path="/name">
        {({ context }) => {
          seen.push(context);
          return <span />;
        }}
      </Form.Render>
    </Form>
  );
  const view = render(element(0));
  await pass();
  view.rerender(element(1));
  await pass();
  view.rerender(element(2));
  await pass();
  return seen;
};

it.each([
  ['a fresh Date with the same time', () => ({ at: new Date(1000) })],
  ['a fresh Map with the same entries', () => ({ map: new Map([['a', 1]]) })],
  ['a fresh class instance with equal fields', () => ({ p: new Point(1, 2) })],
])(
  'Form compares context by content, so %s keeps the snapshot',
  async (_, make) => {
    const seen = await observeContextSnapshots(make);
    expect(new Set(seen).size).toBe(1);
  },
);

it.each([
  ['a fresh function', (n: number) => ({ fn: () => n })],
  ['a Date with another time', (n: number) => ({ at: new Date(1000 + n) })],
  ['a Map with other entries', (n: number) => ({ map: new Map([['a', n]]) })],
  [
    'a class instance with other fields',
    (n: number) => ({ p: new Point(n, 2) }),
  ],
])('Form treats %s as changed context', async (_, make) => {
  const seen = await observeContextSnapshots(make);
  expect(new Set(seen).size).toBeGreaterThan(1);
});
