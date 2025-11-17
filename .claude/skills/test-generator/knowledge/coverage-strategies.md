# 테스트 커버리지 전략 가이드

> 효과적인 테스트 커버리지 달성을 위한 전략 및 실행 계획

## 📊 커버리지 메트릭 이해

### 커버리지 유형

#### 1. Line Coverage (라인 커버리지)

**정의**: 실행된 코드 라인 비율

```typescript
function calculateDiscount(price: number, rate: number): number {
  if (rate < 0 || rate > 1) {    // Line 1
    throw new Error('Invalid rate'); // Line 2
  }
  return price * (1 - rate);     // Line 3
}

// 테스트 1개만 있을 경우
test('should calculate discount', () => {
  expect(calculateDiscount(100, 0.1)).toBe(90); // Line 1, 3 실행 (66% 커버리지)
});

// Line 2도 커버하려면
test('should throw on invalid rate', () => {
  expect(() => calculateDiscount(100, -0.1)).toThrow(); // Line 1, 2 실행
});

// 결과: 3/3 라인 = 100% 라인 커버리지
```

#### 2. Branch Coverage (분기 커버리지)

**정의**: 조건문의 모든 경로 실행 비율

```typescript
function getUserStatus(age: number, isPremium: boolean): string {
  if (age >= 18 && isPremium) {
    return 'Adult Premium';
  } else if (age >= 18) {
    return 'Adult';
  } else {
    return 'Minor';
  }
}

// Branch 1: age >= 18 && isPremium === true
// Branch 2: age >= 18 && isPremium === false
// Branch 3: age < 18

// 완전한 분기 커버리지를 위한 테스트
test('should return Adult Premium', () => {
  expect(getUserStatus(25, true)).toBe('Adult Premium'); // Branch 1
});

test('should return Adult', () => {
  expect(getUserStatus(25, false)).toBe('Adult'); // Branch 2
});

test('should return Minor', () => {
  expect(getUserStatus(15, false)).toBe('Minor'); // Branch 3
});

// 결과: 3/3 분기 = 100% 분기 커버리지
```

#### 3. Function Coverage (함수 커버리지)

**정의**: 호출된 함수 비율

```typescript
// utils.ts
export function add(a: number, b: number): number {
  return a + b;
}

export function subtract(a: number, b: number): number {
  return a - b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}

// add, multiply만 테스트한 경우
test('add', () => expect(add(1, 2)).toBe(3));
test('multiply', () => expect(multiply(2, 3)).toBe(6));

// 결과: 2/3 함수 = 66% 함수 커버리지
```

#### 4. Statement Coverage (구문 커버리지)

**정의**: 실행된 명령문 비율 (라인 커버리지와 유사하지만 더 세밀)

```typescript
function processData(data: number[]): number[] {
  return data
    .filter(n => n > 0)     // Statement 1
    .map(n => n * 2)        // Statement 2
    .sort((a, b) => a - b); // Statement 3
}

test('should process data', () => {
  expect(processData([1, -1, 3])).toEqual([2, 6]); // 3/3 구문 실행
});

// 결과: 100% 구문 커버리지
```

---

## 🎯 커버리지 목표 설정

### 프로젝트 타입별 목표

| 프로젝트 타입 | Line Coverage | Branch Coverage | Function Coverage |
|-------------|---------------|-----------------|-------------------|
| **라이브러리** | 90-100% | 85-95% | 95-100% |
| **프레임워크** | 85-95% | 80-90% | 90-100% |
| **애플리케이션** | 70-85% | 65-80% | 80-90% |
| **레거시 코드** | 50-70% (점진적 향상) | 45-65% | 60-75% |

### 코드 영역별 목표

#### High Priority (높은 우선순위)

**목표**: 90-100% 커버리지

- **비즈니스 로직**: 핵심 기능, 결제, 인증
- **보안 관련 코드**: 인증, 권한 부여, 암호화
- **데이터 검증**: 입력 검증, sanitization
- **API 엔드포인트**: 공개 API, 중요 엔드포인트

```typescript
// 예시: 결제 로직 (100% 커버리지 목표)
describe('PaymentService', () => {
  test('should process valid payment', () => { /* ... */ });
  test('should reject invalid card', () => { /* ... */ });
  test('should handle insufficient funds', () => { /* ... */ });
  test('should retry on network error', () => { /* ... */ });
  test('should refund on cancellation', () => { /* ... */ });
  // ... 모든 경로 테스트
});
```

#### Medium Priority (중간 우선순위)

