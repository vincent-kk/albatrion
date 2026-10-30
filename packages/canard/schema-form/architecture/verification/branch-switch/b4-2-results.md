# B4-2 — latent 경로 제거와 슬롯 없는 쓰기 비용

**채택 — 편집자 결정(459라운드): 공개 동작 불변·과제 둘 통과·주판정 0·Node 힙 통과, 개별 단계 6건 1 µs 미만 악화와 payload-12 +1.3 %는 창 흐름 안이라 기록한 채 채택, 소유자 재검증 목록**

고정 장치 원판정은 **채택 조건 미충족**입니다. 단계6건의 원판정과 원수치는 그대로 보존하고 코디네이터의 편집자 결정을 별도로 기록합니다. 측정 후 제품 소스와 장치는 수정하지 않았으며 재측정이나 되돌리기를 하지 않았습니다. 검토와 소유자 재검증이 남으며 이후 되돌림은 PR revert로 판단합니다. [편집자 결정](raw/b4-2/editorial-decision.json).

## 측정 입력과 품질

| 항목      | 관측                                                                                              |
| --------- | ------------------------------------------------------------------------------------------------- |
| 기준 A    | 병합된 B4-1 `4c1016a021ef6fe92d5afe235f39c4a71722d4ee`, slots on                                  |
| 측정 B    | `813b32d175736841c3e71e1598c978892ebfbefc`; 제품 소스 `c632ab5f5`, 장치 `eda3caec9`               |
| 환경      | Node 26.12.1 / Bun 1.4.4 / Apple M1 Max / arm64 / Darwin 27.0.0                                   |
| 공식 창   | 2026-10-27 23:15:22–23:24:27 UTC; 공식 창 1회, 재시도 0                                           |
| 사전 확인 | AJV8 로컬 산출물 빌드 및 A/B 무계측 44동작 통과; 5.126초 CPU 사전 검사 heavy=[]                   |
| 주 측정   | 22행 × A/B 각 10개 새 프로세스 = 440개; 인접 A0/B0…A9/B9, 20예열·100표본                          |
| 대표값    | 각 프로세스의 최소 지연 중앙값; A=앞5, A′=뒤5, B=전체10                                           |
| 품질      | 동일 legacy 0.16.1 레인 18행의 B10/A10 중앙비 0.999759875; 0.95–1.05 통과, 모든 행 완료 후 판정   |
| 단계 측정 | 3행 × A/B 각3프로세스, 20예열·100쓰기; 양쪽 비교 타이머25개                                       |
| 보충 측정 | B 3행 × 3프로세스, helper 타이머76개; A manifest66개, 채택 판정 제외                              |
| 검증      | 원표본·행 순서·프로세스 고유성·표본 수·품질·Welch·단계/phase 장부 합계·불변 번들 해시 재계산 통과 |

[입력과 해시](raw/b4-2/inputs.json), [단계 함수 경계](raw/b4-2/stage-inputs.json), [품질](raw/b4-2/quality.json), [사전 점검](raw/b4-2/preflight.json), [CPU 전후](raw/b4-2/window.json), [장치 검증](raw/b4-2/tool-validation.json). 원표본과 실행 로그는 로컬에 보존하며 저장소에는 작은 요약만 기록합니다.

## 채택 관문

| 관문                          | 결과   | 근거                                                     |
| ----------------------------- | ------ | -------------------------------------------------------- |
| 공개 배달                     | 통과   | 72장면/430점 차이0, mount 6장면/12단계 차이0             |
| latentZero / inactiveMemoZero | 통과   | 세 비교 행의 모든 표본에서 일반 capture/store/memo 호출0 |
| siblings0 장부 / 비계측 지연  | 통과   | 각각 A 자체 폭 이내 또는 개선                            |
| oneOf80 markCommitDeliveries  | 통과   | A 자체 폭 이내                                           |
| 개별 단계 자체 폭             | 미충족 | oneOf80 1개, payload12 4개, siblings0 1개                |
| TEST-073                      | 통과   | 전체22행 주판정 회귀0; 앞5/뒤5 보조도0                   |
| Node 힙                       | 통과   | B 중앙값 ≤ A 최대값                                      |
| Bun 힙                        | 보고   | B 중앙값 > A 최대값; 채택 관문에 포함하지 않음           |

[원판정](raw/b4-2/judgement.json). entering 절반 목표는 B4-2 관문이 아닙니다. 아래 entering 합계는 새 복제·생성 비용을 숨기지 않도록 바깥 경계를 한 번만 합산하며 개별 단계 폭 관문에는 포함합니다.

| 행                | 구간          | A µs    | B µs    | A 자체 폭 µs | 판정 |
| ----------------- | ------------- | ------- | ------- | ------------ | ---- |
| switch-oneOf-80   | 장부 합계     | 176.229 | 171.791 | 10.292       | 통과 |
| switch-oneOf-80   | 비계측 지연   | 162.354 | 155.833 | 7.854        | 통과 |
| switch-oneOf-80   | entering 합계 | 8.125   | 8.480   | 0.416        | 통과 |
| switch-payload-12 | 장부 합계     | 283.895 | 292.979 | 20.834       | 통과 |
| switch-payload-12 | 비계측 지연   | 247.146 | 250.750 | 13.062       | 통과 |
| switch-payload-12 | entering 합계 | 16.812  | 17.560  | 0.395        | 초과 |
| switch-siblings-0 | 장부 합계     | 87.166  | 81.521  | 3.354        | 통과 |
| switch-siblings-0 | 비계측 지연   | 75.249  | 72.438  | 3.355        | 통과 |
| switch-siblings-0 | entering 합계 | 0.000   | 0.000   | 0.000        | 통과 |

## 편집자 결정의 집계와 재검증 목록

편집자가 인용한 장부 수치는 개별 단계 **자체 중앙값의 합**입니다. 공식 장치의 `ledgerSumUs`는 **매 표본의 자체 비용을 합한 뒤 얻는 중앙값**이므로 두 통계는 같지 않습니다. 위의 공식 장부 관문 수치를 바꾸지 않고 편집자 판단에 사용한 합을 따로 보고합니다.

| 행                | 자체 중앙값 합 A µs | B µs     | 변화%  |
| ----------------- | ------------------- | -------- | ------ |
| switch-oneOf-80   | 166.8545            | 165.2100 | -0.986 |
| switch-payload-12 | 276.2890            | 279.8785 | 1.299  |
| switch-siblings-0 | 82.1465             | 79.0430  | -3.778 |

payload12의 개별 중앙값 합은276.2890→279.8785µs(+1.299%)이고, 공식 summed-ledger 중앙값은283.8955→292.9785µs(+3.199%)입니다. 해당 본 측정의 A→A′는544.875→560.792µs(+15.917)입니다. 이 창에서 체계적 비용으로 확정하지 않는다는 것은 편집자 판단이며 개별 단계 폭 실패를 통과로 재분류하지 않습니다. 소유자 재검증 목록은 단계6건, payload12 집계, Bun B중앙값의 A최대 초과3.970B/node(A중앙 대비+11.415), 보존 원본·지연 읽기 메모의 수명입니다.

