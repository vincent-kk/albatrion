# ComputedPropertiesManager

## Purpose

JSON Schema의 `computed` 속성을 파싱하여 노드의 동적 상태(active, visible, readOnly, disabled, oneOfIndex, anyOfIndices, watchValues, derived)를 의존성 값 변화에 따라 재계산하는 매니저 클래스.

## Conventions

- TypeScript strict 모드
- `DynamicFunction<T>` = `(dependencies: unknown[]) => T`
- `computed.*` 필드와 `&fieldName` alias 두 가지 방식 지원
- `getPathManager` 로 의존성 경로를 수집하고 인덱스 기반으로 참조
- `recalculate()` 는 `dependencies` 배열이 업데이트된 후 호출
- computed 필드 어휘(`ALIAS`, `COMPUTED_FIELD_NAMES`, `STATE_FIELD_NAMES`)의 소유자는 이 모듈이며 `index.ts` 가 이름으로 내보낸다 — 밖에서는 사본을 두지 않고 이것을 쓴다

## Boundaries

### Always do

- 새 computed 필드 추가 시 `type.ts` 의 타입과 `ComputedPropertiesManager` 생성자 모두 수정
- 의존성 경로 수집은 반드시 `PathManager.set()` 을 통해 수행
- `isEnabled` 체크 후 의존성 구독 수행 (`AbstractNode.__prepareUpdateDependencies__`)

### Ask first

- `MAX_LOOP_COUNT` 또는 배치 제한 변경
- `ALIAS` (`&`) prefix 규칙 변경
- 새 computed 필드 타입 추가 (공개 API 계약 변경)

### Never do

- `new Function()` 외의 방식으로 동적 함수 생성 (`eval` 사용 금지)
- `pathManager` 없이 의존성 경로 직접 배열에 push
- `recalculate()` 를 의존성 업데이트 없이 반복 호출
