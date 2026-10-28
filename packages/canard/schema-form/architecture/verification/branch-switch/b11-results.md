# B11 — 떼어진 참조의 쓰기 무효

계약: [detached-references.md](../../plan/branch-switch/detached-references.md), 소유자가 수정한 규칙 3(`find`는 활성 노드 부재에 `null` 유지). 최종 창 2의 기준 A는 `df61df184584f9b9629e3dcc348c1ae8178a0dc7`, 후보 B는 `fd6098929`의 빌드다. 창 1은 A=`625930c01`, B=`9f02d1b4d`(제품 코드 `e26859e29`)로 수집한 수정 전 창이며 대체되었다.

## 동작과 비용

| 항목 | 결과와 근거 |
| --- | --- |
| 떼어진 쓰기 | `setValue`와 여섯 배열 동사를 사슬·배치·updater 평가 전에 거부한다. 동결 값·overlay·현재 인스턴스에 효과가 없다. 개발 모드에서 `FormWarningCode.DetachedNodeWrite`를 보고하고 운영 모드에서는 침묵한다. |
| 쓰기 주소 제거 | retain·transfer·discard·rekey·버려진 원본 조회 및 runtime WeakMap 상태를 제거했다. 배열 이동의 비활성 공표 dirty 표시는 독립적으로 보존했다. |
| 압축 보존 | kept 아이템의 압축·종류별 원본·keep 자손·생존 0개 길이 0 규칙을 유지한다. 바뀐 것은 옛 참조 쓰기의 무효 기대값이다. |
| 탐색 | 반환형·호출자는 그대로다. 비활성 선언 경로와 미선언 경로 모두 `null`인 회귀 시험을 추가했다. |
| 슬롯 소비 | 베이스의 `cloneFromSlot`이 이미 슬롯·overlay를 삭제한다. 제품 추가 없이 기존 충족으로 기록한다. 강화한 64회 시험과 별도 도달성 관측이 근거다. |
| 사양 | 영어·한국어 사양에 떼어진 참조 규칙과 재진입 후 재조회·비활성 JSON 쓰기 마이그레이션을 적었다. |

활성 쓰기는 공개 진입의 detached 검사 한 번을 더 수행하고 새 상태를 할당하지 않는다. 떼어진 쓰기는 상수 비용으로 끝나며 개발 경고에만 기록을 할당한다. 나감의 주소 포착·버림 순회와 복제·배열 이동의 주소 재키를 없앴다. 슬롯 복제와 kept 압축의 기존 비용은 유지한다.

## 수정 전 시험과 선언

새 동작 시험은 수정 전 4건 중 쓰기·배열 동사·개발 경고 3건이 실패하고, 수정 후 4/4 통과했다. unchanged find 회귀는 기준에서도 통과한다. 최초 수집 실패(의존 workspace dist 부재)는 로컬 의존 빌드 후 해소했으며 동작 실패 근거로 세지 않았다.

| 검사 | 결과 |
| --- | --- |
| 변경 표적 | 36파일, 275/275 통과 |
| build·artifact·타입·lint | 통과 |
| unit | 585파일, 3,876 통과, 기존 todo 1 |
| render | 131파일, 766/766 통과 |
| react18 | 131파일, 766/766 통과 |
| storybook | 100파일, 251/251 통과 |
| production | 10파일, 21/21 통과; ESM·Node ESM·CJS 직접 실행에서 무효·무경고 확인 |
| verify | 721파일, 4,686 통과, 기존 todo 1 |
| 격리·첫 쓰기 파서 | 별도 2파일 10/10 통과; 첫 siblings-0·oneOf-80 쓰기의 full-parser 호출 0 |

첫 unit 실행의 실패 2건은 허용된 경고 멤버에 따른 공개 snapshot과 경고 수 단언이었다. 그 두 기대값을 명시 갱신한 뒤 최종 unit 전체가 통과했다. 첫 production 실행은 jsdom에서 URL을 해석하던 시험 장치 문제였으며 패키지 작업 디렉터리로 바꾼 후 21/21 통과했다. 이 과정에 제품 바이트 수정은 없었다.

공개 선언은 재수출을 따라 94개 이름 전체를 비교했다. 달라진 이름은 `FormWarningCode` 하나이며 `DetachedNodeWrite: "SCHEMA_FORM_WARNING.DETACHED_NODE_WRITE"` 멤버만 추가되었다. `find` 반환형 변화는 없다. 선언 차분 0 관문은 소유자가 이 릴리스 전 PR에 면제했고, 실제 차분은 원시에 보존한다.

## 배달과 보유량

