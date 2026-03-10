# shallowPatch

## Purpose
객체의 shallow 병합/패치를 수행하며, 변경이 없으면 `undefined` 를 반환하여 불필요한 리렌더링을 방지한다. `additive` 모드에서는 truthy 값만 적용하여 globalState 누적에 사용된다.

## Structure
- `shallowPatch.ts` — 함수 본체
- `index.ts` — barrel export

## Conventions
- TypeScript strict 모드
- 반환: 변경 없으면 `undefined`, 변경 있으면 새 객체 참조 (`{ ...base, ...changes }`)
- `input === undefined`: base가 비어있으면 `undefined`, 아니면 `{}` (전체 초기화)
- `additive: true`: truthy 값만 적용, falsy 값 무시 (globalState 누적용)
- `additive: false` (기본): 모든 값 적용, `undefined` 값은 해당 키 삭제
- `base` 객체는 내부에서 변경되지만 반환값은 새 참조

## Boundaries

### Always do
- 반환값이 `undefined` 이면 이벤트 발행/상태 업데이트 스킵 (`AbstractNode.setState` 패턴)
- `globalState` 누적 시 `additive: true` 사용

### Ask first
- deep merge 로 교체 (현재는 의도적으로 shallow)

### Never do
- `null` 을 객체로 취급 (현재: null 입력은 `undefined` 반환으로 처리)
- 반환된 객체를 in-place 변경

## Dependencies
- `@winglet/common-utils/filter` — `isEmptyObject`
- `@aileron/declare` — `Dictionary`
