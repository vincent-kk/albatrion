# Blueprint contract

## Requirements

- 반복 아이템과 각 prefixItems 자리는 작성 순서의 fold별 후보를 모두 보존한다. `item`과 `prefixItems[i]`는 첫 후보를 유지하고, 추가 후보 목록과 자리별 바인딩은 후보의 선언·게이트·작성 위치를 보존한다. 게이트 충돌은 분석 오류가 아니며 정적 첫 로드 자격은 단일 후보에만 허용한다(BLUEPRINT-011·012·044, 389C-03, 391C-01).

- 상태 키가 있는 첫 조각에서만 호스트의 자식 순서대로 각 자식의 전체 선언에 `getFragmentOwnerPaths`를 적용한 소유 경로 집합을 만든다. 같은 호스트의 조각은 이 집합을 재사용하고 대상 삽입 순서와 비활성 선언 포함을 유지하며, 호출 간 캐시나 새 청사진 필드는 두지 않는다(P-08, GOAL-011).

- 형 목록은 기존의 some·indexOf 검사에 predicate를 붙여 검증과 iterator 복사를 분리하며, 희소 배열, getter·iterator 읽기, 오류는 그대로 유지한다. 가드 호출 하나를 빼면 새 순회, 결과 배열, 보유 자료는 없다. 가상 필드 entry와 인라인 종단 경고의 map형 자식은 검증을 거치기 전의 작성 값이므로, 이유를 적은 형 단언으로 읽는다. 여기에 가드를 두면 지금 받아들이는 값(함수, 상속 필드를 가진 원시값)이 달라지기 때문이다.

- 참조 조회 결과와 controls 봉투는 단언 없는 가드로 걸러, 기존에 받아들이던 boolean·비null 객체 집합과 비null 객체 집합을 좁힌다. controls의 watch·default를 직접 읽는 순서와 횟수, 소유 등록, 단일 정적 기여의 키 순서는 유지한다. 새로 만든 hint 병합 객체의 root와 재귀 순회에 진입할 때 봉투 가드를 호출하며, 빌린 참조와 동결 정책은 유지한다. 속도 비용은 참조 조회, controls 기여, 생성 hint 순회마다 고정된 가드 호출이며 새 캐시, 색인, 보유 객체는 없다. 일반 갱신에서는 유효 스키마 메모가 빗나간 controls·hint 병합 경로에만 적용된다.

- 내부에서 누적하는 스키마의 소유 배열과 제어 필드는 선언부에서 형을 정한다. 생성 중인 자식 소속 배열은 가변이고, 공개 청사진에서는 읽기 전용이다. 공개 호스트의 종단 판정과, 청사진의 불리언 스키마를 포함하는 판정 입력 사이에서 생기는 형 차이는 소유자 승인 대기 목록에 기록한다. 형 정비는 생성 순서, 검사, 동결, 소유권 색인, 런타임 비용을 바꾸지 않으며, core와 React 기준 번들의 바이트가 동일한지로 확인한다(G27 B1).

- 103C-01 owned-inline: 공개 유효 schema·schemaType, 생산자가 공개 schema 안에 만든 배열·controls·hint 봉투, 공유 gate·evaluationReads·discriminator·values·소유 appliesWhen은 생성·병합이 끝나는 자리에서 두 모드 모두 얕게 동결한다. 소비자가 작성한 root, 중첩 값, default, React 값, 함수까지는 내려가지 않는다. hint 병합이 만든 중첩 plain object는 두 입력의 같은 키가 서로 다른 참조일 때만 병합이 끝나는 자리에서 보호한다(Q107).

- 소속 배열 27행은 기록마다 소유하며, 일반 기록, 거짓 결과 봉투, 빈 expressions, null-prototype dependencies와 함께 개발 모드에서만 동결한다(Q106). gate 원소, template, EMPTY_INDEX, 같은 노드의 같은 활성 집합 메모 참조는 유지한다. 운영 모드의 완료 구간은 staticFirstLoad 판정만 수행하고 동결을 마무리하는 순회는 없다.

