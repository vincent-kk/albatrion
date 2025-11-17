# 작업 분해 가이드

## 개요

기술 설계를 실행 가능한 개발 작업 단위로 분해하는 체계적 방법론입니다.

## 작업 분해 원칙

### 1. 작업 크기 (Granularity)

**목표**: 각 작업은 1-4시간 내 완료 가능

**크기 판단 기준**:
```yaml
too_small:  # < 1시간
  - "타입에 필드 하나 추가"
  - "상수 값 하나 변경"
  → 해결: 관련 작업과 병합

optimal:  # 1-4시간
  - "TimeSlot 타입 인터페이스 정의"
  - "TimeSlotItem 컴포넌트 구현"
  - "클릭 선택 이벤트 핸들러 작성"

too_large:  # > 4시간
  - "전체 시간대 선택 시스템 구현"
  - "모든 UI 컴포넌트 개발"
  → 해결: 더 작은 작업으로 분해
```

### 2. 작업 독립성 (Independence)

**목표**: 각 작업은 명확한 범위와 완료 기준 보유

**독립성 체크**:
- [ ] 하나의 파일 또는 긴밀히 연결된 파일 그룹
- [ ] 명확한 시작점과 끝점
- [ ] 검증 가능한 완료 기준
- [ ] 다른 작업의 중간 결과에 의존하지 않음 (의존성 명시 제외)

**예시**:
```
✅ Good:
작업 1.1: src/types/timeSlot.ts에 TimeSlot 인터페이스 정의
  - 시작: 파일 생성
  - 끝: export interface TimeSlot 완성
  - 검증: TypeScript 컴파일 통과

❌ Bad:
작업 X: 시간대 관련 타입들 작성
  - 범위 불명확 (어떤 타입들?)
  - 완료 기준 모호
```

### 3. 의존성 관리 (Dependency)

**목표**: 작업 간 의존성 명확히 하고 병렬화 기회 식별

**의존성 유형**:
```yaml
sequential:  # 순차 실행 필수
  - type_definition → state_management → component
  - component → test
  - api_interface → api_implementation

parallel:  # 병렬 실행 가능
  - multiple_components (각 컴포넌트 독립)
  - api_endpoints (각 엔드포인트 독립)
  - unit_tests (각 테스트 파일 독립)

conditional:  # 조건부 의존
  - keyboard_navigation (optional 기능이므로 나중에도 가능)
  - performance_optimization (MVP 후 추가 가능)
```

## 설계 → 작업 매핑 전략

### 데이터 모델 설계 → 타입 정의 작업

**설계 입력**:
```typescript
interface TimeSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  available: boolean;
}

type SelectionMode = 'idle' | 'selecting' | 'dragging';
```

**작업 분해**:
```markdown
### 1.1 TimeSlot 타입 정의
- **파일**: src/types/timeSlot.ts
- **내용**: TimeSlot 인터페이스 및 관련 타입 정의
- **방법**:
  1. src/types 디렉토리 생성 (없으면)
  2. TimeSlot 인터페이스 정의
  3. SelectionMode 타입 정의
  4. 타입 export
- **완료**: [ ]
- **Requirements**: REQ-F-001, REQ-F-031
- **예상 시간**: 1시간
- **의존성**: 없음 (독립 작업)
```

### 상태 관리 설계 → Atoms 구현 작업

**설계 입력**:
```typescript
const timeSlotsAtom = atom<TimeSlot[]>([]);
const selectedSlotsAtom = atom<string[]>([]);
const canSaveAtom = atom(get => { ... });
```

**작업 분해**:
```markdown
### 1.2 기본 상태 Atoms 정의
- **파일**: src/atoms/timeSlotAtoms.ts
- **내용**: primitive atoms (timeSlots, selectedSlots, isLoading)
- **방법**:
  1. Jotai import
  2. primitive atoms 정의
  3. atoms export
- **완료**: [ ]
- **Requirements**: REQ-F-001, REQ-F-002, REQ-F-030
- **예상 시간**: 1.5시간
- **의존성**: 1.1 (TimeSlot 타입 필요)

### 1.3 파생 상태 Atoms 정의
- **파일**: src/atoms/timeSlotAtoms.ts (위와 동일 파일)
- **내용**: derived atoms (canSave, selectedCount, selectedTimeSlots)
- **방법**:
  1. atom(get => ...) 패턴으로 파생 상태 정의
  2. atoms export
- **완료**: [ ]
- **Requirements**: REQ-F-020
- **예상 시간**: 1시간
- **의존성**: 1.2 (primitive atoms 필요)

### 1.4 액션 Atoms 정의
- **파일**: src/atoms/timeSlotAtoms.ts (위와 동일 파일)
- **내용**: write-only atoms (toggleSlot, selectRange, clearSelection)
- **방법**:
  1. atom(null, (get, set, ...)) 패턴으로 액션 정의
  2. atoms export
- **완료**: [ ]
- **Requirements**: REQ-F-010, REQ-F-011
- **예상 시간**: 2시간
- **의존성**: 1.2 (primitive atoms 필요)
```

