# Pull Request Creation Command

**Usage**: `/pr`

---

## Skills-Based Execution

This command automatically generates a PR by combining the following skills:

### 1. **git-change-analyzer** (`.claude/skills/git-change-analyzer/`)
- Role: Git change collection and structuring
- Tasks:
  - Determine analysis mode (current branch vs master)
  - Execute Git commands to collect changes
  - Structure file diffs and metadata

### 2. **code-quality-reviewer** (`.claude/skills/code_quality_reviewer/`)
- Role: Code quality review + PR context analysis
- Tasks:
  - Code quality review (readability, performance, type safety, etc.)
  - **PR-specific analysis** (extended feature):
    - Identify breaking changes
    - Suggest test coverage
    - Analyze affected packages
    - Generate migration guide (if needed)

### 3. **pr-generator** (`.claude/skills/pr-generator/`)
- Role: PR metadata generation and GitHub publishing
- Tasks:
  - Generate PR title: `[Type](scope): description` format
  - Generate PR description: template-based structure
  - Create actual PR via GitHub CLI
  - Return PR URL and results

---

## Execution Flow

```
User: /pr

→ Step 1: git-change-analyzer
  - Determine analysis mode (branch vs staged)
  - Collect Git changes
  - Output structured JSON

→ Step 2: code-quality-reviewer
  - Code quality review
  - PR context review (breaking changes, tests, impact)
  - Generate review results

→ Step 3: pr-generator
  - Generate PR title
  - Generate PR description
  - Create PR via GitHub CLI
  - Return PR URL

→ Step 4: Provide results to user
  - PR URL
  - Summary of main changes
  - Required test confirmations
```

---

## Output Example

```
✅ Pull Request created successfully!

**PR Title**: [Feat](schema-form): Add async validation support
**PR URL**: https://github.com/vincent-kk/albatrion/pull/123

**Main Changes**:
- Added async validation logic (AsyncValidator interface)
- Full compatibility with existing sync validation
- 8 files changed, +245 -32 lines

**Required Testing**:
- [ ] Async validation scenario tests
- [ ] Existing sync validation regression tests
- [ ] Promise rejection error handling

**Affected Packages**:
- @canard/schema-form: New feature added (0.8.5 → 0.9.0)
```

---

## 🔍 Pre-Execution Checks

Before creating PR, the following validations are performed automatically:

### 1. GitHub CLI Availability
**Check**: Is `gh` CLI installed and authenticated?
```bash
# Installation check
command -v gh >/dev/null 2>&1

# Authentication check
gh auth status
```

**Auto-fix suggestions**:
- ❌ **gh not installed** → Install via: `brew install gh` (macOS) or https://cli.github.com/
- ❌ **Not authenticated** → Run: `gh auth login`
- ✅ **Ready** → Proceed to next check

### 2. Git Repository State
**Check**: Are changes committed and branch ready for PR?
```bash
# Uncommitted changes check
git status --porcelain

# Branch difference check
git diff master..HEAD --quiet

# Commits to push check
git log master..HEAD --oneline
```

**Auto-fix suggestions**:
- ❌ **Uncommitted changes** → Commit first: `git add . && git commit -m "message"`
- ❌ **No branch difference** → Create feature branch: `git checkout -b feature/name`
- ❌ **No commits to push** → Make changes and commit first
- ✅ **Ready** → PR can be created

### 3. Remote Repository
**Check**: Is current branch tracking a remote?
```bash
# Remote tracking check
git rev-parse --abbrev-ref --symbolic-full-name @{u}
```

**Auto-fix suggestions**:
- ❌ **No remote tracking** → Push and set upstream: `git push -u origin $(git branch --show-current)`
- ✅ **Tracking remote** → PR can be created

---

## 🚀 Advanced Features

### 1. Branch Naming Validation
- **Prefix 자동 검증**: feature/, fix/, refactor/, chore/, docs/ 등 표준 prefix 확인
  - 유효한 prefix: `feature/`, `fix/`, `refactor/`, `chore/`, `docs/`, `test/`, `perf/`
  - 잘못된 네이밍 감지 시 자동 경고
- **경고 및 수정 제안**: 비표준 브랜치명 발견 시 권장 패턴 제시
  - 예: `my-feature` → 권장: `feature/my-feature`
