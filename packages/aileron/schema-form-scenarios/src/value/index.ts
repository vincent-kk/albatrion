import type { FormScenario } from '../types';
export { referenceSchemaScenario } from './reference-schema.scenario';
export { packageEntryRenderScenario } from './package-entry-render.scenario';
export { nullableScreenScenarios } from './nullable-screen.scenario';
export { nullPromotionScenarios } from './null-promotion.scenario';
export { emptyDraftScenario, nonNullableEmptyDraftScenario } from './empty-draft.scenario';
import { rootOutputScenario } from './root-output.scenario';
import { omitEmptyObjectScenario } from './omit-empty.scenario';

/** Core-observable value projection cases shared with later render runners. */
export const valueScenarios: readonly FormScenario[] = [
  rootOutputScenario, omitEmptyObjectScenario,
];
