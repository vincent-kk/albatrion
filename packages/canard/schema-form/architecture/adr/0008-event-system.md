# ADR 0008 — 이벤트 시스템 개편: 통지 전용 척추

## 상태

| 항목 | 닫은 사람 | 라운드 |
| --- | --- | --- |
| ERROR-014 | 17라운드 스웜 수렴(편집자 결정) | 17 |
| EVENT-001 | 소유자 답(`00-goals.md:151` G7), 소유자 답(`00-goals.md:117` C3 세부 3), 편집자 결정(4라운드, `adr/0008-event-system.md:3`) | 4 |
| EVENT-002 | 편집자 결정(4라운드, 실행 검증을 통과한 제안, `adr/0008-event-system.md:3`·`reviews/round-4.md:77`) | 4 |
| EVENT-003 | 편집자 결정(4라운드, `reviews/round-4.md:135` F14) | 4 |
| EVENT-004 | 편집자 결정(1라운드 R17 명세 6항, `reviews/round-1.md:81`), 편집자 결정(4라운드, `reviews/round-4.md:169`) | 4 |
| EVENT-005 | 편집자 결정(4라운드, `reviews/round-4.md:90` V10) | 4 |
| EVENT-006 | 편집자 결정(4라운드, `reviews/round-4.md:141` F20), 편집자 결정(10라운드 5차 본문, `07-conclusions.md:96`·`adr/0008-event-system.md:13`) | 10 |
| EVENT-007 | 편집자 결정(4라운드, `reviews/round-4.md:137` F16·`reviews/round-4.md:85` V5) | 4 |
| EVENT-008 | 원리(`reviews/round-10-owner-answers.md:10` A-4, 상한을 두고 넘으면 오류로 알린다는 원칙), 편집자 결정(4라운드, `reviews/round-4.md:136` F15, 마지막 파동을 한 번 더 배달하고 되먹임만 거부), 편집자 결정(06 도출 D-17, `06-conclusions.md:158`; 10라운드 5차 본문 `adr/0008-event-system.md:13`·`07-conclusions.md:93`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-14) | 18 |
| EVENT-009 | 편집자 결정(4라운드, `reviews/round-4.md:90` V10) | 4 |
| EVENT-010 | 편집자 결정(4라운드, `reviews/round-4.md:142` F21·`reviews/round-4.md:90` V10), 편집자 결정(14라운드 O-5 위임, `reviews/round-14-owner-answers.md:11`), 17라운드 스웜 수렴(편집자 결정, `adr/0008-event-system.md:201`) | 17 |
| EVENT-011 | 편집자 결정(4라운드, `reviews/round-4.md:138` F17·`reviews/round-4.md:86` V6) | 4 |
| EVENT-012 | 편집자 결정(1라운드 R15, `reviews/round-1.md:79`), 편집자 결정(10라운드 5차 본문, `adr/0008-event-system.md:13`) | 10(예약 층 이름은 15라운드 표기) |
| EVENT-013 | 편집자 결정(4라운드, 실행 검증을 통과한 제안, `adr/0008-event-system.md:3`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-20) | 18 |
| EVENT-014 | 편집자 결정(4라운드, 실행 검증을 통과한 제안, `adr/0008-event-system.md:3`) | 4 |
| EVENT-015 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79,90`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-101) | 18 |
| EVENT-016 | 편집자 결정(4라운드, `reviews/round-4.md:139` F18), 편집자 결정(06 도출 D-17, 10라운드 5차 본문 `adr/0008-event-system.md:13`) | 10 |
| EVENT-017 | 편집자 결정(14라운드 O-5 위임, `reviews/round-14-owner-answers.md:11`), 편집자 결정(17라운드, ADR 0014 4판 채택) | 17 |
| EVENT-018 | 편집자 결정(4라운드, `reviews/round-4.md:139` F18) | 4 |
| EVENT-019 | 편집자 결정(06 도출 D-13, `06-conclusions.md:134`; 10라운드 5차 본문 `adr/0008-event-system.md:13`·`07-conclusions.md:91`) | 10 |
| EVENT-020 | 편집자 결정(06 N4, 10라운드 5차 본문 `adr/0008-event-system.md:13`), 편집자 결정(17라운드, ADR 0014 4판 채택) | 17 |
| EVENT-021 | 편집자 결정(06 도출 D-16·D-31, `06-conclusions.md:150`; 10라운드 5차 본문 `adr/0008-event-system.md:13`·`07-conclusions.md:92`) | 10 |
| EVENT-022 | 편집자 결정(06 도출 D-16, `06-conclusions.md:150-151`; 10라운드 5차 본문 `adr/0008-event-system.md:13`) | 10 |
| EVENT-023 | 편집자 결정(4라운드, `adr/0008-event-system.md:12`) | 4 |
| EVENT-024 | 편집자 결정(4라운드, `reviews/round-4.md:140` F19·`reviews/round-4.md:149` F28) | 4 |
| EVENT-026 | 소유자 답(`reviews/round-4.md:116` D-10) | 4 |
| EVENT-027 | 편집자 결정(5라운드 도출 C-9, `reviews/round-5-derivations.md:24`), 편집자 결정(10라운드 5차 본문, `adr/0008-event-system.md:13`) | 10 |
| EVENT-028 | 소유자 답(`reviews/round-14-owner-answers.md:12` O-6) | 14 |
| EVENT-029 | 편집자 결정(5라운드 도출 C-9, `reviews/round-5-derivations.md:24`), 편집자 결정(10라운드 5차 본문, `adr/0008-event-system.md:13`) | 10 |
| EVENT-030 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79,90`) | 16 |
| EVENT-031 | 편집자 결정(10라운드 5차 본문, `adr/0008-event-system.md:13`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-50) | 18 |
| EVENT-032 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79,89`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-101) | 18 |
| EVENT-033 | 편집자 결정(5라운드 도출 C-9, `reviews/round-5-derivations.md:24`), 편집자 결정(10라운드 5차 본문, `adr/0008-event-system.md:13`) | 10 |
| EVENT-034 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 편집자 결정(17라운드, ADR 0014 4판 채택) | 17 |
| EVENT-035 | 편집자 결정(5라운드 도출 C-8, `reviews/round-5-derivations.md:23`) | 5 |
| EVENT-036 | 편집자 결정(5라운드 도출 C-10, `reviews/round-5-derivations.md:25`) | 5(예약 층 이름은 15라운드 표기) |
| EVENT-037 | 소유자 답(`reviews/round-4.md:115` D-9) | 4 |
| EVENT-039 | 편집자 결정(5라운드 도출 C-11, `reviews/round-5-derivations.md:22`), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79,85`) | 16 |
| EVENT-040 | 소유자 답(`reviews/round-4.md:115` D-9), 편집자 결정(5라운드 도출 C-11, `reviews/round-5-derivations.md:22`) | 5 |
| EVENT-041 | 편집자 결정(5라운드 도출 C-11, `reviews/round-5-derivations.md:22`) | 5 |
| EVENT-042 | 편집자 결정(4라운드, `reviews/round-4.md:128` F7) | 4 |
| EVENT-043 | 편집자 결정(06 도출 N4·4.9, `06-conclusions.md:360`; 10라운드 5차 본문 `adr/0008-event-system.md:13`) | 10 |
| EVENT-044 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 17라운드 스웜 수렴(편집자 결정, `adr/0008-event-system.md:201`) | 17 |
| EVENT-047 | 편집자 결정(10라운드 5차 본문, `adr/0008-event-system.md:13`) | 10 |
| EVENT-058 | 편집자 결정(17라운드, ADR 0014 4판 채택) | 17 |
| REACT-006 | 편집자 결정(16라운드, `09-landing-and-test-strategy.md:46`) | 16 |
| REACT-019 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79`) | 16 |
| REACT-025 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79`) | 16 |

## 결정

### 03-settle-and-events.md §2.1 통지의 역할과 시점

이벤트 시스템을 **통지 전용**으로 다시 정의한다(EVENT-001). 역할은 셋이다(B1)(EVENT-001).

1. **상태 통지** — 작업 루프의 커밋 뒤에 1회 방출한다(SETTLE-001, EVENT-001). 구독자는 언제나 정착된 상태만 본다(EVENT-001).
2. **`revision(mask)` 원장** — 리스너 유무와 무관한 단조 카운터(EVENT-001). `useSyncExternalStore` 스냅숏으로 쓰는 현재 방식(`hooks/useSchemaNodeTracker.ts:36-49`)은 유지한다(EVENT-001).
3. **명령 시그널** — `RequestFocus`/`RequestSelect`/`RequestRefresh`/`RequestRemount`처럼 상태가 아니라 표현 계층에 대한 요청인 것(EVENT-001). 렌더러와 무관한 어휘로 core에 남는다(`open-questions.md` Q8 닫힘)(EVENT-001).

유지: `node.subscribe()`, 이벤트 타입 비트마스크, `revision`, 비제어 입력 계약(입력이 값을 다시 읽게 하는 것은 `RequestRefresh` 하나)(EVENT-001).

바뀜: 내부 상태 전이가 이벤트를 타지 않는다(EVENT-001). 배치의 단위가 "통지"에서 "쓰기 묶음 → 정착 1회 → 통지 1파동"으로 올라간다(EVENT-001). 동기 발행과 배치 발행의 혼용이 사라진다(EVENT-001).

**목표 G5(한 장으로 설명되는 라이프사이클) ↔ 목표 G7(반응의 척추를 보존한다).**(EVENT-001, GOAL-009, GOAL-012) 이벤트가 내부 상태를 움직이지 않게 되는 것은 척추를 없애는 것이 아니다(EVENT-001). 구독·시그널링·`revision`은 남고, 바뀌는 것은 "내부 로직은 이벤트를 구독하지 않는다" 하나다(EVENT-001).

