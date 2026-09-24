# 09 — 정착 검토와 테스트 전략 (16라운드, 최종 검증 단계)

**상태.** 16라운드(2026-09-24). Vincent가 a-z 설계서(08)를 훑어 "크게 문제는 없다"고 한 뒤 연 최종 검증 단계의 산출물이다. 원리와 설계를 바탕으로 새 설계가 실제 코드에 내려앉을 수 있는지 검토했고(verifier 정착 검토, 조건부 통과), 그 검토 위에서 테스트·스토리북·벤치의 방향을 정했다. 원자료는 `reviews/raw-round16-{tests,storybook-core,storybook-mirror,landing-review}.md`. 검토 조건의 처분은 08에 반영했다. §8의 확인은 16라운드 답(`reviews/round-16-owner-answers.md`)으로 대부분 닫혔고, `reset`(§2.6)과 릴리스(§6.2)는 16라운드 스웜 수렴(편집자 결정)으로 닫혔다. PR-8의 판 번호는 16라운드 소유자 답으로 1.0.0-beta 뒤 1.0.0이다(§8의 열째). 남은 것은 ADR 0014 확정에 기대는 바인딩 계약 둘(§8의 일곱째)이다.

**읽는 법.** §2가 검토 결과, §3이 노드 구조, §4–§6이 테스트·스토리북·벤치의 결정, §7이 PR 계획에 미치는 것, §8이 Vincent의 확인과 답이다.

## 1. 한 문장

설계는 코드에 정착할 수 있다. 오늘의 훅 둘(`useSchemaNodeTracker`·`useSchemaNodeSubscribe`)은 그대로 맞고 바인딩에서 고칠 자리는 §2.3의 다섯이다. 부딪히는 것은 옛 엔진의 내부(분기 자동 감지, 마이크로태스크 배칭, 파서 변환, 전역 상속)뿐이고 그것은 교체 대상이다. 다만 설계 문서의 사실 오류 셋(가드 계약의 시그니처, 재사용 문장 둘, UI 플러그인 규모)을 고쳐야 했고, 바인딩 계약을 정하고 배달 경로 하나를 제안했다.

## 2. 정착 검토

### 2.1 판정과 조건 여덟

verifier가 08과 오늘의 코드를 대조해 **조건부 통과**로 판정했다(`reviews/raw-round16-landing-review.md`). 조건 여덟과 처분은 다음과 같다.

| 조건 | 처분 |
| --- | --- |
| 1 가드 계약을 (루트, 위치)로 고치고 ajv 셋에 동기 가드 경로를 두며 작성 루트 기준 캐시를 둔다 | **08·ADR 0004에 반영.** 떼어 낸 `if`는 `$ref` 때문에 단독 컴파일이 실패하고(ajv 8 실행 확인), 세 플러그인이 모두 `$async: true`이며, 같은 `$id` 루트의 재컴파일은 throw한다. `compileGuard(root, pointer)`. 캐시는 코어가 검증기 인스턴스마다 WeakMap<작성 루트 객체, { 사본, 가드 표 }>로 든다. 플러그인의 `compileGuard`는 가드 캐시를 들지 않는다. 사본 루트의 등록(루트마다 한 번의 `addSchema`와 고유 키 배정)은 플러그인의 검증기 인스턴스가 든다(ajv는 같은 키의 재등록에 실패한다, 16라운드 실행 확인). `Form`의 스키마 `clone`은 없앤다. 가드 캐시와 등록의 소유는 편집자 결정이며 16라운드 답 10으로 확정했다 |
| 2 "재사용" 두 문장을 사실대로 | **08 §17에 반영.** 교차 연산은 잎 함수만 재사용하고 병합표는 새로 쓴다(오늘은 먼저 승·얕은 덮어쓰기·무조건 throw). 식 컴파일러는 `AbstractNode` 조직 안에 있으므로 PR-1에서 청사진(`src/core/blueprint/`)으로 통째로 옮긴다. 새 엔진에서 식을 컴파일하는 곳은 청사진 하나뿐이고, `helpers/dynamicExpression/`의 `INTENT.md`는 표현식 직접 실행을 금하기 때문이다(편집자 결정, 16라운드 답 10으로 확정). 잎 함수 `intersectEnum`·`intersectConst`·`validateRange`는 공집합·충돌에서 던지지 않고 공집합 표시를 돌려주도록 바꾼다. 옛 `intersect*Schema`는 공집합 표시를 받으면 오늘처럼 던지도록 고쳐 옛 동작을 PR-7까지 지킨다 |
| 3 바인딩 계약 넷 | **§2.3에서 정함(첫째·넷째는 ADR 0014의 확정 대기, 다섯째 '유효 스키마를 따라간다'는 편집자가 더함).** 08 §17 PR-7에 반영 |
| 4 상태·오류·명령 사건과 검증 결과의 배달 경로 | **§2.4에서 정함(16라운드 답 3으로 확정).** |
| 5 되돌림 기록에 `extras`와 배열 구조 | **08 §17 PR-2에 반영** |
| 6 UI 플러그인 규모와 `options` 닫힌 목록의 충돌 | **08 §17.3·§14에 반영.** 27파일이 `options.*`·맨 키를 읽으므로 PR-7이 `presentation.*`로 옮긴다 |
| 7 공개 노드 타입·가드는 단일 클래스 겉면과 판별 인터페이스로 | **§3에서 권고함(세부는 PR-2의 `DETAIL.md`)** |
| 8 훅·바인딩 시험과 React 18 실행 | **§4.4에 넣음.** 08 §17 PR-4·PR-7에 반영(React 18 실행은 16라운드 답 5로 확정) |

### 2.2 PR별 정착 지도

| PR | 부딪히는 오늘의 코드(교체 대상) | 그대로 쓰는 것 | 새 fractal |
| --- | --- | --- | --- |
| PR-1 청사진 | `preprocessSchema`(`oneOf` 자동 감지·`virtual` `required` 재작성), `processAllOfSchema`(정적 평탄화, `if/then/else` 무시), `schemaNodeFactory`의 스키마 변이, `BranchStrategy/utils`의 조건 사전 | `stripSchemaExtensions`의 스캐너 틀(키 목록만 그룹 셋으로), 잎 교차 함수, `jsonPointer`, 옮긴 식 컴파일러 | `src/core/blueprint/`(옮긴 식 컴파일러 포함) |
| PR-2 트리·정착 | `AbstractNode`의 `onChange` 전파·`__scoped__`·`__reset__`·루트 매크로태스크 디바운스, `ObjectNode` 전략 선택, `getNodeGroup`의 `isReactComponent`(원리 다섯째 'core는 렌더러를 모른다' 위반), `core/parsers/*`(ADR 0013 충돌), `BranchStrategy.ts` | `getResolveSchema`($ref 깊이 1 지연), `extractSchemaInfo`, `omitEmptyObject`, `findNode`·`traversal`(조직에서 옮김) | `src/core/tree/`, `src/core/settle/` |
| PR-3 파생 | 의존 경로의 이벤트 구독, `InjectionGuardManager`, `getDerivedValueFactory` | `createDynamicFunction`의 의존 주입 형태 | `src/core/settle/derive/` |
| PR-4 통지·검증 | `EventCascadeManager`(노드별 마이크로태스크, 100회 throw), `ValidationManager`(실패 삼킴), `compile` 하나뿐인 계약 | 비트별 배달 원장 개념, 세대 번호, `transformErrors` | `src/core/dispatch/`, `src/core/validation/`, `app/plugin/type.ts` 개정 |
| PR-5 배열 | `ArrayNode` 전략 둘, 비동기 `push` | `resolveArrayLimits`, `omitTrailingArray`, `omitEmptyArray` | `tree/`의 배열 항목 |
| PR-6 상태 키·제어 | 루트 스키마 전역 상속, `checkComputedOptionFactory`, `mergeShowConditions` | 없음 | `settle/`의 계산 끝 |
| PR-7 전환 | `RootNodeContextProvider`, `Form`, `SchemaNodeProxy`, `SchemaNodeInput`, `useFormTypeInput`, `PluginManager`의 렌더 키트, `types/jsonSchema`의 맨 키, UI 플러그인 27파일 | 가상화(WeakSet identity), `renderForm`, `providers` 대부분, `useSchemaNodeTracker`·`useSchemaNodeSubscribe` | 기존 자리. `core/index.ts`의 수출만 새 fractal로 돌려 import 경로를 지킨다 |

`core/INTENT.md`의 "새 노드는 `AbstractNode`를 상속한다"는 PR-1에서 먼저 고친다(문서가 코드보다 먼저 바뀐다).

### 2.3 React 바인딩 계약 다섯

오늘의 훅(`useSchemaNodeTracker`의 `useSyncExternalStore` + revision, `useSchemaNodeSubscribe`의 구독 뒤 따라잡기)은 새 통지 모델에 그대로 맞는다. 새로 정한 것은 다섯이다.

1. **마운트 정착 동안 호출자 콜백을 억제한다.** 트리는 렌더 중 `useMemo`에서 만들어지고 로드 정착이 그 안에서 동기로 돈다. 구독자가 없으니 통지는 무해하지만 `onChange`·`onDiagnosticsChange`·`onError`는 억제한다(준비 전의 호출은 버린다. 청사진·마운트 오류는 `onError`에 가지 않는다, ADR 0014 §3). StrictMode의 이중 호출은 가드 캐시가 작성 루트 객체를 키로 하므로 컴파일을 두 번 하지 않는다. 이 계약은 ADR 0014 미결의 둘째·여섯째가 확정되어야 선다(§8의 일곱째).
2. **입력 출처 표식.** 공개 `SetValueOption`은 비트 넷뿐이라 Refresh 판정에 필요한 "사용자 입력에서 왔다"는 표식은 렌더 계층이 내부 통로로 넘긴다. 같은 표식은 `handleChange`의 진입 전체에 붙고, 재생성 reset으로 폐기된 노드가 늦은 입력 쓰기를 호출자 오류와 가르는 데에도 쓴다(§2.6의 일곱째). 공개 표면은 넓히지 않는다.
3. **`handleChange`는 진입 하나.** 오늘은 값 쓰기·외부 오류 지움·dirty 표시가 진입 셋이라 사슬 끝 throw에서 dirty가 빠진다. `batch` 하나로 묶는다.
4. **바운더리는 판정 인자를 받는다.** `@winglet/react-utils`의 ErrorBoundary에 "이 오류는 다시 던진다" 판정을 넘겨 `JSONSchemaError`·`SchemaFormError`·`AggregateError`만 위로 보낸다. 사용자 입력 사슬의 머리는 React 이벤트 처리기라 throw가 바운더리에 닿지 않고 전역 오류가 된다. 이것은 ADR 0014 제안 3판의 결과이며 그 미결의 여덟째(바운더리의 다시 던지기)가 확정되어야 계약이 선다(§8의 일곱째). 개발 모드에서 `onError` 관찰자가 같은 오류를 먼저 받는다.
5. **유효 스키마를 따라간다.** `useFormTypeInput`의 메모 의존에 노드의 유효 스키마 참조를 더하고, `SchemaNodeProxy`는 유효 스키마 변경 비트를 구독한다(08 §14의 35행).

문서화할 것 둘: 모든 통지가 동기이므로 렌더 중 사용자 코드의 쓰기는 React의 "렌더 중 갱신" 경고를 받는다. `startTransition` 안의 쓰기는 동기 차선으로 강등된다.

### 2.4 배달 경로 (16라운드 답 3으로 확정)

설계에 빠져 있던 것은 정착 커밋이 아닌 사건의 배달이다.

| 사건 | 배달 |
| --- | --- |
| 상태 변경(`dirty`·`touched`), 외부 오류 설정·지움, 명령(`focus`·`select`·`refresh`·`remount`) | 정착을 거치지 않는 사건이다. 같은 루트 디스패처가 **같은 진입 규칙**으로 배달한다. 최외곽 진입의 끝에서 한 번, 명령은 즉시 재발행 통로를 유지한다(`DeferrableNodeProxy`가 오늘 하는 것) |
| 검증 결과 | 약속이 풀린 뒤 커밋 번호 스탬프를 검사해 최신이면 **자기 파동**으로 오류 갱신을 배달한다. 정착 파동에 끼워 넣지 않는다. 늦은 결과는 버린다(08 §11). 이 파동의 리스너 예외는 미처리 거부로 한 번 드러나고 `onError`가 먼저 본다(ADR 0014의 `OnChange` 검증 실패와 같은 표면) |
| 유효 스키마 변경 | 정착 파동의 배달 집합에 든다(08 §7). 비트는 슬라이스 4에서 정한다 |

