// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { deferredMountStages, playScenario, scaleFeatureScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { shouldSkipUnfocusedPlay } from '../../components/play/shouldSkipUnfocusedPlay';
import { skipPlay } from '../../components/play/skipPlay';
import { unfocusedPlayReason } from '../../components/play/unfocusedPlayReason';

import { FeatureStory } from '../components/FeatureStory';
import { createHandleProbe } from '../components/createHandleProbe';
import { expectEventually } from '../components/expectEventually';
import { findScenario } from '../components/findScenario';
import { toVirtualization } from './utils/toVirtualization';

export default { title: 'Features/Scale/DeferredMount', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

const scenario = findScenario(scaleFeatureScenarios, 'scale.deferred-mount');
const probe = createHandleProbe();

/** Shared scenario `scale.deferred-mount`, then the reveals in deferredMountStages. */
export const RevealOnViewAndFocus: Story = {
  args: { scenario, formProps: { virtualization: toVirtualization() }, onHandle: probe.onHandle },
  parameters: { docs: { description: { story: scenario.description } } },
  async play({ args, canvasElement, step }) {
    if (shouldSkipUnfocusedPlay()) return skipPlay(step, unfocusedPlayReason);
    await playScenario(args.scenario, canvasElement);
    const handle = await probe.handle(canvasElement);
    for (const [index, stage] of deferredMountStages.entries()) {
      if (stage.act === 'focus') handle.focus(stage.path);
      else if (stage.act === 'scroll') canvasElement.querySelector(`[data-path="${stage.path}"]`)?.scrollIntoView({ block: 'center' });
      await expectEventually(() => {
        const input = canvasElement.querySelector(`input[id="${stage.path}"]`);
        return { mounted: Boolean(input), focused: input !== null && document.activeElement === input };
      }, { mounted: stage.mounted, focused: stage.focused }, `stage ${index} ${stage.act} ${stage.path}`);
    }
  },
};