**규칙 하나.**(EVENT-002) 쓰기 하나는 동기로 정착하고 동기로 통지한다(EVENT-002). 배치는 그 끝에 한 번 그렇게 한다(EVENT-002). 마이크로태스크 배치는 없고 별도의 "즉시" 옵션도 없다(EVENT-002). 배열 연산은 동기이며 Promise를 돌려주지 않는다(제약 T-7(배열 연산은 동기다), EVENT-002, GOAL-058).

노드에는 "이번 정착에서 켜진 이벤트 타입"의 비트마스크, 타입별 payload, `revision` 원장만 남고 스케줄링은 하지 않는다(EVENT-004). 대량 쓰기로 노드 1,000개가 바뀌어도 순회는 하나이고 무한 루프 감지도 한 곳에서 한다(EVENT-004).

기록: 중간(EVENT-047). `subscribe`와 이벤트 타입은 공개 API다(EVENT-047). 통지 시점, 배달 순서(루트 쓰기의 깊이 순서가 뒤집힌다), 배열 연산의 동기화, `onChange` 호출 횟수는 모두 소비자의 타이밍 가정에 영향을 준다(EVENT-047). `payload.previous`의 뜻이 "직전 커밋"에서 "마지막으로 통지한 값"으로 바뀌는 것도 관측 가능한 변화다(EVENT-047). 값이 같아도 유효 스키마가 바뀐 노드에 통지가 가는 것, 모든 환경의 예산 초과 throw, `diagnostics`의 모양도 소비자에게 보이는 표면이다(EVENT-047, ERROR-070, ERROR-071).

### 03-settle-and-events.md §2.2 배달 순서와 파동

(EVENT-005, EVENT-006, EVENT-007, EVENT-008, EVENT-009, EVENT-010, EVENT-066, ERROR-142, ERROR-164, ERROR-099)

| # | 규칙 | 판정과 개정 |
| - | ---- | ----------- |
| 1 | **순서** — 계산 순회에서 얻는 문서 순서의 위 → 아래. 값 변화 없이 시그널만 가진 노드는 뒤에 publish 순서로 | 통과(V10). 현재의 루트 쓰기 순서를 뒤집으므로 소비자에게 보이는 변경 |
| 2 | **배달 집합** — (이번 커밋에서 `local`·`emit`·`diagnostics`가 바뀐 노드) ∪ (시그널 비트가 대기 중인 노드) ∪ (**활성 여부가 바뀐 노드**, 값이 같아도) ∪ (**유효 스키마가 바뀐 노드**, 값이 같아도) ∪ (이번 커밋에서 상호작용 상태가 바뀐 노드) ∪ (이번 커밋에서 경로가 바뀐 노드) | F20. `cat` → `dog` 뒤 `meow`처럼 emit이 그대로인 비활성화를 자식 구독자가 모르는 구멍을 막는다. 유효 스키마 항은 5차에서 더했다(EVENT-006, SCHEMA-007): 게이트를 가진 조각이 켜지거나 꺼지면 그 조각이 덧씌운 노드는 값이 같아도 제약이 바뀌므로 배달한다. 유효 스키마는 그 노드에 얹힌 켜진 조각의 집합(덧씌움 집합)으로 메모하며, 같은 집합이면 같은 참조를 돌려준다. 파동 중 고정 집합 내 노드로 온 시그널은 다음 파동 |
| 3 | **원장** — `revision`은 **커밋 시 배달 집합 전체를 한 번에** 올린다 | F16. 이전 본문의 "리스너 직전에 올린다"를 뒤집는다. 노드마다 직전 bump는 리스너의 `flushSync`에서 커밋 2회·렌더 2,000회, 일괄은 커밋 1회·렌더 1,000회이고 stale은 둘 다 0이었다(V5) — 본문이 적었던 "미리 올리면 stale"은 재현되지 않았다 |
| 4 | **파동** — 고정된 집합을 순회한다. 리스너 안의 쓰기(**리스너 되먹임**)는 즉시 동기로 정착·커밋되고 그 통지는 현재 파동이 끝난 뒤 다음 파동이다. 같은 파동의 리스너가 같은 것을 본다는 보장은 **payload에 한정**한다 — `node.value`는 현재 커밋을 돌려준다 | 상한은 **최외곽 진입의 되먹임 사슬당 25**다(EVENT-008). 사슬은 최외곽 진입 하나(EVENT-027)의 통지에서 리스너 되먹임이 이어 낸 파동들이며, 세는 것은 되먹임이 낸 파동뿐이다. 상한에 닿으면 마지막 파동을 한 번 더 배달하되 **그 파동의 리스너 되먹임만 거부**하고 `diagnostics`에는 남기지 않으며 사슬 끝에서 던진다. **사용자 입력과 호출자 쓰기는 결코 거부하지 않는다**(WRITE-001, 원리 P2(원본은 호출자와 작성자만 쓴다)). 거부하므로 통지되지 않은 쓰기가 없고 트리와 DOM이 어긋나지 않는다. 그 뒤의 진행은 EVENT-021의 "예산 초과"를 따른다. 2라운드 S10의 모순은 "보장은 payload에 한정"으로 닫힌다 |
| 5 | **분리된 노드** — 배달 전에 트리에서 떨어진 노드는 건너뛰고 대기 비트를 지운다 | 통과(V10) |
| 6 | **격리** — 리스너 호출을 하나씩 격리한다. 배달은 계속하고, 모은 예외는 배달을 끝낸 뒤 사슬 끝에서 던진다(하나면 원래 값 그대로, 둘 이상이면 `SchemaFormError` 하나의 `details.errors`에 발생 순서대로 담는다, 모든 환경). 기록마다 Form 속성 `onError`에 보낸다(가칭 `onListenerError`는 `onError`에 흡수되었다, ERROR-005, ERROR-099) | F21. `subscribe`는 공개 API이므로 소비자 코드 한 줄이 폼 전체를 멈출 수 있다 |

**리스너 되먹임의 판별.**(EVENT-008) 리스너 되먹임은 파동을 배달하는 동안 리스너 호출 안에서 일어난 쓰기다(EVENT-008). 그 쓰기는 바깥 쓰기의 호출 스택 안에서 돌므로 진입 깊이가 2 이상이고(`spikes/work-loop/REPORT-v4c.txt` §1), 새 진입이 아니라 같은 최외곽 진입의 사슬에 속한다(EVENT-008). 호출자가 리스너 밖에서 부른 쓰기는 새 진입이므로 이 상한에 걸리지 않는다(EVENT-008).

상한은 **최외곽 진입이 끝날 때**(깊이 1 → 0) 초기화하며 **미루지 않는다.**(EVENT-008) 틱을 단위로 하면 측정상 리스너 없이 25번째, 권장 스토어 리스너를 붙이면 13번째 호출자 쓰기에서 상한에 닿아 호출자의 `setValue`가 조용히 버려지고, 틱은 타이밍이므로 목표 G5(한 장으로 설명되는 라이프사이클)에 어긋난다(EVENT-008, GOAL-009). 진입 사슬의 되먹임만 세면 같은 30회 쓰기가 내내 상한에 닿지 않는다(EVENT-008). 미루고 초기화하는 현재 방식(`EventCascadeManager.ts:110-116`)은 같은 입력을 틱마다 다시 돌리므로, 그대로 두면 현재의 결함을 재현한다(제약 T-4(순환은 상한에서 멈춘다), EVENT-008, GOAL-055).

【추론】 함수 안의 쓰기: 다른 노드에 쓰는 정해진 길은 반환이다(EVENT-008). 【추론】 함수 안에서 폼의 공개 쓰기 API(`setValue`·`push`·`pop`·`update`·`remove`·`clear`·`batch`, EVENT-027)를 부르면 리스너 되먹임 쓰기와 같게 다룬다(EVENT-008). 【추론】 그 쓰기를 오류로 막지 않는다(EVENT-008). 【추론】 바깥 쓰기가 호출 스택에 있으므로 새 진입이 아니라 안쪽 진입이다(EVENT-008, EVENT-027). 【추론】 그 쓰기는 지금 파동이 끝난 뒤에 돈다(EVENT-008). 【추론】 리스너 되먹임과 같은 되먹임 예산(최외곽 진입의 되먹임 사슬당 25, EVENT-008)에 든다(EVENT-008). 【추론】 넘으면 되먹임 초과와 같게 사슬 끝에서 던진다((가칭) `SCHEMA_FORM_ERROR.FEEDBACK_LIMIT_EXCEEDED`, ERROR-164)(EVENT-008). 【추론】 정착 중에 사용자 코드가 쓰는 장치는 이것 하나다(목표 G4(하나의 개념에는 하나의 장치), GOAL-006)(EVENT-008).

소유자: "루프의 가능성을 제한하지는 않는다. … 그 상한값을 초과하면 적절한 error를 표시한다. 이는 react의 hook과 동일한 설계를 갖는다." 그리고 "구태여 막지 않을 뿐이지 루프를 만드는 걸 권하는 설계는 절대 아니다."(EVENT-008).

**리스너 목록은 파동 시작 시점에 고정한다**(F17)(EVENT-011). 파동 중 구독한 리스너는 다음 파동부터 받고 놓친 것은 `revision`으로 따라잡으며(제약 T-6(늦은 구독자는 놓친 것을 알 수 있다), GOAL-057), 파동 중 해지된 리스너는 부르지 않는다(현재 코드와 같다)(EVENT-011). 이것으로 소비자의 `flushSync`가 가상화 reveal 커밋을 파동 안으로 끌어들일 때 안쪽 컨트롤이 명령을 2회 받던 문제가 사라진다(V6)(EVENT-011).

【추론】 `controls.resetInteraction`이 커밋에서 바꾼 `dirty`·`touched`는 그 정착 파동의 배달 집합에 든다(EVENT-066). 【추론】 EVENT-006 규칙 2에 항 하나를 더하는 것이다: "(이번 커밋에서 상호작용 상태가 바뀐 노드)"(EVENT-066). 【추론】 커밋에서 경로가 바뀐 노드는 그 정착 파동의 배달 집합에 든다(규칙 2에 항 "(이번 커밋에서 경로가 바뀐 노드)"를 더한다)(EVENT-066).

