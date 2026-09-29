# Blueprint contract

## Requirements

- 원장은 BLUEPRINT·FRAGMENT·SCHEMA 영역 및 관련 CONTROLS·ERROR 보충을 정본으로 삼습니다. 정적 분석은 노드 생성·값 판정·게이트 평가를 하지 않습니다.
- 의존 방향은 `blueprint < record < {종류 동작, navigation} < settle < SchemaNode`입니다. 청사진은 뒤 fractal을 가져오지 않고 그들이 소비할 선언·식·평가 자리만 내며, 식 컴파일러 organ의 기존 경계 예외는 아래에 둡니다(NODE-016, SETTLE-045).
- 작성 위치별 분석은 한 번이며 참조 그래프는 유한합니다. 객체 프로퍼티만으로 이어지는 무게이트·비터미널 순환은 오류이고, nullable은 순환을 끊지 않습니다. 배열 아이템·게이트·터미널은 형상 확장의 경계입니다.
- 조각 순서는 properties, allOf, if/then/else, oneOf, anyOf이며 배열 인덱스와 중첩 경로로 전순서를 정합니다. 조각 문맥은 연언과 선언을 구별하고 상속 overlay의 호스트 귀속을 보존합니다.
- 정적 허용 형 집합은 교집합입니다. integer는 number의 부분집합이고 null은 양쪽에 있을 때만 남습니다. 종류 비교에서 integer를 number로 접지만 schemaType에는 정수 제한을 보존합니다.
- 형 없는 칸은 BLUEPRINT-048·050·051대로 게이트 없는 oneOf·anyOf의 허용 집합을 먼저 합치고, 두 키워드가 함께 있으면 교차한 U에서 null을 뗀 F로 종류를 정합니다. F가 `{object}`·`{array}`면 variant 호스트이고, 다른 종류와 섞이면 오류입니다. 게이트 분기는 U에서 제외하며 재귀 분기·참조는 현재 경로 재진입에서 절단합니다. 분기 없는 `const`·`enum` 칸은 단일 JSON 종류의 원시 리터럴 잎이며 분기 안의 리터럴 전용 칸은 여전히 ⊤입니다. union은 터미널이고 가상 노드를 포함한 종류는 여덟입니다.
- 게이트 없는 분기는 존재만 더합니다. 공유 노드의 제약·주석·상태·options·presentation은 그 분기가 유일한 선언일 때만 기여합니다. 정적 선언이 없는 이름을 서로 다른 fold의 무게이트 분기가 선언하면 오류입니다.
- 명시 discriminator만 정적 const·enum을 읽습니다. 정적 allOf·참조를 따라 태그를 교차하고, 끌어올린 선언과 자기 active의 결합을 보존하며 작성 스키마는 바꾸지 않습니다.
- controls·options와 children 항목의 허용 키는 닫힌 목록입니다. 닫힌 목록 밖 키는 UNKNOWN_GROUP_KEY, 목록 안 키의 값 모양 오류는 INVALID_CONTROL_SHAPE입니다. injectTo는 함수만 허용하고 정적 대상 분석은 하지 않습니다. presentation은 불투명 병합 데이터로만 취급합니다.

## API Contracts

