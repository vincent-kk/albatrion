# warning

## Requirements

스키마 작성자가 조치할 개발 진단을 중복 없이 전달합니다.

## API Contracts

- 진입점은 경고 방출 함수만 제공합니다. `DevelopmentIssue`·`ALL_OF_KEYWORD_IGNORED_FOR_FORM`·`NESTED_COMPOSITION_IGNORED_FOR_FORM`·`NULLABLE_ONE_OF_NULL_UNREACHABLE`·`NULL_BRANCH_IGNORED_FOR_FORM`·`SCHEMA_FORM_WARNING`·`TYPE_MISMATCH`·`NON_JSON_WHOLE_VALUE`는 내부 경고 계약이며 이 index가 내보내지 않습니다.

- 경고는 코드·포맷된 메시지·상세 정보로 구성하며 같은 코드와 메시지는 세션에서 한 번만 출력합니다.
- 프로덕션에서는 경고를 출력하지 않고 오류 인스턴스를 만들지 않습니다.

## Acceptance Criteria

### warning-contract — 관찰 가능한 동작

- 여러 노드에서 같은 경고가 발생해도 콘솔 메시지가 반복 누적되지 않습니다.
- 진단 details에 실제 폼 입력값을 포함하지 않습니다.

## Last Updated

2026-09-16; 정돈-2(2026-10-14).
