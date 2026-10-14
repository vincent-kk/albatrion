// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { deriveScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FeatureStory } from '../components/FeatureStory';
import { createFeatureStory } from '../components/createFeatureStory';
import { findScenario } from '../components/findScenario';

export default { title: 'Features/Derivation/InjectTo', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

/** Shared scenario `derive.inject-to-on-source-edge`. */
export const OnSourceEdge: Story = createFeatureStory(findScenario(deriveScenarios, 'derive.inject-to-on-source-edge'));

/** Shared scenario `derive.sibling-injection-branch`. */
export const SiblingInjectionBranch: Story = createFeatureStory(findScenario(deriveScenarios, 'derive.sibling-injection-branch'));

/** Shared scenario `derive.parent-array-injection`. */
export const ParentAndArrayTargets: Story = createFeatureStory(findScenario(deriveScenarios, 'derive.parent-array-injection'));

/** Shared scenario `derive.reset-subtree-inject-scope`. */
export const ResetSubtreeScope: Story = createFeatureStory(findScenario(deriveScenarios, 'derive.reset-subtree-inject-scope'));

/** Shared scenario `derive.undefined-injection-stops`. */
export const UndefinedInjectionStops: Story = createFeatureStory(findScenario(deriveScenarios, 'derive.undefined-injection-stops'));

/** Shared scenario `derive.same-target-rank`. */
export const SameTargetRank: Story = createFeatureStory(findScenario(deriveScenarios, 'derive.same-target-rank'));

/** Shared scenario `derive.injection-preserves-null-ancestor`. */
export const InjectionPreservesNullAncestor: Story = createFeatureStory(findScenario(deriveScenarios, 'derive.injection-preserves-null-ancestor'));

/** Shared scenario `derive.derived-preserves-null-ancestor`. */
export const DerivedPreservesNullAncestor: Story = createFeatureStory(findScenario(deriveScenarios, 'derive.derived-preserves-null-ancestor'));
