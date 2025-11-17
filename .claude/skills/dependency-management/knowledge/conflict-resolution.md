# Dependency Conflict Resolution Guide

의존성 충돌 해결 가이드

## 1. 충돌 유형 및 해결 방법

### 1.1 버전 충돌

**문제**: 서로 다른 패키지가 같은 의존성의 다른 버전을 요구

```bash
# 예시: react 버전 충돌
Package A requires: react@^17.0.0
Package B requires: react@^18.0.0
```

**해결 방법**:

```bash
# 1. yarn why로 의존성 트리 분석
yarn why react

# 2. 상위 버전으로 통일 (peerDependencies 업데이트)
{
  "peerDependencies": {
    "react": ">=17.0.0 <19.0.0"  # 범위 확장
  }
}

# 3. resolutions로 강제 버전 지정 (yarn.lock 레벨)
{
  "resolutions": {
    "react": "^18.0.0"
  }
}
```

### 1.2 peerDependencies 미충족

**문제**: 호스트 프로젝트에 필요한 peerDependency가 없음

```bash
warning "@canard/schema-form-mui-plugin@1.0.0" has unmet peer dependency "@mui/material@>=5.0.0"
```

**해결 방법**:

```bash
# 1. 호스트 프로젝트에 peerDependency 설치
yarn add @mui/material@^5.0.0

# 2. 또는 plugin의 peerDependencies 수정 (버전 범위 완화)
{
  "peerDependencies": {
    "@mui/material": ">=5.0.0 || >=6.0.0"
  }
}
```

### 1.3 내부 패키지 버전 불일치

**문제**: Monorepo 내부 패키지 간 버전 불일치

```bash
# @canard/schema-form-mui-plugin이 요구하는 @canard/schema-form 버전이
# 실제 workspace의 버전과 다름
```

**해결 방법**:

```bash
# 1. workspace 프로토콜 사용 (권장)
{
  "dependencies": {
    "@canard/schema-form": "workspace:*"
  }
}

# 2. 또는 "*" 버전 사용
{
  "dependencies": {
    "@canard/schema-form": "*"
  }
}

# 3. yarn workspace에서 재설치
yarn install
```

## 2. 충돌 진단 프로세스

### Step 1: 의존성 트리 분석

```bash
# 전체 의존성 트리 확인
yarn list --pattern "react"

# 특정 패키지의 의존성 확인
yarn why react
yarn why @mui/material

# 중복 패키지 찾기
yarn dedupe --check
```

### Step 2: 버전 호환성 확인

```bash
# NPM에서 버전 정보 조회
npm view @mui/material versions
npm view @mui/material peerDependencies

# 또는 yarn
yarn info @mui/material versions
yarn info @mui/material peerDependencies
```

### Step 3: 충돌 해결 전략 선택

**전략 1: 버전 범위 확장**
- peerDependencies 범위를 넓혀 호환성 확보
- 예: `">=5.0.0"` → `">=5.0.0 || >=6.0.0"`

**전략 2: resolutions 사용**
- yarn.lock 레벨에서 버전 강제 지정
- 모든 하위 의존성이 동일 버전 사용

**전략 3: 패키지 업그레이드**
- 충돌을 일으키는 패키지를 최신 버전으로 업그레이드
- Breaking changes 확인 필수

## 3. 실전 예제

### 예제 1: React 18 마이그레이션

**상황**: React 17에서 18로 업그레이드 시 플러그인 충돌

```json
// 기존 peerDependencies
{
  "peerDependencies": {
    "react": ">=17.0.0 <18.0.0"  // React 18 지원 안 함
  }
}
```

**해결**:

```json
// 1. peerDependencies 범위 확장
{
  "peerDependencies": {
    "react": ">=17.0.0 <19.0.0"  // React 17, 18 모두 지원
  }
}

// 2. dependencies도 업데이트 (테스트용)
{
  "dependencies": {
    "react": "^18.0.0"  // 테스트는 React 18로
  }
}

// 3. devDependencies 업데이트
{
  "devDependencies": {
    "@types/react": "^18.0.0"
  }
}
```

### 예제 2: MUI v5/v6 동시 지원

**상황**: MUI v5와 v6를 모두 지원하고 싶음

```json
// 문제: v5만 지원
{
  "peerDependencies": {
    "@mui/material": ">=5.0.0 <6.0.0"
  }
}
```

**해결**:

```json
// 방법 1: 범위 확장
{
  "peerDependencies": {
    "@mui/material": ">=5.0.0 <7.0.0"
  }
}

// 방법 2: 또는 연산자 사용
{
  "peerDependencies": {
    "@mui/material": ">=5.0.0 || >=6.0.0"
  }
}

// dependencies는 최신 메이저 버전 사용
{
  "dependencies": {
    "@mui/material": "^6.0.0"  // v6 기준 개발
  }
}
```

