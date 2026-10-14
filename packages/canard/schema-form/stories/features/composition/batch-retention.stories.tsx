// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { compositionFeatureScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FeatureStory } from '../components/FeatureStory';
import { createFeatureStory } from '../components/createFeatureStory';
import { findScenario } from '../components/findScenario';

export default { title: 'Features/Composition/BatchRetention', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

/** Shared scenario `composition.batch-keeps-inactive-raw`. */
export const BatchKeepsInactiveRaw: Story = createFeatureStory(findScenario(compositionFeatureScenarios, 'composition.batch-keeps-inactive-raw'));

/** Shared scenario `composition.batched-toggle-keeps-edit`. */
export const BatchedToggleKeepsEdit: Story = createFeatureStory(findScenario(compositionFeatureScenarios, 'composition.batched-toggle-keeps-edit'));
