import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeAll, expect, it } from 'vitest';

import {
  ErrorVisibility,
  Form,
  type FormHandle,
  FormProvider,
  ValidationMode,
  registerPlugin,
} from '@/schema-form';

import { createRenderValidator } from '../../__tests__/helpers/createRenderValidator';
import { settleValidation } from '../../__tests__/helpers/settleValidation';

beforeAll(() => {
  registerPlugin({ validator: createRenderValidator() });
});
afterEach(cleanup);

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 5, default: 'ab' },
    other: { type: 'string' },
  },
} as const;
const external = [{ dataPath: '/other', keyword: 'server', message: 'srv' }];

const paths = (h: FormHandle) =>
  h.getErrors().map((e) => `${e.dataPath}:${e.keyword}`).sort();

const mount = (mode: ValidationMode, viaProvider = false) => {
  const ref = createRef<FormHandle>();
  const tree = (m: ValidationMode) =>
    viaProvider ? (
      <FormProvider validationMode={m}>
        <Form ref={ref} jsonSchema={schema} errors={external as any} />
      </FormProvider>
    ) : (
      <Form
        ref={ref}
        jsonSchema={schema}
        validationMode={m}
        errors={external as any}
        errorVisibility={ErrorVisibility.Always}
      />
    );
  const view = render(tree(mode));
  return { ref, rerender: (m: ValidationMode) => view.rerender(tree(m)) };
};

it.for([false, true])(
  'OnChange -> None clears validator errors and keeps external ones (provider=%s)',
  async (viaProvider) => {
    const { ref, rerender } = mount(ValidationMode.OnChange, viaProvider);
    await settleValidation(() => ref.current?.node);
    expect(paths(ref.current!)).toEqual(['/name:minLength', '/other:server']);
    rerender(ValidationMode.None);
    await settleValidation(() => ref.current?.node);
    expect(paths(ref.current!)).toEqual(['/other:server']);
  },
);

it.for([false, true])(
  'None -> OnChange validates the current snapshot once without an edit (provider=%s)',
  async (viaProvider) => {
    const { ref, rerender } = mount(ValidationMode.None, viaProvider);
    await settleValidation(() => ref.current?.node);
    expect(paths(ref.current!)).toEqual(['/other:server']);
    rerender(ValidationMode.OnChange);
    await settleValidation(() => ref.current?.node);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 150));
    });
    expect(paths(ref.current!)).toEqual(['/name:minLength', '/other:server']);
  },
);

it.for([false, true])(
  'OnRequest -> None after validate() clears validator errors (provider=%s)',
  async (viaProvider) => {
    const { ref, rerender } = mount(ValidationMode.OnRequest, viaProvider);
    await act(async () => {
      await ref.current!.validate();
    });
    expect(paths(ref.current!)).toEqual(['/name:minLength', '/other:server']);
    rerender(ValidationMode.None);
    await settleValidation(() => ref.current?.node);
    expect(paths(ref.current!)).toEqual(['/other:server']);
    expect(await ref.current!.validate()).toEqual([]);
  },
);

it('OnChange -> OnRequest keeps errors and edits leave them in place', async () => {
  const { ref, rerender } = mount(ValidationMode.OnChange);
  await settleValidation(() => ref.current?.node);
  rerender(ValidationMode.OnRequest);
  await act(async () => {
    ref.current!.findNode('/name')!.setValue('abcdefg');
  });
  await settleValidation(() => ref.current?.node);
  expect(paths(ref.current!)).toEqual(['/name:minLength', '/other:server']);
  await act(async () => {
    await ref.current!.validate();
  });
  expect(paths(ref.current!)).toEqual(['/other:server']);
});
