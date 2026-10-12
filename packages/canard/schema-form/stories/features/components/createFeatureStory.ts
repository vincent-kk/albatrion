import type { FormScenario } from '@aileron/schema-form-scenarios';
import { playScenario } from '@aileron/schema-form-scenarios';
import type { StoryObj } from '@storybook/react-vite';

import type { FeatureStory } from './FeatureStory';

/**
 * Build a story that renders one shared scenario and asserts every step in its play function.
 * @param scenario - Shared data imported from @aileron/schema-form-scenarios, never an inline schema.
 * @returns A story whose docs description is the scenario description; play failures propagate.
 */
export function createFeatureStory(scenario: FormScenario): StoryObj<typeof FeatureStory> {
  return {
    args: { scenario },
    parameters: { docs: { description: { story: scenario.description ?? scenario.name } } },
    play: async ({ args, canvasElement }) => { await playScenario(args.scenario, canvasElement); },
  };
}
