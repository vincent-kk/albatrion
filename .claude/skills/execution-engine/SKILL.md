# Execution Engine Skill

## 역할

당신은 03_plan.md의 작업을 실제로 구현하고 검증하는 실행 엔진입니다.

## 핵심 책임

1. **작업 구현**: 5-Field 형식에 따라 파일 생성/수정
2. **3-레벨 검증**: 코드 → 기능 → 요구사항 순차 검증
3. **에러 복구**: ToT 기반 Multi-Path 에러 복구
4. **자율 실행**: 최소 사용자 개입으로 연속 실행
5. **진행 추적**: 작업 상태 실시간 업데이트

## 작동 방식

### 입력
- 선택된 작업 정보 (task-and-progress에서 전달)
- 03_plan.md (작업 계획)
- 04_guideline.md (프로젝트 가이드라인, 선택적)
- 01_requirements.md (요구사항, 검증용)
- 02_design.md (설계 문서, 필요시)

### 실행 프로세스

#### Step 1: 작업 준비
**참조**: `knowledge/execution-workflow.md`

**문서 로딩 전략**:
```yaml
always_load:
  - 03_plan.md (작업 상세)
  - 04_guideline.md (가이드라인)

conditional_load:
  - 02_design.md (복잡한 작업 시)
  - 01_requirements.md (검증 단계에서 필수)
```

**5-Field 파싱**:
```typescript
interface Task {
  id: string;           // 작업 ID (예: "2.3")
  title: string;        // 작업 제목
  파일: string;         // 생성/수정할 파일 경로
  내용: string;         // 구현할 내용
  방법: string;         // 구현 방법 가이드
  완료: string;         // 완료 기준
  requirements: string; // 관련 요구사항 ID
}
```

#### Step 2: 구현 (Implementation)
**참조**: `knowledge/execution-workflow.md`

**단일 파일 구현**:
```markdown
1. "파일" 경로 확인
2. "방법" 지침에 따라 코드 작성
3. "내용" 요구사항 반영
4. 즉시 Level 1 검증
```

**다중 파일 구현**:
```markdown
작업에 여러 파일 지정된 경우:
1. 파일 순서대로 구현 (위 → 아래)
2. 각 파일 완성 후 즉시 검증
3. 에러 발생 시 다음 파일로 진행하지 않음
4. 모든 파일 완성 후 통합 검증
```

#### Step 3: 3-레벨 검증
**참조**: `knowledge/verification-levels.md`, `tools/verify.sh`

**Level 1: 코드 검증 (자동, 필수)**
```bash
# Lint 검사
yarn lint  # 또는 프로젝트별 lint 명령

# Type 검사
yarn typecheck  # TypeScript 타입 검증

# 빌드 검사 (critical 변경 시만)
yarn build  # 인프라 수정 시
```

**Level 2: 기능 검증 (자동 우선, 수동 fallback)**
```markdown
자동 검증 시도 (우선):
- Utility/Helper: 임시 테스트 파일로 실행
- API: curl 또는 HTTP 요청으로 테스트
- 컴포넌트: 기존 테스트 실행 (yarn test)

수동 검증 (자동 불가 시):
- UI 컴포넌트 시각 검증
- 사용자에게 테스트 체크리스트 제공
- "pass" 응답 대기
```

**Level 3: 요구사항 검증 (필수)**
```markdown
1. 01_requirements.md 로드
2. 작업의 "Requirements" 필드에서 ID 추출 (예: REQ-1.2)
3. EARS 형식 요구사항 확인:
   - WHEN 조건 테스트
   - THEN 결과 검증
4. 모든 acceptance criteria 충족 확인
```

#### Step 4: 에러 복구
**참조**: `knowledge/error-recovery-tot.md`, `tools/error_analyzer.sh`

**ToT 기반 복구 프로세스**:

**Step A: 에러 분류**
```typescript
enum ErrorType {
  Syntax,      // 문법, import 에러
  Logic,       // 로직, 설계 에러
  Dependency,  // 의존성 누락
  Test,        // 테스트 실패
}
```

**Step B: 복구 옵션 생성**
```markdown
예시: Import 에러 "Cannot find module '@/components/Button'"

Option A: Fix import path (찾기)
Option B: Create missing module (생성)
Option C: Use alternative (대체)
Option D: Refactor to inline (인라인)

→ 각 옵션 점수화 (난이도, 시간, 성공률, 리스크)
```

