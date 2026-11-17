// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { unionScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FeatureStory } from '../components/FeatureStory';
import { createFeatureStory } from '../components/createFeatureStory';
import { findScenario } from '../components/findScenario';

export default { title: 'Features/Composition/AnyOf', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

/** Shared scenario `union.active-anyof-shared-fields`. */
export const ActiveFragments: Story = createFeatureStory(findScenario(unionScenarios, 'union.active-anyof-shared-fields'));