### 03-settle-and-events.md §2.3 값과 스키마, 경로의 통지

`UpdateValue`의 payload는 커밋 시점의 `{previous, current}`이며 호스트는 `local`과 `emit`을 둘 다 싣는다(EVENT-023).

- `previous`는 **그 노드에 마지막으로 통지한 값**이다(EVENT-024). 파동 안의 중간 커밋은 payload로 관측되지 않으므로 `{previous, current}`가 체인을 이룬다(F19)(EVENT-024).
- 커밋에는 `revision`과 별개의 단조 **커밋 번호**가 있고 검증 스탬프는 커밋 번호를 쓴다 — 같은 `revision`으로 찍힌 서로 다른 커밋을 비동기 검증이 식별하지 못하던 반례(V13)의 처방이다(F28)(EVENT-024).
- payload는 **불변**이다(EVENT-024). 개발 모드에서 `Object.freeze`하며, 리스너의 변조가 다음 리스너에 보이지 않는다(F28)(EVENT-024).

나. 출처 칸을 둔다(EVENT-060). 이름과 값 목록은 편집자가 정한다(통지는 사실만 싣는다: 쓰기 종류의 출처 — 입력·자동 쓰기(derived·injectTo·default 채움·trim)·로드)(EVENT-060). 소유자가 든 쓰임은 derived가 발화한 입력을 다르게 표시하는 것이다(EVENT-060). 【추론】 쓰기 종류의 목록(VALUE-032)과 `UpdateValue` 출처 칸의 값(EVENT-060)에 '호출자 전체 교체'(`setValue(V)`)를 더한다(EVENT-060).

【추론】 유효 스키마 변경은 이벤트 타입 하나로 싣는다(EVENT-064). 【추론】 가칭은 `UpdateJsonSchema`다(`UpdateValue`↔`value`처럼 공개 읽기 `node.jsonSchema`를 따른 이름)(EVENT-064). 【추론】 커밋에서 노드의 메모된 유효 스키마 참조가 그 노드에 마지막으로 통지한 것과 다를 때 켜진다(EVENT-064). 【추론】 같은 덧씌움 집합이면 같은 참조이므로 참조 비교로 충분하다(EVENT-064). 【추론】 EVENT-006 배달 집합의 "유효 스키마가 바뀐 노드" 항이 이 비트다(EVENT-064). 【추론】 트리 생성(마운트·재생성)에서는 통지하지 않는다(EVENT-064). 【추론】 같은 스키마의 `FormHandle.reset()`·`resetSubtree()` 로드와 `setValue` 전체 교체 쓰기에서 바뀌면 통지한다(EVENT-064, WRITE-090). 【추론】 payload는 `{ previous, current }`이며 둘 다 유효 스키마 참조이고 복사하지 않는다(EVENT-064). 【추론】 `previous`는 마지막으로 통지한 것이다(EVENT-064, EVENT-024). 【추론】 개발 모드 `Object.freeze`는 payload 객체에만 한다(EVENT-064). 【추론】 유효 스키마는 작성자 객체를 참조로 옮겨 쓸 수 있기 때문이다(EVENT-064). 【추론】 출처 칸은 없다(EVENT-064). 【추론】 12-5의 출처는 `UpdateValue`의 쓰기 출처이고, 유효 스키마 변경은 쓰기가 아니다(EVENT-064). 【추론】 렌더 계층은 `SchemaNodeProxy`의 재렌더 마스크에 이 비트를 더한다(EVENT-064). 【추론】 계산 상태(`active`·`visible`·`readOnly`·`disabled`·`watchValues`)의 비트와는 따로 둔다(EVENT-064). 【추론】 오늘의 내부 `UpdateComputedProperties`(`src/core/types/event.ts:63`)가 계산 상태 쪽 비트다(EVENT-064).

【추론】 비트는 `UpdatePath`, payload는 오늘처럼 `{ previous, current }`다(EVENT-068). 【추론】 재인덱싱된 아이템의 자손도 포함한다(오늘 `__updatePath__`의 재귀와 같다)(EVENT-068). 【추론】 오늘처럼 공개 이벤트 형(오늘 `NodeEventType`, 곧 `PublicNodeEventType` 여섯)에는 넣지 않는다(EVENT-068). 【추론】 렌더 계층은 입력을 다시 그리는 사건 집합에 이 비트를 더한다(EVENT-068). 【추론】 입력의 `path`·`name` prop과, 경로를 키로 쓰는 맵(첨부 파일 맵, `useChildNodeErrors`의 상태 맵)이 새 경로를 따라가게 하기 위해서다(EVENT-068).

### 03-settle-and-events.md §2.4 예산 초과와 진단

**예산은 다섯이며 서로 다른 것을 센다**(EVENT-020). 이름은 EVENT-043의 `exceededBudget` 값이며, 17라운드에 정착의 세 예산만 남겼다(ERROR-130)(EVENT-020). 재귀 펼침의 멈춤이 `exceededBudget` 값 (가칭) `'recursion'`을 더한다(EVENT-020, ERROR-190). 재귀 펼침의 멈춤이 예산 부류의 정착 오류로 더해져 `exceededBudget` 값은 정착 예산 셋에 (가칭) `'recursion'`을 더한 넷이다(EVENT-020, ERROR-190).

(EVENT-020)

| 예산 | 세는 것 | 상한 | `exceededBudget` |
| ---- | ------- | ---- | ---------------- |
| 호스트 바퀴 | 조각 집합이 안 바뀔 때까지 게이트를 다시 평가하는 횟수 | 게이트 가진 조각 수 + 노드 게이트 수 + 1 | `hostWheel` |
| 파생 라운드 | `controls.derived`·`controls.injectTo`·`controls.unsetValue`의 적용 라운드 | 25 | `derive` |
| 전이 라운드 | 생긴 노드에 채움을 넣고, 나감 정책이 참으로 정해진 나간 노드를 비우고 다시 도는 라운드 | SETTLE-005가 소유한다 | `transition` |
| 리스너 되먹임 파동 | 최외곽 진입의 사슬에서 되먹임이 낸 파동(EVENT-008) | 25 | 없음(`diagnostics`에 남기지 않는다) |
| `onChange` 중첩 | `onChange` 안의 쓰기가 연 새 진입의 중첩(EVENT-033, EVENT-034) | 25 | 없음(`diagnostics`에 남기지 않는다) |

5차의 이름 항목(`transitionDefaults`를 `nodeCreationDefaults`로 바꿀지, SURFACE-007)은 ERROR-130이 값을 `'transition'`으로 적어 닫혔다(EVENT-058). **`exceededBudget`의 `transitionDefaults` 이름** — 닫힘(EVENT-058). ERROR-130이 값을 `'hostWheel'`·`'derive'`·`'transition'` 셋으로 적었다(EVENT-043)(EVENT-058).

어느 예산을 넘겨도 그 진입은 개발 모드와 프로덕션 모두 **커밋 → 검증 요청 → `onChange`** 순서로 진행한다(EVENT-021). 예외는 `onChange` 중첩 예산 하나로, 넘긴 그 `onChange`만 부르지 않는다(EVENT-021, EVENT-034). 정착의 예산(호스트 바퀴·파생·전이)을 넘기면 그 정착의 자동 쓰기를 모두 뺀 원본 B를 커밋하고(SETTLE-011), 리스너 되먹임 예산을 넘기면 거부된 되먹임 없이 커밋이 이어진다(EVENT-021).

throw가 그 진입의 `onChange`와 검증 요청을 건너뛰게 하지 않는다 — D-10이 없앤 것이 바로 개발 모드와 프로덕션의 관측 차이였다(EVENT-022). 6라운드 검증 #11의 처방은 기각이다(EVENT-022, PROCESS-048).

소유자(4라운드 D-10): "**(c) 한 수정에 정확히 한 번.**"(EVENT-022).

예산 초과를 비롯한 정착의 결과 상태는 한 칸, 한 이벤트, 한 속성으로 관측한다(EVENT-043). `onChange`에 싣지 않는다 — emit 참조가 바뀌지 않은 쓰기는 `onChange`를 내지 않으므로 예산 초과가 보이지 않기 때문이다(목표 C2(작성자 실수의 가시성), EVENT-043, GOAL-015).

(EVENT-043, EVENT-044)

| 자리 | 이름 |
| ---- | ---- |
| 이벤트 | `UpdateDiagnostics` — `diagnostics`가 바뀐 커밋에만 낸다(EVENT-043) |
| Form 속성 | `onDiagnosticsChange` — 호스트가 진단 상태를 관측하는 자리(EVENT-044). 제출 거부는 `<Form>`이 한다(EVENT-044) |
| Form 속성 | `onError` — 원인 오류의 기록을 받는 관찰자(ERROR-001). 끄는 스위치 `throwOnBudgetExceeded`는 없다 |

삼중 짝은 `state` / `UpdateState` / `onStateChange`와 같은 모양이다(EVENT-043). 4차 본문에 흩어져 있던 리터럴 셋(`budget-exceeded`, `wave-cap-exceeded`, `onchange-cap-exceeded`)과 칸 이름 `settle`이 이 한 모양으로 모인다(원리 제안 P7(예산은 한 칸에 같은 모양으로 관측된다), EVENT-043, GOAL-083). 리터럴은 코드 관례대로 camelCase다(EVENT-043).

### 03-settle-and-events.md §2.5 상태와 정착 밖 사건

**상태 칸의 쓰기는 원본 쓰기가 아니다**(R15, SETTLE-001)(EVENT-012). `setState`형 쓰기(`dirty`·`touched`)와 명령 시그널은 원본을 바꾸지 않으므로 정착의 입력도, EVENT-027의 진입도, 예약 층의 자동 쓰기(채움·`controls.derived`·`controls.injectTo`·`controls.unsetValue`·나감의 비움)도 아니다(EVENT-012).

