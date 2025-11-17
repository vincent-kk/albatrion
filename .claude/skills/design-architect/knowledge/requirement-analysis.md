# 요구사항 분석 가이드

## 개요

EARS 요구사항을 기술 설계로 변환하기 위한 체계적 분석 방법론입니다.

## 요구사항 → 설계 영역 매핑

### 매핑 프레임워크

```yaml
mapping_rules:
  ui_components:
    triggers:
      - Event-Driven 요구사항 (WHEN ... THEN)
      - State-Driven 요구사항 (WHILE ...)
      - Optional 요구사항 (WHERE ... UI 관련)
    outputs:
      - 컴포넌트 구조
      - Props 인터페이스
      - 이벤트 핸들러

  state_management:
    triggers:
      - State-Driven 요구사항 (WHILE ...)
      - Ubiquitous 요구사항 (데이터 지속성)
      - Event-Driven 요구사항 (상태 변경)
    outputs:
      - 상태 스키마
      - 액션/Reducer
      - 파생 상태

  api_design:
    triggers:
      - Ubiquitous 요구사항 (데이터 CRUD)
      - Unwanted 요구사항 (에러 처리)
      - Event-Driven 요구사항 (서버 통신)
    outputs:
      - API 엔드포인트
      - 요청/응답 타입
      - 에러 처리 전략

  data_model:
    triggers:
      - Ubiquitous 요구사항 (데이터 구조)
      - 모든 REQ-F (기능적 요구사항)
    outputs:
      - TypeScript 인터페이스
      - 검증 스키마
      - 변환 함수

  business_logic:
    triggers:
      - Event-Driven 요구사항 (비즈니스 규칙)
      - Unwanted 요구사항 (검증 로직)
    outputs:
      - 함수 시그니처
      - 알고리즘 설계
      - 유틸리티 함수
```

## EARS 패턴별 설계 전략

### 1. Ubiquitous Requirements → Core Architecture

**특징**:
- 시스템의 기본 구조 정의
- 항상 존재하는 데이터 및 기능
- 핵심 타입 및 인터페이스

**설계 접근**:
```
REQ-F-001: The time selection system shall display all available time slots in chronological order

설계 산출물:
1. 데이터 모델:
   interface TimeSlot {
     id: string;
     startTime: Date;
     endTime: Date;
     available: boolean;
   }

2. UI 컴포넌트:
   interface TimeSlotGridProps {
     timeSlots: TimeSlot[];  // 정렬된 목록
   }

3. 정렬 로직:
   const sortTimeSlots = (slots: TimeSlot[]) =>
     slots.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
```

### 2. Event-Driven Requirements → Event Handlers & Actions

**특징**:
- 사용자 인터랙션
- 외부 이벤트 처리
- 상태 변경 트리거

**설계 접근**:
```
REQ-F-010: WHEN a user clicks on a time slot THEN the system shall toggle the selection state

설계 산출물:
1. 이벤트 핸들러:
   const handleSlotClick = (slotId: string) => {
     setSelectedSlots(prev =>
       prev.includes(slotId)
         ? prev.filter(id => id !== slotId)  // 선택 해제
         : [...prev, slotId]                 // 선택 추가
     );
   };

2. 컴포넌트 Props:
   interface TimeSlotItemProps {
     slot: TimeSlot;
     isSelected: boolean;
     onClick: (slotId: string) => void;  // REQ-F-010 콜백
   }

3. 상태 업데이트:
   const selectedSlotsAtom = atom<string[]>([]);
   const toggleSlotAtom = atom(
     null,
     (get, set, slotId: string) => {
       const current = get(selectedSlotsAtom);
       set(selectedSlotsAtom,
         current.includes(slotId)
           ? current.filter(id => id !== slotId)
           : [...current, slotId]
       );
     }
   );
```

### 3. Unwanted Behavior Requirements → Validation & Error Handling

**특징**:
- 입력 검증
- 에러 처리
- 경계 조건

