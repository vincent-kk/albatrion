# T14 후속 진단·게이트 재실행·병합과 itemless 재측정 기록

2026-10-20. 소유자의 T14 후속·재측정 지시에 따른 전달 사실을 기록합니다. 이번 원장 워커가 제품 시험·빌드·측정을 새로 수행한 보고는 아닙니다. 소유자 원문과 반영 범위는 reviews/round-426-owner-answers.md에 있습니다.

## 남은 시간 시험의 진단

브리프는 verification/perf-optimization/l3-briefs/round-426-t14-followup-diagnosis-brief.md이며 task_eeb2f863e3a4의 증거는 `schema-form-observation-identity-2/.seiri/tasks/t14-followup-diagnosis/`입니다. report SHA256은c701d0ff99ad44f0cbb91b9ac73928c6ccab5a6ecf6b698007d158b24249791a, seal SHA256은44fd87476332b9a0671caab06fb8ead785d19cb1e557b0123983364929bbeb83입니다.

Node v24.20.0에서 `src/core/__tests__/global-errors.timing.test.ts`는 head에서5/5(파일 총시간208/211/206/206/213 ms), base에서5/5(207/210/210/208/208 ms) 통과했습니다. T14 네 커밋은 해당 시험의 import 경로에 있는 모듈을 바꾸지 않았으며 진단 판정은 timing-noise입니다. context-mode 하위 프로세스 PATH의 Node v26.12.0에서 먼저 수행한10회는 보조 자료로만 남깁니다. 새 실행 G1–G5 정의는 child 증거와 함께 소실됐고 `g5-reading.md`는 원래 열한 게이트의 상태표를 기록합니다.

## 게이트 재실행과 관측 동치

브리프는 verification/perf-optimization/l3-briefs/round-426-t14-gates-reexecution-brief.md이며 task_eb4de1902649의 보고서는 같은 child의 `.seiri/tasks/t14-gates-reexecution/report.md`입니다. report SHA256은9ceb445e48822cddee15ec9354ca8b497fc3945868e0035cefa04926a2c051d7, seal SHA256은0ee5aa2bc18a07c34e9c89f7a887ec562c78de5011f97f5638e109215e238358입니다. 봉인은180파일180110830바이트이며 불일치0입니다. protocol 산출물은 스크립트가 강제한 새 namespace `.seiri/tasks/observation-identity-portability/`에 새로 썼고 기존 자료를 덮어쓰지 않았습니다.

dfdda7f55의 독립 빌드 두 개에서 얻은 raw A/B는 바이트가 같습니다. Node24.20.0과 Bun1.4.3에서 helper12·capture12·import-model2로26시험을 확인했습니다. 런타임마다 SB1–SB4 standalone4회, original58 × source/A/B의174이력과174 lane 비교, 상태19·이력9채널, SB4 guard21·foreign6, source graph533·dependencies1098, raw 입력685파일을 확인했고 cross-runtime174쌍도 비교했습니다. 각 수는 소실된 요약과 같습니다. readiness 두 묶음의 합계는696이력·696비교·standalone16회이며 서로 같습니다.

legacy red5개(규칙 채널 셋·raw offset·unknown owner)는 요구대로 실패했습니다. cached/bad-SHA·wrong-module·corruption·raw prefix/literal 거부도 모두 거부했습니다. 별도의 Bun prepare는 canonical1098보다15많은 dependencies1113을 보고했지만 lane/fixture 바이트는 같았습니다.

새 raw SHA256은20e9321ba693d6fc810ab2f04a2aced52e7ccc996f17978a27db342133166fbd로 소실된012572a00b6b6a47e39c7e40d2e14b879bc6897ae5fd0753b3ba98409c7b0b09와 다릅니다. 워커는 두 해시가 같은 객체를 해시한 것인지 확인하지 못했습니다. 별도로 코디네이터는20e9321b…가 PR423 merge-base에서 빌드한 재측정 baseline ESM SHA256과 바이트 단위로 같은 값이며, 그 제품 src tree도1be215791f077fc7dc51825a357e916316193ecb로 같음을 관찰했습니다. 두 checkout에서 같은 E-free ESM을 만들었다는 관찰과 소실된 해시 객체의 미확정은 구분합니다.

Filid는 이전384건(info308·warning52·error24)에서371건(308/39/24)이며 전역 FAIL/INDETERMINATE입니다. 변경14파일의 직접 finding은0, 제외13경로와 root 전역 제한4개를 함께 기록합니다.

## 독립 검토와 한계

브리프는 verification/perf-optimization/l3-briefs/round-426-t14-verify-brief.md입니다. agy gemini-3.8-flash-high의 task_c2678dfadde5 판정은 통과(조건부)입니다. 14경로 범위·DETAIL-first 순서·WeakMap 연결·28채널 보존·174동치와 음성 대조군을 확인했습니다. 조건은 실패0인 전체 시험 영수증이 없어 남은 시간 잡음 실패의 소유자 예외가 필요하다는 것과 Filid 전역 FAIL이 baseline이라는 것입니다. 검토자가 보고서 경로를 제출하지 않았고 구조화 transcript도 코디네이터가 얻지 못했습니다(`session_not_reported`). 판정과 조건의 근거는 worker_done 메시지뿐입니다.

