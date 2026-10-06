# Blueprint contract

## Requirements

- 무게이트 자식 빠른 경로의 입력은 기존 context·gates·inherited·hostPath·fragment·role·schema·schemaPath·order 순서의 literal로 만듭니다. 실제 자식 build·binding·독립 소속 배열 생산은 그대로입니다. 속도 비용은 고정 필드 직접 읽기·쓰기이며 자식마다 base spread의 범용 키 복사를 제거합니다. 메모리 비용은 기존 부모별 base와 자식별 입력·배열·두 공개 경로를 유지하며 새 보유 자료는 없습니다(107라운드 2-child-input-literal).

- 조각 확장 키가 없는 선언은 기존 control·type 검사, capability·ID·fragment·소유자·discriminator 기록을 완료한 뒤 반환합니다. `$ref`가 문자열이 아니고 allOf·if·oneOf·anyOf가 모두 undefined인 경우에만 visiting stack 복사와 고정 fragment keyword loop를 생략하며 공개 청사진·진단·DFS 순서는 같습니다. 속도 비용은 O(1) 고정 검사로 5개 keyword 반복과 배열 모양 검사 3회를 제거합니다. 메모리 비용은 적격 호출의 visiting 복사 배열을 제거하고 기존 declaration·fragment·소속 배열은 유지하며 새 보유 색인·캐시는 없습니다. 두 모드의 59-schema differential과 105C-01 최소 크기 판정으로 확인합니다(106라운드 빈 조각).

- 선언 수집은 소유자별 ordered sink에 기존 DFS 순서로 한 번씩 추가합니다. ID 예약·fragment 연결·capability·게이트·정적 검사는 기존 방문 위치를 유지하며 가상 노드는 수집 함수가 반환한 별도 배열을 소유합니다. 속도 비용은 O(선언 수) 추가이며 재귀 반환 flatten과 build 입력별 재복사를 제거합니다. 메모리 비용은 노드별 기존 집계 배열과 가상 소유 배열을 유지하고 재귀·일반 입력별 중간 결과 배열만 제거합니다. 기록 간 소속 배열 공유·새 보유 색인·캐시·노드 필드는 없고 실제 종단 시간은 105C-01 판정으로 확인합니다(106라운드 선언 수집).

- 단일 무게이트 연언 object는 properties의 eager `Object.entries` 스냅샷을 기존 순서로 직접 자식 build에 전달합니다. children 제어 항목이 있거나 선언이 여러 개·선언 문맥·게이트 경로이면 기존 집계를 유지합니다. 기존 binding 생산·DFS·가상 자식 처리·정적 검사와 청사진의 모든 내용은 같습니다. 속도 비용은 노드당 O(1) 자격 검사와 O(자식 수) 한 순회이며 properties Map의 삽입·조회·두 번째 열거를 제거합니다. 메모리 비용은 기존 eager 스냅샷·자식 입력·binding 결과를 유지하고 적격 object당 properties Map 및 사용되지 않는 tuples Map을 만들지 않습니다. 새 보유 색인·캐시·노드 필드가 없으며 시간과 heap 바이트는 측정 대기입니다(105라운드 자식 열거).

- 내부 template tuple은 작성 위치·문맥·최초 등장 gate 순서로 한 번 구성하고 같은 조각의 외부 문자열 표현을 host-bound 키에 조합합니다. 두 Map의 실제 키 바이트·조회 순서와 공개 schema/data 경로는 유지합니다. 속도 비용은 입력·gate·소유 경로 및 문자열 길이에 비례하며 전체 tuple 문자열의 재 JSON 인코딩과 중간 tuple/host 배열을 제거합니다. 메모리 비용은 호출 중 두 키와 인코딩 조각·중복 판정 목록이며 새 보유 캐시·노드 필드는 없습니다. 종단 시간은 105C-01과 그 최소 크기 규칙으로 확인합니다(106라운드 감도 판정).

