import { createRef, useState } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';

afterEach(cleanup);

it('WRITE-046 ERROR-084 updates the handle even when the replacement load throws after settlement', () => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form ref={ref} jsonSchema={{ type: 'string' }} onError={() => {}}>
      <span />
    </Form>,
  );
  const previous = ref.current!.node;
  view.rerender(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'number',
        controls: { derived: '(() => { throw new Error("reset derive") })()' },
      }}
      onError={() => {}}
    >
      <span />
    </Form>,
  );
  const caught = vi.fn();
  act(() => {
    try {
      ref.current!.reset();
    } catch (error) {
      caught(error);
    }
  });
  expect(caught).toHaveBeenCalledOnce();
  expect(ref.current!.node).not.toBe(previous);
  expect(ref.current!.node!.diagnostics.status).toBe('degraded');
});

it('WRITE-043 WRITE-046 rechecks committed props after a reset in the same event', () => {
  const ref = createRef<FormHandle>();
  const Host = () => {
    const [value, setValue] = useState('first');
    return (
      <>
        <button
          onClick={() => {
            setValue('second');
            ref.current!.reset();
          }}
        >
          reset
        </button>
        <Form ref={ref} jsonSchema={{ type: 'string' }} defaultValue={value}>
          <span />
        </Form>
      </>
    );
  };
  const view = render(<Host />);
  const root = ref.current!.node;
  fireEvent.click(view.getByText('reset'));
  expect(ref.current!.node).toBe(root);
  expect(ref.current!.getValue()).toBe('second');
});

it('LANDING-095 REACT-002 REACT-003 preserves presentation identities and clones incoming values', () => {
  const ref = createRef<FormHandle>();
  const icon = <span>icon</span>;
  const Input = () => <input />;
  const schema = {
    type: 'object',
    presentation: { FormTypeInput: Input, FormTypeInputProps: { icon } },
  } as const;
  const source = { name: 'before' };
  render(<Form ref={ref} jsonSchema={schema} defaultValue={source} />);
  source.name = 'after';
  expect(ref.current!.getValue()).toEqual({ name: 'before' });
  expect(ref.current!.node!.strategy).toBe('terminal');
  expect(
    (ref.current!.node!.jsonSchema as typeof schema).presentation
      .FormTypeInputProps.icon,
  ).toBe(icon);
  act(() => ref.current!.reset());
  expect(ref.current!.getValue()).toEqual({ name: 'after' });
});
