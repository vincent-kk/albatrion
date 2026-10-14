# 개선-34 — selectChildren의 staticShape 분할 검증

2026-10-12, 브랜치 `feat/schema-form-07b-1`(기준 `6ff558fa9`). 159라운드 지시 (가)와 160C-01의 정규화 동치 기준을 따릅니다.

## 판정

**정규화 동치를 충족합니다.** 네 번들 모두 바이트는 다르지만, 정규화한 뒤 남는 줄은 모두 모듈 적재 때 한 번 실행되는 상수·초기화·require입니다. 정착 경로의 실행 코드는 줄 단위로 같습니다. 160C-01에 따라 판정 세션을 붙이지 않습니다.

## 변경

- `src/core/settle/utils/compute/selectChildren.ts`의 모듈 내부 helper `staticShape`(구현 몸통 21줄)와 그 메모 `STATIC_SHAPES`를 `src/core/settle/utils/compute/selectChildren/utils/staticShape.ts`로 옮겼습니다. 본문은 바꾸지 않았고 문서 주석에 매개변수와 결과를 적었습니다.
- 새 파일은 `canReuseArrayChildren.ts`와 같은 방식으로 자기 `NO_ACTIVE_IDS` 빈 배열을 둡니다. `mergeEffectiveSchema`는 선언 ID를 이은 문자열로 메모하므로(`src/core/blueprint/utils/effectiveSchema/mergeEffectiveSchema.ts:41`) 빈 배열의 정체성이 달라도 같은 유효 스키마 참조를 돌려줍니다.
- `selectChildren.ts`는 import 한 줄을 더하고 helper와 쓰지 않게 된 형 import를 지웠습니다.

## 절차

도구는 [build-identity-bundles.mjs](tools/build-identity-bundles.mjs)와 [compare-normalized-bundles.mjs](tools/compare-normalized-bundles.mjs)입니다. 다음 구조 변경에도 같은 절차를 씁니다.

1. 변경 작업 트리에서 `build-identity-bundles.mjs <change>`로 네 번들을 만듭니다. rolldown의 `dist/index.mjs`·`dist/index.cjs`, core 판정 번들(oneOf-40 확장), React 판정 번들(pair-126 entry, equivalent harness)입니다.
2. 바뀐 소스 파일만 기준 커밋의 판으로 되돌리고(`git checkout <base> -- <paths>`, 새 파일은 잠시 치움) `build-identity-bundles.mjs <base>`를 돌린 뒤 변경을 되살립니다.
3. `compare-normalized-bundles.mjs <base> <change> <evidence.json>`으로 비교합니다. 빈 줄과 모듈 경로 주석을 지우고, 번들러가 붙인 이름 번호(`name$N`, `nameN`)는 같은 이름이 번들에 있을 때 하나로 접습니다.
4. 남은 줄이 모두 모듈 적재 때 한 번 도는 줄이면 통과입니다. 실행 경로의 줄이 하나라도 남으면 판정 세션으로 돌아갑니다.

## 결과

증거: [improvement-34-bundles.json](improvement-34-bundles.json).

| 번들 | 기준 바이트 | 변경 바이트 | 정규화 뒤 남는 줄 |
| --- | --- | --- | --- |
| `dist/index.mjs` (rolldown) | 575,856 | 575,991 | `const NO_ACTIVE_IDS = Object.freeze([]);` 한 줄 |
| `dist/index.cjs` (rolldown) | 594,415 | 594,550 | 위와 같은 한 줄 |
| core 판정 번들 | 556,415 | 556,610 | 빈 배열 상수 한 줄과 `require("@winglet/common-utils/lib")` 한 줄 |
| React 판정 번들 | 973,660 | 974,063 | 빈 배열 상수, 새 모듈의 `__esm` 초기화 래퍼(`init_staticShape`와 그 안의 `init_libs`·`init_blueprint`·`init_staticIds` 호출), `selectChildren` 초기화의 `init_staticShape()` 호출, 두 모듈로 나뉜 `var` 선언 목록 |

React 판정 번들이 `__esm` 래퍼를 쓰는 까닭은 이 번들이 지연 초기화 형식으로 묶이기 때문입니다. 남은 줄은 모두 첫 적재 때 한 번 실행됩니다.

## 빌드 재현성 관찰 (개선-31)

같은 변경 작업 트리에서 React 판정 번들을 네 번 빌드했더니 두 가지 결과가 번갈아 나왔습니다. `a278fd3b…`(974,063바이트)가 두 번, `a654171c…`(973,805바이트)가 두 번입니다. 짧은 쪽은 `isInteger` 블록과 그 `init_isInteger()` 호출이 빠진 변형으로, 258바이트 차이는 개선-31에 적힌 변형과 같습니다. 기준 번들은 두 번 빌드해 두 번 모두 `f7c8fcec…`(973,660바이트)였습니다. 비교에는 `isInteger` 블록이 있는 변경 빌드(`a278fd3b…`)를 썼습니다. rolldown 두 형식과 core 판정 번들은 세 번의 변경 빌드에서 모두 같았습니다.

## 검사

`packages/canard/schema-form`에서 실행했습니다.

| 명령 | 결과 |
| --- | --- |
| `npx --no-install tsc --noEmit --composite false --rootDir . -p tsconfig.json` | 통과했습니다. |
| `npx --no-install eslint` (바뀐 두 소스 파일) | 오류와 경고 없이 통과했습니다. |
| `npx --no-install vitest run --project unit --project render --project react18 --reporter=dot` | 480파일, 3,475건 통과, todo 1건, 실패 0건입니다. |
