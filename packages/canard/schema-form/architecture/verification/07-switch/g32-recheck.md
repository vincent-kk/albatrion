# G32 재검증 — 원장 대 구현 대조

대상은 `feat/schema-form-switch`의 HEAD `f9ae05d5e`이며, 기준은 `origin/1.0.0-beta`입니다. 범위는 직전 G32 이후의 `git log 8955aa173..HEAD -- packages/canard/schema-form/src` 커밋 41개입니다(perf 커밋 26개, `src/__legacy__` 제외). 계약은 기준 브랜치의 원장, 102–112라운드 마감·소유자 답 문서, 그리고 `analysis-records-design.md`입니다.

먼저 antigravity가 대조했고, 차단 0건이라고 보고했습니다. 그러나 보완 호출이 세션 오류로 실패해, 인용의 실재를 확인할 수 없었습니다. 그래서 원장 조건("멈추면 Claude verifier")에 따라 Claude verifier가 인용마다 원본을 열어 다시 대조했습니다. 판정은 아래 verifier의 것입니다.

## 판정

**G32: PASS. 차단 0건, 비차단 1건입니다.** 원장 계약이 깨진 자리는 없고, 원장 결정 없이 바뀐 공개 계약도 없습니다.

## 실행 확인

- unit·render·react18: 시험 파일 456개, 3,371건 통과, todo 1건, 실패 0건입니다.
- 운영 모드 프로젝트: 9개 파일, 20건 통과입니다.
- typecheck: 종료 코드 0입니다.
- 공개 표면의 코드 변화는 없습니다. `src/index.ts`, `src/types`, `src/core/SchemaNode`, `src/core/types`, `src/app`, `src/hooks`, `src/providers`, `src/components/Form`이 대상이며, 바뀐 것은 DETAIL 한 줄과 시험 파일의 이동뿐입니다.

## 대조 결과

1. **owned-inline 동결(103C-01, Q106, Q107, F52 행)은 계약대로입니다.** 근거는 다음과 같습니다.
   - 공개 값은 만든 자리에서 두 모드 모두 동결합니다: `freezeEffectiveSchema.ts:26-72`, `buildNodes.ts:64`, `createBlueprintGate.ts:12-21`.
   - hint 병합이 만든 객체만 동결합니다: `mergeHintGroup.ts:47-53`, `freezeCreatedHintObjects.ts:22,28`.
   - 소속 배열은 기록마다 소유하고, 개발 모드에서만 동결합니다: `blueprint.ts:88-121`.
   - Q106의 두 자리는 `blueprint.ts:75-78,110`과 `mergeSchemaContributions.ts:49`에서 고쳐졌습니다.
   - `DEFAULT_CHOICES`(`getStaticChoices.ts:22-27`)는 두 모드 모두 동결하는 내부 공유 값입니다.
2. **perf 커밋 26개에 관측 가능한 변화는 없습니다.** 커밋마다 지켜야 할 계약과, 그것을 고정하는 시험을 짝지었습니다. 근거는 코드 동치 대조, 또는 차등 시험입니다. 특히 c31ac77e3은 EVENT-007(`event.md:178`, "`revision`은 커밋 시 배달 집합 전체를 한 번에 올린다")을 지킵니다. 전역 노드를 먼저 방문하고, 나머지는 중복 없이 같은 순서로 방문하며, 순회 중에는 두 집합이 바뀌지 않습니다.
3. **EVENT-070 고침(27103f65e)은 EVENT-039·040·070과 112C-01대로입니다.** 근거는 다음과 같습니다.
   - 경계는 `withFormTypeInputErrorBoundary.tsx:15-23`에서 한 번 만들어집니다.
   - 원본 입력에만 `inputGeneration`이 key로 갑니다.
   - 모든 공급 경로가 같은 처리를 받습니다: `useFormTypeInput.ts:25`, `formTypeInputMap.ts:28,33`, `formTypeInputDefinitions.ts:67`, `SchemaNodeInputWrapper.tsx:56,58`.
   - 남은 key는 RequestRemount의 `SchemaNodeField.tsx:110` 하나입니다.
   - 시험 (ㄱ)(ㄴ)(ㄷ)은 48건이며 두 React 판에서 돕니다. 원래 시험은 바뀌지 않았습니다.
4. **filid 경계 커밋(661109e77, f9ae05d5e)에 동작 변화는 없습니다.** `src/core/DETAIL.md:172-176`의 면제는 규칙이 요구하는 선언 형식(소유 fractal의 DETAIL, 까닭 포함)을 따릅니다.

## 비차단 지적과 처리

F52 행(`analysis-records-design.md`)이 "105라운드 원장 답"을 근거로 들었는데, 기준 브랜치의 105라운드 마감 문서에는 기본 선택지가 없습니다. 이 행의 근거를 101C-01 조건 (1)(`round-101-closing.md:5 @origin/1.0.0-beta`)과 106라운드 채택 목록(`round-106-closing.md:3 @origin/1.0.0-beta`)으로 고쳤습니다. 106라운드 문서의 3행에 "기본 선택지 공유"가 있음을 확인했습니다.

## 범위 밖 관찰

`src/core/settle/utils/derivation/runDeriveRounds.ts:106`의 `process.env.NODE_ENV === 'test'` 그림자 평가가 제품 코드에 들어 있습니다. 소비자의 시험 실행기도 NODE_ENV를 test로 두면, 확인 라운드를 한 번 더 돌고 증명이 틀린 경우 일반 `Error`를 던질 수 있습니다. 98C-01(`round-98-closing.md:9`)이 "시험 방식에서는 … 그림자를 둔다"고 정했으므로 계약 위반은 아닙니다. 다만 "시험 방식"이 이 패키지의 시험만을 뜻하는지는 원장 관리자가 판단할 일입니다.

## 확인하지 못한 것

- af1904cf9와 ccfecf1b4는 표본으로만 읽었고, 동치는 두 차등 시험의 통과에 기댑니다.
- D1 차등 검증과 커밋 메시지의 성능 수치는 다시 재지 않았습니다.
- storybook 프로젝트는 G23 소관이라 돌리지 않았습니다.
- filid 재검사는 이 대조와 별도로 G31 기록(`f9ae05d5e`에서 경계 0, 순환 0)에 있습니다.
