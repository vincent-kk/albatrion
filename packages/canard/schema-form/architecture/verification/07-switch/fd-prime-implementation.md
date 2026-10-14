# F-D′의 구현과 검증 결과를 기록합니다.

2026년 10월 10일에 stage-07 작업 트리에서 편집 결정 Q134의 F-D′를 구현하고 검증하였습니다. 시작과 종료 HEAD는 `163a800b270039a20c793c07402f84fd16c336e9`이며 시작 작업 트리는 깨끗했습니다. PKG는 `packages/canard/schema-form`이고 D는 `PKG/architecture/verification/07-switch`입니다. S는 `/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad`입니다.

먼저 `D/fd-implementation.md`, `D/fd-a500-diagnosis.md`, `S/fd.patch`와 진단의 `probe.mjs`·`drive.mjs`를 읽었습니다. 패키지 CLAUDE.md와 seiri·filid 규칙을 확인하였으며, F-D 패치의 Button memo와 세 계수 테스트를 출발점으로 사용하였습니다.

## 행별 감싸개와 hook을 제거하였습니다.

패치에는 `src/formTypeDefinitions/DETAIL.md`, `src/formTypeDefinitions/FormTypeInputArray.tsx`, `src/formTypeDefinitions/__tests__/array-button-memo.test.tsx`의 세 파일이 들어 있습니다. 첫 제품 편집 전에 DETAIL의 계약과 수용 조건을 기록하였습니다. 공개 export와 정의 매칭 조건은 변경하지 않았습니다.

F-D의 RemoveButton 감싸개와 그 안의 useCallback을 제거하였습니다. 삭제 버튼은 memo Button 하나로 구성하며 현재 index와 배열 전체가 공유하는 안정된 onClick 처리기를 받습니다. index는 memo 속성 비교에 참여하므로 삭제로 위치가 바뀐 버튼이 갱신됩니다. 행별 callback·hook·추가 fiber를 만들지 않습니다.

공유 처리기는 React가 전달한 currentTarget의 부모 행을 목록의 직접 자식 중에서 조회하고 그 현재 위치를 node.remove에 전달합니다. 행이 배열 순서대로 직접 자식이고 추가 버튼 label이 마지막 행 다음에 있는 기존 구조를 사용하였습니다. DOM에 data attribute나 다른 속성을 추가하지 않았습니다. 클릭 대상이 버튼 안의 span이어도 currentTarget은 버튼입니다. 위치 조회와 목록 생성·속성 비교는 O(N)이며, 가운데 삭제 후 이동한 위치에서 다시 삭제하는 동작을 검증하였습니다. DOM·문구·순서·disabled·readOnly·maxItems 동작과 공개 표면을 유지하였습니다.

## HEAD의 실패와 F-D′의 통과를 확인하였습니다.

계수 테스트는 React의 원래 memo를 유지한 컴포넌트 호출과 JSX의 실제 button 생성 호출을 관측하고, 공개 Form handle의 값과 DOM을 검사합니다. 제품 소스 텍스트를 읽지 않습니다. F-D 테스트의 RemoveButton 호출 관측은 memo Button의 삭제 제어 호출 관측으로 바꾸었으며, 마운트한 모든 행과 push 전후의 클릭 처리기 identity가 하나임을 추가로 단언하였습니다.

PKG에서 `npx --no-install vitest run --project render --project react18 src/formTypeDefinitions/__tests__/array-button-memo.test.tsx --reporter=dot`를 실행하였습니다. 구현 전 HEAD에서는 React 18·19의 여섯 테스트가 모두 실패하였고 종료 코드는 1이었습니다. 최종 F-D′에서는 여섯 테스트가 모두 통과하였고 종료 코드는 0이었습니다. 최종 테스트를 유지한 채 제품 파일을 HEAD로 복원한 재확인에서도 여섯 테스트가 실패하였습니다.

