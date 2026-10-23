# L3-c — 선언 밖 값 비교 한 번

이 문서는 완료된 L3 실험의 원본 보고서와 수치를 보존한 기록입니다. 아래 구현 변경량·시험·빌드·FCA 결과는 당시 구현 작업의 결과이며, 이번 문서 작업은 지정된 결과 문서 다섯 개만 변경합니다. 제품 소스·시험·매니페스트·빌드 산출물·어댑터·INTENT·DETAIL 변경은 0건이고 새 측정·제품 게이트는 실행하지 않았습니다.

## 결과와 범위

기준은 a9c00f534ac84c4d9f9924668b3b25de444f2368, 가지는 perf/schema-form-extras-single-compare입니다. 문서 커밋 3ee575f03과 구현·새 시험 커밋 d382874e86a0af8dbbb45273e12fc8b0901120a7을 push하고 [PR #419](https://github.com/vincent-kk/albatrion/pull/419)을 열었습니다. 구현은 `bb4ff19d9`로 병합되었으며 이 문서는 당시 미커밋 보고서를 보존합니다.

초기 추적에서 nextExtras의 참조 되살림을 없앨 수 없음을 확인했고, 후속 코디네이터 판정에 따라 쓰기마다 O(키 수) 중복 비교를 없애는 데 필요한 순증 3행을 허용했습니다. 선호안인 arrayExtras의 같은 값 참조 복원과 markWrite의 참조 비교를 구현했습니다. markWrite에 객체·배열 분기를 추가하는 대안은 쓰지 않았습니다.

nextExtras와 잠복 Merge 경로는 그대로입니다. arrayExtras는 원래처럼 slice로 꼬리를 복사한 뒤 이전 값이 배열이면 sameValue로 한 번 비교하여 같은 참조를 돌려줍니다. markWrite는 객체·배열 extras 모두 !==로 변경을 판단합니다. 입력 표시 단계의 해당 extras 구조 비교가 한 번이 되며, 합성 출력의 SETTLE-043 참조 되살림 비교는 그대로입니다. 캐시·전역 상태·공개 API·INTENT·기존 시험 기대값은 변경하지 않았습니다.

## 호출자 추적 표

경로는 packages/canard/schema-form/src/core/engine/ 기준이며, 기준과 수정 후 호출 줄 번호는 같습니다.

| helper와 호출자 path:line | 경로와 후속 소비 | 참조 되살림 의존 및 처리 |
|---|---|---|
| nextExtras → settle/utils/input/markWrite.ts:128 | Overwrite·Merge·load·automatic의 object branch; :54에서 Merge를 판정하고 :126에서 raw를 유지하며 :140–142에서 변경 채널을 저장 | 기존 :131의 중복 sameValue를 !==로 바꿨습니다; helper의 같으면 previous라는 보장을 소비합니다 |
| nextExtras → settle/utils/latent/distributeLatentValue.ts:121 | whole이면 previous=undefined, Merge면 이전 HostLatent.undeclaredValues; :155–159에서 Object.is로 같은 HostLatent를 재사용 | 의존합니다; :157의 참조 비교와 setLatentRaw.ts:58의 dirty 판정 때문에 nextExtras.ts:27의 되살림을 유지합니다 |
| nextExtras → settle/utils/latent/distributeMovedLatentInput.ts:78 | :76에서 기존 잠복 값은 건너뛰고 previous=undefined로 새 HostLatent만 만듭니다 | 이전 extras 참조가 없으므로 되살림에 의존하지 않으며 변경하지 않았습니다 |
| nextExtras → settle/loadFieldNodeAtMount/utils/staticFirst/loadStaticFirstTree.ts:119 | 새 노드 최초 적재에서 previous=undefined로 :118에 저장 | 이전 참조가 없고 변경하지 않았습니다 |
| arrayExtras → settle/utils/input/markWrite.ts:108 | 배열 원본 분배; 기존 :131에서 구조 비교 | 구조 비교를 helper로 옮기고 markWrite는 참조로만 판단합니다 |
| arrayExtras → settle/loadFieldNodeAtMount/utils/staticFirst/loadStaticFirstTree.ts:113 | 새 노드에 최초 저장 | 이전 배열이 없으므로 추가 구조 비교 없이 새 꼬리를 반환합니다 |
| arrayExtras → settle/arrangeFieldNodeItems/utils/arraySlots/applyArraySlots.ts:195 | 구조 계획의 새 꼬리를 직접 저장하고 :197 이후 새 children과 변경 표시를 만듭니다 | 직접 저장 소비자이므로 배열 동사·배치·새 children/값/extras/snapshot 참조와 revision·배달을 기준 dist와 대조했습니다 |

기존 nextExtras 직접 시험의 같은 값 Overwrite·Merge previous 참조 단언도 그대로 통과합니다. updateOutput.ts:72–73·88–90·98–114의 local·emit 참조 복원은 바꾸지 않았습니다.

## 검증

| 항목 | 결과 |
|---|---|
| yarn install | 같은 기준 가지에서 완료; 기존 peer 경고, exit 0 |
| yarn workspace @canard/schema-form typecheck | 통과 |
| yarn workspace @canard/schema-form lint | 통과 |
| yarn workspace @canard/schema-form test --run | 757 파일, 4,778 통과, 기존 todo 1개; 112.71초 |
| yarn workspace @canard/schema-form build | 통과 |
| 기준 코드의 새 시험 | 관측 9개·배열 비교 상한 2개 통과, 객체 비교 상한 6개는 2회 호출로 실패 |
| 수정 코드의 새 시험 | 17개 통과; 기존 array-extras-append 16개와 함께 총 33개 통과 |
| 기존 시험 기대값 변경 | 0건 |

새 파일 settle/utils/input/__tests__/markWrite.extras-comparison.test.ts는 markWrite 입력 표시만 실행하고 이전 extras가 첫 인수인 sameValue 호출을 셉니다. 객체 Overwrite·Merge의 같은 값·다른 값·새 키 여섯 경우와 배열의 같은 값·다른 값 두 경우 모두 1회 이하 상한을 단언합니다. 출력 합성 등 다른 목적으로 하는 비교는 이 계측에 섞지 않습니다.

새 settle/__tests__/settle.extras-single-compare.test.ts는 같은 값 object Overwrite·Merge, 선언 자식 유무, 원래 Merge 복사 알고리즘과의 같은 값·다른 값·새 키·빈 입력 행렬, items 없는 배열·prefixItems 꼬리·items 배열, 구조 동사의 새 children·extras·값 참조와 UpdateChildren, 같은 값으로 되돌아오는 배치, 비활성 Merge의 같은 HostLatent 참조와 재진입을 검증합니다. 첫 일반 쓰기에는 기준에서도 dirty/global-state revision이 생기므로, 같은 값 revision 불변 시험은 그 상태를 먼저 안정시킨 뒤 고정합니다. 첫 쓰기의 기존 상태 변화까지 보존되는지는 아래 실제 두 dist 비교에서 별도로 확인했습니다.

### 실제 두 dist 자기 비교

기준과 수정의 비계측 dist 사본을 각각 독립 실행했습니다. Node와 Bun 모두 6장면·88단계(마운트 6회와 쓰기 82회)의 차이가 0건입니다. 객체 두 장면(선언 자식 유무), 배열 네 장면(extras-only·prefixItems·옛 tuple items·일반 items)에서 같은 값·다른 값 Overwrite와 Merge, 새 키·빈 Merge, 게이트 나감·잠복 Merge·재진입, push·insert·remove·pop·update·clear, 같은 값으로 되돌아오는 두 배치, sparse·undefined·NaN 입력을 실행했습니다.

전체 listener event의 종류·payload·순서, root onChange, 모든 살아 있는 노드의 local·emit·raw·extras·스키마·상태·17개 bit별 revision, children·item key·경로, loadSnapshot·commit·진단·global counts, 잠복·inactive·misfit·선택·경고 저장소, 단계 전후 local·emit·extras·children·snapshot 참조 유지 여부를 비교했습니다. 따라서 같은 값의 추가 UpdateValue·값 revision·onChange가 없고, 처음 쓰기의 기존 상태 revision을 포함한 전체 기록도 두 판이 일치합니다.

원자료와 재현 도구는 .seiri/tasks/l3c-extras-single-compare/에 있습니다. run/compare.mjs가 두 사본을 실제로 실행하고 deepStrictEqual로 비교하며, run/node-compare.json과 run/bun-compare.json에 각각 status=pass, scenes=6, steps=88, differences=0을 남겼습니다. before-test.log·after-test.log·full-test.log에 시험 결과를 보존했습니다.

## A2 Node·Bun 두 바퀴

first-batch/b-a2의 config.mjs·bench-common.mjs를 수정 없이 복사하여 a2Scenes·measure·correctness를 사용했습니다. brief가 지정한 B0·B1 N=1,000의 one-key(k500)·all-keys 쓰기입니다. B0는 선언 자식이 없는 객체, B1은 k0를 선언한 객체입니다. 마운트 행은 이번 측정 대상이 아닙니다.

순서는 Node 1 → Bun 1 → Node 2 → Bun 2이며, 두 번째 바퀴는 --reverse로 판과 장면 순서를 뒤집었습니다. 각 판·장면·바퀴당 warmup 20회·sample 100회, NODE_ENV=production, Node v24.20.0·Bun 1.4.3입니다. 측정 동안 이 작업의 다른 gate·build는 실행하지 않았습니다.

아래 ms 점 추정은 두 바퀴 중앙값의 산술 평균이고 대괄호는 두 중앙값의 최소–최대입니다. 줄어든 %는 각 바퀴의 (1 - 수정/기준) 비율을 먼저 계산한 다음 평균한 값과 최소–최대입니다. 따라서 ms 평균의 단순 비율과 같지 않을 수 있으며, 신뢰 구간이 아닙니다. 음수는 느려짐입니다.

| 런타임 | 장면 | 쓰기 | 수정 전 ms [두 바퀴 min–max] | 수정 후 ms [두 바퀴 min–max] | 줄어든 % [두 바퀴 min–max] |
|---|---|---|---:|---:|---:|
| Node | B0 | one-key | 0.9870 [0.9519–1.0221] | 0.9244 [0.9197–0.9292] | 6.2 [3.4–9.1] |
| Node | B0 | all-keys | 0.5814 [0.5604–0.6024] | 0.5779 [0.5598–0.5959] | 0.6 [0.1–1.1] |
| Node | B1 | one-key | 0.8960 [0.8040–0.9881] | 0.9331 [0.9094–0.9568] | -5.5 [-19.0–8.0] |
| Node | B1 | all-keys | 0.5796 [0.5648–0.5944] | 0.5755 [0.5499–0.6011] | 0.8 [-1.1–2.6] |
| Bun | B0 | one-key | 0.4759 [0.4526–0.4991] | 0.4109 [0.3896–0.4323] | 13.7 [13.4–13.9] |
| Bun | B0 | all-keys | 0.4076 [0.4059–0.4093] | 0.4077 [0.4021–0.4134] | -0.04 [-1.9–1.8] |
| Bun | B1 | one-key | 0.4599 [0.4282–0.4916] | 0.4393 [0.4125–0.4660] | 4.4 [3.7–5.2] |
| Bun | B1 | all-keys | 0.4298 [0.4200–0.4396] | 0.4036 [0.4013–0.4059] | 6.0 [3.4–8.7] |

B0 one-key는 두 runtime의 두 바퀴 모두 개선됐습니다. Node B1 one-key는 바퀴별 -19.0%, +8.0%로 방향이 바뀌고 평균은 5.5% 악화입니다. Node B1 all-keys와 Bun B0 all-keys도 방향이 섞입니다. 모든 행 개선을 주장하지 않으며 모든 행 악화 중단 조건에는 해당하지 않습니다.

3,200개 측정 표본과 640개 warmup의 정상 값·반환값·onChange 관측이 모두 통과했습니다. 별도 Merge 한 키 추가와 caller-mutates-after-write를 포함한 correctness 16행도 통과했습니다. WRITE-013 입력 불변·frozen caller·VALUE-002 순서·B1 선언 키 누출 없음·Merge의 이전 키 및 사본 보존·사후 호출자 키 변조 격리에서 실패가 없습니다. timing 32행과 별도 correctness 16행에 fail 상태가 없음을 러너가 검사했습니다.

측정 원자료는 run/node-round1.json·bun-round1.json·node-round2.json·bun-round2.json입니다. prepare-bundles.mjs가 기준 build와 수정 build의 사본을 만들고, run/timing.mjs가 기존 A2를 실행합니다. MEASURE_WORKTREE에 이 작업 폴더를 지정하여 NODE_ENV=production node .seiri/tasks/l3c-extras-single-compare/run/timing.mjs와 같은 Bun 명령을 실행하며, 둘째 바퀴에는 --reverse를 더합니다.

내부 심볼 일곱 개를 export한 한 줄만 비계측 dist 사본에 더했습니다. 이는 원본 dist 직접 실행 시간과 구별하며 절대 시간을 공개 사용 시간으로 주장하지 않습니다. 양 판의 같은 형태 사본끼리 비교했습니다.

### dist 식별

| 대상 | SHA-256 |
|---|---|
| 기준 raw dist | 731ee40d0cf45fd0940716b2155ea1e6e8023ed6735f1d49775dbaf113d5579a |
| 수정 raw dist | a6933f26edd3c6f8b8a723e66b49bd0b652aca77d97fb766a6d53545cf00a0b7 |
| 기준 내부 export 사본 | 7318db8a50d8daed80c1c137f8ac7d9d0301c2902b3f40cdccfeb58c60c75779 |
| 수정 내부 export 사본 | fac245bb999174fb185d8f7afd5801b3c91f4adbee63224a518ca7170e7f03a0 |
| 공통 winglet common-utils | 7de0a8437570ec34bd9627885ebbcc9133347b92eadae9c01693a5a24a6cfc9e |
| 공통 winglet react-utils | 48c575ffcae6334a9f388c10932366977dcb60e5af443d5e7a3cd3716f0419f2 |
| 공통 winglet json | 46d6b60e1513a9759e874ed254c38bae5d18a96675ab9094e9d5031cc121cae9 |

같은 설치·winglet dist를 썼으며 run/identity-baseline.json·identity-direct.json에 기록했습니다. 원래 config의 engineSha256는 실행 당시 현재 dist이므로 기준 사본의 정확한 식별에는 위 raw/bundle 해시를 사용합니다.

## 변경량과 FCA

`git diff a9c00f534..d382874e86a0af8dbbb45273e12fc8b0901120a7 --stat`는 5개 파일 +285/-4입니다. 런타임 두 파일은 +6/-3(순 +3), 새 시험은 +278/-0, settle DETAIL은 +1/-1입니다. 기존 시험·expectation, 빌드 산출물, 원장, 설정은 커밋하지 않았습니다.

전체 FCA scan·validate·verification은 snapshot 32e922f69cb711aa25a0d83fd737f031f0ea0be0ae06e59493e4c83ab2f46ca0로 일치했습니다. 전체 판정은 FAIL이고 분석 완전성은 indeterminate입니다. 비면제 finding은 중복 제거 후 기존과 같은 76개(오류 24·경고 52), 진단 130개이며 변경 파일의 finding은 없습니다. engine 내부 finding 하나는 변경하지 않은 settle.gate-selection.test.ts의 동적 표 case 수 판정 불가이고, 새 시험 두 파일은 test-record 9개·8개로 정확합니다. 이 작업에서는 범위 밖 finding을 수정하지 않았습니다. 전체 JSON과 nextAction은 .seiri/tasks/l3c-extras-single-compare/filid-scan.json·filid-validate.json·filid-verification.json에 보존했습니다.

남은 해석상의 한계는 혼재된 Node B1 측정과 전체 FCA의 변경 밖 finding입니다. 이번 문서 작업에서는 병합을 수행하지 않습니다.

## 비교 형식과 측정 한계

[368라운드](../../reviews/round-368-owner-answers.md)의 열 순서와 부호에 맞춘 표입니다. 기존 감소율 표는 원본 그대로 보존하며, 아래에서는 느려짐을 +, 빨라짐을 −로 씁니다. ms는 기존 표와 같은 두 바퀴 중앙값의 산술 평균입니다. 점 변화율은 바퀴마다 `(수정 후 중앙값 / 수정 전 중앙값 − 1) × 100`을 계산한 뒤 평균하며, ms 평균끼리의 비율이 아닙니다. 대괄호는 ms에서는 바퀴별 중앙값의 최소–최대, 변화율에서는 바퀴별 변화율의 최소–최대입니다. 범위는 신뢰구간이 아니며, 바퀴 변화율이 0을 가로지르면 측정 가능한 차이가 없는 것으로 읽습니다.

옛 판 `0.16.1`은 비교 기준으로 남깁니다. 이 L3 실험에는 동일 창의 옛 판 표본이 없어 옛 판 ms와 수정 전·후의 옛 판 대비 비율을 `미검증`으로 표시합니다. 옛 판의 다른 창 수치나 다른 Node 버전 수치를 가져와 채우지 않습니다.

| 런타임 | 장면 | 옛 판 0.16.1 ms | 수정 전 ms [바퀴 min–max] | 수정 후 ms [바퀴 min–max] | 수정 전/옛 판 ±% | 수정 후/옛 판 ±% | 수정 후/수정 전 ±% [바퀴 min–max] |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Node v24.20.0 | B0 N=1,000 one-key | 미검증 | 0.9870 [0.9519–1.0221] | 0.9244 [0.9197–0.9292] | 미검증 | 미검증 | -6.2 [-9.1–-3.4] |
| Node v24.20.0 | B0 N=1,000 all-keys | 미검증 | 0.5814 [0.5604–0.6024] | 0.5779 [0.5598–0.5959] | 미검증 | 미검증 | -0.6 [-1.1–-0.1] |
| Node v24.20.0 | B1 N=1,000 one-key | 미검증 | 0.8960 [0.8040–0.9881] | 0.9331 [0.9094–0.9568] | 미검증 | 미검증 | +5.5 [-8.0–+19.0] |
| Node v24.20.0 | B1 N=1,000 all-keys | 미검증 | 0.5796 [0.5648–0.5944] | 0.5755 [0.5499–0.6011] | 미검증 | 미검증 | -0.8 [-2.6–+1.1] |
| Bun 1.4.3 | B0 N=1,000 one-key | 미검증 | 0.4759 [0.4526–0.4991] | 0.4109 [0.3896–0.4323] | 미검증 | 미검증 | -13.7 [-13.9–-13.4] |
| Bun 1.4.3 | B0 N=1,000 all-keys | 미검증 | 0.4076 [0.4059–0.4093] | 0.4077 [0.4021–0.4134] | 미검증 | 미검증 | +0.04 [-1.77–+1.85] |
| Bun 1.4.3 | B1 N=1,000 one-key | 미검증 | 0.4599 [0.4282–0.4916] | 0.4393 [0.4125–0.4660] | 미검증 | 미검증 | -4.4 [-5.2–-3.7] |
| Bun 1.4.3 | B1 N=1,000 all-keys | 미검증 | 0.4298 [0.4200–0.4396] | 0.4036 [0.4013–0.4059] | 미검증 | 미검증 | -6.0 [-8.7–-3.4] |

이 표의 전후 비율은 이 실험의 교대 두 바퀴 안에서만 유효합니다. 다른 L3 실험·첫 묶음·재측정 창의 절대 시간과 이어 붙이거나 개선율을 누적하지 않습니다. 내부 export 사본·계측 사본·원본 dist는 서로 구별하고, 함수별 계측 점유율은 달성 가능한 절감량으로 읽지 않습니다.

Node B1 one-key·all-keys와 Bun B0 all-keys는 바퀴 변화율이 0을 가로지르므로 측정 가능한 차이로 판정하지 않습니다. markWrite의 중복 extras 비교 제거와 실제 시간의 혼재를 구별합니다.

[369라운드](../../reviews/round-369-owner-answers.md)의 옛 판 종료 기준은 기대 onChange와 루트·변경 자식의 값·경로가 적용된 시점 중 늦은 쪽입니다. 이번 실험에는 그 기준의 동일 창 옛 판 행이 없어 세 판 비교를 완료했다고 주장하지 않습니다. 새 판의 종료 경계와 정답 검사는 위의 해당 러너 기록에 한정합니다.

## 근거와 남은 검증

구현 병합과 결과 해석의 근거는 [406라운드 닫기](../../reviews/round-406-closing.md)의 bb4ff19d9, [첫 묶음 측정](first-batch-measurement.md), [400C-02](../../reviews/round-400-closing.md), [인계 문서](../../AGENT-HANDOFF.md)입니다. 구현 당시 커밋과 실제 측정 사본의 SHA-256을 구별하며, 구현 PR 본문·검토 기록은 보강 근거로만 사용합니다.

보존된 원시 JSON의 표본을 다시 계산해 기존 표를 대조했으며 새 표본을 만들거나 누락 표본을 복원하지 않았습니다. 기존 보고서의 ms·비율·바퀴 범위·호출 수·시험 수·해시와 실패 기록은 유지했습니다. 원시 자료는 위의 작업 폴더 임시 경로에 있고 이 문서 PR에 포함되지 않으므로, 체크아웃만으로 원자료까지 확보된다고 주장하지 않습니다. 정확한 UTC 측정 시작·종료 시각은 기존 보고서와 JSON에 없어 미검증입니다.

M3 소유자 수용은 아직 남아 있습니다. 동일 창의 옛 판·수정 전·수정 후 dist를 같은 관측 완료 기준으로 재는 368·369의 완전 비교와 정상동작 종합 검증은 M3에서 수행해야 합니다. 옛 판 대비 회귀나 계약상 남는 비용을 이 문서로 새로 수용하지 않으며, 문서 독립 검증과 최종 병합은 조정자에게 남깁니다.
