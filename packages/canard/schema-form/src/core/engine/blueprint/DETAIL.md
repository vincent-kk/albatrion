# Blueprint contract

## Requirements

- 형 목록은 기존의 some·indexOf 검사에 predicate를 붙여 검증과 iterator 복사를 분리하며, 희소 배열, getter·iterator 읽기, 오류는 그대로 유지한다. 가드 호출 하나를 빼면 새 순회, 결과 배열, 보유 자료는 없다. 가상 필드 entry와 인라인 종단 경고의 map형 자식은 검증을 거치기 전의 작성 값이므로, 이유를 적은 형 단언으로 읽는다. 여기에 가드를 두면 지금 받아들이는 값(함수, 상속 필드를 가진 원시값)이 달라지기 때문이다.

- 참조 조회 결과와 controls 봉투는 단언 없는 가드로 걸러, 기존에 받아들이던 boolean·비null 객체 집합과 비null 객체 집합을 좁힌다. controls의 watch·default를 직접 읽는 순서와 횟수, 소유 등록, 단일 정적 기여의 키 순서는 유지한다. 새로 만든 hint 병합 객체의 root와 재귀 순회에 진입할 때 봉투 가드를 호출하며, 빌린 참조와 동결 정책은 유지한다. 속도 비용은 참조 조회, controls 기여, 생성 hint 순회마다 고정된 가드 호출이며 새 캐시, 색인, 보유 객체는 없다. 일반 갱신에서는 유효 스키마 메모가 빗나간 controls·hint 병합 경로에만 적용된다.

- 내부에서 누적하는 스키마의 소유 배열과 제어 필드는 선언부에서 형을 정한다. 생성 중인 자식 소속 배열은 가변이고, 공개 청사진에서는 읽기 전용이다. 공개 호스트의 종단 판정과, 청사진의 불리언 스키마를 포함하는 판정 입력 사이에서 생기는 형 차이는 소유자 승인 대기 목록에 기록한다. 형 정비는 생성 순서, 검사, 동결, 소유권 색인, 런타임 비용을 바꾸지 않으며, core와 React 기준 번들의 바이트가 동일한지로 확인한다(G27 B1).

- 선언 수집에서 packed gates/order를 복사할 때는 native slice를 사용한다. fragment와 declaration의 배열은 계속 각자 소유하고, 값, 순서, ID, DFS, 진단, capability는 같다. 속도 비용은 같은 원소 수에 비례하는 native 복사이며, 입력과 fragment를 iterator로 순회하던 일은 없어진다. 메모리 비용은 호출마다 기존의 네 배열과 원소 참조 수를 그대로 유지하고, 추가로 보유하는 자료는 없다(batch2 2-declaration-slice).

- 자식 이름의 escapeSegment는 이름마다 한 번 만든 값을 schemaPath와 data path에 재사용한다. 무게이트 경로는 지역 문자열 하나를 사용하고, 일반 집계는 기존 properties Map의 값에 escapedName, path, inputs를 같은 필드 순서로 보관한다. 공개 두 경로, template key의 바이트, 자식·기여·게이트 순서는 같다. 속도 비용은 이름 길이에 비례하는 escape 한 번이며, 반복되는 기여와 뒤쪽 build 순회에서 다시 escape하던 일이 없어진다. 메모리 비용은 빠른 경로에서 지역 문자열 하나, 일반 경로에서 이름마다 일시 기록 하나와 문자열 참조다. 소속 배열의 소유와 동결은 유지하며, 새로 보유하는 색인, 캐시, 공개 필드는 없다(107라운드 3-path-strings).

- 무게이트 자식 빠른 경로의 입력은 기존 순서인 context, gates, inherited, hostPath, fragment, role, schema, schemaPath, order의 literal로 만든다. 실제 자식 build, binding, 독립된 소속 배열 생산은 그대로다. 속도 비용은 고정 필드를 직접 읽고 쓰는 것이며, 자식마다 base spread로 범용 키를 복사하던 일이 없어진다. 메모리 비용은 기존의 부모별 base, 자식별 입력·배열, 공개 경로 두 개를 유지하며 새로 보유하는 자료는 없다(107라운드 2-child-input-literal).

