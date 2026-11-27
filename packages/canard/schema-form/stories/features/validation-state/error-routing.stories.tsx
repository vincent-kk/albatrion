// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { validationScenarios, validationStateFeatureScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FeatureStory } from '../components/FeatureStory';
import { createFeatureStory } from '../components/createFeatureStory';
import { findScenario } from '../components/findScenario';

export default { title: 'Features/ValidationState/ErrorRouting', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

/** Shared scenario `validation-state.error-routing`. */
export const NestedAndItemIssues: Story = createFeatureStory(findScenario(validationStateFeatureScenarios, 'validation-state.error-routing'));

/** Shared scenario `validation.union-type-error-on-node`. */
export const UnionTypeErrorOnNode: Story = createFeatureStory(findScenario(validationScenarios, 'validation.union-type-error-on-node'));