100개 항목의 push에서 Button 실행은 HEAD 102회에서 F-D′ 1회로 줄었습니다. 기존 100개 삭제 버튼과 추가 버튼은 F-D′에서 각각 0회 다시 렌더되었으며 새 index 100만 실행되었습니다. 기존 버튼의 DOM identity도 유지되었습니다. 가운데 remove(37)에서는 남은 삭제 버튼 실행이 HEAD 99회에서 F-D′ 62회로 줄었고 추가 버튼은 F-D′에서 실행되지 않았습니다. 같은 위치를 다시 삭제하면 F-D′는 삭제 버튼을 61회 실행하고 item-38을 제거하여 그 위치의 값이 item-39가 되었습니다.

최종 HEAD 재확인의 첫 테스트는 실제 102회 실행으로 실패하였고, 가운데 삭제 테스트는 실제 99회 실행으로 실패하였습니다. 추가한 공유 처리기 검사는 HEAD에 해당 memo 경계가 없어 마운트 관측 0회로 실패하였습니다. 로그는 `S/fdp-count-head.log`, `S/fdp-count-head-final.log`, `S/fdp-count-fdp.log`에 보존하였습니다.

## 판정 전에 array-500의 17쌍 보유량 탐침을 실행하였습니다.

진단 도구를 `S/fdp-diag/`에 복사하였습니다. probe의 측정·마운트·갱신·GC 조건은 유지하고 drive의 후보 이름을 fdp로 바꾸었으며 두 명령 사이에 ABBA 순서를 유지하도록 시작 pair 인덱스만 추가하였습니다. 조건은 `none`이고 fixture는 `array-500`입니다. 프로세스마다 번들 하나를 사용하고 예열 10회·표본 30회로 HEAD와 F-D′를 비교하였습니다.

타이밍 드라이버와 모든 자식 프로세스는 `/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node`만 사용하였습니다. 한 번에 타이밍 프로세스 하나만 실행하고 타이밍 중에는 다른 명령·빌드·검증·집계를 실행하지 않았습니다. 처음 9쌍은 323.054초, 다음 8쌍은 291.135초에 자연 종료하였으며 두 명령의 종료 코드는 0이었습니다. 총 34개 프로세스가 17쌍을 구성하며 양쪽 표본은 각각 510개입니다.

프로세스별 update-wall 중앙값의 짝 차이를 HEAD − F-D′ 부호로 계산하였습니다. 17쌍 차이의 중앙값은 −23.0625 µs이고 bootstrap 95% 구간은 [−65.6875, +45.5000] µs입니다. 음수는 F-D′가 느린 방향이며 17쌍 중 10쌍이 음수였습니다. 고정 seed 132007로 짝을 20,000회 복원 추출하여 차이 중앙값의 percentile 구간을 계산하였습니다. 구간이 0을 포함하므로 속도 향상이나 채택을 주장하지 않습니다. verdict 세션은 실행하지 않았습니다.

17쌍에서 프로세스별 마운트 직후 h0.used 중앙값을 다시 집계하면 HEAD는 268,873,584B이고 F-D′는 268,838,260B였습니다. F-D′가 35,324B 낮았습니다. 마운트 전 m0.used를 뺀 증가량을 같은 방식으로 집계하면 HEAD는 156,676,004B이고 F-D′는 156,607,252B로 68,752B 낮았습니다. 모든 갱신 창에서 GC를 관측하였으며 양쪽 모두 510개 창입니다.

## 세 후보의 갱신 창 안 scavenge를 같은 조건으로 추적하였습니다.

기존 진단의 trace30 로그가 예열 5회를 사용한 것을 확인하고 같은 예열 5회·표본 30회·none 조건으로 HEAD·F-D·F-D′를 각각 새 프로세스에서 순차 실행하였습니다. `--trace-gc-nvp --mark --no-observer`로 WIN-START와 WIN-END 사이의 GC를 구분하였습니다. 세 후보 모두 표본 창마다 allocation-failure scavenge 하나를 기록하였습니다. 생존 바이트는 해당 scavenge의 `new_space_survived` 중앙값이며 promoted는 별도로 기록하였습니다.

