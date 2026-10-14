// Loaded by Storybook CSF through the composite glob in .storybook/main.ts; each named export is one story.
import { amountInputPlan } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';

import { FeatureStory } from '../features/components/FeatureStory';
import { expectEventually } from '../features/components/expectEventually';
import { FormattedAmountInput } from './utils/consumerInputs';
import { createCompositeStory } from './utils/createCompositeStory';
import { submitButtonLayout } from './utils/submitButtonLayout';

/**
 * Load Vitest's runtime-owned CDP context after the composite play's Browser Mode guard.
 * @returns The Browser Mode context used for native number-input drafts.
 */
const browserContext = () => import('@vitest/browser/context');

export default { title: 'Composite/CX04AmountInput', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

/** Shared composite case `composite.cx04-amount-input`, then formatter typing into /price, a native badInput draft, and an Enter submit. */
export const Case: Story = createCompositeStory('composite.cx04-amount-input', {
  cdpSkipReason: 'CDP is unavailable in ordinary Storybook; type into /price to check formatting, enter an incomplete exponent into /count to confirm the committed count is kept, and press Enter in /memo to confirm one submission; this play runs in Vitest Browser Mode (yarn workspace @canard/schema-form test --run --project storybook)',
  layout: submitButtonLayout,
  formProps: { fieldInputMap: { '/price': FormattedAmountInput } },
  async after({ canvasElement, handle, submitted }) {
    const price = canvasElement.querySelector<HTMLInputElement>('input[id="/price"]')!;
    await userEvent.type(price, amountInputPlan.typed);
    await expectEventually(() => ({ shown: price.value, value: handle.findNode('/price')!.value }), { shown: amountInputPlan.shown, value: amountInputPlan.value }, 'formatter input');
    const count = canvasElement.querySelector<HTMLInputElement>('input[id="/count"]')!;
    await userEvent.type(count, amountInputPlan.validDigit);
    const { cdp } = await browserContext();
    await cdp().send('Input.insertText', { text: amountInputPlan.badSuffix });
    await expectEventually(() => ({ badInput: count.validity.badInput, value: handle.findNode('/count')!.value }), { badInput: true, value: amountInputPlan.keptCount }, 'native number draft');
    const before = submitted.length;
    await userEvent.type(canvasElement.querySelector<HTMLInputElement>('input[id="/memo"]')!, '{Enter}');
    await expectEventually(() => submitted.length - before, 1, 'Enter submits once');
    expect(submitted.at(-1)).toMatchObject({ amount: amountInputPlan.value, price: amountInputPlan.value, count: amountInputPlan.keptCount });
  },
});
