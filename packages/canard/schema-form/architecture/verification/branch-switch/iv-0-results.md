# Ⅳ-0 — 세 레인 이정표와 국소 정착 진단

제품을 바꾸지 않고 설계 Ⅳ의 기준선을 측정했습니다. 배달 코퍼스의 실제 비루트 적격은 **27/175 (15.43%)**입니다. 공개 22행의 빈 호스트 라운드는 8/80 (10.00%)이며, 그중 다음 라운드를 연 빈 변경 집합은 0건입니다.

computeNode 호출 5회는 루트 바퀴 5회가 아닙니다. oneOf-80은 루트 1회와 자식 재귀 4회이며, 정상 전환의 루트 호스트 바퀴는 이미 1라운드입니다. 루트 자체가 게이트 호스트인 oneOf-80·siblings-0에는 비루트에서 바퀴를 시작하는 것만으로 방문 범위를 줄일 여지가 없습니다.

## 입력과 환경

| 항목 | 값 |
| --- | --- |
| L | 공개 @canard/schema-form@0.16.1 |
| S | 0eb03ff3bb54bf06af95271d157aefece1b9bf32 |
| E | b026bd04ffba425ffcb4679f90be8c1bd0f406be |
| 정식 시작 UTC | 2026-10-29T04:16:42.392Z |
| 정식 종료 UTC | 2026-10-29T04:49:02.386Z |
| Node / Bun | v26.11.1 / 1.4.4 |
| CPU / OS | Apple M1 Max / 27.0.0 |
| legacy 품질 비 / 판정 | 0.998505 / 통과 |
| 제품 변경 / dist | src·manifest·빌드 설정 변경 없음; 단계 머리의 배포 해시 유지 |
| 배달 | 79장면·429단계 차이 0; B12 확장 7장면·21단계 통과 |

22행·레인별 10프로세스·20예열/100표본·quality=legacy를 고정했습니다. L은 S 역할 프로세스의 legacy 주 레인이며 E 역할의 legacy는 보조입니다. 무시간 스모크, 실제 CLI 각 1프로세스·1/1 예행, 새 root의 파일럿과 코디네이터 승인을 거쳤습니다. 표본 사이에는 타이밍 밖 setImmediate를 사용하고 개별 외부 PID의 3초 평균 30% 및 일반 120초/Spotlight 600초 규칙을 적용했습니다.

첫 창은 mediaanalysisd 부하로 환경 실패(458C-03)했습니다. 첫 행의 6개 프로세스가 current·legacy 각 600표본을 만든 뒤 A3가 적재 전 CPU 검사에서 실패했습니다. 이 부분 표본은 [실패 기록](raw/iv-0/aborted-window-1/failure.json)과 별도 압축 원시에 보존하며 아래 새 창의 판정에 합치지 않습니다.

## 1. 세 레인 — 전체 22행

단위는 µs/정의된 행 표본입니다. 셀은 프로세스 최소값 10개의 중앙값 / 프로세스 중앙값의 최소~최대입니다. oneOf·branch-switch는 왕복 2쓰기, single과 구독 single은 10쓰기, siblings·leaf·bulk·wave는 1쓰기, mount는 1마운트입니다. L 쌍이 없는 행은 대신 다른 fixture의 L을 끼우지 않습니다. 1.5배 선은 기록 전용입니다.

| 행 | L 0.16.1 | S 단계 시작 | E 설계 Ⅲ 끝 | E/L | E/S | L×1.5 |
| --- | --- | --- | --- | --- | --- | --- |
| single-flat-1000 | 500.500 / 519.084~534.271 | 54.354 / 66.834~79.854 | 56.812 / 69.500~81.063 | 0.114 | 1.045 | 750.750 |
| mount-oneOf-80 | 340.355 / 412.250~444.417 | 1987.270 / 2297.145~2514.000 | 2245.521 / 2555.958~2776.021 | 6.598 | 1.130 | 510.532 |
| mount-flat-1000 | 2089.541 / 2144.229~2241.021 | 2123.667 / 2318.563~2463.209 | 2119.708 / 2326.834~2398.541 | 1.014 | 0.998 | 3134.312 |
| mount-nested-d6-f4 | 6709.834 / 6994.125~9639.209 | 15920.771 / 16804.417~18458.291 | 16341.146 / 17214.334~18535.834 | 2.435 | 1.026 | 10064.750 |
| single-nested-d6-f4 | 21.041 / 26.437~32.333 | 108.437 / 124.500~162.583 | 112.104 / 124.270~146.250 | 5.328 | 1.034 | 31.562 |
| switch-oneOf-80 | 44.229 / 62.188~64.001 | 236.708 / 362.959~385.729 | 157.146 / 264.667~285.313 | 3.553 | 0.664 | 66.343 |
| bulk-flat-2000 | 1393.542 / 1531.459~2038.063 | 1763.084 / 1878.251~2015.521 | 1793.500 / 1869.105~2055.959 | 1.287 | 1.017 | 2090.312 |
| bulk-nested-d6-f4 | 3445.792 / 3725.417~3943.772 | 3985.270 / 4467.625~4903.124 | 3983.021 / 4472.145~5155.937 | 1.156 | 0.999 | 5168.687 |
| switch-discriminator-80 | 쌍 없음 | 834.167 / 970.604~1067.083 | 148.438 / 245.479~300.875 | — | 0.178 | — |
| switch-if-80 | 쌍 없음 | 1018.750 / 1129.188~1329.917 | 272.396 / 385.604~398.896 | — | 0.267 | — |
| switch-nested-oneOf-20 | 36.396 / 56.271~64.500 | 375.292 / 523.959~591.375 | 286.375 / 425.084~452.812 | 7.868 | 0.763 | 54.594 |
| switch-siblings-0 | 16.042 / 26.584~29.667 | 59.958 / 80.645~88.292 | 56.708 / 83.147~93.146 | 3.535 | 0.946 | 24.062 |
| switch-siblings-100 | 106.854 / 126.104~140.500 | 180.500 / 220.479~236.917 | 78.416 / 104.271~122.979 | 0.734 | 0.434 | 160.281 |
| switch-siblings-1000 | 2421.375 / 2553.333~2601.833 | 1991.729 / 2102.625~2204.021 | 314.542 / 365.542~390.584 | 0.130 | 0.158 | 3632.062 |
| switch-siblings-4000 | 7813.104 / 7927.688~8963.146 | 6721.999 / 6951.084~7186.646 | 2719.625 / 2926.624~3074.875 | 0.348 | 0.405 | 11719.656 |
| leaf-gate-250 | 72.312 / 80.104~100.625 | 23.209 / 28.354~34.895 | 22.604 / 28.917~33.437 | 0.313 | 0.974 | 108.469 |
| leaf-gate-1000 | 487.833 / 501.229~520.687 | 22.688 / 30.250~36.854 | 21.521 / 28.750~40.917 | 0.044 | 0.949 | 731.750 |
| leaf-gate-4000 | 2455.354 / 2478.333~2607.812 | 743.583 / 757.771~803.396 | 746.437 / 766.687~783.979 | 0.304 | 1.004 | 3683.031 |
| leaf-gate-8000 | 5109.125 / 5126.104~5353.667 | 1552.604 / 1578.000~1605.938 | 1556.437 / 1576.605~1602.916 | 0.305 | 1.002 | 7663.687 |
| wave-1000 | 쌍 없음 | 1622.750 / 1724.750~1765.022 | 1624.938 / 1712.875~1769.063 | — | 1.001 | — |
| single-flat-1000-subscribed | 쌍 없음 | 65.875 / 74.250~95.896 | 65.584 / 77.896~85.312 | — | 0.996 | — |
| switch-payload-12 | 171.333 / 183.500~196.208 | 668.583 / 764.355~807.146 | 359.187 / 436.750~485.916 | 2.096 | 0.537 | 257.000 |

