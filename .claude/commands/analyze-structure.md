---
description: 프로젝트 구조를 분석하고 .project-structure.yaml 생성
alwaysApply: false
tags: [analysis, structure, yaml, skills]
---

# Analyze Project Structure (Skills 기반)

이 커맨드는 **Claude Skills**를 활용하여 프로젝트를 분석합니다.

## 📋 실행되는 Skills

### 1. project_detector
프로젝트 메타데이터 자동 감지:
- ✅ 패키지 매니저 (yarn/npm/pnpm/bun)
- ✅ 프로젝트 타입 (monorepo/single-package)
- ✅ 기술 스택 (React, NestJS, TypeScript 등)
- ✅ 디렉토리 구조 (packages/, src/, tests/)
- ✅ 주요 명령어 (dev, test, lint, build)
- ✅ 네이밍 컨벤션 (PascalCase, kebab-case 등)

### 2. yaml_generator
YAML 설정 파일 생성:
- ✅ `.project-structure.yaml` 생성
- ✅ JSON Schema 검증
- ✅ 한글 주석 추가
- ✅ 가독성 최적화

## 📊 출력

- `.project-structure.yaml` - 프로젝트 구조 설정 파일
- 분석 보고서 (콘솔)

---

**실행 지시:**

다음 순서로 프로젝트를 분석하고 `.project-structure.yaml` 파일을 생성해주세요:

1. **project_detector 스킬 활성화**
   - 파일 시스템 스캔 (Glob 사용)
   - package.json 파싱
   - `.claude/skills/project_detector/knowledge/tech_stack_patterns.yaml` 참조하여 기술 스택 감지
   - `.claude/skills/project_detector/tools/analyze_naming.sh` 실행하여 네이밍 패턴 분석
   - 구조화된 분석 결과 생성

2. **yaml_generator 스킬 활성화**
   - project_detector 결과 수신
   - `.claude/skills/yaml_generator/knowledge/yaml_schema.json` 스키마 준수
   - YAML 문서 생성 (한글 주석 포함)
   - `.claude/skills/yaml_generator/tools/yaml_validator.ts`로 검증
   - `.project-structure.yaml` 파일 저장

3. **결과 보고**
   - 감지된 프로젝트 타입
   - 사용 중인 기술 스택
   - 주요 명령어 목록
   - 생성된 파일 경로

**참고:** Skills 구조는 `.claude/skills/README.md` 참조
