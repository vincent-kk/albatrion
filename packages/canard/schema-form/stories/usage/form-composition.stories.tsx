// Loaded by Storybook CSF; these exports document public Form composition.
import { packageEntryRenderScenario, controlsScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Form, type FormProps, type JSONSchema } from '../../src';

export default { title: 'Usage/Form composition', component: Form } satisfies Meta<typeof Form>;
type Story = StoryObj<typeof Form>;

/** Reuse a shared schema while arranging the public namespace components. */
export const Composition: Story = {
  args: { jsonSchema: packageEntryRenderScenario.schema as JSONSchema, defaultValue: packageEntryRenderScenario.initialValue },
  render: (args) => <Form {...args}>{({ value }) => <>
    <div><Form.Label path="/title" /><Form.Input path="/title" /><Form.ErrorMessage path="/title" /></div>
    <div><Form.Label path="/count" /><Form.Input path="/count" /></div>
    <div><Form.Input path="/enabled" /> <Form.Label path="/enabled" /></div>
    <output aria-label="Children value">{JSON.stringify(value)}</output><button type="submit">Submit</button>
  </>}</Form>,
};

/** Controls and presentation stay in the shared schema rather than inline JSX. */
export const ControlsAndPresentation: Story = {
  args: { jsonSchema: controlsScenarios.find((scenario) => scenario.name === 'controls.empty-default-inputs')!.schema as JSONSchema, defaultValue: controlsScenarios.find((scenario) => scenario.name === 'controls.empty-default-inputs')!.initialValue as FormProps['defaultValue'] },
};
