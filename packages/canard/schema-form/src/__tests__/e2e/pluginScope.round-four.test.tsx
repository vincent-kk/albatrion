import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  ErrorVisibility,
  type FieldRendererProps,
  Form,
  FormProvider,
  ValidationMode,
  registerPlugin,
} from '../../index';

afterEach(() => {
  cleanup();
  registerPlugin(null);
});

const schema = {
  type: 'object',
  properties: { name: { type: 'string' } },
} as const;

/** A renderer that marks every field it draws with the owner's name. */
const createMarkedRenderer = (owner: string) =>
  function MarkedRenderer({ Input, depth }: FieldRendererProps) {
    return (
      <div data-owner={owner} data-depth={depth}>
        <Input />
      </div>
    );
  };

const owners = () =>
  [
    ...new Set(
      [...document.querySelectorAll('[data-owner]')].map((element) =>
        element.getAttribute('data-owner'),
      ),
    ),
  ].sort();

/**
 * IN3 / RG1 (round 3 item 13): a section-level FormProvider without pluginScope inside the
 * application's scoped FormProvider. With unscoped registration the same layout keeps the plugin
 * renderer (control below), so opting into the documented isolation must not change it.
 */
it('control: a nested FormProvider without settings keeps the unscoped plugin renderer', () => {
  registerPlugin({ FieldRenderer: createMarkedRenderer('app') });
  render(
    <FormProvider>
      <FormProvider errorVisibility={ErrorVisibility.Always}>
        <Form jsonSchema={schema} validationMode={ValidationMode.None} />
      </FormProvider>
    </FormProvider>,
  );
  expect(owners()).toEqual(['app']);
});

it('a nested FormProvider without pluginScope keeps the application scope selected by the outer FormProvider', () => {
  const scope = Symbol('application-a');
  registerPlugin({ FieldRenderer: createMarkedRenderer('app-a') }, { scope });
  // Another application on the page registers without a scope.
  registerPlugin({ FieldRenderer: createMarkedRenderer('other-app') });
  render(
    <FormProvider pluginScope={scope}>
      <FormProvider errorVisibility={ErrorVisibility.Always}>
        <Form jsonSchema={schema} validationMode={ValidationMode.None} />
      </FormProvider>
    </FormProvider>,
  );
  expect(owners()).toEqual(['app-a']);
});

it('a nested FormProvider without pluginScope keeps the scoped validator', async () => {
  const scope = Symbol('application-b');
  const calls: string[] = [];
  const createValidator = (owner: string) => ({
    compile: () => {
      calls.push(owner);
      return () => null;
    },
    compileGuard: () => () => true,
  });
  registerPlugin({ validator: createValidator('app-b') }, { scope });
  registerPlugin({ validator: createValidator('other-app') });
  render(
    <FormProvider pluginScope={scope}>
      <FormProvider validationMode={ValidationMode.OnRequest}>
        <Form
          jsonSchema={{
            type: 'object',
            properties: { name: { type: 'string', minLength: 3 } },
          }}
          ref={(handle) => {
            void handle?.validate();
          }}
        />
      </FormProvider>
    </FormProvider>,
  );
  await vi.waitFor(() => expect(calls.length).toBeGreaterThan(0));
  expect([...new Set(calls)]).toEqual(['app-b']);
});
