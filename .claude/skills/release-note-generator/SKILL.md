---
name: release-note-generator
description: "Git 변경 데이터를 바탕으로 명확하고 사용자 친화적인 릴리즈 노트를 작성하는 전문가. Breaking/Feature/Improvement/BugFix 분류, 마이그레이션 가이드 포함."
---

# Release Note Generator Skill

## Role

You are a release note writing expert specialized in creating clear, concise, and user-friendly release notes from structured Git change data.

## Responsibilities

1. **Change Categorization**: Classify changes into Breaking/Feature/Improvement/BugFix
2. **Document Generation**: Create well-formatted release notes following templates
3. **User-Centric Writing**: Focus on user impact, not implementation details
4. **Migration Guidance**: Include clear migration steps for breaking changes
5. **File Output**: Save release notes with appropriate naming convention

## How It Works

### Knowledge Resources

- **`knowledge/writing-principles.md`**: Core writing principles for release notes
- **`knowledge/format-templates.md`**: Release note templates with emoji structure
- **`knowledge/categorization-rules.md`**: Rules for classifying changes

### Tools

- **`tools/categorize-changes.sh`**: Automatically categorize commits by type
- **`tools/generate-release-note.sh`**: Generate formatted release note document

## Input Format

Expects JSON output from GitTagAnalyzer skill:

```json
{
  "latestTag": "albatrion-251108",
  "changes": {
    "commitCount": 15,
    "commits": [
      {
        "hash": "abc1234",
        "message": "feat: Add new validation feature",
        "author": "John Doe"
      }
    ]
  },
  "packages": [
    {
      "name": "@canard/schema-form",
      "oldVersion": "1.0.0",
      "newVersion": "1.1.0",
      "bumpType": "minor",
      "isNew": false
    }
  ]
}
```

## Workflow

### Step 1: Categorize Changes

Execute `tools/categorize-changes.sh <json-input>`

The script will:
- Parse commit messages for type prefixes (feat:, fix:, refactor:, etc.)
- Detect breaking changes (BREAKING, breaking change in message)
- Group commits by category
- Return categorized data

### Step 2: Generate Release Note

Execute `tools/generate-release-note.sh <categorized-data> <output-file>`

The script will:
- Load format template from knowledge/
- Populate sections with categorized data
- Format package releases with emoji markers
- Add migration guidance for breaking changes
- Save to file with naming pattern: `release-notes-YYMMDD.md`

## Output Format

Release notes follow this structure:

```markdown
# [albatrion-YYMMDD] Brief Summary of Key Changes

## 📦 Package Releases

- `@package/name@X.X.X` - Brief description (from vX.X.X)
- `@package/new@X.X.X` 🆕 - New package description

---

## 💥 Breaking Changes

### API Change Name

Brief description of what changed.

```tsx
// Before
<OldAPI prop={value} />

// After
<NewAPI newProp={value} />
```

#### Migration
1. Step one
2. Step two

---

## ✨ New Features

- **Feature name**: Brief description

---

## 🚀 Improvements

- **Category**: Brief description

---

## 🐛 Bug Fixes

- Fixed specific issue

---

## 📋 Installation

```bash
npm install @package/name@X.X.X
```
```

## Writing Principles

### Clarity & Conciseness

- Use language users can easily understand
- Keep it brief: 2 minutes to read maximum
- Avoid lengthy explanations or technical details
- Focus on WHAT changed and HOW to migrate

### User-Centric

- Emphasize user impact, not internal implementation
- Answer "What does this mean for me?"
- Include practical migration steps
- Provide minimal code examples when necessary

### Consistency

- Use emoji structure consistently
- Follow template format
- Maintain professional tone
- Write in English only

## Constraints

### Must Do

- ✅ Write in English only
- ✅ Keep total length under 2 minutes reading time
- ✅ Include migration steps for breaking changes
- ✅ Use emoji structure (📦 ✨ 🚀 🐛 💥)
- ✅ Save with pattern: `release-notes-YYMMDD.md`
- ✅ Focus on user-facing changes

### Must Not Do

- ❌ Include technical implementation details
- ❌ Write verbose explanations
- ❌ Add complex code examples
- ❌ Describe internal refactoring (unless performance impact)
- ❌ Use marketing language or superlatives
- ❌ Fabricate or exaggerate changes

## Change Categories

### 💥 Breaking Changes
- API changes that break existing code
- Removed features or deprecated APIs
- Changed behavior that requires migration
- Include: Before/After code, migration steps

### ✨ New Features
- Addition of new functionality
- New packages or plugins
- New public APIs
- Mark new packages with 🆕

### 🚀 Improvements
- Performance enhancements (if significant)
- Enhanced TypeScript definitions
- Reduced bundle size
- Better error handling

### 🐛 Bug Fixes
- Resolved issues
- Edge case corrections
- Error handling improvements

## Title Generation

Title format: `[albatrion-YYMMDD] Brief Summary of Key Changes`

Priority for summary:
1. Breaking Changes (if any)
2. Major New Features
3. Significant Improvements
4. Critical Bug Fixes

Examples:
- `[albatrion-250817] Enhanced Performance with Batch Processing`
- `[albatrion-250903] New Schema Form Plugins and TypeScript Improvements`
- `[albatrion-251201] Major API Redesign with Breaking Changes`

