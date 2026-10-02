// Loaded by Storybook CSF; named exports identify the shared scenario stories.
import { nullableScreenScenarios, unionScenarios, nullPromotionScenarios, playScenario } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { ScenarioStory } from '../components/scenario/ScenarioStory';

export default { title: 'Scenarios/union', component: ScenarioStory } satisfies Meta<typeof ScenarioStory>;
type Story = StoryObj<typeof ScenarioStory>;

/** TEST-025: null-values mirrors shared SCN data in the browser. */
export const NullValues: Story = {
  name: 'null-values',
  args: { scenario: nullableScreenScenarios[9] },
  play: async ({ args, canvasElement }) => { await playScenario(args.scenario, canvasElement); },
};

/** TEST-025: one-of-switch mirrors shared SCN data in the browser. */
export const OneOfSwitch: Story = {
  name: 'one-of-switch',
  args: { scenario: unionScenarios.find((scenario) => scenario.name === 'union.branch-round-trip-shared-values')! },
  play: async ({ args, canvasElement }) => { await playScenario(args.scenario, canvasElement); },
};

/** TEST-025: nullable-values mirrors shared SCN data in the browser. */
export const NullableValues: Story = {
  name: 'nullable-values',
  args: { scenario: nullableScreenScenarios[7] },
  play: async ({ args, canvasElement }) => { await playScenario(args.scenario, canvasElement); },
};

/** TEST-025: nullable-array mirrors shared SCN data in the browser. */
export const NullableArray: Story = {
  name: 'nullable-array',
  args: { scenario: nullableScreenScenarios[5] },
  play: async ({ args, canvasElement }) => { await playScenario(args.scenario, canvasElement); },
};

/** TEST-025: any-of mirrors shared SCN data in the browser. */
export const AnyOf: Story = {
  name: 'any-of',
  args: { scenario: unionScenarios.find((scenario) => scenario.name === 'union.active-anyof-shared-fields')! },
  play: async ({ args, canvasElement }) => { await playScenario(args.scenario, canvasElement); },
};

/** TEST-025: nullable-contract mirrors shared SCN data in the browser. */
export const NullableContract: Story = {
  name: 'nullable-contract',
  args: { scenario: unionScenarios.find((scenario) => scenario.name === 'union.null-ancestor-input-promotion')! },
  play: async ({ args, canvasElement }) => { await playScenario(args.scenario, canvasElement); },
};

/** TEST-025: null-branch mirrors shared SCN data in the browser. */
export const NullBranch: Story = {
  name: 'null-branch',
  args: { scenario: nullPromotionScenarios[0] },
  play: async ({ args, canvasElement }) => { await playScenario(args.scenario, canvasElement); },
};

