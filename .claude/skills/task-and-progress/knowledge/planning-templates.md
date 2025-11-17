# 작업 계획 템플릿

## 03_plan.md 표준 템플릿

```markdown
# 구현 계획: {기능 이름}

## 메타데이터
- **프로젝트**: {프로젝트명}
- **기능**: {기능명}
- **작성일**: YYYY-MM-DD
- **예상 시작**: YYYY-MM-DD
- **예상 완료**: YYYY-MM-DD
- **담당자**: {이름}
- **상태**: 계획중 | 진행중 | 완료
- **관련 문서**:
  - 요구사항: .tasks/{feature}_{date}/01_requirements.md
  - 설계: .tasks/{feature}_{date}/02_design.md

## 작업 요약
- **전체 작업**: {n}개
- **예상 총 시간**: {h}시간 ({d}일)
- **High 우선순위**: {n}개
- **Medium 우선순위**: {n}개
- **Low 우선순위**: {n}개
- **병렬 가능**: {n}개 작업

---

## Phase 1: {Phase 이름} (Day 1)

**목표**: {Phase의 목적과 결과물}

**의존성**: 없음

### 1.1 {작업 제목}
- **파일**: {파일 경로}
- **내용**: {작업 내용 설명}
- **방법**:
  1. {단계 1}
  2. {단계 2}
  3. {단계 3}
- **완료**: [ ]  <!-- 완료 시 [x] YYYY-MM-DD -->
- **Requirements**: {REQ-ID 목록}
- **예상 시간**: {h}시간
- **우선순위**: High | Medium | Low
- **의존성**: {의존하는 작업 번호 또는 "없음"}

### 1.2 {작업 제목}
...

---

## Phase 2: {Phase 이름} (Day 2-3)

**목표**: {Phase의 목적과 결과물}

**의존성**: Phase 1 완료

### 2.1 {작업 제목}
...

---

## Phase 3: {Phase 이름} (Day 4-5)

...

---

## 진행 상황 추적

### Phase별 진행률
- [ ] Phase 1: 기본 구조 (0/{n} 작업 완료)
- [ ] Phase 2: UI 컴포넌트 (0/{n} 작업 완료)
- [ ] Phase 3: 통합 및 테스트 (0/{n} 작업 완료)

### 전체 진행률
- **완료**: 0/{total} (0%)
- **진행중**: 0
- **대기중**: {total}

### 예상 일정
- **시작일**: YYYY-MM-DD
- **완료일**: YYYY-MM-DD
- **경과 일수**: 0일
- **남은 일수**: {d}일
- **진행률**: 0%

---

## 리스크 및 이슈

### 식별된 리스크
1. **{리스크 1}**
   - 확률: High | Medium | Low
   - 영향: High | Medium | Low
   - 완화 방안: {방안}

2. **{리스크 2}**
   ...

### 진행 중 이슈
<!-- 진행하면서 발견된 이슈 기록 -->

---

## 참고 사항

### 코딩 가이드라인
- 04_guideline.md 참조

### 테스트 전략
- Unit Test: {전략}
- E2E Test: {전략}

### 성능 목표
- {목표 1}
- {목표 2}

---
```

## 5-Field 작업 형식

모든 작업은 5개 필드 필수:

```markdown
### {번호} {작업 제목}
- **파일**: {파일 경로}
- **내용**: {작업 내용 1-2줄 설명}
- **방법**: {구현 방법 또는 단계별 설명}
- **완료**: [ ]
- **Requirements**: {REQ-ID 목록}
```

### 필드별 작성 가이드

**1. 파일 (File)**:
```markdown
✅ Good:
- **파일**: src/components/TimeSlotSelector.tsx
- **파일**: src/atoms/timeSlotAtoms.ts
- **파일**: src/types/timeSlot.ts

❌ Bad:
- **파일**: 컴포넌트 파일들
- **파일**: atoms
- **파일**: src/
```

**2. 내용 (Content)**:
```markdown
✅ Good:
- **내용**: TimeSlot 인터페이스 및 SelectionMode 타입 정의
- **내용**: Jotai atoms (timeSlots, selectedSlots, isLoading) 구현
- **내용**: TimeSlotItem 컴포넌트 개발 (클릭 선택 기능 포함)

❌ Bad:
- **내용**: 타입 작성
- **내용**: 상태 관리
- **내용**: 컴포넌트 만들기
```

**3. 방법 (Method)**:
```markdown
✅ Good:
- **방법**:
  1. TimeSlot 인터페이스 정의 (id, startTime, endTime, available)
  2. SelectionMode 타입 정의 ('idle' | 'selecting' | 'dragging')
  3. 필요한 타입 export

- **방법**: atom() 함수로 primitive atoms 생성 후 export

❌ Bad:
- **방법**: TypeScript로 작성
- **방법**: 일반적인 방식으로 구현
```

**4. 완료 (Completion)**:
```markdown
✅ Good:
- **완료**: [ ]
- **완료**: [x] 2024-01-15
- **완료**: [x] 2024-01-15 완료

❌ Bad:
- **완료**: 완료
- **완료**: done
- **완료**: ✓
```