### 컴포넌트 설계 → 컴포넌트 개발 작업

**설계 입력**:
```
TimeSlotSelector/
├─ TimeSlotGrid/
│  ├─ TimeSlotItem/
│  └─ DragOverlay/
└─ SaveButton/
```

**작업 분해 전략**:

**Bottom-Up (Leaf 컴포넌트부터)**:
```markdown
### 2.1 TimeSlotItem 컴포넌트 (Leaf)
- **파일**: src/components/TimeSlotItem.tsx
- **내용**: 개별 시간대 표시 및 선택 컴포넌트
- **방법**:
  1. Props 인터페이스 정의
  2. 클릭 이벤트 핸들러
  3. 선택 상태 시각적 표시
  4. React.memo 최적화
- **완료**: [ ]
- **Requirements**: REQ-F-001, REQ-F-010
- **예상 시간**: 3시간
- **의존성**: 1.1 (TimeSlot 타입), 1.4 (toggleSlot action)

### 2.2 SaveButton 컴포넌트 (Leaf)
- **파일**: src/components/SaveButton.tsx
- **내용**: 저장 버튼 컴포넌트
- **방법**:
  1. Props 인터페이스
  2. canSave atom 연결
  3. disabled 상태 처리
  4. onClick 핸들러
- **완료**: [ ]
- **Requirements**: REQ-F-012, REQ-F-020
- **예상 시간**: 2시간
- **의존성**: 1.3 (canSave atom)

### 2.3 TimeSlotGrid 컴포넌트 (Container)
- **파일**: src/components/TimeSlotGrid.tsx
- **내용**: 시간대 목록을 그리드로 표시
- **방법**:
  1. Props 인터페이스
  2. timeSlots atom 연결
  3. 가상 스크롤 (react-window) 적용
  4. TimeSlotItem 렌더링
- **완료**: [ ]
- **Requirements**: REQ-F-001, REQ-NF-001
- **예상 시간**: 4시간
- **의존성**: 2.1 (TimeSlotItem), 1.2 (timeSlots atom)

### 2.4 TimeSlotSelector 컴포넌트 (Top-level)
- **파일**: src/components/TimeSlotSelector.tsx
- **내용**: 최상위 컨테이너 컴포넌트
- **방법**:
  1. Props 인터페이스
  2. 로딩/에러 상태 처리
  3. TimeSlotGrid와 SaveButton 조합
  4. 초기 데이터 로드
- **완료**: [ ]
- **Requirements**: REQ-F-001, REQ-F-030
- **예상 시간**: 3시간
- **의존성**: 2.2, 2.3 (SaveButton, TimeSlotGrid)
```

### API 설계 → API 구현 작업

**설계 입력**:
```typescript
interface TimeSlotsAPI {
  fetchTimeSlots(): Promise<TimeSlot[]>;
  saveSelectedSlots(slotIds: string[]): Promise<boolean>;
}
```

**작업 분해**:
```markdown
### 1.5 API 인터페이스 정의
- **파일**: src/api/timeSlotsAPI.ts
- **내용**: TimeSlotsAPI 인터페이스 및 타입 정의
- **방법**:
  1. 인터페이스 정의
  2. 요청/응답 타입 정의
  3. 에러 타입 정의
- **완료**: [ ]
- **Requirements**: REQ-F-001, REQ-F-012
- **예상 시간**: 1.5시간
- **의존성**: 1.1 (TimeSlot 타입)

### 1.6 API 클라이언트 구현
- **파일**: src/api/timeSlotsAPI.ts (동일 파일)
- **내용**: fetch 기반 API 클라이언트 구현
- **방법**:
  1. fetchTimeSlots 구현
  2. saveSelectedSlots 구현
  3. 에러 처리 (try-catch, throw)
- **완료**: [ ]
- **Requirements**: REQ-F-001, REQ-F-012, REQ-F-022
- **예상 시간**: 3시간
- **의존성**: 1.5 (API 인터페이스)

### 1.7 재시도 로직 구현
- **파일**: src/api/retryLogic.ts
- **내용**: 네트워크 에러 재시도 로직
- **방법**:
  1. saveWithRetry 함수 구현
  2. 지수 백오프 적용
  3. 최대 재시도 횟수 설정
- **완료**: [ ]
- **Requirements**: REQ-F-022
- **예상 시간**: 2시간
- **의존성**: 1.6 (API 클라이언트)
```

