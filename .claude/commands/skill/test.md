---
description: Test generation and coverage analysis
tags: [testing, test-generator, skills]
---

# Test Generator (Skills-based)

This command utilizes the **test_generator Skill** to automatically generate tests and analyze coverage.

## 📋 Executed Skill

### test_generator

Comprehensive test strategy and automatic generation:

- ✅ **Unit Tests**: Pure functions, utility logic
- ✅ **Component Tests**: React component UI and events
- ✅ **Integration Tests**: API + State + UI integration
- ✅ **E2E Tests**: Complete user scenarios
- ✅ **Coverage Analysis**: Coverage measurement and improvement suggestions
- ✅ **Storybook Integration**: Visual test automation

## 🔧 Generation Tools

1. **test_generator.ts** - TypeScript AST-based automatic test code generation
2. **coverage_analyzer.sh** - Coverage analysis and identification of files below target

## 📊 Output

- Test code files (`*.test.ts(x)`)
- Coverage analysis report
- Priority improvement items

---

**Execution Instructions:**

Please generate tests in the following order:

1. **Activate test_generator skill**
   - Load `.claude/skills/test-generator/knowledge/testing-strategy.md`
   - Specify target file or directory

2. **Determine test type**
   - **Unit**: Pure functions (utils/, helpers/)
   - **Component**: React components (components/)
   - **Integration**: Hooks + API (hooks/)
   - **E2E**: User flows (complete scenarios)

3. **Generate tests**

   ```bash
   # Unit tests
   tsx .claude/skills/test-generator/tools/test_generator.ts src/utils/pricing.ts unit

   # Component tests
   tsx .claude/skills/test-generator/tools/test_generator.ts src/components/Button.tsx component

   # Integration tests
   tsx .claude/skills/test-generator/tools/test_generator.ts src/hooks/useUser.ts integration
   ```

4. **Coverage analysis**

   ```bash
   # Default threshold 70%
   .claude/skills/test-generator/tools/coverage_analyzer.sh

   # Custom threshold 80%
   .claude/skills/test-generator/tools/coverage_analyzer.sh 80
   ```

5. **Generate report**
   - List of generated test files
   - Number of test cases
   - Expected coverage
   - Priority action items

**References:**

- Skills structure: `.claude/skills/test-generator/`
- Testing strategy: `.claude/skills/test-generator/knowledge/testing-strategy.md`
- Existing rules: `.cursor/rules/testing-strategy.mdc` (maintained as rule, for reference)

---

## ⚠️ 문제 해결 (Troubleshooting)

### 스킬을 찾을 수 없는 경우
**문제**: `.claude/skills/test_generator/` 디렉토리가 없음

**Fallback 동작**:
1. ⚠️ 경고 메시지: "test_generator 스킬이 없어 기본 테스트 생성을 수행합니다"
2. 네이티브 방식으로 테스트 생성:
   - 파일 구조 분석
   - 기본 테스트 템플릿 적용
   - 수동 커버리지 추정
3. 결과 품질: 자동화된 패턴 분석 및 엣지 케이스 감지 없음

**해결 방법**:
```bash
# 스킬 디렉토리 확인
ls -la .claude/skills/test_generator/

# 저장소에서 복원
git checkout .claude/skills/test_generator/
```

### 스크립트 실행 실패 시
**문제**: `test_generator.ts` 또는 `coverage_analyzer.sh` 실행 실패

**Fallback 동작**:
1. ⚠️ 자동 생성 실패 알림
2. 수동 테스트 작성 가이드 제공:
   - 테스트 파일 생성 경로
   - 기본 테스트 구조 예시
   - 커버리지 목표 권장사항
3. 템플릿 기반 테스트 제공

**해결 방법**:
```bash
# 스크립트 권한 및 의존성 확인
chmod +x .claude/skills/test_generator/tools/test_generator.ts
chmod +x .claude/skills/test_generator/tools/coverage_analyzer.sh
npm install -g tsx

# 수동 실행
npx tsx .claude/skills/test_generator/tools/test_generator.ts <file>
.claude/skills/test_generator/tools/coverage_analyzer.sh
```

### 테스트 프레임워크 미설치
**문제**: Jest, Vitest, Mocha 등 테스트 프레임워크 미설치

