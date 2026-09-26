# 단일 원장 — 조각과 게이트

기준 커밋: `ba398c330`(저장소 `packages/canard/schema-form/architecture`). 영역: 조각과 게이트, 금지 조각, 분기 관행, 조건부 키워드. 정본 우선순위는 다음 순서다. (1) 소유자 답은 고정이다. (2) 채택된 ADR이 그 영역의 정본이다. 이 영역의 `adr/0002-guard-fragment-model.md`(5차 본문, 제안)와 `adr/0010-branch-conventions.md`(초안)는 채택 전이지만 이 영역을 가장 자세히 적은 문서이므로 결정 칸의 정본으로 쓰고, `08-design-a-to-z.md` §6과 `02-target-overview.md` §3은 같은 규칙의 재록으로 출처에 더한다. (3) `03-mental-model.md`(원장)는 08과 다르면 원장이 이긴다(08이 스스로 그렇게 적는다). (4) 뒤 라운드가 앞 라운드를 이긴다. `06-conclusions.md`·`07-conclusions.md`는 그때의 기록이며 고치지 않는다. `&` 축약에서 `controls` 그룹 표기로 바꾼 15라운드의 변경(`adr/0002-guard-fragment-model.md:9`)은 표기만 바꾼 것이어서 라운드 칸에 넣지 않았다. 상태 값의 뜻: **현행**은 지금 유효한 규칙, **대체됨**은 뒤 라운드가 바꾼 옛 규칙(원문 그대로 남긴다), **열림**은 18라운드 안건으로 넘어가 아직 정해지지 않은 것이다.

## 색인

| 번호 | 한 줄 요약 | 상태 | 닫은 사람 |
| --- | --- | --- | --- |
| FRAGMENT-001 | 조각 표 — 조건부로 형상을 바꾸는 구문을 게이트와 조각 하나로 환원 | 현행 | 소유자 답(`reviews/round-10-owner-answers.md:9` A-3), 편집자 결정(10라운드, `07-conclusions.md:143` 조각 표가 ADR 0002 표를 대체), 소유자 답(`reviews/round-9-spec.md:108` 자식 집합 제어, 조각 단위 제어) |
| FRAGMENT-002 | 용어 — 4차까지의 "가드"를 게이트라 부른다 | 현행 | 편집자 결정(10라운드 5차 본문, `adr/0002-guard-fragment-model.md:5`) |
| FRAGMENT-003 | 소유자의 방향 — if/then/else의 옛 방식 제거와 새 방식, allOf 병합 유지 | 현행 | 편집자 결정(ADR 0002 첫 판 `ab41d790d`, `adr/0002-guard-fragment-model.md:18` 소유자의 방향을 옮긴 편집자 기록, 소유자 원문 없음) |
| FRAGMENT-004 | oneOf·anyOf는 형상 선언이 아니라 검증 조건 — 순수 분기는 작성자가 controls로 제어 | 현행 | 소유자 답(`reviews/round-9-spec.md:42` 읽기1), 소유자 답(`reviews/round-9-spec.md:44` 읽기1(이어서)) |
| FRAGMENT-005 | 분기 문장 — 폼은 게이트 없이 분기를 고르지 않고, 게이트는 if와 controls.active 둘뿐 | 중복(→ GOAL-027) | 소유자 답(`reviews/round-10-owner-answers.md:9` A-3), 소유자 답(`reviews/round-10-owner-answers.md:11` B-22) |
| FRAGMENT-006 | controls.discriminator는 명시해야 동작 — 명시 없는 union은 모든 분기가 켜지고 const·enum 자동 감지는 사라짐 | 현행 | 소유자 답(`reviews/round-12-owner-answers.md:9` 2 &discriminator) |
| FRAGMENT-007 | controls.discriminator 키의 분기 선언 끌어올림과 청사진 오류 | 현행 | 소유자 답(`reviews/round-14-owner-answers.md:7` O-1), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-91) |
| FRAGMENT-008 | 명시 판별의 변환 — 청사진이 const·enum을 읽어 controls.active 조각 객체처럼 다루고 분기 스키마는 손대지 않음 | 현행 | 소유자 답(`reviews/round-10-owner-answers.md:11` B-22), 소유자 답(`reviews/round-9-spec.md:20` 축2) |
| FRAGMENT-009 | 게이트의 두 종류 — if 게이트(compileGuard 동기 평가)와 controls.active 게이트 | 현행 | 소유자 답(`reviews/round-9-spec.md:19` 축1), 편집자 결정(10라운드 5차 본문, `adr/0002-guard-fragment-model.md:14`) |
| FRAGMENT-010 | 선택 가드·selection 칸·setSelectedBranch·초기 분기 추론은 없다 | 현행(부정 결정) | 소유자 답(`reviews/round-10-owner-answers.md:9` A-3), 편집자 결정(10라운드, `07-conclusions.md:142`) |
| FRAGMENT-011 | 조각은 트리다 — 문맥과 소속, 중첩 순회, 전순서, 존재의 합집합, 제약의 교차 | 현행 | 편집자 결정(4차 본문 E3, `adr/0002-guard-fragment-model.md:13`), 편집자 결정(10라운드, `07-conclusions.md:143` 전순서 정의) |
| FRAGMENT-012 | 같은 oneOf에서 게이트 가진 분기가 둘 이상 켜짐 — 막지 않고 연언으로 적용, 개발 모드 경고 | 현행 | 소유자 답(`reviews/round-10-owner-answers.md:17` C-20) |
| FRAGMENT-013 | 게이트 가진 분기의 정의 — controls.active(변환 포함) 또는 else: false인 if, 키 유무로 판정 | 현행 | 편집자 결정(12라운드, `reviews/round-12-owner-review.md:258`) |
| FRAGMENT-014 | 노드 게이트는 조각 게이트와 같은 장치 — 로드 때 생기지 않음, 거짓→참에서 생겨 채움, 바퀴 안 평가 | 현행 | 소유자 답(`reviews/round-10-owner-answers.md:8` A-2), 소유자 답(`reviews/round-10-owner-answers.md:14` C-10), 소유자 답(`reviews/round-10-owner-answers.md:7` A-1) |
| FRAGMENT-015 | 꺼진 노드의 값 — 형상에 없고 원본은 기본으로 남아 방출에서 빠지며, 나감 정책이 참이면 나갈 때 한 번 비움 | 현행 | 소유자 답(`reviews/round-10-owner-answers.md:8` A-2), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값) |
| FRAGMENT-016 | 게이트는 투영 후 값을 본다(E5) — 검증기가 볼 값, 객체가 아닌 원본이면 G = {} | 현행 | 소유자 답(`reviews/round-1.md:177` 가드는 어떤 값을 보는가), 편집자 결정(4차 본문 E5, `adr/0002-guard-fragment-model.md:13`) |
| FRAGMENT-017 | 출발점은 고정이고 재평가는 비단조(E6, D-2) — 모든 게이트를 한 바퀴에, 상한, 지원 범위 밖, 순서 힌트, 비용 | 현행 | 원리(`reviews/round-5-derivations.md:41` D-2 도출, `03-mental-model.md:162` 도출표), 편집자 결정(10라운드, `07-conclusions.md:132` 상한에 노드 게이트 수) |
| FRAGMENT-018 | 호스트 바퀴 상한 초과 — 자동 쓰기를 뺀 원본 B 커밋, degraded, 모든 환경에서 사슬 끝 throw | 중복(→ SETTLE-023) | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 편집자 결정(7–8라운드 수렴 D-31, `06-conclusions.md:196` 원본 B 커밋) |
| FRAGMENT-019 | 금지 조각은 없다(D-3 = (iii)) — false·not required·additionalProperties: false는 폼이 읽지 않음 | 현행 | 원리(`reviews/round-5-derivations.md:28-34` D-3 도출, `03-mental-model.md:150` 도출표) |
| FRAGMENT-020 | 잔여 키의 표시는 검증기 플러그인의 계약 — rejectedKey, 기각 형태별로 키를 대는 쪽 | 현행 | 편집자 결정(4차 본문 C-4, `adr/0002-guard-fragment-model.md:13`; 반론 `reviews/round-5-decisions.md:236`) |
| FRAGMENT-021 | 중첩은 재귀로 다루고 allOf 안의 if/then은 필수 지원 | 현행 | 편집자 결정(4차 본문, `adr/0002-guard-fragment-model.md:13`), 소유자 답(`reviews/round-9-spec.md:23` 축5) |
| FRAGMENT-022 | 분기 컨벤션 — oneOf·anyOf 분기의 if에는 else: false와 required: [조건 프로퍼티]가 함께 필수(ajv 실측표) | 현행 | 소유자 답(`reviews/round-10-owner-answers.md:9` A-3), 소유자 답(`reviews/round-10-owner-answers.md:38` E-23) |
| FRAGMENT-023 | 폼은 if의 required와 축 2항을 검사하지 않는다 — if의 내용에 관여하지 않음 | 현행(부정 결정) | 소유자 답(`reviews/round-10-owner-answers.md:38` E-23), 소유자 답(`reviews/round-10-owner-answers.md:40` E-19) |
| FRAGMENT-024 | oneOf·anyOf 분기에 if는 있고 else: false가 없음 — 개발 모드 경고 대상(키의 유무만 봄) | 현행 | 소유자 답(`reviews/round-12-owner-answers.md:14` 6 else: false 경고) |
| FRAGMENT-025 | 선언 문맥은 형상을 고르지 않는다 — 분기의 형상을 좁히는 것은 게이트 둘뿐 | 현행 | 소유자 답(`reviews/round-9-spec.md:44` 읽기1(이어서)), 소유자 답(`reviews/round-10-owner-answers.md:9` A-3) |
| FRAGMENT-026 | 존재는 선언 위치로, 필수성은 required로 가른다 | 현행 | 소유자 답(`reviews/round-9-spec.md:20` 축2), 소유자 답(`reviews/round-9-spec.md:21` 축3) |
| FRAGMENT-027 | 다른 서브트리를 보는 조건은 if를 공통 조상으로 끌어올린다 — 상속 overlay(E12) | 현행 | 편집자 결정(4차 본문 E12, `adr/0002-guard-fragment-model.md:13`) |
| FRAGMENT-028 | 수동 선택은 작성자가 선언한 판별 프로퍼티로 표현하고, 판정은 validator(작성된 스키마, 방출 값) | 현행 | 소유자 답(`reviews/round-9-spec.md:44` 읽기1(이어서)), 소유자 답(`reviews/round-10-owner-answers.md:9` A-3) |
| FRAGMENT-029 | ADR 0002 합의 근거 — 소유자 발언 원문 모음 | 현행(기록) | 소유자 답(`reviews/round-10-owner-answers.md:8,9,11,38,40` A-2·A-3·B-22·E-23·E-19), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값), 소유자 답(`reviews/round-1.md:177` 가드는 방출 값) |
| FRAGMENT-030 | 작성자의 약속(ADR 0010) — 폼은 oneOf·anyOf·if의 내용을 읽지 않고 약속을 검사하지 않으며 고지 의무만 진다 | 현행 | 소유자 답(`reviews/round-10-owner-answers.md:38` E-23), 소유자 답(`reviews/round-10-owner-answers.md:8` A-2), 편집자 결정(11라운드 ADR 0010 초안, `adr/0010-branch-conventions.md:3`) |
| FRAGMENT-031 | 약속 3 — controls.active(또는 discriminator)만으로 게이트를 단 분기에도 판별 키의 const(또는 enum)와 required를 둔다 | 현행 | 편집자 결정(11라운드 ADR 0010 초안, `adr/0010-branch-conventions.md:3`), 소유자 답(`reviews/round-10-owner-answers.md:11` B-22, 예시에 const와 required를 둠) |
| FRAGMENT-032 | 약속 5 — 조건 프로퍼티는 호스트에 선언하는 것이 좋다(잠복 원본), 폼은 검사하지 않음 | 현행 | 소유자 답(`reviews/round-9-spec.md:20` 축2), 소유자 답(`reviews/round-10-owner-answers.md:40` E-19), 편집자 결정(14라운드, `adr/0002-guard-fragment-model.md:105` 잠복 원본) |
| FRAGMENT-033 | 약속 6 — 표준 readOnly는 그 노드에만 걸린다 | 현행 | 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙), 편집자 결정(14라운드 F-5, `reviews/round-14-values-check.md:62`) |
| FRAGMENT-034 | 약속 7 — 양방향 주입은 식이 undefined를 돌려주어 멈춘다 | 현행 | 소유자 답(`reviews/round-12-owner-answers.md:20` §9 undefined 반환), 소유자 답(`reviews/round-1.md:179` 순환을 분석 단계에서 금지하는가) |
| FRAGMENT-035 | 분기가 꺼질 때 이전 분기의 값 — 닫힘: 기본은 원본을 두고 방출에서 빼며, 비움은 unsetOnInactive와 세부가 포괄을 덮는 순서 | 현행 | 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값), 소유자 답(`reviews/round-13-owner-answers.md:17` 나감 정책 키 이름), 원리(`reviews/round-10-owner-answers.md:20` D-7 세부 규칙이 포괄 규칙을 덮는 관례, `03-mental-model.md:131`), 편집자 결정(13라운드, `reviews/round-13-owner-review.md:66` 네 층의 순서), 소유자 답(`reviews/round-13-owner-answers.md:16` Form 속성의 자리) |
| FRAGMENT-036 | 대체됨: 초기 분기 선택에서 required를 읽지 않고 선언된 키 수와 선언 순서만 쓴다(06 §4.4 D-14) | 대체됨(→ FRAGMENT-010) | 소유자 답(`reviews/round-10-owner-answers.md:9` A-3), 편집자 결정(10라운드, `07-conclusions.md:142`) |
| FRAGMENT-037 | 열림: dependentSchemas·dependentRequired·dependencies를 게이트와 조각의 모델로 환원할지(Q7) | 대체됨(→ FRAGMENT-047) | 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:15`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-03) |
| FRAGMENT-038 | 열림: controls.discriminator 변환의 세부 | 대체됨(→ FRAGMENT-048) | 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:17`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-05) |
| FRAGMENT-039 | 열림: controls.active 표현식이 다른 호스트를 읽을 때의 평가 순서 | 중복(→ SETTLE-036) | 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:36`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-15) |
| FRAGMENT-040 | 열림: 루트 dataPath가 플러그인은 "/", 오늘 타입은 "" | 대체됨(→ FRAGMENT-053) | 편집자 결정(4차 본문 미결, `adr/0002-guard-fragment-model.md:200`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-74) |
| FRAGMENT-041 | 열림: 조각의 controls에 둔 식 규칙이 나감 에지에서 발화하는 세부 | 대체됨(→ FRAGMENT-050) | 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:107`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-51) |
| FRAGMENT-042 | 열림: controls.children의 대상별 식과 값 키 세부, 조각에서만 선언된 자식을 가리킬 수 있는가 | 대체됨(→ CONTROLS-073) | 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:110`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-12) |
| FRAGMENT-043 | 열림: Q1의 남은 세부 — 잠복 원본의 실제 파기 시점, 복원값 대 초기값, 공유 노드의 서로소 enum, 비활성 경로 쓰기, 로드 왕복 | 분할됨(→ VALUE-031, FRAGMENT-054) | 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:112`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-64) |
| FRAGMENT-044 | 열림: 표준 키워드 밖의 FE 전용 조건부 필드(Q4) | 대체됨(→ FRAGMENT-052) | 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:112`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-66) |
| FRAGMENT-045 | 열림: contains와 prefixItems(Q13) | 대체됨(→ FRAGMENT-051, NODE-052) | 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:109`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-59) |
| FRAGMENT-046 | default만으로 자기 게이트를 켜는 조각은 켜지지 않는다 — 원본은 상태, default 주입은 사건(06 §3.6) | 현행 | 편집자 결정(8라운드, `06-conclusions.md:106` 3.6), 편집자 결정(7–8라운드 수렴 D-25, `06-conclusions.md:236`), 편집자 결정(9라운드, `07-conclusions.md:72` 3.6 그대로) |
| FRAGMENT-047 | `dependentSchemas`·`dependentRequired`·`dependencies`는 읽지 않는다 — 검증기로, `extras`, `if/then`으로 적기 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-03) |
| FRAGMENT-048 | `controls.discriminator` — 정적 연언에서 판별 선언 모으기(`$ref`·게이트 없는 `allOf`), null 분기 제외, 분기 자체 게이트와 AND | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-05) |
| FRAGMENT-049 | 전순서의 키워드 순위 — `oneOf` 분기 < `anyOf` 분기 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-10) |
| FRAGMENT-050 | 조각 `controls`의 에지 규칙은 켜진 동안만 후보 — 나감은 에지가 아님(`unsetOnInactive`만), 새로 들인 노드는 거짓→참, 남은 공유 노드는 기준점만, 라운드 단위, `default`는 채움 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-51) |
| FRAGMENT-051 | `contains`(`minContains`·`maxContains`)는 폼이 읽지 않는다 | 현행(부정 결정) | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-59) |
| FRAGMENT-052 | FE 전용 조건부 필드는 표준 `properties` merge와 `controls.active`로 — 예약 층 선언 문법은 두지 않는다 | 현행(부정 결정) | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-66) |
| FRAGMENT-053 | 루트의 정규 `dataPath`는 `''` — core가 `'/'`를 별칭으로 받아 정규화, 잔여 목록은 정규화된 값에 이음, 플러그인 셋과 폴백 검증기는 PR-4에서 `''` | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-74) |
| FRAGMENT-054 | 다시 켜진 값은 꺼지기 전의 원본, 초기값은 `reset`·`resetSubtree` — 공유 노드의 서로소 `enum`은 값이 남고 검증기가 기각 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-64), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-103) |
| FRAGMENT-055 | 판별 키가 `union`이어도 분기 규칙은 그대로 — 목록·nullable 밖 리터럴의 분기는 개발 모드 경고 (가칭) `DISCRIMINATOR_BRANCH_UNREACHABLE` | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-91) |