(EVENT-045, EVENT-046, EVENT-064)

| 사건 | 배달 |
| --- | --- |
| 상태 변경(`dirty`·`touched`), 외부 오류 설정·지움, 명령(`focus`·`select`·`refresh`·`remount`) | 정착을 거치지 않는 사건이다. 같은 루트 디스패처가 **같은 진입 규칙**으로 배달한다. 최외곽 진입의 끝에서 한 번, 명령은 즉시 재발행 통로를 유지한다(`DeferrableNodeProxy`가 오늘 하는 것) |
| 유효 스키마 변경 | 정착 파동의 배달 집합에 든다(EVENT-006). 비트는 `UpdateJsonSchema`(가칭)다 |
| 검증 결과 | 약속이 풀린 뒤 커밋 번호 스탬프를 검사해 최신이면 **자기 파동**으로 오류 갱신을 배달한다. 정착 파동에 끼워 넣지 않는다. 늦은 결과는 버린다(VALIDATE-006). 이 파동의 리스너 예외는 `onError`에 한 번, 이어 주인 없는 오류 싱크로 한 번 드러나며 미처리 거부로 남기지 않는다(ERROR-039의 `OnChange` 검증 실행 실패와 같은 표면, 17라운드 스웜 수렴(편집자 결정)) |

【추론】 `globalState`는 누적하지 않고 트리에서 유도한다(EVENT-062). 【추론】 키 k가 참인 것은 형상에 있는 노드 가운데 하나라도 `state[k]`가 참인 때뿐이다(EVENT-062). 【추론】 `globalState`는 참인 노드가 하나 이상인 키만 담고 값은 `true`다(EVENT-062). 【추론】 수가 0이면 키가 빠진다(EVENT-062). 【추론】 런타임은 키마다 참인 노드의 수를 든다(EVENT-062). 【추론】 수는 노드 상태가 바뀔 때와 노드가 형상에 들고 날 때 O(1)로 고친다(EVENT-062). 【추론】 어느 키의 수가 0과 1 사이를 넘을 때만 `globalState` 객체를 새로 짓고 `UpdateGlobalState`를 낸다(EVENT-062). 【추론】 그 밖에는 같은 참조를 돌려준다(EVENT-062). 【추론】 결과로 `dirty`가 내려간다(EVENT-062). 【추론】 모든 노드의 `dirty`가 풀리거나 비루트 노드에서 `clearSubtreeState()`를 불러도 내려간다(EVENT-062).

【추론】 `setState`가 바꾼 `dirty`·`touched`는 EVENT-045(16라운드 답 3)대로 정착을 거치지 않는 사건이다(EVENT-067, EVENT-045). 【추론】 같은 루트 디스패처가 같은 진입 규칙으로, 최외곽 진입의 끝에서 한 번 배달한다(EVENT-067). 【추론】 비트는 오늘과 같은 `UpdateState`다(EVENT-067). 【추론】 한 진입 안에서 두 경로가 같은 노드를 바꾸면 비트는 합쳐져 그 노드에 한 번 배달된다(EVENT-067). 【추론】 `onStateChange`는 최외곽 진입의 끝에서 한 번 부른다(EVENT-067).

### 03-settle-and-events.md §2.6 배치의 경계와 값 읽기

`batch(fn)`은 fn 안의 쓰기를 표시만 하고, fn이 끝날 때 정착 한 번·파동 한 번을 낸다(EVENT-013).

**배치는 정착 횟수를 바꾸므로 값이 순차 호출과 다를 수 있다**(EVENT-019). 정착이 출발할 때 예약 층 규칙의 에지 기준점은 직전 커밋이고, 채움은 노드가 생길 때 한 번이다(EVENT-019). 그래서 순차 호출에서 첫 정착이 커밋한 값은 뒤 정착이 덮지 않지만, `batch`로 묶으면 정착이 한 번이라 중간 상태가 커밋되지 않는다(EVENT-019). 반례 E2: 분기 A는 `x`에 `default` `'A'`, 분기 B는 `'B'`일 때, `kind`를 `a`로 쓴 뒤 `b`로 쓰면 순차는 `x = 'A'`, 같은 두 쓰기를 `batch`로 묶으면 `x = 'B'`다(노드 단위 채움에서도 같다, 실행)(EVENT-019). 채움과 `controls.injectTo`의 결과가 이렇게 갈리는 것은 결함이 아니라 축의 귀결이며, `batch`의 문서 주석에 "배치는 정착 횟수를 바꾸므로 채움과 `controls.injectTo`의 결과가 순차 호출과 다를 수 있다"를 적는다(EVENT-019). 같게 만드는 길은 셋(배치 안에서도 쓰기마다 정착, 원본마다 출처 기록, 통지된 값의 철회)이고 모두 목표 G7(반응의 척추를 보존한다)·원리 P3(형상은 상태의 순수 함수다)·원리 P2(원본은 호출자와 작성자만 쓴다)와 부딪친다(EVENT-019, GOAL-012, GOAL-029, GOAL-028).

【추론】 `batch(fn)` 안에서 updater는 이어진다(EVENT-061). 【추론】 같은 노드에 `setValue(p => p + 1)`을 두 번 부르면 2가 더해진다(EVENT-061). 【추론】 updater 꼴이 호출자에게 기대하게 하는 결과다(EVENT-061). 【추론】 updater의 `prev`는 직전 커밋에, 이 배치에서 앞서 표시된 쓰기 가운데 그 노드의 서브트리에 닿은 것을 순서대로 얹은 값이다(EVENT-061). 【추론】 잎의 `prev`는 이 배치에서 그 노드에 마지막으로 표시된 원본(`interpret`를 지난 값)이다(EVENT-061). 【추론】 표시가 없으면 직전 커밋이다(EVENT-061). 【추론】 가지의 `prev`는 커밋된 값에 그 서브트리의 표시들을 경로별로 덮어 얹은 값이다(EVENT-061). 【추론】 정착의 의미는 적용하지 않는다(EVENT-061). 【추론】 채움, `derived`, 투영은 `prev`에 들지 않고, `fn`이 끝난 뒤 정착에서 한 번 적용된다(EVENT-061). 【추론】 updater는 부른 자리에서, 그 쓰기를 표시하는 동안 실행된다(EVENT-061). 【추론】 정착 때 실행하지 않는다(EVENT-061). 【추론】 updater가 던지면 그것은 `fn`의 예외다(EVENT-061). 【추론】 ERROR-004의 진입 규칙대로 모아 두었다가 사슬 머리가 끝날 때 던진다(EVENT-061, ERROR-004). 【추론】 정착 오류가 되지 않는다(EVENT-061). 【추론】 `fn` 안의 평범한 읽기(`value`, `outputValue`, `inactiveValues`, `FormHandle.getValue()`)는 여전히 직전 커밋을 돌려준다(EVENT-061). 【추론】 읽기는 계산하지 않기 때문이다(EVENT-061, VALUE-013). 【추론】 가지의 덮어 얹기는 updater라는 쓰기의 일부이며 읽기가 아니다(EVENT-061). 【추론】 `batch` 밖에서는 두 규칙이 겹친다(EVENT-061). 【추론】 쓰기마다 정착하므로 `prev`는 직전 커밋, 곧 `value`다(EVENT-061). 【추론】 그래서 SURFACE-031의 "`prev`는 `value`다"는 `batch` 밖에서 그대로 맞고, `batch(fn)` 안에서는 이 블록의 규칙이 이긴다(EVENT-061, SURFACE-031). 【추론】 `fn` 안에서 `reset`을 부르면 그 로드는 호출 안에서 곧바로 정착하고, 앞서 표시된 쓰기를 덮는다(EVENT-061, EVENT-015). 【추론】 그래서 그 뒤의 읽기와 updater의 기준은 reset의 커밋이다(EVENT-061). 【추론】 비용은 `batch` 안에서 updater를 부를 때만 든다(EVENT-061). 【추론】 잎은 원본 하나를 읽는다(EVENT-061). 【추론】 가지는 그 서브트리에 앞서 표시된 경로 수에 비례하는 조립이 든다(EVENT-061). 【추론】 평범한 읽기와 `batch` 밖의 쓰기에는 새 비용이 없다(EVENT-061). 【추론】 `batch` 문서 주석에 다음을 적는다: "fn 안의 쓰기는 표시만 되고 fn이 끝날 때 한 번 정착한다. fn 안의 updater `setValue(prev => …)`는 부른 자리에서 실행되고, 앞선 쓰기를 반영한 `prev`를 받아 이어진다(같은 노드에 +1을 두 번 하면 +2). updater가 던지면 fn의 예외로 다뤄진다. 그 밖의 읽기(`value`·`outputValue`·`inactiveValues`·`getValue()`)는 직전 커밋을 돌려준다. 채움·`derived`·투영은 정착에서 적용되므로 `prev`에 들지 않는다. 채움과 `injectTo` 때문에 배치의 결과는 순차 호출과 다를 수 있다."(EVENT-061).

중첩 `batch`는 가장 바깥이 이긴다(EVENT-014).

`fn` 안의 `reset`은 경로와 무관하게 그 로드를 곧바로 정착한다(로드는 새 수명이라 앞서 표시된 쓰기를 덮고, 재생성 경로에서는 새 루트를 세우는 정착이다)(EVENT-015). `fn`의 나머지 쓰기 묶음은 그대로 끝에서 정착 한 번이며, `reset`의 커밋은 따로 파동을 내지 않고 `fn` 끝의 파동 한 번에 합류하며(두 커밋에서 바뀐 노드의 payload는 EVENT-024의 체인을 따른다. 리스너 안의 `reset`은 EVENT-008대로 다음 파동에 든다), 검증 요청과 `onChange`는 바깥 최외곽 진입의 끝에서 낸다(EVENT-030, 16라운드 스웜 수렴(편집자 결정))(EVENT-015, EVENT-024, EVENT-008). 【추론】 `batch` 안의 로드를 곧바로 정착하는 규칙(EVENT-015)은 `resetSubtree()`에는 그 하위 트리에만 적용한다(EVENT-015).

