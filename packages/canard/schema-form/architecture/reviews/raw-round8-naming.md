# 8라운드 — 명명 제안 원자료 (N1–N7)

대상: 7라운드가 이름·표면 문제로 남긴 D-18·D-20·D-22′·D-23′·D-35·D-36과 D-21의 확인(`round-7-convergence.md` §2·§3). 날짜: 2026-09-23. 판단 기준은 셋이며 위가 이긴다.

1. **소유자 규칙(2026-09-23)** — "전체 일관성만 유지된다면 가독성 높고 명료한, 그리고 줄임말이 아니라 풀 네임을 쓰는 것을 추구한다. 예전에는 현학적이고 추상적인 이름을 좋아했지만 지금은 아니다."
2. **소유자 결정** — 쓰기 옵션은 오늘의 `SetValueOption`처럼 `|`로 합치는 **비트마스크**다. `adr/0013:46`의 "공개 옵션은 비트가 아니라 객체다"와 `adr/0007:68-72`의 객체 시그니처는 이 결정으로 대체된다(단조 수정 대상).
3. **저장소 명명 규칙** — 형제의 형식을 따른다(`.claude/rules/seiri_naming.md` §1), 이름은 구체적 책임 하나를 말한다(§2).

설계 문서에만 있는 용어(정착·로드·조각·방출·바퀴)는 공개 이름에 쓰지 않는다. 소비자가 그 용어를 배울 곳이 없기 때문이다.

## 0. 저장소에 이미 있는 관례

| 관례 | 근거 | 이번 제안에서 쓰는 곳 |
| ---- | ---- | -------------------- |
| 비트 플래그 enum의 멤버는 PascalCase이며 동사로 시작하는 명령형이다: `Replace`, `EmitChange`, `Propagate`, `Refresh`, `Normalize`, `PublishUpdateEvent`, `PreventInjection` | `src/core/types/value.ts:29-45` | N1 |
| 합성 멤버는 비트의 OR다. `Overwrite = Replace \| Merge`이므로 `Overwrite \| Merge === Overwrite`가 되어 결합 결과가 결정적이다 | `value.ts:63-65` | N1 |
| 내부 enum은 `PublicX`라는 부분집합을 두고 패키지 진입점이 그것을 `X`로 다시 이름 붙인다 | `value.ts:69-74`, `src/index.ts:44-45`(`PublicSetValueOption as SetValueOption`, `PublicNodeEventType as NodeEventType`) | N1, N4 |
| "폼이 스스로 쓴 값"처럼 쓰기의 **출처**는 내부 비트로 싣는다 | `value.ts:46-47`의 `Automatic` | N6 `write` |
| Form 속성이 enum과 짝을 이룰 때 속성은 camelCase, enum은 PascalCase다: `showError` ↔ `ShowError`, `validationMode` ↔ `ValidationMode` | `src/components/Form/type.ts:77,84`, `src/types/error.ts:13`, `src/core/types/state.ts:9` | N1 속성 |
| 쓸 수 있는 노드 속성 `x`에는 `setX`가 있다: `value`/`setValue`, `state`/`setState`, `errors`/`setErrors`, `externalErrors`/`setExternalErrors` | `AbstractNode.ts:316,355,635,666,770,794,816` | N2, N3 |
| 노드 칸 `x`는 이벤트 `UpdateX`, Form 콜백 `onXChange`와 짝을 이룬다: `state` ↔ `UpdateState`/`UpdateGlobalState` ↔ `onStateChange` | `src/core/types/event.ts:53-55`, `Form/type.ts:58`, `RootNodeContextProvider.tsx:113` | N4 |
| Form 콜백은 `on` + 동사 또는 `on` + 명사 + `Change` 꼴이다: `onChange`, `onValidate`, `onSubmit`, `onStateChange` | `Form/type.ts:52-58` | N4 |
| 코드의 문자열 리터럴 유니언은 camelCase 또는 소문자 한 단어다: `'branch' \| 'terminal'`. src에 kebab-case 리터럴 타입은 없다(테스트 픽스처 `'custom-input'`뿐). 설계 문서의 `'budget-exceeded'`는 kebab-case여서 **관례가 둘**이다 | `AbstractNode.ts:71`, `src/types/error.ts:275` 대 `adr/0006:34`, `adr/0008:93` | N4 |
| FE 전용 `&` 키는 camelCase이고 컴포넌트를 담는 키는 PascalCase다: `&readOnly` 대 `FormTypeInput` | `src/types/jsonSchema.ts:229,298` | N5 |
| 오늘 코드도 `oneOf`/`anyOf`의 대안을 "branch"라 부른다. 같은 단어가 자식을 가진 노드 `group: 'branch'`도 가리킨다. **관례가 둘**이다 | `AbstractNode.ts:101-103,486-500` 대 `:71` | N2 |

한 단어가 이미 두 뜻으로 쓰이는 곳도 셋 있다. 새 이름이 이 단어를 쓰면 혼동이 더 커진다.

