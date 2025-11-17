# Create Release Note Command

This command generates comprehensive release notes by analyzing git changes since the latest tag.

## Skills Used

This command utilizes two specialized skills:

1. **GitTagAnalyzer** (`.claude/skills/git-tag-analyzer/`)
   - Finds and validates the latest git tag
   - Collects commits and changes since the tag
   - Detects package version changes in monorepo
   - Verifies actual package names from package.json

2. **ReleaseNoteGenerator** (`.claude/skills/release-note-generator/`)
   - Categorizes changes (Breaking/Feature/Improvement/BugFix)
   - Generates user-friendly release notes with emoji structure
   - Creates migration guidance for breaking changes
   - Outputs formatted markdown file
   - **Also supports**: Changeset enhancement for prospective release notes (see `/changeset` command)

## 🔍 Pre-Execution Checks

Before generating release notes, the following validations are performed automatically:

### 1. Git Repository Validation
**Check**: Are we in a valid git repository?
```bash
# Repository check
git rev-parse --is-inside-work-tree
```

**Auto-fix suggestions**:
- ❌ **Not a git repository** → Initialize: `git init` or navigate to correct directory
- ❌ **Not in work tree** → Navigate to repository root
- ✅ **Valid repository** → Proceed to next check

### 2. Tag Existence Check
**Check**: Do tags matching pattern `albatrion-*` exist?
```bash
# Tag search
git tag -l "albatrion-*" | head -1

# Alternative: check any tag exists
git describe --tags --abbrev=0 2>/dev/null
```

**Auto-fix suggestions**:
- ❌ **No tags found** → Create initial tag: `git tag albatrion-$(date +%y%m%d)`
- ❌ **Wrong tag pattern** → Verify tag naming convention (should be `albatrion-YYMMDD`)
- ✅ **Tags exist** → Proceed to next check

### 3. Changes Validation
**Check**: Are there commits since the latest tag?
```bash
# Commits check
LATEST_TAG=$(git describe --tags --abbrev=0 --match "albatrion-*")
git log $LATEST_TAG..HEAD --oneline

# Files check
git diff $LATEST_TAG..HEAD --name-only
```

**Auto-fix suggestions**:
- ⚠️ **No commits since tag** → Document "no changes" (still generate note)
- ⚠️ **No file changes** → Document "no file changes" (metadata updates only)
- ✅ **Changes exist** → Proceed to release note generation

### 4. Script Availability
**Check**: Are required analysis scripts executable?
```bash
# Script checks
.claude/skills/git-tag-analyzer/tools/find-latest-tag.sh
.claude/skills/git-tag-analyzer/tools/collect-changes.sh
.claude/skills/git-tag-analyzer/tools/compare-package-versions.sh
```

**Auto-fix suggestions**:
- ❌ **Scripts missing** → Verify skills directory structure
- ❌ **Not executable** → Fix permissions: `chmod +x <script>`
- ✅ **Scripts ready** → Proceed to release note generation

---

## Execution Flow

### Phase 1: Git Analysis (GitTagAnalyzer)

1. **Find Latest Tag**
   - Execute `git-tag-analyzer/tools/find-latest-tag.sh albatrion-*`
   - Validate tag existence with multiple methods
   - Handle errors if tag not found

2. **Collect Changes**
   - Execute `git-tag-analyzer/tools/collect-changes.sh <tag>`
   - Get commits between tag and HEAD
   - Analyze changed files

3. **Detect Package Changes**
   - Execute `git-tag-analyzer/tools/compare-package-versions.sh <tag>`
   - Compare package.json versions (tag vs HEAD)
   - Identify version bump types (major/minor/patch)
   - Detect new packages

### Phase 2: Document Generation (ReleaseNoteGenerator)

4. **Categorize Changes**
   - Execute `release-note-generator/tools/categorize-changes.sh <git-data>`
   - Parse commit messages for type prefixes
   - Detect breaking changes
   - Group by category

5. **Generate Release Note**
   - Execute `release-note-generator/tools/generate-release-note.sh <categorized-data>`
   - Apply format templates
   - Create sections with emoji structure
   - Save to `release-notes-YYMMDD.md`

## Output Format

The generated release note follows this structure:

