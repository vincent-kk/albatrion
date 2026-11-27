// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { unionScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FeatureStory } from '../components/FeatureStory';
import { createFeatureStory } from '../components/createFeatureStory';
import { findScenario } from '../components/findScenario';

export default { title: 'Features/Composition/TypelessBranch', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

/** Shared scenario `union.typeless-object-branches`. */
export const ObjectBranches: Story = createFeatureStory(findScenario(unionScenarios, 'union.typeless-object-branches'));

/** Shared scenario `union.typeless-literal-properties`. */
export const LiteralProperties: Story = createFeatureStory(findScenario(unionScenarios, 'union.typeless-literal-properties'));
