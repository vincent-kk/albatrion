# Schema Intersection contract

## Requirements

- 이 모듈은 새 청사진과 옛 스키마 병합의 공통 순수 계약입니다. 청사진 밖에 두어 옛 소비자가 청사진 구현과 의존 고리를 만들지 않게 합니다(LANDING-061·091).
- enum은 기존 얕은·깊은 비교 선택을 유지합니다. const는 JSON 값의 깊은 비교이며 같은 값이면 앞 참조를 유지합니다(SCHEMA-043).
- 최소·최대·배수 교차는 기존 수치 계약을 유지합니다. 범위 역전은 표시로 반환합니다. 서로 다른 키워드 사이의 불가능성은 이 모듈이 추론하지 않습니다.
- pattern은 이 모듈의 책임이 아닙니다. 새 유효 스키마는 개별 pattern의 allOf 연언을 사용하고 옛 정규식 병합은 레거시에 남습니다.

## API Contracts

- `EMPTY_INTERSECTION`은 가능한 JSON 값과 겹치지 않는 공집합 표시입니다. enum·const 충돌과 범위 역전은 이 표시를 반환합니다.
- `intersectEnum(base?, source?, deepEqual?)`은 두 목록의 교집합을 반환합니다. 한쪽이 없으면 다른 쪽의 참조, 양쪽이 없으면 undefined입니다.
- `intersectConst(base?, source?)`는 한쪽 값 또는 구조적으로 같은 앞 값을 반환합니다. 양쪽 값이 정의되어 있고 다르면 공집합입니다.
- `intersectMinimum`, `intersectMaximum`, `intersectMultipleOf`는 기존 인수와 반환 의미를 보존합니다.
- `validateRange(min?, max?)`는 유효 범위에서 undefined, 역전 범위에서 공집합 표시를 반환합니다.
- 오류를 던지는 책임은 소비자에게 있습니다. 청사진은 정적 교차에서만 던지고, 레거시 어댑터는 기존 오류 종류와 메시지를 보존합니다.

## Acceptance Criteria

### intersection-values — 잎 제약

- 기존 수치·enum 동작, 공집합 표시, const의 원시·객체·배열·null 깊은 비교를 검증합니다.

### legacy-compatibility — 호환 경계

- 기존 소비자의 오류 코드·메시지와 입력 불변성을 유지하며 const 깊은 비교만 명시된 결함 수정으로 바뀝니다.

## Boundary Exemptions

### `utils` — shared leaf implementation

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: Blueprint and the legacy schema merger need the same leaf algebra, while each owns a different error policy. This independent contract prevents either consumer from owning the other's implementation.

## Last Updated

2026-09-27
