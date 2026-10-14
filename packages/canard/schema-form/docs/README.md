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
├── agents/                    # 에이전트 자산 원본 (@slats/agents-assets-sync가 주입)
│   ├── rules/
│   │   └── schema-form-rule.md  # 소비자 규칙
│   └── skills/
│       └── schema-form-skill/   # 스킬 디렉토리
│           ├── SKILL.md         # 스킬 정의
│           └── knowledge/       # 지식 베이스
├── QUICK_REFERENCE.md         # 빠른 참조
└── README.md                  # 이 파일
```

---

## 스펙 문서 (Specification Documents)

| 언어    | 파일                                         | 내용                                   |
| ------- | -------------------------------------------- | -------------------------------------- |
| 한국어  | [ko/SPECIFICATION.md](./ko/SPECIFICATION.md) | 전체 API, 아키텍처, 사용 예제          |
| English | [en/SPECIFICATION.md](./en/SPECIFICATION.md) | Full API, architecture, usage examples |

### 주요 내용 (Contents)

- **아키텍처**: 노드 시스템, FieldInput 시스템
- **핵심 API**: FormProps, FormHandle
- **고급 기능**: Controls(조건·파생 속성), 조건부 스키마, JSONPointer
- **검증 시스템**: ValidationMode, 오류 메시지 포맷팅
- **플러그인 시스템**: Validator 플러그인, UI 플러그인

---

## Claude Code 통합 (Claude Code Integration)

이 패키지를 사용하는 프로젝트에서 Claude Code를 활용하여 schema-form에 대한 질문과 답변을 받을 수 있습니다.

### 설치 방법

`@slats/agents-assets-sync`의 `inject-agents-settings`가 `docs/agents/**`를 고른 에이전트 위치에 주입합니다. `--agent=claude`는 `.claude/{skills,rules}`에, `codex`는 project 범위에서 `.agents/skills`와 `AGENTS.md` 마커 블록에, user 범위에서 `~/.codex/skills`와 `~/.codex/AGENTS.md`에 씁니다.

```bash
# 사용자 범위에 Claude Code용으로 주입
npx -p @slats/agents-assets-sync inject-agents-settings --package=@canard/schema-form --agent=claude --scope=user

# 무엇이 바뀌는지 먼저 확인
npx -p @slats/agents-assets-sync inject-agents-settings --package=@canard/schema-form --agent=claude --scope=user --dry-run
```

### 사용 방법

스킬은 질문이 FieldInput, controls, 조건부 스키마, JSONPointer, FormHandle 등을 다룰 때 불러와지며, `/schema-form-skill`로 직접 부를 수도 있습니다.

```
/schema-form-skill FieldInput 우선순위가 어떻게 되나요?
/schema-form-skill controls.derived에서 형제 필드 참조하는 방법
/schema-form-skill oneOf에서 값 필터링 동작
```

### 파일 설명

- **agents/rules/schema-form-rule.md**: 이 패키지를 쓰는 코드에 적용할 소비자 규칙
- **agents/skills/schema-form-skill/**: schema-form 스킬 (지식 베이스, 응답 가이드라인)

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
