// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { arrayScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FeatureStory } from '../components/FeatureStory';
import { createFeatureStory } from '../components/createFeatureStory';
import { findScenario } from '../components/findScenario';

export default { title: 'Features/Structure/Tuple', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

/** Shared scenario `array.items-prefix`. */
export const PrefixAndItems: Story = createFeatureStory(findScenario(arrayScenarios, 'array.items-prefix'));

/** Shared scenario `array.extras-tail`. */
export const ExtrasTail: Story = createFeatureStory(findScenario(arrayScenarios, 'array.extras-tail'));

/** Shared scenario `array.extra-becomes-node`. */
export const ExtraBecomesNode: Story = createFeatureStory(findScenario(arrayScenarios, 'array.extra-becomes-node'));

/** Shared scenario `array.prefix-items-external-reset`. */
export const PrefixItemsExternalReset: Story = createFeatureStory(findScenario(arrayScenarios, 'array.prefix-items-external-reset'));
