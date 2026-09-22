# 현재 구현과 새 설계의 대조 — 문법·인터페이스·기능

날짜: 2026-09-23. 기준은 둘이다 — **현재**는 커밋 `01e52d0bd`의 `../src/`, **설계**는 `architecture/` 4차 본문과 6라운드(`reviews/round-6-coherence.md`)다.

읽는 법. 열은 넷이다. **현재**는 오늘 코드가 하는 일, **새 설계**는 4차 본문이 적은 것, **변화**는 유지·확대·축소·이름 변경·제거·신규·미결 가운데 하나, **근거**는 `파일:줄` 또는 재료 문서의 절이다. 현재 열의 출처는 `reviews/raw-round6-current-syntax.md`, 설계 열의 주 출처는 `reviews/raw-round6-design-syntax.md`이며 보충은 본문 ADR이다.

상태 표기. **미결(D-nn)**·**미결(Q-n)**은 소유자의 결정을 기다리는 것이고, **미확인**은 읽은 범위의 문서가 말하지 않는 것이다. 문서가 침묵하는 자리에 "제거"라고 적지 않았다. 두 재료가 어긋나는 곳은 **불일치**로 적고 §6에 모았다.

## 1. 표준 조건부 문법

| 문법 | 현재 | 새 설계 | 변화 | 근거 |
| ---- | ---- | ------- | ---- | ---- |
| `if`/`then`/`else`의 내용 | `then.required`/`else.required`**만** 읽어 `computed.active` 조건으로 바꾼다. `then.properties`·타입 변경 등은 무시 | `then`/`else`가 조각이다. 본체 `properties` 밖에서 새 노드를 선언할 수 있고 `properties`·중첩도 읽는다 | 확대 | `flattenConditions.ts:44-97`, `mergeShowConditions.ts:17-29` / `adr/0002:34-40,140` |
| `if`의 판별 | `if.properties`의 `const` 또는 `enum`(다원소 포함, 단일 원소는 스칼라로 평탄화)만 폼이 직접 해석한다 | 가드는 **검증기 플러그인의 `compileGuard`가 컴파일한 스키마 자체**다. 폼은 `if`의 뜻을 해석하지 않는다 | 확대 + 해석 주체 이동 | `flattenConditions.ts:105-121` / `adr/0002:44`, `adr/0004` |
| else-if 체인 | 지원 — `schema.else.if && schema.else.then`이면 재귀 | 조각 트리의 재귀로 흡수 | 유지 | `flattenConditions.ts:64-65` / `adr/0002:105` |
| 중첩 `if` (`then` 안, `allOf` 안) | **미지원** — 순회하지 않고 `allOf` 안은 경고 후 무시 | 재귀로 지원하고 **`allOf` 안의 `if`/`then`은 필수 지원**이다 | 확대 | `processAllOfSchema.ts:36-44` / `adr/0002:105-106` |
| `allOf` | 타입별 intersect 병합. `allOf`·`anyOf`·`oneOf`·`not`·`if`/`then`/`else`·`dependencies`·`dependentRequired`·`dependentSchemas`·`unevaluatedProperties`·`unevaluatedItems`·`contains`는 무시 + dev 경고 | 무조건 항목은 항상 켜진 조각, `{if, then}` 항목은 가드가 붙은 조각. 병합은 유지하고 상속 overlay가 더해진다 | 확대 | `intersectSchema/utils/constants.ts:61-75` / `adr/0002:36-38,110` |
| `oneOf`/`anyOf`의 판별 | 분기의 `&if`/`computed.if`가 우선이고, 없으면 `properties`의 `const`/`enum` 조합. 매치하면 `oneOfIndex`/`anyOfIndices`를 계산한다 | 판별식 식별 5단계(E14) — `$ref`·`allOf` 평탄화 → null 분기 벗기기 → 모든 분기가 `const`/`enum`으로 제약하는 키를 후보로 → 서로소 검사 → `discriminator.propertyName` > `required` > 사전순. 가드는 `{properties:{k:제약}, required:['k']}` | 확대 + 기제 교체(소유자 확인 대기) | `getConditionIndexFactory.ts`, `getExpressionFromSchema.ts` / `adr/0005:75-86` |
| 판별식이 없는 union | `oneOfIndex = -1`이 기본값이다. 이후 분기 선택 동작은 조사 범위 밖(미확인) | **선택 가드** — 노드의 `selection` 칸이 분기를 고르고 사용자가 수동으로 고를 수 있다 | 신규 | `ComputedPropertiesManager.ts:106` / `adr/0002:38-40,141` |
| union의 초기 선택 | 미확인 | 분기 키가 하나도 없으면 분기 없음 → 값의 키를 가장 많이 선언한 통과 분기 → 동점이면 앞 분기 → 호스트 `required`가 비활성 조각의 키를 가리키면 가중 | 신규 + 미결 | `adr/0002:121-133`. 여분 키만 있는 값의 확장은 **미결(U-1)**, `required` 가중은 **미결(D-14)** |
| 빈 값과 판별 프로퍼티의 `default` | 무매치면 `oneOfIndex = -1`, 어느 분기도 켜지지 않는다 | 같다 — 암묵 `default` 없음, 빈 값은 분기 없음 | 유지 | `ComputedPropertiesManager.ts:106` / `adr/0002:118` (D-8 수락) |
| `anyOf`의 다중 활성 | `anyOfIndices`로 **둘 이상의 분기가 동시에 활성**이 된다 | 같은 union의 분기는 **둘 이상 활성이 될 수 없다** — 판별식 가드는 서로소이고 선택 가드는 하나만 고른다 | 축소 | `BranchStrategy.ts:424` / `adr/0002:17,54`. 6라운드 발견 29 **부분** — 축소는 명시됐으나 이주 충격 목록에 없었다 |
| `ENHANCED_KEY` 마커 | `oneOf` 분기마다 `properties[ENHANCED_KEY]: {const: variant}`를 삽입해 인덱스를 추적한다 | 소멸. 활성 조각을 폼이 알고 있으므로 `schemaPath` 접두사로 에러를 거른다 | 제거 | `processOneOfSchema.ts:14-24` / `adr/0001:40`, `app/constants/internal.ts:3` |
| `dependentSchemas`/`dependencies` | **미지원** — 조건 해석 로직이 없다 | 가드 → 조각으로 환원할 수 있으나 채택 여부가 정해지지 않았다 | **미결(Q7)** | `open-questions.md:54-56` |
| `not`/`false`/`additionalProperties` | **미지원**. `allOf` 안에서만 경고 대상으로 등장한다 | **읽지 않는다**(D-3 = P1′). 본체에 선언된 자식은 보통 필드로 보이고 검증기 에러가 붙으며, 본체에 없으면 잔여 키다 | 명시적 비지원 + 잔여 키 계약 신규(D-3 도출, 소유자 확정 대기) | `intersectSchema/utils/constants.ts:61-75` / `adr/0002:76-97` |
| `const`/`enum` | 분기 판별식으로 읽는다 | 판별식 식별에 **값만** 읽고 만족 여부의 판정은 검증기가 한다 | 유지 | `getExpressionFromSchema.ts:44-48` / `adr/0005:90` |
| `default` | `jsonSchema.default`가 없으면 **타입별 빈 값을 만들어** 채운다 | 로드 계약이다 — core의 유일한 자동 쓰기이고 **없음**인 키에만, 전체 교체 직후와 조각이 꺼짐 → 켜짐이 된 직후에만 들어간다 | 축소 | `getDefaultValue.ts:19-23`(호출 `AbstractNode.ts:1129,1198`, `BranchStrategy.ts:343`) / `03-mental-model.md:45`, `adr/0007:33`. 빈 값 생성이 사라진다는 문장 자체는 **미확인**이며 "폼은 값을 만들지 않는다"(`adr/0002:118`)에서의 도출이다 |
| `$ref` | 해석 깊이의 기본값이 1이다 | 재귀 스키마에서 조각의 정적 열거가 어디서 끝나는지 정해지지 않았다 | **미결** | `getResolveSchema.ts:18-28` / `adr/0005:112` |
| `null` 타입 분기 | `&if`나 `properties`가 있어도 무시하고 dev 경고를 낸다 | 판별식 식별 2단계에서 null 분기를 벗기되 **분기 자체는 유지**하고 nullable을 전달한다 | 확대 | `warnIfNullBranchIgnored.ts:15-30` / `adr/0005:78` |
| `nullable` | 값 타입에 `\| null`을 붙인다 | 노드의 종류가 아니라 플래그로 유지한다 | 유지 | 패키지 `CLAUDE.md` / `adr/0005:58` |
| 순환·되먹임의 상한 | `MAX_LOOP_COUNT = 100`. 유휴 시 매크로태스크로 초기화하고, throw가 마이크로태스크 안에서 나므로 호출자가 잡지 못한다 | 정착 루프 안의 예산들 — 호스트 바퀴(조건부 조각 수 + 1), 파생 라운드 25, 전이 라운드(조각 수), 틱당 파동 25, `onChange` 중첩 25. 개발 모드는 커밋 뒤 **동기로** throw | 기제 교체 | `EventCascadeManager.ts:34,90-116` / `adr/0007:30-36`, `adr/0008:77`. 예산의 **수가 문서마다 다르다**(§6) |

