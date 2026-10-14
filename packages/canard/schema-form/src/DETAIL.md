# schema-form/src contract

## Requirements

- `index.ts`가 이 패키지의 공개 표면이다. 소비자는 이 진입점이 이름으로 내보낸 심볼만 사용하며, 하위 모듈 파일을 직접 참조하지 않는다.
- **스키마 `options`는 공개 계약이다.** `JSONSchema` 타입이 선언한 `options` 필드는 소비자가 스키마에 직접 쓰는 값이므로, 필드를 추가·삭제하거나 의미를 바꾸는 것은 공개 계약 변경이다.
- 값 투영 옵션은 **방출 값을 바꾸되 노드 트리를 바꾸지 않는다.** 투영은 노드가 밖으로 내보내는 값(`outputValue`)에 적용되고, 자식 노드·렌더된 입력·편집 중인 `value`는 유지된다. 이 분리는 사용자가 편집 중인 화면이 투영 때문에 접히지 않게 하는 계약이다(VALUE-027·034, LANDING-067).
- `<Form>`은 `core/`의 새 엔진을 사용하며 노드 종류는 동작 행 계약을 따른다. `src/__legacy__/`는 참고용으로 보존하고, 비레거시 코드는 이 경로를 가져오지 않는다(LANDING-067·205).
- 플러그인 등록은 `registerPlugin()`만을 경유한다. `PluginManager`의 static 상태를 우회 변경하지 않는다.
- 공개 검증 오류 형은 `ValidationIssue`이며 패키지 진입점은 `JSONSchemaError`를 내보내지 않는다. 오류·경고 코드는 `FormErrorCode`·`FormWarningCode`(값과 형)로 공개하며 오류 클래스는 가드 넷으로만 가른다(289라운드 D4, 32C-02). 노드 형·가드도 새 엔진의 계약을 이름으로 내보낸다(ERROR-032, 34C-02·50C-01, LANDING-067·170).
- 상태 열거는 내부와 공개 경계에서 `FieldNodeState` 한 이름을 사용하며 Dirty=1·Touched=2·ErrorVisible=4를 유지한다. `NodeState` 별칭은 내보내지 않는다(SURFACE-056·060, LANDING-157).
- `__tests__/e2e`·`__tests__/scenarios`·`__tests__/migration`은 외부 소비자 자격으로 루트 `index.ts`를 가져오는 공개 API 시험 구획이다(D7). 나머지 제품·시험·fixture는 자기·조상 내부를 직접 가져오고 자기·조상 index를 거치지 않으며, 자손·혈통 밖 fractal은 관문 index로 소비하는 import 모델을 따른다.
- `hooks`·`types`는 `src`의 자식 fractal이다. 루트 `index.ts`는 공개 훅을 `./hooks` 관문으로, 공개 형을 `./types` 관문으로, 공개 Form 조각 형을 `./components/Form` 관문으로 재수출한다. `types`는 기반 형을 `internal/` 칸에, 공개 `Roll` 형을 `rolled/` 칸에 두며 공개 이름과 겹치는 기반 형은 `Base` 접두사를 가진다. `src`의 organ(`constants`·`helpers` 칸)은 자식 fractal을 가져오지 않는다(모델 B1). `constants`에는 index가 없어 소비자가 `constants/bitmask`·`constants/control`·`constants/style` 파일을 직접 가져온다.

## API Contracts

### 경계 검증과 시험 도우미