### 2.5 그 밖의 판단(추정 포함)

- `extras` 정적 규칙은 스캐너의 `keyword`·`variant`·`dataPath`로 구현 가능하다. 조각 표를 만드는 걸음에서 함께 뽑고, `$ref` 순환은 스캐너가 `referenceSkipped: 'cycle'`로 알린다.
- 유효 스키마 메모는 노드 위치마다 덧씌움 후보를 전순서로 매기고 활성 부분집합을 비트 집합으로 키한다. 후보에 `controls.children` 항목과 조각의 `controls`까지 넣어야 "같은 집합이면 같은 참조"가 참이 된다(추정, 비용은 재지 않았다).

### 2.6 `reset` — 로드로 충분한가 (16라운드 답 2의 검토, 16라운드 스웜 수렴(편집자 결정))

Vincent의 기준(답 2): 값의 리셋이다. 쓸데없이 캐시를 다시 만들지 않는다. `key`로 하는 리셋보다 효율적이고 안전하다. 조사는 `reviews/raw-round16-reset.md`(렌더 시험 39건 실행).

**오늘.** `reset()`은 판 번호를 올려 `RootNodeContextProvider key={version}` 아래를 다시 마운트한다(`Form.tsx:151,186`. `showError`·첨부 파일 맵 인스턴스·provider는 남고 맵의 내용은 비운다). 그래서 매번 스키마 전처리와 `clone`, 노드 트리, 검증기 컴파일(ajv8 플러그인은 매번 새 객체로 컴파일해 캐시를 빗나가고 모듈 전역 인스턴스에 쌓인다), 식 컴파일(`new Function`)을 다시 하고, 가상화는 지연 필드를 모두 다시 숨기며, 소비자가 든 노드 참조와 구독은 옛 트리를 가리킨다. 호출과 새 트리 연결 사이에는 옛 트리에 쓰는 틈이 있다. 스토리는 reset을 새 `jsonSchema`·`defaultValue` prop을 반영하는 수단으로 쓴다(`stories/20.Reset.stories.tsx`). `<Form>`이 두 prop을 마운트와 reset 때만 읽기 때문이다.

**판단.** 값의 리셋은 로드로 충분하고 오늘보다 싸고 안전하다(트리·캐시·노드 참조가 그대로이고, 동기라 틈이 없다). 로드만으로 모자란 것은 상호작용 상태, 입력 컴포넌트의 내부 상태, Form 층의 상태 셋이며 장치를 더해 닫는다. 로드로 닫을 수 없는 것은 스키마가 실제로 바뀐 경우 하나이며, 그때는 reset 호출 안에서 트리와 캐시를 새로 만든다. 판정 기준: reset 뒤의 값·상호작용 상태·표시 상태(오류와 그 표시)는 같은 prop으로 막 마운트한 폼과 같고(`key` 재마운트와 같은 결과), 노드 트리와 identity, 구독, 캐시, 렌더러와 호출자 `children`, 자식 프록시를 마운트하고 있는 입력의 비값 상태는 남는다(`key`보다 효율적이고 안전한 쪽). 지금 자식을 그리지 않는 입력, 곧 접힌 펼침 영역과 빈 배열은 다시 마운트된다.

**결정(16라운드 스웜 수렴(편집자 결정)).** 제안 열하나를 세 도출(가치, 런타임, 릴리스)과 각각의 반박으로 수렴시켰고, 게이트(조건부 통과)의 수정을 반영했다. 기준 셋을 모두 채우는 정책 질문은 없다. 소유자가 이미 답한 것(C6의 `dirty`·`touched` 현행 유지, ADR 0013의 `reset(option)` 억제 비트 양방향)은 그대로 둔다.

