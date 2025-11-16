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

## 다음 단계 연계

- 의존성 설정 후 `ui-plugin-guidelines` 스킬로 프로젝트 구조 설정
- 빌드 설정은 별도 작업 (rollup.config.mjs, tsconfig.json)

---

> **Best Practice**: 최신 메이저 버전 사용, peerDependencies 명확히 정의
> **Integration**: UI 라이브러리 호환성 검증 필수

