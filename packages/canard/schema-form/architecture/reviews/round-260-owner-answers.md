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

## 덧붙임 (2026-10-14, 07b-5 사용처 목록과 편집자 결정 셋, 대기열 38·39)

fairy07의 259C-01 사용처 목록(scratchpad/259C-01/rename-inventory.md, 889줄, 기준 13838752b): 파일 625개(경로 변경 121 + 내용 504), 출현 5,061회, 고유 식별자 91개, `DeferrableNodeProxy` 12파일 22줄, kebab 앵커 `schema-node-*` 4줄, 디렉터리 5개; 범위 안 이름 충돌 0; 공개 index 변경 export 10개; 런타임 계약 문자열에 SchemaNode 없음(유지 항목 0). 실행 주의: eslint.config.js 경로 문자열 3곳·dependencyDirection.test.ts 디렉터리 문자열 6곳·vi.spyOn 이름 5곳·surface.test.ts export 목록 13개는 문자열이라 함께 바꿔야 하며, 순서는 DeferrableNodeProxy → components/SchemaNode → SchemaNodeProxy → 접두 SchemaNodeInput → 일반 규칙. 편집자 결정: (1) `interpretSchemaNodeInput` → `interpretFieldNodeInput`(일반 규칙; FieldInputSlot 규칙은 components 접두에만); (2) filid 앵커는 새 디렉터리 이름을 따름(`field-contract`·`field-input-slot-contract`·`field-proxy-contract`, core 쪽은 `field-node-contract`), architecture/의 옛 앵커 참조는 역사라 유지; (3) `bench/branchless-phase-report.mjs` 보고서 본문은 측정 기록이라 유지하고 옛 이름 게이트의 명시 예외로, `docs/ko/MOBILE_PERFORMANCE_REPORT.md`는 배포 문서라 식별자만 치환. fixy07 #364(07b-4, head 7f5488158) 보고: 게이트 통과, verifier 재검토 PASS; 범위 밖 발견 중 radio id·오류 메시지 문구·docs/agents `terminal` 설명 셋은 같은 PR에 추가 커밋으로, 나머지 둘은 대기열 38·39.
