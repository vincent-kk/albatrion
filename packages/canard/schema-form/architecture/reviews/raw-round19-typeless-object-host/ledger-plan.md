# 19라운드 원장 반영 계획 — 번호 배정과 정확한 편집

작업 디렉토리: `packages/canard/schema-form/architecture/`. 아래 편집은 글자 그대로 적용한다. 옛 결정과 옛 줄은 고치지 않는다(옛 글은 자라기만 한다). 줄 번호는 편집 전 기준이며, 같은 파일에서 여러 편집을 할 때는 아래에서 위로(큰 줄 번호부터) 적용하면 어긋나지 않는다. 정본 `reviews/round-19-closing.md`(이하 C19)와 `reviews/round-19-owner-answers.md`(이하 A19)는 이미 있으며 고치지 않는다.

정본 줄 배정: C19 9–23 → BLUEPRINT-048, 24–25·44 → NODE-059, 26–27 → LANDING-207, 28–30·46–47 → TEST-079, 37–43 → BLUEPRINT-050, 45 → LANDING-208. 새 항목의 결정 칸은 그 줄을 `  > ` 뒤에 글자 그대로(앞의 `  - ` 제거) 인용한다.

## 1. `ledger/blueprint.md`

### 1-1. 색인표(55행 뒤에 네 행 추가, 순서대로)

```
| BLUEPRINT-048 | 자기 `type` 없는 칸의 객체·배열 분기 — 접은 집합 F가 `{object}`·`{array}`면 variant 호스트로 추정, U 절차와 게이트 분기 제외, nullable은 `'null'` ∈ U, `items`는 명시 호스트와 같은 규칙, S4·S6 자리, 혼합은 `UNKNOWN_JSON_SCHEMA`, ⊤ 분기, 재귀와 순환 절단, 대체 범위, E16 | 현행 | 소유자 답(`reviews/round-19-owner-answers.md:7` 형 없는 객체 호스트), 편집자 결정(19라운드, `reviews/round-19-closing.md` 19C-01) |
| BLUEPRINT-049 | object variant 호스트는 건드리지 않음 — 소유자 답 33행은 object·array와 원시를 섞는 경우만 다루며, 그 칸을 푸는 것은 뒤로(나중에 풀어도 비파괴) | 현행 | 소유자 답(`reviews/round-18-owner-answers.md:33` union O3) |
| BLUEPRINT-050 | `type` 없이 `const`·`enum`만 있는 분기 없는 칸 — 리터럴의 JSON 종류로 원시 잎·null 잎, 종류 혼합·객체 리터럴은 `UNKNOWN_JSON_SCHEMA`, 분기 안의 `const`는 그대로 오류, 소유자 답 30행 첫 문장 대체, ERROR-164 "언제" | 현행 | 소유자 답(`reviews/round-19-owner-answers.md:8` `const`만 있는 프로퍼티(X1)), 편집자 결정(19라운드, `reviews/round-19-closing.md` 19C-02) |
| BLUEPRINT-051 | 자기 `type` 없는 칸의 원시 `oneOf`·`anyOf` — 분기 허용 집합 A(b), 합집합 U(`oneOf`와 `anyOf`가 함께면 교집합), `'null'`은 뒤에 뗌, 빈 U는 `UNKNOWN_JSON_SCHEMA`, `{null}`은 null 종류, 게이트 분기 제외, 형 없는 칸의 `nullable`은 효과 없음 | 현행 | 소유자 답(`reviews/round-18-owner-answers.md:30` union 형 없는 분기) |
```

### 1-2. 색인표 45행(BLUEPRINT-037)과 47행(BLUEPRINT-039)의 상태 칸

- 45행: `| 현행 |` → `| 분할됨(→ BLUEPRINT-051, BLUEPRINT-050) |`
- 47행: `| 현행 |` → `| 분할됨(→ BLUEPRINT-049, BLUEPRINT-048) |`

### 1-3. 항목 BLUEPRINT-037(643–662행)

- 658행 `- 상태: 현행` → `- 상태: 분할됨(→ BLUEPRINT-051, BLUEPRINT-050)`

### 1-4. 항목 BLUEPRINT-038(664–675행)