- 103C-01 owned-inline: 공개 유효 schema·schemaType와 생산자가 공개 schema 안에 만든 배열·controls·hint 봉투, 공유 gate·evaluationReads·discriminator·values·소유 appliesWhen은 생성·병합 완료 자리에서 두 모드 모두 얕게 동결합니다. 소비자가 작성한 root·중첩 값·default·React 값·함수에는 내려가지 않습니다. hint 병합이 만든 중첩 plain object는 두 입력의 같은 키와 참조가 다를 때만 병합 완료 자리에서 보호합니다(Q107).
- 소속 배열 27행은 기록마다 소유하며 일반 기록·거짓 결과 봉투·빈 expressions·null-prototype dependencies와 함께 개발에서만 동결합니다(Q106). gate 원소·template·EMPTY_INDEX·동일 노드의 동일 활성 집합 메모 참조는 유지합니다. 운영 완료 구간은 staticFirstLoad 판정만 수행하며 동결 완료 순회가 없습니다.
- 속도 비용: 공개 schema 완료는 고정 필드 7개와 생성 clause 수, hint 보호는 새 병합 객체의 키 수에 비례합니다. 소유 복사는 복사 원소 수에 비례하며 개발 모드에만 내부 동결 비용이 추가됩니다. 메모리 비용: 기록마다 새 소속 배열과 가상·지연 binding 복사본을 보유하고 공개 생성 값의 소유권은 약한 색인으로 추적합니다. 새 공개 옵션·캐시 키·노드 shape 변경은 없습니다. 운영 종단 시간은 HEAD와 fresh-process 판정으로 확인합니다.

- 일회성 정적 정규화는 무게이트·비검증 전용 연언을 기존 전순서로 선택하여 실제 노드의 형 정보를 병합기에 직접 전달합니다. 임시 노드·옵션별 메모/Map·선언 ID 문자열 키를 만들지 않습니다. 노드의 전체 선언과 선택된 기여가 같은 단일 노드 연언이고 검증된 비nullable 스칼라 형이며 nullable·pattern·options·제약 키 및 isAtomic·collect가 없을 때만 renderer hint를 직접 구성합니다. 키 존재·열거 순서·프로퍼티 참조·normalized type·동결 결과와 DEFAULT_NO_ACTIVE 등록 조건은 그대로입니다. 그 밖의 경로는 기존 apply/finalize와 검증·진단 순서를 유지하며 oneOf의 서로 다른 선택 결과를 합치지 않습니다. 선택은 O(선언 수) 필터와 기존 정렬, O(선택 선언 수) 임시 배열 하나입니다. 단일 기여 증명에는 O(1) 고정 검사, 직접 구성에는 O(키 수) 순회를 사용하며 범용 형 교차·제약 순회·최종 형 배열과 누적 상태·patterns 임시 할당을 제거합니다. 새 보유 색인·캐시·노드 필드는 없고 기존 결과 객체·힌트 복사만 보유합니다(BLUEPRINT-021, NODE-006, SETTLE-017, 101라운드 묶음 1, 102라운드 단일 기여).

- 단일 무조건 노드 선언이며 nullable·형 배열·pattern·원자 판정·진단 수집기가 없는 경우, 기존 정적 교차 검사의 정규화 결과를 기본 런타임 메모에 미리 둡니다. 선언 선택과 병합의 의미는 유지하며 활성 ID 목록이 달라도 같은 무조건 집합은 같은 참조입니다. 그 밖의 선언·정책과 호출자 메모는 기존 병합을 사용합니다. 노드당 고정 자격 검사만 추가하고 기존 런타임 재병합 및 그 임시 배열·누적 상태를 제거합니다. 기존 약한 캐시가 정적 결과를 보유하므로 별도 색인이나 공개 노드 필드는 없으며, 조기 보유는 O(적격 노드 수)입니다(BLUEPRINT-021, NODE-006, SETTLE-017, 100라운드).

- 파생 수렴 증명은 첫 실제 파생 쓰기 라운드에서 모든 선언·식·watch·injectTo 원천·gate 읽기를 포함해 정적 대상마다 한 번 계산합니다. 쓰기 없는 생성·마운트에서는 증명을 수집하거나 등록하지 않습니다. 비활성 선언도 제외하지 않으며 조상·자손 양방향 교차를 사용합니다. 불완전 식·맥락/전체 호스트 읽기·발생별 재귀/배열 경로는 폼 전체 fallback이며 이 결과도 청사진에 메모합니다. 단순 리터럴·경로·연산자 식만 읽기 완전성을 증명하고 컨테이너·가상 쓰기는 보수적으로 제외합니다. 첫 쓰기는 O(선언+읽기+대상×읽기) 작업·임시 색인을 부담하고, 이후 쓰기와 같은 청사진의 두 번째 폼은 O(1) 약한 캐시 조회를 사용합니다. 약한 sidecar는 청사진당 한 항목과 O(대상 수) 경로 참조를 보유하며 기존 O(식 수) 완전성 등록은 유지합니다. 파생 없는 폼은 증명 수집·등록·할당 없이 반환합니다. 정적 오류·경고·식 컴파일은 생성 시점 그대로이며 값 평가·노드 및 식 descriptor shape 추가는 없습니다(98C-01, 99라운드).

