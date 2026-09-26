# 단일 원장 — 정착

기준 커밋: `ba398c330`(저장소 `packages/canard/schema-form/architecture`). 영역: 정착 — 작업 루프(표시 → 계산 → 파생 → 전이 → 커밋, 그 뒤 통지와 검증), 호스트가 조각을 정하는 법, 예산과 상한, 비수렴. 정본 우선순위는 다음 순서다. (1) 소유자 답은 고정이다. (2) `adr/0007-settle-cycle.md`(5차 본문, 17라운드 반영)가 이 영역의 정본이다. (3) `03-mental-model.md`(원리 원장)는 `08-design-a-to-z.md`와 다르면 `03`이 이긴다. (4) 뒤 라운드가 앞 라운드를 이긴다. `02-target-overview.md`의 표와 그림은 보기다. `06-conclusions.md`·`07-conclusions.md`는 그때의 기록이며, 거기 적힌 규칙이 뒤 문서에 없으면 항목이 되고 뒤 문서가 바꿨으면 대체됨으로 남는다. 상태 값의 뜻: **현행**은 지금 유효한 규칙, **대체됨**은 뒤 라운드가 바꾼 규칙(옛 문장을 원문 그대로 남긴다), **열림**은 18라운드 안건으로 넘어가 아직 정해지지 않은 것이다. **중복**은 같은 규칙을 더 높은 정본을 가진 다른 영역의 항목이 담는 것이며, 결정 원문은 남긴다.

## 색인

| 번호 | 한 줄 요약 | 상태 | 닫은 사람 |
| --- | --- | --- | --- |
| SETTLE-001 | 정착 한 번의 자리와 순서 — 한 곳, 고정된 순서, 동기·단방향 | 현행 | 소유자 답(`00-goals.md:149` G5), 소유자 답(`reviews/round-1.md:176` §5의 전환, 라이프사이클의 단일화에 동의), 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`) |
| SETTLE-002 | 표시 단계 | 현행 | 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`), 편집자 결정(10라운드 5차 본문, 표시 대상에서 `selection`을 지움(4.25), `adr/0007-settle-cycle.md:11`) |
| SETTLE-003 | 계산 단계 — 호스트 바퀴, 게이트 둘, 끝에서 잠금·보임 결정, 원본을 읽기만 함 | 현행 | 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`), 소유자 답(`reviews/round-10-owner-answers.md:8` A-2, 노드 게이트는 조각 게이트와 같은 장치), 소유자 답(`reviews/round-13-owner-answers.md:7` 13라운드 답 1, 코어에 글로벌 없음) |
| SETTLE-004 | 파생 단계 — 같은 대상 규칙, 순위, 진 쓰기와 에지 소비, 재발화 금지 | 현행 | 소유자 답(`reviews/round-10-owner-answers.md:23,24` E-8·E-9, 순위), 소유자 답(`reviews/round-10-owner-answers.md:20,22,26` D-7·D-17·E-16, 뒤가 앞을 덮는다), 소유자 답(`reviews/round-12-owner-answers.md:17` §9 같은 순위끼리), 소유자 답(`reviews/round-12-owner-answers.md:25` §9 `&derived`·`&injectTo` 충돌; 경고 없음 쪽만, 종류 순위는 13라운드 답 4가 정함), 소유자 답(`reviews/round-13-owner-answers.md:10` 13라운드 답 4, 같은 순위의 문서 순서와 경고 없음), 소유자 답(`reviews/round-10-owner-answers.md:10` A-4, 진짜 순환은 예산이 잡음), 편집자 결정(10라운드, 정착 안 에지 소비와 진 쓰기의 에지 소비, `07-conclusions.md:233`) |
| SETTLE-005 | 전이 단계 — 생긴 노드의 채움, 나감의 비움, 전이 라운드 상한 | 현행 | 소유자 답(`reviews/round-10-owner-answers.md:7` A-1, 채움은 노드가 생길 때 한 번), 소유자 답(`reviews/round-9-spec.md:52` 읽기2 채우기 원천), 소유자 답(`reviews/round-9-spec.md:56` 읽기2 시점(A/B)), 소유자 답(`reviews/round-13-owner-answers.md:8` 13라운드 답 2, 나감의 비움), 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2 ㄴ), 편집자 결정(10라운드, `07-conclusions.md:106` 4.22), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-91), 소유자 답(`reviews/round-18-owner-answers.md:37` union O7·O8; U7 두 번 해석), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-104), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105) |
| SETTLE-006 | 커밋 단계 — revision 일괄, 커밋 번호, controls.resetInteraction 판정 | 현행 | 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`), 소유자 답(`reviews/round-10-owner-answers.md:32` E-5, `&resetInteraction` 이름), 소유자 답(`reviews/round-12-owner-answers.md:13` §5, resetInteraction 동작은 clearValue와 같음) |
| SETTLE-007 | 통지 단계 — 루트 디스패처 1회, 유효 스키마가 바뀐 노드도 배달 | 현행 | 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`), 편집자 결정(10라운드, 유효 스키마가 바뀐 노드를 배달 집합에, `07-conclusions.md:96`) |
| SETTLE-008 | 검증 단계 — 커밋 번호 스탬프, 마이크로태스크 합치기 | 현행 | 소유자 답(`reviews/round-14-owner-answers.md:12` O-6), 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`) |
| SETTLE-009 | 게이트 셋이 같은 계산을 탐 — 라이프사이클 하나 | 현행 | 소유자 답(`00-goals.md:148` G4·G5), 소유자 답(`reviews/round-1.md:176` §5의 전환, 라이프사이클의 단일화에 동의), 소유자 답(`reviews/round-10-owner-answers.md:8` A-2), 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`) |
| SETTLE-010 | 원본을 쓰는 단계는 파생과 전이뿐 — 커밋된 트리는 순수 함수 | 현행 | 원리(P3, `03-mental-model.md:15`), 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`), 편집자 결정(10라운드 5차 본문, 상태 칸 `selection`을 지움(4.25), `adr/0007-settle-cycle.md:11`) |
| SETTLE-011 | 비수렴 — 원본 B 커밋과 그 형상 | 현행 | 편집자 결정(7–8라운드 수렴 D-31, `06-conclusions.md:196`), 편집자 결정(10라운드, 원본 B는 unsetValue가 지운 값도 되돌림, `07-conclusions.md:98`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105) |
| SETTLE-012 | 비수렴의 표시 — diagnostics.status degraded, cause는 예산 | 중복(→ ERROR-132, ERROR-133) | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 편집자 결정(17라운드, ADR 0014 4판 채택, `adr/0014-error-policy.md:201`) |
| SETTLE-013 | diagnostics.iterations — 초과한 예산이 쓴 반복 횟수 | 현행 | 편집자 결정(10라운드 5차 본문, `adr/0007-settle-cycle.md:11`; 8라운드 N4 제안 `06-conclusions.md:369`, 10라운드 그대로 `07-conclusions.md:348`) |
| SETTLE-014 | 비수렴의 throw — 모든 환경, 커밋·통지 뒤 사슬 끝, 끄는 스위치 없음 | 중복(→ ERROR-070, ERROR-072) | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1) |
| SETTLE-015 | degraded의 지속과 제출 거부 — getValue는 막지 않음 | 중복(→ ERROR-135, ERROR-138, ERROR-141) | 소유자 답(`reviews/round-14-owner-answers.md:8` O-2, 지속), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1, 제출 거부) |
| SETTLE-016 | 상한은 루프를 잇는 고리 하나만 끊음 — 루프를 막지도 권하지도 않음 | 현행 | 소유자 답(`reviews/round-10-owner-answers.md:10` A-4), 소유자 답(`reviews/round-10-owner-answers.md:13` B-1, 끝 문장), 소유자 답(`reviews/round-1.md:179` 순환), 소유자 답(`reviews/round-2.md:116` 상한에 걸렸을 때, 쓰기를 막지 않음), 편집자 결정(7–8라운드 수렴 D-17·D-31, 고리의 자리, `06-conclusions.md:158,196`) |
| SETTLE-017 | 비용의 상한(G6) — 순회 범위, 되돌림 기록, 역의존 표, 라운드 합산, 컴파일 공유 | 현행 | 원리(G6, `00-goals.md:150`), 편집자 결정(14라운드 F-11, `reviews/round-14-values-check.md:74`), 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2 ㄴ, 나감 비움 순회의 범위), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-13), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-95) |
| SETTLE-018 | 호스트 — 출발점 고정 | 현행 | 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`), 소유자 답(`reviews/round-10-owner-answers.md:8` A-2, 노드 게이트), 편집자 결정(14라운드 F-12 (b), 노드 게이트의 출발 상태, `reviews/round-14-values-check.md:76`) |
| SETTLE-019 | 호스트 — 조각은 트리, 전순서, 노드 게이트의 자리 | 현행 | 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`), 편집자 결정(14라운드 F-12 (b)·(d), 노드 게이트의 전순서 자리와 전순서의 정의, `reviews/round-14-values-check.md:76`) |
| SETTLE-020 | 호스트 — 매 바퀴 모든 게이트 평가(가우스-자이델) | 현행 | 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`), 소유자 답(`reviews/round-10-owner-answers.md:8` A-2, 노드 게이트) |
| SETTLE-021 | 호스트 — 게이트 입력은 검증기가 볼 값 | 현행 | 소유자 답(`reviews/round-1.md:177` 가드는 방출 값), 소유자 답(`reviews/round-10-owner-answers.md:38,40` E-23·E-19, 폼은 if의 내용에 관여하지 않음), 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`) |
| SETTLE-022 | 호스트 — 비단조 재평가와 호스트 바퀴 상한 | 현행 | 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`), 편집자 결정(10라운드, 상한에 노드 게이트 수를 더함, `07-conclusions.md:115` 4.23) |
| SETTLE-023 | 호스트 — 상한 초과 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 편집자 결정(7–8라운드 수렴 D-31, `06-conclusions.md:196`) |
| SETTLE-024 | 호스트 — 상속 overlay | 현행 | 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`), 편집자 결정(10라운드 5차 본문, 메모 키에서 `selection`을 지움(4.25), `adr/0007-settle-cycle.md:11`) |
| SETTLE-025 | 호스트 — 합성(local, emit)과 emit의 키 순서 | 현행 | 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:79`; 합성 규칙은 4차 본문, emit의 키 순서 Q14가 열림), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-39) |
| SETTLE-026 | 고정점이 없는 스키마는 지원 범위 밖 — 결정성과 기본으로 남는 원본 | 현행 | 원리(D-2, `reviews/round-5-derivations.md:41`), 편집자 결정(7–8라운드 수렴 D-24–D-26, `06-conclusions.md:231,236,240`), 편집자 결정(10라운드, 4.15–4.21 그대로, `07-conclusions.md:100`), 편집자 결정(17라운드, 관측 이름 `degraded`, ADR 0014 4판 채택, `adr/0014-error-policy.md:201`) |
| SETTLE-027 | 로드는 새 수명 — 전체 교체가 에지와 생김의 기준을 비움, 로드 때의 발화 | 분할됨(→ SETTLE-046, SETTLE-048, WRITE-090) | 소유자 답(`reviews/round-10-owner-answers.md:19` D-6, 로드 시 injectTo 발화), 소유자 답(`reviews/round-10-owner-answers.md:29,39` E-21, 로드의 unsetValue), 편집자 결정(10라운드, 21의 최초 로드를 모든 로드로 읽음, `07-conclusions.md:251`), 소유자 답(`reviews/round-12-owner-answers.md:13` §5 (a) 모든 로드에서 로드된 값으로 평가), 소유자 답(`reviews/round-12-owner-answers.md:19` §9 로드에서 `&derived`), 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`), 소유자 답(`reviews/round-18-owner-answers.md:26` 18C 검토 4번; 대체) |
| SETTLE-028 | 런타임 에지 — 에지에서만 쓰고 부분 쓰기를 되돌리지 않음 | 현행 | 소유자 답(`reviews/round-10-owner-answers.md:39` E-21, 런타임은 경계에서만), 편집자 결정(10라운드, 에지 기준점은 직전 커밋, `07-conclusions.md:91`), 편집자 결정(10라운드, 참→거짓은 무동작으로 읽음, `07-conclusions.md:251`), 소유자 답(`reviews/round-12-owner-answers.md:13` §5 (b) 참→거짓은 무동작) |
| SETTLE-029 | D-2 — 형상은 상태의 순수 함수, 출발점 고정과 비단조 재평가 | 현행 | 원리(P3, `reviews/round-5-derivations.md:41` D-2), 편집자 결정(17라운드, 관측 이름 `degraded`, ADR 0014 4판 채택, `adr/0014-error-policy.md:201`) |
| SETTLE-030 | 결과와 되돌림 가능성 | 현행(기록) | 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`) |
| SETTLE-031 | 합의 근거 — 소유자 발언 원문 모음 | 현행(기록) | 소유자 답(`00-goals.md:149` G5), 소유자 답(`reviews/round-1.md:177`), 소유자 답(`reviews/round-1.md:179`), 소유자 답(`reviews/round-10-owner-answers.md:10,13` A-4·B-1) |
| SETTLE-032 | 예산 초과 때 제출 차단에서 지워진 선택지 | 현행(부정 결정) | 원리(P1·G1·P5, `06-conclusions.md:304-305`), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1, 폼의 제출 경로가 거부) |
| SETTLE-033 | 대체됨: 전이 주입은 최종 활성 집합 기준, 승자는 최종 형상의 default(06 4.2, D-12) | 대체됨(→ SETTLE-005) | 소유자 답(`reviews/round-10-owner-answers.md:7` A-1), 편집자 결정(10라운드, 4.2를 4.22로 다시 씀, `07-conclusions.md:101`) |
| SETTLE-034 | 대체됨: 상한에 걸리면 값은 받고 형상만 직전 커밋의 활성 집합으로 고정, 에러는 개발 모드 한정(2라운드) | 대체됨(→ SETTLE-011, SETTLE-014) | 소유자 답(`reviews/round-2.md:116` 상한에 걸렸을 때), 편집자 결정(7–8라운드 수렴 D-31, `06-conclusions.md:196`), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1) |
| SETTLE-035 | 열림: Q15 직전 커밋의 활성 집합을 출발 가설로 쓰는 최적화 | 대체됨(→ SETTLE-044) | 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:112`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-67) |
| SETTLE-036 | 열림: controls.active 식이 다른 호스트를 읽을 때의 평가 순서와 재순회 | 대체됨(→ SETTLE-045) | 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:36`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-15; 정본(FRAGMENT-039는 중복)) |
| SETTLE-037 | 열림: 호스트 바퀴·전이 예산 식이 controls.children 항목 게이트와 조각 범위 제어 게이트를 세는가 | 대체됨(→ SETTLE-041) | 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:25`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-12) |
| SETTLE-038 | 자동 쓰기 되돌림 로그의 수명은 정착 하나 — 진입 범위가 아님(06 4.19, D-30) | 현행 | 편집자 결정(7–8라운드 수렴 D-30, `06-conclusions.md:247`), 편집자 결정(10라운드, 4.15–4.21 그대로, `07-conclusions.md:100`) |
| SETTLE-039 | 열림: 에지의 값 동등 판정과 controls.derived 의존 집합의 출처 | 대체됨(→ SETTLE-043) | 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:107`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-50) |
| SETTLE-040 | 대체됨: 호스트 바퀴 상한은 조건부 조각 수 + 1(06 용어) | 대체됨(→ SETTLE-022) | 편집자 결정(7–8라운드 수렴, `06-conclusions.md:32` 용어), 편집자 결정(10라운드, 상한에 노드 게이트 수를 더함, `07-conclusions.md:132`) |
| SETTLE-041 | 예산 셈 — `controls.active`를 가진 `children` 항목은 항목마다 노드 게이트 하나, 조각의 `controls.active`는 '게이트 가진 조각 수'에 이미 듦 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-12) |
| SETTLE-042 | branch 객체 `local`·`emit`의 키 순서 — `propertyKeys`, 첫 선언의 전순서, `extras` 삽입 순서; 키 집합이 같으면 패치, 바뀌면 O(키 수)로 다시 짓기 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-39) |
| SETTLE-043 | 값 동등 `sameValue`(가칭) — SameValueZero, 배열·평범한 객체는 구조(키 순서 포함), 그 밖은 참조; 커밋·emit 참조 되살림; `derived` 의존 집합은 식 경로 ∪ `controls.watch` | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-50) |
| SETTLE-044 | 직전 커밋의 활성 집합에서 출발하는 최적화는 채택하지 않는다 — 출발점 고정, PR-2 벤치 게이트 | 현행(부정 결정) | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-67) |
| SETTLE-045 | 하위 트리 밖을 읽는 `controls.active` 게이트는 가장 낮은 공통 조상 L에서 평가 — L 전순서의 자리, 경로 재계산은 호스트 바퀴 예산, 재순회 없음 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-15) |
| SETTLE-046 | 로드 때의 채움과 발화 — 최종 형상의 노드가 모두 생긴 노드로서 채움, `controls.injectTo`는 발화, `controls.unsetValue`는 로드된 값으로 평가 | 현행 | 소유자 답(`reviews/round-10-owner-answers.md:19` D-6, 로드 시 injectTo 발화), 소유자 답(`reviews/round-10-owner-answers.md:29,39` E-21, 로드의 unsetValue), 편집자 결정(10라운드, 21의 최초 로드를 모든 로드로 읽음, `07-conclusions.md:251`), 소유자 답(`reviews/round-12-owner-answers.md:13` §5 (a) 모든 로드에서 로드된 값으로 평가), 소유자 답(`reviews/round-12-owner-answers.md:19` §9 로드에서 `&derived`), 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-102) |
| SETTLE-047 | 트리 전체 순회의 예산 — 로드와, 쓰기가 닿은 하위 트리를 도는 전체 교체 쓰기에서만 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-95) |
| SETTLE-048 | 에지와 생김의 기준 — 로드는 비우고, 로드가 아닌 쓰기(`setValue(V)` 포함)는 직전 커밋 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-102) |

항목 형식은 `ledger/README.md` §3을 따른다. 정본 줄의 일부 문장만 옮긴 항목은 출처에 `#n`(한 문장) 또는 `#a-b`(이어진 문장들)를 적는다. 이어지지 않은 문장들을 옮긴 항목은 줄 전체를 출처로 두고 `(정본, #a–#b·#n)`로 적는다. 표의 행을 옮긴 항목은 그 표의 머리 두 줄을 함께 옮긴다.