**목표**: 70-90% 커버리지

- **유틸리티 함수**: 재사용 가능한 헬퍼 함수
- **UI 컴포넌트**: 재사용 컴포넌트
- **State 관리**: Redux, Context 등
- **데이터 변환**: 포매터, 파서

```typescript
// 예시: 유틸리티 함수 (80% 커버리지 목표)
describe('formatDate', () => {
  test('should format valid date', () => { /* ... */ });
  test('should handle invalid date', () => { /* ... */ });
  test('should respect timezone', () => { /* ... */ });
  // 주요 경로만 커버
});
```

#### Low Priority (낮은 우선순위)

**목표**: 50-70% 커버리지

- **UI 스타일링**: CSS-in-JS, styled-components
- **간단한 presentational 컴포넌트**: 버튼, 텍스트
- **설정 파일**: config, constants
- **타입 정의**: interface, type

---

## 📈 커버리지 개선 전략

### 전략 1: 점진적 개선 (Incremental Improvement)

**적용 시나리오**: 레거시 코드베이스

```bash
# 1단계: 현재 커버리지 측정
npm run test -- --coverage

# 현재 상태: 45% 커버리지

# 2단계: 목표 설정 (3개월 계획)
# Month 1: 45% → 55% (+10%)
# Month 2: 55% → 65% (+10%)
# Month 3: 65% → 75% (+10%)

# 3단계: 우선순위 영역 식별
# - 비즈니스 로직: 현재 30% → 목표 80%
# - 유틸리티: 현재 60% → 목표 85%
# - UI 컴포넌트: 현재 40% → 목표 60%

# 4단계: 주간 스프린트 계획
# Week 1: PaymentService 테스트 작성 (예상 +5%)
# Week 2: ValidationUtils 테스트 작성 (예상 +3%)
# Week 3: UserForm 컴포넌트 테스트 (예상 +2%)
```

### 전략 2: 새 코드 우선 (New Code First)

**적용 시나리오**: 개발 중인 기능

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // 새 코드에 대해서만 100% 커버리지 강제
      lines: 100,
      branches: 100,
      functions: 100,
      statements: 100,
      // 레거시 코드 제외
      exclude: [
        '**/legacy/**',
        '**/deprecated/**'
      ]
    }
  }
});
```

**CI/CD 통합**:
```yaml
# .github/workflows/test.yml
name: Test Coverage

