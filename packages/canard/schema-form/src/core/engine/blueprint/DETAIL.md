# Blueprint contract

## Requirements

작성 스키마를 변경하지 않고 유한한 선언 그래프와 정적 증거를 준비합니다. 값·활성 집합·검증 결과를 분석에 섞으면 같은 청사진을 사용하는 폼 사이에 상태가 새므로, 발생별 평가와 보존은 [settle](../settle/DETAIL.md)이 소유합니다.

## API Contracts

분석은 주입된 터미널·원자 판정 함수를 보유하여 구성과 후속 병합이 같은 해석을 사용하게 합니다. 호출자가 제공하는 캐시의 사용 수명은 [app/cache](../../../app/cache/DETAIL.md)에, 경고 조사 범위는 [collectBlueprintWarnings](collectBlueprintWarnings/DETAIL.md)에 둡니다. 분석을 재사용해도 새 진단 소비자가 경고를 잃어서는 안 됩니다.

## Acceptance Criteria

### BLUEPRINT-001 — 분석과 실행의 경계

노드 할당과 값 평가 없이 정적 오류를 생성 시점에 확정합니다. [buildNodes](buildNodes/DETAIL.md)는 선언·형·연결을, [validateShape](validateShape/DETAIL.md)는 무조건 무한 형상을, [effectiveSchema](effectiveSchema/DETAIL.md)는 힌트를, [compileBlueprintExpressions](compileBlueprintExpressions/DETAIL.md)는 식을 소유합니다. 정적 검사를 첫 쓰기까지 미루면 잘못된 스키마가 정상 마운트로 보이므로 허용하지 않습니다. 청사진의 내부 기록 모양과 노드 공유의 관측 계약은 구별하며, 후자는 값 보존까지 바꾸므로 내부 표현 정리만으로 변경하지 않습니다.

### BLUEPRINT-013 — 게이트 배타성을 증명하지 않습니다

다른 종류를 선언하는 게이트의 배타성은 작성자가 책임집니다. 구조만으로 배타성을 요구하면 독립적인 allOf 조건을 거부하고, 같은 oneOf에 속한다는 이유로 배타라고 가정하면 실제 동시 활성을 놓칩니다. 정적 충돌만 분석에서 거부하며, 실제 동시 활성의 처분은 settle의 계약을 따릅니다.

### BLUEPRINT-035 — union과 variant를 구별합니다

union은 다중 형을 값 전체로 담는 터미널 종류이고, oneOf·anyOf를 가진 호스트와 그 분기는 variant 호스트·variant입니다. 두 개념을 혼동해 수동 분기 선택 상태를 만들지 않습니다. 선언 이름은 PropertyDeclaration처럼 풀어 쓰고 조각 타입은 SchemaFragment로 불러 React Fragment와의 혼동을 막습니다.

### CONTROLS-001 — 예약 그룹은 의미로 나눕니다

controls는 때에 따라 값·형상을 바꾸는 규칙과 정책, options는 정적 설정, presentation은 표현을 소유합니다. 읽는 계층만으로 그룹을 정하면 discriminator 같은 정적 준비를 하는 제어 선언이 잘못 배치됩니다. controls·options는 닫힌 언어이며 presentation은 플러그인의 열린 데이터입니다. 구체적인 허용 범위는 buildNodes의 CONTROLS-016을 따릅니다. 검증기 사본의 예약 그룹 제거는 [validation](../validation/DETAIL.md)이 소유합니다.

### FRAGMENT-019 — 검증상의 금지는 삭제 명령이 아닙니다

false 스키마·not·additionalProperties: false는 자식 비활성화나 값 삭제로 번역하지 않습니다. 금지 구문을 실행 명령으로 해석하면 서버가 기각하려는 입력이 조용히 사라집니다. dependentSchemas·dependentRequired·dependencies·contains도 자식 선언이나 게이트로 확장하지 않으며, 조건부 자식은 if/then이나 명시적 controls로 작성합니다. 정적 힌트 교차와 형 추론은 값의 유효성 판정과 구별합니다.

### FRAGMENT-022 — 작성 관행과 검사 한계