**설계 접근**:
```
REQ-F-020: IF no time slots are selected THEN the system shall disable the save button

설계 산출물:
1. 검증 로직:
   const canSave = (selectedSlots: string[]): boolean => {
     return selectedSlots.length > 0 && selectedSlots.length <= 50;
   };

2. 파생 상태:
   const canSaveAtom = atom(get => {
     const selected = get(selectedSlotsAtom);
     return selected.length > 0 && selected.length <= 50;
   });

3. UI 반영:
   <Button
     disabled={!canSave}
     onClick={handleSave}
   >
     저장
   </Button>

4. 에러 메시지:
   {!canSave && selectedSlots.length === 0 && (
     <ErrorMessage>시간대를 선택해주세요</ErrorMessage>
   )}
   {!canSave && selectedSlots.length > 50 && (
     <ErrorMessage>최대 50개까지 선택 가능합니다</ErrorMessage>
   )}
```

```
REQ-F-022: IF saving fails due to network error THEN the system shall retry up to 3 times

설계 산출물:
1. 재시도 로직:
   const saveWithRetry = async (
     slotIds: string[],
     maxRetries = 3
   ): Promise<boolean> => {
     for (let attempt = 1; attempt <= maxRetries; attempt++) {
       try {
         return await api.saveSelectedSlots(slotIds);
       } catch (error) {
         if (attempt === maxRetries) {
           throw new RetryExhaustedError(error);
         }
         await delay(1000 * attempt);  // 지수 백오프
       }
     }
     return false;
   };

2. 에러 타입:
   class RetryExhaustedError extends Error {
     constructor(public originalError: Error) {
       super(`Failed after ${maxRetries} retries`);
     }
   }

3. 사용자 피드백:
   try {
     await saveWithRetry(selectedSlots);
     showSuccess('저장되었습니다');
   } catch (error) {
     if (error instanceof RetryExhaustedError) {
       showError('저장 실패. 네트워크 연결을 확인해주세요');
     }
   }
```

### 4. State-Driven Requirements → State Machine & Modes

**특징**:
- 시스템 모드/상태
- 상태 전환 로직
- 조건부 UI

**설계 접근**:
```
REQ-F-030: WHILE time slots are being loaded THEN the system shall display a loading indicator

설계 산출물:
1. 로딩 상태:
   const isLoadingAtom = atom<boolean>(false);

   const loadTimeSlotsAtom = atom(
     null,
     async (get, set) => {
       set(isLoadingAtom, true);
       try {
         const slots = await api.fetchTimeSlots();
         set(timeSlotsAtom, slots);
       } finally {
         set(isLoadingAtom, false);
       }
     }
   );

2. 조건부 렌더링:
   const TimeSlotSelector = () => {
     const isLoading = useAtomValue(isLoadingAtom);

     if (isLoading) {
       return <LoadingIndicator />;  // REQ-F-030
     }

     return <TimeSlotGrid />;
   };

3. 상태 다이어그램:
   [IDLE] --load--> [LOADING] --success--> [LOADED]
                       |
                       +--error--> [ERROR]
```

```
REQ-F-031: WHILE in selection mode THEN the system shall highlight selected slots

설계 산출물:
1. 모드 상태:
   type SelectionMode = 'idle' | 'selecting' | 'dragging';
   const selectionModeAtom = atom<SelectionMode>('idle');

2. 모드별 스타일:
   const getSlotStyle = (
     isSelected: boolean,
     mode: SelectionMode
   ): CSSProperties => {
     if (mode === 'selecting' && isSelected) {
       return { backgroundColor: 'blue', border: '2px solid darkblue' };
     }
     return { backgroundColor: isSelected ? 'lightblue' : 'white' };
   };

3. 모드 전환:
   const handleMouseDown = () => {
     setSelectionMode('selecting');
   };

   const handleMouseUp = () => {
     setSelectionMode('idle');
   };
```

### 5. Optional Requirements → Feature Flags & Conditional Features

**특징**:
- 선택적 기능
- 사용자 설정
- 접근성 모드