- 속도 비용: 공개 schema 완료는 고정 필드 7개와 생성 clause 수에 비례하고, hint 보호는 새로 병합한 객체의 키 수에 비례한다. 소유 복사는 복사하는 원소 수에 비례하며, 내부 동결 비용은 개발 모드에서만 더해진다. 메모리 비용: 기록마다 새 소속 배열과 가상·지연 binding 복사본을 보유하고, 공개 생성 값의 소유권은 약한 색인으로 추적한다. 새 공개 옵션, 캐시 키, 노드 shape 변경은 없다. 운영 종단 시간은 HEAD와 fresh-process 판정으로 확인한다.

- 일회성 정적 정규화는 무게이트·비검증 전용 연언을 기존 전순서로 골라, 실제 노드의 형 정보를 병합기에 곧바로 전달한다. 임시 노드, 옵션별 메모·Map, 선언 ID 문자열 키는 만들지 않는다. 노드의 전체 선언과 선택된 기여가 같은 단일 노드 연언이고, 검증된 비nullable 스칼라 형이며, nullable, pattern, options, 제약 키, isAtomic, collect가 없을 때만 renderer hint를 직접 구성한다. 키 존재, 열거 순서, 프로퍼티 참조, normalized type, 동결 결과, DEFAULT_NO_ACTIVE 등록 조건은 그대로다. 그 밖의 경로는 기존 apply·finalize와 검증·진단 순서를 유지하며, oneOf에서 서로 다른 선택 결과를 합치지 않는다. 선택에는 O(선언 수) 필터와 기존 정렬, O(선택된 선언 수) 임시 배열 하나가 든다. 단일 기여를 증명하는 데는 O(1) 고정 검사를, 직접 구성에는 O(키 수) 순회를 쓰며, 범용 형 교차, 제약 순회, 최종 형 배열, 누적 상태, patterns 임시 할당은 없어진다. 새로 보유하는 색인, 캐시, 노드 필드는 없고 기존 결과 객체와 힌트 복사만 보유한다(BLUEPRINT-021, NODE-006, SETTLE-017, 101라운드 묶음 1, 102라운드 단일 기여).

- 단일 무조건 노드 선언이면서 nullable, 형 배열, pattern, 원자 판정, 진단 수집기가 없는 경우에는, 기존 정적 교차 검사의 정규화 결과를 기본 런타임 메모에 미리 둔다. 선언을 고르고 병합하는 의미는 유지하며, 활성 ID 목록이 달라도 같은 무조건 집합이면 같은 참조를 돌려준다. 그 밖의 선언·정책과 호출자 메모는 기존 병합을 사용한다. 노드당 고정 자격 검사만 추가하고, 기존의 런타임 재병합과 그 임시 배열·누적 상태는 없앤다. 기존 약한 캐시가 정적 결과를 보유하므로 별도 색인이나 공개 노드 필드는 없으며, 미리 보유하는 양은 O(적격 노드 수)다(BLUEPRINT-021, NODE-006, SETTLE-017, 100라운드).

- 파생 수렴 증명은 첫 실제 파생 쓰기 라운드에서, 모든 선언, 식, watch, injectTo 원천, gate 읽기를 포함해 정적 대상마다 한 번 계산한다. 쓰기가 없는 생성·마운트에서는 증명을 수집하거나 등록하지 않는다. 비활성 선언도 제외하지 않으며 조상·자손 양방향 교차를 사용한다. 불완전한 식, 맥락·전체 호스트 읽기, 발생별 재귀·배열 경로는 폼 전체 fallback이며, 이 결과도 청사진에 메모한다. 단순 리터럴·경로·연산자 식만 읽기가 완전함을 증명하고, 컨테이너와 가상 쓰기는 보수적으로 제외한다. 첫 쓰기는 O(선언+읽기+대상×읽기) 작업과 임시 색인을 부담하고, 이후의 쓰기와 같은 청사진의 두 번째 폼은 O(1) 약한 캐시 조회를 사용한다. 약한 sidecar는 청사진당 한 항목과 O(대상 수)의 경로 참조를 보유하며, 기존 O(식 수) 완전성 등록은 유지한다. 파생이 없는 폼은 증명을 수집·등록·할당하지 않고 반환한다. 정적 오류, 경고, 식 컴파일은 생성 시점 그대로이며, 값 평가나 노드·식 descriptor shape 추가는 없다(98C-01, 99라운드).

