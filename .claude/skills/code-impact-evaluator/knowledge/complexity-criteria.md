# Complexity Assessment Criteria

## Scoring System

Calculate the total complexity score by checking each criterion against the code change.

### 1. API Signature Changes (+2 points)

**What to look for:**
- Function parameters added, removed, or reordered
- Return type changed
- Function renamed (if public/exported)
- Breaking changes to public interfaces
- Method signatures in exported classes

**Examples:**
```typescript
// Before
function getUser(id: string): User

// After - Signature changed (+2)
async function getUser(id: string, options?: Options): Promise<User>
```

### 2. Type Definition Changes (+2 points)

**What to look for:**
- Public type interfaces modified
- Generic constraints changed
- Type exports added or removed
- Union/Intersection type modifications
- Type narrowing or widening

**Examples:**
```typescript
// Before
export type CacheValue = string | number;

// After - Type definition changed (+2)
export type CacheValue = string | number | Promise<string | number>;
```

### 3. Complex Conditionals (+1 point)

**What to look for:**
- 3 or more nested if statements
- Complex boolean logic (4+ conditions)
- State machine changes
- Switch statements with 5+ cases
- Nested ternary operators (2+ levels)

**Examples:**
```typescript
// Complex conditional (+1)
if (user.role === 'admin') {
  if (resource.type === 'private') {
    if (user.permissions.includes('read')) {
      // 3 levels deep
    }
  }
}

// Complex boolean (+1)
if ((a && b) || (c && d) || (e && f) || (g && h)) {
  // 4+ conditions
}
```

### 4. Performance Critical Areas (+2 points)

**What to look for:**
- Caching logic modifications
- Database query changes
- API rate limiting updates
- Memory management (large arrays, buffers)
- Loop optimizations
- Lazy loading / Code splitting changes

**Examples:**
```typescript
// Performance critical - Caching (+2)
const cache = new LRUCache({ max: 1000 });

// Performance critical - Database query (+2)
const users = await db.query()
  .where('active', true)
  .limit(1000);
```

### 5. Security Related (+3 points)

**What to look for:**
- Authentication logic
- Authorization/permissions checking
- Encryption/Decryption operations
- Input validation/sanitization
- SQL injection prevention
- XSS prevention
- CSRF token handling
- Password hashing
- API key management

**Examples:**
```typescript
// Security - Auth (+3)
const token = jwt.sign(payload, SECRET_KEY);

// Security - Input validation (+3)
const sanitized = validator.escape(userInput);

// Security - Authorization (+3)
if (!user.hasPermission('admin')) {
  throw new UnauthorizedError();
}
```

## Scoring Examples

### Example 1: Simple Refactoring (Score: 0)
```typescript
// Before
function getValue() { return cache.get('key') || null; }

// After - Just renamed, no logic change
function getCachedValue() { return cache.get('key') || null; }
```
**Score**: 0 (No criteria met) → **Standard Review**

### Example 2: Moderate Change (Score: 3)
```typescript
// Before
function processData(data: string): string {
  return data.toUpperCase();
}

// After
async function processData(data: string, options?: Options): Promise<string> {
  if (options?.useCache) {
    const cached = await cache.get(data);
    if (cached) return cached;
  }
  return data.toUpperCase();
}
```
**Score**: 
- API Signature Change: +2 (async, new param, return type)
- Performance Critical: +2 (caching)
- **Total: 4** → **BFS ToT Analysis**

### Example 3: High Complexity (Score: 7)
```typescript
// Before
function login(username: string, password: string): boolean {
  return validateCredentials(username, password);
}

// After
async function login(
  username: string, 
  password: string,
  mfaCode?: string
): Promise<LoginResult> {
  const user = await db.users.findOne({ username });
  
  if (!user) return { success: false, reason: 'not_found' };
  
  if (user.isLocked) {
    if (user.lockExpiry > Date.now()) {
      return { success: false, reason: 'locked' };
    } else {
      await db.users.update(user.id, { isLocked: false });
    }
  }
  
  const passwordValid = await bcrypt.compare(password, user.passwordHash);
  if (!passwordValid) {
    await incrementFailedLogins(user.id);
    return { success: false, reason: 'invalid_password' };
  }
  
  if (user.mfaEnabled && !mfaCode) {
    return { success: false, reason: 'mfa_required' };
  }
  
  if (mfaCode && !verifyMfaCode(user.id, mfaCode)) {
    return { success: false, reason: 'invalid_mfa' };
  }
  
  const token = jwt.sign({ userId: user.id }, SECRET_KEY);
  return { success: true, token };
}
```
**Score**:
- API Signature Change: +2 (async, new param, different return type)
- Type Definition Change: +2 (boolean → LoginResult)
- Complex Conditionals: +1 (nested if with 3+ levels)
- Security Related: +3 (authentication, password hashing, JWT)
- **Total: 8** → **DFS ToT Analysis + Consider Human Review**

## Decision Matrix

| Score | Approach | Token Cost | Use Case |
|-------|----------|------------|----------|
| 0-2 | Standard Review | ~1K | Simple refactoring, formatting |
| 3-5 | BFS ToT | ~3K | Moderate complexity, API changes |
| 6-8 | DFS ToT | ~4.5K | High complexity, security changes |
| 9+ | DFS + Human Review | ~5K | Architectural changes, critical systems |

## Assessment Process

```typescript
function assessComplexity(change: CodeChange): number {
  let score = 0;
  
  // Check each criterion
  if (hasAPISignatureChange(change)) score += 2;
  if (hasTypeDefinitionChange(change)) score += 2;
  if (hasComplexConditionals(change)) score += 1;
  if (isPerformanceCritical(change)) score += 2;
  if (isSecurityRelated(change)) score += 3;
  
  return score;
}

function selectAnalysisApproach(score: number): string {
  if (score < 3) return 'standard';
  if (score <= 5) return 'tot-bfs';
  return 'tot-dfs';
}
```

## When in Doubt

**Default to higher score** (safety first principle):
- Uncertain if API is public? → Assume it is (+2)
- Uncertain if security-related? → Treat as such (+3)
- Uncertain about performance impact? → Flag as critical (+2)

Better to apply ToT unnecessarily than miss a critical issue.
