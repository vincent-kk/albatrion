import type { Behavior } from '../../../record';

/** Leave inputs that have no coercion rule untouched. */
export const interpretIdentity: Behavior['interpret'] = (input) => input;
