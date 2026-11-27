import type { Behavior } from '../../record';
import { interpret } from '../utils/parse/interpret';
import { assembleSource } from '../utils/slots/assembleSource';
import { declareNoChildren } from '../utils/slots/declareNoChildren';
import { finishStringInput } from '../utils/slots/finishStringInput';
import { projectEmpty } from '../utils/slots/projectEmpty';
import { rejectArrayOperation } from '../utils/slots/rejectArrayOperation';
import { wrapItemLeafAssemble } from '../utils/slots/wrapItemLeafAssemble';

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

/** Row for a string item at a non-nullable branch array item position: the base row with a stored null read as no value. */
export const stringItemLeafBehavior: Behavior = Object.freeze({
  interpret: stringBehavior.interpret,
  assemble: wrapItemLeafAssemble(stringBehavior.assemble),
  project: stringBehavior.project,
  finishInput: stringBehavior.finishInput,
  declareChildren: stringBehavior.declareChildren,
  arrange: stringBehavior.arrange,
  type: stringBehavior.type,
  strategy: stringBehavior.strategy,
});
