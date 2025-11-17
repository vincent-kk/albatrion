# 테스트 패턴 가이드

> 효과적인 테스트 작성을 위한 패턴 및 모범 사례 모음

## 📚 기본 테스트 패턴

### AAA 패턴 (Arrange-Act-Assert)

**설명**: 테스트를 세 단계로 명확히 구분하는 패턴

```typescript
describe('UserService.createUser', () => {
  it('should create user with valid data', () => {
    // Arrange (준비): 테스트 데이터 및 환경 설정
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 30
    };
    const mockRepository = createMockRepository();

    // Act (실행): 테스트 대상 코드 실행
    const result = userService.createUser(userData);

    // Assert (검증): 결과 확인
    expect(result).toEqual(expect.objectContaining(userData));
    expect(mockRepository.save).toHaveBeenCalledWith(userData);
  });
});
```

**장점**:
- 테스트 구조가 명확
- 가독성 향상
- 유지보수 용이

**적용 시나리오**:
- 모든 단위 테스트
- 통합 테스트
- E2E 테스트

---

### Given-When-Then 패턴

**설명**: BDD(Behavior-Driven Development) 스타일 테스트 패턴

```typescript
describe('Shopping Cart', () => {
  it('should calculate total with discount code', () => {
    // Given: 초기 상태 설정
    const cart = new ShoppingCart();
    cart.addItem({ name: 'Book', price: 100 });
    cart.addItem({ name: 'Pen', price: 50 });
    const discountCode = 'SAVE10';

    // When: 동작 수행
    cart.applyDiscountCode(discountCode);
    const total = cart.calculateTotal();

    // Then: 결과 검증
    expect(total).toBe(135); // 150 - 10% = 135
    expect(cart.discountApplied).toBe(true);
  });
});
```

**장점**:
- 비즈니스 로직과 테스트 연결
- 비개발자도 이해 가능
- 요구사항 문서화

**적용 시나리오**:
- 비즈니스 로직 테스트
- 사용자 시나리오 테스트
- 통합 테스트

---

## 🧪 단위 테스트 패턴

### 1. Test Fixture 패턴

**설명**: 반복되는 테스트 데이터를 재사용 가능한 fixture로 분리

```typescript
// fixtures/user.fixture.ts
export const createMockUser = (overrides = {}) => ({
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
  ...overrides
});

export const createMockAdmin = () => createMockUser({
  role: 'admin',
  permissions: ['read', 'write', 'delete']
});

// test file
import { createMockUser, createMockAdmin } from './fixtures/user.fixture';

describe('UserService', () => {
  it('should update user profile', () => {
    const user = createMockUser();
    const updated = userService.updateProfile(user.id, { age: 31 });
    expect(updated.age).toBe(31);
  });

  it('should allow admin to delete user', () => {
    const admin = createMockAdmin();
    const result = userService.deleteUser(admin, 'user-456');
    expect(result.success).toBe(true);
  });
});
```

**장점**:
- 중복 제거
- 테스트 데이터 일관성
- 유지보수 용이

---

### 2. Test Double 패턴

#### 2.1 Mock (모의 객체)

**설명**: 메서드 호출 검증에 초점

```typescript
describe('EmailService', () => {
  it('should send welcome email on user creation', () => {
    // Mock: 호출 검증
    const mockMailer = {
      sendEmail: jest.fn().mockResolvedValue(true)
    };

    const emailService = new EmailService(mockMailer);
    const user = { email: 'john@example.com', name: 'John' };

    emailService.sendWelcomeEmail(user);

    // Mock 호출 검증
    expect(mockMailer.sendEmail).toHaveBeenCalledWith({
      to: 'john@example.com',
      subject: 'Welcome John!',
      template: 'welcome'
    });
  });
});
```

#### 2.2 Stub (스텁)

**설명**: 고정된 값 반환에 초점

```typescript
describe('ProductService', () => {
  it('should calculate price with tax', () => {
    // Stub: 고정 값 반환
    const taxCalculator = {
      getTaxRate: () => 0.1 // 항상 10% 세율 반환
    };

    const productService = new ProductService(taxCalculator);
    const price = productService.calculateFinalPrice(100);

    expect(price).toBe(110); // 100 + 10% tax
  });
});
```

#### 2.3 Spy (스파이)

**설명**: 실제 동작 유지하며 호출 추적

