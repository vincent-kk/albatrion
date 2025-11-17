## 🔍 Pre-Execution Checks

Before executing the plan, the following validations are performed automatically:

### 1. Plan File Validation
**Check**: Does the required plan file exist?
```bash
# Required file check
if [ ! -f "03_plan.md" ]; then
  echo "❌ 03_plan.md not found"
  exit 1
fi

# Recommended files check
[ -f "01_requirements.md" ] && echo "✅ Requirements found" || echo "⚠️ Requirements not found"
[ -f "02_design.md" ] && echo "✅ Design found" || echo "⚠️ Design not found"
```

**Auto-fix suggestions**:
- ❌ **03_plan.md missing** → Run `/requirements` first to generate plan
- ⚠️ **01_requirements.md missing** → Recommended but not required (execution continues)
- ⚠️ **02_design.md missing** → Recommended but not required (execution continues)
- ✅ **All files present** → Proceed to execution

### 2. Task Directory Structure
**Check**: Is the `.tasks/` directory structure valid?
```bash
# Directory structure check
TASK_DIR=$(dirname 03_plan.md)
echo "Task directory: $TASK_DIR"

# Verify directory naming pattern
if [[ ! "$TASK_DIR" =~ \.tasks/[a-z_]+_[0-9]{6}$ ]]; then
  echo "⚠️ Non-standard directory naming"
fi
```

**Auto-fix suggestions**:
- ❌ **Invalid structure** → Create proper directory: `.tasks/{feature}_{YYMMDD}/`
- ⚠️ **Non-standard naming** → Rename to follow convention (optional)
- ✅ **Valid structure** → Proceed to execution

### 3. Plan Content Validation
**Check**: Does the plan contain required sections?
```bash
# Section check in 03_plan.md
grep -q "## Phase" 03_plan.md && echo "✅ Phases defined"
grep -q "### [0-9]" 03_plan.md && echo "✅ Tasks defined"
grep -q "Done: \[ \]" 03_plan.md && echo "✅ Checkboxes present"
```

**Quality Checks** (Enhanced):
- ✅ **Architecture diagram present**: Design section includes component structure
- ✅ **Component specifications clear**: Each component has defined responsibilities
- ✅ **Dependencies documented**: External and internal dependencies listed
- ✅ **Test criteria defined**: Acceptance criteria for each task specified
- ⚠️ **Incomplete sections**: Automatically generate missing specifications
- ⚠️ **Ambiguous descriptions**: Request clarification before execution

**Auto-fix suggestions**:
- ❌ **No phases** → Plan format invalid, regenerate with `/requirements`
- ❌ **No tasks** → Plan is empty, regenerate with `/requirements`
- ⚠️ **No checkboxes** → Add `Done: [ ]` to each task
- ⚠️ **Missing architecture** → Generate basic component structure from requirements
- ⚠️ **Unclear dependencies** → Analyze imports and suggest dependencies
- ⚠️ **No test criteria** → Generate default acceptance criteria
- ✅ **Valid plan** → Proceed to execution

### 4. Skill Availability
**Check**: Are required skills available?
```bash
# Skill directory checks
.claude/skills/task-and-progress/
.claude/skills/execution-engine/
.claude/skills/git-workflow-automation/
```

**Auto-fix suggestions**:
- ❌ **Skills missing** → Verify `.claude/skills/` directory structure
- ❌ **Scripts not executable** → Run: `chmod +x .claude/skills/*/tools/*.sh`
- ✅ **Skills ready** → Proceed to execution

---

## Execution Workflow

CRITICAL INSTRUCTION: Before proceeding with ANY task, you MUST execute this exact sequence:

1. **Invoke Skills** in the following order:
   - `task-and-progress`: Select the next optimal task using ToT (Tree of Thoughts)
   - `execution-engine`: Implement and verify the selected task (3-level verification)
   - `git-workflow-automation`: Commit changes with 2-commit strategy

