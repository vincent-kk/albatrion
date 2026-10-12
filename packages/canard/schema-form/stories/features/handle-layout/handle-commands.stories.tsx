// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { handleCommandStages, handleLayoutFeatureScenarios, playScenario } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FeatureStory } from '../components/FeatureStory';
import { createHandleProbe } from '../components/createHandleProbe';
import { expectEventually } from '../components/expectEventually';
import { findScenario } from '../components/findScenario';

export default { title: 'Features/HandleLayout/HandleCommands', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

const scenario = findScenario(handleLayoutFeatureScenarios, 'handle-layout.handle-commands');
const probe = createHandleProbe();

/** Shared scenario `handle-layout.handle-commands`, driven through handleCommandStages. */
export const FocusSelectRefresh: Story = {
  args: { scenario, onHandle: probe.onHandle },
  parameters: { docs: { description: { story: scenario.description } } },
  async play({ args, canvasElement }) {
    await playScenario(args.scenario, canvasElement);
    const handle = await probe.handle(canvasElement);
    const inputAt = (path: string) => canvasElement.querySelector<HTMLInputElement>(`input[id="${path}"]`);
    for (const [index, stage] of handleCommandStages.entries()) {
      const before = inputAt(stage.path);
      if (stage.act === 'focus' || stage.act === 'focusMissing') handle.focus(stage.path);
      else if (stage.act === 'select') handle.select(stage.path);
      else handle.refresh(stage.path);
      await expectEventually(() => {
        const active = document.activeElement;
        const selection = active instanceof HTMLInputElement && active.selectionStart !== active.selectionEnd ? [active.selectionStart, active.selectionEnd] : null;
        return {
          activeId: active?.id, selection, replaced: Boolean(before) && inputAt(stage.path) !== before,
          values: { first: handle.findNode('/first')?.value, second: handle.findNode('/second')?.value },
        };
      }, { activeId: stage.activeId, selection: stage.selection, replaced: stage.replaced, values: { first: 'alpha', second: 'beta' } },
      `after stage ${index} ${stage.act} ${stage.path}`);
    }
  },
};
