// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import {
  externalErrorStages, nodeExternalError, playScenario, validationStateFeatureScenarios,
} from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent } from 'storybook/test';

import { FeatureStory } from '../components/FeatureStory';
import { findScenario } from '../components/findScenario';
import { createHandleProbe } from './utils/createHandleProbe';
import { expectEventually } from './utils/expectEventually';
import { readKeywords } from './utils/readKeywords';
import { readShownMessage } from './utils/readShownMessage';

export default { title: 'Features/ValidationState/ExternalErrors', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

const scenario = findScenario(validationStateFeatureScenarios, 'validation-state.external-errors');
const errorsPropProbe = createHandleProbe();
const nodeProbe = createHandleProbe();

/** Shared scenario `validation-state.external-errors`, stepping the errors prop through externalErrorStages. */
export const ErrorsPropStages: Story = {
  args: { scenario, formProps: { showError: true }, propStages: externalErrorStages.map((stage) => ({ errors: stage.errors })), onHandle: errorsPropProbe.onHandle },
  parameters: { docs: { description: { story: scenario.description } } },
  async play({ args, canvasElement }) {
    await playScenario(args.scenario, canvasElement);
    const handle = await errorsPropProbe.handle(canvasElement);
    for (const [index, stage] of externalErrorStages.entries()) {
      if (index > 0) await userEvent.click(canvasElement.querySelector<HTMLButtonElement>('button[aria-label="Apply next form props"]')!);
      await expectEventually(() => readKeywords(handle, stage.expected), stage.expected, `issues at stage ${stage.label}`);
      for (const [path, text] of Object.entries(stage.shown)) await expectEventually(() => readShownMessage(canvasElement, path), text, `message at ${path}, stage ${stage.label}`);
    }
  },
};

/** Shared scenario `validation-state.external-errors`, setting and clearing one node's external errors through its API. */
export const NodeSetAndClear: Story = {
  args: { scenario, formProps: { showError: true }, onHandle: nodeProbe.onHandle },
  parameters: { docs: { description: { story: 'A consumer sets external issues on one node and clears them; only that node changes.' } } },
  async play({ args, canvasElement }) {
    await playScenario(args.scenario, canvasElement);
    const handle = await nodeProbe.handle(canvasElement);
    const node = handle.findNode(nodeExternalError.path)!;
    const held = () => readKeywords(handle, { [nodeExternalError.path]: [], '/name': [] });
    node.setExternalErrors(nodeExternalError.issues);
    await expectEventually(held, { [nodeExternalError.path]: ['server'], '/name': [] }, 'issues after setExternalErrors');
    await expectEventually(() => readShownMessage(canvasElement, nodeExternalError.path), nodeExternalError.issues[0].message, 'message after setExternalErrors');
    node.clearExternalErrors();
    await expectEventually(held, { [nodeExternalError.path]: [], '/name': [] }, 'issues after clearExternalErrors');
    await expectEventually(() => readShownMessage(canvasElement, nodeExternalError.path), '', 'message after clearExternalErrors');
  },
};