- **Injection**: 내부 `PreventInjection`(`value.ts:44-45`)과 공개 스키마 키 `injectTo`(`jsonSchema.ts:288`)는 `injectTo`를 뜻한다. 설계 문서의 "`default` 주입"은 다른 뜻이다.
- **defaultValue**: Form 속성 `defaultValue`(`Form/type.ts:46`)는 초기값이다. 스키마의 `default` 키워드와는 다른 것이다.
- **select**: 오늘 `FormHandle.select`와 `RequestSelect`는 텍스트 선택이다(`Form/type.ts:114`, `event.ts:70-71`). 분기 선택이 아니다.

## N1. 쓰기 옵션 비트마스크 (D-18, #34, #42)

### N1-a. enum과 멤버

| 순위 | 공개 enum `SetValueOption`(내부 이름 `PublicSetValueOption`) | 따르는 관례 | 이유 |
| ---- | ------------------------------------------------------------ | ----------- | ---- |
| **1** | `Overwrite`, `Merge`, `DisableSchemaDefaults`, `EnableSchemaDefaults` | 이름은 `value.ts:63-74`, `src/index.ts:45`와 같다. 멤버는 동사로 시작하는 명령형이다(`value.ts:29-45`) | 소비자가 쓰는 이름이 그대로 남아 이주 비용이 없다. 새 멤버 둘은 무엇을 끄고 켜는지를 스키마 키워드 `default`로 말한다 |
| 2 | `Overwrite`, `Merge`, `DisableDefaultInjection`, `EnableDefaultInjection` | `HANDOFF.md:41`의 현 후보 | 문구는 소유자의 `disable…` 방향과 맞는다. 다만 "Injection"이 이 enum 안에서 이미 `injectTo`를 뜻한다(`value.ts:45`) |
| 3 | `Overwrite`, `Merge`, `DisableLoadDefaults`, `EnableLoadDefaults` | 7라운드 후보 | 범위는 정확하다. 다만 "Load"는 설계 문서의 용어이고 공개 문서에는 나오지 않는다 |

