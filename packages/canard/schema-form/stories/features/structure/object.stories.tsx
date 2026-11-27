// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { arrayScenarios, structureFeatureScenarios, unionScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FeatureStory } from '../components/FeatureStory';
import { createFeatureStory } from '../components/createFeatureStory';
import { findScenario } from '../components/findScenario';

export default { title: 'Features/Structure/Object', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

/** Shared scenario `structure.object-properties-extras`. */
export const PropertiesAndExtras: Story = createFeatureStory(findScenario(structureFeatureScenarios, 'structure.object-properties-extras'));

/** Shared scenario `array.terminal-object-external-reset`. */
export const TerminalObject: Story = createFeatureStory(findScenario(arrayScenarios, 'array.terminal-object-external-reset'));

/** Shared scenario `union.object-array`. */
export const UnionObjectOrArray: Story = createFeatureStory(findScenario(unionScenarios, 'union.object-array'));