1. **경로 — 같은 스키마인가.** `jsonSchema` prop이 트리의 작성 루트와 같은 객체이거나, JSON으로 표현되는 부분(원시 값, 배열, 평범한 객체)이 키 순서까지 깊게 같고 그 밖의 값(함수, 컴포넌트, React 요소, 클래스 인스턴스)이 참조로 같으면 같은 스키마다(`properties`의 키 순서는 필드 순서다. 키 순서를 보지 않는 `@winglet/common-utils`의 `equals`는 그대로 쓰지 않는다). 같으면 로드, 다르면 재생성(일곱째)이다. 비교는 참조가 다를 때만 하며 비용은 스키마 크기에 비례하는 순회 한 번이다. 같은 스키마로 판정된 새 객체는 트리가 들지 않고 캐시의 키는 처음의 작성 루트 그대로다(08 §11.1). 그래서 렌더마다 새로 만드는 인라인 스키마도 함수·컴포넌트 칸이 같으면 로드를 탄다(답 2의 '불필요한 캐시 리빌드 없음', 답 10의 재생성 방지). 스키마 객체를 제자리에서 고친 뒤의 reset은 그 변경을 반영하지 않는다(바꾸려면 새 객체를 준다). `<Form>`이 `jsonSchema`·`defaultValue`를 마운트와 reset 때만 읽는 것은 오늘과 같다. 제안의 '구조 비교는 하지 않는다'를 뒤집었다. 함수·컴포넌트 칸을 참조로 보면 결과가 문서로 정해지므로 예측가능성을 잃지 않는다.
2. **값의 출처와 재대조.** reset은 호출 시점에 커밋된 prop(`jsonSchema`·`defaultValue`·`errors`·`showError`)으로 곧바로 로드하고, 호출이 돌아오면 커밋이 끝나 있다. 동시에 호출자의 갱신 차선으로 `<Form>`의 렌더를 하나 예약하고, 그 렌더의 커밋에서 prop이 reset이 쓴 것과 다르면(스키마는 첫째의 규칙, `defaultValue`·`errors`는 값의 깊은 같음, `showError`는 값) 커밋된 prop으로 reset을 한 번 더 한다. 그래서 같은 처리기에서 prop을 바꾼 뒤 부른 reset(`setRecord(b); formRef.current.reset()`, `startTransition` 안 포함)은 끝에서 새 prop을 반영하고(`startTransition` 안에서는 첫 로드의 옛 값이 한 번 그려지고 `onChange`로 나간다, 문서화), prop이 그대로인 reset(인라인 `defaultValue`로 부모가 다시 그린 경우 포함)은 로드 한 번으로 끝난다. 두 번째 reset은 독립된 진입이며 ADR 0008의 규칙대로 자기 통지를 낸다(재대조는 ADR 0008 §6의 이펙트 진입과 같은 새 진입이다). 그 경로에서는 `onChange`가 두 번이다. 예약된 재대조는 `<Form>`이 먼저 언마운트되면 버린다. prop 갱신만 `startTransition` 안에서 하고 reset은 밖에서 부른 경우는 오늘처럼 새 prop이 반영되지 않는다(문서화). 재대조의 reset은 원래 호출의 억제 비트를 그대로 쓴다.
3. **유지하는 것.** 노드 트리와 노드 identity, 청사진과 식 컴파일, 가드·사본 캐시, 검증기 등록, 유효 스키마 메모, 가상화의 드러난 기록(identity가 이어지는 노드에만), provider, `<form>`, 렌더러, 호출자 `children`.
4. **상호작용과 Form 층.** 두 경로 모두 한 진입 안에서: `dirty`·`touched`를 비우고 집계 상태가 실제로 바뀐 때만 `onStateChange`를 한 번 낸다(이미 비어 있으면 내지 않는다. `onChange`의 '바뀐 때만'과 같은 규칙. 오늘은 빠지는 것으로 판독했다, `reviews/raw-round16-reset.md` §4의 H1). 명령형 외부 오류와 검증 결과를 비우고 `errors` prop을 다시 적용한다. 첨부 파일 맵의 내용을 비운다(오늘과 같다). `showError`를 prop 값으로 돌린다(오늘은 유지된다, `Form.tsx:101`. 바뀌는 동작이며 근거는 위의 판정 기준이다). 로드이므로 `diagnostics`를 새로 적는다(예산 안이면 `stable`이 되어 `degraded` 동안의 제출 거부가 풀리고, 넘으면 다시 기록된다. 바뀌었으면 `onDiagnosticsChange`를 낸다).
5. **입력의 초기화.** core는 로드된 노드 모두에 Refresh를 낸다(오늘의 `Overwrite`와 같다. core는 React를 모른다, C3). 바인딩 계층이 입력마다 가른다. 자식 노드 프록시(래퍼가 만든 `ChildNodeComponents`로 그린 `SchemaNodeProxy`, 가상화의 `DeferrableNodeProxy` 자리 포함)를 하나라도 마운트한 입력은 컨테이너로 보아 다시 마운트하지 않는다(그 자식들이 저마다 Refresh를 받는다). 자식 프록시를 마운트하지 않은 입력(리프, 터미널, `presentation.FormTypeInput`을 가진 가상 노드, 그리고 `formTypeInputMap`·정의 목록으로 준 브랜치 입력 가운데 값 전체를 스스로 그리는 것, 예: 객체용 비제어 JSON 편집기)은 입력 컴포넌트만 다시 마운트한다. 그래서 비제어 DOM과 사용자 `FormTypeInput`의 내부 상태가 입력 단위로 초기화되고, 자식을 그리고 있는 기본 객체·배열 입력과 렌더러·`children`·`<form>`은 다시 마운트되지 않는다(오늘은 provider 아래 전부). Refresh의 범위는 ADR 0008 §7의 '그 노드의 입력 하나'와 같다(컨테이너를 다시 마운트하면 서브트리 리마운트, 곧 Remount가 된다). 컨테이너 하나에 명시로 보낸 `refresh`는 아무것도 다시 마운트하지 않는다(ADR 0008 §7). 값이 바뀌었거나 손댄 입력으로 좁히지 않는 것은 안정성 때문이다(디바운스, 값 없이 바뀐 내부 상태, 흐림 뒤 한 프레임 안의 reset). 제안의 '`options.terminal: true`로 두라'는 안내는 없앤다(구조 선언으로 UI 수명을 푸는 두 번째 장치다, G4). 남는 것: 자식을 그리면서 값에서 온 내부 상태를 따로 드는 컨테이너 입력은 그 상태가 남는다(지금 자식을 그리지 않는 입력, 곧 접힌 펼침 영역과 빈 배열은 다시 마운트된다). 그런 컨테이너 입력은 노드 값을 구독해 맞추거나 `remount`·`<Form key>`를 쓴다고 문서화한다. 이 판정(자식 프록시의 마운트 여부)을 PR-7에서 구현할 수 없다고 확인되면 '값 표시 불일치 대 다시 마운트 비용'의 맞바꿈이 남으므로 그때 소유자에게 올린다(08 §15). 포커스: 다시 마운트된 입력은 포커스를 잃고 모바일 가상 키보드가 닫힌다(오늘도 같다). 복원하지 않고 문서화한다.
6. **늦은 쓰기의 차단.** 다시 마운트로 대체된 입력 인스턴스가 뒤늦게 낸 `onChange`·`onFileAttach`(디바운스 타이머, 언마운트 때의 flush, IME 조합 끝)는 버린다. Refresh 번호는 래퍼의 React 상태(오늘의 `useFormTypeInputControl`의 `useVersion`)가 아니라 노드가 들고, 그 Refresh를 낸 커밋에서 `revision`과 함께 동기로 오른다(ADR 0008 §2의 규칙 3. 배달보다 앞서므로 리스너 안의 로드처럼 다음 파동에 배달되는 Refresh도 배달 전에 번호가 올라 있다). 래퍼는 `SchemaNodeProxy`가 Remount에 쓰는 것처럼 `useSchemaNodeTracker`로 이 번호를 읽어 `FormTypeInput`의 `key`와 `defaultValue` 메모 의존으로 쓰고, 인스턴스가 마운트될 때의 번호를 `onChange`·`onFileAttach`에 묶어 쓰기 시점의 노드 번호와 다르면 버린다. 진입은 동기라 그 사이에 타이머가 끼어들 수 없고, 구독 전에 배달을 놓친 입력도 구독 뒤 따라잡으며, `startTransition` 안의 reset도 막는 차선으로 다시 그린다. 컨테이너 입력(다섯째)은 다시 마운트하지 않으므로 이 검사를 받지 않는다(받으면 그 입력의 쓰기가 영구히 버려진다). 이 규칙은 reset이 아닌 Refresh(호출자의 전체 교체)에도 똑같이 걸린다. 흐림 뒤 한 프레임 미룬 `touched` 설정은 노드의 상호작용 초기화 번호(상태 칸 쓰기로 `dirty`·`touched`를 비울 때 오르는 노드 필드. reset, `clearState`, `controls.resetInteraction`이 올린다)를 흐릴 때 붙잡아 두고, 미룬 콜백에서 그 번호가 바뀌었으면 쓰지 않는다. 그래서 오늘의 `clearState` 경합도 닫히고, 비움이 아닌 Refresh(외부 `setValue`) 뒤의 흐림 `touched`는 그대로 남는다(제안의 'reset이 낸 Refresh에만 딸린다'를 넓혔다, G4). 이것이 없으면 옛 값이 살아 있는 노드에 쓰인다(오늘의 reset과 `key`는 옛 트리를 버려 이 문제가 없다).
7. **스키마가 다른 경로.** 트리와 캐시를 새로 만든다(비용은 `<Form key>`의 재생성과 같다). reset 호출 안에서 동기로 만들고(트리 생성은 core의 연산이다, C3), 새 트리를 로드한 뒤 돌아오기 전에 핸들(`node`·`getValue`·`setValue` 등)을 새 트리로 바꾼다. 그래서 최외곽 호출의 `reset(); getValue()`와 `reset(); setValue(x)`는 경로와 무관하게 새 트리에 닿고(열린 진입 안에서도 같다, 열째), 오늘의 틈(reset 직후 `setValue`가 사라지고 `submit`이 아무것도 하지 않음)이 재생성 경로에도 남지 않는다. React 연결은 외부 저장소(`useSyncExternalStore`)로 알려 막는 차선으로 곧바로 커밋한다(`startTransition` 안에서도 옛 화면이 입력을 받는 틈을 두지 않는다). 옛 트리는 폐기로 표시하고 리스너를 놓는다. 옛 트리를 폐기할 때 그 노드들의 Refresh 번호와 상호작용 초기화 번호를 통지 없이 함께 올려, 폐기된 트리의 입력 인스턴스가 뒤늦게 낸 `onChange`·`onFileAttach`(언마운트 때의 flush 포함)와 흐림 뒤 미룬 `touched`가 여섯째의 검사에서 core에 닿기 전에 버려지게 한다. 여섯째의 검사를 받지 않는 컨테이너 입력의 늦은 `onChange`는 `handleChange`의 진입 하나(§2.3의 셋째)로 오고 그 진입 전체(값 쓰기, 외부 오류 지움, `dirty` 표시)가 입력 출처 표식(§2.3의 둘째)을 달고 오므로, 폐기된 노드는 셋을 모두 조용히 버린다. 늦은 `onFileAttach`는 노드 쓰기가 아니라 reset을 넘어 남는 Form 층 첨부 파일 맵의 쓰기이므로(오늘의 `SchemaNodeInput.tsx:61-67`), 래퍼가 맵에 쓰기 전에 노드의 폐기 표시를 읽어 폐기된 노드면 버린다(컨테이너 입력 포함). 표식 없이 폐기된 노드에 온 쓰기, 곧 호출자가 미리 잡아 둔 옛 노드 참조로 한 쓰기는 적용하지 않고 호출자 오류(`SchemaFormError`)로 환경 불문 즉시 던진다(ADR 0014 §2의 호출자 오류 행, 확정 뒤 갱신). 그래서 폐기된 노드에서 던지는 쓰기는 호출자가 잡아 둔 옛 노드 참조로 한 것뿐이다. 입력 컴포넌트가 래퍼를 거치지 않고 `FormTypeInputProps`의 `node`로 한 쓰기도 표식이 없으므로 이 옛 노드 참조에 들며, 재생성 reset 뒤 타이머나 언마운트 정리에서 하면 던진다(문서화, 열여섯째). 노드 참조와 가상화 기록은 이어지지 않는다(노드 참조가 reset을 넘어 이어지는 것은 로드 경로뿐이다. 문서화). 옛 트리의 콜백 억제를 위한 별도 표지(오늘의 `ready`)는 필요 없다. `onChange`는 로드 경로와 같은 규칙이다(새 트리의 방출 참조는 새로우므로 사실상 한 번 낸다). 청사진 오류: reset 호출 안의 재생성에서 난 것은 `reset()`이 던지고 옛 트리는 그대로 남는다(원자적). 둘째의 재대조에서 난 것의 표면은 마운트의 청사진 오류와 같은 규칙이며 ADR 0014 미결(마운트 정착 오류, 바운더리의 다시 던지기)과 함께 닫는다. reset 호출 안의 재생성에서 새 트리의 첫 로드가 정착 예산을 넘긴 경우(옛 트리를 그대로 두고 던지는가, 원본 B로 새 트리를 세우고 사슬의 끝에서 던지는가)도 같은 미결(마운트 정착 오류)과 함께 닫는다. 개발 모드 경고: 재생성의 원인이 함수·컴포넌트 칸의 참조뿐일 때(JSON 부분은 같을 때) 한 번 알린다(그 값을 모듈 범위로 올리라는 안내). reset을 부르지 않는 인라인 스키마에는 알리지 않는다. 소비자가 든 옛 노드가 옛 트리를 붙잡는 범위(폐기 때 부모·자식 참조를 끊는가)는 PR-7 전 설계 항목이다(08 §15).
8. **검증기 등록의 수명.** 살아 있는 트리는 자기 작성 루트 객체를 강하게 든다. 사본 루트의 등록과 가드는 그 작성 루트를 쓰는 살아 있는 트리가 있는 동안 남고, 마지막 트리가 폐기되면 크기 상한이 있는 최근 해제 목록에 두었다가 밀려날 때 플러그인의 등록을 푼다(참조 세기 + 최근 해제 목록). 참조 수는 커밋(효과)에서 올리고 그 정리에서 내린다. 렌더에서 만들어졌으나 커밋되지 않은 트리의 작성 루트는 참조 수 0으로 최근 해제 목록에 든다. 목록에서 밀려날 때 플러그인 등록과 함께 코어 캐시의 그 작성 루트 항목도 지운다(다음 마운트는 사본·가드·등록을 함께 다시 만든다). 그래서 같은 스키마 객체로 다시 마운트하거나(StrictMode의 흉내 언마운트 포함) 목록 안에서 돌아오면 다시 컴파일하지 않고(재생성 방지), 메모리 상한은 가비지 수거 시점과 무관하게 '살아 있는 작성 루트의 수 + 목록 크기'로 정해진다(메모리 안정, 모바일 경제성). `FinalizationRegistry`는 정리 콜백의 호출이 보장되지 않으므로 기본 경로로 쓰지 않는다. 같은 `$id`를 가진 새 루트가 등록될 때 참조 수가 0인(최근 해제 목록에 있는) 옛 루트의 등록은 먼저 푼다. 재생성 경로의 reset에서는 새 루트를 등록할 때 옛 트리가 아직 살아 있으므로(일곱째의 원자성, 참조 수는 효과 정리에서 내린다) 이 규칙이 아니라 다음 문장의 충돌에 든다. 살아 있는 두 트리의 같은 `$id` 충돌은 PR-4의 '같은 `$id` 루트의 중복 등록 처리'가 정하며 재생성 reset 시나리오를 그 시험에 넣는다(`reviews/raw-round16-reset.md` §4의 H3). 목록의 크기와 해제 계약의 세부는 슬라이스 4의 설계 항목이다(08 §11.1·§15). 제안의 후보 `FinalizationRegistry`를 바꿨다.
9. **콜백과 검증(오늘과 다르다).** 스키마가 같은 경로의 `onChange`는 방출 값의 참조가 마지막으로 낸 값과 다를 때만 reset 진입의 끝에서 한 번 낸다(ADR 0008의 규칙). 검증은 넷째에서 결과를 비운 뒤 로드의 검증 규칙을 따르며, 이 규칙은 마운트와 reset(두 경로, 재대조 포함)에 같다(원장의 '마운트와 reset이 달라서는 안 된다', G4). `ValidationMode`의 `OnChange` 비트가 켜져 있으면 한 번 검증을 요청하고(값이 같아도 비운 결과를 다시 채운다. ADR 0008 §5에 적은 예외다), 꺼져 있으면(`OnRequest`만, `None`) 요청하지 않는다. 마운트도 이 규칙을 따르므로 `OnRequest`만 켠 폼은 마운트 때 검증하지 않는다(오늘은 모드와 무관하게 마운트와 reset 때 늘 검증한다, `Form.tsx:139`. 공개 문서의 뜻 'OnRequest: 요청할 때 검증'에 맞춘 바뀌는 동작, 08 §14의 38행). reset 전에 요청되어 아직 풀리지 않은 검증의 결과는 커밋 번호 스탬프로 버린다.
10. **열린 진입 안의 reset.** reset은 공개 쓰기 API를 거쳐 진입이 된다(ADR 0008). `batch(fn)`·`onChange`·리스너 안의 reset은 경로와 무관하게 그 로드를 호출 안에서 곧바로 정착한다(로드는 새 수명이라 앞서 표시된 쓰기를 덮는다). 그 커밋은 따로 파동을 내지 않고 그 자리의 쓰기가 받을 파동에 합류하며(`batch` 안이면 `fn` 끝의 파동 한 번, 리스너 안이면 현재 파동 뒤의 다음 파동, ADR 0008 §2의 규칙 4·§3. 두 커밋에서 바뀐 노드의 payload는 ADR 0008 §4의 체인을 따른다), 검증 요청과 `onChange`는 바깥 최외곽 진입의 끝에서 한 번이고, 같은 `fn` 안에서 reset 뒤의 쓰기는 표시만 되어 `fn`의 끝에서 정착 한 번이다. `onChange` 안의 reset은 새 진입으로 `onChange` 중첩 예산에, 리스너 안의 reset은 리스너 되먹임 사슬에 센다. 넷째의 비움과 다섯째의 Refresh는 로드와 같은 진입 안에서 일어나 정착 한 번, 통지 한 번, `onStateChange` 한 번(바뀐 때)으로 끝난다. 재생성 경로에서는 새 루트가 바깥 진입의 깊이와 배치 표시 구간, 사슬의 예산 계수와 모아 둔 오류를 이어받는다(ADR 0008 §5의 '진입 깊이는 루트별'에 적은 예외 하나). 새 트리의 로드는 곧바로 정착하지만(정착되지 않은 트리는 없다) 그 커밋도 위와 같은 파동에 합류하고, 같은 `fn` 안에서 핸들로 한 뒤의 쓰기도 그 진입에 합류한다(reset의 로드는 `fn`의 쓰기 묶음에 들지 않는 정착이다, ADR 0008 §3). 렌더 중의 reset은 React의 '렌더 중 갱신' 경고를 받는다. 언마운트된 `<Form>`의 핸들로 부른 reset은 통지 없는 로드일 뿐 오류가 아니다. 둘째의 재대조 reset은 레이아웃 효과 안의 새 최외곽 진입이며, 그 `onChange` 안에서 호출자가 상태를 바꾸면 React가 그리기 전에 동기로 다시 그린다(셋 모두 문서화). 그래서 `fn` 안에서 reset 뒤에 읽는 값과 뒤이은 쓰기의 결과는 경로와 무관하다(다른 것은 노드 identity뿐이다, 일곱째. 재생성 경로에서 새 트리의 첫 로드가 정착 예산을 넘긴 경우는 일곱째의 미결이 닫힐 때까지 이 문장에서 뺀다). `fn` 안의 `reset`의 억제 비트는 그 로드에만 들며, 로드가 `fn`의 쓰기 묶음에 들지 않으므로 ADR 0013의 배치 규칙('섞이면 억제가 이긴다')은 묶음의 쓰기끼리만 합산한다.
11. **더 강한 연산은 새 이름 없이 둘이다.** `<Form key>`는 전체 재생성(스키마 교체, 에러 바운더리 복구, 가상화 재생)으로 문서화하고, 그것이 버리는 것(핸들 인스턴스, 외부 구독, 노드 참조, `showError` 등 Form 층 상태, 첨부 파일 맵, 가상화 기록, 에러 바운더리의 fallback 상태)을 함께 적는다. 루트 바운더리가 fallback을 그리는 동안은 `ref`가 `null`이라 reset을 부를 수 없으므로 복구는 `key`뿐이다(`reviews/raw-round16-reset.md` §4의 H5, 실행 확인 전). 노드 명령 `remount`는 트리를 둔 채 그 노드의 UI만 다시 마운트한다. 그 핸들 표면(`FormHandle.remount(path)`)은 ADR 0008의 C-11(소유자 확정 대기)에 딸린다(§8의 셋째). 문서는 reset을 값 초기화의 기본으로, `key`를 그보다 강한 연산으로 소개한다.
12. **배열.** reset이 로드하는 배열의 아이템 identity는 `setValue(V)`(`Overwrite`)의 통째 교체와 같은 PR-5의 규칙을 따르고 reset만의 예외를 두지 않는다(원장의 쓰기 표에서 둘은 같은 행이다. 규칙 자체는 08 §15의 슬라이스 5 항목). 입력은 다섯째로 초기화되므로 안전은 identity 규칙이 아니라 다섯째의 범위에 기댄다. identity가 끊겨 새로 생긴 아이템은 가상화 기록이 없어 다시 지연된다.
13. **인자는 억제 비트 둘뿐이다.** `FormHandle.reset(option?)`은 `DisableAutomaticWrites`·`EnableAutomaticWrites` 두 비트만 받는다(ADR 0013의 억제 스위치 표, `06-conclusions.md`의 '`reset(option?)`은 두 비트만 받는다'). `Overwrite`·`Merge`는 받지 않는다. 둘 다 없으면 Form 속성 `disableAutomaticWrites`를 따르고, 둘 다 주면 억제가 이긴다.
14. **같은 규칙을 쓰는 이웃.** 호출자의 전체 교체 `setValue(V)`(`Overwrite`)도 로드이므로 다섯째의 입력 판정과 여섯째의 차단을 똑같이 쓴다(오늘은 컨테이너 입력 아래 서브트리 전체가 다시 마운트된다. 값 전체를 스스로 그리는 사용자 브랜치 입력은 오늘처럼 새 값을 보인다. 08 §14의 39행).
15. **노드 `resetSubtree`.** `FormHandle.reset`의 값 출처 규칙(prop)을 노드 `resetSubtree()`(오늘은 노드 생성 때의 값으로, `AbstractNode.ts:1138-1144`)에 옮기지 않는다. 두 연산은 이름과 대상(폼의 prop 상태 대 노드 하위 트리)이 달라 한 개념의 두 장치가 아니다. `resetSubtree`는 08 §13 공개 표면에 없으므로 남길지와 남길 때의 값 출처는 PR-7 전 설계 항목이다(08 §15. 노드마다 초기값 사본을 드는 것은 ADR 0006과 메모리 비용에 걸린다).
16. **문서와 시험.** PR-8의 문서 재작성(README, `docs/QUICK_REFERENCE.md`, `docs/agents`의 `validation-and-state.md`)이 적는 것: 같은 스키마의 판정(첫째), prop을 읽는 때와 재대조(둘째), 노드 참조가 이어지는 조건(로드 경로뿐), 제자리 변경 비반영, `key`가 버리는 것, 포커스, 입력 컴포넌트의 늦은 쓰기는 `node`가 아니라 `onChange`로 한다는 것(재생성 reset 뒤 `node`로 한 늦은 쓰기는 `SchemaFormError`), reset 직후 다시 마운트된 입력이 흉내 언마운트 때 같은 값을 흘려보내 `dirty`를 세울 수 있다는 것(`dirty`는 C6대로 현행 유지라 값이 같아도 선다. 개발 모드 StrictMode에서만 관측될 수 있음, 실행 확인 전). 옛 스토리는 PR-7에서 모두 정리되므로(§5.4) 이주 대상이 아니고, 새 시나리오 스토리는 스키마를 모듈 범위에 둔다. 스키마를 모듈 범위로 올리는 것은 권고다(함수·컴포넌트 칸을 렌더마다 만들면 reset이 재생성을 탄다). PR-7의 시험(§4.4): 터미널 입력의 다시 마운트(`reset.pristine:267-309`의 단언 유지), 값 전체를 그리는 브랜치 입력과 빈 배열 입력은 다시 마운트되고 자식을 그리고 있는 기본 객체·배열 입력은 아님, 대체된 입력의 늦은 `onChange`·`onFileAttach` 폐기, 재생성 reset 뒤 옛 입력(컨테이너 입력 포함)의 언마운트 flush와 늦은 `onFileAttach`, 흐림 뒤 미룬 `touched`와 컨테이너 입력의 늦은 `onChange`(그 `dirty` 표시와 외부 오류 지움 포함)는 조용히 버려지고 옛 노드 참조로 한 쓰기는 `SchemaFormError`, 흐림 직후 reset과 `clearState`의 `touched`, 같은 처리기의 prop 갱신 뒤 reset(`startTransition` 안 포함), 인라인이지만 같은 스키마의 로드(노드 identity 유지)와 함수 칸 차이의 재생성·경고, `properties` 순서만 바꾼 스키마의 reset은 재생성, `batch` 안의 두 경로(reset 뒤의 읽기와 부분 쓰기의 결과가 경로와 무관함), 검증 모드 비트별 마운트·reset 검증, `onStateChange`는 바뀐 때만, `showError` 복귀, `reset(option?)`의 억제 비트 두 방향(Form 속성 `disableAutomaticWrites`와의 우선순위, 둘 다 주면 억제)과 재대조가 원래 호출의 억제 비트를 쓰는 것, `diagnostics` 재기록과 제출 거부 해제, 가설 H1–H5(`reviews/raw-round16-reset.md` §4)의 실행 확인.

