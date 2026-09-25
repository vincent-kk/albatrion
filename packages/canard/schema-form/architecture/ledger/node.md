# 단일 원장 — 노드 구조

기준 커밋: `ba398c330`(저장소 `packages/canard/schema-form/architecture`). 정본 우선순위는 다음 순서다. (1) 소유자 답은 고정이다. (2) 이 영역에는 채택된 ADR이 없다. `adr/0011-branch-node-composition.md`는 "제안" 상태이며 17라운드에 노드 구조 부분이 고쳐졌고, 노드 구조의 가장 뒤 정본은 17라운드의 `09-landing-and-test-strategy.md` §3이다. (3) `03-mental-model.md`(원장)는 08과 다르면 원장이 이긴다. (4) 뒤 라운드가 앞 라운드를 이긴다. `05-before-after.md`·`06-conclusions.md`·`07-conclusions.md`는 그때의 기록이며 고치지 않는다. 상태 값의 뜻: **현행**은 지금 유효한 규칙, **대체됨**은 한때 유효했으나 뒤 라운드나 소유자 답으로 바뀐 규칙(옛 문장을 원문 그대로 남긴다), **열림**은 18라운드 안건으로 넘어가 아직 정해지지 않은 것이다. 한 줄의 이어진 여러 문장만 옮긴 항목은 출처를 `path:line#a-b`로, 한 문장만 옮긴 항목은 `path:line#n`으로 적는다.

## 색인

