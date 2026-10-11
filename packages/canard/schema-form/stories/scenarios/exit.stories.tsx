// Loaded by Storybook CSF; named exports identify the shared scenario stories.
import { exitScenarios, branchExitScenario, playScenario } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { ScenarioStory } from '../components/scenario/ScenarioStory';

export default { title: 'Scenarios/exit', component: ScenarioStory } satisfies Meta<typeof ScenarioStory>;
type Story = StoryObj<typeof ScenarioStory>;

/** TEST-025: retain-inactive mirrors shared SCN data in the browser. */
export const RetainInactive: Story = {
  name: 'retain-inactive',
  args: { scenario: exitScenarios[1] },
  play: async ({ args, canvasElement }) => { await playScenario(args.scenario, canvasElement); },
};

/** TEST-025: unset-inactive mirrors shared SCN data in the browser. */
export const UnsetInactive: Story = {
  name: 'unset-inactive',
  args: { scenario: exitScenarios[0] },
  play: async ({ args, canvasElement }) => { await playScenario(args.scenario, canvasElement); },
};

/** TEST-025: branch-exit mirrors shared SCN data in the browser. */
export const BranchExit: Story = {
  name: 'branch-exit',
  args: { scenario: branchExitScenario },
  play: async ({ args, canvasElement }) => { await playScenario(args.scenario, canvasElement); },
};

