import { StrictMode, createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';
import { ValidationMode } from '@/schema-form/core';
import type { FormTypeInputProps } from '@/schema-form/types';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('ERROR-113 guards an initial field boundary report under StrictMode', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const failure = new Error('initial field render');
  let root: FormHandle['node'];
  let refusal: unknown;
  const Input = (props: FormTypeInputProps) => {
    root = props.node.rootNode;
    throw failure;
  };
  render(<StrictMode><Form jsonSchema={{ type: 'string', presentation: { FormTypeInput: Input } }}
    defaultValue="kept" validationMode={ValidationMode.None} onError={(record) => {
      if (record.error !== failure) return;
      try { root!.setValue('forbidden'); }
      catch (error) { refusal = error; }
    }} /></StrictMode>);
  expect(refusal).toMatchObject({ code: 'SCHEMA_FORM_ERROR.WRITE_IN_OBSERVER' });
  expect(root!.value).toBe('kept');
});

it('ERROR-113 rejects writes in the field boundary reporter after commit', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const ref = createRef<FormHandle>();
  const failure = new Error('field render');
  let refusal: unknown;
  const Input = ({ value }: FormTypeInputProps) => {
    if (value === 'throw') throw failure;
    return <input />;
  };
  const view = render(<Form ref={ref} jsonSchema={{ type: 'object', properties: {
    field: { type: 'string', presentation: { FormTypeInput: Input } },
  } }} validationMode={ValidationMode.None} onError={(record) => {
    if (record.error !== failure) return;
    try { ref.current!.findNode('/field')!.setValue('forbidden'); }
    catch (error) { refusal = error; }
  }} />);
  act(() => ref.current!.findNode('/field')!.setValue('throw'));
  expect(refusal).toMatchObject({ code: 'SCHEMA_FORM_ERROR.WRITE_IN_OBSERVER' });
  expect(ref.current!.findNode('/field')!.value).toBe('throw');
  expect(view.container.textContent).toContain('An unexpected error');
});

it('ERROR-113 rejects writes in the root boundary reporter while retaining its root', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const ref = createRef<FormHandle>();
  const schema = { type: 'string' } as const;
  const failure = new Error('root render');
  let refusal: unknown;
  let root: FormHandle['node'];
  const onError = (record: { error?: unknown }) => {
    if (record.error !== failure) return;
    try { root!.setValue('forbidden'); }
    catch (error) { refusal = error; }
  };
  const Broken = () => { throw failure; };
  const view = render(<Form ref={ref} jsonSchema={schema} defaultValue="kept"
    validationMode={ValidationMode.None} onError={onError}><span /></Form>);
  root = ref.current!.node;
  view.rerender(<Form ref={ref} jsonSchema={schema} defaultValue="kept"
    validationMode={ValidationMode.None} onError={onError}><Broken /></Form>);
  expect(refusal).toMatchObject({ code: 'SCHEMA_FORM_ERROR.WRITE_IN_OBSERVER' });
  expect(root!.value).toBe('kept');
});

it('ERROR-113 scopes reports to a replacement root after schema reset', () => {
  const ref = createRef<FormHandle>();
  let refusal: unknown;
  let root: FormHandle['node'];
  const Input = (props: FormTypeInputProps) => {
    root = props.node;
    return <input />;
  };
  const onError = () => {
    try { root!.setValue(3); }
    catch (error) { refusal = error; }
  };
  const view = render(<Form ref={ref} jsonSchema={{ type: 'string' }}
    validationMode={ValidationMode.None} onError={onError} />);
  view.rerender(<Form ref={ref} jsonSchema={{ type: 'number', presentation: { FormTypeInput: Input } }}
    defaultValue={3} validationMode={ValidationMode.None} onError={onError} />);
  act(() => ref.current!.reset());
  act(() => root!.setValue('invalid'));
  expect(ref.current!.node!.value).toBe('invalid');
  expect(refusal).toMatchObject({ code: 'SCHEMA_FORM_ERROR.WRITE_IN_OBSERVER' });
});
