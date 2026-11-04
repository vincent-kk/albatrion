# H1 — 호스트 정적 분할 측정

## 가설과 판정

정적 형제가 분기 전환의 선택·병합·등록·캡처 비용을 내지 않게 합니다. SETTLE-044의 고정 정적 출발점, 즉시 반영과 노드 수명은 유지합니다. 1차는 선택 호출만 상수화했으므로 전체 선형항 제거의 성공으로 판정하지 않습니다.

코디네이터의 1차 결과 후 결정: N=1,000·4,000의 `switch-siblings-N`이 같은 N의 기준선 `leaf-plain-N` 1.5배 안이면 H1 합격입니다. 호스트 값의 불변 재조립 비용은 잎 쓰기도 내는 비용입니다. 그 안에 못 들면 남은 항목과 수치를 D2로 넘깁니다. `preserveReferences`의 깊은 비교는 H2 범위로 유지합니다.

## 1차 전후

- 창 시작: `2026-10-26T16:14:00Z`, 다른 워커의 무거운 작업 중단 승인 뒤 실행했습니다.
- Node `v26.12.1`, production, 20회 예열·판별 100표본·독립 프로세스 3개, 같은 프로세스의 0.16.1 AB/BA 쌍. 표는 세 실행 최소값의 중앙값과 최댓값−최솟값 폭입니다.
- 수정 전: base `8d5c5dba1`, 제공된 원본 `index.node.mjs` SHA256 `a396cf65e154187e33647e034429e323d66357133867bc6ea254861c098dcca6`.
- 수정 후: `ebcd7100c`, SHA256 `8b259e043b2e42c13004f1805dbc4d9523680fd3c33487796fa19bd81b2ca966`.
- 실행 ID: `20261026T1621-ebcd710-h1-before`, `20261026T1621-ebcd710-h1-after`; 원시 자료는 `{scratch}/perf-runs/` 아래 해당 실행 디렉터리에 있습니다.

| 형제 수 | 전 ms | 전 폭 ms | 후 ms | 후 폭 ms | 후/전 |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 0 | 0.1076 | 0.0105 | 0.1083 | 0.0090 | 1.0065 |
| 100 | 0.3358 | 0.1230 | 0.3502 | 0.0440 | 1.0429 |
| 1,000 | 3.0336 | 0.0708 | 2.8550 | 0.0384 | 0.9411 |
| 4,000 | 10.2925 | 0.0862 | 9.7064 | 0.1790 | 0.9431 |

큰 두 행의 개선은 폭의 합보다 크지만, 4,000/0은 약 89.6배로 기존 합격 기준에 못 듭니다. 실제 탐침과 같은 공유 x/y 분기에서도 정적 엔트리 1,001개가 재사용되고 선택 호출 상한 24가 통과하므로 경로 미적용은 아닙니다.

## 1차 HEAD 프로파일 — switch-wide 자기 시간 상위 10

실행: 위 after 디렉터리의 `prof/switch-wide/loop.cpuprofile`, 4초, 20회 예열 뒤 200μs 표본. 총 4,021ms, GC 1.3%입니다.

| 함수 | 자기 % | 자기 ms | 소스 |
| --- | ---: | ---: | --- |
| `selectChildren` | 17.8 | 714.3 | `src/core/engine/settle/utils/compute/childSelection/selectChildren.ts:+1` |
| `hasOwnProperty` | 15.9 | 639.6 | `file://design-opt-d0-defects/packages/winglet/common-utils/dist/libs/hasOwnProperty.mjs` |
| `(anonymous)` | 14.6 | 587.8 | `src/core/engine/settle/utils/compute/childSelection/utils/createStaticEntryReuser.ts:+14` |
| `computeNodeBody` | 12.7 | 512 | `src/core/engine/settle/utils/compute/computeNode.ts:+1` |
| `writeObjectKey` | 10.3 | 414.2 | `src/core/engine/utils/writeObjectKey.ts:+1` |
| `primeHost` | 9.4 | 376.4 | `src/core/engine/settle/utils/compute/primeHost.ts:+2` |
| `assembleObject` | 7.6 | 306.5 | `src/core/engine/behaviors/objectBehavior/branch/utils/assembleObject.ts:+2` |
| `updateOutput` | 3.4 | 138.2 | `src/core/engine/settle/utils/output/updateOutput.ts:+1` |
| `(garbage collector)` | 1.3 | 54 | `(native)` |
| `set` | 1.1 | 43 | `src/core/engine/utils/pathIndex/PathKeyedMap.ts:+8` |

