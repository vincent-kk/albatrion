import type { Behavior } from '../../../record';
import { finishNoInput } from '../../utils/slots/finishNoInput';
import { interpretIdentity } from '../../utils/slots/interpretIdentity';
import { arrangeBranchArray } from '../utils/plan/arrangeBranchArray';
import { projectBranchArray } from '../utils/projection/projectBranchArray';
import { assembleArray } from '../utils/value/assembleArray';
import { declareArrayChildren } from './utils/declareArrayChildren';

/** Calculation row for separately settled array positions and extras. */
export const arrayBranchBehavior: Behavior = Object.freeze({
  interpret: interpretIdentity,
  assemble: assembleArray,
  project: projectBranchArray,
  finishInput: finishNoInput,
  declareChildren: declareArrayChildren,
  arrange: arrangeBranchArray,
  type: 'array',
  strategy: 'branch',
});
