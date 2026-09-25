# 18라운드 안건 — PR-1 전 정련

2026-09-25. 17라운드(`reviews/raw-round17-convergence.md`, `reviews/round-17-owner-answers.md`, `reviews/raw-round17-onerror.md`, `reviews/raw-round17-node-structure.md`)가 닫지 않고 넘긴 것과, 개발 전 미결 목록 가운데 PR-1·PR-2를 막는 것을 주제별로 모은 18라운드의 안건이다. 17라운드가 결정하지 않고 넘긴 것(노드 구조의 설계 빈틈 넷, 공개 표면의 크기, `trim` 쓰기의 부수 효과, 전환 방식의 세부)은 여기서 처음 다룬다.

**읽는 법.** 항목마다 출처, 막는 PR, 성격을 적는다. 성격은 넷이다. 설계 결정(원리와 앞선 답에서 편집자와 스웜이 닫을 수 있는 것), 이름, 실행 확인(스파이크나 시나리오로 사실을 재야 하는 것), 소유자 정책(소유자가 정해야 하는 것)이다. 출처의 줄 번호는 설계 문서(`08-design-a-to-z.md`, `09-landing-and-test-strategy.md`, `adr/`, `open-questions.md`)는 커밋 `99765899b`(16라운드) 판 기준이다. 17라운드 반영으로 줄이 옮겨졌으므로 절 번호를 함께 적는다. `reviews/`의 17라운드 파일과 `src/`는 2026-09-25 작업 트리 기준이다. 18라운드의 결정은 결정마다 닫은 사람(소유자 답의 위치 또는 원칙)을 적는다(`HANDOFF.md`의 다음 세션 2).

## 1. 청사진이 읽는 스키마의 범위 (A)

| 항목 | 출처 | 막는 PR | 성격 |
| --- | --- | --- | --- |
| `$ref` 재귀에서 조각의 정적 열거가 끝나는 규칙(오늘 `$ref` 해석 깊이의 기본값은 1) | `08-design-a-to-z.md:451`(§15), `adr/0005-blueprint-analysis-and-node-sharing.md:131` | PR-1 | 실행 확인 |
| 값 union과 다중 `type` 슬롯(`type: ['string', 'number']`, 원시 타입끼리의 `anyOf`, `oneOf: [string, object]`) | `08-design-a-to-z.md:451`(§15), `adr/0005-blueprint-analysis-and-node-sharing.md:129` | PR-1 | 설계 결정 |
| `dependentSchemas`·`dependentRequired`·`dependencies`를 게이트와 조각의 모델로 환원할지(Q7) | `open-questions.md:54-56`, `adr/0002-guard-fragment-model.md:198`, `08-design-a-to-z.md:451`(§15) | PR-1 | 설계 결정 |
| `patternProperties`와 스키마 값 `additionalProperties`(동적 키의 노드화 여부) | `08-design-a-to-z.md:451`(§15) | PR-1 | 설계 결정 |
| `controls.discriminator`의 세부(분기에 그 키의 `const`·`enum`이 없을 때, `$ref`·`allOf` 평탄화, 분기 자체 `controls.active`와의 AND) | `08-design-a-to-z.md:451`(§15), `adr/0002-guard-fragment-model.md:204`, `adr/0005-blueprint-analysis-and-node-sharing.md:127` | PR-1 | 설계 결정 |
| 노드의 `required` 표시가 켜진 `then`을 반영하는 규칙 | `08-design-a-to-z.md:451`(§15) | PR-1 | 설계 결정 |
| 같은 가상 이름을 다른 `fields`로 적은 `options.virtual` 항목(정해지면 청사진 오류 코드가 생길 수 있음) | `reviews/raw-round17-convergence.md:77`(R15-10), `reviews/raw-round17-onerror.md` §5의 미정 행 | PR-1 | 설계 결정 |
| 노드 공유의 '같은 종류'. 소유자가 수락한 규칙은 '같은 이름 + 같은 타입이면 노드 하나'이고, 1라운드 R11이 이를 노드 종류로 다시 정의했다(`number`와 `integer`, `['string', 'null']`과 `'string'`은 같은 종류). ADR 0005 상태 줄이 소유자 확인을 요구하지만 어느 목록에도 오르지 않았다 | `adr/0005-blueprint-analysis-and-node-sharing.md:3`, `:9`, `08-design-a-to-z.md:176`(§5) | PR-1 | 설계 결정(소유자 확인) |

