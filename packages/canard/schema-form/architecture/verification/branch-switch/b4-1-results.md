# B4-1 — retained detached slots

후보 1 판정: **채택 조건 미충족**. 품질은 유효하지만 entering 절반·기존 단계 자체 잡음·TEST-073 조건을 통과하지 못했습니다. 후보 2는 원인 진단 중이며 아래 후보 1 수치는 보존합니다.

## 후보 1 — 고정 장치와 품질

| 항목 | 관측 |
| --- | --- |
| 제품 소스 | `ff79e2c33` |
| 완결 창 입력 | `ffe4162cc` / 도구 `f290cd04d` |
| 기준 A | `fc341d51b` |
| 환경 | {'node': 'v26.12.1', 'bun': '1.4.4', 'cpu': 'Apple M1 Max', 'arch': 'arm64', 'release': '27.0.0'} |
| 프로토콜 | 22행·A/B 각10 새 프로세스·20예열/100표본·A앞5/A′뒤5/B전체10 |
| 품질 | 동일0.16.1 레인18행의 B10/A10 중앙비 0.999847; 0.95–1.05 통과 |
| 판정 타이머 | A22/B25; 차이3은 cloneFromSlot·enterSlotClone·createFromSlotOverlay 진입 경계; 중첩 생성 타이머 생략 |
| 보충 타이머 | B65(새 helper43 포함),3행×3프로세스; 모든 채택 관문에서 제외 |
| 중단 창 | 첫9행 후 AJV 로컬 산출물 누락; 표본 전부 판정 제외·보존, 로컬 build와44무계측 점검 후 승인된 새 완결 창1회 |

완결 창과 중단 창의 원표본은 로컬에 보존했습니다. 이 문서의 수치는 새 완결 창만 사용합니다. CPU 요약은0%행을 생략하며 전체 before/after 기록은 로컬에 보존합니다. [품질](raw/b4-1/candidate-1/quality.json), [입력](raw/b4-1/candidate-1/inputs.json), [중단 기록](raw/b4-1/candidate-1/interrupted-window.json), [44동작 점검](raw/b4-1/candidate-1/preflight.json).

## 후보 1 — 채택 관문

| 관문 | 결과 |
| --- | --- |
| quality | 통과 |
| latentZero | 통과 |
| inactiveMemoZero | 통과 |
| enteringHalf | 미충족 |
| stageNoise | 미충족 |
| test073 | 미충족 |
| nodeHeap | 통과 |

일반 슬롯 경로의 captureExitedRaw·setLatentRaw·updateInactiveValuesMemo는 모든 계측 표본에서 호출0입니다. entering은 factory·재진입·복원·clone·overlay를 포함한 가장 바깥 구간의 합계이며 새 함수 이름으로 생성 비용을 숨기지 않습니다. [판정](raw/b4-1/candidate-1/judgement.json).

| 행 | entering A µs | entering B µs | B/A | 절반 |
| --- | --- | --- | --- | --- |
| switch-oneOf-80 | 9.458 | 17.228 | 1.822 | 미충족 |
| switch-payload-12 | 17.479 | 34.563 | 1.977 | 미충족 |
| switch-siblings-0 | 0.000 | 0.000 | 해당 없음 | 통과 |

## 후보 1 — 총합22행

단위는 ms, 대표값은 프로세스별100표본 최소값의 중앙값입니다. 폭(다)은 max(|A−A′|,앞5의범위,뒤5의범위)이며 B/A는 A전체10 기준입니다.

