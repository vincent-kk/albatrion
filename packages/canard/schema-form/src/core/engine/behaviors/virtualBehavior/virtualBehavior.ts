import type { Behavior } from '../../record';
import { declareBlueprintChildren } from '../utils/slots/declareBlueprintChildren';
import { finishNoInput } from '../utils/slots/finishNoInput';
import { interpretIdentity } from '../utils/slots/interpretIdentity';
import { rejectArrayOperation } from '../utils/slots/rejectArrayOperation';
import { assembleVirtualTuple } from './utils/tuple/assembleVirtualTuple';
import { projectNoOutputValue } from './utils/value/projectNoOutputValue';

/** Calculation row for a group of references to real sibling nodes. */
export const virtualBehavior: Behavior = Object.freeze({
  interpret: interpretIdentity,
  assemble: assembleVirtualTuple,
  project: projectNoOutputValue,
  finishInput: finishNoInput,
  declareChildren: declareBlueprintChildren,
  arrange: rejectArrayOperation,
  type: 'virtual',
  strategy: 'branch',
});
