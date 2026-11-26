import type { Behavior } from '../../record';
import { interpret } from '../utils/parse/interpret';
import { assembleSource } from '../utils/slots/assembleSource';
import { declareNoChildren } from '../utils/slots/declareNoChildren';
import { finishStringInput } from '../utils/slots/finishStringInput';
import { projectEmpty } from '../utils/slots/projectEmpty';
import { rejectArrayOperation } from '../utils/slots/rejectArrayOperation';
import { wrapItemLeafAssemble } from '../utils/slots/wrapItemLeafAssemble';

/** Calculation row for a non-null kind union with optional null membership. */
export const unionBehavior: Behavior = Object.freeze({
  interpret,
  assemble: assembleSource,
  project: projectEmpty,
  finishInput: finishStringInput,
  declareChildren: declareNoChildren,
  arrange: rejectArrayOperation,
  type: 'union',
  strategy: 'terminal',
});

/** Row for a union item at a non-nullable branch array item position: the base row with a stored null read as no value. */
export const unionItemLeafBehavior: Behavior = Object.freeze({
  interpret: unionBehavior.interpret,
  assemble: wrapItemLeafAssemble(unionBehavior.assemble),
  project: unionBehavior.project,
  finishInput: unionBehavior.finishInput,
  declareChildren: unionBehavior.declareChildren,
  arrange: unionBehavior.arrange,
  type: unionBehavior.type,
  strategy: unionBehavior.strategy,
});
