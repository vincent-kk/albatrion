import { type FC, createRef } from 'react';

import '@testing-library/jest-dom';
import { act, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { JsonSchema } from '@/schema-form';
import {
  Form,
  type FormHandle,
  FormProvider,
  type FormTypeInputDefinition,
  type FormTypeInputProps,
} from '@/schema-form';

import { renderForm } from '../renderForm';

/**
 * Feature coverage: `$ref` resolution, the Form `context` prop, and the
 * `FormProvider` (ExternalFormContextProvider) supplying definitions/context to
 * a nested `Form`. Schemas mirror stories 16 (RefSchemaUsecase), 34
 * (ContextNode), and 14 (ExternalProvider).
 *
 * Contract pinned here:
 *   - A `$ref` (to `$defs` or to a sibling subschema) resolves so the referenced
 *     subschema's fields RENDER (`[data-path]` / `id={path}`) and carry value.
 *   - The Form `context` prop reaches a FormTypeInput (`props.context`) and drives
 *     `computed.active` / `computed.readOnly` expressions that use `@`.
 *   - `FormProvider.formTypeInputDefinitions` are consumed by a nested Form, and
 *     `FormProvider.context` reaches the form (Form-level context overriding it
 *     key-by-key per WorkspaceContextProvider's `{...external, ...form}` merge).
 *
 * Every test asserts BOTH the rendered DOM and the node tree.
 */

// ---------------------------------------------------------------------------
// $ref schemas (mirrored from stories/16.RefSchemaUsecase)
// ---------------------------------------------------------------------------

const simpleRefSchema = {
  type: 'object',
  $defs: { Name: { type: 'string', minLength: 1 } },
  properties: { name: { $ref: '#/$defs/Name' } },
  required: ['name'],
} satisfies JsonSchema;

const nestedRefSchema = {
  type: 'object',
  $defs: {
    Person: {
      type: 'object',
      $defs: { Name: { type: 'string', minLength: 1 } },
      properties: {
        firstName: { $ref: '#/$defs/Person/$defs/Name' },
        lastName: { $ref: '#/$defs/Person/$defs/Name' },
      },
    },
  },
  properties: { person: { $ref: '#/$defs/Person' } },
} satisfies JsonSchema;

const directSubSchemaRef = {
  type: 'object',
  properties: {
    user: {
      type: 'object',
      properties: {
        profile: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
          },
          required: ['name'],
        },
      },
    },
    userProfile: { $ref: '#/properties/user/properties/profile' },
  },
} satisfies JsonSchema;

const recursiveRefSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    children: { type: 'array', items: { $ref: '#' } },
  },
  required: ['id'],
} satisfies JsonSchema;

// ---------------------------------------------------------------------------
// context-driven schemas (mirrored from stories/34.ContextNode)
// ---------------------------------------------------------------------------

const contextActiveSchema = {
  type: 'object',
  properties: {
    publicField: { type: 'string' },
    adminField: {
      type: 'string',
      computed: { active: '@.userRole === "admin"' },
    },
  },
} satisfies JsonSchema;

const contextReadOnlySchema = {
  type: 'object',
  properties: {
    bio: { type: 'string', computed: { readOnly: '@.mode === "view"' } },
  },
} satisfies JsonSchema;

const contextProbeSchema = {
  type: 'object',
  properties: { greeting: { type: 'string' } },
} satisfies JsonSchema;

/** Custom input that surfaces `props.context` and `props.readOnly` to the DOM. */
const ContextProbe: FC<FormTypeInputProps<any>> = (props) => (
  <input
    id={props.path}
    data-context={JSON.stringify(props.context ?? null)}
    data-readonly={String(!!props.readOnly)}
    defaultValue={props.value?.toString() ?? ''}
    onChange={(e) => props.onChange?.(e.target.value)}
  />
);

const probeDefs: FormTypeInputDefinition[] = [
  { test: { type: 'string' }, Component: ContextProbe },
];

// ---------------------------------------------------------------------------
// Manual FormProvider render helper (renderForm cannot wrap a provider).
// Exposes both layers via the Form ref + container queries.
// ---------------------------------------------------------------------------

interface ProviderHarness {
  handle: FormHandle;
  exists: (path: string) => boolean;
  value: (path: string) => string;
  field: (path: string) => HTMLInputElement | null;
  query: (selector: string) => HTMLElement | null;
  getValue: () => any;
  node: (path: string) => ReturnType<FormHandle['findNode']>;
}

