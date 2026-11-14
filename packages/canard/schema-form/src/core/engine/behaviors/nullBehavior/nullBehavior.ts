import type { Behavior } from '../../record';
import { assembleSource } from '../utils/slots/assembleSource';
import { declareNoChildren } from '../utils/slots/declareNoChildren';
import { finishNoInput } from '../utils/slots/finishNoInput';
import { interpretIdentity } from '../utils/slots/interpretIdentity';
import { projectIdentity } from '../utils/slots/projectIdentity';
import { rejectArrayOperation } from '../utils/slots/rejectArrayOperation';

/** Calculation row for the non-coercing null kind. */
export const nullBehavior: Behavior = Object.freeze({
  interpret: interpretIdentity,
  assemble: assembleSource,
  project: projectIdentity,
  finishInput: finishNoInput,
  declareChildren: declareNoChildren,
  arrange: rejectArrayOperation,
  type: 'null',
  strategy: 'terminal',
});
