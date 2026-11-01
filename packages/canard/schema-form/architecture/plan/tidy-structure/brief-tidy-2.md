# 정돈-2 브리프 — 시험 자리와 index 경유 정리, 잉여 export 삭제 (fixy08 → codex) — 정돈-1 병합 뒤 착수

> 2026-10-14, 원장 관리자. 근거: `fca-import-model.md`(293·294·295라운드 확정 모델, B1–B7), `lineage-audit.md`(3811변 판정), `request.md` §2 F1·F2·F6, 결정 D7(공개 API 시험 세 디렉터리는 외부 소비자)·D8. 진행 방식은 217C-01. 동작 불변 PR이며 공개 표면은 이름 단위로 동일해야 한다.

## 1. 자리

- 워크트리 `{scratch}/stage-tidy-2`, 브랜치 `feat/schema-form-tidy-2`, base `1.0.0-beta`(정돈-1 병합 커밋 이후). PR base `1.0.0-beta`, squash 병합은 원장 관리자.
- codex는 `.claude/`, settings, `architecture/`, `.filid/`를 건드리지 않는다. 커밋에 세션 ID·co-author 없음.

## 2. 규칙 (브리프의 모든 판단은 이 넷으로 한다)

1. **위로 열림.** 시험·제품 파일은 자기 fractal 내부와 조상 fractal의 organ·뿌리 파일을 index 없이 직접 가져온다.
2. **조상 index 경유 금지(B3).** 자기 fractal의 index와 어떤 조상의 index도 가져오지 않는다. 예외는 D7의 세 디렉터리뿐: `src/__tests__/e2e`, `src/__tests__/scenarios`, `src/__tests__/migration`은 외부 소비자 자격으로 루트 `src/index.ts`를 가져온다(다른 경로는 금지).
3. **아래·옆으로 닫힘.** 자손과 혈통 밖 fractal은 그 fractal 자신의 index로만 본다(깊은 fractal은 서브트리 루트의 index로, B6). 혈통 밖의 내부 파일을 가져오면 시험이 잘못 놓인 것이다 — 시험을 그 fractal로 옮기거나, 공유 fixture를 최소 공통 fractal의 `__tests__/fixtures`로 올린다.
4. **index는 밖의 제품 소비자가 쓰는 이름만.** 시험·벤치·스토리는 소비자가 아니다.

## 3. 할 일

### 3.1 시험 import 재작성 — U 254변

- `lineage-audit.md`의 U 목록(`{scratch}/s3/lineage-audit.md` 표에서 verdict U)을 입력으로, D7 세 디렉터리를 제외한 전부를 내부 파일 직접 import로 바꾼다. 같은 fractal 안이면 상대 경로, 조상 organ이면 조상의 파일 경로(alias `@/schema-form/…` 허용).
- 재작성은 codemod로 한다(이름이 어느 파일에서 정의되는지는 TypeScript 컴파일러 API로 푼다). 손으로 고친 파일은 본문에 따로 적는다.

### 3.2 자식 내부를 읽는 시험 — D 52변

- `core/__tests__` 아래에서 blueprint·settle·surface·validation의 index나 내부를 읽는 시험은 "검사 대상과 가장 가까운 fractal"로 옮긴다: blueprint 내부를 검사하면 `core/engine/blueprint/__tests__`로, settle이면 `core/engine/settle/__tests__`로. core 수준의 통합 시험(여러 자식을 함께 돌림)은 그대로 두되 자식의 **index**만 가져온다(B7: 검증 organ의 자식 index 사용은 허용).
- `core/__tests__/makeFieldNodeTree.ts`·`fixtures/createTestValidator.ts`처럼 여러 자손 시험이 기대는 공용 fixture는 core의 organ으로 남는다(위로 열림). 단 그 fixture 자신이 자식 내부를 읽는 것(`makeFieldNodeTree.ts:4-5`의 `engine/utils/pathIndex/*`)은 자식 index 경유나 fixture 이동으로 고친다.

### 3.3 혈통 밖 내부를 읽는 시험 — S1 20변

| 변 | 처리 |
| --- | --- |
| settle·derive 시험 → `core/surface/FieldNode.ts` 9 | 무엇이 필요한지 본다. 노드 클래스가 필요하면 그 시험은 surface의 시험이므로 `core/surface/__tests__`로 옮긴다. 노드 생성만 필요하면 `core/__tests__/makeFieldNodeTree`(조상 organ)로 바꾼다 |
| validation 시험 → `write/__tests__/fixtures/createDispatchTree.ts` 8 | fixture를 최소 공통 fractal `core/engine/__tests__/fixtures/`로 올리고 write·validation 시험 둘 다 거기서 가져온다 |
| `components/Field` 시험 → `providers/RootNodeContext/RootNodeContext.ts` 1 | `providers/RootNodeContext/index.ts`의 공개 이름으로 바꾼다. 공개 이름이 없으면 그 시험을 RootNodeContext로 옮긴다 |
| settle 시험 → `blueprint/__tests__/fixtures/ownedInlineHead.json` 1 | fixture를 `core/engine/__tests__/fixtures/`로 올린다 |
| write 시험 → `settle/utils/commit/utils/isSameDeliveryValue.ts` 1 | 그 시험이 검사하는 것이 settle의 값 비교라면 settle로 옮기고, write의 전달 동작이라면 공개 동작으로 다시 쓴다 |

