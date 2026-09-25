# 단일 원장 — JSON Schema 층의 키, FE 오버레이, 유효 스키마 병합표

기준 커밋: `ba398c330`(저장소 `packages/canard/schema-form/architecture`). 이 원장이 인용하는 `path:line`은 모두 이 커밋의 줄 번호다. 정본 우선순위는 `ledger/README.md` §1을 따른다. 폼이 읽는 JSON Schema 키와 읽지 않는 키는 `08-design-a-to-z.md` §3.1이 정본이다. 유효 스키마 병합표는 `03-mental-model.md` §4의 병합표가 정본이며(03이 08과 다르면 03이 이긴다) `08-design-a-to-z.md` §9는 출처와 보충으로 적는다. FE 오버레이는 채택된 `adr/0012-fe-overlay.md`가 정본이다. `05-before-after.md`·`07-conclusions.md`는 그때의 기록이라 뒤 문서가 바꾼 규칙은 "대체됨"으로 남긴다. 상태 값의 뜻: **현행**은 지금 유효한 규칙, **대체됨**은 한때 유효했으나 뒤 라운드가 바꾼 규칙(옛 문장을 원문 그대로 남긴다), **열림**은 18라운드 안건으로 넘어가 아직 정해지지 않은 것이다. **분할됨**은 정본 문장에 상태가 다른 규칙이 섞여 나뉜 부모 항목이고, **중복**은 같은 규칙을 더 높은 정본을 가진 다른 영역의 항목이 가진 것이다(결정 원문은 남긴다).

## 색인

| 번호 | 한 줄 요약 | 상태 | 닫은 사람 |
| --- | --- | --- | --- |
| SCHEMA-001 | 폼이 읽는 JSON Schema 키 — 노드의 종류, 자식의 존재, 조각 | 현행 | 소유자 답(`reviews/round-5-derivations.md:7` P1'), 소유자 답(`reviews/round-9-spec.md:21` 축3), 소유자 답(`reviews/round-10-owner-answers.md:9` A-3), 소유자 답(`reviews/round-2.md:112` C5; 두 철자) |
| SCHEMA-002 | 표준 `default` — 노드가 생길 때 채움의 원천, `controls.default` 다음 | 현행 | 소유자 답(`reviews/round-9-spec.md:52` 읽기2 채우기 원천), 소유자 답(`reviews/round-10-owner-answers.md:7` A-1) |
| SCHEMA-003 | 표준 `readOnly` — 그 노드의 잠금 | 현행 | 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙) |
| SCHEMA-004 | `$ref`·`$defs`·`definitions` — 참조를 따라 형상을 만들고 재귀는 지연 해석 | 현행 | 편집자 결정(11라운드 실측, `08-design-a-to-z.md:86`), 소유자 답(`reviews/round-2.md:112` C5; `$defs`·`definitions` 두 철자) |
| SCHEMA-005 | 주석 키워드 — 유효 스키마에 병합해 렌더 계층에 건넨다 | 현행 | 소유자 답(`reviews/round-9-spec.md:23` 축5), 소유자 답(`reviews/round-10-owner-answers.md:20` D-7) |
| SCHEMA-006 | 폼이 읽지 않는 키 — 값의 유효성 문법은 검증기에 그대로 간다 | 현행 | 원리(`reviews/round-5-derivations.md:28-34` D-3), 소유자 답(`reviews/round-9-spec.md:19` 축1), 소유자 답(`reviews/round-10-owner-answers.md:11` B-22; `const`·`enum` 판별의 예외 허용), 소유자 답(`reviews/round-12-owner-answers.md:9` 2 `&discriminator`; `controls.discriminator` 아래의 예외) |
| SCHEMA-007 | 유효 스키마의 정의 — 켜진 조각을 전순서로 합친 것, 렌더 계층의 힌트, 덧씌움 집합마다 메모 | 현행 | 소유자 답(`reviews/round-9-spec.md:23` 축5), 편집자 결정(10라운드, `07-conclusions.md:143` 전순서 정의) |
| SCHEMA-008 | 병합표 — 검증 키워드는 연언 문맥에서 교차, 게이트 없는 분기는 존재만 | 현행 | 원리(`07-conclusions.md:82` 3.9 5항의 읽기, 유효성 키워드의 교차는 도출), 소유자 답(`reviews/round-9-spec.md:23` 축5), 편집자 결정(ADR 0005 §3, `adr/0005-blueprint-analysis-and-node-sharing.md:76`; 정적 연언의 공집합은 청사진 오류) |
| SCHEMA-009 | 병합표 — 주석 키워드는 뒤가 앞을 덮는다 | 현행 | 소유자 답(`reviews/round-10-owner-answers.md:20` D-7), 소유자 답(`reviews/round-10-owner-answers.md:22` D-17), 소유자 답(`reviews/round-10-owner-answers.md:26` E-16) |
| SCHEMA-010 | 병합표 — 상태 키는 그 노드에만, 로컬 선언이 겹치면 잠금 OR·표시 AND | 현행 | 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙), 소유자 답(`reviews/round-12-owner-answers.md:7` 1 Form 속성 `false`), 소유자 답(`reviews/round-13-owner-answers.md:16` Form 속성의 자리), 편집자 결정(13라운드, `07-conclusions.md:158`; 로컬 선언끼리 잠금 OR·표시 AND) |
| SCHEMA-011 | 병합표 — `options`·`presentation`은 그룹 단위 깊은 병합, 원자·배열·`undefined`의 규칙 | 분할됨(→ SCHEMA-039, NODE-029) | 소유자 답(`reviews/round-10-owner-answers.md:27` E-18), 소유자 답(`reviews/round-12-owner-answers.md:24` §9 `&options`), 소유자 답(`reviews/round-14-owner-answers.md:17` O-11), 17라운드 스웜 수렴(편집자 결정, `08-design-a-to-z.md:327`) |
| SCHEMA-012 | 병합표 — 값·동작 키는 병합하지 않는다 | 현행 | 편집자 결정(10라운드, `07-conclusions.md:180`), 소유자 답(`reviews/round-13-owner-answers.md:10` 4 규칙 충돌 순위) |
| SCHEMA-013 | 병합표 — 선언·정책 키는 병합하지 않는다(층별 효력, `watch` 합집합, `discriminator`는 하나) | 현행 | 소유자 답(`reviews/round-14-owner-answers.md:7` O-1), 편집자 결정(15라운드 게이트 뒤, `reviews/round-15-decisions.md:75`), 17라운드 스웜 수렴(편집자 결정, `03-mental-model.md:135`) |
| SCHEMA-014 | 게이트 없는 분기의 선언 — 공유 노드에서는 유일한 선언일 때만, 분기 안 `then`은 교차하지 않음 | 현행 | 편집자 결정(12라운드, `reviews/round-12-derivation.md:21`; 소유자의 물음 `reviews/round-12-owner-answers.md:22`에 대화로 답함), 편집자 결정(10라운드, `07-conclusions.md:178`; 유일한 선언일 때만) |
| SCHEMA-015 | FE가 서버 스키마에 얹는 키는 그룹 객체 셋 안에만 — 셋 다 검증기 앞에서 지운다 | 현행 | 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-15-decisions.md:13` 5) |
| SCHEMA-016 | Form은 단일 `jsonSchema`를 받는다 — FE 오버레이의 별도 입구를 두지 않음 | 현행 | 소유자 답(`reviews/round-2.md:113` C1), 소유자 답(`00-goals.md:104` C1) |
| SCHEMA-017 | `overlay` prop을 철회한 이유 — 주겠다던 세 이점이 성립하지 않음 | 현행(부정 결정) | 소유자 답(`reviews/round-2.md:113` C1), 소유자 답(`00-goals.md:104` C1) |
| SCHEMA-018 | ADR 0012의 결과 — C1은 새 장치 없이 충족, merge 방법의 문서, 판정 동일, `$ref` 정의의 merge | 현행 | 소유자 답(`reviews/round-2.md:113` C1), 소유자 답(`00-goals.md:111` C8), 편집자 결정(2라운드 ADR 0012 3판, `adr/0012-fe-overlay.md:31-32`; 판정 동일과 `$ref` 정의의 merge) |
| SCHEMA-019 | 대체 가능성 — JSON Schema 층의 표현은 예약 층으로 옮길 수 있어야 한다 | 중복(→ CONTROLS-014, CONTROLS-017) | 소유자 답(`reviews/round-9-spec.md:25` 축7), 소유자 답(`reviews/round-15-decisions.md:13` 5) |
| SCHEMA-020 | 열림: merge를 돕는 순수 함수(위치 불일치를 경고하는 helper)를 패키지가 제공할지 | 열림(→ `reviews/round-18-agenda.md:142` 11-11) | 편집자 결정(ADR 0012 3판 미결, `adr/0012-fe-overlay.md:37`) |
| SCHEMA-021 | 대체됨: FE가 고칠 수 없는 BE 스키마에서 판별식을 찾지 못할 때의 대응(ADR 0012 남는 것) | 대체됨(→ FRAGMENT-006) | 소유자 답(`reviews/round-12-owner-answers.md:9` 2 `&discriminator`) |
| SCHEMA-022 | 대체됨: 표현 키는 접두 없이 쓴다(07 §4.27, 13라운드 답 3) | 대체됨(→ SCHEMA-015) | 소유자 답(`reviews/round-15-decisions.md:12` 4) |
| SCHEMA-023 | 대체됨: `options`의 배열은 `merge`에 배열 전략 옵션을 더해 사본에 적용(07 §4.27) | 대체됨(→ SCHEMA-039) | 17라운드 스웜 수렴(편집자 결정, `08-design-a-to-z.md:327`) |
| SCHEMA-024 | 대체됨: 07 §4.27 병합표의 주석 키워드 행(본체와 게이트 없는 `allOf` 사이는 먼저-승 등 [정책] 표기) | 대체됨(→ SCHEMA-009, SCHEMA-014) | 소유자 답(`reviews/round-10-owner-answers.md:20` D-7), 소유자 답(`reviews/round-10-owner-answers.md:22` D-17), 소유자 답(`reviews/round-10-owner-answers.md:26` E-16) |
| SCHEMA-025 | 대체됨: 07 §4.27 병합표의 표현 키 행(`FormTypeInput`, `options`, 접두 없음, 나중-승) | 대체됨(→ SCHEMA-039, SCHEMA-015) | 소유자 답(`reviews/round-10-owner-answers.md:27` E-18), 소유자 답(`reviews/round-15-decisions.md:12` 4) |
| SCHEMA-026 | 대체됨: 5차의 union 판별 설계 — 판별식 식별, 값 가드·선택 가드, 초기 선택, `const`·`enum` 판별, null 분기, `&if` | 대체됨(→ FRAGMENT-005, FRAGMENT-006, FRAGMENT-008, FRAGMENT-010, SCHEMA-006, CONTROLS-049) | 소유자 답(`reviews/round-10-owner-answers.md:9` A-3), 소유자 답(`reviews/round-10-owner-answers.md:11` B-22), 소유자 답(`reviews/round-12-owner-answers.md:9` 2 `&discriminator`), 편집자 결정(10라운드, `07-conclusions.md:142`) |
| SCHEMA-027 | 대체됨: 같은 union의 분기는 둘 이상 활성이 될 수 없다(5차 `anyOf` 다중 활성) | 대체됨(→ FRAGMENT-012) | 소유자 답(`reviews/round-10-owner-answers.md:17` C-20) |
| SCHEMA-028 | 대체됨: `default`는 로드 계약이며 core의 유일한 자동 쓰기(5차) | 대체됨(→ SCHEMA-002, VALUE-007) | 소유자 답(`reviews/round-9-spec.md:56` 읽기2 시점(A/B)), 소유자 답(`reviews/round-10-owner-answers.md:7` A-1) |
| SCHEMA-029 | 대체됨: `options.trim`은 제거하고 입력 컴포넌트로(5차) | 대체됨(→ NODE-007) | 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3) |
| SCHEMA-030 | 열림: `$ref` 재귀에서 조각의 정적 열거가 끝나는 규칙 | 중복(→ BLUEPRINT-024) | 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:3`) |
| SCHEMA-031 | 열림: 값 union과 다중 `type` 슬롯 | 중복(→ BLUEPRINT-023) | 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:3`) |
| SCHEMA-032 | 열림: `patternProperties`와 스키마 값 `additionalProperties`(동적 키의 노드화 여부) | 열림(→ `reviews/round-18-agenda.md` §1, :16) | 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:3`) |
| SCHEMA-033 | 열림: 노드의 `required` 표시가 켜진 `then`을 반영하는 규칙 | 열림(→ `reviews/round-18-agenda.md` §1, :18) | 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:3`) |
| SCHEMA-034 | 열림: 같은 가상 이름을 다른 `fields`로 적은 `options.virtual` 항목 | 열림(→ `reviews/round-18-agenda.md` §1, :19) | 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:3`) |
| SCHEMA-035 | 열림: 옮길 잎 교차 함수(`intersectConst`·`intersectPattern`)의 뜻 | 열림(→ `reviews/round-18-agenda.md` §1, :21) | 편집자 결정(18라운드 안건, 외부 점검 반영 `reviews/round-18-agenda.md:7`) |
| SCHEMA-036 | 열림: 같은 호스트의 `oneOf`와 `anyOf` 분기의 동순위 | 열림(→ `reviews/round-18-agenda.md` §1, :23) | 편집자 결정(18라운드 안건, 외부 점검 반영 `reviews/round-18-agenda.md:7`) |
| SCHEMA-037 | 열림: 게이트 없는 분기의 선언이 터미널 전략과 `options` 병합에 드는가 | 열림(→ `reviews/round-18-agenda.md` §1, :24) | 편집자 결정(18라운드 안건, 외부 점검 반영 `reviews/round-18-agenda.md:7`) |
| SCHEMA-038 | 열림: 켜진 조각과의 런타임 교차가 공집합일 때 공개 `node.jsonSchema`가 싣는 것 | 열림(→ `reviews/round-18-agenda.md` §1, :26) | 편집자 결정(18라운드 안건, 외부 점검 반영 `reviews/round-18-agenda.md:7`) |
| SCHEMA-039 | 병합표 — `options`·`presentation`은 그룹 단위 깊은 병합(터미널 전략 문장이 없는 08 §9 행) | 현행 | 소유자 답(`reviews/round-10-owner-answers.md:27` E-18), 소유자 답(`reviews/round-12-owner-answers.md:24` §9 `&options`), 소유자 답(`reviews/round-14-owner-answers.md:17` O-11), 17라운드 스웜 수렴(편집자 결정, `08-design-a-to-z.md:327`) |

