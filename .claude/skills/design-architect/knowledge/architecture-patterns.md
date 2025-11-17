# 아키텍처 패턴 카탈로그

## 개요

프로젝트 유형과 요구사항에 따라 선택할 수 있는 검증된 아키텍처 패턴 모음입니다.

## Frontend 아키텍처 패턴

### 1. Atomic Design Pattern

**설명**: UI를 atom → molecule → organism → template → page 계층으로 구조화

**적합한 경우**:
- 디자인 시스템이 필요한 프로젝트
- 재사용 가능한 컴포넌트 중심 개발
- 일관된 UI/UX 필요
- 여러 팀이 협업하는 큰 프로젝트

**구조**:
```
src/
├─ atoms/           # 기본 UI 요소 (Button, Input, Label)
├─ molecules/       # 간단한 컴포넌트 조합 (SearchBar = Input + Button)
├─ organisms/       # 복잡한 UI 블록 (Header, TimeSlotGrid)
├─ templates/       # 페이지 레이아웃
└─ pages/           # 실제 페이지 컴포넌트
```

**장점**:
- 재사용성 극대화
- 컴포넌트 책임 명확
- 디자인 시스템과 자연스럽게 매핑
- 스토리북과 통합 용이

**단점**:
- 초기 구조 설계 복잡
- 작은 프로젝트에 과도할 수 있음
- 컴포넌트 분류 기준이 모호할 수 있음

**사용 예시**:
```typescript
// Atom
export const Button = ({ children, onClick }: ButtonProps) => (
  <button onClick={onClick}>{children}</button>
);

// Molecule
export const SearchBar = ({ onSearch }: SearchBarProps) => (
  <div>
    <Input />
    <Button onClick={onSearch}>검색</Button>
  </div>
);

// Organism
export const TimeSlotGrid = ({ slots }: TimeSlotGridProps) => (
  <div>
    <SearchBar onSearch={handleSearch} />
    {slots.map(slot => <TimeSlotItem key={slot.id} slot={slot} />)}
  </div>
);
```

### 2. Feature-Sliced Design (FSD)

**설명**: 기능 중심으로 코드를 slice하여 구조화

**적합한 경우**:
- 복잡한 비즈니스 로직이 많은 애플리케이션
- 기능 단위 개발 및 배포
- 도메인 중심 설계 선호
- 확장성이 중요한 프로젝트

**구조**:
```
src/
├─ shared/         # 공통 유틸리티, UI 킷
├─ entities/       # 비즈니스 엔티티 (User, TimeSlot)
├─ features/       # 사용자 기능 (SelectTimeSlot, SaveSelection)
├─ widgets/        # 독립적인 UI 블록
└─ pages/          # 라우팅 페이지
```

**장점**:
- 기능별 격리로 유지보수 용이
- 확장성 우수
- 팀 간 작업 충돌 최소화
- 명확한 의존성 방향 (상위 → 하위만 허용)

**단점**:
- 학습 곡선 높음
- 초기 설정 복잡
- 작은 기능도 많은 폴더 생성

**사용 예시**:
```
features/
└─ select-time-slot/
   ├─ model/         # 상태 관리 (atoms, actions)
   ├─ ui/            # UI 컴포넌트
   ├─ api/           # API 호출
   └─ lib/           # 유틸리티 함수

entities/
└─ time-slot/
   ├─ model/
   │  └─ types.ts    # TimeSlot 타입 정의
   └─ lib/
      └─ validation.ts
```

### 3. Presentational-Container Pattern

**설명**: UI 로직과 비즈니스 로직을 분리

**적합한 경우**:
- 비즈니스 로직과 UI 분리 필요
- 테스트 용이성 중요
- 다양한 UI 구현체 지원
- Redux 등 전역 상태 관리 사용

