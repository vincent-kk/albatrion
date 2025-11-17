# Code Review Checklist

> 체계적인 코드 리뷰를 위한 포괄적 체크리스트

## 📋 기본 리뷰 체크리스트

### 1. 기능 정확성 (Functional Correctness)

#### ✅ 요구사항 충족
- [ ] 모든 요구사항이 구현되었는가?
- [ ] 예외 케이스가 적절히 처리되는가?
- [ ] 엣지 케이스가 고려되었는가?
- [ ] 비즈니스 로직이 정확하게 구현되었는가?

#### ✅ 동작 검증
- [ ] 코드가 의도한 대로 작동하는가?
- [ ] 입력 검증이 충분한가?
- [ ] 출력 형식이 올바른가?
- [ ] 부작용(side effects)이 문서화되었는가?

---

### 2. 가독성 (Readability)

#### ✅ 코드 흐름
- [ ] 코드가 위에서 아래로 자연스럽게 읽히는가?
- [ ] 함수 길이가 15줄 이하인가? (이상적)
- [ ] 중첩 깊이가 3 이하인가?
- [ ] Early return 패턴을 사용하여 가독성을 높였는가?

**예시**:
```typescript
// ✅ 가독성 좋음
function processUser(userId: string) {
  if (!userId) return null;  // Early return

  const user = fetchUser(userId);
  if (!user) return null;

  return validateAndSave(user);
}

// ❌ 가독성 나쁨
function processUser(userId: string) {
  if (userId) {
    const user = fetchUser(userId);
    if (user) {
      return validateAndSave(user);
    } else {
      return null;
    }
  } else {
    return null;
  }
}
```

#### ✅ 네이밍
- [ ] 변수명이 목적을 명확히 설명하는가?
- [ ] 함수명이 동작을 정확히 표현하는가?
- [ ] 일반적 약어(ID, URL, API) 외에는 약어 사용을 피했는가?
- [ ] Boolean 변수명이 `is`, `has`, `can` 등으로 시작하는가?

**체크 포인트**:
```typescript
// ✅ 명확한 네이밍
const isUserAuthenticated: boolean = checkAuth(userId);
const hasPermission: boolean = user.roles.includes('admin');
const canDeletePost: boolean = post.authorId === userId || isAdmin;

function calculateTotalPrice(items: Item[]): number { }
function fetchUserById(id: string): Promise<User> { }

// ❌ 모호한 네이밍
const flag: boolean = check(id);
const data: any = getData();
function calc(x: any): any { }
```

#### ✅ 주석
- [ ] 주석이 "왜(why)"를 설명하는가? (무엇(what)이 아닌)
- [ ] 모든 public API에 JSDoc이 있는가?
- [ ] 복잡한 알고리즘에 설명이 있는가?
- [ ] 임시 해결책(workaround)에 TODO나 FIXME가 명시되어 있는가?

---

### 3. 성능 (Performance)

#### ✅ 알고리즘 효율성
- [ ] 시간 복잡도가 적절한가? (O(n²) 이상 주의)
- [ ] 불필요한 반복이 없는가?
- [ ] 데이터 구조가 최적인가? (Array vs Set vs Map)
- [ ] 메모이제이션이 필요한 경우 적용되었는가?

**복잡도 체크**:
```typescript
// ❌ O(n²) - 중첩 루프
function findDuplicates(users: User[]) {
  const duplicates = [];
  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      if (users[i].email === users[j].email) {
        duplicates.push(users[i]);
      }
    }
  }
  return duplicates;
}

// ✅ O(n) - Set 사용
function findDuplicates(users: User[]) {
  const seen = new Set<string>();
  const duplicates: User[] = [];

  for (const user of users) {
    if (seen.has(user.email)) {
      duplicates.push(user);
    } else {
      seen.add(user.email);
    }
  }
  return duplicates;
}
```

#### ✅ 메모리 효율성
- [ ] 불필요한 객체 생성이 없는가?
- [ ] 큰 배열/객체를 복사하지 않는가?
- [ ] 메모리 누수 가능성이 없는가?
- [ ] 이벤트 리스너가 적절히 제거되는가?

#### ✅ 최적화
- [ ] 데이터베이스 쿼리가 효율적인가? (N+1 문제)
- [ ] 캐싱이 필요한 경우 적용되었는가?
- [ ] 지연 로딩(lazy loading)이 적절히 사용되었는가?

---

### 4. 보안 (Security)

