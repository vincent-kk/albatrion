import { Dialect } from './Dialect';

/** Dialect of a document whose root declares no known `$schema` and whose caller names none. */
export const DEFAULT_DIALECT: Dialect = Dialect.Draft202012;
