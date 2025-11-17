# 요구사항 품질 검증 체크리스트

## 개요

요구사항 문서의 품질을 보장하기 위한 체계적인 검증 절차입니다.

## 1. 명확성 (Clarity) 검증

### 1.1 모호성 제거

**모호한 표현 탐지**:
```yaml
forbidden_terms:
  vague_quantity:
    - "적절한" (adequate)
    - "충분한" (sufficient)
    - "합리적인" (reasonable)
    - "가능한" (possible)
    - "일반적으로" (generally)
    - "대략" (approximately)
    - "최대한" (as much as possible)

  vague_quality:
    - "빠른" (fast)
    - "느린" (slow)
    - "좋은" (good)
    - "나쁜" (bad)
    - "쉬운" (easy)
    - "어려운" (difficult)

  vague_action:
    - "처리하다" (handle)
    - "관리하다" (manage)
    - "지원하다" (support)
    - "최적화하다" (optimize)
```

**검증 방법**:
```bash
# 모호한 표현 자동 탐지
grep -E "(적절한|충분한|합리적인|가능한|일반적으로|빠른|느린)" requirements.md

# 측정 가능한 기준 확인
grep -E "[0-9]+(ms|MB|%|초|분)" requirements.md
```

**개선 예시**:
```
❌ Bad: "시스템은 빠르게 응답해야 한다"
✅ Good: "시스템은 사용자 입력에 100ms 이내에 응답해야 한다"

❌ Bad: "적절한 성능을 제공해야 한다"
✅ Good: "100개 시간대를 500ms 이내에 렌더링해야 한다"

❌ Bad: "충분한 보안을 제공해야 한다"
✅ Good: "OWASP Top 10 취약점에 대한 방어 기능을 제공해야 한다"
```

### 1.2 측정 가능성 확보

**측정 기준 체크리스트**:
- [ ] 숫자와 단위 사용 (ms, MB, %, 개)
- [ ] 객관적 기준 적용 (WCAG 레벨, 표준 준수)
- [ ] 범위 명시 (최소-최대, 평균, 백분위)
- [ ] 조건 명확 (입력 크기, 환경, 상태)

**측정 가능한 요구사항 예시**:
```
성능:
✅ "시스템은 1000개 아이템을 1초 이내에 렌더링해야 한다"
✅ "API 응답 시간은 95th percentile 기준 200ms 이하여야 한다"

사용성:
✅ "시스템은 WCAG 2.1 AA 기준을 100% 충족해야 한다"
✅ "사용자는 5분 이내에 기본 기능을 습득할 수 있어야 한다"

호환성:
✅ "시스템은 Chrome 90+, Firefox 88+, Safari 14+에서 동작해야 한다"
✅ "시스템은 320px~1920px 화면 너비를 지원해야 한다"
```

## 2. 완전성 (Completeness) 검증

### 2.1 EARS 패턴 커버리지

**필수 패턴 체크**:
- [ ] Ubiquitous: 기본 기능 정의
- [ ] Event-Driven: 사용자 인터랙션 정의
- [ ] Unwanted: 에러 처리 정의
- [ ] State-Driven: 상태 기반 동작 정의
- [ ] Optional: 선택적 기능 정의

**커버리지 계산**:
```python
def calculate_ears_coverage(requirements):
    patterns = {
        'ubiquitous': 0,
        'event_driven': 0,
        'unwanted': 0,
        'state_driven': 0,
        'optional': 0
    }

    for req in requirements:
        if 'WHEN' in req: patterns['event_driven'] += 1
        elif 'IF' in req: patterns['unwanted'] += 1
        elif 'WHILE' in req: patterns['state_driven'] += 1
        elif 'WHERE' in req: patterns['optional'] += 1
        else: patterns['ubiquitous'] += 1

    total = sum(patterns.values())
    coverage = {k: v/total*100 for k, v in patterns.items()}

    return coverage

# 경고: 특정 패턴이 0%인 경우
# 예: unwanted=0 → 에러 처리 요구사항 누락 가능성
```

