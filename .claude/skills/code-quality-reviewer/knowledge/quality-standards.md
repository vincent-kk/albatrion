# Code Quality Standards

> 코드 품질 평가를 위한 표준 기준 및 메트릭 정의

## 📊 품질 평가 체계

### 전체 점수 계산 공식

```
Total Score = (Readability × 0.25) + (Performance × 0.20) +
              (Explicit I/O × 0.15) + (Maintainability × 0.25) +
              (Error Handling × 0.10) + (Collaboration × 0.05)
```

### 등급 체계

| 점수 범위 | 등급 | 상태 | 액션 |
|----------|------|------|------|
| 90-100 | A+ | 우수 | 유지 |
| 80-89 | A | 양호 | 선택적 개선 |
| 70-79 | B+ | 보통 | 권장 개선 |
| 60-69 | B | 미흡 | 개선 필요 |
| 50-59 | C | 불량 | 즉시 개선 |
| 0-49 | D-F | 심각 | 전면 재작성 |

---

## 1. 가독성 (Readability) - 25%

### 1.1 함수 길이 (Function Length)

**메트릭 정의**:
```yaml
function_length:
  weight: 0.08
  scoring:
    ideal: "≤ 15 lines"
    acceptable: "16-25 lines"
    warning: "26-40 lines"
    critical: "> 40 lines"

  calculation:
    score_100: "length ≤ 15"
    score_90: "15 < length ≤ 20"
    score_70: "20 < length ≤ 25"
    score_50: "25 < length ≤ 40"
    score_20: "length > 40"
```

**자동 검증**:
```typescript
function calculateFunctionLengthScore(lineCount: number): number {
  if (lineCount <= 15) return 100;
  if (lineCount <= 20) return 90;
  if (lineCount <= 25) return 70;
  if (lineCount <= 40) return 50;
  return 20;
}
```

**권장 조치**:
- **≤ 15줄**: 이상적, 조치 불필요
- **16-25줄**: 수용 가능, 개선 권장
- **26-40줄**: 함수 분리 검토
- **> 40줄**: 즉시 리팩터링 필요

### 1.2 순환 복잡도 (Cyclomatic Complexity)

**메트릭 정의**:
```yaml
cyclomatic_complexity:
  weight: 0.08
  scoring:
    ideal: "≤ 5"
    acceptable: "6-10"
    warning: "11-15"
    critical: "> 15"

  calculation:
    # McCabe's Cyclomatic Complexity
    # V(G) = E - N + 2P
    # E = edges, N = nodes, P = connected components
    score_100: "complexity ≤ 5"
    score_80: "5 < complexity ≤ 10"
    score_50: "10 < complexity ≤ 15"
    score_20: "complexity > 15"
```

**복잡도 증가 요인**:
- `if`, `else if`, `else` (+1 each)
- `for`, `while`, `do-while` (+1 each)
- `case` in switch (+1 each)
- `&&`, `||` in conditions (+1 each)
- `catch` blocks (+1 each)
- `? :` ternary operator (+1)

**권장 조치**:
- **≤ 5**: 단순하고 테스트 용이
- **6-10**: 복잡도 관리 가능
- **11-15**: 함수 분해 권장
- **> 15**: 즉시 리팩터링 필수

### 1.3 중첩 깊이 (Nesting Depth)

**메트릭 정의**:
```yaml
nesting_depth:
  weight: 0.04
  scoring:
    ideal: "≤ 2"
    acceptable: "3"
    warning: "4"
    critical: "> 4"

  calculation:
    score_100: "depth ≤ 2"
    score_80: "depth = 3"
    score_40: "depth = 4"
    score_10: "depth > 4"
```

**예시**:
```typescript
// ❌ 깊이 5 (심각)
function processData(data) {
  if (data) {                      // 깊이 1
    for (let item of data) {        // 깊이 2
      if (item.valid) {              // 깊이 3
        try {                         // 깊이 4
          if (item.category === 'A') { // 깊이 5
            // ...
          }
        } catch (e) { }
      }
    }
  }
}

// ✅ 깊이 2 (이상적)
function processData(data) {
  if (!data) return;  // Early return

  const validItems = data.filter(item => item.valid);
  const categoryAItems = validItems.filter(item => item.category === 'A');

  categoryAItems.forEach(processItem);  // 깊이 2
}
```

