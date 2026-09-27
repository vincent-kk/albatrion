# 02 노드와 값

이 문서는 원장의 NODE·VALUE·WRITE 영역을 읽는 표면이다. 정본은 `ledger/`이며, 문장 끝 괄호의 ID가 근거이고, 어긋나면 원장이 이긴다.

## 소유자 통과

| 절 | 상태 | 날짜 |
| --- | --- | --- |
| 1.1 노드의 종류 | 대기 | — |
| 1.2 상속 없는 단일 클래스와 레코드 | 대기 | — |
| 1.3 동작 행의 칸과 비용 | 대기 | — |
| 1.4 책임별 fractal과 의존 방향 | 대기 | — |
| 1.5 겉면 규칙, 공개 타입과 이름 규칙 | 대기 | — |
| 1.6 터미널 전략의 판정 | 대기 | — |
| 1.7 가상 노드 | 대기 | — |
| 1.8 탐색과 형상을 떠난 노드 | 대기 | — |
| 1.9 배열 아이템과 튜플 | 대기 | — |
| 1.10 union 노드의 필드와 공개 형 | 대기 | — |
| 2.1 노드 트리가 곧 상태, 노드가 드는 칸 | 대기 | — |
| 2.2 방출과 값 읽기 | 대기 | — |
| 2.3 형상과 잠복 원본 | 대기 | — |
| 2.4 null 계약과 정합 상태(경고등) | 대기 | — |
| 3.1 core는 받은 값을 고치지 않는다 | 대기 | — |
| 3.2 쓰기 표, 쓰기 종류와 쓰기 옵션 | 대기 | — |
| 3.3 채움과 로드 | 대기 | — |
| 3.4 전체 교체 쓰기와 null | 대기 | — |
| 3.5 reset의 판정과 경로 | 대기 | — |
| 3.6 노드 되돌림과 로드 스냅숏 | 대기 | — |
| 3.7 값 조작 셋과 예약 층 | 대기 | — |
| 3.8 나감의 비움 | 대기 | — |
| 3.9 core가 값을 바꾸던 곳 | 대기 | — |
| 3.10 parse와 자동 변환, 포커스 아웃 trim | 대기 | — |
| 3.11 union 행의 해석과 쓰기 경계 | 대기 | — |

## 1. 노드

### 1.1 노드의 종류

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

### 1.2 상속 없는 단일 클래스와 레코드

Vincent의 요건: 상속 구조를 그대로 두는 것, 공유 로직을 타입별로 흩어 두는 것, 불필요한 중복은 불허(NODE-001). 17라운드에 Vincent가 구조를 확정했다: 상속 없이 클래스 하나와 종류별 동작 행을 두며, 행이 곧 오늘 하위 클래스의 정의다(NODE-002)(NODE-001). `BranchStrategy`/`TerminalStrategy`는 `src/core/behaviors/`의 종류 모듈 안 `branch/`·`terminal/`로 대체된다(`objectBehavior/`·`arrayBehavior/`, 두 전략이 함께 쓰는 보조는 그 종류의 `utils/`, NODE-009)(NODE-001). ObjectNode/ArrayNode 클래스는 남기지 않는다(NODE-001).

**클래스를 없애지는 않는다.**(NODE-013) `setValue`·`find`·`subscribe`·`push`·`remove`는 공개 계약이다(NODE-013). 노드마다 클로저를 달면 노드 수만큼 메모리가 들고, 프로토타입 메서드를 가진 단일 클래스가 가장 싸며 모든 노드가 같은 숨은 클래스가 된다(NODE-013).

**클래스 하나, 행 하나.**(NODE-002) 하위 클래스 없이 단일 클래스 `SchemaNode` 하나를 둔다(NODE-002). 종류별 동작은 표 `BEHAVIORS[type][strategy]`의 두 단계에 둔다(잎은 `terminal` 하나, 객체·배열은 `branch`·`terminal` 둘, 가상은 하나)(NODE-002). 노드는 생성 때 고른 행 하나를 필드 `behavior`로 들고(`kind` 필드는 없다), 공개 `type`·`strategy`는 행에서 읽는 게터다(NODE-002). 【추론】 접은 집합의 원소가 둘 이상이면 새 종류 (가칭) `union`의 노드이고 행은 `terminal` 하나다(`BEHAVIORS.union.terminal`)(NODE-002, BLUEPRINT-043).

공개 `node.group`은 `node.strategy`로 바뀐다(값 `'branch'` 또는 `'terminal'`은 그대로, 17라운드 소유자 답)(NODE-003). 청사진이 정한 전략은 노드의 공개 `strategy`(`'branch'` 또는 `'terminal'`, 옛 `group`의 새 이름이며 값은 그대로)로 읽힌다(NODE-003).

공통 필드는 고정 배치하고 종류별 데이터는 한 칸 `structure`(객체의 키별 자식 맵, 배열의 아이템 목록과 키 번호, 가상의 참조)에 담는다(NODE-004). 노드 필드 `runtime`은 트리마다 하나인 `SchemaNodeRuntime`(통지 대기열, 검증기, 진단, 진입 깊이와 예산, `nodeFactory`, `onError` 보고기)을 가리킨다(NODE-004). 노드 인스턴스가 곧 레코드다(노드마다 객체 하나)(NODE-004). 정착 알고리즘은 `settle`의 자유 함수가 레코드 위에서 돌린다(NODE-004). 【추론】 branch 객체의 `structure`는 이름에서 그 커밋의 형상에 있는 자식 노드로 가는 맵이다(NODE-004).

### 1.3 동작 행의 칸과 비용

터미널 객체는 행을 따로 두되 값을 통째로 드는 칸 함수를 잎과 함께 쓰고, 터미널 배열은 원본을 통째로 들되 배열 연산(`push`·`update`·`remove`·`pop`·`clear`)을 오늘처럼 원본 배열 위에서 지원한다(NODE-005).

**행의 칸.**(NODE-006) `interpret`(입력 해석), `assemble`(합성: 활성 자식의 방출 값 → local), `project`(투영: local → 방출 값), `finishInput`(입력 마침), `declareChildren`(자식 선언 목록만 돌려주고, 생성은 `settle`이 런타임의 `nodeFactory`로 한다), `type`, `strategy`(NODE-006). 행 계약의 형은 `Behavior`다(NODE-006). 행은 계산만 한다: 원본 쓰기, 되돌림 기록, 자식 연결과 폐기의 확정, 통지는 `settle`과 `dispatch`가 한다(NODE-006). 모든 행은 칸을 모두 같은 순서로 가지며 없는 동작은 공유 칸으로 채우고, 뜻이 같은 칸은 함수 객체 하나를 여러 행이 함께 쓴다(공유 로직을 타입별로 흩지 않는다는 요건을 행 수준에서도 지킨다)(NODE-006). 옵션에서 나오는 정적 선택(빈 값 생략, 배열 뒤쪽 생략, `trim`, 배열 한계)은 칸이 불릴 때마다 계산하지 않고 유효 스키마 메모가 바뀔 때 한 번 계산해 메모와 함께 둔다(NODE-006).

**`trim`과 입력 마침.**(NODE-007) 문자열 행의 `finishInput` 칸이 `options.trim`을 판단해 자른 값을 돌려주고, 포커스 아웃 때 자른 값을 쓰는 것은 자동 쓰기로, 원본만 쓰고 바깥 오류를 지우거나 dirty를 표시하지 않으며, 그 노드의 입력은 Refresh를 받는다(NODE-007, WRITE-083). 어댑터는 타입을 모르는 입력 마침 신호 `finishInput`만 보낸다(17라운드 소유자 답 R17-3)(NODE-007). `trim`은 포커스 아웃 때 문자열 동작 행의 `finishInput` 칸이 판단한다(NODE-007).

**배열 메서드**는 클래스에 두되 타입은 `ArrayNode` 인터페이스에만 준다(NODE-014). 비배열에서 부르면 행의 공유 칸이 `SchemaFormError`를 던지므로 겉면과 `dispatch`는 종류를 묻지 않는다(NODE-014). UI 플러그인이 `node.push()`를 부른다(NODE-014). 비배열은 `type`이 배열이 아닌 노드를 말한다(NODE-014).

**비용(추정, 벤치로 확인).**(NODE-018) 노드마다 객체 하나이고, 행은 종류마다 하나를 모든 노드가 공유한다(NODE-018). (가칭) `union` 잎의 `terminal` 행이 더해져 행은 열이다(NODE-018, BLUEPRINT-043). 노드마다의 매니저·클로저·전략 객체·구독은 없다(규칙과 린트로 금한다)(NODE-018). 모든 노드가 한 클래스이고 필드를 같은 순서로 넣으면 한 숨은 클래스를 가져, 여러 종류를 도는 `settle`·`dispatch`의 필드 읽기가 단형 인라인 캐시로 남을 것으로 본다(Vincent가 말한 "상속 클래스에 의한 캐싱 비효율")(NODE-018). 남는 비용도 적는다: 칸 함수의 호출은 간접 호출으로 남고, `type`이 게터가 되어 읽기가 한 단계 늘며, iOS의 JavaScriptCore에서는 같은 결론이 보장되지 않는다(NODE-018). 메모리는 필드 24–30개일 때 노드 하나가 약 110–140바이트(포인터 압축 엔진) 또는 약 210–260바이트(압축 없는 엔진)로 추정한다(NODE-018). 벤치 여섯을 TEST-026의 기준선과 비교한다: B1(섞인 종류 1만 노드의 `value`·`type` 읽기, V8과 JavaScriptCore), B2(노드당 힙 바이트), B3(종류 인스턴스와 행이 같은 맵인지), B4(정착 뜨거운 루프의 거대형 자리 수), B5(입력에서 커밋까지의 지연), B6(노드 1만 개 생성 시간)(NODE-018). B3이 보는 종류 인스턴스와 행은 `union`을 더해 열이다(NODE-018, BLUEPRINT-043). 오늘의 주된 비용이 노드마다의 할당인지 인라인 캐시인지는 재지 않았으므로 크기는 벤치가 정한다(NODE-018).

【추론】 NODE-018(현행)이 B1–B6을 기준선과 비교한다고 적으나 합격선이 없으므로 여기서 둔다(NODE-055). 【추론】 PR-2에서 B1–B6을 V8(node)과 JavaScriptCore(bun, 또는 `benchmark-form/browser-bench`의 Safari)에서 돌린다(NODE-055). 【추론】 B1·B5·B6의 합격선은 TEST-073의 선(`guard:check`) 안이다(NODE-055). 【추론】 B2의 합격선은 NODE-018의 추정(110–140바이트, 포인터 압축 엔진)의 1.5배 이내이고, 같은 엔진에서 잰 오늘 노드 인스턴스와 부속 객체의 합을 나란히 적어 그보다 크지 않은 것이다(NODE-055). 【추론】 B3의 합격선은 같은 맵이 참인 것이다(NODE-055). 【추론】 B4는 보고만 한다(NODE-055). 【추론】 합격선을 넘으면 TEST-027의 절차(이유를 적고 Vincent가 받아들임)로 올린다(NODE-055).

- PR: PR-2(NODE-055).
- 통과: 위 합격선 안이다(NODE-055).
- 실패: TEST-027의 절차(TEST-072의 기록·수용 규칙)로 올린다(NODE-055).

### 1.4 책임별 fractal과 의존 방향

**책임별 fractal.**(NODE-008) 16라운드에 레코드·종류 표·탐색을 한 fractal에 두던 제안을 책임별로 나눴다(17라운드 소유자 답, `reviews/round-17-owner-answers.md:26`)(NODE-008). 나눈 fractal은 `src/core/blueprint/`(PR-1), `src/core/record/`(레코드: `SchemaNodeRecord` 형, 행 계약 `Behavior`, `SchemaNodeFactory` 형, `SchemaNodeRuntime` 형, 이름·경로 갱신과 상호작용 상태 패치), `src/core/behaviors/`(`BEHAVIORS`; 종류 모듈 `stringBehavior/`·`numberBehavior/`·`booleanBehavior/`·`nullBehavior/`·`virtualBehavior/`, `objectBehavior/`와 `arrayBehavior/`는 안에 `branch/`·`terminal/`·`utils/`), `src/core/navigation/`(`find`·`findNodes`와 트리 걷기), `src/core/settle/`(+`settle/derive/`), `src/core/dispatch/`, `src/core/validation/`, `src/core/SchemaNode/`(공개 겉면, 클래스 `SchemaNode`)다(NODE-008). 종류 모듈에 (가칭) `unionBehavior/`가 더해진다(NODE-008, BLUEPRINT-043). 모듈 수준 생성 함수는 `schemaNodeFactory`이며, 오늘과 달리 공장은 노드마다가 아니라 트리마다 하나다(NODE-008).

**behaviors 규칙.**(NODE-009) 종류마다 fractal 하나(`INTENT.md`·`DETAIL.md`·진입점·같은 이름의 행 파일)를 둔다(NODE-009). 여덟 줄을 넘는 칸과 그 종류만의 보조는 그 종류의 `utils/`, 두 전략이 함께 쓰는 것은 그 종류의 `utils/`, 두 종류 이상이 쓰는 것은 `behaviors/utils/`에 둔다(NODE-009). behaviors 밖에서도 쓰는 것은 behaviors의 것이 아니다(예: `resolveArrayLimits`는 `blueprint/`로)(NODE-009). 행은 칸을 모두 같은 순서로 갖는다(NODE-009). 종류 모듈은 behaviors 뿌리와 `settle`·`dispatch`·`validation`·공개 겉면을 가져오지 않는다(NODE-009).

**의존 방향.**(NODE-016) 전순서는 `blueprint` < `record` < {`behaviors`의 종류 모듈, `navigation`} < `settle/derive` < `settle` < `validation` < `dispatch` < `SchemaNode`다(NODE-016). 조건은 셋이다: 행 계약 `Behavior`는 `record`에 둔다, 청사진은 행의 키가 아니라 `type`·`strategy`만 낸다, 생성은 `SchemaNodeRuntime`의 `nodeFactory`로 주입한다(NODE-016). `core/index.ts`와 `nodeFromJSONSchema`는 `SchemaNode/`의 진입점만, React 바인딩은 `core/index.ts`만 가져온다(NODE-016).

【추론】 의존 역전으로 끊는다(NODE-045). 【추론】 `record/`가 `SchemaNodeRuntime`의 칸(통지 대기열, 검증기, 진단, 진입 깊이와 예산, `nodeFactory`, `onError` 보고기)의 형을 그 칸을 부르는 쪽이 쓰는 최소 인터페이스로 선언한다(NODE-045). 【추론】 `dispatch`·`validation`과 트리를 만드는 자리가 그 인터페이스를 만족하는 구현을 넣는다(NODE-045). 【추론】 `record/`는 `dispatch`·`validation`·`app/plugin`을 가져오지 않는다(NODE-045). 【추론】 `import type`도 금지다(NODE-045). 【추론】 검증기 칸은 플러그인 형이 아니라 `record/`의 검증 요청 인터페이스이고, 플러그인의 검증기는 트리를 만드는 자리에서 이 칸에 맞춰 넣는다(NODE-045). 【추론】 칸을 하나 더하면 `record/`의 선언을 고친다(NODE-045). 【추론】 그 대가를 레코드 `DETAIL.md`에 적는다(`Behavior`와 같은 방식)(NODE-045). 【추론】 PR-2의 병합 점검에 `import type`까지 센 순환 검사를 둔다(NODE-045). 【추론】 도구는 PR-2가 고른다(NODE-045).

【추론】 S1 parse 함수(소유자 답 S1의 노드마다 타입에 맞는 parse, WRITE-052)는 `src/core/behaviors/utils/parse/`에 둔다(NODE-056). 【추론】 부르는 쪽은 동작 행의 `interpret` 칸이다(WRITE-056)(NODE-056). 기본 union 입력도 같은 내부 함수를 쓰지 않는 호출로 부른다(NODE-056, REACT-033). `union` 노드의 해석은 `type`의 선언 순서도 검증기 플러그인의 규칙도 쓰지 않고, 변환 목록(WRITE-075)으로 받아 줄 형이 정확히 하나일 때만 그 형으로 바꾼다(NODE-056, BLUEPRINT-042). 【추론】 BLUEPRINT-043의 `union` 행이 수·문자열·불리언 변환을 부르므로 이 변환들은 두 종류 이상이 쓴다(NODE-056). 【추론】 그래서 NODE-009대로 `behaviors/utils/` 아래, 주제 디렉토리 `parse/`에 둔다(NODE-056). 【추론】 NODE-009와 어긋나지 않는다(NODE-056). 【추론】 PR-2는 이 자리에 S1 변환(WRITE-075의 변환 목록, WRITE-052)만 하는 parse를 새로 둔다(NODE-056). 【추론】 오늘의 `src/core/parsers/`는 그것을 가져오는 옛 노드와 함께 `src/__legacy__/core/parsers/`로 옮긴다(LANDING-159)(NODE-056). 【추론】 레거시는 새 parse를 가져오지 않는다(NODE-056).

### 1.5 겉면 규칙, 공개 타입과 이름 규칙

**겉면 규칙.**(NODE-010) `SchemaNode` 클래스 파일에는 필드·게터·문장 하나짜리 위임만 둔다(NODE-010). 분기·반복·종류 비교를 금하고(예외는 가드), 생성자는 선언 순서대로 대입만 하며, 노드마다 할당을 만들지 않는다(생성자와 필드 초기화식에 객체·배열 리터럴, 함수, `new`를 두지 않는다)(NODE-010). 필드 집합은 고정한다(NODE-010). 멤버 목록은 공개 계약 목록과 같아야 하며, `SchemaNode/`의 `DETAIL.md` 목록과 프로토타입 멤버 이름을 맞대는 멤버 목록 시험으로 지킨다(NODE-010). 여러 단계를 잇는 조율(쓰기 → 커밋 → 통지 → 검증 요청, 하위 트리 상태 쓰기, `validate`, 로드)은 `dispatch`의 동사별 진입이 맡는다(NODE-010). 기계 검사는 그 클래스 파일에만 거는 ESLint 설정이다(NODE-010). 내부 통로(입력 마침 신호 `finishInput`, 입력 출처 표식이 붙은 쓰기)는 클래스 멤버가 아니며 `SchemaNode/` 진입점이 바인딩 전용으로 이름을 붙여 내보낸다(NODE-010). 맥락 갱신 `setContext`(가칭)도 같은 바인딩 전용 내부 통로다(NODE-010, SURFACE-055). `core/index.ts`는 이들을 이름으로 다시 내보내고 `src/index.ts`는 내보내지 않는다(공개 index의 키 목록 시험)(NODE-010). 겉면의 `INTENT.md` 첫 줄에 이름 함정 경고를 둔다(렌더 디렉토리 `src/components/SchemaNode`, 공개 판별 합집합 형 `SchemaNode`와 이름이 같다)(NODE-010).

【추론】 내부 통로는 core만 쓰는 호스트에 열지 않는다(NODE-050). 【추론】 내부 통로는 NODE-010대로 바인딩 전용이다(NODE-050). 【추론】 `SchemaNode/` 진입점이 이름으로 내보내고, `core/index.ts`가 다시 내보내며, `src/index.ts`에는 없다(NODE-050). 【추론】 패키지의 공개 진입점은 `.` 하나뿐이고 트리를 직접 만드는 공개 경로가 없다(NODE-050). 【추론】 `nodeFromJSONSchema`는 `src/index.ts`가 내보내지 않는다(`src/index.ts:33-54`, `src/core/index.ts:1`)(NODE-050). 【추론】 그러니 공개 호스트는 모두 바인딩을 거치며, 통로를 열면 소비자 없는 공개 계약이 생긴다(NODE-050). 【추론】 core만 쓰는 호스트(예: 코어 시나리오 러너)는 포커스 개념이 없다(NODE-050). 【추론】 자른 값이 필요하면 `setValue`로 쓴다(NODE-050). 【추론】 뒤에 공개 core 진입점(하위 경로 수출)을 두게 되면, 그때 통로를 그 진입점의 계약으로 이름 붙여 여는 것이 계약 변경이다(NODE-050).

**공개 타입과 가드는 유지한다.**(NODE-015) `SchemaNode`는 판별 합집합 인터페이스가 되고 `InferSchemaNode` 사상은 그대로다(NODE-015). 공개 진입점이 노드 타입을 `type`으로만 내보내므로 클래스를 인터페이스로 바꿔도 소비자는 깨지지 않는다(NODE-015). 공개 판별 합집합에는 레코드 필드와 `behavior`를 싣지 않는다(NODE-015). (가칭) `isUnionNode`가 더해져 공개 가드는 열이다(NODE-015, NODE-041). 이름을 유지하는 규칙은 그대로다(NODE-015, NODE-041). `isSchemaNode`는 오늘 `instanceof AbstractNode`인데 단일 클래스 `instanceof`로 바꾼다(`Symbol.for` 상표는 라이브러리 사본 둘이 서로의 노드를 참으로 판정하는 동작 변경이라 쓰지 않는다)(NODE-015). 나머지 여덟 가운데 여섯은 `isSchemaNode(x) && x.type === …`로, `isBranchNode`·`isTerminalNode`는 `x.strategy`로 둔다(NODE-015). `isTerminalNode`의 좁히기는 바로잡는다: 오늘은 잎 넷으로 좁히지만 터미널 객체·배열도 `'terminal'`이다(`src/core/nodes/filter.ts:195-198`)(NODE-015). 유지해야 하는 이유는 공개 가드 아홉, `InferSchemaNode`로 `push`가 타입 검사를 통과하는 것, 가상화의 WeakSet 키, `useChildNodeComponents`의 `isTerminalNode`다(NODE-015). 오늘 `node.group`을 읽는 소비자 다섯(`FallbackComponents/FormGroupRenderer.tsx:18`, antd5·antd6·antd-mobile·mui의 `FormGroup.tsx`)은 PR-7에서 `node.strategy`로 옮긴다(LANDING-043의 이주 행)(NODE-015).

