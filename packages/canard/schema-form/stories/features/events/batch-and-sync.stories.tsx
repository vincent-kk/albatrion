// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { eventsFeatureScenarios, notifyScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FeatureStory } from '../components/FeatureStory';
import { createFeatureStory } from '../components/createFeatureStory';
import { findScenario } from '../components/findScenario';

export default { title: 'Features/Events/BatchAndSync', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

/** Shared scenario `events.batch-sync`. */
export const NestedBatchAndUnchangedWrite: Story = createFeatureStory(findScenario(eventsFeatureScenarios, 'events.batch-sync'));

/** Shared scenario `notify.delivery-order`. */
export const DeliveryOrder: Story = createFeatureStory(findScenario(notifyScenarios, 'notify.delivery-order'));