### 단계 장부 — 쓰기 하나

각 셀은 세 프로세스의 100표본 중앙값을 다시 중앙값으로 집계한 raw self µs입니다. A(S)는 원래 단계 목록, B(E)는 B9-0 장부 목록입니다. 계측 집합과 생성 경계가 다르므로 A/B 단계 self·wrapped 총합의 비율을 만들지 않습니다. 레인 사이 비교는 위 alternate 표만 사용합니다. 개별 단계 중앙값의 합은 총시간 중앙값과 다릅니다.

#### switch-oneOf-80

| 단계 | S 원래 단계 목록 | E B9-0 장부 목록 |
| --- | --- | --- |
| markWrite | 5.312 | 2.542 |
| registerRecalculation | 15.709 | 15.375 |
| computeNode | 39.626 | 39.917 |
| wheelPreparation | 9.729 | 3.542 |
| primeHost | 3.833 | 1.708 |
| selectChildren | 42.313 | 34.645 |
| evaluateGate | 0.000 | 0.000 |
| runDeriveRounds | 0.000 | 0.000 |
| transitionSettlement | 5.812 | 4.855 |
| finalizeExits | 25.750 | 19.791 |
| getControlLayers | 14.354 | 1.562 |
| captureExitedRaw | 6.833 | 0.000 |
| setLatentRaw | 11.939 | 0.000 |
| updateOutput | 8.271 | 9.020 |
| assembleObject | 10.000 | 10.146 |
| commitSettlement | 9.895 | 10.916 |
| updateInactiveValuesMemo | 20.416 | 0.000 |
| markCommitDeliveries | 13.438 | 16.917 |
| createChildNode | 계측 없음 | 0.000 |
| enterFieldNode | 계측 없음 | 0.000 |
| restoreLatentState | 계측 없음 | 0.000 |
| createFieldNode | 계측 없음 | 0.000 |
| cloneFromSlot | 계측 없음 | 9.292 |
| enterSlotClone | 계측 없음 | 0.813 |
| createFromSlotOverlay | 계측 없음 | 0.000 |
| everythingElse | 23.230 | 18.313 |

wrapped 총시간 중앙값: S 279.000, E 205.083 µs.

#### switch-payload-12

| 단계 | S 원래 단계 목록 | E B9-0 장부 목록 |
| --- | --- | --- |
| markWrite | 6.999 | 2.520 |
| registerRecalculation | 23.396 | 22.500 |
| computeNode | 51.896 | 55.730 |
| wheelPreparation | 10.646 | 3.833 |
| primeHost | 3.521 | 1.666 |
| selectChildren | 66.357 | 58.728 |
| evaluateGate | 0.000 | 0.000 |
| runDeriveRounds | 0.000 | 0.000 |
| transitionSettlement | 8.084 | 8.417 |
| finalizeExits | 99.726 | 30.331 |
| getControlLayers | 47.976 | 3.728 |
| captureExitedRaw | 14.520 | 0.000 |
| setLatentRaw | 34.044 | 0.000 |
| updateOutput | 7.855 | 8.438 |
| assembleObject | 35.272 | 36.229 |
| commitSettlement | 17.833 | 15.313 |
| updateInactiveValuesMemo | 40.042 | 0.000 |
| markCommitDeliveries | 16.750 | 19.354 |
| createChildNode | 계측 없음 | 0.000 |
| enterFieldNode | 계측 없음 | 0.000 |
| restoreLatentState | 계측 없음 | 0.000 |
| createFieldNode | 계측 없음 | 0.000 |
| cloneFromSlot | 계측 없음 | 16.478 |
| enterSlotClone | 계측 없음 | 1.918 |
| createFromSlotOverlay | 계측 없음 | 0.000 |
| everythingElse | 29.146 | 19.583 |

wrapped 총시간 중앙값: S 507.958, E 302.062 µs.

#### switch-siblings-0

| 단계 | S 원래 단계 목록 | E B9-0 장부 목록 |
| --- | --- | --- |
| markWrite | 1.980 | 2.542 |
| registerRecalculation | 7.834 | 7.916 |
| computeNode | 16.748 | 17.501 |
| wheelPreparation | 4.000 | 2.999 |
| primeHost | 3.646 | 1.396 |
| selectChildren | 17.000 | 19.082 |
| evaluateGate | 5.770 | 7.250 |
| runDeriveRounds | 0.000 | 0.000 |
| transitionSettlement | 1.459 | 1.500 |
| finalizeExits | 0.000 | 0.000 |
| getControlLayers | 0.000 | 0.000 |
| captureExitedRaw | 0.000 | 0.000 |
| setLatentRaw | 0.000 | 0.000 |
| updateOutput | 4.666 | 4.771 |
| assembleObject | 3.125 | 3.209 |
| commitSettlement | 4.021 | 3.500 |
| updateInactiveValuesMemo | 0.250 | 0.000 |
| markCommitDeliveries | 10.146 | 10.354 |
| createChildNode | 계측 없음 | 0.000 |
| enterFieldNode | 계측 없음 | 0.000 |
| restoreLatentState | 계측 없음 | 0.000 |
| createFieldNode | 계측 없음 | 0.000 |
| cloneFromSlot | 계측 없음 | 0.000 |
| enterSlotClone | 계측 없음 | 0.000 |
| createFromSlotOverlay | 계측 없음 | 0.000 |
| everythingElse | 15.063 | 15.353 |

