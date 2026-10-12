// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FeatureStory } from '../components/FeatureStory';
import { createCommitStory } from './utils/createCommitStory';

/**
 * 발견(finding, round 207): this play asserts the GOAL-011 contract and fails against the current engine. The `!test`
 * tag keeps it out of the Vitest run; e2e features-events-consumer.test.tsx pins it with it.fails until the engine is fixed.
 */
export default { title: 'Features/Events/Findings', component: FeatureStory, tags: ['autodocs', '!test'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

/** 발견: shared scenario `events.render-commits` with OnChange validation; an unchanged empty result should add no commit. */
export const UnchangedValidationAddsCommit: Story = createCommitStory(true);
