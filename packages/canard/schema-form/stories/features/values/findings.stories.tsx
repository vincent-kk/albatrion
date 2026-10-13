// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import type { Meta, StoryObj } from '@storybook/react-vite';

import { valuesFindingScenarios } from '@aileron/schema-form-scenarios';

import { FeatureStory } from '../components/FeatureStory';
import { createFeatureStory } from '../components/createFeatureStory';
import { findScenario } from '../components/findScenario';

export default {
  title: 'Features/Values/Findings',
  component: FeatureStory,
  tags: ['autodocs'],
} satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

/** Shared scenario for the verbatim display of out-of-domain enum and date values. */
export const RestrictedInputOutOfDomain: Story = createFeatureStory(
  findScenario(
    valuesFindingScenarios,
    'values.finding-restricted-input-out-of-domain',
  ),
);