**구조**:
```typescript
// Presentational Component (UI만 담당)
const TimeSlotItemUI = ({ slot, isSelected, onClick }: TimeSlotItemUIProps) => (
  <div
    className={isSelected ? 'selected' : ''}
    onClick={() => onClick(slot.id)}
  >
    {formatTime(slot.startTime)}
  </div>
);

// Container Component (로직 담당)
const TimeSlotItemContainer = ({ slot }: { slot: TimeSlot }) => {
  const [selectedSlots, setSelectedSlots] = useAtom(selectedSlotsAtom);
  const isSelected = selectedSlots.includes(slot.id);

  const handleClick = (id: string) => {
    setSelectedSlots(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  return (
    <TimeSlotItemUI
      slot={slot}
      isSelected={isSelected}
      onClick={handleClick}
    />
  );
};
```

**장점**:
- 관심사 분리 명확
- Presentational 컴포넌트 재사용 용이
- UI 테스트 간단 (props만 확인)
- 로직 테스트 독립적

**단점**:
- 컴포넌트 수 증가
- React Hooks로 패턴이 약화됨 (Custom Hooks 선호)
- 작은 컴포넌트에 과도할 수 있음

### 4. Compound Components Pattern

**설명**: 컴포넌트를 조합하여 복잡한 UI 구성

**적합한 경우**:
- 유연한 컴포넌트 API 필요
- 다양한 조합 지원
- 라이브러리/디자인 시스템 개발
- 내부 상태 공유 필요

**사용 예시**:
```typescript
// 복합 컴포넌트 패턴
const TimeSlotSelector = ({ children }: { children: React.ReactNode }) => {
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  return (
    <TimeSelectorContext.Provider value={{ selectedSlots, setSelectedSlots }}>
      <div className="time-selector">{children}</div>
    </TimeSelectorContext.Provider>
  );
};

TimeSlotSelector.Grid = ({ slots }: { slots: TimeSlot[] }) => {
  const { selectedSlots, setSelectedSlots } = useTimeSelectorContext();
  // Grid 렌더링 로직
};

TimeSlotSelector.SaveButton = () => {
  const { selectedSlots } = useTimeSelectorContext();
  // 저장 버튼 로직
};

// 사용
<TimeSlotSelector>
  <TimeSlotSelector.Grid slots={availableSlots} />
  <TimeSlotSelector.SaveButton />
</TimeSlotSelector>
```

**장점**:
- 유연한 조합
- 명시적 API
- 내부 상태 자동 공유
- 확장 용이

**단점**:
- 구현 복잡도 높음
- TypeScript 타이핑 어려움
- 잘못된 조합 방지 어려움

## 상태 관리 패턴

### 1. Atomic State (Jotai, Recoil)

**설명**: 상태를 작은 atom 단위로 관리

**적합한 경우**:
- 세밀한 리렌더링 제어 필요
- 파생 상태가 많은 경우
- 성능 최적화 중요
- 보일러플레이트 최소화 선호

**구조**:
```typescript
// Atoms
const timeSlotsAtom = atom<TimeSlot[]>([]);
const selectedSlotsAtom = atom<string[]>([]);
const isLoadingAtom = atom<boolean>(false);

// Derived Atoms
const selectedTimeSlotsAtom = atom(get => {
  const slots = get(timeSlotsAtom);
  const selected = get(selectedSlotsAtom);
  return slots.filter(slot => selected.includes(slot.id));
});

const canSaveAtom = atom(get => {
  const selected = get(selectedSlotsAtom);
  return selected.length > 0 && selected.length <= 50;
});

// Write Atoms
const toggleSlotAtom = atom(
  null,
  (get, set, slotId: string) => {
    const current = get(selectedSlotsAtom);
    set(
      selectedSlotsAtom,
      current.includes(slotId)
        ? current.filter(id => id !== slotId)
        : [...current, slotId]
    );
  }
);
```

**장점**:
- 불필요한 리렌더링 최소화
- 간단한 API
- TypeScript 친화적
- 파생 상태 자동 계산

**단점**:
- 복잡한 비동기 로직 처리 어려울 수 있음
- 전역 상태가 많아지면 관리 어려움
- DevTools 지원 제한적

### 2. Flux/Redux Pattern

**설명**: 단방향 데이터 흐름과 중앙집중식 상태 관리

**적합한 경우**:
- 복잡한 상태 업데이트 로직
- 시간 여행 디버깅 필요
- 전역 상태가 많은 대규모 앱
- 예측 가능한 상태 관리 중요

