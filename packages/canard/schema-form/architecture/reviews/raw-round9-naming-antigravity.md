# 9라운드 원문 — 이름 추천 (cennad antigravity, tier high)

편집자 주: 같은 요청문(`round-9-spec.md` §3.3의 여섯 항목 N-a–N-f)을 세 곳에 보냈다. 이것은 antigravity의 답 원문이며 편집자는 고치지 않았다.

---

## N-a. `computed`를 대체할 컨테이너 명칭

1. **`control`** (1순위) — 값 조작과 UI 제어를 포괄하는 레이어의 단일 책임을 가장 직관적으로 드러내며 군더더기가 없음. 미러링: 스키마 레벨 제어 속성군(`readOnly`, `disabled`), React Hook Form류의 `control` 객체.
2. **`directives`** (2순위) — 정적 유효성 검증(Schema)과 대비되는 동적 실행 계층(지시어)의 의미를 전달. 미러링: GraphQL, Vue 등의 지시어 확장 관례.
3. **`formControl`** (3순위) — 표준 JSON Schema 키워드와 네임스페이스를 완전히 분리. 미러링: 기존 `formTypeInput`(`form*` 접두사 네임스페이스).

## N-b. `&pristine` 대체 명칭 (표현식이 참일 때 값을 비움)

1. **`&clearWhen`** (1순위) — 조건이 참이 되는 순간 값을 소거한다는 단일 트리거 책임을 명확히 전달. 미러링: `&injectTo`(동작 지향 키워드).
2. **`&cleared`** (2순위) — 상태 형용사/수동태 형태로 다른 상태 키들과 형태론적 일관성 유지. 미러링: `&disabled`, `&derived`, `&active`.
3. **`&resetWhen`** (3순위) — 폼 필드를 초기 빈 상태로 되돌린다는 친숙한 폼 용어. 미러링: Form 인스턴스 메서드 `reset()`.

## N-c. 로드 시 자동 쓰기를 끄는 비트마스크 플래그 쌍 및 Form prop

1. **`SetValueOption.DisableAutomaticWrites` / `EnableAutomaticWrites`, prop `disableAutomaticWrites`** (1순위) — 축약 없이 `&default`, `&derived`, `&injectTo` 전체를 정확히 포괄하며 `SetValueOption.Overwrite | SetValueOption.DisableAutomaticWrites` 형태로 자연스럽게 읽힘. 미러링: `SetValueOption.Overwrite`, `Merge`.
2. **`DisableControlWrites` / `EnableControlWrites`, prop `disableControlWrites`** (2순위) — N-a의 `control` 컨테이너 명칭과 직접 결합.
3. **`DisableAutomaticValues` / `EnableAutomaticValues`, prop `disableAutomaticValues`** (3순위) — 기존 `DisableSchemaDefaults`와 가장 근접한 포괄적 표현.

## N-d. 프래그먼트 레벨 게이트(`&if`) 유지 여부

1. **`&active`로 통일** (1순위) — 노드 레벨과 프래그먼트 레벨은 스코프만 다를 뿐 "조건 불일치 시 숨김+값 제거"라는 동일 메커니즘이므로 이름을 일원화. 미러링: 노드 레벨 `&active`.
2. **`&if` 유지** (2순위) — JSON Schema 표준 `if`/`then`/`else`, `oneOf` 브랜치와의 시각적 대칭성 보존.
3. **`&matchWhen`** (3순위) — 표준 `if`의 검증 시맨틱과 완전 분리, 조건부 활성화를 서술적으로 표현. 미러링: `&clearWhen`, `&visible`.

## N-e. 부모의 자식 세트 일괄 제어 — 구문 3안

1. **속성 중심 매핑 `'&childControls': { readOnly: { targets: [...], expression: '...' }, disabled: {...} }`** — 단일 속성 모델(`readOnly`)과 대칭적이지만 동일 타깃에 여러 제어를 걸 때 `targets`가 중복됨.
2. **타깃 중심 룰 배열 `'&childRules': [{ targets: [...], readOnly: '...', disabled: '...' }]`** — 같은 타깃 그룹에 여러 제어를 한 객체로 묶어 간결하지만, 룰 간 타깃이 겹칠 때 우선순위 처리가 필요.
3. **경로/셀렉터 맵 `'&selectors': { 'billingAddress.*': { disabled: '...' }, 'firstName, lastName': { readOnly: '...' } }`** — 와일드카드/중첩 경로로 유연하지만 별도 패턴 파서가 필요해 예측 가능성이 떨어짐.

## N-f. `&default` 대 대안

1. **`&default`** (1순위) — 표준 키워드 `default`에 제어 프리픽스만 부여, 정적 기본값의 동적 확장이라는 설계 철학과 1:1 대칭. 미러링: JSON Schema `default`.
2. **`&fillMissing`** (2순위) — "누락 시에만 채운다"는 책임을 명확히 서술해 `default`/`defaultValue`와의 혼선을 차단.
3. **`&defaultValue`** (3순위) — Form prop 네이밍을 스키마 레벨로 그대로 반영.

## 일관성 검토 (원문 요약)

1순위 조합: 컨테이너 `control`, 키 `&clearWhen`, 플래그 `DisableAutomaticWrites`/prop `disableAutomaticWrites`, 프래그먼트 게이트 `&active`, 자식 일괄 제어 `&childControls`, 기본값 `&default`.

지적된 충돌 두 가지:
- **품사 불일치**: `&active/&visible/&readOnly/&disabled/&default`는 상태 형용사·정적 대칭 명사인 반면 `&clearWhen`은 접속사 포함 동작 트리거 구문. 다만 기존 `&injectTo`도 동사구 형태이므로, "상태 투영 키" 그룹과 "사이드이펙트/트리거 키" 그룹 두 범주로 나누어 수용 가능하다고 평가.
- **포괄 범위 불일치**: `DisableAutomaticWrites`는 `&default`까지 포괄하지만, 개발자 멘탈모델상 `&default`는 "누락 값 폴백 채움"으로 인식되는 경향이 있어 `Overwrite`와 같은 "쓰기(Write)" 범주로 묶일 때 미세한 어휘적 간극이 있을 수 있음(기능적으로는 정확).
- 반대로 `control` 컨테이너와 `&childControls`는 같은 어근을 공유해 일관성이 좋다고 평가.
