# L3-e 구현 brief — 나감 정책 의존 판정의 직접 소유 확인

저장소: /Users/Vincent/Workspace/albatrion (yarn 모노레포). 패키지: packages/canard/schema-form (패키지 CLAUDE.md의 명령을 따르십시오). 기준 가지: feat/schema-form-08-review-and-perf, 기준 커밋 008252bed. 당신은 Orca가 만든 별도 작업 폴더(worktree)에서만 작업하며, /Users/Vincent/Workspace/albatrion 본 폴더는 건드리지 않습니다. 작업 가지 이름: perf/schema-form-exit-layers-direct-ownership (Orca가 만든 가지 이름이 다르면 그 이름을 그대로 쓰고 보고에 적으십시오).

## 1. 목표 (가설 L3-e, 정본 문서)

정본은 packages/canard/schema-form/architecture/verification/perf-optimization/first-batch-measurement.md 의 "## C — EXIT-LAYERS"(365행부터 466행) 와 "### L3 가설 다섯" 표의 L3-e 행입니다. 먼저 이 두 곳을 끝까지 읽으십시오.

비효율: 게이트 조각(flag 등 나감 정책에 묶인 조각)이 켜진 채 다른 잎을 쓰는 "평상시 쓰기"마다, 쓰인 노드가 소유 자식인지 판단하려고 제어 층 전체(getControlLayers)를 모아 평가합니다. 조각 수 F에 초선형으로 비쌉니다(Node 계측 plain F=64 control: getControlLayers 572회).

