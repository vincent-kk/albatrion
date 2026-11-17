// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FeatureStory } from '../components/FeatureStory';
import { createCommitStory } from './utils/createCommitStory';

export default { title: 'Features/Events/RenderCommits', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

/** Shared scenario `events.render-commits` with validation mode None: one commit per write. */
export const OneCommitPerWrite: Story = createCommitStory(false);

/** Shared scenario `events.render-commits` with OnChange validation: an unchanged result adds no commit (GOAL-011). */
export const OneCommitPerWriteWithValidation: Story = createCommitStory(true);
