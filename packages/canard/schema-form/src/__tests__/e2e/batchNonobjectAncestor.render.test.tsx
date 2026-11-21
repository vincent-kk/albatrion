import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle, ValidationMode } from '../../index';

afterEach(cleanup);

it.each(['batch', 'nested batch', 'sequential'] as const)(
  'a nullable object survives an identity child updater in %s',
  (mode) => {
    const ref = createRef<FormHandle>();
    render(
      <Form
        ref={ref}
        jsonSchema={{
          type: 'object',
          properties: {
            o: {
              type: ['object', 'null'],
              properties: { n: { type: 'number' } },
            },
          },
        }}
        defaultValue={{ o: { n: 1 } }}
        validationMode={ValidationMode.None}
      />,
    );
    let seen: unknown;
    act(() => {
      const root = ref.current!.node;
      const o = ref.current!.findNode('/o')!;
      const n = ref.current!.findNode('/o/n')!;
      const calls = () => {
        o.setValue(null);
        n.setValue((value: unknown) => {
          seen = value;
          return value;
        });
      };
      if (mode === 'sequential') calls();
      else if (mode === 'batch') root.batch(calls);
      else root.batch(() => root.batch(calls));
    });
    expect(seen).toBeUndefined();
    expect(ref.current!.getValue()).toEqual({ o: null });
  },
);

it.each(['identity updater', 'empty string'] as const)(
  'an unrelated batch write and %s keep an initially null object',
  (operation) => {
    const ref = createRef<FormHandle>();
    render(
      <Form
        ref={ref}
        jsonSchema={{
          type: 'object',
          properties: {
            other: { type: 'boolean' },
            o: {
              type: ['object', 'null'],
              properties: { n: { type: 'string' } },
            },
          },
        }}
        defaultValue={{ other: false, o: null }}
        validationMode={ValidationMode.None}
      />,
    );
    act(() =>
      ref.current!.node.batch(() => {
        ref.current!.findNode('/other')!.setValue(true);
        const n = ref.current!.findNode('/o/n')!;
        if (operation === 'empty string') n.setValue('');
        else n.setValue((v: unknown) => v);
      }),
    );
    expect(ref.current!.getValue()).toEqual({ other: true, o: null });
  },
);