**비용.** 같은 스키마의 reset 한 번은 트리 전체 순회 한 번(로드에만 허용, 08 §7)과 자식 프록시를 그리지 않는 마운트된 입력 수만큼의 입력 다시 마운트다. 참조가 다른 같은 스키마는 스키마 크기에 비례하는 비교 한 번이 더해진다. 전처리, 검증기 재컴파일, `new Function`, 노드 재생성, 가상화 재지연이 없어진다. 같은 처리기에서 prop을 바꾼 reset은 로드가 한 번 더 든다(`defaultValue`가 깊게 같으면 건너뛴다). 검증기 등록의 메모리는 '살아 있는 작성 루트의 수 + 최근 해제 목록 크기'로 묶인다. 답 10의 고속성(최소 생성, 메모리 안정, 재생성 방지)과 같은 방향이다. 스키마가 실제로 바뀐 reset은 오늘과 같은 비용이다.

## 3. 노드 구조 — 합성으로

Vincent의 요건: 상속 구조를 그대로 두는 것, 공유 로직을 타입별로 흩어 두는 것, 불필요한 중복은 불허. 상속 구조의 세부는 개별 개발 라운드가 정해도 된다. 여기서는 그 요건이 지켜지는 틀만 정한다. 아래는 PR-2가 따를 권고이며, 클래스의 자리(생성 함수를 `tree`에 주입하는 방식 등)는 PR-2의 `DETAIL.md`가 정한다.

- **클래스 하나.** 하위 클래스 없이 단일 클래스 `SchemaNode`(런타임 이름은 PR-2가 정한다) 하나를 둔다. 공통 필드는 고정 배치하고 종류별 데이터는 한 칸(`branch`)에 담는다. 종류별 동작(합성, 투영, 입력 해석, 자식 구성)은 `KIND[kind]` 표에 둔다. 정착 알고리즘은 `settle`의 자유 함수가 레코드 위에서 돌린다. 오늘 `__value__`가 여섯 클래스에, `__emitChange__`가 여섯에, `__parseValue__`가 넷에 재정의되어 있고 전략이 네 벌(922+159, 512+282줄)인 것이 이 요건의 반례다. 터미널 객체는 잎과 같은 줄에 두고, 터미널 배열은 원본을 통째로 들되 배열 연산(`push`·`update`·`remove`·`pop`·`clear`)을 오늘처럼 원본 배열 위에서 지원한다.
- **클래스를 없애지는 않는다.** `setValue`·`find`·`subscribe`·`push`·`remove`는 공개 계약이다. 노드마다 클로저를 달면 노드 수만큼 메모리가 들고, 프로토타입 메서드를 가진 단일 클래스가 가장 싸며 모든 노드가 같은 숨은 클래스가 된다.
- **배열 메서드**는 클래스에 두되 타입은 `ArrayNode` 인터페이스에만 준다. 비배열에서 부르면 `SchemaFormError`다. UI 플러그인이 `node.push()`를 부른다. 비배열은 `type`이 배열이 아닌 노드를 말한다.
- **공개 타입과 가드는 유지한다.** `SchemaNode`는 판별 합집합 인터페이스가 되고 `InferSchemaNode` 사상은 그대로다. 공개 진입점이 노드 타입을 `type`으로만 내보내므로 클래스를 인터페이스로 바꿔도 소비자는 깨지지 않는다. `isSchemaNode`는 오늘 `instanceof AbstractNode`인데 단일 클래스 `instanceof`나 `Symbol.for` 상표로 바꾸고, 나머지 여덟 가운데 여섯은 `isSchemaNode(x) && x.type === …`로, `isBranchNode`·`isTerminalNode`는 `x.group`으로 둔다. 유지해야 하는 이유는 공개 가드 아홉, `InferSchemaNode`로 `push`가 타입 검사를 통과하는 것, 가상화의 WeakSet 키, `useChildNodeComponents`의 `isTerminalNode`, antd5 플러그인의 `node.group`이다.
- **의존 방향.** `tree`(레코드·종류 표·탐색)는 `settle`에 의존하지 않는다. 공개 메서드를 가진 겉면은 `tree`·`settle`·`dispatch`·`validation`을 합성하는 상위 fractal에 둔다. 클래스의 생성 경로를 주입으로 두어야 그래프가 비순환이다(filid 경계 §6).

## 4. 테스트 위계

### 4.1 두 층과 그 아래

| 층 | 무엇을 | 환경 | 원천 |
| --- | --- | --- | --- |
| 코어 유닛 | 청사진 표, 정착 루프, 파생, 디스패처, 검증 스탬프. 단위 시험과 **시나리오 시험**(스키마 하나로 여러 단계) | vitest, `node` | 단위는 함수 옆 `__tests__`, 시나리오는 §4.2의 데이터 모듈 |
| `<Form>` e2e | 실제 React 렌더 사이클. 마운트·입력·전환·제출·오류 표시 | vitest, `jsdom` + `@testing-library/react`(`renderForm` 하니스) | §4.2의 데이터 모듈을 `playScenario`가 해석(스토리와 같은 어댑터). 스토리북 브라우저 실행은 이 층의 미러다(§5, 16라운드 답 1로 확정) |
| 개별 함수·훅 | 순수 함수, 훅, 도구. 복수 허용 | vitest, 함수는 `node`, 훅은 `jsdom` | 함수 옆 `__tests__` |

원칙 둘. 모든 시험은 회귀를 막고 개별 함수의 동작을 표현한다. 절대 실패하지 않는 단언은 시험이 아니다(08 §18의 여섯째).

### 4.2 단일 원천 — 시나리오 데이터 모듈

코어 시나리오와 e2e와 스토리가 같은 스키마·단계를 쓰도록, 시나리오를 실행기 없는 순수 데이터로 둔다.

