import { Activity, StrictMode, createRef, useState } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, inject, it } from 'vitest';

import {
  type FieldInputProps,
  Form,
  type FormHandle,
  ValidationMode,
} from '../../index';

afterEach(cleanup);
const WholeArray = ({ defaultValue, onChange }: FieldInputProps<string[]>) => (
  <input
    defaultValue={JSON.stringify(defaultValue)}
    onChange={(event) => onChange([event.target.value])}
  />
);
const schema = {
  type: 'object',
  properties: { list: { type: 'array', items: { type: 'string' } } },
} as const;
describe('round-2 schema-form 3: whole-value branch inputs', () => {
  it.each(['root', 'array', 'item'] as const)(
    'delivers same-length external %s writes',
    async (origin) => {
      const ref = createRef<FormHandle>();
      const view = render(
        <Form
          ref={ref}
          jsonSchema={schema}
          defaultValue={{ list: ['a'] }}
          validationMode={ValidationMode.None}
          fieldInputMap={{ '/list': WholeArray }}
        />,
      );
      await act(() => {
        if (origin === 'root') ref.current!.setValue({ list: ['b'] });
        else
          ref
            .current!.findNode(origin === 'array' ? '/list' : '/list/0')!
            .setValue(origin === 'array' ? ['b'] : 'b');
      });
      expect(view.container.querySelector('input')!.value).toBe('["b"]');
    },
  );
});