## 항목

### SETTLE-001 정착 한 번의 자리와 순서 — 한 곳, 고정된 순서, 동기·단방향

- 결정:
  > 쓰기(또는 쓰기의 묶음)마다 **한 곳에서, 고정된 순서로** 다음을 돈다.
  > **표시부터 커밋까지는 동기·단방향이다.** 비동기는 경계(검증·React·`onChange`)에만 있고 이벤트는 출력 전용이다. 배치는 표시 N번에 계산·커밋 1번, 통지 1번이다.
- 보충:
  > "통지도 동기다(ADR 0008)." (`02-target-overview.md:154`)
- 상태: 현행
- 출처: `adr/0007-settle-cycle.md:32,44`(정본), `02-target-overview.md:154`, `08-design-a-to-z.md:223`, `03-mental-model.md:99-111`
- 닫은 사람: 소유자 답(`00-goals.md:149` G5), 소유자 답(`reviews/round-1.md:176` §5의 전환, 라이프사이클의 단일화에 동의), 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`)
- 라운드: 5
- 까닭: `adr/0007-settle-cycle.md:19`, `adr/0007-settle-cycle.md:26`

### SETTLE-002 표시 단계

- 결정:
  > | 단계 | 하는 일 | 예산 |
  > | ---- | ------- | ---- |
  > | 표시 | 쓰기를 받은 노드의 `raw`·`extras`를 갱신하고 조상 경로의 재계산 목록에 등록한다 | — |
- 보충: 없음
- 상태: 현행
- 출처: `adr/0007-settle-cycle.md:36`(정본), `02-target-overview.md:158`, `08-design-a-to-z.md:243`, `03-mental-model.md:99`
- 닫은 사람: 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`), 편집자 결정(10라운드 5차 본문, 표시 대상에서 `selection`을 지움(4.25), `adr/0007-settle-cycle.md:11`)
- 라운드: 10
- 까닭: `adr/0007-settle-cycle.md:26`

### SETTLE-003 계산 단계 — 호스트 바퀴, 게이트 둘, 끝에서 잠금·보임 결정, 원본을 읽기만 함

- 결정:
  > | 단계 | 하는 일 | 예산 |
  > | ---- | ------- | ---- |
  > | 계산 | 루트에서 한 번 내려간다. 재계산 목록의 자식을 먼저 완료한 뒤 자기 `local`·`emit`·유효 스키마를 만든다. 호스트는 조각과 노드를 §2의 절차로 정한다. 게이트는 둘이다 — `if`(검증기 플러그인이 컴파일)와 `controls.active`(표현식). 노드 게이트는 조각 게이트와 같은 장치다(`07-conclusions.md` 4.24). 계산의 끝, 최종 트리에서 `controls.visible`·`controls.readOnly`·`controls.disabled`·표준 `readOnly`를 한 번 결정한다. 코어에 글로벌은 없고 상태 키는 그 노드에만 걸린다(원장 §4, 13라운드 답 1). **원본을 읽기만 한다**(E1) | 호스트 바퀴 = 게이트 가진 조각 수 + 노드 게이트 수 + 1 |
