// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { compositionFindingScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FeatureStory } from '../components/FeatureStory';
import { createFeatureStory } from '../components/createFeatureStory';
import { findScenario } from '../components/findScenario';

/**
 * 발견(finding): these plays assert the ledger contract and fail against the current engine. The `!test` tag keeps
 * them out of the Vitest run; e2e features-composition.test.tsx pins them with it.fails until the engine is fixed.
 */
export default { title: 'Features/Composition/Findings', component: FeatureStory, tags: ['autodocs', '!test'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

/** 발견: shared scenario `composition.finding-batch-prunes-inactive-raw`. */
export const BatchPrunesInactiveRaw: Story = createFeatureStory(findScenario(compositionFindingScenarios, 'composition.finding-batch-prunes-inactive-raw'));

/** 발견: shared scenario `composition.finding-batched-toggle-refills-default`. */
export const BatchedToggleRefillsDefault: Story = createFeatureStory(findScenario(compositionFindingScenarios, 'composition.finding-batched-toggle-refills-default'));
