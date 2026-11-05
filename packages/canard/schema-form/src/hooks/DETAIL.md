# hooks contract

## Requirements

- 공개 훅 다섯과 형 하나를 루트 `src/index.ts`가 이 fractal의 index로 재수출합니다: `useFieldNodeTracker`·`useFieldNodeSubscribe`·`FieldNodeSubscribeOptions`·`useChildFieldMap`·`useChildFieldErrors`·`useFormSubmit`.
- `useFieldNode`는 패키지 공개 이름이 아니며 FieldProxy가 경로의 현재 노드를 구독하도록 내부 index가 내보냅니다. node·undefined·root 입력은 고정이고 다른 경로는 root부터 최장 해석 prefix까지 UpdateChildren 구독을 한 번씩 둡니다. 사건마다 필터·해제·재탐색·재구독 후 snapshot 변경을 통지하고 unmount에서 모두 해제합니다. 경로별 비용은 container마다 리스너 한 개이며 일반 node-addressed 자식과 root 입력에는 추가 경로 탐색·리스너 배달이 없으며 렌더마다 상수 시간 snapshot hook 하나가 있습니다. 구독을 붙인 직후 React에 스냅숏 검사를 요청하므로 Activity 재연결에서 숨김 동안 바뀐 경로 노드를 따라잡으며, 연결마다 경로 해석 한 번을 더하고 같은 노드면 렌더하지 않습니다.

## API Contracts

- `useFieldNodeTracker`와 `useFieldNodeSubscribe`는 `Node | Nullish`를 받는다. 부재는 관찰 없는 상태이며 tracker는 클라이언트·서버에서 0을 반환하고 subscribe는 listener·onSubscribe를 호출하지 않는다. 노드 교체·부재 전환·unmount는 이전 구독을 해제하고 StrictMode 재연결 뒤에는 구독 하나만 남는다. 실제 노드로 연결할 때만 필수 subtype 인자로 `onSubscribe`를 호출하여 구독 전 배달을 따라잡는다.
- ref 할당은 재렌더를 일으키지 않는다. `useFieldNodeTracker(formRef.current?.node)`와 subscribe의 같은 입력은 다음 렌더가 실제 노드를 전달할 때 연결된다. React state 갱신으로 렌더를 공급해야 하며 callback ref도 state를 갱신해야 한다. 루트 교체(rebuild, 스키마 변경, 검증기 변경)는 소비자를 다시 렌더하지 않고 `FormHandle.node`를 바꾸므로, 그 노드를 받은 훅은 소비자가 다시 렌더할 때까지 이전 루트를 관찰한다. `useFieldNode`의 생략된 입력은 루트 선택이므로 이 부재 무동작 규칙을 적용하지 않는다.
- useFieldNodeTracker는 리스너를 붙인 직후 React의 스냅숏 검사를 요청합니다. 마지막 렌더의 개정이 같아도 Activity 재연결에서 숨김 동안의 개정을 놓치지 않으며, 사건을 재생하지 않습니다. 연결마다 O(1) 마스크 개정 읽기·비교만 더하고 구독·effect·보유 객체는 늘리지 않습니다.
- useFormSubmit은 연결 직후 현재 pending boolean의 검사를 요청하여 숨김 중 제출 시작·완료를 따라잡습니다. 같은 값은 렌더하지 않으며 연결마다 O(1) 읽기·비교만 추가합니다.
- H: 오류는 현재 적격이며 마지막 release 이후 모든 state·isPresent·커밋 정책 조합에서 계속 적격일 때만 표시한다. 잠깐이라도 부적격이면 다음 release를 기다리며 숨김은 즉시다. release는 pending true→false 정착, 조용한 post-paint drop, 수락한 explicit root 판정, 폐기다. pending이 없어도 새 표시는 약2프레임 뒤 release에서 나타난다. OnChange가 아니면 live 조건만 사용한다.
- useChildFieldErrors는 자기/child 각각의 state·정책 이력에 hold를 적용하되 isPresent는 읽지 않는다. hidden 자식은 값과 오류가 aggregate에 남고 inactive는 값 제거·off-branch issue 라우팅 제외다. 기존 subscription mask·formatting·unformatted 목록을 유지한다.

- U2: useChildFieldErrors는 부모와 자식의 조건을 공통 표시 단위로 보정한다. showErrors와 aggregate showError 모두 엔진의 노드별 기준을 사용하며 배열 인덱스로 기준을 옮기지 않는다. unformatted 오류 목록과 기존 공개 반환 형은 유지한다.

- index는 위 일곱 이름만 내보냅니다. 각 이름의 소비자는 이 fractal 밖에 있습니다(루트 index, `components/FieldProxy`, `components/Form`).
- 훅 구현은 주제별 두 칸에 있습니다. 노드를 읽고 구독하는 다섯(`useFieldNode`·`useFieldNodeTracker`·`useFieldNodeSubscribe`·`useChildFieldMap`·`useChildFieldErrors`)은 `fieldNode/`, 폼 제출 훅 `useFormSubmit`은 `form/`입니다. 형제의 형·값은 `@/schema-form/core`·`@/schema-form/providers`·`@/schema-form/components/FieldProxy`·`@/schema-form/components/Form`·`@/schema-form/types` 관문으로 가져옵니다.
- `components/FieldProxy`·`components/Form`이 이 fractal을 쓰고 이 fractal도 두 컴포넌트 fractal의 형을 씁니다. 거꾸로 가는 변은 모두 `import type`이라 런타임 순환이 없습니다.

- useChildFieldErrors는 node와 현재 children을 함께 같은 mask로 구독합니다. 구독 중 snapshot은 version0이면 base, 이후 base+#version이며 O(1)입니다. 해제할 때 현재 revision vector를 O(C)에 보존하고, 같은 저장소가 같은 vector로 다시 연결되면 cold 읽기와 재연결 모두 기존 base/version 토큰을 유지합니다. 바뀐 vector는 새 base로 사용하며 같은 저장소 재연결 직후 React에 검사를 요청합니다. 첫 연결과 node·children·disabled 변경으로 교체한 새 저장소는 React의 commit 검사를 사용하여 subscribe identity 교체 때 불필요한 렌더를 만들지 않습니다. 변화 없는 재연결은 추가 렌더가 없고 기존 오류·자식 변경의 렌더 횟수를 유지합니다. 비구독 읽기·구독 준비·정리·보유량은 O(C)이며 종료 vector 하나를 추가로 보유합니다(469C-02).

## Acceptance Criteria

### hooks-gateway — 관문으로만 소비

- 이 fractal 밖의 제품 코드는 훅 구현 파일을 경로로 가져오지 않고 index를 거칩니다.
- 공개 훅의 이름·형은 패키지 공개 표면 스냅숏과 같습니다.

## Last Updated

공개 훅의 구독·재연결·조회 및 제출 계약이 바뀔 때 갱신합니다.
