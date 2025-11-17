# 버전 관리 전략

> @canard/schema-form 플러그인 개발을 위한 의존성 버전 관리 가이드

## 목차

1. [버전 명명 규칙 (Semantic Versioning)](#버전-명명-규칙)
2. [버전 범위 지정자](#버전-범위-지정자)
3. [버전 업데이트 전략](#버전-업데이트-전략)
4. [의존성 버전 고정 정책](#의존성-버전-고정-정책)
5. [주요 의존성별 버전 관리](#주요-의존성별-버전-관리)
6. [버전 호환성 테스트](#버전-호환성-테스트)
7. [changeset을 통한 버전 관리](#changeset을-통한-버전-관리)

---

## 버전 명명 규칙

### Semantic Versioning (SemVer)

모든 @canard/schema-form 플러그인은 **Semantic Versioning 2.0.0** 규칙을 따릅니다.

```
MAJOR.MINOR.PATCH

예시: 1.2.3
```

#### 각 버전 번호의 의미

| 번호 | 이름 | 증가 시기 | 예시 |
|------|------|----------|------|
| **MAJOR** | 주 버전 | 하위 호환성이 깨지는 변경 (Breaking Change) | API 변경, 인터페이스 수정 |
| **MINOR** | 부 버전 | 하위 호환성을 유지하면서 기능 추가 | 새로운 FormType 추가 |
| **PATCH** | 패치 버전 | 하위 호환성을 유지하는 버그 수정 | 버그 픽스, 성능 개선 |

#### Breaking Change 판단 기준

다음 변경사항은 **MAJOR 버전 업데이트**가 필요합니다:

```typescript
// ❌ MAJOR 버전 업: SchemaFormPlugin 인터페이스 변경
interface SchemaFormPlugin {
  // 기존
  formTypes: Record<string, FormTypeComponent>;

  // 변경 후 (Breaking Change)
  formTypes: Map<string, FormTypeComponent>; // Record → Map 변경
}

// ❌ MAJOR 버전 업: FormTypeInput props 필수 속성 추가
interface FormTypeInputProps {
  value: any;
  onChange: (value: any) => void;
  schema: JSONSchema7;
  newRequiredProp: string; // 새로운 필수 속성 추가
}

// ❌ MAJOR 버전 업: 함수 시그니처 변경
// 기존
function validateValue(value: any): boolean;

// 변경 후
function validateValue(value: any, schema: JSONSchema7): ValidationResult; // 반환 타입 변경
```

#### Minor Version Update 기준

다음 변경사항은 **MINOR 버전 업데이트**가 필요합니다:

```typescript
// ✅ MINOR 버전 업: 새로운 FormType 추가
const plugin: SchemaFormPlugin = {
  formTypes: {
    string: StringInput,
    number: NumberInput,
    // 새로운 FormType 추가 (하위 호환)
    email: EmailInput,
  }
};

// ✅ MINOR 버전 업: 선택적 props 추가
interface FormTypeInputProps {
  value: any;
  onChange: (value: any) => void;
  schema: JSONSchema7;
  // 선택적 속성 추가 (하위 호환)
  customValidation?: (value: any) => boolean;
}

// ✅ MINOR 버전 업: 유틸리티 함수 추가
export function isValidEmail(value: string): boolean; // 새로운 헬퍼 함수
```

#### Patch Version Update 기준

다음 변경사항은 **PATCH 버전 업데이트**가 필요합니다:

```typescript
// ✅ PATCH 버전 업: 버그 수정
function validateEmail(email: string): boolean {
  // 기존 (버그)
  // return /^[^\s@]+@[^\s@]+$/.test(email);

  // 수정 후 (버그 픽스)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ✅ PATCH 버전 업: 성능 개선 (동작 동일)
function processData(data: any[]): any[] {
  // 기존
  // return data.map(item => transform(item));

  // 개선 후 (동작 동일, 성능 향상)
  return data.map(transform);
}

// ✅ PATCH 버전 업: 타입 정의 오류 수정
// 기존
type FormValue = string | number;

// 수정 후
type FormValue = string | number | boolean; // 실제 사용 가능한 타입 반영
```

---

## 버전 범위 지정자

### package.json에서 사용하는 버전 범위

| 지정자 | 의미 | 예시 | 허용 버전 |
|--------|------|------|-----------|
| **^** | 호환되는 최신 버전 (MINOR, PATCH 업데이트 허용) | `^1.2.3` | `1.2.3` ~ `<2.0.0` |
| **~** | 패치 버전만 업데이트 허용 | `~1.2.3` | `1.2.3` ~ `<1.3.0` |
| **>=** | 이상 (최소 버전 지정) | `>=1.2.3` | `1.2.3` 이상 모든 버전 |
| **>** | 초과 | `>1.2.3` | `1.2.3` 초과 모든 버전 |
| **<=** | 이하 | `<=1.2.3` | `1.2.3` 이하 모든 버전 |
| **<** | 미만 | `<2.0.0` | `2.0.0` 미만 모든 버전 |
| **고정** | 정확히 일치 (권장하지 않음) | `1.2.3` | `1.2.3`만 허용 |
| **범위** | 두 버전 사이 | `>=1.2.3 <2.0.0` | `1.2.3` ~ `<2.0.0` |

### @canard/schema-form 플러그인 의존성 권장 범위

```json
{
  "dependencies": {
    // ✅ 권장: @canard/schema-form - MINOR 업데이트 허용
    "@canard/schema-form": "^0.8.0",

    // ✅ 권장: React - MINOR 업데이트 허용
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "peerDependencies": {
    // ✅ peerDependencies는 넓은 범위 허용
    "@canard/schema-form": ">=0.7.0 <1.0.0",
    "react": ">=18.0.0 <19.0.0"
  },
  "devDependencies": {
    // ✅ devDependencies - 최신 버전 자동 업데이트 허용
    "@types/react": "^18.0.0",
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

### 버전 범위 선택 가이드

#### `^` (캐럿) 사용 - **권장**

```json
{
  "dependencies": {
    "@canard/schema-form": "^0.8.0"
  }
}
```

**장점**:
- 버그 수정과 새로운 기능을 자동으로 받을 수 있음
- Semantic Versioning을 따르는 패키지에 안전

**사용 시기**:
- 대부분의 dependencies
- Semantic Versioning을 따르는 안정적인 패키지

#### `~` (틸드) 사용 - **보수적**

```json
{
  "dependencies": {
    "some-unstable-package": "~1.2.3"
  }
}
```

**장점**:
- 패치 업데이트만 허용하여 안정성 확보
- 예상치 못한 변경 최소화

**사용 시기**:
- 불안정한 패키지
- 버전 변경에 민감한 경우

#### 고정 버전 - **피해야 함**

```json
{
  "dependencies": {
    // ❌ 비권장: 보안 패치를 받을 수 없음
    "package": "1.2.3"
  }
}
```

**사용 시기**:
- 특정 버전에서만 작동하는 경우 (매우 드묾)
- 긴급 임시 조치

---

## 버전 업데이트 전략

### 1. 정기 업데이트 주기

```yaml
weekly:
  - devDependencies 최신 버전 확인
  - 보안 경고 확인 (npm audit, yarn audit)

monthly:
  - dependencies PATCH 버전 업데이트
  - MINOR 버전 업데이트 검토

quarterly:
  - MAJOR 버전 업데이트 계획 수립
  - 호환성 테스트 진행
```

### 2. 업데이트 프로세스

#### Step 1: 현재 버전 확인

```bash
# 최신 버전 확인
yarn outdated

# 또는
npm outdated
```

**출력 예시**:
```
Package                      Current  Wanted  Latest
@canard/schema-form          0.7.0    0.8.5   0.8.5
react                        18.2.0   18.3.1  19.0.0
typescript                   5.0.0    5.0.4   5.6.3
```

#### Step 2: 업데이트 우선순위 결정

```typescript
// 우선순위 매트릭스
const updatePriority = {
  security_patch: {
    priority: 'CRITICAL',
    action: 'IMMEDIATE',
    example: 'CVE 수정 버전'
  },

  bug_fix: {
    priority: 'HIGH',
    action: 'WITHIN_WEEK',
    example: 'PATCH 버전 업데이트'
  },

  new_feature: {
    priority: 'MEDIUM',
    action: 'NEXT_SPRINT',
    example: 'MINOR 버전 업데이트'
  },

  major_update: {
    priority: 'LOW',
    action: 'PLANNED',
    example: 'MAJOR 버전 업데이트'
  }
};
```

#### Step 3: 단계적 업데이트

```bash
# 1단계: devDependencies 업데이트 (낮은 위험)
yarn upgrade-interactive --latest --dev

# 2단계: PATCH 버전 업데이트
yarn upgrade --pattern "@canard/*" --scope patch

# 3단계: MINOR 버전 업데이트 (테스트 후)
yarn upgrade --pattern "@canard/*" --scope minor

# 4단계: 개별 테스트 후 MAJOR 업데이트
yarn add @canard/schema-form@latest
```

#### Step 4: 업데이트 검증

```bash
# 타입 체크
yarn typecheck

# 린트 검증
yarn lint

# 테스트 실행
yarn test

# 빌드 확인
yarn build
```

### 3. Breaking Change 대응

#### MAJOR 버전 업데이트 체크리스트

```markdown
- [ ] **CHANGELOG 확인**
  - Breaking changes 리스트 확인
  - Migration 가이드 확인

- [ ] **타입 검증**
  - TypeScript 에러 확인
  - 타입 정의 변경 파악

- [ ] **코드 마이그레이션**
  - API 변경 사항 반영
  - deprecated 함수 교체

- [ ] **테스트 업데이트**
  - 단위 테스트 수정
  - 통합 테스트 검증

- [ ] **문서 업데이트**
  - README.md 수정
  - CHANGELOG.md 작성
```

#### MAJOR 업데이트 예시: @canard/schema-form 0.x → 1.x

```typescript
// ❌ 0.x 버전
import { SchemaFormPlugin } from '@canard/schema-form';

const plugin: SchemaFormPlugin = {
  formTypes: {
    string: StringInput
  }
};

// ✅ 1.x 버전 (가정)
import { createSchemaFormPlugin } from '@canard/schema-form';

const plugin = createSchemaFormPlugin({
  formTypes: new Map([
    ['string', StringInput]
  ])
});
```

---

## 의존성 버전 고정 정책

### package-lock.json / yarn.lock 관리

#### **반드시 커밋해야 하는 파일**

```bash
# ✅ 항상 버전 관리에 포함
package.json
package-lock.json  # npm 사용 시
yarn.lock          # yarn 사용 시
```

**이유**:
- 모든 환경에서 동일한 버전 설치 보장
- 재현 가능한 빌드 환경 제공
- 보안 감사 가능

#### Lock 파일 업데이트 시점

```bash
# ❌ 자동 생성된 lock 파일 무시하지 말 것
# .gitignore에 포함하지 말 것:
# package-lock.json
# yarn.lock

# ✅ Lock 파일 업데이트 시점
# 1. 새로운 의존성 추가
yarn add <package>

# 2. 의존성 버전 변경
yarn upgrade <package>

# 3. 의존성 제거
yarn remove <package>
```

### resolutions / overrides 사용

#### Yarn resolutions (Yarn 1.x, 2.x)

```json
{
  "resolutions": {
    // 특정 하위 의존성 버전 고정
    "**/lodash": "^4.17.21",

    // 보안 취약점 수정 버전 강제
    "**/minimist": "^1.2.6",

    // 타입 호환성 문제 해결
    "@types/react": "^18.0.0"
  }
}
```

#### npm overrides (npm 8.3+)

```json
{
  "overrides": {
    "lodash": "^4.17.21",
    "@types/react": "^18.0.0"
  }
}
```

**사용 시나리오**:

```typescript
// 문제 상황: 하위 의존성 버전 충돌
// package A → lodash@4.17.15 (취약점 존재)
// package B → lodash@4.17.21 (안전)

// ✅ 해결: resolutions로 안전한 버전 강제
{
  "resolutions": {
    "**/lodash": "^4.17.21"
  }
}
```

---

## 주요 의존성별 버전 관리

### @canard/schema-form

```json
{
  "dependencies": {
    "@canard/schema-form": "^0.8.0"
  },
  "peerDependencies": {
    "@canard/schema-form": ">=0.7.0 <1.0.0"
  }
}
```

**버전 전략**:
- **MINOR 업데이트**: 새로운 FormType 추가, 유틸리티 함수 추가
- **PATCH 업데이트**: 버그 수정, 성능 개선
- **MAJOR 업데이트**: API 변경, 인터페이스 수정 (매우 드묾)

**호환성 테스트**:
```bash
# 최소 지원 버전 테스트
yarn add @canard/schema-form@0.7.0
yarn test

# 최신 버전 테스트
yarn add @canard/schema-form@latest
yarn test
```

### React / React-DOM

```json
{
  "peerDependencies": {
    "react": ">=18.0.0 <19.0.0",
    "react-dom": ">=18.0.0 <19.0.0"
  },
  "devDependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

**버전 전략**:
- **peerDependencies**: 넓은 범위 허용 (사용자 환경 존중)
- **devDependencies**: 최신 안정 버전 사용

**React 19 대응 계획**:
```markdown
1. React 19 RC 릴리스 확인
2. 베타 테스트 환경 구축
3. Breaking changes 파악
4. 마이그레이션 가이드 작성
5. MAJOR 버전 릴리스 계획
```

### TypeScript

```json
{
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

**버전 전략**:
- **MINOR 업데이트**: 적극 적용 (새로운 기능 활용)
- **MAJOR 업데이트**: 신중히 검토 (Breaking Changes 확인)

**TypeScript 업데이트 체크리스트**:
```markdown
- [ ] tsconfig.json 옵션 변경 확인
- [ ] 새로운 strict 옵션 검토
- [ ] 타입 정의 변경 확인
- [ ] 빌드 성공 확인
- [ ] 타입 에러 수정
```

### UI 라이브러리 (MUI, Ant Design, Chakra UI)

```json
{
  "peerDependencies": {
    "@mui/material": ">=5.0.0 <6.0.0"
  },
  "devDependencies": {
    "@mui/material": "^5.14.0"
  }
}
```

**버전 전략**:
- **peerDependencies**: 넓은 버전 범위 (사용자 선택 존중)
- **devDependencies**: 최신 안정 버전
- **테스트**: 최소 버전 + 최신 버전 모두 테스트

---

## 버전 호환성 테스트

### 자동화된 호환성 테스트

#### GitHub Actions 워크플로우

```yaml
# .github/workflows/compatibility-test.yml
name: Compatibility Test

on: [push, pull_request]

jobs:
  test-versions:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        canard-version: ['0.7.0', '0.8.0', 'latest']
        react-version: ['18.0.0', '18.2.0', '18.3.0']

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install specific versions
        run: |
          yarn add @canard/schema-form@${{ matrix.canard-version }}
          yarn add react@${{ matrix.react-version }} react-dom@${{ matrix.react-version }}

      - name: Run tests
        run: yarn test
```

### 수동 호환성 테스트

```bash
#!/bin/bash
# scripts/test-compatibility.sh

echo "Testing @canard/schema-form compatibility..."

# 최소 지원 버전 테스트
echo "Testing minimum version..."
yarn add @canard/schema-form@0.7.0
yarn test
if [ $? -ne 0 ]; then
  echo "❌ Failed with minimum version"
  exit 1
fi

# 최신 버전 테스트
echo "Testing latest version..."
yarn add @canard/schema-form@latest
yarn test
if [ $? -ne 0 ]; then
  echo "❌ Failed with latest version"
  exit 1
fi

echo "✅ All compatibility tests passed"
```

### 버전별 테스트 시나리오

```typescript
// tests/version-compatibility.test.ts
import { describe, it, expect } from 'vitest';
import { getSchemaFormVersion } from '@canard/schema-form';

describe('Version Compatibility', () => {
  it('should work with @canard/schema-form >= 0.7.0', () => {
    const version = getSchemaFormVersion();
    const [major, minor] = version.split('.').map(Number);

    // 0.7.0 이상 확인
    expect(major === 0 && minor >= 7 || major >= 1).toBe(true);
  });

  it('should support required FormTypeInput props', () => {
    // 필수 props 검증
    const requiredProps = ['value', 'onChange', 'schema'];
    // 타입 검증 로직...
  });
});
```

---

## changeset을 통한 버전 관리

### changeset 설정

#### 설치

```bash
yarn add -D @changesets/cli
yarn changeset init
```

#### 설정 파일

```json
// .changeset/config.json
{
  "$schema": "https://unpkg.com/@changesets/config@2.3.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

### changeset 워크플로우

#### 1. 변경사항 기록

```bash
# 변경사항 작성
yarn changeset

# 대화형 프롬프트
? Which packages would you like to include?
  ◉ @canard/mui-plugin

? What kind of change is this for @canard/mui-plugin?
  ◉ patch
  ◯ minor
  ◯ major

? Summary:
  Fix email validation regex bug
```

생성된 changeset 파일:
```markdown
---
"@canard/mui-plugin": patch
---

Fix email validation regex to properly validate domain extensions
```

#### 2. changeset 리뷰

```bash
# 생성된 changeset 확인
cat .changeset/*.md

# 필요시 수정
vim .changeset/friendly-lions-retire.md
```

#### 3. 버전 업데이트

```bash
# changeset을 바탕으로 버전 업데이트
yarn changeset version

# package.json 버전 변경 및 CHANGELOG.md 생성
```

**변경 결과**:
```json
// package.json
{
  "version": "1.2.4" // 1.2.3 → 1.2.4 (patch)
}
```

```markdown
# CHANGELOG.md

## 1.2.4

### Patch Changes

- Fix email validation regex to properly validate domain extensions
```

#### 4. 릴리스

```bash
# 변경사항 커밋
git add .
git commit -m "chore: release @canard/mui-plugin@1.2.4"

# 릴리스 (npm/yarn publish)
yarn changeset publish

# Git 태그 푸시
git push --follow-tags
```

### changeset 베스트 프랙티스

#### 명확한 changeset 작성

```markdown
# ❌ 나쁜 예시
---
"@canard/mui-plugin": patch
---

bug fix
```

```markdown
# ✅ 좋은 예시
---
"@canard/mui-plugin": patch
---

Fix email validation regex bug

- Added proper domain extension validation
- Now correctly validates emails like `user@example.co.uk`
- Fixes issue #123
```

#### BREAKING CHANGE 표시

```markdown
---
"@canard/mui-plugin": major
---

BREAKING CHANGE: Remove deprecated `validateEmail` function

- Use `isValidEmail` instead
- Migration guide: Replace all `validateEmail(email)` with `isValidEmail(email)`

**Before**:
```typescript
import { validateEmail } from '@canard/mui-plugin';
validateEmail(email);
```

**After**:
```typescript
import { isValidEmail } from '@canard/mui-plugin';
isValidEmail(email);
```
```

### 자동화된 릴리스 워크플로우

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    branches:
      - main

concurrency: ${{ github.workflow }}-${{ github.ref }}

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - run: yarn install --frozen-lockfile

      - name: Create Release Pull Request or Publish
        uses: changesets/action@v1
        with:
          publish: yarn release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## 버전 관리 체크리스트

### 새 플러그인 릴리스

```markdown
- [ ] package.json 버전 0.1.0으로 시작
- [ ] peerDependencies 적절히 설정
- [ ] changeset 초기 설정
- [ ] README에 버전 정책 명시
- [ ] CHANGELOG.md 템플릿 생성
```

### 정기 업데이트

```markdown
- [ ] yarn outdated 실행
- [ ] 보안 취약점 확인 (yarn audit)
- [ ] devDependencies 업데이트
- [ ] PATCH 버전 업데이트
- [ ] 테스트 실행 및 검증
- [ ] changeset 작성
```

### MAJOR 버전 릴리스

```markdown
- [ ] Breaking Changes 문서화
- [ ] Migration 가이드 작성
- [ ] 충분한 베타 테스트 기간
- [ ] 사용자 공지
- [ ] 이전 버전 지원 정책 명시
```

---

## 참고 자료

### 공식 문서
- [Semantic Versioning 2.0.0](https://semver.org/)
- [npm semver calculator](https://semver.npmjs.com/)
- [Changesets Documentation](https://github.com/changesets/changesets)

### 도구
- [npm-check-updates](https://www.npmjs.com/package/npm-check-updates) - 의존성 업데이트 확인
- [depcheck](https://www.npmjs.com/package/depcheck) - 사용하지 않는 의존성 탐지
- [yarn-deduplicate](https://www.npmjs.com/package/yarn-deduplicate) - 중복 의존성 제거

### 버전 관리 전략
- [Keep a Changelog](https://keepachangelog.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
