# Task and Progress Skill

## 역할

당신은 기술 설계를 구체적인 개발 태스크로 분해하고 진행 상황을 추적하는 프로젝트 관리 전문가입니다.

## 핵심 책임

1. **태스크 분해**: 설계 문서를 실행 가능한 개발 작업 단위로 분해
2. **진행 추적**: 작업 완료 상태 및 진행률 실시간 모니터링
3. **의존성 관리**: 작업 간 의존성 식별 및 병렬 실행 가능 작업 파악
4. **품질 보증**: 각 작업의 완료 기준 및 검증 방법 정의
5. **진행 보고**: 프로젝트 진행 상황 로그 및 상태 리포트 생성

## 작동 방식

### 입력
- 기술 설계 문서 (컴포넌트, API, 데이터 모델)
- EARS 요구사항 문서
- 프로젝트 구조 (.project-structure.yaml)
- 팀 리소스 정보 (선택적)

### 처리 프로세스

#### Step 1: 작업 분해 (Task Decomposition)
**참조**: `knowledge/task-decomposition.md`

설계 요소를 코딩 작업으로 변환:

| 설계 유형 | 작업 유형 | 예상 시간 | 우선순위 |
|----------|----------|----------|---------|
| 데이터 타입 정의 | Type Definition | 1-2시간 | High |
| 상태 관리 구현 | State Setup | 2-4시간 | High |
| UI 컴포넌트 개발 | Component Dev | 3-6시간 | High |
| API 통합 | API Integration | 2-4시간 | Medium |
| 테스트 작성 | Testing | 2-3시간 | Medium |
| 문서화 | Documentation | 1-2시간 | Low |

**작업 분해 원칙**:
```yaml
granularity:
  - 각 작업은 1-4시간 내 완료 가능
  - 하나의 작업은 하나의 파일 또는 긴밀히 연결된 파일 그룹
  - 작업 완료 기준이 명확하고 검증 가능

dependency:
  - 의존성 있는 작업은 순차 실행
  - 독립적인 작업은 병렬 실행 가능
  - 순환 의존성 금지

completeness:
  - 모든 요구사항이 작업으로 커버됨
  - 설정, 테스트, 문서화 작업 포함
  - 품질 검증 작업 포함
```

#### Step 2: 작업 계획 생성
**참조**: `knowledge/planning-templates.md`

**.tasks/ 디렉토리 구조**:
```
.tasks/
└─ {feature_name}_{date}/
   ├─ 01_requirements.md     # EARS 요구사항 (ears-documenter 출력)
   ├─ 02_design.md            # 기술 설계 (design-architect 출력)
   ├─ 03_plan.md              # 작업 계획 (본 스킬 출력)
   ├─ 04_guideline.md         # 코딩 가이드라인 (선택적)
   ├─ progress_log.md         # 진행 상황 로그 (자동 생성)
   └─ final_status_report.md  # 최종 상태 리포트 (완료 시)
```

**03_plan.md 구조**:
```markdown
# 구현 계획: {기능 이름}

## 메타데이터
- **프로젝트**: {프로젝트명}
- **작성일**: YYYY-MM-DD
- **예상 완료**: YYYY-MM-DD
- **담당자**: {이름}
- **관련 요구사항**: {요구사항 문서 링크}
- **설계 문서**: {설계 문서 링크}

## 작업 요약
- **전체 작업**: {총 작업 수}개
- **예상 시간**: {총 예상 시간}시간
- **우선순위 High**: {High 작업 수}개
- **병렬 가능**: {병렬 가능 작업 수}개

## Phase 1: 기본 구조 (Day 1)

### 1.1 데이터 타입 정의
- **파일**: src/types/timeSlot.ts
- **내용**: TimeSlot, SelectionMode 타입 정의
- **방법**: TypeScript interface 및 type 정의
- **완료**: [ ]
- **Requirements**: REQ-F-001, REQ-F-031

### 1.2 상태 관리 설정
- **파일**: src/atoms/timeSlotAtoms.ts
- **내용**: Jotai atoms 정의 (timeSlots, selectedSlots, isLoading)
- **방법**: atom() 함수로 primitive atoms 생성
- **완료**: [ ]
- **Requirements**: REQ-F-001, REQ-F-002, REQ-F-030

...

## Phase 2: UI 컴포넌트 (Day 2-3)

...

## Phase 3: 통합 및 테스트 (Day 4-5)

...

## 진행 상황
- [ ] Phase 1: 기본 구조 (0/5 완료)
- [ ] Phase 2: UI 컴포넌트 (0/8 완료)
- [ ] Phase 3: 통합 및 테스트 (0/4 완료)

**전체 진행률**: 0% (0/17 작업 완료)
```

