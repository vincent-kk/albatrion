# schema-form/src contract

## Requirements

- `index.ts`가 이 패키지의 공개 표면이다. 소비자는 이 진입점이 이름으로 내보낸 심볼만 사용하며, 하위 모듈 파일을 직접 참조하지 않는다.
- **스키마 `options`는 공개 계약이다.** `JSONSchema` 타입이 선언한 `options` 필드는 소비자가 스키마에 직접 쓰는 값이므로, 필드를 추가·삭제하거나 의미를 바꾸는 것은 공개 계약 변경이다.
- 값 투영 옵션은 **방출 값을 바꾸되 노드 트리를 바꾸지 않는다.** 투영은 노드가 밖으로 내보내는 값(`outputValue`)에 적용되고, 자식 노드·렌더된 입력·편집 중인 `value`는 유지된다. 이 분리는 사용자가 편집 중인 화면이 투영 때문에 접히지 않게 하는 계약이다(VALUE-027·034, LANDING-067).
- `<Form>`은 `core/`의 새 엔진을 사용하며 노드 종류는 동작 행 계약을 따릅니다. `src/__legacy__/`는 참고용으로 보존하고, 비레거시 코드는 이 경로를 가져오지 않습니다(LANDING-067·205).
- 플러그인 등록은 `registerPlugin()`만을 경유한다. `PluginManager`의 static 상태를 우회 변경하지 않는다.
- 공개 검증 오류 형은 `ValidationIssue`이며 패키지 진입점은 `JSONSchemaError`를 내보내지 않습니다. 노드 형·가드도 새 엔진의 계약을 이름으로 내보냅니다(ERROR-032, 34C-02·50C-01, LANDING-067·170).
- 상태 열거는 내부와 공개 경계에서 `SchemaNodeState` 한 이름을 사용하며 Dirty=1·Touched=2·ShowError=4를 유지합니다. `NodeState` 별칭은 내보내지 않습니다(SURFACE-056·060, LANDING-157).

## API Contracts

### 렌더 시험 하니스

- `renderForm`은 동기 guard와 루트 검증기를 등록하고 생성 시 정착된 Form을 관찰합니다. `flushOnMount: false`는 React 비동기 작업의 추가 대기만 생략하며 미정착 엔진 스냅숏을 뜻하지 않습니다(TEST-021).
- `reset`은 호출 안의 동기 로드와 이후 React 커밋 재대조를 포함합니다. 하니스의 비동기 래퍼는 그 커밋을 기다립니다.
- 주인 없는 오류 싱크와 Form `onError` 기록은 별도로 관찰합니다. 반환한 container에 현재 핸들과 화면 어댑터를 등록하고 언마운트 때 해제합니다(TEST-011·021).

### 스키마 옵션

`types/jsonSchema.ts`가 선언하는 `options` 필드. 각 옵션은 특정 스키마 타입에만 존재한다.

| 옵션                     | 적용 스키마                                        | 계약                                                                                                                                              |
| ------------------------ | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `trim?: boolean`         | `NonNullableStringSchema` · `NullableStringSchema` | 입력 마침 통로가 문자열 행의 `finishInput`을 적용해 저장 값을 자른 값으로 **교체**한다. 자동 쓰기 억제를 따르며 외부 오류와 dirty는 유지한다(WRITE-083) |
| `omitTrailing?: boolean` | `NonNullableArraySchema` · `NullableArraySchema`   | 배열의 `outputValue`에서 후행 `undefined` 항목을 제거한다. 적용 범위는 부모 투영·루트 검증·외부 방출이며, **편집 값과 자식 노드는 유지**한다 |
| `omitEmpty?: boolean`    | 객체 스키마                                        | 부모로 전파되는 값에서 빈 항목을 제거한다                                                                                                         |

`trim`과 `omitTrailing`의 차이가 이 표의 요점이다 — `trim`은 **저장 값을 교체**하는 옵션이고, `omitTrailing`은 **방출 값만 걸러내는** 옵션이다. 후자는 raw 상태를 보존하므로 되돌릴 수 있고, 전자는 그렇지 않다.

