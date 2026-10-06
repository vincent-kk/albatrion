# 단일 원장 — 청사진

기준 커밋: `ba398c330`(저장소 `packages/canard/schema-form/architecture`). 이 원장이 인용하는 `path:line`은 모두 이 커밋의 줄 번호다. 정본 우선순위는 `ledger/README.md` §1을 따른다. 이 영역의 정본은 `adr/0005-blueprint-analysis-and-node-sharing.md`(일부 수락, 5차 본문과 17라운드 개정)와 `08-design-a-to-z.md` §5이며, ADR 0005에 없는 규칙만 `08` §5가 정본이다. 병합표의 행(ADR 0005 §5, `02` §2.1)은 SCHEMA 영역이, 가드 컴파일은 VALIDATE·ERROR 영역이, 터미널 전략은 NODE 영역이 든다. 18라운드 안건 §1(청사진이 읽는 스키마의 범위, A)이 열어 두었던 것은 18라운드 편집자 결정(`reviews/round-18-closing.md` §1)으로 닫혔고, 이미 정해진 규칙은 **현행**이다. `union`의 범위와 청사진 판정 절차는 18라운드 소유자 답(`reviews/round-18-owner-answers.md:29-37`)과 편집자 결정(`reviews/round-18-closing.md` 18C-90)이 정했다(BLUEPRINT-036–BLUEPRINT-045). 상태 값의 뜻은 README §3을 따른다.

## 색인

| 번호 | 한 줄 요약 | 상태 | 닫은 사람 |
| --- | --- | --- | --- |
| BLUEPRINT-001 | 분석 단계 — 순수 함수, 폼 생성 때 1회, 작성된 스키마 불변, 노드 없이 시험 | 현행 | 편집자 결정(10라운드 5차 본문 제안, `adr/0005-blueprint-analysis-and-node-sharing.md:3` "분석 단계의 분리와 청사진의 형태는 제안"), 원리(ADR 0001 입력 불변, `adr/0005-blueprint-analysis-and-node-sharing.md:44`) |
| BLUEPRINT-002 | 청사진의 형태 — ObjectBlueprint와 Fragment의 칸 | 현행 | 편집자 결정(5차 본문 제안, `adr/0005-blueprint-analysis-and-node-sharing.md:3` "분석 단계의 분리와 청사진의 형태는 제안"), 소유자 답(`reviews/round-18-owner-answers.md:38` 설계서 메모 1), 소유자 답(`reviews/round-18-owner-answers.md:39` 설계서 메모 2) |
| BLUEPRINT-003 | forbids 칸 없음 — 금지 구문은 폼이 읽지 않음 | 현행(부정 결정) | 소유자 답(`reviews/round-5-derivations.md:7` P1'; D-3의 전제), 원리(`reviews/round-5-derivations.md:28-34` D-3 도출) |
| BLUEPRINT-004 | 조각의 정적 열거, declares 일반 경로, inherited 귀속, 무조건 allOf 항목 | 현행 | 편집자 결정(4차 본문 E3·E12, `adr/0005-blueprint-analysis-and-node-sharing.md:12`), 편집자 결정(5차 본문 병합표, `adr/0005-blueprint-analysis-and-node-sharing.md:13`) |
| BLUEPRINT-005 | 두 철자(items 배열·prefixItems, definitions·$defs)를 모두 읽음 | 현행 | 소유자 답(`reviews/round-2.md:112` C5), 소유자 답(`00-goals.md:108` C5) |
| BLUEPRINT-006 | P1′ 경계 — 구조는 읽고 의미는 평가하지 않음, 예외는 명시 판별 하나 | 현행 | 소유자 답(`reviews/round-5-derivations.md:7` P1'), 소유자 답(`reviews/round-9-spec.md:19` 축1), 소유자 답(`reviews/round-10-owner-answers.md:11` B-22; 예외) |
| BLUEPRINT-007 | 게이트 재평가 — 읽는 것을 뽑지 않고 전부 평가, 남는 최적화는 벤치마크로 | 현행 | 편집자 결정(1라운드 R11 측정 반영, `adr/0005-blueprint-analysis-and-node-sharing.md:10`), 편집자 결정(4차 본문 E13·F13, `adr/0005-blueprint-analysis-and-node-sharing.md:12`) |
| BLUEPRINT-008 | "앞서"·"나중"은 전순서로 정의, 2라운드 S13 닫힘 | 현행 | 편집자 결정(4차 본문, `adr/0005-blueprint-analysis-and-node-sharing.md:12`) |
| BLUEPRINT-009 | 노드의 "같은 종류" 정의 — 소유자 확인(12-9) | 대체됨(→ BLUEPRINT-032) | 편집자 결정(1라운드 R11 반영, `adr/0005-blueprint-analysis-and-node-sharing.md:10`), 소유자 답(`reviews/round-18-owner-answers.md:19` 12-9), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-02) |
| BLUEPRINT-010 | 같은 이름 + 같은 종류는 노드 하나를 공유, 분기가 바뀌어도 값이 남음 | 현행 | 소유자 답(`adr/0005-blueprint-analysis-and-node-sharing.md:115` 합의 근거, "동의합니다.") |
| BLUEPRINT-011 | 같은 이름 + 다른 종류는 종류별 노드, 활성 종류가 하나면 그 노드가 삶 | 현행 | 편집자 결정(1라운드 R11 반영 (b), `adr/0005-blueprint-analysis-and-node-sharing.md:10`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-90), 소유자 답(`reviews/round-18-owner-answers.md:37` union O7·O8) |
| BLUEPRINT-012 | 공유 충돌 — 게이트 없는 선언끼리는 청사진 오류, 실제 동시 활성은 정착 오류 | 현행 | 소유자 답(`adr/0005-blueprint-analysis-and-node-sharing.md:116` 합의 근거, "타입이 달라버리면 … 오류가 throw 되겠지"), 소유자 답(`reviews/round-14-owner-answers.md:16` O-10), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 편집자 결정(17라운드 ADR 0014 4판, `adr/0014-error-policy.md:231`; 앞선 종류로 커밋), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-90), 소유자 답(`reviews/round-18-owner-answers.md:37` union O7·O8), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-98) |
| BLUEPRINT-013 | 게이트 배타는 작성자 몫 — 폼은 검사하지 않고 검증기가 기각 | 현행 | 편집자 결정(1라운드 R11 반영 (b), `adr/0005-blueprint-analysis-and-node-sharing.md:10`) |
| BLUEPRINT-014 | 게이트 없는 분기의 노드 공유 — 존재만, 켜진 게이트 조각은 연언으로 교차 | 현행 | 편집자 결정(10라운드 5차 본문, `adr/0005-blueprint-analysis-and-node-sharing.md:13` "§3에 게이트 없는 분기의 노드 공유(존재만, 제약 교차 없음)를 더했다") |
| BLUEPRINT-015 | 게이트 없는 분기 안의 if/then은 선언 문맥 — then 제약을 교차하지 않음 | 중복(→ SCHEMA-014) | 편집자 결정(12라운드, `reviews/round-12-derivation.md:21`; 소유자의 물음 `reviews/round-12-owner-answers.md:22`에 대화로 답함) |
| BLUEPRINT-016 | 교차 공집합 — 정적 연언은 청사진 오류로 throw, 런타임 교차는 throw 없이 검증기가 기각 | 현행 | 편집자 결정(10라운드 5차 본문, `adr/0005-blueprint-analysis-and-node-sharing.md:76` 원장 §5), 소유자 답(`reviews/round-18-owner-answers.md:37` union O7·O8; `type`의 빈 교집합) |
| BLUEPRINT-017 | 명시 판별 — union 호스트에 적을 때만 분기별 controls.active로 변환, 분기 스키마 불변 | 현행 | 소유자 답(`reviews/round-10-owner-answers.md:11` B-22), 소유자 답(`reviews/round-12-owner-answers.md:9` 2 `&discriminator`), 소유자 답(`reviews/round-9-spec.md:20` 축2; 판별 프로퍼티는 본체), 소유자 답(`reviews/round-15-decisions.md:13` 5; `controls` 그룹 표기), 소유자 답(`reviews/round-15-decisions.md:9` 1; 식의 기준점 `./`) |
| BLUEPRINT-018 | 예약 층의 판별 — 오늘의 자동 감지·COMPOSITION_PROPERTY_REDEFINITION 대체와 이주 안내 | 현행 | 소유자 답(`reviews/round-12-owner-answers.md:9` 2 `&discriminator` 명시 필수 수용) |
| BLUEPRINT-019 | 열림: controls.discriminator 변환의 세부 — $ref·allOf 평탄화, 분기 자기 controls.active와의 결합 | 중복(→ FRAGMENT-048) | 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:17`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-05) |
| BLUEPRINT-020 | 병합표 준비 — 적용은 정착의 계산 단계에서 켜진 조각에 | 현행 | 편집자 결정(14라운드 설계서, `08-design-a-to-z.md:179`) |
| BLUEPRINT-021 | 유효 스키마의 메모(활성 덧씌움 집합마다)와 통지, node.jsonSchema의 변화 | 현행 | 편집자 결정(10라운드 5차 본문, `adr/0005-blueprint-analysis-and-node-sharing.md:13` "유효 스키마의 메모와 통지를 적었다"), 소유자 답(`reviews/round-9-spec.md:23` 축5; `node.jsonSchema`는 유효 스키마) |
| BLUEPRINT-022 | controls 식 컴파일과 역의존 표 — 뽑을 수 없는 식은 controls.watch | 현행 | 편집자 결정(15라운드 설계서, `08-design-a-to-z.md:181`) |
| BLUEPRINT-023 | 열림: 다중 type 슬롯과 값 union | 대체됨(→ BLUEPRINT-031) | 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:14`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-02) |
| BLUEPRINT-024 | 열림: $ref 재귀에서 정적 열거가 끝나는 규칙 | 대체됨(→ BLUEPRINT-030) | 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:13`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-01) |
| BLUEPRINT-025 | ADR 0005 합의 근거 — 소유자 발언 원문 모음 | 현행(기록) | 소유자 답(`adr/0005-blueprint-analysis-and-node-sharing.md:115-116`; 유일한 기록, 초판 커밋 ab41d790d부터 있고 reviews에는 없음), 소유자 답(`reviews/round-14-owner-answers.md:16` O-10), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-10-owner-answers.md:11,12,20,22,25,26,27` B-22·B-12·D-7·D-17·E-13·E-16·E-18), 소유자 답(`reviews/round-13-owner-answers.md:7,9` 1 잠금 규칙·3 폼 전용 키 접두) |
| BLUEPRINT-026 | 되돌림 가능성 — 청사진 형태는 쉽고, 노드 공유와 controls.discriminator는 어려움 | 현행(기록) | 편집자 결정(`adr/0005-blueprint-analysis-and-node-sharing.md:138`), 소유자 답(`reviews/round-15-decisions.md:13` 5; `controls` 표기) |
| BLUEPRINT-027 | 대체됨: 배타가 구조로 보장되지 않으면 분석 단계에서 throw | 대체됨(→ BLUEPRINT-012, BLUEPRINT-013) | 편집자 결정(1라운드 R11 반영, `adr/0005-blueprint-analysis-and-node-sharing.md:10`) |
| BLUEPRINT-028 | 대체됨: 교차가 공집합이어도 throw하지 않음(정적 연언은 뒤에 청사진 오류로 바뀜) | 대체됨(→ BLUEPRINT-016) | 편집자 결정(1라운드 R11 반영 (d), `adr/0005-blueprint-analysis-and-node-sharing.md:10`) |
| BLUEPRINT-029 | 대체됨: 판별식 식별(E14)·판별 프로퍼티의 union 호스트 소유(E8) | 대체됨(→ BLUEPRINT-017) | 소유자 답(`reviews/round-10-owner-answers.md:11` B-22) |
| BLUEPRINT-030 | `$ref` 재귀의 정적 열거와 무한 형상 — 위치마다 한 번, 조각 안 순환 절단, 객체 프로퍼티만의 순환은 청사진 오류, 원본 없는 사슬의 되풀이는 정착 오류 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-01) |
| BLUEPRINT-031 | 값 union — 원시 타입만의 `type` 배열은 (가칭) `union` 잎 하나, `interpret`는 선언 순서의 S1 변환, 기본 문자열 입력, 섞인 union과 `type` 없는 원시 `anyOf`·`oneOf`는 청사진 오류, PR-1 인식·PR-2 행 | 분할됨(→ BLUEPRINT-034, BLUEPRINT-033) | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-02), 소유자 답(`reviews/round-18-owner-answers.md:19` 12-9; `integer`·`null` 접기), 소유자 답(`reviews/round-18-owner-answers.md:24` 18C 검토 1번; 대체) |
| BLUEPRINT-032 | 노드의 종류 — 일곱(string·number(`integer` 포함)·boolean·null·object·array·(가칭) `union`), nullable은 플래그, type 없는 overlay는 어느 종류와도 맞음 | 현행 | 소유자 답(`reviews/round-18-owner-answers.md:19` 12-9; 같은 종류 접기), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-02; 종류의 수), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-90), 소유자 답(`reviews/round-18-owner-answers.md:29` union 범위; 범위), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105), 소유자 답(`reviews/round-18-owner-answers.md:31` union O1; 종류의 수) |
| BLUEPRINT-033 | `union` 노드의 목적·해석·입력 계약·기본 입력 — 형을 고르는 기능이 아님, 받아 줄 형이 정확히 하나일 때만 변환, 선언 순서·검증기 규칙을 쓰지 않음, 기본 입력은 문자열 입력 그대로 | 분할됨(→ BLUEPRINT-042, BLUEPRINT-040, WRITE-099) | 소유자 답(`reviews/round-18-owner-answers.md:24` 18C 검토 1번), 소유자 답(`reviews/round-18-owner-answers.md:35` union O5; 대체), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-92), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105) |
| BLUEPRINT-034 | 값 union에서 그대로인 것 — 원시 타입만의 `type` 배열은 `union` 잎 하나, 정합은 나열된 타입 가운데 하나, 기본 문자열 입력, 섞인 union과 `type` 없는 원시 `anyOf`·`oneOf`는 청사진 오류, PR-1 인식·PR-2 행 | 분할됨(→ BLUEPRINT-043, BLUEPRINT-036, BLUEPRINT-037, BLUEPRINT-039, BLUEPRINT-044, REACT-032, BLUEPRINT-042) | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-02), 소유자 답(`reviews/round-18-owner-answers.md:19` 12-9; `integer`·`null` 접기), 소유자 답(`reviews/round-18-owner-answers.md:29` union 범위; 대체), 소유자 답(`reviews/round-18-owner-answers.md:30` union 형 없는 분기; 대체), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-90), 소유자 답(`reviews/round-18-owner-answers.md:36` union O6; 대체), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-92) |
| BLUEPRINT-035 | 용어 — `union` 확정(가칭 풂, `isUnionNode`·`unionBehavior/`), `oneOf`·`anyOf` 분기를 가진 호스트는 variant 호스트, 분기 하나는 variant | 현행 | 소유자 답(`reviews/round-18-owner-answers.md:28` 18C 검토 6번), 소유자 답(`reviews/round-18-owner-answers.md:29` union 범위; 범위) |
| BLUEPRINT-036 | `union`의 범위 — `type`에 원시·객체·배열 가운데 둘 이상의 종류가 적힌 칸의 터미널 잎, `object`·`array`가 든 `union`은 터미널 강제, 안쪽 키는 자식 없는 검증 전용, 객체·배열로의 변환 없음, `omitEmpty`·채움은 값 전체, 기본 입력은 객체·배열을 읽기 전용 JSON으로 | 현행 | 소유자 답(`reviews/round-18-owner-answers.md:29` union 범위) |
| BLUEPRINT-037 | 자기 `type` 없는 칸의 원시 `oneOf`·`anyOf` — 분기 허용 집합의 합집합 U(`oneOf`와 `anyOf`가 함께면 교집합)가 원시 잎·`union` 잎·null 종류를 정함, 빈 U와 분기 없음은 `UNKNOWN_JSON_SCHEMA`, 형 없는 칸의 `nullable`은 효과 없음 | 분할됨(→ BLUEPRINT-051, BLUEPRINT-050) | 소유자 답(`reviews/round-18-owner-answers.md:30` union 형 없는 분기) |
| BLUEPRINT-038 | 자기 `type` 없는 칸에 허용 집합이 ⊤인 분기(`const`·`enum`만 있는 분기 포함)가 있으면 `UNKNOWN_JSON_SCHEMA` — 오류에 그 분기의 schemaPath와 `type`을 적으라는 안내 | 현행 | 소유자 답(`reviews/round-18-owner-answers.md:32` union O2) |
| BLUEPRINT-039 | 자기 `type` 없는 칸의 분기 형에 `object`·`array`가 있으면 `UNKNOWN_JSON_SCHEMA` — object variant 호스트는 건드리지 않음, 푸는 것은 뒤로(나중에 풀어도 비파괴) | 분할됨(→ BLUEPRINT-049, BLUEPRINT-048) | 소유자 답(`reviews/round-18-owner-answers.md:33` union O3) |
| BLUEPRINT-040 | 규칙 A·기본 입력·경고등의 기준 목록은 `node.schemaType`(+`nullable`), 게이트가 켜진 동안은 유효 목록 — 청사진은 `schemaType`을 유효 스키마에 써 넣지 않음, `jsonSchema.type`은 켜진 선언의 교집합 | 현행 | 소유자 답(`reviews/round-18-owner-answers.md:35` union O5) |
| BLUEPRINT-041 | 한 칸의 `type` 선언들 — 통합 원리 U1–U9: 연언이고 허용 집합은 교집합, 빈 교집합만 충돌(정적은 청사진 오류, 게이트는 켜진 동안의 정착 오류), 정적 선언이 종류·`schemaType`·`nullable`을 정하고 게이트는 유효 목록만 좁힘, 한 진입에서 쓰인 노드의 두 번 해석 | 현행 | 소유자 답(`reviews/round-18-owner-answers.md:37` union O7·O8), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-104), 소유자 답(`reviews/round-18-owner-answers.md:41` 설계서 메모 4), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105; U7 재해석은 라운드마다) |
| BLUEPRINT-042 | `union` 노드의 목적·해석·기본 입력에서 그대로인 것 — 형을 고르는 기능이 아님, 받아 줄 형이 정확히 하나일 때만 변환, 선언 순서·검증기 규칙을 쓰지 않음, 기본 입력은 문자열 입력 | 현행 | 소유자 답(`reviews/round-18-owner-answers.md:24` 18C 검토 1번), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-92) |
| BLUEPRINT-043 | 값 union에서 계속 그대로인 것 — `null`은 nullable로·`integer`는 `number`로 접음, 접은 집합이 둘 이상이면 `union`(행 `terminal`), `union`끼리는 접은 집합이 같을 때 같은 종류, 정합은 나열된 타입 가운데 하나, PR-1 인식·PR-2 행 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-02), 소유자 답(`reviews/round-18-owner-answers.md:19` 12-9; `integer`·`null` 접기), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-92), 소유자 답(`reviews/round-18-owner-answers.md:29` union 범위; 범위), 소유자 답(`reviews/round-18-owner-answers.md:35` union O5; 목록) |
| BLUEPRINT-044 | 청사진 판정 절차 — 허용 집합 A(d)와 fold, 교집합(`integer ⊂ number`, `null`은 양쪽에 있을 때만), 단계 S0–S6, 결과 일곱, 터미널 하위 키 경고 (가칭) `TERMINAL_SUBTREE_KEY_IGNORED_FOR_FORM`, PR-1·PR-4 게이트 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-90), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105) |
| BLUEPRINT-045 | 청사진 판정의 예 E1–E42 — 칸마다 종류·`schemaType`·nullable·전략·오류 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-90), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105) |
| BLUEPRINT-046 | 청사진 내부 이름은 약어 없이 풀 네임 — `PropertyDecl`은 `PropertyDeclaration` 같은 풀 네임으로(PROCESS-023·SURFACE-023), PR-1의 청사진 `DETAIL.md`에서 적음 | 현행 | 소유자 답(`reviews/round-18-owner-answers.md:38` 설계서 메모 1) |
| BLUEPRINT-047 | 조각의 구현 타입 이름은 `SchemaFragment` — React `Fragment`와 겹침을 피함, 개념어 "조각"과 FRAGMENT 영역 이름은 그대로 | 현행 | 소유자 답(`reviews/round-18-owner-answers.md:39` 설계서 메모 2) |
| BLUEPRINT-048 | 자기 `type` 없는 칸의 객체·배열 분기 — 접은 집합 F가 `{object}`·`{array}`면 variant 호스트로 추정, U 절차와 게이트 분기 제외, nullable은 `'null'` ∈ U, `items`는 명시 호스트와 같은 규칙, S4·S6 자리, 혼합은 `UNKNOWN_JSON_SCHEMA`, ⊤ 분기, 재귀와 순환 절단, 대체 범위, E16 | 현행 | 소유자 답(`reviews/round-19-owner-answers.md:7` 형 없는 객체 호스트), 편집자 결정(19라운드, `reviews/round-19-closing.md` 19C-01) |
| BLUEPRINT-049 | object variant 호스트는 건드리지 않음 — 소유자 답 33행은 object·array와 원시를 섞는 경우만 다루며, 그 칸을 푸는 것은 뒤로(나중에 풀어도 비파괴) | 현행 | 소유자 답(`reviews/round-18-owner-answers.md:33` union O3) |
| BLUEPRINT-050 | `type` 없이 `const`·`enum`만 있는 분기 없는 칸 — 리터럴의 JSON 종류로 원시 잎·null 잎, 종류 혼합·객체 리터럴은 `UNKNOWN_JSON_SCHEMA`, 분기 안의 `const`는 그대로 오류, 소유자 답 30행 첫 문장 대체, ERROR-164 "언제" | 현행 | 소유자 답(`reviews/round-19-owner-answers.md:8` `const`만 있는 프로퍼티(X1)), 편집자 결정(19라운드, `reviews/round-19-closing.md` 19C-02) |
| BLUEPRINT-051 | 자기 `type` 없는 칸의 원시 `oneOf`·`anyOf` — 분기 허용 집합 A(b), 합집합 U(`oneOf`와 `anyOf`가 함께면 교집합), `'null'`은 뒤에 뗌, 빈 U는 `UNKNOWN_JSON_SCHEMA`, `{null}`은 null 종류, 게이트 분기 제외, 형 없는 칸의 `nullable`은 효과 없음 | 현행 | 소유자 답(`reviews/round-18-owner-answers.md:30` union 형 없는 분기) |

## 항목

### BLUEPRINT-001 분석 단계 — 폼 생성 때 한 번 도는 순수 함수, 작성된 스키마를 변형하지 않고 결과를 별도 구조에 둔다

- 결정:
  > ```
  > 작성된 스키마 ──(순수 함수, 폼 생성 시 1회)──▶ 청사진 ──▶ 노드 트리
  > ```
  > - 작성된 스키마는 변형하지 않는다(ADR 0001). 분석 결과는 별도 구조에 둔다.
  > - 분석 단계는 노드 없이 테스트할 수 있다(`02-target-overview.md` §5-2).
