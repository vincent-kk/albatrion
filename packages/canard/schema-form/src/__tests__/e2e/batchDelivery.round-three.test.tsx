import { createRef } from 'react';

import { act, cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  FieldNodeEventType,
  Form,
  type FormHandle,
  ValidationMode,
  isArrayNode,
} from '../../index';

afterEach(cleanup);

it('round-3: array batch publishes one final subscription, onChange and onValidate', async () => {
  const handle = createRef<FormHandle>();
  const onChange = vi.fn();
  const onValidate = vi.fn();
  render(
    <Form
      ref={handle}
      jsonSchema={{
        type: 'object',
        properties: { list: { type: 'array', items: { type: 'string' } } },
      }}
      defaultValue={{ list: ['a', 'b', 'c'] }}
      validationMode={ValidationMode.OnChange}
      validatorFactory={{
        compile: () => (value) => [
          {
            dataPath: '/list',
            keyword: 'rows',
            message: JSON.stringify(value),
          },
        ],
        compileGuard: () => () => true,
      }}
      onChange={onChange}
      onValidate={onValidate}
    />,
  );
  await waitFor(() => expect(onValidate).toHaveBeenCalledTimes(1));
  onValidate.mockClear();
  onChange.mockClear();
  const list = handle.current!.findNode('/list');
  if (!isArrayNode(list)) throw new Error('Expected list');
  const values: unknown[] = [];
  handle.current!.node!.subscribe((event) => {
    if (event.type & FieldNodeEventType.UpdateValue)
      values.push(handle.current!.getValue());
  });
  await act(() =>
    handle.current!.node!.batch(() => {
      list.remove(0);
      list.insert(0, 'new');
      list.push('d');
      expect(values).toEqual([]);
      expect(onChange).not.toHaveBeenCalled();
      expect(onValidate).not.toHaveBeenCalled();
    }),
  );
  expect(values).toEqual([{ list: ['new', 'b', 'c', 'd'] }]);
  expect(onChange).toHaveBeenCalledTimes(1);
  await waitFor(() => expect(onValidate).toHaveBeenCalledTimes(1));
});