| 행 | A앞5 | A′뒤5 | B10 | 폭(다) | B/A10 | legacy비 | 폭 판정 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| single-flat-1000 | 0.064542 | 0.072792 | 0.097084 | 0.054500 | 1.414 | 1.086 | 미입증 |
| mount-oneOf-80 | 2.188458 | 2.160208 | 2.175521 | 0.107334 | 0.998 | 0.992 | 미입증 |
| mount-flat-1000 | 2.108084 | 2.131542 | 2.148667 | 0.052416 | 1.018 | 0.993 | 미입증 |
| mount-nested-d6-f4 | 16.035833 | 15.825667 | 15.884271 | 0.485667 | 0.997 | 1.000 | 미입증 |
| single-nested-d6-f4 | 0.179250 | 0.172625 | 0.181229 | 0.060625 | 1.040 | 1.018 | 미입증 |
| switch-oneOf-80 | 0.463500 | 0.367916 | 0.391083 | 0.279626 | 0.923 | 1.015 | 미입증 |
| bulk-flat-2000 | 1.804834 | 1.826875 | 1.824041 | 0.144583 | 1.002 | 1.012 | 미입증 |
| bulk-nested-d6-f4 | 4.027459 | 4.065541 | 4.050833 | 0.289333 | 1.002 | 0.988 | 미입증 |
| switch-discriminator-80 | 0.302417 | 0.314625 | 0.275417 | 0.121667 | 0.891 | — | 미입증 |
| switch-if-80 | 0.448625 | 0.449084 | 0.420938 | 0.103209 | 0.938 | — | 미입증 |
| switch-nested-oneOf-20 | 0.669917 | 0.650417 | 0.607166 | 0.256291 | 0.922 | 1.123 | 미입증 |
| switch-siblings-0 | 0.103625 | 0.099708 | 0.107084 | 0.032792 | 1.053 | 0.960 | 미입증 |
| switch-siblings-100 | 0.221667 | 0.285541 | 0.275209 | 0.074624 | 0.978 | 1.027 | 미입증 |
| switch-siblings-1000 | 2.055083 | 2.071125 | 2.062146 | 0.109500 | 1.001 | 1.009 | 미입증 |
| switch-siblings-4000 | 6.576542 | 6.636750 | 6.670729 | 0.218749 | 1.014 | 0.996 | 미입증 |
| leaf-gate-250 | 0.034042 | 0.034292 | 0.037750 | 0.018751 | 1.105 | 0.992 | 미입증 |
| leaf-gate-1000 | 0.035541 | 0.037459 | 0.037645 | 0.020042 | 1.041 | 0.968 | 미입증 |
| leaf-gate-4000 | 0.779250 | 0.766208 | 0.818791 | 0.161125 | 1.059 | 1.047 | 미입증 |
| leaf-gate-8000 | 1.552500 | 1.564833 | 1.563437 | 0.022251 | 1.003 | 1.000 | 미입증 |
| wave-1000 | 1.708833 | 1.745500 | 1.714855 | 0.123625 | 1.003 | — | 미입증 |
| single-flat-1000-subscribed | 0.095875 | 0.091875 | 0.089146 | 0.018583 | 0.968 | — | 미입증 |
| switch-payload-12 | 0.650000 | 0.785750 | 0.595230 | 0.254875 | 0.842 | 0.969 | 미입증 |

[프로세스별 최소값과 계산 근거](raw/b4-1/candidate-1/results.summary.json). 총합 행은 B3 누적 판정에 보고하며 이 후보의 채택 관문을 대체하지 않습니다.

## 후보 1 — TEST-073

1000/ms 처리율의 Welch 검정이며 감소15% 초과와 p<0.05를 함께 적용합니다. 전체 인접10쌍이 주판정이고 앞5·뒤5는 보조입니다.