wrapped 총시간 중앙값: S 96.250, E 98.542 µs.

#### switch-siblings-1000

| 단계 | S 원래 단계 목록 | E B9-0 장부 목록 |
| --- | --- | --- |
| markWrite | 4.166 | 3.834 |
| registerRecalculation | 12.583 | 10.979 |
| computeNode | 309.355 | 24.979 |
| wheelPreparation | 8.292 | 4.667 |
| primeHost | 656.959 | 1.917 |
| selectChildren | 705.166 | 23.834 |
| evaluateGate | 8.646 | 9.479 |
| runDeriveRounds | 0.000 | 0.000 |
| transitionSettlement | 2.416 | 2.083 |
| finalizeExits | 0.000 | 0.000 |
| getControlLayers | 0.000 | 0.000 |
| captureExitedRaw | 0.000 | 0.000 |
| setLatentRaw | 0.000 | 0.000 |
| updateOutput | 8.458 | 7.791 |
| assembleObject | 260.709 | 257.853 |
| commitSettlement | 83.479 | 5.396 |
| updateInactiveValuesMemo | 0.416 | 0.000 |
| markCommitDeliveries | 63.646 | 12.291 |
| createChildNode | 계측 없음 | 0.000 |
| enterFieldNode | 계측 없음 | 0.000 |
| restoreLatentState | 계측 없음 | 0.000 |
| createFieldNode | 계측 없음 | 0.000 |
| cloneFromSlot | 계측 없음 | 0.000 |
| enterSlotClone | 계측 없음 | 0.000 |
| createFromSlotOverlay | 계측 없음 | 0.000 |
| everythingElse | 28.396 | 22.395 |

wrapped 총시간 중앙값: S 2132.834, E 389.646 µs.

### Node/Bun 힙

| 런타임 | S bytes/node | E bytes/node | S 범위 | E 범위 |
| --- | --- | --- | --- | --- |
| node | 1446.047 | 1437.605 | 1433.153~1889.456 | 1431.010~1898.593 |
| bun | 2224.148 | 2247.990 | 2223.316~2224.812 | 2247.217~2248.541 |

기존 장치의 5,001노드·7표본입니다. Bun은 보고용이며, 제품 dist는 finally에서 복원하고 해시를 대조했습니다.

## 2. 영향 집합의 닫힘

첫 수치는 비루트로 닫히는 useful입니다. 루트로 닫히는 구조적 자격과 구분합니다. 실제 branch host 변화와 순수 조상 출력 집계를 따로 기록하고, 바뀐 범위를 포함하는 최소 호스트에서 정적 바깥 의존과 제품 dependencyOwners를 확인했습니다. 무관한 외부 원천에서 들어오는 읽기는 허용하고 조상 원천·밖으로 나가는 영향·required 경계는 거절합니다. wildcard 또는 함수형 injectTo 규칙이 남으면 보수적으로 unknown입니다. 마운트는 쓰기 분모에서 제외합니다.

| 행 | useful / 쓰기 | 보수적 closed / 쓰기 | 최소 범위 | 거절 사유 |
| --- | --- | --- | --- | --- |
| single-flat-1000 | 0/40 (0.00%) | 40/40 (100.00%) | 루트 | {} |
| mount-oneOf-80 | 해당 없음 | 해당 없음 | — | {} |
| mount-flat-1000 | 해당 없음 | 해당 없음 | — | {} |
| mount-nested-d6-f4 | 해당 없음 | 해당 없음 | — | {} |
| single-nested-d6-f4 | 40/40 (100.00%) | 40/40 (100.00%) | /n0/n0/n0/n0/n0, /n0/n0/n0/n0/n1, /n0/n0/n0/n0/n2 | {} |
| switch-oneOf-80 | 0/8 (0.00%) | 8/8 (100.00%) | 루트 | {} |
| bulk-flat-2000 | 0/4 (0.00%) | 4/4 (100.00%) | 루트 | {} |
| bulk-nested-d6-f4 | 0/4 (0.00%) | 4/4 (100.00%) | 루트 | {} |
| switch-discriminator-80 | 0/8 (0.00%) | 8/8 (100.00%) | 루트 | {} |
| switch-if-80 | 0/8 (0.00%) | 8/8 (100.00%) | 루트 | {} |
| switch-nested-oneOf-20 | 8/8 (100.00%) | 8/8 (100.00%) | /outer/inner | {} |
| switch-siblings-0 | 0/4 (0.00%) | 4/4 (100.00%) | 루트 | {} |
| switch-siblings-100 | 0/4 (0.00%) | 4/4 (100.00%) | 루트 | {} |
| switch-siblings-1000 | 0/4 (0.00%) | 4/4 (100.00%) | 루트 | {} |
| switch-siblings-4000 | 0/4 (0.00%) | 4/4 (100.00%) | 루트 | {} |
| leaf-gate-250 | 0/4 (0.00%) | 4/4 (100.00%) | 루트 | {} |
| leaf-gate-1000 | 0/4 (0.00%) | 4/4 (100.00%) | 루트 | {} |
| leaf-gate-4000 | 0/4 (0.00%) | 4/4 (100.00%) | 루트 | {} |
| leaf-gate-8000 | 0/4 (0.00%) | 4/4 (100.00%) | 루트 | {} |
| wave-1000 | 0/4 (0.00%) | 4/4 (100.00%) | 루트 | {} |
| single-flat-1000-subscribed | 0/40 (0.00%) | 40/40 (100.00%) | 루트 | {} |
| switch-payload-12 | 0/8 (0.00%) | 8/8 (100.00%) | 루트 | {} |

### 배달 코퍼스 — 장면별