항목 형식은 `ledger/README.md` §3을 따른다. **결정**은 정본 원문을 글자 그대로 옮기고(표는 행과 칸을 바꾸지 않는다), 한 줄의 일부만 옮긴 항목은 출처에 문장 번호를 적는다. **보충**은 다른 출처가 더한 조건·예외·값의 원문이며 없으면 "없음"이다. **충돌**은 다른 위치가 정본과 다르게 적었을 때만 둔다.

## 항목

### FRAGMENT-001 조각 표 — 조건부로 형상을 바꾸는 구문을 게이트와 조각 하나로 환원

- 결정:
  > 조건부로 형상을 바꾸는 모든 구문을 하나의 내부 표현으로 환원한다. 표의 "연언"은 모든 조각의 제약이 함께 적용되는 "그리고" 문맥, "선언"은 분기 가운데 하나만 맞으면 되는 "또는" 문맥이다.
  > | 구문 | 게이트 | 조각 (게이트가 참일 때 얹는 스키마) | 문맥 |
  > | ---- | ------ | ----------------------------------- | ---- |
  > | 최상위·`allOf` 항목·분기 안의 `if`/`then`/`else` | `if`(검증기 플러그인이 컴파일) | `then` / `else` | 연언(분기 안이면 그 분기의 문맥) |
  > | 게이트 없는 `properties`·`allOf` 항목 | 항상 참 | 블록 전체 | 연언 |
  > | `controls.active`를 가진 조각 객체 | `controls.active`(예약 층 표현식) | 그 조각이 선언한 노드 집합 | 연언 |
  > | 게이트 없는 `oneOf`·`anyOf` 분기 | 항상 참(존재만) | 분기 전체 | 선언. 제약은 교차하지 않음 |
- 보충:
  > "조각은 게이트가 켜고 끄는 선언 묶음이다. 게이트가 없는 조각은 늘 켜져 있다." (`02-target-overview.md:218`)
- 상태: 현행
- 출처: `adr/0002-guard-fragment-model.md:39-46`(정본), `02-target-overview.md:218-227`, `07-conclusions.md:143-150`, `08-design-a-to-z.md:186-193`
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:9` A-3), 편집자 결정(10라운드, `07-conclusions.md:143` 조각 표가 ADR 0002 표를 대체), 소유자 답(`reviews/round-9-spec.md:108` 자식 집합 제어, 조각 단위 제어)
- 라운드: 10
- 까닭: `adr/0002-guard-fragment-model.md:3`, `07-conclusions.md:142`

### FRAGMENT-002 용어 — 4차까지의 "가드"를 게이트라 부른다

- 결정:
  > 용어: 4차까지 "가드"라 부르던 것을 원장을 따라 **게이트**라 부른다. 제목과 파일 이름은 그대로 둔다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0002-guard-fragment-model.md:5`(정본)
- 닫은 사람: 편집자 결정(10라운드 5차 본문, `adr/0002-guard-fragment-model.md:5`)
- 라운드: 10
- 까닭: `adr/0002-guard-fragment-model.md:5`

### FRAGMENT-003 소유자의 방향 — if/then/else의 옛 방식 제거와 새 방식, allOf 병합 유지

- 결정:
  > - `if`/`then`/`else`의 기존 방식(조건부 `required`로 `active`를 조절)은 완전히 제거한다. `if` 블록의 스키마로 값을 검증해, 통과하면 `then` 절을 자식에 적용한다. 컨디션은 `if`, 적용은 `then`으로 완전히 분리하고 `else`는 반대 동작으로 허용한다.
  > - `allOf`의 기존 병합은 유지한다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0002-guard-fragment-model.md:21,23`(정본)
- 닫은 사람: 편집자 결정(ADR 0002 첫 판 `ab41d790d`, `adr/0002-guard-fragment-model.md:18` 소유자의 방향을 옮긴 편집자 기록, 소유자 원문 없음)
- 라운드: ADR 0002 첫 판(1라운드 전)
- 까닭: `adr/0002-guard-fragment-model.md:18`

### FRAGMENT-004 oneOf·anyOf는 형상 선언이 아니라 검증 조건 — 순수 분기는 작성자가 controls로 제어

- 결정:
  > - `oneOf`/`anyOf`는 형상 선언이 아니라 진짜 검증 조건이다(원장 §1.3의 읽기 1). 분기의 필드는 노드의 `controls.active`·`controls.visible`이나 부모의 자식 집합 제어로 다루고, JSON만으로 다루려면 분기 안에 `if/then/else`를 넣는다. 순수한 `oneOf`·`anyOf`도 허용하되 그때는 작성자가 `controls`로 제어할 책임을 진다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0002-guard-fragment-model.md:22`(정본), `adr/0002-guard-fragment-model.md:164`, `07-conclusions.md:142`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:42` 읽기1), 소유자 답(`reviews/round-9-spec.md:44` 읽기1(이어서))
- 라운드: 9
- 까닭: `reviews/round-9-spec.md:42`, `reviews/round-9-spec.md:44`

### FRAGMENT-005 분기 문장 — 폼은 게이트 없이 분기를 고르지 않고, 게이트는 if와 controls.active 둘뿐

- 결정:
  > 폼은 게이트 없이 분기를 고르지 않는다. 게이트는 둘뿐이다 — `if`(검증기가 판정)와 `controls.active`(작성자의 식). `controls.discriminator`는 분기마다 `controls.active`를 적어 주는 설탕이며 게이트의 종류를 더하지 않는다(아래 "명시 판별"). 분기가 선언한 필드는 조각으로 읽어 노드로 만들고, 어느 분기가 유효한지는 검증기만 판정한다. "읽는 것은 모양 문법뿐"의 유일한 예외는 `controls.discriminator` 아래의 `const`·`enum`이다.
- 보충: 없음
- 상태: 중복(→ GOAL-027)
- 출처: `adr/0002-guard-fragment-model.md:33#2-6`(정본), `02-target-overview.md:230`, `07-conclusions.md:142`, `08-design-a-to-z.md:196`, `03-mental-model.md:21`(GOAL-027의 정본. `adr/0002-guard-fragment-model.md:33`이 "원장 §1.1"을 가리킨다)
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:9` A-3), 소유자 답(`reviews/round-10-owner-answers.md:11` B-22)
- 라운드: 10
- 까닭: `adr/0002-guard-fragment-model.md:3`, `adr/0002-guard-fragment-model.md:178`, `adr/0002-guard-fragment-model.md:179`

### FRAGMENT-006 controls.discriminator는 명시해야 동작 — 명시 없는 union은 모든 분기가 켜지고 const·enum 자동 감지는 사라짐

- 결정:
  > **`controls.discriminator`는 명시해야 동작한다.** 명시 없는 `oneOf`·`anyOf`는 모든 분기가 켜진다(원장 §1.1 P1′ 분기 문장). 오늘의 `const`·`enum` 자동 감지는 사라진다(소유자 12라운드 수용).
- 보충:
  > "그런 스키마는 `controls.discriminator`를 더하거나 분기 안에 `if/then/else: false`를 쓴다." (`adr/0002-guard-fragment-model.md:194`)
- 상태: 현행
- 출처: `adr/0010-branch-conventions.md:18#1-3`(정본), `adr/0002-guard-fragment-model.md:33#7-8`, `adr/0002-guard-fragment-model.md:101`, `adr/0002-guard-fragment-model.md:194`, `adr/0010-branch-conventions.md:54`, `02-target-overview.md:231`, `08-design-a-to-z.md:199`
- 닫은 사람: 소유자 답(`reviews/round-12-owner-answers.md:9` 2 &discriminator)
- 라운드: 12
- 까닭: `reviews/round-12-owner-answers.md:9`