- **자동 분류**: Prefix 기반 PR 타입 자동 결정
  - `feature/` → `[Feature]` 태그 자동 생성
  - `fix/` → `[Fix]` 태그 자동 생성
  - `refactor/` → `[Refactor]` 태그 자동 생성

**Example Validation Output**:
```
⚠️ Branch Naming 검증 결과

현재 브랜치: my-new-feature
상태: ❌ 비표준 네이밍

💡 권장 사항:
  git checkout -b feature/my-new-feature

📋 표준 Prefix 목록:
  - feature/  : 새로운 기능 추가
  - fix/      : 버그 수정
  - refactor/ : 코드 리팩토링
  - chore/    : 빌드, 설정 변경
  - docs/     : 문서 수정
  - test/     : 테스트 추가/수정
  - perf/     : 성능 개선
```

### 2. Label Auto-Tagging
- **PR 내용 분석**: 변경사항 자동 분석하여 적절한 라벨 추가
  - `breaking-change`: API 변경, 호환성 깨짐 감지
  - `enhancement`: 신규 기능 추가
  - `bug`: 버그 수정
  - `documentation`: 문서 변경
  - `dependencies`: 의존성 업데이트
  - `performance`: 성능 개선
  - `security`: 보안 이슈 수정
- **커밋 메시지 기반**: Conventional Commits 형식에서 라벨 추출
  - `feat:` → `enhancement` 라벨
  - `fix:` → `bug` 라벨
  - `docs:` → `documentation` 라벨
  - `perf:` → `performance` 라벨
- **파일 변경 기반**: 변경된 파일 경로로 카테고리 판단
  - `.md` 파일만 변경 → `documentation`
  - `package.json` 변경 → `dependencies`
  - `test/`, `__tests__/` 변경 → `testing`

**Example Label Detection**:
```
🏷️ 자동 라벨 태깅 결과

분석된 변경사항:
  - 커밋 메시지: "feat: Add async validation support"
  - 변경 파일: src/validation/async.ts (new), src/types/Validator.ts (modified)
  - Breaking Change 감지: ❌ 없음

추천 라벨:
  ✅ enhancement (새 기능 추가)
  ✅ typescript (TypeScript 코드 변경)

선택 가능 라벨:
  ⚪ documentation (문서 업데이트 권장)
  ⚪ testing (테스트 추가 권장)
```

### 3. Reviewer Auto-Assignment
- **CODEOWNERS 참조**: 변경된 파일의 소유자 자동 추출
  - `.github/CODEOWNERS` 파일 파싱
  - 파일 경로별 담당자 매핑
  - 여러 소유자 발견 시 모두 리뷰어로 추가
- **팀 기반 할당**: 패키지별 담당 팀 자동 지정
  - `packages/@canard/*` → @canard-team
  - `packages/@winglet/*` → @winglet-team
  - 루트 설정 파일 → @infrastructure-team
- **부하 분산**: 리뷰어별 현재 PR 수 고려하여 균등 분배
  - GitHub API로 각 리뷰어의 열린 PR 수 조회
  - 가장 적은 PR을 가진 리뷰어 우선 배정
  - 최대 리뷰어 수 제한 (기본: 3명)

**Example Reviewer Assignment**:
```
👥 리뷰어 자동 할당 결과

변경된 파일 분석:
  - packages/@canard/schema-form/src/core/validator.ts
  - packages/@canard/schema-form/README.md
  - .github/workflows/ci.yml

CODEOWNERS 매칭:
  - packages/@canard/** → @vincent-kk, @canard-team
  - .github/workflows/** → @infrastructure-team

리뷰어 부하 상황:
  - @vincent-kk: 2개 PR (할당 가능 ✅)
  - @teammate1: 5개 PR (부하 높음 ⚠️)
  - @teammate2: 1개 PR (우선 할당 ✅)

최종 할당:
  ✅ @vincent-kk (파일 소유자)
  ✅ @teammate2 (부하 분산)
  ✅ @canard-team (팀 리뷰)
```

---

## 📖 사용 예시 (Advanced Features)

