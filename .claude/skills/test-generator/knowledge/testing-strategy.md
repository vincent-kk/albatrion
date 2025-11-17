# Testing Strategy Knowledge Base

## Progressive Testing Pyramid

```
         /\
        /  \  E2E Tests (10%)
       /____\
      /      \  Integration Tests (20%)
     /________\
    /          \  Component Tests (30%)
   /____________\
  /              \  Unit Tests (40%)
 /________________\
```

## Test Type Classification

### 1. Unit Tests
**목적**: 순수 함수, 유틸리티 로직 검증
**특징**: 빠름 (< 1초), 독립적, 외부 의존성 없음
**대상**:
- 계산 로직 (`calculateDiscount`, `formatDate`)
- 유효성 검증 (`validateEmail`, `isValidPassword`)
- 데이터 변환 (`mapUserToDTO`, `parseJSON`)
- 상태 변환 (`reducer`, `stateTransition`)

**제외 대상**:
- API 호출
- DOM 조작
- React 컴포넌트
- 외부 서비스 의존

### 2. Component Tests
**목적**: React 컴포넌트 UI 및 상호작용 검증
**특징**: 중간 속도 (< 5초), React Testing Library 사용
**대상**:
- 렌더링 결과 (`screen.getByText`)
- 이벤트 핸들링 (`fireEvent.click`)
- Props 변화 반응 (`rerender`)
- 조건부 렌더링
- 접근성 (`getByRole`, `getByLabelText`)

**제외 대상**:
- 실제 네트워크 요청
- 실제 라우팅 (useNavigate mock 사용)
- 브라우저 API (localStorage mock 사용)

### 3. Integration Tests
**목적**: 여러 모듈의 결합 동작 검증
**특징**: 느림 (< 10초), Provider/Context 포함
**대상**:
- API + State 통합 (`useQuery` + Provider)
- 라우팅 + 컴포넌트 (`MemoryRouter` + 페이지)
- Form + Validation (`react-hook-form` + zod)
- Context + Consumer 컴포넌트

**주의사항**:
- 실제 API 호출하지 않음 (MSW 또는 vi.mock 사용)
- Provider 올바른 설정 필수
- 비동기 작업 완료 대기 (`waitFor`, `findBy*`)

### 4. E2E Tests
**목적**: 전체 사용자 시나리오 검증
**특징**: 매우 느림 (< 30초), 실제 브라우저 사용
**대상**:
- 전체 사용자 플로우 (회원가입 → 로그인 → 기능 사용)
- 크리티컬 패스 (결제, 데이터 저장)
- 크로스 브라우저 호환성
- 접근성 (키보드 탐색, 스크린 리더)

**제외 대상**:
- 단위 로직 검증 (Unit 테스트 영역)
- 에러 케이스 전체 (너무 느림)

## Coverage Guidelines

### Target Metrics
```yaml
core_utilities:
  target: 80%+
  priority: P0
  rationale: "비즈니스 로직 중심, 높은 안정성 필요"

ui_components:
  target: 60-80%
  priority: P1
  rationale: "시각적 요소 포함, 일부 수동 테스트 허용"

api_integration:
  target: 70%+
  priority: P0
  rationale: "외부 의존성, 에러 처리 필수"

global_baseline:
  target: 70%
  priority: P1
  rationale: "프로젝트 전체 평균 유지"
```

### Exclusion Rules
```typescript
// vitest.config.ts
coverage: {
  exclude: [
    '**/__tests__/**',         // 테스트 파일 자체
    '**/*.test.ts',            // 테스트 파일
    '**/*.stories.tsx',        // Storybook 파일
    '**/node_modules/**',      // 외부 라이브러리
    '**/dist/**',              // 빌드 결과물
    '**/*.d.ts',               // 타입 선언
    '**/vite.config.ts',       // 설정 파일
    '**/vitest.config.ts',
    '**/.storybook/**',
  ]
}
```

## Test Naming Patterns

### Function Tests
```typescript
describe('{FunctionName}', () => {
  it('should {기대 동작} when {조건}', () => {});
  it('should throw {예외} when {잘못된 조건}', () => {});
  it('should handle edge case: {특수 케이스}', () => {});
});
```

