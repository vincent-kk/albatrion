# Korean Code Review Template

이 템플릿은 `review.md` 파일 생성 시 사용되는 기본 구조입니다.

## 전체 구조

```markdown
# 코드 리뷰 - {{ANALYSIS_MODE_KR}}

## 📊 리뷰 요약

**프로젝트 정보**: (`.project-structure.yaml`에서 로드)
- **프로젝트 타입**: {{PROJECT_TYPE}}
- **프론트엔드**: {{FRONTEND_FRAMEWORK}} + {{UI_LIBRARY}}
- **백엔드**: {{BACKEND_FRAMEWORK}}
- **테스팅**: {{TESTING_FRAMEWORK}}
- **상태 관리**: {{STATE_MANAGEMENT}}

**분석 모드**: {{ANALYSIS_MODE_KR}}
**기준**: {{SOURCE_DESCRIPTION}}
{{IF_BRANCH}}**총 커밋 수**: {{COMMIT_COUNT}}개 커밋{{END_IF}}
**변경된 파일**: {{FILES_CHANGED}}개 파일
**추가된 라인**: +{{LINES_ADDED}}
**삭제된 라인**: -{{LINES_DELETED}}

**변경된 파일 분류**: (프로젝트 구조 기반)
- 컴포넌트: {{COMPONENT_COUNT}}개
- API/리졸버: {{API_COUNT}}개
- 테스트: {{TEST_COUNT}}개
- 유틸리티: {{UTILITY_COUNT}}개
- 기타: {{OTHER_COUNT}}개

{{IF_BRANCH}}
**비교 방법** (Branch Comparison):
- ✅ 공통 조상부터 현재 브랜치까지 비교: `git diff $(git merge-base {{BASE_BRANCH}} HEAD)..HEAD`
- ✅ 타겟 브랜치의 변경사항만 포함
- ❌ 베이스 브랜치({{BASE_BRANCH}})의 새 커밋은 제외
{{END_IF}}

---

## 🔄 단순 리팩토링

{{IF_HAS_SIMPLE_REFACTORING}}
### ✅ 검증된 리팩토링 변경사항

{{FOR_EACH verified_refactoring}}
- **파일**: `{{FILE_PATH}}`
  - **변경사항**: {{CHANGE_DESCRIPTION}}
  - **검증 결과**: ✅ 동일한 로직 유지 확인
  - **소스**: {{SOURCE}}
{{END_FOR}}

{{IF_HAS_CONCERNS}}
### ⚠️ 잠재적 문제사항

{{FOR_EACH refactoring_concern}}
- **파일**: `{{FILE_PATH}}`
  - **변경사항**: {{CHANGE_DESCRIPTION}}
  - **우려사항**: {{CONCERN}}
  - **소스**: {{SOURCE}}
{{END_FOR}}
{{END_IF}}
{{ELSE}}
변경사항 없음
{{END_IF}}

---

## 🧠 로직 변경사항

{{IF_HAS_LOGIC_CHANGES}}
### 중요한 로직 업데이트

{{FOR_EACH logic_change}}
#### `{{FILE_PATH}}` ({{LINE_RANGE}})

**소스**: {{SOURCE}}

**기존 로직**:
\`\`\`{{LANGUAGE}}
{{OLD_CODE}}
\`\`\`

**신규 로직**:
\`\`\`{{LANGUAGE}}
{{NEW_CODE}}
\`\`\`

**영향도 분석**:
{{FOR_EACH impact}}
- {{IMPACT_LEVEL}} **{{IMPACT_TYPE}}**: {{IMPACT_DESCRIPTION}}
{{END_FOR}}
{{END_FOR}}
{{ELSE}}
변경사항 없음
{{END_IF}}

---

## 🧠 복잡 로직 분석 (Complex Cases Only)

{{IF_HAS_COMPLEX_CHANGES}}
{{FOR_EACH complex_change}}
#### `{{FILE_PATH}}` ({{LINE_RANGE}})

**복잡도 평가**: ⚠️ Complex (Score: {{COMPLEXITY_SCORE}})
- {{CRITERIA_BREAKDOWN}}

**리스크 레벨**: {{RISK_LEVEL}}

**영향받는 영역**:
{{FOR_EACH affected_area}}
- {{AREA_DESCRIPTION}}
{{END_FOR}}

**필수 조치** (✅ Must Do):
{{FOR_EACH must_do}}
{{INDEX}}. {{ACTION_ITEM}}
{{END_FOR}}

**권장 조치** (⚠️ Should Do):
{{FOR_EACH should_do}}
{{INDEX}}. {{ACTION_ITEM}}
{{END_FOR}}

{{IF_HAS_CONSIDER}}
**고려 사항** (💡 Consider):
{{FOR_EACH consider}}
{{INDEX}}. {{ACTION_ITEM}}
{{END_FOR}}
{{END_IF}}

{{IF_HAS_MIGRATION}}
**배포 전략**:
{{FOR_EACH migration_phase}}
- {{PHASE_DESCRIPTION}}
{{END_FOR}}
{{END_IF}}

---
{{END_FOR}}
{{ELSE}}
복잡도 기준(Score ≥ 3)을 충족하는 변경사항 없음
{{END_IF}}

---

## 📁 파일 이동 및 순서 변경

{{IF_HAS_FILE_MOVEMENTS}}
### 파일 재배치

{{FOR_EACH file_move}}
- `{{OLD_PATH}}` → `{{NEW_PATH}}`
{{END_FOR}}

{{IF_HAS_IMPORT_CHANGES}}
### Import 순서 변경

- **영향받은 파일**: {{AFFECTED_FILE_COUNT}}개 파일에서 import 문 순서 변경
- **검증 결과**: ✅ 기능적 변경 없음, 포맷팅만 변경
{{END_IF}}
{{ELSE}}
변경사항 없음
{{END_IF}}

---

## 📝 상세 변경 내역

{{IF_HAS_DETAILED_CHANGES}}
{{IF_HAS_NEW_FEATURES}}
### 새로운 기능

{{FOR_EACH new_feature}}
#### `{{FILE_PATH}}` ({{LINE_RANGE}})

**소스**: {{SOURCE}}

- **추가사항**: {{FEATURE_DESCRIPTION}}
- **목적**: {{PURPOSE}}
- **API**: {{EXPORTED_API}}
{{END_FOR}}
{{END_IF}}

{{IF_HAS_BUG_FIXES}}
### 버그 수정

{{FOR_EACH bug_fix}}
#### `{{FILE_PATH}}` ({{LINE_RANGE}})

**소스**: {{SOURCE}}

- **수정사항**: {{FIX_DESCRIPTION}}
- **변경사항**: {{CHANGES}}
- **심각도**: {{SEVERITY}}
{{END_FOR}}
{{END_IF}}

{{IF_HAS_CONFIG_CHANGES}}
### 설정 변경

{{FOR_EACH config_change}}
- **파일**: `{{FILE_PATH}}`
- **변경사항**: {{CHANGE_DESCRIPTION}}
{{END_FOR}}
{{END_IF}}
{{ELSE}}
변경사항 없음
{{END_IF}}

---

## 🎯 리뷰 권장사항

{{IF_HAS_HIGH_PRIORITY}}
### 높은 우선순위

{{FOR_EACH high_priority}}
{{INDEX}}. **{{TITLE}}**: {{DESCRIPTION}}
{{END_FOR}}
{{END_IF}}

{{IF_HAS_MEDIUM_PRIORITY}}
### 보통 우선순위

{{FOR_EACH medium_priority}}
{{INDEX}}. **{{TITLE}}**: {{DESCRIPTION}}
{{END_FOR}}
{{END_IF}}

{{IF_HAS_LOW_PRIORITY}}
### 낮은 우선순위

{{FOR_EACH low_priority}}
{{INDEX}}. **{{TITLE}}**: {{DESCRIPTION}}
{{END_FOR}}
{{END_IF}}

---

## 📋 테스트 권장사항

### 필수 테스트

{{FOR_EACH required_test}}
- [ ] {{TEST_DESCRIPTION}}
{{END_FOR}}

{{IF_HAS_RECOMMENDED_TESTS}}
### 권장 테스트

{{FOR_EACH recommended_test}}
- [ ] {{TEST_DESCRIPTION}}
{{END_FOR}}
{{END_IF}}

---

**리뷰 날짜**: {{REVIEW_DATE}}
**분석 모드**: {{ANALYSIS_MODE_KR}}
**리뷰어**: 자동화된 코드 리뷰 시스템
```

