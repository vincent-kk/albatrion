# resolveReference contract

## Requirements

- 지원하는 참조는 정확한 대상으로 인라인하거나 이유를 남겨 보존하거나 명시적으로 실패합니다.
- 미발견 참조는 기본으로 남기며 입력을 변경하지 않습니다.

## API Contracts

`resolveReference(schema, options?)`는 내장 동기 해소기를 구성하고 동기 스캐너를 한 번 실행한 출력입니다. boolean 입력·출력을 지원하고 URI·자원·앵커·사본 안전 판단은 해소기의 계약을 따릅니다. 순환과 정의 위치의 참조는 남을 수 있으므로 모든 참조를 없애는 함수로 해석하지 않습니다.

## Acceptance Criteria

### legacy-definitions — legacy definitions 표기 해석

- `definitions`(draft-07 방식) 아래 정의를 가리키는 `$ref`가 여러 개 있는 스키마에서, 정의 바깥의 각 사용 위치가 정의 내용으로 치환되고 정의 위치의 참조는 보존됨을 검증한다.

### cyclic-definitions — 순환 정의 안전 해석

- 자기 자신을 가리키는 `$ref`를 가진 `definitions` 엔트리(트리형 재귀 구조)를 해석해도 종료하며, 1레벨은 인라인되고 더 깊은 재귀 지점은 `$ref`가 그대로 남음을 검증한다.

## Last Updated

resolveReference의 공개 경계·입력 해석·반환값 또는 실패 처리 계약이 바뀔 때 갱신합니다.
