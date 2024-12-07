declare type Nullish<T> = T | null | undefined;

/** T에서 key in K를 추출하고, 이를 Required로 설정 */
declare type PickRequired<T, K extends keyof T> = Required<Pick<T, K>>;

/** T에서 key in K를 추출하고, 이를 Partial로 설정 */
declare type PickPartial<T, K extends keyof T> = Partial<Pick<T, K>>;

/** T에서 key in K를 제거하고, 나머지를 Required로 설정 */
declare type OmitRequired<T, K extends keyof T> = Required<Omit<T, K>>;

/** T에서 key in K를 제거하고, 나머지를 Partial로 설정 */
declare type OmitPartial<T, K extends keyof T> = Partial<Omit<T, K>>;

/** T에서 key in K는 Required로 설정하고, 나머지는 Partial로 설정 */
declare type PickAndPartial<T, K extends keyof T> = PickRequired<T, K> &
  OmitPartial<T, K>;

/** T에서 K를 Required로 설정하고, 나머지는 유지 */
declare type RequiredBy<T, K extends keyof T> = PickRequired<T, K> & T;

/** T에서 K를 Partial로 설정하고, 나머지는 유지 */
declare type PartialBy<T, K extends keyof T> = PickPartial<T, K> & Omit<T, K>;

declare type Roll<T> = { [K in keyof T]: T[K] };

type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

type ExpandRecursively<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: ExpandRecursively<O[K]> }
    : never
  : T;

declare type WithKey<T> = T & { key: string };

declare type ElementOf<T extends any[]> = T[number];