| 번호 | 한 줄 요약 | 상태 | 닫은 사람 |
| --- | --- | --- | --- |
| NODE-001 | 노드 구조 — 상속 없는 단일 클래스와 종류별 동작 행 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:24` 노드 구조) |
| NODE-002 | 클래스 하나, 행 하나 — `BEHAVIORS[type][strategy]`, 필드 `behavior`, 게터 `type`·`strategy` | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:24` 노드 구조), 소유자 답(`reviews/round-17-owner-answers.md:21` 종류별 동작 표의 이름), 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈; 표의 두 단계), 소유자 답(`reviews/round-17-owner-answers.md:23` `kind` 필드) |
| NODE-003 | 공개 `node.group`은 `node.strategy`로 바뀐다(값은 그대로) | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름) |
| NODE-004 | 공통 필드와 `structure`·`runtime`, 노드 인스턴스가 곧 레코드, `settle`의 자유 함수 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:46` 14 트리마다 하나인 공용 칸), 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md` §2; 칸의 내용과 `settle`의 자유 함수), 17라운드 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:38`·`reviews/raw-round17-node-structure.md:154`; 소유자 이견 없이 권고대로 확정된 칸 `structure`) |
| NODE-005 | 터미널 객체·배열의 행 — 값을 통째로 드는 칸 함수, 원본 배열 위의 배열 연산 | 현행 | 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md` §5) |
| NODE-006 | 행의 칸과 행 계약 `Behavior` — 행은 계산만 한다, 같은 순서, 공유 칸, 정적 선택의 메모 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:43` 9 입력 마침 칸), 17라운드 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:38`·`reviews/raw-round17-node-structure.md:154`; 소유자 이견 없이 권고대로 확정된 칸 `interpret`·`assemble`·`project`와 형 `Behavior`), 편집자 결정(17라운드, `reviews/round-17-owner-answers.md:44`; 소유자가 물음으로 낸 이름 `declareChildren`을 반대 없이 채택하고 칸의 일을 이름에 맞춤), 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md` §5; 같은 순서, 공유 칸, 정적 선택의 메모) |
| NODE-007 | `trim`과 입력 마침 — 문자열 행의 `finishInput` 칸, 어댑터는 신호만 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3), 소유자 답(`reviews/round-17-owner-answers.md:43` 9 입력 마침 칸), 소유자 답(`reviews/round-17-owner-answers.md:54` 9번 확인) |
| NODE-008 | 책임별 fractal과 트리마다 하나인 생성 함수 `schemaNodeFactory` | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:26` `tree`의 이름; 책임별로 나눔), 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈), 소유자 답(`reviews/round-17-owner-answers.md:45` 12·15 생성 함수와 그 형), 17라운드 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:38`·`reviews/raw-round17-node-structure.md:154`; 소유자 이견 없이 권고대로 확정된 칸 `record`·`navigation`·`SchemaNode/`), 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md:171`; 공장은 트리마다 하나) |
| NODE-009 | behaviors 규칙 — 종류마다 fractal, 보조의 자리, 가져오기 금지 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈; 전략이 아니라 종류마다 모듈 하나), 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md` §5; 소유자 지시 `reviews/round-17-owner-answers.md:25`) |
| NODE-010 | 겉면 규칙 — `SchemaNode` 클래스 파일, 멤버 목록 시험, 내부 통로 | 현행 | 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md` §6; 소유자 지시 `reviews/round-17-owner-answers.md:25`) |
| NODE-011 | 이름 규칙 — 넓은 이름은 `SchemaNode` 접두, `Node`는 좁은 이름공간에서만 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:53` `Node` 이름 규칙), 소유자 답(`reviews/round-17-owner-answers.md:45` 12·15 생성 함수와 그 형) |
| NODE-012 | 이름 규칙을 오늘의 공개 이름에 적용할지가 18라운드 안건으로 이관됨 | 열림(→ `reviews/round-18-agenda.md` §7, :91) | 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:91`) |
| NODE-013 | 클래스를 없애지는 않는다 — 공개 계약과 프로토타입 메서드 | 현행 | 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md` §6) |
| NODE-014 | 배열 메서드 — 클래스에 두되 타입은 `ArrayNode`에만, 비배열은 공유 칸이 던짐 | 현행 | 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md` §5) |
| NODE-015 | 공개 타입과 가드 아홉은 유지 — 판별 합집합, `isSchemaNode`, `isTerminalNode` 바로잡기, `group` 소비자 이주 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름; 가드 이름 유지와 이주 행), 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md` §6) |
| NODE-016 | 의존 방향 — fractal의 전순서와 조건 셋 | 현행 | 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md` §3) |
| NODE-017 | `SchemaNodeRuntime` 칸 타입의 타입 순환(N5)이 18라운드 안건으로 이관됨 | 열림(→ `reviews/round-18-agenda.md` §6, :75) | 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:75`) |
| NODE-018 | 비용(추정) — 노드마다 객체 하나, 행 아홉, 숨은 클래스, 벤치 여섯 | 현행 | 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md` §7) |
| NODE-019 | 노드 구조에서 결정하지 않은 것(N2·N5·N6·N14, 공개 표면의 크기, `ContextNode`, 문서 주석 관례, 내부 통로) | 열림(→ `reviews/round-18-agenda.md` §6·§7, :74-75, :77-78, :86-92) | 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:74-92`) |
| NODE-020 | 터미널 아래 경로는 `find`·`findNodes` 모두 노드 없음 | 현행 | 원리(`06-conclusions.md:175` P2·G4; `find`), 편집자 결정(10라운드 추정 채택 규칙, `07-conclusions.md:209`; `findNodes`) |
| NODE-021 | 노드의 종류 — 가르는 기준과 표(리프, 터미널 object·array, branch object, branch array) | 현행 | 편집자 결정(ADR 0011 4차 본문, `adr/0011-branch-node-composition.md:12`), 편집자 결정(4라운드 3.1판, `adr/0011-branch-node-composition.md:5`; 노드 종류의 목록) |
| NODE-022 | union 호스트의 특수 처리는 없다 — 폼은 분기를 고르지 않는다 | 현행 | 소유자 답(`reviews/round-10-owner-answers.md:9` A-3) |
| NODE-023 | 대체됨: 노드 종류 표의 union 호스트 행 | 대체됨(→ NODE-022) | 소유자 답(`reviews/round-10-owner-answers.md:9` A-3) |
| NODE-024 | 대체됨: 노드 종류 표의 참조 그룹 행 | 대체됨(→ NODE-032, NODE-034) | 소유자 답(`reviews/round-10-owner-answers.md:31` E-4), 편집자 결정(17라운드 노드 구조 수렴, `adr/0011-branch-node-composition.md:71`; 값 행) |
| NODE-025 | branch 노드에 남는 책임은 셋 — 자식 집합의 출처, 활성, identity | 현행 | 편집자 결정(ADR 0011 4차 본문, `adr/0011-branch-node-composition.md:12`) |
| NODE-026 | object와 array는 자식 집합의 출처만 다르다 — 같은 모델, 재계산은 재계산 목록에 비례 | 현행 | 편집자 결정(ADR 0011 4차 본문, `adr/0011-branch-node-composition.md:12`) |
| NODE-027 | 인라인 `FormTypeInput`의 암묵 터미널은 의도된 기능 — 끊지 않는다 | 현행 | 소유자 답(`00-goals.md:116` C3 세부 2), 소유자 답(`reviews/round-2.md:114` C3), 소유자 답(`reviews/round-17-owner-answers.md:12` 통보 1) |
| NODE-028 | 판정은 렌더 계층으로 — 판정 함수의 세 값과 터미널 전략을 정하는 순서 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:12` 통보 1), 17라운드 스웜 수렴(편집자 결정, `adr/0011-branch-node-composition.md:59`; 판정 함수의 세 값과 core가 `presentation`을 읽지 않음) |
| NODE-029 | 모든 선언에서 전략을 정하고 경우마다 다르면 청사진 오류 — 선언의 범위와 경우의 정의가 18라운드 안건으로 이관됨 | 열림(→ `reviews/round-18-agenda.md` §1, :22, :24) | 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:22`, `reviews/round-18-agenda.md:24`) |
| NODE-030 | 명시적 재정의를 양방향으로 둔다 — `terminal: false`·`terminal: true` | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:12` 통보 1), 편집자 결정(ADR 0011 4차 본문 §3, `00-goals.md:116`의 제안) |
| NODE-031 | 혼란스러운 경우를 드러낸다 — 터미널 노드의 입력이 빈 `ChildNodeComponents`를 읽으면 개발 모드 경고 | 현행 | 원리(`00-goals.md:105` C2 작성자 실수의 가시성, 소유자 채택 `reviews/round-2.md:112`), 편집자 결정(ADR 0011 4차 본문, `adr/0011-branch-node-composition.md:12`) |
| NODE-032 | `virtual` — 참조 그룹 노드와 `&virtual`은 하지 않고 `options.virtual`은 현행 유지, 검증기 앞 제거 목록 | 중복(→ VALIDATE-034, WRITE-026) | 소유자 답(`reviews/round-10-owner-answers.md:31` E-4), 소유자 답(`reviews/round-12-owner-answers.md:16` 8 `virtual`) |
| NODE-033 | 대체됨: `virtual`을 `&virtual`로 옮기고 core에 참조 그룹 노드 종류를 둔다(D-6 (a))와 (a)·(b)의 비용 비교 | 대체됨(→ NODE-032) | 소유자 답(`reviews/round-10-owner-answers.md:31` E-4) |
| NODE-034 | 가상 노드의 규칙 표 — 자식의 출처, 값, 쓰기, 방출·가드·검증, 명령, identity | 현행 | 소유자 답(`reviews/round-10-owner-answers.md:31` E-4; 현행 유지), 편집자 결정(17라운드 노드 구조 수렴, `adr/0011-branch-node-composition.md:9`; 값 행) |
| NODE-035 | 사라지는 전처리 하나 — `required`의 가상 이름 펼치기 | 현행 | 소유자 답(`reviews/round-12-owner-answers.md:16` 8 `virtual`), 원리(`reviews/round-5-derivations.md` §3; P1′) |
| NODE-036 | 이주 시 보존할 테스트 | 현행 | 편집자 결정(ADR 0011 4차 본문, `adr/0011-branch-node-composition.md:12`) |
| NODE-037 | 배열 아이템의 identity·큰 배열의 지연 실체화·`contains`와 튜플이 18라운드 안건으로 이관됨 | 열림(→ `reviews/round-18-agenda.md` §9, :109) | 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:109`) |
| NODE-038 | `emit`의 키 순서(Q14)가 18라운드 안건으로 이관됨 | 열림(→ `reviews/round-18-agenda.md` §6, :79) | 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:79`) |
| NODE-039 | 2단계 생명주기가 새 구조에서도 필요한가 — 생성이 곧 첫 정착(GOAL-071)이 답함 | 대체됨(→ GOAL-071) | 편집자 결정(4라운드, `04-inherited-constraints.md:35` T-20; GOAL-071) |
| NODE-040 | 가상 노드 아래 경로의 `find` 별칭 여부(S11의 남은 물음)가 18라운드 안건에 남음 | 열림(→ `reviews/round-18-agenda.md` §9, :112) | 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:112`) |

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
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:104#1-4`(정본), `adr/0011-branch-node-composition.md:53`, `reviews/round-17-owner-answers.md:21`, `reviews/round-17-owner-answers.md:23`, `reviews/round-17-owner-answers.md:42`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:24` 노드 구조), 소유자 답(`reviews/round-17-owner-answers.md:21` 종류별 동작 표의 이름), 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈; 표의 두 단계), 소유자 답(`reviews/round-17-owner-answers.md:23` `kind` 필드)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:23-24`

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
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:104#6-9`(정본), `reviews/round-17-owner-answers.md:38`, `reviews/round-17-owner-answers.md:46`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:46` 14 트리마다 하나인 공용 칸), 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md` §2; 칸의 내용과 `settle`의 자유 함수), 17라운드 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:38`·`reviews/raw-round17-node-structure.md:154`; 소유자 이견 없이 권고대로 확정된 칸 `structure`)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:46`

