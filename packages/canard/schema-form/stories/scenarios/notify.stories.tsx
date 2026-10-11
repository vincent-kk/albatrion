// Loaded by Storybook CSF; named exports identify the shared scenario stories.
import { notifyScenarios, playScenario } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { ScenarioStory } from '../components/scenario/ScenarioStory';

export default { title: 'Scenarios/notify', component: ScenarioStory } satisfies Meta<typeof ScenarioStory>;
type Story = StoryObj<typeof ScenarioStory>;

/** TEST-025: render-observation mirrors shared SCN data in the browser. */
export const RenderObservation: Story = {
  name: 'render-observation',
  args: { scenario: notifyScenarios[0] },
  play: async ({ args, canvasElement }) => { await playScenario(args.scenario, canvasElement); },
};

/** TEST-025: package-renderer-regression mirrors shared SCN data in the browser. */
export const PackageRendererRegression: Story = {
  name: 'package-renderer-regression',
  args: { scenario: notifyScenarios[1] },
  play: async ({ args, canvasElement }) => { await playScenario(args.scenario, canvasElement); },
};

/** TEST-025: renderer-regression mirrors shared SCN data in the browser. */
export const RendererRegression: Story = {
  name: 'renderer-regression',
  args: { scenario: notifyScenarios[0] },
  play: async ({ args, canvasElement }) => { await playScenario(args.scenario, canvasElement); },
};

/** TEST-025: warning-record mirrors shared SCN data in the browser. */
export const WarningRecord: Story = {
  name: 'warning-record',
  args: { scenario: notifyScenarios[2] },
  play: async ({ args, canvasElement }) => { await playScenario(args.scenario, canvasElement); },
};