```typescript
describe('Logger', () => {
  it('should log errors to console', () => {
    // Spy: 실제 console.error 동작은 유지하며 호출 추적
    const consoleErrorSpy = jest.spyOn(console, 'error');

    const logger = new Logger();
    logger.error('Something went wrong', { code: 500 });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Something went wrong',
      { code: 500 }
    );

    consoleErrorSpy.mockRestore();
  });
});
```

#### 2.4 Fake (가짜 객체)

**설명**: 실제와 유사하지만 단순화된 구현

```typescript
// Fake: 인메모리 데이터베이스
class FakeUserRepository {
  private users: User[] = [];

  async save(user: User): Promise<User> {
    this.users.push(user);
    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find(u => u.id === id) || null;
  }

  clear() {
    this.users = [];
  }
}

describe('UserService with Fake Repository', () => {
  let fakeRepo: FakeUserRepository;
  let userService: UserService;

  beforeEach(() => {
    fakeRepo = new FakeUserRepository();
    userService = new UserService(fakeRepo);
  });

  afterEach(() => {
    fakeRepo.clear();
  });

  it('should persist and retrieve user', async () => {
    const user = await userService.createUser({ name: 'John' });
    const retrieved = await userService.getUser(user.id);

    expect(retrieved).toEqual(user);
  });
});
```

---

### 3. Parameterized Test 패턴

**설명**: 동일한 테스트 로직을 다양한 입력값으로 반복

```typescript
describe('StringUtils.capitalize', () => {
  it.each([
    ['hello', 'Hello'],
    ['world', 'World'],
    ['CAPS', 'Caps'],
    ['mixedCase', 'Mixedcase'],
    ['', ''],
    ['a', 'A']
  ])('should capitalize "%s" to "%s"', (input, expected) => {
    expect(StringUtils.capitalize(input)).toBe(expected);
  });
});
```

**장점**:
- 많은 케이스를 간결하게 테스트
- 엣지 케이스 커버리지 향상
- 테스트 추가 용이

---

### 4. Test Data Builder 패턴

**설명**: 복잡한 테스트 객체를 유연하게 생성

```typescript
class UserBuilder {
  private user: Partial<User> = {
    id: '123',
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
    role: 'user'
  };

  withId(id: string): this {
    this.user.id = id;
    return this;
  }

  withName(name: string): this {
    this.user.name = name;
    return this;
  }

  withEmail(email: string): this {
    this.user.email = email;
    return this;
  }

  asAdmin(): this {
    this.user.role = 'admin';
    return this;
  }

  build(): User {
    return this.user as User;
  }
}

// 사용 예시
describe('UserService', () => {
  it('should allow admin to delete users', () => {
    const admin = new UserBuilder()
      .withId('admin-1')
      .asAdmin()
      .build();

    const result = userService.deleteUser(admin, 'user-123');
    expect(result.success).toBe(true);
  });

  it('should reject non-admin deletion', () => {
    const regularUser = new UserBuilder()
      .withId('user-1')
      .build(); // default role: 'user'

    expect(() => {
      userService.deleteUser(regularUser, 'user-123');
    }).toThrow(UnauthorizedError);
  });
});
```

**장점**:
- 가독성 높은 테스트 데이터 생성
- 재사용성
- 변경 용이성

---

## 🔄 통합 테스트 패턴

### 1. Database Transaction 패턴

**설명**: 각 테스트 후 데이터베이스 롤백

```typescript
describe('UserRepository Integration Tests', () => {
  let connection: DatabaseConnection;

  beforeEach(async () => {
    connection = await createDatabaseConnection();
    await connection.beginTransaction();
  });

  afterEach(async () => {
    await connection.rollback();
    await connection.close();
  });

  it('should save and retrieve user', async () => {
    const userRepo = new UserRepository(connection);
    const user = await userRepo.save({ name: 'John', email: 'john@example.com' });

    const retrieved = await userRepo.findById(user.id);
    expect(retrieved).toEqual(user);
  });
});
```

**장점**:
- 테스트 격리
- 데이터베이스 상태 깨끗하게 유지
- 병렬 실행 안전

---

### 2. Test Container 패턴

**설명**: Docker 컨테이너를 사용한 실제 환경 테스트

