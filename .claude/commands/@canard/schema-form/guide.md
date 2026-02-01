# @canard/schema-form Q&A Command

**Package**: `@canard/schema-form`
**Skill Scope**: `@canard:schema-form`

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

## 지식 소스 (Knowledge Sources)

더 상세한 정보가 필요한 경우, 다음 관련 skill에서 심화 지식을 확인할 수 있습니다:

| 주제 | Skill 이름 |
|------|-----------|
| 종합 가이드 | `schema-form-expert` |
| Computed Properties | `computed-properties` |
| 조건부 스키마 | `conditional-schema` |
| FormTypeInput | `formtype-input` |
| 검증 시스템 | `validation` |
| InjectTo | `inject-to` |
| 배열 조작 | `array-operations` |
| FormHandle | `form-handle` |
| JSONPointer | `jsonpointer` |
| 플러그인 | `plugin-system` |
| 커스텀 레이아웃 | `form-render` |
| Virtual Schema | `virtual-schema` |
| 상태 관리 | `state-management` |
| Context | `context-usage` |
| 성능 최적화 | `performance-optimization` |
| 문제 해결 | `troubleshooting` |
| 테스트 가이드 | `testing-guide` |

SPECIFICATION 문서에서 전체 API 스펙을 확인할 수 있습니다.
