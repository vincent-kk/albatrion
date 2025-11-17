# 의존성 관리 베스트 프랙티스

> @canard/schema-form 플러그인 개발을 위한 의존성 관리 모범 사례

## 목차

1. [의존성 추가 원칙](#의존성-추가-원칙)
2. [dependencies vs devDependencies vs peerDependencies](#dependencies-vs-devdependencies-vs-peerdependencies)
3. [의존성 최소화 전략](#의존성-최소화-전략)
4. [보안 관리](#보안-관리)
5. [번들 크기 최적화](#번들-크기-최적화)
6. [모노레포 의존성 관리](#모노레포-의존성-관리)
7. [의존성 업데이트 전략](#의존성-업데이트-전략)
8. [문제 해결 가이드](#문제-해결-가이드)

---

## 의존성 추가 원칙

### 의존성 추가 전 체크리스트

```markdown
- [ ] **정말 필요한가?**
  - 직접 구현 가능한지 검토
  - 이미 있는 유틸리티로 대체 가능한지 확인

- [ ] **유지보수 상태 확인**
  - 최근 업데이트 날짜 (6개월 이내 권장)
  - GitHub Stars, Weekly downloads
  - 이슈/PR 응답 속도

- [ ] **번들 크기 영향**
  - [Bundlephobia](https://bundlephobia.com/)에서 크기 확인
  - Tree-shaking 지원 여부

- [ ] **타입 지원**
  - TypeScript 타입 정의 포함 여부
  - @types/* 패키지 필요 여부

- [ ] **라이선스 확인**
  - MIT, Apache 2.0 등 호환 가능한 라이선스
  - 상업적 사용 제한 없는지 확인

- [ ] **보안 취약점**
  - npm audit / yarn audit 실행
  - Snyk, Socket.dev 보안 스캔
```

### 의존성 추가 의사결정 트리

```
새로운 기능 필요
  ├─ 직접 구현 가능? (< 50 LOC)
  │   ├─ Yes → ✅ 직접 구현 (의존성 추가 안 함)
  │   └─ No → 다음 단계
  │
  ├─ 기존 의존성에 포함?
  │   ├─ Yes → ✅ 기존 의존성 활용
  │   └─ No → 다음 단계
  │
  ├─ 번들 크기 영향 < 10KB?
  │   ├─ No → ❌ 대안 검토
  │   └─ Yes → 다음 단계
  │
  ├─ 적극적으로 유지보수 중?
  │   ├─ No → ⚠️ 대안 검토
  │   └─ Yes → 다음 단계
  │
  └─ TypeScript 지원?
      ├─ No → ⚠️ @types 확인 또는 대안 검토
      └─ Yes → ✅ 추가 승인
```

### 예시: lodash vs 직접 구현

#### ❌ 나쁜 예시: 단순 기능에 큰 라이브러리 추가

```typescript
// ❌ lodash 전체 설치 (24KB gzipped)
import _ from 'lodash';

function isValidEmail(email: string): boolean {
  return _.isString(email) && email.includes('@');
}
```

#### ✅ 좋은 예시: 직접 구현 또는 경량 대안

```typescript
// ✅ 직접 구현 (0KB 추가)
function isValidEmail(email: string): boolean {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ✅ 또는 lodash 일부만 설치 (작은 크기)
import isString from 'lodash/isString';
```

### 예시: Date 라이브러리 선택

```typescript
// ❌ Moment.js (무겁고 deprecated)
import moment from 'moment'; // 71.4KB gzipped

// ✅ date-fns (Tree-shakable, 작은 크기)
import { format, parseISO } from 'date-fns'; // ~2KB gzipped (사용한 함수만)

// ✅ 또는 Temporal API (Native, 0KB)
// (브라우저 지원이 충분해지면)
const date = Temporal.PlainDate.from('2024-01-01');
```

---

## dependencies vs devDependencies vs peerDependencies

### 구분 기준

| 종류 | 용도 | 설치 시점 | 번들 포함 | 예시 |
|------|------|----------|-----------|------|
| **dependencies** | 런타임에 필요한 패키지 | 항상 설치 | ✅ Yes | React, lodash |
| **devDependencies** | 개발/빌드 도구 | 개발 환경에만 설치 | ❌ No | TypeScript, Vitest |
| **peerDependencies** | 호스트 프로젝트가 제공해야 하는 패키지 | 수동 설치 | ❌ No | React (플러그인) |

### @canard/schema-form 플러그인 예시

```json
{
  "name": "@canard/mui-plugin",
  "version": "1.0.0",

  "dependencies": {
    // ✅ 플러그인이 직접 사용하는 유틸리티
    "clsx": "^2.0.0",
    "lodash-es": "^4.17.21"
  },

  "devDependencies": {
    // ✅ 개발 및 빌드 도구
    "@types/react": "^18.0.0",
    "typescript": "^5.0.0",
    "vitest": "^1.0.0",
    "vite": "^5.0.0",

    // ✅ 테스트용 의존성
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.0.0"
  },

  "peerDependencies": {
    // ✅ 호스트 앱이 제공해야 하는 의존성
    "@canard/schema-form": ">=0.7.0 <1.0.0",
    "@mui/material": ">=5.0.0 <6.0.0",
    "react": ">=18.0.0 <19.0.0",
    "react-dom": ">=18.0.0 <19.0.0"
  },

  "peerDependenciesMeta": {
    // ✅ 선택적 peer dependency
    "@mui/icons-material": {
      "optional": true
    }
  }
}
```

### dependencies 사용 기준

```typescript
// ✅ dependencies에 포함해야 하는 경우
import clsx from 'clsx'; // 런타임에 필요
import { debounce } from 'lodash-es'; // 런타임 유틸리티

export function MyComponent({ className }: Props) {
  const debouncedFn = debounce(handleChange, 300);
  return <div className={clsx('base', className)} />;
}
```

### devDependencies 사용 기준

```typescript
// ✅ devDependencies에 포함해야 하는 경우

// TypeScript 타입 정의 (컴파일 타임에만 필요)
import type { FC } from 'react';

// 테스트 도구 (테스트 실행 시에만 필요)
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
```

### peerDependencies 사용 기준

```typescript
// ✅ peerDependencies에 포함해야 하는 경우
// - 호스트 앱이 이미 설치한 패키지를 재사용
// - 버전 충돌 방지
// - 번들 크기 최소화

// peerDependencies 예시
{
  "peerDependencies": {
    // 호스트 앱의 React 버전 사용
    "react": ">=18.0.0 <19.0.0",

    // 호스트 앱의 @canard/schema-form 버전 사용
    "@canard/schema-form": ">=0.7.0 <1.0.0",

    // 호스트 앱의 UI 라이브러리 버전 사용
    "@mui/material": ">=5.0.0 <6.0.0"
  }
}
```

### peerDependenciesMeta 활용

```json
{
  "peerDependencies": {
    "@mui/material": ">=5.0.0 <6.0.0",
    "@mui/icons-material": ">=5.0.0 <6.0.0"
  },
  "peerDependenciesMeta": {
    // ✅ 선택적 의존성 (없어도 작동)
    "@mui/icons-material": {
      "optional": true
    }
  }
}
```

**사용 예시**:
```typescript
// Icons는 선택적으로 사용
import { TextField } from '@mui/material'; // 필수

// Icons는 있으면 사용, 없으면 대체
let SearchIcon;
try {
  SearchIcon = require('@mui/icons-material/Search').default;
} catch {
  SearchIcon = () => <span>🔍</span>; // Fallback
}
```

---

## 의존성 최소화 전략

### 1. Tree-shaking 활용

#### ❌ 나쁜 예시: 전체 import

```typescript
// ❌ lodash 전체 import (번들에 전체 포함)
import _ from 'lodash';
const result = _.debounce(fn, 300);

// ❌ MUI 전체 import
import * as MUI from '@mui/material';
const { Button, TextField } = MUI;
```

#### ✅ 좋은 예시: Named import

```typescript
// ✅ 필요한 함수만 import
import { debounce } from 'lodash-es'; // ES modules 버전 사용
const result = debounce(fn, 300);

// ✅ MUI named import
import { Button, TextField } from '@mui/material';
```

### 2. 대체 가능한 경량 라이브러리 선택

| 무거운 라이브러리 | 경량 대안 | 크기 비교 |
|-----------------|---------|----------|
| Moment.js (71KB) | date-fns (2-13KB) | **35배 작음** |
| lodash (71KB) | lodash-es + tree-shaking (2-5KB) | **14배 작음** |
| Axios (13KB) | Native fetch (0KB) | **무한대** |
| uuid (9KB) | crypto.randomUUID() (0KB) | **무한대** |

#### 예시: UUID 생성

```typescript
// ❌ uuid 패키지 추가 (9KB)
import { v4 as uuidv4 } from 'uuid';
const id = uuidv4();

// ✅ Native API 사용 (0KB, Node 14.17+, Chrome 92+)
const id = crypto.randomUUID();
```

#### 예시: HTTP 요청

```typescript
// ❌ Axios 추가 (13KB gzipped)
import axios from 'axios';
const response = await axios.get('/api/data');

// ✅ Native fetch (0KB)
const response = await fetch('/api/data');
const data = await response.json();
```

### 3. Polyfill 최소화

```typescript
// ❌ 불필요한 polyfill
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// ✅ 필요한 polyfill만 선택적으로
import 'core-js/features/promise';
import 'core-js/features/array/flat-map';

// ✅ 또는 target 설정으로 자동 polyfill (Vite/Babel)
// vite.config.ts
export default defineConfig({
  build: {
    target: 'es2020' // ES2020 지원 브라우저만 타겟
  }
});
```

### 4. 선택적 의존성 (Optional Dependencies)

```typescript
// ✅ 기능에 따라 동적 import
async function formatDate(date: Date) {
  if (needsComplexFormatting) {
    // 복잡한 포맷팅이 필요할 때만 로드
    const { format } = await import('date-fns');
    return format(date, 'yyyy-MM-dd HH:mm:ss');
  }

  // 간단한 경우 Native API 사용
  return date.toISOString();
}
```

---

## 보안 관리

### 1. 정기 보안 스캔

```bash
# npm 보안 감사
npm audit

# yarn 보안 감사
yarn audit

# 자동 수정 (주의: Breaking Change 가능성)
npm audit fix
yarn audit fix
```

#### 출력 예시

```
# npm audit
found 3 vulnerabilities (1 moderate, 2 high)

Moderate        Prototype Pollution
Package         lodash
Dependency of   some-package
Path            some-package > lodash
More info       https://npmjs.com/advisories/1234
```

### 2. 보안 도구 통합

#### Snyk 설정

```yaml
# .github/workflows/security.yml
name: Security Scan

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

#### Dependabot 설정

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10

    # 보안 업데이트는 즉시
    allow:
      - dependency-type: "all"

    # 자동 승인 규칙
    reviewers:
      - "your-team"
```

### 3. 취약점 대응 프로세스

#### 심각도별 대응 시간

| 심각도 | 대응 시간 | 조치 |
|--------|----------|------|
| **Critical** | 24시간 이내 | 즉시 패치 + 긴급 릴리스 |
| **High** | 1주일 이내 | 패치 + 정기 릴리스 |
| **Moderate** | 1개월 이내 | 정기 업데이트에 포함 |
| **Low** | 분기별 | 정기 점검 시 처리 |

#### 취약점 수정 워크플로우

```bash
# 1. 취약점 확인
npm audit

# 2. 상세 정보 확인
npm audit --json | jq '.vulnerabilities'

# 3. 자동 수정 시도
npm audit fix

# 4. 수동 수정 필요 시
npm audit fix --force  # 주의: Breaking Change 가능

# 5. 테스트 실행
npm test

# 6. 변경사항 확인
git diff package.json package-lock.json

# 7. Changeset 작성
npx changeset add

# 8. 커밋 및 릴리스
git commit -m "fix(security): update vulnerable dependencies"
```

### 4. 안전한 의존성 선택

```markdown
✅ **신뢰할 수 있는 패키지 특징**:
- 활발한 커뮤니티 (GitHub Stars > 1000)
- 정기적인 업데이트 (최근 6개월 이내)
- 보안 정책 문서 존재
- 빠른 보안 패치 이력
- 주요 기업/조직의 후원

❌ **피해야 할 패키지 신호**:
- 마지막 업데이트 > 2년
- 미해결 보안 이슈
- 소유권 변경 이력
- 갑작스러운 라이선스 변경
- Typosquatting 의심 패키지명
```

---

## 번들 크기 최적화

### 1. 번들 크기 분석

```bash
# Vite bundle analyzer
yarn add -D rollup-plugin-visualizer

# vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ]
});
```

### 2. 번들 크기 목표

```yaml
@canard/schema-form 플러그인 번들 크기 목표:

최소 플러그인 (1-2 FormTypes):
  - Minified: < 20KB
  - Gzipped: < 5KB

일반 플러그인 (3-5 FormTypes):
  - Minified: < 50KB
  - Gzipped: < 15KB

대형 플러그인 (6+ FormTypes):
  - Minified: < 100KB
  - Gzipped: < 30KB
```

### 3. Code Splitting

```typescript
// ❌ 모든 FormType을 한 번에 import
import { StringInput, NumberInput, DateInput, FileInput } from './formTypes';

export const plugin: SchemaFormPlugin = {
  formTypes: {
    string: StringInput,
    number: NumberInput,
    date: DateInput,
    file: FileInput
  }
};

// ✅ Lazy loading으로 필요할 때만 로드
export const plugin: SchemaFormPlugin = {
  formTypes: {
    string: lazy(() => import('./formTypes/StringInput')),
    number: lazy(() => import('./formTypes/NumberInput')),
    date: lazy(() => import('./formTypes/DateInput')),
    file: lazy(() => import('./formTypes/FileInput'))
  }
};
```

### 4. 최적화 체크리스트

```markdown
- [ ] Tree-shaking 지원 라이브러리 사용
- [ ] Named import 사용
- [ ] 불필요한 polyfill 제거
- [ ] Dynamic import로 code splitting
- [ ] CSS-in-JS 대신 CSS modules 고려
- [ ] 이미지 최적화 (WebP, AVIF)
- [ ] Gzip/Brotli 압축 활성화
```

---

## 모노레포 의존성 관리

### 1. Workspace 설정

```json
// 루트 package.json
{
  "name": "albatrion",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "devDependencies": {
    // 공통 devDependencies
    "typescript": "^5.0.0",
    "vitest": "^1.0.0",
    "@changesets/cli": "^2.26.0"
  }
}
```

### 2. 공통 의존성 관리

```bash
# 루트에 공통 devDependencies 추가
yarn add -D -W typescript vitest

# 특정 workspace에만 추가
yarn workspace @canard/mui-plugin add @mui/material

# 모든 workspace 설치
yarn install
```

### 3. Internal Dependencies

```json
// packages/mui-plugin/package.json
{
  "name": "@canard/mui-plugin",
  "dependencies": {
    // ✅ 모노레포 내부 패키지 참조
    "@canard/schema-form": "workspace:*"
  }
}
```

**장점**:
- 로컬 버전 사용
- 심볼릭 링크로 연결
- 빠른 개발 사이클

### 4. 의존성 중복 제거

```bash
# yarn deduplicate
yarn dedupe

# npm deduplicate
npm dedupe

# 수동 확인
yarn why <package-name>
```

---

## 의존성 업데이트 전략

### 1. 정기 업데이트 스케줄

```yaml
Daily:
  - Dependabot security alerts 확인
  - Critical 보안 패치

Weekly:
  - devDependencies 업데이트 검토
  - Patch 버전 업데이트

Monthly:
  - Minor 버전 업데이트
  - 호환성 테스트

Quarterly:
  - Major 버전 업데이트 계획
  - 마이그레이션 가이드 작성
```

### 2. 자동화된 업데이트

```yaml
# .github/workflows/update-deps.yml
name: Update Dependencies

on:
  schedule:
    - cron: '0 0 * * 1' # 매주 월요일

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Update dependencies
        run: |
          yarn upgrade-interactive --latest

      - name: Run tests
        run: yarn test

      - name: Create PR
        uses: peter-evans/create-pull-request@v5
        with:
          title: "chore: update dependencies"
          branch: "chore/update-deps"
```

### 3. 점진적 업데이트

```bash
# 1단계: devDependencies (낮은 위험)
yarn upgrade-interactive --latest --dev

# 2단계: Patch 버전 (낮은 위험)
yarn upgrade --scope patch

# 3단계: Minor 버전 (중간 위험)
yarn upgrade --scope minor

# 4단계: Major 버전 (높은 위험 - 개별 처리)
yarn add <package>@latest
```

---

## 문제 해결 가이드

### 1. 버전 충돌 해결

#### 문제 상황

```bash
error Package "@types/react" has conflicting versions:
- "@types/react@18.0.0" from dependency A
- "@types/react@18.2.0" from dependency B
```

#### 해결 방법

```json
// package.json
{
  "resolutions": {
    "@types/react": "18.2.0"
  }
}
```

```bash
# 재설치
yarn install
```

### 2. Peer Dependency 경고

#### 문제 상황

```bash
warning " > @canard/mui-plugin@1.0.0" has unmet peer dependency "@mui/material@>=5.0.0".
```

#### 해결 방법

```bash
# Peer dependency 설치
yarn add @mui/material@^5.14.0

# 또는 선택적으로 무시 (peerDependenciesMeta 활용)
```

### 3. Duplicate Packages

#### 문제 확인

```bash
# 중복 패키지 확인
yarn list <package-name>

# 예시 출력
├─ foo@1.0.0
├─ bar@2.0.0
│  └─ foo@1.0.1  # 중복!
```

#### 해결 방법

```bash
# 중복 제거
yarn dedupe

# 또는 resolutions로 버전 강제
{
  "resolutions": {
    "foo": "1.0.1"
  }
}
```

### 4. Lock 파일 손상

#### 문제 상황

```bash
error An unexpected error occurred: "ENOENT: no such file or directory".
```

#### 해결 방법

```bash
# Lock 파일 재생성
rm yarn.lock
yarn install

# 또는
rm package-lock.json
npm install
```

### 5. 설치 실패

#### 네트워크 이슈

```bash
# Registry 변경
yarn config set registry https://registry.npmjs.org/

# 또는 npm
npm config set registry https://registry.npmjs.org/
```

#### 캐시 문제

```bash
# 캐시 삭제
yarn cache clean

# npm
npm cache clean --force
```

---

## 체크리스트

### 새 플러그인 생성 시

```markdown
- [ ] dependencies: 런타임 필수 패키지만
- [ ] devDependencies: 개발 도구
- [ ] peerDependencies: 호스트 제공 패키지
- [ ] engines 필드 설정 (Node, npm/yarn 버전)
- [ ] .npmignore 또는 files 필드 설정
- [ ] README에 필수 peer dependencies 명시
```

### 의존성 추가 전

```markdown
- [ ] 정말 필요한가?
- [ ] 번들 크기 확인 (Bundlephobia)
- [ ] 유지보수 상태 확인
- [ ] 라이선스 확인
- [ ] 보안 취약점 확인
- [ ] TypeScript 지원 확인
```

### 정기 점검 (월 1회)

```markdown
- [ ] yarn outdated 실행
- [ ] npm audit / yarn audit 실행
- [ ] 보안 패치 적용
- [ ] devDependencies 업데이트
- [ ] Patch/Minor 버전 업데이트
- [ ] 중복 패키지 제거
```

---

## 참고 자료

### 도구
- [Bundlephobia](https://bundlephobia.com/) - 번들 크기 분석
- [npm-check-updates](https://www.npmjs.com/package/npm-check-updates) - 의존성 업데이트 체크
- [depcheck](https://www.npmjs.com/package/depcheck) - 사용하지 않는 의존성 탐지
- [Snyk](https://snyk.io/) - 보안 취약점 스캔

### 가이드
- [npm Documentation](https://docs.npmjs.com/)
- [Yarn Documentation](https://yarnpkg.com/)
- [Package.json Fields](https://docs.npmjs.com/cli/v9/configuring-npm/package-json)
