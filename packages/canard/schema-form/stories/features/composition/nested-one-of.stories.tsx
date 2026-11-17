// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { compositionFeatureScenarios, unionScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FeatureStory } from '../components/FeatureStory';
import { createFeatureStory } from '../components/createFeatureStory';
import { findScenario } from '../components/findScenario';

export default { title: 'Features/Composition/NestedOneOf', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

/** Shared scenario `union.nested-branch-round-trip`. */
export const NestedRoundTrip: Story = createFeatureStory(findScenario(unionScenarios, 'union.nested-branch-round-trip'));

/** Shared scenario `composition.nested-oneof-three-levels`. */
export const ThreeLevels: Story = createFeatureStory(findScenario(compositionFeatureScenarios, 'composition.nested-oneof-three-levels'));
