import type { Behavior } from '../../record';
import { interpret } from '../utils/parse/interpret';
import { assembleRaw } from '../utils/slots/assembleRaw';
import { declareNoChildren } from '../utils/slots/declareNoChildren';
import { finishNoInput } from '../utils/slots/finishNoInput';
import { projectIdentity } from '../utils/slots/projectIdentity';

/** Calculation row for finite number and integer declarations. */
export const numberBehavior: Behavior = Object.freeze({
  interpret,
  assemble: assembleRaw,
  project: projectIdentity,
  finishInput: finishNoInput,
  declareChildren: declareNoChildren,
  type: 'number',
  strategy: 'terminal',
});
