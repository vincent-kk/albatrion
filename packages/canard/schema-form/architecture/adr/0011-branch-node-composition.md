# ADR 0011 — branch 노드(object·array)의 구성 전략

## 상태

| 항목 | 닫은 사람 | 라운드 |
| --- | --- | --- |
| ERROR-185 | 원리(`00-goals.md:105` C2 작성자 실수의 가시성, 소유자 채택 `reviews/round-2.md:112`), 편집자 결정(ADR 0011 4차 본문, `adr/0011-branch-node-composition.md:12`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-73·18C-38) | 18 |
| NODE-001 | 소유자 답(`reviews/round-17-owner-answers.md:24` 노드 구조) | 17 |
| NODE-002 | 소유자 답(`reviews/round-17-owner-answers.md:24` 노드 구조), 소유자 답(`reviews/round-17-owner-answers.md:21` 종류별 동작 표의 이름), 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈; 표의 두 단계), 소유자 답(`reviews/round-17-owner-answers.md:23` `kind` 필드), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-02) | 18 |
| NODE-003 | 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름) | 17 |
| NODE-007 | 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3), 소유자 답(`reviews/round-17-owner-answers.md:43` 9 입력 마침 칸), 소유자 답(`reviews/round-17-owner-answers.md:54` 9번 확인), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-19; `trim`은 자동 쓰기) | 18 |
| NODE-008 | 소유자 답(`reviews/round-17-owner-answers.md:26` `tree`의 이름; 책임별로 나눔), 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈), 소유자 답(`reviews/round-17-owner-answers.md:45` 12·15 생성 함수와 그 형), 17라운드 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:38`·`reviews/raw-round17-node-structure.md:154`; 소유자 이견 없이 권고대로 확정된 칸 `record`·`navigation`·`SchemaNode/`), 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md:171`; 공장은 트리마다 하나) | 17 |
| NODE-009 | 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈; 전략이 아니라 종류마다 모듈 하나), 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md` §5; 소유자 지시 `reviews/round-17-owner-answers.md:25`) | 17 |
| NODE-020 | 원리(`06-conclusions.md:175` P2·G4; `find`), 편집자 결정(10라운드 추정 채택 규칙, `07-conclusions.md:209`; `findNodes`) | 10 |
| NODE-021 | 편집자 결정(ADR 0011 4차 본문, `adr/0011-branch-node-composition.md:12`), 편집자 결정(4라운드 3.1판, `adr/0011-branch-node-composition.md:5`; 노드 종류의 목록) | 5 |
| NODE-022 | 소유자 답(`reviews/round-10-owner-answers.md:9` A-3) | 10 |
| NODE-025 | 편집자 결정(ADR 0011 4차 본문, `adr/0011-branch-node-composition.md:12`) | 5 |
| NODE-026 | 편집자 결정(ADR 0011 4차 본문, `adr/0011-branch-node-composition.md:12`) | 5 |
| NODE-027 | 소유자 답(`00-goals.md:116` C3 세부 2), 소유자 답(`reviews/round-2.md:114` C3), 소유자 답(`reviews/round-17-owner-answers.md:12` 통보 1) | 17 |
| NODE-028 | 소유자 답(`reviews/round-17-owner-answers.md:12` 통보 1), 17라운드 스웜 수렴(편집자 결정, `adr/0011-branch-node-composition.md:59`; 판정 함수의 세 값과 core가 `presentation`을 읽지 않음) | 17 |
| NODE-030 | 소유자 답(`reviews/round-17-owner-answers.md:12` 통보 1), 편집자 결정(ADR 0011 4차 본문 §3, `00-goals.md:116`의 제안) | 17 |
| NODE-031 | 원리(`00-goals.md:105` C2 작성자 실수의 가시성, 소유자 채택 `reviews/round-2.md:112`), 편집자 결정(ADR 0011 4차 본문, `adr/0011-branch-node-composition.md:12`) | 5 |
| NODE-034 | 소유자 답(`reviews/round-10-owner-answers.md:31` E-4; 현행 유지), 편집자 결정(17라운드 노드 구조 수렴, `adr/0011-branch-node-composition.md:9`; 값 행) | 17 |
| NODE-035 | 소유자 답(`reviews/round-12-owner-answers.md:16` 8 `virtual`), 원리(`reviews/round-5-derivations.md` §3; P1′) | 12 |
| NODE-036 | 편집자 결정(ADR 0011 4차 본문, `adr/0011-branch-node-composition.md:12`) | 10 |
| REACT-002 | 소유자 답(`reviews/round-17-owner-answers.md:12` 통보 1; 판정을 렌더 계층으로), 편집자 결정(17라운드 게이트 B의 사실 정정, `01-current-structure.md:85`) | 17 |
| REACT-003 | 소유자 답(`reviews/round-17-owner-answers.md:12` 통보 1), 17라운드 스웜 수렴(편집자 결정, `08-design-a-to-z.md:327`) | 17 |
| VALIDATE-034 | 소유자 답(`reviews/round-12-owner-answers.md:16` 8 `virtual`), 소유자 답(`reviews/round-10-owner-answers.md:31` E-4) | 12 |
| WRITE-071 | 편집자 결정(4라운드, F24 `reviews/round-4-spec.md:157`) | 4 |

## 결정

### 02-node-and-value.md §1.1 노드의 종류

3.1판이 상태를 `raw`·`selection`·`extras` 셋으로 줄인 뒤(VALUE-002), 종류를 가르는 기준은 "자식 집합이 어디서 오는가"와 "값을 드는가" 둘이다(NODE-021).

| 종류 | 자식 집합의 출처 | 값 | identity | 방출·가드·검증에서의 자리 |
| ---- | ---------------- | -- | -------- | ------------------------- |
| 리프 | 없다 | `raw` | 이름 또는 인덱스 | 자기 값으로 나타난다 |
| 터미널 object·array | 없다 — 자식을 만들지 않는다 | `raw` 하나로 값을 통째로 든다 | 이름 | 값 통째로 나타난다. 안의 `if`/`oneOf`는 형상을 만들지 않고 검증기가 그대로 판정한다 |
| branch object | **스키마** — 청사진이 정적으로 열거한 선언(BLUEPRINT-004) | 없다. 비객체 값(`null`, `17`)이 왔을 때만 `raw`를 든다(VALUE-002) | property 이름 (+ 타입이 다른 배타 조각의 경우 조각) | `local`을 합성하고 투영해 `emit`을 만든다 |
| branch array | **값** — 아이템 수 × 아이템 청사진 | 위와 같다 | 인덱스와 독립적인 단조 키(현재의 `#n`, 제약 T-22(배열 아이템의 React key는 생성 순서의 nonce)) | 위와 같다 |

노드 종류 표는 VALUE-002를 따라 읽어야 한다: 상태 칸은 `raw`·`extras` 둘뿐이고 `selection`은 없다(NODE-021, VALUE-002).

노드 트리가 곧 상태(VALUE-001)와 작업 루프(SETTLE-001)가 들어오면 값의 합성, 상향·하향 전파, 역류 방지 잠금은 branch 노드의 일이 아니게 된다(NODE-025). 남는 것은 다음이다(NODE-025).

1. **자식 집합의 출처** — 어떤 자식이 있을 수 있는가(NODE-025)
2. **자식의 활성** — 그 가운데 지금 존재하는 것은 무엇인가(조각의 활성 집합, FRAGMENT-001)(NODE-025)
3. **자식의 identity** — 렌더 계층이 같은 자식을 같은 것으로 알아보는 수단(NODE-025)

