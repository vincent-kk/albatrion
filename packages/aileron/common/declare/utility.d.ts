export type Nullish = null | undefined;

export type Nullable<T> = T | null;

export type IsNullable<T> = [null] extends [T] ? true : false;

export type Optional<T> = T | undefined;

/** Extract keys K from T and make them required */
export type PickRequired<T, K extends keyof T> = Required<Pick<T, K>>;

/** Extract keys K from T and make them partial */
export type PickPartial<T, K extends keyof T> = Partial<Pick<T, K>>;

/** Omit keys K from T and make the rest required */
export type OmitRequired<T, K extends keyof T> = Required<Omit<T, K>>;

/** Omit keys K from T and make the rest partial */
export type OmitPartial<T, K extends keyof T> = Partial<Omit<T, K>>;

/** Make keys K required and the rest partial in T */
export type PickAndPartial<T, K extends keyof T> = PickRequired<T, K> &
  OmitPartial<T, K>;

/** Make keys K required in T while keeping the rest unchanged */
export type RequiredBy<T, K extends keyof T> = PickRequired<T, K> & T;

/** Make keys K partial in T while keeping the rest unchanged */
export type PartialBy<T, K extends keyof T> = PickPartial<T, K> & Omit<T, K>;

export type Roll<T> = { [K in keyof T]: T[K] };

export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

export type ExpandRecursively<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: ExpandRecursively<O[K]> }
    : never
  : T;

export type WithKey<T> = T & { key: string };

export type ElementOf<T extends any[]> = T[number];

export type Params<T extends Array<string>> = Record<T[number], string>;