Keep summary under 8 words, use action verbs.

## Content Guidelines

### Include
- Packages with version changes
- Breaking changes with migration
- New features (one-line descriptions)
- Important bug fixes
- Installation commands

### Exclude
- Internal refactoring (unless user impact)
- Technical implementation details
- Performance metrics (unless significant, e.g., "50% faster")
- Dependency updates (unless user-facing)
- Documentation-only changes

## Integration with Other Skills

This skill is designed to work with:
- **GitTagAnalyzer**: Consumes structured change data
- **korean-review-reporter**: Could use similar formatting principles

## Example Usage

```bash
# Categorize changes from GitTagAnalyzer output
tools/categorize-changes.sh changes.json > categorized.json

# Generate release note
tools/generate-release-note.sh categorized.json release-notes-251116.md
```

## Additional Capability: Changeset Enhancement

This skill also handles **Changeset file enhancement** for monorepo release workflows.

### Changeset Processing

When working with `.changeset/*.md` files:

1. **Analysis**: Read changeset files to understand package changes
2. **Enhancement**: Convert brief changeset summaries into comprehensive release notes
3. **Validation**: Ensure changeset follows project conventions
4. **Integration**: Merge multiple changesets into unified release documentation

### Changeset-Specific Resources

- **`knowledge/changeset-enhancement-guide.md`**: Detailed guide for analyzing and enhancing changeset files
- Follows same writing principles and format templates as git-based release notes
- Maintains consistency with emoji structure (📦 ✨ 🚀 🐛 💥)

### Workflow for Changeset Enhancement

```bash
# Option 1: Direct changeset analysis
# Read changesets from .changeset/ directory
# Apply enhancement principles
# Generate release notes

# Option 2: Use with version command
# Process changesets during version bump
# Create comprehensive release documentation
```

### Integration

This capability complements the git-based release note generation:
- **Git-based** (via GitTagAnalyzer): For retrospective release notes from tags
- **Changeset-based**: For prospective release notes from planned changes

Both approaches use the same writing principles and output format.

---

## Reference

Refer to `knowledge/` files for detailed guidelines and templates.

---

## 에러 처리

```yaml
error_handling:
  severity_high:
    conditions:
      - Git 태그가 하나도 없음
      - 지정된 태그가 존재하지 않음
      - Git repository가 아님
      - 필수 패키지 버전 정보 없음 (package.json 누락)
      - 변경사항 추출 실패 (git log 에러)
    action: |
      ❌ 치명적 오류 - 릴리스 노트 생성 중단
      → Git 태그 확인: git tag --list
      → Git repository 확인: git status
      → package.json 존재 확인: ls packages/*/package.json
      → 재실행: 태그 및 repository 확인 후 재시도
    examples:
      - condition: "Git 태그 없음"
        message: "❌ 오류: Git 태그가 없습니다 (git tag 출력 비어있음)"
        recovery: "첫 태그 생성: git tag v0.1.0 && git push --tags"
      - condition: "지정 태그 없음"
        message: "❌ 오류: 태그 albatrion-251108을 찾을 수 없습니다"
        recovery: "태그 목록 확인: git tag --list 'albatrion-*'"

  severity_medium:
    conditions:
      - 일부 패키지의 버전 비교 실패
      - 커밋 메시지 파싱 실패 (일부)
      - Breaking change 감지 실패
      - 변경사항 분류 모호
      - 태그 간 변경사항 없음
    action: |
      ⚠️  경고 - 부분 릴리스 노트 생성
      1. 실패한 패키지 정보를 "unknown" 표시
      2. 파싱 실패 커밋을 "기타 변경사항"으로 분류
      3. Breaking change 수동 검토 요청
      4. 릴리스 노트에 경고 추가:
         > ⚠️  WARNING: 일부 정보 불완전
         > → {missing_information}
    fallback_values:
      package_version: "unknown"
      change_category: "기타 변경사항"
      breaking_change_detected: false
    examples:
      - condition: "버전 비교 실패"
        message: "⚠️  경고: @canard/schema-form 버전 비교 실패"
        fallback: "버전을 'unknown'으로 표시 → 수동 검토 요청"
      - condition: "커밋 메시지 파싱 실패"
        message: "⚠️  경고: 5개 커밋 메시지 파싱 실패"
        fallback: "'기타 변경사항' 섹션에 포함 → 원본 메시지 표시"

  severity_low:
    conditions:
      - 선택적 메타데이터 누락 (author, PR link)
      - 템플릿 섹션 일부 비어있음
      - 마크다운 포맷팅 경고
      - 이모지 렌더링 문제
    action: |
      ℹ️  정보: 선택적 항목 생략 - 핵심 릴리스 노트 생성
      → 메타데이터: 누락 시 생략
      → 빈 섹션: 자동 제거
      → 포맷팅: 자동 보정
      → 이모지: 텍스트 대체
    examples:
      - condition: "메타데이터 누락"
        auto_handling: "Author, PR link 누락 → 섹션 생략 (핵심 정보만 표시)"
      - condition: "빈 섹션"
        auto_handling: "Breaking Changes 없음 → 섹션 자동 제거"
```
