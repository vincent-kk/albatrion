import type { FormScenario } from '../types';
import { unionRenderScenarios } from './render.scenario';
import { entryTwoStepScenario } from './entry-two-step.scenario';
import { gatedEffectiveListScenario } from './gated-effective-list.scenario';
import { ruleAScenario } from './rule-a.scenario';
import { ambiguousScenario } from './ambiguous.scenario';
import { integerScenario } from './integer.scenario';
import { objectArrayScenario } from './object-array.scenario';
import { omitEmptyUnionScenario } from './omit-empty.scenario';
import { defaultFillUnionScenario } from './default-fill.scenario';
import { convergentFeedbackScenario } from './feedback-convergent.scenario';
import { nonconvergentFeedbackScenario } from './feedback-nonconvergent.scenario';

/** Ledger-named union cases and their WRITE-099 feedback variants. */
export const unionScenarios: readonly FormScenario[] = [
  entryTwoStepScenario, gatedEffectiveListScenario, ruleAScenario,
  ambiguousScenario, integerScenario, objectArrayScenario,
  omitEmptyUnionScenario, defaultFillUnionScenario,
  convergentFeedbackScenario, nonconvergentFeedbackScenario,
  ...unionRenderScenarios,
];
