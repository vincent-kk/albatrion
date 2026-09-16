# formTypeDefinitions

## Requirements

사용자나 플러그인 입력 정의가 없을 때 스키마에 맞는 기본 입력을 선택합니다.

## API Contracts

- 정의 배열의 앞쪽이 먼저 매칭되며 구체적인 형식 조건이 일반 타입 조건보다 우선합니다.
- 매칭 조건은 입력 힌트만 판정하고 실제 입력은 공통 FormTypeInputProps로 값과 변경을 전달합니다.

## Acceptance Criteria

### form-type-definitions-contract — 관찰 가능한 동작

- 특수 형식에 맞는 입력이 일반 문자열·숫자 입력에 가려지지 않습니다.
- 조건 판정은 부수 효과를 만들거나 외부 UI 라이브러리 등록을 수행하지 않습니다.

## Last Updated

2026-09-16