```typescript
import { GenericContainer } from 'testcontainers';

describe('Redis Integration Tests', () => {
  let container: StartedTestContainer;
  let redisClient: RedisClient;

  beforeAll(async () => {
    // Redis 컨테이너 시작
    container = await new GenericContainer('redis')
      .withExposedPorts(6379)
      .start();

    const host = container.getHost();
    const port = container.getMappedPort(6379);

    redisClient = createRedisClient({ host, port });
  });

  afterAll(async () => {
    await redisClient.disconnect();
    await container.stop();
  });

  it('should cache and retrieve data', async () => {
    await redisClient.set('key1', 'value1');
    const value = await redisClient.get('key1');

    expect(value).toBe('value1');
  });
});
```

**장점**:
- 실제 환경과 유사
- 외부 의존성 격리
- CI/CD 환경에서 재현 가능

---

## 🌐 E2E 테스트 패턴

### 1. Page Object 패턴

**설명**: UI 요소와 동작을 객체로 추상화

```typescript
// pages/LoginPage.ts
class LoginPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('/login');
  }

  async fillEmail(email: string) {
    await this.page.fill('#email', email);
  }

  async fillPassword(password: string) {
    await this.page.fill('#password', password);
  }

  async clickLoginButton() {
    await this.page.click('button[type="submit"]');
  }

  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickLoginButton();
  }

  async getErrorMessage() {
    return await this.page.textContent('.error-message');
  }
}

// login.e2e.test.ts
describe('Login Flow', () => {
  let loginPage: LoginPage;

  beforeEach(async () => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  it('should login with valid credentials', async () => {
    await loginPage.login('user@example.com', 'password123');

    expect(page.url()).toContain('/dashboard');
  });

  it('should show error with invalid credentials', async () => {
    await loginPage.login('user@example.com', 'wrongpassword');

    const error = await loginPage.getErrorMessage();
    expect(error).toBe('Invalid credentials');
  });
});
```

**장점**:
- UI 변경 시 테스트 수정 최소화
- 재사용성
- 가독성 향상

---

### 2. User Journey 패턴

**설명**: 실제 사용자 시나리오를 따르는 테스트

```typescript
describe('E-commerce User Journey', () => {
  it('should complete purchase flow', async () => {
    // 1. 홈페이지 방문
    await page.goto('/');
    expect(await page.title()).toContain('Shop');

    // 2. 상품 검색
    await page.fill('[data-testid="search-input"]', 'laptop');
    await page.click('[data-testid="search-button"]');

    // 3. 상품 선택
    await page.click('[data-testid="product-card"]:first-child');
    expect(page.url()).toContain('/product/');

    // 4. 장바구니 추가
    await page.click('[data-testid="add-to-cart"]');
    const cartCount = await page.textContent('[data-testid="cart-count"]');
    expect(cartCount).toBe('1');

    // 5. 장바구니 확인
    await page.click('[data-testid="cart-icon"]');
    expect(page.url()).toContain('/cart');

    // 6. 결제 진행
    await page.click('[data-testid="checkout-button"]');
    expect(page.url()).toContain('/checkout');

    // 7. 배송 정보 입력
    await page.fill('#address', '123 Main St');
    await page.fill('#city', 'New York');
    await page.fill('#zip', '10001');

    // 8. 결제 완료
    await page.click('[data-testid="place-order"]');

    // 9. 주문 확인
    expect(page.url()).toContain('/order-confirmation');
    const confirmationMessage = await page.textContent('h1');
    expect(confirmationMessage).toContain('Thank you for your order');
  });
});
```

**장점**:
- 실제 사용자 경험 검증
- 전체 플로우 통합 테스트
- 비즈니스 가치 검증

---

## ⚡ 비동기 테스트 패턴

### 1. Async/Await 패턴

```typescript
describe('API Service', () => {
  it('should fetch user data', async () => {
    const userId = '123';
    const user = await apiService.getUser(userId);

    expect(user.id).toBe(userId);
    expect(user.name).toBeDefined();
  });

  it('should handle API errors', async () => {
    await expect(apiService.getUser('invalid-id')).rejects.toThrow(NotFoundError);
  });
});
```

### 2. Callback 테스트 패턴

```typescript
describe('Legacy Callback API', () => {
  it('should handle callback success', (done) => {
    legacyApi.fetchData((error, data) => {
      expect(error).toBeNull();
      expect(data).toBeDefined();
      done(); // 테스트 완료 신호
    });
  });

  it('should handle callback error', (done) => {
    legacyApi.fetchInvalidData((error, data) => {
      expect(error).toBeDefined();
      expect(data).toBeUndefined();
      done();
    });
  });
});
```

