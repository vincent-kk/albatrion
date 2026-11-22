import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  Form,
  FormErrorCode,
  type FormHandle,
  ValidationMode,
} from '../../index';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it.each([
  ['"../first" + ../last', '../firstL'],
  ['`../first ${../first} ${../last}`', '../first F L'],
  ['/* " ../first */ ../last', 'L'],
  ['(/["]/.test(../quote) ? ../last : ../first)', 'L'],
  ['{ return /a/ + 0 }', '/a/0'],
  ['/a/g', 'path'],
  ['// opening comment\n3', undefined],
] as const)(
  'evaluates derived expression %s through Form',
  (derived, expected) => {
    const ref = createRef<FormHandle>();
    render(
      <Form
        ref={ref}
        validationMode={ValidationMode.None}
        jsonSchema={{
          type: 'object',
          properties: {
            first: { type: 'string', default: 'F' },
            last: { type: 'string', default: 'L' },
            quote: { type: 'string', default: '"' },
            a: {
              type: 'object',
              properties: { g: { type: 'string', default: 'path' } },
            },
            out: { type: 'string', controls: { derived } },
          },
        }}
      />,
    );
    expect(ref.current!.findNode('/out')!.value).toBe(expected);
  },
);

it('keeps leading decimal division and updates only for the real dependency', () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      validationMode={ValidationMode.None}
      jsonSchema={{
        type: 'object',
        properties: {
          a: { type: 'number', default: 4 },
          out: { type: 'number', controls: { derived: '.5/2 + ../a' } },
        },
      }}
    />,
  );
  expect(ref.current!.findNode('/out')!.value).toBe(4.25);
  act(() => ref.current!.findNode('/a')!.setValue(2));
  expect(ref.current!.findNode('/out')!.value).toBe(2.25);
});

it('rejects a trailing line comment that consumes the boolean wrapper', () => {
  const onError = vi.fn();
  vi.stubGlobal('reportError', vi.fn());
  render(
    <Form
      onError={onError}
      validationMode={ValidationMode.None}
      jsonSchema={{ type: 'string', controls: { visible: 'true // tail' } }}
    />,
  );
  expect(onError).toHaveBeenCalledWith(
    expect.objectContaining({ code: FormErrorCode.CreateDynamicFunction }),
  );
});
