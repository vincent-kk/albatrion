// Loaded by Storybook CSF through the composite glob in .storybook/main.ts; each named export is one story.
import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent } from 'storybook/test';

import { FeatureStory } from '../features/components/FeatureStory';
import { expectEventually } from '../features/components/expectEventually';
import { createCompositeStory } from './utils/createCompositeStory';
import { submitButtonLayout } from './utils/submitButtonLayout';

export default { title: 'Composite/CX24EnterSubmitAndBranch', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

/** Shared composite case `composite.cx24-enter-submit-and-branch`; after the tail, Enter in the reference input submits once more. */
export const Case: Story = createCompositeStory('composite.cx24-enter-submit-and-branch', {
  layout: submitButtonLayout,
  async after({ canvasElement, submitted }) {
    const before = submitted.length;
    await userEvent.type(canvasElement.querySelector<HTMLInputElement>('input[id="/ref"]')!, '{Enter}');
    await expectEventually(() => ({ count: submitted.length - before, last: submitted.at(-1) }), { count: 1, last: { kind: 'a', ref: 'R-1' } }, 'Enter submits the active branch once');
  },
});
