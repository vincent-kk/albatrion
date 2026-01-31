# @canard/schema-form Q&A Command

`/schema-form` 커맨드를 통해 @canard/schema-form에 대해 질문하고 답변을 받을 수 있습니다.

## 사용법 (Usage)

```
/schema-form [질문 또는 주제]
```

## 예시 (Examples)

```
/schema-form FormTypeInput 우선순위가 어떻게 되나요?
/schema-form computed 속성에서 상대 경로 사용법
/schema-form oneOf와 anyOf의 차이점
/schema-form 파일 업로드 구현 방법
/schema-form 커스텀 검증 키워드 추가하는 방법
```

## 지원 주제 (Supported Topics)

### 기본 개념 (Basic Concepts)
- 설치 및 설정
- Form 컴포넌트 사용법
- FormHandle API
- 기본 예제

### 노드 시스템 (Node System)
- 노드 타입 (StringNode, NumberNode, ObjectNode, ArrayNode 등)
- 노드 속성 및 메서드
- Strategy Pattern (BranchStrategy, TerminalStrategy)
- 이벤트 시스템

### FormTypeInput
- FormTypeInputDefinition 작성
- test 조건 (객체, 함수)
- FormTypeInputMap (경로 기반 매핑)
- 우선순위 규칙
- 커스텀 입력 컴포넌트 작성

### 검증 (Validation)
- 검증 플러그인 (AJV 6/7/8)
- ValidationMode
- 에러 메시지 커스터마이징
- 다국어 지원
- 커스텀 검증 키워드/포맷

### Computed Properties
- watch, active, visible, readOnly, disabled
- derived (파생 값)
- 경로 참조 (상대, 절대)
- 컨텍스트 참조 (@)

### 조건부 스키마 (Conditional Schema)
- oneOf, anyOf, allOf
- if-then-else
- 조건부 필수 필드

### 고급 기능 (Advanced Features)
- injectTo (값 주입)
- 파일 첨부 관리
- 배열 조작 (push, remove, clear)
- prefixItems (튜플)

### JSONPointer
- 표준 RFC 6901 문법
- 확장 문법 (.., ., *, @)
- 이스케이프 규칙

### 플러그인 시스템
- 플러그인 등록
- 커스텀 플러그인 작성
- ValidatorPlugin
- FormatError

### 트러블슈팅
- 자주 묻는 질문
- 일반적인 문제 해결
- 성능 최적화
- 디버깅 팁

## 관련 문서 (Related Documents)

이 커맨드는 다음 스킬 문서를 참조합니다:

- `docs/claude/skills/schema-form-expert.md` - 메인 전문가 스킬
- `docs/claude/skills/computed-properties.md` - Computed Properties
- `docs/claude/skills/conditional-schema.md` - 조건부 스키마
- `docs/claude/skills/formtype-input.md` - FormTypeInput 시스템
- `docs/claude/skills/validation.md` - 검증 시스템
- `docs/claude/skills/inject-to.md` - InjectTo 기능
- `docs/claude/skills/array-operations.md` - 배열 조작
- `docs/claude/skills/form-handle.md` - FormHandle API
- `docs/claude/skills/jsonpointer.md` - JSONPointer 시스템
- `docs/claude/skills/plugin-system.md` - 플러그인 시스템
- `docs/claude/skills/form-render.md` - 커스텀 레이아웃
- `docs/claude/skills/virtual-schema.md` - Virtual Schema
- `docs/claude/skills/state-management.md` - 상태 관리
- `docs/claude/skills/context-usage.md` - Context 사용

## 구현 가이드 (Implementation Guide)

이 커맨드를 Claude Code에서 사용하려면:

1. `.claude/commands/schema-form.md` 파일로 복사
2. 또는 프로젝트의 `.claude/` 디렉토리에 배치

```bash
# 프로젝트 루트에서
mkdir -p .claude/commands
cp docs/claude/commands/schema-form.md .claude/commands/
```
