import { StrictMode, createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle, ValidationMode } from '@/schema-form';

afterEach(cleanup);

const schema = {
  type: 'object',
  properties: { u: { type: ['string', 'number'] } },
} as const;

it.for([false, true])(
  'built-in union input follows a programmatic write after the user typed (StrictMode=%s)',
  async (strict) => {
    const ref = createRef<FormHandle>();
    const user = userEvent.setup();
    const form = (
      <Form
        ref={ref}
        jsonSchema={schema as any}
        validationMode={ValidationMode.None}
      />
    );
    const { container } = render(strict ? <StrictMode>{form}</StrictMode> : form);
    const input = () => container.querySelector('input[id="/u"]') as HTMLInputElement;
    await user.click(input());
    await user.type(input(), 'abc');
    await user.tab();
    expect(ref.current!.getValue()).toEqual({ u: 'abc' });
    await act(async () => {
      ref.current!.setValue({ u: 5 });
    });
    expect(ref.current!.getValue()).toEqual({ u: 5 });
    expect(input().value).toBe('5');
  },
);
