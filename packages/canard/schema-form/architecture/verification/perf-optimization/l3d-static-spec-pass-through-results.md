# L3-d staticSpec 전달 결과

이 문서는 완료된 L3 실험의 원본 보고서와 수치를 보존한 기록입니다. 아래 구현 변경량·시험·빌드·FCA 결과는 당시 구현 작업의 결과이며, 이번 문서 작업은 지정된 결과 문서 다섯 개만 변경합니다. 제품 소스·시험·매니페스트·빌드 산출물·어댑터·INTENT·DETAIL 변경은 0건이고 새 측정·제품 게이트는 실행하지 않았습니다.

이미 해석한 자식의 첫 staticSpec을 markWrite에 전달하여 사용하지 않는 기본 인자 조회를 없앴습니다. Node·Bun 모두 BN N=1000 all-keys에서 2001→1001회, one-key에서 1002→1001회입니다. 실제 시간 개선은 확인되지 않았습니다. 두 바퀴 평균은 약 0.08~0.55% 느렸으며 바퀴별 증감 방향이 달랐습니다.

## 가지와 변경

- 가지: `perf/schema-form-static-spec-pass-through`
- 기준: `8efeaf19c68cefd557071bc51ad7319426d36fd0` (PR #419 병합 뒤 원장 커밋)
- 문서: `24f41bd6ee3c5724b75b33937c84359e702c9deb`
- 구현·새 시험: `4797cea79c22af1713b068f18da2cb56aaab9c69`
- 구현 PR: [#420](https://github.com/vincent-kk/albatrion/pull/420), `67484c0be`로 병합되었습니다.
- 시작 시 yarn install을 완료했습니다. 본 폴더는 brief의 명시적 읽기 허용 경로 외에는 접근하지 않았습니다.

`git diff 8efeaf19c..4797cea79c22af1713b068f18da2cb56aaab9c69 --stat`: 4 files, +204/-9. runtime은 markWrite 한 파일 +7/-8(순 -1), 새 시험 두 파일 +196/-0, DETAIL +1/-1입니다. 기존 시험 파일·기대값 변경은 0건입니다. 공개 API·INTENT·기존 staticSpec 캐시는 바꾸지 않았고 새로운 캐시는 없습니다.

커밋된 변경 파일:

- `packages/canard/schema-form/src/core/engine/settle/DETAIL.md`
- `packages/canard/schema-form/src/core/engine/settle/utils/input/markWrite.ts`
- `packages/canard/schema-form/src/core/engine/settle/utils/input/__tests__/markWrite.static-spec.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.static-spec-pass-through.test.ts`

## 호출 경로와 실제 쓰임

아래 경로는 `packages/canard/schema-form/src/core/engine/` 기준입니다. 줄 번호는 구현 후입니다.

| 경로 | 조회 결과의 쓰임과 처리 |
| --- | --- |
| `settle/utils/input/markWrite.ts:38,63-64` | 기본 spec은 미해석 값의 interpret에 사용됩니다. known인 경우 changedValue를 택하여 spec을 사용하지 않습니다. 기본값은 유지합니다. |
| `settle/utils/input/markWrite.ts:172-184` | 기존 조건 그대로 첫 spec을 조회하고 해석합니다. 그 spec과 해석값을 재귀 호출에 함께 넘깁니다. 미해석 자식은 undefined이므로 기존 기본 조회가 실행됩니다. |
| `settle/utils/input/interpretFieldNodeInput.ts:34,54,72` | 템플릿 입력과 하위 입력 해석에 사용하므로 유지합니다. `write/utils/chain/markBatchArrayOperation.ts:62,73`의 배치 반환·제거 슬롯 해석도 이 경로를 씁니다. |
| `settle/utils/transition/transitionSettlement.ts:172` | effective schema spec을 markWrite에 넘겨 전이 입력을 해석하므로 유지합니다. |
| `settle/loadFieldNodeAtMount/utils/staticFirst/loadStaticFirstTree.ts:103` | 최초 로드의 입력 해석에 사용하므로 유지합니다. |
| `settle/utils/latent/distributeLatentValue.ts:54` | 비활성 terminal의 입력 해석에 사용하므로 유지합니다. |
| `settle/utils/latent/distributeMovedLatentInput.ts:43` | 이동한 잠복 입력의 해석에 사용하므로 유지합니다. |

markWrite의 미해석 호출자는 enterFieldNode, restoreLatentState, replayMovedInput, applyDeriveWrite, arraySlots 적용, writeFieldNode, transitionSettlement, virtual sibling 경로입니다. 인자·기본값·전이 effective spec을 변경하지 않았습니다. childSpec은 반복 블록의 지역 변수이며 같은 해석 호출에서만 전달합니다. 기존 ternary를 같은 조건의 if로 바꾸어 분기 수를 늘리지 않았습니다.

## 시험과 조회 수

새 input organ 시험은 BN N=1000 all-keys·one-key·같은 값 쓰기의 staticSpec 조회를 **N+1 이하 상한**으로 단언합니다. 새 settle 시험은 정적 nullable 잎·중첩 branch·배열 coercion, 게이트와 잠복 Merge·재진입, 복수 출처 배치 및 배열 반환 슬롯, union/nullable을 관측합니다.

기준 구현에 같은 새 시험을 먼저 실행했습니다. 관측 4개와 같은 값 상한 1개는 통과했고, all-keys 2001회와 one-key 1002회가 상한 1001에서 실패했습니다. 수정 후 7개 모두 통과했습니다. 근거는 `.seiri/tasks/l3d-static-spec-pass-through/{before-test,after-test}.log`입니다.

| 런타임 | 장면 | 기준 조회 | 수정 조회 | 상한 |
| --- | --- | ---: | ---: | ---: |
| Node v24.20.0 | BN all-keys N1000 | 2001 | 1001 | 1001 |
| Node v24.20.0 | BN one-key N1000 | 1002 | 1001 | 1001 |
| Bun 1.4.3 | BN all-keys N1000 | 2001 | 1001 | 1001 |
| Bun 1.4.3 | BN one-key N1000 | 1002 | 1001 | 1001 |

조회 수는 실제 기준/수정 dist의 별도 계수 사본에서 쟀습니다. 시간 측정 사본은 계측하지 않았습니다.

## 실제 dist 배달 비교

Node·Bun 각각 기준/수정 모듈을 독립 로드하여 같은 5장면·37관측을 deepStrictEqual로 대조했고 차이는 모두 0건입니다. BN1000, 중첩 정적 객체, nullable 숫자 배열, 게이트·잠복·재진입, union/nullable과 복수 출처 배치를 포함합니다.

값·raw·extras·local·emit·schema·전체 이벤트와 onChange·17bit revision, 노드 및 children/container 참조의 이전 대비 동일성, inactive/latent/misfit·선언·warning·runtime snapshot/commit/diagnostics·전역 수를 정규화해 비교했습니다. 동일 입력·Merge·coercion과 배열 push/insert/remove/pop/clear/update·배치 반환값도 포함합니다. 원자료는 `.seiri/tasks/l3d-static-spec-pass-through/run/{node,bun}-compare.json` 및 `compare.mjs`입니다.

## 네 게이트

| 명령 (`yarn workspace @canard/schema-form`) | 결과 |
| --- | --- |
| `typecheck` | 통과 |
| `lint` | 통과 |
| `test --run` | 통과: 759파일, 4785 passed, 기존 todo 1개, 114.41초 |
| `build` | 통과 |

전체 시험 로그는 `.seiri/tasks/l3d-static-spec-pass-through/full-test.log`입니다. 변경 후 코드에 대해 실행했으며 이후 runtime/시험 변경은 없습니다. 빌드 산출물은 커밋하지 않았습니다.

## B 장면 두 바퀴 측정

2026-10-18, production, first-batch B 러너의 BN N1000 all-keys와 one-key(k500)를 사용했습니다. Node1→Bun1→Node2→Bun2 순서이며 두 번째 바퀴는 판과 장면 순서를 뒤집었습니다. 각 판·장면 warmup20/sample100, 비계측 steady 측정입니다. 시간 창은 기존 러너 그대로 host.setValue부터 drain이며, 정답 검증은 창 밖입니다. 측정 동안 다른 게이트·빌드는 실행하지 않았습니다.

ms는 두 바퀴 median의 평균 [최소–최대], 개선율은 각 바퀴 `(1−수정/기준)×100`의 평균 [최소–최대]입니다. 음수는 느려짐입니다. 범위는 바퀴 범위이며 신뢰구간이 아닙니다. 개선율 평균과 ms 평균의 비율은 다를 수 있습니다.

| 런타임 | 장면 | 기준 ms | 수정 ms | 개선율 % |
| --- | --- | ---: | ---: | ---: |
| Node v24.20.0 | all-keys | 2.553906 [2.515917–2.591896] | 2.561854 [2.540354–2.583354] | -0.320855 [-0.971276–0.329566] |
| Node v24.20.0 | one-key | 0.577927 [0.573229–0.582625] | 0.578490 [0.564396–0.592583] | -0.084163 [-1.709247–1.540920] |
| Bun 1.4.3 | all-keys | 1.289646 [1.272813–1.306480] | 1.291364 [1.234208–1.348521] | -0.092458 [-3.217923–3.033008] |
| Bun 1.4.3 | one-key | 0.260604 [0.259147–0.262062] | 0.262031 [0.260209–0.263854] | -0.554538 [-1.816540–0.707465] |

16행·1600 samples·320 warmups와 각 행의 정답 관측이 모두 통과했습니다. 두 바퀴의 개선율 범위는 모두 0을 가로지르므로 실제 시간의 개선을 주장할 수 없습니다. 앞선 원장의 36.241µs·2.75%는 집중계측 안의 내역이며 이번 실제 시간의 개선 예측에 사용하지 않습니다.

원자료와 러너는 `.seiri/tasks/l3d-static-spec-pass-through/run/`의 `node-1.json`, `bun-1.json`, `node-2.json`, `bun-2.json`, `timing.mjs`, `bench-common.mjs`, `config.mjs`입니다. raw dist에 내부 심볼 7개의 export만 더한 사본을 사용했고, 두 판은 같은 Winglet dist로 실행했습니다. 공개 dist를 직접 측정한 시간과 구별합니다.

| SHA-256 | 기준 | 수정 |
| --- | --- | --- |
| raw dist | `a6933f26edd3c6f8b8a723e66b49bd0b652aca77d97fb766a6d53545cf00a0b7` | `20e9321ba693d6fc810ab2f04a2aced52e7ccc996f17978a27db342133166fbd` |
| export 사본 | `fac245bb999174fb185d8f7afd5801b3c91f4adbee63224a518ca7170e7f03a0` | `31cb314e41037ba0ec7de8f5bedfbb21959268ab8e2431477b56aadcfbd23cc7` |

Winglet의 두 판 공통 SHA: common-utils `7de0a8437570ec34bd9627885ebbcc9133347b92eadae9c01693a5a24a6cfc9e`, react-utils `48c575ffcae6334a9f388c10932366977dcb60e5af443d5e7a3cd3716f0419f2`, json `46d6b60e1513a9759e874ed254c38bae5d18a96675ab9094e9d5031cc121cae9`입니다.

## FCA 감사와 한계

처음 engine 하위로 잘못 범위를 좁힌 호출은 불완전한 진단으로 사용하지 않았고, 프로젝트 전체 scan·validate·verification을 같은 snapshot `e216ba42c97f592b0810c4daba0218ee95b091b1a2d6600cf152d66cd4e14776`에서 다시 수행했습니다. 전체 679노드(203 fractal·476 organ), 비면제 finding 76개(오류24·경고52), 진단130개입니다. 전체 판정은 FAIL, 분석 완전성은 indeterminate입니다.

L3-c 감사와 rule/code·path·message 집합을 비교하여 finding·진단의 추가/제거는 모두0입니다. 변경 파일 finding은 없고 새 시험의 case 수는 3·4로 exact입니다. 기존 동적 표 경고와 범위 밖 finding은 수정하지 않았습니다. 원문·nextAction은 `.seiri/tasks/l3d-static-spec-pass-through/filid-{scan,validate,verification}.json`에 보존했습니다.

실제 시간에서 측정 가능한 차이가 없다는 한계는 그대로입니다. 구현 병합은 사용하지 않는 중복 조회 제거·관측 보존·코드 순감소의 기록이며 시간 개선을 수용한 판정이 아닙니다. 이 문서는 당시 미커밋 보고서를 보존합니다.

## 비교 형식과 측정 한계

[368라운드](../../reviews/round-368-owner-answers.md)의 열 순서와 부호에 맞춘 표입니다. 기존 감소율 표는 원본 그대로 보존하며, 아래에서는 느려짐을 +, 빨라짐을 −로 씁니다. ms는 기존 표와 같은 두 바퀴 중앙값의 산술 평균입니다. 점 변화율은 바퀴마다 `(수정 후 중앙값 / 수정 전 중앙값 − 1) × 100`을 계산한 뒤 평균하며, ms 평균끼리의 비율이 아닙니다. 대괄호는 ms에서는 바퀴별 중앙값의 최소–최대, 변화율에서는 바퀴별 변화율의 최소–최대입니다. 범위는 신뢰구간이 아니며, 바퀴 변화율이 0을 가로지르면 측정 가능한 차이가 없는 것으로 읽습니다.

옛 판 `0.16.1`은 비교 기준으로 남깁니다. 이 L3 실험에는 동일 창의 옛 판 표본이 없어 옛 판 ms와 수정 전·후의 옛 판 대비 비율을 `미검증`으로 표시합니다. 옛 판의 다른 창 수치나 다른 Node 버전 수치를 가져와 채우지 않습니다.

| 런타임 | 장면 | 옛 판 0.16.1 ms | 수정 전 ms [바퀴 min–max] | 수정 후 ms [바퀴 min–max] | 수정 전/옛 판 ±% | 수정 후/옛 판 ±% | 수정 후/수정 전 ±% [바퀴 min–max] |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Node v24.20.0 | BN N=1,000 all-keys | 미검증 | 2.553906 [2.515917–2.591896] | 2.561854 [2.540354–2.583354] | 미검증 | 미검증 | +0.320855 [-0.329566–+0.971276] |
| Node v24.20.0 | BN N=1,000 one-key | 미검증 | 0.577927 [0.573229–0.582625] | 0.578490 [0.564396–0.592583] | 미검증 | 미검증 | +0.084163 [-1.540920–+1.709247] |
| Bun 1.4.3 | BN N=1,000 all-keys | 미검증 | 1.289646 [1.272813–1.306480] | 1.291364 [1.234208–1.348521] | 미검증 | 미검증 | +0.092458 [-3.033008–+3.217923] |
| Bun 1.4.3 | BN N=1,000 one-key | 미검증 | 0.260604 [0.259147–0.262062] | 0.262031 [0.260209–0.263854] | 미검증 | 미검증 | +0.554538 [-0.707465–+1.816540] |

이 표의 전후 비율은 이 실험의 교대 두 바퀴 안에서만 유효합니다. 다른 L3 실험·첫 묶음·재측정 창의 절대 시간과 이어 붙이거나 개선율을 누적하지 않습니다. 내부 export 사본·계측 사본·원본 dist는 서로 구별하고, 함수별 계측 점유율은 달성 가능한 절감량으로 읽지 않습니다.

네 행 모두 바퀴 변화율이 0을 가로지르므로 측정 가능한 시간 차이가 없습니다. `36.241 µs ÷ 1,000 = 0.036241 ms`는 단위 환산일 뿐 절감 가능한 시간의 추정이 아니며, 2.75%의 계측 점유를 시간 개선으로 전환하지 않습니다. 구현 결과는 중복 조회 2001→1001·1002→1001 제거로만 기록합니다.

[369라운드](../../reviews/round-369-owner-answers.md)의 옛 판 종료 기준은 기대 onChange와 루트·변경 자식의 값·경로가 적용된 시점 중 늦은 쪽입니다. 이번 실험에는 그 기준의 동일 창 옛 판 행이 없어 세 판 비교를 완료했다고 주장하지 않습니다. 새 판의 종료 경계와 정답 검사는 위의 해당 러너 기록에 한정합니다.

## 근거와 남은 검증

구현 병합과 결과 해석의 근거는 [407라운드 닫기](../../reviews/round-407-closing.md)의 67484c0be, [첫 묶음 측정](first-batch-measurement.md), [400C-02](../../reviews/round-400-closing.md), [인계 문서](../../AGENT-HANDOFF.md)입니다. 구현 당시 커밋과 실제 측정 사본의 SHA-256을 구별하며, 구현 PR 본문·검토 기록은 보강 근거로만 사용합니다.

보존된 원시 JSON의 표본을 다시 계산해 기존 표를 대조했으며 새 표본을 만들거나 누락 표본을 복원하지 않았습니다. 기존 보고서의 ms·비율·바퀴 범위·호출 수·시험 수·해시와 실패 기록은 유지했습니다. 원시 자료는 위의 작업 폴더 임시 경로에 있고 이 문서 PR에 포함되지 않으므로, 체크아웃만으로 원자료까지 확보된다고 주장하지 않습니다. 정확한 UTC 측정 시작·종료 시각은 기존 보고서와 JSON에 없어 미검증입니다.

M3 소유자 수용은 아직 남아 있습니다. 동일 창의 옛 판·수정 전·수정 후 dist를 같은 관측 완료 기준으로 재는 368·369의 완전 비교와 정상동작 종합 검증은 M3에서 수행해야 합니다. 옛 판 대비 회귀나 계약상 남는 비용을 이 문서로 새로 수용하지 않으며, 문서 독립 검증과 최종 병합은 조정자에게 남깁니다.
