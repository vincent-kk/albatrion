import { createRef, useEffect, useLayoutEffect } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';
import { FieldNodeEventType, ValidationMode } from '@/schema-form/core';
import type { FieldInputProps } from '@/schema-form/types/fieldInput';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('REACT-024 catches up a mount-time Refresh before two user changes', () => {
  const Input = ({ node, value, onChange }: FieldInputProps) => {
    useLayoutEffect(() => {
      node.setValue('normalized');
    }, [node]);
    return (
      <input
        value={value ?? ''}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    );
  };
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'object',
        properties: {
          s: { type: 'string', presentation: { FieldInput: Input } },
        },
      }}
      validationMode={ValidationMode.None}
    />,
  );
  expect(ref.current!.getValue()).toEqual({ s: 'normalized' });
  for (const value of ['typed1', 'typed2']) {
    fireEvent.change(view.container.querySelector('input')!, {
      target: { value },
    });
    expect(ref.current!.getValue()).toEqual({ s: value });
  }
});

it.each([
  ['layout', useLayoutEffect],
  ['passive', useEffect],
] as const)(
  'WRITE-046 accepts mount-time onChange before root binding (%s)',
  (_, useMountEffect) => {
    const Input = ({ value, onChange }: FieldInputProps) => {
      useMountEffect(() => {
        if (value === undefined) onChange('normalized');
        // eslint-disable-next-line react-hooks/exhaustive-deps -- Reproduce an input's mount-only normalization.
      }, []);
      return <input value={value ?? ''} readOnly />;
    };
    const ref = createRef<FormHandle>();
    render(
      <Form
        ref={ref}
        jsonSchema={{
          type: 'object',
          properties: {
            s: { type: 'string', presentation: { FieldInput: Input } },
          },
        }}
        validationMode={ValidationMode.None}
      />,
    );
    expect(ref.current!.getValue()).toEqual({ s: 'normalized' });
  },
);

it('REACT-009 REACT-011 batches input write, error clear and dirty without refreshing itself', () => {
  let props: FieldInputProps;
  const Input = (input: FieldInputProps) => {
    props = input;
    return <input />;
  };
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string', presentation: { FieldInput: Input } }}
      errors={[{ dataPath: '', keyword: 'external', message: 'server' }]}
    />,
  );
  const node = ref.current!.node!;
  const events: number[] = [];
  node.subscribe(({ type }) => events.push(type));
  act(() => props!.onChange('draft'));
  expect(node.value).toBe('draft');
  expect(node.errors).toEqual([]);
  expect(node.state[1]).toBe(true);
  expect(
    events.filter((type) => type & FieldNodeEventType.UpdateValue),
  ).toHaveLength(1);
  expect(
    events.every((type) => !(type & FieldNodeEventType.RequestRefresh)),
  ).toBe(true);
});

it('REACT-024 rejects old change and file callbacks immediately after refresh', () => {
  let props: FieldInputProps;
  const Input = (input: FieldInputProps) => {
    props = input;
    return <input />;
  };
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string', presentation: { FieldInput: Input } }}
    />,
  );
  const old = props!;
  act(() => {
    ref.current!.setValue('external');
    old.onChange('stale');
    old.onFileAttach(new File([], 'stale'));
  });
  expect(ref.current!.getValue()).toBe('external');
  expect(ref.current!.getAttachedFilesMap().size).toBe(0);
});

it('REACT-024 ignores deferred touched after reset and trims at blur', () => {
  const scheduled: FrameRequestCallback[] = [];
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    scheduled.push(callback);
    return scheduled.length;
  });
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string', options: { trim: true } }}
      defaultValue="  initial  "
    />,
  );
  fireEvent.blur(view.container.querySelector('input')!);
  expect(ref.current!.getValue()).toBe('initial');
  act(() => {
    ref.current!.reset();
    scheduled.forEach((callback) => callback(0));
  });
  expect(ref.current!.getState()[2]).toBeUndefined();
});

it('ERROR-202 reports terminal child access once with a frozen empty array', () => {
  let children: FieldInputProps['ChildFields'];
  const Input = (props: FieldInputProps) => {
    children = props.ChildFields;
    return <span>{children.length}</span>;
  };
  const onError = vi.fn();
  render(
    <Form
      jsonSchema={{ type: 'object', presentation: { FieldInput: Input } }}
      onError={onError}
    />,
  );
  expect(Object.isFrozen(children!)).toBe(true);
  expect(
    onError.mock.calls.filter(
      ([record]) =>
        record.code === 'SCHEMA_FORM_WARNING.CHILD_NODE_COMPONENTS_ON_TERMINAL',
    ),
  ).toHaveLength(1);
});

it('REACT-028 preserves a branch input with mounted child proxies on refresh', () => {
  let mounts = 0;
  const Container = ({ ChildFields }: FieldInputProps) => {
    mounts++;
    return (
      <>
        {ChildFields.map((Child) => (
          <Child key={Child.key} />
        ))}
      </>
    );
  };
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'object', properties: { name: { type: 'string' } } }}
      fieldInputDefinitions={[
        { test: { type: 'object' }, Component: Container },
      ]}
    />,
  );
  const input = document.querySelector('input');
  expect(input).not.toBeNull();
  const before = mounts;
  act(() => ref.current!.refresh());
  expect(mounts).toBe(before);
});

it('REACT-019 ERROR-202 an unanchored input map also matches terminal descendants', () => {
  const counts = new Map<string, number>();
  const Container = ({ path, ChildFields }: FieldInputProps) => {
    counts.set(path, ChildFields.length);
    return (
      <>
        {ChildFields.map((Child) => (
          <Child key={Child.key} />
        ))}
      </>
    );
  };
  render(
    <Form
      jsonSchema={{
        type: 'object',
        properties: {
          o: { type: 'object', properties: { s: { type: 'string' } } },
        },
      }}
      fieldInputMap={{ '/o': Container }}
      validationMode={ValidationMode.None}
      onError={vi.fn()}
    />,
  );
  expect(counts.get('/o')).toBe(1);
  expect(counts.get('/o/s')).toBe(0);
});

it.each(['anchored map', 'definitions'] as const)(
  'REACT-019 REACT-028 supplies child proxies to a mapped or defined container (%s)',
  (selection) => {
    let childCount = -1;
    const Container = ({ value, onChange, ChildFields }: FieldInputProps) => {
      childCount = ChildFields.length;
      return (
        <div data-testid="container">
          {ChildFields.map((Child) => (
            <Child
              key={Child.key}
              onChange={(next) => onChange({ ...value, [Child.field]: next })}
            />
          ))}
        </div>
      );
    };
    const ref = createRef<FormHandle>();
    const view = render(
      <Form
        ref={ref}
        jsonSchema={{
          type: 'object',
          properties: {
            o: { type: 'object', properties: { s: { type: 'string' } } },
          },
        }}
        defaultValue={{ o: { s: 'a' } }}
        validationMode={ValidationMode.None}
        fieldInputMap={
          selection === 'anchored map' ? { '^/o$': Container } : undefined
        }
        fieldInputDefinitions={
          selection === 'definitions'
            ? [{ test: { path: '/o' }, Component: Container }]
            : undefined
        }
      />,
    );
    expect(childCount).toBe(1);
    const container = view.getByTestId('container');
    for (const value of ['ab', 'abc']) {
      fireEvent.change(view.container.querySelector('input')!, {
        target: { value },
      });
      expect(ref.current!.getValue()).toEqual({ o: { s: value } });
      expect(view.getByTestId('container')).toBe(container);
    }
  },
);
