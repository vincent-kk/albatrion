import type { Dictionary, Fn, Nullish } from '@aileron/declare';

export type InjectToHandler<
  Value = any,
  RootValue = any,
  Context extends Dictionary = Dictionary,
> = Fn<
  [value: Value, rootValue: RootValue, context: Context],
  InjectOperation | Nullish
>;

type InjectOperation =
  | { [path: string]: any }
  | Array<[path: string, value: any]>;