- `__tests__/importModel.test.ts`는 D7 밖 U·D·S1 위반을 막고, `__tests__/publicSurface.test.ts`는 공개 이름 92개와 값·형 구분 및 경로 없는 형 문자열의 스냅숏을 검증한다. 두 시험은 제품 모듈을 import하지 않고 파일과 TypeScript 구문·형 정보를 읽는다.
- `__tests__/fixtures/nodeFromJSONSchema.ts`는 core index의 공개 생성·마운트 통로로 마운트된 루트를 만드는 시험·bench 도우미이다. 제품 트리나 패키지 공개 표면에 속하지 않는다. vitest 벤치는 재는 대상 fractal의 벤치 칸(지금은 `core/__benchmarks__`)에 있어 이 도우미를 상위 방향으로 열린 경로로 가져온다. src 밖의 `bench/legacy-compare/`(레거시 비교 독립 스크립트)·`bench/scripts/`(진단 스크립트)와 aileron 벤치마크의 find 대상 데이터·`loadCoreBenchmark`는 측정 도구라서 이 파일을 경로로 가져온다.
- `__tests__/helpersErrorIndex.test.ts`는 자식 error 관문의 이름을 검증한다.
- `__tests__/Form.label.test.tsx`는 Form 관문이 조립한 `Form.Label`·`Form.Input` 정적 멤버로 label 규약을 검증한다. 관문의 조립 모양을 쓰는 시험이므로 Form 안이 아니라 부모 시험 구획에 둔다. 공개 진입점의 이주 형 검증은 D7 migration 구획에서 루트 index를 소비한다.

### 렌더 시험 하니스

- `renderForm`은 동기 guard와 루트 검증기를 등록하고 생성 시 정착된 Form을 관찰한다. `flushOnMount: false`는 React 비동기 작업의 추가 대기만 생략하며 미정착 엔진 스냅숏을 뜻하지 않는다(TEST-021).
- `reset`은 호출 안의 동기 로드와 이후 React 커밋 재대조를 포함한다. 하니스의 비동기 래퍼는 그 커밋을 기다린다.
- 주인 없는 오류 싱크와 Form `onError` 기록은 별도로 관찰한다. 반환한 container에 현재 핸들과 화면 어댑터를 등록하고 언마운트 때 해제한다(TEST-011·021).
- 공유 `clear` 단계는 nullable이 아닌 기본 문자열·수 입력에서 실제 DOM 입력 비우기로 실행해 undefined 전달을 관찰한다(LANDING-196). 배열·nullable·기타 위젯과 batch 내부의 비우기는 핸들 동작으로 실행한다.

### 이주 검증

- 이주 시험은 공개 Form으로 새 동작을 검증하며 레거시 구현을 import하지 않는다. 0.16.0의 동작은 이주 점검표의 기록으로 대조하고, 채움 시점 세 장면은 T1-B 탐침을 근거로 삼는다(LANDING-200–203).
- 공개 표면 대조는 FormProps의 기존 칸과 추가 칸, FormHandle, 이벤트·명령·훅의 이름과 시그니처를 형 검사로 확인한다(SURFACE-059). 원장에 없는 변경은 이주 행을 임의로 만들지 않고 원장 관리자에게 보고한다.

### 작성 표면

`types/internal/jsonSchema.ts`의 스키마 형은 0.16.0이 선언하던 `computed`, `&` 축약 여덟 개, 스키마 수준 `injectTo`, 최상위 `terminal`과 객체의 최상위 `virtual`·`propertyKeys`를 선언하지 않는다. 제어는 `controls` 안에, 정적 설정은 `options` 안에 둔다(CONTROLS-016·051). 객체 스키마의 `options`는 내보내는 값의 키 순서 `propertyOrder`와 가상 필드 묶음 `virtual`을 선언한다. 끝의 `[alt: string]: any`는 검증기 키워드를 위해 남으므로 그 키를 써도 형 오류는 아니며, 런타임도 그 키를 제어로 읽지 않는다.

공개 `JSONSchema`(코어 인터페이스 `AuthoredSchema`의 별칭)와 종류별 별칭은 `controls`를 코어의 `SchemaControls` 형으로 선언한다. 주석이나 `satisfies`로 형을 준 스키마에서 `controls` 안의 모르는 키, 배열이 아닌 `watch`, 함수가 아닌 `injectTo`, `fields` 항목 안의 아홉 키 밖 키는 형 오류이다. 조각 자리(`oneOf`/`anyOf`/`allOf` 분기, `then`, `else`)는 같은 재귀 스키마 형을 쓰므로 아홉 키 제한을 형으로 걸지 않으며, 형을 주지 않은 인라인 `jsonSchema`는 제네릭 추론 때문에 중첩된 초과 키를 검사하지 않는다. 두 경우 모두 런타임이 청사진 오류를 던진다. `options`의 형은 아직 열려 있다.

