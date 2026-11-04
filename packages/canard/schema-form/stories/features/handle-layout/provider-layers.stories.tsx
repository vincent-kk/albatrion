// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { handleLayoutFeatureScenarios, playScenario, providerLayers } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { shouldSkipUnfocusedPlay } from '../../components/play/shouldSkipUnfocusedPlay';
import { skipPlay } from '../../components/play/skipPlay';
import { unfocusedPlayReason } from '../../components/play/unfocusedPlayReason';

import { FeatureStory } from '../components/FeatureStory';
import { createHandleProbe } from '../components/createHandleProbe';
import { expectEventually } from '../components/expectEventually';
import { findScenario } from '../components/findScenario';

export default { title: 'Features/HandleLayout/ProviderLayers', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

const scenario = findScenario(handleLayoutFeatureScenarios, 'handle-layout.provider-layers');
const probe = createHandleProbe();

/** Shared scenario `handle-layout.provider-layers` under the provider and Form props from providerLayers. */
export const ContextAndSettings: Story = {
  args: { scenario, providerProps: providerLayers.provider, formProps: providerLayers.form, onHandle: probe.onHandle },
  parameters: { docs: { description: { story: scenario.description } } },
  async play({ args, canvasElement, step }) {
    if (shouldSkipUnfocusedPlay()) return skipPlay(step, unfocusedPlayReason);
    await playScenario(args.scenario, canvasElement);
    const handle = await probe.handle(canvasElement);
    await expectEventually(() => ({
      titleReadOnly: handle.findNode('/title')!.isReadOnly,
      secretVisible: handle.findNode('/secret')!.isVisible,
      codeMessageShown: Boolean(canvasElement.querySelector('[data-path="/code"] em')?.textContent?.trim()),
    }), providerLayers.expected, 'merged provider and Form layers');
  },
};