- 조각 확장 키가 없는 선언은 기존의 control·type 검사와 capability, ID, fragment, 소유자, discriminator 기록을 마친 뒤 반환한다. `$ref`가 문자열이 아니고 allOf, if, oneOf, anyOf가 모두 undefined인 경우에만 visiting stack 복사와 고정 fragment keyword loop를 생략하며, 공개 청사진, 진단, DFS 순서는 같다. 속도 비용은 O(1) 고정 검사이며, 5개 keyword 반복과 배열 모양 검사 3회가 없어진다. 메모리 비용은 적격 호출에서 visiting 복사 배열이 없어지는 것이고, 기존 declaration, fragment, 소속 배열은 유지하며 새로 보유하는 색인이나 캐시는 없다. 두 모드의 59-schema differential과 105C-01 최소 크기 판정으로 확인한다(106라운드 빈 조각).

- 선언 수집은 소유자별 ordered sink에 기존 DFS 순서대로 한 번씩 추가한다. ID 예약, fragment 연결, capability, 게이트, 정적 검사는 기존에 방문하던 위치를 유지하고, 가상 노드는 수집 함수가 반환한 별도 배열을 소유한다. 속도 비용은 O(선언 수) 추가이며, 재귀 반환을 flatten하던 일과 build 입력마다 다시 복사하던 일이 없어진다. 메모리 비용은 노드별 기존 집계 배열과 가상 소유 배열을 유지하되, 재귀와 일반 입력마다 만들던 중간 결과 배열만 없앤다. 기록끼리 소속 배열을 공유하지 않고, 새로 보유하는 색인, 캐시, 노드 필드도 없다. 실제 종단 시간은 105C-01 판정으로 확인한다(106라운드 선언 수집).

- 단일 무게이트 연언 object는 properties의 eager `Object.entries` 스냅샷을 기존 순서 그대로 자식 build에 직접 전달한다. fields 제어 항목이 있거나, 선언이 여러 개이거나, 선언 문맥 또는 게이트 경로이면 기존 집계를 유지한다. 기존 binding 생산, DFS, 가상 자식 처리, 정적 검사와 청사진의 모든 내용은 같다. 속도 비용은 노드당 O(1) 자격 검사와 O(자식 수) 순회 한 번이며, properties Map에 넣고 조회하던 일과 두 번째 열거가 없어진다. 메모리 비용은 기존의 eager 스냅샷, 자식 입력, binding 결과를 유지하고, 적격 object에서는 properties Map과 쓰이지 않는 tuples Map을 만들지 않는다. 새로 보유하는 색인, 캐시, 노드 필드는 없으며 시간과 heap 바이트는 측정을 기다리는 중이다(105라운드 자식 열거).