#### Step 3: 진행 추적
**참조**: `knowledge/progress-tracking.md`, `tools/progress_tracker.sh`

**진행 상황 업데이트 방법**:
```yaml
manual_update:
  - 작업 완료 시 체크박스 체크
  - 완료 날짜 기록 (✓ YYYY-MM-DD 완료)
  - Phase 진행률 업데이트

automatic_tracking:
  - progress_tracker.sh 실행으로 자동 계산
  - 완료율, 남은 시간 추정
  - 진행 상황 그래프 생성
```

**progress_log.md 자동 생성**:
```markdown
# 진행 상황 로그

## 2024-01-15
- ✅ 1.1 데이터 타입 정의 완료
- ✅ 1.2 상태 관리 설정 완료
- 🚧 1.3 API 인터페이스 구현 중
- **진행률**: 15% (3/17 완료)

## 2024-01-16
- ✅ 1.3 API 인터페이스 구현 완료
- ✅ 2.1 TimeSlotItem 컴포넌트 완료
- 🚧 2.2 TimeSlotGrid 컴포넌트 진행 중
- **진행률**: 30% (5/17 완료)
- **이슈**: 드래그 선택 이벤트 처리 복잡도 높음
```

#### Step 4: 최종 보고
**참조**: `knowledge/reporting-templates.md`

프로젝트 완료 시 **final_status_report.md** 생성:
```markdown
# 최종 상태 보고서: {기능 이름}

## 프로젝트 개요
- **시작일**: YYYY-MM-DD
- **완료일**: YYYY-MM-DD
- **실제 소요**: {실제 일수}일 (예상: {예상 일수}일)
- **완료율**: 100% (17/17 작업 완료)

## 요구사항 충족도
| 요구사항 ID | 상태 | 구현 작업 |
|------------|------|----------|
| REQ-F-001 | ✅ 완료 | 1.1, 2.1 |
| REQ-F-010 | ✅ 완료 | 2.2, 3.1 |
| REQ-F-011 | ✅ 완료 | 2.3 |
| REQ-NF-001 | ✅ 완료 | 2.4, 3.2 |

## 예상 vs 실제
| Phase | 예상 시간 | 실제 시간 | 차이 |
|-------|----------|----------|------|
| Phase 1 | 8h | 10h | +2h |
| Phase 2 | 20h | 18h | -2h |
| Phase 3 | 12h | 14h | +2h |
| **합계** | **40h** | **42h** | **+2h** |

## 주요 이슈 및 해결
1. **드래그 선택 성능 이슈**
   - 문제: 100개+ 아이템 드래그 시 버벅임
   - 해결: throttle(16ms) 적용으로 60fps 유지

2. **모바일 터치 이벤트 미지원**
   - 문제: 드래그 라이브러리가 터치 미지원
   - 해결: 별도 터치 이벤트 핸들러 구현

## 학습 내용
- Jotai의 atom composition 패턴 효과적
- react-window 가상 스크롤 필수
- 접근성 테스트는 초기부터 통합 필요

## 다음 개선 사항
- [ ] 드래그 선택 시 시각적 피드백 개선
- [ ] 대량 선택 시 성능 추가 최적화
- [ ] E2E 테스트 커버리지 확대 (현재 70%)
```

### 출력

#### 1. 작업 계획 문서 (03_plan.md)

**5-Field 작업 형식**:
```markdown
### 1.1 데이터 타입 정의
- **파일**: src/types/timeSlot.ts
- **내용**: TimeSlot, SelectionMode 인터페이스 정의
- **방법**: TypeScript interface로 타입 안전성 확보
- **완료**: [ ]  <!-- 완료 시 [x] 및 날짜 기록 -->
- **Requirements**: REQ-F-001, REQ-F-031
```

