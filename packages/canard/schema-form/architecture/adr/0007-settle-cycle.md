# ADR 0007 — 작업 루프: 표시 → 계산 → 파생 → 전이 → 커밋, 그 뒤에 통지와 검증

## 상태

| 항목 | 닫은 사람 | 라운드 |
| --- | --- | --- |
| EVENT-036 | 편집자 결정(5라운드 도출 C-10, `reviews/round-5-derivations.md:25`) | 5(예약 층 이름은 15라운드 표기) |
| FRAGMENT-016 | 소유자 답(`reviews/round-1.md:177` 가드는 어떤 값을 보는가), 편집자 결정(4차 본문 E5, `adr/0002-guard-fragment-model.md:13`) | 5 |
| FRAGMENT-017 | 원리(`reviews/round-5-derivations.md:41` D-2 도출, `03-mental-model.md:162` 도출표), 편집자 결정(10라운드, `07-conclusions.md:132` 상한에 노드 게이트 수) | 10 |
| SETTLE-001 | 소유자 답(`00-goals.md:149` G5), 소유자 답(`reviews/round-1.md:176` §5의 전환, 라이프사이클의 단일화에 동의), 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`) | 5 |
| SETTLE-002 | 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`), 편집자 결정(10라운드 5차 본문, 표시 대상에서 `selection`을 지움(4.25), `adr/0007-settle-cycle.md:11`) | 10 |
| SETTLE-003 | 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`), 소유자 답(`reviews/round-10-owner-answers.md:8` A-2, 노드 게이트는 조각 게이트와 같은 장치), 소유자 답(`reviews/round-13-owner-answers.md:7` 13라운드 답 1, 코어에 글로벌 없음) | 13 |
| SETTLE-004 | 소유자 답(`reviews/round-10-owner-answers.md:23,24` E-8·E-9, 순위), 소유자 답(`reviews/round-10-owner-answers.md:20,22,26` D-7·D-17·E-16, 뒤가 앞을 덮는다), 소유자 답(`reviews/round-12-owner-answers.md:17` §9 같은 순위끼리), 소유자 답(`reviews/round-12-owner-answers.md:25` §9 `&derived`·`&injectTo` 충돌; 경고 없음 쪽만, 종류 순위는 13라운드 답 4가 정함), 소유자 답(`reviews/round-13-owner-answers.md:10` 13라운드 답 4, 같은 순위의 문서 순서와 경고 없음), 소유자 답(`reviews/round-10-owner-answers.md:10` A-4, 진짜 순환은 예산이 잡음), 편집자 결정(10라운드, 정착 안 에지 소비와 진 쓰기의 에지 소비, `07-conclusions.md:233`) | 13 |
| SETTLE-005 | 소유자 답(`reviews/round-10-owner-answers.md:7` A-1, 채움은 노드가 생길 때 한 번), 소유자 답(`reviews/round-9-spec.md:52` 읽기2 채우기 원천), 소유자 답(`reviews/round-9-spec.md:56` 읽기2 시점(A/B)), 소유자 답(`reviews/round-13-owner-answers.md:8` 13라운드 답 2, 나감의 비움), 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2 ㄴ), 편집자 결정(10라운드, `07-conclusions.md:106` 4.22), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-91), 소유자 답(`reviews/round-18-owner-answers.md:37` union O7·O8; U7 두 번 해석), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-104), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105) | 18 |
| SETTLE-006 | 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`), 소유자 답(`reviews/round-10-owner-answers.md:32` E-5, `&resetInteraction` 이름), 소유자 답(`reviews/round-12-owner-answers.md:13` §5, resetInteraction 동작은 clearValue와 같음) | 12 |
| SETTLE-007 | 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`), 편집자 결정(10라운드, 유효 스키마가 바뀐 노드를 배달 집합에, `07-conclusions.md:96`) | 10 |
| SETTLE-008 | 소유자 답(`reviews/round-14-owner-answers.md:12` O-6), 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`) | 14 |
| SETTLE-009 | 소유자 답(`00-goals.md:148` G4·G5), 소유자 답(`reviews/round-1.md:176` §5의 전환, 라이프사이클의 단일화에 동의), 소유자 답(`reviews/round-10-owner-answers.md:8` A-2), 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`) | 10 |
| SETTLE-010 | 원리(P3, `03-mental-model.md:15`), 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`), 편집자 결정(10라운드 5차 본문, 상태 칸 `selection`을 지움(4.25), `adr/0007-settle-cycle.md:11`) | 10 |
| SETTLE-011 | 편집자 결정(7–8라운드 수렴 D-31, `06-conclusions.md:196`), 편집자 결정(10라운드, 원본 B는 unsetValue가 지운 값도 되돌림, `07-conclusions.md:98`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105) | 18 |
| SETTLE-013 | 편집자 결정(10라운드 5차 본문, `adr/0007-settle-cycle.md:11`; 8라운드 N4 제안 `06-conclusions.md:369`, 10라운드 그대로 `07-conclusions.md:348`) | 10 |
| SETTLE-016 | 소유자 답(`reviews/round-10-owner-answers.md:10` A-4), 소유자 답(`reviews/round-10-owner-answers.md:13` B-1, 끝 문장), 소유자 답(`reviews/round-1.md:179` 순환), 소유자 답(`reviews/round-2.md:116` 상한에 걸렸을 때, 쓰기를 막지 않음), 편집자 결정(7–8라운드 수렴 D-17·D-31, 고리의 자리, `06-conclusions.md:158,196`) | 10 |
| SETTLE-017 | 원리(G6, `00-goals.md:150`), 편집자 결정(14라운드 F-11, `reviews/round-14-values-check.md:74`), 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2 ㄴ, 나감 비움 순회의 범위), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-13), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-95) | 18 |
| SETTLE-018 | 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`), 소유자 답(`reviews/round-10-owner-answers.md:8` A-2, 노드 게이트), 편집자 결정(14라운드 F-12 (b), 노드 게이트의 출발 상태, `reviews/round-14-values-check.md:76`) | 14 |
| SETTLE-019 | 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`), 편집자 결정(14라운드 F-12 (b)·(d), 노드 게이트의 전순서 자리와 전순서의 정의, `reviews/round-14-values-check.md:76`) | 14 |
| SETTLE-020 | 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`), 소유자 답(`reviews/round-10-owner-answers.md:8` A-2, 노드 게이트) | 10 |
| SETTLE-021 | 소유자 답(`reviews/round-1.md:177` 가드는 방출 값), 소유자 답(`reviews/round-10-owner-answers.md:38,40` E-23·E-19, 폼은 if의 내용에 관여하지 않음), 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`) | 10 |
| SETTLE-022 | 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`), 편집자 결정(10라운드, 상한에 노드 게이트 수를 더함, `07-conclusions.md:115` 4.23) | 10 |
| SETTLE-023 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 편집자 결정(7–8라운드 수렴 D-31, `06-conclusions.md:196`) | 17 |
| SETTLE-024 | 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`), 편집자 결정(10라운드 5차 본문, 메모 키에서 `selection`을 지움(4.25), `adr/0007-settle-cycle.md:11`) | 10 |
| SETTLE-025 | 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:79`; 합성 규칙은 4차 본문, emit의 키 순서 Q14가 열림), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-39) | 18 |
| SETTLE-026 | 원리(D-2, `reviews/round-5-derivations.md:41`), 편집자 결정(7–8라운드 수렴 D-24–D-26, `06-conclusions.md:231,236,240`), 편집자 결정(10라운드, 4.15–4.21 그대로, `07-conclusions.md:100`), 편집자 결정(17라운드, 관측 이름 `degraded`, ADR 0014 4판 채택, `adr/0014-error-policy.md:201`) | 17 |
| SETTLE-028 | 소유자 답(`reviews/round-10-owner-answers.md:39` E-21, 런타임은 경계에서만), 편집자 결정(10라운드, 에지 기준점은 직전 커밋, `07-conclusions.md:91`), 편집자 결정(10라운드, 참→거짓은 무동작으로 읽음, `07-conclusions.md:251`), 소유자 답(`reviews/round-12-owner-answers.md:13` §5 (b) 참→거짓은 무동작) | 12 |
| SETTLE-029 | 원리(P3, `reviews/round-5-derivations.md:41` D-2), 편집자 결정(17라운드, 관측 이름 `degraded`, ADR 0014 4판 채택, `adr/0014-error-policy.md:201`) | 17 |
| SETTLE-030 | 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`) | 5 |
| SETTLE-031 | 소유자 답(`00-goals.md:149` G5), 소유자 답(`reviews/round-1.md:177`), 소유자 답(`reviews/round-1.md:179`), 소유자 답(`reviews/round-10-owner-answers.md:10,13` A-4·B-1) | 10 |
| SETTLE-038 | 편집자 결정(7–8라운드 수렴 D-30, `06-conclusions.md:247`), 편집자 결정(10라운드, 4.15–4.21 그대로, `07-conclusions.md:100`) | 10 |
| SETTLE-046 | 소유자 답(`reviews/round-10-owner-answers.md:19` D-6, 로드 시 injectTo 발화), 소유자 답(`reviews/round-10-owner-answers.md:29,39` E-21, 로드의 unsetValue), 편집자 결정(10라운드, 21의 최초 로드를 모든 로드로 읽음, `07-conclusions.md:251`), 소유자 답(`reviews/round-12-owner-answers.md:13` §5 (a) 모든 로드에서 로드된 값으로 평가), 소유자 답(`reviews/round-12-owner-answers.md:19` §9 로드에서 `&derived`), 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-102) | 18 |
| TEST-064 | 편집자 결정(5라운드 ADR 0007 4차 본문의 비용 표, `adr/0007-settle-cycle.md:122`) | 5 |
| VALUE-036 | 원리(`reviews/round-5-derivations.md:40` D-1), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-100) | 18 |
| WRITE-015 | 소유자 답(`reviews/round-4.md:113` D-7; 호출 단위 비트), 원리(D-5 원리에서 도출, `adr/0013-core-does-not-rewrite-values.md:3`; 범위), 편집자 결정(9라운드, `07-conclusions.md:304` 6.1 소유자가 동의한 이름), 편집자 결정(6라운드 D-19, `06-conclusions.md:163`; `Merge`의 배열 통째 교체), 16라운드 스웜 수렴(편집자 결정, `adr/0013-core-does-not-rewrite-values.md:8`; 배치 행의 `fn` 안 `reset`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-59) | 18 |
| WRITE-074 | 편집자 결정(5라운드 소비자 검토 반영, `reviews/raw-round5-consumer.md:184`) | 5 |

## 결정

### 01-schema-to-blueprint.md §3.3 게이트 입력과 반복 계산

게이트의 입력 `G`는 **검증기가 볼 값**이다 — 현재의 활성 집합으로 합성한 로컬에 투영(`omitEmpty`·`omitTrailing`·null)을 적용한 것(FRAGMENT-016). `if`와 `controls.active`가 같다(FRAGMENT-016). 원리 P1(판정은 검증기의 것이다)에 따라 형상과 판정이 어긋나지 않게 하는 조건이다(FRAGMENT-016, GOAL-025). `extras`(선언되지 않은 키의 값)도 그 값에 든다(FRAGMENT-016). 예외는 하나다: 호스트 자신의 원본이 객체가 아니면 `G = {}`(FRAGMENT-016). 2라운드 S8(`properties`·`required`가 `null`·`undefined`에서 공허하게 참)은 이 예외로 닫힌다(FRAGMENT-016). 빈 중첩 호스트도 자기 `{}`로 자기 게이트를 평가한다(FRAGMENT-016). 분기 안 `if`에 조건 프로퍼티의 `required`가 있으면 `{}`에서 그 분기들의 `then`은 모두 꺼진다(FRAGMENT-022의 컨벤션)(FRAGMENT-016, FRAGMENT-022). 끌어올린 게이트가 `{addr: null}`에서 참인 것은 검증기도 같으므로 계약 위반이 아니다(목표 G1(판정의 동치))(FRAGMENT-016, GOAL-003). 빈 문자열을 "있다"로 다루고 싶은 작성자는 `omitEmpty`를 끈다(FRAGMENT-016).

