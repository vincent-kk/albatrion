// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { compositionFeatureScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FeatureStory } from '../components/FeatureStory';
import { createFeatureStory } from '../components/createFeatureStory';
import { findScenario } from '../components/findScenario';

export default { title: 'Features/Composition/AllOf', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

/** Shared scenario `composition.allof-merged-required`. */
export const MergedRequired: Story = createFeatureStory(findScenario(compositionFeatureScenarios, 'composition.allof-merged-required'));

/** Shared scenario `composition.allof-constraint-conjunction`. */
export const ConstraintConjunction: Story = createFeatureStory(findScenario(compositionFeatureScenarios, 'composition.allof-constraint-conjunction'));
