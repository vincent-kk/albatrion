import * as React from 'react';
import { Suspense, createRef, useLayoutEffect, useRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, inject, it } from 'vitest';

import { type FieldInputProps, Form, type FormHandle } from '../../index';

afterEach(cleanup);

it.for([
  ['disabled', false],
  ['readOnly', false],
  ['disabled', true],
  ['readOnly', true],
] as const)(
  'Suspense preserves the committed %s snapshot (legacyRoot=%s)',
  ([lock, legacyRoot], context) => {
    if (legacyRoot && inject('reactMajor') !== '18')
      return context.skip('React 19 removes legacy roots');
    let input!: FieldInputProps;
    let suspended = false;
    const pendingRender = new Promise<void>(() => {});
    const Input = (props: FieldInputProps) => {
      if (suspended) throw pendingRender;
      input = props;
      return <input value={String(props.value ?? '')} readOnly />;
    };
    const schema = {
      type: 'string',
      presentation: { FieldInput: Input, controlled: true },
    } as const;
    const ref = createRef<FormHandle<typeof schema>>();
    const tree = (locked: boolean) => (
      <Suspense fallback={<span>waiting</span>}>
        <Form
          ref={ref}
          jsonSchema={schema}
          defaultValue="before"
          {...{ [lock]: locked }}
        />
      </Suspense>
    );
    const view = render(tree(false), { legacyRoot });
    const handle = ref.current!;
    const pending = input.onChange;
    suspended = true;
    view.rerender(tree(true));
    expect(view.getByText('waiting')).toBeDefined();
    act(() => pending('while hidden'));
    expect(handle.getValue()).toBe(legacyRoot ? 'before' : 'while hidden');
    suspended = false;
    view.rerender(tree(true));
    act(() => pending('while locked'));
    expect(handle.getValue()).toBe(legacyRoot ? 'before' : 'while hidden');
    view.rerender(tree(false));
    act(() => pending('after reveal'));
    expect(handle.getValue()).toBe('after reveal');
  },
);

it.for(['disabled', 'readOnly'] as const)(
  'Activity publishes hidden %s updates and preserves the live callback',
  (lock, context) => {
    if (inject('reactMajor') === '18')
      return context.skip('React 18 has no Activity');
    let input!: FieldInputProps;
    const Input = (props: FieldInputProps) => {
      input = props;
      return <input value={String(props.value ?? '')} readOnly />;
    };
    const schema = {
      type: 'string',
      presentation: { FieldInput: Input, controlled: true },
    } as const;
    const ref = createRef<FormHandle<typeof schema>>();
    const tree = (hidden: boolean, locked: boolean) => (
      <React.Activity mode={hidden ? 'hidden' : 'visible'}>
        <Form
          ref={ref}
          jsonSchema={schema}
          defaultValue="before"
          {...{ [lock]: locked }}
        />
      </React.Activity>
    );
    const view = render(tree(false, false));
    const handle = ref.current!;
    const pending = input.onChange;
    view.rerender(tree(true, true));
    act(() => pending('while locked'));
    expect(handle.getValue()).toBe('before');
    view.rerender(tree(true, false));
    act(() => pending('while unlocked'));
    expect(handle.getValue()).toBe('while unlocked');
    view.rerender(tree(false, false));
    act(() => pending('after reveal'));
    expect(handle.getValue()).toBe('after reveal');
  },
);

it.each([
  ['disabled', false, true],
  ['disabled', true, false],
  ['readOnly', false, true],
  ['readOnly', true, false],
] as const)(
  '%s %s → %s publishes between child layout cleanup and setup',
  (lock, initial, next) => {
    let armed = false;
    const observed: [string, unknown][] = [];
    const Input = (props: FieldInputProps) => {
      const first = useRef(props);
      const locked = props[lock];
      useLayoutEffect(() => {
        const { onChange, node } = first.current;
        if (armed) {
          onChange('setup');
          observed.push(['setup', node.value]);
        }
        return () => {
          if (armed) {
            onChange('cleanup');
            observed.push(['cleanup', node.value]);
          }
        };
      }, [locked]);
      return <input value={String(props.value ?? '')} readOnly />;
    };
    const schema = {
      type: 'string',
      presentation: { FieldInput: Input, controlled: true },
    } as const;
    const tree = (locked: boolean) => (
      <Form jsonSchema={schema} defaultValue="before" {...{ [lock]: locked }} />
    );
    const view = render(tree(initial));
    armed = true;
    view.rerender(tree(next));
    armed = false;
    expect(observed).toEqual([
      ['cleanup', initial ? 'before' : 'cleanup'],
      ['setup', next ? 'cleanup' : 'setup'],
    ]);
  },
);