`batch(fn)`·`onChange`·리스너 안의 reset은 경로와 무관하게 그 로드를 호출 안에서 곧바로 정착한다(로드는 새 수명이라 앞서 표시된 쓰기를 덮는다)(EVENT-015).

【추론】 로드 뒤 `OnChange` 비트면 한 번 하는 검증(LANDING-041, ERROR-040, EVENT-032)은 `resetSubtree()`에는 그 하위 트리에만 적용한다(EVENT-072). 【추론】 `batch` 안의 로드를 곧바로 정착하는 규칙(EVENT-015)은 `resetSubtree()`에는 그 하위 트리에만 적용한다(EVENT-072). 【추론】 `VALIDATOR_COMPILE_FAILED`는 폼 수준 기록이다(WRITE-099, EVENT-072). 【추론】 그 기록은 폼 수준 로드(마운트, `FormHandle.reset()`)마다 한 번 내고, `resetSubtree()`는 그 기록을 다시 내지도 초기화하지도 않으며, 그 기록이 막은 `OnChange` 검증 예약은 다음 폼 수준 로드까지 막힌 채다(EVENT-072, WRITE-099). 【추론】 "로드마다 다시 만든다"(VALUE-030)는 `resetSubtree()`에는 그 하위 트리에만 적용한다(EVENT-072).

PR: PR-2(정착)·PR-4(검증)(EVENT-072).
무엇: `OnChange` 폼에서 `batch` 안과 밖에서 `resetSubtree()`를 부르고, 정착 시점, 검증 요청 수, 검증 불가 기록, 경고등 경로 집합을 본다(EVENT-072).
통과: 로드 규칙이 그 하위 트리에만 적용되고, 하위 트리 밖의 기록과 경로는 그대로다(EVENT-072, WRITE-099).
실패: 이 블록을 고친다(EVENT-072).

리스너 안의 `batch`는 바깥 배치의 표시 구간이 이미 끝난 뒤이므로 **자기 배치**다 — 자기 정착 한 번과 파동 한 번을 낸다(EVENT-016). 진입으로는 새 진입이 아니다(EVENT-016). 리스너 안이므로 진입 깊이는 2 이상이고, 그 쓰기는 EVENT-008의 리스너 되먹임으로 세어진다(EVENT-016, EVENT-008).

`batch`의 fn이 throw하면 표시된 쓰기는 정착·통지되고, 그 예외는 모아 두었다가 사슬 머리의 끝에서 던진다(안쪽 `batch`는 정상 반환한다, ERROR-004)(EVENT-017).

### 03-settle-and-events.md §2.7 진입과 검증 요청

**진입의 정의**(`spikes/work-loop/REPORT-v4c.txt` §1): 같은 루트의 다른 공개 쓰기 API가 호출 스택에 없는 상태에서 이루어진 한 번의 공개 쓰기 호출(EVENT-027). 공개 쓰기 API는 `setValue`·`push`·`pop`·`update`·`remove`·`clear`·`batch`이고(SURFACE-005, SURFACE-008), `reset`·`resetSubtree`·마운트는 그것을 거쳐 진입이 된다(EVENT-027). 프로토타입 목록의 `select`(분기 선택)는 폼이 분기를 고르지 않으므로 사라졌고(SURFACE-045, SURFACE-005), `write`는 입력의 `onChange`가 부르는 `setValue`에 흡수되며, `removeKey`는 `Merge`로 키에 `undefined`를 쓰는 것으로 대신한다(WRITE-010)(EVENT-027). 읽기·`subscribe`·상태 칸 쓰기(EVENT-012)는 진입이 아니다(EVENT-027, EVENT-012). 구현은 루트의 **진입 깊이 카운터**이며, 깊이가 1 → 0이 될 때 검증을 먼저 요청하고 그다음 `onChange`를 부른다(순서가 반대면 `onChange` 안의 쓰기가 만든 새 스탬프가 옛것에 밀린다)(EVENT-027).

진입 깊이는 루트별이므로 한 핸들러에서 쓴 두 폼은 두 진입이다(EVENT-029).

예외 하나: 열린 진입 안에서 재생성 경로의 `reset`이 만든 새 루트는 옛 루트의 진입 깊이와 배치의 표시 구간, 그 사슬의 되먹임 파동 수·`onChange` 중첩 수·모아 둔 오류를 이어받고, 옛 루트의 최외곽 진입이 끝날 때 새 루트의 검증 요청과 `onChange`를 낸다(EVENT-030). 옛 루트는 폐기되므로 표시된 쓰기를 정착하지 않고 파동도 검증 요청도 `onChange`도 내지 않으며, 새 루트의 커밋은 같은 자리의 쓰기가 받을 파동(EVENT-015, EVENT-008)에 합류한다(16라운드 스웜 수렴(편집자 결정))(EVENT-030).

검증 요청은 최외곽 진입당 1회이나 실행은 마이크로태스크에 모아 최신 커밋 번호 하나만 돌린다(14라운드 답 O-6. 늦은 결과를 버리는 스탬프 규칙과 같은 방향)(EVENT-028).

emit 참조가 바뀌지 않은 쓰기는 `onChange`도 검증 요청도 내지 않는다(EVENT-031). 【추론】 새로 만든 것이 직전 커밋의 것과 키 목록(순서 포함)도 같고 키마다의 자식 `emit` 참조도 같으면 직전 참조를 둔다(얕은 비교, 재계산 목록의 호스트만)(EVENT-031). 【추론】 그래서 EVENT-031·EVENT-006의 "emit 참조가 바뀜"은 "방출 값이 바뀜"과 같아진다(EVENT-031). 【추론】 `onChange`·배달·검증 요청은 참조 비교만으로 값 비교를 따른다(EVENT-031).

예외 하나: `reset`은 검증 결과를 비운 뒤 로드하므로 `ValidationMode`의 `OnChange` 비트가 켜져 있으면 emit 참조가 그대로여도 검증을 한 번 요청한다(EVENT-032). `onChange`는 이 예외에 들지 않는다(16라운드 스웜 수렴(편집자 결정))(EVENT-032). 【추론】 로드 뒤 `OnChange` 비트면 한 번 하는 검증(LANDING-041, ERROR-040, EVENT-032)은 `resetSubtree()`에는 그 하위 트리에만 적용한다(EVENT-032).

**C-8은 D-10의 정의 그대로다** — 형제 진입을 합치는 것은 `batch(fn)`뿐이며, 답은 배치 API의 공개와 문서다(EVENT-035).

### 03-settle-and-events.md §2.8 변경 알림과 이펙트

소유자 결정(2026-09-22, `reviews/round-4.md` §4): 디바운스의 목적은 파동이 여러 번 돌아도 `onChange`가 한 번만 불리고 비동기 검증기가 한 번만 요청되게 하는 것이었으며, 그 때문에 dev React와 prod React의 라이프사이클이 어긋나는 문제가 있었다(EVENT-026). 새 설계의 `onChange`는 **최외곽 동기 진입당 1회**, 그 진입의 마지막 파동 뒤에 최종 emit으로 부른다(EVENT-026). 디바운스는 없다(EVENT-026). 현재의 `afterMicrotask`(이름과 달리 매크로태스크 디바운스, 제약 T-9(루트 `onChange`와 OnChange 검증은 매크로태스크로 디바운스된다))는 사라지고 `useEffect`와의 경합도 사라진다(EVENT-026, GOAL-060). F31이 F22를 대체한다(EVENT-026).

`onChange` 안의 쓰기는 깊이 0에서 시작하므로 **새 진입**이다(EVENT-033). 중첩 상한은 25이며, 26번째는 쓰기를 적용하고 검증도 요청하되 `onChange`를 건너뛰고 모든 환경에서 사슬 끝에서 throw한다(17라운드 소유자 답 R17-1 나)(EVENT-034).

`spikes/events/entry.spike.test.tsx`(React 19 + jsdom, 7/7 통과)가 확정한 사실이다(EVENT-036). 컴포넌트가 이펙트에서 파생 값을 쓰면 키 입력 하나가 **진입 2·`onChange` 2·검증 2·React 커밋 2**를 낸다(EVENT-036). 레이아웃 이펙트든 패시브 이펙트든 같다 — React 19는 이산 이벤트 렌더의 패시브 이펙트를 커밋 끝에서 동기로 flush한다(EVENT-036). 이펙트가 돌 때 진입 깊이는 이미 0이므로, **어떤 스택 기반 진입 정의로도 합칠 수 없다**(EVENT-036).

core가 풀 문제가 아니라 **문서화 대상**이다(EVENT-036). 파생 값은 React 이펙트가 아니라 스키마 예약 층의 `controls.derived`(자기 값)·`controls.injectTo`(다른 노드의 값)로 쓰고, 값을 지우는 것은 `controls.unsetValue`로 하거나, 스토어 리스너로 쓴다 — 같은 스파이크의 스토어 리스너 변형은 진입 1·`onChange` 1·검증 1·커밋 1(파동 2)이다(EVENT-036). 예약 층의 쓰기는 정착의 파생 단계에서 일어나므로 새 진입을 만들지 않는다(EVENT-036). 소비자에게 보인다: 첫 `onChange`는 파생 값이 없는 stale emit(`{a:'x'}`, 커밋 2)이고 둘째가 최종값(`{a:'x', b:'derived:x'}`, 커밋 3)이다(EVENT-036). 통지마다 저장하는 앱은 키 입력당 두 번 저장하고 첫 저장이 stale이다(EVENT-036). DOM·emit·마지막 `onChange`는 끝에서 일치한다(tearing 없음)(EVENT-036).

