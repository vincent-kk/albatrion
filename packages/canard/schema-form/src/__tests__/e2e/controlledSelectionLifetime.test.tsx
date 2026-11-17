import { StrictMode, Suspense, createRef, startTransition } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  type FieldInputProps,
  FieldNodeState,
  Form,
  type FormHandle,
} from '../../index';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

/** Both declarations select Refresh-based input lifetime semantics. */
const equivalentDeclarations = [
  [undefined, false],
  [false, undefined],
] as const;

it.each(equivalentDeclarations)(
  'keeps value, file and pending blur callbacks in StrictMode for controlled=%s to %s',
  (before, after) => {
    let current!: FieldInputProps;
    const Input = (props: FieldInputProps) => {
      current = props;
      return <input aria-label="equivalent input" />;
    };
    const schema = { type: 'string' } as const;
    const ref = createRef<FormHandle<typeof schema>>();
    const tree = (controlled: boolean | undefined) => (
      <StrictMode>
        <Form
          ref={ref}
          jsonSchema={schema}
          defaultValue="before"
          fieldInputDefinitions={[
            { test: { type: 'string' }, Component: Input, controlled },
          ]}
        />
      </StrictMode>
    );
    const view = render(tree(before));
    const pending = current;
    const input = view.getByLabelText('equivalent input');
    vi.useFakeTimers();
    fireEvent.blur(input);
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    view.rerender(tree(after));
    expect(view.getByLabelText('equivalent input')).toBe(input);
    const file = new File(['retained'], 'retained.txt');
    act(() => {
      pending.onChange('retained response');
      pending.onFileAttach(file);
      vi.advanceTimersByTime(20);
    });
    expect.soft(ref.current!.getValue()).toBe('retained response');
    expect.soft(ref.current!.getAttachedFilesMap().get('')).toEqual([file]);
    expect.soft(ref.current!.node!.state[FieldNodeState.Touched]).toBe(true);
  },
);

it.each(equivalentDeclarations)(
  'keeps a composing input and callbacks for controlled=%s to %s',
  (before, after) => {
    let current!: FieldInputProps;
    const Input = (props: FieldInputProps) => {
      current = props;
      return (
        <input aria-label="composing input" defaultValue={props.defaultValue} />
      );
    };
    const schema = { type: 'string' } as const;
    const ref = createRef<FormHandle<typeof schema>>();
    const tree = (controlled: boolean | undefined) => (
      <Form
        ref={ref}
        jsonSchema={schema}
        defaultValue="before"
        fieldInputDefinitions={[
          { test: { type: 'string' }, Component: Input, controlled },
        ]}
      />
    );
    const view = render(tree(before));
    const input = view.getByLabelText('composing input');
    const pending = current;
    fireEvent.compositionStart(input);
    view.rerender(tree(after));
    act(() => pending.onChange('draft'));
    expect(ref.current!.getValue()).toBe('draft');
    act(() => ref.current!.setValue('server'));
    expect(view.getByLabelText('composing input')).toBe(input);
    act(() => pending.onChange('late draft'));
    expect(ref.current!.getValue()).toBe('server');
    fireEvent.compositionEnd(input);
    expect(view.getByLabelText('composing input')).not.toBe(input);
    expect(view.getByLabelText('composing input')).toHaveProperty(
      'value',
      'server',
    );
    act(() => current.onChange('current response'));
    expect(ref.current!.getValue()).toBe('current response');
  },
);

it.each([
  [undefined, false, true],
  [false, undefined, true],
  [true, false, false],
  [true, undefined, false],
] as const)(
  'keeps committed callbacks through a suspended transition %s to %s with commit=%s',
  (before, after, commitTransition) => {
    let shouldSuspend = false;
    let current!: FieldInputProps;
    const pendingRender = new Promise<void>(() => {});
    const Input = (props: FieldInputProps) => {
      if (shouldSuspend) throw pendingRender;
      current = props;
      return <input aria-label="suspended input" />;
    };
    const schema = { type: 'string' } as const;
    const ref = createRef<FormHandle<typeof schema>>();
    const tree = (controlled: boolean | undefined) => (
      <Suspense fallback={<span>pending input</span>}>
        <Form
          ref={ref}
          jsonSchema={schema}
          defaultValue="before"
          fieldInputDefinitions={[
            { test: { type: 'string' }, Component: Input, controlled },
          ]}
        />
      </Suspense>
    );
    const view = render(tree(before));
    const input = view.getByLabelText('suspended input');
    const pending = current;
    shouldSuspend = true;
    act(() => startTransition(() => view.rerender(tree(after))));
    expect(view.queryByText('pending input')).toBeNull();
    const file = new File(['committed'], 'committed.txt');
    act(() => pending.onFileAttach(file));
    expect(ref.current!.getAttachedFilesMap().get('')).toEqual([file]);
    shouldSuspend = false;
    view.rerender(tree(commitTransition ? after : before));
    expect(view.getByLabelText('suspended input')).toBe(input);
    act(() => pending.onChange('committed response'));
    expect(ref.current!.getValue()).toBe('committed response');
  },
);

