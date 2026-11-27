import { screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import type { FieldInputDefinition, FieldInputProps } from '@/schema-form/types';
import { type FormHarness, renderForm } from '@/schema-form/__tests__/renderForm';

let form: FormHarness;
afterEach(() => form?.unmount());

const NormalInput = (props: FieldInputProps) => {
  return <input data-testid="normal-input" id={props.path} value={String(props.value ?? '')} onChange={e => props.onChange(e.target.value)} />;
};

const MisfitInput = (props: FieldInputProps) => {
  return <input data-testid="misfit-input" id={props.path} value={String(props.value ?? '')} onChange={e => props.onChange(e.target.value)} />;
};

const customDefinitions: FieldInputDefinition[] = [
  {
    test: (hint) => Boolean(hint.misfit),
    Component: MisfitInput,
  },
  {
    test: (hint) => !hint.misfit,
    Component: NormalInput,
  },
];

it('selects the misfit input after a value changes the node hint', async () => {
  form = await renderForm(
    {
      type: 'number',
    },
    {
      defaultValue: 10,
      fieldInputDefinitions: customDefinitions,
    },
  );

  expect(screen.queryByTestId('normal-input')).not.toBeNull();
  expect(screen.queryByTestId('misfit-input')).toBeNull();

  await form.setValue('invalid-string');

  const node = form.node('');
  expect(node?.isMisfit).toBe(true);

  expect(screen.queryByTestId('misfit-input')).not.toBeNull();
});

it('reselects when only the parent schema required list changes', async () => {
  form = await renderForm({
    type: 'object',
    properties: { flag: { type: 'boolean' }, field: { type: 'string' } },
    oneOf: [{ controls: { active: './flag' }, required: ['field'] }],
  }, {
    defaultValue: { flag: false, field: 'x' },
    fieldInputDefinitions: [
      { test: (hint) => hint.path === '/field' && hint.required, Component: MisfitInput },
      { test: (hint) => hint.path === '/field' && !hint.required, Component: NormalInput },
    ],
  });
  const node = form.node('/field');
  const schema = node?.jsonSchema;
  expect(node?.isRequired).toBe(false);
  await form.setValue({ flag: true, field: 'x' });
  expect(form.node('/field')).toBe(node);
  expect(node?.jsonSchema).toBe(schema);
  expect(node?.isRequired).toBe(true);
  expect(screen.queryByTestId('misfit-input')).not.toBeNull();
});
