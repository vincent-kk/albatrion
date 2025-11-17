# EARS 패턴 상세 가이드

## 개요

EARS (Easy Approach to Requirements Syntax)는 요구사항을 5가지 표준 패턴으로 작성하여 명확성과 검증 가능성을 보장하는 방법론입니다.

## 5가지 EARS 패턴

### 1. Ubiquitous Requirements (상시 요구사항)

**형식**: `The <system> shall <requirement>`

**사용 시점**:
- 항상 적용되는 기본 기능
- 시스템의 핵심 동작
- 특별한 조건이나 트리거가 없는 기능

**특징**:
- 가장 단순한 형식
- 전제 조건이나 트리거 없음
- 시스템의 기본 속성이나 기능

**예시**:
```
✅ Good:
- The time selection system shall display all available time slots in chronological order
- The login form shall require email and password fields
- The navigation menu shall contain links to all main sections

❌ Bad (조건이 포함됨):
- The system shall display slots when loaded
- The form shall validate if submitted
```

**작성 가이드**:
- 조건부 표현 사용 금지 (when, if, while 등)
- 명확한 동사 사용 (display, require, contain, provide)
- 측정 가능한 기준 포함

### 2. Event-Driven Requirements (이벤트 기반 요구사항)

**형식**: `WHEN <trigger> the <system> shall <requirement>`

**사용 시점**:
- 사용자 액션에 반응하는 기능
- 외부 이벤트에 따른 동작
- 특정 트리거에 의해 발생하는 기능

**특징**:
- 명확한 트리거 정의
- 트리거와 응답 간 인과관계 명확
- 대부분의 UI 인터랙션

**예시**:
```
✅ Good:
- WHEN a user clicks on a time slot THEN the system shall toggle the selection state
- WHEN a user submits the login form THEN the system shall validate credentials
- WHEN a user drags across time slots THEN the system shall select all slots in the drag path

❌ Bad (트리거 불명확):
- The system shall toggle selection
- The form shall validate credentials
```

**작성 가이드**:
- 트리거는 구체적이고 관찰 가능해야 함
- 하나의 트리거는 하나의 응답만 기술
- 트리거와 응답 간 시간 관계 명확 (THEN 사용)

**트리거 유형**:
- **사용자 액션**: click, drag, type, submit, select
- **시스템 이벤트**: load, timeout, complete, fail
- **외부 이벤트**: message received, data updated, connection lost

### 3. Unwanted Behavior Requirements (예외 처리 요구사항)

**형식**: `IF <condition> THEN the <system> shall <requirement>`

**사용 시점**:
- 에러 처리 및 예외 상황
- 검증 실패 시 동작
- 비정상 상태 처리

**특징**:
- 조건부 로직 (IF-THEN)
- 주로 방어적 프로그래밍
- 시스템 견고성 확보

**예시**:
```
✅ Good:
- IF no time slots are selected THEN the system shall disable the save button
- IF login credentials are invalid THEN the system shall display an error message
- IF the network connection is lost THEN the system shall display a reconnection prompt

❌ Bad (조건 불명확):
- The system shall handle errors
- The form shall validate input
```

**작성 가이드**:
- 조건은 boolean 평가 가능해야 함
- 응답은 구체적인 액션이어야 함
- 에러 메시지는 명확하고 실행 가능한 가이드 제공

**조건 유형**:
- **검증 실패**: invalid input, missing data, format error
- **상태 확인**: empty state, offline, unauthorized
- **경계 조건**: maximum exceeded, minimum not met, timeout

### 4. State-Driven Requirements (상태 기반 요구사항)

**형식**: `WHILE <state> the <system> shall <requirement>`

**사용 시점**:
- 특정 상태에서만 유효한 동작
- 지속적인 상태 의존 기능
- 모드 기반 동작

**특징**:
- 상태의 지속 기간 동안 유효
- 상태 전환 시 동작 변경
- 시스템 모드 정의

**예시**:
```
✅ Good:
- WHILE time slots are being loaded THEN the system shall display a loading indicator
- WHILE in edit mode THEN the system shall allow modification of selected slots
- WHILE offline THEN the system shall queue user actions for later synchronization

❌ Bad (상태 불명확):
- The system shall show loading
- The form shall allow editing
```

**작성 가이드**:
- 상태는 명확히 정의되고 관찰 가능해야 함
- 상태 진입/종료 조건 명확
- 상태 간 전환 로직 명시

**상태 유형**:
- **시스템 상태**: loading, saving, processing, idle
- **사용자 상태**: logged in, editing, viewing, selecting
- **연결 상태**: online, offline, syncing

### 5. Optional Requirements (선택적 요구사항)

**형식**: `WHERE <feature> the <system> shall <requirement>`

**사용 시점**:
- 선택적 기능이나 모드
- 설정 가능한 옵션
- 조건부 활성화 기능

**특징**:
- 기능의 존재 여부가 선택적
- 사용자 설정이나 환경에 따라 활성화
- 시스템의 확장성 정의

**예시**:
```
✅ Good:
- WHERE keyboard navigation is enabled the system shall allow arrow key navigation
- WHERE accessibility mode is enabled the system shall announce slot selection to screen readers
- WHERE advanced features are activated the system shall provide bulk selection tools

❌ Bad (선택성 불명확):
- The system shall support keyboard navigation
- The form shall be accessible
```

**작성 가이드**:
- 기능 활성화 조건 명확히 명시
- 기본 기능과 선택적 기능 구분
- 선택적 기능 간 의존성 명시