- 분석 문맥은 선언마다 그 선언이 수집된 구성 입력의 인덱스(`declarationInputs`)를 기록한다. 재귀에 적중해 템플릿을 다시 쓰는 연결이 가리키는 입력의 게이트를 선언별로 찾기 위해서다(211C-01). 내부 template tuple은 작성 위치, 문맥, 최초로 나타난 gate 순서로 한 번 구성하고, 같은 조각의 외부 문자열 표현을 host-bound 키에 조합한다. 두 Map의 실제 키 바이트, 조회 순서, 공개 schema·data 경로는 유지한다. 속도 비용은 입력, gate, 소유 경로, 문자열 길이에 비례하며, 전체 tuple 문자열을 다시 JSON으로 인코딩하던 일과 중간 tuple·host 배열이 없어진다. 메모리 비용은 호출 중에 쓰는 키 두 개, 인코딩 조각, 중복 판정 목록이며 새로 보유하는 캐시나 노드 필드는 없다. 종단 시간은 105C-01과 그 최소 크기 규칙으로 확인한다(106라운드 감도 판정).

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
- 의존 방향은 `blueprint < record < {종류 동작, navigation} < settle < FieldNode`이다. 청사진은 뒤쪽 fractal을 가져오지 않고, 그들이 소비할 선언, 식, 평가 자리만 제공한다. 식 컴파일러 organ의 기존 경계 예외는 아래에 둔다(NODE-016, SETTLE-045).
- 작성 위치별 분석은 한 번만 하며 참조 그래프는 유한하다. 객체 프로퍼티만으로 이어지는 무게이트·비터미널 순환은 오류이고, nullable은 순환을 끊지 않는다. 배열 아이템, 게이트, 터미널은 형상 확장의 경계다.
- 조각 순서는 properties, allOf, if/then/else, oneOf, anyOf이며, 배열 인덱스와 중첩 경로로 전순서를 정한다. 조각 문맥은 연언과 선언을 구별하고, 상속 overlay가 어느 호스트에 속하는지를 보존한다.
- 정적 허용 형 집합은 교집합이다. integer는 number의 부분집합이고, null은 양쪽에 모두 있을 때만 남는다. 종류를 비교할 때는 integer를 number로 접지만, schemaType에는 정수 제한을 보존한다.
- 형이 없는 칸은 BLUEPRINT-048·050·051에 따라 먼저 게이트 없는 oneOf·anyOf의 허용 집합을 합친다. 두 키워드가 함께 있으면 둘을 교차한 U에서 null을 뗀 F로 종류를 정한다. F가 `{object}`나 `{array}`이면 variant 호스트이고, 다른 종류와 섞이면 오류다. 게이트 분기는 U에서 제외하며, 재귀 분기와 참조는 현재 경로에 다시 들어오는 지점에서 절단한다. 분기 없는 `const`·`enum` 칸은 단일 JSON 종류의 원시 리터럴 잎이고, 분기 안의 리터럴 전용 칸은 여전히 ⊤이다. union은 터미널이며, 가상 노드를 포함한 종류는 여덟 가지다.
- 게이트 없는 분기는 존재만 더한다. 공유 노드의 제약, 주석, 상태, options, presentation은 그 분기가 유일한 선언일 때만 기여한다. 정적 선언이 없는 이름을 서로 다른 fold의 무게이트 분기가 선언하면 오류다.
- 명시된 discriminator만 정적 const·enum을 읽는다. 정적 allOf와 참조를 따라 태그를 교차하고, 끌어올린 선언과 자기 active의 결합을 보존하며, 작성 스키마는 바꾸지 않는다.
- controls, options, fields 항목에 허용하는 키는 닫힌 목록이다. controls의 두 목록은 `core/engine/types/controls.ts`의 `SchemaControls`·`ChildSchemaControls`와 형으로 묶여 있어서, 어느 쪽이 어긋나도 형 검사가 실패한다. 닫힌 목록 밖의 키는 UNKNOWN_GROUP_KEY, 목록 안 키의 값 모양이 틀리면 INVALID_CONTROL_SHAPE다. injectTo는 함수만 허용하며 정적 대상 분석은 하지 않는다. presentation은 불투명한 병합 데이터로만 취급한다.

## API Contracts

- `stripSchema`, `createDynamicFunction`, `DynamicFunction`, `getPathManager`, `PathManager`, `JSON_POINTER_PATH_REGEX`와 `BlueprintFeatureNodeIndex`, `BlueprintCacheEntry`, `EffectiveSchemaOptions`, `EffectiveSchemaMemo`, `EffectiveSchemaCacheEntry`는 blueprint 집계 index가 내보내지 않는 내부 계약이다. 내부 단위 검증은 소유 파일을 직접 읽으며, 컴파일러와 경로 관리자 자식 fractal의 고유한 진입점 계약은 각 자식이 소유한다.
- `__tests__/blueprint.derive-convergence-lazy.test.ts`는 수렴 증명을 지연 수집하는지를, `__tests__/schema-merge.mount.test.ts`는 정규화 재사용의 병합 수와 노드 관측을 검증하므로 blueprint가 소유한다. 공유 owned-inline 기준 데이터는 engine의 공용 시험 fixture에서 읽는다.