| 행 | 전체 변화% | 전체p | 앞5 변화% / p | 뒤5 변화% / p | 주판정 회귀 |
| --- | --- | --- | --- | --- | --- |
| single-flat-1000 | -19.794 | 6.05e-32 | -20.388 / 1.9e-18 | -19.155 / 2.66e-15 | 있음 |
| mount-oneOf-80 | -0.268 | 0.564 | -2.187 / 0.000568 | 1.642 / 0.0142 | 없음 |
| mount-flat-1000 | 0.546 | 0.388 | -0.443 / 0.613 | 1.551 / 0.0893 | 없음 |
| mount-nested-d6-f4 | 0.143 | 0.807 | 1.501 / 0.0746 | -1.183 / 0.147 | 없음 |
| single-nested-d6-f4 | -19.849 | 5.99e-32 | -20.384 / 1.21e-18 | -19.291 / 4.54e-15 | 있음 |
| switch-oneOf-80 | 7.342 | 8.92e-06 | -0.156 / 0.943 | 13.956 / 8.36e-10 | 없음 |
| bulk-flat-2000 | -0.328 | 0.434 | -0.864 / 0.142 | 0.216 / 0.717 | 없음 |
| bulk-nested-d6-f4 | -1.444 | 0.052 | 0.906 / 0.382 | -3.775 / 0.000381 | 없음 |
| switch-discriminator-80 | 17.398 | 2.3e-68 | 19.323 / 1.89e-39 | 15.522 / 9.59e-31 | 없음 |
| switch-if-80 | 10.183 | 2.43e-52 | 6.879 / 2.08e-13 | 13.629 / 1.22e-46 | 없음 |
| switch-nested-oneOf-20 | 14.085 | 3.61e-19 | 11.569 / 3.98e-08 | 16.405 / 5.04e-13 | 없음 |
| switch-siblings-0 | -1.360 | 0.498 | 1.335 / 0.624 | -4.373 / 0.13 | 없음 |
| switch-siblings-100 | 2.042 | 0.22 | -6.140 / 0.00251 | 13.128 / 2.48e-07 | 없음 |
| switch-siblings-1000 | -2.952 | 3.14e-09 | 0.701 / 0.321 | -6.581 / 4.54e-22 | 없음 |
| switch-siblings-4000 | -2.087 | 1.13e-12 | -2.443 / 3.53e-09 | -1.726 / 3.1e-05 | 없음 |
| leaf-gate-250 | -13.325 | 5.53e-08 | -5.579 / 0.128 | -19.624 / 1.76e-09 | 없음 |
| leaf-gate-1000 | 3.183 | 0.204 | -19.189 / 1.95e-09 | 26.839 / 7.98e-13 | 없음 |
| leaf-gate-4000 | -1.150 | 0.121 | -0.210 / 0.834 | -2.136 / 0.0463 | 없음 |
| leaf-gate-8000 | -0.375 | 0.0726 | -1.022 / 0.00031 | 0.280 / 0.359 | 없음 |
| wave-1000 | -1.235 | 0.00334 | 1.269 / 0.028 | -3.685 / 1.27e-09 | 없음 |
| single-flat-1000-subscribed | 0.389 | 0.707 | 6.232 / 5.84e-05 | -4.980 / 0.000288 | 없음 |
| switch-payload-12 | 22.594 | 6.63e-37 | 16.024 / 4.1e-12 | 29.494 / 2.94e-27 | 없음 |

## 후보 1 — 단계 장부

µs 단위이며 각 프로세스100쓰기의 중앙값을 구한 뒤3프로세스의 중앙값을 사용합니다. 기존 B0 단계의 포함 비용 증가가 A 프로세스 중앙값 범위보다 크면 악화입니다. 타이머 오버헤드는 차감하지 않습니다.