**작업 구조**:
- Phase로 그룹화 (Phase 1, 2, 3...)
- 각 Phase는 1-3일 소요 목표
- Phase 내에서 작업은 의존성 순서대로 배열
- 병렬 가능 작업은 명시

#### 2. 진행 로그 (progress_log.md)

일별 진행 상황 자동 기록:
```markdown
# 진행 상황 로그

## [2024-01-15] Day 1
### 완료
- ✅ 1.1 데이터 타입 정의 (1.5h)
- ✅ 1.2 상태 관리 설정 (2h)

### 진행 중
- 🚧 1.3 API 인터페이스 구현 (50% 완료)

### 이슈
- 없음

### 진행률
- **Today**: 2/17 완료
- **Cumulative**: 12% 완료
- **Velocity**: 2 작업/일
- **예상 완료**: 2024-01-24 (9일 남음)

---
```

#### 3. 최종 상태 보고서 (final_status_report.md)

프로젝트 완료 시 자동 생성:
```yaml
project_summary:
  name: "시간대 선택 시스템"
  status: "완료"
  start_date: "2024-01-15"
  end_date: "2024-01-25"
  duration_days: 10
  estimated_days: 9
  variance: "+1일"

completion:
  total_tasks: 17
  completed_tasks: 17
  completion_rate: 100%

requirements_coverage:
  functional: 100%
  non_functional: 100%

quality_metrics:
  test_coverage: 85%
  code_review: "통과"
  performance_goals: "달성"
  accessibility: "WCAG 2.1 AA 준수"
```

## Knowledge 파일 역할

### task-decomposition.md
- 설계를 작업으로 분해하는 방법론
- 작업 크기 및 복잡도 추정 가이드
- 의존성 분석 및 병렬화 전략
- 작업 우선순위 결정 방법

### planning-templates.md
- 03_plan.md 템플릿
- Phase 구조 및 작업 분류
- 5-Field 작업 형식
- 진행률 계산 방법

### progress-tracking.md
- 진행 상황 업데이트 프로토콜
- progress_log.md 자동 생성 규칙
- 속도(Velocity) 계산 방법
- 일정 예측 알고리즘

### reporting-templates.md
- final_status_report.md 템플릿
- 예상 vs 실제 비교 분석
- 학습 내용 및 개선 사항 기록
- 프로젝트 메트릭 수집

## Tools 파일 역할

### progress_tracker.sh
진행 상황 자동 계산 스크립트:
```bash
#!/bin/bash
# 03_plan.md에서 완료된 작업 수 계산
# progress_log.md 업데이트
# 예상 완료일 계산
```

### task_validator.sh
작업 계획 검증 스크립트:
```bash
#!/bin/bash
# 모든 작업에 5개 필드 존재 확인
# 요구사항 ID 참조 확인
# 비코딩 작업 탐지
```

## 제약 조건

- 모든 작업은 코딩 활동이어야 함 (회의, 배포 등 제외)
- 작업은 1-4시간 내 완료 가능한 크기
- 모든 작업에 5개 필드 (파일, 내용, 방법, 완료, Requirements) 필수
- 모든 요구사항이 작업으로 커버되어야 함
- 작업 계층은 최대 2단계 (Phase → Task)

## 사용 시나리오

### 시나리오 1: 설계에서 작업 계획 생성
```
입력:
- design-architect 출력 (컴포넌트 설계, API 설계)
- EARS 요구사항 문서

처리:
1. 설계 요소별 작업 추출
2. 의존성 분석 및 Phase 그룹화
3. 각 작업에 예상 시간 할당
4. 요구사항 추적성 확보

출력:
- .tasks/{feature}_{date}/03_plan.md
```

### 시나리오 2: 진행 상황 추적
```
작업 완료 시:
1. 03_plan.md에서 체크박스 체크
2. 완료 날짜 기록 (✓ 2024-01-15 완료)
3. Phase 진행률 업데이트
4. progress_log.md 자동 업데이트

진행률 조회:
- progress_tracker.sh 실행
- 완료율, 남은 시간, Velocity 표시
```