- `blueprint(schema, options?)`는 작성 루트와 분석 옵션으로 청사진을 만듭니다. 옵션은 터미널 판정·원자 판정·진단 수집기를 주입합니다. 캐시를 사용하는 호출은 호출자가 소유한 캐시를 명시적으로 전달하고, 동일 스키마와 동일 판정 조건에서 결과 참조를 재사용합니다. 캐시는 진단 소비자가 나중에 붙어도 루트당 경고를 한 번 수집할 수 있어야 합니다.
- 청사진은 `PropertyDeclaration`, `SchemaFragment` 및 노드별 선언·종류·schemaType·nullable·전략을 노출합니다. 형 없는 variant의 schemaType은 추정한 `'object'`·`'array'`이고 nullable은 null을 포함한 U에서 정합니다. 조각은 schemaPath, 게이트 기술, 선언 문맥, 선언·제약·상속 overlay와 자식 조각을 보존합니다. 게이트 기술에는 실제 평가 결과를 저장하지 않습니다.
- 자식 연결은 이름·참조 템플릿·해당 호스트의 선언과 게이트를 보존합니다. 같은 참조 대상이라도 호스트별 덧씌움이나 선언 문맥이 다르면 유효 스키마의 선언 집합을 공유하지 않습니다. 재귀 참조는 분석 중인 템플릿을 다시 가리켜 유한하게 유지하며, 최초 방문 경로를 이후 연결의 호스트 경로로 오인하지 않습니다.
- 유효 스키마 병합은 활성 선언을 전순서로 받아 결과 기록 `EffectiveSchema { schema, typeConflict }`를 돌려줍니다. 정적 모드에서 둘 이상의 기여를 교차한 결과가 공집합이면 경로가 있는 JSONSchemaError입니다. 선언 하나의 역전 범위와 리터럴 `enum: []`은 검증기 몫이라 그대로 둡니다. 런타임 enum·const 공집합은 enum 빈 배열로 표시하고 충돌한 const를 제거합니다. 형 교집합이 비면 enum 빈 배열을 적지 않고 `typeConflict`로 드러내며 형과 nullable은 정적 선언대로 남기고(BLUEPRINT-041), 이를 정착 오류로 던지는 일은 후속 정착 계약의 몫입니다. 서로 다른 키워드 사이의 모순은 판정하지 않습니다.
- options·presentation은 주입된 원자 판정과 common-utils merge의 선택 인자로 병합합니다. 한쪽 값은 참조 이동, 양쪽 plain object는 쓰기 시 복사, 배열은 교체, 뒤의 undefined는 앞을 지우지 않습니다. 활성 집합이 같으면 결과 기록 참조도 같습니다.
- 유효 스키마 메모는 노드·활성 선언 집합·정적/런타임 모드·원자 판정 함수의 동일성을 구분합니다. 기본 메모는 노드를 약한 키로 보관하며 호출자가 별도 메모를 제공할 수 있습니다. 런타임 결과를 정적 검사에 재사용하여 오류를 건너뛰지 않습니다.
- 유효 형이 좁혀지지 않으면 schemaType의 스칼라 값 또는 배열 참조를 그대로 씁니다. 게이트로 좁혀진 비어 있지 않은 형 목록은 동결 배열이며, number에서 integer로 좁혀진 E41도 `['integer']`입니다(BLUEPRINT-045, WRITE-099).
- 서로 다른 pattern은 첫 것을 pattern에 남기고 나머지를 allOf의 개별 pattern으로 보존합니다. required는 연언에서 합집합이며 주석은 나중 값이 이깁니다. 값·동작 규칙은 합치지 않고 선언별로 보존합니다.
- 식 컴파일러는 이 모듈이 소유합니다. 정적 의존은 모든 선언의 watch·식 경로 합집합이며 실행 기준점은 해당 호스트입니다. 독립된 `*` 경로 조각은 허용하지 않으며 프로퍼티 이름에 포함된 별표는 보존합니다(CONTROLS-080). 의존 사전은 프로토타입 이름과 충돌하지 않습니다. 컴파일 실패는 schemaPath를 갖는 청사진 오류입니다.
- `JSON_POINTER_PATH_REGEX`는 이름으로 공개하는 식 경로 인식 규칙입니다. 청사진의 식 컴파일과 기존 조건 분기 추출이 같은 정규식을 사용해 의존 경로 해석이 갈라지지 않도록 합니다.
- 식 기록은 선언 식별자·작성 위치·호스트·제어 키·상대 의존 경로와 컴파일된 함수를 보존하되 분석 중 실행하지 않습니다. 공유 참조의 식은 연결별 호스트에 다시 결합하며 최초 방문 위치에 고정하지 않습니다.
- `BlueprintGate.evaluationReads`는 식이 읽는 자리의 정적 목록입니다. 절대 경로는 `#`·`(/)`의 루트 `''`, `/p`·`#/p`의 `'/p'`처럼 절대 경로 문자열로, 상대 경로는 선언 호스트에서 오르는 `..` 횟수(0 이상인 수)로 보존하며 `@`는 제외합니다. 청사진은 유한한 작성 위치마다 한 템플릿만 만들고 발생의 절대 평가 자리 L은 정하지 않습니다. 정착이 각 발생을 만들 때 그 발생 호스트와 모든 읽기 자리의 최저 공통 조상 L을 한 번 계산해 메모합니다. 단일 발생의 L은 종전 정적 규칙과 같습니다(SETTLE-045, BLUEPRINT-030, 26C-04·07).
- 선언은 노드 범위와 조각 범위를 구분합니다. 조각의 controls는 호스트 유효 스키마에 합치지 않고 직계 선언 자식 대상 규칙으로 보존합니다. 검증 전용 분기는 병합 기여에서 제외하며, 선언 문맥에서는 유일한 선언 자체만 기여하고 그 안의 then 등 overlay 제약을 교차하지 않습니다.
- children 항목의 active 게이트는 항목을 소유한 선언의 적용 조건을 별도로 보존합니다. 소유 선언이 꺼지면 항목 제어는 적용되지 않으며, 소유 게이트와 active를 단순 AND로 바꾸지 않습니다. 정적 순환 검사는 children 항목 게이트도 절단점으로 인정하고 실제 무한 확장의 판정은 후속 정착 계약을 따릅니다(BLUEPRINT-030).
- 진단은 코드·schemaPath·세부 정보를 담습니다. 소비자 없는 경고 검사는 수행하지 않으며, 캐시의 늦은 수집은 루트마다 한 번입니다. 검증기 입력에서는 폼 전용 키를 스키마 위치에서만 제거하고 데이터 값 내부 키를 보존합니다.
- 내부 참조의 URI 디코딩 또는 JSON Pointer 해석이 실패하면 작성 위치와 원인을 보존한 UNKNOWN_JSON_SCHEMA로 보고합니다.
- 터미널 하위 예약 키 경고는 터미널 노드의 schemaPath별 한 기록에 keys·paths를 모읍니다. 같은 코드와 schemaPath의 중복을 억제하며 인라인 하위만 조사하고 참조 대상은 따라가지 않습니다(BLUEPRINT-044).