### Component Tests
```typescript
describe('{ComponentName}', () => {
  it('should render {요소} with {조건}', () => {});
  it('should call {핸들러} when {이벤트}', () => {});
  it('should show {결과} when {상태 변화}', () => {});
  it('should be accessible via {접근 방법}', () => {});
});
```

### Hook Tests
```typescript
describe('use{HookName}', () => {
  it('should return {값} initially', () => {});
  it('should update {상태} when {액션}', () => {});
  it('should cleanup on unmount', () => {});
});
```

## AAA Pattern (Arrange-Act-Assert)

### Structure
```typescript
it('should calculate discount correctly', () => {
  // 1️⃣ Arrange: 준비 (테스트 데이터, Mock 설정)
  const price = 100;
  const discountRate = 0.2;
  const expected = 80;

  // 2️⃣ Act: 실행 (테스트 대상 함수 호출)
  const result = calculateDiscount(price, discountRate);

  // 3️⃣ Assert: 검증 (결과 확인)
  expect(result).toBe(expected);
});
```

### Good Practices
```typescript
// ✅ Good: 명확한 3단계 구분
it('should filter active users', () => {
  // Arrange
  const users = [
    { id: '1', active: true },
    { id: '2', active: false },
    { id: '3', active: true },
  ];

  // Act
  const result = filterActiveUsers(users);

  // Assert
  expect(result).toHaveLength(2);
  expect(result[0].id).toBe('1');
  expect(result[1].id).toBe('3');
});

// ❌ Bad: 단계 섞여 있음
it('should filter active users', () => {
  const users = [{ id: '1', active: true }];
  expect(filterActiveUsers(users)).toHaveLength(1); // Act + Assert 혼재
  users.push({ id: '2', active: false }); // Arrange가 중간에
  expect(filterActiveUsers(users)).toHaveLength(1);
});
```

## Mock Strategy

### When to Mock
```yaml
external_apis:
  mock: true
  reason: "네트워크 불안정성, 테스트 속도"
  tool: "vi.mock() 또는 MSW"

browser_apis:
  mock: true
  reason: "테스트 환경에 없음 (localStorage, fetch)"
  tool: "vi.spyOn(Storage.prototype)"

third_party_libraries:
  mock: conditional
  reason: "복잡도에 따라"
  examples:
    - "axios: Mock (네트워크)"
    - "date-fns: Real (순수 함수)"
    - "react-query: Wrapper Provider (통제)"

internal_modules:
  mock: false
  reason: "실제 통합 테스트 필요"
  exception: "너무 복잡한 경우만 Mock"
```

### Mocking Techniques

#### API Mocking (vi.mock)
```typescript
import { vi } from 'vitest';
import * as api from '../api/users';

vi.mock('../api/users', () => ({
  fetchUser: vi.fn(),
  updateUser: vi.fn(),
}));

describe('User service', () => {
  it('should fetch user', async () => {
    const mockUser = { id: '1', name: 'Alice' };
    vi.mocked(api.fetchUser).mockResolvedValue(mockUser);

    const result = await api.fetchUser('1');
    expect(result).toEqual(mockUser);
  });
});
```

#### Browser API Mocking
```typescript
import { vi, beforeEach, afterEach } from 'vitest';

describe('LocalStorage operations', () => {
  const mockStorage: Record<string, string> = {};

  beforeEach(() => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(
      (key) => mockStorage[key] || null
    );
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(
      (key, value) => { mockStorage[key] = value; }
    );
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(
      (key) => { delete mockStorage[key]; }
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
  });

  it('should save and retrieve', () => {
    localStorage.setItem('key', 'value');
    expect(localStorage.getItem('key')).toBe('value');
  });
});
```

#### React Query Mocking
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
      staleTime: 0,
    },
  },
});

export function renderWithQuery(hook: () => any) {
  const queryClient = createTestQueryClient();
  return renderHook(hook, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    ),
  });
}
```

## Storybook + Testing

### Stories as Tests
```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
};

export default meta;
type Story = StoryObj<typeof Button>;

// 1️⃣ Visual Test: 기본 렌더링
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

