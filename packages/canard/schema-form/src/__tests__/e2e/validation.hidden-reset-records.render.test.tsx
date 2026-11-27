import * as React from 'react';
import { type ReactNode, Suspense, createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, inject, it, vi } from 'vitest';

import { Form, type FormHandle, ValidationMode } from '@/schema-form';

import { settleValidation } from '../helpers/settleValidation';

const pending = new Promise<void>(() => undefined);
const Gate = ({ hidden }: { hidden: boolean }) => {
  if (hidden) throw pending;
  return null;
};
const wrap = (form: ReactNode, hidden: boolean) =>
  inject('reactMajor') === '19' ? (
    <React.Activity mode={hidden ? 'hidden' : 'visible'}>{form}</React.Activity>
  ) : (
    <Suspense fallback="hidden">
      {form}
      <Gate hidden={hidden} />
    </Suspense>
  );
afterEach(cleanup);
it('IR-7 T3 hidden writes and reset each deliver their own warnings at chain end', async () => {
  const ref = createRef<FormHandle>();
  const onError = vi.fn();
  const makeForm = (value: any) => (
    <Form
      ref={ref}
      jsonSchema={{ type: 'number' }}
      defaultValue={value}
      validationMode={ValidationMode.None}
      onError={onError}
    />
  );
  const view = render(wrap(makeForm(0), false));
  await settleValidation(() => ref.current?.node);
  const handle = ref.current!;
  const form = makeForm('bad-next');
  view.rerender(wrap(form, false));
  view.rerender(wrap(form, true));
  act(() => handle.setValue('bad-old'));
  expect(onError).toHaveBeenCalledTimes(1);
  act(() => handle.rebuild());
  expect(onError).toHaveBeenCalledTimes(2);
  expect(onError.mock.calls.map(([record]) => record.details.source)).toEqual([
    'callerReplace',
    'load',
  ]);
  expect(
    onError.mock.calls.map(
      (call) => (call as unknown as [{ code: string }])[0].code,
    ),
  ).toEqual(['SCHEMA_FORM_WARNING.MISFIT', 'SCHEMA_FORM_WARNING.MISFIT']);
  view.rerender(wrap(form, false));
  expect(onError).toHaveBeenCalledTimes(2);
});
