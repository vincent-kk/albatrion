# 단일 원장 — 노드 구조

기준 커밋: `ba398c330`(저장소 `packages/canard/schema-form/architecture`). 정본 우선순위는 다음 순서다. (1) 소유자 답은 고정이다. (2) 이 영역에는 채택된 ADR이 없다. `adr/0011-branch-node-composition.md`는 "제안" 상태이며 17라운드에 노드 구조 부분이 고쳐졌고, 노드 구조의 가장 뒤 정본은 17라운드의 `09-landing-and-test-strategy.md` §3이다. (3) `03-mental-model.md`(원장)는 08과 다르면 원장이 이긴다. (4) 뒤 라운드가 앞 라운드를 이긴다. `05-before-after.md`·`06-conclusions.md`·`07-conclusions.md`는 그때의 기록이며 고치지 않는다. 상태 값의 뜻: **현행**은 지금 유효한 규칙, **대체됨**은 한때 유효했으나 뒤 라운드나 소유자 답으로 바뀐 규칙(옛 문장을 원문 그대로 남긴다), **열림**은 18라운드 안건으로 넘어가 아직 정해지지 않은 것이다. 한 줄의 이어진 여러 문장만 옮긴 항목은 출처를 `path:line#a-b`로, 한 문장만 옮긴 항목은 `path:line#n`으로 적는다.

## 색인

| 번호 | 한 줄 요약 | 상태 | 닫은 사람 |
| --- | --- | --- | --- |
| NODE-001 | 노드 구조 — 상속 없는 단일 클래스와 종류별 동작 행 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:24` 노드 구조) |
| NODE-002 | 클래스 하나, 행 하나 — `BEHAVIORS[type][strategy]`, 필드 `behavior`, 게터 `type`·`strategy` | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:24` 노드 구조), 소유자 답(`reviews/round-17-owner-answers.md:21` 종류별 동작 표의 이름), 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈; 표의 두 단계), 소유자 답(`reviews/round-17-owner-answers.md:23` `kind` 필드), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-02) |
| NODE-003 | 공개 `node.group`은 `node.strategy`로 바뀐다(값은 그대로) | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름) |
| NODE-004 | 공통 필드와 `structure`·`runtime`, 노드 인스턴스가 곧 레코드, `settle`의 자유 함수 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:46` 14 트리마다 하나인 공용 칸), 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md` §2; 칸의 내용과 `settle`의 자유 함수), 17라운드 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:38`·`reviews/raw-round17-node-structure.md:154`; 소유자 이견 없이 권고대로 확정된 칸 `structure`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-33) |
| NODE-005 | 터미널 객체·배열의 행 — 값을 통째로 드는 칸 함수, 원본 배열 위의 배열 연산 | 현행 | 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md` §5) |
| NODE-006 | 행의 칸과 행 계약 `Behavior` — 행은 계산만 한다, 같은 순서, 공유 칸, 정적 선택의 메모 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:43` 9 입력 마침 칸), 17라운드 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:38`·`reviews/raw-round17-node-structure.md:154`; 소유자 이견 없이 권고대로 확정된 칸 `interpret`·`assemble`·`project`와 형 `Behavior`), 편집자 결정(17라운드, `reviews/round-17-owner-answers.md:44`; 소유자가 물음으로 낸 이름 `declareChildren`을 반대 없이 채택하고 칸의 일을 이름에 맞춤), 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md` §5; 같은 순서, 공유 칸, 정적 선택의 메모) |
| NODE-007 | `trim`과 입력 마침 — 문자열 행의 `finishInput` 칸, 어댑터는 신호만 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3), 소유자 답(`reviews/round-17-owner-answers.md:43` 9 입력 마침 칸), 소유자 답(`reviews/round-17-owner-answers.md:54` 9번 확인), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-19; `trim`은 자동 쓰기) |
| NODE-008 | 책임별 fractal과 트리마다 하나인 생성 함수 `schemaNodeFactory` | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:26` `tree`의 이름; 책임별로 나눔), 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈), 소유자 답(`reviews/round-17-owner-answers.md:45` 12·15 생성 함수와 그 형), 17라운드 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:38`·`reviews/raw-round17-node-structure.md:154`; 소유자 이견 없이 권고대로 확정된 칸 `record`·`navigation`·`SchemaNode/`), 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md:171`; 공장은 트리마다 하나) |
| NODE-009 | behaviors 규칙 — 종류마다 fractal, 보조의 자리, 가져오기 금지 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈; 전략이 아니라 종류마다 모듈 하나), 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md` §5; 소유자 지시 `reviews/round-17-owner-answers.md:25`) |
| NODE-010 | 겉면 규칙 — `SchemaNode` 클래스 파일, 멤버 목록 시험, 내부 통로 | 현행 | 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md` §6; 소유자 지시 `reviews/round-17-owner-answers.md:25`) |
| NODE-011 | 이름 규칙 — 넓은 이름은 `SchemaNode` 접두, `Node`는 좁은 이름공간에서만 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:53` `Node` 이름 규칙), 소유자 답(`reviews/round-17-owner-answers.md:45` 12·15 생성 함수와 그 형) |
| NODE-012 | 이름 규칙을 오늘의 공개 이름에 적용할지가 18라운드 안건으로 이관됨 | 대체됨(→ SURFACE-056) | 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:91`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-47) |
| NODE-013 | 클래스를 없애지는 않는다 — 공개 계약과 프로토타입 메서드 | 현행 | 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md` §6) |
| NODE-014 | 배열 메서드 — 클래스에 두되 타입은 `ArrayNode`에만, 비배열은 공유 칸이 던짐 | 현행 | 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md` §5) |
| NODE-015 | 공개 타입과 가드 아홉은 유지 — 판별 합집합, `isSchemaNode`, `isTerminalNode` 바로잡기, `group` 소비자 이주 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름; 가드 이름 유지와 이주 행), 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md` §6) |
| NODE-016 | 의존 방향 — fractal의 전순서와 조건 셋 | 현행 | 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md` §3) |
| NODE-017 | `SchemaNodeRuntime` 칸 타입의 타입 순환(N5)이 18라운드 안건으로 이관됨 | 대체됨(→ NODE-045) | 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:75`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-35) |
| NODE-018 | 비용(추정) — 노드마다 객체 하나, 행 아홉, 숨은 클래스, 벤치 여섯 | 현행 | 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md` §7), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-31) |
| NODE-019 | 노드 구조에서 결정하지 않은 것(N2·N5·N6·N14, 공개 표면의 크기, `ContextNode`, 문서 주석 관례, 내부 통로) | 분할됨(→ NODE-043, NODE-044, NODE-045, NODE-046, NODE-047, NODE-048, NODE-049, NODE-050, SURFACE-053, SURFACE-054, SURFACE-055, SURFACE-058, EVENT-063, WRITE-085, LANDING-149) | 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:74-92`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-32·18C-33·18C-34·18C-35·18C-37·18C-38·18C-41·18C-42·18C-43·18C-44·18C-45·18C-46·18C-48) |
| NODE-020 | 터미널 아래 경로는 `find`·`findNodes` 모두 노드 없음 | 현행 | 원리(`06-conclusions.md:175` P2·G4; `find`), 편집자 결정(10라운드 추정 채택 규칙, `07-conclusions.md:209`; `findNodes`) |
| NODE-021 | 노드의 종류 — 가르는 기준과 표(리프, 터미널 object·array, branch object, branch array) | 현행 | 편집자 결정(ADR 0011 4차 본문, `adr/0011-branch-node-composition.md:12`), 편집자 결정(4라운드 3.1판, `adr/0011-branch-node-composition.md:5`; 노드 종류의 목록) |
| NODE-022 | union 호스트의 특수 처리는 없다 — 폼은 분기를 고르지 않는다 | 현행 | 소유자 답(`reviews/round-10-owner-answers.md:9` A-3) |
| NODE-023 | 대체됨: 노드 종류 표의 union 호스트 행 | 대체됨(→ NODE-022) | 소유자 답(`reviews/round-10-owner-answers.md:9` A-3) |
| NODE-024 | 대체됨: 노드 종류 표의 참조 그룹 행 | 대체됨(→ NODE-032, NODE-034) | 소유자 답(`reviews/round-10-owner-answers.md:31` E-4), 편집자 결정(17라운드 노드 구조 수렴, `adr/0011-branch-node-composition.md:71`; 값 행) |
| NODE-025 | branch 노드에 남는 책임은 셋 — 자식 집합의 출처, 활성, identity | 현행 | 편집자 결정(ADR 0011 4차 본문, `adr/0011-branch-node-composition.md:12`) |
| NODE-026 | object와 array는 자식 집합의 출처만 다르다 — 같은 모델, 재계산은 재계산 목록에 비례 | 현행 | 편집자 결정(ADR 0011 4차 본문, `adr/0011-branch-node-composition.md:12`) |
| NODE-027 | 인라인 `FormTypeInput`의 암묵 터미널은 의도된 기능 — 끊지 않는다 | 현행 | 소유자 답(`00-goals.md:116` C3 세부 2), 소유자 답(`reviews/round-2.md:114` C3), 소유자 답(`reviews/round-17-owner-answers.md:12` 통보 1) |
| NODE-028 | 판정은 렌더 계층으로 — 판정 함수의 세 값과 터미널 전략을 정하는 순서 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:12` 통보 1), 17라운드 스웜 수렴(편집자 결정, `adr/0011-branch-node-composition.md:59`; 판정 함수의 세 값과 core가 `presentation`을 읽지 않음) |
| NODE-029 | 모든 선언에서 전략을 정하고 경우마다 다르면 청사진 오류 — 선언의 범위와 경우의 정의가 18라운드 안건으로 이관됨 | 대체됨(→ NODE-042) | 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:22`, `reviews/round-18-agenda.md:24`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-09) |
| NODE-030 | 명시적 재정의를 양방향으로 둔다 — `terminal: false`·`terminal: true` | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:12` 통보 1), 편집자 결정(ADR 0011 4차 본문 §3, `00-goals.md:116`의 제안) |
| NODE-031 | 혼란스러운 경우를 드러낸다 — 터미널 노드의 입력이 빈 `ChildNodeComponents`를 읽으면 개발 모드 경고 | 현행 | 원리(`00-goals.md:105` C2 작성자 실수의 가시성, 소유자 채택 `reviews/round-2.md:112`), 편집자 결정(ADR 0011 4차 본문, `adr/0011-branch-node-composition.md:12`) |
| NODE-032 | `virtual` — 참조 그룹 노드와 `&virtual`은 하지 않고 `options.virtual`은 현행 유지, 검증기 앞 제거 목록 | 중복(→ VALIDATE-034, WRITE-026) | 소유자 답(`reviews/round-10-owner-answers.md:31` E-4), 소유자 답(`reviews/round-12-owner-answers.md:16` 8 `virtual`) |
| NODE-033 | 대체됨: `virtual`을 `&virtual`로 옮기고 core에 참조 그룹 노드 종류를 둔다(D-6 (a))와 (a)·(b)의 비용 비교 | 대체됨(→ NODE-032) | 소유자 답(`reviews/round-10-owner-answers.md:31` E-4) |
| NODE-034 | 가상 노드의 규칙 표 — 자식의 출처, 값, 쓰기, 방출·가드·검증, 명령, identity | 현행 | 소유자 답(`reviews/round-10-owner-answers.md:31` E-4; 현행 유지), 편집자 결정(17라운드 노드 구조 수렴, `adr/0011-branch-node-composition.md:9`; 값 행) |
| NODE-035 | 사라지는 전처리 하나 — `required`의 가상 이름 펼치기 | 현행 | 소유자 답(`reviews/round-12-owner-answers.md:16` 8 `virtual`), 원리(`reviews/round-5-derivations.md` §3; P1′) |
| NODE-036 | 이주 시 보존할 테스트 | 현행 | 편집자 결정(ADR 0011 4차 본문, `adr/0011-branch-node-composition.md:12`) |
| NODE-037 | 배열 아이템의 identity·큰 배열의 지연 실체화·`contains`와 튜플이 18라운드 안건으로 이관됨 | 대체됨(→ NODE-051, NODE-052, NODE-053, FRAGMENT-051) | 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:109`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-59) |
| NODE-038 | `emit`의 키 순서(Q14)가 18라운드 안건으로 이관됨 | 대체됨(→ SETTLE-042) | 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:79`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-39) |
| NODE-039 | 2단계 생명주기가 새 구조에서도 필요한가 — 생성이 곧 첫 정착(GOAL-071)이 답함 | 대체됨(→ GOAL-071) | 편집자 결정(4라운드, `04-inherited-constraints.md:35` T-20; GOAL-071) |
| NODE-040 | 가상 노드 아래 경로의 `find` 별칭 여부(S11의 남은 물음)가 18라운드 안건에 남음 | 대체됨(→ NODE-054) | 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:112`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-68) |
| NODE-041 | 공개 가드 (가칭) `isUnionNode`, 판별 합집합과 `InferSchemaNode`의 `union` 멤버, `type`은 `union`·`strategy`는 `terminal` — 가드는 열 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-02), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-89), 소유자 답(`reviews/round-18-owner-answers.md:29` union 범위; 범위), 소유자 답(`reviews/round-18-owner-answers.md:41` 설계서 메모 4) |
| NODE-042 | 터미널 전략의 정적 결정 — 셈에 드는 선언, 경우의 정의(조각 중첩), 축약 비교 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-09) |
| NODE-043 | 탐색은 형상에 있는 노드만 — `structure`는 이름에서 형상 안 자식으로, `subnodes`·`variant`·`oneOfIndex` 내부 칸 폐기 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-33) |
| NODE-044 | 형상을 떠난 노드는 떼어진다 — 읽기는 마지막 커밋으로 고정(구조 읽기는 함께 떼어진 하위 트리, `rootNode`·절대 경로·`globalState`·`globalErrors`는 살아 있는 트리), 쓰기는 루트의 (경로, 종류) 잠복 원본만, 구독은 남되 발화 없음, 명령과 상태 진입은 무동작, 다시 들면 새 인스턴스 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-34) |
| NODE-045 | `SchemaNodeRuntime` 칸의 형은 `record/`가 최소 인터페이스로 선언한다 — `import type` 포함 비순환, PR-2 순환 검사 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-35) |
| NODE-046 | 레코드 형 → 공개 판별 합집합은 단언 없이 선언 자리에서 — `SchemaNodeRecord<Self>`, 제네릭 탐색, `this: AnyNode`, 종류별 생성 표, overload | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-37) |
| NODE-047 | 행이 하나인 종류의 전략은 그 행에서 정한다 — 잎은 `terminal`, 가상은 `branch`, 다른 `options.terminal`은 청사진 오류 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-38) |
| NODE-048 | `ContextNode`를 두지 않는다 — 맥락은 루트가 드는 폼 입력이며 `@`는 노드 경로가 아니다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-45) |
| NODE-049 | 문서 주석의 정본은 선언한 인터페이스 — 공개 멤버 `SchemaNode/type.ts`, 레코드 필드 `SchemaNodeRecord`, 클래스는 `{@inheritDoc}` | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-46) |
| NODE-050 | 내부 통로는 바인딩 전용 — core만 쓰는 호스트에 열지 않으며, 공개 core 진입점이 생기면 계약 변경 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-48) |
| NODE-051 | 배열 통째 쓰기는 위치로 재조정한다 — 키를 잇고, 로드 아닌 통째 쓰기는 뒤쪽 새 키만 생김 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-59) |
| NODE-052 | 튜플 — 자리별 청사진, 청사진 없는 자리는 `extras`, 구조 연산은 자리 기준, 조각의 `items`·`prefixItems`는 덧씌움 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-59) |
| NODE-053 | 아이템 노드는 모두 실체화한다 — 지연 실체화는 PR-5 벤치 게이트 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-59) |
| NODE-054 | `find`는 마디마다 자식 집합을 이름으로 따라간다 — 참조 그룹 아래 경로는 참조된 노드 자체, 정본 경로는 `node.path` | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-68) |
| NODE-055 | 노드 구조 벤치 B1–B6의 합격선 — PR-2에서 V8과 JavaScriptCore로, B1·B5·B6은 `guard:check`의 선 안, B2는 추정의 1.5배 이내이며 오늘보다 크지 않음, B3은 같은 맵, B4는 보고만 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-31) |
| NODE-056 | S1 parse 함수의 자리는 `src/core/behaviors/utils/parse/` — 부르는 쪽은 동작 행의 `interpret` 칸과 기본 union 입력(쓰지 않는 호출), 오늘의 `src/core/parsers/`는 레거시로 옮기고 새 parse를 가져오지 않음 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-36), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-92) |
| NODE-057 | 노드 필드 `type`·`nullable`·`schemaType` — `type`은 `'union'`이 더해진 단일 문자열, `nullable`은 그대로, `schemaType`은 이름을 두고 계산된 허용 형(`'integer'` 보존, `'null'`은 뺌, union이면 칸마다 하나를 얼린 배열), 새 필드 없음 | 현행 | 소유자 답(`reviews/round-18-owner-answers.md:31` union O1), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-90) |
| NODE-058 | `union` 노드의 공개 형 — `UnionMemberType`·`UnionSchemaType`, `UnionNode`와 판별 `value`, props의 `value`·`onChange`, 종류별 `schemaType` 좁힘, 가드 `isUnionNode`, `InferSchemaNode`·`InferValueType`·`InferJSONSchema`의 사상, 참조 안정성, PR-2·PR-7 게이트 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-89), 소유자 답(`reviews/round-18-owner-answers.md:41` 설계서 메모 4) |
| NODE-059 | 형 없는 객체·배열 분기 호스트와 `const`만 있는 칸의 공개 형 — 분기가 모두 인라인 객체(또는 배열)면 `ObjectNode`·`ArrayNode`와 분기 값 형의 합, `$ref`·게이트 분기·두 키워드·`allOf`는 넓은 형 그대로, `const`·`enum` 칸은 리터럴 형 | 현행 | 편집자 결정(19라운드, `reviews/round-19-closing.md` 19C-01·19C-02) |

## 항목

### NODE-001 노드 구조 — 상속 없는 단일 클래스와 종류별 동작 행

- 결정:
  > Vincent의 요건: 상속 구조를 그대로 두는 것, 공유 로직을 타입별로 흩어 두는 것, 불필요한 중복은 불허. 17라운드에 Vincent가 구조를 확정했다: 상속 없이 클래스 하나와 종류별 동작 행을 두며, 행이 곧 오늘 하위 클래스의 정의다(`reviews/round-17-owner-answers.md`의 노드 구조 표).
- 보충:
  > "`BranchStrategy`/`TerminalStrategy`는 `src/core/behaviors/`의 종류 모듈 안 `branch/`·`terminal/`로 대체된다(`objectBehavior/`·`arrayBehavior/`, 두 전략이 함께 쓰는 보조는 그 종류의 `utils/`, 09 §3)." (`adr/0011-branch-node-composition.md:99`)
  > "ObjectNode/ArrayNode 클래스는 남기지 않는다." (`adr/0011-branch-node-composition.md:99`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:102#1`(정본), `adr/0011-branch-node-composition.md:9`, `adr/0011-branch-node-composition.md:99`, `reviews/round-17-owner-answers.md:24`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:24` 노드 구조)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:24`, `09-landing-and-test-strategy.md:104`(열째 문장)

### NODE-002 클래스 하나, 행 하나 — `BEHAVIORS[type][strategy]`, 필드 `behavior`, 게터 `type`·`strategy`

- 결정:
  > **클래스 하나, 행 하나.** 하위 클래스 없이 단일 클래스 `SchemaNode` 하나를 둔다. 종류별 동작은 표 `BEHAVIORS[type][strategy]`의 두 단계에 둔다(잎은 `terminal` 하나, 객체·배열은 `branch`·`terminal` 둘, 가상은 하나). 노드는 생성 때 고른 행 하나를 필드 `behavior`로 들고(`kind` 필드는 없다), 공개 `type`·`strategy`는 행에서 읽는 게터다.
