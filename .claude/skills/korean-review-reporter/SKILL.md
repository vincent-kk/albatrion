# Korean Review Reporter Skill

## Role
You are a technical documentation specialist responsible for generating comprehensive code review reports in Korean.

## Responsibilities
1. **Data Transformation**: Convert structured evaluation data into human-readable Korean
2. **Formatting**: Apply consistent markdown formatting for clarity
3. **Localization**: Translate technical terms appropriately for Korean developers
4. **File Output**: Save final report as `./review.md`

## Input Format

```typescript
interface ReporterInput {
  analysisMode: string;
  projectContext: ProjectContext;
  changes: ChangesSummary;
  source: SourceInfo;
  categories: {
    simpleRefactoring: Change[];
    logicChanges: Change[];
    fileMovements: Change[];
    detailedChanges: Change[];
  };
  complexChanges: ComplexChange[];
}
```

## Output Format

The skill generates a markdown file (`./review.md`) in Korean following this structure:

```markdown
# 코드 리뷰 - [Analysis Mode]

## 📊 리뷰 요약
[Project info, analysis mode, statistics]

## 🔄 단순 리팩토링
[Simple refactoring changes]

## 🧠 로직 변경사항
[Logic changes with before/after comparison]

## 🧠 복잡 로직 분석 (Complex Cases Only)
[ToT analysis results for complex changes]

## 📁 파일 이동 및 순서 변경
[File movements and reorganization]

## 📝 상세 변경 내역
[Other detailed changes]

## 🎯 리뷰 권장사항
[Prioritized recommendations]

## 📋 테스트 권장사항
[Testing recommendations]

---
**리뷰 날짜**: YYYY-MM-DD
**분석 모드**: [mode]
**리뷰어**: 자동화된 코드 리뷰 시스템
```

## Template Structure

Refer to `knowledge/review-template-korean.md` for the complete template with all sections.

## Localization Guidelines

Refer to `knowledge/korean-tech-terms.md` for consistent Korean translations:

### Technical Terms
- `breaking change` → `브레이킹 체인지`
- `refactoring` → `리팩토링`
- `merge conflict` → `머지 충돌`
- `type safety` → `타입 안전성`

### Risk Levels
- `🔴 Critical` → `🔴 위험`
- `🟠 High` → `🟠 높음`
- `🟡 Medium` → `🟡 보통`
- `🟢 Low` → `🟢 낮음`

### Action Items
- `Must Do` → `필수 조치`
- `Should Do` → `권장 조치`
- `Consider` → `고려 사항`

## Formatting Rules

### Code Blocks
```markdown
**기존 로직**:
\`\`\`typescript
// old code
\`\`\`

**신규 로직**:
\`\`\`typescript
// new code
\`\`\`
```

### File Paths
- Use backticks: `packages/aileron/src/cache.ts`
- Include line numbers: `(45-67번째 라인)`

### Lists
- Use emoji bullets for visual hierarchy
- ✅ for verified items
- ⚠️ for concerns/warnings
- 🔴🟡🟢 for risk levels

### Statistics
```markdown
**변경된 파일**: 15개 파일
**추가된 라인**: +234
**삭제된 라인**: -128
```

## Workflow

1. **Load Template**: Read base template from knowledge
2. **Transform Data**: Convert input JSON to Korean prose
3. **Apply Formatting**: Insert markdown syntax and structure
4. **Validate**: Check for completeness
5. **Write File**: Save as `./review.md`

## Quality Checks

Before writing file, ensure:
- ✅ All sections present
- ✅ Korean language used throughout
- ✅ Technical terms translated consistently
- ✅ Code blocks properly formatted
- ✅ File paths and line numbers included
- ✅ Risk levels clearly indicated
- ✅ Action items prioritized correctly
- ✅ Date and metadata added

## Dependencies

- Input from `code-impact-evaluator` skill
- Template from `knowledge/review-template-korean.md`
- Term dictionary from `knowledge/korean-tech-terms.md`

## Error Handling

1. **Missing Data**: Use placeholder text with warning
2. **Invalid Risk Level**: Default to 🟡 보통
3. **Empty Sections**: Include section but note "변경사항 없음"
4. **File Write Failure**: Report error to user clearly

## Usage Example

```bash
# Generate review from evaluation output
korean-review-reporter --input evaluation.json --output review.md
```

## Output Location

**Fixed Path**: `./review.md` (relative to repository root)

If file exists, it will be overwritten with new review.

## Post-Generation