oneOf·anyOf의 if 분기를 조건이 맞는 분기로 사용하려면 else: false와 if.required에 조건 프로퍼티를 함께 적습니다. else: false가 없으면 조건이 틀린 분기도 공허하게 통과하고, required가 없으면 조건 프로퍼티가 없어도 if가 참일 수 있습니다. allOf·최상위 if/then은 else가 없어도 선언할 수 있지만, 어느 조건에도 맞지 않는 값을 거부하려면 별도의 검증 제약이 필요합니다.

controls.active·discriminator로 제어하는 분기에도 const·enum 및 required 같은 검증 제약을 작성합니다. 예약 제어는 검증기에 보이지 않으므로 이를 생략하면 화면 선택과 검증의 분기 수가 달라집니다. 조건 프로퍼티는 호스트에 두어 분기가 모두 꺼져도 읽을 수 있게 합니다. 폼은 if.required의 적절성이나 조건 필드의 선언 여부를 검사하지 않습니다. 별도의 불완전한 검증기를 갖지 않기 위한 경계이며, 키 존재로 가능한 경고만 collectBlueprintWarnings가 소유합니다.

### FRAGMENT-052 — FE 전용 필드도 표준 선언을 사용합니다

FE 전용 조건부 필드는 단일 스키마의 properties와 controls.active로 표현합니다. 이미 같은 표현력이 있으므로 예약 그룹에 별도의 필드 선언 언어를 추가하지 않습니다. 이 필드의 검증은 해당 검증 스키마가 맡으며, Form의 단일 입구와 소비자 병합 책임은 [Form](../../../components/Form/DETAIL.md)에 둡니다.

### fixed-first-load-proof — 마운트 전용 증거의 독립성

fixedFirstLoadPlan은 staticFirstLoadEligible·branchless와 독립된 비열거·읽기 전용 생성 사실입니다. 기존 자격을 역산하지 않고 최종 검사까지 남은 유한·리터럴 증거를 받으며, 모드 초기화나 캐시 재사용으로 지우지 않습니다. 검증기 판정·살아 있는 레코드를 보유하지 않아 분석 재사용이 실행 상태를 공유하지 않게 합니다.

### fixed-first-load-fallback — 닫힌 overlay 언어

독립적인 로컬 if의 then·else는 생략하거나, 무조건 존재하는 문자열 자식의 유한 비음수 정수 minLength·maxLength만 바꾸는 properties 조각입니다. 봉투와 속성 지도는 plain/null prototype의 열거 가능한 자기 데이터 속성만 허용하며 심볼·접근자를 거절합니다. required·default·type·nullable·참조·options·presentation·미지 키가 있으면 계획 전체를 포기합니다. if 자체의 불투명한 조건은 일반 가드에 남겨 지원하지 않는 의미를 증명한 것처럼 취급하지 않습니다.

### fixed-first-load-shape — 기준 형상을 보수적으로 제한합니다

배열·union·가상·재귀·whole-value 컨테이너·컨테이너 기본값·대체 자식 정체성·식·파생·감시·상태·의존·controls·게이트의 선행 조건·중첩 게이트 호스트는 자격 밖입니다. 계획이 없으면 첫 변경 전에 일반 정착을 사용합니다. 완료 선언·간선에 비례해 증명하고 기존 childEntries를 빌리며, 새 보유량은 게이트 호스트와 영향 엔트리에 비례합니다. 분기 없는 경우는 고정 검사로 종료합니다.

### shape-validation-counts — 순환 가능성 증거로만 검사를 생략합니다

구성 중인 템플릿을 다시 만난 경우에만 형상 검증을 호출합니다. 단순 참조 재사용은 재귀 증거가 아닙니다. 증거가 없으면 그래프가 비순환이므로 순회를 생략할 수 있고, 있으면 검증과 오류 순서를 그대로 유지합니다.

### shape-validation-equivalence — 검사 생략의 관측 조건

검사를 항상 실행하는 대조와 같은 선언·형상·오류·진단을 유지합니다. 자식 대상 검사도 fields 존재 증거가 있을 때만 호출하며, 판별자만으로 그 증거를 세우지 않습니다. 대상 검사의 경계는 [validateChildTargets](validateChildTargets/DETAIL.md)를 따릅니다.