### 스키마 옵션

`types/internal/jsonSchema.ts`가 선언하는 `options` 필드. 각 옵션은 특정 스키마 타입에만 존재한다.

| 옵션                     | 적용 스키마                                        | 계약                                                                                                                                                                                                                                         |
| ------------------------ | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `trim?: boolean`         | `NonNullableStringSchema` · `NullableStringSchema` | 입력 마침 통로가 문자열 행의 `finishInput`을 적용해 저장 값을 자른 값으로 **교체**한다. 자동 쓰기 억제를 따르며 외부 오류와 dirty는 유지한다(WRITE-083)                                                                                      |
| `omitTrailing?: boolean` | `NonNullableArraySchema` · `NullableArraySchema`   | 배열의 `outputValue`에서 후행 `undefined` 항목을 제거한다. 적용 범위는 부모 투영·루트 검증·외부 방출이며, **편집 값과 자식 노드는 유지**한다                                                                                                 |
| `omitEmpty?: boolean`    | 객체 스키마                                        | 부모로 전파되는 값에서 빈 항목을 제거한다                                                                                                                                                                                                    |
| `terminal?: boolean`     | 객체·배열 스키마 네 형(Nullable·NonNullable)       | 노드를 값 전체를 다루는 입력 하나(`true`)로 둘지 자식 노드(`false`)로 둘지 정한다. 렌더러 판정보다 우선하며, 없으면 `presentation.FieldInput` 컴포넌트일 때 terminal, 그 밖에는 branch다. 형 선언만 있고 판정은 `resolveNodeStrategy`가 한다 |

`trim`과 `omitTrailing`의 차이가 이 표의 요점이다. `trim`은 **저장 값을 교체**하는 옵션이고, `omitTrailing`은 **방출 값만 걸러내는** 옵션이다. 후자는 raw 상태를 보존하므로 되돌릴 수 있지만, 전자는 되돌릴 수 없다.

`omitTrailing`과 `omitEmpty`는 새 엔진의 동작 행에서 투영에 적용한다. 부모도 자식의 `outputValue`를 사용하며, 배열의 두 필터 결합은 배열 행의 투영 계약을 따른다(VALUE-027·034, LANDING-085).

### 값 채널

읽기 전용 `type` 튜플의 리터럴 원소는 `InferValueType` 정규화 과정에서 보존한다. 그 결과를 사용하는 `FieldInputProps`의 `onChange`는 선언한 종류의 값과 undefined·함수 갱신 표면을 허용한다.

NODE-059의 형 없는 인라인 객체·배열 oneOf·anyOf는 분기 값 형의 합으로, null 분기가 있으면 null까지 포함해 추론한다. `$ref`, 게이트 분기, 두 키워드의 동시 사용, 본체 `allOf`는 넓은 값 형을 유지한다. 분기 없는 `const`·`enum` 칸은 리터럴 또는 enum 원소의 합을 보존한다. 형 추론은 작성 스키마를 바꾸지 않는다.

| 표면                                                      | 채널                 |
| --------------------------------------------------------- | -------------------- |
| `FormHandle.getValue()` · `submit` · 루트 `onChange` 방출 | 투영 (`outputValue`) |
| `FormHandle.setValue()`                                   | raw                  |
| `node.value` · `UpdateValue` 이벤트 payload               | 편집 중 계산 값      |
| `node.outputValue`                                        | 투영                 |

## Acceptance Criteria

### authoring-surface — 지워진 작성 키를 선언하지 않는다

- 색인 서명을 뺀 `BasicSchema`의 선언 키에는 `computed`, `&` 축약, `injectTo`, `terminal`이 없고, 객체 스키마의 선언 키에는 `virtual`, `propertyKeys`도 없고, 객체 스키마의 `options`는 `propertyOrder`와 `virtual`을 선언한다.

### controls-surface — controls는 런타임이 받는 키와 값만 형으로 받는다

