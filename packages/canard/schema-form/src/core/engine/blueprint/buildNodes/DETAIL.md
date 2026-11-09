# buildNodes contract

## Requirements

선언의 문맥·소유 호스트·게이트·전순서를 보존하여 유한 템플릿을 구성합니다. 값 평가와 런타임 노드 생성은 하지 않습니다. 작성 위치의 수와 연결 문맥을 구별해야 공유 참조의 첫 방문이 다른 사용처의 의미를 고정하지 않습니다.

## API Contracts

부모가 주입하는 predicate로 전략과 원자성을 판정합니다. 정적 힌트 교차는 [effectiveSchema](../effectiveSchema/DETAIL.md), 무조건 순환 검사는 [validateShape](../validateShape/DETAIL.md), 완성된 직계 자식 대상 검사는 [validateChildTargets](../validateChildTargets/DETAIL.md)가 소유합니다. 실제 게이트 충돌과 발생별 재귀 확장은 [settle](../../settle/DETAIL.md)로 넘깁니다.

## Acceptance Criteria

### BLUEPRINT-004 — 호스트에 결합한 상속 overlay

then·else나 allOf 안의 선언도 본체와 같은 자식 구성 경로에 넣습니다. 손자에 닿는 overlay는 그 자식 호스트에 귀속시키되 게이트의 호스트는 조상에 남깁니다. 같은 참조 대상이라도 연결 문맥이 다르면 선언 집합을 무조건 공유하지 않으며, 재귀 연결의 게이트는 해당 입력과 템플릿 자신의 게이트를 새 호스트에 다시 묶습니다. 이를 생략하면 다른 발생의 조건과 경로를 읽습니다.

### BLUEPRINT-005 — 방언 전환 없이 구조 철자를 읽습니다

$defs·definitions와 prefixItems·items 튜플을 모두 읽습니다. 옛 튜플의 additionalItems가 스키마 객체이면 꼬리 템플릿으로 두고, true·false·없음이면 꼬리 청사진을 만들지 않습니다. 꼬리를 허용하는지는 검증기가 결정하므로 닫힌 배열을 별도의 형상 금지로 번역하지 않습니다.

### BLUEPRINT-010 — 공유 단위는 이름과 접은 종류입니다

같은 이름의 정적 연언은 하나의 노드를 정합니다. 정적 소유 선언이 없는 자리는 같은 fold끼리 후보를 공유하며, 서로 다른 fold의 무게이트 선언은 SHARED_NODE_KIND_CONFLICT입니다. 게이트 후보의 동시 활성은 분석에서 추정하지 않습니다. union도 fold 집합이 같아야 같은 종류이며, number/integer·nullable·형 나열 순서는 정체성에 잘못 포함하지 않습니다. 이 규칙을 아이템·additionalItems·각 prefixItems 자리에도 적용해 뒤쪽 종류가 사라지지 않게 합니다. 단일 후보 필드는 첫 후보이며, 여러 후보를 처리하는 소비자는 작성 순서의 전체 후보를 사용합니다.

### BLUEPRINT-041 — 정적 허용 집합이 종류를 결정합니다

본체·게이트 없는 allOf·$ref의 type은 null을 포함하여 교차하고 integer는 number의 부분집합입니다. 빈 정적 교집합만 형 충돌이며 {null}은 null 종류입니다. 게이트는 정적 kind·schemaType·nullable·전략을 재선택하지 않고 유효 목록만 좁힙니다. 정적 소유가 있는 자리의 게이트 없는 선언 분기는 그 fold의 부분집합일 때 존재만 더하고, 밖이면 정적 공유 충돌입니다. 임의의 선언 순서로 종류가 바뀌는 일을 막습니다.

### BLUEPRINT-044 — 형 표기와 종류 접기를 구별합니다

알 수 없는 형·빈 type 배열·중복 원소는 UNKNOWN_JSON_SCHEMA입니다. 한 선언의 number와 integer는 number로 합치지만 교차 결과의 integer 제약은 schemaType에 남깁니다. nullable: true는 같은 객체에 type이 있을 때만 null을 더하고, 종류를 정할 때만 null을 떼고 integer를 number로 접습니다. 첫 정적 type 선언은 결과 순서의 앵커이며 의미를 우선하지 않습니다. 명시된 원시·union 호스트의 게이트 없는 분기는 검증 전용이므로 목록 밖 분기나 null 분기가 정적 목록을 바꾸지 않습니다.

