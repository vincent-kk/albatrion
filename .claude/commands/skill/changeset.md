# Changeset Enhancement Command

This command analyzes changeset files and creates comprehensive, user-friendly release notes.

## Skill Used

**ReleaseNoteGenerator** (`.claude/skills/release-note-generator/`)
- Analyzes changeset files in `.changeset/` directory
- Enhances brief changeset descriptions into user-friendly content
- Generates formatted release notes with emoji structure
- Follows project-specific conventions

## Execution Flow

### Step 1: Scan Changesets

1. **Find Changeset Files**
   ```bash
   ls .changeset/*.md
   ```

2. **Parse Each Changeset**
   - Extract YAML frontmatter (package names, version bump types)
   - Read description content
   - Identify change categories

### Step 2: Categorize and Enhance

3. **Apply Categorization Rules**
   - `major` bump → 💥 Breaking Changes
   - `minor` bump → ✨ New Features
   - `patch` bump → 🐛 Bug Fixes or 🚀 Improvements
   - Parse description for type markers (feat:, fix:, etc.)

4. **Enhance Descriptions**
   - Refer to `knowledge/changeset-enhancement-guide.md`
   - Transform technical descriptions into user-centric content
   - Add context about user impact
   - Keep it brief (1-2 sentences per item)

### Step 3: Generate Release Note

5. **Create Unified Document**
   - Apply format from `knowledge/format-templates.md`
   - Use emoji structure (📦 ✨ 🚀 🐛 💥)
   - Follow writing principles from `knowledge/writing-principles.md`
   - Save to `release-notes-YYMMDD.md`

## Output Format

```markdown
# [Package Name] vX.X.X - Brief Title

## 📦 Package Releases

- `@package/name@X.X.X` - Brief description

---

## 💥 Breaking Changes

### [Change Name]
[Description with migration steps]

---

## ✨ New Features

- **Feature Name**: Brief description

---

## 🚀 Improvements

- **Category**: Brief description

---

## 🐛 Bug Fixes

- Fixed [specific issue]

---

## 📋 Installation

```bash
npm install @package/name@X.X.X
```
```

## Key Features

✅ **Monorepo-Aware**
- Verifies package names from package.json
- Handles multiple packages in single changeset

✅ **User-Centric Enhancement**
- Transforms technical descriptions
- Adds user impact context
- Maintains brevity

✅ **Consistent Format**
- Emoji structure
- English only
- Professional tone

## Important Notes

- **Always verify package names** from package.json (never assume from directories)
- **Keep it concise**: Maximum 2-3 minutes reading time
- **Migration guidance**: Always include for breaking changes
- **File output**: `release-notes-YYMMDD.md` where YYMMDD is current date

## Reference

For detailed guidelines, refer to:
- `release-note-generator/knowledge/changeset-enhancement-guide.md`
- `release-note-generator/knowledge/writing-principles.md`
- `release-note-generator/knowledge/format-templates.md`

---

## 🚀 Advanced Features

### 1. Priority Auto-Detection
- **자동 우선순위 분류**: Changeset 타입에 따라 자동 우선순위 부여
  - `major` bump → 🔴 최우선 (Breaking Changes)
  - `minor` bump → 🟡 중간 우선순위 (New Features)
  - `patch` bump → 🟢 낮은 우선순위 (Bug Fixes)
- **릴리즈 노트 정렬**: 우선순위 순서대로 자동 정렬
- **긴급도 표시**: Critical 버그 수정 시 🚨 마커 자동 추가

### 2. Previous Release Reference
- **스타일 일관성**: 이전 릴리즈 노트 파일 자동 검색 및 분석
  - 기존 용어 패턴 추출
  - 문장 구조 학습
  - 이모지 사용 패턴 유지
- **템플릿 재사용**: 동일 패키지의 이전 릴리즈 구조 참조
- **버전 히스토리**: 이전 버전과의 비교 정보 자동 생성

