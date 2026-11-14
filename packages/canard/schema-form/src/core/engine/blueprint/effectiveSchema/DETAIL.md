# effectiveSchema contract

## Requirements

유효 스키마는 렌더링 힌트이며 검증기에 넘기는 스키마가 아닙니다. 작성 값과 기존 결과를 변경하지 않고, 활성 선언의 의미가 같은 동안 참조를 재사용합니다. 새 객체를 매번 만들면 값 변화가 없어도 입력 해석과 통지가 반복됩니다.

## API Contracts

반환의 schema와 typeConflict를 구별합니다. 게이트 판정·활성 집합 선택·형 충돌의 실행 처분은 [settle](../../settle/DETAIL.md)이 소유하며, 이 모듈은 전달받은 활성 ID로 기여를 선택하고 합칩니다. 키워드별 잎 교차의 동등 판정은 [schemaIntersection](../../../../helpers/schemaIntersection/DETAIL.md)을 따릅니다.

## Acceptance Criteria

### SCHEMA-044 — 존재와 힌트 기여를 구별합니다

게이트 없는 oneOf·anyOf는 존재만 더합니다. 연언 선언은 함께 기여하지만 선언 문맥의 선언은 활성 선언 중 유일한 소유 선언일 때만 그 선언 자체를 사용하고, 그 안의 then overlay는 교차하지 않습니다. 여러 분기의 const를 교차하거나 값과 무관한 분기의 title·입력·options를 고르면 검증기보다 좁거나 엉뚱한 힌트를 만들기 때문입니다. 전략 판정도 이 선택 원칙을 공유합니다. 분기 자체의 active·판별 게이트가 없으면 if와 else: false가 있어도 선언 문맥입니다. if는 then·else의 게이트이며 형제 properties 전체를 끄는 게이트로 승격하지 않습니다.

### SCHEMA-007 — 병합은 같은 전순서를 사용합니다

선택한 기여는 [buildNodes의 FRAGMENT-049](../buildNodes/DETAIL.md)의 전순서를 따릅니다. 연언 제약은 키워드별 교차, 주석·표현 힌트는 나중 값 우선입니다. required는 연언 기여의 합집합이며 pattern은 첫 문자열과 나머지 allOf 절로 보존합니다. 정규식 하나로 합치면 검색 위치·캡처·역참조의 뜻이 달라지므로 하지 않습니다. required의 표시·배달은 settle이 소유하고 이를 자식 생성 명령으로 쓰지 않습니다.

### SCHEMA-039 — 힌트 그룹은 쓰기 시 복사합니다

options·presentation은 비원자 plain object가 양쪽 같은 키에 있을 때만 새 객체로 깊이 병합합니다. 한쪽 값은 참조를 빌리고, 배열·원자·함수·원시값은 나중 것으로 교체하며 undefined는 앞 값을 지우지 않습니다. 원자 판정은 주입받아 React 요소·ref의 의미를 코어가 소유하지 않게 합니다. 평범한 options 객체의 virtual은 힌트가 아니라 자식 선언이므로 병합에서 제외합니다. 다른 options 값은 불투명 데이터로 보존하여 소비자 payload를 엔진 선언으로 오인하지 않습니다. 생성한 봉투와 새로 병합한 중첩 객체만 보호하고 빌린 작성 값 내부는 동결하지 않습니다.

### SCHEMA-012 — 규칙은 하나의 합성 값으로 병합하지 않습니다

derived·injectTo·unsetValue·resetInteraction·fields·unsetOnInactive·inactiveValue는 원 선언에 남겨 대상과 층을 보존합니다. 조각 controls를 호스트의 controls에 합치면 자식 범위 규칙이 호스트 자신에게 걸립니다. node 범위의 default·watch만 단일 힌트로 나중 값을 보존하며, 의존 경로의 정적 합집합은 [compileBlueprintExpressions](../compileBlueprintExpressions/DETAIL.md)가 소유합니다. 규칙 승자와 정책 계산을 이 병합의 덮어쓰기로 대체하지 않습니다.

### BLUEPRINT-016 — 정적 교차 실패와 값의 기각을 구별합니다