```ts
// packages/aileron/schema-form-scenarios/src/<이름>.scenario.ts
export const scenario = {
  name: '결제 수단 전환',
  schema: { … },                 // 새 문법
  initialValue: { kind: 'card' },
  steps: [
    { path: '/kind', action: 'setValue', value: 'bank',
      expect: { shape: { '/account': 'present', '/cardNumber': 'absent' }, outputValue: { kind: 'bank' } } },
    { path: '/account', action: 'setValue', value: '110-1234',
      expect: { errors: { '/account': [] } } },
  ],
} satisfies FormScenario;
```

- **코어 러너**는 시나리오 부류마다 한 파일(`src/core/__tests__/scenarios/<부류>.spec.ts`)이며, 데이터 모듈을 이름으로 가져와 파일당 15건 이하로 두고 노드 트리만 만들어 단계를 `find(path).setValue(value)`로 해석하고 `expect`를 형상·`outputValue`·오류·`diagnostics`에 대고 단언한다. React 없음, 타이머 없음.
- **화면 어댑터** `playScenario`는 같은 단계를 `userEvent`로 해석하고 화면에서 보이는 것(입력란의 존재, 값, 오류 문구)을 단언한다. 이 어댑터는 e2e와 스토리가 함께 쓰는 해석기이며 데이터 모듈과 같은 비공개 패키지 `@aileron/schema-form-scenarios`에 둔다(16라운드 답 8). 스토리는 e2e의 화면 미러이고 스토리북 자동화는 그 스토리의 `play`다(§5).
- 단계의 어휘는 `setValue`·`clear`·`push`·`remove`·`update`·`submit`·`reset`·`batch`로 닫고, 필요하면 PR마다 더한다. 화면 단언은 경로를 `data-path`로 찾는다(`SchemaNodeProxy`와 `DeferrableNodeProxy`가 붙인다). 화면 입력으로 풀 수 없는 단계(`batch`, `reset`, `submit`, `update`, 잎이 아닌 경로의 `setValue`)는 화면 어댑터가 `FormHandle`로 실행한다. **핸들은 그린 쪽이 DOM에 등록하고 어댑터는 받은 요소 자신과 그 자손에서 찾는다**(스토리·플러그인 패키지에서는 감싸개 루트가 받은 요소의 자손이고 e2e에서는 받은 요소 자신이다. 편집자 결정, 16라운드 답 10으로 확정). 스토리는 시나리오를 그리는 감싸개가 자기 루트 요소에, e2e는 `renderForm`이 돌려준 핸들을 `container`에 등록한다(§4.5). 등록이 DOM을 거치므로 호출 모양은 스토리·e2e·플러그인 패키지 모두 `playScenario(scenario, 요소)` 하나이고, `render(<Story />)`와 `Story.play()`가 서로 다른 스토리 문맥을 만들어도(Storybook 10.4.1) 핸들이 건너간다. 핸들을 어댑터의 인자로 넘기는 안은 호출 모양이 경로마다 달라지고 플러그인 패키지 경로에서 성립하지 않아 버렸다. 감싸개·등록 함수·표식의 이름은 PR-0의 어댑터 뼈대가 정한다.
- 수백 개 조합(검증 매트릭스)은 스토리로 만들지 않는다. 행을 정적으로 적은 `test.each` 표로 돌리되 파일당 상한을 지키고 스토리북에는 대표만 둔다(antigravity 조사의 권고와 같다).

### 4.3 기존 234파일의 처분

| 부류 | 기준 | 대표 | 규모 |
| --- | --- | --- | --- |
| 그대로 산다 | 순수 함수이거나 타입 사상, 새 엔진에 시그니처와 뜻이 그대로, 타이머 없음, 08 §14의 어느 행에도 안 걸림. 단위가 옮겨 가면 시험도 함께 옮긴다 | `helpers/jsonPointer/utils/__tests__/*`, 식 정규식 시험(옮김), 잎 교차 시험(먼저 승 관련과 `intersectEnum`·`intersectConst`·`validateRange`의 throw 단언 제외. 이 셋의 throw 단언은 '버리고 새로 쓴다'로(공집합 표시를 단언한다)), `ArrayNode/utils/__tests__`, `InferSchemaNode.type.test.ts` | 약 30 |
| 표면만 고친다 | 모든 단언의 기대값이 08 규칙에서 그대로 나오고 이름만 바뀐다(`computed` → `controls`, `normalizedValue` → `outputValue`, `FormGroup` → `FormTypeGroupRenderer`, `JSONSchemaError` → `ValidationIssue`). 단언마다 08 §14와 대조한다 | 조합·옛 키 없는 렌더 시나리오 17파일(`array.mutation-identity`, `controlled-interaction`, `default-value`, `formType-resolution`, `state-management`, `validation.errors` 등). 반례: `terminal-mode`의 "터미널 아래 `find`가 터미널을 돌려준다"는 08 §14의 17행에 걸려 재작성. 이 17파일도 스키마와 단계는 데이터 모듈로 옮기고, 단언은 이름만 바꿔 e2e의 추가 단언으로 둔다(16라운드 답 7로 확정) | 약 25 |
| 버리고 새로 쓴다 | 기대값이 08 §14 이주 행(분기 자동 감지, `oneOfIndex`, `schemaPath`, 복원, 주입 순환 차단, 루트 전역, 먼저 승, 마이크로태스크 타이밍, 파서 변환)이나 삭제될 내부를 단언한다. **상황 목록은 자산으로 옮긴다**(§4.2의 데이터 모듈로) | `core/__tests__` 87파일 가운데 옛 표면 52·타이머 의존 78, `oneOfSchemaPath`, `AbstractNode.injectTo`, `core/parsers/__tests__`, 렌더 시나리오 `composition.*`·`computed.*` | 약 150 |
| 미분류 | 위 세 부류의 기준으로 아직 가르지 않은 것. PR-0의 처분 목록에서 파일마다 가른다 | — | 약 29 |
| 새로 있어야 한다 | 설계의 새 장치마다 시험이 없다 | §4.4 | — |

### 4.4 새로 있어야 하는 시험 (PR별)

| PR | 시험 |
| --- | --- |
| PR-1 | 청사진 테이블 시험(조각 열거, 전순서, 노드 공유, `controls.discriminator` 변환과 끌어올림, `extras` 정적 집합, 역의존 표, 청사진 오류·경고), 병합표 시험, 제거 규칙 시험(키워드 위치만), 식 컴파일러 시험(옮긴 9파일 + 기준점 호스트. `regex.test.ts`의 `SIMPLE_EQUALITY_REGEX` 묶음은 그 상수와 함께 옛 엔진에 남긴다) |
| PR-2 | 정착 루프 시나리오(프로토타입 v5·v6 회귀 63+108+26+52와 v7 회귀 이식), 예산 다섯과 원본 B, `diagnostics`, `SetValueOption` 넷, 로드는 새 수명, 나감 비움 네 층 |
| PR-3 | 같은 대상 규칙(종류·문서 순서·층·전순서·정착 단위), 에지 소비, `DisableAutomaticWrites`, 개발 모드 정착 기록 |
| PR-4 | 디스패처(진입당 1회, 되먹임 상한, 구독 뒤 따라잡기), 사슬 끝 throw와 `onError`, 커밋 스탬프와 실행 합치기, (루트, 위치) 가드와 같은 `$id` 재등록, ajv6·7·8 동기 가드, 차등 시험(독립 검증기와의 판정 동치), **훅 수준 바인딩 시험**(동기 통지와 `useSyncExternalStore`, StrictMode 이중 호출) |
| PR-5 | 배열 아이템의 생김과 채움, `push`·`remove`·`update`의 identity, `omitTrailing` |
| PR-6 | 잠금 OR·표시 AND, `controls.children`, 조각 `controls`, `unsetOnInactive` 층 |
| PR-7 | e2e: 렌더 중 `onChange` 없음, 마운트 콜백 억제와 다시 던지기(§8의 일곱째 확인 대상), `degraded` 제출 거부, 입력 출처와 Refresh, `reset`의 시험 목록(§2.6의 열여섯째, 16라운드 스웜 수렴(편집자 결정)), React 18 실행(동료 의존 `>=18 <20`인데 오늘 설치는 19뿐, 16라운드 답 5) |

`hooks/`에는 오늘 시험이 하나도 없다. PR-4의 훅 시험이 처음이다.

### 4.5 `renderForm` 하니스

실제 React 렌더(`act`, `userEvent`, StrictMode, 재마운트 계측)이고 447건이 통과하므로 e2e 층의 뼈대로 쓴다. 고칠 것 다섯: `setupValidatorPlugin`에 동기 `compileGuard`와 루트 등록, `caughtErrors`가 창 이벤트만 잡으므로 다시 던지기 정책용 도우미(§8의 일곱째 확인 뒤), `reset`의 뜻(§2.6, 16라운드 스웜 수렴(편집자 결정): 호출 안의 동기 로드와 커밋 재대조), `flushOnMount: false`(26회)의 "초기 스냅숏" 뜻이 동기 정착에서 사라지는 것, 돌려주는 핸들을 `container`에 등록해 화면 어댑터가 찾게 하는 것(§4.2).

## 5. 스토리북 개편

### 5.1 원칙 셋

스토리는 e2e의 화면 미러다. 스토리북 안의 자동화 시험은 e2e를 미러한다. 중복 코드를 최소화해 관리와 회귀 방지를 함께 얻는다. 그래서 **시나리오는 한 곳(§4.2)에 있고, 스토리는 그것을 가져와 그리며, 자동화는 그 스토리의 `play`를 돌린다.**

### 5.2 구조

| 계층 | 위치 | 역할 | 돌리는 것 |
| --- | --- | --- | --- |
| 단일 원천 | 비공개 패키지 `@aileron/schema-form-scenarios`(`packages/aileron/schema-form-scenarios/`)의 `src/**/*.scenario.ts` | 스키마·초기값·단계·기대(순수 데이터). 같은 패키지에 `FormScenario` 형, 화면 어댑터 `playScenario`, 시나리오 감싸개를 둔다. 비공개 패키지라 배포되지 않으며 `@canard/schema-form`을 가져오지 않는다(16라운드 답 8) | 없음 |
| 코어 시나리오 시험 | `src/core/__tests__/scenarios/<부류>.spec.ts` | 데이터 모듈을 노드 트리에서 해석 | vitest `node` |
| 시나리오 스토리 | `stories/scenarios/<이름>.stories.tsx` | 데이터 모듈을 가져와 시나리오 감싸개로 `<Form>`을 그리고(감싸개가 핸들을 등록한다, §4.2) `play`는 `({ canvasElement }) => playScenario(scenario, canvasElement)` 한 줄 | `storybook dev`(화면), addon-vitest(자동화) |
| 스토리북 자동화 | 같은 스토리 파일 | `play`를 헤드리스 브라우저에서 | vitest 브라우저 모드 + `@storybook/addon-vitest`(playwright chromium) |
| `<Form>` e2e | `src/__tests__/e2e/*.test.tsx` | `renderForm(scenario.schema, { defaultValue: scenario.initialValue })`로 그리고(`renderForm`이 핸들을 `container`에 등록한다, §4.5), 스토리와 같은 `playScenario(scenario, container)`를 돌린 뒤, 스토리에 둘 수 없는 단언(spy, StrictMode, 다시 던지기, `onError`)만 더한다. 시나리오는 부류마다 실행기 하나(`src/__tests__/e2e/<부류>.test.tsx`, 코어 러너와 같은 부류, 파일당 15건 이하, 16라운드 답 10)가 돌리고, 추가 단언이 있는 시나리오만 자기 파일을 둔다 | vitest `jsdom` + `@testing-library/react`(16라운드 답 1) |
| 사용법 스토리 | `stories/usage/*.stories.tsx` | 문서용 소수. 시나리오를 가져오되 `play` 없음 | `storybook dev` |

한 시나리오는 파일 넷(데이터 모듈, 코어 러너, 스토리, e2e 실행기)에 나타나되 스키마와 단계는 한 번만 적힌다. 스토리 파일은 다섯 줄(제목, 가져오기, `args`, `play` 한 줄)이고, e2e는 부류마다 실행기 하나가 돌리고 추가 단언이 있는 것만 자기 파일을 둔다.

### 5.3 도구와 설정