## 항목

### SCHEMA-001 폼이 읽는 JSON Schema 키 — 노드의 종류, 자식의 존재, 조각

- 결정:
  > | 폼이 읽는 것 | 어떻게 쓰는가 |
  > | --- | --- |
  > | `type`, 튜플(다중 `type`은 §15의 설계 항목) | 노드의 종류 |
  > | `properties`, `items`, `prefixItems`(옛 철자 `items: [...]`도 읽는다) | 자식의 존재 |
  > | `if/then/else`, `allOf` 항목, `oneOf`·`anyOf`의 분기 | 조각(§6) |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:79-83`(정본), `02-target-overview.md:53`, `03-mental-model.md:52`, `05-before-after.md:15,223`
- 닫은 사람: 소유자 답(`reviews/round-5-derivations.md:7` P1'), 소유자 답(`reviews/round-9-spec.md:21` 축3), 소유자 답(`reviews/round-10-owner-answers.md:9` A-3), 소유자 답(`reviews/round-2.md:112` C5; 두 철자)
- 라운드: 10
- 까닭: `reviews/round-5-derivations.md:7`

### SCHEMA-002 표준 `default` — 노드가 생길 때 채움의 원천, `controls.default` 다음

- 결정:
  > | `default` | 노드가 생길 때 채움의 원천(`controls.default` 다음) |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:84`(정본), `02-target-overview.md:53`, `03-mental-model.md:52`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:52` 읽기2 채우기 원천), 소유자 답(`reviews/round-10-owner-answers.md:7` A-1)
- 라운드: 10
- 까닭: `reviews/round-9-spec.md:52`

### SCHEMA-003 표준 `readOnly` — 그 노드의 잠금

- 결정:
  > | `readOnly` | 그 노드의 잠금 |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:85`(정본), `02-target-overview.md:53`, `03-mental-model.md:52`
- 닫은 사람: 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙)
- 라운드: 13
- 까닭: `reviews/round-13-owner-answers.md:7`

### SCHEMA-004 `$ref`·`$defs`·`definitions` — 참조를 따라 형상을 만들고 재귀는 지연 해석