- 정적 첫 로드 자격은 기존 branchless 증명을 재사용하고, 선언 수집과 재귀 형상 분석에 추가 증거를 결합해 정한다. public Blueprint 형을 넓히지 않는 약한 sidecar에 boolean 하나를 보유한다. `controls.default`, 전이, 식, 가상, 재귀, 컨테이너 whole-value는 자격 밖이다. 게이트 판정을 다시 만들지 않고, 첫 로드 때 전체 스키마를 다시 훑지도 않는다. 수집마다 고정 검사를, 청사진마다 O(1)의 보유 메모리를 더하며 정적 검증과 경고는 유지한다(89C-02·04).

- 89C-03에 따라 분기가 없다는 것은, 선언 수집이 실제로 도달한 모든 작성 위치에 `oneOf`, `anyOf`, `if`, discriminator, `controls.active`가 없다는 증명이다. 참조 대상, 무게이트 allOf, items, prefixItems, 옛 additionalItems, 인라인 자식, 가상 선언을 같은 수집 과정에서 판정한다. 터미널 아래에서 무시되는 데이터는 기존 경고 범위대로 유지한다. BLUEPRINT-002의 선언·Fragment 그래프와, BLUEPRINT-001·012·044·030의 정적 충돌, S0–S6, 터미널 경고, 재귀 판정, 작성 순서, 판정 함수 메모는 분기 유무와 관계없이 유지한다.

- 분기 없음과, 식·watch·state·파생 규칙 없음은 각각 독립된 capability다. 기능이 없으면 expressions와 dependencies는 청사진마다 소유하고 정적 색인 EMPTY_INDEX는 불변으로 공유한다. 기능이 있으면 식 컴파일, 기능 색인, SETTLE-017 역의존 표를 유지한다. 생략하는 것은 조건 평가용 자료, 동적 선언 조합 자료, gate-host 색인, 게이트 역의존 trie, 빈 registry뿐이다. 생성 시 분석이 끝난다는 점, 청사진 캐시 키, if 게이트를 작성 위치당 한 번만 컴파일한다는 점은 유지한다. 수집 중에 capability를 결합하는 일은 O(S) 순회에 고정 검사만 더하며, 청사진당 O(1) 기록을 보유한다. 기능이 없는 경우에는 뒤이은 O(S) 분석과 O(S) 색인 할당이 없어지고, 기능이 있는 경우에는 기존 시간·메모리 차수가 유지된다. 실제 시간과 구조 수는 93라운드 짝 측정으로 기록한다.

- 원장의 BLUEPRINT, FRAGMENT, SCHEMA 영역과 관련 CONTROLS·ERROR 보충을 정본으로 삼는다. 정적 분석은 노드 생성, 값 판정, 게이트 평가를 하지 않는다.

- 의존 방향은 `blueprint < record < {종류 동작, navigation} < settle < FieldNode`이다. 청사진은 뒤쪽 fractal을 가져오지 않고, 그들이 소비할 선언, 식, 평가 자리만 제공한다.(NODE-016, SETTLE-045).

- 작성 위치별 분석은 한 번만 하며 참조 그래프는 유한하다. 객체 프로퍼티만으로 이어지는 무게이트·비터미널 순환은 오류이고, nullable은 순환을 끊지 않는다. 배열 아이템, 게이트, 터미널은 형상 확장의 경계다.

- 정적 허용 형 집합은 교집합이다. integer는 number의 부분집합이고, null은 양쪽에 모두 있을 때만 남는다. 종류를 비교할 때는 integer를 number로 접지만, schemaType에는 정수 제한을 보존한다.

- 게이트 없는 분기는 존재만 더한다. 공유 노드의 제약, 주석, 상태, options, presentation은 그 분기가 유일한 선언일 때만 기여한다. 정적 선언이 없는 이름을 서로 다른 fold의 무게이트 분기가 선언하면 오류다.

## API Contracts

- union의 런타임 식별은 schemaType에 보관한 정규화 형 집합의 fold mask로 정한다. number/integer는 같은 비트이고 null은 nullable 장식이므로 비null 집합에 비트를 더하지 않는다. 기존 schemaType으로 이 mask를 얻을 수 있어 별도 저장 필드는 없으며, 서로 다른 생성 순서와 형 나열 순서에서도 같은 fold는 같은 토큰을 쓴다(BLUEPRINT-043, 389C-02, 390C-01).

