---
description: Analyze project structure and generate .project-structure.yaml
alwaysApply: false
tags: [analysis, structure, yaml, skills]
---

# Analyze Project Structure (Skills-based)

This command leverages **Claude Skills** to analyze the project.

## 📋 Skills Execution

### 1. project_detector
Automatic project metadata detection:
- ✅ Package manager (yarn/npm/pnpm/bun)
- ✅ Project type (monorepo/single-package)
- ✅ Technology stack (React, NestJS, TypeScript, etc.)
- ✅ Directory structure (packages/, src/, tests/)
- ✅ Key commands (dev, test, lint, build)
- ✅ Naming conventions (PascalCase, kebab-case, etc.)

### 2. yaml_generator
YAML configuration file generation:
- ✅ Generate `.project-structure.yaml`
- ✅ JSON Schema validation
- ✅ Add Korean comments
- ✅ Optimize readability

## 📊 Output

- `.project-structure.yaml` - Project structure configuration file
- Analysis report (console)

---

## 🚀 Advanced Features

### 1. Incremental Update Support
- **기존 파일 감지**: `.project-structure.yaml`이 이미 존재하면 증분 업데이트
- **변경사항만 반영**: 새로 추가된 패키지/스크립트만 업데이트
- **전체 재생성 옵션**: `--force` 플래그로 전체 재생성 가능

### 2. Validation Result Display
- **실시간 검증**: YAML 생성 후 즉시 스키마 검증
- **오류 상세 표시**: JSON Schema 오류 발생 시 라인 번호와 수정 방법 제시
- **검증 통과 확인**: ✅ 마크로 검증 성공 표시

### 3. Multi-language Comment Support
- **기본**: 한국어 주석 (Korean comments)
- **영어 옵션**: `--lang en` 플래그로 영어 주석 생성
- **주석 없음**: `--no-comments` 플래그로 순수 YAML만 생성

---

**Execution Instructions:**

Please analyze the project and generate `.project-structure.yaml` file in the following order:

**Step 0: Check Existing File** (Incremental Update)
```bash
if [ -f ".project-structure.yaml" ]; then
  echo "⚠️ Existing file found. Backing up to .project-structure.yaml.backup"
  cp .project-structure.yaml .project-structure.yaml.backup
  echo "💡 Incremental update mode: Only new packages/scripts will be added"
else
  echo "✅ No existing file. Creating new .project-structure.yaml"
fi
```

**Step 1: Activate project_detector skill**
   - Scan file system (using Glob)
   - Parse package.json
   - Detect tech stack by referencing `.claude/skills/project_detector/knowledge/tech_stack_patterns.yaml`
   - Analyze naming patterns by executing `.claude/skills/project_detector/tools/analyze_naming.sh`
   - Generate structured analysis results

**Step 2: Activate yaml_generator skill**
   - Receive project_detector results
   - Follow `.claude/skills/yaml_generator/knowledge/yaml_schema.json` schema
   - Generate YAML document (with Korean comments by default)
   - **Language option**: Check for `--lang en` flag for English comments
   - **No comments option**: Check for `--no-comments` flag
   - Validate using `.claude/skills/yaml_generator/tools/yaml_validator.ts`
   - **Display validation results**:
     ```
     🔍 Validating YAML against schema...
     ✅ Validation passed (0 errors, 0 warnings)
     ```
   - Save `.project-structure.yaml` file

**Step 3: Report Results** (Enhanced Display)
   ```
   ✅ Project analysis complete!

   📊 Detected Configuration:
   - Project type: monorepo
   - Package manager: yarn
   - Technology stack: TypeScript, React, NestJS
   - Packages: 12
   - Naming convention: kebab-case (directories), PascalCase (components)

   📁 Generated file: .project-structure.yaml
   🔍 Validation: ✅ Passed (JSON Schema compliant)
   📝 Comments: Korean (use --lang en for English)

   💡 Next steps:
   - Review: cat .project-structure.yaml
   - Update: /analyze-structure (incremental update)
   - Force regenerate: /analyze-structure --force
   ```

**Reference:** See `.claude/skills/README.md` for Skills structure

---

## 📖 사용 예시

### 기본 사용법
```
/analyze-structure
```

### 실제 시나리오

#### 시나리오 1: 새 프로젝트 초기 분석
```
상황: 새로운 monorepo 프로젝트를 분석하여 구조 파악
명령: /analyze-structure
결과:
  - .project-structure.yaml 생성
  - 프로젝트 타입: monorepo
  - 패키지 매니저: yarn
  - 기술 스택: TypeScript, React
```

#### 시나리오 2: 기존 프로젝트 구조 업데이트
```
상황: 새 패키지 추가 후 프로젝트 구조 파일 갱신
명령: /analyze-structure
결과:
  - 기존 .project-structure.yaml 백업
  - 새 패키지 정보 포함된 파일 생성
  - 네이밍 패턴 재분석
```

#### 시나리오 3: CI/CD 파이프라인 설정 정보 확인
```
상황: CI/CD 설정을 위해 프로젝트 명령어 목록 필요
명령: /analyze-structure
결과:
  - key commands 자동 감지 (build, test, lint)
  - 스크립트 목록 확인
  - 환경 설정 파일 위치 파악
```

