// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { compositionFeatureScenarios, conditionalScreenScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FeatureStory } from '../components/FeatureStory';
import { createFeatureStory } from '../components/createFeatureStory';
import { findScenario } from '../components/findScenario';

export default { title: 'Features/Composition/IfThenElse', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

/** Shared scenario `LANDING-010 if-then-adult-roundtrip`. */
export const AllOfRoundTrip: Story = createFeatureStory(findScenario(conditionalScreenScenarios, 'LANDING-010 if-then-adult-roundtrip'));

/** Shared scenario `LANDING-010 if-then-rapid-toggle`. */
export const BatchedRapidToggle: Story = createFeatureStory(findScenario(conditionalScreenScenarios, 'LANDING-010 if-then-rapid-toggle'));

/** Shared scenario `composition.if-then-else-guard`. */
export const ElseGuard: Story = createFeatureStory(findScenario(compositionFeatureScenarios, 'composition.if-then-else-guard'));

/** Shared scenario `composition.if-nested-guard`. */
export const NestedGuard: Story = createFeatureStory(findScenario(compositionFeatureScenarios, 'composition.if-nested-guard'));

/** Shared scenario `composition.if-else-screen-rapid-toggle`. */
export const ScreenRapidToggle: Story = createFeatureStory(findScenario(compositionFeatureScenarios, 'composition.if-else-screen-rapid-toggle'));