### FRAGMENT-007 controls.discriminator 키의 분기 선언 끌어올림과 청사진 오류

- 결정:
  > 그 키의 분기 선언을 게이트 없는 선언으로도 취급해 끌어올린다(14라운드 답 O-1: 태그 키가 분기 안에만 있는 생성기 스키마도 그대로 받는다). 있는 분기끼리 종류가 다르거나 `const`·`enum` 값이 겹치면 청사진 오류다. 일부 분기에만 없는 것은 그 분기가 게이트 없음일 뿐이다.
- 보충:
  > 소유자(14라운드 O-1): "가 로 하죠. 다만, discriminator 를 서로 다르게 선언했거나 discriminator 이 분기마다 다른 타입이나 성질을 가지면 오류로 알려줘야 합니다." (`reviews/round-14-owner-answers.md:7`)
  > "`controls.discriminator`의 키가 어느 분기에도 `const`·`enum`으로 없거나, 있는 분기끼리 종류가 다르거나 값이 겹침(O-1. 일부 분기에만 없는 것은 그 분기가 게이트 없음일 뿐 오류가 아니다)" (`adr/0014-error-policy.md:228`)
  > "청사진 분석: controls.discriminator 키가 어느 분기에도 없거나, 분기끼리 종류가 다르거나 값이 겹치거나, 선언 사이 값이 다름" (`adr/0014-error-policy.md:260`)
  > 편집자 결정(18C-91): "【추론】 판별 키가 union이어도 FRAGMENT-007의 분기 규칙은 그대로다(BLUEPRINT-017)." (`reviews/round-18-closing.md:2548`)
  > 편집자 결정(18C-91): "【추론】 분기의 `const`·`enum` 리터럴의 JSON 종류가 판별 키의 목록(`schemaType`, 원소 하나인 경우 포함)과 nullable 어디에도 없으면, 청사진이 개발 모드 경고 `(가칭) SCHEMA_FORM_WARNING.DISCRIMINATOR_BRANCH_UNREACHABLE`을 낸다." (`reviews/round-18-closing.md:2549`)
- 상태: 현행
- 출처: `adr/0010-branch-conventions.md:18#4-6`(정본), `02-target-overview.md:231`, `07-conclusions.md:142`, `adr/0010-branch-conventions.md:19`, `reviews/round-18-closing.md:2548-2549`
- 닫은 사람: 소유자 답(`reviews/round-14-owner-answers.md:7` O-1), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-91)
- 라운드: 18
- 까닭: `reviews/round-14-owner-answers.md:7`, `reviews/round-18-closing.md:2556-2564`

### FRAGMENT-008 명시 판별의 변환 — 청사진이 const·enum을 읽어 controls.active 조각 객체처럼 다루고 분기 스키마는 손대지 않음

- 결정:
  > 작성자가 union 호스트에 예약 층 키 `controls.discriminator`를 적으면, 청사진이 각 분기에서 그 키의 `const`·`enum`을 읽어 그 분기를 `controls: { active: "./<key> === <value>" }`를 가진 조각 객체처럼 다룬다(`enum`이면 값이 그 목록에 드는가). 변환된 분기는 위 표의 3행이 된다.
  > - **분기 스키마는 손대지 않는다.** `kind: { const }`와 `required`는 그대로 검증기에 간다(ADR 0001). 소유자: "우리는 "&active": 을 더하는거지 스키마를 수정하는건 아니니까".
  > - 변환은 청사진 단계에서 끝난다. 상태 칸과 작업 루프를 바꾸지 않는다(ADR 0005 §4).
  > 판별 프로퍼티는 작성자가 본체 `properties`에 선언한다(원장 §1.2의 축 2항(조건 프로퍼티는 `properties`에 선언한다), 컨벤션). 폼이 소유하지 않는다.
  > - 암묵 default는 없다. 채움의 원천은 `controls.default` > `default` > 없음뿐이다(원장 §3). 값이 비어 있으면 `===` 비교가 모두 거짓이므로 어느 분기도 켜지지 않는다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0002-guard-fragment-model.md:75,97-100`(정본; 99는 문장 #1–#2), `02-target-overview.md:231`, `adr/0002-guard-fragment-model.md:33`, `adr/0005-blueprint-analysis-and-node-sharing.md:80,82-86`(BLUEPRINT-017과 일부 겹침)
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:11` B-22), 소유자 답(`reviews/round-9-spec.md:20` 축2)
- 라운드: 10
- 까닭: `adr/0002-guard-fragment-model.md:179`, `adr/0002-guard-fragment-model.md:97`

### FRAGMENT-009 게이트의 두 종류 — if 게이트(compileGuard 동기 평가)와 controls.active 게이트

- 결정:
  > 게이트의 종류는 둘이다. 둘 다 호스트 바퀴 안에서 같은 절차로 평가된다(ADR 0007).
  > - **`if` 게이트**: 스키마다. 검증기 플러그인의 `compileGuard`로 동기 평가한다(ADR 0004). 폼은 `if` 안에 무엇이 오든 그 뜻을 해석하지 않는다(원장 §1.2의 축 1항(폼은 JSON Schema 문법을 해석하지 않는다)).
  > - **`controls.active` 게이트**: 예약 층의 표현식이다. 조각 객체에 달면 조각 게이트, 노드 스키마에 달면 노드 게이트다(아래).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0002-guard-fragment-model.md:48-51`(정본), `adr/0002-guard-fragment-model.md:33`, `adr/0002-guard-fragment-model.md:190`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:19` 축1), 편집자 결정(10라운드 5차 본문, `adr/0002-guard-fragment-model.md:14`)
- 라운드: 10
- 까닭: `adr/0002-guard-fragment-model.md:182`, `adr/0002-guard-fragment-model.md:50`

### FRAGMENT-010 선택 가드·selection 칸·setSelectedBranch·초기 분기 추론은 없다

- 결정:
  > 4차의 **선택 가드**(`selection === i`)는 없다. 폼이 분기를 고르지 않으므로 상태 칸 `selection`, `setSelectedBranch`, 초기 분기 추론이 함께 사라졌다(`07-conclusions.md` §4.25). 상태는 원본과 `extras` 둘뿐이다(원장 §2).
- 보충: 없음
- 상태: 현행(부정 결정)
- 출처: `adr/0002-guard-fragment-model.md:53`(정본), `07-conclusions.md:142`, `adr/0002-guard-fragment-model.md:14`
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:9` A-3), 편집자 결정(10라운드, `07-conclusions.md:142`)
- 라운드: 10
- 까닭: `07-conclusions.md:142`
- 충돌:
  > `open-questions.md:15`의 "**초기 분기 추론은 로드한 값을 바꾸지 않아야 한다**(R9)."는 정본과 다르다. 초기 분기 추론은 사라졌다. 정본이 이긴다(`adr/0002-guard-fragment-model.md:53`).

### FRAGMENT-011 조각은 트리다 — 문맥과 소속, 중첩 순회, 전순서, 존재의 합집합, 제약의 교차

- 결정:
  > - 조각은 자기가 나온 구문의 문맥(연언인가 선언인가)과 소속(어느 `oneOf`/`anyOf`의 분기인가)을 든다.
  > - **중첩 조각은 감싸는 조각이 활성일 때만 순회한다.**
  > - 전순서 = (감싸는 조각의 순서, 키워드 순위 `properties` < `allOf[i]` < `if`/`then`/`else` < `oneOf`/`anyOf`, 배열 인덱스). 2라운드 S13("나중 선언이 이긴다"가 JSON 키 순서에 기댄다)은 이 전순서로 닫힌다.
  > - **존재(어떤 프로퍼티가 있는가)는 활성 조각의 합집합이다.** 문맥과 무관하다.
  > - **제약(기존 프로퍼티에 얹는 overlay)은 연언 문맥의 조각끼리만 교차한다.** 게이트 없는 분기는 존재만 더한다. 순수 분기 둘이 `kind`에 `const: 'a'`와 `const: 'b'`를 두면 교차는 공집합이 되어 검증기보다 좁은 힌트를 내기 때문이다. 게이트가 켜진 조각은 작성자가 "이 분기가 해당한다"고 선언한 것이므로 연언으로 적용한다. 병합의 세부는 ADR 0005 §5의 병합표다.
  > 유효 스키마는 폼 전용이고 검증기에 가지 않으므로(ADR 0001) 영향은 UI 힌트(select의 선택지, min/max)에 한정된다.
- 보충:
  > "4.27의 "전순서"는 호스트에서 조각까지의 경로를 (키워드 순위, 배열 인덱스) 쌍의 열로 보고 사전식으로 비교한 것이다." (`07-conclusions.md:143`)
  > "JSON 키 순서에 기대지 않는다." (`07-conclusions.md:143`)
  > "같은 호스트의 `oneOf`와 `anyOf` 분기의 동순위. 키워드 순위가 둘을 한 순위로 두어 `oneOf[i]`와 `anyOf[i]`의 자리가 같다." (`reviews/round-18-agenda.md:23`)
- 상태: 현행
- 출처: `adr/0002-guard-fragment-model.md:57-61,64`(정본), `07-conclusions.md:143`, `06-conclusions.md:296`
- 닫은 사람: 편집자 결정(4차 본문 E3, `adr/0002-guard-fragment-model.md:13`), 편집자 결정(10라운드, `07-conclusions.md:143` 전순서 정의)
- 라운드: 10
- 까닭: `adr/0002-guard-fragment-model.md:59`, `adr/0002-guard-fragment-model.md:61`
- 충돌:
  > `adr/0002-guard-fragment-model.md:59`의 "키워드 순위 `properties` < `allOf[i]` < `if`/`then`/`else` < `oneOf`/`anyOf`"는 18라운드 결정과 다르다: 같은 호스트의 `oneOf` 분기는 모든 `anyOf` 분기보다 앞이다(FRAGMENT-049). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:238-239`).

### FRAGMENT-012 같은 oneOf에서 게이트 가진 분기가 둘 이상 켜짐 — 막지 않고 연언으로 적용, 개발 모드 경고

- 결정:
  > 같은 `oneOf`에서 게이트를 가진 분기가 둘 이상 동시에 켜지는 것을 폼은 막지 않는다. 켜진 분기의 제약은 모두 연언으로 적용되고, 개발 모드에서 경고한다. 게이트의 결과만 세고 분기의 내용은 읽지 않으므로 축 1항(폼은 JSON Schema 문법을 해석하지 않는다) 안이다(소유자 답 20, ADR 0005 §4).
- 보충:
  > "개발 모드 로그. `onError` 경고 기록(핸들러가 없는 프로덕션에서는 판정하지 않음)" (`adr/0014-error-policy.md:232`, 정착 경고 행의 드러남)
  > "기본 출력(개발 모드 로그)은 프로덕션에서 침묵한다(경고는 결과를 바꾸지 않으므로 침묵해도 계약이 깨지지 않는다). `onError` 핸들러는 모든 환경에서 경고 기록을 받는다(§3)" (`adr/0014-error-policy.md:33`)
