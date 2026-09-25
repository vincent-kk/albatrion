# 단일 원장 — 청사진

기준 커밋: `ba398c330`(저장소 `packages/canard/schema-form/architecture`). 이 원장이 인용하는 `path:line`은 모두 이 커밋의 줄 번호다. 정본 우선순위는 `ledger/README.md` §1을 따른다. 이 영역의 정본은 `adr/0005-blueprint-analysis-and-node-sharing.md`(일부 수락, 5차 본문과 17라운드 개정)와 `08-design-a-to-z.md` §5이며, ADR 0005에 없는 규칙만 `08` §5가 정본이다. 병합표의 행(ADR 0005 §5, `02` §2.1)은 SCHEMA 영역이, 가드 컴파일은 VALIDATE·ERROR 영역이, 터미널 전략은 NODE 영역이 든다. 18라운드 안건 §1(청사진이 읽는 스키마의 범위, A)이 열어 둔 것은 **열림**이고 이미 정해진 규칙은 **현행**이다. 상태 값의 뜻은 README §3을 따른다.

## 색인

| 번호 | 한 줄 요약 | 상태 | 닫은 사람 |
| --- | --- | --- | --- |
| BLUEPRINT-001 | 분석 단계 — 순수 함수, 폼 생성 때 1회, 작성된 스키마 불변, 노드 없이 시험 | 현행 | 편집자 결정(10라운드 5차 본문 제안, `adr/0005-blueprint-analysis-and-node-sharing.md:3` "분석 단계의 분리와 청사진의 형태는 제안"), 원리(ADR 0001 입력 불변, `adr/0005-blueprint-analysis-and-node-sharing.md:44`) |
| BLUEPRINT-002 | 청사진의 형태 — ObjectBlueprint와 Fragment의 칸 | 현행 | 편집자 결정(5차 본문 제안, `adr/0005-blueprint-analysis-and-node-sharing.md:3` "분석 단계의 분리와 청사진의 형태는 제안") |
| BLUEPRINT-003 | forbids 칸 없음 — 금지 구문은 폼이 읽지 않음 | 현행(부정 결정) | 소유자 답(`reviews/round-5-derivations.md:7` P1'; D-3의 전제), 원리(`reviews/round-5-derivations.md:28-34` D-3 도출) |
| BLUEPRINT-004 | 조각의 정적 열거, declares 일반 경로, inherited 귀속, 무조건 allOf 항목 | 현행 | 편집자 결정(4차 본문 E3·E12, `adr/0005-blueprint-analysis-and-node-sharing.md:12`), 편집자 결정(5차 본문 병합표, `adr/0005-blueprint-analysis-and-node-sharing.md:13`) |
| BLUEPRINT-005 | 두 철자(items 배열·prefixItems, definitions·$defs)를 모두 읽음 | 현행 | 소유자 답(`reviews/round-2.md:112` C5), 소유자 답(`00-goals.md:108` C5) |
| BLUEPRINT-006 | P1′ 경계 — 구조는 읽고 의미는 평가하지 않음, 예외는 명시 판별 하나 | 현행 | 소유자 답(`reviews/round-5-derivations.md:7` P1'), 소유자 답(`reviews/round-9-spec.md:19` 축1), 소유자 답(`reviews/round-10-owner-answers.md:11` B-22; 예외) |
| BLUEPRINT-007 | 게이트 재평가 — 읽는 것을 뽑지 않고 전부 평가, 남는 최적화는 벤치마크로 | 현행 | 편집자 결정(1라운드 R11 측정 반영, `adr/0005-blueprint-analysis-and-node-sharing.md:10`), 편집자 결정(4차 본문 E13·F13, `adr/0005-blueprint-analysis-and-node-sharing.md:12`) |
| BLUEPRINT-008 | "앞서"·"나중"은 전순서로 정의, 2라운드 S13 닫힘 | 현행 | 편집자 결정(4차 본문, `adr/0005-blueprint-analysis-and-node-sharing.md:12`) |
| BLUEPRINT-009 | 노드의 "같은 종류" 정의 — 소유자 확인(12-9) | 현행 | 편집자 결정(1라운드 R11 반영, `adr/0005-blueprint-analysis-and-node-sharing.md:10`), 소유자 답(`reviews/round-18-owner-answers.md:19` 12-9) |
| BLUEPRINT-010 | 같은 이름 + 같은 종류는 노드 하나를 공유, 분기가 바뀌어도 값이 남음 | 현행 | 소유자 답(`adr/0005-blueprint-analysis-and-node-sharing.md:115` 합의 근거, "동의합니다.") |
| BLUEPRINT-011 | 같은 이름 + 다른 종류는 종류별 노드, 활성 종류가 하나면 그 노드가 삶 | 현행 | 편집자 결정(1라운드 R11 반영 (b), `adr/0005-blueprint-analysis-and-node-sharing.md:10`) |
| BLUEPRINT-012 | 공유 충돌 — 게이트 없는 선언끼리는 청사진 오류, 실제 동시 활성은 정착 오류 | 현행 | 소유자 답(`adr/0005-blueprint-analysis-and-node-sharing.md:116` 합의 근거, "타입이 달라버리면 … 오류가 throw 되겠지"), 소유자 답(`reviews/round-14-owner-answers.md:16` O-10), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 편집자 결정(17라운드 ADR 0014 4판, `adr/0014-error-policy.md:231`; 앞선 종류로 커밋) |
| BLUEPRINT-013 | 게이트 배타는 작성자 몫 — 폼은 검사하지 않고 검증기가 기각 | 현행 | 편집자 결정(1라운드 R11 반영 (b), `adr/0005-blueprint-analysis-and-node-sharing.md:10`) |
| BLUEPRINT-014 | 게이트 없는 분기의 노드 공유 — 존재만, 켜진 게이트 조각은 연언으로 교차 | 현행 | 편집자 결정(10라운드 5차 본문, `adr/0005-blueprint-analysis-and-node-sharing.md:13` "§3에 게이트 없는 분기의 노드 공유(존재만, 제약 교차 없음)를 더했다") |
| BLUEPRINT-015 | 게이트 없는 분기 안의 if/then은 선언 문맥 — then 제약을 교차하지 않음 | 중복(→ SCHEMA-014) | 편집자 결정(12라운드, `reviews/round-12-derivation.md:21`; 소유자의 물음 `reviews/round-12-owner-answers.md:22`에 대화로 답함) |
| BLUEPRINT-016 | 교차 공집합 — 정적 연언은 청사진 오류로 throw, 런타임 교차는 throw 없이 검증기가 기각 | 현행 | 편집자 결정(10라운드 5차 본문, `adr/0005-blueprint-analysis-and-node-sharing.md:76` 원장 §5) |
| BLUEPRINT-017 | 명시 판별 — union 호스트에 적을 때만 분기별 controls.active로 변환, 분기 스키마 불변 | 현행 | 소유자 답(`reviews/round-10-owner-answers.md:11` B-22), 소유자 답(`reviews/round-12-owner-answers.md:9` 2 `&discriminator`), 소유자 답(`reviews/round-9-spec.md:20` 축2; 판별 프로퍼티는 본체), 소유자 답(`reviews/round-15-decisions.md:13` 5; `controls` 그룹 표기), 소유자 답(`reviews/round-15-decisions.md:9` 1; 식의 기준점 `./`) |
| BLUEPRINT-018 | 예약 층의 판별 — 오늘의 자동 감지·COMPOSITION_PROPERTY_REDEFINITION 대체와 이주 안내 | 현행 | 소유자 답(`reviews/round-12-owner-answers.md:9` 2 `&discriminator` 명시 필수 수용) |
| BLUEPRINT-019 | 열림: controls.discriminator 변환의 세부 — $ref·allOf 평탄화, 분기 자기 controls.active와의 결합 | 중복(→ FRAGMENT-038) | 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:17`) |
| BLUEPRINT-020 | 병합표 준비 — 적용은 정착의 계산 단계에서 켜진 조각에 | 현행 | 편집자 결정(14라운드 설계서, `08-design-a-to-z.md:179`) |
| BLUEPRINT-021 | 유효 스키마의 메모(활성 덧씌움 집합마다)와 통지, node.jsonSchema의 변화 | 현행 | 편집자 결정(10라운드 5차 본문, `adr/0005-blueprint-analysis-and-node-sharing.md:13` "유효 스키마의 메모와 통지를 적었다"), 소유자 답(`reviews/round-9-spec.md:23` 축5; `node.jsonSchema`는 유효 스키마) |
| BLUEPRINT-022 | controls 식 컴파일과 역의존 표 — 뽑을 수 없는 식은 controls.watch | 현행 | 편집자 결정(15라운드 설계서, `08-design-a-to-z.md:181`) |
| BLUEPRINT-023 | 열림: 다중 type 슬롯과 값 union | 열림(→ `reviews/round-18-agenda.md` §1, :14) | 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:14`) |
| BLUEPRINT-024 | 열림: $ref 재귀에서 정적 열거가 끝나는 규칙 | 열림(→ `reviews/round-18-agenda.md` §1, :13) | 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:13`) |
| BLUEPRINT-025 | ADR 0005 합의 근거 — 소유자 발언 원문 모음 | 현행(기록) | 소유자 답(`adr/0005-blueprint-analysis-and-node-sharing.md:115-116`; 유일한 기록, 초판 커밋 ab41d790d부터 있고 reviews에는 없음), 소유자 답(`reviews/round-14-owner-answers.md:16` O-10), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-10-owner-answers.md:11,12,20,22,25,26,27` B-22·B-12·D-7·D-17·E-13·E-16·E-18), 소유자 답(`reviews/round-13-owner-answers.md:7,9` 1 잠금 규칙·3 폼 전용 키 접두) |
| BLUEPRINT-026 | 되돌림 가능성 — 청사진 형태는 쉽고, 노드 공유와 controls.discriminator는 어려움 | 현행(기록) | 편집자 결정(`adr/0005-blueprint-analysis-and-node-sharing.md:138`), 소유자 답(`reviews/round-15-decisions.md:13` 5; `controls` 표기) |
| BLUEPRINT-027 | 대체됨: 배타가 구조로 보장되지 않으면 분석 단계에서 throw | 대체됨(→ BLUEPRINT-012, BLUEPRINT-013) | 편집자 결정(1라운드 R11 반영, `adr/0005-blueprint-analysis-and-node-sharing.md:10`) |
| BLUEPRINT-028 | 대체됨: 교차가 공집합이어도 throw하지 않음(정적 연언은 뒤에 청사진 오류로 바뀜) | 대체됨(→ BLUEPRINT-016) | 편집자 결정(1라운드 R11 반영 (d), `adr/0005-blueprint-analysis-and-node-sharing.md:10`) |
| BLUEPRINT-029 | 대체됨: 판별식 식별(E14)·판별 프로퍼티의 union 호스트 소유(E8) | 대체됨(→ BLUEPRINT-017) | 소유자 답(`reviews/round-10-owner-answers.md:11` B-22) |

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
- 보충: 없음
- 상태: 현행
- 출처: `adr/0005-blueprint-analysis-and-node-sharing.md:29-41`(정본)
- 닫은 사람: 편집자 결정(5차 본문 제안, `adr/0005-blueprint-analysis-and-node-sharing.md:3` "분석 단계의 분리와 청사진의 형태는 제안")
- 라운드: 10
- 까닭: `adr/0005-blueprint-analysis-and-node-sharing.md:138`

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
- 보충: 없음
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