【추론】 레코드 형에서 공개 판별 합집합으로의 변환에 형 단언을 쓰지 않는다(NODE-046). 【추론】 형은 선언 자리에서 맞춘다(NODE-046). 【추론】 `record/`의 `SchemaNodeRecord`는 자기 형을 매개변수로 받고(`SchemaNodeRecord<Self>`), `navigation/`의 `find`·`findNodes`는 `Self`에 대해 제네릭이다(NODE-046). 【추론】 클래스 `SchemaNode`는 종류 매개변수 `T`를 갖고 `type`·`value` 게터를 `T`로 좁힌다(NODE-046). 【추론】 `parent`·`structure`는 종류별 인스턴스 형의 합집합(`AnyNode`)으로 선언해 `SchemaNodeRecord<AnyNode>`를 구현한다(NODE-046). 【추론】 그래서 종류별 인스턴스 형이 공개 합집합의 구성원에 구조적으로 대입된다(NODE-046). 【추론】 레코드를 넘겨받는 공개 메서드는 `this: AnyNode` 매개변수로 선언한다(NODE-046). 【추론】 생성은 종류별 생성 표가 `AnyNode`를 돌려준다(NODE-046). 【추론】 `InferSchemaNode<Schema>`로의 좁힘은 overload 선언으로 한다(NODE-046).

**이름 규칙.**(NODE-011) 종류·역할 낱말이 앞에 붙은 공개 형과 가드(`ArrayNode`, `isArrayNode` 등)는 그 이름을 두고, 맨앞에 홀로 선 `Node`만 쓰지 않는다(NODE-011, SURFACE-056). `Node`로 줄여 부르는 것은 한 형의 필드나 한 모듈 안의 지역 이름처럼 아주 좁은 이름공간에서만 한다(전역 `Node`와 헷갈리지 않게)(NODE-011). 그래서 형은 `SchemaNodeRecord`·`SchemaNodeRuntime`·`SchemaNodeFactory`, 모듈 수준 함수는 `schemaNodeFactory`이고, 런타임 안의 필드처럼 좁은 자리에서만 `nodeFactory`로 줄인다(17라운드 소유자 답)(NODE-011).

【추론】 정본 문서 주석은 그 멤버를 선언한 인터페이스에 둔다(NODE-049). 【추론】 공개 멤버는 `SchemaNode/type.ts`, 레코드 필드는 `record/`의 `SchemaNodeRecord`다(NODE-049). 【추론】 클래스는 `/** {@inheritDoc <인터페이스>.<멤버>} */`로 가리킨다(NODE-049). 【추론】 정본 주석은 매개변수, 결과, 목적, 실패 조건, 부수 효과를 모두 적는다(NODE-049). 【추론】 클래스 쪽의 한 줄 `{@inheritDoc}`로 저장소 주석 규칙 §4("Every declaration the form reaches carries one")를 충족한 것으로 본다(NODE-049). 【추론】 클래스 쪽에 같은 설명을 다시 적지 않는다(NODE-049). 【추론】 관례는 `SchemaNode/DETAIL.md`에 적는다(NODE-049). 【추론】 결과로 겉면 파일은 250–350줄 쪽이 된다(NODE-049).

### 1.6 터미널 전략의 판정

가상 노드는 인라인 입력을 두어도 전략이 `branch`이고 참조 노드의 `ChildNodeComponents`를 받으며, 암묵 터미널은 두 행을 가진 종류(object·array)에만 있다(NODE-027, NODE-047). 소유자: "브랜치 노드의 터미널 전략이 압도적으로 저렴해서, 사용자가 되도록 터미널 전략을 쓰게 하려고 설계한 방법. 1종 오류를 감수하고 2종 오류를 배제한 선택."(NODE-027) 터미널 전략의 object·array는 자식 없이 값을 직접 들고(VALUE-004), 노출 표면은 branch 전략과 같다(NODE-027). 소유자는 이 방식이 난해하면 끊어도 된다고 했다(그러면 터미널로 쓰려는 사용자가 `terminal: true`를 명시한다)(NODE-027). 끊지 않는다(확정 근거: 소유자 답, `reviews/round-17-owner-answers.md:12` 통보 1)(NODE-027).

**암묵 규칙 유지, 판정은 렌더 계층으로.**(NODE-028) 인라인 `presentation.FormTypeInput`이 **있고 `null`이 아닌지**를 보는 판정은 렌더 계층(React 바인딩)의 판정 함수가 하며, 렌더 계층이 이 함수를 청사진에 넘긴다(NODE-028). 판정 함수는 선언 하나를 받아 셋 가운데 하나를 돌려준다(NODE-028). 참(인라인 `presentation.FormTypeInput`이 있고 `null`이 아님), 거짓(그 키의 값이 `null`), 없음(그 키가 없거나 값이 `undefined`)이다(NODE-028). 없음은 앞 선언의 판정을 지우지 않으며(병합표의 `undefined`와 같다), 키 이름은 판정 함수만 안다(NODE-028). 청사진은 한 노드의 터미널 전략을 `options.terminal`(명시, 양방향) → 넘겨받은 판정 → `type`의 순서로 정한다(NODE-028). 이 순서는 두 행을 가진 종류(object·array)에만 적용되고, 행이 하나인 종류는 전략을 그 행에서 정한다(NODE-028, NODE-047). core는 `presentation` 안의 키를 읽지도 해석하지도 않으므로(원리 P5(core는 렌더러를 모른다), GOAL-031) core만 쓰는 호스트에는 암묵 규칙이 없다(NODE-028). 판정을 렌더 계층으로 옮기므로 core가 React 구성 요소를 판정하는 자리(`getNodeGroup.ts`의 `isReactComponent`)는 사라진다(NODE-028). 터미널 조건을 "있고 null이 아니다"로 넓히면 `React.lazy`의 결과나 설정 객체도 서브트리를 접는다(NODE-028). `formTypeInputMap`은 트리 생성 뒤 렌더 계층에서 해석되므로 같은 컴포넌트가 인라인이면 터미널을 만들고 경로 매핑이면 만들지 않는다(NODE-028).

양방향 재정의는 객체·배열에서만 뜻이 있고, 잎의 `false`·가상의 `true`는 청사진 오류다(NODE-030, NODE-047). `terminal: false` — 꽂은 입력이 `ChildNodeComponents`를 쓴다(NODE-030). `terminal: true` — 컴포넌트 없이도 터미널로 쓴다(NODE-030). 오늘도 `terminal: true`와 `terminal: false`가 양방향으로 있다(`getNodeGroup.ts:20-21`)(NODE-030).

**혼란스러운 경우를 드러낸다.**(NODE-031) 터미널이 된 노드의 입력이 비어 있는 `ChildNodeComponents`를 읽으면 개발 모드에서 경고한다(목표 C2(작성자 실수의 가시성), GOAL-015)(NODE-031).

【추론】 (1) 청사진이 정적으로 정한다: 한 노드의 전략은 청사진이 그 노드의 선언에서 정적으로 정한다(NODE-042). 【추론】 (2) 셈에 드는 선언: 게이트 없는 선언(본체, 게이트 없는 `allOf` 항목)과 게이트 가진 선언이다(NODE-042). 【추론】 게이트 없는 `oneOf`·`anyOf` 분기의 선언은 그 노드의 유일한 선언일 때만 든다(NODE-042). 【추론】 (3) 경우의 정의: 경우는 조각 중첩을 지키는 켜짐 조합이다(NODE-042). 【추론】 게이트 없는 선언은 늘 켜지고, 중첩 조각 안의 선언은 그것을 감싸는 게이트 가진 조각이 모두 켜져야 켜진다(NODE-042). 【추론】 각 경우에 켜진 선언들로 `options.terminal`(전순서에서 나중 것) → 렌더 계층 판정(없음이 아닌 결과 가운데 나중 것) → `type`의 순서로 전략을 정하고, 경우마다 다르면 청사진 오류(`TERMINAL_STRATEGY_MISMATCH`)다(NODE-042). 【추론】 (4) 축약 비교: 경우를 모두 열거하지 않는다(NODE-042). 【추론】 게이트 없는 선언이 있으면 그것만 켜진 경우 하나를 두고, 게이트 가진 선언 d마다 '게이트 없는 선언 ∪ d를 감싸는 게이트 가진 조각들이 이 노드에 둔 선언 ∪ d'가 켜진 경우를 둔다(NODE-042). 【추론】 이것들을 비교하면 가능한 모든 경우를 비교한 것과 같다(NODE-042). 【추론】 검사 비용은 노드마다 선언 수와 중첩 깊이의 곱을 넘지 않는다(NODE-042).

【추론】 `BEHAVIORS[type]`의 행이 하나인 종류는 전략을 그 행에서 정하고 렌더 계층 판정을 묻지 않는다(NODE-047). 【추론】 잎(string·number·boolean·null과 BLUEPRINT-043의 (가칭) `union`)은 `terminal`, 가상은 `branch`다(NODE-047). 【추론】 그래서 가상에 둔 인라인 `presentation.FormTypeInput`은 그 입력으로 그려지되 전략은 `branch`이고, 입력은 참조 노드의 `ChildNodeComponents`를 받는다(쓰지 않아도 된다)(NODE-047). 【추론】 가상은 `branch`이므로 ERROR-185의 경고(터미널 노드의 입력이 빈 `ChildNodeComponents`를 읽을 때의 개발 모드 경고)는 가상 노드에 적용되지 않는다(NODE-047). 【추론】 행이 하나인 종류에 그 행과 다른 `options.terminal`을 적으면 청사진 오류다(잎의 `false`, 가상의 `true`)(NODE-047). 【추론】 같은 값(잎의 `true`, 가상의 `false`)은 오류가 아니다(NODE-047). 【추론】 `options.terminal`의 양방향(NODE-030)과 NODE-028의 판정 순서는 두 행을 가진 종류(object·array)에만 뜻이 있다(NODE-047).

### 1.7 가상 노드

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

### 1.8 탐색과 형상을 떠난 노드

【추론】 형상에 없는 노드는 트리에 인스턴스가 없다(NODE-043). 【추론】 그 원본은 루트가 잠복 원본으로 (절대 경로, 종류)를 키로 든다(NODE-043). 【추론】 형상을 떠난 노드의 옛 참조는 NODE-044가 정한다(NODE-043). 【추론】 branch 객체의 `structure`는 이름에서 그 커밋의 형상에 있는 자식 노드로 가는 맵이다(NODE-043). 【추론】 자식 선언의 신원 (이름, 종류)은 청사진이 선언을 무리 지을 때와 `settle`이 어느 종류의 노드를 살릴지 정할 때 쓴다(NODE-043). 【추론】 한 커밋에서 한 이름에 형상에 있는 노드는 많아야 하나이므로(같은 이름·다른 종류가 동시에 켜지면 충돌이고, 전순서에서 앞선 종류만 산다) 맵의 키는 이름으로 충분하다(NODE-043).

【추론】 `find`·`findNodes`·트리 걷기는 형상에 있는 노드만 돌려준다(NODE-043). 【추론】 형상에 없는 노드를 지나는 경로는 `find`가 `null`, `findNodes`는 항목 없음이다(NODE-043). 【추론】 터미널 아래 경로와 같은 규칙이다(NODE-043). 【추론】 비활성 자식까지 담는 `subnodes`는 레코드에도 공개 겉면에도 두지 않는다(NODE-043). 【추론】 `detectsCandidate`와 그 시험, 첫 후보로 물러나는 규칙, 내부 칸 `variant`·`scope`·`oneOfIndex`·`anyOfIndices`는 모두 폐기한다(NODE-043).

【추론】 `find`는 경로의 마디마다 현재 노드의 자식 집합을 이름으로 따라간다(NODE-054). 【추론】 노드 종류마다 특수 경로를 두지 않는다(NODE-054). 【추론】 참조 그룹(가상 노드)의 자식 집합은 참조된 형제 노드다(NODE-054). 【추론】 그래서 `find('/period/startDate')`는 `/startDate` 노드 그 자체를 돌려준다(NODE-054). 【추론】 돌려준 노드의 `path`는 `/startDate`다(NODE-054). 【추론】 그 노드에 한 쓰기는 가상 노드가 나눠 쓰는 것과 같은 곳에 닿는다(NODE-054). 【추론】 한 노드에 두 경로로 닿는 것은 참조 그룹을 거칠 때뿐이다(NODE-054). 【추론】 정본 경로는 `node.path`다(문서화)(NODE-054).

【추론】 터미널 노드는 자식 집합이 없으므로, 같은 규칙으로 노드 없음이다(NODE-020과 일치)(NODE-054). 【추론】 가상 노드는 늘 `branch`이므로(NODE-047) 인라인 `FormTypeInput`을 둔 가상 노드 아래 경로도 참조된 노드를 돌려준다(NODE-054). 【추론】 `options.terminal: true`를 둔 가상 노드는 청사진 오류이므로(NODE-047) 터미널 가상 노드는 없다(NODE-054). 【추론】 인라인 입력 없는 가상 노드 아래의 `find`는 오늘과 같아 이주 행이 없다(NODE-054).

터미널 노드 아래의 경로는 `find`와 `findNodes` 모두 노드 없음으로 답한다(NODE-020). 노드가 없으므로 `null`을 돌려준다(NODE-020). 반환 타입 `SchemaNode | null`은 그대로다(NODE-020). **행동 변화이므로 이주 안내 대상이다**(NODE-020).

【추론】 형상을 떠난 노드는 떼어진다(detached)(NODE-044). 【추론】 트리는 그 노드를 버리고, 루트는 그 원본을 잠복 원본으로 (절대 경로, 종류)를 키로 든다(NODE-044). 【추론】 소비자가 든 옛 참조는 읽을 수 있다(NODE-044). 【추론】 떼어진 노드의 읽기 멤버는 모두 그 노드가 형상에 있던 마지막 커밋의 값을 돌려주고, 그 뒤로 바뀌지 않는다(NODE-044). 【추론】 옛 참조로 한 쓰기도 이 읽기를 바꾸지 않는다(쓴 값은 루트의 잠복 원본에 있다)(NODE-044).

【추론】 구조 읽기(`children`, 상대 경로의 `find`·`findNodes`)는 그 노드와 함께 떼어진 하위 트리를 본다(NODE-044). 【추론】 예외로 `rootNode`는 살아 있는 루트이고, 트리 전체를 읽는 `globalState`·`globalErrors`도 살아 있는 런타임을 읽는다(NODE-044, SURFACE-053). 【추론】 그래서 절대 경로는 살아 있는 트리에서 풀린다(NODE-044).

【추론】 있던 구독은 유효하다(구독 해제가 된다)(NODE-044). 【추론】 다시 발화하지는 않는다(NODE-044). 【추론】 명령(`focus`·`select`·`refresh`·`remount`)과 상태 진입(`setSubtreeState`·`clearSubtreeState`)은 아무것도 하지 않는다(NODE-044).

【추론】 옛 참조로 한 쓰기는 오류가 아니다(NODE-044). 【추론】 그 쓰기는 루트의 그 (경로, 종류) 잠복 원본을 고치고, 규칙을 평가하지 않으며, 아무것도 내지 않는다(NODE-044). 【추론】 그래서 순차 쓰기와 묶음 쓰기가 같은 원본에 닿는다(NODE-044). 【추론】 노드가 다시 형상에 들면 새 인스턴스를 만든다("재탄생은 새 삶", WRITE-007)(NODE-044). 【추론】 옛 참조는 떼어진 채로 남는다(NODE-044). 【추론】 `SCHEMA_FORM_ERROR.DISPOSED_NODE_WRITE`(가칭)는 재생성 `reset`이 버린 트리의 노드에 대한 쓰기에만 남긴다(NODE-044).

### 1.9 배열 아이템과 튜플

【추론】 ㄱ 통째 쓰기의 identity는 위치로 재조정한다(NODE-051). 【추론】 대상은 branch array에 값을 통째로 쓰는 모든 쓰기다: 로드, `setValue(V)`, `Merge`가 통째로 준 배열, 입력 쓰기, `controls.injectTo`·`controls.derived`의 대상이 된 배열(NODE-051). `setValue(V)`는 로드가 아니라 전체 교체 쓰기이고, 로드는 마운트·`FormHandle.reset()`·`resetSubtree()`뿐이다(NODE-051, WRITE-090). 【추론】 이런 쓰기는 아이템 노드를 다시 만들지 않고 위치로 잇는다(NODE-051). 【추론】 새 값의 i번째 아이템은 쓰기 시점 identity 목록의 i번째 노드와 그 키(`#n`)를 이어 받고, 그 노드의 원본을 새 값으로 쓴다(NODE-051). 【추론】 새 값이 더 길면 뒤의 아이템은 새 키로 생긴다(NODE-051). 【추론】 더 짧으면 남는 노드는 소멸한다(WRITE-036: 나감이 아니다)(NODE-051). 【추론】 키를 바꾸는 것은 구조 연산(`push`·`remove`·`insert`류)뿐이다(NODE-051).

【추론】 생김의 판정은 identity와 따로이며, 쓰기 종류의 기존 규칙을 따른다(NODE-051). 【추론】 로드는 형상의 모든 노드를 생긴 노드로 친다(NODE-051, SETTLE-046). 【추론】 로드가 아닌 통째 쓰기(`Merge`의 배열, 입력 쓰기 등)에서는 직전 커밋의 형상에 없던 키만 생긴 노드로서 채움을 받는다(NODE-051). 【추론】 곧 새로 만든 뒤쪽 아이템이다(NODE-051). 【추론】 이것이 WRITE-015 `Merge` 행이 미룬 "어떤 아이템이 생긴 것인가"의 답이다(NODE-051).

【추론】 통째 쓰기 뒤에는 `dirty`·`touched`, 바깥 오류, 가상화 기록, 컨테이너 입력의 비값 상태, 소비자가 든 노드 참조가 데이터가 아니라 위치를 따라간다(NODE-051). 【추론】 입력의 초기화는 identity가 아니라 Refresh 규칙이 맡는다(NODE-051). 【추론】 로드는 모든 노드에 Refresh를 내므로(REACT-019·WRITE-048) 잎 입력은 어차피 다시 마운트된다(NODE-051). 【추론】 그래서 포커스를 지키는 이득(계승 제약 T-22(배열 아이템의 React key는 생성 순서의 nonce))은 로드가 아닌 통째 쓰기에만 있다(NODE-051, GOAL-073).

【추론】 ㄹ 튜플에서 자리 i의 아이템 청사진은 두 경우로 나뉜다(NODE-052). 【추론】 i가 `prefixItems` 길이보다 작으면 `prefixItems[i]`다(NODE-052). 【추론】 아니면 `items`가 스키마일 때 `items`이고, 옛 철자 `items: [..]`이면 `additionalItems`다(NODE-052). 【추론】 자식 집합은 값의 길이 × 자리별 청사진이다(NODE-052, NODE-021). 【추론】 청사진이 없는 자리의 아이템은 노드를 만들지 않는다(NODE-052). 【추론】 닫힌 튜플의 뒤와 `items`가 없거나 `false`인 자리가 여기에 든다(NODE-052).

【추론】 배열 호스트의 `extras`는 아이템 청사진이 없는 자리의 값이다(NODE-052). 【추론】 자리 순서로 들고, 선언된 아이템 뒤에 방출한다(VALUE-002 보충)(NODE-052). 【추론】 버리지도 막지도 않는다(NODE-052). 【추론】 판정은 검증기가 하고, 표시는 잔여 키처럼 렌더 계층이 맡는다(NODE-052).

【추론】 `push`·`pop`·`remove`·`update`는 자리를 기준으로 동작한다(NODE-052). 【추론】 자리가 바뀌면 값은 그 자리에 청사진이 있는지에 따라 노드와 `extras` 사이를 옮긴다(NODE-052). 【추론】 예: `prefixItems` 둘, `items: false`, 값 `[a,b,c,d]`에서 `remove(0)`을 하면 `c`는 1번 자리로 옮겨 노드가 된다(NODE-052). 【추론】 청사진 없는 자리에 대한 `push`도 core가 막지 않는다(NODE-052, WRITE-022).

【추론】 호스트 배열의 조각이 준 `items`·`prefixItems`는 그 자리의 유효 스키마에 드는 덧씌움이다(NODE-052). 【추론】 병합표는 객체와 같다(NODE-052). 【추론】 조각은 아이템이 형상에 드는지를 정하지 않는다(NODE-052). 【추론】 자리는 이름이 아니므로 빼면 뒤 자리가 밀리기 때문이다(NODE-052). 【추론】 오늘 `ArrayNode/validate.ts`의 청사진 오류(아이템 청사진이 한 자리도 없는 배열 등)는 그대로 둔다(NODE-052).

ㅁ 아이템 노드는 생길 때 모두 실체화한다(기본)(NODE-053). PR-5 시험(TEST-018)에 위치 재조정(키 유지와, 위치를 따라가는 `dirty`·`touched`·바깥 오류·가상화 기록·노드 참조), 청사진 없는 자리의 `extras` 보존, 구조 연산에서 값이 노드와 `extras` 사이를 옮기는 것을 더한다(NODE-053).

- PR: PR-5 벤치(ㅁ)(NODE-053).
- 무엇: TEST-032의 "긴 배열(아이템 10,000개) 안의 키 입력", "array 1000 루트 통째 쓰기", "노드당 메모리"를 TEST-027 게이트로 옛 판과 견준다(NODE-053).
- 통과: 옛 판보다 느리지 않거나, 느린 항목을 Vincent가 받아들인다(NODE-053).
- 실패: 지연 실체화를 넣는다(NODE-053).
- 실패: 단, 관찰 결과가 실체화 판과 같음을 PR-5 시험을 두 모드로 돌려 보인 경우에만 넣는다(NODE-053).
- 같아야 하는 것: `value`·`outputValue`·`inactiveValues`·채움·에지 발화·검증 결과 라우팅·통지·`revision`, 그리고 `find`에 관찰 가능한 부수효과가 없음(NODE-053).
- 실패: 같게 만들 수 없으면 소유자에게 올린다(NODE-053).

