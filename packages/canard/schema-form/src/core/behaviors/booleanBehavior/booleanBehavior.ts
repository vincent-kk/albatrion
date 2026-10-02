import type { Behavior } from '../../record';
import { interpret } from '../utils/parse/interpret';
import { assembleRaw } from '../utils/slots/assembleRaw';
import { declareNoChildren } from '../utils/slots/declareNoChildren';
import { finishNoInput } from '../utils/slots/finishNoInput';
import { projectIdentity } from '../utils/slots/projectIdentity';
import { rejectArrayOperation } from '../utils/slots/rejectArrayOperation';

/** Calculation row for boolean declarations. */
export const booleanBehavior: Behavior = Object.freeze({
  interpret,
  assemble: assembleRaw,
  project: projectIdentity,
  finishInput: finishNoInput,
  declareChildren: declareNoChildren,
  arrange: rejectArrayOperation,
  type: 'boolean',
  strategy: 'terminal',
});
