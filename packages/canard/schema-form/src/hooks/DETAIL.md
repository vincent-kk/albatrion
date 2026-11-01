# hooks contract

## Requirements

- 공개 훅 다섯과 형 하나를 루트 `src/index.ts`가 이 fractal의 index로 재수출합니다: `useFieldNodeTracker`·`useFieldNodeSubscribe`·`FieldNodeSubscribeOptions`·`useChildFieldMap`·`useChildFieldErrors`·`useFormSubmit`.
- `useFieldNode`는 패키지 공개 이름이 아니며 FieldProxy가 경로의 현재 노드를 구독하도록 내부 index가 내보냅니다. node·undefined·root 입력은 고정이고 다른 경로는 root부터 최장 해석 prefix까지 UpdateChildren 구독을 한 번씩 둡니다. 사건마다 필터·해제·재탐색·재구독 후 snapshot 변경을 통지하고 unmount에서 모두 해제합니다. 경로별 비용은 container마다 리스너 한 개이며 일반 node-addressed 자식과 root 입력에는 추가 경로 탐색·리스너 배달이 없으며 렌더마다 상수 시간 snapshot hook 하나가 있습니다.

## API Contracts

- H: 오류는 현재 적격이며 마지막 release 이후 모든 state·enabled·커밋 정책 조합에서 계속 적격일 때만 표시한다. 잠깐이라도 부적격이면 다음 release를 기다리며 숨김은 즉시다. release는 pending true→false 정착, 조용한 post-paint drop, 수락한 explicit root 판정, 폐기다. pending이 없어도 새 표시는 약2프레임 뒤 release에서 나타난다. OnChange가 아니면 live 조건만 사용한다.
- useChildFieldErrors는 자기/child 각각의 state·정책 이력에 hold를 적용하되 enabled는 읽지 않는다. hidden 자식은 값과 오류가 aggregate에 남고 inactive는 값 제거·off-branch issue 라우팅 제외다. 기존 subscription mask·formatting·raw 목록을 유지한다.

- U2: useChildFieldErrors는 부모와 자식의 조건을 공통 표시 단위로 보정한다. showErrors와 aggregate showError 모두 엔진의 노드별 기준을 사용하며 배열 인덱스로 기준을 옮기지 않는다. raw 오류 목록과 기존 공개 반환 형은 유지한다.

- index는 위 일곱 이름만 내보냅니다. 각 이름의 소비자는 이 fractal 밖에 있습니다(루트 index, `components/FieldProxy`, `components/Form`).
- 훅 구현은 주제별 두 칸에 있습니다. 노드를 읽고 구독하는 다섯(`useFieldNode`·`useFieldNodeTracker`·`useFieldNodeSubscribe`·`useChildFieldMap`·`useChildFieldErrors`)은 `fieldNode/`, 폼 제출 훅 `useFormSubmit`은 `form/`입니다. 형제의 형·값은 `@/schema-form/core`·`@/schema-form/providers`·`@/schema-form/components/FieldProxy`·`@/schema-form/components/Form`·`@/schema-form/types` 관문으로 가져옵니다.
- `components/FieldProxy`·`components/Form`이 이 fractal을 쓰고 이 fractal도 두 컴포넌트 fractal의 형을 씁니다. 거꾸로 가는 변은 모두 `import type`이라 런타임 순환이 없습니다.

## Acceptance Criteria

### hooks-gateway — 관문으로만 소비

- 이 fractal 밖의 제품 코드는 훅 구현 파일을 경로로 가져오지 않고 index를 거칩니다.
- 공개 훅의 이름·형은 패키지 공개 표면 스냅숏과 같습니다.

## Last Updated

계약 기준: 정돈-3(2026-10-14), 모델 B1.
