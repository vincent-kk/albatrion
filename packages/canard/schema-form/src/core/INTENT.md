# core — 레거시 노드 엔진 경계

## Purpose

공개 팩토리가 JSON Schema를 현재 런타임 노드 트리로 만들고 폼 상태를 관리하는 계약을 소유합니다. 재설계 청사진의 선언 분석을 레거시 노드 상속 계약에 묶지 않습니다.

## Conventions

- 편집 중 값은 raw `value`로 보존하고, 폼 밖으로 내보낼 때만 `normalizedValue`를 읽습니다. 정제 과정에서 자식 노드를 제거하지 않습니다.
- 이벤트는 `EventCascade`로 마이크로태스크에 모으되 `UpdateValue`는 즉시 발행합니다. 값 관측과 나머지 상태 알림의 시점을 구별합니다.
- 파서는 값 변환만 맡고 스키마의 타당성 판정은 노드 생성·검증 경계에 남깁니다.

## Boundaries

### Always do

- 기존 엔진에는 현재의 상속 모델을 유지하되 재설계 엔진에는 `AbstractNode` 상속을 요구하지 않습니다.
- 노드 값은 `setValue()`로 변경하고 상태 변화에 맞는 이벤트를 발행합니다.
- 파서 함수는 부수 효과 없는 값 변환으로 유지합니다.

### Ask first

- 이벤트 시점을 바꾸는 `EventCascade` 배칭 변경
- `SetValueOption` 비트 플래그 추가 또는 변경
- 모든 기존 노드에 영향을 주는 `AbstractNode` 공개 메서드 추가
- `BranchStrategy` / `TerminalStrategy` 분기 조건 변경

### Never do

- 외부에서 노드의 `__value__` 같은 private 필드에 직접 접근하지 않습니다.
- 검증 기록을 갱신하지 않은 채 명세 동작을 바꾸지 않습니다.
- 파서에 JSON Schema 검증을 넣거나 노드 트리를 순환 참조로 만들지 않습니다.
