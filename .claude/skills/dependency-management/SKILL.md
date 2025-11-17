# Dependency Management Skill

## 역할
당신은 @canard/schema-form 플러그인의 package.json 의존성 관리 전문가입니다.

## 핵심 책임
1. **package.json 설정**: 플러그인 패키지 메타데이터 구성
2. **의존성 버전 관리**: dependencies vs peerDependencies 구분
3. **내부 패키지 참조**: @winglet, @canard 패키지 설정
4. **UI 라이브러리 의존성**: 최신 메이저 버전 설정
5. **빌드 도구 설정**: Rollup, TypeScript 등 devDependencies 관리

## 작동 방식

### 1. 템플릿 제공
**knowledge/package-config-template.json**을 기반으로 UI 라이브러리별 package.json 생성

### 2. 의존성 규칙 적용
**knowledge/dependency-rules.md**에 정의된 규칙에 따라:
- dependencies: 최신 메이저 버전 (`^`)
- peerDependencies: 최소 버전 이상 (`>=`)
- 내부 패키지: `"*"` 또는 workspace 프로토콜

## 제공하는 정보

### 기본 package.json 구조

```json
{
  "name": "@canard/schema-form-{ui-library}-plugin",
  "version": "1.0.0",
  "description": "@canard/schema-form plugin for {UI Library}",
  "keywords": [
    "canard",
    "schema-form",
    "json-schema",
    "{ui-library}",
    "form",
    "react"
  ],
  "author": "Your Name",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-org/your-repo"
  },
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "build": "rollup -c",
    "dev": "rollup -c -w",
    "test": "vitest",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "{ui-library-main}": "^{LATEST_MAJOR}.0.0",
    "{ui-library-sub-packages}": "^{LATEST_MAJOR}.0.0",
    "@winglet/react-utils": "*",
    "@canard/schema-form": "*"
  },
  "peerDependencies": {
    "react": ">=18.0.0 <19.0.0",
    "{ui-library-main}": ">={LATEST_MAJOR}.0.0",
    "{ui-library-sub-packages}": ">={LATEST_MAJOR}.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "rollup": "^4.0.0",
    "@rollup/plugin-typescript": "^11.0.0",
    "vitest": "^1.0.0"
  }
}
```

### UI 라이브러리별 의존성 예제

#### MUI (Material-UI)

```json
{
  "dependencies": {
    "@mui/material": "^5.0.0",
    "@mui/x-date-pickers": "^6.0.0",
    "@emotion/react": "^11.0.0",
    "@emotion/styled": "^11.0.0",
    "@winglet/react-utils": "*",
    "@canard/schema-form": "*"
  },
  "peerDependencies": {
    "react": ">=18.0.0 <19.0.0",
    "@mui/material": ">=5.0.0",
    "@mui/x-date-pickers": ">=6.0.0",
    "@emotion/react": "*",
    "@emotion/styled": "*"
  }
}
```

#### Ant Design

```json
{
  "dependencies": {
    "antd": "^5.0.0",
    "@winglet/react-utils": "*",
    "@canard/schema-form": "*"
  },
  "peerDependencies": {
    "react": ">=18.0.0 <19.0.0",
    "antd": ">=5.0.0"
  }
}
```

#### Ant Design Mobile

```json
{
  "dependencies": {
    "antd-mobile": "^5.0.0",
    "@winglet/react-utils": "*",
    "@canard/schema-form": "*"
  },
  "peerDependencies": {
    "react": ">=18.0.0 <19.0.0",
    "antd-mobile": ">=5.0.0"
  }
}
```

#### Chakra UI

```json
{
  "dependencies": {
    "@chakra-ui/react": "^2.0.0",
    "@emotion/react": "^11.0.0",
    "@emotion/styled": "^11.0.0",
    "framer-motion": "^10.0.0",
    "@winglet/react-utils": "*",
    "@canard/schema-form": "*"
  },
  "peerDependencies": {
    "react": ">=18.0.0 <19.0.0",
    "@chakra-ui/react": ">=2.0.0",
    "@emotion/react": "*",
    "@emotion/styled": "*",
    "framer-motion": "*"
  }
}
```

## 의존성 규칙

### 1. dependencies (런타임 의존성)

- UI 라이브러리 메인 패키지: `^{LATEST_MAJOR}.0.0`
- UI 라이브러리 서브 패키지: `^{LATEST_MAJOR}.0.0`
- 내부 패키지 (@winglet, @canard): `"*"`