// 2️⃣ Interaction Test: 클릭 동작
export const WithClick: Story = {
  args: {
    children: 'Click me',
    onClick: vi.fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalled();
  },
};

// 3️⃣ State Test: Disabled 상태
export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await expect(button).toBeDisabled();
  },
};
```

## CI/CD Integration

### GitHub Actions Setup
```yaml
name: Test

on:
  pull_request:
  push:
    branches: [main, master]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'yarn'

      - name: Install dependencies
        run: yarn install --immutable

      - name: Lint
        run: yarn lint

      - name: Type check
        run: yarn typecheck

      - name: Unit tests
        run: yarn test:unit --coverage

      - name: Component tests
        run: yarn test:component

      - name: Integration tests
        run: yarn test:integration

      - name: Upload coverage
        if: matrix.node-version == 20
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/coverage-final.json
          fail_ci_if_error: true

      - name: Check coverage threshold
        run: yarn test:coverage-check

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'yarn'

      - name: Install dependencies
        run: yarn install --immutable

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: yarn test:e2e

      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-results
          path: playwright-report/
```

### Coverage Enforcement
```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run --coverage",
    "test:coverage-check": "vitest run --coverage --coverage.statements=70 --coverage.branches=70 --coverage.functions=70 --coverage.lines=70"
  }
}
```

## Test Quality Checklist

### Before Writing Tests
- [ ] 함수/컴포넌트 시그니처 이해
- [ ] 엣지 케이스 식별 (빈 값, null, undefined, 큰 값)
- [ ] 외부 의존성 확인 (Mock 대상)
- [ ] 기존 테스트 중복 확인

### During Writing
- [ ] AAA 패턴 준수
- [ ] 명확한 테스트명 (should {action} when {condition})
- [ ] 하나의 테스트는 하나의 동작만 검증
- [ ] 독립적 실행 가능 (beforeEach로 초기화)
- [ ] 적절한 Assertion (toBe vs toEqual vs toStrictEqual)

### After Writing
- [ ] 모든 테스트 통과 (`yarn test`)
- [ ] 커버리지 목표 달성 (`yarn test:coverage`)
- [ ] 테스트 실행 시간 확인 (< 목표 시간)
- [ ] 테스트 코드 리뷰 (가독성, 유지보수성)

## Common Pitfalls

### ❌ Don't
```typescript
// 1. 순서 의존적 테스트
let user;
it('should create user', () => {
  user = createUser(); // 전역 상태 변경
});
it('should update user', () => {
  updateUser(user); // 이전 테스트 의존
});

// 2. 불필요한 타임아웃
it('should load data', async () => {
  setTimeout(() => {
    expect(data).toBeDefined();
  }, 1000); // 하드코딩된 대기
});

// 3. 너무 많은 Assertion
it('should do everything', () => {
  expect(result.id).toBe('1');
  expect(result.name).toBe('Alice');
  expect(result.email).toBe('alice@example.com');
  expect(result.age).toBe(25);
  // ... 10개 더
});

// 4. Mock 정리 누락
it('should fetch user', () => {
  vi.mock('./api'); // Mock 설정
  // ... 테스트
  // vi.restoreAllMocks() 누락
});
```

### ✅ Do
```typescript
// 1. 독립적 테스트
describe('User operations', () => {
  let user;

  beforeEach(() => {
    user = createUser(); // 각 테스트마다 새로 생성
  });

  it('should create user', () => {
    expect(user).toBeDefined();
  });

  it('should update user', () => {
    const updated = updateUser(user);
    expect(updated.name).toBe('Updated');
  });
});

// 2. waitFor 사용
it('should load data', async () => {
  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  });
});

// 3. 개별 테스트로 분리
describe('User validation', () => {
  it('should have valid id', () => {
    expect(user.id).toBe('1');
  });

  it('should have valid name', () => {
    expect(user.name).toBe('Alice');
  });

  it('should have valid email', () => {
    expect(user.email).toBe('alice@example.com');
  });
});

// 4. afterEach로 Mock 정리
describe('API tests', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch user', () => {
    vi.mock('./api');
    // ... 테스트
  });
});
```

---

> **참고**: `.cursor/rules/testing-strategy.mdc` 원본 규칙 문서