After generating `review.md`:
1. Confirm file was written successfully
2. Report file location to user
3. Provide quick summary of findings
4. Suggest next steps (e.g., "Please review complex changes marked as 🔴")

## 사용 시나리오

### 시나리오 1: 대규모 리팩터링 PR 리뷰 보고서

**상황**: 15개 파일, 500줄 이상의 리팩터링 변경사항이 포함된 PR

**입력 데이터**:
```typescript
const input: ReporterInput = {
  analysisMode: "comprehensive",
  projectContext: {
    name: "@canard/schema-form",
    version: "0.8.5",
    type: "library"
  },
  changes: {
    totalFiles: 15,
    linesAdded: 534,
    linesDeleted: 278,
    netChange: 256
  },
  source: {
    branch: "feat/form-type-input-refactor",
    author: "developer@example.com",
    timestamp: "2025-01-17T10:30:00Z"
  },
  categories: {
    simpleRefactoring: [
      {
        file: "packages/canard/schema-form/src/types/formTypeInput.ts",
        type: "rename",
        description: "FormTypeProps → FormTypeInputProps 타입명 변경",
        risk: "low",
        lineRange: "15-45"
      },
      {
        file: "packages/canard/schema-form/src/components/StringInput.tsx",
        type: "extract",
        description: "validation 로직을 별도 함수로 분리",
        risk: "low",
        lineRange: "67-89"
      }
    ],
    logicChanges: [
      {
        file: "packages/canard/schema-form/src/core/formEngine.ts",
        type: "logic_enhancement",
        description: "에러 처리 로직 강화",
        risk: "medium",
        before: "if (!value) return null;",
        after: "if (value === undefined || value === null) {\n  throw new ValidationError('Value required');\n}",
        lineRange: "123-135"
      }
    ],
    fileMovements: [
      {
        from: "src/utils/validators.ts",
        to: "src/validation/validators.ts",
        reason: "validation 관련 파일 그룹화"
      }
    ],
    detailedChanges: [
      {
        file: "README.md",
        type: "documentation",
        description: "FormTypeInput 사용 예시 업데이트",
        risk: "low"
      }
    ]
  },
  complexChanges: [
    {
      file: "packages/canard/schema-form/src/core/nodeFactory.ts",
      description: "ArrayNode 생성 로직 재설계",
      risk: "high",
      totAnalysis: {
        thoughts: [
          "기존 로직은 빈 배열 처리 시 에러 발생",
          "새 로직은 빈 배열을 정상 케이스로 처리",
          "하위 호환성 영향: 기존 빈 배열 검증에 의존하는 코드 영향받을 수 있음"
        ],
        risks: [
          "Breaking change 가능성",
          "기존 테스트 케이스 실패 가능"
        ],
        recommendations: [
          "마이그레이션 가이드 작성 필요",
          "deprecation warning 추가 권장"
        ]
      },
      lineRange: "200-250"
    }
  ]
};
```

**생성된 보고서** (`./review.md`):
```markdown
# 코드 리뷰 - Comprehensive

## 📊 리뷰 요약

**프로젝트**: @canard/schema-form v0.8.5
**브랜치**: feat/form-type-input-refactor
**작성자**: developer@example.com
**분석 모드**: 종합 분석 (Comprehensive)

**변경 통계**:
- 변경된 파일: 15개
- 추가된 라인: +534
- 삭제된 라인: -278
- 순 변경: +256

---

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

---

## 🧠 로직 변경사항

### 1. 에러 처리 로직 강화
- **파일**: `packages/canard/schema-form/src/core/formEngine.ts`
- **라인**: 123-135번째 라인
- **위험도**: 🟡 보통

**기존 로직**:
```typescript
if (!value) return null;
```

**신규 로직**:
```typescript
if (value === undefined || value === null) {
  throw new ValidationError('Value required');
}
```

**변경 이유**:
- undefined와 null을 명확히 구분하여 처리
- 에러 발생 시 명확한 메시지 제공

**영향 범위**:
- 기존 null 반환을 기대하던 코드는 에러 처리 필요
- ValidationError 타입 import 필요

---

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

## 📁 파일 이동 및 순서 변경

### 1. validators.ts 파일 이동
- **이전 경로**: `src/utils/validators.ts`
- **신규 경로**: `src/validation/validators.ts`
- **이유**: validation 관련 파일 그룹화
- **영향**: import 경로 업데이트 필요

---

## 📝 상세 변경 내역

### 1. FormTypeInput 문서 업데이트
- **파일**: `README.md`
- **위험도**: 🟢 낮음
- **설명**: FormTypeInput 사용 예시 업데이트

---

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

### 시나리오 2: 단순 버그 수정 PR 리뷰 보고서

**상황**: 2개 파일, 10줄 미만의 버그 수정

**입력 데이터**:
```typescript
const input: ReporterInput = {
  analysisMode: "quick",
  projectContext: {
    name: "@winglet/react-utils",
    version: "1.2.3",
    type: "library"
  },
  changes: {
    totalFiles: 2,
    linesAdded: 5,
    linesDeleted: 3,
    netChange: 2
  },
  source: {
    branch: "fix/useDebounce-memory-leak",
    author: "developer@example.com",
    timestamp: "2025-01-17T14:20:00Z"
  },
  categories: {
    simpleRefactoring: [],
    logicChanges: [
      {
        file: "packages/winglet/react-utils/src/hooks/useDebounce.ts",
        type: "bug_fix",
        description: "cleanup 함수 누락으로 인한 메모리 누수 수정",
        risk: "low",
        before: "useEffect(() => {\n  const timer = setTimeout(() => setDebouncedValue(value), delay);\n}, [value, delay]);",
        after: "useEffect(() => {\n  const timer = setTimeout(() => setDebouncedValue(value), delay);\n  return () => clearTimeout(timer);\n}, [value, delay]);",
        lineRange: "15-20"
      }
    ],
    fileMovements: [],
    detailedChanges: [
      {
        file: "packages/winglet/react-utils/CHANGELOG.md",
        type: "documentation",
        description: "버그 수정 내역 추가",
        risk: "low"
      }
    ]
  },
  complexChanges: []
};
```

**생성된 보고서** (`./review.md`):
```markdown
# 코드 리뷰 - Quick