on: [pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0  # 모든 히스토리 가져오기

      - name: Run tests
        run: npm run test -- --coverage

      - name: Check coverage on changed files only
        run: |
          # 변경된 파일에 대해서만 커버리지 체크
          git diff --name-only origin/main...HEAD > changed-files.txt
          npm run coverage:check -- --files changed-files.txt --threshold 80
```

### 전략 3: 위험 기반 테스트 (Risk-Based Testing)

**적용 시나리오**: 제한된 리소스

```typescript
// 위험도 매트릭스
const RISK_MATRIX = {
  HIGH: {
    criticality: 'high',    // 시스템 영향도 높음
    complexity: 'high',     // 복잡도 높음
    changeFrequency: 'high', // 변경 빈도 높음
    coverageTarget: 95      // 목표 커버리지 95%
  },
  MEDIUM: {
    criticality: 'medium',
    complexity: 'medium',
    changeFrequency: 'medium',
    coverageTarget: 80
  },
  LOW: {
    criticality: 'low',
    complexity: 'low',
    changeFrequency: 'low',
    coverageTarget: 60
  }
};

// 예시: 코드 영역 분류
const codeAreas = [
  { name: 'PaymentService', risk: 'HIGH', currentCoverage: 85, target: 95 },
  { name: 'UserProfile', risk: 'MEDIUM', currentCoverage: 70, target: 80 },
  { name: 'ThemeToggle', risk: 'LOW', currentCoverage: 50, target: 60 }
];

// 우선순위 계산
codeAreas
  .map(area => ({
    ...area,
    gap: area.target - area.currentCoverage,
    priority: area.risk === 'HIGH' ? 1 : area.risk === 'MEDIUM' ? 2 : 3
  }))
  .sort((a, b) => a.priority - b.priority || b.gap - a.gap);

// 결과: PaymentService 먼저 개선 (HIGH risk, 10% gap)
```

### 전략 4: Mutation Testing (변이 테스트)

**적용 시나리오**: 테스트 품질 검증

```bash
# Stryker (Mutation Testing Tool) 설치
npm install --save-dev @stryker-mutator/core @stryker-mutator/typescript-checker

# stryker.config.json
{
  "mutator": "typescript",
  "packageManager": "npm",
  "reporters": ["html", "clear-text", "progress"],
  "testRunner": "vitest",
  "coverageAnalysis": "perTest",
  "mutate": [
    "src/**/*.ts",
    "!src/**/*.test.ts"
  ]
}

# 실행
npx stryker run

# 결과 예시:
# Mutation Score: 75% (75/100 mutants killed)
# - 코드는 100% 커버되지만 테스트가 약함
# - 25개 mutant가 살아남음 → 테스트 개선 필요
```

**Mutation 예시**:
```typescript
// 원본 코드
function isAdult(age: number): boolean {
  return age >= 18; // ← Mutant: >= → >
}

// 테스트 1 (약한 테스트)
test('should return true for 20', () => {
  expect(isAdult(20)).toBe(true); // mutant도 통과! (20 > 18)
});

// 테스트 2 (강한 테스트)
test('should return true for exactly 18', () => {
  expect(isAdult(18)).toBe(true); // mutant는 실패! (18 > 18 === false)
});
```

---

## 🔍 커버되지 않은 코드 찾기

### 방법 1: 커버리지 리포트 분석

```bash
# HTML 리포트 생성
npm run test -- --coverage --coverage.reporter=html

# coverage/index.html 열기
# - 빨간색: 커버되지 않은 라인
# - 노란색: 부분적으로 커버된 라인 (조건문)
# - 초록색: 완전히 커버된 라인
```

**리포트 읽기**:
```
File                | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
--------------------|---------|----------|---------|---------|------------------
src/utils/math.ts   |   80.00 |    66.67 |   75.00 |   80.00 | 15-17, 25
                                               ^
                                               └─ 15~17번, 25번 라인 미커버
```

### 방법 2: IDE 통합 (VS Code)

```json
// .vscode/settings.json
{
  "vitest.coverage.enabled": true,
  "vitest.coverage.showGutterCoverage": true,
  "vitest.coverage.onTestRunComplete": true
}

// 코드 옆에 커버리지 표시
// ✅ 초록: 커버됨
// ❌ 빨강: 커버 안 됨
// ⚠️ 노랑: 부분 커버
```

### 방법 3: 커버리지 Diff (변경 사항만)

```bash
# PR에서 추가된 코드의 커버리지만 체크
npm install --save-dev diff-coverage

# package.json
{
  "scripts": {
    "coverage:diff": "diff-coverage --coverage-file coverage/coverage-final.json --base-branch main"
  }
}

# 결과 예시:
# New code coverage: 85%
# - src/new-feature.ts: 92% ✅
# - src/another-file.ts: 60% ⚠️ (threshold: 80%)
```

---

## 🚨 커버리지 함정 피하기

### 함정 1: 100% 커버리지 = 버그 없음? ❌

```typescript
function divide(a: number, b: number): number {
  return a / b;
}

// 100% 라인 커버리지 달성
test('should divide', () => {
  expect(divide(10, 2)).toBe(5); // 1/1 라인 실행 = 100%
});

// 하지만 버그 존재!
divide(10, 0); // Infinity (0으로 나누기 처리 안 됨)

// 올바른 테스트
test('should throw on division by zero', () => {
  expect(() => divide(10, 0)).toThrow();
});
```

### 함정 2: 테스트를 위한 테스트

```typescript
// ❌ Bad: 구현 세부사항 테스트
test('should call internal method', () => {
  const spy = jest.spyOn(service, 'internalMethod');
  service.publicMethod();
  expect(spy).toHaveBeenCalled(); // 구현 변경 시 깨짐
});

// ✅ Good: 동작 테스트
test('should return correct result', () => {
  const result = service.publicMethod();
  expect(result).toBe(expectedValue); // 구현 독립적
});
```

### 함정 3: 낮은 품질의 테스트

```typescript
// ❌ Bad: 의미 없는 테스트
test('should exist', () => {
  expect(myFunction).toBeDefined(); // 커버리지만 높임
});

// ✅ Good: 의미 있는 테스트
test('should calculate total correctly', () => {
  expect(myFunction([1, 2, 3])).toBe(6);
});
```

---

## 📋 커버리지 체크리스트

### 코드 작성 전
- [ ] 테스트 가능한 코드 설계 (의존성 주입, 순수 함수)
- [ ] 복잡한 로직 분리 (함수 길이 ≤ 20줄)
- [ ] 사이드 이펙트 최소화

### 테스트 작성 시
- [ ] Happy path 테스트 (정상 동작)
- [ ] Edge case 테스트 (경계값)
- [ ] Error case 테스트 (예외 상황)
- [ ] 각 분기 커버 (if-else, switch-case)

### 테스트 실행 후
- [ ] 커버리지 리포트 확인 (npm run test -- --coverage)
- [ ] 미커버 라인 확인 (빨간색 라인)
- [ ] 부분 커버 조건문 확인 (노란색 라인)
- [ ] 목표 커버리지 달성 확인

### CI/CD 통합
- [ ] PR마다 커버리지 측정
- [ ] 커버리지 임계값 설정 (fail on < 70%)
- [ ] 커버리지 감소 방지 (이전 대비 -5% 이상 금지)
- [ ] 커버리지 뱃지 표시 (README.md)

---

## 🛠️ 도구 및 설정

### Vitest 커버리지 설정

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8', // 또는 'istanbul'
      reporter: ['text', 'json', 'html', 'lcov'],

      // 임계값 설정
      lines: 80,
      branches: 75,
      functions: 80,
      statements: 80,

      // 포함/제외 경로
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/types.ts',
        '**/*.d.ts'
      ],

      // 상세 설정
      all: true,              // 모든 파일 포함 (테스트 안 된 파일도)
      clean: true,            // 이전 커버리지 삭제
      skipFull: false,        // 100% 커버 파일도 표시
      perFile: true,          // 파일별 커버리지
      thresholdAutoUpdate: false, // 자동 임계값 업데이트 비활성화

      // 리포트 출력 디렉토리
      reportsDirectory: './coverage'
    }
  }
});
```

### GitHub Actions 통합

```yaml
# .github/workflows/coverage.yml
name: Test Coverage

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  coverage:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests with coverage
        run: npm run test -- --coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: unittests
          fail_ci_if_error: true

      - name: Comment PR with coverage
        uses: romeovs/lcov-reporter-action@v0.3.1
        with:
          lcov-file: ./coverage/lcov.info
          github-token: ${{ secrets.GITHUB_TOKEN }}
          delete-old-comments: true
```

### 커버리지 뱃지 추가

```markdown
<!-- README.md -->
# My Project

![Coverage](https://img.shields.io/codecov/c/github/username/repo)

## Test Coverage

[![codecov](https://codecov.io/gh/username/repo/branch/main/graph/badge.svg)](https://codecov.io/gh/username/repo)
```

---

## 📖 커버리지 개선 실전 예시

### Before: 40% 커버리지

```typescript
// src/utils/validators.ts
export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function validatePassword(password: string): boolean {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}

export function validateAge(age: number): boolean {
  return age >= 18 && age <= 120;
}

// 테스트 (일부만)
test('validateEmail', () => {
  expect(validateEmail('test@example.com')).toBe(true);
});

// 커버리지: 3/3 함수 중 1개만 테스트 = 33%
```

### After: 90% 커버리지

```typescript
// validators.test.ts
describe('validateEmail', () => {
  it.each([
    ['test@example.com', true],
    ['user@domain.co.uk', true],
    ['invalid', false],
    ['@example.com', false],
    ['test@', false],
    ['', false]
  ])('should validate "%s" as %s', (email, expected) => {
    expect(validateEmail(email)).toBe(expected);
  });
});

describe('validatePassword', () => {
  it('should accept valid password', () => {
    expect(validatePassword('Password1')).toBe(true);
  });

  it('should reject short password', () => {
    expect(validatePassword('Pass1')).toBe(false);
  });

  it('should reject without uppercase', () => {
    expect(validatePassword('password1')).toBe(false);
  });

  it('should reject without lowercase', () => {
    expect(validatePassword('PASSWORD1')).toBe(false);
  });

  it('should reject without number', () => {
    expect(validatePassword('Password')).toBe(false);
  });
});

describe('validateAge', () => {
  it.each([
    [18, true],   // 최소값
    [120, true],  // 최대값
    [50, true],   // 중간값
    [17, false],  // 미만
    [121, false], // 초과
    [0, false],
    [-1, false]
  ])('should validate age %i as %s', (age, expected) => {
    expect(validateAge(age)).toBe(expected);
  });
});

// 커버리지: 3/3 함수, 모든 분기 = 90%+
```

---

> **Best Practice**: 커버리지는 목표가 아닌 도구입니다. 높은 커버리지보다 의미 있는 테스트가 우선입니다.