### owned-inline-differential — 소유권 변경의 관측 조건

소속 배열의 표현을 바꾸어도 정규화 스키마·필드 순서·선언·조각·엔트리·정적 오류·진단은 같아야 합니다. 값의 공유를 줄이는 최적화가 스키마 의미를 바꾸지 않도록 하는 조건입니다.

### owned-inline-counts — 동결 비용과 보호 경계를 함께 유지합니다

생산자가 만든 공개 스키마와 공유 값은 운영에서도 보호하고 내부 기록은 개발 모드에서 보호합니다. buildNodes의 owned-inline-public·owned-inline-memberships가 구체적인 소유 경계입니다. 동결 횟수만 줄이려고 공유된 공개 값을 가변으로 만들지 않으며, 재동결을 위한 완료 그래프 재순회를 늘리지 않습니다.

### owned-inline-render — 작성된 불투명 값은 빌린 참조입니다

React 값·함수·default 내부까지 동결하지 않습니다. 작성자가 렌더 중 만드는 값의 수명을 생산자 소유 봉투와 혼동하면 소비자 코드를 변경하게 됩니다.

### branchless-proof — 분기 없음은 도달한 선언 전체의 증거입니다

참조 대상·allOf·아이템·인라인 자식·가상·fields를 포함한 선언 수집 범위에서 판정합니다. 사용하지 않는 정의나 터미널 아래를 별도로 확장하지 않습니다. 루트의 키 부재만으로 증명하면 숨은 분기를 누락합니다.

### branchless-equivalence — 정적 검사는 기능 생략과 독립적입니다

분기가 없더라도 형·전략·공유 충돌·재귀·경고·작성 순서의 계약은 유지합니다. 분기용 실행 자료의 생략이 분석 지연으로 바뀌어서는 안 됩니다.

### branchless-features — 기능 증거는 서로 대체하지 않습니다

식·derive·watch·state는 분기 없음과 독립적으로 남습니다. 기능 색인은 비활성 선언까지 포함하여 마지막 제어가 꺼진 자리도 기본 상태로 돌아오게 합니다. 참조·아이템의 대상은 실제 호스트에 결합하며, 조각의 직접 자식 소유 판정은 [engine](../DETAIL.md)의 공통 계약을 따릅니다.

### type-syntax — 명시 형의 경계

허용 형·nullable·전략의 변경은 buildNodes의 BLUEPRINT-044·BLUEPRINT-036을 함께 만족합니다. 종류와 전략을 활성 결과로 재선택하지 않습니다.

### type-inference — 형 없는 칸의 경계

buildNodes의 BLUEPRINT-051·BLUEPRINT-048·BLUEPRINT-050이 형 없는 칸의 유일한 추론 규칙입니다. const·enum을 분기 자동 선택의 근거로 확대하지 않습니다.

### type-inference-round19 — 형 없는 칸의 제한 유지

재귀 절단 뒤 빈 집합·형 없는 분기·객체와 다른 종류의 혼합은 오류이며, 객체만·배열만인 variant 호스트와 분기 없는 원시 리터럴 추론은 허용합니다.

### type-static-intersection — 종류와 힌트의 정적 교차

buildNodes의 BLUEPRINT-041과 effectiveSchema의 BLUEPRINT-016을 함께 따릅니다. 순서를 바꾸어도 허용 집합의 의미는 같고 표시 순서만 앵커를 따릅니다.

### type-schema-type-invariant — 정적 형 정체성

schemaType의 배열은 union에만 쓰고 생성 때 동결합니다. number 종류에서도 integer 제약은 남으며 null은 nullable로 구별합니다. 종류 접기로 검증상의 정수 제약까지 없애지 않습니다.

### discriminator — 명시 판별의 통합 경계

buildNodes의 BLUEPRINT-017·FRAGMENT-048을 따릅니다. 모양 오류가 무시 경고보다 먼저 검사되며, 선언별 독립 키·anyOf 중복·도달 불가능 태그의 처분을 유지합니다.