- `createDynamicFunction`, `DynamicFunction`, `getPathManager`, `PathManager`, `JSON_POINTER_PATH_REGEX`와 `BlueprintFeatureNodeIndex`, `BlueprintCacheEntry`, `EffectiveSchemaOptions`, `EffectiveSchemaMemo`, `EffectiveSchemaCacheEntry`는 blueprint 집계 index가 내보내지 않는 내부 계약이다. 내부 단위 검증은 소유 파일을 직접 읽으며, `compileBlueprintExpressions` 안의 컴파일러와 경로 관리자 프랙탈은 각자의 고유한 진입점 계약을 소유한다.

- `__tests__/blueprint.derive-convergence-lazy.test.ts`는 수렴 증명 지연 수집을 검증하므로 blueprint가 소유한다. 정규화 재사용의 병합 수와 노드 관측은 `effectiveSchema/__tests__/schema-merge.mount.test.ts`가 검증하므로 해당 자식이 소유한다. 공유 owned-inline 기준 데이터는 engine의 공용 시험 fixture에서 읽는다.

- 기능 정적 색인은 청사진 identity마다 한 번 만들어 재사용한다. 상태 키는 표준 `readOnly`와 노드 `controls.visible/readOnly/disabled`를 가진 템플릿, 그리고 조각·부모 `controls.fields`가 주소로 지정한 직접 자식 경계를 구별한다. 비활성 선언도 색인에 남겨 두어 마지막 상태 키를 기본값으로 되돌릴 수 있게 하고, 참조 템플릿과 배열 아이템은 실제 부모와 이름으로 자식 대상을 판정한다. 조각이 어느 자식을 직접 선언했는지는 engine DETAIL의 조각 소유 판정 한 벌(`getFragmentOwnerPaths`)로 정하므로, 조각이 `items`·`additionalItems`로 선언한 아이템은 `*`, `prefixItems`나 옛 튜플 `items`로 선언한 자리는 그 색인 이름으로 색인된다(CONTROLS-077, 35C-08). 감시는 유효 스키마에 `controls.watch`를 기여할 수 있는 노드·참조 에지 선언을 색인한다. 리터럴과 식은 평가하지 않으며, 색인의 메모리는 O(기능 선언 템플릿 + 직접 자식 대상 수)다(SETTLE-017, CONTROLS-045, EVENT-064, 65C-02).

- `blueprint(schema, options?)`는 작성 루트와 분석 옵션으로 청사진을 만든다. 옵션으로는 터미널 판정, 원자 판정, 진단 수집기를 주입한다. 청사진 결과는 작성 때 받은 `isAtomic`·`isTerminal`의 함수 identity를 보유하며, 덕분에 정적 분석과 런타임 병합이 같은 판정을 쓴다. 캐시를 사용하는 호출은 호출자가 소유한 캐시를 명시적으로 전달해야 하고, 같은 스키마와 같은 판정 조건이면 결과 참조를 재사용한다. 캐시 키는 작성 루트와 판정 함수 둘의 identity를 구분하는 규칙을 유지한다(REACT-003·004, 69C-04). 캐시는 진단 소비자가 나중에 붙더라도 루트당 경고를 한 번 수집할 수 있어야 한다.

- 배열 템플릿과 색인 `i`를 받는 자리 항목 보조는 `BlueprintChildEntry` 모양을 돌려준다. 이 항목은 이름 `String(i)`, 노드 `prefixItems[i] ?? item`, 호스트 경로를 갖고, 선언은 속성 항목과 같은 방식으로 다시 묶은 것이다. 선언 경로는 템플릿의 `/arr/*` 또는 `/arr/<i>`를 유지하며, 템플릿과 색인별 지연 메모로 같은 자리의 항목 참조를 재사용한다. 청사진이 없으면 `undefined`다. 이 보조는 런타임 노드를 만들지 않고 청사진 분석 결과도 바꾸지 않는다(NODE-006·052, CONTROLS-080, 35C-08, 실행 ADR D2).

