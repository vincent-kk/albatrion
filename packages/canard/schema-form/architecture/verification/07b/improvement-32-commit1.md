# 개선-32 커밋 1 — F-E 재구현과 단일 revision 읽기 검증

2026-10-12, 브랜치 `feat/schema-form-07b-1`. 161C-01의 절차(독립 리뷰 → 방향 확인 → 다섯 부분 판정 세션)를 따랐습니다. 채택은 170라운드 소유자 답(TEST-027의 소유자 수용)입니다.

## 판정

**소유자 수용으로 채택합니다.** 다섯 부분 가운데 넷이 ADOPT입니다. react-array-1000의 갱신 두 행은 강제 GC 판정 열에서 약 −72 µs(약 4%) 손실이 표시되었고, 소유자가 마운트 약 +12 ms와 array-replace-200 약 −2 ms 이득과 맞바꿔 받아들였습니다. 145C-01의 열 역할은 그대로이며, 이 행만 소유자 수용 예외입니다.

## 변경

- `src/components/SchemaNode/SchemaNodeInput`의 입력이 쓰던 세 추적(입력 속성, 자식 구성, Refresh)을 `hooks/useFormTypeInputControl.ts`의 `useSyncExternalStore` 하나로 합쳤습니다. 필드 하나의 노드 리스너는 여섯에서 넷이 됩니다. 136라운드의 F-E 패치를 바탕으로 했습니다.
- snapshot은 Refresh를 미루지 않을 때 `node.revision(INPUT_TRACKING_EVENTS)`를 한 번 읽고, 미룰 때만 Refresh를 뺀 마스크와 적용 세대를 더합니다(fbx-a1000-diagnosis.md의 3순위 안).
- 유지한 계약: focus·select의 layout 구독, 자식 소유 유예 비트와 array-push-remove-100의 커밋 202회, IME 조합 중·자식 마운트 중 Refresh 억제, 렌더 시 적용 세대 읽기, `mountedChildren` 계수.
- `src/components/SchemaNode/INTENT.md`의 구독 규약에 이 훅의 예외를 한 줄 적었습니다(165C-01).

## 검증

| 단계 | 결과 |
| --- | --- |
| 독립 리뷰(opus verifier) | PASS, 차단 0건입니다. 변이 시험으로 계약 여섯이 모두 시험에 고정되어 있음을 확인했습니다. 비차단 지적 N1·N2·D1·D2와 시험 공백 T3를 커밋 전에 반영했습니다. |
| 시험 | `__tests__/trackerCounts.test.tsx`의 8건은 HEAD 제품 코드에서 실패하고 변경에서 통과합니다. unit·render·react18 전체가 통과합니다. |
| 방향 확인(공식 절차, array-replace-200) | immediate −2.069 ms(−1.81%), record(drainTicks(2)) −2.211 ms(−1.89%)입니다. 두 lane 모두 세 라운드가 전부 같은 방향이었고 실패한 쓰기는 0입니다. |
| 판정 세션 32a | 아래 표와 같습니다. |

### 판정 세션 32a (기준 `d3659173e`, 부호는 기준 − 후보)

| 부분 | 결과 | 이득으로 판정된 행 |
| --- | --- | --- |
| react-main-a | ADOPT | array-500 갱신 두 행, flat-100 마운트 두 행 |
| react-main-b | ADOPT | array-replace-200·array-push-remove-100 갱신, array-100·flat-500·array-push-remove-100 마운트, flat-500 갱신 등 11행 |
| react-array-1000 | 소유자 수용, 8블록 추세 | 마운트 두 행이 이득입니다(mount-wall +12.20 ms [+9.64, +16.29], 기준 약 587 ms). |
| react-nested-d5 | ADOPT | nested-d5-f4 마운트·갱신 네 행 |
| core | ADOPT | sample-2 갱신 한 행. core 번들은 기준과 바이트가 같습니다. |

react-array-1000은 첫 측정에서 갱신 두 행이 회귀로 표시되었습니다. 24블록 확인 측정은 예상 5,000초가 남은 예산 2,333초를 넘어 러너가 멈췄습니다. 이번 변경은 React의 모든 행에 닿아 모든 행이 24블록으로 돌았기 때문입니다. 소유자 답에 따라 같은 번들로 8블록 추세만 기록했습니다(`--kind=confirm --smoke`, 판정 필드 `SMOKE_NO_VERDICT`).

| 행 | 첫 측정(24블록) | 8블록 추세 | nogc 기록 열(24블록) |
| --- | --- | --- | --- |
| update-wall | −0.072 ms [−0.127, −0.045], 기준 1.732 ms | −0.068 ms [−0.154, −0.009] | +0.016 ms [+0.003, +0.034] |
| update-active | −0.071 ms [−0.130, −0.045], 기준 1.736 ms | −0.069 ms [−0.158, −0.009] | +0.017 ms [+0.002, +0.035] |

추세는 첫 측정과 같은 방향, 거의 같은 크기이며 중앙값이 첫 측정 하한보다 크지 않습니다. 136라운드의 F-E 확인값(−71 µs)과도 같은 크기이므로, 단일 revision 읽기는 이 손실을 없애지 못했습니다. 원인 가설은 fbx-a1000-diagnosis.md의 힙 위상이며, 진단은 07b 범위 밖입니다(168C-01).

## 번들

| 번들 | SHA-256 |
| --- | --- |
| React 기준 cjs | `a654171c6aaae68f4473d78c22dacb4823b8f2dd1d451b4bfac80dfef4bd8f24` |
| React 후보 cjs | `05c59f953c90d09da2e2febea2767cff098bcc2d2a72d3dc626c41e6b2b2992e` |
| core 기준·후보 cjs | `e92dcea816574acd9aa2c29b8c26c20175bdcc1df1f0b4a23bbed826471312e2` |

`ed9be03c2`로 빌드한 기준 번들은 `d3659173e`의 것과 바이트가 같습니다. 세션 원자료와 스크립트는 작업 기기의 임시 공간(`scratchpad/session-32a`, `scratchpad/g07b-32/dir1`)에만 있습니다.