**5. Requirements**:
```markdown
✅ Good:
- **Requirements**: REQ-F-001, REQ-F-031
- **Requirements**: REQ-F-010, REQ-NF-010
- **Requirements**: REQ-F-020

❌ Bad:
- **Requirements**: 시간대 표시
- **Requirements**: 요구사항 1
- **Requirements**: 없음 (누락)
```

## Phase 구조

### Phase 그룹화 전략

**Day 기반 그룹화**:
```markdown
Phase 1: 기본 구조 (Day 1)
  - 목표: 프로젝트 기반 설정 및 핵심 타입 정의
  - 작업: 타입 정의, 상태 관리 설정, API 인터페이스

Phase 2: UI 컴포넌트 (Day 2-3)
  - 목표: 사용자 인터페이스 구현
  - 작업: 컴포넌트 개발, 이벤트 핸들러, 스타일링

Phase 3: 통합 및 테스트 (Day 4-5)
  - 목표: 기능 통합 및 품질 검증
  - 작업: 통합, 테스트, 최적화, 버그 수정
```

**기능 기반 그룹화**:
```markdown
Phase 1: 데이터 레이어
  - 타입 정의
  - API 인터페이스
  - 상태 관리

Phase 2: 프레젠테이션 레이어
  - UI 컴포넌트
  - 이벤트 핸들러
  - 스타일링

Phase 3: 비즈니스 로직
  - 검증 로직
  - 에러 처리
  - 최적화
```

### Phase 크기

```yaml
optimal_phase_size:
  duration: 1-3일
  tasks: 3-8개
  hours: 8-24시간

too_small_phase:  # < 1일
  problem: "overhead가 너무 큼"
  solution: "다른 Phase와 병합"

too_large_phase:  # > 3일
  problem: "진행 상황 추적 어려움"
  solution: "더 작은 Phase로 분할"
```

## 진행률 계산

### 작업 기반 진행률

```
진행률 = (완료된 작업 수 / 전체 작업 수) × 100%

예:
- 전체 작업: 17개
- 완료: 5개
- 진행률: 5/17 = 29.4% ≈ 29%
```

### 시간 기반 진행률

```
진행률 = (사용한 시간 / 예상 총 시간) × 100%

예:
- 예상 총 시간: 40시간
- 사용 시간: 12시간
- 진행률: 12/40 = 30%
```

### Weighted 진행률 (우선순위 반영)

```
가중치:
- High: 3
- Medium: 2
- Low: 1

Weighted 진행률 = Σ(완료 작업 가중치) / Σ(전체 작업 가중치) × 100%

예:
- 전체: High(5) + Medium(3) + Low(2) = 5×3 + 3×2 + 2×1 = 23
- 완료: High(2) + Medium(1) = 2×3 + 1×2 = 8
- 진행률: 8/23 = 34.8% ≈ 35%
```

## 작업 상태 표시

### 체크박스 상태

```markdown
- [ ] 대기중 (Not Started)
- [~] 진행중 (In Progress) - 선택적
- [x] 완료 (Completed)
```

### 완료 날짜 기록

```markdown
- [x] 2024-01-15 완료
- [x] ✅ 2024-01-15
- [x] 2024-01-15 (3h 소요)
```

### Phase 진행 상태

```markdown
- [ ] Phase 1: 기본 구조 (0/5 작업 완료)
- [~] Phase 2: UI 컴포넌트 (3/8 작업 완료)  # 진행중
- [x] Phase 3: 테스트 (4/4 작업 완료)  # 완료
```

## 04_guideline.md 템플릿

```markdown
# 코딩 가이드라인: {기능 이름}

## 프로젝트 구조

```
src/
├─ types/
│  └─ timeSlot.ts
├─ atoms/
│  └─ timeSlotAtoms.ts
├─ api/
│  └─ timeSlotsAPI.ts
└─ components/
   └─ TimeSlotSelector/
      ├─ index.tsx
      ├─ TimeSlotGrid.tsx
      └─ TimeSlotItem.tsx
```

## 코딩 스타일

### TypeScript
- strict mode 활성화
- explicit return types
- no any (unknown 사용)

### 컴포넌트
- Functional components + Hooks
- Props는 별도 interface 정의
- 파일명 = 컴포넌트명 (PascalCase)

### 상태 관리
- Jotai atoms 사용
- atom 파일은 feature별 분리
- derived atoms는 선언적으로

### 네이밍
- 컴포넌트: PascalCase
- 파일: PascalCase (.tsx, .ts)
- atoms: camelCase + Atom 접미사
- 함수: camelCase

## 테스트 요구사항

### Unit Tests
- 모든 비즈니스 로직 함수
- 커버리지 목표: 80%+

### Component Tests
- Props 변화에 따른 렌더링
- 이벤트 핸들러 동작

### E2E Tests
- 핵심 사용자 시나리오
- Happy path + Error scenarios

## 성능 가이드

- React.memo for pure components
- useMemo for expensive calculations
- useCallback for event handlers
- Virtual scrolling for 100+ items

## 접근성

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus management

---
```

---

> **Best Practice**: 작업 계획은 살아있는 문서 - 진행하면서 지속 업데이트
> **일관성**: 5-Field 형식 엄격히 준수