#### ✅ 입력 검증
- [ ] 모든 사용자 입력이 검증되는가?
- [ ] SQL 인젝션 방지가 적용되었는가? (파라미터화된 쿼리)
- [ ] XSS 방지가 적용되었는가? (입력 sanitization)
- [ ] CSRF 방지가 필요한 경우 적용되었는가?

**보안 체크**:
```typescript
// ❌ SQL 인젝션 취약
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ 파라미터화된 쿼리
const query = 'SELECT * FROM users WHERE email = ?';
db.query(query, [email]);

// ❌ 평문 비밀번호 저장
user.password = req.body.password;

// ✅ 해싱된 비밀번호 저장
user.passwordHash = await bcrypt.hash(req.body.password, 12);
```

#### ✅ 인증 & 권한
- [ ] 인증이 필요한 엔드포인트가 보호되는가?
- [ ] 권한 검증이 적절히 이루어지는가?
- [ ] 민감한 데이터 접근이 제어되는가?
- [ ] 세션/토큰이 안전하게 관리되는가?

#### ✅ 데이터 보호
- [ ] 민감한 정보가 로그에 노출되지 않는가?
- [ ] API 응답에 불필요한 데이터가 포함되지 않는가?
- [ ] 암호화가 필요한 데이터가 암호화되는가?
- [ ] 환경 변수로 비밀 정보를 관리하는가?

---

### 5. 에러 처리 (Error Handling)

#### ✅ 예외 처리
- [ ] 모든 async 함수에 try-catch가 있는가?
- [ ] 에러가 적절히 분류되는가? (NotFound, Validation, Server 등)
- [ ] 에러 메시지가 사용자 친화적인가?
- [ ] 스택 트레이스가 프로덕션에서 노출되지 않는가?

**에러 처리 예시**:
```typescript
// ✅ 적절한 에러 처리
async function fetchUser(id: string): Promise<User> {
  try {
    const user = await api.getUser(id);
    if (!user) {
      throw new NotFoundError(`User ${id} not found`);
    }
    return user;
  } catch (error) {
    if (error instanceof NotFoundError) {
      logger.warn('User not found', { userId: id });
      throw error;
    }

    logger.error('Failed to fetch user', { userId: id, error });
    throw new ServiceUnavailableError('User service is temporarily unavailable');
  }
}

// ❌ 부적절한 에러 처리
async function fetchUser(id: string) {
  try {
    return await api.getUser(id);
  } catch (error) {
    return null;  // 에러를 숨김
  }
}
```

#### ✅ 로깅
- [ ] 에러 발생 시 충분한 컨텍스트가 로깅되는가?
- [ ] 로그 레벨이 적절한가? (debug, info, warn, error)
- [ ] 구조화된 로깅이 사용되는가?
- [ ] 로그에 민감한 정보가 포함되지 않는가?

---

### 6. 타입 안전성 (Type Safety)

#### ✅ TypeScript 타입
- [ ] 모든 함수 파라미터에 타입이 명시되었는가?
- [ ] 모든 함수 반환 타입이 명시되었는가?
- [ ] `any` 사용이 최소화되었는가?
- [ ] 타입 단언(type assertion)이 필요한 경우만 사용되었는가?

**타입 체크**:
```typescript
// ✅ 명확한 타입 정의
function calculateDiscount(
  price: number,
  discountRate: number
): number {
  return price * (1 - discountRate);
}

interface User {
  id: string;
  name: string;
  email: string;
  roles: ('admin' | 'user')[];
}

// ❌ 타입 없음
function calculateDiscount(price, rate) {
  return price * (1 - rate);
}

const user: any = fetchUser(id);
```

#### ✅ 제네릭 & 유틸리티 타입
- [ ] 제네릭이 적절히 사용되었는가?
- [ ] 제네릭 제약(constraints)이 명확한가?
- [ ] 유틸리티 타입(Partial, Pick, Omit 등)이 활용되었는가?

---

### 7. 테스트 (Testing)

#### ✅ 테스트 커버리지
- [ ] 핵심 비즈니스 로직에 테스트가 있는가?
- [ ] 엣지 케이스가 테스트되는가?
- [ ] 에러 케이스가 테스트되는가?
- [ ] 테스트 커버리지가 80% 이상인가?

#### ✅ 테스트 품질
- [ ] 테스트가 독립적인가? (순서 의존 없음)
- [ ] AAA 패턴(Arrange-Act-Assert)을 따르는가?
- [ ] Mock/Stub이 적절히 사용되었는가?
- [ ] 테스트 설명이 명확한가?