### 3. Migration Guide Auto-Generation
- **Breaking Change 감지**: major 버전 변경 시 자동 감지
- **마이그레이션 템플릿**: 표준 템플릿 기반 가이드 생성
  - **Before/After 코드 예시**: 변경 전후 비교
  - **단계별 마이그레이션**: 1→2→3 순서로 안내
  - **호환성 정보**: 이전 버전 지원 범위 명시
- **패키지별 커스터마이징**: 패키지 타입에 따라 템플릿 선택

**Example Migration Template**:
```markdown
## 💥 Breaking Changes

### [Change Name]

**변경 내용**: [What changed]
**영향도**: [Who is affected]

**마이그레이션 가이드**:

**Before** (v1.x):
```typescript
// Old code
```

**After** (v2.x):
```typescript
// New code
```

**단계별 업그레이드**:
1. 패키지 업데이트: `npm install @package/name@2.0.0`
2. 코드 변경: [Specific changes needed]
3. 테스트 실행: `npm test`

**호환성**: v1.5+ 에서 마이그레이션 가능
```

---

<!--
=== Original Prompt (Backup) ===
CRITICAL INSTRUCTION: Before proceeding with ANY task, you MUST execute this exact sequence:

1. Use the Read tool to read `.cursor/rules/create-changeset.mdc`
2. After reading, follow ALL guidelines specified in that file
3. Analyze the current changesets in `.changeset/` directory
4. Create a release note following the EXACT format from the guidelines

DO NOT proceed without first reading the guidelines file. This is a mandatory prerequisite.
===========================
-->

---

## ⚠️ 문제 해결 (Troubleshooting)

### 스킬을 찾을 수 없는 경우
**문제**: `.claude/skills/release-note-generator/` 디렉토리가 없음

**Fallback 동작**:
1. ⚠️ 경고 메시지: "release-note-generator 스킬이 없어 기본 방식을 사용합니다"
2. 네이티브 방식으로 릴리즈 노트 생성:
   - changeset 파일 직접 읽기
   - 수동 분류 및 포맷팅
   - 기본 마크다운 템플릿 적용
3. 결과 품질: 자동화된 카테고리 분류 및 포맷 최적화 없음

**해결 방법**:
```bash
# 스킬 디렉토리 확인
ls -la .claude/skills/release-note-generator/

# 저장소에서 복원
git checkout .claude/skills/release-note-generator/
```

### changeset 파일 없음
**문제**: `.changeset/*.md` 파일이 없음

**Fallback 동작**:
1. ❌ 실행 불가 알림
2. changeset 생성 가이드 제공
3. 대안 명령어 제안: `/create-release-note` (git tag 기반)

**해결 방법**:
```bash
# changeset 생성
npx changeset

# 기존 changeset 확인
ls -la .changeset/

# 대안: git tag 기반 릴리즈 노트
/create-release-note
```

### 스크립트 실행 실패 시
**문제**: `categorize-changes.sh`, `generate-release-note.sh` 실행 실패

**Fallback 동작**:
1. ⚠️ 자동 분류 실패 알림
2. 수동 분류 가이드 제공:
   - Breaking Changes
   - Features
   - Improvements
   - Bug Fixes
3. 기본 템플릿 제공

**해결 방법**:
```bash
# 스크립트 권한 확인
chmod +x .claude/skills/release-note-generator/tools/categorize-changes.sh
chmod +x .claude/skills/release-note-generator/tools/generate-release-note.sh

# 수동 실행
.claude/skills/release-note-generator/tools/categorize-changes.sh
```

### Knowledge 파일 누락
**문제**: 템플릿 및 포맷팅 가이드 파일 없음

**Fallback 동작**:
1. ⚠️ 기본 템플릿 사용 경고
2. 단순한 마크다운 구조 적용
3. 이모지 및 스타일 가이드 생략

**해결 방법**:
```bash
# Knowledge 파일 확인
ls -la .claude/skills/release-note-generator/knowledge/

# 저장소에서 복원
git checkout .claude/skills/release-note-generator/knowledge/
```

## 📖 사용 예시

### 기본 사용법
```
/changeset
```