### 2.2 기능적/비기능적 균형

**권장 비율**:
```yaml
functional_requirements: 60-70%
non_functional_requirements: 30-40%

non_functional_breakdown:
  performance: 30-40%
  usability: 20-30%
  compatibility: 15-25%
  maintainability: 10-20%
  security: 10-20%
```

**누락 확인**:
- [ ] 성능 요구사항 (응답 시간, 처리량, 리소스)
- [ ] 사용성 요구사항 (접근성, 학습 곡선)
- [ ] 호환성 요구사항 (브라우저, 디바이스)
- [ ] 유지보수성 요구사항 (코드 품질, 테스트)
- [ ] 보안 요구사항 (인증, 데이터 보호)

### 2.3 시나리오 커버리지

**주요 시나리오 체크**:
- [ ] 정상 경로 (Happy Path)
- [ ] 대안 경로 (Alternative Path)
- [ ] 예외 경로 (Exception Path)
- [ ] 경계 조건 (Boundary Conditions)
- [ ] 에러 복구 (Error Recovery)

**시나리오 매트릭스**:
```
| 시나리오 | 요구사항 ID | 커버 여부 |
|---------|------------|----------|
| 사용자가 시간대 선택 | REQ-F-010 | ✅ |
| 시간대 선택 없이 저장 시도 | REQ-F-020 | ✅ |
| 50개 이상 선택 시도 | REQ-F-021 | ✅ |
| 네트워크 오류 발생 | REQ-F-022 | ✅ |
| 로딩 중 상태 | REQ-F-030 | ✅ |
| 키보드 네비게이션 | REQ-F-040 | ✅ |
```

## 3. 일관성 (Consistency) 검증

### 3.1 용어 통일

**용어 사전 관리**:
```yaml
term_dictionary:
  preferred_terms:
    time_slot: "시간대" # NOT "타임슬롯", "시간 블록"
    user: "사용자" # NOT "유저", "고객"
    system: "시스템" # NOT "애플리케이션", "앱"

  forbidden_synonyms:
    - ["선택", "체크", "클릭"] # 통일: "선택"
    - ["저장", "세이브", "보관"] # 통일: "저장"
    - ["표시", "디스플레이", "보여주기"] # 통일: "표시"
```

**검증 스크립트**:
```bash
# 동일 개념에 대한 다른 용어 탐지
grep -E "(타임슬롯|시간 블록)" requirements.md  # 용어 불일치 확인
grep -E "(유저|고객)" requirements.md           # 용어 불일치 확인
```

### 3.2 형식 일관성

**EARS 형식 검증**:
```python
def validate_ears_format(requirement):
    errors = []

    # Ubiquitous 검증
    if not any(keyword in requirement for keyword in ['WHEN', 'IF', 'WHILE', 'WHERE']):
        if not requirement.startswith('The '):
            errors.append('Ubiquitous 요구사항은 "The"로 시작해야 함')
        if ' shall ' not in requirement:
            errors.append('Ubiquitous 요구사항은 "shall"을 포함해야 함')

    # Event-Driven 검증
    if 'WHEN' in requirement:
        if 'THEN' not in requirement:
            errors.append('Event-Driven 요구사항은 WHEN-THEN 구조여야 함')

    # Unwanted 검증
    if 'IF' in requirement:
        if 'THEN' not in requirement:
            errors.append('Unwanted 요구사항은 IF-THEN 구조여야 함')

    return errors
```

### 3.3 ID 체계 일관성

**ID 형식 검증**:
```regex
# 올바른 형식
^REQ-(F|NF)(-[A-Z]+)?-[0-9]{3}$

예시:
REQ-F-001       ✅
REQ-F-UI-001    ✅
REQ-NF-PERF-001 ✅
REQ-001         ❌ (타입 누락)
REQ-F-1         ❌ (번호 형식 오류)
```

## 4. 검증 가능성 (Verifiability) 검증

### 4.1 테스트 가능성

**각 요구사항은 다음 질문에 답할 수 있어야 함**:
- [ ] "어떻게 테스트할 것인가?"
- [ ] "합격 기준은 무엇인가?"
- [ ] "측정 도구는 무엇인가?"

