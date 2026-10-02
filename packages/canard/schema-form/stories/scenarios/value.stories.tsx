// Loaded by Storybook CSF; named exports identify the shared scenario stories.
import { referenceSchemaScenario, valueScenarios, nonNullableEmptyDraftScenario, packageEntryRenderScenario, playScenario } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { ScenarioStory } from '../components/scenario/ScenarioStory';

export default { title: 'Scenarios/value', component: ScenarioStory } satisfies Meta<typeof ScenarioStory>;
type Story = StoryObj<typeof ScenarioStory>;

/** TEST-025: reference-schema mirrors shared SCN data in the browser. */
export const ReferenceSchema: Story = {
  name: 'reference-schema',
  args: { scenario: referenceSchemaScenario },
  play: async ({ args, canvasElement }) => { await playScenario(args.scenario, canvasElement); },
};

/** TEST-025: omit-empty mirrors shared SCN data in the browser. */
export const OmitEmpty: Story = {
  name: 'omit-empty',
  args: { scenario: valueScenarios[1] },
  play: async ({ args, canvasElement }) => { await playScenario(args.scenario, canvasElement); },
};

/** TEST-025: string-input mirrors shared SCN data in the browser. */
export const StringInput: Story = {
  name: 'string-input',
  args: { scenario: nonNullableEmptyDraftScenario },
  play: async ({ args, canvasElement }) => { await playScenario(args.scenario, canvasElement); },
};

/** TEST-025: dynamic-object mirrors shared SCN data in the browser. */
export const DynamicObject: Story = {
  name: 'dynamic-object',
  args: { scenario: valueScenarios[0] },
  play: async ({ args, canvasElement }) => { await playScenario(args.scenario, canvasElement); },
};

/** TEST-025: package-entry-render mirrors shared SCN data in the browser. */
export const PackageEntryRender: Story = {
  name: 'package-entry-render',
  args: { scenario: packageEntryRenderScenario },
  play: async ({ args, canvasElement }) => { await playScenario(args.scenario, canvasElement); },
};