- 상태: 현행
- 출처: `adr/0002-guard-fragment-model.md:62#1-3`(정본), `02-target-overview.md:235`, `07-conclusions.md:153`, `08-design-a-to-z.md:197`
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:17` C-20)
- 라운드: 10
- 까닭: `reviews/round-10-owner-answers.md:17`
- 충돌:
  > `adr/0002-guard-fragment-model.md:62`의 "켜진 분기의 제약은 모두 연언으로 적용되고, 개발 모드에서 경고한다."는 드러남을 개발 모드로만 적는다. 경고의 드러남은 ADR 0014 4판이 정한다. 기본 출력은 개발 모드 로그이고 프로덕션에서 침묵하며, `onError` 핸들러가 있으면 모든 환경에서 경고 기록을 받는다. 정본이 이긴다(`adr/0014-error-policy.md:33`, `adr/0014-error-policy.md:232`).

### FRAGMENT-013 게이트 가진 분기의 정의 — controls.active(변환 포함) 또는 else: false인 if, 키 유무로 판정

- 결정:
  > 게이트 가진 분기는 `controls.active`를 가진 분기(`controls.discriminator`로 변환된 분기 포함)이거나, 분기에 `else: false`인 `if`가 있어(키 유무로 판정, 형제 키가 있어도 같다) `if`가 분기 전체를 켜고 끄는 분기다(원장 §4). 경고는 이 분기만 센다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0002-guard-fragment-model.md:62#4-5`(정본), `03-mental-model.md:120`, `02-target-overview.md:234`, `08-design-a-to-z.md:197`
- 닫은 사람: 편집자 결정(12라운드, `reviews/round-12-owner-review.md:258`)
- 라운드: 12
- 까닭: `reviews/round-12-owner-review.md:258`, `reviews/round-12-owner-answers.md:28`(소유자 물음, 답 아님)

### FRAGMENT-014 노드 게이트는 조각 게이트와 같은 장치 — 로드 때 생기지 않음, 거짓→참에서 생겨 채움, 바퀴 안 평가

- 결정:
  > - 로드 때 게이트가 거짓인 노드는 생기지 않으므로 채우지 않는다. 거짓에서 참이 되면 노드가 **생기므로**, 그때 값이 없음이면 채움(`controls.default` > `default`)이 적용된다(ADR 0007). `controls.visible`의 전환은 생성이 아니다.
  > - 노드 게이트도 호스트 바퀴 안에서 평가된다. 그래서 바퀴의 상한에 노드 게이트 수가 든다(아래 D-2의 3).
  > - 한 장치의 두 범위다. 조각 게이트와 노드 게이트가 다르게 동작하면 G4(하나의 개념에는 하나의 장치)에 걸린다.
- 보충:
  > "노드 게이트도 게이트 가진 조각처럼 꺼진 채 출발하고 전순서 안에서 평가된다(양의 순환에서 고정점이 하나로 정해진다)." (`08-design-a-to-z.md:195`)
  > "노드 게이트도 게이트 가진 조각처럼 꺼진 채 출발한다. 전순서에서 노드 게이트는 그 노드를 선언한 조각 바로 뒤에, 같은 조각 안에서는 선언 순서로 든다" (`03-mental-model.md:103`)
- 상태: 현행
- 출처: `adr/0002-guard-fragment-model.md:69-71`(정본), `02-target-overview.md:229`, `07-conclusions.md:137-138`, `08-design-a-to-z.md:195`, `03-mental-model.md:103`
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:8` A-2), 소유자 답(`reviews/round-10-owner-answers.md:14` C-10), 소유자 답(`reviews/round-10-owner-answers.md:7` A-1)
- 라운드: 10
- 까닭: `adr/0002-guard-fragment-model.md:71`, `adr/0002-guard-fragment-model.md:180`

### FRAGMENT-015 꺼진 노드의 값 — 형상에 없고 원본은 기본으로 남아 방출에서 빠지며, 나감 정책이 참이면 나갈 때 한 번 비움

- 결정:
  > - 노드 스키마의 `controls.active`가 거짓이면 그 노드는 **형상에 없다**. 원본은 기본으로 남아 `getInactiveValues`로 읽을 수 있고 방출에서 빠진다(P4). 나감 정책이 참으로 정해진 노드는 나갈 때 한 번 비운다(원장 §3, 13라운드 답 2). 조각이 꺼졌을 때와 같다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0002-guard-fragment-model.md:68`(정본), `02-target-overview.md:229`, `07-conclusions.md:137`, `open-questions.md:7`, `adr/0002-guard-fragment-model.md:184`
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:8` A-2), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값)
- 라운드: 13
- 까닭: `reviews/round-13-owner-answers.md:8`, `adr/0002-guard-fragment-model.md:184`
- 충돌:
  > `adr/0002-guard-fragment-model.md:68`의 "원본은 기본으로 남아 `getInactiveValues`로 읽을 수 있고 방출에서 빠진다(P4)."는 잠복 원본 열거를 `getInactiveValues`라는 읽기로 적는다. 소유자 답과 다르다. 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:22`, VALUE-029: 잠복 원본 열거는 루트 노드의 함수이고 노드마다 getter `inactiveValues`).

### FRAGMENT-016 게이트는 투영 후 값을 본다(E5) — 검증기가 볼 값, 객체가 아닌 원본이면 G = {}

- 결정:
  > 게이트의 입력 `G`는 **검증기가 볼 값**이다 — 현재의 활성 집합으로 합성한 로컬에 투영(`omitEmpty`·`omitTrailing`·null)을 적용한 것. `if`와 `controls.active`가 같다. 형상과 판정이 어긋나지 않게 하는 조건이다(P1). `extras`(선언되지 않은 키의 값)도 그 값에 든다.
  > - 예외는 하나다: 호스트 자신의 원본이 객체가 아니면 `G = {}`. 2라운드 S8(`properties`·`required`가 `null`·`undefined`에서 공허하게 참)은 이 예외로 닫힌다. 빈 중첩 호스트도 자기 `{}`로 자기 게이트를 평가한다. 분기 안 `if`에 조건 프로퍼티의 `required`가 있으면 `{}`에서 그 분기들의 `then`은 모두 꺼진다(아래 규칙 3의 컨벤션).
  > - 끌어올린 게이트가 `{addr: null}`에서 참인 것은 검증기도 같으므로 계약 위반이 아니다(`00-goals.md` G1).
- 보충:
  > "빈 문자열을 "있다"로 다루고 싶은 작성자는 `omitEmpty`를 끈다." (`open-questions.md:23`)
  > 소유자(1라운드): "빈 문자열을 '있다'고 보는 게 오히려 이상하다. 그렇게 처리할 거면 omitEmpty를 끄면 된다" (`reviews/round-1.md:177`)