- 보충:
  > "폼 생성 때(그리고 스키마 교체 때) 한 번 도는 **순수 함수**다." (`08-design-a-to-z.md:174`)
  > 편집자 결정(86C-02): "【추론】 65라운드의 절차대로 구조 몫은 코드 전에 바꿀 설계와 뒤집힐 원장 항목을 올려 판단받고, 64라운드 위임은 "원장의 원칙대로"이므로 편집자가 열 수 있는 것은 현행 원칙 안의 변경뿐이다. (b1) 청사진의 정적 분석을 폼 생성 때 한 번 도는 것(BLUEPRINT-001)과 정적 오류를 생성 자리에서 잡아 대체 화면으로 가는 것(ADR 0014, 17라운드 스웜 수렴과 소유자 답 R17-1)은 "폼이 그려지기 전에 스키마의 잘못을 안다"는 계약이고, 분석을 최초 접근으로 미루면 그 오류가 어느 필드를 처음 만질 때 나타나므로 계약이 바뀐다 — 편집자가 열지 않는다. (b2) 즉시 전체 형상과 채움을 지연 생성·읽기 계산으로 바꾸는 것은 GOAL-071 "생성이 곧 첫 정착(A3)"과 상태 모형 P3(상태는 `raw`·`extras`, 나머지는 커밋된 계산값), `getValue`·`find`·렌더가 보는 시점의 계약을 뒤집으므로 역시 편집자가 열지 않는다. 둘은 코드 수준 후보와 재측정 뒤 목표(85C-01)에 못 미친 수치, 각 후보의 절감 상한(07의 보고서), 뒤집힐 항목 목록과 함께 소유자에게 올린다. (b3) 구독한 노드에만 `revision`·payload를 만드는 S4는 65C-03이 EVENT-001 #2("리스너 유무와 무관한 단조 카운터")·EVENT-007·EVENT-024를 뒤집는다고 거절했고 그 까닭은 그대로다; 다만 `revision`은 모든 노드에서 커밋 때 그대로 올리고(늦은 구독자의 갭 감지), 변하는 것은 "payload 객체의 생성 시점"뿐이며 EVENT-024의 `previous`("그 노드에 마지막으로 통지한 값")가 구독 전 변경에 대해 무엇이 되는지를 정의해 그 뜻을 지키는 좁은 변형이 있으면 07이 설계안으로 올리고 편집자가 판단한다 — 통지가 없던 노드의 payload를 미리 만드는 비용은 관측되지 않는 작업이므로 원칙 안에서 줄일 여지가 있다. 순서는 07의 권고대로 코드 수준 후보 → 같은 방법의 재측정 → (b3) 변형의 설계안 → 남은 간극은 (b1)·(b2)와 함께 소유자에게. EVENT-070 3번의 개발 모드 경고는 측정과 겹치지 않게 그 뒤에 넣는다." (`reviews/round-86-closing.md:16`)
  > 편집자 결정(89C-03): "【추론】 BLUEPRINT-001은 청사진을 "폼 생성 때 한 번 도는 순수 함수"로 정했지 어떤 색인을 반드시 만들라고 정하지 않았고, BLUEPRINT-002의 Fragment는 `guard`가 "없음(항상 참)"일 수 있으므로 분기 없는 폼의 그래프는 조각 하나짜리이며 그 위에 얹는 gate-host·재배치 색인과 게이트 역의존 trie는 게이트가 있을 때만 뜻이 있는 자료다. 그러므로 그 자료를 만들지 않는 것은 86C-02가 열지 않은 b1(분석의 지연)과 다르다 — 정적 검사는 모두 생성 때 끝나고 오류는 생성 자리에서 잡히며(ADR 0014), 바뀌는 것은 "쓰이지 않을 색인을 미리 만들지 않는다"뿐이다. 조건은 셋이다. (가) 분기 없음의 증명은 선언 수집이 닿는 모든 자리 — `$ref` 대상(FRAGMENT-048·SCHEMA-007), 게이트 없는 `allOf` 항목, `items`·`prefixItems`·추가 항목, 터미널이 아닌 노드의 인라인 하위 스키마 — 에서 `oneOf`·`anyOf`·`if`·discriminator·`controls.active`의 부재를 확인한 것이어야 하고, 루트에 키가 없다는 사실만으로 판정하지 않는다(설계안이 이미 그렇게 적었다). (나) BLUEPRINT-012의 정적 충돌(게이트 없는 선언끼리의 같은 이름·다른 종류), BLUEPRINT-044의 S0–S6과 터미널 하위 키 경고, BLUEPRINT-030의 재귀 판정, 작성 순서와 predicate 메모는 분기 유무와 무관하게 그대로 돈다. (다) `computed-visible-derived`처럼 분기 없이도 식이 있는 폼이 있으므로 식 컴파일과 derive·watch·state 색인, SETTLE-017이 청사진에 둔 역의존 표는 그 기능이 있으면 그대로 만들고, 공유하는 불변 빈 결과는 그 기능의 부재가 따로 증명된 capability일 때만 돌려주며, 미완성의 변경 가능한 빈 Map·Set을 밖에 내지 않는다. 청사진 캐시의 키와 `if` 게이트 컴파일의 위치당 1회 공유(ADR 0004)는 바뀌지 않는다." (`reviews/round-89-closing.md:23`)
  > 편집자 결정(100C-01): "【추론】 BLUEPRINT-001은 청사진을 "폼 생성 때(그리고 스키마 교체 때) 한 번 도는 순수 함수"로 정했고 그 비용에 대해서는 정하지 않았다; 작성 선언 1,365개의 분석에 10.7 ms가 드는 것은 선언마다 8 µs에 가까운 값으로 순수 함수의 일로서 비싸며, 옛 판의 전처리와 생성과 정착을 합친 전체(3.3 ms)보다 세 배 넘게 크다 — 이것이 nested·flat 마운트가 목표에 못 미치는 거의 전부이고(분석을 빼면 nested-d5 마운트는 약 2.8 ms로 옛 판의 0.9배다), 분기 폼의 마운트도 같다. 그러므로 가장 큰 몫을 가장 먼저 다루되 방법은 99C-01 그대로다: 콜드 청사진 분석 안의 함수별 자기 시간을 같은 프로파일러로 갈라(선언 수집, 노드 생성 분석, 식 컴파일, 형상 검증, 색인 만들기, 동결) 5% 이상의 일마다 떼어 내기로 상한을 확인하고, 상한이 큰 순서로 변경 하나에 종단 재측정 하나로 고친다 — 87라운드의 원칙(순회는 최소한으로, 불필요한 계산은 생략, 고전 루프와 안정된 모양)이 그대로 적용되는 자리이며 정적 오류의 드러남과 결과(청사진의 내용)는 바뀌지 않아야 한다(차등: 같은 스키마 쉰아홉 종에서 청사진의 구조·오류·경고 동일, 89C-03의 시험을 재사용). S01(콜드 청사진의 불변 분석과 폼별 가변 캐시를 나누어 같은 내용의 스키마 사이에 공유하는 계약)은 둘째 폼부터만 돕고 매번 새 스키마의 첫 마운트는 줄이지 못하며, 키(스키마 내용인가 참조인가, GOAL-070의 깊은 복사와의 관계), 식 문맥과 옵션의 포함 범위, 수명과 무효화, 폼 사이의 독립(BLUEPRINT-021·022)이라는 새 계약이 필요하므로 지금 열지 않고, 코드 수준으로 줄인 뒤에도 첫 마운트가 목표에 못 미치면 그때 뒤집힐 항목과 함께 설계안으로 올린다(그 전까지 지금의 같은 스키마 객체 재사용은 그대로). S02(노드 트리와 초기 로드의 재사용)는 폼마다 독립인 상태(원본, 상호작용, 진단)를 폼 사이에 잇는 것이라 GOAL-071·NODE-039의 계약을 넘고 절감도 S01에 포함되므로 열지 않는다. 갱신 쪽의 코드 수준 몫(재계산 표시 1.38 ms, 자식 선언 방문 1.09 ms, 경로 해석·투영 읽기·읽기 공표·스키마 선택)과 정적 첫 로드의 커밋·개정(1.83·1.05 ms)은 같은 규칙으로 상한 순서대로 간다; 이후 갱신의 사건 표시(자기 12–13%)와 첫 갱신의 객체 조립(24–26%)은 떼어 내기 상한을 먼저 보이고, 그 자리가 계약(개정 번호의 일괄 올림 EVENT-007, 조립의 구조 공유 VALUE-012)에 닿으면 코드 전에 물음으로 올린다. 07이 첫째로 든 스키마 재병합(단일 무조건 선언의 유효 스키마를 청사진에서 한 번 정규화)은 결과를 바꾸지 않는 코드 수준 몫이므로 그대로 진행한다. 상한들은 겹치므로 하나를 고친 뒤 나머지의 상한을 다시 잰다." (`reviews/round-100-closing.md:9`)
  > 편집자 결정(101C-01): "【추론】 BLUEPRINT-001은 청사진을 "작성된 스키마를 변형하지 않고 결과를 별도 구조에 둔다"고 했고 BLUEPRINT-002는 그 결과의 형태(기본 선언과 조각, 조각의 id·guard·context·declares·constrains·children)를 정했다. 둘 다 결과의 내용을 정한 것이지 그 내용을 어떤 메모리 기록으로 표현하고 몇 번 만드는지를 정한 것이 아니다. 그러므로 노드·선언·조각·자식 바인딩·정규화 기록이 같은 메타데이터(id·path·schemaPath·role·scope)를 저마다 들고 있는 것은 구현의 선택이고, 그것을 권위 있는 기록 하나와 거기서 읽는 view로 바꾸는 것, 빈 배열을 동결해 하나로 공유하는 것, 선언의 order와 gates처럼 앞이 같고 뒤만 더해지는 배열을 접미로 공유하는 것은 공개 청사진의 내용과 정적 진단(오류·경고의 경로·순서·횟수)이 같다면 원장이 막지 않는다 — 다만 세 가지를 설계안이 보여야 한다. 하나, 공유되는 것은 모두 동결된 불변 값이어야 한다(한 소비자의 변경이 다른 소비자에게 새는 길이 없어야 하므로; 지금 청사진이 동결되어 있다면 그대로의 조건이다). 둘, 참조 동일성을 계약으로 삼는 소비자가 없어야 한다 — 빈 배열이 하나로 공유되면 "같은 참조이면 같은 노드"로 읽는 코드나 시험이 깨지므로, 설계안은 그런 비교가 있는 자리를 찾아 적고(없으면 없다고 적고) 있으면 먼저 고친다. 셋, view는 읽을 때마다 새 객체를 만들지 않아야 한다(그렇지 않으면 분석의 할당이 정착의 할당으로 옮겨 갈 뿐이다). 설계안을 지금 쓰는 까닭: 코드 수준 묶음의 예상 상한(노드당 116–135개)이 목표 자리(약 65개)에 닿지 못함이 이미 보이고, 설계의 물음은 코드 수준 묶음의 결과에 따라 달라지지 않으므로 기다릴 까닭이 없다; 반대로 코드 수준 묶음은 상한이 큰 순서로 변경 하나에 계수 시험·쉰아홉 종 차등·종단 재측정(판정 열과 기록 열) 하나로 그대로 간다 — 설계안이 그 묶음 가운데 어떤 것을 무의미하게 만든다면(예: 정규화 결과가 권위 기록에 바로 쓰여 메모가 사라짐) 그 묶음은 설계안에 흡수하고 따로 고치지 않는다. 설계안에는 (가) 지금 만드는 기록의 종류마다 노드당 개수와 그 가운데 청사진에 남는 것·버려지는 것, (나) 바꾼 뒤의 기록 구조와 종류마다의 예상 개수(합이 어디까지 내려오는지, 이상화 값 32.2개와 목표 자리 65개 사이 어디인지), (다) 참조 동일성·동결·view의 세 조건에 대한 코드 근거, (라) 공개 청사진 내용과 정적 진단의 동일을 보일 차등(쉰아홉 종에 더해 템플릿 재사용과 같은 이름 다른 종류의 폼), (마) 적용 순서(기록 종류마다 변경 하나에 재측정 하나)를 적는다. 97C-01과 같이 검증자의 대조를 거친 뒤 구현하며, 검증자는 특히 (다)를 코드와 대조한다. 생성 번들의 처분(지우고 무시 목록, PR 알림에 적음)은 88C-02의 선례대로 맞다." (`reviews/round-101-closing.md:9`)
- 상태: 현행
- 출처: `adr/0005-blueprint-analysis-and-node-sharing.md:27,44,124`(정본), `08-design-a-to-z.md:174`, `02-target-overview.md:122`
- 닫은 사람: 편집자 결정(10라운드 5차 본문 제안, `adr/0005-blueprint-analysis-and-node-sharing.md:3` "분석 단계의 분리와 청사진의 형태는 제안"), 원리(ADR 0001 입력 불변, `adr/0005-blueprint-analysis-and-node-sharing.md:44`)
- 라운드: 10
- 까닭: `adr/0005-blueprint-analysis-and-node-sharing.md:17-19`

### BLUEPRINT-002 청사진의 형태 — ObjectBlueprint와 Fragment

- 결정:
  > ```
  > ObjectBlueprint {
  >   base:      PropertyDecl[]        // properties. 노드 게이트(controls.active)는 그 선언이 든다
  >   fragments: Fragment[]            // 정적으로 열거된 모든 조각
  > }
  > Fragment {
  >   id          // 작성된 스키마 안의 위치 (schemaPath). 에러 라우팅의 키
  >   guard       // 게이트: if(검증기 플러그인이 컴파일) | controls.active(표현식) | 없음(항상 참)
  >   context     // 연언 | 선언, 그리고 어느 oneOf/anyOf의 분기인가 (ADR 0002)
  >   declares    // 이 조각이 새로 선언하는 property
  >   constrains  // 기존 property에 얹는 overlay: name → 스키마
  >   inherited   // 조상에서 끌어올린 조각이 이 호스트에 귀속시킨 overlay (E12)
  >   children    // 중첩 조각 — 감싸는 조각이 활성일 때만 순회한다 (E3)
  > }
  > ```
- 보충:
  > 소유자(설계서 메모 1): "약어 (Decl)을 쓰지말고" (`reviews/round-18-owner-answers.md:38`)
  > 소유자(설계서 메모 2): "Fragment 는 매력적인데, React Fregment <></> 랑 충돌할거같구나. 내부명이라 괜찮을거같지만, 그래도 명칭을 바꿨으면 해. SchemaFragment 정도로." (`reviews/round-18-owner-answers.md:39`)
  > 편집자 결정(25C-06): "【추론】 BLUEPRINT-002의 스케치(`guard`·`constrains`·`inherited`)와 BLUEPRINT-017의 "`SchemaFragment.guard`에 든 `controls.active` 식"은 뜻의 서술이며, 02의 `src/core/blueprint/type.ts`(`SchemaFragment`의 `gates`·`overlays`·`inheritedOverlays`, 숫자 `id`, 게이트 `{ kind: 'if' | 'active' | 'discriminator', condition }`)가 그 구현이다(BLUEPRINT-026)." (`reviews/round-25-closing.md:58`)
  > 편집자 결정(89C-03): "【추론】 BLUEPRINT-001은 청사진을 "폼 생성 때 한 번 도는 순수 함수"로 정했지 어떤 색인을 반드시 만들라고 정하지 않았고, BLUEPRINT-002의 Fragment는 `guard`가 "없음(항상 참)"일 수 있으므로 분기 없는 폼의 그래프는 조각 하나짜리이며 그 위에 얹는 gate-host·재배치 색인과 게이트 역의존 trie는 게이트가 있을 때만 뜻이 있는 자료다. 그러므로 그 자료를 만들지 않는 것은 86C-02가 열지 않은 b1(분석의 지연)과 다르다 — 정적 검사는 모두 생성 때 끝나고 오류는 생성 자리에서 잡히며(ADR 0014), 바뀌는 것은 "쓰이지 않을 색인을 미리 만들지 않는다"뿐이다. 조건은 셋이다. (가) 분기 없음의 증명은 선언 수집이 닿는 모든 자리 — `$ref` 대상(FRAGMENT-048·SCHEMA-007), 게이트 없는 `allOf` 항목, `items`·`prefixItems`·추가 항목, 터미널이 아닌 노드의 인라인 하위 스키마 — 에서 `oneOf`·`anyOf`·`if`·discriminator·`controls.active`의 부재를 확인한 것이어야 하고, 루트에 키가 없다는 사실만으로 판정하지 않는다(설계안이 이미 그렇게 적었다). (나) BLUEPRINT-012의 정적 충돌(게이트 없는 선언끼리의 같은 이름·다른 종류), BLUEPRINT-044의 S0–S6과 터미널 하위 키 경고, BLUEPRINT-030의 재귀 판정, 작성 순서와 predicate 메모는 분기 유무와 무관하게 그대로 돈다. (다) `computed-visible-derived`처럼 분기 없이도 식이 있는 폼이 있으므로 식 컴파일과 derive·watch·state 색인, SETTLE-017이 청사진에 둔 역의존 표는 그 기능이 있으면 그대로 만들고, 공유하는 불변 빈 결과는 그 기능의 부재가 따로 증명된 capability일 때만 돌려주며, 미완성의 변경 가능한 빈 Map·Set을 밖에 내지 않는다. 청사진 캐시의 키와 `if` 게이트 컴파일의 위치당 1회 공유(ADR 0004)는 바뀌지 않는다." (`reviews/round-89-closing.md:23`)
  > 편집자 결정(101C-01): "【추론】 BLUEPRINT-001은 청사진을 "작성된 스키마를 변형하지 않고 결과를 별도 구조에 둔다"고 했고 BLUEPRINT-002는 그 결과의 형태(기본 선언과 조각, 조각의 id·guard·context·declares·constrains·children)를 정했다. 둘 다 결과의 내용을 정한 것이지 그 내용을 어떤 메모리 기록으로 표현하고 몇 번 만드는지를 정한 것이 아니다. 그러므로 노드·선언·조각·자식 바인딩·정규화 기록이 같은 메타데이터(id·path·schemaPath·role·scope)를 저마다 들고 있는 것은 구현의 선택이고, 그것을 권위 있는 기록 하나와 거기서 읽는 view로 바꾸는 것, 빈 배열을 동결해 하나로 공유하는 것, 선언의 order와 gates처럼 앞이 같고 뒤만 더해지는 배열을 접미로 공유하는 것은 공개 청사진의 내용과 정적 진단(오류·경고의 경로·순서·횟수)이 같다면 원장이 막지 않는다 — 다만 세 가지를 설계안이 보여야 한다. 하나, 공유되는 것은 모두 동결된 불변 값이어야 한다(한 소비자의 변경이 다른 소비자에게 새는 길이 없어야 하므로; 지금 청사진이 동결되어 있다면 그대로의 조건이다). 둘, 참조 동일성을 계약으로 삼는 소비자가 없어야 한다 — 빈 배열이 하나로 공유되면 "같은 참조이면 같은 노드"로 읽는 코드나 시험이 깨지므로, 설계안은 그런 비교가 있는 자리를 찾아 적고(없으면 없다고 적고) 있으면 먼저 고친다. 셋, view는 읽을 때마다 새 객체를 만들지 않아야 한다(그렇지 않으면 분석의 할당이 정착의 할당으로 옮겨 갈 뿐이다). 설계안을 지금 쓰는 까닭: 코드 수준 묶음의 예상 상한(노드당 116–135개)이 목표 자리(약 65개)에 닿지 못함이 이미 보이고, 설계의 물음은 코드 수준 묶음의 결과에 따라 달라지지 않으므로 기다릴 까닭이 없다; 반대로 코드 수준 묶음은 상한이 큰 순서로 변경 하나에 계수 시험·쉰아홉 종 차등·종단 재측정(판정 열과 기록 열) 하나로 그대로 간다 — 설계안이 그 묶음 가운데 어떤 것을 무의미하게 만든다면(예: 정규화 결과가 권위 기록에 바로 쓰여 메모가 사라짐) 그 묶음은 설계안에 흡수하고 따로 고치지 않는다. 설계안에는 (가) 지금 만드는 기록의 종류마다 노드당 개수와 그 가운데 청사진에 남는 것·버려지는 것, (나) 바꾼 뒤의 기록 구조와 종류마다의 예상 개수(합이 어디까지 내려오는지, 이상화 값 32.2개와 목표 자리 65개 사이 어디인지), (다) 참조 동일성·동결·view의 세 조건에 대한 코드 근거, (라) 공개 청사진 내용과 정적 진단의 동일을 보일 차등(쉰아홉 종에 더해 템플릿 재사용과 같은 이름 다른 종류의 폼), (마) 적용 순서(기록 종류마다 변경 하나에 재측정 하나)를 적는다. 97C-01과 같이 검증자의 대조를 거친 뒤 구현하며, 검증자는 특히 (다)를 코드와 대조한다. 생성 번들의 처분(지우고 무시 목록, PR 알림에 적음)은 88C-02의 선례대로 맞다." (`reviews/round-101-closing.md:9`)
- 상태: 현행
- 출처: `adr/0005-blueprint-analysis-and-node-sharing.md:29-41`(정본), `reviews/round-18-owner-answers.md:38`, `reviews/round-18-owner-answers.md:39`
- 닫은 사람: 편집자 결정(5차 본문 제안, `adr/0005-blueprint-analysis-and-node-sharing.md:3` "분석 단계의 분리와 청사진의 형태는 제안"), 소유자 답(`reviews/round-18-owner-answers.md:38` 설계서 메모 1), 소유자 답(`reviews/round-18-owner-answers.md:39` 설계서 메모 2)
- 라운드: 18
- 까닭: `adr/0005-blueprint-analysis-and-node-sharing.md:138`
- 충돌:
  > `adr/0005-blueprint-analysis-and-node-sharing.md:30`의 "PropertyDecl[]"은 소유자 답과 다르다: 구현 이름은 약어 없는 풀 네임(예: `PropertyDeclaration`)이다(BLUEPRINT-046). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:38`).
  > `adr/0005-blueprint-analysis-and-node-sharing.md:33`의 "Fragment {"는 소유자 답과 다르다: 구현의 타입 이름은 React `Fragment`와 겹치지 않는 `SchemaFragment`다(BLUEPRINT-047). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:39`).
  > `adr/0005-blueprint-analysis-and-node-sharing.md:31`의 "fragments: Fragment[]"는 소유자 답과 다르다: 구현의 타입 이름은 React `Fragment`와 겹치지 않는 `SchemaFragment`다(BLUEPRINT-047). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:39`).

### BLUEPRINT-003 청사진에 forbids 칸은 없다 — 금지 구문은 폼이 읽지 않는다

- 결정:
  > - `forbids` 칸은 없다. 금지 구문은 폼이 읽지 않는다(ADR 0002, D-3).
- 보충: 없음
- 상태: 현행(부정 결정)
- 출처: `adr/0005-blueprint-analysis-and-node-sharing.md:45`(정본)
- 닫은 사람: 소유자 답(`reviews/round-5-derivations.md:7` P1'; D-3의 전제), 원리(`reviews/round-5-derivations.md:28-34` D-3 도출)
- 라운드: 5
- 까닭: `reviews/round-5-derivations.md:28-34`

### BLUEPRINT-004 조각의 정적 열거 — declares의 일반 경로, 상속 overlay의 귀속, 무조건 allOf 항목, intersectSchema의 승격

- 결정:
  > - "`properties` 밖에도 노드가 있다"는 런타임의 특수 경로가 아니라 청사진의 `declares`를 읽는 일반 경로가 된다.
  > - 조각은 스키마에서 **정적으로 열거된다.** 그래서 "모든 분기 자식을 사전 생성하고 활성만 토글"하는 현재의 트리 모델(D2)을 유지할 수 있다.
  > - 끌어올린 조각의 `then`이 손자를 선언하면 청사진이 그 선언을 자식 호스트의 `inherited`로 귀속시킨다(E12). 게이트는 조상의 것이므로 자식은 자기 바퀴에서 그것을 평가하지 않는다.
  > - `allOf`의 무조건 항목은 게이트가 항상 참인 연언 조각이다. 기존 `intersectSchema`는 "활성인 조각들을 §5의 병합표로 합치는 연산"으로 승격된다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0005-blueprint-analysis-and-node-sharing.md:46-49`(정본), `02-target-overview.md:124`, `08-design-a-to-z.md:176`
- 닫은 사람: 편집자 결정(4차 본문 E3·E12, `adr/0005-blueprint-analysis-and-node-sharing.md:12`), 편집자 결정(5차 본문 병합표, `adr/0005-blueprint-analysis-and-node-sharing.md:13`)
- 라운드: 10
- 까닭: `adr/0005-blueprint-analysis-and-node-sharing.md:17`

### BLUEPRINT-005 폼은 방언 스위치 없이 두 철자를 모두 읽는다

- 결정:
  > - 폼은 방언 스위치 없이 **두 철자를 모두 읽는다**: `items: [..]`와 `prefixItems`, `definitions`와 `$defs`(`00-goals.md` C5).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0005-blueprint-analysis-and-node-sharing.md:50`(정본)
- 닫은 사람: 소유자 답(`reviews/round-2.md:112` C5), 소유자 답(`00-goals.md:108` C5)
- 라운드: 2
- 까닭: `reviews/round-2.md:112`

### BLUEPRINT-006 P1′와의 경계 — 구조는 읽고 의미는 평가하지 않는다

- 결정:
  > 폼은 서브스키마가 **어디에 있고 무엇을 선언하는지**(`properties`, `items`, `prefixItems`, `if`/`then`/`else`, `allOf`/`oneOf`/`anyOf`, `$ref`, `type`)를 읽는다. 값이 스키마를 **만족하는지**는 평가하지 않는다. 그것은 언제나 `compileGuard`가 답한다. 값의 유효성 문법은 읽지 않는다(ADR 0002 "금지 조각은 없다"). 분기의 `const`·`enum` 값도 읽지 않는다. 예외는 작성자가 `controls.discriminator`를 명시한 union 하나다(§4).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0005-blueprint-analysis-and-node-sharing.md:54`(정본), `adr/0005-blueprint-analysis-and-node-sharing.md:20`
