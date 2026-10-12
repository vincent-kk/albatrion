// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { arrayScenarios, structureFeatureScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FeatureStory } from '../components/FeatureStory';
import { createFeatureStory } from '../components/createFeatureStory';
import { findScenario } from '../components/findScenario';

export default { title: 'Features/Structure/ArrayVerbs', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

/** Shared scenario `array.push-slot`. */
export const Push: Story = createFeatureStory(findScenario(arrayScenarios, 'array.push-slot'));

/** Shared scenario `array.pop-slot`. */
export const Pop: Story = createFeatureStory(findScenario(arrayScenarios, 'array.pop-slot'));

/** Shared scenario `array.remove-slot`. */
export const Remove: Story = createFeatureStory(findScenario(arrayScenarios, 'array.remove-slot'));

/** Shared scenario `array.update-slot`. */
export const Update: Story = createFeatureStory(findScenario(arrayScenarios, 'array.update-slot'));

/** Shared scenario `array.clear-slots`. */
export const Clear: Story = createFeatureStory(findScenario(arrayScenarios, 'array.clear-slots'));

/** Shared scenario `array.position-reconcile`. */
export const PositionReconcile: Story = createFeatureStory(findScenario(arrayScenarios, 'array.position-reconcile'));

/** Shared scenario `structure.nested-array-verbs`. */
export const NestedArrayVerbs: Story = createFeatureStory(findScenario(structureFeatureScenarios, 'structure.nested-array-verbs'));
