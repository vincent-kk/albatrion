# Changeset 완전 정복 가이드

모노레포 환경에서 Changeset을 사용한 효율적이고 안전한 버전 관리 및 릴리스 자동화 완전 가이드입니다.

## 📚 목차

1. [Changeset 이해하기](#-changeset-이해하기)
2. [프로젝트 설정](#-프로젝트-설정)
3. [기본 워크플로우](#-기본-워크플로우)
4. [실무 시나리오별 가이드](#-실무-시나리오별-가이드)
5. [고급 설정 및 자동화](#-고급-설정-및-자동화)
6. [CI/CD 통합](#-cicd-통합)
7. [팀 협업 가이드라인](#-팀-협업-가이드라인)
8. [트러블슈팅](#-트러블슈팅)
9. [빠른 참조](#-빠른-참조)

---

## 🎯 Changeset 이해하기

### 개념과 필요성

Changeset은 모노레포 환경에서 **패키지별 독립적인 버전 관리**와 **자동화된 릴리스 프로세스**를 제공하는 도구입니다.

**왜 Changeset을 사용해야 할까요?**

1. **패키지별 독립적 버전 관리**: 각 패키지가 자체 릴리스 사이클을 가질 수 있습니다
2. **의존성 자동 추적**: 내부 패키지 간 의존성 변경을 자동으로 감지하고 버전을 업데이트합니다
3. **일관된 CHANGELOG**: 표준화된 형식의 변경 로그를 자동 생성합니다
4. **휴먼 에러 방지**: 수동 버전 관리에서 발생할 수 있는 실수를 방지합니다

### 대안 도구 비교

| 도구          | 장점                   | 단점                  | 적합한 경우                     |
| ------------- | ---------------------- | --------------------- | ------------------------------- |
| **Changeset** | 유연성, 수동 제어 가능 | 초기 학습 곡선        | 복잡한 의존성, 세밀한 제어 필요 |
| Lerna         | 간단한 설정            | 제한적인 커스터마이징 | 단순한 모노레포                 |
| Rush          | 대규모 프로젝트 최적화 | 복잡한 설정           | 대기업 수준의 대규모 프로젝트   |
| Nx            | 통합된 개발 경험       | 무거운 설정           | 풀스택 개발 환경                |

---

## 🛠️ 프로젝트 설정

### 1. 패키지 설치

```bash
# 기본 패키지 설치
yarn add -D @changesets/cli

# GitHub 통합을 위한 추가 패키지 (선택사항)
yarn add -D @changesets/changelog-github
```

### 2. 초기화

```bash
# Changeset 초기화
yarn changeset init
```

### 3. 설정 파일 구성

`.changeset/config.json` 파일을 TypeScript 프로젝트에 최적화된 설정으로 구성합니다:

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": [
    "@changesets/changelog-github",
    {
      "repo": "your-org/your-repo"
    }
  ],
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "restricted",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["@your-org/*-test", "@your-org/*-dev-tools"],
  "___experimentalUnsafeOptions_WILL_CHANGE_IN_PATCH": {
    "onlyUpdatePeerDependentsWhenOutOfRange": true,
    "useCalculatedVersionForSnapshots": true
  }
}
```

**설정 옵션 상세 설명:**

- `updateInternalDependencies: "patch"`: 내부 패키지 의존성 변경 시 자동으로 patch 버전 증가
- `access: "restricted"`: 기본적으로 private 패키지로 설정 (npm 조직 계정 필요)
- `ignore`: 버전 관리에서 제외할 패키지 패턴
- `experimentalUnsafeOptions`: 성능 최적화 옵션

### 4. package.json 스크립트 설정

```json
{
  "scripts": {
    "changeset": "changeset",
    "changeset:add": "changeset add",
    "changeset:status": "changeset status",
    "changeset:version": "changeset version && yarn install",
    "changeset:publish": "yarn build && changeset publish",
    "changeset:release": "yarn changeset:version && yarn changeset:publish",
    "changeset:snapshot": "changeset version --snapshot && yarn changeset publish --tag snapshot"
  }
}
```

---

## 🔄 기본 워크플로우

### 단계별 워크플로우

#### 1단계: 개발 및 변경사항 확인

```bash
# 현재 변경된 패키지 확인
yarn changeset status

# 변경된 파일 확인
git status
```

#### 2단계: Changeset 생성

**방법 A: 대화형 생성 (권장)**

```bash
yarn changeset
```

이 명령어는 다음과 같은 대화형 프로세스를 진행합니다:

1. 변경된 패키지 목록 표시
2. 각 패키지의 변경 유형 선택 (major/minor/patch)
3. 변경사항에 대한 설명 입력

**방법 B: 빠른 생성**

```bash
# 빈 changeset 생성 후 수동 편집
yarn changeset add --empty
```

#### 3단계: Changeset 파일 검토 및 편집

생성된 `.changeset/*.md` 파일을 확인하고 필요시 수정합니다:

```markdown
---
"@your-org/ui-components": minor
"@your-org/utils": patch
---

새로운 Button 컴포넌트 추가 및 유틸리티 함수 개선

**주요 변경사항:**

- Button 컴포넌트에 variant props 추가
- validateEmail 함수 성능 최적화
- TypeScript 타입 정의 개선

**Breaking Changes:**

- 없음

**Migration Guide:**

- 기존 코드 변경 불필요
```

#### 4단계: 버전 업데이트

```bash
# changeset을 적용하여 package.json 버전 업데이트
yarn changeset:version
```

이 명령어가 수행하는 작업:

- 각 패키지의 `package.json` 버전 업데이트
- `CHANGELOG.md` 파일 생성/업데이트
- 내부 의존성 자동 업데이트
- changeset 파일 자동 삭제

#### 5단계: 패키지 게시

```bash
# 프로덕션 게시
yarn changeset:publish

# 테스트 게시 (dry-run)
yarn changeset publish --dry-run

# 스냅샷 게시 (베타 테스트용)
yarn changeset:snapshot
```

---

## 📋 실무 시나리오별 가이드

### 시나리오 1: 긴급 버그 수정

```bash
# 1. 핫픽스 브랜치 생성
git checkout -b hotfix/critical-bug-fix

# 2. 버그 수정 후 즉시 changeset 생성
yarn changeset add --empty
# 생성된 파일에 다음 내용 작성:
# ---
# "@your-org/affected-package": patch
# ---
#
# 긴급 버그 수정: [구체적인 버그 설명]

# 3. 버전 업데이트 및 즉시 게시
yarn changeset:version
yarn changeset:publish

# 4. 메인 브랜치에 머지
git checkout main
git merge hotfix/critical-bug-fix
```

### 시나리오 2: 대규모 기능 개발 (Breaking Changes)

```bash
# 1. 기능 브랜치에서 개발 완료 후
yarn changeset

# 2. major 버전 선택 및 상세한 마이그레이션 가이드 작성
# 생성된 changeset 파일 예시:
```

```markdown
---
"@your-org/core": major
"@your-org/ui-components": major
---

v2.0.0: 새로운 컴포넌트 아키텍처 도입

**Breaking Changes:**

1. `Component.props.variant` → `Component.props.appearance`로 변경
2. `useTheme()` 훅의 반환 타입 변경

**Migration Guide:**

\`\`\`typescript
// Before (v1.x)
<Button variant="primary" />
const { colors } = useTheme();

// After (v2.x)
<Button appearance="primary" />
const { theme: { colors } } = useTheme();
\`\`\`

**새로운 기능:**

- 다크 모드 지원
- 반응형 디자인 시스템
- 접근성 개선
```

### 시나리오 3: 의존성 업데이트

```bash
# 1. 의존성 업데이트 후 changeset 생성
yarn changeset
```

```markdown
---
"@your-org/core": patch
"@your-org/ui-components": patch
---

외부 의존성 업데이트

**업데이트된 패키지:**

- react: ^18.2.0 → ^18.3.0
- typescript: ^5.1.0 → ^5.2.0
- eslint: ^8.45.0 → ^8.46.0

**보안 수정사항:**

- CVE-2023-xxxxx 보안 취약점 해결
```

### 시나리오 4: 다중 패키지 동시 업데이트

```typescript
// scripts/bulk-changeset.ts
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

interface PackageInfo {
  name: string;
  version: string;
  changed: boolean;
}

function getChangedPackages(): PackageInfo[] {
  // Git diff로 변경된 패키지 감지
  const output = execSync("git diff --name-only HEAD~1", { encoding: "utf8" });

  const changedFiles = output.split("\n").filter(Boolean);
  const packageDirs = new Set<string>();

  for (const file of changedFiles) {
    const match = file.match(/^packages\/([^\/]+)\//);
    if (match) {
      packageDirs.add(match[1]);
    }
  }

  return Array.from(packageDirs).map((dir) => {
    const packageJsonPath = path.join("packages", dir, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    return {
      name: packageJson.name,
      version: packageJson.version,
      changed: true,
    };
  });
}

function createBulkChangeset(
  packages: PackageInfo[],
  versionType: "patch" | "minor" | "major" = "patch",
) {
  const frontmatter = packages
    .map((pkg) => `"${pkg.name}": ${versionType}`)
    .join("\n");

  const content = `---
${frontmatter}
---

Bulk update: ${new Date().toISOString().split("T")[0]}

**Updated packages (${versionType}):**
${packages.map((pkg) => `- ${pkg.name}`).join("\n")}
`;

  const filename = `.changeset/bulk-${Date.now()}.md`;
  fs.writeFileSync(filename, content);
  console.log(`✅ Created bulk changeset: ${filename}`);
}

// 실행
const changedPackages = getChangedPackages();
if (changedPackages.length > 0) {
  createBulkChangeset(changedPackages, "patch");
} else {
  console.log("변경된 패키지가 없습니다.");
}
```

---

## ⚙️ 고급 설정 및 자동화

### 의존성 연결 설정

복잡한 패키지 간 의존성을 관리하기 위한 고급 설정:

```json
{
  "linked": [
    ["@your-org/core", "@your-org/react-components"],
    ["@your-org/ui-*"]
  ],
  "fixed": [
    [
      "@your-org/design-tokens",
      "@your-org/ui-components",
      "@your-org/react-components"
    ]
  ]
}
```

**설정 의미:**

- `linked`: 함께 버전이 올라가야 하는 패키지들
- `fixed`: 항상 동일한 버전을 유지해야 하는 패키지들

### Git Hooks 통합

`.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Changeset 상태 확인
echo "🔍 Changeset 상태 확인 중..."
status_output=$(yarn changeset status 2>&1)

if echo "$status_output" | grep -q "error"; then
  if echo "$status_output" | grep -q "Some packages have been changed but no changesets were found"; then
    echo "❌ 변경된 패키지가 있지만 changeset이 없습니다."
    echo "📝 다음 명령어 중 하나를 실행하세요:"
    echo "   yarn changeset"
    echo "   yarn changeset add --empty"
    exit 1
  fi
fi

echo "✅ Changeset 상태 확인 완료"
```

### 자동화 스크립트

`scripts/auto-changeset.ts`:

```typescript
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

interface ChangesetConfig {
  autoGenerate: boolean;
  defaultVersionType: "patch" | "minor" | "major";
  commitPattern: {
    feat: "minor";
    fix: "patch";
    breaking: "major";
  };
}

class ChangesetAutomation {
  private config: ChangesetConfig;

  constructor(config: ChangesetConfig) {
    this.config = config;
  }

  analyzeCommitType(): "patch" | "minor" | "major" {
    try {
      const lastCommit = execSync('git log -1 --pretty=format:"%s"', {
        encoding: "utf8",
      });

      if (
        lastCommit.includes("BREAKING CHANGE") ||
        lastCommit.startsWith("feat!:")
      ) {
        return "major";
      } else if (lastCommit.startsWith("feat:")) {
        return "minor";
      } else if (lastCommit.startsWith("fix:")) {
        return "patch";
      }

      return this.config.defaultVersionType;
    } catch {
      return this.config.defaultVersionType;
    }
  }

  generateSmartChangeset(): void {
    if (!this.config.autoGenerate) {
      console.log(
        "🔄 Auto-generation is disabled. Use manual changeset creation.",
      );
      return;
    }

    const versionType = this.analyzeCommitType();
    const timestamp = Date.now();
    const lastCommit = execSync('git log -1 --pretty=format:"%s"', {
      encoding: "utf8",
    });

    const content = `---
---

Auto-generated changeset (${versionType})

Commit: ${lastCommit}
Generated: ${new Date().toISOString()}
`;

    const filename = `.changeset/auto-${timestamp}.md`;
    fs.writeFileSync(filename, content);

    console.log(`✅ Generated automatic changeset: ${filename}`);
    console.log(`📋 Version type: ${versionType}`);
  }
}

// 사용 예시
const automation = new ChangesetAutomation({
  autoGenerate: true,
  defaultVersionType: "patch",
  commitPattern: {
    feat: "minor",
    fix: "patch",
    breaking: "major",
  },
});

automation.generateSmartChangeset();
```

---

## 🚀 CI/CD 통합

### GitHub Actions 워크플로우

`.github/workflows/release.yml`:

```yaml
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
      - name: Checkout Repo
        uses: actions/checkout@v4
        with:
          # changeset이 전체 git history에 접근할 수 있도록
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: "yarn"

      - name: Install Dependencies
        run: yarn install --frozen-lockfile

      - name: Build packages
        run: yarn build

      - name: Run tests
        run: yarn test

      - name: Create Release Pull Request or Publish to npm
        id: changesets
        uses: changesets/action@v1
        with:
          # 릴리스 PR을 생성하거나 패키지를 게시
          publish: yarn changeset:publish
          # PR 제목 커스터마이징
          title: "chore: release packages"
          # 커밋 메시지 커스터마이징
          commit: "chore: release packages"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Send Slack notification
        if: steps.changesets.outputs.published == 'true'
        uses: 8398a7/action-slack@v3
        with:
          status: custom
          custom_payload: |
            {
              text: "📦 새로운 패키지가 릴리스되었습니다!",
              attachments: [{
                color: "good",
                fields: [{
                  title: "Released packages",
                  value: "${{ steps.changesets.outputs.publishedPackages }}",
                  short: false
                }]
              }]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### 멀티 환경 배포

`.github/workflows/deploy-staging.yml`:

```yaml
name: Deploy to Staging
on:
  push:
    branches:
      - develop

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: "yarn"

      - name: Install Dependencies
        run: yarn install --frozen-lockfile

      - name: Build packages
        run: yarn build

      - name: Create snapshot release
        run: |
          yarn changeset version --snapshot staging
          yarn changeset publish --tag staging
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Rollback 전략

`scripts/rollback.ts`:

```typescript
import { execSync } from "child_process";

interface RollbackOptions {
  packageName: string;
  targetVersion: string;
  dry?: boolean;
}

class ReleaseRollback {
  async rollbackPackage({
    packageName,
    targetVersion,
    dry = false,
  }: RollbackOptions): Promise<void> {
    console.log(
      `🔄 Rolling back ${packageName} to version ${targetVersion}...`,
    );

    if (dry) {
      console.log("🧪 DRY RUN MODE - No actual changes will be made");
    }

    try {
      // 1. npm에서 해당 버전이 존재하는지 확인
      const npmInfo = execSync(
        `npm view ${packageName}@${targetVersion} version`,
        { encoding: "utf8" },
      );

      if (!npmInfo.trim()) {
        throw new Error(
          `Version ${targetVersion} does not exist for ${packageName}`,
        );
      }

      // 2. Git에서 해당 버전의 커밋 찾기
      const tagName = `${packageName}@${targetVersion}`;
      const commitSha = execSync(`git rev-list -n 1 ${tagName}`, {
        encoding: "utf8",
      }).trim();

      console.log(`📍 Found commit: ${commitSha}`);

      if (!dry) {
        // 3. 새로운 changeset 생성 (rollback용)
        const changesetContent = `---
"${packageName}": patch
---

Rollback to version ${targetVersion}

This is a rollback release to restore functionality.
Previous version had critical issues that required immediate rollback.

**Rollback details:**
- Target version: ${targetVersion}
- Rollback commit: ${commitSha}
- Rollback date: ${new Date().toISOString()}
`;

        const filename = `.changeset/rollback-${Date.now()}.md`;
        require("fs").writeFileSync(filename, changesetContent);

        console.log(`✅ Created rollback changeset: ${filename}`);
        console.log(`🚀 Run 'yarn changeset:release' to publish the rollback`);
      }
    } catch (error) {
      console.error(`❌ Rollback failed: ${error.message}`);
      throw error;
    }
  }
}

// 사용 예시
const rollback = new ReleaseRollback();
rollback.rollbackPackage({
  packageName: "@your-org/ui-components",
  targetVersion: "1.2.3",
  dry: true,
});
```

---

## 👥 팀 협업 가이드라인

### Changeset 작성 컨벤션

**1. 버전 타입 결정 기준**

```typescript
// Semantic Versioning 가이드
interface VersioningGuide {
  patch: {
    description: "버그 수정, 성능 개선, 문서 업데이트";
    examples: [
      "버그 수정",
      "타입 정의 개선",
      "성능 최적화",
      "의존성 업데이트",
      "문서 업데이트",
    ];
  };
  minor: {
    description: "새로운 기능 추가 (하위 호환성 유지)";
    examples: [
      "새로운 컴포넌트 추가",
      "기존 API에 새로운 옵션 추가",
      "새로운 유틸리티 함수 추가",
      "선택적 props 추가",
    ];
  };
  major: {
    description: "Breaking changes (하위 호환성 깨짐)";
    examples: [
      "기존 API 변경/제거",
      "필수 props 추가",
      "컴포넌트 구조 변경",
      "최소 지원 버전 변경",
    ];
  };
}
```

**2. Changeset 메시지 템플릿**

```markdown
<!-- 제목: 한 줄로 변경사항 요약 -->

## 📝 변경사항 요약

<!-- 변경 내용을 명확하게 설명 -->

## 🔧 기술적 세부사항

<!-- 구현 방법, 아키텍처 변경사항 등 -->

## 🧪 테스트

<!-- 추가된 테스트, 검증 방법 -->

## 📚 문서

<!-- 업데이트된 문서, README 변경사항 -->

## ⚠️ Breaking Changes (해당시에만)

<!-- Breaking changes가 있을 경우 상세한 마이그레이션 가이드 -->

## 🚀 Migration Guide

<!-- 사용자가 새 버전으로 업그레이드하는 방법 -->
```

**3. 팀 리뷰 프로세스**

```typescript
// .github/PULL_REQUEST_TEMPLATE.md에 포함할 체크리스트
interface ChangesetReviewChecklist {
  requirements: [
    "□ 적절한 버전 타입이 선택되었는가? (patch/minor/major)",
    "□ 변경사항이 명확하게 설명되었는가?",
    "□ Breaking changes가 있다면 마이그레이션 가이드가 포함되었는가?",
    "□ 의존성 변경사항이 올바르게 반영되었는가?",
    "□ 테스트가 추가/업데이트되었는가?",
  ];
  approvalProcess: {
    patch: "1명의 승인";
    minor: "2명의 승인 + 테크리드 확인";
    major: "팀 전체 리뷰 + 아키텍트 승인";
  };
}
```

### 릴리스 일정 관리

**주간 릴리스 스케줄 예시:**

```typescript
interface ReleaseSchedule {
  weekly: {
    monday: "개발 시작, changeset 검토";
    wednesday: "중간 검토, changeset 정리";
    friday: "릴리스 준비, QA 테스트";
  };
  monthly: {
    firstWeek: "Major 릴리스 검토";
    secondWeek: "Feature 개발";
    thirdWeek: "Bug fix 및 개선";
    fourthWeek: "다음 달 계획 수립";
  };
}
```

### 코드 리뷰에서 Changeset 체크포인트

```typescript
// scripts/changeset-validator.ts
interface ChangesetValidation {
  validateChangesetFormat(changesetPath: string): boolean;
  checkVersionConsistency(packageChanges: string[]): boolean;
  validateDependencyUpdates(internalDeps: string[]): boolean;
  generateReviewSummary(): string;
}

class ChangesetValidator implements ChangesetValidation {
  validateChangesetFormat(changesetPath: string): boolean {
    const content = require("fs").readFileSync(changesetPath, "utf8");

    // frontmatter 검증
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);

    if (!match) {
      console.error("❌ Invalid changeset format: Missing frontmatter");
      return false;
    }

    const [, frontmatter, description] = match;

    // 패키지명과 버전 타입 검증
    const packageLines = frontmatter.trim().split("\n");
    for (const line of packageLines) {
      if (!line.match(/^"@[\w-]+\/[\w-]+": (patch|minor|major)$/)) {
        console.error(`❌ Invalid package line: ${line}`);
        return false;
      }
    }

    // 설명 길이 검증
    if (description.trim().length < 10) {
      console.error("❌ Description too short (minimum 10 characters)");
      return false;
    }

    return true;
  }

  checkVersionConsistency(packageChanges: string[]): boolean {
    // 의존성 일관성 검사 로직
    return true;
  }

  validateDependencyUpdates(internalDeps: string[]): boolean {
    // 내부 의존성 업데이트 검사
    return true;
  }

  generateReviewSummary(): string {
    return `
## 📋 Changeset 리뷰 요약

### ✅ 검증 완료 항목
- Changeset 형식 검증
- 버전 타입 일관성 검사
- 의존성 업데이트 검증

### 📊 변경 통계
- 총 변경 패키지: X개
- patch: X개, minor: X개, major: X개
`;
  }
}
```

---

## 🔧 트러블슈팅

### 자주 발생하는 문제와 해결법

#### 1. "Some packages have been changed but no changesets were found"

**원인:** 패키지에 변경사항이 있지만 changeset이 생성되지 않음

```bash
# 해결법 1: 변경된 패키지 확인 후 changeset 생성
yarn changeset status
yarn changeset

# 해결법 2: 릴리스가 필요없는 변경인 경우
yarn changeset add --empty

# 해결법 3: 강제로 changeset 스킵 (권장하지 않음)
git commit -m "chore: ignore changeset" --no-verify
```

#### 2. 버전 충돌 문제

**상황:** 여러 브랜치에서 동시에 버전 업데이트가 발생

```typescript
// scripts/resolve-version-conflicts.ts
import { execSync } from "child_process";
import * as fs from "fs";

interface ConflictResolver {
  detectVersionConflicts(): string[];
  resolveConflicts(strategy: "latest" | "conservative" | "manual"): void;
  generateConflictReport(): string;
}

class VersionConflictResolver implements ConflictResolver {
  detectVersionConflicts(): string[] {
    const conflicts: string[] = [];

    try {
      // Git merge conflicts 감지
      const gitStatus = execSync("git status --porcelain", {
        encoding: "utf8",
      });
      const conflictFiles = gitStatus
        .split("\n")
        .filter((line) => line.startsWith("UU"))
        .map((line) => line.substring(3));

      // package.json conflicts 필터링
      const packageConflicts = conflictFiles.filter(
        (file) =>
          file.endsWith("package.json") || file.includes("CHANGELOG.md"),
      );

      return packageConflicts;
    } catch (error) {
      console.error("Git status check failed:", error);
      return [];
    }
  }

  resolveConflicts(strategy: "latest" | "conservative" | "manual"): void {
    const conflicts = this.detectVersionConflicts();

    for (const conflictFile of conflicts) {
      console.log(`🔧 Resolving conflict in ${conflictFile}...`);

      switch (strategy) {
        case "latest":
          this.resolveWithLatestVersion(conflictFile);
          break;
        case "conservative":
          this.resolveWithConservativeVersion(conflictFile);
          break;
        case "manual":
          console.log(`⏸️  Manual resolution required for ${conflictFile}`);
          break;
      }
    }
  }

  private resolveWithLatestVersion(filePath: string): void {
    // 최신 버전을 선택하는 로직
    console.log(`✅ Resolved ${filePath} with latest version strategy`);
  }

  private resolveWithConservativeVersion(filePath: string): void {
    // 보수적인 버전을 선택하는 로직 (더 낮은 버전)
    console.log(`✅ Resolved ${filePath} with conservative version strategy`);
  }

  generateConflictReport(): string {
    return `
## 🚨 Version Conflict Report

### 감지된 충돌
- 충돌 파일 수: X개
- 해결 전략: [strategy]
- 해결 시간: ${new Date().toISOString()}

### 권장사항
1. 충돌 해결 후 전체 빌드 테스트 실행
2. 의존성 체크 재실행
3. E2E 테스트 실행
`;
  }
}
```

#### 3. 의존성 업데이트 실패

**문제:** 내부 패키지 의존성이 올바르게 업데이트되지 않음

```bash
# 해결법 1: 의존성 캐시 클리어 후 재시도
rm -rf node_modules yarn.lock
yarn install
yarn changeset version

# 해결법 2: 수동으로 의존성 업데이트
yarn workspace @your-org/package-name add @your-org/dependency@latest

# 해결법 3: changeset 설정 확인
cat .changeset/config.json | grep updateInternalDependencies
```

#### 4. NPM 게시 권한 문제

```bash
# 문제 진단
npm whoami
npm org ls your-org

# 해결법: NPM 토큰 재설정
npm logout
npm login
# 또는 2FA가 활성화된 경우
npm login --auth-type=legacy
```

#### 5. 대용량 모노레포 성능 최적화

```typescript
// scripts/performance-optimizer.ts
interface PerformanceOptimizer {
  optimizeChangesetGeneration(): void;
  enableIncrementalBuilds(): void;
  configureParallelProcessing(): void;
}

class ChangesetPerformanceOptimizer implements PerformanceOptimizer {
  optimizeChangesetGeneration(): void {
    // .changeset/config.json 최적화
    const config = {
      ___experimentalUnsafeOptions_WILL_CHANGE_IN_PATCH: {
        onlyUpdatePeerDependentsWhenOutOfRange: true,
        useCalculatedVersionForSnapshots: true,
        updateInternalDependents: "out-of-range",
      },
    };

    console.log("⚡ Performance optimizations applied");
  }

  enableIncrementalBuilds(): void {
    // package.json scripts 최적화
    const optimizedScripts = {
      build: "turbo run build --filter=...[HEAD^]",
      test: "turbo run test --filter=...[HEAD^]",
      "changeset:version":
        "changeset version && yarn install --mode=skip-build",
    };

    console.log("🚀 Incremental builds enabled");
  }

  configureParallelProcessing(): void {
    // 병렬 처리 설정
    process.env.FORCE_COLOR = "1";
    process.env.NODE_OPTIONS = "--max-old-space-size=8192";

    console.log("⚡ Parallel processing configured");
  }
}
```

### 디버깅 도구

```typescript
// scripts/changeset-debugger.ts
class ChangesetDebugger {
  generateDiagnosticReport(): void {
    console.log('🔍 Changeset 진단 보고서 생성 중...');

    const report = {
      changesetVersion: this.getChangesetVersion(),
      configValidation: this.validateConfig(),
      packageStatuses: this.getPackageStatuses(),
      dependencyGraph: this.analyzeDependencyGraph(),
      gitStatus: this.getGitStatus(),
      npmRegistry: this.checkNpmRegistry()
    };

    console.log('📊 진단 보고서:', JSON.stringify(report, null, 2));
  }

  private getChangesetVersion(): string {
    try {
      const packageJson = require('fs').readFileSync('node_modules/@changesets/cli/package.json', 'utf8');
      return JSON.parse(packageJson).version;
    } catch {
      return 'Unknown';
    }
  }

  private validateConfig(): boolean {
    try {
      const config = require('fs').readFileSync('.changeset/config.json', 'utf8');
      JSON.parse(config);
      return true;
    } catch {
      return false;
    }
  }

  private getPackageStatuses(): Record<string, any> {
    try {
      const { execSync } = require('child_process');
      const output = execSync('yarn changeset status --output=json', { encoding: 'utf8' });
      return JSON.parse(output);
    } catch (error) {
      return { error: error.message };
    }
  }

  private analyzeDependencyGraph(): Record<string, string[]> {
    // 의존성 그래프 분석 로직
    return {};
  }

  private getGitStatus(): string {
    try {
      const { execSync } = require('child_process');
      return execSync('git status --porcelain', { encoding: 'utf8' });
    } catch {
      return 'Git status unavailable';
    }
  }

  private checkNpmRegistry(): string {
    try {
      const { execSync } = require('child_process');
      return execSync('npm config get registry', { encoding: 'utf8' }).trim();
    } catch {
      return 'Registry check failed';
    }
  }
}

// 사용법
const debugger = new ChangesetDebugger();
debugger.generateDiagnosticReport();
```

---

## 📚 빠른 참조

### 필수 명령어

| 명령어                       | 설명                  | 사용 시점      |
| ---------------------------- | --------------------- | -------------- |
| `yarn changeset`             | 대화형 changeset 생성 | 개발 완료 후   |
| `yarn changeset add --empty` | 빈 changeset 생성     | 빠른 생성 시   |
| `yarn changeset status`      | 현재 상태 확인        | 언제든지       |
| `yarn changeset version`     | 버전 업데이트         | 릴리스 준비 시 |
| `yarn changeset publish`     | 패키지 게시           | 최종 배포 시   |

### 고급 명령어

| 명령어                              | 설명                 | 옵션                  |
| ----------------------------------- | -------------------- | --------------------- |
| `yarn changeset publish --dry-run`  | 게시 시뮬레이션      | `--dry-run`, `--tag`  |
| `yarn changeset version --snapshot` | 스냅샷 버전 생성     | `--snapshot [name]`   |
| `yarn changeset pre enter alpha`    | 프리릴리스 모드 진입 | `alpha`, `beta`, `rc` |
| `yarn changeset pre exit`           | 프리릴리스 모드 종료 | -                     |

### 설정 옵션 참조

```typescript
interface ChangesetConfig {
  // 기본 설정
  changelog: string | [string, object];
  commit: boolean;
  access: "restricted" | "public";
  baseBranch: string;

  // 의존성 관리
  updateInternalDependencies: "patch" | "minor" | "major";
  linked: string[][];
  fixed: string[][];
  ignore: string[];

  // 고급 설정
  ___experimentalUnsafeOptions_WILL_CHANGE_IN_PATCH?: {
    onlyUpdatePeerDependentsWhenOutOfRange?: boolean;
    useCalculatedVersionForSnapshots?: boolean;
    updateInternalDependents?: "out-of-range" | "patch" | "minor" | "major";
  };
}
```

### 문제 해결 체크리스트

```markdown
## 🚨 문제 발생 시 체크리스트

### 1단계: 기본 확인

- [ ] `yarn changeset status` 실행
- [ ] `.changeset/config.json` 파일 존재 확인
- [ ] `node_modules/@changesets/cli` 설치 확인

### 2단계: 권한 확인

- [ ] `npm whoami` 실행
- [ ] NPM 조직 권한 확인
- [ ] GitHub 토큰 권한 확인

### 3단계: 환경 확인

- [ ] Node.js 버전 (>= 16)
- [ ] Yarn 버전 (>= 1.22)
- [ ] Git 상태 확인

### 4단계: 고급 진단

- [ ] 캐시 클리어 (`rm -rf node_modules yarn.lock`)
- [ ] 의존성 재설치 (`yarn install`)
- [ ] 빌드 테스트 (`yarn build`)
```

### 버전 타입 결정 가이드

```typescript
// 실제 예시로 배우는 버전 타입 결정
const versioningExamples = {
  patch: [
    "버그 수정: 컴포넌트가 올바르게 렌더링되지 않는 문제 해결",
    "성능 개선: 렌더링 속도 10% 향상",
    "타입 정의 개선: 더 정확한 TypeScript 타입 제공",
    "의존성 업데이트: 보안 패치가 포함된 라이브러리 업데이트",
  ],

  minor: [
    "새 컴포넌트: DatePicker 컴포넌트 추가",
    "새 props: Button 컴포넌트에 'loading' prop 추가",
    "새 유틸 함수: formatCurrency 함수 추가",
    "기능 확장: 테마 시스템에 다크 모드 지원 추가",
  ],

  major: [
    "API 변경: useTheme 훅의 반환 형식 변경",
    "필수 props 추가: 모든 Form 컴포넌트에 'onSubmit' prop 필수화",
    "컴포넌트 제거: 더이상 사용되지 않는 LegacyButton 제거",
    "최소 지원 버전 변경: React 18+ 요구, React 17 지원 중단",
  ],
};
```

### 베스트 프랙티스 체크리스트

```markdown
## ✅ Changeset 베스트 프랙티스

### 작성 시

- [ ] 명확하고 구체적인 변경사항 설명
- [ ] 적절한 버전 타입 선택
- [ ] Breaking changes 시 마이그레이션 가이드 포함
- [ ] 영향받는 모든 패키지 포함

### 리뷰 시

- [ ] 의존성 업데이트 확인
- [ ] 버전 타입 적절성 검토
- [ ] 설명의 명확성 확인
- [ ] 테스트 커버리지 확인

### 릴리스 시

- [ ] 빌드 테스트 통과 확인
- [ ] E2E 테스트 실행
- [ ] 스테이징 환경에서 검증
- [ ] 릴리스 노트 검토
```

---

## 🎯 마무리

이 가이드를 통해 Changeset을 효과적으로 활용하여 모노레포 환경에서 안전하고 체계적인 버전 관리를 수행할 수 있습니다.

### 다음 단계

1. **기본 설정 완료**: 프로젝트에 Changeset 설치 및 설정
2. **팀 가이드라인 수립**: 팀의 워크플로우에 맞는 컨벤션 정의
3. **자동화 구축**: CI/CD 파이프라인 구축 및 Git Hooks 설정
4. **모니터링 시스템**: 릴리스 품질 모니터링 도구 구축

### 추가 학습 자료

- [Changeset 공식 문서](https://github.com/changesets/changesets)
- [Semantic Versioning 공식 가이드](https://semver.org/)
- [모노레포 관리 베스트 프랙티스](https://monorepo.tools/)
- [NPM 패키지 게시 가이드](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)

---