배달 코퍼스는 79장면 그대로이며 관측점은 **491 → 429**다. 나감 장면의 `detached-write`·`detached-write-after-drain` 62관측점을 제거했다. 남은 모든 관측에서 A/B 차이는 **0**이다. 원본 장치의 기준 대 기준 비교도 491점 차이 0으로 계수했다.

| 레인 | 반복 | 최초 도달 노드 | 열린 뒤 최소–최대 | 열린 뒤 슬롯·overlay | 옛 인스턴스 |
| --- | ---: | ---: | ---: | --- | --- |
| A | 64 | 9 | 9–9 | 0·0 | 미도달 |
| B | 64 | 9 | 9–9 | 0·0 | 미도달 |

비활성 자손의 슬롯은 그 자손의 조건을 따르되, 재진입한 `/group` 엔트리는 `inactiveValues`에 남지 않는다. 이 행은 기존 소비 구현의 충족을 확인하며 A 대비 추가 개선이라고 주장하지 않는다.

## 기대값 변경 목록

B7의 `surface.clearing-array-keep` 중 옛 survivor 참조 쓰기 두 경우는 13·25 대신 보유 값 12·24, 중첩 배열은 13 대신 12를 유지하도록 바꿨다. 압축·생존 0개 공개 결과 시험은 같은 기대값을 유지한다. `settle.zero-survivor-writes`는 제거된 discard 셀 단언을 지우고 모든 떼어진 쓰기가 slot writer를 호출하지 않음을 확인한다.

배열 이동·reset의 옛 참조 계약은 `settle.array-detached-reference`, `settle.detached-write-address`, `settle.array-detached-reset-address`, `arrange.retained-source-packed`, `arrange.retained-source-relocation`, `arrange.retained-source-tail`, `settle.array-rekey`에서 무효 기대값으로 바꿨다. `detached`, `visitSubtree`, `surface.slots-array-rearrangement`, `surface.slots-frozen-reads`, `surface.slots-inactive-values`, `surface.slots-wildcard-mixed-storage`, `surface.slots-wildcard-packed-array`도 보유 원본을 유지한다. `surface.slots-overlay`의 overlay 목적 시험은 옛 쓰기의 무효를 유지하면서 살아 있는 루트 JSON 쓰기로 overlay를 검증한다.

settle의 `settle.commit`, `settle.transition`, `settle.union-fold-latent`, `settle.value-model`, `settle.retained-slot-lazy-read`, `settle.retained-slot-active-address`, `settle.scalar-latent-scope`는 무효 원본·공표를 확인한다. `settle.pointer-slot-work`와 `readSourceTree`는 제거된 주소 셀 단언을 없애고 구체 슬롯 경로 쓰기와 동결 원본 읽기를 유지한다. `arrange.retained-transfer-cost`는 주소 재키 대신 슬롯 바인딩 이전의 선형 방문을 센다. append·pop·splice·same-value admission 시험은 떼어진 쓰기가 잠복 원본을 만들지 않아 이후 살아 있는 동사가 지름길 자격을 유지하는 새 결과를 고정한다. 시험 케이스는 삭제하지 않았다.

## 창 1 — 수정 전 머리, 대체됨

22행·440개 비교 프로세스·레인별 10프로세스·20예열/100표본·legacy quality를 한 번 수집했다. 주 단계 장부 18프로세스와 supplemental 양 레인 18프로세스, Node·Bun 힙 및 보유량을 같은 창에서 수집했다. 주 판정 회귀 0, quality·두 장부 총합·Node 힙 모두 통과했다. 검토 수정으로 제품 바이트가 바뀌므로 최종 판정에는 사용하지 않는다.

| 관문 | 창 1 |
| --- | --- |
| TEST-073 | 회귀 0 |
| quality | 통과 |
| oneOf-80 장부 총합 | A 폭 안 |
| siblings-0 장부 총합 | A 폭 안 |
| node 힙 (B 중앙 / A 최대, bytes/node) | 1439.35 / 1895.96 |
| bun 힙 (B 중앙 / A 최대, bytes/node) | 2244.90 / 2245.38 |

| 행 | 함수 | A self µs | B self µs | 차이 µs |
| --- | --- | ---: | ---: | ---: |
| switch-oneOf-80 | finalizeExits | 10.541 | 10.835 | +0.294 |
| switch-oneOf-80 | cloneFromSlot | 3.041 | 2.937 | -0.104 |
| switch-payload-12 | finalizeExits | 18.584 | 18.230 | -0.354 |
| switch-payload-12 | cloneFromSlot | 5.790 | 5.937 | +0.147 |
| switch-siblings-0 | finalizeExits | 0.000 | 0.000 | +0.000 |
| switch-siblings-0 | cloneFromSlot | 0.000 | 0.000 | +0.000 |

