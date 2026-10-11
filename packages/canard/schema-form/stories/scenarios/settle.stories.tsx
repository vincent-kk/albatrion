// Loaded by Storybook CSF; named exports identify the shared scenario stories.
import { conditionalScreenScenarios, settleScenarios, playScenario } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { ScenarioStory } from '../components/scenario/ScenarioStory';

export default { title: 'Scenarios/settle', component: ScenarioStory } satisfies Meta<typeof ScenarioStory>;
type Story = StoryObj<typeof ScenarioStory>;

/** TEST-025: conditional-branches mirrors shared SCN data in the browser. */
export const ConditionalBranches: Story = {
  name: 'conditional-branches',
  args: { scenario: conditionalScreenScenarios[0] },
  play: async ({ args, canvasElement }) => { await playScenario(args.scenario, canvasElement); },
};

/** TEST-025: reset-load mirrors shared SCN data in the browser. */
export const ResetLoad: Story = {
  name: 'reset-load',
  args: { scenario: settleScenarios[1] },
  play: async ({ args, canvasElement }) => { await playScenario(args.scenario, canvasElement); },
};

/** TEST-025: all-of mirrors shared SCN data in the browser. */
export const AllOf: Story = {
  name: 'all-of',
  args: { scenario: conditionalScreenScenarios[1] },
  play: async ({ args, canvasElement }) => { await playScenario(args.scenario, canvasElement); },
};