활성, 유효 스키마, 방출 값의 메모는 같은 모델을 따른다(NODE-026). 타입별 특수 경로를 일반 경로에 박지 않는다(NODE-026). 재계산은 **자식 dirty 목록에 비례한다.**(NODE-026) "dirty 목록"은 재계산 목록이다(NODE-026). 3라운드에서 배열 아이템 호스트로 확인했다 — 아이템 10,000개짜리 배열의 9,999번 입력이 일으키는 계산은 4회다(`reviews/round-3.md` T13)(NODE-026). 배열 아이템은 자기 자신이 호스트이므로 object 호스트와 같은 규칙으로 돈다(NODE-026). 조각 토글 때 다시 계산하는 키는 그 조각의 것뿐이고, 키 집합이 바뀌면 그 호스트의 `local`을 선언 순서로 O(키 수) 새로 짓는다(NODE-026, SETTLE-042). 호스트의 자식 1,000개를 매번 순회해 `prev[name]`을 읽으면 메가모픽 접근으로 키 입력당 약 85 µs가 든다(`reviews/round-4.md` §2.1)(NODE-026).

판별 프로퍼티의 소유·union 호스트의 특수 처리는 없다 — 폼은 분기를 고르지 않는다(NODE-022).

【추론】 `ContextNode`는 두지 않는다(NODE-048). 【추론】 노드 종류 표(NODE-021)에 행을 더하지 않는다(NODE-048). 【추론】 맥락은 노드가 아니라 루트가 드는 폼 입력(CONTROLS-080)이다(NODE-048). 【추론】 따라서 맥락에 `isObjectNode`가 참이 되는 일이 사라진다(NODE-048). 【추론】 `find('@')`·`findAll('@')`의 특수 처리도 사라진다(NODE-048). 【추론】 `@`는 식 토큰일 뿐 노드 경로가 아니다(NODE-048).

### 02-node-and-value.md §1.2 상속 없는 단일 클래스와 레코드

Vincent의 요건: 상속 구조를 그대로 두는 것, 공유 로직을 타입별로 흩어 두는 것, 불필요한 중복은 불허(NODE-001). 17라운드에 Vincent가 구조를 확정했다: 상속 없이 클래스 하나와 종류별 동작 행을 두며, 행이 곧 오늘 하위 클래스의 정의다(NODE-002)(NODE-001). `BranchStrategy`/`TerminalStrategy`는 `src/core/behaviors/`의 종류 모듈 안 `branch/`·`terminal/`로 대체된다(`objectBehavior/`·`arrayBehavior/`, 두 전략이 함께 쓰는 보조는 그 종류의 `utils/`, NODE-009)(NODE-001). ObjectNode/ArrayNode 클래스는 남기지 않는다(NODE-001).

**클래스를 없애지는 않는다.**(NODE-013) `setValue`·`find`·`subscribe`·`push`·`remove`는 공개 계약이다(NODE-013). 노드마다 클로저를 달면 노드 수만큼 메모리가 들고, 프로토타입 메서드를 가진 단일 클래스가 가장 싸며 모든 노드가 같은 숨은 클래스가 된다(NODE-013).

**클래스 하나, 행 하나.**(NODE-002) 하위 클래스 없이 단일 클래스 `SchemaNode` 하나를 둔다(NODE-002). 종류별 동작은 표 `BEHAVIORS[type][strategy]`의 두 단계에 둔다(잎은 `terminal` 하나, 객체·배열은 `branch`·`terminal` 둘, 가상은 하나)(NODE-002). 노드는 생성 때 고른 행 하나를 필드 `behavior`로 들고(`kind` 필드는 없다), 공개 `type`·`strategy`는 행에서 읽는 게터다(NODE-002). 【추론】 접은 집합의 원소가 둘 이상이면 새 종류 `union`의 노드이고 행은 `terminal` 하나다(`BEHAVIORS.union.terminal`)(NODE-002, BLUEPRINT-043, BLUEPRINT-035).

공개 `node.group`은 `node.strategy`로 바뀐다(값 `'branch'` 또는 `'terminal'`은 그대로, 17라운드 소유자 답)(NODE-003). 청사진이 정한 전략은 노드의 공개 `strategy`(`'branch'` 또는 `'terminal'`, 옛 `group`의 새 이름이며 값은 그대로)로 읽힌다(NODE-003).

공통 필드는 고정 배치하고 종류별 데이터는 한 칸 `structure`(객체의 키별 자식 맵, 배열의 아이템 목록과 키 번호, 가상의 참조)에 담는다(NODE-004). 노드 필드 `runtime`은 트리마다 하나인 `SchemaNodeRuntime`(통지 대기열, 검증기, 진단, 진입 깊이와 예산, `nodeFactory`, `onError` 보고기)을 가리킨다(NODE-004). 노드 인스턴스가 곧 레코드다(노드마다 객체 하나)(NODE-004). 정착 알고리즘은 `settle`의 자유 함수가 레코드 위에서 돌린다(NODE-004). 【추론】 branch 객체의 `structure`는 이름에서 그 커밋의 형상에 있는 자식 노드로 가는 맵이다(NODE-004).

### 02-node-and-value.md §1.3 동작 행의 칸과 비용

터미널 객체는 행을 따로 두되 값을 통째로 드는 칸 함수를 잎과 함께 쓰고, 터미널 배열은 원본을 통째로 들되 배열 연산(`push`·`update`·`remove`·`pop`·`clear`)을 오늘처럼 원본 배열 위에서 지원한다(NODE-005).

**행의 칸.**(NODE-006) `interpret`(입력 해석), `assemble`(합성: 활성 자식의 방출 값 → local), `project`(투영: local → 방출 값), `finishInput`(입력 마침), `declareChildren`(자식 선언 목록만 돌려주고, 생성은 `settle`이 런타임의 `nodeFactory`로 한다), `type`, `strategy`(NODE-006). 행 계약의 형은 `Behavior`다(NODE-006). 행은 계산만 한다: 원본 쓰기, 되돌림 기록, 자식 연결과 폐기의 확정, 통지는 `settle`과 `dispatch`가 한다(NODE-006). 모든 행은 칸을 모두 같은 순서로 가지며 없는 동작은 공유 칸으로 채우고, 뜻이 같은 칸은 함수 객체 하나를 여러 행이 함께 쓴다(공유 로직을 타입별로 흩지 않는다는 요건을 행 수준에서도 지킨다)(NODE-006). 옵션에서 나오는 정적 선택(빈 값 생략, 배열 뒤쪽 생략, `trim`, 배열 한계)은 칸이 불릴 때마다 계산하지 않고 유효 스키마 메모가 바뀔 때 한 번 계산해 메모와 함께 둔다(NODE-006).

**`trim`과 입력 마침.**(NODE-007) 문자열 행의 `finishInput` 칸이 `options.trim`을 판단해 자른 값을 돌려주고, 포커스 아웃 때 자른 값을 쓰는 것은 자동 쓰기로, 원본만 쓰고 바깥 오류를 지우거나 dirty를 표시하지 않으며, 그 노드의 입력은 Refresh를 받는다(NODE-007, WRITE-083). 어댑터는 타입을 모르는 입력 마침 신호 `finishInput`만 보낸다(17라운드 소유자 답 R17-3)(NODE-007). `trim`은 포커스 아웃 때 문자열 동작 행의 `finishInput` 칸이 판단한다(NODE-007).

**배열 메서드**는 클래스에 두되 타입은 `ArrayNode` 인터페이스에만 준다(NODE-014). 비배열에서 부르면 행의 공유 칸이 `SchemaFormError`를 던지므로 겉면과 `dispatch`는 종류를 묻지 않는다(NODE-014). UI 플러그인이 `node.push()`를 부른다(NODE-014). 비배열은 `type`이 배열이 아닌 노드를 말한다(NODE-014).