- 669–670행의 보충 뒤(670행 뒤)에 두 줄 추가:
```
  > 편집자 결정(19C-02): "이 규칙은 분기가 없는 칸에만 적용되며, 분기 안의 `const`·`enum`만 있는 분기(소유자 답 32행, E14)는 그대로 `UNKNOWN_JSON_SCHEMA`다." (`reviews/round-19-closing.md:39`)
  > 편집자 결정(19C-02): "【추론】 19C-01의 재귀가 분기 b를 볼 때 b의 정적 연언에 `type`도 분기도 없으면 b의 허용 집합은 소유자 답 32행대로 ⊤이다." (`reviews/round-19-closing.md:41`)
```

### 1-5. 항목 BLUEPRINT-039(677–691행)

- 687행 `- 상태: 현행` → `- 상태: 분할됨(→ BLUEPRINT-049, BLUEPRINT-048)`

### 1-6. 항목 BLUEPRINT-044(799–847행) — 충돌 절 추가

이 항목에는 `- 충돌:` 절이 없다. 항목의 마지막 줄(`- 까닭: …`, `### BLUEPRINT-045` 바로 앞의 빈 줄 위) 뒤에 추가:
```
- 충돌:
  > `reviews/round-18-closing.md:2397`의 "【추론】 S3(C에 `type`이 없는 칸)은 `reviews/round-18-owner-answers.md:30`·`:32`·`:33`을 따른다."는 19라운드 결정과 다르다: S3는 그 셋과 19C-01·19C-02도 따른다(BLUEPRINT-048, BLUEPRINT-050). 19라운드 결정이 이긴다(`reviews/round-19-closing.md:9-23,37-43`).
```

### 1-7. 항목 BLUEPRINT-045(848–901행) — 기존 충돌 절(900행)에 한 줄 추가

기존 충돌 인용 줄 뒤(항목 끝)에 추가:
```
  > `reviews/round-18-closing.md:2431`의 "【추론】 E16: 자기 형 없는 `{oneOf:[{type:'object',…},{type:'object',…}]}`는 `UNKNOWN_JSON_SCHEMA`(오늘과 같음)."는 19라운드 결정과 다르다: E16은 object / `'object'` / false / NODE-028 순서(variant 호스트)다(BLUEPRINT-048). 19라운드 결정이 이긴다(`reviews/round-19-closing.md:23`).
```

### 1-8. 새 항목 넷 — 파일 끝(BLUEPRINT-047 뒤)에 순서대로 추가

각 항목 앞에 빈 줄 하나. 결정 칸의 인용은 C19의 해당 줄에서 앞의 `  - `를 `  > `로 바꾼 것이며 본문은 글자 그대로다(C19를 열어 복사한다).

```
### BLUEPRINT-048 자기 `type` 없는 칸의 객체·배열 분기 — 접은 집합 F가 `{object}`·`{array}`면 variant 호스트로 추정, U 절차와 게이트 분기 제외, nullable은 `'null'` ∈ U, `items`는 명시 호스트와 같은 규칙, S4·S6 자리, 혼합은 `UNKNOWN_JSON_SCHEMA`, ⊤ 분기, 재귀와 순환 절단, 대체 범위, E16

- 결정:
  > (C19 9행)
  > (C19 10행)
  > … (C19 23행까지, 모두 15줄)
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
- 출처: `reviews/round-18-owner-answers.md:33`(정본, 반영 칸, BLUEPRINT-039에서 분할)
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:33` union O3)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:33`

### BLUEPRINT-050 `type` 없이 `const`·`enum`만 있는 분기 없는 칸 — 리터럴의 JSON 종류로 원시 잎·null 잎, 종류 혼합·객체 리터럴은 `UNKNOWN_JSON_SCHEMA`, 분기 안의 `const`는 그대로 오류, 소유자 답 30행 첫 문장 대체, ERROR-164 "언제"

- 결정:
  > (C19 37행)
  > … (C19 43행까지, 모두 7줄)
- 보충:
  > 소유자(`const`만 있는 프로퍼티(X1)): "좋습니다. 가. 수용합니다. 원장을 이 브랜치에서 바로 수정하고, 답변할 내용 만들어주세요" (`reviews/round-19-owner-answers.md:8`)
- 상태: 현행
- 출처: `reviews/round-19-closing.md:37-43`(정본), `reviews/round-19-owner-answers.md:8`
- 닫은 사람: 소유자 답(`reviews/round-19-owner-answers.md:8` `const`만 있는 프로퍼티(X1)), 편집자 결정(19라운드, `reviews/round-19-closing.md` 19C-02)
- 라운드: 19
- 까닭: `reviews/round-19-closing.md:48`

### BLUEPRINT-051 자기 `type` 없는 칸의 원시 `oneOf`·`anyOf` — 분기 허용 집합 A(b), 합집합 U(`oneOf`와 `anyOf`가 함께면 교집합), `'null'`은 뒤에 뗌, 빈 U는 `UNKNOWN_JSON_SCHEMA`, `{null}`은 null 종류, 게이트 분기 제외, 형 없는 칸의 `nullable`은 효과 없음

- 결정:
  > (blueprint.md 647행의 인용 줄 그대로)
  > … (655행까지, 모두 9줄 — BLUEPRINT-037 결정의 둘째 줄부터 끝까지 글자 그대로)
- 보충:
  > 소유자(union 형 없는 분기): "나 로 할 수 있었으면 좋겠습니다" (`reviews/round-18-owner-answers.md:30`)
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:30`(정본, 반영 칸, BLUEPRINT-037에서 분할)
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:30` union 형 없는 분기)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:30`
```

## 2. `ledger/node.md`

### 2-1. 색인표 — 마지막 행(NODE-058, `## 항목` 앞의 마지막 표 행) 뒤에 추가

