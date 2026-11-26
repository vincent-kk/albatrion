import type { Behavior } from '../../record';
import { interpret } from '../utils/parse/interpret';
import { assembleSource } from '../utils/slots/assembleSource';
import { declareNoChildren } from '../utils/slots/declareNoChildren';
import { finishNoInput } from '../utils/slots/finishNoInput';
import { projectIdentity } from '../utils/slots/projectIdentity';
import { rejectArrayOperation } from '../utils/slots/rejectArrayOperation';
import { wrapItemLeafAssemble } from '../utils/slots/wrapItemLeafAssemble';

/** Calculation row for boolean declarations. */
export const booleanBehavior: Behavior = Object.freeze({
  interpret,
  assemble: assembleSource,
  project: projectIdentity,
  finishInput: finishNoInput,
  declareChildren: declareNoChildren,
  arrange: rejectArrayOperation,
  type: 'boolean',
  strategy: 'terminal',
});

/** Row for a boolean item at a non-nullable branch array item position: the base row with a stored null read as no value. */
export const booleanItemLeafBehavior: Behavior = Object.freeze({
  interpret: booleanBehavior.interpret,
  assemble: wrapItemLeafAssemble(booleanBehavior.assemble),
  project: booleanBehavior.project,
  finishInput: booleanBehavior.finishInput,
  declareChildren: booleanBehavior.declareChildren,
  arrange: booleanBehavior.arrange,
  type: booleanBehavior.type,
  strategy: booleanBehavior.strategy,
});
