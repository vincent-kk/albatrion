/**
 * JSONPointer 표현식에서 사용되는 특수 문자 상수
 * RFC 6901 규격 기반
 */
export enum JSONPointer {
  /** URI 프래그먼트 식별자의 시작 문자 (#) */
  Root = '#',
  /** 경로 구분 문자 (/) */
  Child = '/',
}