| 행 | 단계 | A자체 | B자체 | A포함 | B포함 | A잡음폭 | 악화 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| switch-oneOf-80 | markWrite | 4.105 | 1.542 | 4.105 | 1.542 | 0.189 | 없음 |
| switch-oneOf-80 | registerRecalculation | 12.563 | 12.563 | 12.563 | 12.563 | 0.083 | 없음 |
| switch-oneOf-80 | computeNode | 31.999 | 32.313 | 101.063 | 101.958 | 1.998 | 없음 |
| switch-oneOf-80 | wheelPreparation | 2.791 | 2.749 | 7.854 | 8.083 | 0.250 | 없음 |
| switch-oneOf-80 | primeHost | 2.375 | 2.458 | 2.375 | 2.458 | 0.041 | 있음 |
| switch-oneOf-80 | selectChildren | 31.081 | 22.167 | 57.646 | 57.771 | 1.250 | 없음 |
| switch-oneOf-80 | evaluateGate | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 없음 |
| switch-oneOf-80 | runDeriveRounds | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 없음 |
| switch-oneOf-80 | transitionSettlement | 4.875 | 3.979 | 4.875 | 3.979 | 0.124 | 없음 |
| switch-oneOf-80 | finalizeExits | 18.584 | 18.415 | 39.980 | 23.375 | 0.542 | 없음 |
| switch-oneOf-80 | getControlLayers | 2.125 | 1.418 | 2.125 | 1.418 | 0.042 | 없음 |
| switch-oneOf-80 | captureExitedRaw | 5.293 | 0.000 | 13.729 | 0.000 | 0.333 | 없음 |
| switch-oneOf-80 | setLatentRaw | 10.563 | 0.000 | 10.563 | 0.000 | 0.291 | 없음 |
| switch-oneOf-80 | updateOutput | 6.875 | 7.332 | 15.709 | 16.418 | 1.103 | 없음 |
| switch-oneOf-80 | assembleObject | 9.041 | 9.208 | 9.041 | 9.208 | 0.562 | 없음 |
| switch-oneOf-80 | commitSettlement | 7.729 | 9.543 | 38.209 | 22.708 | 2.896 | 없음 |
| switch-oneOf-80 | updateInactiveValuesMemo | 17.563 | 0.000 | 17.563 | 0.000 | 1.147 | 없음 |
| switch-oneOf-80 | markCommitDeliveries | 9.959 | 12.376 | 9.959 | 12.376 | 0.292 | 있음 |
| switch-payload-12 | markWrite | 6.958 | 1.542 | 6.958 | 1.542 | 0.937 | 없음 |
| switch-payload-12 | registerRecalculation | 20.166 | 19.604 | 20.166 | 19.604 | 0.833 | 없음 |
| switch-payload-12 | computeNode | 45.728 | 50.293 | 188.877 | 197.229 | 14.373 | 없음 |
| switch-payload-12 | wheelPreparation | 3.500 | 3.333 | 8.125 | 8.063 | 0.104 | 없음 |
| switch-payload-12 | primeHost | 2.645 | 2.541 | 2.645 | 2.541 | 0.125 | 없음 |
| switch-payload-12 | selectChildren | 57.397 | 40.479 | 127.750 | 129.500 | 9.791 | 없음 |
| switch-payload-12 | evaluateGate | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 없음 |
| switch-payload-12 | runDeriveRounds | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 없음 |
| switch-payload-12 | transitionSettlement | 7.042 | 8.020 | 7.042 | 8.020 | 0.687 | 있음 |
| switch-payload-12 | finalizeExits | 34.769 | 35.749 | 93.229 | 42.709 | 3.730 | 없음 |
| switch-payload-12 | getControlLayers | 6.292 | 3.625 | 6.292 | 3.625 | 0.438 | 없음 |
| switch-payload-12 | captureExitedRaw | 11.605 | 0.000 | 38.791 | 0.000 | 0.771 | 없음 |
| switch-payload-12 | setLatentRaw | 35.377 | 0.000 | 35.377 | 0.000 | 1.498 | 없음 |
| switch-payload-12 | updateOutput | 6.520 | 8.292 | 45.854 | 45.416 | 4.564 | 없음 |
| switch-payload-12 | assembleObject | 37.709 | 35.896 | 37.709 | 35.896 | 4.375 | 없음 |
| switch-payload-12 | commitSettlement | 16.124 | 14.938 | 76.833 | 33.375 | 2.437 | 없음 |
| switch-payload-12 | updateInactiveValuesMemo | 43.772 | 0.000 | 43.772 | 0.000 | 1.374 | 없음 |
| switch-payload-12 | markCommitDeliveries | 15.396 | 18.104 | 15.396 | 18.104 | 0.457 | 있음 |
| switch-siblings-0 | markWrite | 1.542 | 1.500 | 1.542 | 1.500 | 0.063 | 없음 |
| switch-siblings-0 | registerRecalculation | 6.750 | 6.625 | 6.750 | 6.625 | 0.313 | 없음 |
| switch-siblings-0 | computeNode | 14.522 | 14.373 | 55.188 | 54.625 | 3.894 | 없음 |
| switch-siblings-0 | wheelPreparation | 2.459 | 2.459 | 8.292 | 8.188 | 0.417 | 없음 |
| switch-siblings-0 | primeHost | 3.312 | 3.250 | 3.312 | 3.250 | 0.166 | 없음 |
| switch-siblings-0 | selectChildren | 15.478 | 15.395 | 25.688 | 25.688 | 1.709 | 없음 |
| switch-siblings-0 | evaluateGate | 5.063 | 5.208 | 5.063 | 5.208 | 0.292 | 없음 |
| switch-siblings-0 | runDeriveRounds | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 없음 |
| switch-siblings-0 | transitionSettlement | 1.291 | 1.292 | 1.291 | 1.292 | 0.042 | 없음 |
| switch-siblings-0 | finalizeExits | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 없음 |
| switch-siblings-0 | getControlLayers | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 없음 |
| switch-siblings-0 | captureExitedRaw | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 없음 |
| switch-siblings-0 | setLatentRaw | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 없음 |
| switch-siblings-0 | updateOutput | 3.854 | 3.875 | 6.499 | 6.625 | 0.479 | 없음 |
| switch-siblings-0 | assembleObject | 2.583 | 2.666 | 2.583 | 2.666 | 0.124 | 없음 |
| switch-siblings-0 | commitSettlement | 3.541 | 3.687 | 13.000 | 12.541 | 0.563 | 없음 |
| switch-siblings-0 | updateInactiveValuesMemo | 0.209 | 0.000 | 0.209 | 0.000 | 0.001 | 없음 |
| switch-siblings-0 | markCommitDeliveries | 9.000 | 8.666 | 9.000 | 8.666 | 0.313 | 없음 |