| 관측값의 중앙값을 비교하였습니다. | HEAD | F-D | F-D′ |
| --- | ---: | ---: | ---: |
| 마운트 후 heap used를 바이트로 기록하였습니다. | 268,849,624 | 269,119,232 | 268,956,756 |
| 마운트 전 힙을 뺀 증가량을 바이트로 기록하였습니다. | 156,820,488 | 157,204,148 | 156,675,720 |
| 갱신 창 scavenge 생존량을 바이트로 기록하였습니다. | 524,252 | 881,788 | 476,340 |
| 갱신 창 scavenge 승격량을 바이트로 기록하였습니다. | 6,158,592 | 5,815,512 | 6,177,316 |
| 갱신 창 scavenge pause를 밀리초로 기록하였습니다. | 2.7735 | 2.7910 | 2.7635 |

이 추적에서 마운트 후 절대 힙은 F-D′가 F-D보다 162,476B 낮고 HEAD보다 107,132B 높았습니다. 프로세스 시작 힙의 차이를 뺀 마운트 증가량은 F-D′가 F-D보다 528,428B 낮고 HEAD보다 144,768B 낮았습니다. 17쌍의 절대 힙 중앙값과 함께 보면 F-D의 추가 행별 보유 비용을 줄였으나, 모든 독립 프로세스의 절대 힙이 HEAD 이하라는 주장은 하지 않습니다.

예열 10회·표본 30회의 추가 추적도 보존하였습니다. 마운트 후 절대 힙은 HEAD 269,002,068B, F-D 269,097,728B, F-D′ 268,737,792B였고 scavenge 생존량은 각각 475,708B, 479,696B, 474,536B였습니다. 예열 횟수에 따라 생존량과 승격량의 배분이 달라지므로 두 조건을 섞지 않았습니다. 이 heap used는 진단이 사용하는 마운트 직후 h0의 사용량이며 객체별 보유량 분해는 수행하지 않았습니다.

짝 자료는 `S/fdp-diag/none-p0-base.json`부터 `none-p16-fdp.json`까지 있습니다. 동일 조건의 세 후보 추적은 `trace30w5-*.json`·`trace30w5-*.log`이며 추가 예열 10회 추적은 `trace30-*.json`·`trace30-*.log`입니다. 집계와 bootstrap의 재현 스크립트는 `S/fdp-diag/summarize.mjs`이고 결과는 `S/fdp-diag/summary.json`입니다.

## 쓰기당 할당을 여섯 조건에서 관측하였습니다.

기존 `S/fd-allocation.mjs`를 복사한 `S/fdp-allocation.mjs`로 HEAD와 F-D′를 각각 독립 프로세스에서 실행하였습니다. Node v26.11.1과 V8 14.6.202.34-node.37을 사용하였으며 인수는 `--expose-gc --max-semi-space-size=256`입니다. 시간 값은 읽지 않았습니다. 각 조건은 새 마운트와 준비 뒤 전체 GC·네 번의 setImmediate drain을 수행하고 쓰기 구간의 heapUsed 증가량을 관측합니다. 예열 세 번을 제외한 아홉 표본의 쓰기당 바이트 중앙값을 기록하였으며 모든 관측 창의 GC 횟수가 0임을 단언하였습니다.

array-100의 push는 기본 100개에서 한 번 추가하고 remove는 index 37을 한 번 삭제합니다. replace는 길이를 유지하며 모든 name 값을 한 번 바꿉니다. array-push-100의 push는 빈 배열에서 100번 추가하고 remove는 관측 밖에서 100번 추가한 뒤 끝에서부터 100번 삭제합니다. 두 조건은 구간 합계를 쓰기 100번으로 나눕니다. array-push-100의 replace는 빈 배열에 100개를 한 번에 설정합니다.

