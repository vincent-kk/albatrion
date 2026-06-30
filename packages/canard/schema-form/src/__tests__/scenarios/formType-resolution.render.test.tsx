import type { FC } from 'react';

import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';

import type { JsonSchema } from '@winglet/json-schema';

import type {
  FormTypeInputDefinition,
  FormTypeInputMap,
  FormTypeInputProps,
  FormTypeRendererProps,
} from '@/schema-form';
import { Form } from '@/schema-form';

import { renderForm } from '../renderForm';

/**
 * FormTypeInput resolution + custom rendering — node-tree vs rendered-DOM.
 *
 * Focus (mirrors stories 03 / 25 / 33 / 12):
 *  - Selection priority: inline schema `FormTypeInput`  >  `formTypeInputMap`
 *    (by path) >  Form-level `formTypeInputDefinitions`  >  plugin fallback
 *    (see useFormTypeInput.ts — inline returns immediately, map is tested before
 *    definitions).
 *  - `formTypeInputMap` path matching: exact JSONPointer, `*` wildcard segments
 *    (array indices AND object keys).
 *  - `CustomFormTypeRenderer` / `FormTypeRenderer` wrapping the resolved `Input`
 *    and surfacing `name` / `errorMessage` as ReactNode.
 *  - `Form.Render` custom layout addressed by JSONPointer, including its
 *    `FormTypeInput` prop override and the render-prop bag (`value`, `node`,
 *    `path`).
 *
 * Every case asserts BOTH layers: which component actually rendered in the DOM
 * (via a `data-variant` marker + the harness `field`/`exists`/`value`) AND the
 * node tree (`node(path).value` / `getValue()` / `getErrors()`).
 *
 * Inputs are uncontrolled (defaultValue + onChange) so DOM value reads also
 * exercise the seed-at-mount path; user typing drives the node tree.
 */

// A type-aware uncontrolled input that stamps which resolution path produced it.
const makeInput =
  (variant: string): FC<FormTypeInputProps<any>> =>
  (props) => (
    <input
      id={props.path}
      data-variant={variant}
      defaultValue={props.value?.toString() ?? ''}
      onChange={(e) => props.onChange?.(e.target.value)}
    />
  );

const variantOf = (
  form: { field: (p: string) => HTMLElement | null },
  path: string,
): string | null => form.field(path)?.getAttribute('data-variant') ?? null;

// Renderer mirroring stories/33 — wraps the resolved Input, exposes name +
// errorMessage as ReactNode. Identifies each wrapper with a data attribute.
const WrapRenderer = (props: FormTypeRendererProps) => {
  const { Input, name, path, errorMessage, depth, node } = props;
  if (depth === 0) return <Input />;
  if (node.group === 'branch')
    return (
      <fieldset data-branch={path}>
        <legend>{name}</legend>
        <Input />
      </fieldset>
    );
  return (
    <div data-field={path}>
      <label htmlFor={path}>{name}</label>
      <Input />
      {errorMessage ? <em>{errorMessage}</em> : null}
    </div>
  );
};

const stringDefs: FormTypeInputDefinition[] = [
  { test: { type: 'string' }, Component: makeInput('def') },
];

