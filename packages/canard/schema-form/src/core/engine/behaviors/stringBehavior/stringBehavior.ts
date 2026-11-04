import type { Behavior } from '../../record';
import { interpret } from '../utils/parse/interpret';
import { assembleSource } from '../utils/slots/assembleSource';
import { declareNoChildren } from '../utils/slots/declareNoChildren';
import { finishStringInput } from '../utils/slots/finishStringInput';
import { projectEmpty } from '../utils/slots/projectEmpty';
import { rejectArrayOperation } from '../utils/slots/rejectArrayOperation';

/** Calculation row for scalar string nodes. */
export const stringBehavior: Behavior = Object.freeze({
  interpret,
  assemble: assembleSource,
  project: projectEmpty,
  finishInput: finishStringInput,
  declareChildren: declareNoChildren,
  arrange: rejectArrayOperation,
  type: 'string',
  strategy: 'terminal',
});
