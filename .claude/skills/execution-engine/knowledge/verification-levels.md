# 3-레벨 검증 시스템

## Level 1: 코드 검증 (필수, 자동)

### Lint 검사
```bash
yarn lint  # 또는 프로젝트별 lint 명령
```

**통과 조건**: 0 errors, warnings 허용

### Type 검사
```bash
yarn typecheck  # TypeScript
```

**통과 조건**: 0 type errors

### Build 검사 (critical 변경 시만)
```bash
yarn build
```

**실행 조건**:
- 인프라 수정 (webpack, vite 설정)
- 타입 정의 변경
- 공통 모듈 수정

---

## Level 2: 기능 검증 (필수, 자동 우선)

### 자동 검증 (우선 시도)

**Utility/Helper 함수**:
```bash
# 임시 테스트 파일 생성
cat > /tmp/test-util.ts << 'EOF'
import { utilFunction } from './src/utils/module';
const result = utilFunction(testInput);
console.assert(result === expected);
EOF

node /tmp/test-util.ts
rm /tmp/test-util.ts
```

**API 엔드포인트**:
```bash
# GraphQL
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ entity { id } }"}'

# REST
curl http://localhost:3000/api/endpoint
```

**컴포넌트 (테스트 존재 시)**:
```bash
yarn test --run ComponentName.test.tsx
```

### 수동 검증 (Fallback)

**UI 컴포넌트 (자동 불가 시)**:
```markdown
🛑 Manual Testing Required

Component: {컴포넌트명}
Server: http://localhost:6006 (Storybook)

Test Steps:
1. {완료 필드에서 추출한 테스트 단계}
2. Verify: {예상 결과}

Reply: "pass" to continue
```

---

## Level 3: 요구사항 검증 (필수, 자동)

### EARS 요구사항 확인
```bash
# 1. 요구사항 ID 추출
REQ_ID=$(grep "Requirements:" 03_plan.md | awk '{print $2}')

# 2. 요구사항 내용 로드
cat 01_requirements.md | grep -A 20 "$REQ_ID"
```

### WHEN/THEN 검증
```typescript
// 요구사항 예시:
// WHEN 사용자가 버튼을 클릭할 때
// THEN 시스템은 모달을 표시해야 한다

검증:
1. WHEN 조건 테스트: 버튼 클릭 이벤트 발생
2. THEN 결과 확인: 모달 DOM 존재 확인
3. 모든 acceptance criteria 충족 확인
```

### Acceptance Criteria 체크리스트
```markdown
- [ ] WHEN 조건 1 → THEN 결과 1 ✓
- [ ] WHEN 조건 2 → THEN 결과 2 ✓
- [ ] IF 조건 → THEN 결과 ✓
- [ ] Non-functional: 성능, 접근성, 보안 ✓
```

---

## 검증 실패 처리

### Level 1 실패
```markdown
❌ DO NOT proceed
❌ DO NOT update checkbox
✅ Fix errors immediately
✅ Re-run Level 1
✅ Only proceed when 0 errors
```

### Level 2 실패
```markdown
자동 검증 실패:
→ 원인 분석 (error_analyzer.sh)
→ ToT 복구 시도
→ 재검증

수동 검증 실패 (사용자 "fail"):
→ 이슈 상세 요청
→ 수정
→ 재검증
```

### Level 3 실패
```markdown
요구사항 미충족:
→ 01_requirements.md 재확인
→ 누락 기능 파악
→ 추가 구현
→ 재검증
```

---

> **Best Practice**: 모든 레벨 통과 전까지 체크박스 업데이트 금지
