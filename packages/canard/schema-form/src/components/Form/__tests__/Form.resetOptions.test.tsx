import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { SetValueOption, ValidationMode } from '@/schema-form/core';

import { Form } from '../Form';
import type { FormHandle } from '../type';

afterEach(cleanup);

it.each([false, true])('WRITE-015 LANDING-039 reset load options override the Form default (replacement: %s)', (replacement) => {
  const ref = createRef<FormHandle>();
  const schema = { type: 'object', properties: { filled: { type: 'string', default: 'automatic' } } } as const;
  const nextSchema = { ...schema, title: 'replacement' };
  const view = render(<Form ref={ref} jsonSchema={schema} defaultValue={{}} validationMode={ValidationMode.None}><span /></Form>);
  const original = ref.current!.node;
  view.rerender(<Form ref={ref} jsonSchema={replacement ? nextSchema : schema} defaultValue={{}} validationMode={ValidationMode.None}><span /></Form>);
  act(() => ref.current!.reset(SetValueOption.DisableAutomaticWrites));
  expect(ref.current!.getValue()).toEqual({});
  expect(ref.current!.node === original).toBe(!replacement);
  view.rerender(<Form ref={ref} jsonSchema={schema} defaultValue={{}} validationMode={ValidationMode.None}><span /></Form>);
  act(() => ref.current!.reset());
  expect(ref.current!.getValue()).toEqual({ filled: 'automatic' });

  view.rerender(<Form ref={ref} jsonSchema={replacement ? nextSchema : schema} defaultValue={{}} disableAutomaticWrites validationMode={ValidationMode.None}><span /></Form>);
  act(() => ref.current!.reset());
  expect(ref.current!.getValue()).toEqual({});
  view.rerender(<Form ref={ref} jsonSchema={schema} defaultValue={{}} disableAutomaticWrites validationMode={ValidationMode.None}><span /></Form>);
  act(() => ref.current!.reset(SetValueOption.EnableAutomaticWrites));
  expect(ref.current!.getValue()).toEqual({ filled: 'automatic' });

  view.rerender(<Form ref={ref} jsonSchema={replacement ? nextSchema : schema} defaultValue={{}} validationMode={ValidationMode.None}><span /></Form>);
  act(() => ref.current!.reset(SetValueOption.DisableAutomaticWrites | SetValueOption.EnableAutomaticWrites));
  expect(ref.current!.getValue()).toEqual({});
  view.rerender(<Form ref={ref} jsonSchema={schema} defaultValue={{}} validationMode={ValidationMode.None}><span /></Form>);
  act(() => ref.current!.reset((SetValueOption.Overwrite | SetValueOption.Merge) as Parameters<FormHandle['reset']>[0]));
  expect(ref.current!.getValue()).toEqual({ filled: 'automatic' });
});