**Fallback 동작**:
1. ⚠️ 프레임워크 감지 실패 경고
2. 일반적인 테스트 패턴 제공:
   - describe/it 구조
   - expect 구문
   - 기본 모킹 예시
3. 프레임워크 설치 가이드 제공

**해결 방법**:
```bash
# Jest 설치
npm install --save-dev jest @types/jest

# Vitest 설치
npm install --save-dev vitest

# 설정 파일 생성
npx jest --init
```

### 커버리지 도구 없음
**문제**: 커버리지 분석 도구 미설치

**Fallback 동작**:
1. ⚠️ 커버리지 분석 생략
2. 수동 커버리지 추정 안내
3. 도구 설치 권장

**해결 방법**:
```bash
# Jest 커버리지
npm test -- --coverage

# Vitest 커버리지
npm run test:coverage

# c8 (범용 커버리지 도구)
npm install --save-dev c8
```

## 📖 사용 예시

### 기본 사용법
```
/test
```

### 고급 사용법
```
/test [파일경로] [테스트타입]
```
- 파일경로: 대상 파일 (선택, 없으면 전체 분석)
- 테스트타입: unit|component|integration|e2e (선택)

### 실제 시나리오

#### 시나리오 1: 유틸 함수 단위 테스트 생성
```
상황: 새로 작성한 pricing.ts 유틸 함수 테스트 필요
명령: /test src/utils/pricing.ts unit
결과:
  - pricing.test.ts 생성
  - 5개 테스트 케이스 자동 생성
  - 엣지 케이스 포함 (0, 음수, null)
```

#### 시나리오 2: 리액트 컴포넌트 테스트 생성
```
상황: Button 컴포넌트의 UI 및 이벤트 테스트
명령: /test src/components/Button.tsx component
결과:
  - Button.test.tsx 생성
  - 렌더링, 클릭, disabled 상태 테스트
  - Storybook 통합 테스트 포함
```

#### 시나리오 3: 프로젝트 전체 커버리지 분석
```
상황: 전체 프로젝트 테스트 커버리지 현황 파악
명령: /test
결과:
  📊 전체 커버리지: 65%
  ⚠️ 70% 미만 파일 목록
  🎯 우선순위 테스트 대상 제안
  → 부족한 파일부터 테스트 작성
```

## 💡 팁
- **타입별 전략**: Unit(순수 함수) → Component(UI) → Integration(통합) → E2E(시나리오) 순서 권장
- **커버리지 목표**: 일반 70%, 중요 로직 90% 이상
- **자동 생성 활용**: 생성된 테스트를 기반으로 엣지 케이스 추가
- **지속적 관리**: 새 기능 추가 시 즉시 테스트 생성


---

## ✅ 성공 시 출력

```
✅ 테스트 생성 완료!

📊 생성 결과:
- 테스트 파일: 3개
- 테스트 케이스: 15개
- 예상 커버리지: +18%

📁 생성된 파일:
- src/utils/pricing.test.ts (5개 테스트)
- src/components/Button.test.tsx (7개 테스트)
- src/hooks/useUser.test.ts (3개 테스트)

📈 커버리지 분석:
- 전체: 73% (목표 70% 달성 ✅)
- 신규 파일: 92%
- 기존 파일: 68% (2개 파일 70% 미만)

⏱️ 실행 시간: 12초

💡 다음 단계: 
1. 테스트 실행: yarn test
2. 커버리지 확인: yarn test:coverage
3. 엣지 케이스 추가 검토
```

## ❌ 실패 시 출력

```
❌ 테스트 생성 실패

🔍 원인:
- 테스트 프레임워크 미설치 (vitest 또는 jest)
- 또는: 대상 파일 분석 실패

💡 해결 방법:
1. 테스트 프레임워크 설치:
   yarn add -D vitest @testing-library/react

2. 테스트 설정 파일 확인:
   cat vitest.config.ts

3. 수동 테스트 생성:
   - test-generator 스킬 없이 기본 템플릿 사용
   - 기존 테스트 파일 참고

📚 추가 도움말: .claude/skills/test-generator/knowledge/testing-strategy.md 참조
```