## 후속 범위

구조 사본, 정적 자식의 재검사, primeHost의 전폭 순회와 루트 이중 조립이 남았습니다. dirtyChildren은 현재 코드에서도 이미 dirtyChildrenByParent 색인으로 조회하므로 전체 형상 순회로 바꾸지 않습니다. 후보 보존 비용 시험의 filter 상한 15·77은 그대로 유지하고 기존 computeNode relocation 증명을 전달하여 새 filter 호출을 없앱니다. 코디네이터가 승인한 작업량 기록 단언 두 건만 상한으로 정정합니다(off stepVisits 484→≤480, table stepVisits 16→≤12)(400C-02, 정적 엔트리 2×라운드 2 생략).


## 2차 전후 — 구조 재사용·지연 공표

- 같은 승인 창 `2026-10-26T16:14:00Z`, Node v26.12.1 production, 동일한 예열/표본/반복/통계입니다.
- 실행 ID: `20261026T1646-8422d7e-h1-before2`, `20261026T1646-8422d7e-h1-after2`.
- 전은 같은 base 번들, 후는 `8422d7ea0` 빌드이며 SHA256 `bf0be0e7b0fed061a60cb2ee0c6177c204f3265f8d75f1ef6e90dd96c9190417`입니다.

| 형제 수 | 전 ms | 전 폭 ms | 후 ms | 후 폭 ms | 후/전 | 개선 % |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 0 | 0.1088 | 0.0292 | 0.1005 | 0.0320 | 0.9237 | 7.63 |
| 100 | 0.3953 | 0.0174 | 0.2989 | 0.0233 | 0.7561 | 24.39 |
| 1,000 | 3.0011 | 0.0536 | 2.0662 | 0.0545 | 0.6885 | 31.15 |
| 4,000 | 10.2836 | 0.2902 | 6.6652 | 0.4150 | 0.6481 | 35.19 |

1,000·4,000의 전후 차이는 각 폭의 합보다 크므로 개선은 관측됐습니다. 0은 폭 안입니다. 동시에 잰 0.16.1은 N1,000에서 2.4345→2.5363ms, N4,000에서 8.6451→7.7814ms로 움직였으며 후자의 폭은 0.8552·1.1185ms로 큽니다. 절대값의 환경 변동을 숨기지 않으며 paired current/legacy도 원시 표에 남겼습니다.

## 판정 — H1 기준 미달, D2 이관

기준선 워커의 `baseline.md` 표 2(base 8d5c5dba1)의 leaf-plain-N을 비교합니다.

| N | leaf-plain 기준 ms | 1.5배 상한 ms | H1 2차 ms | H1 / leaf | 판정 |
| ---: | ---: | ---: | ---: | ---: | --- |
| 1,000 | 0.0260 | 0.0390 | 2.0662 | 79.47 | 미달 |
| 4,000 | 0.8372 | 1.2558 | 6.6652 | 7.96 | 미달 |

선택 호출 수 상수화와 31~35% 개선을 전체 선형항 제거로 부르지 않습니다. 다음 비용은 그대로 남아 D2로 넘깁니다.

- primeHost가 고정 정적 baseline의 자식 맵·배열을 다시 만드는 O(정적 엔트리 수) 순회.
- 고정 출발점과 현재 인스턴스의 일치를 확인하는 O(정적 엔트리 수) 검사와 선언 ID 공표.
- 선택 마감의 prior 키 열거·자식 순서 확인, 최종 불변 호스트 값 조립.
- preserveReferences의 깊은 비교는 H2의 소유 범위이므로 변경하지 않았습니다.

호스트별 준비된 정적 발생 증인과 동적 엔트리만의 형상 전이는 D2에서 설계해야 합니다. 이번 PR은 이전 활성 집합을 출발점으로 사용하거나 고정 출발점 계약을 완화하지 않습니다.

## 승인한 시험 기록 정정

