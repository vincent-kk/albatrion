// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { unionScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FeatureStory } from '../components/FeatureStory';
import { createFeatureStory } from '../components/createFeatureStory';
import { findScenario } from '../components/findScenario';

export default { title: 'Features/Composition/BranchDefaults', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

/** Shared scenario `union.first-screen-active-defaults`. */
export const FirstScreenActiveDefaults: Story = createFeatureStory(findScenario(unionScenarios, 'union.first-screen-active-defaults'));

/** Shared scenario `union.default-fill`. */
export const UnionDefaultFill: Story = createFeatureStory(findScenario(unionScenarios, 'union.default-fill'));
