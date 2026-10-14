// Loaded by Storybook CSF through the composite glob in .storybook/main.ts; each named export is one story.
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FeatureStory } from '../features/components/FeatureStory';
import { createCompositeStory } from './utils/createCompositeStory';

export default { title: 'Composite/CX09ResetDuringValidation', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

/** Shared composite case `composite.cx09-reset-during-validation`; the tail holds the ajv8 verdict across a reset. */
export const Case: Story = createCompositeStory('composite.cx09-reset-during-validation');