- 결정:
  > | `$ref`, `$defs`·`definitions` | 참조를 따라 형상을 만든다. 재귀는 지연 해석으로 유한 트리(11라운드 실측) |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:86`(정본)
- 닫은 사람: 편집자 결정(11라운드 실측, `08-design-a-to-z.md:86`), 소유자 답(`reviews/round-2.md:112` C5; `$defs`·`definitions` 두 철자)
- 라운드: 11
- 까닭: `08-design-a-to-z.md:86`

### SCHEMA-005 주석 키워드 — 유효 스키마에 병합해 렌더 계층에 건넨다

- 결정:
  > | 주석 키워드(`title`, `description`, `format`, `examples`, `$comment`, `writeOnly`) | 유효 스키마에 병합해 렌더 계층에 건넨다 |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:87`(정본), `03-mental-model.md:131,136`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:23` 축5), 소유자 답(`reviews/round-10-owner-answers.md:20` D-7)
- 라운드: 10
- 까닭: `reviews/round-9-spec.md:23`
- 충돌:
  > `03-mental-model.md:52`의 "폼은 형상(`type`, `properties`, `items`·`prefixItems`, `if/then/else`, `allOf`, `oneOf`·`anyOf`의 분기)과 표준 `readOnly`(잠금으로 읽는다)만 읽는다"는 글자로는 정본과 다르다. 이 문장의 '만'은 폼이 형상과 잠금을 정하려고 해석하는 키의 목록이다. 같은 줄이 표준 `default`를 채움의 원천으로 읽고, 03 §4의 병합표(`03-mental-model.md:131,136`)가 주석 키워드를 유효 스키마에 병합한다. 그래서 03과 08은 같은 규칙이고 README §1의 3을 적용할 어긋남이 없다. 정본은 `08-design-a-to-z.md:87`이다.

### SCHEMA-006 폼이 읽지 않는 키 — 값의 유효성 문법은 검증기에 그대로 간다

- 결정:
  > 읽지 않는 것: `required`, `false`, `not`, `additionalProperties`, `patternProperties`, `dependentSchemas`(슬라이스 1 전 설계 항목), 범위·패턴·`enum`·`const`(`controls.discriminator` 아래만 예외). 이것들은 검증기에 그대로 간다.
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:89`(정본), `02-target-overview.md:53`, `03-mental-model.md:52`, `05-before-after.md:27,222,228`
- 닫은 사람: 원리(`reviews/round-5-derivations.md:28-34` D-3), 소유자 답(`reviews/round-9-spec.md:19` 축1), 소유자 답(`reviews/round-10-owner-answers.md:11` B-22; `const`·`enum` 판별의 예외 허용), 소유자 답(`reviews/round-12-owner-answers.md:9` 2 `&discriminator`; `controls.discriminator` 아래의 예외)
- 라운드: 12
- 까닭: `reviews/round-5-derivations.md:28-34`

### SCHEMA-007 유효 스키마의 정의 — 켜진 조각을 전순서로 합친 것, 렌더 계층의 힌트, 덧씌움 집합마다 메모

- 결정:
  > **병합표(축 5항(노드의 제약을 최신화해 제공한다)).** 노드의 유효 스키마는 켜진 조각을 전순서(호스트에서 조각까지의 경로를 (키워드 순위, 배열 인덱스) 쌍의 열로 보고 사전식으로 비교한 것. 키워드 순위는 본체 `properties` < `allOf` 항목 < `if/then/else` < `oneOf`·`anyOf` 분기. JSON 키 순서에 기대지 않는다)로 합친 것이다.
- 보충:
  > "렌더 계층이 읽는 힌트이며 검증기에는 가지 않는다." (`08-design-a-to-z.md:320`)
  > "**메모.** 유효 스키마는 활성 덧씌움 집합(그 노드에 얹힌 켜진 조각들의 집합)마다 메모한다. 같은 집합이면 같은 참조를 돌려준다." (`adr/0005-blueprint-analysis-and-node-sharing.md:109`)
- 상태: 현행
- 출처: `03-mental-model.md:126`(정본), `08-design-a-to-z.md:320`, `07-conclusions.md:185`, `adr/0005-blueprint-analysis-and-node-sharing.md:109`, `adr/0005-blueprint-analysis-and-node-sharing.md:94`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:23` 축5), 편집자 결정(10라운드, `07-conclusions.md:143` 전순서 정의)
- 라운드: 10
- 까닭: `reviews/round-9-spec.md:23`

### SCHEMA-008 병합표 — 검증 키워드는 연언 문맥에서 교차, 게이트 없는 분기는 존재만

- 결정:
  > | 부류 | 규칙 |
  > | --- | --- |
  > | 검증 키워드(`minimum`, `enum`, `required` …) | 연언 문맥에서 교차. 게이트 없는 `oneOf`·`anyOf` 분기는 존재만 더하고 제약은 교차하지 않는다 |
- 보충:
  > "| 검증 키워드(`minimum`, `enum`, `required` …) | 연언 문맥에서 교차한다. 게이트 없는 `oneOf`·`anyOf` 분기는 존재만 더하고 제약은 교차하지 않는다. 정적 연언(본체와 게이트 없는 `allOf`)의 교차가 공집합이면 청사진 오류(throw), 켜진 `then`과의 런타임 교차가 공집합이면 검증기가 값을 기각한다 |" (`08-design-a-to-z.md:324`)
  > "**왜 게이트 없는 분기의 제약을 교차하지 않는가.** 분기는 "또는" 문맥이다. 순수 분기 둘이 `kind`에 `const: 'a'`와 `const: 'b'`를 두면 교차는 공집합이 되어 검증기보다 좁은 힌트를 낸다. 게이트가 켜진 조각은 작성자가 "이 분기가 해당한다"고 선언한 것이므로 연언으로 적용한다." (`07-conclusions.md:183`)
- 상태: 현행
- 출처: `03-mental-model.md:128-130`(정본), `08-design-a-to-z.md:322-324`, `07-conclusions.md:175-177,183`, `adr/0005-blueprint-analysis-and-node-sharing.md:76`, `05-before-after.md:19,224`, `adr/0005-blueprint-analysis-and-node-sharing.md:96-98,111`, `02-target-overview.md:129-131`
- 닫은 사람: 원리(`07-conclusions.md:82` 3.9 5항의 읽기, 유효성 키워드의 교차는 도출), 소유자 답(`reviews/round-9-spec.md:23` 축5), 편집자 결정(ADR 0005 §3, `adr/0005-blueprint-analysis-and-node-sharing.md:76`; 정적 연언의 공집합은 청사진 오류)
- 라운드: 10
- 까닭: `07-conclusions.md:82`, `07-conclusions.md:183`

### SCHEMA-009 병합표 — 주석 키워드는 뒤가 앞을 덮는다

- 결정:
  > | 부류 | 규칙 |
  > | --- | --- |
  > | 주석 키워드(`title`, `description`, `format`, `default`·`controls.default`) | 뒤가 앞을 덮는다. 켜진 조각이 본체를, 전순서에서 나중 조각이 앞 조각을 덮는다(소유자: "세부 규칙이 포괄 규칙을 덮는 관례") |
  > | `writeOnly`, `$comment`, `examples` | 주석 키워드와 같다(뒤가 앞을 덮는다) |
- 보충:
  > "**`default`의 겹침은 생성 순간에만 생긴다.** 4.22 아래에서 `default`는 생성 때만 읽힌다. `{kind:'a'}`를 로드하면 켜진 `then`의 `default`가 들어가고, 런타임에 `then`이 켜지면 본체 노드가 다시 생기지 않으므로 채우지 않는다(실행)." (`07-conclusions.md:184`)
- 상태: 현행
- 출처: `03-mental-model.md:128-129,131,136`(정본), `08-design-a-to-z.md:325`, `07-conclusions.md:170`, `adr/0005-blueprint-analysis-and-node-sharing.md:99,104,107`, `02-target-overview.md:132`
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:20` D-7), 소유자 답(`reviews/round-10-owner-answers.md:22` D-17), 소유자 답(`reviews/round-10-owner-answers.md:26` E-16)
- 라운드: 10
- 까닭: `reviews/round-10-owner-answers.md:20`

### SCHEMA-010 병합표 — 상태 키는 그 노드에만, 로컬 선언이 겹치면 잠금 OR·표시 AND