## 📊 리뷰 요약

**프로젝트**: @winglet/react-utils v1.2.3
**브랜치**: fix/useDebounce-memory-leak
**작성자**: developer@example.com
**분석 모드**: 빠른 분석 (Quick)

**변경 통계**:
- 변경된 파일: 2개
- 추가된 라인: +5
- 삭제된 라인: -3
- 순 변경: +2

---

## 🔄 단순 리팩토링
변경사항 없음

---

## 🧠 로직 변경사항

### 1. useDebounce 메모리 누수 수정
- **파일**: `packages/winglet/react-utils/src/hooks/useDebounce.ts`
- **라인**: 15-20번째 라인
- **위험도**: 🟢 낮음

**기존 로직**:
```typescript
useEffect(() => {
  const timer = setTimeout(() => setDebouncedValue(value), delay);
}, [value, delay]);
```

**신규 로직**:
```typescript
useEffect(() => {
  const timer = setTimeout(() => setDebouncedValue(value), delay);
  return () => clearTimeout(timer);
}, [value, delay]);
```

**변경 이유**:
- cleanup 함수 누락으로 컴포넌트 언마운트 시 타이머가 정리되지 않음
- 메모리 누수 및 불필요한 상태 업데이트 발생 가능성 제거

**영향 범위**:
- 기능적 변경 없음 (정상 동작 유지)
- 성능 개선 (메모리 누수 방지)

---

## 🧠 복잡 로직 분석
변경사항 없음

---

## 📁 파일 이동 및 순서 변경
변경사항 없음

---

## 📝 상세 변경 내역

### 1. CHANGELOG 업데이트
- **파일**: `packages/winglet/react-utils/CHANGELOG.md`
- **위험도**: 🟢 낮음
- **설명**: 버그 수정 내역 추가

---

## 🎯 리뷰 권장사항

### 🟢 고려 사항
1. **다른 커스텀 훅 검토**
   - 유사한 패턴을 사용하는 다른 훅들도 cleanup 함수 누락 여부 확인

---

## 📋 테스트 권장사항

### 필수 테스트
- [ ] useDebounce 정상 동작 확인
- [ ] 컴포넌트 언마운트 시 타이머 정리 확인

### 회귀 테스트
- [ ] 기존 useDebounce 사용 코드 정상 동작 확인

---

**리뷰 날짜**: 2025-01-17
**분석 모드**: Quick (빠른 분석)
**리뷰어**: 자동화된 코드 리뷰 시스템

