// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent } from 'storybook/test';

import {
  type ErrorVisibilityName,
  errorVisibilityCases,
  forcedRevealErrorsCase,
  playScenario,
  validationStateFeatureScenarios,
} from '@aileron/schema-form-scenarios';

import { formatScenarioDescription } from '../../components/panels/utils/formatScenarioDescription';
import { shouldSkipUnfocusedPlay } from '../../components/play/shouldSkipUnfocusedPlay';
import { skipPlay } from '../../components/play/skipPlay';
import { unfocusedPlayReason } from '../../components/play/unfocusedPlayReason';
import { FeatureStory } from '../components/FeatureStory';
import { createHandleProbe } from '../components/createHandleProbe';
import { expectEventually } from '../components/expectEventually';
import { findScenario } from '../components/findScenario';
import { readShownMessage } from './utils/readShownMessage';
import { toErrorVisibility } from './utils/toErrorVisibility';

export default {
  title: 'Features/ValidationState/ErrorVisibility',
  component: FeatureStory,
  tags: ['autodocs'],
} satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

const scenario = findScenario(
  validationStateFeatureScenarios,
  'validation-state.error-visibility',
);

/**
 * Build one display policy story: the message is checked on load, after typing, and after blur.
 * @param policy - Case name in errorVisibilityCases.
 * @returns A story whose play drives /code from the screen.
 */
const policyStory = (policy: ErrorVisibilityName): Story => {
  const item = errorVisibilityCases.find((entry) => entry.policy === policy)!;
  return {
    args: {
      scenario,
      formProps: { errorVisibility: toErrorVisibility(policy) },
    },
    parameters: {
      docs: {
        description: { story: `${formatScenarioDescription(scenario.description ?? '')} Policy: ${policy}.` },
      },
    },
    async play({ args, canvasElement, step }) {
      if (shouldSkipUnfocusedPlay()) return skipPlay(step, unfocusedPlayReason);
      await playScenario(args.scenario, canvasElement);
      const shown = () => readShownMessage(canvasElement, '/code') !== '';
      await expectEventually(shown, item.atLoad, 'message on load');
      await userEvent.type(
        canvasElement.querySelector<HTMLInputElement>('input[id="/code"]')!,
        'd',
      );
      await expectEventually(shown, item.afterInput, 'message after input');
      await userEvent.tab();
      await expectEventually(shown, item.afterBlur, 'message after blur');
      await userEvent.tab();
      await expectEventually(
        () => readShownMessage(canvasElement, '/tag') !== '',
        item.afterTouchOnly,
        'message under /tag after focus only',
      );
    },
  };
};

/** Shared scenario `validation-state.error-visibility` with ErrorVisibility.Always. */
export const Always: Story = policyStory('Always');
/** Shared scenario `validation-state.error-visibility` with ErrorVisibility.Never. */
export const Never: Story = policyStory('Never');
/** Either editing or touching qualifies the field. */
export const AfterEditOrTouch: Story = policyStory('AfterEditOrTouch');
/** Shared scenario `validation-state.error-visibility` with ErrorVisibility.AfterEdit. */
export const AfterEdit: Story = policyStory('AfterEdit');
/** Shared scenario `validation-state.error-visibility` with ErrorVisibility.AfterTouch. */
export const AfterTouch: Story = policyStory('AfterTouch');
/** Shared scenario `validation-state.error-visibility` with ErrorVisibility.AfterEditAndTouch, the default policy. */
export const AfterEditAndTouch: Story = policyStory('AfterEditAndTouch');

const forcedProbe = createHandleProbe();

/** Shared scenario `validation-state.error-visibility`: the handle's errorVisibility overrides a Never policy and resetErrorVisibility() hides it again. */
export const HandleOverridesPolicy: Story = {
  args: {
    scenario,
    formProps: {
      errorVisibility: toErrorVisibility(forcedRevealErrorsCase.policy),
    },
    onHandle: forcedProbe.onHandle,
  },
  parameters: {
    docs: {
      description: {
        story: `${formatScenarioDescription(scenario.description ?? '')} Policy: ${forcedRevealErrorsCase.policy}, then the handle's errorVisibility.`,
      },
    },
  },
  async play({ args, canvasElement, step }) {
    if (shouldSkipUnfocusedPlay()) return skipPlay(step, unfocusedPlayReason);
    await playScenario(args.scenario, canvasElement);
    const handle = await forcedProbe.handle(canvasElement);
    const shown = () => readShownMessage(canvasElement, '/code') !== '';
    handle.revealErrors();
    await expectEventually(
      shown,
      forcedRevealErrorsCase.afterShow,
      'message after revealErrors()',
    );
    handle.resetErrorVisibility();
    await expectEventually(
      shown,
      forcedRevealErrorsCase.afterHide,
      'message after resetErrorVisibility()',
    );
  },
};
