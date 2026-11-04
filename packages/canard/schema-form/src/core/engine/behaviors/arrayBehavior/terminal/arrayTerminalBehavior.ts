import type { Behavior } from '../../../record';
import { assembleSource } from '../../utils/slots/assembleSource';
import { declareNoChildren } from '../../utils/slots/declareNoChildren';
import { finishNoInput } from '../../utils/slots/finishNoInput';
import { interpretIdentity } from '../../utils/slots/interpretIdentity';
import { arrangeTerminalArray } from '../utils/plan/arrangeTerminalArray';
import { projectTerminalArray } from '../utils/projection/projectTerminalArray';

/** Calculation row for an opaque whole-array source value. */
export const arrayTerminalBehavior: Behavior = Object.freeze({
  interpret: interpretIdentity,
  assemble: assembleSource,
  project: projectTerminalArray,
  finishInput: finishNoInput,
  declareChildren: declareNoChildren,
  arrange: arrangeTerminalArray,
  type: 'array',
  strategy: 'terminal',
});