**`^` (caret) 사용 이유**: 패치 및 마이너 업데이트 자동 허용

### 2. peerDependencies (호스트 프로젝트 의존성)

- React: `">=18.0.0 <19.0.0"` (고정)
- UI 라이브러리: `">={LATEST_MAJOR}.0.0"`
- 내부 패키지: 필요 없음 (dependencies에만)

**`>=` 사용 이유**: 최소 버전만 명시, 호스트가 버전 선택

### 3. devDependencies (개발 도구)

- TypeScript, Rollup, Vitest 등
- 최신 메이저 버전 사용
- 플러그인 런타임에 불필요

## 제약 조건

- React 버전: 18.x 고정 (@canard/schema-form 호환성)
- 내부 패키지 (@winglet, @canard): workspace 환경에서 `"*"` 사용
- UI 라이브러리: 최신 메이저 버전 사용 권장
- 불필요한 의존성 추가 금지 (bundle 크기 최소화)

## 출력 형식

### package.json 생성

```markdown
## package.json 설정

**플러그인 이름**: @canard/schema-form-{ui-library}-plugin

**주요 의존성**:
- {UI Library Main}: ^{VERSION}
- {UI Library Sub}: ^{VERSION}

**전체 설정**:
[JSON 코드]

**설치 명령어**:
\`\`\`bash
yarn add @canard/schema-form-{ui-library}-plugin
\`\`\`
```

## 버전 확인 방법

### NPM Registry 조회

```bash
# 최신 버전 확인
npm view @mui/material version

# 모든 버전 목록
npm view @mui/material versions

# 메이저 버전별 최신
npm view @mui/material dist-tags
```

### Yarn

```bash
# 최신 버전 확인
yarn info @mui/material version

# 버전 목록
yarn info @mui/material versions
```

## 사용 시나리오

### 시나리오 1: 새로운 UI 라이브러리 플러그인 package.json 생성

**상황**: Material-UI (MUI) v6 기반 플러그인 개발 시작

**작업 흐름**:

1. **최신 버전 확인**
   ```bash
   npm view @mui/material version
   # 출력: 6.1.0

   npm view @mui/x-date-pickers version
   # 출력: 7.0.0
   ```

2. **package.json 생성** (`knowledge/conflict-resolution.md` 참조)
   ```json
   {
     "name": "@canard/schema-form-mui-plugin",
     "version": "1.0.0",
     "description": "@canard/schema-form plugin for Material-UI",
     "keywords": ["canard", "schema-form", "mui", "material-ui", "form", "react"],
     "author": "Your Name",
     "license": "MIT",
     "main": "./dist/index.cjs",
     "module": "./dist/index.js",
     "types": "./dist/index.d.ts",
     "exports": {
       ".": {
         "import": "./dist/index.js",
         "require": "./dist/index.cjs",
         "types": "./dist/index.d.ts"
       }
     },
     "files": ["dist"],
     "dependencies": {
       "@mui/material": "^6.0.0",
       "@mui/x-date-pickers": "^7.0.0",
       "@emotion/react": "^11.0.0",
       "@emotion/styled": "^11.0.0",
       "@canard/schema-form": "workspace:*",
       "@winglet/react-utils": "workspace:*"
     },
     "peerDependencies": {
       "react": ">=18.0.0 <20.0.0",
       "@mui/material": ">=6.0.0",
       "@mui/x-date-pickers": ">=7.0.0",
       "@emotion/react": ">=11.0.0",
       "@emotion/styled": ">=11.0.0"
     },
     "devDependencies": {
       "@types/react": "^18.0.0",
       "@types/node": "^20.0.0",
       "typescript": "^5.0.0",
       "rollup": "^4.0.0",
       "@rollup/plugin-typescript": "^11.0.0",
       "vitest": "^2.0.0"
     }
   }
   ```

3. **검증**
   ```bash
   # tools/check-deps.sh로 검증
   ./claude/skills/dependency-management/tools/check-deps.sh ./package.json

   # 설치 테스트
   yarn install
   ```

### 시나리오 2: React 18 → 19 마이그레이션

**상황**: React 19가 릴리즈되어 플러그인을 React 19 호환으로 업데이트

