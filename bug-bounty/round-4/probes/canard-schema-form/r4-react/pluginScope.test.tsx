import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  ErrorVisibility,
  type FieldRendererProps,
  Form,
  FormProvider,
  type SchemaFormPlugin,
  ValidationMode,
  registerPlugin,
} from '@/schema-form';

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

/**
 * FP4 / quality bar "failures surface": a plugin whose value is a class instance satisfies
 * SchemaFormPlugin, and registerPlugin documents @throws for a failed registration.
 */
it('registerPlugin applies a class-instance plugin or reports that it did not', () => {
  class MarkedPlugin implements SchemaFormPlugin {
    FieldRenderer = createMarkedRenderer('class-plugin');
  }
  let thrown: unknown;
  try {
    registerPlugin(new MarkedPlugin());
  } catch (error) {
    thrown = error;
  }
  render(<Form jsonSchema={schema} validationMode={ValidationMode.None} />);
  expect({ applied: owners(), thrown: thrown !== undefined }).not.toEqual({
    applied: [],
    thrown: false,
  });
});

it('registerPlugin applies a plugin module namespace or reports that it did not', async () => {
  const pluginModule = await import('./markedPluginModule');
  const plugin: SchemaFormPlugin = pluginModule;
  let thrown: unknown;
  try {
    registerPlugin(plugin);
  } catch (error) {
    thrown = error;
  }
  render(<Form jsonSchema={schema} validationMode={ValidationMode.None} />);
  expect({ applied: owners(), thrown: thrown !== undefined }).not.toEqual({
    applied: [],
    thrown: false,
  });
});

it('control: the same renderer in a plain object plugin is applied', () => {
  registerPlugin({ FieldRenderer: createMarkedRenderer('plain-plugin') });
  render(<Form jsonSchema={schema} validationMode={ValidationMode.None} />);
  expect(owners()).toEqual(['plain-plugin']);
  expect(screen.getByRole('textbox')).toBeTruthy();
});