- 상태: 현행
- 출처: `adr/0002-guard-fragment-model.md:105-107`(정본; 105는 문장 #1–#4), `adr/0002-guard-fragment-model.md:182`, `08-design-a-to-z.md:119`, `open-questions.md:23`, `adr/0007-settle-cycle.md:20`
- 닫은 사람: 소유자 답(`reviews/round-1.md:177` 가드는 어떤 값을 보는가), 편집자 결정(4차 본문 E5, `adr/0002-guard-fragment-model.md:13`)
- 라운드: 5
- 까닭: `adr/0002-guard-fragment-model.md:182`, `adr/0002-guard-fragment-model.md:105`

### FRAGMENT-017 출발점은 고정이고 재평가는 비단조(E6, D-2) — 모든 게이트를 한 바퀴에, 상한, 지원 범위 밖, 순서 힌트, 비용

- 결정:
  > 1. 출발점 `A := 게이트 없는 조각 ∪ 조상에서 상속된 overlay`. **직전 커밋의 활성 집합은 읽지 않는다** — 형상이 이력을 읽으면 같은 원본이 다른 형상이 된다(P3). 직전 커밋의 활성 집합은 생긴 노드의 판정(전이)과 바퀴의 평가 순서 힌트(아래 5)로만 쓴다.
  > 2. 한 바퀴에 **모든** 게이트(조각 게이트와 노드 게이트)를 평가한다. 참이면 켜고 거짓이면 **끈다**. 한 바퀴 안의 켜짐·꺼짐은 뒤의 게이트에 즉시 반영된다(가우스-자이델, F3).
  > `A`가 바뀌면 다시 돈다. 상한 = 게이트 가진 조각 수 + 노드 게이트 수 + 1. 넘으면 정착은 원장 §4의 예산 규칙을 따른다.
  > 4. 지원 범위 밖은 "자기 부정 스키마"가 아니라 그 일반형이다: **게이트 의존 관계에 부정을 포함한 순환**이 있으면 고정점이 없을 수 있고, 결과는 상한에서 결정적이되 임의적이다(F3). 1라운드 R6이 철회한 "순환이 없다"의 자리가 이것이다.
  > 5. 직전 커밋의 활성 집합은 출발점을 바꾸지 않고 **바퀴의 평가 순서 힌트로** 쓴다(F13). 출발점 자체를 바꾸는 최적화는 `open-questions.md` Q15.
  > 비용: 정순 의존 체인은 2바퀴, 역순 N단은 N+1바퀴다(E4). 이 셈은 원본이 이미 있는 계산에 한정되며, 채움으로 이어지는 체인은 링크마다 전이 라운드를 쓴다(F2, ADR 0007).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0002-guard-fragment-model.md:113-117,119`(정본; 115는 문장 #1–#2), `03-mental-model.md:162`, `adr/0007-settle-cycle.md:54,56,58`(SETTLE-018·SETTLE-020·SETTLE-022의 정본, 겹침), `adr/0007-settle-cycle.md:64`(SETTLE-026의 정본, 겹침; E4 비용 셈은 이 항목에만 있다)
- 닫은 사람: 원리(`reviews/round-5-derivations.md:41` D-2 도출, `03-mental-model.md:162` 도출표), 편집자 결정(10라운드, `07-conclusions.md:132` 상한에 노드 게이트 수)
- 라운드: 10
- 까닭: `adr/0002-guard-fragment-model.md:113`, `reviews/round-5-derivations.md:41`

### FRAGMENT-018 호스트 바퀴 상한 초과 — 자동 쓰기를 뺀 원본 B 커밋, degraded, 모든 환경에서 사슬 끝 throw

- 결정:
  > 그 정착의 자동 쓰기를 모두 뺀 원본 B를 커밋하고, 커밋되는 형상은 원본 B로 한 번 더 계산한 것이며 그 바퀴도 상한에 걸리면 마지막 바퀴의 `A`로 고정한다. 결과는 `diagnostics.status = 'degraded'`(`cause`는 `'budget'`)로 두며, 모든 환경에서 커밋·통지 뒤 사슬 끝에서 throw하고 `degraded` 동안 제출을 거부한다(17라운드 소유자 답 R17-1 나, ADR 0014 4판). `diagnostics`는 루트에서 관측한다(ADR 0007).
- 보충: 없음
- 상태: 중복(→ SETTLE-023)
- 출처: `adr/0002-guard-fragment-model.md:115#3-5`(정본)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 편집자 결정(7–8라운드 수렴 D-31, `06-conclusions.md:196` 원본 B 커밋)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:9`

### FRAGMENT-019 금지 조각은 없다(D-3 = (iii)) — false·not required·additionalProperties: false는 폼이 읽지 않음

- 결정:
  > `properties: { x: false }`, `not: { required: [...] }`, `additionalProperties: false`는 값의 유효성을 정하는 문법이므로 **폼이 읽지 않는다**(P1′). `false`는 아무것도 선언하지 않으므로 "x라는 자식이 존재한다"는 선언도, 값을 빼는 명령도 아니다. 분기 컨벤션의 `else: false`도 같다. 그 `else` 조각은 아무 노드도 선언하지 않는다.
  > | 상황 | 폼의 동작 |
  > | ---- | -------- |
  > | x가 본체(`properties`)에 선언돼 있다 | 보통 필드로 보이고 검증기의 에러가 붙는다 |
  > | x가 본체에 없다 | 입력 노드가 없는 **잔여 키**다 (아래) |
  > | 작성자가 숨기려 한다 | `controls.active`를 쓴다 (ADR 0003) |
  > 2라운드 S5(금지 조각의 순환 — `if required a → properties a: false`에 고정점이 없다)는 읽지 않으므로 사라진다. 3라운드 D-3의 (i)("비활성화와 같다")도 폐기된다 — BE가 거부하려던 값을 폼이 조용히 지우는 것은 P2 위반이다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0002-guard-fragment-model.md:125-133`(정본), `02-target-overview.md:233`, `08-design-a-to-z.md:198`, `open-questions.md:76`, `03-mental-model.md:150`
- 닫은 사람: 원리(`reviews/round-5-derivations.md:28-34` D-3 도출, `03-mental-model.md:150` 도출표)
- 라운드: 5
- 까닭: `reviews/round-5-derivations.md:30`, `adr/0002-guard-fragment-model.md:35`, `reviews/round-2.md:115`(소유자 발언과 그 정정)

### FRAGMENT-020 잔여 키의 표시는 검증기 플러그인의 계약 — rejectedKey, 기각 형태별로 키를 대는 쪽

- 결정:
  > **잔여 키의 표시는 검증기 플러그인의 계약이다**(C-4). 정규화된 에러에 선택 필드 `rejectedKey?: string`을 두고 플러그인이 채운다. core는 `rejectedKey`가 있는 호스트 에러만 모으므로 형상 규칙을 갖지 않는다.
  > | 기각 형태 | 누가 키를 대는가 |
  > | -------- | --------------- |
  > | `false` 스키마 (`properties`·`patternProperties`·분기 안) | 에러만으로 — `instancePath`가 곧 키 |
  > | `additionalProperties`·`unevaluatedProperties`·`propertyNames` | 에러만으로 — `params` |
  > | 단일 이름 `not: { required: ['x'] }` | 플러그인이 자기 스키마를 읽는다 |
  > | 두 이름 이상의 `not: { required: [...] }` | 아무도 못 댄다 — 호스트 에러로 남는다(F8) |
- 보충: 없음
- 상태: 현행
- 출처: `adr/0002-guard-fragment-model.md:135-142`(정본), `08-design-a-to-z.md:349`, `03-mental-model.md:151`
- 닫은 사람: 편집자 결정(4차 본문 C-4, `adr/0002-guard-fragment-model.md:13`; 반론 `reviews/round-5-decisions.md:236`)
- 라운드: 5
- 까닭: `adr/0002-guard-fragment-model.md:144`, `reviews/round-5-decisions.md:236`

### FRAGMENT-021 중첩은 재귀로 다루고 allOf 안의 if/then은 필수 지원

- 결정:
  > 1. **중첩은 재귀로 다룬다.** 조각도 스키마다. `oneOf`·`anyOf` 분기 **안의** `if`/`then`/`else`도 같다. 순환은 생길 수 있고 비단조 재평가와 상한으로 드러난다(위, ADR 0007).
  > 2. **`allOf` 안의 `if`/`then`은 필수 지원이다.** 스키마 객체 하나에 `if`는 하나뿐이어서, 독립 조건 여럿을 쓰는 표준 관용구가 이것이다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0002-guard-fragment-model.md:150-151`(정본)
- 닫은 사람: 편집자 결정(4차 본문, `adr/0002-guard-fragment-model.md:13`), 소유자 답(`reviews/round-9-spec.md:23` 축5)
- 라운드: 9
- 까닭: `adr/0002-guard-fragment-model.md:151`

### FRAGMENT-022 분기 컨벤션 — oneOf·anyOf 분기의 if에는 else: false와 required: [조건 프로퍼티]가 함께 필수(ajv 실측표)

- 결정:
  > 3. **분기 컨벤션: `oneOf`·`anyOf`의 분기에 `if`를 쓸 때는 `else: false`와 `if`의 `required: [조건 프로퍼티]`가 함께 필수다.** ajv 8.17.1의 실측이다(draft-07과 2020-12 판정 동일, `07-conclusions.md` §7.1, `spikes/round9/REPORT.txt`). 각 분기의 `if`는 `{ properties: { kind: { const } }, required: ['kind'] }`다.
  > | 배치 | 올바른 값 `{kind:'a', x:'s'}` | 누락 값 `{kind:'a'}` | 어느 조건에도 맞지 않는 값 `{kind:'c'}` | 조건 프로퍼티 없음 `{x:'s'}` |
  > | --- | --- | --- | --- | --- |
  > | `oneOf` 분기에 `if/then`만 | 거부 | 통과 | 거부 | 거부 |
  > | `oneOf` 분기에 `if/then` + `else: false` | 통과 | 거부 | 거부 | 거부 |
  > | `anyOf` 분기에 `if/then`만 | 통과 | 통과 | 통과 | 통과 |
  > | `anyOf` 분기에 `if/then` + `else: false` | 통과 | 거부 | 거부 | 거부 |
  > `else: false`가 없으면 `if`가 거짓인 분기가 공허하게 통과해 분기로 세어진다. 그래서 `oneOf`는 올바른 값을 거부하고 `anyOf`는 모든 값을 통과시킨다. `if`에서 `required`를 빼면 `else: false`를 붙여도 `{x:'s'}`가 통과하고, 빈 값에서 모든 `if`가 참이 되어 폼이 모든 분기의 `then`을 켠다. `allOf` 항목과 최상위 `if/then`은 `else` 없이 되지만 어느 조건에도 맞지 않는 값을 거르지 못한다. 그 제약이 필요하면 작성자가 `enum`이나 `oneOf` + `else: false`를 쓴다. 이것은 검증기의 뜻이지 폼의 일이 아니다.
- 보충:
  > "없으면 `if`가 거짓인 분기가 공허하게 통과해 검증기가 두 분기를 모두 세고(ajv 8.17.1 실측, `spikes/round9/oneof-if.mjs`), 폼에서는 그 분기가 "게이트 가진 분기"가 아니게 되어 분기의 형제 선언은 늘 켜지고 `then`은 `if`로 켜지고 꺼진다." (`adr/0010-branch-conventions.md:15`)
- 상태: 현행
- 출처: `adr/0002-guard-fragment-model.md:152-161`(정본), `adr/0010-branch-conventions.md:15-16`, `02-target-overview.md:232`, `07-conclusions.md:152`, `08-design-a-to-z.md:199`, `03-mental-model.md:149`
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:9` A-3), 소유자 답(`reviews/round-10-owner-answers.md:38` E-23)
- 라운드: 10
- 까닭: `adr/0002-guard-fragment-model.md:152`, `adr/0002-guard-fragment-model.md:3`

### FRAGMENT-023 폼은 if의 required와 축 2항을 검사하지 않는다 — if의 내용에 관여하지 않음

- 결정:
  > **폼은 `if`의 `required`와 축 2항(조건 프로퍼티는 `properties`에 선언한다)을 검사하지 않는다.** 폼은 `if`의 내용에 관여하지 않는다(원장 §1.2의 축 1항(폼은 JSON Schema 문법을 해석하지 않는다)). 소유자: "이건 우리가 참견할 문제는 아닙니다.
- 보충:
  > 소유자(10라운드 E-23 되물음 답): "이해했습니다. 다만, 이건 우리가 참견할 문제는 아닙니다. 평가하지 않습니다." (`reviews/round-10-owner-answers.md:38`)
- 상태: 현행(부정 결정)
- 출처: `adr/0002-guard-fragment-model.md:163#1-3`(정본), `adr/0010-branch-conventions.md:16`, `adr/0010-branch-conventions.md:19`, `adr/0002-guard-fragment-model.md:14`, `adr/0002-guard-fragment-model.md:181`, `02-target-overview.md:235`, `07-conclusions.md:153`, `03-mental-model.md:149`, `03-mental-model.md:30`
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:38` E-23), 소유자 답(`reviews/round-10-owner-answers.md:40` E-19)
- 라운드: 10
- 까닭: `reviews/round-10-owner-answers.md:28,30`(되물음 전의 첫 답), `adr/0002-guard-fragment-model.md:181`
- 충돌:
  > `reviews/round-18-agenda.md:108`의 "`if`의 공허한 참 경고(Q10, `open-questions.md:68`)."는 이를 열린 안건으로 둔다. 정본과 다르다. 정본이 이긴다(`reviews/round-10-owner-answers.md:38,40`, E-23·E-19).

### FRAGMENT-024 oneOf·anyOf 분기에 if는 있고 else: false가 없음 — 개발 모드 경고 대상(키의 유무만 봄)

- 결정:
  > 누락은 개발 모드 경고 대상이다(소유자 12라운드 확인: 둔다, 원장 §5).
- 보충:
  > "개발 모드 로그. `onError` 경고 기록(핸들러가 있으면 모든 환경)" (`adr/0014-error-policy.md:230`, 청사진 경고 행의 드러남)
- 상태: 현행
- 출처: `adr/0010-branch-conventions.md:15#3`(정본), `adr/0002-guard-fragment-model.md:163#4-5`, `02-target-overview.md:235`, `07-conclusions.md:153`, `adr/0010-branch-conventions.md:53`
- 닫은 사람: 소유자 답(`reviews/round-12-owner-answers.md:14` 6 else: false 경고)
- 라운드: 12
- 까닭: `reviews/round-12-owner-answers.md:14`, `reviews/round-11-owner-answers-check.md:59`

### FRAGMENT-025 선언 문맥은 형상을 고르지 않는다 — 분기의 형상을 좁히는 것은 게이트 둘뿐

- 결정:
  > 4. **선언 문맥은 형상을 고르지 않는다.** 연언은 "전부 적용"이어서 형상이 결정된다. 게이트 없는 분기는 존재만 더하므로 분기의 필드가 모두 노드로 있다. 분기의 형상을 좁히는 것은 게이트 둘뿐이다 — 분기 안의 `if`와 조각 객체의 `controls.active`(작성자가 적었거나 `controls.discriminator`가 적어 준 것). 둘 다 없으면 작성자가 `controls`로 제어할 책임을 진다(읽기 1).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0002-guard-fragment-model.md:164`(정본), `02-target-overview.md:230`, `07-conclusions.md:142`, `adr/0002-guard-fragment-model.md:193`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:44` 읽기1(이어서)), 소유자 답(`reviews/round-10-owner-answers.md:9` A-3)
- 라운드: 10
- 까닭: `reviews/round-9-spec.md:44`

### FRAGMENT-026 존재는 선언 위치로, 필수성은 required로 가른다

- 결정:
  > 5. **존재는 선언 위치로, 필수성은 `required`로 가른다.** 조각 안에서만 선언된 프로퍼티는 조건부로 존재한다. 기본 `properties`에 선언된 프로퍼티는 조각으로 꺼지지 않는다. 그것을 형상에서 빼는 것은 노드 자신의 `controls.active`(노드 게이트)와 부모 `controls.children`의 `controls.active`다(원장 §4). `required`는 말 그대로 required다. 조건에 쓰는 프로퍼티는 본체 `properties`에 선언한다(원장 §1.2의 축 2항(조건 프로퍼티는 `properties`에 선언한다)). 컨벤션이며 폼은 검사하지 않는다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0002-guard-fragment-model.md:165`(정본)
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:20` 축2), 소유자 답(`reviews/round-9-spec.md:21` 축3)
- 라운드: 10
- 까닭: `reviews/round-9-spec.md:20-21`

### FRAGMENT-027 다른 서브트리를 보는 조건은 if를 공통 조상으로 끌어올린다 — 상속 overlay(E12)

