# 코드 리뷰 보고서 템플릿

> 일관성 있는 한글 코드 리뷰 보고서 생성을 위한 템플릿 모음

## 📄 기본 템플릿 구조

### 전체 보고서 레이아웃

```markdown
# 코드 리뷰 - {Analysis Mode}

## 📊 리뷰 요약
{프로젝트 정보, 통계, 분석 모드}

## 🔄 단순 리팩토링
{간단한 코드 정리, 리네이밍, 추출 등}

## 🧠 로직 변경사항
{비즈니스 로직 변경, 알고리즘 개선 등}

## 🧠 복잡 로직 분석
{ToT 분석이 필요한 복잡한 변경사항}

## 📁 파일 이동 및 순서 변경
{파일 이동, 디렉토리 재구성 등}

## 📝 상세 변경 내역
{문서, 테스트, 의존성 등 기타 변경사항}

## 🎯 리뷰 권장사항
{우선순위별 액션 아이템}

## 📋 테스트 권장사항
{테스트 체크리스트}

---
**리뷰 날짜**: {YYYY-MM-DD}
**분석 모드**: {mode_korean}
**리뷰어**: 자동화된 코드 리뷰 시스템

**다음 단계**:
{액션 아이템 요약}
```

---

## 📋 섹션별 상세 템플릿

### 1. 리뷰 요약 (📊 Review Summary)

```markdown
## 📊 리뷰 요약

**프로젝트**: {project_name} v{version}
**브랜치**: {branch_name}
**작성자**: {author_email}
**분석 모드**: {analysis_mode_korean}

**변경 통계**:
- 변경된 파일: {file_count}개
- 추가된 라인: +{lines_added}
- 삭제된 라인: -{lines_deleted}
- 순 변경: {net_change > 0 ? '+' : ''}{net_change}

**변경 범위**:
- 🔴 위험: {high_risk_count}건
- 🟡 보통: {medium_risk_count}건
- 🟢 낮음: {low_risk_count}건

---
```

**변수 설명**:
- `{project_name}`: 프로젝트 이름 (e.g., `@canard/schema-form`)
- `{version}`: 버전 번호 (e.g., `0.8.5`)
- `{branch_name}`: 브랜치명 (e.g., `feat/new-feature`)
- `{author_email}`: 작성자 이메일
- `{analysis_mode_korean}`: 한글 분석 모드 (e.g., `종합 분석 (Comprehensive)`)
- `{file_count}`: 변경된 파일 수
- `{lines_added}`: 추가된 라인 수
- `{lines_deleted}`: 삭제된 라인 수
- `{net_change}`: 순 변경 라인 수
- `{high_risk_count}`: 고위험 변경 건수
- `{medium_risk_count}`: 중위험 변경 건수
- `{low_risk_count}`: 저위험 변경 건수

---

### 2. 단순 리팩토링 (🔄 Simple Refactoring)

#### 2.1 변경사항이 있는 경우

```markdown
## 🔄 단순 리팩토링

### {번호}. {변경 제목}
- **파일**: `{file_path}`
- **라인**: {start_line}-{end_line}번째 라인
- **위험도**: {risk_emoji} {risk_korean}
- **설명**: {description}

{추가 설명 (선택적)}
```

**예시**:
```markdown
## 🔄 단순 리팩토링

### 1. FormTypeProps → FormTypeInputProps 타입명 변경
- **파일**: `packages/canard/schema-form/src/types/formTypeInput.ts`
- **라인**: 15-45번째 라인
- **위험도**: 🟢 낮음
- **설명**: 타입명을 더 명확하게 변경하여 가독성 향상

### 2. validation 로직 분리
- **파일**: `packages/canard/schema-form/src/components/StringInput.tsx`
- **라인**: 67-89번째 라인
- **위험도**: 🟢 낮음
- **설명**: validation 로직을 별도 함수로 추출하여 재사용성 개선
```

#### 2.2 변경사항이 없는 경우

```markdown
## 🔄 단순 리팩토링
변경사항 없음

---
```

---

### 3. 로직 변경사항 (🧠 Logic Changes)

