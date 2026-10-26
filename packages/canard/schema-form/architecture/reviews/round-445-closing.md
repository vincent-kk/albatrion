# 445라운드 닫기 — 기록 정리: 시간에 매인 문서의 제거, 원자료 정리, 벤치마크 기록의 보존

2026-10-26. 소유자의 발언 셋(`reviews/round-445-owner-answers.md`)에 따라 `architecture/` 의 인계·일지 문서를 지우고 기록을 정리한 결정을 적습니다. 본문의 "위 N행"은 그 문서의 소유자 발언 순서를 가리킵니다.

## 편집자 결정

- **445C-01 (시간에 매인 문서의 제거와 기록의 정리)**
  - 【추론】 소유자가 일지·인계처럼 시간에 매인 문서는 지우거나 기록물로 합치고, 커진 기록도 정리할 수 있는 것은 정리하라고 했다(위 1행). 인계·진행·일지·판단 문서 다섯(`HANDOFF.md`, `AGENT-HANDOFF.md`, `PLAN.md`, `PLAN-LOG.md`, `COORDINATOR-JUDGMENTS.md`)과 옛 사본 `_archive/2026-10-20/` 은 요지를 `reviews/README.md`(단계별 경과, 8단계 마감 상태, 운영 원칙, 코디네이터 판단 요지, 정리 기록)로 옮긴 뒤 지웠다. 원장이 이 문서들을 줄 번호로 인용하는 곳은 기준 커밋 `ba398c330` 의 옛 `HANDOFF.md` 뿐이라 `sup-check` 가 그 커밋에서 읽고, 나머지는 인용 문장 안의 이름이라 검사에 걸리지 않는다. 기록의 정리 규칙: 원장·설계문서·ADR·개발계획, 모든 닫기 문서와 소유자 답 문서, 대기열은 남긴다; 원장이 경로로 인용하거나 패키지의 시험·벤치·DETAIL 이 참조하는 파일과 그 import 대상, 남긴 결과 문서가 링크하는 결과 문서는 남긴다; 그 밖의 라운드 원자료·측정 원자료·프로토타입은 지운다. 원장이 경로나 줄 번호로 인용하는 단계 일지 넷(03·04·05·07, 인용 40곳)은 옮기면 근거가 끊기므로 증거로 제자리에 두었다. 라운드 마감 스크립트는 지운 문서를 고치던 것이라 지웠고, 검사 명령·기준값·라운드 기록 절차는 `ledger/checks/README.md` 로 옮겼다. 결과: 1,318개 파일, 약 31 MB 를 지웠고 디렉토리는 59 MB 에서 25 MB 가 되었다. 원장 검사는 모두 같은 결과이고, 토큰 잔여는 목록 입력에서 지운 `HANDOFF.md` 의 자기 서술 39개가 빠져 441 에서 402 가 되었다(새로 든 잔여 0). 남은 코드의 상대 import 가운데 정리로 끊긴 것은 0 이다. 처음 목록은 원장이 경로를 줄여 인용한 증거 다섯(`spikes/round18/proto/REPORT-v7.md`, `spikes/round9/oneof-if-output.txt`, `spikes/round8/proto/loop-v4e.mjs`, `reviews/raw-round9-naming-local.md`, `reviews/raw-round8-derivation-local.md`)과 그 곁의 `spikes/round9/regress/run.mjs`·`CHANGES.txt`, 측정 도구가 쓰는 `.gitignore` 둘, 개발계획이 링크하는 `reviews/story-regroup-proposal-184.md` 를 놓쳤고, 병합 전 독립 검증에서 드러나 되살렸다. 지운 파일은 정리 직전 커밋 `291509ca5` 에서 되살린다.
- **445C-02 (벤치마크 최종 기록과 측정 기준의 보존)**
  - 【추론】 소유자가 벤치마크의 최종 기록과 측정 기준은 남기라고 했다(위 2행). 처음 목록에서 지웠던 측정 기록과 도구 55개(M0 기준선 러너 `run-baseline.mjs`, 계측 탐침 `probe-*.ts`, 전후 배달 비교 러너 `first-batch/`, 7단계 최종 측정 `profile-111-final/`·`profile-136k-final/` 과 판정 문서, 2단계 기준선 보고, 426라운드 재측정 기록)를 되살렸고, 독립 검증의 지적으로 7단계 최종 측정 계획 `profile-136j-final/`, 번들 크기 도구 `profile-114-g26/` 의 측정 스크립트 셋, 남은 도구가 읽는 입력 JSON 둘(`bundle-source.metafile.json`, `round-88-quiet-baseline-summary.json`)도 되살렸다. 측정 원칙·채택 규칙·정상동작 증거·도구의 색인은 `verification/perf-optimization/README.md` 에 두었다. 8단계 최종 측정(443b)의 원본 표는 저장소가 추적하지 않는 작업 폴더에만 있었고 2026-10-26 에 그 폴더가 비워져 사라졌으므로, 세션 기록에 남은 출력에서 글자 그대로 복구해 `verification/perf-optimization/final-measure-443b.md` 로 두었다. 코어 표 1~3 의 47행과 React 주 표 38행은 모두 복구했고, DOM 보조 표 19행은 일부 열만, 8단계 전후 표 5 는 13행만 남았으며, 결함 수정 전후 교차 창 표 4(48행)는 요약만 남았다.
- **445C-03 (에이전트 정책의 유지)**
  - 【추론】 소유자가 `AGENT-POLICY.md` 는 작업이 아직 끝나지 않았으니 살리라고 했다(위 3행). 정리 직전 커밋 `291509ca5` 의 내용으로 되살렸고, 지운 `AGENT-HANDOFF.md` 를 가리키던 한 문장만 그 문서가 지워졌고 운영 원칙의 요지는 `reviews/README.md` 에 있다는 문장으로 바꿨다. 정책 본문은 그대로다.

## 근거와 남은 것

증거는 `reviews/round-445-owner-answers.md` 이고, 정리의 규칙·결과·되살리는 법은 `reviews/README.md` 의 정리 기록에 있다. 기록을 합치는 중에 자료끼리 어긋난 곳 가운데 고치지 않은 것이 하나 있다: `reviews/owner-queue-07.md` 의 대기열 55 는 "열림"으로 남아 있으나 375라운드 기록은 확정으로 적었다(대기열 정리는 9단계 문서 정리 때 한다). 열린 PR 은 최종 PR #445 와 우산 Draft #344 이고, #445 의 버전 번호·병합은 소유자 몫이다.

다음 라운드 번호는 446이다.