**비용(추정, 벤치로 확인).**(NODE-018) 노드마다 객체 하나이고, 행은 모든 노드가 공유하므로 `union` 잎의 `terminal` 행이 더해져 프로세스 전체에 열이다(NODE-018, BLUEPRINT-043, BLUEPRINT-035). 노드마다의 매니저·클로저·전략 객체·구독은 없다(규칙과 린트로 금한다)(NODE-018). 모든 노드가 한 클래스이고 필드를 같은 순서로 넣으면 한 숨은 클래스를 가져, 여러 종류를 도는 `settle`·`dispatch`의 필드 읽기가 단형 인라인 캐시로 남을 것으로 본다(Vincent가 말한 "상속 클래스에 의한 캐싱 비효율")(NODE-018). 남는 비용도 적는다: 칸 함수의 호출은 간접 호출으로 남고, `type`이 게터가 되어 읽기가 한 단계 늘며, iOS의 JavaScriptCore에서는 같은 결론이 보장되지 않는다(NODE-018). 메모리는 필드 24–30개일 때 노드 하나가 약 110–140바이트(포인터 압축 엔진) 또는 약 210–260바이트(압축 없는 엔진)로 추정한다(NODE-018). 벤치 여섯을 TEST-026의 기준선과 비교한다: B1(섞인 종류 1만 노드의 `value`·`type` 읽기, V8과 JavaScriptCore), B2(노드당 힙 바이트), B3(종류 인스턴스와 행이 같은 맵인지), B4(정착 뜨거운 루프의 거대형 자리 수), B5(입력에서 커밋까지의 지연), B6(노드 1만 개 생성 시간)(NODE-018). B3이 보는 종류 인스턴스와 행은 `union`을 더해 열이다(NODE-018, BLUEPRINT-043). 오늘의 주된 비용이 노드마다의 할당인지 인라인 캐시인지는 재지 않았으므로 크기는 벤치가 정한다(NODE-018).

【추론】 NODE-018(현행)이 B1–B6을 기준선과 비교한다고 적으나 합격선이 없으므로 여기서 둔다(NODE-055). 【추론】 PR-2에서 B1–B6을 V8(node)과 JavaScriptCore(bun, 또는 `benchmark-form/browser-bench`의 Safari)에서 돌린다(NODE-055). 【추론】 B1·B5·B6의 합격선은 TEST-073의 선(`guard:check`) 안이다(NODE-055). 【추론】 B2의 합격선은 NODE-018의 추정(110–140바이트, 포인터 압축 엔진)의 1.5배 이내이고, 같은 엔진에서 잰 오늘 노드 인스턴스와 부속 객체의 합을 나란히 적어 그보다 크지 않은 것이다(NODE-055). 【추론】 B3의 합격선은 같은 맵이 참인 것이다(NODE-055). 【추론】 B4는 보고만 한다(NODE-055). 【추론】 합격선을 넘으면 TEST-027의 절차(이유를 적고 Vincent가 받아들임)로 올린다(NODE-055).

- PR: PR-2(NODE-055).
- 통과: 위 합격선 안이다(NODE-055).
- 실패: TEST-027의 절차(TEST-072의 기록·수용 규칙)로 올린다(NODE-055).

### 02-node-and-value.md §1.4 책임별 fractal과 의존 방향

**책임별 fractal.**(NODE-008) 16라운드에 레코드·종류 표·탐색을 한 fractal에 두던 제안을 책임별로 나눴다(17라운드 소유자 답, `reviews/round-17-owner-answers.md:26`)(NODE-008). `src/core/blueprint/`(PR-1), `src/core/record/`(레코드: `SchemaNodeRecord` 형, 행 계약 `Behavior`, `SchemaNodeFactory` 형, `SchemaNodeRuntime` 형, 이름·경로 갱신과 상호작용 상태 패치), `src/core/behaviors/`(`BEHAVIORS`; 종류 모듈 `stringBehavior/`·`numberBehavior/`·`booleanBehavior/`·`nullBehavior/`·`virtualBehavior/`, `objectBehavior/`와 `arrayBehavior/`는 안에 `branch/`·`terminal/`·`utils/`), `src/core/navigation/`(`find`·`findNodes`와 트리 걷기), `src/core/settle/`(+`settle/derive/`), `src/core/dispatch/`, `src/core/validation/`, `src/core/SchemaNode/`(공개 겉면, 클래스 `SchemaNode`)(NODE-008). 종류 모듈에 `unionBehavior/`가 더해진다(NODE-008, BLUEPRINT-043, BLUEPRINT-035). 모듈 수준 생성 함수는 `schemaNodeFactory`이며, 오늘과 달리 공장은 노드마다가 아니라 트리마다 하나다(NODE-008).

**behaviors 규칙.**(NODE-009) 종류마다 fractal 하나(`INTENT.md`·`DETAIL.md`·진입점·같은 이름의 행 파일)를 둔다(NODE-009). 여덟 줄을 넘는 칸과 그 종류만의 보조는 그 종류의 `utils/`, 두 전략이 함께 쓰는 것은 그 종류의 `utils/`, 두 종류 이상이 쓰는 것은 `behaviors/utils/`에 둔다(NODE-009). behaviors 밖에서도 쓰는 것은 behaviors의 것이 아니다(예: `resolveArrayLimits`는 `blueprint/`로)(NODE-009). 행은 칸을 모두 같은 순서로 갖는다(NODE-009). 종류 모듈은 behaviors 뿌리와 `settle`·`dispatch`·`validation`·공개 겉면을 가져오지 않는다(NODE-009).

**의존 방향.**(NODE-016) 전순서는 `blueprint` < `record` < {`behaviors`의 종류 모듈, `navigation`} < `settle/derive` < `settle` < `validation` < `dispatch` < `SchemaNode`다(NODE-016). 조건은 셋이다: 행 계약 `Behavior`는 `record`에 둔다, 청사진은 행의 키가 아니라 `type`·`strategy`만 낸다, 생성은 `SchemaNodeRuntime`의 `nodeFactory`로 주입한다(NODE-016). `core/index.ts`와 `nodeFromJSONSchema`는 `SchemaNode/`의 진입점만, React 바인딩은 `core/index.ts`만 가져온다(NODE-016).

【추론】 의존 역전으로 끊는다(NODE-045). 【추론】 `record/`가 `SchemaNodeRuntime`의 칸(통지 대기열, 검증기, 진단, 진입 깊이와 예산, `nodeFactory`, `onError` 보고기)의 형을 그 칸을 부르는 쪽이 쓰는 최소 인터페이스로 선언한다(NODE-045). 【추론】 `dispatch`·`validation`과 트리를 만드는 자리가 그 인터페이스를 만족하는 구현을 넣는다(NODE-045). 【추론】 `record/`는 `dispatch`·`validation`·`app/plugin`을 가져오지 않는다(NODE-045). 【추론】 `import type`도 금지다(NODE-045). 【추론】 검증기 칸은 플러그인 형이 아니라 `record/`의 검증 요청 인터페이스이고, 플러그인의 검증기는 트리를 만드는 자리에서 이 칸에 맞춰 넣는다(NODE-045). 【추론】 칸을 하나 더하면 `record/`의 선언을 고친다(NODE-045). 【추론】 그 대가를 레코드 `DETAIL.md`에 적는다(`Behavior`와 같은 방식)(NODE-045). 【추론】 PR-2의 병합 점검에 `import type`까지 센 순환 검사를 둔다(NODE-045). 【추론】 도구는 PR-2가 고른다(NODE-045).

【추론】 S1 parse 함수(소유자 답 S1의 노드마다 타입에 맞는 parse, WRITE-052)는 `src/core/behaviors/utils/parse/`에 둔다(NODE-056). 【추론】 부르는 쪽은 동작 행의 `interpret` 칸이다(WRITE-056, NODE-056). 기본 union 입력도 같은 내부 함수를 쓰지 않는 호출로 부른다(NODE-056, REACT-033). `union` 노드의 해석은 `type`의 선언 순서도 검증기 플러그인의 규칙도 쓰지 않고, 변환 목록(WRITE-075)으로 받아 줄 형이 정확히 하나일 때만 그 형으로 바꾼다(NODE-056, BLUEPRINT-042). 【추론】 `union` 행이 수·문자열·불리언 변환을 변환 목록(WRITE-075)으로 부르므로 이 변환들은 두 종류 이상이 쓴다(NODE-056, BLUEPRINT-042). 【추론】 그래서 NODE-009대로 `behaviors/utils/` 아래, 주제 디렉토리 `parse/`에 둔다(NODE-056). 【추론】 NODE-009와 어긋나지 않는다(NODE-056). 【추론】 PR-2는 이 자리에 S1 변환(WRITE-075의 변환 목록, WRITE-052)만 하는 parse를 새로 둔다(NODE-056). 【추론】 오늘의 `src/core/parsers/`는 그것을 가져오는 옛 노드와 함께 `src/__legacy__/core/parsers/`로 옮긴다(LANDING-159)(NODE-056). 【추론】 레거시는 새 parse를 가져오지 않는다(NODE-056).

