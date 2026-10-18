# L3-b 구현 brief — items 없는 배열의 push·insert(N) 지름길

저장소: /Users/Vincent/Workspace/albatrion (yarn 모노레포). 패키지: packages/canard/schema-form (패키지 CLAUDE.md의 명령을 따르십시오). 작업 폴더: /Users/Vincent/Workspace/albatrion/l3e-direct-ownership (이미 있는 Orca 작업 폴더; 본 폴더 /Users/Vincent/Workspace/albatrion 은 건드리지 않습니다).

## 0. 첫 단계: 기준 커밋 맞추기

작업 폴더에서 `git status` 가 깨끗한지 확인하고(미커밋 측정 결과 파일 l3e-direct-ownership-results.md 와 .seiri/tasks 는 그대로 두어도 됨), `git fetch origin feat/schema-form-08-review-and-perf` 뒤 `git checkout -b perf/schema-form-array-append-shortcut origin/feat/schema-form-08-review-and-perf` 로 새 가지를 만듭니다. 기준 커밋은 a55071005 이어야 합니다(`git log -1 --oneline` 으로 확인해 보고에 적으십시오). 이전 가지 vincent-kk/l3e-direct-ownership 은 PR #416 으로 병합되었으니 지워도 됩니다. 의존성이 바뀌었을 수 있으니 `yarn install` 을 한 번 돌립니다.

## 1. 목표 (가설 L3-b, 정본 문서)

정본은 packages/canard/schema-form/architecture/verification/perf-optimization/first-batch-measurement.md 의 "## A3 — items 없는 배열의 읽기 조사"(343행부터 364행) 와 "### L3 가설 다섯" 표의 L3-b 행, 그리고 "### 관찰" 절입니다. 먼저 이 세 곳을 끝까지 읽으십시오.

비효율: `items` 가 없는(아이템 템플릿이 없는) 배열 호스트는 값이 모두 선언 밖 값(extras)이라, push 나 insert(N)(끝 덧붙임) 한 번마다 기존 지름길(`admitsStaticArrayTail` → `prepareArrayAppend` → `applyArraySlots`/`canApplyArrayTail`)이 extras 존재·템플릿 없음·children 길이 불일치 때문에 거절되어 일반 길로 가고, 일반 길은 모든 칸을 걷는 O(N) 접두 증명·재사용 검사를 합니다(Node 계측: push 8천에서 `getItemEntries` 24,003회 ≈ 3N; 터미널 배열 대비 push 5.8배(Node)·13.2배(Bun)).

반영할 것: items 없는 배열의 push·insert(N) 끝 덧붙임에 지름길 자격을 주어, 덧붙인 칸 하나만 보고 접두는 다시 증명하지 않게 합니다. 예상 규모는 약 60~120줄입니다.

먼저 지킬 조건(L3-b 행과 A3 절 그대로):
- prefixItems 튜플 뒤 꼬리(prefixItems 가 있고 items 가 없는 배열)는 제외합니다. 기존 자격 배제 목록(게이트 있음, 통째 raw 있음, 배치, 로드·자동 쓰기 등)은 그대로입니다.
- 지름길이 일반 길과 같게 유지할 관측(A3 절 "지름길이 일반 길과 같게 유지할 관측은 다음과 같습니다" 아래 목록을 전부): 새 빈 children 참조와 UpdateChildren 사건, revision, 로드 스냅숏 참조, extras 새 배열, itemCount 등. 빈 배열→빈 배열에서 UpdateChildren 이 나는 현재 관측은 그대로 유지합니다(없애지 않음).
- `compareArrayAppend` 픽스처(저장소 안에서 찾으십시오; src/core/engine/settle 아래 __tests__ 나 fixtures)로 일반 길의 전체 배달 기록과 대조해 차이 0이어야 합니다.
- 수용 사본(덧붙인 값의 복사)을 제외한 작업이 1천→8천에서 일정해야 합니다(상수 작업 검사).
- remove(0)의 extras 인식 splice 는 범위 밖입니다. 하지 마십시오.
- 캐시·전역 상태·상수 깎기 금지. 추가 코드가 제거 비효율보다 크면 중단하고 보고합니다.
- 공개 API 와 공개 이름 수 불변. 기존 시험 기대값 변경 0건.
- 호출 횟수 단언은 상한으로.
- 주석은 현재 사양만(이력 없음), 영어.

