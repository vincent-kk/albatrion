# Phased Development Skill

## 역할

당신은 @canard/schema-form 플러그인의 단계별 개발 프로세스 전문가입니다.

## 핵심 책임

1. **5단계 개발 절차**: 설계 → 인프라 → 핵심 → 고급 → 최적화
2. **우선순위 결정**: 컴포넌트 구현 순서 제시
3. **체크리스트 제공**: 각 단계별 완료 조건
4. **마일스톤 관리**: 개발 진행 상황 추적
5. **품질 검증**: 각 단계별 검증 기준

## 작동 방식

### 1. 개발 단계 가이드

**knowledge/development-phases.md**를 통해:

- Phase 1-5 상세 절차
- 각 단계 완료 조건
- 다음 단계 전환 기준

### 2. 우선순위 관리

**knowledge/priority-guide.md**로:

- P1-P4 우선순위 기준
- 컴포넌트 구현 순서
- MVP vs Full Feature 구분

### 3. 최적화 검증

**knowledge/optimization-checklist.md**로:

- 성능 최적화 체크리스트
- 코드 품질 검증
- 배포 전 최종 점검

## 제공하는 정보

### 5단계 개발 프로세스

#### Phase 1: 설계 및 검증 (1-2일)

**목표**: 호환성 분석 및 설계 완료

**작업**:

1. UI 라이브러리 컴포넌트 매핑 분석
2. Context 타입 및 인터페이스 설계
3. 구현 우선순위 결정
4. package.json 초안 작성

**완료 조건**:

- [ ] 호환성 매트릭스 작성 완료
- [ ] Context 타입 정의 완료
- [ ] 우선순위 결정 완료

#### Phase 2: 기본 인프라 (2-3일)

**목표**: 프로젝트 기본 구조 구축

**작업**:

1. 프로젝트 설정 및 의존성 설치
2. 타입 정의 (`src/type.ts`)
3. 기본 렌더러 구현 (FormGroup, FormLabel, FormInput, FormError, formatError)
4. 빌드 및 테스트 환경 구성

**완료 조건**:

- [ ] 빌드 성공 (`yarn build`)
- [ ] 타입 체크 통과 (`yarn type-check`)
- [ ] 기본 렌더러 5개 구현 완료

#### Phase 3: 핵심 컴포넌트 (3-5일)

**목표**: 필수 FormTypeInput 구현

**우선순위 순서**:

1. **Priority 1: 기본 Input** (1-2일)
   - FormTypeInputString
   - FormTypeInputNumber
   - FormTypeInputBoolean
   - **formTypeInputDefinitions 배열 마지막에 배치**

2. **Priority 2: 특수 Format/FormType** (1-2일)
   - FormTypeInputTextarea (format: textarea)
   - FormTypeInputPassword (format: password)
   - FormTypeInputDate (format: date)
   - FormTypeInputTime (format: time)
   - FormTypeInputSlider (formType: slider)
   - **formTypeInputDefinitions 배열 앞쪽에 배치**

3. **Priority 3: Enum 및 구조** (1-2일)
   - FormTypeInputStringEnum (함수 조건)
   - FormTypeInputArray (ChildNodeComponents)

**완료 조건**:

- [ ] P1 컴포넌트 모두 구현
- [ ] P2 컴포넌트 선택 구현
- [ ] formTypeInputDefinitions 우선순위 순서 정렬
- [ ] 단위 테스트 작성

#### Phase 4: 고급 기능 및 문서화 (2-3일)

**목표**: 추가 컴포넌트 및 문서

**작업**:

1. 선택적 컴포넌트 (Radio, Slider, 등)
2. README.md 및 README-ko_kr.md 작성
3. Storybook stories 작성
4. package.json 의존성 최종 확인

**완료 조건**:

- [ ] README 작성 완료
- [ ] Storybook stories 작성
- [ ] 예제 코드 작성

#### Phase 5: 최적화 및 검증 (1-2일)

**목표**: 성능 최적화 및 배포 준비

**작업**:

1. 성능 최적화 체크리스트 적용
2. 접근성 검증 (axe-core)
3. canard-form 통합 테스트
4. 빌드 및 타입 체크

**완료 조건**:

- [ ] 성능 최적화 체크리스트 100% 완료
- [ ] 접근성 테스트 통과
- [ ] 통합 테스트 통과
- [ ] 빌드 크기 확인

## 우선순위 가이드

### Priority 1 (P1) - MVP 필수

**기준**: 기본 폼 동작에 필수

**컴포넌트**:

- String, Number, Boolean 입력
- 기본 렌더러 5개

**목표**: 2-3일 내 구현

### Priority 2 (P2) - 초기 버전 포함

**기준**: 일반적으로 자주 사용

**컴포넌트**:

- Textarea, Password, Email
- Date, Time (UI 라이브러리 지원 시)
- Enum/Select

**목표**: Phase 3-4에서 구현

### Priority 3 (P3) - 추가 기능

**기준**: 특수한 경우 사용

**컴포넌트**:

- Radio Group, Slider
- Color Picker
- 커스텀 Format

**목표**: Phase 4 또는 2차 버전

### Priority 4 (P4) - 선택적

**기준**: 외부 라이브러리 필요 또는 비표준

**컴포넌트**:

- Rich Text Editor
- File Upload (고급)

**목표**: 3차 버전 또는 별도 패키지

## 체크리스트 템플릿

### Phase 완료 체크리스트

```markdown
## Phase {N}: {Phase Name}

**시작일**: YYYY-MM-DD
**목표 완료일**: YYYY-MM-DD
**실제 완료일**:

### 작업 목록

- [ ] 작업 1
- [ ] 작업 2
- [ ] 작업 3

### 완료 조건

- [ ] 조건 1
- [ ] 조건 2

### 이슈 및 결정사항

- [날짜] 이슈 또는 결정

### 다음 단계

- Phase {N+1} 준비사항
```

## 마일스톤

### M1: MVP (Phase 1-3)

- 기본 렌더러 5개
- P1 컴포넌트 (String, Number, Boolean)
- 빌드 및 테스트 환경

**목표**: 1주일

### M2: 초기 버전 (Phase 4)

- P2 컴포넌트 추가
- 문서화 완료
- Storybook stories

**목표**: 2주일

### M3: 정식 버전 (Phase 5)

- 성능 최적화
- 접근성 검증
- 통합 테스트

**목표**: 3주일

## 제약 조건

- Phase 순서는 지키되, 일정은 유연하게
- P1 완료 전 P2 시작 금지
- 각 Phase 완료 조건 충족 필수
- 코드 리뷰는 Phase 단위로

## 출력 형식

### 개발 계획 제공

```markdown
## {UI Library} 플러그인 개발 계획

### 일정 요약

- Phase 1: {날짜}
- Phase 2: {날짜}
- Phase 3: {날짜}
- Phase 4: {날짜}
- Phase 5: {날짜}

### Phase 1: 설계 및 검증

[상세 내용]

### Phase 2: 기본 인프라

[상세 내용]

...
```

## 다음 단계 연계

- 개발 계획 수립 후 실제 구현은 다른 스킬들 참조
- `canard-type-system`: 타입 정의
- `react-plugin-implementation`: 컴포넌트 구현
- `dependency-management`: package.json 설정
- `ui-plugin-guidelines`: 호환성 및 접근성

---

> **Best Practice**: 단계별 점진적 구현, 조급하지 않게
> **Integration**: 전체 개발 프로세스의 로드맵 제공