| fixture와 연산을 기록하였습니다. | HEAD의 B/write | F-D′의 B/write | HEAD 표본 범위를 기록하였습니다. | F-D′ 표본 범위를 기록하였습니다. |
| --- | ---: | ---: | ---: | ---: |
| array-100의 push를 관측하였습니다. | 1,483,808 | 1,349,952 | 1,415,760–1,599,144 | 1,287,200–1,452,616 |
| array-100의 remove를 관측하였습니다. | 14,132,840 | 14,064,576 | 13,843,152–14,194,144 | 13,779,312–14,134,104 |
| array-100의 replace를 관측하였습니다. | 10,356,112 | 10,370,608 | 10,206,456–10,511,216 | 10,233,632–10,461,184 |
| array-push-100의 push를 관측하였습니다. | 938,332.16 | 897,417.20 | 934,189.36–940,256.72 | 893,669.76–903,865.28 |
| array-push-100의 remove를 관측하였습니다. | 357,886.08 | 317,243.76 | 348,540.96–359,130.56 | 308,457.04–320,030.80 |
| array-push-100의 replace를 관측하였습니다. | 63,900,776 | 63,977,976 | 63,289,664–64,144,288 | 63,131,680–64,165,560 |

모든 조건에서 두 후보의 최종 값과 DOM digest가 정확히 같음을 확인하였습니다. 이 수치는 React·JSDOM·drain을 포함한 GC 없는 쓰기 구간의 할당이며 보유량이나 시간 판정이 아닙니다. 원자료는 `S/fdp-allocation-base.json`과 `S/fdp-allocation-fdp.json`에 있습니다.

## 지정된 다섯 검증 명령을 통과하였습니다.

모든 제품 검증은 PKG에서 실행하였고 각 명령이 종료된 다음에 다음 명령을 시작하였습니다.

- `npx --no-install vitest run --project unit --project render --project react18 --reporter=dot`는 466개 파일과 3,425개 테스트가 통과하였고 기존 todo 한 개와 실패 0개를 보고하였습니다. 종료 코드는 0이고 실행 시간은 64.55초였습니다.
- `yarn test:production`은 단독 Bash 호출로 실행하였으며 9개 파일과 20개 테스트가 통과하였습니다. 종료 코드는 0이고 실행 시간은 2.37초였습니다.
- `npx --no-install tsc --noEmit --composite false --rootDir . -p tsconfig.json`은 오류 출력 없이 종료 코드 0으로 끝났습니다.
- `npx --no-install eslint "src/**/*.{ts,tsx}"`는 오류 출력 없이 종료 코드 0으로 끝났습니다.
- `node architecture/verification/07-switch/tools/check-legacy-isolation.mjs`는 종료 코드 0과 `LEGACY_ISOLATED: 1681 files checked`를 출력하였습니다.

전체 테스트의 수집 로그는 `S/fdp-full-vitest.log`이고 production 로그는 `S/fdp-production.log`입니다. 전체 테스트의 긴 표준출력 일부는 도구의 출력 한도로 잘렸으므로 전문 로그라고 주장하지 않습니다. 완료 요약과 종료 코드는 수집하였습니다. 기존 validator·Storybook·Node 경고가 있었으며 실패는 없었습니다.

## 기준 번들을 유지하고 측정한 후보 번들을 보존하였습니다.

`S/fdp.patch`는 현재 HEAD 163a800b2의 세 파일만 담고 이 보고서는 포함하지 않습니다. HEAD로 복원한 트리에서 `git apply --check S/fdp.patch`가 종료 코드 0으로 통과하였으므로 이 기준에 단독 적용할 수 있습니다.