### NODE-005 터미널 객체·배열의 행 — 값을 통째로 드는 칸 함수, 원본 배열 위의 배열 연산

- 결정:
  > 터미널 객체는 행을 따로 두되 값을 통째로 드는 칸 함수를 잎과 함께 쓰고, 터미널 배열은 원본을 통째로 들되 배열 연산(`push`·`update`·`remove`·`pop`·`clear`)을 오늘처럼 원본 배열 위에서 지원한다.
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:104#11`(정본)
- 닫은 사람: 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md` §5)
- 라운드: 17
- 까닭: `reviews/raw-round17-node-structure.md:115`

### NODE-006 행의 칸과 행 계약 `Behavior` — 행은 계산만 한다, 같은 순서, 공유 칸, 정적 선택의 메모

- 결정:
  > **행의 칸.** `interpret`(입력 해석), `assemble`(합성: 활성 자식의 방출 값 → local), `project`(투영: local → 방출 값), `finishInput`(입력 마침), `declareChildren`(자식 선언 목록만 돌려준다. 생성은 `settle`이 런타임의 `nodeFactory`로 한다), `type`, `strategy`. 행 계약의 형은 `Behavior`다. 행은 계산만 한다: 원본 쓰기, 되돌림 기록, 자식 연결과 폐기의 확정, 통지는 `settle`과 `dispatch`가 한다. 모든 행은 칸을 모두 같은 순서로 가지며 없는 동작은 공유 칸으로 채우고, 뜻이 같은 칸은 함수 객체 하나를 여러 행이 함께 쓴다(공유 로직을 타입별로 흩지 않는다는 요건을 행 수준에서도 지킨다). 옵션에서 나오는 정적 선택(빈 값 생략, 배열 뒤쪽 생략, `trim`, 배열 한계)은 칸이 불릴 때마다 계산하지 않고 유효 스키마 메모가 바뀔 때 한 번 계산해 메모와 함께 둔다.
- 보충: 없음
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
- 출처: `09-landing-and-test-strategy.md:106`(정본), `adr/0011-branch-node-composition.md:3`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3), 소유자 답(`reviews/round-17-owner-answers.md:43` 9 입력 마침 칸), 소유자 답(`reviews/round-17-owner-answers.md:54` 9번 확인)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:11`

