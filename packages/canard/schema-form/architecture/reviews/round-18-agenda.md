# 18라운드 안건 — PR-1 전 정련

2026-09-25. 17라운드(`reviews/raw-round17-convergence.md`, `reviews/round-17-owner-answers.md`, `reviews/raw-round17-onerror.md`, `reviews/raw-round17-node-structure.md`)가 닫지 않고 넘긴 것과, 개발 전 미결 목록 가운데 PR-1·PR-2를 막는 것을 주제별로 모은 18라운드의 안건이다. 17라운드가 결정하지 않고 넘긴 것(노드 구조의 설계 빈틈 넷, 공개 표면의 크기, `trim` 쓰기의 부수 효과, 전환 방식의 세부)은 여기서 처음 다룬다.

**읽는 법.** 항목마다 출처, 막는 PR, 성격을 적는다. 성격은 넷이다. 설계 결정(원리와 앞선 답에서 편집자와 스웜이 닫을 수 있는 것), 이름, 실행 확인(스파이크나 시나리오로 사실을 재야 하는 것), 소유자 정책(소유자가 정해야 하는 것)이다. 출처의 줄 번호는 설계 문서(`08-design-a-to-z.md`, `09-landing-and-test-strategy.md`, `adr/`, `open-questions.md`)는 커밋 `99765899b`(16라운드) 판 기준이다. 17라운드 반영으로 줄이 옮겨졌으므로 절 번호를 함께 적는다. `reviews/`의 17라운드 파일과 `src/`는 2026-09-25 작업 트리 기준이다. 18라운드의 결정은 결정마다 닫은 사람(소유자 답의 위치 또는 원칙)을 적는다(`HANDOFF.md`의 다음 세션 2).

