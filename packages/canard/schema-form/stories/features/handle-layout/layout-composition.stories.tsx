// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { handleLayoutFeatureScenarios, layoutPlan, playScenario } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent } from 'storybook/test';

import { shouldSkipUnfocusedPlay } from '../../components/play/shouldSkipUnfocusedPlay';
import { skipPlay } from '../../components/play/skipPlay';
import { unfocusedPlayReason } from '../../components/play/unfocusedPlayReason';

import { Form } from '../../../src';

import { FeatureStory } from '../components/FeatureStory';
import { createHandleProbe } from '../components/createHandleProbe';
import { expectEventually } from '../components/expectEventually';
import { findScenario } from '../components/findScenario';

export default { title: 'Features/HandleLayout/LayoutComposition', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

const scenario = findScenario(handleLayoutFeatureScenarios, 'handle-layout.layout-composition');
const probe = createHandleProbe();

/**
 * Draw layoutPlan with the Form namespace components; the repeated path is drawn twice inside marked copies.
 * @returns The layout for FeatureStory's children function.
 */
const layout = () => <>
  {layoutPlan.inputs.map((path) => <div key={path}><Form.Label path={path} /><Form.Input path={path} /></div>)}
  <div data-copy="second"><Form.Input path={layoutPlan.repeated} /></div>
  <div data-error-slot={layoutPlan.error}><Form.Error path={layoutPlan.error} /></div>
  <Form.Render path={layoutPlan.render}>{({ value }) => <output data-render={layoutPlan.render}>{String(value ?? '')}</output>}</Form.Render>
</>;

/** Shared scenario `handle-layout.layout-composition` with the consumer layout from layoutPlan. */
export const PathLayout: Story = {
  args: { scenario, layout, formProps: { showError: true }, onHandle: probe.onHandle },
  parameters: { docs: { description: { story: scenario.description } } },
  async play({ args, canvasElement, step }) {
    if (shouldSkipUnfocusedPlay()) return skipPlay(step, unfocusedPlayReason);
    await playScenario(args.scenario, canvasElement);
    const handle = await probe.handle(canvasElement);
    const copies = () => Array.from(canvasElement.querySelectorAll<HTMLInputElement>(`input[id="${layoutPlan.repeated}"]`));
    await userEvent.type(copies()[0], layoutPlan.typed);
    await expectEventually(() => ({
      copies: copies().map((input) => input.value),
      omitted: layoutPlan.omitted.map((path) => Boolean(canvasElement.querySelector(`[id="${path}"]`))),
      rendered: canvasElement.querySelector(`[data-render="${layoutPlan.render}"]`)?.textContent,
      error: Boolean(canvasElement.querySelector(`[data-error-slot="${layoutPlan.error}"]`)?.textContent?.trim()),
      output: handle.getValue(),
    }), {
      copies: layoutPlan.copiesAfterTyping, omitted: [false], rendered: 'rendered', error: true,
      output: { title: 'Plan v2', count: 9, enabled: true, note: 'rendered' },
    }, 'layout after typing into the first copy');
  },
};
