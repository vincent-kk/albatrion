import {
  type ComponentType,
  StrictMode,
  createRef,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, inject, it, vi } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';
import * as core from '@/schema-form/core';
import { FormWarningCode } from '@/schema-form/errors';
import {
  type FormErrorService,
  useFormErrorContext,
} from '@/schema-form/providers/FormErrorContext';
import type { FieldInputProps } from '@/schema-form/types';
import type { JSONSchema } from '@/schema-form/types';

/** An object made terminal by an inline input: the one shape whose empty child list is a mistake to read (round 180). */
const detectable = (Input: ComponentType<FieldInputProps>) =>
  ({
    type: 'object',
    properties: { leaf: { type: 'string' } },
    presentation: { FieldInput: Input },
  }) satisfies JSONSchema;

afterEach(() => {
  vi.unstubAllEnvs();
  cleanup();
  vi.restoreAllMocks();
});

it.each([
  ['react', 'rebuild', 'read-before'],
  ['native', 'rebuild', 'read-before'],
  ['react', 'rebuild', 'read-after'],
  ['react', 'reset', 'read-before'],
  ['native', 'reset', 'read-before'],
] as const)(
  'DR-15 keeps delayed warning ownership (%s, %s, %s)',
  async (event, operation, order) => {
    const ref = createRef<FormHandle>();
    const onError = vi.fn();
    let service: FormErrorService | undefined;
    const readScopes: object[] = [];
    let clicks = 0;
    const Input = ({ ChildFields }: FieldInputProps) => {
      const reporter = useFormErrorContext();
      service = reporter;
      const button = useRef<HTMLButtonElement>(null);
      const click = useCallback(() => {
        clicks++;
        if (clicks === 1 && order === 'read-after') ref.current![operation]();
        readScopes.push(reporter!.warningScope);
        void ChildFields.length;
        if (clicks === 1 && order === 'read-before') ref.current![operation]();
      }, [ChildFields, reporter]);
      useLayoutEffect(() => {
        const element = button.current;
        if (event !== 'native' || !element) return;
        element.addEventListener('click', click);
        return () => element.removeEventListener('click', click);
      }, [click]);
      return (
        <button
          ref={button}
          type="button"
          onClick={event === 'react' ? click : undefined}
        >
          DR-15 read
        </button>
      );
    };
    const view = render(
      <StrictMode>
        <Form
          ref={ref}
          validationMode={0}
          jsonSchema={detectable(Input)}
          onError={onError}
        />
      </StrictMode>,
    );
    if (!service) throw new Error('Expected instance reporter');
    const reports = vi.spyOn(service, 'reportInLoad');
    const warnings = () =>
      onError.mock.calls.filter(
        ([record]) =>
          record.code === FormWarningCode.ChildNodeComponentsOnTerminal,
      );
    await act(async () => {
      fireEvent.click(view.getByText('DR-15 read'));
      await Promise.resolve();
    });
    expect.soft(warnings()).toHaveLength(operation === 'reset' ? 1 : 0);
    await act(async () => {
      fireEvent.click(view.getByText('DR-15 read'));
      await Promise.resolve();
    });
    expect(warnings()).toHaveLength(operation === 'reset' ? 2 : 1);
    expect(reports.mock.calls.map(([, scope]) => scope)).toEqual(
      operation === 'reset' ? readScopes : [readScopes[1]],
    );
  },
);