- 청사진은 `PropertyDeclaration`, `SchemaFragment`와 노드별 선언, 종류, schemaType, nullable, 전략을 노출한다. schemaType은 JSON 형만 담는다. virtual 노드의 schemaType은 `undefined`이고 판별은 `kind`로 하며, 그 유효 스키마의 `type`은 내부 값 `'virtual'`이다(336라운드 3번). 형이 없는 variant의 schemaType은 추정한 `'object'` 또는 `'array'`이고, nullable은 null을 포함한 U에서 정한다. 조각은 schemaPath, 게이트 기술, 선언 문맥, 선언·제약·상속 overlay, 자식 조각을 보존한다. 게이트 기술에는 실제 평가 결과를 저장하지 않는다.

- `JSON_POINTER_PATH_REGEX`는 이름으로 공개하는 식 경로 인식 규칙이다. 식 컴파일(`compileBlueprintExpressions`)과 게이트 평가 읽기 수집(`buildNodes`)이 같은 정규식을 써서 의존 경로 해석이 갈라지지 않게 한다.

- 선언은 노드 범위와 조각 범위를 구분한다. 조각의 controls는 호스트 유효 스키마에 합치지 않고, 직계 선언 자식을 대상으로 하는 규칙으로 보존한다. 검증 전용 분기는 병합 기여에서 제외한다. 선언 문맥에서는 유일한 선언 자체만 기여하고, 그 안의 then 같은 overlay 제약은 교차하지 않는다.

- fields 항목의 active 게이트는 항목을 소유한 선언의 적용 조건을 따로 보존한다. 소유 선언이 꺼지면 항목 제어는 적용되지 않으며, 소유 게이트와 active를 단순 AND로 바꾸지 않는다. 정적 순환 검사는 fields 항목 게이트도 절단점으로 인정하고, 실제로 무한히 확장되는지는 후속 정착 계약에 따라 판정한다(BLUEPRINT-030).

- 식을 받는 제어 키 목록은 식 컴파일과 capability 수집이 한 벌(`EXPRESSION_CONTROL_KEYS`)을 공유하며, 모든 제어 키 목록은 `ControlKey`로 형 검사를 받는다. 닫힌 목록 검사의 `options` 키 목록은 제어 키가 아니며, 그 형은 공개 스키마 형에 있어서 engine이 참조하지 않는다.

- 진단은 코드, schemaPath, 세부 정보를 담는다. 진단 코드는 `errors`의 그룹 한정 값(오류는 `JSONSchemaErrorCode`, 경고는 `FormWarningCode`)이며, 청사진 전용 코드 집합은 두지 않는다. 소비자가 없으면 경고 검사를 수행하지 않고, 캐시에서 늦게 수집하는 것은 루트마다 한 번이다.

## Structure

- 자식 프랙탈은 `buildNodes`(선언과 노드 구성), `compileBlueprintExpressions`(식과 의존 컴파일), `validateShape`(유한 형상 검증), `collectBlueprintWarnings`(예약 키 경고 수집), `validateChildTargets`(자식 대상 검증), `StaticFirstLoadCapability`(첫 로드 자격 보관), `effectiveSchema`(활성 선언 병합)이다. `types/`는 공용 형을, `utils/<topic>/`는 자식이 위쪽으로 가져다 쓰는 보조와 진입점을 거쳐 바깥 소비자를 섬기는 보조(`features`, `itemEntry`)를 소유한다.

## Acceptance Criteria

### owned-inline-differential — 구현 전 HEAD와 동결 계수

- HEAD baf4cacb6의 59종 × collect 끔/켬에서 정규화 schema, 키·필드 순서, graph, 오류, 진단이 같다.

### owned-inline-counts — core mount 동결 계수

- module 초기화 상수를 제외한 core mount의 distinct 동결 수(운영/개발)는 nested 1,706/29,007, flat 502/10,523, oneOf-20 116/1,569, sample-0 5/66이며, 재동결과 primitive 호출은 0이다. oneOf-20의 다섯은 로드에서 모든 선언이 켜진 게이트 폼 간선(`common`·`kind`·`payload_0_a`·`payload_0_b`·`payload_0_c`)이 정적 선언 ID 목록(`staticIds`)을 간선마다 한 번 얼린 것이다(settle DETAIL의 완전 수용 간선, 372C-02). options 없는 choices의 생성 지점 동결을 모듈 상수로 옮겨서 없어지는 호출은 각각 1,365, 501, 5, 3이고, 기록별 소속 배열의 보호는 같다(batch2 4-default-choices).

