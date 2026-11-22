import { useState } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import {
  type FieldInputProps,
  Form,
  type FormHandle,
  ValidationMode,
} from '../../index';

afterEach(cleanup);

const schemas = {
  array: {
    type: 'object',
    properties: { list: { type: 'array', items: { type: 'string' } } },
  },
  virtual: {
    type: 'object',
    properties: { start: { type: 'string' }, end: { type: 'string' } },
    options: { virtual: { list: { fields: ['start', 'end'] } } },
  },
} as const;
const defaults = {
  array: { list: ['a', 'b'] },
  virtual: { start: 'a', end: 'b' },
};

/** Mount count and displayed default of one whole-value input after one write. */
const observeWrite = async (
  kind: keyof typeof schemas,
  relay: 'same' | 'copy' | 'none',
  write: 'own' | 'external',
) => {
  let mounts = 0;
  const Tuple = ({ defaultValue, onChange }: FieldInputProps<string[]>) => {
    useState(() => ++mounts);
    return (
      <button type="button" onClick={() => onChange(['x', 'y'])}>
        {JSON.stringify(defaultValue)}
      </button>
    );
  };
  const ref = { current: null as FormHandle | null };
  const view = render(
    <Form
      ref={(handle) => {
        ref.current = handle;
      }}
      jsonSchema={schemas[kind]}
      defaultValue={defaults[kind]}
      validationMode={ValidationMode.None}
      fieldInputMap={{ '/list': Tuple }}
    >
      <Form.Render path="/list">
        {({ Input, node }) => (
          <Input
            onChange={
              relay === 'none'
                ? undefined
                : (next: unknown) =>
                    node?.setValue(
                      relay === 'copy' && Array.isArray(next)
                        ? [...next]
                        : next,
                    )
            }
          />
        )}
      </Form.Render>
    </Form>,
  );
  await act(async () => {
    if (write === 'own') fireEvent.click(view.getByRole('button'));
    else ref.current!.findNode('/list')!.setValue(['p', 'q']);
  });
  return {
    mounts,
    shown: view.getByRole('button').textContent,
    value: ref.current!.findNode('/list')!.value,
  };
};

describe('a virtual group input relays its own tuple like a branch array', () => {
  it.each(['same', 'copy', 'none'] as const)(
    'keeps the input mounted after its own write (relay=%s)',
    async (relay) => {
      const array = await observeWrite('array', relay, 'own');
      cleanup();
      const virtual = await observeWrite('virtual', relay, 'own');
      expect(virtual).toEqual(array);
      expect(virtual).toEqual({
        mounts: 1,
        shown: '["a","b"]',
        value: ['x', 'y'],
      });
    },
  );

  it.each(['same', 'copy'] as const)(
    'refreshes the input after a different tuple from outside (relay=%s)',
    async (relay) => {
      const array = await observeWrite('array', relay, 'external');
      cleanup();
      const virtual = await observeWrite('virtual', relay, 'external');
      expect(virtual).toEqual(array);
      expect(virtual.shown).toBe('["p","q"]');
      expect(virtual.value).toEqual(['p', 'q']);
    },
  );
});
