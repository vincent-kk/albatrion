// Loaded by Storybook CSF; named exports identify the shared scenario stories.
import { nestedFillScenarios, fillScenarios, playScenario } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { ScenarioStory } from '../components/scenario/ScenarioStory';

export default { title: 'Scenarios/fill', component: ScenarioStory } satisfies Meta<typeof ScenarioStory>;
type Story = StoryObj<typeof ScenarioStory>;

/** TEST-025: default-values mirrors shared SCN data in the browser. */
export const DefaultValues: Story = {
  name: 'default-values',
  args: { scenario: nestedFillScenarios[0] },
  play: async ({ args, canvasElement }) => { await playScenario(args.scenario, canvasElement); },
};

/** TEST-025: mount-default mirrors shared SCN data in the browser. */
export const MountDefault: Story = {
  name: 'mount-default',
  args: { scenario: fillScenarios[0] },
  play: async ({ args, canvasElement }) => { await playScenario(args.scenario, canvasElement); },
};

/** TEST-025: appearing-default mirrors shared SCN data in the browser. */
export const AppearingDefault: Story = {
  name: 'appearing-default',
  args: { scenario: fillScenarios[1] },
  play: async ({ args, canvasElement }) => { await playScenario(args.scenario, canvasElement); },
};