원시는 [window-1](raw/b11/window-1/)에 보존했다. 주 장부의 wheelPreparation 한 항목은 A 폭 밖 +0.083 µs였으며 총합·주 판정 관문은 통과했다. self 차분은 진단이며 개선을 요구하지 않는다.

## 독립 검토와 수정

[독립 검토](reviews/pr-b11-candidate-1-claude.md)는 CONDITIONAL PASS(P1 0, P2 5, P3 13)였다. 지정된 P2 5건 및 P3-1·2·5·6·7·8을 수정했다.

| 항목 | 커밋·검증 |
| --- | --- |
| P2-1 중첩 보고 flag 복원 | `a2bf69675`; 중첩 detached 경고 뒤 live 쓰기의 WriteInObserver 시험 red→green |
| P2-2 detached reset의 사슬·배치·검증 무효 | `eb495138c`; 배치 값과 validationTargets 시험 red→green, 관련 169건 통과 |
| P2-3 고아 lineage 제거 | `3aa4301fa`; typecheck와 슬롯·이동 관련 93건 통과 |
| P2-4 여섯 동사의 개별 경고 | `c73f2df7a`; 각 가드 제거 변이 6/6 실패, 복원 뒤 11/11 통과 |
| P2-5 built-bundle 수집 격리 | `5a1b6b04d`; unit·verify-unit 목록에 없음, production에만 있음 |
| 지정 P3 여섯 항목 | `1d52c7699`; 현재 규칙·TSDoc·캐시 문장·중복 조건 정리, zero-survivor 각 케이스의 공개 재진입 결과 4/4 통과 |

경고 시험 `warns exactly once and preserves every value for detached array <verb>`는 각각 push→dispatchPush, insert→dispatchInsert, pop→dispatchPop, remove→dispatchRemove, update→dispatchUpdate, clear→dispatchClear를 검증한다. 해당 가드 하나를 제거하면 그 시험은 경고 호출 0회로 실패한다. 공개 move 동사는 없다. mutation과 red 근거는 원시에 남긴다.

소유자 결정으로 남긴 두 동작은 바꾸지 않고 write DETAIL에 현재 규칙을 기록했다: 폐기되지 않은 detached 노드의 늦은 UI 입력은 개발 경고를 내며, 폐기된 detached 참조의 공개 setValue·배열 동사는 폐기 오류 대신 detached 거부가 먼저 적용된다(UI 입력 채널의 폐기 거부는 무음).

[차분 검토](reviews/pr-b11-candidate-2-claude.md)는 PASS(P1 0, P2 0, P3 후속 4)였다. 후속 P3-A·B·C·D는 지정 문구대로 문서·주석만 수정했다: 초기화의 커밋·배달·public path 불변식을 복원하고, 제거한 주소 상태의 주석을 지우고, 떼어진 쓰기 무효의 현재 규칙과 resetSubtree·상태·오류·요청의 폐기 검사 순서를 명시했다. 표적 5파일 32시험과 재빌드·artifact·typecheck·lint가 통과했다. 검토 사본은 1·2차 후보 이름으로 정리했으며 2차 원문의 기계 경로 접두사 나열만 경로 없는 표현으로 치환했다.

## 수정 후 최종 관문

새 머리에서 build·다섯 프로젝트·verify·선언 차분·격리·첫 쓰기 파서를 다시 한 번 실행해 모두 통과했다.

| 검사 | 최종 결과 |
| --- | --- |
| build·artifact·타입·lint | 통과 |
| unit | 584파일, 3,883 통과, 기존 todo 1 |
| render | 131파일, 766/766 통과 |
| react18 | 131파일, 766/766 통과 |
| storybook | 100파일, 251/251 통과 |
| production | 10파일, 21/21 통과; 세 runtime 번들 무동작·무경고 |
| verify | 720파일, 4,693 통과, 기존 todo 1 |
| 격리·첫 쓰기 파서 | 별도 2파일, 10/10 통과, full-parser 호출 0 |
| 선언 | 공개 이름 94→94, FormWarningCode 멤버 한 개 추가 |
| 배달 | 79장면, 429점, 차이 0 |
| 보유량 | A/B 모두 64회, 열린 뒤 도달 노드 9–9·slot/overlay 0·old 미도달 |