**구조**:
```typescript
// State
interface AppState {
  timeSlots: {
    slots: TimeSlot[];
    selected: string[];
    loading: boolean;
    error: string | null;
  };
}

// Actions
const actions = {
  loadTimeSlots: () => ({ type: 'LOAD_TIME_SLOTS' as const }),
  loadTimeSlotsSuccess: (slots: TimeSlot[]) => ({
    type: 'LOAD_TIME_SLOTS_SUCCESS' as const,
    payload: slots
  }),
  toggleSlot: (slotId: string) => ({
    type: 'TOGGLE_SLOT' as const,
    payload: slotId
  })
};

// Reducer
const timeSlotsReducer = (state: AppState['timeSlots'], action: Action) => {
  switch (action.type) {
    case 'LOAD_TIME_SLOTS':
      return { ...state, loading: true };
    case 'LOAD_TIME_SLOTS_SUCCESS':
      return { ...state, slots: action.payload, loading: false };
    case 'TOGGLE_SLOT':
      return {
        ...state,
        selected: state.selected.includes(action.payload)
          ? state.selected.filter(id => id !== action.payload)
          : [...state.selected, action.payload]
      };
    default:
      return state;
  }
};
```

**장점**:
- 예측 가능한 상태 변경
- 시간 여행 디버깅
- 강력한 미들웨어 생태계
- 검증된 패턴

**단점**:
- 보일러플레이트 많음
- 학습 곡선 높음
- 간단한 상태에 과도할 수 있음

### 3. State Machine Pattern

**설명**: 유한 상태 머신으로 상태 전환 관리

**적합한 경우**:
- 명확한 상태 전환 흐름 존재
- 복잡한 UI 상태 관리
- 비즈니스 로직이 상태 기반
- 예측 가능한 동작 중요

**구조**:
```typescript
import { createMachine } from 'xstate';

const timeSlotMachine = createMachine({
  id: 'timeSlot',
  initial: 'idle',
  states: {
    idle: {
      on: {
        LOAD: 'loading'
      }
    },
    loading: {
      on: {
        SUCCESS: 'loaded',
        ERROR: 'error'
      }
    },
    loaded: {
      on: {
        SELECT: 'selecting',
        RELOAD: 'loading'
      }
    },
    selecting: {
      on: {
        DONE: 'loaded',
        CANCEL: 'loaded'
      }
    },
    error: {
      on: {
        RETRY: 'loading'
      }
    }
  }
});

// 사용
const [state, send] = useMachine(timeSlotMachine);

// state.value === 'loading' ? <Loading /> : <Content />
// send('LOAD')
```

**장점**:
- 상태 전환 명확
- 불가능한 상태 방지
- 시각화 가능 (상태 다이어그램)
- 복잡한 흐름 간단히 표현

**단점**:
- 학습 곡선 높음
- 간단한 상태에 과도함
- 번들 크기 증가

## API 설계 패턴

### 1. RESTful API Pattern

**설명**: HTTP 메서드와 리소스 중심 API 설계

**적합한 경우**:
- CRUD 중심 애플리케이션
- 표준 HTTP 메서드 활용
- 캐싱 전략 중요
- 간단한 API 구조

**구조**:
```typescript
// API 인터페이스
interface TimeSlotsAPI {
  // GET /api/time-slots
  getTimeSlots(): Promise<TimeSlot[]>;

  // GET /api/time-slots/:id
  getTimeSlot(id: string): Promise<TimeSlot>;

  // POST /api/time-slots/select
  selectTimeSlots(slotIds: string[]): Promise<void>;

  // DELETE /api/time-slots/select/:id
  deselectTimeSlot(slotId: string): Promise<void>;
}

// 구현
const api: TimeSlotsAPI = {
  async getTimeSlots() {
    const response = await fetch('/api/time-slots');
    if (!response.ok) throw new Error('Failed to fetch');
    return response.json();
  },

  async selectTimeSlots(slotIds) {
    const response = await fetch('/api/time-slots/select', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slotIds })
    });
    if (!response.ok) throw new Error('Failed to select');
  }
};
```