**외부 점검과 원장 파일럿에서 더한 행(2026-09-25).** codex와 antigravity가 17라운드 커밋 `165ee8948`을 기준으로 'PR-1·PR-2를 시작하기 전에 정해야 하는데 이 안건에 없는 것'을 점검했고, 검증자 둘이 지적마다 문서와 코드에 대조했다(원문과 판정은 `reviews/raw-round18-early-check.md`). 받은 지적, 검증 중에 새로 확인한 틈, 단일 원장 파일럿(오류와 경고 영역)이 드러낸 틈을 항목 끝에 출처를 밝혀 더했다. 이 행들의 줄 번호는 `165ee8948` 기준이다. Q5 `virtual` 구조는 10라운드 소유자 답 E-4로 닫혀 있어 §9에서 뺐다.

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
| 노드 공유의 '같은 종류'. 소유자가 수락한 규칙은 '같은 이름 + 같은 타입이면 노드 하나'이고, 1라운드 R11이 이를 노드 종류로 다시 정의했다(`number`와 `integer`, `['string', 'null']`과 `'string'`은 같은 종류). ADR 0005 상태 줄이 소유자 확인을 요구하지만 어느 목록에도 오르지 않았다 — **답함(2026-09-26, `reviews/round-18-owner-answers.md:19`)** | `adr/0005-blueprint-analysis-and-node-sharing.md:3`, `:9`, `08-design-a-to-z.md:176`(§5) | PR-1 | 설계 결정(소유자 확인) |
| 옮길 잎 교차 함수의 뜻. `intersectConst`는 참조로 비교해 구조가 같은 객체·배열 `const`를 충돌로 던지고, `intersectPattern`은 두 패턴을 같은 자리의 전방 탐색으로 이어 두 패턴을 모두 만족하는 문자열(`'ab'`, `'Abc123'`)을 거부하며 역참조와 같은 이름의 캡처 그룹에서 깨진다. 기존 시험이 이 결함을 단언한다. `const`의 동등 판정, `pattern` 연언의 표현(정규식 하나인가 목록인가), 레거시의 옛 `intersect*Schema`가 옛 함수를 계속 쓰는지, 09 §4.3의 '그대로 산다'에서 뺄 단언(외부 점검 codex·antigravity, 검증자 실행 확인) | `08-design-a-to-z.md:571`(§17.2), `:324`(§9), `09-landing-and-test-strategy.md:158`(§4.3), `src/helpers/jsonSchema/processAllOfSchema/intersectSchema/utils/intersectConst.ts:23`, `intersectPattern.ts:21`, `utils/__tests__/intersectPattern.test.ts:13` | PR-1 | 설계 결정 |
| 터미널 전략 비교의 '경우'가 조각 중첩을 따르는가. 지금의 정의(그 노드를 선언한 게이트 가진 선언이 켜지고 꺼지는 조합)와 08 §9의 축약은 감싸는 조각 없이 켜질 수 없는 선언의 단독 경우까지 세어, 부모 조각의 `options.terminal: false`와 중첩 조각의 인라인 입력(가능한 경우는 모두 `branch`)을 청사진 오류로 판정한다. 17라운드 편집자 결정의 결함이며 같은 정의가 네 문서에 있다. N14와는 다른 물음이다(외부 점검 codex, 검증자 모의 실행) | `08-design-a-to-z.md:331`(§9), `02-target-overview.md:138`(§2.1), `03-mental-model.md:133`(§4), `adr/0011-branch-node-composition.md:59`(§3), `adr/0005-blueprint-analysis-and-node-sharing.md:40`(§1) | PR-1 | 설계 결정 |
| 같은 호스트의 `oneOf`와 `anyOf` 분기의 동순위. 키워드 순위가 둘을 한 순위로 두어 `oneOf[i]`와 `anyOf[i]`의 자리가 같다. 주석 키의 나중 승, 같은 대상 규칙의 같은 층 동점, 공유 충돌의 '앞선 종류', 터미널 전략의 '나중 것', 호스트 바퀴의 평가 순서가 모두 이 순서에 기댄다(오늘은 `oneOf` 먼저)(외부 점검 codex) | `08-design-a-to-z.md:176`(§5), `02-target-overview.md:124`(§2.1), `03-mental-model.md:126`(§4), `adr/0002-guard-fragment-model.md:59`, `adr/0005-blueprint-analysis-and-node-sharing.md:70`·`:94`, `src/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:450-451` | PR-1, PR-2 | 설계 결정 |
| 게이트 없는 분기의 선언이 터미널 전략과 `options` 병합에 드는가. 표현 키는 유일한 선언일 때만 쓰는데 터미널 판정은 켜진 선언을 모두 센다. 본체와 게이트 없는 `oneOf` 분기가 같은 객체를 선언하고 분기에만 인라인 입력이 있으면 노드는 터미널로 정해지는데 유효 스키마에는 그 입력이 없다(외부 점검의 검증자, 개연) | `08-design-a-to-z.md:331`(§9), `:193`(§6), `02-target-overview.md:138`(§2.1), `adr/0002-guard-fragment-model.md:61` | PR-1 | 설계 결정 |
| `controls.children` 가운데 PR-1·PR-2가 쓰는 부분. 대상 해석(조각에서만 선언된 자식을 가리킬 수 있는가, 청사진에 없는 이름이 청사진 오류인가), 항목 `controls.active`의 전순서 자리, 호스트 바퀴·전이 예산 식('게이트 가진 조각 수 + 노드 게이트 수 + 1')이 `children` 항목 게이트와 조각 범위 제어 게이트를 세는가. §9의 'PR-6 전'에는 대상별 식과 값 키만 남는다(외부 점검 codex, 검증자) | `08-design-a-to-z.md:299`·`:302`(§8.4), `:244`·`:246`(§7), `:496`(§15), `02-target-overview.md:159`(§2.3), `adr/0008-event-system.md:91`, `adr/0014-error-policy.md:259`(§7.2) | PR-1, PR-2 | 설계 결정 |
| 켜진 조각과의 런타임 교차가 공집합일 때 공개 `node.jsonSchema`가 싣는 것(`enum`은 빈 배열인가, `const` 충돌의 표현, 범위의 역전). PR-1의 병합표 시험이 이 결과를 단언한다(외부 점검의 검증자, 개연) | `adr/0005-blueprint-analysis-and-node-sharing.md:76`(§3), `08-design-a-to-z.md:324`(§9), `09-landing-and-test-strategy.md:168`(§4.4) | PR-1 | 설계 결정 |

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
| 입력 구성 요소의 객체 전체 쓰기(`onChange({ a: 1 })`)의 종류: 부분 쓰기, 로드가 아닌 전체 교체, 로드 가운데 무엇인가와 입력이 쓰기 옵션을 넘길 수 있는가(오늘은 `Replace`이고 `Refresh`는 없다). 터미널 객체는 그 노드의 원본 교체로 읽히며, 정해지지 않은 것은 자식 프록시를 그리는 브랜치 입력이다. ADR 0013이 미결로 적었으나 이 표 첫 행은 출처로만 걸었다(외부 점검 codex) | `08-design-a-to-z.md:264`(§8.1), `:471`(§14의 39행), `adr/0013-core-does-not-rewrite-values.md:106`, `src/components/SchemaNode/SchemaNodeInput/SchemaNodeInput.tsx:49-58`, `type.ts:33-37` | PR-2, PR-4, PR-7 | 설계 결정 |
| `batch` 안의 읽기. `fn` 안에서 쓴 뒤 `value`·`outputValue`·`FormHandle.getValue()`와 `setValue(updater)`가 받는 이전 값이 직전 커밋을 보는가, 표시된 원본을 보는가. 직전 커밋을 보면 updater 둘이 1만 더한다(외부 점검 codex) | `08-design-a-to-z.md:395`(§12), `:411`(§13), `adr/0008-event-system.md:80`(§3), `06-conclusions.md:358`, `src/core/nodes/AbstractNode/AbstractNode.ts:355-364` | PR-4, PR-2(값 게터) | 설계 결정 |
| 가상 노드에 길이가 다른 배열을 쓰는 쓰기(`INVALID_VIRTUAL_NODE_VALUES`)의 분류(공개 API면 호출자 오류, 자동 쓰기면 정착 오류)와 코드 무리. ADR 0014가 '슬라이스 1의 `options.virtual` 설계 항목'에 넘겼으나 그 항목이 어느 목록에도 없었다(외부 점검의 검증자) | `adr/0014-error-policy.md:257`(§7.2), `src/core/nodes/VirtualNode/VirtualNode.ts:42-55`, 이 안건 §1의 `options.virtual` 행 | PR-2, PR-3 | 설계 결정 |
| 재생성 `reset`의 개발 모드 경고(재생성의 원인이 함수·구성 요소 칸의 참조뿐일 때 한 번 알림)의 코드, `level`, `onError` 전달. ADR 0014의 분류표와 코드 목록 어디에도 없다(원장 파일럿에서 드러남) | `09-landing-and-test-strategy.md:87`·`:96`(§2.6), `adr/0014-error-policy.md` §7.1·§7.2 | PR-7 | 설계 결정 |
| 배열 전용 명령을 배열이 아닌 노드에서 부를 때의 호출자 오류(`SchemaFormError`)의 코드. 09 §3은 행의 공유 칸이 던진다고 적으나 ADR 0014의 분류표와 코드 목록에 없다(원장 파일럿에서 드러남) | `09-landing-and-test-strategy.md:112`(§3), `adr/0014-error-policy.md` §7.1·§7.2 | PR-2, PR-5 | 설계 결정 |

