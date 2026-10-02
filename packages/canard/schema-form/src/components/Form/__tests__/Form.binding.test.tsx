import { StrictMode, createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Form } from '../Form';
import type { FormHandle } from '../type';

afterEach(cleanup);

describe('Form engine binding', () => {
  it('REACT-007 LANDING-075 does not emit a mount change in StrictMode', () => {
    const onChange = vi.fn();
    const ref = createRef<FormHandle>();
    render(
      <StrictMode>
        <Form
          ref={ref}
          jsonSchema={{ type: 'string' }}
          defaultValue="first"
          onChange={onChange}
        >
          <span />
        </Form>
      </StrictMode>,
    );
    expect(ref.current?.getValue()).toBe('first');
    expect(onChange).not.toHaveBeenCalled();
    act(() => ref.current?.setValue('next'));
    expect(onChange).toHaveBeenCalledExactlyOnceWith('next');
  });

  it('SURFACE-059 EVENT-073 exposes exactly eighteen handle members and optional-path commands', () => {
    const ref = createRef<FormHandle>();
    render(
      <Form ref={ref} jsonSchema={{ type: 'string' }}>
        <span />
      </Form>,
    );
    expect(Object.keys(ref.current!).sort()).toEqual(
      [
        'node',
        'focus',
        'select',
        'refresh',
        'remount',
        'reset',
        'findNode',
        'findNodes',
        'getState',
        'setState',
        'clearState',
        'getValue',
        'setValue',
        'getErrors',
        'getAttachedFilesMap',
        'validate',
        'showError',
        'submit',
      ].sort(),
    );
    const request = vi.spyOn(ref.current!.node!, 'request');
    act(() => {
      ref.current!.focus();
      ref.current!.select();
      ref.current!.refresh();
      ref.current!.remount();
    });
    expect(request).toHaveBeenCalledTimes(4);
    act(() => ref.current!.focus('/missing'));
    expect(request).toHaveBeenCalledTimes(4);
  });

  it('WRITE-042 WRITE-043 WRITE-045 resets the same tree synchronously and clears interaction', () => {
    const ref = createRef<FormHandle>();
    const schema = { type: 'string' } as const;
    render(
      <Form ref={ref} jsonSchema={schema} defaultValue="initial">
        <span />
      </Form>,
    );
    const node = ref.current!.node;
    act(() => {
      ref.current!.setValue('edited');
      ref.current!.setState({ dirty: true, touched: true });
    });
    act(() => {
      ref.current!.reset();
      expect(ref.current!.node).toBe(node);
      expect(ref.current!.getValue()).toBe('initial');
      expect(ref.current!.getState()).toEqual({});
    });
  });

  it('WRITE-043 WRITE-046 switches the handle inside reset after a committed schema change', () => {
    const ref = createRef<FormHandle>();
    const view = render(
      <Form ref={ref} jsonSchema={{ type: 'string' }} defaultValue="first">
        <span />
      </Form>,
    );
    const previous = ref.current!.node!;
    view.rerender(
      <Form ref={ref} jsonSchema={{ type: 'number' }} defaultValue={7}>
        <span />
      </Form>,
    );
    expect(ref.current!.node).toBe(previous);
    act(() => {
      ref.current!.reset();
      expect(ref.current!.node).not.toBe(previous);
      expect(ref.current!.getValue()).toBe(7);
      ref.current!.setValue(8);
      expect(ref.current!.getValue()).toBe(8);
    });
    expect(() => previous.setValue('late')).toThrow();
  });

  it('LANDING-067 submits outputValue and retains raw array positions', async () => {
    const ref = createRef<FormHandle>();
    const submit = vi.fn();
    render(
      <Form
        ref={ref}
        jsonSchema={{
          type: 'array',
          items: { type: 'string' },
          options: { omitTrailing: true },
        }}
        defaultValue={['a', undefined]}
        onSubmit={submit}
      >
        <span />
      </Form>,
    );
    expect(ref.current!.getValue()).toEqual(['a']);
    expect(ref.current!.node!.children).toHaveLength(2);
    await act(async () => {
      await ref.current!.submit();
    });
    expect(submit).toHaveBeenCalledExactlyOnceWith(['a']);
  });

  it('ERROR-026 ERROR-112 reports a root render failure once with componentStack', () => {
    const error = new Error('render failure');
    const onError = vi.fn();
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const Broken = () => {
      throw error;
    };
    render(
      <StrictMode>
        <Form jsonSchema={{ type: 'string' }} onError={onError}>
          <Broken />
        </Form>
      </StrictMode>,
    );
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toMatchObject({
      code: 'SCHEMA_FORM_ERROR.RENDER_FAILED',
      error,
      componentStack: expect.any(String),
    });
    consoleError.mockRestore();
  });
});
