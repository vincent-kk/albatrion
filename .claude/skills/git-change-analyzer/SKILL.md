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
