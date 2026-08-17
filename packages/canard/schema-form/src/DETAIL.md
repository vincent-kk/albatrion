# schema-form/src contract

## Requirements

- `src/index.ts`가 이 패키지의 공개 표면이다. 소비자는 이 진입점이 이름으로 내보낸 심볼만 사용하며, 하위 모듈 파일을 직접 참조하지 않는다.
- **스키마 `options`는 공개 계약이다.** `JsonSchema` 타입이 선언한 `options` 필드는 소비자가 스키마에 직접 쓰는 값이므로, 필드를 추가·삭제하거나 의미를 바꾸는 것은 공개 계약 변경이다.
- 값 정제 옵션은 **값을 바꾸되 노드 트리를 바꾸지 않는다.** 정제는 노드가 밖으로 내보내는 값(`normalizedValue`)에만 적용되고, 자식 노드·렌더된 입력·raw `value`는 그대로 유지된다. 이 분리는 사용자가 편집 중인 화면이 정제 때문에 접히지 않게 하는 계약이다.
- 새 노드 타입은 `core/nodes/` 아래에 두고 `index.ts`에 export를 추가한다. `src/` 루트에는 소스 파일을 직접 두지 않는다.
- 플러그인 등록은 `registerPlugin()`만을 경유한다. `PluginManager`의 static 상태를 우회 변경하지 않는다.

## API Contracts

### 스키마 옵션

`types/jsonSchema.ts`가 선언하는 `options` 필드. 각 옵션은 특정 스키마 타입에만 존재한다.

| 옵션                     | 적용 스키마                                        | 계약                                                                                                                                              |
| ------------------------ | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `trim?: boolean`         | `NonNullableStringSchema` · `NullableStringSchema` | 필드가 `Blurred`를 방출할 때 저장된 값을 공백 트림된 형태로 **교체**한다. 저장 값 자체가 바뀌므로 raw `value`에도 반영된다                        |
| `omitTrailing?: boolean` | `NonNullableArraySchema` · `NullableArraySchema`   | 배열의 `normalizedValue`에서 후행 `undefined` 항목을 제거한다. 적용 범위는 부모 전파·루트 검증·외부 방출이며, **자식 노드는 raw 배열을 유지**한다 |
| `omitEmpty?: boolean`    | 객체 스키마                                        | 부모로 전파되는 값에서 빈 항목을 제거한다                                                                                                         |

`trim`과 `omitTrailing`의 차이가 이 표의 요점이다 — `trim`은 **저장 값을 교체**하는 옵션이고, `omitTrailing`은 **방출 값만 걸러내는** 옵션이다. 후자는 raw 상태를 보존하므로 되돌릴 수 있고, 전자는 그렇지 않다.

`omitTrailing`과 `omitEmpty`의 적용 지점도 다르다 — `omitTrailing`은 `ArrayNode.normalizedValue`에, `omitEmpty`는 부모 전파 경로에 걸린다. 두 필터가 함께 적용될 때의 순서는 `core/nodes/ArrayNode/utils/resolveArrayValueFilter`가 소유한다.

### 값 채널

| 표면                                                      | 채널                     |
| --------------------------------------------------------- | ------------------------ |
| `FormHandle.getValue()` · `submit` · 루트 `onChange` 방출 | 정제 (`normalizedValue`) |
| `FormHandle.setValue()`                                   | raw                      |
| `node.value` · `UpdateValue` 이벤트 payload               | raw                      |
| `node.normalizedValue`                                    | 정제                     |
| `node.enhancedValue`                                      | 정제 + 가상 필드         |

## Acceptance Criteria

### option-surface — 옵션은 선언된 스키마 타입에서만 유효하다

- `omitTrailing`은 배열 스키마에서만 타입 체크를 통과한다.
- `trim`은 문자열 스키마에서만 타입 체크를 통과한다.

### refine-not-destroy — 정제는 상태를 지우지 않는다

- `omitTrailing`이 켜진 배열에서 `getValue()` 결과에는 후행 빈 항목이 없고, 같은 시점의 `node.value`와 렌더된 입력 개수에는 남아 있다.
- 후행 빈 항목에 값을 입력하면 그 항목이 다시 `getValue()` 결과에 나타난다 — 정제가 항목을 영구히 제거하지 않았음이 관찰된다.

### trim-replaces — trim은 저장 값을 바꾼다

- `trim`이 켜진 문자열 필드에서 `Blurred` 이후 `node.value`가 트림된 값으로 바뀐다 — `omitTrailing`과 달리 raw 채널에도 반영된다.

## Last Updated

2026-08-12 — 배열 `options.omitTrailing` 신설에 맞춰 스키마 옵션 공개 계약과 값 채널 표를 명문화하고, 저장 값을 교체하는 `trim`과 방출 값만 거르는 `omitTrailing`의 차이를 고정 (신규 문서).
