/** Supported JSON Schema dialects; values are the names options and resolvers exchange. */
export const Dialect = {
  /** JSON Schema draft-04. */
  Draft04: 'draft-04',
  /** JSON Schema draft-06. */
  Draft06: 'draft-06',
  /** JSON Schema draft-07. */
  Draft07: 'draft-07',
  /** JSON Schema 2019-09. */
  Draft201909: '2019-09',
  /** JSON Schema 2020-12. */
  Draft202012: '2020-12',
} as const;

/** JSON Schema dialect used to recognize schema positions inside each resource. */
export type Dialect = (typeof Dialect)[keyof typeof Dialect];