it.skipIf(inject('reactMajor') !== '18')(
  'DR-15 gate legacy root preserves each original warning scope under StrictMode',
  async () => {
    for (const operation of ['reset', 'rebuild'] as const) {
      const ref = createRef<FormHandle>();
      const onError = vi.fn();
      const scopes: object[] = [];
      let service: FormErrorService | undefined;
      let clicks = 0;
      const Input = ({ ChildFields }: FieldInputProps) => {
        const reporter = useFormErrorContext();
        service = reporter;
        return (
          <button
            type="button"
            onClick={() => {
              scopes.push(reporter!.warningScope);
              void ChildFields.length;
              if (clicks++ === 0) ref.current![operation]();
            }}
          >
            legacy scope read
          </button>
        );
      };
      const view = render(
        <StrictMode>
          <Form
            ref={ref}
            jsonSchema={detectable(Input)}
            validationMode={0}
            onError={onError}
          />
        </StrictMode>,
        { legacyRoot: true },
      );
      if (!service) throw new Error('Expected reporter');
      const reports = vi.spyOn(service, 'reportInLoad');
      await act(async () => {
        fireEvent.click(view.getByText('legacy scope read'));
        await Promise.resolve();
      });
      expect(onError).toHaveBeenCalledTimes(operation === 'reset' ? 1 : 0);
      await act(async () => {
        fireEvent.click(view.getByText('legacy scope read'));
        await Promise.resolve();
      });
      expect(onError).toHaveBeenCalledTimes(operation === 'reset' ? 2 : 1);
      expect(reports.mock.calls.map(([, scope]) => scope)).toEqual(
        operation === 'reset' ? scopes : [scopes[1]],
      );
      view.unmount();
    }
  },
);

it('DR-15 failed rebuild keeps the root and permits the next warning in the renewed scope', async () => {
  const ref = createRef<FormHandle>();
  const onError = vi.fn();
  let reads = 0;
  const Input = ({ ChildFields }: FieldInputProps) => (
    <button
      type="button"
      onClick={() => {
        void ChildFields.length;
        if (reads++ === 0) ref.current!.rebuild();
      }}
    >
      failed rebuild read
    </button>
  );
  const view = render(
    <Form
      ref={ref}
      validationMode={0}
      jsonSchema={detectable(Input)}
      onError={onError}
    />,
  );
  const root = ref.current!.node;
  vi.spyOn(core, 'buildFieldNodeTree').mockImplementationOnce(() => {
    throw new Error('failed reconstruction');
  });
  await act(async () => {
    fireEvent.click(view.getByText('failed rebuild read'));
    await Promise.resolve();
  });
  expect(ref.current!.node).toBe(root);
  await act(async () => {
    fireEvent.click(view.getByText('failed rebuild read'));
    await Promise.resolve();
  });
  expect(
    onError.mock.calls.filter(
      ([record]) =>
        record.code === FormWarningCode.ChildNodeComponentsOnTerminal,
    ),
  ).toHaveLength(2);
});

it('DR-15 preserves development warning delivery after unmount', async () => {
  const onError = vi.fn();
  let read: () => void = () => {};
  const Input = ({ ChildFields }: FieldInputProps) => {
    read = () => {
      void ChildFields.length;
    };
    return <input />;
  };
  const view = render(
    <Form
      validationMode={0}
      jsonSchema={detectable(Input)}
      onError={onError}
    />,
  );
  view.unmount();
  await act(async () => {
    read();
    await Promise.resolve();
  });
  expect(
    onError.mock.calls.filter(
      ([record]) =>
        record.code === FormWarningCode.ChildNodeComponentsOnTerminal,
    ),
  ).toHaveLength(1);
});

it('round 180 hands a production build a plain empty list even with an error handler', async () => {
  vi.stubEnv('NODE_ENV', 'production');
  const onError = vi.fn();
  const lists: unknown[] = [];
  const Input = ({ ChildFields }: FieldInputProps) => {
    lists.push(ChildFields);
    return <input data-count={ChildFields.length} />;
  };
  render(
    <Form
      validationMode={0}
      jsonSchema={detectable(Input)}
      onError={onError}
    />,
  );
  await act(async () => {
    await Promise.resolve();
  });
  vi.unstubAllEnvs();
  const plain: unknown[] = [];
  const PlainInput = ({ ChildFields }: FieldInputProps) => {
    plain.push(ChildFields);
    return <input data-count={ChildFields.length} />;
  };
  render(
    <Form
      validationMode={0}
      jsonSchema={{
        type: 'string',
        presentation: { FieldInput: PlainInput },
      }}
      onError={onError}
    />,
  );
  expect(lists[0]).toBe(plain[0]);
  expect(onError).not.toHaveBeenCalled();
});