### NODE-008 책임별 fractal과 트리마다 하나인 생성 함수 `schemaNodeFactory`

- 결정:
  > **책임별 fractal.** 16라운드에 레코드·종류 표·탐색을 한 fractal에 두던 제안을 책임별로 나눴다(17라운드 소유자 답). `src/core/blueprint/`(PR-1), `src/core/record/`(레코드: `SchemaNodeRecord` 형, 행 계약 `Behavior`, `SchemaNodeFactory` 형, `SchemaNodeRuntime` 형, 이름·경로 갱신과 상호작용 상태 패치), `src/core/behaviors/`(`BEHAVIORS`; 종류 모듈 `stringBehavior/`·`numberBehavior/`·`booleanBehavior/`·`nullBehavior/`·`virtualBehavior/`, `objectBehavior/`와 `arrayBehavior/`는 안에 `branch/`·`terminal/`·`utils/`), `src/core/navigation/`(`find`·`findNodes`와 트리 걷기), `src/core/settle/`(+`settle/derive/`), `src/core/dispatch/`, `src/core/validation/`, `src/core/SchemaNode/`(공개 겉면, 클래스 `SchemaNode`). 모듈 수준 생성 함수는 `schemaNodeFactory`이며, 오늘과 달리 공장은 노드마다가 아니라 트리마다 하나다.
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:107`(정본), `adr/0011-branch-node-composition.md:99`, `reviews/round-17-owner-answers.md:26`, `reviews/round-17-owner-answers.md:45`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:26` `tree`의 이름; 책임별로 나눔), 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈), 소유자 답(`reviews/round-17-owner-answers.md:45` 12·15 생성 함수와 그 형), 17라운드 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:38`·`reviews/raw-round17-node-structure.md:154`; 소유자 이견 없이 권고대로 확정된 칸 `record`·`navigation`·`SchemaNode/`), 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md:171`; 공장은 트리마다 하나)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:26`, `reviews/round-17-owner-answers.md:45`

### NODE-009 behaviors 규칙 — 종류마다 fractal, 보조의 자리, 가져오기 금지

- 결정:
  > **behaviors 규칙.** 종류마다 fractal 하나(`INTENT.md`·`DETAIL.md`·진입점·같은 이름의 행 파일)를 둔다. 여덟 줄을 넘는 칸과 그 종류만의 보조는 그 종류의 `utils/`, 두 전략이 함께 쓰는 것은 그 종류의 `utils/`, 두 종류 이상이 쓰는 것은 `behaviors/utils/`에 둔다. behaviors 밖에서도 쓰는 것은 behaviors의 것이 아니다(예: `resolveArrayLimits`는 `blueprint/`로). 행은 칸을 모두 같은 순서로 갖는다. 종류 모듈은 behaviors 뿌리와 `settle`·`dispatch`·`validation`·공개 겉면을 가져오지 않는다.
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:108`(정본), `adr/0011-branch-node-composition.md:99`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈; 전략이 아니라 종류마다 모듈 하나), 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md` §5; 소유자 지시 `reviews/round-17-owner-answers.md:25`)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:25`