- 결정:
  > | 부류 | 규칙 |
  > | --- | --- |
  > | 상태 키(표준 `readOnly`, `controls.readOnly`·`controls.disabled`·`controls.visible`·`controls.active`) | 코어에는 글로벌이 없다(소유자 13라운드). 표준 `readOnly`·`controls`의 식은 그 노드에만 걸린다. 터미널이 아닌 객체 노드의 잠금은 입력이 없으므로 효과가 없고(표준 `readOnly`는 청사진 경고, 표준 독자의 기대와 다르므로 ADR 0010에 적는다), 배열 노드의 잠금은 렌더 계층이 아이템 추가·삭제·이동 입력에 적용하며, 터미널 객체·배열은 입력이 있으므로 리프와 같다. `active`·`visible`은 구조상 하위 트리를 가린다. 자손을 거는 길은 부모의 `controls.children`(명시한 대상)과 켜진 조각의 `controls`뿐이다. 로컬 선언이 겹치면 잠금은 하나라도 참이면 잠기고 표시는 모두 참이어야 켜진다. Form 속성 `readOnly`·`disabled`는 렌더 계층이 참일 때만 거는 전체 잠금이며 코어의 상태가 아니다(P5, 12라운드 답 1) |
- 보충:
  > "로컬 층 안에서 상태 키가 여럿 겹칠 때(표준 `readOnly`, `controls.readOnly`, 켜진 조각의 범위 제어, 부모의 `controls.children` 항목)는 선언은 합집합·제한은 교집합의 원리대로 잠금(`readOnly`·`disabled`)은 하나라도 참이면 잠기고 표시(`active`·`visible`)는 모두 참이어야 켜진다. 코어에 글로벌은 없고, Form 속성의 전체 잠금은 렌더 계층이 그 결과 위에 OR한다(소유자 13라운드)." (`03-mental-model.md:138`)
- 상태: 현행
- 출처: `03-mental-model.md:128-129,132`(정본), `08-design-a-to-z.md:326`, `07-conclusions.md:170,179`, `adr/0005-blueprint-analysis-and-node-sharing.md:100`, `02-target-overview.md:133`
- 닫은 사람: 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙), 소유자 답(`reviews/round-12-owner-answers.md:7` 1 Form 속성 `false`), 소유자 답(`reviews/round-13-owner-answers.md:16` Form 속성의 자리), 편집자 결정(13라운드, `07-conclusions.md:158`; 로컬 선언끼리 잠금 OR·표시 AND)
- 라운드: 13
- 까닭: `reviews/round-13-owner-answers.md:7`, `07-conclusions.md:158`

### SCHEMA-011 병합표 — `options`·`presentation`은 그룹 단위 깊은 병합, 원자·배열·`undefined`의 규칙

- 결정:
  > | 부류 | 규칙 |
  > | --- | --- |
  > | `options`·`presentation`의 키(그룹 단위) | 뒤가 앞을 덮되 그룹 객체(`options`, `presentation`)는 깊은 병합이다. 작성자 스키마와 앞 조각의 객체를 변이하지 않으며, 재귀는 두 선언이 같은 키에 모두 원자가 아닌 plain object를 줄 때만 새 객체를 만들어 하고 한쪽에만 있는 값은 객체라도 복사하지 않고 참조를 옮긴다. React 요소(`$$typeof`)와 ref 모양(자기 열거 키가 `current` 하나뿐인 객체)은 원자라 나중 승이다. 원자 판정 함수는 렌더 계층이 터미널 판정 함수와 함께 청사진에 넘기며 core는 React 요소의 표식을 모른다(P5). core만 쓰는 호스트가 넘기지 않으면 원자는 없다. 선언이 하나면 그 객체를 그대로 쓴다. 그 밖에 함수·원시값은 나중 승, 나중 조각의 `undefined`는 앞 값을 지우지 않는다. 배열은 나중 조각의 것으로 통째 교체한다(14라운드 답 O-11. `@winglet/common-utils`의 `merge`에 선택 인자(배열 교체, 원자 판정, 한쪽 값의 참조 이동. 양쪽에 있는 객체는 새 객체에 병합한다: 쓰기 시 복사)를 더해 쓴다). 노드의 터미널 전략은 활성 조각 집합에 따라 바뀌지 않으며 청사진이 그 노드의 모든 선언에서 정적으로 정한다. 노드가 형상에 있는 모든 경우(그 노드를 선언한 게이트 가진 선언이 켜지고 꺼지는 조합. 게이트 없는 선언은 늘 켜져 있다)마다 그 경우에 켜진 선언들로 `options.terminal`(병합표대로 전순서에서 나중 것) → 렌더 계층 판정(없음이 아닌 결과 가운데 전순서에서 나중 것) → `type`의 순서로 전략을 정하고, 경우마다 정한 전략이 서로 다르면 청사진 오류다(14라운드 O-1과 같은 모양). 그래서 게이트 없는 선언끼리 값이 달라도 나중이 이길 뿐 오류가 아니고(12라운드 §9 "병합 불가한 … 나중이 승"), 조각에만 선언된 노드는 그 조각이 모두 꺼진 경우 형상에 없으므로 그 경우를 비교하지 않으며, 게이트 없는 선언의 `options.terminal`이 전략을 정한 노드에 게이트 가진 조각이 인라인 입력을 더해도 전략이 바뀌지 않으므로 오류가 아니다. 검사는 청사진 시점에 노드마다 그 노드의 선언 수에 비례하는 한 번이다. `options.virtual`의 항목은 조각의 선언 규칙을 따른다(17라운드 스웜 수렴(편집자 결정), 08 §9) |
- 보충:
  > "| `options`·`presentation`의 키(그룹 단위) | 뒤가 앞을 덮되 그룹 객체(`options`, `presentation`)는 깊은 병합이다. 작성자 스키마를 변이하지 않으며, 재귀는 두 선언이 같은 키에 모두 원자가 아닌 plain object를 줄 때만 새 객체를 만들어 하고(쓰기 시 복사) 한쪽에만 있는 값은 객체라도 복사하지 않고 참조를 옮긴다. React 요소(`$$typeof`)와 ref 모양(자기 열거 키가 `current` 하나뿐인 객체)은 원자라 나중 승이다. 원자 판정 함수는 렌더 계층이 터미널 판정 함수와 함께 청사진에 넘기며 core는 React 요소의 표식을 모른다(P5). core만 쓰는 호스트가 넘기지 않으면 원자는 없다. 선언이 하나면 그 객체를 그대로 쓴다. 함수·원시값은 나중 승, 나중 조각의 `undefined`는 앞 값을 지우지 않는다. 배열은 나중 조각의 것으로 통째 교체한다(14라운드 확정. `@winglet/common-utils`의 `merge`에 선택 인자(배열 교체, 원자 판정, 한쪽 값의 참조 이동. 양쪽에 있는 객체는 새 객체에 병합한다: 쓰기 시 복사)를 더해 쓰며 인자가 없으면 오늘 동작이다. 14라운드 O-11 되물음의 답, 17라운드 스웜 수렴(편집자 결정)) |" (`08-design-a-to-z.md:327`)
  > "`options.virtual`의 항목은 가상 노드의 선언이라 병합표가 아니라 조각의 선언 규칙(조각이 선언한 노드는 그 조각과 함께 켜지고 꺼진다, ADR 0002·0005)을 따르며, 같은 가상 이름을 다른 `fields`로 적은 경우는 슬라이스 1 전 설계 항목이다." (`08-design-a-to-z.md:331`)
  > "`options.propertyKeys`·`omitEmpty`·`omitTrailing`은 유효 스키마에서 읽으므로 활성 조각 집합마다 달라도 된다(17라운드 스웜 수렴(편집자 결정))." (`08-design-a-to-z.md:331`)
