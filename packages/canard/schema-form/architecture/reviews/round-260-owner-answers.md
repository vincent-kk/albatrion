# 260라운드 — Vincent의 답 (이름 변경의 두 요구: 레거시 이름 누락 검사 철저, 다른 핵심 고유명사 추가 검토)

2026-10-14. 259라운드(FieldNode 확정) 뒤 소유자가 원장 세션에서 방향을 덧붙였다.

| 확인 | 물음(요지) | 답 원문 | 반영 |
| --- | --- | --- | --- |
| 이름 변경의 범위와 검사 | (원장 관리자 보고 뒤 소유자 추가 요구) | "좋아. 이번에 사실상 레거시 이름을 거의 다 바꾸고 있어.\n이로서 우리가 전체 시스템을 구성하는 주요 명칭을 바꾸게 되었는데,\n이때 \n1. 레거시 이름이 누락되어 남지 않게 검사를 철저히 하고 \n2. 다른 핵심 고유명사 중 변경이 필요한게 추가로 있을지 검토해봐 \n\n이번에 바꾸는김에 핵심 시스템 구성 이름을 다 바꾸고 가고싶어서 그래. \n방향은 이해했지?" | (1) 옛 이름 게이트를 07b-5의 병합 조건으로 둠 — 아래 260C-01; (2) 원장 관리자가 공개 고유명사 전수 목록을 만들어 바꿀 후보를 소유자에게 올림 |

### 260C-01 옛 이름 게이트 — 07b-5(와 그 뒤 모든 PR)의 병합 조건

- 검사 대상: `packages/canard/schema-form`(src·docs·README·CLAUDE.md·docs/agents·stories), 플러그인 일곱, `packages/aileron/*`, `documents/`, 저장소 루트 CLAUDE.md. 제외: `src/__legacy__`, `packages/canard/schema-form/architecture/`, benchmark-form 결과 보관본, `node_modules`·`dist`·`build`.
- 옛 이름 목록(대소문자 구분, 단어 경계): `formType`, `FormType*`, `formTypeInput*`, `FormTypeInput*`, `FormTypeRenderer*`, `FormTypeGroupRenderer`, `FormType{Label,Input,Error}Renderer`, `formTypeDefinitions`, `SchemaNode*`, `schemaNode*`, `SchemaNodeProxy`, `SchemaNodeInput*`, `DeferrableNodeProxy`, `useSchemaNode*`, 그리고 지워진 스키마 문법(`computed`, `&if`·`&active` 등 `&` 접두 키, 스키마 수준 `injectTo`, 최상위 `virtual`·`terminal`·`placeholder`·`FieldInput`·`inputType`·`errorMessages`).
- 세 겹 검사: (가) 식별자 grep 0(스크립트로 목록 전체를 한 번에, 예외는 계약 문자열뿐이며 예외 목록을 PR 본문에 적음); (나) 빌드 산출물(dist d.ts, documents build HTML·JS) grep 0; (다) verifier가 옛 이름 목록으로 독립 재검사. 계약 문자열(DOM 속성, 이벤트·요청 enum의 문자열 값)은 식별자 치환과 별도로 "유지" 목록을 둔다.

다음 라운드 번호는 261이다.