**테스트 예시**:
```typescript
describe('UserService.createUser', () => {
  let service: UserService;
  let mockRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockRepository = {
      findByEmail: jest.fn(),
      save: jest.fn()
    } as any;
    service = new UserService(mockRepository);
  });

  it('should create user with valid data', async () => {
    // Arrange
    const userData = { name: 'John', email: 'john@example.com' };
    mockRepository.findByEmail.mockResolvedValue(null);
    mockRepository.save.mockResolvedValue({ id: '123', ...userData });

    // Act
    const result = await service.createUser(userData);

    // Assert
    expect(result).toEqual(expect.objectContaining(userData));
    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining(userData)
    );
  });

  it('should throw ConflictError for duplicate email', async () => {
    mockRepository.findByEmail.mockResolvedValue({ email: 'john@example.com' } as any);

    await expect(
      service.createUser({ name: 'John', email: 'john@example.com' })
    ).rejects.toThrow(ConflictError);
  });
});
```

---

### 8. 유지보수성 (Maintainability)

#### ✅ SOLID 원칙
- [ ] 단일 책임 원칙(SRP)이 지켜지는가?
- [ ] 개방-폐쇄 원칙(OCP)이 지켜지는가?
- [ ] 의존성 역전 원칙(DIP)이 적용되었는가?

#### ✅ 코드 구조
- [ ] 함수/클래스가 하나의 일만 하는가?
- [ ] 중복 코드가 없는가?
- [ ] 매직 넘버가 상수로 정의되었는가?
- [ ] 코드가 쉽게 확장 가능한가?

**SOLID 체크**:
```typescript
// ✅ 단일 책임 원칙
class UserRepository {
  async findById(id: string): Promise<User> { }
  async save(user: User): Promise<void> { }
}

class UserValidator {
  validate(user: User): ValidationResult { }
}

class UserService {
  constructor(
    private repository: UserRepository,
    private validator: UserValidator
  ) {}

  async createUser(data: UserData): Promise<User> {
    const validationResult = this.validator.validate(data);
    if (!validationResult.isValid) {
      throw new ValidationError(validationResult.errors);
    }
    return await this.repository.save(data);
  }
}

// ❌ 다중 책임
class UserManager {
  async findById(id: string) { }
  async save(user: User) { }
  validate(user: User) { }
  sendEmail(user: User) { }
  generateReport() { }
  // 너무 많은 책임!
}
```

#### ✅ 의존성
- [ ] 순환 의존성이 없는가?
- [ ] 의존성 주입(DI)이 적절히 사용되었는가?
- [ ] 인터페이스를 통한 추상화가 이루어졌는가?

---

### 9. 협업 (Collaboration)

#### ✅ PR 설명
- [ ] PR 제목이 변경 내용을 명확히 설명하는가?
- [ ] 변경 이유가 설명되어 있는가?
- [ ] 테스트 완료 여부가 명시되어 있는가?
- [ ] Breaking changes가 있다면 문서화되었는가?

#### ✅ 커밋 이력
- [ ] 커밋 메시지가 Conventional Commits 규칙을 따르는가?
- [ ] 커밋이 논리적 단위로 분리되어 있는가?
- [ ] 커밋이 너무 크지 않은가? (300줄 이하 권장)
- [ ] WIP 커밋이 squash되었는가?

---

## 🔍 Pull Request 특화 체크리스트

### PR 영향도 분석

#### ✅ Breaking Changes
- [ ] API 시그니처가 변경되었는가?
- [ ] 데이터베이스 스키마가 변경되었는가?
- [ ] 환경 변수가 추가/변경되었는가?
- [ ] 의존성이 크게 변경되었는가? (major version up)

**Breaking Changes 예시**:
```typescript
// ❌ Breaking: 파라미터 변경
// Before
function calculateTotal(price: number): number

// After
function calculateTotal(price: number, tax: number): number

// ✅ Non-breaking: 기본값 제공
function calculateTotal(price: number, tax: number = 0.1): number
```

#### ✅ 하위 호환성
- [ ] 기존 사용자가 영향받지 않는가?
- [ ] 마이그레이션 가이드가 제공되는가?
- [ ] Deprecated 경고가 적절히 표시되는가?

#### ✅ 영향받는 영역
- [ ] 변경이 다른 모듈에 영향을 주는가?
- [ ] 공유 유틸리티나 타입이 변경되었는가?
- [ ] 전역 설정이 변경되었는가?

---

### 테스트 범위 제안

#### ✅ 단위 테스트
- [ ] 새로운 함수/메서드에 테스트가 있는가?
- [ ] 변경된 로직에 테스트가 업데이트되었는가?
- [ ] 엣지 케이스가 커버되는가?