### 1.4 변수명 명확성 (Variable Naming Clarity)

**메트릭 정의**:
```yaml
variable_naming:
  weight: 0.05
  scoring:
    ideal: "All names descriptive (≥ 3 chars, meaningful)"
    acceptable: "< 5% generic names"
    warning: "5-15% generic names"
    critical: "> 15% generic names"

  banned_names:
    - 'data'
    - 'temp'
    - 'tmp'
    - 'foo'
    - 'bar'
    - 'baz'
    - 'x'
    - 'y'
    - 'z'
    - 'flag'
    - 'val'
    - 'obj'

  allowed_abbreviations:
    - 'id' # identifier
    - 'url' # uniform resource locator
    - 'api' # application programming interface
    - 'db' # database
    - 'sql' # structured query language
    - 'html' # hypertext markup language
    - 'css' # cascading style sheets
    - 'json' # javascript object notation
    - 'xml' # extensible markup language
```

**네이밍 패턴**:
- **함수**: `동사 + 명사` (e.g., `calculateTotal`, `fetchUser`)
- **변수**: `명사` 또는 `형용사 + 명사` (e.g., `userEmail`, `isActive`)
- **상수**: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_COUNT`)
- **클래스**: `PascalCase` (e.g., `UserRepository`)
- **인터페이스**: `PascalCase` (e.g., `IUserService`)

---

## 2. 성능 (Performance) - 20%

### 2.1 시간 복잡도 (Time Complexity)

**메트릭 정의**:
```yaml
time_complexity:
  weight: 0.12
  scoring:
    ideal: "O(1) or O(log n)"
    acceptable: "O(n)"
    warning: "O(n log n)"
    critical: "O(n²) or worse"

  calculation:
    score_100: "O(1) or O(log n)"
    score_90: "O(n)"
    score_60: "O(n log n)"
    score_30: "O(n²)"
    score_10: "O(2ⁿ) or O(n!)"
```

**일반적인 복잡도**:

| 연산 | O(1) | O(log n) | O(n) | O(n log n) | O(n²) |
|------|------|----------|------|------------|-------|
| Map.get() | ✅ | | | | |
| Array.find() | | | ✅ | | |
| Binary Search | | ✅ | | | |
| Array.sort() | | | | ✅ | |
| Nested loop | | | | | ✅ |

### 2.2 공간 복잡도 (Space Complexity)

**메트릭 정의**:
```yaml
space_complexity:
  weight: 0.05
  scoring:
    ideal: "O(1)"
    acceptable: "O(log n) or O(n)"
    warning: "O(n log n)"
    critical: "O(n²) or worse"

  calculation:
    score_100: "O(1)"
    score_90: "O(log n)"
    score_80: "O(n)"
    score_50: "O(n log n)"
    score_20: "O(n²) or worse"
```

### 2.3 반복 최소화 (Iteration Minimization)

**메트릭 정의**:
```yaml
iteration_efficiency:
  weight: 0.03
  patterns:
    single_pass:
      score: 100
      description: "filter().map().reduce() 체이닝"

    multi_pass:
      score: 70
      description: "별도의 filter, map, reduce 호출"

    nested_loops:
      score: 30
      description: "중첩 루프 사용"
```

**예시**:
```typescript
// ✅ 단일 패스 (100점)
const total = items
  .filter(i => i.active)
  .map(i => i.price)
  .reduce((sum, p) => sum + p, 0);

// ⚠️ 다중 패스 (70점)
const active = items.filter(i => i.active);
const prices = active.map(i => i.price);
const total = prices.reduce((sum, p) => sum + p, 0);

// ❌ 중첩 루프 (30점)
let total = 0;
for (let item of items) {
  if (item.active) {
    for (let price of item.prices) {
      total += price;
    }
  }
}
```

---

## 3. 명시적 I/O (Explicit I/O) - 15%

### 3.1 타입 커버리지 (Type Coverage)

**메트릭 정의**:
```yaml
type_coverage:
  weight: 0.10
  scoring:
    ideal: "100%"
    acceptable: "≥ 95%"
    warning: "85-94%"
    critical: "< 85%"

  calculation:
    score_100: "coverage = 100%"
    score_90: "95% ≤ coverage < 100%"
    score_70: "85% ≤ coverage < 95%"
    score_40: "70% ≤ coverage < 85%"
    score_20: "coverage < 70%"
