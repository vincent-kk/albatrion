import type { Behavior } from '../../record';
import { interpret } from '../utils/parse';
import { assembleRaw } from '../utils/slots/assembleRaw';
import { declareNoChildren } from '../utils/slots/declareNoChildren';
import { finishStringInput } from '../utils/slots/finishStringInput';
import { projectString } from './utils/value/projectString';

/** Calculation row for scalar string nodes. */
export const stringBehavior: Behavior = Object.freeze({
  interpret,
  assemble: assembleRaw,
  project: projectString,
  finishInput: finishStringInput,
  declareChildren: declareNoChildren,
  type: 'string',
  strategy: 'terminal',
});