### NODE-010 겉면 규칙 — `SchemaNode` 클래스 파일, 멤버 목록 시험, 내부 통로

- 결정:
  > **겉면 규칙.** `SchemaNode` 클래스 파일에는 필드·게터·문장 하나짜리 위임만 둔다. 분기·반복·종류 비교를 금하고(예외는 가드), 생성자는 선언 순서대로 대입만 하며, 노드마다 할당을 만들지 않는다(생성자와 필드 초기화식에 객체·배열 리터럴, 함수, `new`를 두지 않는다). 필드 집합은 고정한다. 멤버 목록은 공개 계약 목록과 같아야 하며, `SchemaNode/`의 `DETAIL.md` 목록과 프로토타입 멤버 이름을 맞대는 멤버 목록 시험으로 지킨다. 여러 단계를 잇는 조율(쓰기 → 커밋 → 통지 → 검증 요청, 하위 트리 상태 쓰기, `validate`, 로드)은 `dispatch`의 동사별 진입이 맡는다. 기계 검사는 그 클래스 파일에만 거는 ESLint 설정이다. 내부 통로(입력 마침 신호 `finishInput`, 입력 출처 표식이 붙은 쓰기)는 클래스 멤버가 아니며 `SchemaNode/` 진입점이 바인딩 전용으로 이름을 붙여 내보낸다. `core/index.ts`는 이들을 이름으로 다시 내보내고 `src/index.ts`는 내보내지 않는다(공개 index의 키 목록 시험). 겉면의 `INTENT.md` 첫 줄에 이름 함정 경고를 둔다(렌더 디렉토리 `src/components/SchemaNode`, 공개 판별 합집합 형 `SchemaNode`와 이름이 같다).
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:109`(정본)
- 닫은 사람: 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md` §6; 소유자 지시 `reviews/round-17-owner-answers.md:25`)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:25`

### NODE-011 이름 규칙 — 넓은 이름은 `SchemaNode` 접두, `Node`는 좁은 이름공간에서만

- 결정:
  > **이름 규칙.** 넓은 범위의 이름(내보내는 형, 모듈 수준 함수, fractal 진입점의 이름)은 `SchemaNode` 접두를 쓴다. `Node`로 줄여 부르는 것은 한 형의 필드나 한 모듈 안의 지역 이름처럼 아주 좁은 이름공간에서만 한다(전역 `Node`와 헷갈리지 않게). 그래서 형은 `SchemaNodeRecord`·`SchemaNodeRuntime`·`SchemaNodeFactory`, 모듈 수준 함수는 `schemaNodeFactory`이고, 런타임 안의 필드처럼 좁은 자리에서만 `nodeFactory`로 줄인다(17라운드 소유자 답, 08 §13).
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:110#1-4`(정본), `reviews/round-17-owner-answers.md:53`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:53` `Node` 이름 규칙), 소유자 답(`reviews/round-17-owner-answers.md:45` 12·15 생성 함수와 그 형)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:53`