## 2. `&` 문법과 FE 전용 키워드

| 키워드 | 현재 | 새 설계 | 변화 | 근거 |
| ------ | ---- | ------- | ---- | ---- |
| `&if`/`computed.if` | `boolean\|string`. `oneOf`/`anyOf` 원소에서만 뜻이 있고 분기 판별에 쓴다 | **제거.** 분기 선택은 값 가드와 선택 가드가 한다 | 제거 | `extractConditionInfo.ts:44-45` / `adr/0003:25`, `adr/0002:34-40` |
| `&active` | `false`면 값 쓰기 불가 + 방출 제외 | 유지. 조각의 비활성화와 **같은 연산**이고, 값을 빼는 유일한 작성자 명령이다 | 유지 | `checkComputedOptionFactory.ts:22-26` / `adr/0003:25`, `03-mental-model.md:15` |
| `&visible` | `false`여도 값은 유지하고 UI만 숨긴다 | 유지 | 유지 | 동일 / `adr/0003:25` |
| `&readOnly`·`&disabled` | FormTypeInput 구현에 위임한다 | 유지 | 유지 | 동일 / `adr/0003:25` |
| `&pristine` | dirty/touched를 리셋한다 | 유지(표현식 전체 존속) | 유지 | 동일 / `adr/0003:25`. 6라운드는 이것을 이주 충격 목록의 하나로 센다(발견 57) |
| `&watch` | `string\|string[]`. 명시적 의존 경로 | 유지 | 유지 | `getObservedValuesFactory.ts:29` / `adr/0003:25` |
| `&derived` | `string`. 평가 결과를 **원본에 쓴다** | **불일치** — 읽기 전용이라 적은 곳과 원본을 쓴다고 적은 곳이 갈린다. 권고는 (a) 작성자 선언 쓰기, **D-11 대기** | 미결(D-11) | `getDerivedValueFactory.ts:20-22`, `AbstractNode.ts:545-550` / 읽기 `adr/0007:32`·`adr/0013:41`, 쓰기 `adr/0013:82`·`adr/0003:21`·`adr/0001:39` |
| `computed.*` 컨테이너 | `&x`의 동의어 컨테이너다 | **미결** — 컨테이너를 없애고 `&` 평면 키로 갈지, `&` 하나를 컨테이너로 둘지 | 미결 | `checkComputedOptionFactory.ts:22-26` / `adr/0003:30` |
| `virtual`(그룹) | object 스키마의 `properties` 옆. 전처리가 `required`·`then.required`·`else.required`의 가상 이름을 구성 필드로 펼친다 | 이름을 `&virtual`로 옮기고 core에 **참조 그룹** 노드 종류를 둔다. `required` 펼치기는 사라진다. D-6 권고 (a), **소유자 확정 대기** | 이름 변경 + 노드 종류 신규 | `types/jsonSchema.ts:196-211`, `processVirtualSchema.ts:13-29` / `adr/0011:58-71` |
| `type: 'virtual'`(노드) | `VirtualNode`를 만든다 | 문서에 별도 언급이 없다 | **미확인** | `types/jsonSchema.ts:214-220` |
| `FormTypeInput`/`formType` | 컴포넌트 참조 또는 문자열. 입력 컴포넌트를 고른다 | 유지하되 **새 이름 미정**. core는 `isReactComponent`를 부르지 않고 "있고 `null`이 아니다"만 본다 | 미결(이름) + 기제 축소 | `useFormTypeInput.ts:76` / `adr/0003:30-32`, `adr/0011:53` |
| `terminal` | `boolean`. branch/terminal을 강제 지정한다 | 유지 + 확장 — `terminal: false`/`true` 양방향 명시 재정의 | 확대 | `getNodeGroup.ts:20-21` / `adr/0011:54` |
| `options.omitEmpty`·`omitTrailing` | 부모 전파와 `normalizedValue`의 빈 값·후행 제거 | 유지. **방출 정책**(P4)으로 자리를 옮긴다 | 유지 | `ObjectNode.ts:99,102` / `03-mental-model.md:12,89` |
| `options.trim` | 문자열을 강제 변환한다 | **제거** → 입력 컴포넌트로 | 제거 | `types/jsonSchema.ts:139` / `adr/0013:77` |
| `minItems` 채움 · `maxItems` push 차단 | core가 배열을 채우고 초과 push를 막는다 | **제거** → 입력 컴포넌트로. core는 제약을 유효 스키마로 노출하고 위반은 검증이 알린다 | 제거 | `adr/0013:78` |
| `FormTypeInputProps.alias` | 타입만 선언돼 있고 패키지 안에 소비처가 없다 — 외부 구현체용 패스스루 | 언급 없음 | **미확인** | `jsonSchema.ts:235` |
| `injectTo` | 값이 바뀌면 다른 노드로 전파한다 | 유지. 작성자가 선언한 전체 교체이며 **원천의 방출이 직전 커밋과 다를 때만** 발화한다(F11) | 유지 | `AbstractNode.ts:969` / `adr/0013:41`. 발화 기준점은 **미결(D-13)** |
| `placeholder`·`errorMessages` | `errorMessages`는 검증기에 넘기기 전 제거 대상이다. `placeholder`는 `types/jsonSchema.ts:233`에 선언돼 입력 컴포넌트가 소비한다 | 언급 없음 | **미확인** | `stripSchemaExtensions.ts:29-53` |
| 표현식 문법과 참조 형식 | `#/path`·`./path`·`../path`·`/path`·`@`·`#`를 `new Function`으로 컴파일한다 | **JSON Pointer 동적 함수 전체 유지** | 유지 | `ComputedPropertiesManager/utils/regex.ts:84-101`, `createDynamicFunction.ts:41` / `adr/0003:25` |
| 평가 시점 | 의존 경로의 값이 바뀌는 이벤트에서 동기 재평가한다 | 정착 루프의 **파생 단계**로 옮긴다 — 완성된 트리에서 평가하고 쓰기가 나오면 표시 단계로 돌아간다 | 이동 | `AbstractNode.ts:524-531`, `ComputedPropertiesManager.ts:204-216` / `03-mental-model.md:59`, `adr/0007:32` |
| 우선순위(root 폴백) | `active`·`visible`·`readOnly`·`disabled`·`pristine`에 한해 `rootJSONSchema[f] ?? jsonSchema[f] ?? computed?.[f] ?? &f` — **루트 스키마 최상위 키가 노드 자신의 `computed.*`보다 우선**이다 | 언급 없음 | **미확인** | `checkComputedOptionFactory.ts:22-26` |
| 검증기에 넘기기 전 제거 | `FormTypeInput`·`FormTypeInputProps`·`FormTypeRendererProps`·`errorMessages`·`options`·`injectTo` 여섯만 지운다. **`&*` 키와 `computed`는 제거 대상이 아니다** | **키워드 위치에서만** 제거하고 strict는 기본이 아니다. 목적은 판정이 아니라 `ajv.compile` 보호다. 소비자용 제거 유틸리티는 선택 사항으로 제공한다 | 유지 + 범위 정리 | `stripSchemaExtensions.ts:29-53` / `adr/0003:16-19`, `adr/0001:21` |