## 전체 22행

단위는 ms입니다. 폭(다)=max(|A−A′|, A앞5 범위, A′뒤5 범위)이며 B/A는 A전체10 기준입니다. B의 폭을 A 잡음으로 사용하지 않습니다.

| 행                          | A앞5      | B10       | A′뒤5     | A폭      | B폭      | A′폭     | 폭(다)   | B/A10 | legacy비 | 폭 판정 |
| --------------------------- | --------- | --------- | --------- | -------- | -------- | -------- | -------- | ----- | -------- | ------- |
| single-flat-1000            | 0.101125  | 0.076729  | 0.101084  | 0.052542 | 0.059333 | 0.054583 | 0.054583 | 0.759 | 0.966    | 미입증  |
| mount-oneOf-80              | 2.156958  | 2.167313  | 2.144000  | 0.156166 | 0.194875 | 0.116500 | 0.156166 | 1.011 | 0.991    | 미입증  |
| mount-flat-1000             | 2.112042  | 2.122354  | 2.103208  | 0.057250 | 0.110083 | 0.096250 | 0.096250 | 1.007 | 1.000    | 미입증  |
| mount-nested-d6-f4          | 15.682166 | 15.878208 | 15.849875 | 0.616541 | 0.605958 | 0.305541 | 0.616541 | 1.006 | 1.004    | 미입증  |
| single-nested-d6-f4         | 0.159000  | 0.176355  | 0.152333  | 0.059042 | 0.084084 | 0.037959 | 0.059042 | 1.149 | 1.018    | 미입증  |
| switch-oneOf-80             | 0.382167  | 0.374167  | 0.381291  | 0.202959 | 0.205917 | 0.145749 | 0.202959 | 0.980 | 0.875    | 미입증  |
| bulk-flat-2000              | 1.796000  | 1.807125  | 1.779208  | 0.150583 | 0.181125 | 0.112416 | 0.150583 | 1.012 | 0.988    | 미입증  |
| bulk-nested-d6-f4           | 4.037083  | 4.024958  | 4.059542  | 0.155668 | 0.169209 | 0.068708 | 0.155668 | 0.992 | 0.995    | 미입증  |
| switch-discriminator-80     | 0.260583  | 0.269292  | 0.274750  | 0.110542 | 0.092917 | 0.018166 | 0.110542 | 0.994 | —        | 미입증  |
| switch-if-80                | 0.417125  | 0.403833  | 0.397708  | 0.097917 | 0.106917 | 0.058750 | 0.097917 | 1.005 | —        | 미입증  |
| switch-nested-oneOf-20      | 0.620917  | 0.550000  | 0.531458  | 0.119083 | 0.234584 | 0.298625 | 0.298625 | 0.930 | 0.972    | 미입증  |
| switch-siblings-0           | 0.106625  | 0.102187  | 0.104625  | 0.011791 | 0.013874 | 0.009584 | 0.011791 | 0.970 | 1.017    | 미입증  |
| switch-siblings-100         | 0.279584  | 0.280021  | 0.263208  | 0.085500 | 0.093708 | 0.061042 | 0.085500 | 1.025 | 1.004    | 미입증  |
| switch-siblings-1000        | 2.058917  | 2.056437  | 2.054125  | 0.048584 | 0.133708 | 0.034959 | 0.048584 | 1.001 | 1.007    | 미입증  |
| switch-siblings-4000        | 6.554208  | 6.599084  | 6.580042  | 0.221625 | 0.326416 | 0.133000 | 0.221625 | 1.005 | 1.003    | 미입증  |
| leaf-gate-250               | 0.034542  | 0.033729  | 0.034875  | 0.003959 | 0.008792 | 0.004750 | 0.004750 | 0.968 | 0.942    | 미입증  |
| leaf-gate-1000              | 0.037750  | 0.035230  | 0.037208  | 0.004250 | 0.005667 | 0.009001 | 0.009001 | 0.945 | 0.997    | 미입증  |
| leaf-gate-4000              | 0.839417  | 0.821416  | 0.768458  | 0.194542 | 0.159666 | 0.152667 | 0.194542 | 1.022 | 1.024    | 미입증  |
| leaf-gate-8000              | 1.565875  | 1.560479  | 1.559542  | 0.028792 | 0.028916 | 0.027084 | 0.028792 | 0.998 | 1.003    | 미입증  |
| wave-1000                   | 1.736834  | 1.705187  | 1.709083  | 0.129459 | 0.071707 | 0.056291 | 0.129459 | 0.992 | —        | 미입증  |
| single-flat-1000-subscribed | 0.083875  | 0.087584  | 0.086250  | 0.019042 | 0.017417 | 0.005417 | 0.019042 | 1.022 | —        | 미입증  |
| switch-payload-12           | 0.544875  | 0.564521  | 0.560792  | 0.174875 | 0.223792 | 0.200000 | 0.200000 | 1.021 | 1.000    | 미입증  |

[프로세스별 최소값과 계산 근거](raw/b4-2/results.summary.json). 총합 측정은 단계별 타이머를 삽입하지 않은 독립 프로세스 장치이며 아래 단계 장부와 절대값을 직접 비교하지 않습니다.

## TEST-073

1000/ms 처리율의 Welch 검정입니다. 감소15% 초과와 p<0.05를 함께 적용하고, 전체 인접10쌍을 주판정으로 사용합니다.