- 기능 정적 색인은 청사진 identity마다 한 번 만들어 재사용한다. 상태 키는 표준 `readOnly`와 노드 `controls.visible/readOnly/disabled`를 가진 템플릿, 그리고 조각·부모 `controls.fields`가 주소로 지정한 직접 자식 경계를 구별한다. 비활성 선언도 색인에 남겨 두어 마지막 상태 키를 기본값으로 되돌릴 수 있게 하고, 참조 템플릿과 배열 아이템은 실제 부모와 이름으로 자식 대상을 판정한다. 감시는 유효 스키마에 `controls.watch`를 기여할 수 있는 노드·참조 에지 선언을 색인한다. 리터럴과 식은 평가하지 않으며, 색인의 메모리는 O(기능 선언 템플릿 + 직접 자식 대상 수)다(SETTLE-017, CONTROLS-045, EVENT-064, 65C-02).

- `blueprint(schema, options?)`는 작성 루트와 분석 옵션으로 청사진을 만든다. 옵션으로는 터미널 판정, 원자 판정, 진단 수집기를 주입한다. 청사진 결과는 작성 때 받은 `isAtomic`·`isTerminal`의 함수 identity를 보유하며, 덕분에 정적 분석과 런타임 병합이 같은 판정을 쓴다. 캐시를 사용하는 호출은 호출자가 소유한 캐시를 명시적으로 전달해야 하고, 같은 스키마와 같은 판정 조건이면 결과 참조를 재사용한다. 캐시 키는 작성 루트와 판정 함수 둘의 identity를 구분하는 규칙을 유지한다(REACT-003·004, 69C-04). 캐시는 진단 소비자가 나중에 붙더라도 루트당 경고를 한 번 수집할 수 있어야 한다.
- 내부 `resolveArrayLimits`는 유효 스키마의 `schema`를 받아 `{ min, max }`를 돌려주며, blueprint index가 내보내지 않는다. `min`은 `minItems ?? 0`이고, `max`는 `maxItems ?? Infinity`와 닫힌 튜플의 `prefixItems.length` 중 작은 값이다. 닫힌 튜플이란 `prefixItems`가 배열이고 `items`가 없거나 `false`인 경우다. 조각이 준 길이 제약도 유효 스키마를 통해 센다. 코어는 이 한계까지 채우거나 초과 쓰기를 막지 않는다. 레거시는 자기 사본을 유지한다(NODE-009, WRITE-022, LANDING-085·094·159, 35C-04).
- 배열 템플릿과 색인 `i`를 받는 자리 항목 보조는 `BlueprintChildEntry` 모양을 돌려준다. 이 항목은 이름 `String(i)`, 노드 `prefixItems[i] ?? item`, 호스트 경로를 갖고, 선언은 속성 항목과 같은 방식으로 다시 묶은 것이다. 선언 경로는 템플릿의 `/arr/*` 또는 `/arr/<i>`를 유지하며, 템플릿과 색인별 지연 메모로 같은 자리의 항목 참조를 재사용한다. 청사진이 없으면 `undefined`다. 이 보조는 런타임 노드를 만들지 않고 청사진 분석 결과도 바꾸지 않는다(NODE-006·052, CONTROLS-080, 35C-08, 실행 ADR D2).
- 옛 표기 `items: [...]`는 자리별 `prefixItems` 템플릿으로 컴파일한다. 같은 선언의 `additionalItems`가 스키마 객체이면 그 꼬리 자리의 아이템 템플릿(`item`)으로 컴파일한다. `additionalItems`가 `false`나 `true`이거나 없으면 꼬리는 청사진이 없는 자리다. 꼬리가 닫혔는지는 검증기가 판단할 일이라 청사진은 모형으로 두지 않는다. 기존 `items` 튜플 컴파일과 그 시험은 그대로다(NODE-052, SCHEMA-001, 36C-02).
- 청사진은 `PropertyDeclaration`, `SchemaFragment`와 노드별 선언, 종류, schemaType, nullable, 전략을 노출한다. 형이 없는 variant의 schemaType은 추정한 `'object'` 또는 `'array'`이고, nullable은 null을 포함한 U에서 정한다. 조각은 schemaPath, 게이트 기술, 선언 문맥, 선언·제약·상속 overlay, 자식 조각을 보존한다. 게이트 기술에는 실제 평가 결과를 저장하지 않는다.
- 자식 연결은 이름, 참조 템플릿, 해당 호스트의 선언과 게이트를 보존한다. 같은 참조 대상이라도 호스트별 덧씌움이나 선언 문맥이 다르면 유효 스키마의 선언 집합을 공유하지 않는다. 재귀 참조는 분석 중인 템플릿을 다시 가리키게 해서 유한하게 유지하며, 최초 방문 경로를 이후 연결의 호스트 경로로 잘못 쓰지 않는다. 재귀에 적중해 구성 중인 템플릿을 다시 가리키는 연결의 게이트는, 가리키는 입력의 게이트 뒤에 템플릿 자신의 선언 게이트를 새 경로로 다시 묶은 목록이다. 첫 방문의 절대 호스트 경로는 물려받지 않는다(FRAGMENT-003·009, 211C-01).
- 유효 스키마 병합은 활성 선언을 전순서로 받아 결과 기록 `EffectiveSchema { schema, typeConflict }`를 돌려준다. 정적 모드에서 둘 이상의 기여를 교차한 결과가 공집합이면 경로가 있는 JSONSchemaError다. 선언 하나 안에서 범위가 뒤집힌 경우와 리터럴 `enum: []`은 검증기 몫이므로 그대로 둔다. 런타임에서 enum·const가 공집합이 되면 enum 빈 배열로 표시하고, 충돌한 const는 제거한다. 형 교집합이 비면 enum 빈 배열을 적지 않고 `typeConflict`로 드러내며, 형과 nullable은 정적 선언대로 남긴다(BLUEPRINT-041). 이를 정착 오류로 던지는 일은 후속 정착 계약의 몫이다. 서로 다른 키워드 사이의 모순은 판정하지 않는다.
- options와 presentation은 주입된 원자 판정과 common-utils merge의 선택 인자로 병합한다. 한쪽에만 있는 값은 참조를 옮기고, 양쪽이 plain object이면 쓸 때 복사하며, 배열은 교체하고, 뒤쪽의 undefined는 앞쪽 값을 지우지 않는다. 활성 집합이 같으면 결과 기록 참조도 같다.
- 유효 스키마 메모는 노드, 활성 선언 집합, 정적·런타임 모드, 원자 판정 함수의 동일성을 구분한다. 기본 메모는 노드를 약한 키로 보관하며, 호출자가 별도 메모를 제공할 수 있다. 런타임 결과를 정적 검사에 재사용해서 오류를 건너뛰는 일은 없다.
- 유효 형이 좁혀지지 않으면 schemaType의 스칼라 값 또는 배열 참조를 그대로 쓴다. 게이트로 좁혀진 비어 있지 않은 형 목록은 동결 배열이며, number에서 integer로 좁혀진 E41도 `['integer']`다(BLUEPRINT-045, WRITE-099).
- 서로 다른 pattern이 있으면 첫 번째는 pattern에 남기고, 나머지는 allOf의 개별 pattern으로 보존한다. required는 연언에서 합집합이 되고, 주석은 나중 값이 이긴다. 값과 동작 규칙은 합치지 않고 선언별로 보존한다.
- 식 컴파일러는 이 모듈이 소유한다. 정적 의존은 모든 선언의 watch와 식 경로의 합집합이며, 실행 기준점은 해당 호스트다. 독립된 `*` 경로 조각은 허용하지 않고, 프로퍼티 이름에 들어 있는 별표는 보존한다(CONTROLS-080). 의존 사전은 프로토타입 이름과 충돌하지 않는다. 컴파일에 실패하면 schemaPath를 가진 청사진 오류가 된다.
- `JSON_POINTER_PATH_REGEX`는 이름으로 공개하는 식 경로 인식 규칙이다. 청사진의 식 컴파일과 기존 조건 분기 추출이 같은 정규식을 사용해서 의존 경로 해석이 갈라지지 않게 한다.
- 식 기록은 선언 식별자, 작성 위치, 호스트, 제어 키(`ControlKey`), 상대 의존 경로, 컴파일된 함수를 보존하되 분석 중에는 실행하지 않는다. 공유 참조의 식은 연결별 호스트에 다시 결합하며, 최초 방문 위치에 고정하지 않는다.
- `BlueprintGate.evaluationReads`는 식이 읽는 자리의 정적 목록이다. 절대 경로는 `#`·`(/)`의 루트 `''`, `/p`·`#/p`의 `'/p'`처럼 절대 경로 문자열로 보존한다. 상대 경로는 선언 호스트에서 오르는 `..` 횟수(0 이상인 수)로 보존하고, `@`는 제외한다. 청사진은 유한한 작성 위치마다 템플릿을 하나만 만들며, 발생의 절대 평가 자리 L은 정하지 않는다. 정착이 각 발생을 만들 때, 그 발생 호스트와 모든 읽기 자리의 최저 공통 조상 L을 한 번 계산해 메모한다. 단일 발생의 L은 종전 정적 규칙과 같다(SETTLE-045, BLUEPRINT-030, 26C-04·07).
- 선언은 노드 범위와 조각 범위를 구분한다. 조각의 controls는 호스트 유효 스키마에 합치지 않고, 직계 선언 자식을 대상으로 하는 규칙으로 보존한다. 검증 전용 분기는 병합 기여에서 제외한다. 선언 문맥에서는 유일한 선언 자체만 기여하고, 그 안의 then 같은 overlay 제약은 교차하지 않는다.
- fields 항목의 active 게이트는 항목을 소유한 선언의 적용 조건을 따로 보존한다. 소유 선언이 꺼지면 항목 제어는 적용되지 않으며, 소유 게이트와 active를 단순 AND로 바꾸지 않는다. 정적 순환 검사는 fields 항목 게이트도 절단점으로 인정하고, 실제로 무한히 확장되는지는 후속 정착 계약에 따라 판정한다(BLUEPRINT-030).
- 식을 받는 제어 키 목록은 식 컴파일과 capability 수집이 한 벌(`EXPRESSION_CONTROL_KEYS`)을 공유하며, 모든 제어 키 목록은 `ControlKey`로 형 검사를 받는다. 닫힌 목록 검사의 `options` 키 목록은 제어 키가 아니며, 그 형은 공개 스키마 형에 있어서 engine이 참조하지 않는다.
- 진단은 코드, schemaPath, 세부 정보를 담는다. 진단 코드는 `errors`의 그룹 한정 값(오류는 `JSONSchemaErrorCode`, 경고는 `FormWarningCode`)이며, 청사진 전용 코드 집합은 두지 않는다. 소비자가 없으면 경고 검사를 수행하지 않고, 캐시에서 늦게 수집하는 것은 루트마다 한 번이다. 검증기 입력에서는 폼 전용 키를 스키마 위치에서만 제거하고, 데이터 값 내부의 키는 보존한다.
- 내부 참조의 URI 디코딩이나 JSON Pointer 해석이 실패하면, 작성 위치와 원인을 보존한 UNKNOWN_JSON_SCHEMA로 보고한다.
- 터미널 하위의 예약 키 경고는 터미널 노드의 schemaPath마다 기록 하나에 keys와 paths를 모은다. 같은 코드와 schemaPath의 중복은 억제하며, 인라인 하위만 조사하고 참조 대상은 따라가지 않는다(BLUEPRINT-044).