- 상태: 분할됨(→ SCHEMA-039, NODE-029)
- 출처: `03-mental-model.md:128-129,133`(정본), `08-design-a-to-z.md:327,331`, `07-conclusions.md:170`, `adr/0005-blueprint-analysis-and-node-sharing.md:101,108`, `02-target-overview.md:134`
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:27` E-18), 소유자 답(`reviews/round-12-owner-answers.md:24` §9 `&options`), 소유자 답(`reviews/round-14-owner-answers.md:17` O-11), 17라운드 스웜 수렴(편집자 결정, `08-design-a-to-z.md:327`)
- 라운드: 17
- 까닭: `reviews/round-10-owner-answers.md:27`, `reviews/round-14-owner-answers.md:17`

### SCHEMA-012 병합표 — 값·동작 키는 병합하지 않는다

- 결정:
  > | 부류 | 규칙 |
  > | --- | --- |
  > | 값·동작 키(`controls.derived`, `controls.injectTo`, `controls.unsetValue`, `controls.resetInteraction`) | 병합하지 않는다. 선언마다 규칙 하나이며 같은 대상은 파생 단계의 같은 대상 규칙이 푼다 |
- 보충: 없음
- 상태: 현행
- 출처: `03-mental-model.md:128-129,134`(정본), `08-design-a-to-z.md:328`, `07-conclusions.md:180`, `adr/0005-blueprint-analysis-and-node-sharing.md:102`, `02-target-overview.md:135`
- 닫은 사람: 편집자 결정(10라운드, `07-conclusions.md:180`), 소유자 답(`reviews/round-13-owner-answers.md:10` 4 규칙 충돌 순위)
- 라운드: 13
- 까닭: `03-mental-model.md:124`

### SCHEMA-013 병합표 — 선언·정책 키는 병합하지 않는다(층별 효력, `watch` 합집합, `discriminator`는 하나)

- 결정:
  > | 부류 | 규칙 |
  > | --- | --- |
  > | 선언·정책 키(`controls.children`, `controls.discriminator`, `controls.watch`, `controls.unsetOnInactive`) | 병합하지 않는다. `children`과 `unsetOnInactive`는 각 선언이 속한 층에서 그 선언을 담은 조각이 켜져 있는 동안(나감에서는 직전 커밋 기준) 각각 효력을 가진다(나감 비움 규칙과 같은 대상 규칙이 층으로 푼다). `watch`는 의존이 모든 선언의 경로 합집합(청사진, 정적)이고 입력에 가는 `watchValues`는 유효 스키마의 것(켜진 선언 가운데 전순서에서 나중 것)이다. `discriminator`는 호스트에 하나이며 선언이 여럿이면 같은 값만 허용하고 다르면 청사진 오류(14라운드 O-1, 15라운드, 17라운드 스웜 수렴(편집자 결정)) |
- 보충: 없음
- 상태: 현행
- 출처: `03-mental-model.md:128-129,135`(정본), `08-design-a-to-z.md:329`, `adr/0005-blueprint-analysis-and-node-sharing.md:103`, `02-target-overview.md:136`, `reviews/round-15-decisions.md:75`
- 닫은 사람: 소유자 답(`reviews/round-14-owner-answers.md:7` O-1), 편집자 결정(15라운드 게이트 뒤, `reviews/round-15-decisions.md:75`), 17라운드 스웜 수렴(편집자 결정, `03-mental-model.md:135`)
- 라운드: 17
- 까닭: `reviews/round-14-owner-answers.md:7`

### SCHEMA-014 게이트 없는 분기의 선언 — 공유 노드에서는 유일한 선언일 때만, 분기 안 `then`은 교차하지 않음

- 결정:
  > 게이트 없는 `oneOf`·`anyOf` 분기는 존재만 더하므로, 그 분기가 공유 노드에 둔 주석·표현·상태 키는 그 노드의 유일한 선언일 때만 쓴다(모두 켜져 있으므로 "뒤가 앞을 덮는다"를 적용하면 값과 무관한 분기의 `title`이 보인다). 게이트 없는 분기 안의 `if/then`도 그 분기의 선언 문맥이므로 `then`의 제약을 본체와 교차하지 않는다. 교차하는 것은 게이트 가진 분기(또는 본체·`allOf`)의 켜진 `then`뿐이다.
- 보충: 없음
- 상태: 현행
- 출처: `03-mental-model.md:138#1-3`(정본), `08-design-a-to-z.md:331`, `adr/0005-blueprint-analysis-and-node-sharing.md:71`, `07-conclusions.md:178`, `reviews/round-12-owner-review.md:252`, `adr/0005-blueprint-analysis-and-node-sharing.md:106`
- 닫은 사람: 편집자 결정(12라운드, `reviews/round-12-derivation.md:21`; 소유자의 물음 `reviews/round-12-owner-answers.md:22`에 대화로 답함), 편집자 결정(10라운드, `07-conclusions.md:178`; 유일한 선언일 때만)
- 라운드: 12
- 까닭: `reviews/round-12-derivation.md:21`

### SCHEMA-015 FE가 서버 스키마에 얹는 키는 그룹 객체 셋 안에만 — 셋 다 검증기 앞에서 지운다

- 결정:
  > (2) FE가 서버 스키마에 얹는 키는 그룹 객체 셋 안에만 있다.
- 보충:
  > "셋 다 검증기 앞에서 지워진다(원장 §1.4, 15라운드. 13라운드 답 3의 경계와 14라운드 O-9의 닫힌 목록을 대체한다)." (`adr/0012-fe-overlay.md:3`)
- 상태: 현행
- 출처: `adr/0012-fe-overlay.md:3#4`(정본), `03-mental-model.md:53`, `02-target-overview.md:54,59`, `reviews/round-15-decisions.md:12`
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-15-decisions.md:13` 5)
- 라운드: 15
- 까닭: `reviews/round-15-decisions.md:12-13`

### SCHEMA-016 Form은 단일 `jsonSchema`를 받는다 — FE 오버레이의 별도 입구를 두지 않음

- 결정:
  > **Form은 단일 `jsonSchema`를 받는다.** FE의 표현 층을 얹는 일은 소비자가 스키마를 넘기기 전에 자기 방식으로 merge해서 한다. 직렬화할 수 없는 값(입력 컴포넌트)을 넣는 통로는 이미 있다 — `formTypeInputMap`(데이터 경로로 매칭)과 `formTypeInputDefinitions`.
  > 입구가 하나면 인라인 키와 오버레이 사이의 우선순위 규칙도 필요 없다. 하나의 개념에 하나의 장치다(G4).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0012-fe-overlay.md:18,26`(정본), `adr/0012-fe-overlay.md:5,14`, `00-goals.md:104`, `reviews/round-2.md:113`
- 닫은 사람: 소유자 답(`reviews/round-2.md:113` C1), 소유자 답(`00-goals.md:104` C1)
- 라운드: 2
- 까닭: `adr/0012-fe-overlay.md:14`, `adr/0012-fe-overlay.md:10`

### SCHEMA-017 `overlay` prop을 철회한 이유 — 주겠다던 세 이점이 성립하지 않음

- 결정:
  > `overlay` prop을 철회한 이유 — 그것이 주겠다던 이점이 성립하지 않았다:
  > 1. "검증기에 서버의 원본이 그대로 간다." strict 모드는 기본이 아니다(ADR 0001, 0003). 검증기는 미지 키워드를 무시하므로 제어 키가 섞인 merge본과 원본을 **같게 판정한다.** 기본 구성에서 이 이점은 0이다. strict 검증기를 쓰는 소비자에게는 키워드 위치만 지우는 제거 유틸리티가 있다(ADR 0003).
  > 2. "오버레이의 표준 키워드를 거부한다." merge하면서 `type`이나 `required`를 건드리는 것은 작성자의 책임이다. 스키마 선언의 책임을 작성자에게 두는 것이 이 재설계의 일관된 원칙이다(G3).
  > 3. "가리키는 위치가 스키마에 없으면 경고한다." 편의이고, Form의 두 번째 입구가 되어야 할 이유가 아니다.
- 보충: 없음
- 상태: 현행(부정 결정)
- 출처: `adr/0012-fe-overlay.md:20-24`(정본), `adr/0012-fe-overlay.md:5`
- 닫은 사람: 소유자 답(`reviews/round-2.md:113` C1), 소유자 답(`00-goals.md:104` C1)
- 라운드: 2
- 까닭: `adr/0012-fe-overlay.md:20`

### SCHEMA-018 ADR 0012의 결과 — C1은 새 장치 없이 충족, merge 방법의 문서, 판정 동일, `$ref` 정의의 merge