### 실제 시나리오

#### 시나리오 1: 신규 기능 릴리즈 노트 작성
```
상황: 새로운 FormTypeDate 컴포넌트 추가 후 changeset 생성
명령: /changeset
결과:
  - .changeset/[random-id].md 생성
  - @canard/schema-form: minor
  - 사용자 중심 릴리즈 노트 작성
  - 마이그레이션 가이드 포함
```

#### 시나리오 2: 버그 수정 문서화
```
상황: critical 버그 수정 후 변경 사항 기록
명령: /changeset
결과:
  - patch 버전 변경 제안
  - 버그 영향도 및 해결 방법 설명
  - 관련 이슈 번호 자동 연결
```

#### 시나리오 3: Breaking Change 문서화
```
상황: API 인터페이스 변경으로 인한 호환성 깨짐
명령: /changeset
결과:
  - major 버전 변경 제안
  - 상세한 마이그레이션 가이드 자동 생성
  - Before/After 코드 예시 포함
```

### 고급 기능 사용 예시

#### 예시 1: 우선순위 자동 정렬
```
상황: 여러 changeset 파일이 섞여 있음 (major, minor, patch)
명령: /changeset
결과:
  - 🔴 Breaking Changes 섹션 먼저 표시
  - 🟡 New Features 두 번째
  - 🟢 Bug Fixes 마지막
  - Critical 버그 수정 시 🚨 마커 추가
```

#### 예시 2: 이전 릴리즈 스타일 유지
```
상황: 일관된 릴리즈 노트 스타일 유지 필요
명령: /changeset
결과:
  - 이전 release-notes-*.md 파일 자동 분석
  - 동일한 용어 패턴 사용
  - 이모지 스타일 일관성 유지
```

#### 예시 3: 마이그레이션 가이드 자동 생성
```
상황: v2.0.0 major 릴리즈 준비 중
명령: /changeset
결과:
  - major bump 자동 감지
  - 마이그레이션 템플릿 자동 생성
  - Before/After 코드 섹션 포함
  - 단계별 업그레이드 가이드 제공
```

## 💡 팁
- **즉시 작성**: 코드 변경 직후 작성하여 맥락 유지
- **사용자 관점**: 구현 세부사항이 아닌 사용자 영향 중심으로 작성
- **버전 규칙**: Breaking → major, 기능 추가 → minor, 버그 수정 → patch
- **마이그레이션 가이드**: Breaking Change 시 반드시 업그레이드 방법 제공
- **우선순위 활용**: 자동 정렬 기능으로 중요한 변경사항이 먼저 표시됨
- **스타일 일관성**: 이전 릴리즈 노트 참조로 프로젝트 문서 일관성 유지


---

## ✅ 성공 시 출력

```
✅ Changeset 생성 완료!

📊 생성 결과:
- 파일: .changeset/brave-lions-jump.md
- 버전: minor (@canard/schema-form)
- 타입: 기능 추가

📝 내용 미리보기:
---
"@canard/schema-form": minor
---

새로운 FormTypeDate 컴포넌트 추가

사용자가 날짜를 선택할 수 있는 FormTypeDate를 추가했습니다.
- 캘린더 UI 통합
- 날짜 범위 제한 옵션
- 로케일 지원 (다국어)

⏱️ 실행 시간: 3초

💡 다음 단계:
1. 변경 사항 검토: cat .changeset/brave-lions-jump.md
2. 필요시 수정: vi .changeset/brave-lions-jump.md
3. 커밋: git add . && git commit -m "feat: Add FormTypeDate"
```

## ❌ 실패 시 출력

```
❌ Changeset 생성 실패

🔍 원인:
- .changeset 디렉토리 없음 (changeset 미초기화)
- 또는: Git 변경사항 없음

💡 해결 방법:
1. Changeset 초기화:
   yarn changeset init

2. Git 변경사항 확인:
   git status
   git diff

3. 대안: Release note 직접 생성
   /create-release-note

📚 추가 도움말: Changeset 대신 /create-release-note 사용 가능
```