## Acceptance Criteria

### schema-merge-mount — 정규화 재사용의 노드 관측과 병합 수

- 기존 런타임 병합을 강제한 대조군과, 마운트 및 후속 쓰기의 트리, 값, 유효 스키마, 리비전, 경고, 통지를 비교한다. 마운트마다 실제 정적·런타임 병합을 따로 세고, 적격 선언에서 런타임 재병합이 없어졌는지 확인한다.

### owned-inline-public — 생성 지점 공개·공유 값 보호

- 정적·runtime 유효 schema, 공개 값 11종, 공유 gate 내부가 두 모드에서 동결되고, 입력은 원래 참조와 동결 상태를 유지한다. hint style 병합은 결과만 보호하며, 작성된 React 값과 함수의 참조와 상태는 유지한다.

### owned-inline-memberships — 기록별 소유와 개발 보호

- 59종, 가상, 재바인딩, validationOnly, fields-control, discriminator, compiled expression, 지연 slot에서 두 기록이 소속 배열을 공유하지 않는다. 내부 기록은 개발 모드에서만 동결하고 appliesWhen은 두 모드에서 보호한다. EMPTY_INDEX 공유와 node-local memo를 유지한다.

### owned-inline-differential — 구현 전 HEAD와 동결 계수

- HEAD baf4cacb6의 59종 × collect 끔/켬에서 정규화 schema, 키·필드 순서, graph, 오류, 진단이 같다.

