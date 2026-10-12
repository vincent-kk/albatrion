// Loaded by Storybook CSF through the composite glob in .storybook/main.ts; each named export is one story.
import { compositeFindingScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FeatureStory } from '../features/components/FeatureStory';
import { createFeatureStory } from '../features/components/createFeatureStory';
import { findScenario } from '../features/components/findScenario';

/**
 * 발견(finding, 07c composite): these plays assert the ledger contract and fail against the current engine. The `!test`
 * tag keeps them out of the Vitest run; e2e features-composite-shared-2.test.tsx pins them with it.fails until the engine is fixed.
 */
export default { title: 'Composite/Findings', component: FeatureStory, tags: ['autodocs', '!test'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

/** 발견: a write that grows an array while closing its branch loses the new item value (LANDING-018, EVENT-013). */
export const BatchPushIntoClosingBranch: Story = createFeatureStory(findScenario(compositeFindingScenarios, 'composite.finding-batch-push-into-closing-branch'));

/** 발견: a nested instance of a recursive $ref ignores its if/then/else gate (FRAGMENT-009, LANDING-018). */
export const RecursiveNestedGate: Story = createFeatureStory(findScenario(compositeFindingScenarios, 'composite.finding-recursive-nested-gate'));
