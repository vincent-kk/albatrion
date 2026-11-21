import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, FormProvider, registerPlugin } from '../../index';
import type { FieldInputProps, FormHandle } from '../../index';

const first = Symbol('first');
const second = 'round-three-second';
const InputA = ({ inputId }: FieldInputProps) => <input id={inputId} data-scope="a" />;
const InputB = ({ inputId }: FieldInputProps) => <input id={inputId} data-scope="b" />;
const InputGlobal = ({ inputId }: FieldInputProps) => (
  <input id={inputId} data-scope="global" />
);
const schema = { type: 'string' } as const;
const definition = (Component: typeof InputA) => ({
  fieldInputDefinitions: [{ test: { type: 'string' as const }, Component }],
});
afterEach(() => {
  cleanup();
  registerPlugin(null);
  registerPlugin(null, { scope: first });
  registerPlugin(null, { scope: second });
});

it('round-3: scoped applications select independent inputs while unscoped forms keep the shared registry', () => {
  registerPlugin(definition(InputGlobal));
  registerPlugin(definition(InputA), { scope: first });
  registerPlugin(definition(InputB), { scope: second });
  const view = render(
    <>
      <Form jsonSchema={schema} />
      <FormProvider pluginScope={first}>
        <Form jsonSchema={schema} />
      </FormProvider>
      <FormProvider pluginScope={second}>
        <Form jsonSchema={schema} />
      </FormProvider>
    </>,
  );
  expect(
    Array.from(
      view.container.querySelectorAll('input'),
      (input) => input.dataset.scope,
    ),
  ).toEqual(['global', 'a', 'b']);
});
it('round-3: resetting one scope preserves the others and permits its plugin to register again', () => {
  const plugin = definition(InputA);
  registerPlugin(plugin, { scope: first });
  registerPlugin(definition(InputB), { scope: second });
  registerPlugin(null, { scope: first });
  registerPlugin(plugin, { scope: first });
  const view = render(
    <>
      <FormProvider pluginScope={first}>
        <Form jsonSchema={schema} />
      </FormProvider>
      <FormProvider pluginScope={second}>
        <Form jsonSchema={schema} />
      </FormProvider>
    </>,
  );
  expect(
    Array.from(
      view.container.querySelectorAll('input'),
      (input) => input.dataset.scope,
    ),
  ).toEqual(['a', 'b']);
});
it('round-3: scope changes select the new input through the existing contexts', () => {
  registerPlugin(definition(InputA), { scope: first });
  registerPlugin(definition(InputB), { scope: second });
  const view = render(
    <FormProvider pluginScope={first}>
      <Form jsonSchema={schema} />
    </FormProvider>,
  );
  view.rerender(
    <FormProvider pluginScope={second}>
      <Form jsonSchema={schema} />
    </FormProvider>,
  );
  expect(view.container.querySelector('input')?.dataset.scope).toBe('b');
});

it('round-3: scoped renderers and validators come from the same isolated registry', async () => {
  const Label = () => <label>application label</label>;
  const Frame = ({ children }: { children?: import('react').ReactNode }) => (
    <section data-application-frame>{children}</section>
  );
  registerPlugin(
    {
      LabelRenderer: Label,
      InputRenderer: Frame,
      validator: {
        compile: () => () => [{ dataPath: '/value', keyword: 'scoped' }],
        compileGuard: () => () => true,
      },
    },
    { scope: first },
  );
  const ref = createRef<FormHandle>();
  const view = render(
    <FormProvider pluginScope={first}>
      <Form
        ref={ref}
        jsonSchema={{
          type: 'object',
          properties: { value: { type: 'string', title: 'Scoped' } },
        }}
      />
    </FormProvider>,
  );
  expect(view.container.querySelector('label')?.textContent).toBe(
    'application label',
  );
  expect(
    view.container.querySelector('[data-application-frame] input'),
  ).not.toBeNull();
  await act(async () => {
    await ref.current?.validate();
  });
  expect(
    ref.current?.findNode('/value')?.errors.map((issue) => issue.keyword),
  ).toEqual(['scoped']);
});