### gate-evaluation-location — 템플릿과 발생의 평가 위치를 구별합니다

게이트의 절대 읽기와 상대 오름 수만 정적으로 보존하며 @는 위치 계산에서 제외합니다. 같은 재귀 템플릿을 쓰는 발생의 평가 자리는 settle이 결합하므로 최초 방문 경로를 재사용하지 않습니다.

### diagnostics — 진단은 현재 공개 코드에 귀속됩니다

닫힌 키 밖의 오류와 허용 키의 값 모양 오류를 구분하며 작성 위치를 보존합니다. 진단 수집 유무는 분석의 성공·실패를 바꾸지 않습니다.

### corpus — 생성기 스키마의 수용 범위

생성기 스키마도 명시 판별·참조·형 추론의 같은 규칙을 따릅니다. 생성기 이름에 따른 별도 해석을 추가하지 않습니다.

### array-slots — 배열 자리 항목의 정체성

같은 템플릿·색인의 자리 항목 참조를 재사용하고 선언의 템플릿 경로를 유지합니다. 청사진이 없는 자리는 undefined이며, 이 보조는 런타임 노드를 만들지 않습니다. 아이템 후보 수집은 buildNodes의 BLUEPRINT-010·BLUEPRINT-005를 따릅니다.

### blueprint-property-addresses — 경로가 이름을 바꾸지 않습니다

속성 이름이 정확히 %2A·%2E·%2E%2E·%40이면 왕복 시 예약 연산자로 바뀌므로 RESERVED_PROPERTY_NAME으로 거부합니다. 문자 그대로의 *·.·..·@와 대소문자가 다른 퍼센트 이름까지 금지하지 않습니다.

### feature-index-item-fragment — 아이템의 직접 소유를 보존합니다

조각이 items·additionalItems로 선언한 반복 아이템과 prefixItems·튜플의 고정 자리를 구별하여 상태 키 대상에 넣습니다. 문자열의 별표만 보고 리터럴 속성 이름을 반복 아이템으로 취급하지 않습니다.

### static-metadata — 증거는 실행 결과를 저장하지 않습니다

후보·후보 자손·유지 자손·inactiveValue 존재 표시는 비활성 선언과 재귀 간선까지 포함한 생성 사실입니다. 후보나 유지 선언이 없는 그래프에는 전파용 역그래프를 만들지 않으며, 표시는 살아 있는 값이나 선택 결과를 담지 않습니다. 호스트 정적 분할도 모든 선언을 확인해 가상·동명 후보·게이트 overlay를 보수적으로 제외하고, 같은 호스트의 결과를 재사용합니다.

파생 수렴 증명은 첫 실제 파생 쓰기에서 지연 수집하며 실패한 증명도 메모합니다. 모든 선언·식·watch·injectTo 원천·게이트 읽기와 조상·자손 양방향 교차를 고려합니다. 불완전 읽기·맥락·전체 호스트·발생별 재귀·배열은 일반 경로로 돌아가고 컨테이너·가상 대상은 제외합니다. 첫 수집은 선언·읽기·대상과 읽기의 조합에 비례하며 이후 조회는 상수입니다. 생성 때 값을 평가하거나 증명을 위해 별도의 라이브 노드 칸을 추가하지 않습니다.

## Boundary Exemptions

### `utils/features/` — 청사진 전체 정적 증거

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: 기능 색인·정적 분할·수렴 증명은 이 청사진 전체의 선언에 종속되므로 독립 계약으로 분리하지 않고 진입점을 통해 엔진에 제공합니다.

### `utils/itemEntry/` — 지연 자리 결합

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: 완성된 배열 템플릿의 자리 메모이므로 청사진에 두며, 런타임 소비자는 진입점으로만 접근합니다.

### `types/` — 분석 계약의 형

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: 분석 결과를 받는 엔진 소유자가 같은 형을 사용하도록 형의 정본을 이곳에 두고 이름으로 내보냅니다.

## Last Updated

정적 언어·분석과 실행의 경계·증거의 자격·소유권·수용 기준이 바뀔 때 갱신합니다.