## 2. 순서

1. DETAIL 을 코드보다 먼저 고칩니다. L3-b 행이 말하는 "DETAIL 자격 문장 둘"은 packages/canard/schema-form/src/core/engine/settle/DETAIL.md 의 `arrayAppend` 선택 칸 문장(48행 근처, 정적 push·insert(N) 덧붙임 증명과 `canReuseArrayChildren` 자격)과 packages/canard/schema-form/src/core/engine/settle/arrangeFieldNodeItems/DETAIL.md 의 대응 자격 문장입니다. 이 둘만 바뀐 자격에 맞게 같은 언어로 고치고, 그 변경 때문에 틀리게 되는 문장만 추가로 고칩니다. INTENT.md 는 손대지 않습니다.
2. 코드를 고칩니다(arrangeFieldNodeItems/utils/arraySlots 아래의 admitsStaticArrayTail·prepareArrayAppend·applyArrayTail/canApplyArrayTail 가 후보; 실제 거절 지점을 path:line 으로 적으십시오).
3. 시험을 추가합니다(해당 fractal 의 __tests__/): (가) items 없는 배열 push·insert(N) 이 지름길을 타고 `getItemEntries`(또는 그에 해당하는 접두 방문) 호출 수가 N 에 비례하지 않음을 상한으로 단언(예: 1천과 8천에서 같은 상한); (나) prefixItems 꼬리·게이트·통째 raw·배치·로드 등 배제 조건에서는 지름길을 타지 않음; (다) compareArrayAppend 로 전체 배달 기록 차이 0(빈→빈 UpdateChildren 포함); (라) 선언 밖 값의 순서와 호출자 입력 불변(VALUE-002, WRITE-013).
4. 게이트: `yarn workspace @canard/schema-form typecheck`, `lint`, `test`, `build` 모두 통과.
5. 측정: first-batch 러너 README 를 읽고 A 축의 items 없는 배열 push·insert(N) 장면(1천·8천)을 Node 와 Bun 에서 두 바퀴 번갈아 재고 min/max 를 적습니다(dist 는 작업 폴더에서 새로 빌드; 수정 전 dist 는 a55071005 빌드). 표는 "장면 | N | 쓰기 | 수정 전 ms [두 바퀴] | 수정 후 ms [두 바퀴] | 줄어든 %" 꼴, Node·Bun 버전 함께. 측정 중 다른 게이트·빌드 금지. 측정 표는 작업 폴더 architecture/verification/perf-optimization/l3b-array-append-results.md 에 두되 커밋하지 않고 경로만 보고.
6. 커밋 둘: `docs(schema-form): ...`(DETAIL 둘만), `perf(schema-form): ...`(코드+시험). 본문에 "codex 구현" 한 줄. 공동 저자·세션 ID·"Claude-Session" 줄 금지. 사용자의 법적 이름 금지.
7. push 뒤 `gh pr create --repo vincent-kk/albatrion --base feat/schema-form-08-review-and-perf --title "..." --body-file <파일>`. 본문에 자격 규칙 한 문장, 바뀐 파일, 측정 표, 상수 작업 검사 결과(1천 대 8천 호출 수), 배달 비교 차이 0, 제외 조건 목록. 병합하지 않습니다.

## 3. 보고 (worker_done)

성공: --outcome succeeded. 요약에 가지 이름, 기준 커밋, 커밋 해시 둘, PR 번호·URL, 게이트 네 개 결과, 측정 표 경로, 바뀐 파일 목록, 기존 시험 기대값 변경 0건, 추가·제거 줄 수(런타임과 시험 따로).

중단(계약 문장과 어긋남, 추가 코드가 제거 비효율보다 큼, 측정 효과가 문서 예상의 절반 미만, 배달 차이 0 아님, compareArrayAppend 픽스처를 찾을 수 없음): 고치려 들지 말고 --outcome failed 와 근거(path:line, 수치)로 보고. 묻고 싶으면 preamble 의 ask 명령.
