// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { arrayScenarios, structureFeatureScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FeatureStory } from '../components/FeatureStory';
import { createFeatureStory } from '../components/createFeatureStory';
import { findScenario } from '../components/findScenario';

export default { title: 'Features/Structure/ArrayConstraints', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

/** Shared scenario `array.min-items-explicit-slots`. */
export const MinItemsExplicitSlots: Story = createFeatureStory(findScenario(arrayScenarios, 'array.min-items-explicit-slots'));

/** Shared scenario `array.nullable-slots-reset`. */
export const NullableSlotsReset: Story = createFeatureStory(findScenario(arrayScenarios, 'array.nullable-slots-reset'));

/** Shared scenario `structure.array-constraint-errors`. */
export const ConstraintErrors: Story = createFeatureStory(findScenario(structureFeatureScenarios, 'structure.array-constraint-errors'));

/** Shared scenario `array.landing-202`. */
export const NewItemFill: Story = createFeatureStory(findScenario(arrayScenarios, 'array.landing-202'));
