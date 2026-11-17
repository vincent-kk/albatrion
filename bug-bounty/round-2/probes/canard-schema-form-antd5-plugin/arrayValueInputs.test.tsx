import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { fieldInputDefinitions } from '../../fieldInputs';

afterEach(cleanup);

const checkedOf = (container: HTMLElement) =>
  Array.from(
    container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'),
  )
    .filter((box) => box.checked)
    .map((box) => box.value);

const checksSchema = {
  type: 'object',
  properties: {
    checks: {
      type: 'array',
      items: { type: 'string', enum: ['a', 'b', 'c'] },
      presentation: { inputType: 'checkbox' },
    },
  },
} as const;

describe('checkbox group (array of string enum) follows external writes', () => {
  it('root setValue with the same length', async () => {
    const ref = createRef<FormHandle>();
    const { container } = render(
      <Form
        ref={ref}
        fieldInputDefinitions={fieldInputDefinitions}
        jsonSchema={checksSchema}
        defaultValue={{ checks: ['a'] }}
      />,
    );
    expect(checkedOf(container)).toEqual(['"a"']);
    await act(async () => ref.current!.setValue({ checks: ['b'] }));
    expect(ref.current!.getValue()).toEqual({ checks: ['b'] });
    expect(checkedOf(container)).toEqual(['"b"']);
  });

  it('node.setValue with the same length', async () => {
    const ref = createRef<FormHandle>();
    const { container } = render(
      <Form
        ref={ref}
        fieldInputDefinitions={fieldInputDefinitions}
        jsonSchema={checksSchema}
        defaultValue={{ checks: ['a'] }}
      />,
    );
    await act(async () => ref.current!.findNode('/checks')!.setValue(['c']));
    expect(ref.current!.getValue()).toEqual({ checks: ['c'] });
    expect(checkedOf(container)).toEqual(['"c"']);
  });

  it('root setValue with a different length', async () => {
    const ref = createRef<FormHandle>();
    const { container } = render(
      <Form
        ref={ref}
        fieldInputDefinitions={fieldInputDefinitions}
        jsonSchema={checksSchema}
        defaultValue={{ checks: ['a'] }}
      />,
    );
    await act(async () => ref.current!.setValue({ checks: ['b', 'c'] }));
    expect(checkedOf(container)).toEqual(['"b"', '"c"']);
  });

  it('reset after an external write with the same length', async () => {
    const ref = createRef<FormHandle>();
    const { container } = render(
      <Form
        ref={ref}
        fieldInputDefinitions={fieldInputDefinitions}
        jsonSchema={checksSchema}
        defaultValue={{ checks: ['a'] }}
      />,
    );
    await act(async () => ref.current!.setValue({ checks: ['b'] }));
    await act(async () => ref.current!.reset());
    expect(ref.current!.getValue()).toEqual({ checks: ['a'] });
    expect(checkedOf(container)).toEqual(['"a"']);
  });
});

describe('multiple select (array of string enum) follows external writes', () => {
  it('root setValue with the same length', async () => {
    const ref = createRef<FormHandle>();
    const { container } = render(
      <Form
        ref={ref}
        fieldInputDefinitions={fieldInputDefinitions}
        jsonSchema={{
          type: 'object',
          properties: {
            tags: {
              type: 'array',
              items: { type: 'string', enum: ['alpha', 'beta'] },
            },
          },
        }}
        defaultValue={{ tags: ['alpha'] }}
      />,
    );
    const shown = () =>
      Array.from(
        container.querySelectorAll('.ant-select-selection-item-content'),
      ).map((node) => node.textContent);
    expect(shown()).toEqual(['alpha']);
    await act(async () => ref.current!.setValue({ tags: ['beta'] }));
    expect(ref.current!.getValue()).toEqual({ tags: ['beta'] });
    expect(shown()).toEqual(['beta']);
  });
});

describe('date range (array of two dates) follows external writes', () => {
  it('root setValue with the same length', async () => {
    const ref = createRef<FormHandle>();
    const { container } = render(
      <Form
        ref={ref}
        fieldInputDefinitions={fieldInputDefinitions}
        jsonSchema={{
          type: 'object',
          properties: {
            span: {
              type: 'array',
              format: 'date-range',
              items: { type: 'string', format: 'date' },
            },
          },
        }}
        defaultValue={{ span: ['2024-01-10', '2024-01-12'] }}
      />,
    );
    const shown = () =>
      Array.from(container.querySelectorAll<HTMLInputElement>('input')).map(
        (input) => input.value,
      );
    expect(shown()).toEqual(['2024-01-10', '2024-01-12']);
    await act(async () =>
      ref.current!.setValue({ span: ['2024-03-01', '2024-03-05'] }),
    );
    expect(ref.current!.getValue()).toEqual({
      span: ['2024-03-01', '2024-03-05'],
    });
    expect(shown()).toEqual(['2024-03-01', '2024-03-05']);
  });
});

describe('diagnostic: events delivered to the array node', () => {
  it('a same-length write to a non-terminal array requests a refresh of that array', async () => {
    const { FieldNodeEventType } = await import('@canard/schema-form');
    const ref = createRef<FormHandle>();
    render(
      <Form
        ref={ref}
        fieldInputDefinitions={fieldInputDefinitions}
        jsonSchema={checksSchema}
        defaultValue={{ checks: ['a'] }}
      />,
    );
    const node = ref.current!.findNode('/checks')!;
    let seen = 0;
    node.subscribe(({ type }) => {
      seen |= type;
    });
    await act(async () => node.setValue(['b']));
    expect(!!(seen & FieldNodeEventType.UpdateValue)).toBe(true);
    expect(!!(seen & FieldNodeEventType.RequestRefresh)).toBe(true);
  });
});