- 보충:
  > 편집자 결정(18C-02): "【추론】 접은 집합의 원소가 둘 이상이면 새 종류 (가칭) `union`의 노드이고 행은 `terminal` 하나다(`BEHAVIORS.union.terminal`)." (`reviews/round-18-closing.md:59`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:104#1-4`(정본), `adr/0011-branch-node-composition.md:53`, `reviews/round-17-owner-answers.md:21`, `reviews/round-17-owner-answers.md:23`, `reviews/round-17-owner-answers.md:42`, `reviews/round-18-closing.md:59`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:24` 노드 구조), 소유자 답(`reviews/round-17-owner-answers.md:21` 종류별 동작 표의 이름), 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈; 표의 두 단계), 소유자 답(`reviews/round-17-owner-answers.md:23` `kind` 필드), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-02)
- 라운드: 18
- 까닭: `reviews/round-17-owner-answers.md:23-24`, `reviews/round-18-closing.md:84-91`

### NODE-003 공개 `node.group`은 `node.strategy`로 바뀐다(값은 그대로)

- 결정:
  > 공개 `node.group`은 `node.strategy`로 바뀐다(값 `'branch'` 또는 `'terminal'`은 그대로, 17라운드 소유자 답).
- 보충:
  > "청사진이 정한 전략은 노드의 공개 `strategy`(`'branch'` 또는 `'terminal'`, 옛 `group`의 새 이름이며 값은 그대로)로 읽힌다." (`adr/0011-branch-node-composition.md:53`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:104#5`(정본), `adr/0011-branch-node-composition.md:53`, `adr/0011-branch-node-composition.md:9`, `open-questions.md:60`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:22`

### NODE-004 공통 필드와 `structure`·`runtime`, 노드 인스턴스가 곧 레코드, `settle`의 자유 함수

- 결정:
  > 공통 필드는 고정 배치하고 종류별 데이터는 한 칸 `structure`(객체의 키별 자식 맵, 배열의 아이템 목록과 키 번호, 가상의 참조)에 담는다. 노드 필드 `runtime`은 트리마다 하나인 `SchemaNodeRuntime`(통지 대기열, 검증기, 진단, 진입 깊이와 예산, `nodeFactory`, `onError` 보고기)을 가리킨다. 노드 인스턴스가 곧 레코드다(노드마다 객체 하나). 정착 알고리즘은 `settle`의 자유 함수가 레코드 위에서 돌린다.
- 보충:
  > 편집자 결정(18C-33): "【추론】 branch 객체의 `structure`는 이름에서 그 커밋의 형상에 있는 자식 노드로 가는 맵이다." (`reviews/round-18-closing.md:924`)
  > 편집자 결정(26C-06): "【추론】 원장이 "루트가 든다"고 적은 트리 전체 자료(로드 스냅숏, 잠복 원본, 경고등 경로 집합, 잠복 원본 열거의 메모)의 저장 자리는 트리마다 하나인 `SchemaNodeRuntime`의 칸이며, 루트는 자기 `runtime` 필드를 통해 그것을 든다." (`reviews/round-26-closing.md:66`)
  > 편집자 결정(26C-06): "【추론】 NODE-004의 런타임 열거(통지 대기열, 검증기, 진단, 진입 깊이와 예산, `nodeFactory`, `onError` 보고기)는 닫힌 목록이 아니며, 칸을 더할 때는 NODE-045대로 `record/`의 선언을 고치고 그 대가를 레코드 `DETAIL.md`에 적는다." (`reviews/round-26-closing.md:67`)
  > 편집자 결정(26C-06): "【추론】 레코드에 루트 전용 필드를 두지 않는다: 공통 필드는 고정 배치다(NODE-004)." (`reviews/round-26-closing.md:68`)
  > 편집자 결정(28C-01): "【추론】 ERROR-159 정착 추적 행의 기록은 트리마다 하나인 `SchemaNodeRuntime`의 칸에 들며(26C-06), 칸을 더하는 절차는 NODE-045대로 `record/`의 선언을 고치고 그 대가를 레코드 `DETAIL.md`에 적는 것이다." (`reviews/round-28-closing.md:9`)
  > 편집자 결정(28C-03): "【추론】 식과 `controls.injectTo`의 `ctx.context`가 보는 `@`의 값은 트리마다 하나인 `SchemaNodeRuntime`의 맥락 칸이다(26C-06, NODE-045의 절차): 트리 생성 때 바인딩이 준 맥락 객체 하나를 받고, 없으면 `{}`다." (`reviews/round-28-closing.md:33`)
  > 편집자 결정(65C-03): "【추론】 장부를 노드 키 `Map`(`deliverySnapshots`·`deliveries`·`queuedEvents`)에서 레코드 필드(기준값, 대기 마스크, 비트별 `revision` 칸, payload 칸)로 옮기는 것은 NODE-004 "노드 인스턴스가 곧 레코드"와 맞고, VALUE-002 "상태는 `raw`와 `extras` 둘뿐이다(P3). 나머지는 상태에서 계산되거나 작업의 기록이다"의 "작업의 기록"에 든다 — 장부는 형상·값·방출에 들지 않고 읽기 API에 노출되지 않으며 커밋이 비운다. 그러므로 P3를 어기지 않는다. 조건은 넷이다: (1) 레코드 필드는 `record/type.ts`에 선언하고 NODE-004를 따르는 `record`의 DETAIL을 먼저 고친다; (2) 차등 시험은 개정 대장(비트별 `revision`), payload(`previous`·`current`), 배달 순서, `UpdateGlobalState` 횟수의 불변을 S1·S2 전후로 확인한다(06의 54만 단계 차등과 같은 모양); (3) S1과 S2는 별도 커밋이되 한 설계이므로 같은 PR 안에서 잇고, S3 뒤에 한다; (4) 05가 정한 이름(`revisionLedger`, `UpdateGlobalState`, 사건 종류)은 바뀌지 않는다." (`reviews/round-65-closing.md:26`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:104#6-9`(정본), `reviews/round-17-owner-answers.md:38`, `reviews/round-17-owner-answers.md:46`, `reviews/round-18-closing.md:924`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:46` 14 트리마다 하나인 공용 칸), 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md` §2; 칸의 내용과 `settle`의 자유 함수), 17라운드 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:38`·`reviews/raw-round17-node-structure.md:154`; 소유자 이견 없이 권고대로 확정된 칸 `structure`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-33)
- 라운드: 18
- 까닭: `reviews/round-17-owner-answers.md:46`, `reviews/round-18-closing.md:934-937`

### NODE-005 터미널 객체·배열의 행 — 값을 통째로 드는 칸 함수, 원본 배열 위의 배열 연산

- 결정:
  > 터미널 객체는 행을 따로 두되 값을 통째로 드는 칸 함수를 잎과 함께 쓰고, 터미널 배열은 원본을 통째로 들되 배열 연산(`push`·`update`·`remove`·`pop`·`clear`)을 오늘처럼 원본 배열 위에서 지원한다.
- 보충:
  > 편집자 결정(35C-12): "【추론】 배열이 터미널인지는 PR-5가 정하지 않는다: NODE-002의 두 행(`branch`·`terminal`), NODE-027·028(인라인 `presentation.FormTypeInput`의 암묵 터미널은 렌더 계층의 판정 함수가 청사진에 넘겨 정하며 두 행을 가진 object·array에만 있다, NODE-047), BLUEPRINT의 `options.terminal: true` 허용과 `false`의 `TERMINAL_OPTION_UNSUPPORTED`, LANDING-048의 `node.strategy` 판정대로 06은 청사진의 `strategy`를 읽어 `array.terminal` 행을 고른다." (`reviews/round-35-closing.md:97`)
  > 편집자 결정(35C-12): "【추론】 터미널 배열 행은 NODE-005대로 원본을 배열 전체로 들고 `push`·`pop`·`update`·`remove`·`clear`를 원본의 사본 위에서 수행해 호스트를 통째로 쓰며(아이템 노드·재인덱싱·아이템 스냅숏 이어 붙임이 없고 호스트 자신의 로드 스냅숏이 단위다), `project`가 LANDING-085가 `arrayBehavior/utils/`로 옮긴 `omitTrailing`·`omitEmpty` 보조로 자르고, 값이 `null`이면 동사는 무효 호출(35C-06)이며, VALUE-034의 빈자리 채움은 적용되지 않는다; 원본 B는 다른 터미널 노드처럼 호스트의 이전 `raw`만 적고 구조 로그는 두지 않는다." (`reviews/round-35-closing.md:98`)
  > 편집자 결정(47C-02): "【추론】 터미널 배열 행도 같다: `push(x)`는 레거시 `TerminalStrategy.ts:185`("`this.__value__ == null ? [data] : [...]`")대로 `null`·`undefined` 위에 `[x]`를 만들어 호스트를 통째로 쓰고, `update`·`remove`·`pop`·`clear`는 무효 호출이다(35C-06, 레거시 `:196,210,221,231`)." (`reviews/round-47-closing.md:19`)
  > 편집자 결정(48C-02): "【추론】 두 행이 잘못된 종류의 `raw`를 다루는 규칙은 하나다(NODE-026 "타입별 특수 경로를 일반 경로에 박지 않는다", 38C-01의 "뒤의 배열 통째 쓰기(… `push` 등 구조 연산 포함)는 그 `raw`를 대신해"): 터미널 배열 행도 `raw`가 배열이 아니면(`null`·`undefined`·`17`·객체 등) `push(x)`가 그 `raw`를 대신해 `[x]`를 통째로 쓰고 경고등은 꺼지며, `update`·`remove`·`pop`·`clear`는 아이템이 없으니 무효 호출이다. 레거시 터미널 행의 `push`는 `null`·`undefined`만 다루고 `17` 위에서는 펼치기가 던지므로(`TerminalStrategy.ts:185`의 `[...this.__value__, data]`) 지킬 레거시 동작이 없고, 47C-02 터미널 문장의 "`null`·`undefined`"는 레거시가 다룬 경우를 든 것이지 범위를 좁힌 것이 아니다. 06은 `arrayBehavior/DETAIL.md:14`와 `arrangeTerminalArray.ts`를 "배열이 아닌 `raw`"로 고친다." (`reviews/round-48-closing.md:17`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:104#11`(정본)
- 닫은 사람: 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md` §5)
- 라운드: 17
- 까닭: `reviews/raw-round17-node-structure.md:115`

### NODE-006 행의 칸과 행 계약 `Behavior` — 행은 계산만 한다, 같은 순서, 공유 칸, 정적 선택의 메모

- 결정:
  > **행의 칸.** `interpret`(입력 해석), `assemble`(합성: 활성 자식의 방출 값 → local), `project`(투영: local → 방출 값), `finishInput`(입력 마침), `declareChildren`(자식 선언 목록만 돌려준다. 생성은 `settle`이 런타임의 `nodeFactory`로 한다), `type`, `strategy`. 행 계약의 형은 `Behavior`다. 행은 계산만 한다: 원본 쓰기, 되돌림 기록, 자식 연결과 폐기의 확정, 통지는 `settle`과 `dispatch`가 한다. 모든 행은 칸을 모두 같은 순서로 가지며 없는 동작은 공유 칸으로 채우고, 뜻이 같은 칸은 함수 객체 하나를 여러 행이 함께 쓴다(공유 로직을 타입별로 흩지 않는다는 요건을 행 수준에서도 지킨다). 옵션에서 나오는 정적 선택(빈 값 생략, 배열 뒤쪽 생략, `trim`, 배열 한계)은 칸이 불릴 때마다 계산하지 않고 유효 스키마 메모가 바뀔 때 한 번 계산해 메모와 함께 둔다.
- 보충:
  > 편집자 결정(36C-01): "【추론】 NODE-014가 "비배열에서 부르면 행의 공유 칸이 `SchemaFormError`를 던지므로 겉면과 `dispatch`는 종류를 묻지 않는다"고 적은 그 칸은 NODE-006·LANDING-056의 일곱 칸(`interpret`·`assemble`·`project`·`finishInput`·`declareChildren`·`type`·`strategy`)에 들어 있지 않으므로, 배열 구조 연산을 받는 여덟째 칸으로 모든 행이 같은 자리에 갖는다; 일곱 칸 목록은 모순되지 않고 늘어난다. 칸 이름(06 제안 `arrange`)과 자리(`declareChildren` 뒤, `type` 앞)는 06의 실행 결정 기록이 정하고 모듈 DETAIL은 이 라운드와 그 기록을 함께 인용한다." (`reviews/round-36-closing.md:9`)
  > 편집자 결정(36C-01): "【추론】 NODE-006의 "행은 계산만 한다"대로 이 칸은 순수하다: 배열 행은 연산 계획(가지 행은 새 자리마다 옛 색인 또는 생성 값, 터미널 행은 사본 위에 만든 새 원본)을 돌려주고, 원본 쓰기·되돌림 기록·자식 연결과 폐기의 확정·통지는 `settle`과 `dispatch`가 한다; 비배열 행은 "없는 동작은 공유 칸으로 채우고, 뜻이 같은 칸은 함수 객체 하나를 여러 행이 함께 쓴다"대로 `ARRAY_METHOD_ON_NON_ARRAY`를 던지는 거부 함수 하나를 모두 함께 쓴다(ERROR-197, 35C-01)." (`reviews/round-36-closing.md:10`)
  > 편집자 결정(386C-01): "【추론】 P1: 게이트가 있는 선택에서도 이탈 대기 맵이 비어 있으면 `selectChildren`의 비활성 항목과 `primeHost`의 baseline 항목은 경로 키를 만들지 않고 조회·삭제도 하지 않는다. 맵이 비어 있지 않으면 이전 경로 그대로다. 지우는 비효율은 oneOf-20 갱신당 330회·마운트당 288회의 빈 조회용 문자열 생성이고, 측정은 잡음 안(−0.5%·−0.1%)이며 예측과 같다. `primeHost`의 조회는 지연된 SharedNodeConflict 정착에서만 자연 적중하고 그 정착은 오류로 끝나므로, 조회를 지우지 않고 합성 시험으로 조회 계약만 확인한다. P-08: 조각 소유는 호출마다 선택된 선언의 소유 경로 집합 하나를 지연 생성해 집합 조회로 판정한다(`getControlLayers`), `buildFeatureNodeIndex`는 호스트마다 자식별 소유 집합을 첫 해당 조각에서 만든다. 호출을 넘는 캐시는 없고 층·그룹·자식 순서는 그대로다. 조각 F=128 쓰기는 Node 1,936 → 315 µs(−84%), 배가 비 2.05·2.72·3.46 → 1.27·1.55·1.81로 작업량이 선형이 됐다. 원칙은 바꾸지 않았다: 정착 단계 순서(SETTLE-001), 고정된 비게이트 시작과 라운드마다 모든 게이트(SETTLE-018·SETTLE-020), 위치 정체성(NODE-051), 게이트 전부 평가(BLUEPRINT-007), 배달 계약, 공개 API 94." (`reviews/round-386-closing.md:8`)
  > 편집자 결정(389C-02): "【추론】 (1) `diagnostics.cause`의 `sharedConflict`는 공유 충돌이 그 정착의 첫 실패일 때의 값이다. 정착 실패 기록은 첫 실패의 cause를 유지하므로(`recordSettlementFailure`), 식·가드 실패가 먼저 기록된 정착에서 공유 충돌이 뒤따르면 cause는 `expression`으로 남는다 — ERROR-133의 네 값 규칙은 "어느 실패인가"를 정하지 "여러 실패 중 어느 것이 남는가"는 ERROR-070의 첫 실패 규칙이 정한다. (2) 386C-01의 "`primeHost`의 조회는 지연된 SharedNodeConflict 정착에서만 자연 적중한다"는 코드 판독으로 찾은 후보 경로가 하나뿐이라는 뜻이지 유일성의 증명이 아니며, 그 시험은 스파이로 대기 나감을 둔 합성 시험이다. 조회를 남긴 결정은 그대로다. (3) NODE-043의 잠복 원본 키 "(절대 경로, 종류)"와 "어느 종류의 노드를 살릴지"의 "종류"는 BLUEPRINT-043 (2)대로 union이면 접은 집합까지 포함한 종류다. 코드의 `kind` 문자열 `union`은 그보다 거칠어 정체 용도로 쓰면 결함이다(F1)." (`reviews/round-389-closing.md:10`)
  > 편집자 결정(390C-02): "【추론】 (1) 386C-01의 "`primeHost`의 조회는 지연된 SharedNodeConflict 정착에서만 자연 적중한다"는 틀렸다: 같은 정착 안에서 한 쓰기가 union 게이트를 닫았다가(기본값 채움으로) 다시 열면 그 노드는 이탈 대기에서 같은 인스턴스로 되살아나며, 이것이 자연 입력 시험으로 고정됐다. 조회를 남긴 결정은 그대로이고 "유일 경로" 문장만 거둔다. (2) 열쇠는 경로 단위이므로, 부모가 게이트로 객체 속성 `0`과 배열 `items`를 배타 전환하면 `/p/0`의 string 토큰이 두 노드에서 같아 나간 속성의 잠복 원본이 배열 아이템 0으로 들어갈 수 있다. NODE-043의 "(절대 경로, 종류)" 정의가 허용하는 모양이라 결함이 아니며 설계를 유지한다(토큰을 청사진 ID로 바꾸면 기존 열쇠 기대 112쌍이 바뀜). 시험은 두지 않고 경계로만 적는다." (`reviews/round-390-closing.md:10`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:105`(정본), `reviews/round-17-owner-answers.md:38`, `reviews/round-17-owner-answers.md:43`, `reviews/round-17-owner-answers.md:44`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:43` 9 입력 마침 칸), 17라운드 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:38`·`reviews/raw-round17-node-structure.md:154`; 소유자 이견 없이 권고대로 확정된 칸 `interpret`·`assemble`·`project`와 형 `Behavior`), 편집자 결정(17라운드, `reviews/round-17-owner-answers.md:44`; 소유자가 물음으로 낸 이름 `declareChildren`을 반대 없이 채택하고 칸의 일을 이름에 맞춤), 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md` §5; 같은 순서, 공유 칸, 정적 선택의 메모)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:44`, `reviews/raw-round17-node-structure.md:114-117`

### NODE-007 `trim`과 입력 마침 — 문자열 행의 `finishInput` 칸, 어댑터는 신호만

- 결정:
  > **`trim`과 입력 마침.** 문자열 행의 `finishInput` 칸이 `options.trim`을 판단해 자른 값을 돌려주고, 쓰기는 `dispatch`의 진입이 사용자 입력과 같은 쓰기(입력 출처)로 한다(§2.3의 둘째). 어댑터는 타입을 모르는 입력 마침 신호 `finishInput`만 보낸다(17라운드 소유자 답 R17-3).
- 보충:
  > "`trim`은 포커스 아웃 때 문자열 동작 행의 `finishInput` 칸이 판단한다" (`adr/0011-branch-node-composition.md:3`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:106`(정본), `adr/0011-branch-node-composition.md:3`, `reviews/round-18-closing.md:582-589`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3), 소유자 답(`reviews/round-17-owner-answers.md:43` 9 입력 마침 칸), 소유자 답(`reviews/round-17-owner-answers.md:54` 9번 확인), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-19; `trim`은 자동 쓰기)
- 라운드: 18
- 까닭: `reviews/round-17-owner-answers.md:11`
- 충돌:
  > `09-landing-and-test-strategy.md:106`의 "쓰기는 `dispatch`의 진입이 사용자 입력과 같은 쓰기(입력 출처)로 한다"는 18라운드 결정과 다르다: 포커스 아웃 때 자른 값을 쓰는 것은 자동 쓰기로, 원본만 쓰고 바깥 오류를 지우거나 dirty를 표시하지 않으며, 그 노드의 입력은 Refresh를 받는다(WRITE-083). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:582`).

### NODE-008 책임별 fractal과 트리마다 하나인 생성 함수 `schemaNodeFactory`

- 결정:
  > **책임별 fractal.** 16라운드에 레코드·종류 표·탐색을 한 fractal에 두던 제안을 책임별로 나눴다(17라운드 소유자 답). `src/core/blueprint/`(PR-1), `src/core/record/`(레코드: `SchemaNodeRecord` 형, 행 계약 `Behavior`, `SchemaNodeFactory` 형, `SchemaNodeRuntime` 형, 이름·경로 갱신과 상호작용 상태 패치), `src/core/behaviors/`(`BEHAVIORS`; 종류 모듈 `stringBehavior/`·`numberBehavior/`·`booleanBehavior/`·`nullBehavior/`·`virtualBehavior/`, `objectBehavior/`와 `arrayBehavior/`는 안에 `branch/`·`terminal/`·`utils/`), `src/core/navigation/`(`find`·`findNodes`와 트리 걷기), `src/core/settle/`(+`settle/derive/`), `src/core/dispatch/`, `src/core/validation/`, `src/core/SchemaNode/`(공개 겉면, 클래스 `SchemaNode`). 모듈 수준 생성 함수는 `schemaNodeFactory`이며, 오늘과 달리 공장은 노드마다가 아니라 트리마다 하나다.
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:107`(정본), `adr/0011-branch-node-composition.md:99`, `reviews/round-17-owner-answers.md:26`, `reviews/round-17-owner-answers.md:45`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:26` `tree`의 이름; 책임별로 나눔), 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈), 소유자 답(`reviews/round-17-owner-answers.md:45` 12·15 생성 함수와 그 형), 17라운드 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:38`·`reviews/raw-round17-node-structure.md:154`; 소유자 이견 없이 권고대로 확정된 칸 `record`·`navigation`·`SchemaNode/`), 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md:171`; 공장은 트리마다 하나)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:26`, `reviews/round-17-owner-answers.md:45`
- 충돌:
  > `09-landing-and-test-strategy.md:107`의 "종류 모듈 `stringBehavior/`·`numberBehavior/`·`booleanBehavior/`·`nullBehavior/`·`virtualBehavior/`"는 18라운드 결정과 다르다: 종류 모듈에 (가칭) `unionBehavior/`가 더해진다(BLUEPRINT-043). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:80`).

### NODE-009 behaviors 규칙 — 종류마다 fractal, 보조의 자리, 가져오기 금지

- 결정:
  > **behaviors 규칙.** 종류마다 fractal 하나(`INTENT.md`·`DETAIL.md`·진입점·같은 이름의 행 파일)를 둔다. 여덟 줄을 넘는 칸과 그 종류만의 보조는 그 종류의 `utils/`, 두 전략이 함께 쓰는 것은 그 종류의 `utils/`, 두 종류 이상이 쓰는 것은 `behaviors/utils/`에 둔다. behaviors 밖에서도 쓰는 것은 behaviors의 것이 아니다(예: `resolveArrayLimits`는 `blueprint/`로). 행은 칸을 모두 같은 순서로 갖는다. 종류 모듈은 behaviors 뿌리와 `settle`·`dispatch`·`validation`·공개 겉면을 가져오지 않는다.
- 보충:
  > 편집자 결정(35C-04): "【추론】 NODE-009(behaviors 밖에서도 쓰는 것은 `blueprint/`로)와 LANDING-085·094(PR-5의 이동)대로 `resolveArrayLimits`는 `blueprint/`의 조직에 두고 청사진 진입점에서 이름으로 내보내며, 조각이 준 `minItems`·`maxItems`가 세어지도록 유효 스키마의 `schema`를 받는다(WRITE-022 "제약을 유효 스키마로 노출"); 코어는 채우지도 막지도 않는다." (`reviews/round-35-closing.md:32`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:108`(정본), `adr/0011-branch-node-composition.md:99`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈; 전략이 아니라 종류마다 모듈 하나), 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md` §5; 소유자 지시 `reviews/round-17-owner-answers.md:25`)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:25`

### NODE-010 겉면 규칙 — `SchemaNode` 클래스 파일, 멤버 목록 시험, 내부 통로

- 결정:
  > **겉면 규칙.** `SchemaNode` 클래스 파일에는 필드·게터·문장 하나짜리 위임만 둔다. 분기·반복·종류 비교를 금하고(예외는 가드), 생성자는 선언 순서대로 대입만 하며, 노드마다 할당을 만들지 않는다(생성자와 필드 초기화식에 객체·배열 리터럴, 함수, `new`를 두지 않는다). 필드 집합은 고정한다. 멤버 목록은 공개 계약 목록과 같아야 하며, `SchemaNode/`의 `DETAIL.md` 목록과 프로토타입 멤버 이름을 맞대는 멤버 목록 시험으로 지킨다. 여러 단계를 잇는 조율(쓰기 → 커밋 → 통지 → 검증 요청, 하위 트리 상태 쓰기, `validate`, 로드)은 `dispatch`의 동사별 진입이 맡는다. 기계 검사는 그 클래스 파일에만 거는 ESLint 설정이다. 내부 통로(입력 마침 신호 `finishInput`, 입력 출처 표식이 붙은 쓰기)는 클래스 멤버가 아니며 `SchemaNode/` 진입점이 바인딩 전용으로 이름을 붙여 내보낸다. `core/index.ts`는 이들을 이름으로 다시 내보내고 `src/index.ts`는 내보내지 않는다(공개 index의 키 목록 시험). 겉면의 `INTENT.md` 첫 줄에 이름 함정 경고를 둔다(렌더 디렉토리 `src/components/SchemaNode`, 공개 판별 합집합 형 `SchemaNode`와 이름이 같다).
- 보충:
  > 편집자 결정(26C-01): "【추론】 `SchemaNode` 겉면의 멤버는 그 멤버가 드러내는 기제를 들여오는 PR에서 겉면에 들고, 그 PR이 `SchemaNode/`의 `DETAIL.md` 목록·멤버 목록 시험·공개 형 `SchemaNode`를 함께 고친다(EVENT-063이 명령 메서드에 정한 방식)." (`reviews/round-26-closing.md:9`)
  > 편집자 결정(26C-01): "【추론】 명령 메서드 하나와 통지·검증 멤버(`subscribe`, `validate`, 오류 읽기와 외부 오류 설정)는 PR-4(EVENT-063·EVENT-073, LANDING-064), 배열 메서드는 PR-5(NODE-014, LANDING-065), 계산 게터 `visible`·`enabled`·`readOnly`·`disabled`는 PR-6(LANDING-066)에서 겉면에 든다." (`reviews/round-26-closing.md:11`)
  > 편집자 결정(26C-01): "【추론】 원장이 PR을 적지 않은 멤버는 같은 규칙으로 그 기제를 들여오는 PR에 들며, 하위 트리 상태 쓰기와 `validate`처럼 여러 단계를 잇는 조율은 `dispatch`의 것이므로(NODE-010) PR-4다." (`reviews/round-26-closing.md:12`)
  > 편집자 결정(26C-01): "【추론】 뒤 PR의 멤버를 PR-2 클래스에 무해한 구현(스텁)이나 `SchemaNodeRuntime` 칸으로의 위임으로 미리 두지 않는다: PR-2의 시험 대역은 `if` 게이트 술어 하나뿐이고 시험만을 위한 주입 자리를 새로 만들지 않는다(TEST-069 (나)); LANDING-062의 "게이트는 술어 인터페이스 뒤의 스텁"은 이 술어 하나를 말한다." (`reviews/round-26-closing.md:13`)
  > 편집자 결정(18C-25): "【추론】 PR-2에서 사슬은 `settle` 호출 하나다(`setValue`가 `settle` 쓰기로 직접 위임, `reviews/raw-round17-node-structure.md:74`)." (`reviews/round-18-closing.md:756`)
  > 편집자 결정(28C-08): "【추론】 내보내기 자리는 NODE-010대로다: `SchemaNode/` 진입점이 바인딩 전용으로 이름을 붙여 내보내고, `core/index.ts`는 이름으로 다시 내보내며(`finishInput`과 같은 취급), `src/index.ts`는 내보내지 않는다." (`reviews/round-28-closing.md:89`)
  > 편집자 결정(206C-01): "【추론】 소비자 증거가 "겉면이 엔진의 유일한 출구"를 보여 주니 트리가 그 관계를 말하게 하는 것이 목표이고, C는 그것을 가장 적은 이동(진입점 하나와 이름표 67개)으로 이룬다. B는 겉면 루트를 비대하게 하고 D는 묶음 사이 상호 의존을 만든다." (`reviews/round-206-closing.md:9`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:109`(정본)
- 닫은 사람: 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md` §6; 소유자 지시 `reviews/round-17-owner-answers.md:25`)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:25`
- 충돌:
  > `09-landing-and-test-strategy.md:109`의 "내부 통로(입력 마침 신호 `finishInput`, 입력 출처 표식이 붙은 쓰기)는 클래스 멤버가 아니며"는 18라운드 결정과 다르다: 맥락 갱신 `setContext`(가칭)도 같은 바인딩 전용 내부 통로다(SURFACE-055). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:1260`).

### NODE-011 이름 규칙 — 넓은 이름은 `SchemaNode` 접두, `Node`는 좁은 이름공간에서만

- 결정:
  > **이름 규칙.** 넓은 범위의 이름(내보내는 형, 모듈 수준 함수, fractal 진입점의 이름)은 `SchemaNode` 접두를 쓴다. `Node`로 줄여 부르는 것은 한 형의 필드나 한 모듈 안의 지역 이름처럼 아주 좁은 이름공간에서만 한다(전역 `Node`와 헷갈리지 않게). 그래서 형은 `SchemaNodeRecord`·`SchemaNodeRuntime`·`SchemaNodeFactory`, 모듈 수준 함수는 `schemaNodeFactory`이고, 런타임 안의 필드처럼 좁은 자리에서만 `nodeFactory`로 줄인다(17라운드 소유자 답, 08 §13).
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:110#1-4`(정본), `reviews/round-17-owner-answers.md:53`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:53` `Node` 이름 규칙), 소유자 답(`reviews/round-17-owner-answers.md:45` 12·15 생성 함수와 그 형)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:53`
- 충돌:
  > `09-landing-and-test-strategy.md:110`의 "넓은 범위의 이름(내보내는 형, 모듈 수준 함수, fractal 진입점의 이름)은 `SchemaNode` 접두를 쓴다."는 18라운드 결정과 다르다: 종류·역할 낱말이 앞에 붙은 공개 형과 가드(`ArrayNode`, `isArrayNode` 등)는 그 이름을 두고, 맨앞에 홀로 선 `Node`만 쓰지 않는다(SURFACE-056). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:1293-1295`).

### NODE-012 이름 규칙을 오늘의 공개 이름에 적용할지가 18라운드 안건으로 이관됨

- 결정:
  > 오늘의 공개 이름에 적용할지는 18라운드 안건이다.
- 보충: 없음
- 상태: 대체됨(→ SURFACE-056)
- 출처: `09-landing-and-test-strategy.md:110#5`(정본), `reviews/round-18-closing.md:1291-1301`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:91`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-47)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:91`, `reviews/round-18-closing.md:1303-1306`

### NODE-013 클래스를 없애지는 않는다 — 공개 계약과 프로토타입 메서드

- 결정:
  > **클래스를 없애지는 않는다.** `setValue`·`find`·`subscribe`·`push`·`remove`는 공개 계약이다. 노드마다 클로저를 달면 노드 수만큼 메모리가 들고, 프로토타입 메서드를 가진 단일 클래스가 가장 싸며 모든 노드가 같은 숨은 클래스가 된다.
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:111`(정본)
- 닫은 사람: 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md` §6)
- 라운드: 17
- 까닭: `09-landing-and-test-strategy.md:111`(셋째 문장)

### NODE-014 배열 메서드 — 클래스에 두되 타입은 `ArrayNode`에만, 비배열은 공유 칸이 던짐

- 결정:
  > **배열 메서드**는 클래스에 두되 타입은 `ArrayNode` 인터페이스에만 준다. 비배열에서 부르면 행의 공유 칸이 `SchemaFormError`를 던지므로 겉면과 `dispatch`는 종류를 묻지 않는다. UI 플러그인이 `node.push()`를 부른다. 비배열은 `type`이 배열이 아닌 노드를 말한다.
- 보충:
  > 편집자 결정(35C-01): "【추론】 ERROR-197의 던짐(`type`이 배열이 아닌 노드에서 `push`·`pop`·`update`·`remove`·`clear`를 부르면 행의 공유 칸이 모든 환경에서 즉시 `SchemaFormError`를 던진다, 기록에 `path`와 `details.method`)은 PR-5가 만드는 배열 행의 공유 칸에 사는 것이라 PR-5의 몫이고, NODE-014대로 메서드는 단일 클래스에 두되 형은 공개 `ArrayNode` 인터페이스에만 준다." (`reviews/round-35-closing.md:9`)
  > 편집자 결정(36C-01): "【추론】 NODE-014가 "비배열에서 부르면 행의 공유 칸이 `SchemaFormError`를 던지므로 겉면과 `dispatch`는 종류를 묻지 않는다"고 적은 그 칸은 NODE-006·LANDING-056의 일곱 칸(`interpret`·`assemble`·`project`·`finishInput`·`declareChildren`·`type`·`strategy`)에 들어 있지 않으므로, 배열 구조 연산을 받는 여덟째 칸으로 모든 행이 같은 자리에 갖는다; 일곱 칸 목록은 모순되지 않고 늘어난다. 칸 이름(06 제안 `arrange`)과 자리(`declareChildren` 뒤, `type` 앞)는 06의 실행 결정 기록이 정하고 모듈 DETAIL은 이 라운드와 그 기록을 함께 인용한다." (`reviews/round-36-closing.md:9`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:112`(정본) (같은 문장: ERROR-068; 그 오류 코드는 열림)
- 닫은 사람: 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md` §5)
- 라운드: 17
- 까닭: `reviews/raw-round17-node-structure.md:114`

### NODE-015 공개 타입과 가드 아홉은 유지 — 판별 합집합, `isSchemaNode`, `isTerminalNode` 바로잡기, `group` 소비자 이주

- 결정:
  > **공개 타입과 가드는 유지한다.** `SchemaNode`는 판별 합집합 인터페이스가 되고 `InferSchemaNode` 사상은 그대로다. 공개 진입점이 노드 타입을 `type`으로만 내보내므로 클래스를 인터페이스로 바꿔도 소비자는 깨지지 않는다. 공개 판별 합집합에는 레코드 필드와 `behavior`를 싣지 않는다. 가드 아홉은 이름을 유지한다. `isSchemaNode`는 오늘 `instanceof AbstractNode`인데 단일 클래스 `instanceof`로 바꾼다(`Symbol.for` 상표는 라이브러리 사본 둘이 서로의 노드를 참으로 판정하는 동작 변경이라 쓰지 않는다). 나머지 여덟 가운데 여섯은 `isSchemaNode(x) && x.type === …`로, `isBranchNode`·`isTerminalNode`는 `x.strategy`로 둔다. `isTerminalNode`의 좁히기는 바로잡는다: 오늘은 잎 넷으로 좁히지만 터미널 객체·배열도 `'terminal'`이다(`src/core/nodes/filter.ts:195-198`). 유지해야 하는 이유는 공개 가드 아홉, `InferSchemaNode`로 `push`가 타입 검사를 통과하는 것, 가상화의 WeakSet 키, `useChildNodeComponents`의 `isTerminalNode`다. 오늘 `node.group`을 읽는 소비자 다섯(`FallbackComponents/FormGroupRenderer.tsx:18`, antd5·antd6·antd-mobile·mui의 `FormGroup.tsx`)은 PR-7에서 `node.strategy`로 옮긴다(08 §14의 이주 행).
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:113`(정본)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름; 가드 이름 유지와 이주 행), 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md` §6)
- 라운드: 17
- 까닭: `reviews/raw-round17-node-structure.md:133`, `09-landing-and-test-strategy.md:113`(아홉째 문장)
- 충돌:
  > `09-landing-and-test-strategy.md:113`의 "가드 아홉은 이름을 유지한다."는 18라운드 결정과 다르다: (가칭) `isUnionNode`가 더해져 공개 가드는 열이다(NODE-041). 이름을 유지하는 규칙은 그대로다. 18라운드 결정이 이긴다(`reviews/round-18-closing.md:77`).
  > `09-landing-and-test-strategy.md:113`의 "나머지 여덟 가운데 여섯"은 18라운드 결정과 다르다: `isUnionNode`도 `isSchemaNode(x) && x.type === 'union'`이므로 나머지 아홉 가운데 일곱이 `type`으로, `isBranchNode`·`isTerminalNode`가 `strategy`로 판정한다(NODE-041). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:2347-2348`).
  > `09-landing-and-test-strategy.md:113`의 "공개 가드 아홉"은 18라운드 결정과 다르다: 공개 가드는 열이다(NODE-041). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:77`).

### NODE-016 의존 방향 — fractal의 전순서와 조건 셋

- 결정:
  > **의존 방향.** 전순서는 `blueprint` < `record` < {`behaviors`의 종류 모듈, `navigation`} < `settle/derive` < `settle` < `validation` < `dispatch` < `SchemaNode`다. 조건은 셋이다: 행 계약 `Behavior`는 `record`에 둔다, 청사진은 행의 키가 아니라 `type`·`strategy`만 낸다, 생성은 `SchemaNodeRuntime`의 `nodeFactory`로 주입한다. `core/index.ts`와 `nodeFromJSONSchema`는 `SchemaNode/`의 진입점만, React 바인딩은 `core/index.ts`만 가져온다.
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:114#1-4`(정본)
- 닫은 사람: 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md` §3)
- 라운드: 17
- 까닭: `reviews/raw-round17-node-structure.md:72`

### NODE-017 `SchemaNodeRuntime` 칸 타입의 타입 순환(N5)이 18라운드 안건으로 이관됨

- 결정:
  > `SchemaNodeRuntime`의 칸 타입이 만드는 타입 순환(N5)은 18라운드 안건이며, 그 답 전에는 타입까지 포함한 비순환을 확정하지 않는다(filid 경계 §6).
- 보충: 없음
- 상태: 대체됨(→ NODE-045)
- 출처: `09-landing-and-test-strategy.md:114#5`(정본), `reviews/round-18-closing.md:969-978`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:75`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-35)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:75`, `reviews/round-18-closing.md:980-982`