| 장면 | useful / 쓰기 | 보수적 closed / 쓰기 | 범위 | 거절 사유 |
| --- | --- | --- | --- | --- |
| plain-F1-C16-exit | 0/3 (0.00%) | 3/3 (100.00%) | 루트 | {} |
| plain-F1-C16-control | 1/1 (100.00%) | 1/1 (100.00%) | /h | {} |
| plain-F4-C16-exit | 0/3 (0.00%) | 3/3 (100.00%) | 루트 | {} |
| plain-F4-C16-control | 1/1 (100.00%) | 1/1 (100.00%) | /h | {} |
| plain-F16-C16-exit | 0/3 (0.00%) | 3/3 (100.00%) | 루트 | {} |
| plain-F16-C16-control | 1/1 (100.00%) | 1/1 (100.00%) | /h | {} |
| plain-F64-C16-exit | 0/3 (0.00%) | 3/3 (100.00%) | 루트 | {} |
| plain-F64-C16-control | 1/1 (100.00%) | 1/1 (100.00%) | /h | {} |
| plain-F4-C4-exit | 0/3 (0.00%) | 3/3 (100.00%) | 루트 | {} |
| plain-F4-C4-control | 1/1 (100.00%) | 1/1 (100.00%) | /h | {} |
| plain-F4-C64-exit | 0/3 (0.00%) | 3/3 (100.00%) | 루트 | {} |
| plain-F4-C64-control | 1/1 (100.00%) | 1/1 (100.00%) | /h | {} |
| plain-F4-C256-exit | 0/3 (0.00%) | 3/3 (100.00%) | 루트 | {} |
| plain-F4-C256-control | 1/1 (100.00%) | 1/1 (100.00%) | /h | {} |
| latent-F1-C16-exit | 0/3 (0.00%) | 3/3 (100.00%) | 루트 | {} |
| latent-F1-C16-control | 1/1 (100.00%) | 1/1 (100.00%) | /h | {} |
| latent-F4-C16-exit | 0/3 (0.00%) | 3/3 (100.00%) | 루트 | {} |
| latent-F4-C16-control | 1/1 (100.00%) | 1/1 (100.00%) | /h | {} |
| latent-F16-C16-exit | 0/3 (0.00%) | 3/3 (100.00%) | 루트 | {} |
| latent-F16-C16-control | 1/1 (100.00%) | 1/1 (100.00%) | /h | {} |
| latent-F64-C16-exit | 0/3 (0.00%) | 3/3 (100.00%) | 루트 | {} |
| latent-F64-C16-control | 1/1 (100.00%) | 1/1 (100.00%) | /h | {} |
| latent-F4-C4-exit | 0/3 (0.00%) | 3/3 (100.00%) | 루트 | {} |
| latent-F4-C4-control | 1/1 (100.00%) | 1/1 (100.00%) | /h | {} |
| latent-F4-C64-exit | 0/3 (0.00%) | 3/3 (100.00%) | 루트 | {} |
| latent-F4-C64-control | 1/1 (100.00%) | 1/1 (100.00%) | /h | {} |
| latent-F4-C256-exit | 0/3 (0.00%) | 3/3 (100.00%) | 루트 | {} |
| latent-F4-C256-control | 1/1 (100.00%) | 1/1 (100.00%) | /h | {} |
| items-F1-C16-exit | 0/3 (0.00%) | 0/3 (0.00%) | 루트 | {"unknown-dependency":3} |
| items-F1-C16-control | 0/1 (0.00%) | 0/1 (0.00%) | /h | {"crossing-unknown":1,"unknown-dependency":1} |
| items-F4-C16-exit | 0/3 (0.00%) | 0/3 (0.00%) | 루트 | {"unknown-dependency":3} |
| items-F4-C16-control | 0/1 (0.00%) | 0/1 (0.00%) | /h | {"crossing-unknown":1,"unknown-dependency":1} |
| items-F16-C16-exit | 0/3 (0.00%) | 0/3 (0.00%) | 루트 | {"unknown-dependency":3} |
| items-F16-C16-control | 0/1 (0.00%) | 0/1 (0.00%) | /h | {"crossing-unknown":1,"unknown-dependency":1} |
| items-F64-C16-exit | 0/3 (0.00%) | 0/3 (0.00%) | 루트 | {"unknown-dependency":3} |
| items-F64-C16-control | 0/1 (0.00%) | 0/1 (0.00%) | /h | {"crossing-unknown":1,"unknown-dependency":1} |
| items-F4-C4-exit | 0/3 (0.00%) | 0/3 (0.00%) | 루트 | {"unknown-dependency":3} |
| items-F4-C4-control | 0/1 (0.00%) | 0/1 (0.00%) | /h | {"crossing-unknown":1,"unknown-dependency":1} |
| items-F4-C64-exit | 0/3 (0.00%) | 0/3 (0.00%) | 루트 | {"unknown-dependency":3} |
| items-F4-C64-control | 0/1 (0.00%) | 0/1 (0.00%) | /h | {"crossing-unknown":1,"unknown-dependency":1} |
| items-F4-C256-exit | 0/3 (0.00%) | 0/3 (0.00%) | 루트 | {"unknown-dependency":3} |
| items-F4-C256-control | 0/1 (0.00%) | 0/1 (0.00%) | /h | {"crossing-unknown":1,"unknown-dependency":1} |
| prefixItems-F1-C16-exit | 0/3 (0.00%) | 3/3 (100.00%) | 루트 | {} |
| prefixItems-F1-C16-control | 1/1 (100.00%) | 1/1 (100.00%) | /h | {} |
| prefixItems-F4-C16-exit | 0/3 (0.00%) | 3/3 (100.00%) | 루트 | {} |
| prefixItems-F4-C16-control | 1/1 (100.00%) | 1/1 (100.00%) | /h | {} |
| prefixItems-F16-C16-exit | 0/3 (0.00%) | 3/3 (100.00%) | 루트 | {} |
| prefixItems-F16-C16-control | 1/1 (100.00%) | 1/1 (100.00%) | /h | {} |
| prefixItems-F64-C16-exit | 0/3 (0.00%) | 3/3 (100.00%) | 루트 | {} |
| prefixItems-F64-C16-control | 1/1 (100.00%) | 1/1 (100.00%) | /h | {} |
| prefixItems-F4-C4-exit | 0/3 (0.00%) | 3/3 (100.00%) | 루트 | {} |
| prefixItems-F4-C4-control | 1/1 (100.00%) | 1/1 (100.00%) | /h | {} |
| prefixItems-F4-C64-exit | 0/3 (0.00%) | 3/3 (100.00%) | 루트 | {} |
| prefixItems-F4-C64-control | 1/1 (100.00%) | 1/1 (100.00%) | /h | {} |
| prefixItems-F4-C256-exit | 0/3 (0.00%) | 3/3 (100.00%) | 루트 | {} |
| prefixItems-F4-C256-control | 1/1 (100.00%) | 1/1 (100.00%) | /h | {} |
| overlap-F4-C16-exit | 0/3 (0.00%) | 3/3 (100.00%) | 루트 | {} |
| overlap-F4-C16-control | 1/1 (100.00%) | 1/1 (100.00%) | /h | {} |
| overlap-F16-C16-exit | 0/3 (0.00%) | 3/3 (100.00%) | 루트 | {} |
| overlap-F16-C16-control | 1/1 (100.00%) | 1/1 (100.00%) | /h | {} |
| overlap-F64-C16-exit | 0/3 (0.00%) | 3/3 (100.00%) | 루트 | {} |
| overlap-F64-C16-control | 1/1 (100.00%) | 1/1 (100.00%) | /h | {} |
| overlap-F4-C4-exit | 0/3 (0.00%) | 3/3 (100.00%) | 루트 | {} |
| overlap-F4-C4-control | 1/1 (100.00%) | 1/1 (100.00%) | /h | {} |
| overlap-F4-C64-exit | 0/3 (0.00%) | 3/3 (100.00%) | 루트 | {} |
| overlap-F4-C64-control | 1/1 (100.00%) | 1/1 (100.00%) | /h | {} |
| overlap-F4-C256-exit | 0/3 (0.00%) | 3/3 (100.00%) | 루트 | {} |
| overlap-F4-C256-control | 1/1 (100.00%) | 1/1 (100.00%) | /h | {} |
| overlap-F4-C16-exit-reverse-same-layer | 0/3 (0.00%) | 3/3 (100.00%) | 루트 | {} |
| overlap-F4-C16-exit-fields-clear | 0/3 (0.00%) | 3/3 (100.00%) | 루트 | {} |
| overlap-F4-C16-exit-node-keep | 0/3 (0.00%) | 3/3 (100.00%) | 루트 | {} |
| overlap-F4-C16-exit-node-clear | 0/3 (0.00%) | 3/3 (100.00%) | 루트 | {} |
| clearing-keep-object-live | 0/4 (0.00%) | 4/4 (100.00%) | 루트 | {} |
| clearing-keep-object-inactive | 0/4 (0.00%) | 4/4 (100.00%) | 루트 | {} |
| clearing-keep-array-live | 0/4 (0.00%) | 0/4 (0.00%) | 루트 | {"unknown-dependency":4} |
| clearing-keep-array-inactive | 0/4 (0.00%) | 0/4 (0.00%) | 루트 | {"unknown-dependency":4} |
| clearing-keep-candidate-array-live | 0/4 (0.00%) | 0/4 (0.00%) | 루트 | {"unknown-dependency":4} |
| clearing-keep-candidate-array-inactive | 0/4 (0.00%) | 0/4 (0.00%) | 루트 | {"unknown-dependency":4} |
| literal-star-oneOf-live-sibling | 0/3 (0.00%) | 3/3 (100.00%) | 루트 | {} |