### owned-inline-render — 렌더 중 작성된 React 값

- 설정을 로드하기 전에 NODE_ENV를 지정한 운영 프로젝트는 운영 React를 단언하고 act 없이 렌더한다. lazy inline 입력과 렌더 중 JSX label이 양쪽 React 모드에서 해소·갱신되며, 작성된 함수, props, style은 동결하지 않는다.

### branchless-proof — 도달한 모든 선언의 분기 부재

- 참조 대상, allOf, items, prefixItems, 옛 additionalItems, 인라인 자식, 가상 선언, fields 제어에 숨은 분기를 모두 보수적으로 판정한다. 사용되지 않는 정의와 터미널 아래는 기존 선언 수집 및 경고 정책을 따른다.

### branchless-equivalence — 정적 계약과 관측 동등성

- BF 픽스처와 기존 청사진 시험 스키마에서, 최적화 분석과 범용 분석의 선언, Fragment, 노드 트리, 값, 오류, 경고, 진단이 같다. S0–S6, 정적 충돌, 터미널 하위 경고, 재귀 판단, 작성 순서, 판정 함수 identity 메모의 기존 기대값은 바꾸지 않는다.

### branchless-features — 독립 기능 증명과 색인 보존

- 분기 없는 식·derive·watch·state 스키마는 각 기능 색인과 역의존 정보를 유지하며, 쓰기 후의 값, 상태, 감시가 같다. 기능 없는 청사진이 돌려주는 빈 조회 결과는 변경할 수 없고, 반복 조회해도 참조가 같다.

### type-syntax — 명시한 형과 전략

- BLUEPRINT-045 E1–E10·E28의 종류, schemaType, nullable, 전략, 오류가 일치한다. TEST-077의 명시 union과 union 입력 형 계약을 만족한다.

### type-inference — 형 없는 칸의 분기와 리터럴

- BLUEPRINT-045 E11–E17·E29·E32–E35의 합집합, 교집합, 형 없음 오류, nullable 규칙을 만족한다. E16은 BLUEPRINT-048의 object variant 호스트로 받는다.

### type-inference-round19 — 형 없는 칸의 경계 사례

- TEST-079의 다음 사례를 각각 검증한다. 게이트 분기만 있는 경우, `{object,array}` 혼합, ⊤ 분기, 참조 순환 절단과 빈 U, 분기 없는 `const`·`enum`의 단일 종류·혼합·객체 리터럴, 분기 안의 `const`(계속 오류)다.

### type-static-intersection — 정적 연언

- BLUEPRINT-045 E18–E24·E30·E31·E36–E39를 만족한다. 정적 선언 순서는 앵커 원소의 순서만 바꾸며 의미는 바꾸지 않는다.

### type-schema-type-invariant — schemaType 불변식

- TEST-077에 따라 E1–E42 중 구성되는 모든 칸과 TEST-067(b) 코퍼스 14종의 모든 청사진 노드에서, `isArray(schemaType)`이 union일 때만 참이고 배열 schemaType은 동결임을 검증한다. 노드와 배열 아이템이 같은 참조를 갖는지는 노드 엔진 단계의 몫이다.

### discriminator — 명시 판별

- 참조, allOf, 자기 active 결합, 끌어올림, null 분기, 태그 누락, 중복, 도달 불가능 진단을 검증한다. 자동 판별은 일어나지 않는다.
- `DISCRIMINATOR_MISMATCH`는 네 가지다. 키가 어느 분기에도 없음(`missing`), 분기끼리 종류가 다름(`kind`), 분기 사이에 값이 겹침(`overlap`), 같은 노드의 선언 사이에서 판별 키가 다름(`key`)이다. details는 `{ propertyName, other?, reason }`이며, `key`에서 `propertyName`은 먼저 선언된 키이고 `other`는 다른 키다(25C-12).

### gate-evaluation-location — L의 정적 계산

- `BlueprintGate.evaluationReads`는 `#`·`(/)`의 절대 루트, `/p`·`#/p`의 절대 `p`, `@` 제외, 상대 오름 횟수를 청사진 단위 사례로 검증한다. 유한한 재귀 템플릿의 동일한 게이트는 정적 목록 하나를 공유하고, 발생별 L은 정착에서 서로 다르게 계산한다(SETTLE-045, 26C-04·07).