```

**타입 안전성 체크**:
- **함수 파라미터**: 모든 파라미터 타입 명시
- **함수 반환**: 반환 타입 명시 (void 포함)
- **변수 선언**: `any` 사용 최소화
- **제네릭**: 적절한 제약 조건 (extends)

### 3.2 주석 품질 (Documentation Quality)

**메트릭 정의**:
```yaml
documentation_quality:
  weight: 0.05
  scoring:
    ideal: "JSDoc for all public APIs"
    acceptable: "≥ 80% coverage"
    warning: "50-79% coverage"
    critical: "< 50% coverage"

  required_elements:
    - description: "함수 역할 설명"
    - params: "@param 태그로 모든 파라미터 문서화"
    - returns: "@returns 태그로 반환값 설명"
    - throws: "@throws 태그로 예외 문서화"
    - example: "@example 태그로 사용 예시 (선택적)"
```

**JSDoc 예시**:
```typescript
/**
 * 사용자 주문을 처리하고 영수증을 생성합니다.
 *
 * @param userId - 사용자 고유 ID (UUID 형식)
 * @param items - 주문 항목 배열 (최소 1개 이상)
 * @returns 처리된 주문 영수증
 * @throws {ValidationError} 주문 항목이 비어있을 때
 * @throws {PaymentError} 결제 처리 실패 시
 * @throws {InventoryError} 재고 부족 시
 *
 * @example
 * const receipt = await processOrder('user-123', [
 *   { productId: 'p-456', quantity: 2 }
 * ]);
 */
async function processOrder(
  userId: string,
  items: OrderItem[]
): Promise<Receipt> {
  // ...
}
```

---

## 4. 유지보수성 (Maintainability) - 25%

### 4.1 SOLID 원칙 준수 (SOLID Principles)

**메트릭 정의**:
```yaml
solid_compliance:
  weight: 0.10
  principles:
    single_responsibility:
      weight: 0.30
      check: "클래스/함수가 하나의 책임만 가지는가?"

    open_closed:
      weight: 0.20
      check: "확장에 열려있고 수정에 닫혀있는가?"

    liskov_substitution:
      weight: 0.15
      check: "서브타입이 기본 타입을 대체 가능한가?"

    interface_segregation:
      weight: 0.15
      check: "인터페이스가 필요 이상으로 크지 않은가?"

    dependency_inversion:
      weight: 0.20
      check: "구체화가 아닌 추상화에 의존하는가?"
```

**단일 책임 원칙 (SRP) 체크리스트**:
```typescript
// ✅ 단일 책임
class UserRepository {
  async findById(id: string): Promise<User> { }
  async save(user: User): Promise<void> { }
}

class UserValidator {
  validate(user: User): ValidationResult { }
}

class EmailService {
  sendWelcomeEmail(user: User): Promise<void> { }
}

// ❌ 다중 책임
class UserManager {
  async findById(id: string) { }  // 데이터 접근
  validate(user: User) { }        // 검증
  sendEmail(user: User) { }       // 이메일 발송
  logActivity(action: string) { } // 로깅
  // 너무 많은 책임!
}
```

### 4.2 테스트 커버리지 (Test Coverage)

**메트릭 정의**:
```yaml
test_coverage:
  weight: 0.10
  scoring:
    ideal: "≥ 90%"
    acceptable: "80-89%"
    warning: "70-79%"
    critical: "< 70%"

  coverage_types:
    line_coverage:
      weight: 0.40
      target: "≥ 90%"

    branch_coverage:
      weight: 0.35
      target: "≥ 85%"

    function_coverage:
      weight: 0.25
      target: "≥ 95%"

  calculation:
    total_coverage = (line × 0.40) + (branch × 0.35) + (function × 0.25)
