import type { Behavior } from '../../../record';

/** Retain a calculated value as the outgoing value. */
export const projectIdentity: Behavior['project'] = (_node, local) => local;
