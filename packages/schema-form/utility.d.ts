declare type Nullish<T> = T | null | undefined;

declare type StringTDict<T> = Record<string, T>;

declare type StringStringDict = StringTDict<string>;

declare type SetStateFunction<S> = (value: S | ((prevState: S) => S)) => void;

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

declare type PromiseFunction<P extends Array<any>, T> = (
  ...props: P
) => Promise<T>;

/** 중첩된 객체 구조를 가진 타입 T를 입력받아서 내부 필드들이 모두 필수인 타입을 반환 */
declare type DeepRequired<T> = {
  [P in keyof T]-?: NonNullable<T[P]> extends object
    ? NonNullable<T[P]> extends any[]
      ? DeepRequired<NonNullable<T[P]>[number]>[]
      : DeepRequired<NonNullable<T[P]>>
    : T[P];
};

declare type Roll<T> = { [K in keyof T]: T[K] };
