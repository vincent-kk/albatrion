# `if`/`then`/`else`의 한계 — 현재 구현과 새 설계 (scout, 2026-09-23, 커밋 4d34da33f)

읽기 전용 조사 원문이다. `05-before-after.md` §7의 재료. 소유자의 질문: "`if-then` 문법을 쓸 때 `then`에 들어가는 스키마 정의에 따로 한계는 없는가? 예시가 `required`만 나와서 묻는다."

## (1) 현재 구현 — then/else

| 항목 | 동작 | 근거 |
|---|---|---|
| `then.required`(+`virtualRequired`) | 읽음 → 조건부 required 판정에 반영 | `flattenConditions.ts:53-61` |
| `else.required` | 읽음(else-if 체인은 재귀) | `flattenConditions.ts:63-97` |
| `then.properties`/`type`/`allOf`/중첩 `if`/`&active` 등 | **폼 로직에서 전혀 안 읽음**. 자식 노드는 오직 최상위 `jsonSchema.properties`로만 구성됨 | `flattenConditions.ts:44`(if/then 존재만 확인 후 required만 봄), `BranchStrategy.ts:778`(`getObjectKeys(jsonSchema.properties)`) |
| 위 무시 항목들 | **검증기에는 그대로 전달됨** — `stripSchemaExtensions`는 `FormTypeInput/Props/errorMessages/options/injectTo`만 제거, if/then/else 자체는 안 건드림 | `stripSchemaExtensions.ts:43-52` |
| `virtual` 필드가 required에 있으면 | 실 필드로 펼침 | `transformCondition.ts:24-25` |

**if 허용**: `if.properties.<key>.const`, `.enum`만 읽음(`flattenConditions.ts:105-121`). `if.required`, 중첩 `if`, `if.not`, `if.allOf`는 안 읽음(`extractCondition`이 `if.properties`만 순회, `:44-48`).

**문서화된 한계**(`docs/agents/skills/schema-form-skill/knowledge/expressions.md:116`): "if/then/else는 branches보다 좁다 — 필드 추가/제거가 아니라 조건부 검증만. `if.properties`(const/enum)가 `then.required`/`else.required` 적용 여부만 정한다. branch 값은 절대 안 바꾼다." README에 원시 if/then/else 예시는 없음(oneOf+`computed.if`만 문서화). 테스트(`composition.allOf-ifThenElse.render.test.tsx:243-244`)도 required 외 사용 없음.

## (2) 새 설계(ADR 0002·0005, 4차) — then/else 조각

| 항목 | 폼 | 검증기 | 근거 |
|---|---|---|---|
| `properties`(신규 노드 선언, `properties` 밖도 허용) | 청사진 `declares`로 읽어 새 자식 노드 생성 | 그대로 검증 | ADR0002:47-52, ADR0005:33 |
| 기존 필드 overlay(`constrains`) | **연언 문맥 조각끼리만 교차**, 선언(oneOf/anyOf) 문맥끼리는 교차 안 함 | 그대로 | ADR0002:53 |
| 같은 이름·다른 type | 종류별 별도 노드. 동시 활성이면 **런타임 충돌**(개발 모드 에러/그 외 경고) — 분석 단계 throw 없음 | 그대로 | ADR0005 §3:60-64 |
| 중첩 `if`/`then`(then 안의 if) | 재귀 처리. 순환 가능 → 비단조 재평가+상한(`budget-exceeded`)으로 드러남 | 그대로 | ADR0002:105-107 |
| `required`/`false`/`not`/`additionalProperties`/`minimum`/`pattern`/`enum`/`const` 등 값 유효성 문법 | **안 읽음(P1′)** — 형상에 영향 없음, "금지 조각은 없다" | 그대로 검증, 잔여 키는 플러그인 `rejectedKey` 계약 | ADR0002:76-98 |
| `if` 가드 자체 | `compileGuard`로 검증기 플러그인이 **전체 스키마를 컴파일** — const/enum 제한 없이 표준 `if` 전부 허용(현재보다 확장) | 서버와 동일 판정 | ADR0002:44, ADR0004 |
| `then.default` | 조각 꺼짐→켜짐 전이 시 "없음"인 자식에만 주입 | — | round-4-spec.md §A2 |
| 판별식 있는 분기 | `required` 자동 추가(공허 참 방지) | — | ADR0002:112-119 |
| `dependentSchemas` 등 | 가드→조각 모델로 환원 가능하나 **지원 여부 미정** | — | open-questions.md Q7 |
| `then` 안의 `&active`/`injectTo` | **명시 규정 없음** | — | 미확인 |

## (3) 두 설계 공통 "한계"

- **같은 이름·다른 type 동시 활성**: 금지(현재=정적 throw 성격, 새 설계=런타임 충돌 경고로 완화되지만 여전히 안 됨).
- **순환**: 현재 암묵 가정, 새 설계는 지원 범위 밖으로 명시 + 상한으로 결정적이되 임의적 결과.
- **공허한 참**(`if`가 판별 없이 참): 새 설계 Q10 미결, 현재는 암묵적으로 방치.
- **값 유효성 문법**(`required` 외 `minimum`/`pattern`/`enum`/`const`/`false`/`not`)은 두 설계 모두 "어떤 필드가 보이는가"에 영향 없음 — 검증기 전용.

## (4) 미확인

- `then` 안 `&active`/`injectTo` 처리 규칙(ADR/open-questions 미기재).
- `dependentSchemas`/`dependentRequired` 실제 지원 여부(Q7 미결).
- `if` 공허 참 경고 여부(Q10 미결).
- 새 설계는 4차 본문 단계로 다수 항목이 소유자 확정 대기(D-2, D-3 등) — 아직 구현되지 않음.
