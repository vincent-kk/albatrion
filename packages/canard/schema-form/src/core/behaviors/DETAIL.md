# behaviors 계약

## Requirements

- `record < 종류 fractal < behaviors 뿌리 < SchemaNode`이며 종류 fractal과 `navigation`은 서로 의존하지 않습니다. `settle`은 이 표를 import하지 않고 `node.behavior`를 호출합니다(NODE-016, raw-round17 §3).
- `utils/parse/`는 독립 공개 계약이 아니라 행과 기본 union 입력의 내부 변환입니다. 그 문서 계약은 이 fractal의 DETAIL이 소유합니다(LANDING-150, NODE-056).
- 이 fractal의 organ을 외부 소비자가 직접 가져올 이유가 없으므로 경계 예외는 없습니다(NODE-016).

## API Contracts

- `BEHAVIORS`는 `Readonly<{ [type in BlueprintNodeKind]?: Readonly<{ branch?: Behavior; terminal?: Behavior }> }>`의 두 단계 표입니다. 배열 행이 없는 PR-2에서는 바깥 키도 부분 표입니다. 진입점은 표를 이름으로 내보내고, 생성 함수가 청사진의 `kind`·`strategy`로 행을 한 번 고릅니다. 행의 `Self`는 `record`의 제네릭 계약으로 전달하고 종류 모듈이 겉면의 `AnyNode`를 가져오지 않습니다(NODE-002·016·046, 26C-01).
- PR-2의 행은 `string.terminal`, `number.terminal`, `boolean.terminal`, `null.terminal`, `union.terminal`, `virtual.branch`, `object.branch`, `object.terminal`뿐입니다. 터미널 배열 행은 06단계에서 추가합니다(NODE-002·047, BLUEPRINT-043, LANDING-065).
- 행의 칸은 `interpret`, `assemble`, `project`, `finishInput`, `declareChildren`, `type`, `strategy` 순서입니다. 모든 행은 이 칸을 같은 순서로 가지며, 공유 기본 칸 위에 종류의 칸을 덮어 키 순서를 고정합니다. 같은 뜻의 칸은 같은 함수 참조를 씁니다. 여덟 줄을 넘는 칸과 종류 전용 보조는 그 종류의 utils organ에, 두 종류 이상이 쓰는 보조는 이 fractal의 utils organ에 둡니다(NODE-006·009, 26C-01).
- `options`의 빈 값 생략·`trim`·키 순서 등 정적 선택은 칸 호출마다 다시 구하지 않습니다. 유효 스키마 메모가 바뀔 때 한 번 계산하고 그 메모와 함께 둡니다(NODE-006, SETTLE-042).
- parse organ의 이름 붙은 계약은 `isMember(value: unknown, kind: UnionMemberType): boolean`, `convert(value: unknown, kind: UnionMemberType): unknown`, `interpret(value: unknown, spec: UnionSpec): unknown`입니다. `UnionSpec`은 얼린 `kinds`·`mask`·`nullable`을 갖고 기본 `kinds`는 청사진 `schemaType`과 같은 참조입니다. `convert`는 변환 불가 시 입력 참조를 그대로 돌려주고 성공 여부는 할당 없는 별도 판정으로 구별합니다. 세 함수는 순수하고 던지지 않으며 모든 입력에 결과가 있고, `interpret`는 멱등·순서 무관·할당 없음입니다(WRITE-084·093).
- `isMember`는 JSON Schema의 형을 검사합니다. `number`는 유한수, `integer`는 `Number.isInteger`, `object`는 null·배열을 제외한 객체입니다. `null`은 종류 목록이 아닌 `nullable`이 맡습니다. `convert`는 전체가 JSON 수 표기인 문자열→유한수(정수 문자열의 안전 범위), 안전 정수로 끝나는 문자열→integer, 유한수·불리언→string, 정확한 `"true"`·`"false"` 또는 1·0→boolean만 허용합니다. object·array·null 변환은 없습니다(WRITE-075·093).
- `interpret`는 `undefined`·`null`·이미 멤버인 값을 그대로 돌려줍니다. 나머지는 모든 종류의 변환 결과를 `===`로 중복 제거해 정확히 하나일 때만 그 결과를 쓰고, 0개 또는 둘 이상이면 원본을 그대로 둡니다. 후보 배열을 만들지 않습니다. `['string','boolean']`과 0·-0·1의 동점 12건을 그대로 둡니다. 단일 종류 행과 기본 union 입력도 같은 내부 함수를 씁니다(NODE-056, WRITE-093).
- 종류 모듈은 `record`·`blueprint`·이 fractal의 공유 organ만 소비합니다. behaviors 뿌리, `settle`, `SchemaNode`, `dispatch`, `validation`, 앱·플러그인 및 레거시는 타입 import까지 금지합니다(NODE-009·016, LANDING-159).

## Acceptance Criteria

### behavior-rows — 표와 칸

- PR-2의 여덟 행 모두 같은 키 순서를 가지며, 같은 계산은 같은 함수 참조를 쓰고 종류가 하나인 행의 전략은 고정됩니다(NODE-006·047).

### parse-rule-a — 변환의 경계

- 변환 표, 순열, 멱등, 동점 12건과 쓰기당 할당 0을 확인합니다. 변환 불가·모호한 입력은 참조가 그대로입니다(WRITE-084·093, TEST-077).

## Last Updated

2026-09-29