## 2. `controls` 식 언어 명세 (B)

| 항목 | 출처 | 막는 PR | 성격 |
| --- | --- | --- | --- |
| 허용 문법과 전역 이름, `@` 맥락과 그 변경이 에지인지, `#`·`*` 표기 | `08-design-a-to-z.md:452`(§15) | PR-1, PR-2 | 설계 결정 |
| 경로가 읽는 값(원본, 방출, 투영 가운데 무엇인가. 게이트는 투영 값), 비활성·없는 노드를 읽을 때의 값 | `08-design-a-to-z.md:452`(§15) | PR-1, PR-2 | 설계 결정 |
| `controls.injectTo`의 함수 형태와 `ctx` 인자, 반환 모양 | `08-design-a-to-z.md:452`(§15), `adr/0003-group-namespace.md:147` | PR-1, PR-2 | 설계 결정 |
| 배열 항목의 색인과 길이를 읽는 문법 | `08-design-a-to-z.md:452`(§15) | PR-1, PR-2 | 설계 결정 |
| `controls.active` 식이 다른 호스트를 읽을 때의 평가 순서 | `08-design-a-to-z.md:453`(§15), `adr/0002-guard-fragment-model.md:202`, `adr/0003-group-namespace.md:144` | PR-2 | 설계 결정 |

## 3. 쓰기 의미론의 세부 (C)

| 항목 | 출처 | 막는 PR | 성격 |
| --- | --- | --- | --- |
| `setValue(undefined)`의 정의와 비객체 V의 `Merge` | `08-design-a-to-z.md:453`(§15), `adr/0007-settle-cycle.md:143`, `adr/0013-core-does-not-rewrite-values.md:104` | PR-2 | 설계 결정 |
| 되먹임 거부를 호출자에게 알리는 표면(정해지면 오류 코드가 생길 수 있음) | `08-design-a-to-z.md:453`(§15), `reviews/raw-round17-onerror.md` §5의 미정 행 | PR-2 | 설계 결정 |
| 객체 호스트 `default`의 자손 분배 규칙(프로토타입에만 흔적) | `08-design-a-to-z.md:455`(§15), `09-landing-and-test-strategy.md:278` | PR-2 | 설계 결정 |
| `trim` 쓰기의 부수 효과. 17라운드 소유자 답 R17-3은 자른 값을 사용자 입력과 같은 쓰기(입력 출처)로 다루고 현재 값과 같으면 쓰지 않는다고 정했다. 이 쓰기가 오늘 `handleChange`처럼 바깥 오류를 지우고 dirty를 표시하는지가 남았다(오늘의 `trim`은 둘 다 하지 않는다). 스웜의 권고는 자른 값이 다를 때만 값 쓰기, 바깥 오류 지움, dirty 표시를 `batch` 하나로 묶는 것이다 | `reviews/round-17-owner-answers.md:11`, `reviews/raw-round17-node-structure.md` §4, `src/components/SchemaNode/SchemaNodeInput/SchemaNodeInput.tsx:49-56`, `src/core/nodes/StringNode/StringNode.ts:118-122` | PR-4(`dispatch`의 입력 마침 진입), PR-7(어댑터) | 설계 결정(소유자 확인) |

## 4. 프로토타입 v7, PR-0 실행 확인 (D)

| 항목 | 출처 | 막는 PR | 성격 |
| --- | --- | --- | --- |
| 게이트 입력의 `extras` 정적 규칙, 같은 순위 규칙, 나감 에지, 전이 라운드 상한이 나감 비움(R17-2 ㄴ의 하위 트리 비움과 잠복 자손 비움 포함)을 포함해 실제로 보장되는지 | `08-design-a-to-z.md:454`(§15), `reviews/raw-round17-convergence.md` §7 | PR-2(PR-0 산출물) | 실행 확인 |

## 5. ADR 0009의 성능 예산 수치와 '일정 수준'의 형태·수치, 번들 예산 (E)