- 결정:
  > - C1은 새 장치 없이 충족된다. 필요한 것은 문서다 — "서버 스키마에 제어 키를 merge하는 방법, 컴포넌트를 `formTypeInputMap`으로 꽂는 방법"을 이행 문서와 배포 문서에 적는다(`00-goals.md` C8).
  > - merge본은 서버의 스키마와 바이트 단위로 같지는 않지만 판정은 같다(같은 설정의 검증기, ADR 0001).
  > - `$ref`로 재사용되는 정의에 merge한 설정은 그 정의가 쓰이는 모든 곳에 적용된다. 위치마다 다르게 주려면 `formTypeInputMap`처럼 데이터 경로로 매칭하는 기존 통로를 쓴다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0012-fe-overlay.md:30-32`(정본), `00-goals.md:104,111`
- 닫은 사람: 소유자 답(`reviews/round-2.md:113` C1), 소유자 답(`00-goals.md:111` C8), 편집자 결정(2라운드 ADR 0012 3판, `adr/0012-fe-overlay.md:31-32`; 판정 동일과 `$ref` 정의의 merge)
- 라운드: 2
- 까닭: `adr/0012-fe-overlay.md:30`

### SCHEMA-019 대체 가능성 — JSON Schema 층의 표현은 예약 층으로 옮길 수 있어야 한다

- 결정:
  > - **대체 가능성.** JSON Schema 층의 표현은 예약 층으로 옮길 수 있어야 한다(소유자의 축 7항(JSON Schema 표현은 `controls` 표현으로 대체할 수 있어야 한다)). `if/then/else`의 조각은 조각 객체의 `controls.active`로, `default`는 `controls.default`로, `readOnly`는 `controls.readOnly`로, 분기의 `const`·`enum`은 `controls.discriminator`로 옮긴다.
- 보충:
  > "표준 키워드와 `controls`의 키는 다른 층의 두 선언이다(`default`와 `controls.default`, `readOnly`와 `controls.readOnly`)." (`02-target-overview.md:56`)
- 상태: 중복(→ CONTROLS-014, CONTROLS-017)
- 출처: `02-target-overview.md:57`(정본), `02-target-overview.md:56#4`, `adr/0003-group-namespace.md:44,51`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:25` 축7), 소유자 답(`reviews/round-15-decisions.md:13` 5)
- 라운드: 15
- 까닭: `reviews/round-9-spec.md:25`

### SCHEMA-020 열림: merge를 돕는 순수 함수(위치 불일치를 경고하는 helper)를 패키지가 제공할지

- 결정:
  > - merge를 돕는 순수 함수(위치 불일치를 경고하는 helper)를 패키지가 제공할지. Form의 입구와는 무관한 편의다.
- 보충: 없음
- 상태: 열림(→ `reviews/round-18-agenda.md:142` 11-11)
- 출처: `adr/0012-fe-overlay.md:37`(정본)
- 닫은 사람: 편집자 결정(ADR 0012 3판 미결, `adr/0012-fe-overlay.md:37`)
- 라운드: 2
- 까닭: `adr/0012-fe-overlay.md:37`

### SCHEMA-021 대체됨: FE가 고칠 수 없는 BE 스키마에서 판별식을 찾지 못할 때의 대응(ADR 0012 남는 것)

- 결정:
  > - FE가 고칠 수 없는 BE 스키마에서 분석이 판별식을 찾지 못할 때의 대응(`reviews/round-1.md` §7-9). 소비자가 merge로 판별식을 직접 더하는 것은 **표준 키워드를 고치는 일**이어서 판정에 닿는다 — 그 책임은 작성자에게 있다. 판정에 닿지 않게 형상용 힌트만 주는 제어 키를 둘지는 ADR 0005 §4와 함께 본다.
- 보충:
  > ""판별식을 찾지 못할 때"의 처리는 없다 — 판별은 작성자가 `controls.discriminator`를 명시할 때만 하며, 명시 없는 union은 모든 분기가 켜진다(원장 §1.1 P1′)." (`adr/0012-fe-overlay.md:3`)
- 상태: 대체됨(→ FRAGMENT-006)
- 출처: `adr/0012-fe-overlay.md:36`(정본), `adr/0012-fe-overlay.md:3#3`
- 닫은 사람: 소유자 답(`reviews/round-12-owner-answers.md:9` 2 `&discriminator`)
- 라운드: 12
- 까닭: `adr/0012-fe-overlay.md:3`

### SCHEMA-022 대체됨: 표현 키는 접두 없이 쓴다(07 §4.27, 13라운드 답 3)

- 결정:
  > 표현 키는 접두 없이 쓴다(13라운드 답 3).
- 보충: 없음
- 상태: 대체됨(→ SCHEMA-015)
- 출처: `07-conclusions.md:170#5`(정본)
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:12` 4)
- 라운드: 15
- 까닭: `reviews/round-13-owner-answers.md:9`, `adr/0012-fe-overlay.md:3`

### SCHEMA-023 대체됨: `options`의 배열은 `merge`에 배열 전략 옵션을 더해 사본에 적용(07 §4.27)

- 결정:
  > 배열은 나중 조각의 것으로 통째 교체한다(14라운드 답 O-11. `merge`에 배열 전략 옵션을 더해 사본에 적용한다).
- 보충: 없음
- 상태: 대체됨(→ SCHEMA-039)
- 출처: `07-conclusions.md:170#7`(정본)
- 닫은 사람: 17라운드 스웜 수렴(편집자 결정, `08-design-a-to-z.md:327`)
- 라운드: 17
- 까닭: `08-design-a-to-z.md:327`

### SCHEMA-024 대체됨: 07 §4.27 병합표의 주석 키워드 행(본체와 게이트 없는 `allOf` 사이는 먼저-승 등 [정책] 표기)

- 결정:
  > | 부류 | 본체와 게이트 없는 `allOf` 항목 사이 | 켜진 게이트 조각 대 본체 | 켜진 게이트 조각끼리 | 게이트 없는 `oneOf`·`anyOf` 분기 |
  > | --- | --- | --- | --- | --- |
  > | 주석 키워드(`title`, `description`, `format`, `default`·`&default`) | 오늘은 먼저-승 [정책] | 켜진 조각이 이김 [정책, 5.3의 7이 권고] | 전순서 [정책] | 그 노드의 유일한 선언일 때만 [확신 중] |
- 보충: 없음
- 상태: 대체됨(→ SCHEMA-009, SCHEMA-014)
- 출처: `07-conclusions.md:175-176,178`(정본)
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:20` D-7), 소유자 답(`reviews/round-10-owner-answers.md:22` D-17), 소유자 답(`reviews/round-10-owner-answers.md:26` E-16)
- 라운드: 10
- 까닭: `07-conclusions.md:170`

### SCHEMA-025 대체됨: 07 §4.27 병합표의 표현 키 행(`FormTypeInput`, `options`, 접두 없음, 나중-승)

- 결정:
  > | 부류 | 본체와 게이트 없는 `allOf` 항목 사이 | 켜진 게이트 조각 대 본체 | 켜진 게이트 조각끼리 | 게이트 없는 `oneOf`·`anyOf` 분기 |
  > | --- | --- | --- | --- | --- |
  > | 표현 키(`FormTypeInput`, `options`, 접두 없음) | 오늘은 나중-승 [정책] | 켜진 조각이 이김 [정책, 5.3의 7과 같은 방향] | 전순서 [정책] | 유일한 선언일 때만 |
- 보충: 없음
- 상태: 대체됨(→ SCHEMA-039, SCHEMA-015)
- 출처: `07-conclusions.md:175-176,181`(정본)
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:27` E-18), 소유자 답(`reviews/round-15-decisions.md:12` 4)
- 라운드: 15
- 까닭: `07-conclusions.md:170`

### SCHEMA-026 대체됨: 5차의 union 판별 설계 — 판별식 식별, 값 가드·선택 가드, 초기 선택, `const`·`enum` 판별, null 분기, `&if`