`omitTrailing`과 `omitEmpty`는 새 엔진의 동작 행에서 투영에 적용합니다. 부모도 자식의 `outputValue`를 사용하며, 배열의 두 필터 결합은 배열 행의 투영 계약을 따릅니다(VALUE-027·034, LANDING-085).

### 값 채널

읽기 전용 `type` 튜플의 리터럴 원소는 `InferValueType` 정규화 과정에서 보존합니다. 그 결과를 사용하는 `FormTypeInputProps`의 `onChange`는 선언한 종류의 값과 undefined·함수 갱신 표면을 허용합니다.

NODE-059의 형 없는 인라인 객체·배열 oneOf·anyOf는 분기 값 형의 합으로, null 분기가 있으면 null까지 포함해 추론합니다. `$ref`, 게이트 분기, 두 키워드의 동시 사용, 본체 `allOf`는 넓은 값 형을 유지합니다. 분기 없는 `const`·`enum` 칸은 리터럴 또는 enum 원소의 합을 보존합니다. 형 추론은 작성 스키마를 바꾸지 않습니다.

| 표면                                                      | 채널                     |
| --------------------------------------------------------- | ------------------------ |
| `FormHandle.getValue()` · `submit` · 루트 `onChange` 방출 | 투영 (`outputValue`) |
| `FormHandle.setValue()`                                   | raw                      |
| `node.value` · `UpdateValue` 이벤트 payload               | 편집 중 계산 값          |
| `node.outputValue`                                        | 투영                     |

## Acceptance Criteria

### option-surface — 옵션은 선언된 스키마 타입에서만 유효하다

- `omitTrailing`은 배열 스키마에서만 타입 체크를 통과한다.
- `trim`은 문자열 스키마에서만 타입 체크를 통과한다.

### refine-not-destroy — 정제는 상태를 지우지 않는다

- `omitTrailing`이 켜진 배열에서 `getValue()` 결과에는 후행 빈 항목이 없고, 같은 시점의 `node.value`와 렌더된 입력 개수에는 남아 있다.
- 후행 빈 항목에 값을 입력하면 그 항목이 다시 `getValue()` 결과에 나타난다 — 정제가 항목을 영구히 제거하지 않았음이 관찰된다.

### trim-replaces — trim은 저장 값을 바꾼다

- `trim`이 켜진 문자열 필드에서 `Blurred` 이후 `node.value`가 트림된 값으로 바뀐다 — `omitTrailing`과 달리 raw 채널에도 반영된다.

### union-input-types — 읽기 전용 종류 튜플은 값 합집합을 보존한다

- 실제 공개 `InferValueType`과 `FormTypeInputProps`를 사용한 시험에서 선언한 종류의 값은 허용하고 목록 밖 값은 타입 오류로 거부합니다.
- 정규화는 튜플 원소와 원래 type 프로퍼티의 필수·선택 여부를 보존합니다.

### public-value-inference — 형 없는 스키마의 공개 값 형

- 모든 분기가 인라인 객체 또는 배열인 칸은 분기 값의 합집합과 null 분기를 보존합니다. 참조·게이트·두 키워드·본체 allOf는 넓은 값 형을 유지합니다.
- 분기 없는 `const`와 `enum` 칸의 리터럴은 그 값 또는 원소의 합으로 추론합니다.
- 형 수준에서 청사진 오류를 확정할 수 있는 객체·배열 리터럴, 종류가 섞인 리터럴, 혼합 인라인 분기는 `unknown`입니다. 정적 판정이 불가능한 모양은 기존 넓은 값 형을 유지합니다.

### union-migration-shapes — 공개 엔진의 이주 모양

- LANDING-207·208의 형 없는 객체 분기, 게이트 없는 자기 순환, 리터럴 전용 프로퍼티에서 공개 `<Form>`의 수용·오류 코드와 실제 화면이 새 엔진 계약에 일치합니다.

## Last Updated

계약 기준: LANDING-067·170·205·207·208, WRITE-083, VALUE-027·034.