### 1.10 union 노드의 필드와 공개 형

가. `node.type`은 `'string'`·`'number'`·`'boolean'`·`'null'`·`'object'`·`'array'`·`'virtual'`·`'union'` 가운데 하나인 단일 문자열이며, 노드가 사는 동안 바뀌지 않는다(NODE-057). `node.nullable`은 이름과 뜻을 그대로 두며, 값은 청사진이 정적 선언만으로 정한다(NODE-057). `node.schemaType`은 이름을 그대로 두고 형을 `JSONSchemaType`과 `UnionSchemaType`의 합으로 넓히며, 새 필드는 더하지 않는다(NODE-057). 저자 원문을 그대로 옮기는 필드는 두지 않는다(NODE-057).

`schemaType`은 저자가 쓴 `type`을 그대로 옮긴 값이 아니라 계산된 허용 형 목록이며, `'null'`은 빠지고 `nullable`이 맡는다(NODE-057). 목록에 `'number'`가 함께 있으면 `'integer'`는 `'number'`에 흡수되고, 종류가 하나 남으면 스칼라이며, 형 없는 `anyOf`에서는 분기에서 계산한다(NODE-057). 【추론】 정적 선언이 하나도 없는 이름은 fold가 같은 선언끼리 노드 하나를 둔다(NODE-057). 【추론】 그 노드의 목록은 선언들 허용 집합의 합집합을 종류 규칙으로 나눈 것이며, `integer`는 모든 선언이 `integer`일 때만 남고, nullable은 OR이며, `{null}`이면 null 종류다(NODE-057).

union이 아닌 노드의 `schemaType`은 오늘과 같은 스칼라이며, number 노드는 `'integer'`를 보존하고 null 노드는 `'null'`이다(NODE-057). union 노드의 `schemaType`은 계산한 목록을 얼린 읽기 전용 배열이다(NODE-057). 그 순서는 앵커 선언에 저자가 쓴 순서이고, `'null'`은 union에서도 빠지며, 중복 원소는 청사진 오류이므로 생기지 않는다(NODE-057). 불변식은 `Array.isArray(node.schemaType) === (node.type === 'union')`이다(NODE-057). `type`·`strategy`·`nullable`·`schemaType`은 노드가 사는 동안 같은 참조이며, `schemaType` 배열은 청사진 칸마다 하나를 얼려 그 칸의 모든 노드(배열 아이템 포함)와 기본 spec이 공유한다(NODE-057). BLUEPRINT-043의 "`integer`는 `number`로 접는다"는 종류를 정할 때의 접기이고, `schemaType`은 `'integer'`를 보존한다(NODE-057).

【추론】 (6) 공개 표면: 공개 가드 (가칭) `isUnionNode`(`isSchemaNode(x) && x.type === 'union'`)를 더하고, 공개 판별 합집합과 `InferSchemaNode`에 `union` 멤버를 더한다(NODE-041). `union`은 `type`에 원시·객체·배열 가운데 둘 이상의 종류가 적힌 칸의 터미널 잎이며, 그 종류 이름은 `union`으로 확정하고 가칭을 푼다(가드 `isUnionNode`, 동작 모듈 `unionBehavior/`)(NODE-041, BLUEPRINT-036). 【추론】 `node.type`은 `'union'`, `node.strategy`는 `'terminal'`이다(NODE-041). 【추론】 그래서 공개 가드는 아홉에서 열이 된다(NODE-041).

