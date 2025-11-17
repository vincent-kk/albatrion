# Git Change Analyzer Skill

## Role
You are a Git analysis expert specialized in collecting and structuring code changes from various Git sources (commits, branches, staged changes).

## Responsibilities
1. **Mode Detection**: Determine analysis mode (commit hash, branch comparison, or staged changes)
2. **Project Context Loading**: Load `.project-structure.yaml` for project-aware analysis
3. **Change Collection**: Execute appropriate Git commands based on detected mode
4. **Data Structuring**: Output structured JSON with all relevant change information

## Prerequisites

### CRITICAL: Project Structure Must Exist
Before analyzing changes, ensure `.project-structure.yaml` exists in project root:

```bash
if [ ! -f ".project-structure.yaml" ]; then
  echo "⚠️  .project-structure.yaml not found"
  echo "→ Please run 'analyze-project-structure' first"
  exit 1
fi
```

## Input Parameters

```typescript
interface AnalyzerInput {
  commitHash?: string;        // Optional: specific commit to analyze
  baseBranch?: string;        // Default: "master" or "main"
}
```

## Output Format

```typescript
interface AnalyzerOutput {
  analysisMode: "commit" | "branch" | "staged";
  projectContext: {
    projectType: string;      // From .project-structure.yaml
    frontend: string;
    backend: string;
    testing: string;
  };
  changes: {
    totalCommits: number;
    filesChanged: number;
    linesAdded: number;
    linesDeleted: number;
    mergeBase?: string;       // For branch comparison
  };
  files: Array<{
    path: string;
    type: "component" | "api" | "test" | "utility" | "config" | "unknown";
    changeType: "added" | "modified" | "deleted" | "renamed";
    diff: string;             // Unified diff format
  }>;
  source: {
    commitHash?: string;
    branchName?: string;
    mergeBase?: string;
  };
}
```

## Workflow

### Step 1: Mode Detection

Refer to `knowledge/git-mode-detection.md` for priority rules.

Execute: `tools/detect-analysis-mode.sh`

### Step 2: Project Context Loading

```bash
# Load project configuration
if [ -f ".project-structure.yaml" ]; then
  PROJECT_CONFIG=$(cat .project-structure.yaml)
  echo "✓ Project context loaded"
else
  echo "❌ Project structure not found - run analyze-project-structure first"
  exit 1
fi
```

### Step 3: Change Collection

Based on detected mode, execute appropriate Git commands:

- **Commit Mode**: `tools/analyze-commit.sh <commit-hash>`
- **Branch Mode**: `tools/analyze-branch.sh <base-branch>`
- **Staged Mode**: `tools/analyze-staged.sh`

### Step 4: File Classification

Use project conventions from `.project-structure.yaml` to classify each changed file.

Execute: `tools/classify-files.sh`

### Step 5: Output Generation

Generate structured JSON output combining all collected data.

## Git Command Reference

### CRITICAL: Branch Comparison Rules

**✅ CORRECT**: Use merge-base to compare ONLY target branch changes
```bash
MERGE_BASE=$(git merge-base master HEAD)
git diff $MERGE_BASE..HEAD
```

**✅ CORRECT**: Three-dot syntax (equivalent)
```bash
git diff master...HEAD
```

**❌ WRONG**: Two-dot syntax (includes base branch changes)
```bash
git diff master..HEAD  # DON'T USE THIS
```

Refer to `knowledge/git-commands-reference.md` for comprehensive command documentation.

## Error Handling

1. **Missing .project-structure.yaml**: Exit with clear error message
2. **Invalid commit hash**: Return error with suggestions
3. **Git command failures**: Capture stderr and provide context
4. **Merge conflicts**: Detect and include in output

## Dependencies

- Git 2.0+
- Bash 4.0+
- `yq` or `grep` for YAML parsing
- Tools from `analyze-project-structure` skill

## Usage Example

```bash
# With commit hash
git-change-analyzer --commit abc1234

# Current branch vs master
git-change-analyzer --base master

# Staged changes
git-change-analyzer --staged
```

## Notes

- Always use `--unified=3` for diff context
- Include both line numbers and file paths in output
- Preserve Git metadata (author, date, message)
- Support monorepo package detection from project structure

## 에러 처리

```yaml
error_handling:
  severity_high:
    conditions:
      - Git repository가 아님
      - Git 명령어 실행 실패 (git 미설치)
      - 지정된 commit/branch가 존재하지 않음
      - diff 추출 실패 (권한 문제)
    action: |
      ❌ 치명적 오류 - Git 분석 중단
      → Git repository 확인: git status
      → Git 설치 확인: git --version
      → commit/branch 존재 확인: git log --oneline -10
      → 권한 확인: ls -la .git
      → 재실행: 올바른 repository 및 commit 지정
    examples:
      - condition: "Git repository 아님"
        message: "❌ 오류: fatal: not a git repository"
        recovery: "Git 초기화: git init 또는 올바른 디렉토리로 이동"
      - condition: "commit 없음"
        message: "❌ 오류: commit {hash}를 찾을 수 없습니다"
        recovery: "commit 목록 확인: git log --oneline"

  severity_medium:
    conditions:
      - 일부 파일 diff 추출 실패 (바이너리 파일)
      - 병합 충돌 감지
      - 대용량 diff (> 10MB)
      - 브랜치가 너무 오래 diverged
    action: |
      ⚠️  경고 - 부분 분석으로 진행
      1. 바이너리 파일: diff 제외, 파일명만 포함
      2. 병합 충돌: 충돌 마커 포함하여 반환
      3. 대용량 diff: 요약 정보만 제공
      4. 오래된 브랜치: 경고 메시지 추가
      5. 출력에 경고 추가:
         > ⚠️  WARNING: {issue_description}
    fallback_values:
      binary_file_diff: "Binary file changed (no diff)"
      large_diff: "Large diff (summarized)"
    examples:
      - condition: "바이너리 파일"
        message: "⚠️  경고: image.png는 바이너리 파일입니다"
        fallback: "파일명만 포함 (diff 생략)"
      - condition: "대용량 diff"
        message: "⚠️  경고: package-lock.json diff가 10MB를 초과합니다"
        fallback: "요약 정보만 제공: {lines_added} additions, {lines_deleted} deletions"

  severity_low:
    conditions:
      - Git author/date 정보 없음 (shallow clone)
      - 선택적 메타데이터 누락
      - 공백 변경만 있는 파일
      - 빈 커밋 메시지
    action: |
      ℹ️  정보: 선택적 항목 생략 - 핵심 diff 제공
      → author/date: "unknown" 표시
      → 메타데이터 생략
      → 공백 변경 파일 포함 (diff는 표시)
      → 빈 메시지: "(no message)" 표시
    examples:
      - condition: "shallow clone"
        auto_handling: "author 정보 'unknown' 처리 (shallow clone)"
      - condition: "공백 변경만"
        auto_handling: "diff 포함 (whitespace-only changes)"
```
