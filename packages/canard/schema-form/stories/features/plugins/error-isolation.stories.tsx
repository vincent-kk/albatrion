// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import {
  playScenario,
  pluginsFeatureScenarios,
} from '@aileron/schema-form-scenarios';

import { formatScenarioDescription } from '../../components/panels/utils/formatScenarioDescription';
import { shouldSkipUnfocusedPlay } from '../../components/play/shouldSkipUnfocusedPlay';
import { skipPlay } from '../../components/play/skipPlay';
import { unfocusedPlayReason } from '../../components/play/unfocusedPlayReason';
import { FeatureStory } from '../components/FeatureStory';
import { findScenario } from '../components/findScenario';
import { ThrowOnTriggerInput } from './utils/ThrowOnTriggerInput';

export default {
  title: 'Features/Plugins/ErrorIsolation',
  component: FeatureStory,
  tags: ['autodocs'],
} satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

const scenario = findScenario(
  pluginsFeatureScenarios,
  'plugins.error-isolation',
);

/** Shared scenario `plugins.error-isolation` with /broken mapped to an input that throws on the trigger value. */
export const ThrowingInputFallsBackAlone: Story = {
  args: {
    scenario,
    formProps: { fieldInputMap: { '/broken': ThrowOnTriggerInput } },
  },
  parameters: {
    docs: {
      description: {
        story: formatScenarioDescription(scenario.description ?? ''),
      },
    },
  },
  async play({ args, canvasElement, step }) {
    if (shouldSkipUnfocusedPlay()) return skipPlay(step, unfocusedPlayReason);
    await playScenario(args.scenario, canvasElement);
    expect(
      canvasElement.querySelector(
        'input:is([id="/broken"], [id$=":/broken~input"]):not(label):not(legend)',
      ),
      'the throwing input is replaced by the fallback',
    ).toBeNull();
    expect(
      canvasElement.querySelector<HTMLInputElement>(
        'input:is([id="/sibling"], [id$=":/sibling~input"]):not(label):not(legend)',
      )?.value,
      'the sibling input still edits',
    ).toBe('typed');
  },
};