| 항목 | 출처 | 막는 PR | 성격 |
| --- | --- | --- | --- |
| "일정 수준"의 형태(옛 판 대비 배율인가 절대 수치인가)와 수치(16라운드 답 6) | `adr/0009-performance-budget-and-benchmarks.md:96` | 착수 전 | 소유자 정책 |
| 예산의 수치(키 입력과 마운트, 대규모 쓰기와 배치). 기준선은 있다 | `adr/0009-performance-budget-and-benchmarks.md:97`, `08-design-a-to-z.md:461`(§15) | 착수 전 | 소유자 정책 |
| 문서화된 안전 임계(필드 50개, 배열 아이템 30개)를 올릴 것인가 | `adr/0009-performance-budget-and-benchmarks.md:98` | 착수 전 | 소유자 정책 |
| 번들 크기 예산(현재 gzip 약 44KB) | `adr/0009-performance-budget-and-benchmarks.md:99` | 착수 전 | 소유자 정책 |
| 인터프리터형 검증기의 지원 수준, 컴파일 예산 | `adr/0009-performance-budget-and-benchmarks.md:100`·`:102` | 착수 전 | 소유자 정책 |
| 노드 구조의 벤치(섞인 종류 1만 노드의 읽기 순회, 노드당 힙 바이트, 같은 맵인지, 거대형 자리 수, 입력에서 커밋까지, 생성 시간. V8과 JavaScriptCore) | `reviews/raw-round17-node-structure.md` §7 | PR-2 | 실행 확인 |

## 6. 노드 구조의 설계 빈틈

| 항목 | 출처 | 막는 PR | 성격 |
| --- | --- | --- | --- |
| N2. 탐색이 기대는 `subnodes`(비활성 자식 포함)와 `variant`·`oneOfIndex`의 존폐. 레코드에 전체 자식 칸을 둘지, `detectsCandidate`와 그 시험을 버릴지, `find`·`findNodes`가 형상에 없는 노드를 돌려주는지 | `reviews/raw-round17-node-structure.md` §9, `src/core/nodes/AbstractNode/utils/findNode/findNode.ts:69`, `findNodes.ts:92`, `utils/detectsCandidate.ts:40-42`, `src/core/nodes/AbstractNode/utils/traversal/depthFirstSearch.ts:18` | PR-2 | 설계 결정 |
| N5. 런타임 형(`SchemaNodeRuntime`)의 타입 순환. 통지 대기열, 검증기, 진단 칸의 타입을 `dispatch`·`validation`이 소유하면 `record/`와 타입 고리가 생긴다. 의존 역전(`record/`가 칸 타입을 인터페이스로 선언)으로 끊을지, 검증기 칸의 타입을 오늘 `app/plugin`에서 떼는 import 분리와 함께 정할지 | `reviews/raw-round17-node-structure.md` §3·§9, `reviews/raw-round17-convergence.md:46`(R15-2의 import 분리) | PR-2(모양), PR-4(검증기 칸) | 설계 결정 |
| N6. 레코드에서 공개 판별 합집합으로의 형 변환. `navigation/`은 레코드 형을 돌려주고 공개 `find`·`findNodes`·`parentNode`·`children`은 공개 합집합을 돌려줘야 한다. 변환을 공개 겉면 `utils`의 함수 하나로 둘지, 사용자 정의 타입 술어로 할지 승인받은 단언 하나로 할지 | `reviews/raw-round17-node-structure.md` §6·§9(단언 금지 규칙과 겉면 린트) | PR-2 | 설계 결정 |
| N14. 행이 없는 조합. 잎에 `options.terminal: false`(오늘은 `branch`가 되어 fieldset으로 그려짐), 가상에 `options.terminal: true`(오늘은 자식 구성 요소가 비워짐), 가상에 인라인 `presentation.FormTypeInput`을 둔 경우(오늘은 `getNodeGroup.ts:22-23`이 `'terminal'`로 정함, `stories/08.VirtualSchema.stories.tsx:63-66`)의 처리와 08 §14의 이주 행 | `reviews/raw-round17-node-structure.md` §9, `src/core/nodes/AbstractNode/utils/getNodeGroup/getNodeGroup.ts:20-21`, `src/core/nodes/AbstractNode/utils/getNodeGroup/getNodeGroup.ts:22-23` | PR-1(청사진의 전략 결정) | 설계 결정 |

## 7. 공개 표면의 크기와 겉면의 관례

