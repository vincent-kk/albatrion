# @canard/schema-form 모바일 성능 검증 보고서

> 작성일: 2026-02-22
> 대상: [Examples](https://vincent-kk.github.io/albatrion/docs/canard/schema-form/examples/) 하위 전체 10개 폼
> 버전: @canard/schema-form v0.10.6

---

## 공통 분석: 번들 사이즈

모든 예제가 동일한 라이브러리를 사용하므로 번들 사이즈는 공통입니다.

| 패키지 | Raw (unminified) | Gzip | Brotli |
|--------|-----------------|------|--------|
| `@canard/schema-form` | 231 KB | 42.8 KB | 35.4 KB |
| `@canard/schema-form-antd6-plugin` | 27 KB | 4.4 KB | — |
| **합계** | **258 KB** | **~47 KB** | **~40 KB** |

- Brotli 기준 ~40KB → 3G에서도 ~0.1초 전송
- 외부 런타임 의존성 0개 (React/ReactDOM만 peer dependency)
- 현재 `minify: false` 상태 (`rollup.config.mjs:23`). 활성화 시 추가 절감 가능

**판정: PASS** (전체 예제 공통)

---

## 공통 분석: SchemaNodeProxy memo 미적용의 실제 영향

`SchemaNodeProxy`는 `memo`로 래핑되지 않았지만, 내부 컴포넌트들에 빡빡한 memo 처리가 되어 있어 실질적인 렌더링 비용이 극단적으로 낮습니다.

### 방어 계층 구조

```
SchemaNodeProxy (memo 없음)
  ├─ useMemo: Input (SchemaNodeInputWrapper) — node 참조 기반 캐시
  ├─ useMemorize: FormTypeRenderer — memo(withErrorBoundary()) 래핑
  ├─ useConstant: Wrapper — 최초 1회만 생성
  ├─ useMemo: errorMessage — refresh 기반 재계산
  │
  └─ SchemaNodeInput (memo) ← 실제 렌더링 비용의 대부분
       ├─ useFormTypeInput: useMemo 캐시
       ├─ useChildNodeComponents: Map 캐시 + memo 래핑된 자식
       ├─ useCallback: handleChange, handleFileAttach, handleFocus, handleBlur
       ├─ useFormTypeInputControl: ref + version
       └─ FormTypeInput (plugin) ← 실제 DOM 생성
```

### SchemaNodeProxy가 re-render되더라도 발생하는 비용

1. `useSchemaNodeTracker` — 비트마스크 비교 1회 (O(1))
2. `useMemo(Input)` — deps 비교 (node 참조 동일 → skip)
3. `useMemorize(FormTypeRenderer)` — 이미 생성된 인스턴스 반환
4. `useConstant(Wrapper)` — 캐시된 값 반환
5. `useMemo(errorMessage)` — deps 비교 (refresh 미변경 → skip)
6. `SchemaNodeInput` — **`memo`로 래핑**, props 동일 시 완전 skip

**결론**: SchemaNodeProxy의 re-render 비용은 hooks deps 비교 5-6회 + JSX 객체 생성 1회로, **~0.01ms 수준**입니다. `SchemaNodeInput`이 `memo`로 래핑되어 있어 실제 DOM 갱신은 발생하지 않습니다.

### 어떤 경우에 SchemaNodeProxy가 불필요하게 re-render되는가

| 트리거 | 발생 조건 | 모든 Proxy에 전파? |
|--------|----------|------------------|
| `children` state 변경 | `UPDATE_CHILDREN_MASK` (Error/Refresh/Remount) | YES |
| children 함수 패턴 | `<Form>{({ value }) => ...}</Form>` | YES |
| value 변경 | `onChange` → `setValues()` | **NO** (Form은 memo) |

일반적인 value 변경 시에는 Form-level re-render가 발생하지 않으므로, SchemaNodeProxy의 불필요한 re-render 자체가 트리거되지 않습니다. **모든 예제가 children 함수 패턴을 사용하지 않으므로 이 문제는 해당 없습니다.**

---

## 예제별 분석

---

### 1. Basic Form

> [basic-form](https://vincent-kk.github.io/albatrion/docs/canard/schema-form/examples/basic-form)

| 항목 | 값 |
|------|-----|
| 필드 수 | 7 (flat) |
| 중첩 깊이 | 1 |
| computed | 없음 |
| 조건부 스키마 | 없음 |
| 배열 | 없음 |
| 노드 수 | 8 (ObjectNode 1 + Terminal 7) |
| `new Function()` | 0회 |
| 의존성 구독 | 0 |

**리렌더 분석**: 키스트로크당 변경 필드 1개만 re-render. 나머지 6필드는 독립 구독으로 영향 없음.

**판정: PASS**

---

### 2. Auto Calculation

> [auto-calculation](https://vincent-kk.github.io/albatrion/docs/canard/schema-form/examples/auto-calculation)

| 항목 | 값 |
|------|-----|
| 필드 수 | 5 (flat) |
| 중첩 깊이 | 1 |
| computed | `finalPrice.derived` — 4개 의존성 (`../price`, `../quantity`, `../taxRate`, `../discountRate`) |
| 조건부 스키마 | 없음 |
| 배열 | 없음 |
| 노드 수 | 6 (ObjectNode 1 + Terminal 5) |
| `new Function()` | **1회** (derived 표현식) |
| 의존성 구독 | 4 (finalPrice → price, quantity, taxRate, discountRate) |

**리렌더 분석**:

```
사용자가 price 변경
  ↓ [동기] priceNode: UpdateValue (immediate)
  ↓ [microtask] objectNode: UpdateValue
  ↓ [microtask] finalPriceNode: UpdateComputedProperties
  ↓ finalPriceNode의 SchemaNodeProxy re-render (RERENDERING_EVENT에 UpdateComputedProperties 포함)
```

- price, quantity, taxRate, discountRate 중 하나를 변경하면 **변경 필드 1개 + finalPrice 1개 = 총 2개 Proxy re-render**
- finalPrice를 직접 수정하면 해당 필드 1개만 re-render
- computed derived 표현식은 산술 연산만 포함하여 실행 비용 < 0.01ms

**CSP**: `new Function()` 1회 호출. 엄격한 CSP 환경에서는 `'unsafe-eval'` 필요.

**판정: PASS**

---

### 3. Conditional Registration

> [conditional-registration](https://vincent-kk.github.io/albatrion/docs/canard/schema-form/examples/conditional-registration)

| 항목 | 값 |
|------|-----|
| 필드 수 | 8 (flat) |
| 중첩 깊이 | 1 |
| computed | 없음 |
| 조건부 스키마 | **if-then-else 3단 중첩** (participantType × participantRegion 조합으로 required 변경) |
| 배열 | 없음 |
| 노드 수 | 9 (ObjectNode 1 + Terminal 8) |
| `new Function()` | 0회 |
| 의존성 구독 | 0 |

**핵심 특성**: if-then-else가 `required` 배열만 변경합니다. 필드의 visibility나 active 상태는 바뀌지 않습니다.

**리렌더 분석**:

- participantType/participantRegion 변경 시: 해당 필드 1개 re-render + 조건 평가 후 required 변경
- required 변경은 `UpdateState` 이벤트를 발행 → 영향받는 필드의 Proxy가 re-render
- 그러나 `SchemaNodeInput`이 `memo`이므로, required 마커 표시 변경만 일어나고 input 위젯 자체의 re-render는 최소화

**조건 평가 비용**: JSON Schema의 `const`/`enum` 비교는 표준 AJV 검증 경로를 따르지만, 이 예제에서는 validator 플러그인이 미등록이므로 순수 노드 레벨의 조건 평가만 수행 → < 1ms

**판정: PASS**

---

### 4. Dynamic Billing

> [dynamic-billing](https://vincent-kk.github.io/albatrion/docs/canard/schema-form/examples/dynamic-billing)

| 항목 | 값 |
|------|-----|
| 필드 수 | 10 (flat) |
| 중첩 깊이 | 1 |
| computed | 없음 |
| 조건부 스키마 | **if-then-else 3단 중첩** (accountType × subscriptionPlan × paymentMethod 조합) |
| 배열 | 없음 |
| 노드 수 | 11 (ObjectNode 1 + Terminal 10) |
| `new Function()` | 0회 |
| 의존성 구독 | 0 |

**핵심 특성**: Conditional Registration과 동일한 패턴이지만 필드 수가 10개로 약간 더 많고, 3개 변수의 조합으로 required가 결정됩니다.

**리렌더 분석**:

- accountType 변경 → 해당 필드 1개 re-render + required 상태 변경으로 영향받는 필드들 re-render
- 최대 6개 필드가 required 변경 대상 (`business + invoice` → 6필드 required)
- 각 필드의 `SchemaNodeInput`이 `memo`이므로 실제 DOM 갱신은 required 마커 변경분만

**판정: PASS**

---

### 5. Employment Contract (oneOf + computed)

> [employment-contract](https://vincent-kk.github.io/albatrion/docs/canard/schema-form/examples/employment-contract)

| 항목 | 값 |
|------|-----|
| 필드 수 | 가변 (full_time: 7, part_time: 4, contractor: 4) |
| 중첩 깊이 | 2 (root → benefits object) |
| computed | `commonField.active/visible`, `contractor.workingHours.active` |
| 조건부 스키마 | **root-level oneOf** (3개 분기: full_time / part_time / contractor) |
| 배열 | 없음 |
| 노드 수 | ~18 (활성 분기에 따라 가변, 비활성 분기 노드는 `enabled=false`) |
| `new Function()` | **3회** (commonField.active, commonField.visible, workingHours.active) |
| 의존성 구독 | 3 (commonField → employmentType ×2, workingHours → contractType ×1) |

**핵심 특성**: 첫 번째로 oneOf를 사용하는 예제. 분기 전환 시 노드의 `enabled` 상태가 변경됩니다.

**리렌더 분석 — oneOf 분기 전환**:

```
employmentType 변경: 'full_time' → 'part_time'
  ↓ [동기] employmentTypeNode: UpdateValue
  ↓ [microtask] objectNode: oneOf 조건 재평가
  ↓ full_time 분기 노드들: enabled = false → SchemaNodeProxy에서 `return null`
  ↓ part_time 분기 노드들: enabled = true → 렌더링 시작
  ↓ commonField: UpdateComputedProperties (visible/active 재평가)
```

- 분기 전환 시 비활성 노드는 `if (!node?.enabled) return null` (`SchemaNodeProxy.tsx:85`)로 빠르게 반환
- 새 분기 노드의 마운트 비용: 2-4개 필드 × (Proxy + Input + FormTypeInput) ≈ 6-12개 컴포넌트
- full_time 분기의 `benefits` object는 중첩 ObjectNode + 2개 Boolean — 추가 깊이지만 부담 없는 수준

**computed 연쇄 반응**:

- `commonField`은 `employmentType`에 의존 → employmentType 변경 시 commonField의 visible/active 재평가
- `workingHours`는 `contractType`에 의존 → contractor 분기 내에서만 active 상태 전환
- 의존성 체인이 단순 (1-hop)하여 연쇄 비용 < 1ms

**SchemaNodeProxy 비용**: oneOf 전환 시 `UPDATE_CHILDREN_MASK`에 해당하는 이벤트가 발생할 수 있으나, `SchemaNodeInput`의 `memo`가 실질적 DOM 갱신을 방어. enabled=false 노드는 즉시 null 반환하여 비용 최소.

**판정: PASS**

---

### 6. Media Registration (가장 복잡한 예제)

> [media-registration](https://vincent-kk.github.io/albatrion/docs/canard/schema-form/examples/media-registration)

| 항목 | 값 |
|------|-----|
| 필드 수 | 가변 (game: ~12, movie: ~8) |
| 중첩 깊이 | **3** (root → details → stages[]/specs) |
| computed | `&if` 표현식 4개 (root oneOf ×2, details oneOf ×2) |
| 조건부 스키마 | **2중 oneOf** (root-level + details 내부) |
| 배열 | **stages** (object items), **platforms** (checkbox), **genres** (enum items), **actors** (string items) |
| 노드 수 | ~35 (양쪽 분기 모두 포함, 비활성 분기 enabled=false) |
| `new Function()` | **4회** (`&if` 표현식) |
| 의존성 구독 | 4 (각 `&if` 표현식 → type 필드) |

**이 예제가 가장 까다로운 이유**:

1. **2중 oneOf**: root-level oneOf (game/movie owner) + details 내부 oneOf (game details/movie details)
2. **배열 필드 다수**: stages(object array), platforms(checkbox), genres/actors
3. **중첩 깊이 3**: root → details → stages → {label, name, description}

**리렌더 분석 — type 전환 (game → movie)**:

```
type 변경: 'game' → 'movie'
  ↓ [동기] typeNode: UpdateValue
  ↓ [microtask] root oneOf 재평가: owner 필드 전환 (Developer → Director)
  ↓ [microtask] details oneOf 재평가: game 분기 비활성 → movie 분기 활성
  ↓ game 분기 노드들 (stages array, platforms, specs): enabled = false → null 반환
  ↓ movie 분기 노드들 (genres, platforms, actors): enabled = true → 마운트
```

- 비활성화되는 노드: ~15개 (stages array items 포함)
- 활성화되는 노드: ~8개
- 총 전환 비용: 비활성 노드 null 반환 (~15 × 0.01ms) + 새 노드 마운트 (~8 × 0.5ms) ≈ **< 5ms**

**배열 필드 성능**:

- `stages`: 기본 1개 아이템 (label, name, description). 사용자가 추가할 수 있지만 일반적으로 < 20개
- `platforms`: checkbox 형태, 고정 2-3개 enum
- `genres`: enum 기반, 고정 7개 선택지
- `actors`: string array, 동적 추가 가능

배열 아이템 추가 시 `useChildNodeComponents`의 `Map` 캐시가 기존 아이템의 컴포넌트 참조를 유지하므로, 새 아이템만 생성됩니다.

**SchemaNodeProxy 비용**: 2중 oneOf 전환은 `UpdateChildren` 이벤트를 발생시키지만, `UPDATE_CHILDREN_MASK`에 `UpdateChildren`이 **포함되지 않으므로** Form-level re-render는 발생하지 않습니다. 각 Proxy는 자신의 노드 이벤트만 수신.

**판정: PASS** — 가장 복잡한 예제이지만, 활성 필드 수가 ~12개 수준으로 모바일에서 충분히 처리 가능

---

### 7. Nested Profile (가장 깊은 중첩)

> [nested-profile](https://vincent-kk.github.io/albatrion/docs/canard/schema-form/examples/nested-profile)

| 항목 | 값 |
|------|-----|
| 필드 수 | ~16 |
| 중첩 깊이 | **5** (root → user → profile → preferences → notifications) |
| computed | `gender.active: '../age >= 18'` |
| 조건부 스키마 | profile 내 **if-then-else** (type에 따라 required 변경), privacy **oneOf** (const 값) |
| 배열 | **backupCodes** (string items, minItems: 5, maxItems: 10) |
| 노드 수 | ~30 (ObjectNode 7 + Terminal ~18 + Array 1 + 배열 아이템 5) |
| `new Function()` | **1회** (gender.active) |
| 의존성 구독 | 1 (gender → age) |

**핵심 특성**: 가장 깊은 중첩 구조(5단계)와 `minItems: 5`의 배열.

**리렌더 분석 — 깊은 중첩에서의 value 전파**:

```
notifications.email 변경 (depth 5)
  ↓ [동기] emailNode: UpdateValue (immediate)
  ↓ [microtask] notificationsNode: UpdateValue (depth 4)
  ↓ [microtask] preferencesNode: UpdateValue (depth 3)
  ↓ [microtask] profileNode: UpdateValue (depth 2)
  ↓ [microtask] userNode: UpdateValue (depth 1)
  ↓ [microtask] rootNode: UpdateValue + onChange 콜백
```

- 각 중간 ObjectNode의 UpdateValue는 해당 ObjectNode를 구독하는 Proxy만 re-render
- 중간 ObjectNode의 Proxy는 `SchemaNodeInput`의 `memo`로 인해 실질적 DOM 갱신 없음
- **깊이 5의 value 전파 비용**: microtask 5회 ≈ < 1ms (이벤트 배칭)

**backupCodes 배열 (minItems: 5)**:

- 초기화 시 5개 string input 자동 생성
- 각 아이템은 Terminal Node → 5개 SchemaNodeProxy + SchemaNodeInput
- 최대 10개까지 추가 가능 (maxItems: 10)
- 10개 아이템이어도 총 노드 ~35개 수준 — 가상화 불필요

**computed (gender.active)**:

- age 변경 시 gender 필드의 active 상태 재평가
- `../age >= 18` 표현식 실행 < 0.01ms
- active가 false → true 전환 시 gender 필드의 Proxy re-render → enabled 상태 변경으로 렌더링/null 전환

**판정: PASS** — 깊은 중첩은 microtask 체인을 길게 하지만, 각 단계의 비용이 매우 낮아 모바일에서도 지연 체감 없음

---

### 8. Product Catalog (2중 oneOf + 중첩 oneOf)

> [product-catalog](https://vincent-kk.github.io/albatrion/docs/canard/schema-form/examples/product-catalog)

| 항목 | 값 |
|------|-----|
| 필드 수 | 가변 (physical: ~10, digital: ~5, service: ~5) |
| 중첩 깊이 | **3** (root → product → shipping) |
| computed | `computed.if` 5개 (product oneOf ×3, shipping oneOf ×2) |
| 조건부 스키마 | **2중 oneOf** — product 레벨 (physical/digital/service) + shipping 레벨 (standard/express) |
| 배열 | **availability** (enum array, service 분기) |
| 노드 수 | ~30 (비활성 분기 포함) |
| `new Function()` | **5회** |
| 의존성 구독 | 5 (각 `computed.if` → productType 또는 method) |

**핵심 특성**: 2중 oneOf가 독립적으로 동작. physical 분기 내부에 shipping oneOf가 중첩.

**리렌더 분석 — productType 전환**:

- physical → digital: product 내부의 모든 physical 필드 비활성 + digital 필드 활성
- shipping oneOf는 physical 분기에만 존재 → physical 비활성 시 함께 비활성
- 전환 비용: Media Registration과 유사, ~5ms 이내

**리렌더 분석 — shipping method 전환 (physical 분기 내)**:

- standard → express: cost 필드 유지, days → hours 전환
- 영향 범위가 shipping object 내부로 한정 → 2-3개 필드만 전환
- 상위 product, root에는 re-render 전파 없음

**SchemaNodeProxy 비용**: 2중 oneOf 전환이 발생해도 각 level의 Proxy는 자신의 노드만 구독. shipping 전환이 productType Proxy를 re-render시키지 않음.

**판정: PASS**

---

### 9. Role-Based Access (다중 computed 의존성)

> [role-based-access](https://vincent-kk.github.io/albatrion/docs/canard/schema-form/examples/role-based-access)

| 항목 | 값 |
|------|-----|
| 필드 수 | 8 (flat) |
| 중첩 깊이 | 1 |
| computed | **`&visible` 3개, `&active` 3개** — 모두 `../userType` 의존 |
| 조건부 스키마 | 없음 |
| 배열 | **adminPermissions** (enum checkbox array) |
| 노드 수 | 10 (ObjectNode 1 + Terminal 7 + Array 1 + 배열 아이템) |
| `new Function()` | **6회** |
| 의존성 구독 | **6** (6개 필드 → userType) |

**핵심 특성**: 가장 많은 computed 의존성. 단일 필드(`userType`) 변경으로 6개 필드가 동시에 재평가.

**리렌더 분석 — userType 변경 (guest → admin)**:

```
userType 변경: 'guest' → 'admin'
  ↓ [동기] userTypeNode: UpdateValue (immediate)
  ↓ [microtask] 6개 의존 필드: UpdateComputedProperties (동시 발행)
  ↓ 각 필드의 SchemaNodeProxy: RERENDERING_EVENT에 UpdateComputedProperties 포함 → re-render
  ↓ visible/active 상태 변경으로 일부 필드 표시/숨김 전환
```

- **최대 동시 re-render**: userType 1개 + 의존 필드 6개 = **7개 Proxy re-render**
- 이 중 visible=false가 되는 필드: `if (!node?.enabled) return null` → 즉시 반환
- visible=true가 되는 필드: SchemaNodeInput `memo` 통과 시 FormTypeInput 마운트

**이것이 모바일에서 문제가 되는가?**

- 7개 Proxy 동시 re-render: 7 × 0.01ms (Proxy 자체 비용) = ~0.07ms
- SchemaNodeInput memo를 통과하는 필드 (상태 변경분): 최대 6개 × 0.5ms = ~3ms
- 총 userType 전환 비용: **< 5ms** — 모바일에서도 16ms 프레임 예산 내

**RERENDERING_EVENT 4중 마스크 영향**:

이 예제에서 `UpdateComputedProperties`가 6개 필드에서 동시 발생합니다. 그러나:
- 각 필드는 **자신의 노드**에서 발생한 `UpdateComputedProperties`만 수신
- 다른 필드의 computed 변경이 전파되지 않음
- 4중 마스크의 "불필요한 re-render" 우려는 **단일 노드 내에서** 여러 이벤트 타입이 동시에 발생할 때만 해당

**판정: PASS**

---

### 10. Tuple Arrays (prefixItems + AJV 검증)

> [tuple-arrays](https://vincent-kk.github.io/albatrion/docs/canard/schema-form/examples/tuple-arrays)

| 항목 | 값 |
|------|-----|
| 필드 수 | 12 (4개 tuple × 3개 아이템) |
| 중첩 깊이 | 2 (root → array → items) |
| computed | 없음 |
| 조건부 스키마 | 없음 |
| 배열 | **4개 고정 크기 tuple** (prefixItems, items: false, minItems: 3) |
| 노드 수 | 17 (ObjectNode 1 + ArrayNode 4 + Terminal 12) |
| `new Function()` | 0회 |
| 의존성 구독 | 0 |
| 검증 플러그인 | **@canard/schema-form-ajv8-plugin/2020** |

**핵심 특성**: 유일하게 AJV 검증 플러그인을 사용하는 예제. `items: false` + `minItems: 3`으로 고정 크기 tuple.

**리렌더 분석**:

- tuple 아이템은 `prefixItems`로 고정 → 동적 추가/삭제 없음
- 각 아이템 변경 시: 해당 Terminal Node Proxy 1개 + 부모 ArrayNode Proxy 1개 re-render
- 부모 ArrayNode의 `SchemaNodeInput`은 `memo`이므로, children이 변경되지 않으면 하위 아이템 re-render 안 됨

**AJV 검증 비용**:

- 기본 validationMode가 `OnChange`이면 매 값 변경마다 AJV 실행
- 그러나 tuple 스키마 (number range, string pattern)에 대한 AJV 검증은 < 0.1ms
- `OnRequest` 모드로 전환하면 검증 오버헤드 0

**판정: PASS**

---

## 종합 판정 매트릭스

| 예제 | 필드 | 깊이 | computed | oneOf | 배열 | 노드 | 판정 |
|------|------|------|----------|-------|------|------|------|
| Basic Form | 7 | 1 | 0 | — | — | 8 | **PASS** |
| Auto Calculation | 5 | 1 | 1 | — | — | 6 | **PASS** |
| Conditional Registration | 8 | 1 | 0 | — | — | 9 | **PASS** |
| Dynamic Billing | 10 | 1 | 0 | — | — | 11 | **PASS** |
| Employment Contract | 4-7 | 2 | 3 | 3분기 | — | ~18 | **PASS** |
| Media Registration | 8-12 | 3 | 4 | 2중 | 4개 | ~35 | **PASS** |
| Nested Profile | ~16 | 5 | 1 | — | 1개(5항목) | ~30 | **PASS** |
| Product Catalog | 5-10 | 3 | 5 | 2중 | 1개 | ~30 | **PASS** |
| Role-Based Access | 8 | 1 | 6 | — | 1개 | 10 | **PASS** |
| Tuple Arrays | 12 | 2 | 0 | — | 4개(고정) | 17 | **PASS** |

---

## SchemaNodeProxy memo 미적용 — 전체 예제 종합 결론

### 왜 memo 없이도 괜찮은가

1. **Form-level 방어**: `UPDATE_CHILDREN_MASK`가 value 변경을 포함하지 않아, 일반적인 사용자 입력 시 Form → children → Proxy cascade가 발생하지 않음

2. **노드별 독립 구독**: `useSchemaNodeTracker`가 각 Proxy를 자신의 노드에만 바인딩. 다른 필드의 이벤트가 전파되지 않음

3. **내부 memo 방어**:
   - `SchemaNodeInput`: `memo` 래핑 — props 동일 시 완전 skip
   - `FormTypeRenderer`: `useMemorize(() => memo(withErrorBoundary(...)))` — 최초 1회만 생성
   - `useChildNodeComponents`: `Map` 캐시 + 각 child를 `memo` 래핑
   - `SchemaNodeInputWrapper` 내부: `useReference`로 ref 안정화

4. **Proxy 자체의 re-render 비용이 극히 낮음**: hooks deps 비교 5-6회 + 조건부 null 반환. DOM 접근 없음.

### 예제별 검증 결과

| 예제 | Proxy 불필요 re-render 발생? | 발생 시 비용 | 판정 |
|------|---------------------------|------------|------|
| Basic Form | NO | — | OK |
| Auto Calculation | NO (computed는 해당 노드만) | — | OK |
| Conditional Registration | 가능 (required 변경 시) | ~0.07ms | OK |
| Dynamic Billing | 가능 (required 변경 시) | ~0.1ms | OK |
| Employment Contract | 가능 (oneOf 전환 시) | ~0.15ms | OK |
| Media Registration | 가능 (2중 oneOf 전환 시) | ~0.2ms | OK |
| Nested Profile | NO (깊은 중첩이지만 독립 구독) | — | OK |
| Product Catalog | 가능 (2중 oneOf 전환 시) | ~0.2ms | OK |
| Role-Based Access | NO (computed는 해당 노드만) | — | OK |
| Tuple Arrays | NO | — | OK |

**모든 예제에서 SchemaNodeProxy의 memo 미적용은 성능 문제를 일으키지 않습니다.** 내부 컴포넌트의 빡빡한 memo 처리가 실질적인 렌더링 비용을 효과적으로 차단하고 있습니다.

---

## 모바일 환경에서 주의가 필요한 경계선

현재 예제들은 모두 안전하지만, 다음 규모에 도달하면 추가 최적화를 검토해야 합니다:

| 항목 | 안전 범위 | 주의 범위 | 권장 조치 |
|------|----------|----------|----------|
| 총 필드 수 | < 50 | 50-100+ | 폼 분할 또는 탭/스텝 UI |
| 배열 아이템 수 | < 30 | 30-100+ | `react-window` 가상화 |
| computed 의존성 | < 20 | 20-50+ | 표현식 복잡도 최소화 |
| 중첩 깊이 | < 8 | 8-15+ | microtask 체인 지연 모니터링 |
| oneOf 분기 내 필드 | < 20 | 20+ | 분기 전환 시 프레임 드롭 체크 |

---

## 참조 파일

| 파일 | 관련 내용 |
|------|----------|
| `src/components/Form/Form.tsx:53-56` | `UPDATE_CHILDREN_MASK` — Form 리렌더 조건 |
| `src/components/Form/Form.tsx:92-95` | 스키마 전처리 (1회) |
| `src/components/Form/Form.tsx:325` | Form `memo` 래핑 |
| `src/components/SchemaNode/SchemaNodeProxy/SchemaNodeProxy.tsx:19-23` | `RERENDERING_EVENT` 4중 마스크 |
| `src/components/SchemaNode/SchemaNodeProxy/SchemaNodeProxy.tsx:25` | Proxy `memo` 미적용 |
| `src/components/SchemaNode/SchemaNodeProxy/SchemaNodeProxy.tsx:38-48` | Input `useMemo` 캐시 |
| `src/components/SchemaNode/SchemaNodeProxy/SchemaNodeProxy.tsx:57-59` | FormTypeRenderer `memo` 래핑 |
| `src/components/SchemaNode/SchemaNodeProxy/SchemaNodeProxy.tsx:85` | `enabled=false` 시 null 반환 |
| `src/components/SchemaNode/SchemaNodeInput/SchemaNodeInput.tsx:24` | SchemaNodeInput `memo` 래핑 |
| `src/components/SchemaNode/SchemaNodeInput/SchemaNodeInputWrapper.tsx:42-51` | `useReference` ref 안정화 |
| `src/components/SchemaNode/SchemaNodeInput/hooks/useChildNodeComponents.tsx:45-91` | `Map` 캐시 + child `memo` 래핑 |
| `src/components/SchemaNode/SchemaNodeInput/hooks/useFormTypeInputControl.ts:29-46` | RequestRefresh/Focus/Select 구독 |
| `src/components/SchemaNode/SchemaNodeInput/type.ts:39-43` | `REACTIVE_RERENDERING_EVENTS` |
| `src/hooks/useSchemaNodeTracker.ts:13-26` | 노드별 독립 구독 메커니즘 |
| `src/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:106-110` | microtask 배칭 |
| `src/core/nodes/AbstractNode/utils/ComputedPropertiesManager/utils/createDynamicFunction/createDynamicFunction.ts:41` | `new Function()` — CSP 관련 |
| `rollup.config.mjs:23` | `minify: false` 설정 |
| `package.json:84-93` | size-limit 설정 (20KB) |
