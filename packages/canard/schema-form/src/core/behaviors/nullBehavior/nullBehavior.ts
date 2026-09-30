import type { Behavior } from '../../record';
import { assembleRaw } from '../utils/slots/assembleRaw';
import { declareNoChildren } from '../utils/slots/declareNoChildren';
import { finishNoInput } from '../utils/slots/finishNoInput';
import { interpretIdentity } from '../utils/slots/interpretIdentity';
import { projectIdentity } from '../utils/slots/projectIdentity';

/** Calculation row for the non-coercing null kind. */
export const nullBehavior: Behavior = Object.freeze({
  interpret: interpretIdentity,
  assemble: assembleRaw,
  project: projectIdentity,
  finishInput: finishNoInput,
  declareChildren: declareNoChildren,
  type: 'null',
  strategy: 'terminal',
});