**장점**:
- 표준화된 방식
- 캐싱 용이
- 이해하기 쉬움
- HTTP 인프라 활용

**단점**:
- Over-fetching/Under-fetching
- 복잡한 쿼리 표현 어려움
- 여러 리소스 조합 시 다중 요청

### 2. GraphQL Pattern

**설명**: 쿼리 언어로 필요한 데이터만 요청

**적합한 경우**:
- 복잡한 데이터 관계
- 클라이언트별 데이터 요구사항 다름
- Over-fetching 문제
- 타입 안정성 중요

**구조**:
```typescript
// GraphQL Query
const GET_TIME_SLOTS = gql`
  query GetTimeSlots($date: Date!) {
    timeSlots(date: $date) {
      id
      startTime
      endTime
      available
      selected
    }
  }
`;

// Mutation
const SELECT_TIME_SLOT = gql`
  mutation SelectTimeSlot($slotId: ID!) {
    selectTimeSlot(slotId: $slotId) {
      id
      selected
    }
  }
`;

// 사용
const { data, loading, error } = useQuery(GET_TIME_SLOTS, {
  variables: { date: new Date() }
});

const [selectSlot] = useMutation(SELECT_TIME_SLOT);
```

**장점**:
- 정확히 필요한 데이터만 요청
- 타입 안전성
- 단일 엔드포인트
- 강력한 개발 도구

**단점**:
- 학습 곡선 높음
- 캐싱 복잡
- 서버 구현 복잡
- N+1 쿼리 문제

### 3. tRPC Pattern

**설명**: TypeScript 기반 end-to-end 타입 안전 RPC

**적합한 경우**:
- Full-stack TypeScript 프로젝트
- 타입 안전성 최우선
- 빠른 개발 속도 필요
- GraphQL 복잡도 부담

**구조**:
```typescript
// Server
const appRouter = router({
  timeSlots: {
    list: publicProcedure
      .query(async () => {
        return db.timeSlots.findMany();
      }),

    select: publicProcedure
      .input(z.object({ slotIds: z.array(z.string()) }))
      .mutation(async ({ input }) => {
        return db.selections.create({ data: input });
      })
  }
});

// Client (타입 자동 추론)
const slots = await trpc.timeSlots.list.query();
await trpc.timeSlots.select.mutate({ slotIds: ['1', '2'] });
```

**장점**:
- End-to-end 타입 안전성
- 자동 타입 추론
- 간단한 API
- GraphQL보다 간단

**단점**:
- TypeScript 필수
- 모노레포 권장
- 생태계 작음
- 서버-클라이언트 강하게 결합

## 패턴 선택 가이드

### 프로젝트 규모별 권장 패턴

**Small (< 10 컴포넌트)**:
```yaml
ui_structure: "간단한 폴더 구조 (components/, pages/)"
state_management: "React useState + Context"
api: "Fetch API 직접 사용"
```

**Medium (10-50 컴포넌트)**:
```yaml
ui_structure: "Atomic Design 또는 기능별 폴더"
state_management: "Jotai/Zustand"
api: "React Query + RESTful API"
```

**Large (50+ 컴포넌트)**:
```yaml
ui_structure: "Feature-Sliced Design"
state_management: "Jotai + 도메인별 atoms"
api: "React Query + tRPC/GraphQL"
```

### 요구사항별 패턴 선택

| 요구사항 | 추천 패턴 | 이유 |
|---------|----------|------|
| 성능 중요 | Atomic State + Virtual Scrolling | 불필요한 리렌더링 최소화 |
| 복잡한 UI 상태 | State Machine | 명확한 상태 전환 |
| 재사용성 | Atomic Design + Compound Components | 조합 가능한 컴포넌트 |
| 타입 안전성 | tRPC + TypeScript strict | End-to-end 타입 |
| 빠른 개발 | Feature-Sliced + Jotai | 보일러플레이트 최소 |

---

> **핵심 원칙**: 프로젝트에 맞는 "충분히 좋은" 패턴 선택
> **과도한 엔지니어링 주의**: 작은 프로젝트에 복잡한 패턴 적용 금지
