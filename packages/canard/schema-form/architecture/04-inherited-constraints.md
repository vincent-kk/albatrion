# 계승할 제약 — 현재 코드의 트러블슈팅 기록

상태: 관찰 + 대응(제안). 현재 코드가 사용자 경험의 문제를 겪고 나서 굳힌 규칙들이다. 새 설계는 구조를 바꾸지만 이 규칙들이 지키는 **현상**은 그대로 지켜야 한다. 각 항목에 현재의 장치(`file:line`), 그것이 막는 문제, 새 설계에서의 대응, 수용 기준(테스트)을 적는다. 소유자: "캐럿 소실 문제와 같은 제어 컴포넌트에서의 세밀한 UX 제어 같은 트러블슈팅 기록은 우리가 계승해야 한다."

4라운드의 공격 대상이다(`HANDOFF.md` §3). 리뷰어는 "새 설계의 대응이 같은 현상을 막는가"를 수용 기준의 테스트로 판정한다.

| # | 제약 | 현재의 장치 | 막는 문제 | 새 설계의 대응 | 수용 기준 |
| - | ---- | ----------- | --------- | -------------- | --------- |
| T-1 | **타이핑은 같은 이벤트 핸들러 안에서 리렌더된다** | 초기화된 노드는 `UpdateValue`를 동기로 발행한다(`AbstractNode.ts:891-900`; 발행 지점 전부가 `this.initialized`를 `immediate`로 넘긴다 — `StringNode.ts:63-69`, `ObjectNode/…/BranchStrategy.ts:199-206` 등 10곳). `useSyncExternalStore` 구독이 동기로 불리고(`hooks/useSchemaNodeTracker.ts:36-44`) 입력은 렌더 중 `node.value`를 읽는다(`SchemaNodeInput.tsx:116`) | 제어 컴포넌트의 캐럿 소실. 통지가 한 틱 늦으면 `value` 속성이 DOM보다 늦어 포맷팅 입력에서 캐럿이 끝으로 튄다 | 통지는 항상 동기(ADR 0008 "통지의 시점"). "즉시" 옵션이 없어진다 — 모든 통지가 정착 직후 동기이므로 | **바뀜(4라운드 F14)**: (1) 일반 제어 입력의 중간 삽입 `ab\|cd` + "xy" → `abxycd@4`, (2) input 이벤트 직후 DOM 값 = 커밋 값, (3) IME 조합 3단계. 기존 `controlled-interaction.render.test.tsx:340-368`(포맷터 + 북키핑)은 통지 시점의 회귀를 잡지 못하므로(`spikes/events/REPORT-caret.txt`) 유지하되 이 기준으로 세지 않는다 |
| T-2 | **타이핑은 입력을 리마운트하지 않는다** | 타이핑 경로의 옵션(`HANDLE_CHANGE_OPTION`, `SchemaNodeInput/type.ts:33-37`)에 `Refresh` 비트가 없다. `RequestRefresh`는 `Overwrite`/`Merge`에만 실린다(`core/types/value.ts:34-35,51,62-65`). 입력의 `key={version}`은 `RequestRefresh`에만 바뀐다(`SchemaNodeInput.tsx:121`). 주석: `useFormTypeInputControl.ts:20-23` | 비제어 입력의 리마운트로 캐럿·IME 조합 상태가 사라진다 | ADR 0007의 규칙: 커밋된 원본이 그 노드의 입력이 방금 보고한 값과 다른 노드에만 `RequestRefresh`. 타이핑은 같으므로 보내지 않는다 | 같은 파일의 타이핑 시나리오 + `reset`/`setValue(Overwrite)` 뒤 비제어 입력이 새 값을 읽는 시나리오(`refresh.*.render.test.tsx`) |
| T-3 | **가상화된 노드는 포커스·선택 명령으로 즉시 드러나고, 드러난 커밋 안에서 명령을 다시 받는다** | `RequestFocus`/`RequestSelect`만 지연 마운트를 강제 해제한다(`DeferrableNodeProxy.tsx:9-14`). `RequestRefresh`는 제외 — 폼 전체의 지연이 풀린다. 드러난 뒤 안쪽 컨트롤이 같은 커밋의 자식 레이아웃 이펙트에서 구독하므로 명령을 **동기로** 다시 발행한다(`DeferrableNodeProxy.tsx:44-58`) | 지연 마운트된 필드에 `focus()`를 불렀는데 아무 일도 없거나, 명령이 유실·반복된다 | ADR 0008 배달 집합 2항(시그널 비트가 대기 중인 노드 포함). 재발행 규칙은 렌더 계층의 것이며 그대로 계승한다(core는 렌더러를 모른다 — P5) | `__tests__/scenarios/virtualization.*.render.test.tsx`의 포커스·선택 시나리오 |
| T-4 | **순환은 상한에서 멈추고, 상한은 틱마다 초기화된다** | `MAX_LOOP_COUNT = 100`(`EventCascadeManager.ts:34`), `__acquireBatch__`에서 검사(`:90-107`), 유휴 시 매크로태스크로 초기화(`:110-116`). throw는 마이크로태스크 안에서 나므로 호출자의 `try/catch`에 잡히지 않는다 | `injectTo`·derived의 되먹임이 탭을 멈춘다 | 정착 루프의 세 예산 — 조각 바퀴(조건부 조각 수 + 1), 파생 라운드(25), 전이(조각 수)(F2·F3). 이벤트 쪽에는 틱당 파동 25와 `onChange` 중첩 25가 따로 있다(ADR 0008). 상한을 넘기는 라운드는 실행하지 않고 마지막 완료 라운드로 고정한다(E7). 모든 환경에서 커밋·통지 뒤 사슬 끝에서 **동기로** throw하고(호출자가 잡을 수 있다) `diagnostics`는 `degraded`로 다음 로드까지 남는다(17라운드 소유자 답 R17-1 나, ADR 0014 4판. 4라운드의 개발 모드 throw와 프로덕션 신호(E6)를 대체한다). 파동 상한은 현재처럼 **틱당**이며 상한에 닿으면 리스너 쓰기를 거부한다(4라운드 F15) — 미루고 초기화하는 현재 방식은 같은 입력을 틱마다 다시 돌린다 | `core/__tests__/*injectTo*`, `computed.derived.render.test.tsx`의 수렴 가드(`caughtErrors`) |
| T-5 | **두 단계 단언 — 동기 단계와 정착 단계** | 하네스의 `flushOnMount: false`(`__tests__/renderForm.tsx:63-66`)로 마이크로태스크 캐스케이드 전의 DOM을 단언한다. 13개 파일이 쓴다(`harness.smoke`, `composition.allOf-ifThenElse`, `computed.derived`, `computed.visibility`, `computed.readonly-disabled`, `composition.oneOf.initial`, `virtual`, `composition.anyOf`, `composition.nested-branch`, `composition.oneOf.switch`, `array.prefixItems-terminal`, `nullable`, `multi-render-split-brain`) | 초기 마운트의 priming 회귀와 정착 뒤 상태를 구별하지 못한다 | 새 설계에는 두 번째 단계가 없다 — 생성이 곧 첫 정착이고 통지는 동기다. 이 13개 파일의 "동기 뒤 정착" 단언은 **단일 단계로 다시 쓴다.** 무엇이 회귀였는지는 각 테스트의 제목이 말하므로 제목을 보존한다 | 13개 파일의 시나리오가 단일 단계에서 같은 최종 DOM을 낸다 |
| T-6 | **늦은 구독자는 놓친 것을 알 수 있다** | `subscribe` 전에 지나간 이벤트는 재생되지 않는다. 상태 미러는 `useSchemaNodeSubscribe`의 `onSubscribe` catch-up을 쓴다. `revision(mask)`는 리스너 유무와 무관한 단조 카운터다(패키지 `CLAUDE.md` Key APIs, `useSchemaNodeTracker`) | 마운트 순서에 따라 렌더가 stale 상태에 갇힌다(split-brain) | ADR 0008 §2 규칙 3(F16): `revision`은 커밋 시 배달 집합 전체를 한 번에 올린다. 파동 중에 구독한 리스너는 원장으로 따라잡는다(F17) | `multi-render-split-brain.render.test.tsx` |
| T-7 | **배열 연산은 동기다** | 현재 `push`/`remove`/`pop`/`clear`는 마이크로태스크 하나 뒤에 풀리는 Promise를 돌려준다(`01-current-structure.md`) | `await arr.push(x)` 뒤에 구독자가 이미 봤다는 뜻이 되지 않는다 | 동기 API로 바꾼다(ADR 0007·0008). 파괴적 변경 | 배열 시나리오 전부(`array.*.render.test.tsx`) — Promise 가정 제거 |
| T-8 | **사용자 주입 컴포넌트는 격리된다** | `withErrorBoundary`로 1회 래핑(`SchemaNodeProxy`/`SchemaNodeInputWrapper`, `VirtualizationManager` 생성자) — 패키지 `CLAUDE.md` Error Isolation | 입력 하나의 throw가 폼 전체를 떨어뜨린다 | 렌더 계층 규칙. 그대로. core 쪽 대응은 ADR 0008 6항(리스너 격리 — `subscribe` 소비자의 throw가 뒤의 노드 통지를 막지 않는다) | 기존 에러 경계 테스트 + 새로 "리스너가 throw해도 다음 노드가 통지된다" |
| T-9 | **루트 `onChange`와 OnChange 검증은 매크로태스크로 디바운스된다** | `afterMicrotask`(이름과 달리 취소 뒤 재예약하는 **매크로태스크**, `AbstractNode/utils/afterMicrotask/afterMicrotask.ts:18-28`)가 `__handleChange__`를 감싼다(`AbstractNode.ts:1219-1223`) — `validate()`와 루트 `onChange`가 함께 묶인다 | 키 입력마다 소비자 콜백과 검증기가 돈다 | 소유자 결정 D-10(`reviews/round-4.md` §4, F31이 F22를 대체): 루트 `onChange`는 **최외곽 동기 진입당 1회**, 디바운스 없음(진입 깊이 카운터, `spikes/work-loop/REPORT-v4c.txt`). React 이펙트의 쓰기는 새 진입이라 키 입력당 2회이며 문서화 대상(C-10). 검증은 커밋 번호 스탬프로 비동기(F28) | `validation.*.render.test.tsx`, 루트 `onChange` 호출 횟수 단언 |