describe('formType-resolution — selection priority', () => {
  it('inline schema FormTypeInput wins over formTypeInputMap and definitions', async () => {
    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string', FormTypeInput: makeInput('inline') },
      },
    } satisfies JsonSchema;

    const form = await renderForm(schema, {
      defaultValue: { name: 'neo' },
      formTypeInputMap: { '/name': makeInput('map') } as FormTypeInputMap,
      formTypeInputDefinitions: stringDefs,
    });

    // DOM: the inline component is the one that rendered.
    expect(form.exists('/name')).toBe(true);
    expect(variantOf(form, '/name')).toBe('inline');
    expect(form.value('/name')).toBe('neo');

    // Tree agrees, and onChange from the chosen component reaches the tree.
    expect(form.node('/name')?.value).toBe('neo');
    await form.type('/name', 'trinity');
    expect(form.node('/name')?.value).toBe('trinity');
    expect(form.getValue()).toEqual({ name: 'trinity' });
  });

  it('formTypeInputMap wins over Form-level definitions for the same path', async () => {
    const schema = {
      type: 'object',
      properties: { name: { type: 'string' } },
    } satisfies JsonSchema;

    const form = await renderForm(schema, {
      defaultValue: { name: 'morpheus' },
      formTypeInputMap: { '/name': makeInput('map') } as FormTypeInputMap,
      formTypeInputDefinitions: stringDefs,
    });

    expect(variantOf(form, '/name')).toBe('map');
    expect(form.value('/name')).toBe('morpheus');
    expect(form.node('/name')?.value).toBe('morpheus');
  });

  it('falls back to definitions when no formTypeInputMap path matches', async () => {
    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
      },
    } satisfies JsonSchema;

    const form = await renderForm(schema, {
      defaultValue: { name: 'a', email: 'b' },
      formTypeInputMap: { '/name': makeInput('map') } as FormTypeInputMap,
      formTypeInputDefinitions: stringDefs,
    });

    // Mapped path uses the map; the unmapped sibling falls through to defs.
    expect(variantOf(form, '/name')).toBe('map');
    expect(variantOf(form, '/email')).toBe('def');
    expect(form.node('/email')?.value).toBe('b');
    expect(form.getValue()).toEqual({ name: 'a', email: 'b' });
  });

  it('inline FormTypeInput===null suppresses the input but keeps the node', async () => {
    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string', FormTypeInput: null as any },
        age: { type: 'number' },
      },
    } satisfies JsonSchema;

    const form = await renderForm(schema, {
      defaultValue: { name: 'hidden-input', age: 7 },
      formTypeInputDefinitions: [
        ...stringDefs,
        { test: { type: 'number' }, Component: makeInput('num') },
      ],
    });

    // DOM: node wrapper still present, but no input is rendered for it.
    expect(form.exists('/name')).toBe(true);
    expect(form.field('/name')).toBeNull();
    // Sibling still resolves normally.
    expect(variantOf(form, '/age')).toBe('num');

    // Tree: value is unaffected by the missing input.
    expect(form.node('/name')?.value).toBe('hidden-input');
    expect(form.getValue()).toEqual({ name: 'hidden-input', age: 7 });
  });
});

describe('formType-resolution — formTypeInputMap by path', () => {
  it('matches an exact nested JSONPointer and leaves siblings to definitions', async () => {
    const schema = {
      type: 'object',
      properties: {
        address: {
          type: 'object',
          properties: {
            city: { type: 'string' },
            zip: { type: 'string' },
          },
        },
      },
    } satisfies JsonSchema;

    const form = await renderForm(schema, {
      defaultValue: { address: { city: 'Seoul', zip: '04524' } },
      formTypeInputMap: {
        '/address/city': makeInput('city'),
      } as FormTypeInputMap,
      formTypeInputDefinitions: stringDefs,
    });

    expect(variantOf(form, '/address/city')).toBe('city');
    expect(variantOf(form, '/address/zip')).toBe('def');
    expect(form.value('/address/city')).toBe('Seoul');
    expect(form.node('/address/city')?.value).toBe('Seoul');
    expect(form.getValue()?.address).toEqual({ city: 'Seoul', zip: '04524' });
  });

  it('matches array items via a wildcard segment (/tags/*)', async () => {
    const schema = {
      type: 'object',
      properties: {
        tags: { type: 'array', items: { type: 'string' } },
      },
    } satisfies JsonSchema;

    const form = await renderForm(schema, {
      defaultValue: { tags: ['alpha', 'beta'] },
      formTypeInputMap: { '/tags/*': makeInput('tag') } as FormTypeInputMap,
      formTypeInputDefinitions: stringDefs,
    });

    expect(form.exists('/tags/0')).toBe(true);
    expect(form.exists('/tags/1')).toBe(true);
    expect(variantOf(form, '/tags/0')).toBe('tag');
    expect(variantOf(form, '/tags/1')).toBe('tag');
    expect(form.value('/tags/0')).toBe('alpha');
    expect(form.value('/tags/1')).toBe('beta');
    expect(form.node('/tags/0')?.value).toBe('alpha');
    expect(form.getValue()?.tags).toEqual(['alpha', 'beta']);
  });

  it('matches every key under an object via a wildcard segment (/meta/*)', async () => {
    const schema = {
      type: 'object',
      properties: {
        meta: {
          type: 'object',
          properties: {
            author: { type: 'string' },
            version: { type: 'string' },
          },
        },
      },
    } satisfies JsonSchema;

    const form = await renderForm(schema, {
      defaultValue: { meta: { author: 'Vincent', version: '1.0.0' } },
      formTypeInputMap: { '/meta/*': makeInput('meta') } as FormTypeInputMap,
      formTypeInputDefinitions: stringDefs,
    });

    expect(variantOf(form, '/meta/author')).toBe('meta');
    expect(variantOf(form, '/meta/version')).toBe('meta');
    expect(form.value('/meta/author')).toBe('Vincent');
    expect(form.value('/meta/version')).toBe('1.0.0');
    expect(form.getValue()?.meta).toEqual({
      author: 'Vincent',
      version: '1.0.0',
    });
  });
});