**다음 단계**:
1. 테스트 통과 확인
2. 승인 및 머지
```

### 시나리오 3: 기능 추가 PR 리뷰 보고서

**상황**: 새로운 FormType 플러그인 추가 (7개 파일)

**입력 데이터**:
```typescript
const input: ReporterInput = {
  analysisMode: "standard",
  projectContext: {
    name: "@canard/schema-form",
    version: "0.8.6",
    type: "library"
  },
  changes: {
    totalFiles: 7,
    linesAdded: 320,
    linesDeleted: 15,
    netChange: 305
  },
  source: {
    branch: "feat/datetime-input",
    author: "developer@example.com",
    timestamp: "2025-01-17T16:45:00Z"
  },
  categories: {
    simpleRefactoring: [],
    logicChanges: [
      {
        file: "packages/canard/schema-form/src/plugins/DateTimeInput.tsx",
        type: "new_feature",
        description: "새로운 DateTime 입력 컴포넌트 추가",
        risk: "medium",
        lineRange: "1-150"
      },
      {
        file: "packages/canard/schema-form/src/plugins/index.ts",
        type: "export_addition",
        description: "DateTimeInput export 추가",
        risk: "low",
        before: "export { StringInput, NumberInput };",
        after: "export { StringInput, NumberInput, DateTimeInput };",
        lineRange: "10"
      }
    ],
    fileMovements: [],
    detailedChanges: [
      {
        file: "packages/canard/schema-form/src/plugins/DateTimeInput.test.tsx",
        type: "test",
        description: "DateTimeInput 단위 테스트 추가",
        risk: "low"
      },
      {
        file: "packages/canard/schema-form/README.md",
        type: "documentation",
        description: "DateTimeInput 사용 예시 추가",
        risk: "low"
      }
    ]
  },
  complexChanges: [
    {
      file: "packages/canard/schema-form/src/plugins/DateTimeInput.tsx",
      description: "날짜/시간 입력 및 타임존 처리 로직",
      risk: "medium",
      totAnalysis: {
        thoughts: [
          "ISO 8601 형식으로 날짜/시간 저장",
          "사용자 로컬 타임존과 UTC 변환 처리",
          "브라우저 호환성 고려 (Date API 사용)"
        ],
        risks: [
          "타임존 변환 시 오차 발생 가능성",
          "구형 브라우저에서 Date API 지원 제한"
        ],
        recommendations: [
          "date-fns 또는 dayjs 라이브러리 고려",
          "타임존 테스트 케이스 추가 권장"
        ]
      },
      lineRange: "45-120"
    }
  ]
};
```

**생성된 보고서** (`./review.md`):
```markdown
# 코드 리뷰 - Standard

## 📊 리뷰 요약

**프로젝트**: @canard/schema-form v0.8.6
**브랜치**: feat/datetime-input
**작성자**: developer@example.com
**분석 모드**: 표준 분석 (Standard)

**변경 통계**:
- 변경된 파일: 7개
- 추가된 라인: +320
- 삭제된 라인: -15
- 순 변경: +305

---

## 🔄 단순 리팩토링
변경사항 없음

---

## 🧠 로직 변경사항

### 1. DateTime 입력 컴포넌트 추가
- **파일**: `packages/canard/schema-form/src/plugins/DateTimeInput.tsx`
- **라인**: 1-150번째 라인
- **위험도**: 🟡 보통
- **설명**: 새로운 DateTime 입력 컴포넌트 추가

### 2. DateTimeInput export 추가
- **파일**: `packages/canard/schema-form/src/plugins/index.ts`
- **라인**: 10번째 라인
- **위험도**: 🟢 낮음

**기존 로직**:
```typescript
export { StringInput, NumberInput };
```

**신규 로직**:
```typescript
export { StringInput, NumberInput, DateTimeInput };
```

---

## 🧠 복잡 로직 분석

### 1. 날짜/시간 입력 및 타임존 처리 로직 🟡 보통
- **파일**: `packages/canard/schema-form/src/plugins/DateTimeInput.tsx`
- **라인**: 45-120번째 라인
- **위험도**: 🟡 보통

**ToT 분석 결과**:

**사고 과정**:
1. ISO 8601 형식으로 날짜/시간 저장
2. 사용자 로컬 타임존과 UTC 변환 처리
3. 브라우저 호환성 고려 (Date API 사용)

**발견된 위험**:
- ⚠️ 타임존 변환 시 오차 발생 가능성
- ⚠️ 구형 브라우저에서 Date API 지원 제한

**권장사항**:
- ✅ date-fns 또는 dayjs 라이브러리 고려
- ✅ 타임존 테스트 케이스 추가 권장

---

## 📁 파일 이동 및 순서 변경
변경사항 없음

---

## 📝 상세 변경 내역

### 1. DateTimeInput 단위 테스트 추가
- **파일**: `packages/canard/schema-form/src/plugins/DateTimeInput.test.tsx`
- **위험도**: 🟢 낮음
- **설명**: DateTimeInput 단위 테스트 추가

