// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { valuesFeatureScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FeatureStory } from '../components/FeatureStory';
import { createFeatureStory } from '../components/createFeatureStory';
import { findScenario } from '../components/findScenario';

export default { title: 'Features/Values/LiteralsAndFormat', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

/** Shared scenario `values.literal-and-format`. */
export const EnumConstFormat: Story = createFeatureStory(findScenario(valuesFeatureScenarios, 'values.literal-and-format'));