- 보충: 없음
- 상태: 현행
- 출처: `adr/0007-settle-cycle.md:37`(정본), `02-target-overview.md:159`, `08-design-a-to-z.md:244`, `03-mental-model.md:100-105`
- 닫은 사람: 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`), 소유자 답(`reviews/round-10-owner-answers.md:8` A-2, 노드 게이트는 조각 게이트와 같은 장치), 소유자 답(`reviews/round-13-owner-answers.md:7` 13라운드 답 1, 코어에 글로벌 없음)
- 라운드: 13
- 까닭: `07-conclusions.md:135`, `adr/0007-settle-cycle.md:26`

### SETTLE-004 파생 단계 — 같은 대상 규칙, 순위, 진 쓰기와 에지 소비, 재발화 금지

- 결정:
  > | 단계 | 하는 일 | 예산 |
  > | ---- | ------- | ---- |
  > | 파생 | 완성된 트리에서 `controls.derived`(자기 값 덮기), `controls.injectTo`(대상에 대한 전체 교체), `controls.unsetValue`(자기 값을 없음으로)를 평가한다. 라운드마다 후보를 모아 **대상마다 하나만** 적용한다. 순위는 `controls.unsetValue` > `controls.derived` > `controls.injectTo` > 채움이고, 같은 순위끼리는 원천(선언) 노드의 문서 순서에서 나중이 이기고, 같은 노드에 걸린 선언끼리는 층(조각의 `controls` < `controls.children` 항목 < 노드 자신)에서 세부가 이기며, 같은 층이면 조각의 전순서에서 나중이 이긴다(소유자 답 7·16·17 "뒤가 앞을 덮는다"). 진 쓰기는 버리며 그 에지도 소비한다(소비하지 않으면 다음 라운드에 진 규칙이 이겨 순위가 무의미해진다, 원장 §4). 한 규칙의 에지는 원천 값의 한 번의 변화에 대해 한 정착 안에서 한 번만 소비한다(재발화 금지, 4.30). 기준점은 그 규칙이 이 정착에서 마지막으로 소비한 원천 값이다. 원천이 다른 값으로 다시 바뀌면 새 에지이고, 진짜 순환은 그래서 예산에 잡힌다(원장 §4, 소유자 답 4). 같은 대상에 규칙이 둘 와도 경고하지 않는다(13라운드 답 4). 한 정착에서 대상에 더 높은 순위의 쓰기가 이미 적용되었으면 뒤 라운드의 낮은 순위 후보는 버리고 그 에지를 소비한다(소유자 답 9의 뜻: 순위는 라운드가 아니라 정착 단위다). 쓰기가 나오면 표시로 | 라운드 25 |
- 보충:
  > "종류 순위는 소유자 13라운드 답 4로 확정("명령어끼리는 지금 위계가 옳다")." (`03-mental-model.md:124`)
  > "같은 순위끼리는 원천(선언) 노드의 문서 순서에서 나중이 이기고, 같은 노드에 걸린 선언끼리는 층(조각의 `controls` < `controls.children` 항목 < 노드 자신)에서 세부가 이기며, 같은 층이면 조각의 전순서에서 나중이 이긴다(소유자 답 7·16·17 "뒤가 앞을 덮는다")(소유자: "서로 다른 노드에서 하나의 노드로 injectTo를 할 경우 뒤가 이긴다") — 통지 순서와 같은 위→아래이며 "뒤가 앞을 덮는다"와 한 방향이다(G5: 전순서 없이는 결정적이지 않다)." (`03-mental-model.md:124`)
  > "원천이 다른 값으로 다시 바뀌면 새 에지이고, 진짜 순환은 그래서 예산에 잡힌다(소유자 답 4. "규칙당 정착당 한 번"으로 읽으면 순환이 신호 없이 멈춘다). 차례로 적용하면 순환이 없는 스키마에서도 로드만으로 예산을 다 쓴다(실측)." (`03-mental-model.md:124`)
  > "같은 정착의 다음 라운드에서 같은 변화로 다시 쓰지 않는다." (`07-conclusions.md:215`)
  > "진 쓰기는 버리고 그 에지도 소비한다(실험의 `LOSER_FATE`·`EDGE_CONSUMED_ON_LOSS`). 소유자 답 9(`&derived`가 이김)에서 도출된다: 진 규칙의 에지를 소비하지 않으면 다음 라운드에 진 규칙이 이겨 순위가 무의미해진다(원장 §4)." (`07-conclusions.md:218`)
  > "버리되 소비하지 않으면 진 쓰기가 다음 라운드에 다시 시도된다." (`07-conclusions.md:218`)
- 상태: 현행
- 출처: `adr/0007-settle-cycle.md:38`(정본), `03-mental-model.md:124`, `02-target-overview.md:160,166`, `08-design-a-to-z.md:245,252`, `07-conclusions.md:215,218`, `03-mental-model.md:106-107`
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:23,24` E-8·E-9, 순위), 소유자 답(`reviews/round-10-owner-answers.md:20,22,26` D-7·D-17·E-16, 뒤가 앞을 덮는다), 소유자 답(`reviews/round-12-owner-answers.md:17` §9 같은 순위끼리), 소유자 답(`reviews/round-12-owner-answers.md:25` §9 `&derived`·`&injectTo` 충돌; 경고 없음 쪽만, 종류 순위는 13라운드 답 4가 정함), 소유자 답(`reviews/round-13-owner-answers.md:10` 13라운드 답 4, 같은 순위의 문서 순서와 경고 없음), 소유자 답(`reviews/round-10-owner-answers.md:10` A-4, 진짜 순환은 예산이 잡음), 편집자 결정(10라운드, 정착 안 에지 소비와 진 쓰기의 에지 소비, `07-conclusions.md:233`)
- 라운드: 13
- 까닭: `07-conclusions.md:216`, `07-conclusions.md:218`, `reviews/round-9-spec.md:26`

### SETTLE-005 전이 단계 — 생긴 노드의 채움, 나감의 비움, 전이 라운드 상한

- 결정:
  > | 단계 | 하는 일 | 예산 |
  > | ---- | ------- | ---- |
  > | 전이 | **생긴 노드** — 직전 커밋의 형상에 없고 이번 최종 형상에 있는 노드 — 의 **없음**인 값에 채움(`controls.default` > `default`)을 쓴다. 노드 단위이며, 이미 있던 노드는 새 조각이 켜져도 채우지 않는다. 중간 라운드의 채움은 그 노드가 최종 형상에 없으면 버린다. 생긴 노드의 `controls.unsetValue`가 참이면 채우지 않는다(순위는 단계를 가로지른다, 원장 §4). 나감 정책이 참으로 정해진 노드가 **나가면**(직전 커밋의 형상에 있었고 이번 최종 형상에 없으면, 하위 트리 포함, 선언이 하나라도 켜져 있는 공유 노드는 제외) 한 번 없음으로 만든다. 나가는 객체·분기에 켠 정책은 함께 나가는 하위 트리(선언의 나감과 잠복 자손 포함)로 내려가고 자손이 스스로 적은 선언이 가까운 순서로 이긴다(17라운드 소유자 답 R17-2 ㄴ, 08 §8.4). 로드에는 나감이 없다(원장 §3). → 표시로 | 라운드 = 게이트 가진 조각 수 + 노드 게이트 수 + 1 (파생과 **별도**, F2. 채움이나 나감의 비움이 다음 라운드를 부르는 것은 그 쓰기가 게이트를 뒤집어 새 노드를 내거나 노드를 내보낼 때뿐이다, 원장 §4) |
- 보충:
  > "채움이나 나감의 비움이 다음 라운드를 부르는 것은 그 쓰기가 게이트를 뒤집어 아직 생기지 않은 노드를 내거나 아직 나가지 않은 노드를 내보낼 때뿐이고, 노드마다 정착 안에서 채움 한 번·비움 한 번뿐이라 같은 게이트가 다시 뒤집혀도 새 라운드를 낳지 않는다." (`03-mental-model.md:116`)
  > "같은 정착 안에서 닫혔다 다시 열린 게이트의 노드는 이미 생긴 노드라 채움이 없다), 리스너 되먹임 파동, `onChange` 중첩의 다섯. 상한은 루프를 잇는 고리 하나만 끊는다." (`03-mental-model.md:116`)
  > "채움은 전이 단계에 있지만 순위는 단계를 가로지른다: 생긴 노드의 `controls.unsetValue`가 참이면 채우지 않는다(안 그러면 로드에서 지운 값이 바로 다시 채워진다)." (`03-mental-model.md:124`)
  > 편집자 결정(18C-91): "【추론】 한 진입에서 쓰인 값의 두 번 해석(`reviews/round-18-owner-answers.md:37`의 U7)에서 첫째 해석의 목록은 직전 커밋의 유효 목록이고, 마운트·`reset()`이면 `schemaType`이다." (`reviews/round-18-closing.md:2513`)
  > 편집자 결정(18C-91): "【추론】 둘째 해석은 그 진입의 전이 단계에서 커밋 전에 하며, 목록이 바뀐 노드에서만 결과를 바꾼다(`interpret`가 멱등)." (`reviews/round-18-closing.md:2514`)
  > 반영 칸(union O7·O8, U7): "U7: 한 진입에서 쓰인 노드(입력 쓰기·`setValue`·로드·채움)는 그 진입의 전이 단계에서 최종 유효 목록으로 한 번 더 해석하며, 쓰이지 않은 노드는 다시 해석하지 않는다." (`reviews/round-18-owner-answers.md:37`)
  > 편집자 결정(18C-105): "【추론】 전이 단계의 재해석은 전이 쓰기다." (`reviews/round-18-closing.md:2938`)
  > 편집자 결정(18C-105): "【추론】 그 결과가 원본을 바꾸고 게이트를 뒤집으면 채움·비움과 같은 규칙으로 다음 라운드를 부르며, 라운드 상한(게이트 가진 조각 수 + 노드 게이트 수 + 1, SETTLE-005)은 그대로다." (`reviews/round-18-closing.md:2939`)
  > 편집자 결정(18C-105): "【추론】 한 노드는 한 라운드에 한 번만 다시 해석한다." (`reviews/round-18-closing.md:2940`)
- 상태: 현행
- 출처: `adr/0007-settle-cycle.md:39`(정본), `02-target-overview.md:161`, `08-design-a-to-z.md:246`, `03-mental-model.md:108,116`, `reviews/round-18-closing.md:2513-2514`, `reviews/round-18-owner-answers.md:37`, `reviews/round-18-closing.md:2908-2910,2914`, `reviews/round-18-closing.md:2938-2940`
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:7` A-1, 채움은 노드가 생길 때 한 번), 소유자 답(`reviews/round-9-spec.md:52` 읽기2 채우기 원천), 소유자 답(`reviews/round-9-spec.md:56` 읽기2 시점(A/B)), 소유자 답(`reviews/round-13-owner-answers.md:8` 13라운드 답 2, 나감의 비움), 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2 ㄴ), 편집자 결정(10라운드, `07-conclusions.md:106` 4.22), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-91), 소유자 답(`reviews/round-18-owner-answers.md:37` union O7·O8; U7 두 번 해석), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-104), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105)
- 라운드: 18
- 까닭: `07-conclusions.md:106`, `reviews/round-18-closing.md:2556-2564`, `reviews/round-18-owner-answers.md:37`
- 충돌:
  > `reviews/round-18-closing.md:2513`의 "첫째 해석의 목록은 직전 커밋의 유효 목록이고, 마운트·`reset()`이면 `schemaType`이다"는 18C-104의 결정과 다르다: 쓰기 경계에서는 게이트와 무관한 정적 목록(`schemaType`, `nullable`)으로 해석하며, 로드(마운트, `FormHandle.reset()`, `resetSubtree()`)도 같다(WRITE-098). 18C-104의 결정이 이긴다(`reviews/round-18-closing.md:2908-2909,2914`).
  > `reviews/round-18-closing.md:2514`의 "목록이 바뀐 노드에서만 결과를 바꾼다(`interpret`가 멱등)"는 18C-104의 결정과 다르다: 전이 단계에서는 최종 유효 목록이 정적 목록보다 좁은 노드만, 첫째 해석의 결과가 아니라 원래 쓰인 값을 최종 유효 목록으로 다시 해석해 원본으로 삼는다(WRITE-098). 18C-104의 결정이 이긴다(`reviews/round-18-closing.md:2910`).

### SETTLE-006 커밋 단계 — revision 일괄, 커밋 번호, controls.resetInteraction 판정

- 결정:
  > | 단계 | 하는 일 | 예산 |
  > | ---- | ------- | ---- |
  > | 커밋 | 계산 결과를 트리에 반영하고 정착을 확정한다. `controls.resetInteraction`(옛 `&pristine`, `dirty`·`touched` 초기화)을 최종 트리의 식 값으로 판정한다. 원본에는 쓰지 않는다. 배달 집합 전체의 `revision`을 한 번에 올리고(F16) 단조 **커밋 번호**를 매긴다(F28) | — |
- 보충:
  > "커밋     revision 갱신. controls.resetInteraction(옛 &pristine) 판정 — 시점은 controls.unsetValue와 같다(로드는 로드된 값으로, 런타임은 거짓→참 에지)" (`03-mental-model.md:109`)
- 상태: 현행
- 출처: `adr/0007-settle-cycle.md:40`(정본), `02-target-overview.md:162`, `08-design-a-to-z.md:247`, `03-mental-model.md:109`
- 닫은 사람: 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`), 소유자 답(`reviews/round-10-owner-answers.md:32` E-5, `&resetInteraction` 이름), 소유자 답(`reviews/round-12-owner-answers.md:13` §5, resetInteraction 동작은 clearValue와 같음)
- 라운드: 12
- 까닭: `adr/0007-settle-cycle.md:40`(F16·F28)

### SETTLE-007 통지 단계 — 루트 디스패처 1회, 유효 스키마가 바뀐 노드도 배달

- 결정:
  > | 단계 | 하는 일 | 예산 |
  > | ---- | ------- | ---- |
  > | 통지 | 루트 디스패처가 문서 순서 위 → 아래로 1회 배달한다. 유효 스키마가 바뀐 노드도 배달 집합에 든다(ADR 0008) | 최외곽 진입의 되먹임 사슬당 파동 25 (ADR 0008 §2 규칙 4), `onChange` 중첩 25 (ADR 0008 §5) |
