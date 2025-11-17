# 요구사항 문서 템플릿

## 표준 문서 구조

### 기본 템플릿 (Markdown)

```markdown
# 요구사항 명세서: {기능 이름}

## 문서 정보

| 항목 | 내용 |
|------|------|
| **문서 ID** | REQ-{FEATURE}-{VERSION} |
| **작성일** | YYYY-MM-DD |
| **최종 수정일** | YYYY-MM-DD |
| **작성자** | {이름} |
| **상태** | Draft / Review / Approved / Implemented |
| **관련 문서** | - ToT 의사결정: {링크}<br>- 설계 문서: {링크}<br>- 테스트 계획: {링크} |

## 1. 개요

### 1.1 목적
{이 기능의 목적과 해결하려는 문제}

### 1.2 범위
{기능의 범위, 포함되는 것과 제외되는 것}

### 1.3 정의 및 용어
| 용어 | 정의 |
|------|------|
| {용어1} | {정의1} |
| {용어2} | {정의2} |

### 1.4 참조 문서
- ToT 의사결정 기록: {링크}
- 프로젝트 구조: .project-structure.yaml
- 관련 요구사항: {링크}

---

## 2. 기능적 요구사항

### 2.1 Ubiquitous Requirements (기본 기능)

**기능 그룹**: {기능 그룹 이름}

| 요구사항 ID | 요구사항 | 우선순위 | 검증 방법 |
|------------|----------|---------|----------|
| REQ-F-001 | The {system} shall {requirement} | High | Unit Test |
| REQ-F-002 | The {system} shall {requirement} | High | E2E Test |

**상세 설명**:
- **REQ-F-001**: {추가 설명, 전제조건, 후속조건}
- **REQ-F-002**: {추가 설명, 전제조건, 후속조건}

### 2.2 Event-Driven Requirements (이벤트 기반)

**기능 그룹**: {기능 그룹 이름}

| 요구사항 ID | 요구사항 | 우선순위 | 검증 방법 |
|------------|----------|---------|----------|
| REQ-F-010 | WHEN {trigger} the {system} shall {requirement} | Medium | Integration Test |
| REQ-F-011 | WHEN {trigger} the {system} shall {requirement} | Medium | E2E Test |

**상세 설명**:
- **REQ-F-010**:
  - 트리거: {트리거 상세 설명}
  - 전제조건: {전제조건}
  - 응답 동작: {응답 설명}
  - 후속조건: {후속조건}

### 2.3 Unwanted Behavior Requirements (예외 처리)

**기능 그룹**: {기능 그룹 이름}

| 요구사항 ID | 요구사항 | 우선순위 | 검증 방법 |
|------------|----------|---------|----------|
| REQ-F-020 | IF {condition} THEN the {system} shall {requirement} | High | Unit Test |
| REQ-F-021 | IF {condition} THEN the {system} shall {requirement} | Medium | Integration Test |

**에러 처리 시나리오**:
- **REQ-F-020**: {에러 시나리오, 복구 절차, 사용자 피드백}
- **REQ-F-021**: {에러 시나리오, 복구 절차, 사용자 피드백}

### 2.4 State-Driven Requirements (상태 기반)

**기능 그룹**: {기능 그룹 이름}

| 요구사항 ID | 요구사항 | 우선순위 | 검증 방법 |
|------------|----------|---------|----------|
| REQ-F-030 | WHILE {state} the {system} shall {requirement} | Medium | State Test |
| REQ-F-031 | WHILE {state} the {system} shall {requirement} | Low | State Test |

**상태 다이어그램**:
```
[상태1] --event--> [상태2]
  |                  |
  |-- REQ-F-030      |-- REQ-F-031
