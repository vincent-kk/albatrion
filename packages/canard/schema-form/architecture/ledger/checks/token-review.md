# 토큰 검사 잔여 목록의 판정 (2026-09-26, 검증자 판정문 원문)

`node ledger/checks/tokens.mjs check <목록> ledger/*.md`가 남긴 토큰 가운데 설계 값이 아닌 것의 판정이다. (A)는 고침으로 원장에 넣었고, (B)·(C)는 원장이 담지 않아도 되는 까닭과 함께 적는다. 기준 커밋 `ba398c330`, 목록은 `00`–`09`·`adr/`·`open-questions.md`·`README.md`·`HANDOFF.md`의 코드 이름·번호·오류 코드·단위 붙은 수치 2,445개.

# 판정 — 원장에 없는 토큰 279행

Verdict: pass with conditions (고침 6건을 적용하면 통과)

기준: `ledger/README.md` §1·§3·§4. 입력: `/tmp/claude-501/ledger-full/token-missing-review.tsv`(279행). 행마다 원문 줄을 열어 확인했고, (A) 후보는 가리킨 항목을 열어 대조했다.

## 1. 분류별 수

| 분류 | 행 |
| --- | --- |
| (A) 설계값 누락 | 14 |
| (B) 인용·예시·오늘의 코드·철자 차이·대체된 이름 | 182 |
| (C) 이력·과정 | 83 |
| 합계 | 279 |

(A) 14행은 고침 6건으로 묶인다(확인 5건, 개연 1건).

## 2. (A) 고침 명세

형식: 항목 | 칸 | 지금 값 | 바꿀 값 | 근거 path:line

### 고침 1 — 확인. 토큰 `feature/schema-form-redesign`(1행)

우산 브랜치 이름이 정본과 다르다. `00-goals.md:128`#4(1라운드 편집자 문장)는 `feature/schema-form-redesign`, 정본 `08-design-a-to-z.md:551`(14·16라운드)은 `refactor/schema-form-internal-architecture`다. README §1의 4(뒤 라운드가 이긴다)로 08이 정본이다. 실제 작업 브랜치도 `refactor/schema-form-internal-architecture`다. 문장은 `OUT → LANDING`으로 넘겨졌지만 어느 LANDING 항목도 받지 않았다.

- LANDING-051 | 충돌 | (칸 없음) | 다음 두 줄을 `- 까닭:` 줄 뒤에 더한다:
  ```
  - 충돌:
    > `00-goals.md:128`의 "작업은 `feature/schema-form-redesign` 브랜치에 모이고, 이 브랜치가 여러 작업을 병합받는 우산 PR이 된다."는 정본과 다르다(브랜치 이름). 정본이 이긴다(`08-design-a-to-z.md:551`, 뒤 라운드가 앞 라운드를 이긴다).
  ```
  | 근거 `00-goals.md:128`, `08-design-a-to-z.md:551`
