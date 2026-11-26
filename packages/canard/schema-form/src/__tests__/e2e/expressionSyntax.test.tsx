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

it.each([
  [
    'string literal text',
    {
      unit: { type: 'string', default: 'km /h' },
      out: {
        type: 'string',
        controls: { derived: '../unit === "km /h" ? "a @ b" : "other"' },
      },
    },
    ['/unit', 'mph'],
    ['a @ b', 'other'],
  ],
  [
    'regular expression literal with an escaped slash',
    {
      speed: { type: 'string', default: '90 km/h' },
      out: {
        type: 'boolean',
        controls: { derived: '/km\\/h/.test(../speed)' },
      },
    },
    ['/speed', '90'],
    [true, false],
  ],
  [
    'division after a parenthesized value',
    {
      price: { type: 'number', default: 250 },
      out: { type: 'number', controls: { derived: '(../price) / 100' } },
    },
    ['/price', 500],
    [2.5, 5],
  ],
  [
    'RegExp constructor',
    {
      name: { type: 'string', default: 'food' },
      out: {
        type: 'boolean',
        controls: { derived: "new RegExp('foo').test(../name)" },
      },
    },
    ['/name', 'bar'],
    [true, false],
  ],
] as const)(
  'reads only the field reference past a %s',
  (_label, properties, [path, next], [loaded, updated]) => {
    const ref = createRef<FormHandle>();
    render(
      <Form
        ref={ref}
        validationMode={ValidationMode.None}
        jsonSchema={{ type: 'object', properties }}
      />,
    );
    expect(ref.current!.findNode('/out')!.value).toBe(loaded);
    act(() => ref.current!.findNode(path)!.setValue(next));
    expect(ref.current!.findNode('/out')!.value).toBe(updated);
  },
);

it('reads a regular expression literal that is also an absolute path as that path', () => {
  const onError = vi.fn();
  vi.stubGlobal('reportError', vi.fn());
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      onError={onError}
      validationMode={ValidationMode.None}
      jsonSchema={{
        type: 'object',
        properties: {
          name: { type: 'string', default: 'food' },
          out: {
            type: 'boolean',
            controls: { derived: '/foo/.test(../name)' },
          },
        },
      }}
    />,
  );
  expect(onError).toHaveBeenCalledWith(
    expect.objectContaining({ code: FormErrorCode.ExpressionThrew }),
  );
  expect(ref.current!.findNode('/out')!.value).toBeUndefined();
});

it('rejects a trailing line comment on an active control', () => {
  const onError = vi.fn();
  vi.stubGlobal('reportError', vi.fn());
  render(
    <Form
      onError={onError}
      validationMode={ValidationMode.None}
      jsonSchema={{
        type: 'object',
        properties: {
          a: { type: 'string', controls: { active: 'true // tail' } },
        },
      }}
    />,
  );
  expect(onError).toHaveBeenCalledWith(
    expect.objectContaining({ code: FormErrorCode.CreateDynamicFunction }),
  );
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