### 2. DateTimeInput 문서 추가
- **파일**: `packages/canard/schema-form/README.md`
- **위험도**: 🟢 낮음
- **설명**: DateTimeInput 사용 예시 추가

---

## 🎯 리뷰 권장사항

### 🟡 권장 조치
1. **타임존 처리 라이브러리 검토**
   - 네이티브 Date API 대신 date-fns, dayjs 등 검증된 라이브러리 사용 고려
   - 타임존 변환 정확성 및 브라우저 호환성 향상

2. **타임존 테스트 케이스 추가**
   - 다양한 타임존에서의 동작 검증
   - DST (Daylight Saving Time) 전환 시점 테스트

### 🟢 고려 사항
1. **접근성 (a11y) 확인**
   - 날짜 선택기 키보드 네비게이션 지원
   - 스크린 리더 호환성

---

## 📋 테스트 권장사항

### 필수 테스트
- [ ] DateTimeInput 기본 동작 테스트
- [ ] ISO 8601 형식 변환 정확성 검증
- [ ] 타임존 변환 테스트 (최소 3개 타임존)

### 통합 테스트
- [ ] 폼 제출 시 날짜/시간 값 정상 전송 확인
- [ ] 기존 FormType들과의 호환성 테스트

### 브라우저 호환성 테스트
- [ ] Chrome, Firefox, Safari 최신 버전
- [ ] IE11 또는 지원 범위 내 구형 브라우저 (필요 시)

---

**리뷰 날짜**: 2025-01-17
**분석 모드**: Standard (표준 분석)
**리뷰어**: 자동화된 코드 리뷰 시스템

**다음 단계**:
1. 타임존 처리 라이브러리 도입 검토
2. 타임존 테스트 케이스 추가
3. 접근성 검증
4. 브라우저 호환성 테스트 완료 후 승인
```

### 시나리오 4: 보안 취약점 수정 PR 리뷰 보고서

**상황**: XSS 취약점 수정 (3개 파일)

**입력 데이터**:
```typescript
const input: ReporterInput = {
  analysisMode: "security_focused",
  projectContext: {
    name: "@aileron/user-dashboard",
    version: "2.1.0",
    type: "application"
  },
  changes: {
    totalFiles: 3,
    linesAdded: 25,
    linesDeleted: 18,
    netChange: 7
  },
  source: {
    branch: "security/fix-xss-vulnerability",
    author: "security@example.com",
    timestamp: "2025-01-17T11:00:00Z"
  },
  categories: {
    simpleRefactoring: [],
    logicChanges: [
      {
        file: "src/components/UserProfile.tsx",
        type: "security_fix",
        description: "사용자 입력 sanitize 추가",
        risk: "high",
        before: "<div>{user.bio}</div>",
        after: "<div>{sanitizeHtml(user.bio)}</div>",
        lineRange: "45"
      },
      {
        file: "src/utils/sanitize.ts",
        type: "new_utility",
        description: "HTML sanitize 유틸리티 함수 추가",
        risk: "medium",
        lineRange: "1-20"
      }
    ],
    fileMovements: [],
    detailedChanges: [
      {
        file: "package.json",
        type: "dependency",
        description: "DOMPurify 라이브러리 추가",
        risk: "low"
      }
    ]
  },
  complexChanges: [
    {
      file: "src/utils/sanitize.ts",
      description: "XSS 방어를 위한 HTML sanitization 로직",
      risk: "high",
      totAnalysis: {
        thoughts: [
          "DOMPurify 라이브러리를 사용하여 신뢰할 수 있는 sanitization",
          "허용된 태그 화이트리스트 정의 (p, br, strong, em만 허용)",
          "이벤트 핸들러 및 스크립트 태그 완전 제거"
        ],
        risks: [
          "과도한 sanitize로 정상 HTML도 제거될 가능성",
          "화이트리스트 관리 필요"
        ],
        recommendations: [
          "sanitize 정책을 설정 파일로 분리 권장",
          "허용된 태그 문서화 필요"
        ]
      },
      lineRange: "5-18"
    }
  ]
};
```

**생성된 보고서** (`./review.md`):
```markdown
# 코드 리뷰 - Security Focused

## 📊 리뷰 요약

**프로젝트**: @aileron/user-dashboard v2.1.0
**브랜치**: security/fix-xss-vulnerability
**작성자**: security@example.com
**분석 모드**: 보안 중점 분석 (Security Focused)

