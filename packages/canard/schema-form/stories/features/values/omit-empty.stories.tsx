// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { unionScenarios, valueScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FeatureStory } from '../components/FeatureStory';
import { createFeatureStory } from '../components/createFeatureStory';
import { findScenario } from '../components/findScenario';

export default { title: 'Features/Values/OmitEmpty', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

/** Shared scenario `value.omit-empty-object`. */
export const ObjectChildren: Story = createFeatureStory(findScenario(valueScenarios, 'value.omit-empty-object'));

/** Shared scenario `union.omit-empty`. */
export const UnionRawKept: Story = createFeatureStory(findScenario(unionScenarios, 'union.omit-empty'));
