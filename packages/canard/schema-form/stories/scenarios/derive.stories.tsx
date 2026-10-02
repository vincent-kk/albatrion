// Loaded by Storybook CSF; named exports identify the shared scenario stories.
import { deriveScenarios, playScenario } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { ScenarioStory } from '../components/scenario/ScenarioStory';

export default { title: 'Scenarios/derive', component: ScenarioStory } satisfies Meta<typeof ScenarioStory>;
type Story = StoryObj<typeof ScenarioStory>;

/** TEST-025: watch-values mirrors shared SCN data in the browser. */
export const WatchValues: Story = {
  name: 'watch-values',
  args: { scenario: deriveScenarios.find((scenario) => scenario.name === 'derive.derived-chain-manual-edits')! },
  play: async ({ args, canvasElement }) => { await playScenario(args.scenario, canvasElement); },
};

/** TEST-025: derived-value mirrors shared SCN data in the browser. */
export const DerivedValue: Story = {
  name: 'derived-value',
  args: { scenario: deriveScenarios.find((scenario) => scenario.name === 'derive.derived-edge-and-reset')! },
  play: async ({ args, canvasElement }) => { await playScenario(args.scenario, canvasElement); },
};

/** TEST-025: inject-to mirrors shared SCN data in the browser. */
export const InjectTo: Story = {
  name: 'inject-to',
  args: { scenario: deriveScenarios.find((scenario) => scenario.name === 'derive.inject-to-on-source-edge')! },
  play: async ({ args, canvasElement }) => { await playScenario(args.scenario, canvasElement); },
};