**남는 것.** `&active`·`&visible`·`&readOnly`·`&disabled`·`&pristine`·`&watch`, JSON Pointer 표현식 시스템 전체, `injectTo`, `terminal`, `options.omitEmpty`/`omitTrailing`, `nullable`.

**사라지거나 이름이 바뀌는 것.** `&if`(제거), `options.trim`·`minItems` 채움·`maxItems` 차단(제거), `virtual` → `&virtual`(이름 변경 + 노드 종류 신설), 비접두 키 전체(`FormTypeInput`·`options`·`virtual` …)가 `&` 접두로(이름 미정).

**미결.** `&derived`의 쓰기 여부(D-11), `computed` 컨테이너의 존속(`adr/0003:30`), `FormTypeInput`의 새 이름과 컴포넌트 참조를 스키마에 두는 결합, `alias`·`placeholder`·`errorMessages`·`type:'virtual'`·root 폴백은 문서가 말하지 않는다.

## 3. 공개 인터페이스

### 3.1 `Form` props

현재는 19개다 — `jsonSchema`, `defaultValue`, `readOnly`, `disabled`, `onChange`, `onValidate`, `onSubmit`, `onStateChange`, `formTypeInputDefinitions`, `formTypeInputMap`, `CustomFormTypeRenderer`, `errors`, `formatError`, `showError`, `validationMode`, `validatorFactory`, `virtualization`, `context`, `children`(`components/Form/type.ts:39-106`). **설계 문서에 전체 표가 없다.**

