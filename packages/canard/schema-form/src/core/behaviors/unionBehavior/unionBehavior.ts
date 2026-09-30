import type { Behavior } from '../../record';
import { interpret } from '../utils/parse/interpret';
import { assembleRaw } from '../utils/slots/assembleRaw';
import { declareNoChildren } from '../utils/slots/declareNoChildren';
import { finishStringInput } from '../utils/slots/finishStringInput';
import { projectEmpty } from '../utils/slots/projectEmpty';

/** Calculation row for a non-null kind union with optional null membership. */
export const unionBehavior: Behavior = Object.freeze({
  interpret,
  assemble: assembleRaw,
  project: projectEmpty,
  finishInput: finishStringInput,
  declareChildren: declareNoChildren,
  type: 'union',
  strategy: 'terminal',
});