2. **Skills Workflow** (with Parallel Optimization):
   ```
   task-and-progress:
   → Reads 03_plan.md
   → Analyzes dependencies and priorities
   → **PARALLEL**: Identifies tasks that can run concurrently
   → Selects best task(s) using ToT scoring
   → Provides task details to execution-engine

   execution-engine:
   → Receives task details
   → **PARALLEL READ**: Reads all relevant files concurrently
   → Implements code following 5-Field format
   → **PARALLEL VERIFICATION**: Runs 3-level checks simultaneously
     • Code quality (lint, type-check)
     • Function correctness (unit tests)
     • Requirements compliance (acceptance tests)
   → Uses ToT for error recovery if needed
   → Passes completion status to git-workflow-automation

   git-workflow-automation:
   → Runs git_setup.sh (nvm, pull, deps, branch check)
   → **PARALLEL STAGING**: Stages code and tests in parallel
   → Creates Commit 1 (Feature): code + tests
   → Creates Commit 2 (Docs): documentation
   → Reports progress with live metrics:
     • Current task: [name]
     • Progress: [N/M tasks]
     • Time spent: [duration]
     • Quality score: [metrics]
   ```

3. **Execute in continuous mode** with minimal user interruption:
   - Each skill reads its own knowledge/ files
   - Each skill uses its own tools/ scripts
   - Skills communicate through well-defined interfaces
   - User intervention only when absolutely necessary

4. **Knowledge Resources**:
   - task-and-progress: `knowledge/task-selection-tot.md`, `knowledge/dependency-analysis.md`
   - execution-engine: `knowledge/execution-workflow.md`, `knowledge/verification-levels.md`, `knowledge/error-recovery-tot.md`
   - git-workflow-automation: `knowledge/git-setup.md`, `knowledge/commit-strategy.md`, `knowledge/commit-message-rules.md`

5. **Automation Scripts**:
   - `task-and-progress/tools/task_selector.sh`: ToT-based task selection
   - `execution-engine/tools/verify.sh`: 3-level verification automation
   - `execution-engine/tools/error_analyzer.sh`: Error classification and recovery
   - `git-workflow-automation/tools/git_setup.sh`: Pre-execution setup
   - `git-workflow-automation/tools/commit_generator.sh`: Conventional Commits message generation

DO NOT proceed without invoking the skills in order. This modular approach ensures:
- Clear separation of concerns
- Reusable components across projects
- Automated quality checks and error recovery
- Consistent Git workflow and commit messages

---

## 🚀 Advanced Features

### 1. Checkpoint System
- **자동 체크포인트**: 각 Phase/Task 완료 시 자동 저장
  - Phase 완료 시 → `checkpoint_phase_N.json` 생성
  - Task 완료 시 → `progress_log.md` 업데이트
  - 실패 시 → 마지막 체크포인트부터 재개
- **상태 복원**: 중단된 작업 자동 감지 및 재개
  - 완료된 Task 건너뛰기
  - 진행 중이던 Task부터 시작
  - 의존성 자동 검증
- **롤백 기능**: 특정 체크포인트로 롤백 가능
  - `--rollback phase-N` 플래그로 특정 Phase 이전으로 복원
  - Git commit 자동 복원

### 2. Parallel Execution Support (Enhanced)
- **독립 Task 자동 감지**: 의존성 분석으로 병렬 실행 가능 Task 탐지
  - 의존성 그래프 자동 생성
  - 병렬 실행 가능 그룹 분류
  - 동시 실행 최대 수 제한 (기본: 3개)
- **시간 단축 최적화**: 병렬 실행으로 전체 실행 시간 최소화
  - 예상 시간 계산: 순차 vs 병렬
  - **실시간 진행 상황 표시** (30초마다 업데이트):
    ```
    🔄 실행 중... (Phase 2/4)
    ├─ ✅ Task 2.1: Component A (완료)
    ├─ 🔄 Task 2.2: Component B (진행 중 - 45%)
    ├─ ⏳ Task 2.3: Component C (대기)
    └─ ⏳ Task 2.4: Tests (대기)

    📊 Quality Metrics:
    - Code quality: 95/100 (lint: ✅, typecheck: ✅)
    - Test coverage: 87% (+5% from baseline)
    - Type safety: 100% (0 errors)

    ⏱️ Progress: 3/12 tasks | 8분 경과 | 예상 잔여: 12분
    ```
  - 병렬 Task 간 결과 동기화
- **에러 격리**: 하나의 Task 실패가 다른 Task에 영향 없음
  - 실패 Task만 재시도
  - 성공 Task는 보존
  - **조기 경고 시스템**:
    - Test failure detected → 즉시 일시 정지 및 보고
    - Type error > 5 → 분석 후 계속 여부 결정
    - Execution > 150% estimated → 진행 상황 확인 요청

