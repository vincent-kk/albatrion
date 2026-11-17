import { createRef, useState } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { advanceValidationFrame } from '@/schema-form/__tests__/helpers/advanceValidationFrame';
import { registerPlugin } from '@/schema-form/app/plugin';
import { Form, type FormHandle } from '@/schema-form/components/Form';
import { useWorkspaceContext } from '@/schema-form/providers';
import { ExternalFormContextProvider as FormProvider } from '@/schema-form/providers/ExternalFormContext';
import type {
  FieldInputProps,
  FieldRendererProps,
  InputRendererProps,
} from '@/schema-form/types';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  registerPlugin(null);
});

it('applies a nested FormProvider frame to both bound Input and Form.Input', () => {
  const Frame = ({ children, path }: InputRendererProps) => (
    <section data-nested-frame={path}>{children}</section>
  );
  const view = render(
    <Form
      jsonSchema={{
        type: 'object',
        properties: { a: { type: 'string' }, b: { type: 'string' } },
      }}
      validationMode={0}
    >
      <FormProvider InputRenderer={Frame}>
        <Form.Field path="/a" />
        <Form.Input path="/b" />
      </FormProvider>
    </Form>,
  );
  expect(
    view.container.querySelector('[data-nested-frame="/a"] input'),
  ).not.toBeNull();
  expect(
    view.container.querySelector('[data-nested-frame="/b"] input'),
  ).not.toBeNull();
});

it('selects the Form frame before the nearest provider and then the plugin frame', () => {
  const Local = ({ children }: InputRendererProps) => (
    <section data-frame-owner="form">{children}</section>
  );
  const External = ({ children }: InputRendererProps) => (
    <section data-frame-owner="provider">{children}</section>
  );
  const Plugin = ({ children }: InputRendererProps) => (
    <section data-frame-owner="plugin">{children}</section>
  );
  registerPlugin({ InputRenderer: Plugin });
  const schema = {
    type: 'object',
    properties: { a: { type: 'string' } },
  } as const;
  const view = render(
    <Form jsonSchema={schema} validationMode={0} InputRenderer={Local}>
      <FormProvider InputRenderer={External}>
        <Form.Input path="/a" />
      </FormProvider>
    </Form>,
  );
  expect(
    view.container.querySelector('[data-frame-owner="form"] input'),
  ).not.toBeNull();
  expect(
    view.container.querySelector('[data-frame-owner="provider"]'),
  ).toBeNull();
  view.rerender(
    <Form jsonSchema={schema} validationMode={0}>
      <FormProvider InputRenderer={External}>
        <Form.Input path="/a" />
      </FormProvider>
    </Form>,
  );
  expect(
    view.container.querySelector('[data-frame-owner="provider"] input'),
  ).not.toBeNull();
  view.rerender(
    <FormProvider InputRenderer={External}>
      <Form jsonSchema={schema} validationMode={0}>
        <FormProvider>
          <Form.Input path="/a" />
        </FormProvider>
      </Form>
    </FormProvider>,
  );
  expect(
    view.container.querySelector('[data-frame-owner="plugin"] input'),
  ).not.toBeNull();
});

it('frames root, branch and leaf inputs with the real input metadata and locks', () => {
  const frames = vi.fn(({ children, path }: InputRendererProps) => (
    <section data-frame={path}>{children}</section>
  ));
  const inputs = vi.fn((props: FieldInputProps) => (
    <input id={props.path} disabled={props.disabled} />
  ));
  const Group = ({ isRoot, Input }: FieldRendererProps) => (
    <Input required={!isRoot} disabled={!isRoot} />
  );
  const schema = {
    type: 'object',
    properties: {
      o: { type: 'object', properties: { a: { type: 'string' } } },
    },
  } as const;
  const props = {
    jsonSchema: schema,
    validationMode: 0,
    InputRenderer: frames,
    FieldRenderer: Group,
    context: { x: 1 },
    fieldInputDefinitions: [
      { test: { type: 'string' as const }, Component: inputs },
    ],
  };
  const view = render(<Form {...props} />);
  expect(
    Array.from(view.container.querySelectorAll('[data-frame]'), (element) =>
      element.getAttribute('data-frame'),
    ),
  ).toEqual(['', '/o', '/o/a']);
  const frame = frames.mock.calls.find(([props]) => props.path === '/o/a')![0];
  expect(frame).toMatchObject({
    path: '/o/a',
    name: 'a',
    node: expect.anything(),
    jsonSchema: schema.properties.o.properties.a,
    required: true,
    disabled: true,
    readOnly: false,
    context: { x: 1 },
    children: expect.anything(),
  });
  for (const key of ['errors', 'errorVisible', 'formatError'])
    expect(frame).not.toHaveProperty(key);
  expect(inputs.mock.calls.at(-1)![0].disabled).toBe(true);
  view.rerender(<Form {...props} readOnly />);
  expect(frames.mock.calls.at(-1)![0].readOnly).toBe(true);
});