const renderWithProvider = async (
  providerProps: React.ComponentProps<typeof FormProvider>,
  jsonSchema: JsonSchema,
  formProps: Partial<React.ComponentProps<typeof Form>> = {},
): Promise<ProviderHarness> => {
  const ref = createRef<FormHandle>();
  let utils!: ReturnType<typeof render>;
  await act(async () => {
    utils = render(
      <FormProvider {...providerProps}>
        <Form ref={ref as any} jsonSchema={jsonSchema as any} {...formProps} />
      </FormProvider>,
    );
  });
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });
  const container = utils.container;
  return {
    handle: ref.current as FormHandle,
    exists: (path) => container.querySelector(`[data-path="${path}"]`) !== null,
    value: (path) =>
      (
        container.querySelector(
          `#${CSS.escape(path)}`,
        ) as HTMLInputElement | null
      )?.value ?? '',
    field: (path) =>
      container.querySelector(
        `#${CSS.escape(path)}`,
      ) as HTMLInputElement | null,
    query: (selector) => container.querySelector(selector),
    getValue: () => ref.current?.getValue(),
    node: (path) => ref.current?.findNode(path) ?? null,
  };
};

// ===========================================================================

describe('$ref resolution renders the referenced subschema fields', () => {
  it('renders a $defs string ref as a terminal input carrying its value', async () => {
    const form = await renderForm(simpleRefSchema, {
      defaultValue: { name: 'Alice' },
    });

    // DOM: the ref resolved to a real string input at /name.
    expect(form.exists('/name')).toBe(true);
    expect(form.value('/name')).toBe('Alice');
    // Tree agrees and the resolved node is a string node (minLength preserved).
    expect(form.node('/name')?.value).toBe('Alice');
    expect(form.getValue()?.name).toBe('Alice');
    expect(form.caughtErrors()).toEqual([]);
  });

  it('resolves two refs pointing at the same nested $defs into independent fields', async () => {
    const form = await renderForm(nestedRefSchema, {
      defaultValue: { person: { firstName: 'Ada', lastName: 'Byron' } },
    });

    // DOM: both ref-resolved leaves render under the ref-resolved object.
    expect(form.exists('/person')).toBe(true);
    expect(form.exists('/person/firstName')).toBe(true);
    expect(form.exists('/person/lastName')).toBe(true);
    expect(form.value('/person/firstName')).toBe('Ada');
    expect(form.value('/person/lastName')).toBe('Byron');
    // Tree: the two leaves are distinct nodes with their own values.
    expect(form.node('/person/firstName')?.value).toBe('Ada');
    expect(form.node('/person/lastName')?.value).toBe('Byron');
    expect(form.getValue()?.person).toEqual({
      firstName: 'Ada',
      lastName: 'Byron',
    });
  });

  it('resolves a sibling-subschema $ref (#/properties/...) into nested fields', async () => {
    const form = await renderForm(directSubSchemaRef, {
      defaultValue: { userProfile: { name: 'Grace', email: 'g@h.io' } },
    });

    // DOM: the referenced { name, email } object renders under /userProfile.
    expect(form.exists('/userProfile')).toBe(true);
    expect(form.exists('/userProfile/name')).toBe(true);
    expect(form.exists('/userProfile/email')).toBe(true);
    expect(form.value('/userProfile/name')).toBe('Grace');
    expect(form.value('/userProfile/email')).toBe('g@h.io');
    // Tree agrees.
    expect(form.node('/userProfile/name')?.value).toBe('Grace');
    expect(form.getValue()?.userProfile?.email).toBe('g@h.io');
  });

  it('grows a self-recursive ($ref: "#") array item with the referenced fields', async () => {
    const form = await renderForm(recursiveRefSchema, {
      defaultValue: { id: 'root', children: [] },
    });

    // Baseline: no items yet (empty array carries no rendered item rows).
    expect(form.exists('/children/0')).toBe(false);
    expect(form.getValue()?.children ?? []).toEqual([]);

    await form.addItem('/children');

    // DOM: the new item resolves the recursive schema -> its own id + children.
    expect(form.exists('/children/0')).toBe(true);
    expect(form.exists('/children/0/id')).toBe(true);
    expect(form.exists('/children/0/children')).toBe(true);
    // Tree: length grew by exactly one and the nested node exists.
    expect(form.getValue()?.children).toHaveLength(1);
    expect(form.node('/children/0/id')).not.toBeNull();
    expect(form.caughtErrors()).toEqual([]);
  });
});