**문제 발생**:
```bash
# 현재 peerDependencies
{
  "peerDependencies": {
    "react": ">=18.0.0 <19.0.0"  // React 19 지원 안 함
  }
}

# 호스트 프로젝트가 React 19 사용 시 충돌
warning "@canard/schema-form-mui-plugin@1.0.0" has incorrect peer dependency "react@>=18.0.0 <19.0.0"
```

**해결 방법** (`knowledge/conflict-resolution.md` 예제 1 참조):

1. **React 19 테스트**
   ```bash
   # devDependencies에 React 19 추가
   yarn add -D react@^19.0.0 react-dom@^19.0.0 @types/react@^19.0.0

   # 테스트 실행
   yarn test
   yarn typecheck
   ```

2. **package.json 업데이트**
   ```json
   {
     "peerDependencies": {
       "react": ">=18.0.0 <20.0.0"  // React 18, 19 모두 지원
     },
     "devDependencies": {
       "@types/react": "^19.0.0"  // 최신 버전으로 테스트
     }
   }
   ```

3. **문서 업데이트**
   ```markdown
   # README.md
   ## Compatibility
   - React: 18.x, 19.x
   - Material-UI: 6.x
   ```

### 시나리오 3: MUI v5/v6 동시 지원

**상황**: 기존 사용자(MUI v5)와 새 사용자(MUI v6) 모두 지원

**작업 흐름**:

1. **Breaking Changes 확인**
   ```bash
   # MUI 공식 마이그레이션 가이드 확인
   # https://mui.com/material-ui/migration/migration-v5/

   # 주요 변경사항 파악
   # - 일부 prop 이름 변경
   # - 일부 컴포넌트 API 변경
   ```

2. **조건부 코드 작성**
   ```typescript
   // 버전 감지 유틸리티
   import { version } from '@mui/material';

   const isMuiV6 = parseInt(version.split('.')[0]) >= 6;

   // 조건부 props 사용
   const textFieldProps = isMuiV6
     ? { slotProps: { input: { ... } } }  // v6 API
     : { InputProps: { ... } };            // v5 API
   ```

3. **package.json 업데이트**
   ```json
   {
     "dependencies": {
       "@mui/material": "^6.0.0"  // v6 기준 개발
     },
     "peerDependencies": {
       "@mui/material": ">=5.0.0 <7.0.0"  // v5, v6 모두 지원
     }
   }
   ```

4. **테스트 전략**
   ```bash
   # v5 테스트
   yarn add -D @mui/material@^5.14.0
   yarn test

   # v6 테스트
   yarn add -D @mui/material@^6.0.0
   yarn test
   ```

### 시나리오 4: 의존성 충돌 해결

**상황**: 플러그인 설치 시 @emotion/react 버전 충돌

```bash
# 호스트 프로젝트의 의존성
@mui/material@5.14.0 requires @emotion/react@^11.5.0
@chakra-ui/react@2.8.0 requires @emotion/react@^11.10.0

# 설치 시 경고
warning "Conflicting peer dependency: @emotion/react@11.5.0 vs @emotion/react@11.10.0"
```

**해결 방법** (`knowledge/conflict-resolution.md` 예제 3 참조):

1. **충돌 분석**
   ```bash
   # 의존성 트리 확인
   yarn why @emotion/react

   # 출력:
   # => Found "@emotion/react@11.5.0"
   # info Reasons this module exists
   #    - "@mui#material" depends on it
   # => Found "@emotion/react@11.10.5"
   # info Reasons this module exists
   #    - "@chakra-ui#react" depends on it
   ```

2. **호환 버전 찾기**
   ```bash
   # 두 요구사항을 모두 만족하는 버전 찾기
   # ^11.5.0 AND ^11.10.0 → ^11.10.0 이상

   npm view @emotion/react versions
   # 최신: 11.11.3
   ```

3. **resolutions로 해결**
   ```json
   // package.json (호스트 프로젝트)
   {
     "resolutions": {
       "@emotion/react": "^11.11.3",
       "@emotion/styled": "^11.11.0"
     }
   }
   ```

4. **재설치 및 검증**
   ```bash
   # 기존 node_modules 삭제
   rm -rf node_modules yarn.lock

   # 재설치
   yarn install

   # 충돌 확인
   yarn why @emotion/react
   # 단일 버전만 나와야 함
   ```

### 시나리오 5: Monorepo 내부 패키지 버전 불일치

**상황**: Plugin이 @canard/schema-form의 잘못된 버전을 참조

