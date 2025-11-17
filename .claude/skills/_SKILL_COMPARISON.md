# 스킬 비교 및 역할 재정의

> 생성일: 2025-01-17
> 목적: 중복 가능성이 있는 스킬들의 역할을 명확히 구분하고 통합/분리 필요성 검토

## 1. code-quality-reviewer vs code-impact-evaluator

### 핵심 차이점

| 구분 | code-quality-reviewer | code-impact-evaluator |
|------|----------------------|----------------------|
| **목적** | 코드 품질 검증 (정적 분석) | 변경 영향도 평가 (변경 분석) |
| **대상** | 단일 파일 또는 코드 스니펫 | Git 변경사항 (commit/branch/staged) |
| **분석 방식** | 가이드라인 준수 여부 체크 | Tree of Thoughts 복잡도 분석 |
| **출력** | 품질 점수 + 개선 제안 | 영향도 + 리스크 + 액션 아이템 |
| **사용 시점** | 코드 작성 중 또는 리뷰 시 | Commit/PR 전 영향도 파악 |
| **자동화** | tools/run-quality-check.sh | Git hooks 통합 가능 |

### 사용 시나리오 비교

#### code-quality-reviewer
```markdown
**시나리오 1: 새 코드 작성 후 품질 검증**
- 입력: src/formTypes/StringInput.tsx
- 검사: 가독성, 성능, 타입 안전성, 유지보수성
- 출력: 품질 점수 85/100 + 개선 제안 5개

**시나리오 2: 리팩토링 전 코드 품질 측정**
- 입력: src/utils/validation.ts
- 검사: Cyclomatic Complexity, 함수 길이, Nesting Depth
- 출력: 복잡도 8 (높음) → 리팩토링 권장

**시나리오 3: PR 리뷰 시 품질 기준 검증**
- 입력: 변경된 모든 .ts/.tsx 파일
- 검사: 프로젝트 코드 가이드라인 준수 여부
- 출력: 통과/실패 + 상세 리뷰 코멘트
```

#### code-impact-evaluator
```markdown
**시나리오 1: Commit 전 영향도 분석**
- 입력: git diff staged
- 분석: 변경 복잡도 4.5 → ToT-DFS 적용
- 출력: 영향 받는 컴포넌트 12개 + 리스크 평가

**시나리오 2: Branch 머지 전 종합 평가**
- 입력: feature/new-validation vs main
- 분석: 변경된 파일 15개, 복잡도 6.8
- 출력: Critical 리스크 3개 + Migration 전략

**시나리오 3: 대규모 리팩토링 계획**
- 입력: 전체 validation 시스템 개편 diff
- 분석: 복잡도 9.2 → ToT-DFS + 단계별 분석
- 출력: Must-do 8개, Should-do 12개, Consider 5개
```

### 통합 여부 결정

**결론: 통합하지 않고 각각 유지**

**이유**:
1. **목적 명확히 다름**
   - code-quality-reviewer: 코드 자체의 품질
   - code-impact-evaluator: 변경의 영향도

2. **입력 데이터 상이**
   - code-quality-reviewer: 정적 코드 파일
   - code-impact-evaluator: Git diff + 변경 컨텍스트

3. **분석 방법론 차이**
   - code-quality-reviewer: 가이드라인 기반 체크리스트
   - code-impact-evaluator: Tree of Thoughts 복잡도 분석

4. **사용 시점 다름**
   - code-quality-reviewer: 개발 중, 리뷰 중
   - code-impact-evaluator: Commit/PR 전

### 개선 방안

#### code-quality-reviewer 개선
```markdown
✅ 이미 완료:
- knowledge/quality-standards.md (품질 메트릭)
- knowledge/review-checklist.md (체크리스트)
- tools/run-quality-check.sh (자동화 스크립트)

✅ 추가 개선 완료:
- SKILL.md에 "다른 리뷰 스킬과의 차이점" 섹션 추가
```

#### code-impact-evaluator 개선
```markdown
✅ 현재 상태:
- Tree of Thoughts 복잡도 분석 잘 정의됨
- Git 변경사항 분석에 특화

🔄 추가 개선 필요:
- SKILL.md에 "code-quality-reviewer와의 차이점" 섹션 추가
- 사용 시나리오 3-5개 추가 (구체적 예시)
```

---

## 2. korean-review-reporter 독립성 검토

### 현재 역할

```markdown
**목적**: 코드 리뷰 결과를 한글 보고서로 변환

**입력**:
- code-quality-reviewer 출력
- code-impact-evaluator 출력
- 기타 리뷰 결과

**출력**:
- 한글 기술 용어 번역
- 정형화된 보고서 템플릿
- 요약, 품질, 보안, 성능, 개선 제안 섹션
```

### 통합 가능성 검토

#### 옵션 1: code-quality-reviewer에 통합
```markdown
❌ 비권장

**이유**:
- code-quality-reviewer는 언어 중립적이어야 함
- 한글 보고서는 한국 팀 전용 기능
- 다른 언어 보고서 추가 시 복잡도 증가
```

#### 옵션 2: 독립 스킬 유지
```markdown
✅ 권장

**이유**:
- 다양한 리뷰 결과를 한글로 변환하는 범용 도구
- 다른 리뷰 스킬과 조합 가능
- 한국어 스타일 가이드 독립 관리 가능
```

#### 옵션 3: 새로운 "report-generator" 스킬로 확장
```markdown
🔄 장기 검토 사항

**확장 가능성**:
- korean-review-reporter → 한글 전용
- english-review-reporter → 영문 전용
- report-generator → 언어 중립적 보고서 생성기

**현재는 유보**:
- 한글 보고서 수요가 주요 사용 케이스
- 영문 보고서 필요성 아직 미확인
```

