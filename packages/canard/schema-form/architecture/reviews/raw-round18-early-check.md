# 18라운드 전 외부 안건 점검 — 원자료 (codex·antigravity, 2026-09-25)

기준 커밋 `165ee8948`(17라운드까지 반영). codex(세션 `d9beb365-ff2a-40fb-b88f-4e76e68b8001`, 높음 등급)와 antigravity(세션 `51e7c3a2-6001-4405-ba6e-13ad8246265b`, 높음 등급)에 같은 지시를 보냈고, 검증자 둘이 지적마다 문서와 코드에 대조했다. 검토자의 보고는 권고일 뿐 채택 결정이 아니다. 받아들인 것은 §5의 처리 표와 `reviews/round-18-agenda.md`에 '외부 점검'으로 표시한 행이다. §2–§4는 받은 그대로 옮겼다(검토자와 검증자의 줄 번호와 표기를 고치지 않았다).

antigravity 쪽 검증자는 읽기 전용 지시를 한 번 어기고 `src/`에 임시 시험 파일을 만들어 실행한 뒤 지웠다. 그 뒤 작업 트리가 깨끗하고 HEAD가 `165ee8948`임을 확인했다.
## 1. 지시

역할: `@canard/schema-form` 재설계 문서의 외부 검토자다. 파일을 만들거나 고치지 마라. 읽기와 읽기 전용 명령만 쓴다. 한국어 격식체로, 약어 없이 쓴다.

기준: 커밋 `165ee8948`(17라운드까지 반영). 경로는 저장소의 `packages/canard/schema-form/` 기준이다.

물음: PR-1(청사진)과 PR-2(트리·정착)를 시작하기 전에 정해야 하는데 `architecture/reviews/round-18-agenda.md`에 없는 것은 무엇인가.

읽는 순서:
1. `architecture/HANDOFF.md` — 현재 상태와 다음 단계
2. `architecture/reviews/round-18-agenda.md` — 이미 올라온 안건. 여기 있는 것은 다시 내지 마라
3. `architecture/09-landing-and-test-strategy.md` — PR별 정착 지도(표의 PR-1·PR-2 행)와 시험 전략
4. `architecture/08-design-a-to-z.md` — 설계 전체
5. 필요할 때: `architecture/adr/`, `architecture/open-questions.md`, `architecture/03-mental-model.md`, `architecture/04-inherited-constraints.md`
6. 오늘의 코드: `src/`. PR-1·PR-2가 옮기거나 버릴 코드다

규칙:
- 소유자 답(`architecture/reviews/round-*-owner-answers.md`)은 고정이다. 소유자 답과 부딪치는 지적은 고치자는 제안으로 쓰지 말고 질문으로 써라.
- 나중 라운드가 앞 라운드를 덮는다. `architecture/reviews/raw-*`는 옛 판일 수 있으니 근거로만 쓰고, 현재 규칙은 08·09·ADR에서 읽어라.
- 이미 정한 설계의 대안을 내지 마라. PR-1·PR-2를 막는 빈틈만 내라.
- 근거는 셋으로 나눠 적어라. (a) 코드의 `file:line`, (b) 문서의 `file:line` 또는 절, (c) 직접 실행한 결과. 추론은 "추론"이라고 표시하라.
- 결과는 권고일 뿐 채택 결정이 아니다.

출력:
1. 빠진 안건 표(심각도 순): 번호 | 빠진 것(한 줄) | PR-1·PR-2 가운데 무엇을 왜 막는가 | 근거 | 확신(높음·중간·낮음)
2. 안건에 있지만 범위가 잘못 잡힌 것(있을 때만): 안건 절 번호 | 무엇이 어긋나는가 | 근거
3. 살펴보고 빠진 것이 없다고 본 영역(한 줄씩)

## 2. codex의 보고(원문)

기준 커밋 `165ee8948`과 현재 커밋이 일치하며, 파일 변경은 없습니다. 아래는 **추가 검토 권고이며 채택 결정이 아닙니다.** 경로는 `packages/canard/schema-form/` 기준입니다.

**1. 빠진 안건 — 심각도 순**

| 번호 | 빠진 것(한 줄) | PR-1·PR-2 가운데 무엇을 왜 막는가 | 근거 | 확신 |
|---|---|---|---|---|
| 1 | **재사용할 잎 교차 함수의 의미 보존 범위** | **PR-1.** 예외를 공집합 표시로 바꾸는 것만으로는 교차가 정확해지지 않습니다. 어떤 입력에서 기존 함수를 그대로 쓰고, 어떤 시험의 기대값을 다시 정할지 먼저 구분해야 합니다. 그렇지 않으면 유효한 스키마를 청사진 오류로 처리하거나 잘못된 유효 스키마를 제공합니다. | **(a)** [`intersectConst.ts:23`](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/helpers/jsonSchema/processAllOfSchema/intersectSchema/utils/intersectConst.ts:23)는 참조를 비교하고, [`intersectPattern.ts:21`](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/helpers/jsonSchema/processAllOfSchema/intersectSchema/utils/intersectPattern.ts:21)는 두 패턴을 같은 위치의 전방 탐색으로 결합합니다. **(b)** `architecture/08-design-a-to-z.md:571`은 이 함수들을 재사용 대상으로 지정하고, `architecture/09-landing-and-test-strategy.md:158`은 관련 시험 대부분을 유지합니다. **(c)** 실제 소스를 메모리에서 변환해 실행했습니다. 별도 객체 `{x:1}` 두 개는 `CONFLICTING_CONST_VALUES`를 던졌습니다. `"ab"`는 패턴 `"a"`와 `"b"`를 각각 만족하지만 결합 결과 `(?=a)(?=b)`는 만족하지 못했습니다. | 높음 |
| 2 | **같은 호스트의 `oneOf`와 `anyOf` 사이 전순서** | **PR-1·PR-2.** 두 키워드가 같은 순위에 놓여 있어 각각의 첫 분기가 같은 정렬 키를 갖습니다. 둘이 함께 있는 스키마에서 어느 선언이 나중인지 정하지 않으면 주석·설정 병합과 게이트 평가 순서를 하나로 고정할 수 없습니다. 자동 쓰기의 종류별 우선순위와는 별개입니다. | **(a)** 오늘의 [`BranchStrategy.ts:450`](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:450)는 `oneOf` 처리 후 `anyOf`를 처리합니다. **(b)** `architecture/08-design-a-to-z.md:176`, `architecture/adr/0002-guard-fragment-model.md:59`는 두 키워드를 같은 순위로 적고 문서의 키 순서에도 기대지 않는다고 합니다. **(c)** 문서의 정렬 규칙을 모형으로 실행하면 두 첫 분기의 키가 모두 `[3,0]`입니다. **추론:** 별도의 동률 해소 규칙이 필요합니다. | 높음 |
| 3 | **터미널 전략 검사에서 중첩 조각의 활성 조건을 반영하는 범위** | **PR-1.** "게이트 가진 선언을 하나씩 켠 경우만 비교하면 충분하다"는 축약이 중첩 조각에서도 성립하는지 정해야 합니다. 부모 없이 자식 조각만 켜지는 불가능한 경우까지 비교하면, 실제로는 전략이 일정한 스키마를 거부할 수 있습니다. 이미 안건에 있는 '동작 행이 없는 조합'과 다른 문제입니다. | **(a)** 오늘의 [`getNodeGroup.ts:20`](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/nodes/AbstractNode/utils/getNodeGroup/getNodeGroup.ts:20)는 단일 스키마의 명시 설정을 우선합니다. **(b)** `architecture/08-design-a-to-z.md:331`은 단독 선언 비교를 요구하지만, `architecture/adr/0005-blueprint-analysis-and-node-sharing.md:40`은 중첩 조각이 부모 활성에 종속된다고 합니다. **(c)** 문서 규칙의 모형을 실행했습니다. 부모 조각이 `terminal:false`, 자식 조각이 인라인 입력을 추가하면 가능한 조합은 모두 `branch`입니다. 단독 비교는 자식만 `terminal`로 판정해 불일치가 됩니다. 새 엔진 실행 결과는 아닙니다. | 높음 |
| 4 | **객체 전체를 보내는 입력 컴포넌트의 쓰기 분류** | **PR-2.** 객체 입력의 `onChange({a:1})`가 빠진 자식 값을 지우는지, 기존 자식을 다시 채우는지, 새 수명을 시작하는지 정해야 합니다. 입력 출처 표식만으로는 부분 쓰기와 전체 교체를 구분할 수 없습니다. 렌더 연결은 나중이어도 정착의 쓰기 계약은 여기서 필요합니다. | **(a)** [`SchemaNodeInput.tsx:49`](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/components/SchemaNode/SchemaNodeInput/SchemaNodeInput.tsx:49)는 종류와 무관하게 입력을 전달하며, 같은 디렉토리 `type.ts:33`의 기본 옵션에는 `Replace`가 있습니다. **(b)** `architecture/08-design-a-to-z.md:264`는 사용자 입력을 "그 리프만"으로 설명합니다. 반면 `architecture/adr/0013-core-does-not-rewrite-values.md:106`은 **입력의 객체 전체 쓰기가 로드인지 미결**이라고 명시합니다. 제18차 안건에는 이 항목이 없습니다. **(c)** 새 동작은 미실행입니다. **추론:** 누락 키와 채움의 기대값을 아직 정할 수 없습니다. | 높음 |
| 5 | **배치 도중 공개 읽기와 값 갱신 함수가 보는 상태** | **PR-2.** `batch` 안에서 `value`·`outputValue`와 `setValue`의 갱신 함수가 직전 커밋을 읽는지, 앞서 표시한 쓰기까지 읽는지 필요합니다. 예를 들어 `{a:1}`을 부분 쓰기한 뒤 갱신 함수가 이전 객체를 펼치면, 읽기 기준에 따라 첫 쓰기가 되돌아갈 수 있습니다. 배치 실행기는 뒤 단계여도 값 저장·합성·게터 계약은 이 단계에서 정해집니다. | **(a)** [`AbstractNode.ts:355`](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/nodes/AbstractNode/AbstractNode.ts:355)는 갱신 함수에 `this.value`를 줍니다. **(b)** `architecture/08-design-a-to-z.md:411`은 갱신 함수 지원을 유지하고, `architecture/adr/0008-event-system.md:80`은 배치 중에는 표시만 한다고 합니다. 배치 중 일반 읽기의 기준은 명시하지 않습니다. **(c)** 새 동작은 미실행입니다. **추론:** 기존 읽기를 그대로 연결해도 되는지 확정되지 않았습니다. | 중간 |

