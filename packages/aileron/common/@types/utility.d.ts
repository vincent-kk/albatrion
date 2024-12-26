export type Nullish<T> = T | null | undefined;

/** T에서 key in K를 추출하고, 이를 Required로 설정 */
export type PickRequired<T, K extends keyof T> = Required<Pick<T, K>>;

/** T에서 key in K를 추출하고, 이를 Partial로 설정 */
export type PickPartial<T, K extends keyof T> = Partial<Pick<T, K>>;

/** T에서 key in K를 제거하고, 나머지를 Required로 설정 */
export type OmitRequired<T, K extends keyof T> = Required<Omit<T, K>>;

/** T에서 key in K를 제거하고, 나머지를 Partial로 설정 */
export type OmitPartial<T, K extends keyof T> = Partial<Omit<T, K>>;

/** T에서 key in K는 Required로 설정하고, 나머지는 Partial로 설정 */
export type PickAndPartial<T, K extends keyof T> = PickRequired<T, K> &
  OmitPartial<T, K>;

/** T에서 K를 Required로 설정하고, 나머지는 유지 */
export type RequiredBy<T, K extends keyof T> = PickRequired<T, K> & T;

/** T에서 K를 Partial로 설정하고, 나머지는 유지 */
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
