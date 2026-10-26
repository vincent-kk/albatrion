# H1 — 호스트 정적 분할 측정

## 가설과 판정

정적 형제가 분기 전환의 선택·병합·등록·캡처 비용을 내지 않게 합니다. SETTLE-044의 고정 정적 출발점, 즉시 반영과 노드 수명은 유지합니다. 1차는 선택 호출만 상수화했으므로 전체 선형항 제거의 성공으로 판정하지 않습니다.

코디네이터의 1차 결과 후 결정: N=1,000·4,000의 `switch-siblings-N`이 같은 N의 기준선 `leaf-plain-N` 1.5배 안이면 H1 합격입니다. 호스트 값의 불변 재조립 비용은 잎 쓰기도 내는 비용입니다. 그 안에 못 들면 남은 항목과 수치를 D2로 넘깁니다. `preserveReferences`의 깊은 비교는 H2 범위로 유지합니다.

## 1차 전후

- 창 시작: `2026-10-26T16:14:00Z`, 다른 워커의 무거운 작업 중단 승인 뒤 실행했습니다.
- Node `v26.12.1`, production, 20회 예열·판별 100표본·독립 프로세스 3개, 같은 프로세스의 0.16.1 AB/BA 쌍. 표는 세 실행 최소값의 중앙값과 최댓값−최솟값 폭입니다.
- 수정 전: base `8d5c5dba1`, 제공된 원본 `index.node.mjs` SHA256 `a396cf65e154187e33647e034429e323d66357133867bc6ea254861c098dcca6`.
- 수정 후: `ebcd7100c`, SHA256 `8b259e043b2e42c13004f1805dbc4d9523680fd3c33487796fa19bd81b2ca966`.
- 실행 ID: `20261026T1621-ebcd710-h1-before`, `20261026T1621-ebcd710-h1-after`; 원시 자료는 `/private/tmp/claude-501/perf-runs/` 아래 해당 실행 디렉터리에 있습니다.

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
| `hasOwnProperty` | 15.9 | 639.6 | `file:///Users/Vincent/Workspace/albatrion/design-opt-d0-defects/packages/winglet/common-utils/dist/libs/hasOwnProperty.mjs` |
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
