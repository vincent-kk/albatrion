import type { Behavior } from '../../../record';

/** Report that this row has no completed string input to write. */
export const finishNoInput: Behavior['finishInput'] = () => undefined;