### 고급 기능 사용 예시

#### 예시 1: 영어 주석으로 생성
```
명령: /analyze-structure --lang en
결과:
  - Generate .project-structure.yaml with English comments
  - Suitable for international teams
```

#### 예시 2: 주석 없는 순수 YAML
```
명령: /analyze-structure --no-comments
결과:
  - Pure YAML without any comments
  - Minimal file size for CI/CD environments
```

#### 예시 3: 기존 파일 강제 재생성
```
명령: /analyze-structure --force
결과:
  - Skip incremental update
  - Completely regenerate .project-structure.yaml
  - Useful after major project restructuring
```

## 💡 팁
- **정기적 실행**: 프로젝트 구조 변경 시마다 실행하여 최신 상태 유지
- **백업 확인**: 기존 `.project-structure.yaml`이 있으면 자동 백업되므로 안전
- **검증 활용**: `yaml_validator.ts`로 생성된 파일의 스키마 유효성 확인 가능
- **한글 주석**: 생성된 YAML 파일에는 한글 주석이 포함되어 이해하기 쉬움
- **증분 업데이트**: 기존 파일이 있으면 자동으로 변경사항만 반영 (--force로 전체 재생성)

---

## ⚠️ 문제 해결 (Troubleshooting)

### 스킬을 찾을 수 없는 경우
**문제**: `.claude/skills/project_detector/` 또는 `.claude/skills/yaml_generator/` 디렉토리가 없음

**Fallback 동작**:
1. ⚠️ 경고 메시지 표시: "스킬이 없어 기본 분석 방식을 사용합니다"
2. 네이티브 방식으로 진행:
   - Glob으로 프로젝트 파일 스캔
   - package.json 직접 읽기
   - 수동으로 YAML 생성
3. 결과 품질: 스킬 사용 시보다 낮을 수 있음 (자동 검증 없음)

**해결 방법**:
```bash
# 스킬 디렉토리 확인
ls -la .claude/skills/project_detector/
ls -la .claude/skills/yaml_generator/

# 스킬 누락 시 저장소에서 복원
git checkout .claude/skills/
```

### 스크립트 실행 실패 시
**문제**: `analyze_naming.sh` 또는 `yaml_validator.ts` 실행 실패

**Fallback 동작**:
1. ⚠️ 에러 메시지와 함께 진행:
   - `analyze_naming.sh` 실패 → 네이밍 패턴 분석 생략
   - `yaml_validator.ts` 실패 → 검증 없이 YAML 저장
2. 수동 검증 안내 제공

**해결 방법**:
```bash
# 스크립트 실행 권한 확인
chmod +x .claude/skills/project_detector/tools/analyze_naming.sh
chmod +x .claude/skills/yaml_generator/tools/yaml_validator.ts

# 수동 실행하여 오류 확인
.claude/skills/project_detector/tools/analyze_naming.sh
npx tsx .claude/skills/yaml_generator/tools/yaml_validator.ts
```

### 외부 도구 미설치 시
**문제**: `tsx` (TypeScript 실행 도구) 미설치

**Fallback 동작**:
1. ⚠️ 검증 단계 생략 경고
2. YAML 파일 생성은 진행
3. 수동 검증 권장 안내

**해결 방법**:
```bash
# macOS/Linux
npm install -g tsx

# 프로젝트 로컬 설치
npm install --save-dev tsx

# 검증 (선택적)
npx tsx .claude/skills/yaml_generator/tools/yaml_validator.ts .project-structure.yaml
```

### 생성 파일 충돌
**문제**: `.project-structure.yaml` 파일이 이미 존재

**Fallback 동작**:
1. 기존 파일 백업: `.project-structure.yaml.backup`
2. 새 파일 생성
3. 사용자에게 알림

**해결 방법**:
```bash
# 기존 파일과 비교
diff .project-structure.yaml .project-structure.yaml.backup

# 필요시 복원
mv .project-structure.yaml.backup .project-structure.yaml
```

---

## ✅ 성공 시 출력

```
✅ 프로젝트 구조 분석 완료!

📊 분석 결과:
- 프로젝트 타입: monorepo
- 패키지 매니저: yarn
- 기술 스택: TypeScript, React, NestJS
- 패키지 수: 12개
- 네이밍 규칙: kebab-case (디렉토리), PascalCase (컴포넌트)

📁 생성된 파일:
- .project-structure.yaml (검증 완료)
- .project-structure.yaml.backup (기존 파일 백업)

⏱️ 실행 시간: 5초
```

## ❌ 실패 시 출력

```
❌ 프로젝트 구조 분석 실패

🔍 원인:
- YAML 검증 오류: Invalid schema at line 15
- 또는: 스킬 디렉토리 누락 (.claude/skills/project_detector/)

💡 해결 방법:
1. 스킬 복원:
   git checkout .claude/skills/

2. tsx 설치 (검증 도구):
   npm install -g tsx

3. 수동 검증:
   npx tsx .claude/skills/yaml_generator/tools/yaml_validator.ts .project-structure.yaml

📚 추가 도움말: /analyze-structure --help 또는 문제 해결 섹션 참조
```
