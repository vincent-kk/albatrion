# L3-a — 선언 밖 키의 일반 대입 복사

이 문서는 완료된 L3 실험의 원본 보고서와 수치를 보존한 기록입니다. 아래 구현 변경량·시험·빌드·FCA 결과는 당시 구현 작업의 결과이며, 이번 문서 작업은 지정된 결과 문서 다섯 개만 변경합니다. 제품 소스·시험·매니페스트·빌드 산출물·어댑터·INTENT·DETAIL 변경은 0건이고 새 측정·제품 게이트는 실행하지 않았습니다.

기준 `07e297431`, 가지 `perf/schema-form-extras-plain-assignment`입니다. 문서 커밋은 `a4375e180`, 구현·시험 커밋은 `cad821b8d8cf02af50ad161b05efbeb1018043c4`입니다. [PR #418](https://github.com/vincent-kk/albatrion/pull/418)의 구현은 `89ea2c98b`로 병합되었습니다. 이 문서는 당시 미커밋 보고서를 보존하며 측정 사본은 커밋하지 않습니다.

## 변경과 불변

`nextExtras`의 두 복사 루프만 `writeObjectKey`를 사용하도록 바꿨습니다. 보통 키는 일반 대입으로 쓰고 `__proto__`는 enumerable·configurable·writable own data property로 정의합니다. 선언 키 거름, Merge의 기존 키와 새 키 순서, 호출자 입력 불변 및 사후 키 변조 격리, 빈 값, `sameValue` 참조 되살림은 그대로입니다. 입력 참조 재사용(v1), 캐시, 공개 API 변경은 없습니다.

기존 helper는 objectBehavior organ 안에 있었고 settle의 직접 소비 예외는 없었습니다. 함수 이름·본문을 그대로 두 소비자의 최저 공통 fractal인 `engine/utils/writeObjectKey.ts`로 옮겼고, `assembleObject`의 import를 바꿨습니다. Git rename 유사도는 100%입니다. DETAIL 세 개를 먼저 커밋했고 INTENT와 원장은 변경하지 않았습니다. 원장의 VALUE-002 보충은 조정자 소유입니다.

## 검증

| 항목 | 결과 |
|---|---|
| `yarn workspace @canard/schema-form typecheck` | 통과 |
| `yarn workspace @canard/schema-form lint` | 통과 |
| `yarn workspace @canard/schema-form test --run` | 755 파일, 4,761 통과, 기존 todo 1개; 122.20초 |
| `yarn workspace @canard/schema-form build` | 통과 |
| 새 시험의 변경 전 실행 | 불변·정착 차등 13개 통과, 일반 키 descriptor 호출 상한만 2건 검출로 실패 |
| 같은 시험의 변경 후 실행 | 14개 통과 |
| 기존 시험 기대값 변경 | 0건 |

`settle/utils/input/__tests__/nextExtras.plain-assignment.test.ts`의 다음 시험이 `__proto__` 불변을 고정합니다. 둘 다 변경 전·후 통과했습니다.

- `keeps __proto__ as an own data property without changing prototypes (merge=%s)` — Overwrite·Merge 두 경우에서 입력의 예약 키가 own data property로 남고 prototype은 Object.prototype이며 전역 prototype을 오염시키지 않습니다.
- `copies a previous __proto__ key during Merge and filters a declared input key` — 이전 extras의 예약 키 복사와 선언된 입력 예약 키 거름을 함께 확인합니다.

같은 파일에서 descriptor-copy 기준 함수와 값·키 순서·descriptor·입력 소유권을 대조하고 빈 값·own undefined·NaN·중첩 동등 값의 참조 되살림을 확인합니다. `settle/__tests__/settle.extras-plain-assignment.test.ts`는 선언 자식 유무 두 장면의 마운트·Merge·게이트 전환·같은 값 Overwrite·빈 값 Overwrite(각 6단계, 총 12단계)를 기준 복사 알고리즘과 비교합니다. 전체 listener event와 순서, root onChange, 값·키 순서·extras, 잠복·inactive·misfit·선택 상태·revision·스냅샷과 참조 유지 여부가 일치했습니다. 기준 함수는 `settle/__tests__/fixtures/referenceNextExtras.ts`에 있습니다.

## A2 측정

first-batch의 `b-a2/config.mjs`와 `bench-common.mjs`를 수정 없이 복사하고 기존 `a2Scenes`, `measure`, `correctness`를 사용했습니다. B0는 선언 자식 없는 객체, B1은 k0를 선언한 객체이며 N=1,000입니다. 마운트는 기존 core 경로, 쓰기는 기존 steady 경로입니다. 두 dist는 각각 기준 코드와 수정 코드로 새 build했으며, 내부 심볼 일곱 개를 export한 한 줄만 측정 사본에 더했습니다. 계측·반사실 치환은 하지 않았습니다. 이 시간은 원본 dist를 그대로 실행한 시간과 구별해야 합니다.

순서는 Node 1바퀴 → Bun 1바퀴 → Node 2바퀴 → Bun 2바퀴였습니다. 2바퀴는 `--reverse`로 판·장면 순서를 뒤집었습니다. 각 판·장면·바퀴당 warmup 20회, 측정 100회입니다. 측정 중 이 작업의 다른 gate·build는 실행하지 않았습니다. Node v24.20.0, Bun 1.4.3, `NODE_ENV=production`입니다. 아래 점 추정치는 두 바퀴의 200개 표본을 합친 중앙값이고, 대괄호는 각 바퀴 중앙값의 최소–최대입니다. 줄어든 비율은 합친 중앙값의 비율이며 음수는 느려짐을 뜻합니다. 구간은 신뢰 구간이 아닙니다.

| 런타임 | 장면 | 쓰기 | 수정 전 ms [두 바퀴 min–max] | 수정 후 ms [두 바퀴 min–max] | 줄어든 % |
|---|---|---|---:|---:|---:|
| Node | B0 | mount | 1.4124 [1.3827–1.5281] | 0.9656 [0.8170–1.1625] | 31.6 |
| Node | B0 | one-key | 1.1017 [1.0510–1.1626] | 0.9719 [0.9526–0.9969] | 11.8 |
| Node | B0 | all-keys | 0.7168 [0.7142–0.7226] | 0.5861 [0.5668–0.6482] | 18.2 |
| Node | B1 | mount | 1.8085 [1.7869–1.8493] | 1.0040 [0.9804–1.1351] | 44.5 |
| Node | B1 | one-key | 1.1149 [1.0921–1.1447] | 1.0168 [0.9751–1.0717] | 8.8 |
| Node | B1 | all-keys | 0.7290 [0.7188–0.7608] | 0.6212 [0.5778–0.6375] | 14.8 |
| Bun | B0 | mount | 0.3949 [0.2966–0.6137] | 0.3214 [0.2527–0.5650] | 18.6 |
| Bun | B0 | one-key | 0.4584 [0.4308–0.5065] | 0.4639 [0.4516–0.4748] | -1.2 |
| Bun | B0 | all-keys | 0.4349 [0.3970–0.4748] | 0.4253 [0.4121–0.4296] | 2.2 |
| Bun | B1 | mount | 0.4132 [0.3779–0.5291] | 0.5442 [0.5019–0.6187] | -31.7 |
| Bun | B1 | one-key | 0.4740 [0.4383–0.4921] | 0.4756 [0.4447–0.4982] | -0.3 |
| Bun | B1 | all-keys | 0.4602 [0.4273–0.4841] | 0.4195 [0.4054–0.4394] | 8.9 |

Node는 각 바퀴에서 여섯 행 모두 개선됐습니다. Bun은 결과가 혼재합니다. 특히 B1 mount는 바퀴별 -63.7%, +5.1%로 방향이 바뀌었고 합친 중앙값은 31.7% 느렸습니다. B1 one-key도 두 바퀴에서 약 1.3–1.4% 느렸습니다. 전체 행 개선을 주장하지 않으며, 모든 행 악화라는 중단 조건에는 해당하지 않습니다.

4,800개 표본과 960개 warmup의 정상 값·onChange·반환값 관측이 모두 통과했습니다. 별도로 B0 Merge 한 키 추가와 caller-mutates-after-write 장면을 각 판·런타임·바퀴에서 검사했고 모두 통과했습니다. WRITE-013 입력 불변, frozen caller 정상 처리, VALUE-002 키 순서, B1 선언 키 extras 누출 없음, Merge 새 사본과 이전 값 보존, 사후 호출자 키 변경 격리가 전부 통과했습니다. 타이밍 행 48개와 별도 정답 행 16개에 실패 상태가 없음을 러너가 검사했습니다.

재현 파일은 작업 폴더의 `.seiri/tasks/l3a-extras-plain-assignment/` 아래입니다.

- `prepare-bundles.mjs`, `run/timing.mjs` — 기존 러너의 사본 준비와 두 판 실행.
- `run/node-round1.json`, `run/bun-round1.json`, `run/node-round2.json`, `run/bun-round2.json` — 표본·정답 원자료.
- `before-test.log`, `after-test.log`, `full-test.log` — 회귀 검증 원자료.

실행은 `MEASURE_WORKTREE`에 이 작업 폴더를 지정한 뒤 `NODE_ENV=production node .seiri/tasks/l3a-extras-plain-assignment/run/timing.mjs`와 같은 Bun 명령을 사용합니다. 두 번째 바퀴에는 `--reverse`를 더합니다.

### dist 식별

| 대상 | SHA-256 |
|---|---|
| 기준 raw dist | c84c2ca56e69f4e9952117ad12352a037ecab2f6ec63c8f4cd4e2346f0517c24 |
| 수정 raw dist | 731ee40d0cf45fd0940716b2155ea1e6e8023ed6735f1d49775dbaf113d5579a |
| 기준 내부 export 사본 | 47ac2e42358841b4372c5482c8ceb897289278c7db7345317690810dba6ce9b8 |
| 수정 내부 export 사본 | 7318db8a50d8daed80c1c137f8ac7d9d0301c2902b3f40cdccfeb58c60c75779 |
| 공통 winglet common-utils dist | 7de0a8437570ec34bd9627885ebbcc9133347b92eadae9c01693a5a24a6cfc9e |
| 공통 winglet react-utils dist | 48c575ffcae6334a9f388c10932366977dcb60e5af443d5e7a3cd3716f0419f2 |
| 공통 winglet json dist | 46d6b60e1513a9759e874ed254c38bae5d18a96675ab9094e9d5031cc121cae9 |

양 판은 같은 설치·winglet dist를 썼습니다. `run/identity-{baseline,direct}.json`에 이를 기록했습니다. 기존 러너의 engineSha256는 실행 당시 현재 dist의 식별자이므로 기준 사본의 정확한 식별에는 위 raw/bundle 해시를 사용합니다.

## FCA 증거와 범위 제한

engine 범위 Filid 계획 `93d4a0763229620c3741c73495523b01c90066afede2879509c43b464ff6e7db`의 SHA를 확인했고, 같은 계획의 precondition·postcondition은 `status=ok`, `valid=true`, findings 0입니다. 원본 부재·정확한 대상·기존 import 변경·경계·기존 대비 DAG가 검증됐습니다. 좁힌 범위의 문서에 있는 범위 밖 경로 진단 16개는 영향을 미치는 scope가 비어 있습니다.

별도 Orca worker가 전체·engine 범위를 독립 추출해 live facts에 compare했습니다. 두 비교의 resolutionDiffers는 0입니다. `actor` 인자는 설치 런타임에서 거부되어 생략했고, 동일 bundled extractor를 쓰므로 singleProvider=true입니다. 전체 rg 범위를 추출해 기본 facts 범위보다 넓었으므로 루트 comparedFiles 4,347/missingInStore 313/openItems 301, engine 876/67/66입니다. 이 추가 범위 항목은 일치나 해결로 주장하지 않았으며 submit·adjudicate하지 않았습니다.

최종 전체 FCA scan·validate·verification의 snapshot은 `107fa02f242bd532c7d7fbf404469cf9ad177bd6be948fb08db521d8e53c980f`로 일치했습니다. 전체 판정은 FAIL이며 분석 완전성은 indeterminate입니다. 비면제 finding은 중복 제거 후 76개(오류 24·경고 52), 진단은 130개입니다. 변경 파일에 해당하는 finding은 없고 engine 내부 finding 하나는 변경하지 않은 `settle.gate-selection.test.ts`의 동적 표 case-cap 판정 불가입니다. 새 시험의 case 수는 정확히 12개와 2개로 확인됐습니다. 범위 밖 진단과 기존 finding은 수정하지 않았습니다. 전체 JSON은 `.seiri/tasks/l3a-extras-plain-assignment/filid-{scan,validate,verification}.json`에 보존했으며 각각 nextAction도 포함합니다.

## 변경량과 인계

`git diff 07e297431..cad821b8d8cf02af50ad161b05efbeb1018043c4 --stat`: 9개 파일, +270/-13입니다. 런타임은 +4/-13, helper는 100% rename, 새 시험·fixture는 +263/-0, DETAIL은 +3/-0입니다. 기존 시험과 기대값은 변경하지 않았고 당시 구현 커밋에는 빌드 산출물·보고서·원장·agent 설정을 넣지 않았습니다. 구현 PR의 base는 `feat/schema-form-08-review-and-perf`입니다. Bun의 혼재된 측정과 전체 FCA의 범위 밖 finding은 후속 검토에 전달합니다.

## 비교 형식과 측정 한계

[368라운드](../../reviews/round-368-owner-answers.md)의 열 순서와 부호에 맞춘 표입니다. 기존 감소율 표는 원본 그대로 보존하며, 아래에서는 느려짐을 +, 빨라짐을 −로 씁니다. ms와 점 변화율은 기존 표와 같은 두 바퀴 200표본의 합친 중앙값에서 계산합니다. 점 변화율은 `(수정 후 합친 중앙값 / 수정 전 합친 중앙값 − 1) × 100`입니다. 대괄호는 ms에서는 바퀴별 중앙값의 최소–최대, 변화율에서는 같은 바퀴끼리 계산한 `(후/전 − 1) × 100`의 최소–최대입니다. 합친 중앙값의 비율은 바퀴 비율의 평균이 아니므로 점 변화율이 바퀴 범위 밖일 수 있습니다. 범위는 신뢰구간이 아니며, 바퀴 변화율이 0을 가로지르면 측정 가능한 차이가 없는 것으로 읽습니다.

옛 판 `0.16.1`은 비교 기준으로 남깁니다. 이 L3 실험에는 동일 창의 옛 판 표본이 없어 옛 판 ms와 수정 전·후의 옛 판 대비 비율을 `미검증`으로 표시합니다. 옛 판의 다른 창 수치나 다른 Node 버전 수치를 가져와 채우지 않습니다.

| 런타임 | 장면 | 옛 판 0.16.1 ms | 수정 전 ms [바퀴 min–max] | 수정 후 ms [바퀴 min–max] | 수정 전/옛 판 ±% | 수정 후/옛 판 ±% | 수정 후/수정 전 ±% [바퀴 min–max] |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Node v24.20.0 | B0 N=1,000 mount | 미검증 | 1.4124 [1.3827–1.5281] | 0.9656 [0.8170–1.1625] | 미검증 | 미검증 | -31.6 [-40.9–-23.9] |
| Node v24.20.0 | B0 N=1,000 one-key | 미검증 | 1.1017 [1.0510–1.1626] | 0.9719 [0.9526–0.9969] | 미검증 | 미검증 | -11.8 [-14.2–-9.4] |
| Node v24.20.0 | B0 N=1,000 all-keys | 미검증 | 0.7168 [0.7142–0.7226] | 0.5861 [0.5668–0.6482] | 미검증 | 미검증 | -18.2 [-21.6–-9.2] |
| Node v24.20.0 | B1 N=1,000 mount | 미검증 | 1.8085 [1.7869–1.8493] | 1.0040 [0.9804–1.1351] | 미검증 | 미검증 | -44.5 [-45.1–-38.6] |
| Node v24.20.0 | B1 N=1,000 one-key | 미검증 | 1.1149 [1.0921–1.1447] | 1.0168 [0.9751–1.0717] | 미검증 | 미검증 | -8.8 [-10.7–-6.4] |
| Node v24.20.0 | B1 N=1,000 all-keys | 미검증 | 0.7290 [0.7188–0.7608] | 0.6212 [0.5778–0.6375] | 미검증 | 미검증 | -14.8 [-24.1–-11.3] |
| Bun 1.4.3 | B0 N=1,000 mount | 미검증 | 0.3949 [0.2966–0.6137] | 0.3214 [0.2527–0.5650] | 미검증 | 미검증 | -18.6 [-14.8–-7.9] |
| Bun 1.4.3 | B0 N=1,000 one-key | 미검증 | 0.4584 [0.4308–0.5065] | 0.4639 [0.4516–0.4748] | 미검증 | 미검증 | +1.2 [-6.3–+4.8] |
| Bun 1.4.3 | B0 N=1,000 all-keys | 미검증 | 0.4349 [0.3970–0.4748] | 0.4253 [0.4121–0.4296] | 미검증 | 미검증 | -2.2 [-13.2–+8.2] |
| Bun 1.4.3 | B1 N=1,000 mount | 미검증 | 0.4132 [0.3779–0.5291] | 0.5442 [0.5019–0.6187] | 미검증 | 미검증 | +31.7 [-5.1–+63.7] |
| Bun 1.4.3 | B1 N=1,000 one-key | 미검증 | 0.4740 [0.4383–0.4921] | 0.4756 [0.4447–0.4982] | 미검증 | 미검증 | +0.3 [+1.3–+1.4] |
| Bun 1.4.3 | B1 N=1,000 all-keys | 미검증 | 0.4602 [0.4273–0.4841] | 0.4195 [0.4054–0.4394] | 미검증 | 미검증 | -8.9 [-16.3–+2.8] |

이 표의 전후 비율은 이 실험의 교대 두 바퀴 안에서만 유효합니다. 다른 L3 실험·첫 묶음·재측정 창의 절대 시간과 이어 붙이거나 개선율을 누적하지 않습니다. 내부 export 사본·계측 사본·원본 dist는 서로 구별하고, 함수별 계측 점유율은 달성 가능한 절감량으로 읽지 않습니다.

Bun B0 one-key·all-keys, B1 mount·all-keys의 바퀴 변화율은 0을 가로지르므로 측정 가능한 차이로 판정하지 않습니다. Bun B1 one-key의 +0.3% 점 변화율은 합친 중앙값 기준이며 바퀴별 +1.3~+1.4%와 집계 방식이 다릅니다. [405라운드](../../reviews/round-405-closing.md)의 Bun B1 mount 재측정은 별도 창의 검토 근거입니다. 원본의 +31.7%와 표본을 대체하거나 창 사이 절대 시간을 비교하지 않습니다.

[369라운드](../../reviews/round-369-owner-answers.md)의 옛 판 종료 기준은 기대 onChange와 루트·변경 자식의 값·경로가 적용된 시점 중 늦은 쪽입니다. 이번 실험에는 그 기준의 동일 창 옛 판 행이 없어 세 판 비교를 완료했다고 주장하지 않습니다. 새 판의 종료 경계와 정답 검사는 위의 해당 러너 기록에 한정합니다.

## 근거와 남은 검증

구현 병합과 결과 해석의 근거는 [405라운드 닫기](../../reviews/round-405-closing.md)의 89ea2c98b, [첫 묶음 측정](first-batch-measurement.md), [400C-02](../../reviews/round-400-closing.md), [인계 문서](../../AGENT-HANDOFF.md)입니다. 구현 당시 커밋과 실제 측정 사본의 SHA-256을 구별하며, 구현 PR 본문·검토 기록은 보강 근거로만 사용합니다.

보존된 원시 JSON의 표본을 다시 계산해 기존 표를 대조했으며 새 표본을 만들거나 누락 표본을 복원하지 않았습니다. 기존 보고서의 ms·비율·바퀴 범위·호출 수·시험 수·해시와 실패 기록은 유지했습니다. 원시 자료는 위의 작업 폴더 임시 경로에 있고 이 문서 PR에 포함되지 않으므로, 체크아웃만으로 원자료까지 확보된다고 주장하지 않습니다. 정확한 UTC 측정 시작·종료 시각은 기존 보고서와 JSON에 없어 미검증입니다.

M3 소유자 수용은 아직 남아 있습니다. 동일 창의 옛 판·수정 전·수정 후 dist를 같은 관측 완료 기준으로 재는 368·369의 완전 비교와 정상동작 종합 검증은 M3에서 수행해야 합니다. 옛 판 대비 회귀나 계약상 남는 비용을 이 문서로 새로 수용하지 않으며, 문서 독립 검증과 최종 병합은 조정자에게 남깁니다.