## 4. 프로토타입 v7, PR-0 실행 확인 (D)

| 항목 | 출처 | 막는 PR | 성격 |
| --- | --- | --- | --- |
| 게이트 입력의 `extras` 정적 규칙, 같은 순위 규칙, 나감 에지, 전이 라운드 상한이 나감 비움(R17-2 ㄴ의 하위 트리 비움과 잠복 자손 비움 포함)을 포함해 실제로 보장되는지 | `08-design-a-to-z.md:454`(§15), `reviews/raw-round17-convergence.md` §7 | PR-2(PR-0 산출물) | 실행 확인 |
| PR-2의 독립 검증 경계. §17.1은 각 PR이 새 코드와 그 시험만으로 검증된다고 하나, PR-2의 예산 다섯 가운데 파생 라운드(PR-3), 되먹임 파동과 `onChange` 중첩(PR-4), 사슬 끝 throw의 진입 사슬(PR-4), 원본 B의 배열 아이템 기록(PR-5)은 PR-2 혼자 넘길 수 없다. PR-2가 시험하는 것, 시험 대역으로 시험하는 것(대역의 계약), 뒤로 미루는 것을 가르고, 이식할 프로토타입 회귀를 기능별로 PR-2·PR-3·PR-4에 나눈다. `unsetOnInactive` 네 층 가운데 `children` 항목과 조각 `controls` 층은 PR-6의 것이라 PR-2 시험을 노드 자신과 Form 속성 층으로 줄이는지도 정한다. 프로토타입 v7 통과와 따로 닫는다(외부 점검 codex·antigravity, 검증자) | `08-design-a-to-z.md:551`(§17.1), `:572`–`:576`(§17.2), `:244-248`(§7), `09-landing-and-test-strategy.md:169`·`:171`·`:173`(§4.4), `adr/0008-event-system.md:88-95`(§3), `spikes/round10/r10.mjs` | PR-2 | 설계 결정 |

## 5. ADR 0009의 성능 예산 수치와 '일정 수준'의 형태·수치, 번들 예산 (E)

| 항목 | 출처 | 막는 PR | 성격 |
| --- | --- | --- | --- |
| "일정 수준"의 형태(옛 판 대비 배율인가 절대 수치인가)와 수치(16라운드 답 6) | `adr/0009-performance-budget-and-benchmarks.md:96` | 착수 전 | 소유자 정책 |
| 예산의 수치(키 입력과 마운트, 대규모 쓰기와 배치). 기준선은 있다 | `adr/0009-performance-budget-and-benchmarks.md:97`, `08-design-a-to-z.md:461`(§15) | 착수 전 | 소유자 정책 |
| 문서화된 안전 임계(필드 50개, 배열 아이템 30개)를 올릴 것인가 | `adr/0009-performance-budget-and-benchmarks.md:98` | 착수 전 | 소유자 정책 |
| 번들 크기 예산(현재 gzip 약 44KB) | `adr/0009-performance-budget-and-benchmarks.md:99` | 착수 전 | 소유자 정책 |
| 인터프리터형 검증기의 지원 수준, 컴파일 예산 — **지원 수준은 답함(2026-09-26, `reviews/round-18-owner-answers.md:13`), 컴파일 예산 수치는 열림** | `adr/0009-performance-budget-and-benchmarks.md:100`·`:102` | 착수 전 | 소유자 정책 |
| 노드 구조의 벤치(섞인 종류 1만 노드의 읽기 순회, 노드당 힙 바이트, 같은 맵인지, 거대형 자리 수, 입력에서 커밋까지, 생성 시간. V8과 JavaScriptCore) | `reviews/raw-round17-node-structure.md` §7 | PR-2 | 실행 확인 |