```

### 2.5 Optional Requirements (선택적 기능)

**기능 그룹**: {기능 그룹 이름}

| 요구사항 ID | 요구사항 | 우선순위 | 검증 방법 |
|------------|----------|---------|----------|
| REQ-F-040 | WHERE {feature} the {system} shall {requirement} | Low | Feature Test |
| REQ-F-041 | WHERE {feature} the {system} shall {requirement} | Low | Accessibility Test |

**활성화 조건**:
- **REQ-F-040**: {기능 활성화 조건, 설정 방법}
- **REQ-F-041**: {기능 활성화 조건, 설정 방법}

---

## 3. 비기능적 요구사항

### 3.1 Performance Requirements (성능)

| 요구사항 ID | 요구사항 | 측정 기준 | 검증 방법 |
|------------|----------|----------|----------|
| REQ-NF-001 | The system shall {performance requirement} | {측정 단위} | Performance Test |
| REQ-NF-002 | The system shall {performance requirement} | {측정 단위} | Load Test |

**성능 목표**:
- 응답 시간: {목표 값}
- 처리량: {목표 값}
- 리소스 사용: {목표 값}

### 3.2 Usability Requirements (사용성)

| 요구사항 ID | 요구사항 | 검증 방법 |
|------------|----------|----------|
| REQ-NF-010 | The system shall {usability requirement} | Usability Test |
| REQ-NF-011 | The system shall {usability requirement} | Accessibility Test |

**사용성 기준**:
- 접근성: WCAG 2.1 AA 준수
- 학습 곡선: 5분 내 기본 기능 습득
- 에러 복구: 3단계 이내 복구

### 3.3 Compatibility Requirements (호환성)

| 요구사항 ID | 요구사항 | 검증 방법 |
|------------|----------|----------|
| REQ-NF-020 | The system shall support {platform/browser} | Compatibility Test |
| REQ-NF-021 | The system shall function on {device/screen size} | Responsive Test |

**지원 환경**:
- 브라우저: {버전 목록}
- 디바이스: {디바이스 목록}
- 화면 크기: {최소-최대 범위}

### 3.4 Maintainability Requirements (유지보수성)

| 요구사항 ID | 요구사항 | 검증 방법 |
|------------|----------|----------|
| REQ-NF-030 | The system shall {maintainability requirement} | Code Review |
| REQ-NF-031 | The system shall {maintainability requirement} | Coverage Test |

**유지보수 기준**:
- 코드 품질: TypeScript strict mode, ESLint 통과
- 테스트 커버리지: 80% 이상
- 문서화: 모든 공개 API 문서화

### 3.5 Security Requirements (보안)

| 요구사항 ID | 요구사항 | 검증 방법 |
|------------|----------|----------|
| REQ-NF-040 | The system shall {security requirement} | Security Test |
| REQ-NF-041 | The system shall {security requirement} | Penetration Test |

**보안 기준**:
- 인증/인가: {방법}
- 데이터 보호: {암호화 방법}
- 취약점 관리: {스캔 도구}

---

## 4. 요구사항 추적 매트릭스

### 4.1 전방 추적 (Requirements → Design → Test)

| 요구사항 ID | 우선순위 | 설계 참조 | 테스트 참조 | 구현 참조 | 상태 |
|------------|---------|----------|-----------|----------|------|
| REQ-F-001 | High | DESIGN-01 | TEST-F-001 | IMPL-01 | 승인됨 |
| REQ-F-002 | High | DESIGN-01 | TEST-F-002 | IMPL-02 | 검토중 |
| REQ-F-010 | Medium | DESIGN-02 | TEST-F-010 | - | 대기중 |

### 4.2 후방 추적 (Test → Requirements)

| 테스트 ID | 검증 요구사항 | 테스트 유형 | 상태 |
|----------|-------------|-----------|------|
| TEST-F-001 | REQ-F-001 | Unit Test | 통과 |
| TEST-F-002 | REQ-F-002 | E2E Test | 실패 |
| TEST-F-010 | REQ-F-010 | Integration Test | 대기 |

### 4.3 커버리지 분석

| 카테고리 | 총 요구사항 | 설계 완료 | 테스트 완료 | 구현 완료 | 커버리지 |
|---------|-----------|----------|-----------|----------|---------|
| 기능적 요구사항 | 15 | 12 | 10 | 8 | 53% |
| 비기능적 요구사항 | 8 | 6 | 4 | 3 | 38% |
| **전체** | **23** | **18** | **14** | **11** | **48%** |

---

## 5. 제약사항 및 가정

### 5.1 제약사항

**기술적 제약**:
- 기술 스택: {기술 스택 목록}
- 라이브러리 제한: {사용 가능/불가능 라이브러리}
- 브라우저 지원: {최소 버전}

**비즈니스 제약**:
- 개발 기간: {기간}
- 예산: {예산}
- 팀 규모: {인원}

**법적/규제 제약**:
- 개인정보 보호: {규정}
- 접근성: {기준}
- 라이선스: {제한사항}

### 5.2 가정

**시스템 가정**:
- {가정1}
- {가정2}

**사용자 가정**:
- {가정1}
- {가정2}

**환경 가정**:
- {가정1}
- {가정2}

---

## 6. 검증 기준

### 6.1 기능적 요구사항 검증

| 요구사항 유형 | 검증 방법 | 합격 기준 |
|-------------|----------|----------|
| Ubiquitous | Unit Test + Integration Test | 100% 통과 |
| Event-Driven | E2E Test | 모든 시나리오 통과 |
| Unwanted | Error Scenario Test | 모든 에러 처리 검증 |
| State-Driven | State Transition Test | 모든 상태 전환 검증 |
| Optional | Feature Toggle Test | 활성화/비활성화 검증 |

### 6.2 비기능적 요구사항 검증

| 요구사항 유형 | 검증 방법 | 합격 기준 |
|-------------|----------|----------|
| Performance | Lighthouse, Web Vitals | {목표 점수} 이상 |
| Usability | Usability Test | {만족도} 이상 |
| Accessibility | axe-core, WAVE | WCAG 2.1 AA 100% |
| Compatibility | BrowserStack | 지원 브라우저 100% |
| Maintainability | SonarQube | {품질 게이트} 통과 |

### 6.3 승인 기준

요구사항 문서 승인 조건:
- [ ] 모든 요구사항이 EARS 형식 준수
- [ ] 모호한 표현 제거 (적절한, 충분한, 가능한 등)
- [ ] 모든 요구사항에 검증 방법 정의
- [ ] 추적 매트릭스 완성도 100%
- [ ] 이해관계자 리뷰 완료
- [ ] 기술 팀 리뷰 완료

---

## 7. 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 | 승인자 |
|------|------|-------|----------|--------|
| 1.0.0 | YYYY-MM-DD | {이름} | 초안 작성 | - |
| 1.1.0 | YYYY-MM-DD | {이름} | {변경 내용} | {이름} |

---

## 8. 승인

| 역할 | 이름 | 서명 | 날짜 |
|------|------|------|------|
| 프로덕트 오너 | {이름} | {서명} | YYYY-MM-DD |
| 기술 리드 | {이름} | {서명} | YYYY-MM-DD |
| QA 리드 | {이름} | {서명} | YYYY-MM-DD |

---
```

