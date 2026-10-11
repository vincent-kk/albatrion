// Loaded by Storybook CSF; these exports document consumer-owned inputs.
import { packageEntryRenderScenario } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Form, type FormTypeInputProps, type JSONSchema } from '../../src';

/** Controlled text input forwards drafts and honors resolved input controls. */
function TextInput({ path, value, onChange, readOnly, disabled, placeholder, className }: FormTypeInputProps<string>) {
  return <textarea id={path} value={value ?? ''} readOnly={readOnly} disabled={disabled} placeholder={placeholder} className={className} onChange={(event) => onChange(event.target.value || undefined)} />;
}

export default { title: 'Usage/Form type input', component: Form } satisfies Meta<typeof Form>;
type Story = StoryObj<typeof Form>;

/** Definitions select by schema type and consume presentation props. */
export const CustomInput: Story = {
  args: { jsonSchema: packageEntryRenderScenario.schema as JSONSchema, defaultValue: packageEntryRenderScenario.initialValue, formTypeInputDefinitions: [{ test: { type: 'string' }, Component: TextInput }] },
};

/** Explicit pointer mapping selects one input without replacing other fields. */
export const PathMapping: Story = {
  args: { jsonSchema: packageEntryRenderScenario.schema as JSONSchema, defaultValue: packageEntryRenderScenario.initialValue, formTypeInputMap: { '/title': TextInput } },
};
