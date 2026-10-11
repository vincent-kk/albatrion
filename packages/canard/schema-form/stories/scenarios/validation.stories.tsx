// Loaded by Storybook CSF; named exports identify the shared scenario stories.
import { validationScenarios, submitScenario, playScenario } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { ScenarioStory } from '../components/scenario/ScenarioStory';

export default { title: 'Scenarios/validation', component: ScenarioStory } satisfies Meta<typeof ScenarioStory>;
type Story = StoryObj<typeof ScenarioStory>;

/** TEST-025: form-errors mirrors shared SCN data in the browser. */
export const FormErrors: Story = {
  name: 'form-errors',
  args: { scenario: validationScenarios[1] },
  play: async ({ args, canvasElement }) => { await playScenario(args.scenario, canvasElement); },
};

/** TEST-025: submit mirrors shared SCN data in the browser. */
export const Submit: Story = {
  name: 'submit',
  args: { scenario: submitScenario },
  play: async ({ args, canvasElement }) => { await playScenario(args.scenario, canvasElement); },
};

/** TEST-025: validation mirrors shared SCN data in the browser. */
export const Validation: Story = {
  name: 'validation',
  args: { scenario: validationScenarios[0] },
  play: async ({ args, canvasElement }) => { await playScenario(args.scenario, canvasElement); },
};

/** TEST-025: validation-display mirrors shared SCN data in the browser. */
export const ValidationDisplay: Story = {
  name: 'validation-display',
  args: { scenario: validationScenarios[1] },
  play: async ({ args, canvasElement }) => { await playScenario(args.scenario, canvasElement); },
};

