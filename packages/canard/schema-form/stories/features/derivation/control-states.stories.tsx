// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { controlsScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FeatureStory } from '../components/FeatureStory';
import { createFeatureStory } from '../components/createFeatureStory';
import { findScenario } from '../components/findScenario';

export default { title: 'Features/Derivation/ControlStates', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

/** Shared scenario `controls.lock-or-visibility-and`. */
export const LockOrVisibilityAnd: Story = createFeatureStory(findScenario(controlsScenarios, 'controls.lock-or-visibility-and'));

/** Shared scenario `controls.standard-read-only`. */
export const StandardReadOnly: Story = createFeatureStory(findScenario(controlsScenarios, 'controls.standard-read-only'));

/** Shared scenario `controls.children-host-expression`. */
export const ChildrenHostExpression: Story = createFeatureStory(findScenario(controlsScenarios, 'controls.children-host-expression'));

/** Shared scenario `controls.fragment-scope`. */
export const FragmentScope: Story = createFeatureStory(findScenario(controlsScenarios, 'controls.fragment-scope'));

/** Shared scenario `controls.root-keys-do-not-inherit`. */
export const RootKeysDoNotInherit: Story = createFeatureStory(findScenario(controlsScenarios, 'controls.root-keys-do-not-inherit'));