### 예시 1: Branch Naming Validation
```
상황: 비표준 브랜치명으로 작업 중 (my-auth-feature)
명령: /pr
결과:
  - ⚠️ 브랜치 네이밍 경고 표시
  - 권장 브랜치명 제안: feature/my-auth-feature
  - 옵션 제공: 1) 브랜치명 변경 후 재시도, 2) 현재 상태로 계속
```

### 예시 2: Label Auto-Tagging
```
상황: 여러 타입의 변경사항이 혼재된 PR
명령: /pr
결과:
  - 커밋 메시지 분석: "feat: Add validation" + "fix: Correct type error"
  - 파일 분석: TypeScript 파일 + Markdown 문서
  - 자동 라벨: enhancement, bug, documentation, typescript
  - 사용자 확인 후 라벨 적용
```

### 예시 3: Reviewer Auto-Assignment
```
상황: @canard/schema-form 패키지 수정
명령: /pr
결과:
  - CODEOWNERS 파싱: @vincent-kk, @canard-team 발견
  - 부하 분석: @vincent-kk (2 PRs), @teammate2 (1 PR)
  - 최종 할당: @vincent-kk (소유자), @teammate2 (부하 분산), @canard-team (팀)
  - GitHub PR 생성 시 리뷰어 자동 추가
```

### 예시 4: 모든 기능 통합
```
상황: feature/async-validation 브랜치에서 새 기능 개발 완료
명령: /pr
결과:
  - ✅ 브랜치 네이밍 검증: feature/ prefix 적합
  - 🏷️ 라벨 자동 태깅: enhancement, typescript, testing (테스트 추가 필요 알림)
  - 👥 리뷰어 할당: @vincent-kk, @teammate2, @canard-team
  - 📋 PR 생성: 제목 "[Feature](schema-form): Add async validation support"
  - 🔗 PR URL: https://github.com/vincent-kk/albatrion/pull/XXX
```

---

## Prerequisites

### GitHub CLI Installation & Authentication
```bash
# Check installation
gh --version

# Authenticate (if not already)
gh auth login
```

### Git Repository State
- Changes must be committed
- Branch must differ from master

---

<!--
=== Original Prompt (Backup) ===

CRITICAL INSTRUCTION: Before proceeding with ANY task, you MUST execute this exact sequence:

1. Use the Read tool to read `.cursor/rules/pull-request.mdc`
2. After reading, follow ALL guidelines specified in that file exactly
3. Create a well-structured PR with these elements (as specified in the guidelines):
   - Clear title and description
   - Comprehensive change summary
   - Testing evidence
   - Related issues/changesets

DO NOT proceed without first reading the guidelines file. This is a mandatory prerequisite.

===========================
-->

---

**Note**: The original `.cursor/rules/pull-request.mdc` guidelines have been modularized into the above 3 skills.

---

## ⚠️ 문제 해결 (Troubleshooting)

### 스킬을 찾을 수 없는 경우
**문제**: 필수 스킬 (`git-change-analyzer`, `code-quality-reviewer`, `pr-generator`) 디렉토리가 없음

**Fallback 동작**:
1. ⚠️ 경고 메시지: "스킬이 없어 네이티브 방식으로 PR을 생성합니다"
2. 네이티브 방식으로 PR 생성:
   - `git diff`, `git log` 직접 사용
   - 수동으로 PR 제목/내용 생성
   - `gh pr create` 직접 실행
3. 결과 품질: 자동화된 분석 및 구조화 없음

**해결 방법**:
```bash
# 스킬 디렉토리 확인
ls -la .claude/skills/git-change-analyzer/
ls -la .claude/skills/code-quality-reviewer/
ls -la .claude/skills/pr-generator/

# 저장소에서 복원
git checkout .claude/skills/
```

### GitHub CLI 미설치/미인증
**문제**: `gh` 명령어 사용 불가

**Fallback 동작**:
1. ❌ PR 생성 불가 알림
2. 수동 PR 생성 가이드 제공:
   - GitHub 웹에서 PR 생성
   - PR 제목/내용 템플릿 제공
3. `gh` 설치 가이드 제공