#### 3.1 Before/After 비교가 있는 경우

```markdown
## 🧠 로직 변경사항

### {번호}. {변경 제목}
- **파일**: `{file_path}`
- **라인**: {start_line}-{end_line}번째 라인
- **위험도**: {risk_emoji} {risk_korean}

**기존 로직**:
\`\`\`{language}
{old_code}
\`\`\`

**신규 로직**:
\`\`\`{language}
{new_code}
\`\`\`

**변경 이유**:
{reason}

**영향 범위**:
{impact}
```

**예시**:
```markdown
## 🧠 로직 변경사항

### 1. 에러 처리 로직 강화
- **파일**: `packages/canard/schema-form/src/core/formEngine.ts`
- **라인**: 123-135번째 라인
- **위험도**: 🟡 보통

**기존 로직**:
\`\`\`typescript
if (!value) return null;
\`\`\`

**신규 로직**:
\`\`\`typescript
if (value === undefined || value === null) {
  throw new ValidationError('Value required');
}
\`\`\`

**변경 이유**:
- undefined와 null을 명확히 구분하여 처리
- 에러 발생 시 명확한 메시지 제공

**영향 범위**:
- 기존 null 반환을 기대하던 코드는 에러 처리 필요
- ValidationError 타입 import 필요
```

#### 3.2 Before/After 비교가 없는 경우

```markdown
### {번호}. {변경 제목}
- **파일**: `{file_path}`
- **라인**: {start_line}-{end_line}번째 라인
- **위험도**: {risk_emoji} {risk_korean}
- **설명**: {description}
```

---

### 4. 복잡 로직 분석 (🧠 Complex Logic Analysis)

```markdown
## 🧠 복잡 로직 분석

### {번호}. {변경 제목} {risk_emoji} {risk_korean}
- **파일**: `{file_path}`
- **라인**: {start_line}-{end_line}번째 라인
- **위험도**: {risk_emoji} {risk_korean}

**ToT 분석 결과**:

**사고 과정**:
{thoughts_list}

**발견된 위험**:
{risks_list}

**권장사항**:
{recommendations_list}

{additional_analysis (선택적)}

---
```

**예시**:
```markdown
## 🧠 복잡 로직 분석

### 1. ArrayNode 생성 로직 재설계 🔴 위험
- **파일**: `packages/canard/schema-form/src/core/nodeFactory.ts`
- **라인**: 200-250번째 라인
- **위험도**: 🔴 높음

**ToT 분석 결과**:

**사고 과정**:
1. 기존 로직은 빈 배열 처리 시 에러 발생
2. 새 로직은 빈 배열을 정상 케이스로 처리
3. 하위 호환성 영향: 기존 빈 배열 검증에 의존하는 코드 영향받을 수 있음

**발견된 위험**:
- ⚠️ Breaking change 가능성
- ⚠️ 기존 테스트 케이스 실패 가능

**권장사항**:
- ✅ 마이그레이션 가이드 작성 필요
- ✅ deprecation warning 추가 권장

---
```

**Thoughts, Risks, Recommendations 포맷**:
```markdown
**사고 과정**:
1. {thought_1}
2. {thought_2}
3. {thought_3}

**발견된 위험**:
- ⚠️ {risk_1}
- ⚠️ {risk_2}

**권장사항**:
- ✅ {recommendation_1}
- ✅ {recommendation_2}
```

---

### 5. 파일 이동 및 순서 변경 (📁 File Movements)

```markdown
## 📁 파일 이동 및 순서 변경

### {번호}. {변경 제목}
- **이전 경로**: `{old_path}`
- **신규 경로**: `{new_path}`
- **이유**: {reason}
- **영향**: {impact}

---
```

**예시**:
```markdown
## 📁 파일 이동 및 순서 변경

### 1. validators.ts 파일 이동
- **이전 경로**: `src/utils/validators.ts`
- **신규 경로**: `src/validation/validators.ts`
- **이유**: validation 관련 파일 그룹화
- **영향**: import 경로 업데이트 필요

### 2. types 디렉토리 재구성
- **이전 경로**: `src/types/`
- **신규 경로**: `src/core/types/`
- **이유**: 핵심 타입을 core 디렉토리로 이동하여 구조 명확화
- **영향**: 모든 types import 경로 변경 필요

---
```

