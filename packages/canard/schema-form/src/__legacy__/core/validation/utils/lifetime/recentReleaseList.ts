import type { BlueprintSchema } from '../../../blueprint';
import type { Validator } from '../../type';

/** Registrations owned by one selected validator instance. */
export interface ValidationLifetime {
  /** Number of committed consumers per authored root. */
  readonly counts: Map<BlueprintSchema, number>;
  /** Zero-consumer roots in release order, oldest first. */
  readonly recent: BlueprintSchema[];
}

/** Per-validator registration states; state is created only when used. */
const lists = new WeakMap<Validator, ValidationLifetime>();

/**
 * Obtain the registration ledger of a selected validator.
 * @param validator - Instance whose registrations cannot be shared with another.
 * @returns Its mutable reference counts and bounded release queue.
 */
export const recentReleaseList = (validator: Validator): ValidationLifetime => {
  let list = lists.get(validator);
  if (!list) {
    list = { counts: new Map(), recent: [] };
    lists.set(validator, list);
  }
  return list;
};