- 결정:
  > 6. **다른 서브트리를 보는 조건은 `if`를 공통 조상으로 끌어올려 표현한다 — 상속 overlay**(E12). 끌어올린 조각의 `then`이 손자를 선언하면 청사진이 그 선언을 자식 호스트의 **상속 overlay**로 귀속시키되 게이트는 조상의 것이다. 자식의 계산 입력은 (원본, 상속 overlay 집합)이고, 부모의 바퀴가 overlay 집합을 바꾸면 자식을 **그 바퀴 안에서** 재계산한다 — 부모 게이트가 자식의 방출을 읽으므로 뒤로 미룰 수 없다. 같은 입력이면 재계산하지 않도록 메모한다(F5). 조건의 입력이 값 밖(`@` 컨텍스트, 사용자 권한)에 있으면 서버가 원리적으로 검증할 수 없으므로 `controls`로만 쓴다. 비용은 ADR 0009.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0002-guard-fragment-model.md:166`(정본)
- 닫은 사람: 편집자 결정(4차 본문 E12, `adr/0002-guard-fragment-model.md:13`)
- 라운드: 5
- 까닭: `adr/0002-guard-fragment-model.md:166`

### FRAGMENT-028 수동 선택은 작성자가 선언한 판별 프로퍼티로 표현하고, 판정은 validator(작성된 스키마, 방출 값)

- 결정:
  > 폼에는 분기를 고르는 상태도 API도 UI도 없다. 사용자가 분기를 고르게 하려면 작성자가 판별 프로퍼티(예: `kind`)를 본체 `properties`에 선언하고, 분기가 그 값을 `if`(분기 안의 `if/then/else`)나 `controls.active`(또는 `controls.discriminator`)로 읽게 한다. 사용자의 선택은 그 프로퍼티에 대한 보통의 입력이다.
  > 판정은 `validator(작성된 스키마, 방출 값)`으로 고정되어 있다(ADR 0001). 사용자가 채운 값이 두 분기에 맞아 검증기가 "2개 매치"라고 하면 폼은 그 에러를 객체 노드 수준에 그대로 보인다. 그것은 스키마 작성자의 문제다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0002-guard-fragment-model.md:170,172`(정본), `02-target-overview.md:230`, `08-design-a-to-z.md:196`, `adr/0002-guard-fragment-model.md:192`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:44` 읽기1(이어서)), 소유자 답(`reviews/round-10-owner-answers.md:9` A-3)
- 라운드: 10
- 까닭: `adr/0002-guard-fragment-model.md:177`, `adr/0002-guard-fragment-model.md:178`

### FRAGMENT-029 ADR 0002 합의 근거 — 소유자 발언 원문 모음

- 결정:
  > - 조각이 `properties` 밖에서 새 노드를 선언할 수 있다 — 소유자: "then / else에서 신규 노드를 선언할 수 있어. object 노드를 기준으로 한다면 properties 외에도 노드가 있을 수 있는거지."
  > - 비판별 분기의 수동 선택이 필요하다 — 소유자: "분기를 수동으로 고르는 기능이 아예 없는 건 애매하다. 서버에서는 oneOf anyOf를 실제로 많이 쓴다." **이 발언은 읽기 1(2026-09-23)이 대체했다.** 폼은 분기를 고르지 않는다. 수동 선택은 작성자가 `properties`에 선언한 판별 프로퍼티로 표현하고 분기가 그 값을 `if`나 `controls.active`로 읽는다(위 "수동 선택").
  > - 폼은 `oneOf`·`anyOf`로 분기를 고르지 않는다 — 소유자(A-3): "분기를 고르지 않으나, if-then-else 문법은 예외적으로 분기를 결정하는 것에 쓰인다. … 즉, &를 제외하고 schema 만으로 form 을 제어하는 방법이 if-then-else 인 것이다."
  > - `controls.discriminator`는 예외적 허용이다 — 소유자(22): "동의합니다. 이 경우에 대한 예외적 허용을 하죠. … 우리는 "&active": 을 더하는거지 스키마를 수정하는건 아니니까".
  > - 노드 게이트와 조각 게이트는 한 장치다 — 소유자(A-2): "기존과 달리 의미를 통일했으니 이렇게 해도 무방하다. 단, 이는 검증과 무관하므로, 잘못된 스키마에 대한 책임은 사용자에게 있고, form은 고지 의무만 진다."
  > - 분기 컨벤션의 `required`를 폼이 검사하지 않는다 — 소유자(23): "이건 우리가 참견할 문제는 아닙니다. 평가하지 않습니다." 소유자(19): "if 문 내에 anyOf 나 oneOf, 아니면 다른 또 복잡한 스키마가 올 수도 있는거라 우리는 그걸 관여하기로 하면 끝이 없을거에요".
  > - 게이트는 동기로 평가하고 방출 값을 본다 — 소유자: "가드는 동기로 해도 될 것 같다." / "가드는 방출 값을 보는 게 맞다."
  > - 스키마 선언의 책임은 작성자에게 있다 — 소유자: "JSON Schema 스펙을 잘 따르는 구현체를 쓰면 되는 거고, 실제 스키마 선언 책임은 사용자에게 있다."
  > - 조각이 꺼지면 방출 값에서 빠지고 노드의 원본은 기본으로 남는다 — ADR 0006, 0007. 소유자(13라운드): "onChange 로 넘어가는 값(방출 표현값)에서 지워지는게 기본값이면 된다." 원본까지 지우는 것은 나감 정책 키를 켤 때다.
  > - 폼이 읽는 것은 형상 문법뿐이다 — ADR 0013 "합의 근거"의 원문(2026-09-23).
- 보충: 없음
- 상태: 현행(기록)
- 출처: `adr/0002-guard-fragment-model.md:176-185`(정본)
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:8,9,11,38,40` A-2·A-3·B-22·E-23·E-19), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값), 소유자 답(`reviews/round-1.md:177` 가드는 방출 값)
- 라운드: 13
- 까닭: `adr/0002-guard-fragment-model.md:176-185`

### FRAGMENT-030 작성자의 약속(ADR 0010) — 폼은 oneOf·anyOf·if의 내용을 읽지 않고 약속을 검사하지 않으며 고지 의무만 진다

- 결정:
  > 폼은 `oneOf`·`anyOf`·`if`의 **내용**을 읽지 않는다(원장 P1′, 축 1항(폼은 JSON Schema 문법을 해석하지 않는다)). 분기가 뜻대로 켜지고 검증기가 뜻대로 가르려면 작성자가 아래 약속을 지켜야 한다. 폼은 이 약속을 검사하지 않고(소유자 답 23: "이건 우리가 참견할 문제는 아닙니다"), 키의 유무와 게이트의 결과만으로 아는 것을 개발 모드에서 경고한다(원장 §5의 닫힌 목록). 잘못된 스키마의 책임은 작성자에게 있고 폼은 고지 의무만 진다(소유자 답 2).
- 보충:
  > "기본 출력(개발 모드 로그)은 프로덕션에서 침묵한다(경고는 결과를 바꾸지 않으므로 침묵해도 계약이 깨지지 않는다). `onError` 핸들러는 모든 환경에서 경고 기록을 받는다(§3)" (`adr/0014-error-policy.md:33`)
  > 반영 칸(12-10, 컨벤션을 어긴 양의 순환 스키마): "TEST-061은 현행(부정 결정)이 되고, A-2의 고지 의무는 이 경우에 적용하지 않는다(답 19가 이긴다)." (`reviews/round-18-owner-answers.md:20`)
- 상태: 현행
- 출처: `adr/0010-branch-conventions.md:11`(정본), `08-design-a-to-z.md:199`, `02-target-overview.md:235`, `adr/0010-branch-conventions.md:52-53`, `reviews/round-18-owner-answers.md:20`
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:38` E-23), 소유자 답(`reviews/round-10-owner-answers.md:8` A-2), 편집자 결정(11라운드 ADR 0010 초안, `adr/0010-branch-conventions.md:3`)
- 라운드: 11
- 까닭: `adr/0010-branch-conventions.md:3`, `adr/0010-branch-conventions.md:11`

### FRAGMENT-031 약속 3 — controls.active(또는 discriminator)만으로 게이트를 단 분기에도 판별 키의 const(또는 enum)와 required를 둔다

- 결정:
  > 3. **`controls.active`(또는 `controls.discriminator`)만으로 게이트를 단 분기에도 판별 키의 `const`(또는 `enum`)와 `required`를 둔다.** `controls.active`는 검증기에게 보이지 않으므로, 이것이 없으면 검증기는 여러 분기를 함께 통과시켜 `oneOf`를 기각한다(ajv 8 실행 확인: `passingSchemas [0,1]`). 생성기 스키마(pydantic, zod, OpenAPI, TypeBox)는 이 둘을 갖고 나온다. 손으로 쓰는 스키마는 작성자가 적는다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0010-branch-conventions.md:17`(정본), `08-design-a-to-z.md:199`
- 닫은 사람: 편집자 결정(11라운드 ADR 0010 초안, `adr/0010-branch-conventions.md:3`), 소유자 답(`reviews/round-10-owner-answers.md:11` B-22, 예시에 const와 required를 둠)
- 라운드: 11
- 까닭: `adr/0010-branch-conventions.md:17`

### FRAGMENT-032 약속 5 — 조건 프로퍼티는 호스트에 선언하는 것이 좋다(잠복 원본), 폼은 검사하지 않음

- 결정:
  > **조건 프로퍼티는 호스트에 선언하는 것이 좋다**(축 2항(조건 프로퍼티는 `properties`에 선언한다)). 분기 안에서만 선언되면 모든 분기가 꺼졌을 때 게이트가 그 값을 볼 수 없으므로(잠복 원본), 호스트에 선언해야 입력란이 분기와 무관하게 보인다. 폼은 검사하지 않는다(소유자 답 19).
- 보충:
  > "분기 안에서만 선언된 판별 키는 모든 분기가 꺼지면 잠복 원본이라 게이트가 볼 수 없다(원장 §2·§5, 14라운드)." (`adr/0002-guard-fragment-model.md:105`)
- 상태: 현행
- 출처: `adr/0010-branch-conventions.md:19#1-3`(정본), `adr/0002-guard-fragment-model.md:105#5`, `adr/0002-guard-fragment-model.md:99`, `adr/0002-guard-fragment-model.md:165`, `08-design-a-to-z.md:199`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:20` 축2), 소유자 답(`reviews/round-10-owner-answers.md:40` E-19), 편집자 결정(14라운드, `adr/0002-guard-fragment-model.md:105` 잠복 원본)
- 라운드: 14
- 까닭: `adr/0010-branch-conventions.md:19`, `adr/0002-guard-fragment-model.md:105`

### FRAGMENT-033 약속 6 — 표준 readOnly는 그 노드에만 걸린다

- 결정:
  > 6. **표준 `readOnly`는 그 노드에만 걸린다.** 객체 노드에 둔 `readOnly`는 자손을 잠그지 않으며 입력이 없으므로 효과가 없다. 표준 독자의 기대(인스턴스 전체)와 다르다. 배열 노드의 `readOnly`는 렌더 계층이 아이템 추가·삭제·이동 입력에 적용하며, 터미널 객체·배열은 입력이 있으므로 리프와 같다. 자손을 잠그려면 부모의 `controls.children`이나 조각의 `controls`를 쓰고, 폼 전체를 잠그려면 Form 속성 `readOnly`·`disabled`를 쓴다(원장 §4, 13라운드 답 1). 터미널이 아닌 객체 노드의 표준 `readOnly`는 개발 모드 청사진 경고 대상이다(원장 §5).
- 보충:
  > "개발 모드 로그. `onError` 경고 기록(핸들러가 있으면 모든 환경)" (`adr/0014-error-policy.md:230`, 청사진 경고 행의 드러남)
- 상태: 현행
- 출처: `adr/0010-branch-conventions.md:20`(정본), `08-design-a-to-z.md:199`
- 닫은 사람: 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙), 편집자 결정(14라운드 F-5, `reviews/round-14-values-check.md:62`)
- 라운드: 14
- 까닭: `reviews/round-13-owner-answers.md:7`

### FRAGMENT-034 약속 7 — 양방향 주입은 식이 undefined를 돌려주어 멈춘다

- 결정:
  > 7. **양방향 주입은 식이 `undefined`를 돌려주어 멈춘다.** 섭씨↔화씨처럼 왕복이 정확하지 않은 `controls.injectTo` 쌍은 순환이다. 폼은 오늘의 자동 차단을 두지 않고 예산으로 잡으므로, 작성자는 대상이 이미 같은 값이면 `undefined`를 돌려준다(원장 §3: `undefined`면 쓰지 않는다).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0010-branch-conventions.md:21`(정본), `08-design-a-to-z.md:199`
- 닫은 사람: 소유자 답(`reviews/round-12-owner-answers.md:20` §9 undefined 반환), 소유자 답(`reviews/round-1.md:179` 순환을 분석 단계에서 금지하는가)
- 라운드: 12
- 까닭: `reviews/round-12-owner-answers.md:20`, `reviews/round-1.md:179`

### FRAGMENT-035 분기가 꺼질 때 이전 분기의 값 — 닫힘: 기본은 원본을 두고 방출에서 빼며, 비움은 unsetOnInactive와 세부가 포괄을 덮는 순서

- 결정:
  > 분기가 꺼질 때 이전 분기의 값. 닫혔다. 기본은 원본을 두고 방출에서 뺀다(P4). 비움은 나감 정책 키(`unsetOnInactive`)로 켜며, 노드 > `controls.children`의 `controls` > 조각의 `controls` > Form 속성 순으로 세부가 포괄을 덮는다(원장 §3).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0002-guard-fragment-model.md:201#1-3`(정본), `open-questions.md:11`