【추론】 형 정의는 `UnionMemberType = 'string'|'number'|'integer'|'boolean'|'object'|'array'`와 `UnionSchemaType = readonly [UnionMemberType, UnionMemberType, ...UnionMemberType[]]`이다(원소 범위는 BLUEPRINT-036)(NODE-058). 【추론】 `UnionNode`의 모양은 `type: 'union'`, `strategy: 'terminal'`, `schemaType: UnionSchemaType`, `nullable: boolean`, `children: null`에 공통 멤버를 더한 것이다(NODE-058, NODE-041, SURFACE-058). 이 항목의 `valueTypeMismatch`·`valueTypeMismatches`·`VALUE_TYPE_MISMATCH`는 확정 이름 `typeMismatch`·`typeMismatches`·`SCHEMA_FORM_WARNING.TYPE_MISMATCH`로 읽는다(NODE-058, SURFACE-061). 그 확정 이름은 게터 `typeMismatch: boolean`, 경로 목록 `typeMismatches: readonly string[]`, 경고 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`다(NODE-041, NODE-058).

【추론】 `valueTypeMismatch`가 `false`인 멤버의 `value`는 `string | number | boolean | ObjectValue | ArrayValue | undefined`이고, nullable이면 `| null`이 붙는다(NODE-058). 【추론】 `valueTypeMismatch`가 `true`인 멤버의 `value`는 `unknown`이다(NODE-058). 【추론】 노드 형에는 제네릭을 두지 않으며, 목록 형으로 좁히는 것은 `FormTypeInputProps`가 맡는다(NODE-058).

【추론】 union 노드의 `FormTypeInputProps`에서 `value`와 `onChange`는 일부러 다른 형이다(NODE-058). 【추론】 props의 `value`는 `UnionNode.value`와 같은 판별 모양이다: `valueTypeMismatch === false`이면 목록 종류의 값, `undefined`, (nullable이면) `null`이고, `true`이면 `unknown`이다(NODE-058). 【추론】 props의 `onChange`는 목록 종류의 값, `undefined`, 그리고 nullable일 때만 `null`을 받는다(NODE-058).

【추론】 종류별 공개 형은 `schemaType`을 좁힌다: `StringNode`는 `'string'`, `NumberNode`는 `'number'|'integer'`, `BooleanNode`는 `'boolean'`, `NullNode`는 `'null'`, `ObjectNode`는 `'object'`, `ArrayNode`는 `'array'`, `VirtualNode`는 `'virtual'`, `UnionNode`는 `UnionSchemaType`이다(NODE-058, NODE-015, NODE-046). 【추론】 공개 가드 `isUnionNode(x) = isSchemaNode(x) && x.type === 'union'`을 더한다(이름은 NODE-041)(NODE-058). 【추론】 `isTerminalNode(unionNode)`는 참이고 그 반환 형 합집합에 `UnionNode`가 들어가며, `isBranchNode(unionNode)`는 거짓이다(NODE-058, NODE-041). 【추론】 새 설계에서 두 가드는 `strategy`를 본다(NODE-058). 【추론】 "목록에 X가 있는가"를 묻는 공개 가드는 두지 않는다: `isUnionNode(n) && n.schemaType.includes('integer')`로 충분하다(seiri public-contract §1)(NODE-058).

【추론】 `JSONSchemaWithVirtual`에 `UnionSchema`를 더하며, 모양은 `type`이 `UnionMemberType | 'null'`의 읽기 전용 배열인 것과 `type` 없이 `anyOf`·`oneOf`가 필수인 것의 둘이다(NODE-058). 【추론】 `InferSchemaNode`와 `InferValueType`은 BLUEPRINT-044의 런타임 절차를 비추며, 청사진 오류가 되는 모양은 형 수준에서도 무효이고, 형 수준이 판정할 수 없는 모양은 넓은 형으로 둔다(NODE-058).

【추론】 `type` 배열을 접은 집합의 원소가 2개 이상이면 `InferSchemaNode`는 `UnionNode`이고, `InferValueType`은 원소 값 형의 합(nullable이면 `| null`)이다(NODE-058). 【추론】 접은 집합의 원소가 1개이면 그 종류의 노드와 그 형(nullable이면 `| null`)이다(NODE-058). 【추론】 `type` 배열이 `'null'`만이거나 형 없는 칸의 분기가 모두 null 분기이면 `NullNode`와 `null`이다(NODE-058). 【추론】 형 없는 `anyOf`·`oneOf`의 모든 분기가 원시 형을 가지면 분기 형을 모아 위 두 줄과 같이 사상하고, 값 형은 분기 값 형의 합이다(NODE-058).

【추론】 형 없는 분기(`const`·`enum`만 있는 것 포함)와 객체·원시 혼합 분기는 `never`와 `unknown`이다(NODE-058). 모든 분기가 인라인 객체(또는 배열)인 형 없는 칸은 `ObjectNode`(또는 `ArrayNode`)와 분기 값 형의 합이고, 분기 없는 `const`·`enum` 칸은 리터럴 형이며, 형 없는 분기와 혼합 분기는 그대로다(NODE-058, NODE-059). 【추론】 `$ref`, 게이트 가진 분기, `oneOf`와 `anyOf`가 함께 있는 칸, 본체에 붙은 `allOf`는 넓은 `SchemaNode`와 오늘 규칙의 값 형이다(NODE-058).

【추론】 `src/types/value.ts`의 `NormalizeType`을 지우고 winglet의 `InferValueType`에 스키마를 그대로 넘긴다(NODE-058). 【추론】 union 칸에 `enum`이 있으면 `InferValueType`은 목록 종류들의 값 형과 enum 리터럴 형의 교집합이며, 리터럴의 JSON 종류가 목록(+nullable)에 있는 것만 남는다(예: `['number','string']` + `enum:[1,'a',true]`는 `1 | 'a'`)(NODE-058). 【추론】 `InferJSONSchema<Value>`가 분배되지 않게 고쳐, 값의 null이 아닌 범주(string·number·boolean·object·array, 리터럴 합은 한 범주)가 둘 이상이면 `UnionSchema`로 사상한다(NODE-058). 【추론】 그래서 `FormTypeInputProps<string|number>`의 `node`는 `UnionNode`다(NODE-058).

【추론】 유효 목록은 노드마다 유효 스키마 메모가 같은 동안 같은 참조이고, 좁히는 게이트가 없으면 `schemaType`과 같은 참조다(NODE-058). 【추론】 `jsonSchema`는 켜진 덧씌움 집합이 같은 동안 같은 참조다(NODE-058). 【추론】 `value`와 `valueTypeMismatch`는 커밋 사이에 같은 참조이며, 객체·배열 값은 변환하지 않으므로 참조가 그대로이고, 같은 원본이면 방출도 같은 참조다(NODE-058, VALUE-012, VALUE-030).

- PR: PR-2(노드 형)·PR-7(공개 수출)(NODE-058).
- 무엇: tsc 전용 `src/types/__tests__/union.type-test.ts`가 위 사상, `InferValueType`·`InferJSONSchema`의 형, union props의 `value`(판별)와 `onChange`(목록 형)를 단언하고, `union.schema-type-invariant.test.ts`가 같은 칸의 노드와 배열 아이템의 `schemaType` 참조가 같고 얼려 있음을 단언한다(NODE-058).
- 통과: 모든 사상이 위대로이고 tsc와 시험이 통과한다(NODE-058).
- 실패: 형 수준이 런타임 절차와 다른 답을 내면 그 모양을 넓은 형으로 두고, 넓혀도 어긋나면 이 블록을 고친다(NODE-058).

【추론】 `InferSchemaNode`·`InferValueType`은 분기가 모두 인라인 객체(또는 배열) 스키마인 형 없는 `oneOf`·`anyOf`를 `ObjectNode`(또는 `ArrayNode`)로 두고, 값 형은 분기 값 형의 합(null 분기가 있으면 `| null`)이다(NODE-059). 【추론】 NODE-058의 "`$ref`, 게이트 가진 분기, `oneOf`와 `anyOf`가 함께 있는 칸, 본체에 붙은 `allOf`는 넓은 `SchemaNode`와 오늘 규칙의 값 형이다"는 그대로다(NODE-059). 【추론】 `InferValueType`은 이 칸을 `const`의 리터럴 형이나 `enum` 원소의 합(null 리터럴이 있으면 `| null`)으로 좁히고, `InferSchemaNode`는 U가 정한 종류의 노드다(NODE-059, BLUEPRINT-050).

## 2. 값

### 2.1 노드 트리가 곧 상태, 노드가 드는 칸

**1. 별도의 데이터 모델을 두지 않는다(VALUE-001). 노드 트리가 곧 상태다(VALUE-001).**

소유자 답: "중앙에 값을 두는 걸 허용. 단, 데이터모델을 따로 두는 건 안 돼. react 파이버처럼 node가 동작하도록 했으면 해. 최적화와 라이프사이클 관점에서의 단일화는 동의해."(VALUE-001)

**2. 노드가 드는 칸은 열이고, 그 가운데 상태는 둘뿐이다(VALUE-002).**

(VALUE-002, VALUE-003)

| 칸 | 종류 | 내용 |
| -- | ---- | ---- |
| `raw` | 상태 | 원본. 리프와 터미널 노드가 값을 든다. 자식이 있는 노드는 잘못된 종류의 값(`null`, `17`)이 왔을 때만 든다 |
| `extras` | 상태 | 호스트가 받은, 어떤 조각에도 선언되지 않은 키와 값, 그리고 그 순서(E16). 순서는 받은 순서이며 ECMAScript own-key 순서를 따른다 |
| `active` | 계산 | 이번 커밋의 활성 조각·노드 집합 |
| `local` | 계산 | 활성 자식 `emit`의 합성 — 투영 전 |
| `emit` | 계산 | `local`의 투영 |
| `schema` | 계산(메모) | 노드의 유효 스키마 — 켜진 조각을 병합한 것 |
| 재계산 목록 | 작업 | 이번 정착에서 다시 계산할 자식의 목록. 상호작용 상태 `dirty`와 다른 것이다 |
| `revision` | 원장 | 통지 원장. 커밋 때 일괄 갱신한다(F16) |
| 커밋 번호 | 원장 | 검증 결과의 스탬프. 오래된 결과를 버린다(F28) |
| `diagnostics` | 작업 | 마지막 로드 이후의 작업 기록(ERROR-130. 지속은 14라운드 답 O-2 가). `status`는 `'stable'` 또는 `'degraded'`이고 `cause`를 든다. `degraded` 동안 폼의 제출 경로가 거부한다(17라운드 소유자 답 R17-1 나). 루트에서 관측한다 |

**상태는 `raw`와 `extras` 둘뿐이다**(원리 P3(형상은 상태의 순수 함수다), VALUE-002). 나머지는 상태에서 계산되거나 작업의 기록이다(VALUE-002). "노드 트리가 곧 상태"는 이 둘을 노드가 소유한다는 뜻이다(VALUE-002). 폼은 `oneOf`·`anyOf`로 분기를 고르지 않으므로(원리 P1′(폼이 스키마에서 읽는 것은 노드 트리의 모양을 정하는 문법뿐)) 수동 분기 선택을 담을 칸이 없다(VALUE-002).

`extras`는 호스트가 받은, 청사진 어디에도 선언되지 않은 키와 그 순서다(VALUE-002). `if` 안에만 적힌 키는 선언이 아니므로 `extras`다(VALUE-002). `extras`는 호스트가 받은, 청사진 어디에도 선언되지 않은 키와 그 순서다(정적. if 안에만 적힌 키도 여기, VALUE-002). 조각이 선언한 키는 그 조각이 모두 꺼지면 잠복 원본이며 게이트도 검증기도 보지 않는다(원리 P1(판정은 검증기의 것이다)·원리 P4(방출은 정책이다), 14라운드, VALUE-002). `schema`는 같은 조각 집합이면 같은 참조다(VALUE-002). 【추론】 경고등은 VALUE-002의 분류로 '계산' 칸이다(VALUE-002). 【추론】 배열 호스트의 `extras`는 아이템 청사진이 없는 자리의 값이다(VALUE-002). 【추론】 자리 순서로 들고, 선언된 아이템 뒤에 방출한다(VALUE-002).

`diagnostics`는 마지막 로드 이후의 기록('stable' 또는 'degraded', cause(예산·식·대상·공유 충돌), exceededBudget, iterations, commit)이고, 다음 로드까지 남고 그 동안 제출 경로가 거부하며, 작업의 기록으로 루트에서 관측한다(VALUE-003, ERROR-130). 【추론】 `diagnostics`와 경고 중복 키는 폼 수준 로드(마운트, `FormHandle.reset()`)에서만 초기화한다(VALUE-003, ERROR-204). 【추론】 `setValue(V)`와 `resetSubtree()`는 초기화하지 않는다(VALUE-003, ERROR-204).

**상호작용 상태** `dirty`·`touched`는 현행 유지다(목표 후보 C6(편집 중 상태의 보존과 격리), VALUE-022, GOAL-019).

**3. 저장되는 값은 자식 노드가 없는 노드에만 있다** — 터미널 타입(string·number·boolean·null)과 터미널 전략의 object·array. 자식 노드가 있는 노드의 값은 자식들로부터 계산되어 **그 노드에 메모된다**(VALUE-004). 자식이 있는 노드는 잘못된 종류의 값(`null`, `17`)이 왔을 때만 든다(VALUE-004).

**4. 노출 표면은 전략과 무관하게 같다(VALUE-005).** `value`, `setValue`, 구독, 이벤트는 자식 노드의 유무에 따라 달라지지 않는다(VALUE-005). 경로 조회도 같다(VALUE-005).

그 결과 레벨마다의 사본, `__draft__`/`__composed__`의 지연 합성, 상향 콜백 그래프, 역류 방지 잠금이 필요 없어진다(VALUE-016).

버린 대안은 다음 셋이며, 어느 것도 택하지 않는다(VALUE-023).

- **1차안 — 루트가 소유하는 JSON 값 트리, 노드는 뷰.**(VALUE-023) 적대적 검토 R12로 기각(VALUE-023).
- **루트가 소유하는 셀 테이블 + 필요할 때 만드는 손잡이 노드.**(VALUE-023) 소유자가 별도의 데이터 모델을 거부했다(VALUE-023). 큰 배열에서 노드 생성을 늦추는 최적화는 이 결정 안에서도 가능하다 — 자식 노드가 실체화되기 전까지 array 노드가 터미널처럼 값을 직접 든다(VALUE-023). 필요 여부는 벤치마크로 정한다(NODE-053, VALUE-023).
- **노드별 소유를 유지하고 사본 동기화를 고친다.**(VALUE-023) 복잡함의 원인이 남는다(VALUE-023).

### 2.2 방출과 값 읽기

**7. 불변식은 `emit`에만 있다**(E9): 부모의 `emit` = 활성 자식 `emit`의 투영. `raw`에는 그런 불변식이 없다 — 형상에 없는 노드와 비객체 호스트 아래 자식의 원본은 부모의 `emit`에 나타나지 않는다(VALUE-009).

**8. 값 읽기는 셋이다**(S9, SURFACE-050, VALUE-027).

(VALUE-027, VALUE-029)

| 칸 | 공개 이름 | 뜻 |
| -- | --------- | -- |
| `local` | `node.value` | 합성 값. 투영 전 |
| `emit` | `node.outputValue` | 방출 값. 오늘의 `normalizedValue`의 이름 변경. `FormHandle.getValue()`는 루트의 `outputValue`와 같다 |
| 형상에 없는 노드의 `raw` | `node.inactiveValues` | 잠복 원본 열거는 루트 노드의 함수이고 노드마다 getter `inactiveValues`다 |

원본 칸 `raw`에는 공개 이름이 없다(VALUE-027). `enhancedValue`는 새 모델에 자리가 없어 사라진다(VALUE-027). 노드에 `getValue()` 메서드는 따로 두지 않는다(`node.value`와 뜻이 다르면 이름만 보고 속는다, VALUE-027).

`value`(local)는 **활성** 자식의 방출 값만 합성한 것이라 꺼진 분기의 값은 `value`에도 없다(VALUE-027). 꺼진 분기의 노드는 형상에 없어 그 입력 구성 요소는 그려지지 않으며, 그 원본은 잠복 원본으로만 남고, 잠복 원본 열거는 루트 노드의 함수이고 노드마다 getter `inactiveValues`다(VALUE-027, VALUE-029). `value`와 `outputValue`의 차이는 투영뿐이다(VALUE-027). 투영은 `omitEmpty`·`omitTrailing`처럼 원본을 건드리지 않고 방출에서 빈 값·꼬리 값을 빼는 규칙이다(VALUE-027, VALUE-008, VALUE-009). 꺼진 분기와 게이트가 거짓인 노드는 투영이 아니라 형상에서 빠지는 것이라 `value`에도 없다(VALUE-027). 그래서 입력 구성 요소가 받는 `value`는 활성 분기와 무관하게 보이지 않는다(VALUE-027).

**9. `emit`의 참조**는 (자식 `emit` 참조 ∪ `extras` ∪ 호스트 `raw` ∪ 활성 키 집합) 가운데 하나라도 바뀌면 새로 만들고, 아니면 이전 참조를 그대로 둔다(F9, VALUE-012). "같은 값을 두 번 읽으면 같은 참조"가 이것으로 성립한다(VALUE-012). 【추론】 (나) 커밋 단계에서, 이번 정착에 쓰인 잎의 `raw`·`extras`가 직전 커밋의 것과 (가)로 같으면 직전 참조를 둔다(VALUE-012, VALUE-021). 【추론】 쓰기 경계에서 지금 값과 같으면 쓰지 않는 것은 오늘과 같다(VALUE-012). 【추론】 호스트의 `emit`은 VALUE-012대로 만든다(VALUE-012). 【추론】 새로 만든 것이 직전 커밋의 것과 키 목록(순서 포함)도 같고 키마다의 자식 `emit` 참조도 같으면 직전 참조를 둔다(얕은 비교, 재계산 목록의 호스트만, VALUE-012).

`injectTo`의 에지와 `onChange`의 "같은 값이면 통지 없음"은 한 장치이고(목표 G4(하나의 개념에는 하나의 장치)), 참조 비교가 아니라 값 비교다(VALUE-021). 【추론】 (가) "값이 바뀌었다"는 하나의 판정(가칭 `sameValue`, 내부)으로 본다(VALUE-021).

"노드의 메모는 루트 스냅숏의 해당 부분과 같은 참조"는 `omitEmpty`·`omitTrailing`이 투영을 바꾸는 노드에서 거짓이므로, 구조 공유는 `emit` 사이에서만 말한다(VALUE-028).

**10. 읽기는 계산하지 않는다(VALUE-013).** 메모를 쓰는 곳은 작업 루프의 커밋 단계뿐이고(SETTLE-006), 무효화 수단은 조상 방향의 재계산 목록 등록 하나다(VALUE-013).

`extras`는 받은 순서대로 방출된다(P4, 목표 G8(보편적인 관행을 따른다), VALUE-010). 받은 순서이며, 전체 교체는 V의 키 순서를 따르고, `Merge`는 있는 키를 제자리에 두고 새 키를 뒤에 붙인다(VALUE-010). 정수 모양 키(`"2"`, `"10"`)는 ECMAScript가 어떤 순서 규칙에서든 앞에 오름차순으로 놓는다(VALUE-010).

(VALUE-014)

| 동작 | 비용 |
| ---- | ---- |
| `node.value` 등 모든 읽기 | 필드 접근. 계산 없음 |
| 쓰기 1회 | 경로의 각 레벨에서 얕은 복사 한 번. 실측: 키 1,000개 객체 1.1 µs, 아이템 10,000개 배열 2.7 µs. 형제 서브트리는 참조를 재사용한다 |
| 재계산 목록에 없는 서브트리 | 통째로 건너뛴다 |
| 쓰기 N회의 배치 | 표시 N번, 작업 루프 1번 |
| 가드와 `controls`의 식 | **변경 키 역색인은 쓰지 않는다**(E13) — 출발점 고정에서 무효다. 유효한 최적화는 (a) 무조건 루트 키만 읽는 가드의 건너뛰기, (b) 조각 끄기의 키 제거를 `delete` 없이 하는 것, (c) 조각이 선언한 키만 패치하는 합성(F13) |

【추론】 객체 호스트의 `local`은 늘 객체다: 방출이 있는 활성 자식의 합성이고, 그런 자식이 없으면 `{}`다(FRAGMENT-016의 "자기 `{}`"와 같다, VALUE-034). 【추론】 배열 호스트의 `local`은 아이템 방출의 배열이고, 아이템이 없으면 `[]`다(VALUE-034). 【추론】 `omitEmpty`(기본 켜짐)의 투영은 빈 `local` — `''`, 키가 없는 `{}`, 아이템이 없는 `[]` — 을 방출하지 않으며, 부모의 합성은 방출이 없는 자식의 키를 두지 않는다(VALUE-034). 【추론】 `omitEmpty`를 끈 호스트는 `{}`·`[]`를 방출한다(VALUE-034). 【추론】 루트는 방출이 없을 때 루트 종류의 빈 그릇을 `outputValue`로 준다: 객체 루트는 `{}`, 배열 루트는 `[]`, 그 밖의 루트는 `undefined`다(VALUE-034). 【추론】 그래서 빈 폼의 `FormHandle.getValue()`와 마지막 칸을 비운 뒤 루트 `onChange`가 받는 값은 오늘처럼 `{}`다(VALUE-034). 【추론】 배열 아이템은 자리가 색인이므로 빠지지 않는다: 방출이 없는 객체 아이템은 `{}`, 배열 아이템은 `[]`, 잎 아이템은 `null`로 그 자리를 채운다(VALIDATE-007: 방출은 JSON 왕복과 같고 배열 중간의 `undefined`는 없다, VALUE-034). 【추론】 `omitTrailing`은 배열 꼬리에서 이렇게 채운 자리를 자른다(VALUE-034). 【추론】 이 투영은 원본과 상태를 바꾸지 않는다(P3, P4, VALUE-034).

- PR: PR-2(객체 호스트)·PR-5(배열)(VALUE-034).
- 무엇: 위 오늘 스위트의 단언과 `items.default` 없는 `push()`를 새 구현으로 돌린다(VALUE-034).
- 통과: 이 블록의 규칙대로 나오고, 오늘과 다른 곳은 LANDING-171과 이주 행이 모두 적고 있다(VALUE-034).
- 실패: 오늘과 다른데 이주 행이 없으면 행을 더하고, 규칙의 결함이면 이 블록을 고친다(VALUE-034).

### 2.3 형상과 잠복 원본

**5. 노드는 형상에 있거나 없다(VALUE-006).**

- 노드가 **형상에 있다**는 것은 그 노드를 선언한 조각이 켜져 있고 노드 자신의 `controls.active`가 거짓이 아니라는 뜻이다(VALUE-006). 노드 게이트와 조각 게이트는 한 장치의 두 범위다(VALUE-006, CONTROLS-021).
- 형상에 없는 노드의 원본은 기본으로 남는다(VALUE-006). 방출에서 빠지며, 잠복 원본 열거는 루트 노드의 함수이고 노드마다 getter `inactiveValues`다(VALUE-006, VALUE-029). 작성자나 호출자(Form 속성)가 나감 정책이 참으로 정해진 노드는 나갈 때 한 번 비운다(VALUE-006). 나감은 직전 커밋의 형상에 있었고 이번 최종 형상에 없는 것이며, 하위 트리를 포함하고 공유 노드는 제외한다(VALUE-006). 로드에는 나감이 없다(13라운드 답 2, VALUE-006, WRITE-037).

작성자나 호출자(Form 속성)가 나감 정책(`unsetOnInactive`, 소유자 13라운드 확정)이 참으로 정해진 노드가 나갈 때 한 번 원본을 비운다(VALUE-006). 형상에 없는 노드의 규칙(`controls.derived` 등)은 평가하지 않는다(VALUE-006). 나가는 객체·분기에 켠 정책은 함께 나가는 하위 트리로 내려가고, 자손이 스스로 적은 선언이 가까운 순서로 이긴다(17라운드 소유자 답 R17-2 ㄴ, VALUE-006, WRITE-033).

노드가 **생긴다**는 것은 그 노드가 직전 커밋의 형상에 없고 이번 정착의 최종 형상에 있다는 뜻이다(VALUE-035). 채움(`controls.default` > `default`)은 이 사건에만 일어난다(VALUE-035, SETTLE-005, WRITE-090). 본체나 다른 켜진 조각이 이미 두고 있던 노드는 새 조각이 켜져도 생기지 않는다(VALUE-035). `controls.visible`의 전환은 생성이 아니다(VALUE-035).

**6. 형상에서 빠지는 것은 쓰기가 아니다(VALUE-008). `null`을 포함한 전체 교체는 V에 없는 원본을 지운다(VALUE-008).** 조각이 꺼지거나 노드 게이트가 거짓이 되는 것은 **쓰기가 아니라 방출에서의 제외**이며(P4. 나감의 비움은 형상 변화가 아니라 작성자가 켠 정책의 자동 쓰기다), `omitEmpty`·`omitTrailing`도 원본을 건드리지 않는 투영 규칙이다(VALUE-008).

형상에 없는 노드의 원본은 방출되지 않으므로 검증기가 기각하지 않고 잔여 목록에도 없다 — 설계상 잠복이다(P4, VALUE-017).

- 기본 정책에서 분기 필드의 복원, `controls.active` 재활성화, null 계약이 "원본은 남고 방출에서만 빠진다" 하나로 설명된다(VALUE-025). 나가는 노드를 reset하고 들어오는 노드에 값을 복원하며 타입 호환을 검사하는 절차가 없어진다(R8, 제약 T-23(분기 복원은 자식의 원본 배열 상태를 합성 값보다 우선한다), VALUE-025, GOAL-074).
- 기본 정책에서는 입력 도중 조각이나 노드 게이트가 잠깐 꺼져도 데이터가 지워지지 않고, 다시 켜지면 마지막 입력이 돌아온다(그 노드에 `controls.derived`·`controls.unsetValue`가 없을 때. 있으면 재탄생 에지로 발화한다, VALUE-025). 나감 정책이 참으로 정해진 노드는 나갈 때 비워지므로, 다시 켜지면 생긴 노드로서 채움(`controls.default` > `default`)을 받는다(VALUE-025).

잠복 원본 열거는 **루트 노드의 함수**다(루트가 형상에 없는 노드의 원본을 들고 있으므로 저장 자리와 같다, VALUE-029). 모든 노드는 getter `node.inactiveValues`를 두고, 자기 경로로 루트의 함수를 불러 그 아래의 잠복 원본을 돌려준다(VALUE-029). `FormHandle`에는 더하지 않는다(VALUE-029). 【추론】 `node.inactiveValues`(와 그것이 부르는 루트 노드의 함수)는 읽기 전용 배열 `ReadonlyArray<{ readonly path: string; readonly value: unknown }>`을 돌려준다(VALUE-029, WRITE-087).

【추론】 ㄱ core가 스스로 잠복 원본을 파기하는 시점은 더하지 않는다(VALUE-031). `setValue(V)`는 로드가 아니지만 전체 교체 쓰기로서 V에 없는 경로의 원본(잠복 원본 포함)을 없음으로 만든다(VALUE-031, WRITE-094). 잠복 원본이 지워지는 길은 나감 정책 `unsetOnInactive`(작성자나 호출자가 켬), 로드(마운트·`FormHandle.reset()`·`resetSubtree()`), V가 그 경로를 담지 않은 전체 교체 쓰기다(VALUE-031, WRITE-090, WRITE-094). 【추론】 로드에서는 V에 없는 원본이 없음이 되므로, 잠복 원본도 V의 값으로 바뀌거나 지워진다(VALUE-031). 【추론】 이 밖에는 ㅁ의 쓰기가 그 경로에 없음을 쓸 때뿐이다(VALUE-031). 【추론】 형상에 없는 노드의 규칙은 평가하지 않으므로 `controls.unsetValue`는 잠복 원본을 지우지 못한다(VALUE-031).

【추론】 제출 후 파기는 두지 않는다(VALUE-031). 【추론】 core는 제출을 모르고, 파기는 폼이 스스로 값을 지우는 일이 되기 때문이다(VALUE-031). 【추론】 민감한 값을 남기지 않는 기본 권고는 나감 정책 `unsetOnInactive`를 켜는 것이다(VALUE-031). 【추론】 호출자가 한 번에 비우려면 `setValue(form.getValue(), SetValueOption.DisableAutomaticWrites)`를 쓴다(VALUE-031). 【추론】 이때 투영으로 빠진 값도 없음이 된다(VALUE-031). 【추론】 열거는 루트 노드의 함수와 getter `node.inactiveValues`다(VALUE-029, VALUE-031).

ㄹ 손대지 않고 저장한 방출 값은 로드 값과 다를 수 있다(VALUE-031). 그 차이는 다섯으로 닫힌다(VALUE-031).

- (a) 형상에 없는 노드의 값(잠복으로 남고 `inactiveValues`로 열거된다, VALUE-031)
- (b) 작성자가 켠 투영(`omitEmpty`·`omitTrailing`, VALUE-031)
- (c) S1의 형 정규화(VALUE-031)
- (d) 로드의 자동 쓰기(없음인 키의 채움, 로드 때 발화하는 `injectTo`·`derived`, 로드된 값으로 평가한 `unsetValue`, VALUE-031)
- (e) 키 순서(미선언 키는 `extras`로 보존되지만 선언 키 뒤에 온다, 열린 물음 Q14(`emit`의 키 순서), VALUE-031)

따로 알리는 경고는 두지 않는다(VALUE-031).

【추론】 ㅁ 비활성 경로에 닿는 쓰기는 거부도 오류도 아니다(VALUE-031). 【추론】 그 쓰기는 루트가 드는 그 경로의 잠복 원본에 반영된다(VALUE-031). 【추론】 노드는 만들지 않고, 규칙도 평가하지 않으며, 방출되지 않는다(VALUE-031). 【추론】 이런 쓰기가 닿는 길은 넷이다: 조상의 `Merge`나 로드가 그 경로를 담을 때(WRITE-018의 분배), 형상에 없는 대상을 가리킨 `controls.injectTo`(CONTROLS-053), `batch`에서 표시할 때는 형상에 있었으나 정착 뒤 떠난 노드에 표시된 쓰기, 형상을 떠나기 전에 얻은 노드 참조로 한 쓰기(VALUE-031). `setValue(V)`와 `Overwrite`를 준 입력 쓰기는 로드가 아니라 전체 교체 쓰기이며, V가 그 경로를 담으면 이 쓰기도 WRITE-018의 분배로 그 경로의 잠복 원본에 닿는다(VALUE-031, WRITE-090, WRITE-094). 【추론】 형상을 떠난 노드와 그 옛 참조의 읽기·쓰기·재진입은 NODE-044가 정하며, 그래서 순차 쓰기와 배치 쓰기가 같은 원본에 닿는다(VALUE-031).

### 2.4 null 계약과 정합 상태(경고등)

`setValue(null)`은 키가 없는 전체 교체이므로 자식 원본이 없음이 된다(VALUE-036). 원본 칸 하나로 족하며 셋째 칸도 특수 장치도 없다 — 2라운드 S7(#338 S4와 "null 아래도 원본 유지"의 충돌)은 이렇게 닫힌다(VALUE-036). 3라운드 E9의 "비객체 V는 자식 raw를 건드리지 않는다"와 E18("비객체 호스트의 자식은 비활성")은 **삭제**한다: 비객체 호스트의 자식은 **존재하고 렌더되며** 빈 상태를 보인다(VALUE-036). 실수로 누른 null의 되돌리기는 입력 컴포넌트의 몫이다(VALUE-036). 【추론】 로드가 아닌 쓰기로 온 `null` 아래 자식은 채움 없이 없음이다(WRITE-090, WRITE-092, VALUE-036). 【추론】 로드로 온 `null` 아래 자식은 로드의 새 수명이라 채움을 받는다(VALUE-036). 【추론】 그래서 VALUE-036의 "빈 상태"는 로드로 온 `null` 아래에서는 채운 상태이고, 로드가 아닌 쓰기로 온 `null` 아래에서는 없음이다(VALUE-036).

【추론】 null 계약은 작업 루프의 단계가 아니라 쓰기 종류로 표현한다(VALUE-032). 【추론】 쓰기 종류는 쓰기마다 진입에서 정해진다(VALUE-032). 【추론】 종류는 입력, 호출자(부분 쓰기·배열 연산), 로드, 자동 쓰기다(VALUE-032). 【추론】 쓰기 종류의 목록(VALUE-032)과 `UpdateValue` 출처 칸의 값(EVENT-060)에 '호출자 전체 교체'(`setValue(V)`)를 더한다(VALUE-032). 【추론】 표시 단계가 재계산 목록과 함께 그 종류를 기록한다(VALUE-032). 【추론】 같은 기록이 두 곳에 쓰인다: WRITE-013의 판정과 `UpdateValue`의 출처 칸(EVENT-060, VALUE-032). 【추론】 비객체 호스트의 원본을 비우는 것은 입력·호출자의 부분 쓰기뿐이고, 그 자식의 투영된 방출이 생길 때만 비운다(VALUE-032). 【추론】 판정이 값의 변화가 아니라 종류를 보므로, 같은 값을 다시 쓴 의도된 쓰기(S6)도 객체를 만든다(VALUE-032). 【추론】 단계만으로는 모자라다(VALUE-032). 【추론】 자동 쓰기인 `trim`은 정착 단계가 아니라 입력 마침 신호로 들어오기 때문이다(WRITE-078, VALUE-032).

【추론】 `controls.injectTo`는 원인과 무관하게 언제나 자동 쓰기이며 조상의 원본을 바꾸지 않는다(VALUE-032). 【추론】 오늘의 S2 규칙은 옮기지 않는다(VALUE-032). 【추론】 그 규칙은 `injectTo`가 원인 쓰기의 출처를 물려받게 해서, 사용자가 일으킨 `injectTo`면 null 조상을 객체로 만든다(VALUE-032). 【추론】 사용자에게 보이는 변화: 사용자가 일으킨 `injectTo`의 값이 null 조상 아래에 그려지지만 방출되지 않는다(VALUE-032). 【추론】 소유자가 뒤집기를 원하면, 12-5의 출처 칸 덕분에 원인의 출처를 물려주는 구현 비용은 작다(VALUE-032, EVENT-060). 【추론】 이 동작 변화는 소유자 통보 목록에 올린다(VALUE-032).

【추론】 (1) 경고등은 VALUE-002의 분류로 '계산' 칸이다(VALUE-030). 【추론】 경고등은 원본과 노드의 현재 spec(게이트가 켜진 동안의 유효 목록)만의 함수이므로 '상태는 `raw`와 `extras` 둘뿐'(P3)을 지킨다(VALUE-030, VALUE-037). 【추론】 소유자가 말한 '상태'는 사용자에게 보이는 뜻이다(VALUE-030). 경고등은 커밋 때 원본이 바뀐 노드와, 같은 정착에서 유효 스키마가 바뀐 노드에서 다시 계산한다(VALUE-030, VALUE-037). 【추론】 켜지는 값은 자기 형이 아니고, 없음도 아니고, nullable 노드의 `null`도 아닌 값이다(VALUE-030). 【추론】 수 노드의 `NaN`·`±Infinity`, 정수 노드의 정수 아닌 수, 잘못된 종류를 든 가지 노드도 켜진다(VALUE-030). 【추론】 가상 노드는 켜지지 않는다(ERROR-195에서 거부한다, VALUE-030).

【추론】 루트 노드가 켜진 노드의 경로 집합을 든다(VALUE-030). 【추론】 쓰기 때 더하고 빼며, 로드마다 다시 만든다(VALUE-030). 【추론】 "로드마다 다시 만든다"(VALUE-030)는 `resetSubtree()`에는 그 하위 트리에만 적용한다(VALUE-030). 소유자 답(설계서 메모 4)으로 이름은 게터 `typeMismatch: boolean`, 경로 목록 `typeMismatches: readonly string[]`, 경고 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`다(VALUE-030, VALUE-037). 그래서 `valueTypeMismatch`·`valueTypeMismatches`·`VALUE_TYPE_MISMATCH`는 확정 이름 `typeMismatch`·`typeMismatches`·`SCHEMA_FORM_WARNING.TYPE_MISMATCH`로 읽는다(VALUE-030, VALUE-037, SURFACE-061). 【추론】 모든 노드는 getter `typeMismatches: readonly string[]`로 자기 경로 아래의 켜진 경로를 돌려준다(VALUE-030, SURFACE-061). 【추론】 루트에서 읽으면 트리 전체다(VALUE-030). 【추론】 커밋 번호로 메모해 같은 커밋에서는 같은 참조를 돌려준다(VALUE-030). 【추론】 형상에 없는 노드는 넣지 않는다(VALUE-030). 【추론】 새 이벤트는 없다(VALUE-030). 값이나 유효 스키마가 바뀌면 그 통지(`UpdateValue`·`UpdateJsonSchema`)가 알린다(VALUE-030, VALUE-037). 【추론】 `FormHandle`에는 더하지 않는다(VALUE-030).

【추론】 (4) nullable이 아닌 노드의 `null`은 바꾸지 않고 받은 그대로 방출된다(VALUE-033). 【추론】 경고등이 켜지고 경고가 가며, 검증기가 있으면 형 에러로 제출이 막힌다(VALUE-033). 【추론】 이 사용성 변화를 이주 항목(F27 확장, LANDING-125)과 PR-8 문서에 적는다(VALUE-033). 【추론】 해법은 스키마에 nullable을 적는 것이다(VALUE-033). 【추론】 값 규칙은 이미 닫혀 있고 문서화만 남았다(VALUE-033).