**설계 접근**:
```
REQ-F-040: WHERE keyboard navigation is enabled the system shall allow arrow key navigation

설계 산출물:
1. 기능 플래그:
   const keyboardNavEnabledAtom = atom<boolean>(false);

2. 조건부 이벤트 핸들러:
   const TimeSlotGrid = () => {
     const keyboardNavEnabled = useAtomValue(keyboardNavEnabledAtom);

     useEffect(() => {
       if (!keyboardNavEnabled) return;

       const handleKeyDown = (e: KeyboardEvent) => {
         switch (e.key) {
           case 'ArrowUp': moveFocusUp(); break;
           case 'ArrowDown': moveFocusDown(); break;
           case 'Enter': toggleCurrentSlot(); break;
         }
       };

       window.addEventListener('keydown', handleKeyDown);
       return () => window.removeEventListener('keydown', handleKeyDown);
     }, [keyboardNavEnabled]);

     // ...
   };

3. 설정 UI:
   <Switch
     checked={keyboardNavEnabled}
     onChange={setKeyboardNavEnabled}
   >
     키보드 네비게이션 활성화
   </Switch>
```

## 비기능적 요구사항 분석

### Performance Requirements (REQ-NF-001 ~ REQ-NF-00X)

**분석 프로세스**:
```yaml
step_1_목표_추출:
  REQ-NF-001: "렌더링 500ms 이내"
  REQ-NF-002: "사용자 입력 응답 100ms 이내"

step_2_병목_식별:
  potential_bottlenecks:
    - "100개+ 시간대 동시 렌더링"
    - "드래그 이벤트 과다 발생"
    - "상태 업데이트 시 불필요한 리렌더링"

step_3_최적화_전략:
  virtual_scrolling:
    library: "react-window"
    benefit: "메모리 사용 감소, 렌더링 성능 향상"

  memoization:
    techniques:
      - "React.memo for TimeSlotItem"
      - "useMemo for sorted/filtered lists"
      - "useCallback for event handlers"

  debouncing:
    drag_events: "16ms throttle (60fps)"
    search_input: "300ms debounce"

step_4_측정_방법:
  tools:
    - "React DevTools Profiler"
    - "Chrome DevTools Performance"
    - "Lighthouse"

  metrics:
    - "First Contentful Paint (FCP)"
    - "Time to Interactive (TTI)"
    - "Interaction to Next Paint (INP)"
```

**설계 산출물**:
```typescript
// 가상 스크롤 적용
import { FixedSizeList } from 'react-window';

const TimeSlotGrid = ({ timeSlots }: { timeSlots: TimeSlot[] }) => {
  return (
    <FixedSizeList
      height={600}
      itemCount={timeSlots.length}
      itemSize={50}
      width="100%"
    >
      {({ index, style }) => (
        <TimeSlotItem
          slot={timeSlots[index]}
          style={style}
        />
      )}
    </FixedSizeList>
  );
};

// 메모이제이션
const TimeSlotItem = React.memo(({ slot, isSelected, onClick }) => {
  // ...
}, (prevProps, nextProps) =>
  prevProps.isSelected === nextProps.isSelected &&
  prevProps.slot.id === nextProps.slot.id
);

// 드래그 이벤트 최적화
const useDragSelection = () => {
  const throttledDragHandler = useCallback(
    throttle((e: MouseEvent) => {
      // 드래그 로직
    }, 16), // 60fps
    []
  );

  return { onMouseMove: throttledDragHandler };
};
```

### Usability & Accessibility Requirements (REQ-NF-010 ~ REQ-NF-01X)

**분석 프로세스**:
```yaml
step_1_기준_확인:
  REQ-NF-010: "WCAG 2.1 AA 준수"

  wcag_requirements:
    perceivable:
      - "텍스트 대비 4.5:1 이상"
      - "시각적 정보에 대한 대체 텍스트"

    operable:
      - "키보드로 모든 기능 접근 가능"
      - "포커스 순서 논리적"

    understandable:
      - "명확한 에러 메시지"
      - "일관된 네비게이션"

    robust:
      - "유효한 HTML"
      - "ARIA 속성 올바른 사용"

step_2_설계_전략:
  keyboard_navigation:
    - "Tab: 컴포넌트 간 이동"
    - "Arrow keys: 시간대 간 이동"
    - "Enter/Space: 선택 토글"
    - "Escape: 선택 모드 종료"

  screen_reader:
    - "ARIA labels for time slots"
    - "ARIA live regions for status updates"
    - "Semantic HTML (button, list, etc.)"

  visual_design:
    - "색상만으로 정보 전달 금지"
    - "충분한 터치 타겟 크기 (44x44px)"
    - "명확한 포커스 인디케이터"
```