### 3. Dry-Run Mode
- **실행 시뮬레이션**: `--dry-run` 플래그로 실제 변경 없이 실행 계획 확인
  - 예상 파일 변경 목록
  - 예상 Git 커밋 메시지
  - 예상 실행 시간
- **영향도 분석**: 각 Task의 영향 범위 사전 확인
  - 변경될 파일 목록
  - 의존성 영향 분석
  - 잠재적 충돌 감지
- **비용 예측**: 실행 전 리소스 사용량 예측
  - 예상 실행 시간 (순차/병렬)
  - 예상 코드 변경량 (LoC)
  - 예상 테스트 수행 시간

**Example Dry-Run Output**:
```
🔍 Dry-Run Mode: /execute .tasks/feature_250117

📋 실행 계획:
- Phase 1: 타입 정의 (3 tasks) → 예상 5분
  - Task 1.1: TimeSlot 타입 → src/types/TimeSlot.ts (new)
  - Task 1.2: Props 인터페이스 → src/types/Props.ts (new)
  - Task 1.3: Validation 함수 → src/utils/validate.ts (modify)

- Phase 2: 컴포넌트 구현 (4 tasks, 2개 병렬 가능) → 예상 8분
  - Task 2.1 || Task 2.2: 병렬 실행 가능
  - Task 2.3 → Task 2.4: 순차 실행 필요

📊 영향 분석:
- 신규 파일: 5개
- 수정 파일: 2개
- 예상 LoC: +320, -15
- 의존성 충돌: 없음

⏱️ 예상 실행 시간:
- 순차 실행: 약 18분
- 병렬 실행: 약 12분 (33% 단축)

💾 예상 커밋:
- Phase 1 완료: [Feat](types): Add TimeSlot type definitions
- Phase 2 완료: [Feat](components): Implement TimeSlot components

✅ 실행 가능 여부: READY
⚠️ 주의사항: Task 2.3에서 utils/validate.ts 수정 - 기존 함수 영향 확인 필요
```

---

<!-- Legacy Reference (Deprecated):
The original monolithic prompt has been refactored into 3 modular skills:
- Original: `.cursor/rules/plan-execution.mdc` (2096 lines)
- New Approach: `.claude/skills/task-and-progress/`, `.claude/skills/execution-engine/`, `.claude/skills/git-workflow-automation/`

Benefits of new approach:
- Modularity: Each skill has clear responsibility
- Reusability: Skills can be used independently
- Maintainability: Easier to update and test
- Scalability: Can add new skills without affecting existing ones
-->

---

## ⚠️ 문제 해결 (Troubleshooting)

### 스킬을 찾을 수 없는 경우
**문제**: 필수 스킬 (`task-and-progress`, `execution-engine`, `git-workflow-automation`) 디렉토리가 없음

**Fallback 동작**:
1. ⚠️ 경고 메시지: "스킬이 없어 기본 실행 방식을 사용합니다"
2. 네이티브 방식으로 실행:
   - 03_plan.md 수동 읽기
   - 작업 순차 실행
   - 수동 검증 및 커밋
3. 결과 품질: ToT 기반 최적화 및 자동 검증 없음

**해결 방법**:
```bash
# 스킬 디렉토리 확인
ls -la .claude/skills/task-and-progress/
ls -la .claude/skills/execution-engine/
ls -la .claude/skills/git-workflow-automation/

# 저장소에서 복원
git checkout .claude/skills/
```

### Plan 파일 형식 오류
**문제**: 03_plan.md가 잘못된 형식

**Fallback 동작**:
1. ❌ 실행 차단
2. 형식 오류 상세 안내
3. 재생성 권장: `/requirements`

**해결 방법**:
```bash
# Plan 파일 형식 확인
grep "## Phase" 03_plan.md
grep "### [0-9]" 03_plan.md
grep "Done: \[ \]" 03_plan.md

# 잘못된 경우 재생성
/requirements

# 수동 수정 (필요시)
# - Phase 제목: "## Phase N: ..."
# - Task 제목: "### N.N ..."
# - Checkbox: "Done: [ ]"
```

### 스크립트 실행 실패 시
**문제**: `task_selector.sh`, `verify.sh`, `error_analyzer.sh` 등 실행 실패

**Fallback 동작**:
1. ⚠️ 해당 단계 자동화 실패 알림
2. 수동 실행 가이드 제공:
   - 작업 선택: 수동으로 우선순위 판단
   - 검증: 수동 테스트 및 확인
   - 에러 분석: 로그 직접 확인