## Acceptance Criteria

### type-syntax — 명시한 형과 전략

- BLUEPRINT-045 E1–E10·E28의 종류·schemaType·nullable·전략·오류가 일치합니다. TEST-077의 명시 union과 union 입력 형 계약을 만족합니다.

### type-inference — 형 없는 칸의 분기와 리터럴

- BLUEPRINT-045 E11–E17·E29·E32–E35의 합집합·교집합·형 없음 오류와 nullable 규칙을 만족합니다. E16은 BLUEPRINT-048의 object variant 호스트로 받습니다.

### type-inference-round19 — 형 없는 칸의 경계 사례

- TEST-079의 게이트 분기만, `{object,array}` 혼합, ⊤ 분기, 참조 순환 절단과 빈 U, 분기 없는 `const`·`enum`의 단일 종류·혼합·객체 리터럴, 분기 안의 `const`(계속 오류)를 각각 검증합니다.

### type-static-intersection — 정적 연언

- BLUEPRINT-045 E18–E24·E30·E31·E36–E39를 만족합니다. 정적 선언 순서는 앵커 원소의 순서만 바꾸며 의미는 바꾸지 않습니다.

### type-gated-declarations — 게이트와 선언 문맥

- BLUEPRINT-045 E25–E27·E40–E42 및 WRITE-099 보충을 만족합니다. E26의 좁혀지지 않은 유효 목록은 배열이 아닌 scalar schemaType 그 값입니다. 정적 선언이 없는 이름의 무게이트 분기 fold 충돌을 검증합니다.