it.each([
  [undefined, false, true],
  [false, undefined, true],
  [true, false, false],
  [true, undefined, false],
] as const)(
  'preserves child DOM and applies callback lifetime for controlled=%s to %s',
  (before, after, retainsCallback) => {
    let current!: FieldInputProps;
    const Input = (props: FieldInputProps) => {
      current = props;
      return (
        <section aria-label="parent input">
          {props.ChildFields.map((Child) => (
            <Child key={Child.key} />
          ))}
        </section>
      );
    };
    const Leaf = () => <input aria-label="child input" />;
    const schema = {
      type: 'object',
      properties: {
        field: { type: 'string', presentation: { FieldInput: Leaf } },
      },
    } as const;
    const ref = createRef<FormHandle<typeof schema>>();
    const tree = (controlled: boolean | undefined) => (
      <Form
        ref={ref}
        jsonSchema={schema}
        defaultValue={{ field: 'before' }}
        fieldInputDefinitions={[
          { test: { type: 'object' }, Component: Input, controlled },
        ]}
      />
    );
    const view = render(tree(before));
    const pending = current;
    const parent = view.getByLabelText('parent input');
    const child = view.getByLabelText('child input');
    view.rerender(tree(after));
    expect(view.getByLabelText('parent input')).toBe(parent);
    expect(view.getByLabelText('child input')).toBe(child);
    const file = new File(['pending'], 'pending.txt');
    act(() => {
      pending.onChange({ field: 'pending' });
      pending.onFileAttach(file);
    });
    expect(ref.current!.getValue()).toEqual({
      field: retainsCallback ? 'pending' : 'before',
    });
    expect(ref.current!.getAttachedFilesMap().get('')).toEqual(
      retainsCallback ? [file] : undefined,
    );
    act(() => current.onChange({ field: 'current' }));
    expect(ref.current!.getValue()).toEqual({ field: 'current' });
  },
);

it.each([
  [true, false],
  [true, undefined],
  [false, true],
  [undefined, true],
] as const)(
  'retires a pending blur scheduled before controlled=%s changes to %s',
  (before, after) => {
    const Input = (props: FieldInputProps) => (
      <section aria-label="parent input">
        <button aria-label="parent focus" />
        {props.ChildFields.map((Child) => (
          <Child key={Child.key} />
        ))}
      </section>
    );
    const Leaf = () => <input aria-label="child input" />;
    const schema = {
      type: 'object',
      properties: {
        field: { type: 'string', presentation: { FieldInput: Leaf } },
      },
    } as const;
    const ref = createRef<FormHandle<typeof schema>>();
    const tree = (controlled: boolean | undefined) => (
      <Form
        ref={ref}
        jsonSchema={schema}
        defaultValue={{ field: 'before' }}
        fieldInputDefinitions={[
          { test: { type: 'object' }, Component: Input, controlled },
        ]}
      />
    );
    const view = render(tree(before));
    const parent = view.getByLabelText('parent input');
    vi.useFakeTimers();
    fireEvent.blur(view.getByLabelText('parent focus'));
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    view.rerender(tree(after));
    expect(view.getByLabelText('parent input')).toBe(parent);
    act(() => vi.advanceTimersByTime(20));
    expect(ref.current!.node!.state[FieldNodeState.Touched]).not.toBe(true);
  },
);

it.each([false, undefined])(
  'retires controlled callbacks while composition delays uncontrolled=%s replacement',
  (controlled) => {
    let current!: FieldInputProps;
    const Input = (props: FieldInputProps) => {
      current = props;
      return (
        <input
          aria-label="mode transition"
          value={String(props.value ?? '')}
          readOnly
        />
      );
    };
    const schema = { type: 'string' } as const;
    const ref = createRef<FormHandle<typeof schema>>();
    const tree = (declaration: boolean | undefined) => (
      <Form
        ref={ref}
        jsonSchema={schema}
        defaultValue="before"
        fieldInputDefinitions={[
          {
            test: { type: 'string' },
            Component: Input,
            controlled: declaration,
          },
        ]}
      />
    );
    const view = render(tree(true));
    const pending = current;
    const input = view.getByLabelText('mode transition');
    fireEvent.compositionStart(input);
    act(() => ref.current!.setValue('server'));
    view.rerender(tree(controlled));
    expect(view.getByLabelText('mode transition')).toBe(input);
    act(() => {
      pending.onChange('retired draft');
      pending.onFileAttach(new File(['retired'], 'retired.txt'));
      current.onChange('deferred draft');
    });
    expect(ref.current!.getValue()).toBe('server');
    expect(ref.current!.getAttachedFilesMap().size).toBe(0);
    fireEvent.compositionEnd(input);
    expect(view.getByLabelText('mode transition')).not.toBe(input);
    act(() => current.onChange('current response'));
    expect(ref.current!.getValue()).toBe('current response');
  },
);
