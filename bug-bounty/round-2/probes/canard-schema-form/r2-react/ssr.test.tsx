import { StrictMode, type ReactElement, createRef } from 'react';

import { act } from '@testing-library/react';
import { type Root, hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import {
  type FieldInputProps,
  Form,
  type FormHandle,
  FormProvider,
  ValidationMode,
  useChildFieldErrors,
  useChildFieldMap,
} from '@/schema-form';

let container: HTMLDivElement;
let root: Root | undefined;
let recoverable: string[];
let consoleErrors: string[];

beforeEach(() => {
  container = document.createElement('div');
  document.body.append(container);
  recoverable = [];
  consoleErrors = [];
  vi.spyOn(console, 'error').mockImplementation((...args) => {
    consoleErrors.push(args.map((a) => String(a).split('\n')[0]).join(' '));
  });
});

afterEach(async () => {
  await act(async () => root?.unmount());
  root = undefined;
  container.remove();
  vi.restoreAllMocks();
});

const norm = (h: string) => h.replaceAll(' value=""', '');

const hydrate = async (element: ReactElement) => {
  container.innerHTML = renderToString(element);
  const serverHtml = container.innerHTML;
  consoleErrors.length = 0;
  await act(async () => {
    root = hydrateRoot(container, element, {
      onRecoverableError: (error) =>
        recoverable.push(String(error).split('\n')[0]),
    });
  });
  return serverHtml;
};

const richSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', default: 'n', minLength: 5 },
    age: { type: 'number', default: 3 },
    agree: { type: 'boolean', default: true },
    color: { type: 'string', enum: ['r', 'g', 'b'], default: 'g' },
    u: { type: ['string', 'number'], default: 7 },
    maybe: { type: ['string', 'null'], default: null },
    list: {
      type: 'array',
      items: { type: 'string' },
      default: ['a', 'b'],
    },
    kind: { type: 'string', enum: ['x', 'y'], default: 'y' },
    xOnly: {
      type: 'string',
      default: 'xo',
      controls: { active: '../kind === "x"' },
    },
    yOnly: {
      type: 'string',
      default: 'yo',
      controls: { visible: '../kind === "y"' },
    },
    nested: {
      type: 'object',
      properties: { deep: { type: 'string', default: 'd' } },
    },
  },
} as const;

it.for([false, true])(
  'auto-rendered rich form hydrates without mismatch (StrictMode=%s)',
  async (strict) => {
    const ref = createRef<FormHandle>();
    const form = (
      <Form
        ref={ref}
        jsonSchema={richSchema as any}
        defaultValue={{ name: 'server' }}
      />
    );
    const html = await hydrate(strict ? <StrictMode>{form}</StrictMode> : form);
    expect({ recoverable, consoleErrors }).toEqual({
      recoverable: [],
      consoleErrors: [],
    });
    expect(norm(container.innerHTML)).toBe(norm(html));
    expect(ref.current!.getValue()).toMatchObject({
      name: 'server',
      age: 3,
      agree: true,
      list: ['a', 'b'],
    });
  },
);

const ChildErrorsInput = ({ node, ChildFields }: FieldInputProps) => {
  const errors = useChildFieldErrors(node);
  const map = useChildFieldMap(node);
  return (
    <section>
      <span data-testid="count">{String(errors.length)}</span>
      <span data-testid="keys">{Object.keys(map ?? {}).join(',')}</span>
      {ChildFields?.map((C) => <C key={C.key} />)}
    </section>
  );
};


