// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { type ValidationModeName, playScenario, validationModeCases, validationStateFeatureScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FeatureStory } from '../components/FeatureStory';
import { findScenario } from '../components/findScenario';
import { createHandleProbe } from './utils/createHandleProbe';
import { expectEventually } from './utils/expectEventually';
import { readKeywords } from './utils/readKeywords';
import { toValidationMode } from './utils/toValidationMode';

export default { title: 'Features/ValidationState/ValidationModes', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

const scenario = findScenario(validationStateFeatureScenarios, 'validation-state.mode-timing');

/**
 * Build one mode story: shared input steps, then the issues held before and after an explicit validate.
 * @param mode - Case name in validationModeCases.
 * @returns A story whose play reads node issues without requesting validation first.
 */
const modeStory = (mode: ValidationModeName): Story => {
  const item = validationModeCases.find((entry) => entry.mode === mode)!;
  const probe = createHandleProbe();
  return {
    args: { scenario, formProps: { validationMode: toValidationMode(mode) }, onHandle: probe.onHandle },
    parameters: { docs: { description: { story: `${scenario.description} Mode: ${mode}.` } } },
    async play({ args, canvasElement }) {
      await playScenario(args.scenario, canvasElement);
      const handle = await probe.handle(canvasElement);
      await expectEventually(() => readKeywords(handle, item.afterInput), item.afterInput, 'issues after input');
      await handle.validate();
      await expectEventually(() => readKeywords(handle, item.afterRequest), item.afterRequest, 'issues after an explicit request');
    },
  };
};

/** Shared scenario `validation-state.mode-timing` with ValidationMode.OnChange. */
export const OnChange: Story = modeStory('OnChange');
/** Shared scenario `validation-state.mode-timing` with ValidationMode.OnRequest. */
export const OnRequest: Story = modeStory('OnRequest');
/** Shared scenario `validation-state.mode-timing` with ValidationMode.None. */
export const None: Story = modeStory('None');
