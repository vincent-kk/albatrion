// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import {
  type ShowErrorName, forcedShowErrorCase, playScenario, showErrorCases, validationStateFeatureScenarios,
} from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent } from 'storybook/test';

import { shouldSkipUnfocusedPlay } from '../../components/play/shouldSkipUnfocusedPlay';
import { skipPlay } from '../../components/play/skipPlay';
import { unfocusedPlayReason } from '../../components/play/unfocusedPlayReason';

import { FeatureStory } from '../components/FeatureStory';
import { findScenario } from '../components/findScenario';
import { createHandleProbe } from '../components/createHandleProbe';
import { expectEventually } from '../components/expectEventually';
import { readShownMessage } from './utils/readShownMessage';
import { toShowError } from './utils/toShowError';

export default { title: 'Features/ValidationState/ShowError', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

const scenario = findScenario(validationStateFeatureScenarios, 'validation-state.show-error');

/**
 * Build one display policy story: the message is checked on load, after typing, and after blur.
 * @param policy - Case name in showErrorCases.
 * @returns A story whose play drives /code from the screen.
 */
const policyStory = (policy: ShowErrorName): Story => {
  const item = showErrorCases.find((entry) => entry.policy === policy)!;
  return {
    args: { scenario, formProps: { showError: toShowError(policy) } },
    parameters: { docs: { description: { story: `${scenario.description} Policy: ${policy}.` } } },
    async play({ args, canvasElement, step }) {
      if (shouldSkipUnfocusedPlay()) return skipPlay(step, unfocusedPlayReason);
      await playScenario(args.scenario, canvasElement);
      const shown = () => readShownMessage(canvasElement, '/code') !== '';
      await expectEventually(shown, item.atLoad, 'message on load');
      await userEvent.type(canvasElement.querySelector<HTMLInputElement>('input[id="/code"]')!, 'd');
      await expectEventually(shown, item.afterInput, 'message after input');
      await userEvent.tab();
      await expectEventually(shown, item.afterBlur, 'message after blur');
      await userEvent.tab();
      await expectEventually(() => readShownMessage(canvasElement, '/tag') !== '', item.afterTouchOnly, 'message under /tag after focus only');
    },
  };
};

/** Shared scenario `validation-state.show-error` with ShowError.Always. */
export const Always: Story = policyStory('Always');
/** Shared scenario `validation-state.show-error` with ShowError.Never. */
export const Never: Story = policyStory('Never');
/** Shared scenario `validation-state.show-error` with ShowError.Dirty. */
export const Dirty: Story = policyStory('Dirty');
/** Shared scenario `validation-state.show-error` with ShowError.Touched. */
export const Touched: Story = policyStory('Touched');
/** Shared scenario `validation-state.show-error` with ShowError.DirtyTouched, the default policy. */
export const DirtyTouched: Story = policyStory('DirtyTouched');

const forcedProbe = createHandleProbe();

/** Shared scenario `validation-state.show-error`: the handle's showError overrides a Never policy and showError(false) hides it again. */
export const HandleOverridesPolicy: Story = {
  args: { scenario, formProps: { showError: toShowError(forcedShowErrorCase.policy) }, onHandle: forcedProbe.onHandle },
  parameters: { docs: { description: { story: `${scenario.description} Policy: ${forcedShowErrorCase.policy}, then the handle's showError.` } } },
  async play({ args, canvasElement, step }) {
    if (shouldSkipUnfocusedPlay()) return skipPlay(step, unfocusedPlayReason);
    await playScenario(args.scenario, canvasElement);
    const handle = await forcedProbe.handle(canvasElement);
    const shown = () => readShownMessage(canvasElement, '/code') !== '';
    handle.showError();
    await expectEventually(shown, forcedShowErrorCase.afterShow, 'message after showError()');
    handle.showError(false);
    await expectEventually(shown, forcedShowErrorCase.afterHide, 'message after showError(false)');
  },
};