【추론】 `typeMismatch = raw !== undefined && !(raw === null && nullable) && !isMemberOfEffectiveList(raw)`이며, 원본과 노드의 현재 spec만의 함수다(VALUE-037, SURFACE-061). 【추론】 경고등은 커밋 때 원본이 바뀐 노드와, 같은 정착에서 유효 스키마가 바뀐 노드에서 다시 계산한다(VALUE-037). 【추론】 경고등은 그 노드의 경로가 루트의 경로 집합에 들어가는 커밋에 켜진다(ERROR-186, VALUE-037). 【추론】 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`는 경고등이 켜질 때마다 한 번 보내고, 켜진 채 다른 어긋난 값이 와도 다시 보내지 않는다(VALUE-037, SURFACE-061). 【추론】 경고등이 꺼졌다 켜지거나, 노드가 형상을 나갔다 들어오거나, 로드로 경로 집합을 다시 만들거나, 게이트가 좁혀 켜지면 다시 보낸다(VALUE-037). 【추론】 쓰기 없이 경고등만 바뀐 노드를 배달하는 통지는 유효 스키마 변경 통지 `UpdateJsonSchema`(가칭, EVENT-064)다(SETTLE-007, EVENT-045, VALUE-037). 【추론】 VALUE-030의 "바뀌면 `UpdateValue`가 알린다"는 "값이나 유효 스키마가 바뀌면 그 통지(`UpdateValue`·`UpdateJsonSchema`)가 알린다"로 고친다(VALUE-037).

【추론】 `SCHEMA_FORM_WARNING.TYPE_MISMATCH` 기록은 `{ level: 'warning', code, path, expected: { schemaType, nullable, effective }, received, reason, candidates?, source }`이다(ERROR-186, EVENT-060, VALUE-037, SURFACE-061). 【추론】 `expected.schemaType`은 `node.schemaType`이고, `expected.effective`는 그 커밋의 유효 목록이다(VALUE-037). 【추론】 `received`는 `'string'|'number'|'integer'|'nonFinite'|'boolean'|'null'|'object'|'array'|'other'` 가운데 하나다(VALUE-037). 【추론】 `reason`은 받아 줄 형이 없으면 `'unconvertible'`, 둘 이상이면 `'ambiguous'`이고, `candidates`는 `'ambiguous'`일 때만 `['string','boolean']`으로 싣는다(VALUE-037). 【추론】 `source`는 EVENT-060의 쓰기 출처 값에 `'gate'`를 더한 것이다(VALUE-037). 【추론】 `typeMismatches`는 켜졌으면 `[path]`, 아니면 공유하는 얼린 빈 배열이며, 커밋 번호로 메모하고 객체·배열 값의 안쪽 경로는 넣지 않는다(VALUE-037, SURFACE-061). 【추론】 `typeMismatch === false`는 값이 이 노드 유효 목록의 형이거나, 없거나, 노드가 nullable일 때 `null`이라는 뜻일 뿐 검증 통과를 뜻하지 않으며, 이 문구를 `FormTypeInputProps`와 게터의 주석에 같이 적는다(SURFACE-052, VALUE-037, SURFACE-061). 【추론】 게이트가 `null`을 빼는 것은 검증 전용이다(VALUE-037).

【추론】 union은 잎이므로 방출이 없을 때의 자리는 VALUE-034 그대로이며, 루트는 `undefined`이고 배열 아이템 자리는 `null`이다(VALUE-037). 【추론】 그래서 `omitEmpty`가 켜진 union 아이템이 `{}`를 들면 `null`이 방출되고, `{}`를 남기려면 작성자가 `omitEmpty: false`를 적는다(VALUE-037). 【추론】 방출은 원본을 참조 그대로 내며, 객체·배열을 복사하지 않는다(VALUE-012, WRITE-013, VALUE-037). 【추론】 터미널 object·array 노드와, 객체·배열을 받는 union이 통째로 든 값의 안쪽은 폼이 정규화하지 않는다(VALUE-037). 【추론】 그 안쪽의 JSON 부정합(`undefined`인 키, 배열 중간의 `undefined`·빈 자리, 비유한 수, `Date`·함수·bigint)은 VALIDATE-007을 어길 수 있다(예: `{type:['object','string'], minProperties:1}`의 `{a: undefined}`는 메모리 판정을 통과하고 직렬화 뒤 판정에서 실패한다, VALUE-037). 【추론】 개발 모드에서는 그런 값의 참조가 바뀐 커밋마다 깊이 점검하고, 부정합이 있으면 `(가칭) SCHEMA_FORM_WARNING.NON_JSON_WHOLE_VALUE`를 내며, 기록은 `{ path, innerPaths }`(앞의 N개)다(VALUE-037). 경고 중복 키는 폼 수준 로드(마운트, `FormHandle.reset()`)에서만 비우므로 `NON_JSON_WHOLE_VALUE`는 폼 수준 로드 사이에 `(code, path)`마다 한 번이고, `setValue(V)`와 `resetSubtree()` 뒤에는 다시 내지 않는다(VALUE-037, ERROR-204). 【추론】 프로덕션에서는 그 점검을 하지 않으며, 이 한계를 문서에 적는다(VALUE-037).

【추론】 채움 값(BLUEPRINT-036)은 노드가 생길 때 원본이 `undefined`인 경우에만 한 번 들어가며, `interpret`(두 번 해석 포함)를 지난다(VALUE-037). 【추론】 그래서 로드된 `{}`는 이미 있는 값이며 `default`로 덮이지 않고, 이는 객체 호스트가 `{}`도 채움을 받는 것(WRITE-082)과 다르다(VALUE-037). 목록 밖 `default`(예: `['string','boolean']`에 `default: 0`)의 경고등·경고는 마운트만이 아니라 노드가 생길 때마다(WRITE-090의 채움 시점) 켜고 보낸다(VALUE-037, WRITE-099). 【추론】 그 경고는 `source: 'fill'`, `reason: 'ambiguous'`로 한 번 보낸다(VALUE-037). 【추론】 `default`의 객체·배열은 복사하지 않고 불변으로 다룬다(WRITE-071, VALUE-037).

## 3. 쓰기

### 3.1 core는 받은 값을 고치지 않는다

**core는 받은 값을 고치지 않는다.**(WRITE-001) 유효하지 않은 값은 그대로 들어가고 에러로 보인다(WRITE-001). 입력을 막지 않는다(WRITE-001).

소유자(2026-09-23, 합의 근거; WRITE-001): "그걸 바랐다면 ajv autofix 같은 걸 쓰지 않았을까. 나는 form이 값을 바꾸도록 이전에 설계했고, 이 방식이 사용자에게 혼란을 준다는 걸 느껴서, 값 수정은 안 하고 에러만 보여주는 걸 기본 동작으로 하려고 했다. 빼거나 지우는 건 모두 `&`로 시작하는 명령으로 조작해야 한다."(WRITE-001)

18라운드 물음 S1(다른 종류의 값을 보존할 때 잎 노드의 공개 값 형) 반영: WRITE-001에는 이름 붙은 예외(형 정규화)로 적는다(WRITE-001). 18라운드 물음 S1 반영: 이것은 값의 교정이 아니라 JSON·JS 자동 형변환을 통제할 수 있게 구현한 것이므로 WRITE-001의 대상이 아니다(WRITE-001).

**예외는 방출 정책뿐이다 — 비활성 노드의 값은 방출에서 빠지고, `omitEmpty`·`omitTrailing`이 방출을 줄인다.**(WRITE-002) 원본을 지우는 것이 아니라 방출을 계산할 때의 투영이다(GOAL-030, 원리 P4(방출은 정책이다), WRITE-002). 비활성 노드의 원본을 지우는 것은 작성자나 호출자(Form 속성)가 나감 정책 키를 켰을 때뿐이며, 그것은 core의 교정이 아니라 그들이 선언한 자동 쓰기다(원리 P2(원본은 호출자와 작성자만 쓴다), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값), WRITE-002).

**비활성화는 쓰기가 아니다** — 조각이 꺼져도 원본은 기본으로 그대로다(원리 P4, 축 4항(JSON Schema 설정은 값을 조작하지 않는다), WRITE-002).

**제약을 입력 단계에서 강제하는 일은 입력 컴포넌트에 위임한다.**(WRITE-003) core는 제약을 유효 스키마로 노출하고(`node.jsonSchema`) 위반은 검증이 알린다(WRITE-003).

형상 계산이 수렴하지 않을 때도 값은 받아들인다(SETTLE-011, WRITE-004).

원본에 쓰는 주체는 사용자 입력, 호출자의 `setValue`·`reset`, 그리고 작성자가 선언한 규칙뿐이다(WRITE-005). 규칙은 노드가 생길 때의 채움과 그 원천 `controls.default`·`default`, 예약 층의 `controls.derived`·`controls.injectTo`·`controls.unsetValue`, 그리고 정책이 참으로 정해진 노드의 나감 비움이다(WRITE-005). core가 스스로 원본을 "고치는" 일은 없다(WRITE-005).

쓰기의 종류는 **호출자가 선언한다.**(WRITE-006) core는 추론하지 않는다(도출 D-4(쓰기 종류는 호출자 선언), WRITE-006).

### 3.2 쓰기 표, 쓰기 종류와 쓰기 옵션

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

(WRITE-007)

| 사건 | 종류 | 누가 | 자식 원본에 미치는 것 |
| ---- | ---- | ---- | -------------------- |
| `controls.injectTo` | 전체 교체(대상에) | 작성자 | 원천의 방출 값이 직전 커밋과 다를 때(에지). 로드에서는 직전 값이 없으므로 발화한다(`fire`, 소유자 동의) |
| `controls.derived` | 자기 값 덮기 | 작성자 | 의존 값이 바뀔 때(에지). 로드에서는 직전 값이 없으므로 발화한다(로드는 새 수명, `controls.injectTo`와 같은 읽기). 식이 `undefined`면 쓰지 않는다. 사용자가 쓴 값은 다음 의존 변화 또는 그 노드가 다시 생길 때까지 남는다(재탄생은 새 삶) |
| `controls.unsetValue` | 자기 값 없음으로 | 작성자 | 식이 거짓→참이 되는 순간. 로드에서는 로드된 값으로 평가해 참이면 지운다(소유자). 입력은 남는다 |
| 채움 | 없음인 키에 한 번 | 노드 생성 사건 | 노드가 **생길 때**(직전 커밋의 형상에 없고 이번 최종 형상에 있을 때) 없음이면 `controls.default` > `default` > 없음. 이미 있던 노드는 새 조각이 켜져도 다시 채우지 않는다. 지운 값은 다시 채워지지 않는다. 채움 값은 그 노드가 처음 채워지는 전이 라운드의 유효 스키마에서 읽는다. 뒤 라운드에 켜진 조각의 `default`는 쓰지 않는다 |

생김은 노드 단위다(WRITE-007). 직전 커밋의 형상에 없고 이번 정착의 최종 형상에 있는 노드만 생긴 것이고, 본체·게이트 없는 `allOf` 항목·이미 켜져 있던 다른 조각이 두고 있던 노드는 새 조각이 켜져도 생기지 않는다(WRITE-007).

객체 호스트의 없음은 호스트와 모든 자손의 `raw`·`extras`가 없음인 것이라, 로드한 V가 그 자리에 `{}`를 주어도 호스트는 `controls.default` > `default`를 받는다(WRITE-010, WRITE-082). 리프에 `undefined`를 쓰면 없음이 된다(WRITE-010). 입력 컴포넌트가 `onChange(undefined)`를 보내도 값이 없음이 된다(소유자 답(`reviews/round-10-owner-answers.md:15` C-11), WRITE-010). `Merge`로 키에 `undefined`를 쓰면 그 키는 없음이 된다(WRITE-010). `extras`의 키도 같고, 따로 `removeKey`를 두지 않는다(소유자 답(`reviews/round-10-owner-answers.md:18` C-2), WRITE-010).

공개 옵션은 비트마스크다 — `SetValueOption.Overwrite | Merge | DisableAutomaticWrites | EnableAutomaticWrites`, Form 속성은 `disableAutomaticWrites`(SURFACE-004, SURFACE-039, WRITE-015).

(WRITE-015, WRITE-090)

| 규칙 | 내용 |
| ---- | ---- |
| 기본 | 쓰기 종류는 `Overwrite` — 오늘과 같다 |
| 자리 | `setValue(V, option)`뿐 아니라 **`reset(option)`과 마운트**에도 둔다. 마운트는 `defaultValue`가 로드이므로 Form 속성이 그 자리다 |
| 우선순위 | **호출 옵션 > Form 속성**, 양방향이다. 속성이 켜 둔 억제를 호출이 끌 수 있고 그 반대도 된다. 억제 비트가 둘(`DisableAutomaticWrites`·`EnableAutomaticWrites`)인 이유가 이것이다 — 상속·끄기·켜기 세 상태. 호출에 둘 다 없으면 Form 속성을 따르고, 둘 다 주면 억제가 이긴다 |
| 배치 | 한 배치 안에 서로 다른 억제 값이 섞이면 **억제가 이긴다**(보수적. `fn` 안의 `reset`의 로드는 묶음 밖이다, EVENT-015) |
| 범위 | 억제는 그 호출이 일으킨 예약 층의 자동 쓰기 전부를 막는다 — 채움, `controls.derived`, `controls.injectTo`, `controls.unsetValue`, 나감의 비움. 전체 교체(`setValue(V)`)는 로드가 아니라 전체 교체 쓰기이고, 로드는 마운트·`FormHandle.reset()`·`resetSubtree()`뿐이며, `DisableAutomaticWrites`는 그 쓰기로 새로 생긴 노드의 채움과 다른 자동 쓰기를 끈다. `Merge`에 주면 `Merge`가 통째로 준 배열의 아이템 채움과 그 `Merge`가 촉발한 `controls.derived`도 막는다. 로드된 값 자체는 막지 않는다. `controls.active`의 방출 제외는 쓰기가 아니라 투영이므로 범위 밖이고, 정책이 참으로 정해진 노드의 나감 비움은 범위 안이다. 뒤이은 사용자 입력·리스너가 일으킨 정착은 다른 호출이므로 억제가 듣지 않는다(4라운드 명세 F25(억제는 그 호출이 일으킨 정착에만 든다)). |
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
이 항목의 `valueTypeMismatch`·`valueTypeMismatches`·`VALUE_TYPE_MISMATCH`는 확정 이름 `typeMismatch`·`typeMismatches`·`SCHEMA_FORM_WARNING.TYPE_MISMATCH`로 읽는다(WRITE-079, SURFACE-061).

반영 칸(설계서 메모 4): "게터 `typeMismatch: boolean`, 경로 목록 `typeMismatches: readonly string[]`, 경고 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`."(WRITE-079)

자동 쓰기는 비객체 호스트의 원본을 건드리지 않고(4라운드 명세 F10(비객체 호스트의 `raw`를 비우는 것은 사용자·호출자의 부분 쓰기뿐), 계승 제약 T-12(자동 쓰기는 null 조상을 객체로 만들지 않는다)), core는 호출자가 넘긴 객체를 바꾸지 않는다(4라운드 명세 F24, 계승 제약 T-19(`defaultValue`와 `jsonSchema`는 마운트 시 deep clone한다), WRITE-013).

호스트의 원본이 `null`·`17` 같은 잘못된 종류의 값일 때 그 자식은 존재하고 렌더되며 빈 상태를 보인다(WRITE-013). 호스트의 그 원본을 비우는 것은 사용자·호출자의 부분 쓰기뿐이고 **그 자식의 투영된 방출이 존재하게 될 때만** 비운다(WRITE-013). 로드가 아닌 쓰기로 온 `null` 아래 자식은 채움 없이 없음이며(WRITE-090, WRITE-092), 채움 값을 드는 것은 로드로 온 `null` 아래 자식이다(WRITE-096, WRITE-013).

터미널 노드가 참조를 들 수 있으므로 `defaultValue`는 분배 시 복사하거나 불변으로 취급한다(4라운드 명세 F24, 계승 제약 T-19, WRITE-071).

### 3.3 채움과 로드

채움(`controls.default` > `default`)은 노드가 생길 때만 일어난다: 마운트, `FormHandle.reset()`, `resetSubtree()`, 분기가 켜짐, 배열 아이템이 생김(WRITE-090, WRITE-097).
로드는 마운트, `FormHandle.reset()`(커밋된 prop), `resetSubtree()`(그 하위 트리)뿐이며, 로드는 새 수명이라 형상의 모든 노드를 생긴 노드로 치고 없음인 값이 채움을 받는다(WRITE-090, SETTLE-048).
`setValue(V)`와 `Overwrite`를 준 입력 쓰기는 로드가 아니라 전체 교체 쓰기이며, 이미 형상에 있던 노드를 다시 채우지 않고 그 쓰기로 새로 생긴 노드만 채움을 받는다(WRITE-090).
그래서 `setValue(undefined)`는 채움 없이 비우고, `setValue(getValue())`는 멱등이다(WRITE-090, WRITE-094).
`Overwrite`를 준 입력 쓰기는 다른 입력 쓰기처럼 자기 입력에 Refresh를 보내지 않는다(WRITE-090).
`setValue(null)` 뒤 자식이 다시 객체가 되어도 노드가 새로 생기지 않으면 채우지 않는다(WRITE-090).
`setValue`는 로드가 아니므로 `defaultValue` 게터와 `resetSubtree()`의 로드 스냅숏을 바꾸지 않는다(배열의 구조 연산이 스냅숏을 고치는 WRITE-085의 규칙은 그대로다)(WRITE-090, WRITE-095).
`DisableAutomaticWrites`는 그 쓰기로 새로 생긴 노드의 채움과 다른 자동 쓰기를 끈다(WRITE-090).
`setValue(undefined)`와 입력의 `onChange(undefined, SetValueOption.Overwrite)`는 오늘처럼 채움 없이 비우므로 이주 행이 없다(WRITE-090).

소유자 답(`reviews/round-18-owner-answers.md:26` 18C 검토 4번; WRITE-090): "잠깐. default 나 defaultValue 가 영향을 주는건 "최초 로드시" 와 "브랜치가 꺼졌다 켜졌을때 값이 없는 경우" 뿐 아닌가? 그러니까 정말 최초에만 영향을 주는거고, undefined 가 오면 명시적으로 해당 필드는 비워야 하지 않나?" "defaultValue의 동작을 생각하면 이 값으로 계속 되돌아가는건 너무 이상한 동작으로 보이는데?" "4번 B 안 확정."(WRITE-090)

【추론】 core는 `default`가 없는 자리에 타입별 빈 값을 만들지 않는다(WRITE-089).
【추론】 채움의 원천은 `controls.default` > `default` > 없음뿐이다(VALUE-035, SCHEMA-002, WRITE-089).
【추론】 `Form`이 `defaultValue` 없이 서거나 `reset`될 때 루트에 로드하는 값은 없음이며, 빈 호스트와 루트가 무엇을 방출하는지는 VALUE-034가 정한다(WRITE-089).
【추론】 그래서 오늘의 `getEmptyValue` 경로는 새 설계에 없고, 빈 폼의 `FormHandle.getValue()`는 VALUE-034대로 오늘처럼 `{}`다(WRITE-089).

【추론】 호스트(객체, 배열)의 채움 값 D는 `controls.default` > `default` 순이다(WRITE-082).
【추론】 D는 그 호스트가 처음 채워지는 라운드의 유효 스키마에서 읽는다(WRITE-082).
【추론】 호스트가 생길 때 없음이면, D는 그 호스트에 대한 쓰기로 들어간다(WRITE-082).
【추론】 분배는 그 호스트에 대한 쓰기와 같다(WRITE-082).
【추론】 D의 키는 해당 자식의 원본이 된다(더 깊이 재귀)(WRITE-082).
【추론】 선언되지 않은 키는 `extras`로 가고, D가 객체가 아니면 호스트가 그 값을 든다(WRITE-082).
【추론】 객체 호스트가 없음이라는 것은 호스트와 모든 자손의 `raw`·`extras`가 없음인 것이다(상태 둘에서 계산, 원리 P3(형상은 상태의 순수 함수다), WRITE-082).
【추론】 그래서 로드한 V가 그 자리에 `{}`를 주어도 호스트는 D를 받는다(WRITE-082).
【추론】 채움은 부모부터 순회한다(WRITE-082).
【추론】 그래서 D가 준 키의 자손은 이미 없음이 아니어서 자기 `default`를 받지 않는다(WRITE-082).
【추론】 D에 없는 자손은 없음으로 남아, 자기 차례에 `controls.default` > `default`를 받는다(WRITE-082).
【추론】 채움은 자동 쓰기이므로 억제 비트의 대상이고, 원본 B의 자동 쓰기 기록에 든다(WRITE-082).
【추론】 D는 복사하거나 불변으로 다룬다(4라운드 명세 F24(core는 호출자가 넘긴 객체를 바꾸지 않는다), WRITE-082).
【추론】 분배된 값은 잎마다 `interpret`를 지난다(WRITE-082).
【추론】 꺼진 조각의 자손에도 쓰기의 분배 규칙대로 들어가 잠복 원본이 된다(WRITE-018과 같은 분배, WRITE-082).

ㄴ `push`는 로드가 아니다(WRITE-088). `push`는 구조 연산이다(WRITE-088). 만든 아이템은 생긴 노드로서 채움을 받는다(`controls.default` > `default` > 없음)(WRITE-088). `push(v)`면 원본은 `v`이고, 없음인 자손에만 채움이 간다(WRITE-088).

주입된 값은 꺼진 조각의 노드와 노드 게이트(`controls.active`)가 거짓인 노드까지 포함해 모든 노드의 원본으로 분배되고, 형상은 그 값으로 수렴한다(ADR 0002, WRITE-018). 노드 게이트는 조각 게이트와 같은 장치이므로 두 경우가 같게 동작한다(SETTLE-003, WRITE-018).
꺼진 조각의 값과 게이트가 거짓인 노드의 값은 **방출에서** 빠진다(WRITE-018). 기본은 원본을 지우지 않는다(원리 P4, WRITE-018). 로드에는 나감이 없으므로 나감 정책 키를 켜도 주입된 값은 지워지지 않는다(WRITE-037, WRITE-018). `controls.visible: false`로 숨긴 필드와 스키마가 선언하지 않은 키는 방출된다(WRITE-018). 스키마가 선언하지 않은 키는 `extras`에 받은 순서로 방출된다(WRITE-018). 숨김은 렌더링에만 닿는다(WRITE-018).
나머지는 검증이 에러로 알린다(WRITE-018).

(a)("첫 의도된 쓰기 전까지 `getValue()`가 주입된 값을 그대로 돌려준다")는 택하지 않는다 — 첫 편집에서 기본값이 나타나고 미선언 키가 빠지는 점프가 생긴다(WRITE-021). (b)의 셋 가운데 둘은 **기본 계약이 되었다**: 로드한 값에 없는 키에만 채움(`controls.default` > `default`)이 들어가는 것과, 미선언 키를 호스트의 별도 칸(`extras`)에 보존하는 것(3라운드 명세 E16, WRITE-021). 남은 하나("손대지 않은 값에는 `omitEmpty`·`omitTrailing`을 건너뛴다")는 이력 의존이므로 채택하지 않는다 — 방출은 상태의 투영이다(원리 P4, WRITE-021). `preserveDefaultValue`라는 이름은 사라지고 그 자리에 억제 비트 `DisableAutomaticWrites`가 남는다(WRITE-021).

### 3.4 전체 교체 쓰기와 null

【추론】 `setValue(V)`는 로드가 아니지만 전체 교체 쓰기로서 V에 없는 경로의 원본(잠복 원본 포함)을 없음으로 만든다(WRITE-019, WRITE-007, WRITE-094).
【추론】 잠복 원본이 지워지는 길은 나감 정책, 로드, V가 그 경로를 담지 않은 전체 교체 쓰기다(WRITE-094).
【추론】 WRITE-090의 멱등은 방출 값·채움·에지에 대한 것이다(WRITE-094).
【추론】 첫 `setValue(getValue())`는 잠복 원본과 투영으로 빠진 원본을 없음으로 만들며(VALUE-031), 둘째 호출부터는 바뀌는 것이 없다(WRITE-094).