### BLUEPRINT-051 — 형 없는 칸의 분기 추론

게이트 없는 분기마다 정적 연언의 허용 집합을 구해 키워드 안에서는 합집합, oneOf와 anyOf 사이에서는 교집합을 취한 뒤 null을 분리합니다. 순서는 첫 등장과 oneOf 쪽 앵커를 따릅니다. 게이트 분기는 추론에서 제외하며, 빈 결과나 허용 집합을 정하지 못한 분기는 type을 명시하도록 UNKNOWN_JSON_SCHEMA로 보고합니다. const·enum만 있는 분기를 임의의 형으로 추정하면 선언과 검증이 갈라지므로 허용하지 않습니다. 재귀 분기 위치는 재진입에서 절단하며 빈 결과를 성공으로 바꾸지 않습니다.

### BLUEPRINT-048 — 형 없는 컨테이너 호스트의 한계

분기 집합에서 null을 뺀 fold가 object 하나 또는 array 하나이면 해당 variant 호스트로 구성하고 같은 자식·전략 규칙을 사용합니다. object·array가 다른 종류와 섞인 형 없는 칸은 UNKNOWN_JSON_SCHEMA입니다. 명시적 다중 type의 터미널 union을 이 제한과 혼동하지 않습니다.

### BLUEPRINT-050 — 분기 없는 원시 리터럴 추론

정적 type과 게이트 없는 분기가 모두 없는 칸은 const·enum의 단일 비null 원시 종류로 추론할 수 있고 null은 nullable로 남깁니다. 여러 비null 종류나 객체·배열 리터럴은 명시적 type을 요구합니다. 이 제한된 추론을 분기 선택 자동 감지로 확대하지 않습니다.

### BLUEPRINT-036 — 전략은 생성 후 고정입니다

union은 object·array를 포함해도 값 전체를 담는 terminal이며 자식을 만들지 않습니다. 단일 행 종류와 맞지 않는 options.terminal은 오류입니다. object·array는 명시 terminal → 주입된 renderer 판정 → branch 기본값 순으로 결정하며, 노드가 존재하는 게이트 문맥마다 전략이 같아야 합니다. 게이트 없는 나중 선언이 이기는 경우와 게이트 전환으로 전략이 바뀌는 경우를 구별하여 편집 단위가 실행 중 갈라지지 않게 합니다. 선언 선택은 effectiveSchema의 SCHEMA-044와 일치합니다.

### BLUEPRINT-017 — 명시 판별의 오류와 허용 범위

controls.discriminator만 태그를 읽으며 OpenAPI discriminator나 일반 분기의 const·enum을 자동 선택에 쓰지 않습니다. 분기 스키마를 고치지 않고 판별 descriptor와 게이트를 만들므로 검증 판정은 유지됩니다. 분기 자신의 active는 별도 게이트와 함께 모두 성립해야 합니다. 예약 판별을 검증기 전용 discriminator 옵션으로 구현하지 않습니다. 그러면 폼의 형상 언어가 특정 플러그인의 지원 범위에 종속되어 같은 생성기 스키마의 수용 여부가 달라지기 때문입니다.

비문자열·빈 키는 INVALID_CONTROL_SHAPE로 먼저 거부합니다. 알려진 비객체 호스트 또는 union 없는 객체 선언의 키는 무시하고 경고합니다. 객체 variant의 태그 전체 누락, 같은 oneOf의 값 중복, 호스트 태그 형이 없는데 분기 태그 종류가 다름은 DISCRIMINATOR_MISMATCH의 missing·overlap·kind 오류입니다. 일부 무태그 분기는 자기 active만 따르며 anyOf 중복·여러 종류를 포괄하는 호스트 태그·선언마다 다른 판별 키는 허용합니다. 키 하나가 다른 선언의 union까지 선택해서는 안 됩니다. details는 propertyName과 reason만 담습니다.

### FRAGMENT-048 — 태그 수집과 도달 불가능 분기

분기와 태그 프로퍼티의 본체·게이트 없는 allOf·$ref만 따라 const·enum을 교차하며, if/then·게이트 가진 allOf·중첩 disjunction은 태그 수집 범위 밖입니다. null 전용 분기는 판별 대상에서 제외합니다. 태그 교차가 비면 형 추론 전에 빈 값 descriptor를 남겨 절대 켜지지 않게 하고 empty 경고를 냅니다. 호스트 태그 형 밖이면 kind 경고이며, 두 경우의 태그는 끌어올리거나 기존 호스트 자식의 선언에 넣지 않습니다. 일반 정적 힌트의 공집합 오류와 구별하여 도달 불가능 분기 때문에 폼 전체가 중단되지 않게 합니다. 호스트 태그 enum 밖의 값을 별도로 판정하지 않습니다.