3. 기본 워크플로우로 진행

**해결 방법**:
```bash
# 스크립트 권한 확인
chmod +x .claude/skills/task-and-progress/tools/task_selector.sh
chmod +x .claude/skills/execution-engine/tools/verify.sh
chmod +x .claude/skills/execution-engine/tools/error_analyzer.sh

# 수동 실행하여 오류 확인
.claude/skills/task-and-progress/tools/task_selector.sh 03_plan.md
.claude/skills/execution-engine/tools/verify.sh
```

### Git 워크플로우 실패
**문제**: git_setup.sh 또는 commit_generator.sh 실행 실패

**Fallback 동작**:
1. ⚠️ 자동 커밋 실패 알림
2. 수동 Git 워크플로우 안내:
   - 수동 커밋 메시지 작성
   - Conventional Commits 가이드 제공
3. 2-commit 전략 설명

**해결 방법**:
```bash
# 수동 커밋 (Feature)
git add <files>
git commit -m "[Type](scope): description"

# 수동 커밋 (Docs)
git add docs/
git commit -m "[Docs](scope): documentation updates"

# Conventional Commits 형식
# [Feat|Fix|Chore|Docs|Refactor|Test](scope): description
```

## 📖 사용 예시

### 기본 사용법
```
/execute [작업디렉토리]
```
- 작업디렉토리: `.tasks/feature_name_YYMMDD` 경로

### 실제 시나리오

#### 시나리오 1: 요구사항 기반 구현 시작
```
상황: /requirements로 생성한 계획 실행
명령: /execute .tasks/timeslot_selector_250115
결과:
  - Phase 1 작업 시작
  - Task 1.1: TimeSlot 타입 정의 완료
  - Task 1.2: 컴포넌트 구조 생성 완료
  - progress_log.md 자동 업데이트
```

#### 시나리오 2: 중단된 작업 재개
```
상황: 이전 작업 중단 지점부터 계속 진행
명령: /execute .tasks/auth_feature_250110
결과:
  - progress_log.md 확인
  - 완료: Phase 1, Phase 2 (Task 2.1 ~ 2.3)
  - 진행: Phase 3 (Task 3.1부터 재개)
```

#### 시나리오 3: 자동 Git 커밋 포함 실행
```
상황: 각 Phase 완료 시 자동 커밋
명령: /execute .tasks/form_builder_250120
결과:
  - Phase 1 완료 → 자동 커밋 생성
  - Phase 2 완료 → 자동 커밋 생성
  - 커밋 메시지: Conventional Commits 형식
```

### 고급 기능 사용 예시

#### 예시 1: Checkpoint 시스템 활용
```
상황: 긴 작업 중 중단 후 재개
명령: /execute .tasks/large_feature_250117
결과:
  - Phase 1 완료 → checkpoint_phase_1.json 생성
  - Phase 2 진행 중 중단 (Task 2.3에서 멈춤)
  - 재실행: /execute .tasks/large_feature_250117
  - 자동 감지: Phase 1 건너뛰기, Task 2.3부터 재개
```

#### 예시 2: 병렬 실행으로 시간 단축
```
상황: 독립적인 Task들이 많은 프로젝트
명령: /execute .tasks/multi_component_250118
결과:
  - 의존성 분석: Task 2.1, 2.2, 2.3 병렬 실행 가능
  - 병렬 실행: 3개 Task 동시 진행
  - 시간 단축: 18분 → 12분 (33% 감소)
  - 실시간 진행: [2.1 ✅] [2.2 🔄] [2.3 ⏳]
```

#### 예시 3: Dry-Run으로 사전 검증
```
상황: 대규모 변경 전 영향도 확인
명령: /execute .tasks/refactoring_250119 --dry-run
결과:
  - 실행 계획 표시 (파일 변경 없음)
  - 영향 범위: 15개 파일, +450/-120 LoC
  - 예상 시간: 순차 25분, 병렬 17분
  - 잠재적 충돌: utils/helper.ts에서 주의 필요
  - 확인 후 실제 실행: /execute .tasks/refactoring_250119
```

#### 예시 4: 롤백 기능 사용
```
상황: Phase 2 결과가 예상과 다름, Phase 1로 돌아가기
명령: /execute .tasks/feature_250120 --rollback phase-1
결과:
  - checkpoint_phase_1.json 복원
  - Git commit 자동 롤백
  - Phase 2 변경사항 취소
  - Phase 1 완료 상태로 복원
```

