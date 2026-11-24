# 속도 복구 작업 현황

작업이 언제 끊겨도 이 파일과 저장소만 보고 이어 갈 수 있도록, 단계가 끝날 때마다 갱신합니다. 작업이 모두 끝나면 지웁니다. 판정 규칙과 허용 폭은 [README](README.md#이번-측정의-결정)에, 결정이 필요한 항목과 수정 비용 기록은 [issues](issues)에 있습니다.

## 이어 가는 방법

1. 아래 표에서 `다음 단계`가 비어 있지 않은 줄을 위에서부터 처리합니다.
2. 개선 작업의 순서는 항상 같습니다. 패키지 검사 통과 → 측정 → 효과 있는 변경만 유지 → 다른 작업자의 동작 동일성 검증 → PR(가지를 `1.0.0/optimize`와 합친 뒤 CI) → 리베이스 병합 → 작업 트리와 가지 정리.
3. 작업자용 지침은 저장소 밖 `/Users/Vincent/Workspace/albatrion-speed/specs/loop.md`에 있고, 작업자는 작업 트리 루트의 `SPEED-REPORT.md`(커밋하지 않음)에 단계마다 진행 내용을 적습니다. 작업자가 끊겼으면 그 파일과 `git log origin/1.0.0/optimize..HEAD`, `git status`부터 읽습니다.
4. 측정 트리는 `/Users/Vincent/Workspace/albatrion-speed/`의 `beta`(기준), `head`(후보), `beta-am543`(antd-mobile 5.43.0을 넣은 기준)입니다.

## 개선 작업 (우선순위 1의 초과 13행)

| 묶음           | 행             | 상태                                                                                                                                                                                                                                                               | 가지 / 작업 트리 | 다음 단계                                                        |
| -------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- | ---------------------------------------------------------------- |
| style-utils    | 07, 09         | 병합됨 (PR #683). 07은 1.29, 09는 1.07로 나노초 허용 안입니다.                                                                                                                                                                                                     | 정리됨           | 없음                                                             |
| json-schema    | 01             | 병합됨 (PR #685). 146.9배 → 9.76배이고 나머지는 수정 비용으로 귀속했습니다([기록](issues/json-schema-first-miss-fix-cost.md)).                                                                                                                                     | 정리됨           | 없음                                                             |
| common-utils   | 04, 13, 14     | 병합됨 (PR #688). 04는 1.47, 13은 1.16(둘 다 [수정 비용](issues/common-utils-deep-traversal-fix-cost.md)), 14는 1.06([선택지](issues/clone-deep-generator-option.md), 가지 `perf/common-utils-speed-2`의 `50bfe1577`은 그 문서가 가리키므로 결정 전까지 남깁니다). | 정리됨           | 없음                                                             |
| react-utils    | 02, 03         | 병합됨 (PR #686). 02는 1.65 → 1.49, 03은 2.05 그대로이며 남은 차이는 수정 비용으로 귀속했습니다([기록](issues/use-rest-properties-fix-cost.md)).                                                                                                                   | 정리됨           | 없음                                                             |
| schema-form    | 16, 17, 19, 24 | 병합됨 (PR #687). 24는 통과, 16은 1.05, 17은 1.05, 19는 1.07이며 남은 초과는 [기록](issues/schema-form-remaining-overage.md)했습니다.                                                                                                                              | 정리됨           | 없음                                                             |
| antd5 플러그인 | 11             | 코어 개선이 병합됐습니다. 재측정 전입니다.                                                                                                                                                                                                                         | 없음             | `head` 트리를 최신 `1.0.0/optimize`로 다시 만들어 `p1-11` 재측정 |

버려야 하는 예전 가지: `origin/perf/common-utils-speed`, `origin/perf/schema-form-speed`(효과 없는 커밋이 섞인 1차 가지)는 해당 묶음이 병합되면 지웁니다.

## 측정

| 범위                        | 상태                                                                                                                           | 다음 단계                                                                                                                               |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| 우선순위 1 (24행)           | 끝났습니다. [RESULTS-P1.md](RESULTS-P1.md)                                                                                     | 개선이 모두 병합되면 최종 값으로 다시 재서 표를 갱신                                                                                    |
| 우선순위 2 잘라낸 행 (24행) | 23행 측정 끝. [RESULTS-P2.md](RESULTS-P2.md): 통과 3, 초과 20(대부분 수정 경로 입력). `p2c-05`는 `beta-am543`으로 재야 합니다. | 초과 행의 입력 종류 확정과 수정 비용 귀속, 평범한 입력 초과 행(09, 18, 19, 22)의 개선 검토. 후보 트리를 최신 가지로 다시 만든 뒤 재측정 |
| 우선순위 2 엔진 행 (18행)   | 측정 끝. [RESULTS-P2.md](RESULTS-P2.md): 통과 6, 초과 12.                                                                      | 평범한 입력 초과 행(03, 12)의 개선 검토, 수정 경로 초과 행의 귀속                                                                       |
| 우선순위 2 화면 행 (25행)   | 행 파일 일부가 커밋되지 않은 채 `rows/p2u-*`에 있습니다(작업자를 멈춤).                                                        | 작업자 지시문 `specs/t29-rows-p2-ui.md`로 다시 시작                                                                                     |
| 우선순위 3 (19행)           | 입력 명세만 있습니다([ROWS-P3.md](ROWS-P3.md)). 2행은 비교 불가로 분류됐습니다.                                                | 행 파일 구현 → 측정 → 수정 비용 귀속                                                                                                    |

## 마무리 때 할 일

- `SPEED-TARGETS.md`에 최종 값과 상태를 적습니다.
- `sources/`, 이 파일, 저장소 밖 `albatrion-speed/`의 `analysis`, `specs`, `pr`을 지웁니다.
- 남은 작업 트리와 가지를 지웁니다.

## 병합 뒤 재측정 (후보 트리 `albatrion-speed/opt`)

`albatrion-speed/opt`는 `head`의 복제본에 `1.0.0/optimize`의 `style-utils`, `json-schema`, `react-utils`, `schema-form` 소스를 덮어 빌드한 트리입니다. 개선이 더 병합되면 같은 방법으로 다시 만듭니다.

- 12라운드 전체 결과는 `results/opt-p1`, `opt-p2c-a`, `opt-p2c-b`, `opt-p2e`에, 24라운드 재측정은 `opt-rerun-p1`, `opt-rerun-p2-a`, `opt-rerun-p2-b`에 있습니다.
- `p1-07`은 대조군이 흔들려(0.933) 무효였고, `p1-24`는 실행마다 1.01~1.10으로 흔들립니다. 둘은 조용한 시간에 다시 잽니다.
- `p1-11`(antd5 체크박스)은 1.049 / 1.031로 초과가 남습니다.
- `p2c-05`(antd-mobile 슬라이더)는 `beta-am543` 기준 트리에서 행의 `check`가 실패합니다. 행 구현을 살펴야 합니다.
- `RESULTS-P1.md`와 `RESULTS-P2.md`는 아직 병합 전 값입니다. `common-utils`가 병합된 뒤 최종 재측정으로 갱신합니다.
- 우선순위 1의 모든 개선 묶음이 병합됐습니다. 최종 24라운드 측정은 `results/final-p1`이며, 끝나면 `RESULTS-P1.md`를 갱신합니다.
- Vincent의 결정(2026-11-23): 수정 비용 기록 네 건과 `schema-form` 현재 값을 수용했고, `clone` 생성기 제거를 승인했습니다(작업 트리 `speed-clone-keys`, 가지 `perf/common-utils-clone-keys`, 명세 `albatrion-speed/specs/t33-clone-generator.md`). `schema-form`의 `p1-17`과 `p1-19`만 수정 비용과 비효율을 한 번 더 분리합니다.

## 중단 시점의 상태와 재개 순서 (2026-11-23 저녁, 사용량 한도 직전)

우선순위 1은 끝났습니다. 개선 다섯 묶음이 병합됐고(PR #683, #685, #686, #687, #688), 최종 표는 [RESULTS-P1.md](RESULTS-P1.md)의 "개선 병합 뒤"입니다. Vincent이 남은 초과를 모두 수용했습니다(각 [issues](issues) 문서의 결정 줄).

진행 중이던 것:

1. **`clone` 생성기 제거** — PR #689로 병합됐고 작업 트리와 가지를 정리했습니다. `albatrion-speed/opt` 트리에는 아직 반영되지 않았습니다.
2. **흔들리는 세 행** — `p1-07`, `p1-11`, `p1-24`는 Vincent이 현재 값으로 수용했습니다. 더 할 일이 없습니다.

아직 시작하지 않은 것:

3. **우선순위 2 초과 행의 원인 분석** — [RESULTS-P2.md](RESULTS-P2.md)는 병합 전 값입니다. 병합 뒤 값은 `results/opt-p2c-a`, `opt-p2c-b`, `opt-p2e`, `opt-rerun-p2-*`에 있습니다. 평범한 입력 초과 행(`p2c-09`, `p2c-18`, `p2c-19`, `p2c-22`, `p2e-03`, `p2e-09`, `p2e-12`)이 개선 대상이고, 수정 경로 행은 프로파일로 낭비를 걷어낸 뒤 진단 빌드로 귀속합니다. 배수가 큰 `style-utils` 계열(`p2c-12`~`17`)과 `p2c-03`부터 봅니다.
4. **우선순위 2 화면 행 25개** — `rows/p2u-*.mjs`는 중단된 작업자가 남긴 미검증 초안입니다. 명세는 `albatrion-speed/specs/t29-rows-p2-ui.md`입니다. `p2c-05`는 두 번째 클릭부터 값이 바뀌지 않는 행 결함이 있습니다(양쪽 트리에서 동일).
5. **우선순위 3의 19행** — [ROWS-P3.md](ROWS-P3.md)대로 구현하고 잽니다.
6. **마무리** — `bug-bounty/SPEED-TARGETS.md` 갱신, `sources/`와 이 파일 삭제, 저장소 밖 `albatrion-speed/`의 `analysis`, `specs`, `pr` 삭제.

측정 트리는 `albatrion-speed/beta`(기준), `beta-am543`(antd-mobile 5.43.0 기준), `opt`(병합된 개선 반영, `.speed-ref`가 반영한 커밋)입니다.

`1.0.0/optimize`를 `1.0.0-beta`로 올리는 초안 PR이 열려 있습니다. 남은 3~6번이 끝나면 본문을 갱신합니다.

## 재개 (2026-11-24): 우선순위 2 묶음 네 개가 돌고 있습니다

`albatrion-speed/opt`는 `clone` 변경까지 반영해 다시 빌드했습니다. 명세는 모두 `albatrion-speed/specs/`에 있고, 각 작업자는 작업 트리 루트의 `SPEED-REPORT.md`에 진행을 남깁니다.

| 묶음               | 행                                                     | 작업 트리 / 가지                                     | 명세                       | 배정               |
| ------------------ | ------------------------------------------------------ | ---------------------------------------------------- | -------------------------- | ------------------ |
| style-utils        | `p2c-12`~`17`                                          | `speed-style-utils-p2` / `perf/style-utils-speed-p2` | `t35-style-utils-p2.md`    | `ctx_43a2933a7a8f` |
| schema-form        | `p2c-08`~`11`, `p2e-*`, 플러그인 행 02·03·04·07 재측정 | `speed-schema-form-p2` / `perf/schema-form-speed-p2` | `t36-schema-form-p2.md`    | `ctx_6dcee4ca9026` |
| agents-assets-sync | `p2c-18`~`20`                                          | `speed-assets-sync-p2` / `perf/assets-sync-speed-p2` | `t37-assets-sync-p2.md`    | `ctx_102ad6a10845` |
| 화면 행            | `p2u-*` 25개와 `p2c-05`                                | 주 체크아웃 (행 파일과 결과만)                       | `t38-rows-p2-ui-resume.md` | `ctx_dd181952646f` |

작업자가 보고하면 `HANDOFF.md`의 7~10단계(원자료 대조, 독립 검증, PR, 병합, 정리)로 이어갑니다. 우선순위 3과 `p2c-24`는 아직 배정하지 않았습니다.

Vincent의 우선순위 조정(2026-11-24): 기반 도구가 먼저이고, 화면 플러그인과 `agents-assets-sync`는 1.5배까지 수용합니다([HANDOFF.md](HANDOFF.md)의 "패키지별 중요도"). 이에 따라 배정을 바꿨습니다.

- `json-schema` 묶음을 추가했습니다: `p2c-22`(평범한 입력 4.7배), `p2c-23`, `p2c-24`. 작업 트리 `speed-json-schema-p2`, 가지 `perf/json-schema-speed-p2`, 명세 `t39-json-schema-p2.md`, 배정 `ctx_cb2cb0891322`.
- 화면 행 작업자(`ctx_dd181952646f`)는 우선순위 3 행(명세 `t40-rows-p3.md`, 진행 기록 `albatrion-speed/analysis/report-p3.md`)을 먼저 하고, 화면 행은 그 뒤에 12라운드 한 번만 잽니다.
- `agents-assets-sync` 작업자는 목표를 1.5배로 낮추고 통상적 낭비만 걷어냅니다.
- `schema-form` 작업자가 측정 대기열 우선입니다. 플러그인 행 `p2c-04`, `p2c-07`은 수용 범위이고 `p2c-02`, `p2c-03`은 코어 변경 뒤 재측정만 합니다.
- `agents-assets-sync` 묶음은 끝났습니다. Vincent이 현재 값(1.6~1.95배)을 수용했고 변경은 버렸습니다([기록](issues/assets-sync-installer-overage.md)). 작업 트리와 가지를 지웠습니다.
- `json-schema` 우선순위 2 묶음은 병합됐습니다(PR #691). `p2c-22`는 4.70 → 1.97, `p2c-23`은 13.9 → 11.8, `p2c-24`는 2.38 그대로이고, 남은 차이는 [수정 비용 기록](issues/json-schema-registration-fix-cost.md)으로 Vincent이 수용했습니다. 작업 트리를 지웠습니다. `albatrion-speed/opt`에는 아직 반영하지 않았습니다.
- `schema-form` 우선순위 2 묶음은 코드 변경 없이 끝났습니다. 유일한 개선(가상 분기 메모)은 독립 검증에서 탈락해 버렸고, 남은 초과는 [수정 비용 기록](issues/schema-form-p2-fix-cost.md)으로 Vincent이 수용했습니다. 작업 트리와 가지를 지웠습니다. 검증 기록은 `albatrion-speed/analysis/verify-schema-form-p2.md`입니다.
