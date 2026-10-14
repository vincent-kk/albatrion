// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { emptyDraftScenario, nonNullableEmptyDraftScenario, nullableScreenScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FeatureStory } from '../components/FeatureStory';
import { createFeatureStory } from '../components/createFeatureStory';
import { findScenario } from '../components/findScenario';

export default { title: 'Features/Values/EmptyAndClear', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

/** Shared scenario `REACT-027 clearing a nullable string sends null instead of an empty string`. */
export const NullableClearSendsNull: Story = createFeatureStory(findScenario([emptyDraftScenario, nonNullableEmptyDraftScenario], 'REACT-027 clearing a nullable string sends null instead of an empty string'));

/** Shared scenario `LANDING-196 non-nullable empty input sends undefined`. */
export const NonNullableClearSendsUndefined: Story = createFeatureStory(findScenario([emptyDraftScenario, nonNullableEmptyDraftScenario], 'LANDING-196 non-nullable empty input sends undefined'));

/** Shared scenario `TEST-005 nullable-contact-fields`. */
export const NullableContactFields: Story = createFeatureStory(findScenario(nullableScreenScenarios, 'TEST-005 nullable-contact-fields'));

/** Shared scenario `TEST-005 nullable-price-limits`. */
export const NullablePriceLimits: Story = createFeatureStory(findScenario(nullableScreenScenarios, 'TEST-005 nullable-price-limits'));

/** Shared scenario `TEST-005 nullable-boolean-null-false`. */
export const NullableBooleanNullFalse: Story = createFeatureStory(findScenario(nullableScreenScenarios, 'TEST-005 nullable-boolean-null-false'));

/** Shared scenario `TEST-005 nullable-required-mix`. */
export const NullableRequiredMix: Story = createFeatureStory(findScenario(nullableScreenScenarios, 'TEST-005 nullable-required-mix'));

/** Shared scenario `TEST-005 pure-null-field`. */
export const PureNullField: Story = createFeatureStory(findScenario(nullableScreenScenarios, 'TEST-005 pure-null-field'));