### BLUEPRINT-009 노드의 종류 — 여섯 종류, nullable은 플래그, type 없는 overlay는 어느 종류와도 맞음(소유자 확인 12-9)

- 결정:
  > 노드의 **종류**는 여섯이다: string, number(`integer` 포함), boolean, null, object, array. nullable(`type: ['string', 'null']`, `nullable: true`, null 분기와의 `anyOf`/`oneOf` — 현재 `helpers/jsonSchema/isNullBranch`가 알아본다)은 종류가 아니라 노드의 플래그다. `type`이 없는 overlay(`{ const }`, `{ enum }`, `{ minimum }`)는 어느 종류와도 맞는다.
- 보충:
  > "(a) "같은 타입"을 타입 표기의 동일성이 아니라 **같은 노드 종류**로 다시 정의했다 — `number`와 `integer`, `['string','null']`과 `'string'`은 배타가 아니다." (`adr/0005-blueprint-analysis-and-node-sharing.md:10`)
  > "분석 단계의 분리와 청사진의 형태는 제안. §3의 "같은 종류"는 수락된 규칙의 세부를 고친 것이어서 **소유자의 확인이 필요하다**(18라운드 안건 §1)." (`adr/0005-blueprint-analysis-and-node-sharing.md:3`)
  > "ADR 0005 상태 줄이 소유자 확인을 요구하지만 어느 목록에도 오르지 않았다" (`reviews/round-18-agenda.md:20`)
  > 소유자(12-9 답): "같은 종류 맞습니다." (`reviews/round-18-owner-answers.md:19`)
  > 반영 칸(12-9, 받음): "가. `number`와 `integer`, `['string','null']`과 `'string'`은 같은 종류다." (`reviews/round-18-owner-answers.md:19`)
