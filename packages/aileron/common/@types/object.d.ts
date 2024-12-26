export type Dictionary<T = any> = Record<string, T>;

export type StringDictionary = Dictionary<string>;

export type DeepRequired<T> = {
  [P in keyof T]-?: NonNullable<T[P]> extends object
    ? NonNullable<T[P]> extends any[]
      ? DeepRequired<NonNullable<T[P]>[number]>[]
      : DeepRequired<NonNullable<T[P]>>
    : T[P];
};