## 작업 우선순위 결정

### 우선순위 기준

```yaml
high_priority:
  criteria:
    - MVP 필수 기능
    - 다른 작업의 의존성 (blocking)
    - 높은 비즈니스 가치
  examples:
    - 데이터 타입 정의 (모든 작업이 의존)
    - 기본 UI 컴포넌트 (핵심 기능)
    - API 통신 (데이터 흐름 필수)

medium_priority:
  criteria:
    - UX 향상 기능
    - 성능 최적화
    - 에러 처리
  examples:
    - 드래그 선택 (클릭 선택으로 대체 가능)
    - 가상 스크롤 (초기 데이터 적으면 불필요)
    - 재시도 로직 (네트워크 안정적이면 덜 중요)

low_priority:
  criteria:
    - 선택적 기능 (Optional Requirements)
    - 고급 기능
    - 문서화
  examples:
    - 키보드 네비게이션
    - 스크린 리더 지원 (기본 접근성은 High)
    - Storybook 스토리
```

### 우선순위 할당 예시

```markdown
## Phase 1: MVP 핵심 기능 (High Priority)

### 1.1 데이터 타입 정의 [HIGH]
- **이유**: 모든 작업이 의존
- **우선순위**: P0 (최우선)

### 1.2 상태 관리 설정 [HIGH]
- **이유**: UI 컴포넌트가 의존
- **우선순위**: P0

### 2.1 TimeSlotItem 컴포넌트 [HIGH]
- **이유**: 핵심 UI 요소
- **우선순위**: P0

### 2.3 클릭 선택 기능 [HIGH]
- **이유**: MVP 필수 기능 (REQ-F-010)
- **우선순위**: P0

## Phase 2: UX 향상 (Medium Priority)

### 2.5 드래그 선택 기능 [MEDIUM]
- **이유**: UX 향상이지만 클릭으로 대체 가능
- **우선순위**: P1

### 2.6 로딩 상태 UI [MEDIUM]
- **이유**: UX 향상
- **우선순위**: P1

## Phase 3: 고급 기능 (Low Priority)

### 3.1 키보드 네비게이션 [LOW]
- **이유**: Optional 요구사항 (REQ-F-040)
- **우선순위**: P2
```

## 작업 예상 시간 추정

### 추정 방법

**Planning Poker 방식** (팀 작업 시):
```
1. 작업 설명
2. 각자 독립적으로 시간 추정
3. 가장 큰 추정과 가장 작은 추정 비교
4. 논의 후 합의
```

**개인 추정 방식**:
```yaml
experience_based:
  - 이전 유사 작업 참고
  - "TimeSlotItem 컴포넌트는 이전 CardItem과 비슷하므로 3시간"

decomposition_based:
  - 작업을 더 작은 단계로 분해
  - 각 단계 시간 추정 후 합산
  - 예: "Props 정의(0.5h) + 렌더링 로직(1h) + 이벤트 핸들러(1h) + 스타일링(0.5h) = 3h"

complexity_factors:
  simple: 1-2시간
    - 타입 정의
    - 간단한 유틸 함수

  moderate: 2-4시간
    - 기본 컴포넌트
    - 상태 관리 설정
    - API 클라이언트

  complex: 4-8시간
    - 복잡한 UI 인터랙션
    - 성능 최적화
    - 통합 작업
```

### 추정 정확도 향상

**버퍼 추가**:
```
추정 시간 × 1.2 = 안전한 추정

예:
- 기본 추정: 3시간
- 버퍼 포함: 3.6시간 → 4시간으로 반올림
```

**불확실성 표시**:
```markdown
### 2.5 드래그 선택 기능
- **예상 시간**: 4-6시간
  - 최소: 4시간 (라이브러리가 잘 동작할 경우)
  - 최대: 6시간 (모바일 터치 이슈 발생 시)
```

## 작업 검증 체크리스트

작업 분해 완료 후 확인:
- [ ] 모든 작업이 1-4시간 범위인가?
- [ ] 각 작업에 명확한 완료 기준이 있는가?
- [ ] 모든 High 우선순위 요구사항이 작업으로 커버되는가?
- [ ] 작업 간 의존성이 명시되었는가?
- [ ] 병렬 실행 가능한 작업이 식별되었는가?
- [ ] 각 작업이 요구사항 ID를 참조하는가?
- [ ] 비코딩 작업 (회의, 배포 등)이 없는가?
- [ ] 테스트 및 문서화 작업이 포함되었는가?

---

> **핵심 원칙**: 작업은 독립적으로 완료 가능하고 검증 가능해야 함
> **유연성**: 진행 중 조정 가능하지만 초기 계획은 체계적으로