**변경 통계**:
- 변경된 파일: 3개
- 추가된 라인: +25
- 삭제된 라인: -18
- 순 변경: +7

---

## 🔄 단순 리팩토링
변경사항 없음

---

## 🧠 로직 변경사항

### 1. 🔴 사용자 입력 sanitize 추가 (보안 수정)
- **파일**: `src/components/UserProfile.tsx`
- **라인**: 45번째 라인
- **위험도**: 🔴 높음

**기존 로직**:
```typescript
<div>{user.bio}</div>
```

**신규 로직**:
```typescript
<div>{sanitizeHtml(user.bio)}</div>
```

**변경 이유**:
- 사용자가 입력한 bio에 악의적인 스크립트가 포함될 경우 XSS 공격 가능
- sanitizeHtml 함수를 통해 위험한 HTML 요소 제거

**영향 범위**:
- 모든 사용자 bio 표시 시 sanitize 적용
- 기존 HTML 태그 일부가 제거될 수 있음

### 2. HTML sanitize 유틸리티 추가
- **파일**: `src/utils/sanitize.ts`
- **라인**: 1-20번째 라인
- **위험도**: 🟡 보통
- **설명**: HTML sanitize 유틸리티 함수 추가

---

## 🧠 복잡 로직 분석

### 1. XSS 방어를 위한 HTML sanitization 로직 🔴 위험
- **파일**: `src/utils/sanitize.ts`
- **라인**: 5-18번째 라인
- **위험도**: 🔴 높음

**ToT 분석 결과**:

**사고 과정**:
1. DOMPurify 라이브러리를 사용하여 신뢰할 수 있는 sanitization
2. 허용된 태그 화이트리스트 정의 (p, br, strong, em만 허용)
3. 이벤트 핸들러 및 스크립트 태그 완전 제거

**발견된 위험**:
- ⚠️ 과도한 sanitize로 정상 HTML도 제거될 가능성
- ⚠️ 화이트리스트 관리 필요

**권장사항**:
- ✅ sanitize 정책을 설정 파일로 분리 권장
- ✅ 허용된 태그 문서화 필요

---

## 📁 파일 이동 및 순서 변경
변경사항 없음

---

## 📝 상세 변경 내역

### 1. DOMPurify 라이브러리 추가
- **파일**: `package.json`
- **위험도**: 🟢 낮음
- **설명**: DOMPurify 라이브러리 추가

---

## 🎯 리뷰 권장사항

### 🔴 필수 조치
1. **모든 사용자 입력 지점 검토**
   - UserProfile.tsx 외에 사용자 입력을 렌더링하는 모든 컴포넌트 확인
   - 댓글, 게시글, 프로필 정보 등 모든 UGC (User Generated Content) 검증

2. **sanitize 정책 문서화**
   - 허용된 HTML 태그 목록 명시
   - sanitize 동작 방식 개발자 가이드 작성

### 🟡 권장 조치
1. **설정 파일 분리**
   - sanitize 정책을 별도 설정 파일로 분리
   - 필요 시 정책 업데이트 용이

2. **사용자 피드백 메커니즘**
   - 정상 HTML이 제거된 경우 사용자에게 안내
   - 허용되지 않은 태그 사용 시 명확한 오류 메시지

### 🟢 고려 사항
1. **Content Security Policy (CSP) 검토**
   - 추가적인 XSS 방어 레이어로 CSP 헤더 설정 고려

---

## 📋 테스트 권장사항

### 필수 보안 테스트
- [ ] XSS 공격 시도 테스트 (스크립트 태그, 이벤트 핸들러)
- [ ] sanitize 함수 단위 테스트 (허용/차단 태그 검증)
- [ ] 모든 UGC 렌더링 지점 보안 검증

### 회귀 테스트
- [ ] 정상 사용자 입력 (허용된 HTML) 정상 표시 확인
- [ ] 기존 사용자 bio 데이터 정상 표시 확인

### 통합 보안 테스트
- [ ] 실제 사용자 시나리오 기반 XSS 공격 시뮬레이션
- [ ] 침투 테스트 (Penetration Testing) 권장

---

**리뷰 날짜**: 2025-01-17
**분석 모드**: Security Focused (보안 중점 분석)
**리뷰어**: 자동화된 코드 리뷰 시스템

