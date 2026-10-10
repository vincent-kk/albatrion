import type { Behavior } from '../../record';
import { objectBranchBehavior } from './branch/objectBranchBehavior';
import { objectTerminalBehavior } from './terminal/objectTerminalBehavior';

/** Fixed strategy rows for object nodes. */
export const objectBehavior: Readonly<{
  branch: Behavior;
  terminal: Behavior;
}> = Object.freeze({
  branch: objectBranchBehavior,
  terminal: objectTerminalBehavior,
});
