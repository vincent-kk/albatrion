# 5라운드 배경 조사의 1차 출처 대조 (scout)

대상: `raw-round5-background.md`의 핵심 주장 6개. 방법: 공식 문서·GitHub 소스를 WebFetch로 직접 읽음. 날짜: 2026-09-22.

| # | 주장 | 판정 | 출처 |
| - | ---- | ---- | ---- |
| 1 | JSON Forms는 기본 미주입(opt-in) | **확정** | `packages/core/src/util/validator.ts`의 `createAjv` 옵션에 `useDefaults` 없음 → Ajv 기본 `false`. 문서 페이지는 404 |
| 2 | RJSF는 기본 주입 + `experimental_defaultFormStateBehavior` | **확정** | api-reference/form-props에 `emptyObjectFields`·`arrayMinItems`·`mergeDefaultsIntoFormData`·`constAsDefaults`(추가로 `allOf`, `nestedDefaultsPrecedence`). `getDefaultFormState.ts`: `emptyObjectFields = 'populateAllDefaults'`가 기본 |
| 3 | RJSF는 인덱스 0 강제, JSON Forms는 -1 무선택 | **부분** | RJSF: `getFirstMatchingOption.ts` 끝의 `return 0` 확정. JSON Forms: `indexOfFittingSchema` 계산부 원본을 찾지 못함, `MaterialOneOfRenderer.tsx`는 `useState(indexOfFittingSchema || 0)`만 확인 → -1 여부 미확인 |
| 4 | 네 라이브러리 모두 `false`/`not`을 에러로만 표시, 자동 삭제 없음 | **미확인** | RJSF·JSON Forms 검증 문서에 boolean-false 서브스키마나 자동 삭제 언급 없음. JSON Schema core §4.3.2는 `false` = "항상 실패, `{not:{}}`와 같다"만 규정 |
| 5 | RJSF·JSON Forms·uniforms가 null ↔ object 왕복에서 자식 재초기화 | **미확인** | 문서·소스 어디에도 직접 근거 없음 |
| 6 | Formily `setValues`에 병합 전략, Angular `setValue`/`patchValue` 구분 | **확정** | `packages/core/src/types.ts`: `IFormMergeStrategy = 'overwrite' \| 'merge' \| 'deepMerge' \| 'shallowMerge'`, `Form.ts`: `setValues(values, strategy = 'merge')`. angular.dev: `setValue`는 전체 구조 강제, `patchValue`는 있는 것만 |

스펙 절 대조: `default`는 배경 조사의 "§7.6.1"이 아니라 Validation §9.2(Basic Meta-Data Annotations, "RECOMMENDED that a default value be valid against the associated schema"). Boolean schema는 Core §4.3.2로 일치.

다루지 못한 것: uniforms·Formily의 주장 4, 주장 5 전반, JSON Forms `indexOfFittingSchema` 원본 위치.
