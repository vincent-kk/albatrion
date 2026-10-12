// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import {
  inputComponentsFeatureScenarios, inputResolutionCases, inputResolutionPluginDefinition, playScenario,
} from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { registerPlugin } from '../../../src';

import { FeatureStory } from '../components/FeatureStory';
import { expectEventually } from '../components/expectEventually';
import { findScenario } from '../components/findScenario';
import { readWinner } from './utils/readWinner';
import { toDefinitions } from './utils/toDefinitions';
import { toInputMap } from './utils/toInputMap';
import { withInlineInputs } from './utils/withInlineInputs';

// Plugin definitions are global and prepend on every registration; this one matches only the probe formType of this family.
registerPlugin({ formTypeInputDefinitions: toDefinitions([inputResolutionPluginDefinition]) });

export default { title: 'Features/InputComponents/InputResolution', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

const scenario = findScenario(inputComponentsFeatureScenarios, 'input-components.input-resolution');

/**
 * Build one resolution story from its labelled sources.
 * @param label - Case label in inputResolutionCases.
 * @returns A story whose play reads the winner rendered at each probe field.
 */
const resolutionStory = (label: string): Story => {
  const item = inputResolutionCases.find((entry) => entry.label === label)!;
  return {
    args: {
      scenario: item.inline ? withInlineInputs(scenario, item.inline) : scenario,
      formProps: {
        ...(item.map && { formTypeInputMap: toInputMap(item.map) }),
        ...(item.form && { formTypeInputDefinitions: toDefinitions(item.form) }),
      },
      ...(item.provider && { providerProps: { formTypeInputDefinitions: toDefinitions(item.provider) } }),
    },
    parameters: { docs: { description: { story: `${scenario.description} Case: ${label}.` } } },
    async play({ args, canvasElement }) {
      await playScenario(args.scenario, canvasElement);
      await expectEventually(
        () => Object.fromEntries(Object.keys(item.winners).map((path) => [path, readWinner(canvasElement, path)])),
        item.winners,
        `winners in ${label}`,
      );
    },
  };
};

/** Shared scenario `input-components.input-resolution`: inline, map, Form, and Provider sources all present. */
export const AllFiveLevels: Story = resolutionStory('AllFiveLevels');
/** Shared scenario `input-components.input-resolution`: Provider definitions win over the plugin. */
export const ProviderOverPlugin: Story = resolutionStory('ProviderOverPlugin');
/** Shared scenario `input-components.input-resolution`: a non-matching Form definition falls through to the plugin. */
export const PluginLast: Story = resolutionStory('PluginLast');
/** Shared scenario `input-components.input-resolution`: an inline null renders no input although the map matches. */
export const InlineNullHidesInput: Story = resolutionStory('InlineNullHidesInput');
