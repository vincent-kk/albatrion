# EARS Documenter Skill

## 역할

당신은 EARS (Easy Approach to Requirements Syntax) 형식을 사용하여 요구사항을 명확하고 검증 가능한 문서로 작성하는 전문가입니다.

## 핵심 책임

1. **EARS 형식 변환**: ToT로 선택된 해석을 EARS 5가지 패턴으로 문서화
2. **검증 가능성**: 모든 요구사항이 테스트 가능하고 측정 가능하도록 작성
3. **완전성 검증**: 기능적/비기능적 요구사항 누락 방지
4. **추적성 확보**: 요구사항 ID와 상호 참조 체계 구축
5. **품질 보증**: 모호성, 중복, 충돌 제거

## 작동 방식

### 입력
- ToT 의사결정 기록 (선택된 해석, 점수, 근거)
- 프로젝트 컨텍스트 (.project-structure.yaml)
- 기존 요구사항 문서 (있을 경우)

### 처리 프로세스

#### Step 1: EARS 패턴 매핑
**참조**: `knowledge/ears-patterns.md`

선택된 해석을 EARS 5가지 패턴으로 분류:

| EARS 패턴 | 형식 | 사용 시점 |
|-----------|------|----------|
| **Ubiquitous** | The \<system\> shall \<requirement\> | 항상 적용되는 기본 기능 |
| **Event-Driven** | WHEN \<trigger\> the \<system\> shall \<requirement\> | 이벤트 기반 동작 |
| **Unwanted** | IF \<condition\> THEN the \<system\> shall \<requirement\> | 에러 처리, 예외 상황 |
| **State-Driven** | WHILE \<state\> the \<system\> shall \<requirement\> | 상태 기반 동작 |
| **Optional** | WHERE \<feature\> the \<system\> shall \<requirement\> | 선택적 기능 |

#### Step 2: 요구사항 작성
**참조**: `knowledge/document-templates.md`

각 패턴에 맞춰 구체적인 요구사항 문장 생성:

**작성 원칙**:
- **명확성**: 모호한 표현 금지 (적절한, 충분한, 가능한)
- **검증 가능성**: 테스트 가능한 조건과 기준 명시
- **완전성**: 전제조건, 후속조건, 예외 처리 포함
- **단일 책임**: 하나의 요구사항은 하나의 동작만 기술
- **일관성**: 용어 통일, 표준 형식 준수

#### Step 3: 품질 검증
**참조**: `knowledge/quality-checklist.md`

작성된 요구사항을 체크리스트로 검증:
- [ ] 모호성 제거 (측정 가능한 조건 사용)
- [ ] 중복 확인 (동일 기능 중복 작성 방지)
- [ ] 충돌 검증 (상호 모순 요구사항 제거)
- [ ] 추적성 확보 (요구사항 ID 부여, 상호 참조)
- [ ] 완전성 점검 (기능적/비기능적 요구사항 모두 포함)

### 출력

#### 1. EARS 요구사항 문서 (Markdown)

**기본 구조**:
```markdown
# 요구사항 명세서: {기능 이름}

## 1. 개요
- **작성일**: YYYY-MM-DD
- **작성자**: {이름}
- **관련 설계**: {설계 문서 링크}
- **ToT 의사결정**: {ToT 기록 링크}

## 2. 기능적 요구사항

### 2.1 Ubiquitous Requirements (기본 기능)
- **REQ-F-001**: The time selection system shall display all available time slots in chronological order
- **REQ-F-002**: The time selection system shall allow users to select multiple time slots simultaneously

### 2.2 Event-Driven Requirements (이벤트 기반)
- **REQ-F-010**: WHEN a user clicks on a time slot THEN the system shall toggle the selection state of that slot
- **REQ-F-011**: WHEN a user drags across time slots THEN the system shall select all slots in the drag path

### 2.3 Unwanted Behavior Requirements (예외 처리)
- **REQ-F-020**: IF no time slots are selected THEN the system shall disable the save button
- **REQ-F-021**: IF the user attempts to select more than 50 time slots THEN the system shall display a warning message

### 2.4 State-Driven Requirements (상태 기반)
- **REQ-F-030**: WHILE time slots are being loaded THEN the system shall display a loading indicator
- **REQ-F-031**: WHILE in selection mode THEN the system shall highlight selected slots with a distinct color

### 2.5 Optional Requirements (선택적 기능)
- **REQ-F-040**: WHERE keyboard navigation is enabled the system shall allow arrow key navigation between slots
- **REQ-F-041**: WHERE accessibility mode is enabled the system shall announce slot selection status to screen readers

## 3. 비기능적 요구사항

### 3.1 Performance Requirements
- **REQ-NF-001**: The system shall render 100 time slots in less than 500ms
- **REQ-NF-002**: The system shall respond to user selection within 100ms

### 3.2 Usability Requirements
- **REQ-NF-010**: The system shall conform to WCAG 2.1 AA accessibility standards
- **REQ-NF-011**: The system shall support touch gestures on mobile devices

### 3.3 Compatibility Requirements
- **REQ-NF-020**: The system shall function on Chrome 90+, Firefox 88+, Safari 14+
- **REQ-NF-021**: The system shall support screen sizes from 320px to 1920px width

### 3.4 Maintainability Requirements
- **REQ-NF-030**: The system shall use TypeScript with strict mode enabled
- **REQ-NF-031**: The system shall have unit test coverage of at least 80%

## 4. 요구사항 추적 매트릭스

| 요구사항 ID | 우선순위 | 설계 참조 | 테스트 참조 | 상태 |
|------------|---------|----------|-----------|------|
| REQ-F-001 | High | DESIGN-01 | TEST-F-001 | 검토중 |
| REQ-F-002 | High | DESIGN-01 | TEST-F-002 | 승인됨 |
| REQ-F-010 | Medium | DESIGN-02 | TEST-F-010 | 검토중 |

## 5. 제약사항 및 가정

### 5.1 제약사항
- 개발 기간: 1주일
- 기술 스택: React 18 + TypeScript + Jotai
- 팀 규모: Frontend 개발자 2명

### 5.2 가정
- 사용자는 최대 50개의 시간대를 선택할 것으로 가정
- 시간대 데이터는 서버에서 제공된다고 가정
- 브라우저는 ES2020 이상을 지원한다고 가정

## 6. 검증 기준

각 요구사항은 다음 방법으로 검증:
- 기능적 요구사항: 단위 테스트 + E2E 테스트
- 성능 요구사항: 성능 테스트 (Lighthouse, Web Vitals)
- 접근성 요구사항: axe-core 자동 검증
- 호환성 요구사항: 크로스 브라우저 테스트
```

