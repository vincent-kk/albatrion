// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { playScenario, pluginsFeatureScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { FeatureStory } from '../components/FeatureStory';
import { findScenario } from '../components/findScenario';
import { ThrowOnTriggerInput } from './utils/ThrowOnTriggerInput';

export default { title: 'Features/Plugins/ErrorIsolation', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

const scenario = findScenario(pluginsFeatureScenarios, 'plugins.error-isolation');

/** Shared scenario `plugins.error-isolation` with /broken mapped to an input that throws on the trigger value. */
export const ThrowingInputFallsBackAlone: Story = {
  args: { scenario, formProps: { formTypeInputMap: { '/broken': ThrowOnTriggerInput } } },
  parameters: { docs: { description: { story: scenario.description } } },
  async play({ args, canvasElement }) {
    await playScenario(args.scenario, canvasElement);
    expect(canvasElement.querySelector('input[id="/broken"]'), 'the throwing input is replaced by the fallback').toBeNull();
    expect(canvasElement.querySelector<HTMLInputElement>('input[id="/sibling"]')?.value, 'the sibling input still edits').toBe('typed');
  },
};