it.each(['bound', 'form', 'child', 'schema'] as const)(
  'routes unwrapped only from its direct %s source',
  (source) => {
    const input = vi.fn((props: FieldInputProps) => <input id={props.path} />);
    const Frame = ({ path, children }: InputRendererProps) => (
      <section data-frame={path}>{children}</section>
    );
    const Group = ({ isRoot, Input }: FieldRendererProps) => (
      <Input unwrapped={isRoot || source === 'bound'} />
    );
    const Branch = ({ ChildFields }: FieldInputProps) => (
      <>
        {ChildFields.map((Child) => (
          <Child key={Child.key} unwrapped />
        ))}
      </>
    );
    const view = render(
      <Form
        jsonSchema={{
          type: 'object',
          properties: {
            a: {
              type: 'string',
              presentation: {
                FieldInputProps: source === 'schema' ? { unwrapped: true } : {},
              },
            },
          },
        }}
        validationMode={0}
        FieldRenderer={Group}
        InputRenderer={Frame}
        fieldInputDefinitions={[
          ...(source === 'child'
            ? [{ test: { type: 'object' as const }, Component: Branch }]
            : []),
          { test: { type: 'string' }, Component: input },
        ]}
      >
        {source === 'form' ? <Form.Input path="/a" unwrapped /> : undefined}
      </Form>,
    );
    expect(!!view.container.querySelector('[data-frame="/a"]')).toBe(
      source === 'child' || source === 'schema',
    );
    const props = input.mock.calls.find(([props]) => props.path === '/a')![0];
    expect(props.unwrapped).toBe(
      source === 'child' || source === 'schema' ? true : undefined,
    );
    expect(props).not.toHaveProperty('errors');
    expect(props).not.toHaveProperty('errorVisible');
  },
);

it('keeps identical input DOM without a registered frame', () => {
  const schema = { type: 'string' as const };
  const Group = ({ Input, context }: FieldRendererProps) => (
    <Input unwrapped={context.skip} />
  );
  const view = render(
    <Form
      jsonSchema={schema}
      validationMode={0}
      FieldRenderer={Group}
      context={{ skip: false }}
    />,
  );
  const before = view.container.innerHTML;
  view.rerender(
    <Form
      jsonSchema={schema}
      validationMode={0}
      FieldRenderer={Group}
      context={{ skip: true }}
    />,
  );
  expect(view.container.innerHTML).toBe(before);
});

it('replaces frames and direct unwrapped while retaining own files, current values and input registration', async () => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  const ref = createRef<FormHandle>();
  let current!: FieldInputProps;
  let files!: ReturnType<typeof useWorkspaceContext>['attachedFilesMap'];
  const Input = (props: FieldInputProps) => {
    current = props;
    files = useWorkspaceContext().attachedFilesMap;
    return (
      <input
        id={props.path}
        defaultValue={props.defaultValue}
        onChange={(event) => props.onChange(event.target.value)}
      />
    );
  };
  const Group = ({ isRoot, Input, context }: FieldRendererProps) => (
    <Input unwrapped={isRoot || context.skip} />
  );
  const First = ({ children }: InputRendererProps) => (
    <section>{children}</section>
  );
  const Second = ({ children }: InputRendererProps) => (
    <article>{children}</article>
  );
  const schema = {
    type: 'object',
    properties: { a: { type: 'string' } },
  } as const;
  const definitions = [{ test: { type: 'string' as const }, Component: Input }];
  const props = {
    ref,
    jsonSchema: schema,
    defaultValue: { a: 'initial' },
    fieldInputDefinitions: definitions,
    FieldRenderer: Group,
    validationMode: 0,
    virtualization: { threshold: 1, eagerCount: 1 },
  };
  const view = render(<Form {...props} />);
  const file = new File(['a'], 'a.txt');
  act(() => current.onFileAttach(file));
  fireEvent.change(view.container.querySelector('input')!, {
    target: { value: 'typed' },
  });
  const oldChange = current.onChange;
  const oldAttach = current.onFileAttach;
  for (const [Frame, skip] of [
    [First, false],
    [Second, false],
    [Second, true],
  ] as const) {
    const previous = view.container.querySelector('input');
    view.rerender(<Form {...props} InputRenderer={Frame} context={{ skip }} />);
    const input = view.container.querySelector('input')!;
    expect(input).not.toBe(previous);
    expect(input.value).toBe('typed');
    expect(files.get('/a')).toEqual([file]);
    act(() => oldChange('stale'));
    expect(ref.current!.findNode('/a')!.value).toBe('typed');
    act(() => oldAttach(undefined));
    expect(files.get('/a')).toEqual([file]);
    act(() => ref.current!.focus('/a'));
    expect(document.activeElement).toBe(input);
  }
  fireEvent.change(view.container.querySelector('input')!, {
    target: { value: 'next' },
  });
  expect(ref.current!.findNode('/a')!.value).toBe('next');
  fireEvent.blur(view.container.querySelector('input')!);
  await advanceValidationFrame();
  expect(ref.current!.findNode('/a')!.state[2]).toBe(true);
});

