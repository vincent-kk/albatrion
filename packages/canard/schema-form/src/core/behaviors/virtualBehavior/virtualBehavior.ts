import type { Behavior } from '../../record';
import { declareBlueprintChildren } from '../utils/slots/declareBlueprintChildren';
import { finishNoInput } from '../utils/slots/finishNoInput';
import { interpretIdentity } from '../utils/slots/interpretIdentity';
import { assembleVirtualTuple } from './utils/tuple/assembleVirtualTuple';
import { projectNoEmit } from './utils/value/projectNoEmit';

/** Calculation row for a group of references to real sibling nodes. */
export const virtualBehavior: Behavior = Object.freeze({
  interpret: interpretIdentity,
  assemble: assembleVirtualTuple,
  project: projectNoEmit,
  finishInput: finishNoInput,
  declareChildren: declareBlueprintChildren,
  type: 'virtual',
  strategy: 'branch',
});