**테스트 방법 매핑**:
```yaml
requirement_types:
  functional:
    ubiquitous:
      test_methods: ["Unit Test", "Integration Test"]
      tools: ["Jest", "Vitest"]

    event_driven:
      test_methods: ["E2E Test", "User Interaction Test"]
      tools: ["Playwright", "Cypress"]

    unwanted:
      test_methods: ["Error Scenario Test", "Exception Handling Test"]
      tools: ["Jest", "Custom Error Simulator"]

  non_functional:
    performance:
      test_methods: ["Performance Test", "Load Test"]
      tools: ["Lighthouse", "Web Vitals", "k6"]

    accessibility:
      test_methods: ["Accessibility Test"]
      tools: ["axe-core", "WAVE", "Lighthouse"]
```

### 4.2 합격 기준 명확성

**합격 기준 체크리스트**:
- [ ] 정량적 기준 (숫자, 백분율)
- [ ] 측정 도구 명시
- [ ] 측정 환경 정의
- [ ] 허용 오차 범위

**예시**:
```
❌ Bad: "시스템은 빠르게 동작해야 한다"
  → 테스트 불가 (기준 없음)

✅ Good: "시스템은 100개 아이템을 500ms 이내에 렌더링해야 한다"
  → 테스트 방법: Performance.now() 측정
  → 합격 기준: 렌더링 시간 ≤ 500ms
  → 측정 환경: Chrome DevTools Performance tab
```

## 5. 추적 가능성 (Traceability) 검증

### 5.1 요구사항 ID 부여

**ID 부여 체크**:
- [ ] 모든 요구사항에 고유 ID 부여
- [ ] ID 형식 일관성 유지
- [ ] ID 순서 논리적 (기능 그룹별)

### 5.2 상호 참조 완전성

**추적 매트릭스 검증**:
```python
def validate_traceability(requirements, designs, tests):
    # 전방 추적: 모든 요구사항이 설계와 테스트로 연결
    orphan_requirements = []
    for req in requirements:
        if req.id not in designs and req.id not in tests:
            orphan_requirements.append(req.id)

    # 후방 추적: 모든 테스트가 요구사항에 연결
    orphan_tests = []
    for test in tests:
        if test.requirement_id not in requirements:
            orphan_tests.append(test.id)

    return {
        'orphan_requirements': orphan_requirements,  # 고아 요구사항
        'orphan_tests': orphan_tests,                # 고아 테스트
        'coverage': len(requirements - len(orphan_requirements)) / len(requirements) * 100
    }
```

### 5.3 의존성 명시

**의존성 관계 체크**:
- [ ] 선행 요구사항 명시
- [ ] 상호 의존 요구사항 식별
- [ ] 순환 의존 제거

**의존성 형식**:
```
REQ-F-011: WHEN a user drags across time slots...
  전제조건: REQ-F-001 (시간대 표시 기능)
  의존: REQ-F-010 (단일 선택 기능)
```

## 6. 중복 및 충돌 검증

### 6.1 중복 탐지

**중복 패턴**:
```yaml
duplicate_patterns:
  semantic_duplication:
    - ["사용자가 버튼을 클릭하면", "버튼 클릭 시"]
    - ["시스템은 표시해야 한다", "시스템은 보여줘야 한다"]

  functional_duplication:
    - REQ-F-010과 REQ-F-015가 동일한 기능 기술
    - REQ-NF-001과 REQ-NF-005가 동일한 성능 요구
```

**중복 제거 전략**:
1. 의미적 중복: 하나로 통합
2. 레벨 차이: 상위 요구사항으로 추상화
3. 관점 차이: 각각 유지하되 상호 참조

### 6.2 충돌 탐지