| 항목 | 출처 | 막는 PR | 성격 |
| --- | --- | --- | --- |
| 루트 전용 넷(`globalState`·`setSubtreeState`·`clearSubtreeState`·`globalErrors`)을 노드에 둘지 `FormHandle` 쪽 함수로 옮길지. `globalState`의 OR 누적을 고칠지도 함께 | `adr/0008-event-system.md:206`, `08-design-a-to-z.md:378`(§13), `reviews/raw-round17-node-structure.md` §6 | PR-2(멤버 목록 시험), PR-7 | 설계 결정 |
| 명령 넷(`focus`·`select`·`refresh`·`remount`)을 노드 메서드로 둘지, 명령 publish의 공개 API화(C-11) | `adr/0008-event-system.md:204`, `05-before-after.md:92`·`:126` | PR-7 | 소유자 정책(C-11 확정 대기) |
| `subnodes`·`defaultValue`·`resetSubtree`·`schemaPath`·`key`의 존폐. `schemaPath`·`key`는 에러 라우팅(PR-4)과 React key·구성 요소 캐시 키(PR-7)에 걸린다. `resetSubtree`는 값 출처도 함께 | `08-design-a-to-z.md:460`(§15), `reviews/raw-round17-node-structure.md` §6, `src/components/SchemaNode/SchemaNodeInput/hooks/useChildNodeComponents.tsx:61-62` | PR-2, PR-4, PR-7 | 설계 결정 |
| `ContextNode`의 자리. 08 §4의 노드 종류에 없고 오늘 `type`이 `'object'`라 `isObjectNode`가 참이다. 스웜의 권고는 행을 두지 않는 것이며 `@` 맥락 명세가 정한다 | `src/core/nodes/ContextNode/ContextNode.ts:12-13`, `src/providers/RootNodeContext/RootNodeContextProvider.tsx:79`, `08-design-a-to-z.md:452`(§15의 `@` 맥락) | PR-2, PR-7 | 설계 결정 |
| 문서 주석 `{@inheritDoc}` 관례. 클래스 멤버가 구현한 공개 인터페이스의 문서 주석을 따르는 것을 저장소 주석 규칙 §4의 충족으로 볼지. 겉면 파일의 줄 수(250–350줄 대 450–650줄)를 가른다 | 저장소 뿌리의 `.claude/rules/seiri_code-comments.md` §4, `reviews/raw-round17-node-structure.md` §7 | PR-2 | 설계 결정(저장소 관례) |
| 이름 규칙을 오늘의 공개 이름에 적용할지. 공개 index가 내보내는 `Node`로 줄인 이름(형 `ArrayNode` 등 일곱, `NodeState`, `NodeEventType`, 가드 `is…Node`)을 `SchemaNode` 접두로 바꿀지와 08 §14의 이주 행 | `src/index.ts:33-54`, `08-design-a-to-z.md` §13 이름 규칙(작업 트리), `reviews/round-17-owner-answers.md:53` | PR-2(공개 형), PR-7(이주) | 이름(소유자 확인) |
| 내부 통로(`finishInput` 신호, 입력 출처 표식 쓰기)를 core만 쓰는 호스트에 열지. 지금은 바인딩 전용이라 core만 쓰는 호스트는 `trim`을 부를 길이 없다 | `09-landing-and-test-strategy.md:47`(§2.3 둘째), `reviews/raw-round17-node-structure.md` §6 | PR-4, PR-7 | 설계 결정 |

## 8. 전환 방식의 세부

17라운드 소유자 답으로 방식은 확정되었다. PR마다 대상 영역의 옛 코드를 레거시 디렉토리로 옮기고 새 코드를 쓴다. 쓸 만한 코드와 함수는 가져오고 나머지는 버린다. 옛 이름과의 중복은 기준이 아니다. 남은 것은 세부다.

| 항목 | 출처 | 막는 PR | 성격 |
| --- | --- | --- | --- |
| 레거시 디렉토리의 이름과 자리(패키지 안의 어디에, 어떤 이름으로, 빌드와 공개 진입점에서 어떻게 빼는가) | `reviews/round-17-owner-answers.md:52`, `08-design-a-to-z.md` §17.1의 둘째 항목(작업 트리) | PR-1 | 설계 결정 |
| 옮기는 동안 기존 시험과 스토리북을 돌리는 방법(옛 시험이 레거시 디렉토리를 따라가는가, 09 §4.3의 234파일 처분과 §5.4의 옛 스토리 처분과 어떻게 맞추는가) | `reviews/round-17-owner-answers.md:52`, `09-landing-and-test-strategy.md:144`(§4.3)·`:198`(§5.4) | PR-1 | 설계 결정 |

## 9. PR-1·PR-2 뒤