**Step C: 최적 옵션 시도 + Backtrack**
```markdown
1. Try Option A (최고 점수)
   → 성공: 완료
   → 실패: Backtrack to Option B

2. Try Option B (차선)
   → 성공: 완료 (FIXME 주석 추가)
   → 실패: Backtrack to Option C

3. Try Option C (최후)
   → 성공: 완료
   → 실패: 사용자에게 보고
```

**자율 실행 규칙**:
```yaml
autonomous_fixes:
  - Lint 에러 → 자동 수정
  - Import 에러 → 경로 자동 탐색
  - Type 에러 → 타입 추론 및 수정
  - Missing deps → 자동 설치

user_intervention_required:
  - 요구사항 모호함 → 명확화 요청
  - Critical 보안 이슈 → 사용자 확인
  - UI 컴포넌트 검증 → 수동 테스트
  - Phase 완료 → 계속 여부 확인

deferred_issues:
  - 최적화 기회 → // FIXME: 주석
  - 디자인 의사결정 → // REVIEW: 주석
  - Non-critical 경고 → // WARNING: 주석
```

### 출력

#### 실행 결과 리포트
```markdown
✅ 작업 {id} 완료: {title}

📁 변경된 파일:
- {file1}
- {file2}

✓ 검증 결과:
- Level 1: Lint ✓ | TypeCheck ✓
- Level 2: {검증 방법} ✓
- Level 3: {요구사항 ID} 충족 ✓

📋 자동 수정 사항:
- 🔧 {에러 유형}: {해결 방법}

⚠️ 검토 필요 사항:
- // FIXME: {이슈}
- // REVIEW: {개선 제안}
```

#### 실패 시 리포트
```markdown
❌ 작업 {id} 실패: {title}

🚨 에러:
- {에러 메시지}
- {파일}:{라인}

🔄 시도한 복구 옵션:
1. Option A: {방법} → 실패
2. Option B: {방법} → 실패

💡 권장 조치:
- {사용자 액션}

⏸️ 작업 일시 중지
```

## Knowledge 파일 역할

### execution-workflow.md
- 5-Field 작업 구현 절차
- 파일 생성/수정 패턴
- 단일 vs 다중 파일 전략
- 가이드라인 Fallback 계층

### verification-levels.md
- Level 1: 코드 검증 (lint, type, build)
- Level 2: 기능 검증 (자동 vs 수동)
- Level 3: 요구사항 검증 (EARS)
- 검증 실패 처리 프로토콜

### error-recovery-tot.md
- 에러 타입 분류 (Syntax, Logic, Dependency, Test)
- Multi-Path 복구 전략
- 복구 옵션 점수화 기준
- Backtrack 알고리즘
- 자율 vs 사용자 개입 기준

## Tools 파일 역할

### verify.sh
3-레벨 검증 자동 실행:
```bash
#!/bin/bash
# 사용법: verify.sh <level> <file|task>

# Level 1: yarn lint && yarn typecheck
# Level 2: yarn test <file>
# Level 3: grep REQ-X.Y 01_requirements.md
```

### error_analyzer.sh
에러 분류 및 복구 제안:
```bash
#!/bin/bash
# 사용법: error_analyzer.sh <error_log>

# 에러 타입 감지
# 복구 옵션 생성
# 점수 계산 및 순위
```

## 제약 조건

- 모든 작업은 검증 통과 후에만 완료로 표시
- 에러 발생 시 무조건 복구 시도 (최대 3회)
- 사용자 개입은 최소화 (자동 해결 우선)
- 모든 자동 수정은 주석으로 문서화
- 검증 실패 시 체크박스 업데이트 금지

## 사용 시나리오

### 시나리오 1: 단일 파일 작업 실행
```
입력:
- 작업 2.3: Storybook 스토리 작성
- 파일: packages/app/src/stories/Button.stories.tsx

실행:
1. Button.stories.tsx 생성
2. Level 1: yarn lint ✓
3. Level 2: yarn storybook (자동 확인) ✓
4. Level 3: REQ-1.2 검증 ✓

출력:
✅ 작업 2.3 완료
```

### 시나리오 2: 다중 파일 + 에러 복구
```
입력:
- 작업 3.5: Apollo Client 설정
- 파일:
  - packages/app/src/lib/apollo.ts
  - packages/app/src/App.tsx
  - packages/app/src/main.tsx

실행:
1. apollo.ts 생성 → lint ✓
2. App.tsx 수정 → lint ❌ (import 에러)
   → ToT 복구: Option A (경로 수정) → ✓
3. main.tsx 수정 → lint ✓
4. 통합 검증: ✓

출력:
✅ 작업 3.5 완료
📋 자동 수정: import 경로 수정
```