- vitest `test.projects`의 프로젝트 셋: `unit`(`node`, `src/**/*.{spec,test}.ts`에서 `render`로 가는 `.test.ts`를 `exclude`로 뺀 나머지), `render`(`jsdom`, `src/**/*.test.tsx`(e2e와 훅 시험)와 문서 객체 모델 전역을 쓰는 `.test.ts`(오늘 후보 9파일, PR-0의 처분 목록에서 가른다)), `storybook`(`storybookTest({ configDir: '.storybook' })` 플러그인, `browser: { enabled: true, headless: true, provider: 'playwright', instances: [{ browser: 'chromium' }] }`, `setupFiles: ['.storybook/vitest.setup.ts']`에서 `setProjectAnnotations([preview])`). 오늘 `yarn test`가 모으는 `architecture/spikes/**`의 4파일 45건은 설계 실험의 기록이라 새 프로젝트에 넣지 않는다(시험은 제품의 회귀를 막는 것만 둔다, §4.1. 편집자 결정, 16라운드 답 10). 그 가운데 제품 동작에 남는 상황은 PR-7의 e2e로 옮긴다.
- 더할 의존: `@storybook/addon-vitest`(Storybook 10.4와 vitest 3.2에 호환), `@vitest/browser`(`playwright` 1.58.0은 루트에 이미 있다). 루트의 `@storybook/test-runner` 0.24는 뺀다(스토리북 서버를 띄워 주소를 순회하는 구식 경로).
- portable stories는 프레임워크 패키지 `@storybook/react-vite`의 `composeStories`·`composeStory`·`setProjectAnnotations`. `Story.run()`(8.2.7 이상)이 마운트·loaders·`play`를 한 번에 돌리고, 플러그인 패키지가 코어의 시나리오 스토리를 돌릴 때는(§5.4) `render(<Story />)` 뒤 `await Story.play({ canvasElement })`(두 호출의 스토리 문맥은 다르지만 핸들은 DOM의 등록으로 건너간다, §4.2).
- `play` 안의 `expect`는 `storybook/test`의 것이며 vitest 단언과 같아 화면(인터랙션 패널)과 자동화 양쪽에서 같은 결과를 낸다. `step`은 패널용 래퍼라 vitest에서는 투명하다.

### 5.4 옛 스토리 49파일 33,533줄의 처분 (16라운드 답 4: 전체 정리 허용)

- 시나리오를 담고 있는 스토리(분기 전환, `allOf`, 조건부, 배열, 검증, 오류 표시)는 데이터 모듈로 옮기고 `stories/scenarios/`의 다섯 줄 스토리가 된다.
- 사용법을 보여 주는 스토리(플러그인 소개, `FormTypeInput` 교체, `Form.*` 합성 API, ref 핸들)는 `stories/usage/`에 소수만 남기고 새 문법으로 다시 쓴다.
- 스키마를 인라인으로 든 스토리는 남기지 않는다. 플러그인 패키지의 스토리(각 2–4파일)도 같은 규칙이며 코어의 시나리오 스토리를 `composeStories`로 가져와 자기 렌더러로 그린다.

## 6. 벤치마크와 릴리스 테스트

### 6.1 옛 판과 새 판의 속도 비교

- **하니스는 `@aileron/benchmark-form`이다.** 이미 npm alias로 옛 판 다섯(`@canard/schema-form_0.9.0` … `_0.12.5`)과 워크스페이스 판을 나란히 설치해 비교하고 있고, `render-trace.tsx`가 경로별 렌더 커밋 수를 센다. 새 항목만 더한다.
- **기준점은 같은 폼이다.** 스키마 문법이 호환되지 않으므로 `fixtures/equivalent/<이름>.ts`에 옛 문법과 새 문법의 쌍을 두고, 쌍마다 두 판의 `<Form>`이 같은 상호작용 열 뒤에 같은 `[data-path]` 집합을 그리는지(`renderForm`의 `renderedPaths()`와 같은 선택자 `[data-path]:not([data-deferred])`를 `@aileron/benchmark-form` 안에서 판마다 쓴다. `data-path`를 그리지 않는 0.9.0은 이 대조에서 뺀다)를 시험이 단언한다(다르면 벤치가 아니라 시험이 실패한다). 상호작용 열도 쌍에 같이 둔다.
- **둘로 나눠 잰다.** 코어(`node` 환경, 트리 생성·값 갱신·정착 시간)와 렌더(React 19, `<React.Profiler>`의 커밋 수와 `actualDuration`, `render-trace`의 번짐).
- **조건.** 워밍업 10회 이상, 표본 100회 이상, 평균 대신 중앙값과 99번째 백분위, `node --expose-gc`로 표본 사이 명시적 수집. 결과는 `results/`에 날짜와 커밋으로 남긴다.
- **패키지 벤치 일곱**(`bench/*.bench.ts`: `branch-strategy-init`, `compute-recalculate`, `event-cascade`, `find-node`, `nodeFromJSONSchema`, `object-pending-read`, `render-delay`)은 새 엔진의 대응물로 다시 쓴다. 이름은 새 fractal을 따른다(`blueprint`, `settle`, `dispatch`, `find`, `load`). 옛 엔진에서 마지막 기준선을 `bench:baseline`으로 남긴다. 이름이 바뀌므로 옛 판 대 새 판의 비교는 `@aileron/benchmark-form`만 맡고, 패키지 벤치는 새 엔진 안의 회귀 감시로 쓴다. 지속 통합 작업 흐름 `.github/workflows/performance-benchmarks.yml`의 과다 렌더 단언과 회귀 검사는 PR-7에서 새 기준선으로 갱신한다.
- **게이트(16라운드 답 6으로 확정).** PR-7 병합 전과 릴리스 전에 돌린다. 옛 판보다 느린 항목이 있으면 이유를 적고 Vincent가 받아들여야 병합한다. 옛 판보다 느린 것(대표적으로 `if`-`then`으로 스키마를 제한 없이 넓히는 문법)은 두 조건을 지킨다. 통제 가능: 비용이 입력 크기(가드 수, 조각 수, 재계산 목록의 크기)에 예측 가능하게 자라고, 가드 컴파일은 작성된 위치당 한 번이며(§2.1의 조건 1), 한 정착은 예산 다섯 안에서 끝난다(08 §7)(편집자 도출). 일정 수준: 상한을 둔다. 상한의 형태(옛 판 대비 배율인가 절대 수치인가)와 수치는 ADR 0009의 미결이며 기준선을 잰 뒤 Vincent가 정한다.

### 6.2 릴리스와 릴리스 테스트 (16라운드 답 9: changesets로 바꾸고 다시 쓴다, 16라운드 스웜 수렴(편집자 결정), 판 번호는 소유자 답으로 확정)

**오늘**(조사, `reviews/raw-round16-release.md`).

- 워크플로는 둘이다. `performance-benchmarks.yml`(벤치와 과다 렌더 단언)과 수동 실행 전용 `publish-npm-packages.yml`이다. 배포는 `scripts/publish-packages.sh`가 `yarn pack`으로 `workspace:^`를 실제 범위로 바꾸고 이미 있는 판은 건너뛰며 npm OIDC(저장 토큰 없음)로 올리고, `scripts/tag-packages.sh`가 태그만 만든다. GitHub Release는 없다.
- `yarn lint`·`typecheck`·`test`·스토리북 빌드를 돌리는 워크플로가 없다.
- 판은 손으로 올린다(`yarn version`). `@canard/schema-form` 계열 여덟(본체, ajv6·ajv7·ajv8 플러그인, antd5·antd6·antd-mobile·mui 플러그인)은 같은 판(0.16.0)으로 움직인다.
- changesets는 `@changesets/cli`·`@changesets/changelog-github`와 루트 스크립트만 있고 `.changeset/`이 없다. 루트 `CLAUDE.md`는 changesets를 쓰지 않는다고 적는다.
- 릴리스 전 점검이 없다. `@aileron/production-testbed`와 가져오기 시험 스크립트(`scripts/test-package-import.sh` 등)는 어느 워크플로도 부르지 않는다.

**결정(16라운드 스웜 수렴(편집자 결정)).** PR-8의 판 번호는 소유자가 정했다(열넷째, §8의 열째).

