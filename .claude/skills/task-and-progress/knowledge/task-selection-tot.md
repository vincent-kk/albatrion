# Tree of Thoughts 기반 작업 선택 알고리즘

## 개요

단순한 순차 선택 대신, Tree of Thoughts (ToT) 알고리즘을 사용하여 최적의 작업을 선택합니다.

## ToT 작업 선택 프로세스

### 1. 후보 생성 (Candidate Generation)

**목적**: 실행 가능한 모든 작업 후보를 나열

**알고리즘**:
```typescript
function generateCandidates(plan: Plan): TaskCandidate[] {
  const candidates: TaskCandidate[] = [];

  for (const phase of plan.phases) {
    for (const task of phase.tasks) {
      // 미완료 + required 작업만
      if (task.status === 'uncompleted' && !task.optional) {
        // 의존성 충족 여부 확인
        const dependenciesMet = checkDependencies(task, plan);
        if (dependenciesMet) {
          candidates.push({
            id: task.id,
            phase: phase.number,
            title: task.title,
            dependencies: task.dependencies,
            complexity: estimateComplexity(task),
            estimatedTime: task.estimatedTime,
            priority: calculatePriority(task),
          });
        }
      }
    }

    // 현재 Phase + 1 범위 내로 제한
    if (phase.number > currentPhase + 1) break;
  }

  return candidates;
}
```

**후보 제한 규칙**:
- 최대 5개 후보로 제한 (복잡도 감소)
- 현재 Phase 우선, 다음 Phase까지만
- Optional(*) 작업은 제외 (명시 요청 시 예외)

### 2. 평가 (Evaluation)

**목적**: 각 후보에 점수를 부여하여 최적 작업 식별

**평가 기준 (총 100점)**:

#### 1) 의존성 충족 (30점)
```typescript
function scoreDependencies(task: Task, plan: Plan): number {
  const requiredDeps = task.dependencies || [];
  const completedDeps = requiredDeps.filter(depId =>
    plan.findTask(depId).status === 'completed'
  );

  if (completedDeps.length === requiredDeps.length) {
    return 30; // 모든 의존성 충족
  } else {
    const ratio = completedDeps.length / requiredDeps.length;
    return Math.floor(ratio * 30); // 부분 충족
  }
}
```

#### 2) 우선순위/영향도 (25점)
```typescript
function scorePriority(task: Task): number {
  // 비즈니스 가치 또는 다른 작업 차단 해제 정도

  if (task.blockingOthers > 5) return 25;  // 다수 작업 차단 중
  if (task.blockingOthers > 2) return 20;  // 일부 작업 차단
  if (task.priority === 'High') return 18;
  if (task.priority === 'Medium') return 12;
  return 8; // Low priority
}
```

#### 3) 복잡도 vs 가용 시간 (20점)
```typescript
function scoreComplexity(task: Task, availableTime: number): number {
  const ratio = availableTime / task.estimatedTime;

  if (ratio >= 2) return 20;   // 충분한 시간
  if (ratio >= 1.5) return 18; // 여유 있음
  if (ratio >= 1) return 15;   // 딱 맞음
  if (ratio >= 0.7) return 10; // 빠듯함
  return 5; // 시간 부족
}
```

#### 4) Phase 정렬 (15점)
```typescript
function scorePhaseAlignment(task: Task, currentPhase: number): number {
  if (task.phase === currentPhase) return 15;
  if (task.phase === currentPhase + 1) return 10;
  return 5; // 먼 미래 Phase
}
```

#### 5) 리스크 수준 (10점)
```typescript
function scoreRisk(task: Task): number {
  // 실패 시 영향도 (낮을수록 좋음)

  if (task.riskLevel === 'Low') return 10;
  if (task.riskLevel === 'Medium') return 7;
  return 4; // High risk
}
```

**총점 계산**:
```typescript
function evaluateTask(task: Task, context: EvaluationContext): number {
  return (
    scoreDependencies(task, context.plan) +
    scorePriority(task) +
    scoreComplexity(task, context.availableTime) +
    scorePhaseAlignment(task, context.currentPhase) +
    scoreRisk(task)
  );
}
```

### 3. 선택 (Selection)

**기본 선택 규칙**:
```typescript
function selectBestTask(candidates: TaskCandidate[]): Task {
  // 1. 점수순 정렬
  const sorted = candidates.sort((a, b) => b.score - a.score);

  // 2. 최고점 작업 선택
  return sorted[0];
}
```

**동점 처리**:
```typescript
function selectWithTieBreaking(candidates: TaskCandidate[]): Task {
  const maxScore = Math.max(...candidates.map(c => c.score));
  const topCandidates = candidates.filter(c => c.score === maxScore);

  if (topCandidates.length === 1) {
    return topCandidates[0];
  }

  // 동점 시 우선순위 규칙 적용
  return topCandidates.sort((a, b) => {
    // 1순위: Priority
    if (a.priority !== b.priority) {
      return priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority);
    }
    // 2순위: Dependencies (적을수록 좋음)
    if (a.dependencies.length !== b.dependencies.length) {
      return a.dependencies.length - b.dependencies.length;
    }
    // 3순위: Phase Alignment (현재 Phase 우선)
    return Math.abs(a.phase - currentPhase) - Math.abs(b.phase - currentPhase);
  })[0];
}
```

