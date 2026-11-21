# 5라운드 버그 바운티 수정 기록

5라운드의 16개 패키지에서 확인한 69건은 서로 다른 결함 53건에서 나왔습니다. 높은 심각도는 서로 다른 결함 1건이며 치명적인 항목은 없습니다. 집계 기준은 [README.md](README.md)입니다. 발견 단위로 60건은 코드 수정, 7건은 문서 수정, 2건은 한계 명시로 처리했습니다. 수정은 `810520e27` 다음부터 시작하며, 병합된 범위의 끝은 `1932bb74f`입니다. 원래 발견 69건의 집계는 유지하며, 내부 검증과 병합 뒤 추가 검증의 항목은 별도 표로 기록합니다.

수정은 [../FIX-PROCEDURE.md](../FIX-PROCEDURE.md)의 작업 단위로 진행했습니다. promise-modal과 agents-assets-sync는 [#656](https://github.com/vincent-kk/albatrion/pull/656), schema-form은 [#657](https://github.com/vincent-kk/albatrion/pull/657), 유틸리티는 [#658](https://github.com/vincent-kk/albatrion/pull/658)로 합쳤습니다. 첫 내부 검증의 자산 및 스타일 후속 처리는 [#659](https://github.com/vincent-kk/albatrion/pull/659), 추적 감사가 찾은 공개 React 선언의 누락은 [#660](https://github.com/vincent-kk/albatrion/pull/660)입니다. 일곱 플러그인과 지속적 통합 시간 수정은 [#661](https://github.com/vincent-kk/albatrion/pull/661), 두 번째 내부 검증의 사용자 인터페이스 회귀와 AJV 회귀는 각각 [#663](https://github.com/vincent-kk/albatrion/pull/663), [#664](https://github.com/vincent-kk/albatrion/pull/664)입니다. schema-form 후속 수정은 [#662](https://github.com/vincent-kk/albatrion/pull/662)로 병합했으며 통합 해시는 `0bc5cb07b`입니다. 독립 검토 입력의 회귀 테스트 보존은 [#665](https://github.com/vincent-kk/albatrion/pull/665)의 `4ea21e8a1`, 모바일 슬라이더 후속 수정은 [#666](https://github.com/vincent-kk/albatrion/pull/666)의 `0912a3c32`, 보유 원본 장치 교체는 [#667](https://github.com/vincent-kk/albatrion/pull/667)의 `1932bb74f`까지 병합했습니다. 이 기록의 풀 리퀘스트는 모두 12개이며 모두 병합됐습니다. #665는 8개 패키지의 테스트 파일 54개와 등록 사례 232건을 추가했고, #666은 두 항목을 고쳤습니다. #667의 입력별 수정은 아래 추가 검증표의 9행에 나누어 기록하며 #666의 2행과 합쳐 코드 수정 11행입니다. 파일 수와 사례 수를 결함 수에 더하지 않습니다.

실패 커밋은 발견을 재현하는 검증을 먼저 넣은 커밋이고, 수정 커밋은 그 원인과 검토에서 드러난 이웃 경로를 고친 커밋입니다. 결과표는 저장소의 커밋과 테스트 경로를 대조한 추적 기록입니다. 문서 수정과 한계 명시의 검증을 런타임 수정의 증거로 해석하지 않습니다. 이 문서를 쓰면서 빌드나 테스트를 새로 실행하지 않았습니다. 검증과 속도 수용은 구현 보고, 독립 검토와 추적 감사의 증거를 기록하며 남은 제약은 알려진 한계에 둡니다.

동작 결정은 표준과 문서 계약, 형제 구현 사이의 예측 가능성, 해당 속도 행을 근거로 기록합니다. 소유자가 재확인할 공개 변경과 수용 비용은 소유자가 정할 일에 모읍니다.

## 패키지별 결과

코드 수정은 실행 코드나 타입 선언을 고친 항목이고, 문서 수정은 동작을 유지한 채 설명을 맞춘 항목이며, 한계 명시는 지원하지 않는 범위를 밝힌 항목입니다. 각 표의 경로는 해당 패키지의 `src/` 기준입니다. 같은 항목의 추가 패키지나 내부 검증 행을 원래 발견 수에 다시 더하지 않습니다.

### @winglet/common-utils

| 항목 | 처리 | 결과 | 실패 커밋 | 수정 커밋 | 고정 검증 |
|---|---|---|---|---|---|
| 1 | 코드 수정 | 다른 호출의 manager.update는 진행 중인 hook에 지연되지 않습니다. | `c2dc22924` | `349330094` | `utils/function/enhance/getTrackableHandler/__tests__/ownershipModel.round5.test.ts` |
| 2 | 코드 수정 | 다른 realm의 Error에서도 속성의 열거 가능 여부를 보존합니다. | `c2dc22924` | `94afed3c2`, `bd56f6ccc` | `utils/object/__tests__/errorDescriptors.round5.test.ts` |
| 3 | 코드 수정 | 깊은 그래프의 clone과 stableEquals를 반복 처리하여 스택 초과를 피합니다. | `c2dc22924` | `90f2cdcd2` | `utils/object/__tests__/depth.round5.test.ts` |
| 4 | 코드 수정 | 키 정렬과 불변 병합이 프로토타입 없는 사전을 유지합니다. | `c2dc22924` | `ad0200dc8`, `31b67fd84` | `utils/object/__tests__/containerPrototypes.round5.test.ts` |
| 5 | 한계 명시 | 내장 하위 클래스의 추가 자기 속성을 복사하지 않는 한계를 명시합니다. | `c2dc22924` | `362f983e1` | `__tests__/guidance.round5.test.ts` |
| 6 | 문서 수정 | isEmpty의 다른 realm Map과 Set 한계를 한국어에도 명시합니다. | `c2dc22924` | `d50d5a1e2` | `__tests__/guidance.round5.test.ts` |
| 7 | 코드 수정 | AbortController가 없는 환경은 함수를 시작하기 전에 거절합니다. | `c2dc22924` | `e1e262f25` | `utils/promise/__tests__/runtimeContract.round5.test.ts` |

### @winglet/json

| 항목 | 처리 | 결과 | 실패 커밋 | 수정 커밋 | 고정 검증 |
|---|---|---|---|---|---|
| 1 | 코드 수정 | 불변 패치로 쓰는 그릇의 null 프로토타입을 유지합니다. | `ff467ffea` | `c4cbfc531`, `7b62e60f6`, `c9acb56d5` | `__tests__/containerPrototypes.round5.test.ts` |
| 2 | 코드 수정 | 점 표기에서 포인터로 되돌릴 때 빈 토큰을 보존합니다. | `ff467ffea` | `d26d990fa` | `__tests__/canonicalPathRoundTrips.round5.test.ts` |

### @winglet/json-schema

| 항목 | 처리 | 결과 | 실패 커밋 | 수정 커밋 | 고정 검증 |
|---|---|---|---|---|---|
| 1 | 코드 수정 | 기본 포트가 명시된 방언 URI도 같은 방언으로 인식합니다. | `d5e8998ff` | `0305faecb` | `__tests__/dialectSpellings.round5.test.ts`, `utils/JSONSchemaScanner/utils/dialectFlag/__tests__/uriSpellings.round5.test.ts` |

### @winglet/react-utils

| 항목 | 처리 | 결과 | 실패 커밋 | 수정 커밋 | 고정 검증 |
|---|---|---|---|---|---|
| 1 | 한계 명시 | ESM은 React 18 이상이 필요하며 이전 버전은 CommonJS나 별칭을 사용합니다. | `a65a395c8`, `929acbe90` | `173915277`, `bb41b9472`, `601b52eac`, `b01fa0088`, `65aed55ef` | `__tests__/packaging/reactJsxRuntime.packaging.mjs` |
| 2 | 문서 수정 | 렌더 중 snapshot reference는 앞 커밋 값이라는 설명을 맞춥니다. | `a65a395c8`, `929acbe90` | `a282acf8d` | `__tests__/snapshotGuidance.round5.test.ts` |

### @winglet/style-utils

| 항목 | 처리 | 결과 | 실패 커밋 | 수정 커밋 | 고정 검증 |
|---|---|---|---|---|---|
| 1 | 코드 수정 | 중첩 문장형 at-rule 뒤의 다음 식별자 규칙을 보존합니다. | `af9b6feb8` | `47a6b688a` | `__tests__/fragmentModel.round5.test.ts` |
| 2 | 코드 수정 | 그림자 루트에서도 미완성 전주부가 다음 조각을 삼키지 않습니다. | `af9b6feb8` | `47a6b688a` | `__tests__/fragmentModel.round5.test.ts` |
| 3 | 코드 수정 | 문법 문맥별로 의미 있는 공백과 부호 경계를 보존합니다. | `af9b6feb8` | `47a6b688a`, `ac0f24e4a`, `02e438804`, `b8f2e0217`, `72d8a0037` | `__tests__/compressionModel.round5.test.ts`, `__tests__/commentValues.round5.test.ts`, `__tests__/selectorBoundaries.round5.test.ts` |
| 4 | 문서 수정 | 한국어 destroyScope에 shadowRoot와 이전 주입기 폐기 규칙을 적습니다. | `cd0baa321` | `1fa242296` | `__tests__/guidance.round5.test.ts` |

### @lerx/promise-modal

| 항목 | 처리 | 결과 | 실패 커밋 | 수정 커밋 | 고정 검증 |
|---|---|---|---|---|---|
| 1 | 코드 수정 | 중단된 콘텐츠의 표시 판정을 페이지 비활성화와 공유하여 초점을 복원합니다. | `107f3e4e6` | `27be686ec` | `__tests__/roundFive/focusRule.r5.render.test.tsx` |

### @slats/agents-assets-sync

| 항목 | 처리 | 결과 | 실패 커밋 | 수정 커밋 | 고정 검증 |
|---|---|---|---|---|---|
| 1 | 코드 수정 | 계획 실패 참여자의 소유 가능 범위를 보호하고 확실한 고아만 지웁니다. | `705ed9a78` | `7e56b4e1a`, `4c1ef618a`, `9c3756d51`, `e5110e386`, `9f02539b7` | `__tests__/roundFive/participantFailure.test.ts`, `core/injectDocs/__tests__/participantModel.test.ts` |
| 2 | 코드 수정 | 완전하지 않은 마커를 원본 보존과 이유를 동반하여 거절합니다. | `705ed9a78` | `7e56b4e1a`, `514a8c40d` | `__tests__/roundFive/unclosedBlock.test.ts` |
| 3 | 코드 수정 | 한 번 읽은 바이트를 모든 출력에 쓰며 선두 바이트 순서 표시를 블록에 복사하지 않습니다. | `705ed9a78` | `7e56b4e1a`, `61f51655c`, `62817708c`, `cf6d8117e`, `cd9476c27` | `__tests__/roundFive/bomRuleSource.test.ts` |
| 4 | 코드 수정 | 하드 링크와 복원할 수 없는 메타데이터는 제자리 쓰기로 보존합니다. | `705ed9a78` | `e308b7712`, `f09de00be` | `__tests__/roundFive/documentIdentity.test.ts` |
| 5 | 코드 수정 | 자산 선언이 없는 패키지의 해시 빌드는 성공하며 아무것도 하지 않습니다. | `705ed9a78` | `6853e7d3b` | `__tests__/roundFive/buildHashesOptOut.test.ts` |
| 6 | 코드 수정 | 인자 및 사전 검사 실패에도 JSON 문서 하나를 출력합니다. | `705ed9a78` | `b7c1ca9b4`, `ca2cf3973`, `d555519ac`, `4c1ef618a` | `__tests__/roundFive/jsonTargetFlagErrors.test.ts`, `__tests__/roundFive/preflightJSON.test.ts` |
| 7 | 코드 수정 | 문서 쓰기 거절의 경로와 원인을 모든 출력에서 보존합니다. | `705ed9a78` | `b7c1ca9b4`, `cd9476c27` | `__tests__/roundFive/refusalReason.test.tsx` |
| 8 | 코드 수정 | 터미널의 최종 결과와 미리보기에 실패 경로를 표시합니다. | `705ed9a78` | `b7c1ca9b4`, `492058eba` | `__tests__/roundFive/refusalReason.test.tsx` |
| 9 | 코드 수정 | 범위 선택기의 설명을 실제 루트 마커 규칙에 맞춥니다. | `705ed9a78` | `82f8aabba` | `__tests__/roundFive/scopePickerHint.test.tsx` |
| 10 | 문서 수정 | 한국어 설명의 호출당 소비자 제한을 현재 계약에 맞춥니다. | `705ed9a78` | `82f8aabba` | `__tests__/roundFive/koreanReadme.test.ts` |
| 11 | 문서 수정 | 한국어 projectRoot 설명을 현재 우선순위에 맞춥니다. | `705ed9a78` | `82f8aabba` | `__tests__/roundFive/koreanProjectRoot.test.ts` |

### @canard/schema-form

| 항목 | 처리 | 결과 | 실패 커밋 | 수정 커밋 | 고정 검증 |
|---|---|---|---|---|---|
| 1 | 코드 수정 | 비활성 구성원의 자리를 undefined로 남기고 가상 튜플의 선언 순서를 지킵니다. | `1d1e38d89` | `45422c209`, `51a96ef84`, `c469f6f44`, `213e0e825` | `core/engine/__tests__/virtualNeighbors.round-five.test.ts` |
| 2 | 코드 수정 | draft-04 내장 자원의 참조가 첫 진입 순서에 의존하지 않습니다. | `1d1e38d89` | `e4f82fe24` | `core/engine/blueprint/buildNodes/__tests__/resourceEntryOrder.round-five.test.ts` |
| 3 | 코드 수정 | 순환 속성을 가진 Error의 context 비교가 종료합니다. | `1d1e38d89` | `9e7102bcf`, `a8c0027d9` | `__tests__/e2e/contextErrorCycle.round-five.test.tsx` |
| 4 | 코드 수정 | 가상 그룹의 초기화가 비활성 구성원의 보유 값에도 도달합니다. | `1d1e38d89` | `45422c209`, `c469f6f44`, `213e0e825` | `core/engine/__tests__/virtualNeighbors.round-five.test.ts` |
| 5 | 문서 수정 | 두 언어의 설치 예제에 실제 피어 범위를 씁니다. | `1d1e38d89` | `5f8996806` | `__tests__/documentedPeerRanges.round-five.test.ts` |
| 6 | 코드 수정 | 공개 결과 타입을 ReactElement로 선언합니다. | `1d1e38d89` | `0a2ee36d8`, `bf5e79bbe` | `__tests__/publishedReactTypes.round-five.test.ts` |

### @winglet/data-loader

이번 라운드의 발견 항목은 없습니다.

### 공개 선언의 패키지별 추적 보완

schema-form 6번은 한 패키지의 처리만으로 끝나지 않습니다. 위 코어 행에 이어 아래 모든 공개 경로를 추적합니다.

| 항목 | 처리 | 결과 | 실패 커밋 | 수정 커밋 | 고정 검증 |
|---|---|---|---|---|---|
| 6번의 promise-modal 부분입니다. | 코드 수정 | 세 제공자의 결과를 ReactElement로 선언합니다. | `73a65a912` | `3fdeebef4` | `packages/lerx/promise-modal/src/__tests__/publishedReactTypes.round-five.test.ts` |
| 6번의 react-utils 부분입니다. | 코드 수정 | Portal.Anchor와 withPortal 결과를 ReactElement로 선언합니다. | `73a65a912` | `3fdeebef4` | `packages/winglet/react-utils/src/__tests__/publishedReactTypes.round-five.test.ts` |

### @canard/schema-form-ajv6-plugin

| 항목 | 처리 | 결과 | 실패 커밋 | 수정 커밋 | 고정 검증 |
|---|---|---|---|---|---|
| 1 | 코드 수정 | 애플리케이션이 컴파일한 스키마와 같은 루트의 해제가 원본 캐시를 손상하지 않습니다. | `9826e66b2` | `2696493f2` | `__tests__/roundFive.applicationCache.test.ts` |
| 2 | 코드 수정 | 내장 자원 별칭을 애플리케이션에 등록하지 않습니다. | `9826e66b2` | `2696493f2` | `__tests__/roundFive.ownership.test.ts` |
| 3 | 코드 수정 | 수집된 어댑터가 마지막 루트의 수명을 붙잡지 않습니다. | `9826e66b2` | `2696493f2` | `__tests__/roundFive.ownership.test.ts` |
| 4 | 코드 수정 | 비동기 format과 문맥 가드를 현재 상태로 컴파일합니다. | `9826e66b2` | `2696493f2`, `4c2da6f96` | `__tests__/roundFive.asyncCompilation.test.ts` |
| 5 | 코드 수정 | 애플리케이션에서 지운 스키마를 사본에 계속 쓰지 않습니다. | `9826e66b2` | `2696493f2` | `__tests__/roundFive.applicationCache.test.ts` |
| 6 | 코드 수정 | 비동기 키워드와 id를 가진 같은 루트의 반복 컴파일을 허용합니다. | `9826e66b2` | `2696493f2`, `4c2da6f96` | `__tests__/roundFive.asyncCompilation.test.ts` |

### @canard/schema-form-ajv7-plugin

| 항목 | 처리 | 결과 | 실패 커밋 | 수정 커밋 | 고정 검증 |
|---|---|---|---|---|---|
| 1 | 코드 수정 | 애플리케이션의 내장 자원 주소를 덮거나 제거하지 않습니다. | `e7dc77125` | `735afb8ab` | `__tests__/roundFive.ownership.test.ts` |
| 2 | 코드 수정 | 어댑터가 수집되어도 마지막 루트를 해제합니다. | `e7dc77125` | `735afb8ab` | `__tests__/roundFive.ownership.test.ts` |
| 3 | 코드 수정 | 참조가 있는 비동기 키워드의 문맥 가드를 컴파일합니다. | `e7dc77125` | `735afb8ab`, `cbb1f5f47` | `__tests__/roundFive.asyncCompilation.test.ts` |
| 4 | 코드 수정 | 비동기 format을 현재 상태로 컴파일합니다. | `e7dc77125` | `735afb8ab`, `cbb1f5f47` | `__tests__/roundFive.asyncCompilation.test.ts` |
| 5 | 코드 수정 | errors 속성을 가진 일반 키워드 예외를 그대로 전달합니다. | `e7dc77125` | `c6e45dd85` | `__tests__/roundFive.keywordExceptions.test.ts` |

### @canard/schema-form-ajv8-plugin

| 항목 | 처리 | 결과 | 실패 커밋 | 수정 커밋 | 고정 검증 |
|---|---|---|---|---|---|
| 1 | 코드 수정 | 애플리케이션의 내장 자원 주소를 덮거나 제거하지 않습니다. | `a2cbdec5d` | `3d3871eb8` | `__tests__/roundFive.ownership.test.ts` |
| 2 | 코드 수정 | 어댑터가 수집되어도 마지막 루트를 해제합니다. | `a2cbdec5d` | `3d3871eb8` | `__tests__/roundFive.ownership.test.ts` |
| 3 | 코드 수정 | id와 참조가 있는 비동기 루트와 문맥 가드를 컴파일합니다. | `a2cbdec5d` | `3d3871eb8`, `1811fc8c3` | `__tests__/roundFive.asyncCompilation.test.ts` |
| 4 | 코드 수정 | errors 속성을 가진 일반 키워드 예외를 그대로 전달합니다. | `a2cbdec5d` | `c6e45dd85` | `__tests__/roundFive.keywordExceptions.test.ts` |
| 5 | 코드 수정 | 루트 보유 상한을 어댑터마다 새로 만들지 않습니다. | `a2cbdec5d` | `3d3871eb8` | `__tests__/roundFive.scopeGrowth.test.ts` |

### @canard/schema-form-antd5-plugin

| 항목 | 처리 | 결과 | 실패 커밋 | 수정 커밋 | 고정 검증 |
|---|---|---|---|---|---|
| 1 | 코드 수정 | 레이블 배치에 관계없이 그룹과 범위 입력에 접근성 이름을 줍니다. | `3dbfa9deb` | `0ce02213a`, `21effb351` | `__tests__/roundFive.customLayoutNames.test.tsx` |
| 2 | 코드 수정 | 배타적 상하한 안의 격자로 제한합니다. | `3dbfa9deb` | `cafc784f1` | `__tests__/roundFive.sliderInputs.test.tsx` |
| 3 | 코드 수정 | 허용하는 가장 낮은 버전이 제공하는 확정 콜백을 씁니다. | `3dbfa9deb` | `37ecf7287` | `__tests__/roundFive.sliderPeerFloor.test.tsx` |
| 4 | 코드 수정 | 아주 작은 multipleOf도 정확한 격자 값을 저장합니다. | `3dbfa9deb` | `cafc784f1` | `__tests__/roundFive.sliderInputs.test.tsx` |
| 6번의 공개 선언 부분입니다. | 코드 수정 | 조기 React 타입에서도 공개 결과를 읽습니다. | `3677ad40f` | `8b6280c57` | `__tests__/publishedReactTypes.roundFive.test.ts` |

### @canard/schema-form-antd6-plugin

| 항목 | 처리 | 결과 | 실패 커밋 | 수정 커밋 | 고정 검증 |
|---|---|---|---|---|---|
| 1 | 코드 수정 | 레이블 배치에 관계없이 그룹과 범위 입력에 접근성 이름을 줍니다. | `d6beb13ce` | `0ce02213a`, `5b11c571b` | `__tests__/roundFive.customLayoutNames.test.tsx` |
| 2 | 코드 수정 | 배타적 상하한 안의 격자로 제한합니다. | `d6beb13ce` | `cafc784f1` | `__tests__/roundFive.sliderInputs.test.tsx` |
| 3 | 코드 수정 | 아주 작은 multipleOf도 정확한 격자 값을 저장합니다. | `d6beb13ce` | `cafc784f1` | `__tests__/roundFive.sliderInputs.test.tsx` |
| 6번의 공개 선언 부분입니다. | 코드 수정 | 조기 React 타입에서도 공개 결과를 읽습니다. | `ffbd82f46` | `96c1eaedd` | `__tests__/publishedReactTypes.roundFive.test.ts` |

### @canard/schema-form-mui-plugin

| 항목 | 처리 | 결과 | 실패 커밋 | 수정 커밋 | 고정 검증 |
|---|---|---|---|---|---|
| 1 | 코드 수정 | 큰 이동 키도 multipleOf 격자를 지킵니다. | `2fc052d97` | `cafc784f1` | `__tests__/roundFive.sliderInputs.test.tsx` |
| 2 | 코드 수정 | 레이블과 숨긴 제목이 조작 요소의 접근성 이름에 연결됩니다. | `2fc052d97` | `0ce02213a`, `e6616c48c`, `8b1066cf6` | `__tests__/roundFive.customLayoutNames.test.tsx` |
| 3 | 코드 수정 | 배타적 상하한 안의 격자로 제한합니다. | `2fc052d97` | `cafc784f1` | `__tests__/roundFive.sliderInputs.test.tsx` |
| 4 | 코드 수정 | 그룹 내부의 legend가 코어 labelId를 중복하지 않습니다. | `2fc052d97` | `0ce02213a`, `e6616c48c`, `8b1066cf6` | `__tests__/roundFive.accessibleDefinitions.test.tsx` |
| 5 | 코드 수정 | 격자 밖 저장 값에서 시작한 이동도 격자에 맞춥니다. | `2fc052d97` | `cafc784f1` | `__tests__/roundFive.sliderInputs.test.tsx` |
| 6 | 코드 수정 | 열거 밖 값을 보존하며 경고를 출력하지 않습니다. | `2fc052d97` | `54a79fcc7` | `__tests__/roundFive.enumWarnings.test.tsx` |
| 7 | 문서 수정 | README의 React 범위를 실제 피어 범위에 맞춥니다. | `2fc052d97` | `36a791b54` | `__tests__/roundFive.readmeReactRange.test.ts` |
| 6번의 공개 선언 부분입니다. | 코드 수정 | 조기 React 타입에서도 공개 결과를 읽습니다. | `37515ef6f` | `65ee51b9c` | `__tests__/publishedReactTypes.roundFive.test.ts` |

### @canard/schema-form-antd-mobile-plugin

| 항목 | 처리 | 결과 | 실패 커밋 | 수정 커밋 | 고정 검증 |
|---|---|---|---|---|---|
| 1 | 코드 수정 | 그룹과 스위치가 필드 제목을 접근성 이름으로 사용합니다. | `bef6a3971` | `0ce02213a` | `__tests__/roundFive.customLayoutNames.test.tsx` |
| 2 | 코드 수정 | 배타적 상하한 안의 격자로 제한합니다. | `bef6a3971` | `cafc784f1` | `__tests__/roundFive.sliderInputs.test.tsx` |
| 3 | 코드 수정 | 빈 숫자 입력을 지원하는 ^5.2.0부터 허용합니다. | `bef6a3971` | `42eb21410` | `__tests__/roundFive.stepperPeerFloor.test.tsx` |
| 4 | 코드 수정 | 격자나 범위 밖에서 시작한 키 이동도 유효한 값으로 맞춥니다. | `bef6a3971` | `cafc784f1` | `__tests__/roundFive.sliderInputs.test.tsx` |
| 5 | 코드 수정 | 아주 작은 multipleOf도 정확한 격자 값을 저장합니다. | `bef6a3971` | `cafc784f1` | `__tests__/roundFive.sliderInputs.test.tsx` |
| 6번의 공개 선언 부분입니다. | 코드 수정 | 조기 React 타입에서도 공개 결과를 읽습니다. | `b9d378590` | `b8f5a7091` | `__tests__/publishedReactTypes.roundFive.test.ts` |

### 첫 내부 검증의 결과

다음 항목은 기준에서도 같은 결과였으며 이번 수정이 만든 회귀로 분류하지 않습니다. 앞의 자산 및 스타일 후속 풀 리퀘스트가 처리합니다.

| 항목 | 처리 | 결과 | 실패 커밋 | 수정 커밋 | 고정 검증 |
|---|---|---|---|---|---|
| 자산 1번입니다. | 한계 명시 | 인용문 안의 인라인 역따옴표도 울타리로 읽는 거절 범위를 명시합니다. | 없습니다. | `c8791fe34`, `1a14282ee` | `packages/slats/agents-assets-sync/src/core/markerBlock/__tests__/scannerLimits.test.ts` |
| 자산 2번입니다. | 한계 명시 | 목록의 인라인 역따옴표와 빈 줄 없는 중단 뒤의 들여쓰기 유지 범위를 명시합니다. | 없습니다. | `c8791fe34`, `1a14282ee` | `packages/slats/agents-assets-sync/src/core/markerBlock/__tests__/scannerLimits.test.ts` |
| 자산 3번입니다. | 코드 수정 | 닫힌 주석 뒤 역따옴표 안에서 다시 연 주석의 모호한 범위를 거절합니다. | `c342df1a7` | `cc1da8f23` | `packages/slats/agents-assets-sync/src/core/markerBlock/__tests__/reopenedComment.test.ts` |
| 자산 4번입니다. | 문서 수정 | 역따옴표 속 -->도 주석을 닫는 현재 판독을 명시합니다. | 없습니다. | `c8791fe34`, `1a14282ee` | `packages/slats/agents-assets-sync/src/core/markerBlock/__tests__/scannerLimits.test.ts` |
| 자산 5번입니다. | 코드 수정 | 일반 문장 안의 재개 주석도 같은 거절 규칙을 씁니다. | `c342df1a7` | `cc1da8f23` | `packages/slats/agents-assets-sync/src/core/markerBlock/__tests__/reopenedComment.test.ts` |
| 자산 6번입니다. | 코드 수정 | 같은 경로의 강제 적용 확인 행을 대상 종류별로 구분합니다. | `c342df1a7` | `ac8f7deb6` | `packages/slats/agents-assets-sync/src/ui/__tests__/confirmForceRows.test.tsx` |
| 스타일 7번입니다. | 문서 수정 | :/*c*/root가 :root와 같은 토큰열임을 명시합니다. | 없습니다. | `86d3423ed`, `21d08bc2e` | `packages/winglet/style-utils/src/styleManager/__tests__/commentSeparatedRoot.test.ts` |
| 스타일 8번입니다. | 문서 수정 | :/*c*/host도 :host와 같은 전역 선택자임을 명시합니다. | 없습니다. | `86d3423ed`, `21d08bc2e` | `packages/winglet/style-utils/src/styleManager/__tests__/commentSeparatedRoot.test.ts` |
| 재개 주석의 이웃입니다. | 코드 수정 | 판독기마다 달리 보이는 END를 짝짓지 않아 강제 적용에서도 사용자 문장을 보존합니다. | `c342df1a7` | `cc1da8f23`, `86912eb06` | `packages/slats/agents-assets-sync/src/__tests__/reopenedComment.test.ts` |

### 두 번째 내부 검증과 schema-form 후속 결과

사용자 인터페이스의 다섯 회귀와 AJV의 네 회귀는 병합된 플러그인을 검증하여 찾았습니다. 각 행의 패키지 범위에서 같은 이름의 검증 파일을 유지합니다.

| 항목 | 처리 | 결과 | 실패 커밋 | 수정 커밋 | 고정 검증 |
|---|---|---|---|---|---|
| 오른쪽에서 왼쪽으로 쓰는 슬라이더입니다. | 코드 수정 | antd5, antd6, MUI가 제공자의 방향대로 화살표를 해석합니다. | `eb1468552` | `fc247b641` | 각 패키지의 `src/__tests__/roundFive.sliderModel.property.test.tsx`입니다. |
| 읽기 전용 소수 표시입니다. | 코드 수정 | 네 플러그인에서 multipleOf 없는 유효 소수를 저장 값 그대로 읽습니다. | `fb4dec31e` | `2182e4c4d`, `16f3ba679` | 각 패키지의 `src/__tests__/roundFive.sliderModel.property.test.tsx`입니다. |
| 한 기본 간격보다 좁은 범위입니다. | 코드 수정 | 네 플러그인이 포함된 상한을 선택 가능하게 유지합니다. | `b0893f07b` | `141139aea` | 각 패키지의 `src/__tests__/roundFive.sliderModel.property.test.tsx`입니다. |
| 보조 키 해제입니다. | 코드 수정 | antd5와 antd6는 이동 키를 놓을 때만 기본 lazy 값을 확정합니다. | `888aa2cbf` | `0f9285394` | 두 패키지의 `src/__tests__/roundFive.sliderModel.property.test.tsx`입니다. |
| MUI 선택기 레이블입니다. | 코드 수정 | 클릭을 조작 요소로 전달하며 비활성화된 선택기에 초점을 주지 않습니다. | `a5208678b`, `ec800d324` | `1b862c6f9`, `034d51dbb` | `packages/canard/schema-form-mui-plugin/src/__tests__/roundFive.labelTargets.test.tsx` |
| 비표준 그릇의 참조입니다. | 코드 수정 | 세 AJV가 로컬 참조가 닿은 위치의 외부 의존성을 가져옵니다. | `6d3f0b1e5`, `b93aeef3d`, `87354ff37` | `c3dfc84ec`, `392467f1f`, `960b7439d`, `9dd927a8f` | 각 패키지의 `src/__tests__/referencedContainerImports.test.ts`입니다. |
| 숨은 비동기 규칙입니다. | 코드 수정 | 세 AJV가 매크로 전개와 참조 위치의 비동기 사실을 기록합니다. | `d0fec666d`, `ce794a38c`, `2bcc847c5` | `c3dfc84ec`, `392467f1f`, `960b7439d` | 각 패키지의 `src/__tests__/expandedAsyncSchema.test.ts`입니다. |
| 교체된 키워드입니다. | 코드 수정 | 세 AJV가 참조 위치에서 쓰는 현재 정의로 다시 컴파일합니다. | `3e4efcf3b`, `8f91ac8f4`, `f02bc6a2e` | `c3dfc84ec`, `392467f1f`, `960b7439d` | 각 패키지의 `src/__tests__/referencedContainerExtensions.test.ts`입니다. |
| 키를 받은 팩터리의 오류입니다. | 코드 수정 | AJV 6과 7의 schemaPath가 #에서 시작하며 not.required의 rejectedKey를 보존합니다. | `e64c0f3b0`, `6589ddf15` | `367c0b478`, `23b0af0d0` | 두 패키지의 `src/__tests__/keyedValidatorFactory.test.ts`입니다. |
| 참조된 문서의 새 조각입니다. | 코드 수정 | 세 AJV가 같은 문서에서 새로 고른 조각의 의존성도 관찰합니다. | `c671b7897`, `9f7942571`, `d45e0061f` | `930343289`, `8df073744`, `d4987a211` | 각 패키지의 `src/__tests__/referencedContainerImports.test.ts`입니다. |
| 제한된 표본의 키워드 교체입니다. | 코드 수정 | 세 AJV의 제한된 프로필도 모든 연산 종류를 실행하고 누락을 거절합니다. | 별도 실패 커밋은 없습니다. | `5017aec21` | 각 패키지의 `src/__tests__/ownershipModel.property.test.ts`입니다. |

#### schema-form 후속 단위

이 단위는 #662로 병합됐으며 통합 해시는 `0bc5cb07b`입니다. 마지막 변경분 검토는 374개 관측 중 두 개가 문서 기대와 달랐으나 둘 다 수정 전에도 같았으며 통과 판정입니다. 이 관측이 남긴 두 번째 이탈의 값 소실은 아래 후속 커밋으로 고쳤습니다. 소유자는 두 번째 이탈 항목을 한계로 남기지 않고 수정하도록 결정했습니다.

아래 경로는 `packages/canard/schema-form/src/` 기준입니다. 처음 네 항목은 첫 내부 검증에서 찾았고, 생성 검증과 다섯 차례의 후속 검토가 추가 입력을 드러냈습니다. 계약 검토의 일곱 요구와 구현 검토의 요구를 모두 추적하며, 마지막 검토의 미수정 항목도 표시합니다.

| 항목 | 처리 | 결과 | 실패 커밋 | 수정 커밋 | 고정 검증 |
|---|---|---|---|---|---|
| 가상 입력의 되전달입니다. | 코드 수정 | 자신의 튜플을 다시 받은 비제어 입력을 다시 마운트하지 않습니다. | `5abafaa2c` | `ed58dac92` | `__tests__/e2e/virtualInputRelay.test.tsx` |
| 구성원 아래의 초기화입니다. | 코드 수정 | 살아 있는 구성원 아래 비활성 자손의 보유 값도 초기화합니다. | `5abafaa2c` | `56b5c6642` | `core/engine/__tests__/virtualConstituentAddresses.test.ts` |
| 선언적 가상 쓰기입니다. | 코드 수정 | 비활성 자리와 그룹에도 실제 구성원 주소로 분배합니다. | `5abafaa2c`, `7ce629941` | `d8b03ac82`, `e35f29eb7` | `core/engine/__tests__/virtualConstituentAddresses.test.ts` |
| 가상 그룹 이탈의 이웃입니다. | 코드 수정 | 구성원 상태를 두 번 차감하지 않습니다. | `de0c67dc4` | `411d0cc48` | `core/engine/__tests__/virtualConstituentAddresses.test.ts` |
| Error의 숨은 슬롯입니다. | 코드 수정 | cause와 AggregateError.errors를 context 비교에 포함합니다. | `5abafaa2c` | `aa5673344` | `providers/hooks/contextSnapshot/utils/__tests__/areContextsEqual.test.ts` |
| 열린 항목 A입니다. | 코드 수정 | 배치 안 선언적 객체 쓰기를 부분 병합하지 않고 전체 교체합니다. | `346e82186` | `fc3f6d2fd` | `core/engine/settle/__tests__/settle.batch-automatic-object.test.ts` |
| 열린 항목 B입니다. | 코드 수정 | updater와 같은 튜플 검사가 앞 호출의 타입 해석된 실제 값을 읽습니다. | `346e82186` | `c22d48c43` | `core/engine/write/__tests__/batchEffectiveView.test.ts`, `core/engine/__tests__/batchTypedRead.test.ts` |
| 이웃 C입니다. | 코드 수정 | 이미 이탈 중인 주소를 지명한 선언적 값을 나감 정책 뒤에 보존합니다. | `665e23025` | `fc3f6d2fd`, `2c97edaa5` | `core/engine/__tests__/virtualConstituentAddresses.test.ts`, `core/engine/__tests__/departingDeclarativeWrites.test.ts` |
| 이웃 D입니다. | 코드 수정 | 겹친 승자는 전체 순위로 적용하고 앞 계산 뒤의 값과 무변경을 비교합니다. | `deb2ad5da` | `af724358f` | `core/engine/__tests__/batchTwoLayerContract.test.ts` |
| 초기화의 장벽입니다. | 코드 수정 | 범위 밖의 앞선 표시도 초기화 전에 정착합니다. | `deb2ad5da` | `db1b1d409` | `core/engine/__tests__/batchTwoLayerContract.test.ts` |
| 계약 검토의 동등성 범위입니다. | 문서 수정 | 무조건 순차 동등성을 두 층의 구간 계약으로 바꾸고 중간 반응을 구별합니다. | 없습니다. | `3ded371ae` | `core/engine/__tests__/batchTwoLayerContract.test.ts` |
| 계약 검토의 정착과 규칙 발화 범위입니다. | 문서 수정 | 구조 동사와 초기화의 구간 경계, 규칙 연결과 예산을 구별합니다. | 없습니다. | `3ded371ae`, `113546043` | `core/engine/__tests__/batchReactionDimensions.test.ts` |
| 계약 검토의 생략과 비용 범위입니다. | 문서 수정 | 생략은 나감 정책을 취소하지 않으며 읽기 합성 비용은 가상 튜플 검사도 포함합니다. | 없습니다. | `3ded371ae` | `core/engine/__tests__/batchTwoLayerContract.test.ts` |
| 계약 검토의 생성기 미도달 차원입니다. | 코드 수정 | 배열 update, 루트 초기화, 연결 규칙, 순위 경쟁, 되돌림, 중첩과 단일 호출 및 관측을 별도로 고정합니다. | `deb2ad5da` | `113546043`, `dd2df648f` | `core/engine/__tests__/batchReactionDimensions.test.ts`, `core/engine/__tests__/batchTwoLayerContract.test.ts` |
| 직접 이탈 주소의 값입니다. | 코드 수정 | 부모 객체뿐 아니라 자신의 경로로 지명한 값도 보존합니다. | `e79bb2ff6` | `2c97edaa5` | `core/engine/__tests__/departingDeclarativeWrites.test.ts` |
| 낮은 객체 쓰기의 재적용입니다. | 코드 수정 | 높은 비활성 자식 값이 낮은 분배로 덮이지 않습니다. | `791fec7b1` | `f978e7960` | `core/engine/__tests__/overlappingLatentWrites.test.ts` |
| 앞 승자 뒤에 이탈하는 대상입니다. | 코드 수정 | 적용 시점의 주소 상태로 선언적 값을 배치합니다. | `a89ffd7bd` | `f978e7960` | `core/engine/__tests__/declarativeWriteRouting.test.ts` |
| 비활성 주소의 호출자 경쟁입니다. | 코드 수정 | 같은 정착에서 선언적 값이 겹친 호출자 값을 이깁니다. | `a89ffd7bd` | `f978e7960` | `core/engine/__tests__/declarativeWriteRouting.test.ts` |
| 취소된 이탈입니다. | 코드 수정 | 이탈 기록을 재활성화된 노드에 적용합니다. | `a89ffd7bd` | `f978e7960` | `core/engine/__tests__/declarativeWriteRoutingModel.test.ts` |
| 거절된 초기화입니다. | 코드 수정 | 장벽이 대상을 떼어내면 초기화를 거절하고 범위 안 호출자 표시를 남깁니다. | `a89ffd7bd` | `1b0edcf70` | `core/engine/__tests__/batchTwoLayerContract.test.ts` |
| 이탈 및 재활성 기록 순위입니다. | 코드 수정 | 깊이 정렬 대신 기록이 생긴 순위를 유지합니다. | `15eb51883` | `bc80500af` | `core/engine/__tests__/departingRecordRank.test.ts` |
| 조상 전체 쓰기의 생략입니다. | 문서 수정 | 생략한 주소는 지명한 주소가 아니라는 현재 동작으로 계약을 정정합니다. | 없습니다. | `c24d42dc5`, `e93824424` | `core/engine/__tests__/ancestorWholeOverResolver.test.ts` |
| 거절 초기화의 부분 겹침입니다. | 코드 수정 | 뒤 Merge가 실제 지명한 부분만 앞 표시에서 제외합니다. | `15eb51883` | `1adfd6a63` | `core/engine/__tests__/refusedResetOverlap.test.ts` |
| 재활성 기록의 자손 주소입니다. | 코드 수정 | 기록이 지명한 자손에 쓰는지 변형 검증을 추가합니다. | 별도 실패 커밋은 없습니다. | `0e7da43d6` | `core/engine/__tests__/revivedRecordAddress.test.ts` |
| 한 구성원의 가상 Merge입니다. | 코드 수정 | 구성원 수가 하나여도 저장 자리로 튜플 키를 풀어 거절 초기화의 보유 값을 지킵니다. | `74009a5d5` | `949212e1e` | `core/engine/__tests__/refusedResetOverlap.test.ts` |
| 재활성화 뒤 두 번째 이탈입니다. | 코드 수정 | 재활성 기록이 지명한 값을 같은 정착의 두 번째 이탈에도 보존합니다. | `732ce77e2` | `0bc5cb07b` | `core/engine/__tests__/revivedDepartingWriteSecondExit.test.ts`, 모델 확장 `9c29021da`의 `core/engine/__tests__/declarativeWriteRoutingModel.test.ts`입니다. |
| 제한된 프로필과 검사 분할입니다. | 코드 수정 | 모든 종류를 보존하는 표본과 세 병렬 작업으로 검사 시간을 제한합니다. | `16a780801` | `d788db812`, `7abfe79a4`, `37051b1c6` | `core/engine/__tests__/batchDeclarativeWrites.test.ts`와 지속적 통합 계획 검증입니다. |

두 번째 이탈의 원래 관측 파일은 [probes/revived-record-second-exit.test.ts](probes/revived-record-second-exit.test.ts)에 내용 변경 없이 보존합니다. 이 관측의 현재 고정 검증은 위 결과표의 저장소 테스트입니다.

### 병합 뒤 추가 검증에서 나온 항목

#666과 #667은 모두 병합됐습니다. 아래 schema-form 검증 경로는 `packages/canard/schema-form/src/core/engine/__tests__/` 기준이며 모바일은 전체 경로입니다. #667의 입력은 부모 객체, 자신의 경로와 가상 그룹의 세 경로 및 Merge, 배치와 중첩 배치에서 검증했습니다.

| 항목 | 처리 | 결과 | 실패 커밋 | 수정 커밋 | 고정 검증 |
|---|---|---|---|---|---|
| 모바일 Home과 End입니다. | 코드 수정 | 배타 경계 안에서 가장 바깥의 유효 mark를 선택합니다. | `e48b05910` | `20248ee3a` | `packages/canard/schema-form-antd-mobile-plugin/src/__tests__/roundFive.sliderMarks.test.tsx` |
| 모바일의 좁은 배타 구간 레이블입니다. | 코드 수정 | 기본 격자가 비어도 유효 mark 레이블을 표시하며 조작은 비활성화합니다. | `7bb7d8a5b` | `0912a3c32` | `packages/canard/schema-form-antd-mobile-plugin/src/__tests__/roundFive.sliderMarks.test.tsx` |
| 살아 있는 부모의 전체 쓰기 뒤 이탈입니다. | 코드 수정 | 명시한 원본에 나감 정책을 적용합니다. | `73c742533` | `4bdd06622` | `liveWholeWriteExit.test.ts` |
| 키 생략 뒤 지명과 이탈입니다. | 코드 수정 | 뒤 규칙이 지명한 값을 앞 생략의 복구가 덮지 않습니다. | `86471687a` | `abeee05ce` | `liveWholeFillOrder.test.ts` |
| 그릇 생략 뒤 중첩 지명과 이탈입니다. | 코드 수정 | 조상의 복구가 명시한 자손 값을 덮지 않습니다. | `6f35dfa80` | `abeee05ce` | `liveWholeNestedFillExit.test.ts` |
| 배열 길이 축소 뒤 미생성 자리의 지명입니다. | 코드 수정 | 길이 1에서 0으로 줄인 뒤 새 자리를 지명하면 생성 전 이탈해도 새 값과 길이를 보유합니다. | `6f35dfa80` | `abeee05ce` | `liveWholeNestedFillExit.test.ts` |
| 이탈 부모 아래 이미 비활성인 자리입니다. | 코드 수정 | 명시한 보유 값을 최초 원본으로 되감지 않습니다. | `2c8669655` | `ac70e2567` | `liveWholeInactiveSlotExit.test.ts` |
| 같은 경로의 다른 후보입니다. | 코드 수정 | 재활성 기록의 정책 뒤 권리는 해당 후보 바인딩에만 귀속됩니다. | `35e06e37a` | `25a4c2d00` | `revivedCandidateOwnership.test.ts` |
| 동등한 unset과 경계 복구입니다. | 코드 수정 | 값이 같아도 채택된 지명 결정을 기록하고 예산 오류에는 쓰기 경계 원본을 복구합니다. | `cdde0c2da` | `4a85462f7` | `equalNamedSourceExit.test.ts`, `retainedSourcesBudget.test.ts` |
| 다시 자란 배열 자리의 후보입니다. | 코드 수정 | 잘린 옛 후보가 새 세대의 자리에 남지 않습니다. | `62e88d62d` | `d7e6c2109` | `retainedArrayGeneration.test.ts` |
| 재활성 권리 뒤 비활성 키 쓰기입니다. | 코드 수정 | 뒤 쓰기가 덮은 부분의 앞 권리를 제거하여 최신 결정을 보유합니다. | `c9d490dc4` | `d7e6c2109` | `revivedInactiveSlotDecision.test.ts` |

#666의 변경분 검토는 768행 중 좁은 구간 레이블 96행만 의도대로 달라짐을 확인했습니다. #667은 입력표 456개 관측과 독립 검토의 416개 입력을 통과했습니다. 독립 검토 입력 중 354개는 수정 전 `0bc5cb07b`에서 실패했습니다. 다섯 결함 주입은 모두 커밋된 검증에서 실패했고 여섯 수정의 직전과 직후도 실패 후 통과를 확인했습니다. 앞 다섯 수정은 최종 코드에서 역패치가 충돌하여 각 수정 시점의 소스로 확인했으므로 최종 코드의 독립 제거 검증과 구별합니다.

## 속도

소유자는 정확성에 필요한 호출당 몇 마이크로초의 잔여 비용을 수용하며 속도를 위해 위험한 재작성을 하지 않기로 했습니다.

비율은 수정 후 시간을 수정 전 시간으로 나눈 값입니다. 절대 비용은 호출당 증가분이며 서로 다른 기준의 행을 합산하지 않습니다. 아래는 풀 리퀘스트의 최종 유효 판정과 독립 재측정의 범위입니다. 절대 증가분을 보고하지 않은 정상 행에는 수치를 만들지 않습니다.

### 유틸리티 묶음

#### 빠진 작업을 채운 행

| 경로 | 비율 | 절대 비용 | 빈도와 이유 |
|---|---|---|---|
| handler update입니다. | 약 1.07입니다. | 약 +10 ns입니다. | update마다 다른 호출의 알림을 즉시 게시합니다. |
| hook이 있는 handler 생성입니다. | 약 2.13입니다. | 약 +1.8 µs입니다. | handler당 한 번이며 호출별 소유권 구성을 생성 시점에 둡니다. 저장소 제품 코드에는 hook을 가진 생성 호출이 없습니다. |

#### 기존 경로가 느려진 행

| 경로 | 비율 | 절대 비용 | 빈도와 이유 |
|---|---|---|---|
| 그림자 루트에 스타일 추가입니다. | 세 계열에서 1.01에서 1.07입니다. | 추가당 최대 +47 ns입니다. | 식별자 추가마다 조각 경계를 독립적으로 닫습니다. |
| 동기 hook이 있는 동시 실행 방지 호출입니다. | 약 1.04입니다. | 호출당 약 +3 ns입니다. | 호출별 알림 소유권을 확인합니다. |
| 나머지 측정 경로입니다. | 모두 1.03 이내입니다. 평평한 CSS 압축은 0.99입니다. | 별도 증가분을 확정하지 않았습니다. | 깊은 객체, 포인터 변환과 방언 인식의 일반 호출입니다. |

react-utils의 문서화된 ESM 한계와 가이드 수정은 실행 코드를 늘리지 않습니다. 자산 및 스타일의 첫 내부 검증 후속은 각각 명령줄 면제와 문서 수정 면제입니다.

### promise-modal과 공개 선언 보완

#### 빠진 작업을 채운 행

| 경로 | 비율 | 절대 비용 | 빈도와 이유 |
|---|---|---|---|
| 중단 콘텐츠의 표시와 정착입니다. | 유효 행의 최댓값은 1.011입니다. | 별도 증가분을 확정하지 않았습니다. | 표시 판정과 요청 정착 때 페이지 참여 판정을 공유합니다. |

#### 기존 경로가 느려진 행

| 경로 | 비율 | 절대 비용 | 빈도와 이유 |
|---|---|---|---|
| 모달 일반 경로의 11개 측정 행입니다. | 모두 1.03 이내이며 앞 라운드 재연결 행은 0.98입니다. | 별도 증가분을 확정하지 않았습니다. | 마운트와 정착마다 실행합니다. |

agents-assets-sync는 사람이 실행하는 명령줄 도구라 측정 면제입니다. 공개 React 선언 보완은 타입 주석만 바꾸며 두 패키지의 방출된 JavaScript가 바이트 단위로 같다는 검증을 근거로 면제합니다.

### schema-form 본 수정과 후속 수정

#### 빠진 작업을 채운 행

| 경로 | 비율 | 절대 비용 | 빈도와 이유 |
|---|---|---|---|
| 본 수정의 가상 getter 세 개입니다. | 1.90에서 2.10입니다. | 세 getter 합계 약 +0.06 µs입니다. | 읽을 때마다 undefined 대신 구성원의 투영을 만듭니다. |
| 후속 context의 cause 비교입니다. | 약 2.2입니다. | 약 +0.35 µs입니다. | 해당 context 쌍을 비교할 때 빠져 있던 슬롯을 비교합니다. |

#667의 기준은 `0bc5cb07b`이며, 아래 행은 보유 원본 장치의 정확성에 필요한 경로를 비교합니다. 최종 구조 정리의 비용은 별도 대조입니다.

| 경로 | 비율 | 절대 비용 | 빈도와 이유 |
|---|---|---|---|
| #667의 서로 겹치지 않는 파생 규칙 두 개입니다. | 1.009에서 1.012입니다. | 약 +0.10 µs입니다. | 해당 규칙 라운드마다 주소별 원본 결정을 기록합니다. |
| #667의 겹친 파생 규칙과 가상 쓰기입니다. | 각각 약 0.99입니다. | 겹침은 최소값 +0.065 µs, 가상 쓰기는 최소값 -0.072 µs입니다. | 대조 보정 비율이며 앞 수정의 비용과 합산하지 않습니다. |
| #667의 가상 파생 쓰기입니다. | 1.019에서 1.021입니다. | 약 +0.28 µs입니다. | 해당 규칙 경로의 주소별 결정을 적용합니다. |
| #667의 `overlap-array-32-4`입니다. | 최소값 1.0358, 10백분위수 1.0339입니다. | 최소값 107.618에서 110.522 µs로 +2.904 µs, 10백분위수 107.947에서 110.696 µs로 +2.749 µs입니다. | 해당 배열 겹침 호출의 비용입니다. 함수별 원인 프로파일은 없으며 호출당 몇 마이크로초의 정확성 비용 수용 범위로 판정했습니다. |

#### 기존 경로가 느려진 행

| 경로 | 비율 | 절대 비용 | 빈도와 이유 |
|---|---|---|---|
| 본 수정의 가상 그룹 쓰기입니다. | 약 1.03입니다. | 약 +0.13 µs입니다. | 쓰기마다 되전달 비교와 호출 진입 시점의 분류를 합니다. |
| 후속의 겹친 파생 규칙 두 개입니다. | 약 1.21입니다. | +2.8에서 +3.3 µs입니다. | 겹친 승자를 적용하는 라운드마다 순위와 앞 계산 뒤 값을 지킵니다. |
| 앞선 쓰기 여덟 개 뒤의 하위 초기화입니다. | 1.10에서 1.12입니다. | +2.2에서 +3.7 µs입니다. | 미결 표시가 있는 초기화마다 장벽 정착을 합니다. 초기화만 있는 배치는 이 비용을 내지 않습니다. |
| 두 쓰기 배치의 같은 가상 튜플 쓰기입니다. | 1.05에서 1.09입니다. | 약 +0.5 µs입니다. | 가상 쓰기마다 앞 표시를 구성원 타입으로 읽습니다. |
| 서로 겹치지 않는 파생 규칙 두 개입니다. | 약 1.03입니다. | 약 +0.3 µs입니다. | 승자가 둘 이상인 라운드마다 순위와 겹침을 판정합니다. |
| Error 두 개의 context 비교입니다. | 약 1.06입니다. | 약 +0.03 µs입니다. | 비교마다 숨은 슬롯의 존재를 구별합니다. |
| 선언 규칙 없는 2개, 8개, 32개 쓰기 배치입니다. | 모두 1.03 이내입니다. | 별도 증가분을 확정하지 않았습니다. | 해당 배치마다 실행하며 선언 규칙을 위한 정착을 추가하지 않습니다. |
| 본 수정의 나머지 행입니다. | 모두 1.03 이내입니다. | 별도 증가분을 확정하지 않았습니다. | 구조 배치의 다른 최적화 단계는 같은 단계로 맞추면 1.01입니다. |
| #667의 규칙과 게이트 없는 일반 쓰기 열 행입니다. | 모두 1.0095 이하이며 대부분 1에서 3퍼센트 빠릅니다. | 별도 증가분을 합산하지 않습니다. | 스칼라, 같은 값, 키 2개와 50개의 전체 쓰기 및 Merge, 쓰기 2개와 8개 및 32개의 배치, 중첩 배치입니다. |

#667은 별도 프로세스 쌍을 60회 교대로 실행하여 최소값과 10백분위수를 대조 쌍으로 보정했습니다. 유효한 대조는 0.98에서 1.02 안이며 중첩 배치의 첫 무효 계열은 제외하고 다시 측정했습니다.

일반 경로의 새 보유 원본 할당은 생성 지점 계측으로 확인했습니다. 각 일반 행을 한 번과 2,000번 호출했을 때 새 Map과 엔트리가 모두 0개였고, 규칙 경로의 양성 대조는 Map 1개와 엔트리 2개였습니다. 수거된 객체까지 포함한 512바이트 간격의 독립 할당 표집과 실제 호출 경로 확인을 함께 사용했습니다. 표집 0바이트만으로 제품 전체의 무할당을 증명하지 않습니다. 동적 경로는 1,500회 실행 중 250회마다 가비지 수집 뒤 잔류 힙을 읽었으므로 순간 최대 할당량과 구별합니다. 증가한 두 배열 행은 별도 프로세스에서 세 번씩 재확인했으며 예열 직후보다 높은 잔류 힙을 관측하지 않았습니다.

최종 구조 정리 `1932bb74f`는 직전 `d7e6c2109`에 대해 일반 세 행을 다시 측정했습니다. 스칼라는 1.0195와 1.0194, 얕은 전체 쓰기는 0.9979와 0.9991, 쓰기 여덟 개 배치는 1.0060과 1.0055였습니다. 모두 유효한 대조이며 최댓값 1.0195는 검토에서 허용 측정 변동으로 판정했습니다. 일반 경로의 작업량 증가를 입증하지 않았고 통계적으로 실제 변화가 없음을 증명한 것도 아닙니다. 세 행 각각 2,000회에서 원본 함수의 할당 표집은 전후 모두 0바이트였으며 호출 경로도 유지됐습니다.

겹침 비용의 최적화 후보 둘은 기록만 남기고 적용하지 않았습니다. 첫 후보는 가상 대상이 없고 승자가 여덟 개 이하이면 주소 배열과 정렬 대신 경로 쌍을 비교하고, 그 밖에는 깊이 우선 정렬을 유지합니다. 둘째 후보는 첫 후보에 더해 실제로 겹치는 경우에만 승자를 비교 정렬합니다. 같은 기준에서 둘째 후보의 겹침 행은 1.150과 1.154였으나 어느 후보도 전체 검증을 거치지 않았습니다. 둘째는 승자 반환 순서의 문서와 진입점 참조도 바꿔야 하므로 안전한 완료 수정으로 취급하지 않습니다.

### 일곱 플러그인과 후속 수정

#### 빠진 작업을 채운 행

| 경로 | 비율 | 절대 비용 | 빈도와 이유 |
|---|---|---|---|
| 사용자 인터페이스 이름, 레이블과 슬라이더입니다. | 측정 면제입니다. | 수치를 만들지 않습니다. | 속성과 사용자 이벤트 경로이며 렌더마다 늘어나는 순회가 있는지 검토합니다. |
| 공개 결과 선언입니다. | 측정 면제입니다. | 실행 비용이 없습니다. | ReactElement 타입 선언만 바꿉니다. |

#### 기존 경로가 느려진 행

| 경로 | 비율 | 절대 비용 | 빈도와 이유 |
|---|---|---|---|
| AJV 6 팩터리 컴파일의 캐시 및 새 내용입니다. | 1.16에서 1.19입니다. | +5.2에서 +5.4 µs입니다. | 루트 컴파일마다 분리 사본과 수명 등록을 준비합니다. |
| AJV 6 일반 컴파일의 캐시 및 새 내용입니다. | 1.03에서 1.07입니다. | +0.1에서 +2.3 µs입니다. | 컴파일마다 원본을 쓰지 않는 준비를 합니다. |
| AJV 6 로컬 참조의 새 내용입니다. | 1.09에서 1.13입니다. | +3.9에서 +6.3 µs입니다. | 새 내용의 참조 사실과 사본을 준비합니다. |
| AJV 7 팩터리의 새 내용입니다. | 1.05에서 1.06입니다. | +3.7에서 +8.3 µs입니다. | 새 루트의 현재 정의와 사본을 준비합니다. |
| AJV 8 호출별 팩터리의 새 내용입니다. | 약 1.09입니다. | 약 +13.0 µs입니다. | 팩터리를 매 호출 만들 때 사본 준비를 함께 냅니다. |
| AJV 후속의 컴파일 24개 행입니다. | 모두 1.047 이하입니다. | 모두 +3 µs 미만입니다. | 컴파일마다 로컬 참조 목적지와 매크로 정의를 관찰합니다. |
| 나머지 주요 컴파일 행입니다. | 대부분 0.42에서 0.81입니다. AJV 6 비동기 키워드는 약 0.50입니다. | 증가 예외가 아닙니다. | 캐시된 사실과 원시 JSON 스냅샷을 재사용합니다. |

분리 스냅샷과 수명 등록은 약 3 µs, 로컬 참조 사실은 약 3.3 µs, 현재 프로필 검사는 약 0.8에서 1.2 µs와 사적 메타 검증을 요구합니다. 대안 두 개도 잔여 비용을 없애지 못하여 읽기 전용 계약의 비용으로 수용했습니다. 후속 AJV 6 로컬 참조는 최소값과 10백분위수에서 각각 1.047과 1.021, +0.95와 +0.68 µs이며 AJV 8 새 로컬 참조는 각각 1.041과 1.028, +2.93과 +1.57 µs입니다.

### 측정 방법의 한계

최적화 이벤트가 표본에 있는 회차는 버린 수와 전체 회차 비율을 함께 공개하며 절반 넘게 버리면 전체 회차로 판정합니다. 코드 생성 행은 캐시와 새 내용 각각 24회 및 양쪽 이벤트를 보고, 최적화 단계 불일치는 해당 단계를 끈 실행으로 진단합니다. 변동이 큰 행은 세 계열의 범위로 기록합니다. 측정은 모든 작업자가 쓸 수 있는 잠금 디렉터리로 한 계열씩 직렬화하고 점유를 40분으로 제한하며 부하 평균을 남깁니다.

후속 schema-form과 AJV의 마지막 계열은 부하가 있는 기계에서 측정했습니다. 최소 60회의 짧은 교대 회차에서 최소값, 10백분위수와 회차별 짝 비율을 구하고, 각각 0.98에서 1.02 안인 대조 쌍의 같은 통계량으로 보정합니다. 조용한 값이 알려진 두 행의 재현으로 방법을 확인했습니다. 이 기록은 수집 종료 뒤 코어 벤치마크에서 재확인하며, 개별 프로세스의 초기 진단값이나 대조 범위를 벗어난 계열을 출시 수치로 사용하지 않습니다.

## 스펙표

이 표는 이후 라운드가 유지해야 할 행동을 정합니다. 알려진 한계의 조건을 제거하여 더 강한 보장으로 읽지 않습니다.

| 입력 또는 상태 | 유지할 결과 |
|---|---|
| 호출별 handler 알림입니다. | 동시 실행 허용은 입장만 정하며 자신의 hook 안 갱신만 그 hook 알림에 합칩니다. 다른 호출의 갱신은 즉시 게시합니다. |
| 깊은 그래프와 null 프로토타입입니다. | 복제와 비교는 깊이로 스택을 넘지 않으며 정렬, 병합과 패치는 그릇의 프로토타입을 지킵니다. |
| CSS 식별자 조각입니다. | 미완성 조각이 다음 조각을 삼키지 않고 압축은 유효한 문법과 의미 있는 공백을 유지합니다. |
| 빈 포인터 토큰과 기본 포트 방언입니다. | 빈 토큰을 잃지 않고 기본 포트 표기는 같은 방언으로 읽습니다. |
| 중단된 모달입니다. | 페이지를 비활성화하는 표시 상태이면 초점 복귀도 같은 표시 상태로 판단합니다. 숨김과 외부 초점의 기존 규칙은 유지합니다. |
| 자산의 실패 참여자와 모호한 마커입니다. | 소유권을 확정하지 못한 파일은 삭제하지 않으며 마커가 완전하지 않으면 이유와 위치를 출력하고 바이트를 보존합니다. |
| 자산의 출력과 파일 정체성입니다. | 모든 출력이 같은 결과를 표현하고 JSON은 종료 코드마다 문서 하나이며 링크, 소유자, 그룹과 모드는 재현 가능한 방식으로 보존합니다. |
| 가상 그룹의 값과 기본값입니다. | 선언한 구성원마다 자리가 있고 비활성이나 부재는 undefined로 남으며 뒤 자리가 이동하지 않습니다. defaultValue도 구성원 기본값의 튜플이며 isDivergent와 inactiveValues도 구성원 투영입니다. |
| 가상 그룹 쓰기와 초기화입니다. | 호출 진입 시 활성 자리에만 undefined 지우기를 적용하고 비활성 보유 값은 자신의 경로에서 지웁니다. 살아 있는 그룹 초기화는 실제 구성원 주소의 비활성 자손에도 닿으며 분리된 참조는 아무것도 하지 않습니다. |
| 배치의 호출자 층입니다. | 각 호출이 앞 호출의 결과를 작성 순서대로 타입 해석하여 updater, Merge와 같은 튜플 비교의 입력으로 읽습니다. 중간 반응을 실행하지 않습니다. |
| 배치의 반응 층입니다. | 구간의 최종 호출자 상태에 한 번 정착합니다. 파생 규칙의 후속 라운드와 예산은 유지하며 모든 규칙이 정착 전체에서 딱 한 번이라는 뜻이 아닙니다. |
| 배치의 경계와 관측입니다. | 배열 구조 동사와 하위 초기화는 구간을 끝냅니다. 바깥 배치의 외부 배달, 변경 알림과 검증 요청은 하나로 모으며 내부 정착 횟수와 구별합니다. |
| 초기화 장벽과 거절입니다. | 범위 안 표시를 초기화 대상으로 다루고 나머지 앞선 표시도 먼저 정착합니다. 장벽이 대상을 떼어내면 초기화를 거절하며 후속 표시가 실제로 덮지 않은 범위 안 호출자 표시를 남깁니다. |
| 선언적 쓰기의 적용 시점입니다. | 활성 주소에는 쓰고, 이미 이탈 중인 주소는 나감 정책 뒤 기록하며, 같은 정착에서 재활성화되면 그 노드에 기록을 적용합니다. 다른 비활성 주소에서는 선언적 값이 호출자 값을 이깁니다. |
| 지명 방식과 순위입니다. | 부모 객체, 자신의 경로, 조상 아래 경로와 가상 그룹으로 도달하는 주소는 같은 배치 원칙을 쓰며 겹친 승자와 이탈 기록은 전체 순위를 지킵니다. 생략은 지명이 아닙니다. |
| 살아 있는 부모에 값을 명시한 뒤 같은 정착에서 이탈합니다. | 부모 객체, 자신의 경로와 가상 그룹 및 Merge, 배치와 중첩 배치에 같은 주소 결정을 적용합니다. 일반 정책은 명시값을 보유하고 unset과 resolver는 기존 자격에 따라 적용합니다. |
| 먼저 키나 그릇을 생략하고 뒤 규칙이 자손을 지명하며 닫습니다. | 뒤 지명한 값이 남고 조상 기준 복구가 덮지 않습니다. 반대로 뒤 생략이 이기면 해당 활성 주소는 쓰기 경계 원본에 나감 정책을 적용합니다. |
| 배열 길이 1에서 0으로 줄인 뒤 새 자리를 지명하며 닫습니다. | 새 자리가 아직 생성되지 않아도 지명한 값과 길이를 보유하며 잘린 후보를 새 세대에 재사용하지 않습니다. |
| 이미 비활성인 자리를 지명한 뒤 부모가 이탈합니다. | 명시한 보유 값을 최초 원본으로 되감지 않습니다. 생략한 비활성 형제의 보유 값은 유지합니다. |
| 이탈 기록 적용으로 재활성화한 뒤 다시 이탈합니다. | 기록이 지명한 값의 정책 뒤 자격을 같은 후보 수명에서 유지하되 뒤 live 쓰기가 덮은 부분은 그 자격을 잃습니다. 이후 비활성 키 쓰기도 최신 결정을 따릅니다. |
| 낮은 키 쓰기 뒤 높은 전체 쓰기가 이탈 주소에 적용됩니다. | `y='low'` 뒤 `{ z: 'hz' }`이면 최종 보유 값은 `{ z: 'hz' }`입니다. |
| 낮은 전체 쓰기 뒤 높은 키 쓰기가 이탈 주소에 적용됩니다. | `{ z: 'hz' }` 뒤 `y='low'`이면 최종 보유 값은 `{ z: 'hz', y: 'low' }`입니다. |
| AJV 애플리케이션 인스턴스입니다. | 플러그인은 원본에 등록, 쓰기나 제거를 하지 않습니다. 분리 사본이 현재 스키마와 정의를 읽고 원본 컴파일 사실을 보존합니다. |
| AJV가 컴파일할 수 있는 위치입니다. | 로컬 참조 목적지와 매크로 전개를 포함하여 의존성, 비동기 상태와 키워드 교체를 기록합니다. 이전 검증 함수는 자기 스냅샷을 유지합니다. |
| 네 슬라이더의 이동입니다. | 배타 경계와 십진 격자를 지키며 제공자의 방향, 좁은 포함 상한, 읽기 전용 유효 소수를 유지합니다. antd의 기본 lazy는 이동 키 해제로 확정합니다. |
| MUI 레이블입니다. | for는 사용자가 조작하는 요소를 가리키고 선택기 클릭을 전달하며 비활성화된 컨트롤을 초점 대상으로 삼지 않습니다. |
| 공개 React 결과입니다. | JSX runtime의 JSX.Element가 아니라 ReactElement를 사용합니다. |

## 호환성이 깨지는 변경과 뒤집은 테스트

### 소비자에게 보이는 변경

| 변경 | 이행과 변경 기록 |
|---|---|
| antd-mobile의 피어 범위가 ^5.2.0부터 시작합니다. | 빈 Stepper를 지원하지 않는 5.0과 5.1을 먼저 올립니다. `.changeset/mobile-empty-stepper-peer-floor.md`가 major로 기록합니다. |
| 애플리케이션 AJV의 getSchema가 폼만 컴파일한 루트를 반환하지 않습니다. | 네이티브 조회가 필요하면 애플리케이션 소유 스키마를 등록하고 폼은 그 주소를 참조합니다. `.changeset/ajv6-private-form-ownership.md`, `.changeset/ajv7-private-form-ownership.md`, `.changeset/ajv8-private-form-ownership.md`가 major로 기록합니다. |
| 배치의 하위 초기화가 완전한 장벽입니다. | 앞선 범위 밖 쓰기의 반응이 초기화 뒤 값을 덮는 순서에 의존하지 않습니다. `.changeset/schema-form-batch-reset-barrier.md`는 patch이나 관측 순서는 바뀝니다. |
| 가상 그룹의 defaultValue가 튜플입니다. | undefined를 전제로 한 소비자는 구성원 기본값의 투영을 사용합니다. `.changeset/schema-form-virtual-tuple-storage.md`가 기록합니다. |
| 자산의 모호한 마커 거절과 원본 정규화입니다. | 자동 복구 성공을 기대하지 말고 마커를 먼저 정리합니다. 바이트 순서 표시를 관리 블록 내부에 보존하는 단언은 유지하지 않습니다. |

### 앞선 단언의 변경

| 검증 | 바꾼 기대와 근거 |
|---|---|
| 자산의 `src/__tests__/roundFour/byteOrderMark.test.tsx:75` 세 출력 행입니다. | 원시 source 포함에서 선두 표시 제거와 CRLF 정규화 후 본문 포함으로 바꿨습니다. 검사한 바이트와 쓴 바이트를 일치시키는 승인 변경입니다. |
| 자산의 루트 `src/__tests__/json.test.ts:188`입니다. | 빈 stdout 대신 exitCode 2와 빈 units를 가진 JSON 문서를 기대합니다. 종료 코드와 오류 출력 검증은 유지합니다. |
| schema-form의 `src/core/engine/settle/__tests__/settle.detached-default-capture.test.ts:179`입니다. | 가상 defaultValue의 undefined를 ['a','b']로 바꿨습니다. 구성원 투영의 공개 변경입니다. |
| schema-form의 `src/__tests__/__snapshots__/publicSurface.test.ts.snap`과 #660의 공개 선언 보완입니다. | Form.Label, Form.ErrorMessage와 FormProvider의 Element를 ReactElement로 바꿨습니다. 공개 선언 보완도 같은 결과 타입을 유지합니다. 이 스냅샷 변화 자체는 코어 수정에 속합니다. |
| antd-mobile의 `src/__tests__/fieldIdentifiers.review.round-three.test.tsx:55`입니다. | 제목 개수를 전체 문서가 아닌 접근성 트리에서 셉니다. |
| antd-mobile의 `src/__tests__/fieldIdentifiers.table.round-three.test.tsx:174`입니다. | 접근성 이름을 Field one two로 기대합니다. |
| MUI의 `src/__tests__/fieldIdentifiers.review.round-three.test.tsx:55-59`입니다. | 숨은 제목을 제외하여 접근성 트리에 노출된 제목을 셉니다. 조정자가 승인했으며 소유자가 뒤집을 수 있습니다. |
| MUI의 `src/__tests__/fieldIdentifiers.table.round-three.test.tsx:425`입니다. | 선택기는 inputProps.inputId와 실제 조작 요소의 control.id를 비교합니다. 숨은 input을 대상으로 고정하지 않습니다. |
| 세 AJV의 애플리케이션 인스턴스 감시 단언입니다. | addSchema, removeSchema, getSchema와 compile 호출로 폼 소유권을 입증하던 기대를 원본에 대한 쓰기 없음과 분리 사본의 동작으로 바꿨습니다. 원본의 등록 수를 고정한 진단 탐침도 같은 이유로 달라집니다. |
| schema-form의 `src/core/engine/write/__tests__/dispatch.relay-cleanup.test.ts`입니다. | 초기화 뒤까지 표시가 남는 기대를 장벽에서 정착한 기대로 바꿨습니다. |

스타일의 앞 라운드 어휘 검증은 오래된 dist 대신 현재 소스를 읽도록 바꿨고 기대는 유지했습니다. json-schema의 선언 및 벤치마크 검증 이관도 실행기 변경이며 단언의 의미는 유지합니다. schema-form의 행 검증 fixture에 선언 fields와 childrenByName을 공급한 것은 기존 기대 변경이 아닙니다.

## 결정과 근거

### 앞 라운드와 맞닿은 항목

높은 심각도의 AJV 6 1번은 애플리케이션이 compile한 환경을 등록 목록만으로 소유권 판정한 회귀입니다. 같은 등록 및 해제 계열의 AJV 6 4번, 5번, 6번도 앞 수정의 회귀입니다. MUI 4번은 내부 legend가 코어 식별자를 다시 쓴 회귀이며 common-utils 1번은 알림 소유권을 실행 방지 상태와 합친 회귀입니다. style-utils 1번, promise-modal 1번과 자산 2번부터 5번까지도 앞 수정이 만든 이웃 회귀입니다. 원래 보관 탐침은 이 입력을 포함하지 않았습니다. 결과표의 새 모델과 이웃 입력이 그 공백을 채웁니다.

다른 realm의 Error 속성과 모바일의 격자 밖 키 이동은 앞 수정 이전에도 올바르지 않았으므로 새로 연 입력입니다. 자산의 재개 주석과 스타일의 주석 분리 전역 선택자는 첫 내부 검증에서 기준과 같음을 확인했습니다. 문서 계약과 반대인 원래 탐침 기대를 다시 구현할 근거로 삼지 않습니다.

### 유틸리티와 모달 및 자산

| 결정 | 계약과 이유 | 이웃 입력 및 비용 연결 |
|---|---|---|
| handler의 알림 소유권은 호출마다 하나로 관리합니다. | preventConcurrent는 입장만 결정해야 합니다. 겹치지 않는 호출열은 두 옵션에서 같은 알림열을 냅니다. | 끝난 호출의 manager, 비동기 hook과 동기 hook을 비교하며 비용은 유틸리티 속도표에 둡니다. |
| 깊은 그래프는 명시적 작업 목록으로 처리합니다. | 깊이와 순환을 지원한다는 공개 약속을 스택 한도에 맡길 수 없습니다. | 별칭, 빈 자리와 속성 기술자도 보존하며 일반 경로의 비용은 속도표를 따릅니다. |
| CSS 조각은 독립적으로 끝나고 압축은 토큰 의미를 유지합니다. | CSS Syntax Level 3에 따라 주석은 토큰을 만들지 않지만 공백은 문맥에 따라 의미를 갖습니다. | 선택자, 속성 선택자, 빈 사용자 값과 선언 질의를 같은 참조 판독기로 검증합니다. |
| 내장 하위 클래스의 자기 속성은 한계로 밝힙니다. | 기존 내장 상태 복제의 지원 범위를 임의로 넓히지 않습니다. | 메서드와 프로토타입 보존을 추가 필드 복사의 보장으로 읽지 않습니다. |
| React ESM의 하한을 문서화합니다. | 허용된 이전 React가 확장자 없는 JSX runtime을 제공하지 않습니다. | 공통 빌드에 위험한 호환 다리를 넣는 대안은 적용하지 않았습니다. |
| 모달의 표시 판정을 공유합니다. | 페이지가 inert이면 해당 표시 요청의 정착이 초점 복귀를 소유해야 합니다. | 콘텐츠의 첫 중단과 재중단, 숨김, 외부 초점과 요청 정착을 같은 표로 검증합니다. |
| 자산은 완전한 소유권 정보로만 삭제합니다. | 실패 참여자가 가진 파일을 성공 참여자의 고아로 오인하지 않습니다. | 알려진 접두 범위만 보호하고 거절된 작업은 실행하지 않는 진단으로 남깁니다. |
| 자산의 판독과 쓰기는 한 스냅샷을 씁니다. | 검사 뒤 바뀐 파일이나 다른 출력 대상이 검사하지 않은 바이트를 쓰면 안 됩니다. | 모든 종류의 원본과 권한을 한 번 읽고 비교는 작성기의 정확한 역으로 둡니다. |
| 주석 재개 범위는 거절합니다. | CommonMark와 HTML 판독이 다른 범위에서 END를 추측하면 사용자 문장을 덮을 수 있습니다. | 마커 없는 문장은 수용하고 모호한 마커나 울타리만 위치와 이유를 밝혀 거절합니다. |
| 파일 정체성과 결과를 공통으로 보존합니다. | 재현할 수 없는 링크 및 메타데이터는 원자 교체 대신 제자리 쓰기가 맞습니다. 출력 모드는 실행 의미를 바꾸지 않습니다. | 세 출력이 같은 경로, 원인과 종료 결과를 표현하며 명령줄 면제 범위를 지킵니다. |

### schema-form

| 결정 | 표준 또는 계약과 이유 | 배제한 대안과 이웃 경로 |
|---|---|---|
| 가상 그룹은 주소 기반 튜플입니다. | 저장 공간이 없는 그룹도 선언 순서와 구성원 기본값을 잃으면 안 됩니다. children 순서를 튜플 순서로 쓰지 않습니다. | 비활성 앞자리를 삭제하는 대안은 뒤 값을 다른 필드에 씁니다. 기본값, 보유 값, 초기화와 배치에 같은 주소 규칙을 씁니다. |
| 배치는 두 층으로 정의합니다. | React의 batched updates, MobX의 transactions와 signal batches처럼 호출자 쓰기는 작성 순서로 보이고 반응은 구간의 최종 상태에 모입니다. | 배치 안 매 호출 뒤에 반응을 정착하는 대안은 원자적 반응 계약을 깨므로 거절합니다. 배열 구조 동사와 하위 초기화는 구간을 끝냅니다. |
| 선언적 값은 적용 시점의 주소 상태로 배치합니다. | 대상 선택 때 살아 있었다는 정보만으로 뒤 승자의 값을 쓰면 중간 계산으로 이탈한 대상에서 값이 사라집니다. | 살아 있는 노드가 없는 직접 선언적 대상은 placeDeclarativeValue로 모으고, 부모 분배와 이미 비활성인 자리도 주소별 보유 결정에 참여합니다. |
| 생략은 지명이 아닙니다. | 이탈 조상 위의 전체 쓰기가 그 자식을 생략한 것은 이탈 주소 내부의 호출자 값 지명이 아닙니다. | 나감 정책보다 더 넓은 호출자 우선권을 약속하던 문장만 바로잡았습니다. 동작 변경은 없으며 소유자가 이 결정을 바꿀 수 있습니다. |
| 거절 초기화는 표시를 보존합니다. | 자기 장벽이 대상을 떼어냈다고 앞 호출의 값을 소실시키면 호출자 투명성을 깨뜨립니다. | 뒤 Merge가 지명한 키만 앞 표시에서 덜어내며 가상 한 구성원도 저장 자리로 해석합니다. |
| 겹친 승자와 이탈 기록은 전체 순위를 지킵니다. | 높은 값이 시작 값과 같더라도 낮은 쓰기 뒤에는 다시 써야 합니다. | 최초 snapshot으로 일괄 무변경 판정하거나 기록을 깊이순으로 재정렬하지 않습니다. 비용과 미적용 후보는 속도 절에 둡니다. |
| 공개 선언은 ReactElement를 사용합니다. | 피어 범위의 이른 타입은 JSX runtime의 JSX 네임스페이스를 내보내지 않습니다. | 코어만 고쳐 완료로 보지 않고 모달, 포털 및 네 플러그인도 추적합니다. |

### 보유 원본과 독립 검증

보유 원본은 쓰기 적용 시점에 주소별로 결정하고 이탈할 때 그 결정을 읽습니다. 주소는 수명과 후보 바인딩을 포함하므로 같은 경로 문자열만으로 합치지 않습니다. 기준 원본은 직전 커밋에 이번 호출자 표시를 원래 교체 범위와 정적 형으로 적용한 쓰기 경계의 값입니다. 채움과 활성 자손의 생략은 이 기준을 보유 후보로 삼고, 실제로 지명한 쓰기는 해석된 명시 원본을 후보로 삼습니다. 이미 비활성인 생략은 보유 값을 유지하며 배열 길이와 미생성 자리도 독립적으로 결정합니다. 같은 값이어도 지명 효과는 별도로 기록합니다.

이 결정은 방문한 발생, 자동 쓰기 여부와 로그 복구 범위에서 나중에 원본 소유자를 추론하던 공통 원인을 없앱니다. 정착 안에서 필요한 때만 주소 트리를 만들며 규칙과 게이트 없는 일반 쓰기는 새 할당 경로에 들어가지 않습니다. 이탈의 원본 철회와 automaticLog, arrayStructureLog 및 slotAutomaticLog를 제거했습니다. 예산 오류의 쓰기 경계 복구는 유지하며 정상 이탈의 복구와 구별합니다.

| 배제한 대안 | 이유 |
|---|---|
| 입력마다 채움 표지를 해제하고 복구 범위만 좁힙니다. | 아직 생성되지 않은 배열 자리에는 붙일 발생이 없고 이미 비활성인 자리의 명시값도 해결하지 못합니다. 자동 분배를 모두 명시로 취급하면 기본값과 구조 이동을 잘못 분류합니다. |
| 기존 역재생 로그를 채널과 바인딩별로 완성합니다. | 겹친 전체 쓰기, 복구한 배열 자손과 재활성화 뒤 다른 수명을 조정하려면 또 하나의 입력 해석기가 필요합니다. 이탈마다 전체 자동 변경 이력을 읽는 대신 쓰기 시점의 주소별 결정을 유지합니다. |

소유자는 한 정착에서 쓰기를 낮은 우선순위부터 높은 우선순위로 적용하는 규칙이 이탈 필드에도 같고, 객체 전체 쓰기는 객체를 교체하여 지명하지 않은 키를 제거한다는 동작을 확인했습니다. 아래 두 행은 적용 순서에 따른 차이를 고정합니다.

| 적용 순서 | 최종 보유 값 |
|---|---|
| 낮은 키 쓰기 `y='low'` 뒤 높은 전체 쓰기 `{ z: 'hz' }`입니다. | `{ z: 'hz' }`만 남습니다. |
| 낮은 전체 쓰기 `{ z: 'hz' }` 뒤 높은 키 쓰기 `y='low'`입니다. | `{ z: 'hz', y: 'low' }`가 남습니다. |

외부 독자는 결과표를 보기 전에 두 행을 모두 예측했습니다. 문서의 두 모호점은 우선순위가 높다는 말만으로 적용 순서를 알 수 없다는 점과 전체 쓰기가 병합인지 교체인지 알 수 없다는 점이었습니다. WRITE-079는 낮은 순위부터 높은 순위라는 적용 순서와 전체 교체가 생략한 키를 제거한다는 뜻을 명시합니다. 같은 라운드의 겹친 승자 순위를 나중 라운드의 승인된 쓰기까지 영구히 무효화하는 순위로 읽지 않습니다.

참조 모델은 제품의 쓰기, 분배나 로그 함수를 사용하지 않는 독립 사건 모델입니다. 초기 원본과 name, fill, resize 및 close 사건에서 절대 기대값을 계산하고 각 경로를 모델에 직접 비교합니다. 세 제품 경로끼리 비교하면 세 경로가 같은 방식으로 틀려도 통과했던 공백을 막기 위한 선택입니다. 제한된 프로필은 예약한 고차 조합 51개 종류의 도달을 확인하며 한 종류의 생성을 제거한 변형도 실패했습니다. 생성하지 않는 차원은 알려진 한계에 둡니다.

독립 검토의 테스트 파일은 라운드 종료 전에 저장소의 회귀 테스트로 보존합니다. 기대값은 문서 문장 또는 같은 입력의 동등한 형태에서만 도출하며 제품을 실행한 출력을 기대값으로 삼지 않습니다. #665는 이 원칙으로 파일 54개와 등록 사례 232건을 보존했습니다. 실패하거나 기대 근거가 부족한 12개 입력은 약화하여 통과시키지 않고 수정 또는 한계로 분류했습니다.

### 플러그인

| 결정 | 표준 또는 계약과 이유 | 이웃 경로와 비용 연결 |
|---|---|---|
| AJV 애플리케이션 인스턴스는 읽기 전용입니다. | 등록 소유권을 원본에 흔적으로 남기는 방식은 별칭, 해제와 수집 수명이 엇갈립니다. | 플러그인 소유 사본에서만 컴파일하고 현재 등록과 정의를 관찰합니다. 이전 함수의 스냅샷은 유지합니다. 속도표의 준비 비용을 수용합니다. |
| AJV 6은 uri-js 4.4.1을 정확한 실행 의존성으로 둡니다. | 주소 정규화는 직접 사용하는 실행 계약이므로 우연한 전이 설치에 기대지 않습니다. | 다른 정규화가 자원 주소를 갈라놓지 않도록 네이티브 URI 의미와 비교합니다. |
| 컴파일 사실은 AJV가 컴파일하는 모든 위치를 포함합니다. | 표준 키워드 목록만 걸으면 로컬 참조와 매크로로 도달한 위치의 의존성을 잃습니다. | 비표준 그릇, 매크로 전개, 재사용 문서의 새 조각과 키워드 교체를 비교합니다. |
| MUI 레이블은 사용자가 조작하는 요소를 가리킵니다. | 숨은 native input에 for를 주면 실제 선택기나 combobox를 활성화하지 못합니다. | 클릭을 전달하고 disabled는 초점에서 제외하며 readOnly는 네이티브 레이블처럼 처리합니다. label.control의 제한은 알려진 한계에 둡니다. |
| 슬라이더는 제공자 방향과 실제 값 및 확정 시점을 지킵니다. | 격자 보정이 방향, 읽기 전용 소수, 좁은 포함 상한과 이동 키 확정을 깨뜨려서는 안 됩니다. | 두 번째 내부 검증의 다섯 회귀를 모델 축에 넣었습니다. 나머지 보조 키와 표시 정책의 한계는 별도로 남깁니다. |
| 오래된 피어는 지원 가능한 콜백이나 실제 하한으로 처리합니다. | 없는 콜백을 호출하거나 빈 값을 처리하지 못하는 버전을 지원한다고 약속하지 않습니다. | antd5는 지원 콜백을 선택하고 모바일은 하한을 올립니다. |

## 알려진 한계

### 유틸리티와 자산 및 선언

react-utils의 ESM은 React 18 이상을 요구합니다. 이전 React는 CommonJS나 번들러 별칭을 사용하며 피어 범위를 넓게 적었다고 Node ESM 해석 성공을 보장하지 않습니다. 공개 선언 검증은 이른 JSX runtime을 현재 React 18 선언 위에서 모의합니다. 가장 오래된 전체 타입 패키지를 직접 설치해 검증한 것은 아닙니다.

내장 하위 클래스 복제는 결과표에서 명시한 추가 자기 속성 한계를 유지합니다. 대소문자를 구별하지 않는 볼륨에서 자산 파일의 대소문자만 바꾸면 설치 파일의 옛 철자가 남습니다. 사용자 범위의 끊어진 링크는 거절하며 새 버전이 누락한 기존 설정 파일을 삭제하지 않는 앞 결정도 유지합니다. 마커 스캐너는 일반 Markdown 전체를 해석하지 않으며 첫 내부 검증표의 인라인 코드, 목록 문맥과 모호한 울타리 거절 범위를 따릅니다.

### schema-form

배치의 파생 예산 오류는 쓴 필드 대신 배치 루트를 이름으로 표시하며 오류 코드와 되돌림은 유지합니다. 같은 배치에서 조상의 Overwrite 뒤 생략된 자손의 updater는 undefined를 받습니다. 순차 호출은 중간 정착이 빈 객체를 만들 수 있지만 배치 읽기 층은 반응을 실행하지 않기 때문입니다.

#667의 독립 사건 모델은 호출자 whole과 Merge의 소유권, unset 규칙, default와 상속 상수, 유효형 재해석, terminal과 잘못된 종류 및 null, extras, 이동과 재키 및 후보 교체, 대기 이탈과 한 번 또는 두 번의 재활성화, 수락되거나 거절된 초기화 장벽, resolver의 undefined와 예외, transition과 hostWheel 예산, 사건 배달을 아직 생성하지 않습니다. 별도 회귀 테스트가 일부를 검증하더라도 독립 모델이 이 차원까지 검증한다고 읽지 않습니다.

#665는 위상 모델의 실제 if, oneOf와 allOf 도달을 확인하고 분기 생성을 막은 변형을 검출했습니다. 배열 모델의 한 연산이 실제 배열 동사 없이 불변을 확인하는 한계는 남습니다. 부하가 큰 환경에서 전체 생성 범위가 파일 시간 제한에 걸린 실행은 제품 값 오류와 구별합니다.

#667의 `overlap-array-32-4` 증가분은 함수별로 프로파일하지 않았습니다. 검토의 시간 검증은 설치와 빌드를 제외한 검사 단계이므로 실제 전체 작업의 10분 예산 인증을 대신하지 않습니다. 다중 후보의 미생성 새 배열 자리에는 기존 기본 후보 선택을 적용하며 소비자 문서 예제를 보강할 여지가 있습니다.

원래 schema-form 탐침 H11a의 if/then/else가 속성을 선언하는 경우는 조사하지 않았습니다. 원래 style-utils J3는 압축하지 않은 출력까지 정규화 상수 BTN과 비교하는 잘못된 기대를 가집니다. 감사에서 다음 .btn 규칙은 살아 있었고 차이는 raw의 공백과 세미콜론 토큰이었습니다. 정규화된 문법 참조 모델은 통과하므로 이 실패를 남은 CSS 결함으로 세지 않습니다.

### 플러그인 검토의 열린 항목

AJV는 실행 시점에 $data로 선택하는 비동기 format을 동기 컴파일에서 미리 알지 못합니다. 다른 위치에 비동기 매크로가 있는 루트에서 루트 포인터를 요구하는 동기 조건 가드는 컴파일에 실패할 수 있습니다. 둘 다 기준부터 있던 한계입니다. AJV 6과 7의 일부 진단 기대는 이전 구현의 출력에서 가져왔으며 선택된 실제 조각 대신 무관한 작성 인자에서 rejectedKey를 찾기도 했습니다. 등록 문서의 false-schema 경로와 진단 순서에 관한 새 기대도 독립 근거가 부족하여 회귀 테스트로 보존하지 않았습니다. 이관하지 않은 12개 입력 중 schema-form의 값 소실과 모바일 End는 수정됐고, 조상 전체 쓰기가 생략한 이탈 주소의 resolver 결과는 현재 VALUE-043이 요구하므로 원래 기대를 폐기했습니다. 작성 문서의 로컬 조각이 검증기 인스턴스에만 등록된 외부 문서를 참조하면 폼 생성은 UNKNOWN_JSON_SCHEMA로 거절합니다. 이는 `packages/canard/schema-form/src/core/engine/blueprint/buildNodes/DETAIL.md`의 작성 문서 밖 참조 거절 계약이며 검증기 단독 컴파일 지원과 구별합니다.

플러그인 첫 검토의 antd5 tooltip 식별자 참조는 마운트되지 않은 툴팁을 가리킬 수 있으며 실제 브라우저에서 확인하지 않았습니다. 모바일 Stepper의 SVG 식별자 중복은 라이브러리 소유이고 기준에도 있습니다. antd5와 antd6의 password 입력에 있는 eye-invisible 버튼도 검토가 남긴 라이브러리 동작입니다. AJV 6 모듈 문서의 기존 후행 공백도 해당 검토가 남긴 항목입니다. 첫 검토에서 놓친 수집 정리와 원본 format 쓰기 변형은 후속 검증을 추가했으므로 그대로 미검출 상태라고 기록하지 않습니다.

MUI 선택기와 select는 조작 요소가 div이므로 label.control은 null입니다. for, aria-labelledby와 전달 클릭으로 연결합니다. MUI의 단일 입력은 외부 Form.Label과 내부 레이블의 제목이 중복 노출될 수 있습니다. 모바일과 MUI는 기본 lazy에서 이동 키를 잡은 채 Shift만 놓아도 저장하는 기존 동작이 남습니다. 모바일의 빈 기본 격자는 유효 mark 레이블이 있어도 조작을 비활성화하는 기존 동작을 유지합니다. 편집 가능하거나 disabled인 숫자 슬라이더의 표시용 초안은 기존 격자로 정규화되며, 이번 읽기 전용 소수 수정은 multipleOf 없는 선택 범위 안의 유효 값에 한정됩니다.

## 소유자가 정할 일

출시 때 호환성 절의 모바일 피어 하한, AJV 원본 조회 변경, 배치 초기화 장벽 및 가상 기본값 투영을 확인해야 합니다. changeset에 적힌 버전 단계와 관측 가능한 변화도 함께 확인합니다.

수용한 속도 예외는 다음 범위입니다. 세부 수치, 빈도와 원인은 속도 절이 소유합니다.

- handler 소유권 구성 및 알림 게시와 스타일 조각 경계 비용입니다.
- 가상 getter, 가상 쓰기와 타입 해석된 배치 읽기 비용입니다.
- 겹친 파생 규칙 및 초기화 장벽과 Error 슬롯 비교 비용입니다.
- AJV 읽기 전용 사본 준비와 컴파일 사실 확장 비용입니다.

조정자가 정한 조상 전체 쓰기의 생략 문서 정정, 초기화 행의 +3.4에서 +3.7 µs 수용, MUI 앞 라운드 제목 단언 변경은 소유자가 뒤집을 수 있습니다. 겹침 행의 두 최적화 후보를 적용할지도 결정 대상이며, 적용한다면 문서와 전체 검증을 포함한 별도 변경으로 진행해야 합니다.

## 미룬 항목과 위험

### 고치지 않았거나 확정하지 않은 것

원래 발견은 결과표의 코드 수정, 문서 수정 또는 한계 명시로 처리했습니다. schema-form 후속과 보유 원본 장치 교체는 병합됐습니다. 알려진 한계에 열거한 검토의 미해결 항목과 선언의 가장 이른 전체 타입 패키지 검증을 완료한 것으로 보지 않습니다.

### 내부 검증과 검토 과정

병합된 기준에 대한 내부 검증을 두 번 진행했습니다. 첫 검증은 자산의 재개 주석 및 확인 목록과 스타일 문서의 후속 처리, schema-form의 가상 입력 및 배치 후속 수정으로 이어졌습니다. 별도 추적 감사는 본 수정에서 놓친 두 패키지의 공개 선언을 찾았습니다. 두 번째 검증은 플러그인 수정이 만든 다섯 사용자 인터페이스 회귀와 네 AJV 회귀를 찾았습니다. 다음 라운드가 같은 회귀를 다시 발견하기 전에 수정하고 검토했습니다.

schema-form 후속 검토는 비활성 또는 이탈 필드의 선언적 값을 입력별로 보완할 때마다 이웃 결함을 드러냈습니다. 같은 영역에서 세 형태가 연속해서 나오자 입력별 구현을 중단했습니다. 구현자는 커밋별 입력 결과표와 기존 장치를 정리했고, 별도 설계자가 절차의 계약 먼저 규칙에 따라 한 장치의 설계를 쓴 뒤 구현을 재개했습니다. 구현은 실패 검증과 통과 조건을 둔 여덟 단계 및 진행 파일로 추적했습니다.

#667 검토자가 직접 만든 416개 입력에는 잘못된 값이 없었고 이 중 354개는 수정 전 실패했습니다. #665에서 보존한 회귀 테스트는 장치 교체 전후에 단언을 바꾸지 않고 통과했습니다. #665가 추가한 파일은 54개이며 검토의 기준 대비 변경 파일 55개는 기존 파일 보강을 포함한 다른 집계입니다. 검토는 해당 패키지의 도착 파일 8개와 전체 55개 파일의 내용 유지도 확인했지만 다른 패키지의 테스트를 모두 실행했다고 주장하지 않습니다. 장치 교체 후 전체 단위 검증은 826개 파일에서 5,308건, 렌더와 React 18 검증은 3,764건을 통과했습니다.

### 지속적 통합 시간

이번 라운드에 추가한 생성 모델 검증이 풀 리퀘스트에서도 전체 범위를 실행하여 한 작업이 40분을 넘었습니다. 일반 로컬과 출시 전 검증은 전체 범위를 유지하고 풀 리퀘스트 계획에서만 모든 입력 종류와 단언을 보존하는 제한된 프로필을 선택하도록 고쳤습니다. 작업을 병렬로 분할하고 실제 GitHub 작업당 예산을 10분으로 정했습니다. 15분 강제 중단은 예산과 다릅니다.

플러그인 본 수정의 실제 작업은 첫 성공 실행에서 main 8분 16초, AJV 5분 14초, antd 6분 30초, 다른 사용자 인터페이스 5분 40초, shared 3분 23초였습니다. 분할 전 schema-form은 9분 42초였고 다음 사용자 인터페이스 수정에서는 13분 21초까지 늘었습니다. AJV 후속에서는 9분 13초였습니다. 병합된 schema-form 후속의 분할 후 실제 작업은 main 7분 56초, AJV 5분 2초, antd 6분 32초, 다른 사용자 인터페이스 5분 48초, 렌더 4분 20초, 두 단위 작업 6분 31초와 6분 1초, shared 2분 50초로 모두 약 3분에서 8분입니다. 분할은 #662에 포함되어 병합됐습니다. #667 검토의 검사 단계 시간은 설치와 빌드를 포함하지 않으므로 전체 작업 시간과 구별합니다.

### 앞 기록의 정정과 다음 수집 우선순위

4라운드 표에는 `6326b9730`이 빠져 있습니다. 이 커밋은 AJV 6 1번, 5번과 6번의 네이티브 비동기 컴파일을 필요할 때까지 미룬 속도 수정입니다. 앞 표의 누락을 이번 새 발견 수에 더하지 않습니다.

6라운드는 보유 원본 주소 트리의 배열 세대, 이미 비활성인 자리, 재활성화 뒤 재이탈과 예산 복구를 먼저 확인합니다. 이어서 독립 모델이 생성하지 않는 차원, 두 층의 배치 계약, AJV의 참조와 매크로 및 현재 정의를 포함한 컴파일 사실 순회, 네 사용자 인터페이스 플러그인의 슬라이더와 레이블을 확인합니다. 제한된 풀 리퀘스트 프로필은 종류 이름만 존재하는 것으로 만족하지 않고 실제 스키마와 실행 연산까지 연결하며 한 종류라도 빠지면 실패해야 합니다.