## 6. 노드 구조의 설계 빈틈

| 항목 | 출처 | 막는 PR | 성격 |
| --- | --- | --- | --- |
| N2. 탐색이 기대는 `subnodes`(비활성 자식 포함)와 `variant`·`oneOfIndex`의 존폐. 레코드에 전체 자식 칸을 둘지, `detectsCandidate`와 그 시험을 버릴지, `find`·`findNodes`가 형상에 없는 노드를 돌려주는지. 자식 선언의 신원은 (이름, 종류)인데 09 §3은 객체 `structure`를 키별 자식 맵으로 적는다. 같은 이름에 종류가 다른 두 노드가 `structure`에 어떻게 들고 `find`가 무엇을 돌려주는지(외부 점검의 검증자, `adr/0005-blueprint-analysis-and-node-sharing.md:67`, `09-landing-and-test-strategy.md:104`) | `reviews/raw-round17-node-structure.md` §9, `src/core/nodes/AbstractNode/utils/findNode/findNode.ts:69`, `findNodes.ts:92`, `utils/detectsCandidate.ts:40-42`, `src/core/nodes/AbstractNode/utils/traversal/depthFirstSearch.ts:18` | PR-2 | 설계 결정 |
| N5. 런타임 형(`SchemaNodeRuntime`)의 타입 순환. 통지 대기열, 검증기, 진단 칸의 타입을 `dispatch`·`validation`이 소유하면 `record/`와 타입 고리가 생긴다. 의존 역전(`record/`가 칸 타입을 인터페이스로 선언)으로 끊을지, 검증기 칸의 타입을 오늘 `app/plugin`에서 떼는 import 분리와 함께 정할지 | `reviews/raw-round17-node-structure.md` §3·§9, `reviews/raw-round17-convergence.md:46`(R15-2의 import 분리) | PR-2(모양), PR-4(검증기 칸) | 설계 결정 |
| **닫힘 — 18라운드 소유자 답 S1**(노드마다 타입에 맞는 parse 함수를 두되 뜻이 그대로인 변환만 한다(ajv 규칙 수준). 문자 제거·자르기·빈 값 치환은 뺀다. `reviews/round-18-owner-answers.md`, 실행 검증은 `reviews/raw-round18-s1-parse-check.md`. 변환하지 못한 입력은 받은 그대로 들고 정합 상태(경고등)와 `onError` 경고로 알린다. S1 셋째로 닫힘. 후속 세부는 아래 'S1 결정의 후속 세부' 행). 다른 종류의 값을 보존할 때 잎 노드의 공개 값 형. ADR 0013 결정 1(받은 값을 고치지 않는다)과 그 표(타입별 파서의 강제 변환은 입력 구성 요소로)에 따라, 로드·`setValue`·자동 쓰기로 수 노드에 `"12"`가 오면 core는 그대로 두고 검증이 알린다. 그러면 오늘의 형(수 또는 `null`·`undefined`)이 거짓이 된다. 수 노드는 수만 받는가(결정 1의 예외가 된다), 형을 넓히는가. N6보다 먼저 정한다(외부 점검 codex. 소유자가 물음을 검토 중) | `adr/0013-core-does-not-rewrite-values.md:29`·`:88`, `08-design-a-to-z.md:152`(§4), `09-landing-and-test-strategy.md:113`(§3), `src/core/nodes/NumberNode/NumberNode.ts:21`·`:51`·`:101` | PR-2, PR-7 | 설계 결정(소유자 확인) |
| N6. 레코드에서 공개 판별 합집합으로의 형 변환. `navigation/`은 레코드 형을 돌려주고 공개 `find`·`findNodes`·`parentNode`·`children`은 공개 합집합을 돌려줘야 한다. 변환을 공개 겉면 `utils`의 함수 하나로 둘지, 사용자 정의 타입 술어로 할지 승인받은 단언 하나로 할지 | `reviews/raw-round17-node-structure.md` §6·§9(단언 금지 규칙과 겉면 린트) | PR-2 | 설계 결정 |
| N14. 행이 없는 조합. 잎에 `options.terminal: false`(오늘은 `branch`가 되어 fieldset으로 그려짐), 가상에 `options.terminal: true`(오늘은 자식 구성 요소가 비워짐), 가상에 인라인 `presentation.FormTypeInput`을 둔 경우(오늘은 `getNodeGroup.ts:22-23`이 `'terminal'`로 정함, `stories/08.VirtualSchema.stories.tsx:63-66`)의 처리와 08 §14의 이주 행 | `reviews/raw-round17-node-structure.md` §9, `src/core/nodes/AbstractNode/utils/getNodeGroup/getNodeGroup.ts:20-21`, `src/core/nodes/AbstractNode/utils/getNodeGroup/getNodeGroup.ts:22-23` | PR-1(청사진의 전략 결정) | 설계 결정 |
| `emit`의 키 순서(Q14). ADR 0007 §2의 합성 행은 '스키마 선언 순서, `extras`는 뒤에 받은 순서'라고 적었으나 Q14는 열려 있다. 조각에서만 선언된 키와 공유 노드 키의 자리(전순서인가 첫 선언인가), `options.propertyKeys`와의 관계, 선언된 키만 고치는 패치(F13)와 삽입 순서의 긴장, 비용. PR-2가 이식할 프로토타입 회귀가 직렬화 문자열로 순서를 단언한다. §9의 'PR-3 전'에서 옮겼다(외부 점검 antigravity, 검증자) | `adr/0007-settle-cycle.md:62`(§2)·`:151`, `open-questions.md:86-88`, `adr/0011-branch-node-composition.md:98`, `reviews/raw-round17-node-structure.md:97`(§4), `08-design-a-to-z.md:127`(§3.3), `spikes/round9/regress/selfcheck-v5.mjs:47,59` | PR-1, PR-2 | 설계 결정 |
| S1 결정의 후속 세부. (1) 정합 상태(경고등)의 이름과 공개 형 판별자의 모양, 루트에서 트리 전체의 불일치를 한 번에 읽는 자리(§7과 함께). (2) 입력 구성 요소의 계약: 치다 만 글자는 입력이 들고, 빈 칸은 `undefined`, 비우기는 nullable이면 `null` 아니면 `undefined`를 보낸다. 기본 수 입력(빈 칸에 `valueAsNumber`의 `NaN`)과 기본 불리언 체크박스(`defaultChecked={defaultValue ?? undefined}`)를 고친다. (3) 틀린 형의 값을 게이트와 식이 볼 때: `if`의 `minimum`은 수가 아닌 값에 참이고, 식이 틀린 형에서 던지면 `EXPRESSION_THREW`로 `degraded`가 되어 검증기 없는 폼도 제출이 막힌다. (4) nullable이 아닌 노드의 `null`(서버의 NULL)이 더는 방출에서 빠지지 않아 검증기 있는 폼의 제출을 막는 사용성 변화의 문서화. (5) 가상 노드의 예외(자기 원본이 없어 모양이 틀린 쓰기는 오늘처럼 거부)와 `VirtualNode.ts:45`의 길이 검사 앞에 배열 확인. (6) 문서 반영: ADR 0013 결정 1의 이름 붙은 예외(형 정규화와 변환 목록), ADR 0014 §3·§6·§7.2의 새 경고 코드, 08 §4·§8, 09 §3의 `interpret` 칸 계약(순수, 던지지 않음, 멱등, 실패하면 항등), 04의 F27, 03:152, `src/core/parsers/INTENT.md` | `reviews/raw-round18-s1-unconvertible-review.md` §2, `reviews/round-18-owner-answers.md`의 S1 셋째 | PR-2, PR-7 | 설계 결정 |

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