### NODE-012 이름 규칙을 오늘의 공개 이름에 적용할지가 18라운드 안건으로 이관됨

- 결정:
  > 오늘의 공개 이름에 적용할지는 18라운드 안건이다.
- 보충: 없음
- 상태: 열림(→ `reviews/round-18-agenda.md` §7, :91)
- 출처: `09-landing-and-test-strategy.md:110#5`(정본)
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:91`)
- 라운드: 17
- 까닭: `reviews/round-18-agenda.md:91`

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
- 보충: 없음
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
- 상태: 열림(→ `reviews/round-18-agenda.md` §6, :75)
- 출처: `09-landing-and-test-strategy.md:114#5`(정본)
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:75`)
- 라운드: 17
- 까닭: `reviews/round-18-agenda.md:75`

### NODE-018 비용(추정) — 노드마다 객체 하나, 행 아홉, 숨은 클래스, 벤치 여섯

- 결정:
  > **비용(추정, 벤치로 확인).** 노드마다 객체 하나이고, 행은 종류마다 하나를 모든 노드가 공유하므로 프로세스 전체에 아홉이다. 노드마다의 매니저·클로저·전략 객체·구독은 없다(규칙과 린트로 금한다). 모든 노드가 한 클래스이고 필드를 같은 순서로 넣으면 한 숨은 클래스를 가져, 여러 종류를 도는 `settle`·`dispatch`의 필드 읽기가 단형 인라인 캐시로 남을 것으로 본다(Vincent가 말한 "상속 클래스에 의한 캐싱 비효율"). 남는 비용도 적는다: 칸 함수의 호출은 간접 호출으로 남고, `type`이 게터가 되어 읽기가 한 단계 늘며, iOS의 JavaScriptCore에서는 같은 결론이 보장되지 않는다. 메모리는 필드 24–30개일 때 노드 하나가 약 110–140바이트(포인터 압축 엔진) 또는 약 210–260바이트(압축 없는 엔진)로 추정한다. 벤치 여섯을 §6.1의 기준선과 비교한다: B1(섞인 종류 1만 노드의 `value`·`type` 읽기, V8과 JavaScriptCore), B2(노드당 힙 바이트), B3(아홉 종류 인스턴스와 행이 같은 맵인지), B4(정착 뜨거운 루프의 거대형 자리 수), B5(입력에서 커밋까지의 지연), B6(노드 1만 개 생성 시간). 오늘의 주된 비용이 노드마다의 할당인지 인라인 캐시인지는 재지 않았으므로 크기는 벤치가 정한다.
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:115`(정본), `reviews/round-18-agenda.md:68`
- 닫은 사람: 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md` §7)
- 라운드: 17
- 까닭: `reviews/raw-round17-node-structure.md:142-144`

### NODE-019 노드 구조에서 결정하지 않은 것(N2·N5·N6·N14, 공개 표면의 크기, `ContextNode`, 문서 주석 관례, 내부 통로)

- 결정:
  > **결정하지 않은 것(18라운드 안건, `reviews/round-18-agenda.md`).** N2(탐색이 기대는 `subnodes`·`variant`의 존폐), N5(런타임 형의 타입 순환), N6(레코드에서 공개 판별 합집합으로의 형 변환), N14(행이 없는 조합: 잎의 `terminal: false`, 가상의 `terminal: true`와 가상에 둔 인라인 `presentation.FormTypeInput`의 처리와 이주), 공개 표면의 크기(루트 전용 넷 `globalState`·`setSubtreeState`·`clearSubtreeState`·`globalErrors`, 명령 넷을 노드 메서드로 둘지(C-11), `subnodes`·`defaultValue`·`resetSubtree`·`schemaPath`·`key`의 존폐), `ContextNode`의 자리, 문서 주석 `{@inheritDoc}` 관례, 내부 통로(`finishInput` 신호)를 core만 쓰는 호스트에 열지.
- 보충:
  > "PR-2 전, N14는 PR-1 전(18라운드 안건: 노드 구조)" (`08-design-a-to-z.md:500`)
- 상태: 열림(→ `reviews/round-18-agenda.md` §6·§7, :74-75, :77-78, :86-92)
- 출처: `09-landing-and-test-strategy.md:116`(정본), `09-landing-and-test-strategy.md:102`, `adr/0011-branch-node-composition.md:60`, `adr/0011-branch-node-composition.md:71`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:74-92`)
- 라운드: 17
- 까닭: `reviews/round-18-agenda.md:74-92`

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
- 상태: 현행
- 출처: `adr/0011-branch-node-composition.md:47-49`(정본)
- 닫은 사람: 편집자 결정(ADR 0011 4차 본문, `adr/0011-branch-node-composition.md:12`)
- 라운드: 5
- 까닭: `adr/0011-branch-node-composition.md:49`

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

