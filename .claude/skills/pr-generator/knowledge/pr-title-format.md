# PR 제목 형식 가이드

## 기본 형식

```
[<변경유형>](<범위>): <간결한 설명>
```

## 변경 유형 (Type)

변경사항의 성격에 따라 우선순위대로 선택:

### 1. Breaking (최우선)
- **사용 시점**: Breaking changes가 하나라도 있을 때
- **예시**:
  - `[Breaking](schema-form): Remove deprecated validateSync method`
  - `[Breaking](api): Change authentication flow to OAuth2`

### 2. Feat / Feature
- **사용 시점**: 새로운 기능 추가
- **예시**:
  - `[Feat](schema-form): Add async validation support`
  - `[Feature](modal): Implement queue-based modal system`

### 3. Fix
- **사용 시점**: 버그 수정
- **예시**:
  - `[Fix](schema-form): Resolve input validation race condition`
  - `[Fix](parser): Handle edge case in JSON parsing`

### 4. Refactor
- **사용 시점**: 로직 변경 없는 구조 개선
- **예시**:
  - `[Refactor](schema-form): Extract validation logic to separate module`
  - `[Refactor](utils): Simplify error handling pattern`

### 5. Perf
- **사용 시점**: 성능 개선
- **예시**:
  - `[Perf](schema-form): Optimize form rendering with memoization`
  - `[Perf](cache): Reduce memory usage in LRU cache`

### 6. Docs
- **사용 시점**: 문서만 변경
- **예시**:
  - `[Docs](readme): Add async validation examples`
  - `[Docs](api): Update installation guide`

### 7. Test
- **사용 시점**: 테스트 코드만 추가/수정
- **예시**:
  - `[Test](schema-form): Add edge case tests for async validators`
  - `[Test](integration): Improve E2E test coverage`

### 8. Chore
- **사용 시점**: 빌드, 설정, 의존성 변경
- **예시**:
  - `[Chore](deps): Update TypeScript to 5.3.0`
  - `[Chore](build): Configure Rollup for tree-shaking`

### 9. Style
- **사용 시점**: 코드 스타일만 변경 (로직 무변경)
- **예시**:
  - `[Style](eslint): Apply new formatting rules`
  - `[Style](prettier): Update code style across project`

## 범위 (Scope)

변경된 영역을 명시:

### 패키지 기반 범위
```
schema-form          # @canard/schema-form
promise-modal        # @lerx/promise-modal
common-utils         # @winglet/common-utils
react-plugin         # @canard/schema-form-react-plugin
```

### 기능 기반 범위
```
validation           # 검증 기능
parser               # 파서 기능
cache                # 캐시 시스템
api                  # API 레이어
```

### 영역 기반 범위
```
monorepo             # 모노레포 전체 영향
root                 # 루트 설정
config               # 전역 설정
ci                   # CI/CD 파이프라인
```

### 다중 패키지 변경 시
- **주요 패키지 우선**: 가장 큰 변경이 있는 패키지명 사용
- **공통 주제**: 여러 패키지가 동일 목적으로 변경 → 기능명 사용
- **전역 영향**: 모든 패키지 영향 → `monorepo` 사용

## 설명 (Description)

### 작성 규칙
1. **동사 시작**: 명령형 (Add, Fix, Update, Remove 등)
2. **소문자 시작**: 첫 글자 소문자 (예외: 고유명사)
3. **마침표 없음**: 문장 종료 마침표 제거
4. **간결성**: 50-72자 이내 (최대 72자)
5. **명확성**: 무엇을 했는지 명확히 표현

### 좋은 예시
```
✅ Add async validation support
✅ Fix input validation race condition
✅ Remove deprecated validateSync method
✅ Update TypeScript to 5.3.0
✅ Optimize form rendering with memoization
```

### 나쁜 예시
```
❌ add async validation support          # 첫 글자 대문자 필요
❌ Fixes bug.                             # 마침표 불필요, 모호함
❌ Update                                 # 무엇을 업데이트했는지 불명확
❌ Added some new features and fixed bugs # 너무 길고 구체적이지 않음
❌ WIP                                    # 의미 없는 제목
```

## 제목 생성 알고리즘

```typescript
function generatePRTitle(input: {
  breakingChanges: string[];
  newFeatures: string[];
  bugFixes: string[];
  refactorings: string[];
  affectedPackages: string[];
}): string {
  // 1. 변경 유형 결정
  let type: string;
  if (input.breakingChanges.length > 0) {
    type = "Breaking";
  } else if (input.newFeatures.length > 0) {
    type = "Feat";
  } else if (input.bugFixes.length > 0) {
    type = "Fix";
  } else if (input.refactorings.length > 0) {
    type = "Refactor";
  } else {
    type = "Chore";
  }

  // 2. 범위 결정
  let scope: string;
  if (input.affectedPackages.length === 1) {
    scope = extractPackageName(input.affectedPackages[0]);
  } else if (input.affectedPackages.length > 1) {
    scope = findCommonScope(input.affectedPackages) || "monorepo";
  } else {
    scope = "root";
  }

  // 3. 설명 생성
  let description: string;
  if (input.newFeatures.length > 0) {
    description = summarizeChanges(input.newFeatures);
  } else if (input.bugFixes.length > 0) {
    description = summarizeChanges(input.bugFixes);
  } else {
    description = "Update dependencies and configurations";
  }

  // 4. 제목 조합
  return `[${type}](${scope}): ${description}`;
}
```

## 실제 예시

### 예시 1: 새 기능 추가
```
입력:
- newFeatures: ["비동기 검증 기능"]
- affectedPackages: ["@canard/schema-form"]
- breakingChanges: []

출력:
[Feat](schema-form): Add async validation support
```

### 예시 2: Breaking Change
```
입력:
- breakingChanges: ["validateSync 메서드 제거"]
- affectedPackages: ["@canard/schema-form", "@canard/schema-form-react-plugin"]
- newFeatures: ["Promise 기반 검증"]

출력:
[Breaking](schema-form): Remove deprecated validateSync method
```

### 예시 3: 버그 수정
```
입력:
- bugFixes: ["입력 검증 경쟁 조건 해결"]
- affectedPackages: ["@canard/schema-form"]
- breakingChanges: []

출력:
[Fix](schema-form): Resolve input validation race condition
```

### 예시 4: 다중 패키지 리팩토링
```
입력:
- refactorings: ["의존성 최적화", "빌드 설정 개선"]
- affectedPackages: ["@canard/schema-form", "@lerx/promise-modal", "@winglet/common-utils"]
- breakingChanges: []

출력:
[Refactor](monorepo): Optimize dependencies and build configuration
```

## 검증 체크리스트

생성된 제목이 다음 기준을 만족하는지 확인:

- [ ] 형식: `[Type](scope): description` 준수
- [ ] 타입: 변경사항에 맞는 올바른 타입 선택
- [ ] 범위: 명확하고 의미 있는 범위 지정
- [ ] 설명: 동사로 시작, 소문자, 마침표 없음
- [ ] 길이: 72자 이내
- [ ] 명확성: 변경 내용을 정확히 반영
- [ ] 일관성: 프로젝트 컨벤션 준수

## 참고 자료

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Angular Commit Message Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)
- [Semantic Versioning](https://semver.org/)