**충돌 유형**:
```yaml
conflict_patterns:
  logical_conflict:
    - "REQ-F-001: 모든 시간대 표시"
      "REQ-F-002: 선택된 시간대만 표시"

  performance_conflict:
    - "REQ-NF-001: 1초 이내 렌더링"
      "REQ-F-050: 1000개 아이템 표시"
      # 충돌 가능성: 성능 목표와 데이터 양 불일치

  priority_conflict:
    - "REQ-F-010 (High): 드래그 선택"
      "REQ-F-020 (High): 키보드 선택"
      # 충돌: 우선순위 동일하나 리소스 제약
```

**충돌 해결 절차**:
1. 충돌 식별 및 문서화
2. 이해관계자 논의
3. 우선순위 재조정 또는 요구사항 수정
4. 해결 내역 변경 이력에 기록

## 7. 자동화 검증 스크립트

### 7.1 모호성 검증

```python
def check_ambiguity(requirement_text):
    forbidden_terms = [
        "적절한", "충분한", "합리적인", "가능한",
        "빠른", "느린", "좋은", "나쁜"
    ]

    found_terms = []
    for term in forbidden_terms:
        if term in requirement_text:
            found_terms.append(term)

    if found_terms:
        return {
            'status': 'FAIL',
            'message': f'모호한 표현 발견: {", ".join(found_terms)}',
            'suggestion': '측정 가능한 기준으로 대체하세요'
        }

    return {'status': 'PASS'}
```

### 7.2 EARS 형식 검증

```python
def validate_ears_format(requirement):
    # WHEN 패턴
    if 'WHEN' in requirement:
        if 'THEN' not in requirement:
            return {'status': 'FAIL', 'message': 'WHEN은 THEN과 함께 사용'}
        if not requirement.startswith('WHEN'):
            return {'status': 'WARNING', 'message': 'WHEN은 문장 시작에 위치 권장'}

    # IF 패턴
    if 'IF' in requirement:
        if 'THEN' not in requirement:
            return {'status': 'FAIL', 'message': 'IF는 THEN과 함께 사용'}

    # WHILE 패턴
    if 'WHILE' in requirement:
        if not requirement.startswith('WHILE'):
            return {'status': 'WARNING', 'message': 'WHILE은 문장 시작에 위치 권장'}

    return {'status': 'PASS'}
```

### 7.3 추적성 검증

```python
def verify_traceability(requirements_doc, design_doc, test_doc):
    req_ids = extract_requirement_ids(requirements_doc)
    design_refs = extract_design_references(design_doc)
    test_refs = extract_test_references(test_doc)

    # 전방 추적
    orphan_reqs = [r for r in req_ids if r not in design_refs and r not in test_refs]

    # 후방 추적
    orphan_tests = [t for t in test_refs if t.requirement_id not in req_ids]

    coverage = (len(req_ids) - len(orphan_reqs)) / len(req_ids) * 100

    return {
        'coverage': coverage,
        'orphan_requirements': orphan_reqs,
        'orphan_tests': orphan_tests,
        'status': 'PASS' if coverage == 100 else 'FAIL'
    }
```

## 8. 품질 메트릭

### 8.1 품질 점수 계산

```yaml
quality_scoring:
  clarity: 25점
    - 모호성 제거: 10점
    - 측정 가능성: 10점
    - 명확한 조건: 5점

  completeness: 25점
    - EARS 패턴 커버리지: 10점
    - 기능/비기능 균형: 10점
    - 시나리오 커버리지: 5점

  consistency: 20점
    - 용어 통일: 7점
    - 형식 일관성: 7점
    - ID 체계: 6점

  verifiability: 20점
    - 테스트 가능성: 10점
    - 합격 기준: 10점

  traceability: 10점
    - 추적 매트릭스: 5점
    - 의존성 명시: 5점

total_quality_score: 100점
```

### 8.2 합격 기준

```yaml
quality_gates:
  excellent: ≥ 90점
  good: 80-89점
  acceptable: 70-79점
  needs_improvement: 60-69점
  unacceptable: < 60점

minimum_passing_score: 70점
```

---

> **자동화 권장**: 품질 검증은 CI/CD 파이프라인에 통합하여 자동화
> **지속적 개선**: 품질 메트릭을 추적하여 요구사항 작성 프로세스 개선