```markdown
# [albatrion-YYMMDD] Brief Summary

## 📦 Package Releases
- Package list with versions

## 💥 Breaking Changes
- Breaking changes with migration

## ✨ New Features
- New functionality

## 🚀 Improvements
- Enhancements

## 🐛 Bug Fixes
- Bug corrections

## 📋 Installation
- Installation commands
```

## Key Features

✅ **Validation-First Approach**
- Multiple tag validation methods
- Cross-verification of git operations
- Error recovery strategies

✅ **Monorepo-Aware**
- Detects all changed packages
- Verifies actual package names from package.json
- Handles nested package structures

✅ **User-Centric Writing**
- Focus on user impact, not implementation
- Clear migration guidance
- Concise and scannable format

✅ **Quality Assurance**
- Follows writing principles
- Consistent emoji structure
- English-only output

## Error Handling

If tag is not found:
- Attempts multiple search methods
- Provides troubleshooting steps
- Clear error messages

If no changes since tag:
- Documents this fact
- Doesn't fabricate information

## Important Notes

- **Always write in English only**
- **Verify package names** from package.json (never assume from directory names)
- **Keep it concise**: Maximum 2-3 minutes reading time
- **File output**: `release-notes-YYMMDD.md` where YYMMDD is from tag date

## Related Commands

- **`/changeset`**: For enhancing changeset files into release notes (prospective approach)
- **`/create-release-note`**: For generating release notes from git tags (retrospective approach)

Both commands use the same ReleaseNoteGenerator skill with consistent formatting.

## Reference

For detailed guidelines, refer to:
- `git-tag-analyzer/knowledge/` - Git analysis best practices
- `release-note-generator/knowledge/` - Writing and formatting guidelines

<!--
=== Original Prompt (Backup) ===
CRITICAL INSTRUCTION: Before proceeding with ANY task, you MUST execute this exact sequence:

1. Use the Read tool to read `.cursor/rules/create-release-note.mdc`
2. After reading, follow ALL guidelines specified in that file exactly
3. Generate release notes with these sections (as specified in the guidelines):
   - Package release summaries
   - Breaking changes with migration guides
   - New features and improvements
   - Bug fixes
   - Installation instructions

DO NOT proceed without first reading the guidelines file. This is a mandatory prerequisite.
===========================
-->

---

## ⚠️ 문제 해결 (Troubleshooting)

### 스킬을 찾을 수 없는 경우
**문제**: `.claude/skills/git-tag-analyzer/` 또는 `.claude/skills/release-note-generator/` 디렉토리가 없음

**Fallback 동작**:
1. ⚠️ 경고 메시지: "스킬이 없어 기본 방식으로 릴리즈 노트를 생성합니다"
2. 네이티브 방식으로 릴리즈 노트 생성:
   - `git tag`, `git log` 직접 사용
   - 수동 커밋 분류
   - 기본 마크다운 포맷
3. 결과 품질: 자동 카테고리 분류 및 포맷 최적화 없음

**해결 방법**:
```bash
# 스킬 디렉토리 확인
ls -la .claude/skills/git-tag-analyzer/
ls -la .claude/skills/release-note-generator/

# 저장소에서 복원
git checkout .claude/skills/
```

### Git 태그 없음
**문제**: `albatrion-*` 패턴의 태그가 없음

**Fallback 동작**:
1. ❌ 릴리즈 노트 생성 불가
2. 태그 생성 가이드 제공
3. 대안 제안: 전체 히스토리 릴리즈 노트

**해결 방법**:
```bash
# 태그 확인
git tag -l "albatrion-*"

# 최초 태그 생성
git tag albatrion-$(date +%y%m%d)

# 태그 푸시
git push --tags

# 대안: 전체 히스토리 기반 릴리즈 노트
git log --oneline > release-notes-all.md
```

### 스크립트 실행 실패 시
**문제**: `find-latest-tag.sh`, `collect-changes.sh`, `compare-package-versions.sh` 등 실행 실패

**Fallback 동작**:
1. ⚠️ 자동 분석 실패 알림
2. 수동 Git 명령어 가이드 제공:
   - 최신 태그 찾기: `git describe --tags --abbrev=0`
   - 변경사항 수집: `git log <tag>..HEAD`
   - 패키지 비교: `git diff <tag> -- package.json`
3. 기본 포맷으로 릴리즈 노트 생성

