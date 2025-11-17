# PR 설명 템플릿

## 기본 템플릿 구조

```markdown
## 📋 TL;DR
[한 줄 요약: 이 PR의 핵심 변경사항]

## 🔄 변경사항 분석

### ✨ 새로운 기능
- **기능명**: 간단한 설명
- **다른 기능**: 간단한 설명

### 🐛 버그 수정
- **수정사항**: 문제 해결 내용
- **영향도**: 사용자에게 미치는 영향

### 🚀 개선사항
- **성능**: 성능 향상 내용
- **리팩토링**: 코드 구조 개선

### 💥 Breaking Changes (해당시)
- **변경사항**: 기존 API 변경 내용
- **마이그레이션**: 업데이트 방법

## 🔍 주요 변경 파일
- `packages/xxx/src/component.ts`: 주요 로직 변경
- `packages/yyy/src/types.ts`: 타입 정의 업데이트

## 🧪 테스트 확인사항
- [ ] 기존 기능 회귀 테스트
- [ ] 새로운 기능 동작 확인
- [ ] TypeScript 컴파일 성공
- [ ] 린트 검사 통과

## 📦 영향받는 패키지
- `@canard/schema-form`: 버전 x.x.x → x.x.x
- `@winglet/common-utils`: 새로운 유틸리티 추가

---

🤖 이 PR은 자동화된 분석을 통해 생성되었습니다.
```

## 섹션별 상세 가이드

### 1. TL;DR (Too Long; Didn't Read)

**목적**: 리뷰어가 30초 안에 PR의 핵심을 파악할 수 있도록

**작성 규칙**:
- 1-2문장으로 간결하게
- 무엇을, 왜 변경했는지 명시
- 기술 용어보다 비즈니스 가치 중심

**좋은 예시**:
```markdown
## 📋 TL;DR
비동기 검증 기능을 추가하여 폼 제출 전 서버 검증이 가능해졌으며, 기존 동기 검증과 완전히 호환됩니다.
```

**나쁜 예시**:
```markdown
## 📋 TL;DR
코드 변경했습니다.  # 너무 모호
```

### 2. 변경사항 분석

#### 2.1 새로운 기능 (✨)

**포함 조건**:
- 사용자가 사용할 수 있는 새로운 기능
- 새로운 API 추가
- 새로운 설정 옵션

**작성 형식**:
```markdown
### ✨ 새로운 기능
- **AsyncValidator 인터페이스**: Promise 기반 비동기 검증 지원
  - `validateAsync(value): Promise<ValidationResult>` 메서드 추가
  - 서버 검증, 중복 체크 등 비동기 작업 처리 가능
- **에러 핸들링**: 비동기 검증 실패 시 명확한 에러 메시지 제공
```

#### 2.2 버그 수정 (🐛)

**포함 조건**:
- 기존 기능의 오동작 수정
- 엣지 케이스 처리
- 성능 이슈 해결

**작성 형식**:
```markdown
### 🐛 버그 수정
- **입력 검증 경쟁 조건**: 빠른 연속 입력 시 검증 순서 문제 해결
  - 문제: 이전 검증이 완료되기 전 새 검증 시작
  - 해결: 진행 중인 검증 취소 후 최신 검증만 수행
  - 영향: 사용자 경험 개선, 불필요한 서버 요청 감소
```

#### 2.3 개선사항 (🚀)

**포함 조건**:
- 성능 최적화
- 코드 리팩토링
- 개발자 경험 개선

**작성 형식**:
```markdown
### 🚀 개선사항
- **성능**: 폼 렌더링 최적화로 50% 속도 향상
  - useMemo를 사용한 검증 결과 캐싱
  - 불필요한 리렌더링 제거
- **리팩토링**: 검증 로직을 별도 모듈로 분리
  - 테스트 용이성 향상
  - 코드 재사용성 증가
```

#### 2.4 Breaking Changes (💥)

**포함 조건** (하나라도 해당 시):
- 기존 API 제거 또는 시그니처 변경
- 기본 동작 방식 변경
- 필수 의존성 추가/변경
- 설정 파일 형식 변경

**작성 형식**:
```markdown
### 💥 Breaking Changes
- **validateSync 메서드 제거**
  - 이유: 비동기 검증으로 통합하여 일관성 향상
  - 영향: validateSync() 사용 코드 모두 수정 필요
  - 마이그레이션:
    ```typescript
    // Before
    const result = validator.validateSync(value);

    // After
    const result = await validator.validate(value);
    ```
```

### 3. 주요 변경 파일

**목적**: 리뷰어가 어떤 파일을 집중적으로 봐야 하는지 안내

**작성 규칙**:
- 핵심 로직 변경 파일 우선
- 파일 경로 + 변경 내용 간략 설명
- 중요도 순으로 정렬