describe('formType-resolution — CustomFormTypeRenderer (ReactNode)', () => {
  it('wraps a terminal Input with its name label and pipes the value', async () => {
    const schema = {
      type: 'object',
      properties: { username: { type: 'string' } },
    } satisfies JsonSchema;

    const form = await renderForm(schema, {
      defaultValue: { username: 'neo' },
      CustomFormTypeRenderer: WrapRenderer,
      formTypeInputDefinitions: stringDefs,
    });

    // DOM: the custom wrapper rendered around the resolved Input.
    const wrapper = form.container.querySelector('[data-field="/username"]');
    expect(wrapper).not.toBeNull();
    expect(wrapper?.querySelector('label')?.textContent).toBe('username');
    expect(form.field('/username')).not.toBeNull();
    expect(form.value('/username')).toBe('neo');

    // Tree: value flows through the wrapped Input.
    expect(form.node('/username')?.value).toBe('neo');
    await form.type('/username', 'trinity');
    expect(form.node('/username')?.value).toBe('trinity');
  });

  it('renders a branch fieldset legend and the nested child input', async () => {
    const schema = {
      type: 'object',
      properties: {
        address: {
          type: 'object',
          properties: { city: { type: 'string' } },
        },
      },
    } satisfies JsonSchema;

    const form = await renderForm(schema, {
      defaultValue: { address: { city: 'Seoul' } },
      CustomFormTypeRenderer: WrapRenderer,
      formTypeInputDefinitions: stringDefs,
    });

    const branch = form.container.querySelector('[data-branch="/address"]');
    expect(branch).not.toBeNull();
    expect(branch?.querySelector('legend')?.textContent).toBe('address');
    expect(form.exists('/address')).toBe(true);
    expect(form.exists('/address/city')).toBe(true);
    expect(form.value('/address/city')).toBe('Seoul');
    expect(form.node('/address/city')?.value).toBe('Seoul');
  });

  it('surfaces errorMessage as a ReactNode through the custom renderer', async () => {
    const schema = {
      type: 'object',
      properties: { code: { type: 'string', minLength: 3 } },
      required: ['code'],
    } satisfies JsonSchema;

    const form = await renderForm(schema, {
      validator: true,
      showError: true,
      CustomFormTypeRenderer: WrapRenderer,
      formTypeInputDefinitions: stringDefs,
    });

    await form.type('/code', 'ab');
    await form.flush(10);

    // Tree: a minLength error exists for the node.
    const errors = form.getErrors();
    expect(errors.some((e) => e.dataPath === '/code')).toBe(true);
    expect(form.node('/code')?.errors.length).toBeGreaterThan(0);

    // DOM: the error message is rendered inside the field's wrapper as <em>.
    const wrapper = form.container.querySelector('[data-field="/code"]');
    expect(wrapper?.querySelector('em')).not.toBeNull();
    expect(form.errorTexts().length).toBeGreaterThan(0);
  });
});