- 400C-02: 작업량 기록 단언 2건을 상한으로 정정했습니다(off stepVisits 484→≤480, table stepVisits 16→≤12). rootEvaluations·childEvaluations와 제품 관측 기대는 유지합니다.
- 400C-03: 내부 실행 이력 비교 2파일을 한정 조정했습니다. B5·10·20·40의 points만 비교에서 제외하고 48개 이하로 묶으며 공개 results·keptOut·기타 필드는 pinned HEAD와 같습니다. loading-12의 visits는 집합 동일·길이 상한으로 보고 surface·노드·모든 다른 필드는 원본 golden과 그대로 비교합니다. golden은 재생성하지 않았습니다.
- 독립 진단: `{scratch}/448-h1/head-comparison-all.json`은 네 B 값 모두 공개 results 동일을 보이며, `{scratch}/448-h1/loading-12.actual.json`은 surface 동일·visits 이외 차이 0입니다. 진단 실행 로그는 `observation-probe-all.log`에 있습니다. 임시 진단 시험은 커밋하지 않았습니다.

### 내부 실행 이력 비교 조정 — verify 확장

코디네이터가 400C-03을 verify의 특성화·wheel·준비 불변식·키 순서 4파일과 공통 snapshot helper에 한정 확장했습니다. visits는 기준선 방문열의 부분수열이고 길이가 기준선 이하이며, commits.changedNodes는 구성원이 같습니다. 이 두 필드만 원래 순서로 정규화한 뒤 모든 다른 필드와 원본 golden을 exact로 비교합니다. golden 파일은 하나도 바꾸지 않았습니다.

증인은 `src/core/engine/settle/__tests__/fixtures/gate-table/snapshotGateTableCase/fixtures/h1-private-histories.json`에 있으며, base `8d5c5dba1`의 원본 소스를 실제 실행하여 visits·changedNodes만 추출했습니다. 추출 명령·날짜는 이를 읽는 helper의 주석에 있습니다. 원본 소스 대조 40장면의 진단은 `{scratch}/448-h1/verify-source-comparison.json`, 기존 golden 대조는 `verify-comparison.json`, 원본/HEAD 관측은 `base-verify-*.json`·`verify-*.json`입니다. 원래 진단에서 부분수열이 아니었던 selection-16·20은 시험을 완화하지 않고 일반 식·gated overlay의 지연 공표를 제외하여 복원했습니다. 최종 관련 45시험이 엄격한 부분수열·구성원 비교와 그 밖의 exact 비교를 모두 통과했습니다(`verify-private-green2.log`).

최종 소스를 40장면 모두 다시 실행한 독립 대조는 `{scratch}/448-h1/verify-source-comparison-final.json`입니다. 40개 모두 visits 부분수열·길이 상한, changedNodes 구성원 동일, 그 밖 모든 필드 exact가 통과했습니다. 원본 최종 관측은 `final-verify-*.json`, 실행 로그는 `verify-probe-final.log`이며 임시 probe 시험은 제거했습니다.

## 최종 관문 — 소스 `013f1ea69`

명령은 모두 `yarn workspace @canard/schema-form`이며 시험 프로젝트는 순차 실행했습니다. 원시 로그는 `{scratch}/448-h1/` 아래 있습니다.

| 관문 | 결과 | 로그 |
| --- | --- | --- |
| `build` | 종료 0, 개발 플래그·gate-selection dist 검사 포함 | `final-build.log` |
| `typecheck` / `lint` | 각각 종료 0 | `final-typecheck.log` / `final-lint.log` |
| `test --run --project unit` | 491파일, 3,562통과·기존 todo 1 | `final-unit.log` |
| `test --run --project render` | 126파일, 753통과 | `final-render.log` |
| `test --run --project react18` | 126파일, 753통과 | `final-react18.log` |
| `test --run --project storybook` | 100파일, 251통과 | `final-storybook.log` |
| `test --run --project production` | 9파일, 20통과 | `final-production.log` |
| `test:verify --run` | 622파일, 4,359통과·기존 todo 1 | `final-verify.log` |
| `dist/index.d.ts` 기준선 대조 | 바이트 차이 0 | base/HEAD 보관본 `{scratch}/448-h1/base/`, `head-final/` |
| first-batch C 전후 배달 비교 | 72장면·323단계 차이 0 | `c-d/final-differential.json`, 상세 `c-d/out/differential-details.json` |