1. 출발점 `A := 게이트 없는 조각 ∪ 조상에서 상속된 overlay`(FRAGMENT-017). **직전 커밋의 활성 집합은 읽지 않는다** — 형상이 이력을 읽으면 같은 원본이 다른 형상이 된다(원리 P3(형상은 상태의 순수 함수다))(FRAGMENT-017, GOAL-029). 직전 커밋의 활성 집합은 생긴 노드의 판정(전이)에만 쓰고 평가 순서 힌트로 쓰지 않으며, 바퀴의 평가 순서는 청사진 전순서다(FRAGMENT-017, SETTLE-050).
2. 한 바퀴에 **모든** 게이트(조각 게이트와 노드 게이트)를 평가한다(FRAGMENT-017). 참이면 켜고 거짓이면 **끈다**(FRAGMENT-017). 한 바퀴 안의 켜짐·꺼짐은 뒤의 게이트에 즉시 반영된다(가우스-자이델, F3)(FRAGMENT-017).

`A`가 바뀌면 다시 돈다(FRAGMENT-017). 상한 = 게이트 가진 조각 수 + 노드 게이트 수 + 1(FRAGMENT-017). 넘으면 정착은 SETTLE-011의 예산 규칙을 따른다(FRAGMENT-017, SETTLE-011).

4. 지원 범위 밖은 "자기 부정 스키마"가 아니라 그 일반형이다: **게이트 의존 관계에 부정을 포함한 순환**이 있으면 고정점이 없을 수 있고, 결과는 상한에서 결정적이되 임의적이다(F3)(FRAGMENT-017). 1라운드 R6이 철회한 "순환이 없다"의 자리가 이것이다(FRAGMENT-017).
5. 직전 커밋의 활성 집합은 출발점을 바꾸지 않고, 평가 순서 힌트로 쓰지 않는다(FRAGMENT-017, SETTLE-050). 출발점 자체를 바꾸는 최적화는 채택하지 않는다(FRAGMENT-017, SETTLE-044). 비용: 정순 의존 체인은 2바퀴, 역순 N단은 N+1바퀴다(E4)(FRAGMENT-017). 이 셈은 원본이 이미 있는 계산에 한정되며, 채움으로 이어지는 체인은 링크마다 전이 라운드를 쓴다(F2, SETTLE-005)(FRAGMENT-017, SETTLE-005).

**3.6 원본으로만 지탱되는 조각과 `default`로만 지탱되는 조각은 다르다.**(FRAGMENT-046) 원본은 상태이고 `default` 주입은 사건이다(FRAGMENT-046). 그래서 TEST-061의 실험(D-15)이 S2(최소 고정점 뒤, 선언 키가 원본에 있는 꺼진 조각을 검증기 가드로 한 번 켜 봄)를 채택하더라도, "`default`만으로 자기 가드를 켜는 조각"은 켜지지 않는다(FRAGMENT-046, TEST-061). `default`는 "조각이 꺼짐에서 켜짐으로 바뀐 직후"의 사건이므로 자기 조각을 켜는 원인이 될 수 없고, 자기 지지 `default`는 상태에서 오지 않아 P3가 배제한다(FRAGMENT-046).

【추론】 조각의 `controls`에 둔 에지 규칙(`unsetValue`·`derived`·`resetInteraction`·`injectTo`)은 그 조각이 켜져 있는 동안만 후보다(FRAGMENT-050). 【추론】 (1) 나감은 이 규칙들의 에지가 아니다(FRAGMENT-050). 【추론】 조각이 꺼지는 정착에서 그 규칙은 평가하지도 발화하지도 않는다(FRAGMENT-050). 【추론】 꺼짐이 값에 닿는 장치는 나감 정책 `unsetOnInactive` 하나다(FRAGMENT-050). 【추론】 그 정책은 조각 층의 값으로, 직전 커밋의 값을 쓴다(FRAGMENT-050). 【추론】 (2) 조각이 켜지는 정착에서 그 조각이 새로 들인 노드의 규칙 에지는 거짓→참이다(WRITE-029)(FRAGMENT-050, WRITE-029). 【추론】 그래서 `unsetValue`·`resetInteraction`은 식이 참이면 발화하고, `derived`·`injectTo`는 발화한다(FRAGMENT-050). 【추론】 형상에 남아 있던 공유 노드는 그 규칙의 기준점만 그 정착의 값으로 잡고 발화하지 않는다(CONTROLS-026, VALUE-025)(FRAGMENT-050, CONTROLS-026, VALUE-025). 【추론】 (3) 후보 여부는 그 라운드의 완성된 트리에서 조각이 켜져 있는지로 정한다(FRAGMENT-050). 【추론】 앞 라운드에 적용된 파생 쓰기는 뒤 라운드에서 조각이 꺼져도 되돌리지 않는다(FRAGMENT-050). 【추론】 철회는 채움만 한다(FRAGMENT-050). 【추론】 (4) 조각의 `controls.default`는 에지 규칙이 아니라 채움이며, 노드가 생길 때만 쓴다(FRAGMENT-050).

7. **양방향 주입은 식이 `undefined`를 돌려주어 멈춘다.**(FRAGMENT-034) 섭씨↔화씨처럼 왕복이 정확하지 않은 `controls.injectTo` 쌍은 순환이다(FRAGMENT-034). 폼은 오늘의 자동 차단을 두지 않고 예산으로 잡으므로, 작성자는 대상이 이미 같은 값이면 `undefined`를 돌려준다(`undefined`면 쓰지 않는다, CONTROLS-079)(FRAGMENT-034, CONTROLS-079).

### 02-node-and-value.md §2.4 null 계약과 정합 상태(경고등)