### 02-node-and-value.md §1.6 터미널 전략의 판정

가상 노드는 인라인 입력을 두어도 전략이 `branch`이고 참조 노드의 `ChildNodeComponents`를 받으며, 암묵 터미널은 두 행을 가진 종류(object·array)에만 있다(NODE-027, NODE-047). 소유자: "브랜치 노드의 터미널 전략이 압도적으로 저렴해서, 사용자가 되도록 터미널 전략을 쓰게 하려고 설계한 방법. 1종 오류를 감수하고 2종 오류를 배제한 선택."(NODE-027) 터미널 전략의 object·array는 자식 없이 값을 직접 들고(VALUE-004), 노출 표면은 branch 전략과 같다(NODE-027). 소유자는 이 방식이 난해하면 끊어도 된다고 했다(그러면 터미널로 쓰려는 사용자가 `terminal: true`를 명시한다)(NODE-027). 끊지 않는다(확정 근거: 소유자 답, `reviews/round-17-owner-answers.md:12` 통보 1)(NODE-027).

**암묵 규칙 유지, 판정은 렌더 계층으로.**(NODE-028) 인라인 `presentation.FormTypeInput`이 **있고 `null`이 아닌지**를 보는 판정은 렌더 계층(React 바인딩)의 판정 함수가 하며, 렌더 계층이 이 함수를 청사진에 넘긴다(NODE-028). 판정 함수는 선언 하나를 받아 셋 가운데 하나를 돌려준다(NODE-028). 참(인라인 `presentation.FormTypeInput`이 있고 `null`이 아님), 거짓(그 키의 값이 `null`), 없음(그 키가 없거나 값이 `undefined`)이다(NODE-028). 없음은 앞 선언의 판정을 지우지 않으며(병합표의 `undefined`와 같다), 키 이름은 판정 함수만 안다(NODE-028). 청사진은 한 노드의 터미널 전략을 `options.terminal`(명시, 양방향) → 넘겨받은 판정 → `type`의 순서로 정한다(NODE-028). 이 순서는 두 행을 가진 종류(object·array)에만 적용되고, 행이 하나인 종류는 전략을 그 행에서 정한다(NODE-028, NODE-047). core는 `presentation` 안의 키를 읽지도 해석하지도 않으므로(원리 P5(core는 렌더러를 모른다), GOAL-031) core만 쓰는 호스트에는 암묵 규칙이 없다(NODE-028). 판정을 렌더 계층으로 옮기므로 core가 React 구성 요소를 판정하는 자리(`getNodeGroup.ts`의 `isReactComponent`)는 사라진다(NODE-028). 터미널 조건을 "있고 null이 아니다"로 넓히면 `React.lazy`의 결과나 설정 객체도 서브트리를 접는다(NODE-028). `formTypeInputMap`은 트리 생성 뒤 렌더 계층에서 해석되므로 같은 컴포넌트가 인라인이면 터미널을 만들고 경로 매핑이면 만들지 않는다(NODE-028).

양방향 재정의는 객체·배열에서만 뜻이 있고, 잎의 `false`·가상의 `true`는 청사진 오류다(NODE-030, NODE-047). `terminal: false` — 꽂은 입력이 `ChildNodeComponents`를 쓴다(NODE-030). `terminal: true` — 컴포넌트 없이도 터미널로 쓴다(NODE-030). 오늘도 `terminal: true`와 `terminal: false`가 양방향으로 있다(`getNodeGroup.ts:20-21`)(NODE-030).

**혼란스러운 경우를 드러낸다.**(NODE-031) 터미널이 된 노드의 입력이 비어 있는 `ChildNodeComponents`를 읽으면 개발 모드에서 경고한다(목표 C2(작성자 실수의 가시성), GOAL-015)(NODE-031, ERROR-185).

【추론】 (1) 청사진이 정적으로 정한다: 한 노드의 전략은 청사진이 그 노드의 선언에서 정적으로 정한다(NODE-042). 【추론】 (2) 셈에 드는 선언: 게이트 없는 선언(본체, 게이트 없는 `allOf` 항목)과 게이트 가진 선언이다(NODE-042). 【추론】 게이트 없는 `oneOf`·`anyOf` 분기의 선언은 그 노드의 유일한 선언일 때만 든다(NODE-042). 【추론】 (3) 경우의 정의: 경우는 조각 중첩을 지키는 켜짐 조합이다(NODE-042). 【추론】 게이트 없는 선언은 늘 켜지고, 중첩 조각 안의 선언은 그것을 감싸는 게이트 가진 조각이 모두 켜져야 켜진다(NODE-042). 【추론】 각 경우에 켜진 선언들로 `options.terminal`(전순서에서 나중 것) → 렌더 계층 판정(없음이 아닌 결과 가운데 나중 것) → `type`의 순서로 전략을 정하고, 경우마다 다르면 청사진 오류(`TERMINAL_STRATEGY_MISMATCH`)다(NODE-042). 【추론】 (4) 축약 비교: 경우를 모두 열거하지 않는다(NODE-042). 【추론】 게이트 없는 선언이 있으면 그것만 켜진 경우 하나를 두고, 게이트 가진 선언 d마다 '게이트 없는 선언 ∪ d를 감싸는 게이트 가진 조각들이 이 노드에 둔 선언 ∪ d'가 켜진 경우를 둔다(NODE-042). 【추론】 이것들을 비교하면 가능한 모든 경우를 비교한 것과 같다(NODE-042). 【추론】 검사 비용은 노드마다 선언 수와 중첩 깊이의 곱을 넘지 않는다(NODE-042).

【추론】 `BEHAVIORS[type]`의 행이 하나인 종류는 전략을 그 행에서 정하고 렌더 계층 판정을 묻지 않는다(NODE-047). 【추론】 잎(string·number·boolean·null과 BLUEPRINT-043의 `union`)은 `terminal`, 가상은 `branch`다(NODE-047, BLUEPRINT-035). 【추론】 그래서 가상에 둔 인라인 `presentation.FormTypeInput`은 그 입력으로 그려지되 전략은 `branch`이고, 입력은 참조 노드의 `ChildNodeComponents`를 받는다(쓰지 않아도 된다)(NODE-047). 【추론】 가상은 `branch`이므로 ERROR-185의 경고(터미널 노드의 입력이 빈 `ChildNodeComponents`를 읽을 때의 개발 모드 경고)는 가상 노드에 적용되지 않는다(NODE-047). 【추론】 행이 하나인 종류에 그 행과 다른 `options.terminal`을 적으면 청사진 오류다(잎의 `false`, 가상의 `true`)(NODE-047). 【추론】 같은 값(잎의 `true`, 가상의 `false`)은 오류가 아니다(NODE-047). 【추론】 `options.terminal`의 양방향(NODE-030)과 NODE-028의 판정 순서는 두 행을 가진 종류(object·array)에만 뜻이 있다(NODE-047).

### 02-node-and-value.md §1.7 가상 노드

(NODE-034, NODE-047)

| 항목 | 규칙 |
| ---- | ---- |
| 자식의 출처 | 형제 참조. 스키마도 값도 아니다 |
| 값 | `raw`·`emit`이 없고, 행의 `assemble` 칸이 참조 노드 값의 튜플을 `local`에 둔다(`value` 게터는 `local`, 오늘의 `VirtualNode.ts:112-139`). 전략은 `branch`다(`src/helpers/jsonSchema/filter.ts:20-21`, 17라운드 노드 구조 수렴). 가상은 늘 `branch`이고 `options.terminal: true`는 청사진 오류다 |
| 쓰기 | 참조 노드로 부채질한다(`VirtualNode.ts:39-96`). 유지 |
| 방출·가드·검증 | 나타나지 않는다. 표준 `required`는 실제 필드만 적는다 |
| 명령 | `RequestRefresh`는 유지(EVENT-039) |
| identity | 이름 |

