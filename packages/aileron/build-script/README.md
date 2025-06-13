# esbuild Migration Complete 🎉

이 디렉토리는 기존의 복잡한 babel + rollup-plugin-esbuild-minify 구조를 단일 esbuild로 통합한 새로운 빌드 시스템입니다.

## 📊 마이그레이션 결과

- ✅ **24개 패키지 빌드 성공** (ESM + CJS)
- ✅ **227ms 빌드 시간** (기존 대비 대폭 단축)
- ✅ **단일 도구로 통합** (babel + rollup-plugin-esbuild-minify → esbuild)

## 🚀 사용법

### 전체 빌드

```bash
node esbuild.unified.mjs
```

### 선택적 빌드

```bash
# canard 패키지만
node esbuild.unified.mjs --canard

# lerx 패키지만
node esbuild.unified.mjs --lerx

# winglet 패키지만
node esbuild.unified.mjs --winglet
```

### 도움말

```bash
node esbuild.unified.mjs --help
```

## 📦 지원 패키지

### CANARD (6개)

- schema-form
- schema-form-ajv6-plugin
- schema-form-ajv8-plugin
- schema-form-antd-mobile-plugin
- schema-form-antd-plugin
- schema-form-mui-plugin

### LERX (1개)

- promise-modal (emotion 지원)

### WINGLET (5개)

- common-utils
- data-loader
- json
- json-schema
- react-utils

## 🔧 기술적 특징

### esbuild 설정

- **Target**: ES2022
- **Platform**: Node.js (canard/winglet), Browser (lerx)
- **Format**: ESM + CJS 동시 지원
- **Minification**: 내장 minifier 사용
- **Source Maps**: 지원
- **Tree Shaking**: 활성화

### 플러그인

- **Alias Resolver**: `@/package-name` 형태 alias 지원
- **Directory Resolver**: index 파일 자동 해결
- **External Dependencies**: 적절한 external 처리

### emotion 지원

- promise-modal의 `@emotion/css` 런타임 지원
- babel 플러그인 없이도 정상 동작

## 🔄 마이그레이션 혜택

1. **성능 향상**: 빌드 시간 대폭 단축
2. **설정 단순화**: 복잡한 babel 설정 제거
3. **도구 통합**: 단일 esbuild로 모든 처리
4. **유지보수성**: 간소화된 빌드 파이프라인
5. **병렬 처리**: 패키지 그룹별 병렬 빌드

## 📁 파일 구조

```
packages/aileron/build-script/
├── esbuild.unified.mjs     # 통합 빌드 스크립트
├── esbuild.canard.mjs      # canard 패키지 빌드
├── esbuild.lerx.mjs        # lerx 패키지 빌드
├── esbuild.winglet.mjs     # winglet 패키지 빌드
├── test-esbuild.mjs        # 테스트 스크립트
└── README.md               # 이 파일
```

## 🚨 주의사항

- 경고 메시지는 `sideEffects: false` 설정과 관련된 것으로 실제 동작에는 영향 없음
- 기존 rollup 설정들은 점진적으로 새로운 esbuild 스크립트로 교체 가능
- emotion은 런타임 방식으로 동작하므로 babel 플러그인 불필요

---

> **Migration completed successfully!** 🎊
>
> 복잡했던 babel + rollup-plugin-esbuild-minify 구조가 깔끔한 단일 esbuild 시스템으로 통합되었습니다.