- PR: PR-2(쓰기)(WRITE-094).
- 무엇: `omitEmpty` 필드에 `''`가 있고 꺼진 분기에 원본이 있는 폼에서 `setValue(getValue())`를 두 번 부른다(WRITE-094).
- 통과: 첫 호출에서 두 원본이 없음이 되어 `inactiveValues`에서 빠지고 방출 값·채움·에지는 그대로이며, 둘째 호출은 원본을 바꾸지 않고 `UpdateValue`를 내지 않는다(WRITE-094).
- 실패: 결과가 다르면 이 블록이나 WRITE-090의 보충을 고친다(WRITE-094).

2라운드의 "절대 제거하지 않는다"가 남긴 결함 — 레코드 A 뒤에 레코드 B를 로드하면 A의 잠복 값이 분기 전환에서 되살아난다 — 은 **전체 교체가 V에 없는 키를 없음으로 만들면서** 사라진다(WRITE-019). 비활성화(원본 보존)와 전체 교체(원본에도 적용)를 구분한 것이 답이었다(WRITE-019). 남는 잠복은 하나다: 비활성 조각이 선언한 자식의 원본은 방출되지 않으므로 검증기가 기각하지도 잔여 목록에 오르지도 않는다 — 설계상 잠복이다(원리 P4, WRITE-019). 잠복 원본 열거는 루트 노드의 함수이고 노드마다 getter `inactiveValues`다(WRITE-019, VALUE-029).

【추론】 `node.inactiveValues`(와 그것이 부르는 루트 노드의 함수)는 읽기 전용 배열 `ReadonlyArray<{ readonly path: string; readonly value: unknown }>`을 돌려준다(WRITE-087).
【추론】 항목은 그 노드 아래에서 형상에 없고 원본을 든 노드(잎·터미널, 그리고 잘못된 종류의 값을 든 노드)마다 하나다(WRITE-087).
【추론】 `path`는 절대 JSON Pointer(`node.path`와 같은 표기)다(WRITE-087).
【추론】 `value`는 그 노드가 든 원본이며 복사하지 않는다(WRITE-087).
【추론】 순서는 청사진의 전순서(문서 순서)다(WRITE-087).
【추론】 아래에 잠복 원본이 없으면 모든 노드가 공유하는 얼린 빈 배열 하나를 돌려준다(WRITE-087).
【추론】 배열과 항목 객체는 얼린다(WRITE-087).
【추론】 메모는 커밋 단계에서만 만든다(WRITE-087).
【추론】 잠복 집합이나 잠복 원본이 바뀐 노드의 조상 경로만 다시 만들고, 루트의 함수는 경로로 찾기만 한다(WRITE-087).
【추론】 바뀐 것이 없으면 이전 참조를 그대로 돌려준다(WRITE-087).
【추론】 그래서 "같은 값을 두 번 읽으면 같은 참조"가 성립한다(WRITE-087).
【추론】 같은 항목 객체를 조상들의 배열이 함께 쓴다(절대 경로라서 가능하다)(WRITE-087).

- PR: PR-2 벤치(WRITE-087).
- 무엇: 커밋 때 조상 경로 메모를 갱신하는 비용을 잰다(WRITE-087).

**null은 키 없는 전체 교체다**(도출 D-1, WRITE-092). 키가 없으므로 모든 자식의 원본이 없음이 된다(WRITE-092).
"null 아래에 원본을 남긴다"는 호출자가 "없다"고 쓴 것을 숨겨 두는 것이므로 원리 P2에 어긋난다(WRITE-092).

【추론】 로드가 아닌 쓰기로 온 `null` 아래 자식은 채움 없이 없음이다(WRITE-090, WRITE-092, WRITE-096).
【추론】 로드로 온 `null` 아래 자식은 로드의 새 수명이라 채움을 받는다(WRITE-096).
【추론】 그래서 VALUE-036의 "빈 상태"는 로드로 온 `null` 아래에서는 채운 상태이고, 로드가 아닌 쓰기로 온 `null` 아래에서는 없음이다(WRITE-096).
【추론】 쓰기 종류의 목록(VALUE-032)과 `UpdateValue` 출처 칸의 값(EVENT-060)에 '호출자 전체 교체'(`setValue(V)`)를 더한다(WRITE-096).

- PR: PR-2(쓰기 종류)(WRITE-096).
- 무엇: `name`에 `default`가 있는 폼에서 `setValue({ user: null })` 뒤와 `{ user: null }`을 로드한 `FormHandle.reset()` 뒤의 `name`의 원본과 방출, 그리고 `setValue(V)`가 낸 `UpdateValue`의 출처 칸을 본다(WRITE-096).
- 통과: `setValue` 뒤 `name`은 없음이고, 로드 뒤 `name`은 채움 값을 들되 방출에 나타나지 않으며, 출처 칸은 호출자 전체 교체다(WRITE-096).
- 실패: 이 블록을 고친다(WRITE-096).

【추론】 억제 비트 `DisableAutomaticWrites`의 범위는 그 호출(로드와 전체 교체 쓰기, `Merge`)이 일으킨 예약 층의 쓰기 전부다(WRITE-097).
【추론】 WRITE-048의 "원장의 쓰기 표에서 둘은 같은 행이다"는 낡은 근거다: `setValue(V)`는 로드가 아니라 전체 교체 쓰기라 쓰기 표에서 reset과 다른 행이며, reset만의 예외를 두지 않는 근거는 모든 배열 통째 쓰기가 위치로 잇는다는 NODE-051이다(WRITE-097).
【추론】 WRITE-085의 "배열 통째 로드"는 로드(마운트·`FormHandle.reset()`·`resetSubtree()`)가 싣는 배열이며, 로드가 아닌 배열 통째 쓰기의 스냅숏은 WRITE-095가 정한다(WRITE-097).
【추론】 `setValue(undefined)`는 이미 있던 노드를 다시 채우지 않고 비운다(WRITE-097).
【추론】 채움이 일어나는 사건에는 노드 게이트(`controls.active`)가 켜짐도 든다(SETTLE-005, WRITE-097).

- PR: PR-2(채움)(WRITE-097).
- 무엇: 빠진 키에서 참이 되는 `if`와 `controls.active` 게이트를 가진 폼에서 루트 `setValue(undefined)`를 부른다(WRITE-097).
- 통과: 이미 있던 노드는 채우지 않고 비우며, 게이트가 뒤집혀 새로 생기거나 켜진 노드는 채움을 받는다(WRITE-097).
- 실패: 채움 사건의 목록을 고친다(WRITE-097).

### 3.5 reset의 판정과 경로

값의 리셋은 로드로 충분하고 오늘보다 싸고 안전하다(트리·캐시·노드 참조가 그대로이고, 동기라 틈이 없다)(WRITE-042).
로드만으로 모자란 것은 상호작용 상태, 입력 컴포넌트의 내부 상태, Form 층의 상태 셋이며 장치를 더해 닫는다(WRITE-042).
로드로 닫을 수 없는 것은 스키마가 실제로 바뀐 경우 하나이며, 그때는 reset 호출 안에서 트리와 캐시를 새로 만든다(WRITE-042).
판정 기준: reset 뒤의 값·상호작용 상태·표시 상태(오류와 그 표시)는 같은 prop으로 막 마운트한 폼과 같고(`key` 재마운트와 같은 결과), 노드 트리와 identity, 구독, 캐시, 렌더러와 호출자 `children`, 자식 프록시를 마운트하고 있는 입력의 비값 상태는 남는다(`key`보다 효율적이고 안전한 쪽)(WRITE-042).
지금 자식을 그리지 않는 입력, 곧 접힌 펼침 영역과 빈 배열은 다시 마운트된다(WRITE-042).
소유자는 16라운드 답 2에서 "기본적으로 값에 대한 리셋이긴 한데요, 기존 사용방식을 참고해서 로드로 충분한지 검토해보세요."라고 했다(WRITE-042).

경로 — 같은 스키마인가: `jsonSchema` prop이 트리의 작성 루트와 같은 객체이거나, JSON으로 표현되는 부분(원시 값, 배열, 평범한 객체)이 키 순서까지 깊게 같고 그 밖의 값(함수, 컴포넌트, React 요소, 클래스 인스턴스)이 참조로 같으면 같은 스키마다(WRITE-043).
`properties`의 키 순서는 필드 순서다(WRITE-043).
키 순서를 보지 않는 `@winglet/common-utils`의 `equals`는 그대로 쓰지 않는다(WRITE-043).
같으면 로드, 다르면 재생성(WRITE-046)이다(WRITE-043).
비교는 참조가 다를 때만 하며 비용은 스키마 크기에 비례하는 순회 한 번이다(WRITE-043).
같은 스키마로 판정된 새 객체는 트리가 들지 않고 캐시의 키는 처음의 작성 루트 그대로다(WRITE-043, VALIDATE-018).
그래서 렌더마다 새로 만드는 인라인 스키마도 함수·컴포넌트 칸이 같으면 로드를 탄다(답 2의 '불필요한 캐시 리빌드 없음', 답 10의 재생성 방지)(WRITE-043).
스키마 객체를 제자리에서 고친 뒤의 reset은 그 변경을 반영하지 않는다(바꾸려면 새 객체를 준다)(WRITE-043).
`<Form>`이 `jsonSchema`·`defaultValue`를 마운트와 reset 때만 읽는 것은 오늘과 같다(WRITE-043).

값의 출처와 재대조: reset은 호출 시점에 커밋된 prop(`jsonSchema`·`defaultValue`·`errors`·`showError`)으로 곧바로 로드하고, 호출이 돌아오면 커밋이 끝나 있다(WRITE-044).
동시에 호출자의 갱신 차선으로 `<Form>`의 렌더를 하나 예약하고, 그 렌더의 커밋에서 prop이 reset이 쓴 것과 다르면(스키마는 WRITE-043의 규칙, `defaultValue`·`errors`는 값의 깊은 같음, `showError`는 값) 커밋된 prop으로 reset을 한 번 더 한다(WRITE-044).
그래서 같은 처리기에서 prop을 바꾼 뒤 부른 reset(`setRecord(b); formRef.current.reset()`, `startTransition` 안 포함)은 끝에서 새 prop을 반영하고(`startTransition` 안에서는 첫 로드의 옛 값이 한 번 그려지고 `onChange`로 나간다, 문서화), prop이 그대로인 reset(인라인 `defaultValue`로 부모가 다시 그린 경우 포함)은 로드 한 번으로 끝난다(WRITE-044).
두 번째 reset은 독립된 진입이며 EVENT-026의 규칙대로 자기 통지를 낸다(재대조는 EVENT-036의 이펙트 진입과 같은 새 진입이다)(WRITE-044).
그 경로에서는 `onChange`가 두 번이다(WRITE-044).
예약된 재대조는 `<Form>`이 먼저 언마운트되면 버린다(WRITE-044).
prop 갱신만 `startTransition` 안에서 하고 reset은 밖에서 부른 경우는 오늘처럼 새 prop이 반영되지 않는다(문서화)(WRITE-044).
재대조의 reset은 원래 호출의 억제 비트를 그대로 쓴다(WRITE-044).

- 유지하는 것: 노드 트리와 노드 identity, 청사진과 식 컴파일, 가드·사본 캐시, 검증기 등록, 유효 스키마 메모, 가상화의 드러난 기록(identity가 이어지는 노드에만), provider, `<form>`, 렌더러, 호출자 `children`(WRITE-045).
- 상호작용과 Form 층: 두 경로 모두 한 진입 안에서 `dirty`·`touched`를 비우고 집계 상태가 실제로 바뀐 때만 `onStateChange`를 한 번 낸다(WRITE-045). 이미 비어 있으면 내지 않는다(WRITE-045). `onChange`의 '바뀐 때만'과 같은 규칙이며, 오늘은 빠지는 것으로 판독했다(`reviews/raw-round16-reset.md` §4의 H1)(WRITE-045). 명령형 외부 오류와 검증 결과를 비우고 `errors` prop을 다시 적용한다(WRITE-045). 첨부 파일 맵의 내용을 비운다(오늘과 같다)(WRITE-045). `showError`를 prop 값으로 돌린다(WRITE-045). 오늘은 유지된다(`Form.tsx:101`)(WRITE-045). 바뀌는 동작이며 근거는 위의 판정 기준이다(WRITE-045, WRITE-042). 로드이므로 `diagnostics`를 새로 적는다(WRITE-045). 예산 안이면 `stable`이 되고, 넘으면 다시 기록된다(WRITE-045). 바뀌었으면 `onDiagnosticsChange`를 낸다(WRITE-045). 앞서 `degraded`였다면 로드가 풀고 제출 거부도 풀리며, 로드가 다시 예산을 넘기면 다시 `degraded`가 되어 제출을 거부한다(17라운드 소유자 답 R17-1 나)(WRITE-045).

스키마가 다른 경로: 트리와 캐시를 새로 만든다(비용은 `<Form key>`의 재생성과 같다)(WRITE-046).
reset 호출 안에서 동기로 만들고(트리 생성은 core의 연산이다, 추가 목표 C3(프레임워크 독립적인 core)), 새 트리를 로드한 뒤 돌아오기 전에 핸들(`node`·`getValue`·`setValue` 등)을 새 트리로 바꾼다(WRITE-046, GOAL-016).
그래서 최외곽 호출의 `reset(); getValue()`와 `reset(); setValue(x)`는 경로와 무관하게 새 트리에 닿고(열린 진입 안에서도 같다, EVENT-015, EVENT-030), 오늘의 틈(reset 직후 `setValue`가 사라지고 `submit`이 아무것도 하지 않음)이 재생성 경로에도 남지 않는다(WRITE-046).
React 연결은 외부 저장소(`useSyncExternalStore`)로 알려 막는 차선으로 곧바로 커밋한다(`startTransition` 안에서도 옛 화면이 입력을 받는 틈을 두지 않는다)(WRITE-046).
옛 트리는 폐기로 표시하고 리스너를 놓는다(WRITE-046).
옛 트리를 폐기할 때 그 노드들의 Refresh 번호와 상호작용 초기화 번호를 통지 없이 함께 올려, 폐기된 트리의 입력 인스턴스가 뒤늦게 낸 `onChange`·`onFileAttach`(언마운트 때의 flush 포함)와 흐림 뒤 미룬 `touched`가 REACT-024의 검사에서 core에 닿기 전에 버려지게 한다(WRITE-046).
REACT-024의 검사를 받지 않는 컨테이너 입력의 늦은 `onChange`는 `handleChange`의 진입 하나(REACT-011)로 오고 그 진입 전체(값 쓰기, 외부 오류 지움, `dirty` 표시)가 입력 출처 표식(REACT-009, REACT-010)을 달고 오므로, 폐기된 노드는 셋을 모두 조용히 버린다(WRITE-046).
늦은 `onFileAttach`는 노드 쓰기가 아니라 reset을 넘어 남는 Form 층 첨부 파일 맵의 쓰기이므로(오늘의 `SchemaNodeInput.tsx:61-67`), 래퍼가 맵에 쓰기 전에 노드의 폐기 표시를 읽어 폐기된 노드면 버린다(컨테이너 입력 포함)(WRITE-046).
표식 없이 폐기된 노드에 온 쓰기, 곧 호출자가 미리 잡아 둔 옛 노드 참조로 한 쓰기는 적용하지 않고 호출자 오류(`SchemaFormError`)로 환경 불문 즉시 던진다(ERROR-003의 호출자 오류)(WRITE-046).
그래서 폐기된 노드에서 던지는 쓰기는 호출자가 잡아 둔 옛 노드 참조로 한 것뿐이다(WRITE-046).
입력 컴포넌트가 래퍼를 거치지 않고 `FormTypeInputProps`의 `node`로 한 쓰기도 표식이 없으므로 이 옛 노드 참조에 들며, 재생성 reset 뒤 타이머나 언마운트 정리에서 하면 던진다(문서화, LANDING-121)(WRITE-046).
노드 참조와 가상화 기록은 이어지지 않는다(WRITE-046).
노드 참조가 reset을 넘어 이어지는 것은 로드 경로뿐이다(문서화)(WRITE-046).
옛 트리의 콜백 억제를 위한 별도 표지(오늘의 `ready`)는 필요 없다(WRITE-046).
`onChange`는 로드 경로와 같은 규칙이다(새 트리의 방출 참조는 새로우므로 사실상 한 번 낸다)(WRITE-046).

【추론】 재생성 reset이 옛 트리를 폐기해도 노드 사이의 부모·자식·루트 참조는 끊지 않는다(WRITE-086).
【추론】 폐기가 하는 일은 넷이다: 폐기 표시, 리스너·구독 해제, Refresh 번호와 상호작용 초기화 번호를 통지 없이 올리기, 폼 쪽이 옛 트리를 놓기(핸들 교체)(WRITE-086).
【추론】 검증기 등록의 참조 수는 폐기가 내리지 않는다(WRITE-086).
【추론】 옛 트리의 효과 정리에서 내린다(WRITE-086).
【추론】 옛 노드를 읽으면(`value`·`outputValue`·`inactiveValues`·`parentNode`·`find` 등) 폐기 직전 마지막 커밋을 그대로 돌려준다(WRITE-086).
【추론】 옛 노드에 쓰면 `DISPOSED_NODE_WRITE`(가칭, 기존)로 던진다(WRITE-086).
【추론】 이 코드의 범위와 형상을 떠난 노드의 옛 참조는 NODE-044가 정한다(WRITE-086).
【추론】 소비자가 옛 노드 하나를 들고 있으면 그 옛 트리 전체가 수거되지 않고 남는다(WRITE-086).
【추론】 이를 문서화하고, 수명을 이어 가려면 새 핸들에서 다시 찾으라고 안내한다(WRITE-086).

같은 스키마의 reset 한 번은 트리 전체 순회 한 번(로드에만 허용, SETTLE-047)과 자식 프록시를 그리지 않는 마운트된 입력 수만큼의 입력 다시 마운트다(WRITE-051).
참조가 다른 같은 스키마는 스키마 크기에 비례하는 비교 한 번이 더해진다(WRITE-051).
전처리, 검증기 재컴파일, `new Function`, 노드 재생성, 가상화 재지연이 없어진다(WRITE-051).
같은 처리기에서 prop을 바꾼 reset은 로드가 한 번 더 든다(`defaultValue`가 깊게 같으면 건너뛴다)(WRITE-051).
검증기 등록의 메모리는 '살아 있는 작성 루트의 수 + 최근 해제 목록 크기'로 묶인다(WRITE-051).
답 10의 고속성(최소 생성, 메모리 안정, 재생성 방지)과 같은 방향이다(WRITE-051).
스키마가 실제로 바뀐 reset은 오늘과 같은 비용이다(WRITE-051).
【추론】 트리 전체 순회는 로드와, 쓰기가 닿은 하위 트리를 도는 전체 교체 쓰기에서만 허용한다(WRITE-051, SETTLE-047).

### 3.6 노드 되돌림과 로드 스냅숏

reset이 로드하는 배열의 아이템 identity는 `setValue(V)`(`Overwrite`)의 통째 교체와 같은 PR-5의 규칙을 따르고 reset만의 예외를 두지 않는다(WRITE-048).
`setValue(V)`는 로드가 아니라 전체 교체 쓰기라 쓰기 표에서 reset과 다른 행이며, reset만의 예외를 두지 않는 근거는 모든 배열 통째 쓰기가 위치로 잇는다는 NODE-051이다(WRITE-048, WRITE-097).
규칙 자체는 NODE-051의 것이다(WRITE-048).
입력은 REACT-019의 입력 초기화로 초기화되므로 안전은 identity 규칙이 아니라 REACT-019의 범위에 기댄다(WRITE-048).
identity가 끊겨 새로 생긴 아이템은 가상화 기록이 없어 다시 지연된다(WRITE-048).

`FormHandle.reset`의 값 출처 규칙(prop)을 노드 `resetSubtree()`(오늘은 노드 생성 때의 값으로, `AbstractNode.ts:1138-1144`)에 옮기지 않는다(WRITE-049).
두 연산은 이름과 대상(폼의 prop 상태 대 노드 하위 트리)이 달라 한 개념의 두 장치가 아니다(WRITE-049).

【추론】 `resetSubtree()`와 게터 `defaultValue`를 남기고, 둘의 출처를 루트가 드는 로드 스냅숏으로 한다(WRITE-085).
【추론】 루트는 로드 스냅숏 하나를 든다(WRITE-085).
【추론】 경로 P에 값 V를 싣는 로드마다 `snapshot = setIn(snapshot, P, V)`로 고친다(WRITE-085).
【추론】 구조를 나눠 쓰므로 V와 스냅숏의 나머지는 복사하지 않고 P 위의 조상 칸만 새로 짓는다(로드 하나에 O(깊이))(WRITE-085).
【추론】 V는 바꾸지 않는 값으로 다룬다(WRITE-085, WRITE-013, WRITE-071).
【추론】 `node.defaultValue`는 `getIn(snapshot, node.path)`다(WRITE-085).
【추론】 로드가 그 경로에 닿기 전까지 같은 참조를 돌려준다(WRITE-085).
【추론】 `node.resetSubtree()`는 진입 하나에서 `clearSubtreeState()`를 한 뒤 `node.defaultValue`를 그 하위 트리에 로드한다(WRITE-085).
【추론】 로드이므로 빠진 키를 채우고(WRITE-090) 새 수명을 시작한다(WRITE-085, SETTLE-046).
【추론】 `FormHandle.reset()`은 커밋된 prop을 로드하고, 그 값이 스냅숏도 된다(WRITE-085, WRITE-049).
【추론】 스냅숏은 core 자신의 로드 기록이며 prop 규칙을 core로 옮긴 것이 아니므로 WRITE-049는 그대로다(WRITE-085, WRITE-049).
【추론】 배열 아이템은 자기 되돌림 값을 지킨다: 스냅숏은 위치가 아니라 신원을 따른다(WRITE-085).
【추론】 배열의 구조 연산은 그 경로의 스냅숏 배열도 고친다(WRITE-085).
【추론】 `remove(i)`·`pop`은 그 자리를 잘라 내고, `push(v)`·삽입은 새 아이템의 생성 값(`v`, 없으면 `undefined`라 되돌림이 채움을 받는다)을 넣는다(WRITE-085).
【추론】 이 비용은 스냅숏 배열에서 O(배열 길이)이며, 그 연산이 이미 하는 재색인과 같은 차수다(WRITE-085).
【추론】 아이템을 만들거나 없애는 모든 쓰기는 구조 연산처럼 그 경로의 스냅숏 배열의 자리를 맞추고 값은 싣지 않는다(WRITE-085, WRITE-095).
【추론】 "배열 통째 로드"는 로드(마운트·`FormHandle.reset()`·`resetSubtree()`)가 싣는 배열이며, 로드는 위의 규칙을 그대로 따른다(WRITE-085, WRITE-097).
로드가 아닌 배열 통째 쓰기의 스냅숏은 WRITE-095가 정한다(WRITE-085, WRITE-097).
`setValue`는 로드가 아니므로 `defaultValue` 게터와 `resetSubtree()`의 로드 스냅숏을 바꾸지 않는다(WRITE-085, WRITE-090).

