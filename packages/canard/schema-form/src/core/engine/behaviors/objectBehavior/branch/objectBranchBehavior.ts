import type { Behavior } from '../../../record';
import { declareBlueprintChildren } from '../../utils/slots/declareBlueprintChildren';
import { finishNoInput } from '../../utils/slots/finishNoInput';
import { interpretIdentity } from '../../utils/slots/interpretIdentity';
import { rejectArrayOperation } from '../../utils/slots/rejectArrayOperation';
import { projectObject } from '../utils/projectObject';
import { assembleObject } from './utils/assembleObject';

/** Calculation row for an object whose active children settle separately. */
export const objectBranchBehavior: Behavior = Object.freeze({
  interpret: interpretIdentity,
  assemble: assembleObject,
  project: projectObject,
  finishInput: finishNoInput,
  declareChildren: declareBlueprintChildren,
  arrange: rejectArrayOperation,
  type: 'object',
  strategy: 'branch',
});