- 공개 `JSONSchema`와 종류별 별칭의 `controls` 키는 런타임의 열세 키와 같고, fields 항목의 `controls` 키는 아홉 키와 같다.
- 모르는 키, 문자열 `watch`, 함수가 아닌 `injectTo`는 주석·`satisfies` 리터럴에서 형 오류이고, 사용자 정의 `Options`를 넘긴 `JSONSchema`는 그대로 컴파일된다.

### option-surface — 옵션은 선언된 스키마 타입에서만 유효하다

- `omitTrailing`은 배열 스키마에서만 타입 체크를 통과한다.
- `trim`은 문자열 스키마에서만 타입 체크를 통과한다.

### refine-not-destroy — 정제는 상태를 지우지 않는다

- `omitTrailing`이 켜진 배열에서 `getValue()` 결과에는 후행 빈 항목이 없고, 같은 시점의 `node.value`와 렌더된 입력 개수에는 남아 있다.
- 후행 빈 항목에 값을 입력하면 그 항목이 다시 `getValue()` 결과에 나타난다. 정제가 항목을 영구히 제거하지 않았음을 이 동작으로 확인할 수 있다.

### trim-replaces — trim은 저장 값을 바꾼다

- `trim`이 켜진 문자열 필드에서 `Blurred` 이후 `node.value`가 트림된 값으로 바뀐다. `omitTrailing`과 달리 raw 채널에도 반영된다.

### union-input-types — 읽기 전용 종류 튜플은 값 합집합을 보존한다

- 실제 공개 `InferValueType`과 `FieldInputProps`를 사용한 시험에서 선언한 종류의 값은 허용하고 목록 밖 값은 타입 오류로 거부한다.
- `InferJSONSchema`는 서로 다른 비-null 종류의 값 합집합을 하나의 type 튜플로 추론하며, 이에 대응하는 입력 노드는 `UnionNode`이다(LANDING-190). 같은 종류의 리터럴 합집합과 nullable 단일 종류는 기존 종류 노드를 유지한다.
- 정규화는 튜플 원소와 원래 type 프로퍼티의 필수·선택 여부를 보존한다.

### public-value-inference — 형 없는 스키마의 공개 값 형

- 모든 분기가 인라인 객체 또는 배열인 칸은 분기 값의 합집합과 null 분기를 보존한다. 참조·게이트·두 키워드·본체 allOf는 넓은 값 형을 유지한다.
- 분기 없는 `const`와 `enum` 칸의 리터럴은 그 값 또는 원소의 합으로 추론한다.
- 형 수준에서 청사진 오류를 확정할 수 있는 객체·배열 리터럴, 종류가 섞인 리터럴, 혼합 인라인 분기는 `unknown`이다. 정적 판정이 불가능한 모양은 기존 넓은 값 형을 유지한다.

### union-migration-shapes — 공개 엔진의 이주 모양

- LANDING-207·208의 형 없는 객체 분기, 게이트 없는 자기 순환, 리터럴 전용 프로퍼티에서 공개 `<Form>`의 수용·오류 코드와 실제 화면이 새 엔진 계약에 일치한다.

## Boundary Exemptions

### `index.ts` — 공개 패키지 표면의 컴파일 전용 검증

- **Consumers**: `**/packages/canard/schema-form/src/__tests__/migration/switchSurface.type-test.ts`
- **Direct import**: `allowed`
- **Reason**: 이 검증은 패키지 공개 표면의 타입·가드·열거와 비공개 심볼의 부재를 확인하므로 패키지 진입점 자체를 소비해야 한다. 소유 경계의 검증 구획에 두고 패키지 tsc의 src 포함으로 검사한다. 이름을 유지한 컴파일 전용 .type-test.ts는 filid adapter의 검증 파일 분류와 Vitest 런타임 시험 glob에 포함되지 않으므로, 이 파일의 공개 진입점 참조에만 예외를 선언한다.

## Last Updated

계약 기준: LANDING-067·170·205·207·208, WRITE-083, VALUE-027·034; 정돈-2(2026-10-14).