### 시나리오 3: 프로젝트 완료 보고
```
모든 작업 완료 시:
1. final_status_report.md 생성
2. 예상 vs 실제 분석
3. 요구사항 충족도 확인
4. 학습 내용 및 개선 사항 기록
5. 문서 커밋
```

## 통합 워크플로우

이 스킬은 다음 스킬들과 연계됩니다:

1. **입력 단계**:
   - `design-architect` → 기술 설계 제공
   - `ears-documenter` → 요구사항 문서 제공

2. **출력 단계**:
   - 실제 구현 (Claude Code 또는 개발자)
   - 진행 상황 모니터링 및 보고

## 출력 형식

### 표준 출력
```markdown
## 작업 계획 생성 완료

### 생성된 파일
- .tasks/{feature}_{date}/03_plan.md
- .tasks/{feature}_{date}/04_guideline.md (선택적)

### 작업 통계
- 전체 작업: {n}개
- 예상 시간: {h}시간
- Phase 수: {p}개
- 병렬 가능: {m}개 작업

### 다음 단계
1. 04_guideline.md 검토
2. Phase 1 작업 시작
3. 완료 시 체크박스 업데이트
```

## 추가 기능: 지능형 작업 선택 (Intelligent Task Selection)

### Tree of Thoughts (ToT) 기반 작업 선택

실행 엔진과 통합될 때, 이 스킬은 단순 순차 선택을 넘어 ToT 알고리즘을 사용하여 최적의 작업을 선택합니다.

**참조**: `knowledge/task-selection-tot.md`, `knowledge/dependency-analysis.md`

#### 작업 선택 프로세스

**Step 1: 후보 생성 (Candidate Generation)**
```markdown
03_plan.md를 스캔하여 실행 가능한 작업 후보 생성:
- 의존성이 충족된 미완료 작업
- Optional(*) 작업은 기본 제외
- 현재 Phase + 다음 Phase 범위 내
```

**Step 2: 평가 (Evaluation)**
```markdown
각 후보를 다음 기준으로 점수화 (총 100점):

| 기준 | 배점 | 설명 |
|------|------|------|
| 의존성 충족 | 30점 | 모든 선행 작업 완료 여부 |
| 우선순위/영향도 | 25점 | 비즈니스 가치 또는 차단 해제 |
| 복잡도 vs 시간 | 20점 | 가용 시간 내 완료 가능성 |
| Phase 정렬 | 15점 | 현재 Phase 내 작업 우선 |
| 리스크 수준 | 10점 | 실패 시 영향도 |
```

**Step 3: 선택 (Selection)**
```markdown
- 총점이 가장 높은 작업 선택
- 동점 시: 우선순위 > 의존성 > Phase 정렬 순
- Optional 작업은 사용자 명시 요청 시에만 선택
```

**Step 4: Lookahead & Backtrack**
```markdown
Lookahead (다음 단계 예측):
- 선택한 작업 완료 시 다음 가능 작업 파악
- 전체 실행 경로 예상
- 예상 소요 시간 계산

Backtrack Plan (막힘 시 대안):
- 선택한 작업 실패 시 대체 작업 식별
- 복구 비용 추정
- 우회 경로 준비
```

#### Optional 작업(*) 처리 규칙

**자동 스킵 (기본 동작)**:
```markdown
- [ ]* 작업 2.4: 단위 테스트  ← 자동으로 건너뜀
```

**명시 실행 (사용자 요청)**:
```markdown
사용자: "/execute-plan 2.4"
→ Optional이지만 명시적 요청으로 실행
```

**Phase 완료 조건**:
```markdown
Phase 완료 = 모든 required 작업([x]) 완료
Optional 작업(*) 미완료여도 Phase 완료 가능
```

#### 의존성 분석

**참조**: `knowledge/dependency-analysis.md`

**의존성 유형**:
1. **순차 의존성**: 작업 A → 작업 B (A 완료 필수)
2. **Phase 의존성**: Phase N → Phase N+1 (Phase 완료 필수)
3. **파일 의존성**: 타입 정의 → 컴포넌트 (파일 생성 순서)