【추론】 아이템을 만들거나 없애는 모든 쓰기는 구조 연산처럼 그 경로의 스냅숏 배열의 자리를 맞춘다(WRITE-095).
【추론】 없어진 아이템의 자리는 잘라 내고, 구조 연산(`push(v)`·삽입)은 WRITE-085대로 생성 값 `v`를 스냅숏 자리에 넣고, 아이템을 만드는 비구조 쓰기만 `undefined`를 넣으며, 값은 싣지 않는다(WRITE-095, WRITE-099).
【추론】 WRITE-090의 "`setValue`는 로드가 아니므로 `defaultValue` 게터와 `resetSubtree()`의 로드 스냅숏을 바꾸지 않는다"는 스냅숏의 값에 대한 말이다(WRITE-095).
【추론】 비용은 구조 연산과 같은 O(배열 길이)다(WRITE-095).

- PR: PR-5(배열)(WRITE-095).
- 무엇: 위 실패 장면과, 입력 쓰기·`Merge`로 아이템 수를 바꾼 뒤 각 아이템의 `defaultValue`와 `resetSubtree()`를 본다(WRITE-095).
- 통과: 남은 아이템은 자기 되돌림 값을 지키고, 새 아이템의 `defaultValue`는 `undefined`라 `resetSubtree()`가 채움을 준다(WRITE-095).
- 실패: 스냅숏 배열이 신원과 어긋나면 자리 맞춤을 고친다(WRITE-095).

### 3.7 값 조작 셋과 예약 층

값 조작 셋의 대응은 다음과 같다(WRITE-030).

- 없는 값 채우기 = 채움(`controls.default`·`default`)(WRITE-030).
- 있는 값 바꾸기 = `controls.derived`(자기), `controls.injectTo`(남)(WRITE-030).
- 있는 값 지우기 = `controls.unsetValue`(원본에서), `controls.active: false`(방출에서)(WRITE-030).

런타임에 "없음일 때만 채우는" 별도 키는 두지 않는다(WRITE-030).
`controls.derived`·`controls.injectTo`의 식이 `undefined`를 돌려주면 쓰지 않는다(그 라운드의 후보가 아니다)(WRITE-030).
없음으로 만드는 장치는 `controls.unsetValue` 하나이고 발화원이 둘이다 — 식의 거짓→참, 그리고 정책이 참으로 정해진 노드의 나감(목표 G4(하나의 개념에는 하나의 장치))(WRITE-030).
소유자는 읽기 2에서 "없는 값을 채우는 것과 있는 값을 바꾸는 것, 있는 값을 제거하는 것 모두 원리상 가능해야 한다."라고 했다(WRITE-030).

`controls.derived`는 원본을 쓴다(WRITE-011).

`controls.derived`의 덮어쓰기는 레벨과 혼합안으로 하지 않고 에지로 한다(WRITE-060).
입력을 열어 둔 채 매번 덮어쓰는 레벨은 사용자 편집마다 입력을 리마운트하므로 계승 제약 T-2 "타이핑은 입력을 리마운트하지 않는다"에 걸린다(실행으로 확인)(WRITE-060).
쓴 주체에 따라 방아쇠를 가르는 혼합안은 G4 "특수 경로가 없다"에 걸린다(WRITE-060).
`injectTo`와 로드 규칙이 다른 에지는 G4에 걸린다(WRITE-060).
D-11′(사용자가 파생 필드를 덮어쓸 수 있는가)는 에지다(WRITE-060).

`controls.injectTo`는 작성자가 선언한 전체 교체이고 런타임에는 **원천의 방출이 직전 커밋과 다를 때만** 발화한다(WRITE-012, SETTLE-028).
로드에는 직전 값이 없으므로 발화한다(`fire`, 소유자 동의)(WRITE-012).

`controls.unsetValue`는 로드 정착 안에서 참이면 지운다(WRITE-028).
로드 정착에서 `controls.unsetValue`의 직전 값은 거짓이다(WRITE-028).
같은 정착 안의 채움이나 파생으로 참이 되어도 지운다(소유자 답 21 "현재 데이터를 기준으로")(WRITE-028).
런타임에는 경계에서만 움직인다(WRITE-028).
거짓→참에서 지우고, 참→거짓에서는 아무 일도 하지 않는다(값을 되살리지 않는다)(WRITE-028).

**형상에 없는 노드의 규칙은 평가하지 않는다**(원리 P4(방출은 정책이다): 형상 변화는 쓰기가 아니다)(WRITE-029).
그 노드가 형상 밖에 있는 동안의 원천 변화는 에지가 아니고, 노드가 (다시) 생기면 그 노드의 `controls.unsetValue`·`controls.derived`·`controls.injectTo`의 에지는 거짓→참으로 본다(직전 값이 없다)(WRITE-029).
비활성 원천의 방출이 사라지는 것도 다른 노드의 `controls.injectTo`에 에지가 아니다(WRITE-029).

### 3.8 나감의 비움

(WRITE-037)

| 사건 | 종류 | 누가 | 자식 원본에 미치는 것 |
| ---- | ---- | ---- | -------------------- |
| 나감의 비움(선택, 기본 꺼짐) | 나간 노드의 값을 없음으로 | 작성자 또는 호출자(정책 키를 켠 곳. Form 속성 층은 호출자) | 노드가 **나갈 때**(직전 커밋의 형상에 있었고 이번 최종 형상에 없을 때, 하위 트리 포함) 한 번. 선언이 하나라도 켜져 있으면 나가지 않는다(공유 노드). 로드에는 나감이 없다. 전이 단계, 최종 형상 기준. 다섯째 자동 쓰기(억제 비트·원본 B의 대상). 기본은 유지(P4: 방출에서만 빠지고 원본은 남는다 — 소유자 13라운드: "onChange로 넘어가는 값에서 지워지는 게 기본값이면 된다") |

나감 정책 키 `unsetOnInactive`(이름은 소유자 13라운드 확정. 철자는 노드의 `controls.unsetOnInactive`, Form 속성 `unsetOnInactive`)는 형용사 형(`boolean` 또는 식→`boolean`, 15라운드 결정 2. Form 속성은 `boolean`만)이며 네 층에서 세부가 포괄을 덮는다: 노드 자신 > `controls.children` 항목의 `controls` > 조각의 `controls` > Form 속성(WRITE-031).
같은 층에 여럿이면 하나라도 유지면 유지한다(되돌릴 수 없는 쓰기는 만장일치)(WRITE-031).
자리는 둘이다: 노드의 `controls.unsetOnInactive`(그리고 `children` 항목·조각의 `controls`), Form 속성 `unsetOnInactive`(WRITE-031).
Form 속성은 노드 문맥이 없으므로 `boolean`만이다(WRITE-031).
13라운드는 이름과 기본값만 정했다(17라운드 스웜 수렴(편집자 결정))(WRITE-031).

나감의 정책은 직전 커밋에서 그 노드에 걸려 있던 선언(그때 켜져 있던 조각의 `controls`, 부모의 `controls.children` 항목, 노드 자신의 키)으로 정한다(원리 P3(형상은 상태의 순수 함수다))(WRITE-032).
조각 층은 그 조각이 꺼지는 순간에도 적용된다(WRITE-032).

어느 선언이 걸리는가도, 걸린 선언이 식일 때의 값도 직전 커밋(그 노드가 형상에 있던 마지막 커밋)의 것이다(WRITE-038).
식은 다른 형용사 키처럼 노드가 형상에 있는 동안 계산된 값을 가지며 나감에서는 그 값을 쓴다(WRITE-038).
나가는 순간 형상 밖의 노드를 새로 평가하지 않으므로(WRITE-029의 '형상에 없는 노드의 규칙은 평가하지 않는다', 12라운드 §9 소유자 동의) 식은 나감을 일으킨 변화를 보지 못한다(보게 하려면 12라운드 §9에 예외가 필요하다. 소유자 통보 2 허용: "예. 허용해야 합니다.")(WRITE-038).
Form 속성 층은 정착이 시작될 때 core가 든 값이며 속성의 바뀜은 나감이 아니다(WRITE-038).
Form 속성 층은 정착이 시작될 때 core가 든 값(React가 마지막으로 커밋한 속성)이며, 속성이 바뀌는 것은 쓰기도 나감도 아니고 이미 잠복한 원본을 거슬러 비우지 않는다(WRITE-038).
Form 속성 층은 네 층의 가장 아래(포괄) 층이며 참일 때 로컬을 덮는 전체 잠금(`readOnly`·`disabled`)과 다르다(WRITE-038).

나가는 객체·분기에 켠 `unsetOnInactive`는 함께 나가는 하위 트리로 내려간다(17라운드 소유자 답 R17-2 ㄴ: "해당 브랜치가 꺼질떄, 하위 트리노드가 모두 꺼진다고 봐야할거같아". 13라운드 답 1의 둘째 예외)(WRITE-033).
이것은 13라운드 답 1("모든 control 필드는 자체 노드만 지원. children 그룹은 예외")에 둔 둘째 예외다(WRITE-033).
나가는 노드의 비움 여부는 그 노드와 그 위의 **나가는** 조상들을 가까운 순서로 보아, 직전 커밋의 위 층 가운데 하나라도 명시된 첫 마디가 정하고(한 마디의 같은 층에 여럿이면 하나라도 유지면 유지), 끝까지 없으면 Form 속성이 정한다(WRITE-033).
직전 커밋에서 보는 층은 세 층(노드 자신 > 그 노드를 가리키는 `controls.children` 항목의 `controls` > 그 노드를 직접 선언한 조각의 `controls`)이다(WRITE-033).
그래서 자손이 스스로 적은 선언이 가까운 순서로 이긴다(자손의 `false`는 남긴다)(WRITE-033).
나가지 않는 조상의 정책은 내려가지 않는다(WRITE-033).
나가지 않는 조상과 나가지 않는 선언의 정책은 내려가지 않는다(WRITE-033).

나감 사슬의 세부 셋은 다음과 같다(WRITE-034).

- (가) 노드는 남고 그 노드를 선언한 조각만 꺼지는 "선언의 나감"(판별 union의 공유 객체 `addr` 아래 A 분기에만 있는 `zip`)도 사슬의 한 마디로 센다(WRITE-034). 그 층은 나가는 선언 안의 자기 키 > 나가는 선언 또는 나가는 노드의 부모 선언에 속한 `children` 항목 > 그 선언을 호스트의 직계 자식으로 적은 조각이며, 나가지 않는 선언의 층은 세지 않는다(WRITE-034).
- (나) 앞서 자기 게이트로 나가 원본을 든 채 잠복한 자손도 조상이 비움으로 나가는 순간 같은 사슬로 정해 비운다(WRITE-034). 잠복 자손 자신의 층은 직전 커밋에 효력이 있던 선언만 세므로 명시한 유지는 이긴다(WRITE-034). 앞선 호출에서 `DisableAutomaticWrites`로 억제된 잠복 원본도 뒤의 다른 호출에서는 비운다(WRITE-034).
- (라) 선언의 나감에서는 `extras`를 건드리지 않는다(WRITE-034).

남는 순서 의존 하나(조각에 명시한 유지가 조상보다 먼저 꺼진 경우)는 조각 범위 규칙의 귀결이다(WRITE-034).

함께 닫힌 것(17라운드 스웜 수렴(편집자 결정)): 비움으로 정해진 노드는 `raw`(잘못된 종류의 값 포함)와 `extras`를 모두 없음으로 한다(WRITE-035).
두 상태에는 자기 층이 없으므로 그 노드의 해석된 정책을 따른다(WRITE-035).

쓰기로 원본이 없어진 소멸(배열 아이템 `remove`, 통째 교체, 로드)은 나감이 아니다(WRITE-036).
`controls.children` 항목의 `controls.active: false`는 노드 게이트다(WRITE-036).
쓰기로 원본 자체가 없어져 노드가 사라지는 것(배열 아이템 `remove`, 통째 교체로 짧아진 배열, 로드)은 나감이 아니라 소멸이며 비움의 대상도, 억제 비트·원본 B의 기록 대상도 아니다(WRITE-036).
비객체 호스트 아래 자식은 존재하므로 나감이 아니다(WRITE-036).
부모 `controls.children` 항목의 `controls.active: false`(항목 게이트)는 노드 게이트와 같은 장치라 그 노드 자신의 나감이며 층(자기 키 > 그 항목을 포함한 `children` 항목 > 조각)을 그대로 센다(17라운드 스웜 수렴(편집자 결정))(WRITE-036).

노드 게이트 `controls.active: false`도 같은 장치라 `controls.active`는 정책대로 비우고 `controls.visible`은 언제나 보존한다(WRITE-039).

비용: 나감의 비움은 나간 하위 트리를 위에서 아래로 한 번 순회하며 조상의 정책을 인자로 내려보낸다(노드당 상수, 위로 거슬러 오르지 않는다)(WRITE-040).
청사진이 "하위 트리에 정책 선언 없음"을 미리 표시하면 Form 속성이 꺼져 있을 때 순회를 건너뛴다(WRITE-040).
꺼진 조각이 선언한 하위 트리와 잠복 하위 트리의 순회가 더해지며(노드당 상수), 이것은 SETTLE-017의 비용의 상한(재계산 목록과 자동 쓰기 기록만 순회한다)에 둔 예외다(WRITE-040, SETTLE-017).

### 3.9 core가 값을 바꾸던 곳

(WRITE-022, WRITE-023, WRITE-024, WRITE-025, WRITE-026)

| 오늘의 동작 | 새 원칙에서 |
| ---------- | ---------- |
| 배열을 `minItems`까지 채우기, `maxItems` 초과 `push` 차단 | **입력 컴포넌트로.** core는 제약을 유효 스키마로 노출하고 위반은 검증이 알린다 |
| nullable이 아닌 객체의 `null`을 `{}`로 바꾸기(S7), 비객체 값 버리기 | **폐기.** 보존·방출하고 type 에러를 낸다. 동작 변화로 기록한다(F27, GOAL-075) |
| `Normalize`의 미선언 키 제거 | **폐기.** 미선언 키는 `extras` 칸에 보존하고 받은 순서로 방출한다(E16) |
| 분기 전환·`active` 전이의 reset — 오늘의 동작(12·14라운드 탐침): 꺼지면 원본을 지우고, 다시 켜지면 노드가 생성될 때의 값(없으면 `default`)으로 되돌린다. 뒤의 전체 교체는 이 복원 값을 바꾸지 않는다. `oneOf` 전환에서 둘 다 없으면 앞 분기의 같은 이름·같은 타입 터미널 값을 잇는다 | **기본은 폐기.** 원본을 두고 방출에서만 뺀다. 같은 종류의 노드를 공유하므로 값이 남는다(BLUEPRINT-010). 원본까지 지우려면 작성자가 나감 정책 키를 켠다. 그때도 로드 값으로 복원하지 않고, 다시 생긴 노드는 채움(`controls.default` > `default`)을 받는다(WRITE-002, SETTLE-005) |
| 조각이 켜질 때의 `default` 주입 | **채움으로 바뀐다.** 노드가 생길 때 한 번, 노드 단위, 원천은 `controls.default` > `default`(SETTLE-005) |
| `computed.derived`, `injectTo` | **남는다.** 예약 층의 `controls.derived`·`controls.injectTo`가 되며, 작성자가 명시한 쓰기이므로 이 원칙의 대상이 아니다. `controls.unsetValue`가 같은 부류로 더해진다 |
| 참조 그룹(`options.virtual`) | **현행 유지**(`options.virtual`로 유지하되 `required` 재작성은 버리고 `options` 그룹째 검증기 앞에서 지워진다, VALIDATE-034). 소유자: "virtual 은 스키마로 선언되는건 아니니까 그냥 둡시다. 유효성검증도 영향 없고." 참조 그룹 노드로의 전환(D-6)은 하지 않는다 |

오늘의 동작(꺼지면 원본을 지우고 켜지면 노드가 생성될 때의 값, 없으면 `default`로 복원)은 이주 항목이다(WRITE-041). 소유자: "onChange로 넘어가는 값에서 지워지는 게 기본값이면 된다."(WRITE-041). 13라운드 답 2의 되물음("차이는 재전환시 값의 잔류 여부인건가?")의 답: 차이는 셋이다(WRITE-041). 다시 켜질 때 옛 값이 되살아나는가, 꺼진 동안 읽히는가(잠복 원본 열거는 루트 노드의 함수이고 노드마다 getter `inactiveValues`), 그 원본이 메모리에 남는가(WRITE-041, VALUE-029).

### 3.10 parse와 자동 변환, 포커스 아웃 trim

확정. 노드마다 타입에 맞는 parse 함수를 둔다(WRITE-052). 이것은 값의 교정이 아니라 JSON·JS 자동 형변환을 통제할 수 있게 구현한 것이므로 결정 WRITE-001의 대상이 아니다(WRITE-052). 확정(나)이며, parse는 뜻이 그대로인 변환만 한다(ajv 규칙 수준)(WRITE-052). 오늘 파서의 문자 제거, 정수 자르기, 빈 값 치환(`""`, `[]`, `{}`), 불리언의 진릿값 변환은 parse에서 뺀다(WRITE-052). 결정 WRITE-001에는 이름 붙은 예외(형 정규화)로 적는다(WRITE-052).

편집자가 닫을 세부: parse는 각 동작 행의 `interpret`(입력 해석) 칸이 부르고, 적용 범위는 '지금처럼'을 따라 노드에 드는 모든 쓰기다(WRITE-056). `parsers`의 새 자리는 NODE-056이 정한다(WRITE-056).

【추론】 `interpret` 칸의 계약은 순수, 던지지 않음, 모든 입력에 값을 돌려줌, 멱등, 바꾸지 못하면 항등이다(WRITE-084).

변환 목록(ajv `coerceTypes`의 부분집합): 수 노드는 앞뒤 공백을 뺀 전체가 수 표기인 문자열을 유한한 수로 바꾸고(정수 노드는 결과가 안전한 정수일 때만, 이미 수인 값은 자르지 않는다), 문자열 노드는 유한한 수와 불리언을, 불리언 노드는 정확히 `"true"`·`"false"`와 수 1·0을 바꾼다(WRITE-075). `null`은 어느 노드에서도 바꾸지 않는다(WRITE-075). 이미 자기 타입인 값은 그대로 둔다(WRITE-075). 수 노드가 바꾸는 문자열의 조건은 다음과 같다: "수 노드: 문자열이고, 앞뒤 공백을 뺀 나머지가 비어 있지 않은 JSON 수 표기(부호 `-`, 10진 정수부, 소수부와 지수부는 있어도 되고 없어도 됨)일 때 수로 바꿉니다. 결과가 유한해야 합니다. 소수부와 지수부가 없는 정수 표기라면 결과가 안전한 정수 범위 안에 있어야 합니다."(WRITE-075).

자동 변환(`"123"`을 123으로)은 18라운드 소유자 답 S1의 parse 자체이며 지금처럼 늘 켜져 있다(끄는 옵션을 두지 않는다)(WRITE-076). 끄는 옵션은 두지 않는다(WRITE-077). 필요가 생기면 노드나 스키마 단위가 아니라 `<Form>`의 prop 하나로 더한다(설계 예약: 폼 단위, 이름은 그때 정함)(WRITE-077).

확정(나′, 경고등, `onError` 전달)(WRITE-054). 바꾸지 못한 값은 받은 그대로 들고 `value`·방출·제출이 모두 그 값이다(비우기·대체·거부 없음)(WRITE-054). 노드는 정합 상태(경고등)를 들고, 이것이 공개 형의 판별자다(이름과 모양은 SURFACE-061)(WRITE-054). 소유자(S1 셋째 답): "나 로 확정합니다. 경고등 추가도 승인합니다. 변환에러는 onError 로 전달하죠."(WRITE-054). 소유자(S1 셋째 답의 넷째 말): "그럼 이건 어때? Node 가 자신 타입에 맞는 값을 제공한다는걸 보장하진 못하지만, 현재 Node 의 값이 '정합한지' 여부는 상태로 둘 수 있을거같아. error 와 별개로, 이 상태를 보고 현재 값의 건전성을 판단하도록 하는건 어떤가?"(WRITE-054).

자른 값의 쓰기는 core의 **자동 쓰기**다(17라운드 소유자 답 R17-3 선택지 "다"의 원문 "자동 쓰기가 여섯이 됨"이 맞고, 17라운드 반영 칸의 "자동 쓰기가 아니다"는 편집자의 오독이었다)(WRITE-078). 따라서 자동 쓰기는 여섯이고 억제 비트(`DisableAutomaticWrites`)의 대상이며, 억제를 켠 폼에서는 포커스 아웃 때 자르지 않는다(WRITE-078). 자른 값이 현재 값과 같으면 쓰지 않는다(소유자 확정)(WRITE-078).

