import { type ComponentProps, act } from 'react';

import {
  ErrorVisibility,
  type FieldInputProps,
  Form,
  type FormHandle,
  type JSONSchema,
  ValidationMode,
  useFieldErrors,
} from '@canard/schema-form';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';

import { plugin } from '../default';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

/** Renders the keywords of the errors the form shows on a field. */
const ValueErrors = ({ node }: FieldInputProps) => {
  const { errors } = useFieldErrors(node);
  return (
    <output data-path={node.path}>
      {errors.map((error) => error.keyword).join('|')}
    </output>
  );
};

/** Array items whose `kind` selects one `oneOf` branch constraining `value`. */
const unionSchema = (id?: string) =>
  ({
    ...(id ? { $id: id } : {}),
    type: 'array',
    items: {
      type: 'object',
      controls: { discriminator: 'kind' },
      properties: {
        kind: { type: 'string' },
        value: { type: 'string', presentation: { FieldInput: ValueErrors } },
      },
      oneOf: [
        { properties: { kind: { const: 'x' }, value: { minLength: 3 } } },
        { properties: { kind: { const: 'y' }, value: { maxLength: 0 } } },
      ],
    },
  }) as unknown as JSONSchema;

/** A required string field whose own `not` rejects one value. */
const notSchema = (id?: string) =>
  ({
    ...(id ? { $id: id } : {}),
    type: 'object',
    required: ['code'],
    properties: { code: { type: 'string', not: { const: 'admin' } } },
  }) as unknown as JSONSchema;

/** Renders a Form with the shipped default plugin and validates once. */
const renderAndValidate = async (
  jsonSchema: JSONSchema,
  defaultValue: ComponentProps<typeof Form>['defaultValue'],
) => {
  const container = document.body.appendChild(document.createElement('div'));
  const reactRoot = createRoot(container);
  let handle: FormHandle | null = null;
  await act(async () => {
    reactRoot.render(
      <Form
        ref={(form) => void (handle = form)}
        jsonSchema={jsonSchema}
        defaultValue={defaultValue}
        validationMode={ValidationMode.OnRequest}
        errorVisibility={ErrorVisibility.Always}
        validatorFactory={plugin.validator}
      />,
    );
  });
  const form = handle!;
  await act(async () => void (await form.validate()));
  const unmount = async () => {
    await act(async () => reactRoot.unmount());
    container.remove();
  };
  return { form, container, unmount };
};

describe('form routing of issues from a root with $id', () => {
  it.each([
    ['without $id', undefined],
    ['with root $id', 'urn:schema-form-ajv8:form-routing-union'],
  ])('hides the inactive branch error on an array item field (%s)', async (_, id) => {
    const { container, unmount } = await renderAndValidate(unionSchema(id), [{ kind: 'x', value: 'a' }]);
    expect(container.querySelector('output[data-path="/0/value"]')?.textContent).toBe('minLength');
    await unmount();
  });

  it.each([
    ['without $id', undefined],
    ['with root $id', 'urn:schema-form-ajv8:form-routing-not'],
  ])('keeps a value-level not error on the string field (%s)', async (_, id) => {
    const { form, unmount } = await renderAndValidate(notSchema(id), { code: 'admin' });
    expect({
      field: form.findNode('/code')!.errors.map((issue) => issue.keyword),
      root: form.node!.errors.map((issue) => issue.keyword),
    }).toEqual({ field: ['not'], root: [] });
    await unmount();
  });
});