it('remounts branch children on frame replacement and clears only their attached files', () => {
  const ref = createRef<FormHandle>();
  const observed = new Map<string, FieldInputProps>();
  let files!: ReturnType<typeof useWorkspaceContext>['attachedFilesMap'];
  const Branch = (props: FieldInputProps) => {
    observed.set(props.path, props);
    files = useWorkspaceContext().attachedFilesMap;
    return (
      <>
        {props.ChildFields.map((Child) => (
          <Child key={Child.key} />
        ))}
      </>
    );
  };
  const Leaf = (props: FieldInputProps) => {
    observed.set(props.path, props);
    return <input defaultValue={props.defaultValue} />;
  };
  const Group = ({ isRoot, Input }: FieldRendererProps) => (
    <Input unwrapped={isRoot} />
  );
  const First = ({ children }: InputRendererProps) => (
    <section>{children}</section>
  );
  const Second = ({ children }: InputRendererProps) => (
    <article>{children}</article>
  );
  const props = {
    ref,
    jsonSchema: {
      type: 'object' as const,
      properties: {
        o: {
          type: 'object' as const,
          properties: { a: { type: 'string' as const } },
        },
      },
    },
    defaultValue: { o: { a: 'value' } },
    validationMode: 0,
    FieldRenderer: Group,
    fieldInputDefinitions: [
      { test: { type: 'object' as const }, Component: Branch },
      { test: { type: 'string' as const }, Component: Leaf },
    ],
  };
  const view = render(<Form {...props} InputRenderer={First} />);
  const file = new File(['a'], 'a.txt');
  act(() => {
    observed.get('/o')!.onFileAttach(file);
    observed.get('/o/a')!.onFileAttach(file);
  });
  const input = view.container.querySelector('input');
  view.rerender(<Form {...props} InputRenderer={Second} />);
  expect(view.container.querySelector('input')).not.toBe(input);
  expect(view.container.querySelector('input')?.value).toBe('value');
  expect(files.get('/o')).toEqual([file]);
  expect(files.has('/o/a')).toBe(false);
});

it('switches Form.Input unwrapped and retains a working standalone input', () => {
  const ref = createRef<FormHandle>();
  const Frame = ({ children }: InputRendererProps) => (
    <section>{children}</section>
  );
  const props = {
    ref,
    jsonSchema: {
      type: 'object' as const,
      properties: { a: { type: 'string' as const } },
    },
    InputRenderer: Frame,
    validationMode: 0,
  };
  const view = render(
    <Form {...props}>
      <Form.Input path="/a" />
    </Form>,
  );
  const input = view.container.querySelector('input')!;
  expect(view.container.querySelector('section')).not.toBeNull();
  view.rerender(
    <Form {...props}>
      <Form.Input path="/a" unwrapped />
    </Form>,
  );
  expect(view.container.querySelector('input')).not.toBe(input);
  expect(view.container.querySelector('section')).toBeNull();
  fireEvent.change(view.container.querySelector('input')!, {
    target: { value: 'next' },
  });
  expect(ref.current!.findNode('/a')!.value).toBe('next');
});

it('recovers a throwing frame when the selected frame changes', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const Broken = () => {
    throw new Error('frame');
  };
  const Healthy = ({ children }: InputRendererProps) => (
    <section>{children}</section>
  );
  const props = { jsonSchema: { type: 'string' as const }, validationMode: 0 };
  const view = render(<Form {...props} InputRenderer={Broken} />);
  expect(view.container.querySelector('input')).toBeNull();
  view.rerender(<Form {...props} InputRenderer={Healthy} />);
  expect(view.container.querySelector('input')).not.toBeNull();
});

it.each([false, true])(
  'handles an error-only delivery after a child-deferred Refresh (controlled: %s)',
  (controlled) => {
    const ref = createRef<FormHandle>();
    const renders = vi.fn();
    const Container = ({ ChildFields }: FieldInputProps) => {
      renders();
      const [visible, setVisible] = useState(true);
      return (
        <section>
          <button onClick={() => setVisible(false)}>hide children</button>
          {visible && ChildFields.map((Child) => <Child key={Child.key} />)}
        </section>
      );
    };
    const view = render(
      <Form
        ref={ref}
        jsonSchema={{ type: 'object', properties: { a: { type: 'string' } } }}
        validationMode={0}
        fieldInputDefinitions={[
          { test: { type: 'object' }, Component: Container, controlled },
        ]}
      />,
    );
    const node = ref.current!.node!;
    const initial = view.container.querySelector('section');
    act(() => ref.current!.refresh());
    fireEvent.click(view.getByText('hide children'));
    const calls = renders.mock.calls.length;
    act(() => node.setExternalErrors([{ dataPath: '', message: 'wake' }]));
    expect(renders).toHaveBeenCalledTimes(calls + (controlled ? 0 : 1));
    expect(view.container.querySelector('section') === initial).toBe(
      controlled,
    );
    const after = renders.mock.calls.length;
    act(() => node.setExternalErrors([{ dataPath: '', message: 'next' }]));
    expect(renders).toHaveBeenCalledTimes(after);
  },
);