| 항목 | 새 설계 | 변화 | 근거 |
| ---- | ------- | ---- | ---- |
| `jsonSchema` | 단일 입구를 확정했다. 제안됐던 `overlay` prop은 철회 | 유지(확정) | `adr/0012` |
| `defaultValue` | 마운트가 로드 계약의 자리다. 억제 옵션이 여기에도 붙는다 | 유지 + 옵션 | `adr/0013:46`, `adr/0007:74` |
| `onChange` | 최외곽 동기 진입당 1회 | 의미 변경 | `adr/0008:87-93` |
| `disableDefaultInjection` | 신규 후보. 이름은 **미결(D-18)** | 신규(후보) | `adr/0007:74` |
| `onListenerError` | 가칭. 리스너 throw의 보고 채널이고 **채널 미정** | 신규(후보) | `adr/0008:147` |
| 그 밖 16개 | 언급 없음 | **미확인** | — |

### 3.2 `FormHandle`

현재는 `node`, `focus`, `select`, `reset`, `findNode`, `findNodes`, `getState`, `setState`, `clearState`, `getValue`, `setValue`, `getErrors`, `getAttachedFilesMap`, `validate`, `showError`, `submit`(`type.ts:108-128`)이다.

| 메서드 | 새 설계 | 변화 | 근거 |
| ------ | ------- | ---- | ---- |
| `setValue` | `setValue(value, { mode?, disableDefaultInjection? })` | 시그니처 변경 | `adr/0013:46` |
| `reset` | 같은 옵션 객체를 받는다 | 시그니처 변경 | `adr/0007:74` |
| `batch(fn)` | **신규.** fn 안의 쓰기를 표시만 하고 끝에 정착 1회·파동 1회. 중첩은 가장 바깥이 이긴다 | 신규 | `adr/0008:70-76` |
| `refresh(path)`·`remount(path)` | 신규 후보. 소비자는 오늘 타입상 두 명령을 publish하지 못한다(C-11) | 신규(C-11 대기) | `adr/0008:121` |
| `focus` | 유지 | 유지 | `raw-round6-design-syntax.md` §3 |
| `select` | 분기 선택과 텍스트 선택이 한 이름을 진다. 권고는 `selectBranch`, **D-20 대기** | 이름 변경(미결) | 6라운드 D-20 |
| `findNode`/`find` | 터미널 아래 경로를 해석할지가 미결. 권고는 `undefined`, **D-21 대기** | 미결(D-21) | 6라운드 D-21 |
| `latent()` | 잠복 값 열거 API가 가칭이고 파기 수단이 없다 | 신규(이름·모양 미결) | `adr/0006:80`, `adr/0013:94` |
| 나머지 11개 | 언급 없음 | **미확인** | — |

### 3.3 `SetValueOption` 10비트의 행방

현재는 비트 워드다(`core/types/value.ts:26-66`). 공개 서브셋 `PublicSetValueOption`은 `Merge`/`Overwrite` 둘뿐이다(`:69-74`). 새 설계에서는 옵션 **객체** `{ mode?: 'Overwrite' | 'Merge'; disableDefaultInjection?: boolean }`가 이를 대신한다(Q6 닫힘).