- **PR-3 전.** 에지의 값 동등 판정(참조인지 깊은 비교인지), `controls.derived` 의존 집합의 출처, 조각의 `controls`에 둔 식 규칙이 나감 에지에서 발화하는 세부(`08-design-a-to-z.md:456`). (`emit`의 키 순서 Q14는 PR-2 전이라 §6으로 옮겼다.)
- **PR-4.** `compileGuard` 계약 세부, 사본 루트 등록의 해제 계약 세부, `validatorFactory`와 플러그인의 계약 통일, 검증 에러 라우팅(Q12)과 union 호스트 수준 에러의 라우팅, 유효 스키마 변경 이벤트의 표면(`08-design-a-to-z.md:457`, `adr/0005-blueprint-analysis-and-node-sharing.md:128`, `adr/0008-event-system.md:200`). `ValidationManager` → `PluginManager`의 React 모듈 import 분리(`reviews/raw-round17-convergence.md:46`). `$id` 기저 URI와 `$dynamicRef`에서 따로 컴파일한 게이트가 문맥 평가와 같은 답을 내는지(`adr/0005-blueprint-analysis-and-node-sharing.md:132`, 실행 확인). `if`의 공허한 참 경고(Q10, `open-questions.md:68`).
- **PR-5 전.** 배열 아이템의 생김과 채움(통째 교체의 identity, `push`가 로드인가), `contains`·`prefixItems`(Q13), 큰 배열의 지연 실체화(벤치 뒤)(`08-design-a-to-z.md:458`, `adr/0011-branch-node-composition.md:92-94`).
- **PR-6 전.** `controls.children`의 대상별 식과 값 키 세부, 조각에서만 선언된 자식을 가리킬 수 있는가, 대상이 형상에 없을 때(`08-design-a-to-z.md:459`, `adr/0003-group-namespace.md:142`).
- **PR-7 전.** 폐기된 트리의 참조를 끊는 범위, 입력 판정(자식 프록시의 마운트 여부)의 구현 확인(`08-design-a-to-z.md:460`). `@winglet/react-utils` 선택 인자의 모양(17라운드 소유자 답 (나)로 확장은 허용됨, `reviews/raw-round17-onerror.md` §4의 바운더리 경로). 실제 브라우저의 IME 확인(`adr/0008-event-system.md:203`).
- **PR과 무관하거나 인접.** Q1의 남은 세부(잠복 원본의 실제 파기 시점, 복원값 대 초기값 등, `open-questions.md:5-15`), Q2 null 계약의 표현(`open-questions.md:17`), Q4 표준 밖 FE 조건부 필드(`open-questions.md:27`), Q15 직전 커밋 `active`를 출발 가설로 쓰는 최적화(`open-questions.md:90`, 실행 확인), 터미널 노드 아래 경로의 계약(S11, `adr/0011-branch-node-composition.md:91`).