- 결정:
  > | 문법 | 현재 | 새 설계 | 변화 | 근거 |
  > | ---- | ---- | ------- | ---- | ---- |
  > | `oneOf`/`anyOf`의 판별 | 분기의 `&if`/`computed.if`가 우선이고, 없으면 `properties`의 `const`/`enum` 조합. 매치하면 `oneOfIndex`/`anyOfIndices`를 계산한다 | 판별식 식별 5단계(E14) — `$ref`·`allOf` 평탄화 → null 분기 벗기기 → 모든 분기가 `const`/`enum`으로 제약하는 키를 후보로 → 서로소 검사 → `discriminator.propertyName` > `required` > 사전순. 가드는 `{properties:{k:제약}, required:['k']}` | 확대 + 기제 교체(소유자 확인 대기) | `getConditionIndexFactory.ts`, `getExpressionFromSchema.ts` / `adr/0005:75-86` |
  > | 판별식이 없는 union | `oneOfIndex = -1`이 기본값이다. 이후 분기 선택 동작은 조사 범위 밖(미확인) | **선택 가드** — 노드의 `selection` 칸이 분기를 고르고 사용자가 수동으로 고를 수 있다 | 신규 | `ComputedPropertiesManager.ts:106` / `adr/0002:38-40,141` |
  > | union의 초기 선택 | 미확인 | 분기 키가 하나도 없으면 분기 없음 → 값의 키를 가장 많이 선언한 통과 분기 → 동점이면 앞 분기 → 호스트 `required`가 비활성 조각의 키를 가리키면 가중 | 신규 + 미결 | `adr/0002:121-133`. 여분 키만 있는 값의 확장은 **미결(U-1)**, `required` 가중은 **미결(D-14)** |
  > | 빈 값과 판별 프로퍼티의 `default` | 무매치면 `oneOfIndex = -1`, 어느 분기도 켜지지 않는다 | 같다 — 암묵 `default` 없음, 빈 값은 분기 없음 | 유지 | `ComputedPropertiesManager.ts:106` / `adr/0002:118` (D-8 수락) |
  > | `const`/`enum` | 분기 판별식으로 읽는다 | 판별식 식별에 **값만** 읽고 만족 여부의 판정은 검증기가 한다 | 유지 | `getExpressionFromSchema.ts:44-48` / `adr/0005:90` |
  > | `null` 타입 분기 | `&if`나 `properties`가 있어도 무시하고 dev 경고를 낸다 | 판별식 식별 2단계에서 null 분기를 벗기되 **분기 자체는 유지**하고 nullable을 전달한다 | 확대 | `warnIfNullBranchIgnored.ts:15-30` / `adr/0005:78` |
  > | `&if`/`computed.if` | `boolean\|string`. `oneOf`/`anyOf` 원소에서만 뜻이 있고 분기 판별에 쓴다 | **제거.** 분기 선택은 값 가드와 선택 가드가 한다 | 제거 | `extractConditionInfo.ts:44-45` / `adr/0003:25`, `adr/0002:34-40` |
- 보충: 없음
- 상태: 대체됨(→ FRAGMENT-005, FRAGMENT-006, FRAGMENT-008, FRAGMENT-010, SCHEMA-006, CONTROLS-049)
- 출처: `05-before-after.md:13-14,20-23,28,31,39`(정본)
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:9` A-3), 소유자 답(`reviews/round-10-owner-answers.md:11` B-22), 소유자 답(`reviews/round-12-owner-answers.md:9` 2 `&discriminator`), 편집자 결정(10라운드, `07-conclusions.md:142`)
- 라운드: 12
- 까닭: `07-conclusions.md:142`

### SCHEMA-027 대체됨: 같은 union의 분기는 둘 이상 활성이 될 수 없다(5차 `anyOf` 다중 활성)

- 결정:
  > | 문법 | 현재 | 새 설계 | 변화 | 근거 |
  > | ---- | ---- | ------- | ---- | ---- |
  > | `anyOf`의 다중 활성 | `anyOfIndices`로 **둘 이상의 분기가 동시에 활성**이 된다 | 같은 union의 분기는 **둘 이상 활성이 될 수 없다** — 판별식 가드는 서로소이고 선택 가드는 하나만 고른다 | 축소 | `BranchStrategy.ts:424` / `adr/0002:17,54`. 6라운드 발견 29 **부분** — 축소는 명시됐으나 이주 충격 목록에 없었다 |
- 보충: 없음
- 상태: 대체됨(→ FRAGMENT-012)
- 출처: `05-before-after.md:13-14,24`(정본)
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:17` C-20)
- 라운드: 10
- 까닭: `reviews/round-10-owner-answers.md:17`

### SCHEMA-028 대체됨: `default`는 로드 계약이며 core의 유일한 자동 쓰기(5차)

- 결정:
  > | 문법 | 현재 | 새 설계 | 변화 | 근거 |
  > | ---- | ---- | ------- | ---- | ---- |
  > | `default` | `jsonSchema.default`가 없으면 **타입별 빈 값을 만들어** 채운다 | 로드 계약이다 — core의 유일한 자동 쓰기이고 **없음**인 키에만, 전체 교체 직후와 조각이 꺼짐 → 켜짐이 된 직후에만 들어간다 | 축소 | `getDefaultValue.ts:19-23`(호출 `AbstractNode.ts:1129,1198`, `BranchStrategy.ts:343`) / `03-mental-model.md:45`, `adr/0007:33`. 빈 값 생성이 사라진다는 문장 자체는 **미확인**이며 "폼은 값을 만들지 않는다"(`adr/0002:118`)에서의 도출이다 |
- 보충: 없음
- 상태: 대체됨(→ SCHEMA-002, VALUE-007)
- 출처: `05-before-after.md:13-14,29`(정본)
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:56` 읽기2 시점(A/B)), 소유자 답(`reviews/round-10-owner-answers.md:7` A-1)
- 라운드: 10
- 까닭: `reviews/round-9-spec.md:56`, `08-design-a-to-z.md:278`

### SCHEMA-029 대체됨: `options.trim`은 제거하고 입력 컴포넌트로(5차)

- 결정:
  > | 키워드 | 현재 | 새 설계 | 변화 | 근거 |
  > | ------ | ---- | ------- | ---- | ---- |
  > | `options.trim` | 문자열을 강제 변환한다 | **제거** → 입력 컴포넌트로 | 제거 | `types/jsonSchema.ts:139` / `adr/0013:77` |
- 보충: 없음
- 상태: 대체됨(→ NODE-007)
- 출처: `05-before-after.md:37-38,52`(정본)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:11`

### SCHEMA-030 열림: `$ref` 재귀에서 조각의 정적 열거가 끝나는 규칙

- 결정:
  > | `$ref` 재귀에서 조각의 정적 열거가 끝나는 규칙(오늘 `$ref` 해석 깊이의 기본값은 1) | `08-design-a-to-z.md:451`(§15), `adr/0005-blueprint-analysis-and-node-sharing.md:131` | PR-1 | 실행 확인 |
- 보충: 없음
- 상태: 중복(→ BLUEPRINT-024)
- 출처: `reviews/round-18-agenda.md:13`(정본), `05-before-after.md:30`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:3`)
- 라운드: 17
- 까닭: `reviews/round-18-agenda.md:13`

### SCHEMA-031 열림: 값 union과 다중 `type` 슬롯

- 결정:
  > | 값 union과 다중 `type` 슬롯(`type: ['string', 'number']`, 원시 타입끼리의 `anyOf`, `oneOf: [string, object]`) | `08-design-a-to-z.md:451`(§15), `adr/0005-blueprint-analysis-and-node-sharing.md:129` | PR-1 | 설계 결정 |
- 보충: 없음
- 상태: 중복(→ BLUEPRINT-023)
- 출처: `reviews/round-18-agenda.md:14`(정본), `08-design-a-to-z.md:81`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:3`)
- 라운드: 17
- 까닭: `reviews/round-18-agenda.md:14`

### SCHEMA-032 열림: `patternProperties`와 스키마 값 `additionalProperties`(동적 키의 노드화 여부)

- 결정:
  > | `patternProperties`와 스키마 값 `additionalProperties`(동적 키의 노드화 여부) | `08-design-a-to-z.md:451`(§15) | PR-1 | 설계 결정 |
- 보충: 없음
- 상태: 열림(→ `reviews/round-18-agenda.md` §1, :16)
- 출처: `reviews/round-18-agenda.md:16`(정본), `08-design-a-to-z.md:89`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:3`)
- 라운드: 17
- 까닭: `reviews/round-18-agenda.md:16`

### SCHEMA-033 열림: 노드의 `required` 표시가 켜진 `then`을 반영하는 규칙

- 결정:
  > | 노드의 `required` 표시가 켜진 `then`을 반영하는 규칙 | `08-design-a-to-z.md:451`(§15) | PR-1 | 설계 결정 |
- 보충: 없음
- 상태: 열림(→ `reviews/round-18-agenda.md` §1, :18)
- 출처: `reviews/round-18-agenda.md:18`(정본)
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:3`)
- 라운드: 17
- 까닭: `reviews/round-18-agenda.md:18`

### SCHEMA-034 열림: 같은 가상 이름을 다른 `fields`로 적은 `options.virtual` 항목

- 결정:
  > | 같은 가상 이름을 다른 `fields`로 적은 `options.virtual` 항목(정해지면 청사진 오류 코드가 생길 수 있음) | `reviews/raw-round17-convergence.md:77`(R15-10), `reviews/raw-round17-onerror.md` §5의 미정 행 | PR-1 | 설계 결정 |