## 소유자 예외와 직접 병합

소유자는 시간 잡음 예외를 승인했습니다. 코디네이터의 `gh pr ready 424`와 `gh pr merge 424 --squash`는 Claude Code auto mode 분류기가 "Merge Without Review" 사유로 모두 거절했고 Vincent가 직접 병합했습니다. squash 병합 커밋은4e9b6786ee2c2d45220caf6544efb3b6198e2ec2, 시각은2026-10-20T01:10:40Z이며14파일·추가2972행입니다. 시험·임계값·기대값은 바꾸지 않았고 제품 소스 변경은0입니다.

검증 파일이 src 아래에 있어 패키지 src tree는1be215791f077fc7dc51825a357e916316193ecb에서78c85b5906006a36e8eb9b4da0c5933a74976b76으로 바뀌었습니다. 제품 코드 차이는 여전히0입니다. GitHub squash는 Vincent Kelvin과 noreply 주소를 담은 `Co-authored-by` trailer를 추가했습니다. 앞선 병합67484c0be·fde6ab359·ef6747ea0에는 없어 이 가지 병합 중 첫 사례입니다. 이를 제거하려면 공유 가지 강제 push가 필요하므로 소유자 판단에 남겨 두었습니다.

## itemless 재측정의 입력과 환경

브리프는 verification/perf-optimization/l3-briefs/round-426-itemless-remeasurement-brief.md이며 task_43af85daaa4c는 `l3e-direct-ownership`의282685f27에서 수행했습니다. baseline dist는 merge-base6d7d78d32에서, candidate는 HEAD에서 빌드했고 export-only identity는 기록값과 일치했습니다.

| 빌드 | ESM SHA256 | CJS SHA256 |
| --- | --- | --- |
| baseline | 20e9321ba693d6fc810ab2f04a2aced52e7ccc996f17978a27db342133166fbd | 6317f3af5139325b5e71f511f7f2f5cc417ca05a93d497ceb1384490cdaec8c5 |
| candidate | 00d4f9d61241d9aa672f9e1bb7d6735d7e0088a8a9f741013233dc9f66e8d5d4 | 7e1cffb2933fb3b0f2e78188f97248d54205241d18064cf242cbe6fb8b9e4b88 |

Node v24.20.0·Bun1.4.3·Yarn4.12.0·macOS27.0.1입니다. quiet 창은2026-10-20T01:01:54.748Z–01:04:59.479Z, 순서는Node1→Bun1→Bun2→Node2이며136행·13600표본·2720 warmup입니다.

## 재측정 결과의 판독

| Node object-B0-N1000 | baseline 중앙값(ms) | candidate 중앙값(ms) | 차이 |
| --- | ---: | ---: | ---: |
| 1라운드 | 1.2269165 | 0.8871665 | −27.691% |
| 2라운드 | 0.893292 | 1.102750 | +23.448% |

baseline 중앙값 자체가 두 라운드 사이에 달라졌습니다. 2026-10-18 창은+13.890%/+14.061%였습니다. 426 창의 두 라운드는 부호가 반대이므로 이 창에서는 차이가 입증되지 않았다고 기록합니다. 이전 창의 일관된 약14% 지연을 뒤집거나 확인하지 않고 두 창의 원자료를 함께 소유자 결정60에 넘깁니다. 느린 행을 잡음 또는 수용으로 처리하지 않습니다.

적어도 한 라운드에서 baseline보다 느린 장면은17개입니다. Node의7개는 root-BN-N1000·root-terminal-N1000·root-terminal-N8000·object-B0-N1000·reference-BN-N1000·reference-BN-N8000·reference-object-B0-N1000입니다. Bun의10개는 root-itemless-N1000·root-BN-N1000·root-BN-N8000·root-terminal-N1000·object-B0-N1000·reference-BN-N1000·reference-BN-N8000·reference-terminal-N1000·reference-terminal-N8000·reference-object-B0-N1000입니다. 두 라운드의 부호가 다른 행11개와 범위가0을 가로지르는 행11개를 기록합니다.

legacy reference보다 느린 것은8장면이며 Node·Bun 각각 object-B0-N1000·reference-BN-N1000·reference-BN-N8000·reference-object-B0-N1000입니다. 입력5572파일은 불변이고 tracked 변경은0입니다. child와 메인의 `.seiri/tasks/itemless-remeasure-426/`에 동일하게 봉인했으며 복사2442파일이 모두 같습니다. seal SHA256은de5395074b090365732d956275dd2d08f8523895c482a4269d70e08a89d88876입니다.

runner는 개별 warmup 시간을 출력하지 않습니다. aggregation helper의174이력 가정은 바로잡아 기록했습니다. legacy 비동기 root 시간은 여전히 미측정이며 성능 수용은 주장하지 않습니다.

## 남은 보류와 보존 경계

owner54/58/59/60·TEST-027/M3·성능 수용·PR423 병합과 P1 전체 protocol 실패는 보류합니다. F 가설은 시작하지 않았습니다. l3e-direct-ownership과 schema-form-observation-identity-2는 보존하며 병합 뒤 후자를 삭제하려면 소유자 승인이 필요합니다.

다음 라운드 번호는427입니다.