- 정적 첫 로드 자격은 기존 branchless 증명을 재사용하고 선언 수집과 재귀 형상 분석에 추가 증거를 결합합니다. public Blueprint 형을 넓히지 않는 약한 sidecar에 boolean 하나를 보유합니다. `controls.default`·전이·식·가상·재귀·컨테이너 whole-value는 자격 밖입니다. 게이트 판정을 다시 만들거나 첫 로드 때 전체 스키마를 다시 훑지 않습니다. 수집마다 고정 검사와 청사진당 O(1) 보유 메모리를 더하며 정적 검증·경고는 유지합니다(89C-02·04).

- 89C-03에 따라 분기 없음은 선언 수집이 실제 도달한 모든 작성 위치에서 `oneOf`·`anyOf`·`if`·discriminator·`controls.active`가 없다는 증명입니다. 참조 대상, 무게이트 allOf, items·prefixItems·옛 additionalItems, 인라인 자식 및 가상 선언을 같은 수집 과정에서 판정합니다. 터미널 아래 무시되는 데이터는 기존 경고 범위대로 유지합니다. BLUEPRINT-002의 선언·Fragment 그래프, BLUEPRINT-001·012·044·030의 정적 충돌·S0–S6·터미널 경고·재귀 판정·작성 순서·판정 함수 메모는 분기 유무와 무관하게 유지합니다.
- 분기 없음과 식·watch·state·파생 규칙 없음은 각각 독립된 capability입니다. 기능이 없으면 expressions·dependencies는 청사진마다 소유하고 정적 색인 EMPTY_INDEX는 불변 공유하며, 기능이 있으면 식 컴파일·기능 색인·SETTLE-017 역의존 표를 유지합니다. 조건 평가용 자료·동적 선언 조합 자료·gate-host 색인·게이트 역의존 trie·빈 registry만 생략합니다. 생성 시 분석 완료, 청사진 캐시 키와 if 게이트의 작성 위치당 단일 컴파일은 유지합니다. 수집 중 capability 결합은 O(S) 순회에 고정 검사만 더하고 청사진당 O(1) 기록을 보유합니다. 기능 없는 경우 후속 O(S) 분석과 O(S) 색인 할당을 제거하며, 기능 있는 경우 기존 시간·메모리 차수는 유지합니다. 실제 시간과 구조 수는 93라운드 짝 측정으로 기록합니다.

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

- 기능 정적 색인은 청사진 identity마다 한 번 만들고 재사용합니다. 상태 키는 표준 `readOnly`와 노드 `controls.visible/readOnly/disabled`를 가진 템플릿 및 조각·부모 `controls.children`이 주소 지정한 직접 자식 경계를 구별합니다. 비활성 선언도 색인에 남겨 마지막 상태 키를 기본값으로 되돌릴 수 있고, 참조 템플릿·배열 아이템은 실제 부모와 이름으로 자식 대상을 판정합니다. 감시는 유효 스키마에 `controls.watch`를 기여할 수 있는 노드/참조 에지 선언을 색인합니다. 리터럴·식은 평가하지 않으며 색인의 메모리는 O(기능 선언 템플릿 + 직접 자식 대상 수)입니다(SETTLE-017, CONTROLS-045, EVENT-064, 65C-02).