독립 검토 전에는 34건의 비루트 후보를 모두 거절했습니다. 들어오는 간선과 active 게이트의 거친 조상 중복 간선을 바로잡자 27건이 적격이 됐습니다. 남은 7건은 items의 control 장면에서 wildcard 의존을 확정하지 못한 거절이며 원시에 crossing-unknown과 unknown-dependency가 남습니다. single-nested-d6-f4의 40/40, nested-oneOf의 8/8은 유지됐습니다. 공유 $ref의 두 번째 이후 바인딩까지 정적 안전성을 증명한 도구는 아니므로 이 코퍼스 밖의 경로표를 이 수치만으로 출하하지 않습니다.

## 3. 호출과 라운드

실제 computeNode 호출을 computeId로 구별하고, 각 호스트 라운드의 parentRound·값/선택 변경 집합 크기·후속 라운드 개시 여부를 원시에 보존했습니다. 빈 종료 라운드는 고정점 확인이며 곧바로 제거 가능한 비용이 아닙니다.

| 행 | 쓰기 | computeNode 호출 범위/쓰기 | 호스트 라운드 | 빈 라운드 | 빈 개시 / 빈 종료 |
| --- | --- | --- | --- | --- | --- |
| single-flat-1000 | 40 | 1~1 | 0 | 해당 없음 | 0 / 0 |
| mount-oneOf-80 | 0 | — | 0 | 해당 없음 | 0 / 0 |
| mount-flat-1000 | 0 | — | 0 | 해당 없음 | 0 / 0 |
| mount-nested-d6-f4 | 0 | — | 0 | 해당 없음 | 0 / 0 |
| single-nested-d6-f4 | 40 | 1~1 | 0 | 해당 없음 | 0 / 0 |
| switch-oneOf-80 | 8 | 5~5 | 8 | 0/8 (0.00%) | 0 / 0 |
| bulk-flat-2000 | 4 | 1~1 | 0 | 해당 없음 | 0 / 0 |
| bulk-nested-d6-f4 | 4 | 1~1 | 0 | 해당 없음 | 0 / 0 |
| switch-discriminator-80 | 8 | 6~6 | 8 | 0/8 (0.00%) | 0 / 0 |
| switch-if-80 | 8 | 5~5 | 8 | 0/8 (0.00%) | 0 / 0 |
| switch-nested-oneOf-20 | 8 | 10~10 | 32 | 8/32 (25.00%) | 0 / 8 |
| switch-siblings-0 | 4 | 4~4 | 4 | 0/4 (0.00%) | 0 / 0 |
| switch-siblings-100 | 4 | 4~4 | 4 | 0/4 (0.00%) | 0 / 0 |
| switch-siblings-1000 | 4 | 4~4 | 4 | 0/4 (0.00%) | 0 / 0 |
| switch-siblings-4000 | 4 | 4~4 | 4 | 0/4 (0.00%) | 0 / 0 |
| leaf-gate-250 | 4 | 2~2 | 0 | 해당 없음 | 0 / 0 |
| leaf-gate-1000 | 4 | 2~2 | 0 | 해당 없음 | 0 / 0 |
| leaf-gate-4000 | 4 | 2~2 | 0 | 해당 없음 | 0 / 0 |
| leaf-gate-8000 | 4 | 2~2 | 0 | 해당 없음 | 0 / 0 |
| wave-1000 | 4 | 1~1 | 0 | 해당 없음 | 0 / 0 |
| single-flat-1000-subscribed | 40 | 1~1 | 0 | 해당 없음 | 0 / 0 |
| switch-payload-12 | 8 | 14~14 | 8 | 0/8 (0.00%) | 0 / 0 |