| 행                          | 전체 변화% | 전체p    | 앞5 변화% / p     | 뒤5 변화% / p      | 주판정 회귀 |
| --------------------------- | ---------- | -------- | ----------------- | ------------------ | ----------- |
| single-flat-1000            | 10.546     | 2.97e-07 | 12.937 / 8.33e-06 | 8.198 / 0.00498    | 없음        |
| mount-oneOf-80              | -1.297     | 0.002    | -0.472 / 0.405    | -2.140 / 0.00041   | 없음        |
| mount-flat-1000             | -0.926     | 0.118    | -2.372 / 0.00528  | 0.510 / 0.533      | 없음        |
| mount-nested-d6-f4          | -0.398     | 0.503    | -0.641 / 0.456    | -0.156 / 0.85      | 없음        |
| single-nested-d6-f4         | -5.122     | 0.0105   | 2.192 / 0.465     | -12.727 / 7.92e-07 | 없음        |
| switch-oneOf-80             | 7.047      | 3.74e-05 | 1.549 / 0.49      | 12.650 / 9.03e-07  | 없음        |
| bulk-flat-2000              | -2.031     | 4.45e-07 | -0.089 / 0.879    | -3.931 / 8.4e-13   | 없음        |
| bulk-nested-d6-f4           | 0.487      | 0.516    | 0.652 / 0.529     | 0.319 / 0.768      | 없음        |
| switch-discriminator-80     | -1.073     | 0.211    | -6.962 / 2.15e-08 | 5.415 / 2.3e-06    | 없음        |
| switch-if-80                | -1.101     | 0.06     | 2.071 / 0.0159    | -4.148 / 1.66e-07  | 없음        |
| switch-nested-oneOf-20      | 2.626      | 0.0379   | 7.494 / 4.98e-05  | -1.727 / 0.313     | 없음        |
| switch-siblings-0           | 5.939      | 0.00559  | 1.891 / 0.547     | 9.858 / 0.0007     | 없음        |
| switch-siblings-100         | 2.155      | 0.206    | -3.597 / 0.114    | 8.089 / 0.00142    | 없음        |
| switch-siblings-1000        | -2.740     | 1.68e-07 | -0.895 / 0.232    | -4.558 / 4.43e-10  | 없음        |
| switch-siblings-4000        | -1.399     | 7.9e-09  | -1.245 / 0.000325 | -1.553 / 4.83e-06  | 없음        |
| leaf-gate-250               | 2.093      | 0.407    | 14.699 / 0.000126 | -7.969 / 0.0163    | 없음        |
| leaf-gate-1000              | 13.250     | 9.53e-07 | 23.053 / 1.92e-08 | 4.872 / 0.172      | 없음        |
| leaf-gate-4000              | -1.055     | 0.178    | 3.172 / 0.00703   | -5.180 / 4.87e-07  | 없음        |
| leaf-gate-8000              | 0.528      | 0.0138   | 0.794 / 0.0126    | 0.264 / 0.36       | 없음        |
| wave-1000                   | 1.112      | 0.00439  | 0.482 / 0.406     | 1.737 / 0.000824   | 없음        |
| single-flat-1000-subscribed | -1.377     | 0.176    | -3.843 / 0.00722  | 1.198 / 0.407      | 없음        |
| switch-payload-12           | -2.317     | 0.149    | -0.181 / 0.932    | -4.409 / 0.0659    | 없음        |

## 단계 장부

단위는 µs입니다. 프로세스별100쓰기의 중앙값을 구한 뒤3프로세스의 중앙값을 사용합니다. A 자체 폭은 A의 세 프로세스 중앙값 max−min입니다. 각 비교 단계의 포함 비용과 가장 바깥 entering 합계에 같은 폭 규칙을 적용했습니다. `everythingElse`를 포함한 자체 비용의 합은 매 표본 wrapped 경과시간과 일치합니다. 중첩 생성은 entering에서 한 번만 세고, 타이머 오버헤드는 빼지 않습니다.

