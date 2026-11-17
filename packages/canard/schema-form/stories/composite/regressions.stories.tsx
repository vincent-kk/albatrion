// Loaded by Storybook CSF through the composite glob in .storybook/main.ts; each named export is one story.
import { compositeRegressionScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FeatureStory } from '../features/components/FeatureStory';
import { createFeatureStory } from '../features/components/createFeatureStory';
import { findScenario } from '../features/components/findScenario';

export default { title: 'Composite/Regressions', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

/** A write that grows an array while closing its branch keeps the new item value (LANDING-018, EVENT-013). */
export const BatchPushIntoClosingBranch: Story = createFeatureStory(findScenario(compositeRegressionScenarios, 'composite.batch-push-into-closing-branch'));

/** Every instance of a recursive $ref applies its own if/then/else gate (FRAGMENT-009, LANDING-018). */
export const RecursiveNestedGate: Story = createFeatureStory(findScenario(compositeRegressionScenarios, 'composite.recursive-nested-gate'));