```
| NODE-059 | 형 없는 객체·배열 분기 호스트와 `const`만 있는 칸의 공개 형 — 분기가 모두 인라인 객체(또는 배열)면 `ObjectNode`·`ArrayNode`와 분기 값 형의 합, `$ref`·게이트 분기·두 키워드·`allOf`는 넓은 형 그대로, `const`·`enum` 칸은 리터럴 형 | 현행 | 편집자 결정(19라운드, `reviews/round-19-closing.md` 19C-01·19C-02) |
```

### 2-2. 항목 NODE-058 — 기존 충돌 절 끝에 한 줄 추가

```
  > `reviews/round-18-closing.md:2357`의 "【추론】 형 없는 분기(`const`·`enum`만 있는 것 포함), 객체·원시 혼합 분기, 모든 분기가 객체(또는 배열)인 형 없는 칸은 `never`와 `unknown`이다."는 19라운드 결정과 다르다: 모든 분기가 인라인 객체(또는 배열)인 형 없는 칸은 `ObjectNode`(또는 `ArrayNode`)와 분기 값 형의 합이고, 분기 없는 `const`·`enum` 칸은 리터럴 형이며, 형 없는 분기와 혼합 분기는 그대로다(NODE-059). 19라운드 결정이 이긴다(`reviews/round-19-closing.md:24-25,44`).
```

### 2-3. 새 항목 — 파일 끝에 추가

```
### NODE-059 형 없는 객체·배열 분기 호스트와 `const`만 있는 칸의 공개 형 — 분기가 모두 인라인 객체(또는 배열)면 `ObjectNode`·`ArrayNode`와 분기 값 형의 합, `$ref`·게이트 분기·두 키워드·`allOf`는 넓은 형 그대로, `const`·`enum` 칸은 리터럴 형

- 결정:
  > (C19 24행)
  > (C19 25행)
  > (C19 44행)
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-19-closing.md:24-25,44`(정본)
- 닫은 사람: 편집자 결정(19라운드, `reviews/round-19-closing.md` 19C-01·19C-02)
- 라운드: 19
- 까닭: `reviews/round-19-closing.md:31,48`
```

## 3. `ledger/landing.md`

### 3-1. 색인표 — 216행(LANDING-206) 뒤에 두 행 추가

```
| LANDING-207 | 이주(19라운드) — 형 없는 객체 분기 `oneOf`·`anyOf`(pydantic·zod·OpenAPI·TypeBox)는 object variant 호스트, `Optional[Self]`는 `RECURSIVE_SHAPE_UNBOUNDED` | 현행 | 편집자 결정(19라운드, `reviews/round-19-closing.md` 19C-01) |
| LANDING-208 | 이주(19라운드) — `type` 없이 `const`·`enum`만 있는 프로퍼티(OpenAPI 3.1·JSON Schema 2020-12 관용구, 수기 태그)는 리터럴 종류의 원시 잎 | 현행 | 편집자 결정(19라운드, `reviews/round-19-closing.md` 19C-02) |
```

### 3-2. 항목 LANDING-128(1952행부터) — `- 보충: 없음`(1956행)을 다음 두 줄로 바꾼다

```
- 보충:
  > 편집자 결정(19C-01): "【추론】 pydantic `Optional[Self]`처럼 그 호스트가 게이트 없는 객체 프로퍼티 순환을 이루면 실패 코드가 `UNKNOWN_JSON_SCHEMA`에서 `RECURSIVE_SHAPE_UNBOUNDED`로 바뀐다." (`reviews/round-19-closing.md:27`)
