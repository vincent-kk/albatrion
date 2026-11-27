declare type Dictionary<T = any> = Record<string, T>;

declare type StringDictionary = Dictionary<string>;

/** Makes every field required recursively in a nested object type. */
declare type DeepRequired<T> = {
  [P in keyof T]-?: NonNullable<T[P]> extends object
    ? NonNullable<T[P]> extends any[]
      ? DeepRequired<NonNullable<T[P]>[number]>[]
      : DeepRequired<NonNullable<T[P]>>
    : T[P];
};