- 보충: 없음
- 상태: 현행
- 출처: `adr/0007-settle-cycle.md:41`(정본), `02-target-overview.md:163`, `08-design-a-to-z.md:248`, `03-mental-model.md:110`
- 닫은 사람: 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`), 편집자 결정(10라운드, 유효 스키마가 바뀐 노드를 배달 집합에, `07-conclusions.md:96`)
- 라운드: 10
- 까닭: `07-conclusions.md:96`

### SETTLE-008 검증 단계 — 커밋 번호 스탬프, 마이크로태스크 합치기

- 결정:
  > | 단계 | 하는 일 | 예산 |
  > | ---- | ------- | ---- |
  > | 검증 | `validator(작성된 스키마, 방출 값)`. **커밋 번호**를 스탬프하고 비동기로 요청하며, 늦게 온 결과는 버린다. 실행은 마이크로태스크에 모아 최신 커밋 번호 하나만 돌린다(14라운드 답 O-6) | — |
- 보충:
  > "검증 요청은 최외곽 진입당 1회이나 실행은 마이크로태스크에 모아 최신 커밋 번호 하나만 돌린다(14라운드 답 O-6. 늦은 결과를 버리는 스탬프 규칙과 같은 방향)." (`03-mental-model.md:114`)
  > "첫 통지의 stale 검증 결과는 커밋 번호 스탬프(F28)가 버린다." (`adr/0007-settle-cycle.md:107`)
- 상태: 현행
- 출처: `adr/0007-settle-cycle.md:42`(정본), `02-target-overview.md:164`, `08-design-a-to-z.md:249`, `03-mental-model.md:111,114`, `adr/0007-settle-cycle.md:107`
- 닫은 사람: 소유자 답(`reviews/round-14-owner-answers.md:12` O-6), 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`)
- 라운드: 14
- 까닭: `adr/0007-settle-cycle.md:42`(F28)

### SETTLE-009 게이트 셋이 같은 계산을 탐 — 라이프사이클 하나

- 결정:
  > **`if/then/else`, 분기 조각의 게이트, `controls.active`(노드·조각)는 같은 계산을 탄다.** 라이프사이클이 하나다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0007-settle-cycle.md:45#1-2`(정본)
- 닫은 사람: 소유자 답(`00-goals.md:148` G4·G5), 소유자 답(`reviews/round-1.md:176` §5의 전환, 라이프사이클의 단일화에 동의), 소유자 답(`reviews/round-10-owner-answers.md:8` A-2), 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`)
- 라운드: 10
- 까닭: `adr/0007-settle-cycle.md:26`

### SETTLE-010 원본을 쓰는 단계는 파생과 전이뿐 — 커밋된 트리는 순수 함수

- 결정:
  > 원본을 쓰는 것은 파생과 전이뿐이고 둘 다 표시로 돌아간다. 그래서 커밋된 트리는 (스키마, 트리 전체의 `raw`·`extras`)의 순수 함수다(F9, P3). 상태는 이 둘뿐이다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0007-settle-cycle.md:46`(정본), `02-target-overview.md:170`, `08-design-a-to-z.md:251`, `03-mental-model.md:114`
- 닫은 사람: 원리(P3, `03-mental-model.md:15`), 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`), 편집자 결정(10라운드 5차 본문, 상태 칸 `selection`을 지움(4.25), `adr/0007-settle-cycle.md:11`)
- 라운드: 10
- 까닭: `03-mental-model.md:15`

### SETTLE-011 비수렴 — 원본 B 커밋과 그 형상

- 결정:
  > 정착의 세 예산(호스트 바퀴, 파생 라운드, 전이 라운드) 가운데 하나라도 상한을 넘기면, 그 정착의 자동 쓰기 — 채움, `controls.derived`, `controls.injectTo`, `controls.unsetValue`, 나감의 비움 — 를 모두 뺀 **원본 B**를 커밋한다. `controls.unsetValue`가 지운 값도 되돌린다(4.0의 4.11 행).
  > 커밋되는 형상은 원본 B로 한 번 더 계산한 것이며, 그 바퀴도 상한에 걸리면 마지막 바퀴의 활성 집합으로 고정한다.
- 보충:
  > "지원 범위 밖 구석이 하나만 있어도 그 정착의 자동 쓰기가 트리 전체에서 빠진다. 관여하지 않은 필드의 `default`도 빠진다. 마운트라면 기본값 없는 폼이 된다. 이것은 예산 초과 신호로 드러나며, 공개 문서 `inject-to.md` 38행의 "earlier hops still apply"와 어긋나므로 이주 안내에 올린다." (`06-conclusions.md:198`)
  > 편집자 결정(18C-105): "【추론】 상한을 넘기면 SETTLE-011대로 원본 B를 커밋하고, 원본 B에는 쓰기 경계의 해석(정적 목록)만 남는다." (`reviews/round-18-closing.md:2942`)
  > 편집자 결정(18C-105): "【추론】 전이 단계의 재해석은 게이트 상태가 최종이 아니므로 원본 B에서 버린다." (`reviews/round-18-closing.md:2943`)
  > 편집자 결정(18C-105): "【추론】 원본 B에 남은 값이 좁혀진 유효 목록 밖이면 경고등이 켜진다." (`reviews/round-18-closing.md:2944`)
- 상태: 현행
- 출처: `adr/0007-settle-cycle.md:47`(정본, #1–#2·#4), `03-mental-model.md:116`, `02-target-overview.md:169`, `08-design-a-to-z.md:254`, `adr/0007-settle-cycle.md:59`, `06-conclusions.md:196`, `reviews/round-18-closing.md:2942-2944`
- 닫은 사람: 편집자 결정(7–8라운드 수렴 D-31, `06-conclusions.md:196`), 편집자 결정(10라운드, 원본 B는 unsetValue가 지운 값도 되돌림, `07-conclusions.md:98`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105)
- 라운드: 18
- 까닭: `06-conclusions.md:197`
- 충돌:
  > `06-conclusions.md:196`의 "원본 B, 곧 그 정착의 자동 쓰기를 모두 뺀 원본과 그 형상을 커밋하고 `settle.status`를 예산 초과로 표시한다."은 정본과 다르다(`settle.status`). 정본이 이긴다(`adr/0007-settle-cycle.md:47`).
  > `adr/0007-settle-cycle.md:47`의 "정착의 세 예산(호스트 바퀴, 파생 라운드, 전이 라운드) 가운데 하나라도 상한을 넘기면"은 18라운드 결정과 다르다: 재귀 펼침의 멈춤도 예산 부류의 정착 오류로 원본 B를 커밋한다(`exceededBudget: 'recursion'`(가칭), ERROR-190). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:28`).

### SETTLE-012 비수렴의 표시 — diagnostics.status degraded, cause는 예산

- 결정:
  > 결과는 `diagnostics.status = 'degraded'`(`cause`는 예산)로 둔다.
- 보충: 없음
- 상태: 중복(→ ERROR-132, ERROR-133)
- 출처: `adr/0007-settle-cycle.md:47#3`(정본), `03-mental-model.md:116`, `02-target-overview.md:169`, `08-design-a-to-z.md:254`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 편집자 결정(17라운드, ADR 0014 4판 채택, `adr/0014-error-policy.md:201`)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:201`

### SETTLE-013 diagnostics.iterations — 초과한 예산이 쓴 반복 횟수

- 결정:
  > `diagnostics.iterations`는 초과한 예산이 쓴 반복 횟수(상한값)다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0007-settle-cycle.md:47#5`(정본), `03-mental-model.md:116`
- 닫은 사람: 편집자 결정(10라운드 5차 본문, `adr/0007-settle-cycle.md:11`; 8라운드 N4 제안 `06-conclusions.md:369`, 10라운드 그대로 `07-conclusions.md:348`)
- 라운드: 10
- 까닭: `06-conclusions.md:373`

### SETTLE-014 비수렴의 throw — 모든 환경, 커밋·통지 뒤 사슬 끝, 끄는 스위치 없음

- 결정:
  > 모든 환경에서 커밋·통지 뒤 사슬 끝에서 throw하며 끄는 스위치는 없다(17라운드 소유자 답 R17-1 나: "망가진 값을 올리는게 더 위험하겠다". 5.0의 1이 정한 '개발 모드 throw, 프로덕션은 신호만'을 대체한다, ADR 0014 4판).
- 보충:
  > "예산 초과는 모든 환경에서 커밋·통지 뒤 사슬 끝에서 throw한다(17라운드 소유자 답 R17-1 나: "나 허용. 망가진 값을 올리는게 더 위험하겠다". 12라운드 §4·10라운드 B-1·14라운드 O-4 가는 이 답으로 대체되었다)." (`03-mental-model.md:116`)
- 상태: 중복(→ ERROR-070, ERROR-072)
- 출처: `adr/0007-settle-cycle.md:47#6`(정본), `03-mental-model.md:116`, `02-target-overview.md:169`, `08-design-a-to-z.md:254`, `adr/0007-settle-cycle.md:145`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:9`

### SETTLE-015 degraded의 지속과 제출 거부 — getValue는 막지 않음

- 결정:
  > `degraded`는 다음 로드까지 남고(지속은 14라운드 답 O-2 가) 그 동안 폼의 제출 경로가 `SchemaFormError`로 거부한다(`getValue()`는 막지 않는다).
- 보충:
  > "이 상태는 다음 로드(마운트·전체 교체·`reset`)까지 남는다(지속은 14라운드 답 O-2 가. 모양은 ADR 0014 4판 §5)." (`03-mental-model.md:116`)
  > "닫힘. 지속은 14라운드 답 O-2 가이고, 그 동안의 제출 거부와 throw 정책은 17라운드 소유자 답 R17-1 나다: 모든 환경에서 사슬 끝에서 던지고 `degraded` 동안 제출 경로가 거부하며 끄는 스위치는 없다(ADR 0014 4판). 제출이 막힐 때 호스트가 폼 수준 표시를 그릴 자리는 제출 거부의 `SchemaFormError`와 `onDiagnosticsChange`다." (`adr/0007-settle-cycle.md:145`)
- 상태: 중복(→ ERROR-135, ERROR-138, ERROR-141)
- 출처: `adr/0007-settle-cycle.md:47#7`(정본), `adr/0007-settle-cycle.md:145`, `03-mental-model.md:116`, `02-target-overview.md:169`, `08-design-a-to-z.md:254`
- 닫은 사람: 소유자 답(`reviews/round-14-owner-answers.md:8` O-2, 지속), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1, 제출 거부)
- 라운드: 17
- 까닭: `reviews/round-14-owner-answers.md:8`, `reviews/round-17-owner-answers.md:9`

### SETTLE-016 상한은 루프를 잇는 고리 하나만 끊음 — 루프를 막지도 권하지도 않음

- 결정:
  > 상한은 루프를 잇는 고리 하나만 끊는다 — 정착 예산은 자동 쓰기, 되먹임 파동은 그 파동의 되먹임 쓰기, `onChange` 중첩은 그 호출(원장 §4). 루프의 가능성을 막지는 않지만 루프를 권하는 설계도 아니다.
- 보충:
  > "최외곽 쓰기는 결코 버리지 않고, 커밋된 것은 반드시 통지된다(P2, P5)." (`03-mental-model.md:116`)
  > "소유자(12라운드): "루프의 가능성을 제한하지는 않는다. 상한을 초과하면 오류를 표시한다. React 훅과 같은 설계다. 구태여 막지 않을 뿐이지 루프를 만드는 걸 권하는 설계는 절대 아니다."" (`03-mental-model.md:116`)
