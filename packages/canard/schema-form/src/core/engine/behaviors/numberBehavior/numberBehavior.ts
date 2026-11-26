import type { Behavior } from '../../record';
import { interpret } from '../utils/parse/interpret';
import { assembleSource } from '../utils/slots/assembleSource';
import { declareNoChildren } from '../utils/slots/declareNoChildren';
import { finishNoInput } from '../utils/slots/finishNoInput';
import { projectIdentity } from '../utils/slots/projectIdentity';
import { rejectArrayOperation } from '../utils/slots/rejectArrayOperation';
import { wrapItemLeafAssemble } from '../utils/slots/wrapItemLeafAssemble';

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

/** Row for a number item at a non-nullable branch array item position: the base row with a stored null read as no value. */
export const numberItemLeafBehavior: Behavior = Object.freeze({
  interpret: numberBehavior.interpret,
  assemble: wrapItemLeafAssemble(numberBehavior.assemble),
  project: numberBehavior.project,
  finishInput: numberBehavior.finishInput,
  declareChildren: numberBehavior.declareChildren,
  arrange: numberBehavior.arrange,
  type: numberBehavior.type,
  strategy: numberBehavior.strategy,
});