【추론】 "파생 값은 이펙트가 아니라 `controls.derived`/`controls.injectTo`/스토어 리스너로 쓴다"는 판과 무관한 사용 규칙이므로 README(와 `docs/QUICK_REFERENCE.md`·`docs/agents`의 `validation-and-state.md`)가 소유한다(EVENT-069). 【추론】 이주 안내에는 한 줄만 두고 README를 가리킨다(EVENT-069). 【추론】 그 한 줄은, 오늘 매크로태스크 디바운스가 가리던 "이펙트 쓰기면 키 입력당 `onChange` 2회"가 새 설계에서 드러난다는 점이다(LANDING-022 이주 19와 짝)(EVENT-069, LANDING-022). 【추론】 작성은 PR-8이다(EVENT-069).

【추론】 규칙은 지금 정한다(EVENT-070). 【추론】 core의 예산은 진입 사슬 단위이고(EVENT-008), React 이펙트를 거친 순환은 매번 새 진입이라 core 예산에 넣지 않는다(EVENT-070, EVENT-008). 【추론】 예방은 C-10의 문서(EVENT-069)가 맡는다(EVENT-070, EVENT-069).

- PR: PR-7(React 18 실행 시험을 두는 PR, REACT-017)(EVENT-070, REACT-017).
- 무엇: 이벤트 스파이크(`spikes/events/`)에 이펙트 되먹임 사례를 더한다(EVENT-070).
- 무엇: `useLayoutEffect`와 `useEffect`에서 `node.setValue`로 서로를 되쓰는 두 필드를 만들고, React 18과 19에서 각각 실행한다(EVENT-070).
- 통과: 두 이펙트 모두에서 React가 순환을 끊는다(throw나 중단)(EVENT-070).
- 통과: 그러면 이 규칙을 그대로 둔다(EVENT-070).
- 실패(특히 패시브 이펙트 순환이 개발 모드 경고만 내고 계속 도는 경우): core가 진입 간 순환 감지를 더할지 소유자에게 올린다(EVENT-070).
- 실패: 이것은 core 예산의 단위를 바꾸는 일이라 편집자가 정하지 않는다(EVENT-070).

### 03-settle-and-events.md §2.9 렌더와 입력의 통지 경계

렌더 중 쓰기는 소비자 오류이며 core는 구별하지 않는다(EVENT-018).

렌더 중의 reset은 React의 '렌더 중 갱신' 경고를 받는다(EVENT-059). 언마운트된 `<Form>`의 핸들로 부른 reset은 통지 없는 로드일 뿐 오류가 아니다(EVENT-059). 둘째의 재대조 reset은 레이아웃 효과 안의 새 최외곽 진입이며, 그 `onChange` 안에서 호출자가 상태를 바꾸면 React가 그리기 전에 동기로 다시 그린다(셋 모두 문서화)(EVENT-059). 모든 통지가 동기이므로 렌더 중 사용자 코드의 쓰기는 React의 "렌더 중 갱신" 경고를 받는다(EVENT-059, EVENT-002). 두 번째 reset은 독립된 진입이며 EVENT-026의 규칙대로 자기 통지를 낸다(재대조는 EVENT-036의 이펙트 진입과 같은 새 진입이다)(EVENT-059, EVENT-026, EVENT-036).

포맷터가 값을 다시 쓰는 경우의 캐럿 복구는 두 설계 모두 입력 컴포넌트의 몫이다(제약 T-1(타이핑은 같은 이벤트 핸들러 안에서 리렌더된다)의 레이아웃 이펙트 북키핑)(EVENT-003, GOAL-052). 그래서 현재 수용 테스트(`controlled-interaction.render.test.tsx:340-368`)는 두 설계를 구별하지 못하며, 수용 기준을 F14로 바꿨다(중간 삽입, 이벤트 직후 DOM, IME 3단계)(EVENT-003).

통지는 입력 처리기 안에서 동기다(EVENT-002, 기존 규칙)(EVENT-065, EVENT-002).

- PR: PR-7, 스토리북 브라우저 프로젝트(Chromium, TEST-024)(EVENT-065, TEST-024).
- 후보 방법은 CDP `Input.imeSetComposition`/`Input.insertText`로 한국어 조합 ㄱ→가→각을 내는 것이다(EVENT-065).
- 대상: (a) 노드에 묶인 평범한 제어 입력, (b) 캐럿 기록을 하는 포매터 입력, (c) 조합 중에 Refresh가 도착한 입력(EVENT-065).
- 사람이 한 번 확인하는 목록에 macOS Safari·Chrome의 한국어 IME를 둔다(EVENT-065).
- 통과: 조합 단계마다 DOM 값이 IME 글과 같다(EVENT-065).
- 통과: 조합 중 `value` 세터 호출이 0회다(EVENT-065).
- 통과: `compositionend`가 한 번 오고, 그 뒤 노드 값이 최종 글이다(EVENT-065).
- 통과: (c)에서는 조합 중인 글이 늦은 쓰기로 노드에 닿지 않는다(REACT-024)(EVENT-065, REACT-024).
- 실패: 먼저 바인딩 계층에서 고친다(조합 중에는 복원·Refresh로 인한 DOM 쓰기를 미룸)(EVENT-065).
- 실패: core의 통지 시점(EVENT-002의 동기 통지)을 바꿔야만 풀리면 소유자에게 올린다(EVENT-065, EVENT-002).

### 03-settle-and-events.md §2.10 명령과 다시 그리기

【추론】 명령 넷은 따로 둔 메서드 넷이 아니라 명령 종류를 매개변수로 받는 노드 메서드 하나다(EVENT-063, EVENT-073). 【추론】 메서드는 하나이고 명령 종류마다 그 노드에 요청 사건 하나를 내며 원본을 쓰지 않는다(EVENT-063, EVENT-073). 【추론】 배달은 EVENT-045·LANDING-076이다(EVENT-063, EVENT-045, LANDING-076). 【추론】 `FormHandle` 쪽 대칭 모양(`focus(path)`·`select(path)`를 남길지 같은 모양 하나로 합칠지)은 PR-4 착수 전에 소유자가 정한다(EVENT-063, EVENT-073). 【추론】 `FormHandle` 쪽 모양은 PR-4 착수 전에 소유자가 정하되, 어느 모양이든 `find(path)`한 노드의 명령 메서드를 부르고 노드가 없으면 아무것도 하지 않는다(오늘 `Form.tsx:147-150`과 같음)(EVENT-063, EVENT-073). 【추론】 노드의 공개 `publish`와 publish용 공개 사건 형은 두지 않는다(EVENT-063). 임의 사건을 내는 공개 `publish`는 두지 않되, 명령 종류를 매개변수로 받는 메서드 하나의 이름 후보에 명령 사건에 한정한 `publish` 부활이 들고 이름은 PR-4 착수 전에 소유자가 정한다(EVENT-063, EVENT-073). 【추론】 명령이 대신한다(EVENT-063). 【추론】 두 명령이 버리는 것은 EVENT-039·EVENT-040의 표가 적고, README(PR-8)가 옮긴다(EVENT-063, EVENT-039, EVENT-040). 【추론】 노드 메서드는 PR-4(배달 경로)에서 겉면에 더하고 멤버 목록 시험과 SURFACE-011 행을 함께 고친다(EVENT-063, NODE-010, SURFACE-011). 【추론】 `FormHandle`에 더하는 명령 겉면은 모양이 무엇이든 PR-7이며, 그 모양은 PR-4 착수 전에 소유자가 정한다(EVENT-063, EVENT-073).

소유자(설계서 메모 3): "이 4개 기능을 4개로 분할해서 두지 말고 하나의 메소드에 여러 행위 타입을 파라미터로 받아서 행동하게 해줘."(EVENT-063).

방향: 노드 겉면에 명령 메서드 넷을 따로 두지 않고, 명령 종류를 매개변수로 받는 메서드 하나로 합친다(이름 후보 `action`·`interaction`·`request`, 또는 명령 사건에 한정한 `publish` 부활)(EVENT-073, EVENT-063). 명령의 뜻(요청 사건만 냄, 원본을 쓰지 않음, 실행은 렌더 계층)은 EVENT-063 그대로다(EVENT-073, EVENT-063). 함께 정할 것: 메서드 이름과 명령 종류 값의 형(공개 열거인지 문자열 리터럴인지), `FormHandle` 쪽 대칭 모양(`focus(path)`·`select(path)`를 남길지 같은 모양 하나로 합칠지), SURFACE-058의 겉면 수(명령 4 → 1, 약 57 → 약 54)(EVENT-073, SURFACE-058). 메서드 이름·명령 종류 값의 형·`FormHandle` 대칭 모양은 PR-4 착수 전에 편집자가 권장안을 올리고 소유자가 정한다(EVENT-073).

D-9 수락: `RequestRemount`는 공개 명령으로 남는다(F32)(EVENT-037). 소유자: "내부에서 쓰는 값이 아니라, 사용자가 특정 서브트리의 값을 제어·비제어 컴포넌트와 무관하게 최신화하기 위한 사용자 도구."(EVENT-037).

`setValue(V)`는 로드가 아니라 전체 교체 쓰기이고, 로드는 마운트·`FormHandle.reset()`·`resetSubtree()`뿐이다(EVENT-039, WRITE-090).

(EVENT-039, EVENT-040, WRITE-090, REACT-019, EVENT-042, GOAL-069)