describe('context passed via Form context prop reaches FormTypeInput', () => {
  it('delivers the exact context object to props.context of the input', async () => {
    const form = await renderForm(contextProbeSchema, {
      context: { greeting: 'hello', count: 3 },
      formTypeInputDefinitions: probeDefs,
      defaultValue: { greeting: 'hi' },
    });

    // DOM: the custom input received props.context verbatim.
    const raw = form.field('/greeting')?.getAttribute('data-context');
    expect(JSON.parse(raw ?? 'null')).toEqual({ greeting: 'hello', count: 3 });
    expect(form.value('/greeting')).toBe('hi');
    // Tree agrees on the underlying value.
    expect(form.node('/greeting')?.value).toBe('hi');
  });

  it('hides a context-gated `&active` field when the context disables it', async () => {
    const form = await renderForm(contextActiveSchema, {
      context: { userRole: 'user' },
      defaultValue: { publicField: 'p', adminField: 'secret' },
    });

    // DOM: adminField absent because @.userRole !== "admin".
    expect(form.exists('/publicField')).toBe(true);
    expect(form.exists('/adminField')).toBe(false);
    // Tree: inactive child key is stripped from the parent value.
    const value = form.getValue();
    expect('adminField' in (value ?? {})).toBe(false);
    expect(value?.adminField).toBeUndefined();
  });

  it('shows the context-gated `&active` field when the context enables it', async () => {
    const form = await renderForm(contextActiveSchema, {
      context: { userRole: 'admin' },
      defaultValue: { publicField: 'p', adminField: 'secret' },
    });

    // DOM: adminField present because @.userRole === "admin".
    expect(form.exists('/adminField')).toBe(true);
    expect(form.value('/adminField')).toBe('secret');
    // Tree agrees, key present in the value.
    expect(form.node('/adminField')?.value).toBe('secret');
    expect(form.getValue()?.adminField).toBe('secret');
  });

  it('drives computed.readOnly from context both ways (@.mode)', async () => {
    const viewForm = await renderForm(contextReadOnlySchema, {
      context: { mode: 'view' },
      formTypeInputDefinitions: probeDefs,
      defaultValue: { bio: 'text' },
    });
    // DOM: readOnly true reaches the input; tree node marked readOnly.
    expect(viewForm.field('/bio')?.getAttribute('data-readonly')).toBe('true');
    expect(viewForm.node('/bio')?.value).toBe('text');

    const editForm = await renderForm(contextReadOnlySchema, {
      context: { mode: 'edit' },
      formTypeInputDefinitions: probeDefs,
      defaultValue: { bio: 'text' },
    });
    // DOM: same schema, opposite context -> editable input.
    expect(editForm.field('/bio')?.getAttribute('data-readonly')).toBe('false');
    expect(editForm.node('/bio')?.value).toBe('text');
  });
});

describe('FormProvider supplies definitions/context to a nested Form', () => {
  const externalInputSchema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      number: { type: 'number', formType: 'external-input1' },
    },
  } satisfies JsonSchema;

  it('renders a field via a FormProvider-supplied formTypeInputDefinition', async () => {
    const Ext1: FC<FormTypeInputProps<any>> = () => (
      <div data-testid="ext1">external input 1</div>
    );
    const form = await renderWithProvider(
      {
        formTypeInputDefinitions: [
          { test: { formType: 'external-input1' }, Component: Ext1 },
        ],
      },
      externalInputSchema,
      { defaultValue: { name: 'ron', number: 10 } },
    );

    // DOM: the provider definition matched /number and rendered its component.
    expect(form.query('[data-testid="ext1"]')).not.toBeNull();
    expect(form.exists('/number')).toBe(true);
    expect(form.value('/name')).toBe('ron');
    // Tree: the value carried by the provider-rendered field is intact.
    expect(form.getValue()?.number).toBe(10);
    expect(form.node('/number')?.value).toBe(10);
  });

  it('reaches computed expressions through FormProvider.context alone', async () => {
    const form = await renderWithProvider(
      { context: { userRole: 'admin' } },
      contextActiveSchema,
      { defaultValue: { publicField: 'p', adminField: 'secret' } },
    );

    // DOM: provider context (no Form-level context) enables the &active field.
    expect(form.exists('/adminField')).toBe(true);
    expect(form.value('/adminField')).toBe('secret');
    // Tree agrees.
    expect(form.node('/adminField')?.value).toBe('secret');
    expect(form.getValue()?.adminField).toBe('secret');
  });

  it('merges provider + Form context, Form-level keys overriding by key', async () => {
    const form = await renderWithProvider(
      { context: { userRole: 'admin', tier: 'gold' } },
      contextProbeSchema,
      {
        context: { userRole: 'user' },
        formTypeInputDefinitions: probeDefs,
        defaultValue: { greeting: 'merged' },
      },
    );

    // DOM: the input sees {...provider, ...form} -> userRole overridden, tier kept.
    const raw = form.field('/greeting')?.getAttribute('data-context');
    expect(JSON.parse(raw ?? 'null')).toEqual({
      userRole: 'user',
      tier: 'gold',
    });
    expect(form.value('/greeting')).toBe('merged');
    // Tree agrees on the value.
    expect(form.node('/greeting')?.value).toBe('merged');
  });
});
