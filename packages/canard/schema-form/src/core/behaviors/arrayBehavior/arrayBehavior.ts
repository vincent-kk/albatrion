import type { Behavior } from '../../record';
import { arrayBranchBehavior } from './branch/arrayBranchBehavior';
import { arrayTerminalBehavior } from './terminal/arrayTerminalBehavior';

/** Fixed calculation strategies selected by an analyzed array blueprint. */
export const arrayBehavior: Readonly<{ branch: Behavior; terminal: Behavior }> =
  Object.freeze({ branch: arrayBranchBehavior, terminal: arrayTerminalBehavior });
