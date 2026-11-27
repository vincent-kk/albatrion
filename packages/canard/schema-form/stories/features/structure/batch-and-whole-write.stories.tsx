// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { arrayScenarios, notifyScenarios, structureFeatureScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FeatureStory } from '../components/FeatureStory';
import { createFeatureStory } from '../components/createFeatureStory';
import { findScenario } from '../components/findScenario';

export default { title: 'Features/Structure/BatchAndWholeWrite', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

/** Shared scenario `array.whole-write`. */
export const WholeWrite: Story = createFeatureStory(findScenario(arrayScenarios, 'array.whole-write'));

/** Shared scenario `notify.batch-change`. */
export const BatchChange: Story = createFeatureStory(findScenario(notifyScenarios, 'notify.batch-change'));

/** Shared scenario `array.source-b-structure`. */
export const SourceBRollback: Story = createFeatureStory(findScenario(arrayScenarios, 'array.source-b-structure'));

/** Shared scenario `structure.batch-verbs-positional-identity`. */
export const BatchVerbsPositional: Story = createFeatureStory(findScenario(structureFeatureScenarios, 'structure.batch-verbs-positional-identity'));
