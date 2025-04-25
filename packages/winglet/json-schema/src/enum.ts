export enum JSONPath {
  /** Root Node */
  Root = '$',
  /** Current Node */
  Current = '@',
  /** Child Node */
  Child = '.',
  /** Filter Condition */
  Filter = '#',
}

export enum JSONPointer {
  Root = '#',
  Child = '/',
}
