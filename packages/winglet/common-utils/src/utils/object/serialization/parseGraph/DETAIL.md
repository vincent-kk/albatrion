# Graph parser contract

## Requirements

외부 wire의 검증과 참조 복원을 소유합니다. wire 문법은 상위 graph 계약을 따릅니다.

## API Contracts

parseGraph는 unknown을 반환합니다. 잘못된 JSON 문법은 SyntaxError, 형식·payload·reference·중복·자원 한도 위반은 TypeError입니다. UTF-8 16 MiB 검사는 JSON.parse 이전에 수행하며 wire 전체 검증 후 복원 node를 할당합니다. node 100,000개, entry 1,000,000개, 단일/누적 array length 1,000,000을 제한하며 hole과 도달 불가능 node도 합산합니다.

object/array 속성은 모든 키에 대해 writable/enumerable/configurable own data property로 정의합니다. RegExp.lastIndex는 intrinsic 슬롯에 복원합니다. 사용자 constructor/reviver를 실행하지 않습니다. 검증·복원 함수는 이 프랙탈 내부에서만 사용합니다.

## Acceptance Criteria

### graph-decoder-validation — wire 검증과 복원

- 문법·tag·arity·중복·참조·payload·자원 한도를 검증하고 상속 setter/non-writable 속성에도 own 데이터를 복원합니다.

## Last Updated

2026-09-18
