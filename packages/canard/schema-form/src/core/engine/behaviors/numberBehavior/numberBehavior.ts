import type { Behavior } from '../../record';
import { interpret } from '../utils/parse/interpret';
import { assembleSource } from '../utils/slots/assembleSource';
import { declareNoChildren } from '../utils/slots/declareNoChildren';
import { finishNoInput } from '../utils/slots/finishNoInput';
import { projectIdentity } from '../utils/slots/projectIdentity';
import { rejectArrayOperation } from '../utils/slots/rejectArrayOperation';

/** Calculation row for finite number and integer declarations. */
export const numberBehavior: Behavior = Object.freeze({
  interpret,
  assemble: assembleSource,
  project: projectIdentity,
  finishInput: finishNoInput,
  declareChildren: declareNoChildren,
  arrange: rejectArrayOperation,
  type: 'number',
  strategy: 'terminal',
});