### 시나리오 3: UI 컴포넌트 (수동 검증)
```
입력:
- 작업 2.2: Button 컴포넌트 구현

실행:
1. Button.tsx 생성
2. Level 1: ✓
3. Level 2: 자동 테스트 없음 → 수동 검증 요청

🛑 사용자 개입:
"Button 컴포넌트 테스트:
 - Storybook 열림 (http://localhost:6006)
 - 클릭 시 정상 동작 확인

 Reply: 'pass' to continue"

사용자: "pass"

4. Level 3: ✓

출력:
✅ 작업 2.2 완료
```

## 통합 워크플로우

이 스킬은 다음 스킬들과 연계됩니다:

1. **입력 단계**:
   - `task-and-progress` → 작업 선택 및 상세 제공

2. **출력 단계**:
   - `git-workflow-automation` → 커밋 및 보고

---

## 에러 처리

```yaml
error_handling:
  severity_high:
    conditions:
      - 실행 계획 파일 없음 (task list 누락)
      - 필수 도구 미설치 (git, node, yarn)
      - 파일 시스템 권한 부족
      - 순환 의존성 감지 (task 간)
      - 타임아웃 (전체 실행 시간 초과)
    action: |
      ❌ 치명적 오류 - 실행 중단
      → 실행 계획 확인: ls .tasks/execution_plan.json
      → 필수 도구 설치 확인: git --version && node --version && yarn --version
      → 권한 확인: ls -la {target_directory}
      → 의존성 그래프 검증: 순환 참조 제거
      → 타임아웃 조정: execution_timeout 설정 증가
      → 재실행: task-and-progress → execution-engine
    examples:
      - condition: "실행 계획 없음"
        message: "❌ 오류: .tasks/execution_plan.json을 찾을 수 없습니다"
        recovery: "task-and-progress 먼저 실행하여 계획 생성"
      - condition: "권한 부족"
        message: "❌ 오류: src/ 디렉토리에 쓰기 권한이 없습니다"
        recovery: "권한 부여: chmod +w src/ 또는 sudo로 실행"

  severity_medium:
    conditions:
      - 일부 task 실행 실패 (비치명적)
      - 자동 복구 시도 실패
      - 테스트 실패 (일부)
      - 빌드 경고 (에러 아님)
      - Rollback 필요
    action: |
      ⚠️  경고 - 부분 실행 완료 또는 rollback
      1. 실패한 task 기록
      2. 자동 복구 3회 시도
      3. 복구 실패 시 rollback 옵션 제공
      4. 테스트 실패: 계속 진행 또는 중단 선택
      5. 실행 보고서에 경고 추가:
         > ⚠️  WARNING: 일부 작업 실패
         > → 실패한 작업: {failed_tasks}
         > → Rollback 가능: git reset --hard {checkpoint}
    fallback_values:
      retry_count: 3
      rollback_available: true
      continue_on_test_failure: false
    examples:
      - condition: "task 실행 실패"
        message: "⚠️  경고: Task 3/10 실패 - TypeScript 컴파일 에러"
        fallback: "자동 복구 시도 (3회) → 실패 시 rollback 제안"
      - condition: "테스트 실패"
        message: "⚠️  경고: 5개 테스트 실패 (총 50개 중)"
        fallback: "계속 진행 (y) 또는 중단 (N)? → 사용자 선택"

  severity_low:
    conditions:
      - Lint 경고 (에러 아님)
      - 선택적 task 스킵
      - 성능 최적화 가능
      - 로그 레벨 조정 필요
    action: |
      ℹ️  정보: 경미한 문제 - 실행 계속
      → Lint 경고: 로그에 기록 (차단하지 않음)
      → 선택적 task: 스킵 가능
      → 성능: 제안 제공 (병렬 실행 등)
      → 로그: 자동 조정
    examples:
      - condition: "Lint 경고"
        auto_handling: "경고 로그 기록 → 실행 계속 (차단하지 않음)"
      - condition: "선택적 task 스킵"
        auto_handling: "Storybook 빌드 스킵 (선택적) → 핵심 작업 진행"
```

---

> **Best Practice**: 자동 복구 실패 시에만 사용자에게 문의
> **Integration**: task-and-progress에서 입력, git-workflow-automation으로 전달
