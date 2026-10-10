import type { Behavior } from '../../../../record';

/** Keep a virtual tuple out of the emitted JSON tree. */
export const projectNoEmit: Behavior['project'] = () => undefined;