```

**테스트 유형별 권장**:

| 코드 유형 | Line | Branch | Function | 우선순위 |
|----------|------|--------|----------|---------|
| 비즈니스 로직 | ≥ 95% | ≥ 90% | 100% | P0 |
| API 엔드포인트 | ≥ 90% | ≥ 85% | 100% | P0 |
| 유틸리티 함수 | ≥ 85% | ≥ 80% | ≥ 95% | P1 |
| UI 컴포넌트 | ≥ 70% | ≥ 65% | ≥ 80% | P2 |

### 4.3 중복 코드 (Code Duplication)

**메트릭 정의**:
```yaml
code_duplication:
  weight: 0.05
  scoring:
    ideal: "0% duplication"
    acceptable: "< 5% duplication"
    warning: "5-10% duplication"
    critical: "> 10% duplication"

  detection:
    min_lines: 6  # 최소 6줄 이상 중복 시 감지
    min_tokens: 50  # 최소 50 토큰 이상 중복 시 감지

  calculation:
    duplication_ratio = (duplicated_lines / total_lines) × 100
    score_100: "ratio = 0%"
    score_90: "0% < ratio ≤ 3%"
    score_70: "3% < ratio ≤ 5%"
    score_40: "5% < ratio ≤ 10%"
    score_20: "ratio > 10%"
```

---

## 5. 에러 처리 (Error Handling) - 10%

### 5.1 예외 처리 완전성 (Exception Handling Completeness)

**메트릭 정의**:
```yaml
exception_handling:
  weight: 0.06
  scoring:
    ideal: "모든 try-catch에서 적절한 처리"
    acceptable: "≥ 90% 적절한 처리"
    warning: "70-89% 적절한 처리"
    critical: "< 70% 적절한 처리"

  anti_patterns:
    - pattern: "catch (e) { }"
      severity: "critical"
      description: "빈 catch 블록 (에러 무시)"

    - pattern: "catch (e) { console.log(e); }"
      severity: "warning"
      description: "console.log만 사용 (로깅 부족)"

    - pattern: "catch (e) { return null; }"
      severity: "warning"
      description: "에러를 숨김 (silent failure)"

    - pattern: "catch (e) { throw e; }"
      severity: "info"
      description: "컨텍스트 추가 없이 재throw"