### NODE-028 판정은 렌더 계층으로 — 판정 함수의 세 값과 터미널 전략을 정하는 순서

- 결정:
  > **암묵 규칙 유지, 판정은 렌더 계층으로.** 인라인 `presentation.FormTypeInput`이 **있고 `null`이 아닌지**를 보는 판정은 렌더 계층(React 바인딩)의 판정 함수가 하며, 렌더 계층이 이 함수를 청사진에 넘긴다. 판정 함수는 선언 하나를 받아 셋 가운데 하나를 돌려준다. 참(인라인 `presentation.FormTypeInput`이 있고 `null`이 아님), 거짓(그 키의 값이 `null`), 없음(그 키가 없거나 값이 `undefined`)이다. 없음은 앞 선언의 판정을 지우지 않으며(병합표의 `undefined`와 같다), 키 이름은 판정 함수만 안다. 청사진은 한 노드의 터미널 전략을 `options.terminal`(명시, 양방향) → 넘겨받은 판정 → `type`의 순서로 정한다. core는 `presentation` 안의 키를 읽지도 해석하지도 않으므로(P5) core만 쓰는 호스트에는 암묵 규칙이 없다.
- 보충:
  > "판정을 렌더 계층으로 옮기므로 core가 React 구성 요소를 판정하는 자리(`getNodeGroup.ts`의 `isReactComponent`)는 사라진다." (`adr/0011-branch-node-composition.md:59`)
  > "터미널 조건을 "있고 null이 아니다"로 넓히면 `React.lazy`의 결과나 설정 객체도 서브트리를 접는다." (`adr/0011-branch-node-composition.md:94`)
  > "`formTypeInputMap`은 트리 생성 뒤 렌더 계층에서 해석되므로 같은 컴포넌트가 인라인이면 터미널을 만들고 경로 매핑이면 만들지 않는다." (`adr/0011-branch-node-composition.md:94`)