### 3. Promise 테스트 패턴

```typescript
describe('Promise-based API', () => {
  it('should resolve promise', () => {
    return promiseApi.fetchData().then(data => {
      expect(data).toBeDefined();
    });
  });

  it('should reject promise', () => {
    return promiseApi.fetchInvalidData().catch(error => {
      expect(error).toBeInstanceOf(Error);
    });
  });
});
```

### 4. Event Emitter 테스트 패턴

```typescript
describe('EventEmitter', () => {
  it('should emit and handle events', (done) => {
    const emitter = new EventEmitter();

    emitter.on('data', (data) => {
      expect(data.value).toBe(42);
      done();
    });

    emitter.emit('data', { value: 42 });
  });

  it('should handle multiple events', () => {
    const emitter = new EventEmitter();
    const handler = jest.fn();

    emitter.on('event', handler);
    emitter.emit('event', 1);
    emitter.emit('event', 2);
    emitter.emit('event', 3);

    expect(handler).toHaveBeenCalledTimes(3);
    expect(handler).toHaveBeenNthCalledWith(1, 1);
    expect(handler).toHaveBeenNthCalledWith(2, 2);
    expect(handler).toHaveBeenNthCalledWith(3, 3);
  });
});
```

---

## 🎭 프론트엔드 테스트 패턴

### 1. Component Testing 패턴 (React)

```typescript
import { render, screen, fireEvent } from '@testing-library/react';

describe('LoginForm Component', () => {
  it('should submit form with credentials', () => {
    const mockOnSubmit = jest.fn();

    render(<LoginForm onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Login' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });

  it('should show validation errors', () => {
    render(<LoginForm onSubmit={jest.fn()} />);

    const submitButton = screen.getByRole('button', { name: 'Login' });
    fireEvent.click(submitButton);

    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });
});
```

### 2. Hook Testing 패턴

```typescript
import { renderHook, act } from '@testing-library/react-hooks';

describe('useCounter Hook', () => {
  it('should increment counter', () => {
    const { result } = renderHook(() => useCounter());

    expect(result.current.count).toBe(0);

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it('should decrement counter', () => {
    const { result } = renderHook(() => useCounter(10));

    act(() => {
      result.current.decrement();
    });

    expect(result.current.count).toBe(9);
  });
});
```

---

## 🚫 안티 패턴 (피해야 할 패턴)

### 1. 중복 테스트

```typescript
// ❌ Bad: 동일한 로직을 여러 번 테스트
it('should add 1 + 1', () => {
  expect(add(1, 1)).toBe(2);
});

it('should add two numbers', () => {
  expect(add(1, 1)).toBe(2); // 중복!
});

// ✅ Good: 하나의 명확한 테스트
it('should add two numbers', () => {
  expect(add(1, 1)).toBe(2);
  expect(add(5, 3)).toBe(8);
  expect(add(-1, 1)).toBe(0);
});
```

### 2. 구현 세부사항 테스트

```typescript
// ❌ Bad: 내부 구현에 의존
it('should use sort algorithm', () => {
  const spy = jest.spyOn(Array.prototype, 'sort');
  const result = sortNumbers([3, 1, 2]);

  expect(spy).toHaveBeenCalled(); // 구현 세부사항!
});

// ✅ Good: 동작 결과 테스트
it('should sort numbers in ascending order', () => {
  const result = sortNumbers([3, 1, 2]);
  expect(result).toEqual([1, 2, 3]);
});
```

### 3. 과도한 Mocking

```typescript
// ❌ Bad: 모든 것을 mock
it('should calculate total', () => {
  const mockAdd = jest.fn((a, b) => a + b);
  const mockMultiply = jest.fn((a, b) => a * b);

  // ... 실제 로직 테스트 안 됨
});

// ✅ Good: 필요한 외부 의존성만 mock
it('should calculate total with tax', () => {
  const mockTaxService = { getTaxRate: jest.fn(() => 0.1) };
  const calculator = new PriceCalculator(mockTaxService);

  const total = calculator.calculateTotal(100);
  expect(total).toBe(110);
});
```

---

> **Best Practice**: 테스트는 "무엇을(What)" 테스트하는지 명확해야 하며, "어떻게(How)" 구현되었는지는 중요하지 않습니다.