사라지는 것은 전처리 하나다 — `required`·`then.required`·`else.required`의 가상 이름을 구성 필드로 펼치던 `processVirtualSchema.ts:13-29`와 `transformCondition.ts:31-49`(NODE-035). VALIDATE-001(검증기 입력 불변)과의 충돌은 이 한 곳이었고, 여기서 소멸한다(NODE-035). 이중 소유(`getChildren.ts:56-75`)는 렌더가 구성 필드에 플래그를 달아 이미 중복을 없애고 있으므로(`getChildNodeMap.ts:63-64`) 노드 종류를 세우는 것으로 표에 자리가 생긴다 — 1라운드 R16이 지적한 "표에 들어가지 않는다"가 해소된다(NODE-035).

`open-questions.md` Q5가 모은 사실이다(NODE-036). 새 구조에서도 같은 현상을 내야 하는 테스트다(NODE-036).

| 대상 | 수 | 비고 |
| ---- | -- | ---- |
| `src/__tests__/scenarios/virtual.render.test.tsx` | 12 | 렌더 계층의 묶음 동작 |
| `src/core/__tests__/VirtualNode.test.ts`의 refresh 동작 | 4 | `RequestRefresh` 부채질 |
| virtual 전용 테스트 전체 | 4파일 47 | 교차검증 claude의 집계 |
| `processVirtualSchema.test.ts`의 `required` 펼치기 | 11 | **(a)에서 사라진다** — 전처리가 없어지므로 |

검증기 처리는 12라운드에 닫힘: `options.virtual`은 검증기 앞 제거 목록에 들고 `required` 재작성은 버린다(NODE-036, VALIDATE-034).

### 02-node-and-value.md §1.8 탐색과 형상을 떠난 노드

【추론】 형상에 없는 노드는 트리에 인스턴스가 없다(NODE-043). 【추론】 그 원본은 루트가 잠복 원본으로 (절대 경로, 종류)를 키로 든다(NODE-043). 【추론】 형상을 떠난 노드의 옛 참조는 NODE-044가 정한다(NODE-043). 【추론】 branch 객체의 `structure`는 이름에서 그 커밋의 형상에 있는 자식 노드로 가는 맵이다(NODE-043). 【추론】 자식 선언의 신원 (이름, 종류)은 청사진이 선언을 무리 지을 때와 `settle`이 어느 종류의 노드를 살릴지 정할 때 쓴다(NODE-043). 【추론】 한 커밋에서 한 이름에 형상에 있는 노드는 많아야 하나이므로(같은 이름·다른 종류가 동시에 켜지면 충돌이고, 전순서에서 앞선 종류만 산다) 맵의 키는 이름으로 충분하다(NODE-043).

【추론】 `find`·`findNodes`·트리 걷기는 형상에 있는 노드만 돌려준다(NODE-043). 【추론】 형상에 없는 노드를 지나는 경로는 `find`가 `null`, `findNodes`는 항목 없음이다(NODE-043). 【추론】 터미널 아래 경로와 같은 규칙이다(NODE-043). 【추론】 비활성 자식까지 담는 `subnodes`는 레코드에도 공개 겉면에도 두지 않는다(NODE-043). 【추론】 `detectsCandidate`와 그 시험, 첫 후보로 물러나는 규칙, 내부 칸 `variant`·`scope`·`oneOfIndex`·`anyOfIndices`는 모두 폐기한다(NODE-043).

【추론】 `find`는 경로의 마디마다 현재 노드의 자식 집합을 이름으로 따라간다(NODE-054). 【추론】 노드 종류마다 특수 경로를 두지 않는다(NODE-054). 【추론】 참조 그룹(가상 노드)의 자식 집합은 참조된 형제 노드다(NODE-054). 【추론】 그래서 `find('/period/startDate')`는 `/startDate` 노드 그 자체를 돌려준다(NODE-054). 【추론】 돌려준 노드의 `path`는 `/startDate`다(NODE-054). 【추론】 그 노드에 한 쓰기는 가상 노드가 나눠 쓰는 것과 같은 곳에 닿는다(NODE-054). 【추론】 한 노드에 두 경로로 닿는 것은 참조 그룹을 거칠 때뿐이다(NODE-054). 【추론】 정본 경로는 `node.path`다(문서화)(NODE-054).

【추론】 터미널 노드는 자식 집합이 없으므로, 같은 규칙으로 노드 없음이다(NODE-020과 일치)(NODE-054). 【추론】 가상 노드는 늘 `branch`이므로(NODE-047) 인라인 `FormTypeInput`을 둔 가상 노드 아래 경로도 참조된 노드를 돌려준다(NODE-054). 【추론】 `options.terminal: true`를 둔 가상 노드는 청사진 오류이므로(NODE-047) 터미널 가상 노드는 없다(NODE-054). 【추론】 인라인 입력 없는 가상 노드 아래의 `find`는 오늘과 같아 이주 행이 없다(NODE-054).

터미널 노드 아래의 경로는 `find`와 `findNodes` 모두 노드 없음으로 답한다(NODE-020). 노드가 없으므로 `null`을 돌려준다(NODE-020). 반환 타입 `SchemaNode | null`은 그대로다(NODE-020). **행동 변화이므로 이주 안내 대상이다**(NODE-020).

【추론】 형상을 떠난 노드는 떼어진다(detached)(NODE-044). 【추론】 트리는 그 노드를 버리고, 루트는 그 원본을 잠복 원본으로 (절대 경로, 종류)를 키로 든다(NODE-044). 【추론】 소비자가 든 옛 참조는 읽을 수 있다(NODE-044). 【추론】 떼어진 노드의 읽기 멤버는 모두 그 노드가 형상에 있던 마지막 커밋의 값을 돌려주고, 그 뒤로 바뀌지 않는다(NODE-044). 【추론】 옛 참조로 한 쓰기도 이 읽기를 바꾸지 않는다(쓴 값은 루트의 잠복 원본에 있다)(NODE-044).

【추론】 구조 읽기(`children`, 상대 경로의 `find`·`findNodes`)는 그 노드와 함께 떼어진 하위 트리를 본다(NODE-044). 【추론】 예외로 `rootNode`는 살아 있는 루트이고, 트리 전체를 읽는 `globalState`·`globalErrors`도 살아 있는 런타임을 읽는다(NODE-044, SURFACE-053). 【추론】 그래서 절대 경로는 살아 있는 트리에서 풀린다(NODE-044).

【추론】 있던 구독은 유효하다(구독 해제가 된다)(NODE-044). 【추론】 다시 발화하지는 않는다(NODE-044). 【추론】 명령(`focus`·`select`·`refresh`·`remount`)과 상태 진입(`setSubtreeState`·`clearSubtreeState`)은 아무것도 하지 않는다(NODE-044).

【추론】 옛 참조로 한 쓰기는 오류가 아니다(NODE-044). 【추론】 그 쓰기는 루트의 그 (경로, 종류) 잠복 원본을 고치고, 규칙을 평가하지 않으며, 아무것도 내지 않는다(NODE-044). 【추론】 그래서 순차 쓰기와 묶음 쓰기가 같은 원본에 닿는다(NODE-044). 【추론】 노드가 다시 형상에 들면 새 인스턴스를 만든다("재탄생은 새 삶", WRITE-007)(NODE-044). 【추론】 옛 참조는 떼어진 채로 남는다(NODE-044). 【추론】 `SCHEMA_FORM_ERROR.DISPOSED_NODE_WRITE`(가칭)는 재생성 `reset`이 버린 트리의 노드에 대한 쓰기에만 남긴다(NODE-044).