- 상태: 현행
- 출처: `adr/0007-settle-cycle.md:47#9-10`(정본), `03-mental-model.md:116`, `02-target-overview.md:169`, `08-design-a-to-z.md:254`, `adr/0007-settle-cycle.md:21-22`
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:10` A-4), 소유자 답(`reviews/round-10-owner-answers.md:13` B-1, 끝 문장), 소유자 답(`reviews/round-1.md:179` 순환), 소유자 답(`reviews/round-2.md:116` 상한에 걸렸을 때, 쓰기를 막지 않음), 편집자 결정(7–8라운드 수렴 D-17·D-31, 고리의 자리, `06-conclusions.md:158,196`)
- 라운드: 10
- 까닭: `reviews/round-10-owner-answers.md:10`, `reviews/round-2.md:116`

### SETTLE-017 비용의 상한(G6) — 순회 범위, 되돌림 기록, 역의존 표, 라운드 합산, 컴파일 공유

- 결정:
  > **비용의 상한(G6, 14라운드).** 파생·전이·커밋과 원본 B의 기록은 이번 정착의 재계산 목록과 자동 쓰기 기록만 순회한다(생긴 노드의 채움과 나간 하위 트리의 순회, 그리고 R17-2 ㄴ의 나감 비움이 도는 꺼진 조각이 선언한 하위 트리와 잠복 하위 트리의 순회는 제외). 트리 전체 순회는 로드에서만 허용한다. 원본 B는 스냅숏이 아니라 자동 쓰기의 되돌림 기록으로 만든다. 청사진이 `controls`의 식과 `controls.watch`의 경로에서 역의존 표(경로 → 그 경로를 읽는 식을 가진 노드)를 정적으로 만들고, 표시 단계는 쓰기 노드의 조상과 그 역의존 노드의 조상을 재계산 목록에 넣는다(ADR 0005의 역색인 기각은 검증기 `if` 게이트의 건너뛰기에만 해당한다). 한 정착의 라운드 상한은 파생 25 + 전이 상한(트리 전체의 게이트 가진 조각 수 + 노드 게이트 수 + 1)이며, 전이 라운드는 쓰기를 낸 라운드만 세고 `if/then/else`는 게이트 하나로 세며, 파생 라운드는 전이 뒤에도 이어 센다(곱하지 않는다). 자식 호스트의 재계산은 정착당 덧씌움 집합의 서로 다른 값 수만큼이며 그 합은 호스트 바퀴 예산에 함께 센다. `if` 게이트의 컴파일은 작성된 스키마의 위치당 1회이며 폼 인스턴스 사이에 공유한다(ADR 0004).
- 보충:
  > "나감의 비움은 나간 하위 트리(꺼진 조각이 선언한 하위 트리와 잠복 하위 트리를 포함한다)를 위에서 아래로 한 번 순회하며 조상의 정책을 인자로 내려보낸다(노드당 상수, 위로 거슬러 오르지 않는다). 청사진이 '하위 트리에 정책 선언 없음'을 표시하면 Form 속성이 꺼져 있을 때 순회를 건너뛴다." (`03-mental-model.md:118`)
  > "토글 없는 키 입력 한 번의 검증기 호출은 조상 경로의 `if` 게이트 수에 묶인다(14라운드 고속성 검증의 어림, `reviews/raw-round14-speed.md`)." (`08-design-a-to-z.md:255`)
  > 편집자 결정(18C-13): "【추론】 합성 노드를 읽는 식은 그 하위 트리 전체에 기댄다." (`reviews/round-18-closing.md:344`)
  > 편집자 결정(18C-13): "【추론】 따라서 역의존 조회(SETTLE-017)는 값이 바뀐 노드의 경로와 그 조상·자손 경로를 읽는 식을 모두 찾는다." (`reviews/round-18-closing.md:345`)
- 상태: 현행
- 출처: `adr/0007-settle-cycle.md:48`(정본), `03-mental-model.md:118`, `08-design-a-to-z.md:255-256`, `reviews/round-18-closing.md:344-345`, `reviews/round-18-closing.md:2747`
- 닫은 사람: 원리(G6, `00-goals.md:150`), 편집자 결정(14라운드 F-11, `reviews/round-14-values-check.md:74`), 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2 ㄴ, 나감 비움 순회의 범위), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-13), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-95)
- 라운드: 18
- 까닭: `reviews/round-14-values-check.md:12`, `reviews/round-18-closing.md:370-376`, `reviews/round-18-closing.md:2749-2750`
- 충돌:
  > `adr/0007-settle-cycle.md:48`의 "트리 전체 순회는 로드에서만 허용한다"는 18라운드 결정과 다르다: 트리 전체 순회는 로드와, 쓰기가 닿은 하위 트리를 도는 전체 교체 쓰기에서만 허용한다(SETTLE-047). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:2747`).

### SETTLE-018 호스트 — 출발점 고정

- 결정:
  > | 규칙 | 내용 | 근거 |
  > | ---- | ---- | ---- |
  > | 출발점 고정 | `A := 게이트 없는 조각 ∪ 상속 overlay`. 게이트 없는 조각은 본체 `properties`, 게이트 없는 `allOf` 항목, 게이트 없는 `oneOf`·`anyOf` 분기다. 직전 커밋의 `active`는 **읽지 않는다** — 생긴 노드의 판정(전이)과 평가 순서 힌트(F13)로만 쓴다. 노드 게이트도 게이트 가진 조각처럼 꺼진 채 출발한다 | E1·E6 |
- 보충: 없음
- 상태: 현행
- 출처: `adr/0007-settle-cycle.md:54`(정본), `03-mental-model.md:101-103`, `08-design-a-to-z.md:244`, `02-target-overview.md:159`, `adr/0002-guard-fragment-model.md:113-117,119`(FRAGMENT-017과 겹침)
- 닫은 사람: 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`), 소유자 답(`reviews/round-10-owner-answers.md:8` A-2, 노드 게이트), 편집자 결정(14라운드 F-12 (b), 노드 게이트의 출발 상태, `reviews/round-14-values-check.md:76`)
- 라운드: 14
- 까닭: `adr/0007-settle-cycle.md:54`(E1·E6)

### SETTLE-019 호스트 — 조각은 트리, 전순서, 노드 게이트의 자리

- 결정:
  > | 규칙 | 내용 | 근거 |
  > | ---- | ---- | ---- |
  > | 조각은 트리 | 중첩 조각은 감싸는 조각이 활성일 때만 순회한다. 전순서(호스트에서 조각까지의 경로를 (키워드 순위, 배열 인덱스) 쌍의 열로 보고 사전식으로 비교한 것. 키워드 순위는 본체 `properties` < `allOf` 항목 < `if/then/else` < `oneOf`·`anyOf` 분기. JSON 키 순서에 기대지 않는다). 노드 게이트는 그 노드를 선언한 조각 바로 뒤에, 같은 조각 안에서는 선언 순서로 든다 | E3 |
- 보충: 없음
- 상태: 현행
- 출처: `adr/0007-settle-cycle.md:55`(정본), `03-mental-model.md:103,126`
- 닫은 사람: 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`), 편집자 결정(14라운드 F-12 (b)·(d), 노드 게이트의 전순서 자리와 전순서의 정의, `reviews/round-14-values-check.md:76`)
- 라운드: 14
- 까닭: `adr/0007-settle-cycle.md:55`(E3)
- 충돌:
  > `adr/0007-settle-cycle.md:55`의 "키워드 순위는 본체 `properties` < `allOf` 항목 < `if/then/else` < `oneOf`·`anyOf` 분기"는 18라운드 결정과 다르다: 같은 호스트의 `oneOf` 분기는 모든 `anyOf` 분기보다 앞이다(FRAGMENT-049). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:238-239`).

### SETTLE-020 호스트 — 매 바퀴 모든 게이트 평가(가우스-자이델)

- 결정:
  > | 규칙 | 내용 | 근거 |
  > | ---- | ---- | ---- |
  > | 매 바퀴 전부 | 한 바퀴에 **모든** 게이트(조각 게이트와 노드 게이트, 켜진 것과 꺼진 것 모두)를 평가한다. 한 바퀴 안의 켜짐·꺼짐은 뒤의 게이트에 즉시 반영된다(가우스-자이델) | E4, F3 |
- 보충: 없음
- 상태: 현행
- 출처: `adr/0007-settle-cycle.md:56`(정본), `adr/0002-guard-fragment-model.md:113-117,119`(FRAGMENT-017과 겹침)
- 닫은 사람: 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`), 소유자 답(`reviews/round-10-owner-answers.md:8` A-2, 노드 게이트)
- 라운드: 10
- 까닭: `adr/0007-settle-cycle.md:56`(E4·F3)

### SETTLE-021 호스트 — 게이트 입력은 검증기가 볼 값

- 결정:
  > | 규칙 | 내용 | 근거 |
  > | ---- | ---- | ---- |
  > | 게이트 입력 | 게이트는 **검증기가 볼 값**을 본다 — `A`로 합성한 local에 투영(`omitEmpty`·`omitTrailing`·null)을 적용한 것. `if`는 검증기 플러그인이 컴파일한 것으로, `controls.active`는 표현식으로 평가한다. `extras`(선언되지 않은 키의 값)도 게이트 입력에 든다(원장 §5). 폼은 `if`의 내용에 관여하지 않는다. 예외는 하나: 호스트 자신의 `raw`가 비객체이면 `G = {}` | E5, P1 |
- 보충: 없음
- 상태: 현행
- 출처: `adr/0007-settle-cycle.md:57`(정본), `02-target-overview.md:159`, `08-design-a-to-z.md:244`, `03-mental-model.md:104`
- 닫은 사람: 소유자 답(`reviews/round-1.md:177` 가드는 방출 값), 소유자 답(`reviews/round-10-owner-answers.md:38,40` E-23·E-19, 폼은 if의 내용에 관여하지 않음), 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`)
- 라운드: 10
- 까닭: `reviews/round-1.md:177`

### SETTLE-022 호스트 — 비단조 재평가와 호스트 바퀴 상한

- 결정:
  > | 규칙 | 내용 | 근거 |
  > | ---- | ---- | ---- |
  > | 비단조 재평가 | 참이면 켜고 거짓이면 끈다. `A`가 바뀌면 다시 돈다. 상한 = **게이트 가진 조각 수 + 노드 게이트 수 + 1** | E6, F3, 4.23 |
- 보충: 없음
- 상태: 현행
- 출처: `adr/0007-settle-cycle.md:58`(정본), `adr/0007-settle-cycle.md:37`, `03-mental-model.md:102`, `adr/0002-guard-fragment-model.md:113-117,119`(FRAGMENT-017과 겹침)
- 닫은 사람: 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`), 편집자 결정(10라운드, 상한에 노드 게이트 수를 더함, `07-conclusions.md:115` 4.23)
- 라운드: 10
- 까닭: `adr/0007-settle-cycle.md:58`(E6·F3·4.23)

### SETTLE-023 호스트 — 상한 초과

- 결정:
  > | 규칙 | 내용 | 근거 |
  > | ---- | ---- | ---- |
  > | 상한 초과 | 원본 B를 커밋하고(§1), 형상은 원본 B로 한 번 더 계산하며 그 바퀴도 상한에 걸리면 마지막 바퀴의 `A`로 고정한다. 결과는 `diagnostics.status = 'degraded'`(`cause`는 예산)로 둔다. 자식 호스트의 초과도 루트의 `diagnostics`에서 관측된다. 모든 환경에서 사슬 끝에서 throw한다(17라운드 소유자 답 R17-1 나) | E6, F12, 5.0의 1, ADR 0014 |
- 보충: 없음
- 상태: 현행
- 출처: `adr/0007-settle-cycle.md:59`(정본), `adr/0007-settle-cycle.md:47`, `adr/0002-guard-fragment-model.md:115#3-5`(FRAGMENT-018, 같은 규칙)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 편집자 결정(7–8라운드 수렴 D-31, `06-conclusions.md:196`)
- 라운드: 17
- 까닭: `adr/0007-settle-cycle.md:59`(E6·F12)

### SETTLE-024 호스트 — 상속 overlay

- 결정:
  > | 규칙 | 내용 | 근거 |
  > | ---- | ---- | ---- |
  > | 상속 overlay | 끌어올린 조각의 `then`이 손자를 선언하면 청사진이 그 선언을 자식 호스트의 overlay로 귀속시킨다. 부모의 바퀴가 overlay 집합을 바꾸면 자식을 **바퀴 안에서** 재계산하되 (`raw`, overlay 집합)으로 메모한다 | E12, F5 |