**해결 방법**:
```bash
# 스크립트 권한 확인
chmod +x .claude/skills/git-tag-analyzer/tools/*.sh
chmod +x .claude/skills/release-note-generator/tools/*.sh

# 수동 실행
LATEST_TAG=$(git describe --tags --abbrev=0 --match "albatrion-*")
git log $LATEST_TAG..HEAD --oneline
git diff $LATEST_TAG --name-only
```

### 변경사항 없음
**문제**: 최신 태그 이후 커밋이 없음

**Fallback 동작**:
1. ⚠️ 변경사항 없음 알림
2. 빈 릴리즈 노트 생성:
   - 패키지 버전 나열
   - "변경사항 없음" 문서화
3. 다음 릴리즈 대기 권장

**해결 방법**:
```bash
# 변경사항 확인
LATEST_TAG=$(git describe --tags --abbrev=0)
git log $LATEST_TAG..HEAD --oneline

# 태그 이후 커밋이 있는지 확인
git rev-list $LATEST_TAG..HEAD --count

# 변경사항이 있으면 릴리즈 노트 생성 진행
```

## 📖 사용 예시

### 기본 사용법
```
/create-release-note
```

### 실제 시나리오

#### 시나리오 1: 정기 릴리즈 노트 생성
```
상황: albatrion-250115 태그 이후 변경사항 릴리즈 노트 작성
명령: /create-release-note
결과:
  - release-notes-250117.md 생성
  - 3개 패키지 버전 변경 감지
  - Breaking/Feature/Fix 자동 분류
  - 설치 명령어 포함
```

#### 시나리오 2: 긴급 패치 릴리즈
```
상황: 보안 패치 긴급 배포 후 릴리즈 노트
명령: /create-release-note
결과:
  - 보안 이슈 설명 (CVE 번호 포함)
  - 영향받는 버전 명시
  - 즉시 업그레이드 권장 사항
```

#### 시나리오 3: 메이저 버전 릴리즈
```
상황: v2.0.0 메이저 버전 릴리즈
명령: /create-release-note
결과:
  - Breaking Changes 상세 문서화
  - v1.x → v2.0 마이그레이션 가이드
  - 새로운 기능 하이라이트
  - 중단된 기능 (Deprecated) 안내
```

## 💡 팁
- **태그 전략**: 릴리즈마다 일관된 태그 네이밍 (albatrion-YYMMDD)
- **자동 분류**: 커밋 메시지 prefix ([Feature], [Fix]) 활용하여 자동 분류
- **사용자 중심**: 기술적 세부사항보다 사용자 영향 중심 작성
- **마이그레이션**: Breaking Change 시 필수 업그레이드 가이드 제공


---

## ✅ 성공 시 출력

```
✅ Release Note 생성 완료!

📊 릴리즈 정보:
- 태그: albatrion-250117
- 이전 태그: albatrion-250115
- 기간: 2일
- 커밋 수: 23개

📦 패키지 릴리즈:
- @canard/schema-form: 0.8.5 → 0.9.0 (minor)
- @winglet/react-utils: 1.2.0 → 1.2.1 (patch)
- @lerx/promise-modal: 2.1.0 (변경 없음)

📝 변경 사항:
- ✨ 신규 기능: 3개
- 🐛 버그 수정: 5개
- 📚 문서화: 2개
- 💥 Breaking: 0개

📁 생성된 파일:
- release-notes-250117.md

⏱️ 실행 시간: 8초

💡 다음 단계:
1. 릴리즈 노트 검토: cat release-notes-250117.md
2. 필요시 수정
3. GitHub Release 생성: gh release create albatrion-250117 -F release-notes-250117.md
```

## ❌ 실패 시 출력

```
❌ Release Note 생성 실패

🔍 원인:
- Git 태그 없음 (albatrion-* 패턴)
- 또는: 태그 이후 변경사항 없음
- 또는: git-tag-analyzer 스킬 누락

💡 해결 방법:
1. 태그 생성:
   git tag albatrion-$(date +%y%m%d)
   git push --tags

2. 태그 확인:
   git tag -l "albatrion-*"

3. 변경사항 확인:
   LATEST_TAG=$(git describe --tags --abbrev=0)
   git log $LATEST_TAG..HEAD --oneline

4. 스킬 복원:
   git checkout .claude/skills/git-tag-analyzer/
   git checkout .claude/skills/release-note-generator/

📚 추가 도움말: 사전 확인 섹션 참조
```