### 02-node-and-value.md §3.2 쓰기 표, 쓰기 종류와 쓰기 옵션

(WRITE-007, WRITE-090)

| 사건 | 종류 | 자식 원본 |
| ---- | ---- | -------- |
| 리프 입력(포커스 아웃 때 `options.trim`이 자른 값의 쓰기 포함), `setValue(V, SetValueOption.Merge)` | 부분 쓰기 | 지정한 것만 바뀐다 |
| `setValue(V)`(기본 `Overwrite`), `defaultValue`, `reset()` | `setValue(V)`는 로드가 아니라 전체 교체 쓰기이고 이미 형상에 있던 노드를 다시 채우지 않으며, 로드는 마운트(`defaultValue`)·`FormHandle.reset()`·`resetSubtree()`뿐이다 | V에 없는 자식의 원본은 **없음**이 된다 |
| `controls.injectTo` | 전체 교체(대상에), 작성자 선언 | 대상에 대해 위와 같다 |
| `controls.derived` | 자기 값 덮기, 작성자 선언 | 의존 값이 바뀔 때(에지). 사용자가 쓴 값은 다음 의존 변화 또는 그 노드가 다시 생길 때까지 남는다 |
| `controls.unsetValue` | 자기 값을 없음으로, 작성자 선언 | 식이 거짓에서 참이 되는 순간. 로드에서는 로드된 값으로 평가해 참이면 지운다 |
| 나감의 비움(선택, 기본 꺼짐) | 나간 노드의 값을 없음으로, 작성자·호출자 선언(정책 키) | 노드가 나갈 때 한 번(하위 트리 포함, 공유 노드 제외). 로드에는 없다. 전이 단계, 최종 형상 기준. 정책 키(`unsetOnInactive`)는 노드 > `controls.children`의 `controls` > 조각의 `controls` > Form 속성, 같은 층은 하나라도 유지면 유지. 나가는 객체·분기에 켠 정책은 함께 나가는 하위 트리로 내려가고 자손이 스스로 적은 선언이 가까운 순서로 이긴다(17라운드 소유자 답 R17-2 ㄴ, WRITE-033) |
| 배열 `push`/`remove`/`update` | 구조 연산 | 그 아이템만. `push`로 생긴 아이템은 생긴 노드이므로 채움을 받는다 |
| 채움 | 노드 생성 사건, 작성자 선언 | 노드가 **생길 때** **없음**이면 `controls.default` > `default` > 없음. 이미 있던 노드는 다시 채우지 않고 지운 값도 다시 채우지 않는다 |

소유자(12-2 답; WRITE-007): "자동 쓰기 아닙니까? 그리고 trim 전후 값이 같으면 쓰지 않아도 됩니다. 효율적이게."(WRITE-007, WRITE-078)

(WRITE-007)

| 사건 | 종류 | 누가 | 자식 원본에 미치는 것 |
| ---- | ---- | ---- | -------------------- |
| `controls.injectTo` | 전체 교체(대상에) | 작성자 | 원천의 방출 값이 직전 커밋과 다를 때(에지). 로드에서는 직전 값이 없으므로 발화한다(`fire`, 소유자 동의) |
| `controls.derived` | 자기 값 덮기 | 작성자 | 의존 값이 바뀔 때(에지). 로드에서는 직전 값이 없으므로 발화한다(로드는 새 수명, `controls.injectTo`와 같은 읽기). 식이 `undefined`면 쓰지 않는다. 사용자가 쓴 값은 다음 의존 변화 또는 그 노드가 다시 생길 때까지 남는다(재탄생은 새 삶) |
| `controls.unsetValue` | 자기 값 없음으로 | 작성자 | 식이 거짓→참이 되는 순간. 로드에서는 로드된 값으로 평가해 참이면 지운다(소유자). 입력은 남는다 |
| 채움 | 없음인 키에 한 번 | 노드 생성 사건 | 노드가 **생길 때**(직전 커밋의 형상에 없고 이번 최종 형상에 있을 때) 없음이면 `controls.default` > `default` > 없음. 이미 있던 노드는 새 조각이 켜져도 다시 채우지 않는다. 지운 값은 다시 채워지지 않는다. 채움 값은 그 노드가 처음 채워지는 전이 라운드의 유효 스키마에서 읽는다. 뒤 라운드에 켜진 조각의 `default`는 쓰지 않는다 |

생김은 노드 단위다(WRITE-007). 직전 커밋의 형상에 없고 이번 정착의 최종 형상에 있는 노드만 생긴 것이고, 본체·게이트 없는 `allOf` 항목·이미 켜져 있던 다른 조각이 두고 있던 노드는 새 조각이 켜져도 생기지 않는다(WRITE-007).

"없음"과 `''`·`null`·`{}`은 다르다(WRITE-010). 객체 호스트의 없음은 호스트와 모든 자손의 `raw`·`extras`가 없음인 것이라, 로드한 V가 그 자리에 `{}`를 주어도 호스트는 `controls.default` > `default`를 받는다(WRITE-010, WRITE-082). 리프에 `undefined`를 쓰면 없음이 된다(WRITE-010). 입력 컴포넌트가 `onChange(undefined)`를 보내도 값이 없음이 된다(소유자 답(`reviews/round-10-owner-answers.md:15` C-11), WRITE-010). `Merge`로 키에 `undefined`를 쓰면 그 키는 없음이 된다(WRITE-010). `extras`의 키도 같고, 따로 `removeKey`를 두지 않는다(소유자 답(`reviews/round-10-owner-answers.md:18` C-2), WRITE-010).

공개 옵션은 비트마스크다 — `SetValueOption.Overwrite | Merge | DisableAutomaticWrites | EnableAutomaticWrites`, Form 속성은 `disableAutomaticWrites`(SURFACE-004, SURFACE-039, WRITE-015).

(WRITE-015, WRITE-090, WRITE-078, WRITE-100)

| 규칙 | 내용 |
| ---- | ---- |
| 기본 | 쓰기 종류는 `Overwrite` — 오늘과 같다 |
| 자리 | `setValue(V, option)`뿐 아니라 **`reset(option)`과 마운트**에도 둔다. 마운트는 `defaultValue`가 로드이므로 Form 속성이 그 자리다 |
| 우선순위 | **호출 옵션 > Form 속성**, 양방향이다. 속성이 켜 둔 억제를 호출이 끌 수 있고 그 반대도 된다. 억제 비트가 둘(`DisableAutomaticWrites`·`EnableAutomaticWrites`)인 이유가 이것이다 — 상속·끄기·켜기 세 상태. 호출에 둘 다 없으면 Form 속성을 따르고, 둘 다 주면 억제가 이긴다 |
| 배치 | 한 배치 안에 서로 다른 억제 값이 섞이면 **억제가 이긴다**(보수적. `fn` 안의 `reset`의 로드는 묶음 밖이다, EVENT-015) |
| 범위 | 억제는 그 호출이 일으킨 예약 층의 자동 쓰기 전부를 막는다 — 채움, `controls.derived`, `controls.injectTo`, `controls.unsetValue`, 나감의 비움, 포커스 아웃 `trim`이 자른 값의 쓰기. 포커스 아웃 `trim`이 자른 값의 쓰기도 자동 쓰기(여섯째)이자 억제 비트의 대상이라 억제를 켠 폼에서는 포커스 아웃 때 자르지 않는다. 전체 교체(`setValue(V)`)는 로드가 아니라 전체 교체 쓰기이고, 로드는 마운트·`FormHandle.reset()`·`resetSubtree()`뿐이며, `DisableAutomaticWrites`는 그 쓰기로 새로 생긴 노드의 채움과 다른 자동 쓰기를 끈다. `Merge`에 주면 `Merge`가 통째로 준 배열의 아이템 채움과 그 `Merge`가 촉발한 `controls.derived`도 막는다. 로드된 값 자체는 막지 않는다. `controls.active`의 방출 제외는 쓰기가 아니라 투영이므로 범위 밖이고, 정책이 참으로 정해진 노드의 나감 비움은 범위 안이다. 뒤이은 사용자 입력·리스너가 일으킨 정착은 다른 호출이므로 억제가 듣지 않는다(4라운드 명세 F25). |
| `Merge` | `Merge`는 V에 없는 키를 로드하지 않는다. V가 통째로 준 배열은 통째 교체다. 그 아이템 가운데 직전 커밋의 형상에 없던 노드는 생긴 노드로서 채움을 받으며, 어떤 아이템이 생긴 것인지는 NODE-051이다. `Merge`에 준 억제 비트는 그 호출이 일으킨 자동 쓰기에 적용되므로 이 채움도 막는다 |

