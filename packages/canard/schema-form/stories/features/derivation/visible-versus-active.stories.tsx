// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { branchExitScenario, controlsScenarios, derivationFeatureScenarios, exitScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FeatureStory } from '../components/FeatureStory';
import { createFeatureStory } from '../components/createFeatureStory';
import { findScenario } from '../components/findScenario';

export default { title: 'Features/Derivation/VisibleVersusActive', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

/** Shared scenario `derivation.visible-versus-active`. */
export const SideBySide: Story = createFeatureStory(findScenario(derivationFeatureScenarios, 'derivation.visible-versus-active'));

/** Shared scenario `controls.visible-preserves-value`. */
export const VisiblePreservesValue: Story = createFeatureStory(findScenario(controlsScenarios, 'controls.visible-preserves-value'));

/** Shared scenario `exit.unset-inactive`. */
export const UnsetInactive: Story = createFeatureStory(findScenario(exitScenarios, 'exit.unset-inactive'));

/** Shared scenario `exit.retain-inactive`. */
export const RetainInactive: Story = createFeatureStory(findScenario(exitScenarios, 'exit.retain-inactive'));

/** Shared scenario `LANDING-032 branch roundtrip preserves user input and excludes inactive output`. */
export const BranchRoundTrip: Story = createFeatureStory(findScenario([branchExitScenario], 'LANDING-032 branch roundtrip preserves user input and excludes inactive output'));

/** Shared scenario `controls.fields-exit-policy-layer`. */
export const ChildrenExitPolicyLayer: Story = createFeatureStory(findScenario(controlsScenarios, 'controls.fields-exit-policy-layer'));

/** Shared scenario `controls.fragment-exit-policy-layer`. */
export const FragmentExitPolicyLayer: Story = createFeatureStory(findScenario(controlsScenarios, 'controls.fragment-exit-policy-layer'));

/** Shared scenario `controls.expression-exit-previous-commit`. */
export const ExpressionExitPreviousCommit: Story = createFeatureStory(findScenario(controlsScenarios, 'controls.expression-exit-previous-commit'));