## 4. 바닥의 고정·형상 분리

같은 fixture의 독립 인스턴스에서 no-op, one-leaf, switch를 측정했습니다. 아래는 wrapped/unwrapped 짝의 원래 장부 경계이며 details 경계를 섞지 않습니다. 셀은 raw self / selfNetUs(µs)입니다. no-op은 관측된 고정비 대용값이며 잎·형상 증가분은 각각 one-leaf−no-op, switch−no-op의 보정값 차이입니다. 조건·경로가 달라지는 차분이므로 모두 제거 가능한 비용이라는 인과적 주장은 하지 않습니다.

### switch-siblings-0

| 단계 | no-op raw/net | one-leaf raw/net | switch raw/net | 잎 Δnet | 형상 Δnet |
| --- | --- | --- | --- | --- | --- |
| selectChildren | 0.000 / 0.000 | 0.000 / 0.000 | 19.333 / 18.754 | 0.000 | 18.754 |
| computeNode | 4.271 / 3.105 | 4.583 / 3.304 | 18.126 / 15.811 | 0.199 | 12.706 |
| everythingElse | 10.917 / 10.917 | 12.500 / 12.500 | 14.958 / 14.958 | 1.583 | 4.041 |
| markCommitDeliveries | 3.917 / 3.312 | 7.083 / 6.422 | 10.375 / 9.775 | 3.110 | 6.463 |
| registerRecalculation | 2.334 / 1.750 | 4.667 / 4.027 | 7.667 / 7.026 | 2.278 | 5.276 |
| evaluateGate | 0.000 / 0.000 | 0.000 / 0.000 | 7.647 / 4.070 | 0.000 | 4.070 |
| updateOutput | 2.333 / 1.167 | 3.125 / 1.846 | 5.167 / 2.789 | 0.679 | 1.622 |
| commitSettlement | 1.791 / 1.208 | 2.167 / 1.527 | 3.625 / 2.923 | 0.320 | 1.715 |

### switch-oneOf-80

| 단계 | no-op raw/net | one-leaf raw/net | switch raw/net | 잎 Δnet | 형상 Δnet |
| --- | --- | --- | --- | --- | --- |
| selectChildren | 0.000 / 0.000 | 0.000 / 0.000 | 38.291 / 37.526 | 0.000 | 37.526 |
| computeNode | 4.375 / 2.975 | 4.874 / 3.666 | 42.856 / 39.029 | 0.691 | 36.054 |
| everythingElse | 11.208 / 11.208 | 12.834 / 12.834 | 19.584 / 19.584 | 1.626 | 8.376 |
| markCommitDeliveries | 4.042 / 3.352 | 7.167 / 6.600 | 17.125 / 16.353 | 3.248 | 13.001 |
| registerRecalculation | 3.709 / 3.019 | 10.312 / 9.745 | 16.042 / 15.271 | 6.726 | 12.251 |
| evaluateGate | 0.000 / 0.000 | 0.000 / 0.000 | 0.000 / 0.000 | 0.000 | 0.000 |
| updateOutput | 2.354 / 0.954 | 3.125 / 1.875 | 10.229 / 5.637 | 0.921 | 4.683 |
| commitSettlement | 1.792 / 1.092 | 2.146 / 1.558 | 11.375 / 10.610 | 0.466 | 9.518 |

## 5. 쓰기 진입·gap·finalizeExits의 소유자

details는 이 절의 하위 타이머에만 사용합니다. writeFieldNode의 컨텍스트·scratch·마무리, 정착 바깥의 사슬 진입/종료·배달, finalizeExits의 pending-exit·retain·조상 재조립 루프를 추가 경계로 나눴습니다. 각 표본의 중첩 self 합과 잔여는 총시간을 보존합니다. 같은 프로세스 plain 짝과의 차이를 타이머 enter/exit 쌍 수로 나누는 B9-0 균일 보정을 쓰며 음수도 그대로 공개합니다. 자체 self는 하위 타이머를 포함하지 않습니다.

### switch-siblings-0

| 소유자 | raw self µs | selfNetUs | 호출/쓰기 |
| --- | --- | --- | --- |
| writeFieldNode | 5.917 | 5.266 | 1.0 |
| createSettlementContext | 1.792 | 1.147 | 1.0 |
| getSettlementScratch | 0.375 | -0.276 | 1.0 |
| releaseSettlementScratch | 2.042 | 1.405 | 1.0 |
| finishSettlement | 2.583 | 1.931 | 1.0 |
| startFieldNodeChain | 0.542 | -0.095 | 1.0 |
| enterFieldNodeChain | 1.708 | 1.057 | 1.0 |
| exitFieldNodeChain | 3.542 | 2.891 | 1.0 |
| runDeliveryWaves | 0.375 | -0.269 | 1.0 |
| deliverWave | 0.000 | 0.000 | 0.0 |
| flushQueuedEvents | 0.791 | 0.141 | 1.0 |
| everythingElse | 2.666 | 2.666 | 1.0 |
| finalizeExits | 0.000 | 0.000 | 0.0 |
| finalizePendingExitLoop | 0.000 | 0.000 | 0.0 |
| captureDetachedFieldNodeReads | 0.000 | 0.000 | 0.0 |
| visitFieldNodes | 0.000 | 0.000 | 0.0 |
| registryRemoval | 0.000 | 0.000 | 0.0 |
| finalizeRetainLoop | 0.000 | 0.000 | 0.0 |
| retainExitedSlot | 0.000 | 0.000 | 0.0 |
| createExitSlotOverlay | 0.000 | 0.000 | 0.0 |
| readSlotExitPolicy | 0.000 | 0.000 | 0.0 |
| finalizeAncestorCollection | 0.000 | 0.000 | 0.0 |
| finalizeAncestorOutput | 0.000 | 0.000 | 0.0 |
| finalizeRestoredSlotRaw | 0.000 | 0.000 | 0.0 |