### 4. Lookahead & Backtrack

**Lookahead (전방 예측)**:
```typescript
function lookahead(selectedTask: Task, plan: Plan): LookaheadResult {
  // 선택한 작업 완료 시 다음 가능 작업들
  const simulatedPlan = simulateTaskCompletion(selectedTask, plan);
  const nextCandidates = generateCandidates(simulatedPlan);

  return {
    nextTasks: nextCandidates,
    estimatedPath: estimateExecutionPath(nextCandidates),
    totalTime: calculateTotalTime(selectedTask, nextCandidates),
    phaseCompletionTime: estimatePhaseCompletion(simulatedPlan),
  };
}
```

**Backtrack Plan (대안 경로)**:
```typescript
function generateBacktrackPlan(selectedTask: Task, candidates: TaskCandidate[]): BacktrackPlan {
  // 선택한 작업 실패 시 대체 경로
  const alternatives = candidates
    .filter(c => c.id !== selectedTask.id)
    .sort((a, b) => b.score - a.score);

  return {
    primaryTask: selectedTask,
    fallbackTasks: alternatives.slice(0, 2), // 상위 2개 대안
    recoveryCost: estimateRecoveryCost(selectedTask, alternatives[0]),
    recommendation: generateRecoveryRecommendation(selectedTask),
  };
}
```

## Optional 작업(*) 처리

### 자동 스킵 (기본)

```typescript
function shouldSkipOptional(task: Task, context: ExecutionContext): boolean {
  // Optional 작업은 기본적으로 스킵
  if (task.optional && !context.explicitRequest) {
    return true;
  }
  return false;
}
```

### 명시적 실행

```markdown
사용자 요청:
/execute-plan 2.4

→ task.id === "2.4" && task.optional === true
→ context.explicitRequest = true
→ 실행 진행
```

### Phase 완료 조건

```typescript
function isPhaseComplete(phase: Phase): boolean {
  const requiredTasks = phase.tasks.filter(t => !t.optional);
  const completedRequired = requiredTasks.filter(t => t.status === 'completed');

  return completedRequired.length === requiredTasks.length;
  // Optional 작업은 완료 조건에 포함 안 됨
}
```

## 실제 예시

### 시나리오: Phase 2 작업 선택

**03_plan.md 상태**:
```markdown
## Phase 2: 컴포넌트 개발
- [x] 2.1 Button 컴포넌트 ✓ 2025-01-15 완료
- [x] 2.2 Input 컴포넌트 ✓ 2025-01-15 완료
- [ ] 2.3 Storybook 스토리 작성
- [ ]* 2.4 컴포넌트 단위 테스트 (optional)
- [ ] 2.5 Phase 2 마무리

## Phase 3: 통합
- [ ] 3.1 페이지 통합
```

**ToT 선택 과정**:

1. **후보 생성**:
```
Candidate A: 2.3 (Storybook 스토리)
Candidate B: 2.5 (Phase 2 마무리) - 2.3 의존
Candidate C: 3.1 (페이지 통합) - Phase 2 완료 의존
Candidate E: 2.4 (단위 테스트) - Optional, 제외
```

2. **평가**:
```
Candidate A (2.3):
- 의존성: 30/30 (2.1, 2.2 완료)
- 우선순위: 18/25 (Medium, 개발 도구)
- 복잡도: 18/20 (1시간, 충분한 시간)
- Phase: 15/15 (현재 Phase)
- 리스크: 9/10 (Low)
총점: 90/100 ✅

Candidate B (2.5):
- 의존성: 15/30 (2.3 미완료)
- 우선순위: 23/25 (High, Phase 완료)
- 복잡도: 15/20 (2시간)
- Phase: 15/15
- 리스크: 7/10 (Medium)
총점: 75/100

Candidate C (3.1):
- 의존성: 0/30 (Phase 2 미완료)
- 총점: 불가능 ❌
```

3. **선택**: **Candidate A (2.3)** - 90점

4. **Lookahead**:
```
2.3 완료 시:
→ 2.5 가능 (점수 75 → 90으로 상승)
→ 2.5 완료 시 Phase 2 완료
→ 3.1 가능
예상 경로: 2.3 (1h) → 2.5 (2h) → 3.1 (4h)
```

## 성능 최적화

### 캐싱 전략

```typescript
// 평가 결과 캐싱 (동일 plan 상태)
const evaluationCache = new Map<string, number>();

function evaluateWithCache(task: Task, context: Context): number {
  const cacheKey = `${task.id}_${context.hash()}`;

  if (evaluationCache.has(cacheKey)) {
    return evaluationCache.get(cacheKey);
  }

  const score = evaluateTask(task, context);
  evaluationCache.set(cacheKey, score);
  return score;
}
```

### 조기 종료

```typescript
function selectBestTaskOptimized(candidates: TaskCandidate[]): Task {
  // 90점 이상 발견 시 조기 종료
  for (const candidate of candidates) {
    if (candidate.score >= 90) {
      return candidate; // 확실한 선택
    }
  }

  // 90점 미만일 경우 전체 평가
  return selectBestTask(candidates);
}
```

---

> **참고**: 이 알고리즘은 `tools/task_selector.sh`에 의해 자동 실행됩니다.