production 전용 분리로 unit과 verify-unit의 파일 수가 하나 줄었고, observer·reset·여섯 경고의 8개 시험이 추가되었다. 원시는 [window-2](raw/b11/window-2/)와 [review-fixes](raw/b11/review-fixes/)에 있다.

## 창 2 — 최종 판정

A=`df61df184`, B=`fd6098929`. UTC 2026-10-28T17:21:59.956Z부터 2026-10-28T18:00:35.440Z까지 재시도 없이 한 번 수집했다. 무시간 smoke와 공용 CPU 시작 지연을 통과했고, 비교 22행·440프로세스·레인별 10프로세스·20예열/100표본을 검증했다. 주 단계 18프로세스, supplemental A/B 각 9개(합계 18개)의 고유 PID와 표본 수도 확인했다. 공용 B6 요약의 supplementalProcesses=9는 B 레인 검증 수이며 양 레인 self 비교는 별도 요약이 검증한다.

최종 판정은 **채택**이다. TEST-073 주 회귀 **0**, legacy quality ratio 1.001803, quality·oneOf 장부·siblings 장부·TEST-073·Node 힙 **5/5 통과**다. 아래 지연은 프로세스별 표본 최솟값들의 중앙값(µs), Δ는 전체 throughput Welch 평균의 B/A 변화다. A와 A′는 앞·뒤 각 5프로세스이며 p는 전체 비교값이다.

| 행 | A µs | A′ µs | B µs | B/A전체 | throughput Δ | p | 주 회귀 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| single-flat-1000 | 111.500 | 80.750 | 102.771 | 0.9842 | -4.37% | 0.02535 | 없음 |
| mount-oneOf-80 | 2332.417 | 2337.334 | 2340.959 | 1.0026 | -0.88% | 0.02513 | 없음 |
| mount-flat-1000 | 2140.125 | 2122.583 | 2163.521 | 1.0120 | -0.06% | 0.9272 | 없음 |
| mount-nested-d6-f4 | 16410.417 | 16304.708 | 16277.021 | 0.9924 | +0.09% | 0.8688 | 없음 |
| single-nested-d6-f4 | 182.667 | 188.791 | 184.667 | 0.9913 | +0.94% | 0.5986 | 없음 |
| switch-oneOf-80 | 324.959 | 365.167 | 373.188 | 1.0758 | -1.41% | 0.365 | 없음 |
| bulk-flat-2000 | 1836.000 | 1778.834 | 1805.750 | 0.9845 | +1.79% | 6.448e-05 | 없음 |
| bulk-nested-d6-f4 | 3969.833 | 4026.791 | 4027.750 | 1.0042 | -0.12% | 0.8716 | 없음 |
| switch-discriminator-80 | 239.166 | 237.958 | 236.000 | 0.9893 | +4.15% | 5.759e-06 | 없음 |
| switch-if-80 | 376.959 | 378.375 | 370.021 | 0.9798 | +3.18% | 5.91e-06 | 없음 |
| switch-nested-oneOf-20 | 554.458 | 496.541 | 565.417 | 1.0596 | +1.18% | 0.3887 | 없음 |
| switch-siblings-0 | 99.875 | 104.208 | 97.333 | 0.9681 | +4.31% | 0.03312 | 없음 |
| switch-siblings-100 | 285.667 | 287.833 | 279.021 | 0.9730 | +2.12% | 0.1985 | 없음 |
| switch-siblings-1000 | 2076.459 | 2068.792 | 2067.792 | 0.9970 | +1.88% | 0.001438 | 없음 |
| switch-siblings-4000 | 6746.292 | 6862.792 | 6807.959 | 0.9997 | +0.37% | 0.1049 | 없음 |
| leaf-gate-250 | 32.041 | 34.750 | 33.229 | 0.9864 | -6.83% | 0.002557 | 없음 |
| leaf-gate-1000 | 34.000 | 33.958 | 33.958 | 0.9994 | +9.08% | 0.0005885 | 없음 |
| leaf-gate-4000 | 864.833 | 922.666 | 813.562 | 0.9234 | +0.51% | 0.5133 | 없음 |
| leaf-gate-8000 | 1562.417 | 1559.791 | 1566.270 | 1.0027 | -0.26% | 0.145 | 없음 |
| wave-1000 | 1714.334 | 1720.083 | 1722.583 | 1.0034 | +0.79% | 0.03528 | 없음 |
| single-flat-1000-subscribed | 87.083 | 88.541 | 88.604 | 1.0090 | +0.82% | 0.4157 | 없음 |
| switch-payload-12 | 574.833 | 586.750 | 589.146 | 1.0147 | +0.57% | 0.724 | 없음 |