| 행                | 단계                     | A자체  | B자체  | A포함   | B포함   | A폭   | 최대호출 A/B | 악화 |
| ----------------- | ------------------------ | ------ | ------ | ------- | ------- | ----- | ------------ | ---- |
| switch-oneOf-80   | markWrite                | 1.583  | 1.563  | 1.583   | 1.563   | 0.189 | 1/1          | 없음 |
| switch-oneOf-80   | registerRecalculation    | 12.520 | 12.687 | 12.520  | 12.687  | 0.500 | 1/1          | 없음 |
| switch-oneOf-80   | computeNode              | 32.627 | 32.396 | 98.020  | 98.666  | 6.188 | 5/5          | 없음 |
| switch-oneOf-80   | wheelPreparation         | 2.750  | 2.750  | 8.083   | 7.875   | 0.541 | 1/1          | 없음 |
| switch-oneOf-80   | primeHost                | 2.458  | 2.417  | 2.458   | 2.417   | 0.145 | 1/1          | 없음 |
| switch-oneOf-80   | selectChildren           | 27.917 | 28.187 | 53.541  | 53.875  | 3.895 | 1/1          | 없음 |
| switch-oneOf-80   | evaluateGate             | 0.000  | 0.000  | 0.000   | 0.000   | 0.000 | 0/0          | 없음 |
| switch-oneOf-80   | runDeriveRounds          | 0.000  | 0.000  | 0.000   | 0.000   | 0.000 | 0/0          | 없음 |
| switch-oneOf-80   | transitionSettlement     | 3.958  | 3.875  | 3.958   | 3.875   | 0.249 | 1/1          | 없음 |
| switch-oneOf-80   | finalizeExits            | 19.104 | 19.709 | 23.625  | 24.271  | 0.750 | 1/1          | 없음 |
| switch-oneOf-80   | getControlLayers         | 1.416  | 1.458  | 1.416   | 1.458   | 0.085 | 6/6          | 없음 |
| switch-oneOf-80   | captureExitedRaw         | 0.000  | 0.000  | 0.000   | 0.000   | 0.000 | 0/0          | 없음 |
| switch-oneOf-80   | setLatentRaw             | 0.000  | 0.000  | 0.000   | 0.000   | 0.000 | 0/0          | 없음 |
| switch-oneOf-80   | updateOutput             | 7.230  | 7.167  | 16.750  | 16.457  | 0.750 | 6/6          | 없음 |
| switch-oneOf-80   | assembleObject           | 9.166  | 9.042  | 9.166   | 9.042   | 0.333 | 2/2          | 없음 |
| switch-oneOf-80   | commitSettlement         | 9.688  | 9.375  | 22.708  | 22.605  | 3.625 | 1/1          | 없음 |
| switch-oneOf-80   | updateInactiveValuesMemo | 0.000  | 0.000  | 0.000   | 0.000   | 0.000 | 0/0          | 없음 |
| switch-oneOf-80   | markCommitDeliveries     | 12.041 | 12.000 | 12.041  | 12.000  | 1.750 | 1/1          | 없음 |
| switch-oneOf-80   | createChildNode          | 0.000  | 0.000  | 0.000   | 0.000   | 0.000 | 0/0          | 없음 |
| switch-oneOf-80   | enterFieldNode           | 0.000  | 0.000  | 0.000   | 0.000   | 0.000 | 0/0          | 없음 |
| switch-oneOf-80   | restoreLatentState       | 0.000  | 0.000  | 0.000   | 0.000   | 0.000 | 0/0          | 없음 |
| switch-oneOf-80   | createFieldNode          | 0.000  | 0.000  | 0.000   | 0.000   | 0.000 | 3/3          | 없음 |
| switch-oneOf-80   | cloneFromSlot            | 7.730  | 8.021  | 7.730   | 8.021   | 0.438 | 3/3          | 없음 |
| switch-oneOf-80   | enterSlotClone           | 0.709  | 0.750  | 0.709   | 0.750   | 0.001 | 3/3          | 있음 |
| switch-oneOf-80   | createFromSlotOverlay    | 0.000  | 0.000  | 0.000   | 0.000   | 0.000 | 0/0          | 없음 |
| switch-oneOf-80   | everythingElse           | 15.957 | 13.814 | 15.957  | 13.814  | 1.397 | 1/1          | 없음 |
| switch-payload-12 | markWrite                | 1.541  | 1.583  | 1.541   | 1.583   | 0.145 | 1/1          | 없음 |
| switch-payload-12 | registerRecalculation    | 18.459 | 19.104 | 18.459  | 19.104  | 0.249 | 1/1          | 있음 |
| switch-payload-12 | computeNode              | 46.293 | 46.707 | 176.477 | 180.834 | 9.771 | 14/14        | 없음 |
| switch-payload-12 | wheelPreparation         | 3.396  | 3.542  | 7.771   | 7.750   | 0.187 | 1/1          | 없음 |
| switch-payload-12 | primeHost                | 2.333  | 2.333  | 2.333   | 2.333   | 0.187 | 1/1          | 없음 |
| switch-payload-12 | selectChildren           | 50.000 | 51.394 | 115.500 | 121.166 | 9.146 | 1/1          | 없음 |
| switch-payload-12 | evaluateGate             | 0.000  | 0.000  | 0.000   | 0.000   | 0.000 | 0/0          | 없음 |
| switch-payload-12 | runDeriveRounds          | 0.000  | 0.000  | 0.000   | 0.000   | 0.000 | 0/0          | 없음 |
| switch-payload-12 | transitionSettlement     | 7.709  | 8.041  | 7.709   | 8.041   | 0.209 | 1/1          | 있음 |
| switch-payload-12 | finalizeExits            | 35.956 | 37.253 | 42.209  | 43.605  | 4.063 | 1/1          | 없음 |
| switch-payload-12 | getControlLayers         | 3.457  | 3.501  | 3.457   | 3.501   | 0.145 | 24/24        | 없음 |
| switch-payload-12 | captureExitedRaw         | 0.000  | 0.000  | 0.000   | 0.000   | 0.000 | 0/0          | 없음 |
| switch-payload-12 | setLatentRaw             | 0.000  | 0.000  | 0.000   | 0.000   | 0.000 | 0/0          | 없음 |
| switch-payload-12 | updateOutput             | 7.149  | 7.126  | 41.708  | 43.813  | 3.042 | 15/15        | 없음 |
| switch-payload-12 | assembleObject           | 34.167 | 36.188 | 34.167  | 36.188  | 2.416 | 2/2          | 없음 |
| switch-payload-12 | commitSettlement         | 14.458 | 13.917 | 29.813  | 30.499  | 2.833 | 1/1          | 없음 |
| switch-payload-12 | updateInactiveValuesMemo | 0.000  | 0.000  | 0.000   | 0.000   | 0.000 | 0/0          | 없음 |
| switch-payload-12 | markCommitDeliveries     | 15.229 | 15.458 | 15.229  | 15.458  | 0.812 | 1/1          | 없음 |
| switch-payload-12 | createChildNode          | 0.000  | 0.000  | 0.000   | 0.000   | 0.000 | 0/0          | 없음 |
| switch-payload-12 | enterFieldNode           | 0.000  | 0.000  | 0.000   | 0.000   | 0.000 | 0/0          | 없음 |
| switch-payload-12 | restoreLatentState       | 0.000  | 0.000  | 0.000   | 0.000   | 0.000 | 0/0          | 없음 |
| switch-payload-12 | createFieldNode          | 0.000  | 0.000  | 0.000   | 0.000   | 0.000 | 12/12        | 없음 |
| switch-payload-12 | cloneFromSlot            | 16.041 | 16.792 | 16.041  | 16.792  | 0.311 | 12/12        | 있음 |
| switch-payload-12 | enterSlotClone           | 1.915  | 1.937  | 1.915   | 1.937   | 0.043 | 12/12        | 없음 |
| switch-payload-12 | createFromSlotOverlay    | 0.000  | 0.000  | 0.000   | 0.000   | 0.000 | 0/0          | 없음 |
| switch-payload-12 | everythingElse           | 18.187 | 15.000 | 18.187  | 15.000  | 1.065 | 1/1          | 없음 |
| switch-siblings-0 | markWrite                | 1.500  | 1.500  | 1.500   | 1.500   | 0.042 | 1/1          | 없음 |
| switch-siblings-0 | registerRecalculation    | 6.521  | 6.688  | 6.521   | 6.688   | 0.042 | 1/1          | 있음 |
| switch-siblings-0 | computeNode              | 14.353 | 13.939 | 54.270  | 52.208  | 0.313 | 4/4          | 없음 |
| switch-siblings-0 | wheelPreparation         | 2.438  | 2.418  | 8.084   | 8.021   | 0.229 | 1/1          | 없음 |
| switch-siblings-0 | primeHost                | 3.250  | 3.250  | 3.250   | 3.250   | 0.042 | 1/1          | 없음 |
| switch-siblings-0 | selectChildren           | 15.251 | 15.270 | 25.959  | 25.001  | 0.792 | 1/1          | 없음 |
| switch-siblings-0 | evaluateGate             | 5.063  | 5.147  | 5.063   | 5.147   | 0.167 | 6/6          | 없음 |
| switch-siblings-0 | runDeriveRounds          | 0.000  | 0.000  | 0.000   | 0.000   | 0.000 | 0/0          | 없음 |
| switch-siblings-0 | transitionSettlement     | 1.250  | 1.250  | 1.250   | 1.250   | 0.041 | 1/1          | 없음 |
| switch-siblings-0 | finalizeExits            | 0.000  | 0.000  | 0.000   | 0.000   | 0.000 | 0/0          | 없음 |
| switch-siblings-0 | getControlLayers         | 0.000  | 0.000  | 0.000   | 0.000   | 0.000 | 0/0          | 없음 |
| switch-siblings-0 | captureExitedRaw         | 0.000  | 0.000  | 0.000   | 0.000   | 0.000 | 0/0          | 없음 |
| switch-siblings-0 | setLatentRaw             | 0.000  | 0.000  | 0.000   | 0.000   | 0.000 | 0/0          | 없음 |
| switch-siblings-0 | updateOutput             | 3.749  | 3.667  | 6.313   | 6.332   | 0.146 | 4/4          | 없음 |
| switch-siblings-0 | assembleObject           | 2.542  | 2.541  | 2.542   | 2.541   | 0.042 | 1/1          | 없음 |
| switch-siblings-0 | commitSettlement         | 3.375  | 3.292  | 12.333  | 12.021  | 0.188 | 1/1          | 없음 |
| switch-siblings-0 | updateInactiveValuesMemo | 0.000  | 0.000  | 0.000   | 0.000   | 0.000 | 0/0          | 없음 |
| switch-siblings-0 | markCommitDeliveries     | 8.896  | 8.604  | 8.896   | 8.604   | 0.459 | 1/1          | 없음 |
| switch-siblings-0 | createChildNode          | 0.000  | 0.000  | 0.000   | 0.000   | 0.000 | 0/0          | 없음 |
| switch-siblings-0 | enterFieldNode           | 0.000  | 0.000  | 0.000   | 0.000   | 0.000 | 0/0          | 없음 |
| switch-siblings-0 | restoreLatentState       | 0.000  | 0.000  | 0.000   | 0.000   | 0.000 | 0/0          | 없음 |
| switch-siblings-0 | createFieldNode          | 0.000  | 0.000  | 0.000   | 0.000   | 0.000 | 0/0          | 없음 |
| switch-siblings-0 | cloneFromSlot            | 0.000  | 0.000  | 0.000   | 0.000   | 0.000 | 0/0          | 없음 |
| switch-siblings-0 | enterSlotClone           | 0.000  | 0.000  | 0.000   | 0.000   | 0.000 | 0/0          | 없음 |
| switch-siblings-0 | createFromSlotOverlay    | 0.000  | 0.000  | 0.000   | 0.000   | 0.000 | 0/0          | 없음 |
| switch-siblings-0 | everythingElse           | 13.958 | 11.479 | 13.958  | 11.479  | 0.458 | 1/1          | 없음 |