## 변수 설명

### 프로젝트 정보
- `{{PROJECT_TYPE}}`: monorepo | single-package
- `{{FRONTEND_FRAMEWORK}}`: React | Vue | Angular | etc.
- `{{UI_LIBRARY}}`: antd | mui | tailwind | etc.
- `{{BACKEND_FRAMEWORK}}`: NestJS | Express | Fastify | etc.
- `{{TESTING_FRAMEWORK}}`: vitest | jest | playwright | etc.
- `{{STATE_MANAGEMENT}}`: jotai | redux | zustand | etc.

### 분석 정보
- `{{ANALYSIS_MODE_KR}}`: 
  - "commit" → "특정 커밋 분석"
  - "branch" → "브랜치 비교"
  - "staged" → "스테이지된 변경사항"
- `{{SOURCE_DESCRIPTION}}`: 
  - commit → "커밋 해시 abc1234"
  - branch → "feature-branch (공통 조상 def5678부터)"
  - staged → "staged vs HEAD"

### 통계
- `{{FILES_CHANGED}}`: 변경된 파일 수
- `{{LINES_ADDED}}`: 추가된 라인 수
- `{{LINES_DELETED}}`: 삭제된 라인 수
- `{{COMMIT_COUNT}}`: 커밋 수 (branch mode only)

### 복잡도 & 리스크
- `{{COMPLEXITY_SCORE}}`: 0-10+ 숫자
- `{{RISK_LEVEL}}`:
  - "🔴 Critical" → "🔴 위험"
  - "🟠 High" → "🟠 높음"
  - "🟡 Medium" → "🟡 보통"
  - "🟢 Low" → "🟢 낮음"

### 날짜
- `{{REVIEW_DATE}}`: YYYY-MM-DD 형식

## 조건부 렌더링

- `{{IF_BRANCH}}...{{END_IF}}`: 브랜치 모드일 때만 표시
- `{{IF_HAS_COMPLEX_CHANGES}}...{{END_IF}}`: 복잡한 변경사항이 있을 때만
- `{{IF_HAS_CONCERNS}}...{{END_IF}}`: 우려사항이 있을 때만

## 반복 렌더링

- `{{FOR_EACH logic_change}}...{{END_FOR}}`: 각 로직 변경사항에 대해 반복
- `{{FOR_EACH must_do}}...{{END_FOR}}`: 각 필수 조치 항목 반복

## 사용 예시

```typescript
// Template rendering
const template = loadTemplate('review-template-korean.md');
const rendered = renderTemplate(template, {
  ANALYSIS_MODE_KR: '브랜치 비교',
  PROJECT_TYPE: 'monorepo',
  FILES_CHANGED: 15,
  LINES_ADDED: 234,
  LINES_DELETED: 128,
  // ... more variables
});

writeFile('./review.md', rendered);
```
