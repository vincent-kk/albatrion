# L3-e 검증 brief (읽기 전용)

당신은 검증자입니다. 어떤 파일도 만들거나 고치지 마십시오. git 상태를 바꾸는 명령(checkout, reset, stash, commit, push, worktree 등)을 실행하지 마십시오. 시험을 돌려도 되지만 빌드 결과물 외에 파일을 남기지 마십시오.

## 대상

- PR #416 (저장소 vincent-kk/albatrion, base feat/schema-form-08-review-and-perf). 구현 작업 폴더(읽기 전용으로만 보십시오): /Users/Vincent/Workspace/albatrion/l3e-direct-ownership
- 검토 범위 diff: 그 폴더에서 `git diff 008252bed..d9ca55595` (DETAIL +2, commitExitPolicyValues.ts +13/-5, 새 시험 +175).
- 구현 brief(계약): /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/8ca6ecf8-6206-4c84-a31b-faf0d38f2409/scratchpad/l3e-brief.md
- 정본 측정 문서: 그 폴더의 packages/canard/schema-form/architecture/verification/perf-optimization/first-batch-measurement.md 의 "## C — EXIT-LAYERS" 절(365~466행)과 "### L3 가설 다섯" 표의 L3-e 행.
- 원장 항목(같은 폴더의 packages/canard/schema-form/architecture/ledger/*.md, 제목 `### AREA-nnn `): CONTROLS-077, CONTROLS-073(7), WRITE-032, NODE-044, SETTLE-042, SETTLE-043.
- 구현자의 측정 결과: 같은 폴더의 packages/canard/schema-form/architecture/verification/perf-optimization/l3e-direct-ownership-results.md (미커밋 파일).

## 검증 축 (각각 통과/실패와 path:line 근거)

1. 동치: 바뀐 fragment 후보 검사(getFragmentOwnerPaths 직접 판정)가 수정 전의 "fragment 별 getControlLayers(child).some" 판정과 모든 경우에 같은 결과를 내는가. 특히 선택된 선언 → 직전 커밋 선택 fallback → 전체 선언 fallback 순서, 선언 자식의 소유 경로, 같은 층 keep 우선, 정책 우선순위, 직전 커밋 나감 의미. 다른 결과가 나올 수 있는 입력이 하나라도 있으면 그 입력을 구체적으로 적으십시오.
2. 계약: DETAIL.md 의 새 문장이 위 원장 항목과 어긋나지 않는가. DETAIL 이 코드 변경으로 틀려진 다른 기존 문장을 남기고 있지 않은가.
3. 범위: 추가된 코드가 제거된 비효율보다 크지 않은가(런타임 +13/-5). 캐시·전역 상태·상수 깎기가 없는가. 공개 API·공개 이름 수 불변인가.
4. 시험: 새 시험이 호출 수를 상한으로 단언하는가, 수정 전 구현에서 실제로 실패하는 시험인가(구현자는 572회 상한 실패를 확인했다고 보고), 자기 비교 행렬이 사양대로 기대값을 적는가, 기존 시험의 기대값 변경이 0건인가.
5. 측정 보고: 결과 파일의 표가 brief 5절의 형식(두 바퀴 min/max, Node·Bun 버전)을 지키는가, 72장면·323단계 차이 0 주장에 러너 근거가 있는가, Node exit +8.8% 라는 변화가 측정 문서 "C 나감 행의 범위"(−12.4%~+8.8%) 안에 있는가.
6. 커밋·PR 위생: 커밋 메시지에 공동 저자·세션 ID·"Claude-Session" 줄이 없는가, 사용자의 법적 이름이 없는가, PR 본문에 결정 58 입구 수치와 측정표가 있는가.

## 보고 형식

한국어. 맨 위에 "판정: 통과" 또는 "판정: 실패"와 한 줄 이유. 그 아래 축 1~6 각각 통과/실패, 근거 path:line, 실패면 수정 지시 한 줄. 마지막에 "관찰"로 수정은 아니지만 원장에 남길 만한 사실. worker_done 은 검증을 끝냈다는 뜻으로 --outcome succeeded 를 쓰고(판정이 실패여도 검증 자체는 성공), 요약 첫 문장에 판정을 넣으십시오.