- LANDING-051 | 출처 | `` `08-design-a-to-z.md:551`(정본) `` | `` `08-design-a-to-z.md:551`(정본), `00-goals.md:128#4` `` | 근거 `00-goals.md:128`(문장 #1 HISTORY, #2 PROCESS-031, #3 PROCESS-064, #4가 이 문장)

### 고침 2 — 확인. 토큰 `&watch`, `string\|string[]`(47·48행)

`watch`의 값 모양(경로 하나 또는 경로 배열)은 05가 "유지 | 유지"로 새 설계에 남긴 값인데, CONTROLS-032에도 원장 어디에도 `string[]`이 없다.

- CONTROLS-032 | 보충 | 기존 보충 한 줄(`08-design-a-to-z.md:115`) | 기존 줄 뒤에 한 줄 더한다:
  ```
    > "| `&watch` | `string\|string[]`. 명시적 의존 경로 | 유지 | 유지 | `getObservedValuesFactory.ts:29` / `adr/0003:25` |" (`05-before-after.md:44`)
  ```
  | 근거 `05-before-after.md:44`
- CONTROLS-032 | 출처 | `` `adr/0003-group-namespace.md:80,81,93`(정본), `08-design-a-to-z.md:115`, `07-conclusions.md:124` `` | 끝에 `` , `05-before-after.md:44` `` 를 더한다 | 근거 같음

### 고침 3 — 확인. 토큰 `#/path`, `./path`, `../path`, `/path`(69–72행)

05는 식의 참조 형식 넷과 `@`·`#`을 "JSON Pointer 동적 함수 전체 유지"로 남긴다. CONTROLS-048은 "식 시스템 전체"라고만 적고, 원장에 이 형식들이 없다. 식 언어의 세부 명세는 CONTROLS-068(열림)이 따로 다룬다.

- CONTROLS-048 | 보충 | `없음` | 다음으로 바꾼다:
  ```
  - 보충:
    > "| 표현식 문법과 참조 형식 | `#/path`·`./path`·`../path`·`/path`·`@`·`#`를 `new Function`으로 컴파일한다 | **JSON Pointer 동적 함수 전체 유지** | 유지 | `ComputedPropertiesManager/utils/regex.ts:84-101`, `createDynamicFunction.ts:41` / `adr/0003:25` |" (`05-before-after.md:57`)
  ```
  | 근거 `05-before-after.md:57`
- CONTROLS-048 | 출처 | `` `adr/0003-group-namespace.md:136`(정본) `` | `` `adr/0003-group-namespace.md:136`(정본), `05-before-after.md:57` `` | 근거 같음

### 고침 4 — 확인. 토큰 `conditionalSchemas`, `derivedValues`, `onChangeNesting`, `'loadedValueDropped'`(161–164행)

ERROR-062(대체됨)는 "`exceededBudget` 다섯 값"을 결정으로 들지만 다섯 이름을 싣지 않는다. 이름은 06의 모양 블록 `06-conclusions.md:368`에 있다. 이 줄은 코드 블록 안이라 토큰 목록에는 06:373 줄로만 잡혔다. 같은 항목의 `status` 새 값 후보 `'loadedValueDropped'`(06:374)도 빠졌다. 06:374는 이미 출처에 있다.

- ERROR-062 | 보충 | 마지막 줄이 `(`adr/0007-settle-cycle.md:11`)` 인용인 다섯 줄 | 마지막 줄 뒤에 두 줄 더한다:
  ```
    > "exceededBudget?: 'conditionalSchemas' | 'derivedValues' | 'transitionDefaults' | 'listenerFeedback' | 'onChangeNesting';" (`06-conclusions.md:368`)
    > "로드 값이 방출에서 빠지는 신호(7절 D-15 실험 뒤)는 예산이 아니므로 `status`의 새 값이 된다. 후보는 `'loadedValueDropped'`." (`06-conclusions.md:374`)
  ```
  | 근거 `06-conclusions.md:368`, `06-conclusions.md:374`
- ERROR-062 | 출처 | `` `06-conclusions.md:362,366-367,374` `` 부분 | `` `06-conclusions.md:362,366-368,374` `` | 근거 같음

### 고침 5 — 확인. 토큰 `onDiagnostic(report)`(165행)

06:375는 ERROR-054(대체됨, `onListenerError`)를 다시 적으며 단일 콜백 이름 후보 `onDiagnostic(report)`를 든다. ERROR-054는 이 줄을 출처로도 보충으로도 들지 않는다.

- ERROR-054 | 보충 | 한 줄(`adr/0008-event-system.md:201`) | 그 뒤에 한 줄 더한다:
  ```
    > "5.4의 결과에 따라 단일 콜백이면 `onDiagnostic(report)`, 분리 콜백이면 `onListenerError`를 더한다." (`06-conclusions.md:375`)
  ```
  | 근거 `06-conclusions.md:375`
- ERROR-054 | 출처 | `` `adr/0014-error-policy.md:309`(정본, "무엇이 바뀌는가" 표의 옛 문장), `adr/0008-event-system.md:7,68,201` `` | 끝에 `` , `06-conclusions.md:375` `` 를 더한다 | 근거 같음

### 고침 6 — 개연. 토큰 `type: 'virtual'`, `type:'virtual'`(61·80행)

10라운드 물음 4는 "`type: 'virtual'`을 값으로 남기는가"였다. 소유자 답 E-4(`reviews/round-10-owner-answers.md:31`, "네, virtual 은 스키마로 선언되는건 아니니까 그냥 둡시다")가 이를 닫았고, NODE-032가 그 답을 닫은 사람으로 든다. 그러나 NODE-032는 `options.virtual`만 적고 `type: 'virtual'`의 거취는 적지 않는다. `05-before-after.md:48`과 `:214`는 이를 "미확인"으로 남겼고, 뒤 문서 어디에도 명시 결정이 없다. 아래 고침은 물음을 원장에 남겨 E-4가 이 값까지 닫았음을 보이게 한다. 답을 "유지"로 읽을지는 해석이 들어가므로, 명시 결정을 원하면 18라운드 안건에 행을 더하는 것이 대안이다. 대안을 고르는 것은 편집자·소유자의 일이다.

- NODE-032 | 보충 | `없음` | 다음으로 바꾼다:
  ```
  - 보충:
    > "`virtual`을 D-6의 참조 그룹 노드로 바꾸고 `type: 'virtual'`을 값으로 남기는가" (`reviews/round-10-spec.md:47`, 소유자 답 E-4가 답한 물음)
  ```
  | 근거 `reviews/round-10-spec.md:47`, `reviews/round-10-owner-answers.md:31`

검증: 고친 뒤 `architecture/`에서 다음을 실행해 문제 0을 본다.
```
node ledger/checks/sup-check.mjs . ledger/*.md
node ledger/checks/ref-check.mjs ledger/*.md
node ledger/checks/tokens.mjs check <목록> ledger/*.md
```
토큰 검사에서 위 14행이 사라져야 한다. 고침 3은 `ComputedPropertiesManager/utils/regex.ts:84-101`·`createDynamicFunction.ts:41`을, 고침 2는 `getObservedValuesFactory.ts:29`를 함께 싣는다(B행 셋이 덤으로 사라진다).

## 3. 두 모양의 판정

**`08-design-a-to-z.md:397`의 diagnostics 모양 — 일치, 충돌 줄 불필요.** 08은 `{ status: 'stable' | 'degraded', cause?: 'budget' | 'expression' | 'injectTarget' | 'sharedConflict', exceededBudget?, iterations?, commit? }`이다. 정본 `adr/0014-error-policy.md:201`(ERROR-034, 분할 조각 ERROR-130·ERROR-131)은 칸 다섯이 같은 순서·같은 선택성이다. 08은 `exceededBudget`의 값 목록 `'hostWheel' | 'derive' | 'transition'`만 생략했다. 같은 문장에서 "모양은 ADR 0014 §5"라고 정본에 넘기므로 다른 값을 적은 것이 아니라 줄임이다. 정본은 채택된 ADR 0014다(README §1의 2). ERROR-034 출처가 이미 `08-design-a-to-z.md:397`을 든다. `value.md:86`의 보충(`cause?, exceededBudget?`)도 같은 줄임이다.

**`08-design-a-to-z.md:359`의 onError 기록 모양 — 일치, 충돌 줄 불필요.** 08은 `{ level, code, message, path?, schemaPath?, details?, error?, aggregate?, surface?, componentStack? }`이다. 정본 `adr/0014-error-policy.md:106-118`(ERROR-017)은 칸 열이 같은 순서·같은 선택성이다. 08의 같은 줄이 `level`을 `'error'`·`'warning'`, `surface`를 `'thrown'`·`'rejected'`·`'sink'`로 적어 정본의 형과 같다. `code`의 `<GROUP>.<SPECIFIC>`·`SCHEMA_FORM_WARNING.<SPECIFIC>`도 같다. 가칭 형 이름 `FormErrorRecord`·`FormErrorCode`는 ERROR-013(`error.md:372`)이 싣는다. ERROR-017 출처가 이미 `08-design-a-to-z.md:359`를 든다.

## 4. 토큰 밖에서 본 것(고침 아님, 보고만)

`05-before-after.md:214`(HISTORY)가 "미확인"으로 남긴 것 가운데 셋은 뒤 문서에도 원장에도 결정이 없다. `RequestEmitChange`·`RequestInjection`의 거취(05:124), 공개 훅 `useChildNodeComponentMap`·`useChildNodeErrors`·`useFormSubmit`의 거취(05:140. REACT-006은 두 훅만 다룬다), `type: 'virtual'`(고침 6)이다. 토큰으로는 오늘의 코드 이름(B)이 맞다. 다만 열림 항목이나 안건 행이 필요한지는 편집자가 정할 일이다.

## 5. (B)·(C) 토큰

- `D1` → C
- `D4` → C
- `D5` → C
- `D6` → C
- `D7` → C
- `D8` → C
- `D9` → C
- `D10` → C
- `if.properties` → B (오늘의 코드·관찰)
- `unevaluatedItems` → B (오늘의 코드·관찰)
- `RequestEmitChange` → B (오늘의 코드·관찰)
- `node.enhancedValue` → B (오늘의 코드·관찰)
- `controls: { discriminator: 'kind' }` → B (예시)
- `controls.active: "./kind === <값>"` → B (예시)
- `setValue(V, Merge)` → B (원장에 다른 철자로 있음)
- `L0` → C
- `L1` → C
- `L2` → C
- `reviews/round-9-derivation.md` → C
- `round-10-derivation.md` → C
- `controls.active: "./kind === 'bank'"` → B (예시)
- `not: {required}` → B (원장에 다른 철자로 있음)
- `B-4` → C
- `{ targets, controls: {...} }` → B (원장에 다른 철자로 있음)
- `13 개` → C
- `flattenConditions.ts:44-97` → B (인용(경로·줄))
- `mergeShowConditions.ts:17-29` → B (인용(경로·줄))
- `adr/0002:34-40,140` → B (인용(경로·줄))
- `flattenConditions.ts:105-121` → B (인용(경로·줄))
- `adr/0002:44` → B (인용(경로·줄))
- `schema.else.if && schema.else.then` → B (오늘의 코드·관찰)
- `flattenConditions.ts:64-65` → B (인용(경로·줄))
- `adr/0002:105` → B (인용(경로·줄))
- `processAllOfSchema.ts:36-44` → B (인용(경로·줄))
- `adr/0002:105-106` → B (인용(경로·줄))
- `{if, then}` → B (원장에 다른 철자로 있음)
- `intersectSchema/utils/constants.ts:61-75` → B (인용(경로·줄))
- `adr/0002:36-38,110` → B (인용(경로·줄))
- `properties[ENHANCED_KEY]: {const: variant}` → B (오늘의 코드·관찰)
- `adr/0002:76-97` → B (인용(경로·줄))
- `adr/0005:112` → B (인용(경로·줄))
- `\| null` → B (오늘의 코드·관찰)
- `adr/0005:58` → B (인용(경로·줄))
- `EventCascadeManager.ts:34,90-116` → B (인용(경로·줄))
- `adr/0008:77` → B (인용(경로·줄))
- `getObservedValuesFactory.ts:29` → B (인용(경로·줄))
- `getDerivedValueFactory.ts:20-22` → B (인용(경로·줄))
- `AbstractNode.ts:545-550` → B (인용(경로·줄))
- `adr/0007:32` → B (인용(경로·줄))
- `adr/0013:41` → B (인용(경로·줄))
- `adr/0013:82` → B (인용(경로·줄))
- `adr/0003:21` → B (인용(경로·줄))
- `adr/0001:39` → B (인용(경로·줄))
- `&x` → B (오늘의 코드·관찰)
- `adr/0003:30` → B (인용(경로·줄))
- `types/jsonSchema.ts:196-211` → B (인용(경로·줄))
- `adr/0011:58-71` → B (인용(경로·줄))
- `useFormTypeInput.ts:76` → B (인용(경로·줄))
- `adr/0003:30-32` → B (인용(경로·줄))
- `adr/0011:54` → B (인용(경로·줄))
- `options.omitEmpty` → B (원장에 다른 철자로 있음)
- `ObjectNode.ts:99,102` → B (인용(경로·줄))
- `03-mental-model.md:12,89` → B (인용(경로·줄))
- `AbstractNode.ts:969` → B (인용(경로·줄))
- `ComputedPropertiesManager/utils/regex.ts:84-101` → B (인용(경로·줄))
- `createDynamicFunction.ts:41` → B (인용(경로·줄))
- `AbstractNode.ts:524-531` → B (인용(경로·줄))
- `ComputedPropertiesManager.ts:204-216` → B (인용(경로·줄))
- `rootJSONSchema[f] ?? jsonSchema[f] ?? computed?.[f] ?? &f` → B (오늘의 코드·관찰)
- `adr/0003:16-19` → B (인용(경로·줄))
- `adr/0001:21` → B (인용(경로·줄))
- `validationMode` → B (오늘의 코드·관찰)
- `adr/0007:74` → B (인용(경로·줄))
- `adr/0008:87-93` → B (인용(경로·줄))
- `D-18` → C
- `adr/0008:147` → B (인용(경로·줄))
- `setValue(value, { mode?, disableDefaultInjection? })` → B (대체·기각된 이름(원장에 대체 항목 있음))
- `adr/0008:70-76` → B (인용(경로·줄))
- `selectBranch` → B (대체·기각된 이름(원장에 대체 항목 있음))
- `D-20` → C
- `latent()` → B (대체·기각된 이름(원장에 대체 항목 있음))
- `adr/0006:80` → B (인용(경로·줄))
- `adr/0013:94` → B (인용(경로·줄))
- `11개` → B (원장에 다른 철자로 있음)
- `:69-74` → B (인용(경로·줄))
- `Q6` → C
- `Replace` → B (대체·기각된 이름(원장에 대체 항목 있음))
- `mode: 'Overwrite'` → B (대체·기각된 이름(원장에 대체 항목 있음))
- `adr/0008:70` → B (인용(경로·줄))
- `adr/0007:77` → B (인용(경로·줄))
- `adr/0013:80` → B (인용(경로·줄))
- `adr/0007:78` → B (인용(경로·줄))
- `node.setValue(input, option = Overwrite)` → B (오늘의 코드·관찰)
- `AbstractNode.ts:355-364` → B (인용(경로·줄))
- `core/types/event.ts:45-96` → B (인용(경로·줄))
- `adr/0008:24-28` → B (인용(경로·줄))
- `RequestInjection` → B (오늘의 코드·관찰)
- `AbstractNode.ts:916,938` → B (인용(경로·줄))
- `adr/0008:34-68` → B (인용(경로·줄))
- `ValidationManager.ts:56-62,121-124` → B (인용(경로·줄))
- `adr/0007:34` → B (인용(경로·줄))
- `adr/0008:84` → B (인용(경로·줄))
- `adr/0008:91` → B (인용(경로·줄))
- `core/types/state.ts:9-16` → B (인용(경로·줄))
- `AbstractNode.ts:490` → B (인용(경로·줄))
- `adr/0007:127` → B (인용(경로·줄))
- `useChildNodeComponentMap` → B (오늘의 코드·관찰)
- `useChildNodeErrors` → B (오늘의 코드·관찰)
- `src/index.ts:78-84` → B (인용(경로·줄))
- `adr/0008:26` → B (인용(경로·줄))
- `adr/0011:71` → B (인용(경로·줄))
- `EventCascadeManager.ts:34,110-116` → B (인용(경로·줄))
- `adr/0005:25-38` → B (인용(경로·줄))
- `adr/0002:110` → B (인용(경로·줄))
- `adr/0002:90` → B (인용(경로·줄))
- `adr/0013:71` → B (인용(경로·줄))
- `3회` → B (예시)
- `flattenConditions.ts:53-97` → B (인용(경로·줄))
- `adr/0002:76-98` → B (인용(경로·줄))
- `BranchStrategy.ts:778` → B (인용(경로·줄))
- `docs/agents/…/expressions.md:116` → B (인용(경로·줄))
- `adr/0002:47-52` → B (인용(경로·줄))
- `adr/0005:33` → B (인용(경로·줄))
- `adr/0002:105-107` → B (인용(경로·줄))
- `stripSchemaExtensions.ts:43-52` → B (인용(경로·줄))
- `if.properties.<key>` → B (오늘의 코드·관찰)
- `if.required` → B (오늘의 코드·관찰)
- `loop-v4c` → C
- `disable…` → B (대체·기각된 이름(원장에 대체 항목 있음))
- `24행` → B (인용(경로·줄))
- `66행` → B (인용(경로·줄))
- `41행` → B (인용(경로·줄))
- `144행` → B (인용(경로·줄))
- `4.4 초` → B (절 번호 뒤 낱말(토큰화 오인))
- `52행` → B (인용(경로·줄))
- `4.7 배` → B (절 번호 뒤 낱말(토큰화 오인))
- `91행` → B (인용(경로·줄))
- `112행` → B (인용(경로·줄))
- `price` → B (예시)
- `54행` → B (인용(경로·줄))
- `76행` → B (인용(경로·줄))
- `quantity` → B (예시)
- `expressions.md` → B (인용(경로·줄))
- `47행` → B (인용(경로·줄))
- `D-29` → C
- `properties < allOf < if/then/else < oneOf/anyOf` → B (원장에 다른 철자로 있음)
- `ResetOptions` → B (오늘의 코드·관찰)
- `& ~X` → B (대체·기각된 이름(원장에 대체 항목 있음))
- `setErrors` → B (대체·기각된 이름(원장에 대체 항목 있음))
- `setSelection` → B (대체·기각된 이름(원장에 대체 항목 있음))
- `setSelectionRange` → B (대체·기각된 이름(원장에 대체 항목 있음))
- `D-36` → C
- `x='A'` → B (예시)
- `x='B'` → B (예시)
- `adr/0007:39·50` → B (인용(경로·줄))
- `adr/0007:137` → B (인용(경로·줄))
- `{a:1, b:1, t:'orig'}` → B (예시)
- `spikes/round9/r9.mjs:165` → B (인용(경로·줄))
- `{ x: 's' }` → B (예시)
- `adr/0002:52` → B (인용(경로·줄))
- `adr/0002:53` → B (인용(경로·줄))
- `intersectSchema/utils/constants.ts:8-20` → B (인용(경로·줄))
- `&active: false` → B (원장에 다른 철자로 있음)
- `findNodes.ts:89-90` → B (인용(경로·줄))
- `reviews/round-10-derivation.md` → C
- `reviews/raw-round10-*.md` → C
- `spikes/round10/` → C
- `kind: {const}` → B (원장에 다른 철자로 있음)
- `control: { readOnly, visible, … }` → B (대체·기각된 이름(원장에 대체 항목 있음))
- `'&children': [{ targets: [...], control: { readOnly: '...', visible: '...' } }]` → B (대체·기각된 이름(원장에 대체 항목 있음))
- `rising` → B (오늘의 코드·관찰)
- `reviews/raw-round9-naming-{antigravity,codex,local}.md` → C
- `../kind` → B (예시)
- `adr/0002:141` → B (인용(경로·줄))
- `active: true` → B (오늘의 코드·관찰)
- `reviews/raw-round11-owner-answers-{claude,antigravity}.md` → C
- `not: { required }` → B (원장에 다른 철자로 있음)
- `status: 'degraded'` → B (원장에 다른 철자로 있음)
- `cause: 'budget'` → B (원장에 다른 철자로 있음)
- `reviews/round-13-owner-review.md:48` → B (인용(경로·줄))
- `{ level, code, message, path?, schemaPath?, details?, error?, aggregate?, surface?, componentStack? }` → B (원장에 다른 철자로 있음)
- `{ status: 'stable' | 'degraded', cause?: 'budget' | 'expression' | 'injectTarget' | 'sharedConflict', exceededBudget?, iterations?, commit? }` → B (원장에 다른 철자로 있음)
- `src/app/plugin/PluginManager.ts:3-11` → B (인용(경로·줄))
- `formTypeInputDefinitions.ts:32·37` → B (인용(경로·줄))
- `formTypeInputMap.ts:32·37` → B (인용(경로·줄))
- `PluginManager.ts:3-11` → B (인용(경로·줄))
- `reviews/raw-round16-{tests,storybook-core,storybook-mirror,landing-review}.md` → C
- `2.4 배` → B (절 번호 뒤 낱말(토큰화 오인))
- `unevaluatedProperties: false` → B (예시)
- `07-conclusions.md:253` → B (인용(경로·줄))
- `4개` → B (원장에 다른 철자로 있음)
- `47개` → B (원장에 다른 철자로 있음)
- `E15` → C
- `if: { properties: { kind: { const: 'a' } } }` → B (예시)
- `Q11` → C
- `R5` → C
- `R4` → C
- `ValidationManager/utils/matchesSchemaPath.ts:33-37` → B (인용(경로·줄))
- `E19` → C
- `8 행` → B (절 번호 뒤 낱말(토큰화 오인))
- `$ref: '#/$defs/…'` → B (예시)
- `processOverwriteFields.ts:15-25` → B (인용(경로·줄))
- `S3` → C
- `4.7 행` → B (절 번호 뒤 낱말(토큰화 오인))
- `4.9 행` → B (절 번호 뒤 낱말(토큰화 오인))
- `abxcd@3` → B (예시)
- `abxcd@5` → B (예시)
- `abxcdy@6` → B (예시)
- `1234-5@6` → B (예시)
- `1234@4` → B (예시)
- `4.4%` → B (오늘의 코드·관찰)
- `{a:'x'}` → B (예시)
- `{a:'x', b:'derived:x'}` → B (예시)
- `[2, 3]` → B (예시)
- `type: [number, string]` → B (예시)
- `files` → C
- `reviews/raw-round16-*.md` → C
- `round-3-spec.md` → C
- `raw-round8-derivation-{local,antigravity,claude}.md` → C
- `raw-round8-naming.md` → C
- `raw-round8-verification.md` → C
- `../spikes/round8/` → C
- `round-9-derivation.md` → C
- `raw-round9-axis-mapping.md` → C
- `raw-round9-code-facts.md` → C
- `raw-round9-naming-{antigravity,codex,local}.md` → C
- `raw-round9-derivation-{local,claude,antigravity}.md` → C
- `raw-round9-readiness-{antigravity,local}.md` → C
- `../spikes/round9/` → C
- `raw-round10-derivation-{local,claude,antigravity}.md` → C
- `raw-round10-verification.md` → C
- `../spikes/round10/` → C
- `raw-round11-owner-answers-claude.md` → C
- `raw-round11-owner-answers-antigravity.md` → C
- `../spikes/round11-corpus/REPORT.txt` → C
- `raw-round12-*.md` → C
- `raw-round14-*.md` → C
- `raw-round16-*.md` → C
- `S15` → C
- `T14` → C
- `research/` → C
- `0011 초` → C
- `loop-v4b` → C
- `reviews/raw-round8-*.md` → C
- `spikes/round8/` → C
- `reviews/raw-round9-*.md` → C
- `22개` → C
- `reviews/round-16-*.md` → C
- `N17` → C
- `5 개` → C
- `{ mode?, disableDefaultInjection? }` → C
- `D-35` → C
- `C-7` → C
- `spikes/work-loop/proto/loop-v3.mjs` → C
- `selfcheck-v3.mjs` → C
- `redteam3/attacks.mjs` → C
- `0002 개` → C
- `0005 개` → C
- `0006 개` → C
- `0013 개` → C
- `15%` → C
- `spikes/round7/proto/loop-v4d.mjs` → C
- `make-v4d.mjs` → C
- `selfcheck-v4d.mjs` → C
- `START_SET` → C

## 18라운드 닫기 뒤의 잔여 (2026-09-26)

잔여는 476이다.
- HEAD(`fcab8d891`)의 잔여 486 가운데 21개가 빠졌다. 원장이 18라운드 항목으로 새로 담았거나, 옛 HANDOFF의 과정 토큰이 목록에서 사라진 것이다.
- 새 HANDOFF의 과정 토큰 11개가 더해졌다. 모두 (C) 이력·과정이다.
- 원장에서 새로 빠진 설계 토큰은 없다.

- `F<n> <높음|중간|낮음>` → C
- `reviews/raw-round18-final-check.md` → C
- `reviews/round-18-closing-summary.md` → C
- `reviews/round-6-coherence.md:107` → C
- `대체됨(→ 소유자 답을 담은 새 항목)` → C
- `분할됨(→ …)` → C
- `의 "원문"은 N라운드 결정과 다르다: 새 규칙(번호). N라운드 결정이 이긴다(` → C
- `편집자 결정(18라운드, …18C-nn)` → C
- `23행` → C
- `251개` → C
- `88개` → C

## union 설계·채움 파생 반영과 HANDOFF 재작성 뒤의 잔여 (2026-09-26, 봉인)

검사 결과 `{"total":2470,"missing":481}`(HANDOFF의 `gate3-union-fill.md` 인용까지 포함). 원장 반영 자체는 잔여를 늘리지 않았다(반영 전후 471). 늘어난 것은 HANDOFF.md를 새 상태로 다시 쓰면서 들어간 문서·절차 토큰이다: 경로(`reviews/raw-round18-union-swarm/merged-v3.md`, `reviews/raw-*/`, `reviews/round-18-owner-answers.md:24-37`, `reviews/round-18-owner-answers.md:N`, `exact-check.mjs`·`diff-guard.mjs`·`block-check.mjs`, `brief-final-check.md`), 절차 문구(`분할됨(→ 나머지 항목, 새 항목)`, `소유자 답이 이기면`), 개수(`326개`, `26행`). 모두 원장이 인용할 원천이 아닌 HANDOFF의 자기 서술이라 C다. 게이트 3 고침은 잔여를 2 줄였다(482 → 480). HANDOFF에 게이트 3 원문 경로를 적어 481이 됐다(C).

## 개발계획 `plan/` 추가 뒤의 잔여 (2026-09-27)

잔여 484 = 481 + 3. 새로 든 셋은 모두 HANDOFF §2·§5가 개발계획을 가리키는 경로 코드 토큰(`plan/`, `plan/pr-*.md`, `plan/README.md`)이며, 원장이 들 이유가 없는 HANDOFF의 자기 서술이다 — C. 원장 쪽 잔여는 바뀌지 않았다.

## 개발계획 결정(42–46행) 반영 뒤의 잔여 (2026-09-27)

잔여 483 = 484 − 1. `1.0.0-beta`가 LANDING-204의 결정문에 들어 HANDOFF의 그 토큰이 원장에서 발견된다. 새로 든 토큰은 없다.