`S/fdp-prepare.mjs`는 `D/tools/prepare-react-bundles.mjs`의 prepareReactBundles에 기준 커밋 163a800b2를 전달하였습니다. entry는 `measure-react-pair-126.entry.tsx`이고 equivalentHarness는 true입니다. 기준 `r132-base`는 그대로 두었으며 af057ab02부터 163a800b2까지 schema-form과 winglet 제품 소스에 차이가 없음을 확인하였습니다. manifest의 baseRevision과 번들 revision은 기존 r132-base의 af057ab02를 유지하고 implementationRevision과 후보 sourceRevision에 163a800b2와 fdp.patch를 기록하였습니다.

최종 기준 번들은 `S/bundles/r132-base.cjs`이며 962,784B이고 SHA-256은 `43b1dac346a93ca4fc751d0d979b6a0f322e2c8761405d2318879cfc556f0b1c`입니다. 최종 후보는 `S/bundles/r132-fdp.cjs`이며 962,944B이고 SHA-256은 `ac0b83c954a26b15dcb9100f8d467c8169b35fefcc965da13ac89b1288b44027`입니다. manifest는 `S/bundles/r132-fdp-manifest.json`입니다. esbuild 서비스가 stdin 종료 뒤 자연 종료 코드 0으로 끝나는 것을 도구가 확인하였고 verifyBundles131의 verdict 형식 검증을 통과하였습니다. 이 형식 검증은 verdict 세션 실행이 아닙니다.

최종 재빌드 중 두 실행에서는 사용하지 않는 isInteger 초기화 블록과 호출 258B가 추가되어 SHA가 달라졌습니다. 제품 소스 변경은 없었고 차이는 해당 블록으로 좁혔지만 esbuild가 실행별로 이를 포함한 원인까지 확정하지 않았습니다. 준비 스크립트에는 이 알려진 출력만 측정 번들과 바이트 단위로 일치하도록 복구하는 SHA 고정 절차를 추가하였습니다. 마지막 재빌드는 그 절차를 사용하지 않고 직접 측정 당시 SHA와 일치하는 출력을 만들었습니다. 추가 블록을 포함했던 원본은 `S/fdp-diag/rebuild-extra.cjs`에 보존하였습니다.

최종 번들은 마운트·타이밍·할당·touch-count 관측에 사용한 후보의 SHA와 정확히 일치합니다. 기준과 후보를 모듈별로 비교하여 FormTypeInputArray 부분만 다름을 확인하였습니다. 제품 소스와 번들에 작업 계측을 삽입하지 않았습니다.

## 런타임 작업량으로 touch-count를 만들었습니다.

`S/fdp-runtime-counts.mjs`는 기존 F-D 계수 스크립트를 사용하여 후보 이름과 출력 디렉터리를 변경하였습니다. 별도 프로세스에서 React profiling 런타임을 메모리 안에서 관측하여 컴포넌트 본문 호출·beginWork 방문·새 fiber 수를 셌습니다. 디스크의 React와 제품 번들은 수정하지 않았습니다. Profiler는 커밋 횟수만 세며 시간과 duration을 저장하지 않습니다.

19개 fixture의 마운트와 작성된 모든 상호작용을 실행하였습니다. 양쪽의 시작·종료 값, DOM, data-path와 커밋 횟수가 정확히 같음을 단언하였습니다. 단계별 calls는 컴포넌트별 호출 수 차이의 절대값 합에 방문·생성 수 차이의 절대값을 더한 비음수 정수입니다. 컴포넌트 이름의 Button과 memo Button 경계 차이도 포함하므로 절감량이나 시간 추정으로 해석하지 않습니다.

`S/session-132g-counts/react-counts.json`은 러너가 받는 행 키별 숫자 객체입니다. 총 304개 키를 모두 포함하며 88개는 양수이고 216개는 명시적으로 0입니다. scopeRows131에 24·8블록 설정으로 전달하여 모든 키와 계수가 인식됨을 확인하였습니다.