**해결 방법**:
```bash
# macOS
brew install gh

# Ubuntu/Debian
sudo apt install gh

# 인증
gh auth login

# 수동 PR 생성 (웹)
# 1. GitHub 저장소 페이지 방문
# 2. "Pull requests" → "New pull request"
# 3. 브랜치 선택 및 PR 생성
```

### Git 상태 문제
**문제**: 커밋되지 않은 변경사항 또는 브랜치 문제

**Fallback 동작**:
1. ❌ PR 생성 차단
2. Git 상태 확인 및 해결 방법 안내
3. 사전 확인 섹션 참조 권장

**해결 방법**:
```bash
# 미커밋 변경사항 확인
git status

# 변경사항 커밋
git add .
git commit -m "commit message"

# 브랜치 확인 및 생성
git branch
git checkout -b feature/new-feature
```

### 스크립트 실행 실패 시
**문제**: PR 생성 관련 스크립트 실행 실패

**Fallback 동작**:
1. ⚠️ 자동 생성 실패 알림
2. 수동 PR 생성 템플릿 제공
3. `gh pr create --web` 권장 (브라우저에서 직접 작성)

**해결 방법**:
```bash
# 브라우저에서 PR 생성 (추천)
gh pr create --web

# 또는 인터랙티브 모드
gh pr create --fill

# 수동으로 제목/내용 지정
gh pr create --title "PR Title" --body "PR Description"
```

## 📖 사용 예시

### 기본 사용법
```
/pr
```

### 실제 시나리오

#### 시나리오 1: 기능 브랜치 PR 생성
```
상황: feature/user-authentication 브랜치 작업 완료
명령: /pr
결과:
  - GitHub PR 자동 생성
  - 커밋 히스토리 기반 제목/본문 생성
  - Test Plan 체크리스트 포함
  - 라벨 자동 태깅 (enhancement)
```

#### 시나리오 2: 버그 수정 PR
```
상황: fix/login-error 브랜치에서 긴급 버그 수정
명령: /pr
결과:
  - PR 제목: "[Fix] Login validation error"
  - 버그 재현 단계 문서화
  - 수정 내용 Before/After 비교
  - 라벨: bug, hotfix
```

#### 시나리오 3: 리팩토링 PR
```
상황: refactor/simplify-auth 브랜치에서 코드 정리
명령: /pr
결과:
  - 변경 사항 카테고리별 정리
  - 동작 변경 없음 명시
  - 성능 개선 수치 포함
  - 라벨: refactor
```

## 💡 팁
- **브랜치 네이밍**: feature/, fix/, refactor/ prefix 사용하여 자동 분류
- **커밋 정리**: PR 전 관련 커밋을 하나로 squash 고려
- **리뷰어 지정**: CODEOWNERS 파일 활용하여 자동 지정
- **Draft PR**: 작업 중일 때는 Draft로 생성하여 피드백 받기


---

## ✅ 성공 시 출력

```
✅ Pull Request 생성 완료!

📊 PR 정보:
- 번호: #123
- 제목: [Feature] Add user authentication
- 브랜치: feature/user-auth → master
- URL: https://github.com/owner/repo/pull/123

📝 PR 내용:
- 커밋 수: 5개
- 변경 파일: 12개 (+450, -120)
- 라벨: enhancement, security
- 리뷰어: @teammate1, @teammate2

📋 Test Plan:
- [ ] 로그인 플로우 테스트
- [ ] 회원가입 테스트
- [ ] 권한 검증 테스트

⏱️ 실행 시간: 4초

💡 다음 단계:
1. PR 확인: https://github.com/owner/repo/pull/123
2. 리뷰어에게 알림
3. CI/CD 결과 대기
```

## ❌ 실패 시 출력

```
❌ Pull Request 생성 실패

🔍 원인:
- GitHub CLI 미인증 (gh auth status 실패)
- 또는: 커밋되지 않은 변경사항 존재
- 또는: 원격 브랜치 없음

💡 해결 방법:
1. GitHub CLI 인증:
   gh auth login

2. 변경사항 커밋:
   git add .
   git commit -m "feat: your changes"

3. 원격 브랜치 푸시:
   git push -u origin feature/branch-name

4. 수동 PR 생성:
   https://github.com/owner/repo/compare

📚 추가 도움말: 사전 확인 섹션 참조
```