[전체 자체·포함 비용과 호출·샘플링 할당](raw/b4-1/candidate-1/stages.json).

## 후보 1 — 보충 helper 비용

각 셀은 자체/포함 µs입니다. 43개 새 helper를 모두 표시하며 이 표는 채택 판정에 사용하지 않습니다. 보충 precise-coverage·allocation 분류의 파일명 필터 오류는 저장된 supplemental.mjs 원 프로파일을 다시 분류하여 보정했습니다. 새 표본은 수집하지 않았으며 자체/포함 시간과 판정은 바뀌지 않았습니다. [보정 근거](raw/b4-1/candidate-1/profile-classification-correction.json).

| helper | oneOf-80 자체/포함 | payload-12 자체/포함 | siblings-0 자체/포함 |
| --- | --- | --- | --- |
| applyConvertedExitPolicy | 0.354/0.354 | 0.583/0.583 | 0.000/0.000 |
| applySlotOverlay | 0.000/0.000 | 0.000/0.000 | 0.000/0.000 |
| captureAbsentSlotInputs | 0.417/0.417 | 0.625/0.625 | 0.000/0.000 |
| cloneFromSlot | 2.332/20.709 | 5.107/40.500 | 0.000/0.000 |
| cloneSlotSubtree | 12.437/16.832 | 23.376/30.646 | 0.000/0.000 |
| collectHostSlotValues | 0.000/0.000 | 0.000/0.000 | 0.000/0.000 |
| collectSlotSourceValues | 0.000/0.000 | 0.000/0.000 | 0.000/0.000 |
| commitSlotChanges | 5.668/9.459 | 9.980/15.583 | 0.125/0.125 |
| compareSlotOrder | 0.000/0.000 | 0.000/0.000 | 0.000/0.000 |
| createExitSlotOverlay | 2.688/5.376 | 3.962/9.375 | 0.000/0.000 |
| createFromSlotOverlay | 0.000/0.000 | 0.000/0.000 | 0.000/0.000 |
| createSlotValueOverlay | 0.000/0.000 | 0.000/0.000 | 0.000/0.000 |
| enterSlotClone | 0.708/0.708 | 1.044/1.044 | 0.000/0.000 |
| expireOccupiedSlotMemos | 0.291/0.291 | 0.542/0.542 | 0.000/0.000 |
| expirePackedSlotMemos | 0.000/0.000 | 0.000/0.000 | 0.000/0.000 |
| finalizeRestoredSlotRaw | 0.584/0.584 | 0.375/0.375 | 0.000/0.000 |
| getRetainedChildEntry | 0.687/0.687 | 1.544/1.544 | 0.000/0.000 |
| getSlotEntries | 1.042/1.042 | 1.125/1.125 | 0.000/0.000 |
| getSlotEntryPosition | 0.000/0.000 | 0.000/0.000 | 0.000/0.000 |
| getSlotSource | 0.000/0.000 | 0.000/0.000 | 0.000/0.000 |
| hasAdditionalInactiveSources | 0.000/0.000 | 0.000/0.000 | 0.000/0.000 |
| hasSlotCandidateOwner | 0.000/0.000 | 0.000/0.000 | 0.000/0.000 |
| hasSlotOverlaySource | 0.000/0.000 | 0.000/0.000 | 0.000/0.000 |
| isSlotEligible | 1.313/1.313 | 2.207/2.207 | 0.875/0.875 |
| markRestoredSlotRaw | 1.625/1.625 | 4.125/4.125 | 0.000/0.000 |
| markSlotChange | 2.480/2.480 | 6.709/6.709 | 0.000/0.000 |
| materializeInactiveSlotValues | 0.000/0.000 | 0.000/0.000 | 0.000/0.000 |
| preserveConvertedSlotMemos | 0.000/0.000 | 0.000/0.000 | 0.000/0.000 |
| preserveSlotValueMemos | 1.499/2.543 | 2.668/3.772 | 0.000/0.000 |
| pruneArraySlotTail | 0.000/0.000 | 0.000/0.000 | 0.000/0.000 |
| pruneSlotSources | 1.875/1.875 | 2.500/2.500 | 1.500/1.500 |
| readSlotExitPolicy | 1.479/2.229 | 3.166/4.791 | 0.000/0.000 |
| readSlotRawTree | 0.000/0.000 | 0.000/0.000 | 0.000/0.000 |
| readSlotValueEntry | 0.000/0.000 | 0.000/0.000 | 0.000/0.000 |
| rekeyArraySlotBindings | 0.000/0.000 | 0.000/0.000 | 0.000/0.000 |
| rekeySlotWriteAddresses | 0.000/0.000 | 0.000/0.000 | 0.000/0.000 |
| resolveSlotSource | 0.000/0.000 | 0.000/0.000 | 0.000/0.000 |
| restoreSlotSources | 0.000/0.000 | 0.000/0.000 | 0.000/0.000 |
| retainClearedArrayCarriers | 0.000/0.000 | 0.000/0.000 | 0.000/0.000 |
| retainExitedSlot | 5.960/14.292 | 12.502/27.751 | 0.000/0.000 |
| serializeArraySlotSources | 0.000/0.000 | 0.000/0.000 | 0.000/0.000 |
| updateSlotChildIndex | 0.834/0.834 | 1.458/1.458 | 0.000/0.000 |
| writeSlotPath | 0.000/0.000 | 0.000/0.000 | 0.000/0.000 |