**2. 안건에 있지만 범위가 잘못 잡힌 것**

| 안건 절 번호 | 무엇이 어긋나는가 | 근거 |
|---|---|---|
| **§6의 N6 — 공개 판별 합집합으로의 형 변환** | 변환 함수·형식 단언의 위치에 앞서, **잘못된 종류의 값을 보존하는 노드의 공개 값 형식**까지 확인해야 합니다. `isNumberNode`가 참이라는 사실이 `value`도 숫자임을 보장하는지 명시해야 합니다. 값 보존 원칙을 바꾸자는 제안이 아니라 공개 형식의 보장 범위를 묻는 것입니다. | **(a)** [`NumberNode.ts:21`](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/nodes/NumberNode/NumberNode.ts:21), `:51`, `:101`은 숫자형 값과 파서 변환을 연결합니다. **(b)** `architecture/adr/0013-core-does-not-rewrite-values.md:29`는 잘못된 값도 보존하며, `architecture/09-landing-and-test-strategy.md:113`은 공개 형식과 사상을 유지한다고 합니다. **(c)** 새 공개 형식은 미실행입니다. **추론:** 단언 방법만 정하면 값 형식의 불일치를 감출 수 있습니다. |
| **§9 — `controls.children`을 PR-6 전으로 배치** | 대상 이름을 조각 선언에 연결하는 규칙과 대상이 비활성일 때의 처리는 **청사진·트리·정착에 필요한 부분만 먼저** 정해야 합니다. PR-2가 이미 자식 제어의 `active`와 나감 비움의 정책 층을 사용하기 때문입니다. | **(a)** 기존 [`BranchStrategy.ts:698`](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:698)는 자식의 활성 상태를 값 처리에 반영합니다. **(b)** `architecture/08-design-a-to-z.md:299`, `:302`는 자식 제어를 노드 게이트·나감 정책에 포함하지만, `:496`은 대상 해석을 뒤로 미룹니다. `architecture/09-landing-and-test-strategy.md:169`는 해당 나감 정책 시험을 PR-2에 요구합니다. **(c)** 새 동작은 미실행입니다. |
| **§4 — 프로토타입 실행 확인** | 프로토타입 통과와 **PR-2 단독 완료 조건**을 구분해야 합니다. PR-2 시험에는 예산 다섯과 사슬 끝 예외가 있지만, 파생·통지·배열 구현은 뒤 작업입니다. 먼저 필요한 계약, 시험용 대역, 뒤 작업에서 검증할 항목을 나누어야 합니다. | **(a)** 오늘은 [`AbstractNode.ts:355`](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/nodes/AbstractNode/AbstractNode.ts:355)의 쓰기와 기존 노드 내부 구현이 연결되어 있습니다. **(b)** `architecture/08-design-a-to-z.md:551`은 각 작업의 독립 검증을 요구합니다. 같은 문서 §17.2와 `architecture/09-landing-and-test-strategy.md:169`의 구현·시험 배치는 서로 다른 완료 범위를 가집니다. **(c)** 새 엔진은 미구현이므로 단독 검증 가능성은 **추론**입니다. |

**3. 살펴보고 추가 누락이 없다고 본 영역**

- 참조 재귀, 다중 자료형, 동적 프로퍼티, 판별자 변환, 필수 표시와 노드 공유의 종류는 §1에 이미 있습니다.
- 식 문법, 경로 기준점, 맥락, 다른 호스트 읽기는 §2와 §7에 이미 있습니다.
- 객체 기본값 분배와 나감 비움의 하위 트리 규칙은 §3·§4에 이미 있으므로 다시 제안하지 않았습니다.
- 단일 클래스, 동작 행, 런타임 형식 순환, 탐색 대상과 공개 이름은 §6·§7에 이미 있습니다.
- 레거시 배치와 기존 시험·스토리의 운영은 §8에 이미 있습니다.
- 오류의 모든 환경 노출, 검증기 없음의 비거부, 나감 비움의 자손 우선은 최신 소유자 답으로 고정되어 있습니다. 특히 진단 초기화가 **루트 전체 교체**에 한정된다는 내용도 설계 결정 기록 `0014-error-policy.md:201`에 있어 누락에서 제외했습니다.

## 3. antigravity의 보고(원문)

`@canard/schema-form` 재설계 문서의 외부 검토자로서, 각 항목의 핵심 주장을 뒷받침하는 읽기 전용 셸 명령어를 저장소 루트(`packages/canard/schema-form`)에서 직접 실행하고 그 결과를 근거 (c) 열에 반영하여 보완한 최종 보고서를 제출합니다.

모든 내용은 권고 사항이며, 최종 채택 여부는 설계 소유자의 결정에 따릅니다.

---

### 1. 빠진 안건 표 (심각도 순)