- 닫은 사람: 소유자 답(`reviews/round-5-derivations.md:7` P1'), 소유자 답(`reviews/round-9-spec.md:19` 축1), 소유자 답(`reviews/round-10-owner-answers.md:11` B-22; 예외)
- 라운드: 10
- 까닭: `adr/0005-blueprint-analysis-and-node-sharing.md:20`

### BLUEPRINT-007 게이트가 읽는 것은 뽑지 않는다 — 전부 다시 평가, 건너뛰기가 필요한 경우와 남는 최적화

- 결정:
  > **게이트가 무엇을 읽는지는 기본적으로 뽑지 않는다.** 재계산 목록이 닿은 노드에 걸린 게이트를 전부 다시 평가한다. 측정에 따르면 AJV에서는 이것으로 충분하다 — 루트에 걸린 좁은 가드 200개를 키 입력마다 전부 돌려 7.9 µs다(`reviews/round-1.md` §2). "게이트가 걸린 객체의 참조가 그대로면 건너뛴다"는 루트에 걸린 게이트에 대해 효과가 없다(어떤 쓰기든 루트의 참조를 바꾼다).
  >
  > 건너뛰기가 실제로 필요한 경우는 둘이다: 인터프리터형 검증기(같은 작업이 약 70배), 컬렉션을 훑는 게이트(`contains` 등 — 아이템 10,000개에 AJV 190 µs, 인터프리터 4.5 ms). 변경 경로 → 게이트의 역색인은 출발점 고정(ADR 0002, D-2) 아래에서 듣지 않으므로 후보에서 뺐다(E13). 남는 최적화는 (a) 무조건 루트 키만 읽는 게이트의 건너뛰기, (b) 조각이 꺼질 때 키 제거를 `delete` 없이 하는 것, (c) 조각 토글마다 전체 리빌드 대신 그 조각이 선언한 키만 패치하는 것(F13)이다. 넣을지는 ADR 0009의 벤치마크로 정한다.
- 보충:
  > 편집자 결정(96C-01): "【추론】 SETTLE-020 "한 바퀴에 모든 게이트를 평가한다"와 SETTLE-018의 출발점 고정이 지키는 것은 형상이 상태의 순수 함수라는 것이다(SETTLE-044의 까닭 하나: 직전 활성 집합에서 출발하면 양의 순환에서 결과가 이력에 의존한다). 게이트의 값을 얻는 방법은 그 문장들이 정하지 않았고, BLUEPRINT-007은 "게이트가 무엇을 읽는지는 기본적으로 뽑지 않는다"면서 남는 최적화로 "(a) 무조건 루트 키만 읽는 게이트의 건너뛰기"를 들고 "넣을지는 ADR 0009의 벤치마크로 정한다"고 했다. 그 벤치마크가 지금 답을 냈다: 건드리는 두 분기를 고정한 `oneOf` 5·10·20·40의 전환 정착이 0.915 → 2.413 ms로 건드리지 않은 분기 수에 따라 늘고(91라운드 소유자 기준 (1)의 위반, GOAL-011), 그 가장 큰 덩어리가 게이트 재평가다. 그러므로 결과를 바꾸지 않는 범위에서 연다. (가) 판별 선택 표: BLUEPRINT-017은 `controls.discriminator`를 분기마다의 `controls.active: "./<key> === <value>"`(목록이면 포함)로 바꾸고 판별 프로퍼티는 본체에 선언한다고 했으므로, 그 게이트들은 무조건 있는 한 키의 값에 대한 순수 함수이고 N개를 따로 평가한 결과는 그 키의 값으로 표를 한 번 찾은 결과와 같다; 작성자가 직접 적은 `controls.active`가 식 컴파일러에서 같은 꼴(본체 키 하나와 리터럴의 `===` 또는 목록 포함)로 드러나면 같이 묶는다. 표는 청사진이 만들고(값 → 그 값에서 켜지는 분기들; 한 값이 여러 분기의 목록에 들면 모두), 바퀴는 지금 그 게이트들을 평가하던 자리에서 표를 한 번 찾아 그 값들을 같은 순서로 반영한다(가우스-자이델의 즉시 반영 그대로). 분기가 자기 `controls.active`도 가져 게이트가 `(변환식) && (분기 식)`이면(FRAGMENT-048) 표가 앞 항을 대고 뒤 항은 앞 항이 참인 분기에서만 평가한다 — 식은 순수하므로 결과가 같다. (나) 결과 재사용: 식 게이트가 읽는 경로는 식에서 정적으로 알려지고 청사진이 이미 역의존 표를 만든다(SETTLE-017); 그 경로가 모두 게이트 없는 본체가 선언한 키(값의 있음이 다른 게이트에 달리지 않는 키)이고 이번 정착의 재계산 목록에 닿지 않았으면 그 게이트의 값은 직전 커밋의 평가와 같으므로 다시 쓴다 — BLUEPRINT-007의 (a)를 "무조건 있는 본체 키만 읽는 게이트"로 읽은 것이며, 켜진 조각이 많은 호스트의 무관한 키 입력(SETTLE-044의 U19 행)이 이것으로 분기 수와 무관해진다. 재사용은 직전 활성 집합에서 출발하는 것이 아니다: 출발점은 여전히 게이트 없는 조각이고, 재사용하는 것은 입력이 같음이 증명된 순수 함수의 값이다. 열지 않는 것: `if` 게이트는 폼이 내용을 읽지 않으므로(GOAL-034, SETTLE-044의 까닭 둘) 지금처럼 매 바퀴 평가하고, 읽는 키의 있음이 다른 게이트에 달린 식과 꼴을 알아보지 못한 식도 그렇다; 직전 커밋의 활성 집합에서 출발하는 안은 SETTLE-044가 소유자가 받아들인 최소 고정점 동작을 근거로 기각한 것이라 편집자가 열지 않는다. 절차는 65라운드대로 설계안이 먼저다: 알아보는 꼴의 정의와 알아보지 못할 때의 되돌림, 모든 게이트를 평가한 결과와 같다는 논증(평가 순서와 즉시 반영, 한 값이 여러 분기에 드는 경우의 `SHARED_NODE_CONFLICT`, 어느 분기에도 들지 않는 값, 없음·`null`·수와 문자열의 같음 판정이 식 평가와 같음, 중첩 union과 재귀 템플릿에서 발생마다의 호스트), 차등 시험(선택 표·재사용을 끈 전수 평가와 같은 형상·값·오류·배달·라운드 수), 91라운드 기준 (1)을 보이는 계수(전환 한 번의 게이트 평가 수와 표 조회 수가 분기 수와 무관), 바뀌는 파일과 87라운드의 루프 모양. 설계안이 오면 원장과 대조해 판단한다. 코드 수준 몫(빈 단계 진입, 정착 문맥 준비, 의존 처리, 잠복 등록, 읽기 계획, 선택 표의 나머지, 표시 단계의 소유자 확장, 런타임 재병합, 작은 폼의 고정 준비)은 물음 없이 변경 하나에 재측정 하나로 진행한다 — 분기 수에 비례하는 몫이 게이트 밖에도 있으므로(선택 표의 나머지와 표시 단계의 소유자 확장 16 → 121) 그것들이 없어져야 기준 (1)이 선다. 07이 권하지 않은 구조 몫 둘(출력 계산의 지연, 꺼진 조각 분석의 지연)과 다시 올리지 않은 몫(구독자 없을 때의 생략)은 그대로 두고, 개선 뒤 남은 배율을 소유자에게 보일 때 상한과 뒤집힐 항목을 함께 적는다(86C-02의 b1·b2와 같은 자리)." (`reviews/round-96-closing.md:9`)
  > 편집자 결정(97C-01): "【추론】 96C-01이 연 범위의 조건은 "모든 게이트를 평가한 결과와 같다"이고, 설계안의 귀납 논증(평가 직전의 투영·형상·대기 입력이 같으면 표의 조회와 재사용이 같은 값을 내고 같은 순서로 적용된다)은 원장의 문장(SETTLE-018의 고정 출발점, SETTLE-020의 즉시 반영, FRAGMENT-048의 AND, SETTLE-044의 부정 결정)을 뒤집지 않는다. 독립 검증은 그 논증이 코드와 맞음을 확인하면서 문서 그대로는 관측이 갈리는 자리를 찾았으므로, 다음 여섯을 설계에 반영한 형태로 승인한다. (1) 선택 후보를 "직전·살아 있는·입력·잠복"으로 줄일 때 퇴장 대기 노드(같은 정착의 앞 바퀴에서 나간 노드)와 던진 게이트로 나간 표시의 구성원을 후보에 넣는다 — 지금 코드는 거짓 엔트리에서도 그 표시를 지우므로 빠지면 퇴장 정책이 갈린다(검증의 반례를 시험으로 둔다). (2) 표 조회와 재사용의 유효성은 쓰기가 밀어 넣는 세대 번호가 아니라 원래 평가 위치마다의 상수 시간 동일성 검사로 지킨다: 판별 게이트는 지금처럼 그 자리에서 호스트의 대기 출력을 공표한 뒤 호스트의 방출·`extras`·투영의 참조를 견주고, 식 게이트의 키는 구조상의 노드·방출·미계산 구간을 견주어 하나라도 다르면 다시 읽는다 — 원본이 그대로여도 유효 스키마의 변화(기준 스키마 복원, 분기 overlay, wrong-kind 조상, 같은 이름·다른 종류의 엔트리)로 읽는 값이 바뀌는 길을 모두 덮고, 공표의 자리와 그에 따른 배달 방문 순서(EVENT-005)도 그대로 둔다. (3) 읽는 키는 그 이름의 엔트리가 호스트에 하나일 때만 자격을 준다. (4) 갱신 때 형상이 더럽혀졌는가의 판정을 발생 전수 순회에서 읽기 경로 색인으로 바꾸는 것은 지금의 판정과 뜻이 같아야 한다(루트 읽기는 늘 참, 조상·자손 양방향의 교차, `@` 무시, 판별자의 감시 경로, 자기 발생과 에지 발생의 구분, 나중에 더해진 발생, 매 호출의 누적 집합에 대한 질의) — 더 좁으면 전수 평가가 도는 바퀴를 건너뛰고 그것은 SETTLE-044가 금한 직전 활성 집합 출발과 같다; 재계산 등록 직후의 형상 dirty 집합을 전수 평가와 견주는 시험을 둔다. (5) 게이트 후보를 청사진의 정적 계획으로 바꾸어도 지금과 같은 게이트 집합(라운드마다 발견되는 이동 게이트와 배열 엔트리 포함)과 바퀴 상한(SETTLE-017)을 내야 하고, 잠복 owner의 축약은 상태 키의 공표·나감 정책·배달 후보에 차이가 없음을 보이기 전에는 넣지 않는다. (6) 결과 슬롯은 실패 없는 커밋에서만 저장하고 마지막 평가 뒤 읽기가 건드려졌으면 저장하지 않는다. 세부 셋도 반영한다: 표의 값은 변환 뒤 게이트가 실제로 드는 값 목록(정적 연언의 교차를 거친 값)에서 만들고, 표 자격에는 식의 의존성이 정확히 하나라는 조건을 더하며(문자열 리터럴 안의 경로 모양도 의존성으로 잡히므로), 판별 키가 분기에만 선언되어 청사진이 게이트 없는 사본을 만든 흔한 꼴도 "무조건 있는 키"로 자격을 준다(BLUEPRINT-017·FRAGMENT-007의 끌어올림). 설계안의 현재 구조 서술 가운데 루트가 아닌 호스트의 평가 자리(부모의 자식 선택에서 평가됨)는 코드대로 고친다. 차등 시험에는 검증이 든 빠진 경우(위 반례, overlay로 읽기 값이 바뀌는 경우와 루트 호스트 스키마의 변화, 같은 이름·다른 종류의 읽기 키, 분기에만 선언된 판별 키, −0·없음·NaN·객체 `const`, 리터럴 안의 경로, 루트가 아닌 호스트, 이동 게이트가 있을 때의 바퀴 상한, 변경 노드의 순서와 배달 순서)를 더하고, 네 모드의 끝 상태 비교에 더해 같은 실행 안에서 원래 자리마다 전수 평가의 값과 최적화의 값을 대조하는 그림자 평가를 둔다 — 끝 상태가 우연히 같은 경우를 걸러 낸다. 승인은 설계에 대한 것이며 적용의 조건은 88C-01·89C와 같다: DETAIL을 먼저 고치고, 차등 시험을 전수 평가에서 초록으로 고정한 뒤 같은 단언을 최적화에 돌리며, 계수와 측정으로 91라운드 기준 (1)을 보인다; 게이트 호출만 일정해지고 분기 수에 비례하는 다른 순회가 남으면 미충족으로 보고한다. 변경은 (가)와 (나)와 연결 몫(B2·B4·B5)을 나누어 변경 하나에 재측정 하나로 한다." (`reviews/round-97-closing.md:9`)
- 상태: 현행
- 출처: `adr/0005-blueprint-analysis-and-node-sharing.md:56,58`(정본)
- 닫은 사람: 편집자 결정(1라운드 R11 측정 반영, `adr/0005-blueprint-analysis-and-node-sharing.md:10`), 편집자 결정(4차 본문 E13·F13, `adr/0005-blueprint-analysis-and-node-sharing.md:12`)
- 라운드: 5
- 까닭: `adr/0005-blueprint-analysis-and-node-sharing.md:56`

### BLUEPRINT-008 "앞서"와 "나중"은 ADR 0002의 전순서로 정의한다

- 결정:
  > - "앞서"와 "나중"은 ADR 0002의 **전순서**(감싸는 조각의 순서, 키워드 순위, 배열 인덱스)로 정의한다. 2라운드 S13(순서가 JSON 키 순서에 기댄다)은 이것으로 닫힌다.
- 보충:
  > "노드 게이트는 그 노드를 선언한 조각 바로 뒤에, 같은 조각 안에서는 선언 순서로 든다." (`08-design-a-to-z.md:176`)
  > "같은 호스트의 `oneOf`와 `anyOf` 분기의 동순위. 키워드 순위가 둘을 한 순위로 두어 `oneOf[i]`와 `anyOf[i]`의 자리가 같다." (`reviews/round-18-agenda.md:23`)
- 상태: 현행
- 출처: `adr/0005-blueprint-analysis-and-node-sharing.md:70`(정본), `adr/0005-blueprint-analysis-and-node-sharing.md:94`, `02-target-overview.md:124`, `08-design-a-to-z.md:176`
- 닫은 사람: 편집자 결정(4차 본문, `adr/0005-blueprint-analysis-and-node-sharing.md:12`)
- 라운드: 5
- 까닭: `adr/0005-blueprint-analysis-and-node-sharing.md:70`
- 충돌:
  > `08-design-a-to-z.md:176`의 "키워드 순위는 본체 `properties` < `allOf` 항목 < `if/then/else` < `oneOf`·`anyOf` 분기이며 JSON 키 순서에 기대지 않는다."는 18라운드 결정과 다르다: 같은 호스트의 `oneOf` 분기는 모든 `anyOf` 분기보다 앞이다(FRAGMENT-049). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:238-239`).
  > `reviews/round-18-agenda.md:23`의 "같은 호스트의 `oneOf`와 `anyOf` 분기의 동순위"는 18라운드 결정과 다르다: 같은 호스트의 `oneOf` 분기는 모든 `anyOf` 분기보다 앞이다(FRAGMENT-049). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:238-239`).

### BLUEPRINT-009 노드의 종류 — 여섯 종류, nullable은 플래그, type 없는 overlay는 어느 종류와도 맞음(소유자 확인 12-9)

- 결정:
  > 노드의 **종류**는 여섯이다: string, number(`integer` 포함), boolean, null, object, array. nullable(`type: ['string', 'null']`, `nullable: true`, null 분기와의 `anyOf`/`oneOf` — 현재 `helpers/jsonSchema/isNullBranch`가 알아본다)은 종류가 아니라 노드의 플래그다. `type`이 없는 overlay(`{ const }`, `{ enum }`, `{ minimum }`)는 어느 종류와도 맞는다.
- 보충:
  > "(a) "같은 타입"을 타입 표기의 동일성이 아니라 **같은 노드 종류**로 다시 정의했다 — `number`와 `integer`, `['string','null']`과 `'string'`은 배타가 아니다." (`adr/0005-blueprint-analysis-and-node-sharing.md:10`)
  > "분석 단계의 분리와 청사진의 형태는 제안. §3의 "같은 종류"는 수락된 규칙의 세부를 고친 것이어서 **소유자의 확인이 필요하다**(18라운드 안건 §1)." (`adr/0005-blueprint-analysis-and-node-sharing.md:3`)
  > "ADR 0005 상태 줄이 소유자 확인을 요구하지만 어느 목록에도 오르지 않았다" (`reviews/round-18-agenda.md:20`)
  > 소유자(12-9 답): "같은 종류 맞습니다." (`reviews/round-18-owner-answers.md:19`)
  > 반영 칸(12-9, 받음): "가. `number`와 `integer`, `['string','null']`과 `'string'`은 같은 종류다." (`reviews/round-18-owner-answers.md:19`)
  > 편집자 결정(18C-02): "【추론】 12-9가 확인한 것은 같은 종류의 접기(`number`와 `integer`, `['string','null']`과 `'string'`)이지 종류의 수가 아니다." (`reviews/round-18-closing.md:63`)
- 상태: 대체됨(→ BLUEPRINT-032)
- 출처: `adr/0005-blueprint-analysis-and-node-sharing.md:62`(정본), `adr/0005-blueprint-analysis-and-node-sharing.md:3,10`, `02-target-overview.md:125`, `08-design-a-to-z.md:177`, `reviews/round-18-owner-answers.md:19`, `reviews/round-18-closing.md:57-82`
- 닫은 사람: 편집자 결정(1라운드 R11 반영, `adr/0005-blueprint-analysis-and-node-sharing.md:10`), 소유자 답(`reviews/round-18-owner-answers.md:19` 12-9), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-02)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:19`, `reviews/round-18-agenda.md:20`, `reviews/round-18-closing.md:84-91`

### BLUEPRINT-010 같은 이름 + 같은 종류 — 노드 하나를 공유한다

- 결정:
  > | 상황 | 처리 |
  > | ---- | ---- |
  > | 같은 이름 + 같은 종류 (어느 조각이든) | **노드 하나를 공유한다.** 활성인 선언이 하나라도 있으면 존재한다. 유효 스키마는 §5의 병합표로 정한다 |
  >
  > - 같은 종류의 필드는 분기가 바뀌어도 같은 노드이므로 값이 자연스럽게 남는다. 현재의 "나가는 노드 reset → 들어오는 노드에 `fallbackValue` 복원 → `validateSchemaType`으로 타입 호환 검사"(`ObjectNode/.../BranchStrategy.ts:479-511`) 절차가 필요 없어진다.
- 보충:
  > "소유자가 수락한 규칙은 '같은 이름 + 같은 타입이면 노드 하나'이고, 1라운드 R11이 이를 노드 종류로 다시 정의했다" (`reviews/round-18-agenda.md:20`)
- 상태: 현행
- 출처: `adr/0005-blueprint-analysis-and-node-sharing.md:64-66,122`(정본), `adr/0005-blueprint-analysis-and-node-sharing.md:115`, `02-target-overview.md:125`, `08-design-a-to-z.md:177`
- 닫은 사람: 소유자 답(`adr/0005-blueprint-analysis-and-node-sharing.md:115` 합의 근거, "동의합니다.")
- 라운드: 10
- 까닭: `adr/0005-blueprint-analysis-and-node-sharing.md:18`, `adr/0005-blueprint-analysis-and-node-sharing.md:138`

### BLUEPRINT-011 같은 이름 + 다른 종류 — 종류별로 노드를 둔다

- 결정:
  > | 상황 | 처리 |
  > | ---- | ---- |
  > | 같은 이름 + 다른 종류 | 종류별로 노드를 둔다. 같은 시점에 활성인 선언의 종류가 하나면 그 노드가 산다 |
- 보충:
  > 편집자 결정(18C-90): "【추론】 정적 선언이 하나도 없는 이름은 fold가 같은 선언끼리 노드 하나를 둔다." (`reviews/round-18-closing.md:2405`)
  > 편집자 결정(18C-90): "【추론】 fold가 다른 게이트 선언이 동시에 켜지면 `SHARED_NODE_CONFLICT`이고, 배타이면 종류별 노드이며(BLUEPRINT-011·012 그대로), 각 노드 안에서는 켜진 선언이 유효 목록을 좁힌다." (`reviews/round-18-closing.md:2408`)
- 상태: 현행
- 출처: `adr/0005-blueprint-analysis-and-node-sharing.md:67`(정본), `reviews/round-18-closing.md:2405,2408`, `reviews/round-18-owner-answers.md:37`
- 닫은 사람: 편집자 결정(1라운드 R11 반영 (b), `adr/0005-blueprint-analysis-and-node-sharing.md:10`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-90), 소유자 답(`reviews/round-18-owner-answers.md:37` union O7·O8)
- 라운드: 18
- 까닭: `adr/0005-blueprint-analysis-and-node-sharing.md:10`, `reviews/round-18-closing.md:2466-2471`
- 충돌:
  > `adr/0005-blueprint-analysis-and-node-sharing.md:67`의 "종류별로 노드를 둔다"는 소유자 답과 다르다: 정적 선언이 있는 이름은 정적 선언들의 교집합이 노드 하나를 정하고, 게이트 선언은 그 노드의 종류를 바꾸지 않고 켜진 동안 유효 목록만 좁힌다(BLUEPRINT-041, BLUEPRINT-044). 교집합이 비지 않은 정적 선언끼리는 충돌이 아니며, 종류별 노드는 정적 선언이 하나도 없는 이름에만 남는다. 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:37`).

### BLUEPRINT-012 같은 이름 + 다른 종류가 동시에 활성 — 충돌, 게이트 없는 선언끼리는 청사진 오류, 게이트 가진 선언은 정착 오류

- 결정:
  > | 상황 | 처리 |
  > | ---- | ---- |
  > | 같은 이름 + 다른 종류가 **동시에** 활성 | 충돌이다. 충돌을 작성자에게 드러낸다(`00-goals.md` C2). 게이트 없는 선언끼리는 늘 함께 켜지므로 청사진 오류다(폼이 서지 않는다). 게이트에 달린 선언이 실제로 동시에 켜지면 정착 오류다: 마운트에서는 모든 환경에서 폼이 서지 않고 폼 자리에 대체 화면을 그리며(14라운드 O-10), 마운트 뒤에는 전순서에서 앞선 종류의 노드를 살려 커밋하고 통지 뒤 사슬 끝에서 던지며 `degraded`(`cause`는 공유 충돌)가 다음 로드까지 남아 그 동안 제출을 거부한다(17라운드 소유자 답 R17-1 나, ADR 0014 4판). 게이트 가진 선언의 충돌은 청사진에서 판정할 수 없으므로 분석 단계에서 미리 throw하지 않는다 |
  >
  > - 게이트 없는 분기끼리 같은 이름·다른 종류의 필드를 두면 두 분기가 늘 함께 켜져 있으므로 위 표의 3행이 된다.
- 보충:
  > "둘의 드러남은 ADR 0014(채택)가 정한다: 앞은 청사진 오류, 뒤는 모든 환경에서 드러나는 정착 오류이며 마운트에서는 폼이 서지 않는다(§11.3. 5차 문서는 경고였다." (`08-design-a-to-z.md:177`)
  > 편집자 결정(18C-90): "【추론】 켜진 게이트 선언과 정적 허용 집합의 교집합(`'null'` 포함)이 빈 경우(`reviews/round-18-owner-answers.md:37`의 U2)는 그 게이트들이 켜진 동안 `SHARED_NODE_CONFLICT`(정착 오류, 기존 처리)로 드러난다." (`reviews/round-18-closing.md:2402`)
  > 편집자 결정(18C-90): "【추론】 fold가 다른 게이트 선언이 동시에 켜지면 `SHARED_NODE_CONFLICT`이고, 배타이면 종류별 노드이며(BLUEPRINT-011·012 그대로), 각 노드 안에서는 켜진 선언이 유효 목록을 좁힌다." (`reviews/round-18-closing.md:2408`)
  > 편집자 결정(18C-98): "【추론】 `diagnostics`와 경고 중복 키는 폼 수준 로드(마운트, `FormHandle.reset()`)에서만 초기화한다." (`reviews/round-18-closing.md:2797`)
  > 편집자 결정(18C-98): "【추론】 `setValue(V)`와 `resetSubtree()`는 초기화하지 않는다." (`reviews/round-18-closing.md:2798`)
  > 편집자 결정(29C-03): "【추론】 `SHARED_NODE_CONFLICT`가 난 정착의 자리별 값은 "전순서에서 앞선 종류의 노드를 살린 형상"이다(BLUEPRINT-012, ERROR-159·164): 게이트 선언끼리의 충돌에서는 충돌한 이름의 다른 종류 노드 하나가 형상에서 빠지고, 한 노드 안의 형 충돌(`typeConflict`, 26C-05·BLUEPRINT-041)에서는 노드가 정적 `schemaType`으로 남으며, 어느 쪽이든 형상은 정해진다." (`reviews/round-29-closing.md:35`)
  > 편집자 결정(29C-03): "【추론】 형상이 정해졌으므로 그 뒤의 파생 라운드·전이(채움과 나감 비움)는 29C-02대로 평소처럼 돌고, 커밋되는 것은 그 계산 결과와 그 정착의 자동 쓰기다; 자동 쓰기를 뺀 원본 B는 SETTLE-011의 예산 초과 처분이라 공유 충돌에는 쓰지 않는다." (`reviews/round-29-closing.md:36`)
- 상태: 현행
- 출처: `adr/0005-blueprint-analysis-and-node-sharing.md:68,72`(정본), `adr/0005-blueprint-analysis-and-node-sharing.md:3,7,116`, `02-target-overview.md:125`, `08-design-a-to-z.md:177`, `reviews/round-18-closing.md:2402,2408`, `reviews/round-18-owner-answers.md:37`, `reviews/round-18-closing.md:2797-2798`
- 닫은 사람: 소유자 답(`adr/0005-blueprint-analysis-and-node-sharing.md:116` 합의 근거, "타입이 달라버리면 … 오류가 throw 되겠지"), 소유자 답(`reviews/round-14-owner-answers.md:16` O-10), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 편집자 결정(17라운드 ADR 0014 4판, `adr/0014-error-policy.md:231`; 앞선 종류로 커밋), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-90), 소유자 답(`reviews/round-18-owner-answers.md:37` union O7·O8), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-98)
- 라운드: 18
- 까닭: `adr/0005-blueprint-analysis-and-node-sharing.md:116`, `reviews/round-12-owner-answers.md:26`, `reviews/round-14-owner-review.md:66`, `reviews/round-18-closing.md:2466-2471`
- 충돌:
  > `adr/0005-blueprint-analysis-and-node-sharing.md:68`의 "게이트 없는 선언끼리는 늘 함께 켜지므로 청사진 오류다"는 소유자 답과 다르다: 정적 선언(호스트 본체, 게이트 없는 `allOf`, `$ref`)끼리는 교집합으로 노드 하나를 정하고 교집합이 빌 때만 `ALL_OF_TYPE_REDEFINITION`이며, 호스트의 게이트 없는 분기는 fold가 정적 노드의 fold에 들지 않을 때만 `SHARED_NODE_KIND_CONFLICT`다(BLUEPRINT-044). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:37`).
  > `adr/0005-blueprint-analysis-and-node-sharing.md:68`의 "게이트에 달린 선언이 실제로 동시에 켜지면 정착 오류다"는 소유자 답과 다르다: 정적 노드가 있는 칸에서는 켜진 게이트 선언과 정적 허용 집합의 교집합이 빌 때만 정착 오류다(BLUEPRINT-041 U2·U4). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:37`).
  > `adr/0005-blueprint-analysis-and-node-sharing.md:68`의 "같은 이름 + 다른 종류가 **동시에** 활성 | 충돌이다"는 소유자 답과 다르다: 종류가 다른 선언이 함께 켜져도 정적 선언끼리는 허용 집합의 교집합이 비지 않으면, 호스트의 게이트 없는 분기는 fold가 정적 노드의 fold에 들면, 켜진 게이트 선언은 정적 허용 집합과의 교집합이 비지 않으면 노드 하나이고 충돌이 아니다(BLUEPRINT-044, BLUEPRINT-041). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:37`).

### BLUEPRINT-013 게이트의 배타는 작성자의 스키마가 정하고 폼은 검사하지 않는다

- 결정:
  > - 게이트를 가진 분기의 `value: string` / `value: number`는 흔하고 정당한 선언이다. 게이트가 서로 배타이면 동시에 활성이 되지 않는다. 배타인지는 작성자의 스키마가 정하며 폼은 검사하지 않는다.
  > - `allOf: [{ if k=a then v:string }, { if k=b then v:number }]`도 같은 방식으로 동작한다. 게이트가 동시에 참이 되는 스키마를 썼다면 그것은 작성자의 실수이고, 검증기도 그 값을 기각한다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0005-blueprint-analysis-and-node-sharing.md:73-74`(정본)
