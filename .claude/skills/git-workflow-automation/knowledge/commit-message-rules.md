# Conventional Commits 메시지 규칙

## 표준 형식

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

---

## Type (필수)

### 기능 관련
| Type | 설명 | 예시 |
|------|------|------|
| `feat` | 새로운 기능 추가 | `feat(ui): add Button component` |
| `fix` | 버그 수정 | `fix(auth): prevent null pointer in login` |
| `perf` | 성능 개선 | `perf(api): reduce query time by 40%` |

### 코드 품질
| Type | 설명 | 예시 |
|------|------|------|
| `refactor` | 리팩토링 (기능 변경 없음) | `refactor(utils): split format module` |
| `style` | 코드 포맷팅 (세미콜론, 공백 등) | `style(app): fix indentation` |
| `test` | 테스트 추가/수정 | `test(utils): add edge case tests` |

### 문서 및 설정
| Type | 설명 | 예시 |
|------|------|------|
| `docs` | 문서 변경 | `docs(readme): update installation guide` |
| `build` | 빌드 시스템/외부 의존성 변경 | `build(deps): upgrade react to 18.3` |
| `ci` | CI 설정 변경 | `ci(github): add dependabot config` |
| `chore` | 기타 (빌드 프로세스, 도구) | `chore(scripts): update deploy script` |

---

## Scope (선택적, 권장)

### Scope 추출 전략

#### 1. 파일 경로에서 추출
```typescript
// 패키지 경로 → scope
"packages/app/src/components/Button.tsx" → "ui"
"packages/form/src/plugins/date.ts" → "form/date"
"packages/utils/src/format.ts" → "utils"

// 기능 디렉토리 → scope
"src/auth/login.ts" → "auth"
"src/api/users.ts" → "api"
```

#### 2. 작업 제목에서 추출
```typescript
"작업 2.3: Button 컴포넌트 구현" → scope: "ui"
"작업 3.5: Apollo Client 설정" → scope: "graphql"
"작업 4.2: 사용자 인증 로직 수정" → scope: "auth"
```

#### 3. 패키지명에서 추출
```typescript
"@canard/schema-form" → scope: "schema-form"
"@winglet/react-utils" → scope: "react-utils"
"@lerx/promise-modal" → scope: "promise-modal"
```

### Scope 예시
```yaml
frontend:
  - ui: UI 컴포넌트
  - app: 애플리케이션 로직
  - router: 라우팅
  - store: 상태 관리

backend:
  - api: API 엔드포인트
  - db: 데이터베이스
  - auth: 인증/인가
  - service: 비즈니스 로직

shared:
  - utils: 유틸리티 함수
  - types: 타입 정의
  - config: 설정
  - deps: 의존성

docs:
  - readme: README 파일
  - api: API 문서
  - guide: 가이드 문서
```

---

## Subject (필수)

### 작성 규칙

#### 1. 현재형 동사 (Imperative Mood)
```yaml
good:
  - "add Button component"
  - "fix authentication bug"
  - "update documentation"
  - "remove deprecated API"

bad:
  - "Added Button component" (과거형)
  - "Adds Button component" (3인칭 현재)
  - "Adding Button component" (진행형)
```

#### 2. 소문자로 시작
```yaml
good:
  - "add login form"
  - "fix null pointer exception"

bad:
  - "Add login form" (대문자 시작)
  - "FIX NULL POINTER" (모두 대문자)
```

#### 3. 마침표 없음
```yaml
good:
  - "implement user authentication"

bad:
  - "implement user authentication." (마침표)
  - "implement user authentication!" (느낌표)
```

#### 4. 50자 이내 권장
```yaml
good (45자):
  - "add comprehensive unit tests for Button component"

acceptable (60자):
  - "refactor authentication middleware to support multiple strategies"

too_long (85자):
  - "implement a new Button component with primary and secondary variants and accessibility support"
  # → 축약 필요
```

### Subject 작성 패턴

#### 추가 (add, implement, create)
```bash
feat(ui): add Button component with variants
feat(api): implement user registration endpoint
feat(auth): create JWT token validation middleware
```

#### 수정 (fix, update, improve)
```bash
fix(auth): prevent null pointer in login handler
fix(api): resolve CORS issue in production
refactor(utils): improve error handling in format function
```

#### 제거 (remove, delete)
```bash
refactor(api): remove deprecated v1 endpoints
chore(deps): remove unused lodash dependency
```

#### 변경 (change, update, modify)
```bash
refactor(ui): change Button API to accept variant prop
build(deps): update react to version 18.3
```

---

## Body (선택적, 권장)

