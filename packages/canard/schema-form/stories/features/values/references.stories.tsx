// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { referenceSchemaScenario, valuesFeatureScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FeatureStory } from '../components/FeatureStory';
import { createFeatureStory } from '../components/createFeatureStory';
import { findScenario } from '../components/findScenario';

export default { title: 'Features/Values/References', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

/** Shared scenario `value.reference-schema`. */
export const ReferenceSchema: Story = createFeatureStory(findScenario([referenceSchemaScenario], 'value.reference-schema'));

/** Shared scenario `values.recursive-tree`. */
export const RecursiveTree: Story = createFeatureStory(findScenario(valuesFeatureScenarios, 'values.recursive-tree'));