- 닫은 사람: 편집자 결정(1라운드 R11 반영 (b), `adr/0005-blueprint-analysis-and-node-sharing.md:10`)
- 라운드: 1
- 까닭: `adr/0005-blueprint-analysis-and-node-sharing.md:10`

### BLUEPRINT-014 게이트 없는 oneOf·anyOf 분기의 노드 공유 — 존재만 더하고 제약은 교차하지 않는다

- 결정:
  > **게이트 없는 `oneOf`·`anyOf` 분기가 노드를 공유하면 존재만 더하고 제약은 교차하지 않는다.** 분기는 선언("또는") 문맥이다. 순수 분기 둘이 `kind`에 `{ const: 'a' }`와 `{ const: 'b' }`를 두면 교차는 공집합이 되어 검증기보다 좁은 힌트를 낸다. 켜진 게이트 조각(게이트 가진 분기 안 `if`의 `then`, 본체·`allOf`의 `then`, `controls.active`를 가진 분기, `controls.discriminator`로 변환된 분기)은 작성자가 "이 분기가 해당한다"고 선언한 것이므로 연언으로 교차한다(ADR 0002의 조각 표).
- 보충:
  > "게이트 없는 분기의 선언이 터미널 전략과 `options` 병합에 드는가." (`reviews/round-18-agenda.md:24`)
- 상태: 현행
- 출처: `adr/0005-blueprint-analysis-and-node-sharing.md:71#1-4`(정본), `adr/0005-blueprint-analysis-and-node-sharing.md:13`
- 닫은 사람: 편집자 결정(10라운드 5차 본문, `adr/0005-blueprint-analysis-and-node-sharing.md:13` "§3에 게이트 없는 분기의 노드 공유(존재만, 제약 교차 없음)를 더했다")
- 라운드: 10
- 까닭: `adr/0005-blueprint-analysis-and-node-sharing.md:71`

### BLUEPRINT-015 게이트 없는 분기 안의 if/then은 그 분기의 선언 문맥 — then의 제약을 교차하지 않는다

- 결정:
  > 게이트 없는 분기 안의 `if/then`은 그 분기의 선언 문맥이므로 `then`의 제약을 교차하지 않는다(원장 §4).
- 보충:
  > "게이트 없는 분기 안의 `if/then`도 그 분기의 선언 문맥이므로 `then`의 제약을 본체와 교차하지 않는다. 교차하는 것은 게이트 가진 분기(또는 본체·`allOf`)의 켜진 `then`뿐이다." (`03-mental-model.md:138`)
- 상태: 중복(→ SCHEMA-014)
- 출처: `adr/0005-blueprint-analysis-and-node-sharing.md:71#6`(정본), `03-mental-model.md:138`
- 닫은 사람: 편집자 결정(12라운드, `reviews/round-12-derivation.md:21`; 소유자의 물음 `reviews/round-12-owner-answers.md:22`에 대화로 답함)
- 라운드: 12
- 까닭: `reviews/round-12-derivation.md:21`

### BLUEPRINT-016 교차가 공집합일 때 — 정적 연언은 청사진 오류, 켜진 then과의 런타임 교차는 검증기가 기각

- 결정:
  > - **정적 연언(본체와 게이트 없는 `allOf`)의 교차가 공집합이면 청사진 오류로 throw하고, 켜진 `then`과의 런타임 교차가 공집합이면 throw하지 않고 검증기가 값을 기각한다(원장 §5).** 서로소인 `enum` 둘이 켜진 조각과의 연언에서 동시에 활성이면 그 필드는 "지금 고를 수 있는 값이 없는" 상태가 되고, 폼은 막지 않으며 검증기가 값을 기각한다. 필드를 비우면 값이 유효해지는 경우가 있으므로 폼 전체를 멈춰서는 안 된다(R11-e).
- 보충:
  > "`enum`의 교차가 공집합일 때 런타임 교차의 throw는 §3에 따라 사라지고 정적 연언의 throw만 남는다." (`adr/0005-blueprint-analysis-and-node-sharing.md:111`)
  > "켜진 조각과의 런타임 교차가 공집합일 때 공개 `node.jsonSchema`가 싣는 것(`enum`은 빈 배열인가, `const` 충돌의 표현, 범위의 역전)" (`reviews/round-18-agenda.md:26`)
  > 편집자 결정(25C-03): "【추론】 청사진 오류 `INVALID_RANGE`·`EMPTY_ENUM_INTERSECTION`·`CONFLICTING_CONST_VALUES`는 정적 연언에서 둘 이상의 기여가 같은 키워드를 적어 교차한 결과가 공집합일 때만 난다." (`reviews/round-25-closing.md:32`)
  > 편집자 결정(25C-03): "【추론】 리터럴 `enum: []`는 공집합 표시가 아니며, 공집합은 잎 함수가 `EMPTY_INTERSECTION`을 돌려준 경우만이다. 이 셋은 유효 스키마의 키워드 교차에만 걸리고, 판별 키의 `const`·`enum` 모으기는 FRAGMENT-048대로 키워드를 가리지 않고 교차하며, 기여 하나의 값이 이미 비어도(`{ enum: [] }`, `{ const: 'a', enum: ['b'] }`) `EMPTY_ENUM_INTERSECTION`이다(25C-01)." (`reviews/round-25-closing.md:34`)
- 상태: 현행
- 출처: `adr/0005-blueprint-analysis-and-node-sharing.md:76`(정본), `adr/0005-blueprint-analysis-and-node-sharing.md:111`, `reviews/round-18-owner-answers.md:37`
- 닫은 사람: 편집자 결정(10라운드 5차 본문, `adr/0005-blueprint-analysis-and-node-sharing.md:76` 원장 §5), 소유자 답(`reviews/round-18-owner-answers.md:37` union O7·O8; `type`의 빈 교집합)
- 라운드: 18
- 까닭: `adr/0005-blueprint-analysis-and-node-sharing.md:76`, `reviews/round-18-owner-answers.md:37`
- 충돌:
  > `adr/0005-blueprint-analysis-and-node-sharing.md:76`의 "켜진 `then`과의 런타임 교차가 공집합이면 throw하지 않고 검증기가 값을 기각한다"는 소유자 답과 다르다: `type`은 켜진 게이트 선언과 정적 허용 집합의 교집합이 비면 그 게이트들이 켜진 동안의 정착 오류(`SHARED_NODE_CONFLICT`)다(BLUEPRINT-041, BLUEPRINT-044). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:37`).

### BLUEPRINT-017 명시 판별 controls.discriminator — 선언, 변환, 분기 스키마 불변, 청사진 단계에서 끝남, 판별 프로퍼티

- 결정:
  > 원장 §1.2의 축 1항("`enum`·`const` 판별식은 쓰지 않는다")의 유일한 예외다. 근거는 축 1항(폼은 JSON Schema 문법을 해석하지 않는다)의 예외(소유자 동의, 10라운드)와 축 7항(JSON Schema 표현은 `controls` 표현으로 대체할 수 있어야 한다)이다.
  >
  > - **선언.** 작성자가 union 호스트(`oneOf`·`anyOf`를 가진 객체 스키마)에 예약 층 키 `controls: { discriminator: '<key>' }`를 적는다. 적지 않은 union의 `const`·`enum`은 읽지 않는다. OpenAPI의 `discriminator.propertyName`도 예약 층의 키가 아니므로 읽지 않는다.
  > - **변환.** 청사진 단계가 각 분기에서 그 키의 `const`·`enum`을 읽어, 그 분기를 `controls: { active: "./<key> === <value>" }`를 가진 조각 객체로 다룬다. `enum`이면 값이 그 목록에 드는가를 본다. 변환된 분기는 ADR 0002 조각 표의 3행(연언)이 된다.
  > - **분기 스키마는 손대지 않는다.** `kind: { const }`와 `required`는 그대로 검증기에 간다(ADR 0001). 결과는 청사진의 `Fragment.guard`에 든 `controls.active` 식뿐이다. 소유자: "우리는 "&active": 을 더하는거지 스키마를 수정하는건 아니니까".
  > - **청사진 단계에서 끝난다.** 상태 칸(원본과 `extras` 둘)도 작업 루프도 바꾸지 않는다. 변환된 게이트는 다른 `controls.active`와 같이 호스트 바퀴에서 평가된다.
  > - **판별 프로퍼티는 본체에 선언한다**(§3). 폼이 소유하지 않고, 분기 값의 합집합 `enum`을 만들지도 않으며, 암묵 default도 없다. 채움의 원천은 `controls.default` > `default` > 없음뿐이다.
- 보충:
  > 편집자 결정(25C-06): "【추론】 BLUEPRINT-002의 스케치(`guard`·`constrains`·`inherited`)와 BLUEPRINT-017의 "`SchemaFragment.guard`에 든 `controls.active` 식"은 뜻의 서술이며, 02의 `src/core/blueprint/type.ts`(`SchemaFragment`의 `gates`·`overlays`·`inheritedOverlays`, 숫자 `id`, 게이트 `{ kind: 'if' | 'active' | 'discriminator', condition }`)가 그 구현이다(BLUEPRINT-026)." (`reviews/round-25-closing.md:58`)
  > 편집자 결정(25C-06): "【추론】 받는 조건은 뜻이 같은 것이다: 판별 게이트는 `./<key>`의 값이 `values`에 드는가로 평가되고, 분기 자신의 `controls.active`와 AND 하나로 합쳐지며, 다른 `controls.active` 게이트와 같이 호스트 바퀴에서 평가된다." (`reviews/round-25-closing.md:59`)
  > 편집자 결정(25C-06): "【추론】 02에는 게이트 평가기가 없고 조건을 기록만 하므로(`type.ts`의 `BlueprintGate`, `gates`는 모두 성립해야 하는 조건의 목록), 평가는 PR 03이 이 뜻대로 한다." (`reviews/round-25-closing.md:60`)
  > 편집자 결정(96C-01): "【추론】 SETTLE-020 "한 바퀴에 모든 게이트를 평가한다"와 SETTLE-018의 출발점 고정이 지키는 것은 형상이 상태의 순수 함수라는 것이다(SETTLE-044의 까닭 하나: 직전 활성 집합에서 출발하면 양의 순환에서 결과가 이력에 의존한다). 게이트의 값을 얻는 방법은 그 문장들이 정하지 않았고, BLUEPRINT-007은 "게이트가 무엇을 읽는지는 기본적으로 뽑지 않는다"면서 남는 최적화로 "(a) 무조건 루트 키만 읽는 게이트의 건너뛰기"를 들고 "넣을지는 ADR 0009의 벤치마크로 정한다"고 했다. 그 벤치마크가 지금 답을 냈다: 건드리는 두 분기를 고정한 `oneOf` 5·10·20·40의 전환 정착이 0.915 → 2.413 ms로 건드리지 않은 분기 수에 따라 늘고(91라운드 소유자 기준 (1)의 위반, GOAL-011), 그 가장 큰 덩어리가 게이트 재평가다. 그러므로 결과를 바꾸지 않는 범위에서 연다. (가) 판별 선택 표: BLUEPRINT-017은 `controls.discriminator`를 분기마다의 `controls.active: "./<key> === <value>"`(목록이면 포함)로 바꾸고 판별 프로퍼티는 본체에 선언한다고 했으므로, 그 게이트들은 무조건 있는 한 키의 값에 대한 순수 함수이고 N개를 따로 평가한 결과는 그 키의 값으로 표를 한 번 찾은 결과와 같다; 작성자가 직접 적은 `controls.active`가 식 컴파일러에서 같은 꼴(본체 키 하나와 리터럴의 `===` 또는 목록 포함)로 드러나면 같이 묶는다. 표는 청사진이 만들고(값 → 그 값에서 켜지는 분기들; 한 값이 여러 분기의 목록에 들면 모두), 바퀴는 지금 그 게이트들을 평가하던 자리에서 표를 한 번 찾아 그 값들을 같은 순서로 반영한다(가우스-자이델의 즉시 반영 그대로). 분기가 자기 `controls.active`도 가져 게이트가 `(변환식) && (분기 식)`이면(FRAGMENT-048) 표가 앞 항을 대고 뒤 항은 앞 항이 참인 분기에서만 평가한다 — 식은 순수하므로 결과가 같다. (나) 결과 재사용: 식 게이트가 읽는 경로는 식에서 정적으로 알려지고 청사진이 이미 역의존 표를 만든다(SETTLE-017); 그 경로가 모두 게이트 없는 본체가 선언한 키(값의 있음이 다른 게이트에 달리지 않는 키)이고 이번 정착의 재계산 목록에 닿지 않았으면 그 게이트의 값은 직전 커밋의 평가와 같으므로 다시 쓴다 — BLUEPRINT-007의 (a)를 "무조건 있는 본체 키만 읽는 게이트"로 읽은 것이며, 켜진 조각이 많은 호스트의 무관한 키 입력(SETTLE-044의 U19 행)이 이것으로 분기 수와 무관해진다. 재사용은 직전 활성 집합에서 출발하는 것이 아니다: 출발점은 여전히 게이트 없는 조각이고, 재사용하는 것은 입력이 같음이 증명된 순수 함수의 값이다. 열지 않는 것: `if` 게이트는 폼이 내용을 읽지 않으므로(GOAL-034, SETTLE-044의 까닭 둘) 지금처럼 매 바퀴 평가하고, 읽는 키의 있음이 다른 게이트에 달린 식과 꼴을 알아보지 못한 식도 그렇다; 직전 커밋의 활성 집합에서 출발하는 안은 SETTLE-044가 소유자가 받아들인 최소 고정점 동작을 근거로 기각한 것이라 편집자가 열지 않는다. 절차는 65라운드대로 설계안이 먼저다: 알아보는 꼴의 정의와 알아보지 못할 때의 되돌림, 모든 게이트를 평가한 결과와 같다는 논증(평가 순서와 즉시 반영, 한 값이 여러 분기에 드는 경우의 `SHARED_NODE_CONFLICT`, 어느 분기에도 들지 않는 값, 없음·`null`·수와 문자열의 같음 판정이 식 평가와 같음, 중첩 union과 재귀 템플릿에서 발생마다의 호스트), 차등 시험(선택 표·재사용을 끈 전수 평가와 같은 형상·값·오류·배달·라운드 수), 91라운드 기준 (1)을 보이는 계수(전환 한 번의 게이트 평가 수와 표 조회 수가 분기 수와 무관), 바뀌는 파일과 87라운드의 루프 모양. 설계안이 오면 원장과 대조해 판단한다. 코드 수준 몫(빈 단계 진입, 정착 문맥 준비, 의존 처리, 잠복 등록, 읽기 계획, 선택 표의 나머지, 표시 단계의 소유자 확장, 런타임 재병합, 작은 폼의 고정 준비)은 물음 없이 변경 하나에 재측정 하나로 진행한다 — 분기 수에 비례하는 몫이 게이트 밖에도 있으므로(선택 표의 나머지와 표시 단계의 소유자 확장 16 → 121) 그것들이 없어져야 기준 (1)이 선다. 07이 권하지 않은 구조 몫 둘(출력 계산의 지연, 꺼진 조각 분석의 지연)과 다시 올리지 않은 몫(구독자 없을 때의 생략)은 그대로 두고, 개선 뒤 남은 배율을 소유자에게 보일 때 상한과 뒤집힐 항목을 함께 적는다(86C-02의 b1·b2와 같은 자리)." (`reviews/round-96-closing.md:9`)
  > 편집자 결정(97C-02): "【추론】 BLUEPRINT-017은 `controls.discriminator`의 변환을 "그 분기를 `controls: { active: \"./<key> === <value>\" }`를 가진 조각 객체로 다룬다. `enum`이면 값이 그 목록에 드는가를 본다"로 적었고 "변환된 게이트는 다른 `controls.active`와 같이 호스트 바퀴에서 평가된다"고 했으므로 판별 게이트의 같음은 `===`다. 지금 코드의 `Object.is`는 +0과 −0을 다르게 보아, 값이 −0일 때 `const: 0`인 분기를 켜지 못한다 — 검증기는 그 값을 `const: 0`에 맞다고 보므로 폼의 형상과 검증의 판단이 갈리고, 청사진의 겹침 검사는 이미 0과 −0을 같은 값으로 본다(같은 코드 안의 두 기준). 그러므로 결함이고, 귀속은 고친 파일로 `plan/07-switch/log.md` §8에 적는다(원장의 문장이 처음부터 있었다, 72C-01·78C-02의 기준). 07은 표와 재사용의 커밋보다 먼저 별도 커밋으로 고치고 시험을 붉음에서 초록으로 둔다(`const: 0`에 −0, `enum`의 0과 −0, 수 1과 문자열 `'1'`은 여전히 다름, NaN은 어느 분기도 켜지 않음). 고친 뒤에는 `===`와 목록 포함이 유한한 원시 리터럴에서 같은 답을 내므로 표의 비교 방식은 하나이고, 비교 방식별로 표를 나누는 설계는 필요하지 않다; 유한한 원시 값이 아닌 리터럴(객체, NaN 등)을 가진 게이트는 표 자격이 없고 지금의 평가로 간다." (`reviews/round-97-closing.md:16`)
- 상태: 현행
- 출처: `adr/0005-blueprint-analysis-and-node-sharing.md:80,82,84-86`(정본), `adr/0005-blueprint-analysis-and-node-sharing.md:83#1-3`(정본), `adr/0005-blueprint-analysis-and-node-sharing.md:54`, `02-target-overview.md:126`, `08-design-a-to-z.md:178`, `adr/0002-guard-fragment-model.md:75,97-100`(FRAGMENT-008과 일부 겹침)
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:11` B-22), 소유자 답(`reviews/round-12-owner-answers.md:9` 2 `&discriminator`), 소유자 답(`reviews/round-9-spec.md:20` 축2; 판별 프로퍼티는 본체), 소유자 답(`reviews/round-15-decisions.md:13` 5; `controls` 그룹 표기), 소유자 답(`reviews/round-15-decisions.md:9` 1; 식의 기준점 `./`)
- 라운드: 15
- 까닭: `adr/0005-blueprint-analysis-and-node-sharing.md:117`
- 충돌:
  > `adr/0005-blueprint-analysis-and-node-sharing.md:84`의 "결과는 청사진의 `Fragment.guard`에 든 `controls.active` 식뿐이다"는 소유자 답과 다르다: 구현의 타입 이름은 React `Fragment`와 겹치지 않는 `SchemaFragment`다(BLUEPRINT-047). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:39`).

### BLUEPRINT-018 controls.discriminator는 검증기 옵션이 아니라 예약 층 — 오늘의 자동 감지와 재선언 throw를 대체하고 이주 안내

- 결정:
  > - ajv의 `discriminator: true`는 pydantic 출력에도 throw하므로 플러그인이 켜지 못한다. `controls.discriminator`는 검증기 옵션이 아니라 폼의 예약 층이다.
  >
  > 이 규칙은 현재의 "`type`/`$ref`가 없는 `const`/`enum`이면 판별식"(`getCompositionKeyInfo.ts:33`, `getExpressionFromSchema.ts:35-51` — 두 파일이 서로를 언급하지 않은 채 같은 암묵 규칙에 기댄다)과 `COMPOSITION_PROPERTY_REDEFINITION` throw(`getCompositionNodeMapList.ts:95-105`)를 대체한다. 명시 없이 자동 감지에 기대던 스키마는 이주 안내 대상이다. 그런 스키마는 `controls.discriminator`를 더하거나 분기 안에 `if/then/else: false`를 쓴다(ADR 0010). `JSONSchema` 타입이 `kind: { const: 'a' }`를 받아들이게 하는 것은 `00-goals.md` C4.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0005-blueprint-analysis-and-node-sharing.md:88,90`(정본)
- 닫은 사람: 소유자 답(`reviews/round-12-owner-answers.md:9` 2 `&discriminator` 명시 필수 수용)
- 라운드: 12
- 까닭: `adr/0005-blueprint-analysis-and-node-sharing.md:88`

### BLUEPRINT-019 열림: controls.discriminator 변환의 세부 — $ref·allOf 평탄화, 분기 자기 controls.active와의 결합(ADR 0005 미결)

- 결정:
  > - **`controls.discriminator` 변환의 세부.** 분기에 그 키의 `const`·`enum`이 없을 때 그 분기를 어떻게 다루는가. 분기의 `$ref`와 `allOf` 항목 안의 `const`를 어디까지 찾는가(4차 E14의 평탄화와 null 분기 처리를 되살릴 것인가). 분기가 자기 `controls.active`도 가질 때 둘을 어떻게 합치는가. 회귀 표본으로는 `spikes/guard-cost/redteam3/corpus.mjs`의 14종(pydantic 2.9, OpenAPI 3.0·3.1, zod-to-json-schema 3.23, TypeBox 0.32, typescript-json-schema 0.64, 손수 쓴 `anyOf`)을 쓸 수 있다.
- 보충:
  > "`$ref`·`allOf` 평탄화, 분기 자체의 `controls.active`와의 결합(AND)은 슬라이스 1의 설계 항목이다." (`08-design-a-to-z.md:178`)
- 상태: 중복(→ FRAGMENT-048)
- 출처: `adr/0005-blueprint-analysis-and-node-sharing.md:128`(정본), `08-design-a-to-z.md:178`, `reviews/round-18-closing.md:130-140`
- 닫은 사람: 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:17`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-05)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:17`, `reviews/round-18-closing.md:142-146`
- 충돌:
  > `adr/0005-blueprint-analysis-and-node-sharing.md:128`의 "분기에 그 키의 `const`·`enum`이 없을 때 그 분기를 어떻게 다루는가."는 뒤 결정과 다르다. 일부 분기에만 없으면 그 분기가 게이트 없음이고(FRAGMENT-007, `adr/0005-blueprint-analysis-and-node-sharing.md:83`, `adr/0010-branch-conventions.md:18`), 어느 분기에도 없으면 청사진 오류다. 채택된 ADR 0014 4판이 이긴다(`adr/0014-error-policy.md:228`). 남은 열림은 `$ref`·`allOf` 평탄화와 분기가 자기 `controls.active`도 가질 때다.
  > `reviews/round-18-agenda.md:17`의 "`controls.discriminator`의 세부(분기에 그 키의 `const`·`enum`이 없을 때, `$ref`·`allOf` 평탄화, 분기 자체 `controls.active`와의 AND)"는 첫 경우를 열린 안건으로 둔다. 정본과 다르다. 정본이 이긴다(`adr/0014-error-policy.md:228`, `adr/0010-branch-conventions.md:18`).

### BLUEPRINT-020 병합표 준비 — 청사진은 준비하고 적용은 정착의 계산 단계에서 한다

- 결정:
  > 4. **병합표 준비.** §9의 규칙을 적용할 준비를 한다. 적용은 정착의 계산 단계에서 켜진 조각에 대해 한다.
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:179`(정본), `02-target-overview.md:127`, `adr/0005-blueprint-analysis-and-node-sharing.md:49`
- 닫은 사람: 편집자 결정(14라운드 설계서, `08-design-a-to-z.md:179`)
- 라운드: 14
- 까닭: `adr/0005-blueprint-analysis-and-node-sharing.md:49`

### BLUEPRINT-021 유효 스키마의 메모와 통지 — node.jsonSchema가 메모된 유효 스키마로 바뀐다

- 결정:
  > - **메모.** 유효 스키마는 활성 덧씌움 집합(그 노드에 얹힌 켜진 조각들의 집합)마다 메모한다. 같은 집합이면 같은 참조를 돌려준다.
  > - **통지.** 유효 스키마가 바뀐 노드는 통지의 배달 집합에 든다(ADR 0008). 게이트 조각이 켜지거나 꺼지면 그 조각이 덧씌운 노드가 여기에 해당한다.
  >
  > `node.jsonSchema`가 정적 값에서 메모된 유효 스키마로 바뀐다(ADR 0006, §5). `then`이 `enum`을 좁히면 select의 선택지가 바뀌어야 하기 때문이다. 유효 스키마가 바뀌면 입력 컴포넌트의 해석 결과도 바뀔 수 있다(`format`이 달라지는 경우 등).