## 4라운드 스윕에서 추가된 제약 (antigravity 스윕 → 소스 대조 12/14 확인)

원문 `reviews/raw-antigravity4-constraints.md`. 대조는 scout가 했고, 틀린 줄 번호(NEW-3)와 과장된 기제(NEW-8)는 여기서 고쳤다.

| # | 제약 | 현재의 장치 | 막는 문제 | 새 설계의 대응 |
| - | ---- | ----------- | --------- | -------------- |
| T-10 | blur의 Touched는 `requestAnimationFrame`으로 늦추고 focus가 취소한다 | `SchemaNodeInput.tsx:80-86` | 포커스 이동 중 에러가 깜빡인다 | 렌더 계층. 그대로 |
| T-11 | 렌더 중의 값 읽기는 계산하지 않는다 | `get value()`가 만료·잠금이 아니면 캐시를 돌려준다(`ObjectNode/…/BranchStrategy.ts:304`), commit-on-read 제거(`DETAIL.md:101`) | 렌더 중 읽기가 null 조상을 조기 승격시키거나 전파 가드를 어긋나게 한다 | P3·ADR 0006: 읽기는 메모를 돌려줄 뿐 계산하지 않는다(정착된 읽기 4–11 ns). 구조로 흡수 |
| T-12 | 자동 쓰기는 null 조상을 객체로 만들지 않는다 | `option & Automatic \|\| !__hasNullAncestor__`이면 전달하지 않는다(`AbstractNode.ts:1117`, `value.ts:46`) | reset·derived가 빈 폼을 객체로 만든다 | A2·A5: 호스트의 `raw`를 비우는 것은 **사용자·호출자의 부분 쓰기**뿐이다. default 주입과 `injectTo`는 비객체 호스트의 `raw`를 건드리지 않는다 — `injectTo`가 대상의 전체 교체라도 조상의 `raw`는 그대로. 4라운드 F10으로 명세에 넣었다 |
| T-13 | 검증 결과는 세대 토큰으로 걸러진다 | `__generation__` 단조 증가, 구세대 결과 폐기(`ValidationManager.ts:56-62, 121-124`) | 비동기 검증의 경합으로 stale 에러가 남는다 | ADR 0004·0007: revision 스탬프. 같은 장치 |
| T-14 | 같은 틱의 재진입 `injectTo`는 건너뛰고 매크로태스크로 해제한다 | `InjectionGuardManager.ts:4-8`, `AbstractNode.ts:977-1019` | 순환 주입의 스택 오버플로 | A3 파생 라운드 상한 25. 틱 기반 가드는 사라진다 |
| T-15 | 한 번 드러난 가상화 노드는 placeholder로 돌아가지 않는다(defer-once) | `helpers/virtualization/INTENT.md:12`, `DETAIL.md:16` | 값 변경·스크롤 아웃에서 포커스·선택이 사라진다 | 렌더 계층. 그대로 |
| T-16 | Deferrable 래퍼 여부는 생성 시점에 고정한다 | `useChildNodeComponents.tsx:66` | 훅 집합이 바뀌어 Rules of Hooks 위반 | 렌더 계층. 그대로 |
| T-17 | 포커스·선택 명령의 대상은 `input, textarea, button` 하나의 선택자로 찾고, select는 `typeof element.select === 'function'`일 때만 부른다 | `useFormTypeInputControl.ts:38-41, 49-59` | 복합 컴포넌트의 오발동, `select()` 타입 에러 | 렌더 계층. 그대로 |
| T-18 | `RequestRemount`는 래퍼의 `key=version`으로 서브트리를 강제 리마운트한다 | `SchemaNodeProxy.tsx:84,89` | 일반 갱신으로 못 고치는 손상된 입력 상태의 탈출구 | **유지(D-9).** 소유자: 사용자가 서브트리의 입력을 제어·비제어와 무관하게 최신화하는 사용자 도구. ADR 0008의 "제거 후보"는 삭제 |
| T-19 | `defaultValue`와 `jsonSchema`는 마운트 시 deep clone한다 | `Form.tsx:91, 94`(`[version]` 의존) | 호출자의 객체를 제자리에서 바꾸거나 frozen 객체에서 throw | ADR 0001: 스키마는 변형하지 않으므로 clone이 필요 없다. `defaultValue`는 노드로 **분배**되므로 원본을 바꾸지 않는다 — 다만 배열·객체 리프(터미널)는 참조를 들 수 있어 clone 또는 "호출자의 객체를 바꾸지 않는다"는 계약이 필요. 4라운드 F24로 명세에 넣었다 |
| T-20 | 초기화 순서: 자식 초기화 → computed 준비 → 초기 분기 prime → 자식 처리 | `ObjectNode/…/BranchStrategy.ts:717-726` | `oneOf` 초기 렌더의 경쟁 조건 | 생성이 곧 첫 정착(A3). 순서는 단일 순회가 정한다. 수용 기준: `composition.oneOf.initial.render.test.tsx` |
| T-21 | `reset()`은 루트 컨텍스트의 `key=version`으로 전체를 리마운트한다 | `Form.tsx:151, 186` | 비제어 DOM의 잔류 값과 사용자 컴포넌트의 내부 플래그 | 렌더 계층의 선택. A6의 `RequestRefresh`만으로 부족한 경우(내부 플래그)가 있으므로 그대로 두되, core의 `reset()`은 전체 교체 + Refresh다 |
| T-22 | 배열 아이템의 React key는 생성 순서의 nonce다 | `ArrayNode/…/BranchStrategy.ts:70, 381`, `useChildNodeComponents.tsx:62` | append 시 기존 행이 리마운트되어 포커스를 잃는다 | ADR 0011 identity(R13): 인덱스와 독립적인 단조 키 유지. 통째 쓰기의 대응 규칙은 미결 |
| T-23 | 분기 복원은 자식의 원본 배열 상태를 합성 값보다 우선한다 | `ObjectNode/…/BranchStrategy/DETAIL.md:7, 74, 103` | `omitTrailing` 배열의 후행 빈 항목이 분기 전환에서 사라진다 | P4: 비활성화는 원본을 건드리지 않으므로 복원할 것이 없다 — 구조로 흡수. 수용 기준: 그 회귀 테스트 |

