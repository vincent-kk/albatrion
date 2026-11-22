import { createRef } from 'react';

import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import {
  ErrorVisibility,
  Form,
  type FormHandle,
  FormProvider,
  ValidationMode,
  registerPlugin,
} from '../../index';
import { LabelRenderer, validator } from '../fixtures/structuralPlugin';

const schema = {
  type: 'object',
  properties: { value: { type: 'string', title: 'Title' } },
} as const;
const scope = Symbol('registration contracts');

afterEach(() => {
  cleanup();
  registerPlugin(null, { scope });
});

it('a rejected plugin leaves the scoped label, validator and formatter installed', async () => {
  const PreviousLabel = () => <label>Previous label</label>;
  const previousValidator = {
    compile: () => () => [{ dataPath: '/value', keyword: 'previous' }],
    compileGuard: () => () => true,
  };
  registerPlugin(
    {
      LabelRenderer: PreviousLabel,
      validator: previousValidator,
      formatError: () => 'Previous formatter',
    },
    { scope },
  );

  const broken = {
    LabelRenderer,
    validator,
    formatError: () => 'Rejected formatter',
    fieldInputDefinitions: [null],
  };
  expect(() =>
    Reflect.apply(registerPlugin, undefined, [broken, { scope }]),
  ).toThrow();

  const ref = createRef<FormHandle>();
  render(
    <FormProvider pluginScope={scope}>
      <Form
        ref={ref}
        jsonSchema={schema}
        errorVisibility={ErrorVisibility.Always}
        validationMode={ValidationMode.OnRequest}
      />
    </FormProvider>,
  );
  expect(screen.getByText('Previous label')).toBeDefined();
  expect(screen.queryByText('Registered label')).toBeNull();

  await act(() => ref.current!.validate());
  expect(ref.current!.getErrors().map((issue) => issue.keyword)).toEqual([
    'previous',
  ]);
  expect(screen.getByText('Previous formatter')).toBeDefined();
  expect(screen.queryByText('Rejected formatter')).toBeNull();
});

it.each(['class', 'namespace'] as const)(
  'applies the public plugin surface from a %s',
  async (kind) => {
    class Plugin {
      get LabelRenderer() {
        return LabelRenderer;
      }

      get validator() {
        return validator;
      }
    }

    const plugin =
      kind === 'class'
        ? new Plugin()
        : await import('../fixtures/structuralPlugin');
    registerPlugin(plugin, { scope });
    const ref = createRef<FormHandle>();
    render(
      <FormProvider pluginScope={scope}>
        <Form
          ref={ref}
          jsonSchema={schema}
          errorVisibility={ErrorVisibility.Always}
          validationMode={ValidationMode.OnRequest}
        />
      </FormProvider>,
    );
    expect(screen.getByText('Registered label')).toBeDefined();
    await act(() => ref.current!.validate());
    expect(ref.current!.getErrors().map((issue) => issue.keyword)).toEqual([
      'registered',
    ]);
  },
);

it('a scoped registry retains registration after its provider unmounts', () => {
  registerPlugin({ LabelRenderer }, { scope });
  const form = () => (
    <FormProvider pluginScope={scope}>
      <Form jsonSchema={schema} validationMode={ValidationMode.None} />
    </FormProvider>
  );
  const first = render(form());
  expect(screen.getByText('Registered label')).toBeDefined();
  first.unmount();
  render(form());
  expect(screen.getByText('Registered label')).toBeDefined();
});