도달 가능한 분기에만 있는 태그는 무조건 선언으로도 끌어올려 모든 분기가 꺼진 상태에서도 조건을 읽게 합니다. 태그 값의 합집합 enum이나 암묵 default는 만들지 않습니다. 터미널 객체도 판별 불일치 검사는 유지하지만 도달 불가능 경고는 수집하지 않습니다.

### CONTROLS-016 — 닫힌 예약 언어와 단일 철자

controls는 폼만 실행하는 예약 영역이므로 선언 범위마다 닫혀 있습니다. 미지 키는 UNKNOWN_GROUP_KEY로 거부하여 오타가 가시성·값 제거·파생을 조용히 바꾸지 않게 하고 미래 제어 이름을 예약합니다. controls 그룹·fields 항목·injectTo·판별 키의 잘못된 모양은 INVALID_CONTROL_SHAPE로 구별합니다.

options는 소비자와 플러그인의 확장에 열려 있으며 미지 키에는 오류나 경고를 내지 않습니다. 평범한 객체가 아닌 options는 엔진 설정으로 읽지 않습니다. 평범한 객체에서 undefined가 아닌 terminal·omitEmpty·omitTrailing·trim은 boolean, propertyOrder는 문자열 배열이어야 하며 생성 때 options/키 위치의 INVALID_CONTROL_SHAPE로 거부합니다. virtual은 null·배열이 아닌 객체 봉투인지 같은 위치에서 검사하고 내부 선언 검사는 유지합니다. 오타 방어는 알려진 키의 TypeScript 자동완성에 맡깁니다. 미래 옵션 이름이 사용자 키와 충돌할 수 있는 비용을 받아들이므로 새 이름은 충돌을 고려하는 계약 변경입니다. 입력 payload의 권장 위치는 presentation입니다. controls의 상태·에지·unsetOnInactive는 boolean 또는 표현식 문자열, derived는 문자열, watch는 문자열 또는 문자열 배열을 받습니다. fields·조각에도 같은 얕은 검사를 적용하며 default·inactiveValue의 값은 제한하지 않습니다. presentation은 열린 병합 데이터이며 inputType은 문자열, FieldInput은 함수·객체 또는 생략을 뜻하는 null, FieldInputProps·FieldRendererProps·errorMessages는 null·배열이 아닌 객체인지 생성 때 검사합니다. 중첩 값과 React 정체성은 검사하지 않아 코어가 바인딩 구현을 소유하지 않습니다. 잘못된 예약 값은 그룹/키 위치와 group·key·expected 상세를 가진 INVALID_CONTROL_SHAPE입니다. 검사는 청사진 분석에만 있고 입력 경로에는 없으며 고정 키당 상수 비용, 문자열 배열 원소 수에 비례하는 비용입니다. 평면 &키·computed·맨 virtualRequired 등은 폼의 별칭으로 읽거나 이주 경고를 만들지 않습니다. 별칭은 우선순위·형·문서를 이중으로 만들고 미지 표준 확장 키를 가로채므로 두지 않습니다.

### reserved-read-trust — 로드 검증을 통과한 읽기 / Validated reads

예약 키 목록과 얕은 형의 소유는 [패키지 계약](../../../../DETAIL.md)에 있습니다. collectDeclarations는 제어·옵션·표현의 얕은 검사를 마친 뒤 선언을 배포합니다. 모든 진입 경로가 이 검사를 거치는 읽기는 같은 형을 재검사하지 않습니다. 검증 전 순회·외부 플러그인의 임의 스키마·런타임 생성 스키마는 이 보증 밖이며 가드를 유지합니다. 허용 형 간 선택과 중첩 payload 검사는 얕은 보증을 넘으므로 유지합니다.

collectDeclarations validates reserved shallow values before publishing declarations. Reads reached exclusively through that validation trust it to avoid duplicated checks and diverging acceptance rules. Pre-validation walks, arbitrary plugin schemas and runtime-created schemas retain guards; accepted-form selection and nested payload checks remain outside this shallow guarantee. Validation stays at load time, with module-initialized key views and no per-input allocation.

### CONTROLS-018 — 식과 리터럴 선언을 구별합니다

