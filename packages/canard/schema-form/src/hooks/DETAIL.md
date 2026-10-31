# hooks contract

## Requirements

- 공개 훅 다섯과 형 하나를 루트 `src/index.ts`가 이 fractal의 index로 재수출합니다: `useFieldNodeTracker`·`useFieldNodeSubscribe`·`FieldNodeSubscribeOptions`·`useChildFieldMap`·`useChildFieldErrors`·`useFormSubmit`.
- `useFieldNode`는 패키지 공개 이름이 아니며, 경로로 노드를 찾는 `components/FieldProxy`의 소비자를 위해 index가 내보냅니다.

## API Contracts

- U2: useChildFieldErrors는 부모와 자식의 조건을 공통 표시 단위로 보정한다. showErrors와 aggregate showError 모두 자식 노드를 키로 한 commit 기억을 사용하며 배열 인덱스가 기억을 옮기지 않는다. raw 오류 목록과 기존 공개 반환 형은 유지한다.

- index는 위 일곱 이름만 내보냅니다. 각 이름의 소비자는 이 fractal 밖에 있습니다(루트 index, `components/FieldProxy`, `components/Form`).
- 훅 구현은 주제별 두 칸에 있습니다. 노드를 읽고 구독하는 다섯(`useFieldNode`·`useFieldNodeTracker`·`useFieldNodeSubscribe`·`useChildFieldMap`·`useChildFieldErrors`)은 `fieldNode/`, 폼 제출 훅 `useFormSubmit`은 `form/`입니다. 형제의 형·값은 `@/schema-form/core`·`@/schema-form/providers`·`@/schema-form/components/FieldProxy`·`@/schema-form/components/Form`·`@/schema-form/types` 관문으로 가져옵니다.
- `components/FieldProxy`·`components/Form`이 이 fractal을 쓰고 이 fractal도 두 컴포넌트 fractal의 형을 씁니다. 거꾸로 가는 변은 모두 `import type`이라 런타임 순환이 없습니다.

## Acceptance Criteria

### hooks-gateway — 관문으로만 소비

- 이 fractal 밖의 제품 코드는 훅 구현 파일을 경로로 가져오지 않고 index를 거칩니다.
- 공개 훅의 이름·형은 패키지 공개 표면 스냅숏과 같습니다.

## Last Updated

계약 기준: 정돈-3(2026-10-14), 모델 B1.
