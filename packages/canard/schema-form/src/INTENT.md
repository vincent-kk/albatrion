# schema-form/src — 공개 패키지 경계

## Purpose

JSON Schema 기반 폼의 공개 경계를 조합합니다. 노드·플러그인·렌더링·타입의 구현은 소유 모듈에 두며 이 루트는 구현을 소유하지 않습니다.

## Conventions

- 런타임 공개 표면은 패키지 진입점에서 명명해 조합합니다. 내부 구현의 추가만으로 공개 계약이 넓어지지 않게 합니다.
- 정적 스키마로 값의 종류를 확정할 수 있을 때만 `InferValueType`을 좁힙니다. 참조·게이트처럼 정적으로 판정할 수 없는 모양은 넓은 형을 유지합니다.
- 폼 밖으로 나가는 값은 `normalizedValue`, 편집 중인 노드 값은 raw `value`로 구분합니다. 정제 때문에 입력 상태가 사라지지 않아야 합니다.

## Boundaries

### Always do

- 새 노드 타입은 소유 모듈에서 구현하고 공개할 때만 패키지 경계에 이름을 지정해 연결합니다.
- `FormTypeInput` 컴포넌트는 `FormTypeInputProps` 계약을 지킵니다.
- 오류는 도메인 에러로 전달하고 플러그인 등록은 `registerPlugin()`을 경유합니다.

### Ask first

- 새 Context를 추가해 Provider 계층을 바꿀 때
- 기존 노드 상태에 영향을 주는 bitmask 플래그를 바꿀 때
- 번들 크기 20KB 제한에 영향을 줄 수 있는 의존성을 추가할 때

### Never do

- `PluginManager`의 static 상태를 `registerPlugin()`을 우회해 변경하지 않습니다.
- 외부 컴포넌트에서 노드의 내부 `__method__`를 직접 호출하지 않습니다.
- 공개 진입점 이외의 구현을 이 루트에 직접 두지 않습니다.