아래 표의 mount 행마다 `<fixture>/off/mount-wall`, `mount-active`, `profiler-mount`, `commits-mount`와 각 항목의 `-nogc` 행이 영향을 받았습니다. update 행마다 `<fixture>/off/update-wall`, `update-active`, `profiler-update`, `commits-update`와 각 항목의 `-nogc` 행이 영향을 받았습니다. 각 접미사는 같은 fixture의 `/off/` 뒤에 붙습니다. 각 표 항목은 여덟 행을 정확히 나타내며 그 밖의 모든 행의 계수는 0입니다.

| 영향을 받은 fixture를 기록하였습니다. | 영향을 받은 단계를 기록하였습니다. | 각 행의 calls를 기록하였습니다. |
| --- | --- | ---: |
| sample-2를 관측하였습니다. | mount에 영향이 있었습니다. | 4 |
| sample-3를 관측하였습니다. | mount에 영향이 있었습니다. | 14 |
| array-100을 관측하였습니다. | mount에 영향이 있었습니다. | 202 |
| array-500을 관측하였습니다. | mount에 영향이 있었습니다. | 1,002 |
| array-1000을 관측하였습니다. | mount에 영향이 있었습니다. | 2,002 |
| array-push-100을 관측하였습니다. | mount에 영향이 있었습니다. | 2 |
| array-push-100을 관측하였습니다. | update에 영향이 있었습니다. | 15,349 |
| array-replace-200을 관측하였습니다. | mount에 영향이 있었습니다. | 2 |
| array-replace-200을 관측하였습니다. | update에 영향이 있었습니다. | 402 |
| array-push-remove-100을 관측하였습니다. | mount에 영향이 있었습니다. | 2 |
| array-push-remove-100을 관측하였습니다. | update에 영향이 있었습니다. | 30,499 |

array-100·500·1000의 기존 잎 갱신은 두 후보의 React 작업량이 같으므로 update 행이 0입니다. 보유한 객체가 이후 GC에 주는 비용은 이 작업 계수가 측정하지 않으므로 마운트 보유량 탐침을 별도로 실행하였습니다.

array-push-100의 100번 push에서 Button 실행 합계는 HEAD 5,150회와 F-D′ 101회였습니다. 빈 배열의 첫 push는 양쪽에서 추가 버튼을 포함해 두 번 실행하고 이후 F-D′ push는 한 번씩 실행합니다. array-push-remove-100의 전체 200번 상호작용은 HEAD 10,200회와 F-D′ 101회였습니다. 뒤 100번 끝 항목 삭제에서는 F-D′의 Button 실행이 0회였습니다.

원자료는 `S/session-132g-counts/base-runtime.json`과 `fdp-runtime.json`이며 304개 행의 연결 근거와 실제 행 키 목록은 `touch-evidence.json`에 있습니다. 감시 행은 0 계수라도 러너의 기존 규칙에 따라 전체 범위가 될 수 있습니다.

## 작업 트리를 HEAD로 복원하고 이 기록만 남겼습니다.

git add·commit·stash·checkout·restore·reset과 설치는 실행하지 않았습니다. HEAD blob을 읽고 native 파일 편집으로 제품과 DETAIL을 복원한 뒤 새 계수 테스트를 삭제하였습니다. git diff의 종료 코드 0으로 추적 파일의 복원을 확인하고 패치 단독 적용 검사도 통과하였습니다. 기준 HEAD는 그대로 유지하였습니다.

패키지 관리자 명령은 모두 단독 Bash 호출로 실행하였으며 파이프·리다이렉트·추가 shell 명령·환경 접두사를 붙이지 않았습니다. 모든 실행 명령과 빌드 자식 프로세스의 종료를 기다렸으며 프로세스는 스스로 종료하였습니다. 단일 명령은 8분을 넘지 않았고 타이밍 작업과 다른 작업을 겹치지 않았습니다. 최종 작업 트리에는 `D/fd-prime-implementation.md`만 새 파일로 남깁니다. 생성 번들·패치·관측 자료·scratch 스크립트는 S에 보존하였습니다.
