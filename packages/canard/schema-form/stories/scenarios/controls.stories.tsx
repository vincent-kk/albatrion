// Loaded by Storybook CSF; named exports identify the shared scenario stories.
import { controlsScenarios, virtualizationScenario, playScenario } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { ScenarioStory } from '../components/scenario/ScenarioStory';

export default { title: 'Scenarios/controls', component: ScenarioStory } satisfies Meta<typeof ScenarioStory>;
type Story = StoryObj<typeof ScenarioStory>;

/** TEST-025: virtual-fields mirrors shared SCN data in the browser. */
export const VirtualFields: Story = {
  name: 'virtual-fields',
  args: { scenario: controlsScenarios.find((scenario) => scenario.name === 'controls.virtual-branch-round-trip')! },
  play: async ({ args, canvasElement }) => { await playScenario(args.scenario, canvasElement); },
};

/** TEST-025: computed-controls mirrors shared SCN data in the browser. */
export const ComputedControls: Story = {
  name: 'computed-controls',
  args: { scenario: controlsScenarios.find((scenario) => scenario.name === 'controls.children-host-expression')! },
  play: async ({ args, canvasElement }) => { await playScenario(args.scenario, canvasElement); },
};

/** TEST-025: node-state mirrors shared SCN data in the browser. */
export const NodeState: Story = {
  name: 'node-state',
  args: { scenario: controlsScenarios.find((scenario) => scenario.name === 'controls.lock-or-visibility-and')! },
  play: async ({ args, canvasElement }) => { await playScenario(args.scenario, canvasElement); },
};

/** TEST-025: visibility mirrors shared SCN data in the browser. */
export const Visibility: Story = {
  name: 'visibility',
  args: { scenario: controlsScenarios.find((scenario) => scenario.name === 'controls.visible-preserves-value')! },
  play: async ({ args, canvasElement }) => { await playScenario(args.scenario, canvasElement); },
};

/** TEST-025: pristine mirrors shared SCN data in the browser. */
export const Pristine: Story = {
  name: 'pristine',
  args: { scenario: controlsScenarios.find((scenario) => scenario.name === 'controls.children-value-layer')! },
  play: async ({ args, canvasElement }) => { await playScenario(args.scenario, canvasElement); },
};

/** TEST-025: state-management mirrors shared SCN data in the browser. */
export const StateManagement: Story = {
  name: 'state-management',
  args: { scenario: controlsScenarios.find((scenario) => scenario.name === 'controls.children-host-expression')! },
  play: async ({ args, canvasElement }) => { await playScenario(args.scenario, canvasElement); },
};

/** TEST-025: virtualization mirrors shared SCN data in the browser. */
export const Virtualization: Story = {
  name: 'virtualization',
  args: { scenario: virtualizationScenario },
  play: async ({ args, canvasElement }) => { await playScenario(args.scenario, canvasElement); },
};