- `blueprint(schema, options?)`는 작성 루트와 분석 옵션으로 청사진을 만듭니다. 옵션은 터미널 판정·원자 판정·진단 수집기를 주입합니다. 청사진 결과는 작성 때 받은 `isAtomic`·`isTerminal`의 함수 identity를 보유하여 정적 분석과 런타임 병합이 같은 판정을 사용하게 합니다. 캐시를 사용하는 호출은 호출자가 소유한 캐시를 명시적으로 전달하고, 동일 스키마와 동일 판정 조건에서 결과 참조를 재사용합니다. 캐시 키는 작성 루트와 판정 함수 둘의 identity를 구분하는 규칙을 유지합니다(REACT-003·004, 69C-04). 캐시는 진단 소비자가 나중에 붙어도 루트당 경고를 한 번 수집할 수 있어야 합니다.
- 진입점이 이름으로 내보내는 `resolveArrayLimits`는 유효 스키마의 `schema`를 받아 `{ min, max }`를 돌려줍니다. `min`은 `minItems ?? 0`, `max`는 `maxItems ?? Infinity`와 닫힌 튜플의 `prefixItems.length` 중 작은 값입니다. 닫힌 튜플은 `prefixItems`가 배열이고 `items`가 없거나 `false`인 경우이며, 조각이 준 길이 제약도 유효 스키마를 통해 셉니다. 코어는 이 한계까지 채우거나 초과 쓰기를 막지 않고, 이름 수출의 의도한 소비자는 07·08단계 렌더 계층의 입력 구성 요소입니다. 레거시는 자기 사본을 유지합니다(NODE-009, WRITE-022, LANDING-085·094·159, 35C-04).
- 배열 템플릿과 색인 `i`를 받는 자리 항목 보조는 이름 `String(i)`, 노드 `prefixItems[i] ?? item`, 호스트 경로 및 속성 항목과 같은 방식으로 다시 묶은 선언을 가진 `BlueprintChildEntry` 모양을 돌려줍니다. 선언 경로는 템플릿의 `/arr/*` 또는 `/arr/<i>`를 유지하고, 템플릿·색인별 지연 메모로 같은 자리의 항목 참조를 재사용하며, 청사진이 없으면 `undefined`입니다. 이 보조는 런타임 노드를 만들거나 청사진 분석 결과를 바꾸지 않습니다(NODE-006·052, CONTROLS-080, 35C-08, 실행 ADR D2).
- 옛 표기 `items: [...]`는 자리별 `prefixItems` 템플릿으로 컴파일하고, 같은 선언의 `additionalItems`가 스키마 객체이면 그 꼬리 자리의 아이템 템플릿(`item`)으로 컴파일합니다. `additionalItems`가 `false`·`true`이거나 없으면 꼬리는 청사진 없는 자리이며, 꼬리가 닫혔는가는 검증기의 판단이라 청사진은 모형으로 두지 않습니다. 기존 `items` 튜플 컴파일과 그 시험은 그대로입니다(NODE-052, SCHEMA-001, 36C-02).
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

### owned-inline-public — 생성 지점 공개·공유 값 보호

- 정적·runtime 유효 schema, 공개 값 11종과 공유 gate 내부가 두 모드에서 동결되고 입력은 원래 참조와 동결 상태를 유지합니다. hint style 병합은 결과만 보호하며 작성된 React 값·함수의 참조와 상태를 유지합니다.

### owned-inline-memberships — 기록별 소유와 개발 보호

- 59종·가상·재바인딩·validationOnly·children-control·discriminator·compiled expression·지연 slot에서 두 기록이 소속 배열을 공유하지 않습니다. 내부 기록은 개발에서만 동결하고 appliesWhen은 두 모드에서 보호합니다. EMPTY_INDEX 공유와 node-local memo를 유지합니다.

### owned-inline-differential — 구현 전 HEAD와 동결 계수

- HEAD baf4cacb6의 59종 × collect 끔/켬에서 정규화 schema·키/필드 순서·graph·오류·진단이 같습니다.

### owned-inline-counts — core mount 동결 계수

- module 초기화 상수를 제외한 core mount distinct 동결 수(운영/개발)는 nested 3,071/30,372, flat 1,003/11,024, oneOf-20 116/1,569, sample-0 8/69이며 재동결·primitive 호출은 0입니다.

### owned-inline-render — 렌더 중 작성된 React 값

- NODE_ENV를 설정 로드 전에 지정한 운영 프로젝트는 운영 React를 단언하고 act 없이 렌더합니다. lazy inline 입력·렌더 중 JSX label이 양쪽 React 모드에서 해소·갱신되며 작성된 함수·props·style은 동결하지 않습니다.

### branchless-proof — 도달한 모든 선언의 분기 부재

- 참조 대상·allOf·items·prefixItems·옛 additionalItems·인라인 자식·가상 선언 및 children 제어에 숨은 분기를 모두 보수적으로 판정합니다. 미사용 정의와 터미널 아래는 기존 선언 수집 및 경고 정책을 따릅니다.