### owned-inline-counts — core mount 동결 계수

- module 초기화 상수를 제외한 core mount의 distinct 동결 수(운영/개발)는 nested 1,706/29,007, flat 502/10,523, oneOf-20 111/1,564, sample-0 5/66이며, 재동결과 primitive 호출은 0이다. options 없는 choices의 생성 지점 동결을 모듈 상수로 옮겨서 없어지는 호출은 각각 1,365, 501, 5, 3이고, 기록별 소속 배열의 보호는 같다(batch2 4-default-choices).

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

### type-gated-declarations — 게이트와 선언 문맥

- BLUEPRINT-045 E25–E27·E40–E42와 WRITE-099 보충을 만족한다. E26에서 좁혀지지 않은 유효 목록은 배열이 아니라 scalar schemaType 그 값이다. 정적 선언이 없는 이름을 무게이트 분기 fold가 선언해서 생기는 충돌을 검증한다.

### type-schema-type-invariant — schemaType 불변식

- TEST-077에 따라 E1–E42 중 구성되는 모든 칸과 TEST-067(b) 코퍼스 14종의 모든 청사진 노드에서, `isArray(schemaType)`이 union일 때만 참이고 배열 schemaType은 동결임을 검증한다. 노드와 배열 아이템이 같은 참조를 갖는지는 노드 엔진 단계의 몫이다.

