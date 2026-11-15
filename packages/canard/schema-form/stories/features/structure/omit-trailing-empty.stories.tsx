// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { arrayScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FeatureStory } from '../components/FeatureStory';
import { createFeatureStory } from '../components/createFeatureStory';
import { findScenario } from '../components/findScenario';

export default { title: 'Features/Structure/OmitTrailingEmpty', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

/** Shared scenario `array.omit-trailing-empty`. */
export const TrimTail: Story = createFeatureStory(findScenario(arrayScenarios, 'array.omit-trailing-empty'));

/** Shared scenario `array.omit-trailing-empty-leading-holes`. */
export const LeadingHoles: Story = createFeatureStory(findScenario(arrayScenarios, 'array.omit-trailing-empty-leading-holes'));

/** Shared scenario `array.empty-output`. */
export const EmptyOutput: Story = createFeatureStory(findScenario(arrayScenarios, 'array.empty-output'));

/** Shared scenario `array.omit-trailing-empty-objects`. */
export const EmptyObjectTail: Story = createFeatureStory(findScenario(arrayScenarios, 'array.omit-trailing-empty-objects'));

/** Shared scenario `array.omit-trailing-empty-terminal`. */
export const TerminalTail: Story = createFeatureStory(findScenario(arrayScenarios, 'array.omit-trailing-empty-terminal'));

/** Shared scenario `array.omit-trailing-empty-nested-branch`. */
export const NestedBranchTail: Story = createFeatureStory(findScenario(arrayScenarios, 'array.omit-trailing-empty-nested-branch'));

/** Shared scenario `array.omit-trailing-empty-nested-terminal`. */
export const NestedTerminalTail: Story = createFeatureStory(findScenario(arrayScenarios, 'array.omit-trailing-empty-nested-terminal'));

/** Shared scenario `array.omit-trailing-empty-nullable`. */
export const NullableTail: Story = createFeatureStory(findScenario(arrayScenarios, 'array.omit-trailing-empty-nullable'));
