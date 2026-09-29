import type { Behavior } from '../../record';
import { interpret } from '../utils/parse';
import { assembleRaw } from '../utils/slots/assembleRaw';
import { declareNoChildren } from '../utils/slots/declareNoChildren';
import { finishNoInput } from '../utils/slots/finishNoInput';
import { projectIdentity } from '../utils/slots/projectIdentity';

/** Calculation row for boolean declarations. */
export const booleanBehavior: Behavior = Object.freeze({
  interpret,
  assemble: assembleRaw,
  project: projectIdentity,
  finishInput: finishNoInput,
  declareChildren: declareNoChildren,
  type: 'boolean',
  strategy: 'terminal',
});