- 보충:
  > 편집자 결정(102C-01): "【추론】 원장이 동결을 정한 자리는 둘이다: `schemaType` 참조는 동결이고(TEST-077 "그 참조는 `Object.isFrozen`이다"), 이벤트 payload는 "**불변**이다. 개발 모드에서 `Object.freeze`하며"(EVENT-024)다. 둘째가 원장의 방식이다 — 불변은 계약이고 동결은 그것을 개발 모드에서 드러내는 장치이며 운영 모드에서는 비용을 치르지 않는다. 청사진 기록 전체를 운영 모드에서 동결하는 것은 어느 항목도 정하지 않은 구현의 선택이고, 그 비용이 nested-d5 마운트의 2.13 ms(옛 판 마운트 전체의 삼분의 이)이므로 같은 방식을 적용한다. 다만 07의 (가)가 그은 "공유되는 값과 TEST-077의 값"보다 운영 모드 집합을 넓게 긋는다. 청사진은 같은 스키마 객체에서 폼 사이에 재사용되고(100C-01이 그대로 둔 것), 노드의 `jsonSchema`는 메모된 유효 스키마의 참조를 플러그인과 소비자 코드에 그대로 준다(BLUEPRINT-021). 운영 모드에서 그 참조가 동결되어 있지 않으면 한 폼의 플러그인이 한 변조가 같은 청사진을 쓰는 다른 폼으로 새고, 개발 모드의 동결은 그 플러그인을 시험하는 사람에게만 드러난다 — 라이브러리의 소비자가 쓰는 플러그인은 라이브러리의 시험 밖에 있으므로 "개발 모드에서 드러난다"가 보호가 되지 못하는 자리다. 그래서 운영 모드 동결의 집합은 (1) 공개 표면에서 참조로 닿을 수 있는 값 — 유효 스키마, `schemaType`, 그 밖에 노드나 이벤트를 통해 소비자가 참조를 받는 청사진의 값 —, (2) 기록 사이에 공유되는 값(101C-01의 조건, 공유되는 빈 배열과 접미 공유 배열)이다. (1)은 옛 판에도 없던 보호라 옛 판보다 비용이 들지만, 옛 판은 폼마다 스키마를 복사해 썼으므로(GOAL-070) 공유로 새는 길 자체가 없었다 — 새 판이 재사용으로 얻은 마운트 절감의 대가로 치러야 할 몫이다. 유효 스키마의 동결은 노드당 18.25개가 아니라 유효 스키마 하나(정규화가 한 번 만든 것)이므로 비용은 작다. 그 밖의 내부 기록 — 선언, 조각, 순서 배열, 자식 바인딩 기록, 색인 — 은 공개 표면에서 닿지 않으므로 개발 모드에서만 동결한다. 설계안은 기록 종류마다 어느 집합인지와 그 근거(공개 표면에서의 도달 경로가 있는지)를 표로 적고, 검증자가 그 도달 가능성을 코드로 대조한다 — 내부 기록인데 공개 표면에서 닿는 길이 하나라도 있으면 (1)이다. 시험: 개발 모드의 차등은 지금과 같고, 운영 모드에서 공개 표면의 값이 `Object.isFrozen`임을 단언하는 시험을 더한다(TEST-077의 `schemaType` 시험을 유효 스키마로 넓힘). 변경 하나에 재측정 하나는 그대로이고, 일의 횟수 보고가 든 나머지(초기 revision 슬롯 읽기, 선언의 1회 수집, 조각 평탄화의 O(F²), 조상 경로·order 복사, `oneOf`의 게이트·경로·투영 읽기 재사용)는 상한 순서로 간다." (`reviews/round-102-closing.md:9`)
- 상태: 현행
- 출처: `adr/0005-blueprint-analysis-and-node-sharing.md:109-110`(정본), `adr/0005-blueprint-analysis-and-node-sharing.md:123#1-3`, `adr/0005-blueprint-analysis-and-node-sharing.md:13`
- 닫은 사람: 편집자 결정(10라운드 5차 본문, `adr/0005-blueprint-analysis-and-node-sharing.md:13` "유효 스키마의 메모와 통지를 적었다"), 소유자 답(`reviews/round-9-spec.md:23` 축5; `node.jsonSchema`는 유효 스키마)
- 라운드: 10
- 까닭: `adr/0005-blueprint-analysis-and-node-sharing.md:123`

### BLUEPRINT-022 controls의 식 컴파일과 역의존 표

- 결정:
  > 6. **`controls`의 식 컴파일과 역의존 표.** 식이 읽는 경로를 정적으로 뽑아 역의존 표(경로 → 그 경로를 읽는 식을 가진 노드)를 만든다. 표시 단계는 쓰기 노드의 조상과 그 역의존 노드의 조상을 재계산 목록에 넣는다. 뽑을 수 없는 식은 `controls.watch`로 작성자가 적는다(오늘의 의존 경로 구독과 같은 역할).
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:181`(정본)
- 닫은 사람: 편집자 결정(15라운드 설계서, `08-design-a-to-z.md:181`)
- 라운드: 15
- 까닭: `08-design-a-to-z.md:181`

### BLUEPRINT-023 열림: 종류가 조건에 따라 바뀌는 슬롯과 값 union

- 결정:
  > - **종류가 조건에 따라 바뀌는 슬롯.** `type: ['string', 'number']`, 원시 타입끼리의 `anyOf`. nullable 말고는 아직 다루지 않았다. 값 union(`oneOf: [string, object]`)도 청사진 모델 밖이다.
- 보충: 없음
- 상태: 대체됨(→ BLUEPRINT-031)
- 출처: `adr/0005-blueprint-analysis-and-node-sharing.md:130`(정본), `reviews/round-18-closing.md:57-82`
- 닫은 사람: 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:14`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-02)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:14`, `reviews/round-18-closing.md:84-91`

### BLUEPRINT-024 열림: $ref 재귀 스키마에서 조각의 정적 열거가 끝나는 곳

- 결정:
  > - `$ref`의 재귀 스키마에서 조각의 정적 열거가 어디서 끝나는가. 현재 `$ref` 해석 깊이의 기본값은 1이다(`getResolveSchema.ts:18-28`).
- 보충: 없음
- 상태: 대체됨(→ BLUEPRINT-030)
- 출처: `adr/0005-blueprint-analysis-and-node-sharing.md:132`(정본), `reviews/round-18-closing.md:15-33,43-51`
- 닫은 사람: 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:13`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-01)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:13`, `reviews/round-18-closing.md:35-41`

### BLUEPRINT-025 ADR 0005 합의 근거 — 소유자 발언 원문 모음

- 결정:
  > - 같은 이름 + 같은 타입이면 노드 하나를 공유한다 — 소유자: "동의합니다."
  > - 타입이 다르면 오류 — 소유자: "타입이 달라버리면 우리로서는 답이 없지만(이 경우엔 오류가 throw 되겠지)." 개정분은 이 오류를 둘로 가른다. 게이트 없는 선언끼리의 충돌은 분석 단계(청사진)의 오류이고, 게이트에 달린 선언이 실제로 동시에 켜진 충돌은 정착의 오류다(§3의 표). 경고가 아니라 오류로 드러내는 것은 14라운드 O-10 소유자 답("경고만 일어나고 동작하는것처럼 보이는게 더 위험합니다")이다. 드러남의 환경 규칙은 17라운드 소유자 답 R17-1 나("망가진 값을 올리는게 더 위험하겠다")로 정해졌다: 모든 환경에서 던지고 `degraded` 동안 제출을 거부한다.
  > - `controls.discriminator`는 예외적 허용이며 분기 스키마를 고치지 않는다 — 소유자(22): "동의합니다. 이 경우에 대한 예외적 허용을 하죠. … 우리는 "&active": 을 더하는거지 스키마를 수정하는건 아니니까".
  > - 병합표 — 소유자(7): "세부적인 규칙이 포괄적인 규칙을 덮는 기존 관례를 따릅니다". (16·17): 예. (18): "깊은 병합을 했으면 합니다. … 이때는 common-utils 의 merge 를 쓰죠". (12): "props 로 전달되는 글로벌 값이 개별 값을 덮도록 하는게 맞습니다. rootJSONSchema 도 props 와 동치". (13): "글로벌과 로컬만 보고, 중간단계 상태 상속은 구현을 하지 않으려고 합니다". (13라운드 1, 12를 개정): "글로벌 readOnly 나 disabled 같은 개념은 없애고 모든 control 필드는 자체 노드만 지원. children 그룹은 예외." (13라운드 3): "제어용 필드들에 대해서만 &를 붙이는 방향으로 가자."
- 보충: 없음
- 상태: 현행(기록)
- 출처: `adr/0005-blueprint-analysis-and-node-sharing.md:115-118`(정본)
- 닫은 사람: 소유자 답(`adr/0005-blueprint-analysis-and-node-sharing.md:115-116`; 유일한 기록, 초판 커밋 ab41d790d부터 있고 reviews에는 없음), 소유자 답(`reviews/round-14-owner-answers.md:16` O-10), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-10-owner-answers.md:11,12,20,22,25,26,27` B-22·B-12·D-7·D-17·E-13·E-16·E-18), 소유자 답(`reviews/round-13-owner-answers.md:7,9` 1 잠금 규칙·3 폼 전용 키 접두)
- 라운드: 17
- 까닭: `adr/0005-blueprint-analysis-and-node-sharing.md:115-118`

### BLUEPRINT-026 되돌림 가능성

- 결정:
  > 청사진의 구체적 형태는 내부 구조여서 바꾸기 쉽다. 노드 공유 규칙은 값 보존 동작을 정하므로 공개 후에는 바꾸기 어렵다. `controls.discriminator`는 예약 층의 공개 키이므로 들이면 되돌리기 어렵다.
- 보충:
  > 편집자 결정(25C-06): "【추론】 BLUEPRINT-002의 스케치(`guard`·`constrains`·`inherited`)와 BLUEPRINT-017의 "`SchemaFragment.guard`에 든 `controls.active` 식"은 뜻의 서술이며, 02의 `src/core/blueprint/type.ts`(`SchemaFragment`의 `gates`·`overlays`·`inheritedOverlays`, 숫자 `id`, 게이트 `{ kind: 'if' | 'active' | 'discriminator', condition }`)가 그 구현이다(BLUEPRINT-026)." (`reviews/round-25-closing.md:58`)
- 상태: 현행(기록)
- 출처: `adr/0005-blueprint-analysis-and-node-sharing.md:138`(정본)
- 닫은 사람: 편집자 결정(`adr/0005-blueprint-analysis-and-node-sharing.md:138`), 소유자 답(`reviews/round-15-decisions.md:13` 5; `controls` 표기)
- 라운드: 15
- 까닭: `adr/0005-blueprint-analysis-and-node-sharing.md:138`

### BLUEPRINT-027 대체됨: 배타가 구조로 보장되지 않으면 분석 단계에서 throw

- 결정:
  > (b) "배타가 구조로 보장되지 않으면 분석 단계에서 throw"를 없앴다 — 이 규칙은 ADR 0002가 필수 지원이라 한 `allOf: [{ if k=a then v:string }, { if k=b then v:number }]`를 거부했고, "같은 `oneOf`의 분기끼리는 배타"라는 가정은 런타임에 성립하지 않았다.
- 보충:
  > "종류가 다른 선언의 충돌은 런타임에 드러낸다." (`adr/0005-blueprint-analysis-and-node-sharing.md:10`)
- 상태: 대체됨(→ BLUEPRINT-012, BLUEPRINT-013)
- 출처: `adr/0005-blueprint-analysis-and-node-sharing.md:10#3`(정본)
- 닫은 사람: 편집자 결정(1라운드 R11 반영, `adr/0005-blueprint-analysis-and-node-sharing.md:10`)
- 라운드: 1
- 까닭: `adr/0005-blueprint-analysis-and-node-sharing.md:10`

### BLUEPRINT-028 대체됨: 제약의 교차가 공집합이어도 throw하지 않는다(1라운드)

- 결정:
  > (d) 제약의 교차가 공집합이어도 throw하지 않는다.
- 보충:
  > "**정적 연언(본체와 게이트 없는 `allOf`)의 교차가 공집합이면 청사진 오류로 throw하고, 켜진 `then`과의 런타임 교차가 공집합이면 throw하지 않고 검증기가 값을 기각한다(원장 §5).**" (`adr/0005-blueprint-analysis-and-node-sharing.md:76`)
- 상태: 대체됨(→ BLUEPRINT-016)
- 출처: `adr/0005-blueprint-analysis-and-node-sharing.md:10#6`(정본)
- 닫은 사람: 편집자 결정(1라운드 R11 반영 (d), `adr/0005-blueprint-analysis-and-node-sharing.md:10`)
- 라운드: 1
- 까닭: `adr/0005-blueprint-analysis-and-node-sharing.md:76`

### BLUEPRINT-029 대체됨: 판별식의 식별(E14)과 union 호스트의 판별 프로퍼티 소유(E8)

- 결정:
  > §4 판별식의 식별(E14)과 "판별 프로퍼티 k는 union 호스트가 소유"(E8)를 지우고, 그 자리에 명시 판별 `&discriminator`의 변환을 적었다.
- 보충:
  > "(c) 판별식을 "기본 프로퍼티의 재선언"이 아니라 **분기 집합으로부터** 식별한다." (`adr/0005-blueprint-analysis-and-node-sharing.md:10`)
  > "4차 §4의 판별식 식별(E14)은 지워졌다." (`adr/0005-blueprint-analysis-and-node-sharing.md:3`)
- 상태: 대체됨(→ BLUEPRINT-017)
- 출처: `adr/0005-blueprint-analysis-and-node-sharing.md:13#2`(정본), `adr/0005-blueprint-analysis-and-node-sharing.md:3,10`
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:11` B-22)
- 라운드: 10
- 까닭: `adr/0005-blueprint-analysis-and-node-sharing.md:80`

### BLUEPRINT-030 `$ref` 재귀의 정적 열거와 무한 형상 — 위치마다 한 번, 조각 안 순환 절단, 객체 프로퍼티만의 순환은 청사진 오류, 원본 없는 사슬의 되풀이는 정착 오류

- 결정:
  > 【추론】 규칙은 지금 정한다.
  > 【추론】 청사진은 작성 루트에서 닿는 스키마 위치마다 한 번만 만든다.
  > 【추론】 `$ref`는 작성 루트 안의 대상 위치(JSON Pointer)로 풀고, 이미 분석한 위치는 다시 분석하지 않고 그 분석을 가리킨다.
  > 【추론】 위치는 유한하므로 분석은 언제나 끝난다.
  > 【추론】 위치마다 한 번인 것은 그 위치가 스스로 선언하는 조각 표이고, 조상에서 귀속되는 `inherited`는 가리키는 쪽 청사진이 든다.
  > 【추론】 한 호스트의 조각을 열거할 때 `$ref`의 대상이 지금 열거 중인 조각 경로에 이미 있으면(조각 안의 순환) 그 자리는 더 펼치지 않는다.
  > 【추론】 펼쳐도 같은 선언이 더 깊은 중첩으로 되풀이될 뿐이어서 존재(합집합)가 바뀌지 않기 때문이다.
  > 【추론】 자식(`properties`·`items`·`prefixItems`)으로 넘어가는 참조는 그 자식 위치의 청사진을 가리킨다.
  > 【추론】 노드는 형상과 값을 따라 만들고, 배열 아이템은 값의 길이만큼만 만든다(SCHEMA-004의 지연 해석).
  > 【추론】 객체 프로퍼티만으로 이어진 순환에서 모든 마디가 게이트 없는 선언이고 터미널 전략인 노드가 하나도 없으면 형상이 무한하므로 청사진 오류(가칭 `JSON_SCHEMA_ERROR.RECURSIVE_SHAPE_UNBOUNDED`)다.
  > 【추론】 순환을 끊는 것은 배열 아이템, 게이트(조각·노드·`children` 항목), 터미널 전략 셋이며, nullable은 끊지 않는다(비객체 호스트의 자식도 형상에 있다, VALUE-015).
  > 【추론】 게이트로 끊긴 순환은 게이트가 원본 없는 값에서 거짓일 때만 끝난다(`if`는 공허한 참일 수 있다, FRAGMENT-023).
  > 【추론】 정착에서 노드를 만들 때 같은 청사진 위치가 원본 없는 조상 사슬에서 되풀이되어 앞 되풀이와 게이트 문맥이 같으면(사슬 길이가 순환 안 식·가드의 가장 긴 상대 경로 `..` 수 이상), 그 아래는 끝나지 않는 형상으로 보고 만들지 않으며 정착 오류(가칭 `SCHEMA_FORM_ERROR.RECURSIVE_SHAPE_DIVERGED`, `diagnostics.cause: 'budget'`, 새 `exceededBudget` 값 (가칭) `'recursion'`, 모든 환경 사슬 끝 throw, `degraded`)로 드러낸다(D-2 '고정점이 없는 스키마는 지원 범위 밖, degraded로 관측'과 같은 모양, R17-1).
  > 【추론】 청사진 오류와 정착 오류는 검색으로 가려지도록 이름을 달리한다.
- 보충:
  > 편집자 결정(26C-07): "【추론】 SETTLE-045의 L(선언한 호스트와 식이 읽는 모든 경로의 자리를 함께 덮는 가장 낮은 공통 조상 호스트)은 발생의 절대 호스트 경로에 대한 함수이므로, 한 청사진 위치가 여러 깊이에서 발생하는 재귀 참조 템플릿에서는 발생마다 다를 수 있다." (`reviews/round-26-closing.md:76`)
  > 편집자 결정(26C-07): "【추론】 발생마다의 L은 정착이 그 게이트를 가진 노드를 만들 때 한 번 계산해 메모하고, 바퀴마다 다시 계산하지 않는다." (`reviews/round-26-closing.md:78`)
  > 편집자 결정(78C-02): "【추론】 BLUEPRINT-030은 재귀의 규칙을 온전히 적었다: 청사진은 위치마다 한 번 만들고, 노드는 형상과 값을 따라 만들며 배열 아이템은 값의 길이만큼만 만들고, 순환을 끊는 것은 배열 아이템·게이트·터미널 전략 셋이며, 정착 오류가 되는 것은 "원본 없는 사슬의 되풀이"뿐이다. `$ref: "#"`인 배열 아이템 아래로 값이 있는 만큼 자라는 것은 원본이 있는 확장이고 배열 아이템이 순환을 끊는 자리이므로, 정착이 그 확장을 `RECURSIVE_SHAPE_DIVERGED`로 막는 것은 규칙과 다른 03(`settle`)의 결함이다. 72C-01의 "근사"는 원장이 PR-7에 둔 통로가 없어서 자리를 비워 둔 경우였고 여기는 규칙이 다 있었으므로 그와 다르다; 42라운드가 06에서 찾은 03 결함을 적은 선례대로 03에 귀속해 적는다(`plan/07-switch/log.md`의 "앞 단계 결함" 절, 재현 스키마와 함께). 07의 렌더 시나리오가 닿으므로 49C-01대로 07이 고친다: `hasRecursiveExpansion`의 판정을 "원본 없는 사슬의 되풀이"로 좁히고(값이 있는 아이템 아래의 확장은 통과, 배열 아이템·게이트·터미널이 끊는 자리임을 판정에 반영), 별도 커밋으로 재귀 배열 아이템이 자라는 사례와 원본 없는 되풀이가 여전히 정착 오류인 사례를 짝으로 더한다. 가상화의 자리표시 결함(앞 행 `remove` 뒤 이미 드러난 필드가 옮겨 간 자리에서 다시 자리표시가 됨)은 기대 변경의 근거가 없으므로 결함이 맞고, 07이 진단해 06의 가상화 기록(드러난 기록은 identity가 이어지는 노드에 따라감, WRITE-045)과 07의 바인딩 가운데 어느 쪽인지 같은 절에 귀속을 적고 고친다." (`reviews/round-78-closing.md:16`)
  > 편집자 결정(92C-01): "【추론】 BLUEPRINT-030이 정착 오류로 끊는 것은 "같은 청사진 위치가 원본 없는 조상 사슬에서 되풀이"되는 경우이고, 그 규칙이 막으려는 것은 형상이 주어진 값이 아니라 선언만으로 끝없이 자라는 것이다(D-2 "고정점이 없는 스키마는 지원 범위 밖, degraded로 관측"). 18라운드는 배열 아이템이 "값의 길이만큼만" 생긴다는 데서 배열이 순환을 끊는다고 보았으나, 배열 호스트의 `default`가 아이템을 만들고 그 아이템이 같은 위치를 다시 품으면 길이를 대는 것이 값이 아니라 선언이므로 순환이 끊기지 않는다 — 원장이 미리 보지 못한 자리다. WRITE-082가 "D의 키는 해당 자식의 원본이 된다"고 한 것은 분배 뒤 그 값이 `raw`에 든다는 상태의 서술이고, BLUEPRINT-030의 "원본 없는"은 그 사슬을 낳은 것이 호출자의 값인가를 묻는 것이므로 둘은 다른 물음이다. 그래서 정한다: BLUEPRINT-030의 판정에서 원본은 호출자가 준 값(로드의 V, 쓰기, 입력)이고, 이번 정착에서 호스트 채움 값 D가 분배해 생긴 값과 그 값이 낸 노드는 원본 없는 사슬의 마디다; D가 그 자리를 명시로 닫으면(`default: [{ next: [] }]`처럼 되풀이되는 키에 값을 주면) 자손이 없음이 아니어서 채움이 없고 사슬은 거기서 끝난다. 값이 있는 재귀 배열이 값만큼 자라는 것(78C-02)은 그대로 통과다. 07의 새 판정은 이 규칙의 구현으로 인정하며 코드와 진단 값은 같은 것을 쓴다(`RECURSIVE_SHAPE_DIVERGED`, `cause: 'budget'`, `exceededBudget: 'recursion'`). 다만 "원본 없는"의 판별은 하나여야 한다 — 기존 판정과 새 판정이 같은 판별 함수를 쓰게 하거나 한 판정으로 합치고, 정의를 `settle`의 DETAIL에 한 번 적는다; 두 판정이 서로 다른 뜻의 원본을 가지면 다음에 같은 구멍이 난다. 시험은 짝으로 둔다: 값이 있는 재귀 배열의 확장(통과), `default`만의 되풀이(정착 오류), D가 되풀이 키를 명시로 닫은 사례(정상 종료), 객체 D 안의 같은 되풀이. 귀속은 앞 단계 결함이 아니라 원장의 빈 곳이며 이 결정이 메운다. 90C-01의 문장 "BLUEPRINT-030의 '원본 없는 사슬의 되풀이는 정착 오류'가 그대로 끊는다"는 규칙으로는 맞고 그때의 코드로는 틀렸으므로 90라운드 닫기 문서에 덧붙임으로 적는다." (`reviews/round-92-closing.md:9`)
  > 편집자 결정(92C-02): "【추론】 BLUEPRINT-030은 앞 되풀이와 게이트 문맥이 같다고 볼 조건을 "사슬 길이가 순환 안 식·가드의 가장 긴 상대 경로 `..` 수 이상"으로 적었다. 청사진 전체 템플릿의 최댓값은 순환 안의 최댓값보다 작지 않으므로 그 값으로 끊으면 "이상"을 만족하고, 원장이 허용하는 것보다 일찍 끊는 일이 없다 — 늦게 끊어 되풀이를 몇 번 더 만들 뿐이며 그 비용은 어차피 정착 오류로 끝나는 스키마에서만 든다. 그러므로 순환 안으로 좁히는 것은 요구하지 않는다. 조건은 둘이다: 92C-01대로 기존 판정과 새 판정이 같은 길이 계산을 쓰고(한쪽은 순환 안, 다른 쪽은 전체로 갈리지 않게), 그 값은 청사진마다 한 번 계산해 메모한다(87라운드의 원칙; 07이 말한 청사진별 메모가 그것이다). 메시지는 기존과 같은 문구로 맞춘다." (`reviews/round-92-closing.md:16`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:15-27,30`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-01)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:35-41`

### BLUEPRINT-031 값 union — 원시 타입만의 `type` 배열은 (가칭) `union` 잎 하나, `interpret`는 선언 순서의 S1 변환, 기본 문자열 입력, 섞인 union과 `type` 없는 원시 `anyOf`·`oneOf`는 청사진 오류, PR-1 인식·PR-2 행

- 결정:
  > 【추론】 (1) 범위와 종류: 선언 하나의 `type`이 원시 타입(`string`·`number`·`integer`·`boolean`·`null`)만의 배열이면 잎 노드 하나가 된다.
  > 【추론】 `null`은 빼서 nullable 플래그로 두고, `integer`는 `number`로 접는다(BLUEPRINT-009).
  > 【추론】 접은 집합의 원소가 둘 이상이면 새 종류 (가칭) `union`의 노드이고 행은 `terminal` 하나다(`BEHAVIORS.union.terminal`).
  > 【추론】 원소가 하나면 그 원시 종류다(`['string','null']`은 nullable string, `['integer','number']`는 number).
  > 【추론】 (2) 같은 종류: `union` 노드끼리는 접은 집합이 같을 때만 같은 종류다.
  > 【추론】 다른 종류의 선언과 같은 이름이면 BLUEPRINT-011·012의 충돌 규칙을 따른다.
  > 【추론】 (3) `interpret`: 값이 나열된 타입 가운데 하나에 맞으면 그대로 둔다.
  > 【추론】 아니면 S1의 변환(ajv `coerceTypes`의 부분집합, `reviews/round-18-owner-answers.md:9`)을 `type`의 선언 순서대로 시도하고, 처음 성공한 것을 쓴다(ajv의 다중 타입 규칙).
  > 【추론】 모두 실패하면 받은 그대로 들고 S1의 경고등을 켠다.
  > 【추론】 정합은 값이 나열된 타입 가운데 하나라는 뜻이다.
  > 【추론】 (4) 입력: 패키지의 기본 입력 정의는 `union` 노드를 문자열 입력으로 그리고, 입력한 글은 (3)의 parse가 해석한다.
  > 【추론】 그래서 `string`이 목록에 있으면 입력한 글은 문자열 그대로 남고, 없으면(예: `['number','boolean']`) 선언 순서대로 바뀐다.
  > 【추론】 다른 입력은 작성자가 `formTypeInputMap`이나 인라인 입력으로 고른다.
  > 【추론】 (5) 청사진 오류: `object`·`array`가 원시 타입과 섞인 값 union(`type` 배열이거나, 자기 `type` 없이 분기의 `type`이 섞인 `oneOf`·`anyOf`)과, null 분기를 빼고도 종류가 둘 이상인데 자기 `type`이 없는 원시 `anyOf`·`oneOf`는 청사진 오류다(`JSON_SCHEMA_ERROR.UNKNOWN_JSON_SCHEMA`, ADR 0014 §7.1의 "지원하지 않는 `type`", 오늘과 같은 코드).
  > 【추론】 원시 `anyOf`·`oneOf`의 작성자는 슬롯에 `type` 배열을 더하면 되고, 이는 검증 결과를 바꾸지 않는다.
  > 【추론】 (7) PR 배치: 청사진이 `union` 종류를 알아보는 것은 PR-1이다(청사진이 종류를 정한다).
  > 【추론】 `union` 동작 행(`interpret`, `terminal` 전략)은 다른 잎 행과 함께 PR-2다(LANDING-062의 행 목록).
  > 【추론】 종류 모듈 목록에는 (가칭) `unionBehavior/`가 더해진다.
- 보충:
  > 소유자(12-9 답): "같은 종류 맞습니다." (`reviews/round-18-owner-answers.md:19`)
- 상태: 분할됨(→ BLUEPRINT-034, BLUEPRINT-033)
- 출처: `reviews/round-18-closing.md:57-60,64-74,78-80`(정본), `reviews/round-18-owner-answers.md:19`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-02), 소유자 답(`reviews/round-18-owner-answers.md:19` 12-9; `integer`·`null` 접기), 소유자 답(`reviews/round-18-owner-answers.md:24` 18C 검토 1번; 대체)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:84-91`