### fragment-declarations — 조각과 공유

- 선언·연언 문맥, 모든 키워드의 전순서, 노드 공유, 상속 overlay 귀속, 가상 fields 순서 일치를 검증한다.

### discriminator — 명시 판별

- 참조, allOf, 자기 active 결합, 끌어올림, null 분기, 태그 누락, 중복, 도달 불가능 진단을 검증한다. 자동 판별은 일어나지 않는다.
- `DISCRIMINATOR_MISMATCH`는 네 가지다. 키가 어느 분기에도 없음(`missing`), 분기끼리 종류가 다름(`kind`), 분기 사이에 값이 겹침(`overlap`), 같은 노드의 선언 사이에서 판별 키가 다름(`key`)이다. details는 `{ propertyName, other?, reason }`이며, `key`에서 `propertyName`은 먼저 선언된 키이고 `other`는 다른 키다(25C-12).

### effective-schema — 병합과 참조

- SCHEMA 병합표, 정적 오류와 런타임 공집합 표현, pattern 보존, 불변성, 같은 활성 집합의 참조 동일성을 검증한다.

### unconditional-effective-schema — 무조건 선언의 정규화 재사용

- 빠른 경로는 기존 병합과 같은 유효 스키마, 불변성, 참조를 보존한다. 형 교차, nullable, pattern, 원자 판정, 수집기, 선언 전순서가 필요한 경우는 기존 병합으로 처리하며, 경고의 내용과 순서를 유지한다.
- 일회성 정적 정규화도 같은 선택 순서와 병합 정책을 사용한다. 59개 HEAD 스키마와 89C-03 차등에서 정적 오류, 경고, 필드, 공개 schema의 동결을 보존한다.
- 증명된 단일 정적 기여를 직접 구성해도 모든 노드의 HEAD 유효 스키마와 키 순서가 같으며, 줄어드는 것은 범용 제약 순회 횟수뿐이다. invalid, multiple, gated, collect, isAtomic 경로의 검증·진단과 기존 메모 참조 조건은 유지한다.