[전체 단계 요약](raw/b4-2/stages.json)은 할당량과 프로세스 중앙값도 보존합니다. A/B 모두25개 경계를 계측합니다. literal-star 전용 함수는 기존 capture/store/memo 레이블에 대응시켜 manifest에 실제 함수명을 함께 적었습니다. 일반 장면에서 이 이름들의 최대 호출은0입니다.

다음6개가 전체 판정을 막았습니다. payload의 entering 합계는 clone 비용과 중첩되는 총괄 지표이므로 여섯 차이를 합산한 회귀량으로 해석하지 않습니다.

| 행                | 단계                  | A         | B         | 차이     | A폭      |
| ----------------- | --------------------- | --------- | --------- | -------- | -------- |
| switch-oneOf-80   | enterSlotClone        | 0.709000  | 0.749500  | 0.040500 | 0.000500 |
| switch-payload-12 | registerRecalculation | 18.458500 | 19.104000 | 0.645500 | 0.249500 |
| switch-payload-12 | transitionSettlement  | 7.708500  | 8.041500  | 0.333000 | 0.209000 |
| switch-payload-12 | cloneFromSlot         | 16.041000 | 16.792500 | 0.751500 | 0.311500 |
| switch-payload-12 | enteringNodes         | 16.812500 | 17.560500 | 0.748000 | 0.395000 |
| switch-siblings-0 | registerRecalculation | 6.521000  | 6.687500  | 0.166500 | 0.042000 |

## 비용 진단과 구현 범위

사전 보충 진단에서 siblings0은 쓰기마다 `isSlotEligible`5회와 빈 `pruneSlotSources`1회를 수행했습니다. immutable occurrence 준비 시 source-free 증명을 캐시하여 전용 pruner를 고르고, 후보가 없는 부모와 기존 live node의 source 조회를 건너뜁니다. 추가된 호출 수 시험은 슬롯 없는 쓰기의 eligibility/pruning/overlay 호출0을 확인합니다. 증명은 같은 occurrence와 blueprint 수명 안에서 load/reset 및 동형 배열 rekey에 재사용하며, 새 occurrence/blueprint와 mode generation은 새 캐시를 얻습니다. 배열은 보존된 항목 원본이 들어올 수 있으므로 일반 pruning을 유지합니다.

사전 동일 B4-1 소스 off/on 추적에서는 entered/changed/delivery 방문·revision·gate registration 수가 같았습니다. 추가 clone 배달 등록이라는 가설은 지지되지 않았고, 이전 +2.062µs의 정확한 원인은 미규명입니다. `markCommitDeliveries` 본문을 바꾸어 원인을 해결했다고 주장하지 않습니다. 이번 고정 비교에서 12.0415→12.0000µs(A폭1.7505)로 목표를 통과한 사실만 확인합니다. [진단](raw/b4-2/diagnosis.json).

일반 off/verify와 shadow 저장·비교 장치 및 map serialization 경로를 제거했습니다. 슬롯이 원본·overlay·이전 공표 상태를 소유합니다. 별표 이름 호환은 `root.containsLiteralStar`가 참인 폼 전체에서만 활성화됩니다. 전용20파일·1,275줄·48,162바이트이고 공유 파일의 조건부 분기/선언168개 위치는 이 크기에 포함하지 않고 [삭제·이동·호환 목록](raw/b4-2/source-removal.json)에 별도로 적었습니다. 일반 factory는 호환 저장소를 생성하지 않습니다.

같은 blueprint 배열 항목의 이동은 원본 슬롯을 직접 옮기며 clone/합성0과 영향 항목에 비례하는 방문 수를 시험합니다. 서로 다른 blueprint의 중첩 tuple 재구성은 재귀 복제를 유지하므로 O(하위 트리 크기 × 재생성 깊이) 한계가 남습니다. 단일 후보 배열과 별표 숨김 결과의 제품 판단은 이번 범위에서 변경하지 않았습니다.

공개 기대를 지키기 위해 other-kind retained source가 host default를 차단하는 경우, 비활성 배열의 선언 밖 tail overlay, whole-write로 교체된 경로의 exiting wrong-kind 원본 재포획을 바로잡았습니다. 분산 input의 우선순위와 배열 원본 조회도 슬롯 표현으로 이식했습니다. 떼어진 쓰기 공표 시점은 off와 같음([재현6행](raw/b4-2/detached-publication.json)).

## 별표 예외의 실측 비용

| 폼         | hide/close capture·store·memo 최대호출/쓰기 | fixture 보존 바이트 | 호환 store 수 |
| ---------- | ------------------------------------------- | ------------------- | ------------- |
| 일반 이름  | 0,0,0 / 0,0,0                               | 121624              | 0             |
| literal \* | 1,1,1 / 1,1,1                               | 126600              | 4             |

별표 fixture 보존량 차이는4,976바이트입니다. 이 비교는 이름만 다른 두 fixture의 V8 strong-edge dominator 관찰이며 타이밍 채택 근거가 아닙니다. 일반 이름의 모든 fallback store는 존재하지 않아0바이트입니다. 별표 store별 바이트는 공유 객체를 제외하며 전체 fixture 차이와 같지 않습니다. [별표 비용](raw/b4-2/wildcard-cost.json).

## 힙과 슬롯 보존량

| 런타임 | A 중앙 B/node | A 최대   | B 중앙   | 관문   |
| ------ | ------------- | -------- | -------- | ------ |
| node   | 1447.455      | 1893.701 | 1440.346 | 통과   |
| bun    | 2239.151      | 2246.596 | 2250.566 | 보고만 |

각7표본이며 [전체 힙 표본](raw/b4-2/heaps.json)을 보존합니다.