```

### 3-3. 새 항목 둘 — 파일 끝에 추가

```
### LANDING-207 이주(19라운드) — 형 없는 객체 분기 `oneOf`·`anyOf`(pydantic·zod·OpenAPI·TypeBox)는 object variant 호스트, `Optional[Self]`는 `RECURSIVE_SHAPE_UNBOUNDED`

- 결정:
  > (C19 26행)
  > (C19 27행)
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-19-closing.md:26-27`(정본)
- 닫은 사람: 편집자 결정(19라운드, `reviews/round-19-closing.md` 19C-01)
- 라운드: 19
- 까닭: `reviews/round-19-closing.md:31`

### LANDING-208 이주(19라운드) — `type` 없이 `const`·`enum`만 있는 프로퍼티(OpenAPI 3.1·JSON Schema 2020-12 관용구, 수기 태그)는 리터럴 종류의 원시 잎

- 결정:
  > (C19 45행)
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-19-closing.md:45`(정본)
- 닫은 사람: 편집자 결정(19라운드, `reviews/round-19-closing.md` 19C-02)
- 라운드: 19
- 까닭: `reviews/round-19-closing.md:48`
```

## 4. `ledger/test.md`

### 4-1. 색인표 — 마지막 행(TEST-078) 뒤에 추가

```
| TEST-079 | 19라운드 게이트(PR 02) — E16 새 기대와 형 없는 호스트 사례(게이트 분기만·`{object,array}`·⊤ 분기·순환 절단과 빈 U), 순환 절단 구현, 코퍼스 14종 원본 그대로, `const` 칸 사례, `union.migration-shapes`에 LANDING-207·208 | 현행 | 편집자 결정(19라운드, `reviews/round-19-closing.md` 19C-01·19C-02) |
```

### 4-2. 항목 TEST-067(1083행부터) — `- 보충: 없음`을 다음으로 바꾼다

```
- 보충:
  > 편집자 결정(19C-01): "【추론】 게이트(PR 02): TEST-067(b)는 코퍼스 14종을 시험 파일로 돌려 원본 그대로 서야 하며, 통과하지 못하는 표본은 소유자에게 올린다." (`reviews/round-19-closing.md:30`)
```

### 4-3. 항목 TEST-077(1288행부터) — 보충 절 끝에 두 줄, 충돌 절 끝에 한 줄 추가

보충 절(마지막 `> 반영 칸(설계서 메모 4): …` 줄) 뒤:
```
  > 편집자 결정(19C-01): "【추론】 시험 `union.migration-shapes.render.test.tsx`에 LANDING-207의 모양을 더한다." (`reviews/round-19-closing.md:28`)
  > 편집자 결정(19C-02): "【추론】 시험 `union.migration-shapes.render.test.tsx`에 LANDING-208의 모양을 더한다." (`reviews/round-19-closing.md:46`)
```
충돌 절(마지막 인용 줄, `### TEST-078` 앞) 뒤:
```
  > `reviews/round-18-closing.md:2672`의 "예 E1–E42(18C-90)의 종류·`schemaType`·nullable·전략·오류가 모두 표대로다"는 19라운드 결정과 다르다: E16은 19C-01의 새 기대를 단언한다(BLUEPRINT-048, TEST-079). 19라운드 결정이 이긴다(`reviews/round-19-closing.md:23`).
```

### 4-4. 새 항목 — 파일 끝에 추가

```
### TEST-079 19라운드 게이트(PR 02) — E16 새 기대와 형 없는 호스트 사례(게이트 분기만·`{object,array}`·⊤ 분기·순환 절단과 빈 U), 순환 절단 구현, 코퍼스 14종 원본 그대로, `const` 칸 사례, `union.migration-shapes`에 LANDING-207·208

- 결정:
  > (C19 28행)
  > (C19 29행)
  > (C19 30행)
  > (C19 46행)
  > (C19 47행)
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-19-closing.md:28-30,46-47`(정본)
- 닫은 사람: 편집자 결정(19라운드, `reviews/round-19-closing.md` 19C-01·19C-02)
- 라운드: 19
- 까닭: `reviews/round-19-closing.md:31,48`
```

## 5. `ledger/error.md`

### 5-1. 항목 ERROR-164(2398행부터) — 기존 충돌 절 끝(다음 `### ERROR-165` 앞)에 한 줄 추가

