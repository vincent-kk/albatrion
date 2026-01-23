import type { Dictionary, Fn, Nullish } from '@aileron/declare';

export type InjectValueTo<
  Value = any,
  RootValue = any,
  Context extends Dictionary = Dictionary,
> = Fn<
  [value: Value, rootValue: RootValue, context: Context],
  InjectValueOperation | Nullish
>;

export type InjectValueOperation =
  | { [path: string]: any }
  | Array<[path: string, value: any]>;
