# Form — 공개 폼 조합 경계

## Purpose

공개 폼 컴포넌트와 명령형 핸들을 조합해 스키마 기반 렌더링·검증·제출을 연결합니다. 노드 생성과 개별 입력의 렌더링 구현은 소유 Provider와 하위 컴포넌트에 맡깁니다.

## Conventions

- `Form`의 보조 렌더링 컴포넌트는 네임스페이스로 묶되 폼의 상태 소유권은 중복하지 않습니다.
- `FormHandle`의 `getValue`·제출·최초 변경 방출은 `rootNode.normalizedValue`를 읽고, `setValue`는 raw 값을 노드에 전달합니다. 편집 상태와 외부 값을 구별합니다.
- Provider의 중첩 순서를 고정해 바깥 설정과 안쪽 노드·렌더링 소비자의 관계를 유지합니다.
- `children`은 ReactNode 또는 `(props: FormChildrenProps) => ReactNode` 렌더 함수 모두 지원 — 함수형은 `FormChildrenRenderer`가 트래커(`useSchemaNodeTracker`)로 재실행 구동
- `ready` 전에는 변경을 방출하지 않고 직전과 동일한 값 참조는 다시 방출하지 않습니다. 제출 검증 실패는 `ValidationError`로 전달합니다.

## Boundaries

### Always do

- Provider 중첩 순서를 반드시 유지
- `forwardRef`로 `FormHandle` ref를 외부에 노출
- `memo`와 `withErrorBoundaryForwardRef`로 래핑하여 성능·안정성 보장
- `jsonSchema`는 최초 마운트와 `reset()` 시에만 `preprocessSchema(clone(schema))`로 복제·전처리합니다. prop 변경만으로는 갱신하지 않습니다

### Ask first

- Provider 중첩 순서 또는 컨텍스트 구성 변경 시
- `FormHandle` 새 메서드 또는 `FormProps` 새 공개 prop 추가 시

### Never do

- `Form` 컴포넌트 내부에서 직접 SchemaNode를 생성하지 않습니다. `RootNodeContextProvider`가 담당합니다.
- `children` 이외의 경로로 폼 레이아웃을 하드코딩하지 않습니다.
- Provider를 부분적으로 렌더링하거나 순서를 바꾸지 않습니다.
