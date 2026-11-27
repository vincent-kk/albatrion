// Loaded by Storybook CSF; these exports document provider and validator shapes.
import { submitScenario } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Form, FormProvider, registerPlugin, type JSONSchema } from '../../src';

import { ajvValidatorPlugin, plugin } from '../components/validator';

export default { title: 'Usage/Provider and plugin', component: Form } satisfies Meta<typeof Form>;
type Story = StoryObj<typeof Form>;

/** Provider injects context and the compile/compileGuard validator object. */
export const Provider: Story = {
  args: { jsonSchema: submitScenario.schema as JSONSchema, defaultValue: submitScenario.initialValue },
  render: (args) => <FormProvider context={{ mode: 'edit', role: 'author' }} validatorFactory={ajvValidatorPlugin}><Form {...args} /></FormProvider>,
};

/** Plugin registration supplies the same validator through the public boundary. */
export const Plugin: Story = {
  args: { jsonSchema: submitScenario.schema as JSONSchema, defaultValue: submitScenario.initialValue },
  loaders: [() => { registerPlugin(plugin); return {}; }],
};
