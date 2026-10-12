// Loaded by Storybook CSF through the composite glob in .storybook/main.ts; each named export is one story.
import { imeSwitchPlan } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { FeatureStory } from '../features/components/FeatureStory';
import { expectEventually } from '../features/components/expectEventually';
import { createCompositeStory } from './utils/createCompositeStory';

/** Load Vitest Browser Mode's CDP and locators at play time; the module throws outside Browser Mode, so plain storybook dev cannot run this play. */
const browserContext = () => import('@vitest/browser/context');

export default { title: 'Composite/CX11ImeDuringSwitch', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

/** Shared composite case `composite.cx11-ime-during-switch`, then a CDP composition interrupted by a handle branch switch. */
export const Case: Story = createCompositeStory('composite.cx11-ime-during-switch', {
  async after({ canvasElement, handle }) {
    const { cdp, page } = await browserContext();
    const session = cdp();
    let heldAtSwitch: unknown;
    const input = canvasElement.querySelector<HTMLInputElement>('input[id="/text"]')!;
    await page.elementLocator(input).click();
    try {
      await session.send('Input.imeSetComposition', { text: imeSwitchPlan.composing, selectionStart: 1, selectionEnd: 1 });
      await expect(input.value, 'the composing syllable is drawn').toBe(imeSwitchPlan.committed + imeSwitchPlan.composing);
      // EVENT-065 does not say whether composing text reaches the node, so the story keeps whatever it holds at the switch.
      heldAtSwitch = handle.findNode('/text')!.value;
      handle.findNode('/kind')!.setValue('b');
      await expectEventually(() => Boolean(canvasElement.querySelector('input[id="/text"]')), false, 'the switch unmounts the composing input');
    } finally {
      await session.send('Input.imeSetComposition', { text: '', selectionStart: 0, selectionEnd: 0 });
    }
    await expectEventually(() => ({ value: handle.getValue() }), { value: { kind: 'b' } }, 'nothing landed in the closed branch');
    handle.findNode('/kind')!.setValue('a');
    await expectEventually(() => handle.findNode('/text')?.value, heldAtSwitch, 'switching back restores the raw value held at the switch');
  },
});