```

**권장 패턴**:
```typescript
// ✅ 적절한 에러 처리
async function fetchUser(id: string): Promise<User> {
  try {
    return await api.getUser(id);
  } catch (error) {
    // 1. 에러 타입별 처리
    if (error instanceof NotFoundError) {
      logger.warn('User not found', { userId: id });
      throw new UserNotFoundError(id);
    }

    if (error instanceof NetworkError) {
      logger.error('Network error during user fetch', {
        userId: id,
        error: error.message,
        stack: error.stack
      });
      throw new ServiceUnavailableError('User service temporarily unavailable');
    }

    // 2. 예상치 못한 에러 로깅 + 재throw
    logger.error('Unexpected error in fetchUser', {
      userId: id,
      error
    });
    throw error;
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

### 5.2 로깅 품질 (Logging Quality)

**메트릭 정의**:
```yaml
logging_quality:
  weight: 0.04
  scoring:
    ideal: "구조화된 로깅 + 충분한 컨텍스트"
    acceptable: "기본 로깅 + 일부 컨텍스트"
    warning: "console.log만 사용"
    critical: "로깅 없음"

  required_fields:
    - timestamp: "ISO 8601 형식"
    - level: "debug, info, warn, error"
    - message: "명확한 설명"
    - context: "관련 데이터 (user ID, request ID 등)"
    - error: "에러 객체 (스택 트레이스 포함)"

  log_levels:
    debug: "개발 디버깅용"
    info: "정상 동작 추적"
    warn: "주의 필요 (복구 가능)"
    error: "에러 발생 (조치 필요)"
```

**로깅 예시**:
```typescript
// ✅ 구조화된 로깅
logger.error('Payment processing failed', {
  orderId: order.id,
  userId: user.id,
  amount: order.total,
  paymentMethod: order.paymentMethod,
  attemptCount: retryCount,
  error: error.message,
  stack: error.stack,
  timestamp: new Date().toISOString()
});

// ❌ 불충분한 로깅
console.log('Error:', error);
```

---

## 6. 협업 프로세스 (Collaboration) - 5%

### 6.1 커밋 메시지 품질 (Commit Message Quality)

**메트릭 정의**:
```yaml
commit_message_quality:
  weight: 0.03
  format: "Conventional Commits"

  scoring:
    ideal: "100% 규칙 준수"
    acceptable: "≥ 80% 규칙 준수"
    warning: "60-79% 규칙 준수"
    critical: "< 60% 규칙 준수"

  required_format:
    pattern: "type(scope): subject"
    types:
      - feat: "새로운 기능"
      - fix: "버그 수정"
      - docs: "문서 변경"
      - style: "코드 포맷팅"
      - refactor: "리팩터링"
      - test: "테스트 추가/수정"
      - chore: "빌드/설정 변경"

    subject_rules:
      - "소문자로 시작"
      - "명령형 사용 (add, not added)"
      - "50자 이내"
      - "마침표 없음"
```

**예시**:
```bash
# ✅ 좋은 커밋 메시지
feat(auth): add email validation to user registration

- Implement RFC 5322 email validation
- Add unit tests for edge cases
- Update user schema with email constraints

Closes #123

# ❌ 나쁜 커밋 메시지
update code
fix bug
changes
```

### 6.2 PR 설명 품질 (Pull Request Description Quality)

**메트릭 정의**:
```yaml
pr_description_quality:
  weight: 0.02

  required_sections:
    - summary: "변경 내용 요약"
    - motivation: "변경 이유"
    - testing: "테스트 완료 여부"
    - breaking_changes: "Breaking changes (있을 경우)"
    - review_points: "리뷰 포인트"

  scoring:
    ideal: "모든 섹션 완비 + 명확한 설명"
    acceptable: "필수 섹션 포함"
    warning: "일부 섹션 누락"
    critical: "설명 없음"
```

---

## 🎯 우선순위 매트릭스

### 심각도 레벨

| 심각도 | 점수 | 액션 | 예시 |
|--------|------|------|------|
| **P0 (Critical)** | < 50 | 즉시 수정 | SQL 인젝션, 평문 비밀번호 |
| **P1 (High)** | 50-69 | 24시간 내 수정 | 테스트 커버리지 < 70%, O(n²) 알고리즘 |
| **P2 (Medium)** | 70-79 | 1주 내 수정 | 함수 길이 > 25줄, 중첩 깊이 4 |
| **P3 (Low)** | 80-89 | 선택적 개선 | 네이밍 개선, 주석 추가 |

### 영향도 vs 노력도

| 영향도 | 노력도 낮음 | 노력도 중간 | 노력도 높음 |
|--------|-----------|-----------|-----------|
| **높음** | Quick Win (P0) | High Value (P1) | Strategic (P2) |
| **중간** | Easy Fix (P2) | Standard (P2) | Consider (P3) |
| **낮음** | Nice to Have (P3) | Low Priority | Defer |

---

## 📈 개선 추적

### 개선 목표 설정

```yaml
improvement_targets:
  quarterly_goals:
    q1:
      overall_score: "70 → 80"
      test_coverage: "60% → 80%"
      security_issues: "5 → 0"

    q2:
      overall_score: "80 → 85"
      test_coverage: "80% → 85%"
      code_duplication: "8% → 3%"
```

### 메트릭 대시보드

```markdown
## 코드 품질 대시보드 (2024-Q1)

### 📊 전체 점수: 78/100 (B+)

#### 카테고리별 점수
- 가독성: 82/100 ✅
- 성능: 75/100 ⚠️
- 타입 안전성: 95/100 ✅
- 유지보수성: 70/100 ⚠️
- 에러 처리: 65/100 🔴
- 협업: 90/100 ✅

#### 주요 개선 포인트
1. [P0] 에러 처리 개선 (65 → 80)
2. [P1] 유지보수성 향상 (70 → 80)
3. [P2] 성능 최적화 (75 → 85)
```

---

> **Note**: 이 문서는 코드 품질 평가의 기준이 되는 메트릭과 임계값을 정의합니다.
> 실제 프로젝트에 적용 시 팀 특성에 맞게 가중치와 임계값을 조정할 수 있습니다.