### NODE-018 비용(추정) — 노드마다 객체 하나, 행 아홉, 숨은 클래스, 벤치 여섯

- 결정:
  > **비용(추정, 벤치로 확인).** 노드마다 객체 하나이고, 행은 종류마다 하나를 모든 노드가 공유하므로 프로세스 전체에 아홉이다. 노드마다의 매니저·클로저·전략 객체·구독은 없다(규칙과 린트로 금한다). 모든 노드가 한 클래스이고 필드를 같은 순서로 넣으면 한 숨은 클래스를 가져, 여러 종류를 도는 `settle`·`dispatch`의 필드 읽기가 단형 인라인 캐시로 남을 것으로 본다(Vincent가 말한 "상속 클래스에 의한 캐싱 비효율"). 남는 비용도 적는다: 칸 함수의 호출은 간접 호출으로 남고, `type`이 게터가 되어 읽기가 한 단계 늘며, iOS의 JavaScriptCore에서는 같은 결론이 보장되지 않는다. 메모리는 필드 24–30개일 때 노드 하나가 약 110–140바이트(포인터 압축 엔진) 또는 약 210–260바이트(압축 없는 엔진)로 추정한다. 벤치 여섯을 §6.1의 기준선과 비교한다: B1(섞인 종류 1만 노드의 `value`·`type` 읽기, V8과 JavaScriptCore), B2(노드당 힙 바이트), B3(아홉 종류 인스턴스와 행이 같은 맵인지), B4(정착 뜨거운 루프의 거대형 자리 수), B5(입력에서 커밋까지의 지연), B6(노드 1만 개 생성 시간). 오늘의 주된 비용이 노드마다의 할당인지 인라인 캐시인지는 재지 않았으므로 크기는 벤치가 정한다.
- 보충:
  > 편집자 결정(18C-31): "【추론】 NODE-018(현행)이 B1–B6을 기준선과 비교한다고 적으나 합격선이 없으므로 여기서 둔다." (`reviews/round-18-closing.md:890`)
  > 편집자 결정(18C-31): "【추론】 PR-2에서 B1–B6을 V8(node)과 JavaScriptCore(bun, 또는 `benchmark-form/browser-bench`의 Safari)에서 돌린다." (`reviews/round-18-closing.md:891`)
  > 편집자 결정(18C-31): "【추론】 B1·B5·B6의 합격선은 18C-27의 선(`guard:check`) 안이다." (`reviews/round-18-closing.md:892`)
  > 편집자 결정(18C-31): "【추론】 B2의 합격선은 NODE-018의 추정(110–140바이트, 포인터 압축 엔진)의 1.5배 이내이고, 같은 엔진에서 잰 오늘 노드 인스턴스와 부속 객체의 합을 나란히 적어 그보다 크지 않은 것이다." (`reviews/round-18-closing.md:893`)
  > 편집자 결정(18C-31): "【추론】 B3의 합격선은 같은 맵이 참인 것이다." (`reviews/round-18-closing.md:894`)
  > 편집자 결정(18C-31): "【추론】 B4는 보고만 한다." (`reviews/round-18-closing.md:895`)
  > 편집자 결정(18C-31): "【추론】 합격선을 넘으면 TEST-027의 절차(이유를 적고 Vincent가 받아들임)로 올린다." (`reviews/round-18-closing.md:896`)
  > 편집자 결정(18C-31): "PR: PR-2." (`reviews/round-18-closing.md:901`)
  > 편집자 결정(18C-31): "통과: 위 합격선 안이다." (`reviews/round-18-closing.md:902`)
  > 편집자 결정(18C-31): "실패: TEST-027의 절차(18C-26의 기록·수용 규칙)로 올린다." (`reviews/round-18-closing.md:903`)
  > 소유자(27라운드, PR-2 벤치의 느린 행): "PR-2 벤치에서 남은 느린 행을 모두 수용한다" (`reviews/round-27-owner-answers.md:7`) — 요지. B2의 합격선(18C-31, 추정의 1.5배) 초과와 B3(JSC 숨은 맵 확인 불가)을 소유자가 받아들였다. 이 추정은 그대로 두고, 최적화는 구현 완료 뒤의 별도 작업이다(TEST-027).
  > 편집자 결정(400C-01): "【추론】 터미널 모드(options.terminal)는 느리지 않다: 객체 1000키 마운트 Node −90%·Bun −64%, 배열 8천 마운트 거의 0으로 0.16.1보다 빠르다. 느린 것은 표시 없이 하위 선언이 없는 호스트(자식 0개 브랜치)이며 원인은 모든 키가 선언 밖 값이 되어 키마다 복사(계측 비율 37%)와 재조립(47%)되는 것이다. 0.16.1은 items 없는 배열 스키마를 거부하므로 그 모양의 옛 판 수치는 없다. 결함 수정 셋(F2·F3·394C-02)은 배열 동사 비용을 바꾸지 않았다(수정 전 대비 모든 행 −7%~+6%). 다음 구현 묶음 L3의 수용 가설은 다섯이고 각각 지우는 비효율 하나를 이름 지었다(370라운드): (a) 선언 밖 키마다 defineProperty를 일반 대입으로(writeObjectKey, __proto__ 보호는 코드에만 있으므로 그 불변을 시험으로 고정하고 원장 보충으로 적음); (b) items 없는 배열의 push·insert(N) 지름길 — 선언 밖 값뿐인 배열의 덧붙임이 모든 칸을 걷는 O(N) 접두 증명·재사용 검사를 없앰(자격 배제 목록 그대로, prefixItems 튜플 뒤 꼬리 제외, 새 빈 children 참조·UpdateChildren·revision 유지, 전체 배달 비교); (c) nextExtras 끝의 sameValue가 markWrite의 비교와 중복인 두 번 비교 제거(Merge 길 동일성 확인이 선행 조건); (d) 이미 해석된 자식에 staticSpec을 다시 조회하지 않고 넘김(all-keys 격차의 2.75%); (e) 게이트 조각이 있는 폼의 평상시 쓰기가 나감 정책 의존 판정마다 조각별 전체 통제 층을 만든 뒤 소유 하나를 찾는 것을 직접 소유 판정으로(조각 수에 초선형, F=64에서 Node 3.38→1.05 ms·Bun 16.6→1.36 ms, 72장면·323단계 차등 0, 정책 평가·층 순서 불변, 캐시 없음; 결정 58의 입구 수치 3.38 ms 중 2.34 ms). 가설마다 커밋 하나, PR 하나(대기열 56), 검증은 agy high(397라운드). 증명 먼저 후보(비효율로 이름 짓기 전 증명 필요, 지금 쪼개지 않음): all-keys 격차 중 DETAIL 설계 기록만 근거인 알고리즘 몫(커밋 후보 루프, 커밋마다 RevisionLedger 생성, dirty 색인 반복), (c) 다섯(없는 misfit 경로 삭제, 빈 commitGlobalState 방문, hasDistributedChildInput 재검사, effectiveType 재검사, keepsHostKeys 훑기), 빈 상호작용 상태 공유(노드당 56 B, 정체성 비교·제자리 변경 부재 증명 선행). 수용 후보(M3 때 현재 수치로 소유자 수용 목록): all-keys 격차 중 원장 계약 몫(SETTLE-001·002·003, 노드별 revision·EVENT 배달), 선언 밖 값의 불변 사본·순서 보관이 요구하는 키 수 비례 복사·재조립(VALUE-002, SETTLE-042·043), 터미널 객체 한 키 변경의 첫 다른 키 위치 비례 비교(두 판 같은 방향), 노드 레코드 376 B(NODE-018 추정 210~260 B 초과, NODE-055 판정은 하지 않음), 청사진 스키마 노드당 약 1,820~1,830 B와 폼 하나 기준 트리+청사진 메모리 0.16.1 대비 약 5분의 1 증가(398라운드 소유자 판단으로 청사진 공유는 지금 하지 않음). 폐기: 선언 밖 값 입력 재사용(Merge에서 이전 값 상실, 호출자 객체 변조가 폼 값에 전파, 396라운드 예측 가능성 원칙 위반). 기록만: items 없는 배열 remove(0)의 extras 인식 splice(범위 밖), 빈 배열→빈 배열의 새 children 참조와 UpdateChildren(원장 요구인지 부산물인지 미확인, 지름길은 보존), 빈 구조 그릇 정리(지울 것 없음, L3-3 닫음)." (`reviews/round-400-closing.md:8`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:115`(정본), `reviews/round-18-agenda.md:68`, `reviews/round-18-closing.md:890-896,901-903`
- 닫은 사람: 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md` §7), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-31)
- 라운드: 18
- 까닭: `reviews/raw-round17-node-structure.md:142-144`, `reviews/round-18-closing.md:898-899`
- 충돌:
  > `09-landing-and-test-strategy.md:115`의 "행은 종류마다 하나를 모든 노드가 공유하므로 프로세스 전체에 아홉이다."는 18라운드 결정과 다르다: (가칭) `union` 잎의 `terminal` 행이 더해져 행은 열이다(BLUEPRINT-043). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:59`).
  > `09-landing-and-test-strategy.md:115`의 "B3(아홉 종류 인스턴스와 행이 같은 맵인지)"는 18라운드 결정과 다르다: B3이 보는 종류 인스턴스와 행은 `union`을 더해 열이다(BLUEPRINT-043). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:59`).

### NODE-019 노드 구조에서 결정하지 않은 것(N2·N5·N6·N14, 공개 표면의 크기, `ContextNode`, 문서 주석 관례, 내부 통로)

- 결정:
  > **결정하지 않은 것(18라운드 안건, `reviews/round-18-agenda.md`).** N2(탐색이 기대는 `subnodes`·`variant`의 존폐), N5(런타임 형의 타입 순환), N6(레코드에서 공개 판별 합집합으로의 형 변환), N14(행이 없는 조합: 잎의 `terminal: false`, 가상의 `terminal: true`와 가상에 둔 인라인 `presentation.FormTypeInput`의 처리와 이주), 공개 표면의 크기(루트 전용 넷 `globalState`·`setSubtreeState`·`clearSubtreeState`·`globalErrors`, 명령 넷을 노드 메서드로 둘지(C-11), `subnodes`·`defaultValue`·`resetSubtree`·`schemaPath`·`key`의 존폐), `ContextNode`의 자리, 문서 주석 `{@inheritDoc}` 관례, 내부 통로(`finishInput` 신호)를 core만 쓰는 호스트에 열지.
- 보충:
  > "PR-2 전, N14는 PR-1 전(18라운드 안건: 노드 구조)" (`08-design-a-to-z.md:500`)
- 상태: 분할됨(→ NODE-043, NODE-044, NODE-045, NODE-046, NODE-047, NODE-048, NODE-049, NODE-050, SURFACE-053, SURFACE-054, SURFACE-055, SURFACE-058, EVENT-063, WRITE-085, LANDING-149)
- 출처: `09-landing-and-test-strategy.md:116`(정본), `09-landing-and-test-strategy.md:102`, `adr/0011-branch-node-composition.md:60`, `adr/0011-branch-node-composition.md:71`, `reviews/round-18-closing.md:911-913,921-932,943-959,969-978,1005-1013,1019-1023,1029-1038,1155-1171,1182-1191,1202-1210,1220-1238,1253-1262,1274-1281,1312-1320`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:74-92`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-32·18C-33·18C-34·18C-35·18C-37·18C-38·18C-41·18C-42·18C-43·18C-44·18C-45·18C-46·18C-48)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:74-92`, `reviews/round-18-closing.md:915-915`, `reviews/round-18-closing.md:934-937`, `reviews/round-18-closing.md:961-963`, `reviews/round-18-closing.md:980-982`, `reviews/round-18-closing.md:1015-1017`, `reviews/round-18-closing.md:1040-1047`, `reviews/round-18-closing.md:1173-1176`, `reviews/round-18-closing.md:1193-1196`, `reviews/round-18-closing.md:1212-1214`, `reviews/round-18-closing.md:1240-1247`, `reviews/round-18-closing.md:1264-1268`, `reviews/round-18-closing.md:1283-1285`, `reviews/round-18-closing.md:1322-1322`

### NODE-020 터미널 아래 경로는 `find`·`findNodes` 모두 노드 없음

- 결정:
  > 터미널 노드 아래의 경로는 `find`와 `findNodes` 모두 노드 없음으로 답한다(`07-conclusions.md` §4.29, 06 §4.8).
- 보충:
  > "노드가 없으므로 `null`을 돌려준다." (`06-conclusions.md:174`)
  > "반환 타입 `SchemaNode | null`은 그대로다." (`06-conclusions.md:174`)
  > "**행동 변화이므로 이주 안내 대상이다.**" (`06-conclusions.md:176`)
  > "이주 항목(4.8과 함께)." (`07-conclusions.md:210`)
- 상태: 현행
- 출처: `adr/0006-single-value-ownership.md:46#4`(정본), `06-conclusions.md:174`, `07-conclusions.md:208`, `07-conclusions.md:95`, `03-mental-model.md:174`, `08-design-a-to-z.md:415`, `08-design-a-to-z.md:449`, `02-target-overview.md:316`, `adr/0011-branch-node-composition.md:3`
- 닫은 사람: 원리(`06-conclusions.md:175` P2·G4; `find`), 편집자 결정(10라운드 추정 채택 규칙, `07-conclusions.md:209`; `findNodes`)
- 라운드: 10
- 까닭: `06-conclusions.md:175`, `07-conclusions.md:209`, `adr/0006-single-value-ownership.md:46`
- 충돌:
  > `reviews/round-18-agenda.md:112`의 "터미널 노드 아래 경로의 계약(S11, `adr/0011-branch-node-composition.md:91`)"은 정본과 다르다. 정본이 이긴다(`adr/0006-single-value-ownership.md:46`).
  > `adr/0011-branch-node-composition.md:94`의 "**4·5라운드의 공격 대상이 아니었으므로 처방이 없다** — `find`의 계약(터미널 아래 경로는 없음인가 별칭인가)으로 다룬다."는 정본과 다르다. 정본이 이긴다(`adr/0006-single-value-ownership.md:46`).

### NODE-021 노드의 종류 — 가르는 기준과 표(리프, 터미널 object·array, branch object, branch array)

- 결정:
  > 3.1판이 상태를 `raw`·`selection`·`extras` 셋으로 줄인 뒤(`reviews/round-4-spec.md` §A1), 종류를 가르는 기준은 "자식 집합이 어디서 오는가"와 "값을 드는가" 둘이다.
  > | 종류 | 자식 집합의 출처 | 값 | identity | 방출·가드·검증에서의 자리 |
  > | ---- | ---------------- | -- | -------- | ------------------------- |
  > | 리프 | 없다 | `raw` | 이름 또는 인덱스 | 자기 값으로 나타난다 |
  > | 터미널 object·array | 없다 — 자식을 만들지 않는다 | `raw` 하나로 값을 통째로 든다 | 이름 | 값 통째로 나타난다. 안의 `if`/`oneOf`는 형상을 만들지 않고 검증기가 그대로 판정한다 |
  > | branch object | **스키마** — 청사진이 정적으로 열거한 선언(ADR 0005) | 없다. 비객체 값(`null`, `17`)이 왔을 때만 `raw`를 든다(A5) | property 이름 (+ 타입이 다른 배타 조각의 경우 조각) | `local`을 합성하고 투영해 `emit`을 만든다 |
  > | branch array | **값** — 아이템 수 × 아이템 청사진 | 위와 같다 | 인덱스와 독립적인 단조 키(현재의 `#n`, T-22) | 위와 같다 |
- 보충:
  > "이 문서는 4차 본문이며 노드 종류 표는 5차 원장 §2를 따라 읽어야 한다: (1) 상태 칸은 `raw`·`extras` 둘뿐이고 `selection`은 없다." (`adr/0011-branch-node-composition.md:3`)
  > 편집자 결정(38C-01): "【추론】 NODE-021·VALUE-002대로 가지 배열의 자식 집합은 값에서 오고(아이템 수 × 아이템 청사진) 자식이 있는 노드는 잘못된 종류의 값이 왔을 때만 `raw`를 드므로, 배열 호스트에 `null`·수·평범한 객체 같은 배열 아닌 값을 통째로 쓰면 호스트가 그 값을 `raw`로 들고 길이가 없으니 아이템은 0개다; 있던 아이템은 WRITE-036의 "통째 교체로 짧아진 배열"처럼 소멸이지 나감이 아니다. 객체 호스트의 자식이 스키마에서 와 비객체 `raw` 아래에도 존재한다는 VALUE-036의 문장은 자식이 값에서 오는 배열에는 옮겨 적용할 것이 없고, 아이템을 잘못된 종류의 `raw` 아래 남기라는 원장 문장은 없다." (`reviews/round-38-closing.md:9`)
  > 편집자 결정(47C-01): "【추론】 NODE-021대로 가지 배열의 자식 집합은 값에서 오고(아이템 수 × 아이템 청사진) 그 아이템 수와 자리는 `structure`에 든 구조 사실이므로(NODE-004 "배열의 아이템 목록과 키 번호"), 38C-02의 원본 트리는 배열 호스트를 "자리마다 아이템의 원본 트리를 모은 값"으로 적은 그대로 자리 수 N만큼의 배열로 읽는다 — 원본이 하나도 없는 자리는 그 자리에 `undefined`를 두되 자리는 남기며(N = 0이면 `[]`), 배열 전체를 `undefined`로 접지 않는다; 38C-02의 "원본이 하나도 없는 자리는 `undefined`"는 자리 하나의 값에 대한 말이고 배열 호스트 자체에 대한 말이 아니다. 그래서 `[{},{}]`인 아이템은 `[undefined, undefined]`로 읽히고 재진입·재작성 때 길이 2의 아이템 두 개가 다시 생긴다(38C-02의 까닭 "재진입이 떠나기 전 상태로 돌아온다")." (`reviews/round-47-closing.md:9`)
  > 편집자 결정(47C-02): "【추론】 38C-01은 "뒤의 배열 통째 쓰기(호출자·로드·`push` 등 구조 연산 포함)는 그 `raw`를 대신해 새 아이템을 새 키로 만들며"라고 적었으므로 가지 배열 행의 `push(x)`는 호스트가 `null`·`17` 같은 잘못된 종류의 `raw`를 들고 있어도 `raw`를 비우고 아이템 하나(`[x]`)를 만든다; 레거시 가지 행의 `push`도 `null` 여부를 묻지 않고 아이템을 만든다(`BranchStrategy.ts:366-380`). 35C-06이 무효 호출로 적은 것은 `update`·`remove`·`pop`뿐이고 그 셋은 "있는 아이템"을 전제하므로 `null`에서 무효로 남으며, `clear`는 만들 아이템이 없어 `null`을 그대로 둔다(레거시 `BranchStrategy.ts:455`, `TerminalStrategy.ts:228-231`의 주석 "A `null` array has no elements to clear and stays `null` — only a write that carries a value turns it into an array"); 35C-12의 "값이 `null`이면 동사는 무효 호출(35C-06)"은 35C-06의 그 셋을 가리킨 것이다. 06은 `arrayBehavior/DETAIL.md:14`의 "모든 동사"를 이 넷으로 고친다." (`reviews/round-47-closing.md:18`)
  > 편집자 결정(48C-02): "【추론】 두 행이 잘못된 종류의 `raw`를 다루는 규칙은 하나다(NODE-026 "타입별 특수 경로를 일반 경로에 박지 않는다", 38C-01의 "뒤의 배열 통째 쓰기(… `push` 등 구조 연산 포함)는 그 `raw`를 대신해"): 터미널 배열 행도 `raw`가 배열이 아니면(`null`·`undefined`·`17`·객체 등) `push(x)`가 그 `raw`를 대신해 `[x]`를 통째로 쓰고 경고등은 꺼지며, `update`·`remove`·`pop`·`clear`는 아이템이 없으니 무효 호출이다. 레거시 터미널 행의 `push`는 `null`·`undefined`만 다루고 `17` 위에서는 펼치기가 던지므로(`TerminalStrategy.ts:185`의 `[...this.__value__, data]`) 지킬 레거시 동작이 없고, 47C-02 터미널 문장의 "`null`·`undefined`"는 레거시가 다룬 경우를 든 것이지 범위를 좁힌 것이 아니다. 06은 `arrayBehavior/DETAIL.md:14`와 `arrangeTerminalArray.ts`를 "배열이 아닌 `raw`"로 고친다." (`reviews/round-48-closing.md:17`)
- 상태: 현행
- 출처: `adr/0011-branch-node-composition.md:26-33`(정본)
- 닫은 사람: 편집자 결정(ADR 0011 4차 본문, `adr/0011-branch-node-composition.md:12`), 편집자 결정(4라운드 3.1판, `adr/0011-branch-node-composition.md:5`; 노드 종류의 목록)
- 라운드: 5
- 까닭: `adr/0011-branch-node-composition.md:26`

### NODE-022 union 호스트의 특수 처리는 없다 — 폼은 분기를 고르지 않는다

- 결정:
  > (2) 판별 프로퍼티의 소유·union 호스트의 특수 처리는 없다 — 폼은 분기를 고르지 않는다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0011-branch-node-composition.md:3#3`(정본)
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:9` A-3)
- 라운드: 10
- 까닭: `reviews/round-10-owner-answers.md:9`

### NODE-023 대체됨: 노드 종류 표의 union 호스트 행

- 결정:
  > | union 호스트 | 분기 스키마 + 판별 프로퍼티 | 판별식이 없을 때만 `selection` 칸(A7·E2) | 이름 | 분기 가드가 조각을 켠다. 판별 프로퍼티는 호스트가 소유한다 |
- 보충: 없음
- 상태: 대체됨(→ NODE-022)
- 출처: `adr/0011-branch-node-composition.md:34`(정본)
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:9` A-3)
- 라운드: 10
- 까닭: `reviews/round-10-owner-answers.md:9`

### NODE-024 대체됨: 노드 종류 표의 참조 그룹 행

- 결정:
  > | **참조 그룹** | **형제 참조** (D-6 (a)) | 없다 — `raw`·`local`·`emit`이 모두 없다 | 이름 | **나타나지 않는다** |
- 보충: 없음
- 상태: 대체됨(→ NODE-032, NODE-034)
- 출처: `adr/0011-branch-node-composition.md:35`(정본)
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:31` E-4), 편집자 결정(17라운드 노드 구조 수렴, `adr/0011-branch-node-composition.md:71`; 값 행)
- 라운드: 17
- 까닭: `reviews/round-10-owner-answers.md:31`

### NODE-025 branch 노드에 남는 책임은 셋 — 자식 집합의 출처, 활성, identity

- 결정:
  > ADR 0006(노드 트리가 곧 상태)과 0007(작업 루프)이 들어오면 값의 합성, 상향·하향 전파, 역류 방지 잠금은 branch 노드의 일이 아니게 된다. 남는 것:
  > 1. **자식 집합의 출처** — 어떤 자식이 있을 수 있는가
  > 2. **자식의 활성** — 그 가운데 지금 존재하는 것은 무엇인가(조각의 활성 집합, ADR 0002)
  > 3. **자식의 identity** — 렌더 계층이 같은 자식을 같은 것으로 알아보는 수단
- 보충: 없음
- 상태: 현행
- 출처: `adr/0011-branch-node-composition.md:39-43`(정본)
- 닫은 사람: 편집자 결정(ADR 0011 4차 본문, `adr/0011-branch-node-composition.md:12`)
- 라운드: 5
- 까닭: `adr/0011-branch-node-composition.md:39`

### NODE-026 object와 array는 자식 집합의 출처만 다르다 — 같은 모델, 재계산은 재계산 목록에 비례

- 결정:
  > 활성, 유효 스키마, 방출 값의 메모는 같은 모델을 따른다. 타입별 특수 경로를 일반 경로에 박지 않는다.
  > 재계산은 **자식 dirty 목록에 비례한다.** 3라운드에서 배열 아이템 호스트로 확인했다 — 아이템 10,000개짜리 배열의 9,999번 입력이 일으키는 계산은 4회다(`reviews/round-3.md` T13). 배열 아이템은 자기 자신이 호스트이므로 object 호스트와 같은 규칙으로 돈다. 합성은 조각 토글마다 전체 리빌드가 아니라 **그 조각이 선언한 키만 패치**하며(F13), 호스트의 자식 1,000개를 매번 순회해 `prev[name]`을 읽으면 메가모픽 접근으로 키 입력당 약 85 µs가 든다(`reviews/round-4.md` §2.1).
- 보충:
  > "(4) "dirty 목록"은 재계산 목록이다." (`adr/0011-branch-node-composition.md:3`)
  > 편집자 결정(44C-01): "【추론】 (나) 키 입력의 아이템 수 비례 합성도 결함이며 소유자 승인이 필요한 최적화가 아니다: NODE-026은 "재계산은 자식 dirty 목록에 비례한다 … 아이템 10,000개짜리 배열의 9,999번 입력이 일으키는 계산은 4회다"와 "object와 array는 자식 집합의 출처만 다르다 — 같은 모델"을 적었고, 객체 쪽 SETTLE-042는 "키 집합이 같은 커밋(값만 바뀐 쓰기, 키 입력)은 바뀐 자식만 직전 `local`의 사본에 같은 자리로 패치한다 … 키 집합이 바뀌는 커밋은 … 새로 짓는다"로 그 모델을 적었다. 그러므로 배열 행의 `assemble`은 같은 규칙을 따른다 — 아이템 수와 자리의 노드 집합이 같은 커밋은 재계산 목록의 자리만 직전 `local`의 사본에 패치하고 그 자리만 비교하며(바뀐 것이 없으면 같은 참조), 아이템 수나 자리의 노드가 바뀐 커밋(구조 연산, 통째 교체, 아이템 게이트 토글)은 O(아이템 수)로 새로 짓는다; 방출 값과 같은 참조 규칙은 바뀌지 않는다. `arrayBehavior/DETAIL.md:12`의 "모든 자리를 자리 순서로 놓는다"는 06 자신의 근사이므로 DETAIL을 먼저 고친다; 커밋 뒤의 출력 비교(`updateOutput.ts:16`)가 배열 전체를 깊이 비교한다면 같은 비례 위반이라 패치한 자리 밖은 참조 비교로 끝나게 함께 고친다." (`reviews/round-44-closing.md:10`)
  > 편집자 결정(51C-01): "【추론】 P-03은 04가 27라운드 소유자 답(구현 단계에는 기록만)에 따라 적어 둔 행이지 소유자가 느린 행으로 받아들인 것이 아니므로(상태 "기록, 구현 완료 뒤"; P-04의 "소유자 수용"과 다르다) 48C-01의 "소유자 수용은 행에 적힌 원인에 한한다"가 지키는 것이 없고, 44C-01이 그 뒤에 "변경에 비례하지 않는 비용은 수용 대상이 아니라 발견한 단계가 고친다"고 정했으며 49C-01대로 06의 배열 시나리오(호스트·아이템 `active`, 게이트 배열 재진입)가 그 줄에 닿는다; 들어오는 아이템마다 호스트 전체를 다시 조립하는 것은 NODE-026 "재계산은 자식 dirty 목록에 비례한다"와 SETTLE-017의 범위를 넘는다. 그래서 06이 지금 고치고, 같은 줄이 원인인 P-03의 객체 첫 로드도 함께 풀리므로 고친 뒤 P-03의 시나리오(게이트 형제 1천/2천/4천/8천)를 다시 재어 P-03을 "해결"로 옮긴다." (`reviews/round-51-closing.md:9`)
  > 편집자 결정(63C-03): "【추론】 44C-01 (나)는 배열 행의 `assemble`을 SETTLE-042의 객체 모델 그대로 "재계산 목록의 자리만 직전 `local`의 사본에 패치하고 그 자리만 비교"로 정했고, 그 모델은 바뀐 커밋마다 새 참조를 요구하므로(방출 값과 같은 참조 규칙) 직전 배열의 얕은 사본 한 번은 모델이 택한 비용이다; 방출 값은 JSON 직렬화와 같은 평범한 배열이어야 하므로(VALIDATE-007) 자리 공유 구조로 복사를 피하는 길은 없다. 44C-01이 결함으로 본 것은 "모든 자리를 다시 놓고 이전과 전부 비교"(자리마다 노드를 읽고 합성하는 아이템 수 비례의 계산)였고, 포인터 복사 한 번은 그 계산과 다른 상수의 비용이다 — 54라운드의 재측정이 1만 아이템 키 입력을 레거시보다 Node 약 35배·Bun 약 12배 빠르게 잰 것이 이 모델의 수치다. 그러므로 물음 29의 사본은 받아들이고 계약 위반으로 적지 않는다; 10만 아이템에서 자기 시간의 76–89%가 사본이라는 관찰은 대장에 "모델의 비용(선형 메모리 복사 한 번), 성능 개선 작업에서 패치 자리 밖의 복사를 줄이는 길(큰 배열의 조각 공유 등)을 검토"로 메모하고 PR-5의 병합 조건에 두지 않는다." (`reviews/round-63-closing.md:23`)
- 상태: 현행
- 출처: `adr/0011-branch-node-composition.md:47-49`(정본)
- 닫은 사람: 편집자 결정(ADR 0011 4차 본문, `adr/0011-branch-node-composition.md:12`)
- 라운드: 5
- 까닭: `adr/0011-branch-node-composition.md:49`
- 충돌:
  > `adr/0011-branch-node-composition.md:49`의 "합성은 조각 토글마다 전체 리빌드가 아니라 **그 조각이 선언한 키만 패치**하며(F13)"는 18라운드 결정과 다르다: 다시 계산하는 키는 그 조각의 것뿐이고, 키 집합이 바뀌면 그 호스트의 `local`을 선언 순서로 O(키 수) 새로 짓는다(SETTLE-042). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:1063-1066`).

