import { Dialect } from '../../../../keyword';
import { DialectFlag } from './DialectFlag';

/** Dialect bit back to its public name. */
export const DIALECT_NAMES: Readonly<Record<DialectFlag, Dialect>> = {
  [DialectFlag.Draft04]: Dialect.Draft04,
  [DialectFlag.Draft06]: Dialect.Draft06,
  [DialectFlag.Draft07]: Dialect.Draft07,
  [DialectFlag.Draft201909]: Dialect.Draft201909,
  [DialectFlag.Draft202012]: Dialect.Draft202012,
};
