# @canard/schema-form Documentation

이 디렉토리는 `@canard/schema-form` 라이브러리의 스펙 문서와 Claude Code 통합 파일을 포함합니다.

---

## 디렉토리 구조 (Directory Structure)

```
docs/
├── ko/
│   └── SPECIFICATION.md       # 한국어 스펙 문서
├── en/
│   └── SPECIFICATION.md       # 영어 스펙 문서
├── claude/
│   ├── commands/
│   │   └── schema-form.md     # /schema-form 커맨드
│   └── skills/
│       └── schema-form-expert/  # 전문가 스킬 디렉토리
│           ├── SKILL.md         # 스킬 정의
│           └── knowledge/       # 지식 베이스
└── README.md                  # 이 파일
```

---

## 스펙 문서 (Specification Documents)

| 언어 | 파일 | 내용 |
|------|------|------|
| 한국어 | [ko/SPECIFICATION.md](./ko/SPECIFICATION.md) | 전체 API, 아키텍처, 사용 예제 |
| English | [en/SPECIFICATION.md](./en/SPECIFICATION.md) | Full API, architecture, usage examples |

### 주요 내용 (Contents)

- **아키텍처**: 노드 시스템, FormTypeInput 시스템
- **핵심 API**: FormProps, FormHandle
- **고급 기능**: Computed Properties, 조건부 스키마, JSONPointer
- **검증 시스템**: ValidationMode, 오류 메시지 포맷팅
- **플러그인 시스템**: Validator 플러그인, UI 플러그인

---

## Claude Code 통합 (Claude Code Integration)

이 패키지를 사용하는 프로젝트에서 Claude Code를 활용하여 schema-form에 대한 질문과 답변을 받을 수 있습니다.

### 설치 방법

```bash
# 프로젝트 루트에서
mkdir -p .claude/commands .claude/skills

# 커맨드 복사
cp node_modules/@canard/schema-form/docs/claude/commands/schema-form.md .claude/commands/

# 스킬 복사
cp -r node_modules/@canard/schema-form/docs/claude/skills/schema-form-expert .claude/skills/
```

### 사용 방법

Claude Code에서 `/schema-form` 커맨드를 사용합니다:

```
/schema-form FormTypeInput 우선순위가 어떻게 되나요?
/schema-form computed에서 형제 필드 참조하는 방법
/schema-form oneOf에서 값 필터링 동작
```

### 파일 설명

- **commands/schema-form.md**: `/schema-form` 커맨드 정의
- **skills/schema-form-expert.md**: schema-form 전문가 스킬 (지식 베이스, 응답 가이드라인)

---

## 관련 리소스 (Related Resources)

### 메인 문서

- [README.md](../README.md) - 전체 패키지 문서 (영문)
- [CLAUDE.md](../CLAUDE.md) - Claude Code 개발 가이드

### Storybook

```bash
# Storybook 실행
yarn storybook
```

### 테스트

```bash
# 테스트 실행
yarn test

# 특정 테스트 실행
yarn test src/core/__tests__/
```

---

## 문서 언어 (Document Language)

- **메인 설명**: 한국어
- **코드 및 주석**: 영어
- **API 참조**: 영어

---

## 라이선스 (License)

MIT License - 자세한 내용은 [LICENSE](../LICENSE) 파일을 참조하세요.