| 행 | 판정 A wrapped/unwrapped | 판정 B wrapped/unwrapped | 보충 B wrapped/unwrapped |
| --- | --- | --- | --- |
| switch-oneOf-80 | 210.020/185.438 | 177.584/160.730 | 202.000/161.250 |
| switch-payload-12 | 401.875/343.041 | 304.063/267.291 | 333.063/249.501 |
| switch-siblings-0 | 86.396/75.292 | 86.771/76.396 | 92.146/77.708 |

[보충 원 요약](raw/b4-1/candidate-1/supplemental-stages.json). 512B 샘플링에서0은 할당 부재의 증거가 아닙니다.

## 후보 1 — 힙과 슬롯 보유량

힙은 런타임·판당7개 새 프로세스, flat5001노드의 B/노드입니다. Node는 B중앙≤A최대가 관문이고 Bun은 보고만 합니다. 힙 장치의 보조 legacy는0.16.0이며22행 품질의0.16.1 레인과 구별합니다.

| 런타임 | A중앙 | A최대 | B중앙 | B/A중앙 | 관문 |
| --- | --- | --- | --- | --- | --- |
| node | 1439.114 | 1890.340 | 1483.431 | 1.031 | 통과 |
| bun | 2232.405 | 2239.925 | 2237.722 | 1.002 | 참고 |

| 행/호스트 | K슬롯 | 보유노드 | 미읽음 B | 읽은뒤 B | reset 슬롯호스트 |
| --- | --- | --- | --- | --- | --- |
| switch-oneOf-80 / root | 3 | 3 | 5416 | 5736 | 0 |
| switch-payload-12 / root | 12 | 12 | 18400 | 18976 | 0 |
| switch-siblings-0 / root | 0 | 0 | 0 | 0 | 0 |

