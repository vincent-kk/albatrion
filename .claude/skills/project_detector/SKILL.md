# Project Detector Skill

## 역할
당신은 Node.js 프로젝트의 구조와 기술 스택을 자동으로 감지하는 전문가입니다.

## 핵심 책임
1. **패키지 매니저 감지**: yarn, npm, pnpm, bun 중 프로젝트에서 사용하는 도구 식별
2. **프로젝트 타입 감지**: monorepo vs single-package 구조 판별
3. **기술 스택 분석**: 프론트엔드/백엔드 프레임워크, 상태관리, 테스팅 도구 감지
4. **디렉토리 구조 파악**: packages, src, tests 등 주요 디렉토리 위치 식별
5. **명령어 추출**: package.json scripts에서 dev, test, lint, build 명령어 수집
6. **네이밍 컨벤션 분석**: 파일/디렉토리 명명 규칙 패턴 인식

## 감지 프로세스

### Phase 1: 패키지 매니저 감지
**우선순위:** `yarn.lock` > `pnpm-lock.yaml` > `package-lock.json` > `bun.lockb`

```typescript
const detectPackageManager = async (): Promise<PackageManager> => {
  const lockFiles = await Glob({ pattern: "*lock*" });

  if (lockFiles.includes('yarn.lock')) return 'yarn';
  if (lockFiles.includes('pnpm-lock.yaml')) return 'pnpm';
  if (lockFiles.includes('package-lock.json')) return 'npm';
  if (lockFiles.includes('bun.lockb')) return 'bun';

  return 'npm'; // default
};
```

### Phase 2: 프로젝트 타입 감지
**Monorepo 지표:**
- `package.json`에 `workspaces` 필드 존재
- `pnpm-workspace.yaml` 파일 존재
- `lerna.json` 또는 `nx.json` 존재
- `packages/`, `apps/`, `libs/` 디렉토리 존재

```typescript
const detectProjectType = async (packageJson: any): Promise<ProjectType> => {
  // Check workspaces field
  if (packageJson.workspaces) return 'monorepo';

  // Check config files
  const configFiles = await Glob({ pattern: "{pnpm-workspace.yaml,lerna.json,nx.json}" });
  if (configFiles.length > 0) return 'monorepo';

  // Check common directories
  const dirs = await Glob({ pattern: "{packages,apps,libs}/*" });
  if (dirs.length > 0) return 'monorepo';

  return 'single-package';
};
```

### Phase 3: 기술 스택 분석
**참조:** `knowledge/tech_stack_patterns.yaml`의 감지 규칙 사용

```typescript
interface TechStack {
  frontend: {
    framework: 'react' | 'vue' | 'angular' | 'svelte' | 'unknown';
    language: 'typescript' | 'javascript';
    ui_library: string;
  };
  backend: {
    framework: string;
    api_style: 'rest' | 'graphql' | 'trpc';
  };
  state_management: string[];
  testing: {
    unit: string;
    e2e: string;
    mocking?: string;
  };
}
```

**실행:** `tools/detect_tech_stack.ts` 스크립트 사용

### Phase 4: 명령어 추출
**package.json scripts 분석:**
- Monorepo: workspace-specific 명령어 감지 (예: `app:dev`, `api:test`)
- Single package: 표준 명령어 (dev, test, lint, build)
- Custom 명령어: generate:*, storybook 등

### Phase 5: 네이밍 컨벤션 분석
**실행:** `tools/analyze_naming.sh` 스크립트로 파일명 패턴 통계 분석

**감지 대상:**
- 컴포넌트: PascalCase vs camelCase
- 파일: kebab-case vs snake_case
- 디렉토리: kebab-case vs camelCase

## 출력 형식
```typescript
interface ProjectDetectionResult {
  packageManager: 'yarn' | 'npm' | 'pnpm' | 'bun';
  projectType: 'monorepo' | 'single-package';
  structure: {
    root: string;
    packagesDir?: string;  // monorepo only
    sourceDir: string;
    testsDir: string;
  };
  techStack: TechStack;
  commands: {
    dev: Record<string, string>;
    test: Record<string, string>;
    lint: Record<string, string>;
    build: Record<string, string>;
    custom: Record<string, string>;
  };
  namingConventions: {
    components: 'PascalCase' | 'camelCase';
    files: 'kebab-case' | 'snake_case' | 'PascalCase';
    directories: 'kebab-case' | 'camelCase';
  };
  development: {
    ports: {
      frontend: number;
      backend: number;
      storybook: number;
    };
  };
}
```

## 제약 조건
- `package.json`이 반드시 존재해야 함 (없으면 에러)
- 최대 10,000개 파일까지 분석 (대용량 프로젝트 대비)
- 바이너리 파일은 제외하고 텍스트 파일만 분석
- 감지 실패 시 합리적인 기본값 사용 (예: source_dir = "src")

## 에러 처리

### Case 1: package.json 없음
```
❌ Error: Not a Node.js project (no package.json found)
→ 상위 디렉토리 검색 시도
→ 여전히 없으면 종료
```

### Case 2: 여러 패키지 매니저 감지
```
⚠️  Warning: Multiple package managers detected (yarn.lock, package-lock.json)
→ 우선순위 규칙에 따라 yarn 선택
→ YAML에 주석으로 경고 추가
```

### Case 3: 프로젝트 타입 불명확
```
⚠️  Warning: Cannot determine project type
→ 기본값: single-package
→ 사용자 검토 요청
```

## 도구 실행 순서
1. **Glob** - 파일 시스템 스캔
2. **Read(package.json)** - 메타데이터 추출
3. **tools/detect_tech_stack.ts** - 의존성 분석
4. **tools/analyze_naming.sh** - 네이밍 패턴 통계
5. **결과 구조화** - ProjectDetectionResult 객체 생성

## 다음 단계
감지 결과는 `yaml_generator` 스킬로 전달되어 `.project-structure.yaml` 파일로 변환됩니다.

---

> **Best Practice:** 감지 결과는 항상 사용자에게 확인 요청
> **Integration:** requirement-driven-development, plan-execution 규칙과 연동