**작성 형식**:
```markdown
## 🔍 주요 변경 파일
- `packages/schema-form/src/validator/AsyncValidator.ts`: 비동기 검증 핵심 로직 (신규)
- `packages/schema-form/src/types/index.ts`: AsyncValidator 인터페이스 정의 추가
- `packages/schema-form/src/FormField.tsx`: 비동기 검증 통합 (45-67번째 라인)
- `packages/schema-form-react-plugin/src/useValidation.ts`: 훅 로직 업데이트
```

### 4. 테스트 확인사항

**목적**: 리뷰어와 QA 팀에게 테스트 가이드 제공

**작성 규칙**:
- 체크박스 형식 사용
- 구체적이고 실행 가능한 항목
- 회귀 테스트 포함

**기본 항목**:
```markdown
## 🧪 테스트 확인사항
- [ ] 기존 기능 회귀 테스트
- [ ] 새로운 기능 동작 확인
- [ ] TypeScript 컴파일 성공
- [ ] 린트 검사 통과
```

**맞춤 항목 추가**:
```markdown
## 🧪 테스트 확인사항
- [ ] 기존 동기 검증 기능 정상 동작 (회귀 테스트)
- [ ] 비동기 검증 성공 시나리오 테스트
- [ ] 비동기 검증 실패 시 에러 처리 확인
- [ ] Promise rejection 시 폴백 동작 검증
- [ ] 연속 입력 시 경쟁 조건 해결 확인
- [ ] TypeScript 타입 체크 통과
- [ ] 단위 테스트 커버리지 80% 이상 유지
- [ ] E2E 테스트: 실제 폼 제출 시나리오
```

### 5. 영향받는 패키지

**목적**: 모노레포에서 어떤 패키지가 영향받는지 명시

**작성 규칙**:
- 패키지명 + 변경 유형
- 버전 변경 필요성 표시
- 의존 패키지 명시

**작성 형식**:
```markdown
## 📦 영향받는 패키지
- `@canard/schema-form`: 새로운 기능 추가 (버전: 0.8.5 → 0.9.0, Minor 업)
- `@canard/schema-form-react-plugin`: 타입 정의 업데이트 필요 (버전: 0.5.2 → 0.5.3, Patch)
- `@canard/schema-form-vue-plugin`: 영향 없음 (선택적 기능)
```

## 템플릿 생성 알고리즘

```typescript
function generatePRDescription(input: {
  changes: ChangesSummary;
  review: ReviewResult;
}): string {
  const sections: string[] = [];

  // 1. TL;DR 생성
  sections.push(generateTLDR(input));

  // 2. 변경사항 분석
  const changesSection = [];

  if (input.review.newFeatures.length > 0) {
    changesSection.push(formatNewFeatures(input.review.newFeatures));
  }

  if (input.review.bugFixes.length > 0) {
    changesSection.push(formatBugFixes(input.review.bugFixes));
  }

  if (input.review.refactorings.length > 0) {
    changesSection.push(formatImprovements(input.review.refactorings));
  }

  if (input.review.breakingChanges.length > 0) {
    changesSection.push(formatBreakingChanges(input.review.breakingChanges));
  }

  sections.push("## 🔄 변경사항 분석\n\n" + changesSection.join("\n\n"));

  // 3. 주요 변경 파일
  sections.push(formatKeyFiles(input.changes.files));

  // 4. 테스트 확인사항
  sections.push(formatTestChecklist(input.review.testRecommendations));

  // 5. 영향받는 패키지
  sections.push(formatAffectedPackages(input.review.affectedPackages));

  // 6. 푸터
  sections.push("---\n\n🤖 이 PR은 자동화된 분석을 통해 생성되었습니다.");

  return sections.join("\n\n");
}
```

## 실제 예시

### 예시 1: 새 기능 추가

