import { StrictMode, createRef } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import {
  type FieldInputProps,
  FieldNodeState,
  type FieldRendererProps,
  Form,
  type FormHandle,
  ValidationMode,
} from '@/schema-form';

afterEach(cleanup);
const schema = { type: 'string' } as const;
const Hidden = () => null;
const Visible = ({ Input }: FieldRendererProps) => <Input />;

// Extends the independent verifier's delayed-change reproduction to file writes and A→B→A.
it.each([false, true])(
  'rejects writes from replaced selections, including a reused component (strict=%s)',
  (strict) => {
    let current!: FieldInputProps;
    const A = (props: FieldInputProps) => {
      current = props;
      return <input aria-label="a" />;
    };
    const B = (props: FieldInputProps) => {
      current = props;
      return <input aria-label="b" />;
    };
    const ref = createRef<FormHandle>();
    const element = (Component: typeof A) => {
      const form = (
        <Form
          ref={ref}
          jsonSchema={schema}
          defaultValue="kept"
          fieldInputMap={{ '#': Component }}
          validationMode={ValidationMode.None}
        />
      );
      return strict ? <StrictMode>{form}</StrictMode> : form;
    };
    const view = render(element(A));
    const oldA = current;
    const root = ref.current!.node;
    const file = new File(['current'], 'current.txt');
    view.rerender(element(B));
    act(() => current.onFileAttach(file));
    act(() => oldA.onChange('late-old-input'));
    expect(ref.current!.getValue()).toBe('kept');
    act(() => oldA.onFileAttach(undefined));
    expect(ref.current!.getAttachedFilesMap().get('')).toEqual([file]);
    view.rerender(element(A));
    act(() => {
      oldA.onChange('late-first-A');
      oldA.onFileAttach(undefined);
    });
    expect(ref.current!.getValue()).toBe('kept');
    expect(ref.current!.getAttachedFilesMap().get('')).toEqual([file]);
    act(() => {
      current.onChange('accepted');
      current.onFileAttach(undefined);
    });
    expect(ref.current!.getValue()).toBe('accepted');
    expect(ref.current!.getAttachedFilesMap().has('')).toBe(false);
    expect(ref.current!.node).toBe(root);
  },
);

it('rejects delayed file attachment writes across A to B to A', () => {
  let current!: FieldInputProps;
  const A = (props: FieldInputProps) => {
    current = props;
    return <input />;
  };
  const B = (props: FieldInputProps) => {
    current = props;
    return <input />;
  };
  const ref = createRef<FormHandle>();
  const element = (Component: typeof A) => (
    <Form
      ref={ref}
      jsonSchema={schema}
      fieldInputMap={{ '#': Component }}
      validationMode={ValidationMode.None}
    />
  );
  const view = render(element(A));
  const old = current;
  const file = new File(['current'], 'current.txt');
  view.rerender(element(B));
  act(() => current.onFileAttach(file));
  act(() => old.onFileAttach(undefined));
  expect(ref.current!.getAttachedFilesMap().get('')).toEqual([file]);
  view.rerender(element(A));
  act(() => old.onFileAttach(undefined));
  expect(ref.current!.getAttachedFilesMap().get('')).toEqual([file]);
  act(() => current.onFileAttach(undefined));
  expect(ref.current!.getAttachedFilesMap().has('')).toBe(false);
});

it.each([false, true])(
  'rejects callbacks after the input unmounts while its node remains live (strict=%s)',
  (strict) => {
    let input!: FieldInputProps;
    const Input = (props: FieldInputProps) => {
      input = props;
      return <input />;
    };
    const ref = createRef<FormHandle>();
    const map = { '#': Input };
    const element = (FieldRenderer: typeof Visible | typeof Hidden) => {
      const form = (
        <Form
          ref={ref}
          jsonSchema={schema}
          defaultValue="kept"
          FieldRenderer={FieldRenderer}
          fieldInputMap={map}
          validationMode={ValidationMode.None}
        />
      );
      return strict ? <StrictMode>{form}</StrictMode> : form;
    };
    const view = render(element(Visible));
    const old = input;
    const root = ref.current!.node;
    view.rerender(element(Hidden));
    act(() => {
      old.onChange('late');
      old.onFileAttach(new File(['late'], 'late.txt'));
    });
    expect(ref.current!.getValue()).toBe('kept');
    expect(ref.current!.getAttachedFilesMap().size).toBe(0);
    expect(ref.current!.node).toBe(root);
  },
);

it('recreates child DOM and drafts when its owning parent input changes, retaining node state', () => {
  const A = ({ ChildFields }: FieldInputProps) => (
    <div>
      {ChildFields.map((Child) => (
        <Child key={Child.key} />
      ))}
    </div>
  );
  const B = ({ ChildFields }: FieldInputProps) => (
    <div>
      {ChildFields.map((Child) => (
        <Child key={Child.key} />
      ))}
    </div>
  );
  const Child = ({ defaultValue }: FieldInputProps) => (
    <input aria-label="child" defaultValue={defaultValue as string} />
  );
  const objectSchema = {
    type: 'object',
    properties: { a: { type: 'string' } },
  } as const;
  const ref = createRef<FormHandle>();
  const errors = [{ dataPath: '/a', message: 'retained' }];
  const element = (Component: typeof A) => (
    <Form
      ref={ref}
      jsonSchema={objectSchema}
      defaultValue={{ a: 'committed' }}
      errors={errors}
      fieldInputMap={{ '#': Component, '/a': Child }}
      validationMode={ValidationMode.None}
    />
  );
  const view = render(element(A));
  const node = ref.current!.findNode('/a')!;
  act(() => node.setState({ [FieldNodeState.Touched]: true }));
  const state = node.state;
  const nodeErrors = node.errors;
  const child = view.getByLabelText('child');
  fireEvent.change(child, { target: { value: 'draft' } });
  view.rerender(element(B));
  expect(view.getByLabelText('child')).not.toBe(child);
  expect((view.getByLabelText('child') as HTMLInputElement).value).toBe(
    'committed',
  );
  expect(ref.current!.findNode('/a')).toBe(node);
  expect(node.state).toEqual(state);
  expect(node.errors).toEqual(nodeErrors);
  expect(ref.current!.getValue()).toEqual({ a: 'committed' });
});
