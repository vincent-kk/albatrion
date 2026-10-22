// Loaded by Vitest setupFiles for unit, render and react18; each file starts with shipped modes.
import { deriveShadowEvaluation } from '../utils/derivation/deriveShadowEvaluation';
import { gateSelectionTable } from '../utils/gates/gateSelectionTable';
import { gateWheelEvaluation } from '../utils/gates/gateWheelEvaluation';

deriveShadowEvaluation.enabled = false;
gateWheelEvaluation.mode = 'skip';
gateSelectionTable.mode = 'table';
