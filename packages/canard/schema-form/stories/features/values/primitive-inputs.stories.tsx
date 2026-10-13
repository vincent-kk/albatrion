// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { packageEntryRenderScenario, valueScenarios, valuesFeatureScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FeatureStory } from '../components/FeatureStory';
import { createFeatureStory } from '../components/createFeatureStory';
import { findScenario } from '../components/findScenario';

export default { title: 'Features/Values/PrimitiveInputs', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

/** Shared scenario `values.primitive-inputs`. */
export const FivePrimitiveKinds: Story = createFeatureStory(findScenario(valuesFeatureScenarios, 'values.primitive-inputs'));

/** Shared scenario `value.root-output`. */
export const RootOutput: Story = createFeatureStory(findScenario(valueScenarios, 'value.root-output'));

/** Shared scenario `value.package-entry-render`. */
export const PackageEntryRender: Story = createFeatureStory(findScenario([packageEntryRenderScenario], 'value.package-entry-render'));
