# 178라운드 닫기 — errors prop의 0.16.0 대비 차이 둘(형 표면 밖): 배열이 아닌 입력(null·객체)은 0.16.0처럼 빈 배열로 받도록 작은 가드를 더하고, 외부 오류 객체에 순번 key를 찍던 변형은 새 판(찍지 않음)을 유지한다 — 둘 다 편집자 결정이며 reviewer 세션이 가드 커밋을 올린다

2026-10-12. 177라운드 (2)로 reviewer가 errors prop 경로를 확인해 보고했다. (1) 배열이 아닌 errors prop: 새 엔진 `src/providers/RootNodeContext/utils/applyFormErrors.ts:6`은 `errors: readonly ValidationIssue[] = []`라 undefined는 []가 되지만 null은 `errors.length`에서 TypeError를 던지고, 평범한 객체는 묶음 루프를 건너뛰어 `root.setExternalErrors(object)`에 그대로 넘어간다; 0.16.0은 `transformErrors(errors, true)`로 비배열을 모두 []로 바꿨다; Form prop 형은 `SchemaNode['globalErrors']`(`src/components/Form/type.ts:37, :82`)라 JavaScript 호출자나 `as any`만 이 경로에 닿는다. (2) 외부 오류의 순번 key: 0.16.0은 errors prop 항목마다 `error.key = ++sequence`를 찍어 소비자 객체를 변형했고, 새 엔진은 key를 전혀 부여하지 않는다(비레거시 src의 유일한 대입은 호출자 없는 transformErrors.ts:22); `JSONSchemaError.key`(`src/types/error.ts:44`)는 내부용으로 "사용자는 이 속성을 설정하거나 의존하지 말 것"으로 문서화되어 있다. reviewer는 둘 다 바꾸지 않았고, 제거 커밋은 소유자가 정하는 포매팅 커밋 순서 뒤에 올린다(origin은 a919ab7ae 그대로).

### 178C-01 (1) 배열이 아닌 errors prop은 0.16.0처럼 빈 배열로 받는다 — applyFormErrors의 입구에서 `isArray`(`@winglet/common-utils/filter`) 검사 하나로 비배열(null·객체·그 밖)을 []로 돌리며, 이것은 공개 API 경계의 입력 검증이라 투기적이지 않고(seiri reuse-first §2) 0.16.0이 내던 동작(조용히 무시)을 새 판이 못 내던 차이를 메우는 것이므로 편집자 결정이다(166라운드 원칙); reviewer 세션이 제거 커밋과 별개의 작은 커밋으로 올리고 시험 하나(null·객체 입력 → 외부 오류 없음)를 붙인다; (2) 외부 오류 객체에 순번 key를 찍는 변형은 되살리지 않는다 — key는 내부용으로 문서화되어 소비자가 기대면 안 되는 값이고, 소비자 객체를 변형하지 않는 쪽이 "같은 값은 같은 참조"와 예측 가능성에 맞으며, 새 엔진이 내부 식별에 key를 쓰지 않음이 확인됐다; 이 차이는 07 문서의 의도적 차이 목록(개선-36 항목)에 "errors prop 객체에 key를 찍지 않는다(0.16.0은 찍었다)"로 적는다; (3) 두 결정 모두 소유자에게 보고하되 결정을 기다리지 않는다

- 닫는 항목: SURFACE-053(보충), LANDING-204(보충)
- 결정:
  - 【추론】 (1)은 형 표면 밖이지만 0.16.0 JavaScript 사용자가 null을 넘겨도 폼이 서 있었는데 새 판은 던지므로, 비용 한 줄로 옛 관용을 되찾는 편이 전환의 약속(소비자가 보는 동작 동일)에 맞다. (2)는 반대로 옛 판의 부작용(소비자 객체 변형)이고 문서가 의존하지 말라고 한 내부 값이라 되살릴 이유가 없다. 둘 다 "옛 판이 내던 것을 새 판이 못 내는" 종류라 166라운드 규칙대로 편집자가 정한다.
- 근거: reviewer의 확인 보고(경로 위); 166라운드 소유자 답(값 범위 차이는 편집자 결정); 177라운드 (2); 패키지 CLAUDE.md Design Values·`isArray` 규칙; seiri_reuse-first §2; `src/types/error.ts:44`.
- 다음: reviewer가 (1)의 가드 커밋을 올린다. 원장 관리자는 소유자에게 보고하고 fixy07에 (2)의 문서 항목을 전한다.