it('round-2 schema-form 3: plugin-style definitions refresh without a plugin change', async () => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={schema}
      defaultValue={{ list: ['a'] }}
      validationMode={ValidationMode.None}
      fieldInputDefinitions={[
        { test: { type: 'array' }, Component: WholeArray },
      ]}
    />,
  );
  await act(() => ref.current!.setValue({ list: ['b'] }));
  expect(view.container.querySelector('input')!.value).toBe('["b"]');
});
it.each([false, true])(
  'round-2 schema-form 3: own input writes preserve DOM (relay=%s)',
  async (relay) => {
    const ref = createRef<FormHandle>();
    const view = render(
      <Form
        ref={ref}
        jsonSchema={schema}
        defaultValue={{ list: ['a'] }}
        validationMode={ValidationMode.None}
      >
        <Form.Input
          path="/list"
          FieldInput={WholeArray}
          onChange={
            relay
              ? (value) => ref.current!.findNode('/list')!.setValue(value)
              : undefined
          }
        />
      </Form>,
    );
    const input = view.container.querySelector('input')!;
    fireEvent.change(input, { target: { value: 'own' } });
    expect(ref.current!.getValue()).toEqual({ list: ['own'] });
    expect(view.container.querySelector('input')).toBe(input);
  },
);
it('round-2 schema-form 3: controlled arrays receive value without replacing DOM', async () => {
  const Controlled = ({ value }: FieldInputProps<string[]>) => (
    <input value={JSON.stringify(value)} readOnly />
  );
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={schema}
      defaultValue={{ list: ['a'] }}
      validationMode={ValidationMode.None}
      fieldInputDefinitions={[
        { test: { type: 'array' }, Component: Controlled, controlled: true },
      ]}
    />,
  );
  const input = view.container.querySelector('input')!;
  await act(() => ref.current!.setValue({ list: ['b'] }));
  expect(view.container.querySelector('input')).toBe(input);
  expect(input.value).toBe('["b"]');
});
it('round-2 schema-form 3: composition defers an external whole-array refresh', async () => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={schema}
      defaultValue={{ list: ['a'] }}
      validationMode={ValidationMode.None}
      fieldInputMap={{ '/list': WholeArray }}
    />,
  );
  const input = view.container.querySelector('input')!;
  fireEvent.compositionStart(input);
  await act(() => ref.current!.setValue({ list: ['b'] }));
  expect(view.container.querySelector('input')).toBe(input);
  fireEvent.compositionEnd(input);
  expect(view.container.querySelector('input')).not.toBe(input);
  expect(view.container.querySelector('input')!.value).toBe('["b"]');
});
it('round-2 schema-form 3: mixed own and external child writes refresh the array', async () => {
  const Mixed = ({
    node,
    onChange,
    defaultValue,
  }: FieldInputProps<string[]>) => (
    <>
      <input defaultValue={JSON.stringify(defaultValue)} />
      <button
        type="button"
        onClick={() =>
          node.batch(() => {
            onChange(['own']);
            node.find('0')!.setValue('external');
          })
        }
      >
        mixed
      </button>
    </>
  );
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={schema}
      defaultValue={{ list: ['a'] }}
      validationMode={ValidationMode.None}
      fieldInputMap={{ '/list': Mixed }}
    />,
  );
  fireEvent.click(view.getByText('mixed'));
  expect(ref.current!.getValue()).toEqual({ list: ['external'] });
  expect(view.container.querySelector('input')!.value).toBe('["external"]');
});
it('round-2 schema-form 3: an automatic child rewrite refreshes an own array write', () => {
  const Derived = ({ defaultValue, onChange }: FieldInputProps<string[]>) => {
    const [draft, setDraft] = useState(defaultValue);
    return (
      <>
        <input readOnly value={JSON.stringify(draft)} />
        <button
          type="button"
          onClick={() => {
            setDraft(['b', 'old']);
            onChange(['b', 'old']);
          }}
        >
          derive
        </button>
      </>
    );
  };
  const view = render(
    <Form
      jsonSchema={{
        type: 'object',
        properties: {
          list: {
            type: 'array',
            items: [
              { type: 'string' },
              { type: 'string', controls: { derived: '(../0) + "!"' } },
            ],
          },
        },
      }}
      defaultValue={{ list: ['a', 'a!'] }}
      validationMode={ValidationMode.None}
      fieldInputMap={{ '/list': Derived }}
    />,
  );
  fireEvent.click(view.getByText('derive'));
  expect(view.container.querySelector('input')!.value).toBe('["b","b!"]');
});
it('round-2 schema-form 3: delayed first child render accepts the documented parent-state loss', async () => {
  let mounts = 0;
  const Delayed = ({ ChildFields }: FieldInputProps) => {
    const [id] = useState(() => ++mounts);
    const [shown, show] = useState(false);
    return (
      <section data-id={id}>
        <button type="button" onClick={() => show(true)}>
          reveal
        </button>
        {shown && ChildFields?.map((Child) => <Child key={Child.key} />)}
      </section>
    );
  };
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={schema}
      defaultValue={{ list: ['a'] }}
      validationMode={ValidationMode.None}
      fieldInputMap={{ '/list': Delayed }}
    />,
  );
  const initial = view.container.querySelector('section')!;
  await act(() => ref.current!.setValue({ list: ['b'] }));
  expect(view.container.querySelector('section')).not.toBe(initial);
  expect(mounts).toBe(2);
  fireEvent.click(view.getByText('reveal'));
  expect(view.container.querySelector('input')!.value).toBe('b');
});
it('round-2 schema-form 3: Activity keeps child ownership while subscriptions disconnect', async (context) => {
  if (inject('reactMajor') === '18') context.skip('React 18 has no Activity.');
  const Branch = ({ ChildFields }: FieldInputProps) => (
    <section>
      {ChildFields?.map((Child) => (
        <Child key={Child.key} />
      ))}
    </section>
  );
  const ref = createRef<FormHandle>();
  const tree = (mode: 'hidden' | 'visible') => (
    <StrictMode>
      <Form
        ref={ref}
        jsonSchema={schema}
        defaultValue={{ list: ['a'] }}
        validationMode={ValidationMode.None}
      >
        <Activity mode={mode}>
          <Form.Input path="/list" FieldInput={Branch} />
        </Activity>
      </Form>
    </StrictMode>
  );
  const view = render(tree('visible'));
  const section = view.container.querySelector('section')!;
  const input = view.container.querySelector('input')!;
  const handle = ref.current!;
  view.rerender(tree('hidden'));
  await act(() => handle.findNode('/list/0')!.setValue('b'));
  view.rerender(tree('visible'));
  expect(view.container.querySelector('section')).toBe(section);
  expect(view.container.querySelector('input')!.value).toBe('b');
});
it('round-2 schema-form 3: Activity catches a missed external revision for a whole array', async (context) => {
  if (inject('reactMajor') === '18') context.skip('React 18 has no Activity.');
  const ref = createRef<FormHandle>();
  const tree = (mode: 'hidden' | 'visible') => (
    <StrictMode>
      <Form
        ref={ref}
        jsonSchema={schema}
        defaultValue={{ list: ['a'] }}
        validationMode={ValidationMode.None}
      >
        <Activity mode={mode}>
          <Form.Input path="/list" FieldInput={WholeArray} />
        </Activity>
      </Form>
    </StrictMode>
  );
  const view = render(tree('visible'));
  const handle = ref.current!;
  view.rerender(tree('hidden'));
  await act(() => handle.findNode('/list/0')!.setValue('b'));
  view.rerender(tree('visible'));
  expect(view.container.querySelector('input')!.value).toBe('["b"]');
});
