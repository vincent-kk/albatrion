# 작업 실행 워크플로우

## 개요

03_plan.md의 5-Field 작업을 실제 코드로 구현하는 절차를 정의합니다.

## 5-Field 구조

```markdown
### {작업 ID} {작업 제목}
- **파일**: {파일 경로}
- **내용**: {구현할 내용}
- **방법**: {구현 방법 가이드}
- **완료**: {완료 기준 및 검증 방법}
- **Requirements**: {요구사항 ID}
```

## 실행 절차

### 1. 문서 로딩 (Smart Loading)

**항상 로드**:
```bash
# 작업 상세
cat .tasks/*/03_plan.md | grep -A 10 "작업 {id}:"

# 프로젝트 가이드라인
cat .tasks/*/04_guideline.md
```

**조건부 로드**:
```yaml
complex_task_indicators:
  - 다중 파일 수정
  - "복잡한", "통합" 키워드
  - API, 상태 관리 관련

→ 02_design.md 로드 (아키텍처 컨텍스트)
```

**검증 단계 로드**:
```bash
# Level 3 검증 시 필수
cat .tasks/*/01_requirements.md | grep -A 10 "REQ-{id}"
```

### 2. 가이드라인 Fallback 전략

**계층적 가이드라인 탐색**:
```
1순위: task의 "방법" 필드
       └─ 충분히 상세? → 사용
       └─ 모호함? → 2순위

2순위: 04_guideline.md
       └─ 파일 존재? → 관련 섹션 검색
       └─ 없음? → 3순위

3순위: 프로젝트 CLAUDE.md (루트)
       └─ 파일 존재? → 일반 가이드 참조
       └─ 없음? → 4순위

4순위: .cursor/rules/ (IDE 규칙)
       └─ 관련 규칙 파일 검색
       └─ 없음? → 5순위

5순위: Best Practices (내장 지식)
       └─ 언어/프레임워크 표준 패턴
```

**예시**:
```typescript
// 작업: 2.1 Button 컴포넌트 구현
// 방법: "Ant Design Mobile Button 래핑, Jotai atom으로 관리"

→ 충분히 구체적: Ant Design Mobile, Jotai 사용 명확
→ 1순위 가이드 적용:
   - yarn workspace app add antd-mobile
   - import { Button } from 'antd-mobile'
   - useAtom(buttonStateAtom) 패턴
```

### 3. 파일 생성/수정

**단일 파일**:
```markdown
1. "파일" 경로 확인 및 생성
2. "내용" + "방법" 기반 코드 작성
3. 즉시 검증 (Level 1)
4. 에러 시 즉시 수정
```

**다중 파일 (순차 처리)**:
```markdown
파일 목록:
  - packages/app/src/lib/config.ts
  - packages/app/src/App.tsx
  - packages/app/src/main.tsx

처리:
  File 1: config.ts
    → 생성
    → Lint 체크
    → 에러 시 수정
    → ✓ 다음 파일

  File 2: App.tsx
    → 수정
    → Lint 체크
    → 에러 시 수정
    → ✓ 다음 파일

  File 3: main.tsx
    → 수정
    → Lint 체크
    → 에러 시 수정
    → ✓ 통합 검증

  통합 검증:
    → 전체 파일 Lint
    → Import 관계 검증
    → 에러 시 특정 파일 재수정
```

### 4. 점진적 검증

**파일별 즉시 검증**:
```bash
# 각 파일 완성 후 즉시
yarn lint --file {생성된_파일}

# 에러 발생 → 다음 파일로 진행하지 않음
# 에러 수정 → 재검증 → 다음 파일
```

**통합 검증 (모든 파일 완성 후)**:
```bash
# 전체 파일 검증
yarn lint

# Import/Export 관계 체크
# 타입 통합 검증
```

## 가이드라인 탐색 알고리즘

```typescript
function findGuideline(task: Task): Guideline {
  // 1순위: 작업의 "방법" 필드
  if (task.방법.length > 20 && hasSpecificInstructions(task.방법)) {
    return { source: 'task', content: task.방법 };
  }

  // 2순위: 04_guideline.md
  const guidelineFile = findFile('.tasks/*/04_guideline.md');
  if (guidelineFile) {
    const section = searchGuideline(guidelineFile, task.기술스택);
    if (section) {
      return { source: 'guideline', content: section };
    }
  }

  // 3순위: 프로젝트 CLAUDE.md
  const projectClaude = findFile('CLAUDE.md');
  if (projectClaude) {
    const generalGuidance = extractRelevantSections(projectClaude, task);
    if (generalGuidance) {
      return { source: 'project', content: generalGuidance };
    }
  }

  // 4순위: .cursor/rules/
  const rules = findFiles('.cursor/rules/*.md');
  for (const rule of rules) {
    if (isRelevant(rule, task)) {
      return { source: 'rules', content: readFile(rule) };
    }
  }

  // 5순위: Best Practices
  return {
    source: 'builtin',
    content: getBestPractice(task.언어, task.프레임워크)
  };
}
```

## 에러 처리 전략

### 파일 생성 에러
```markdown
에러: "Directory not found"
복구:
  1. 부모 디렉토리 확인: ls {parent_dir}
  2. 없으면 생성: mkdir -p {parent_dir}
  3. 파일 재생성
```

### Import 에러
```markdown
에러: "Cannot find module '@/components/Button'"
복구 (ToT):
  Option A: fileSearch로 Button 컴포넌트 찾기 → 경로 수정
  Option B: 대체 컴포넌트 사용
  Option C: Button 컴포넌트 생성 (요구사항 확인 필요)
```

### Type 에러
```markdown
에러: "Type 'string' is not assignable to 'number'"
복구:
  1. 타입 정의 확인 (02_design.md 또는 기존 파일)
  2. 올바른 타입 적용
  3. 타입 변환 필요 시 명시적 캐스팅
```

---

> **참고**: 이 워크플로우는 `verify.sh`와 `error_analyzer.sh`에 의해 자동화됩니다.