```markdown
## 📋 TL;DR
비동기 검증 기능을 추가하여 서버 검증 및 중복 체크가 가능해졌으며, 기존 동기 검증과 완전 호환됩니다.

## 🔄 변경사항 분석

### ✨ 새로운 기능
- **AsyncValidator 인터페이스**: Promise 기반 비동기 검증 지원
  - `validateAsync(value): Promise<ValidationResult>` 메서드 추가
  - 서버 검증, 중복 체크 등 비동기 작업 처리 가능
- **에러 핸들링**: 비동기 검증 실패 시 명확한 에러 메시지 제공
  - Promise rejection 자동 처리
  - 타임아웃 설정 지원 (기본 5초)

### 🚀 개선사항
- **검증 로직 분리**: 동기/비동기 검증 로직을 별도 모듈로 분리
  - 테스트 용이성 향상
  - 코드 재사용성 증가
- **타입 안전성**: 완전한 TypeScript 타입 지원

## 🔍 주요 변경 파일
- `packages/schema-form/src/validator/AsyncValidator.ts`: 비동기 검증 핵심 로직 (신규)
- `packages/schema-form/src/types/index.ts`: AsyncValidator 인터페이스 정의 추가
- `packages/schema-form/src/FormField.tsx`: 비동기 검증 통합 (45-67번째 라인)
- `packages/schema-form-react-plugin/src/useValidation.ts`: 훅 로직 업데이트

## 🧪 테스트 확인사항
- [ ] 기존 동기 검증 기능 정상 동작 (회귀 테스트)
- [ ] 비동기 검증 성공 시나리오 테스트
- [ ] 비동기 검증 실패 시 에러 처리 확인
- [ ] Promise rejection 시 폴백 동작 검증
- [ ] 연속 입력 시 경쟁 조건 해결 확인
- [ ] TypeScript 타입 체크 통과
- [ ] 단위 테스트 커버리지 80% 이상 유지
- [ ] E2E 테스트: 실제 폼 제출 시나리오

## 📦 영향받는 패키지
- `@canard/schema-form`: 새로운 기능 추가 (버전: 0.8.5 → 0.9.0, Minor 업)
- `@canard/schema-form-react-plugin`: 타입 정의 업데이트 필요 (버전: 0.5.2 → 0.5.3, Patch)
- `@canard/schema-form-vue-plugin`: 영향 없음 (선택적 기능)

---

🤖 이 PR은 자동화된 분석을 통해 생성되었습니다.
```

### 예시 2: Breaking Change

```markdown
## 📋 TL;DR
검증 API를 비동기로 통합하여 일관성을 향상시켰으나, `validateSync` 메서드가 제거되어 기존 코드 수정이 필요합니다.

## 🔄 변경사항 분석

### 💥 Breaking Changes
- **validateSync 메서드 제거**
  - 이유: 비동기 검증으로 통합하여 일관성 향상
  - 영향: validateSync() 사용 코드 모두 수정 필요
  - 마이그레이션:
    ```typescript
    // Before
    const result = validator.validateSync(value);
    if (result.valid) { /* ... */ }

    // After
    const result = await validator.validate(value);
    if (result.valid) { /* ... */ }
    ```

### ✨ 새로운 기능
- **통합 검증 API**: 동기/비동기 검증을 하나의 인터페이스로 통합
  - 내부적으로 동기 검증은 즉시 해결되는 Promise 반환
  - 일관된 에러 처리 방식

## 🔍 주요 변경 파일
- `packages/schema-form/src/validator/Validator.ts`: validateSync 제거, validate로 통합
- `packages/schema-form/src/types/index.ts`: Validator 인터페이스 업데이트
- `packages/schema-form/__tests__/validator.test.ts`: 테스트 업데이트

## 🧪 테스트 확인사항
- [ ] 모든 동기 검증 시나리오가 async/await로 변환되어 동작하는지 확인
- [ ] 기존 테스트가 Promise 기반으로 업데이트되었는지 확인
- [ ] 에러 처리가 올바르게 동작하는지 검증
- [ ] TypeScript 컴파일 성공
- [ ] 기존 사용자 코드 마이그레이션 가이드 테스트

## 📦 영향받는 패키지
- `@canard/schema-form`: Breaking change (버전: 0.8.5 → 1.0.0, Major 업)
- `@canard/schema-form-react-plugin`: 업데이트 필요 (버전: 0.5.2 → 1.0.0, Major 업)
- `@canard/schema-form-vue-plugin`: 업데이트 필요 (버전: 0.4.1 → 1.0.0, Major 업)

---

🤖 이 PR은 자동화된 분석을 통해 생성되었습니다.
```

## 품질 체크리스트

생성된 PR 설명이 다음 기준을 만족하는지 확인:

- [ ] TL;DR이 1-2문장으로 핵심을 명확히 전달
- [ ] 모든 주요 변경사항이 적절한 섹션에 포함
- [ ] Breaking changes가 있다면 마이그레이션 가이드 포함
- [ ] 주요 변경 파일 목록이 명확함
- [ ] 테스트 확인사항이 구체적이고 실행 가능함
- [ ] 영향받는 패키지와 버전 변경이 명시됨
- [ ] 마크다운 형식이 올바름 (체크박스, 코드 블록 등)
- [ ] 전문적이고 명확한 언어 사용
- [ ] 이모지가 적절히 사용되어 가독성 향상

## 참고 자료

- [GitHub PR Best Practices](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/getting-started/best-practices-for-pull-requests)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Keep a Changelog](https://keepachangelog.com/)
