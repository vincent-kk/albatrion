# IR-1b — 엄격 production 시험 관문 복구

2026-10-31. 입력 응답성 단계가 의존하는 `test:production`의 두 실패를 재현하고 최소 수정으로 복구했습니다. 기존 시험·상한은 바꾸지 않았습니다. 독립 검증과 PR 개설은 코디네이터가 수행합니다.

## 검증 대상

- 기준: `317f215dc79d5a3892a9c2fbafceb18ccaa222dc` (`feat/schema-form-input-responsiveness`, PR #501 이후).
- 계약 선행 커밋: `fa6d1a3b4fc08ba476cfb7d93ef508d07ad5dc32`.
- 수정·전체 관문 SHA: `569f6a552506e7afe659036b11e860293a8b6789`.
- Node 24.20.0, Vitest 3.2.6. 모든 yarn 명령은 저장소 루트에서 실행했습니다. 전체 관문은 아래 표의 순서대로 한 명령의 종료를 확인한 뒤 다음 명령을 실행했습니다. 다른 시험·빌드·측정 창과 겹치지 않았습니다.

## 기존 기록의 production 구분

엄격 production 관문은 `test:production`이며 패키지 script가 `NODE_ENV=production`을 설정합니다. `test --run --project production`은 프로젝트 이름만 선택하며 이 환경에서는 `NODE_ENV=test`로 실행됩니다. 과거의 production 프로젝트 21건 통과를 엄격 production 통과로 읽을 수 없습니다.

진단이 지목한 기존 기록을 실제 문서와 대조했습니다. 기존 기록은 보존하며 이 문서로 구분을 덧붙입니다.

| 기존 기록 | 해당 내용 |
| --- | --- |
| [B6 결과](../branch-switch/b6-results.md), 355행 | oneOf-20의 117 > 111이 기준과 후보 모두에서 실패했다고 명시합니다. |
| [B7 결과](../branch-switch/b7-results.md), 476–483행 | production 프로젝트는 당시 20건이며 `NODE_ENV=test`라고 명시합니다. strict 실패 해소의 증거가 아니고 `test:production`은 실행하지 않았다고 적었습니다. |
| [B9-1 결과](../branch-switch/b9-1-results.md), 132행 | 지정 프로젝트는 21/21이나 production 강제 실행은 두 건 실패했고 이전 소스에서도 재현됐다고 구별합니다. |
| [IV-4 결과](../branch-switch/iv-4-results.md), 258행 | production 전용 script의 두 실패와 지정 프로젝트 21건 통과를 따로 적었습니다. |
| [micro-hygiene 결과](../branch-switch/micro-hygiene-results.md), 729–734행 | 무시되는 transform 키와 기준·후보의 freeze 117을 후속 항목으로 남겼으며 비용 검증 없이 111을 올리지 않았습니다. |
| [마감 결과](../branch-switch/closing-results.md), 526행 | strict-production의 Vitest transform 경로·freeze117>111을 미해결 항목으로 남겼습니다. |

## 재현과 준비

아래 비교 실행의 초기 두 실패는 새 worktree의 빌드 산출물 부재였습니다. 소스를 수정하지 않고 기존 workspace build로 준비한 뒤 같은 비교 명령이 통과했습니다. 설치나 의존성 변경은 없었습니다.

| 순서 | 실행 HEAD | 명령 | 종료·관측 |
| --- | --- | --- | --- |
| 1 | 기준 SHA | `yarn workspace @canard/schema-form test:production src/core/surface/__tests__/detached.production.test.ts` | 종료 1, 1건 실패. `node:child_process` browser externalization 경고와 `TypeError: execFileSync is not a function`. |
| 2 | 기준 SHA | `yarn workspace @canard/schema-form test --run --project production src/core/surface/__tests__/detached.production.test.ts` | 종료 1, 1건 실패. `ENOENT`, `dist/index.mjs` 부재. |
| 3 | 기준 SHA | `yarn workspace @canard/schema-form build` | 종료 0. 런타임·선언·해시·artifact checks·내장 typecheck 통과. 이 기준 빌드의 선언을 별도로 보존했습니다. |
| 4 | 기준 SHA | 위 2번과 같은 명령 | 종료 1, 1건 실패. `ERR_MODULE_NOT_FOUND`, common-utils의 `dist/utils/filter/index.mjs` 부재. |
| 5 | 기준 SHA | `yarn workspace @winglet/common-utils build` | 종료 0. |
| 6 | 기준 SHA | `yarn workspace @winglet/json build` | 종료 0. |
| 7 | 기준 SHA | `yarn workspace @winglet/json-schema build` | 종료 0. |
| 8 | 기준 SHA | `yarn workspace @winglet/react-utils build` | 종료 0. |
| 9 | 기준 SHA | 위 2번과 같은 명령 | 종료 0, 1파일·1건 통과. |
| 10 | 기준 SHA | `yarn workspace @canard/schema-form test:production src/core/engine/blueprint/__tests__/blueprint.owned-inline-counts.test.ts` | 종료 1, 3건 통과·1건 실패. mode production, oneOf-20 distinct 117 > 111. |
| 11 | 기준 SHA | `yarn workspace @canard/schema-form test --run --project production src/core/engine/blueprint/__tests__/blueprint.owned-inline-counts.test.ts` | 종료 0, 4건 통과. mode test, oneOf-20 distinct 1564. |

### 원인 1 — 무시되는 transform 설정

`vite.config.ts`의 `transformMode`는 설치된 Vitest가 읽는 시험 옵션이 아니었습니다. 로컬 Vitest 선언의 `TransformModePatterns`는 `ssr?: string[]`·`web?: string[]`을 정의하고, 실행기의 `groupFilesByEnv`는 `project.config.testTransformMode`를 읽어 picomatch로 비교합니다. jsdom 기본 web 변환이 strict production에서 Node 모듈을 빈 browser stub으로 바꾸므로 시험의 `execFileSync` 호출이 실패했습니다.

production 프로젝트를 `testTransformMode: { ssr: ['**/*.ts'], web: ['**/*.tsx'] }`로 교체했습니다. react18의 같은 무시 키도 동일하게 교체했으며 전체 react18 769건 통과를 확인해 유지했습니다. RegExp를 새 옵션에 넘기거나 시험의 환경·주장을 바꾸지 않았습니다.

수정 직후 `fa6d1a3b4` HEAD에 두 소스 수정이 있는 상태에서 재현 명령 1번을 다시 실행해 종료 0·1/1 통과를 확인했습니다. 전체 관문과 최종 빌드 후에도 같은 시험을 포함한 strict production 21/21을 확인했습니다.

### 원인 2 — 템플릿 ID 배열의 production 동결

`prepareControlLayers`의 `ids: Object.freeze(ids)`가 oneOf-20의 템플릿 여섯 개에 각각 동결 한 번을 더했습니다. 작업 트리에서 그 한 줄만 plain `ids`로 바꾸어 다음 탐침을 실행했습니다.

| 실행 HEAD·상태 | 명령 | 결과 |
| --- | --- | --- |
| `fa6d1a3b4`, plain ids 임시 탐침 | `yarn workspace @canard/schema-form test:production src/core/engine/blueprint/__tests__/blueprint.owned-inline-counts.test.ts` | 종료 0, 4/4. production distinct가 1706 / 502 / 111 / 5로 바뀌어 oneOf-20만 6 감소했습니다. |
| 탐침 복원 | 원본 바이트 복원 후 `git diff --exit-code -- packages/canard/schema-form/src/core/engine/settle/utils/controls/prepareControlLayers.ts` | 종료 0, diff 출력 없음. 원본·복원 SHA-256 모두 `2f5f0b6f0e4ca0f7d865bd023533fd51121d1f2cc5cadf427db0ba3caa280d5e`. |

그 뒤 소비자를 확인하고 `ids: process.env.NODE_ENV !== 'production' ? Object.freeze(ids) : ids`를 적용했습니다. 환경 조건은 `src/app/cache/utils/createCacheDomain.ts:17`의 개발 전용 동결 관례와 같습니다. settle의 DETAIL 계약을 소스보다 먼저 커밋했습니다.

## ids의 모든 소비자와 쓰기 확인

`rg -n 'prepareControlLayers|controlLayerIndex|PreparedControlIndex' packages/canard/schema-form/src`로 모든 생성자·저장소·소비자를 확인하고, 반환 배열을 받은 지역 변수의 사용을 끝까지 읽었습니다. 아래 줄 번호는 수정 SHA 기준이며 패키지 상대 경로입니다.

| 파일:행 | 역할·배열 사용 |
| --- | --- |
| `src/core/engine/settle/utils/controls/prepareControlLayers.ts:36,43,109` | 지역 배열 생성, 선언 방문 중 push, 완성 배열 공표. 공표 뒤 작성은 없습니다. |
| `src/core/engine/settle/utils/controls/preparedControlLayers.ts:28` | `readonly ids: readonly number[]` 계약. |
| `src/core/engine/settle/utils/controls/getControlLayers.ts:82` | 선택·정적·커밋 ID가 없을 때 이 배열을 최종 fallback으로 읽습니다. |
| `src/core/engine/settle/utils/controls/getControlLayers.ts:83,86` | 현재 노드의 `nodeIds`를 받아 `indexOf`로 선언 포함 여부만 읽습니다. |
| `src/core/engine/settle/utils/controls/getControlLayers.ts:95,97` | 부모의 `parentIds`를 받아 `indexOf`로 선언 포함 여부만 읽습니다. |
| `src/core/engine/settle/utils/controls/getControlLayers.ts:103` | owner ID와 `nodeIds.indexOf`를 비교합니다. |
| `src/core/engine/settle/utils/controls/getControlLayers.ts:57,63` | 준비물의 node·hasExitControls를 읽으며 ids를 변경하지 않습니다. |
| `src/core/engine/settle/utils/controls/prepareParentControlLayers.ts:33` | fields·fragments를 읽고 targets 캐시만 채웁니다. ids를 읽거나 변경하지 않습니다. |
| `src/core/engine/settle/utils/controls/prepareFragmentOwners.ts:16` | owners 캐시만 채웁니다. 여기의 지역 ids는 별도로 생성한 owners Map의 배열입니다. |
| `src/core/engine/utils/cache/derivedRecords.ts:31` | 불투명 `controlLayerIndex` 슬롯의 선언이며 배열 소비·변경은 없습니다. |

공표된 ids를 production에서 변경하거나 다른 작성자에게 전달하는 경로는 검색된 코드에 없었습니다. 그 조건 아래에서만 개발 전용 동결을 채택했습니다.

## 동결 계수 비교

순서는 nested-d5-f4 / flat-500 / oneOf-20 / sample-0입니다. 기준과 수정 모두 같은 기존 시험을 실행했으며 기대 상한은 수정하지 않았습니다. development 열의 실측 환경은 `NODE_ENV=test`입니다.

| fixture | production 기준 | plain ids 탐침 | production 수정 | production 상한 | development 기준·수정 | development 상한 |
| --- | --- | --- | --- | --- | --- | --- |
| nested-d5-f4 | 1706 | 1706 | 1706 | 1706 | 27642 → 27642 | 29007 |
| flat-500 | 502 | 502 | 502 | 502 | 10022 → 10022 | 10523 |
| oneOf-20 | 117 | 111 | 111 | 111 | 1564 → 1564 | 1564 |
| sample-0 | 5 | 5 | 5 | 5 | 63 → 63 | 66 |

production에서는 템플릿별 동결 호출만 없애고 배열 생성·내용·참조·보유량은 유지합니다. 새 캐시나 인덱스는 없습니다. oneOf-20은 동결 6회를 줄였으며 실행 시간 개선을 별도 측정했다고 주장하지 않습니다.

## 순차 관문 결과

모든 행의 실행 HEAD는 `569f6a552506e7afe659036b11e860293a8b6789`이며 종료 코드는 0입니다. 마지막 행은 최종 build가 산출물을 바꾸었으므로 새 번들에 대해 다시 실행했습니다. 각 프로젝트는 다른 프로젝트와 합치거나 나누지 않고 단독으로 실행했습니다.

| 순서 | 명령 | 통과 파일 | 통과 시험 | todo | 실패 | 소요 시간 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `yarn workspace @canard/schema-form test:production` | 10 | 21 | 0 | 0 | 3.58s |
| 2 | `yarn workspace @canard/schema-form test --run --project production --reporter=dot` | 10 | 21 | 0 | 0 | 3.77s |
| 3 | `yarn workspace @canard/schema-form test --run --project unit --reporter=dot` | 608 | 4009 | 1 | 0 | 80.91s |
| 4 | `yarn workspace @canard/schema-form test --run --project render --reporter=dot` | 132 | 769 | 0 | 0 | 66.27s |
| 5 | `yarn workspace @canard/schema-form test --run --project react18 --reporter=dot` | 132 | 769 | 0 | 0 | 69.49s |
| 6 | `yarn workspace @canard/schema-form test:verify --run --reporter=dot` | 745 | 4822 | 1 | 0 | 128.02s |
| 7 | `yarn workspace @canard/schema-form test --run --project storybook --reporter=dot` | 100 | 251 | 0 | 0 | 35.52s |
| 8 | `yarn workspace @canard/schema-form lint` | — | — | — | 0 | 종료 0 |
| 9 | `yarn workspace @canard/schema-form typecheck` | — | — | — | 0 | 종료 0 |
| 10 | `yarn workspace @canard/schema-form build` | — | — | — | 0 | artifact checks·선언·해시·내장 typecheck 포함 |
| 11 | `yarn workspace @canard/schema-form test:production` | 10 | 21 | 0 | 0 | 3.57s |

기존 todo 1건은 unit과 이를 포함하는 verify에서 각각 보고됩니다. 시험이 의도적으로 발생시키는 detached-write·validator-missing·AJV strict 경고와 Storybook setup 안내는 출력에 남아 있으므로 무경고 실행이라고 주장하지 않습니다.

최종 build의 검증 출력은 `DEVELOPMENT_FLAG_OK reads=48 flags=49 pure=535`이며 세 번들 모두 `GATE_SELECTION_DIST_OK`, mode table, sourceModel retained-slots입니다.

| 산출물 | 기준 바이트 | 수정 바이트 | 증가 | 수정 SHA-256 |
| --- | --- | --- | --- | --- |
| `dist/index.mjs` | 857292 | 857338 | 46 | `8de2fa64279e22af44bd368d1a68661082cd1feed3df8e2c3137f0536025a110` |
| `dist/index.node.mjs` | 856514 | 856542 | 28 | `9b8c44ad2ecba2af043a399cd53fc472c736325f1e1fc0710fb16be4883f7f25` |
| `dist/index.cjs` | 878080 | 878108 | 28 | `307eba28ae642c507f14ad810203bae6ebd85d1136dcf5561db470c2927d29ed` |

## 선언·산출물·인계 경계

기준 SHA를 직접 build한 `dist/**/*.d.ts` 스냅샷과 수정 SHA의 최종 build를 Python으로 경로 집합 및 파일 바이트 비교했습니다. **1307개 대 1307개, 추가 0·삭제 0·변경 0**입니다. 공개 `dist/index.d.ts`는 양쪽 모두 3129바이트, SHA-256 `ed3bfe4d2c42fab94543b2afeca4f4d904e987ae7e865385116218b3d4614b3d`입니다. 비교 단언은 종료 0이며 `PUBLIC_DECLARATION_DIFF_ZERO`를 출력했습니다.

`git diff --check`는 종료 0입니다. 빌드 후 `git status --short`의 출력은 비어 있었고 dist는 추적 파일이 아니므로 생성물 커밋은 없습니다. 소스 수정은 두 프로젝트의 설정 키와 ids 한 줄뿐이며 시험·패키지 버전·의존성·기존 한도는 그대로입니다. 후속 커밋은 이 결과와 요청·검증 기록의 추가분만 담습니다.

이 작업은 작은 관문 수리이며 브라우저 성능 창을 열지 않았습니다. 독립 검증의 대상은 기준 SHA부터 인계 HEAD까지의 diff, 특히 production ids의 읽기 전용 조건과 react18 전체 통과입니다. PR은 `feat/schema-form-input-responsiveness`를 대상으로 코디네이터가 개설합니다.


## 독립 검토 뒤 P3 보완 — 2026-10-31

코디네이터는 인계 HEAD `7e190da43005454b9e378a140d3420c27a36f0f8`의 독립 관문 PASS와 함께 P3 세 건을 전달했습니다. 다음 보완은 기존 결과를 보존한 채 추가합니다.

1. react18의 원래 `transformMode`는 모든 파일을 web으로 지정하려던 설정입니다. ts를 SSR로 나누는 첫 수정은 이 의도를 바꾸므로, 최종 react18은 `testTransformMode.web`에 ts·tsx를 모두 지정하고 ssr 목록을 두지 않습니다. jsdom의 render 프로젝트와 같이 `VirtualizationManager.test.ts`도 web 변환을 유지합니다.
2. picomatch의 기본 `**`는 dot 디렉터리와 일치하지 않습니다. 따라서 checkout이 `.claude/worktrees` 같은 숨김 상위 디렉터리에 있으면 상대 glob은 production ts와 일치하지 않아 jsdom의 web 변환으로 후퇴할 수 있습니다. 두 프로젝트의 각 패턴을 `${__dirname}/src/**/*.ts` 또는 `${__dirname}/src/**/*.tsx`로 고정합니다. checkout 상위 경로는 명시적인 접두사가 되고 와일드카드는 패키지 src 아래에서만 작동하므로 상위 dot 디렉터리를 통과할 필요가 없습니다. production은 ts SSR·tsx web을 유지합니다.
3. 첫 인계의 제품 수정 SHA 뒤 문서 커밋은 결과 문서 신설뿐 아니라 request·verification 기록의 추가도 포함했습니다. PR 본문의 해당 설명에 세 기록을 모두 명시합니다.

이 보완의 수정·커밋은 IR-2 측정 창 중에 허용받았습니다. 코디네이터의 window clear가 오기 전에는 시험·빌드·lint를 실행하지 않으며, 이전 표의 통과는 해당 SHA의 증거로만 보존합니다. 허용 뒤 strict production·일반 production·react18·render를 각각 단독 실행하고 새 결과를 아래에 추가합니다.


### P3 보완 재검증 — window clear 이후

코디네이터의 window clear 메시지 `msg_f20c41f1ac2d`는 2026-10-30 17:30:05 UTC에 발송됐습니다. 이를 읽고 사용자의 같은 배정 재개 지시를 확인한 뒤에만 시험을 시작했습니다. 실행 HEAD는 네 행 모두 `0655c6e93f3867d9089f44c880c3fd15e8d208f4`입니다. 아래 순서대로 각 명령을 별도 호출해 종료를 확인한 뒤 다음 명령을 실행했습니다.

| 순서 | 명령 | 시작 시각 (2026-10-31 KST) | 통과 파일 | 통과 시험 | 실패 | 종료 | 소요 시간 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `yarn workspace @canard/schema-form test:production` | 02:30:53 | 10 | 21 | 0 | 0 | 3.59s |
| 2 | `yarn workspace @canard/schema-form test --run --project production` | 02:31:05 | 10 | 21 | 0 | 0 | 3.55s |
| 3 | `yarn workspace @canard/schema-form test --run --project react18` | 02:31:16 | 132 | 769 | 0 | 0 | 63.12s |
| 4 | `yarn workspace @canard/schema-form test --run --project render` | 02:32:30 | 132 | 769 | 0 | 0 | 63.14s |

react18의 `VirtualizationManager.test.ts` 13건과 render의 같은 시험 13건이 각각 통과했습니다. production freeze는 1706/502/111/5, `NODE_ENV=test` freeze는 27642/10022/1564/63으로 직전과 같습니다. 네 관문 모두 todo·skip·실패는 없습니다.

이 후속 단계의 저장소 변경은 시험 변환 설정과 이 기록의 추가뿐입니다. 런타임 소스·타입·빌드 설정은 바꾸지 않았으며 코디네이터가 지정한 네 관문을 재실행했습니다. 앞 절의 build·lint·선언 차분 증거는 해당 SHA의 기록으로 유지합니다. 이후 기록 커밋은 위 실행 결과만 추가합니다.