- 보충: 없음
- 상태: 현행
- 출처: `adr/0007-settle-cycle.md:61`(정본), `adr/0007-settle-cycle.md:48`
- 닫은 사람: 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`), 편집자 결정(10라운드 5차 본문, 메모 키에서 `selection`을 지움(4.25), `adr/0007-settle-cycle.md:11`)
- 라운드: 10
- 까닭: `adr/0007-settle-cycle.md:61`(E12·F5)

### SETTLE-025 호스트 — 합성(local, emit)과 emit의 키 순서

- 결정:
  > | 규칙 | 내용 | 근거 |
  > | ---- | ---- | ---- |
  > | 합성 | `local := compose(A)`, `emit := project(local)`. `delete` 없이 조각이 선언한 키만 패치한다(F13). `emit`의 키 순서는 스키마 선언 순서, `extras`는 뒤에 받은 순서 | E10, F13, 4.12 |
- 보충:
  > 편집자 결정(18C-39): "【추론】 branch 객체 노드의 `local`과 `emit`의 키 순서는 결정적이다." (`reviews/round-18-closing.md:1053`)
  > 편집자 결정(18C-39): "【추론】 쓰기의 순서나 이력과 무관하다." (`reviews/round-18-closing.md:1054`)
  > 편집자 결정(18C-39): "【추론】 첫째, 그 호스트의 유효 스키마 `options.propertyKeys`에 적힌 키가 그 순서로 먼저 온다." (`reviews/round-18-closing.md:1055`)
  > 편집자 결정(18C-39): "【추론】 둘째, 나머지 선언된 자식 키는 청사진 전순서(ADR 0002)에서 그 이름의 첫 선언 자리 순이다." (`reviews/round-18-closing.md:1056`)
  > 편집자 결정(18C-39): "【추론】 조각에서만 선언된 키와 공유 노드의 키도 같다." (`reviews/round-18-closing.md:1057`)
  > 편집자 결정(18C-39): "【추론】 셋째, `extras`는 그 뒤에 원본에 들어온 순서(삽입 순서)로 온다." (`reviews/round-18-closing.md:1058`)
  > 편집자 결정(18C-39): "【추론】 형상에 없는 키는 없다." (`reviews/round-18-closing.md:1059`)
  > 편집자 결정(18C-39): "【추론】 F13의 "조각이 선언한 키만 패치"는 다시 계산하는 키의 범위로 읽는다." (`reviews/round-18-closing.md:1065`)
- 상태: 현행
- 출처: `adr/0007-settle-cycle.md:62`(정본), `adr/0007-settle-cycle.md:151`, `reviews/round-18-closing.md:1053-1070,1076-1078`
- 닫은 사람: 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:79`; 합성 규칙은 4차 본문, emit의 키 순서 Q14가 열림), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-39)
- 라운드: 18
- 까닭: `adr/0007-settle-cycle.md:62`(E10·F13·4.12), `reviews/round-18-closing.md:1072-1074`
- 충돌:
  > `adr/0007-settle-cycle.md:62`의 "`delete` 없이 조각이 선언한 키만 패치한다(F13)"는 18라운드 결정과 다르다: 다시 계산하는 키는 그 조각이 선언한 키뿐이고, 키 집합이 바뀌면 그 호스트의 `local`을 선언 순서로 O(키 수) 새로 지으며 `delete`는 없다(SETTLE-042). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:1063-1066`).

### SETTLE-026 고정점이 없는 스키마는 지원 범위 밖 — 결정성과 기본으로 남는 원본

- 결정:
  > **고정점이 없는 스키마는 지원 범위 밖이다.** 게이트 의존 관계에 부정을 포함한 순환이 있으면 결과는 상한에서 결정적이되 임의적이고 `degraded`(`cause`는 예산)로 표시된다(F3). 대표적인 진동은 `if: { not: { required: ['x'] } }, then: { properties: { x: { default: 1 } } }`다. 채움이 노드가 생길 때 한 번이 된 뒤로 이런 자기 게이트 순환은 런타임에는 사라지고 로드에만 남는다(`07-conclusions.md` 3.7). 고정점이 둘 이상이면(R7) 선언 순서에 대해 결정적인 하나로 정착하며, 어느 경우에도 원본은 기본으로 남는다.
- 보충:
  > "ADR 0007 57행 "고정점이 없는 스키마는 지원 범위 밖"과 D-2에 따라 예산 초과다. 4.11에 따라 원본 B를 커밋한다." (`06-conclusions.md:231`)
  > "결과는 명시적 쓰기를 표시한 원본 B에서 시작한 반복의 극한, 곧 `{}`다." (`06-conclusions.md:236`)
  > "유일한 해가 자기 지지 `default`라면 4.16에서 허용되지 않으므로 4.15의 경우가 된다. ADR 0007 57행의 지원 범위를 "고정점의 존재"가 아니라 "원본 B에서 시작한 반복이 예산 안에 수렴하는가"로 다시 적는다." (`06-conclusions.md:240`)
- 상태: 현행
- 출처: `adr/0007-settle-cycle.md:64#1-5`(정본), `adr/0007-settle-cycle.md:116`, `06-conclusions.md:231,236,240`, `adr/0002-guard-fragment-model.md:113-117,119`(FRAGMENT-017과 겹침)
- 닫은 사람: 원리(D-2, `reviews/round-5-derivations.md:41`), 편집자 결정(7–8라운드 수렴 D-24–D-26, `06-conclusions.md:231,236,240`), 편집자 결정(10라운드, 4.15–4.21 그대로, `07-conclusions.md:100`), 편집자 결정(17라운드, 관측 이름 `degraded`, ADR 0014 4판 채택, `adr/0014-error-policy.md:201`)
- 라운드: 17
- 까닭: `06-conclusions.md:240`, `07-conclusions.md:100`

### SETTLE-027 로드는 새 수명 — 전체 교체가 에지와 생김의 기준을 비움, 로드 때의 발화

- 결정:
  > 전체 교체는 **에지와 생김의 기준(직전 커밋)을 비운다**(F4). 그래서 로드에서는 최종 형상의 노드가 모두 생긴 노드로서 채움을 받는다. `controls.injectTo`는 직전 값이 없으므로 발화한다(`fire`, 소유자 동의). `controls.unsetValue`는 로드된 값으로 평가해 참이면 지우고 거짓이면 둔다(소유자 답 21).
- 보충:
  > "없음인 값은 모두 채움을 받고, `controls.injectTo`·`controls.derived`는 발화하며, `controls.unsetValue`는 로드된 값으로 평가해 참이면 지운다." (`08-design-a-to-z.md:253`)
- 상태: 분할됨(→ SETTLE-046, SETTLE-048, WRITE-090)
- 출처: `adr/0007-settle-cycle.md:92#1-4`(정본), `02-target-overview.md:168`, `08-design-a-to-z.md:253`
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:19` D-6, 로드 시 injectTo 발화), 소유자 답(`reviews/round-10-owner-answers.md:29,39` E-21, 로드의 unsetValue), 편집자 결정(10라운드, 21의 최초 로드를 모든 로드로 읽음, `07-conclusions.md:251`), 소유자 답(`reviews/round-12-owner-answers.md:13` §5 (a) 모든 로드에서 로드된 값으로 평가), 소유자 답(`reviews/round-12-owner-answers.md:19` §9 로드에서 `&derived`), 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`), 소유자 답(`reviews/round-18-owner-answers.md:26` 18C 검토 4번; 대체)
- 라운드: 18
- 까닭: `07-conclusions.md:251`, `adr/0007-settle-cycle.md:92`(F4)

### SETTLE-028 런타임 에지 — 에지에서만 쓰고 부분 쓰기를 되돌리지 않음

- 결정:
  > 런타임에는 둘 다 에지에서만 쓴다. `controls.injectTo`는 **원천의 방출 값이 직전 커밋과 다를 때**, `controls.unsetValue`는 식이 거짓에서 참이 될 때다. 그래서 사용자의 부분 쓰기를 되돌리지 않는다(F11). 한 정착 안에서 에지는 한 번만 소비된다(§1).
- 보충:
  > "참에서 거짓으로 돌아갈 때 `controls.unsetValue`는 아무것도 하지 않는다." (`02-target-overview.md:167`)
- 상태: 현행
- 출처: `adr/0007-settle-cycle.md:92#5-8`(정본), `02-target-overview.md:167`, `08-design-a-to-z.md:252`
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:39` E-21, 런타임은 경계에서만), 편집자 결정(10라운드, 에지 기준점은 직전 커밋, `07-conclusions.md:91`), 편집자 결정(10라운드, 참→거짓은 무동작으로 읽음, `07-conclusions.md:251`), 소유자 답(`reviews/round-12-owner-answers.md:13` §5 (b) 참→거짓은 무동작)
- 라운드: 12
- 까닭: `adr/0007-settle-cycle.md:92`(F11), `07-conclusions.md:251`

### SETTLE-029 D-2 — 형상은 상태의 순수 함수, 출발점 고정과 비단조 재평가

- 결정:
  > | # | 도출 |
  > | - | ---- |
  > | D-2 | 형상은 상태의 순수 함수(P3)이므로 출발점 고정 + 비단조 재평가. 고정점이 없는 스키마는 지원 범위 밖이고 `degraded`로 관측 가능하다 |
- 보충: 없음
- 상태: 현행
- 출처: `adr/0007-settle-cycle.md:116`(정본), `reviews/round-5-derivations.md:41`
- 닫은 사람: 원리(P3, `reviews/round-5-derivations.md:41` D-2), 편집자 결정(17라운드, 관측 이름 `degraded`, ADR 0014 4판 채택, `adr/0014-error-policy.md:201`)
- 라운드: 17
- 까닭: `03-mental-model.md:15`

### SETTLE-030 결과와 되돌림 가능성

- 결정:
  > 잠금용 불린들과 마이크로태스크 flush가 필요 없어지고, 두 단계 하네스는 단일 단계가 된다(T-5, F23).
  > "한 번의 쓰기가 두 번 배달된다", "결과가 원인보다 먼저 배달된다"가 구조적으로 사라진다.
  > 라이프사이클을 §1의 표 한 장으로 읽는다(G5). Q3(편집 중 상태와 가드가 보는 값)이 닫혔다.
  > 낮다. ADR 0006과 함께 노드 코어의 기반이다.
- 보충: 없음
- 상태: 현행(기록)
- 출처: `adr/0007-settle-cycle.md:136-139`(정본), `adr/0007-settle-cycle.md:155`
- 닫은 사람: 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`)
- 라운드: 5
- 까닭: `adr/0007-settle-cycle.md:26`

### SETTLE-031 합의 근거 — 소유자 발언 원문 모음

- 결정:
  > 라이프사이클 — 소유자: "마이크로태스크와 매크로태스크 기반의 라이프사이클을 노드 내부에서만큼은 원칙에 맞는 직관적인 데이터 흐름을 가졌으면 한다. 지금은 서로 막 주고받는 게 많다." / "react 파이버처럼 node가 동작하도록."
  > 가드가 보는 값 — 소유자: "가드는 방출 값을 보는 게 맞다. 빈 문자열을 '있다'고 보는 게 오히려 이상하다. 그렇게 처리할 거면 omitEmpty를 끄면 되고, 그럼 방출값으로 통일해도 일정하다."
  > 순환 — 소유자: "injectTo의 무한루프나 derived 무한루프 방어처럼 했으면 한다. 미리 알고 처리한다기보단, 몇 회 루프를 돌면 경고하고 error를 throw하도록. react의 hook처럼. 추가적인 방어를 해도 되는데 애드훅하게 하는 것보단 돌려보고 터지는 걸 개발 단계에서 알려주는 게 낫다."
  > 순환(10라운드) — 소유자: "루프의 가능성을 제한하지는 않는다. … 그 상한값을 초과하면 적절한 error를 표시한다. 이는 react의 hook과 동일한 설계를 갖는다." / "구태여 막지 않을 뿐이지 루프를 만드는 걸 권하는 설계는 절대 아닙니다."
- 보충: 없음
- 상태: 현행(기록)
- 출처: `adr/0007-settle-cycle.md:19-22`(정본)
- 닫은 사람: 소유자 답(`00-goals.md:149` G5), 소유자 답(`reviews/round-1.md:177`), 소유자 답(`reviews/round-1.md:179`), 소유자 답(`reviews/round-10-owner-answers.md:10,13` A-4·B-1)
- 라운드: 10
- 까닭: `adr/0007-settle-cycle.md:19-22`

### SETTLE-032 예산 초과 때 제출 차단에서 지워진 선택지

- 결정:
  > **지워진 선택지.** 검증 에러 목록에 섞는 차단(P1, G1). 코어가 막는 차단(제출은 Form 바인딩의 API이고 코어는 그것을 모른다, P5). 통지 예산(파동, `onChange` 중첩)에서도 막는 차단(그 예산은 커밋된 방출 값을 바꾸지 않는다).
- 보충: 없음
- 상태: 현행(부정 결정)
- 출처: `06-conclusions.md:304`(정본)
- 닫은 사람: 원리(P1·G1·P5, `06-conclusions.md:304-305`), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1, 폼의 제출 경로가 거부)
- 라운드: 17
- 까닭: `06-conclusions.md:304`, `06-conclusions.md:305`

