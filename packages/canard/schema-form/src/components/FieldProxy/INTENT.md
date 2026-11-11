# FieldProxy

## Purpose

노드 하나의 렌더러 연결과 오류 격리를 소유합니다. 사용자 렌더러나 오류 포맷 하나의 실패가 형제 필드와 폼 전체를 떨어뜨리지 않게 합니다. 입력 수명과 지연 마운트는 자식의 계약을 조합합니다.

## Conventions

- FieldProxy는 노드 렌더링 경계이며 묶인 부품 생성과 자식 입력 수명의 조합을 소유합니다.
- 노드 추적과 메모된 선택은 훅에 두며, 별도의 필드 컴포넌트나 필드 경로 Provider는 만들지 않는다.
- 렌더러는 선택된 컴포넌트별로 감싸개를 메모하여 ErrorBoundary로 직접 감싸고, errorMessage는 그 경계 안에서 계산한다. 현재 필드 경로는 보고기 훅에 넘긴다.
- display-contents 래퍼(`data-path`, `role="none"`)와 RequestRemount 래퍼 key를 유지한다.
- 노드 추적과 구독은 React 수명에 묶습니다. 입력의 결합 스냅숏과 직접 구독의 예외는 [FieldInputBridge](./components/FieldInputBridge/DETAIL.md)의 계약을 따릅니다.

## Boundaries

### Always do

- Label·ErrorMessage는 독립된 memo 부품으로 묶고 오류·context 구독을 추가하지 않습니다. 각 부품의 루트는 등록 렌더러가 소유합니다.
- 오류 계산·표시·추적 범위는 FieldRendererContext와 공유하고 문구 계산은 오류 경계 아래에 둡니다.
- 배열 조상이 있는 부품만 경로를 구독하고 재배치 때 DOM을 유지합니다. 기본 폴백만 직접 호출하며 사용자·플러그인 렌더러는 요소로 그립니다.

- 외부에서는 `FieldProxy`를 통해서만 노드를 렌더링하고, 노드가 없거나 `node.isPresent === false`이면 `null` 반환
- 오류 표시 조건과 렌더 실패의 보고를 구별합니다. 포맷 실패와 렌더러 실패는 같은 필드 경계에 격리합니다.
- Refresh 동안 렌더러 경계를 유지합니다. 경계를 포함한 교체는 RequestRemount로 구별하여 입력 갱신이 격리 상태를 초기화하지 않게 합니다.
- `FieldProxy`를 `NodeProxy` prop으로 재귀 전달해서 하위 노드 렌더링

### Ask first

- FieldRendererContext가 소유한 공유 추적 마스크를 바꾸거나, `type.ts`의 `FieldProxyProps`를 수정하거나, 공개 프록시 prop을 추가할 때

### Never do

- `FieldInputBridge`·`DeferredFieldProxy`를 이 fractal 바깥에서 직접 import
- 프록시에서 필드 노드를 만들거나 변경, 소비자 props로 노드 식별 props를 덮어쓰기
- 필드 전체에 중복 경계나 경로 Provider를 추가하는 것. 오류를 소유한 경계와 수명이 중복되어서는 안 됩니다.
- `type.ts`의 `FieldProxyProps` 계약에 렌더 컴포넌트 구현을 import (부품은 형만 읽는다)
- React 수명 밖에서 노드 이벤트를 구독하여 정리와 동시 렌더 일관성을 우회하는 것
- `__tests__` 디렉토리에 INTENT.md 생성 (organ 디렉토리)