### 언제 사용?
```yaml
recommended:
  - 변경 이유 설명 (Why)
  - 복잡한 변경사항 상세 설명
  - Breaking changes 공지
  - 관련 이슈/작업 링크

optional:
  - 자명한 변경 (타이포 수정 등)
  - 매우 간단한 변경
```

### Body 작성 형식
```markdown
# 형식: 줄바꿈 + 상세 설명

feat(ui): implement Button component with variants

- Add Button component with primary/secondary variants
- Add hover, focus, and disabled states
- Follow WCAG 2.1 accessibility guidelines
- Include comprehensive unit tests (95% coverage)

This component replaces the old <button> usage across the app
and provides a consistent design system foundation.
```

### Breaking Changes
```markdown
# BREAKING CHANGE: 키워드 필수

feat(api): change authentication token format

BREAKING CHANGE: JWT token format changed from v1 to v2.
All existing tokens will be invalidated.

Migration:
1. Clear localStorage: localStorage.removeItem('token')
2. Re-authenticate users
3. Update API client to handle new token format
```

---

## Footer (선택적)

### 이슈 참조
```bash
# GitHub Issue 연결
fix(auth): prevent session timeout on refresh

Fixes #123
Closes #456

# Multiple issues
feat(ui): add dark mode support

Closes #789, #790
Related to #800
```

### 작업 참조
```bash
# 작업 ID 참조
feat(ui): implement Button component

Relates to: Task 2.3
Phase: 2
```

### Co-authored-by
```bash
# 공동 작업자 표시
feat(api): implement GraphQL schema

Co-authored-by: Alice <alice@example.com>
Co-authored-by: Bob <bob@example.com>
```

---

## 전체 예시

### 간단한 커밋 (Subject만)
```bash
docs: fix typo in installation guide
```

### 표준 커밋 (Type + Scope + Subject)
```bash
feat(ui): add Button component with variants
```

### 상세 커밋 (Body 포함)
```bash
feat(ui): implement Button component with variants

- Add Button component with primary/secondary variants
- Add hover, focus, and disabled states
- Follow WCAG 2.1 accessibility guidelines
- Include comprehensive unit tests (95% coverage)

Relates to: Task 2.3
```

### Breaking Change 커밋
```bash
feat(api): change authentication token format

BREAKING CHANGE: JWT token format changed from v1 to v2.
All existing tokens will be invalidated.

Migration:
1. Clear localStorage: localStorage.removeItem('token')
2. Re-authenticate users
3. Update API client to handle new token format

Closes #123
Relates to: Task 3.5
```

---

## 좋은 예시 vs 나쁜 예시

### ✅ 좋은 예시
```bash
# 명확하고 구체적
feat(auth): add two-factor authentication support

# 범위와 영향 명시
fix(api): resolve race condition in user update endpoint

# 간결하면서도 충분한 정보
refactor(utils): extract validation logic to separate module

# 문서화 포함
docs(readme): add installation instructions for Windows
```

### ❌ 나쁜 예시
```bash
# 너무 일반적
fix: bug fix

# 의미 불명확
update: changes

# 형식 미준수
Fixed the authentication bug.

# 너무 장황
feat(ui): I added a new Button component that has primary and secondary variants and also supports disabled state and follows WCAG guidelines
```

---

## 자동 생성 템플릿 (commit_generator.sh)

```bash
#!/bin/bash
# 사용법: commit_generator.sh <task_id> <type>

TASK_ID="$1"
COMMIT_TYPE="$2"  # "feature" or "docs"

# 03_plan.md에서 작업 정보 추출
TASK_INFO=$(grep -A 20 "^- \[ \] $TASK_ID:" 03_plan.md)

# Type 결정
if [ "$COMMIT_TYPE" = "docs" ]; then
  TYPE="docs"
else
  # 파일 확장자로 추론
  if [[ "$TASK_INFO" =~ "*.test.*" ]]; then
    TYPE="test"
  elif [[ "$TASK_INFO" =~ "fix" ]]; then
    TYPE="fix"
  else
    TYPE="feat"
  fi
fi

# Scope 추출 (파일 경로에서)
SCOPE=$(echo "$TASK_INFO" | grep -o "packages/[^/]*/src/[^/]*" | head -1 | awk -F'/' '{print $4}')

# Subject 생성 (작업 제목에서)
SUBJECT=$(echo "$TASK_INFO" | grep "^- \[ \]" | sed "s/^- \[ \] [0-9.]*: //" | tr '[:upper:]' '[:lower:]')

# 메시지 출력
echo "$TYPE($SCOPE): $SUBJECT"
```

---

> **Best Practice**: Conventional Commits 형식 준수로 자동화 도구 활용 (changelog, release notes)
> **Automation**: commit_generator.sh로 일관된 메시지 생성
> **Consistency**: 팀 전체가 동일한 형식 사용으로 Git 히스토리 가독성 향상
