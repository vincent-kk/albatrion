import type { FormScenario } from '../types';
import { arrayRenderScenarios } from './render.scenario';
import { pushSlotScenario } from './push-slot.scenario';
import { popSlotScenario } from './pop-slot.scenario';
import { removeSlotScenario } from './remove-slot.scenario';
import { clearSlotsScenario } from './clear-slots.scenario';
import { updateSlotScenario } from './update-slot.scenario';
import { wholeWriteScenario } from './whole-write.scenario';
import { itemsPrefixScenario } from './items-prefix.scenario';
import { terminalVerbsScenario } from './terminal-verbs.scenario';
import { omitTrailingScenario } from './omit-trailing.scenario';
import { positionReconcileScenario } from './position-reconcile.scenario';
import { extrasTailScenario } from './extras-tail.scenario';
import { extraBecomesNodeScenario } from './extra-becomes-node.scenario';
import { landing202Scenario } from './landing-202.scenario';
import { emptyOutputScenario } from './empty-output.scenario';
import { sourceBStructureScenario } from './source-b-structure.scenario';

/** Array behavior scenes shared by core and later render adapters. */
export const arrayScenarios: readonly FormScenario[] = [
  pushSlotScenario, popSlotScenario, removeSlotScenario, clearSlotsScenario,
  updateSlotScenario, wholeWriteScenario, itemsPrefixScenario,
  terminalVerbsScenario, omitTrailingScenario, positionReconcileScenario,
  extrasTailScenario, extraBecomesNodeScenario, landing202Scenario,
  emptyOutputScenario, sourceBStructureScenario,
  ...arrayRenderScenarios,
];