반영할 규칙(문서 369~371행, 그대로): 선택된 선언과 직전 커밋의 선택 fallback 및 선언 자식의 소유 경로로 "첫 소유 자식 여부"만 직접 판정하고, 전체 정책 층 수집·평가와 우선순위 및 직전 커밋 나감 의미는 그대로 둡니다. 같은 층의 keep이 이깁니다. 근거 원장 항목: CONTROLS-077, CONTROLS-073(7), WRITE-032, NODE-044 (architecture/ledger/*.md, 항목 제목은 `### AREA-nnn `).

기대 효과(측정 문서 C 표): Node F=64 평상시 쓰기 3.384→1.048 ms, Bun 16.619→1.355 ms. 실제 나감(exit) 쓰기는 변하지 않음(Node 0.622→0.641, Bun 2.084→2.002). 계측: plain F=64 control의 getControlLayers 572회→18회, exit 78회→78회(그중 commitExitPolicyValues 호출자 몫 3회→3회). 72장면·323단계 전체 배달 비교 차이 0.

## 2. 범위와 제약

- 대상 코드: packages/canard/schema-form/src/core/engine/settle/utils/ 아래 controls/(getControlLayers.ts, readExitLayerPolicy.ts, getExitPolicyKey.ts 등), commit/(commitExitPolicyValues.ts, snapshotExitedPolicies.ts), transition/(readDepartingAncestorPolicy.ts, readUnsetPolicy.ts, captureLatentDescendants.ts 등). 실제로 판정이 일어나는 호출 경로를 먼저 추적해 어디서 전체 층 수집이 일어나는지 path:line 으로 적으십시오.
- 계약 불변: 선택·직전 커밋 fallback·소유 경로·정책 우선순위·직전 커밋 나감 의미·같은 층 keep 우선은 모두 그대로입니다. 공개 API와 공개 이름 수는 변하지 않습니다.
- 금지: 캐시 추가, 상수 깎기, 새 전역 상태. 추가되는 코드가 제거되는 비효율보다 크면 중단하고 보고합니다. 가설은 "한 가지 비효율 하나"만 겨냥합니다.
- 소유권 판정을 재사용할 때는 같은 쓰기 판정 안에서 인수로 넘기는 것만 허용하며 캐시가 아닙니다.
- 기존 시험의 기대값 변경은 0건이어야 합니다. 기존 시험을 고치지 마십시오.
- 호출 횟수 단언은 정확한 값이 아니라 상한으로 적습니다.
- 주석은 현재 사양만 적고 이력("previously", 날짜)을 적지 않습니다. 코드 주석과 식별자는 영어입니다.

## 3. 순서

1. settle fractal 의 DETAIL.md(packages/canard/schema-form/src/core/engine/settle/DETAIL.md 또는 실제 소유 fractal의 DETAIL.md)를 코드보다 먼저 고칩니다. 바뀌는 판정 절차를 한 문장 규칙으로 적고(위 규칙 문장), 그 변경 때문에 틀리게 되는 기존 문장만 같은 언어로 고칩니다. 다른 문장은 다시 쓰지 않습니다. INTENT.md 는 공개 경계가 안 바뀌므로 손대지 않습니다.
2. 코드를 고칩니다.
3. 시험을 추가합니다(해당 fractal 의 __tests__/ 안): (가) 조각이 켜진 평상시 쓰기에서 getControlLayers 호출 수가 상한 이하(예: F=64, C=16 에서 ≤ 24)이고, 나감 쓰기에서는 수정 전과 같은 범위임을 단언합니다. (나) 선택 fallback(직전 커밋 선택), 소유 경로(선언 자식), 같은 층 keep 우선, 우선순위 세 경우가 수정 전과 같은 값·배달을 내는 자기 비교 행렬(수정 전 결과는 같은 시험이 기준 구현 대신 사양대로 기대값을 적음).
4. 게이트: `yarn workspace @canard/schema-form typecheck`, `yarn workspace @canard/schema-form lint`, `yarn workspace @canard/schema-form test`, `yarn workspace @canard/schema-form build`. 모두 통과해야 합니다.
5. 측정: architecture/verification/perf-optimization/first-batch/ 의 README 와 C 축 러너를 읽고, 그 작업 폴더의 dist 를 새로 빌드한 뒤(측정은 빌드한 dist 로), Node 와 Bun 에서 plain control·exit 장면 F=4·16·64(C=16)를 두 바퀴 번갈아 재고 min/max 를 함께 적습니다. 그리고 72장면·323단계 배달 비교 러너를 돌려 차이 0을 확인합니다. 결과 표는 "장면 | F | C | 쓰기 | 수정 전 ms [두 바퀴] | 수정 후 ms [두 바퀴] | 줄어든 %" 꼴로 적고 Node·Bun 버전을 함께 적습니다. 측정 중에는 다른 게이트나 빌드를 돌리지 마십시오(같은 기계에서 조용한 창).
6. 커밋 둘: 첫째 `docs(schema-form): ...`(DETAIL 만), 둘째 `perf(schema-form): ...`(코드+시험). 커밋 본문에 "codex 구현" 한 줄. 공동 저자나 세션 ID, "Claude-Session" 같은 줄을 절대 적지 않습니다. 사용자의 법적 이름을 적지 않습니다.
7. 가지를 push 하고 PR 을 엽니다: `gh pr create --repo vincent-kk/albatrion --base feat/schema-form-08-review-and-perf --title "..." --body-file <파일>`. PR 본문에는 규칙 한 문장, 바뀐 파일, 측정 표, 결정 58 입구 수치("F=64 평상시 쓰기 3.38 ms 중 2.34 ms(Node)"), 계측 호출 수 전후, 72장면 차이 0 을 적습니다. PR 을 병합하지는 않습니다.

## 4. 보고 (worker_done)

성공이면 --outcome succeeded 로, 다음을 요약에 담으십시오: 가지 이름, 커밋 해시 둘, PR 번호와 URL, 게이트 네 개 결과, 측정 표가 있는 파일 경로(작업 폴더 안 architecture/verification/perf-optimization/ 아래에 새 markdown 으로 두되 커밋에는 포함하지 않고 경로만 보고), 바뀐 파일 목록, 기존 시험 기대값 변경 0건 확인, 추가된 줄 수와 제거된 줄 수.

중단해야 하는 경우(계약 문장과 어긋남, 추가 코드가 제거 비효율보다 큼, 측정 효과가 문서의 절반에도 못 미침, 72장면 차이가 0이 아님)는 고치려 들지 말고 --outcome failed 와 함께 근거(path:line, 수치)를 보고하십시오. 코디네이터에게 묻고 싶으면 preamble 의 ask 명령을 쓰십시오.