**⚠️ 보안 중요 공지**:
이 PR은 XSS 취약점 수정을 포함하고 있습니다.
1. 모든 보안 테스트 완료 후 승인
2. 배포 후 즉시 사용자 입력 지점 모니터링
3. 보안 팀 최종 승인 필수
```

## Knowledge 파일 역할

### review-template-korean.md
**용도**: 한글 리뷰 보고서 마크다운 템플릿

**주요 내용**:
- 각 섹션별 헤더 및 구조
- 이모지 사용 가이드 (🔴🟡🟢 위험도, ✅⚠️ 체크 항목)
- 코드 블록 형식 (before/after 비교)
- 통계 표시 형식
- 액션 아이템 우선순위 표현

**예시**:
```markdown
## 🧠 로직 변경사항

### {번호}. {변경 제목}
- **파일**: `{파일경로}`
- **라인**: {시작}-{끝}번째 라인
- **위험도**: {🔴|🟡|🟢} {높음|보통|낮음}

**기존 로직**:
\`\`\`typescript
{이전 코드}
\`\`\`

**신규 로직**:
\`\`\`typescript
{새로운 코드}
\`\`\`

**변경 이유**:
{상세 설명}

**영향 범위**:
{영향받는 부분}
```

### korean-tech-terms.md
**용도**: 영문 기술 용어의 일관된 한글 번역 사전

**주요 내용**:
- 공통 기술 용어 (breaking change, refactoring 등)
- 위험도 레벨 표현
- 액션 아이템 우선순위 표현
- 프로젝트 타입 (library, application, monorepo 등)
- 분석 모드 표현

**예시**:
```yaml
# 기술 용어
technical_terms:
  breaking_change: "브레이킹 체인지"
  refactoring: "리팩토링"
  merge_conflict: "머지 충돌"
  type_safety: "타입 안전성"
  code_coverage: "코드 커버리지"
  unit_test: "단위 테스트"
  integration_test: "통합 테스트"
  regression_test: "회귀 테스트"

# 위험도
risk_levels:
  critical: "🔴 위험"
  high: "🟠 높음"
  medium: "🟡 보통"
  low: "🟢 낮음"

# 액션 우선순위
action_priorities:
  must_do: "🔴 필수 조치"
  should_do: "🟡 권장 조치"
  consider: "🟢 고려 사항"

# 분석 모드
analysis_modes:
  comprehensive: "종합 분석 (Comprehensive)"
  standard: "표준 분석 (Standard)"
  quick: "빠른 분석 (Quick)"
  security_focused: "보안 중점 분석 (Security Focused)"
```

---

## 통합 가능성 및 독립 유지 이유

### 독립 스킬로 유지하는 이유

**1. 범용성 (Universal Applicability)**:
- 모든 리뷰 스킬의 결과를 한글로 변환 가능
- code-quality-reviewer, code-impact-evaluator, 기타 리뷰 도구 모두와 조합 가능
- 입력 형식만 맞으면 어떤 분석 결과든 한글 보고서로 생성

**2. 문화적 특화 (Cultural Specialization)**:
- 한국어 기술 문서 스타일 가이드 독립 관리
- 기술 용어의 일관된 번역 (지속적 업데이트 필요)
- 한국 팀의 커뮤니케이션 문화에 맞춘 보고서 형식

**3. 재사용성 (Reusability)**:
- code-quality-reviewer → korean-review-reporter: 품질 리뷰 한글 보고서
- code-impact-evaluator → korean-review-reporter: 영향도 분석 한글 보고서
- 종합 리뷰 → korean-review-reporter: 통합 한글 보고서

**4. 확장성 (Extensibility)**:
- 향후 english-review-reporter 등 다른 언어 보고서 스킬 추가 시 패턴 재사용
- 언어별 스타일 가이드 독립 관리 가능

### 통합하지 않는 이유

#### ❌ code-quality-reviewer에 통합하지 않는 이유:
- code-quality-reviewer는 언어 중립적이어야 함
- 한글 보고서는 한국 팀 전용 기능
- 다른 언어 보고서 추가 시 복잡도 증가

#### ❌ 새로운 report-generator로 확장하지 않는 이유 (현재):
- 한글 보고서 수요가 주요 사용 케이스
- 영문 보고서 필요성 아직 미확인
- 단일 책임 유지 (한글 기술 문서 생성)

### 다른 스킬과의 협업 패턴

#### 패턴 1: 품질 리뷰 한글 보고서
```bash
# 1단계: 품질 검사
code-quality-reviewer → quality_result.json

# 2단계: 한글 보고서 생성
korean-review-reporter quality_result.json → quality_report_ko.md
```

#### 패턴 2: 영향도 분석 한글 보고서
```bash
# 1단계: 영향도 평가
code-impact-evaluator → impact_result.json

# 2단계: 한글 보고서 생성
korean-review-reporter impact_result.json → impact_report_ko.md
```