짝당 추정 오버헤드 0.644 µs; details 총시간 135.354, plain 87.146 µs.

### switch-oneOf-80

| 소유자 | raw self µs | selfNetUs | 호출/쓰기 |
| --- | --- | --- | --- |
| writeFieldNode | 7.813 | 7.158 | 1.0 |
| createSettlementContext | 2.291 | 1.636 | 1.0 |
| getSettlementScratch | 0.375 | -0.298 | 1.0 |
| releaseSettlementScratch | 2.500 | 1.845 | 1.0 |
| finishSettlement | 4.020 | 3.365 | 1.0 |
| startFieldNodeChain | 0.583 | -0.090 | 1.0 |
| enterFieldNodeChain | 1.958 | 1.303 | 1.0 |
| exitFieldNodeChain | 4.666 | 4.011 | 1.0 |
| runDeliveryWaves | 0.416 | -0.257 | 1.0 |
| deliverWave | 0.000 | 0.000 | 0.0 |
| flushQueuedEvents | 0.917 | 0.262 | 1.0 |
| everythingElse | 3.563 | 3.563 | 1.0 |
| finalizeExits | 5.605 | 4.890 | 1.0 |
| finalizePendingExitLoop | 4.561 | 3.877 | 1.0 |
| captureDetachedFieldNodeReads | 5.209 | 3.243 | 3.0 |
| visitFieldNodes | 4.270 | 2.283 | 3.0 |
| registryRemoval | 2.250 | 0.196 | 3.0 |
| finalizeRetainLoop | 2.084 | 1.399 | 1.0 |
| retainExitedSlot | 7.207 | 5.153 | 3.0 |
| createExitSlotOverlay | 5.334 | 3.368 | 3.0 |
| readSlotExitPolicy | 3.751 | 1.659 | 3.0 |
| finalizeAncestorCollection | 0.666 | -0.048 | 1.0 |
| finalizeAncestorOutput | 1.042 | 0.357 | 1.0 |
| finalizeRestoredSlotRaw | 0.833 | 0.137 | 1.0 |

짝당 추정 오버헤드 0.685 µs; details 총시간 315.375, plain 196.751 µs.

### 타이머 프로세스별 중앙값/최솟값 비

| 행 | 변형 | 반복 | plain | details | unwrapped | wrapped |
| --- | --- | --- | --- | --- | --- | --- |
| switch-siblings-0 | noop | 0 | 1.153 | 1.199 | 1.139 | 1.143 |
| switch-siblings-0 | noop | 1 | 1.286 | 1.229 | 1.296 | 1.280 |
| switch-siblings-0 | noop | 2 | 1.179 | 1.162 | 1.158 | 1.136 |
| switch-siblings-0 | leaf | 0 | 1.251 | 1.228 | 1.264 | 1.194 |
| switch-siblings-0 | leaf | 1 | 1.210 | 1.178 | 1.233 | 1.199 |
| switch-siblings-0 | leaf | 2 | 1.256 | 1.211 | 1.234 | 1.178 |
| switch-siblings-0 | switch | 0 | 1.338 | 1.351 | 1.322 | 1.330 |
| switch-siblings-0 | switch | 1 | 1.371 | 1.379 | 1.399 | 1.352 |
| switch-siblings-0 | switch | 2 | 1.302 | 1.318 | 1.371 | 1.339 |
| switch-oneOf-80 | noop | 0 | 1.156 | 1.143 | 1.149 | 1.158 |
| switch-oneOf-80 | noop | 1 | 1.259 | 1.244 | 1.203 | 1.196 |
| switch-oneOf-80 | noop | 2 | 1.184 | 1.159 | 1.154 | 1.148 |
| switch-oneOf-80 | leaf | 0 | 1.211 | 1.178 | 1.229 | 1.233 |
| switch-oneOf-80 | leaf | 1 | 1.240 | 1.163 | 1.274 | 1.226 |
| switch-oneOf-80 | leaf | 2 | 1.253 | 1.174 | 1.206 | 1.202 |
| switch-oneOf-80 | switch | 0 | 1.312 | 1.338 | 1.365 | 1.389 |
| switch-oneOf-80 | switch | 1 | 1.330 | 1.290 | 1.433 | 1.391 |
| switch-oneOf-80 | switch | 2 | 1.352 | 1.291 | 1.303 | 1.354 |

## 6. 컨텍스트·scratch·Map/Set 생성 수

단위는 쓰기당 중앙값입니다. scratch는 이미 재사용하고 있으며 컨텍스트 객체와 분리해서 셉니다. Map/Set은 PathKeyedMap/PathKeyedSet을 포함합니다. 배달 경계는 writeFieldNode가 끝난 뒤 exitFieldNodeChain까지 별도로 추적해 정착의 생성 수에 더했습니다. 일반 객체·배열 전체나 GC 바이트의 추정값은 아닙니다.