### branchless-equivalence — 정적 계약과 관측 동등성

- BF 픽스처와 기존 청사진 시험 스키마에서 최적화 분석과 범용 분석의 선언·Fragment·노드 트리·값·오류·경고·진단이 같습니다. S0–S6, 정적 충돌, 터미널 하위 경고, 재귀 판단, 작성 순서 및 판정 함수 identity 메모의 기존 기대값은 바꾸지 않습니다.

### branchless-features — 독립 기능 증명과 색인 보존

- 분기 없는 식·derive·watch·state 스키마는 각 기능 색인과 역의존 정보를 유지하며 쓰기 후 값·상태·감시가 같습니다. 기능 없는 청사진의 빈 조회 결과는 변경할 수 없고 반복 조회 참조가 같습니다.

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

- TEST-077에 따라 E1–E42 중 구성되는 모든 칸과 TEST-067(b) 코퍼스 14종의 모든 청사진 노드에서 `isArray(schemaType)`은 union일 때만 참이고 배열 schemaType은 동결임을 검증합니다. 노드와 배열 아이템의 같은 참조는 노드 엔진 단계의 몫입니다.

### fragment-declarations — 조각과 공유

- 선언·연언 문맥, 모든 키워드 전순서, 노드 공유, 상속 overlay 귀속과 가상 fields 순서 일치를 검증합니다.

### discriminator — 명시 판별

- 참조·allOf·자기 active 결합·끌어올림·null 분기·태그 누락·중복·도달 불가능 진단을 검증합니다. 자동 판별은 발생하지 않습니다.
- `DISCRIMINATOR_MISMATCH`는 넷입니다: 키가 어느 분기에도 없음(`missing`), 분기끼리 종류가 다름(`kind`), 분기 사이 값이 겹침(`overlap`), 같은 노드의 선언 사이 판별 키가 다름(`key`). details는 `{ propertyName, other?, reason }`이며 `key`에서 `propertyName`은 먼저 선언된 키, `other`는 다른 키입니다(25C-12).

### effective-schema — 병합과 참조

- SCHEMA 병합표와 정적 오류·런타임 공집합 표현, pattern 보존, 불변성·동일 활성 집합 참조를 검증합니다.

### unconditional-effective-schema — 무조건 선언의 정규화 재사용

- 빠른 경로는 기존 병합과 같은 유효 스키마·불변성과 참조를 보존합니다. 형 교차·nullable·pattern·원자 판정·수집기·선언 전순서가 필요한 경우는 기존 병합으로 처리하며 경고의 내용과 순서를 유지합니다.
- 일회성 정적 정규화도 같은 선택 순서와 병합 정책을 사용하며, 59개 HEAD 스키마 및 89C-03 차등의 정적 오류·경고·필드와 공개 schema의 동결을 보존합니다.
- 증명된 단일 정적 기여의 직접 구성은 모든 노드의 HEAD 유효 스키마와 키 순서가 같으며 범용 제약 순회 횟수만 줄입니다. invalid·multiple·gated·collect·isAtomic 경로의 검증·진단 및 기존 메모 참조 조건은 유지합니다.

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

### array-limits-and-slots — 길이 한계와 아이템 자리

- 유효 스키마 조각의 길이 제약과 닫힌 튜플의 상한을 합쳐 `{ min, max }`를 돌려주며 core의 값 쓰기는 그 한계를 강제하지 않습니다. 같은 템플릿·색인의 자리 항목은 같은 참조이고, 선언 경로는 템플릿 경로를 유지하며 청사진 없는 자리에는 항목이 없습니다. 옛 표기의 스키마 객체 `additionalItems`는 꼬리 자리의 템플릿이 되고 `false`·`true`·없음은 청사진 없는 꼬리입니다(NODE-009·052, WRITE-022, 35C-04·08, 36C-02).

## Boundary Exemptions

### `utils/expressions` — shared compiler during migration

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: The compiler belongs to schema analysis. The legacy computed-property engine consumes named compiler exports until the runtime entry point switches; duplicating it would permit the two engines to accept different expression languages.

## Last Updated

2026-10-07. 계약 기준: REACT-003·004, 69C-04, 89C-03, 98C-01, 100라운드, 101라운드 묶음 1, 102라운드 단일 기여, 103C-01·Q106·Q107, 104라운드 owned-inline. 비용 기록: 105라운드 자식 열거, 106라운드 선언 수집.