| 비트 | 새 설계에서의 행방 | 근거 |
| ---- | ----------------- | ---- |
| `Replace`(+ 조합 `Overwrite`) | `mode: 'Overwrite'` — 기본값 | `adr/0013:46` |
| 조합 `Merge` | `mode: 'Merge'` | 동일 |
| `EmitChange` | **제거** — 통지가 옵션이 아니라 구조다 | `04-inherited-constraints.md` 사라지는 장치 |
| `Propagate` | **제거** — 전파가 구조다 | 동일 |
| `Batch` | **제거** → `batch(fn)` | 동일, `adr/0008:70` |
| `Isolate` | **제거** | 동일 |
| `PublishUpdateEvent` | **제거** | 동일 |
| `Refresh` | 공개 옵션이 아니다. core가 **쓰기의 출처**로 판단한다(F7) | `adr/0007:77` |
| `Normalize` | **폐기.** 미선언 키는 `extras` 칸에 보존하고 방출한다 | `adr/0013:80` |
| `PreventInjection` | `disableDefaultInjection`(이름 후보, **D-18**) | `adr/0013:46` |
| `Automatic` | 비트가 아니라 루프 단계가 자동 쓰기를 가른다. 세부는 **미결(Q2)** | `open-questions.md` Q2, `adr/0007:78`(F10) |

`node.setValue(input, option = Overwrite)`(`AbstractNode.ts:355-364`)의 기본값은 뜻이 같은 채로 표기만 바뀐다.

### 3.4 이벤트·통지·검증

| 항목 | 현재 | 새 설계 | 변화 | 근거 |
| ---- | ---- | ------- | ---- | ---- |
| `NodeEventType` | 17종. 공개 서브셋 6종 | **3역할로 재정의** — 상태 통지 / `revision` 원장 / 명령 시그널. 17종 개별의 생사는 언급이 없다 | 재정의 + **미확인** | `core/types/event.ts:45-96` / `adr/0008:24-28` |
| 명령 어휘 | `RequestFocus`·`RequestSelect`·`RequestRefresh`·`RequestRemount`·`RequestEmitChange`·`RequestInjection` | 앞의 넷은 유지. 뒤의 둘은 **미확인** | 유지 + 미확인 | 동일 / `adr/0008:24-28` |
| `subscribe`/`revision` | 둘 다 클래스 시그니처상 공개 | 유지. `revision`은 커밋 시 배달 집합 전체를 **한 번에** 올린다(F16) | 유지 + 의미 변경 | `AbstractNode.ts:916,938` / `adr/0008:34-68` |
| `publish` | 공개이나 내부 타입만 받아 소비자가 명령을 publish하지 못한다 | 공개화는 **소유자 확정 대기**(C-11) | 미결 | `AbstractNode.ts:891` / `adr/0008:121` |
| 검증 스탬프 | 세대 토큰 `__generation__`으로 구세대 결과를 버린다 | **커밋 번호** 스탬프. `revision`과 별개의 단조 번호다 | 이름 변경 + 기제 교체 | `ValidationManager.ts:56-62,121-124` / `adr/0007:34`, `adr/0008:84` |
| `onChange` 호출 단위 | `afterMicrotask`(매크로태스크 디바운스)가 `validate()`와 루트 `onChange`를 함께 묶는다 | **최외곽 동기 진입당 1회**, 디바운스 없음. React 이펙트의 쓰기는 새 진입이라 키 입력당 2회이며 문서화 대상이다 | 의미 변경 | `AbstractNode.ts:1219-1223` / `adr/0008:87-93` |
| 검증 호출 단위 | 위와 같은 디바운스에 묶인다 | 같은 진입에서 `onChange`보다 **먼저** 요청하고 비동기로 돈다 | 의미 변경 | 동일 / `adr/0008:91` |
| `ValidationMode` | `None`/`OnChange`/`OnRequest` | 언급 없음(D-18이 `mode` 이름 충돌을 말하므로 존속을 전제한다) | **미확인** | `core/types/state.ts:9-16` |

### 3.5 값 읽기·분기 인덱스·배열·훅

| 항목 | 현재 | 새 설계 | 변화 | 근거 |
| ---- | ---- | ------- | ---- | ---- |
| `node.value`/`normalizedValue` | 원본과 정제된 값으로 나뉜다 | 구분 유지가 "자연스럽다"고만 적혀 있다. 상태 칸 셋(`raw`/`local`/`emit`)에 공개 이름을 어떻게 배치할지는 **D-23 대기** | 미결(D-23) | `open-questions.md` Q3 / 6라운드 D-23 |
| `node.enhancedValue` | 가상 필드를 포함한 값 | 새 모델에 자리가 없다(발견 33). 거취는 D-23과 함께 | **미확인 → 미결(D-23)** | 패키지 `CLAUDE.md` / 6라운드 D-23 |
| `oneOfIndex`/`anyOfIndices` | 활성 분기의 인덱스를 읽는 공개 표면 | 대응물이 언급되지 않는다. 형상 쪽에는 `selection` 칸과 활성 조각 집합이 있다 | **미확인**(이주 충격 목록의 하나) | `AbstractNode.ts:490` / 6라운드 발견 57 |
| 배열 `push`/`remove`/`clear` | 마이크로태스크 하나 뒤에 풀리는 Promise를 돌려준다 | **동기**. Promise를 돌려주지 않는다 | 파괴적 변경 | `01-current-structure.md:81` / `adr/0007:127`, T-7 |
| 공개 훅 5종 | `useSchemaNodeTracker`·`useSchemaNodeSubscribe`·`useChildNodeComponentMap`·`useChildNodeErrors`·`useFormSubmit` | 언급 없음. `useSchemaNodeTracker`의 `useSyncExternalStore` 방식은 유지한다고만 적혀 있다 | **미확인** | `src/index.ts:78-84` / `adr/0008:26` |

