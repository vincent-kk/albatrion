import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import {
  Form,
  type FormHandle,
  SetValueOption,
  ValidationMode,
} from '../../index';

afterEach(cleanup);

it('a Form batch keeps an inactive address value when the next Merge omits its key', () => {
  const schema = {
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      box: {
        type: 'object',
        properties: {
          held: {
            type: 'object',
            controls: { active: '/open === true' },
            properties: {
              a: { type: 'string' },
              b: { type: 'string' },
            },
          },
        },
      },
    },
  } as const;
  const ref = createRef<FormHandle<typeof schema>>();
  render(
    <Form
      ref={ref}
      jsonSchema={schema}
      defaultValue={{ open: false }}
      validationMode={ValidationMode.None}
    />,
  );
  act(() => {
    const root = ref.current!.node!;
    root.batch(() => {
      root.find('/box')!.setValue({ held: { a: 'user entry' } });
      root.setValue(
        { box: { held: { b: 'later entry' } } },
        SetValueOption.Merge,
      );
    });
    root.find('/open')!.setValue(true);
  });
  expect(ref.current!.getValue()).toEqual({
    open: true,
    box: { held: { a: 'user entry', b: 'later entry' } },
  });
});
