// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { compositionFeatureScenarios, unionScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FeatureStory } from '../components/FeatureStory';
import { createFeatureStory } from '../components/createFeatureStory';
import { findScenario } from '../components/findScenario';

export default { title: 'Features/Composition/OneOf', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

/** Shared scenario `union.branch-round-trip-shared-values`. */
export const BranchRoundTrip: Story = createFeatureStory(findScenario(unionScenarios, 'union.branch-round-trip-shared-values'));

/** Shared scenario `composition.discriminator-tag-switch`. */
export const DiscriminatorTagSwitch: Story = createFeatureStory(findScenario(compositionFeatureScenarios, 'composition.discriminator-tag-switch'));