## 4. 기능의 증감

### 4.1 사라지는 것

| 기능 | 현재 위치 | 왜 | 대체 |
| ---- | --------- | -- | ---- |
| `&if` 분기 판별 | `extractConditionInfo.ts:44-45` | 표준 composition 위에 얹은 FE 키가 검증을 깨뜨린다 | 값 가드·선택 가드(`adr/0002:34-40`) |
| `ENHANCED_KEY` 마커 주입 | `processOneOfSchema.ts:14-24`, `app/constants/internal.ts:3` | 검증기 입력 불변(P1) | 활성 조각 기반 `schemaPath` 필터(`adr/0001:40`) |
| `options.trim` 강제 변환 | `types/jsonSchema.ts:139` | core는 받은 값을 고치지 않는다(P2) | 입력 컴포넌트(`adr/0013:77`) |
| `minItems` 채움 · `maxItems` 차단 | `adr/0013:78`이 지목 | 같음 | 입력 컴포넌트 + 유효 스키마 노출 |
| `Normalize`의 미선언 키 제거 | `core/types/value.ts:26-66` | P1′ — 폼은 값을 지우지 않는다 | `extras` 칸 보존·방출(E16) |
| `null` → `{}` 변환, 비객체 값 버리기 | `adr/0013:79`가 지목 | 같음 | 보존·방출하고 type 에러(F27) |
| 분기 전환 reset과 `fallbackValue` 복원 | `BranchStrategy.ts:479-511` | 같은 이름·타입이면 노드를 공유한다 | 값이 그대로 남는다(`adr/0005:103`) |
| `virtual`의 `required` 펼치기 | `processVirtualSchema.ts:13-29`, `transformCondition.ts:31-49`, `adr/0011:67` | 검증기 입력 불변과 충돌하는 유일한 자리였다 | 표준 `required`는 실제 필드만(`adr/0011:71`) |
| React 컴포넌트 감지 | `adr/0011:53`이 지목 | 컴포넌트를 감지하는 것은 렌더러를 아는 것(P5) | "있고 `null`이 아니다"만 본다 |
| 분석 단계의 정적 throw | `getCompositionNodeMapList.ts:95-105` | 돌려 보고 개발 단계에 알린다 (확인 대기) | 런타임 충돌 보고(`adr/0005:7,99`) |
| `afterMicrotask` 디바운스 | `AbstractNode.ts:1219-1223` | dev와 prod의 라이프사이클이 어긋났다 | 진입당 1회(`adr/0008:87-93`) |
| 노드별 `EventCascadeManager`·마이크로태스크 배치·`MAX_LOOP_COUNT` 틱 초기화 | `EventCascadeManager.ts:34,110-116` | 내부 상태 전이가 이벤트를 타지 않는다 | 정착 루프의 예산 + `batch()` |
| `SetValueOption`의 `Batch`·`Isolate`·`EmitChange`·`Propagate`·`PublishUpdateEvent` | `core/types/value.ts:26-66` | 전파와 통지가 옵션이 아니라 구조다 | 옵션 객체(`adr/0013:46`) |
| 두 단계 테스트 하네스 | `__tests__/renderForm.tsx:63-66`(13개 파일) | 생성이 곧 첫 정착이다 | 단일 단계 단언(T-5, F23) |
| 배열 연산의 Promise 반환 | `01-current-structure.md:81` | `await` 뒤가 "구독자가 봤다"는 뜻이 되지 않았다 | 동기 API(T-7) |
| `anyOf` 다중 활성 | `BranchStrategy.ts:424` | 형상의 결정성 | 분기 하나만 활성(`adr/0002:54`) |

### 4.2 새로 생기는 것

| 기능 | 어디에 | 뜻 |
| ---- | ------ | -- |
| 청사진과 조각 트리 | `adr/0005:25-38` | 노드 없이 분석하고, 조건부 형상을 조각 단위로 켜고 끈다 |
| 상속 overlay | `adr/0002:110` | 조상의 `if`가 손자를 선언해도 귀속은 자식 호스트, 가드는 조상의 것 |
| 정착 상태 `settle`과 예산 | `03-mental-model.md:28`, `adr/0007:30-36` | 형상 계산의 수렴 결과가 프로덕션에서도 관측 가능한 칸이 된다 |
| 동기 통지와 루트 디스패처 | `adr/0008:34-68` | 커밋 뒤 문서 순서 위 → 아래로 1회 배달한다 |
| `batch(fn)` | `adr/0008:70-76` | 쓰기 묶음 → 정착 1회 → 통지 1파동 |
| 진입당 `onChange` 1회 | `adr/0008:87-93` | 디바운스 없이 최외곽 동기 진입 하나에 한 번 |
| 커밋 번호 스탬프 | `adr/0007:34`, `adr/0008:84` | 같은 `revision`으로 찍힌 서로 다른 커밋을 비동기 검증이 식별한다 |
| 잔여 키 `rejectedKey` 계약 | `adr/0002:90` | 어떤 에러가 "키 하나를 기각한다"인지는 검증기 플러그인이 채운다 (D-3 확정 대기) |
| `extras` 칸 | `adr/0013:71` | 스키마에 없는 키를 호스트가 보존하고 방출한다 |
| 선택 가드와 `selection` 칸 | `adr/0002:38-40` | 판별식이 없는 union을 사용자가 고른다 |
| 참조 그룹 노드 | `adr/0011:58-71` | 값을 소유하지 않는 노드 종류. `virtual`이 표에 자리를 얻는다 |
| `&` 키 제거 유틸리티 | `adr/0012:19`·`open-questions.md:66` | strict 검증기를 쓰는 소비자용 선택 사항 |
| 쓰기 옵션 객체 | `adr/0013:46` | 비트 워드를 대신하고 `reset`·마운트에도 같은 모양으로 있다 |
| `terminal` 양방향 명시 | `adr/0011:54` | `terminal: false`로 인라인 입력에서도 자식을 쓴다 |
| `refresh(path)`·`remount(path)` 공개 | `adr/0008:121` | 후보. C-11 확정 대기 |
| 진단 채널 | 6라운드 D-22 | 후보. 예산 초과·리스너 throw·검증 pending을 실어 나를 단일 콜백 |
| `latent()` 잠복 값 열거 | `adr/0006:80` | 이름과 모양이 미결 |

