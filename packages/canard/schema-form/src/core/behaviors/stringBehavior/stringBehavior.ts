import type { Behavior } from '../../record';
import { interpret } from '../utils/parse/interpret';
import { assembleRaw } from '../utils/slots/assembleRaw';
import { declareNoChildren } from '../utils/slots/declareNoChildren';
import { finishStringInput } from '../utils/slots/finishStringInput';
import { projectEmpty } from '../utils/slots/projectEmpty';
import { rejectArrayOperation } from '../utils/slots/rejectArrayOperation';

/** Calculation row for scalar string nodes. */
export const stringBehavior: Behavior = Object.freeze({
  interpret,
  assemble: assembleRaw,
  project: projectEmpty,
  finishInput: finishStringInput,
  declareChildren: declareNoChildren,
  arrange: rejectArrayOperation,
  type: 'string',
  strategy: 'terminal',
});
