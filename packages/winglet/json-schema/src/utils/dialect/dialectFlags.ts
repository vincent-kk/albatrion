import { Dialect } from './Dialect';
import { DialectFlag } from './DialectFlag';

/** Dialect name to its bit, for callers that hold a name from options or a resolver. */
export const DIALECT_FLAGS: Readonly<Record<Dialect, DialectFlag>> = {
  [Dialect.Draft04]: DialectFlag.Draft04,
  [Dialect.Draft06]: DialectFlag.Draft06,
  [Dialect.Draft07]: DialectFlag.Draft07,
  [Dialect.Draft201909]: DialectFlag.Draft201909,
  [Dialect.Draft202012]: DialectFlag.Draft202012,
};