처리 뒤 `core/surface/DETAIL.md`의 시험 면제 선언(126행 부근)은 지운다. 벤치 면제 선언 넷은 정돈-3(벤치 이동)까지 남긴다.

### 3.4 제품 코드의 위반 둘

- `src/app/plugin/registerPlugin.ts:4`의 `@/schema-form`(루트 index) import를 필요한 fractal의 index 또는 조상 organ 파일로 바꾼다(루트 index가 registerPlugin을 재수출하므로 지금은 순환).
- `src/index.ts:1`이 `app/plugin/index.ts`를 직접 가져오는 것: `app/index.ts`가 plugin을 재수출하게 하거나, `app`이 fractal일 이유가 없으면 `app/INTENT.md`·`DETAIL.md`를 지우고 organ으로 내린다. 판단과 까닭을 본문에 적는다(모델 안의 변용은 허용, 295라운드).

### 3.5 잉여 export 삭제 — F2

- 3.1~3.4 뒤, 전수 검사 스크립트를 **루트의 `export *`·`export type *` 재수출을 따라가도록 고쳐** 다시 돌린다(`request.md` §7의 한계). 그 결과 "fractal 밖 제품 소비자 0"인 index 이름을 지운다. 이전 추정은 104개였으나 재검사 결과가 기준이다. 오류 코드 상수(`errors` 38개)는 정돈-E가 다루므로 여기서 지우지 않는다.
- `components/Form/index.ts`의 `FormRender`·`FormField`·`FormLabel`·`FormInput`·`FormError`처럼 `Form.tsx`만 쓰는 이름은 index에서 빼고 `Form.tsx`가 내부 파일을 직접 가져온다.
- 루트 `src/index.ts:84`의 `export type * from './types/rolled'`는 이름 목록으로 바꾼다(public-contract §2). **공개 이름 집합은 그대로여야 한다** — 정돈-1에서 만든 "컴파일러로 열거한 공개 이름·형 문자열 목록" 비교가 게이트다.

## 4. failing-first 신호

- 모델 검사 스크립트(`{scratch}/s3/lineage.cjs`를 저장소 밖에서 재사용하거나 같은 논리로 다시 씀)를 시험으로 감싼다: `src/__tests__/` 아래에 "U(D7 제외)=0, D=0, S1=0" 단언 시험 하나를 먼저 넣어 빨갛게 만든 뒤 초록으로. 이 시험은 정돈 뒤에도 남아 회귀를 막는다(`dependencyDirection.test.ts`가 이미 비슷한 모양이면 거기에 더한다).
- 공개 표면 열거 비교(정돈-1 산출물)를 같은 자리에 시험으로 고정한다.

## 5. 게이트

정돈-1 브리프 §4와 같다(typecheck·lint·build·test:production, unit·render·react18 전부 초록이며 시험 수는 옮긴 뒤에도 동일, storybook 251, 플러그인 일곱, 공개 이름 열거 동일, 옛 이름 0, documents 빌드). 추가로 모델 검사 시험 초록, `yarn --cwd packages/canard/schema-form lint`의 `no-restricted-imports`(레거시 금지) 그대로 초록. 측정은 조용한 창에서 순차.

## 6. 금지와 범위 밖

- 구조 이동(`hooks`·`types` fractal 승격, `derive`를 engine의 형제로, 벤치 `__benchmarks__` 이동, 뿌리 구현 organ 이동, `.filid/config.json` 면제 제거)은 정돈-3.
- 오류 코드·리터럴 정리(E1–E5)는 정돈-E.
- `git stash` 금지, 세션 ID·co-author 금지, 소유자 법적 이름 금지, CLAUDE.md 둘은 손대지 않음.

## 7. 끝

PR 제목 `refactor(schema-form): tidy-2 — tests import internals directly, surplus index exports removed`. 본문에 §3 항목별 처리 수(변·파일), 옮긴 시험 목록, 지운 export 목록, 모델 검사 수치(전·후), 공개 표면 비교. 원장 관리자(노르덴컨트롤)에게 PR 번호·끝 커밋 보고.