**주의사항**: Breaking changes 확인 필수
- MUI v5 → v6 변경사항 확인
- 두 버전 모두에서 테스트 필요

### 예제 3: Emotion 버전 충돌

**상황**: MUI와 Chakra UI가 서로 다른 Emotion 버전 요구

```bash
@mui/material requires @emotion/react@^11.0.0
@chakra-ui/react requires @emotion/react@^11.10.0
```

**해결**:

```json
// 1. resolutions로 통일
{
  "resolutions": {
    "@emotion/react": "^11.11.0",  // 두 요구사항을 모두 만족하는 버전
    "@emotion/styled": "^11.11.0"
  }
}

// 2. peerDependencies 범위 확인
{
  "peerDependencies": {
    "@emotion/react": ">=11.0.0",  // 충분히 넓은 범위
    "@emotion/styled": ">=11.0.0"
  }
}
```

## 4. 충돌 예방 전략

### 4.1 peerDependencies 범위 설정 원칙

```json
// ❌ 너무 좁은 범위 (유지보수 어려움)
{
  "peerDependencies": {
    "@mui/material": "5.14.0"  // 정확한 버전만 허용
  }
}

// ❌ 너무 넓은 범위 (호환성 보장 어려움)
{
  "peerDependencies": {
    "@mui/material": "*"  // 모든 버전 허용
  }
}

// ✅ 적절한 범위 (권장)
{
  "peerDependencies": {
    "@mui/material": ">=5.0.0 <7.0.0"  // 메이저 버전 2개 지원
  }
}
```

### 4.2 내부 패키지 버전 관리

```json
// ✅ Monorepo 내부 패키지는 workspace 프로토콜 사용
{
  "dependencies": {
    "@canard/schema-form": "workspace:*",
    "@winglet/react-utils": "workspace:*"
  }
}

// 또는
{
  "dependencies": {
    "@canard/schema-form": "*",
    "@winglet/react-utils": "*"
  }
}
```

### 4.3 정기적인 의존성 업데이트

```bash
# 1. 오래된 의존성 확인
yarn outdated

# 2. 인터랙티브 업그레이드
yarn upgrade-interactive

# 3. 또는 자동 업데이트 (마이너/패치만)
yarn upgrade --latest --pattern "@mui/*"
```

## 5. 버전 충돌 디버깅 도구

### 5.1 yarn why

```bash
# 특정 패키지가 왜 설치되었는지 확인
yarn why react
yarn why @emotion/react

# 출력 예시:
# => Found "react@18.2.0"
# info Reasons this module exists
#    - "@canard#schema-form" depends on it
#    - Hoisted from "@canard#schema-form#react"
```

### 5.2 yarn list

```bash
# 의존성 트리 확인
yarn list --pattern "react"

# 특정 depth까지만 확인
yarn list --depth=1 --pattern "@mui/*"
```

### 5.3 yarn dedupe

```bash
# 중복 의존성 제거
yarn dedupe

# 또는 특정 패키지만
yarn dedupe react @emotion/react
```

## 6. package.json 검증 체크리스트

- [ ] dependencies: 런타임에 필요한 패키지만 포함
- [ ] peerDependencies: 호스트가 제공해야 할 패키지 명시
- [ ] devDependencies: 개발/빌드 도구만 포함
- [ ] 버전 범위: 너무 좁지도, 너무 넓지도 않게
- [ ] 내부 패키지: workspace 프로토콜 또는 "*" 사용
- [ ] React 버전: @canard/schema-form과 호환되는 버전 (>=18.0.0)
- [ ] resolutions: 정말 필요한 경우만 사용
- [ ] 중복 제거: yarn dedupe 실행

## 7. 충돌 발생 시 체크리스트

1. **yarn why로 원인 분석**
   ```bash
   yarn why <conflicting-package>
   ```

2. **버전 호환성 확인**
   ```bash
   npm view <package> peerDependencies
   ```

3. **해결 전략 선택**
   - peerDependencies 범위 확장?
   - resolutions 사용?
   - 패키지 업그레이드?

4. **변경 후 테스트**
   ```bash
   yarn install
   yarn typecheck
   yarn test
   yarn build
   ```

5. **문서화**
   - CHANGELOG.md에 변경사항 기록
   - README.md의 호환성 정보 업데이트

---

이 가이드는 @canard/schema-form 플러그인 개발 시 발생하는 의존성 충돌을 체계적으로 해결하는 방법을 제시합니다.