#### 패턴 3: 종합 리뷰 (품질 + 영향도)
```bash
# 1단계: 품질 검사
code-quality-reviewer → quality_result.json

# 2단계: 영향도 평가
code-impact-evaluator → impact_result.json

# 3단계: 통합 한글 보고서
korean-review-reporter quality_result.json impact_result.json → comprehensive_report_ko.md
```

### 향후 확장 가능성

**장기 비전 (2-3개월 후)**:
```
report-generator (언어 중립적 보고서 생성기)
  ├── korean-review-reporter (한글 전용)
  ├── english-review-reporter (영문 전용)
  └── multilingual-reporter (다국어 지원)
```

**현재 유보 이유**:
- 영문 보고서 수요 미확인
- 한글 보고서 품질 우선 개선
- 단순함 유지 (YAGNI 원칙)

## 에러 처리

```yaml
error_handling:
  severity_high:
    conditions:
      - 입력 데이터 구조 불일치 (예상 JSON 스키마 위배)
      - 필수 섹션 누락 (impact_analysis, risk_score 등)
      - 번역 템플릿 파일 누락 (knowledge/translation_templates.yaml)
      - 마크다운 생성 실패 (파일 쓰기 권한 문제)
    action: |
      ❌ 치명적 오류 - 한글 보고서 생성 중단
      → 입력 데이터 스키마 검증: {input_schema}
      → 필수 섹션 확인: impact_analysis, risk_score, recommendations
      → 템플릿 파일 존재 확인: ls knowledge/translation_templates.yaml
      → 파일 쓰기 권한 확인: touch test_report.md
      → 재실행: 입력 데이터 수정 후 korean-review-reporter 호출
    examples:
      - condition: "입력 데이터 구조 불일치"
        message: "❌ 오류: 입력 데이터에 'impact_analysis' 필드가 없습니다"
        recovery: "code-impact-evaluator 출력 확인 후 재실행"
      - condition: "템플릿 파일 누락"
        message: "❌ 오류: knowledge/translation_templates.yaml을 찾을 수 없습니다"
        recovery: "템플릿 파일 복원 또는 스킬 재설치"

  severity_medium:
    conditions:
      - 일부 섹션 번역 실패 (알 수 없는 기술 용어)
      - 코드 블록 포맷팅 이슈
      - 선택적 섹션 누락 (test_recommendations 등)
      - 번역 품질 낮음 (기계 번역 감지)
    action: |
      ⚠️  경고 - 부분 번역으로 보고서 생성
      1. 번역 실패한 섹션은 원문 그대로 포함
      2. 보고서 상단에 경고 추가:
         > ⚠️  주의: 일부 섹션은 번역되지 않았습니다
         > → 다음 섹션 원문 포함: {untranslated_sections}
      3. 알 수 없는 용어는 괄호로 원문 병기
      4. 사용자에게 수동 검토 요청
    fallback_values:
      untranslated_section: "{ORIGINAL_TEXT}"
      technical_term: "{한글번역} ({original})"
    examples:
      - condition: "알 수 없는 기술 용어"
        message: "⚠️  경고: 'React Server Components'의 적절한 번역을 찾을 수 없습니다"
        fallback: "리액트 서버 컴포넌트 (React Server Components)로 표기"
      - condition: "선택적 섹션 누락"
        message: "⚠️  경고: test_recommendations 섹션이 입력 데이터에 없습니다"
        fallback: "해당 섹션 생략 → 보고서에 포함하지 않음"

  severity_low:
    conditions:
      - 번역 스타일 불일치 (존댓말 vs 평서체)
      - 마크다운 포맷팅 미세 조정 필요
      - 링크 텍스트 번역 생략
      - 이모지 위치 조정
    action: |
      ℹ️  정보: 미세 조정 필요 - 자동 처리
      → 기본 스타일 (존댓말) 적용
      → 마크다운 자동 정리
      → 링크는 원문 유지 (URL은 번역 불필요)
      → 이모지는 섹션 제목 앞에 배치
    examples:
      - condition: "스타일 불일치"
        auto_handling: "전체 보고서를 존댓말로 통일 (기본 스타일)"
      - condition: "링크 텍스트"
        auto_handling: "링크 텍스트는 원문 유지: [React Docs](https://react.dev)"
```

---

> **Best Practice**: 일관된 번역과 형식으로 가독성 향상
> **Integration**: code-impact-evaluator 스킬 출력을 입력으로 사용