### SETTLE-033 대체됨: 전이 주입은 최종 활성 집합 기준, 승자는 최종 형상의 default(06 4.2, D-12)

- 결정:
  > **결론.** 최종 활성 집합 기준. 중간 라운드에서 켜졌다 꺼진 조각의 주입은 커밋 전에 버린다. 승자(여러 조각이 같은 자식에 `default`를 선언할 때)는 최종 형상의 유효 스키마가 가진 `default`다.
- 보충: 없음
- 상태: 대체됨(→ SETTLE-005)
- 출처: `06-conclusions.md:125`(정본), `07-conclusions.md:101`
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:7` A-1), 편집자 결정(10라운드, 4.2를 4.22로 다시 씀, `07-conclusions.md:101`)
- 라운드: 10
- 까닭: `07-conclusions.md:101`

### SETTLE-034 대체됨: 상한에 걸리면 값은 받고 형상만 직전 커밋의 활성 집합으로 고정, 에러는 개발 모드 한정(2라운드)

- 결정:
  > 값은 받아들이고 형상만 직전 커밋의 활성 집합으로 고정한다. 에러는 개발 모드 한정("어차피 터지면 리얼에 나가면 안 된다")
- 보충:
  > "2026-09-22 — 상한에 걸렸을 때의 처리를 "쓰기를 버리고 throw"에서 "값은 받아들이고 형상만 고정, 개발 모드에서 에러"로 바꿨다." (`adr/0007-settle-cycle.md:14`)
- 상태: 대체됨(→ SETTLE-011, SETTLE-014)
- 출처: `reviews/round-2.md:116`(정본), `adr/0007-settle-cycle.md:14`
- 닫은 사람: 소유자 답(`reviews/round-2.md:116` 상한에 걸렸을 때), 편집자 결정(7–8라운드 수렴 D-31, `06-conclusions.md:196`), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1)
- 라운드: 17(2라운드 규칙을 대체)
- 까닭: `06-conclusions.md:197`, `reviews/round-17-owner-answers.md:9`

### SETTLE-035 열림: Q15 직전 커밋의 활성 집합을 출발 가설로 쓰는 최적화

- 결정:
  > 출발점 고정(A4-1)은 켜진 조각 N개인 호스트에 무관한 키 입력이 와도 N개를 다시 켜며 리빌드한다(`reviews/round-4.md` U19, F13). 직전 커밋의 `active`에서 출발해 안정될 때까지 돌리면 대부분 1바퀴에 끝나지만, 가드 의존 관계에 부정을 포함한 순환이 있으면 다른 고정점에 닿을 수 있다 — 그 부류는 지원 범위 밖이므로(F3) 결과가 같다고 볼 수도 있다. 측정과 함께 정한다.
- 보충: 없음
- 상태: 대체됨(→ SETTLE-044)
- 출처: `open-questions.md:92`(정본), `adr/0007-settle-cycle.md:151`, `reviews/round-18-closing.md:1877-1883,1889-1891`
- 닫은 사람: 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:112`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-67)
- 라운드: 18
- 까닭: `open-questions.md:92`, `reviews/round-18-closing.md:1885-1887`

### SETTLE-036 열림: controls.active 식이 다른 호스트를 읽을 때의 평가 순서와 재순회

- 결정:
  > **`controls.active` 식이 다른 호스트를 읽을 때**의 평가 순서와 재순회 규칙은 슬라이스 2 전의 설계 항목이다(§15).
- 보충: 없음
- 상태: 대체됨(→ SETTLE-045)
- 출처: `08-design-a-to-z.md:256#1`(정본), `02-target-overview.md:171`, `reviews/round-18-closing.md:429-442,449-455`
- 닫은 사람: 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:36`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-15; 정본(FRAGMENT-039는 중복))
- 라운드: 18
- 까닭: `08-design-a-to-z.md:256`, `reviews/round-18-closing.md:444-447`

### SETTLE-037 열림: 호스트 바퀴·전이 예산 식이 controls.children 항목 게이트와 조각 범위 제어 게이트를 세는가

- 결정:
  > | 항목 | 출처 | 막는 PR | 성격 |
  > | --- | --- | --- | --- |
  > | `controls.children` 가운데 PR-1·PR-2가 쓰는 부분. 대상 해석(조각에서만 선언된 자식을 가리킬 수 있는가, 청사진에 없는 이름이 청사진 오류인가), 항목 `controls.active`의 전순서 자리, 호스트 바퀴·전이 예산 식('게이트 가진 조각 수 + 노드 게이트 수 + 1')이 `children` 항목 게이트와 조각 범위 제어 게이트를 세는가. §9의 'PR-6 전'에는 대상별 식과 값 키만 남는다(외부 점검 codex, 검증자) | `08-design-a-to-z.md:299`·`:302`(§8.4), `:244`·`:246`(§7), `:496`(§15), `02-target-overview.md:159`(§2.3), `adr/0008-event-system.md:91`, `adr/0014-error-policy.md:259`(§7.2) | PR-1, PR-2 | 설계 결정 |
- 보충: 없음
- 상태: 대체됨(→ SETTLE-041)
- 출처: `reviews/round-18-agenda.md:25`(정본), `reviews/raw-round18-early-check.md:197`, `adr/0007-settle-cycle.md:37,39,58`, `reviews/round-18-closing.md:270-297`
- 닫은 사람: 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:25`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-12)
- 라운드: 18
- 까닭: `reviews/raw-round18-early-check.md:197`, `reviews/round-18-closing.md:299-303`

### SETTLE-038 자동 쓰기 되돌림 로그의 수명은 정착 하나 — 진입 범위가 아님(06 4.19, D-30)

- 결정:
  > 4.2를 구현하려면 자동 쓰기를 되돌릴 수 있는 로그가 필요한데, 그 수명은 정착 하나다. 진입 범위로 두면 이미 통지된 값을 뒤 정착이 철회하므로 "코어는 받은 값을 고치지 않는다"와 G5의 "원인과 결과의 순서"에 걸린다.
- 보충:
  > "원본 B는 스냅숏이 아니라 자동 쓰기의 되돌림 기록으로 만든다." (`adr/0007-settle-cycle.md:48`)
- 상태: 현행
- 출처: `06-conclusions.md:249#1-2`(정본), `adr/0007-settle-cycle.md:48`
- 닫은 사람: 편집자 결정(7–8라운드 수렴 D-30, `06-conclusions.md:247`), 편집자 결정(10라운드, 4.15–4.21 그대로, `07-conclusions.md:100`)
- 라운드: 10
- 까닭: `06-conclusions.md:249`

### SETTLE-039 열림: 에지의 값 동등 판정과 controls.derived 의존 집합의 출처

- 결정:
  > 에지의 값 동등 판정(참조인지 깊은 비교인지)과 `controls.derived` 의존 집합의 출처(슬라이스 3 전).
- 보충:
  > "에지의 값 동등 판정(참조인지 깊은 비교인지), `controls.derived` 의존 집합의 출처, 조각의 `controls`에 둔 식 규칙이 나감 에지에서 발화하는 세부(`08-design-a-to-z.md:456`)." (`reviews/round-18-agenda.md:107`)
- 상태: 대체됨(→ SETTLE-043)
- 출처: `03-mental-model.md:211`(정본), `08-design-a-to-z.md:492`, `reviews/round-18-agenda.md:107`, `06-conclusions.md:253#1`(VALUE-021의 정본), `reviews/round-18-closing.md:1376-1403,1413-1415`
- 닫은 사람: 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:107`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-50)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:107`, `reviews/round-18-closing.md:1405-1411`

### SETTLE-040 대체됨: 호스트 바퀴 상한은 조건부 조각 수 + 1(06 용어)

- 결정:
  > | 용어 | 뜻 |
  > | ---- | -- |
  > | 바퀴 | 계산 단계 안에서 호스트가 가드를 반복 평가해 활성 집합이 더 바뀌지 않을 때까지 도는 것. 상한은 조건부 조각 수 + 1 |
- 보충:
  > "호스트 바퀴의 상한은 노드 게이트도 뒤집힐 수 있으므로 "게이트 가진 조각 수 + 노드 게이트 수 + 1"이 된다." (`07-conclusions.md:132`)
- 상태: 대체됨(→ SETTLE-022)
- 출처: `06-conclusions.md:32`(정본), `06-conclusions.md:47`, `05-before-after.md:33`, `07-conclusions.md:132`
- 닫은 사람: 편집자 결정(7–8라운드 수렴, `06-conclusions.md:32` 용어), 편집자 결정(10라운드, 상한에 노드 게이트 수를 더함, `07-conclusions.md:132`)
- 라운드: 10
- 까닭: `07-conclusions.md:132`

### SETTLE-041 예산 셈 — `controls.active`를 가진 `children` 항목은 항목마다 노드 게이트 하나, 조각의 `controls.active`는 '게이트 가진 조각 수'에 이미 듦

- 결정:
  > 【추론】 (5) 예산 셈: 호스트 바퀴와 전이 라운드 식의 '노드 게이트 수'는 `controls.active`를 가진 `children` 항목을 대상 수와 무관하게 항목마다 하나로 센다.
  > 【추론】 식 하나가 호스트 기준으로 한 번 평가되어 모든 대상에 같은 값으로 걸리기 때문이다.
  > 【추론】 조각의 `controls.active`는 그 조각의 게이트라 '게이트 가진 조각 수'에 이미 들어 있으므로 따로 세지 않는다.
  > 【추론】 조각 범위 제어의 다른 키는 게이트가 아니다.
  > 【추론】 판별 변환과 분기 식의 AND(18C-05)는 게이트 하나다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:283-287`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-12)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:299-303`

### SETTLE-042 branch 객체 `local`·`emit`의 키 순서 — `propertyKeys`, 첫 선언의 전순서, `extras` 삽입 순서; 키 집합이 같으면 패치, 바뀌면 O(키 수)로 다시 짓기

- 결정:
  > 【추론】 branch 객체 노드의 `local`과 `emit`의 키 순서는 결정적이다.
  > 【추론】 쓰기의 순서나 이력과 무관하다.
  > 【추론】 첫째, 그 호스트의 유효 스키마 `options.propertyKeys`에 적힌 키가 그 순서로 먼저 온다.
  > 【추론】 둘째, 나머지 선언된 자식 키는 청사진 전순서(ADR 0002)에서 그 이름의 첫 선언 자리 순이다.
  > 【추론】 조각에서만 선언된 키와 공유 노드의 키도 같다.
  > 【추론】 셋째, `extras`는 그 뒤에 원본에 들어온 순서(삽입 순서)로 온다.
  > 【추론】 형상에 없는 키는 없다.
  > 【추론】 순서표는 호스트의 유효 스키마 메모가 바뀔 때 한 번 계산해 메모와 함께 둔다.
  > 【추론】 키 집합이 같은 커밋(값만 바뀐 쓰기, 키 입력)은 바뀐 자식만 직전 `local`의 사본에 같은 자리로 패치한다.
  > 【추론】 그 비용은 O(재계산 목록)이고 순서가 유지된다.
  > 【추론】 키 집합이 바뀌는 커밋(조각이나 노드 게이트의 토글, 자식이 생기거나 빠짐, `extras` 추가, `propertyKeys` 변경)은 그 호스트의 `local`을 위 순서로 새로 짓는다.
  > 【추론】 그 비용은 O(그 호스트의 키 수)이고 `delete`는 없다.
  > 【추론】 F13의 "조각이 선언한 키만 패치"는 다시 계산하는 키의 범위로 읽는다.
  > 【추론】 토글 때 다시 계산하는 것은 그 조각이 선언한 키뿐이고, 나머지 값은 직전 `local`에서 옮겨 선언 순서로 새 객체를 짓는다.
  > 【추론】 `emit := project(local)`은 순서를 그대로 둔다.
  > 【추론】 터미널 객체와 비객체 원본은 받은 값을 그대로 든다(순서를 바꾸지 않음).
  > 【추론】 배열은 인덱스 순이다.
  > 【추론】 오늘의 선언 순서 정렬(`BranchStrategy.ts:246,777-803`, `sortWithReference`: 참조 목록의 키가 먼저, 나머지는 원래 순서)과 같은 결과를 내므로 이주 행은 두지 않는다.
  > PR: PR-2 시험.
  > 무엇: 조각 키의 자리가 오늘의 `oneOf`/`anyOf` 키 합집합 순서와 어긋나는 스키마가 있는지 본다.
  > 실패: 어긋나면 이주 행을 더한다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1053-1070,1076-1078`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-39)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1072-1074`

