# ADR 0005 — 스키마 → 청사진 분석 단계와 노드 공유 규칙

## 상태

| 항목 | 닫은 사람 | 라운드 |
| --- | --- | --- |
| BLUEPRINT-001 | 편집자 결정(10라운드 5차 본문 제안, `adr/0005-blueprint-analysis-and-node-sharing.md:3` "분석 단계의 분리와 청사진의 형태는 제안"), 원리(ADR 0001 입력 불변, `adr/0005-blueprint-analysis-and-node-sharing.md:44`) | 10 |
| BLUEPRINT-002 | 편집자 결정(5차 본문 제안, `adr/0005-blueprint-analysis-and-node-sharing.md:3` "분석 단계의 분리와 청사진의 형태는 제안"), 소유자 답(`reviews/round-18-owner-answers.md:38` 설계서 메모 1), 소유자 답(`reviews/round-18-owner-answers.md:39` 설계서 메모 2) | 18 |
| BLUEPRINT-003 | 소유자 답(`reviews/round-5-derivations.md:7` P1'; D-3의 전제), 원리(`reviews/round-5-derivations.md:28-34` D-3 도출) | 5 |
| BLUEPRINT-004 | 편집자 결정(4차 본문 E3·E12, `adr/0005-blueprint-analysis-and-node-sharing.md:12`), 편집자 결정(5차 본문 병합표, `adr/0005-blueprint-analysis-and-node-sharing.md:13`) | 10 |
| BLUEPRINT-005 | 소유자 답(`reviews/round-2.md:112` C5), 소유자 답(`00-goals.md:108` C5) | 2 |
| BLUEPRINT-006 | 소유자 답(`reviews/round-5-derivations.md:7` P1'), 소유자 답(`reviews/round-9-spec.md:19` 축1), 소유자 답(`reviews/round-10-owner-answers.md:11` B-22; 예외) | 10 |
| BLUEPRINT-007 | 편집자 결정(1라운드 R11 측정 반영, `adr/0005-blueprint-analysis-and-node-sharing.md:10`), 편집자 결정(4차 본문 E13·F13, `adr/0005-blueprint-analysis-and-node-sharing.md:12`) | 5 |
| BLUEPRINT-008 | 편집자 결정(4차 본문, `adr/0005-blueprint-analysis-and-node-sharing.md:12`) | 5 |
| BLUEPRINT-010 | 소유자 답(`adr/0005-blueprint-analysis-and-node-sharing.md:115` 합의 근거, "동의합니다.") | 10 |
| BLUEPRINT-011 | 편집자 결정(1라운드 R11 반영 (b), `adr/0005-blueprint-analysis-and-node-sharing.md:10`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-90), 소유자 답(`reviews/round-18-owner-answers.md:37` union O7·O8) | 18 |
| BLUEPRINT-012 | 소유자 답(`adr/0005-blueprint-analysis-and-node-sharing.md:116` 합의 근거, "타입이 달라버리면 … 오류가 throw 되겠지"), 소유자 답(`reviews/round-14-owner-answers.md:16` O-10), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 편집자 결정(17라운드 ADR 0014 4판, `adr/0014-error-policy.md:231`; 앞선 종류로 커밋), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-90), 소유자 답(`reviews/round-18-owner-answers.md:37` union O7·O8), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-98) | 18 |
| BLUEPRINT-013 | 편집자 결정(1라운드 R11 반영 (b), `adr/0005-blueprint-analysis-and-node-sharing.md:10`) | 1 |
| BLUEPRINT-014 | 편집자 결정(10라운드 5차 본문, `adr/0005-blueprint-analysis-and-node-sharing.md:13` "§3에 게이트 없는 분기의 노드 공유(존재만, 제약 교차 없음)를 더했다") | 10 |
| BLUEPRINT-016 | 편집자 결정(10라운드 5차 본문, `adr/0005-blueprint-analysis-and-node-sharing.md:76` 원장 §5), 소유자 답(`reviews/round-18-owner-answers.md:37` union O7·O8; `type`의 빈 교집합) | 18 |
| BLUEPRINT-017 | 소유자 답(`reviews/round-10-owner-answers.md:11` B-22), 소유자 답(`reviews/round-12-owner-answers.md:9` 2 `&discriminator`), 소유자 답(`reviews/round-9-spec.md:20` 축2; 판별 프로퍼티는 본체), 소유자 답(`reviews/round-15-decisions.md:13` 5; `controls` 그룹 표기), 소유자 답(`reviews/round-15-decisions.md:9` 1; 식의 기준점 `./`) | 15 |
| BLUEPRINT-018 | 소유자 답(`reviews/round-12-owner-answers.md:9` 2 `&discriminator` 명시 필수 수용) | 12 |
| BLUEPRINT-020 | 편집자 결정(14라운드 설계서, `08-design-a-to-z.md:179`) | 14 |
| BLUEPRINT-021 | 편집자 결정(10라운드 5차 본문, `adr/0005-blueprint-analysis-and-node-sharing.md:13` "유효 스키마의 메모와 통지를 적었다"), 소유자 답(`reviews/round-9-spec.md:23` 축5; `node.jsonSchema`는 유효 스키마) | 10 |
| BLUEPRINT-025 | 소유자 답(`adr/0005-blueprint-analysis-and-node-sharing.md:115-116`; 유일한 기록, 초판 커밋 ab41d790d부터 있고 reviews에는 없음), 소유자 답(`reviews/round-14-owner-answers.md:16` O-10), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-10-owner-answers.md:11,12,20,22,25,26,27` B-22·B-12·D-7·D-17·E-13·E-16·E-18), 소유자 답(`reviews/round-13-owner-answers.md:7,9` 1 잠금 규칙·3 폼 전용 키 접두) | 17 |
| BLUEPRINT-026 | 편집자 결정(`adr/0005-blueprint-analysis-and-node-sharing.md:138`), 소유자 답(`reviews/round-15-decisions.md:13` 5; `controls` 표기) | 15 |
| FRAGMENT-008 | 소유자 답(`reviews/round-10-owner-answers.md:11` B-22), 소유자 답(`reviews/round-9-spec.md:20` 축2) | 10 |
| SCHEMA-007 | 소유자 답(`reviews/round-9-spec.md:23` 축5), 편집자 결정(10라운드, `07-conclusions.md:143` 전순서 정의) | 10 |
| SCHEMA-008 | 원리(`07-conclusions.md:82` 3.9 5항의 읽기, 유효성 키워드의 교차는 도출), 소유자 답(`reviews/round-9-spec.md:23` 축5), 편집자 결정(ADR 0005 §3, `adr/0005-blueprint-analysis-and-node-sharing.md:76`; 정적 연언의 공집합은 청사진 오류), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-90), 소유자 답(`reviews/round-18-owner-answers.md:37` union O7·O8; `type` 행은 교집합) | 18 |
| SCHEMA-009 | 소유자 답(`reviews/round-10-owner-answers.md:20` D-7), 소유자 답(`reviews/round-10-owner-answers.md:22` D-17), 소유자 답(`reviews/round-10-owner-answers.md:26` E-16) | 10 |
| SCHEMA-010 | 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙), 소유자 답(`reviews/round-12-owner-answers.md:7` 1 Form 속성 `false`), 소유자 답(`reviews/round-13-owner-answers.md:16` Form 속성의 자리), 편집자 결정(13라운드, `07-conclusions.md:158`; 로컬 선언끼리 잠금 OR·표시 AND) | 13 |
| SCHEMA-012 | 편집자 결정(10라운드, `07-conclusions.md:180`), 소유자 답(`reviews/round-13-owner-answers.md:10` 4 규칙 충돌 순위) | 13 |
| SCHEMA-013 | 소유자 답(`reviews/round-14-owner-answers.md:7` O-1), 편집자 결정(15라운드 게이트 뒤, `reviews/round-15-decisions.md:75`), 17라운드 스웜 수렴(편집자 결정, `03-mental-model.md:135`) | 17 |
| SCHEMA-039 | 소유자 답(`reviews/round-10-owner-answers.md:27` E-18), 소유자 답(`reviews/round-12-owner-answers.md:24` §9 `&options`), 소유자 답(`reviews/round-14-owner-answers.md:17` O-11), 17라운드 스웜 수렴(편집자 결정, `08-design-a-to-z.md:327`) | 17 |

## 결정

### 01-schema-to-blueprint.md §1.3 유효 스키마와 병합표

**병합표(축 5항(노드의 제약을 최신화해 제공한다)).**(SCHEMA-007) 노드의 유효 스키마는 켜진 조각을 전순서로 합친 것이다(SCHEMA-007). 전순서는 호스트에서 조각까지의 경로를 (키워드 순위, 배열 인덱스) 쌍의 열로 보고 사전식으로 비교한 것이다(SCHEMA-007). 키워드 순위는 본체 `properties` < `allOf` 항목 < `if/then/else` < `oneOf` 분기 < `anyOf` 분기다(SCHEMA-007, FRAGMENT-049). JSON 키 순서에 기대지 않는다(SCHEMA-007).

렌더 계층이 읽는 힌트이며 검증기에는 가지 않는다(SCHEMA-007). **메모.**(SCHEMA-007) 유효 스키마는 활성 덧씌움 집합(그 노드에 얹힌 켜진 조각들의 집합)마다 메모한다(SCHEMA-007). 같은 집합이면 같은 참조를 돌려준다(SCHEMA-007).

(SCHEMA-008, SCHEMA-009, SCHEMA-010, SCHEMA-012, SCHEMA-013, SCHEMA-039)

| 부류 | 규칙 |
| --- | --- |
| 검증 키워드(`minimum`, `enum`, `required` …) | 연언 문맥에서 교차. 게이트 없는 `oneOf`·`anyOf` 분기는 존재만 더하고 제약은 교차하지 않는다 |
| 주석 키워드(`title`, `description`, `format`, `default`·`controls.default`) | 뒤가 앞을 덮는다. 켜진 조각이 본체를, 전순서에서 나중 조각이 앞 조각을 덮는다(소유자: "세부 규칙이 포괄 규칙을 덮는 관례") |
| `writeOnly`, `$comment`, `examples` | 주석 키워드와 같다(뒤가 앞을 덮는다) |
| 상태 키(표준 `readOnly`, `controls.readOnly`·`controls.disabled`·`controls.visible`·`controls.active`) | 코어에는 글로벌이 없다(소유자 13라운드). 표준 `readOnly`·`controls`의 식은 그 노드에만 걸린다. 터미널이 아닌 객체 노드의 잠금은 입력이 없으므로 효과가 없고(표준 `readOnly`는 청사진 경고, 표준 독자의 기대와 다르므로 FRAGMENT-033에 적는다), 배열 노드의 잠금은 렌더 계층이 아이템 추가·삭제·이동 입력에 적용하며, 터미널 객체·배열은 입력이 있으므로 리프와 같다. `active`·`visible`은 구조상 하위 트리를 가린다. 자손을 거는 길은 부모의 `controls.children`(명시한 대상)과 켜진 조각의 `controls`뿐이다. 로컬 선언이 겹치면 잠금은 하나라도 참이면 잠기고 표시는 모두 참이어야 켜진다. Form 속성 `readOnly`·`disabled`는 렌더 계층이 참일 때만 거는 전체 잠금이며 코어의 상태가 아니다(원리 P5(core는 렌더러를 모른다), 12라운드 답 1) |
| 값·동작 키(`controls.derived`, `controls.injectTo`, `controls.unsetValue`, `controls.resetInteraction`) | 병합하지 않는다. 선언마다 규칙 하나이며 같은 대상은 파생 단계의 같은 대상 규칙이 푼다 |
| 선언·정책 키(`controls.children`, `controls.discriminator`, `controls.watch`, `controls.unsetOnInactive`) | 병합하지 않는다. `children`과 `unsetOnInactive`는 각 선언이 속한 층에서 그 선언을 담은 조각이 켜져 있는 동안(나감에서는 직전 커밋 기준) 각각 효력을 가진다(나감 비움 규칙과 같은 대상 규칙이 층으로 푼다). `watch`는 의존이 모든 선언의 경로 합집합(청사진, 정적)이고 입력에 가는 `watchValues`는 유효 스키마의 것(켜진 선언 가운데 전순서에서 나중 것)이다. `discriminator`는 호스트에 하나이며 선언이 여럿이면 같은 값만 허용하고 다르면 청사진 오류(14라운드 O-1, 15라운드, 17라운드 스웜 수렴(편집자 결정)) |
| `options`·`presentation`의 키(그룹 단위) | 뒤가 앞을 덮되 그룹 객체(`options`, `presentation`)는 깊은 병합이다. 작성자 스키마를 변이하지 않으며, 재귀는 두 선언이 같은 키에 모두 원자가 아닌 plain object를 줄 때만 새 객체를 만들어 하고(쓰기 시 복사) 한쪽에만 있는 값은 객체라도 복사하지 않고 참조를 옮긴다. React 요소(`$$typeof`)와 ref 모양(자기 열거 키가 `current` 하나뿐인 객체)은 원자라 나중 승이다. 원자 판정 함수는 렌더 계층이 터미널 판정 함수와 함께 청사진에 넘기며 core는 React 요소의 표식을 모른다(P5). core만 쓰는 호스트가 넘기지 않으면 원자는 없다. 선언이 하나면 그 객체를 그대로 쓴다. 함수·원시값은 나중 승, 나중 조각의 `undefined`는 앞 값을 지우지 않는다. 배열은 나중 조각의 것으로 통째 교체한다(14라운드 확정. `@winglet/common-utils`의 `merge`에 선택 인자(배열 교체, 원자 판정, 한쪽 값의 참조 이동. 양쪽에 있는 객체는 새 객체에 병합한다: 쓰기 시 복사)를 더해 쓰며 인자가 없으면 오늘 동작이다. 14라운드 O-11 되물음의 답, 17라운드 스웜 수렴(편집자 결정)) |

정적 연언(본체와 게이트 없는 `allOf`)의 교차가 공집합이면 청사진 오류(throw), 켜진 `then`과의 런타임 교차가 공집합이면 검증기가 값을 기각한다(SCHEMA-008).

**왜 게이트 없는 분기의 제약을 교차하지 않는가.**(SCHEMA-008) 분기는 "또는" 문맥이다(SCHEMA-008). 순수 분기 둘이 `kind`에 `const: 'a'`와 `const: 'b'`를 두면 교차는 공집합이 되어 검증기보다 좁은 힌트를 낸다(SCHEMA-008). 게이트가 켜진 조각은 작성자가 "이 분기가 해당한다"고 선언한 것이므로 연언으로 적용한다(SCHEMA-008). 【추론】 두 허용 집합의 교집합은 원소마다 취한다: `integer ⊂ number`이므로 `number` ∩ `integer` = `integer`이고, `'null'`은 양쪽에 있을 때만 남으며, 순서는 앞 집합의 순서를 따른다(SCHEMA-008). 【추론】 호스트의 게이트 없는 분기의 `type`은 "또는" 문맥이라 존재만 더하고 교차하지 않는다(SCHEMA-008, SCHEMA-044). U5: 유효 목록은 노드마다 유효 스키마 메모에서 파생하고, 좁히지 않으면 `schemaType`과 같은 참조이며, 병합표의 `type` 행은 교집합이다(SCHEMA-008).

**`default`의 겹침은 생성 순간에만 생긴다.**(SCHEMA-009) WRITE-090 아래에서 `default`는 생성 때만 읽힌다(SCHEMA-009, WRITE-090). `{kind:'a'}`를 로드하면 켜진 `then`의 `default`가 들어가고, 런타임에 `then`이 켜지면 본체 노드가 다시 생기지 않으므로 채우지 않는다(실행)(SCHEMA-009).

로컬 층 안에서 상태 키가 여럿 겹칠 때(표준 `readOnly`, `controls.readOnly`, 켜진 조각의 범위 제어, 부모의 `controls.children` 항목)는 선언은 합집합·제한은 교집합의 원리대로 잠금(`readOnly`·`disabled`)은 하나라도 참이면 잠기고 표시(`active`·`visible`)는 모두 참이어야 켜진다(SCHEMA-010). 코어에 글로벌은 없고, Form 속성의 전체 잠금은 렌더 계층이 그 결과 위에 OR한다(소유자 13라운드)(SCHEMA-010).

작성자 스키마와 앞 조각의 객체를 변이하지 않는다(SCHEMA-039). `options.virtual`의 항목은 가상 노드의 선언이라 병합표가 아니라 조각의 선언 규칙(조각이 선언한 노드는 그 조각과 함께 켜지고 꺼진다, FRAGMENT-001, BLUEPRINT-004)을 따른다(SCHEMA-039, FRAGMENT-001, BLUEPRINT-004). 같은 가상 이름의 `fields`는 순서까지 같아야 하고 다르면 게이트와 무관하게 청사진 오류다(SCHEMA-039, SCHEMA-042, ERROR-192). `options.propertyKeys`·`omitEmpty`·`omitTrailing`은 유효 스키마에서 읽으므로 활성 조각 집합마다 달라도 된다(17라운드 스웜 수렴(편집자 결정))(SCHEMA-039).

【추론】 한 호스트에서 같은 가상 이름의 선언이 여럿이면(본체·조각 어디든) `fields`가 순서까지 같아야 한다(SCHEMA-042). 【추론】 다르면 게이트와 무관하게 청사진 오류다(SCHEMA-042). 【추론】 가상 노드의 신원은 이름이고 값은 `fields` 순서의 튜플이라, 조각 집합에 따라 자식과 튜플 모양이 바뀌는 노드를 두지 않는다(SCHEMA-042). 【추론】 항목의 나머지 키(주석·`options`·`presentation`)는 그 가상 노드의 선언으로서 공유 노드와 같은 병합표를 따른다(SCHEMA-042).

### 01-schema-to-blueprint.md §2.1 청사진 분석과 형태

(BLUEPRINT-001)

```
작성된 스키마 ──(순수 함수, 폼 생성 시 1회)──▶ 청사진 ──▶ 노드 트리
```

- 작성된 스키마는 변형하지 않는다(VALIDATE-004)(BLUEPRINT-001, VALIDATE-004). 분석 결과는 별도 구조에 둔다(BLUEPRINT-001).
- 분석 단계는 노드 없이 테스트할 수 있다(TEST-002)(BLUEPRINT-001, TEST-002).

폼 생성 때(그리고 스키마 교체 때) 한 번 도는 **순수 함수**다(BLUEPRINT-001).

(BLUEPRINT-002, BLUEPRINT-046, BLUEPRINT-047)

```
ObjectBlueprint {
  base:      PropertyDeclaration[]   // properties. 노드 게이트(controls.active)는 그 선언이 든다
  fragments: SchemaFragment[]        // 정적으로 열거된 모든 조각
}
SchemaFragment {
  id          // 작성된 스키마 안의 위치 (schemaPath). 에러 라우팅의 키
  guard       // 게이트: if(검증기 플러그인이 컴파일) | controls.active(표현식) | 없음(항상 참)
  context     // 연언 | 선언, 그리고 어느 oneOf/anyOf의 분기인가 (FRAGMENT-011)
  declares    // 이 조각이 새로 선언하는 property
  constrains  // 기존 property에 얹는 overlay: name → 스키마
  inherited   // 조상에서 끌어올린 조각이 이 호스트에 귀속시킨 overlay (E12, BLUEPRINT-004)
  children    // 중첩 조각 — 감싸는 조각이 활성일 때만 순회한다 (E3, FRAGMENT-011)
}
```

구현 이름은 약어 없는 풀 네임(예: `PropertyDeclaration`)이다(BLUEPRINT-002, BLUEPRINT-046). 구현의 타입 이름은 React `Fragment`와 겹치지 않는 `SchemaFragment`다(BLUEPRINT-002, BLUEPRINT-047).

`forbids` 칸은 없다(BLUEPRINT-003). 금지 구문은 폼이 읽지 않는다(FRAGMENT-019, D-3)(BLUEPRINT-003, FRAGMENT-019).

- "`properties` 밖에도 노드가 있다"는 런타임의 특수 경로가 아니라 청사진의 `declares`를 읽는 일반 경로가 된다(BLUEPRINT-004).
- 조각은 스키마에서 **정적으로 열거된다.**(BLUEPRINT-004) 그래서 "모든 분기 자식을 사전 생성하고 활성만 토글"하는 현재의 트리 모델(D2)을 유지할 수 있다(BLUEPRINT-004).
- 끌어올린 조각의 `then`이 손자를 선언하면 청사진이 그 선언을 자식 호스트의 `inherited`로 귀속시킨다(E12)(BLUEPRINT-004). 게이트는 조상의 것이므로 자식은 자기 바퀴에서 그것을 평가하지 않는다(BLUEPRINT-004).
- `allOf`의 무조건 항목은 게이트가 항상 참인 연언 조각이다(BLUEPRINT-004). 기존 `intersectSchema`는 "활성인 조각들을 SCHEMA-007의 병합표로 합치는 연산"으로 승격된다(BLUEPRINT-004, SCHEMA-007).

폼은 방언 스위치 없이 **두 철자를 모두 읽는다**: `items: [..]`와 `prefixItems`, `definitions`와 `$defs`(목표 C5(지원 방언의 범위), GOAL-018)(BLUEPRINT-005, GOAL-018).

폼은 서브스키마가 **어디에 있고 무엇을 선언하는지**(`properties`, `items`, `prefixItems`, `if`/`then`/`else`, `allOf`/`oneOf`/`anyOf`, `$ref`, `type`)를 읽는다(BLUEPRINT-006). 값이 스키마를 **만족하는지**는 평가하지 않는다(BLUEPRINT-006). 그것은 언제나 `compileGuard`가 답한다(BLUEPRINT-006). 값의 유효성 문법은 읽지 않는다(FRAGMENT-019)(BLUEPRINT-006, FRAGMENT-019). 분기의 `const`·`enum` 값도 읽지 않는다(BLUEPRINT-006). 예외는 작성자가 `controls.discriminator`를 명시한 union 하나다(BLUEPRINT-017)(BLUEPRINT-006, BLUEPRINT-017).

【추론】 규칙은 지금 정한다(BLUEPRINT-030). 【추론】 청사진은 작성 루트에서 닿는 스키마 위치마다 한 번만 만든다(BLUEPRINT-030). 【추론】 `$ref`는 작성 루트 안의 대상 위치(JSON Pointer)로 풀고, 이미 분석한 위치는 다시 분석하지 않고 그 분석을 가리킨다(BLUEPRINT-030). 【추론】 위치는 유한하므로 분석은 언제나 끝난다(BLUEPRINT-030). 【추론】 위치마다 한 번인 것은 그 위치가 스스로 선언하는 조각 표이고, 조상에서 귀속되는 `inherited`는 가리키는 쪽 청사진이 든다(BLUEPRINT-030). 【추론】 한 호스트의 조각을 열거할 때 `$ref`의 대상이 지금 열거 중인 조각 경로에 이미 있으면(조각 안의 순환) 그 자리는 더 펼치지 않는다(BLUEPRINT-030). 【추론】 펼쳐도 같은 선언이 더 깊은 중첩으로 되풀이될 뿐이어서 존재(합집합)가 바뀌지 않기 때문이다(BLUEPRINT-030). 【추론】 자식(`properties`·`items`·`prefixItems`)으로 넘어가는 참조는 그 자식 위치의 청사진을 가리킨다(BLUEPRINT-030). 【추론】 노드는 형상과 값을 따라 만들고, 배열 아이템은 값의 길이만큼만 만든다(SCHEMA-004의 지연 해석)(BLUEPRINT-030, SCHEMA-004). 【추론】 객체 프로퍼티만으로 이어진 순환에서 모든 마디가 게이트 없는 선언이고 터미널 전략인 노드가 하나도 없으면 형상이 무한하므로 청사진 오류(가칭 `JSON_SCHEMA_ERROR.RECURSIVE_SHAPE_UNBOUNDED`)다(BLUEPRINT-030, ERROR-189). 【추론】 순환을 끊는 것은 배열 아이템, 게이트(조각·노드·`children` 항목), 터미널 전략 셋이며, nullable은 끊지 않는다(비객체 호스트의 자식도 형상에 있다, VALUE-036)(BLUEPRINT-030, VALUE-036). 【추론】 게이트로 끊긴 순환은 게이트가 원본 없는 값에서 거짓일 때만 끝난다(`if`는 공허한 참일 수 있다, FRAGMENT-023)(BLUEPRINT-030, FRAGMENT-023). 【추론】 정착에서 노드를 만들 때 같은 청사진 위치가 원본 없는 조상 사슬에서 되풀이되어 앞 되풀이와 게이트 문맥이 같으면(사슬 길이가 순환 안 식·가드의 가장 긴 상대 경로 `..` 수 이상), 그 아래는 끝나지 않는 형상으로 보고 만들지 않으며 정착 오류(가칭 `SCHEMA_FORM_ERROR.RECURSIVE_SHAPE_DIVERGED`, `diagnostics.cause: 'budget'`, 새 `exceededBudget` 값 (가칭) `'recursion'`, 모든 환경 사슬 끝 throw, `degraded`)로 드러낸다(D-2 '고정점이 없는 스키마는 지원 범위 밖, degraded로 관측'과 같은 모양, R17-1)(BLUEPRINT-030, SETTLE-029, ERROR-190). 【추론】 청사진 오류와 정착 오류는 검색으로 가려지도록 이름을 달리한다(BLUEPRINT-030).

### 01-schema-to-blueprint.md §2.2 전순서와 계산 준비

"앞서"와 "나중"은 FRAGMENT-011의 **전순서**(감싸는 조각의 순서, 키워드 순위, 배열 인덱스)로 정의한다(BLUEPRINT-008, FRAGMENT-011). 2라운드 S13(순서가 JSON 키 순서에 기댄다)은 이것으로 닫힌다(BLUEPRINT-008). 노드 게이트는 그 노드를 선언한 조각 바로 뒤에, 같은 조각 안에서는 선언 순서로 든다(BLUEPRINT-008). 같은 호스트의 `oneOf` 분기는 모든 `anyOf` 분기보다 앞이다(BLUEPRINT-008, FRAGMENT-049).

4. **병합표 준비.**(BLUEPRINT-020) SCHEMA-007의 규칙을 적용할 준비를 한다(BLUEPRINT-020, SCHEMA-007). 적용은 정착의 계산 단계에서 켜진 조각에 대해 한다(BLUEPRINT-020).

**메모.**(BLUEPRINT-021) 유효 스키마는 활성 덧씌움 집합(그 노드에 얹힌 켜진 조각들의 집합)마다 메모한다(BLUEPRINT-021). 같은 집합이면 같은 참조를 돌려준다(BLUEPRINT-021).

**통지.**(BLUEPRINT-021) 유효 스키마가 바뀐 노드는 통지의 배달 집합에 든다(EVENT-006)(BLUEPRINT-021, EVENT-006). 게이트 조각이 켜지거나 꺼지면 그 조각이 덧씌운 노드가 여기에 해당한다(BLUEPRINT-021).

`node.jsonSchema`가 정적 값에서 메모된 유효 스키마로 바뀐다(VALUE-002, SCHEMA-007)(BLUEPRINT-021, VALUE-002, SCHEMA-007). `then`이 `enum`을 좁히면 select의 선택지가 바뀌어야 하기 때문이다(BLUEPRINT-021). 유효 스키마가 바뀌면 입력 컴포넌트의 해석 결과도 바뀔 수 있다(`format`이 달라지는 경우 등)(BLUEPRINT-021).

6. **`controls`의 식 컴파일과 역의존 표.**(BLUEPRINT-022) 식이 읽는 경로를 정적으로 뽑아 역의존 표(경로 → 그 경로를 읽는 식을 가진 노드)를 만든다(BLUEPRINT-022). 표시 단계는 쓰기 노드의 조상과 그 역의존 노드의 조상을 재계산 목록에 넣는다(BLUEPRINT-022). 뽑을 수 없는 식은 `controls.watch`로 작성자가 적는다(오늘의 의존 경로 구독과 같은 역할)(BLUEPRINT-022).

**게이트가 무엇을 읽는지는 기본적으로 뽑지 않는다.**(BLUEPRINT-007) 재계산 목록이 닿은 노드에 걸린 게이트를 전부 다시 평가한다(BLUEPRINT-007). 측정에 따르면 AJV에서는 이것으로 충분하다 — 루트에 걸린 좁은 가드 200개를 키 입력마다 전부 돌려 7.9 µs다(TEST-036)(BLUEPRINT-007, TEST-036). "게이트가 걸린 객체의 참조가 그대로면 건너뛴다"는 루트에 걸린 게이트에 대해 효과가 없다(어떤 쓰기든 루트의 참조를 바꾼다)(BLUEPRINT-007).

건너뛰기가 실제로 필요한 경우는 둘이다: 인터프리터형 검증기(같은 작업이 약 70배), 컬렉션을 훑는 게이트(`contains` 등 — 아이템 10,000개에 AJV 190 µs, 인터프리터 4.5 ms)(BLUEPRINT-007, TEST-036). 변경 경로 → 게이트의 역색인은 출발점 고정(SETTLE-029) 아래에서 듣지 않으므로 후보에서 뺐다(E13)(BLUEPRINT-007, SETTLE-029). 남는 최적화는 (a) 무조건 루트 키만 읽는 게이트의 건너뛰기, (b) 조각이 꺼질 때 키 제거를 `delete` 없이 하는 것, (c) 조각 토글마다 전체 리빌드 대신 그 조각이 선언한 키만 패치하는 것(F13)이다(BLUEPRINT-007). 넣을지는 TEST-026의 벤치마크로 정한다(BLUEPRINT-007, TEST-026).

### 01-schema-to-blueprint.md §2.3 노드 종류와 공유

【추론】 스키마에서 오는 노드의 종류는 일곱이다: string, number(`integer` 포함), boolean, null, object, array, `union`(BLUEPRINT-032, BLUEPRINT-035, WRITE-099). `node.type`의 값은 `virtual`을 포함해 여덟이다(BLUEPRINT-032, NODE-057, WRITE-099). nullable은 종류가 아니라 노드의 플래그이고, `type`이 없는 overlay(`{ const }`, `{ enum }`, `{ minimum }`)는 어느 종류와도 맞는다(BLUEPRINT-032). 【추론】 12-9가 확인한 것은 같은 종류의 접기(`number`와 `integer`, `['string','null']`과 `'string'`)이지 종류의 수가 아니다(BLUEPRINT-032). nullable(`type: ['string', 'null']`, `nullable: true`, null 분기와의 `anyOf`/`oneOf` — 현재 `helpers/jsonSchema/isNullBranch`가 알아본다)은 종류가 아니라 노드의 플래그다(BLUEPRINT-032). "같은 타입"을 타입 표기의 동일성이 아니라 **같은 노드 종류**로 다시 정의했다 — `number`와 `integer`, `['string','null']`과 `'string'`은 배타가 아니다(BLUEPRINT-032). `type`에 원시·객체·배열 가운데 둘 이상의 종류가 적힌 칸의 터미널 잎의 종류 이름은 `union`으로 확정하고 가칭을 푼다(가드 `isUnionNode`, 동작 모듈 `unionBehavior/`)(BLUEPRINT-032, BLUEPRINT-035, BLUEPRINT-036). 【추론】 A(d)의 기본은 d 자신의 `type`(문자열이나 배열)의 원소이고, `nullable: true`는 같은 객체에 `type`이 있을 때만 `'null'`을 더하며, `'null'`만 받는 분기는 `{null}`이다(BLUEPRINT-032). 【추론】 A = `{null}`이면 null 종류이고 `nullable: true`이다(BLUEPRINT-032). 【추론】 nullable은 `'null'` ∈ A와 같다(BLUEPRINT-032). 【추론】 형 있는 칸의 null 분기는 nullable을 켜지 않고, 유효 목록을 좁히지 않는다(BLUEPRINT-032).

(BLUEPRINT-010, BLUEPRINT-011, BLUEPRINT-012, BLUEPRINT-041, BLUEPRINT-044, SCHEMA-007, GOAL-015)

| 상황 | 처리 |
| ---- | ---- |
| 같은 이름 + 같은 종류 (어느 조각이든) | **노드 하나를 공유한다.** 활성인 선언이 하나라도 있으면 존재한다. 유효 스키마는 SCHEMA-007의 병합표로 정한다 |
| 같은 이름 + 다른 종류 | 정적 선언이 있는 이름은 정적 선언들의 교집합이 노드 하나를 정하고, 게이트 선언은 그 노드의 종류를 바꾸지 않고 켜진 동안 유효 목록만 좁힌다. 교집합이 비지 않은 정적 선언끼리는 충돌이 아니다. 종류별 노드는 정적 선언이 하나도 없는 이름에만 남는다. 같은 시점에 활성인 선언의 종류가 하나면 그 노드가 산다 |
| 같은 이름 + 다른 종류가 **동시에** 활성 | 충돌이다. 종류가 다른 선언이 함께 켜져도 정적 선언끼리는 허용 집합의 교집합이 비지 않으면, 호스트의 게이트 없는 분기는 fold가 정적 노드의 fold에 들면, 켜진 게이트 선언은 정적 허용 집합과의 교집합이 비지 않으면 노드 하나이고 충돌이 아니다. 충돌을 작성자에게 드러낸다(GOAL-015의 목표 C2(작성자 실수의 가시성)). 게이트 없는 선언끼리는 늘 함께 켜지므로 청사진 오류다(폼이 서지 않는다). 정적 선언(호스트 본체, 게이트 없는 `allOf`, `$ref`)끼리는 교집합으로 노드 하나를 정하고 교집합이 빌 때만 `ALL_OF_TYPE_REDEFINITION`이며, 호스트의 게이트 없는 분기는 fold가 정적 노드의 fold에 들지 않을 때만 `SHARED_NODE_KIND_CONFLICT`다. 게이트에 달린 선언이 실제로 동시에 켜지면 정착 오류다: 마운트에서는 모든 환경에서 폼이 서지 않고 폼 자리에 대체 화면을 그리며(14라운드 O-10), 마운트 뒤에는 전순서에서 앞선 종류의 노드를 살려 커밋하고 통지 뒤 사슬 끝에서 던지며 `degraded`(`cause`는 공유 충돌)가 다음 로드까지 남아 그 동안 제출을 거부한다(17라운드 소유자 답 R17-1 나, ERROR-159). 정적 노드가 있는 칸에서는 켜진 게이트 선언과 정적 허용 집합의 교집합이 빌 때만 정착 오류다. 게이트 가진 선언의 충돌은 청사진에서 판정할 수 없으므로 분석 단계에서 미리 throw하지 않는다 |

같은 종류의 필드는 분기가 바뀌어도 같은 노드이므로 값이 자연스럽게 남는다(BLUEPRINT-010). 현재의 "나가는 노드 reset → 들어오는 노드에 `fallbackValue` 복원 → `validateSchemaType`으로 타입 호환 검사"(`ObjectNode/.../BranchStrategy.ts:479-511`) 절차가 필요 없어진다(BLUEPRINT-010). 【추론】 정적 선언이 하나도 없는 이름은 fold가 같은 선언끼리 노드 하나를 둔다(BLUEPRINT-011). 【추론】 fold가 다른 게이트 선언이 동시에 켜지면 `SHARED_NODE_CONFLICT`이고, 배타이면 종류별 노드이며, 각 노드 안에서는 켜진 선언이 유효 목록을 좁힌다(BLUEPRINT-011, BLUEPRINT-012, BLUEPRINT-044). 게이트 없는 분기끼리 같은 이름·다른 종류의 필드를 두면 두 분기가 늘 함께 켜져 있으므로 위 표의 3행이 된다(BLUEPRINT-012). 【추론】 켜진 게이트 선언과 정적 허용 집합의 교집합(`'null'` 포함)이 빈 경우에는 그 게이트들이 켜진 동안 `SHARED_NODE_CONFLICT`(정착 오류, 기존 처리)로 드러난다(BLUEPRINT-012, BLUEPRINT-041, BLUEPRINT-044). 【추론】 `diagnostics`와 경고 중복 키는 폼 수준 로드(마운트, `FormHandle.reset()`)에서만 초기화한다(BLUEPRINT-012). 【추론】 `setValue(V)`와 `resetSubtree()`는 초기화하지 않는다(BLUEPRINT-012).

게이트를 가진 분기의 `value: string` / `value: number`는 흔하고 정당한 선언이다(BLUEPRINT-013). 게이트가 서로 배타이면 동시에 활성이 되지 않는다(BLUEPRINT-013). 배타인지는 작성자의 스키마가 정하며 폼은 검사하지 않는다(BLUEPRINT-013). `allOf: [{ if k=a then v:string }, { if k=b then v:number }]`도 같은 방식으로 동작한다(BLUEPRINT-013). 게이트가 동시에 참이 되는 스키마를 썼다면 그것은 작성자의 실수이고, 검증기도 그 값을 기각한다(BLUEPRINT-013).

**게이트 없는 `oneOf`·`anyOf` 분기가 노드를 공유하면 존재만 더하고 제약은 교차하지 않는다.**(BLUEPRINT-014) 분기는 선언("또는") 문맥이다(BLUEPRINT-014). 순수 분기 둘이 `kind`에 `{ const: 'a' }`와 `{ const: 'b' }`를 두면 교차는 공집합이 되어 검증기보다 좁은 힌트를 낸다(BLUEPRINT-014). 켜진 게이트 조각(게이트 가진 분기 안 `if`의 `then`, 본체·`allOf`의 `then`, `controls.active`를 가진 분기, `controls.discriminator`로 변환된 분기)은 작성자가 "이 분기가 해당한다"고 선언한 것이므로 연언으로 교차한다(FRAGMENT-001, BLUEPRINT-014).

**정적 연언(본체와 게이트 없는 `allOf`)의 교차가 공집합이면 청사진 오류로 throw하고, 켜진 `then`과의 런타임 교차가 공집합이면 throw하지 않고 검증기가 값을 기각한다.**(BLUEPRINT-016, SCHEMA-008) `type`은 켜진 게이트 선언과 정적 허용 집합의 교집합이 비면 그 게이트들이 켜진 동안의 정착 오류(`SHARED_NODE_CONFLICT`)다(BLUEPRINT-016, BLUEPRINT-041, BLUEPRINT-044). 서로소인 `enum` 둘이 켜진 조각과의 연언에서 동시에 활성이면 그 필드는 "지금 고를 수 있는 값이 없는" 상태가 되고, 폼은 막지 않으며 검증기가 값을 기각한다(BLUEPRINT-016). 필드를 비우면 값이 유효해지는 경우가 있으므로 폼 전체를 멈춰서는 안 된다(R11-e)(BLUEPRINT-016).

다음은 합의 근거의 기록이다(BLUEPRINT-025). 같은 이름 + 같은 타입이면 노드 하나를 공유한다 — 소유자: "동의합니다."(BLUEPRINT-025). 타입이 다르면 오류 — 소유자: "타입이 달라버리면 우리로서는 답이 없지만(이 경우엔 오류가 throw 되겠지)."(BLUEPRINT-025). 개정분은 이 오류를 둘로 가른다(BLUEPRINT-025). 게이트 없는 선언끼리의 충돌은 분석 단계(청사진)의 오류이고, 게이트에 달린 선언이 실제로 동시에 켜진 충돌은 정착의 오류다(BLUEPRINT-012의 표)(BLUEPRINT-025, BLUEPRINT-012). 경고가 아니라 오류로 드러내는 것은 14라운드 O-10 소유자 답("경고만 일어나고 동작하는것처럼 보이는게 더 위험합니다")이다(BLUEPRINT-025). 드러남의 환경 규칙은 17라운드 소유자 답 R17-1 나("망가진 값을 올리는게 더 위험하겠다")로 정해졌다: 모든 환경에서 던지고 `degraded` 동안 제출을 거부한다(BLUEPRINT-025). `controls.discriminator`는 예외적 허용이며 분기 스키마를 고치지 않는다 — 소유자(22): "동의합니다. 이 경우에 대한 예외적 허용을 하죠. … 우리는 "&active": 을 더하는거지 스키마를 수정하는건 아니니까"(BLUEPRINT-025). 병합표 — 소유자(7): "세부적인 규칙이 포괄적인 규칙을 덮는 기존 관례를 따릅니다"(BLUEPRINT-025). (16·17): 예(BLUEPRINT-025). (18): "깊은 병합을 했으면 합니다. … 이때는 common-utils 의 merge 를 쓰죠"(BLUEPRINT-025). (12): "props 로 전달되는 글로벌 값이 개별 값을 덮도록 하는게 맞습니다. rootJSONSchema 도 props 와 동치"(BLUEPRINT-025). (13): "글로벌과 로컬만 보고, 중간단계 상태 상속은 구현을 하지 않으려고 합니다"(BLUEPRINT-025). (13라운드 1, 12를 개정): "글로벌 readOnly 나 disabled 같은 개념은 없애고 모든 control 필드는 자체 노드만 지원. children 그룹은 예외."(BLUEPRINT-025). (13라운드 3): "제어용 필드들에 대해서만 &를 붙이는 방향으로 가자."(BLUEPRINT-025).

되돌림 가능성의 기록이다(BLUEPRINT-026). 청사진의 구체적 형태는 내부 구조여서 바꾸기 쉽다(BLUEPRINT-026). 노드 공유 규칙은 값 보존 동작을 정하므로 공개 후에는 바꾸기 어렵다(BLUEPRINT-026). `controls.discriminator`는 예약 층의 공개 키이므로 들이면 되돌리기 어렵다(BLUEPRINT-026).

### 01-schema-to-blueprint.md §2.4 명시 판별

GOAL-034의 축 1항("`enum`·`const` 판별식은 쓰지 않는다")의 유일한 예외다(BLUEPRINT-017, GOAL-034). 근거는 축 1항(폼은 JSON Schema 문법을 해석하지 않는다)의 예외(소유자 동의, 10라운드)와 축 7항(JSON Schema 표현은 `controls` 표현으로 대체할 수 있어야 한다)이다(BLUEPRINT-017, GOAL-034, GOAL-040).

**선언.**(BLUEPRINT-017) 작성자가 variant 호스트(`oneOf`·`anyOf`를 가진 객체 스키마)에 예약 층 키 `controls: { discriminator: '<key>' }`를 적는다(BLUEPRINT-017, BLUEPRINT-035). 적지 않은 variant 호스트의 `const`·`enum`은 읽지 않는다(BLUEPRINT-017, BLUEPRINT-035). OpenAPI의 `discriminator.propertyName`도 예약 층의 키가 아니므로 읽지 않는다(BLUEPRINT-017).

**변환.**(BLUEPRINT-017) 청사진 단계가 각 분기에서 그 키의 `const`·`enum`을 읽어, 그 분기를 `controls: { active: "./<key> === <value>" }`를 가진 조각 객체로 다룬다(BLUEPRINT-017). `enum`이면 값이 그 목록에 드는가를 본다(BLUEPRINT-017). 변환된 분기는 FRAGMENT-001 조각 표의 3행(연언)이 된다(BLUEPRINT-017, FRAGMENT-001).

**분기 스키마는 손대지 않는다.**(BLUEPRINT-017) `kind: { const }`와 `required`는 그대로 검증기에 간다(BLUEPRINT-017, SCHEMA-006). 결과는 청사진의 `SchemaFragment.guard`에 든 `controls.active` 식뿐이다(BLUEPRINT-017, BLUEPRINT-047). 소유자: "우리는 "&active": 을 더하는거지 스키마를 수정하는건 아니니까"(BLUEPRINT-017).

**청사진 단계에서 끝난다.**(BLUEPRINT-017) 상태 칸(원본과 `extras` 둘)도 작업 루프도 바꾸지 않는다(BLUEPRINT-017). 변환된 게이트는 다른 `controls.active`와 같이 호스트 바퀴에서 평가된다(BLUEPRINT-017).

**판별 프로퍼티는 본체에 선언한다**(GOAL-035, BLUEPRINT-017). 폼이 소유하지 않고, 분기 값의 합집합 `enum`을 만들지도 않으며, 암묵 default도 없다(BLUEPRINT-017). 채움의 원천은 `controls.default` > `default` > 없음뿐이다(BLUEPRINT-017).

ajv의 `discriminator: true`는 pydantic 출력에도 throw하므로 플러그인이 켜지 못한다(BLUEPRINT-018). `controls.discriminator`는 검증기 옵션이 아니라 폼의 예약 층이다(BLUEPRINT-018). 이 규칙은 현재의 "`type`/`$ref`가 없는 `const`/`enum`이면 판별식"(`getCompositionKeyInfo.ts:33`, `getExpressionFromSchema.ts:35-51` — 두 파일이 서로를 언급하지 않은 채 같은 암묵 규칙에 기댄다)과 `COMPOSITION_PROPERTY_REDEFINITION` throw(`getCompositionNodeMapList.ts:95-105`)를 대체한다(BLUEPRINT-018). 명시 없이 자동 감지에 기대던 스키마는 이주 안내 대상이다(BLUEPRINT-018). 그런 스키마는 `controls.discriminator`를 더하거나 분기 안에 `if/then/else: false`를 쓴다(BLUEPRINT-018, FRAGMENT-030). `JSONSchema` 타입이 `kind: { const: 'a' }`를 받아들이게 하는 것은 목표 C4(표준 스키마의 타입 수용과 추론)다(BLUEPRINT-018, GOAL-017).

### 01-schema-to-blueprint.md §3.6 명시 판별자의 변환

작성자가 union 호스트에 예약 층 키 `controls.discriminator`를 적으면, 청사진이 각 분기에서 그 키의 `const`·`enum`을 읽어 그 분기를 `controls: { active: "./<key> === <value>" }`를 가진 조각 객체처럼 다룬다(`enum`이면 값이 그 목록에 드는가)(FRAGMENT-008). 변환된 분기는 FRAGMENT-001의 표 3행이 된다(FRAGMENT-008, FRAGMENT-001). **분기 스키마는 손대지 않는다.**(FRAGMENT-008) `kind: { const }`와 `required`는 그대로 검증기에 간다(FRAGMENT-008, SCHEMA-006). 소유자: "우리는 "&active": 을 더하는거지 스키마를 수정하는건 아니니까"(FRAGMENT-008). 변환은 청사진 단계에서 끝난다(FRAGMENT-008). 상태 칸과 작업 루프를 바꾸지 않는다(FRAGMENT-008, BLUEPRINT-017). 판별 프로퍼티는 작성자가 본체 `properties`에 선언한다(GOAL-035의 축 2항(조건 프로퍼티는 `properties`에 선언한다), 컨벤션)(FRAGMENT-008, GOAL-035). 폼이 소유하지 않는다(FRAGMENT-008). 암묵 default는 없다(FRAGMENT-008). 채움의 원천은 `controls.default` > `default` > 없음뿐이다(WRITE-090)(FRAGMENT-008, WRITE-090). 값이 비어 있으면 `===` 비교가 모두 거짓이므로 어느 분기도 켜지지 않는다(FRAGMENT-008).

【추론】 분기에서 판별 키의 `const`·`enum`을 찾는 범위는 그 분기의 정적 연언이다(FRAGMENT-048). 【추론】 곧 분기 본체, 게이트 없는 `allOf` 항목, 그리고 이것들이 `$ref`로 가리키는 대상이다(재귀, BLUEPRINT-030의 순환 절단을 따름)(FRAGMENT-048, BLUEPRINT-030). 【추론】 그 키 프로퍼티 스키마도 같은 정적 연언(자기 `$ref`, 게이트 없는 `allOf`)에서 모은다(FRAGMENT-048). 【추론】 `if/then`, 게이트 가진 `allOf` 항목, 중첩 `oneOf`·`anyOf`는 보지 않는다(FRAGMENT-048). 【추론】 한 분기에서 모은 `const`·`enum`은 정적 연언의 교차로 합친다(FRAGMENT-048). 【추론】 교차가 공집합이면 정적 연언의 청사진 오류다(FRAGMENT-048). 【추론】 끌어올림(O-1)도 이렇게 모은 선언을 쓴다(FRAGMENT-048). 【추론】 null 분기(`isNullBranch`)는 노드의 nullable 플래그이므로 판별 대상 분기로 세지 않는다(FRAGMENT-048). 【추론】 null 분기에 판별 키가 없는 것은 키 없음도 오류도 아니다(FRAGMENT-048). 【추론】 분기가 자기 `controls.active`도 가지면 그 분기의 게이트는 `(변환식) && (분기 식)` 하나다(FRAGMENT-048). 【추론】 판별 키가 없는 분기가 자기 `controls.active`를 가지면 그 식만이 게이트다(FRAGMENT-048).

그 키의 분기 선언을 게이트 없는 선언으로도 취급해 끌어올린다(14라운드 답 O-1: 태그 키가 분기 안에만 있는 생성기 스키마도 그대로 받는다)(FRAGMENT-007). 있는 분기끼리 종류가 다르거나 `const`·`enum` 값이 겹치면 청사진 오류다(FRAGMENT-007). 일부 분기에만 없는 것은 그 분기가 게이트 없음일 뿐이다(FRAGMENT-007). 소유자(14라운드 O-1): "가 로 하죠. 다만, discriminator 를 서로 다르게 선언했거나 discriminator 이 분기마다 다른 타입이나 성질을 가지면 오류로 알려줘야 합니다."(FRAGMENT-007) `controls.discriminator`의 키가 어느 분기에도 `const`·`enum`으로 없거나, 있는 분기끼리 종류가 다르거나 값이 겹침(O-1. 일부 분기에만 없는 것은 그 분기가 게이트 없음일 뿐 오류가 아니다)(FRAGMENT-007). 청사진 분석: `controls.discriminator` 키가 어느 분기에도 없거나, 분기끼리 종류가 다르거나 값이 겹치거나, 선언 사이 값이 다름(FRAGMENT-007). 한 분기의 정적 연언에 판별 선언이 여럿이면 그 교차가 공집합일 때만 청사진 오류이고, 겹치면 교차를 쓴다(FRAGMENT-007, FRAGMENT-048).

【추론】 판별 키가 union이어도 FRAGMENT-007의 분기 규칙은 그대로다(BLUEPRINT-017)(FRAGMENT-007, FRAGMENT-055, BLUEPRINT-017). 【추론】 분기의 `const`·`enum` 리터럴의 JSON 종류가 판별 키의 목록(`schemaType`, 원소 하나인 경우 포함)과 nullable 어디에도 없으면, 청사진이 개발 모드 경고 `(가칭) SCHEMA_FORM_WARNING.DISCRIMINATOR_BRANCH_UNREACHABLE`을 낸다(FRAGMENT-007, FRAGMENT-055).

## 설계문서

- `design/01-schema-to-blueprint.md` §1.3 (SCHEMA-007, SCHEMA-008, SCHEMA-009, SCHEMA-010, SCHEMA-012, SCHEMA-013, SCHEMA-039)
- `design/01-schema-to-blueprint.md` §2.1 (BLUEPRINT-001, BLUEPRINT-002, BLUEPRINT-003, BLUEPRINT-004, BLUEPRINT-005, BLUEPRINT-006)
- `design/01-schema-to-blueprint.md` §2.2 (BLUEPRINT-008, BLUEPRINT-020, BLUEPRINT-021, BLUEPRINT-007)
- `design/01-schema-to-blueprint.md` §2.3 (BLUEPRINT-010, BLUEPRINT-011, BLUEPRINT-012, BLUEPRINT-013, BLUEPRINT-014, BLUEPRINT-016, BLUEPRINT-025, BLUEPRINT-026)
- `design/01-schema-to-blueprint.md` §2.4 (BLUEPRINT-017, BLUEPRINT-018)
- `design/01-schema-to-blueprint.md` §3.6 (FRAGMENT-008)