### diagnostics — 닫힌 목록과 수집

- ERROR-164의 현행 청사진 코드마다 사례가 있고, 보충과 폐기된 코드의 제외를 반영한다. 값 모양 오류의 새 코드 INVALID_CONTROL_SHAPE(그룹, injectTo, fields, fields 항목, 판별 키 모양)와 닫힌 목록 밖 키의 UNKNOWN_GROUP_KEY를 나눠서 검증한다. 터미널 하위의 예약 키는 인라인 하위만 검사하고 참조를 따라가지 않는다.

### corpus — 원본 생성기 표본

- TEST-067(b)·TEST-079에 따라 생성기 코퍼스 14종을 수정 없이 각각 청사진으로 수용하고, 실패한 표본의 ID를 식별한다.

### array-slots — 아이템 자리

- 같은 템플릿과 색인의 자리 항목은 같은 참조이고, 선언 경로는 템플릿 경로를 유지하며, 청사진이 없는 자리에는 항목이 없다. 옛 표기에서 스키마 객체인 `additionalItems`는 꼬리 자리의 템플릿이 되고, `false`·`true`·없음은 청사진이 없는 꼬리다(NODE-009·052, WRITE-022, 35C-04·08, 36C-02).

### feature-index-item-fragment — 아이템 조각의 상태 키 색인

- 배열 호스트의 조각이 상태 키를 갖고 `items` 또는 `additionalItems`로 아이템을 선언하면 기능 색인은 그 호스트의 자식 대상에 `*`를 넣고, 같은 조각이 `prefixItems`나 옛 튜플 `items`로 선언한 자리는 색인 이름으로 넣는다(CONTROLS-077, 35C-08).

## Boundary Exemptions

### `utils/features/getFeatureNodeIndex.ts` — 기능 색인 보조 유지

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: 청사진 identity와 선언 구조에 종속된 색인 조회 보조이므로 독립 프랙탈로 분리하지 않고, 진입점을 거쳐 바깥 소비자를 섬기는 organ에 유지한다.

### `utils/features/DeriveConvergenceTargets.ts` — 수렴 증명 보조 유지

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: 청사진 전체의 선언과 식을 함께 읽는 수렴 증명의 지연 sidecar이므로 별도 계약 경계를 만들지 않고, 진입점을 거쳐 바깥 소비자를 섬기는 organ에 유지한다.

### `utils/itemEntry/getItemEntry.ts` — 아이템 자리 보조 유지

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: 이미 구성된 청사진 배열 템플릿의 지연 자리 메모만 소유하므로 독립 분석 프랙탈로 만들지 않고, 진입점을 거쳐 바깥 소비자를 섬기는 organ에 유지한다.

### `types/` — 형 칸 유지

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: `types/` 칸의 형은 이름으로 진입점에 올라 record, settle, validation, derive, behaviors, write가 쓴다. 형은 구현이 아니므로 칸에 두고 진입점이 이름으로 내보낸다.

## Verification Placement

- `__tests__/fixtures/captureOwnedInlineObservables.ts`는 부모와 `buildNodes` 테스트가 공유하는 관측 fixture이므로 최저 공통 소유자인 blueprint에 둔다. 병합은 `effectiveSchema` 진입점으로 읽는다.
- owned-inline 정책 시험은 `buildNodes`의 게이트 생성 내부를 직접 쓰므로 `buildNodes/__tests__/`에 두고, 병합은 `effectiveSchema` 진입점으로 읽는다.

## Last Updated

2026-10-13. 계약 기준: 211C-01, REACT-003·004, 69C-04, 89C-03, 98C-01, 100라운드, 101라운드 묶음 1, 102라운드 단일 기여, 103C-01·Q106·Q107, 104라운드 owned-inline. 비용 기록: 105라운드 자식 열거, 106라운드 선언 수집, 참조·controls·hint 봉투 가드와 형 목록 predicate; 정돈-2(2026-10-14). 정돈-3 blueprint 재구성(2026-10-15). 373라운드 배열 아이템 조각 층(2026-10-15, CONTROLS-077).