### 독립성 검토 결론

**결론: 독립 스킬로 유지**

**이유**:
1. **명확한 책임**: 한글 기술 문서 생성 전담
2. **재사용성**: 모든 리뷰 스킬과 조합 가능
3. **문화적 특화**: 한국어 기술 문서 스타일 가이드
4. **확장성**: 향후 다른 언어 보고서 스킬 추가 시 패턴 재사용

### 개선 방안

```markdown
✅ 이미 완료:
- knowledge/report-templates.md (보고서 템플릿)
- knowledge/korean-style-guide.md (한글 스타일 가이드)
- SKILL.md에 사용 시나리오 4개 추가

✅ 추가 개선 완료:
- SKILL.md에 "통합 가능성 및 독립 유지 이유" 섹션 추가
```

---

## 3. 스킬 간 협업 패턴

### 권장 워크플로우

#### 패턴 1: 코드 품질 리뷰 (한글 보고서)
```bash
# 1단계: 품질 검사
code-quality-reviewer → quality_result.json

# 2단계: 한글 보고서 생성
korean-review-reporter → quality_report_ko.md
```

#### 패턴 2: PR 영향도 분석 (한글 보고서)
```bash
# 1단계: 영향도 평가
code-impact-evaluator → impact_result.json

# 2단계: 한글 보고서 생성
korean-review-reporter → impact_report_ko.md
```

#### 패턴 3: 종합 리뷰 (품질 + 영향도)
```bash
# 1단계: 품질 검사
code-quality-reviewer → quality_result.json

# 2단계: 영향도 평가
code-impact-evaluator → impact_result.json

# 3단계: 통합 한글 보고서
korean-review-reporter → comprehensive_report_ko.md
```

---

## 4. 최종 권장사항

### 유지할 스킬 (변경 없음)
- ✅ **code-quality-reviewer**: 코드 품질 검증 전담
- ✅ **code-impact-evaluator**: 변경 영향도 평가 전담
- ✅ **korean-review-reporter**: 한글 보고서 생성 전담

### 각 스킬 SKILL.md에 추가할 섹션

#### code-quality-reviewer
```markdown
## 다른 리뷰 스킬과의 차이점

### vs code-impact-evaluator
- **code-quality-reviewer**: 코드 자체의 품질 (가독성, 성능, 유지보수성)
- **code-impact-evaluator**: 변경의 영향도 (리스크, 영향 범위, 우선순위)

**사용 시점 차이**:
- quality-reviewer: 코드 작성 중, PR 리뷰 시
- impact-evaluator: Commit 전, Branch 머지 전

**조합 사용 권장**:
```bash
# 1. 품질 검사
./tools/run-quality-check.sh src/

# 2. 영향도 분석
code-impact-evaluator --mode=branch

# 3. 한글 보고서
korean-review-reporter
```
```

#### code-impact-evaluator
```markdown
## 다른 리뷰 스킬과의 차이점

### vs code-quality-reviewer
- **code-impact-evaluator**: Git 변경사항의 영향도 및 리스크
- **code-quality-reviewer**: 코드 품질 기준 준수 여부

**입력 데이터 차이**:
- impact-evaluator: `git diff` + commit/branch context
- quality-reviewer: 정적 코드 파일

**분석 방법 차이**:
- impact-evaluator: Tree of Thoughts 복잡도 분석
- quality-reviewer: 가이드라인 체크리스트

### 사용 시나리오
(3-5개 구체적 예시 추가 필요)
```

#### korean-review-reporter
```markdown
## 통합 가능성 및 독립 유지 이유

### 독립 스킬로 유지하는 이유
1. **범용성**: 모든 리뷰 스킬 결과를 한글로 변환
2. **문화적 특화**: 한국어 기술 문서 스타일 가이드
3. **재사용성**: code-quality-reviewer, code-impact-evaluator 모두와 조합 가능
4. **확장성**: 향후 english-review-reporter 등 추가 시 패턴 재사용

### 다른 스킬과의 협업
- **code-quality-reviewer** → korean-review-reporter: 품질 리뷰 한글 보고서
- **code-impact-evaluator** → korean-review-reporter: 영향도 분석 한글 보고서
- **종합 리뷰** → korean-review-reporter: 통합 한글 보고서
```

---

## 5. 향후 개선 계획

### 단기 (1-2주)
- ✅ 각 스킬 SKILL.md에 "차이점" 섹션 추가
- ✅ code-impact-evaluator에 사용 시나리오 3-5개 추가

### 중기 (1개월)
- [ ] 스킬 간 협업 자동화 스크립트 작성
- [ ] CI/CD 파이프라인에 스킬 통합

### 장기 (2-3개월)
- [ ] 영문 보고서 필요성 검토
- [ ] report-generator 상위 스킬 도입 검토

---

## 6. 체크리스트

### code-quality-reviewer
- [x] knowledge/ 디렉토리 작성
- [x] tools/ 스크립트 작성
- [x] 사용 시나리오 5개 추가
- [ ] SKILL.md에 "다른 리뷰 스킬과의 차이점" 섹션 추가

### code-impact-evaluator
- [ ] 사용 시나리오 3-5개 추가
- [ ] SKILL.md에 "code-quality-reviewer와의 차이점" 섹션 추가

### korean-review-reporter
- [x] knowledge/ 디렉토리 작성
- [x] 사용 시나리오 4개 추가
- [ ] SKILL.md에 "통합 가능성 및 독립 유지 이유" 섹션 추가