- 보충: 없음
- 상태: 열림(→ `reviews/round-18-agenda.md` §1, :19)
- 출처: `reviews/round-18-agenda.md:19`(정본), `08-design-a-to-z.md:331#10`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:3`)
- 라운드: 17
- 까닭: `reviews/round-18-agenda.md:19`

### SCHEMA-035 열림: 옮길 잎 교차 함수(`intersectConst`·`intersectPattern`)의 뜻

- 결정:
  > | 옮길 잎 교차 함수의 뜻. `intersectConst`는 참조로 비교해 구조가 같은 객체·배열 `const`를 충돌로 던지고, `intersectPattern`은 두 패턴을 같은 자리의 전방 탐색으로 이어 두 패턴을 모두 만족하는 문자열(`'ab'`, `'Abc123'`)을 거부하며 역참조와 같은 이름의 캡처 그룹에서 깨진다. 기존 시험이 이 결함을 단언한다. `const`의 동등 판정, `pattern` 연언의 표현(정규식 하나인가 목록인가), 레거시의 옛 `intersect*Schema`가 옛 함수를 계속 쓰는지, 09 §4.3의 '그대로 산다'에서 뺄 단언(외부 점검 codex·antigravity, 검증자 실행 확인) | `08-design-a-to-z.md:571`(§17.2), `:324`(§9), `09-landing-and-test-strategy.md:158`(§4.3), `src/helpers/jsonSchema/processAllOfSchema/intersectSchema/utils/intersectConst.ts:23`, `intersectPattern.ts:21`, `utils/__tests__/intersectPattern.test.ts:13` | PR-1 | 설계 결정 |
- 보충: 없음
- 상태: 열림(→ `reviews/round-18-agenda.md` §1, :21)
- 출처: `reviews/round-18-agenda.md:21`(정본), `08-design-a-to-z.md:324`
- 닫은 사람: 편집자 결정(18라운드 안건, 외부 점검 반영 `reviews/round-18-agenda.md:7`)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:21`

### SCHEMA-036 열림: 같은 호스트의 `oneOf`와 `anyOf` 분기의 동순위

- 결정:
  > | 같은 호스트의 `oneOf`와 `anyOf` 분기의 동순위. 키워드 순위가 둘을 한 순위로 두어 `oneOf[i]`와 `anyOf[i]`의 자리가 같다. 주석 키의 나중 승, 같은 대상 규칙의 같은 층 동점, 공유 충돌의 '앞선 종류', 터미널 전략의 '나중 것', 호스트 바퀴의 평가 순서가 모두 이 순서에 기댄다(오늘은 `oneOf` 먼저)(외부 점검 codex) | `08-design-a-to-z.md:176`(§5), `02-target-overview.md:124`(§2.1), `03-mental-model.md:126`(§4), `adr/0002-guard-fragment-model.md:59`, `adr/0005-blueprint-analysis-and-node-sharing.md:70`·`:94`, `src/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:450-451` | PR-1, PR-2 | 설계 결정 |
- 보충: 없음
- 상태: 열림(→ `reviews/round-18-agenda.md` §1, :23)
- 출처: `reviews/round-18-agenda.md:23`(정본), `03-mental-model.md:126`
- 닫은 사람: 편집자 결정(18라운드 안건, 외부 점검 반영 `reviews/round-18-agenda.md:7`)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:23`

### SCHEMA-037 열림: 게이트 없는 분기의 선언이 터미널 전략과 `options` 병합에 드는가

- 결정:
  > | 게이트 없는 분기의 선언이 터미널 전략과 `options` 병합에 드는가. 표현 키는 유일한 선언일 때만 쓰는데 터미널 판정은 켜진 선언을 모두 센다. 본체와 게이트 없는 `oneOf` 분기가 같은 객체를 선언하고 분기에만 인라인 입력이 있으면 노드는 터미널로 정해지는데 유효 스키마에는 그 입력이 없다(외부 점검의 검증자, 개연) | `08-design-a-to-z.md:331`(§9), `:193`(§6), `02-target-overview.md:138`(§2.1), `adr/0002-guard-fragment-model.md:61` | PR-1 | 설계 결정 |
- 보충: 없음
- 상태: 열림(→ `reviews/round-18-agenda.md` §1, :24)
- 출처: `reviews/round-18-agenda.md:24`(정본), `08-design-a-to-z.md:331`
- 닫은 사람: 편집자 결정(18라운드 안건, 외부 점검 반영 `reviews/round-18-agenda.md:7`)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:24`

### SCHEMA-038 열림: 켜진 조각과의 런타임 교차가 공집합일 때 공개 `node.jsonSchema`가 싣는 것

- 결정:
  > | 켜진 조각과의 런타임 교차가 공집합일 때 공개 `node.jsonSchema`가 싣는 것(`enum`은 빈 배열인가, `const` 충돌의 표현, 범위의 역전). PR-1의 병합표 시험이 이 결과를 단언한다(외부 점검의 검증자, 개연) | `adr/0005-blueprint-analysis-and-node-sharing.md:76`(§3), `08-design-a-to-z.md:324`(§9), `09-landing-and-test-strategy.md:168`(§4.4) | PR-1 | 설계 결정 |
- 보충: 없음
- 상태: 열림(→ `reviews/round-18-agenda.md` §1, :26)
- 출처: `reviews/round-18-agenda.md:26`(정본), `08-design-a-to-z.md:324`
- 닫은 사람: 편집자 결정(18라운드 안건, 외부 점검 반영 `reviews/round-18-agenda.md:7`)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:26`

### SCHEMA-039 병합표 — `options`·`presentation`은 그룹 단위 깊은 병합(터미널 전략 문장이 없는 08 §9 행)

- 결정:
  > | 부류 | 규칙 |
  > | --- | --- |
  > | `options`·`presentation`의 키(그룹 단위) | 뒤가 앞을 덮되 그룹 객체(`options`, `presentation`)는 깊은 병합이다. 작성자 스키마를 변이하지 않으며, 재귀는 두 선언이 같은 키에 모두 원자가 아닌 plain object를 줄 때만 새 객체를 만들어 하고(쓰기 시 복사) 한쪽에만 있는 값은 객체라도 복사하지 않고 참조를 옮긴다. React 요소(`$$typeof`)와 ref 모양(자기 열거 키가 `current` 하나뿐인 객체)은 원자라 나중 승이다. 원자 판정 함수는 렌더 계층이 터미널 판정 함수와 함께 청사진에 넘기며 core는 React 요소의 표식을 모른다(P5). core만 쓰는 호스트가 넘기지 않으면 원자는 없다. 선언이 하나면 그 객체를 그대로 쓴다. 함수·원시값은 나중 승, 나중 조각의 `undefined`는 앞 값을 지우지 않는다. 배열은 나중 조각의 것으로 통째 교체한다(14라운드 확정. `@winglet/common-utils`의 `merge`에 선택 인자(배열 교체, 원자 판정, 한쪽 값의 참조 이동. 양쪽에 있는 객체는 새 객체에 병합한다: 쓰기 시 복사)를 더해 쓰며 인자가 없으면 오늘 동작이다. 14라운드 O-11 되물음의 답, 17라운드 스웜 수렴(편집자 결정)) |
- 보충:
  > "작성자 스키마와 앞 조각의 객체를 변이하지 않으며" (`03-mental-model.md:133`)
  > "`options.virtual`의 항목은 가상 노드의 선언이라 병합표가 아니라 조각의 선언 규칙(조각이 선언한 노드는 그 조각과 함께 켜지고 꺼진다, ADR 0002·0005)을 따르며, 같은 가상 이름을 다른 `fields`로 적은 경우는 슬라이스 1 전 설계 항목이다." (`08-design-a-to-z.md:331`)
  > "`options.propertyKeys`·`omitEmpty`·`omitTrailing`은 유효 스키마에서 읽으므로 활성 조각 집합마다 달라도 된다(17라운드 스웜 수렴(편집자 결정))." (`08-design-a-to-z.md:331`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:327`(정본), `03-mental-model.md:133`, `08-design-a-to-z.md:331`, `07-conclusions.md:170`, `adr/0005-blueprint-analysis-and-node-sharing.md:101,108`, `02-target-overview.md:134`, `reviews/round-15-decisions.md:64`
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:27` E-18), 소유자 답(`reviews/round-12-owner-answers.md:24` §9 `&options`), 소유자 답(`reviews/round-14-owner-answers.md:17` O-11), 17라운드 스웜 수렴(편집자 결정, `08-design-a-to-z.md:327`)
- 라운드: 17
- 까닭: `reviews/round-10-owner-answers.md:27`, `reviews/round-14-owner-answers.md:17`
