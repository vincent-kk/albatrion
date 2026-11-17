// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { fillScenarios, nestedFillScenarios, valuesFeatureScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FeatureStory } from '../components/FeatureStory';
import { createFeatureStory } from '../components/createFeatureStory';
import { findScenario } from '../components/findScenario';

export default { title: 'Features/Values/Defaults', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

/** Shared scenario `values.default-layers`. */
export const DefaultLayers: Story = createFeatureStory(findScenario(valuesFeatureScenarios, 'values.default-layers'));

/** Shared scenario `fill.mount-default`. */
export const MountDefault: Story = createFeatureStory(findScenario(fillScenarios, 'fill.mount-default'));

/** Shared scenario `fill.appearing-default`. */
export const AppearingDefault: Story = createFeatureStory(findScenario(fillScenarios, 'fill.appearing-default'));

/** Shared scenario `LANDING-116 nested schema and external defaults survive reset without minItems filling`. */
export const NestedExternalDefaults: Story = createFeatureStory(findScenario(nestedFillScenarios, 'LANDING-116 nested schema and external defaults survive reset without minItems filling'));