```bash
# packages/canard-schema-form-mui-plugin/package.json
{
  "dependencies": {
    "@canard/schema-form": "^1.0.0"  // 특정 버전 지정
  }
}

# 실제 workspace의 @canard/schema-form은 2.0.0
# → 외부 NPM에서 1.0.0 다운로드 시도 (의도하지 않은 동작)
```

**해결 방법** (`knowledge/conflict-resolution.md` 섹션 1.3 참조):

1. **workspace 프로토콜 사용**
   ```json
   {
     "dependencies": {
       "@canard/schema-form": "workspace:*",  // ✅ 권장
       "@winglet/react-utils": "workspace:*"
     }
   }
   ```

2. **또는 "*" 버전 사용**
   ```json
   {
     "dependencies": {
       "@canard/schema-form": "*",  // ✅ 대안
       "@winglet/react-utils": "*"
     }
   }
   ```

3. **검증**
   ```bash
   # 재설치
   yarn install

   # workspace 링크 확인
   ls -la node_modules/@canard/schema-form
   # → ../../../canard/schema-form (심볼릭 링크여야 함)
   ```

### 시나리오 6: 불필요한 의존성 제거

**상황**: bundle 크기 증가로 불필요한 의존성 제거 필요

**작업 흐름**:

1. **번들 분석**
   ```bash
   # 번들 크기 확인
   yarn build
   ls -lh dist/

   # 또는 rollup-plugin-visualizer 사용
   yarn add -D rollup-plugin-visualizer
   ```

2. **사용하지 않는 의존성 찾기**
   ```bash
   # depcheck 도구 사용
   npx depcheck

   # 출력 예시:
   # Unused dependencies
   #   * lodash
   #   * moment
   ```

3. **의존성 제거**
   ```bash
   # package.json에서 제거
   yarn remove lodash moment

   # 또는 수동 편집 후
   yarn install
   ```

4. **대안 찾기**
   ```typescript
   // ❌ lodash 전체 import (큰 번들)
   import _ from 'lodash';

   // ✅ 필요한 함수만 import
   import debounce from 'lodash/debounce';

   // ✅ 또는 네이티브 구현
   const debounce = (fn, delay) => { /* ... */ };
   ```

## Knowledge 파일 역할

### conflict-resolution.md
**용도**: 의존성 충돌 해결 가이드

**주요 내용**:
- 충돌 유형 3가지 (버전 충돌, peerDependencies 미충족, 내부 패키지 버전 불일치)
- 충돌 진단 프로세스 (의존성 트리 분석, 버전 호환성 확인, 해결 전략 선택)
- 실전 예제 3가지 (React 18 마이그레이션, MUI v5/v6 동시 지원, Emotion 버전 충돌)
- 충돌 예방 전략 (peerDependencies 범위 설정, 내부 패키지 관리, 정기 업데이트)
- 버전 충돌 디버깅 도구 (yarn why, yarn list, yarn dedupe)
- package.json 검증 체크리스트

## Tools 파일 역할

### check-deps.sh
**용도**: package.json 의존성 자동 검증 스크립트

**실행 방법**:
```bash
./claude/skills/dependency-management/tools/check-deps.sh ./package.json
```

**검증 항목**:
1. 필수 필드 존재 확인 (name, version, main, module, types, dependencies, peerDependencies)
2. 내부 패키지 버전 확인 (@canard, @winglet이 "*" 또는 "workspace:*" 사용하는지)
3. React 버전 확인 (peerDependencies에 ">=18.0.0" 포함하는지)
4. 버전 범위 확인 (caret ^ 사용 권장)
5. dependencies와 peerDependencies 일관성 확인
6. exports 필드 확인 (ESM/CJS/Types 모두 정의되었는지)
7. 일반적인 문제 확인 (React가 dependencies에 있으면 경고)