it('round 180 hands a string node a plain empty list in development', async () => {
  const onError = vi.fn();
  const Input = ({ ChildFields }: FieldInputProps) => (
    <input data-count={ChildFields.length} />
  );
  render(
    <Form
      validationMode={0}
      jsonSchema={{ type: 'string', presentation: { FieldInput: Input } }}
      onError={onError}
    />,
  );
  await act(async () => {
    await Promise.resolve();
  });
  expect(onError).not.toHaveBeenCalled();
});

it('ERROR-202 reports a terminal input first reading children in an event after mount', async () => {
  const onError = vi.fn();
  const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const Input = ({ ChildFields }: FieldInputProps) => (
    <button
      onClick={() => {
        void ChildFields.length;
      }}
    >
      Read children
    </button>
  );
  const view = render(
    <Form
      validationMode={0}
      jsonSchema={detectable(Input)}
      onError={onError}
    />,
  );
  expect(onError).not.toHaveBeenCalled();
  fireEvent.click(view.getByText('Read children'));
  await act(async () => {
    await Promise.resolve();
  });
  expect(
    onError.mock.calls.filter(
      ([record]) =>
        record.code === 'SCHEMA_FORM_WARNING.CHILD_NODE_COMPONENTS_ON_TERMINAL',
    ),
  ).toHaveLength(1);
  fireEvent.click(view.getByText('Read children'));
  await act(async () => {
    await Promise.resolve();
  });
  expect(onError).toHaveBeenCalledTimes(1);
  expect(warning).not.toHaveBeenCalled();
});

it('ERROR-202 reports a child layout read after the initial render', () => {
  const onError = vi.fn();
  const Input = ({ ChildFields }: FieldInputProps) => {
    useLayoutEffect(() => {
      void ChildFields[0];
    }, [ChildFields]);
    return <input />;
  };
  render(
    <Form
      validationMode={0}
      jsonSchema={detectable(Input)}
      onError={onError}
    />,
  );
  expect(onError.mock.calls.map(([record]) => record.code)).toEqual([
    'SCHEMA_FORM_WARNING.CHILD_NODE_COMPONENTS_ON_TERMINAL',
  ]);
});

it('ERROR-202 keeps the terminal empty list stable across a late render read', async () => {
  const onError = vi.fn();
  const lists: unknown[] = [];
  const Input = ({ ChildFields }: FieldInputProps) => {
    const [read, setRead] = useState(false);
    lists.push(ChildFields);
    return (
      <button onClick={() => setRead(true)}>
        {read ? ChildFields.length : 'Later'}
      </button>
    );
  };
  render(
    <Form
      validationMode={0}
      jsonSchema={detectable(Input)}
      onError={onError}
    />,
  );
  fireEvent.click(document.querySelector('button')!);
  await act(async () => {
    await Promise.resolve();
  });
  expect(lists[0]).toBe(lists[1]);
  expect(onError.mock.calls.map(([record]) => record.code)).toEqual([
    'SCHEMA_FORM_WARNING.CHILD_NODE_COMPONENTS_ON_TERMINAL',
  ]);
});

it('ERROR-202 reports the first terminal child read again after a retained-root reset starts a new load', async () => {
  const ref = createRef<FormHandle>();
  const onError = vi.fn();
  const Input = ({ ChildFields }: FieldInputProps) => (
    <input data-count={ChildFields.length} />
  );
  render(
    <Form
      ref={ref}
      validationMode={0}
      jsonSchema={detectable(Input)}
      defaultValue="value"
      onError={onError}
    />,
  );
  const warnings = () =>
    onError.mock.calls.filter(
      ([record]) =>
        record.code === 'SCHEMA_FORM_WARNING.CHILD_NODE_COMPONENTS_ON_TERMINAL',
    ).length;
  expect(warnings()).toBe(1);
  const root = ref.current!.node;
  act(() => ref.current!.reset());
  await act(async () => {
    await Promise.resolve();
  });
  expect(ref.current!.node).toBe(root);
  expect(warnings()).toBe(2);
  act(() => ref.current!.setValue('next'));
  await act(async () => {
    await Promise.resolve();
  });
  expect(warnings()).toBe(2);
});
