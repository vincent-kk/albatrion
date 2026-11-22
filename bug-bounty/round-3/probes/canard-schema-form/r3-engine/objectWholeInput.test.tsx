import { type FC, createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Form, type FormHandle, ValidationMode } from '@/schema-form';

afterEach(cleanup);

/** Whole-object uncontrolled input: renders no ChildFields and reads defaultValue once per mount. */
const PairInput: FC<any> = ({ defaultValue, onChange }) => (
  <div>
    <input
      data-testid="a"
      defaultValue={defaultValue?.a ?? ''}
      onChange={(event) => onChange({ ...defaultValue, a: event.target.value })}
    />
    <input data-testid="b" defaultValue={defaultValue?.b ?? ''} readOnly />
  </div>
);

const schema = {
  type: 'object',
  properties: {
    src: { type: 'string' },
    o: {
      type: 'object',
      presentation: { FieldInput: PairInput },
      properties: { a: { type: 'string' }, b: { type: 'string' } },
    },
    d: {
      type: 'object',
      presentation: { FieldInput: PairInput },
      properties: { a: { type: 'string' }, b: { type: 'string' } },
      controls: { derived: '({ a: (../src), b: "k" })' },
    },
  },
} as const;

const mount = () => {
  const ref = createRef<FormHandle<any>>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={schema as any}
      defaultValue={{ src: 's0', o: { a: 'a0', b: 'b0' } }}
      validationMode={ValidationMode.None}
    />,
  );
  const read = (path: string, key: string) =>
    (
      view.container.querySelector(
        `[data-path="${path}"] [data-testid="${key}"]`,
      ) as HTMLInputElement | null
    )?.value;
  return { ref, view, read };
};

describe('EQ2 same-key writes refresh a whole-object input', () => {
  it('O1 root setValue with the same keys', () => {
    const { ref, read } = mount();
    expect(read('/o', 'a')).toBe('a0');
    act(() => ref.current!.setValue({ src: 's0', o: { a: 'a1', b: 'b0' } }));
    expect(ref.current!.getValue()).toMatchObject({ o: { a: 'a1', b: 'b0' } });
    expect(read('/o', 'a')).toBe('a1');
  });

  it('O2 object node setValue with the same keys', () => {
    const { ref, read } = mount();
    act(() => ref.current!.findNode('/o')!.setValue({ a: 'a2', b: 'b0' }));
    expect(read('/o', 'a')).toBe('a2');
  });

  it('O3 an object with a schema FieldInput is terminal, so it has no leaf nodes', () => {
    const { ref } = mount();
    expect(ref.current!.findNode('/o')!.strategy).toBe('terminal');
    expect(ref.current!.findNode('/o/a')).toBeNull();
  });

  it('O5 branch object mapped by fieldInputMap: root, node, leaf and derived same-key writes', () => {
    const branchSchema = {
      type: 'object',
      properties: {
        src: { type: 'string' },
        o: {
          type: 'object',
          properties: { a: { type: 'string' }, b: { type: 'string' } },
        },
        d: {
          type: 'object',
          properties: { a: { type: 'string' }, b: { type: 'string' } },
          controls: { derived: '({ a: (../src), b: "k" })' },
        },
      },
    } as const;
    const ref = createRef<FormHandle<any>>();
    const view = render(
      <Form
        ref={ref}
        jsonSchema={branchSchema as any}
        defaultValue={{ src: 's0', o: { a: 'a0', b: 'b0' } }}
        fieldInputMap={{ '/o': PairInput, '/d': PairInput } as any}
        validationMode={ValidationMode.None}
      />,
    );
    const read = (path: string) =>
      (
        view.container.querySelector(
          `[data-path="${path}"] [data-testid="a"]`,
        ) as HTMLInputElement | null
      )?.value;
    const steps: Record<string, unknown> = {};
    expect(ref.current!.findNode('/o')!.strategy).toBe('branch');
    steps.initial = read('/o');
    act(() => ref.current!.setValue({ src: 's0', o: { a: 'a1', b: 'b0' } }));
    steps.root = read('/o');
    act(() => ref.current!.findNode('/o')!.setValue({ a: 'a2', b: 'b0' }));
    steps.node = read('/o');
    act(() => ref.current!.findNode('/o/a')!.setValue('a3'));
    steps.leaf = read('/o');
    act(() => ref.current!.findNode('/src')!.setValue('s1'));
    steps.derived = read('/d');
    expect(steps).toEqual({
      initial: 'a0',
      root: 'a1',
      node: 'a2',
      leaf: 'a3',
      derived: 's1',
    });
  });

  it('O4 derived object with the same keys', () => {
    const { ref, read } = mount();
    expect(read('/d', 'a')).toBe('s0');
    act(() => ref.current!.findNode('/src')!.setValue('s1'));
    expect(ref.current!.getValue()).toMatchObject({ d: { a: 's1', b: 'k' } });
    expect(read('/d', 'a')).toBe('s1');
  });
});
