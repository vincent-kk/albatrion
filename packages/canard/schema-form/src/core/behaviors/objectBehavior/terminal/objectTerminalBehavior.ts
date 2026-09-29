import type { Behavior } from '../../../record';
import { assembleRaw } from '../../utils/slots/assembleRaw';
import { declareNoChildren } from '../../utils/slots/declareNoChildren';
import { finishNoInput } from '../../utils/slots/finishNoInput';
import { interpretIdentity } from '../../utils/slots/interpretIdentity';
import { projectObject } from '../utils/projectObject';

/** Calculation row for an opaque whole-object input. */
export const objectTerminalBehavior: Behavior = Object.freeze({
  interpret: interpretIdentity,
  assemble: assembleRaw,
  project: projectObject,
  finishInput: finishNoInput,
  declareChildren: declareNoChildren,
  type: 'object',
  strategy: 'terminal',
});
