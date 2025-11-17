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
```yaml
detection_conflict:
  action: 선택 + 사용자 경고
  priority: yarn > pnpm > npm > bun

  user_warning: |
    ⚠️  여러 패키지 매니저 lock 파일이 감지되었습니다:
    - yarn.lock (선택됨 ✅)
    - package-lock.json (충돌 ⚠️ )

    권장 조치:
    1. 사용하지 않는 lock 파일 삭제
       rm package-lock.json
    2. .gitignore에 추가하여 재생성 방지
       echo "package-lock.json" >> .gitignore

  yaml_comment: "# ⚠️  Multiple lock files: yarn.lock, package-lock.json (using yarn)"
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

## 에러 처리

```yaml
error_handling:
  severity_high:
    conditions:
      - package.json 파일이 존재하지 않음 (프로젝트 루트가 아님)
      - package.json 파싱 실패 (잘못된 JSON 형식)
      - 파일 시스템 접근 권한 없음
      - 필수 도구 미설치 (node, yarn/npm)
    action: |
      ❌ 치명적 오류 - 프로젝트 감지 중단
      → package.json 존재 확인: ls -la package.json
      → JSON 유효성 검사: cat package.json | jq .
      → 파일 시스템 권한 확인: ls -ld .
      → Node.js 설치 확인: node --version
      → 재실행: 프로젝트 루트 디렉토리에서 실행
    examples:
      - condition: "package.json 없음"
        message: "❌ 오류: package.json을 찾을 수 없습니다"
        recovery: "프로젝트 루트 디렉토리로 이동 후 재실행: cd /path/to/project && project_detector"
      - condition: "JSON 파싱 실패"
        message: "❌ 오류: package.json이 유효한 JSON이 아닙니다 (line 15)"
        recovery: "JSON 문법 오류 수정 후 재실행: jq . package.json"

  severity_medium:
    conditions:
      - 프로젝트 타입 감지 실패 (monorepo vs single-package 불명확)
      - 여러 패키지 매니저 lock 파일 존재 (yarn.lock + package-lock.json)
      - 알 수 없는 프레임워크/라이브러리 감지
      - 디렉토리 구조가 비표준 (packages, src, tests가 다른 위치)
      - 명령어 스크립트 감지 실패 (package.json scripts 누락)
    action: |
      ⚠️  경고 - 기본값으로 대체
      1. 프로젝트 타입: single-package (기본값)
      2. 패키지 매니저: 우선순위에 따라 자동 선택 (yarn > pnpm > npm)
      3. 프레임워크: "unknown"으로 표시
      4. 감지 결과 YAML에 경고 주석 추가:
         # ⚠️  WARNING: Could not definitively detect project type
         # → Please review and update if needed
      5. 사용자에게 수동 검증 요청
    fallback_values:
      project_type: "single-package"
      package_manager: "npm"
      framework: "unknown"
      source_dir: "src"
      tests_dir: "tests"
    examples:
      - condition: "프로젝트 타입 불명확"
        message: "⚠️  경고: Monorepo 지표가 불명확합니다 (workspaces 없음, packages/ 디렉토리 존재)"
        fallback: "single-package로 설정 → 수동 검증 필요"
      - condition: "여러 lock 파일"
        message: "⚠️  경고: yarn.lock과 package-lock.json이 모두 존재합니다"
        fallback: "yarn.lock 우선 사용 → package-lock.json 삭제 권장"

  severity_low:
    conditions:
      - 선택적 디렉토리 누락 (docs, examples, storybook)
      - 선택적 설정 파일 누락 (.prettierrc, .eslintrc)
      - 빈 custom scripts
      - 네이밍 컨벤션 통계 부족 (파일 수 < 5)
    action: |
      ℹ️  정보: 선택적 항목 누락 - 기본값 사용
      → docs_dir: "docs" (디렉토리 없어도 설정 포함)
      → custom_commands: {} (빈 객체)
      → 네이밍 컨벤션: "camelCase" (기본값)
    examples:
      - condition: "docs 디렉토리 없음"
        auto_handling: "docs_dir: 'docs'로 설정 (디렉토리 없어도 포함)"
      - condition: "네이밍 통계 부족"
        auto_handling: "camelCase 기본값 사용 (파일 수가 적어 통계적으로 불충분)"
```

---

> **Best Practice:** 감지 결과는 항상 사용자에게 확인 요청
> **Integration:** requirement-driven-development, plan-execution 규칙과 연동
