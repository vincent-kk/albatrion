// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { deriveScenarios, findScenarioHandle, playScenario, registerScenarioHandle, unionScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { executeStoryStep } from '../../components/scenario/executeStoryStep';
import { FeatureStory } from '../components/FeatureStory';
import { createHandleProbe } from '../components/createHandleProbe';
import { createFeatureStory } from '../components/createFeatureStory';
import { findScenario } from '../components/findScenario';

export default { title: 'Features/Derivation/FeedbackBudget', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

const budget = findScenario(deriveScenarios, 'derive.feedback-budget');
const budgetProbe = createHandleProbe();

/**
 * Shared scenario `derive.feedback-budget`. A screen toggle would throw BUDGET_EXCEEDED at the end of the chain out of
 * the input's event handler, where the browser reports it as uncaught; the play runs degraded steps through the handle
 * instead, receives the throw, and keeps the scenario's output and diagnostics assertions.
 */
export const DeriveBudgetDegrades: Story = {
  args: { scenario: budget, onHandle: budgetProbe.onHandle },
  parameters: { docs: { description: { story: budget.description ?? budget.name } } },
  async play({ args, canvasElement }) {
    const handle = await budgetProbe.handle(canvasElement);
    const base = findScenarioHandle(canvasElement).adapter;
    const thrown: unknown[] = [];
    const unregister = registerScenarioHandle(canvasElement, handle, {
      ...base,
      async execute(step) {
        if (step.expect?.diagnostics?.status !== 'degraded') return base.execute(step);
        try {
          await executeStoryStep(handle, step);
        } catch (error) {
          thrown.push(error);
        }
      },
    });
    try {
      await playScenario(args.scenario, canvasElement);
      expect(thrown).toEqual([expect.objectContaining({ code: 'SCHEMA_FORM_ERROR.BUDGET_EXCEEDED' })]);
    } finally {
      unregister();
    }
  },
};

/** Shared scenario `union.feedback-nonconvergent`. */
export const TransitionNonconvergent: Story = createFeatureStory(findScenario(unionScenarios, 'union.feedback-nonconvergent'));

/** Shared scenario `union.feedback-convergent`. */
export const TransitionConvergent: Story = createFeatureStory(findScenario(unionScenarios, 'union.feedback-convergent'));
