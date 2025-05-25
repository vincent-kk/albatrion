/**
 * Special character constants used in JSONPath expressions
 */
export enum JSONPath {
  /** Root node of the data ($) */
  Root = '$',
  /** Parent node of the current node (_), this is not a official JSONPath syntax */
  Parent = '_',
  /** Currently processing node (@) */
  Current = '@',
  /** Child node access operator (.) */
  Child = '.',
  /** Filter condition operator (#) */
  Filter = '#',
}