### BLUEPRINT-032 노드의 종류 — 일곱(string·number(`integer` 포함)·boolean·null·object·array·(가칭) `union`), nullable은 플래그, type 없는 overlay는 어느 종류와도 맞음

- 결정:
  > 【추론】 그래서 노드의 종류는 일곱이다: string, number(`integer` 포함), boolean, null, object, array, (가칭) `union`.
  > nullable은 종류가 아니라 노드의 플래그이고, `type`이 없는 overlay(`{ const }`, `{ enum }`, `{ minimum }`)는 어느 종류와도 맞는다(BLUEPRINT-009 그대로).
  > 【추론】 12-9가 확인한 것은 같은 종류의 접기(`number`와 `integer`, `['string','null']`과 `'string'`)이지 종류의 수가 아니다.
- 보충:
  > 소유자(12-9 답): "같은 종류 맞습니다." (`reviews/round-18-owner-answers.md:19`)
  > "nullable(`type: ['string', 'null']`, `nullable: true`, null 분기와의 `anyOf`/`oneOf` — 현재 `helpers/jsonSchema/isNullBranch`가 알아본다)은 종류가 아니라 노드의 플래그다." (`adr/0005-blueprint-analysis-and-node-sharing.md:62`)
  > "(a) "같은 타입"을 타입 표기의 동일성이 아니라 **같은 노드 종류**로 다시 정의했다 — `number`와 `integer`, `['string','null']`과 `'string'`은 배타가 아니다." (`adr/0005-blueprint-analysis-and-node-sharing.md:10`)
  > 반영 칸(18C 검토 6번, 종류 이름): "원시 타입만의 다중 `type` 잎의 종류 이름은 `union`으로 확정하고 가칭을 푼다(가드 `isUnionNode`, 동작 모듈 `unionBehavior/`)." (`reviews/round-18-owner-answers.md:28`)
  > 편집자 결정(18C-90): "【추론】 A(d)의 기본은 d 자신의 `type`(문자열이나 배열)의 원소이고, `nullable: true`는 같은 객체에 `type`이 있을 때만 `'null'`을 더하며, `'null'`만 받는 분기는 `{null}`이다." (`reviews/round-18-closing.md:2382`)
  > 편집자 결정(18C-90): "【추론】 A = `{null}`이면 null 종류이고 `nullable: true`이다." (`reviews/round-18-closing.md:2385`)
  > 편집자 결정(18C-90): "【추론】 nullable은 `'null'` ∈ A와 같다." (`reviews/round-18-closing.md:2387`)
  > 편집자 결정(18C-90): "【추론】 형 있는 칸의 null 분기는 nullable을 켜지 않고, 유효 목록을 좁히지 않는다." (`reviews/round-18-closing.md:2399`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:61-63`(정본), `reviews/round-18-owner-answers.md:19`, `reviews/round-18-closing.md:2382,2385,2387,2399`, `reviews/round-18-owner-answers.md:29`, `reviews/round-18-closing.md:2951`, `reviews/round-18-owner-answers.md:31`
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:19` 12-9; 같은 종류 접기), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-02; 종류의 수), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-90), 소유자 답(`reviews/round-18-owner-answers.md:29` union 범위; 범위), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105), 소유자 답(`reviews/round-18-owner-answers.md:31` union O1; 종류의 수)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:84-91`, `reviews/round-18-closing.md:2466-2471`
- 충돌:
  > `adr/0005-blueprint-analysis-and-node-sharing.md:62`의 "노드의 **종류**는 여섯이다: string, number(`integer` 포함), boolean, null, object, array."는 18라운드 결정과 다르다: (가칭) `union`이 더해져 종류는 일곱이다(BLUEPRINT-032). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:61`).
  > `08-design-a-to-z.md:177`의 "같은 이름·같은 종류(string, number, boolean, null, object, array)면"는 18라운드 결정과 다르다: 종류 목록에 (가칭) `union`이 든다(BLUEPRINT-032). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:61`).
  > `02-target-overview.md:125`의 "같은 이름과 같은 종류(string, number, boolean, null, object, array)이면"는 18라운드 결정과 다르다: 종류 목록에 (가칭) `union`이 든다(BLUEPRINT-032). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:61`).
  > `reviews/round-18-closing.md:61`의 "(가칭) `union`"은 소유자 답과 다르다: 종류 이름 `union`은 확정이고 가칭이 아니다(BLUEPRINT-035). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:28`).
  > `reviews/round-18-owner-answers.md:28`의 "원시 타입만의 다중 `type` 잎"은 소유자 답과 다르다: `union`은 `type`에 원시·객체·배열 가운데 둘 이상의 종류가 적힌 칸의 터미널 잎이다(BLUEPRINT-036). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:29`).
  > `reviews/round-18-closing.md:61`의 "그래서 노드의 종류는 일곱이다"는 소유자 답과 다르다: `node.type`의 값은 `virtual`을 포함해 여덟이고(NODE-057), 18C-02의 "일곱"은 스키마에서 오는 종류만 센 것이다(WRITE-099). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:31`).

### BLUEPRINT-033 `union` 노드의 목적·해석·입력 계약·기본 입력 — 형을 고르는 기능이 아님, 받아 줄 형이 정확히 하나일 때만 변환, 선언 순서·검증기 규칙을 쓰지 않음, 기본 입력은 문자열 입력 그대로

- 결정:
  > `union` 노드의 목적은 원시 타입이 여럿인 필드를 폼이 받아들이는 것이며, 값의 형을 사용자가 고르게 하는 기능이 아니다.
  > 형을 고르게 하는 요구는 조건부 스키마(`if`-`then`-`else`, `controls.active`)로 표현한다.
  > `union` 노드의 해석은 값이 목록의 한 형이면 그대로 두고, 아니면 변환 목록(WRITE-075)으로 받아 줄 형이 정확히 하나일 때만 그 형으로 바꾸며, 받아 줄 형이 없거나 둘 이상이면 받은 그대로 두고 경고등을 켠다.
  > 이 해석은 `type`의 선언 순서도 검증기 플러그인의 규칙도 쓰지 않으며, 단일 타입 노드의 변환은 목록이 하나인 경우다.
  > `union` 노드의 입력은 목록의 한 형의 값이나 없음을 보내며, 어떤 형을 보낼지는 입력 구현(UI 플러그인)이 정하고 목록은 `node.jsonSchema.type`에서 읽는다.
  > 기본 입력 정의(`formTypeDefinitions`, UI 플러그인이 없을 때의 최소 구현)는 문자열 입력을 그대로 쓰고 새 입력을 두지 않으며, 친 글은 위 해석을 거친다.
- 보충:
  > 소유자(18C 검토 1번): "이제 서로 다른 type 노드는 사용하는 동작이 다를 뿐, 노드 클래스 자체가 다르지 않아서 이게 가능한건가? 근데 jsonSchema 상에선 이해가 가는데, 입력 form 입장에선 이걸 어떻게 구분하면 좋을까? 어차피 node 가 값의 타입을 고정하지 않으니까 상관없나...??" (`reviews/round-18-owner-answers.md:24`)
  > 소유자(18C 검토 1번): "이 union 노드는 나도 넣고싶었는데 설계를 못했던 부분인데, 어떻게 넣고 어떤 행위를 허용할지 설명을 원하는구나" (`reviews/round-18-owner-answers.md:24`)
  > 소유자(18C 검토 1번): "1번, ajv는 항상 존재하는게 아닙니다. 플러그인이라, 이를 form 기본기능에서 많이 쓰는건 완결성을 훼손합니다." (`reviews/round-18-owner-answers.md:24`)
  > 소유자(18C 검토 1번): "지금 이야기만으로는 라1에서는 A 규칙 말곤 선택이 불가능한데...." (`reviews/round-18-owner-answers.md:24`)
  > 소유자(18C 검토 1번): "그리고 오해한게 있는데 formTypeDefininitions 는 ui가 없는 경우를 위한 최소구현이야. 그러니까 여기에 구현을 해봤자 실제 사용자에게 이게 노출될 가능성은 높지 않다." (`reviews/round-18-owner-answers.md:24`)
  > 소유자(18C 검토 1번): "그리고 ui에서 선택하게 하는건 우리 목적과 달라. 그런 니즈라면 if-then-else 나 control.active 를 써야지. 지금 말한건 오버스팩같구나." (`reviews/round-18-owner-answers.md:24`)
  > 소유자(18C 검토 1번): "정련안으로 확정. 기록하고 반영해." (`reviews/round-18-owner-answers.md:24`)
- 상태: 분할됨(→ BLUEPRINT-042, BLUEPRINT-040, WRITE-099)
- 출처: `reviews/round-18-owner-answers.md:24`(정본, 반영 칸), `reviews/round-18-closing.md:2952`
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:24` 18C 검토 1번), 소유자 답(`reviews/round-18-owner-answers.md:35` union O5; 대체), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-92), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:24`

### BLUEPRINT-034 값 union에서 그대로인 것 — 원시 타입만의 `type` 배열은 `union` 잎 하나, 정합은 나열된 타입 가운데 하나, 기본 문자열 입력, 섞인 union과 `type` 없는 원시 `anyOf`·`oneOf`는 청사진 오류, PR-1 인식·PR-2 행

- 결정:
  > 【추론】 (1) 범위와 종류: 선언 하나의 `type`이 원시 타입(`string`·`number`·`integer`·`boolean`·`null`)만의 배열이면 잎 노드 하나가 된다.
  > 【추론】 `null`은 빼서 nullable 플래그로 두고, `integer`는 `number`로 접는다(BLUEPRINT-009).
  > 【추론】 접은 집합의 원소가 둘 이상이면 새 종류 (가칭) `union`의 노드이고 행은 `terminal` 하나다(`BEHAVIORS.union.terminal`).
  > 【추론】 원소가 하나면 그 원시 종류다(`['string','null']`은 nullable string, `['integer','number']`는 number).
  > 【추론】 (2) 같은 종류: `union` 노드끼리는 접은 집합이 같을 때만 같은 종류다.
  > 【추론】 다른 종류의 선언과 같은 이름이면 BLUEPRINT-011·012의 충돌 규칙을 따른다.
  > 【추론】 (3) `interpret`: 값이 나열된 타입 가운데 하나에 맞으면 그대로 둔다.
  > 【추론】 정합은 값이 나열된 타입 가운데 하나라는 뜻이다.
  > 【추론】 (4) 입력: 패키지의 기본 입력 정의는 `union` 노드를 문자열 입력으로 그리고, 입력한 글은 (3)의 parse가 해석한다.
  > 【추론】 다른 입력은 작성자가 `formTypeInputMap`이나 인라인 입력으로 고른다.
  > 【추론】 (5) 청사진 오류: `object`·`array`가 원시 타입과 섞인 값 union(`type` 배열이거나, 자기 `type` 없이 분기의 `type`이 섞인 `oneOf`·`anyOf`)과, null 분기를 빼고도 종류가 둘 이상인데 자기 `type`이 없는 원시 `anyOf`·`oneOf`는 청사진 오류다(`JSON_SCHEMA_ERROR.UNKNOWN_JSON_SCHEMA`, ADR 0014 §7.1의 "지원하지 않는 `type`", 오늘과 같은 코드).
  > 【추론】 원시 `anyOf`·`oneOf`의 작성자는 슬롯에 `type` 배열을 더하면 되고, 이는 검증 결과를 바꾸지 않는다.
  > 【추론】 (7) PR 배치: 청사진이 `union` 종류를 알아보는 것은 PR-1이다(청사진이 종류를 정한다).
  > 【추론】 `union` 동작 행(`interpret`, `terminal` 전략)은 다른 잎 행과 함께 PR-2다(LANDING-062의 행 목록).
  > 【추론】 종류 모듈 목록에는 (가칭) `unionBehavior/`가 더해진다.
- 보충:
  > 소유자(12-9 답): "같은 종류 맞습니다." (`reviews/round-18-owner-answers.md:19`)
- 상태: 분할됨(→ BLUEPRINT-043, BLUEPRINT-036, BLUEPRINT-037, BLUEPRINT-039, BLUEPRINT-044, REACT-032, BLUEPRINT-042)
- 출처: `reviews/round-18-closing.md:57-60,64-66,69-70,72-74,78-80`(정본), `reviews/round-18-owner-answers.md:19`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-02), 소유자 답(`reviews/round-18-owner-answers.md:19` 12-9; `integer`·`null` 접기), 소유자 답(`reviews/round-18-owner-answers.md:29` union 범위; 대체), 소유자 답(`reviews/round-18-owner-answers.md:30` union 형 없는 분기; 대체), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-90), 소유자 답(`reviews/round-18-owner-answers.md:36` union O6; 대체), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-92)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:84-91`

### BLUEPRINT-035 용어 — `union` 확정(가칭 풂, `isUnionNode`·`unionBehavior/`), `oneOf`·`anyOf` 분기를 가진 호스트는 variant 호스트, 분기 하나는 variant

- 결정:
  > 원시 타입만의 다중 `type` 잎의 종류 이름은 `union`으로 확정하고 가칭을 푼다(가드 `isUnionNode`, 동작 모듈 `unionBehavior/`).
  > `oneOf`·`anyOf` 분기를 가진 호스트는 variant 호스트라 부르고, 그 분기 하나를 variant라 부른다(합 타입의 업계 용어).
  > 원장의 옛 글에 남은 "union 호스트"는 variant 호스트를 뜻하며, 새 설계 문서는 새 용어를 쓴다.
- 보충:
  > 소유자(18C 검토 6번): "기존 용어를 바꿔도 됩니다." (`reviews/round-18-owner-answers.md:28`)
  > 소유자(18C 검토 6번): "업계통상용어를 차용하고싶습니다" (`reviews/round-18-owner-answers.md:28`)
  > 소유자(18C 검토 6번): "6번, 권장안 수용" (`reviews/round-18-owner-answers.md:28`)
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:28`(정본, 반영 칸), `reviews/round-18-owner-answers.md:29`
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:28` 18C 검토 6번), 소유자 답(`reviews/round-18-owner-answers.md:29` union 범위; 범위)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:28`, `reviews/round-18-owner-answers.md:29`
- 충돌:
  > `reviews/round-18-owner-answers.md:28`의 "원시 타입만의 다중 `type` 잎"은 소유자 답과 다르다: `union`은 `type`에 원시·객체·배열 가운데 둘 이상의 종류가 적힌 칸의 터미널 잎이다(BLUEPRINT-036). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:29`).

### BLUEPRINT-036 `union`의 범위 — `type`에 원시·객체·배열 가운데 둘 이상의 종류가 적힌 칸의 터미널 잎, `object`·`array`가 든 `union`은 터미널 강제, 안쪽 키는 자식 없는 검증 전용, 객체·배열로의 변환 없음, `omitEmpty`·채움은 값 전체, 기본 입력은 객체·배열을 읽기 전용 JSON으로

- 결정:
  > `union`은 `type`에 원시·객체·배열 가운데 둘 이상의 종류가 적힌 칸을 받아들이는 터미널 잎 노드이며, 형을 고르는 UI가 아니다.
  > `object`·`array`도 union의 원소가 될 수 있다.
  > `union`은 행이 하나인 종류이므로 전략은 `terminal`이며, 렌더 계층의 판정을 묻지 않는다.
  > 어느 선언에든 `options.terminal: false`가 있으면 `TERMINAL_OPTION_UNSUPPORTED`(ERROR-200)이고, `true`는 허용하며, 인라인 `FormTypeInput`이 있어도 판정은 바뀌지 않는다.
  > `object`·`array`가 든 `union`은 터미널로 강제된다.
  > 이 칸의 `properties`·`items`·`prefixItems`는 자식을 만들지 않는 검증 전용이다.
  > `find('/slot/key')`는 `null`이다(NODE-020).
  > `controls.children`이 이 칸 아래를 가리키면 `CHILDREN_TARGET_NOT_FOUND`이다(CONTROLS-073 (2), ERROR-193).
  > `object`·`array`로의 변환은 없다(파싱도 문자열화도 하지 않는다).
  > 식의 경로는 방출 트리를 JSON Pointer로 내려가되 객체의 자기 키와 배열의 색인으로만 내려가므로, 원시 값 아래는 `undefined`이다.
  > `omitEmpty`(기본 켜짐)는 union의 현재 값 전체를 보며, `''`, 키가 없는 `{}`, 빈 `[]`은 방출하지 않고 `0`·`false`·`null`은 방출한다.
  > 채움 값은 `controls.default` > `default`의 값 전체다.
  > 기본 입력은 값이 객체나 배열이면 `JSON.stringify(value)`를 읽기 전용으로 보이고 비우기 단추를 두며, 비우기는 nullable이면 `null`, 아니면 `undefined`를 보낸다.
- 보충:
  > 소유자(union 범위): "그리고 나머지 이야기는 대충 이해가 됩니다. 브랜치 노드의 자동 노드 변환이나 멀티타입은 너무 위험하겠네요. 그 점에 대해선 이해하고, 프리미티브 타입용으로 이해하겠습니다." (`reviews/round-18-owner-answers.md:29`)
  > 소유자(union 범위): "그런데 한가지, 그럼 터미널 노드의 array 와 object 도 안되는건가요?" (`reviews/round-18-owner-answers.md:29`)
  > 소유자(union 범위): "사업상 혹은 일반적 요구사항에 따라, 특정 필드가 object\|string\|number 인 경우나 array\|string 인 경우는 자주 볼 수 있어. 브랜치 노드를 이렇게 표현해야 하면 if-then-else 나 oneOf 로 표현하면 되지만, 이거 터미널 노드로 다룰 수 있다면 그게 훨신 정합할거같아. 시간을 쓸 가치가 있겠어." (`reviews/round-18-owner-answers.md:29`)
  > 소유자(union 범위): "권장 수용" (`reviews/round-18-owner-answers.md:29`)
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:29`(정본, 반영 칸)
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:29` union 범위)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:29`

### BLUEPRINT-037 자기 `type` 없는 칸의 원시 `oneOf`·`anyOf` — 분기 허용 집합의 합집합 U(`oneOf`와 `anyOf`가 함께면 교집합)가 원시 잎·`union` 잎·null 종류를 정함, 빈 U와 분기 없음은 `UNKNOWN_JSON_SCHEMA`, 형 없는 칸의 `nullable`은 효과 없음

- 결정:
  > 나. 정적 연언에 `type`을 가진 선언이 없는 칸은 칸의 게이트 없는 `oneOf`·`anyOf` 분기를 보며, 분기가 없으면 `UNKNOWN_JSON_SCHEMA`이다.
  > 분기 b의 허용 집합 A(b)는 b 자신의 정적 연언에 정적 교집합 규칙을 적용한 결과이며, 거기서 난 오류는 그대로 낸다.
  > 한 키워드의 허용 집합 U는 분기 A(b)의 합집합이며 `'null'`을 포함하고, 순서는 분기 순서에서 처음 나온 순서다.
  > `oneOf`와 `anyOf`가 함께 있으면 둘은 연언이므로, 두 키워드의 U를 교집합한 것이 U이며(`'null'` 포함) 순서는 `oneOf` 쪽을 따른다.
  > `'null'`은 합치고 교집합한 뒤에야 떼어 낸다.
  > U가 빈 집합이면 `UNKNOWN_JSON_SCHEMA`이다.
  > U가 `{null}`이면 null 종류이고 `nullable: true`이다.
  > 그 밖에는 U가 원시 잎이나 `union` 잎을 정하고, 분기의 제약은 검증 전용이다.
  > 게이트 가진 분기(분기 안의 `controls.active`, `controls.discriminator`로 변환된 분기)는 이 합치기에 넣지 않고 게이트 선언의 규칙을 따른다.
  > `nullable: true`는 같은 객체에 `type`이 있을 때만 `'null'`을 더하므로, 형 없는 칸의 `nullable`은 효과가 없다.
- 보충:
  > 소유자(union 형 없는 분기): "나 로 할 수 있었으면 좋겠습니다" (`reviews/round-18-owner-answers.md:30`)
- 상태: 분할됨(→ BLUEPRINT-051, BLUEPRINT-050)
- 출처: `reviews/round-18-owner-answers.md:30`(정본, 반영 칸)
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:30` union 형 없는 분기)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:30`

### BLUEPRINT-038 자기 `type` 없는 칸에 허용 집합이 ⊤인 분기(`const`·`enum`만 있는 분기 포함)가 있으면 `UNKNOWN_JSON_SCHEMA` — 오류에 그 분기의 schemaPath와 `type`을 적으라는 안내

- 결정:
  > 가. 자기 `type` 없는 칸에서 허용 집합이 ⊤인 분기가 하나라도 있으면(`const`·`enum`만 있는 분기 포함) `UNKNOWN_JSON_SCHEMA`이다.
  > 오류에 그 분기의 schemaPath와 "`type`을 적으라"는 안내를 싣는다.
- 보충:
  > 소유자(union O2): "권장안 수용" (`reviews/round-18-owner-answers.md:32`)
  > 편집자 결정(19C-02): "이 규칙은 분기가 없는 칸에만 적용되며, 분기 안의 `const`·`enum`만 있는 분기(소유자 답 32행, E14)는 그대로 `UNKNOWN_JSON_SCHEMA`다." (`reviews/round-19-closing.md:39`)
  > 편집자 결정(19C-02): "【추론】 19C-01의 재귀가 분기 b를 볼 때 b의 정적 연언에 `type`도 분기도 없으면 b의 허용 집합은 소유자 답 32행대로 ⊤이다." (`reviews/round-19-closing.md:41`)
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:32`(정본, 반영 칸)
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:32` union O2)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:32`

### BLUEPRINT-039 자기 `type` 없는 칸의 분기 형에 `object`·`array`가 있으면 `UNKNOWN_JSON_SCHEMA` — object variant 호스트는 건드리지 않음, 푸는 것은 뒤로(나중에 풀어도 비파괴)

- 결정:
  > 가. 자기 `type` 없는 칸에서 `'null'`을 뗀 분기 형을 접은 집합에 `object`나 `array`가 있으면 `UNKNOWN_JSON_SCHEMA`이며, 다른 종류와 섞인 경우와 객체만·배열만인 경우(오늘과 같음)가 모두 여기에 든다.
  > object variant 호스트(분기가 객체 스키마인 `oneOf`·`anyOf`, 깊이와 상관없는 자식 하위 트리 포함)는 이 설계가 건드리지 않는다.
  > 이 답은 자기 `type` 없는 칸의 분기가 object·array와 원시를 섞는 경우만 다루며, 지금 `UNKNOWN_JSON_SCHEMA`가 되는 것은 그 칸뿐이다.
  > 그 칸을 받아들이도록 푸는 것은 뒤로 미루며, 나중에 풀어도 파괴적 변화가 아니다.
- 보충:
  > 소유자(union O3): "이거 좀 더 설명을. oneOf /anyOf 는 자식으로 브랜치를 가질 수 없나요? 그럼 깊은 object 객체의 중간 노드가 oneOf 로 분기 서브트리를 가질 수 없습니까? 그건 안되는데요 / union 인 경우만입니까?" (`reviews/round-18-owner-answers.md:33`)
  > 소유자(union O3): "좋다. 지금까지 내용은 논러적으로 무결하며, 합리적이라고 보겠다." (`reviews/round-18-owner-answers.md:33`)
- 상태: 분할됨(→ BLUEPRINT-049, BLUEPRINT-048)
- 출처: `reviews/round-18-owner-answers.md:33`(정본, 반영 칸)
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:33` union O3)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:33`

### BLUEPRINT-040 규칙 A·기본 입력·경고등의 기준 목록은 `node.schemaType`(+`nullable`), 게이트가 켜진 동안은 유효 목록 — 청사진은 `schemaType`을 유효 스키마에 써 넣지 않음, `jsonSchema.type`은 켜진 선언의 교집합

- 결정:
  > 가. 목록은 `node.schemaType`(+`nullable`)에서 읽는다; 유효 목록은 U4다.
  > 규칙 A·기본 입력·경고등의 기준 목록은 `node.schemaType`과 `node.nullable`이며, 게이트가 켜진 동안에는 모든 종류에서 유효 목록을 쓴다.
  > 청사진은 계산한 `schemaType`을 유효 스키마에 써 넣지 않는다.
  > `jsonSchema.type`은 켜진 선언의 `type`을 병합표 규칙대로 교집합으로 합친 값이다.
  > 그래서 켜진 `then`이 목록을 좁히면 `jsonSchema.type`은 좁아지고, `schemaType`은 그대로다.
- 보충:
  > 소유자(union O5): "권장동의" (`reviews/round-18-owner-answers.md:35`)
  > 반영 칸(18C 검토 1번, 입력이 보내는 값): "`union` 노드의 입력은 목록의 한 형의 값이나 없음을 보내며, 어떤 형을 보낼지는 입력 구현(UI 플러그인)이 정하고" (`reviews/round-18-owner-answers.md:24`)
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:35`(정본, 반영 칸), `reviews/round-18-owner-answers.md:24`
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:35` union O5)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:35`
- 충돌:
  > `reviews/round-18-owner-answers.md:24`의 "목록은 `node.jsonSchema.type`에서 읽는다"는 소유자 답과 다르다: 목록은 `node.schemaType`(+`nullable`)에서 읽고, 게이트가 켜진 동안에는 유효 목록을 쓴다(BLUEPRINT-040). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:35`).

### BLUEPRINT-041 한 칸의 `type` 선언들 — 통합 원리 U1–U9: 연언이고 허용 집합은 교집합, 빈 교집합만 충돌(정적은 청사진 오류, 게이트는 켜진 동안의 정착 오류), 정적 선언이 종류·`schemaType`·`nullable`을 정하고 게이트는 유효 목록만 좁힘, 한 진입에서 쓰인 노드의 두 번 해석

