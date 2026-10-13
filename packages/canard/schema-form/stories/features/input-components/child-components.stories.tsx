// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { childComponentStages, controlsScenarios, inputComponentsFeatureScenarios, mapEntryStages, playScenario } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent } from 'storybook/test';

import { shouldSkipUnfocusedPlay } from '../../components/play/shouldSkipUnfocusedPlay';
import { skipPlay } from '../../components/play/skipPlay';
import { unfocusedPlayReason } from '../../components/play/unfocusedPlayReason';

import { FeatureStory } from '../components/FeatureStory';
import { createFeatureStory } from '../components/createFeatureStory';
import { createHandleProbe } from '../components/createHandleProbe';
import { expectEventually } from '../components/expectEventually';
import { findScenario } from '../components/findScenario';
import { CardInput } from './utils/CardInput';
import { MapEntryInput } from './utils/MapEntryInput';

const childDefinitions = [
  { test: { inputType: 'input-components.card' }, Component: CardInput },
  { test: { inputType: 'input-components.map' }, Component: MapEntryInput },
];

export default { title: 'Features/InputComponents/ChildComponents', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

const scenario = findScenario(inputComponentsFeatureScenarios, 'input-components.child-components');

/** Shared scenario `input-components.child-components`: a card input draws children and reports their errors. */
export const CardWithChildErrors: Story = {
  args: { scenario, formProps: { fieldInputDefinitions: childDefinitions } },
  parameters: { docs: { description: { story: scenario.description } } },
  async play({ args, canvasElement, step }) {
    if (shouldSkipUnfocusedPlay()) return skipPlay(step, unfocusedPlayReason);
    await playScenario(args.scenario, canvasElement);
    const card = () => canvasElement.querySelector<HTMLElement>('[id="/address"][data-card-fields]')!;
    for (const [index, stage] of childComponentStages.entries()) {
      if (stage.act === 'edit') {
        await userEvent.type(canvasElement.querySelector<HTMLInputElement>(`input[id="${stage.path}"]`)!, stage.text!);
        await userEvent.tab();
      }
      await expectEventually(
        () => ({ fields: card().dataset.cardFields!.split(','), showErrors: JSON.parse(card().dataset.showErrors!), errorCounts: JSON.parse(card().dataset.errorCounts!) }),
        { fields: stage.fields, showErrors: stage.showErrors, errorCounts: stage.errorCounts },
        `address card after stage ${index} ${stage.act}`,
      );
    }
  },
};

const mapProbe = createHandleProbe();

/** Shared scenario `input-components.child-components`: the open object is edited as a whole through a terminal map input. */
export const OpenObjectAsTerminal: Story = {
  args: { scenario, formProps: { fieldInputDefinitions: childDefinitions }, onHandle: mapProbe.onHandle },
  parameters: { docs: { description: { story: scenario.description } } },
  async play({ args, canvasElement, step }) {
    if (shouldSkipUnfocusedPlay()) return skipPlay(step, unfocusedPlayReason);
    await playScenario(args.scenario, canvasElement);
    const handle = await mapProbe.handle(canvasElement);
    for (const [index, stage] of mapEntryStages.entries()) {
      await userEvent.type(canvasElement.querySelector<HTMLInputElement>('input[id="/labels"]')!, stage.entry);
      await userEvent.tab();
      await expectEventually(
        () => ({ value: handle.findNode('/labels')?.value, keyNodes: Object.keys(stage.value).filter((key) => handle.findNode(`/labels/${key}`)) }),
        { value: stage.value, keyNodes: [] },
        `labels after entry ${index} ${stage.entry}`,
      );
    }
  },
};

/** Shared scenario `controls.virtual-branch-round-trip`: a virtual input receives its member components. */
export const VirtualBranchMembers: Story = createFeatureStory(findScenario(controlsScenarios, 'controls.virtual-branch-round-trip'));
