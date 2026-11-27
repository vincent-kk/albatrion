import { WriteOption } from '../../types/value';

type Operation = readonly [path: string, input: unknown, option?: WriteOption];

/** History inputs use actual node paths and the public write options. */
export const reviewCallerWrites = (arity: number): readonly Operation[] => [
  ['/x', 'written'],
  ['/x', (value: unknown) => value],
  ['/x', ''],
  ['/x', undefined],
  ['/o', { a: 'whole' }],
  ['/o', { b: 'merge' }, WriteOption.Merge],
  ['/o', {}, WriteOption.Merge],
  ['/o', null],
  ['/o', (value: unknown) => value],
  ['/o/a', 'written'],
  ['/o/a', ''],
  ['/o/a', (value: unknown) => value],
  ['/o/a', undefined],
  ['/o/inner/n', 'written'],
  ['/o/inner/n', ''],
  ['/arr', ['new']],
  ['/arr/0', 'written'],
  ['/g', arity === 1 ? ['tuple'] : ['tuple', { a: 'virt' }]],
  ['/g', (value: unknown) => value],
  ['', { o: { inner: { n: 'merged' } } }, WriteOption.Merge],
];