- 결정:
  > 통합 원리 U1–U9를 채택한다.
  > U1: 한 칸의 `type` 선언들은 연언이고, 허용 집합은 교집합이며(`null` 포함, `integer ⊂ number`), 순서와 무관하다.
  > U2: 빈 교집합만이 충돌이며, 정적이면 청사진 오류, 게이트이면 그 게이트들이 켜진 동안의 정착 오류이고, `{null}`은 빈 집합이 아니라 null 노드다.
  > U3: 정적 선언(본체·게이트 없는 `allOf`·`$ref`)이 종류·`schemaType`·`nullable`을 청사진에서 정한다.
  > U4: 게이트 선언(`then`·`else`, `controls.active` 조각, 게이트 가진 분기)은 종류·`schemaType`·`nullable`·입력 선택을 바꾸지 않고, 켜진 동안 유효 목록만 좁히며, 이는 모든 종류에 적용된다.
  > U5: 유효 목록은 노드마다 유효 스키마 메모에서 파생하고, 좁히지 않으면 `schemaType`과 같은 참조이며, 병합표의 `type` 행은 교집합이다.
  > U6: 게이트만 바뀌면 값은 다시 해석하지 않고(소급 변환 없음) 경고등만 다시 정한다.
  > U7: 한 진입에서 쓰인 노드(입력 쓰기·`setValue`·로드·채움)는 그 진입의 전이 단계에서 최종 유효 목록으로 한 번 더 해석하며, 쓰이지 않은 노드는 다시 해석하지 않는다.
  > U8: 호스트의 게이트 없는 분기는 "또는" 문맥이라 유효 목록을 좁히지 않는다.
  > U9: 쓰기 없이 경고등만 바뀐 노드는 유효 스키마 변경 통지로 배달되고, 게이트가 좁혀 쓰기 없이 켜진 `VALUE_TYPE_MISMATCH` 경고의 `source`는 `'gate'`이며, 기록의 `expected.effective`는 그 커밋의 유효 목록이고, 기본 입력은 유효 목록이 바뀌면 초안을 다시 판정한다.
  > 이 답은 앞선 소유자 결정의 읽기 "`then`·`allOf` 좁힘은 검증 전용"(2026-09-26, 원장 미기재)을 대체한다: 정적 좁힘은 교집합으로 종류를 정하고(U3), 게이트 좁힘은 유효 목록을 좁힌다(U4).
- 보충:
  > 소유자(union O7·O8): "해당 동작이 논리적으로 정합하다면 괜찮습니다. 저는 제가 불필요한 jsonSchema 의 하위 전용 문법을 만드는걸 원치는 않습니다. 검증해보고 정합하면 권장안 채택하세요" (`reviews/round-18-owner-answers.md:37`)
  > 소유자(union O7·O8): "07과 마찬가지입니다. 일관되고 논리적이며, 예측가능한 동작이면 됩니다." (`reviews/round-18-owner-answers.md:37`)
  > 소유자(union O7·O8): "좋다. 지금까지 내용은 논러적으로 무결하며, 합리적이라고 보겠다." (`reviews/round-18-owner-answers.md:37`)
  > 편집자 결정(18C-104): "【추론】 쓰기 경계에서는 그 노드의 정적 목록(`schemaType`, `nullable`)으로 한 번 해석한다." (`reviews/round-18-closing.md:2908`)
  > 편집자 결정(18C-104): "【추론】 이 목록은 게이트와 무관하므로 직전 상태에 기대지 않는다." (`reviews/round-18-closing.md:2909`)
  > 편집자 결정(18C-104): "【추론】 전이 단계에서는 이 진입에서 쓰인 노드마다, 최종 유효 목록이 정적 목록보다 좁으면 원래 쓰인 값(쓰기 경계에서 바뀐 값이 아니라 호출자·입력이 준 값)을 최종 유효 목록으로 다시 해석해 그 결과를 원본으로 삼는다." (`reviews/round-18-closing.md:2910`)
  > 편집자 결정(18C-104): "【추론】 그래서 결과는 "쓰인 값을 최종 유효 목록으로 한 번 해석한 것"과 같고, 직전 커밋의 게이트 상태에 기대지 않는다." (`reviews/round-18-closing.md:2911`)
  > 편집자 결정(18C-104): "【추론】 로드(마운트, `FormHandle.reset()`, `resetSubtree()`)도 같은 두 단계를 따른다." (`reviews/round-18-closing.md:2914`)
  > 반영 칸(설계서 메모 4): "게터 `typeMismatch: boolean`, 경로 목록 `typeMismatches: readonly string[]`, 경고 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`." (`reviews/round-18-owner-answers.md:41`)
  > 편집자 결정(18C-105): "【추론】 전이 단계의 재해석은 전이 쓰기다." (`reviews/round-18-closing.md:2938`) — U7의 "한 번 더"는 라운드마다이며, 한 노드는 한 라운드에 한 번만 다시 해석하고 상한을 넘기면 원본 B에는 쓰기 경계의 해석(정적 목록)만 남는다(WRITE-099).
  > 편집자 결정(25C-04): "【추론】 켜진 게이트 선언의 `type`과 정적 허용 집합의 교집합이 비면 유효 스키마는 `enum: []`을 적지 않고 형 충돌을 결과에 드러내며, 그 게이트들이 켜진 동안의 정착 오류 `SHARED_NODE_CONFLICT`는 PR 03(정착)이 던진다." (`reviews/round-25-closing.md:42`)
  > 편집자 결정(25C-04): "【추론】 보정 PR은 그 신호를 `mergeEffectiveSchema`의 반환 `{ schema, typeConflict }`로 드러내고(형 충돌이면 `typeConflict: true`, `schema.type`은 정적 `schemaType`, `enum`은 적지 않음, 같은 활성 집합이면 같은 참조), 최종 모양은 PR 03이 정한다." (`reviews/round-25-closing.md:43`)
  > 편집자 결정(26C-05): "【추론】 25C-04의 "최종 모양은 PR 03이 정한다"를 닫는다: 형 충돌 신호의 최종 모양은 `EffectiveSchema { schema, typeConflict }` 그대로이며(`src/core/blueprint/type.ts:229`), PR-2는 그 모양을 바꾸지 않는다." (`reviews/round-26-closing.md:56`)
  > 편집자 결정(26C-05): "【추론】 정착은 활성 집합의 유효 스키마를 계산한 뒤 `typeConflict`가 참인 노드마다 정착 오류 `SHARED_NODE_CONFLICT`를 내고, `diagnostics.cause`는 `'sharedConflict'`이며, 드러남은 정착 오류 규칙대로 모든 환경에서 커밋·통지 뒤 사슬 끝이다(PR-2에서 사슬은 `settle` 호출 하나)." (`reviews/round-26-closing.md:57`)
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:37`(정본, 반영 칸), `reviews/round-18-closing.md:2908-2911,2914`, `reviews/round-18-owner-answers.md:41`, `reviews/round-18-closing.md:2938`
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:37` union O7·O8), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-104), 소유자 답(`reviews/round-18-owner-answers.md:41` 설계서 메모 4), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105; U7 재해석은 라운드마다)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:37`
- 충돌:
  > `reviews/round-18-owner-answers.md:37`의 "U9: 쓰기 없이 경고등만 바뀐 노드는 유효 스키마 변경 통지로 배달되고, 게이트가 좁혀 쓰기 없이 켜진 `VALUE_TYPE_MISMATCH` 경고의 `source`는 `'gate'`이며, 기록의 `expected.effective`는 그 커밋의 유효 목록이고, 기본 입력은 유효 목록이 바뀌면 초안을 다시 판정한다."는 소유자 답과 다르다: 이 항목의 `valueTypeMismatch`·`valueTypeMismatches`·`VALUE_TYPE_MISMATCH`는 확정 이름 `typeMismatch`·`typeMismatches`·`SCHEMA_FORM_WARNING.TYPE_MISMATCH`로 읽는다(SURFACE-061). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:41`).

### BLUEPRINT-042 `union` 노드의 목적·해석·기본 입력에서 그대로인 것 — 형을 고르는 기능이 아님, 받아 줄 형이 정확히 하나일 때만 변환, 선언 순서·검증기 규칙을 쓰지 않음, 기본 입력은 문자열 입력

- 결정:
  > `union` 노드의 목적은 원시 타입이 여럿인 필드를 폼이 받아들이는 것이며, 값의 형을 사용자가 고르게 하는 기능이 아니다.
  > 형을 고르게 하는 요구는 조건부 스키마(`if`-`then`-`else`, `controls.active`)로 표현한다.
  > `union` 노드의 해석은 값이 목록의 한 형이면 그대로 두고, 아니면 변환 목록(WRITE-075)으로 받아 줄 형이 정확히 하나일 때만 그 형으로 바꾸며, 받아 줄 형이 없거나 둘 이상이면 받은 그대로 두고 경고등을 켠다.
  > 이 해석은 `type`의 선언 순서도 검증기 플러그인의 규칙도 쓰지 않으며, 단일 타입 노드의 변환은 목록이 하나인 경우다.
  > 기본 입력 정의(`formTypeDefinitions`, UI 플러그인이 없을 때의 최소 구현)는 문자열 입력을 그대로 쓰고 새 입력을 두지 않으며, 친 글은 위 해석을 거친다.
- 보충:
  > 소유자(18C 검토 1번): "이제 서로 다른 type 노드는 사용하는 동작이 다를 뿐, 노드 클래스 자체가 다르지 않아서 이게 가능한건가? 근데 jsonSchema 상에선 이해가 가는데, 입력 form 입장에선 이걸 어떻게 구분하면 좋을까? 어차피 node 가 값의 타입을 고정하지 않으니까 상관없나...??" (`reviews/round-18-owner-answers.md:24`)
  > 소유자(18C 검토 1번): "이 union 노드는 나도 넣고싶었는데 설계를 못했던 부분인데, 어떻게 넣고 어떤 행위를 허용할지 설명을 원하는구나" (`reviews/round-18-owner-answers.md:24`)
  > 소유자(18C 검토 1번): "1번, ajv는 항상 존재하는게 아닙니다. 플러그인이라, 이를 form 기본기능에서 많이 쓰는건 완결성을 훼손합니다." (`reviews/round-18-owner-answers.md:24`)
  > 소유자(18C 검토 1번): "지금 이야기만으로는 라1에서는 A 규칙 말곤 선택이 불가능한데...." (`reviews/round-18-owner-answers.md:24`)
  > 소유자(18C 검토 1번): "그리고 오해한게 있는데 formTypeDefininitions 는 ui가 없는 경우를 위한 최소구현이야. 그러니까 여기에 구현을 해봤자 실제 사용자에게 이게 노출될 가능성은 높지 않다." (`reviews/round-18-owner-answers.md:24`)
  > 소유자(18C 검토 1번): "그리고 ui에서 선택하게 하는건 우리 목적과 달라. 그런 니즈라면 if-then-else 나 control.active 를 써야지. 지금 말한건 오버스팩같구나." (`reviews/round-18-owner-answers.md:24`)
  > 소유자(18C 검토 1번): "정련안으로 확정. 기록하고 반영해." (`reviews/round-18-owner-answers.md:24`)
  > 편집자 결정(18C-92): "【추론】 코어 기본 정의에 `{type:'union'}` 항목 하나를 더해 정의가 열한 개가 된다(BLUEPRINT-033의 "새 입력을 두지 않으며"에 대한 보충)." (`reviews/round-18-closing.md:2595`)
  > 편집자 결정(18C-92): "【추론】 그 항목은 `FormTypeInputString`을 감싸 아래의 초안·표시 규칙을 더한 것이며 새 구성 요소가 아니고, 자리는 `FormTypeInputStringDefinition` 바로 앞이다." (`reviews/round-18-closing.md:2596`)
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:24`(정본, 반영 칸의 1–4·6번째 문장. 표 행이라 조각 번호로 나눌 수 없다. BLUEPRINT-033에서 분할), `reviews/round-18-closing.md:2595-2596`
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:24` 18C 검토 1번), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-92)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:24`, `reviews/round-18-closing.md:2620-2625`
- 충돌:
  > `reviews/round-18-owner-answers.md:24`의 "원시 타입이 여럿인 필드"는 소유자 답과 다르다: 범위는 `type`에 적힌 원시·객체·배열 가운데 둘 이상의 종류다(BLUEPRINT-036). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:29`).

### BLUEPRINT-043 값 union에서 계속 그대로인 것 — `null`은 nullable로·`integer`는 `number`로 접음, 접은 집합이 둘 이상이면 `union`(행 `terminal`), `union`끼리는 접은 집합이 같을 때 같은 종류, 정합은 나열된 타입 가운데 하나, PR-1 인식·PR-2 행

- 결정:
  > 【추론】 `null`은 빼서 nullable 플래그로 두고, `integer`는 `number`로 접는다(BLUEPRINT-009).
  > 【추론】 접은 집합의 원소가 둘 이상이면 새 종류 (가칭) `union`의 노드이고 행은 `terminal` 하나다(`BEHAVIORS.union.terminal`).
  > 【추론】 원소가 하나면 그 원시 종류다(`['string','null']`은 nullable string, `['integer','number']`는 number).
  > 【추론】 (2) 같은 종류: `union` 노드끼리는 접은 집합이 같을 때만 같은 종류다.
  > 【추론】 다른 종류의 선언과 같은 이름이면 BLUEPRINT-011·012의 충돌 규칙을 따른다.
  > 【추론】 (3) `interpret`: 값이 나열된 타입 가운데 하나에 맞으면 그대로 둔다.
  > 【추론】 정합은 값이 나열된 타입 가운데 하나라는 뜻이다.
  > 【추론】 다른 입력은 작성자가 `formTypeInputMap`이나 인라인 입력으로 고른다.
  > 【추론】 (7) PR 배치: 청사진이 `union` 종류를 알아보는 것은 PR-1이다(청사진이 종류를 정한다).
  > 【추론】 `union` 동작 행(`interpret`, `terminal` 전략)은 다른 잎 행과 함께 PR-2다(LANDING-062의 행 목록).
  > 【추론】 종류 모듈 목록에는 (가칭) `unionBehavior/`가 더해진다.
- 보충:
  > 소유자(12-9 답): "같은 종류 맞습니다." (`reviews/round-18-owner-answers.md:19`)
  > 반영 칸(union O1, 접기와 `schemaType`): "18C-02 (1)의 "`integer`는 `number`로 접는다"(`reviews/round-18-closing.md:58`)는 종류를 정할 때의 접기이고, `schemaType`은 `'integer'`를 보존한다." (`reviews/round-18-owner-answers.md:31`)
  > 편집자 결정(18C-92): "【추론】 기본 입력은 친 글에 core와 같은 `interpret`를 유효 목록으로 적용하고, 결과가 목록의 한 형일 때만 그 결과를 보낸다." (`reviews/round-18-closing.md:2575`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:58-60,64-66,69,72,78-80`(정본), `reviews/round-18-owner-answers.md:19`, `reviews/round-18-closing.md:2575`, `reviews/round-18-owner-answers.md:29`, `reviews/round-18-owner-answers.md:35`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-02), 소유자 답(`reviews/round-18-owner-answers.md:19` 12-9; `integer`·`null` 접기), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-92), 소유자 답(`reviews/round-18-owner-answers.md:29` union 범위; 범위), 소유자 답(`reviews/round-18-owner-answers.md:35` union O5; 목록)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:84-91`
- 충돌:
  > `reviews/round-18-closing.md:60`의 "원소가 하나면 그 원시 종류다"는 소유자 답과 다르다: 접은 집합의 원소가 하나면 그 종류이며 `object`·`array`일 수 있다(BLUEPRINT-044, BLUEPRINT-045 E8). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:29`).
  > `reviews/round-18-closing.md:66`의 "값이 나열된 타입 가운데 하나에 맞으면"은 소유자 답과 다르다: 목록은 `node.schemaType`(+`nullable`)이고 게이트가 켜진 동안에는 유효 목록이다(BLUEPRINT-040). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:35`).
  > `reviews/round-18-closing.md:69`의 "정합은 값이 나열된 타입 가운데 하나라는 뜻이다"는 소유자 답과 다르다: 목록은 `node.schemaType`(+`nullable`)이고 게이트가 켜진 동안에는 유효 목록이다(BLUEPRINT-040). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:35`).
  > `reviews/round-18-closing.md:59`의 "(가칭) `union`"은 소유자 답과 다르다: 종류 이름 `union`은 확정이고 가칭이 아니다(BLUEPRINT-035). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:28`).
  > `reviews/round-18-closing.md:80`의 "(가칭) `unionBehavior/`"는 소유자 답과 다르다: 동작 모듈 이름 `unionBehavior/`는 확정이고 가칭이 아니다(BLUEPRINT-035). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:28`).

### BLUEPRINT-044 청사진 판정 절차 — 허용 집합 A(d)와 fold, 교집합(`integer ⊂ number`, `null`은 양쪽에 있을 때만), 단계 S0–S6, 결과 일곱, 터미널 하위 키 경고 (가칭) `TERMINAL_SUBTREE_KEY_IGNORED_FOR_FORM`, PR-1·PR-4 게이트

- 결정:
  > 【추론】 선언 d의 허용 집합 A(d)는 `'null'`을 포함해 d가 받는 형의 집합이다.
  > 【추론】 A(d)의 기본은 d 자신의 `type`(문자열이나 배열)의 원소이고, `nullable: true`는 같은 객체에 `type`이 있을 때만 `'null'`을 더하며, `'null'`만 받는 분기는 `{null}`이다.
  > 【추론】 `type`이 없는 선언은 A = ⊤이며 어느 종류와도 맞는다.
  > 【추론】 ⊤가 아닌 A가 빈 집합이면 종류가 없고, 그 A를 만든 단계가 오류를 정한다.
  > 【추론】 A = `{null}`이면 null 종류이고 `nullable: true`이다.
  > 【추론】 그 밖에는 F = fold(A \ {null})로 정하며(fold는 `'integer'`를 `'number'`로 바꾼다), |F| = 1이면 그 종류, |F| ≥ 2이면 `union`이다.
  > 【추론】 nullable은 `'null'` ∈ A와 같다.
  > 【추론】 두 선언은 fold가 같을 때 같은 종류이며, 구현은 7비트 마스크 비교 한 번이다.
  > 【추론】 두 허용 집합의 교집합은 원소마다 취한다: `integer ⊂ number`이므로 `number` ∩ `integer` = `integer`이고, `'null'`은 양쪽에 있을 때만 남으며, 순서는 앞 집합의 순서를 따른다.
  > 【추론】 절차는 칸마다 S0부터 번호 순서로 보며, 반드시 하나의 결과로 끝난다.
  > 【추론】 S0 문법: 알려지지 않은 형 이름, 빈 배열 `[]`, 배열 안의 중복 원소는 `UNKNOWN_JSON_SCHEMA`이다.
  > 【추론】 선언 하나 안의 `['integer','number']`는 `'number'`다.
  > 【추론】 S1 정적 연언 C는 칸 본체, 게이트 없는 `allOf` 항목(재귀), 그리고 이것들의 `$ref` 대상이다(FRAGMENT-048, SCHEMA-007).
  > 【추론】 `type`을 가진 선언을 전순서로 늘어놓은 첫째를 앵커라 부르며, 앵커는 결과 원소의 순서만 정한다.
  > 【추론】 S2(C에 `type`을 가진 선언이 있는 칸)는 `reviews/round-18-owner-answers.md:37`의 U1–U3을 따르며, `type`이 없는 선언(A = ⊤)은 교집합에 관여하지 않는다.
  > 【추론】 S2에서 교집합이 빈 집합이면 `ALL_OF_TYPE_REDEFINITION`이다.
  > 【추론】 S3(C에 `type`이 없는 칸)은 `reviews/round-18-owner-answers.md:30`·`:32`·`:33`을 따른다.
  > 【추론】 S4: 칸의 종류가 원시나 `union`이면 게이트 없는 `oneOf`·`anyOf` 분기의 `type`은 검증 전용이며, 목록 밖 분기와 null 분기도 오류가 아니다.
  > 【추론】 형 있는 칸의 null 분기는 nullable을 켜지 않고, 유효 목록을 좁히지 않는다.
  > 【추론】 칸이 object·array이면 기존 variant 규칙을 따른다.
  > 【추론】 S5: 같은 이름의 선언이 여러 조각에 있으면, 정적 선언(호스트 본체, 호스트의 게이트 없는 `allOf`, `$ref`)은 모두 그 칸의 C가 되어 노드 하나를 정한다(BLUEPRINT-010).
  > 【추론】 켜진 게이트 선언과 정적 허용 집합의 교집합(`'null'` 포함)이 빈 경우(`reviews/round-18-owner-answers.md:37`의 U2)는 그 게이트들이 켜진 동안 `SHARED_NODE_CONFLICT`(정착 오류, 기존 처리)로 드러난다.
  > 【추론】 호스트의 게이트 없는 분기의 `type`은 "또는" 문맥이라 존재만 더하고 교차하지 않는다(SCHEMA-008, SCHEMA-044).
  > 【추론】 그 분기의 fold가 정적 노드의 fold에 들면 검증 전용이며 목록·nullable·유효 목록을 바꾸지 않고, 그 밖에는 `SHARED_NODE_KIND_CONFLICT`이다.
  > 【추론】 정적 선언이 하나도 없는 이름은 fold가 같은 선언끼리 노드 하나를 둔다.
  > 【추론】 그 노드의 목록은 선언들 허용 집합의 합집합을 종류 규칙으로 나눈 것이며, `integer`는 모든 선언이 `integer`일 때만 남고, nullable은 OR이며, `{null}`이면 null 종류다.
  > 【추론】 그 목록의 순서는 전순서의 첫 선언을 앵커로 하고, 앵커에 없는 원소는 처음 나온 순서대로 뒤에 붙인다.
  > 【추론】 fold가 다른 게이트 선언이 동시에 켜지면 `SHARED_NODE_CONFLICT`이고, 배타이면 종류별 노드이며(BLUEPRINT-011·012 그대로), 각 노드 안에서는 켜진 선언이 유효 목록을 좁힌다.
  > 【추론】 S6: 종류가 object·array인 칸은 nullable을 포함해(`['object','null']`) 오늘 순서 `options.terminal` → 판정 → `type`을 따른다(NODE-028, NODE-042).
  > 【추론】 전략이 `terminal`인 모든 노드의 인라인 하위 스키마(깊이 1 이상, `$ref`는 따라가지 않음)에 예약 층 키 `controls`·`options`·`presentation`이 나오면, 청사진이 경고 `(가칭) SCHEMA_FORM_WARNING.TERMINAL_SUBTREE_KEY_IGNORED_FOR_FORM`을 낸다.
  > 【추론】 그 기록은 `{ schemaPath, keys, paths }`이고, `(code, schemaPath)`로 트리마다 한 번 낸다.
  > 【추론】 그 경고는 개발 모드 콘솔과 커밋된 로드의 준비 이펙트로 드러나며(ERROR-164 `NULL_BRANCH_IGNORED_FOR_FORM` 행과 같은 드러남), 핸들러가 없는 프로덕션에서는 검사하지 않는다.
  > 【추론】 union 칸 인라인 하위 스키마의 `presentation.FormTypeInput`은 그릴 자리가 없으므로 이 경고의 대상이다.
  > 【추론】 결과는 일곱 가지다: 원시 잎(+nullable), null 잎, 원시만의 `union` 잎, 터미널 강제 `union` 잎, object·array 노드(branch 또는 terminal, +nullable), variant 호스트, 청사진 오류.
  > PR: PR-1(청사진 판정)·PR-4(ajv8 설정)
  > 무엇: `src/core/blueprint/__tests__/`의 `union.kind-procedure.test.ts`(E1–E42), `union.null-only.test.ts`, `union.static-intersection.test.ts`, `union.schema-type-invariant.test.ts`, `union.gated-narrowing.test.ts`, `union.terminal-subtree-warning.test.ts`와 `schema-form-ajv8-plugin/src/**/__tests__/union-types.test.ts`를 돌린다.
  > 통과: 예마다 종류·`schemaType`·nullable·전략·오류가 위대로이고, `allOf` 항목의 순서를 바꿔도 결과(원소 순서 제외)가 같으며, ajv8 컴파일에서 `console.warn`이 0회다.
  > 실패: 예와 다르면 절차를 고치고, 절차가 예를 하나로 정하지 못하면 이 블록을 고친다.
- 보충:
  > 편집자 결정(18C-105): "【추론】 정적 선언이 없는 이름에서 게이트 없는 분기끼리 fold가 다르면 게이트 없는 선언끼리의 다른 종류이므로 `SHARED_NODE_KIND_CONFLICT` 청사진 오류다(BLUEPRINT-012, 소유자 O-10)." (`reviews/round-18-closing.md:2950`)
  > 편집자 결정(25C-02): "【추론】 BLUEPRINT-044와 TEST-077이 든 `union.*.test.ts` 여섯 이름은 단언의 주소이며 규범이 아니다. 단언이 게이트다." (`reviews/round-25-closing.md:19`)
  > 편집자 결정(25C-11): "【추론】 E1–E42는 `src/core/blueprint/__tests__/`의 네 파일에 있다: `blueprint.type-syntax.test.ts`(E1–E10, E28), `blueprint.type-inference.test.ts`(E11–E17, E29, E32–E35), `blueprint.type-static-intersection.test.ts`(E18–E24, E30, E31, E36–E39), `blueprint.type-gated-declarations.test.ts`(E25–E27, E40–E42)." (`reviews/round-25-closing.md:103`)
  > 편집자 결정(25C-11): "【추론】 `union.kind-procedure.test.ts`의 단언은 위 네 파일의 표 행과 `blueprint.type-gated-declarations.test.ts`의 정적 소유자 없는 분기 접기 충돌 사례에, `union.null-only.test.ts`는 위 표 행에, `union.static-intersection.test.ts`는 `blueprint.type-static-intersection.test.ts`에, `union.schema-type-invariant.test.ts`는 `blueprint.type-syntax.test.ts`의 E1–E9 불변식에, `union.gated-narrowing.test.ts`는 `blueprint.type-gated-declarations.test.ts`에, `union.terminal-subtree-warning.test.ts`는 `blueprint.diagnostics.test.ts`와 `blueprint.type-syntax.test.ts`의 E28에 있다." (`reviews/round-25-closing.md:104`)
  > 편집자 결정(26C-05): "【추론】 BLUEPRINT-044 S5의 다른 조건(정적 선언이 없는 이름에서 fold가 다른 게이트 선언이 동시에 켜짐)은 유효 스키마의 신호가 아니며, 정착이 켜진 선언 집합에서 판정해 같은 코드 `SHARED_NODE_CONFLICT`와 `cause: 'sharedConflict'`로 낸다." (`reviews/round-26-closing.md:59`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2381-2414,2473-2476`(정본), `reviews/round-18-closing.md:2950`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-90), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2466-2471`
- 충돌:
  > `reviews/round-18-closing.md:2397`의 "【추론】 S3(C에 `type`이 없는 칸)은 `reviews/round-18-owner-answers.md:30`·`:32`·`:33`을 따른다."는 19라운드 결정과 다르다: S3는 그 셋과 19C-01·19C-02도 따른다(BLUEPRINT-048, BLUEPRINT-050). 19라운드 결정이 이긴다(`reviews/round-19-closing.md:9-23,37-43`).
  > `reviews/round-18-closing.md:2383`의 "【추론】 `type`이 없는 선언은 A = ⊤이며 어느 종류와도 맞는다."는 19라운드 결정과 다르다: 형 없는 칸의 분기 b는 정적 연언에 `type`이 없고 분기가 있으면 A(b)가 b에 S3를 재귀 적용한 U이며, `type`도 분기도 없을 때만 ⊤이다(BLUEPRINT-048, BLUEPRINT-050). 19라운드 결정이 이긴다(`reviews/round-19-closing.md:18-19,41`).

### BLUEPRINT-045 청사진 판정의 예 E1–E42 — 칸마다 종류·`schemaType`·nullable·전략·오류

- 결정:
  > 【추론】 예(종류 / `schemaType` / nullable / 전략 / 오류)는 아래 E1–E42와 같다.
  > 【추론】 E1: `{type:['string','number']}`는 union / `['string','number']` / false / terminal.
  > 【추론】 E2: `{type:['number','string','null']}`는 union / `['number','string']` / true / terminal.
  > 【추론】 E3: `{type:['string','number'], nullable:true}`는 union / `['string','number']` / true / terminal.
  > 【추론】 E4: `{type:['integer','number']}`는 number / `'number'` / false / terminal.
  > 【추론】 E5: `{type:['integer','string']}`는 union / `['integer','string']` / false / terminal.
  > 【추론】 E6: `{type:['integer','null']}`는 number / `'integer'` / true / terminal.
  > 【추론】 E7: `{type:['object','string'], properties:{…}}`는 union / `['object','string']` / false / terminal(강제).
  > 【추론】 E8: `{type:['object','null']}`는 object / `'object'` / true / NODE-028 순서.
  > 【추론】 E9: `{type:['null']}`는 null / `'null'` / true / terminal.
  > 【추론】 E10: `{type:['null','null']}`, `{type:[]}`, `{type:['string','foo']}`는 `UNKNOWN_JSON_SCHEMA`.
  > 【추론】 E11: `{anyOf:[{type:'string'},{type:'number'}]}`는 union / `['string','number']` / false / terminal.
  > 【추론】 E12: `{anyOf:[{type:'integer'},{type:'string',minLength:1},{type:'null'}]}`는 union / `['integer','string']` / true / terminal.
  > 【추론】 E13: `{anyOf:[{type:'string'},{type:'null'}]}`는 string / `'string'` / true / terminal.
  > 【추론】 E14: `{anyOf:[{const:'a'},{type:'number'}]}`는 `UNKNOWN_JSON_SCHEMA`(`reviews/round-18-owner-answers.md:32`).
  > 【추론】 E15: `{anyOf:[{type:'object'},{type:'string'}]}`는 `UNKNOWN_JSON_SCHEMA`(`reviews/round-18-owner-answers.md:33`).
  > 【추론】 E16: 자기 형 없는 `{oneOf:[{type:'object',…},{type:'object',…}]}`는 `UNKNOWN_JSON_SCHEMA`(오늘과 같음).
  > 【추론】 E17: `{oneOf:[{type:'string'},{type:'number'}], anyOf:[{type:'number'},{type:'boolean'}]}`는 number / `'number'` / false / terminal.
  > 【추론】 E18: `{type:['string','number'], allOf:[{type:'string'}]}`는 string / `'string'` / false / terminal.
  > 【추론】 E19: `{type:['number','string'], allOf:[{type:['integer','string']}]}`는 union / `['integer','string']` / false / terminal.
  > 【추론】 E20: `{type:'number', allOf:[{type:'integer'}]}`는 number / `'integer'` / false / terminal.
  > 【추론】 E21: `{type:['string','null'], allOf:[{type:'string'}]}`는 string / `'string'` / false / terminal.
  > 【추론】 E22: `{type:'string', anyOf:[{type:'null'},{minLength:1}]}`는 string / `'string'` / false / terminal.
  > 【추론】 E23: `{type:'string', allOf:[{type:'number'}]}`는 `ALL_OF_TYPE_REDEFINITION`(교집합이 빈 집합).
  > 【추론】 E24: `{type:'number', allOf:[{type:['number','string']}]}`는 number / `'number'` / false / terminal(오늘은 오류).
  > 【추론】 E25: 본체 `a:{type:['string','number']}` + `if/then a:{type:'number'}`는 union / `['string','number']` / false / terminal이고, 켜진 동안 유효 목록은 `['number']`다.
  > 【추론】 E26: 본체 `a:{type:'number'}` + `if/then a:{type:['number','string']}`는 number / `'number'` / false / terminal이고, 켜진 동안 유효 목록은 `['number']`로 `schemaType`과 같은 참조다.
  > 【추론】 E27: 본체 없이 `then a:['string','number']` / `else a:'number'`는 배타인 두 노드(union과 number)다.
  > 【추론】 E28: `{type:['string','number'], options:{terminal:false}}`는 `TERMINAL_OPTION_UNSUPPORTED`.
  > 【추론】 E29: `{nullable:true, anyOf:[{type:'string'},{type:'number'}]}`는 union / `['string','number']` / false / terminal(형 없는 `nullable`은 효과 없음).
  > 【추론】 E30: `{type:['string','null'], allOf:[{type:['number','null']}]}`는 null / `'null'` / true / terminal(교집합 `{null}`).
  > 【추론】 E31: `{type:['string','number'], allOf:[{type:['string','boolean']}]}`는 string / `'string'` / false / terminal.
  > 【추론】 E32: `{anyOf:[{type:'null'}]}`는 null / `'null'` / true / terminal.
  > 【추론】 E33: `{oneOf:[{type:'null'}], anyOf:[{type:'null'}]}`는 null / `'null'` / true / terminal.
  > 【추론】 E34: `{anyOf:[{type:['string','null']},{type:'number'}]}`는 union / `['string','number']` / true / terminal.
  > 【추론】 E35: `{anyOf:[{type:'string',nullable:true},{type:'number'}]}`는 union / `['string','number']` / true / terminal.
  > 【추론】 E36: `{type:'integer', allOf:[{type:'number'}]}`는 number / `'integer'` / false / terminal(오늘과 같음).
  > 【추론】 E37: `{type:'string', allOf:[{type:['string','null']}]}`는 string / `'string'` / false / terminal(오늘과 같음).
  > 【추론】 E38: `{type:['string','number','null'], allOf:[{type:['string','boolean','null']}]}`는 string / `'string'` / true / terminal.
  > 【추론】 E39: `{allOf:[{type:['string']},{type:['string','number']}]}`와 그 순서를 뒤집은 것은 둘 다 string / `'string'` / false / terminal.
  > 【추론】 E40: 본체 `a:['string','number','boolean']` + `then1 a:'string'` + `then2 a:'boolean'`은 union / `['string','number','boolean']` / false / terminal이고, 둘 다 켜지면 `SHARED_NODE_CONFLICT`다.
  > 【추론】 E41: 본체 `a:{type:'number'}` + `if/then a:{type:'integer'}`는 number / `'number'` / false / terminal이고, 켜진 동안 유효 목록은 `['integer']`(정수 규칙)다.
  > 【추론】 E42: 본체 `a:['string','number']` + 호스트의 게이트 없는 `oneOf` 분기 `a:{type:'string'}`는 union / `['string','number']` / false / terminal이고, 분기는 유효 목록을 좁히지 않는다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2415-2457`(정본), `reviews/round-18-closing.md:2956-2957`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-90), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2466-2471`
- 충돌:
  > `reviews/round-18-closing.md:2441`의 "켜진 동안 유효 목록은 `['number']`로 `schemaType`과 같은 참조다"는 18C-105의 결정과 다르다: 좁혀지지 않은 노드의 유효 목록은 `schemaType` 그 값(스칼라면 스칼라, 배열이면 그 배열 참조)이며, E26에서 게이트가 켜진 동안의 유효 목록은 `schemaType`과 같은 `'number'`다(WRITE-099). 18C-105의 결정이 이긴다(`reviews/round-18-closing.md:2956-2957`).
  > `reviews/round-18-closing.md:2431`의 "【추론】 E16: 자기 형 없는 `{oneOf:[{type:'object',…},{type:'object',…}]}`는 `UNKNOWN_JSON_SCHEMA`(오늘과 같음)."는 19라운드 결정과 다르다: E16은 object / `'object'` / false / NODE-028 순서(variant 호스트)다(BLUEPRINT-048). 19라운드 결정이 이긴다(`reviews/round-19-closing.md:23`).

### BLUEPRINT-046 청사진 내부 이름은 약어 없이 풀 네임 — `PropertyDecl`은 `PropertyDeclaration` 같은 풀 네임으로(PROCESS-023·SURFACE-023), PR-1의 청사진 `DETAIL.md`에서 적음

- 결정:
  > 구현 이름은 PR-1(청사진 fractal)에서 정할 때 풀 네임으로 짓는다(예: `PropertyDeclaration`).
  > 근거 규칙은 이미 있다: 약어 금지·처음 나올 때 풀어 씀(PROCESS-023), 이름은 줄임말이 아닌 풀 네임(SURFACE-023).
  > BLUEPRINT-002의 결정 원문은 옛 문서 인용이므로 그대로 두고, PR-1의 청사진 `DETAIL.md`가 이 이름을 적을 때 반영한다.
- 보충:
  > 소유자(설계서 메모 1): "약어 (Decl)을 쓰지말고" (`reviews/round-18-owner-answers.md:38`)
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:38`(정본, 반영 칸)
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:38` 설계서 메모 1)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:38`

