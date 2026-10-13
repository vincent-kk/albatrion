// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { nullPromotionScenarios, unionScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FeatureStory } from '../components/FeatureStory';
import { createFeatureStory } from '../components/createFeatureStory';
import { findScenario } from '../components/findScenario';

export default { title: 'Features/Composition/NullableBranch', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

/** Shared scenario `union.null-ancestor-input-promotion`. */
export const NullAncestorPromotion: Story = createFeatureStory(findScenario(unionScenarios, 'union.null-ancestor-input-promotion'));

/** Shared scenario `union.nullable-conditional-account`. */
export const ConditionalAccount: Story = createFeatureStory(findScenario(unionScenarios, 'union.nullable-conditional-account'));

/** Shared scenario `VALUE-036 loaded null retains child defaults for later input promotion`. */
export const LoadedNullDefaults: Story = createFeatureStory(findScenario(nullPromotionScenarios, 'VALUE-036 loaded null retains child defaults for later input promotion'));

/** Shared scenario `LANDING-200 child input promotes caller null without sibling filling`. */
export const NullWritePromotion: Story = createFeatureStory(findScenario(nullPromotionScenarios, 'LANDING-200 child input promotes caller null without sibling filling'));