---

### 6. 상세 변경 내역 (📝 Detailed Changes)

```markdown
## 📝 상세 변경 내역

### {번호}. {변경 제목}
- **파일**: `{file_path}`
- **위험도**: {risk_emoji} {risk_korean}
- **설명**: {description}

---
```

**카테고리별 예시**:

```markdown
## 📝 상세 변경 내역

### 1. FormTypeInput 문서 업데이트
- **파일**: `README.md`
- **위험도**: 🟢 낮음
- **설명**: FormTypeInput 사용 예시 업데이트

### 2. 단위 테스트 추가
- **파일**: `src/components/StringInput.test.tsx`
- **위험도**: 🟢 낮음
- **설명**: StringInput 컴포넌트 단위 테스트 추가

### 3. 의존성 업데이트
- **파일**: `package.json`
- **위험도**: 🟢 낮음
- **설명**: react-hook-form v7.48.0 → v7.50.0 업데이트

---
```

---

### 7. 리뷰 권장사항 (🎯 Review Recommendations)

```markdown
## 🎯 리뷰 권장사항

### 🔴 필수 조치
{critical_actions}

### 🟡 권장 조치
{recommended_actions}

### 🟢 고려 사항
{considerations}

---
```

**예시**:
```markdown
## 🎯 리뷰 권장사항

### 🔴 필수 조치
1. **ArrayNode 로직 변경에 대한 마이그레이션 가이드 작성**
   - 기존 빈 배열 처리 방식에서 신규 방식으로 전환 가이드
   - Breaking change 영향받는 패키지 식별

2. **deprecation warning 추가**
   - 기존 동작에 의존하는 코드에 경고 표시

### 🟡 권장 조치
1. **에러 처리 로직 변경에 대한 문서화**
   - null 반환 → ValidationError 예외로 변경된 부분 명시
   - 에러 처리 예제 코드 추가

2. **파일 이동에 따른 import 경로 검증**
   - 모든 import 경로가 올바르게 업데이트되었는지 확인

### 🟢 고려 사항
1. **타입명 변경 일관성 유지**
   - FormTypeInputProps 명명 규칙이 다른 타입에도 일관되게 적용되는지 검토

---
```

---

### 8. 테스트 권장사항 (📋 Testing Recommendations)

```markdown
## 📋 테스트 권장사항

### 필수 테스트
{required_tests}

### 통합 테스트
{integration_tests}

### {추가 테스트 카테고리 (선택적)}
{additional_tests}

---
```

**예시**:
```markdown
## 📋 테스트 권장사항

### 필수 테스트
- [ ] ArrayNode 빈 배열 처리 테스트 (신규 로직 검증)
- [ ] ValidationError 예외 처리 테스트
- [ ] 기존 테스트 케이스 회귀 테스트

### 통합 테스트
- [ ] FormTypeInput 타입 변경 영향 범위 테스트
- [ ] 파일 이동 후 import 경로 정상 동작 확인

### 브레이킹 체인지 검증
- [ ] 기존 빈 배열 검증 코드 영향 확인
- [ ] 하위 호환성 테스트

### 성능 테스트 (선택적)
- [ ] 대량 데이터 입력 시 성능 저하 없는지 확인
- [ ] 메모리 누수 테스트

---
```

---

### 9. 보고서 하단 메타데이터

```markdown
---

**리뷰 날짜**: {YYYY-MM-DD}
**분석 모드**: {analysis_mode_korean}
**리뷰어**: 자동화된 코드 리뷰 시스템

**다음 단계**:
{next_steps_list}
```

**예시**:
```markdown
---

**리뷰 날짜**: 2025-01-17
**분석 모드**: Comprehensive (종합 분석)
**리뷰어**: 자동화된 코드 리뷰 시스템

**다음 단계**:
1. 🔴 표시된 복잡 로직 변경 사항 우선 검토
2. 마이그레이션 가이드 작성
3. 모든 테스트 통과 확인
4. PR 승인 전 하위 호환성 영향 최종 검토
```