| 행                | 슬롯 | 보존 노드 | 읽기 전 B | 읽기 후 B | reset 후 slot Map |
| ----------------- | ---- | --------- | --------- | --------- | ----------------- |
| switch-oneOf-80   | 3    | 3         | 5336      | 5656      | 0                 |
| switch-payload-12 | 12   | 12        | 18120     | 18696     | 0                 |
| switch-siblings-0 | 0    | 0         | 0         | 0         | 0                 |

읽기 후 보존량이 늘어난 이유는 슬롯의 보존 원본에 `inactiveValueMemo`와 동결된 공표 entry가 지연 생성되어 새로 달리기 때문입니다(oneOf +320B, payload +576B); 슬롯 수는3/12로 같습니다. `readSlotValueEntry`가 원본에 메모를 보유하고 reset에서 해당 slot Map이 사라지는 것을 확인했습니다.

120쓰기 후 V8 strong-edge immediate dominator로 각 inactiveSlots Map이 독점 보유한 원본 트리 바이트를 측정했습니다. 공통 blueprint와 외부에서 보유한 detached 참조는 이 추정치 밖입니다. 중첩 Map은 바이트가 겹칠 수 있어 합산하지 않습니다. resetSubtree·배달 drain·full GC2회 후 slot Map은 모두0입니다. 서로 다른 snapshot의 수치 heap ID 일치는 객체 생존 증거가 아닙니다. [보존량·수명 한계](raw/b4-2/retention.json).

## 기능·공개 계약·FCA 검증

| 검증                      | 결과                                                                         |
| ------------------------- | ---------------------------------------------------------------------------- |
| typecheck / lint / build  | 모두 exit0; lint 오류0·경고0                                                 |
| test --run, 다섯 프로젝트 | 928파일·5,595통과·기존 todo1·실패0, 634.27초                                 |
| test:verify --run         | 695파일·4,607통과·기존 todo1·실패0, 483.95초                                 |
| 공개 배달                 | 72장면/430점 차이0; mount6장면/12단계 차이0                                  |
| 공개 표면                 | src/index.ts·publicSurface.test.ts 변경 없음; index.d.ts 3,054바이트 SHA동일 |
| pin 제거                  | 기준 목록77파일의 off/on pin 제거, 남은 source mode pin0                     |
| FCA                       | 전체 FAIL / analysis indeterminate; validate201기존 지적·신규0               |

검증 명령·종료 상태는 [gates](raw/b4-2/gates.json), 배달 결과는 [delivery](raw/b4-2/delivery.json)와 [mount](raw/b4-2/mount-delivery.json), 선언 해시는 [public surface](raw/b4-2/public-surface.json)에 있습니다. 공개 관측 oracle은 고정 B4-1 off이며 타이밍 기준 A는 B4-1 on입니다. 기존 물리 latent map 관측만 retired channel로 제외하고 공개 값·delivery·revision·scheduling 기대는 유지했습니다.

초기4GiB 실행의 힙 고갈과 겹친 예비 실행의 브라우저 연결 종료는 최종 결과에서 제외하고 기록했습니다. 최종 두 전체 suite는 8GiB 설정으로 하나씩 실행했으며 실패를 숨기지 않았습니다. 빌드 기록은 제품 커밋 뒤 별도 `813b32d17`에 두었습니다. runtime bundle/adapter는 저장소의 생성물 제외 규칙을 따르며 [build](raw/b4-2/build.json)에 바이트·해시를 보존합니다.

FCA는 scan376노드·depth9·위반200, validate201지적, verification691파일·위반22·fragmentation0입니다. 동일 snapshot `5141343990ac4e9cd80dbfb10fc88398a63e9a9ac57dcda0734008e191efb634`를 사용했습니다. exact facts1,603개 외 unsupported173개를 pass로 바꾸지 않았습니다. B4-1 대비 신규 지적0이며 FCA 전체 통과라는 주장은 하지 않습니다. `src/app` 제품 코드는 바꾸지 않았고 승인된 `app/cache/DETAIL.md` 문서 포인터1개만 이동 주소에 맞췄습니다. [전체 기존 지적](raw/b4-2/fca.json).

## B4-1 슬롯 경로의 공개 계약 결함과 기준선 실패

기존 공개 기대를 불변 B4-1 off/on과 B4-2 번들에 동일하게 적용했습니다. 무계측9행(두 결함 중 tail은 선언 순서2방향)에서 off는3/3통과, on은3/3실패, B는3/3통과했습니다. 제품이나 성능 장치를 고치지 않고 기존 실패의 기준선 비교 근거를 추가 보존했습니다.

| 기존 시험                                                                                                   | 기대                                                                  | B4-1 on 실제                              | B4-2           |
| ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------- | -------------- |
| settle.value-model.test.ts / 26C-14 OPEN-4                                                                  | 다른 kind 원본 old가 host default D를 막아 number default7            | D                                         | 7              |
| settle.candidate-source-preservation-inactive-write.test.ts / retains off-write length and undeclared tails | [null, tail, {extra:true}], 이후 [7 또는 7문자열, tail, {extra:true}] | tail 두 자리가 null로 손실(정방향·역방향) | 기존 기대 유지 |

[동일 기대의 실패/통과9행과 번들 해시](raw/b4-2/public-contract-conflicts.json), [실행 재현 장치](raw/b4-2/reproduce-public-contract-conflicts.mjs). whole-write의 wrong-kind 재포획 방지는 원본 이전 과정에서 같은 기존 계약을 유지한 수정이며 세 번째 B4-1 공개 결함으로 세지 않습니다. 떼어진 쓰기 공표 시점은 off와 같음([재현6행](raw/b4-2/detached-publication.json)).

## 시험 이식과 제거 추적

[77파일 pin 목록](raw/b4-2/pin-removals.json), [101파일의 단언·case별 이식 목록](raw/b4-2/test-migrations.json), [172개 기준선 삭제 행과 경로 이동](raw/b4-2/source-removal.json)을 제공합니다. 삭제 행172개 중 제품 소스165개·문서7개이며 파일67개에 걸칩니다. 실제 삭제된 코드, slots로 옮긴 조회/원본 주소, literal-star 전용으로 남긴 기능을 혼동하지 않도록 이전·새 경로를 함께 기록했습니다.

일반 물리 map을 직접 보던 단언은 실제 슬롯 원본/own-source를 확인하도록 옮겼습니다. off 전용·verify oracle·도달 불가능한 synthetic global-map key 사례와 latent map 방문 수 사례의 제거·대체는 목록에 case 이름과 기존 단언을 남겼습니다. 공개 값이나 동결된 옛 참조의 기대를 바꾸어 맞추지 않았습니다. 두 dispatch 시험과 원본 관찰 fixture는 검증 대상 소유자인 settle 아래로 옮겼으며 export 확대나 경계 면제는 추가하지 않았습니다.

### import 모델의 검증 배치 조정