정적 연언에서 둘 이상의 기여를 같은 키워드에 교차해 생기는 enum·const 공집합과 범위 역전은 작성 위치를 가진 청사진 오류입니다. 한 기여의 enum: [] 또는 역전 범위는 입력 스키마 자체이므로 그대로 둡니다. 범위 쌍은 앞과 현재 기여에 각각 경계가 있고 합친 결과가 역전할 때만 검사하며 서로 다른 키워드 사이의 모순은 풀지 않습니다. 일반 힌트의 교차와 판별 태그 수집의 예외는 buildNodes의 FRAGMENT-048로 구별합니다.

### SCHEMA-045 — 런타임 제약 공집합을 표현합니다

런타임 enum 교차의 공집합은 enum: [], const 충돌은 const를 제거하고 enum: []로 표현합니다. 범위 역전은 합친 경계 그대로 남기며 const와 enum 사이 같은 교차 키워드 모순은 판정하지 않습니다. 선택지가 없더라도 값을 비우면 유효할 수 있으므로 제약 공집합만으로 폼 전체를 중단하지 않습니다.

### BLUEPRINT-040 — 정적 형 정체성과 유효 목록을 구별합니다

schemaType·nullable은 정적 정체성이며, 유효 schema.type은 그 정적 허용 집합에 선택된 type을 교차한 결과를 직렬화합니다. 추론한 형도 유효 type에 나타납니다. 좁혀지지 않으면 정적 scalar 또는 배열 참조를 재사용하고, 좁혀진 비어 있지 않은 목록은 동결 배열입니다. number에서 integer로 좁혀진 경우도 ['integer']입니다. null만 남으면 type은 null입니다. 형 교집합이 비면 enum 공집합으로 위장하지 않고 typeConflict를 반환하며 정적 type·nullable을 보존하여 실행 소유자가 충돌을 처리하게 합니다.

### BLUEPRINT-021 — 메모는 검사 정책을 분리합니다

노드·선택된 선언 집합·static/runtime 모드·원자 판정 함수 identity가 같은 결과를 공유합니다. 런타임 메모를 정적 검사에 사용하면 오류가 사라지므로 모드를 섞지 않습니다. 기본 메모와 정적 정규화 결과는 엔진의 약한 host 파생 기록에 두며 builder는 이 모듈이 소유합니다. 저장과 모드 초기화 경계는 [engine](../../DETAIL.md)이 맡고, 호출자 소유 메모도 같은 정책 분리를 지킵니다.

### schema-merge-mount — 정규화 재사용의 관측 조건

정적 정규화를 런타임에서 재사용해도 트리·값·유효 스키마·리비전·경고·통지는 일반 병합과 같습니다. 비용을 옮기는 일이 분석 오류나 후속 변경을 생략하는 일이 되어서는 안 됩니다.

### type-gated-declarations — 게이트 형 좁힘

게이트는 정적 노드 종류를 바꾸지 않습니다. 형 충돌과 제약 공집합을 구별하고, 실제로 좁혀지지 않은 목록은 같은 정적 참조를 유지합니다.

### fragment-declarations — 호스트와 문맥 보존

같은 참조라도 host overlay의 귀속·연언과 선언 문맥·전순서를 유지하며, 가상 fields 순서는 고정 튜플의 신원으로 취급합니다.

### effective-schema — 불변 힌트의 참조

같은 선택과 정책의 결과는 같은 참조이며, 작성 객체는 병합과 보호 과정에서 변형되지 않습니다. SCHEMA-007·039·045의 제한을 함께 지킵니다.

### unconditional-effective-schema — 증명된 정규화만 재사용합니다

무조건 단일 node 연언의 정규화는 같은 정책일 때 재사용할 수 있습니다. nullable·형 배열·pattern·원자 판정·진단 수집처럼 증명이 다루지 못하는 경로는 일반 병합과 검사를 사용합니다. 선택된 기여와 키 순서·진단·공개 값 보호가 달라지지 않아야 합니다. 선택·병합은 선언 수와 실제 기여 크기에 비례하며, 새 상주 색인이나 라이브 상태를 추가하지 않습니다.

## Boundary Exemptions

### `utils/merge/` — 병합 구현의 소유

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: 부모와 buildNodes가 같은 선언 선택·병합 계약을 사용하도록 구현은 이 모듈이 소유하고 진입점이 이름으로 제공합니다.

## Last Updated

선언 선택·교차 표현·힌트 소유권·메모 정책·정규화 자격이 바뀔 때 갱신합니다.
