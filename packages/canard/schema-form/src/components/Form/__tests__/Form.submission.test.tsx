import { createRef } from 'react';

import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
} from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form } from '../Form';
import type { FormHandle } from '../type';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('LANDING-095 ERROR-032 rejects degraded imperative submission without delivering a value', async () => {
  const ref = createRef<FormHandle>();
  const submit = vi.fn();
  render(
    <Form ref={ref} jsonSchema={{ type: 'string' }} onSubmit={submit}>
      <span />
    </Form>,
  );
  vi.spyOn(ref.current!.node!, 'diagnostics', 'get').mockReturnValue({
    status: 'degraded',
    cause: 'budget',
  } as never);
  await expect(ref.current!.submit()).rejects.toMatchObject({
    code: 'SCHEMA_FORM_ERROR.SUBMIT_WHILE_DEGRADED',
  });
  expect(submit).not.toHaveBeenCalled();
});

it('ERROR-110 ERROR-117 reports a native submit rejection and sends the same error to the sink', async () => {
  const ref = createRef<FormHandle>();
  const report = vi.fn();
  const sink = vi.fn();
  vi.stubGlobal('reportError', sink);
  const view = render(
    <Form ref={ref} jsonSchema={{ type: 'string' }} onError={report}>
      <span />
    </Form>,
  );
  report.mockClear();
  const error = new Error('validation unavailable');
  vi.spyOn(ref.current!.node!, 'validate').mockRejectedValue(error);
  fireEvent.submit(view.container.querySelector('form')!);
  await waitFor(() => expect(report).toHaveBeenCalledOnce());
  expect(report.mock.calls[0][0].error).toBe(error);
  expect(sink).toHaveBeenCalledWith(error);
});

it('WRITE-043 WRITE-045 retains an equivalent authored schema and reapplies external errors on reset', () => {
  const ref = createRef<FormHandle>();
  const errors = [{ keyword: 'external', message: 'server', dataPath: '' }];
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      defaultValue="a"
      errors={errors}
    >
      <span />
    </Form>,
  );
  const node = ref.current!.node!;
  view.rerender(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      defaultValue="b"
      errors={errors}
    >
      <span />
    </Form>,
  );
  act(() => ref.current!.reset());
  expect(ref.current!.node).toBe(node);
  expect(node.value).toBe('b');
  expect(node.errors).toEqual(errors);
});