1. **changesets 가동.** `.changeset/config.json`: `changelog: ["@changesets/changelog-github", { "repo": "vincent-kk/albatrion" }]`(repo 옵션이 없으면 생성기가 던진다), `fixed: [["@canard/schema-form", "@canard/schema-form-*-plugin"]]`(여덟), `privatePackages: { version: false, tag: false }`(기본값은 비공개 패키지의 판을 올린다), `baseBranch: "master"`, `updateInternalDependencies: "patch"`(기본값), `changedFilePatterns`는 아홉째. `fixed`의 근거: 플러그인 일곱은 `@canard/schema-form`을 동료 의존으로 선언하지 않아 사용자에게 보이는 호환 신호가 같은 판 번호뿐이고(일관성), C7이 무리의 동행을 요구한다. 비용: `@winglet/*`의 patch 하나도 본체를 거쳐 무리 여덟의 재배포로 번진다(받아들인다). 플러그인이 나중에 `@canard/schema-form`을 `workspace:^` 동료 의존으로 선언하면 동료의 minor에도 무리 전체가 major로 번지므로 그때 `___experimentalUnsafeOptions_WILL_CHANGE_IN_PATCH.onlyUpdatePeerDependentsWhenOutOfRange: true`를 둔다. `changeset version`은 `@changesets/changelog-github`가 `GITHUB_TOKEN`을 요구하므로 `changesets/action` 안에서만 돈다.
2. **배포는 오늘의 스크립트, 태그는 `changeset tag`.** `changeset publish`는 pnpm이 아니면 `npm publish`를 불러 `workspace:` 범위를 바꾸지 않고 설정 기본값 `access: restricted`로 올리므로 쓰지 않는다. 루트 스크립트 `"release": "./scripts/publish-packages.sh && changeset tag"`를 두고 `changesets/action`의 `publish: yarn release`로 부른다(액션 입력에 `&&`를 직접 쓰지 않는다). 액션은 `changeset tag`의 `New tag:` 줄과 각 패키지의 `CHANGELOG.md`로 GitHub Release를 만든다. 태그 형식은 오늘과 같다(`<이름>@<판>`, 있는 태그는 건너뛴다). `dry_run`은 액션을 거치지 않는 별도 단계(`DRY_RUN=true ./scripts/publish-packages.sh`)로 가른다(액션을 거치면 올리지 않은 판에 실제 태그와 Release가 생긴다). 한 패키지의 실패는 `exit 1`로 태그를 막고, 복구는 같은 커밋에서 실패한 작업을 다시 돌리는 것이다(새 푸시로 다시 돌리면 태그가 배포된 커밋을 가리키지 않는다). 첫 가동 전 확인: 커밋 해시로 고정한 액션 원본에서 태그 푸시, `publish` 입력의 분할, `~/.npmrc`의 `_authToken` 처리가 OIDC와 부딪히지 않는지, `CHANGELOG.md`가 없을 때의 동작을 읽는다. npm Trusted Publisher 등록(`scripts/PUBLISHING.md`의 체크리스트)을 끝낸다. 망가진 `changeset:publish`(`yarn run:all && changeset publish`)는 지운다.
3. **작업 흐름은 `publish-npm-packages.yml` 한 파일.** npm Trusted Publisher가 이 파일 이름에 묶여 있다(옮기면 공개 패키지 열여섯을 `npm login`과 이중 인증으로 다시 등록한다). 실행 조건은 `push: master`와 `workflow_dispatch`(`dry_run` 유지). 작업 다섯: `version`(`changesets/action`을 `publish` 없이 돌려 판 올림 PR을 만들거나 갱신하고 `hasChangesets`를 낸다. `github.ref`가 `refs/heads/master`일 때만. 권한 `contents: write`·`pull-requests: write`, `id-token` 없음), `detect`(`hasChangesets`가 거짓이고 태그 없는 공개 패키지 판이 있으면 참을 낸다. `fetch-depth: 0`의 git 태그로 본다), `test`(`uses: ./.github/workflows/test.yml`, `if: needs.detect.outputs.pending == 'true'`. 재사용 작업 흐름을 부르는 작업은 단계를 가질 수 없어 `detect`와 가른다), `publish`(`needs: [detect, test]`, 권한 `id-token: write`·`contents: write`, 빌드(rolldown 경고 차단 단계 유지) → 릴리스 테스트(여섯째) → `changesets/action`의 publish), `release-test`(`needs: version`, `if: needs.version.outputs.hasChangesets == 'true'`, 빌드(rolldown 경고 차단 단계 포함)와 여섯째의 릴리스 테스트, 권한 `contents: read`). `concurrency`(`publish-npm-packages`, 취소 없음)는 그대로다. 작업 흐름 머리의 설명을 새 실행 조건에 맞게 고친다.
4. **토큰은 기본 `GITHUB_TOKEN`.** GitHub App 토큰이나 개인 토큰을 두지 않는다. 최소 권한 규칙이며, changesets 표준 예시도 기본 토큰이다. 기본 토큰이 연 판 올림 PR에서는 다른 작업 흐름이 돌지 않으므로, '시험을 통과한 것만 나간다'는 판 올림 PR의 병합 조건이 아니라 배포 작업의 `needs: test`가 지킨다(배포할 바로 그 커밋을 검사한다). 판 올림 PR은 판 번호와 변경 기록만 바꾸고 코드는 이미 `master` 푸시의 시험을 거쳤으므로 병합 뒤 실패하는 창은 좁다(실패 때는 여덟째). 소유자의 손 작업 하나: 저장소 설정 'Allow GitHub Actions to create and approve pull requests'를 켠다(이름과 동작은 첫 가동 때 확인).
5. **지속 통합 시험 작업 흐름 `.github/workflows/test.yml`을 새로 둔다.** 실행 조건은 `pull_request`, `push: master`(문서만 바뀌는 푸시는 `paths-ignore`), `workflow_call`. 단계: `yarn install --immutable`, 의존 빌드, `yarn lint`, `yarn typecheck`, `yarn test`. 루트에는 오늘 `lint`·`typecheck`·`test` 스크립트가 없으므로(루트 `CLAUDE.md`는 있다고 적는다) 전환 PR이 루트에 `yarn workspaces foreach --all --topological-dev run <이름>` 형태로 더한다. 공개 패키지 전부(`@winglet/*`, `@lerx/promise-modal`, `@slats/agents-assets-sync` 포함)의 시험이 같은 관문 뒤에 선다. PR 실행에는 아홉째의 `changeset status`를 더한다. 브랜치 보호의 필수 검사로는 삼지 않는다(기본 토큰의 판 올림 PR에서는 보고되지 않는다). schema-form의 vitest 세 프로젝트와 `storybook` 프로젝트의 playwright chromium 설치는 PR-0이 이 파일에 더한다(전환 PR이 먼저 병합되면 schema-form은 오늘의 단일 `vitest run`으로 시작한다).
6. **릴리스 테스트를 다시 쓴다 — 포장된 산출물을 검사한다.** (1) 포장: 판 가드 없이 공개 패키지 전부를 `yarn pack`하는 `scripts/pack-packages.sh`를 `publish-packages.sh`에서 떼어 내고 둘이 함께 쓴다(오늘은 판 가드가 `yarn pack`보다 앞이라 레지스트리에 있는 판은 포장되지 않는다). 비공개 `@aileron/schema-form-scenarios`도 포장한다. (2) 설치: `@aileron/production-testbed`를 저장소 밖 임시 폴더로 복사하고(워크스페이스 안에서는 `workspace:^`가 원본으로 풀린다), 공개 워크스페이스 전부(`@winglet/*`, `@lerx/promise-modal` 포함, 배포되지 않은 의존의 폐포)를 포장 파일로 강제하며(overrides), 플러그인 의존을 더하고, 제3자 의존의 판은 루트 `yarn.lock`의 판으로 고정한다(방법은 전환 PR이 정한다). React 18과 19는 설치 단계의 판 덮어쓰기로 고른다(답 5). (3) 검사: `skipLibCheck: false`인 별도 tsconfig로 배포된 `.d.ts`의 형 검사, 설치된 패키지 이름으로 ESM `import`와 CJS `require`(오늘의 가져오기 시험 스크립트를 옮겨 쓴다), testbed 빌드, 대표 시나리오 그리기(감싸개에 포장된 `Form`을 주입, §8의 아홉째). 조합은 쌍으로 덮는다: UI 플러그인 넷을 각각 ajv8과, ajv6·ajv7을 각각 UI 하나와 짝지어 React 판마다 여섯, 모두 열둘(UI 플러그인과 검증기 플러그인은 서로를 가져오지 않고 코어 계약으로만 만난다. 코어를 거치지 않는 경로가 나오면 곱으로 되돌린다). (4) 시점: 변경이 대기 중인 `master` 푸시(판 올림 PR이 갱신될 때)에 셋째의 `release-test` 작업으로 한 번, 셋째의 `publish` 작업 안에서 빌드 뒤·올리기 전에 같은 빌드로 한 번.
7. **배포 시점: 판 올림 PR을 병합하면 자동으로 배포한다.** `master`에 태그 없는 공개 판이 있고 대기 중인 changeset이 없으면 `detect → test → publish`가 돈다. '언제 나가는가'의 통제는 소유자가 판 올림 PR의 병합을 누르는 동작으로 남고(오늘의 작업 흐름 머리가 지키던 것), 수동 실행을 남기면 `master`의 판·`CHANGELOG.md`와 npm·태그가 어긋나는 창이 생긴다. 판 변경이 어떤 길로든 `master`에 들어오면(직접 푸시 포함) 배포된다는 것을 `scripts/PUBLISHING.md`에 적는다. `workflow_dispatch`는 실패 뒤 다시 돌리기와 `dry_run` 점검용으로 남는다. 첫 가동은 안전하다(공개 패키지 열여섯의 현재 판은 모두 태그가 있다).
8. **병합 뒤 시험 실패의 복구.** 판 올림 PR 병합 뒤 `test`가 실패하면 고치는 커밋에 patch changeset을 더해 다음 판으로 낸다. 실패한 판은 배포되지 않은 채 건너뛴다(그 `CHANGELOG.md` 제목은 남는다). 같은 판 번호로 고친 것을 올리면 그 수정이 변경 기록에 빠지므로 하지 않는다.
9. **changeset 존재 검사.** 시험 작업 흐름의 PR 실행에 `yarn changeset status --since=origin/${{ github.base_ref }}`를 넣고(`checkout`은 `fetch-depth: 0`) 없으면 실패하게 한다. 릴리스가 필요 없는 변경은 `changeset add --empty`로 통과한다. 우산 브랜치로 가는 PR은 `changeset add --empty`로 통과하고, `fixed` 무리의 동작 변경 기록은 PR-8의 changeset이 맡는다(무리 밖 패키지는 열한째처럼 그 패키지를 바꾸는 PR이 자기 changeset을 더한다). `changedFilePatterns`는 패키지 폴더 기준의 부정 패턴으로 둔다: `["**", "!architecture/**", "!**/INTENT.md", "!**/DETAIL.md", "!CLAUDE.md", "!stories/**", "!bench/**", "!**/*.test.*", "!**/*.spec.*", "!**/__tests__/**", "!vitest.config.*"]`(`docs/**`·`bin/**`·`scripts/**`·빌드 설정·`README.md`는 배포되는 입력이라 남긴다). 적용 전에 문서만 바꾼 PR과 `docs/agents`를 바꾼 PR로 `changeset status --verbose`를 돌려 확인한다. 소유자의 직접 푸시는 이 검사가 막지 못하므로 루트 `CLAUDE.md`의 규칙(열째)이 덮는다.
10. **자리와 저장소 정리 — 별도 PR, PR-8 전에 병합.** 저장소 전체의 일이라 재설계와 독립이며 PR-0과는 순서가 없다(다섯째). 그 PR이 함께 하는 것: 루트 `CLAUDE.md`의 개발 흐름 6번(판을 손으로 올리고 changesets와 CHANGELOG를 쓰지 않는다)을 'changeset을 쓴다'는 규칙으로 바꾸고, 명령 목록을 다섯째의 루트 스크립트와 맞추며, 스킬 표의 `release-note-generator` 설명을 고친다. `scripts/PUBLISHING.md`의 평상시 절차와 트리거를 새 흐름으로 다시 쓴다. 로컬 폴백(`yarn publish:changed`, 소유자가 둔 이중 인증 경로)은 남기되, 판 올림은 판 올림 PR로만 하고 로컬 폴백은 병합된 판의 올리기만 대신한다고 적는다. 태그는 `yarn changeset tag && git push --tags`. 판을 changeset 없이 정하는 둘째 길인 루트 `major:all`·`minor:all`·`patch:all`, 패키지들의 `version:*`, `tag:packages`와 `scripts/tag-packages.sh`, 망가진 `changeset:publish`는 지운다(근거는 예측가능성: 판을 정하는 길은 하나다). 이 변경 전부터 `publish-packages.sh`에 밀려난 `publish:all`과 패키지별 `publish:npm`·`build:publish:npm`은 지우지 않고 PR 본문에 적는다. `.claude/skills/release-note-generator`는 남기되 '`.changeset/*.md` 본문 쓰기와 다듬기'(특히 PR-8의 파괴적 변경 changeset과 이주 안내)로 역할을 좁힌다(이미 `knowledge/changeset-enhancement-guide.md`가 있다).
11. **무리 밖 패키지.** PR-7이 바꾸는 `@winglet/react-utils`(ErrorBoundary의 다시 던지기 판정 인자, 더하기만 하는 변경)는 PR-7에서 자기 changeset(`minor`)을 더한다. 본체의 `workspace:^`는 포장 때 그 판으로 바뀌고, 릴리스 테스트는 여섯째의 폐포로 그것을 포장해 넣는다. 범위 밖 판 변경이라 `@lerx/promise-modal`도 patch로 함께 배포된다(`fixed` 무리의 UI 플러그인은 PR-8의 판으로 묶인다).
12. **제3자 액션은 커밋 해시로 고정한다.** `changesets/action`, `actions/checkout`, `actions/setup-node`는 `id-token`·`contents` 쓰기 권한을 가진 작업에서 돈다(판 고정 규칙, `.yarnrc.yml`의 공급망 방어와 같은 방향).
13. **GitHub Release는 changesets의 기본대로 패키지 태그마다 하나다.** `fixed` 무리가 오르면 여덟이 생긴다. 모아 하나로 만드는 새 코드는 두지 않는다(태그와 Release가 하나씩 맞는 쪽이 예측 가능하다).
14. **PR-8의 판 번호 — 1.0.0-beta 뒤 1.0.0(16라운드 소유자 답으로 확정).** Vincent의 답: "(나) 1.0.0-beta를 먼저 내고 1.0.0 예상합니다". PR-8의 changeset은 `major`이고(0.16.0 → 1.0.0), 먼저 프리릴리스 모드(`changeset pre enter beta`)로 `fixed` 무리 여덟을 1.0.0-beta.N으로 낸다. 프리릴리스는 `latest`를 건드리지 않도록 dist-tag `beta`로 올린다. `publish-packages.sh`가 판의 프리릴리스 식별자에서 dist-tag를 정한다(더하기만 하는 확장). 실제 소비자가 이주 안내와 이주 프롬프트를 먼저 시험하고 안정성을 확인한 뒤 `changeset pre exit`로 1.0.0을 낸다. 1.0.0부터는 파괴적 변경마다 `major`를 요구하는 안정 약속이 시작된다.

## 7. PR 계획에 미치는 것 (08 §17 보정)

