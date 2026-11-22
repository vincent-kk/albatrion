import { createRef } from 'react';

import { act, cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import {
  Form,
  type FormHandle,
  type JSONSchema,
  ValidationMode,
} from '../../index';

afterEach(cleanup);

it.each([
  [ValidationMode.OnRequest, true],
  [ValidationMode.OnChange, true],
  [ValidationMode.OnChange, false],
] as const)(
  'publishes the verdict for mode %s after a reentrant write from checked=%s',
  async (validationMode, checked) => {
    const ref = createRef<FormHandle>();
    const issues = [{ dataPath: '/name', keyword: 'name-check' }];
    const validatorFactory = {
      compile: () => async () => {
        await Promise.resolve();
        ref.current?.findNode('/checked')?.setValue(true);
        return issues;
      },
      compileGuard: () => () => true,
    };
    render(
      <Form
        ref={ref}
        jsonSchema={{
          type: 'object',
          properties: {
            name: { type: 'string' },
            checked: { type: 'boolean' },
          },
        }}
        defaultValue={{ name: 'test', checked }}
        validationMode={validationMode}
        validatorFactory={validatorFactory}
      />,
    );
    if (validationMode === ValidationMode.OnRequest)
      await act(() => ref.current!.validate());
    await waitFor(() => {
      expect(ref.current!.getValue()).toEqual({ name: 'test', checked: true });
      expect(
        ref.current!.findNode('/name')!.errors.map((issue) => issue.keyword),
      ).toEqual(['name-check']);
    });
  },
);

it('keeps all issues routed to a terminal collection in validator order', async () => {
  const issues = ['/rows/0', '/rows/1', '/rows/2'].map((dataPath) => ({
    dataPath,
    keyword: 'row-validation',
    message: dataPath,
  }));
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'object',
        properties: {
          rows: {
            type: 'array',
            options: { terminal: true },
            items: { type: 'string' },
          },
        },
      }}
      defaultValue={{ rows: ['first', 'second', 'third'] }}
      validationMode={ValidationMode.OnRequest}
      validatorFactory={{
        compile: () => () => issues,
        compileGuard: () => () => true,
      }}
    />,
  );
  await act(() => ref.current!.validate());
  expect(
    ref.current!.findNode('/rows')!.errors.map((issue) => issue.dataPath),
  ).toEqual(issues.map((issue) => issue.dataPath));
});

it.each(['/start', '/period/start', '/period/../start', '/period'])(
  'validation at %s publishes to physical members only',
  async (path) => {
    const jsonSchema: JSONSchema = {
      type: 'object',
      properties: {
        start: { type: 'string' },
        end: { type: 'string' },
        note: { type: 'string' },
      },
      options: { virtual: { period: { fields: ['start', 'end'] } } },
    };
    const ref = createRef<FormHandle>();
    render(
      <Form
        ref={ref}
        jsonSchema={jsonSchema}
        defaultValue={{ start: 'bad', end: 'ok', note: 'bad' }}
        validationMode={ValidationMode.OnRequest}
        validatorFactory={{
          compile: () => () => [
            { dataPath: '/start', keyword: 'invalid' },
            { dataPath: '/note', keyword: 'invalid' },
          ],
          compileGuard: () => () => true,
        }}
      />,
    );
    await act(() => ref.current!.findNode(path)!.validate());
    expect(
      ref.current!.findNode('/start')!.errors.map((issue) => issue.keyword),
    ).toEqual(['invalid']);
    expect(ref.current!.findNode('/note')!.errors).toEqual([]);
  },
);

it('keeps rescheduling a validator that changes its input without publishing stale issues', async () => {
  const ref = createRef<FormHandle>();
  const issues = [{ dataPath: '/name', keyword: 'old-input' }];
  let runs = 0;
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'object',
        properties: { name: { type: 'string' }, counter: { type: 'number' } },
      }}
      defaultValue={{ name: 'test', counter: 0 }}
      validationMode={ValidationMode.OnChange}
      validatorFactory={{
        compile: () => async () => {
          await Promise.resolve();
          runs++;
          ref.current?.findNode('/counter')?.setValue(runs);
          return issues;
        },
        compileGuard: () => () => true,
      }}
    />,
  );
  await waitFor(() => expect(runs).toBeGreaterThanOrEqual(3));
  expect(ref.current!.findNode('/name')!.errors).toEqual([]);
  view.unmount();
});