`FormHandle.reset(option?)`은 `DisableAutomaticWrites`·`EnableAutomaticWrites` 두 비트만 받는다(SURFACE-005, WRITE-015). `Overwrite`·`Merge`는 받지 않는다(WRITE-015). `fn` 안의 `reset`의 억제 비트는 그 로드에만 들며, 로드가 `fn`의 쓰기 묶음에 들지 않으므로 배치 규칙('섞이면 억제가 이긴다')은 묶음의 쓰기끼리만 합산한다(WRITE-015).

`Refresh`는 옵션이 아니라 core가 출처로 판단한다(4라운드 명세 F7, WRITE-016). core는 로드된 노드 모두에 Refresh를 낸다(오늘의 `Overwrite`와 같다)(WRITE-016).

JSDoc이 "로드"를 정의한다(WRITE-074). 어느 것이든 JSDoc에 "로드"를 정의한다 — `setValue(V, Overwrite)`와 `null`로의 교체는 로드가 아니라 전체 교체 쓰기이고, 로드는 마운트·`FormHandle.reset()`·`resetSubtree()`뿐이다(WRITE-074, WRITE-090).

【추론】 (다) 입력 구성 요소가 옵션 없이 `onChange(V)`를 부르면 '입력 쓰기'다(WRITE-091).
【추론】 그 노드의 값이 V가 된다(WRITE-091).
【추론】 잎과 터미널에서는 원본을 바꾼다(WRITE-091).
【추론】 자식이 있는 노드에서는 V에 없는 자식이 없음이 되고, 선언되지 않은 키는 `extras`로 간다(WRITE-091).
【추론】 트리 전체로 보면 그 노드 아래만 바뀌는 부분 쓰기이며 로드가 아니다(WRITE-091).
【추론】 그래서 새 수명이 없고, 지운 키를 다시 채우지 않으며, 채움은 생긴 노드에만 들어간다(WRITE-091).
【추론】 `derived`와 `injectTo`는 평소 에지 규칙을 따른다(WRITE-091).
【추론】 Refresh는 쓴 입력 자신에게 보내지 않는다(계승 제약 T-2(타이핑은 입력을 리마운트하지 않는다), WRITE-091).
【추론】 이 쓰기로 원본이 바뀐 자손에게만 보낸다(EVENT-042의 출처 규칙, WRITE-091).
【추론】 입력은 두 번째 인자로 공개 비트마스크를 넘길 수 있다(오늘도 넘긴다)(WRITE-091).
【추론】 `Merge`를 주면 (나)의 부분 쓰기가 된다(WRITE-091).
【추론】 출처 규칙대로 자기 입력은 Refresh를 받지 않는다(WRITE-091).
【추론】 억제 비트는 그 쓰기가 일으킨 자동 쓰기에 적용된다(WRITE-091).
【추론】 `handleChange`의 바깥 오류 지움과 dirty 표시(REACT-011)는 옵션과 무관하게 그대로다(WRITE-091).

【추론】 (나) `Merge`는 키로 합칠 수 있는 자리에서만 합친다(WRITE-079).
【추론】 그 자리의 값을 통째로 바꾸는 경우는 둘이다(WRITE-079).
【추론】 하나는 V나 V 안의 값이 평범한 객체가 아닌 때다(`null`, `undefined`, 원시 값, 배열, 객체 호스트에 온 배열)(WRITE-079).
【추론】 다른 하나는 그 자리의 노드가 객체 호스트가 아닌 때다(WRITE-079).
【추론】 이는 이미 정한 배열 규칙('통째로 준 배열은 통째 교체')을 일반화한 것이다(WRITE-079).
【추론】 바뀐 자리의 자식 원본은 없음이 되고, 호스트는 받은 값을 든다(`undefined`면 없음)(WRITE-079).
【추론】 이 쓰기는 부분 쓰기이며 로드가 아니다(WRITE-079).
【추론】 그래서 채움은 이 쓰기로 새로 생긴 노드에만 들어간다(WRITE-079).
【추론】 로드가 아닌 쓰기로 온 `null`·비객체 값도 그 자리의 자식 원본을 없음으로 만들지만 새 수명이 아니므로 채움을 받지 않는다(WRITE-090의 '빈 상태' 채움은 로드에만 해당)(WRITE-079).
【추론】 호출자 오류로 던지지 않고 조용히 버리지도 않는다(WRITE-079).
【추론】 그래서 새 코드가 없다(WRITE-079).
【추론】 틀린 종류의 값이면 S1 규칙대로 경고등이 켜지고 `SCHEMA_FORM_WARNING.TYPE_MISMATCH` 경고가 간다(WRITE-079, SURFACE-061).

반영 칸(설계서 메모 4): "게터 `typeMismatch: boolean`, 경로 목록 `typeMismatches: readonly string[]`, 경고 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`."(WRITE-079)

자동 쓰기는 비객체 호스트의 원본을 건드리지 않고(4라운드 명세 F10, 계승 제약 T-12(자동 쓰기는 null 조상을 객체로 만들지 않는다)), core는 호출자가 넘긴 객체를 바꾸지 않는다(4라운드 명세 F24, 계승 제약 T-19(`defaultValue`와 `jsonSchema`는 마운트 시 deep clone한다), WRITE-013).

호스트의 원본이 `null`·`17` 같은 잘못된 종류의 값일 때 그 자식은 존재하고 렌더되며 빈 상태를 보인다(WRITE-013). 호스트의 그 원본을 비우는 것은 사용자·호출자의 부분 쓰기뿐이고 **그 자식의 투영된 방출이 존재하게 될 때만** 비운다(WRITE-013). 로드가 아닌 쓰기로 온 `null` 아래 자식은 채움 없이 없음이며(WRITE-090, WRITE-092), 채움 값을 드는 것은 로드로 온 `null` 아래 자식이다(WRITE-096, WRITE-013). `setValue({ user: null })` 뒤 사용자가 `name`에 입력하면 `user`가 객체가 되어 방출된다(4라운드 명세 F1, 4라운드 명세 F10, WRITE-013).

터미널 노드가 참조를 들 수 있으므로 `defaultValue`는 분배 시 복사하거나 불변으로 취급한다(4라운드 명세 F24, 계승 제약 T-19, WRITE-071).

### 05-validation-and-errors.md §1.2 스키마 사본과 폼 전용 키

키워드 위치의 그룹 객체 셋 `controls`·`options`·`presentation`을 지운다(VALIDATE-004). 지우는 이유는 판정이 아니라 컴파일이다(VALIDATE-004). 작성된 스키마 자체는 변형하지 않고 검증기에 넘길 사본에서만 지운다(VALIDATE-001, VALIDATE-004). 오늘은 여섯 키(`FormTypeInput`, `FormTypeInputProps`, `FormTypeRendererProps`, `errorMessages`, `options`, `injectTo`)만 지우고 `&` 키·`computed`·`virtual`·`terminal` 등은 검증기까지 가므로, 그룹 셋으로 옮기는 것이 이주 항목이다(VALIDATE-004). 서버 스키마에 넘길 때도 같은 셋을 지우면 되고, 서버 스키마와 클라이언트 스키마를 합칠 때는 그룹 셋만 덧붙이면 된다(VALIDATE-004).