## 10. 18라운드 뒤 — 총검증

18라운드가 닫힌 뒤, 설계 완료를 확정하기 전에 codex와 antigravity로 교차검증한다. 14라운드까지는 두 모델의 교차가 여러 번 있었고(2026-09-22 세 모델 결정 교차검증, 6–14라운드의 도출과 레드팀), 15–17라운드에는 이름 규칙 검증 한 번뿐이다.

| 과녁 | 맡는 곳 | 까닭 |
| --- | --- | --- |
| 소유자 답 없이 닫힌 결정(단일 원장의 '닫은 사람' 칸으로 거른다) | codex와 antigravity가 따로 | 둘이 함께 짚으면 강한 신호이고, 한쪽만 짚으면 검증자가 원문과 대조한다 |
| 문서 전체의 정합 | antigravity | 큰 맥락을 한 번에 읽는다 |
| 오늘 코드 위에서 PR-1·PR-2가 착지하는가(형 설계와 타입 순환 포함) | codex | 코드를 읽고 타입 검사를 돌릴 수 있다 |

결과는 권고일 뿐 채택 결정이 아니다. 지적마다 검증자가 원문과 대조해 거르고, 소유자 답과 부딪치는 지적은 고치지 않고 소유자 질문으로 올린다. 검토자는 파일을 고치지 않으며, 검토 전 커밋이 기준점이다.

## 11. 원장 증류가 드러낸 열린 항목 — 안건에 행이 없던 것 (2026-09-26)

단일 원장(`ledger/`)을 만들며 옛 문서에는 열려 있는데 이 안건에 행이 없던 항목이다. 행마다 원장 번호를 적고, 원장 항목의 상태는 이 절의 줄을 가리킨다. 성격은 설계 결정이며, 소유자 물음은 §12에 따로 둔다.