| 명령 | 하는 일 | 버리는 것 | 범위 |
| ---- | ------- | --------- | ---- |
| `RequestRefresh` | 입력의 `key`를 바꿔 비제어 입력이 커밋된 값을 다시 읽게 한다(`SchemaNodeInput.tsx:94,120`). 자식 노드 프록시를 마운트한 입력(컨테이너)은 다시 마운트하지 않는다. 로드(마운트·`FormHandle.reset()`·`resetSubtree()`)가 낸 Refresh는 core가 로드된 노드 모두에 내므로 그 자식들이 저마다 받고(로드는 값이 같아도 원본을 새로 쓰므로 EVENT-042의 '그 밖의 쓰기가 원본을 바꾸면 낸다'에 든다), 컨테이너 하나에 명시로 보낸 `refresh`는 아무것도 다시 마운트하지 않는다(서브트리는 `remount`로 한다. 범위 칸의 '그 노드의 입력 하나'에서 나온다)(REACT-019, 16라운드 스웜 수렴(편집자 결정)) | 그 입력의 캐럿·선택·IME 조합 상태 | 그 노드의 입력 하나 |
| `RequestRemount` | 래퍼의 `key=version`을 바꿔 서브트리를 리마운트한다(`SchemaNodeProxy.tsx:84,89`, 제약 T-18(`RequestRemount`는 래퍼의 `key=version`으로 서브트리를 강제 리마운트한다)) | 서브트리의 React 로컬 상태, 비제어 DOM 값, 이펙트 상태 전부 | 서브트리 |

`Refresh`는 "가벼운 도구"가 아니라 **범위가 좁은 리마운트**다(EVENT-041). 소비자가 자기 입력의 `onChange` 안에서 `refresh`를 부르면 캐럿이 날아가는 것은 명시 호출의 귀결이며, 그렇게 문서화한다(EVENT-041).

core가 스스로 `Refresh`를 보내는 규칙은 바뀌지 않는다 — 쓰기의 출처로 판단하고 타이핑에는 보내지 않는다(A6 + F7, 제약 T-2(타이핑은 입력을 리마운트하지 않는다))(EVENT-042, GOAL-053).

【추론】 로드가 아닌 쓰기(`setValue(V)` 포함)는 EVENT-042대로 원본이 실제로 바뀐 노드에만 Refresh를 내고, 쓴 입력 자신은 제외한다(EVENT-071, EVENT-042). 【추론】 "값이 같아도 낸다"는 로드의 새 수명에만 해당한다(EVENT-071).

- PR: PR-2(정착의 Refresh 대상)·PR-7(입력의 다시 마운트)(EVENT-071).
- 무엇: 입력 중에 리스너가 `setValue(getValue())`를 부르는 장면과, 잎 하나만 바꾼 `setValue(V)`에서 `RequestRefresh`를 받는 노드를 센다(EVENT-071).
- 통과: 앞 장면은 0회, 뒤 장면은 바뀐 잎만 1회이며, 캐럿과 IME 상태가 남는다(EVENT-071).
- 실패: 원본이 바뀌지 않은 노드가 Refresh를 받으면 정착의 Refresh 대상을 고친다(EVENT-071).

### 05-validation-and-errors.md §2.14 관찰자 계약과 수신 범위

아래가 계약이다(17라운드 4번 수렴의 계약 열아홉 항목에 게이트 R17G-1–R17G-11의 고침을 모두 적용한 것)(ERROR-013). **이름과 자리.**(ERROR-013) Form 속성은 `onError?: (record: FormErrorRecord) => void`다(ERROR-013). 기록 형 `FormErrorRecord`와 코드 형 `FormErrorCode`(문자열 리터럴 합집합)는 가칭이며 PR-4에서 확정한다(ERROR-013). 렌더 계층(React 바인딩)이 이 속성을 소유하고 `useHandle`로 최신 속성을 부른다(`Form.tsx:110`과 같은 방식)(ERROR-013). 그래서 인라인 함수를 넘겨도 트리와 캐시를 다시 만들지 않는다(ERROR-013). core는 React를 모르므로(목표 C3(프레임워크 독립적인 core)) 트리를 만들 때 보고기 `{ report(record): void; hasConsumer(): boolean }`(가칭) 하나를 인자로 받고, 트리마다 하나인 `SchemaNodeRuntime`이 그것을 든다(ERROR-013, GOAL-016). 렌더 계층의 `hasConsumer`는 부를 때마다 '최신 `onError` 속성이 함수임 또는 `process.env.NODE_ENV !== 'production'`'을 돌려주고, core는 기록·서식·경고 판정 전에 매번 이것을 묻는다(ERROR-013). 마운트 뒤에 핸들러를 새로 단 폼은 그 뒤의 사건부터 받고, 이미 지난 로드의 청사진·마운트 기록은 받지 않는다(ERROR-013). core만 쓰는 호스트는 자기 보고기를 넘긴다(ERROR-013). 선언의 문서 주석 첫 줄은 "폼 내부의 오류와 경고를 받는 관찰자. 검증 결과는 오지 않는다(onValidate). 반환값은 무시되고 오류를 막지 못한다"이다(이름이 검증 오류로 읽히는 함정을 푼다)(ERROR-013).

**받는 것.**(ERROR-014) 폼 인스턴스에 묶인 오류 층과 경고 층의 사건 전부다(ERROR-014).

- 청사진 오류와 경고(ERROR-014).
- 마운트 정착의 오류와 경고(ERROR-014).
- 정착 오류와 경고: 예산 초과, 식·가드 실패, 동적 대상 없음, 공유 충돌, 게이트 가진 분기 둘 이상 켜짐(ERROR-014).
- 되먹임·중첩 초과(ERROR-014).
- 리스너 오류: 구독 리스너, `onChange`, `onStateChange`, `onDiagnosticsChange`, `batch` fn, 검증 결과 파동의 리스너와 `onValidate`(ERROR-014).
- 호출자 오류: `Overwrite`와 `Merge`를 함께 준 `setValue`, 재생성 reset으로 폐기된 노드에 대한 쓰기, `FormTypeInputMap` 패턴(ERROR-014).
- `degraded` 동안의 제출 거부(ERROR-014).
- 검증 불가(검증기는 있으나 컴파일 실패)(ERROR-014).
- 검증기 실행 실패(ERROR-014).
- 바운더리가 잡은 렌더 오류(ERROR-014).
- 검증기 없음과 조건부 스키마 경고(ERROR-014).
- 렌더 계층 경고: 가상화 꺼짐, `presentation` 키 의심(ERROR-014).

**받지 않는 것.**(ERROR-100)

- 정착 추적(개발 모드 기록)(ERROR-100).
- `diagnostics`의 상태 변화(원인 오류는 기록된다)(ERROR-100).
- 묶음 `SchemaFormError` 자체(구성 오류마다 기록한다)(ERROR-100).
- 핸들러 자신의 예외와 핸들러 안 쓰기의 거부(ERROR-100).
- 호스트 `onSubmit`이 던지거나 거부한 것(호스트 자신의 코드이며 제출 프로미스로 부른 쪽에 간다)(ERROR-100).
- 폼 인스턴스 밖의 사건: `registerPlugin`의 `UNHANDLED_ERROR.REGISTER_PLUGIN`(ERROR-100).
- React 자신의 경고와, core가 감지하지 않는 렌더 중 쓰기(원리 P5(core는 렌더러를 모른다))(ERROR-100, GOAL-031).
- 검증 결과 전부: 노드 `errors`의 `ValidationIssue`, `onValidate`, `errors` 속성과 `setExternalErrors`·`clearExternalErrors`, 제출의 `VALIDATION_ERROR.SCHEMA_VALIDATION_FAILED`(17라운드 소유자 답, 통보4 둘째 답)(ERROR-101).

### 06-react-and-surface.md §1.2 구독과 마운트 정착

오늘의 훅(`useSchemaNodeTracker`의 `useSyncExternalStore` + revision, `useSchemaNodeSubscribe`의 구독 뒤 따라잡기)은 새 통지 모델에 그대로 맞는다(REACT-006).
`useSyncExternalStore` 스냅숏으로 쓰는 현재 방식(`hooks/useSchemaNodeTracker.ts:36-49`)은 유지한다(REACT-006).

**마운트 정착 동안 `onChange`·`onDiagnosticsChange`는 버리고 `onError`는 커밋 뒤로 미룬다.**(REACT-007)
트리는 렌더 중 `useMemo`에서 만들어지고 로드 정착이 그 안에서 동기로 돈다(REACT-007).
구독자가 없으니 통지는 무해하다(REACT-007).
`onChange`·`onDiagnosticsChange`는 준비 전의 호출을 버린다(마운트 뒤의 `diagnostics`는 핸들로 읽는다)(REACT-007).

StrictMode의 이중 호출은 가드 캐시가 작성 루트 객체를 키로 하므로 컴파일을 두 번 하지 않는다(REACT-008).

문서화할 것 둘: 모든 통지가 동기이므로 렌더 중 사용자 코드의 쓰기는 React의 "렌더 중 갱신" 경고를 받는다(REACT-013). `startTransition` 안의 쓰기는 동기 차선으로 강등된다(REACT-013).
호출자가 렌더 중에 연 사슬(core가 감지하지 않는 사용자 코드의 쓰기, P5)은 호출자의 오용이므로 그 안의 전달 시점은 보증하지 않는다(REACT-013).

### 06-react-and-surface.md §1.5 입력별 초기화와 수명

