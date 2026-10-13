# 개선-32 커밋 2 — 입력의 layout effect 합치기

2026-10-13, 브랜치 `feat/schema-form-07b-1`. 161C-01의 절차(독립 리뷰 → 방향 확인 → 다섯 부분 판정 세션)를 따랐습니다. 기준은 커밋 1 `c04c74fe1`이고, 후보는 그 바로 위의 커밋 2 `0517e21cf`입니다.

## 판정

**ADOPT입니다.** 다섯 부분이 모두 ADOPT이고, 판정 열 173행 가운데 이득이나 차단 회귀로 판정된 행은 없습니다. 회귀로 표시된 행은 하나(react-main-a의 flat-50 mount-active)였고, 24블록 확인 측정에서 확인되지 않았습니다. 커밋 1이 react-array-1000 갱신에 남긴 약 −72 µs(170라운드 소유자 수용)는 이 커밋으로 더 나빠지지 않았습니다.

## 변경

- `useTerminalChildren`은 layout effect를 갖지 않습니다. 자식 목록과 commit 표시를 묶은 memo 쌍을 돌려주고(읽기 검출이 필요 없으면 공유된 고정 쌍), `useFormTypeInputControl`의 focus·select layout effect가 그 표시를 먼저 부릅니다.
- 가상화 없이 마운트되는 말단 배열 항목의 layout effect는 셋에서 둘이 됩니다. 남는 둘은 부모의 `mountedChildren` 계수(REACT-028, 항목마다 유지)와 항목 입력의 commit입니다.
- 유지한 계약: ERROR-202 보고, focus·select의 layout 구독, 자식 소유 유예 비트와 array-push-remove-100의 커밋 202회, IME 조합 중·자식 마운트 중 Refresh 억제, 렌더 시 적용 세대 읽기, `mountedChildren` 계수.

## 검증

| 단계 | 결과 |
| --- | --- |
| 독립 리뷰(opus verifier) | PASS, 차단 0건입니다. 문구 지적 세 건을 커밋 전에 반영했습니다. |
| 시험 | `__tests__/arrayMountLayoutEffects.test.tsx`가 200개 항목 마운트의 layout effect 실행 수를 고정합니다. 변경 전 600회, 변경 후 400회이며 React 19와 React 18에서 같습니다. |
| 방향 확인(공식 절차, array-replace-200 update-wall) | immediate −0.690 ms(−0.60%), record −0.847 ms(−0.73%)입니다. record는 세 라운드가 모두 후보 쪽이 낮았고, immediate는 라운드 방향이 섞였습니다. 실패한 쓰기는 0입니다. |
| 판정 세션 32b | 아래 표와 같습니다. |

### 판정 세션 32b (기준 `c04c74fe1`, 부호는 기준 − 후보)

21:22~01:43 UTC에 돌았습니다. 세션 동안 워크트리 HEAD는 `1daf55be4`, git 상태는 깨끗했습니다.

| 부분 | 판정 행 | 결과 | 비고 |
| --- | ---: | --- | --- |
| react-main-a | 48 | ADOPT | flat-50 mount-active −0.101 ms [−0.259, −0.010](기준 7.62 ms)이 회귀로 표시되었고, 24블록 확인에서 +0.019 ms [−0.039, +0.093]로 확인되지 않았습니다. |
| react-main-b | 20 | ADOPT | array-replace-200 update-wall +0.653 ms [−0.472, +1.853](기준 115.0 ms), array-push-remove-100 update-wall −0.121 ms [−1.092, +0.474](기준 128.1 ms)입니다. |
| react-array-1000 | 4 | ADOPT | 회귀 표시가 없어 확인 측정이 필요 없었습니다(4,754초, 예산 안). update-wall −0.034 ms [−0.089, +0.021](기준 1.854 ms), mount-wall +3.411 ms [−1.972, +7.163](기준 575.8 ms)입니다. |
| react-nested-d5 | 4 | ADOPT | nested-d5-f4 mount-wall +0.170 ms [−0.842, +1.555], update-wall −0.012 ms [−0.040, +0.017]입니다. |
| core | 97 | ADOPT | core 번들은 기준과 바이트가 같습니다. |

32a와 달리 react-array-1000이 예산 안에서 끝났으므로 8블록 추세(32a 전례)는 쓰지 않았습니다.

### 편차

- 첫 시작(21:11 UTC)은 `verify-bundles-131.mjs`가 모든 번들 항목의 revision이 매니페스트 기준 revision과 같기를 요구해 0.1초 만에 실패했습니다. 32a의 후보는 기준 위의 작업 트리였지만, 32b의 후보는 커밋이기 때문입니다.
- 커밋된 도구는 고치지 않았습니다. 세션 매니페스트에서 candidate 항목의 `revision`을 세션 기준 `c04c74fe1`로 두고, 실제 빌드 커밋 `0517e21cf`는 `sourceRevision`에 남겼습니다. 번들 파일과 SHA-256은 그대로이며, 21:22 UTC에 다시 시작했습니다.

## 번들

| 번들 | SHA-256 |
| --- | --- |
| React 기준 cjs | `26f6ba70e139181818346fae6663b8aed452899ba6af59e33c1b18ec81717673` |
| React 후보 cjs | `9b29b56f7fc905a2266b8a7d593bfb61fa67669e6eb41adf42df1537798f8536` |
| core 기준·후보 cjs | `d6b26d93e3f2fb097943dae4031cad59156424358af916b7a43281ba49611183` |

세션 원자료와 스크립트는 작업 기기의 임시 공간(`scratchpad/session-32b`, `scratchpad/c2-dir`)에만 있습니다.