| 번호 | 항목 | 원문 위치 | 원장 |
| --- | --- | --- | --- |
| 11-1 | 로컬 선언끼리의 결합(잠금은 OR, 표시는 AND)에 대한 소유자 확인. 12라운드에 "좀 더 설명 필요"로 남음 | `adr/0003-group-namespace.md:144` | CONTROLS-062 |
| 11-2 | `virtualRequired`가 `required` 재작성과 함께 사라지는지 확인 | `adr/0003-group-namespace.md:146` | CONTROLS-065 |
| 11-3 | 리프 노드의 잠금을 누가 집행하는가. 오늘은 입력 컴포넌트 구현에 위임, 새 설계는 키의 유지만 적음 | `05-before-after.md:42` | CONTROLS-070 |
| 11-4 | `FormTypeInputProps.alias`의 처분 | `05-before-after.md:54` | CONTROLS-071 |
| 11-5 | `placeholder` 키가 어느 그룹에 드는가(14라운드 검토는 오늘 최상위 키가 아니라 뺐다고 적음, ADR 0003 §7은 검증기에 가는 맨 키로 적음) | `05-before-after.md:56`, `reviews/round-14-owner-review.md:55`, `adr/0003-group-namespace.md:125` | CONTROLS-072 |
| 11-6 | 터미널 노드의 입력이 빈 `ChildNodeComponents`를 읽을 때의 개발 모드 경고 — ADR 0014 §7.2 코드 목록에 코드가 없음 | `adr/0011-branch-node-composition.md:61` | ERROR-185 |
| 11-7 | 루트 `dataPath`가 플러그인은 `"/"`, 오늘 타입은 `""` | `adr/0002-guard-fragment-model.md:200` | FRAGMENT-040 |
| 11-8 | 플러그인 FormTypeInput이 동기 UpdateValue나 Promise 배열 API에 기대는지 확인(물려받은 제약 T-23) | `04-inherited-constraints.md:53` | GOAL-084 |
| 11-9 | C3 남은 세부 — 스키마 타입의 컴포넌트 자리를 core가 불투명하게 다루고 바인딩 계층이 타입을 입히는 방법 | `open-questions.md:62` | GOAL-087 |
| 11-10 | 잔여 키의 표시 규칙과 기본 문구, `formatError`의 `false schema` 번역, 잔여 키 UI의 기본 제공 — 렌더 계층의 일 | `adr/0002-guard-fragment-model.md:199` | REACT-026 |
| 11-11 | merge를 돕는 순수 함수(위치 불일치를 경고하는 helper)를 패키지가 제공할지 | `adr/0012-fe-overlay.md:37` | SCHEMA-020 |
| 11-12 | 가드 컴파일의 인스턴스 사이 공유의 나머지 세부 — 슬라이스 4의 설계 항목 | `08-design-a-to-z.md:180`, `08-design-a-to-z.md:493` | VALIDATE-037 |
| 11-13 | 검증을 입력 경로에서 떼어 내는 법(R19) — 커밋 번호 스탬프는 경합만 막음 | `adr/0007-settle-cycle.md:150` | VALIDATE-039 |
| 11-14 | 잠복 값 열거 API `getInactiveValues(path)`의 반환 모양 | `adr/0013-core-does-not-rewrite-values.md:108` | WRITE-020 |
| 11-15 | 상태 칸 변경(`controls.resetInteraction`이 커밋에서 판정하는 쪽)의 배달 — 16라운드 답 3은 `setState` 쪽만 답함 | `adr/0008-event-system.md:203` | EVENT-049 |
| 11-16 | `UpdatePath` — 배열 재인덱싱 시 경로 변경 통지 | `adr/0008-event-system.md:207` | EVENT-051 |
| 11-17 | C-10의 문서 자리 — 어느 문서가 소유하는지 | `adr/0008-event-system.md:209` | EVENT-053 |
| 11-18 | React 이펙트를 거친 진입 간 순환이 React 자체 한도에 막히는지(06 D-17의 남는 것) | `06-conclusions.md:161` | EVENT-054 |
| 11-19 | 살아 있는 두 트리의 같은 `$id` 사본 루트의 중복 등록 — PR-4로 넘겨졌으나 §9의 PR-4 줄에 명시 행이 없음 | `adr/0014-error-policy.md:301,338`, `adr/0004-validator-plugin-compile-guard.md:34` | ERROR-051, ERROR-165, VALIDATE-020 |
| 11-20 | 명령 `RequestEmitChange`·`RequestInjection`과 05 §3이 든 공개 훅 셋의 거취 — 어느 문서에도 결정이 없음(원장 토큰 검사가 찾음) | `05-before-after.md:124,140,214` | LANDING-124 |

## 12. 소유자 물음 — 원장 검증이 올린 것 (2026-09-26)

영역별 검증자가 "원칙으로 정해지지 않고, 소유자 답이 없거나 소유자 답과 어긋나며, 사용자에게 보이는 결과가 갈린다"고 판정해 올린 물음이다. 답은 `reviews/round-18-owner-answers.md`에 원문 그대로 적고, 원장의 해당 항목을 그 답으로 닫는다.

