# 4라운드 버그 바운티 수정 기록

4라운드의 16개 패키지에서 확인한 108건은 서로 다른 결함 88건에서 나왔습니다. 높은 심각도는 서로 다른 결함 4건에 해당하는 8개 항목이며 치명적인 항목은 없습니다. 집계 기준은 [README.md](README.md)입니다. 수정 범위는 `a2624baaf..c4d45f9ea`입니다. 발견 단위로 95건은 코드 수정, 11건은 문서 수정, 2건은 한계 명시로 처리했습니다. 아래 결과표는 108개 항목과 schema-form 20번의 json-schema 부분을 별도로 추적하므로 109개 행입니다. 별도 부분을 전체 발견 수에 다시 더하지 않습니다.

수정은 [../FIX-PROCEDURE.md](../FIX-PROCEDURE.md)의 네 작업 단위로 진행했습니다. promise-modal과 agents-assets-sync는 [#652](https://github.com/vincent-kk/albatrion/pull/652), 유틸리티는 [#653](https://github.com/vincent-kk/albatrion/pull/653)입니다. 플러그인의 [#654](https://github.com/vincent-kk/albatrion/pull/654)는 schema-form 브랜치에 먼저 합쳐졌고, 두 단위가 [#655](https://github.com/vincent-kk/albatrion/pull/655)로 `1.0.0/bugbounty`에 합쳐졌습니다. 최종 끝은 `c4d45f9ea`입니다.

실패 커밋은 발견을 재현하는 검증을 먼저 넣은 커밋이고, 수정 커밋은 그 원인과 검토에서 드러난 이웃 경로를 고친 커밋입니다. 결과표는 저장소의 커밋과 현재 테스트 경로를 대조한 추적 기록입니다. 문서 수정과 한계 명시의 고정 검증은 문서 또는 선언 검증일 수 있으며, 런타임 수정의 증거와 같게 해석하지 않습니다. 이 문서를 쓰면서 빌드나 테스트를 새로 실행하지 않았습니다. 검증과 속도 수용의 근거는 구현 보고, 독립 표본 검토와 전수 추적 감사이며, 남은 제약은 알려진 한계에 둡니다.

동작 결정은 표준과 문서 계약, 형제 구현 사이의 예측 가능성, 해당 속도 행의 세 근거로 기록합니다. 식별자 인터페이스와 MUI 슬라이더 기본값은 소유자가 승인한 결정을 따릅니다. 소유자가 재확인할 공개 변경과 수용 비용은 소유자가 정할 일에 모읍니다.

## 패키지별 결과

“코드 수정”은 실행 코드 또는 타입 선언을 고친 항목이고, “문서 수정”은 동작을 유지한 채 설명을 고친 항목이며, “한계 명시”는 지원하지 않는 범위를 밝힌 항목입니다. 실패 커밋이 없는 행은 없다고 적습니다. 한 셀의 여러 커밋은 본 수정과 후속 보완입니다. 표의 경로는 고정 검증의 대표 파일이며 형제 검증 범위는 스펙표와 결정과 근거에서 설명합니다.

### 유틸리티 묶음

#### @winglet/common-utils

| 항목 | 처리 | 결과 | 실패 커밋 | 수정 커밋 | 고정 검증 |
|---|---|---|---|---|---|
| 1 | 코드 수정 | 내장 하위 클래스의 프로토타입을 지원 범위 안에서 보존합니다. | `f288aaa23`, `3101adc14`, `4c69036cf`, `55dea788c`, `01d6f7f40`, `e8624d8b9`, `7a3e36e5b`, `4d661c294` | `b33b4b968`, `e37b736dc`, `bbb21ec17`, `7059f3ddd`, `dbdd68782`, `a34c3db19`, `6b2dfd083`, `a49867fbe`, `c56487980`, `d4faa8135` | `packages/winglet/common-utils/src/utils/object/__tests__/clone.round4.test.ts` |
| 2 | 코드 수정 | Error.cause의 열거 가능 여부를 보존합니다. | `f288aaa23` | `66f7557c7` | `packages/winglet/common-utils/src/utils/object/__tests__/clone.round4.test.ts` |
| 3 | 코드 수정 | 중첩 호출의 알림 소유권을 호출마다 분리합니다. | `f288aaa23`, `ee9b52b4b` | `473b1ffab` | `packages/winglet/common-utils/src/utils/function/enhance/getTrackableHandler/__tests__/lifecycle-before.round4.test.ts` |
| 4 | 문서 수정 | equals와 cloneLite의 순환 입력 미지원 및 대안을 문서화합니다. | `f288aaa23`, `5b654159a` | `7a7a2166a`, `a49867fbe` | `packages/winglet/common-utils/src/__tests__/cycleGuidance.round4.test.ts` |
| 5 | 코드 수정 | 해제 전후에도 작업 식별자를 재사용하지 않습니다. | `f288aaa23` | `2592a0665`, `96ad1b8d7` | `packages/winglet/common-utils/src/utils/scheduler/MessageChannelScheduler/__tests__/identity.round4.test.ts` |
| 6 | 코드 수정 | 프로토타입 없는 사전을 그대로 유지합니다. | `f288aaa23` | `477d7f862` | `packages/winglet/common-utils/src/utils/object/__tests__/nullPrototype.round4.test.ts` |
| 7 | 코드 수정 | 콘솔 형식 문자열을 치환 데이터로 전달합니다. | `f288aaa23` | `0eeee1fa9`, `d5b11a043` | `packages/winglet/common-utils/src/utils/console/__tests__/format.round4.test.ts` |
| 8 | 코드 수정 | 진법 숫자는 ASCII 문자만 허용합니다. | `f288aaa23` | `932dec39b` | `packages/winglet/common-utils/src/utils/math/__tests__/math.round4.test.ts` |
| 9 | 코드 수정 | factorial 결과가 캐시 이력에 의존하지 않습니다. | `f288aaa23` | `cfb2359ed` | `packages/winglet/common-utils/src/utils/math/__tests__/math.round4.test.ts` |
| 10 | 문서 수정 | 호스트별 작업 실행 순서를 문서에서 구분합니다. | 없습니다. | `c797fb9de`, `a49867fbe` | `packages/winglet/common-utils/src/utils/scheduler/__tests__/hostOrder.round4.test.ts` |
| 11 | 코드 수정 | 네이티브 슬롯으로 다른 realm의 DataView를 제외합니다. | `f288aaa23` | `d023f23cb`, `c92467548`, `bbb21ec17`, `33e197622`, `bd40ad42a` | `packages/winglet/common-utils/src/utils/filter/__tests__/typedArray.round4.test.ts` |
| 12 | 문서 수정 | README 예제를 게시된 공개 이름에 맞춥니다. | `f288aaa23` | `cbcc6f997` | `packages/winglet/common-utils/src/__tests__/documentedImports.round4.test.ts` |

#### @winglet/json

| 항목 | 처리 | 결과 | 실패 커밋 | 수정 커밋 | 고정 검증 |
|---|---|---|---|---|---|
| 1 | 코드 수정 | undefined인 새 mergePatch 멤버를 생략합니다. | `43d92b1ef` | `fc662e493` | `packages/winglet/json/src/JSONPointer/utils/patch/mergePatch/__tests__/undefinedMembers.round4.test.ts` |
| 2 | 코드 수정 | 원시값 아래 쓰기는 JSONPointerError로 실패합니다. | `43d92b1ef`, `fcced8439` | `282e0bd8f`, `6b2dfd083` | `packages/winglet/json/src/JSONPointer/utils/manipulator/__tests__/primitiveWrites.round4.test.ts` |
| 3 | 코드 수정 | 빈 참조 토큰의 구분자를 보존합니다. | `43d92b1ef`, `fcced8439` | `a73864fb0`, `a49867fbe` | `packages/winglet/json/src/__tests__/pointerPaths.round4.test.ts` |

#### @winglet/data-loader

| 항목 | 처리 | 결과 | 실패 커밋 | 수정 커밋 | 고정 검증 |
|---|---|---|---|---|---|
| 1 | 문서 수정 | 묶음 실패의 재시도와 키별 오류 캐시를 구분합니다. | `a5eede81b` | `21f6a296c` | `packages/winglet/data-loader/src/__tests__/documentedRetry.round4.test.ts` |
| 2 | 문서 수정 | 사이트 생성자 옵션을 실제 계약에 맞춥니다. | `a5eede81b` | `61aa002f6` | `packages/winglet/data-loader/src/__tests__/documentedOptions.round4.test.ts` |
| 3 | 코드 수정 | 캐시 쓰기 실패의 요청을 철회하고 loadMany 오류를 키별로 격리합니다. | `a5eede81b`, `a93147a0c` | `f1e6cd2ac`, `2025b9d76` | `packages/winglet/data-loader/src/__tests__/cacheFailure.round4.test.ts` |

#### @winglet/style-utils

| 항목 | 처리 | 결과 | 실패 커밋 | 수정 커밋 | 고정 검증 |
|---|---|---|---|---|---|
| 1 | 코드 수정 | 그림자 루트에 합치는 조각의 열린 구문을 닫습니다. | `233ce1ce6`, `9565c0324` | `a7941b594`, `132bb94f5` | `packages/winglet/style-utils/src/__tests__/shadowEof.round4.test.ts` |
| 2 | 코드 수정 | 이스케이프 뒤 주석 경계를 보존합니다. | `233ce1ce6`, `9565c0324`, `ffda7ba87`, `9598b851a`, `9b83e10d7`, `c5e355daf`, `cefd6fcf6` | `a7941b594`, `f6e448f82`, `74fffb907`, `a585b60ef`, `a61403a37` | `packages/winglet/style-utils/src/__tests__/comments.round4.test.ts` |
| 3 | 코드 수정 | 문자열 안의 괄호를 구조로 읽지 않습니다. | `233ce1ce6`, `9565c0324`, `ffda7ba87`, `9598b851a`, `9b83e10d7`, `c5e355daf`, `cefd6fcf6` | `a7941b594`, `f6e448f82`, `74fffb907`, `a585b60ef`, `a61403a37`, `a49867fbe` | `packages/winglet/style-utils/src/__tests__/mathStrings.round4.test.ts` |
| 4 | 문서 수정 | 한국어 예제의 가져오기를 공개 이름에 맞춥니다. | `233ce1ce6` | `af20c1139` | `packages/winglet/style-utils/src/__tests__/documentedImports.round4.test.ts` |

#### @winglet/react-utils

| 항목 | 처리 | 결과 | 실패 커밋 | 수정 커밋 | 고정 검증 |
|---|---|---|---|---|---|
| 1 | 코드 수정 | 다시 마운트하는 중에도 타이머 예약을 받습니다. | `491390c4f` | `a0dac8c73` | `packages/winglet/react-utils/src/hooks/__tests__/timeoutLifecycle.round4.test.tsx` |
| 2 | 코드 수정 | 스냅샷 참조는 커밋 단계에서 게시합니다. | `491390c4f`, `022f795e9` | `b33cc58aa`, `7f7401166`, `110d69156`, `1161eab74`, `6b2dfd083` | `packages/winglet/react-utils/src/hooks/__tests__/snapshotCommit.round4.test.tsx` |
| 3 | 문서 수정 | 사이트 예제와 호환 범위를 공개 계약에 맞춥니다. | `491390c4f` | `12faebb37` | `packages/winglet/react-utils/src/__tests__/documentedExamples.round4.test.tsx` |
| 4 | 코드 수정 | 업로더가 React 이벤트 처리자 타입을 받습니다. | `491390c4f` | `fcd914194`, `1161eab74`, `64d8bb1b6` | `packages/winglet/react-utils/src/__tests__/withUploaderTypes.round4.tsx` |
| 5 | 문서 수정 | 객체 도우미 예제를 공개 이름에 맞춥니다. | `491390c4f` | `d8e84b7be` | `packages/winglet/react-utils/src/__tests__/documentedImports.round4.test.tsx` |

#### @winglet/json-schema

| 항목 | 처리 | 결과 | 실패 커밋 | 수정 커밋 | 고정 검증 |
|---|---|---|---|---|---|
| 1 | 코드 수정 | node10에서 루트 오류 타입의 상속 멤버를 유지합니다. | `8b8080d81` | `a89b490ce` | `packages/winglet/json-schema/src/__tests__/node10Root.round4.test.ts` |

| 항목 | 처리 | 결과 | 실패 커밋 | 수정 커밋 | 고정 검증 |
|---|---|---|---|---|---|
| schema-form 20의 json-schema 부분 | 코드 수정 | 명시적 undefined 키워드를 json-schema 선언에서 허용합니다. | `8b8080d81` | `47c68ee6a`, `a49867fbe` | `packages/winglet/json-schema/src/__tests__/exactOptional.round4.test.ts` |

### @lerx/promise-modal과 @slats/agents-assets-sync

#### @slats/agents-assets-sync

| 항목 | 처리 | 결과 | 실패 커밋 | 수정 커밋 | 고정 검증 |
|---|---|---|---|---|---|
| 1 | 코드 수정 | 울타리와 주석 문맥에서 예시 마커를 제외하고 모호한 입력은 쓰기 전에 거절합니다. | `4a7f579be`, `4d02851ec`, `c837905c3`, `8eaf10fc3`, `ccee5bbd0`, `50c428cf0`, `828ab9fa9` | `7a53bffcf`, `19ef567b2`, `b5edab847`, `67fccd411`, `2b2b08fd7`, `4f2f2d7fc`, `d7429365e` | `packages/slats/agents-assets-sync/src/__tests__/roundFour/markerContext.test.ts` |
| 2 | 코드 수정 | 같은 식별자의 중복 블록을 원본 바이트 기준으로 조정합니다. | `4a7f579be` | `7a53bffcf`, `d7429365e` | `packages/slats/agents-assets-sync/src/__tests__/roundFour/markerContext.test.ts` |
| 3 | 코드 수정 | UTF-8이 아닌 규칙도 같은 결과로 수렴합니다. | `4a7f579be` | `7a53bffcf`, `d7429365e` | `packages/slats/agents-assets-sync/src/__tests__/roundFour/nonUtf8Rule.test.ts` |
| 4 | 코드 수정 | 스킬 루트의 자리 표시 파일을 허용합니다. | `4a7f579be` | `ac51c690a`, `d7429365e` | `packages/slats/agents-assets-sync/src/__tests__/roundFour/skillsPlaceholder.test.ts` |
| 5 | 코드 수정 | 공유 목적지를 실행 전체에서 계획하고 출력 모드의 결과를 통일합니다. | `4a7f579be`, `1ef513166`, `45678d0df` | `75f6f064d`, `e429b0dfa`, `18652e69d`, `b32c2653f`, `79dfc386d`, `c3d3a28ed`, `ebd426384`, `811f2748f`, `f56ab9176`, `d7429365e` | `packages/slats/agents-assets-sync/src/__tests__/roundFour/sharedNamespace.test.tsx` |
| 6 | 코드 수정 | 권한을 보존하며 읽기 전용 파일과 끊어진 링크를 거절합니다. | `4a7f579be`, `e0559e478` | `e0559e478`, `18652e69d`, `ff34c7e32`, `d7429365e` | `packages/slats/agents-assets-sync/src/__tests__/roundFour/documentRewrite.test.ts` |
| 7 | 코드 수정 | 대상이 없어도 잘못된 인자는 실패합니다. | `4a7f579be` | `75f6f064d`, `18652e69d`, `d7429365e` | `packages/slats/agents-assets-sync/src/__tests__/roundFour/flagsWithoutTargets.test.tsx` |
| 8 | 코드 수정 | 인자 해석 오류도 JSON 출력 형식을 지킵니다. | `4a7f579be`, `09d0f83c8` | `75f6f064d`, `18652e69d`, `d7429365e` | `packages/slats/agents-assets-sync/src/__tests__/roundFour/jsonFlagErrors.test.ts` |
| 9 | 코드 수정 | 없는 자산 루트에서 빈 manifest를 성공으로 쓰지 않습니다. | `4a7f579be` | `04ea9ed32`, `18652e69d`, `d7429365e` | `packages/slats/agents-assets-sync/src/__tests__/roundFour/emptyBuiltManifest.test.ts` |
| 10 | 코드 수정 | 여러 대상의 출력 키와 이름을 구분합니다. | `4a7f579be` | `75f6f064d`, `18652e69d`, `d7429365e` | `packages/slats/agents-assets-sync/src/__tests__/roundFour/inkMultiAgent.test.tsx` |
| 11 | 코드 수정 | 중복 대상은 한 번만 계획하고 집계합니다. | `4a7f579be` | `75f6f064d`, `18652e69d`, `d7429365e` | `packages/slats/agents-assets-sync/src/__tests__/roundFour/inkMultiAgent.test.tsx` |
| 12 | 문서 수정 | 한국어 예제의 가져오기를 공개 이름에 맞춥니다. | `4a7f579be` | `6f1302149`, `d7429365e`, `90171184f` | `packages/slats/agents-assets-sync/src/__tests__/roundFour/contracts.test.ts` |
| 13 | 문서 수정 | 루트 선택 문서를 루트 표시 우선순위에 맞춥니다. | `4a7f579be`, `6f1302149` | `6f1302149`, `127f5eb50`, `d7429365e`, `90171184f` | `packages/slats/agents-assets-sync/src/__tests__/roundFour/contracts.test.ts` |
| 14 | 한계 명시 | 프로그램 인터페이스의 ESM 전용 한계를 명시합니다. | `4a7f579be`, `6f1302149`, `e57c61b11` | `6f1302149`, `e57c61b11`, `d7429365e` | `packages/slats/agents-assets-sync/src/__tests__/roundFour/contracts.test.ts` |

#### @lerx/promise-modal

| 항목 | 처리 | 결과 | 실패 커밋 | 수정 커밋 | 고정 검증 |
|---|---|---|---|---|---|
| 1 | 코드 수정 | 숨긴 요청의 정착이 페이지 초점을 가져가지 않습니다. | `04612ae8c`, `0a87219ab` | `c83de7d16`, `915111032`, `f56eee402`, `e57c61b11`, `d7429365e` | `packages/lerx/promise-modal/src/__tests__/roundFour/hiddenSettleFocus.render.test.tsx` |
| 2 | 코드 수정 | 숨긴 동안의 탐색을 다시 표시할 때 반영합니다. | `04612ae8c`, `0a87219ab` | `0c0b6da40`, `e57c61b11`, `d7429365e` | `packages/lerx/promise-modal/src/__tests__/roundFour/pathnameHidden.render.test.tsx` |
| 3 | 코드 수정 | 정착 시 실제 연결 상태를 저장하여 종료 애니메이션을 다시 실행하지 않습니다. | `04612ae8c`, `baf611440`, `e0f5bd84d` | `c83de7d16`, `915111032`, `f56eee402`, `90171184f`, `d7429365e` | `packages/lerx/promise-modal/src/__tests__/roundFour/providerHiddenSettle.render.test.tsx` |
| 4 | 코드 수정 | 다시 연결된 프레임이 잃은 초점만 복구합니다. | `04612ae8c`, `0a87219ab` | `c83de7d16`, `4a8db653a`, `060ed4130`, `e57c61b11`, `d7429365e` | `packages/lerx/promise-modal/src/__tests__/roundFour/contentResuspendFocus.render.test.tsx` |
| 5 | 코드 수정 | 호환되지 않는 복사본은 함께 실행하지 않고 요청을 거절합니다. | `04612ae8c`, `0a87219ab` | `c83de7d16`, `4a8db653a`, `d7429365e` | `packages/lerx/promise-modal/src/__tests__/roundFour/isolatedSystems.render.test.tsx` |

### @canard/schema-form

| 항목 | 처리 | 결과 | 실패 커밋 | 수정 커밋 | 고정 검증 |
|---|---|---|---|---|---|
| 1 | 코드 수정 | 방언에 따라 fragment $id를 허용합니다. | `05357d240` | `12457f2cf` | `packages/canard/schema-form/src/core/engine/blueprint/buildNodes/__tests__/fragmentIdentifiers.round-four.test.ts` |
| 2 | 코드 수정 | 가상 그룹의 실제 저장 필드를 초기화합니다. | `05357d240` | `f3a6cfdae` | `packages/canard/schema-form/src/core/engine/write/__tests__/virtualAddresses.round-four.test.ts` |
| 3 | 코드 수정 | 가상 별칭의 묶음 표시도 실제 저장 주소로 초기화합니다. | `05357d240` | `f3a6cfdae` | `packages/canard/schema-form/src/core/engine/write/__tests__/virtualAddresses.round-four.test.ts` |
| 4 | 코드 수정 | 중첩 제공자가 바깥 플러그인 범위를 상속합니다. | `05357d240` | `decaaecc3` | `packages/canard/schema-form/src/__tests__/e2e/pluginScope.round-four.test.tsx` |
| 5 | 코드 수정 | 네이티브 초기화가 저장 값과 화면을 함께 복원합니다. | `05357d240` | `93520e866` | `packages/canard/schema-form/src/__tests__/e2e/nativeReset.round-four.test.tsx` |
| 6 | 코드 수정 | 배열 이동 뒤 라디오 선택을 복원합니다. | `05357d240` | `52574d3c7`, `7260105c8` | `packages/canard/schema-form/src/__tests__/e2e/radioMoves.round-four.test.tsx` |
| 7 | 코드 수정 | 순환 context의 비교를 종료합니다. | `05357d240` | `a2041ad0e`, `09ee0f93e` | `packages/canard/schema-form/src/__tests__/e2e/contextCycle.round-four.test.tsx` |
| 8 | 코드 수정 | 소유자가 정한 식별자 인터페이스를 한 생성 경로로 제공합니다. | `96af6dde0` | `bad028051`, `80410ba5b` | `packages/canard/schema-form/src/__tests__/e2e/inputIdentifiers.round-four.test.tsx` |
| 9 | 코드 수정 | 절대 경로의 점 연산을 정규화합니다. | `05357d240` | `1adeef80b` | `packages/canard/schema-form/src/helpers/jsonPointer/__tests__/absoluteOperators.round-four.test.ts` |
| 10 | 코드 수정 | 키워드 뒤 정규식과 문자 클래스를 경로와 구분합니다. | `05357d240` | `5c9f195be`, `2b8f71740`, `4b69e49ec` | `packages/canard/schema-form/src/core/engine/blueprint/__tests__/regexKeywords.round-four.test.ts` |
| 11 | 코드 수정 | allOf의 참조도 무시 경고를 유지합니다. | `05357d240` | `2e42be890` | `packages/canard/schema-form/src/core/engine/blueprint/collectBlueprintWarnings/__tests__/allOfReferences.round-four.test.ts` |
| 12 | 코드 수정 | 자동 쓰기 허용을 해당 쓰기에만 적용합니다. | `05357d240` | `883740bb1` | `packages/canard/schema-form/src/core/engine/write/__tests__/batchEnable.round-four.test.ts` |
| 13 | 코드 수정 | 갱신 함수에 자기 데이터 속성만 전달합니다. | `05357d240` | `c7e0607aa` | `packages/canard/schema-form/src/core/surface/__tests__/updaterOwnKeys.round-four.test.ts` |
| 14 | 코드 수정 | 가상 그룹 검증이 저장 필드에 오류를 게시합니다. | `05357d240` | `f3a6cfdae` | `packages/canard/schema-form/src/core/engine/validation/__tests__/virtualScope.round-four.test.ts` |
| 15 | 문서 수정 | 묶음의 정체성과 병합 문서를 현재 계약에 맞춥니다. | 없습니다. | `93dbd22f6` | `packages/canard/schema-form/src/core/engine/write/__tests__/batchIdentity.round-three.test.ts`, `packages/canard/schema-form/src/core/engine/write/__tests__/batchMerge.round-three.test.ts` |
| 16 | 코드 수정 | 와일드카드 중복 제거의 이차 증가를 없앱니다. | `05357d240` | `4bd6dd384`, `c41c5c252` | `packages/canard/schema-form/src/core/engine/navigation/__tests__/wildcardScale.round-four.test.ts` |
| 17 | 코드 수정 | 없는 자식을 프로토타입에서 읽지 않습니다. | `05357d240` | `c7e0607aa` | `packages/canard/schema-form/src/__tests__/e2e/childMapOwnKeys.round-four.test.tsx` |
| 18 | 코드 수정 | 구조를 만족하는 클래스와 모듈 플러그인을 받습니다. | `edeeb6973` | `bc590215e`, `75b916fbd` | `packages/canard/schema-form/src/app/plugin/__tests__/registerPlugin.structural.round-four.test.ts` |
| 19 | 한계 명시 | node10의 의존 하위 경로 타입 해석 한계를 명시합니다. | 없습니다. | `40130a159` | README의 소비자 설정과 공개 선언을 정적으로 대조합니다. |
| 20 | 코드 수정 | 명시적 undefined를 허용하면서 존재하는 타입을 추론합니다. | `05357d240` | `788a92843` | `packages/canard/schema-form/src/types/__tests__/exactOptional.round-four.test.ts` |

15번의 표에는 동작 계약의 검증을 연결했습니다. 문서의 옛 문구를 직접 검사하는 별도 실패 커밋은 없습니다. 19번은 README에 해석 한계를 명시하는 처리이므로 런타임 수정 검증을 주장하지 않습니다. 20번의 의존 선언 수정은 유틸리티 표의 별도 행과 함께 읽습니다.

### 플러그인 묶음

#### @canard/schema-form-ajv6-plugin

| 항목 | 처리 | 결과 | 실패 커밋 | 수정 커밋 | 고정 검증 |
|---|---|---|---|---|---|
| 1 | 코드 수정 | 호출별 오류를 분리합니다. | `4d75e319b` | `31c150e44` | `packages/canard/schema-form-ajv6-plugin/src/__tests__/roundFour.concurrent.table.test.ts` |
| 2 | 코드 수정 | 자신이 등록한 항목만 해제합니다. | `ff622d23e` | `2e4061359` | `packages/canard/schema-form-ajv6-plugin/src/__tests__/roundFour.registration.table.test.ts` |
| 3 | 코드 수정 | 기본 인스턴스의 소수 배수를 허용합니다. | `960cb951a` | `7180e6b09` | `packages/canard/schema-form-ajv6-plugin/src/__tests__/roundFour.decimal.table.test.ts` |
| 4 | 코드 수정 | 나중에 등록된 스키마를 조회합니다. | `ce4c37054` | `4bd796081`, `2f0c3d1a0` | `packages/canard/schema-form-ajv6-plugin/src/__tests__/roundFour.lateSchemas.table.test.ts` |
| 5 | 코드 수정 | 오류 경로 설정과 캐시를 분리합니다. | `eb7b99255` | `b267c050f`, `936b39b5e`, `f1521108e` | `packages/canard/schema-form-ajv6-plugin/src/__tests__/roundFour.pointerCache.table.test.ts` |
| 6 | 코드 수정 | 비동기 키워드를 일관되게 컴파일합니다. | `abcdbc40b` | `a4ef334dd` | `packages/canard/schema-form-ajv6-plugin/src/__tests__/roundFour.asyncKeywords.table.test.ts` |
| 7 | 코드 수정 | 복사본 사이에서 등록 소유권을 공유합니다. | `1165306a3` | `240090d01` | `packages/canard/schema-form-ajv6-plugin/src/__tests__/roundFour.copies.table.test.ts` |
| 8 | 코드 수정 | required 오류 경로에 속성 이름을 중복하지 않습니다. | `eb7b99255` | `b267c050f` | `packages/canard/schema-form-ajv6-plugin/src/__tests__/roundFour.pointerCache.table.test.ts` |
| 9 | 코드 수정 | ES2020에서 명시적 해제를 지원합니다. | `e32cd9f74` | `e413aa637` | `packages/canard/schema-form-ajv6-plugin/src/__tests__/roundFour.environment.table.test.ts` |

#### @canard/schema-form-ajv7-plugin

| 항목 | 처리 | 결과 | 실패 커밋 | 수정 커밋 | 고정 검증 |
|---|---|---|---|---|---|
| 1 | 코드 수정 | 겹친 검증의 오류를 호출마다 분리합니다. | `9995c3bcc` | `a3591f775` | `packages/canard/schema-form-ajv7-plugin/src/__tests__/roundFour.concurrent.table.test.ts` |
| 2 | 코드 수정 | 기본 인스턴스의 소수 배수를 허용합니다. | `70e41c1f6` | `a472ed1f4` | `packages/canard/schema-form-ajv7-plugin/src/__tests__/roundFour.decimal.table.test.ts` |
| 3 | 코드 수정 | 나중에 등록된 스키마를 조회합니다. | `5c73bdea6` | `10bfbd819`, `2f0c3d1a0` | `packages/canard/schema-form-ajv7-plugin/src/__tests__/roundFour.lateSchemas.table.test.ts` |
| 4 | 코드 수정 | 비동기 키워드를 일관되게 컴파일합니다. | `e1fd8b6c8` | `a6834da0e` | `packages/canard/schema-form-ajv7-plugin/src/__tests__/roundFour.asyncKeywords.table.test.ts` |
| 5 | 코드 수정 | 복사본 사이에서 등록 소유권을 공유합니다. | `e81a4f675` | `12c3ee73d` | `packages/canard/schema-form-ajv7-plugin/src/__tests__/roundFour.copies.table.test.ts` |
| 6 | 코드 수정 | ES2020에서 명시적 해제를 지원합니다. | `49a7c4482` | `a6ed7c94f` | `packages/canard/schema-form-ajv7-plugin/src/__tests__/roundFour.environment.table.test.ts` |

#### @canard/schema-form-ajv8-plugin

| 항목 | 처리 | 결과 | 실패 커밋 | 수정 커밋 | 고정 검증 |
|---|---|---|---|---|---|
| 1 | 코드 수정 | 기본 인스턴스의 소수 배수를 허용합니다. | `550b5a556` | `447634aa3` | `packages/canard/schema-form-ajv8-plugin/src/__tests__/roundFour.decimal.table.test.ts` |
| 2 | 코드 수정 | 나중에 등록된 스키마를 조회합니다. | `8b5b59f17` | `5ee474f74`, `2f0c3d1a0` | `packages/canard/schema-form-ajv8-plugin/src/__tests__/roundFour.lateSchemas.table.test.ts` |
| 3 | 코드 수정 | 복사본 사이에서 등록 소유권을 공유합니다. | `1be5d4d60` | `e95451d9d` | `packages/canard/schema-form-ajv8-plugin/src/__tests__/roundFour.copies.table.test.ts` |
| 4 | 코드 수정 | ES2020에서 가져오기와 명시적 해제를 지원합니다. | `eb648499f` | `949b33cc0` | `packages/canard/schema-form-ajv8-plugin/src/__tests__/roundFour.environment.table.test.ts` |
| 5 | 코드 수정 | ES2020 소비자에게 필요한 weakref 선언 참조를 보존합니다. | `eb648499f` | `949b33cc0` | `packages/canard/schema-form-ajv8-plugin/src/__tests__/roundFour.weakRefDeclarations.test.ts` |

#### @canard/schema-form-antd5-plugin

| 항목 | 처리 | 결과 | 실패 커밋 | 수정 커밋 | 고정 검증 |
|---|---|---|---|---|---|
| 1 | 코드 수정 | 범위 선택 확정이나 지우기만 저장합니다. | `edd3c3238` | `bbd5e5e49` | `packages/canard/schema-form-antd5-plugin/src/__tests__/roundFour.rangePanelBrowse.test.tsx` |
| 2 | 코드 수정 | 코어가 제공한 식별자만 사용합니다. | `b84092cf2` | `f9cd39478` | `packages/canard/schema-form-antd5-plugin/src/__tests__/fieldIdentifiers.resolver.roundFour.test.tsx` |
| 3 | 코드 수정 | 소문자 z 시간 표기를 허용합니다. | `2dbe5c12a` | `d558d8f78` | `packages/canard/schema-form-antd5-plugin/src/__tests__/roundFour.timeSpelling.table.test.tsx` |
| 4 | 코드 수정 | 검색의 유니코드 정규화 차이를 없앱니다. | `2dbe5c12a` | `b2643d9ad` | `packages/canard/schema-form-antd5-plugin/src/fieldInputs/utils/enum/__tests__/filterEnumOption.roundFour.table.test.ts` |

#### @canard/schema-form-antd6-plugin

| 항목 | 처리 | 결과 | 실패 커밋 | 수정 커밋 | 고정 검증 |
|---|---|---|---|---|---|
| 1 | 코드 수정 | 범위 선택 확정이나 지우기만 저장합니다. | `d9924fc34` | `c5e4342c1` | `packages/canard/schema-form-antd6-plugin/src/__tests__/roundFour.rangePanelBrowse.test.tsx` |
| 2 | 코드 수정 | 코어가 제공한 식별자만 사용합니다. | `868fec4bd` | `ec661aedf` | `packages/canard/schema-form-antd6-plugin/src/__tests__/fieldIdentifiers.resolver.roundFour.test.tsx` |
| 3 | 코드 수정 | 소문자 z 시간 표기를 허용합니다. | `c598dd3f5` | `05c90d841` | `packages/canard/schema-form-antd6-plugin/src/__tests__/roundFour.timeSpelling.table.test.tsx` |
| 4 | 코드 수정 | 검색의 유니코드 정규화 차이를 없앱니다. | `c598dd3f5` | `a6cf9e4d2` | `packages/canard/schema-form-antd6-plugin/src/fieldInputs/utils/enum/__tests__/filterEnumOption.roundFour.table.test.ts` |

#### @canard/schema-form-mui-plugin

| 항목 | 처리 | 결과 | 실패 커밋 | 수정 커밋 | 고정 검증 |
|---|---|---|---|---|---|
| 1 | 코드 수정 | 배열과 루트 분기의 검증 오류를 표시합니다. | `b22f880b6` | `eb0ac5018`, `3acd68039` | `packages/canard/schema-form-mui-plugin/src/__tests__/roundFour.branchErrors.table.test.tsx` |
| 2 | 코드 수정 | 선택 상태가 enum[0]을 저장합니다. | `30c55b0e5` | `f308f0b8d` | `packages/canard/schema-form-mui-plugin/src/__tests__/roundFour.switchParity.table.test.tsx` |
| 3 | 코드 수정 | 배수 격자와 범위를 교차합니다. | `3c7b785bc` | `791ec1d0a`, `b3d8afe08` | `packages/canard/schema-form-mui-plugin/src/__tests__/roundFour.sliderGrid.table.test.tsx` |
| 4 | 코드 수정 | 현재 값에서 체크박스 중간 상태를 계산합니다. | `30c55b0e5` | `87c4d6a6d` | `packages/canard/schema-form-mui-plugin/src/__tests__/roundFour.switchParity.table.test.tsx` |
| 5 | 코드 수정 | 메뉴를 포함하여 코어 식별자만 사용합니다. | `7cb3e8cce` | `49b3d26af`, `3c303a958` | `packages/canard/schema-form-mui-plugin/src/__tests__/fieldIdentifiers.resolver.roundFour.test.tsx` |
| 6 | 코드 수정 | 스위치의 사용자 상태 이름을 표시합니다. | `30c55b0e5` | `e1b9c2722`, `360b0d167` | `packages/canard/schema-form-mui-plugin/src/__tests__/roundFour.switchParity.table.test.tsx` |
| 7 | 코드 수정 | 값 없는 열거 선택을 경고 없이 표시합니다. | `30c55b0e5` | `dcba8a214` | `packages/canard/schema-form-mui-plugin/src/__tests__/roundFour.switchParity.table.test.tsx` |
| 8 | 코드 수정 | 열거 밖 저장 값을 보존합니다. | `3fd63992a` | `e76cea352` | `packages/canard/schema-form-mui-plugin/src/__tests__/roundFour.unknownCheckbox.table.test.tsx` |

#### @canard/schema-form-antd-mobile-plugin

| 항목 | 처리 | 결과 | 실패 커밋 | 수정 커밋 | 고정 검증 |
|---|---|---|---|---|---|
| 1 | 코드 수정 | 배열과 루트 분기의 검증 오류를 표시합니다. | `b0e680586` | `106a69d40`, `53d29e0af` | `packages/canard/schema-form-antd-mobile-plugin/src/__tests__/roundFour.branchErrors.table.test.tsx` |
| 2 | 코드 수정 | 배수 격자와 범위를 교차합니다. | `9c4f24bf3` | `c44dcaff5`, `7cb6c7ca9` | `packages/canard/schema-form-antd-mobile-plugin/src/__tests__/roundFour.sliderGrid.table.test.tsx` |
| 3 | 코드 수정 | 열거 밖 저장 값의 타입을 보존합니다. | `826ca1c29` | `3a7d1dde9` | `packages/canard/schema-form-antd-mobile-plugin/src/__tests__/roundFour.unknownCheckbox.table.test.tsx` |
| 4 | 코드 수정 | 코어가 제공한 식별자만 사용합니다. | `f27cdb614` | `3043a5bbe` | `packages/canard/schema-form-antd-mobile-plugin/src/__tests__/fieldIdentifiers.resolver.roundFour.test.tsx` |
| 5 | 코드 수정 | 값 없는 슬라이더를 현재 값으로 알리지 않습니다. | `0c84a647f` | `012a63260` | `packages/canard/schema-form-antd-mobile-plugin/src/__tests__/roundFour.sliderUnset.table.test.tsx` |

함께 고친 형제는 네 UI 플러그인의 배열 및 루트 분기 오류, 열거 밖 값의 보존, 슬라이더 격자와 미설정 값, 문자열 스위치 이름과 저장 시점입니다. AJV는 세 버전의 비동기 키워드, 등록 소유권, 늦은 스키마와 소수 배수를 비교합니다. 이들은 번호를 새로 만든 발견으로 합산하지 않습니다.

## 속도

비율은 수정 후 시간을 수정 전 시간으로 나눈 값입니다. 절대 비용은 호출 단위의 증가분이며, 보고에 원자료가 없는 증가분은 미확인이라고 적습니다. 수용 비율과 별도 표본에서 계산한 절대 비용은 같은 표본인 것처럼 합치지 않습니다. 원자료가 없는 값을 비율로 추정하여 확정하지 않습니다. 1.03 이하는 절차의 허용 범위입니다. 수용된 초과 비용과 측정 한계는 구분합니다.

### 유틸리티 묶음

#### 빠진 작업을 채운 행

| 경로 | 비율 | 절대 비용 | 호출 빈도와 필요한 작업 |
|---|---|---|---|
| CSS scoper의 nested, opaque, escapes, pseudo입니다. | 1.088, 1.246, 1.092, 1.149입니다. | 시트마다 23~61 ns가 늘어납니다. | 시트를 범위에 넣을 때 문자열, 주석, 이스케이프를 같은 어휘 규칙으로 읽습니다. flat 경로는 0.96입니다. |
| 변경된 snapshot과 rest 스냅샷입니다. | 1.27과 1.25입니다. | 변경마다 약 7.4 µs가 늘어납니다. | 변경을 커밋할 때 게시합니다. 빈 커밋 효과를 넣은 비교 기준에 대해서는 1.03 이내입니다. |
| typed-array 검사입니다. | 최종 수용값은 1.057입니다. | 호출마다 약 0.66 ns가 늘어납니다. | 검사할 때 네이티브 슬롯을 읽어 다른 realm과 위조 태그를 구분합니다. |
| clone의 내장값과 클래스입니다. | 1.044와 1.037입니다. | 독립 검토의 한 24회 계열에서는 내장값 배열 복제마다 약 262 ns, 클래스 복제마다 약 14.5 ns가 늘어났습니다. | 복제할 때 프로토타입을 비교합니다. 일반 객체 경로는 1.03 이하입니다. |

#### 기존 경로가 느려진 행

| 경로 | 비율 | 절대 비용 | 호출 빈도와 판단 |
|---|---|---|---|
| scheduler의 모듈 수명 카운터입니다. | 수용값은 1.022입니다. | 구현 보고의 100,000회 표본에서는 예약마다 약 1.55 ns가 늘어났습니다. | 작업을 예약할 때 증가하며 해제 뒤 식별자 재사용을 막습니다. |

### @lerx/promise-modal과 @slats/agents-assets-sync

#### 빠진 작업을 채운 행

| 경로 | 비율 | 절대 비용 | 호출 빈도와 판단 |
|---|---|---|---|
| 안정된 등록을 포함한 일반 경로입니다. | 모두 1.03 이하이며 안정된 등록은 1.015입니다. | 허용 범위를 넘는 증가분은 없습니다. | 등록과 정착 때 실제 표시 상태를 반영합니다. |

#### 기존 경로가 느려진 행

| 경로 | 비율 | 절대 비용 | 호출 빈도와 필요한 작업 |
|---|---|---|---|
| frame remount입니다. | 1.64입니다. | 재연결마다 약 0.92 µs가 늘어납니다. | 초점을 보유했던 프레임이 다시 연결될 때만 초점이 남았는지 확인합니다. |

agents-assets-sync는 사람이 실행하는 명령줄 도구이므로 측정 면제입니다. 반복 파일 읽기와 출력 모드별 중복 계획은 코드 검토로 확인합니다.

### @canard/schema-form

#### 빠진 작업을 채운 행

| 경로 | 비율 | 절대 비용 | 호출 빈도와 판단 |
|---|---|---|---|
| 식별자를 포함한 일반 마운트입니다. | 0.996입니다. | 증가하지 않습니다. | Form을 마운트할 때 실행합니다. |
| 가상 필드 초기화입니다. | 0.998입니다. | 증가하지 않습니다. | 해당 초기화 때 실행합니다. |
| 자식 맵 렌더입니다. | 1.017입니다. | 최종 증가분은 미확인입니다. | 해당 렌더마다 실행하며 허용 범위 안입니다. |
| 나머지 검증 대상입니다. | 나눗셈 표현식을 제외한 31개 행은 모두 1.03 이하입니다. | 초과 수용 비용은 없습니다. | 마운트, 라디오 렌더, context 갱신과 와일드카드 검색을 포함합니다. |

#### 기존 경로가 느려진 행

| 경로 | 비율 | 절대 비용 | 호출 빈도와 필요한 작업 |
|---|---|---|---|
| 나눗셈이 있는 표현식 컴파일입니다. | 최종 확인은 1.041이고 검토자는 1.053으로 읽었습니다. | 표현식마다 약 10 ns가 늘어납니다. | 표현식을 컴파일할 때 한 번 정규식 시작과 나눗셈을 구분합니다. |

### 플러그인 묶음

UI 플러그인 네 개는 렌더 비용이 측정 오차에 묻히므로 면제입니다. 아래 표는 AJV만 다룹니다.

#### 빠진 작업을 채운 행

| 경로 | 비율 | 절대 비용 | 호출 빈도와 판단 |
|---|---|---|---|
| 컴파일 26개 행입니다. | 모두 1.03 이하입니다. AJV7 bindCompile은 0.993으로 종결했습니다. | 초과 증가분은 없습니다. | 검증 함수를 만들 때 실행합니다. |
| 반복 검증입니다. | 잘못된 값은 0.20~0.28입니다. | 증가하지 않습니다. | 이미 만든 함수로 값을 검사할 때 실행하며 오류 위치 정보를 재사용합니다. |

#### 기존 경로가 느려진 행

| 경로 | 비율 | 절대 비용 | 호출 빈도와 필요한 작업 |
|---|---|---|---|
| 첫 실패 검증의 두 행입니다. | 검토값은 1.26과 1.46입니다. | 약 0.3 µs와 1.1 µs가 늘어납니다. | 컴파일한 함수마다 처음 필요한 실패에서 한 번 오류 위치 정보를 만듭니다. |

### 측정 방법의 한계

promise-modal과 유틸리티 표는 수정된 측정 방법이 정해지기 전에 짧게 예열하여 측정했습니다. 두 방향 모두 측정 오류가 남을 수 있습니다. 1~3라운드의 표도 같은 한계를 가집니다. schema-form과 플러그인은 최적화가 끝나는 예열을 확인한 방법으로 측정했고 검토자가 독립적으로 다시 쟀습니다.

교훈은 느려졌다는 값만 의심해서는 안 된다는 것입니다. AJV6에서 1.42로 읽힌 행은 애플리케이션 형태로 재면 0.78이었습니다. 반대로 0.87로 읽힌 다른 행은 1.28이었고, 원인을 고친 뒤 1.026이 되었습니다. schema-form의 1.035, 1.046, 1.06은 각각 0.996, 1.017, 0.998이 되었습니다. 최적화 컴파일이 측정 구간으로 이동하거나 지나친 예열이 할당 경로를 왜곡하면 빠름과 느림 양쪽을 잘못 판단합니다.

수집 종료 뒤에는 바운티 전 HEAD와 최종 HEAD의 `@canard/schema-form` 코어만 비교하는 벤치마크를 계획합니다. 수정된 절차를 사용하고 이미 수용한 값보다 느린 행만 원인을 분석하고 고칩니다.

## 스펙표

다음 라운드는 이 표를 현재 계약으로 읽습니다. 근거와 비용은 결정과 근거 및 속도 절에 있고, 지원 밖의 범위는 알려진 한계에 있습니다.

### 유틸리티 묶음

| 입력과 상황 | 유지할 동작 |
|---|---|
| 지원하는 Array, Date, RegExp, Map, Set 하위 클래스를 clone합니다. | 하위 생성자 본문을 실행하지 않고 내장 슬롯과 원래 프로토타입을 유지합니다. |
| Error가 비열거 cause를 가집니다. | 복제해도 cause를 열거하지 않습니다. |
| preventConcurrent가 false이고 hook 안에서 재진입합니다. | 정상 완료 알림은 두 번이고 before 실패는 한 번이며 거절된 중첩 호출은 알림이 없습니다. |
| scheduler를 해제하고 다시 만듭니다. | 옛 식별자로 새 작업을 취소할 수 없습니다. |
| 원시값 아래에 JSON Pointer로 씁니다. | 공개 JSONPointerError 계약을 따릅니다. |
| mergePatch의 새 멤버가 undefined입니다. | 빈 객체를 만들지 않고 멤버를 생략합니다. |
| 참조 토큰이 비어 있습니다. | 점 표기의 구분자를 유지합니다. 기존 손실 한계는 별개입니다. |
| cache.set이 실패하거나 loadMany의 한 키가 동기 실패합니다. | 실패한 요청을 철회하고 다른 키를 진행하며 loadMany는 키별 Error를 반환합니다. |
| 렌더가 중단되거나 버려집니다. | 커밋하지 않은 snapshot을 공유 참조에 게시하지 않습니다. |
| CSS에 문자열, 주석, 이스케이프와 열린 끝이 있습니다. | 압축과 범위 처리가 같은 어휘 위치를 사용하며 조각 연결 전에 열린 구문을 닫습니다. |

### @lerx/promise-modal과 @slats/agents-assets-sync

| 입력과 상황 | 유지할 동작 |
|---|---|
| 숨겨진 요청이 정착합니다. | 표시된 요청의 초점이나 페이지 초점을 가져가지 않습니다. |
| 표시된 요청이 초점을 소유한 채 정착합니다. | 접근성 상태를 바꾸기 전에 소유권을 포착하여 호출한 요소로 돌려줍니다. |
| 숨긴 제공자를 다시 표시합니다. | 숨긴 사이 탐색과 정착한 표시 상태를 반영합니다. |
| 연결이 복원됩니다. | 초점이 남아 있으면 유지하고 잃었을 때만 복구합니다. |
| 문서에 호환되지 않는 상태 버전이 있습니다. | 새 제공자를 거절하고 요청을 거절합니다. |
| Markdown 안에 울타리 예시와 실제 블록이 함께 있습니다. | 원본 바이트의 문맥을 기준으로 실제 블록만 조정합니다. |
| 실행에 여러 패키지와 대상이 있습니다. | 하나의 계획과 실행 결과를 모든 출력 형식이 사용합니다. |
| 목적지 소유권이 충돌합니다. | 실행 전체에서 충돌을 판정하고 적용하지 않은 작업을 적용 수에 넣지 않습니다. |
| 문서가 읽기 전용이거나 링크가 끊어졌습니다. | 내용을 쓰지 않고 실패하며 기존 파일과 링크를 보존합니다. |

### @canard/schema-form

| 입력과 상황 | 유지할 동작 |
|---|---|
| 입력과 렌더러가 같은 필드를 나타냅니다. | 같은 내부 resolver에서 inputId와 labelId를 받습니다. |
| 입력이 여러 요소를 렌더합니다. | getInputId(key)의 필수 키로 추가 요소를 구분합니다. 키 1과 '1'은 같고 추가 요소는 주 입력과 다릅니다. |
| 사용자 코드가 id를 입력 속성에 넘깁니다. | id?: never로 거절하며 자식 및 덮어쓰기 속성도 소유 식별자를 바꿀 수 없습니다. |
| 값이나 오류만 갱신합니다. | getInputId 참조가 유지되고 경로나 Form 범위가 바뀌면 바뀝니다. |
| 가상 그룹에 초기화, 묶음 표시, 검증을 적용합니다. | 모두 실제 저장 주소로 해석하며 단독 실행과 합성 실행의 결과가 같습니다. |
| 네이티브 reset이 발생합니다. | FormHandle.reset과 같은 생명주기를 한 번 수행하고 preventDefault를 존중합니다. |
| 정규식이 키워드 뒤에 있거나 문자 클래스를 가집니다. | 정규식 내부를 필드 경로로 치환하지 않습니다. 경로로도 읽히는 리터럴은 경로 우선 규칙을 따릅니다. |
| context가 순환하거나 플러그인이 클래스와 모듈 객체입니다. | 비교가 종료되고 구조 계약을 만족하는 플러그인을 등록합니다. |
| 없는 필드 이름이 constructor 등입니다. | 프로토타입 멤버 대신 없는 데이터로 읽습니다. |
| 묶음의 일부 쓰기만 자동 쓰기를 허용합니다. | 허용을 다른 쓰기로 확장하지 않습니다. |

### 플러그인 묶음

| 입력과 상황 | 유지할 동작 |
|---|---|
| 네 UI 플러그인에서 문자열 스위치를 켭니다. | enum[0]을 저장하고 끄면 enum[1]을 저장합니다. |
| 스위치 이름을 지정합니다. | 저장 값으로 찾는 alias 맵을 네 플러그인 모두 사용하며 context.switchLabels가 우선합니다. MUI의 스키마 튜플은 두 맵이 없을 때 유지합니다. |
| lazy를 생략한 슬라이더를 움직입니다. | 확정할 때만 저장하고 lazy: false이면 움직일 때마다 저장합니다. 포인터와 키보드가 같은 규칙입니다. |
| 슬라이더 값이 없습니다. | 보조 기술에 현재 값을 알리지 않고 사용자 조작 전까지 저장하지 않습니다. 경계 안의 유효한 격자와 정수 제약을 함께 만족합니다. |
| 범위 선택 패널만 탐색합니다. | 저장하지 않습니다. 양 끝의 선택 확정이나 지우기만 저장합니다. |
| 열거 안팎의 값이 섞여 있습니다. | 알려진 값을 표시하고 건드리지 않은 미지의 값과 타입을 보존합니다. |
| 같은 검증 함수를 겹쳐 부릅니다. | 비동기 경계를 넘기 전에 호출별 오류를 읽어 잘못된 값을 성공으로 바꾸지 않습니다. |
| 등록을 해제하거나 복사본이 같은 인스턴스를 씁니다. | 등록 소유권을 공유하고 마지막 소유권이 끝난 자기 등록만 해제합니다. 애플리케이션의 등록은 지우지 않습니다. |
| 애플리케이션이 스키마를 늦게 등록합니다. | 루트와 guard 모두 현재 등록을 조회합니다. |
| 기본 검증기의 소수 multipleOf를 사용합니다. | 정확한 십진 배수를 허용하고 비배수와 0인 제수는 거절합니다. |
| 라이브러리가 내부 메뉴 식별자를 요구합니다. | 플러그인은 코어가 제공한 불투명한 식별자를 전달하며 필드 이름을 조합하거나 식별자를 해석하지 않습니다. |

## 호환성이 깨지는 변경과 뒤집은 테스트

### major

| 변경 | 소비자에게 필요한 이행 |
|---|---|
| 코어와 네 UI 플러그인의 식별자 속성입니다. | 입력의 id={path} 또는 id={id}를 id={inputId}로, 접미사를 붙인 추가 식별자를 getInputId(key)로 바꿉니다. 레이블은 labelId와 inputId를 연결합니다. |
| MUI 문자열 스위치 순서입니다. | 켜짐 값이 enum[0]이 되도록 enum과 이름의 순서를 맞춥니다. |
| MUI 슬라이더의 기본 저장 시점입니다. | 움직일 때마다 저장해야 하면 lazy: false를 명시합니다. |
| react-utils 스냅샷 게시 시점입니다. | 업데이트 렌더 중 current는 직전 커밋 값이므로 새 값 관찰은 커밋 이후에 합니다. |
| agents-assets-sync의 모호한 Markdown 거절입니다. | 닫히지 않은 울타리나 주석, 중첩 또는 들여쓰기 문맥의 모호한 울타리를 먼저 정리합니다. |

변경 기록은 `.changeset/schema-form-scoped-identifiers.md`, `.changeset/mui-consistent-string-switch-order.md`, `.changeset/mui-slider-commit-default.md`, `.changeset/committed-snapshot-references.md`, `.changeset/assets-markdown-boundaries.md`에서 소비자 이행을 설명합니다.

### 뒤집은 테스트

식별자 접미사와 label: 형식을 고정한 앞 라운드 단언은 불투명한 소유 식별자를 검증하도록 바꿨습니다. 대표 경로는 `packages/canard/schema-form/src/__tests__/e2e/radioNames.round-three.test.tsx`와 `packages/canard/schema-form/src/__tests__/Form.label.test.tsx`입니다. 이것은 소유자가 승인한 인터페이스 변경이며 앞 라운드 결함의 재도입을 허용한 것이 아닙니다.

MUI의 반대 문자열 순서는 결과표의 switchParity 검증으로 대체했습니다. 혼합된 열거 값이 있으면 알려진 값까지 표시하지 않던 단언은 알려진 값 표시와 미지 값 보존을 함께 확인하도록 바꿨습니다. 미설정 슬라이더의 임의 기본 저장 단언은 스펙표의 미설정 규칙으로 바꿨습니다.

원래 탐지 검증 중 호환되지 않는 모달 복사본의 동시 실행, 끊어진 링크의 대상 생성, 순환 입력의 RangeError를 요구하는 것은 현재 계약과 다릅니다. 이 검증이 그대로 실패하는 사실을 미수정 런타임 결함으로 세지 않으며, 결과표의 거절 또는 문서 검증을 고정 근거로 사용합니다.

## 결정과 근거

각 행은 계약 근거, 형제 사이의 예측 가능한 결과, 속도 검증의 순서로 읽습니다. 비용 수치는 속도 절이 소유합니다.

### 앞 라운드의 수정과 닿는 항목의 분류

| 항목 | 분류와 검증의 빈틈 |
|---|---|
| schema-form 1번입니다. | 3라운드 15번의 수정이 만든 회귀입니다. 식별자 방언을 구분하지 않은 거절이 원인이며 fragmentIdentifiers 검증이 방언별 허용과 거절을 고정합니다. |
| react-utils 1번입니다. | 3라운드의 타이머 수명 수정이 만든 회귀입니다. 정리 이후 자식 효과와 재마운트 시점의 예약을 빠뜨렸으며 timeoutLifecycle 검증이 그 순서를 포함합니다. |
| agents-assets-sync 6번입니다. | 3라운드 4번의 원자적 쓰기가 만든 회귀입니다. 교체 전 권한과 링크 상태를 다루지 않았으며 documentRewrite 검증이 읽기 전용, 권한 비트와 끊어진 링크를 포함합니다. |
| schema-form의 가상 주소, 제공자, 라디오, context와 식별자입니다. | 앞 결정은 유지하며 새 입력을 채운 결함입니다. 식별자의 공개 형태 변경은 별도로 소유자가 결정했습니다. |
| AJV의 늦은 등록과 경로 캐시, CSS 어휘 문맥, 자산 실행 계획과 재진입 hook입니다. | 같은 종류의 새 입력입니다. 앞 결정의 반대를 요구하는 진동으로 처리하지 않습니다. 마지막 세 영역의 반복 발견은 소유자 판단 및 다음 수집 우선순위에 반영합니다. |

### 유틸리티 묶음

| 결정 | 표준 또는 문서 계약 | 형제 경로의 예측 가능한 결과 | 해당 속도 행 |
|---|---|---|---|
| 내장 하위 클래스 clone을 지원 범위로 한정합니다. | 내장 슬롯과 프로토타입을 함께 유지해야 메서드가 작동합니다. | 로컬과 다른 realm의 다섯 내장 계열을 비교하고 일반 객체 경로는 유지합니다. 뷰 등의 예외는 알려진 한계에 둡니다. | clone의 내장값과 클래스 행입니다. |
| equals와 cloneLite의 순환 처리는 문서만 고칩니다. | 경량 경로에 순환 추적을 넣지 않는 기존 계약을 유지합니다. | 순환에는 stableEquals와 clone을 사용하며 무한 실행을 정상 성공으로 단언하지 않습니다. | 실행 코드를 바꾸지 않아 면제입니다. |
| hook 알림 소유권을 호출별로 분리합니다. | 동시 실행 허용은 중첩 호출도 허용하는 계약입니다. | before, after, 원 함수와 겹친 완료를 비교합니다. hook 없는 경로와 동시 실행 거절 경로를 구성 때 분리합니다. | 일반 경로와 동시 실행 알림 행을 검토했습니다. |
| scheduler 식별자는 모듈 수명을 따릅니다. | 취소는 발급받은 작업에만 작용해야 합니다. | 해제 전후 인스턴스와 전역 경로가 같은 결과를 냅니다. | scheduler 카운터 행입니다. |
| 호스트 실행 순서는 문서로 구분합니다. | Node와 브라우저의 작업 큐 계약이 다릅니다. | 호스트 차이를 없애겠다고 약속하지 않습니다. | 실행 코드 변경 없이 면제이며 검증의 빈틈은 알려진 한계에 둡니다. |
| loadMany는 키별 Error를 반환합니다. | 키별 실패 격리가 공개 계약입니다. | cache.get, cache.set과 묶음 실패를 조합해 나머지 키가 진행함을 확인합니다. | loaderMany와 loaderBatch는 허용 범위입니다. |
| CSS는 공통 어휘 위치를 사용합니다. | CSS Syntax의 문자열, 주석과 이스케이프 경계를 지킵니다. | 압축과 범위 처리 및 조각 연결이 같은 끝 위치를 사용합니다. | 네 scoper 행과 flat 행입니다. |
| snapshot은 커밋에서 게시합니다. | 버린 React 렌더가 공유 상태를 바꾸면 안 됩니다. | snapshot과 rest가 레이아웃 및 수동 효과에서 같은 커밋 값을 봅니다. | 변경 스냅샷과 빈 효과 비교 행입니다. |
| JSON의 빈 토큰과 undefined 멤버를 보존 규칙대로 처리합니다. | JSON Pointer의 빈 토큰 구별과 문서화된 mergePatch 계약을 따릅니다. | 새 멤버와 기존 멤버 및 중첩 입력을 비교합니다. | convertPointer와 mergePatch는 허용 범위입니다. |

문서만 고친 공개 이름과 예제는 common-utils 12번, react-utils 3·5번, style-utils 4번, data-loader 1·2번입니다. 공개하지 않은 이름을 새로 내보내는 대신 현재 공개 계약을 가르칩니다. 코드가 합리적인 경우 문서를 맞춘다는 결정 규칙을 따르며 실행 비용은 없습니다.

### @lerx/promise-modal과 @slats/agents-assets-sync

| 결정 | 표준 또는 문서 계약 | 형제 경로의 예측 가능한 결과 | 해당 속도 행 |
|---|---|---|---|
| 실제 표시와 초점 소유권으로 복귀를 판단합니다. | 숨긴 요청은 초점을 해제하고 표시된 모달만 초점 복귀를 소유합니다. | Activity, 숨김, 분리, 재중단과 재연결을 비교하며 남은 초점을 덮어쓰지 않습니다. | frame remount와 일반 정착 행입니다. |
| 호환되지 않는 복사본은 거절합니다. | 한 문서에는 호환되는 상태 버전을 사용한다는 계약입니다. | 스크롤, inert와 레이블을 독립 복사본끼리 부분 공유하지 않습니다. | 등록 시 검사이며 일반 등록 행입니다. |
| 끊어진 링크는 쓰지 않습니다. | 원자적 쓰기는 기존 파일 소유권과 권한을 보존해야 합니다. | 읽기 전용 파일과 끊어진 링크를 성공으로 바꾸지 않습니다. | 명령줄 도구로 면제입니다. |
| 울타리 문맥은 공통 스캔으로 판정하고 모호하면 거절합니다. | CommonMark 울타리와 원본 바이트 보존을 따릅니다. | BOM, 주석 예시, 목록과 중복 블록을 같은 모델로 읽습니다. | 명령줄 도구로 면제입니다. |
| 출력 형식은 같은 계획을 사용합니다. | 출력 형식은 실행 의미를 바꾸지 않습니다. | 인자, 대화형 입력, 대상 순서와 중복 대상의 결과를 비교합니다. | 명령줄 도구로 면제입니다. |

agents-assets-sync 12·13번은 공개 이름과 루트 우선순위 문서만 고칩니다. 14번은 ESM 전용 계약을 유지합니다. CommonJS를 지원하도록 표면을 늘리지 않으며 같은 공개 인터페이스를 모든 문서가 가르치도록 합니다.

### @canard/schema-form

| 결정 | 표준 또는 문서 계약 | 형제 경로의 예측 가능한 결과 | 해당 속도 행 |
|---|---|---|---|
| DOM 식별자는 소유자가 정한 inputId, labelId, getInputId(key)를 사용합니다. | 레이블과 ARIA가 같은 요소를 참조하고 식별자는 고유해야 합니다. | 내부 resolver 하나가 모든 계보를 만들고 아무것도 내보내지 않습니다. id?: never를 둡니다. 앞서 제안한 getFieldPartId는 철회했습니다. | 마운트와 라디오 렌더 행입니다. |
| native reset을 엔진 초기화와 연결합니다. | 네이티브 초기화와 제출 값이 일치해야 합니다. | handle 초기화와 네이티브 이벤트의 값, 변경 알림 및 취소를 비교합니다. | 초기화 행은 허용 범위입니다. |
| 가상 필드 연산은 실제 저장 주소를 먼저 풉니다. | 가상 그룹은 저장 공간을 별도로 소유하지 않습니다. | 초기화, 검증, 묶음 표시와 단독 연산을 비교합니다. | 가상 초기화와 저장 주소 행입니다. |
| 표현식은 경로 우선 해석을 유지합니다. | 경로로도 읽히는 리터럴의 기존 문서 계약입니다. | 키워드, 문자 클래스와 나눗셈을 구별하되 절대 경로 문법은 뒤집지 않습니다. | 나눗셈 컴파일과 표현식 스캔 행입니다. |
| 순환 context를 종료하고 구조형 플러그인을 받습니다. | context 비교와 구조적 타입 계약을 따릅니다. | 클래스, 모듈, 일반 객체 및 순환 종류를 비교합니다. | context 갱신과 등록 행은 허용 범위입니다. |
| node10은 문서화된 한계로 둡니다. | 의존 패키지의 하위 경로 exports를 해석하는 소비자 설정이 필요합니다. | 루트 선언을 찾는 것과 전이 타입이 보존되는 것을 구분합니다. | 선언과 문서만 다루므로 면제입니다. |

15번의 묶음 정체성 및 병합 설명은 앞 라운드의 구현 계약에 문서를 맞춘 처리입니다. 20번은 exactOptionalPropertyTypes의 명시적 undefined를 선언에서 받도록 하며 존재하는 타입만 추론합니다. 타입 변경은 실행 속도 면제입니다.

### 플러그인 묶음

| 결정 | 표준 또는 문서 계약 | 형제 경로의 예측 가능한 결과 | 해당 속도 행 |
|---|---|---|---|
| 문자열 스위치는 enum[0]을 켜짐으로 저장합니다. | 같은 스키마는 같은 값을 의미해야 합니다. | 네 플러그인의 상태와 alias 맵을 비교합니다. MUI boolean alias도 지원합니다. | UI 면제입니다. |
| lazy 생략은 확정 저장이며 소유자가 승인했습니다. | 같은 옵션 생략이 같은 저장 시점을 뜻해야 합니다. | 포인터, 키보드, 미설정 상태와 잠금 조합을 비교하며 MUI는 major입니다. | UI 면제입니다. |
| 미설정 슬라이더는 값을 만들지 않습니다. | 값 없음은 최소값과 다릅니다. | 네 플러그인의 접근성 값과 저장을 비교하고 사용자 조작 후 유효 격자만 저장합니다. | UI 면제입니다. |
| 범위는 선택 확정만 저장하고 열거 밖 값은 보존합니다. | 탐색은 값 변경이 아니며 다른 선택이 기존 데이터를 지우면 안 됩니다. | 날짜, 월, 시간 범위와 네 플러그인의 단일 및 다중 열거를 비교합니다. | UI 면제입니다. |
| AJV 오류를 호출마다 읽습니다. | 검증 결과는 그 호출의 입력에 속합니다. | 직렬 실행과 중첩 실행의 오류를 세 버전에서 비교합니다. | 반복 검증과 첫 실패 행입니다. |
| 등록 소유권을 공유하고 현재 등록을 조회합니다. | 애플리케이션 등록을 플러그인이 지우면 안 됩니다. | 여러 복사본, release, 늦은 동기 및 비동기 스키마와 guard를 비교합니다. | 컴파일 26개 행입니다. |
| 소수 multipleOf는 기본 인스턴스에서 정확히 처리합니다. | JSON Schema의 십진 배수와 코어의 입력 격자를 맞춥니다. | 세 버전이 같은 배수, 비배수와 0 제수를 검증합니다. | 기본 인스턴스 컴파일과 검증 행입니다. |

## 알려진 한계

### 유틸리티 묶음

clone의 생성자 미실행 보장은 다섯 내장 계열에 한정됩니다. TypedArray 하위 클래스는 slice와 species를 통해 생성자가 한 번 실행되고 프로토타입과 선택 바이트가 유지되며 byteOffset은 0입니다. DataView 하위 클래스는 생성자를 실행하지 않지만 결과는 기본 DataView이므로 하위 프로토타입과 상속 메서드를 잃습니다. Error와 ArrayBuffer 하위 클래스는 생성자를 한 번 실행합니다. 생성자 실행을 피하려면 기본 내장값이나 뷰로 정규화하여 복제하고 필요한 프로토타입을 명시적으로 복원해야 합니다.

equals와 cloneLite의 순환 입력은 종료하지 않을 수 있습니다. 점 표기 변환은 빈 토큰을 구분하지만 숫자 키와 인덱스, 점이나 괄호가 포함된 키의 기존 손실까지 없애지 않습니다.

감사는 빌드 산출물을 읽는 테스트 네 파일을 확인했습니다. style-utils의 `src/__tests__/lexicalRecovery.round4.test.ts`와 `src/styleManager/StyleManager/__tests__/lexicalTermination.round4.test.ts`, json-schema의 `src/__tests__/node10Root.round4.test.ts`와 `src/__tests__/exactOptional.round4.test.ts`입니다. 경로는 각 패키지를 기준으로 합니다. 산출물이 없거나 오래되면 현재 소스가 맞아도 실패합니다. 이는 깨끗한 상태의 영향 계획 검증과 별개로 테스트 자체가 빌드 상태를 요구하는 후속 점검 항목입니다.

scheduleMacrotask의 호스트 순서 문서 수정은 `hostOrder.round4.test.ts`가 문구만 확인합니다. Node와 브라우저의 실행 순서를 고정하는 런타임 테스트는 없습니다.

### @lerx/promise-modal과 @slats/agents-assets-sync

모달의 Activity 검증은 React 18에 해당 기능이 없어 조건부로 건너뜁니다. 실제 브라우저의 초점 복구와 탐색은 모의 환경의 검증만으로 모두 입증하지 않습니다. 호환되지 않는 복사본을 동시에 쓰는 지원은 추가하지 않습니다.

assets의 공유 목적지는 실행 전체에서 조정하지만 나중에 별도로 실행하는 단일 패키지의 --force까지 과거 모든 패키지의 소유권으로 조정하지 않습니다. 프로그램 인터페이스는 ESM 전용이며 nodenext가 CommonJS 정적 가져오기를 받아도 Node의 require 성공을 보장하지 않습니다.

### @canard/schema-form

moduleResolution: node10은 의존 하위 경로의 타입을 해석하지 못해 루트 API가 any가 될 수 있습니다. bundler, node16 또는 nodenext와 맞는 module 설정을 사용해야 합니다. skipLibCheck는 이 문제를 감출 수 있습니다. 표현식의 경로 우선 해석은 스펙표의 계약이며 정규식 문법 전체를 임의로 해석하는 보장은 아닙니다.

### 플러그인 묶음

antd5는 팝업이 닫혀 있어도 aria-controls가 팝업 목록 식별자를 가리킵니다. 목록은 열 때 생기며 라이브러리가 그 식별자를 만듭니다. 플러그인의 중복 식별자 결함과 구분합니다.

소수 배수의 정밀 처리는 플러그인이 만든 기본 인스턴스에만 적용합니다. 소비자가 주입한 인스턴스의 키워드와 정밀도 정책을 덮어쓰지 않습니다. UI의 로컬 제약 검증기는 해당 장면의 데이터 검증용이며 AJV 통합 전체를 대신하지 않습니다.

## 소유자가 정할 일

식별자 속성 변경, MUI 문자열 스위치 순서, MUI 슬라이더 기본 저장 시점과 react-utils 스냅샷 게시 시점의 major 변경을 출시 시 확인해야 합니다. 식별자 형태와 슬라이더 기본값은 이미 승인된 결정이며 미결정인 것처럼 취급하지 않습니다. 식별자 끝 구분, 키의 문자열 비교와 id?: never 방어도 해당 계약에 포함됩니다.

다음 속도 예외의 수용 범위를 출시 시 확인합니다. 세부 수치와 측정 한계는 속도 절이 기준입니다.

- 모달 재연결의 초점 확인 비용입니다.
- CSS 네 범위 처리 경로와 커밋 스냅샷 게시 비용입니다.
- 네이티브 typed-array 검사와 내장값 및 클래스 복제 비용입니다.
- 나눗셈 표현식 컴파일과 AJV 첫 실패의 오류 위치 생성 비용입니다.

추가 공개 옵션인 MUI boolean alias, 네 문자열 스위치의 alias 맵 통일, scheduler의 모듈 수명 카운터와 모호한 Markdown 거절도 확인 대상입니다. 명령줄 문서의 지휘 역할 규칙을 유지한 정책 변경도 포함합니다. 반복 발견이 있던 실행 계획, CSS 문맥과 재진입 hook의 지원 범위는 결정과 근거를 기준으로 다음 수집에 전달해야 합니다.

## 미룬 항목과 위험

### 고치지 않았거나 확정하지 않은 것

결과표에 처리하지 않은 발견은 없습니다. 알려진 한계의 네 빌드 의존 테스트와 호스트 순서의 런타임 검증 공백은 별도 후속 점검으로 남습니다. 속도 원자료에서 최종 절대 증가분을 확정하지 못한 행은 수치를 새로 만들지 않았으며 측정 방법의 한계 및 수집 종료 후 비교 계획으로 연결합니다.

### 다음 수집에서 다시 나올 수 있는 지점

5라운드는 새 식별자 표면과 다중 Form, 이동 및 수화의 참조 일치부터 확인합니다. 네 UI 플러그인의 슬라이더와 스위치 규칙은 동일 입력의 표로 공격합니다. AJV 등록 소유권은 복사본, 애플리케이션 등록, 늦은 스키마와 해제를 교차합니다. clone 하위 클래스와 CSS 어휘 복구는 알려진 한계를 지원 약속으로 오해하지 않고 그 안팎을 구분합니다.

### 5라운드에 영향을 주는 과정 기록

구현은 사용량 제한으로 한 번 중단되었고 네 단위를 모두 브랜치 상태와 인계 기록을 받은 새 작업자에게 넘겼습니다. 메시지를 보냈다는 사실만으로 재개했다고 판단하지 않습니다. 인계로 빠진 항목을 막기 위해 독립 표본 검토 외에 발견, 처리, 실패 커밋, 수정 커밋과 고정 검증을 모든 항목에 대해 추적하는 감사를 추가했습니다. 이 문서의 표는 그 추적을 저장소와 대조한 기록입니다.

테스트 격리 결함은 지속적 통합 검사에서 드러났습니다. 테스트가 형제 플러그인 패키지를 가져오는 29개 구문이 있었고 로컬 검사는 앞 빌드의 산출물을 찾아 통과했습니다. 워크트리 상위의 다른 체크아웃 산출물까지 해석되므로 현재 워크트리의 산출물만 지우는 것으로 충분하지 않았습니다.

`65799bfc3`의 방어 검증과 `c4d45f9ea`의 수정은 일곱 패키지 각각의 `src/__tests__/pluginImports.test.ts`로 형제 플러그인 가져오기를 거절합니다. AJV 비교는 각 패키지의 동일 데이터 사본과 무결성 검사로, UI 장면은 해당 패키지의 제약 검증기로 격리했습니다. 깨끗한 상태에서 정식 영향 계획을 순서대로 실행한 보고는 전체 계획 통과를 기록합니다. 이 문서가 그 실행을 다시 수행한 것은 아닙니다.

5라운드 이후의 종료 여부와 종료 후 코어 속도 비교는 FIX-PROCEDURE.md의 라운드 순환을 따릅니다.
