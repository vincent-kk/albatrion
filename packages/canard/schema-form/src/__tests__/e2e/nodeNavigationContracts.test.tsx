import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import {
  type FieldInputProps,
  Form,
  type FormHandle,
  ValidationMode,
} from '../../index';

afterEach(cleanup);

it('findNodes lists each alias match once and keeps the first match order', () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      validationMode={ValidationMode.None}
      jsonSchema={{
        type: 'object',
        properties: { start: { type: 'string' }, end: { type: 'string' } },
        options: { virtual: { period: { fields: ['start', 'end'] } } },
      }}
    />,
  );
  const root = ref.current!.node!;
  expect(root.findNodes('/*/*')).toEqual([
    root.find('/start'),
    root.find('/end'),
  ]);
  expect(root.findNodes('/*/..')).toEqual([root]);
});

it.each(['constructor', 'toString', '__proto__'])(
  'updaters receive no inherited value for a declared %s property',
  (name) => {
    const path = '/team/' + name;
    const ref = createRef<FormHandle>();
    const seen: unknown[] = [];
    const update = (previous: unknown) => {
      seen.push(previous);
      return 'set';
    };
    let onChange: FieldInputProps<string>['onChange'] | undefined;
    const Probe = (props: FieldInputProps<string>) => {
      onChange = props.onChange;
      return null;
    };
    render(
      <Form
        ref={ref}
        jsonSchema={{
          type: 'object',
          properties: {
            team: {
              type: 'object',
              properties: { [name]: { type: 'string' } },
            },
          },
        }}
        defaultValue={{ team: {} }}
        fieldInputMap={{ [path]: Probe }}
        validationMode={ValidationMode.None}
      />,
    );
    const root = ref.current!.node!;
    const target = root.find(path)!;
    act(() => root.batch(() => target.setValue(update)));
    expect(target.value).toBe('set');
    act(() => target.setValue(undefined));
    act(() => onChange!(update));
    expect(target.value).toBe('set');
    expect(seen).toEqual([undefined, undefined]);
  },
);