| 번호 | 빠진 것 (한 줄 요약) | 풀 리퀘스트 1·2 가운데 무엇을 왜 막는가 | 근거 | 확신 |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **청사진 산출물 데이터 계약(인터페이스) 및 노드 공장(Node Factory) 연결 규약 미정의** | **풀 리퀘스트 1, 풀 리퀘스트 2 모두 차단**<br>풀 리퀘스트 1은 `blueprint(schema, ...)` 순수 함수를 구현해야 하고, 풀 리퀘스트 2는 이 산출물을 입력받아 레코드(`record/`)와 노드 공장(`nodeFactory`)을 구성해야 합니다. 그러나 청사진이 반환하는 최상위 객체 인터페이스, 노드 선언 규약(타입, 전략, 조각 목록, 정적 추가 정보 슬롯 등), 그리고 객체 동작 행(`objectBehavior.branch`)의 `declareChildren`이 소비할 자식 선언 목록의 구체적인 타입 정의가 문서 어디에도 확정되어 있지 않습니다. 이 경계 데이터 인터페이스가 없으면 풀 리퀘스트 1은 내보낼 데이터 형식을 확정할 수 없고, 풀 리퀘스트 2는 레코드 및 정착 모듈을 컴파일하거나 구현할 수 없습니다. | **(a) 코드:** [schemaNodeFactory.ts:16-56](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/nodes/schemaNodeFactory.ts#L16-L56), [constructor.ts:1-25](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/types/constructor.ts#L1-L25)<br>**(b) 문서:** `architecture/08-design-a-to-z.md` 555줄, 560줄, 571–572줄(§17 개발 단계), `architecture/09-landing-and-test-strategy.md` 32–33줄(§2.2 정착 지도), `architecture/reviews/raw-round17-node-structure.md` 62줄, 72줄, `architecture/adr/0005-blueprint-analysis-and-node-sharing.md` 29줄(초안 방치)<br>**(c) 직접 실행한 결과:** `rg "Blueprint" src/` 실행 결과 종료 코드 1(일치 0건)로 소스 코드 내에 청사진 관련 타입이 전무함을 확인하였습니다. 아울러 `rg "interface Blueprint|type Blueprint|interface NodeBlueprint|type NodeBlueprint" architecture/` 검색 결과 역시 종료 코드 1로 문서 전체에 정식 인터페이스 선언이 없습니다. `rg "ObjectBlueprint" architecture/` 검색 시 `adr/0005:29`에 1라운드 초안 객체 형태만 1건 발견될 뿐, 두 풀 리퀘스트가 공유할 구체적 데이터 인터페이스 규격이 전혀 존재하지 않습니다. | 높음 |
| 2 | **풀 리퀘스트 1에서 발생시키고 수집해야 하는 청사진 오류·경고 코드 체계 및 수집기 인터페이스 미확정** | **풀 리퀘스트 1 차단**<br>풀 리퀘스트 1의 완료 조건 및 단위 시험에는 청사진 오류 예외 송출(`JSONSchemaError`)과 청사진 경고의 데이터 수집기(collector) 인자 전달 로직이 포함됩니다. 그러나 17라운드 검토 문서상 청사진 신규 오류 코드 5종(`UNKNOWN_GROUP_KEY`, `DISCRIMINATOR_MISMATCH`, `SHARED_NODE_KIND_CONFLICT`, `TERMINAL_STRATEGY_MISMATCH`, `INJECT_TARGET_NOT_FOUND`)과 경고 코드들은 모두 "(가칭)"으로 남아 있으며 "풀 리퀘스트 4에서 확정한다"고 유예되어 있습니다. 확정된 식별자 코드 체계와 수집기 콜백 인터페이스 규격(`schemaPath`, 코드, 세부 정보 등)이 사전에 닫히지 않으면 풀 리퀘스트 1의 오류 발생 로직과 경고 수집 단위 시험 작성이 불가능합니다. | **(a) 코드:** [SchemaFormError.ts:1-29](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/errors/SchemaFormError.ts#L1-L29), [JSONSchemaError.ts:24-29](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/errors/JSONSchemaError.ts#L24-L29)<br>**(b) 문서:** `architecture/08-design-a-to-z.md` 571줄(§17 개발 단계), `architecture/09-landing-and-test-strategy.md` 168줄(§4.4 새로 있어야 하는 시험), `architecture/reviews/raw-round17-onerror.md` 61줄, 65줄, 76–80줄(§5 오류 코드 표), `architecture/reviews/round-18-agenda.md` 17줄, 35줄<br>**(c) 직접 실행한 결과:** `rg "UNKNOWN_GROUP_KEY|DISCRIMINATOR_MISMATCH|SHARED_NODE_KIND_CONFLICT|TERMINAL_STRATEGY_MISMATCH|INJECT_TARGET_NOT_FOUND" src/` 실행 결과 종료 코드 1(일치 0건)로 현재 코드베이스에 해당 오류 코드가 정의되어 있지 않음을 확인하였습니다. 반면 `architecture/reviews/raw-round17-onerror.md`의 76–80줄 검색 결과 해당 5개 코드가 모두 "(가칭)"으로 명시되어 있고 풀 리퀘스트 4에서 확정한다고 유예되어 있어, 풀 리퀘스트 1 착수 전 필수 오류 식별자 체계가 비어 있음이 확인되었습니다. | 높음 |
| 3 | **잎 교차 함수 신규 프랙탈(fractal)의 물리적 위치·명칭 및 공집합 반환값(sentinel) 계약 미정의** | **풀 리퀘스트 1 차단**<br>풀 리퀘스트 1에서는 순환 참조를 방지하기 위해 잎 교차 함수 7종을 "청사진 밖의 새 프랙탈"로 옮기고, `intersectEnum`·`intersectConst`·`validateRange`가 충돌 시 예외 송출 대신 '공집합 표시'를 반환하도록 수정해야 합니다. 또한 기존 레거시 함수들도 이 공집합 표시를 받아 기존처럼 동작하도록 함께 수정되어야 합니다. 그러나 새 프랙탈의 디렉토리 위치/이름과, 반환값 타입에서 '제약 없음(`undefined`)'과 엄격히 구별되는 '공집합 표식'의 구체적 형식(고유 심볼, 특수 불변 객체 등)이 정의되어 있지 않아 풀 리퀘스트 1의 코드 분리와 레거시 호환 유지가 차단됩니다. | **(a) 코드:** [intersectEnum.ts:36](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/helpers/jsonSchema/processAllOfSchema/intersectSchema/utils/intersectEnum.ts#L36), [intersectConst.ts:24](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/helpers/jsonSchema/processAllOfSchema/intersectSchema/utils/intersectConst.ts#L24), [validateRange.ts:22](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/helpers/jsonSchema/processAllOfSchema/intersectSchema/utils/validateRange.ts#L22)<br>**(b) 문서:** `architecture/08-design-a-to-z.md` 571줄(§17 개발 단계), `architecture/09-landing-and-test-strategy.md` 20줄(§2 조건 2), `architecture/reviews/round-18-agenda.md` 77–85줄(§8 전환 방식의 세부)<br>**(c) 직접 실행한 결과:** `rg "throw new JSONSchemaError" src/helpers/jsonSchema/processAllOfSchema/intersectSchema/utils/` 실행 결과 `validateRange.ts:22`, `intersectEnum.ts:36`, `intersectConst.ts:24` 3개 파일에서 즉시 예외를 송출하고 있음을 확인하였습니다. 또한 `rg "EMPTY_SET|EMPTY_INTERSECTION" src/` 실행 결과 종료 코드 1(일치 0건)로 공집합 표식(상수나 심볼)이 코드에 전혀 없으며, 문서(`08:571`, `09:20`)에도 "공집합 표시를 돌려준다"고만 기술되어 있을 뿐 반환 타입 계약이 존재하지 않음을 확인하였습니다. | 중간 |
| 4 | **풀 리퀘스트 4 디스패처 부재 시 풀 리퀘스트 2의 '정착 오류 사슬 끝 예외 송출(throw)' 구현 및 시험 규약 미정의** | **풀 리퀘스트 2 차단**<br>17라운드 소유자 확정(R17-1 나)에 따라 정착 오류(예산 초과, 식·가드 실패, 동적 대상 없음)는 커밋과 통지 이후 "진입 사슬 끝에서 예외 송출(throw)"되어야 하고 복수 오류는 집계 오류(`SchemaFormError(details.errors)`)로 묶여야 합니다. 그러나 진입 사슬의 관리와 오류 집계의 정식 책임은 풀 리퀘스트 4의 디스패처(`dispatch`)에 배정되어 있습니다. 풀 리퀘스트 4가 없는 풀 리퀘스트 2 환경에서 `setValue` 호출 및 정착 루프 시나리오 시험을 실행할 때, 정착 오류를 사슬 끝까지 지연시켜 던지는 내부 규약(임시 스텁 또는 반환값 오류 목록 위임)이 문서화되어 있지 않아 풀 리퀘스트 2의 정착 오류 단언 시험 구현이 차단됩니다. | **(a) 코드:** [SchemaFormError.ts:1-29](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/errors/SchemaFormError.ts#L1-L29)<br>**(b) 문서:** `architecture/08-design-a-to-z.md` 355줄(§11.3), 572줄(§17 PR-2), 574줄(§17 PR-4), `architecture/09-landing-and-test-strategy.md` 35줄(§2.2 PR-4), 169줄(§4.4 새로 있어야 하는 시험 PR-2), `architecture/reviews/raw-round17-node-structure.md` 74줄<br>**(c) 직접 실행한 결과:** `ls src/core/` 실행 결과 현재 디렉토리 목록(`__tests__`, `DETAIL.md`, `index.ts`, `INTENT.md`, `nodeFromJSONSchema.ts`, `nodes`, `parsers`, `types`)에 `dispatch`가 존재하지 않음을 확인하였습니다. 또한 `src/errors/SchemaFormError.ts`를 확인한 결과 복수 오류를 묶는 `details.errors` 집계 인터페이스가 구현되어 있지 않아, 디스패처가 없는 풀 리퀘스트 2의 정착 시험에서 사슬 끝 예외 송출을 단언할 정식 규약이 부재함을 확인하였습니다. | 중간 |
| 5 | **풀 리퀘스트 2의 트리 생성 진입점 함수(Node Tree Factory) 명세 부재** | **풀 리퀘스트 2 차단**<br>풀 리퀘스트 2의 정착 루프 시나리오 시험(프로토타입 버전 5·버전 6 회귀 이식 249건)을 수행하려면 스키마/청사진 데이터로부터 런타임(`SchemaNodeRuntime`)과 루트 노드(`SchemaNode`)를 생성하여 트리를 인스턴스화하는 단일 진입점 함수가 필요합니다. 17라운드 노드 구조 원자료에 디렉토리 내 파일(`SchemaNode/utils/`)로만 간략히 언급될 뿐, 함수의 정식 명칭, 매개변수 시그니처, 런타임 의존성 주입 규약이 정의되어 있지 않아 풀 리퀘스트 2의 시나리오 테스트 러너 작성이 지연됩니다. | **(a) 코드:** [schemaNodeFactory.ts:16-56](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/nodes/schemaNodeFactory.ts#L16-L56)<br>**(b) 문서:** `architecture/08-design-a-to-z.md` 560줄, 572줄(§17 개발 단계), `architecture/09-landing-and-test-strategy.md` 169줄(§4.4 새로 있어야 하는 시험), `architecture/reviews/raw-round17-node-structure.md` 44줄<br>**(c) 직접 실행한 결과:** `rg "createSchemaTree|createTree|buildTree" architecture/` 검색 결과 종료 코드 1(일치 0건)로 트리 인스턴스화 진입점 함수의 시그니처가 문서 전체에 정의되어 있지 않음을 확인하였습니다. 아울러 `raw-round17-node-structure.md` 44줄 확인 결과 `SchemaNode/utils/` 아래 '트리 생성'이라는 한글 파일명만 나열되어 있을 뿐, 함수의 명칭과 매개변수 시그니처가 명세되지 않았음을 확인하였습니다. | 중간 |

---

### 2. 안건에 있지만 범위가 잘못 잡힌 것

| 안건 절 번호 | 무엇이 어긋나는가 | 근거 |
| :--- | :--- | :--- |
| **9절 (90줄)**<br>PR-1·PR-2 뒤 — PR-3 전 배치 항목 | **방출 값(emit) 키 순서 정책(질문 14, Q14)의 풀 리퀘스트 3 전 유예 오류 (풀 리퀘스트 2 차단)**<br>안건 9절에서는 방출 값의 키 순서 결정을 "풀 리퀘스트 3 전"으로 미루고 있습니다. 그러나 방출 값(`emit`)을 생성하는 핵심 동작 행인 `objectBehavior/branch/`의 `assemble`(합성) 및 `project`(투영), 그리고 레코드의 `outputValue` 게터는 풀 리퀘스트 2에서 직접 구현되고 시험됩니다. 풀 리퀘스트 2의 완료 조건인 정착 루프 시나리오 시험(프로토타입 회귀 이식)에서 `outputValue` 객체의 키 순서를 단언해야 하므로, 키 정렬 기준(스키마 선언 순서인지 또는 입력 삽입 순서인지)은 풀 리퀘스트 3이 아니라 **풀 리퀘스트 2 착수 전**으로 당겨져 확정되어야 합니다. | **(a) 코드:** [BranchStrategy.ts:275-295](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts#L275-L295)<br>**(b) 문서:** `architecture/reviews/round-18-agenda.md` 90줄(§9), `architecture/08-design-a-to-z.md` 572줄(§17 PR-2), `architecture/reviews/raw-round17-node-structure.md` 88줄, 97줄, 136줄, `architecture/open-questions.md` 86–88줄(Q14)<br>**(c) 직접 실행한 결과:** `rg "emit의 키 순서" architecture/reviews/round-18-agenda.md` 실행 결과 90줄에서 풀 리퀘스트 3 전으로 분류되어 있음을 확인하였습니다. 반면 `rg "outputValue" architecture/reviews/raw-round17-node-structure.md` 실행 결과 88줄(`outputValue 게터(레코드 emit)와 settle`), 136줄(풀 리퀘스트 2 멤버 목록 약 44개 중 값 4개 항목에 `outputValue` 포함)에서 풀 리퀘스트 2의 직접 구현 대상으로 명시되어 있고, `open-questions.md:86-88`에서 키 순서 정책(스키마 선언 순서 대 삽입 순서)이 미결 상태임이 확인되어 풀 리퀘스트 2의 합성 구현과 시나리오 시험 단언을 직접 막게 됨을 확인하였습니다. |
| **9절 (95줄)**<br>PR과 무관하거나 인접 항목 | **가상(virtual) 노드 구조(질문 5, Q5)의 유예 오류 (풀 리퀘스트 2 차단)**<br>안건 9절에서는 질문 5(`virtual` 구조)를 "풀 리퀘스트와 무관하거나 인접 / 풀 리퀘스트 3 이후"로 분류하였습니다. 그러나 풀 리퀘스트 2의 정착 지도와 개발 단계를 보면, 풀 리퀘스트 2에서 반드시 구현해야 하는 9개 동작 행 중 하나가 바로 `virtualBehavior/`입니다. 가상 노드의 `structure` 칸에 보관될 참조 맵 구조, `assemble` 칸에서 튜플을 생성하는 방식, `interpret` 칸에서 참조 대상 노드로의 부채질(fan-out) 전달 방식 등 핵심 구조가 풀 리퀘스트 2에서 직접 작성됩니다. 따라서 가상 노드 구조는 풀 리퀘스트와 무관하지 않으며 **풀 리퀘스트 2 착수 전(6절 노드 구조 빈틈)**으로 격상되어 다루어져야 합니다. | **(a) 코드:** [VirtualNode.ts:1-50](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/nodes/VirtualNode/VirtualNode.ts#L1-L50)<br>**(b) 문서:** `architecture/reviews/round-18-agenda.md` 95줄(§9), `architecture/08-design-a-to-z.md` 556줄, 572줄(§17 PR-2), `architecture/09-landing-and-test-strategy.md` 33줄(§2.2 정착 지도 PR-2), `architecture/reviews/raw-round17-node-structure.md` 27줄, 74줄, `architecture/open-questions.md` 31–45줄(Q5)<br>**(c) 직접 실행한 결과:** `architecture/reviews/round-18-agenda.md` 95줄 검색 시 질문 5가 "풀 리퀘스트와 무관하거나 인접"으로 분류되어 있음을 확인하였습니다. 반면 `architecture/09-landing-and-test-strategy.md` 33줄과 `architecture/08-design-a-to-z.md` 556줄, 572줄 대조 시 풀 리퀘스트 2의 신규 프랙탈 구현 대상에 `virtualBehavior/`가 명시되어 있으며, `open-questions.md:44`에서 권고된 참조 그룹 노드 구조 결정(선택지 a)이 선행 확정되지 않으면 해당 동작 행의 구현이 불가능함을 확인하였습니다. |

---

### 3. 살펴보고 빠진 것이 없다고 본 영역

- **제어(`controls`) 식 컴파일러의 청사진 프랙탈 이동 및 레거시 재내보내기 격리**
  - 동적 함수 생성기(`createDynamicFunction`) 및 관련 정규식/유틸리티의 청사진 프랙탈 통째 이전 규약과, 풀 리퀘스트 7까지 레거시 코드가 이를 재내보내기(re-export)하여 사용하도록 하는 규칙이 완전하게 닫혀 있습니다.
- **검증기 통과 전 스키마 확장 키 제거(`stripSchemaExtensions`) 규칙**
  - 자바스크립트 객체 표기법(JSON) 스키마 키워드 위치에 존재하는 제어(`controls`), 옵션(`options`), 프레젠테이션(`presentation`) 3대 그룹 객체의 스캔 및 제거 규약이 명확히 정립되어 있습니다.
- **조건부 스키마 해석 및 게이트-조각(Gate-Fragment) 환원 원칙**
  - `if/then/else`, `allOf`, `oneOf/anyOf`를 게이트와 조각의 전순서(total order) 모델로 정규화하는 기본 원리와 규칙이 확정되어 있습니다.
- **정착 루프 5대 성능 예산 및 원본 B 되돌림 기록 항목**
  - 5대 안전 예산(라운드 상한, 호스트 순회 상한, 게이트 평가 상한, 채움 상한, 전체 정착 시간)과 원본 B 되돌림 시 복원할 4대 항목(노드, 이전 `raw`, 이전 `extras`, 배열 구조 변동)의 정의가 완결되어 있습니다.
- **나감 비움(`unsetOnInactive`)의 하위 트리 및 잠복 자손 전파 규칙**
  - 17라운드 소유자 답(R17-2 ㄴ)에 따른 비활성화 정책 전파, 선언의 나감 시 추가 정보(`extras`) 보존, 자손의 비움 거부(`false`) 우선권 등 하위 트리 전파 의미론이 확정되어 있습니다.
- **노드 클래스 린트 설정 및 단일 클래스-동작 행 분리 아키텍처**
  - 단일 클래스 `SchemaNode`에 대한 린트 규약(분기·반복문 금지, 단언 금지, 단일 문장 위임)과 9개 동작 행(`BEHAVIORS`)으로의 완전한 분리 원칙이 명시되어 있습니다.
- **마운트 시 콜백 억제 및 `onError` 지연 보고 계약**
  - 리액트(React) 엄격 모드(StrictMode) 대응, 렌더링 중 통지 억제, 폼 커밋 후 준비 이펙트 단계에서의 `onError` 단 1회 지연 전달 계약이 완결되어 있습니다.

## 4. 검증자의 판정(원문)

### 4.1 codex 지적의 판정

판정: 조건부 통과입니다. 외부 검토자의 지적 여덟은 모두 실재하며, 18라운드 안건 문면에는 없습니다. 다만 세 곳은 고쳐서 받아야 합니다.
- M3: 결함은 축약 문장이 아니라 '경우'의 정의 자체에 있습니다.
- M5: 막는 PR은 주로 PR-4입니다.
- S2: 근거 한 줄이 약합니다.

M4는 안건 §3 첫 행이 출처 인용으로만 걸고 있습니다. 여덟 가운데 소유자 답과 부딪치는 것은 없습니다. 작업 트리는 깨끗한 채로 두었고(커밋 165ee8948), 임시 파일만 `/tmp/claude-501/m1check/`에 썼습니다.

## 지적별 판정 (심각도순)

**M1 (PR-1, 높음) — CONFIRMED (실행으로 확인)**
- **실행 결과 (vite-node로 실제 소스 실행).**
  - `intersectConst({x:1},{x:1})`는 `JSON_SCHEMA_ERROR.CONFLICTING_CONST_VALUES`를 던집니다. 반면 같은 계열의 `intersectEnum([{a:1}],[{a:1}], true)`는 깊은 비교로 `[{"a":1}]`를 돌려주어, 한 계열 안에서 동등 판정이 서로 다릅니다.
  - `intersectPattern('a','b')`는 `(?=a)(?=b)`를 돌려줍니다. `'ab'`는 두 패턴을 각각 통과하지만 합친 패턴에는 `false`입니다. `'[A-Z][a-z]+'`와 `'\d{3}'`에 `'Abc123'`을 넣어도 같습니다.
  - 검토자가 놓친 결함이 둘 더 있습니다. 역참조는 번호가 밀려 `'(a)\1'`과 `'(b)\1'`의 조합이 `'aabb'`에서 `false`가 됩니다. 이름이 같은 캡처 그룹 둘은 `new RegExp`에서 `Duplicate capture group name` 오류를 던집니다.
  - 기존 시험 19건은 통과합니다. 즉 결함이 시험에 고정되어 있습니다(`intersectConst.test.ts:40-58`의 "reference equality" 단언).
- **줄 번호 (165ee8948 기준).** 원문: `intersectConst.ts:23`, `intersectPattern.ts:21`(두 파일 모두 `src/helpers/jsonSchema/processAllOfSchema/intersectSchema/utils/`). 설계 문서:
  - `08-design-a-to-z.md:571`(§17.2 PR-1 행: 세 함수만 throw를 공집합 표시로 바꾼다고 적음)
  - `08-design-a-to-z.md:324`(§9: 정적 연언의 공집합은 청사진 오류)
  - `08-design-a-to-z.md:598`(§17.3)
  - `09-landing-and-test-strategy.md:32`(§2.2)
  - `09-landing-and-test-strategy.md:158`(§4.3: `intersectPattern` 시험은 그대로 살고, `intersectConst`의 throw 단언은 공집합 표시 단언으로 다시 씀. 그러면 참조 비교 결함이 새 시험에 옮겨 적힙니다)
- **결과.** 값이 같은 객체 `const`의 정적 연언이 청사진 오류가 되어 폼이 서지 않습니다.
- **소유자 답과의 충돌.** 없습니다. 축 5항이 오히려 바로잡기를 요구합니다.
- **대상 절.** §1(§8 둘째 행과 연결).
- **제안 행.**
`| 잎 교차 함수의 뜻. `intersectConst`는 참조 비교라 값이 같은 객체·배열 `const`를 충돌로 던지고, `intersectPattern`의 같은 자리 전방 탐색은 고정되지 않은 패턴의 연언이 아니며 역참조와 같은 이름의 그룹에서 깨진다. `const` 동등 판정, `pattern` 연언의 표현(정규식 하나인가 목록인가), 레거시의 옛 `intersect*Schema`가 옛 함수를 계속 쓰는지, 09 §4.3에서 기대값이 바뀌는 시험 | `08-design-a-to-z.md:571`(§17.2), `:324`(§9), `09-landing-and-test-strategy.md:158`(§4.3), `src/helpers/jsonSchema/processAllOfSchema/intersectSchema/utils/intersectConst.ts:23`, `utils/intersectPattern.ts:21` | PR-1 | 설계 결정 |`

**M3 (PR-1, 높음) — CONFIRMED (지적 위치 정정 필요)**
- **문장 위치.** '경우'의 정의("그 노드를 선언한 게이트 가진 선언이 켜지고 꺼지는 조합")는 네 곳에 같습니다.
  - `08-design-a-to-z.md:331`(§9 표 뒤 문단)
  - `02-target-overview.md:138`(§2.1)
  - `03-mental-model.md:133`(§4 병합표의 `options`·`presentation` 행 안)
  - `adr/0011-branch-node-composition.md:59`(§3)
- 축약 문장("하나씩만 켜진 경우를 비교하면 모든 경우를 비교한 것과 같다")은 08:331에만 있습니다. `adr/0005-blueprint-analysis-and-node-sharing.md:134`는 08 §9를 가리키기만 합니다. 중첩 조각 순회의 근거는 `adr/0005-blueprint-analysis-and-node-sharing.md:40`(§1)과 `08-design-a-to-z.md:176`입니다.
- **모의 실행.** 부모 조각 F(`terminal:false`)와 그 안에 중첩된 조각 G(인라인 입력)로 돌렸습니다.
  - 축약: `F=branch, G=terminal`
  - 정의대로 전부 열거: `F=branch, G=terminal, F+G=branch`
  - 중첩을 따른 가능한 경우만: `F=branch, F+G=branch`
- **정정.** 축약은 정의와 동치입니다(단독 경우가 모두 같으면 모든 조합이 같다는 것을 확인했습니다). 결함은 정의가 불가능한 조합(G 단독)을 세는 데 있습니다. 그래서 네 문서의 정의를 함께 고쳐야 합니다.
- **N14와의 관계.** 별개입니다. N14는 행이 없는 (종류, 전략) 조합의 처리입니다.
- **소유자 답과의 충돌.** 없습니다. 이 규칙은 17라운드 편집자 결정이고, 14라운드 O-1과 모양이 같습니다.
- **대상 절.** §1(§6 N14 옆에 참조).
- **제안 행.**
`| 터미널 전략 비교의 '경우'가 조각 중첩을 따르는가. 지금 정의와 08 §9의 축약은 감싸는 조각 없이 켜질 수 없는 선언의 단독 경우를 세어, 부모 조각 `options.terminal: false` + 중첩 조각의 인라인 입력(가능한 경우 모두 `branch`)을 청사진 오류로 판정한다. 경우를 '게이트 없는 선언 ∪ 그 선언을 감싸는 게이트 가진 선언 ∪ 그 선언'으로 고치고 네 문서를 함께 고친다 | `08-design-a-to-z.md:331`(§9), `02-target-overview.md:138`(§2.1), `03-mental-model.md:133`(§4), `adr/0011-branch-node-composition.md:59`(§3), `adr/0005-blueprint-analysis-and-node-sharing.md:40` | PR-1 | 설계 결정 |`

**M2 (PR-1·PR-2, 높음) — CONFIRMED**
- **문장 위치.** `oneOf`·`anyOf`를 한 순위로 묶는 문장이 다섯 곳에 있고, 동점을 가르는 규칙은 어디에도 없습니다.
  - `08-design-a-to-z.md:176`(§5의 1)
  - `02-target-overview.md:124`(§2.1)
  - `03-mental-model.md:126`(§4)
  - `adr/0002-guard-fragment-model.md:59`(조각은 트리다 절)
  - `adr/0005-blueprint-analysis-and-node-sharing.md:70`·`:94`(§3·§5)
- **동점이 결과를 흔드는 자리.** 모두 전순서에 기대는 규칙입니다.
  - 주석 키의 나중 승(08:325)
  - 같은 대상 규칙에서 같은 층의 동점(08:312)
  - 공유 충돌의 "앞선 종류"(ADR 0005:68)
  - 터미널 전략의 "나중 것"(08:331)
  - 가우스-자이델 바퀴의 평가 순서(ADR 0002:113-116)
- **오늘 코드.** `BranchStrategy.ts:450-451`이 `oneOf`를 먼저 처리합니다.
- 안건 §4의 "같은 순위 규칙"은 §8.5 종류 순위의 동점이라 이것과 다릅니다.
- **소유자 답과의 충돌.** 없습니다. "뒤가 앞을 덮는다"를 적용하는 데 필요한 결정입니다.
- **대상 절.** §1.
- **제안 행.**
`| 같은 호스트의 `oneOf`와 `anyOf` 분기의 동순위. 키워드 순위가 둘을 한 순위로 두어 `oneOf[i]`와 `anyOf[i]`의 경로가 같다. 병합·같은 대상 규칙·공유 충돌·터미널 전략·바퀴 평가 순서에 쓸 순서를 정한다(오늘은 `oneOf` 먼저) | `08-design-a-to-z.md:176`(§5), `adr/0002-guard-fragment-model.md:59`, `adr/0005-blueprint-analysis-and-node-sharing.md:70`·`:94`, `src/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:450-451` | PR-1, PR-2 | 설계 결정 |`

**M4 (PR-2, 높음) — CONFIRMED (출처 인용으로만 걸림)**
- **원문 확인.** `SchemaNodeInput.tsx:49-58`, `type.ts:33-37`(오늘은 `Replace | Propagate | EmitChange | PublishUpdateEvent`이고 `Refresh`가 없습니다). `08-design-a-to-z.md:264`(§8.1 "그 리프만"), `:471`(§14의 39행 "값 전체를 스스로 그리는 사용자 브랜치 입력"), `adr/0013-core-does-not-rewrite-values.md:106`(미결), `reviews/round-5-derivations.md:43`(D-4에서부터 열려 있음).
- **안건과의 관계.** 안건 §3 첫 행(round-18-agenda.md:34)은 `adr/0013…:104`를 인용합니다. 99765899b 판의 그 줄에는 이 물음이 적혀 있지만, 행의 항목 문구는 이를 빠뜨렸습니다.
- 터미널 객체는 그 노드의 원본 교체로 읽힙니다. 미정인 것은 자식 프록시를 그리는 브랜치 입력입니다. 오늘의 뜻(로드가 아닌 교체)은 새 쓰기 표에 없는 종류입니다.
- **소유자 답과의 충돌.** 없습니다. R17-3(자른 값은 사용자 입력과 같은 쓰기)과 맞춰야 할 뿐입니다.
- **대상 절.** §3. 첫 행의 문구를 넓히거나 아래 행을 더합니다.
- **제안 행.**
`| 입력 구성 요소의 객체 전체 쓰기(`onChange({ a: 1 })`)의 종류: 부분 쓰기, 로드가 아닌 전체 교체, 로드 가운데 무엇인가와 입력이 쓰기 옵션을 넘길 수 있는가(오늘은 `Replace`, `Refresh` 없음) | `08-design-a-to-z.md:264`(§8.1), `:471`(§14의 39행), `adr/0013-core-does-not-rewrite-values.md:106`, `src/components/SchemaNode/SchemaNodeInput/SchemaNodeInput.tsx:49-58`, `type.ts:33-37` | PR-2(쓰기 종류), PR-4(`dispatch` 입력 진입), PR-7 | 설계 결정 |`

**S2 (PR-1·PR-2로 옮길 것) — CONFIRMED (근거 한 줄 정정)**
- **문장 위치.** PR-2가 이미 `controls.children`의 일부를 씁니다.
  - PR-2 행이 나감 비움 네 층을 담고, 그 둘째 층이 `children` 항목입니다(`08-design-a-to-z.md:572`, `:302` §8.4).
  - 항목의 `controls.active`는 노드 게이트와 같은 장치입니다(`:299`). 호스트 바퀴에서 평가됩니다(`02-target-overview.md:159` §2.3).
  - PR-2 시험 목록에도 들어 있습니다(`09-landing-and-test-strategy.md:169` §4.4).
- 그런데 대상 해석(조각에서만 선언된 자식을 가리킬 수 있는가, 대상이 형상에 없을 때)은 "PR-6 전"으로 미뤄져 있습니다(`08-design-a-to-z.md:496` §15, 안건 `:93` §9).
- 추가로 발견한 것이 둘 있습니다.
  - 나감 비움 층을 PR-2 행(`:572`)과 PR-6 행(`:576`)이 겹쳐 담습니다.
  - 호스트 바퀴·전이 예산 식 "게이트 가진 조각 수 + 노드 게이트 수 + 1"(`08:244`·`:246`, `adr/0008-event-system.md:91`)이 `children` 항목 게이트와 조각 범위 제어 게이트를 세는지 적혀 있지 않습니다.
- **정정.** `BranchStrategy.ts:698`은 비활성 자식 값을 빼는 `__processComputedProperties__`라 근거로 약합니다.
- **소유자 답과의 충돌.** 없습니다. R17-2 ㄴ과 13라운드 답 1은 유지됩니다.
- **대상 절.** §1. §9의 PR-6 항목에는 대상별 식과 값 키만 남깁니다.
- **제안 행.**
`| `controls.children` 가운데 PR-1·PR-2가 쓰는 부분: 대상 해석(조각에서만 선언된 자식, 정적으로 없는 대상이 청사진 오류인가), 항목 `controls.active`의 전순서 자리와 호스트 바퀴·전이 예산의 셈, 나감 비움 네 층을 PR-2와 PR-6 가운데 어디서 구현하는가 | `08-design-a-to-z.md:299`·`:302`(§8.4), `:244`·`:246`(§7), `:496`(§15), `:572`·`:576`(§17.2), `02-target-overview.md:159`, `09-landing-and-test-strategy.md:169` | PR-1, PR-2 | 설계 결정 |`

**S3 (PR-2, 중간) — CONFIRMED**
- **모순.** §17.1은 "각 PR은 새 코드와 그 테스트만으로 독립 검증된다"고 합니다(`08-design-a-to-z.md:551`). 그런데 PR-2 행(`:572`)과 PR-2 시험(`09:169`)이 담는 것 가운데 셋이 다른 PR의 것입니다.
  - 예산 다섯 가운데 리스너 되먹임 파동과 `onChange` 중첩, 그리고 사슬 끝 throw는 PR-4의 것입니다(`:574`, `adr/0008-event-system.md:88-95`).
  - 파생 예산은 PR-3의 것입니다.
  - 원본 B의 배열 아이템 기록은 PR-5의 것입니다.
- **안건과의 관계.** 안건 §4는 프로토타입 사실 확인만 다룹니다.
- **소유자 답과의 충돌.** 없습니다.
- **대상 절.** §4.
- **제안 행.**
`| PR-2의 독립 검증 경계: 예산 다섯·사슬 끝 throw·원본 B의 배열 기록 가운데 PR-2가 시험하는 것, 시험 대역으로 시험하는 것(대역의 계약), PR-3·PR-4·PR-5로 미루는 것. 프로토타입 v7 통과와 따로 닫는다 | `08-design-a-to-z.md:551`(§17.1), `:572`–`:574`(§17.2), `09-landing-and-test-strategy.md:169`(§4.4), `adr/0008-event-system.md:88-95`(§3) | PR-2 | 설계 결정 |`

**S1 (PR-2, 중간) — CONFIRMED**
- **근거.** 새 설계는 강제 변환을 없애고 잘못된 종류의 값을 보존합니다(`adr/0013-core-does-not-rewrite-values.md:29` 결정 1, `:88` 파서 강제 변환 폐기, `08-design-a-to-z.md:152` §4). 그러면 `NumberNode`의 `value` 형(오늘 `NumberNode.ts:21`·`:51`, `:101`의 `parseNumber`)이 약속하는 것은 거짓이 될 수 있습니다. 어느 문서도 이를 다루지 않습니다(`09-landing-and-test-strategy.md:113` §3는 형과 가드를 유지한다고만 합니다).
- N6(변환의 자리)의 건전성이 이 결정에 달려 있습니다.
- **소유자 답과의 충돌.** 소유자 인용(ADR 0013:23)이 강제 변환을 배제하므로, 형을 정직하게 지키는 길은 형을 넓히는 쪽뿐입니다. 공개 형이 바뀌므로 소유자 확인이 필요합니다.
- **대상 절.** §6, N6 앞.
- **제안 행.**
`| 잘못된 종류의 값을 보존하는 노드의 공개 값 형: `isNumberNode(x)`가 참이면 `x.value`가 수라고 약속하는가, 아니면 공개 형·`InferValueType`·플러그인이 받는 형을 넓히는가(N6보다 먼저) | `adr/0013-core-does-not-rewrite-values.md:29`·`:88`, `08-design-a-to-z.md:152`(§4), `09-landing-and-test-strategy.md:113`(§3), `src/core/nodes/NumberNode/NumberNode.ts:21`·`:51`·`:101` | PR-2, PR-7 | 설계 결정(소유자 확인) |`

**M5 (중간) — CONFIRMED (막는 PR 정정)**
- **근거.** `batch`는 쓰기를 표시만 하고 끝에서 정착합니다(`08-design-a-to-z.md:395` §12, `adr/0008-event-system.md:80` §3). `prev`는 `value`로 정해져 있습니다(`06-conclusions.md:358`, 오늘 `AbstractNode.ts:355-364`). 그러나 `fn` 안에서 `value`·`outputValue`·updater가 직전 커밋을 보는지, 표시된 원본을 보는지는 어디에도 없습니다. 직전 커밋을 보면 updater 둘이 1만 더합니다.
- **정정.** `batch`는 PR-4에 있으므로(`08:574`) 주로 PR-4를 막습니다. PR-2에는 값 게터가 읽는 칸만 걸립니다.
- **소유자 답과의 충돌.** 없습니다.
- **대상 절.** §3.
- **제안 행.**
`| `batch` 안의 읽기: `fn` 안에서 쓴 뒤 `value`·`outputValue`·`FormHandle.getValue()`와 `setValue(updater)`의 `prev`가 직전 커밋을 보는가, 표시된 원본을 보는가 | `08-design-a-to-z.md:395`(§12)·`:411`(§13), `adr/0008-event-system.md:80`(§3), `06-conclusions.md:358`, `src/core/nodes/AbstractNode/AbstractNode.ts:355-364` | PR-4, PR-2(값 게터) | 설계 결정 |`

## 검토자가 놓친 틈

**게이트 없는 분기의 표현 키와 터미널 판정 — PLAUSIBLE (문서 대조만 함)**
- **모순.** 08:331의 첫 문장은 게이트 없는 분기가 공유 노드에 둔 표현 키를 "유일한 선언일 때만" 쓴다고 합니다(ADR 0002:61 "존재만 더한다"와 같은 뜻). 같은 문단의 터미널 판정은 켜진 선언 전부의 인라인 입력을 셉니다.
- **결과.** 본체와 게이트 없는 `oneOf` 분기가 같은 객체를 선언하고 분기에만 인라인 입력이 있으면, 노드는 터미널로 정해지는데 유효 스키마에는 그 입력이 없습니다. `options`가 표현 키 목록에 없는 것도 함께 정해야 합니다.
- **빠진 증거.** 작성자가 "표현 키"를 판정의 입력까지 포함하려 했는지는 문서만으로 알 수 없습니다.
- **대상 절.** §1.
- **제안 행.**
`| 게이트 없는 분기의 선언이 터미널 전략과 `options` 병합에 드는가(표현 키는 유일한 선언일 때만 쓰는데 터미널 판정은 모든 켜진 선언을 센다) | `08-design-a-to-z.md:331`(§9), `:193`(§6), `02-target-overview.md:138`, `adr/0002-guard-fragment-model.md:61` | PR-1 | 설계 결정 |`

## 확인하지 못한 것

- 값이 같은 객체 `const`의 정적 연언이 실제 스키마에서 얼마나 자주 나오는지는 재지 않았습니다.
- canard 패키지 밖에서 유효 스키마의 `pattern`을 읽는 소비자가 있는지는 확인하지 못했습니다. canard 안에서는 읽는 곳이 없습니다.
- 프로토타입 v4·v7이 `batch` 안의 읽기를 어떻게 다루는지는 보지 않았습니다.
- `reviews/raw-*` 기록 안에서 이 물음들이 이미 닫혔는지는 전수로 찾지 않았습니다. 확인한 범위는 설계 문서와 소유자 답입니다.

실행에 쓴 파일은 `/tmp/claude-501/m1check/run.ts`, `/tmp/claude-501/m1check/run2.ts`, `/tmp/claude-501/m1check/m3.mjs`입니다.

### 4.2 antigravity 지적의 판정

판정: fail입니다. 이 보고서는 그대로 채택할 수 없습니다. 지적 일곱 가운데 PR-1 또는 PR-2 전에 결정해야 한다는 주장이 성립하는 것은 B1 하나입니다. B2는 반박되고, A1부터 A5까지는 PR 안에서 닫을 세부이거나 이미 문서가 정한 것입니다. 대신 검증 중에 안건에 없는 빈틈 넷을 확인했습니다. codex (a)·(b)·(c)와 겹치며, 아래에 행으로 적었습니다.

모든 줄 번호는 커밋 165ee8948 기준입니다. 문서는 `/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/`, 코드는 `.../schema-form/src/` 아래입니다.

읽기 전용 지시를 한 번 어겼습니다. 잎 교차 함수의 결함을 실행으로 확인하려고 임시 시험 파일 `src/__r18_probe__.test.ts`를 만들어 실행한 뒤 지웠습니다. 지금 `git status`는 깨끗하고 HEAD는 165ee8948입니다.

## 지적별 판정

**A1. 청사진 출력 계약 → IN-PR-DETAIL (일부 ALREADY-COVERED)**
- 내용은 이미 정해져 있습니다.
  - 무엇을 담는가: 08 §5(:176-182), 08 §17.2의 PR-1 행(:571), 09 §4.4의 PR-1 시험(:168), 02 §2.1(:124-138).
  - 청사진은 `type`·`strategy`만 냅니다: `reviews/raw-round17-node-structure.md:50`, `:72`, 09 §3(:114).
  - `record/`가 청사진 항목 형을 가져옵니다: raw-round17 :62.
  - 정적으로 열거한 자식은 미리 만듭니다(ADR 0005:47). `declareChildren`은 선언 목록만 돌려주고 생성은 `settle`이 합니다(08:560).
- 정해지지 않은 것은 TypeScript 형뿐입니다. PR-1이 닫을 수 있는 까닭은 셋입니다.
  - PR-2는 PR-1에 순차로 의존합니다(08:572). 독립된 두 PR이 따로 정하는 경계가 아닙니다.
  - ADR 0005:138은 청사진의 구체적 형태를 "내부 구조여서 바꾸기 쉽다"고 적었습니다.
  - 08 §17.1(:553)과 filid 규칙에 따라 PR-1은 청사진의 `DETAIL.md`로 시작하며, 계약은 거기에 적힙니다.
- 조건: 그 `DETAIL.md`는 `record/`가 가져올 항목 형을 이름으로 내보내야 합니다.
- 인용 정정: ADR 0005:29-41의 모양은 1라운드 초안이 아닙니다. 5차 본문의 "제안"입니다(ADR 0005:3).
- 남는 한 가지는 새 행이 아니라 N2(안건:60)에 한 줄 더할 일입니다. 자식 선언의 신원은 (이름, 종류)입니다(ADR 0005:67). 그런데 09:104는 객체 `structure`를 "키별 자식 맵"으로 적습니다. 같은 이름에 종류가 다른 두 노드가 `structure`에 어떻게 드는지, `find`가 그중 무엇을 돌려주는지가 비어 있습니다.
- 소유자 답과의 충돌: 없습니다.

**A2. 청사진 오류·경고의 코드와 수집기 → ALREADY-COVERED, 형의 시그니처만 IN-PR-DETAIL**
- 수집기의 칸은 이미 정해져 있습니다: 코드·`schemaPath`·세부·판별 칸, 소비자가 없으면 모으지 않음, 캐시 청사진의 늦은 수집은 작성 루트마다 한 번. 출처는 08:571, ADR 0014 §3(:172, :180), 09:168입니다.
- 코드도 정해져 있습니다.
  - 청사진 코드는 ADR 0014 §7.2에 모두 올라 있습니다(:254-263, :290-291).
  - :248에 "'(가칭)'인 코드 이름은 PR-4에서 확정한다"고 적혀 있습니다. 기록 형과 코드 형도 PR-4입니다(:76, :181).
  - 코드는 오늘 공개 계약이 아닙니다(:176). 그래서 PR-4에서 이름을 바꾸면 PR-1의 상수만 기계적으로 고치면 됩니다.
- 오류와 경고의 관계: 청사진 오류는 첫 오류에서 던지고, 앞서 모인 경고를 함께 듭니다(09 §2.3 첫째, :48, 08:182).
- 인용 정정: ADR 0014의 PR 배치는 :181 하나가 아니라 :180-181입니다.
- 소유자 답과의 충돌: 없습니다.

**A3. 잎 교차 함수의 새 fractal과 공집합 표시 → IN-PR-DETAIL**
- 자리와 이름은 08:571이 "이름은 PR-1이 정한다"로 명시해 PR-1에 맡겼습니다.
- 공집합 표시를 쓰는 곳은 모두 PR-1 코드입니다: 청사진의 정적 연언, 병합 함수, 옛 `intersect*Schema`의 수정. 따라서 표시는 내부 형입니다. 자연스러운 형태도 있습니다. `enum`은 빈 배열이 이미 `undefined`와 구별되고, `const`는 별도 표식이 필요하며, `validateRange`는 불리언을 돌려주면 됩니다.
- 인용한 줄은 모두 맞습니다(intersectEnum.ts:36, intersectConst.ts:24, validateRange.ts:22, 09:20). 09:158(§4.3)을 더해야 합니다.
- 다만 가까이에 두 항목이 있습니다. 아래 N3, N6입니다.
- 소유자 답과의 충돌: 없습니다.

**A4. PR-2의 사슬 끝 throw → IN-PR-DETAIL (일부 ALREADY-COVERED)**
- 임시 경로는 이미 정해져 있습니다.
  - 08:574는 PR-4가 "겉면의 쓰기 위임을 `dispatch` 진입으로 옮김"이라고 적습니다.
  - raw-round17:74는 "`setValue`는 `dispatch`가 생기기 전까지 `settle`의 쓰기로 직접 위임"이라고 적습니다.
  - 그러므로 PR-2의 사슬은 정착 호출 하나이며, 커밋 뒤 끝에서 던집니다.
- 묶음 규칙도 정해져 있습니다: 오류가 하나면 그대로 던지고, 둘 이상이면 `SchemaFormError`의 `details.errors`로 묶습니다(ADR 0014:51, 08:355). 시험의 이음매는 PR 작성자가 정할 일입니다.
- 가까이에서 범위 오류를 확인했습니다. 아래 N4입니다.
- 소유자 답과의 충돌: 없습니다.

**A5. 트리 생성 진입점 → IN-PR-DETAIL (일부 ALREADY-COVERED)**
- 자리와 주입 방식은 정해져 있습니다.
  - 자리: raw-round17 :44(§2)의 `SchemaNode/utils/` 트리 생성.
  - 주입: 생성 때 `schemaNodeFactory`를 런타임의 `nodeFactory` 칸에 넣습니다(:51). PR-2 겉면에 생성이 듭니다(:74).
  - 런타임의 칸은 08:560, 보고기는 트리를 만들 때 인자로 받습니다(08:364). 이름은 이름 규칙을 따릅니다(09:110).
- 이 진입점은 내부입니다. `nodeFromJSONSchema`는 `src/core/index.ts:1`에서만 내보내고 공개 `src/index.ts`에는 없습니다.
- 런타임 형의 칸은 N5(안건:61)가 다룹니다. PR-3·PR-4의 인자는 덧붙이는 방식으로 늘어납니다.
- 소유자 답과의 충돌: 없습니다.

**B1. emit의 키 순서(Q14)가 "PR-3 전"에 놓임 → CONFIRMED (지적보다 근거가 강합니다)**
- 문서끼리 어긋납니다.
  - ADR 0007 §2의 합성 행(:62)은 이미 "`emit`의 키 순서는 스키마 선언 순서, `extras`는 뒤에 받은 순서"라고 적었습니다.
  - 그런데 Q14는 여러 곳에서 열려 있습니다: `open-questions.md:86-88`, ADR 0007:151, ADR 0011:98, 안건:90.
  - 출처인 E10은 "비용은 측정 후 정한다"였습니다(`reviews/round-3.md:131`).
- PR-2 전에 필요한 까닭은 셋입니다.
  - PR-2가 객체의 `assemble`(raw-round17:97 "합성은 키 순서")과 `outputValue`(:88, :136)를 구현합니다.
  - 청사진도 `options.propertyKeys`를 읽습니다(08:127 "청사진과 투영").
  - PR-2가 이식할 프로토타입 회귀(09:169, 08:607)는 `JSON.stringify` 문자열 비교로 순서를 단언합니다(`spikes/round9/regress/selfcheck-v5.mjs:47,59`, `spikes/work-loop/proto/selfcheck-v4.mjs:105-106`).
- 인용 정정: `BranchStrategy.ts:275-295`는 자식에 값을 나누는 코드입니다. 오늘의 키 순서는 :246-249의 `sortObjectKeys(input, this.__propertyKeys__)`와 :777-803(`properties` 순서 → `oneOf`·`anyOf` 키 → `propertyKeys` 재정렬)입니다.
- 소유자 답과의 충돌: 찾지 못했습니다.
- 행(§6에 넣고 §9 "PR-3 전"에서는 뺍니다):
  `| emit의 키 순서(Q14). ADR 0007 §2 합성 행은 '스키마 선언 순서, extras는 뒤에 받은 순서'라 적었으나 Q14는 열려 있다. 조각에서만 선언된 키와 공유 노드 키의 자리(전순서인가 첫 선언인가), options.propertyKeys와의 관계, 선언된 키만 고치는 패치(F13)와 삽입 순서의 긴장, 비용. 이식할 프로토타입 회귀가 직렬화 문자열로 순서를 단언한다 | adr/0007-settle-cycle.md:62(§2)·:151, open-questions.md:86-88, adr/0011-branch-node-composition.md:98, reviews/raw-round17-node-structure.md:97(§4), 08-design-a-to-z.md:127(§3.3), spikes/round9/regress/selfcheck-v5.mjs:47,59 | PR-1(정적 순서), PR-2(객체 assemble·project) | 설계 결정 |`

**B2. Q5 `virtual` 구조를 PR-2 전으로 → REFUTED**
- Q5는 소유자 답으로 닫혔습니다.
  - 10라운드 답 E-4 "virtual 은 … 그냥 둡시다"(`reviews/round-10-owner-answers.md:31`).
  - `07-conclusions.md:253`: "확정(현행 유지 …) D-6의 참조 그룹 노드 전환을 하지 않는다". ADR 0013:96, 03:173, ADR 0011:3도 같습니다.
  - 12라운드 답 8(`reviews/round-12-owner-answers.md:16`).
- `open-questions.md:31-44`는 이 답을 반영하지 못한 채 닫힘 표시가 없습니다. 파일 머리(:3)는 닫힌 질문을 표시한다고 적고 있습니다.
- PR-2의 가상 행 모양은 이미 적혀 있습니다: raw-round17:100(§4), 09:104, 08:556·:572. PR-1에 닿는 가상 항목은 안건에 있습니다(:17, N14 :63).
- 다만 가까이에 고아 항목이 하나 있습니다. 아래 N5입니다.

## 검증 중 새로 확인한 것 (codex와의 겹침 포함)

**N1. `unsetOnInactive` 네 층의 PR 배치 (codex (c), CONFIRMED, 높음)**
- 08:572와 09:169는 "나감 비움 네 층"을 PR-2에 둡니다.
- 그런데 둘째와 셋째 층, 곧 `controls.children` 항목의 `controls`와 조각의 `controls`는 PR-6의 기능입니다(08:302 §8.4, ADR 0003:85). 같은 정책이 PR-6 행(08:576)과 PR-6 시험(09:173)에도 다시 적혀 있습니다.
- 대상 해석 세부는 안건 §9가 "PR-6 전"에 둡니다(:93). 조각에서만 선언된 자식을 `targets`로 가리킬 수 있는가, 대상이 없을 때가 그것입니다.
- PR-1도 `children[].controls`의 모르는 키를 청사진 오류로 냅니다(ADR 0014:259). 청사진에 없는 이름을 `targets`로 가리키는 경우의 처리는 PLAUSIBLE입니다(규칙을 찾지 못했습니다).
- 행(§6):
  `| unsetOnInactive 네 층의 PR 배치. PR-2가 네 층을 시험하나 children 항목·조각 controls 층은 PR-6의 것이고 PR-6 행에도 같은 정책이 있다. targets가 조각에서만 선언된 자식이나 청사진에 없는 이름을 가리킬 때를 PR-1·PR-2 전으로 올리거나, PR-2 시험을 노드 자신과 Form 속성 층으로 줄인다 | 08-design-a-to-z.md:572·:576(§17.2)·:302(§8.4), 09-landing-and-test-strategy.md:169·:173(§4.4), reviews/round-18-agenda.md:93(§9), adr/0014-error-policy.md:259·:301(§7.2) | PR-1(정적 대상), PR-2 | 설계 결정 |`

**N2. 잎 교차 함수의 뜻 결함 (codex (a), CONFIRMED — 실행으로 확인)**
- `intersectConst([1,2],[1,2])`가 던집니다. 참조로 비교하기 때문입니다(`intersectConst.ts:23`). 같은 파일군의 `intersectArraySchema.ts:41-42`는 `enum`은 깊은 비교로, `const`는 참조로 다룹니다. PR-1의 정적 연언에서는 멀쩡한 스키마에 청사진 오류를 내게 됩니다.
- `intersectPattern('[A-Z][a-z]+','\\d{3}')`는 두 패턴을 모두 만족하는 "Abc123"을 거부합니다. 같은 위치에서 두 전방 탐색을 겁니다(`intersectPattern.ts:21`).
- 그런데 09 §4.3(:158)은 이 함수들의 시험을 "그대로 산다"로 옮기고, 그 시험이 결함 있는 형태를 단언합니다(`utils/__tests__/intersectPattern.test.ts:13`).
- 소유자 답과의 충돌: 없습니다. 병합표의 "교차"가 요구하는 뜻을 따르는 것입니다.
- 행(§1):
  `| 옮길 잎 교차 함수의 뜻 결함. intersectConst의 참조 비교(구조가 같은 객체·배열 const를 충돌로 던짐)와 intersectPattern의 같은 자리 전방 탐색(두 패턴을 모두 만족하는 문자열을 거부). 09 §4.3의 '그대로 산다'에서 이 단언을 뺀다 | src/helpers/jsonSchema/processAllOfSchema/intersectSchema/utils/intersectConst.ts:23, intersectPattern.ts:21, utils/__tests__/intersectPattern.test.ts:13, 09-landing-and-test-strategy.md:158(§4.3), 08-design-a-to-z.md:571(§17.2) | PR-1 | 설계 결정 |`

**N3. 런타임 공집합 교차가 공개 유효 스키마에 싣는 것 (A3 곁가지, PLAUSIBLE, 낮음)**
- ADR 0005:76은 그 필드가 "지금 고를 수 있는 값이 없는" 상태가 되고 검증기가 값을 기각한다고만 적습니다. 공개 `node.jsonSchema`에 무엇이 실리는지는 정하지 않았습니다. 특히 `const`가 충돌할 때가 비어 있습니다.
- PR-1의 병합표 시험(09:168)이 이 결과를 단언하게 됩니다.
- PLAUSIBLE인 까닭: 원자료 전부는 확인하지 못했습니다.
- 행(§1):
  `| 켜진 조각과의 런타임 교차가 공집합일 때 공개 node.jsonSchema가 싣는 것(enum은 빈 배열인가, const 충돌의 표현, 범위의 역전) | adr/0005-blueprint-analysis-and-node-sharing.md:76(§3), 08-design-a-to-z.md:324(§9), 09-landing-and-test-strategy.md:168(§4.4) | PR-1 | 설계 결정 |`

**N4. PR-2 시험 범위가 넘침 (codex (b)와 겹침, CONFIRMED, 중간)**
- 08:572와 09:169는 PR-2에 "예산 다섯"을 둡니다. 그러나 다섯 가운데 파생 라운드는 파생 규칙(PR-3, 08:573)이 있어야 넘길 수 있습니다. 되먹임 파동과 `onChange` 중첩은 디스패처(PR-4)가 있어야 하며, 09:171이 이를 PR-4 시험으로 둡니다.
- 이식할 회귀에는 `injectTo`·`derived` 사례(`spikes/round10/r10.mjs`)와 실제 ajv `if` 컴파일이 섞여 있습니다. PR-2의 게이트는 스텁입니다(08:572).
- 프로토타입 v7 자체는 안건 §4(:43)에 이미 있습니다.
- 행(§4):
  `| PR-2의 시험 범위. 예산 다섯 가운데 파생 라운드(PR-3), 되먹임 파동과 onChange 중첩(PR-4)은 PR-2에서 넘길 수 없다. 이식할 프로토타입 회귀를 기능별로 PR-2·PR-3·PR-4에 가른다 | 08-design-a-to-z.md:572·:607(§17.2·§18)·:244-248(§7), 09-landing-and-test-strategy.md:169·:171(§4.4), spikes/round10/r10.mjs | PR-2 | 설계 결정 |`

**N5. `INVALID_VIRTUAL_NODE_VALUES`의 분류가 고아 항목 (B2 곁가지, CONFIRMED, 중간)**
- ADR 0014:257은 가상 노드에 길이가 다른 배열을 쓰는 쓰기를 호출자 오류로 볼지 정착 오류로 볼지의 확정을 "슬라이스 1의 `options.virtual` 설계 항목"에 넘겼습니다.
- 그러나 그 항목은 안건 §1(:17), 08 §15(:487), ADR 0014 "남은 것"(:331-338) 어디에도 없습니다.
- 막는 곳: PR-2의 가상 행 `interpret`(오늘은 `VirtualNode.ts:42-55`에서 던짐)와 PR-3의 자동 쓰기입니다.
- 행(§3):
  `| 가상 노드에 길이가 다른 배열을 쓰는 쓰기(INVALID_VIRTUAL_NODE_VALUES)의 분류(공개 API는 호출자 오류, 자동 쓰기는 정착 오류)와 코드 무리(JSON_SCHEMA_ERROR) | adr/0014-error-policy.md:257(§7.2), src/core/nodes/VirtualNode/VirtualNode.ts:42-55, reviews/round-18-agenda.md:17(§1) | PR-2, PR-3 | 설계 결정 |`

## 검토자의 "빠진 것 없음" 목록에서 분명히 잘못 읽은 것

- 예산 다섯을 잘못 적었습니다. 실제 다섯은 호스트 바퀴, 파생 라운드 25, 전이 라운드, 리스너 되먹임 파동 25, `onChange` 중첩 25입니다(08 §7 :244-248, ADR 0007 §1 :41-47, ADR 0008:193).
  - "게이트 평가 상한"은 호스트 바퀴 그 자체입니다.
  - "채움 상한"은 따로 없습니다. 채움은 전이 라운드 안에서 셉니다.
  - "전체 정착 시간" 예산은 없습니다.
  - 통지 예산 둘이 빠졌습니다.
- 원본 B의 기록 항목에 대한 풀이는 08:572와 실질적으로 같아 잘못 읽은 것이 아닙니다.
- 받은 예시는 이 둘뿐이므로 목록의 나머지는 대조하지 못했습니다.

## Fix spec (worker가 판단 없이 적용할 것)

1. `reviews/round-18-agenda.md`에 위 행을 넣습니다: N2·N3은 §1, N5는 §3, N4는 §4, B1·N1은 §6.
2. 같은 파일 §9(:90)의 "PR-3 전" 항목에서 "emit의 키 순서(Q14, `open-questions.md:86`)"를 지웁니다. :95에서는 "Q5 `virtual` 구조(`open-questions.md:31`)"를 지웁니다.
3. `open-questions.md:31`의 제목을 "## Q5. `virtual` (닫힘 — 소유자 답 4, `07-conclusions.md:253`, ADR 0013:96)"으로 바꿉니다.
4. N2의 행이 결정되면 `09-landing-and-test-strategy.md:158`의 "그대로 산다" 칸에서 `intersectPattern`과 `intersectConst`의 단언을 뺍니다.
5. 확인 방법: `grep -n 'Q14\|Q5' reviews/round-18-agenda.md`의 결과가 새 행에만 나오면 됩니다.

## Unverified

- 원자료(`raw-*`)의 모든 줄을 읽지는 않았습니다. N3과 N1의 청사진 시점 대상 규칙이 원자료 어딘가에 이미 있을 가능성은 남습니다.
- 검토자 보고서의 원문은 받지 못해 브리프에 요약된 내용만 대조했습니다.
- 프로토타입 회귀 63+108+26+52 가운데 파생 사례와 실제 `if` 사례가 각각 몇 건인지는 세지 않았습니다.

## 5. 처리

| 지적 | 판정 | 처리 |
| --- | --- | --- |
| codex 1(M1) 잎 교차 함수의 뜻 | 확인(실행). `intersectConst`의 참조 비교, `intersectPattern`의 같은 자리 전방 탐색, 역참조와 같은 이름의 캡처 그룹. 기존 시험이 결함을 단언한다 | 안건 §1 행(antigravity 쪽 검증자의 N2와 합침) |
| codex 2(M2) `oneOf`·`anyOf`의 동순위 | 확인 | 안건 §1 행 |
| codex 3(M3) 터미널 전략 비교 | 확인(모의 실행). 결함은 축약 문장이 아니라 '경우'의 정의이며 네 문서에 같다. 17라운드 편집자 결정의 결함이다 | 안건 §1 행 |
| codex 4(M4) 입력의 객체 전체 쓰기 | 확인. 안건 §3 첫 행은 출처로만 걸었다 | 안건 §3 행 |
| codex 5(M5) `batch` 안의 읽기 | 확인. 주로 PR-4를 막는다 | 안건 §3 행 |
| codex 범위 N6(S1) 다른 종류 값의 공개 형 | 확인. 공개 형이 바뀌므로 소유자 확인 | 안건 §6 행 |
| codex 범위 §9(S2) `controls.children` | 확인. 코드 근거 한 줄 정정, 나감 비움 층의 PR 겹침과 예산 식의 셈을 더 찾음 | 안건 §1 행(대상 해석), §4 행(층의 배치) |
| codex 범위 §4(S3) PR-2 독립 검증 경계 | 확인 | 안건 §4 행(antigravity 쪽 검증자의 N4, antigravity 4와 합침) |
| codex 쪽 검증자가 더 찾은 것: 게이트 없는 분기의 표현 키와 터미널 판정 | 개연 | 안건 §1 행 |
| antigravity 1(A1) 청사진 출력 계약 | PR 안의 세부(내용은 이미 정해짐) | 받지 않음. 같은 이름·다른 종류가 `structure`에 드는 물음만 안건 §6 N2에 더함 |
| antigravity 2(A2) 청사진 코드와 수집기 | 이미 정해짐(형의 시그니처만 PR 안) | 받지 않음 |
| antigravity 3(A3) 잎 교차 함수의 자리와 공집합 표시 | PR 안의 세부 | 받지 않음(뜻의 결함은 안건 §1 행) |
| antigravity 4(A4) 디스패처 없는 사슬 끝 throw | PR 안의 세부(임시 경로는 이미 정해짐) | 안건 §4 행에 합침 |
| antigravity 5(A5) 트리 생성 진입점 | PR 안의 세부(자리와 주입은 이미 정해짐) | 받지 않음 |
| antigravity 범위 §9(B1) `emit`의 키 순서(Q14) | 확인. ADR 0007 §2가 이미 순서를 적어 문서끼리 어긋난다 | 안건 §6 행, §9에서 뺌 |
| antigravity 범위 §9(B2) Q5 `virtual` 구조 | 반박. 10라운드 소유자 답 E-4("그냥 둡시다")로 닫혀 있다 | 안건 §9에서 뺌, `open-questions.md` Q5에 닫힘 표시 |
| antigravity 쪽 검증자 N3 런타임 공집합 교차의 공개 스키마 | 개연 | 안건 §1 행 |
| antigravity 쪽 검증자 N5 `INVALID_VIRTUAL_NODE_VALUES`의 분류 | 확인(어느 목록에도 없던 항목) | 안건 §3 행 |
| antigravity의 '빠진 것 없음' 목록 | 예산 다섯을 잘못 읽음(실제는 호스트 바퀴, 파생 라운드 25, 전이 라운드, 되먹임 파동 25, `onChange` 중첩 25) | 기록만 |