- 닫은 사람: 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값), 소유자 답(`reviews/round-13-owner-answers.md:17` 나감 정책 키 이름), 원리(`reviews/round-10-owner-answers.md:20` D-7 세부 규칙이 포괄 규칙을 덮는 관례, `03-mental-model.md:131`), 편집자 결정(13라운드, `reviews/round-13-owner-review.md:66` 네 층의 순서), 소유자 답(`reviews/round-13-owner-answers.md:16` Form 속성의 자리)
- 라운드: 13
- 까닭: `reviews/round-13-owner-answers.md:8`, `reviews/round-13-owner-answers.md:17`

### FRAGMENT-036 대체됨: 초기 분기 선택에서 required를 읽지 않고 선언된 키 수와 선언 순서만 쓴다(06 §4.4 D-14)

- 결정:
  > - **결론.** 읽지 않는다. `dependentRequired`도, 판별식 식별 5단계의 "`required`에 포함"도 뺀다. 선언된 키 수와 선언 순서만 쓴다.
- 보충: 없음
- 상태: 대체됨(→ FRAGMENT-010)
- 출처: `06-conclusions.md:142`(정본, 6차 결론의 기록)
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:9` A-3), 편집자 결정(10라운드, `07-conclusions.md:142`)
- 라운드: 10
- 까닭: `07-conclusions.md:142`, `06-conclusions.md:143`

### FRAGMENT-037 열림: dependentSchemas·dependentRequired·dependencies를 게이트와 조각의 모델로 환원할지(Q7)

- 결정:
  > - `dependentSchemas`/`dependentRequired`/`dependencies`를 같은 모델로 환원할지 — Q7. 환원한다면 `dependentSchemas: { k: S }`의 게이트는 `{ required: ['k'] }`다.
- 보충: 없음
- 상태: 대체됨(→ FRAGMENT-047)
- 출처: `adr/0002-guard-fragment-model.md:198`(정본), `open-questions.md:56`, `reviews/round-18-closing.md:97-104`
- 닫은 사람: 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:15`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-03)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:15`, `reviews/round-18-closing.md:106-110`

### FRAGMENT-038 열림: controls.discriminator 변환의 세부

- 결정:
  > - `controls.discriminator` 변환의 세부(분기에 그 키의 `const`·`enum`이 없을 때, `$ref`·`allOf` 평탄화, 분기가 자기 `controls.active`도 가질 때) — ADR 0005 §4의 미결.
- 보충:
  > "`$ref`·`allOf` 평탄화, 분기 자체의 `controls.active`와의 결합(AND)은 슬라이스 1의 설계 항목이다." (`08-design-a-to-z.md:178`)
- 상태: 대체됨(→ FRAGMENT-048)
- 출처: `adr/0002-guard-fragment-model.md:204`(정본), `02-target-overview.md:231`, `adr/0005-blueprint-analysis-and-node-sharing.md:128`(BLUEPRINT-019, 중복), `adr/0005-blueprint-analysis-and-node-sharing.md:83`, `08-design-a-to-z.md:178`, `reviews/round-18-closing.md:130-140`
- 닫은 사람: 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:17`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-05)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:17`, `reviews/round-18-closing.md:142-146`
- 충돌:
  > `adr/0002-guard-fragment-model.md:204`의 "분기에 그 키의 `const`·`enum`이 없을 때"는 뒤 결정과 다르다. 일부 분기에만 없으면 그 분기가 게이트 없음이고(FRAGMENT-007, `adr/0010-branch-conventions.md:18`), 어느 분기에도 없으면 청사진 오류다. 채택된 ADR 0014 4판이 이긴다(`adr/0014-error-policy.md:228`). 남은 열림은 `$ref`·`allOf` 평탄화와 분기가 자기 `controls.active`도 가질 때다.
  > `reviews/round-18-agenda.md:17`의 "`controls.discriminator`의 세부(분기에 그 키의 `const`·`enum`이 없을 때, `$ref`·`allOf` 평탄화, 분기 자체 `controls.active`와의 AND)"는 첫 경우를 열린 안건으로 둔다. 정본과 다르다. 정본이 이긴다(`adr/0014-error-policy.md:228`, `adr/0010-branch-conventions.md:18`).
  > `adr/0005-blueprint-analysis-and-node-sharing.md:128`의 "분기에 그 키의 `const`·`enum`이 없을 때 그 분기를 어떻게 다루는가."는 뒤 결정과 다르다. 일부 분기에만 없으면 그 분기가 게이트 없음이고(FRAGMENT-007, `adr/0005-blueprint-analysis-and-node-sharing.md:83`, `adr/0010-branch-conventions.md:18`), 어느 분기에도 없으면 청사진 오류다. 채택된 ADR 0014 4판이 이긴다(`adr/0014-error-policy.md:228`).

### FRAGMENT-039 열림: controls.active 표현식이 다른 호스트를 읽을 때의 평가 순서

- 결정:
  > - `controls.active` 표현식이 다른 호스트를 읽을 때의 평가 순서 — 원장 §6, 코어 루프 슬라이스 전.
- 보충: 없음
- 상태: 중복(→ SETTLE-036)
- 출처: `adr/0002-guard-fragment-model.md:202`(정본), `reviews/round-18-closing.md:429-442,449-455`
- 닫은 사람: 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:36`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-15)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:36`, `reviews/round-18-closing.md:444-447`

### FRAGMENT-040 열림: 루트 dataPath가 플러그인은 "/", 오늘 타입은 ""

- 결정:
  > - 플러그인 세 개가 루트 `dataPath`로 `'/'`를 내는데 `src/types/error.ts:247`은 `''`로 적는다. 잔여 목록이 포인터를 이으려면 어느 쪽인지 정해야 한다(`spikes/guard-cost/rejected-keys/REPORT.txt` §3).
- 보충: 없음
- 상태: 대체됨(→ FRAGMENT-053)
- 출처: `adr/0002-guard-fragment-model.md:200`(정본), `reviews/round-18-closing.md:2053-2057`
- 닫은 사람: 편집자 결정(4차 본문 미결, `adr/0002-guard-fragment-model.md:200`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-74)
- 라운드: 18
- 까닭: `adr/0002-guard-fragment-model.md:200`, `reviews/round-18-closing.md:2059-2062`

### FRAGMENT-041 열림: 조각의 controls에 둔 식 규칙이 나감 에지에서 발화하는 세부

- 결정:
  > 남은 것은 조각의 `controls`에 둔 식 규칙이 나감 에지에서 발화하는 세부다(원장 §6).
- 보충: 없음
- 상태: 대체됨(→ FRAGMENT-050)
- 출처: `adr/0002-guard-fragment-model.md:201#4`(정본), `reviews/round-18-closing.md:1421-1432`
- 닫은 사람: 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:107`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-51)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:107`, `reviews/round-18-closing.md:1434-1436`

### FRAGMENT-042 열림: controls.children의 대상별 식과 값 키 세부, 조각에서만 선언된 자식을 가리킬 수 있는가

- 결정:
  > 대상별 식과 값 키의 세부, 조각에서만 선언된 자식을 가리킬 수 있는가는 원장 §6의 설계 항목이며 ADR 0010과 함께 정한다.
- 보충: 없음
- 상태: 대체됨(→ CONTROLS-073)
- 출처: `adr/0002-guard-fragment-model.md:201#6`(정본), `reviews/round-18-closing.md:270-297`
- 닫은 사람: 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:110`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-12)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:110`, `reviews/round-18-closing.md:299-303`

### FRAGMENT-043 열림: Q1의 남은 세부 — 잠복 원본의 실제 파기 시점, 복원값 대 초기값, 공유 노드의 서로소 enum, 비활성 경로 쓰기, 로드 왕복

- 결정:
  > **남아 있는 원본을 언제 실제로 지우는가.**
  > 아래 후보(reset, 명시적 분기 변경, 제출 후)의 실제 파기 시점은 남는다. 꺼진 분기에 민감한 값이 남을 수 있다. 후보: reset, 사용자가 명시적으로 분기를 바꿀 때(JSON Forms는 확인 대화상자를 띄우고 새 분기의 기본값으로 교체한다), 제출 후.
  > - 다시 켜졌을 때 돌아오는 값은 꺼지기 전의 원본이다. 현재는 초기값과 복원값을 나눠 두고 `resetSubtree()`로만 초기값을 되살린다(`core/nodes/AbstractNode/DETAIL.md`) — "null로 버린 데이터는 되살아나지 않는다"는 #338의 규칙과 어떻게 맞출지.
  > - 같은 이름 + 같은 타입으로 노드를 공유하는 필드(ADR 0005)는 활성인 선언이 하나라도 있으면 방출된다. 선언한 조각들의 `enum`이 서로소이면 값이 새 조각의 선택지에 없을 수 있다(`reviews/round-1.md` R11-e).
  > - **비활성 경로에 쓰면 무슨 일이 일어나는가** — 거부, 원본에만 반영, 에러. 순차 쓰기와 배치 쓰기의 결과가 같아지려면 "원본에만 반영"이어야 한다.
  > 비활성화가 방출에서의 제외가 되면서 원본은 보존되지만, 아무것도 고치지 않고 저장했을 때 방출 값이 로드한 값과 같은지는 별개의 문제다(`reviews/round-1.md` §7-3).