**허용되는 스키마 변형은 하나다 — 폼 전용 키를 키워드 위치에서만 제거하는 것.**(VALIDATE-004) 현재 `stripSchemaExtensions`가 하는 일이고(`JSONSchemaScanner`로 위치를 구분한다) 그대로 둔다(목록은 그룹 객체 셋으로 닫힌다)(VALIDATE-004). 제거가 필요한 이유는 판정이 아니라 **검증기의 컴파일**이다: 폼 전용 키의 값에 순환하거나 깊은 객체가 있으면(`presentation.FormTypeInputProps`의 자기 참조, 개발 빌드의 React 엘리먼트) `ajv.compile`이 스택 초과로 죽는다(실행)(VALIDATE-004).

소비자의 커스텀 키는 라이브러리가 열거할 수 없으므로 지우지 않는다 — strict 모드는 기본이 아니다(VALIDATE-005, CONTROLS-001). 맨 키 가운데 폼이 모르는 것은 지우지 않는다(VALIDATE-005). 그것은 JSON Schema 층의 것(확장 키워드)이고 검증기의 몫이다(VALIDATE-005).

`options.virtual` 처리는 12라운드에 닫혔다: `options.virtual`은 제거 목록에 들고 `required` 재작성은 버린다(VALIDATE-034).

소유자(12라운드 8)는 "우리는 투명한 jsonSchema 를 추구하므로, virtual 여부와 무관한 실제 필드 명시를 요구하는 바이다"라고 답했다(VALIDATE-034).

- `&if`만으로 분기를 구분한 기존 스키마는 폼에서도 invalid가 된다(VALIDATE-036). 의도된 파괴적 변경이다(VALIDATE-036).

- `ENHANCED_KEY`, enhancer, `preprocessSchema`의 마커 주입, `__processCompositionValue__`의 마커 기록, `transformErrors`의 마커 필터가 모두 사라진다(VALIDATE-010). 이슈 #342 §3.1·§3.3·§3.4가 함께 사라진다(VALIDATE-010).
- `nodeFromJSONSchema`를 직접 부르는 경로와 `<Form>` 경로가 같은 계약을 갖게 된다(지금은 다르다)(VALIDATE-010).

### 05-validation-and-errors.md §2.20 추가 경고의 발생 조건

변환에러는 onError 로 전달하죠(ERROR-184).

편집자 결정: `onError` 기록의 level은 `warning`이다(ERROR-186). 값을 보존하므로 폼의 약속은 지켜진다(ERROR-186). error 층은 throw·거부·싱크로 드러나야 해 통보 3과 부딪힌다(ERROR-186). `SCHEMA_FORM_WARNING.TYPE_MISMATCH`를 노드의 정합 상태가 켜질 때마다 한 번 보낸다(path, 기대 형, 받은 값의 종류, 쓰기 출처)(ERROR-186, SURFACE-061). level은 `warning`이다(개발 모드 콘솔, 프로덕션은 핸들러가 있을 때만)(ERROR-186). 【추론】 `SCHEMA_FORM_WARNING.TYPE_MISMATCH` 기록은 `{ level: 'warning', code, path, expected: { schemaType, nullable, effective }, received, reason, candidates?, source }`이다(ERROR-186, EVENT-060, SURFACE-061). 【추론】 `expected.schemaType`은 `node.schemaType`이고, `expected.effective`는 그 커밋의 유효 목록이다(ERROR-186). 【추론】 `source`는 EVENT-060의 쓰기 출처 값에 `'gate'`를 더한 것이다(ERROR-186, EVENT-060). 게터 `typeMismatch: boolean`, 경로 목록 `typeMismatches: readonly string[]`, 경고 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`다(ERROR-186, SURFACE-061).

검증기가 있든 없든 보낸다(core의 parse가 찾는 것이라 검증 결과가 아니다)(ERROR-187). 제출은 검증기가 있으면 검증이 막고 없으면 막지 않는다(통보 3)(ERROR-187).

터미널이 된 노드의 입력이 비어 있는 `ChildNodeComponents`를 읽으면 개발 모드에서 경고한다(목표 C2(작성자 실수의 가시성))(ERROR-185, GOAL-015). 【추론】 가상은 `branch`이므로 ERROR-185의 경고(터미널 노드의 입력이 빈 `ChildNodeComponents`를 읽을 때의 개발 모드 경고)는 가상 노드에 적용되지 않는다(ERROR-185).

플러그인이 자기 방언을 선택적으로 선언하고, 스키마의 `$schema`와 어긋나면 개발 모드에서 경고만 낸다(프로덕션 출력 없음, `onError` 핸들러가 있으면 경고 기록)(ERROR-188). 경고 코드는 ERROR-164의 목록에 더한다(가칭, 편집자)(ERROR-188, ERROR-164).

### 06-react-and-surface.md §1.1 핵심 엔진과 렌더 계층의 경계

앞의 것은 렌더 계층의 판정 함수로 옮기고(NODE-028), 뒤의 import 분리는 닫혔다: core는 `app/plugin`을 가져오지 않고 검증기는 바인딩 계층이 골라 트리 생성 인자로 넘긴다(REACT-002, NODE-028, CONTROLS-075). 의존 역전으로 끊고 `record/`가 `SchemaNodeRuntime` 칸의 형을 최소 인터페이스로 선언한다(REACT-002, NODE-045).

선언 사이 규칙은 SCHEMA-039이다(REACT-003, SCHEMA-039). 판정 함수는 렌더 계층(React 바인딩)이 병합의 원자 판정 함수(React 요소와 ref 모양, SCHEMA-039)와 함께 청사진에 인자로 넘기며, core만 쓰는 호스트에는 이 암묵 규칙도 원자도 없다(REACT-003, SCHEMA-039).
React 요소(`$$typeof`)와 ref 모양(자기 열거 키가 `current` 하나뿐인 객체)은 원자라 나중 승이다(REACT-003).
원자 판정 함수는 렌더 계층이 터미널 판정 함수와 함께 청사진에 넘기며 core는 React 요소의 표식을 모른다(원리 P5(core는 렌더러를 모른다), GOAL-031)(REACT-003, GOAL-031).
렌더 계층이 넘긴 판정으로 정하는 원자(React 요소, ref 모양)와 한쪽 값의 참조 이동은 `@winglet/common-utils` `merge`의 선택 인자다(REACT-003).

루트는 마운트 때 받은 두 판정 함수를 들고, reset 호출 안의 재생성(WRITE-046)은 같은 함수들로 청사진을 다시 돈다(마운트와 reset이 같은 형상, 목표 G4(하나의 개념에는 하나의 장치), GOAL-006)(REACT-004, WRITE-046, GOAL-006).
reset 호출 안에서 동기로 만들고(트리 생성은 core의 연산이다, 추가 목표 C3(프레임워크 독립적인 core), GOAL-016)(REACT-004, GOAL-016).
React 연결은 외부 저장소(`useSyncExternalStore`)로 알려 막는 차선으로 곧바로 커밋한다(`startTransition` 안에서도 옛 화면이 입력을 받는 틈을 두지 않는다)(REACT-004).

## 설계문서

- `design/02-node-and-value.md` §1.1 (NODE-021, NODE-025, NODE-026, NODE-022)
- `design/02-node-and-value.md` §1.2 (NODE-001, NODE-002, NODE-003)
- `design/02-node-and-value.md` §1.3 (NODE-007)
- `design/02-node-and-value.md` §1.4 (NODE-008, NODE-009)
- `design/02-node-and-value.md` §1.6 (NODE-027, NODE-028, NODE-030, NODE-031)
- `design/02-node-and-value.md` §1.7 (NODE-034, NODE-035, NODE-036)
- `design/02-node-and-value.md` §1.8 (NODE-020)
- `design/02-node-and-value.md` §3.2 (WRITE-071)
- `design/05-validation-and-errors.md` §1.2 (VALIDATE-034)
- `design/05-validation-and-errors.md` §2.20 (ERROR-185)
- `design/06-react-and-surface.md` §1.1 (REACT-002, REACT-003)