- **탈락: `DisableInitialDefaults`.** 이 억제는 마운트뿐 아니라 뒤의 `setValue`와 `reset`에서도 듣는다(`adr/0013:51`). "Initial"은 범위를 좁게 오해하게 한다.
- **`Overwrite`와 `Merge`는 그대로 둔다.** 오늘의 성질 `Overwrite ⊇ Merge`(`value.ts:65`)를 유지해서 두 멤버를 함께 넘기면 `Overwrite`가 이기게 한다. 옵션을 생략하면 `Overwrite`다(`AbstractNode.ts:358`, `adr/0013:50`).
- **공개할 합성 멤버는 없다.** `Reset`, `StableReset`, `Isolate…`, `BatchDefault`(`value.ts:49-61`)는 오늘의 기제에 속하며 내부에 남거나 사라진다. `Refresh`는 공개 옵션이 아니다. core가 쓰기의 출처로 판단하기 때문이다(`adr/0007:74`).
- **`mode`와 `write`의 선택, 리터럴 대소문자는 문제 자체가 사라진다.** 비트마스크에는 `mode` 키가 없으므로 `validationMode`나 react-hook-form의 `mode`와 충돌할 일이 없다(#34, `raw-round7-prior-art.md:28`). 대소문자는 enum 멤버의 PascalCase가 정한다.

### N1-b. 이중부정과 "기본값이 켜진 긍정 플래그"

**기본값이 켜진 긍정 비트 하나는 비트마스크로 표현할 수 없다.** 비트가 없는 상태는 0이고, 0은 "옵션 없음, 기본 동작"을 뜻해야 한다(`setValue(v)`와 `Merge`만 준 호출이 그렇다). `InjectSchemaDefaults` 같은 긍정 비트 하나를 기본으로 켜 두려면 모든 합성 멤버에 그 비트를 넣어야 한다. 그러면 끄는 방법이 `Overwrite & ~InjectSchemaDefaults`뿐인데, 이 저장소의 공개 관용구에는 비트 빼기가 없다.

양방향 우선순위 규칙(`adr/0013:52`: "호출 옵션이 Form 속성을 양방향으로 이긴다")에는 세 상태가 필요하다. 상속, 끄기, 켜기다. 그래서 비트가 둘 있어야 한다.

| 비트 | 뜻 |
| ---- | -- |
| 둘 다 없음 | Form 속성 `disableSchemaDefaults`를 따른다 |
| `DisableSchemaDefaults` | 이 쓰기에서는 스키마 `default`를 채우지 않는다 |
| `EnableSchemaDefaults` | 속성이 꺼 두었어도 이 쓰기에서는 채운다 |
| 둘 다 | **억제가 이긴다.** 배치 규칙 "섞이면 억제가 이긴다"(`adr/0013:53`)와 같은 판정이다 |

이렇게 하면 호출 지점에 이중부정이 생기지 않는다. 켜려면 `Enable…`를 쓴다. 남는 부정은 속성 쪽의 `disableSchemaDefaults={false}` 하나다. 이 값은 기본값이라 적을 일이 거의 없다.

**소유자가 정할 것 하나.** 양방향을 버리고 "호출은 끄기만 한다"로 좁히면 `EnableSchemaDefaults`가 빠지고 비트 하나로 충분하다. 그러면 `adr/0013:52`의 규칙이 바뀐다. 이것은 이름이 아니라 정책이다.

**이름이 말하지 못하는 범위.** 억제는 호출자의 전체 교체가 일으킨 정착에서만 듣는다. 사용자 입력이 켠 조각의 전이 주입은 막지 못한다(`adr/0013:54`, #34). 이름에 범위 접미사를 붙여도 정확해지지 않는다. `…OnWrite`라고 하면 사용자 입력도 쓰기이기 때문이다. 그래서 범위는 문서 주석(`seiri_code-comments` §3)에 적는다. `Merge`와 억제를 함께 주면 아무 일도 하지 않는다는 점(`adr/0013:55`)도 같은 주석에 적는다.

### N1-c. `reset`의 옵션과 마운트 스위치 (#42)

| 순위 | `reset` | 마운트 스위치(Form 속성) | 이유 |
| ---- | ------- | ------------------------ | ---- |
| **1** | `FormHandle.reset(option?: SetValueOption.DisableSchemaDefaults \| SetValueOption.EnableSchemaDefaults)` | `disableSchemaDefaults?: boolean`(기본 `false`) | 새 타입 이름이 생기지 않는다. TS enum 멤버는 타입으로 쓸 수 있으므로 `reset`이 받는 부분집합을 시그니처가 직접 말한다. 속성과 비트는 `showError` ↔ `ShowError`처럼 짝을 이룬다(`Form/type.ts:77`) |
| 2 | `reset(option?: ResetOption)` — 두 비트만 가진 공개 enum을 새로 둔다 | 같다 | `PublicSetValueOption`처럼 부분집합 enum을 두는 관례(`value.ts:69`)를 따른다. 다만 단수 `ResetOption`이 내부 `ResetOptions`와 한 글자 차이다 |
| 3 | `reset(option?: SetValueOption)` 전체 | 같다 | 가장 단순하다. 다만 `Merge`를 `reset`에 줄 수 있게 되어 뜻이 없는 조합을 타입이 막지 못한다 |

- **#42 충돌은 공개 표면의 충돌이 아니다.** 현행 `ResetOptions`(`value.ts:82-97`, 7필드)는 패키지 진입점이 내보내지 않는다. 쓰는 곳은 내부 `__reset__`(`AbstractNode.ts:1063`)뿐이며 `preferLatest`나 `updateScoped` 같은 오늘의 기제를 싣고 있다. 1안이면 그 기제와 함께 사라지고, 같은 이름을 가진 공개 타입은 처음부터 생기지 않는다.
- 노드 수준에는 `resetSubtree()`(`AbstractNode.ts:1138`)가 있으므로 같은 인자를 받게 한다. `FormHandle.reset`은 인자가 없는 `Fn`(`Form/type.ts:115`)이었으므로, 선택 인자를 더하는 것은 하위 호환이다.

## N2. 분기 선택 명령과 `selection` 칸 (D-20, #20)

| 순위 | 명령 | 칸의 공개 이름 | 따르는 관례 | 이유 |
| ---- | ---- | -------------- | ----------- | ---- |
| **1** | `setSelectedBranch(index)` | `selectedBranch` | 쓸 수 있는 칸 `x`에는 `setX`가 있다(`value`/`setValue`, `state`/`setState`, `errors`/`setErrors`, `AbstractNode.ts:355,666,794`) | `selection`은 `raw`·`extras`와 같은 **상태 칸**이다(`adr/0006:29,38`). 상태 칸의 쓰기는 이 저장소에서 늘 `set` + 속성 이름이었다. "selected branch"는 무엇이 골라졌는지를 말하므로 텍스트 선택과 섞이지 않는다 |
| 2 | `selectBranch(index)` | `selectedBranch` | 명령 동사 계열이다: `focus`, `select`, `reset`, `validate`, `submit`(`Form/type.ts:113-127`) | 짧고 읽기 쉽다(6라운드 권고). 상태 칸의 쓰기가 명령 동사 계열로 들어가 `setValue`와 모양이 달라진다 |
| 3 | `setSelection(index)` | `selection` | 설계 문서의 칸 이름이다 | **비권장.** DOM의 `setSelectionRange`와 `getSelection`, 오늘의 `RequestSelect`(`event.ts:70-71`)가 모두 텍스트 선택을 뜻한다. 소유자 규칙의 "명료"에 걸린다 |

- `FormHandle.select(path)`와 `RequestSelect`는 텍스트 선택 명령으로 남는다. 분기 선택에 `select`를 다시 쓰지 않는다(#20, C3 `00-goals:115`). `adr/0008:91`의 진입 API 목록에 있는 `select`는 `setSelectedBranch`로 고친다.
- "branch"가 `group: 'branch'`(`AbstractNode.ts:71`)와 겹치는 문제는 새로 생기는 것이 아니다. 오늘 코드의 문서 주석이 이미 `oneOf`/`anyOf`의 대안을 branch라 부른다(`AbstractNode.ts:101-103,486`). `selectedBranch`는 합성어라서 `group`의 값과 헷갈리지 않는다.
- **관련 읽기 이름(P9).** 새 모델에서 `oneOf`와 `anyOf`는 모두 한 분기만 활성이다(`adr/0002:54`). 그러면 오늘의 `oneOfIndex`와 `anyOfIndices`(`AbstractNode.ts:490,499`)는 계산된 활성 분기라는 칸 하나를 두 이름으로 읽는 셈이다. 제안은 `activeBranch` 하나로 합치는 것이다. `selectedBranch`는 수동 선택만 담으며 판별식이 있는 union에서는 `undefined`다. 두 칸이 다르므로 이름도 둘이다.

## N3. 값의 세 읽기 (D-23′, #33, #59)

7라운드의 수렴(`round-7-convergence.md:41`)은 셋이다. `getValue()`는 루트의 `emit`을 읽고, `node.value`는 `local`을 읽으며, `enhancedValue`에는 자리가 없다.

| 칸(`adr/0006:28-33`) | 공개 이름 1순위 | 2순위 | 3순위 | 이유 |
| -------------------- | --------------- | ----- | ----- | ---- |
| `raw` — 노드가 가진 원본, 투영 전 | **공개 이름 없음**(내부 `raw`) | `rawValue` | `storedValue` | 소비자가 원본을 직접 읽을 이유가 없다. 리프에서는 `value`와 같고, 호스트에서는 비객체 값이 왔을 때만 존재한다(`adr/0006:28`). 꺼진 조각의 원본은 N6의 `getInactiveValues`가 열거한다. P9에 따라 읽을 일이 없는 칸에는 공개 이름을 두지 않는다 |
| `local` — 활성 자식 `emit`의 합성, 투영 전 | **`value`**(유지) | — | — | 오늘의 이름과 getter(`AbstractNode.ts:316`)를 그대로 쓴다. 호스트에서만 뜻이 "raw"에서 "local"로 바뀐다. README가 "`node.value` stays raw"(`README.md:1483`)라고 적고 있으므로 이 문장은 이주 안내(C8) 대상이다 |
| `emit` — 투영된 값 | **`outputValue`** | `emittedValue` | `normalizedValue`(유지) | README가 이 투영을 "Array Output Filters"라 부르고 "refine only what the array emits — …`onChange`, `getValue()`, `submit`"이라 설명한다(`README.md:1456-1458`). 소비자가 이미 읽는 말이 "output"이다. `emittedValue`는 설계 문서의 동사를 드러낸다. `normalizedValue`는 무엇을 정규화했는지 말하지 않고, 내부 비트 `Normalize`(`value.ts:41`, "선언되지 않은 키를 버린다")와 뜻이 다르다 |

- **`normalizedValue`는 `outputValue`로 이름을 바꾼다.** 읽는 곳은 오늘과 같다. 루트 검증, 루트 방출, `FormHandle.getValue`, 부모의 스냅샷이다(`AbstractNode.ts:393-399`). 순수한 이름 변경이므로 이주 안내에 넣는다.
- **`FormHandle.getValue()`는 이름을 유지한다**(`Form/type.ts:121`). 이 값은 루트 노드의 `outputValue`와 같다. 노드에 `getValue()` 메서드를 따로 두지 않는다. `node.value`와 `node.getValue()`의 뜻이 다르면 이름만 보고 속게 되기 때문이다(`seiri_agent-legible` §3).
- **`enhancedValue`는 사라진다.** 오늘도 내부 `__enhancedValue__`(`AbstractNode.ts:734`)이고 공개 이름이 아니다.
- **`setValue(updater)`는 유지한다.** `FormTypeInput`의 `onChange: SetStateFnWithOptions`가 updater를 받는 공개 계약이다(`src/types/formTypeInput.ts:202-203`). `prev`는 오늘처럼 `value`, 곧 `local`이다(`AbstractNode.ts:361`의 `input(this.value)`). 문서 주석에는 두 가지를 적는다. 첫째, `prev`는 `outputValue`가 아니라 `value`다. 둘째, 기본 `Overwrite`로 `prev`를 바탕으로 쓰면 꺼진 조각의 원본이 없음이 되고 로드 계약이 다시 적용된다(D-7 (a), `adr/0013:59`).

## N4. 진단 표면 (D-22′, P7)

### N4-a. 칸, 이벤트, Form 속성

오늘 코드의 짝은 `state`, `UpdateState`/`UpdateGlobalState`, `onStateChange`다(§0). 설계의 `settle` 칸(`adr/0006:34`)과 `UpdateSettle`(가칭, `adr/0008:81`)을 이 짝에 맞춘다.

| 순위 | 노드 칸 | 이벤트 | Form 속성 | 이유 |
| ---- | ------- | ------ | --------- | ---- |
| **1** | `diagnostics` | `UpdateDiagnostics` | `onDiagnosticsChange` | 소비자가 이 칸을 읽는 목적이 진단이다. 설계 용어 "settle"(정착)을 배우지 않고도 뜻이 읽힌다. 칸, 이벤트, 콜백의 삼중 짝이 `state`/`UpdateState`/`onStateChange`와 같은 모양이다 |
| 2 | `settle` | `UpdateSettle` | `onSettleChange` | 설계 문서와 이름이 같다. 다만 "settle"은 동사이고 공개 문서에 뜻이 설명된 곳이 없다. 소유자가 멀리하려는 추상적인 이름에 가깝다 |
| 3 | `settlement` | `UpdateSettlement` | `onSettlementChange` | 명사형은 맞지만 영어 독자에게 "정산"으로 먼저 읽힌다 |

- **탈락: `onSettle`.** `on` + 동사 꼴(`onChange`, `onValidate`)은 사건마다 불리는 콜백으로 읽힌다. 이 콜백은 칸이 바뀔 때만 불린다(`adr/0008:81`).
- **탈락이 아니라 보류: `onDiagnostic(report)`.** D-22′에서 소유자가 **단일 콜백**, 곧 칸의 변화와 리스너 throw(`adr/0008:64`)를 한 채널에 싣는 모양을 고르면 1순위가 된다. 이때 `report`에 `kind`를 둔다. **분리 콜백**을 고르면 1순위 표에 `onListenerError`(`adr/0008:64`의 가칭 유지, `on` + 명사 + 명사)를 더한다. 이 선택은 모양의 문제이지 이름의 문제가 아니므로 D-22′에 남긴다.

### N4-b. `status` 값 집합과 예산 이름

P7은 `stable | budget-exceeded:<which>`를 제안했다(`round-6-coherence.md:164`). 이 제안은 값 하나에 두 정보를 문자열로 이어 붙이므로 소비자가 문자열을 잘라 읽어야 한다. 그래서 필드 둘로 나눈다. 리터럴은 코드 관례인 camelCase를 따른다(§0, `AbstractNode.ts:71`).

```ts
diagnostics: {
  status: 'stable' | 'budgetExceeded';
  exceededBudget?: 'conditionalSchemas' | 'derivedValues' | 'transitionDefaults' | 'listenerFeedback' | 'onChangeNesting';
  iterations: number; // 설계의 `sweeps`
}
```

| 예산(P7, `round-6-coherence.md:164`) | 1순위 | 2순위 | 오늘 문서의 리터럴 | 이유 |
| ------------------------------------ | ----- | ----- | ------------------ | ---- |
| 호스트 바퀴(조건부 조각 수 + 1, `adr/0007:52`) | `conditionalSchemas` | `branchResolution` | `'budget-exceeded'` | 소비자가 아는 것은 `if`/`then`과 `oneOf` 같은 조건부 스키마다. "조각"과 "바퀴"는 설계 용어다 |
| 파생 라운드(25) | `derivedValues` | `derivedValueRounds` | `'budget-exceeded'` | `&derived`의 이름을 그대로 쓴다 |
| 전이 라운드(전이 조각 수) | `transitionDefaults` | `branchSwitchDefaults` | `'budget-exceeded'` | 조건이 켜질 때 채워 넣는 `default`가 원인임을 말한다 |
| 파동(D-17 뒤 단위는 "최외곽 진입의 되먹임 사슬") | `listenerFeedback` | `listenerWrites` | `'wave-cap-exceeded'` | 틱당이 아니게 되었으므로 단위 이름("wave", "tick")을 뺐다. 거부되는 것은 리스너의 되먹임 쓰기다(D-17) |
| `onChange` 중첩(25, `adr/0008:93`) | `onChangeNesting` | `nestedOnChange` | `'onchange-cap-exceeded'` | 공개 속성 이름 `onChange`를 그대로 담는다 |

- 문서에 흩어진 리터럴 셋(`budget-exceeded`, `wave-cap-exceeded`, `onchange-cap-exceeded`)이 한 모양으로 모인다. 이것이 P7의 뜻이다.
- **이름을 비워 둔 것.** 로드 값이 방출에서 빠지는 신호(D-15 (a))와 비수렴 때의 커밋(D-31)은 실험과 소유자 결정이 먼저다. 둘 다 예산이 아니므로 `exceededBudget`이 아니라 `status`의 새 값이 된다. 후보를 하나 적어 두면 D-15의 `'loadedValueDropped'`다.

## N5. FE 전용 키 문법 (D-35, #51)

**목표 문법.** 모든 FE 전용 키는 `&`로 시작하는 **평면 키**다(`adr/0003:13`). `computed` 컨테이너는 없앤다. 오늘 `&active` 같은 평면 별칭과 `computed.active`가 같은 것을 두 문법으로 쓰고 있어서 G4에 어긋난다(`jsonSchema.ts:290-353`). 평면 키를 남기면 `&` 문법을 쓰던 사용자는 바꿀 것이 없다.

대소문자는 오늘을 유지한다. 값 키는 camelCase이고, 컴포넌트와 그 속성을 담는 키는 PascalCase다(React 관례, `jsonSchema.ts:229-244`).

| 오늘 | 새 표기 | 성격 | 근거 |
| ---- | ------- | ---- | ---- |
| `&active` / `computed.active` | `&active` | 이름만(`computed.*` 쪽만 바뀐다) | `jsonSchema.ts:292,318` |
| `&visible` / `computed.visible` | `&visible` | 이름만 | `:294,324` |
| `&pristine` / `computed.pristine` | `&pristine` | 이름만. 존속은 확정이다(`round-6-coherence` §7 207행, free) | `:296,329` |
| `&readOnly` / `computed.readOnly` | `&readOnly` | 이름만 | `:298,335` |
| `&disabled` / `computed.disabled` | `&disabled` | 이름만 | `:300,341` |
| `&watch` / `computed.watch` | `&watch` | 이름만 | `:302,347` |
| `&derived` / `computed.derived` | `&derived` | 이름만. 뜻은 D-11(원본을 쓴다)이 정한다 | `:304,353` |
| `&if` / `computed.if` | **없음** | **이름 변경이 아니다.** 분기 가드로 다시 써야 한다 | `adr/0003:26`, `jsonSchema.ts:290,312` |
| `FormTypeInput` | `&FormTypeInput` | 이름만. 직렬화 문제(Q8)는 따로 남는다 | `:229`, `adr/0003:32` |
| `FormTypeInputProps` | `&FormTypeInputProps` | 이름만 | `:231` |
| `FormTypeRendererProps` | `&FormTypeRendererProps` | 이름만 | `:244` |
| `formType` | `&formType` | 이름만 | `:255` |
| `terminal` | `&terminal` | 이름만. 양방향 재정의 규칙은 ADR 0011이 정한다 | `:257`, `adr/0011:54` |
| `errorMessages` | `&errorMessages` | 이름만 | `:259` |
| `options` (`omitEmpty`, `omitTrailing`, `trim`, 사용자 키) | `&options` | 이름만. 사용자 키를 담는 열린 컨테이너(`[alt: string]: any`, `:267`)라서 평면으로 풀지 않는다 | `:137,171,264-267` |
| `injectTo` | `&injectTo` | 이름만. 뜻은 D-27·D-28·D-34가 정한다 | `:288` |
| `propertyKeys` | `&propertyKeys` | 이름만 | `:195` |
| `virtual` | `&virtual` | **이름과 뜻이 함께 바뀐다**(D-6 (a): 참조 그룹 노드, 튜플 값은 읽기 전용 파생) | `:197`, `HANDOFF.md` D-6 |
| `type: 'virtual'`, `fields` | 키가 아니라 값이라 `&`를 붙일 수 없다. D-6 (a)의 형태에 맞춰 따로 정한다 | 보류 | `:215-217` |

- **`options`를 평면으로 풀지 않는 이유.** `&omitEmpty`처럼 풀면 사용자 정의 옵션 키가 FE 전용 키 전체와 한 이름공간에 섞인다. 라이브러리가 그 이름들을 열거할 수 없게 된다(`adr/0003:17`).
- **이주(C8).** "이름만"인 행은 기계적 변환으로 옮길 수 있다. 접두사를 붙이고 `computed.x`를 `&x`로 바꾸면 된다. 이 변환은 코드모드와 개발 모드 경고로 안내할 수 있다. 사람이 다시 써야 하는 것은 `&if`/`computed.if`와 `virtual` 둘뿐이다.
- 부수 효과로 제거 목록이 한 규칙이 된다. 오늘 `stripSchemaExtensions`는 키 여섯 개를 이름으로 나열한다(`stripSchemaExtensions.ts:44-49`). 새 규칙에서는 키워드 위치의 `&` 접두 키를 모두 지운다.

## N6. 공개 쓰기 API와 배열 API 목록 (D-36, #40, #52, #53)

**오늘의 코드.** `FormHandle`은 `focus`, `select`, `reset`, `findNode`, `findNodes`, `getState`, `setState`, `clearState`, `getValue`, `setValue`, `getErrors`, `getAttachedFilesMap`, `validate`, `showError`, `submit`을 가진다(`Form/type.ts:113-127`). 배열 노드는 `push(data?, unlimited?)`, `pop()`, `update(index, data)`, `remove(index)`, `clear()`를 가진다(`ArrayNode.ts:146-181`).

**문서의 목록은 다섯 가지로 서로 다르다.**

- `push`/`remove`/`update`(`adr/0013:37`, `adr/0007:65`)
- `push`/`remove`/`pop`/`clear`(`04-inherited-constraints.md:15`)
- `push`/`remove`/`clear`(`adr/0007:127`)
- `push`/`remove`(`adr/0008:91`)
- 진입 목록의 `setValue`·`write`·`select`·`removeKey`·`push`·`remove`·`batch`(`adr/0008:91`)

### 제안 목록 — 진입을 만드는 공개 쓰기

| API | 자리 | 상태 | 비고 |
| --- | ---- | ---- | ---- |
| `setValue(value \| updater, option?)` | 노드, `FormHandle` | 유지 | N1, N3 |
| `setSelectedBranch(index)` | 노드(union 호스트), `FormHandle.setSelectedBranch(path, index)` | 새 이름(N2) | 진입 목록의 `select`를 대체한다 |
| `push(value?)` | 배열 노드 | 유지. `unlimited` 인자는 뺀다 | core는 `maxItems` 초과 `push`를 막지 않는다(`adr/0013:78`). 무시할 제약이 없으면 그 인자도 필요 없다 |
| `pop()` | 배열 노드 | 유지 | JS `Array`와 같은 어휘다 |
| `update(index, value)` | 배열 노드 | 유지. 2순위 `setItem(index, value)` | `update`는 무엇을 고치는지 말하지 않는 유일한 이름이다. 다만 받는 쪽이 배열 노드라 뜻이 읽힌다. `setItem`은 `setValue` 계열에 맞지만 이주 비용이 든다 |
| `remove(index)` | 배열 노드 | 유지 | |
| `clear()` | 배열 노드 | 유지 | |
| `batch(callback)` | 루트, `FormHandle.batch` | 새 공개 API | 진입 깊이는 루트마다 따로 센다(`adr/0008:91`). 그래서 #40의 "어느 객체의 메서드인가"에 대한 답은 루트와 `FormHandle`이다 |
| `reset(option?)` / `resetSubtree(option?)` | `FormHandle` / 노드 | 유지하고 인자를 더한다(N1-c) | `setValue`를 거쳐 진입이 된다 |

### 명령과 읽기 — 진입이 아니다

- **명령.** `focus(path)`, `select(path)`(텍스트 선택), `refresh(path)`, `remount(path)`다. 뒤의 둘은 C-11 도출이며 `adr/0008:121`이 `focus`, `select`와 대칭으로 둔다. `refresh`라는 이름이 비용을 숨긴다는 지적(#45)이 있다. `adr/0008:128`에 따르면 refresh는 범위가 좁은 리마운트다. 명료함을 앞세우면 2순위는 `remountInput(path)`와 `remountSubtree(path)`다. 다만 오늘의 공개 이벤트 `RequestRemount`(`event.ts:95`)와 내부 `RequestRefresh`(`event.ts:73`)도 이름이 바뀌어야 하므로 1순위는 `refresh`/`remount` 유지다. 공개 `NodeEventType`에 `RequestRefresh`를 더하는 것은 C-11 확정과 함께 한다.
- **읽기.** `getInactiveValues(path)`는 꺼진 조각의 원본을 열거한다. 가칭 `latent(path)`(`adr/0013:67`, F26)를 대체한다. "latent"는 설계 용어이고 형용사여서 무엇을 돌려주는지 말하지 않는다. `get` + 명사 꼴은 `getValue`, `getErrors`(`Form/type.ts:121,123`)와 같다.

### `write`와 `removeKey`

- **`write`는 공개 API로 필요 없다. `setValue`와 내부 출처 비트에 흡수된다.** 프로토타입의 `write`(`loop-v4c.mjs:674`)는 입력이 보낸 부분 쓰기다. `RequestRefresh`를 내지 않고(F7, A6) 비객체 조상을 비운다. 오늘 이 경로는 `SchemaNodeInput`이 `node.setValue(input, HANDLE_CHANGE_OPTION)`을 부르는 것이다(`SchemaNodeInput.tsx:49-53`). 출처는 `Automatic`(`value.ts:47`)과 같은 내부 비트로 실으면 된다. 소비자가 보는 면은 `FormTypeInput`의 `onChange`다. 진입 목록(`adr/0008:91`)에서는 `write`를 빼고 "입력의 `onChange`"로 적는다.
- **`removeKey`는 보류하고, 둔다면 이름은 `removeUndeclaredKey(key)`로 한다.** 대신할 수단 둘에는 모두 대가가 있다. `Overwrite`로 키가 빠진 값을 다시 쓰면 꺼진 조각의 원본이 없음이 되고 `default`가 다시 채워진다(D-7). `Merge`는 키를 지우지 못한다. 흡수하는 길은 하나다. "`Merge`로 extras 키에 `undefined`를 쓰면 그 키가 없어진다"를 규칙으로 두는 것이다. 이것은 리프 규칙 "`undefined`를 쓰면 없음"(`adr/0013:40`)을 넓힌 것이지만 뜻의 결정이므로 소유자 몫이다. 잔여 키 UI(`03-mental-model.md:98`)와 함께 정한다. 이름에 "Undeclared"를 넣는 이유는 `removeKey`만으로는 선언된 자식 키도 지울 수 있는 것처럼 읽히기 때문이다. `extras` 칸의 정의(`adr/0006:30`)가 "어떤 조각에도 선언되지 않은 키"다.

## N7. 터미널 아래 경로의 `find` 반환 (D-21)

**수렴된 답은 `null`이다. 그러나 7라운드의 "현행 시그니처대로 `null`"(`round-7-convergence.md:39`)은 오늘 동작에 대한 서술로는 틀렸다.** 오늘의 `findNode`는 경로 중간에서 터미널 노드를 만나면 남은 세그먼트를 버리고 **그 터미널 노드를 돌려준다**.

```ts
// src/core/nodes/AbstractNode/utils/findNode/findNode.ts:86
if (cursor.group === 'terminal') return cursor;
```

- `find('/payload/amount')`에서 `payload`가 터미널이면 `payload`가 나온다. 이것이 `adr/0011:88`의 S11 별칭이다.
- `:68`의 `return null`은 세그먼트를 시작할 때 커서가 이미 터미널인 경우에만 닿는다. 터미널 노드에서 `find`를 시작했거나 `..`나 `#` 뒤에 터미널에 선 경우다.
- 시그니처 `SchemaNode | null`(`AbstractNode.ts:253`, `Form/type.ts:116`)은 `null`을 **허용**할 뿐이다. 이 경우에 `null`을 돌려준다는 뜻이 아니다.
- 이 동작을 지키는 테스트가 없다. `findNode.test.ts:147-149`는 주석으로 "returns null"이라고 적지만 단언이 `expect(nestedResult).toEqual(nestedResult)`여서 항상 통과한다.
- 복수형 `findNodes`는 터미널을 결과에 남기는 것을 문서화된 동작으로 삼는다(`findNodes.ts:26,47-49,89`).

**제안.** 단수형 `find`와 `findNode`는 터미널 아래 경로에 `null`을 돌려준다. `:86`의 조기 반환은 마지막 세그먼트일 때만 터미널을 돌려주도록 바꾼다. 이것은 **행동 변화**이므로 이주 안내(C8) 대상이다. `findNode.test.ts:147-149`는 `toBeNull()`로 고친다. `findNodes`가 같은 경로에서 터미널을 남기는 동작도 같은 결정에 맞출지 함께 정한다(G4). 이름에는 바뀌는 것이 없다.

## 서명용 요약

| # | 1순위 | 소유자에게 남는 것 |
| - | ----- | ------------------ |
| N1 | `SetValueOption.{Overwrite, Merge, DisableSchemaDefaults, EnableSchemaDefaults}`. 둘 다 주면 억제가 이긴다. Form 속성은 `disableSchemaDefaults`, `reset(option?)`은 두 비트만 받는다. 공개 합성 멤버는 없다. `ResetOptions`는 내부 기제와 함께 사라진다 | 양방향을 유지할지(유지하면 비트 둘, 버리면 하나). `adr/0013:46`, `adr/0007:68-72` 개정 |
| N2 | `setSelectedBranch(index)` / `selectedBranch`. 계산 칸은 `activeBranch`로 `oneOfIndex`/`anyOfIndices`를 대체한다 | `selectBranch`(명령 동사 계열)와의 선택 |
| N3 | `node.value` = local, `outputValue` = emit(`normalizedValue`에서 이름 변경), `FormHandle.getValue()` 유지, raw는 공개하지 않는다. `setValue(updater)`는 유지하고 `prev` = `value`다 | README `:1483` 문장의 이주 |
| N4 | `diagnostics` / `UpdateDiagnostics` / `onDiagnosticsChange`. `{status: 'stable' \| 'budgetExceeded', exceededBudget?: 'conditionalSchemas' \| 'derivedValues' \| 'transitionDefaults' \| 'listenerFeedback' \| 'onChangeNesting', iterations}` | 단일 콜백을 고르면 `onDiagnostic`, 분리 콜백을 고르면 `onListenerError`를 더한다. D-15와 D-31의 값 |
| N5 | 평면 `&` 키만 둔다. `computed`를 없애고 `options`는 `&options` 컨테이너로 둔다. `&if` 외에는 모두 이름 변경뿐이다 | `virtual`과 `type: 'virtual'`의 형태(D-6) |
| N6 | `setValue`, `setSelectedBranch`, `push`, `pop`, `update`, `remove`, `clear`, `batch`, `reset`/`resetSubtree`. `write`는 흡수된다. `removeKey`는 보류하고, 둔다면 `removeUndeclaredKey`로 한다. `latent`는 `getInactiveValues`로 바꾼다 | `removeKey` 흡수 규칙, `update` 대 `setItem` |
| N7 | 터미널 아래 경로는 `null`이다. **오늘은 별칭이다**(`findNode.ts:86`). 행동 변화이므로 이주 안내에 넣고 항진 테스트를 고친다 | `findNodes`를 맞출지 |