| 단계 행 | 장부 A 중앙 µs | A 최소–최대 µs | 장부 B 중앙 µs | B ≤ A 최대 |
| --- | ---: | ---: | ---: | --- |
| switch-oneOf-80 | 182.208 | 175.375–182.334 | 173.458 | 통과 |
| switch-payload-12 | 283.874 | 269.666–287.583 | 273.312 | 통과 |
| switch-siblings-0 | 85.855 | 83.125–90.834 | 84.646 | 통과 |

장부 총합과 비계측 지연·배달은 세 행 모두 A 최대 이하다. 진단 항목 하나(`switch-payload-12`의 `primeHost`)는 A 중앙 2.375→B 2.416 µs(+0.041 µs)로 A 폭 밖이지만 채택 총합 관문은 통과했다. 진단 항목도 원시에 그대로 남긴다.

| 힙 | A 중앙 | A 최대 | B 중앙 | 판정 |
| --- | ---: | ---: | ---: | --- |
| node bytes/node | 1439.35 | 1895.98 | 1439.31 | 통과 |
| bun bytes/node | 2245.17 | 2245.35 | 2245.12 | 통과 |

| 행 | 함수 | A self µs | B self µs | 차이 µs | 변화 |
| --- | --- | ---: | ---: | ---: | ---: |
| switch-oneOf-80 | finalizeExits | 10.833 | 10.479 | -0.354 | -3.27% |
| switch-oneOf-80 | cloneFromSlot | 2.919 | 2.875 | -0.045 | -1.52% |
| switch-payload-12 | finalizeExits | 17.958 | 18.188 | +0.230 | +1.28% |
| switch-payload-12 | cloneFromSlot | 5.769 | 6.189 | +0.421 | +7.29% |
| switch-siblings-0 | finalizeExits | 0.000 | 0.000 | +0.000 | — |
| switch-siblings-0 | cloneFromSlot | 0.000 | 0.000 | +0.000 | — |

self 값은 전체 helper 계측 오버헤드를 포함한 세 프로세스 중앙값의 중앙값이며 개선을 요구하지 않는 진단이다. 보유량은 위 64회 관측처럼 A/B 모두 일정하다. 계측·비계측 장부, 모든 표본, 실행 명령과 CPU 사전 검사 원시는 [window-2](raw/b11/window-2/)에 보존했다. 측정 후에는 결과·원시·검토 장치만 추가하며 제품 바이트는 바꾸지 않았다.

## 환경과 재현

Apple M1 Max, 측정 Node 26.12.1, Bun 1.4.4, 빌드·제품 시험 Node 24.20.0. 다운로드·설치 없이 기존 도구와 로컬 workspace 의존 빌드를 사용했다. 추적되는 dist가 없어 빌드 생성물 커밋은 없다. 원시는 [raw/b11](raw/b11/)에 보존한다. `tools/b11/prepare.mjs`, `tools/b11/window.mjs`, `tools/b11/retention.mjs`는 기준 SHA를 확인하고 기존 B6 계측과 B8 CPU 장치를 재사용한다.

비교·단계 표본과 명령 영수증은 gzip JSON이며 CPU 사전 검사 전체는 xz JSON이다. 시험·빌드 로그도 gzip으로 보존했다. CPU 원시의 프로세스 PID·시간·사용률은 보존하고 실행 경로는 명령 basename으로 정규화했다. 실행 입력의 기계별 경로는 `<repository>`·`<runs>`·`<home>`·`<homebrew>`로 치환했다.

## FCA 감사

패키지 범위에서 filid:scan을 PR 이음매에 한 번 실행했다. facts 1,626파일을 추출·수락했고 세 단계의 snapshot hash가 같다. 판정은 FAIL, 분석 완전성은 indeterminate다. 정확한 순환 오류는 FieldProxy → FieldInputSlot → FieldProxy이며 이 서브트리는 기준 df61df184와 차분이 없다. 문서 경로 토큰과 검증 역할의 비정확 근거도 원시에 보존했다. B11 구현과 관계없는 기존 경계·문서 정리는 이 작업에서 수정하지 않았고, 감사 결과를 통과로 바꾸어 기록하지 않았다.

Scan complete: 202 findings

후속 해시 비교(`b24ef25fe` 대비, dist 1,293파일): 런타임 번들 셋과 공개 `index.d.ts`는 동일하고 내부 `.d.ts` TSDoc 세 파일 및 `agents-hashes.json`만 상이하므로, 코디네이터 결정으로 새 창을 생략하고 창 2 판정을 유지한다([해시 원시](raw/b11/followup/dist-comparison.json.gz)).
