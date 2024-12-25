declare type Dictionary<T = any> = Record<string, T>;

declare type StringDictionary = Dictionary<string>;

/** 중첩된 객체 구조를 가진 타입 T를 입력받아서 내부 필드들이 모두 필수인 타입을 반환 */
declare type DeepRequired<T> = {
  [P in keyof T]-?: NonNullable<T[P]> extends object
    ? NonNullable<T[P]> extends any[]
      ? DeepRequired<NonNullable<T[P]>[number]>[]
      : DeepRequired<NonNullable<T[P]>>
    : T[P];
};