## 5. 이주 시 소비자가 만나는 것

6라운드는 이 목록이 어느 문서에도 없다고 판정했다(발견 57·58·60·29, 귀결 "공백"). 아래는 그 판정이 센 열 가지에 §1–§4의 대조를 더한 것이다.

| 오늘 쓰던 것 | 새 설계에서 |
| ------------ | ----------- |
| `&if`로 `oneOf` 분기 고르기 | 분기에 `const`/`enum` 판별식을 넣거나, 판별식 없이 두고 선택 가드로 고른다. `&if`만으로 분기를 구분한 스키마는 **폼에서도 invalid**가 된다 |
| `then.required`로 필드 숨기기 | `then`이 조각이 되어 선언한 것이 켜지고 꺼진다. 값을 빼고 싶으면 `&active` |
| `SetValueOption.Merge` 비트 | `setValue(v, { mode: 'Merge' })` |
| `setValue(getValue())`로 값 유지 | 전체 교체이므로 로드 계약이 다시 돌고 지운 키에 `default`가 재주입된다. 막으려면 호출 단위 억제 옵션 |
| `useEffect`로 파생 값 쓰기 | 새 진입이 되어 키 입력당 `onChange`가 2회다. 권장 경로는 `&derived`·`injectTo`·리스너 |
| `node.oneOfIndex` 읽기 | 대응물이 **미확인**이다 |
| `Normalize`로 미선언 키 제거 | 사라진다. 미선언 키는 `extras`에 보존되어 방출된다 |
| `await arr.push(x)` | 동기다. `await`가 무의미해진다 |
| `afterMicrotask` 디바운스에 기댄 `onChange` 1회 | 진입당 1회로 바뀐다. 연속 `setValue` 3회는 `onChange` 3회이고, 하나로 묶으려면 `batch(fn)` |
| `virtual` 이름을 `required`에 올리기 | 사라진다. 표준 `required`에는 실제 필드만 적는다 |
| 두 분기에 동시에 맞는 값을 `anyOf`에 로드 | 분기 하나만 켜지므로 다른 분기의 키가 방출에서 빠진다 |
| `normalizedValue`·`enhancedValue`·`&pristine`·`PublicSetValueOption` | 이름과 거취가 **미결(D-23)**이거나 문서에 없다 |

## 6. 아직 정해지지 않은 것

**소유자 결정 대기(D-nn).** D-11 `&derived`가 원본을 쓰는가(권고 (a) 작성자 선언 쓰기) · D-13 `injectTo` 에지 발화의 기준점(권고 (a) 정착 시작 상태 대비) · D-14 초기 선택에서 `required`를 읽는가(권고 (a) 읽지 않음) · D-15 순환 스키마의 신호(권고 (a) settle 표시 + 개발 모드 경고) · D-16 예산 초과 시 onChange(권고 dev·prod 모두 호출) · D-17 리스너 쓰기 거부의 범위(권고 (a) 리스너 되먹임에만) · D-18 쓰기 옵션의 이름 · D-19 배열 `Merge`의 뜻(권고 통째 교체) · D-20 `select` 이름(권고 `selectBranch`) · D-21 `find`의 터미널 별칭(권고 `undefined`) · D-22 관측 채널(권고 (a) 단일 진단 콜백) · D-23 상태 칸의 공개 이름. 그 밖에 D-6(`&virtual`)·D-8 확장(여분 키만 있는 값)·C-11(명령 publish 공개)이 확정 대기다.

**미결 질문(Q-n).** Q4 표준 밖 FE 전용 조건부 필드 · Q5 `virtual`의 최종 형태 · Q7 `dependentSchemas`/`dependencies` 채택 · Q10 `if`의 공허한 참에 경고를 낼지 · Q12 union 에러 라우팅(지정된 자리 ADR 0004에 라우팅 절이 없다) · Q13 `contains`/`prefixItems` · Q14 방출 키 순서 · Q15 직전 커밋 활성 집합을 출발 가설로 쓰는 최적화 · `$ref` 해석 깊이.