### expressions — 컴파일과 의존

- 옮긴 컴파일러의 기존 시험이 유지되고, 기준점, watch 합집합, 금지 경로, 컴파일 실패 위치를 검증한다.

### gate-evaluation-location — L의 정적 계산

- `BlueprintGate.evaluationReads`는 `#`·`(/)`의 절대 루트, `/p`·`#/p`의 절대 `p`, `@` 제외, 상대 오름 횟수를 청사진 단위 사례로 검증한다. 유한한 재귀 템플릿의 동일한 게이트는 정적 목록 하나를 공유하고, 발생별 L은 정착에서 서로 다르게 계산한다(SETTLE-045, 26C-04·07).

### diagnostics — 닫힌 목록과 수집

- ERROR-164의 현행 청사진 코드마다 사례가 있고, 보충과 폐기된 코드의 제외를 반영한다. 값 모양 오류의 새 코드 INVALID_CONTROL_SHAPE(그룹, injectTo, fields, fields 항목, 판별 키 모양)와 닫힌 목록 밖 키의 UNKNOWN_GROUP_KEY를 나눠서 검증한다. 터미널 하위의 예약 키는 인라인 하위만 검사하고 참조를 따라가지 않는다.

### recursion — 유한 분석과 형상

- TEST-067의 스캐너 신호, 무한 형상 표본, 절단 표본을 통과하고, 참조가 많은 스키마의 분석 1회 비용을 기록한다. 정착 표본 (c′)는 후속 노드 엔진 단계에서 다룬다.

### corpus — 원본 생성기 표본

- TEST-067(b)·TEST-079에 따라 생성기 코퍼스 14종을 수정 없이 각각 청사진으로 수용하고, 실패한 표본의 ID를 식별한다.

### validator-schema — 제거 위치

- 폼 예약 키는 스키마 위치에서 제거하며, const, enum, default 등의 데이터 내부에 같은 이름이 있어도 보존한다.

### array-limits-and-slots — 길이 한계와 아이템 자리

- 유효 스키마 조각의 길이 제약과 닫힌 튜플의 상한을 합쳐 `{ min, max }`를 돌려주며, core의 값 쓰기는 그 한계를 강제하지 않는다. 같은 템플릿과 색인의 자리 항목은 같은 참조이고, 선언 경로는 템플릿 경로를 유지하며, 청사진이 없는 자리에는 항목이 없다. 옛 표기에서 스키마 객체인 `additionalItems`는 꼬리 자리의 템플릿이 되고, `false`·`true`·없음은 청사진이 없는 꼬리다(NODE-009·052, WRITE-022, 35C-04·08, 36C-02).

## Boundary Exemptions

### `utils/expressions` — shared compiler during migration

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: 컴파일러는 스키마 분석에 속한다. 런타임 진입점이 바뀌기 전까지 레거시 computed-property 엔진이 이름 붙은 컴파일러 export를 소비한다. 컴파일러를 복제하면 두 엔진이 서로 다른 표현식 언어를 받아들이게 될 수 있다.

## Last Updated

2026-10-13. 계약 기준: 211C-01, REACT-003·004, 69C-04, 89C-03, 98C-01, 100라운드, 101라운드 묶음 1, 102라운드 단일 기여, 103C-01·Q106·Q107, 104라운드 owned-inline. 비용 기록: 105라운드 자식 열거, 106라운드 선언 수집, 참조·controls·hint 봉투 가드와 형 목록 predicate; 정돈-2(2026-10-14).