`setValue(null)`은 키가 없는 전체 교체이므로 자식 원본이 없음이 된다(VALUE-036). 원본 칸 하나로 족하며 셋째 칸도 특수 장치도 없다 — 2라운드 S7(#338 S4와 "null 아래도 원본 유지"의 충돌)은 이렇게 닫힌다(VALUE-036). 3라운드 E9의 "비객체 V는 자식 raw를 건드리지 않는다"와 E18("비객체 호스트의 자식은 비활성")은 **삭제**한다: 비객체 호스트의 자식은 **존재하고 렌더되며** 빈 상태를 보인다(VALUE-036). 실수로 누른 null의 되돌리기는 입력 컴포넌트의 몫이다(VALUE-036). 【추론】 로드가 아닌 쓰기로 온 `null` 아래 자식은 채움 없이 없음이다(WRITE-090, WRITE-092, VALUE-036). 【추론】 로드로 온 `null` 아래 자식은 로드의 새 수명이라 채움을 받는다(VALUE-036). 【추론】 그래서 VALUE-036의 "빈 상태"는 로드로 온 `null` 아래에서는 채운 상태이고, 로드가 아닌 쓰기로 온 `null` 아래에서는 없음이다(VALUE-036).

【추론】 null 계약은 작업 루프의 단계가 아니라 쓰기 종류로 표현한다(VALUE-032). 【추론】 쓰기 종류는 쓰기마다 진입에서 정해진다(VALUE-032). 【추론】 종류는 입력, 호출자(부분 쓰기·배열 연산), 로드, 자동 쓰기다(VALUE-032). 【추론】 쓰기 종류의 목록(VALUE-032)과 `UpdateValue` 출처 칸의 값(EVENT-060)에 '호출자 전체 교체'(`setValue(V)`)를 더한다(VALUE-032). 【추론】 표시 단계가 재계산 목록과 함께 그 종류를 기록한다(VALUE-032). 【추론】 같은 기록이 두 곳에 쓰인다: WRITE-013의 판정과 `UpdateValue`의 출처 칸(EVENT-060, VALUE-032). 【추론】 비객체 호스트의 원본을 비우는 것은 입력·호출자의 부분 쓰기뿐이고, 그 자식의 투영된 방출이 생길 때만 비운다(VALUE-032). 【추론】 판정이 값의 변화가 아니라 종류를 보므로, 같은 값을 다시 쓴 의도된 쓰기(S6)도 객체를 만든다(VALUE-032). 【추론】 단계만으로는 모자라다(VALUE-032). 【추론】 자동 쓰기인 `trim`은 정착 단계가 아니라 입력 마침 신호로 들어오기 때문이다(WRITE-078, VALUE-032).

【추론】 `controls.injectTo`는 원인과 무관하게 언제나 자동 쓰기이며 조상의 원본을 바꾸지 않는다(VALUE-032). 【추론】 오늘의 S2 규칙은 옮기지 않는다(VALUE-032). 【추론】 그 규칙은 `injectTo`가 원인 쓰기의 출처를 물려받게 해서, 사용자가 일으킨 `injectTo`면 null 조상을 객체로 만든다(VALUE-032). 【추론】 사용자에게 보이는 변화: 사용자가 일으킨 `injectTo`의 값이 null 조상 아래에 그려지지만 방출되지 않는다(VALUE-032). 【추론】 소유자가 뒤집기를 원하면, 12-5의 출처 칸 덕분에 원인의 출처를 물려주는 구현 비용은 작다(VALUE-032, EVENT-060). 【추론】 이 동작 변화는 소유자 통보 목록에 올린다(VALUE-032).

【추론】 (1) 경고등은 VALUE-002의 분류로 '계산' 칸이다(VALUE-030). 【추론】 경고등은 원본과 노드의 현재 spec(게이트가 켜진 동안의 유효 목록)만의 함수이므로 '상태는 `raw`와 `extras` 둘뿐'(P3)을 지킨다(VALUE-030, VALUE-037). 【추론】 소유자가 말한 '상태'는 사용자에게 보이는 뜻이다(VALUE-030). 경고등은 커밋 때 원본이 바뀐 노드와, 같은 정착에서 유효 스키마가 바뀐 노드에서 다시 계산한다(VALUE-030, VALUE-037). 【추론】 켜지는 값은 자기 형이 아니고, 없음도 아니고, nullable 노드의 `null`도 아닌 값이다(VALUE-030). 【추론】 수 노드의 `NaN`·`±Infinity`, 정수 노드의 정수 아닌 수, 잘못된 종류를 든 가지 노드도 켜진다(VALUE-030). 【추론】 가상 노드는 켜지지 않는다(ERROR-195에서 거부한다, VALUE-030).

【추론】 루트 노드가 켜진 노드의 경로 집합을 든다(VALUE-030). 【추론】 쓰기 때 더하고 빼며, 로드마다 다시 만든다(VALUE-030). 【추론】 "로드마다 다시 만든다"(VALUE-030)는 `resetSubtree()`에는 그 하위 트리에만 적용한다(VALUE-030). 소유자 답(설계서 메모 4)으로 이름은 게터 `typeMismatch: boolean`, 경로 목록 `typeMismatches: readonly string[]`, 경고 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`다(VALUE-030, VALUE-037). 【추론】 모든 노드는 getter `typeMismatches: readonly string[]`로 자기 경로 아래의 켜진 경로를 돌려준다(VALUE-030, SURFACE-061). 【추론】 루트에서 읽으면 트리 전체다(VALUE-030). 【추론】 커밋 번호로 메모해 같은 커밋에서는 같은 참조를 돌려준다(VALUE-030). 【추론】 형상에 없는 노드는 넣지 않는다(VALUE-030). 【추론】 새 이벤트는 없다(VALUE-030). 값이나 유효 스키마가 바뀌면 그 통지(`UpdateValue`·`UpdateJsonSchema`)가 알린다(VALUE-030, VALUE-037). 【추론】 `FormHandle`에는 더하지 않는다(VALUE-030).

【추론】 (4) nullable이 아닌 노드의 `null`은 바꾸지 않고 받은 그대로 방출된다(VALUE-033). 【추론】 경고등이 켜지고 경고가 가며, 검증기가 있으면 형 에러로 제출이 막힌다(VALUE-033). 【추론】 이 사용성 변화를 이주 항목(F27 확장, LANDING-125)과 PR-8 문서에 적는다(VALUE-033). 【추론】 해법은 스키마에 nullable을 적는 것이다(VALUE-033). 【추론】 값 규칙은 이미 닫혀 있고 문서화만 남았다(VALUE-033).

【추론】 `typeMismatch = raw !== undefined && !(raw === null && nullable) && !isMemberOfEffectiveList(raw)`이며, 원본과 노드의 현재 spec만의 함수다(VALUE-037, SURFACE-061). 【추론】 경고등은 커밋 때 원본이 바뀐 노드와, 같은 정착에서 유효 스키마가 바뀐 노드에서 다시 계산한다(VALUE-037). 【추론】 경고등은 그 노드의 경로가 루트의 경로 집합에 들어가는 커밋에 켜진다(ERROR-186, VALUE-037). 【추론】 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`는 경고등이 켜질 때마다 한 번 보내고, 켜진 채 다른 어긋난 값이 와도 다시 보내지 않는다(VALUE-037, SURFACE-061). 【추론】 경고등이 꺼졌다 켜지거나, 노드가 형상을 나갔다 들어오거나, 로드로 경로 집합을 다시 만들거나, 게이트가 좁혀 켜지면 다시 보낸다(VALUE-037). 【추론】 쓰기 없이 경고등만 바뀐 노드를 배달하는 통지는 유효 스키마 변경 통지 `UpdateJsonSchema`(가칭, EVENT-064)다(SETTLE-007, EVENT-045, VALUE-037).

【추론】 `SCHEMA_FORM_WARNING.TYPE_MISMATCH` 기록은 `{ level: 'warning', code, path, expected: { schemaType, nullable, effective }, received, reason, candidates?, source }`이다(ERROR-186, EVENT-060, VALUE-037, SURFACE-061). 【추론】 `expected.schemaType`은 `node.schemaType`이고, `expected.effective`는 그 커밋의 유효 목록이다(VALUE-037). 【추론】 `received`는 `'string'|'number'|'integer'|'nonFinite'|'boolean'|'null'|'object'|'array'|'other'` 가운데 하나다(VALUE-037). 【추론】 `reason`은 받아 줄 형이 없으면 `'unconvertible'`, 둘 이상이면 `'ambiguous'`이고, `candidates`는 `'ambiguous'`일 때만 `['string','boolean']`으로 싣는다(VALUE-037). 【추론】 `source`는 EVENT-060의 쓰기 출처 값에 `'gate'`를 더한 것이다(VALUE-037). 【추론】 `typeMismatches`는 켜졌으면 `[path]`, 아니면 공유하는 얼린 빈 배열이며, 커밋 번호로 메모하고 객체·배열 값의 안쪽 경로는 넣지 않는다(VALUE-037, SURFACE-061). 【추론】 `typeMismatch === false`는 값이 이 노드 유효 목록의 형이거나, 없거나, 노드가 nullable일 때 `null`이라는 뜻일 뿐 검증 통과를 뜻하지 않으며, 이 문구를 `FormTypeInputProps`와 게터의 주석에 같이 적는다(SURFACE-052, VALUE-037, SURFACE-061). 【추론】 게이트가 `null`을 빼는 것은 검증 전용이다(VALUE-037).

【추론】 union은 잎이므로 방출이 없을 때의 자리는 VALUE-034 그대로이며, 루트는 `undefined`이고 배열 아이템 자리는 `null`이다(VALUE-037). 【추론】 그래서 `omitEmpty`가 켜진 union 아이템이 `{}`를 들면 `null`이 방출되고, `{}`를 남기려면 작성자가 `omitEmpty: false`를 적는다(VALUE-037). 【추론】 방출은 원본을 참조 그대로 내며, 객체·배열을 복사하지 않는다(VALUE-012, WRITE-013, VALUE-037). 【추론】 터미널 object·array 노드와, 객체·배열을 받는 union이 통째로 든 값의 안쪽은 폼이 정규화하지 않는다(VALUE-037). 【추론】 그 안쪽의 JSON 부정합(`undefined`인 키, 배열 중간의 `undefined`·빈 자리, 비유한 수, `Date`·함수·bigint)은 VALIDATE-007을 어길 수 있다(예: `{type:['object','string'], minProperties:1}`의 `{a: undefined}`는 메모리 판정을 통과하고 직렬화 뒤 판정에서 실패한다, VALUE-037). 【추론】 개발 모드에서는 그런 값의 참조가 바뀐 커밋마다 깊이 점검하고, 부정합이 있으면 `(가칭) SCHEMA_FORM_WARNING.NON_JSON_WHOLE_VALUE`를 내며, 기록은 `{ path, innerPaths }`(앞의 N개)다(VALUE-037). 경고 중복 키는 폼 수준 로드(마운트, `FormHandle.reset()`)에서만 비우므로 `NON_JSON_WHOLE_VALUE`는 폼 수준 로드 사이에 `(code, path)`마다 한 번이고, `setValue(V)`와 `resetSubtree()` 뒤에는 다시 내지 않는다(VALUE-037, ERROR-204). 【추론】 프로덕션에서는 그 점검을 하지 않으며, 이 한계를 문서에 적는다(VALUE-037).

【추론】 채움 값(BLUEPRINT-036)은 노드가 생길 때 원본이 `undefined`인 경우에만 한 번 들어가며, `interpret`(두 번 해석 포함)를 지난다(VALUE-037). 【추론】 그래서 로드된 `{}`는 이미 있는 값이며 `default`로 덮이지 않고, 이는 객체 호스트가 `{}`도 채움을 받는 것(WRITE-082)과 다르다(VALUE-037). 목록 밖 `default`(예: `['string','boolean']`에 `default: 0`)의 경고등·경고는 마운트만이 아니라 노드가 생길 때마다(WRITE-090의 채움 시점) 켜고 보낸다(VALUE-037, WRITE-099). 【추론】 그 경고는 `source: 'fill'`, `reason: 'ambiguous'`로 한 번 보낸다(VALUE-037). 【추론】 `default`의 객체·배열은 복사하지 않고 불변으로 다룬다(WRITE-071, VALUE-037).

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

### 03-settle-and-events.md §1.1 정착의 원리와 결정성

쓰기(또는 쓰기의 묶음)마다 **한 곳에서, 고정된 순서로** 다음을 돈다(SETTLE-001).
**표시부터 커밋까지는 동기·단방향이다.**(SETTLE-001) 비동기는 경계(검증·React·`onChange`)에만 있고 이벤트는 출력 전용이다(SETTLE-001). 배치는 표시 N번에 계산·커밋 1번, 통지 1번이다(SETTLE-001).

통지도 동기다(SETTLE-001, EVENT-002).

**`if/then/else`, 분기 조각의 게이트, `controls.active`(노드·조각)는 같은 계산을 탄다.**(SETTLE-009) 라이프사이클이 하나다(SETTLE-009).

원본을 쓰는 것은 파생과 전이뿐이고 둘 다 표시로 돌아간다(SETTLE-010). 그래서 커밋된 트리는 (스키마, 트리 전체의 `raw`·`extras`)의 순수 함수다(F9, 원리 P3(형상은 상태의 순수 함수다))(SETTLE-010). 상태는 이 둘뿐이다(SETTLE-010).

(SETTLE-029)

| # | 도출 |
| - | ---- |
| D-2 | 형상은 상태의 순수 함수(P3)이므로 출발점 고정 + 비단조 재평가. 고정점이 없는 스키마는 지원 범위 밖이고 `degraded`로 관측 가능하다 |

**고정점이 없는 스키마는 지원 범위 밖이다.**(SETTLE-026) 게이트 의존 관계에 부정을 포함한 순환이 있으면 결과는 상한에서 결정적이되 임의적이고 `degraded`(`cause`는 예산)로 표시된다(F3)(SETTLE-026). 대표적인 진동은 `if: { not: { required: ['x'] } }, then: { properties: { x: { default: 1 } } }`다(SETTLE-026). 채움이 노드가 생길 때 한 번이 된 뒤로 이런 자기 게이트 순환은 런타임에는 사라지고 로드에만 남는다(SETTLE-026). 고정점이 둘 이상이면(R7) 선언 순서에 대해 결정적인 하나로 정착하며, 어느 경우에도 원본은 기본으로 남는다(SETTLE-026).

SETTLE-026 "고정점이 없는 스키마는 지원 범위 밖"과 D-2에 따라 예산 초과다(SETTLE-026). SETTLE-011에 따라 원본 B를 커밋한다(SETTLE-026).
결과는 명시적 쓰기를 표시한 원본 B에서 시작한 반복의 극한, 곧 `{}`다(SETTLE-026).
유일한 해가 자기 지지 `default`라면 FRAGMENT-046에서 허용되지 않으므로 SETTLE-026의 경우가 된다(SETTLE-026, FRAGMENT-046).

【추론】 정착의 출발점은 고정이다(SETTLE-018, SETTLE-044).
【추론】 직전 커밋의 `active`에서 출발하는 최적화는 채택하지 않는다(SETTLE-044).
【추론】 까닭 하나: 양의 순환에서 결과가 달라진다(SETTLE-044).
【추론】 소유자가 받아들인 최소 고정점 동작(12-10)이 이력에 의존하게 바뀌어 P3·D-2(형상은 상태의 순수 함수)를 깬다(SETTLE-044).
【추론】 예: 조각 C가 켜진 동안 서로를 켜 준 A·B가 있을 때, C가 꺼지면 고정 출발에서는 A·B도 꺼지지만 이어 출발에서는 켜진 채 남는다(SETTLE-044).
【추론】 까닭 둘: 같은 결과를 보장하려면 가드 사이의 의존을 알아야 하는데, 폼은 `if`의 내용을 읽지 않는다(SETTLE-044).
【추론】 U19 비용(켜진 조각 N개인 호스트의 무관한 키 입력)은 기존 최적화 (a)(b)(c)(BLUEPRINT-007, F13 키 패치)로 다룬다(SETTLE-044).
PR: PR-2 벤치(TEST-027·TEST-032)에 "켜진 조각 N개 호스트의 무관한 키 입력" 행을 더한다(SETTLE-044).
통과: TEST-027 게이트(옛 판 대비, Vincent의 수용)(SETTLE-044).
실패: P3 대 속도의 맞바꿈이므로 소유자에게 올린다(SETTLE-044).

**기록.**(SETTLE-031)

```text
라이프사이클 — 소유자: "마이크로태스크와 매크로태스크 기반의 라이프사이클을 노드 내부에서만큼은 원칙에 맞는 직관적인 데이터 흐름을 가졌으면 한다. 지금은 서로 막 주고받는 게 많다." / "react 파이버처럼 node가 동작하도록."
가드가 보는 값 — 소유자: "가드는 방출 값을 보는 게 맞다. 빈 문자열을 '있다'고 보는 게 오히려 이상하다. 그렇게 처리할 거면 omitEmpty를 끄면 되고, 그럼 방출값으로 통일해도 일정하다."
순환 — 소유자: "injectTo의 무한루프나 derived 무한루프 방어처럼 했으면 한다. 미리 알고 처리한다기보단, 몇 회 루프를 돌면 경고하고 error를 throw하도록. react의 hook처럼. 추가적인 방어를 해도 되는데 애드훅하게 하는 것보단 돌려보고 터지는 걸 개발 단계에서 알려주는 게 낫다."
순환(10라운드) — 소유자: "루프의 가능성을 제한하지는 않는다. … 그 상한값을 초과하면 적절한 error를 표시한다. 이는 react의 hook과 동일한 설계를 갖는다." / "구태여 막지 않을 뿐이지 루프를 만드는 걸 권하는 설계는 절대 아닙니다."
```

**기록.**(SETTLE-030)
잠금용 불린들과 마이크로태스크 flush가 필요 없어지고, 두 단계 하네스는 단일 단계가 된다(제약 T-5(두 단계 단언 — 동기 단계와 정착 단계), F23)(SETTLE-030).
"한 번의 쓰기가 두 번 배달된다", "결과가 원인보다 먼저 배달된다"가 구조적으로 사라진다(SETTLE-030).
라이프사이클을 SETTLE-002–SETTLE-008의 표 한 장으로 읽는다(목표 G5(한 장으로 설명되는 라이프사이클))(SETTLE-030). Q3(편집 중 상태와 가드가 보는 값)이 닫혔다(SETTLE-030).
되돌림 가능성은 낮다(SETTLE-030). VALUE-001과 함께 노드 코어의 기반이다(SETTLE-030).

### 03-settle-and-events.md §1.2 정착의 단계

(SETTLE-002, SETTLE-003, SETTLE-004, SETTLE-005, SETTLE-006, SETTLE-007, SETTLE-008)

| 단계 | 하는 일 | 예산 |
| ---- | ------- | ---- |
| 표시 | 쓰기를 받은 노드의 `raw`·`extras`를 갱신하고 조상 경로의 재계산 목록에 등록한다 | — |
| 계산 | 루트에서 한 번 내려간다. 재계산 목록의 자식을 먼저 완료한 뒤 자기 `local`·`emit`·유효 스키마를 만든다. 호스트는 조각과 노드를 SETTLE-018–SETTLE-025의 절차로 정한다. 게이트는 둘이다 — `if`(검증기 플러그인이 컴파일)와 `controls.active`(표현식). 노드 게이트는 조각 게이트와 같은 장치다(SETTLE-003). 계산의 끝, 최종 트리에서 `controls.visible`·`controls.readOnly`·`controls.disabled`·표준 `readOnly`를 한 번 결정한다. 코어에 글로벌은 없고 상태 키는 그 노드에만 걸린다(GOAL-048, 13라운드 답 1). **원본을 읽기만 한다**(E1) | 호스트 바퀴 = 게이트 가진 조각 수 + 노드 게이트 수 + 1 |
| 파생 | 완성된 트리에서 `controls.derived`(자기 값 덮기), `controls.injectTo`(대상에 대한 전체 교체), `controls.unsetValue`(자기 값을 없음으로)를 평가한다. 라운드마다 후보를 모아 **대상마다 하나만** 적용한다. 순위는 `controls.unsetValue` > `controls.derived` > `controls.injectTo` > 채움이고, 같은 순위끼리는 원천(선언) 노드의 문서 순서에서 나중이 이기고, 같은 노드에 걸린 선언끼리는 층(조각의 `controls` < `controls.children` 항목 < 노드 자신)에서 세부가 이기며, 같은 층이면 조각의 전순서에서 나중이 이긴다(소유자 답 7·16·17 "뒤가 앞을 덮는다"). 진 쓰기는 버리며 그 에지도 소비한다(소비하지 않으면 다음 라운드에 진 규칙이 이겨 순위가 무의미해진다, SETTLE-004). 한 규칙의 에지는 원천 값의 한 번의 변화에 대해 한 정착 안에서 한 번만 소비한다(재발화 금지, SETTLE-004). 기준점은 그 규칙이 이 정착에서 마지막으로 소비한 원천 값이다. 원천이 다른 값으로 다시 바뀌면 새 에지이고, 진짜 순환은 그래서 예산에 잡힌다(SETTLE-004, 소유자 답 4). 같은 대상에 규칙이 둘 와도 경고하지 않는다(13라운드 답 4). 한 정착에서 대상에 더 높은 순위의 쓰기가 이미 적용되었으면 뒤 라운드의 낮은 순위 후보는 버리고 그 에지를 소비한다(소유자 답 9의 뜻: 순위는 라운드가 아니라 정착 단위다). 쓰기가 나오면 표시로 | 라운드 25 |
| 전이 | **생긴 노드** — 직전 커밋의 형상에 없고 이번 최종 형상에 있는 노드 — 의 **없음**인 값에 채움(`controls.default` > `default`)을 쓴다. 노드 단위이며, 이미 있던 노드는 새 조각이 켜져도 채우지 않는다. 중간 라운드의 채움은 그 노드가 최종 형상에 없으면 버린다. 생긴 노드의 `controls.unsetValue`가 참이면 채우지 않는다(순위는 단계를 가로지른다, SETTLE-004). 나감 정책이 참으로 정해진 노드가 **나가면**(직전 커밋의 형상에 있었고 이번 최종 형상에 없으면, 하위 트리 포함, 선언이 하나라도 켜져 있는 공유 노드는 제외) 한 번 없음으로 만든다. 나가는 객체·분기에 켠 정책은 함께 나가는 하위 트리(선언의 나감과 잠복 자손 포함)로 내려가고 자손이 스스로 적은 선언이 가까운 순서로 이긴다(17라운드 소유자 답 R17-2 ㄴ, WRITE-033). 로드에는 나감이 없다(WRITE-037). → 표시로 | 라운드 = 게이트 가진 조각 수 + 노드 게이트 수 + 1 (파생과 **별도**, F2. 채움이나 나감의 비움이 다음 라운드를 부르는 것은 그 쓰기가 게이트를 뒤집어 새 노드를 내거나 노드를 내보낼 때뿐이다, SETTLE-005) |
| 커밋 | 계산 결과를 트리에 반영하고 정착을 확정한다. `controls.resetInteraction`(옛 `&pristine`, `dirty`·`touched` 초기화)을 최종 트리의 식 값으로 판정한다. 원본에는 쓰지 않는다. 배달 집합 전체의 `revision`을 한 번에 올리고(F16) 단조 **커밋 번호**를 매긴다(F28) | — |
| 통지 | 루트 디스패처가 문서 순서 위 → 아래로 1회 배달한다. 유효 스키마가 바뀐 노드도 배달 집합에 든다(EVENT-006) | 최외곽 진입의 되먹임 사슬당 파동 25 (EVENT-008), `onChange` 중첩 25 (EVENT-034) |
| 검증 | `validator(작성된 스키마, 방출 값)`. **커밋 번호**를 스탬프하고 비동기로 요청하며, 늦게 온 결과는 버린다. 실행은 마이크로태스크에 모아 최신 커밋 번호 하나만 돌린다(14라운드 답 O-6) | — |

종류 순위는 소유자 13라운드 답 4로 확정("명령어끼리는 지금 위계가 옳다")(SETTLE-004).
같은 순위끼리는 원천(선언) 노드의 문서 순서에서 나중이 이기고, 같은 노드에 걸린 선언끼리는 층(조각의 `controls` < `controls.children` 항목 < 노드 자신)에서 세부가 이기며, 같은 층이면 조각의 전순서에서 나중이 이긴다(소유자 답 7·16·17 "뒤가 앞을 덮는다")(소유자: "서로 다른 노드에서 하나의 노드로 injectTo를 할 경우 뒤가 이긴다") — 통지 순서와 같은 위→아래이며 "뒤가 앞을 덮는다"와 한 방향이다(G5: 전순서 없이는 결정적이지 않다)(SETTLE-004).
원천이 다른 값으로 다시 바뀌면 새 에지이고, 진짜 순환은 그래서 예산에 잡힌다(소유자 답 4. "규칙당 정착당 한 번"으로 읽으면 순환이 신호 없이 멈춘다)(SETTLE-004). 차례로 적용하면 순환이 없는 스키마에서도 로드만으로 예산을 다 쓴다(실측)(SETTLE-004).
같은 정착의 다음 라운드에서 같은 변화로 다시 쓰지 않는다(SETTLE-004).
진 쓰기는 버리고 그 에지도 소비한다(실험의 `LOSER_FATE`·`EDGE_CONSUMED_ON_LOSS`)(SETTLE-004). 소유자 답 9(`&derived`가 이김)에서 도출된다: 진 규칙의 에지를 소비하지 않으면 다음 라운드에 진 규칙이 이겨 순위가 무의미해진다(SETTLE-004).
버리되 소비하지 않으면 진 쓰기가 다음 라운드에 다시 시도된다(SETTLE-004).

**예산.**(SETTLE-005) 호스트 바퀴(게이트 가진 조각 수 + 노드 게이트 수 + 1), 파생 라운드, 전이 라운드(호스트 바퀴와 같은 식이다(SETTLE-005). 채움이나 나감의 비움이 다음 라운드를 부르는 것은 그 쓰기가 게이트를 뒤집어 아직 생기지 않은 노드를 내거나 아직 나가지 않은 노드를 내보낼 때뿐이고, 노드마다 정착 안에서 채움 한 번·비움 한 번뿐이라 같은 게이트가 다시 뒤집혀도 새 라운드를 낳지 않는다(SETTLE-005). 같은 정착 안에서 닫혔다 다시 열린 게이트의 노드는 이미 생긴 노드라 채움이 없다), 리스너 되먹임 파동, `onChange` 중첩의 다섯(SETTLE-005).
채움은 전이 단계에 있지만 순위는 단계를 가로지른다: 생긴 노드의 `controls.unsetValue`가 참이면 채우지 않는다(안 그러면 로드에서 지운 값이 바로 다시 채워진다)(SETTLE-005).
한 진입에서 쓰인 노드(입력 쓰기·`setValue`·로드·채움)는 그 진입의 전이 단계에서 최종 유효 목록으로 한 번 더 해석하며, 쓰이지 않은 노드는 다시 해석하지 않는다(SETTLE-005).
【추론】 전이 단계의 재해석은 전이 쓰기다(SETTLE-005).
【추론】 그 결과가 원본을 바꾸고 게이트를 뒤집으면 채움·비움과 같은 규칙으로 다음 라운드를 부르며, 라운드 상한(게이트 가진 조각 수 + 노드 게이트 수 + 1, SETTLE-005)은 그대로다(SETTLE-005).
【추론】 한 노드는 한 라운드에 한 번만 다시 해석한다(SETTLE-005).
【추론】 한 진입에서 쓰인 값의 두 번 해석(BLUEPRINT-041의 통합 원리 U7)에서, 쓰기 경계에서는 게이트와 무관한 정적 목록(`schemaType`, `nullable`)으로 해석하며, 로드(마운트, `FormHandle.reset()`, `resetSubtree()`)도 같다(SETTLE-005, WRITE-098).
【추론】 둘째 해석은 그 진입의 전이 단계에서 커밋 전에 하며, 전이 단계에서는 최종 유효 목록이 정적 목록보다 좁은 노드만, 첫째 해석의 결과가 아니라 원래 쓰인 값을 최종 유효 목록으로 다시 해석해 원본으로 삼는다(SETTLE-005, WRITE-098).

커밋에서 `revision`을 갱신한다(SETTLE-006). `controls.resetInteraction`(옛 `&pristine`)의 판정 시점은 `controls.unsetValue`와 같다(로드는 로드된 값으로, 런타임은 거짓→참 에지)(SETTLE-006).

검증 요청은 최외곽 진입당 1회이나 실행은 마이크로태스크에 모아 최신 커밋 번호 하나만 돌린다(14라운드 답 O-6. 늦은 결과를 버리는 스탬프 규칙과 같은 방향)(SETTLE-008).
첫 통지의 stale 검증 결과는 커밋 번호 스탬프(F28)가 버린다(SETTLE-008).

### 03-settle-and-events.md §1.3 호스트 평가와 값 합성

(SETTLE-018, SETTLE-050, SETTLE-019, FRAGMENT-049, SETTLE-020, SETTLE-021, SETTLE-022, SETTLE-023, SETTLE-024, SETTLE-025, SETTLE-042)

| 규칙 | 내용 | 근거 |
| ---- | ---- | ---- |
| 출발점 고정 | `A := 게이트 없는 조각 ∪ 상속 overlay`. 게이트 없는 조각은 본체 `properties`, 게이트 없는 `allOf` 항목, 게이트 없는 `oneOf`·`anyOf` 분기다. 직전 커밋의 `active`는 **읽지 않는다** — 직전 커밋의 활성 집합은 생긴 노드의 판정(전이)에만 쓰고 평가 순서 힌트로 쓰지 않는다. 노드 게이트도 게이트 가진 조각처럼 꺼진 채 출발한다 | E1·E6 |
| 조각은 트리 | 중첩 조각은 감싸는 조각이 활성일 때만 순회한다. 전순서(호스트에서 조각까지의 경로를 (키워드 순위, 배열 인덱스) 쌍의 열로 보고 사전식으로 비교한 것. 키워드 순위는 본체 `properties` < `allOf` 항목 < `if/then/else` < `oneOf` 분기 < `anyOf` 분기. 같은 호스트의 `oneOf` 분기는 모든 `anyOf` 분기보다 앞이다. JSON 키 순서에 기대지 않는다). 노드 게이트는 그 노드를 선언한 조각 바로 뒤에, 같은 조각 안에서는 선언 순서로 든다 | E3 |
| 매 바퀴 전부 | 한 바퀴에 **모든** 게이트(조각 게이트와 노드 게이트, 켜진 것과 꺼진 것 모두)를 평가한다. 한 바퀴 안의 켜짐·꺼짐은 뒤의 게이트에 즉시 반영된다(가우스-자이델) | E4, F3 |
| 게이트 입력 | 게이트는 **검증기가 볼 값**을 본다 — `A`로 합성한 local에 투영(`omitEmpty`·`omitTrailing`·null)을 적용한 것. `if`는 검증기 플러그인이 컴파일한 것으로, `controls.active`는 표현식으로 평가한다. `extras`(선언되지 않은 키의 값)도 게이트 입력에 든다(FRAGMENT-016). 폼은 `if`의 내용에 관여하지 않는다. 예외는 하나: 호스트 자신의 `raw`가 비객체이면 `G = {}` | E5, 원리 P1(판정은 검증기의 것이다) |
| 비단조 재평가 | 참이면 켜고 거짓이면 끈다. `A`가 바뀌면 다시 돈다. 상한 = **게이트 가진 조각 수 + 노드 게이트 수 + 1** | E6, F3, SETTLE-022 |
| 상한 초과 | 원본 B를 커밋하고(SETTLE-011), 형상은 원본 B로 한 번 더 계산하며 그 바퀴도 상한에 걸리면 마지막 바퀴의 `A`로 고정한다. 결과는 `diagnostics.status = 'degraded'`(`cause`는 예산)로 둔다. 자식 호스트의 초과도 루트의 `diagnostics`에서 관측된다. 모든 환경에서 사슬 끝에서 throw한다(17라운드 소유자 답 R17-1 나) | E6, F12, 5.0의 1, ERROR-130, ERROR-070 |
| 상속 overlay | 끌어올린 조각의 `then`이 손자를 선언하면 청사진이 그 선언을 자식 호스트의 overlay로 귀속시킨다. 부모의 바퀴가 overlay 집합을 바꾸면 자식을 **바퀴 안에서** 재계산하되 (`raw`, overlay 집합)으로 메모한다 | E12, F5 |
| 합성 | `local := compose(A)`, `emit := project(local)`. 다시 계산하는 키는 그 조각이 선언한 키뿐이고, 키 집합이 바뀌면 그 호스트의 `local`을 선언 순서로 O(키 수) 새로 지으며 `delete`는 없다. 첫째 유효 스키마 `options.propertyKeys`에 적힌 키가 그 순서로, 둘째 나머지 선언된 자식 키는 청사진 전순서에서 그 이름의 첫 선언 자리 순으로, 셋째 `extras`는 원본에 들어온 순서로 온다 | E10, F13, VALUE-010 |

【추론】 직전 커밋의 활성 집합은 바퀴의 평가 순서 힌트(F13)로 쓰지 않는다: 호스트 바퀴의 게이트 평가 순서는 청사진 전순서(BLUEPRINT-008, FRAGMENT-049)이며 이력과 무관하다(SETTLE-050).
【추론】 직전 커밋의 활성 집합은 생긴 노드의 판정(전이)에만 쓴다(SETTLE-050).
【추론】 고정점이 둘 이상인 스키마(R7)는 선언 순서에 대해 결정적인 하나로 정착해야 하는데(SETTLE-026), 이력을 따르는 평가 순서는 같은 원본에서 다른 고정점을 고를 수 있어 P3(형상은 상태의 순수 함수, SETTLE-029)에 어긋난다(SETTLE-050).
PR: PR-2(정착)(SETTLE-050).
무엇: 고정점이 둘인 스키마(서로 배타인 게이트 둘이 각자 자기를 켜는 순환)에서 이력 둘(첫 게이트를 먼저 켰던 폼과 둘째 게이트를 먼저 켰던 폼)을 같은 원본으로 이끌고 형상을 비교한다(SETTLE-050).
통과: 두 폼의 형상이 같고, 그 형상은 청사진 전순서에서 앞선 게이트의 고정점이다(SETTLE-050).
실패: 이 블록을 고친다(SETTLE-050).

【추론】 branch 객체 노드의 `local`과 `emit`의 키 순서는 결정적이다(SETTLE-042, SETTLE-025).
【추론】 쓰기의 순서나 이력과 무관하다(SETTLE-042, SETTLE-025).
【추론】 첫째, 그 호스트의 유효 스키마 `options.propertyKeys`에 적힌 키가 그 순서로 먼저 온다(SETTLE-042, SETTLE-025).
【추론】 둘째, 나머지 선언된 자식 키는 청사진 전순서(FRAGMENT-049)에서 그 이름의 첫 선언 자리 순이다(SETTLE-042, SETTLE-025).
【추론】 조각에서만 선언된 키와 공유 노드의 키도 같다(SETTLE-042, SETTLE-025).
【추론】 셋째, `extras`는 그 뒤에 원본에 들어온 순서(삽입 순서)로 온다(SETTLE-042, SETTLE-025).
【추론】 형상에 없는 키는 없다(SETTLE-042, SETTLE-025).
【추론】 순서표는 호스트의 유효 스키마 메모가 바뀔 때 한 번 계산해 메모와 함께 둔다(SETTLE-042).
【추론】 키 집합이 같은 커밋(값만 바뀐 쓰기, 키 입력)은 바뀐 자식만 직전 `local`의 사본에 같은 자리로 패치한다(SETTLE-042).
【추론】 그 비용은 O(재계산 목록)이고 순서가 유지된다(SETTLE-042).
【추론】 키 집합이 바뀌는 커밋(조각이나 노드 게이트의 토글, 자식이 생기거나 빠짐, `extras` 추가, `propertyKeys` 변경)은 그 호스트의 `local`을 위 순서로 새로 짓는다(SETTLE-042).
【추론】 그 비용은 O(그 호스트의 키 수)이고 `delete`는 없다(SETTLE-042).
【추론】 F13의 "조각이 선언한 키만 패치"는 다시 계산하는 키의 범위로 읽는다(SETTLE-042, SETTLE-025).
【추론】 토글 때 다시 계산하는 것은 그 조각이 선언한 키뿐이고, 나머지 값은 직전 `local`에서 옮겨 선언 순서로 새 객체를 짓는다(SETTLE-042).
【추론】 `emit := project(local)`은 순서를 그대로 둔다(SETTLE-042).
【추론】 터미널 객체와 비객체 원본은 받은 값을 그대로 든다(순서를 바꾸지 않음)(SETTLE-042).
【추론】 배열은 인덱스 순이다(SETTLE-042).
【추론】 오늘의 선언 순서 정렬(`BranchStrategy.ts:246,777-803`, `sortWithReference`: 참조 목록의 키가 먼저, 나머지는 원래 순서)과 같은 결과를 내므로 이주 행은 두지 않는다(SETTLE-042).
PR: PR-2 시험(SETTLE-042).
무엇: 조각 키의 자리가 오늘의 `oneOf`/`anyOf` 키 합집합 순서와 어긋나는 스키마가 있는지 본다(SETTLE-042).
실패: 어긋나면 이주 행을 더한다(SETTLE-042).

【추론】 (가) "값이 바뀌었다"는 하나의 판정(가칭 `sameValue`, 내부)으로 본다(SETTLE-043).
【추론】 원시 값은 SameValueZero로 본다(SETTLE-043).
【추론】 `NaN`은 `NaN`과 같고 `-0`은 `0`과 같다(SETTLE-043).
【추론】 배열은 길이와 차례대로의 원소를 본다(SETTLE-043).
【추론】 평범한 객체는 자기 열거 키의 목록(순서 포함)과 키마다의 값을 본다(SETTLE-043).
【추론】 그 밖의 객체(함수, `Date`, 클래스 인스턴스, `File` 등)는 참조로 본다(SETTLE-043).
【추론】 두 값의 참조가 같으면 더 내려가지 않는다(지름길)(SETTLE-043).
【추론】 (나) 커밋 단계에서, 이번 정착에 쓰인 잎의 `raw`·`extras`가 직전 커밋의 것과 (가)로 같으면 직전 참조를 둔다(SETTLE-043).
【추론】 쓰기 경계에서 지금 값과 같으면 쓰지 않는 것은 오늘과 같다(SETTLE-043).
【추론】 호스트의 `emit`은 VALUE-012대로 만든다(SETTLE-043).
【추론】 새로 만든 것이 직전 커밋의 것과 키 목록(순서 포함)도 같고 키마다의 자식 `emit` 참조도 같으면 직전 참조를 둔다(얕은 비교, 재계산 목록의 호스트만)(SETTLE-043).
【추론】 그래서 EVENT-031·EVENT-006의 "emit 참조가 바뀜"은 "방출 값이 바뀜"과 같아진다(SETTLE-043).
【추론】 `onChange`·배달·검증 요청은 참조 비교만으로 값 비교를 따른다(SETTLE-043).
【추론】 에지는 원천이나 의존의 값을 기준점(SETTLE-004·SETTLE-028)과 (가)로 견준다(SETTLE-043).
【추론】 대상은 `injectTo`의 원천 방출 값, `derived`의 의존 값, `unsetValue`·`resetInteraction`의 식 값이다(SETTLE-043).
【추론】 (다) 지름길 때문에 비교는 이번 정착에서 새로 만들어진 부분에만 내려간다(SETTLE-043).
【추론】 그래서 비용은 쓰기가 바꾼 크기에 비례한다(목표 G6(정밀한 고속 제어))(SETTLE-043).
【추론】 12-3은 검증기 성능에 관한 답이므로 폼 자신의 이 비용에는 닿지 않는다(SETTLE-043).
【추론】 (라) `controls.derived` 규칙의 의존 집합은 두 경로의 합집합이다: 청사진이 그 식에서 정적으로 뽑은 경로, 그리고 그 노드의 `controls.watch` 경로(모든 선언의 합집합)(SETTLE-043).
【추론】 역의존 표와 같은 표에서 나온다(SETTLE-043).
【추론】 같은 노드의 다른 식(`active`·`visible`·`readOnly`·`disabled`·`unsetValue`)이 읽는 경로는 들지 않는다(SETTLE-043).
【추론】 에지는 이 집합의 값 튜플이 기준점과 (가)로 다를 때다(SETTLE-043).
【추론】 경로가 읽는 값의 종류, 그리고 `@` 맥락의 변경이 에지인지는 CONTROLS-080이 정한다(SETTLE-043).

### 03-settle-and-events.md §1.4 게이트의 평가 자리와 순회 범위

**비용의 상한(G6, 14라운드).**(SETTLE-017) 파생·전이·커밋과 원본 B의 기록은 이번 정착의 재계산 목록과 자동 쓰기 기록만 순회한다(생긴 노드의 채움과 나간 하위 트리의 순회, 그리고 R17-2 ㄴ의 나감 비움이 도는 꺼진 조각이 선언한 하위 트리와 잠복 하위 트리의 순회는 제외)(SETTLE-017). 원본 B는 스냅숏이 아니라 자동 쓰기의 되돌림 기록으로 만든다(SETTLE-017). 청사진이 `controls`의 식과 `controls.watch`의 경로에서 역의존 표(경로 → 그 경로를 읽는 식을 가진 노드)를 정적으로 만들고, 표시 단계는 쓰기 노드의 조상과 그 역의존 노드의 조상을 재계산 목록에 넣는다(BLUEPRINT-007의 역색인 기각은 검증기 `if` 게이트의 건너뛰기에만 해당한다)(SETTLE-017). 한 정착의 라운드 상한은 파생 25 + 전이 상한(트리 전체의 게이트 가진 조각 수 + 노드 게이트 수 + 1)이며, 전이 라운드는 쓰기를 낸 라운드만 세고 `if/then/else`는 게이트 하나로 세며, 파생 라운드는 전이 뒤에도 이어 센다(곱하지 않는다)(SETTLE-017). 자식 호스트의 재계산은 정착당 덧씌움 집합의 서로 다른 값 수만큼이며 그 합은 호스트 바퀴 예산에 함께 센다(SETTLE-017). `if` 게이트의 컴파일은 작성된 스키마의 위치당 1회이며 폼 인스턴스 사이에 공유한다(VALIDATE-018, SETTLE-017). 공유 단위는 (검증기 인스턴스, 작성 루트 객체의 identity)이며 `validatorFactory`가 폼마다 새 인스턴스를 주면 공유하지 않는다(SETTLE-017, VALIDATE-018, VALIDATE-048).

나감의 비움은 나간 하위 트리(꺼진 조각이 선언한 하위 트리와 잠복 하위 트리를 포함한다)를 위에서 아래로 한 번 순회하며 조상의 정책을 인자로 내려보낸다(노드당 상수, 위로 거슬러 오르지 않는다)(SETTLE-017). 청사진이 '하위 트리에 정책 선언 없음'을 표시하면 Form 속성이 꺼져 있을 때 순회를 건너뛴다(SETTLE-017).
토글 없는 키 입력 한 번의 검증기 호출은 조상 경로의 `if` 게이트 수에 묶인다(14라운드 고속성 검증의 어림, `reviews/raw-round14-speed.md`)(SETTLE-017).
【추론】 합성 노드를 읽는 식은 그 하위 트리 전체에 기댄다(SETTLE-017).
【추론】 따라서 역의존 조회(SETTLE-017)는 값이 바뀐 노드의 경로와 그 조상·자손 경로를 읽는 식을 모두 찾는다(SETTLE-017).

【추론】 (5) 예산 셈: 호스트 바퀴와 전이 라운드 식의 '노드 게이트 수'는 `controls.active`를 가진 `children` 항목을 대상 수와 무관하게 항목마다 하나로 센다(SETTLE-041).
【추론】 식 하나가 호스트 기준으로 한 번 평가되어 모든 대상에 같은 값으로 걸리기 때문이다(SETTLE-041).
【추론】 조각의 `controls.active`는 그 조각의 게이트라 '게이트 가진 조각 수'에 이미 들어 있으므로 따로 세지 않는다(SETTLE-041).
【추론】 조각 범위 제어의 다른 키는 게이트가 아니다(SETTLE-041).
【추론】 판별 변환과 분기 식의 AND(FRAGMENT-048)는 게이트 하나다(SETTLE-041).

【추론】 `controls.active` 게이트(노드 게이트, 조각 게이트, CONTROLS-073의 `controls.children` 항목 게이트)가 선언한 호스트의 하위 트리 밖을 읽으면, 청사진이 그 게이트의 평가 자리를 L로 옮긴다(SETTLE-045).
【추론】 L은 선언한 호스트와, 식이 읽는 모든 경로의 자리를 함께 덮는 가장 낮은 공통 조상 호스트다(SETTLE-045).
【추론】 `#` 단독과 `(/)`(루트 값 전체)는 루트로 셈하고, `/p`·`#/p`는 `p`의 자리로 셈한다(SETTLE-045).
【추론】 `@`는 노드가 아니라 공통 조상 계산에 들지 않는다(SETTLE-045).
【추론】 옮긴 게이트는 L의 바퀴에서 다른 게이트와 같은 절차로 평가한다(SETTLE-045).
【추론】 꺼진 채 출발하고, 매 바퀴 모두 평가하며, 가우스-자이델로 즉시 반영한다(SETTLE-045).
【추론】 L의 전순서에서, 옮긴 게이트는 선언한 호스트로 이어지는 L의 자식을 선언한 조각의 바로 뒤, 그 조각의 노드 게이트들 뒤에 든다(SETTLE-045).
【추론】 옮긴 게이트끼리는 문서 순서를 따른다(SETTLE-045).
【추론】 옮긴 게이트의 값이 바뀌면 L은 바퀴 안에서 L부터 선언한 호스트까지의 경로를 재계산한다(SETTLE-045).
【추론】 메모는 상속 overlay와 같게 한다(SETTLE-045).
【추론】 이 재계산은 호스트 바퀴 예산에 함께 센다(SETTLE-045).
【추론】 재순회는 없다(SETTLE-045).
【추론】 두 번째 하강이 없으므로 계산은 여전히 루트에서 한 번 내려간다(SETTLE-045).
【추론】 다른 키는 순서 문제가 없다: 상태 키는 계산 끝의 최종 트리에서, 파생 규칙은 완성된 트리에서 평가한다(SETTLE-003, SETTLE-004, SETTLE-045).
PR: PR-2 정착 시나리오(TEST-069의 PR-2 시험)와 PR-2 벤치(SETTLE-045).
(a) 사촌 하위 트리를 읽는 노드 게이트를 단언한다(SETTLE-045).
(b) `#`를 읽는 게이트를 단언한다(SETTLE-045).
(c) 서로를 읽는 두 호스트의 양의 순환이 이력과 무관하게 같은 원본에서 같은 형상을 내는지 단언한다(SETTLE-045).
벤치: 루트로 옮긴 게이트가 N개일 때 키 입력 한 번의 비용을 잰다(SETTLE-045).
통과: TEST-073의 선(`guard:check`) 안이다(SETTLE-045).
실패: TEST-027 절차(이유를 적고 Vincent가 받아들여야 병합)를 따른다(SETTLE-045).

【추론】 트리 전체 순회는 로드와, 쓰기가 닿은 하위 트리를 도는 전체 교체 쓰기에서만 허용한다(SETTLE-047, SETTLE-017).
PR: PR-2(정착)(SETTLE-047).
무엇: 잎 하나의 입력 쓰기, 하위 트리의 `setValue(V)`, 루트 `setValue(V)`에서 정착이 방문하는 노드를 센다(SETTLE-047).
통과: 입력 쓰기는 재계산 목록과 자동 쓰기 기록만 돌고, `setValue(V)`는 쓰기가 닿은 하위 트리를 한 번 돈다(SETTLE-047).
실패: 순회가 이 범위를 넘으면 정착의 순회 범위를 고친다(SETTLE-047).

### 03-settle-and-events.md §1.5 자동 쓰기의 에지와 로드

런타임에는 둘 다 에지에서만 쓴다(SETTLE-028). `controls.injectTo`는 **원천의 방출 값이 직전 커밋과 다를 때**, `controls.unsetValue`는 식이 거짓에서 참이 될 때다(SETTLE-028). 그래서 사용자의 부분 쓰기를 되돌리지 않는다(F11)(SETTLE-028). 한 정착 안에서 에지는 한 번만 소비된다(SETTLE-004, SETTLE-028).

참에서 거짓으로 돌아갈 때 `controls.unsetValue`는 아무것도 하지 않는다(SETTLE-028).

【추론】 로드는 에지와 생김의 기준을 비운다(SETTLE-048, SETTLE-046).
【추론】 로드가 아닌 쓰기(`setValue(V)` 포함)는 직전 커밋을 기준으로 한다(SETTLE-048, SETTLE-046).
PR: PR-2(정착)(SETTLE-048).
무엇: `controls.derived`·`controls.injectTo`를 가진 폼에서 `setValue(getValue())`와 `FormHandle.reset()`을 부른다(SETTLE-048).
통과: `setValue(getValue())`는 에지가 없어 발화하지 않고, `FormHandle.reset()`은 발화한다(SETTLE-046, SETTLE-048).
실패: 에지의 기준을 고친다(SETTLE-048).

그래서 로드에서는 최종 형상의 노드가 모두 생긴 노드로서 채움을 받는다(SETTLE-046). `controls.injectTo`는 직전 값이 없으므로 발화한다(`fire`, 소유자 동의)(SETTLE-046). `controls.unsetValue`는 로드된 값으로 평가해 참이면 지우고 거짓이면 둔다(소유자 답 21)(SETTLE-046).

없음인 값은 모두 채움을 받고, `controls.injectTo`·`controls.derived`는 발화하며, `controls.unsetValue`는 로드된 값으로 평가해 참이면 지운다(SETTLE-046).

【추론】 로드에서 `controls.injectTo`가 발화한다는 규칙(SETTLE-046, CONTROLS-084)은 `resetSubtree()`에는 그 하위 트리에만 적용한다: 원천 노드가 그 하위 트리에 있는 `injectTo`만 발화하고, 하위 트리 밖의 원천은 새 수명이 아니라 직전 커밋 그대로이므로 발화하지 않는다(SETTLE-049, SETTLE-046).
【추론】 CONTROLS-084의 "모든 원천"은 그 로드의 범위에 든 원천이다: 마운트와 `FormHandle.reset()`은 폼 전체, `resetSubtree()`는 그 하위 트리다(SETTLE-049).
【추론】 발화한 `injectTo`의 대상이 하위 트리 밖에 있어도 대상에 쓰는 것은 그대로다(주입은 원천의 변화가 일으키는 쓰기이고, 이 규칙은 대상의 자리를 바꾸지 않는다)(SETTLE-049).
【추론】 같은 범위 규칙이 SETTLE-046의 채움("최종 형상의 노드가 모두 생긴 노드로서 채움")과 `controls.unsetValue`의 로드된 값 평가에도 적용된다: `resetSubtree()`에서는 그 하위 트리의 노드만 생긴 노드다(SETTLE-049, WRITE-090).
PR: PR-2(정착)(SETTLE-049).
무엇: `injectTo` 원천이 되돌리는 하위 트리 안에 있는 폼과 밖에 있는 폼에서 각각 `resetSubtree()`를 부르고, 대상 값과 하위 트리 밖 노드의 채움을 본다(SETTLE-049).
통과: 원천이 안이면 대상이 다시 주입되고, 밖이면 대상과 하위 트리 밖 노드의 값이 직전 커밋 그대로다(SETTLE-049).
실패: 이 블록을 고친다(SETTLE-049).

### 03-settle-and-events.md §1.6 비수렴과 되돌림

상한은 루프를 잇는 고리 하나만 끊는다 — 정착 예산은 자동 쓰기, 되먹임 파동은 그 파동의 되먹임 쓰기, `onChange` 중첩은 그 호출(EVENT-034, SETTLE-016). 루프의 가능성을 막지는 않지만 루프를 권하는 설계도 아니다(SETTLE-016).

최외곽 쓰기는 결코 버리지 않고, 커밋된 것은 반드시 통지된다(원리 P2(원본은 호출자와 작성자만 쓴다), 원리 P5(core는 렌더러를 모른다))(SETTLE-016).

SETTLE-005를 구현하려면 자동 쓰기를 되돌릴 수 있는 로그가 필요한데, 그 수명은 정착 하나다(SETTLE-038). 진입 범위로 두면 이미 통지된 값을 뒤 정착이 철회하므로 "코어는 받은 값을 고치지 않는다"와 G5의 "원인과 결과의 순서"에 걸린다(SETTLE-038).

원본 B는 스냅숏이 아니라 자동 쓰기의 되돌림 기록으로 만든다(SETTLE-038).

정착의 세 예산(호스트 바퀴, 파생 라운드, 전이 라운드) 가운데 하나라도 상한을 넘기면, 그 정착의 자동 쓰기 — 채움, `controls.derived`, `controls.injectTo`, `controls.unsetValue`, 나감의 비움 — 를 모두 뺀 **원본 B**를 커밋한다(SETTLE-011). 재귀 펼침의 멈춤도 예산 부류의 정착 오류로 원본 B를 커밋한다(`exceededBudget: 'recursion'`(가칭))(SETTLE-011, ERROR-190). `controls.unsetValue`가 지운 값도 되돌린다(SETTLE-011).
커밋되는 형상은 원본 B로 한 번 더 계산한 것이며, 그 바퀴도 상한에 걸리면 마지막 바퀴의 활성 집합으로 고정한다(SETTLE-011).

지원 범위 밖 구석이 하나만 있어도 그 정착의 자동 쓰기가 트리 전체에서 빠진다(SETTLE-011). 관여하지 않은 필드의 `default`도 빠진다(SETTLE-011). 마운트라면 기본값 없는 폼이 된다(SETTLE-011). 이것은 예산 초과 신호로 드러나며, 공개 문서 `inject-to.md` 38행의 "earlier hops still apply"와 어긋나므로 이주 안내에 올린다(SETTLE-011).
【추론】 상한을 넘기면 SETTLE-011대로 원본 B를 커밋하고, 원본 B에는 쓰기 경계의 해석(정적 목록)만 남는다(SETTLE-011).
【추론】 전이 단계의 재해석은 게이트 상태가 최종이 아니므로 원본 B에서 버린다(SETTLE-011).
【추론】 원본 B에 남은 값이 좁혀진 유효 목록 밖이면 경고등이 켜진다(SETTLE-011).

`diagnostics.iterations`는 초과한 예산이 쓴 반복 횟수(상한값)다(SETTLE-013).

**지워진 선택지.**(SETTLE-032) 검증 에러 목록에 섞어 제출을 차단하지 않는다(P1, 목표 G1(스키마는 공유 계약이다 — 판정의 동치))(SETTLE-032). 코어는 제출을 막지 않는다(제출은 Form 바인딩의 API이고 코어는 그것을 모른다, P5)(SETTLE-032). 통지 예산(파동, `onChange` 중첩)에서도 제출을 막지 않는다(그 예산은 커밋된 방출 값을 바꾸지 않는다)(SETTLE-032).

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

### 07-landing-and-tests.md §2.11 측정 시나리오와 실험 기록

(TEST-032, TEST-030, SETTLE-045, TEST-069)

| 상황 | 이미 있는 것 | 새로 필요한 것 |
| ---- | ------------ | -------------- |
| 대규모 쓰기 | `array-node-stress`의 applyValue, scale 벤치 | 큰 트리의 루트에 값을 통째로 쓰기 (flat 500, array 1000) |
| 배치 작업 | `event-cascade`의 K-배치 쓰기 | 표시 N번 → 계산·커밋 1번의 비용 |
| 빠른 연속 입력 | 하니스의 키 입력 단계 | **넓은 객체(키 1,000개)와 긴 배열(아이템 10,000개) 안에서의 키 입력** — 불변 갱신의 복사 비용 (VALUE-014의 위험) |
| 화면 전환 | `branch-strategy-init`, oneOf 토글, 마운트 | begin/complete 두 패스와 선택 가드는 사라졌다. 새 모델의 정착 측정은 SETTLE-045·TEST-069의 PR-2 정착 시나리오와 PR-2 벤치를 가리킨다 |
| (새 구조 고유) | — | **가드 평가** — `if`/`then`이 많은 스키마에서 쓰기당 `compileGuard` 호출 수와 시간, 검증기 구현체별(AJV, 인터프리터형) 비교. **1차 측정 완료** — TEST-036 |
| (새 구조 고유) | — | 분석 단계(스키마 → 청사진)의 1회 비용, `$ref`가 많은 스키마 |
| 메모리 | `benchmark-form`의 heap snapshot 도구(내용 미확인) | 노드당 메모리, 노드를 필요할 때 만드는 안(NODE-053)의 효과 |
| (14라운드) | — | 조건부 폼(`if` 20, 필드 200)의 마운트·키 입력·토글 |
| (14라운드) | — | `oneOf` 픽스처를 `controls.discriminator`판과 게이트 없는 판으로 나누어 잰다 |
| (14라운드) | — | 배치 없는 연속 `setValue` M회의 검증 횟수와 시간 |

측정 수치는 유효하나 시나리오 이름은 옛 모델의 것이다(TEST-032, TEST-030).

- 벤치: 루트로 옮긴 게이트가 N개일 때 키 입력 한 번의 비용을 잰다(TEST-032).
- PR: PR-2 벤치(TEST-027·TEST-032)에 "켜진 조각 N개 호스트의 무관한 키 입력" 행을 더한다(TEST-032).

- PR: PR-2 벤치(TEST-032).
- 무엇: 커밋 때 조상 경로 메모를 갱신하는 비용을 잰다(TEST-032).

다음은 기록이다(TEST-036). 수치와 방법은 `reviews/round-1.md` §2에 있다(TEST-036). 결론만 옮긴다(TEST-036).

1. **AJV에서는 가드를 몇 번 부르느냐가 문제가 아니다.**(TEST-036) 루트에 걸린 좁은 가드 200개를 키 입력마다 전부 돌려 7.9 µs다(TEST-036).
2. **걱정이 현실이 되는 곳은 둘이다**: 인터프리터형 검증기(`@cfworker/json-schema`는 같은 작업에 578 µs, 호스트 객체의 폭에 비례한다)와 컬렉션을 훑는 가드(아이템 10,000개의 `contains` 하나에 AJV 190 µs, 인터프리터 4.5 ms — 키 입력마다)(TEST-036).
3. **"호스트 참조가 그대로면 건너뛴다"는 루트에 걸린 가드에 효과가 없다.**(TEST-036) 읽는 키의 참조를 선형으로 비교하는 것도 AJV에서는 평가 비용과 같다(TEST-036). 효과가 있는 것은 변경 경로 → 가드의 역색인뿐이다(13 ns)(TEST-036).
4. **AJV의 실제 비용은 컴파일이다.**(TEST-036) 가드 하나에 70–270 µs, 200개면 폼 생성 시점에 14–54 ms(TEST-036). 늦추고, 중복을 없애고, 폼 인스턴스 사이에 공유해야 한다(TEST-036).
5. **불변 갱신의 복사 비용은 문제가 아니다.**(TEST-036) 키 1,000개 객체 1.1 µs, 아이템 10,000개 배열 2.7 µs(TEST-036). 현재 구현의 동기 쓰기 경로와 같은 수준이다(TEST-036).
6. 검증은 폼 전체 크기에 비례한다(아이템 10,000 × 6필드에 약 140 µs, 에러가 많으면 더)(TEST-036). 폼은 검증을 입력 경로에서 떼어 내는 장치를 따로 두지 않고 진입당 요청 1회와 마이크로태스크 합치기로 하며, 빈도 조절은 `OnRequest`다(TEST-036, VALIDATE-049).

모바일과 저사양 기기에서는 재지 않았다(TEST-036). 나노초 단위의 측정은 방법에 민감하다 — 같은 인자를 되풀이하면 JIT가 호출을 없애고, 여러 경우를 한 프로세스에서 재면 100배까지 어긋난다(PROCESS-030)(TEST-036).

다음은 기록이다(TEST-037). `reviews/round-2.md` §2에 표가 있고 전문은 `spikes/work-loop/REPORT.txt`다(TEST-037). 요점: 키 입력이 현재 구현보다 두 자릿수 배 싸지고(쓰기 뒤 첫 읽기의 재합성이 사라진다), 구현 선택이 승패를 가른다(메모 복사·패치 대 재구성 104배, dirty 목록 대 플래그 스캔 17배, 역색인 5배)(TEST-037). 재설계가 지는 유일한 지점은 조건부 폼의 생성(가드 컴파일 22 ms)이며 폼 인스턴스 사이의 컴파일 공유가 필요하다(TEST-037). V8의 자기 속성 1,020개 절벽은 현재 구현에도 같게 걸린다(TEST-037).

다음은 기록이다(TEST-059). 파일: `spikes/round9/oneof-if.mjs`, `oneof-if-output.txt`, `REPORT.txt`(TEST-059). 각 분기의 `if`는 `{ properties: { kind: { const } }, required: ['kind'] }`다(TEST-059).

| 배치 | 올바른 값 `{kind:'a', x:'s'}` | 누락 값 `{kind:'a'}` | 어느 조건에도 맞지 않는 값 `{kind:'c'}` | 조건 프로퍼티 없음 `{x:'s'}` |
| --- | --- | --- | --- | --- |
| `oneOf` 분기에 `if/then`만 | 거부 | 통과 | 거부 | 거부 |
| `oneOf` 분기에 `if/then` + `else: false` | 통과 | 거부 | 거부 | 거부 |
| `anyOf` 분기에 `if/then`만 | 통과 | 통과 | 통과 | 통과 |
| `anyOf` 분기에 `if/then` + `else: false` | 통과 | 거부 | 거부 | 거부 |
| `allOf` 항목에 `if/then`만 | 통과 | 거부 | 통과 | 통과 |
| 최상위 `if/then` 하나 | 통과 | 거부 | 통과 | 통과 |
| 오늘 방식(`const` 판별식) | 통과 | 거부 | 거부 | 거부 |

`if`에서 `required`를 빼면 `else: false`를 붙인 `oneOf`·`anyOf`가 `{x:'s'}`를 통과시키고, 빈 값에서 가드 단독 판정이 모두 참이 된다(검증 §2.3)(TEST-059). 그래서 FRAGMENT-022의 컨벤션이 "`else: false`와 `required` 함께"다(TEST-059).

다음은 기록이다(TEST-060). 8라운드 `loop-v4e.mjs`에서 59개 정확 치환(검증 뒤 수정 포함)으로 파생했고 재생성이 바이트 단위로 같다(TEST-060). 상태 칸은 원본과 `extras`뿐이며, 조각은 `if`(검증기 스텁) 또는 `&active`로 켜지고, 게이트 없는 조각은 무조건이다(TEST-060). 재실행은 `spikes/round9/`에서 `node regress/run.mjs`다(TEST-060).

프로토타입 보고서의 사실(`spikes/round9/REPORT-proto.txt`)(TEST-060). 교차 검증(`reviews/raw-round9-verification.md` §2)은 회귀·프로브의 합계 단언을 재실행해 재현했고, 채움 단위와 같은 대상 충돌은 탐침으로 하나씩 재현했다(TEST-060).

- 이식한 8라운드 회귀 63개 단언이 두 모드에서 모두 통과했다(TEST-060). v4e 자신의 기존 실패 셋 가운데 A4c와 A4-cap은 "같은 값을 다시 써도 에지를 발화하지 않는다"는 규칙으로, A4b는 "최종 형상에 없는 노드의 중간 채움은 남기지 않는다"는 규칙으로 기대가 바뀌어 통과한다(`regress/CHANGES.txt`)(TEST-060).
- Q8 프로브 108개 단언과 경계 26개가 통과했다(TEST-060).
- 로드에서는 `&default`가 `default`를 이겼고, 나중에 켜진 조각의 새 노드도 채워졌다(TEST-060).
- `&unsetValue`는 값을 지우고 입력을 남겼으며, 그 뒤 다시 채워지지 않았다(TEST-060). 자기 삭제로 조건이 거짓이 되어도 삭제를 철회하지 않는다(TEST-060).
- `else: false`가 없는 분기 둘에서 개발 모드 경고 둘이 났다(TEST-060). 게이트 없는 순수 `oneOf`·`anyOf`는 두 분기를 모두 켰다(TEST-060).
- 자식 집합 결합에서 AND/OR와 "가장 가까운 선언이 이김"은 정반대 결과를 냈다(TEST-060).
- `&derived`와 `&injectTo`의 같은 대상 충돌은 대상별로 하나만 적용해 2라운드에 수렴했다(TEST-060). 순위는 스위치다(TEST-060).
- `disableAutomaticWrites`는 채움·`&derived`·`&injectTo`·`&unsetValue`를 모두 막고 로드 값은 그대로 두었으며, 그 뒤 사용자 입력에서는 자동 쓰기가 다시 일어났다(TEST-060). 호출 단위 지정이 Form 속성을 덮었다(TEST-060).
- 비수렴 `&derived`·`&injectTo` 쌍은 라운드 상한 5·6·25 모두에서 예산 초과이고, 원본 B 커밋이면 `{a:0, b:0}`, 마지막 라운드 커밋이면 상한 직전의 값(상한 25에서 `{a:24, b:24}`, 상한 5에서 `{a:4, b:4}`)이다(TEST-060).

교차 검증이 첫 판에서 명세와 어긋나는 곳 셋을 찾았고 같은 codex 세션에서 고쳤다(TEST-060). 채움 단위(본체에만 노드 단위였고 공유 노드와 게이트 없는 `allOf` 항목은 조각 단위로 다시 채움), 노드 게이트(로드 때 꺼진 노드를 채우고 켜질 때 채우지 않음), 게이트 없는 분기의 공유 노드에 첫 선언 스키마를 힌트로 남김(TEST-060). 고치는 과정에서 넷째 빈틈이 재현으로 드러났다(`{seed:1, on:1}`, `REPORT-proto.txt` 325행)(TEST-060). 중간 라운드에 채운 값이 뒤 라운드에서 형상에서 빠진 노드의 원본에 남는 문제로, "생김"을 정착이 수렴한 뒤의 최종 형상으로 판정하고 최종 형상에 없는 노드의 채움 후보는 철회하도록 고쳤다("중간 라운드의 주입은 커밋 전에 버린다"(SETTLE-005)의 실행 확인)(TEST-060). 고친 뒤의 결과는 `spikes/round9/REPORT-proto.txt`의 "5. 검증 뒤 수정" 절과 `spikes/round9/r9b-output.txt`(단언 52개, 탐침 13개, 실패 0)에 있다(TEST-060).

고친 뒤 달라진 회귀 기대는 "이미 있던 노드는 다시 채우지 않는다", "최종 형상에 없는 노드의 중간 채움은 남기지 않는다", "게이트가 거짓인 노드는 생기지 않는다(FRAGMENT-014)"에서 온다(TEST-060). 8라운드 회귀 이식의 바뀐 요약은 17행이다(TEST-060). 7라운드 사례 X16(자기 주입으로 자기 조각을 끄는 스키마)은 에지 모드의 두 구성에서, 이전에 중간 원본 보존으로 `stable`이던 것이 예산 초과가 된다(TEST-060). 레벨 모드는 `t='from-undefined'`로 2라운드에 수렴한다(TEST-060). 에지 모드의 결과는 SETTLE-026(자기 가드를 끄는 자동 쓰기는 예산 초과)과 같은 판정이다(TEST-060).

(TEST-061, GOAL-015)

| 항목 | 질문 | 실험 | 결정 기준 |
| ---- | ---- | ---- | --------- |
| D-15 순환 스키마의 출발점 | `if`가 `x`를 요구하고 `then`이 `x`를 선언하는 부정 없는 순환에서 `{x: 'v'}`를 로드하면 조건부 조각이 꺼진 채 출발해 `x`가 방출에서 빠지고 상태는 `stable`이다. 로드한 유효 값이 조용히 사라진다. 원인은 신호의 부재가 아니라 출발점(SETTLE-029)이다 | 프로토타입 `loop-v4d` 사본에 출발점 스위치 셋을 더한다. `minimal`(지금), `S1`(선언 키가 원본에 있는 조건부 조각을 출발점에 더함), `S2`(최소 고정점 뒤 그런 꺼진 조각을 검증기 가드로 한 번 켜 봄). 사례 E8(자기 순환 `{x:'v'}`), E8b(상호 순환 `{a:1,b:2}`), E9(선언 순서에 따라 다른 고정점에 닿던 사례), E1, E12–E14, X15, X16, 독립 모델 N1·N2·N9. 회귀 전부. 비용은 케이스마다 새 프로세스 5회 | 채택: E8 → `{x:'v'}`, E8b → `{a:1,b:2}`, E9 불변 `{a:1}`, 회귀 0, 바퀴 상한 안, 비용 5회 폭 안. 실패 기준은 회귀, 사용자가 끈 조각이 잠복 원본만으로 되살아남, E9 변화다. 실패하면 최소 출발점 유지, 개발 모드 경고(목표 C2(작성자 실수의 가시성)), 프로덕션 신호는 SURFACE-007의 새 상태 값, WRITE-018과 SETTLE-026 수정. 편집자의 손 계산으로는 S1은 E9를 바꾸고 S2는 유지한다 |

D-15 순환 스키마의 출발점: 2항(조건에 쓰는 프로퍼티는 `properties`에 선언되어야 한다) 아래에서 `if`가 요구하는 `x`를 `then`이 선언하는 스키마는 컨벤션 위반이 되므로 우선순위를 낮춘다(TEST-061, GOAL-035). 실험 명세는 그대로 남긴다(TEST-061). 열린 부분은 "D-15: 컨벤션을 어긴 양의 순환 스키마에서 로드한 값이 알림 없이 빠지고 상태가 `stable`로 남는 것을 받아들이는가."였고, 소유자 답(12-10)은 "받아들입니다"다(TEST-061). 받아들인다(TEST-061). 컨벤션 문서에만 적고 경고 코드는 두지 않는다(TEST-061). A-2의 고지 의무는 이 경우에 적용하지 않는다(답 19가 이긴다)(TEST-061).

다음은 기록이다(TEST-064).

| 시나리오 | 3.1판 | 대조 | 출처 |
| -------- | ----- | ---- | ---- |
| 키 입력, 평면 1,000 | 1.39 µs | 3차안 1.35 µs | `reviews/round-4.md` §2.1 |
| 분기 전환(4라운드 측정 시나리오) | 108 µs | 3차안 89 µs | `reviews/round-4.md` §2.1 |
| 루트 통째 쓰기 10,000 × 5 | 12.0 ms | 현재 217 ms | `reviews/round-4.md` §2.1, `reviews/round-2.md` §2 |
| 조건부 폼 생성 (가드 200개) | 23.0 ms (트리 585 µs + AJV 컴파일 22.4 ms) | 현재 13.4 ms | `reviews/round-2.md` §2 |
| 진입 깊이 카운터 | 측정 스프레드 안 (3–4%) | — | `spikes/work-loop/REPORT-v4c.txt` |

노드별 장부가 루트 통째 쓰기를 3차안보다 58% 늦춘다(TEST-064). 조건부 폼 생성은 재설계가 지는 유일한 지점이다(TEST-064). 조건부 폼의 생성은 현재 구현보다 1.7배 느리다 — 가드 200개에 22.4 ms(TEST-064).

**인터프리터형 검증기를 어느 수준까지 지원하는가.**(TEST-065) 성능 예산을 AJV 기준으로 잡으면 인터프리터형은 "동작하지만 큰 폼에서는 느리다"가 된다(TEST-065). 역색인은 기각되었다(TEST-065, TEST-030). 소유자 답(12-3): "검증기의 성능은 우리가 관여할 문제가 아닙니다만. 뭘 말하는건지요?"(TEST-065).

- 【추론】 비용 — 청사진 판정: 로드마다 한 번이며, 비 union 칸에도 드는 로드 비용은 선언마다 `type` 파싱 O(원소 ≤ 7)과 마스크 교집합 O(1)이고, 분기 합치기는 O(분기 × 정적 연언 깊이)다; 메모리는 union 칸마다 얼린 배열 하나와 기본 spec 하나, 노드마다 0이다; 구현은 허용 집합 도우미 약 60줄(`extractSchemaInfo`와 `processSchemaType`의 형 부분 대체), 분기 합치기 약 50줄, 조각 공유 확장 약 40줄이다(TEST-078).
- 【추론】 비용 — 유효 목록: 좁히는 게이트가 없으면 0(같은 참조)이고, 게이트 선언을 가진 노드는 유효 스키마 메모가 바뀔 때 O(k)의 교집합 한 번, 경고등 재계산은 O(1)이다; 메모리는 좁혀진 메모 항목마다 작은 배열 하나와 spec 하나다; 구현은 약 40줄(병합표 `type` 행 포함)이다(TEST-078).
- 【추론】 비용 — 두 번 해석: 비용은 쓰인 노드 가운데 유효 목록이 정적 목록보다 좁은 노드에 한해 `interpret` 한 번과 쓰인 값의 참조 보관이다; 전이 단계 약 20줄이다(TEST-078, WRITE-098).
- 【추론】 비용 — 새 경고 넷(`TERMINAL_SUBTREE_KEY_IGNORED_FOR_FORM`, `NON_JSON_WHOLE_VALUE`, `DISCRIMINATOR_BRANCH_UNREACHABLE`, `FORM_TYPE_TEST_INVALID`): 개발 모드나 핸들러가 있을 때만 돌며(다만 `NON_JSON_WHOLE_VALUE`의 깊이 점검은 VALUE-037대로 개발 모드에서만 돌며, 핸들러가 있어도 프로덕션에서는 돌지 않는다), 비용은 터미널 하위 스키마 크기, 통째 값 크기(참조가 바뀐 커밋마다), 등록 때의 키 수에 비례한다; 메모리는 중복 억제 키이고; 각 30–40줄이다(TEST-078, WRITE-099).
- 【추론】 비용 — 쓰기(`interpret`): 멤버이면 `classBits` 한 번과 AND 한 번으로 O(1)이고, 문자열 해석은 정규식 한 번과 `Number` 한 번이며, 후보를 세기만 하는 무할당 구현이 조건이다; 메모리 0; `parse/` 약 80–100줄, `unionBehavior/` 행 약 40줄이다(TEST-078).
- 【추론】 비용 — 경고등: 원본이나 유효 스키마가 바뀐 노드만 커밋 때 O(1)이고 경고는 켜질 때만 보낸다; 메모리는 얼린 빈 배열 공유; 게터 두 개다(TEST-078).
- 【추론】 비용 — 방출·채움: 추가 비교와 복사가 없고, 메모리와 구현이 0이다(TEST-078).
- 【추론】 비용 — Hint·props: `useMemo` 안에서 필드 하나를 더 읽고(비 union에도 듦), 시험은 정의 수에 선형(오늘과 같음)이다; 메모리 0; 형 셋과 `getHint` 한 줄이다(TEST-078).
- 【추론】 비용 — 기본 union 입력: 키 입력마다 O(k ≤ 6)이고, 유효 목록은 `jsonSchema` 참조가 바뀔 때만 O(k), `JSON.stringify`는 값 참조가 바뀔 때만 O(값 크기)다; 메모리는 `useState` 하나와 표시 중인 객체 값마다 출력 문자열 크기의 메모다; 감싸개 약 60–80줄이다(TEST-078).
- 【추론】 비용 — 검증기: 기본 경로 0, `bind` 때 옵션 셋 검사 O(1)이다; 메모리는 스키마 깊은 사본을 (인스턴스, 루트)마다 한 번이다; 플러그인마다 약 10줄, ajv8 설정 세 줄이다(TEST-078).
- 【추론】 비용 — 공개 형: 컴파일 시간은 재지 않았다(모름); `value.ts`·`jsonSchema.ts`·노드 형·props 형 약 90줄과 가드 하나다(TEST-078).
- 【추론】 비용 — 플러그인 이주: 객체 시험 일곱 곳(코어 포함), 함수 시험 여섯 곳, mui 수 입력(빈 칸·초안·정수), 플러그인마다 union 항목 하나(권장)다(TEST-078).

## 설계문서

- `design/01-schema-to-blueprint.md` §3.3 (FRAGMENT-016, FRAGMENT-017)
- `design/02-node-and-value.md` §2.4 (VALUE-036)
- `design/02-node-and-value.md` §3.2 (WRITE-015, WRITE-074)
- `design/03-settle-and-events.md` §1.1 (SETTLE-001, SETTLE-009, SETTLE-010, SETTLE-029, SETTLE-026, SETTLE-031, SETTLE-030)
- `design/03-settle-and-events.md` §1.2 (SETTLE-002, SETTLE-003, SETTLE-004, SETTLE-005, SETTLE-006, SETTLE-007, SETTLE-008)
- `design/03-settle-and-events.md` §1.3 (SETTLE-018, SETTLE-019, SETTLE-020, SETTLE-021, SETTLE-022, SETTLE-023, SETTLE-024, SETTLE-025)
- `design/03-settle-and-events.md` §1.4 (SETTLE-017)
- `design/03-settle-and-events.md` §1.5 (SETTLE-028, SETTLE-046)
- `design/03-settle-and-events.md` §1.6 (SETTLE-016, SETTLE-038, SETTLE-011, SETTLE-013)
- `design/03-settle-and-events.md` §2.8 (EVENT-036)
- `design/07-landing-and-tests.md` §2.11 (TEST-064)