**선택적 기능 유형**:
- **접근성 기능**: screen reader support, keyboard navigation, high contrast
- **고급 기능**: bulk operations, advanced filters, custom views
- **환경 설정**: dark mode, language preference, notification settings

## 패턴 선택 가이드

### 결정 트리

```
요구사항 분석
│
├─ 항상 적용되는가?
│  └─ Yes → Ubiquitous
│
├─ 특정 이벤트에 반응하는가?
│  └─ Yes → Event-Driven
│
├─ 예외 상황을 처리하는가?
│  └─ Yes → Unwanted
│
├─ 특정 상태에서만 유효한가?
│  └─ Yes → State-Driven
│
└─ 선택적으로 활성화되는가?
   └─ Yes → Optional
```

### 패턴별 키워드

| 패턴 | 키워드 | 금지 키워드 |
|------|--------|------------|
| Ubiquitous | shall, must, will | when, if, while, where |
| Event-Driven | WHEN, THEN, upon, on | - |
| Unwanted | IF, THEN, in case of | - |
| State-Driven | WHILE, during, in | - |
| Optional | WHERE, if enabled, when activated | - |

## 복합 패턴

### Event + Unwanted
```
WHEN a user clicks save
  IF no slots are selected THEN the system shall display an error
  IF slots are selected THEN the system shall save the selection
```

### State + Event
```
WHILE in selection mode
  WHEN a user clicks a slot THEN the system shall toggle selection
  WHEN a user presses Escape THEN the system shall exit selection mode
```

### Optional + Event
```
WHERE keyboard navigation is enabled
  WHEN a user presses Tab THEN the system shall move focus to the next slot
  WHEN a user presses Enter THEN the system shall toggle the focused slot
```

## 패턴별 검증 기준

### Ubiquitous 검증
- [ ] 조건부 키워드 없음 (when, if, while, where)
- [ ] 명확한 동사 사용
- [ ] 측정 가능한 기준 포함
- [ ] 시스템 범위 명확

### Event-Driven 검증
- [ ] WHEN 키워드 사용
- [ ] 트리거 명확히 정의
- [ ] 응답 구체적으로 기술
- [ ] 하나의 트리거 = 하나의 응답

### Unwanted 검증
- [ ] IF-THEN 구조 사용
- [ ] 조건이 boolean 평가 가능
- [ ] 에러 처리 명확
- [ ] 사용자 피드백 포함

### State-Driven 검증
- [ ] WHILE 키워드 사용
- [ ] 상태 명확히 정의
- [ ] 상태 지속 기간 명확
- [ ] 상태 전환 조건 명시

### Optional 검증
- [ ] WHERE 키워드 사용
- [ ] 활성화 조건 명확
- [ ] 기본 기능과 구분
- [ ] 선택성 명확히 표현

## 실전 예시

### 시간대 선택 시스템 (종합)

**Ubiquitous**:
```
REQ-F-001: The time selection system shall display all available time slots in chronological order
REQ-F-002: The time selection system shall allow users to select multiple time slots simultaneously
REQ-F-003: The time selection system shall persist selected slots across page refreshes
```

**Event-Driven**:
```
REQ-F-010: WHEN a user clicks on a time slot THEN the system shall toggle the selection state
REQ-F-011: WHEN a user drags across time slots THEN the system shall select all slots in the drag path
REQ-F-012: WHEN a user clicks the save button THEN the system shall persist the current selection
```

**Unwanted**:
```
REQ-F-020: IF no time slots are selected THEN the system shall disable the save button
REQ-F-021: IF the user attempts to select more than 50 slots THEN the system shall display a warning
REQ-F-022: IF saving fails due to network error THEN the system shall retry up to 3 times
```

**State-Driven**:
```
REQ-F-030: WHILE time slots are being loaded THEN the system shall display a loading indicator
REQ-F-031: WHILE in selection mode THEN the system shall highlight selected slots with blue color
REQ-F-032: WHILE saving is in progress THEN the system shall disable all user interactions
```

**Optional**:
```
REQ-F-040: WHERE keyboard navigation is enabled the system shall allow arrow key navigation
REQ-F-041: WHERE accessibility mode is enabled the system shall announce selection changes
REQ-F-042: WHERE advanced mode is activated the system shall provide bulk selection tools
```

## 안티패턴 (피해야 할 것들)

### 1. 모호한 표현
```
❌ Bad: "The system shall provide adequate performance"
✅ Good: "The system shall render 100 time slots in less than 500ms"
```

### 2. 복합 요구사항
```
❌ Bad: "The system shall validate input AND display errors AND log failures"
✅ Good:
- REQ-F-001: IF input is invalid THEN the system shall display an error message
- REQ-F-002: IF input validation fails THEN the system shall log the failure
```

### 3. 잘못된 패턴 사용
```
❌ Bad: "The system shall display loading when data is being fetched"
✅ Good: "WHILE data is being fetched the system shall display a loading indicator"
```

### 4. 비측정 가능 기준
```
❌ Bad: "The system shall be fast"
✅ Good: "The system shall respond to user input within 100ms"
```

## 품질 기준

좋은 EARS 요구사항의 특징:
- **명확성**: 한 가지 해석만 가능
- **완전성**: 전제조건, 동작, 후속조건 포함
- **일관성**: 용어 통일, 형식 준수
- **검증 가능성**: 테스트 가능, 측정 가능
- **추적 가능성**: 고유 ID, 상호 참조

---

> **핵심 원칙**: 모든 요구사항은 EARS 5가지 패턴 중 하나로 명확히 분류되어야 함
> **측정 기준**: 제3자가 읽고 동일하게 이해할 수 있어야 함