상태·에지 제어와 derived의 문자열은 식이며 문자열 상수는 식 안에 인용합니다. default·inactiveValue의 문자열은 리터럴, discriminator는 이름, watch는 경로, injectTo는 함수입니다. inactiveValue는 동기 resolver 또는 리터럴이며 식 컴파일·정적 의존 추적에 넣지 않습니다. injectTo의 반환 대상은 실행해야 알 수 있으므로 정적 대상 없음 오류를 만들지 않습니다.

### CONTROLS-030 — 자식 제어는 한 홉의 선언입니다

controls.fields의 targets는 직계 자식 이름이고 controls와 별도의 봉투를 사용합니다. 항목·조각 범위에는 자식 제어 키만 허용하며 fields·injectTo·discriminator·watch를 다시 넣지 않습니다. 조각은 자신이 직접 선언한 자식의 제어를 소유하고 일반 자손 상속으로 바꾸지 않습니다. 항목 active의 appliesWhen은 소유 선언의 게이트를 보존하며 단순 AND로 합치지 않습니다. 소유 선언이 꺼진 경우와 대상 자체를 끄는 경우를 혼동하지 않기 위해서입니다. 완성 후 대상 존재 확인은 validateChildTargets가 맡습니다.

### FRAGMENT-049 — 전순서는 JSON 키 순서와 독립적입니다

감싸는 선언의 순서 뒤에 properties < allOf < if/then/else < oneOf < anyOf와 배열 인덱스를 붙여 비교합니다. 같은 호스트의 모든 oneOf 분기는 모든 anyOf 분기보다 앞섭니다. 주석 병합·전략·규칙 동점·공유 충돌의 앞선 후보가 서로 다른 순서를 사용하지 않게 합니다.

### BLUEPRINT-030 — 위치의 재방문과 템플릿 재귀

$ref는 작성 루트 안의 표준 JSON Pointer만 해석합니다. 외부 자원·깨진 URI/포인터·스키마가 아닌 대상은 작성 위치와 원인을 가진 UNKNOWN_JSON_SCHEMA입니다. 한 호스트의 조각 확장에서 같은 작성 위치를 다시 만나면 선언의 존재가 달라지지 않으므로 확장을 멈춥니다. 자식 참조는 유한 템플릿에 연결하며, 구성 중 템플릿을 다시 만난 증거만 단조적으로 남깁니다. null 허용이나 단순 캐시 적중을 순환의 절단 또는 재귀의 증거로 오인하지 않습니다.

### SCHEMA-040 — 동적 키는 정적 입력 노드가 아닙니다

patternProperties·스키마 값 additionalProperties에서 자식을 생성하지 않습니다. 동적 맵의 편집은 터미널 값 전체의 입력으로 표현합니다. 동적 검증 규칙으로 노드 생성을 추정하면 검증 방언의 의미를 다시 구현하게 됩니다. 선언되지 않은 값의 보존·방출은 settle이 소유합니다.

### SCHEMA-042 — 가상 이름은 고정 튜플의 신원입니다

같은 호스트의 같은 가상 이름은 fields의 순서까지 같아야 하며, 게이트 배타성과 무관하게 다르면 VIRTUAL_FIELDS_MISMATCH입니다. 순서가 값의 튜플 모양이므로 조각 전환으로 이를 바꾸지 않습니다. 가상 fields는 실제 형제에 결합하고 required를 재작성하지 않습니다.

### owned-inline-public — 생성 값만 보호합니다

생산자가 만든 유효 스키마·schemaType 배열·공유 게이트·게이트 소유 appliesWhen은 두 모드에서 보호합니다. 작성 스키마·중첩 default·불투명 renderer 값은 빌린 참조이므로 동결하지 않습니다. 한 폼의 변조가 공유 청사진의 다른 폼으로 새는 것을 막되 소비자 값의 수명은 침범하지 않습니다.

### owned-inline-memberships — 기록별 소속 배열

선언·조각·바인딩은 각자 소속 배열을 소유하고 내부 기록은 개발 모드에서만 동결합니다. 게이트별 evaluationReads는 참조가 증거이므로 별도 배열로 두며 일반 불변 빈 결과와 혼용하지 않습니다. 공개 공유 값의 보호를 유지하면서 완료 그래프 재순회 비용을 피합니다.

## Last Updated

선언 순서·허용 형·전략·판별자·재귀·예약 언어·값 소유권이 바뀔 때 갱신합니다.