- 보충: 없음
- 상태: 분할됨(→ VALUE-031, FRAGMENT-054)
- 출처: `open-questions.md:11-14`(정본; 11은 문장 #1, #3–#5), `open-questions.md:15#2`, `adr/0006-single-value-ownership.md:98#4`(VALUE-018의 정본, 잠복 원본의 파기 시점), `reviews/round-18-closing.md:1793-1820`
- 닫은 사람: 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:112`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-64)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:112`, `reviews/round-18-closing.md:1822-1826`

### FRAGMENT-044 열림: 표준 키워드 밖의 FE 전용 조건부 필드(Q4)

- 결정:
  > `&` 표현식으로 켜고 끄는, 스키마의 표준 부분이 모르는 필드를 선언하는 문법을 둘 것인가. 그런 필드의 값은 방출 값에 들어가지만 서버의 검증 대상이 아니다(`additionalProperties`가 열려 있을 때만 통과한다). G2(표현력)과 계약의 단순함 사이의 선택이다.
- 보충: 없음
- 상태: 대체됨(→ FRAGMENT-052)
- 출처: `open-questions.md:29`(정본), `reviews/round-18-closing.md:1861-1868`
- 닫은 사람: 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:112`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-66)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:112`, `reviews/round-18-closing.md:1870-1871`

### FRAGMENT-045 열림: contains와 prefixItems(Q13)

- 결정:
  > 3차안 A3은 object 호스트에 대해 쓰였다. 배열 아이템 호스트는 dirty 목록으로 비례한다고 확인됐으나(`reviews/round-3.md` T13) `contains`와 튜플은 미정의다.
- 보충: 없음
- 상태: 대체됨(→ FRAGMENT-051, NODE-052)
- 출처: `open-questions.md:84`(정본), `reviews/round-18-closing.md:1638-1684,1692-1698`
- 닫은 사람: 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:109`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-59)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:109`, `reviews/round-18-closing.md:1686-1690`

### FRAGMENT-046 default만으로 자기 게이트를 켜는 조각은 켜지지 않는다 — 원본은 상태, default 주입은 사건(06 §3.6)

- 결정:
  > **3.6 원본으로만 지탱되는 조각과 `default`로만 지탱되는 조각은 다르다.** 원본은 상태이고 `default` 주입은 사건이다. 그래서 7절의 실험(D-15)이 S2(최소 고정점 뒤, 선언 키가 원본에 있는 꺼진 조각을 검증기 가드로 한 번 켜 봄)를 채택하더라도, "`default`만으로 자기 가드를 켜는 조각"은 켜지지 않는다(4.16).
- 보충:
  > "`default`는 "조각이 꺼짐에서 켜짐으로 바뀐 직후"의 사건이므로 자기 조각을 켜는 원인이 될 수 없고, 자기 지지 `default`는 상태에서 오지 않아 P3가 배제한다." (`06-conclusions.md:236`)
  > "06의 일곱 가운데 3.1·3.3·3.5·3.6은 그대로다(전문은 06 §3)." (`07-conclusions.md:72`)
- 상태: 현행
- 출처: `06-conclusions.md:106#1-3`(정본), `06-conclusions.md:236`, `07-conclusions.md:72`
- 닫은 사람: 편집자 결정(8라운드, `06-conclusions.md:106` 3.6), 편집자 결정(7–8라운드 수렴 D-25, `06-conclusions.md:236`), 편집자 결정(9라운드, `07-conclusions.md:72` 3.6 그대로)
- 라운드: 9
- 까닭: `06-conclusions.md:236`

### FRAGMENT-047 `dependentSchemas`·`dependentRequired`·`dependencies`는 읽지 않는다 — 검증기로, `extras`, `if/then`으로 적기

- 결정:
  > 【추론】 폼은 `dependentSchemas`·`dependentRequired`·`dependencies`를 게이트·조각 모델로 옮기지 않고 읽지 않는다.
  > 【추론】 셋은 검증기에 그대로 간다.
  > 【추론】 그 안에만 선언된 프로퍼티는 노드가 되지 않고, 값이 오면 `extras`로 남는다.
  > 【추론】 조건부 필드를 보이려는 작성자는 `allOf: [{ "if": { "required": ["k"] }, "then": S }]`로 적는다(ADR 0010의 분기 관행).
  > 【추론】 두 철자 규칙(C5)에서 `dependencies`·`dependentSchemas` 쌍은 들지 않는다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:97-101`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-03)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:106-110`

### FRAGMENT-048 `controls.discriminator` — 정적 연언에서 판별 선언 모으기(`$ref`·게이트 없는 `allOf`), null 분기 제외, 분기 자체 게이트와 AND

- 결정:
  > 【추론】 분기에서 판별 키의 `const`·`enum`을 찾는 범위는 그 분기의 정적 연언이다.
  > 【추론】 곧 분기 본체, 게이트 없는 `allOf` 항목, 그리고 이것들이 `$ref`로 가리키는 대상이다(재귀, 18C-01의 순환 절단을 따름).
  > 【추론】 그 키 프로퍼티 스키마도 같은 정적 연언(자기 `$ref`, 게이트 없는 `allOf`)에서 모은다.
  > 【추론】 `if/then`, 게이트 가진 `allOf` 항목, 중첩 `oneOf`·`anyOf`는 보지 않는다.
  > 【추론】 한 분기에서 모은 `const`·`enum`은 정적 연언의 교차로 합친다.
  > 【추론】 교차가 공집합이면 정적 연언의 청사진 오류다.
  > 【추론】 끌어올림(O-1)도 이렇게 모은 선언을 쓴다.
  > 【추론】 null 분기(`isNullBranch`)는 노드의 nullable 플래그이므로 판별 대상 분기로 세지 않는다.
  > 【추론】 null 분기에 판별 키가 없는 것은 키 없음도 오류도 아니다.
  > 【추론】 분기가 자기 `controls.active`도 가지면 그 분기의 게이트는 `(변환식) && (분기 식)` 하나다(`08-design-a-to-z.md:178`).
  > 【추론】 판별 키가 없는 분기가 자기 `controls.active`를 가지면 그 식만이 게이트다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:130-140`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-05)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:142-146`

### FRAGMENT-049 전순서의 키워드 순위 — `oneOf` 분기 < `anyOf` 분기

- 결정:
  > 【추론】 키워드 순위를 본체 `properties` < `allOf` 항목 < `if/then/else` < `oneOf` 분기 < `anyOf` 분기로 가른다.
  > 【추론】 같은 호스트에서 `oneOf[i]`는 모든 `anyOf[j]`보다 앞이다.
  > 【추론】 주석 키의 나중 승, 같은 대상 규칙의 같은 층 동점, 공유 충돌의 '앞선 종류', 터미널 전략의 '나중 것', 호스트 바퀴의 평가 순서가 모두 이 순서를 쓴다.
  > 【추론】 JSON 키 순서는 여전히 쓰지 않는다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:238-241`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-10)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:243-245`
- 충돌:
  > `02-target-overview.md:124`의 "`if/then/else` < `oneOf`·`anyOf` 분기"는 18라운드 결정과 다르다: `oneOf` 분기와 `anyOf` 분기는 동순위가 아니다. 18라운드 결정이 이긴다(`reviews/round-18-closing.md:238`).
  > `03-mental-model.md:126`의 "`if/then/else` < `oneOf`·`anyOf` 분기"는 18라운드 결정과 다르다: `oneOf` 분기와 `anyOf` 분기는 동순위가 아니다. 18라운드 결정이 이긴다(`reviews/round-18-closing.md:238`).
  > `adr/0005-blueprint-analysis-and-node-sharing.md:94`의 "`if/then/else` < `oneOf`·`anyOf` 분기"는 18라운드 결정과 다르다: `oneOf` 분기와 `anyOf` 분기는 동순위가 아니다. 18라운드 결정이 이긴다(`reviews/round-18-closing.md:238`).

### FRAGMENT-050 조각 `controls`의 에지 규칙은 켜진 동안만 후보 — 나감은 에지가 아님(`unsetOnInactive`만), 새로 들인 노드는 거짓→참, 남은 공유 노드는 기준점만, 라운드 단위, `default`는 채움

- 결정:
  > 【추론】 조각의 `controls`에 둔 에지 규칙(`unsetValue`·`derived`·`resetInteraction`·`injectTo`)은 그 조각이 켜져 있는 동안만 후보다.
  > 【추론】 (1) 나감은 이 규칙들의 에지가 아니다.
  > 【추론】 조각이 꺼지는 정착에서 그 규칙은 평가하지도 발화하지도 않는다.
  > 【추론】 꺼짐이 값에 닿는 장치는 나감 정책 `unsetOnInactive` 하나다.
  > 【추론】 그 정책은 조각 층의 값으로, 직전 커밋의 값을 쓴다.
  > 【추론】 (2) 조각이 켜지는 정착에서 그 조각이 새로 들인 노드의 규칙 에지는 거짓→참이다(WRITE-029).
  > 【추론】 그래서 `unsetValue`·`resetInteraction`은 식이 참이면 발화하고, `derived`·`injectTo`는 발화한다.
  > 【추론】 형상에 남아 있던 공유 노드는 그 규칙의 기준점만 그 정착의 값으로 잡고 발화하지 않는다(CONTROLS-026, VALUE-025).
  > 【추론】 (3) 후보 여부는 그 라운드의 완성된 트리에서 조각이 켜져 있는지로 정한다.
  > 【추론】 앞 라운드에 적용된 파생 쓰기는 뒤 라운드에서 조각이 꺼져도 되돌리지 않는다.
  > 【추론】 철회는 채움만 한다.
  > 【추론】 (4) 조각의 `controls.default`는 에지 규칙이 아니라 채움이며, 노드가 생길 때만 쓴다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1421-1432`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-51)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1434-1436`

### FRAGMENT-051 `contains`(`minContains`·`maxContains`)는 폼이 읽지 않는다

- 결정:
  > ㄷ `contains`(`minContains`·`maxContains` 포함)는 폼이 읽지 않는다.
  > 이 키는 값의 유효성 문법이므로 검증기가 판정한다.
  > `if` 안의 `contains`는 `compileGuard`가 답하는 게이트일 뿐이다.
  > 그 비용은 BLUEPRINT-007의 "컬렉션을 훑는 게이트"로 벤치가 다룬다.
- 보충: 없음
- 상태: 현행(부정 결정)
- 출처: `reviews/round-18-closing.md:1658-1661`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-59)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1686-1690`

### FRAGMENT-052 FE 전용 조건부 필드는 표준 `properties` merge와 `controls.active`로 — 예약 층 선언 문법은 두지 않는다

- 결정:
  > 【추론】 예약 층에서 표준 부분이 모르는 필드를 선언하는 문법은 두지 않는다.
  > 【추론】 FE 전용 조건부 필드는 소비자가 단일 스키마에 표준 `properties`로 merge하고, 노드 게이트 `controls.active`로 켜고 끈다.
  > 【추론】 결과는 Q4가 그린 것과 같다.
  > 【추론】 켜진 동안 방출에 든다.
  > 【추론】 서버의 스키마에 없으면 서버 판정은 서버의 `additionalProperties`를 따른다.
  > 【추론】 여기에 더해 FE 검증기도 그 필드를 본다.
  > 【추론】 조건 표현력(G2)은 노드 게이트로 이미 채워진다.
  > 【추론】 merge 안내 문서(SCHEMA-018)에 이 쓰임을 예로 더한다.
- 보충: 없음
- 상태: 현행(부정 결정)
- 출처: `reviews/round-18-closing.md:1861-1868`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-66)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1870-1871`

### FRAGMENT-053 루트의 정규 `dataPath`는 `''` — core가 `'/'`를 별칭으로 받아 정규화, 잔여 목록은 정규화된 값에 이음, 플러그인 셋과 폴백 검증기는 PR-4에서 `''`

- 결정:
  > 【추론】 루트의 정규 `dataPath`는 `''`다(RFC 6901).
  > 【추론】 core는 검증 결과를 받아들이는 자리에서 `'/'`를 루트의 별칭으로 받아 `''`로 정규화한 뒤 `ValidationIssue.dataPath`에 담는다.
  > 【추론】 잔여 목록은 정규화된 값에 키를 이어 포인터를 만든다.
  > 【추론】 저장소의 ajv 플러그인 셋과 core의 폴백 검증기(`src/core/nodes/AbstractNode/utils/ValidationManager/utils/getFallbackValidator.ts:19`)는 PR-4(동기 `compileGuard`를 구현하는 그 PR)에서 함께 루트에 `''`를 내도록 고친다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2053-2056`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-74)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2059-2062`

### FRAGMENT-054 다시 켜진 값은 꺼지기 전의 원본, 초기값은 `reset`·`resetSubtree` — 공유 노드의 서로소 `enum`은 값이 남고 검증기가 기각

- 결정:
  > ㄴ 다시 켜진 노드의 값은 꺼지기 전의 원본이다(VALUE-025).
  > #338의 "null로 버린 데이터는 되살아나지 않는다"와 부딪히지 않는다.
  > `setValue(null)`은 키 없는 전체 교체라 자식 원본을 없음으로 만들고, 숨겨 둔 원본이 없기 때문이다(VALUE-015·WRITE-014).
  > 초기값을 되살리는 연산은 `FormHandle.reset`(커밋된 prop의 로드, WRITE-044)과 `resetSubtree`가 맡는다.
  > `resetSubtree`는 유지하며, 루트가 든 로드 스냅숏에서 그 경로의 값을 서브트리에 로드한다(18C-44).
  > ㄷ 공유 노드의 서로소 `enum`에서 값은 그대로 남는다.
  > 새 조각이 켜져도 공유 노드는 새로 생기지 않으므로 다시 채우지 않는다.
  > 검증기가 기각하고, 폼은 막지 않는다.
  > 비우고 싶은 작성자는 조각 범위 `controls.unsetValue`(18C-60)를 쓰거나 이름을 가른다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1804-1812`(정본), `reviews/round-18-closing.md:2885`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-64), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-103)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1822-1826`, `reviews/round-18-closing.md:2891-2893`
- 충돌:
  > `reviews/round-18-closing.md:1806`의 "(VALUE-015·WRITE-014)"는 18라운드 결정과 다르다: 그 가리킴은 VALUE-036과 WRITE-092다(WRITE-097). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:2885`).

### FRAGMENT-055 판별 키가 `union`이어도 분기 규칙은 그대로 — 목록·nullable 밖 리터럴의 분기는 개발 모드 경고 (가칭) `DISCRIMINATOR_BRANCH_UNREACHABLE`

- 결정:
  > 【추론】 판별 키가 union이어도 FRAGMENT-007의 분기 규칙은 그대로다(BLUEPRINT-017).
  > 【추론】 분기의 `const`·`enum` 리터럴의 JSON 종류가 판별 키의 목록(`schemaType`, 원소 하나인 경우 포함)과 nullable 어디에도 없으면, 청사진이 개발 모드 경고 `(가칭) SCHEMA_FORM_WARNING.DISCRIMINATOR_BRANCH_UNREACHABLE`을 낸다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2548-2549`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-91)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2556-2564`
