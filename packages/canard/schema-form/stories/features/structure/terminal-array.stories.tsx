// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { arrayScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FeatureStory } from '../components/FeatureStory';
import { createFeatureStory } from '../components/createFeatureStory';
import { findScenario } from '../components/findScenario';

export default { title: 'Features/Structure/TerminalArray', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

/** Shared scenario `array.terminal-verbs`. */
export const TerminalVerbs: Story = createFeatureStory(findScenario(arrayScenarios, 'array.terminal-verbs'));

/** Shared scenario `array.terminal-array-external-reset`. */
export const TerminalArrayExternalReset: Story = createFeatureStory(findScenario(arrayScenarios, 'array.terminal-array-external-reset'));