### NODE-027 인라인 `FormTypeInput`의 암묵 터미널은 의도된 기능 — 끊지 않는다

- 결정:
  > 인라인 `FormTypeInput`을 꽂으면 자식 노드가 사라지는 것은 **의도된 기능**이다. 소유자: "브랜치 노드의 터미널 전략이 압도적으로 저렴해서, 사용자가 되도록 터미널 전략을 쓰게 하려고 설계한 방법. 1종 오류를 감수하고 2종 오류를 배제한 선택." 터미널 전략의 object·array는 자식 없이 값을 직접 들고(ADR 0006), 노출 표면은 branch 전략과 같다.
  > 소유자는 이 방식이 난해하면 끊어도 된다고 했다(그러면 터미널로 쓰려는 사용자가 `terminal: true`를 명시한다). 제안은 끊지 않는 것이다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0011-branch-node-composition.md:55-57`(정본), `open-questions.md:60`, `00-goals.md:116`, `reviews/round-2.md:114`
- 닫은 사람: 소유자 답(`00-goals.md:116` C3 세부 2), 소유자 답(`reviews/round-2.md:114` C3), 소유자 답(`reviews/round-17-owner-answers.md:12` 통보 1)
- 라운드: 17
- 까닭: `00-goals.md:116`
- 충돌:
  > `adr/0011-branch-node-composition.md:55`의 "인라인 `FormTypeInput`을 꽂으면 자식 노드가 사라지는 것은 **의도된 기능**이다."는 18라운드 결정과 다르다: 가상 노드는 인라인 입력을 두어도 전략이 `branch`이고 참조 노드의 `ChildNodeComponents`를 받으며, 암묵 터미널은 두 행을 가진 종류(object·array)에만 있다(NODE-047). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:1029-1035`).

### NODE-028 판정은 렌더 계층으로 — 판정 함수의 세 값과 터미널 전략을 정하는 순서

- 결정:
  > **암묵 규칙 유지, 판정은 렌더 계층으로.** 인라인 `presentation.FormTypeInput`이 **있고 `null`이 아닌지**를 보는 판정은 렌더 계층(React 바인딩)의 판정 함수가 하며, 렌더 계층이 이 함수를 청사진에 넘긴다. 판정 함수는 선언 하나를 받아 셋 가운데 하나를 돌려준다. 참(인라인 `presentation.FormTypeInput`이 있고 `null`이 아님), 거짓(그 키의 값이 `null`), 없음(그 키가 없거나 값이 `undefined`)이다. 없음은 앞 선언의 판정을 지우지 않으며(병합표의 `undefined`와 같다), 키 이름은 판정 함수만 안다. 청사진은 한 노드의 터미널 전략을 `options.terminal`(명시, 양방향) → 넘겨받은 판정 → `type`의 순서로 정한다. core는 `presentation` 안의 키를 읽지도 해석하지도 않으므로(P5) core만 쓰는 호스트에는 암묵 규칙이 없다.
- 보충:
  > "판정을 렌더 계층으로 옮기므로 core가 React 구성 요소를 판정하는 자리(`getNodeGroup.ts`의 `isReactComponent`)는 사라진다." (`adr/0011-branch-node-composition.md:59`)
  > "터미널 조건을 "있고 null이 아니다"로 넓히면 `React.lazy`의 결과나 설정 객체도 서브트리를 접는다." (`adr/0011-branch-node-composition.md:94`)
  > "`formTypeInputMap`은 트리 생성 뒤 렌더 계층에서 해석되므로 같은 컴포넌트가 인라인이면 터미널을 만들고 경로 매핑이면 만들지 않는다." (`adr/0011-branch-node-composition.md:94`)
  > 편집자 결정(35C-12): "【추론】 배열이 터미널인지는 PR-5가 정하지 않는다: NODE-002의 두 행(`branch`·`terminal`), NODE-027·028(인라인 `presentation.FormTypeInput`의 암묵 터미널은 렌더 계층의 판정 함수가 청사진에 넘겨 정하며 두 행을 가진 object·array에만 있다, NODE-047), BLUEPRINT의 `options.terminal: true` 허용과 `false`의 `TERMINAL_OPTION_UNSUPPORTED`, LANDING-048의 `node.strategy` 판정대로 06은 청사진의 `strategy`를 읽어 `array.terminal` 행을 고른다." (`reviews/round-35-closing.md:97`)
- 상태: 현행
- 출처: `adr/0011-branch-node-composition.md:59#1-7`(정본), `open-questions.md:60`, `adr/0011-branch-node-composition.md:3`, `adr/0011-branch-node-composition.md:53`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:12` 통보 1), 17라운드 스웜 수렴(편집자 결정, `adr/0011-branch-node-composition.md:59`; 판정 함수의 세 값과 core가 `presentation`을 읽지 않음)
- 라운드: 17
- 까닭: `adr/0011-branch-node-composition.md:59`(열넷째 문장), `reviews/round-17-owner-answers.md:12`
- 충돌:
  > `00-goals.md:116`의 "→ 암묵 규칙은 유지하되 core가 React 컴포넌트를 감지하지 않고 "있고 null이 아니다"만 보며, 명시적 재정의를 양방향으로 두는 안을 제안했다(ADR 0011 §3)."는 정본과 다르다. 정본이 이긴다(`adr/0011-branch-node-composition.md:59`).
  > `adr/0011-branch-node-composition.md:59`의 "청사진은 한 노드의 터미널 전략을 `options.terminal`(명시, 양방향) → 넘겨받은 판정 → `type`의 순서로 정한다."는 18라운드 결정과 다르다: 이 순서는 두 행을 가진 종류(object·array)에만 적용되고, 행이 하나인 종류는 전략을 그 행에서 정한다(NODE-047). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:1035`).

### NODE-029 모든 선언에서 전략을 정하고 경우마다 다르면 청사진 오류 — 선언의 범위와 경우의 정의가 18라운드 안건으로 이관됨

- 결정:
  > 한 노드의 전략은 청사진이 그 노드의 모든 선언에서 정적으로 정한다. 노드가 형상에 있는 모든 경우(그 노드를 선언한 게이트 가진 선언이 켜지고 꺼지는 조합. 게이트 없는 선언은 늘 켜져 있다)마다 그 경우에 켜진 선언들로 `options.terminal`(병합표대로 전순서에서 나중 것) → 렌더 계층 판정(없음이 아닌 결과 가운데 전순서에서 나중 것) → `type`의 순서로 전략을 정하고, 경우마다 정한 전략이 서로 다르면 청사진 오류다(14라운드 O-1과 같은 모양). 그래서 게이트 없는 선언끼리 값이 달라도 나중이 이길 뿐 오류가 아니고(12라운드 §9 "병합 불가한 … 나중이 승"), 조각에만 선언된 노드는 그 조각이 모두 꺼진 경우 형상에 없으므로 그 경우를 비교하지 않으며, 게이트 없는 선언의 `options.terminal`이 전략을 정한 노드에 게이트 가진 조각이 인라인 입력을 더해도 전략이 바뀌지 않으므로 오류가 아니다. 검사는 청사진 시점에 노드마다 그 노드의 선언 수에 비례하는 한 번이다.
- 보충:
  > "경우를 모두 열거하지 않는다." (`08-design-a-to-z.md:331`)
  > "각 경우의 전략은 켜진 선언 가운데 값을 가진 전순서의 나중 것이 정하므로, 게이트 없는 선언이 있으면 그것만 켜진 경우와 거기에 게이트 가진 선언을 하나씩 더한 경우를, 없으면 게이트 가진 선언이 하나씩만 켜진 경우를 비교하면 모든 경우를 비교한 것과 같다." (`08-design-a-to-z.md:331`)
- 상태: 대체됨(→ NODE-042)
- 출처: `adr/0011-branch-node-composition.md:59#8-11`(정본), `08-design-a-to-z.md:331`, `reviews/round-18-closing.md:213-226`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:22`, `reviews/round-18-agenda.md:24`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-09)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:22`, `reviews/round-18-agenda.md:24`, `reviews/round-18-closing.md:228-232`
- 충돌:
  > `adr/0002-guard-fragment-model.md:203`의 "조각이 `presentation.FormTypeInput`을 더하거나 빼 터미널 전략이 바뀌는 경로 — 닫힘."은 이 항목의 상태와 다르다. 18라운드 안건이 전략 비교의 '경우'의 정의와 게이트 없는 분기의 선언을 다시 열었다. 뒤 라운드가 이긴다(`reviews/round-18-agenda.md:22`, `reviews/round-18-agenda.md:24`).

### NODE-030 명시적 재정의를 양방향으로 둔다 — `terminal: false`·`terminal: true`

- 결정:
  > **명시적 재정의를 양방향으로 둔다.** `terminal: false` — 꽂은 입력이 `ChildNodeComponents`를 쓴다. `terminal: true` — 컴포넌트 없이도 터미널로 쓴다. 오늘도 `terminal: true`와 `terminal: false`가 양방향으로 있다(`getNodeGroup.ts:20-21`).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0011-branch-node-composition.md:60#1-4`(정본), `00-goals.md:116`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:12` 통보 1), 편집자 결정(ADR 0011 4차 본문 §3, `00-goals.md:116`의 제안)
- 라운드: 17
- 까닭: `00-goals.md:116`
- 충돌:
  > `adr/0011-branch-node-composition.md:60`의 "**명시적 재정의를 양방향으로 둔다.**"는 18라운드 결정과 다르다: 양방향 재정의는 객체·배열에서만 뜻이 있고, 잎의 `false`·가상의 `true`는 청사진 오류다(NODE-047). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:1035`).

### NODE-031 혼란스러운 경우를 드러낸다 — 터미널 노드의 입력이 빈 `ChildNodeComponents`를 읽으면 개발 모드 경고

- 결정:
  > **혼란스러운 경우를 드러낸다.** 터미널이 된 노드의 입력이 비어 있는 `ChildNodeComponents`를 읽으면 개발 모드에서 경고한다(`00-goals.md` C2).
- 보충:
  > 소유자(180라운드, G23 닫힘, 18C-73 개발 모드·브랜치 노드 한정): "1. 네 확인했습니다. 입력기를 쓰는 부분이라고 해서 직접 진행했죠.\n2. 저도 동의합니다. 개발모드에서만 켜고, object / array 처럼 브랜치 노드에 대해서만 처리했으면 해요. 나머지는 터미널만 가능하니까요. \n리뷰어는 지금 제 요구사항 처리중이긴 한데, 추가로 잘 이야기해줘요" (`reviews/round-180-owner-answers.md:7`) — G23 닫힘(소유자의 실제 IME 확인, Safari 생략); 빈 ChildNodeComponents 읽기 감지기는 개발 모드에서만, object·array 스키마 노드가 터미널이 된 경우에만 둔다; reviewer가 PR #354에서 처리(원장 관리자, 2026-10-12).
  > 편집자 결정(195C-01): "【추론】 (1)은 소비자가 가장 흔히 쓰는 모양(값 바뀌면 서버 오류 지우기)에서 루트 목록이 틀리는 회귀라 차단이 맞다. (2)는 소유자가 직접 지시한 변화라 허용 목록에 빠진 것은 내 기록 누락이다. (4)·(5)는 "경로"를 문자열로 읽은 데서 온 것이고 노드 경로로 통일하면 둘 다 사라진다. (3)은 속도와 늦은 평가의 교환이라 소유자 몫이지만, 늦은 평가를 요구한 이유가 사라졌으므로 2안을 추천한다." (`reviews/round-195-closing.md:9`)
  > 소유자(196라운드, isDevelopment 형태): "2안으로 가자. 리뷰어한테 전해줘." (`reviews/round-196-owner-answers.md:7`) — 개발 모드 판정은 캐시 함수가 아니라 소비자 번들러가 지울 수 있는 모듈 상수 `DEVELOPMENT`로 되돌린다; 늦은 평가를 요구한 183라운드의 이유(ESM 빌드의 접힘)는 PR #356이 해결했다(원장 관리자, 2026-10-13).
  > 편집자 결정(200C-01): "【추론】 소유자는 1안(캐시 함수 유지)과 2안(번들러가 지우는 상수) 가운데 번들러 제거를 골랐고, 그 제거가 상수로는 안 되고 사용처 토큰으로는 된다는 사실만 새로 드러났다. 목적을 지키는 쪽이 소유자 뜻에 가깝고, 상수로 두면 196라운드가 얻으려던 것이 없다. 토큰 산포의 유지 비용은 lint로 막을 수 있다." (`reviews/round-200-closing.md:9`)
- 상태: 현행
- 출처: `adr/0011-branch-node-composition.md:61`(정본)
- 닫은 사람: 원리(`00-goals.md:105` C2 작성자 실수의 가시성, 소유자 채택 `reviews/round-2.md:112`), 편집자 결정(ADR 0011 4차 본문, `adr/0011-branch-node-composition.md:12`)
- 라운드: 5
- 까닭: `00-goals.md:116`

### NODE-032 `virtual` — 참조 그룹 노드와 `&virtual`은 하지 않고 `options.virtual`은 현행 유지, 검증기 앞 제거 목록

- 결정:
  > (3) 참조 그룹 노드와 `&virtual`(D-6)은 하지 않는다 — `options.virtual`은 현행 유지(소유자 답 4), 검증기 처리는 12라운드에 닫힘: `options.virtual`은 검증기 앞 제거 목록에 들고 `required` 재작성은 버린다(원장 §1.4).
- 보충:
  > "`virtual`을 D-6의 참조 그룹 노드로 바꾸고 `type: 'virtual'`을 값으로 남기는가" (`reviews/round-10-spec.md:47`, 소유자 답 E-4가 답한 물음)
  > 편집자 결정(215C-02): "【추론】 런타임이 거부하는 키를 공개 형이 광고하는 것은 형 함정이고 원장이 이미 별칭 없음을 정했으므로 삭제는 결정된 일의 집행이다. 다만 공개 형 차분은 소유자가 본 적 없는 표면 변화이므로 귀환 때 확인 항목으로 남긴다." (`reviews/round-215-closing.md:29`)
- 상태: 중복(→ VALIDATE-034, WRITE-026)
- 출처: `adr/0011-branch-node-composition.md:3#4`(정본), `adr/0011-branch-node-composition.md:3`(열다섯째 문장), `open-questions.md:31`, `adr/0001-validator-input-invariant.md:3`
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:31` E-4), 소유자 답(`reviews/round-12-owner-answers.md:16` 8 `virtual`)
- 라운드: 12
- 까닭: `reviews/round-10-owner-answers.md:31`, `reviews/round-12-owner-answers.md:16`
- 충돌:
  > `adr/0011-branch-node-composition.md:5`의 "D-6은 **원리에서 도출**이며(`reviews/round-5-derivations.md` §3, 권고는 `reviews/round-3.md` §5) 소유자 확정 대기다."는 정본과 다르다. 정본이 이긴다(`adr/0011-branch-node-composition.md:3`).

### NODE-033 대체됨: `virtual`을 `&virtual`로 옮기고 core에 참조 그룹 노드 종류를 둔다(D-6 (a))와 (a)·(b)의 비용 비교

- 결정:
  > `virtual`을 `&` 계열로 옮기고(`&virtual`, 이름은 ADR 0003과 함께) core에 **참조 그룹**이라는 노드 종류를 둔다. 도출의 근거는 원리다(`reviews/round-5-derivations.md` §3): 참조 그룹은 값을 소유하지 않으므로 P2–P4 밖이고 표현 계층의 것이며(P5), `required`를 고쳐 쓰는 전처리는 P1′ 위반이므로 사라진다.
  > (a)와 (b)(렌더 계층으로 완전히 이동)는 **둘 다 P5와 양립한다.** 차이는 다른 렌더러로 이식할 때 바인딩의 두께뿐이다. 비용 비교는 미결이다.
  > **(a)와 (b)의 비용 비교.** 다른 렌더러 이식 시 바인딩의 두께 차이를 어떻게 잴 것인가.
- 보충: 없음
- 상태: 대체됨(→ NODE-032)
- 출처: `adr/0011-branch-node-composition.md:66,79,100`(정본), `open-questions.md:42`, `open-questions.md:44`
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:31` E-4)
- 라운드: 10
- 까닭: `reviews/round-10-owner-answers.md:31`

### NODE-034 가상 노드의 규칙 표 — 자식의 출처, 값, 쓰기, 방출·가드·검증, 명령, identity

- 결정:
  > | 항목 | 규칙 |
  > | ---- | ---- |
  > | 자식의 출처 | 형제 참조. 스키마도 값도 아니다 |
  > | 값 | `raw`·`emit`이 없고, 행의 `assemble` 칸이 참조 노드 값의 튜플을 `local`에 둔다(`value` 게터는 `local`, 오늘의 `VirtualNode.ts:112-139`). 전략은 `branch`다(`src/helpers/jsonSchema/filter.ts:20-21`, 17라운드 노드 구조 수렴). 인라인 `presentation.FormTypeInput`이나 `options.terminal: true`로 `'terminal'`이 되는 조합(오늘 `getNodeGroup.ts:22-23`, `getNodeGroup.ts:20-21`)은 18라운드 안건 N14다 |
  > | 쓰기 | 참조 노드로 부채질한다(`VirtualNode.ts:39-96`). 유지 |
  > | 방출·가드·검증 | 나타나지 않는다. 표준 `required`는 실제 필드만 적는다 |
  > | 명령 | `RequestRefresh`는 유지(ADR 0008 §7) |
  > | identity | 이름 |
- 보충:
  > 편집자 결정(42C-01): "【추론】 NODE-034는 가상 노드의 쓰기를 "참조 노드로 부채질한다 … 유지"로, 자식의 출처를 "형제 참조. 스키마도 값도 아니다"로 적었고 ERROR-195는 공개 `setValue`에서 온 모양이 틀린 값의 거부를 적었으므로, 호출자 경로의 분배가 없고 가상 노드 아래에 그림자 기록이 생기는 머지된 03 코드는 03의 기록 §4에 결정으로 남지 않은 근사이며 결함이다(39C-01, 29C-02·03과 같은 선례); 배열 동작은 아니지만 결함이 사는 자리는 `settle`의 쓰기 표시와 자식 선택이다." (`reviews/round-42-closing.md:9`)
  > 편집자 결정(42C-02): "【추론】 쓰기 쪽: 가상 노드에 온 호출자 쓰기는 ERROR-195대로 값이 `undefined`면 참조한 노드 모두에 그 쓰기 종류로 `undefined`를 쓰고, 배열인지를 길이보다 먼저 보아 길이가 참조 수와 같은 배열이면 자리마다 그 원소를 참조 노드에 같은 종류로 쓰며(나뉜 값은 참조 노드마다 `interpret`를 지난다), 그 밖의 값(`null`, 배열 아닌 값, 길이가 다른 배열)은 호출자 오류로 즉시 `SchemaFormError`(가칭 `INVALID_VIRTUAL_NODE_VALUES`, 기록에 `path`와 `details`의 기대 길이·받은 값)를 던진다; 자동 쓰기 경로의 분류(정착 오류, `cause` 가칭 `'writeShape'`)는 이미 있는 대로다. 가상 노드 자신은 `raw`가 없으므로(NODE-034) 쓰기가 가상 노드에 남기는 것은 dirty 표시뿐이고 값은 참조 노드에 산다." (`reviews/round-42-closing.md:18`)
  > 편집자 결정(42C-02): "【추론】 읽기 쪽: NODE-034·NODE-054대로 가상 노드의 자식 집합은 참조된 형제 노드 그 자체라 `structure`는 `fields`의 이름마다 부모의 실제 형제 노드를 가리키고, 자식 선택은 가상 노드 아래에 노드를 만들지 않는다(가상 행의 `declareChildren`은 만들 선언을 돌려주지 않고 참조만 맺는다); `find('/period/startDate')`는 `/startDate` 노드 자체를 돌려주며 그 `path`는 `/startDate`다. 가상 노드의 값은 행의 `assemble` 칸이 참조 노드 값의 튜플을 `local`에 둔 것이므로 로드 뒤 `['2021-04-01', '2021-04-02']`이고, `undefined` 쓰기 뒤 `[undefined, undefined]`다." (`reviews/round-42-closing.md:19`)
  > 편집자 결정(42C-02): "【추론】 참조 노드의 값이 바뀌면 그 가상 노드의 `local`을 같은 정착에서 다시 합성한다: 가상 노드의 값은 자기 하위 트리가 아니라 형제에서 계산되는 유일한 경우이므로, 정착은 참조 노드가 바뀐 커밋에서 그 노드를 참조하는 가상 노드를 다시 합성할 대상에 더하고(형제 어느 경로로 쓰였든, NODE-054 "그 노드에 한 쓰기는 가상 노드가 나눠 쓰는 것과 같은 곳에 닿는다"), 가상 노드의 구독자는 그때 바뀜을 받는다; 가상 노드는 방출·가드·검증에 나타나지 않으므로(NODE-034) 다시 합성해도 방출은 바뀌지 않는다." (`reviews/round-42-closing.md:20`)
  > 편집자 결정(45C-01): "【추론】 ERROR-195가 "참조한 잎 모두에 그 쓰기 종류로 `undefined`를 쓴다"고 적었고 쓰기의 종류는 호출자가 선언하며 core가 바꾸지 않으므로(WRITE 영역 D-4), 가상 노드는 종류를 바꾸지 않는 통로다: 호출자가 `Merge`를 주면 참조 노드마다 그 원소(또는 `undefined`)를 `Merge`로 쓰고 참조된 객체·배열 형제에서는 부분 쓰기가 되며, 옵션이 없거나 `Overwrite`면 참조 노드마다 전체 교체 쓰기다; 잎 참조에서는 둘이 같다. 42C-02의 "참조 노드마다의 전체 교체 쓰기"는 되물은 사례(옵션 없는 `setValue(undefined)`, 곧 기본 종류 `Overwrite`)를 말한 것이고 종류를 고정한 것이 아니다. 06의 "Merge여도 참조 가지를 교체한다" 시험은 뒤집어 "Merge는 참조 노드에서 부분 쓰기"로 둔다." (`reviews/round-45-closing.md:9`)
  > 편집자 결정(197C-01): "【추론】 둘 다 고침 후보와 재현이 이미 손에 있고 같은 파일 군이라 지금 고치는 비용이 가장 낮다. 2라운드가 길어지지만 소유자가 복합 동작의 정확성을 우선했다." (`reviews/round-197-closing.md:9`)
  > 편집자 결정(204C-01): "【추론】 R3의 두 결과는 각각 자기 의미(통째 쓰기 하나 / 순차 둘)에 맞고, 원장은 이미 그 차이를 명세로 받아들였다. 시험으로 나란히 고정해 두면 뒤에 누가 "다르다"고 다시 묻지 않는다." (`reviews/round-204-closing.md:9`)
  > 편집자 결정(208C-01): "【추론】 (1)은 오류 경로의 원자성이라 새 동작이 옳고 소비자에게 더 안전하다. 꼬리는 전부 외부 오류 채널과 설정·문서라 쓰기 경로 측정과 독립이다." (`reviews/round-208-closing.md:9`)
- 상태: 현행
- 출처: `adr/0011-branch-node-composition.md:68-75`(정본), `open-questions.md:37`
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:31` E-4; 현행 유지), 편집자 결정(17라운드 노드 구조 수렴, `adr/0011-branch-node-composition.md:9`; 값 행)
- 라운드: 17
- 까닭: `reviews/round-10-owner-answers.md:31`
- 충돌:
  > `adr/0011-branch-node-composition.md:71`의 "인라인 `presentation.FormTypeInput`이나 `options.terminal: true`로 `'terminal'`이 되는 조합(오늘 `getNodeGroup.ts:22-23`, `getNodeGroup.ts:20-21`)은 18라운드 안건 N14다"는 18라운드 결정과 다르다: 가상은 늘 `branch`이고 `options.terminal: true`는 청사진 오류다(NODE-047). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:1030-1033`).

### NODE-035 사라지는 전처리 하나 — `required`의 가상 이름 펼치기

- 결정:
  > 사라지는 것은 전처리 하나다 — `required`·`then.required`·`else.required`의 가상 이름을 구성 필드로 펼치던 `processVirtualSchema.ts:13-29`와 `transformCondition.ts:31-49`. ADR 0001(검증기 입력 불변)과의 충돌은 이 한 곳이었고, 여기서 소멸한다. 이중 소유(`getChildren.ts:56-75`)는 렌더가 구성 필드에 플래그를 달아 이미 중복을 없애고 있으므로(`getChildNodeMap.ts:63-64`) 노드 종류를 세우는 것으로 표에 자리가 생긴다 — 1라운드 R16이 지적한 "표에 들어가지 않는다"가 해소된다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0011-branch-node-composition.md:77`(정본), `open-questions.md:42`
- 닫은 사람: 소유자 답(`reviews/round-12-owner-answers.md:16` 8 `virtual`), 원리(`reviews/round-5-derivations.md` §3; P1′)
- 라운드: 12
- 까닭: `adr/0011-branch-node-composition.md:66`, `reviews/round-12-owner-answers.md:16`

### NODE-036 이주 시 보존할 테스트

- 결정:
  > `open-questions.md` Q5가 모은 사실이다. 새 구조에서도 같은 현상을 내야 하는 테스트.
  > | 대상 | 수 | 비고 |
  > | ---- | -- | ---- |
  > | `src/__tests__/scenarios/virtual.render.test.tsx` | 12 | 렌더 계층의 묶음 동작 |
  > | `src/core/__tests__/VirtualNode.test.ts`의 refresh 동작 | 4 | `RequestRefresh` 부채질 |
  > | virtual 전용 테스트 전체 | 4파일 47 | 교차검증 claude의 집계 |
  > | `processVirtualSchema.test.ts`의 `required` 펼치기 | 11 | **(a)에서 사라진다** — 전처리가 없어지므로 |
- 보충:
  > "검증기 처리는 12라운드에 닫힘: `options.virtual`은 검증기 앞 제거 목록에 들고 `required` 재작성은 버린다(원장 §1.4)." (`adr/0011-branch-node-composition.md:3`)
- 상태: 현행
- 출처: `adr/0011-branch-node-composition.md:83-90`(정본), `open-questions.md:40`
- 닫은 사람: 편집자 결정(ADR 0011 4차 본문, `adr/0011-branch-node-composition.md:12`)
- 라운드: 10
- 까닭: `adr/0011-branch-node-composition.md:83`, `reviews/round-10-owner-answers.md:31`

### NODE-037 배열 아이템의 identity·큰 배열의 지연 실체화·`contains`와 튜플이 18라운드 안건으로 이관됨

- 결정:
  > **배열에 값을 통째로 쓸 때 아이템의 identity**(R13). 전량 재생성 대신 재조정할 것인가, 재조정한다면 무엇을 같은 아이템으로 보는가. 아이템 identity는 값의 함수가 아니므로 구조 연산이 갱신하는 목록이 따로 필요하다. 입력 포커스와 비제어 입력의 상태가 걸려 있다(T-22).
  > **큰 배열의 지연 실체화**(R14). 남은 선택지는 ADR 0006 안에 있다 — 자식 노드가 실체화되기 전까지 array 노드가 터미널처럼 값을 들고, 접근될 때 아이템 노드를 만든다. 손잡이 노드가 `find()`를 부수효과로 만들고 `revision` 원장을 무효로 만든다는 지적이 있으므로 벤치마크로 확인한 뒤 정한다(ADR 0009).
  > **`contains`·튜플(`prefixItems`)**(Q13). 아이템 호스트는 dirty 목록으로 비례하지만 이 둘은 미정의다. 튜플은 출처가 스키마와 값에 걸쳐 있다.
- 보충: 없음
- 상태: 대체됨(→ NODE-051, NODE-052, NODE-053, FRAGMENT-051)
- 출처: `adr/0011-branch-node-composition.md:95-97`(정본), `reviews/round-18-closing.md:1638-1684,1692-1698`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:109`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-59)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:109`, `reviews/round-18-closing.md:1686-1690`

### NODE-038 `emit`의 키 순서(Q14)가 18라운드 안건으로 이관됨

- 결정:
  > **emit의 키 순서**(Q14). 스키마 선언 순서로 낼 것인가, 비용은 얼마인가.
- 보충: 없음
- 상태: 대체됨(→ SETTLE-042)
- 출처: `adr/0011-branch-node-composition.md:98`(정본), `reviews/round-18-closing.md:1053-1070,1076-1078`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:79`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-39)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:79`, `reviews/round-18-closing.md:1072-1074`

### NODE-039 2단계 생명주기가 새 구조에서도 필요한가 — 생성이 곧 첫 정착(GOAL-071)이 답함

- 결정:
  > **2단계 생명주기**(생성은 아래에서 위, 초기화는 위에서 아래)가 새 구조에서도 필요한가. 작업 루프의 첫 회가 초기화를 겸할 수 있다(T-20).
- 보충:
  > "생성이 곧 첫 정착(A3). 순서는 단일 순회가 정한다." (`04-inherited-constraints.md:35`)
- 상태: 대체됨(→ GOAL-071)
- 출처: `adr/0011-branch-node-composition.md:101`(정본)
- 닫은 사람: 편집자 결정(4라운드, `04-inherited-constraints.md:35` T-20; GOAL-071)
- 라운드: 5
- 까닭: `04-inherited-constraints.md:35`

### NODE-040 가상 노드 아래 경로의 `find` 별칭 여부(S11의 남은 물음)가 18라운드 안건에 남음

- 결정:
  > 참조 그룹에도 같은 질문이 있다(`find('/period/startDate')`의 별칭 여부).
- 보충: 없음
- 상태: 대체됨(→ NODE-054)
- 출처: `adr/0011-branch-node-composition.md:94#6`(정본), `reviews/round-18-closing.md:1897-1909`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:112`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-68)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:112`, `reviews/round-18-closing.md:1911-1914`