### BLUEPRINT-047 조각의 구현 타입 이름은 `SchemaFragment` — React `Fragment`와 겹침을 피함, 개념어 "조각"과 FRAGMENT 영역 이름은 그대로

- 결정:
  > 구현의 타입 이름은 `SchemaFragment`로 짓는다(개념어 "조각"과 원장의 FRAGMENT 영역 이름은 그대로).
- 보충:
  > 소유자(설계서 메모 2): "Fragment 는 매력적인데, React Fregment <></> 랑 충돌할거같구나. 내부명이라 괜찮을거같지만, 그래도 명칭을 바꿨으면 해. SchemaFragment 정도로." (`reviews/round-18-owner-answers.md:39`)
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:39`(정본, 반영 칸)
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:39` 설계서 메모 2)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:39`

### BLUEPRINT-048 자기 `type` 없는 칸의 객체·배열 분기 — 접은 집합 F가 `{object}`·`{array}`면 variant 호스트로 추정, U 절차와 게이트 분기 제외, nullable은 `'null'` ∈ U, `items`는 명시 호스트와 같은 규칙, S4·S6 자리, 혼합은 `UNKNOWN_JSON_SCHEMA`, ⊤ 분기, 재귀와 순환 절단, 대체 범위, E16

- 결정:
  > 자기 `type` 없는 칸의 게이트 없는 `oneOf`·`anyOf` 분기 형을 접은 집합 F가 `{object}`이면 칸은 object 종류이고 `schemaType`은 `'object'`이며, F가 `{array}`이면 array 종류이고 `schemaType`은 `'array'`다.
  > 【추론】 S3(정적 연언 C에 `type`이 없는 칸)는 소유자 답 30행의 절차 그대로 칸의 게이트 없는 `oneOf`·`anyOf` 분기의 허용 집합 A(b)를 합쳐 키워드마다 U를 만들고(`'null'` 포함), `oneOf`와 `anyOf`가 함께 있으면 두 U를 교집합한 것을 U로 하며, 그 뒤에야 `'null'`을 떼어 F = fold(U \ {null})를 만든다.
  > 【추론】 게이트 가진 분기(분기 안의 `controls.active`, `controls.discriminator`로 변환된 분기)는 소유자 답 30행과 37행의 U4대로 U에 넣지 않고 게이트 선언의 규칙을 따르며, 게이트 없는 분기가 없으면 19C-02를 따르고(C에 `const`·`enum`도 없으면 `UNKNOWN_JSON_SCHEMA`), U가 빈 집합이면 `UNKNOWN_JSON_SCHEMA`다.
  > 【추론】 F가 `{object}`나 `{array}`인 칸의 nullable은 `'null'` ∈ U와 같다.
  > 【추론】 F가 `{array}`인 칸에서 분기의 `items`·`prefixItems`는 자기 `type:'array'`를 명시한 호스트와 같은 규칙(게이트 없는 분기끼리 fold가 같으면 노드 하나, 다르면 `SHARED_NODE_KIND_CONFLICT`)을 따른다.
  > 【추론】 종류가 정해진 칸은 그 뒤 S4의 variant 규칙과 S6의 순서(`options.terminal` → 판정 → `type`)를 자기 `type`을 명시한 칸과 똑같이 따르되, S6의 `type` 단계는 저자 스키마가 아니라 F가 정한 종류를 읽고, S4의 "형 있는 칸의 null 분기는 nullable을 켜지 않는다"는 이 칸에 적용하지 않는다.
  > 【추론】 F의 원소가 둘 이상이고 그 가운데 `object`나 `array`가 있으면 `UNKNOWN_JSON_SCHEMA`다(`object`와 `array`만 섞인 경우 포함, 소유자 답 33행의 혼합 규칙과 E15는 그대로다).
  > 【추론】 F에 `object`나 `array`가 없으면 소유자 답 30행의 원시 접기를 그대로 적용한다(U가 `{null}`이면 null 종류, 그 밖에는 원시 잎이나 `union` 잎).
  > 【추론】 셈에 드는 게이트 없는 분기 가운데 허용 집합이 ⊤인 분기(`const`·`enum`만 있는 분기 포함)가 있으면 F를 만들기 전에 소유자 답 32행대로 그 분기의 schemaPath와 `type`을 적으라는 안내를 담은 `UNKNOWN_JSON_SCHEMA`다.
  > 【추론】 분기 b의 A(b)는 b의 정적 연언(b 본체, 게이트 없는 `allOf`, `$ref` 대상)에 S2를 적용한 결과이고, b의 정적 연언에 `type`이 없으면 b에 S3를 재귀 적용해 얻은 U(`'null'`을 떼기 전)이며, 재귀에서 난 오류는 그대로 낸다.
  > 【추론】 재귀가 지금 펼치는 경로에 이미 있는 스키마 위치(분기 위치나 그 `$ref` 대상)에 다시 닿으면 그 분기는 더 펼치지 않고 U에 아무것도 더하지 않으며(BLUEPRINT-030의 조각 안 순환 절단과 같다), 그 결과 U가 비면 `UNKNOWN_JSON_SCHEMA`다.
  > 【추론】 이 재귀는 `properties`·`items`·`prefixItems`를 건너지 않으므로 `RECURSIVE_SHAPE_UNBOUNDED`의 판정과 겹치지 않는다.
  > 【추론】 이 결정은 소유자 답 33행의 "객체만·배열만인 경우(오늘과 같음)가 모두 여기에 든다"와 BLUEPRINT-045 E16, NODE-058의 "모든 분기가 객체(또는 배열)인 형 없는 칸은 `never`와 `unknown`이다"를 대체하고, 같은 답의 "object variant 호스트는 건드리지 않는다"와 혼합 금지는 그대로다.
  > 【추론】 ERROR-164의 `UNKNOWN_JSON_SCHEMA` 행의 "언제"에 적힌 "형 없는 칸의 빈 U와 객체·배열 분기"는 "형 없는 칸의 빈 U와 객체·배열이 다른 종류와 섞인 분기"로 읽는다.
  > 【추론】 E16은 "자기 형 없는 `{oneOf:[{type:'object',…},{type:'object',…}]}`는 object / `'object'` / false / NODE-028 순서(variant 호스트)"로 바뀐다.
- 보충:
  > 소유자(형 없는 객체 호스트): "좋습니다. 두번째 길로 가보죠. $ref 로 정의된 스키마도, 해당 노드를 생성하는 시점에 $ref 가 아닌 실제 노드로 풀어낼거고, 그럼 최소한 그 노드들에 대해서는 일반 jsonSchema 와 동치일테니까, 그럼 그 스키마에 대해서 접은 분기 형이 객체만이거나 배열만이면, 30행이 원시 분기에 한 것처럼 형을 모아서 object variant 호스트로 추정하는 방향으로요. 다만, 이 방향이 위험한지 아닌지는 지금 검토가 가능합니까?" (`reviews/round-19-owner-answers.md:7`)
  > 소유자(형 없는 객체 호스트): "그래 진행하라" (`reviews/round-19-owner-answers.md:7`)
- 상태: 현행
- 출처: `reviews/round-19-closing.md:9-23`(정본), `reviews/round-19-owner-answers.md:7`
- 닫은 사람: 소유자 답(`reviews/round-19-owner-answers.md:7` 형 없는 객체 호스트), 편집자 결정(19라운드, `reviews/round-19-closing.md` 19C-01)
- 라운드: 19
- 까닭: `reviews/round-19-closing.md:31`

### BLUEPRINT-049 object variant 호스트는 건드리지 않음 — 소유자 답 33행은 object·array와 원시를 섞는 경우만 다루며, 그 칸을 푸는 것은 뒤로(나중에 풀어도 비파괴)

- 결정:
  > object variant 호스트(분기가 객체 스키마인 `oneOf`·`anyOf`, 깊이와 상관없는 자식 하위 트리 포함)는 이 설계가 건드리지 않는다.
  > 이 답은 자기 `type` 없는 칸의 분기가 object·array와 원시를 섞는 경우만 다루며, 지금 `UNKNOWN_JSON_SCHEMA`가 되는 것은 그 칸뿐이다.
  > 그 칸을 받아들이도록 푸는 것은 뒤로 미루며, 나중에 풀어도 파괴적 변화가 아니다.
- 보충:
  > 소유자(union O3): "이거 좀 더 설명을. oneOf /anyOf 는 자식으로 브랜치를 가질 수 없나요? 그럼 깊은 object 객체의 중간 노드가 oneOf 로 분기 서브트리를 가질 수 없습니까? 그건 안되는데요 / union 인 경우만입니까?" (`reviews/round-18-owner-answers.md:33`)
  > 소유자(union O3): "좋다. 지금까지 내용은 논러적으로 무결하며, 합리적이라고 보겠다." (`reviews/round-18-owner-answers.md:33`)
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:33`(정본, 반영 칸의 2–4번째 문장. 표 행이라 조각 번호로 나눌 수 없다. BLUEPRINT-039에서 분할)
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:33` union O3)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:33`
- 충돌:
  > `reviews/round-18-owner-answers.md:33`의 "지금 `UNKNOWN_JSON_SCHEMA`가 되는 것은 그 칸뿐이다"는 19라운드 결정과 다르다: `object`와 `array`만 섞인 칸도 `UNKNOWN_JSON_SCHEMA`다(BLUEPRINT-048). 19라운드 결정이 이긴다(`reviews/round-19-closing.md:15`, 절차·범위를 19C-01에 맡긴 소유자 답 `reviews/round-19-owner-answers.md:7`).
  > `reviews/round-18-owner-answers.md:33`의 "객체만·배열만인 경우(오늘과 같음)가 모두 여기에 든다"는 19라운드 결정과 다르다: 접은 집합 F가 `{object}`나 `{array}`인 칸은 variant 호스트로 추정하고, `object`나 `array`가 다른 종류와 섞인 경우만 `UNKNOWN_JSON_SCHEMA`다(BLUEPRINT-048). 19라운드 결정이 이긴다(`reviews/round-19-closing.md:9,15,21`, 소유자 답 `reviews/round-19-owner-answers.md:7`).

### BLUEPRINT-050 `type` 없이 `const`·`enum`만 있는 분기 없는 칸 — 리터럴의 JSON 종류로 원시 잎·null 잎, 종류 혼합·객체 리터럴은 `UNKNOWN_JSON_SCHEMA`, 분기 안의 `const`는 그대로 오류, 소유자 답 30행 첫 문장 대체, ERROR-164 "언제"

- 결정:
  > 가. 정적 연언 C에 `type`이 없고 게이트 없는 `oneOf`·`anyOf` 분기도 없는 칸에 C의 `const`나 `enum`이 있으면, 그 리터럴들의 JSON 종류(string·number·boolean·null, 정수 리터럴은 number)를 모아 U를 만들고 소유자 답 30행의 접기(`'null'`은 떼어 nullable로)를 적용해 원시 잎이나 null 잎으로 정한다.
  > `'null'`을 뗀 리터럴의 종류가 둘 이상이거나 리터럴에 객체·배열이 있으면 `UNKNOWN_JSON_SCHEMA`다.
  > 이 규칙은 분기가 없는 칸에만 적용되며, 분기 안의 `const`·`enum`만 있는 분기(소유자 답 32행, E14)는 그대로 `UNKNOWN_JSON_SCHEMA`다.
  > 【추론】 그 오류에는 그 칸의 schemaPath와 `type`을 적으라는 안내를 싣는다.
  > 【추론】 19C-01의 재귀가 분기 b를 볼 때 b의 정적 연언에 `type`도 분기도 없으면 b의 허용 집합은 소유자 답 32행대로 ⊤이다.
  > 【추론】 소유자 답 30행 첫 문장의 "정적 연언에 `type`을 가진 선언이 없는 칸은 칸의 게이트 없는 `oneOf`·`anyOf` 분기를 보며, 분기가 없으면 `UNKNOWN_JSON_SCHEMA`이다"는 "정적 연언에 `type`을 가진 선언이 없는 칸은 칸의 게이트 없는 `oneOf`·`anyOf` 분기를 보며, 분기도 `const`·`enum`도 없으면 `UNKNOWN_JSON_SCHEMA`이다"로 대체된다.
  > 【추론】 ERROR-164의 `UNKNOWN_JSON_SCHEMA` 행의 "언제"에 "분기도 `const`·`enum`도 없는 형 없는 칸"과 "리터럴의 종류가 섞이거나 객체·배열인 `const`·`enum`"을 적는다.
- 보충:
  > 소유자(`const`만 있는 프로퍼티(X1)): "좋습니다. 가. 수용합니다. 원장을 이 브랜치에서 바로 수정하고, 답변할 내용 만들어주세요" (`reviews/round-19-owner-answers.md:8`)
- 상태: 현행
- 출처: `reviews/round-19-closing.md:37-43`(정본), `reviews/round-19-owner-answers.md:8`
- 닫은 사람: 소유자 답(`reviews/round-19-owner-answers.md:8` `const`만 있는 프로퍼티(X1)), 편집자 결정(19라운드, `reviews/round-19-closing.md` 19C-02)
- 라운드: 19
- 까닭: `reviews/round-19-closing.md:48`

### BLUEPRINT-051 자기 `type` 없는 칸의 원시 `oneOf`·`anyOf` — 분기 허용 집합 A(b), 합집합 U(`oneOf`와 `anyOf`가 함께면 교집합), `'null'`은 뒤에 뗌, 빈 U는 `UNKNOWN_JSON_SCHEMA`, `{null}`은 null 종류, 게이트 분기 제외, 형 없는 칸의 `nullable`은 효과 없음

- 결정:
  > 분기 b의 허용 집합 A(b)는 b 자신의 정적 연언에 정적 교집합 규칙을 적용한 결과이며, 거기서 난 오류는 그대로 낸다.
  > 한 키워드의 허용 집합 U는 분기 A(b)의 합집합이며 `'null'`을 포함하고, 순서는 분기 순서에서 처음 나온 순서다.
  > `oneOf`와 `anyOf`가 함께 있으면 둘은 연언이므로, 두 키워드의 U를 교집합한 것이 U이며(`'null'` 포함) 순서는 `oneOf` 쪽을 따른다.
  > `'null'`은 합치고 교집합한 뒤에야 떼어 낸다.
  > U가 빈 집합이면 `UNKNOWN_JSON_SCHEMA`이다.
  > U가 `{null}`이면 null 종류이고 `nullable: true`이다.
  > 그 밖에는 U가 원시 잎이나 `union` 잎을 정하고, 분기의 제약은 검증 전용이다.
  > 게이트 가진 분기(분기 안의 `controls.active`, `controls.discriminator`로 변환된 분기)는 이 합치기에 넣지 않고 게이트 선언의 규칙을 따른다.
  > `nullable: true`는 같은 객체에 `type`이 있을 때만 `'null'`을 더하므로, 형 없는 칸의 `nullable`은 효과가 없다.
- 보충:
  > 소유자(union 형 없는 분기): "나 로 할 수 있었으면 좋겠습니다" (`reviews/round-18-owner-answers.md:30`)
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:30`(정본, 반영 칸의 2–10번째 문장. 표 행이라 조각 번호로 나눌 수 없다. BLUEPRINT-037에서 분할)
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:30` union 형 없는 분기)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:30`