- 상태: 현행
- 출처: `adr/0005-blueprint-analysis-and-node-sharing.md:62`(정본), `adr/0005-blueprint-analysis-and-node-sharing.md:3,10`, `02-target-overview.md:125`, `08-design-a-to-z.md:177`, `reviews/round-18-owner-answers.md:19`
- 닫은 사람: 편집자 결정(1라운드 R11 반영, `adr/0005-blueprint-analysis-and-node-sharing.md:10`), 소유자 답(`reviews/round-18-owner-answers.md:19` 12-9)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:19`, `reviews/round-18-agenda.md:20`

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
- 보충: 없음
- 상태: 현행
- 출처: `adr/0005-blueprint-analysis-and-node-sharing.md:67`(정본)
- 닫은 사람: 편집자 결정(1라운드 R11 반영 (b), `adr/0005-blueprint-analysis-and-node-sharing.md:10`)
- 라운드: 1
- 까닭: `adr/0005-blueprint-analysis-and-node-sharing.md:10`

### BLUEPRINT-012 같은 이름 + 다른 종류가 동시에 활성 — 충돌, 게이트 없는 선언끼리는 청사진 오류, 게이트 가진 선언은 정착 오류

- 결정:
  > | 상황 | 처리 |
  > | ---- | ---- |
  > | 같은 이름 + 다른 종류가 **동시에** 활성 | 충돌이다. 충돌을 작성자에게 드러낸다(`00-goals.md` C2). 게이트 없는 선언끼리는 늘 함께 켜지므로 청사진 오류다(폼이 서지 않는다). 게이트에 달린 선언이 실제로 동시에 켜지면 정착 오류다: 마운트에서는 모든 환경에서 폼이 서지 않고 폼 자리에 대체 화면을 그리며(14라운드 O-10), 마운트 뒤에는 전순서에서 앞선 종류의 노드를 살려 커밋하고 통지 뒤 사슬 끝에서 던지며 `degraded`(`cause`는 공유 충돌)가 다음 로드까지 남아 그 동안 제출을 거부한다(17라운드 소유자 답 R17-1 나, ADR 0014 4판). 게이트 가진 선언의 충돌은 청사진에서 판정할 수 없으므로 분석 단계에서 미리 throw하지 않는다 |
  >
  > - 게이트 없는 분기끼리 같은 이름·다른 종류의 필드를 두면 두 분기가 늘 함께 켜져 있으므로 위 표의 3행이 된다.
- 보충:
  > "둘의 드러남은 ADR 0014(채택)가 정한다: 앞은 청사진 오류, 뒤는 모든 환경에서 드러나는 정착 오류이며 마운트에서는 폼이 서지 않는다(§11.3. 5차 문서는 경고였다." (`08-design-a-to-z.md:177`)
- 상태: 현행
- 출처: `adr/0005-blueprint-analysis-and-node-sharing.md:68,72`(정본), `adr/0005-blueprint-analysis-and-node-sharing.md:3,7,116`, `02-target-overview.md:125`, `08-design-a-to-z.md:177`
- 닫은 사람: 소유자 답(`adr/0005-blueprint-analysis-and-node-sharing.md:116` 합의 근거, "타입이 달라버리면 … 오류가 throw 되겠지"), 소유자 답(`reviews/round-14-owner-answers.md:16` O-10), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 편집자 결정(17라운드 ADR 0014 4판, `adr/0014-error-policy.md:231`; 앞선 종류로 커밋)
- 라운드: 17
- 까닭: `adr/0005-blueprint-analysis-and-node-sharing.md:116`, `reviews/round-12-owner-answers.md:26`, `reviews/round-14-owner-review.md:66`

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
- 상태: 현행
- 출처: `adr/0005-blueprint-analysis-and-node-sharing.md:76`(정본), `adr/0005-blueprint-analysis-and-node-sharing.md:111`
- 닫은 사람: 편집자 결정(10라운드 5차 본문, `adr/0005-blueprint-analysis-and-node-sharing.md:76` 원장 §5)
- 라운드: 10
- 까닭: `adr/0005-blueprint-analysis-and-node-sharing.md:76`

### BLUEPRINT-017 명시 판별 controls.discriminator — 선언, 변환, 분기 스키마 불변, 청사진 단계에서 끝남, 판별 프로퍼티

- 결정:
  > 원장 §1.2의 축 1항("`enum`·`const` 판별식은 쓰지 않는다")의 유일한 예외다. 근거는 축 1항(폼은 JSON Schema 문법을 해석하지 않는다)의 예외(소유자 동의, 10라운드)와 축 7항(JSON Schema 표현은 `controls` 표현으로 대체할 수 있어야 한다)이다.
  >
  > - **선언.** 작성자가 union 호스트(`oneOf`·`anyOf`를 가진 객체 스키마)에 예약 층 키 `controls: { discriminator: '<key>' }`를 적는다. 적지 않은 union의 `const`·`enum`은 읽지 않는다. OpenAPI의 `discriminator.propertyName`도 예약 층의 키가 아니므로 읽지 않는다.
  > - **변환.** 청사진 단계가 각 분기에서 그 키의 `const`·`enum`을 읽어, 그 분기를 `controls: { active: "./<key> === <value>" }`를 가진 조각 객체로 다룬다. `enum`이면 값이 그 목록에 드는가를 본다. 변환된 분기는 ADR 0002 조각 표의 3행(연언)이 된다.
  > - **분기 스키마는 손대지 않는다.** `kind: { const }`와 `required`는 그대로 검증기에 간다(ADR 0001). 결과는 청사진의 `Fragment.guard`에 든 `controls.active` 식뿐이다. 소유자: "우리는 "&active": 을 더하는거지 스키마를 수정하는건 아니니까".
  > - **청사진 단계에서 끝난다.** 상태 칸(원본과 `extras` 둘)도 작업 루프도 바꾸지 않는다. 변환된 게이트는 다른 `controls.active`와 같이 호스트 바퀴에서 평가된다.
  > - **판별 프로퍼티는 본체에 선언한다**(§3). 폼이 소유하지 않고, 분기 값의 합집합 `enum`을 만들지도 않으며, 암묵 default도 없다. 채움의 원천은 `controls.default` > `default` > 없음뿐이다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0005-blueprint-analysis-and-node-sharing.md:80,82,84-86`(정본), `adr/0005-blueprint-analysis-and-node-sharing.md:83#1-3`(정본), `adr/0005-blueprint-analysis-and-node-sharing.md:54`, `02-target-overview.md:126`, `08-design-a-to-z.md:178`, `adr/0002-guard-fragment-model.md:75,97-100`(FRAGMENT-008과 일부 겹침)
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:11` B-22), 소유자 답(`reviews/round-12-owner-answers.md:9` 2 `&discriminator`), 소유자 답(`reviews/round-9-spec.md:20` 축2; 판별 프로퍼티는 본체), 소유자 답(`reviews/round-15-decisions.md:13` 5; `controls` 그룹 표기), 소유자 답(`reviews/round-15-decisions.md:9` 1; 식의 기준점 `./`)
- 라운드: 15
- 까닭: `adr/0005-blueprint-analysis-and-node-sharing.md:117`

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
- 상태: 중복(→ FRAGMENT-038)
- 출처: `adr/0005-blueprint-analysis-and-node-sharing.md:128`(정본), `08-design-a-to-z.md:178`
- 닫은 사람: 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:17`)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:17`
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
- 보충: 없음
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
- 상태: 열림(→ `reviews/round-18-agenda.md` §1, :14)
- 출처: `adr/0005-blueprint-analysis-and-node-sharing.md:130`(정본)
- 닫은 사람: 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:14`)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:14`

### BLUEPRINT-024 열림: $ref 재귀 스키마에서 조각의 정적 열거가 끝나는 곳

- 결정:
  > - `$ref`의 재귀 스키마에서 조각의 정적 열거가 어디서 끝나는가. 현재 `$ref` 해석 깊이의 기본값은 1이다(`getResolveSchema.ts:18-28`).
- 보충: 없음
- 상태: 열림(→ `reviews/round-18-agenda.md` §1, :13)
- 출처: `adr/0005-blueprint-analysis-and-node-sharing.md:132`(정본)
- 닫은 사람: 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:13`)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:13`

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
- 보충: 없음
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
