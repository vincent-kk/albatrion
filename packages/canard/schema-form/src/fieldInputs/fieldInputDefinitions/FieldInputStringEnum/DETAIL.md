# FieldInputStringEnum 계약

## Requirements

선택되지 않은 값과 enum의 첫 항목을 구별합니다. 브라우저의 기본 선택 때문에 저장하지 않은 값이 선택된 것처럼 보이지 않아야 합니다.

## API Contracts

- 공통 무효 표시와 값 보존 정책은 [상위 계약](../../DETAIL.md)에 둡니다.
- 라벨 alias는 전달된 입력 props로 소비합니다. [presentation 계약](../../../types/DETAIL.md)이 정한 설정 위치를 입력 내부에서 다른 그룹으로 해석하지 않습니다.

## Acceptance Criteria

### REACT-027 — 영역 밖 값의 표시가 데이터를 바꾸지 않습니다

- `undefined`는 맨 앞의 빈 비활성 옵션으로 표시합니다. enum에 빈 문자열이 있어도 값 부재가 그 리터럴의 선택으로 보이지 않게 합니다.
- null·undefined가 아닌 집합 밖 기본값은 원문을 담은 비활성 옵션으로 표시합니다. 첫 유효 옵션으로 수리하거나 렌더 때문에 값을 발행하지 않습니다.
- null에는 위 영역 밖 옵션을 자동으로 추가하지 않으며 enum의 기존 선택 방식에 맡깁니다. 일반적인 nullable 비우기 편집기까지 제공한다고 약속하지 않습니다.

### enum-placeholder — 선택 범위의 한계

- 이 입력의 표시 보완은 단일 문자열 노드의 enum용입니다. union 리터럴 선택은 [기본 union의 한계](../FieldInputUnion/DETAIL.md)를 따릅니다.

## Last Updated

값 부재·집합 밖 값·null의 선택 표시나 라벨 설정의 책임이 바뀔 때 갱신합니다.