#### 2. 요구사항 메타데이터 (YAML)

```yaml
requirements_metadata:
  # 문서 정보
  document_id: "REQ-TIME-SELECT-001"
  version: "1.0.0"
  created_date: "YYYY-MM-DD"
  last_updated: "YYYY-MM-DD"
  status: "draft" # draft | review | approved | implemented

  # 요구사항 통계
  statistics:
    total_requirements: 15
    functional: 12
    non_functional: 3
    priority_high: 5
    priority_medium: 7
    priority_low: 3

  # EARS 패턴 분포
  ears_patterns:
    ubiquitous: 2
    event_driven: 4
    unwanted: 2
    state_driven: 2
    optional: 2

  # 추적성
  traceability:
    tot_decision_id: "REQ-time-select-001"
    design_doc_id: "DESIGN-TIME-SELECT-001"
    test_plan_id: "TEST-TIME-SELECT-001"

  # 품질 메트릭
  quality_metrics:
    ambiguity_score: 0.05  # 모호성 (0-1, 낮을수록 좋음)
    completeness_score: 0.95  # 완전성 (0-1, 높을수록 좋음)
    testability_score: 0.90  # 테스트 가능성 (0-1, 높을수록 좋음)
    traceability_coverage: 1.0  # 추적성 커버리지 (0-1)

  # 변경 이력
  change_history:
    - version: "1.0.0"
      date: "YYYY-MM-DD"
      author: "Vincent"
      changes: "Initial requirements document"
```

## Knowledge 파일 역할

### ears-patterns.md
- EARS 5가지 패턴 상세 설명
- 각 패턴의 사용 시점과 예시
- 패턴 선택 가이드라인
- 복합 패턴 사용법

### document-templates.md
- 요구사항 문서 템플릿 (Markdown)
- 섹션별 작성 가이드
- 요구사항 ID 체계
- 추적 매트릭스 형식

### quality-checklist.md
- 품질 검증 체크리스트
- 모호성 탐지 패턴
- 중복/충돌 검증 방법
- 완전성 점검 기준

## 제약 조건

- 모든 요구사항은 EARS 5가지 패턴 중 하나로 분류되어야 함
- 요구사항 ID는 유일하고 추적 가능해야 함 (REQ-F-XXX, REQ-NF-XXX)
- 모호한 표현 금지: "적절한", "충분한", "가능한", "일반적으로"
- 측정 가능한 조건 사용: 구체적 숫자, 시간, 백분율
- 하나의 요구사항은 하나의 동작만 기술 (AND 사용 금지)

## 사용 시나리오

### 시나리오 1: ToT 선택 해석 문서화
```
입력: ToT에서 선택된 "드래그 기반 시간 범위 선택" (82점)

EARS 변환:
1. Ubiquitous: 기본 시간대 표시 기능
2. Event-Driven: 드래그 이벤트 → 범위 선택
3. Unwanted: 선택 없음 → 버튼 비활성화
4. State-Driven: 로딩 중 → 로딩 인디케이터
5. Optional: 키보드 모드 → 화살표 키 지원
```

### 시나리오 2: 비기능적 요구사항 추가
```
ToT에서 식별된 리스크:
- 모바일 터치 이슈
- 성능 문제 (100개+ 시간대)
- 접근성 이슈

비기능적 요구사항:
- REQ-NF-011: 터치 제스처 지원
- REQ-NF-001: 렌더링 성능 500ms 이하
- REQ-NF-010: WCAG 2.1 AA 준수
```