【추론】 포커스 아웃 때 자른 값을 쓰는 것은 자동 쓰기다(WRITE-083). 【추론】 다른 자동 쓰기(채움, `derived`, `injectTo`, `unsetValue`, 나감의 비움)처럼 원본만 쓴다(WRITE-083). 【추론】 바깥 오류를 지우지 않고 dirty를 표시하지 않는다(오늘 `trim`과 같다)(WRITE-083). 【추론】 값 쓰기, 바깥 오류 지움, dirty 표시를 `batch` 하나로 묶자는 스웜의 권고(`reviews/round-18-agenda.md:45`)는 버린다(WRITE-083). 【추론】 그 세 가지 묶음은 사용자 입력의 `handleChange`에만 있는 것이다(WRITE-083). 【추론】 자른 값이 현재 값과 같으면 쓰지 않는다(WRITE-083, WRITE-078). 【추론】 억제를 켠 폼에서는 자르지 않는다(WRITE-083). 【추론】 자동 쓰기이므로 그 노드의 입력은 Refresh를 받는다(WRITE-083). 【추론】 이미 포커스를 잃은 뒤라 치던 글자를 잃지 않는다(WRITE-083). 【추론】 `UpdateValue`의 출처 칸 값은 자동 쓰기(trim)다(WRITE-083, EVENT-060). 【추론】 바깥 오류는 검증 결과 층이다(WRITE-083). 【추론】 그래서 ERROR-001의 층 구분은 바뀌지 않는다(WRITE-083).

### 3.11 union 행의 해석과 쓰기 경계

【추론】 청사진은 union 칸마다 기본 spec `UnionSpec { kinds, mask, nullable }`을 한 번 만들어 얼리며, `kinds`는 그 칸의 `schemaType`과 같은 참조다(WRITE-093). 【추론】 유효 목록이 좁혀진 노드는 `{ kinds: 유효 목록, mask, nullable }`을 그 노드의 유효 스키마 메모 항목에 함께 둔다(WRITE-093). 【추론】 `interpret`는 노드의 현재 spec을 받으며, 좁히지 않은 노드의 현재 spec은 기본 spec 그 자체다(WRITE-093).

【추론】 노드의 유효 목록(BLUEPRINT-041의 통합 원리 U4·U5)은 노드마다 계산하고, 유효 스키마 메모가 바뀔 때만 다시 계산한다(WRITE-093). 【추론】 좁히는 게이트가 없으면 유효 목록은 `schemaType`과 같은 얼린 참조를 공유하며, 이것이 흔한 경우이고 비용은 0이다(WRITE-093). 【추론】 교집합에 `'null'`만 남으면(노드가 nullable이고 게이트가 `{null}`만 허용) 유효 목록은 빈 목록이고, null이 아닌 모든 값에 경고등이 켜지며, 기본 입력은 빈 읽기 전용이다(WRITE-093).

【추론】 `isMember(value, kind)`는 JSON Schema의 뜻을 따른다(WRITE-093).

- 【추론】 `isMember(v, 'string')`은 `typeof v === 'string'`이다(WRITE-093).
- 【추론】 `isMember(v, 'number')`는 `typeof v === 'number' && Number.isFinite(v)`이다(WRITE-093).
- 【추론】 `isMember(v, 'integer')`는 `Number.isInteger(v)`이며 안전한 정수 범위는 보지 않는다(ajv와 같음)(WRITE-093).
- 【추론】 `isMember(v, 'boolean')`은 `typeof v === 'boolean'`이다(WRITE-093).
- 【추론】 `isMember(v, 'object')`는 `typeof v === 'object' && v !== null && !Array.isArray(v)`이며 프로토타입은 보지 않는다(WRITE-093).
- 【추론】 `isMember(v, 'array')`는 `Array.isArray(v)`이다(WRITE-093).
- 【추론】 `null`은 목록이 아니라 `nullable`로만 보며, `v === null`이다(WRITE-093).

【추론】 `convert(value, kind)`는 WRITE-075를 옮긴 것이며, 이미 그 형인 값에는 부르지 않는다(WRITE-093).

- 【추론】 `convert(·, 'number')`는 앞뒤 공백을 뺀 전체가 JSON 수 표기이고 결과가 유한한 문자열을 `Number(t)`로 바꾸며, 소수부·지수부 없는 표기는 안전한 정수여야 하고, 불리언, `"01"`, `"1e400"`, `"9007199254740993"`은 받지 않는다(WRITE-093).
- 【추론】 `convert(·, 'integer')`는 `number` 변환이 되고 결과가 `Number.isSafeInteger`인 문자열을 바꾸며(`"1.0"`→`1`, `"1e2"`→`100`), 이미 수인 값(자르지 않음), `"1.5"`, `"1e16"`은 받지 않는다(WRITE-093).
- 【추론】 `convert(·, 'string')`은 유한한 수를 `String(n)`으로(`-0`→`"0"`), 불리언을 `"true"`·`"false"`로 바꾸며, `NaN`·`±Infinity`, `null`, 객체, 배열은 받지 않는다(WRITE-093).
- 【추론】 `convert(·, 'boolean')`은 정확히 `"true"`·`"false"`와 수 `1`→`true`, `0`·`-0`→`false`를 바꾸며, `" true"`, `"1"`, 그 밖의 수는 받지 않는다(WRITE-093).
- 【추론】 `convert(·, 'object')`와 `convert(·, 'array')`는 아무것도 받지 않는다(WRITE-093, BLUEPRINT-036).

【추론】 `interpret(value, spec)`는 `undefined`이면 `undefined`, `null`이면 `null`(VALUE-033), 멤버이면 참조 그대로를 돌려준다(WRITE-093). 【추론】 그 밖에는 목록의 형마다 `convert`를 해서 성공한 결과를 `===`로 중복 없이 세고, 결과가 정확히 하나면 그 값을, 아니면 `value`를 돌려준다(WRITE-093, BLUEPRINT-042). 【추론】 `interpret`는 순수하고, 던지지 않으며, 멱등이고, 바꾸지 못하면 항등이다(WRITE-093, WRITE-084). 【추론】 후보는 배열에 모으지 않고 개수와 첫 결과만 세며, 할당 없이 구현한다(WRITE-093).

【추론】 원소가 하나인 목록은 단일 노드의 행과 같다: `['integer','number']`는 number 규칙을 따른다(WRITE-093). 【추론】 `['integer','number','boolean']`의 `"2"`는 결과가 둘이지만 같은 값이므로 `2`다(WRITE-093). 【추론】 둘 이상의 형이 받아 주는 경우는 정확히 목록 ⊇ {string, boolean}, 목록 ∩ {number, integer} = ∅, 값 ∈ {0, -0, 1}일 때이며, `object`·`array`가 있고 없음에 따라 4종 × 값 3개로 12건이다(WRITE-093). 【추론】 그 증명: 문자열은 `number`·`integer`(같은 결과)와 `boolean`(`"true"`·`"false"`, 수 표기가 아님)이 받아 둘이 겹치지 않고, 불리언은 `string` 하나만 받으며, 비유한 수·`null`·객체·배열·그 밖의 값은 아무 형도 받지 않고, 유한한 수는 `string`(늘)과 `boolean`(`0`·`-0`·`1`)이 받는다(WRITE-093). 【추론】 전수 실행(`reviews/raw-round18-union-swarm/d-rule-a.mjs`, 목록 127개 × nullable 2 × 값 40종 × 모든 순열)에서 경우는 12건이고 순서 위반과 멱등 위반은 0이므로, 규칙 A는 선언 순서와 무관하다(WRITE-093).

【추론】 `interpret`는 노드에 드는 모든 쓰기의 경계에서 한 번 돈다(WRITE-093, WRITE-056). 【추론】 그 쓰기는 입력 쓰기(옵션 없음·`Merge`·`Overwrite`, WRITE-091), `setValue(V)`와 로드(마운트·`reset()`·`resetSubtree()`, WRITE-090), 조상 쓰기가 나눠 준 값(WRITE-018, WRITE-082), 채움(WRITE-090), `controls.derived`(WRITE-011), union 노드 자체를 대상으로 한 `controls.injectTo`(WRITE-012), `unsetValue`와 나감의 비움, 포커스 아웃 `trim`(WRITE-083)이다(WRITE-093).

【추론】 한 진입에서 쓰인 값의 두 번 해석(BLUEPRINT-041의 통합 원리 U7)에서, 쓰기 경계에서는 게이트와 무관한 정적 목록(`schemaType`, `nullable`)으로 해석하며, 로드(마운트, `FormHandle.reset()`, `resetSubtree()`)도 같다(WRITE-093, WRITE-098). 【추론】 둘째 해석은 그 진입의 전이 단계에서 커밋 전에 하며, 전이 단계에서는 최종 유효 목록이 정적 목록보다 좁은 노드만, 첫째 해석의 결과가 아니라 원래 쓰인 값을 최종 유효 목록으로 다시 해석해 원본으로 삼는다(WRITE-093, WRITE-098). 【추론】 그래서 `setValue({kind:'num', a:'42'})`는 직전 상태와 상관없이 `a = 42`이다(WRITE-093).

【추론】 union 노드에 대한 `Merge` 쓰기는 늘 값 전체를 바꾼다: union은 객체 호스트가 아니다(WRITE-093, WRITE-079). 【추론】 union 값 안(`/slot/key`)을 가리키는 `controls.injectTo` 대상은 동적 대상 없음 `SCHEMA_FORM_ERROR.INJECT_TARGET_MISSING`이다(WRITE-093, CONTROLS-079). 【추론】 어긋난 값을 로드하면 바꾸지 않고 그대로 들고, 경고등을 켜며, 받은 그대로 방출한다(WRITE-093, WRITE-054, VALUE-033). 【추론】 `trim`은 union 행의 `finishInput`이 맡으며, 현재 값이 문자열이면 자르고 그 결과를 `interpret`에 넘기고, 문자열이 아니면 아무것도 하지 않으며, 경고는 없다(WRITE-093, CONTROLS-006). 반영 칸(설계서 메모 4)이 정한 경고등의 이름은 게터 `typeMismatch: boolean`, 경로 목록 `typeMismatches: readonly string[]`, 경고 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`다(WRITE-093, SURFACE-061).

- PR: PR-2(행·`interpret`·경고등·두 번 해석·방출)·PR-4(검증 에러의 귀속과 경고 코드 확정)(WRITE-093).
- 무엇: `src/core/behaviors/utils/parse/__tests__/interpret.table.test.ts`·`interpret.properties.test.ts`, `src/core/behaviors/unionBehavior/__tests__/union.write-paths.test.ts`·`union.mismatch-light.test.ts`, 렌더 시나리오 `union.gated-effective-list`·`union.entry-two-step`·`union.rule-a`·`union.ambiguous`·`union.integer`·`union.object-array`·`union.non-json-value`·`union.omit-empty`·`union.default-fill`·`union.expressions`를 돌린다(WRITE-093).
- 통과: 변환 표의 모든 칸, 전수 실행의 12건·순서 무관·멱등·쓰기당 할당 0, 쓰기 경로마다의 사례, 경고등의 켜짐·재발송 규칙과 기록 칸이 위대로다(WRITE-093).
- 실패: 전수 실행에서 12건 밖의 경우나 순서 위반이 나오면 `convert` 표를 고치고, 규칙이 사례를 하나로 정하지 못하면 이 블록을 고친다(WRITE-093).

【추론】 쓰기 경계에서는 그 노드의 정적 목록(`schemaType`, `nullable`)으로 한 번 해석한다(WRITE-098). 【추론】 이 목록은 게이트와 무관하므로 직전 상태에 기대지 않는다(WRITE-098). 【추론】 전이 단계에서는 이 진입에서 쓰인 노드마다, 최종 유효 목록이 정적 목록보다 좁으면 원래 쓰인 값(쓰기 경계에서 바뀐 값이 아니라 호출자·입력이 준 값)을 최종 유효 목록으로 다시 해석해 그 결과를 원본으로 삼는다(WRITE-098). 【추론】 그래서 결과는 "쓰인 값을 최종 유효 목록으로 한 번 해석한 것"과 같고, 직전 커밋의 게이트 상태에 기대지 않는다(WRITE-098).

【추론】 예: 본체 `a:{type:['string','boolean']}`에 `kind`가 `'text'`면 `a`를 `string`으로, `'flag'`면 `boolean`으로 좁히는 게이트가 있을 때, `setValue({kind:'flag', a:0})`는 직전 `kind`가 무엇이든 `a = false`다(WRITE-098). 【추론】 이 진입에서 쓰이지 않은 노드는 다시 해석하지 않는다(소급 변환 없음)(WRITE-098). 【추론】 로드(마운트, `FormHandle.reset()`, `resetSubtree()`)도 같은 두 단계를 따른다(WRITE-098). 【추론】 비용: 쓰인 노드 가운데 유효 목록이 정적 목록보다 좁은 노드에 한해 `interpret` 한 번과 쓰인 값의 참조 보관이다(WRITE-098). 【추론】 WRITE-093의 "첫째 해석의 목록은 직전 커밋의 유효 목록"과 "둘째 해석은 … 목록이 바뀐 노드에서만 결과를 바꾼다(`interpret`가 멱등)"는 이 블록이 대체하며, WRITE-093의 `setValue({kind:'num', a:'42'})` 예는 이 규칙에서도 `a = 42`다(WRITE-098).

【추론】 노드의 유효 목록은 `schemaType` ∩ (켜진 게이트 선언의 허용 집합)을 원소마다의 교집합(BLUEPRINT-044)으로 계산하고 `'null'`을 뗀 것이며, 이는 유효 스키마 `type`의 병합 결과와 같다(BLUEPRINT-041의 통합 원리 U4·U5, BLUEPRINT-021, WRITE-098). 【추론】 이 정의는 모든 종류에 같으며, 원소가 하나인 목록은 단일 노드의 경우이고, number 노드에 게이트 `integer`가 켜지면 정수 규칙을 따른다(WRITE-098).

- PR: PR-2(두 번 해석)(WRITE-098).
- 무엇: 렌더 시나리오 `union.entry-two-step`에 위 예의 폼을 더해, 직전 `kind`가 `'text'`일 때와 `'flag'`일 때 각각 `setValue({kind:'flag', a:0})`를 부르고, `defaultValue`가 `{kind:'flag', a:0}`인 마운트와, `kind`를 `'text'`로 바꾼 뒤 두 필드를 담은 객체 노드의 `resetSubtree()`를 돌린다(WRITE-098).
- 통과: 모든 경우에 `a === false`이고 경고등이 꺼져 있으며, 쓰이지 않은 형제 노드는 다시 해석되지 않는다(WRITE-098).
- 실패: 결과가 직전 상태에 따라 갈리면 두 단계의 목록과 다시 해석하는 값을 고친다(WRITE-098).

【추론】 전이 단계의 재해석은 전이 쓰기다(WRITE-099). 【추론】 그 결과가 원본을 바꾸고 게이트를 뒤집으면 채움·비움과 같은 규칙으로 다음 라운드를 부르며, 라운드 상한(게이트 가진 조각 수 + 노드 게이트 수 + 1, SETTLE-005)은 그대로다(WRITE-099). 【추론】 한 노드는 한 라운드에 한 번만 다시 해석한다(WRITE-099). 【추론】 예: 본체 `a:{type:['string','boolean']}`에 `a`가 수이면 `boolean`으로, 아니면 `string`으로 좁히는 게이트가 있을 때, `setValue({a:0})`는 쓰기 경계에서 `0`(받아 줄 형이 둘이라 그대로)이고, 첫 라운드의 재해석에서 `false`가 되어 게이트가 `string`으로 뒤집히며, 다음 라운드의 재해석에서 `"0"`이 되고 게이트가 더 뒤집히지 않으므로 `a = "0"`이 커밋된다(WRITE-099).

【추론】 상한을 넘기면 SETTLE-011대로 원본 B를 커밋하고, 원본 B에는 쓰기 경계의 해석(정적 목록)만 남는다(WRITE-099). 【추론】 전이 단계의 재해석은 게이트 상태가 최종이 아니므로 원본 B에서 버린다(WRITE-099). 【추론】 원본 B에 남은 값이 좁혀진 유효 목록 밖이면 경고등이 켜진다(WRITE-099). 【추론】 비용: 라운드마다, 유효 목록이 바뀐 쓰인 노드에 한해 `interpret` 한 번이다(WRITE-099).

【추론】 `VALIDATOR_COMPILE_FAILED`는 폼 수준 기록이다(WRITE-099). 【추론】 그 기록은 폼 수준 로드(마운트, `FormHandle.reset()`)마다 한 번 낸다(WRITE-099). 【추론】 `resetSubtree()`는 그 기록을 다시 내지도 초기화하지도 않으며, 그 기록이 막은 `OnChange` 검증 예약은 다음 폼 수준 로드까지 막힌 채다(WRITE-099). 【추론】 그래서 "한 로드에 한 번"(VALIDATE-048)을 `resetSubtree()`의 하위 트리에 적용한다는 문장은 이 블록이 대체한다(WRITE-099).

【추론】 정적 선언이 없는 이름에서 게이트 없는 분기끼리 fold가 다르면 게이트 없는 선언끼리의 다른 종류이므로 `SHARED_NODE_KIND_CONFLICT` 청사진 오류다(BLUEPRINT-012, 소유자 O-10)(WRITE-099). 【추론】 `node.type`의 값은 여덟(`virtual` 포함)이고, BLUEPRINT-032의 "일곱"은 스키마에서 오는 종류만 센 것이다(WRITE-099). 【추론】 `union` 노드의 입력은 목록의 한 형의 값이나 없음을 보내며, 어떤 형을 보낼지는 입력 구현(UI 플러그인)이 정한다(BLUEPRINT-040의 반영 칸, 목록을 읽는 자리는 BLUEPRINT-040)(WRITE-099). 【추론】 목록 밖 `default`의 경고등·경고는 마운트만이 아니라 노드가 생길 때마다(WRITE-090의 채움 시점) 켜고 보낸다(WRITE-099).

【추론】 구조 연산(`push(v)`·삽입)은 WRITE-085대로 생성 값 `v`를 스냅숏 자리에 넣고, 아이템을 만드는 비구조 쓰기만 `undefined`를 넣는다(WRITE-099). 【추론】 `NON_JSON_WHOLE_VALUE`의 깊이 점검은 VALUE-037대로 개발 모드에서만 돌며, 핸들러가 있어도 프로덕션에서는 돌지 않는다(WRITE-099). 【추론】 좁혀지지 않은 노드의 유효 목록은 `schemaType` 그 값(스칼라면 스칼라, 배열이면 그 배열 참조)이며 "같은 참조"는 이것을 뜻한다(WRITE-099). 【추론】 그래서 청사진 판정의 예 E26(BLUEPRINT-045)에서 게이트가 켜진 동안의 유효 목록은 `schemaType`과 같은 `'number'`다(WRITE-099).

- PR: PR-2(전이 라운드)(WRITE-099).
- 무엇: 렌더 시나리오 `union.entry-two-step`에 위 예의 폼과, `a`가 문자열이면 `boolean`으로 아니면 `string`으로 좁히는 폼(되먹임이 멈추지 않는 반례)을 더해 각각 `setValue({a:0})`를 부른다(WRITE-099).
- 통과: 첫 폼은 `a === "0"`이고 경고등이 꺼져 있으며, 둘째 폼은 전이 라운드 상한을 넘겨 원본 B로 `a === 0`을 커밋하고 경고등이 켜지며 `diagnostics.status`가 `'degraded'`다(WRITE-099).
- 실패: 재해석이 라운드를 부르는 규칙이나 원본 B에 남는 값을 고친다(WRITE-099).
- PR: PR-2(스냅숏·유효 목록)(WRITE-099).
- 무엇: 배열에 `push('x')`와 삽입을 한 뒤 새 아이템의 `defaultValue`와 `resetSubtree()`를 보고, E26 폼에서 게이트를 켠 뒤 `a`의 유효 목록을 본다(WRITE-099).
- 통과: 새 아이템의 `defaultValue`는 생성 값이고 `resetSubtree()`가 그 값으로 되돌리며, E26의 유효 목록은 `node.schemaType`과 같은 `'number'`다(WRITE-099).
- 실패: 스냅숏 자리 맞춤이나 유효 목록의 표현을 고친다(WRITE-099).
- `push(v)`와 삽입의 스냅숏 시험은 배열 행을 들여오는 PR-5가 하고, PR-2(스냅숏·유효 목록)의 게이트에는 유효 목록 시험만 남는다(WRITE-099, LANDING-065).
- PR: PR-4(검증 불가 기록)(WRITE-099).
- 무엇: 전체 스키마 컴파일이 실패하는 `OnChange` 폼을 마운트하고 값을 쓴 뒤, 자식의 `resetSubtree()`를 부르고 값을 쓰며, 이어 `FormHandle.reset()`을 부르고 값을 쓴다(WRITE-099).
- 통과: `VALIDATOR_COMPILE_FAILED`는 마운트 뒤와 `FormHandle.reset()` 뒤에 한 번씩 나고, `resetSubtree()` 뒤에는 다시 나지 않으며 그 뒤의 쓰기도 `OnChange` 검증을 예약하지 않는다(WRITE-099).
- 실패: 기록의 단위를 고친다(WRITE-099).
- PR: PR-1(청사진 판정)(WRITE-099).
- 무엇: `union.kind-procedure.test.ts`에 정적 선언 없이 호스트의 게이트 없는 `oneOf` 분기 둘이 같은 이름을 `string`과 `number`로 적은 칸을 더하고, `virtual` 노드를 가진 코퍼스에서 `node.type`의 값을 모으며, `union.type-test.ts`에서 union props의 `onChange` 형을 본다(WRITE-099).
- 통과: 그 칸은 `SHARED_NODE_KIND_CONFLICT` 청사진 오류이고, 모은 값은 모두 여덟 값 가운데 하나이며, union props의 `onChange`는 목록의 형의 값과 없음만 받는다(WRITE-099).
- 실패: 절차나 종류 목록이나 props의 형을 고친다(WRITE-099).