| 이전 주소                                                        | 최종 주소                                                               |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------- |
| src/core/engine/write/**tests**/dispatch.batch.test.ts           | src/core/engine/settle/**tests**/dispatch.batch.test.ts                 |
| src/core/engine/write/**tests**/dispatch.closing-branch.test.ts  | src/core/engine/settle/**tests**/dispatch.closing-branch.test.ts        |
| src/core/engine/**tests**/fixtures/collectRetainedSlotSources.ts | src/core/engine/settle/**tests**/fixtures/collectRetainedSlotSources.ts |
| src/core/engine/**tests**/fixtures/readInactiveValuesAt.ts       | src/core/engine/settle/**tests**/fixtures/readInactiveValuesAt.ts       |
| src/core/engine/**tests**/fixtures/readRetainedSlotRaw.ts        | src/core/engine/settle/**tests**/fixtures/readRetainedSlotRaw.ts        |

두 시험은 기준선 대비 이동이며 fixture3개는 이번 구현 도중 새로 만든 관찰 장치의 최종 배치 조정입니다. [배치 근거](raw/b4-2/import-placement.json).

기준선 주소가 사라진 파일은56개이며 이 중29개는 의미에 따라 slots/detached/literal-star로 이동했습니다. `.detached` 직접 읽기를 포함한 제거·대체 행은10개(일반8·shadow2)이고, 별도로 `captureDetachedFieldNodeReads`의 전역 inactive memo 읽기1개를 슬롯 공표 관측으로 바꿨습니다. 이 수는 전체 detached 지원 제거를 뜻하지 않습니다.

| 기준선 파일                                                          | detached 읽기 제거·대체 행 |
| -------------------------------------------------------------------- | -------------------------- |
| src/core/engine/settle/utils/commit/commitSettlement.ts              | 261                        |
| src/core/engine/settle/utils/commit/commitSettlement.ts              | 275                        |
| src/core/engine/settle/utils/latent/readLatentSlotSource.ts          | 51                         |
| src/core/engine/settle/utils/latent/readRawTree.ts                   | 29                         |
| src/core/engine/settle/utils/latent/readRawTree.ts                   | 33                         |
| src/core/engine/settle/utils/latentStore/hasLatentUnder.ts           | 23                         |
| src/core/engine/settle/utils/slots/materializeInactiveSlotValues.ts  | 21                         |
| src/core/engine/settle/utils/transition/applyExitClearing.ts         | 23                         |
| src/core/engine/settle/utils/verify/compareSlotShadowObservations.ts | 85                         |
| src/core/engine/settle/utils/verify/synchronizeSlotShadowInputs.ts   | 61                         |

### 시험 파일별 이식·삭제 원장

아래 수는 case 선언 기준입니다. each의 확장 실행 수와 다르며 상세 기대와 대체 근거는 [원장](raw/b4-2/test-migrations.json)의 동일 파일 항목에 있습니다.