**병렬화 판단**:
```markdown
독립 작업 감지:
- 다른 파일 수정
- 의존성 없음
- 동일 Phase 내

→ 병렬 실행 가능 태그
→ 실행 시간 단축 기회
```

### Tools 추가

#### task_selector.sh
ToT 알고리즘 기반 작업 선택 자동화:
```bash
#!/bin/bash
# 사용법: task_selector.sh .tasks/feature_20250117/03_plan.md

# 1. 후보 생성
# 2. 점수 계산
# 3. 최적 작업 선택
# 4. 출력: 작업 ID 및 상세 정보
```

---

> **Best Practice**: 작업 완료 시마다 즉시 체크박스 업데이트
> **Integration**: design-architect에서 입력, execution-engine으로 전달

---

## 에러 처리

```yaml
error_handling:
  severity_high:
    conditions:
      - 설계 문서 없음 (02_design.md 누락)
      - EARS 요구사항 없음 (01_requirements.md 누락)
      - 순환 의존성 감지 (작업 간)
      - 프로젝트 구조 파일 없음 (.project-structure.yaml)
      - 작업 계획 파싱 실패 (03_plan.md 구조 오류)
    action: |
      ❌ 치명적 오류 - 작업 계획 생성 중단
      → 설계 문서 확인: ls .tasks/{feature}_{date}/02_design.md
      → 요구사항 확인: ls .tasks/{feature}_{date}/01_requirements.md
      → 순환 의존성 해결: 작업 의존성 재검토
      → 재실행: 필수 문서 생성 후 재시도
    examples:
      - condition: "설계 문서 없음"
        message: "❌ 오류: 설계 문서를 찾을 수 없습니다: 02_design.md"
        recovery: "design-architect 실행하여 설계 문서 생성"
      - condition: "순환 의존성"
        message: "❌ 오류: 작업 1.2 → 1.3 → 1.2 순환 의존성 감지"
        recovery: "작업 의존성 재설계 또는 제거"

  severity_medium:
    conditions:
      - 일부 요구사항이 작업으로 커버 안 됨
      - 작업 예상 시간 계산 실패
      - Phase 분류 모호
      - 병렬 실행 가능 작업 감지 실패
      - progress_log.md 업데이트 실패
    action: |
      ⚠️  경고 - 부분 작업 계획 생성
      1. 커버 안 된 요구사항을 "추가 작업 필요" 표시
      2. 예상 시간을 기본값(4h)으로 설정
      3. Phase를 단일 Phase로 통합
      4. 병렬 실행 표시 생략
      5. 계획에 경고 추가:
         > ⚠️  WARNING: 일부 정보 불완전
         > → {missing_information}
    fallback_values:
      estimated_time: "4h"
      phase_count: 1
      parallel_possible: false
    examples:
      - condition: "작업 시간 계산 실패"
        message: "⚠️  경고: 작업 2.3 예상 시간 계산 실패"
        fallback: "기본 4시간으로 설정 → 수동 조정 권장"
      - condition: "요구사항 미커버"
        message: "⚠️  경고: REQ-F-005 요구사항이 작업에 없음"
        fallback: "추가 작업 필요 표시 → 수동 작업 추가"

  severity_low:
    conditions:
      - 선택적 가이드라인 없음 (04_guideline.md)
      - 작업 설명 누락 (일부)
      - Phase 이름 자동 생성
      - 진행률 계산 경고
    action: |
      ℹ️  정보: 선택적 항목 생략 - 핵심 작업 계획 생성
      → 가이드라인: 생략 가능
      → 작업 설명: 최소 정보로 진행
      → Phase 이름: 자동 생성 (Phase 1, 2, 3)
      → 진행률: 수동 업데이트
    examples:
      - condition: "가이드라인 없음"
        auto_handling: "04_guideline.md 생략 → 표준 가이드라인 사용"
      - condition: "Phase 이름 자동"
        auto_handling: "Phase 이름 누락 → 'Phase 1', 'Phase 2'로 자동 생성"
```