## 💡 팁 & 모범 사례

### 실행 전 체크리스트
- ✅ **Requirements 품질 확인**: Architecture diagram, component specs, dependencies 모두 포함 여부
- ✅ **Git 상태 확인**: 깨끗한 working tree에서 시작 (`git status`)
- ✅ **Branch 전략**: Feature branch에서 작업 (`git checkout -b feature/xxx`)
- ✅ **Dependencies 최신화**: `yarn install` 또는 `npm install` 실행
- ✅ **Dry-Run 먼저**: 대규모 변경은 `--dry-run`으로 영향도 사전 확인

### 실행 중 모니터링
- 📊 **실시간 메트릭 확인**: 30초마다 업데이트되는 진행 상황 및 품질 지표
- 🔍 **조기 경고 대응**: Test 실패나 type error가 임계치 초과 시 즉시 대응
- ⏸️ **체크포인트 활용**: Phase 완료마다 자동 저장, 안전하게 중단/재개 가능
- 🔄 **병렬 처리 확인**: 독립 Task들이 자동으로 병렬 실행되는지 확인

### 실행 후 검증
- ✅ **Test 실행**: `yarn test` 로 모든 테스트 통과 확인
- ✅ **Build 확인**: `yarn build` 로 빌드 에러 없음 확인
- ✅ **Type Safety**: `yarn typecheck` 로 타입 안전성 확인
- ✅ **Lint**: `yarn lint` 로 코드 스타일 확인
- 📝 **Review**: `/review` 명령어로 최종 품질 검증
- 🚀 **PR 생성**: `/pr` 명령어로 구조화된 Pull Request 생성

### 문제 발생 시 대응
- 🔴 **즉시 중단**: Critical error 발생 시 실행 중단 및 원인 분석
- 🟡 **Checkpoint 복원**: 이전 Phase로 롤백 (`--rollback phase-N`)
- 🔧 **부분 재시도**: 실패한 Task만 선택적으로 재실행
- 📋 **Progress Log**: `progress_log.md`에서 상세 로그 및 에러 원인 확인

### 프로젝트 규모별 전략
- **소규모 (< 20 파일)**: 전체 실행, 예상 5-8분
- **중규모 (20-50 파일)**: 배치 실행, Phase별 검증, 예상 10-15분
- **대규모 (> 50 파일)**: 증분 실행, 체크포인트 활용, 여러 세션 분할, 예상 20-30분


---

## ✅ 성공 시 출력

```
✅ 계획 실행 완료!

📊 실행 결과:
- 작업 디렉토리: .tasks/timeslot_selector_250115
- 완료 Phase: 3개
- 완료 Task: 12개
- 실패 Task: 0개

📝 Phase별 진행:
- ✅ Phase 1: 타입 및 구조 정의 (4 tasks)
- ✅ Phase 2: 컴포넌트 구현 (5 tasks)
- ✅ Phase 3: 테스트 및 검증 (3 tasks)

📁 생성/수정 파일:
- src/types/TimeSlot.ts
- src/components/TimeSlotSelector.tsx
- src/hooks/useTimeSlot.ts
- src/__tests__/TimeSlotSelector.test.tsx

📋 Git 커밋:
- Phase 1 완료: abc1234 (3개 파일)
- Phase 2 완료: def5678 (2개 파일)
- Phase 3 완료: ghi9012 (1개 파일)

⏱️ 총 실행 시간: 8분 30초

💡 다음 단계:
1. 테스트 실행: yarn test
2. 최종 확인: /review
3. PR 생성: /pr
```

## ❌ 실패 시 출력

```
❌ 계획 실행 실패

🔍 원인:
- 03_plan.md 파일 없음
- 또는: Plan 파일 형식 오류
- 또는: Task 실행 중 에러 발생 (Phase 2, Task 2.3)

💡 해결 방법:
1. Plan 파일 확인:
   cat .tasks/your_feature/03_plan.md

2. Plan 재생성:
   /requirements "your feature description"

3. 실패 지점부터 재개:
   - progress_log.md에서 마지막 완료 Task 확인
   - 해당 Task부터 수동 진행
   - 또는 /execute 재실행 (자동 재개)

4. 스킬 확인:
   ls -la .claude/skills/execution-engine/
   ls -la .claude/skills/task-and-progress/

📚 추가 도움말: progress_log.md에서 상세 로그 확인
```
