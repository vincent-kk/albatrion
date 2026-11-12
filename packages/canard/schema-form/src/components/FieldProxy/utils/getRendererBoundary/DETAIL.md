# getRendererBoundary

## Requirements

FieldProxy가 필드마다 두는 렌더러 경계의 타입과 실패한 경계의 복구 판정을 제공합니다. 실패를 필드에 가두는 목표, 경계의 배치, 오류 문구를 경계 안에서 계산하는 위치와 Refresh·RequestRemount 수명은 [FieldProxy](../../DETAIL.md)가 소유합니다.

## API Contracts

- `getRendererBoundary(renderer)`는 선택된 FieldRenderer identity마다 `FormatterErrorBoundary`를 상속한 클래스 하나를 돌려줍니다. 같은 렌더러의 필드 수에 비례하는 클래스 할당을 피하고, `WeakMap` 캐시이므로 렌더러가 도달 가능할 때만 타입을 보유합니다.
- 경계 타입은 렌더러마다 공유하지만 오류 상태는 React 인스턴스마다 독립적입니다. A→B→A 교체는 새 인스턴스를 만들므로 이전 실패 상태를 이어받지 않습니다.
- 실패한 경계는 다음 갱신에서 `formatError`, `LabelRenderer`, `ErrorMessageRenderer`, `InputRenderer` 중 하나라도 참조가 바뀌면 오류 상태를 지우고 다시 렌더합니다. 부품 렌더러 참조는 복구 판정에만 쓰며 경계가 렌더하지 않습니다. 정상 경계는 이 변경에 반응하지 않습니다.
- 경계에 memo 래퍼를 더하지 않습니다. 매번 새 children 엘리먼트를 받으므로 비교 비용만 늘어납니다.

## Acceptance Criteria

### renderer-boundary-type — 렌더러마다 경계 타입 하나를 공유합니다

같은 렌더러를 쓰는 필드는 같은 경계 클래스를 사용하고 다른 렌더러는 다른 클래스를 받습니다. A→B→A 교체 뒤에도 A의 클래스는 같고, 다시 마운트된 A의 인스턴스는 이전 실패 상태를 이어받지 않습니다.

### failed-boundary-retry — 실패한 경계만 다시 시도합니다

실패한 경계는 `formatError`나 부품 렌더러의 참조가 바뀌면 같은 인스턴스에서 fallback을 지우고 다시 렌더하며, 같은 변경을 받은 정상 경계는 상태를 바꾸지 않습니다.

## Last Updated

복구 판정 대상, 경계 타입의 캐시 키·보유 방식 또는 상속하는 공용 경계가 바뀌면 갱신합니다.
