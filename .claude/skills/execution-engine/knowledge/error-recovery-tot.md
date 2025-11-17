# ToT 기반 에러 복구 전략

## 에러 타입 분류

### Type A: Syntax/Import 에러 (Quick Fix)
- `React is not defined` → add import
- `Cannot find module` → fix path
- `Unused variable` → remove or use

### Type B: Logic/Design 에러 (Rethinking)
- `Function returns wrong type` → check design
- `State management not working` → review architecture

### Type C: Dependency 에러 (Setup)
- `Module not found` → install dependency
- `Environment variable not set` → use default + warning

### Type D: Test Failure (Regression)
- Existing test broken → update test or fix code

---

## Multi-Path 복구

### 예시: Import 에러

**에러**: `Cannot find module '@/components/Button'`

**후보 옵션 생성**:
```markdown
Option A: Fix import path
- 난이도: Low (5/10)
- 시간: 1분
- 성공률: High (9/10)
- 리스크: None (10/10)
- **총점: 90/100** ✅

Option B: Create missing module
- 난이도: Medium (6/10)
- 시간: 15분
- 성공률: Medium (7/10)
- 리스크: Medium (6/10)
- **총점: 68/100**

Option C: Use alternative component
- 난이도: Low (8/10)
- 시간: 2분
- 성공률: Medium (7/10)
- 리스크: Low (8/10)
- **총점: 76/100**
```

**실행 순서**:
```markdown
1. Try Option A (90점)
   → fileSearch로 Button 찾기
   → 경로 수정
   → yarn lint
   → ✅ 성공

2. Backtrack to Option C (76점) - if A fails
   → 대안 컴포넌트 탐색
   → import 변경
   → // FIXME: 추후 Button으로 교체 필요

3. Backtrack to Option B (68점) - if C fails
   → 요구사항 확인
   → Button 생성
   → ✅ 성공
```

---

## 자율 vs 사용자 개입 기준

### ✅ 자율 실행
- Lint 에러 수정
- Import 경로 탐색
- Type 추론 및 수정
- Missing deps 설치
- 환경변수 기본값 설정

### 🛑 사용자 개입
- 요구사항 모호함
- Critical 보안 이슈
- UI 컴포넌트 수동 검증
- Phase 완료 후 계속 여부

### 📋 Deferred (주석 처리)
```typescript
// FIXME: [이슈] - [위치]
// REVIEW: [개선 제안] - [위치]
// WARNING: [경고] - [위치]
```

---

> **참고**: `error_analyzer.sh`로 에러 타입 자동 감지 및 복구 옵션 생성