## 새 설계에서 사라지는 장치와 그 이유

| 사라지는 것 | 이유 |
| ----------- | ---- |
| `immediate` 인자와 "UpdateValue만 동기" 예외 | 모든 통지가 동기다 |
| 노드별 `EventCascadeManager`와 마이크로태스크 배치 | 내부 상태 전이가 이벤트를 타지 않는다. 배치는 `batch()` |
| `MAX_LOOP_COUNT`의 틱별 초기화 | 상한이 정착 루프 안에 있다 |
| `SetValueOption`의 `Batch`·`Isolate`·`EmitChange`·`Propagate`·`PublishUpdateEvent` | 전파와 통지가 옵션이 아니라 구조다 |
| `flushOnMount: false`의 두 번째 단계 | 생성이 곧 첫 정착이다. 두 번째 단계가 지키던 "매크로태스크 뒤 값 불변"은 비동기 검증·`onChange`를 기다린 뒤의 단언으로 옮긴다(F23) |
| 비객체 값을 `{}`·`[]`로 버리는 것 | 3.1판은 보존·방출하고 type 에러를 낸다(F27). 동작 변화 |

## 아직 확인하지 않은 것

- 플러그인이 제공하는 `FormTypeInput`들(`packages/canard/schema-form-*-plugin`) 가운데 동기 `UpdateValue`나 Promise 배열 API에 기대는 것이 있는가.
- IME 조합 중의 쓰기: 캐럿 스파이크가 compositionstart → 입력 → compositionend 흐름을 fireEvent로 흉내 내 동기 통지에서 통과, 마이크로태스크에서 한 단계 지연을 확인했다(`spikes/events/REPORT-caret.txt`). jsdom은 조합 중 value 쓰기가 조합을 취소하는 브라우저 동작을 모델링하지 않으므로 실제 브라우저 확인이 남아 있다.