| 행 | context | scratch 신규/재사용 | Map | Set | wheel | commit | delivery | 기타 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| single-flat-1000 | 1 | 0/1 | 5 | 11 | 2 | 6 | 4 | 4 |
| single-nested-d6-f4 | 1 | 0/1 | 11 | 16 | 7 | 6 | 4 | 10 |
| switch-oneOf-80 | 1 | 0/1 | 29 | 68 | 69 | 6 | 4 | 18 |
| bulk-flat-2000 | 1 | 0/1 | 4 | 9 | 0 | 6 | 4 | 3 |
| bulk-nested-d6-f4 | 1 | 0/1 | 4 | 9 | 0 | 6 | 4 | 3 |
| switch-discriminator-80 | 1 | 0/1 | 31 | 58 | 55 | 6 | 4 | 24 |
| switch-if-80 | 1 | 0/1 | 32 | 55 | 54 | 6 | 4 | 23 |
| switch-nested-oneOf-20 | 1 | 0/1 | 45 | 88 | 97 | 6 | 4 | 26 |
| switch-siblings-0 | 1 | 0/1 | 15 | 19 | 17 | 6 | 4 | 7 |
| switch-siblings-100 | 1 | 0/1 | 15 | 19 | 17 | 6 | 4 | 7 |
| switch-siblings-1000 | 1 | 0/1 | 15 | 19 | 17 | 6 | 4 | 7 |
| switch-siblings-4000 | 1 | 0/1 | 15 | 19 | 17 | 6 | 4 | 7 |
| leaf-gate-250 | 1 | 0/1 | 6 | 13 | 5 | 6 | 4 | 4 |
| leaf-gate-1000 | 1 | 0/1 | 6 | 13 | 5 | 6 | 4 | 4 |
| leaf-gate-4000 | 1 | 0/1 | 6 | 13 | 5 | 6 | 4 | 4 |
| leaf-gate-8000 | 1 | 0/1 | 6 | 13 | 5 | 6 | 4 | 4 |
| wave-1000 | 1 | 0/1 | 4 | 1009 | 0 | 6 | 1006 | 1 |
| single-flat-1000-subscribed | 1 | 0/1 | 4 | 13 | 2 | 6 | 7 | 2 |
| switch-payload-12 | 1 | 0/1 | 47 | 185 | 195 | 6 | 4 | 27 |

코퍼스 175건 모두 exitFieldNodeChain의 Set 생성이 1회 이상 기록됐습니다. 검토 전 delivery=0은 정착 경계 밖 관측 누락이었으며 재사용 풀의 입력으로 사용하지 않습니다.

## 설계 Ⅳ 비용 모델에 돌려주는 입력

Ⅳ-1의 비루트 국소 바퀴는 위의 적격 범위에만 적용됩니다. root-host oneOf-80·siblings-0에는 방문 감소의 직접 예산을 0으로 둡니다. Ⅳ-2의 “루트 5라운드” 전제는 재귀 호출과 혼동한 것이어서 철회하며, 빈 개시 라운드와 게이트 메모 가능성을 따로 검증해야 합니다. Ⅳ-3은 컨텍스트 1개와 단계별 일시 Map/Set을 겨냥하되 이미 재사용하는 scratch를 새 절감량으로 세지 않습니다. Ⅳ-5의 13.6 µs와 gap의 과거 절대값은 다른 창의 값이므로 재사용하지 않고 이 창의 하위 소유자 표를 예산 상한 입력으로 씁니다. Ⅳ-4 등록 소유자와 Ⅳ-6 조립 메모의 제거 가능성은 계측 비용에서 추정한 가설이며 제품 개선 실측이 아닙니다.

채택된 이론상 단계 합 목표(siblings-0 25~40 µs, oneOf-80 60~95 µs)는 계속 기록합니다. 아래는 이 창 E의 단계 self 중앙값 합 대비 목표 비율을 같은 창 E/L 주행 비율에 곱한 보조 환산입니다. 개선 전후 계측 부담 비율이 같다는 가정이며, 실제 PR의 판정은 그 PR 창의 배포 행 E/L로 다시 합니다.

| 행 | E 단계 self 중앙값 합 | 단계 목표 | L 대비 목표 보조 환산 | 현재 주행 E/L |
| --- | --- | --- | --- | --- |
| switch-siblings-0 | 97.374 | 25~40 | 0.908~1.452 | 3.535 |
| switch-oneOf-80 | 199.354 | 60~95 | 1.069~1.693 | 3.553 |

## 재현과 검증

원시는 [전체 표본](raw/iv-0/evidence.json.gz), [축약 CPU](raw/iv-0/cpu.json.gz), [재계산 요약](raw/iv-0/summary.json)에 있습니다. CPU의 시작 관측·프로세스별 관측·Bun 사전 관측은 모두 상위 10개 프로세스 이름/비율로 줄이고 모든 공개 JSON의 로컬 경로를 가렸습니다. checkTools, 저장소 ESLint·checkJs·Prettier, 지정 제품 build(typecheck·artifact 포함)와 package lint를 통과한 뒤 창을 열었습니다. 결과의 22행 순서·각 레인 10프로세스·100표본·PID 독립성·24개 장부·18개 세부 프로세스·self 보존·79장면과 모든 수치는 checkResults.mjs가 압축 원시에서 다시 계산합니다.

```sh
node packages/canard/schema-form/architecture/verification/branch-switch/tools/iv-0/checkResults.mjs packages/canard/schema-form/architecture/verification/branch-switch/raw/iv-0
```

## 측정·진단 출처

| 구분 | 준비 root 식별자 | 도구 기준 |
| --- | --- | --- |
| 창 1 — 환경 실패와 부분 표본 보존 | 20261029T0330-4b7abf5-iv-0.noindex | 4b7abf5de |
| 창 2 — 정식 시간 및 후보 2 진단 | 20261029T0410-098cd76-iv-0-window2.noindex | 098cd76c6 |

첫 창의 6프로세스 부분 표본은 새 창 판정에서 제외했습니다. 창 2의 시간·후보 2 진단은 같은 root에서 생성했습니다. 후속 P3 검증은 새 진단 root에서 시계 없이만 수행하고 그 식별자를 추가합니다.

## FCA 감사와 독립 검토

패키지 전체 FCA 감사는 facts 1662/1662 exact, 동일 snapshot에서 findings 202건(오류 1·경고 200·정보 1)으로 FAIL입니다. 분석은 indeterminate를 포함합니다. 확정 오류는 기존 FieldProxy↔FieldInputSlot 순환이며 제품 소스·모듈 문서·FCA 설정은 기준 머리와 같습니다. architecture는 기존 ignore 정책의 대상입니다. 측정 전용 범위를 지켜 이 기존 문제를 함께 수정하지 않았습니다. [감사 근거](raw/iv-0/fca/summary.json)를 보존했습니다.

독립 검토는 [후보 1](reviews/pr-iv-0-candidate-1-claude.md)의 P2 세 건을 수정한 뒤 [후보 2](reviews/pr-iv-0-candidate-2-claude.md)에서 P1/P2 0, PASS with P3로 확인했습니다. 배달 frame 방어와 parentRound 보존의 후속 P3는 시간 원시를 먼저 공개한 뒤 별도 커밋과 시계 없는 진단으로 확인합니다. 시간 창을 다시 열지 않습니다.
