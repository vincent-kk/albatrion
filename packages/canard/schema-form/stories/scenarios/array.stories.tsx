// Loaded by Storybook CSF; named exports identify the shared scenario stories.
import { arrayScenarios, playScenario } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { ScenarioStory } from '../components/scenario/ScenarioStory';

export default { title: 'Scenarios/array', component: ScenarioStory } satisfies Meta<typeof ScenarioStory>;
type Story = StoryObj<typeof ScenarioStory>;

/** TEST-025: terminal-mode mirrors shared SCN data in the browser. */
export const TerminalMode: Story = {
  name: 'terminal-mode',
  args: { scenario: arrayScenarios.find((scenario) => scenario.name === 'array.terminal-array-external-reset')! },
  play: async ({ args, canvasElement }) => { await playScenario(args.scenario, canvasElement); },
};

/** TEST-025: array-identity mirrors shared SCN data in the browser. */
export const ArrayIdentity: Story = {
  name: 'array-identity',
  args: { scenario: arrayScenarios.find((scenario) => scenario.name === 'array.position-reconcile')! },
  play: async ({ args, canvasElement }) => { await playScenario(args.scenario, canvasElement); },
};

/** TEST-025: prefix-items mirrors shared SCN data in the browser. */
export const PrefixItems: Story = {
  name: 'prefix-items',
  args: { scenario: arrayScenarios.find((scenario) => scenario.name === 'array.prefix-items-external-reset')! },
  play: async ({ args, canvasElement }) => { await playScenario(args.scenario, canvasElement); },
};

/** TEST-025: omit-trailing mirrors shared SCN data in the browser. */
export const OmitTrailing: Story = {
  name: 'omit-trailing',
  args: { scenario: arrayScenarios.find((scenario) => scenario.name === 'array.omit-trailing')! },
  play: async ({ args, canvasElement }) => { await playScenario(args.scenario, canvasElement); },
};