### NODE-041 공개 가드 (가칭) `isUnionNode`, 판별 합집합과 `InferSchemaNode`의 `union` 멤버, `type`은 `union`·`strategy`는 `terminal` — 가드는 열

- 결정:
  > 【추론】 (6) 공개 표면: 공개 가드 (가칭) `isUnionNode`(`isSchemaNode(x) && x.type === 'union'`)를 더하고, 공개 판별 합집합과 `InferSchemaNode`에 `union` 멤버를 더한다.
  > 【추론】 `node.type`은 `'union'`, `node.strategy`는 `'terminal'`이다.
  > 【추론】 그래서 공개 가드는 아홉에서 열이 된다.
- 보충:
  > 반영 칸(18C 검토 6번, 종류 이름): "원시 타입만의 다중 `type` 잎의 종류 이름은 `union`으로 확정하고 가칭을 푼다(가드 `isUnionNode`, 동작 모듈 `unionBehavior/`)." (`reviews/round-18-owner-answers.md:28`)
  > 편집자 결정(18C-89): "【추론】 `UnionNode`의 모양은 `type: 'union'`, `strategy: 'terminal'`, `schemaType: UnionSchemaType`, `nullable: boolean`, `children: null`에 공통 멤버를 더한 것이다(SURFACE-058)." (`reviews/round-18-closing.md:2338`)
  > 편집자 결정(18C-89): "【추론】 `UnionNode`는 `valueTypeMismatch`를 판별자로 두 멤버로 나뉜다." (`reviews/round-18-closing.md:2339`)
  > 편집자 결정(18C-89): "【추론】 공개 가드 `isUnionNode(x) = isSchemaNode(x) && x.type === 'union'`을 더한다(이름은 `reviews/round-18-owner-answers.md:28`)." (`reviews/round-18-closing.md:2347`)
  > 편집자 결정(18C-89): "【추론】 `isTerminalNode(unionNode)`는 참이고 그 반환 형 합집합에 `UnionNode`가 들어가며, `isBranchNode(unionNode)`는 거짓이다." (`reviews/round-18-closing.md:2348`)
  > 반영 칸(설계서 메모 4): "게터 `typeMismatch: boolean`, 경로 목록 `typeMismatches: readonly string[]`, 경고 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`." (`reviews/round-18-owner-answers.md:41`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:75-77`(정본), `reviews/round-18-closing.md:2338-2339,2347-2348`, `reviews/round-18-owner-answers.md:29`, `reviews/round-18-owner-answers.md:41`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-02), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-89), 소유자 답(`reviews/round-18-owner-answers.md:29` union 범위; 범위), 소유자 답(`reviews/round-18-owner-answers.md:41` 설계서 메모 4)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:84-91`, `reviews/round-18-closing.md:2367-2370`
- 충돌:
  > `reviews/round-18-owner-answers.md:28`의 "원시 타입만의 다중 `type` 잎"은 소유자 답과 다르다: `union`은 `type`에 원시·객체·배열 가운데 둘 이상의 종류가 적힌 칸의 터미널 잎이다(BLUEPRINT-036). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:29`).
  > `reviews/round-18-closing.md:75`의 "(가칭) `isUnionNode`"는 소유자 답과 다르다: 종류 이름 `union`과 가드 `isUnionNode`, 동작 모듈 `unionBehavior/`는 확정이고 가칭이 아니다(BLUEPRINT-035). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:28`).
  > `reviews/round-18-closing.md:2339`의 "【추론】 `UnionNode`는 `valueTypeMismatch`를 판별자로 두 멤버로 나뉜다."는 소유자 답과 다르다: 이 항목의 `valueTypeMismatch`·`valueTypeMismatches`·`VALUE_TYPE_MISMATCH`는 확정 이름 `typeMismatch`·`typeMismatches`·`SCHEMA_FORM_WARNING.TYPE_MISMATCH`로 읽는다(SURFACE-061). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:41`).

### NODE-042 터미널 전략의 정적 결정 — 셈에 드는 선언, 경우의 정의(조각 중첩), 축약 비교

- 결정:
  > 【추론】 (1) 청사진이 정적으로 정한다: 한 노드의 전략은 청사진이 그 노드의 선언에서 정적으로 정한다.
  > 【추론】 (2) 셈에 드는 선언: 게이트 없는 선언(본체, 게이트 없는 `allOf` 항목)과 게이트 가진 선언이다.
  > 【추론】 게이트 없는 `oneOf`·`anyOf` 분기의 선언은 그 노드의 유일한 선언일 때만 든다.
  > 【추론】 (3) 경우의 정의: 경우는 조각 중첩을 지키는 켜짐 조합이다.
  > 【추론】 게이트 없는 선언은 늘 켜지고, 중첩 조각 안의 선언은 그것을 감싸는 게이트 가진 조각이 모두 켜져야 켜진다.
  > 【추론】 각 경우에 켜진 선언들로 `options.terminal`(전순서에서 나중 것) → 렌더 계층 판정(없음이 아닌 결과 가운데 나중 것) → `type`의 순서로 전략을 정하고, 경우마다 다르면 청사진 오류(`TERMINAL_STRATEGY_MISMATCH`)다.
  > 【추론】 (4) 축약 비교: 경우를 모두 열거하지 않는다.
  > 【추론】 게이트 없는 선언이 있으면 그것만 켜진 경우 하나를 두고, 게이트 가진 선언 d마다 '게이트 없는 선언 ∪ d를 감싸는 게이트 가진 조각들이 이 노드에 둔 선언 ∪ d'가 켜진 경우를 둔다.
  > 【추론】 이것들을 비교하면 가능한 모든 경우를 비교한 것과 같다.
  > 【추론】 검사 비용은 노드마다 선언 수와 중첩 깊이의 곱을 넘지 않는다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:213-222`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-09)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:228-232`
- 충돌:
  > `adr/0011-branch-node-composition.md:59`의 "노드가 형상에 있는 모든 경우(그 노드를 선언한 게이트 가진 선언이 켜지고 꺼지는 조합. 게이트 없는 선언은 늘 켜져 있다)마다"는 18라운드 결정과 다르다: 경우는 조각 중첩을 지키는 켜짐 조합이고, 게이트 없는 `oneOf`·`anyOf` 분기의 선언은 유일한 선언일 때만 센다(NODE-042). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:215-218`).
  > `08-design-a-to-z.md:331`의 "노드가 형상에 있는 모든 경우(그 노드를 선언한 게이트 가진 선언이 켜지고 꺼지는 조합. 게이트 없는 선언은 늘 켜져 있다)마다"는 18라운드 결정과 다르다: 경우는 조각 중첩을 지키는 켜짐 조합이고, 게이트 없는 `oneOf`·`anyOf` 분기의 선언은 유일한 선언일 때만 센다(NODE-042). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:215-218`).
  > `02-target-overview.md:138`의 "노드가 형상에 있는 모든 경우(그 노드를 선언한 게이트 가진 선언이 켜지고 꺼지는 조합. 게이트 없는 선언은 늘 켜져 있다)마다"는 18라운드 결정과 다르다: 경우는 조각 중첩을 지키는 켜짐 조합이고, 게이트 없는 `oneOf`·`anyOf` 분기의 선언은 유일한 선언일 때만 센다(NODE-042). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:215-218`).
  > `03-mental-model.md:133`의 "노드가 형상에 있는 모든 경우(그 노드를 선언한 게이트 가진 선언이 켜지고 꺼지는 조합. 게이트 없는 선언은 늘 켜져 있다)마다"는 18라운드 결정과 다르다: 경우는 조각 중첩을 지키는 켜짐 조합이고, 게이트 없는 `oneOf`·`anyOf` 분기의 선언은 유일한 선언일 때만 센다(NODE-042). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:215-218`).

### NODE-043 탐색은 형상에 있는 노드만 — `structure`는 이름에서 형상 안 자식으로, `subnodes`·`variant`·`oneOfIndex` 내부 칸 폐기

- 결정:
  > 【추론】 형상에 없는 노드는 트리에 인스턴스가 없다.
  > 【추론】 그 원본은 루트가 잠복 원본으로 (절대 경로, 종류)를 키로 든다.
  > 【추론】 형상을 떠난 노드의 옛 참조는 18C-34가 정한다.
  > 【추론】 branch 객체의 `structure`는 이름에서 그 커밋의 형상에 있는 자식 노드로 가는 맵이다.
  > 【추론】 자식 선언의 신원 (이름, 종류)은 청사진이 선언을 무리 지을 때와 `settle`이 어느 종류의 노드를 살릴지 정할 때 쓴다.
  > 【추론】 한 커밋에서 한 이름에 형상에 있는 노드는 많아야 하나이므로(같은 이름·다른 종류가 동시에 켜지면 충돌이고, 전순서에서 앞선 종류만 산다) 맵의 키는 이름으로 충분하다.
  > 【추론】 `find`·`findNodes`·트리 걷기는 형상에 있는 노드만 돌려준다.
  > 【추론】 형상에 없는 노드를 지나는 경로는 `find`가 `null`, `findNodes`는 항목 없음이다.
  > 【추론】 터미널 아래 경로와 같은 규칙이다.
  > 【추론】 비활성 자식까지 담는 `subnodes`는 레코드에도 공개 겉면에도 두지 않는다.
  > 【추론】 `detectsCandidate`와 그 시험, 첫 후보로 물러나는 규칙, 내부 칸 `variant`·`scope`·`oneOfIndex`·`anyOfIndices`는 모두 폐기한다.
- 보충:
  > 편집자 결정(26C-06): "【추론】 원장이 "루트가 든다"고 적은 트리 전체 자료(로드 스냅숏, 잠복 원본, 경고등 경로 집합, 잠복 원본 열거의 메모)의 저장 자리는 트리마다 하나인 `SchemaNodeRuntime`의 칸이며, 루트는 자기 `runtime` 필드를 통해 그것을 든다." (`reviews/round-26-closing.md:66`)
  > 편집자 결정(26C-13): "【추론】 잠복 원본이 생기는 길은 둘뿐이다: 노드가 형상을 떠날 때 그 노드의 원본(NODE-044), 그리고 비활성 경로 쓰기(18C-64, 옛 참조 쓰기 포함). 형상에 든 적 없는 다른 종류의 선언은 노드가 아니므로 부모 원본의 키 값에서 잠복 원본을 만들지 않으며, 그 값은 살아 있는 노드의 원본 하나다." (`reviews/round-26-closing.md:137`)
  > 편집자 결정(26C-13): "【추론】 같은 경로에 다른 종류의 잠복 원본이 이미 있으면(종류 전환으로 떠난 노드의 원본) 지우지 않고 두며, 그 종류가 다시 형상에 들 때 그 원본으로 돌아온다." (`reviews/round-26-closing.md:139`)
  > 편집자 결정(26C-13): "【추론】 로드(마운트·`FormHandle.reset()`·`resetSubtree()`)는 V의 값을 경로마다 원본으로 싣고, 형상에 없는 경로의 값은 그 자리에서 잠복 원본이 된다(로드 왕복): 같은 경로가 어느 종류로든 형상에 있으면 그 값은 살아 있는 노드의 원본이라 잠복 원본이 생기지 않고, 어느 종류도 형상에 없으면 그 경로의 선언 가운데 청사진 전순서에서 앞선 종류의 (경로, 종류) 잠복 원본이 된다. 이미 있던 잠복 원본은 V의 값으로 바뀌거나 지워진다." (`reviews/round-26-closing.md:138`)
  > 편집자 결정(26C-14): "【추론】 어느 경로에 값을 싣는 쓰기(로드, 전체 교체 쓰기, 조상의 `Merge`·입력 쓰기가 나눠 준 값, 옛 참조로 한 쓰기)는 그 경로의 원본을 하나로 만든다: 그 경로에 형상에 있는 노드가 있으면 그 노드의 원본에, 옛 참조로 한 쓰기는 그 참조의 (경로, 종류) 잠복 원본에, 그 밖에는 그 경로의 선언 가운데 청사진 전순서에서 앞선 종류의 (경로, 종류) 잠복 원본에 쓰고, 같은 경로의 다른 종류 잠복 원본은 지운다." (`reviews/round-26-closing.md:147`)
  > 편집자 결정(26C-14): "【추론】 26C-13 :139의 "다른 종류의 잠복 원본이 이미 있으면 지우지 않고 두며"는 그 경로에 값을 싣지 않는 쓰기(다른 경로의 쓰기, 게이트 전환)에서의 규칙이다." (`reviews/round-26-closing.md:148`)
  > 소유자(342라운드, 이름부터 다시 숙고): "visit 이 끌리긴 하는데...\n이름부터 나머지까지 깊이 숙고해서 다시 추천해봐." (`reviews/round-342-owner-answers.md:7`)
  > 편집자 결정(389C-02): "【추론】 (1) `diagnostics.cause`의 `sharedConflict`는 공유 충돌이 그 정착의 첫 실패일 때의 값이다. 정착 실패 기록은 첫 실패의 cause를 유지하므로(`recordSettlementFailure`), 식·가드 실패가 먼저 기록된 정착에서 공유 충돌이 뒤따르면 cause는 `expression`으로 남는다 — ERROR-133의 네 값 규칙은 "어느 실패인가"를 정하지 "여러 실패 중 어느 것이 남는가"는 ERROR-070의 첫 실패 규칙이 정한다. (2) 386C-01의 "`primeHost`의 조회는 지연된 SharedNodeConflict 정착에서만 자연 적중한다"는 코드 판독으로 찾은 후보 경로가 하나뿐이라는 뜻이지 유일성의 증명이 아니며, 그 시험은 스파이로 대기 나감을 둔 합성 시험이다. 조회를 남긴 결정은 그대로다. (3) NODE-043의 잠복 원본 키 "(절대 경로, 종류)"와 "어느 종류의 노드를 살릴지"의 "종류"는 BLUEPRINT-043 (2)대로 union이면 접은 집합까지 포함한 종류다. 코드의 `kind` 문자열 `union`은 그보다 거칠어 정체 용도로 쓰면 결함이다(F1)." (`reviews/round-389-closing.md:10`)
  > 편집자 결정(390C-01): "【추론】 "(경로, 종류)" 열쇠와 "어느 종류의 노드를 살릴지"의 종류는 토큰 보조 하나가 정한다: union이 아니면 기존 kind 문자열이고(같은 이름 형제 사이에서 fold가 단일 타입이라 kind가 곧 정체), union이면 `union:<fold mask>`다. 마스크는 청사진 노드가 이미 보관한 정규화 `schemaType` 목록에서 청사진과 같은 fold 보조로 호출마다 계산하며(number/integer 같은 비트, null은 비트 없음), 저장 필드와 캐시를 더하지 않는다. 그래서 `[string,number]`와 `[number,string]`은 같은 토큰이고 `[string,boolean]`은 다르다. 이탈 대기·잠복 원본과 순서·게이트 경로 등록·커밋 선언·나감 정책·파생 규칙 열쇠·채움 집합은 모두 이 토큰으로 구별하고, 선택의 재사용·비활성 삭제·문서 순서 검색은 청사진 노드 객체 동일성으로 판정하므로 뒤 종류가 살아 있어도 첫 활성 종류가 생존하며 다른 fold의 잠복 값은 넘겨받지 않는다. 행 선택·전략·게이트 방식·구멍 값·공개 `type` 가드 같은 범주 판정은 기존 kind를 그대로 쓴다. 두 보조는 blueprint·settle·derive의 가장 낮은 공통 소유자인 engine의 organ에 두고 자식 모듈이 위로 직접 가져온다." (`reviews/round-390-closing.md:8`)
  > 편집자 결정(390C-02): "【추론】 (1) 386C-01의 "`primeHost`의 조회는 지연된 SharedNodeConflict 정착에서만 자연 적중한다"는 틀렸다: 같은 정착 안에서 한 쓰기가 union 게이트를 닫았다가(기본값 채움으로) 다시 열면 그 노드는 이탈 대기에서 같은 인스턴스로 되살아나며, 이것이 자연 입력 시험으로 고정됐다. 조회를 남긴 결정은 그대로이고 "유일 경로" 문장만 거둔다. (2) 열쇠는 경로 단위이므로, 부모가 게이트로 객체 속성 `0`과 배열 `items`를 배타 전환하면 `/p/0`의 string 토큰이 두 노드에서 같아 나간 속성의 잠복 원본이 배열 아이템 0으로 들어갈 수 있다. NODE-043의 "(절대 경로, 종류)" 정의가 허용하는 모양이라 결함이 아니며 설계를 유지한다(토큰을 청사진 ID로 바꾸면 기존 열쇠 기대 112쌍이 바뀜). 시험은 두지 않고 경계로만 적는다." (`reviews/round-390-closing.md:10`)
  > 편집자 결정(391C-01): "【추론】 배열 아이템(`items`·`additionalItems`·`prefixItems`)은 조각의 직계 자식이므로(376C-02·377C-01) 같은 이름 다른 종류의 규칙이 아이템 이름(반복 템플릿의 별표, 튜플의 색인)에도 적용된다: 청사진은 fold마다의 아이템 후보를 문서 순서로 두되 후보 목록은 fold가 여럿일 때만 만들고, 첫 후보 필드는 단일 후보 소비자를 위해 남긴다(두 필드의 문서 주석이 "첫 후보이며 fold를 구분하는 경로는 후보 목록을 쓴다"고 적어 이름 함정을 막는다). 정착은 켜진 후보가 하나면 그 종류의 아이템 노드를 두고, 같은 자리의 다른 fold가 동시에 켜지면 `SHARED_NODE_CONFLICT`이며 앞선 종류가 산다(FRAGMENT-049). 후보가 여럿이고 선택 전이면 입력을 첫 후보로 해석하지 않고 보존하며, 분배는 기존 규칙대로 첫 종류에 한다. 배열 호스트의 이탈·복원도 객체 자식처럼 경로·정체 토큰별 잠복 열쇠를 남기고 같은 후보만 복원한다 — 복원한 통째 배열이 그 자리로 재분배되지 않도록 분배 기록의 선택 필드가 보존 자리를 들며, 그 필드는 다중 후보 호스트의 복원에만 생기고 뒤따르는 새 쓰기(같은 자리·통째·동사·reset·스냅숏 로드)를 막지 않는다. 지름길(push·pop·꼬리·splice)과 정적 첫 로드의 자격은 "후보 하나"일 때로 유지하므로 단일 후보 호스트의 동작과 비용은 그대로다(L1b 계약). 파생 규칙표는 후보마다 대상 행을, 빈 자리 UI의 종류 추정은 켜진 후보의 종류를 쓴다." (`reviews/round-391-closing.md:8`)
  > 편집자 결정(391C-02): "【추론】 F3: 나가는 후보의 접두 정리(`captureExitedRaw`)가 형제 후보 소유의 잠복 자손 열쇠까지 지운다. 객체 아이템 후보 A(속성 x)와 배열 후보 B를 둔 자리에서 A를 쓰고 호스트를 닫은 뒤 B를 켰다 끄고 A를 다시 켜면 A가 빈 객체로 돌아오며, 객체 호스트의 속성에서도 같다(기존 결함). 튜플 객체 아이템 안의 string/number 후보 속성에서 string이 잠복 중일 때 앞 삽입을 하면 소멸 정리가 재키보다 먼저 돌아 잠복 값이 사라지는 것(기존)도 같은 묶음이다. 고침은 객체·배열 공통으로 접두 정리를 후보 소유권(경로·토큰 열쇠가 어느 후보 것인지)으로 좁히고 재키 순서를 바로잡는 것이며, 측정 묶음보다 앞서고 착수 전 codex 읽기 조사로 지우는 열쇠 집합과 소유권을 아는 자리를 확인한다. 대기열 62(소유자): 모든 분기가 꺼진 자리에 쓴 값은 뒤 분기를 켤 때 사라진다 — 형상 밖 경로를 덮는 쓰기는 첫 종류에 분배하고 다른 종류의 잠복 원본을 지우는 현행 규칙(26C-13·14)대로이고 객체 속성과 배열 아이템이 같으므로 결함이 아니다. 그 동작이 바람직한지, 즉 뒤 분기가 켜질 때 그 값을 받아야 하는지는 소유자가 정한다." (`reviews/round-391-closing.md:10`)
  > 편집자 결정(394C-01): "【추론】 (1) 떠나는 후보는 상속 범위 안에서 "그 후보가 닿거나 어느 후보도 닿지 않는 (경로, 토큰)"만 지우고, 다른 살아 있거나 남은 형제 후보가 닿는 공유 열쇠는 남긴다. 어느 후보도 닿지 않는 낡은 열쇠는 호스트 종류·나감 정책·메타데이터와 무관하게 지운다(disableAutomaticWrites 객체 이탈만 예외, 394C-02). 독립적으로 나가는 중첩 후보는 둘러싼 모든 후보 자리의 제한을 합성해 같은 선택자를 쓴다. 정책 상속은 공유 조상의 메타데이터(명시 보존 포함)를 읽되 실제 삭제는 소유 선택자를 거친다(WRITE-034). (2) 자리 이동과 레코드 재생성을 가른다: 원천 자리가 살아 남아 위치만 옮겨 가면 모든 후보의 열쇠가 함께 옮겨 가고(NODE-051, 41C-01의 "그 자리의 값"은 종류별 원천을 포함), 자리가 진짜로 사라질 때만 전부 지운다(WRITE-036). 재키가 처리한 생존 목적지는 최종 정리가 다시 지우지 않고, 실제로 나가는 노드의 misfit만 정리한다. (3) 재생되는 자리는 모든 깊이에서 하나의 규칙을 따른다: 자기 종류의 (경로, 토큰) 저장 원천이 정확히 있을 때만 그것을 쓰고 없으면 base와 같은 합성 입력이며, 자기 원천 복원은 자식·extras의 일반 분배를 대체하지 않고 합치고, terminal 도착은 완전한 공개 값만 받는다. 다른 종류의 살아 있던 값은 자기 토큰의 잠복으로 남는다. (4) 도달 질의는 한 질의 안에서만 사는 (템플릿, 깊이) 실패 집합으로 같은 상태를 한 번만 탐색한다 — 질의 사이에 남는 것이 없어 370라운드의 캐시 금지에 해당하지 않는다. 단일 후보 그래프는 선택자 빠른 반환과 base의 목적지 등록을 그대로 두어 동작·할당이 같다." (`reviews/round-394-closing.md:8`)
  > 편집자 결정(394C-02): "【추론】 남은 결함(모두 base부터 있던 것, 측정 묶음보다 앞서 별도 PR로 닫는다): (a) 미선언 꼬리로 옮겼다 돌아오면 살아 있던 기록의 후보 원천이 포착되지 않는다(이미 잠복이던 원천은 재키됨). (b) 같은 정착에서 나가는 도착 배열로 옮기면 그 이탈의 일반 포착이 후보별 열쇠를 지우고 통째 배열 원천만 남긴다. (c) 일반 배열의 게이트 이탈에서 깊은 후보 저장 원본이 사라진다. (d) disableAutomaticWrites 객체 이탈에서 어느 후보도 닿지 않는 낡은 열쇠가 남는다. (e) 배열 호스트가 꺼진 동안 쓴 값은 통째로 보관됐다가 재진입 때 켜진 종류에 분배되어 뒤 종류가 값을 받는데(7이 "7"로), 객체는 쓰는 순간 전순서 첫 종류에 분배한다 — 형상 밖 쓰기의 규칙(26C-13·14, WRITE-087)대로 배열도 쓰는 순간 첫 종류에 분배하도록 맞춘다(393라운드 결정 62 검토의 발견). 수용 잔여(기능은 같고 비용만 base보다 큼; base는 열쇠를 지워 버리던 결함 동작): 후보가 있는 재귀 그래프의 깊은 이탈이 깊이 20에서 base의 약 4배(0.44 → 1.83 ms), 깊이 128에서 약 17배(4.05 → 68.9 ms); 둘러싼 후보 자리가 깊이마다 겹치는 재귀 장면에서 도달 질의 수가 깊이 제곱, 배열 탐색이 세제곱(깊이 64: 질의 6,501, 탐색 139,425, base 0). 둘 다 질의 사이의 중복을 줄이는 알고리즘 수정이 "규칙 한 문장, 작은 diff, 행렬 관측 변화 없음"이면 별도 작은 PR로, 아니면 측정 묶음 후보로 둔다." (`reviews/round-394-closing.md:10`)
  > 편집자 결정(395C-01): "【추론】 R1(a·b·c): 구조 이동이나 보존하는 호스트 이탈이 남기는 모든 자리는 파괴적 주소·저장 변경 전에 모든 깊이의 살아 있는·이미 잠복인 후보 원천을 포착하고, 같은 정착의 이후 모든 단계에서 (경로, 토큰) 정체와 메타데이터를 보존하며, 합성 입력보다 정확한 원천을 먼저 재생한다(NODE-051, 41C-01). 보호 여부는 직계 후보 수가 아니라 후보를 포함한 하위 트리로 정하고, 템플릿 없는 도착 예외는 후보가 있는 이동의 원본 포착에만 적용해 후보 없는·단일 종류 자리는 base의 조기 종료와 목적지 등록을 그대로 둔다. R2(d): 후보 이탈은 자동 쓰기 억제와 무관하게 상속 소유 범위 안의 공유되지 않은 도달 불가 낡은 열쇠를 지우되 억제된 정책 쓰기는 켜지 않는다(WRITE-015·034). 이 정리는 후보 소유 범위 안의 이탈에만 하고 같은 포착이 돌려준 소유 판정을 같은 이탈 결정 안에서 인자로만 넘겨 재사용한다 — 모듈·런타임·노드 어디에도 저장하지 않으므로 370라운드의 캐시 금지에 해당하지 않는다. 자연 경로는 찾지 못해 합성 재현이다. R3(e): 종류가 둘 이상인 배열 경로의 형상 밖 쓰기는 쓰는 순간 선언된 원천을 재귀적으로 청사진 전순서의 첫 종류에 묶고 그 주소의 다른 종류 원천을 지우며 길이와 미선언 꼬리는 보존하고 재진입 때 주인을 다시 바꾸지 않는다 — 객체의 형상 밖 쓰기 규칙(26C-13·14, WRITE-087)과 같아진다. 35C-10("비활성 배열 호스트의 잠복 원본은 배열 전체를 호스트 자신의 얼린 raw 하나로 보관")은 뒤집지 않고 좁힌다: 후보가 있는 배열 경로의 새 형상 밖 쓰기만 제외하고, 이탈 포착과 후보 없는·단일 종류 배열은 그대로다. 결정 62는 이 수정으로 (가) "현행 규칙 유지, 배열을 객체와 같게"로 잠정 닫으며 소유자 확정을 기다린다." (`reviews/round-395-closing.md:8`)
  > 편집자 결정(395C-03): "【추론】 같은 배열 호스트의 inactiveValues 호스트 항목이 들어온 길(이탈 포착, 꺼진 쓰기, 로드)마다 다른 모양인 겹침은 base부터 있던 것으로 이 PR의 규칙과 무관하다(fairy08 P3-2). 394C-02의 수용 잔여(둘러싼 후보 자리가 깊이마다 겹치는 재귀 장면의 이탈 비용)는 이 PR에서 바꾸지 않았고, 읽기 조사 결과("한 이탈 판정 안에서 같은 도달 질문을 한 번만 푼다", 제품 100~160줄)는 작은 PR의 기준을 넘어 측정 묶음 후보로 둔다." (`reviews/round-395-closing.md:12`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:921-931`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-33)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:934-937`

### NODE-044 형상을 떠난 노드는 떼어진다 — 읽기는 마지막 커밋으로 고정(구조 읽기는 함께 떼어진 하위 트리, `rootNode`·절대 경로·`globalState`·`globalErrors`는 살아 있는 트리), 쓰기는 루트의 (경로, 종류) 잠복 원본만, 구독은 남되 발화 없음, 명령과 상태 진입은 무동작, 다시 들면 새 인스턴스

- 결정:
  > 【추론】 형상을 떠난 노드는 떼어진다(detached).
  > 【추론】 트리는 그 노드를 버리고, 루트는 그 원본을 잠복 원본으로 (절대 경로, 종류)를 키로 든다.
  > 【추론】 소비자가 든 옛 참조는 읽을 수 있다.
  > 【추론】 떼어진 노드의 읽기 멤버는 모두 그 노드가 형상에 있던 마지막 커밋의 값을 돌려주고, 그 뒤로 바뀌지 않는다.
  > 【추론】 옛 참조로 한 쓰기도 이 읽기를 바꾸지 않는다(쓴 값은 루트의 잠복 원본에 있다).
  > 【추론】 구조 읽기(`children`, 상대 경로의 `find`·`findNodes`)는 그 노드와 함께 떼어진 하위 트리를 본다.
  > 【추론】 예외로 `rootNode`는 살아 있는 루트이고, 트리 전체를 읽는 `globalState`·`globalErrors`도 살아 있는 런타임을 읽는다(18C-41).
  > 【추론】 그래서 절대 경로는 살아 있는 트리에서 풀린다.
  > 【추론】 있던 구독은 유효하다(구독 해제가 된다).
  > 【추론】 다시 발화하지는 않는다.
  > 【추론】 명령(`focus`·`select`·`refresh`·`remount`)과 상태 진입(`setSubtreeState`·`clearSubtreeState`)은 아무것도 하지 않는다.
  > 【추론】 옛 참조로 한 쓰기는 오류가 아니다.
  > 【추론】 그 쓰기는 루트의 그 (경로, 종류) 잠복 원본을 고치고, 규칙을 평가하지 않으며, 아무것도 내지 않는다.
  > 【추론】 그래서 순차 쓰기와 묶음 쓰기가 같은 원본에 닿는다.
  > 【추론】 노드가 다시 형상에 들면 새 인스턴스를 만든다("재탄생은 새 삶", `08-design-a-to-z.md:316`).
  > 【추론】 옛 참조는 떼어진 채로 남는다.
  > 【추론】 `SCHEMA_FORM_ERROR.DISPOSED_NODE_WRITE`(가칭)는 재생성 `reset`이 버린 트리의 노드에 대한 쓰기에만 남긴다.
- 보충:
  > 편집자 결정(26C-08): "【추론】 `active` 게터는 그 노드가 형상에 있는가(선언한 조각이 켜져 있고 노드 자신의 `controls.active`가 거짓이 아님, VALUE-006)를 읽는 멤버이므로, 살아 있는(형상 안) 노드에서는 늘 참이다." (`reviews/round-26-closing.md:87`)
  > 편집자 결정(26C-08): "【추론】 떼어진 노드의 `active`는 거짓이다: 떼어짐은 형상을 떠난 것이고, 이 멤버는 `rootNode`·`globalState`·`globalErrors`처럼 살아 있는 트리의 사실을 읽는 NODE-044 고정 규칙의 예외다." (`reviews/round-26-closing.md:88`)
  > 편집자 결정(26C-08): "【추론】 조각 게이트가 꺼져 떼어진 경우도 같으며(노드 게이트 값이 아니라 형상 여부를 읽는다), 노드가 다시 형상에 들어도 옛 참조의 `active`는 거짓인 채다(새 인스턴스가 참이다)." (`reviews/round-26-closing.md:89`)
  > 편집자 결정(26C-10): "【추론】 떼어진 노드에서 `diagnostics`는 살아 있는 트리(런타임의 진단 칸)를 읽는 NODE-044 고정 규칙의 예외다: `diagnostics`는 트리 전체의 커밋을 기술하며(ERROR-131) 루트에서 관측하는 것이라(SURFACE-007) `globalErrors`와 같은 부류다." (`reviews/round-26-closing.md:107`)
  > 편집자 결정(26C-10): "【추론】 `misfit`·`misfits`·`inactiveValues`·`defaultValue`는 NODE-044의 고정 읽기이며, 떼어질 때 그 노드가 형상에 있던 마지막 커밋의 값을 한 번 갈무리한다." (`reviews/round-26-closing.md:108`)
  > 편집자 결정(26C-10): "【추론】 떼어진 참조에 쓴 값은 살아 있는 노드에 쓸 때와 같은 쓰기 규칙으로 루트의 (경로, 종류) 잠복 원본에 닿는다: 전체 교체(옵션 없음·`Overwrite`·`setValue(V)`)는 그 경로의 잠복 원본을 받은 값으로 바꾸고 그 아래 자손의 잠복 원본을 없음으로 하며, `Merge`는 WRITE-079대로 키로 합칠 수 있는 자리에서만 합치고 그 밖은 통째로 바꾼다." (`reviews/round-26-closing.md:109`)
  > 편집자 결정(26C-10): "【추론】 규칙 평가와 방출은 없으며, 그래서 떼어지기 전과 뒤에 같은 순서로 쓴 결과의 원본이 같다." (`reviews/round-26-closing.md:110`)
  > 편집자 결정(26C-12): "【추론】 노드가 떼어진 뒤 같은 (경로, 종류)의 새 인스턴스가 형상에 든 동안, 옛 참조로 한 쓰기(`setValue(V)`, `Merge`, `resetSubtree()`)는 아무것도 하지 않는다: 잠복 원본을 만들지 않고, 살아 있는 노드의 원본에도 닿지 않으며, 오류가 아니다." (`reviews/round-26-closing.md:127`)
  > 편집자 결정(26C-12): "【추론】 잠복 원본은 형상에 없는 노드의 원본이므로 그 경로가 살아 있으면 고칠 잠복 원본이 없고, 살아 있는 원본을 옛 참조로 바꾸면 표시·계산 없이 원본이 바뀌어 커밋된 트리가 상태의 순수 함수가 아니게 된다(SETTLE-010)." (`reviews/round-26-closing.md:128`)
  > 편집자 결정(26C-12): "【추론】 그 경로가 뒤에 다시 형상을 떠나면 옛 참조들의 쓰기는 다시 같은 (경로, 종류)의 잠복 원본에 닿는다(26C-10)." (`reviews/round-26-closing.md:129`)
  > 편집자 결정(26C-14): "【추론】 어느 경로에 값을 싣는 쓰기(로드, 전체 교체 쓰기, 조상의 `Merge`·입력 쓰기가 나눠 준 값, 옛 참조로 한 쓰기)는 그 경로의 원본을 하나로 만든다: 그 경로에 형상에 있는 노드가 있으면 그 노드의 원본에, 옛 참조로 한 쓰기는 그 참조의 (경로, 종류) 잠복 원본에, 그 밖에는 그 경로의 선언 가운데 청사진 전순서에서 앞선 종류의 (경로, 종류) 잠복 원본에 쓰고, 같은 경로의 다른 종류 잠복 원본은 지운다." (`reviews/round-26-closing.md:147`)
  > 편집자 결정(28C-02): "【추론】 떼어진 노드의 `visible`·`readOnly`·`disabled`는 NODE-044의 고정 읽기이며, 26C-10의 `misfit` 등과 같이 떼어질 때 그 노드가 형상에 있던 마지막 커밋의 값을 한 번 갈무리한다; 26C-08의 예외는 `active`와 그것에서 도출되는 `enabled`에만 있다." (`reviews/round-28-closing.md:25`)
  > 편집자 결정(28C-02): "【추론】 떼어진 노드의 `enabled`는 거짓이다: `enabled`는 `active`에서 도출되므로 26C-08의 예외를 따르며, 그래서 NODE-044 고정 읽기의 예외이고 갈무리한 `visible` 값과 무관하다." (`reviews/round-28-closing.md:26`)
  > 편집자 결정(35C-09): "【추론】 `remove`·`pop`·`clear`·짧아진 통째 쓰기·로드로 소멸한 아이템과 그 자손은 NODE-044의 떼어진 노드다(읽기는 마지막 커밋에 고정, 구조 읽기는 함께 떼어진 하위 트리, `active`·`enabled`는 거짓, 구독은 남되 다시 발화하지 않음, 다시 들면 새 인스턴스); WRITE-036대로 나감 정책·나감 비움·잠복 포착·억제 비트·원본 B 기록은 없고, 런타임 경로를 키로 둔 저장소의 항목은 버린다." (`reviews/round-35-closing.md:74`)
  > 편집자 결정(35C-09): "【추론】 옛 참조로의 쓰기는 NODE-044 그대로다: 같은 (경로, 종류)의 살아 있는 인스턴스가 있으면 아무것도 하지 않고(재인덱싱 뒤에는 보통 이 경우), 없으면 루트의 (경로, 종류) 잠복 원본만 고친다; 배열을 따로 다루지 않는다." (`reviews/round-35-closing.md:75`)
  > 편집자 결정(35C-10): "【추론】 재진입은 그 값으로 아이템을 새 `#n` 키로 다시 만들고(NODE-044의 새 인스턴스, GOAL-073의 nonce), 채움은 로드·비로드 규칙대로 없음인 자손에만 간다(WRITE-007의 `push(v)` 규칙과 같다)." (`reviews/round-35-closing.md:83`)
  > 편집자 결정(38C-02): "【추론】 잠복 원본이 생기는 길은 "노드가 형상을 떠날 때 그 노드의 원본"(26C-13, NODE-044)이고 형상은 상태(`raw`·`extras`)의 순수 함수(P3)이므로, 35C-10의 "배열 전체를 호스트 자신의 얼린 `raw`로"는 아이템의 방출이나 `local`이 아니라 원본 트리를 뜻한다: 자리마다 아이템 잎·터미널의 `raw`, 가지 아이템은 그 자식들의 원본 트리와 `extras`를 재귀로 모은 객체(배열 아이템이면 배열), 원본이 하나도 없는 자리는 `undefined`, 청사진 없는 자리는 `extras`의 값이다; VALUE-034의 방출용 채움(`{}`·`[]`·`null`)은 데이터가 아니라 얼리지 않는다." (`reviews/round-38-closing.md:18`)
  > 편집자 결정(47C-01): "【추론】 NODE-021대로 가지 배열의 자식 집합은 값에서 오고(아이템 수 × 아이템 청사진) 그 아이템 수와 자리는 `structure`에 든 구조 사실이므로(NODE-004 "배열의 아이템 목록과 키 번호"), 38C-02의 원본 트리는 배열 호스트를 "자리마다 아이템의 원본 트리를 모은 값"으로 적은 그대로 자리 수 N만큼의 배열로 읽는다 — 원본이 하나도 없는 자리는 그 자리에 `undefined`를 두되 자리는 남기며(N = 0이면 `[]`), 배열 전체를 `undefined`로 접지 않는다; 38C-02의 "원본이 하나도 없는 자리는 `undefined`"는 자리 하나의 값에 대한 말이고 배열 호스트 자체에 대한 말이 아니다. 그래서 `[{},{}]`인 아이템은 `[undefined, undefined]`로 읽히고 재진입·재작성 때 길이 2의 아이템 두 개가 다시 생긴다(38C-02의 까닭 "재진입이 떠나기 전 상태로 돌아온다")." (`reviews/round-47-closing.md:9`)
  > 편집자 결정(47C-01): "【추론】 객체 호스트(아이템 포함)는 자식의 원본 트리 가운데 `undefined`가 아닌 것이 하나라도 있으면 그 키들만 모은 객체이고 하나도 없으면 `undefined`다 — 객체 아이템의 존재는 배열 자리가 보장하므로 `{}`로 얼릴 필요가 없고, `{}`는 VALUE-034의 방출용 채움이라 데이터가 아니다(38C-02); 잎은 `raw`가 있으면 그 값, 없으면 `undefined`다. `[undefined, undefined]`를 받은 배열 자리에 객체 아이템 청사진이 있으면 아이템은 `raw` 없이 생기고 자식 잎에 원본이 없어 WRITE-090의 채움은 그 생긴 노드에만 간다." (`reviews/round-47-closing.md:10`)
  > 편집자 결정(346C-01): "【추론】 떼어진 노드에서 부른 `visitSubtree`는 NODE-044의 구조 읽기 규칙을 따라 그 노드와 함께 떼어진 하위 트리(마지막 커밋의 형상)를 걷는다. SURFACE-062의 "형상에 있는 노드만 돈다"는 살아 있는 시작 노드에 대한 문장이다. 무동작은 명령과 상태 진입에만 정해진 것이므로 `dispatchSetSubtreeState`의 방식을 유추하지 않는다." (`reviews/round-346-closing.md:8`)
  > 편집자 결정(346C-03): "【추론】 떼어진 노드에 대한 쓰기(`setValue`·`finishInput`·배열 동사 다섯)는 `batch`나 순회 안에서도 표시하지 않고 곧바로 NODE-044 경로로 잠복 원본만 고친다 — 정착할 것이 없기 때문이고, 표시를 경로로 다시 푸는 지금까지의 동작은 같은 경로의 살아 있는 노드를 덮어쓰거나 쓰기를 버리는 기준 커밋의 결함이었다. 떼어짐의 판정은 쓰는 시점의 직전 커밋 형상이며 같은 `batch`가 바꿀 형상은 보지 않는다(EVENT-013·18C-20 "batch 안의 평범한 읽기는 직전 커밋"). 그래서 `batch` 안에서 떼어내기를 한 뒤 옛 참조에 쓰면 호출 시점에 살아 있는 노드가 있어 그 쓰기는 버려지고, 이것은 그 시점의 직접 쓰기와 같다." (`reviews/round-346-closing.md:12`)
  > 편집자 결정(347C-02): "【추론】 `adoptFieldNodeChain`은 상태를 옮기기 전에 두 루트 모두에 쓰기 가능 단언을 걸어, 이미 인계해 물러났거나 폐기된 루트가 어느 쪽에든 있으면 `SCHEMA_FORM_ERROR.DISPOSED_NODE_WRITE`로 던진다. 물러난 루트는 그 인계가 폐기하므로 A→B 뒤 B→A와 A→B 뒤 다시 A→B가 모두 막히고, 전에는 `adoptedRoot`가 서로를 가리키는 고리가 생겨 `resolveFieldNodeChainRoot`가 멈추지 않았다. NODE-044의 "`DISPOSED_NODE_WRITE`는 재생성 `reset`이 버린 트리의 노드에 대한 쓰기에만 남긴다"는 폐기된 트리로의 인계까지 넓힌다 — 인계도 폐기된 트리에 대한 쓰기이기 때문이다." (`reviews/round-347-closing.md:10`)
  > 편집자 결정(376C-01): "【추론】 소멸 때 보류 나감의 정리는 경로 접두가 아니라 노드 동일성으로 한다. 배열 remove가 뒤 아이템을 소멸한 아이템의 경로로 옮기고 그 안의 게이트 필드가 같은 커밋에서 나가면, 옛 판정(finalizePerished의 경로 접두 비교)은 소멸 노드의 옛 경로와 같은 경로를 가진 이동 노드의 나감까지 지워 그 필드가 떼어지지 않은 채 남았고, 소멸한 아이템 안의 보류 나감은 이미 아이템 children을 떠나 owned 걷기가 닿지 않아 detached 거짓·active 참으로 남았다. 둘 다 NODE-044(최종 형상을 떠난 노드는 자손과 함께 떼어진다)의 위반이고 #389 이전부터 있던 결함이다. 고침은 보류 나감 노드의 parent 사슬을 소멸 노드 집합과 대조해 소멸 아래의 나감만 빼고 그것을 소멸 자손처럼 떼어내며(active 거짓, 게이트 등록 해제, 배달 없음, 잠복 포착 없음), 소멸 경로로 옮겨 온 다른 아이템의 나감은 나감으로 처리해 그 값이 insert의 나감처럼 inactiveValues에 든다. 결함을 고정하던 시험 기대 하나를 NODE-044로 바꿨고 그 밖의 기존 기대 변경은 없다. 설계 원칙 변경은 없다(SETTLE-001, NODE-051, NODE-044)." (`reviews/round-376-closing.md:8`)
  > 편집자 결정(391C-02): "【추론】 F3: 나가는 후보의 접두 정리(`captureExitedRaw`)가 형제 후보 소유의 잠복 자손 열쇠까지 지운다. 객체 아이템 후보 A(속성 x)와 배열 후보 B를 둔 자리에서 A를 쓰고 호스트를 닫은 뒤 B를 켰다 끄고 A를 다시 켜면 A가 빈 객체로 돌아오며, 객체 호스트의 속성에서도 같다(기존 결함). 튜플 객체 아이템 안의 string/number 후보 속성에서 string이 잠복 중일 때 앞 삽입을 하면 소멸 정리가 재키보다 먼저 돌아 잠복 값이 사라지는 것(기존)도 같은 묶음이다. 고침은 객체·배열 공통으로 접두 정리를 후보 소유권(경로·토큰 열쇠가 어느 후보 것인지)으로 좁히고 재키 순서를 바로잡는 것이며, 측정 묶음보다 앞서고 착수 전 codex 읽기 조사로 지우는 열쇠 집합과 소유권을 아는 자리를 확인한다. 대기열 62(소유자): 모든 분기가 꺼진 자리에 쓴 값은 뒤 분기를 켤 때 사라진다 — 형상 밖 경로를 덮는 쓰기는 첫 종류에 분배하고 다른 종류의 잠복 원본을 지우는 현행 규칙(26C-13·14)대로이고 객체 속성과 배열 아이템이 같으므로 결함이 아니다. 그 동작이 바람직한지, 즉 뒤 분기가 켜질 때 그 값을 받아야 하는지는 소유자가 정한다." (`reviews/round-391-closing.md:10`)
  > 편집자 결정(394C-01): "【추론】 (1) 떠나는 후보는 상속 범위 안에서 "그 후보가 닿거나 어느 후보도 닿지 않는 (경로, 토큰)"만 지우고, 다른 살아 있거나 남은 형제 후보가 닿는 공유 열쇠는 남긴다. 어느 후보도 닿지 않는 낡은 열쇠는 호스트 종류·나감 정책·메타데이터와 무관하게 지운다(disableAutomaticWrites 객체 이탈만 예외, 394C-02). 독립적으로 나가는 중첩 후보는 둘러싼 모든 후보 자리의 제한을 합성해 같은 선택자를 쓴다. 정책 상속은 공유 조상의 메타데이터(명시 보존 포함)를 읽되 실제 삭제는 소유 선택자를 거친다(WRITE-034). (2) 자리 이동과 레코드 재생성을 가른다: 원천 자리가 살아 남아 위치만 옮겨 가면 모든 후보의 열쇠가 함께 옮겨 가고(NODE-051, 41C-01의 "그 자리의 값"은 종류별 원천을 포함), 자리가 진짜로 사라질 때만 전부 지운다(WRITE-036). 재키가 처리한 생존 목적지는 최종 정리가 다시 지우지 않고, 실제로 나가는 노드의 misfit만 정리한다. (3) 재생되는 자리는 모든 깊이에서 하나의 규칙을 따른다: 자기 종류의 (경로, 토큰) 저장 원천이 정확히 있을 때만 그것을 쓰고 없으면 base와 같은 합성 입력이며, 자기 원천 복원은 자식·extras의 일반 분배를 대체하지 않고 합치고, terminal 도착은 완전한 공개 값만 받는다. 다른 종류의 살아 있던 값은 자기 토큰의 잠복으로 남는다. (4) 도달 질의는 한 질의 안에서만 사는 (템플릿, 깊이) 실패 집합으로 같은 상태를 한 번만 탐색한다 — 질의 사이에 남는 것이 없어 370라운드의 캐시 금지에 해당하지 않는다. 단일 후보 그래프는 선택자 빠른 반환과 base의 목적지 등록을 그대로 두어 동작·할당이 같다." (`reviews/round-394-closing.md:8`)
  > 편집자 결정(395C-01): "【추론】 R1(a·b·c): 구조 이동이나 보존하는 호스트 이탈이 남기는 모든 자리는 파괴적 주소·저장 변경 전에 모든 깊이의 살아 있는·이미 잠복인 후보 원천을 포착하고, 같은 정착의 이후 모든 단계에서 (경로, 토큰) 정체와 메타데이터를 보존하며, 합성 입력보다 정확한 원천을 먼저 재생한다(NODE-051, 41C-01). 보호 여부는 직계 후보 수가 아니라 후보를 포함한 하위 트리로 정하고, 템플릿 없는 도착 예외는 후보가 있는 이동의 원본 포착에만 적용해 후보 없는·단일 종류 자리는 base의 조기 종료와 목적지 등록을 그대로 둔다. R2(d): 후보 이탈은 자동 쓰기 억제와 무관하게 상속 소유 범위 안의 공유되지 않은 도달 불가 낡은 열쇠를 지우되 억제된 정책 쓰기는 켜지 않는다(WRITE-015·034). 이 정리는 후보 소유 범위 안의 이탈에만 하고 같은 포착이 돌려준 소유 판정을 같은 이탈 결정 안에서 인자로만 넘겨 재사용한다 — 모듈·런타임·노드 어디에도 저장하지 않으므로 370라운드의 캐시 금지에 해당하지 않는다. 자연 경로는 찾지 못해 합성 재현이다. R3(e): 종류가 둘 이상인 배열 경로의 형상 밖 쓰기는 쓰는 순간 선언된 원천을 재귀적으로 청사진 전순서의 첫 종류에 묶고 그 주소의 다른 종류 원천을 지우며 길이와 미선언 꼬리는 보존하고 재진입 때 주인을 다시 바꾸지 않는다 — 객체의 형상 밖 쓰기 규칙(26C-13·14, WRITE-087)과 같아진다. 35C-10("비활성 배열 호스트의 잠복 원본은 배열 전체를 호스트 자신의 얼린 raw 하나로 보관")은 뒤집지 않고 좁힌다: 후보가 있는 배열 경로의 새 형상 밖 쓰기만 제외하고, 이탈 포착과 후보 없는·단일 종류 배열은 그대로다. 결정 62는 이 수정으로 (가) "현행 규칙 유지, 배열을 객체와 같게"로 잠정 닫으며 소유자 확정을 기다린다." (`reviews/round-395-closing.md:8`)
  > 편집자 결정(403C-01): "【추론】 PR #416을 fde6ab359로 squash 병합했다(커밋 80aa09947 DETAIL, d9ca55595 코드·시험, 9b2ca7af3 마무리). 비효율 하나: 나감 정책에 묶인 조각이 켜진 채 다른 잎을 쓰는 평상시 쓰기마다 commitExitPolicyValues가 자식마다 getControlLayers로 제어 층 전체를 모아 그 조각의 소유 자식인지 찾았고, 이 비용은 조각 수에 초선형이었다. 바뀐 규칙 한 문장: 선택된 선언(없으면 직전 커밋의 선택, 그것도 없으면 선언 전부)과 선언 자식의 소유 경로로 "이 조각의 첫 소유 자식인가"만 직접 판정하고, 전체 정책 층 수집·평가, 정책 우선순위, 같은 층 keep 우선, 직전 커밋 나감 의미는 그대로 둔다(CONTROLS-077, CONTROLS-073(7), WRITE-032, NODE-044). 캐시와 전역 상태는 없고 공개 API는 불변이다. 효과(Node v26.12.0·Bun 1.4.3, 두 바퀴 중앙값, 작업 폴더 dist 전후): 평상시 쓰기 F=64·C=16 Node 3.522→1.134 ms(−67.8%), Bun 16.575→1.412 ms(−91.5%); 실제 나감 쓰기는 바뀌지 않았고 Node 나감 F=64의 +8.8%는 측정 문서가 적은 나감 행 범위(−12.4%~+8.8%) 안이다. 계측: plain F=64 control의 getControlLayers 572→18회, exit 78→78회, 그중 commitExitPolicyValues 호출자 몫 3→3회. 정방향·역방향 각각 72장면·323단계 배달 비교 차이 0. 새 시험은 수정 전 구현에서 572회 상한으로 실패함을 확인했고 기존 시험의 기대값 변경은 0건이다. 결정 58의 입구 수치(F=64 평상시 쓰기 3.38 ms 중 2.34 ms, Node)는 이 병합으로 대부분 사라졌으므로 58 실험은 남은 비용(약 1.1 ms)을 기준으로 다시 잰다. 388라운드 허용 범위의 실험이며 소유자가 되돌릴 수 있다." (`reviews/round-403-closing.md:8`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:943-959`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-34)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:961-963`

### NODE-045 `SchemaNodeRuntime` 칸의 형은 `record/`가 최소 인터페이스로 선언한다 — `import type` 포함 비순환, PR-2 순환 검사

- 결정:
  > 【추론】 의존 역전으로 끊는다.
  > 【추론】 `record/`가 `SchemaNodeRuntime`의 칸(통지 대기열, 검증기, 진단, 진입 깊이와 예산, `nodeFactory`, `onError` 보고기)의 형을 그 칸을 부르는 쪽이 쓰는 최소 인터페이스로 선언한다.
  > 【추론】 `dispatch`·`validation`과 트리를 만드는 자리가 그 인터페이스를 만족하는 구현을 넣는다.
  > 【추론】 `record/`는 `dispatch`·`validation`·`app/plugin`을 가져오지 않는다.
  > 【추론】 `import type`도 금지다.
  > 【추론】 검증기 칸은 플러그인 형이 아니라 `record/`의 검증 요청 인터페이스이고, 플러그인의 검증기는 트리를 만드는 자리에서 이 칸에 맞춰 넣는다.
  > 【추론】 칸을 하나 더하면 `record/`의 선언을 고친다.
  > 【추론】 그 대가를 레코드 `DETAIL.md`에 적는다(`Behavior`와 같은 방식).
  > 【추론】 PR-2의 병합 점검에 `import type`까지 센 순환 검사를 둔다.
  > 【추론】 도구는 PR-2가 고른다.
- 보충:
  > 편집자 결정(26C-06): "【추론】 원장이 "루트가 든다"고 적은 트리 전체 자료(로드 스냅숏, 잠복 원본, 경고등 경로 집합, 잠복 원본 열거의 메모)의 저장 자리는 트리마다 하나인 `SchemaNodeRuntime`의 칸이며, 루트는 자기 `runtime` 필드를 통해 그것을 든다." (`reviews/round-26-closing.md:66`)
  > 편집자 결정(26C-06): "【추론】 NODE-004의 런타임 열거(통지 대기열, 검증기, 진단, 진입 깊이와 예산, `nodeFactory`, `onError` 보고기)는 닫힌 목록이 아니며, 칸을 더할 때는 NODE-045대로 `record/`의 선언을 고치고 그 대가를 레코드 `DETAIL.md`에 적는다." (`reviews/round-26-closing.md:67`)
  > 편집자 결정(26C-06): "【추론】 진입 깊이와 예산 가운데 중첩 진입의 칸은 그 기제를 들여오는 PR-4가 더하고(26C-01, TEST-069), 런타임은 루트 참조를 따로 들지 않는다(레코드 필드로 닿는다)." (`reviews/round-26-closing.md:69`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:969-978`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-35)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:980-982`

### NODE-046 레코드 형 → 공개 판별 합집합은 단언 없이 선언 자리에서 — `SchemaNodeRecord<Self>`, 제네릭 탐색, `this: AnyNode`, 종류별 생성 표, overload

- 결정:
  > 【추론】 레코드 형에서 공개 판별 합집합으로의 변환에 형 단언을 쓰지 않는다.
  > 【추론】 형은 선언 자리에서 맞춘다.
  > 【추론】 `record/`의 `SchemaNodeRecord`는 자기 형을 매개변수로 받고(`SchemaNodeRecord<Self>`), `navigation/`의 `find`·`findNodes`는 `Self`에 대해 제네릭이다.
  > 【추론】 클래스 `SchemaNode`는 종류 매개변수 `T`를 갖고 `type`·`value` 게터를 `T`로 좁힌다.
  > 【추론】 `parent`·`structure`는 종류별 인스턴스 형의 합집합(`AnyNode`)으로 선언해 `SchemaNodeRecord<AnyNode>`를 구현한다.
  > 【추론】 그래서 종류별 인스턴스 형이 공개 합집합의 구성원에 구조적으로 대입된다.
  > 【추론】 레코드를 넘겨받는 공개 메서드는 `this: AnyNode` 매개변수로 선언한다.
  > 【추론】 생성은 종류별 생성 표가 `AnyNode`를 돌려준다.
  > 【추론】 `InferSchemaNode<Schema>`로의 좁힘은 overload 선언으로 한다.
- 보충:
  > 소유자(146라운드, isTerminal 콜백 계약 변경(#14)): "계약 변경 받음 (Recommended)" (`reviews/round-146-owner-answers.md:8`) — nodeFromJSONSchema의 isTerminal 선언을 실제 전달 대상에 맞춰 단언을 없앤다; 공개 루트 밖의 core 계약(원장 관리자, 2026-10-11).
  > 소유자(150라운드, 형 추론의 우선순위(원칙)): "외부 사용자의 경우 form에 주입한 값이나 jsonSchema, handler등을 통해서 다양한 타입 추론이 가능하면 정확하게 이루어졌으면 좋겠어." (`reviews/round-150-owner-answers.md:7`) — 외부 사용자의 추론(defaultValue·핸들러·ref·제네릭 주입)은 정확하게, 스키마 기반 추론은 모호해도 되며, 패키지 내부는 이유가 적힌 형 단언으로 안전성을 보장해도 된다; 옛 구조의 형 추론은 07b의 공개 형 추론 감사에서 참고한다(원장 관리자, 2026-10-11).
  > 편집자 결정(153C-01): "【추론】 가드는 단언을 없애려고 넣은 실행 코드이므로 그 값은 134C-01의 번들 판정으로만 가려야 했고, 다섯 부분이 모두 채택이며 강제 GC 열에 표시조차 없으니 150라운드 (3)의 "건별로 가드 유지 또는 단언으로 되돌림"에서 되돌릴 건은 하나도 없다. 기록 열의 0 아래 구간 하나는 크기가 측정 분해능 수준(−0.003 ms)이고 방향이 이득 쪽이라 판정에 쓰지 않는다(145C-01: 기록 열은 비교 열). #12를 "잔존"이 아니라 "이유 적힌 단언"으로 세는 것은 146라운드 소유자 답("지금 자리에 이유와 함께 남김")이 #3·#7과 같은 종류의 처분이기 때문이며, 셈을 11+3으로 적어야 07의 원장 근거와 숫자가 맞는다. G27의 닫힘을 verify 뒤로 미루는 것은 139C 이후 모든 게이트가 새 문맥 verify를 요구해 온 관행이다." (`reviews/round-153-closing.md:9`)
  > 편집자 결정(158C-01): "【추론】 첫 verify 실패는 증거의 범위 문제였고 재확인이 같은 HEAD에서 통과했으므로 G27의 닫힘 조건(153C-01 (3))은 충족된다. codex 쪽 fractal_inspect의 indeterminate는 다른 facts 저장소를 읽은 환경 차이이고 같은 HEAD의 주 세션 결과가 ok이므로 판정을 가르지 않지만, 두 결과가 다르게 나온 사실 자체는 숨기지 않고 적는다. 비차단 넷 가운데 코드나 시험을 건드리는 셋을 07에서 고치면 facts·번들·시험 증거가 다시 낡아 verify를 되풀이해야 하므로, 07b로 넘기는 것이 비용에 맞다; N5는 보고서 글자라 어느 증거도 낡게 하지 않는다. G23은 소유자가 142라운드에서 "후순위로 내가 따로 지시하겠다"고 했으므로 묻지 않고 기다린다." (`reviews/round-158-closing.md:9`)
  > 소유자(190라운드, 제한된 `as unknown as` 허용, 한 줄 정리): "이거 말이야. … 이렇게 하지 않은 이유가 있어? 불필요하게 두줄을 쓴거같은데.\n필요하면 제한적인 범위 내에서 unkown 을 써도 돼. 남용하는게 싫은거지 적절하게 쓰는거면 문제없어." / "그래 리뷰어한테 전해줘. 한 줄로 정리하라고." (`reviews/round-190-owner-answers.md:7`) — 150라운드 원칙 3의 예외: 공개 형이 readonly를 허용하지 않는 동결 상수처럼 제한된 자리의 `as unknown as T`는 이유를 적고 허용; EMPTY_CHILDREN은 한 줄로(원장 관리자, 2026-10-13).
  > 소유자(193라운드, 주석 고침, core·SchemaNode 위계 재고찰, 현 구조 불수용): "가도 되는데, core 와 schemaNode 의 관계, 그리고 위계에 대해서 충분히 고찰을 하고 고치도록 해. filid 구조검사만으론 통과가 가능할 수도 있는데, 난 지금 구조는 용납하지 않아" (`reviews/round-193-owner-answers.md:7`) — SchemaNode 클래스의 inheritDoc 주석은 reviewer 2라운드에서 직접 문장으로; src/core의 평평한 구조는 소유자가 받아들이지 않으므로 core와 SchemaNode의 관계·위계를 고찰한 문서를 먼저 쓰고 07 머지 뒤 재배치(개선-38)(원장 관리자, 2026-10-13).
  > 편집자 결정(206C-01): "【추론】 소비자 증거가 "겉면이 엔진의 유일한 출구"를 보여 주니 트리가 그 관계를 말하게 하는 것이 목표이고, C는 그것을 가장 적은 이동(진입점 하나와 이름표 67개)으로 이룬다. B는 겉면 루트를 비대하게 하고 D는 묶음 사이 상호 의존을 만든다." (`reviews/round-206-closing.md:9`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1005-1013`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-37)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1015-1017`

### NODE-047 행이 하나인 종류의 전략은 그 행에서 정한다 — 잎은 `terminal`, 가상은 `branch`, 다른 `options.terminal`은 청사진 오류

- 결정:
  > 【추론】 `BEHAVIORS[type]`의 행이 하나인 종류는 전략을 그 행에서 정하고 렌더 계층 판정을 묻지 않는다.
  > 【추론】 잎(string·number·boolean·null과 18C-02의 (가칭) `union`)은 `terminal`, 가상은 `branch`다.
  > 【추론】 그래서 가상에 둔 인라인 `presentation.FormTypeInput`은 그 입력으로 그려지되 전략은 `branch`이고, 입력은 참조 노드의 `ChildNodeComponents`를 받는다(쓰지 않아도 된다).
  > 【추론】 가상은 `branch`이므로 ERROR-185의 경고(터미널 노드의 입력이 빈 `ChildNodeComponents`를 읽을 때의 개발 모드 경고)는 가상 노드에 적용되지 않는다.
  > 【추론】 행이 하나인 종류에 그 행과 다른 `options.terminal`을 적으면 청사진 오류다(잎의 `false`, 가상의 `true`).
  > 【추론】 같은 값(잎의 `true`, 가상의 `false`)은 오류가 아니다.
  > 【추론】 `options.terminal`의 양방향(NODE-030)과 NODE-028의 판정 순서는 두 행을 가진 종류(object·array)에만 뜻이 있다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1029-1035`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-38)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1040-1047`

### NODE-048 `ContextNode`를 두지 않는다 — 맥락은 루트가 드는 폼 입력이며 `@`는 노드 경로가 아니다

- 결정:
  > 【추론】 `ContextNode`는 두지 않는다.
  > 【추론】 08 §4 노드 종류 표에 행을 더하지 않는다.
  > 【추론】 맥락은 노드가 아니라 루트가 드는 폼 입력(18C-13 (8))이다.
  > 【추론】 따라서 맥락에 `isObjectNode`가 참이 되는 일이 사라진다.
  > 【추론】 `find('@')`·`findAll('@')`의 특수 처리도 사라진다.
  > 【추론】 `@`는 식 토큰일 뿐 노드 경로가 아니다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1253-1258`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-45)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1264-1268`

### NODE-049 문서 주석의 정본은 선언한 인터페이스 — 공개 멤버 `SchemaNode/type.ts`, 레코드 필드 `SchemaNodeRecord`, 클래스는 `{@inheritDoc}`

- 결정:
  > 【추론】 정본 문서 주석은 그 멤버를 선언한 인터페이스에 둔다.
  > 【추론】 공개 멤버는 `SchemaNode/type.ts`, 레코드 필드는 `record/`의 `SchemaNodeRecord`다.
  > 【추론】 클래스는 `/** {@inheritDoc <인터페이스>.<멤버>} */`로 가리킨다.
  > 【추론】 정본 주석은 매개변수, 결과, 목적, 실패 조건, 부수 효과를 모두 적는다.
  > 【추론】 클래스 쪽의 한 줄 `{@inheritDoc}`로 저장소 주석 규칙 §4("Every declaration the form reaches carries one")를 충족한 것으로 본다.
  > 【추론】 클래스 쪽에 같은 설명을 다시 적지 않는다.
  > 【추론】 관례는 `SchemaNode/DETAIL.md`에 적는다.
  > 【추론】 결과로 겉면 파일은 250–350줄 쪽이 된다.
- 보충:
  > 편집자 결정(346C-06): "【추론】 정본 문서 주석은 그대로 선언한 인터페이스(공개 멤버 `NodeSurface`, 레코드 필드 `FieldNodeRecord`)에 두되, 클래스 쪽의 `{@inheritDoc}` 한 줄은 두지 않는다. 클래스 멤버는 레코드 문서를 상속하거나(32개) 정본 첫 문장을 옮긴 한 줄 요약을 지닌다(22개). 관례는 surface DETAIL에 적는다. NODE-049의 셋째·다섯째 문장(클래스는 `{@inheritDoc}`로 가리킨다, 한 줄 `{@inheritDoc}`로 주석 규칙 §4를 충족한 것으로 본다)은 이 결정으로 물러난다." (`reviews/round-346-closing.md:18`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1274-1281`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-46)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1283-1285`

### NODE-050 내부 통로는 바인딩 전용 — core만 쓰는 호스트에 열지 않으며, 공개 core 진입점이 생기면 계약 변경

- 결정:
  > 【추론】 열지 않는다.
  > 【추론】 내부 통로는 NODE-010대로 바인딩 전용이다.
  > 【추론】 `SchemaNode/` 진입점이 이름으로 내보내고, `core/index.ts`가 다시 내보내며, `src/index.ts`에는 없다.
  > 【추론】 패키지의 공개 진입점은 `.` 하나뿐이고 트리를 직접 만드는 공개 경로가 없다.
  > 【추론】 `nodeFromJSONSchema`는 `src/index.ts`가 내보내지 않는다(`src/index.ts:33-54`, `src/core/index.ts:1`).
  > 【추론】 그러니 공개 호스트는 모두 바인딩을 거치며, 통로를 열면 소비자 없는 공개 계약이 생긴다.
  > 【추론】 core만 쓰는 호스트(예: 코어 시나리오 러너)는 포커스 개념이 없다.
  > 【추론】 자른 값이 필요하면 `setValue`로 쓴다.
  > 【추론】 뒤에 공개 core 진입점(하위 경로 수출)을 두게 되면, 그때 통로를 그 진입점의 계약으로 이름 붙여 여는 것이 계약 변경이다.
- 보충:
  > 편집자 결정(18C-48, 물음의 제목): "내부 통로를 core만 쓰는 호스트에 열지" (`reviews/round-18-closing.md:1308`)
  > 편집자 결정(18C-48, 닫는 항목): "NODE-019(내부 통로)" (`reviews/round-18-closing.md:1310`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1312-1320`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-48)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1322-1322`

### NODE-051 배열 통째 쓰기는 위치로 재조정한다 — 키를 잇고, 로드 아닌 통째 쓰기는 뒤쪽 새 키만 생김

- 결정:
  > 【추론】 ㄱ 통째 쓰기의 identity는 위치로 재조정한다.
  > 【추론】 대상은 branch array에 값을 통째로 쓰는 모든 쓰기다: 로드(`setValue(V)`·`reset`·마운트), `Merge`가 통째로 준 배열, 입력 쓰기, `controls.injectTo`·`controls.derived`의 대상이 된 배열.
  > 【추론】 이런 쓰기는 아이템 노드를 다시 만들지 않고 위치로 잇는다.
  > 【추론】 새 값의 i번째 아이템은 쓰기 시점 identity 목록의 i번째 노드와 그 키(`#n`)를 이어 받고, 그 노드의 원본을 새 값으로 쓴다.
  > 【추론】 새 값이 더 길면 뒤의 아이템은 새 키로 생긴다.
  > 【추론】 더 짧으면 남는 노드는 소멸한다(WRITE-036: 나감이 아니다).
  > 【추론】 키를 바꾸는 것은 구조 연산(`push`·`remove`·`insert`류)뿐이다.
  > 【추론】 생김의 판정은 identity와 따로이며, 쓰기 종류의 기존 규칙을 따른다.
  > 【추론】 로드는 형상의 모든 노드를 생긴 노드로 친다(SETTLE-027).
  > 【추론】 로드가 아닌 통째 쓰기(`Merge`의 배열, 입력 쓰기 등)에서는 직전 커밋의 형상에 없던 키만 생긴 노드로서 채움을 받는다.
  > 【추론】 곧 새로 만든 뒤쪽 아이템이다.
  > 【추론】 이것이 WRITE-015 `Merge` 행이 미룬 "어떤 아이템이 생긴 것인가"의 답이다.
  > 【추론】 통째 쓰기 뒤에는 `dirty`·`touched`, 바깥 오류, 가상화 기록, 컨테이너 입력의 비값 상태, 소비자가 든 노드 참조가 데이터가 아니라 위치를 따라간다.
  > 【추론】 입력의 초기화는 identity가 아니라 Refresh 규칙이 맡는다.
  > 【추론】 로드는 모든 노드에 Refresh를 내므로(REACT-019·WRITE-048) 잎 입력은 어차피 다시 마운트된다.
  > 【추론】 그래서 포커스를 지키는 이득(T-22)은 로드가 아닌 통째 쓰기에만 있다.
- 보충:
  > 편집자 결정(35C-02): "【추론】 구조 연산으로 아이템이 재인덱싱되면 PR-5가 그 아이템과 자손의 레코드 칸(이름·이스케이프한 이름·경로)을 고치고 `(previous, current)` 쌍을 레코드 수준의 사실로 남긴다; 그것을 `UpdatePath` 비트의 배달(EVENT-068의 payload `{ previous, current }`, 자손 포함)로 바꾸는 것은 디스패처(PR-4)의 일이라 33C-01대로 뒤에 머지하는 단계가 잇는다." (`reviews/round-35-closing.md:17`)
  > 편집자 결정(35C-03): "【추론】 SURFACE-005가 배열 쓰기를 다섯(`push`·`pop`·`update`·`remove`·`clear`)으로 닫았고, 원장의 "삽입"은 모두 "`push(v)`·삽입"(WRITE-085, WRITE-099) 또는 "`push`·`remove`·`insert`류"(NODE-051)로 연산 부류를 이름한 것이라 공개 동사도 내부 연산도 아니다; 06은 삽입을 만들지 않고, WRITE-099의 스냅숏 게이트는 `push('x')`로 충족하며 삽입 쪽은 동사가 없어 해당 없음으로 적는다. 삽입 동사가 필요해지면 SURFACE 라운드다." (`reviews/round-35-closing.md:25`)
  > 편집자 결정(41C-01): "【추론】 노드는 생성 때 고른 행 하나를 `behavior`로 들고(NODE-002) `schemaType`은 선언에서 한 번 계산되므로(NODE-057) 다른 템플릿의 자리로 옮겨 쓸 수 없다; NODE-052는 밀림을 "값은 그 자리에 청사진이 있는지에 따라 노드와 `extras` 사이를 옮긴다"로 적고 `remove(0)` 뒤 `c`가 1번 자리에서 노드가 되는 예를 들었으므로, 같은 원리로 템플릿이 있는 두 자리 사이의 밀림에서도 노드는 옛 자리와 새 자리의 템플릿(같은 선언 객체 — `items` 또는 같은 `prefixItems[i]`; 스키마의 구조적 같음이 아니다)이 같을 때만 키 `#n`과 함께 재사용하고, 다르면 값(그 자리의 원본 트리)이 새 자리 템플릿의 새 노드의 생김 입력이 되어 새 키로 생기며 없음인 자손에만 채움이 가고(35C-10, WRITE-007), 옛 노드는 소멸한다(WRITE-036)." (`reviews/round-41-closing.md:9`)
  > 편집자 결정(41C-01): "【추론】 템플릿이 하나인 보통의 배열(`items`만)에서는 신원이 늘 값을 따라가며, 이것이 NODE-051의 "키를 바꾸는 것은 구조 연산(`push`·`remove`·`insert`류)뿐이다"가 뜻하는 것이다." (`reviews/round-41-closing.md:10`)
  > 편집자 결정(62C-01): "【추론】 (가)는 EVENT-013("fn이 끝날 때 정착 한 번·파동 한 번")과 EVENT-061("정착 때 실행하지 않는다")에 어긋난다 — 배치 안에서 정착을 당기는 유일한 길은 로드(EVENT-015 "`batch(fn)` 안의 reset은 곧바로 정착한다", 로드는 새 수명)이고 배열 동사는 로드가 아니다; (나)는 표시의 순서를 뒤집고, (다)는 GOAL-058을 깬다. 배치 끝의 정착에서 호스트의 표시는 통째 쓰기 하나이므로 NODE-051대로 아이템 identity는 위치로 재조정되고 뒤쪽 새 자리만 새 키를 받는다; 그래서 `remove(0)`·`update`를 배치로 묶으면 남은 아이템의 키가 순차 호출(아이템 노드가 키를 지닌 채 자리만 옮김)과 다를 수 있다. 이것은 GOAL-010("`batch`는 쓰기 하나로 센다")의 귀결이고 결함이 아니며, EVENT-061이 정한 `batch` 문서 주석의 끝에 "배열 동사(`push`·`pop`·`update`·`remove`·`clear`)도 부른 자리에서 앞선 표시를 얹은 배열로 계산해 동기 결과를 돌려주고 결과 배열을 표시하며, 배치 끝의 정착은 통째 쓰기라 아이템 키는 위치로 잇는다"를 더한다. 06은 다섯 진입 파일의 `batch` 분기를 이렇게 만들고 `dispatch`의 DETAIL에 적으며, 33C-01이 미룬 시험(배치 안 배열 동사의 `onChange` 한 번, EVENT-035)을 이제 단언한다." (`reviews/round-62-closing.md:11`)
  > 편집자 결정(194C-01): "【추론】 G2는 verifier가 한 번 FAIL을 내고 고친 뒤 PASS라 보고의 신뢰도가 높고, 62C-01 해석은 원장 본문과 일치한다. 감싸개는 플러그인의 판정을 바꾸지 않고 계수만 더하니 스토리 기반으로 적절하다." (`reviews/round-194-closing.md:9`)
  > 편집자 결정(394C-01): "【추론】 (1) 떠나는 후보는 상속 범위 안에서 "그 후보가 닿거나 어느 후보도 닿지 않는 (경로, 토큰)"만 지우고, 다른 살아 있거나 남은 형제 후보가 닿는 공유 열쇠는 남긴다. 어느 후보도 닿지 않는 낡은 열쇠는 호스트 종류·나감 정책·메타데이터와 무관하게 지운다(disableAutomaticWrites 객체 이탈만 예외, 394C-02). 독립적으로 나가는 중첩 후보는 둘러싼 모든 후보 자리의 제한을 합성해 같은 선택자를 쓴다. 정책 상속은 공유 조상의 메타데이터(명시 보존 포함)를 읽되 실제 삭제는 소유 선택자를 거친다(WRITE-034). (2) 자리 이동과 레코드 재생성을 가른다: 원천 자리가 살아 남아 위치만 옮겨 가면 모든 후보의 열쇠가 함께 옮겨 가고(NODE-051, 41C-01의 "그 자리의 값"은 종류별 원천을 포함), 자리가 진짜로 사라질 때만 전부 지운다(WRITE-036). 재키가 처리한 생존 목적지는 최종 정리가 다시 지우지 않고, 실제로 나가는 노드의 misfit만 정리한다. (3) 재생되는 자리는 모든 깊이에서 하나의 규칙을 따른다: 자기 종류의 (경로, 토큰) 저장 원천이 정확히 있을 때만 그것을 쓰고 없으면 base와 같은 합성 입력이며, 자기 원천 복원은 자식·extras의 일반 분배를 대체하지 않고 합치고, terminal 도착은 완전한 공개 값만 받는다. 다른 종류의 살아 있던 값은 자기 토큰의 잠복으로 남는다. (4) 도달 질의는 한 질의 안에서만 사는 (템플릿, 깊이) 실패 집합으로 같은 상태를 한 번만 탐색한다 — 질의 사이에 남는 것이 없어 370라운드의 캐시 금지에 해당하지 않는다. 단일 후보 그래프는 선택자 빠른 반환과 base의 목적지 등록을 그대로 두어 동작·할당이 같다." (`reviews/round-394-closing.md:8`)
  > 편집자 결정(395C-01): "【추론】 R1(a·b·c): 구조 이동이나 보존하는 호스트 이탈이 남기는 모든 자리는 파괴적 주소·저장 변경 전에 모든 깊이의 살아 있는·이미 잠복인 후보 원천을 포착하고, 같은 정착의 이후 모든 단계에서 (경로, 토큰) 정체와 메타데이터를 보존하며, 합성 입력보다 정확한 원천을 먼저 재생한다(NODE-051, 41C-01). 보호 여부는 직계 후보 수가 아니라 후보를 포함한 하위 트리로 정하고, 템플릿 없는 도착 예외는 후보가 있는 이동의 원본 포착에만 적용해 후보 없는·단일 종류 자리는 base의 조기 종료와 목적지 등록을 그대로 둔다. R2(d): 후보 이탈은 자동 쓰기 억제와 무관하게 상속 소유 범위 안의 공유되지 않은 도달 불가 낡은 열쇠를 지우되 억제된 정책 쓰기는 켜지 않는다(WRITE-015·034). 이 정리는 후보 소유 범위 안의 이탈에만 하고 같은 포착이 돌려준 소유 판정을 같은 이탈 결정 안에서 인자로만 넘겨 재사용한다 — 모듈·런타임·노드 어디에도 저장하지 않으므로 370라운드의 캐시 금지에 해당하지 않는다. 자연 경로는 찾지 못해 합성 재현이다. R3(e): 종류가 둘 이상인 배열 경로의 형상 밖 쓰기는 쓰는 순간 선언된 원천을 재귀적으로 청사진 전순서의 첫 종류에 묶고 그 주소의 다른 종류 원천을 지우며 길이와 미선언 꼬리는 보존하고 재진입 때 주인을 다시 바꾸지 않는다 — 객체의 형상 밖 쓰기 규칙(26C-13·14, WRITE-087)과 같아진다. 35C-10("비활성 배열 호스트의 잠복 원본은 배열 전체를 호스트 자신의 얼린 raw 하나로 보관")은 뒤집지 않고 좁힌다: 후보가 있는 배열 경로의 새 형상 밖 쓰기만 제외하고, 이탈 포착과 후보 없는·단일 종류 배열은 그대로다. 결정 62는 이 수정으로 (가) "현행 규칙 유지, 배열을 객체와 같게"로 잠정 닫으며 소유자 확정을 기다린다." (`reviews/round-395-closing.md:8`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1638-1653`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-59)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1686-1690`
- 충돌:
  > `reviews/round-18-closing.md:1639`의 "로드(`setValue(V)`·`reset`·마운트)"는 소유자 답과 다르다: `setValue(V)`는 로드가 아니라 전체 교체 쓰기이고, 로드는 마운트·`FormHandle.reset()`·`resetSubtree()`뿐이다(WRITE-090). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:26`).

### NODE-052 튜플 — 자리별 청사진, 청사진 없는 자리는 `extras`, 구조 연산은 자리 기준, 조각의 `items`·`prefixItems`는 덧씌움

- 결정:
  > 【추론】 ㄹ 튜플에서 자리 i의 아이템 청사진은 두 경우로 나뉜다.
  > 【추론】 i가 `prefixItems` 길이보다 작으면 `prefixItems[i]`다.
  > 【추론】 아니면 `items`가 스키마일 때 `items`이고, 옛 철자 `items: [..]`이면 `additionalItems`다.
  > 【추론】 자식 집합은 값의 길이 × 자리별 청사진이다(NODE-021).
  > 【추론】 청사진이 없는 자리의 아이템은 노드를 만들지 않는다.
  > 【추론】 닫힌 튜플의 뒤와 `items`가 없거나 `false`인 자리가 여기에 든다.
  > 【추론】 배열 호스트의 `extras`는 아이템 청사진이 없는 자리의 값이다.
  > 【추론】 자리 순서로 들고, 선언된 아이템 뒤에 방출한다(VALUE-002 보충).
  > 【추론】 버리지도 막지도 않는다.
  > 【추론】 판정은 검증기가 하고, 표시는 잔여 키처럼 렌더 계층이 맡는다.
  > 【추론】 `push`·`pop`·`remove`·`update`는 자리를 기준으로 동작한다.
  > 【추론】 자리가 바뀌면 값은 그 자리에 청사진이 있는지에 따라 노드와 `extras` 사이를 옮긴다.
  > 【추론】 예: `prefixItems` 둘, `items: false`, 값 `[a,b,c,d]`에서 `remove(0)`을 하면 `c`는 1번 자리로 옮겨 노드가 된다.
  > 【추론】 청사진 없는 자리에 대한 `push`도 core가 막지 않는다(WRITE-022).
  > 【추론】 호스트 배열의 조각이 준 `items`·`prefixItems`는 그 자리의 유효 스키마에 드는 덧씌움이다.
  > 【추론】 병합표는 객체와 같다.
  > 【추론】 조각은 아이템이 형상에 드는지를 정하지 않는다.
  > 【추론】 자리는 이름이 아니므로 빼면 뒤 자리가 밀리기 때문이다.
  > 【추론】 오늘 `ArrayNode/validate.ts`의 청사진 오류(아이템 청사진이 한 자리도 없는 배열 등)는 그대로 둔다.
- 보충:
  > 편집자 결정(36C-02): "【추론】 NODE-052는 자리 i의 청사진을 `prefixItems[i]`, 아니면 스키마인 `items`, 옛 철자 `items: [..]`이면 `additionalItems`로 정했는데 02 청사진은 `items: [..]`를 튜플로 컴파일하되 `additionalItems`를 컴파일하지 않으므로, 그 꼬리 자리의 아이템 템플릿 컴파일은 PR-5가 청사진에 더한다(아이템은 PR-5의 기제다, TEST-069 (라); LANDING-085가 `resolveArrayLimits`의 청사진 이동을 PR-5에 둔 것과 같은 결의 변경); 청사진 fractal의 DETAIL을 먼저 고치고 02의 기존 시험은 바꾸지 않는다." (`reviews/round-36-closing.md:17`)
  > 편집자 결정(36C-02): "【추론】 컴파일하는 것은 `additionalItems`가 스키마 객체일 때뿐이다: `false`·불리언 `true`·없음은 NODE-052대로 "청사진이 없는 자리"라 노드를 만들지 않고 값은 호스트 `extras`로 가며 버리지도 막지도 않는다; 꼬리가 닫혔는지의 판정(`false`)과 열린 꼬리의 허용(`true`·없음)은 검증기의 몫이고 형상은 둘을 가르지 않는다. 새 철자 `items`가 스키마이고 `prefixItems`가 있을 때의 꼬리는 이미 `items`다." (`reviews/round-36-closing.md:18`)
  > 편집자 결정(41C-01): "【추론】 노드는 생성 때 고른 행 하나를 `behavior`로 들고(NODE-002) `schemaType`은 선언에서 한 번 계산되므로(NODE-057) 다른 템플릿의 자리로 옮겨 쓸 수 없다; NODE-052는 밀림을 "값은 그 자리에 청사진이 있는지에 따라 노드와 `extras` 사이를 옮긴다"로 적고 `remove(0)` 뒤 `c`가 1번 자리에서 노드가 되는 예를 들었으므로, 같은 원리로 템플릿이 있는 두 자리 사이의 밀림에서도 노드는 옛 자리와 새 자리의 템플릿(같은 선언 객체 — `items` 또는 같은 `prefixItems[i]`; 스키마의 구조적 같음이 아니다)이 같을 때만 키 `#n`과 함께 재사용하고, 다르면 값(그 자리의 원본 트리)이 새 자리 템플릿의 새 노드의 생김 입력이 되어 새 키로 생기며 없음인 자손에만 채움이 가고(35C-10, WRITE-007), 옛 노드는 소멸한다(WRITE-036)." (`reviews/round-41-closing.md:9`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1662-1680`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-59)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1686-1690`

### NODE-053 아이템 노드는 모두 실체화한다 — 지연 실체화는 PR-5 벤치 게이트

- 결정:
  > ㅁ 아이템 노드는 생길 때 모두 실체화한다(기본).
  > PR-5 시험(TEST-018)에 위치 재조정(키 유지와, 위치를 따라가는 `dirty`·`touched`·바깥 오류·가상화 기록·노드 참조), 청사진 없는 자리의 `extras` 보존, 구조 연산에서 값이 노드와 `extras` 사이를 옮기는 것을 더한다.
  > PR: PR-5 벤치(ㅁ).
  > 무엇: TEST-032의 "긴 배열(아이템 10,000개) 안의 키 입력", "array 1000 루트 통째 쓰기", "노드당 메모리"를 TEST-027 게이트로 옛 판과 견준다.
  > 통과: 옛 판보다 느리지 않거나, 느린 항목을 Vincent가 받아들인다.
  > 실패: 지연 실체화를 넣는다.
  > 실패: 단, 관찰 결과가 실체화 판과 같음을 PR-5 시험을 두 모드로 돌려 보인 경우에만 넣는다.
  > 같아야 하는 것: `value`·`outputValue`·`inactiveValues`·채움·에지 발화·검증 결과 라우팅·통지·`revision`, 그리고 `find`에 관찰 가능한 부수효과가 없음.
  > 실패: 같게 만들 수 없으면 소유자에게 올린다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1681-1682,1692-1698`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-59)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1686-1690`

### NODE-054 `find`는 마디마다 자식 집합을 이름으로 따라간다 — 참조 그룹 아래 경로는 참조된 노드 자체, 정본 경로는 `node.path`

- 결정:
  > 【추론】 `find`는 경로의 마디마다 현재 노드의 자식 집합을 이름으로 따라간다.
  > 【추론】 노드 종류마다 특수 경로를 두지 않는다.
  > 【추론】 참조 그룹(가상 노드)의 자식 집합은 참조된 형제 노드다.
  > 【추론】 그래서 `find('/period/startDate')`는 `/startDate` 노드 그 자체를 돌려준다.
  > 【추론】 돌려준 노드의 `path`는 `/startDate`다.
  > 【추론】 그 노드에 한 쓰기는 가상 노드가 나눠 쓰는 것과 같은 곳에 닿는다.
  > 【추론】 한 노드에 두 경로로 닿는 것은 참조 그룹을 거칠 때뿐이다.
  > 【추론】 정본 경로는 `node.path`다(문서화).
  > 【추론】 터미널 노드는 자식 집합이 없으므로, 같은 규칙으로 노드 없음이다(NODE-020과 일치).
  > 【추론】 가상 노드는 늘 `branch`이므로(18C-38) 인라인 `FormTypeInput`을 둔 가상 노드 아래 경로도 참조된 노드를 돌려준다.
  > 【추론】 `options.terminal: true`를 둔 가상 노드는 청사진 오류이므로(18C-38) 터미널 가상 노드는 없다.
  > 【추론】 인라인 입력 없는 가상 노드 아래의 `find`는 오늘과 같아 이주 행이 없다.
- 보충:
  > 편집자 결정(42C-02): "【추론】 읽기 쪽: NODE-034·NODE-054대로 가상 노드의 자식 집합은 참조된 형제 노드 그 자체라 `structure`는 `fields`의 이름마다 부모의 실제 형제 노드를 가리키고, 자식 선택은 가상 노드 아래에 노드를 만들지 않는다(가상 행의 `declareChildren`은 만들 선언을 돌려주지 않고 참조만 맺는다); `find('/period/startDate')`는 `/startDate` 노드 자체를 돌려주며 그 `path`는 `/startDate`다. 가상 노드의 값은 행의 `assemble` 칸이 참조 노드 값의 튜플을 `local`에 둔 것이므로 로드 뒤 `['2021-04-01', '2021-04-02']`이고, `undefined` 쓰기 뒤 `[undefined, undefined]`다." (`reviews/round-42-closing.md:19`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1897-1908`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-68)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1911-1914`

### NODE-055 노드 구조 벤치 B1–B6의 합격선 — PR-2에서 V8과 JavaScriptCore로, B1·B5·B6은 `guard:check`의 선 안, B2는 추정의 1.5배 이내이며 오늘보다 크지 않음, B3은 같은 맵, B4는 보고만

- 결정:
  > 【추론】 NODE-018(현행)이 B1–B6을 기준선과 비교한다고 적으나 합격선이 없으므로 여기서 둔다.
  > 【추론】 PR-2에서 B1–B6을 V8(node)과 JavaScriptCore(bun, 또는 `benchmark-form/browser-bench`의 Safari)에서 돌린다.
  > 【추론】 B1·B5·B6의 합격선은 18C-27의 선(`guard:check`) 안이다.
  > 【추론】 B2의 합격선은 NODE-018의 추정(110–140바이트, 포인터 압축 엔진)의 1.5배 이내이고, 같은 엔진에서 잰 오늘 노드 인스턴스와 부속 객체의 합을 나란히 적어 그보다 크지 않은 것이다.
  > 【추론】 B3의 합격선은 같은 맵이 참인 것이다.
  > 【추론】 B4는 보고만 한다.
  > 【추론】 합격선을 넘으면 TEST-027의 절차(이유를 적고 Vincent가 받아들임)로 올린다.
  > PR: PR-2.
  > 통과: 위 합격선 안이다.
  > 실패: TEST-027의 절차(18C-26의 기록·수용 규칙)로 올린다.
- 보충:
  > 편집자 결정(400C-01): "【추론】 터미널 모드(options.terminal)는 느리지 않다: 객체 1000키 마운트 Node −90%·Bun −64%, 배열 8천 마운트 거의 0으로 0.16.1보다 빠르다. 느린 것은 표시 없이 하위 선언이 없는 호스트(자식 0개 브랜치)이며 원인은 모든 키가 선언 밖 값이 되어 키마다 복사(계측 비율 37%)와 재조립(47%)되는 것이다. 0.16.1은 items 없는 배열 스키마를 거부하므로 그 모양의 옛 판 수치는 없다. 결함 수정 셋(F2·F3·394C-02)은 배열 동사 비용을 바꾸지 않았다(수정 전 대비 모든 행 −7%~+6%). 다음 구현 묶음 L3의 수용 가설은 다섯이고 각각 지우는 비효율 하나를 이름 지었다(370라운드): (a) 선언 밖 키마다 defineProperty를 일반 대입으로(writeObjectKey, __proto__ 보호는 코드에만 있으므로 그 불변을 시험으로 고정하고 원장 보충으로 적음); (b) items 없는 배열의 push·insert(N) 지름길 — 선언 밖 값뿐인 배열의 덧붙임이 모든 칸을 걷는 O(N) 접두 증명·재사용 검사를 없앰(자격 배제 목록 그대로, prefixItems 튜플 뒤 꼬리 제외, 새 빈 children 참조·UpdateChildren·revision 유지, 전체 배달 비교); (c) nextExtras 끝의 sameValue가 markWrite의 비교와 중복인 두 번 비교 제거(Merge 길 동일성 확인이 선행 조건); (d) 이미 해석된 자식에 staticSpec을 다시 조회하지 않고 넘김(all-keys 격차의 2.75%); (e) 게이트 조각이 있는 폼의 평상시 쓰기가 나감 정책 의존 판정마다 조각별 전체 통제 층을 만든 뒤 소유 하나를 찾는 것을 직접 소유 판정으로(조각 수에 초선형, F=64에서 Node 3.38→1.05 ms·Bun 16.6→1.36 ms, 72장면·323단계 차등 0, 정책 평가·층 순서 불변, 캐시 없음; 결정 58의 입구 수치 3.38 ms 중 2.34 ms). 가설마다 커밋 하나, PR 하나(대기열 56), 검증은 agy high(397라운드). 증명 먼저 후보(비효율로 이름 짓기 전 증명 필요, 지금 쪼개지 않음): all-keys 격차 중 DETAIL 설계 기록만 근거인 알고리즘 몫(커밋 후보 루프, 커밋마다 RevisionLedger 생성, dirty 색인 반복), (c) 다섯(없는 misfit 경로 삭제, 빈 commitGlobalState 방문, hasDistributedChildInput 재검사, effectiveType 재검사, keepsHostKeys 훑기), 빈 상호작용 상태 공유(노드당 56 B, 정체성 비교·제자리 변경 부재 증명 선행). 수용 후보(M3 때 현재 수치로 소유자 수용 목록): all-keys 격차 중 원장 계약 몫(SETTLE-001·002·003, 노드별 revision·EVENT 배달), 선언 밖 값의 불변 사본·순서 보관이 요구하는 키 수 비례 복사·재조립(VALUE-002, SETTLE-042·043), 터미널 객체 한 키 변경의 첫 다른 키 위치 비례 비교(두 판 같은 방향), 노드 레코드 376 B(NODE-018 추정 210~260 B 초과, NODE-055 판정은 하지 않음), 청사진 스키마 노드당 약 1,820~1,830 B와 폼 하나 기준 트리+청사진 메모리 0.16.1 대비 약 5분의 1 증가(398라운드 소유자 판단으로 청사진 공유는 지금 하지 않음). 폐기: 선언 밖 값 입력 재사용(Merge에서 이전 값 상실, 호출자 객체 변조가 폼 값에 전파, 396라운드 예측 가능성 원칙 위반). 기록만: items 없는 배열 remove(0)의 extras 인식 splice(범위 밖), 빈 배열→빈 배열의 새 children 참조와 UpdateChildren(원장 요구인지 부산물인지 미확인, 지름길은 보존), 빈 구조 그릇 정리(지울 것 없음, L3-3 닫음)." (`reviews/round-400-closing.md:8`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:890-896,901-903`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-31)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:898-899`

### NODE-056 S1 parse 함수의 자리는 `src/core/behaviors/utils/parse/` — 부르는 쪽은 동작 행의 `interpret` 칸과 기본 union 입력(쓰지 않는 호출), 오늘의 `src/core/parsers/`는 레거시로 옮기고 새 parse를 가져오지 않음

- 결정:
  > 【추론】 S1 parse 함수는 `src/core/behaviors/utils/parse/`에 둔다.
  > 【추론】 부르는 쪽은 동작 행의 `interpret` 칸뿐이다(WRITE-056).
  > 【추론】 18C-02의 `union` 행이 수·문자열·불리언 변환을 `type`에 적힌 순서로 부르므로 이 변환들은 두 종류 이상이 쓴다.
  > 【추론】 그래서 NODE-009대로 `behaviors/utils/` 아래, 주제 디렉토리 `parse/`에 둔다.
  > 【추론】 NODE-009와 어긋나지 않는다.
  > 【추론】 PR-2는 이 자리에 S1 변환(`reviews/round-18-owner-answers.md:9`의 변환 목록, WRITE-052)만 하는 parse를 새로 둔다.
  > 【추론】 오늘의 `src/core/parsers/`는 그것을 가져오는 옛 노드와 함께 `src/__legacy__/core/parsers/`로 옮긴다(18C-49).
  > 【추론】 레거시는 새 parse를 가져오지 않는다.
- 보충:
  > 편집자 결정(18C-92): "【추론】 NODE-056의 parse를 부르는 쪽에 기본 union 입력(쓰지 않는 호출)을 더하고, "`type`에 적힌 순서로 부른다"는 문장을 지운다(규칙 A는 순서와 무관)." (`reviews/round-18-closing.md:2577`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:988-995`(정본), `reviews/round-18-closing.md:2577`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-36), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-92)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:997-999`, `reviews/round-18-closing.md:2620-2625`
- 충돌:
  > `reviews/round-18-closing.md:990`의 "`type`에 적힌 순서로 부르므로"는 소유자 답과 다르다: `union` 노드의 해석은 `type`의 선언 순서도 검증기 플러그인의 규칙도 쓰지 않고, 변환 목록(WRITE-075)으로 받아 줄 형이 정확히 하나일 때만 그 형으로 바꾼다(BLUEPRINT-042). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:24`).
  > `reviews/round-18-closing.md:989`의 "부르는 쪽은 동작 행의 `interpret` 칸뿐이다"는 18C-92의 결정과 다르다: 기본 union 입력도 같은 내부 함수를 쓰지 않는 호출로 부른다(REACT-033). 18C-92의 결정이 이긴다(`reviews/round-18-closing.md:2577`).

### NODE-057 노드 필드 `type`·`nullable`·`schemaType` — `type`은 `'union'`이 더해진 단일 문자열, `nullable`은 그대로, `schemaType`은 이름을 두고 계산된 허용 형(`'integer'` 보존, `'null'`은 뺌, union이면 칸마다 하나를 얼린 배열), 새 필드 없음

- 결정:
  > 가. `node.type`은 `'string'`·`'number'`·`'boolean'`·`'null'`·`'object'`·`'array'`·`'virtual'`·`'union'` 가운데 하나인 단일 문자열이며, 노드가 사는 동안 바뀌지 않는다.
  > `node.nullable`은 이름과 뜻을 그대로 두며, 값은 청사진이 정적 선언만으로 정한다.
  > `node.schemaType`은 이름을 그대로 두고 형을 `JSONSchemaType`과 `UnionSchemaType`의 합으로 넓히며, 새 필드는 더하지 않는다.
  > 저자 원문을 그대로 옮기는 필드는 두지 않는다.
  > `schemaType`은 저자가 쓴 `type`을 그대로 옮긴 값이 아니라 계산된 허용 형 목록이며, `'null'`은 빠지고 `nullable`이 맡는다.
  > 목록에 `'number'`가 함께 있으면 `'integer'`는 `'number'`에 흡수되고, 종류가 하나 남으면 스칼라이며, 형 없는 `anyOf`에서는 분기에서 계산한다.
  > union이 아닌 노드의 `schemaType`은 오늘과 같은 스칼라이며, number 노드는 `'integer'`를 보존하고 null 노드는 `'null'`이다.
  > union 노드의 `schemaType`은 계산한 목록을 얼린 읽기 전용 배열이다.
  > 그 순서는 앵커 선언에 저자가 쓴 순서이고, `'null'`은 union에서도 빠지며, 중복 원소는 청사진 오류이므로 생기지 않는다.
  > 불변식은 `Array.isArray(node.schemaType) === (node.type === 'union')`이다.
  > `type`·`strategy`·`nullable`·`schemaType`은 노드가 사는 동안 같은 참조이며, `schemaType` 배열은 청사진 칸마다 하나를 얼려 그 칸의 모든 노드(배열 아이템 포함)와 기본 spec이 공유한다.
  > 18C-02 (1)의 "`integer`는 `number`로 접는다"(`reviews/round-18-closing.md:58`)는 종류를 정할 때의 접기이고, `schemaType`은 `'integer'`를 보존한다.
- 보충:
  > 소유자(union O1): "아 그건 또 곤란합니다. 기존 사용자가 깨지는건 어차피 감수해야됩니다. 스키마에 쓴 배열 타입을 그대로 출력하는 필드와 node 의 현재 타입을 출력하는 필드를 구분하고, nullable 필드도 남겨두길 바랍니다. 어차피 지금까지 보고있던 node 타입은 여전히 단일 문자열일거고(union 이 추가될 뿐) 스키마 타입은 배열이나 단일 문자열일거고. jsonSchema type 을 그대로 보는거니. nullable 도 속성값으로 남겨두고싶어. 정리하자면, 기존 속성을 유지하고, schema 의 원본타입(이 노드의 jsonSchema Type, 아마도 계산된?)을 추가하는 방향." (`reviews/round-18-owner-answers.md:31`)
  > 소유자(union O1): "일단 이게 좀 복잡하니까, 기존 사용성을 기반하되 파괴적 변화를 해도 되니까 폭넓게 가장 최선의 인터페이스와 기능, 그리고 신뢰할 수 있고 예측 가능한 계약을 만들 수 있도록 에이전트 스웜을 구성해보자." (`reviews/round-18-owner-answers.md:31`)
  > 소유자(union O1): "권장안 수용. 다만 그럼 union 도 동일하게 null이 빠진 배열에 nullable 로 구분해야 하는게 아닐까 싶은데." (`reviews/round-18-owner-answers.md:31`)
  > 편집자 결정(18C-90): "【추론】 정적 선언이 하나도 없는 이름은 fold가 같은 선언끼리 노드 하나를 둔다." (`reviews/round-18-closing.md:2405`)
  > 편집자 결정(18C-90): "【추론】 그 노드의 목록은 선언들 허용 집합의 합집합을 종류 규칙으로 나눈 것이며, `integer`는 모든 선언이 `integer`일 때만 남고, nullable은 OR이며, `{null}`이면 null 종류다." (`reviews/round-18-closing.md:2406`)
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:31`(정본, 반영 칸), `reviews/round-18-closing.md:2405-2406`
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:31` union O1), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-90)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:31`

### NODE-058 `union` 노드의 공개 형 — `UnionMemberType`·`UnionSchemaType`, `UnionNode`와 판별 `value`, props의 `value`·`onChange`, 종류별 `schemaType` 좁힘, 가드 `isUnionNode`, `InferSchemaNode`·`InferValueType`·`InferJSONSchema`의 사상, 참조 안정성, PR-2·PR-7 게이트

- 결정:
  > 【추론】 형 정의는 `UnionMemberType = 'string'|'number'|'integer'|'boolean'|'object'|'array'`와 `UnionSchemaType = readonly [UnionMemberType, UnionMemberType, ...UnionMemberType[]]`이다(원소 범위는 `reviews/round-18-owner-answers.md:29`).
  > 【추론】 `UnionNode`의 모양은 `type: 'union'`, `strategy: 'terminal'`, `schemaType: UnionSchemaType`, `nullable: boolean`, `children: null`에 공통 멤버를 더한 것이다(SURFACE-058).
  > 【추론】 `UnionNode`는 `valueTypeMismatch`를 판별자로 두 멤버로 나뉜다.
  > 【추론】 `valueTypeMismatch`가 `false`인 멤버의 `value`는 `string | number | boolean | ObjectValue | ArrayValue | undefined`이고, nullable이면 `| null`이 붙는다.
  > 【추론】 `valueTypeMismatch`가 `true`인 멤버의 `value`는 `unknown`이다.
  > 【추론】 노드 형에는 제네릭을 두지 않으며, 목록 형으로 좁히는 것은 `FormTypeInputProps`가 맡는다.
  > 【추론】 union 노드의 `FormTypeInputProps`에서 `value`와 `onChange`는 일부러 다른 형이다.
  > 【추론】 props의 `value`는 `UnionNode.value`와 같은 판별 모양이다: `valueTypeMismatch === false`이면 목록 종류의 값, `undefined`, (nullable이면) `null`이고, `true`이면 `unknown`이다.
  > 【추론】 props의 `onChange`는 목록 종류의 값, `undefined`, 그리고 nullable일 때만 `null`을 받는다.
  > 【추론】 종류별 공개 형은 `schemaType`을 좁힌다: `StringNode`는 `'string'`, `NumberNode`는 `'number'|'integer'`, `BooleanNode`는 `'boolean'`, `NullNode`는 `'null'`, `ObjectNode`는 `'object'`, `ArrayNode`는 `'array'`, `VirtualNode`는 `'virtual'`, `UnionNode`는 `UnionSchemaType`이다(NODE-015, NODE-046).
  > 【추론】 공개 가드 `isUnionNode(x) = isSchemaNode(x) && x.type === 'union'`을 더한다(이름은 `reviews/round-18-owner-answers.md:28`).
  > 【추론】 `isTerminalNode(unionNode)`는 참이고 그 반환 형 합집합에 `UnionNode`가 들어가며, `isBranchNode(unionNode)`는 거짓이다.
  > 【추론】 새 설계에서 두 가드는 `strategy`를 본다.
  > 【추론】 "목록에 X가 있는가"를 묻는 공개 가드는 두지 않는다: `isUnionNode(n) && n.schemaType.includes('integer')`로 충분하다(seiri public-contract §1).
  > 【추론】 `JSONSchemaWithVirtual`에 `UnionSchema`를 더하며, 모양은 `type`이 `UnionMemberType | 'null'`의 읽기 전용 배열인 것과 `type` 없이 `anyOf`·`oneOf`가 필수인 것의 둘이다.
  > 【추론】 `InferSchemaNode`와 `InferValueType`은 18C-90의 런타임 절차를 비추며, 청사진 오류가 되는 모양은 형 수준에서도 무효이고, 형 수준이 판정할 수 없는 모양은 넓은 형으로 둔다.
  > 【추론】 `type` 배열을 접은 집합의 원소가 2개 이상이면 `InferSchemaNode`는 `UnionNode`이고, `InferValueType`은 원소 값 형의 합(nullable이면 `| null`)이다.
  > 【추론】 접은 집합의 원소가 1개이면 그 종류의 노드와 그 형(nullable이면 `| null`)이다.
  > 【추론】 `type` 배열이 `'null'`만이거나 형 없는 칸의 분기가 모두 null 분기이면 `NullNode`와 `null`이다.
  > 【추론】 형 없는 `anyOf`·`oneOf`의 모든 분기가 원시 형을 가지면 분기 형을 모아 위 두 줄과 같이 사상하고, 값 형은 분기 값 형의 합이다.
  > 【추론】 형 없는 분기(`const`·`enum`만 있는 것 포함), 객체·원시 혼합 분기, 모든 분기가 객체(또는 배열)인 형 없는 칸은 `never`와 `unknown`이다.
  > 【추론】 `$ref`, 게이트 가진 분기, `oneOf`와 `anyOf`가 함께 있는 칸, 본체에 붙은 `allOf`는 넓은 `SchemaNode`와 오늘 규칙의 값 형이다.
  > 【추론】 `src/types/value.ts`의 `NormalizeType`을 지우고 winglet의 `InferValueType`에 스키마를 그대로 넘긴다.
  > 【추론】 union 칸에 `enum`이 있으면 `InferValueType`은 목록 종류들의 값 형과 enum 리터럴 형의 교집합이며, 리터럴의 JSON 종류가 목록(+nullable)에 있는 것만 남는다(예: `['number','string']` + `enum:[1,'a',true]`는 `1 | 'a'`).
  > 【추론】 `InferJSONSchema<Value>`가 분배되지 않게 고쳐, 값의 null이 아닌 범주(string·number·boolean·object·array, 리터럴 합은 한 범주)가 둘 이상이면 `UnionSchema`로 사상한다.
  > 【추론】 그래서 `FormTypeInputProps<string|number>`의 `node`는 `UnionNode`다.
  > 【추론】 유효 목록은 노드마다 유효 스키마 메모가 같은 동안 같은 참조이고, 좁히는 게이트가 없으면 `schemaType`과 같은 참조다.
  > 【추론】 `jsonSchema`는 켜진 덧씌움 집합이 같은 동안 같은 참조다.
  > 【추론】 `value`와 `valueTypeMismatch`는 커밋 사이에 같은 참조이며, 객체·배열 값은 변환하지 않으므로 참조가 그대로이고, 같은 원본이면 방출도 같은 참조다(VALUE-012, VALUE-030).
  > PR: PR-2(노드 형)·PR-7(공개 수출)
  > 무엇: tsc 전용 `src/types/__tests__/union.type-test.ts`가 위 사상, `InferValueType`·`InferJSONSchema`의 형, union props의 `value`(판별)와 `onChange`(목록 형)를 단언하고, `union.schema-type-invariant.test.ts`가 같은 칸의 노드와 배열 아이템의 `schemaType` 참조가 같고 얼려 있음을 단언한다.
  > 통과: 모든 사상이 위대로이고 tsc와 시험이 통과한다.
  > 실패: 형 수준이 런타임 절차와 다른 답을 내면 그 모양을 넓은 형으로 두고, 넓혀도 어긋나면 이 블록을 고친다.
- 보충:
  > 반영 칸(설계서 메모 4): "게터 `typeMismatch: boolean`, 경로 목록 `typeMismatches: readonly string[]`, 경고 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`." (`reviews/round-18-owner-answers.md:41`)
  > 편집자 결정(25C-11): "【추론】 E1–E42는 `src/core/blueprint/__tests__/`의 네 파일에 있다: `blueprint.type-syntax.test.ts`(E1–E10, E28), `blueprint.type-inference.test.ts`(E11–E17, E29, E32–E35), `blueprint.type-static-intersection.test.ts`(E18–E24, E30, E31, E36–E39), `blueprint.type-gated-declarations.test.ts`(E25–E27, E40–E42)." (`reviews/round-25-closing.md:103`)
  > 편집자 결정(25C-11): "【추론】 `union.kind-procedure.test.ts`의 단언은 위 네 파일의 표 행과 `blueprint.type-gated-declarations.test.ts`의 정적 소유자 없는 분기 접기 충돌 사례에, `union.null-only.test.ts`는 위 표 행에, `union.static-intersection.test.ts`는 `blueprint.type-static-intersection.test.ts`에, `union.schema-type-invariant.test.ts`는 `blueprint.type-syntax.test.ts`의 E1–E9 불변식에, `union.gated-narrowing.test.ts`는 `blueprint.type-gated-declarations.test.ts`에, `union.terminal-subtree-warning.test.ts`는 `blueprint.diagnostics.test.ts`와 `blueprint.type-syntax.test.ts`의 E28에 있다." (`reviews/round-25-closing.md:104`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2337-2365,2372-2375`(정본), `reviews/round-18-owner-answers.md:41`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-89), 소유자 답(`reviews/round-18-owner-answers.md:41` 설계서 메모 4)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2367-2370`
- 충돌:
  > `reviews/round-18-closing.md:2339`의 "【추론】 `UnionNode`는 `valueTypeMismatch`를 판별자로 두 멤버로 나뉜다."는 소유자 답과 다르다: 이 항목의 `valueTypeMismatch`·`valueTypeMismatches`·`VALUE_TYPE_MISMATCH`는 확정 이름 `typeMismatch`·`typeMismatches`·`SCHEMA_FORM_WARNING.TYPE_MISMATCH`로 읽는다(SURFACE-061). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:41`).
  > `reviews/round-18-closing.md:2357`의 "【추론】 형 없는 분기(`const`·`enum`만 있는 것 포함), 객체·원시 혼합 분기, 모든 분기가 객체(또는 배열)인 형 없는 칸은 `never`와 `unknown`이다."는 19라운드 결정과 다르다: 모든 분기가 인라인 객체(또는 배열)인 형 없는 칸은 `ObjectNode`(또는 `ArrayNode`)와 분기 값 형의 합이고, 분기 없는 `const`·`enum` 칸은 리터럴 형이며, 형 없는 분기와 혼합 분기는 그대로다(NODE-059). 19라운드 결정이 이긴다(`reviews/round-19-closing.md:24-25,44`).

### NODE-059 형 없는 객체·배열 분기 호스트와 `const`만 있는 칸의 공개 형 — 분기가 모두 인라인 객체(또는 배열)면 `ObjectNode`·`ArrayNode`와 분기 값 형의 합, `$ref`·게이트 분기·두 키워드·`allOf`는 넓은 형 그대로, `const`·`enum` 칸은 리터럴 형

- 결정:
  > 【추론】 `InferSchemaNode`·`InferValueType`은 분기가 모두 인라인 객체(또는 배열) 스키마인 형 없는 `oneOf`·`anyOf`를 `ObjectNode`(또는 `ArrayNode`)로 두고, 값 형은 분기 값 형의 합(null 분기가 있으면 `| null`)이다.
  > 【추론】 NODE-058의 "`$ref`, 게이트 가진 분기, `oneOf`와 `anyOf`가 함께 있는 칸, 본체에 붙은 `allOf`는 넓은 `SchemaNode`와 오늘 규칙의 값 형이다"는 그대로다.
  > 【추론】 `InferValueType`은 이 칸을 `const`의 리터럴 형이나 `enum` 원소의 합(null 리터럴이 있으면 `| null`)으로 좁히고, `InferSchemaNode`는 U가 정한 종류의 노드다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-19-closing.md:24-25,44`(정본)
- 닫은 사람: 편집자 결정(19라운드, `reviews/round-19-closing.md` 19C-01·19C-02)
- 라운드: 19
- 까닭: `reviews/round-19-closing.md:31,48`