| 파일                                                                                                                  | 단언 이식 | 삭제 case | 추가 case | 행렬 축소 |
| --------------------------------------------------------------------------------------------------------------------- | --------- | --------- | --------- | --------- |
| src/core/engine/settle/**tests**/selectChildren.head-differential.test.ts                                             | 1         | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.array-legacy-ports.test.ts                                                    | 1         | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.array-lifecycle.test.ts                                                       | 5         | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.array-scaling.test.ts                                                         | 1         | 1         | 1         | 0         |
| src/core/engine/settle/**tests**/settle.array-verbs.test.ts                                                           | 2         | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.array-write.test.ts                                                           | 1         | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.branch-switch-const.test.ts                                                   | 1         | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.candidate-source-preservation-controls.test.ts                                | 2         | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.candidate-source-preservation-exit-cost.test.ts                               | 2         | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.candidate-source-preservation-gate.test.ts                                    | 1         | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.candidate-source-preservation-inactive-write.test.ts                          | 4         | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.candidate-source-preservation-stale.test.ts                                   | 1         | 2         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.commit.test.ts                                                                | 11        | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.conflict.test.ts                                                              | 1         | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.context-preparation.test.ts                                                   | 1         | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.controls-context.test.ts                                                      | 1         | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.derive-shadow-setup.test.ts                                                   | 1         | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.empty-phases.test.ts                                                          | 1         | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.error-gate-exits.test.ts                                                      | 2         | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.exit-and-budget.test.ts                                                       | 6         | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.exit-direct-ownership.test.ts                                                 | 2         | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.exit-latent.test.ts                                                           | 4         | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.exit-layers.test.ts                                                           | 14        | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.exit-preparation.test.ts                                                      | 3         | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.extras-single-compare.test.ts                                                 | 1         | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.gate-selection-preparation-invariants.test.ts                                 | 2         | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.gate-table-loading.test.ts                                                    | 1         | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.gate-table-mutations.test.ts                                                  | 1         | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.item-fold-selection.test.ts                                                   | 3         | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.latent-candidate-ownership-controls.test.ts                                   | 1         | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.latent-candidate-ownership-enclosing.test.ts                                  | 1         | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.latent-candidate-ownership-inactive-move.test.ts                              | 1         | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.latent-candidate-ownership-policy.test.ts                                     | 4         | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.latent-candidate-ownership-retention.test.ts                                  | 1         | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.latent-candidate-ownership-stale-policy.test.ts                               | 0         | 1         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.latent-candidate-ownership-stale.test.ts                                      | 0         | 1         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.latent-candidate-ownership.test.ts                                            | 1         | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.pending-exit-key.test.ts                                                      | 1         | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.reentry.test.ts                                                               | 13        | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.retained-slot-array-policy.test.ts                                            | 1         | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.retained-slot-capture.test.ts                                                 | 1         | 1         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.retained-slot-lazy-read.test.ts                                               | 1         | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.retained-slot-shadow.test.ts                                                  | 0         | 2         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.retained-slot-verify-delivery.test.ts                                         | 4         | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.retained-slot-verify-nested.test.ts                                           | 3         | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.retained-slot-verify-oracle.test.ts                                           | 0         | 8         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.retained-slot-verify-policy.test.ts                                           | 2         | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.retained-slot-wildcard.test.ts                                                | 2         | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.scalar-latent-scope.test.ts                                                   | 1         | 2         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.static-same-value-write-fallback.test.ts                                      | 2         | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.transition.test.ts                                                            | 3         | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.union-fold-latent.test.ts                                                     | 2         | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.union-fold-rules.test.ts                                                      | 1         | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.value-model.test.ts                                                           | 9         | 0         | 0         | 0         |
| src/core/engine/settle/**tests**/settle.write-epoch.test.ts                                                           | 0         | 1         | 0         | 0         |
| src/core/engine/settle/arrangeFieldNodeItems/**tests**/arrange.candidate-source-preservation-exits.test.ts            | 1         | 0         | 0         | 0         |
| src/core/engine/settle/arrangeFieldNodeItems/**tests**/arrange.candidate-source-preservation-tail-scope.test.ts       | 1         | 0         | 0         | 0         |
| src/core/engine/settle/arrangeFieldNodeItems/**tests**/arrange.candidate-source-preservation-tail.test.ts             | 1         | 0         | 0         | 0         |
| src/core/engine/settle/arrangeFieldNodeItems/**tests**/arrange.latent-candidate-ownership-absent-destinations.test.ts | 1         | 0         | 0         | 0         |
| src/core/engine/settle/arrangeFieldNodeItems/**tests**/arrange.latent-candidate-ownership-inactive-source.test.ts     | 1         | 0         | 0         | 0         |
| src/core/engine/settle/arrangeFieldNodeItems/**tests**/arrange.latent-candidate-ownership-live-descendants.test.ts    | 1         | 0         | 0         | 0         |
| src/core/engine/settle/arrangeFieldNodeItems/**tests**/arrange.latent-candidate-ownership-nested-array.test.ts        | 1         | 0         | 0         | 0         |
| src/core/engine/settle/arrangeFieldNodeItems/**tests**/arrange.latent-candidate-ownership-replay-contract.test.ts     | 1         | 0         | 0         | 0         |
| src/core/engine/settle/arrangeFieldNodeItems/**tests**/arrange.latent-candidate-ownership-replay-mutations.test.ts    | 1         | 0         | 0         | 0         |
| src/core/engine/settle/arrangeFieldNodeItems/**tests**/arrange.latent-candidate-ownership-root.test.ts                | 1         | 0         | 0         | 0         |
| src/core/engine/settle/arrangeFieldNodeItems/**tests**/arrange.latent-candidate-ownership-unrelated-slots.test.ts     | 1         | 0         | 0         | 0         |
| src/core/engine/settle/arrangeFieldNodeItems/**tests**/arrange.latent-candidate-ownership.test.ts                     | 5         | 0         | 0         | 0         |
| src/core/engine/settle/arrangeFieldNodeItems/**tests**/arrange.retained-source-absent.test.ts                         | 1         | 0         | 0         | 0         |
| src/core/engine/settle/arrangeFieldNodeItems/**tests**/arrange.retained-source-deletion.test.ts                       | 2         | 0         | 0         | 0         |
| src/core/engine/settle/arrangeFieldNodeItems/**tests**/arrange.retained-source-nested.test.ts                         | 1         | 0         | 0         | 0         |
| src/core/engine/settle/arrangeFieldNodeItems/**tests**/arrange.retained-source-packed.test.ts                         | 2         | 0         | 0         | 0         |
| src/core/engine/settle/arrangeFieldNodeItems/**tests**/arrange.retained-source-policy.test.ts                         | 1         | 0         | 0         | 0         |
| src/core/engine/settle/arrangeFieldNodeItems/**tests**/arrange.retained-source-pruning.test.ts                        | 1         | 0         | 0         | 0         |
| src/core/engine/settle/arrangeFieldNodeItems/**tests**/arrange.retained-source-relocation.test.ts                     | 1         | 0         | 0         | 0         |
| src/core/engine/settle/arrangeFieldNodeItems/**tests**/arrange.retained-source-root.test.ts                           | 1         | 0         | 0         | 0         |
| src/core/engine/settle/arrangeFieldNodeItems/**tests**/arrange.retained-source-tail.test.ts                           | 1         | 0         | 0         | 0         |
| src/core/engine/settle/arrangeFieldNodeItems/**tests**/settle.array-append-fallback.test.ts                           | 1         | 0         | 0         | 0         |
| src/core/engine/settle/arrangeFieldNodeItems/**tests**/settle.array-clear-cost.test.ts                                | 1         | 0         | 0         | 0         |
| src/core/engine/settle/arrangeFieldNodeItems/**tests**/settle.array-detached-reference.test.ts                        | 1         | 0         | 0         | 0         |
| src/core/engine/settle/arrangeFieldNodeItems/**tests**/settle.array-detached-reset-address.test.ts                    | 1         | 0         | 0         | 0         |
| src/core/engine/settle/arrangeFieldNodeItems/**tests**/settle.array-insert.test.ts                                    | 1         | 0         | 0         | 0         |
| src/core/engine/settle/arrangeFieldNodeItems/**tests**/settle.array-pop-fallback.test.ts                              | 1         | 0         | 0         | 0         |
| src/core/engine/settle/arrangeFieldNodeItems/**tests**/settle.array-pop.test.ts                                       | 1         | 0         | 0         | 0         |
| src/core/engine/settle/arrangeFieldNodeItems/**tests**/settle.array-prefix.test.ts                                    | 0         | 2         | 0         | 0         |
| src/core/engine/settle/arrangeFieldNodeItems/**tests**/settle.array-rekey.test.ts                                     | 3         | 2         | 0         | 0         |
| src/core/engine/settle/arrangeFieldNodeItems/**tests**/settle.array-splice-cost.test.ts                               | 1         | 0         | 0         | 0         |
| src/core/engine/settle/arrangeFieldNodeItems/**tests**/settle.array-splice-fallback.test.ts                           | 1         | 0         | 0         | 0         |
| src/core/engine/settle/arrangeFieldNodeItems/**tests**/settle.array-splice.test.ts                                    | 1         | 0         | 0         | 0         |
| src/core/engine/settle/arrangeFieldNodeItems/**tests**/settle.detached-write-address.test.ts                          | 1         | 0         | 0         | 0         |
| src/core/engine/settle/utils/latentStore/**tests**/setLatentRaw.test.ts                                               | 1         | 0         | 0         | 0         |
| src/core/engine/settle/utils/slots/**tests**/createSlotValueOverlay.test.ts                                           | 1         | 0         | 0         | 0         |
| src/core/engine/settle/utils/slots/**tests**/materializeInactiveSlotValues.test.ts                                    | 2         | 0         | 0         | 0         |
| src/core/engine/write/**tests**/dispatch.batch.test.ts                                                                | 14        | 0         | 0         | 0         |
| src/core/engine/write/**tests**/dispatch.closing-branch.test.ts                                                       | 1         | 0         | 0         | 0         |
| src/core/surface/**tests**/detached.test.ts                                                                           | 2         | 0         | 0         | 0         |
| src/core/surface/**tests**/surface.slots-memory-bound.test.ts                                                         | 1         | 0         | 0         | 0         |
| src/core/surface/**tests**/surface.slots-wildcard-lifetimes.test.ts                                                   | 4         | 0         | 0         | 0         |
| src/core/surface/**tests**/surface.slots-wildcard-mixed-storage.test.ts                                               | 3         | 0         | 0         | 0         |
| src/core/surface/**tests**/surface.slots-wildcard-packed-array.test.ts                                                | 1         | 0         | 0         | 0         |
| src/core/surface/**tests**/surface.slots-wildcard-policies.test.ts                                                    | 3         | 0         | 0         | 0         |
| src/core/surface/**tests**/surface.slots-wildcard-publication.test.ts                                                 | 2         | 0         | 1         | 1         |