### SETTLE-043 값 동등 `sameValue`(가칭) — SameValueZero, 배열·평범한 객체는 구조(키 순서 포함), 그 밖은 참조; 커밋·emit 참조 되살림; `derived` 의존 집합은 식 경로 ∪ `controls.watch`

- 결정:
  > 【추론】 (가) "값이 바뀌었다"는 하나의 판정(가칭 `sameValue`, 내부)으로 본다.
  > 【추론】 원시 값은 SameValueZero로 본다.
  > 【추론】 `NaN`은 `NaN`과 같고 `-0`은 `0`과 같다.
  > 【추론】 배열은 길이와 차례대로의 원소를 본다.
  > 【추론】 평범한 객체는 자기 열거 키의 목록(순서 포함)과 키마다의 값을 본다.
  > 【추론】 그 밖의 객체(함수, `Date`, 클래스 인스턴스, `File` 등)는 참조로 본다.
  > 【추론】 두 값의 참조가 같으면 더 내려가지 않는다(지름길).
  > 【추론】 (나) 커밋 단계에서, 이번 정착에 쓰인 잎의 `raw`·`extras`가 직전 커밋의 것과 (가)로 같으면 직전 참조를 둔다.
  > 【추론】 쓰기 경계에서 지금 값과 같으면 쓰지 않는 것은 오늘과 같다.
  > 【추론】 호스트의 `emit`은 VALUE-012대로 만든다.
  > 【추론】 새로 만든 것이 직전 커밋의 것과 키 목록(순서 포함)도 같고 키마다의 자식 `emit` 참조도 같으면 직전 참조를 둔다(얕은 비교, 재계산 목록의 호스트만).
  > 【추론】 그래서 EVENT-031·EVENT-006의 "emit 참조가 바뀜"은 "방출 값이 바뀜"과 같아진다.
  > 【추론】 `onChange`·배달·검증 요청은 참조 비교만으로 값 비교를 따른다.
  > 【추론】 에지는 원천이나 의존의 값을 기준점(SETTLE-004·SETTLE-028)과 (가)로 견준다.
  > 【추론】 대상은 `injectTo`의 원천 방출 값, `derived`의 의존 값, `unsetValue`·`resetInteraction`의 식 값이다.
  > 【추론】 (다) 지름길 때문에 비교는 이번 정착에서 새로 만들어진 부분에만 내려간다.
  > 【추론】 그래서 비용은 쓰기가 바꾼 크기에 비례한다(G6).
  > 【추론】 12-3은 검증기 성능에 관한 답이므로 폼 자신의 이 비용에는 닿지 않는다.
  > 【추론】 (라) `controls.derived` 규칙의 의존 집합은 두 경로의 합집합이다: 청사진이 그 식에서 정적으로 뽑은 경로, 그리고 그 노드의 `controls.watch` 경로(모든 선언의 합집합).
  > 【추론】 역의존 표와 같은 표에서 나온다.
  > 【추론】 같은 노드의 다른 식(`active`·`visible`·`readOnly`·`disabled`·`unsetValue`)이 읽는 경로는 들지 않는다.
  > 【추론】 에지는 이 집합의 값 튜플이 기준점과 (가)로 다를 때다.
  > 【추론】 경로가 읽는 값의 종류, 그리고 `@` 맥락의 변경이 에지인지는 18C-13이 정한다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1376-1393,1395-1399`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-50)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1405-1411`

### SETTLE-044 직전 커밋의 활성 집합에서 출발하는 최적화는 채택하지 않는다 — 출발점 고정, PR-2 벤치 게이트

- 결정:
  > 【추론】 정착의 출발점은 고정이다(SETTLE-018).
  > 【추론】 직전 커밋의 `active`에서 출발하는 최적화는 채택하지 않는다.
  > 【추론】 까닭 하나: 양의 순환에서 결과가 달라진다.
  > 【추론】 소유자가 받아들인 최소 고정점 동작(12-10)이 이력에 의존하게 바뀌어 P3·D-2(형상은 상태의 순수 함수)를 깬다.
  > 【추론】 예: 조각 C가 켜진 동안 서로를 켜 준 A·B가 있을 때, C가 꺼지면 고정 출발에서는 A·B도 꺼지지만 이어 출발에서는 켜진 채 남는다.
  > 【추론】 까닭 둘: 같은 결과를 보장하려면 가드 사이의 의존을 알아야 하는데, 폼은 `if`의 내용을 읽지 않는다.
  > 【추론】 U19 비용(켜진 조각 N개인 호스트의 무관한 키 입력)은 기존 최적화 (a)(b)(c)(BLUEPRINT-007, F13 키 패치)로 다룬다.
  > PR: PR-2 벤치(TEST-027·TEST-032)에 "켜진 조각 N개 호스트의 무관한 키 입력" 행을 더한다.
  > 통과: TEST-027 게이트(옛 판 대비, Vincent의 수용).
  > 실패: P3 대 속도의 맞바꿈이므로 소유자에게 올린다.
- 보충: 없음
- 상태: 현행(부정 결정)
- 출처: `reviews/round-18-closing.md:1877-1883,1889-1891`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-67)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1885-1887`

### SETTLE-045 하위 트리 밖을 읽는 `controls.active` 게이트는 가장 낮은 공통 조상 L에서 평가 — L 전순서의 자리, 경로 재계산은 호스트 바퀴 예산, 재순회 없음

- 결정:
  > 【추론】 `controls.active` 게이트(노드 게이트, 조각 게이트, 18C-12의 `controls.children` 항목 게이트)가 선언한 호스트의 하위 트리 밖을 읽으면, 청사진이 그 게이트의 평가 자리를 L로 옮긴다.
  > 【추론】 L은 선언한 호스트와, 식이 읽는 모든 경로의 자리를 함께 덮는 가장 낮은 공통 조상 호스트다.
  > 【추론】 `#` 단독과 `(/)`(루트 값 전체)는 루트로 셈하고, `/p`·`#/p`는 `p`의 자리로 셈한다.
  > 【추론】 `@`는 노드가 아니라 공통 조상 계산에 들지 않는다.
  > 【추론】 옮긴 게이트는 L의 바퀴에서 다른 게이트와 같은 절차로 평가한다.
  > 【추론】 꺼진 채 출발하고, 매 바퀴 모두 평가하며, 가우스-자이델로 즉시 반영한다.
  > 【추론】 L의 전순서에서, 옮긴 게이트는 선언한 호스트로 이어지는 L의 자식을 선언한 조각의 바로 뒤, 그 조각의 노드 게이트들 뒤에 든다.
  > 【추론】 옮긴 게이트끼리는 문서 순서를 따른다.
  > 【추론】 옮긴 게이트의 값이 바뀌면 L은 바퀴 안에서 L부터 선언한 호스트까지의 경로를 재계산한다.
  > 【추론】 메모는 상속 overlay와 같게 한다.
  > 【추론】 이 재계산은 호스트 바퀴 예산에 함께 센다.
  > 【추론】 재순회는 없다.
  > 【추론】 두 번째 하강이 없으므로 계산은 여전히 루트에서 한 번 내려간다.
  > 【추론】 다른 키는 순서 문제가 없다: 상태 키는 계산 끝의 최종 트리에서, 파생 규칙은 완성된 트리에서 평가한다(SETTLE-003, SETTLE-004).
  > PR: PR-2 정착 시나리오(18C-25의 PR-2 시험)와 PR-2 벤치.
  > (a) 사촌 하위 트리를 읽는 노드 게이트를 단언한다.
  > (b) `#`를 읽는 게이트를 단언한다.
  > (c) 서로를 읽는 두 호스트의 양의 순환이 이력과 무관하게 같은 원본에서 같은 형상을 내는지 단언한다.
  > 벤치: 루트로 옮긴 게이트가 N개일 때 키 입력 한 번의 비용을 잰다.
  > 통과: 18C-27의 선(`guard:check`) 안이다.
  > 실패: ADR 0009 §4 절차(이유를 적고 Vincent가 받아들여야 병합)를 따른다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:429-442,449-455`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-15)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:444-447`

### SETTLE-046 로드 때의 채움과 발화 — 최종 형상의 노드가 모두 생긴 노드로서 채움, `controls.injectTo`는 발화, `controls.unsetValue`는 로드된 값으로 평가

- 결정:
  > 그래서 로드에서는 최종 형상의 노드가 모두 생긴 노드로서 채움을 받는다. `controls.injectTo`는 직전 값이 없으므로 발화한다(`fire`, 소유자 동의). `controls.unsetValue`는 로드된 값으로 평가해 참이면 지우고 거짓이면 둔다(소유자 답 21).
- 보충:
  > "없음인 값은 모두 채움을 받고, `controls.injectTo`·`controls.derived`는 발화하며, `controls.unsetValue`는 로드된 값으로 평가해 참이면 지운다." (`08-design-a-to-z.md:253`)
  > 편집자 결정(18C-102): "【추론】 로드는 에지와 생김의 기준을 비운다." (`reviews/round-18-closing.md:2866`)
  > 편집자 결정(18C-102): "【추론】 로드가 아닌 쓰기(`setValue(V)` 포함)는 직전 커밋을 기준으로 한다." (`reviews/round-18-closing.md:2867`)
- 상태: 현행
- 출처: `adr/0007-settle-cycle.md:92#2-4`(정본. SETTLE-027에서 분할), `02-target-overview.md:168`, `08-design-a-to-z.md:253`, `reviews/round-18-closing.md:2866-2867`
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:19` D-6, 로드 시 injectTo 발화), 소유자 답(`reviews/round-10-owner-answers.md:29,39` E-21, 로드의 unsetValue), 편집자 결정(10라운드, 21의 최초 로드를 모든 로드로 읽음, `07-conclusions.md:251`), 소유자 답(`reviews/round-12-owner-answers.md:13` §5 (a) 모든 로드에서 로드된 값으로 평가), 소유자 답(`reviews/round-12-owner-answers.md:19` §9 로드에서 `&derived`), 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-102)
- 라운드: 18
- 까닭: `07-conclusions.md:251`, `adr/0007-settle-cycle.md:92`(F4), `reviews/round-18-closing.md:2869-2870`

### SETTLE-047 트리 전체 순회의 예산 — 로드와, 쓰기가 닿은 하위 트리를 도는 전체 교체 쓰기에서만

- 결정:
  > 【추론】 트리 전체 순회는 로드와, 쓰기가 닿은 하위 트리를 도는 전체 교체 쓰기에서만 허용한다.
  > PR: PR-2(정착)
  > 무엇: 잎 하나의 입력 쓰기, 하위 트리의 `setValue(V)`, 루트 `setValue(V)`에서 정착이 방문하는 노드를 센다.
  > 통과: 입력 쓰기는 재계산 목록과 자동 쓰기 기록만 돌고, `setValue(V)`는 쓰기가 닿은 하위 트리를 한 번 돈다.
  > 실패: 순회가 이 범위를 넘으면 정착의 순회 범위를 고친다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2747,2752-2755`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-95)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2749-2750`

### SETTLE-048 에지와 생김의 기준 — 로드는 비우고, 로드가 아닌 쓰기(`setValue(V)` 포함)는 직전 커밋

- 결정:
  > 【추론】 로드는 에지와 생김의 기준을 비운다.
  > 【추론】 로드가 아닌 쓰기(`setValue(V)` 포함)는 직전 커밋을 기준으로 한다.
  > PR: PR-2(정착)
  > 무엇: `controls.derived`·`controls.injectTo`를 가진 폼에서 `setValue(getValue())`와 `FormHandle.reset()`을 부른다.
  > 통과: `setValue(getValue())`는 에지가 없어 발화하지 않고, `FormHandle.reset()`은 발화한다(SETTLE-046).
  > 실패: 에지의 기준을 고친다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2866-2867,2872-2875`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-102)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2869-2870`