| PR | 더해진 것 |
| --- | --- |
| PR-0 | 시나리오 데이터 모듈의 형(`FormScenario`)과 코어 러너·화면 어댑터 `playScenario`의 뼈대(시나리오 감싸개와 핸들 등록 포함), vitest `test.projects` 셋, addon-vitest 설치, 옛 스토리의 처분 목록, 패키지 `CLAUDE.md`의 'Render-Level Test Harness' 절 개정(신규 시나리오의 자리와 파일당 상한을 §4.2·§5.2에 맞춘다), 비공개 패키지 `@aileron/schema-form-scenarios`의 생성(§5.2), 릴리스 전환 PR 뒤라면 `test.yml`에 vitest 세 프로젝트와 playwright chromium 단계(§6.2의 다섯째) |
| PR-1 | 식 컴파일러(`createDynamicFunction`과 그 `utils`, `JSON_POINTER_PATH_REGEX`, `getPathManager`, `DynamicFunction` 형)를 `src/core/blueprint/`로 통째로 옮김(PR-7까지는 옛 엔진도 쓰므로 청사진 진입점이 이름으로 내보내고 그 유지 이유를 청사진의 `DETAIL.md`에 적는다. 옛 소비자는 import만 고침), 잎 교차 함수를 새 fractal로 옮김(옛 `intersect*Schema`는 공집합 표시를 받으면 오늘처럼 던지도록 고쳐 옛 동작을 PR-7까지 지킨다), `core/INTENT.md` 개정 |
| PR-2 | 되돌림 기록 항목 확정(§2.1의 조건 5), 노드 합성 구조(§3) |
| PR-4 | ajv6·7·8의 동기 `compileGuard(root, pointer)` 구현과 코어의 사본·가드 캐시, 훅 수준 바인딩 시험, 같은 `$id` 재등록, 배달 경로(§2.4), 검증기 등록의 참조 세기와 최근 해제 목록, 재생성 reset의 같은 `$id`(새 루트를 등록할 때 옛 트리가 아직 살아 있으므로 살아 있는 두 트리의 충돌로 다루고 reset의 원자성을 지킨다, §2.6의 일곱째·여덟째, 16라운드 스웜 수렴(편집자 결정)) |
| PR-7 | 바인딩 계약 다섯(§2.3. 첫째·넷째는 §8의 일곱째 확인 뒤), UI 플러그인 27파일의 `presentation.*` 이주, `renderForm` 다섯(§4.5), 부류별 e2e 실행기, React 18 실행, 배달 경로의 렌더 계층 구독(§2.4), 시나리오 스토리와 `playScenario`, 옛 스토리 49파일 전체 정리, `architecture/spikes/**` 가운데 제품 동작에 남는 상황의 e2e 이식(§5.3), `Form`의 스키마 `clone` 제거, `reset`의 로드 전환(같은 스키마 판정, 커밋 재대조, 호출 안의 재생성, 자식 프록시 마운트 여부로 가르는 입력 판정, 노드가 드는 Refresh 번호와 상호작용 초기화 번호), 로드의 검증 규칙(마운트 포함), `setValue(V)`의 같은 입력 판정(§2.6, 16라운드 스웜 수렴(편집자 결정)), `@winglet/react-utils`의 changeset(`minor`, §6.2의 열한째) |
| PR-8 | 릴리스 전 벤치 재실행, changeset(파괴적 변경, `fixed` 무리 전체 `major`. 1.0.0-beta 프리릴리스 뒤 1.0.0, §6.2의 열넷째)과 `CHANGELOG.md`, 포장된 산출물의 릴리스 테스트(§6.2, 16라운드 스웜 수렴(편집자 결정)), README·`docs/QUICK_REFERENCE.md`·`docs/agents`의 reset 규칙(§2.6의 열여섯째), 스토리북 문서 |
| 릴리스 전환(별도 PR) | changesets 가동, 지속 통합 시험 작업 흐름과 루트 `lint`·`typecheck`·`test` 스크립트, `publish-npm-packages.yml`의 작업 다섯, 포장 스크립트 분리와 릴리스 테스트 재작성, 판 올림 스크립트 정리와 루트 `CLAUDE.md`·`scripts/PUBLISHING.md` 개정(§6.2, 16라운드 스웜 수렴(편집자 결정)). 저장소 전체의 일이라 재설계와 독립이며 PR-8 전에 병합한다. PR-0과는 순서가 없다 |

## 8. Vincent의 확인과 답

답의 원문은 `reviews/round-16-owner-answers.md`에 있다. 괄호 안의 답 번호는 그 파일의 확인 번호다.

1. **e2e 층의 정의 — 확정(답 1).** `<Form>` e2e는 vitest `jsdom` + `renderForm`으로 시나리오를 그리고 `playScenario`로 돌리며, 실제 브라우저 실행은 스토리북 자동화(addon-vitest)가 맡는다.
2. **배달 경로 — 확정(답 3).** §2.4대로.
3. **`FormHandle.reset` — 16라운드 스웜 수렴(편집자 결정)으로 닫힘(답 2).** 값의 리셋은 로드로 충분하다. 같은 스키마(같은 객체이거나, JSON 부분이 키 순서까지 깊게 같고 함수·컴포넌트 칸이 참조로 같음)면 로드이고, 다르면 reset 호출 안에서 트리와 캐시를 새로 만들어 핸들을 바꾼 뒤 돌아온다. 값은 호출 시점에 커밋된 prop이며, 같은 처리기에서 prop을 바꾼 reset은 그 커밋에서 한 번 더 반영한다. 입력은 자식 프록시를 그리지 않는 입력만 다시 마운트하고 대체된 입력의 늦은 쓰기는 버린다. 검증기 등록은 참조 세기와 최근 해제 목록으로 결정적으로 푼다. `reset(option?)`은 억제 비트 둘만 받는다(ADR 0013). 제안에서 바뀐 것과 근거는 §2.6. 딸린 것: 노드 명령 `remount`의 핸들 표면은 ADR 0008의 C-11(소유자 확정 대기)에, 재대조에서 난 청사진 오류와 호출 안의 재생성에서 난 정착 오류의 표면은 ADR 0014(§8의 일곱째)에 딸린다. 폐기된 트리에 온 호출자 쓰기는 호출자 오류로 환경 불문 즉시 던진다(ADR 0014 §2의 호출자 오류 행, 확정 뒤 갱신). 입력 판정(자식 프록시의 마운트 여부)을 PR-7에서 구현할 수 없다고 확인되면 그때 소유자에게 올린다.
4. **옛 스토리의 처분 — 확정(답 4).** 전체 정리를 허용한다.
5. **React 18 — 확정(답 5).** PR-7에 React 18 실행 시험을 둔다.
6. **벤치 게이트 — 확정(답 6).** §6.1대로. 느린 것은 통제 가능하고 일정 수준 안이어야 한다.
7. **바인딩 계약의 전제 — ADR 0014의 확인 대기.** 마운트 콜백 억제와 바운더리의 다시 던지기는 ADR 0014 미결의 둘째(관찰자의 뜻)·여섯째(마운트 정착 오류로 폼이 서지 않음)·여덟째(바운더리의 다시 던지기) 확정에 기댄다. ADR 0014의 확인과 함께 닫는다.
8. **17파일의 단언 유지 — 확정(답 7).** 08 §18의 넷째에 예외로 적었다.
9. **시나리오 모듈의 자리 — 확정(답 8).** 비공개 워크스페이스 패키지 `@aileron/schema-form-scenarios`(`packages/aileron/schema-form-scenarios/`). 이름은 Vincent가 편집자에게 맡겼고, 형제 비공개 패키지(`@aileron/benchmark-form`, `@aileron/production-testbed`)의 자리를 따르며 담은 것(schema-form의 시나리오)이 이름에서 읽히게 했다. 그 패키지는 `@canard/schema-form`을 값으로도 형으로도 가져오지 않는다(가져오면 schema-form의 시험과 서로 가져오는 고리가 된다). 그래서 `Form`·`FormHandle`·`FormScenario.schema`는 구조적 형으로 적고, 시나리오 감싸개는 `Form`을 주입받는다. 가능한지는 PR-0이 확인한다.
10. **릴리스 — 16라운드 스웜 수렴(편집자 결정)으로 닫힘(답 9), 판 번호는 소유자 답으로 확정.** 릴리스는 changesets 표준 방식(`fixed` 무리 여덟, 배포는 오늘의 스크립트, 태그는 `changeset tag`, 작업 흐름 파일 하나, 기본 `GITHUB_TOKEN`, 배포 직전 시험 관문, 포장된 산출물의 릴리스 테스트, changeset 존재 검사)으로 바꾼다(§6.2). 배포 시점은 판 올림 PR 병합 때의 자동 배포로 정했다. 기준 판정: (나) 오늘의 수동 실행이 지키던 '언제를 소유자가 쥔다'는 병합 동작으로 남고 자동 배포는 `master`와 npm이 어긋나는 창을 없애므로 두 선택지가 순위 없는 가치를 맞바꾸지 않는다. (다) npm 사용자가 받는 산출물은 같다. **판 번호(정책 질문, 16라운드 소유자 답으로 확정): 1.0.0-beta 뒤 1.0.0.** Vincent의 답: "(나) 1.0.0-beta를 먼저 내고 1.0.0 예상합니다"(§6.2의 열넷째).
11. **16라운드 편집자 결정 여섯 — 확정(답 10).** 가드 캐시는 코어가 검증기 인스턴스마다 든다(§2.1의 조건 1). 사본 루트의 등록은 플러그인의 검증기 인스턴스가 든다(§2.1의 조건 1). 식 컴파일러는 청사진으로 통째로 옮긴다(§2.1의 조건 2). `FormHandle`은 그린 쪽이 DOM에 등록하고 `playScenario`가 찾는다(§4.2). e2e는 부류마다 실행기 하나가 돌린다(§5.2). `architecture/spikes/**`의 실험 시험은 새 vitest 프로젝트에 넣지 않는다(§5.3). 같은 답에서 Vincent는 고속성의 뜻을 넓혔다(08 §1): 최소 생성, 메모리 안정, 캐싱을 통한 속도, 재생성 방지. 목적은 모바일에서도 돌아가는 안정성과 경제성이다.

## 9. 검증 기록

- 인벤토리: `reviews/raw-round16-tests.md`(234파일, 13파일 142건의 `<Form>` 마운트, 옛 표면 의존 수), `reviews/raw-round16-storybook-core.md`(스토리 49파일, `play` 한 파일, 단층 상속과 전략 위임, 공개 진입점).
- 스토리 미러 조사: `reviews/raw-round16-storybook-mirror.md`(antigravity, 웹 확인. addon-vitest, portable stories, 데이터 모듈 패턴, 벤치 조건).
- 정착 검토: `reviews/raw-round16-landing-review.md`(verifier, 실행 확인 포함. 조건부 통과, 조건 여덟, 08 수정 명세 일곱).
- `reset`과 릴리스: `reviews/raw-round16-reset.md`(debugger, 렌더 시험 3파일 39건 실행), `reviews/raw-round16-release.md`(scout, GitHub Actions와 스크립트).
- 16라운드 스웜 수렴: `reset`(§2.6)과 릴리스(§6.2)의 결정 점을 가치·런타임·릴리스 세 도출과 각각의 반박으로 수렴시켰다(편집자 결정). 게이트는 조건부 통과였고 그 수정(높음 둘, 중간 다섯, 낮음 여섯)을 반영했다. 소유자가 이미 답한 것(C6, ADR 0013의 억제 비트)을 뒤집는 결정 둘은 게이트가 되돌렸다. 정책 질문으로 남은 것은 PR-8의 판 번호 하나였고, 소유자가 1.0.0-beta 뒤 1.0.0으로 답했다. 코드와 문서의 판독이며 실행 확인은 하지 않았다.
- 스웜 뒤 좁은 게이트 둘(`batch` 안 reset의 파동 시점, 폐기된 트리의 늦은 입력 쓰기): 불통과 7건 → 반영, 재게이트 조건부 통과 → 조건(컨테이너 입력의 늦은 `onChange`·`onFileAttach`) 반영.
- 확인하지 못한 것: React 18 실행, ajv 6·7의 `getSchema(위치)`, `<Form>` 경유 같은 `$id` 실패, 44 시나리오의 단언별 대조, 유효 스키마 메모 비용, 지속 통합 명령, 객체 호스트 `default`의 분배 규칙(08 §15에 설계 항목으로 더했다), `reset`의 가설 다섯(`reviews/raw-round16-reset.md` §4), `changesets/action`의 태그 푸시·입력 분할·`.npmrc` 처리, 기본 토큰이 연 PR의 작업 흐름 촉발, 자식 프록시 마운트 판정의 구현, StrictMode가 `key`로 새로 마운트된 컴포넌트의 효과를 이중 호출하는지.