120쓰기 후 inactiveSlots Map의 독점 지배 바이트입니다. 공유 청사진과 외부가 붙잡은 옛 참조는 제외하며 중첩 Map 보유량은 중복 합산하지 않습니다. reset 뒤 숫자 heap ID가 FieldNode에서 일반 Object로 재사용돼 개별 노드 회수 수는 판정 불가입니다. 앞선11/12회수·1노드잔존 해석은 철회합니다. [힙](raw/b4-1/candidate-1/heaps.json), [보유](raw/b4-1/candidate-1/retention.json), [ID 해석 한계](raw/b4-1/candidate-1/retention-lifetime-caveat.json).

## 후보 1 — 별표 호환 경로

이름이 정확히 `*`인 속성을 품는 청사진 폼 전체는 기존 잠복 경로를 씁니다. 일반 폼과 같은20예열/100개의 새 트리 이탈에서 호출 수를 계수했습니다.

| 폼 | 단계 | captureExitedRaw 최소/최대 | setLatentRaw 최소/최대 | memo 최소/최대 |
| --- | --- | --- | --- | --- |
| normal | hide-descendant | 0/0 | 0/0 | 0/0 |
| normal | close-host | 0/0 | 0/0 | 0/0 |
| wildcard | hide-descendant | 1/1 | 1/1 | 1/1 |
| wildcard | close-host | 1/1 | 1/1 | 1/1 |

| 폼 | 전체fixture B | latentRaw 항목/독점B | metadata 항목/독점B | entries 항목/독점B | memo 항목/독점B |
| --- | --- | --- | --- | --- | --- |
| normal | 123576 | 0/968 | 0/0 | 0/0 | 0/968 |
| wildcard | 126840 | 1/2152 | 1/2568 | 0/968 | 1/1400 |

root와 옛 호스트를 함께 잡은 fixture의 차이는 3264B입니다. 각 저장소의 독점 바이트는 공유 객체를 제외하며 fixture 전체 바이트에는 공유 bookkeeping·원본이 포함됩니다. 속도 채택 근거가 아닙니다. [별표 비용](raw/b4-1/candidate-1/wildcard-cost.json).

## 검증과 별도 검토 사항

| 항목 | 결과 |
| --- | --- |
| 최종5프로젝트 | 927파일·5705통과·1todo·실패0 |
| 최종verify | 694파일·4717통과·1todo·실패0 |
| 타입/린트/지정build | 통과 |
| 실제배달비교 | 72장면430지점0차이; mount6장면12지점0차이 |
| 공개겉면 | src/index.ts차이0; dts동일SHA740dc55ca2f4f0503da3a7d6f968797a37cce7305e6d0d6b4d57c34e2b9158d6 |
| 기존기대/핀 | 808파일33822단언보존;74파일(24on/53off·중복3);plainfixture112직접/133간접 |
| Filid | 전체FAIL·분석indeterminate;201지적·변경된증거경로0;세snapshot동일 |

[게이트](raw/b4-1/candidate-1/gates.json), [배달](raw/b4-1/candidate-1/delivery.json), [공개겉면](raw/b4-1/candidate-1/public-surface.json), [핀 전체](raw/b4-1/candidate-1/pins.json), [Filid 전체 지적](raw/b4-1/candidate-1/fca.json). Filid의 기존 FieldProxy순환·58사례파일 및 문서·동적표 지적은 별도 검토 사항이며 통과로 취급하지 않습니다.

확실하지 않음: 기존 단일 후보 clear 배열은 명시 keep 자손까지 지우지만 후보 소유 배열은 이미 비활성이던 keep 원본을 남깁니다. 별표의 wildcard 숨김·항목 alias·packed 배열 복원 우선순위도 기존 동작을 보존했습니다. 두 의미는 B4-2 전에 소유자 결정이 필요합니다. 배열의 동일 템플릿 이동은 슬롯을 직접 옮기고, 지원하지 않는 튜플·미선언 꼬리 목적지는 영향받은 배열을 한 번 잠복 표현으로 전환합니다. 이 예외의 일회성 직렬화 비용과 B4-2 대체 의무를 유지합니다.