**문서 간 불일치.** `&derived`의 쓰기 여부 — 읽기 전용 2곳(`adr/0007:32`·`adr/0013:41`) 대 쓰기 4곳(`adr/0013:82`·`adr/0003:21`·`adr/0001:39`·`03-mental-model.md:66`). 검증 스탬프 — `adr/0001:32`의 revision 대 `adr/0007:34`·`adr/0008:84`의 커밋 번호. 예산의 수 — `adr/0007:30-36`의 표는 다섯 줄인데 `adr/0008:77`은 "넷"이라 적고(파생과 전이를 하나로 묶는다) 6라운드는 다섯으로 센다(`reviews/round-6-coherence.md:164`). "`Merge`는 로드가 아니다" — `03-mental-model.md:41`·`adr/0013:55`의 절대 문장이 배열 경로에서 거짓이다(6라운드 발견 28, 부분). 여분 키만 있는 값의 초기 선택 — 원장은 "분기 없음"인데 프로토타입은 첫 분기를 고른다(발견 10, 명시된 교차).

**문서가 말하지 않는 것(미확인).** `Form` props 14개, `FormHandle` 8개, `NodeEventType` 17종의 개별 생사, `RequestEmitChange`/`RequestInjection`, `ValidationMode`, 공개 훅 5종, `oneOfIndex`/`anyOfIndices`의 대응물, `FormTypeInputProps.alias`, `placeholder`, `errorMessages`, `type: 'virtual'` 노드, `&` 계열의 root 폴백 우선순위, `default` 없는 키에 타입별 빈 값을 만들던 경로의 명시적 폐기.

## 7. `then`/`else`에 넣을 수 있는 것 — 한계

소유자의 질문: "`if-then`을 쓸 때 `then`의 스키마 정의에 따로 한계는 없는가? 예시가 `required`만 나온다." 재료는 `reviews/raw-round6-then-limits.md`(scout, `파일:줄` 근거).

| `then`/`else` 안의 것 | 현재 | 새 설계 | 근거 |
| --------------------- | ---- | ------- | ---- |
| `required` | **읽는 유일한 것.** `then.required`/`else.required`를 조건부 required로(else-if 체인 재귀). 가상 필드는 실 필드로 펼침 | 읽지 않는다(P1′ — 값 유효성 문법). 판정은 검증기의 에러로 보인다 | `flattenConditions.ts:53-97` / `adr/0002:76-98` |
| `properties`(새 필드 선언) | 무시. 자식 노드는 최상위 `properties`로만 만든다 — 그래서 문서가 "필드 추가·제거가 아니라 조건부 검증만"이라 적는다 | **조각의 `declares`로 읽어 새 자식 노드를 만든다.** 조각이 켜질 때 필드가 나타나고 꺼지면 방출에서 빠진다(원본은 남음) | `BranchStrategy.ts:778`, `docs/agents/…/expressions.md:116` / `adr/0002:47-52`, `adr/0005:33` |
| 기존 필드의 재선언(overlay) | 무시 | 연언 문맥(`allOf`·`if/then`)의 조각끼리만 교차(상속 overlay E12). 선언 문맥(`oneOf`/`anyOf`)끼리는 교차하지 않는다 | `adr/0002:110` |
| 같은 이름 + 다른 `type` | 무시 | 종류별 별도 노드. 둘이 동시에 켜지면 런타임 충돌(개발 모드 에러, 그 외 경고). 분석 단계에서 throw하지 않는다 | `adr/0005` §3 |
| 중첩 `if`/`then`, `allOf` 안의 `if` | 무시(`allOf` 안은 개발 경고) | 재귀 처리. 순환은 비단조 재평가 + 상한으로 드러난다(`budget-exceeded`) | `adr/0002:105-107` |
| `default` | (미확인) | 조각이 꺼짐 → 켜짐이 될 때 **없음**인 자식에만 주입(전이). 6라운드: 라운드 도중 형상 기준이라 꺼진 조각의 default가 커밋될 수 있음 — D-12 대기 | `reviews/round-4-spec.md` §A2, `reviews/round-6-coherence.md` §3.1 |
| `minimum`·`pattern`·`enum`·`const`·`x: false`·`not`·`additionalProperties` | 무시(검증기에는 그대로 전달) | 읽지 않는다. 형상에 영향 없음. `x: false`도 필드를 숨기지 않는다 — 숨기려면 `&active` | `stripSchemaExtensions.ts:43-52` / `adr/0002:76-98` |
| `&active`·`injectTo` 등 FE 키 | 무시 | **명시 규정 없음(미확인)** | — |

`if` 자체의 한계도 다르다. 현재는 `if.properties.<key>`의 `const`/`enum`(다원소 포함, 단일 원소는 스칼라로 평탄화)만 읽고 `if.required`·중첩·`not`·`allOf`는 읽지 않는다(`flattenConditions.ts:105-121`). 새 설계는 `if`를 검증기 플러그인의 `compileGuard`가 스키마 그대로 컴파일하므로 표준 `if`면 무엇이든 가드가 된다 — 판정이 서버와 같다(`adr/0002:44`, `adr/0004`).

두 설계 모두에 남는 한계: 같은 이름·다른 타입의 동시 활성, 가드의 순환(현재는 암묵, 새 설계는 지원 범위 밖 + 상한), `if`의 공허한 참(Q10 미결 — `if`에 `required`가 없으면 빈 값에서 참). 그리고 `then`에 적은 값 유효성 문법은 어느 설계에서도 "어떤 필드가 보이는가"를 바꾸지 않는다.
