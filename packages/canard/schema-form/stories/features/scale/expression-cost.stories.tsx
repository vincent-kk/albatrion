// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { scaleFeatureScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FeatureStory } from '../components/FeatureStory';
import { createFeatureStory } from '../components/createFeatureStory';
import { findScenario } from '../components/findScenario';

export default { title: 'Features/Scale/ExpressionCost', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

/** Shared scenario `scale.expression-cost`. */
export const TwoHundredDerivedFields: Story = createFeatureStory(findScenario(scaleFeatureScenarios, 'scale.expression-cost'));