**입력의 초기화.**(REACT-019)
core는 로드된 노드 모두에 Refresh를 낸다(오늘의 `Overwrite`와 같다)(REACT-019).
core는 React를 모른다(추가 목표 C3(프레임워크 독립적인 core), GOAL-016)(REACT-019, GOAL-016).
바인딩 계층이 입력마다 가른다(REACT-019).
자식 노드 프록시(래퍼가 만든 `ChildNodeComponents`로 그린 `SchemaNodeProxy`, 가상화의 `DeferrableNodeProxy` 자리 포함)를 하나라도 마운트한 입력은 컨테이너로 보아 다시 마운트하지 않는다(그 자식들이 저마다 Refresh를 받는다)(REACT-019).
자식 프록시를 마운트하지 않은 입력(리프, 터미널, `presentation.FormTypeInput`을 가진 가상 노드, 그리고 `formTypeInputMap`·정의 목록으로 준 브랜치 입력 가운데 값 전체를 스스로 그리는 것, 예: 객체용 비제어 JSON 편집기)은 입력 컴포넌트만 다시 마운트한다(REACT-019).
그래서 비제어 DOM과 사용자 `FormTypeInput`의 내부 상태가 입력 단위로 초기화되고, 자식을 그리고 있는 기본 객체·배열 입력과 렌더러·`children`·`<form>`은 다시 마운트되지 않는다(오늘은 provider 아래 전부)(REACT-019).
Refresh의 범위는 EVENT-039의 '그 노드의 입력 하나'와 같다(컨테이너를 다시 마운트하면 서브트리 리마운트, 곧 Remount가 된다)(REACT-019, EVENT-039).
컨테이너 하나에 명시로 보낸 `refresh`는 아무것도 다시 마운트하지 않는다(EVENT-039, REACT-019).
값이 바뀌었거나 손댄 입력으로 좁히지 않는 것은 안정성 때문이다(디바운스, 값 없이 바뀐 내부 상태, 흐림 뒤 한 프레임 안의 reset)(REACT-019).
로드(마운트·`FormHandle.reset()`·`resetSubtree()`, WRITE-090)가 낸 Refresh는 core가 로드된 노드 모두에 내므로 그 자식들이 저마다 받는다(REACT-019, WRITE-090).
로드는 값이 같아도 원본을 새로 쓰므로 EVENT-042의 '그 밖의 쓰기가 원본을 바꾸면 낸다'에 든다(REACT-019, EVENT-042).

규칙은 REACT-019 그대로다(REACT-028).
PR-7이 바인딩 계층에서 입력마다 자식 프록시의 마운트 여부를 알고, Refresh를 가를 때 읽는다(REACT-028).
자식 프록시는 `SchemaNodeProxy`와 가상화의 `DeferrableNodeProxy` 자리다(REACT-028).
후보 구현은 프록시의 마운트·언마운트 효과가 노드별 수를 올리고 내리는 것이며, 방법은 PR-7이 고른다(REACT-028).
PR: PR-7(REACT-028).
통과: TEST-020 보충의 reset 시험이 초록이다(REACT-028, TEST-020).
그 시험에서 다시 마운트되는 것: 터미널 입력, 값 전체를 그리는 브랜치 입력, 빈 배열·접힌 펼침 입력(REACT-028).
그 시험에서 다시 마운트되지 않는 것: 자식을 그리는 기본 객체·배열 입력(REACT-028).
여기에 StrictMode 이중 마운트와 가상화의 지연 자리 사례를 더한다(REACT-028).
실패(판정을 믿을 수 있게 얻지 못해 위 시험이 설 수 없음): 원문대로 '값 표시 불일치 대 다시 마운트 비용'의 맞바꿈을 소유자에게 올린다(REACT-028).

제안의 '`options.terminal: true`로 두라'는 안내는 없앤다(구조 선언으로 UI 수명을 푸는 두 번째 장치다, G4)(REACT-020).

남는 것: 자식을 그리면서 값에서 온 내부 상태를 따로 드는 컨테이너 입력은 그 상태가 남는다(지금 자식을 그리지 않는 입력, 곧 접힌 펼침 영역과 빈 배열은 다시 마운트된다)(REACT-021).
그런 컨테이너 입력은 노드 값을 구독해 맞추거나 `remount`·`<Form key>`를 쓴다고 문서화한다(REACT-021).

포커스: 다시 마운트된 입력은 포커스를 잃고 모바일 가상 키보드가 닫힌다(오늘도 같다)(REACT-023).
복원하지 않고 문서화한다(REACT-023).

### 06-react-and-surface.md §1.6 늦은 쓰기와 재생성

**늦은 쓰기의 차단.**(REACT-024)
다시 마운트로 대체된 입력 인스턴스가 뒤늦게 낸 `onChange`·`onFileAttach`(디바운스 타이머, 언마운트 때의 flush, IME 조합 끝)는 버린다(REACT-024).
Refresh 번호는 래퍼의 React 상태(오늘의 `useFormTypeInputControl`의 `useVersion`)가 아니라 노드가 들고, 그 Refresh를 낸 커밋에서 `revision`과 함께 동기로 오른다(EVENT-007, REACT-024).
배달보다 앞서므로 리스너 안의 로드처럼 다음 파동에 배달되는 Refresh도 배달 전에 번호가 올라 있다(REACT-024).
래퍼는 `SchemaNodeProxy`가 Remount에 쓰는 것처럼 `useSchemaNodeTracker`로 이 번호를 읽어 `FormTypeInput`의 `key`와 `defaultValue` 메모 의존으로 쓰고, 인스턴스가 마운트될 때의 번호를 `onChange`·`onFileAttach`에 묶어 쓰기 시점의 노드 번호와 다르면 버린다(REACT-024).
진입은 동기라 그 사이에 타이머가 끼어들 수 없고, 구독 전에 배달을 놓친 입력도 구독 뒤 따라잡으며, `startTransition` 안의 reset도 막는 차선으로 다시 그린다(REACT-024).
컨테이너 입력(REACT-019)은 다시 마운트하지 않으므로 이 검사를 받지 않는다(받으면 그 입력의 쓰기가 영구히 버려진다)(REACT-024, REACT-019).
이 규칙은 reset이 아닌 Refresh(호출자의 전체 교체)에도 똑같이 걸린다(REACT-024).
흐림 뒤 한 프레임 미룬 `touched` 설정은 노드의 상호작용 초기화 번호(상태 칸 쓰기로 `dirty`·`touched`를 비울 때 오르는 노드 필드. reset, `clearState`, `controls.resetInteraction`이 올린다)를 흐릴 때 붙잡아 두고, 미룬 콜백에서 그 번호가 바뀌었으면 쓰지 않는다(REACT-024).
그래서 오늘의 `clearState` 경합도 닫히고, 비움이 아닌 Refresh(외부 `setValue`) 뒤의 흐림 `touched`는 그대로 남는다(제안의 'reset이 낸 Refresh에만 딸린다'를 넓혔다, G4)(REACT-024).
이것이 없으면 옛 값이 살아 있는 노드에 쓰인다(오늘의 reset과 `key`는 옛 트리를 버려 이 문제가 없다)(REACT-024).
옛 트리를 폐기할 때 그 노드들의 Refresh 번호와 상호작용 초기화 번호를 통지 없이 함께 올려, 폐기된 트리의 입력 인스턴스가 뒤늦게 낸 `onChange`·`onFileAttach`(언마운트 때의 flush 포함)와 흐림 뒤 미룬 `touched`가 REACT-024의 검사에서 core에 닿기 전에 버려지게 한다(REACT-024).
늦은 `onFileAttach`는 노드 쓰기가 아니라 reset을 넘어 남는 Form 층 첨부 파일 맵의 쓰기이므로(오늘의 `SchemaNodeInput.tsx:61-67`), 래퍼가 맵에 쓰기 전에 노드의 폐기 표시를 읽어 폐기된 노드면 버린다(컨테이너 입력 포함)(REACT-024).

**더 강한 연산은 새 이름 없이 둘이다.**(REACT-025)
`<Form key>`는 전체 재생성(스키마 교체, 에러 바운더리 복구, 가상화 재생)으로 문서화하고, 그것이 버리는 것(핸들 인스턴스, 외부 구독, 노드 참조, `showError` 등 Form 층 상태, 첨부 파일 맵, 가상화 기록, 에러 바운더리의 fallback 상태)을 함께 적는다(REACT-025).
루트 바운더리가 fallback을 그리는 동안은 `ref`가 `null`이라 reset을 부를 수 없으므로 복구는 `key`뿐이다(TEST-020의 H5, 실행 확인 전)(REACT-025, TEST-020).
노드 명령 `remount`는 트리를 둔 채 그 노드의 UI만 다시 마운트한다(REACT-025).
`FormHandle`에 더하는 명령 겉면은 모양이 무엇이든 PR-7이며, 그 모양(`focus(path)`·`select(path)`를 남길지 같은 모양 하나로 합칠지)은 PR-4 착수 전에 소유자가 정한다(REACT-025, EVENT-063, EVENT-073).
문서는 reset을 값 초기화의 기본으로, `key`를 그보다 강한 연산으로 소개한다(REACT-025).

## 설계문서

- `design/03-settle-and-events.md` §2.1 (EVENT-001, EVENT-002, EVENT-004, EVENT-047)
- `design/03-settle-and-events.md` §2.2 (EVENT-005, EVENT-006, EVENT-007, EVENT-008, EVENT-009, EVENT-010, EVENT-011)
- `design/03-settle-and-events.md` §2.3 (EVENT-023, EVENT-024)
- `design/03-settle-and-events.md` §2.4 (EVENT-020, EVENT-058, EVENT-021, EVENT-022, EVENT-043, EVENT-044)
- `design/03-settle-and-events.md` §2.5 (EVENT-012)
- `design/03-settle-and-events.md` §2.6 (EVENT-013, EVENT-019, EVENT-014, EVENT-015, EVENT-016, EVENT-017)
- `design/03-settle-and-events.md` §2.7 (EVENT-027, EVENT-029, EVENT-030, EVENT-028, EVENT-031, EVENT-032, EVENT-035)
- `design/03-settle-and-events.md` §2.8 (EVENT-026, EVENT-033, EVENT-034, EVENT-036)
- `design/03-settle-and-events.md` §2.9 (EVENT-018, EVENT-003)
- `design/03-settle-and-events.md` §2.10 (EVENT-037, EVENT-039, EVENT-040, EVENT-041, EVENT-042)
- `design/05-validation-and-errors.md` §2.14 (ERROR-014)
- `design/06-react-and-surface.md` §1.2 (REACT-006)
- `design/06-react-and-surface.md` §1.5 (REACT-019)
- `design/06-react-and-surface.md` §1.6 (REACT-025)
