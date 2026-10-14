// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { arrayScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FeatureStory } from '../components/FeatureStory';
import { createFeatureStory } from '../components/createFeatureStory';
import { findScenario } from '../components/findScenario';

export default { title: 'Features/Structure/OmitTrailing', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

/** Shared scenario `array.omit-trailing`. */
export const TrimTail: Story = createFeatureStory(findScenario(arrayScenarios, 'array.omit-trailing'));

/** Shared scenario `array.omit-trailing-leading-holes`. */
export const LeadingHoles: Story = createFeatureStory(findScenario(arrayScenarios, 'array.omit-trailing-leading-holes'));

/** Shared scenario `array.empty-output`. */
export const EmptyOutput: Story = createFeatureStory(findScenario(arrayScenarios, 'array.empty-output'));