describe('formType-resolution — Form.Render custom layout by JSONPointer', () => {
  it('renders a custom layout addressed by path and flows value both ways', async () => {
    const schema = {
      type: 'object',
      properties: { bio: { type: 'string' } },
    } satisfies JsonSchema;

    const form = await renderForm(schema, {
      defaultValue: { bio: 'hi' },
      formTypeInputDefinitions: stringDefs,
      children: (
        <Form.Render path="/bio">
          {({ Input, value }: FormTypeRendererProps) => (
            <div data-render="/bio">
              <span data-rendered-value>{String(value ?? '')}</span>
              <Input />
            </div>
          )}
        </Form.Render>
      ),
    } as any);

    // DOM: custom layout present, mirroring the seeded value.
    expect(form.container.querySelector('[data-render="/bio"]')).not.toBeNull();
    expect(
      form.container.querySelector('[data-rendered-value]')?.textContent,
    ).toBe('hi');
    expect(form.value('/bio')).toBe('hi');
    expect(form.node('/bio')?.value).toBe('hi');

    // Type → tree updates and the render-prop value re-renders in the DOM.
    await form.type('/bio', 'world');
    expect(form.node('/bio')?.value).toBe('world');
    expect(
      form.container.querySelector('[data-rendered-value]')?.textContent,
    ).toBe('world');
  });

  it('Form.Render FormTypeInput prop overrides map/definitions resolution', async () => {
    const schema = {
      type: 'object',
      properties: { title: { type: 'string' } },
    } satisfies JsonSchema;

    const form = await renderForm(schema, {
      defaultValue: { title: 'matrix' },
      formTypeInputMap: { '/title': makeInput('map') } as FormTypeInputMap,
      formTypeInputDefinitions: stringDefs,
      children: (
        <Form.Render path="/title" FormTypeInput={makeInput('render-override')}>
          {({ Input }: FormTypeRendererProps) => (
            <div data-render="/title">
              <Input />
            </div>
          )}
        </Form.Render>
      ),
    } as any);

    // The Render-level FormTypeInput prop beats both the map and the definitions.
    expect(variantOf(form, '/title')).toBe('render-override');
    expect(form.value('/title')).toBe('matrix');
    expect(form.node('/title')?.value).toBe('matrix');
    await form.type('/title', 'reloaded');
    expect(form.node('/title')?.value).toBe('reloaded');
  });

  it('exposes node / path to the render-prop bag at the addressed pointer', async () => {
    const schema = {
      type: 'object',
      properties: {
        profile: {
          type: 'object',
          properties: { nickname: { type: 'string' } },
        },
      },
    } satisfies JsonSchema;

    const form = await renderForm(schema, {
      defaultValue: { profile: { nickname: 'oracle' } },
      formTypeInputDefinitions: stringDefs,
      children: (
        <Form.Render path="/profile/nickname">
          {({ Input, node, path }: FormTypeRendererProps) => (
            <div data-render={path}>
              <span data-node-name>{node.name}</span>
              <span data-node-path>{path}</span>
              <Input />
            </div>
          )}
        </Form.Render>
      ),
    } as any);

    // DOM: the render prop receives the correct pointer + node identity.
    expect(
      form.container.querySelector('[data-render="/profile/nickname"]'),
    ).not.toBeNull();
    expect(form.container.querySelector('[data-node-name]')?.textContent).toBe(
      'nickname',
    );
    expect(form.container.querySelector('[data-node-path]')?.textContent).toBe(
      '/profile/nickname',
    );
    expect(form.value('/profile/nickname')).toBe('oracle');

    // Tree agrees at the deep pointer.
    expect(form.node('/profile/nickname')?.value).toBe('oracle');
    expect(form.getValue()?.profile).toEqual({ nickname: 'oracle' });
  });
});
