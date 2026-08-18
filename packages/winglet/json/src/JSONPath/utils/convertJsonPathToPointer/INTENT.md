# convertJsonPathToPointer — dataPath→포인터 변환

## Purpose

`convertJsonPathToPointer(dataPath)` 하나의 함수를 소유한다. AJV dataPath 형식(점·대괄호 표기) 문자열을 RFC 6901 JSON Pointer 문자열로 변환한다. 이미 포인터 형식인 입력은 변환 없이 그대로 반환해 멱등성을 보장한다.

## Boundaries

### Always do

- 이미 포인터 형식인 입력을 그대로 통과시키는 선행 판별을 모든 파싱 변경에서 유지한다
- 빈 배열 인덱스를 `-`로 치환하는 RFC 6901 규칙을 유지한다

### Ask first

- 빈 문자열 입력의 반환값(현재 루트 포인터)을 바꾸는 변경
- 세그먼트 구분자(`.`)나 배열 대괄호 외의 새 구문을 해석 대상에 추가하는 변경

### Never do

- 객체를 인자로 받거나 순회하는 로직 추가 — 문자열을 받아 문자열을 반환하는 순수 변환만 소유한다
- RFC 6901 이스케이프(`~0`,`~1`) 해석을 이 함수에 추가하는 변경 — 이스케이프 처리는 JSONPointer 형제 fractal의 책임이다