| 번호 | 물음 | 갈리는 결과 | 원장 | 원문 |
| --- | --- | --- | --- | --- |
| 12-1 | 자동 변환(`"123"` → `123`)을 끄는 옵션을 두는가. "늘 켜짐, 끄는 옵션 없음"은 소유자의 물음("지원하나요?")에 편집자가 반영 칸에서 답한 것이다 — **답함(2026-09-26, `reviews/round-18-owner-answers.md:11`)** | 늘 켜짐이면 수 노드의 `"12"`는 언제나 `12`. 옵션을 두면 끈 폼에서는 `"12"`가 그대로 들고 경고가 나간다 | WRITE-053 | `reviews/round-18-owner-answers.md:9` |
| 12-2 | 포커스 아웃 `trim`이 자른 값의 쓰기가 자동 쓰기인가. 소유자가 고른 R17-3 "다"의 원문은 "자동 쓰기가 여섯이 됨"인데 반영 칸과 문서는 "자동 쓰기가 아니다"로 적었다. 함께: "자른 값이 현재 값과 같으면 쓰지 않는다"(§3 :45의 전제, 편집자 결정)를 받는가 — **답함(2026-09-26, `reviews/round-18-owner-answers.md:12`)** | 자동 쓰기면 억제를 켠 폼에서 공백이 잘리지 않고, 아니면 잘린다 | WRITE-009, WRITE-007, CONTROLS-007 | `reviews/round-17-owner-answers.md:11`, 이 안건 :45 |
| 12-3 | 인터프리터형 검증기를 어느 수준까지 지원하고 컴파일 예산은 얼마인가(§5 :67과 같은 물음, 여기서는 원장 번호만 잇는다) — **답함(2026-09-26, `reviews/round-18-owner-answers.md:13`)** | AJV 기준 예산만 보장하면 인터프리터형은 큰 폼에서 느리다. 격차를 줄이려면 역색인이 필요해 VALIDATE-032(E13 기각)와 FRAGMENT-023(`if` 내용 불관여)을 다시 열어야 한다 | VALIDATE-027 | `adr/0009-performance-budget-and-benchmarks.md:100,102` |
| 12-4 | 1라운드부터 미수락으로 남은 "방언 선언과 개발 모드 경고" 제안을 받는가 — **답함(2026-09-26, `reviews/round-18-owner-answers.md:14`)** | 받으면 `$schema`와 플러그인 방언이 어긋날 때 개발 콘솔 경고가 생긴다. 버리면 소비자 책임으로 남고 경고는 없다 | VALIDATE-026 | `adr/0004-validator-plugin-compile-guard.md:42`, `reviews/round-1.md:178` |
| 12-5 | `UpdateValue` 통지에 출처(`source`) 칸을 더하지 않는 것으로 확정하는가. O-3은 소유자의 되물음이었다 — **답함(2026-09-26, `reviews/round-18-owner-answers.md:15`)** | 더하지 않으면 호스트는 프로덕션에서 자동 쓰기를 구별하지 못한다. 더하면 공개 표면이 칸 하나만큼 넓어진다 | EVENT-025 | `reviews/round-14-owner-answers.md` O-3 |
| 12-6 | 소유자의 절 단위 통과를 08·09 대신 새 설계문서에서 하는가(`HANDOFF.md:155`의 제안). 2026-09-26의 확정 답이 이 제안까지 명시하지 않았다 — **답함(2026-09-26, `reviews/round-18-owner-answers.md:16`)** | 예면 08·09는 통과 절차 없이 백업되고 새 설계문서를 절 단위로 통과한다. 아니오면 08·09도 절 단위로 통과한 뒤 새 설계문서로 간다 | PROCESS-053, PROCESS-062 | `HANDOFF.md:155`, `08-design-a-to-z.md:3` |
| 12-7 | 변환하지 못한 입력의 `onError` 기록 level을 편집자가 `'warning'`으로 정해도 되는가, `'error'`인가. 17라운드 게이트 R17G-3이 같은 종류의 읽기를 소유자에게 올린 선례가 있다 — **답함(2026-09-26, `reviews/round-18-owner-answers.md:17`)** | `'warning'`이면 기본 드러남은 개발 모드 콘솔뿐이고 핸들러 없는 프로덕션에는 출력이 없다. `'error'`면 모든 환경에서 기본 드러남(throw·거부·싱크)이 있어야 하고 통보 3과의 관계를 다시 정해야 한다 | ERROR-182, ERROR-184, LANDING-120 | `reviews/round-18-owner-answers.md:9` |
| 12-8 | 값 읽기 이름(`value`는 원본, 방출 값의 이름 등, 07 §6.2 N3)에 소유자 동의 원문이 없다. ADR 0006의 "소유자 동의"는 편집자 서술이다. 이름을 확정하는가 — **답함(2026-09-26, `reviews/round-18-owner-answers.md:18`)** | 이름 표면이 확정되거나 다시 열린다 | VALUE-011, VALUE-024 | `adr/0006-single-value-ownership.md:3`, `07-conclusions.md` §6.2 |
| 12-9 | 노드 공유의 "같은 종류" 정의를 받는가(§1 :20과 같은 물음, 원장 번호만 잇는다) — **답함(2026-09-26, `reviews/round-18-owner-answers.md:19`)** | 받으면 `number`·`integer` 분기나 `['string','null']`·`'string'` 분기가 노드 하나를 공유해 분기가 바뀌어도 값이 남는다. 받지 않으면 두 선언은 다른 노드가 되고 게이트 없는 분기끼리는 청사진 오류다 | BLUEPRINT-009 | 이 안건 :20 |
| 12-10 | D-15: 컨벤션을 어긴 양의 순환 스키마에서 로드한 값이 알림 없이 빠지고 상태가 `stable`로 남는 것을 받아들이는가. 소유자 답 A-2("고지 의무")와 답 19("컨벤션 문서로만")가 서로 다른 쪽을 가리킨다 — **답함(2026-09-26, `reviews/round-18-owner-answers.md:20`)** | 받아들이면 TEST-061은 현행(부정 결정). 알리기로 하면 열림이 되고 경고 코드가 필요하다 | TEST-061 | `reviews/round-10-owner-answers.md` A-2, `reviews/round-9-spec.md` 답 19 |