#### ✅ 통합 테스트
- [ ] API 엔드포인트 변경 시 통합 테스트가 있는가?
- [ ] 데이터베이스 상호작용이 테스트되는가?
- [ ] 외부 서비스 연동이 테스트되는가?

#### ✅ E2E 테스트
- [ ] 주요 사용자 흐름이 테스트되는가?
- [ ] UI 변경 시 E2E 테스트가 업데이트되었는가?

---

### 문서화

#### ✅ 코드 문서
- [ ] README가 업데이트되었는가?
- [ ] API 문서가 업데이트되었는가?
- [ ] 변경 로그(CHANGELOG)가 작성되었는가?
- [ ] JSDoc이 추가/업데이트되었는가?

#### ✅ 마이그레이션 가이드
- [ ] Breaking changes에 대한 마이그레이션 가이드가 있는가?
- [ ] 업그레이드 절차가 명시되어 있는가?
- [ ] 예시 코드가 제공되는가?

**마이그레이션 가이드 예시**:
```markdown
## Migration Guide: v1.0 → v2.0

### Breaking Changes

#### 1. calculateTotal 함수 시그니처 변경

**Before**:
```typescript
calculateTotal(price: number): number
```

**After**:
```typescript
calculateTotal(price: number, options?: { tax?: number }): number
```

**Migration**:
```typescript
// Old code
const total = calculateTotal(100);

// New code
const total = calculateTotal(100, { tax: 0.1 });
```
```

---

## 🎯 리뷰 우선순위

### P0 - Critical (즉시 수정)
- [ ] 보안 취약점 (SQL 인젝션, XSS, 평문 비밀번호 등)
- [ ] 데이터 손실 가능성
- [ ] 프로덕션 장애 가능성
- [ ] 법적/규제 위반

### P1 - High (24시간 내 수정)
- [ ] 심각한 성능 문제 (O(n²) 이상)
- [ ] 테스트 커버리지 < 70%
- [ ] 에러 처리 누락
- [ ] 타입 안전성 부족

### P2 - Medium (1주 내 수정)
- [ ] 함수 길이 > 25줄
- [ ] 중첩 깊이 > 3
- [ ] 코드 중복
- [ ] 네이밍 개선 필요

### P3 - Low (선택적 개선)
- [ ] 주석 추가
- [ ] 리팩터링 제안
- [ ] 최적화 제안
- [ ] 스타일 개선

---

## 📝 리뷰 코멘트 템플릿

### 문제 지적 템플릿
```markdown
**[P0] 보안: SQL 인젝션 취약점**

**위치**: `auth.ts:15`

**문제**:
사용자 입력을 직접 쿼리에 삽입하여 SQL 인젝션 공격에 취약합니다.

**현재 코드**:
```typescript
const query = `SELECT * FROM users WHERE email = '${email}'`;
```

**제안**:
```typescript
const query = 'SELECT * FROM users WHERE email = ?';
db.query(query, [email]);
```

**참고**: OWASP Top 10 - A03:2021 Injection
```

### 긍정적 피드백 템플릿
```markdown
**✅ 좋은 코드**

**위치**: `userService.ts:45-60`

**이유**:
- 명확한 변수명 사용
- 적절한 에러 처리
- 완전한 테스트 커버리지 (95%)

계속 이런 수준의 코드를 유지해주세요!
```

### 제안 템플릿
```markdown
**💡 개선 제안**

**위치**: `utils/helpers.ts:23`

**제안**:
`filter().map()` 체인을 `reduce()`로 통합하면 단일 패스로 성능을 개선할 수 있습니다.

**현재** (O(2n)):
```typescript
const active = items.filter(i => i.active);
const prices = active.map(i => i.price);
```

**제안** (O(n)):
```typescript
const prices = items.reduce((acc, i) => {
  return i.active ? [...acc, i.price] : acc;
}, []);
```
```

---

## 🚀 자동화 도구 체크리스트

### CI/CD 파이프라인
- [ ] ESLint가 실행되는가?
- [ ] TypeScript 타입 체크가 실행되는가?
- [ ] 단위 테스트가 실행되는가?
- [ ] 테스트 커버리지가 측정되는가?
- [ ] 빌드가 성공하는가?

### 정적 분석
- [ ] SonarQube 분석이 실행되는가?
- [ ] 보안 스캔이 실행되는가? (Snyk, npm audit)
- [ ] 번들 사이즈가 체크되는가?
- [ ] 접근성 검사가 실행되는가? (axe-core)

---

> **Best Practice**: 리뷰 시 긍정적 피드백과 개선 제안을 균형있게 제공하여 건설적인 리뷰 문화를 만듭니다.
