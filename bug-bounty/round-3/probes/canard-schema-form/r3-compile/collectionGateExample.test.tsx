import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Form, type FormHandle, type JSONSchema, ValidationMode } from '../../index';

afterEach(cleanup);

/** The gate exactly as troubleshooting.md and expressions.md recommend it. */
const schemaWith = (active: string): JSONSchema => ({
  type: 'object',
  properties: {
    items: { type: 'array', items: { type: 'string' } },
    note: { type: 'string', default: 'n', controls: { active } },
  },
});

const scenario = async (active: string, defaultValue: any, step?: (handle: FormHandle) => void) => {
  const handle = createRef<FormHandle>();
  const errors: string[] = [];
  render(
    <Form
      ref={handle}
      validationMode={ValidationMode.None}
      jsonSchema={schemaWith(active)}
      defaultValue={defaultValue}
      onError={(record: any) => errors.push(record.code)}
    />,
  );
  let thrown: unknown;
  if (step)
    await act(async () => {
      try {
        step(handle.current!);
      } catch (error) {
        thrown = (error as any)?.code ?? String(error);
      }
    });
  let submitted: unknown;
  let rejected: unknown;
  await act(async () => {
    try {
      submitted = await handle.current!.submit();
    } catch (error) {
      rejected = (error as any)?.code ?? String(error);
    }
  });
  return { thrown, errors, value: handle.current!.getValue(), submitted, rejected };
};

describe('documented collection gate (../items).length > 0', () => {
  it('removing the last item neither throws nor blocks submission', async () => {
    const result = await scenario('(../items).length > 0', { items: ['a'] }, (handle) =>
      (handle.findNode('/items') as any).remove(0),
    );
    expect(result).toMatchObject({ thrown: undefined, rejected: undefined, value: {} });
  });

  it('a form loaded with an empty list submits', async () => {
    const result = await scenario('(../items).length > 0', { items: [] });
    expect(result).toMatchObject({ thrown: undefined, rejected: undefined, value: {} });
  });

  it('control: the optional-chaining spelling removes the last item cleanly', async () => {
    const result = await scenario('(../items)?.length > 0', { items: ['a'] }, (handle) =>
      (handle.findNode('/items') as any).remove(0),
    );
    expect(result).toMatchObject({ thrown: undefined, rejected: undefined, value: {} });
  });
});