it.for([false, true])(
  'composed layout with Form.Render, function children and errors prop hydrates (StrictMode=%s)',
  async (strict) => {
    const form = (
      <FormProvider>
        <Form
          jsonSchema={richSchema as any}
          errors={[
            {
              dataPath: '/name',
              keyword: 'x',
              message: 'server error',
            } as any,
          ]}
          validationMode={ValidationMode.None}
        >
          {({ value, errors }) => (
            <div>
              <Form.Label path="/name" />
              <Form.Input path="/name" />
              <Form.ErrorMessage path="/name" />
              <Form.Render path="/age">
                {({ Input, value: v }) => (
                  <div className="r">
                    <Input />
                    <b>{String(v)}</b>
                  </div>
                )}
              </Form.Render>
              <Form.Field path="/list" />
              <Form.Field path="/nested" FieldInput={ChildErrorsInput} />
              <pre>{JSON.stringify(value)}</pre>
              <i>{String(errors?.length)}</i>
            </div>
          )}
        </Form>
      </FormProvider>
    );
    const html = await hydrate(strict ? <StrictMode>{form}</StrictMode> : form);
    expect({ recoverable, consoleErrors }).toEqual({
      recoverable: [],
      consoleErrors: [],
    });
    expect(norm(container.innerHTML)).toBe(norm(html));
  },
);

it('readOnly/disabled form hydrates', async () => {
  const form = (
    <Form jsonSchema={richSchema as any} readOnly disabled />
  );
  const html = await hydrate(form);
  expect({ recoverable, consoleErrors }).toEqual({
    recoverable: [],
    consoleErrors: [],
  });
  expect(norm(container.innerHTML)).toBe(norm(html));
});

it.for([false, true])(
  'hydrated inputs accept typing, report onChange and keep the server DOM nodes (StrictMode=%s)',
  async (strict) => {
    const ref = createRef<FormHandle>();
    const changes: unknown[] = [];
    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string', default: 'n' },
        list: { type: 'array', items: { type: 'string' }, default: ['a'] },
      },
    } as const;
    const form = (
      <Form
        ref={ref}
        jsonSchema={schema}
        validationMode={ValidationMode.None}
        onChange={(v) => changes.push(v)}
      />
    );
    await hydrate(strict ? <StrictMode>{form}</StrictMode> : form);
    const input = container.querySelector('input[id="/name"]') as HTMLInputElement;
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    await user.type(input, 'X');
    expect(container.querySelector('input[id="/name"]')).toBe(input);
    expect(ref.current!.getValue()).toEqual({ name: 'nX', list: ['a'] });
    expect(changes.at(-1)).toEqual({ name: 'nX', list: ['a'] });
    await user.click(container.querySelector('button[title="add item"]')!);
    expect(container.querySelectorAll('input[id^="/list/"]')).toHaveLength(2);
    expect({ recoverable, consoleErrors }).toEqual({
      recoverable: [],
      consoleErrors: [],
    });
  },
);

it.for([false, true])(
  'hydration reports the same mount callbacks as a client mount (StrictMode=%s)',
  async (strict) => {
    const { registerPlugin } = await import('@/schema-form');
    const { createRenderValidator } = await import(
      '../../__tests__/helpers/createRenderValidator'
    );
    registerPlugin({ validator: createRenderValidator() });
    const schema = {
      type: 'object',
      properties: { name: { type: 'string', minLength: 3, default: 'n' } },
    } as const;
    const run = async (mode: 'hydrate' | 'client') => {
      const log: string[] = [];
      const form = (
        <Form
          jsonSchema={schema}
          validationMode={ValidationMode.OnChange}
          onChange={() => log.push('change')}
          onValidate={(e) => log.push(`validate:${e.length}`)}
          onStateChange={() => log.push('state')}
        />
      );
      const element = strict ? <StrictMode>{form}</StrictMode> : form;
      if (mode === 'hydrate') await hydrate(element);
      else {
        const { createRoot } = await import('react-dom/client');
        await act(async () => {
          root = createRoot(container);
          root.render(element);
        });
      }
      await act(async () => {
        await new Promise((r) => setTimeout(r, 250));
      });
      await act(async () => root?.unmount());
      root = undefined;
      container.innerHTML = '';
      return log;
    };
    const client = await run('client');
    const hydrated = await run('hydrate');
    expect(hydrated).toEqual(client);
  },
);
