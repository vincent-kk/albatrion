// Loaded by Storybook CSF through the composite glob in .storybook/main.ts; each named export is one story.
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FeatureStory } from '../features/components/FeatureStory';
import { createCompositeStory } from './utils/createCompositeStory';

export default { title: 'Composite/CX15ExternalAndValidationErrors', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

/** Shared composite case `composite.cx15-external-and-validation-errors` with its consumer tail. */
export const Case: Story = createCompositeStory('composite.cx15-external-and-validation-errors');
