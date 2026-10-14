// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { compositionFeatureScenarios, validationScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FeatureStory } from '../components/FeatureStory';
import { createFeatureStory } from '../components/createFeatureStory';
import { findScenario } from '../components/findScenario';

export default { title: 'Features/Composition/ValidatorBranch', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

/** Shared scenario `composition.oneof-active-without-const`. */
export const ActiveWithoutConst: Story = createFeatureStory(findScenario(compositionFeatureScenarios, 'composition.oneof-active-without-const'));

/** Shared scenario `composition.oneof-active-with-const-required`. */
export const ActiveWithConstRequired: Story = createFeatureStory(findScenario(compositionFeatureScenarios, 'composition.oneof-active-with-const-required'));

/** Shared scenario `composition.off-branch-error-filter`. */
export const OffBranchErrorFilter: Story = createFeatureStory(findScenario(compositionFeatureScenarios, 'composition.off-branch-error-filter'));

/** Shared scenario `composition.guard-pattern-reveal`. */
export const GuardPatternReveal: Story = createFeatureStory(findScenario(compositionFeatureScenarios, 'composition.guard-pattern-reveal'));

/** Shared scenario `validation.if-only-oneof-invalid`. */
export const IfOnlyOneOfInvalid: Story = createFeatureStory(findScenario(validationScenarios, 'validation.if-only-oneof-invalid'));
