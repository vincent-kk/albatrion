// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { eventsFeatureScenarios, playScenario, subscriptionStages } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { isArrayNode } from '../../../src';

import { FeatureStory } from '../components/FeatureStory';
import { createHandleProbe } from '../components/createHandleProbe';
import { findScenario } from '../components/findScenario';
import { readEventNames } from './utils/readEventNames';

export default { title: 'Features/Events/SubscriptionKinds', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

const scenario = findScenario(eventsFeatureScenarios, 'events.subscription-kinds');
const probe = createHandleProbe();
const changes: unknown[] = [];

/** Shared scenario `events.subscription-kinds`, driven through subscriptionStages. */
export const EventKinds: Story = {
  args: { scenario, onHandle: probe.onHandle, onChange: (value) => { changes.push(value); } },
  parameters: { docs: { description: { story: scenario.description } } },
  async play({ args, canvasElement }) {
    await playScenario(args.scenario, canvasElement);
    const handle = await probe.handle(canvasElement);
    for (const [index, stage] of subscriptionStages.entries()) {
      const node = handle.findNode(stage.path)!;
      const received: number[] = [];
      const stop = node.subscribe((event) => { received.push(event.type); });
      if (stage.unsubscribed) stop();
      const changeStart = changes.length;
      if (stage.act === 'setValue') node.setValue(stage.value);
      else if (stage.act === 'setState') node.setState({ touched: true });
      else if (stage.act === 'validate') await handle.validate();
      else if (stage.act === 'focus') handle.focus(stage.path);
      else if (stage.act === 'refresh') handle.refresh(stage.path);
      else if (isArrayNode(node)) node.push(stage.value);
      await new Promise((resolve) => requestAnimationFrame(resolve));
      stop();
      const names = readEventNames(received);
      const label = `stage ${index} ${stage.act} ${stage.path}`;
      expect(stage.includes.filter((name) => !names.includes(name)), `${label} missing kinds`).toEqual([]);
      expect(stage.excludes.filter((name) => names.includes(name)), `${label} forbidden kinds`).toEqual([]);
      if (stage.unsubscribed) expect(received, `${label} after unsubscribe`).toEqual([]);
      expect(changes.length - changeStart, `${label} onChange calls`).toBe(stage.changes);
    }
  },
};