---

## 🎨 스타일 가이드

### 이모지 사용 규칙

#### 위험도 이모지
- 🔴 위험 (Critical/High)
- 🟠 높음 (High)
- 🟡 보통 (Medium)
- 🟢 낮음 (Low)

#### 섹션 헤더 이모지
- 📊 리뷰 요약
- 🔄 단순 리팩토링
- 🧠 로직 변경사항 / 복잡 로직 분석
- 📁 파일 이동 및 순서 변경
- 📝 상세 변경 내역
- 🎯 리뷰 권장사항
- 📋 테스트 권장사항

#### 체크 항목 이모지
- ✅ 확인됨, 권장사항
- ⚠️ 주의, 위험 요소
- ❌ 금지, 문제
- 🔍 검토 필요

### 코드 블록 형식

#### TypeScript/JavaScript
```markdown
\`\`\`typescript
{code}
\`\`\`
```

#### Python
```markdown
\`\`\`python
{code}
\`\`\`
```

#### JSON
```markdown
\`\`\`json
{json_content}
\`\`\`
```

#### Shell/Bash
```markdown
\`\`\`bash
{shell_commands}
\`\`\`
```

### 파일 경로 표현

- **절대 경로**: `packages/canard/schema-form/src/types/formTypeInput.ts`
- **상대 경로**: `./src/components/StringInput.tsx`
- **라인 범위**: 15-45번째 라인 또는 45번째 라인

### 통계 표현

```markdown
**변경 통계**:
- 변경된 파일: 15개
- 추가된 라인: +534
- 삭제된 라인: -278
- 순 변경: +256
```

---

## 📐 분석 모드별 템플릿 변형

### Comprehensive (종합 분석)

- **모든 섹션 포함**
- **복잡 로직 분석 상세**
- **ToT 분석 결과 전체 포함**
- **테스트 권장사항 상세**

### Standard (표준 분석)

- **주요 섹션 포함**
- **복잡 로직 요약**
- **핵심 권장사항 위주**

### Quick (빠른 분석)

- **리뷰 요약 + 주요 변경사항만**
- **복잡 로직 분석 생략 가능**
- **간단한 권장사항**

### Security Focused (보안 중점)

- **보안 관련 섹션 강조**
- **보안 테스트 권장사항 상세**
- **보안 경고 메시지 추가**

**보안 중점 추가 섹션**:
```markdown
**⚠️ 보안 중요 공지**:
이 PR은 {보안 이슈 타입} 수정을 포함하고 있습니다.
1. 모든 보안 테스트 완료 후 승인
2. 배포 후 즉시 {관련 지점} 모니터링
3. 보안 팀 최종 승인 필수
```

---

## 🔤 용어 일관성 가이드

### 필수 번역 용어

| 영문 | 한글 | 사용 예시 |
|------|------|----------|
| breaking change | 브레이킹 체인지 | 하위 호환성 깨짐 |
| refactoring | 리팩토링 | 코드 구조 개선 |
| merge conflict | 머지 충돌 | 브랜치 병합 충돌 |
| type safety | 타입 안전성 | TypeScript 타입 검증 |
| code coverage | 코드 커버리지 | 테스트 커버리지 |
| unit test | 단위 테스트 | 함수 단위 테스트 |
| integration test | 통합 테스트 | 모듈 간 통합 테스트 |
| regression test | 회귀 테스트 | 기존 기능 정상 동작 확인 |
| migration guide | 마이그레이션 가이드 | 버전 업그레이드 가이드 |
| deprecation warning | deprecation 경고 | 사용 중단 경고 |

### 액션 용어

| 영문 | 한글 |
|------|------|
| Must Do | 필수 조치 |
| Should Do | 권장 조치 |
| Consider | 고려 사항 |
| Required | 필수 |
| Recommended | 권장 |
| Optional | 선택적 |

---

> **Note**: 이 템플릿은 일관성 있는 보고서 생성을 위한 기본 구조입니다.
> 프로젝트 특성에 따라 섹션을 추가하거나 생략할 수 있습니다.