PR-3 이후를 막는 열린 항목이다. 18라운드에서 다루지 않아도 되며, 각 PR이 시작할 때 짧은 설계로 닫는다.

- **PR-3 전.** 에지의 값 동등 판정(참조인지 깊은 비교인지), `controls.derived` 의존 집합의 출처, 조각의 `controls`에 둔 식 규칙이 나감 에지에서 발화하는 세부(`08-design-a-to-z.md:456`). emit의 키 순서(Q14, `open-questions.md:86`).
- **PR-4.** `compileGuard` 계약 세부, 사본 루트 등록의 해제 계약 세부, `validatorFactory`와 플러그인의 계약 통일, 검증 에러 라우팅(Q12)과 union 호스트 수준 에러의 라우팅, 유효 스키마 변경 이벤트의 표면(`08-design-a-to-z.md:457`, `adr/0005-blueprint-analysis-and-node-sharing.md:128`, `adr/0008-event-system.md:200`). `ValidationManager` → `PluginManager`의 React 모듈 import 분리(`reviews/raw-round17-convergence.md:46`). `$id` 기저 URI와 `$dynamicRef`에서 따로 컴파일한 게이트가 문맥 평가와 같은 답을 내는지(`adr/0005-blueprint-analysis-and-node-sharing.md:132`, 실행 확인). `if`의 공허한 참 경고(Q10, `open-questions.md:68`).
- **PR-5 전.** 배열 아이템의 생김과 채움(통째 교체의 identity, `push`가 로드인가), `contains`·`prefixItems`(Q13), 큰 배열의 지연 실체화(벤치 뒤)(`08-design-a-to-z.md:458`, `adr/0011-branch-node-composition.md:92-94`).
- **PR-6 전.** `controls.children`의 대상별 식과 값 키 세부, 조각에서만 선언된 자식을 가리킬 수 있는가, 대상이 형상에 없을 때(`08-design-a-to-z.md:459`, `adr/0003-group-namespace.md:142`).
- **PR-7 전.** 폐기된 트리의 참조를 끊는 범위, 입력 판정(자식 프록시의 마운트 여부)의 구현 확인(`08-design-a-to-z.md:460`). `@winglet/react-utils` 선택 인자의 모양(17라운드 소유자 답 (나)로 확장은 허용됨, `reviews/raw-round17-onerror.md` §4의 바운더리 경로). 실제 브라우저의 IME 확인(`adr/0008-event-system.md:203`).
- **PR과 무관하거나 인접.** Q1의 남은 세부(잠복 원본의 실제 파기 시점, 복원값 대 초기값 등, `open-questions.md:5-15`), Q2 null 계약의 표현(`open-questions.md:17`), Q4 표준 밖 FE 조건부 필드(`open-questions.md:27`), Q5 `virtual` 구조(`open-questions.md:31`), Q15 직전 커밋 `active`를 출발 가설로 쓰는 최적화(`open-questions.md:90`, 실행 확인), 터미널 노드 아래 경로의 계약(S11, `adr/0011-branch-node-composition.md:91`).

## 10. 18라운드 뒤 — 총검증

18라운드가 닫힌 뒤, 설계 완료를 확정하기 전에 codex와 antigravity로 교차검증한다. 14라운드까지는 두 모델의 교차가 여러 번 있었고(2026-09-22 세 모델 결정 교차검증, 6–14라운드의 도출과 레드팀), 15–17라운드에는 이름 규칙 검증 한 번뿐이다.

| 과녁 | 맡는 곳 | 까닭 |
| --- | --- | --- |
| 소유자 답 없이 닫힌 결정(단일 원장의 '닫은 사람' 칸으로 거른다) | codex와 antigravity가 따로 | 둘이 함께 짚으면 강한 신호이고, 한쪽만 짚으면 검증자가 원문과 대조한다 |
| 문서 전체의 정합 | antigravity | 큰 맥락을 한 번에 읽는다 |
| 오늘 코드 위에서 PR-1·PR-2가 착지하는가(형 설계와 타입 순환 포함) | codex | 코드를 읽고 타입 검사를 돌릴 수 있다 |

결과는 권고일 뿐 채택 결정이 아니다. 지적마다 검증자가 원문과 대조해 거르고, 소유자 답과 부딪치는 지적은 고치지 않고 소유자 질문으로 올린다. 검토자는 파일을 고치지 않으며, 검토 전 커밋이 기준점이다.