**설계 산출물**:
```typescript
// 키보드 네비게이션
const TimeSlotItem = ({ slot, index }: TimeSlotItemProps) => {
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        toggleSelection(slot.id);
        break;
      case 'ArrowDown':
        focusSlot(index + 1);
        break;
      case 'ArrowUp':
        focusSlot(index - 1);
        break;
    }
  };

  return (
    <button
      role="checkbox"
      aria-checked={isSelected}
      aria-label={`${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* ... */}
    </button>
  );
};

// 스크린 리더 지원
const TimeSlotGrid = ({ selectedCount }: TimeSlotGridProps) => {
  return (
    <div>
      <div
        role="status"
        aria-live="polite"
        className="sr-only"
      >
        {selectedCount}개 시간대 선택됨
      </div>

      <ul role="list" aria-label="사용 가능한 시간대">
        {/* ... */}
      </ul>
    </div>
  );
};
```

## 요구사항 우선순위와 설계 영향

### 우선순위 매핑

```yaml
high_priority:
  description: "MVP 필수 기능"
  design_impact: "즉시 설계 및 구현"
  requirements:
    - REQ-F-001 # 시간대 표시
    - REQ-F-010 # 클릭 선택
    - REQ-F-012 # 저장
    - REQ-NF-001 # 성능

medium_priority:
  description: "사용성 향상 기능"
  design_impact: "Phase 2 설계"
  requirements:
    - REQ-F-011 # 드래그 선택
    - REQ-F-030 # 로딩 상태
    - REQ-NF-010 # 접근성

low_priority:
  description: "선택적/고급 기능"
  design_impact: "Phase 3 설계 (필요 시)"
  requirements:
    - REQ-F-040 # 키보드 네비게이션
    - REQ-F-041 # 스크린 리더
```

### 단계별 설계 전략

**Phase 1: MVP (High Priority)**
```
설계 범위:
- TimeSlotGrid 컴포넌트 (REQ-F-001)
- 클릭 선택 로직 (REQ-F-010)
- 기본 상태 관리 (Jotai)
- API 통신 (REQ-F-012)
- 성능 최적화 기본 (REQ-NF-001)

산출물:
- 컴포넌트 Props 인터페이스
- 상태 atoms 정의
- API 타입 및 엔드포인트
- 기본 성능 측정 설정
```

**Phase 2: Enhanced UX (Medium Priority)**
```
설계 범위:
- 드래그 선택 (REQ-F-011)
- 로딩/에러 상태 UI (REQ-F-030)
- 접근성 기본 (REQ-NF-010)

산출물:
- DragSelection 컴포넌트
- 상태 머신 (로딩/에러 상태)
- ARIA 속성 추가
- 접근성 테스트 계획
```

**Phase 3: Advanced Features (Low Priority)**
```
설계 범위:
- 키보드 네비게이션 (REQ-F-040)
- 스크린 리더 최적화 (REQ-F-041)
- 고급 접근성 (WCAG AAA)

산출물:
- 키보드 이벤트 핸들러
- ARIA live regions
- 포커스 관리 로직
```

## 설계 완전성 체크리스트

요구사항 분석 완료 후 확인:
- [ ] 모든 기능적 요구사항이 설계 요소에 매핑됨
- [ ] 모든 비기능적 요구사항이 최적화 전략에 반영됨
- [ ] 요구사항 간 의존성이 설계에 반영됨
- [ ] 우선순위에 따른 단계별 구현 계획 수립
- [ ] 성능 목표에 대한 측정 방법 정의
- [ ] 접근성 기준에 대한 검증 방법 정의
- [ ] 모든 에러 시나리오가 처리 로직에 반영됨

---

> **핵심 원칙**: 모든 설계 결정은 요구사항에서 추적 가능해야 함
> **반복 프로세스**: 요구사항 분석 → 설계 → 검증 → 개선