```
  > `reviews/round-18-closing.md:2458`의 "형 없는 칸의 빈 U와 객체·배열 분기(`:30`·`:33`)"는 19라운드 결정과 다르다: "형 없는 칸의 빈 U와 객체·배열이 다른 종류와 섞인 분기"로 읽고, "분기도 `const`·`enum`도 없는 형 없는 칸"과 "리터럴의 종류가 섞이거나 객체·배열인 `const`·`enum`"을 더한다(BLUEPRINT-048, BLUEPRINT-050). 19라운드 결정이 이긴다(`reviews/round-19-closing.md:22,43`).
```

### 5-2. 항목 ERROR-203(3003행부터) — 충돌 절이 없으므로 항목 끝(`- 까닭: …` 뒤, `### ERROR-204` 앞 빈 줄 위)에 추가

```
- 충돌:
  > `reviews/round-18-closing.md:2458`의 "형 없는 칸의 빈 U와 객체·배열 분기(`:30`·`:33`)"는 19라운드 결정과 다르다: "형 없는 칸의 빈 U와 객체·배열이 다른 종류와 섞인 분기"로 읽고, "분기도 `const`·`enum`도 없는 형 없는 칸"과 "리터럴의 종류가 섞이거나 객체·배열인 `const`·`enum`"을 더한다(BLUEPRINT-048, BLUEPRINT-050). 19라운드 결정이 이긴다(`reviews/round-19-closing.md:22,43`).
```

## 6. `ledger/checks/owner-answers.tsv` — 끝에 두 행 추가(탭 구분, 열: path:line, round, label, text)

text 열은 답 칸의 첫 80자이며 80자를 넘으면 `...`를 붙인다(기존 행의 모양을 따른다).

```
reviews/round-19-owner-answers.md:7	19	형 없는 객체 호스트	"좋습니다. 두번째 길로 가보죠. $ref 로 정의된 스키마도, 해당 노드를 생성하는 시점에 $ref 가 아닌 실제 노드로 풀어낼거고, 그럼 최소한 그 노드들에 대해서는...
reviews/round-19-owner-answers.md:8	19	`const`만 있는 프로퍼티(X1)	"좋습니다. 가. 수용합니다. 원장을 이 브랜치에서 바로 수정하고, 답변할 내용 만들어주세요" (2026-09-27)
```

## 7. 편집 뒤 검사 순서(모두 `architecture/`에서, 출력 마지막 줄을 그대로 보고)

```
node ledger/checks/expand-split-pointers.mjs ledger/checks/sentence-classified.tsv -- ledger/*.md
node ledger/checks/verbatim-check.mjs . ledger/*.md
node ledger/checks/sup-check.mjs . ledger/*.md
node ledger/checks/ref-check.mjs ledger/*.md
node ledger/checks/owner-cited.mjs ledger/checks/owner-answers.tsv ledger/*.md
node ledger/checks/bundle.mjs . ledger/checks/section-map.tsv $TMPDIR/bundles
for d in GOAL SCHEMA CONTROLS BLUEPRINT FRAGMENT VALUE WRITE SETTLE EVENT VALIDATE ERROR NODE REACT SURFACE LANDING TEST PROCESS; do node ledger/checks/sentence-check.mjs $TMPDIR/bundles/bundle-$d.md ledger/checks/sentence-classified.tsv ledger/*.md | tail -1; done
node ledger/checks/tokens.mjs inventory $TMPDIR/inv.json 0*.md open-questions.md adr/*.md README.md HANDOFF.md
node ledger/checks/tokens.mjs check $TMPDIR/inv.json ledger/*.md | head -1
node ledger/checks/plan-links.mjs plan/README.md plan/*/*.md -- ledger/*.md
```

기대: verbatim 0, sup 0/0, ref problems 0, owner answers 242 cited 242, sentence-check 17영역 missing 0·bad 0, tokens missing 484, plan-links problems 0. 기대와 다르면 고치지 말고 출력 전체를 보고한다.