### type-schema-type-invariant — schemaType 불변식

- TEST-077에 따라 E1–E42 중 구성되는 모든 칸과 TEST-067(b) 코퍼스 14종의 모든 청사진 노드에서 `Array.isArray(schemaType)`은 union일 때만 참이고 배열 schemaType은 동결임을 검증합니다. 노드와 배열 아이템의 같은 참조는 노드 엔진 단계의 몫입니다.

### fragment-declarations — 조각과 공유

- 선언·연언 문맥, 모든 키워드 전순서, 노드 공유, 상속 overlay 귀속과 가상 fields 순서 일치를 검증합니다.

### discriminator — 명시 판별

- 참조·allOf·자기 active 결합·끌어올림·null 분기·태그 누락·중복·도달 불가능 진단을 검증합니다. 자동 판별은 발생하지 않습니다.
- `DISCRIMINATOR_MISMATCH`는 넷입니다: 키가 어느 분기에도 없음(`missing`), 분기끼리 종류가 다름(`kind`), 분기 사이 값이 겹침(`overlap`), 같은 노드의 선언 사이 판별 키가 다름(`key`). details는 `{ propertyName, other?, reason }`이며 `key`에서 `propertyName`은 먼저 선언된 키, `other`는 다른 키입니다(25C-12).

### effective-schema — 병합과 참조

- SCHEMA 병합표와 정적 오류·런타임 공집합 표현, pattern 보존, 불변성·동일 활성 집합 참조를 검증합니다.

### expressions — 컴파일과 의존

- 옮긴 컴파일러의 기존 시험이 유지되고 기준점·watch 합집합·금지 경로·컴파일 실패 위치를 검증합니다.

### gate-evaluation-location — L의 정적 계산

- `BlueprintGate.evaluationReads`는 `#`·`(/)`의 절대 루트, `/p`·`#/p`의 절대 `p`, `@` 제외와 상대 오름 횟수를 청사진 단위 사례로 검증합니다. 유한한 재귀 템플릿의 동일 게이트는 한 정적 목록을 공유하고 발생별 L은 정착에서 서로 다르게 계산합니다(SETTLE-045, 26C-04·07).

### diagnostics — 닫힌 목록과 수집

- ERROR-164의 현행 청사진 코드마다 사례가 있고, 보충과 폐기된 코드의 제외를 반영합니다. 값 모양 오류의 새 코드 INVALID_CONTROL_SHAPE(그룹·injectTo·children·children 항목·판별 키 모양)와 닫힌 목록 밖 키의 UNKNOWN_GROUP_KEY를 나눠 검증합니다. 터미널 하위 예약 키는 인라인 하위만 검사하고 참조를 따라가지 않습니다.

### recursion — 유한 분석과 형상

- TEST-067의 스캐너 신호·무한 형상 표본·절단 표본을 통과하고 참조가 많은 스키마의 분석 1회 비용을 기록합니다. 정착 표본 (c′)는 후속 노드 엔진 단계입니다.

### corpus — 원본 생성기 표본

- TEST-067(b)·TEST-079에 따라 생성기 코퍼스 14종을 수정 없이 각각 청사진으로 수용하고, 실패한 표본의 ID를 식별합니다.

### validator-schema — 제거 위치

- 폼 예약 키는 스키마 위치에서 제거하며 const·enum·default 등의 데이터 내부에 같은 이름이 있어도 보존합니다.

## Boundary Exemptions

### `utils/expressions` — shared compiler during migration

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: The compiler belongs to schema analysis. The legacy computed-property engine consumes named compiler exports until the runtime entry point switches; duplicating it would permit the two engines to accept different expression languages.

## Last Updated

2026-09-29