## 요구사항 ID 체계

### ID 형식

```
REQ-{Type}-{Category}-{Number}

REQ: Requirements (고정)
Type: F (Functional) | NF (Non-Functional)
Category: 기능 카테고리 (선택적)
Number: 일련번호 (001부터 시작)
```

### 예시

```
REQ-F-001       # 기능적 요구사항 #1
REQ-F-UI-001    # UI 카테고리 기능적 요구사항 #1
REQ-NF-001      # 비기능적 요구사항 #1
REQ-NF-PERF-001 # 성능 카테고리 비기능적 요구사항 #1
```

### 카테고리 코드

| 코드 | 카테고리 | 설명 |
|------|---------|------|
| UI | User Interface | UI 관련 요구사항 |
| API | API | API 관련 요구사항 |
| DATA | Data | 데이터 처리 요구사항 |
| AUTH | Authentication | 인증/인가 요구사항 |
| PERF | Performance | 성능 요구사항 |
| SEC | Security | 보안 요구사항 |
| ACC | Accessibility | 접근성 요구사항 |
| COMPAT | Compatibility | 호환성 요구사항 |

## 섹션별 작성 가이드

### 개요 섹션
- **목적**: "왜" 이 기능이 필요한가
- **범위**: "무엇을" 포함하고 제외하는가
- **정의**: 모호한 용어를 명확히 정의

### 기능적 요구사항 섹션
- EARS 5가지 패턴별로 그룹화
- 각 요구사항은 독립적으로 이해 가능
- 우선순위 명시 (High/Medium/Low)
- 검증 방법 명시

### 비기능적 요구사항 섹션
- 측정 가능한 기준 사용
- 성능: 숫자와 단위 (ms, MB, %)
- 사용성: 객관적 기준 (WCAG 레벨, 시간)
- 호환성: 구체적 버전 명시

### 추적 매트릭스 섹션
- 요구사항 → 설계 → 테스트 → 구현 연결
- 누락 방지 (모든 요구사항이 테스트됨)
- 진행 상태 추적

### 제약사항 섹션
- 명확한 제한사항 나열
- 기술적/비즈니스/법적 제약 구분
- 가정은 검증 가능해야 함

## 품질 체크리스트

문서 작성 완료 후 검토:
- [ ] 모든 요구사항이 EARS 형식 준수
- [ ] 요구사항 ID가 유일하고 일관적
- [ ] 모호한 표현 제거 (적절한, 충분한, 등)
- [ ] 모든 요구사항에 우선순위 지정
- [ ] 모든 요구사항에 검증 방법 지정
- [ ] 추적 매트릭스 완성도 100%
- [ ] 제약사항 및 가정 명시
- [ ] 변경 이력 기록
- [ ] 이해관계자 승인 완료

---

> **Best Practice**: 요구사항 문서는 살아있는 문서 - 지속적으로 업데이트
> **Version Control**: Git으로 관리하여 변경 이력 추적