- 상태: 현행
- 출처: `adr/0011-branch-node-composition.md:59#1-7`(정본), `open-questions.md:60`, `adr/0011-branch-node-composition.md:3`, `adr/0011-branch-node-composition.md:53`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:12` 통보 1), 17라운드 스웜 수렴(편집자 결정, `adr/0011-branch-node-composition.md:59`; 판정 함수의 세 값과 core가 `presentation`을 읽지 않음)
- 라운드: 17
- 까닭: `adr/0011-branch-node-composition.md:59`(열넷째 문장), `reviews/round-17-owner-answers.md:12`
- 충돌:
  > `00-goals.md:116`의 "→ 암묵 규칙은 유지하되 core가 React 컴포넌트를 감지하지 않고 "있고 null이 아니다"만 보며, 명시적 재정의를 양방향으로 두는 안을 제안했다(ADR 0011 §3)."는 정본과 다르다. 정본이 이긴다(`adr/0011-branch-node-composition.md:59`).

### NODE-029 모든 선언에서 전략을 정하고 경우마다 다르면 청사진 오류 — 선언의 범위와 경우의 정의가 18라운드 안건으로 이관됨

- 결정:
  > 한 노드의 전략은 청사진이 그 노드의 모든 선언에서 정적으로 정한다. 노드가 형상에 있는 모든 경우(그 노드를 선언한 게이트 가진 선언이 켜지고 꺼지는 조합. 게이트 없는 선언은 늘 켜져 있다)마다 그 경우에 켜진 선언들로 `options.terminal`(병합표대로 전순서에서 나중 것) → 렌더 계층 판정(없음이 아닌 결과 가운데 전순서에서 나중 것) → `type`의 순서로 전략을 정하고, 경우마다 정한 전략이 서로 다르면 청사진 오류다(14라운드 O-1과 같은 모양). 그래서 게이트 없는 선언끼리 값이 달라도 나중이 이길 뿐 오류가 아니고(12라운드 §9 "병합 불가한 … 나중이 승"), 조각에만 선언된 노드는 그 조각이 모두 꺼진 경우 형상에 없으므로 그 경우를 비교하지 않으며, 게이트 없는 선언의 `options.terminal`이 전략을 정한 노드에 게이트 가진 조각이 인라인 입력을 더해도 전략이 바뀌지 않으므로 오류가 아니다. 검사는 청사진 시점에 노드마다 그 노드의 선언 수에 비례하는 한 번이다.
- 보충:
  > "경우를 모두 열거하지 않는다." (`08-design-a-to-z.md:331`)
  > "각 경우의 전략은 켜진 선언 가운데 값을 가진 전순서의 나중 것이 정하므로, 게이트 없는 선언이 있으면 그것만 켜진 경우와 거기에 게이트 가진 선언을 하나씩 더한 경우를, 없으면 게이트 가진 선언이 하나씩만 켜진 경우를 비교하면 모든 경우를 비교한 것과 같다." (`08-design-a-to-z.md:331`)
- 상태: 열림(→ `reviews/round-18-agenda.md` §1, :22, :24)
- 출처: `adr/0011-branch-node-composition.md:59#8-11`(정본), `08-design-a-to-z.md:331`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:22`, `reviews/round-18-agenda.md:24`)
- 라운드: 17
- 까닭: `reviews/round-18-agenda.md:22`, `reviews/round-18-agenda.md:24`
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

### NODE-031 혼란스러운 경우를 드러낸다 — 터미널 노드의 입력이 빈 `ChildNodeComponents`를 읽으면 개발 모드 경고

- 결정:
  > **혼란스러운 경우를 드러낸다.** 터미널이 된 노드의 입력이 비어 있는 `ChildNodeComponents`를 읽으면 개발 모드에서 경고한다(`00-goals.md` C2).
- 보충: 없음
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
- 보충: 없음
- 상태: 현행
- 출처: `adr/0011-branch-node-composition.md:68-75`(정본), `open-questions.md:37`
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:31` E-4; 현행 유지), 편집자 결정(17라운드 노드 구조 수렴, `adr/0011-branch-node-composition.md:9`; 값 행)
- 라운드: 17
- 까닭: `reviews/round-10-owner-answers.md:31`

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
- 상태: 열림(→ `reviews/round-18-agenda.md` §9, :109)
- 출처: `adr/0011-branch-node-composition.md:95-97`(정본)
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:109`)
- 라운드: 17
- 까닭: `reviews/round-18-agenda.md:109`

### NODE-038 `emit`의 키 순서(Q14)가 18라운드 안건으로 이관됨

- 결정:
  > **emit의 키 순서**(Q14). 스키마 선언 순서로 낼 것인가, 비용은 얼마인가.
- 보충: 없음
- 상태: 열림(→ `reviews/round-18-agenda.md` §6, :79)
- 출처: `adr/0011-branch-node-composition.md:98`(정본)
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:79`)
- 라운드: 17
- 까닭: `reviews/round-18-agenda.md:79`

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
- 상태: 열림(→ `reviews/round-18-agenda.md` §9, :112)
- 출처: `adr/0011-branch-node-composition.md:94#6`(정본)
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:112`)
- 라운드: 17
- 까닭: `reviews/round-18-agenda.md:112`