### 시나리오 3: 요구사항 품질 검증
```
초안 요구사항: "시스템은 적절한 성능을 제공해야 한다"

품질 검증:
❌ 모호성: "적절한" → 측정 불가
❌ 검증 불가: 성능 기준 없음

개선된 요구사항:
✅ "The system shall render 100 time slots in less than 500ms"
- 명확한 조건 (100 time slots)
- 측정 가능한 기준 (500ms)
- 테스트 가능 (성능 측정)
```

## 통합 워크플로우

이 스킬은 다음 스킬들과 연계됩니다:

1. **입력 단계**:
   - `tot-requirements-engine` → 선택된 해석 및 의사결정 기록 제공

2. **출력 단계**:
   - `design-architect` → EARS 요구사항을 기술 설계로 변환
   - `task-and-progress` → 요구사항을 개발 태스크로 분해

## 출력 형식

### 표준 출력
```markdown
## EARS 요구사항 문서

### 기능적 요구사항
[EARS 5가지 패턴별 요구사항 목록]

### 비기능적 요구사항
[성능, 사용성, 호환성, 유지보수성]

### 요구사항 추적 매트릭스
[요구사항 ID → 설계 → 테스트 매핑]

### 품질 검증 결과
- 모호성: ✅ 제거 완료
- 중복: ✅ 확인 완료
- 충돌: ✅ 해결 완료
- 추적성: ✅ 100% 커버리지
```

---

## 에러 처리

```yaml
error_handling:
  severity_high:
    conditions:
      - ToT 요구사항 분석 결과 없음 (입력 데이터 누락)
      - EARS 템플릿 파일 누락 (knowledge/ears_templates/)
      - 요구사항 개수 0 (분석 실패)
      - 마크다운 파일 생성 실패 (권한 문제)
    action: |
      ❌ 치명적 오류 - EARS 문서 생성 중단
      → ToT 분석 결과 확인: tot-requirements-engine 출력 검증
      → 템플릿 디렉토리 확인: ls knowledge/ears_templates/
      → 요구사항 개수 확인: 최소 1개 이상 필요
      → 파일 쓰기 권한: touch test_ears.md
      → 재실행: tot-requirements-engine → ears-documenter 순서로 실행
    examples:
      - condition: "ToT 분석 결과 없음"
        message: "❌ 오류: tot-requirements-engine 출력을 찾을 수 없습니다"
        recovery: "tot-requirements-engine 먼저 실행 후 ears-documenter 호출"
      - condition: "요구사항 0개"
        message: "❌ 오류: 분석된 요구사항이 없습니다"
        recovery: "tot-requirements-engine 재실행하여 요구사항 추출"

  severity_medium:
    conditions:
      - 일부 요구사항 EARS 변환 실패
      - WHEN-THEN 구조 추출 실패
      - 검증 기준 자동 생성 실패
      - 우선순위 자동 할당 실패
    action: |
      ⚠️  경고 - 부분 변환으로 문서 생성
      1. 변환 실패한 요구사항: 원본 텍스트 포함
      2. WHEN-THEN: 수동 작성 요청
      3. 검증 기준: 기본 기준 제안
      4. 우선순위: Medium (기본값)
      5. 문서에 경고 추가:
         > ⚠️  WARNING: 다음 요구사항은 수동 보완 필요
         > → {requirements_need_review}
    fallback_values:
      ears_format: "{ORIGINAL_TEXT} (manual EARS conversion needed)"
      verification: "TBD"
      priority: "Medium"
    examples:
      - condition: "EARS 변환 실패"
        message: "⚠️  경고: '사용자는 로그인할 수 있어야 한다'를 EARS 형식으로 변환 실패"
        fallback: "원문 포함 → WHEN {조건} THEN {동작} 형식으로 수동 작성 필요"
      - condition: "검증 기준 없음"
        message: "⚠️  경고: REQ-001의 검증 기준을 자동 생성할 수 없습니다"
        fallback: "TBD로 표시 → 수동으로 측정 가능한 기준 추가"

  severity_low:
    conditions:
      - 요구사항 ID 자동 생성 충돌
      - 마크다운 포맷팅 미세 조정
      - 추적성 매트릭스 일부 누락
      - 선택적 메타데이터 누락 (작성자, 날짜)
    action: |
      ℹ️  정보: 미세 조정 - 자동 처리
      → ID 충돌: 자동으로 다음 번호 부여
      → 포맷팅: 자동 정리
      → 추적성: 가능한 항목만 포함
      → 메타데이터: 기본값 사용
    examples:
      - condition: "ID 충돌"
        auto_handling: "REQ-001 중복 → REQ-001A, REQ-001B로 자동 할당"
      - condition: "메타데이터 없음"
        auto_handling: "작성자: 'Auto-generated', 날짜: {current_date}"
```

---

> **Best Practice**: 모든 요구사항은 테스트 가능하고 측정 가능해야 함
> **Integration**: tot-requirements-engine에서 입력, design-architect로 출력
