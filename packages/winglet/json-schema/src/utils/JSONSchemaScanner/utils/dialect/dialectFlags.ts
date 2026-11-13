import type { Dialect } from '../../type';

/** One bit per supported dialect; descriptor masks test schema positions without URI parsing. */
export const DIALECT_FLAGS: Readonly<Record<Dialect, number>> = {
  'draft-04': 1,
  'draft-06': 2,
  'draft-07': 4,
  '2019-09': 8,
  '2020-12': 16,
};
