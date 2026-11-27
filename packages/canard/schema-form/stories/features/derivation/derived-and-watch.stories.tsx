// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { derivationFeatureScenarios, deriveScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FeatureStory } from '../components/FeatureStory';
import { createFeatureStory } from '../components/createFeatureStory';
import { findScenario } from '../components/findScenario';

export default { title: 'Features/Derivation/DerivedAndWatch', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

/** Shared scenario `derive.derived-chain-manual-edits`. */
export const DerivedChainManualEdits: Story = createFeatureStory(findScenario(deriveScenarios, 'derive.derived-chain-manual-edits'));

/** Shared scenario `derive.derived-edge-and-reset`. */
export const DerivedEdgeAndReset: Story = createFeatureStory(findScenario(deriveScenarios, 'derive.derived-edge-and-reset'));

/** Shared scenario `derive.active-dependency-preserves-derived-edit`. */
export const ActiveDependencyPreservesDerivedEdit: Story = createFeatureStory(findScenario(deriveScenarios, 'derive.active-dependency-preserves-derived-edit'));

/** Shared scenario `derive.unset-load-and-runtime-edge`. */
export const UnsetLoadAndRuntimeEdge: Story = createFeatureStory(findScenario(deriveScenarios, 'derive.unset-load-and-runtime-edge'));

/** Shared scenario `derivation.watch-dependency`. */
export const WatchDependency: Story = createFeatureStory(findScenario(derivationFeatureScenarios, 'derivation.watch-dependency'));