수정 전 호출 수 `[6, 206, 2006]`의 상한 실패와 수정 후 상한 통과를 확인했습니다. 최종 공유 분기 시험은 shadow·skip 모두 루트 공표 1회도 확인합니다. 복잡한 식·gated overlay, load·입력 분배·이동·relocation은 해당 최적화에서 보수적으로 물러납니다.

FCA 전체 validate는 `indeterminate`입니다(378 findings, reported failed 14, skipped 308). 변경한 blueprint·settle에는 오류가 없고 기존 동적 gate-wheel 시험표의 사례 수 경고가 남았습니다. 전체의 범위 밖 문서·순환·경계·사례 수 문제는 고치지 않았습니다. 최종 artifact는 `{agent-home}/plugins/filid/artifacts/fractal_inspect/b446af5f8497351ff98c7ebb4d0f14817a49f84b9ef94864b894f12ab163d1e5.json`이며 변경 시험 6파일은 사례 수가 각각 정확하고 제한 위반이 0입니다. seiri는 임시 계획의 G1~G4 증거로 검증하며 저장소 task ledger는 없습니다. 독립 antigravity 검토는 PR 생성 후 코디네이터에게 인계합니다.

속도 비용은 정적 자식의 선택·병합·등록·캡처를 없애되, 일치 검사와 baseline·최종 값 조립의 O(호스트 폭) 비용을 남깁니다. 메모리 비용은 청사진 수명의 정적 분할·스키마/엔트리 색인 O(정적 엔트리 수)와 선택 호출당 재사용 closure이며 live node·직전 게이트 판정은 캐시에 보유하지 않습니다. B2 힙·전체 canonical 행·독립 Node/Bun 벤치·React equivalent·플러그인 일곱의 확대 관문은 이 한정 작업에서 실행하지 않았으므로 단계 전체 채택을 주장하지 않습니다.

## 최종 전후 — 일반 식·gated overlay 제외를 포함한 번들

- 실행 ID `20261026T1719-013f1ea-h1-before3` / `20261026T1719-013f1ea-h1-after3`. 앞선 실행과 같은 승인 창·Node v26.12.1 production·20예열/100표본/3반복·0.16.1 AB/BA 쌍입니다. 측정 중 다른 무거운 작업은 없었습니다.
- 전은 base `8d5c5dba1`의 같은 원본 번들, 후는 최종 소스 `013f1ea69`, SHA256 `7da06ded9a19f6493086c8049c7ba04306cbbbbcd588a78f399e8d06f29d98dc`입니다.

| 형제 수 | 전 ms | 전 폭 ms | 후 ms | 후 폭 ms | 후/전 | 개선 % |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 0 | 0.0894 | 0.0464 | 0.1025 | 0.0229 | 1.1463 | -14.63 |
| 100 | 0.3125 | 0.0780 | 0.2947 | 0.0590 | 0.9431 | 5.69 |
| 1,000 | 3.0607 | 0.0135 | 2.0532 | 0.0375 | 0.6708 | 32.92 |
| 4,000 | 10.5232 | 0.0590 | 6.7940 | 0.0358 | 0.6456 | 35.44 |

0·100은 폭 안이므로 개선·회귀를 주장하지 않습니다. 큰 두 행의 차이는 각 폭의 합보다 큽니다. 같은 실행의 0.16.1은 N1,000에서 2.5046→2.4945ms, N4,000에서 8.9557→7.9441ms이며 폭은 각각 0.0217→0.0870ms, 0.1749→1.0127ms입니다. HEAD의 paired 비율은 각각 약 0.8232·0.8552입니다. 원시 `results.json`과 `rows.md`에 모든 반복과 쌍을 보존했습니다.

최종 H1/leaf는 N1,000 **78.97배**, N4,000 **8.12배**로 1.5배 상한에 미달합니다. 선택 호출은 상수화했으나 전체 선형항은 제거하지 못했습니다. 위 D2 이관 목록은 그대로 남으며, H2의 preserveReferences는 바꾸지 않았습니다.
