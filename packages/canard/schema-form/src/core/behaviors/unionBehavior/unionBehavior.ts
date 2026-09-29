import type { Behavior } from '../../record';
import { interpret } from '../utils/parse';
import { assembleRaw } from '../utils/slots/assembleRaw';
import { declareNoChildren } from '../utils/slots/declareNoChildren';
import { finishStringInput } from '../utils/slots/finishStringInput';
import { projectIdentity } from '../utils/slots/projectIdentity';

/** Calculation row for a non-null kind union with optional null membership. */
export const unionBehavior: Behavior = Object.freeze({
  interpret,
  assemble: assembleRaw,
  project: projectIdentity,
  finishInput: finishStringInput,
  declareChildren: declareNoChildren,
  type: 'union',
  strategy: 'terminal',
});