**출력 예시**:
```bash
🔍 Checking dependencies in ./package.json

📦 Package: @canard/schema-form-mui-plugin

✓ Checking required fields...
  ✓ name: present
  ✓ version: present
  ✓ main: present
  ✓ module: present
  ✓ types: present
  ✓ dependencies: present
  ✓ peerDependencies: present

✓ Checking internal packages...
  ✓ @canard/schema-form: workspace:* (correct)
  ✓ @winglet/react-utils: workspace:* (correct)

✓ Checking React version...
  ✓ React: >=18.0.0 <20.0.0 (compatible with @canard/schema-form)

✓ Checking version ranges...
  ✓ @mui/material: ^6.0.0 (using caret range)
  ✓ @emotion/react: ^11.0.0 (using caret range)

✓ Checking dependency/peerDependency consistency...
  ✓ @mui/material: deps=^6.0.0, peer=>=6.0.0

✓ Checking exports field...
  ✓ ESM import: ./dist/index.js
  ✓ CJS require: ./dist/index.cjs
  ✓ TypeScript types: ./dist/index.d.ts

✓ Checking for common issues...

════════════════════════════════════════
Summary:
════════════════════════════════════════
✓ Validation complete

Next steps:
  1. Review warnings (⚠) and fix if necessary
  2. Run 'yarn install' to verify dependencies
  3. Run 'yarn typecheck' to verify types
```

## 다음 단계 연계

- 의존성 설정 후 `ui-plugin-guidelines` 스킬로 프로젝트 구조 설정
- 빌드 설정은 별도 작업 (rollup.config.mjs, tsconfig.json)

---

## 에러 처리

```yaml
error_handling:
  severity_high:
    conditions:
      - UI 라이브러리 버전 정보 조회 실패 (npm registry 접근 불가)
      - 필수 의존성 버전 충돌 (peer dependency 불일치)
      - package.json 작성 실패 (권한 문제)
      - 순환 의존성 감지
    action: |
      ❌ 치명적 오류 - package.json 생성 중단
      → npm registry 접근 확인: npm view @mui/material versions
      → peer dependency 확인: npm info {package} peerDependencies
      → 권한 확인: ls -la package.json
      → 순환 참조 해결 후 재실행
    examples:
      - condition: "npm registry 접근 불가"
        message: "❌ 오류: @mui/material 버전 정보를 가져올 수 없습니다 (Network error)"
        recovery: "네트워크 연결 확인 후 재실행 또는 오프라인 모드 사용"
      - condition: "peer dependency 충돌"
        message: "❌ 오류: react@18 필요하지만 프로젝트는 react@17 사용 중"
        recovery: "react 버전 업그레이드: yarn add react@^18.0.0 react-dom@^18.0.0"

  severity_medium:
    conditions:
      - 최신 버전 감지 실패 (버전 정보 불완전)
      - 알 수 없는 UI 라이브러리 (템플릿 없음)
      - peerDependencies 범위 모호
      - devDependencies 버전 충돌
    action: |
      ⚠️  경고 - 보수적 기본값 사용
      1. 최신 버전 대신 안정 버전 사용 (major.0.0)
      2. 알 수 없는 라이브러리: 범용 템플릿 적용
      3. peerDependencies: 넓은 범위 설정 (>= 사용)
      4. package.json에 경고 주석 추가
      5. 사용자에게 수동 업데이트 요청
    fallback_values:
      ui_library_version: "{major}.0.0"
      peer_range: ">={major}.0.0 <{major+1}.0.0"
      unknown_library: "generic_template"
    examples:
      - condition: "최신 버전 불명확"
        message: "⚠️  경고: @mui/material 최신 버전을 확인할 수 없습니다"
        fallback: "안정 버전 5.0.0 사용 → 설치 후 yarn upgrade로 최신화 권장"
      - condition: "알 수 없는 UI 라이브러리"
        message: "⚠️  경고: {library-name}에 대한 템플릿이 없습니다"
        fallback: "범용 템플릿 사용 → peerDependencies 수동 확인 필요"

  severity_low:
    conditions:
      - 선택적 의존성 누락 (storybook, testing-library)
      - 버전 범위 최적화 가능 (^1.0.0 → ^1.5.0)
      - devDependencies 정렬 순서
    action: |
      ℹ️  정보: 최적화 제안 - 자동 처리 가능
      → 선택적 의존성 생략 (사용자 필요시 추가)
      → 버전 범위 그대로 사용 (나중에 upgrade 가능)
      → devDependencies 알파벳 순 정렬
    examples:
      - condition: "선택적 의존성 없음"
        auto_handling: "Storybook 의존성 생략 (사용자가 필요시 직접 추가)"
      - condition: "버전 최적화 가능"
        auto_handling: "현재 버전 유지 (안정성 우선), yarn upgrade로 최신화 권장"
```

---

> **Best Practice**: 최신 메이저 버전 사용, peerDependencies 명확히 정의
> **Integration**: UI 라이브러리 호환성 검증 필수
> **Tools**: check-deps.sh로 package.json 검증 자동화

