# /requirements - Requirements-Driven Development Workflow

This command executes a requirements-driven development workflow, systematically progressing through the entire process from requirements gathering to implementation planning.

## 🔍 Pre-Execution Checks

Before starting the requirements workflow, the following validations are performed automatically:

### 1. Output Directory Validation
**Check**: Can we create the output directory?
```bash
# Check if .tasks/ directory exists or can be created
if [ ! -d ".tasks" ]; then
  mkdir -p .tasks && echo "✅ .tasks/ directory created"
fi

# Check write permissions
if [ ! -w ".tasks" ]; then
  echo "❌ .tasks/ directory is not writable"
  exit 1
fi
```

**Auto-fix suggestions**:
- ❌ **Cannot create .tasks/** → Check directory permissions
- ❌ **Not writable** → Run: `chmod u+w .tasks`
- ✅ **Directory ready** → Proceed to workflow

### 2. Directory Naming Conflict Check
**Check**: Does a task directory for this feature already exist?
```bash
# Generate directory name: {feature}_{YYMMDD}
FEATURE_NAME=$(echo "$USER_INPUT" | sed 's/[^a-z0-9]/_/g' | cut -c1-20)
DATE=$(date +%y%m%d)
TASK_DIR=".tasks/${FEATURE_NAME}_${DATE}"

# Check for existing directory
if [ -d "$TASK_DIR" ]; then
  echo "⚠️ Directory $TASK_DIR already exists"
  # Suggest alternatives: append _v2, _v3, etc.
fi
```

**Auto-fix suggestions**:
- ⚠️ **Directory exists** → Use different feature name or append version suffix
- ⚠️ **Same-day conflict** → Add time suffix: `{feature}_{YYMMDD}_{HHMM}`
- ✅ **No conflict** → Proceed to workflow

### 3. Skill Availability
**Check**: Are all required skills available?
```bash
# Skill directory checks
.claude/skills/tot-requirements-engine/
.claude/skills/ears-documenter/
.claude/skills/design-architect/
.claude/skills/task-and-progress/
```

**Auto-fix suggestions**:
- ❌ **Skills missing** → Verify `.claude/skills/` directory structure
- ❌ **Knowledge files missing** → Check each skill's `knowledge/` directory
- ✅ **Skills ready** → Proceed to workflow

### 4. User Input Validation
**Check**: Is the user input sufficient for requirements analysis?
```bash
# Input quality check
INPUT_LENGTH=${#USER_INPUT}
WORD_COUNT=$(echo "$USER_INPUT" | wc -w)

if [ $WORD_COUNT -lt 5 ]; then
  echo "⚠️ Input too brief (${WORD_COUNT} words). Consider providing more details."
fi
```

**Auto-fix suggestions**:
- ⚠️ **Too brief** → Trigger interactive requirements gathering
- ⚠️ **Too vague** → Ask clarifying questions before ToT analysis
- ✅ **Sufficient detail** → Proceed to ToT analysis

---

## Execution Process

### Phase 1: Requirements Interpretation (ToT Analysis)

**Skill**: tot-requirements-engine

1. **User Request Analysis**
   - Extract core objectives from input requirements
   - Distinguish between explicit and implicit requirements

2. **Generate Multiple Interpretation Candidates** (3-5 options)
   - Apply Tree of Thoughts methodology
   - Present different interpretation perspectives for each candidate

   ```yaml
   candidates:
     A: "Simple timezone selection UI component"
     B: "Timezone management integrated with booking system"
     C: "Calendar-based multiple timezone selector"
   ```

3. **5-Axis Evaluation** (100 points total)
   - Implementation Complexity (30 pts): Technical difficulty
   - Requirements Fulfillment (30 pts): User requirement satisfaction
   - UX Quality (20 pts): User experience
   - Maintainability (10 pts): Code management ease
   - Team Capability (10 pts): Fit with current tech stack

4. **Select Optimal Interpretation**
   - Choose candidate with highest score
   - Document selection rationale and trade-offs

### Phase 2: EARS Requirements Documentation

**Skill**: ears-documenter

1. **Apply EARS Patterns**
   - Ubiquitous: "The system shall ..."
   - Event-Driven: "WHEN ... THEN the system shall ..."
   - State-Driven: "WHILE ... the system shall ..."
   - Unwanted: "IF ... THEN the system shall ..."
   - Optional: "WHERE ... the system shall ..."

2. **Generate Requirements Document**

   ```markdown
   #### REQ-F-001: Display Time Slots

   **Type**: Functional - Ubiquitous
   **Priority**: High
   **EARS**: The system shall display all available time slots.
   ```

3. **Requirements Verification**
   - Ambiguity Check: Is it clear and specific?
   - Completeness Check: Does it cover all scenarios?
   - Consistency Check: Are there conflicts between requirements?

### Phase 3: Technical Design

**Skill**: design-architect

1. **Select Architecture Pattern**
   - Frontend: Atomic Design / Feature-Sliced Design
   - State Management: Jotai / Redux / Zustand
   - API: REST / GraphQL / tRPC

2. **Generate Design Document**

   ```markdown
   ## Component Hierarchy

   TimeSlotSelector/
   ├─ TimeSlotGrid/
   │ ├─ TimeSlotItem/
   │ └─ DragOverlay/
   └─ SaveButton/
   ```

3. **Write ADR** (Architecture Decision Records)
   - Rationale for state management selection
   - Reasoning for component structure decisions
   - Background for API pattern selection

### Phase 4: Task Breakdown and Planning

**Skill**: task-and-progress

1. **Phase-wise Task Breakdown**

   ```markdown
   ## Phase 1: Basic Structure (Day 1)

   ### 1.1 Define TimeSlot Types

   - **File**: src/types/timeSlot.ts
   - **Content**: TimeSlot interface and related type definitions
   - **Method**:
     1. Define TimeSlot interface
     2. Define SelectionMode type
   - **Done**: [ ]
   - **Requirements**: REQ-F-001, REQ-F-031
   ```

2. **Dependency Management**
   - Sequential: Tasks that must be executed sequentially
   - Parallel: Tasks that can be executed in parallel
   - Conditional: Optional tasks

3. **Priority Assignment**
   - High: MVP essential features
   - Medium: UX enhancement features
   - Low: Optional features

## Output Structure

Workflow execution results will generate the following files in the `.tasks/{feature}_{date}/` directory:

```
.tasks/timeslot_selector_250115/
├─ 00_decision.yaml              # ToT analysis results and decision records
├─ 01_requirements.md            # EARS requirements document
├─ 02_design.md                  # Technical design document
├─ 03_plan.md                    # Implementation plan (phase-wise tasks)
├─ 04_guideline.md               # Coding guidelines
├─ progress_log.md               # Progress tracking (auto-generated)
└─ final_status_report.md        # Final report (generated upon completion)
```

## Usage Examples

### Basic Usage

```
/requirements

[Interactive Requirements Gathering]
User: I need a timezone selection feature
Assistant: What type of timezone selection would you like?
- Simple list selection
- Calendar-based selection
- Drag and drop selection

[ToT Analysis → EARS Documentation → Design → Planning]
```

### Direct Input

```
/requirements "Please create a UI component where users can select and save multiple time slots.
              It should support both drag selection and individual clicks, and work on mobile devices."
```

## 🚀 Advanced Features

### 1. Interactive Clarification Mode (Enhanced)
- **스마트 질문 생성**: 입력 분석 후 핵심 불명확한 부분 자동 탐지
  - 기능 범위 (Scope): 단일 기능 vs 시스템 통합
  - 사용자 대상 (Audience): B2C vs B2B vs Internal
  - 기술 제약 (Constraints): 성능, 보안, 호환성
  - 우선순위 (Priority): MVP vs Full Feature
- **대화 흐름 최적화**: 최소 3-5개 질문으로 명확화 완료
  - 1단계: 핵심 기능 확인 (What)
  - 2단계: 사용 맥락 파악 (Who, When, Where)
  - 3단계: 제약 조건 수집 (Constraints)
  - 4단계: 성공 기준 정의 (Acceptance Criteria)
- **입력 품질 평가**: 명확도 점수 (0-100) 기반 질문 개수 조절
  - 0-30점: 기본 개념부터 질문 (8-10개)
  - 31-60점: 핵심 부분만 질문 (4-6개)
  - 61-100점: 확인 질문만 (1-2개)

**Example Interactive Session**:
```
User: "타임슬롯 선택 기능"

🔍 입력 분석 결과:
- 명확도 점수: 25/100 (매우 모호)
- 부족한 정보: 사용 맥락, 기술 요구사항, 제약 조건

💬 대화형 질문 시작 (예상 질문 수: 8개)

[1/8] 핵심 기능 확인:
- 타임슬롯 선택이란 무엇을 의미하나요?
  a) 캘린더에서 시간 범위 선택
  b) 예약 가능한 시간대 목록에서 선택
  c) 반복 일정에서 시간 패턴 선택

User: b) 예약 가능한 시간대 목록에서 선택

[2/8] 선택 방식:
- 단일 시간대만 선택하나요, 여러 개 선택 가능한가요?
  a) 단일 선택 (Single Select)
  b) 다중 선택 (Multiple Select)
  c) 범위 선택 (Range Select)

User: b) 다중 선택

[3/8] 사용자 인터페이스:
- 어떤 UI 패턴을 선호하시나요?
  a) 체크박스 목록
  b) 드래그 선택
  c) 클릭 토글
  d) 혼합 (드래그 + 클릭)

User: d) 혼합

... (계속)

✅ 대화 완료! 명확도 점수: 95/100
📋 수집된 정보:
  - 기능: 예약 시간대 다중 선택 (드래그 + 클릭)
  - 사용자: 일반 사용자 (B2C)
  - 제약: 모바일 대응 필수, 30분 단위 시간대
  - 우선순위: MVP 핵심 기능
```

### 2. Codebase Reference & Reusability Analysis
- **유사 기능 자동 검색**: 코드베이스에서 재사용 가능한 컴포넌트 탐지
  - 파일명 패턴 매칭 (Select, Picker, Chooser 등)
  - 컴포넌트 Props 유사도 분석
  - State 관리 패턴 일치 여부
- **재사용성 평가**: 발견된 컴포넌트의 재사용 가능성 점수 (0-100)
  - 기능 일치도 (40%): 요구사항 충족 정도
  - 코드 품질 (30%): 테스트 커버리지, 타입 안전성
  - 유지보수성 (20%): 최근 업데이트, 의존성 상태
  - 문서화 (10%): JSDoc, README 존재
- **통합 가이드 자동 생성**: 기존 컴포넌트 활용 방법 제시
  - Import 경로 및 Props 매핑
  - 커스터마이징 포인트 안내
  - 확장 vs 신규 작성 권장

**Example Reusability Analysis**:
```
🔍 코드베이스 재사용성 분석

검색 키워드: "time", "slot", "select", "picker"
발견된 컴포넌트: 3개

📦 1. DateTimePicker (packages/@canard/schema-form/src/types/FormTypeDateTime.tsx)
   재사용성 점수: 75/100
   - 기능 일치도: 80% (날짜+시간 선택, 시간대 미포함)
   - 코드 품질: 90% (테스트 커버리지 85%, TypeScript)
   - 유지보수성: 70% (6개월 전 업데이트, 활발한 사용)
   - 문서화: 60% (JSDoc 있음, README 간략)

   💡 권장: 확장하여 사용
   - 추가 필요: 시간대(slot) 선택 로직
   - 재사용 가능: 날짜/시간 입력 UI
   - 통합 난이도: 중간 (2-3일)

📦 2. MultiSelectDropdown (packages/@winglet/react-utils/src/components/MultiSelect.tsx)
   재사용성 점수: 60/100
   - 기능 일치도: 70% (다중 선택, 시간 개념 없음)
   - 코드 품질: 85% (테스트 커버리지 90%, TypeScript)
   - 유지보수성: 50% (1년 전 업데이트, 사용 빈도 낮음)
   - 문서화: 40% (JSDoc 없음, Storybook만 존재)

   💡 권장: 부분 재사용
   - 재사용 가능: 다중 선택 로직
   - 신규 작성: 시간대 표시 UI
   - 통합 난이도: 낮음 (1-2일)

📦 3. CalendarGrid (packages/@canard/schema-form/src/internal/Calendar.tsx)
   재사용성 점수: 40/100
   - 기능 일치도: 50% (그리드 레이아웃만 유사)
   - 코드 품질: 95% (테스트 커버리지 95%, TypeScript)
   - 유지보수성: 80% (1개월 전 업데이트, 활발한 사용)
   - 문서화: 30% (JSDoc 없음, 내부 컴포넌트)

   💡 권장: 신규 작성
   - 목적 불일치: 캘린더 날짜 선택 vs 시간대 선택
   - 통합 비용 > 신규 작성 비용

🎯 최종 권장:
- DateTimePicker를 확장하여 TimeSlotPicker 구현
- MultiSelectDropdown의 다중 선택 로직 참조
- 신규 컴포넌트로 작성하되 기존 패턴 준수
```

### 3. Implementation Cost Estimation
- **자동 복잡도 분석**: 요구사항 기반 구현 복잡도 계산
  - UI 복잡도: 컴포넌트 수, 상태 관리 필요성
  - 로직 복잡도: 알고리즘, 데이터 변환
  - 통합 복잡도: 외부 API, 기존 시스템 연동
  - 테스트 복잡도: E2E, 엣지 케이스 수
- **시간 예측 (T-Shirt Sizing)**:
  - **XS** (0.5-1일): 단순 UI 컴포넌트, 기존 패턴 재사용
  - **S** (1-2일): 기본 상태 관리, 간단한 로직
  - **M** (3-5일): 복잡한 UI/UX, 중간 수준 로직
  - **L** (1-2주): 시스템 통합, 복잡한 알고리즘
  - **XL** (2주+): 새로운 아키텍처, 대규모 리팩토링
- **리스크 요소 식별**: 구현 시 예상 어려움
  - 기술적 불확실성 (새로운 라이브러리, 미검증 패턴)
  - 의존성 복잡도 (외부 API, 레거시 시스템)
  - 성능 요구사항 (대용량 데이터, 실시간 처리)
- **비용 분해 (Breakdown)**:
  - Phase별 예상 시간 (설계, 구현, 테스트, 문서화)
  - 필요 인력 (Frontend, Backend, QA)
  - 외부 의존성 (라이브러리, API 크레딧)

**Example Cost Estimation**:
```
💰 구현 비용 예측

📊 복잡도 분석:
- UI 복잡도: 중간 (7/10)
  - 컴포넌트 수: 5개 (TimeSlotGrid, TimeSlotItem, DragOverlay, SaveButton, StatusIndicator)
  - 상태 관리: Jotai (기존 패턴 사용)
  - 반응형: 필수 (모바일 + 데스크톱)

- 로직 복잡도: 낮음 (3/10)
  - 드래그 선택: 표준 패턴
  - 시간대 계산: 단순 변환
  - 저장 로직: 기본 CRUD

- 통합 복잡도: 낮음 (2/10)
  - 기존 API 사용
  - 독립 컴포넌트 (시스템 영향 최소)

- 테스트 복잡도: 중간 (5/10)
  - 유닛 테스트: 5개 컴포넌트
  - 통합 테스트: 드래그 시나리오 3개
  - E2E 테스트: 모바일 + 데스크톱

🏷️ T-Shirt Size: M (중간)
⏱️ 예상 시간: 3-5일

📋 Phase별 분해:
- Phase 1: 타입 정의 및 기본 구조 (0.5일)
- Phase 2: UI 컴포넌트 구현 (1.5일)
- Phase 3: 드래그 선택 로직 (1일)
- Phase 4: 상태 관리 및 저장 (0.5일)
- Phase 5: 테스트 및 문서화 (1일)
- 버퍼: 0.5일 (예상치 못한 이슈 대응)

⚠️ 리스크 요소:
- 🟡 중간 리스크: 모바일 드래그 UX (터치 이벤트 처리 복잡)
- 🟢 낮은 리스크: 기존 Jotai 패턴 사용
- 🟢 낮은 리스크: 독립 컴포넌트 (시스템 영향 최소)

👥 필요 인력:
- Frontend 개발자: 1명 (3-5일)
- QA: 0.5명 (테스트 케이스 검토 및 실행)
- 디자이너: 선택적 (UI 검토)

💵 외부 비용:
- 없음 (기존 라이브러리 및 API 사용)

🎯 신뢰도: 85%
  (비슷한 프로젝트 3회 경험, 기술 스택 익숙)
```

---

## 📖 사용 예시 (Advanced Features)

### 예시 1: 대화형 명확화 모드
```
상황: 매우 모호한 요구사항 입력
명령: /requirements "예약 기능 필요"
결과:
  - 명확도 점수: 15/100 (매우 모호)
  - 8개 질문으로 요구사항 구체화
  - 최종 점수: 95/100
  - 명확한 EARS 요구사항 12개 생성
```

### 예시 2: 코드베이스 재사용 분석
```
상황: 유사 컴포넌트가 이미 존재할 가능성
명령: /requirements "날짜 범위 선택 컴포넌트"
결과:
  - 코드베이스 검색: 3개 유사 컴포넌트 발견
  - DateRangePicker 재사용 점수: 85/100
  - 권장: 기존 컴포넌트 확장 (신규 작성 대비 60% 시간 절약)
  - 통합 가이드 자동 생성
```

### 예시 3: 비용 예측 및 의사결정
```
상황: 프로젝트 일정 계획 필요
명령: /requirements "실시간 채팅 기능 with AI 봇"
결과:
  - 복잡도 분석: UI (8/10), 로직 (9/10), 통합 (7/10)
  - T-Shirt Size: XL (2주+)
  - Phase 분해: 8단계, 상세 시간 예측
  - 리스크: 🔴 WebSocket 실시간 처리, 🔴 AI 모델 통합
  - 권장: MVP 범위 축소 또는 팀 증원
```

### 예시 4: 모든 기능 통합
```
상황: 새 기능 개발 전체 플래닝
명령: /requirements
입력: "타임슬롯 선택"
결과:
  - 1단계: 대화형 질문 (5개) → 명확도 95/100
  - 2단계: 코드베이스 검색 → DateTimePicker 재사용 가능 (75점)
  - 3단계: 비용 예측 → M 사이즈, 3-5일
  - 4단계: ToT 분석 → 3개 후보, 최적 선택
  - 5단계: EARS 문서 → 12개 요구사항
  - 6단계: 설계 문서 → Atomic Design + Jotai
  - 7단계: 계획 문서 → 5 Phase, 18 Task
```

---

## Expected Benefits

1. **Systematic Requirements Management**
   - Transform ambiguous requests into clear requirements
   - Ensure accuracy and completeness with EARS patterns

2. **Optimal Design Selection**
   - Multi-angle review through ToT analysis
   - Objective decision-making through quantitative evaluation

3. **Implementation Traceability**
   - Ensure traceability from requirements → design → tasks
   - Real-time progress monitoring

4. **Enhanced Team Collaboration**
   - Standardized document structure
   - Clear decision-making records

5. **Advanced Planning Capabilities** ✨ NEW
   - Smart clarification with minimal questions
   - Codebase reusability analysis reduces development time
   - Accurate cost estimation for better project planning

## Follow-up Tasks

After requirements documentation is complete:

1. **/execute** - Execute implementation plan

   ```
   /execute .tasks/timeslot_selector_250115
   ```

2. **Progress Tracking** - Track progress

   ```bash
   .claude/skills/task-and-progress/tools/progress_tracker.sh \
     .tasks/timeslot_selector_250115
   ```

3. **Validation** - Validate tasks

   ```bash
   .claude/skills/task-and-progress/tools/task_validator.sh \
     .tasks/timeslot_selector_250115
   ```

4. **/review** - Code review and quality verification

5. **/pr** - Create Pull Request

---

**Utilized Skills**:

- tot-requirements-engine
- ears-documenter
- design-architect
- task-and-progress

**Related Commands**:

- /execute - Execute plan
- /review - Code review
- /pr - Create PR

---

## ⚠️ 문제 해결 (Troubleshooting)

### 스킬을 찾을 수 없는 경우
**문제**: 필수 스킬 (`tot-requirements-engine`, `ears-documenter`, `design-architect`, `task-and-progress`) 디렉토리가 없음

**Fallback 동작**:
1. ⚠️ 경고 메시지: "스킬이 없어 기본 요구사항 분석을 수행합니다"
2. 네이티브 방식으로 요구사항 문서 생성:
   - 사용자 입력 직접 분석
   - 단순한 요구사항 나열
   - 기본 설계 제안
   - 간단한 작업 분해
3. 결과 품질: ToT 분석, EARS 패턴, 아키텍처 가이드 없음

**해결 방법**:
```bash
# 스킬 디렉토리 확인
ls -la .claude/skills/tot-requirements-engine/
ls -la .claude/skills/ears-documenter/
ls -la .claude/skills/design-architect/
ls -la .claude/skills/task-and-progress/

# 저장소에서 복원
git checkout .claude/skills/
```

### 출력 디렉토리 생성 실패
**문제**: `.tasks/` 디렉토리 생성 불가 또는 권한 오류

**Fallback 동작**:
1. ❌ 워크플로우 중단
2. 권한 오류 상세 안내
3. 대안 경로 제안

**해결 방법**:
```bash
# 디렉토리 권한 확인
ls -ld .tasks/

# 권한 부여
chmod u+w .tasks/

# 디렉토리 재생성
rm -rf .tasks/ && mkdir .tasks

# 대안: 다른 위치 사용
mkdir ~/my-tasks/
```

### 사용자 입력 부족
**문제**: 요구사항 입력이 너무 짧거나 모호함

**Fallback 동작**:
1. ⚠️ 입력 부족 경고
2. 대화형 요구사항 수집 시작:
   - 핵심 기능 질문
   - 사용자 대상 확인
   - 기술 스택 선호도
   - 제약 조건 파악
3. 충분한 정보 수집 후 진행

**해결 방법**:
```bash
# 더 상세한 입력 제공
/requirements "상세한 요구사항: 사용자는 [목적], 기능은 [내용], 제약은 [조건]"

# 대화형 모드 사용
/requirements
# (대화형 질문에 답변)
```

### Knowledge 파일 누락
**문제**: EARS 패턴, 아키텍처 가이드 파일 없음

**Fallback 동작**:
1. ⚠️ 가이드 파일 없음 경고
2. 기본 요구사항 형식 사용
3. 일반적인 설계 패턴 적용

**해결 방법**:
```bash
# Knowledge 파일 확인
ls -la .claude/skills/ears-documenter/knowledge/
ls -la .claude/skills/design-architect/knowledge/

# 저장소에서 복원
git checkout .claude/skills/*/knowledge/
```

## 📖 사용 예시

### 기본 사용법
```
/requirements
```

### 직접 입력 사용법
```
/requirements "상세 요구사항 설명"
```

### 실제 시나리오

#### 시나리오 1: 대화형 요구사항 수집
```
상황: 모호한 아이디어를 구체적 요구사항으로
명령: /requirements
대화:
  Assistant: "어떤 기능을 만들고 싶으신가요?"
  User: "시간대 선택 기능"
  Assistant: "단일 선택인가요, 다중 선택인가요?"
  User: "드래그로 여러 시간대 선택"
결과:
  - .tasks/timeslot_selector_250115/ 생성
  - 00_decision.yaml (ToT 분석 결과)
  - 01_requirements.md (EARS 요구사항)
  - 02_design.md (기술 설계)
  - 03_plan.md (단계별 계획)
```

#### 시나리오 2: 직접 입력으로 빠른 시작
```
상황: 명확한 요구사항을 직접 입력
명령: /requirements "사용자가 여러 시간대를 선택하고 저장할 수 있는 UI. 드래그 선택과 개별 클릭 모두 지원. 모바일 대응 필수."
결과:
  - ToT 분석으로 3개 후보 생성
  - 최적 후보 자동 선택 (점수 기반)
  - 전체 문서 자동 생성
```

#### 시나리오 3: 기존 코드베이스 참조
```
상황: 유사 기능 재사용하여 새 기능 설계
명령: /requirements
결과:
  - 기존 코드베이스 검색
  - 재사용 가능 컴포넌트 제안
  - 중복 방지 설계 권장
```

## 💡 팁
- **대화형 모드**: 요구사항이 불명확할 때 질문을 통해 구체화
- **ToT 활용**: 여러 구현 방법을 평가하여 최적 선택
- **EARS 패턴**: 명확하고 검증 가능한 요구사항 작성
- **실행 연계**: 생성된 계획을 `/execute`로 즉시 실행


---

## ✅ 성공 시 출력

```
✅ 요구사항 문서 생성 완료!

📊 생성 결과:
- 작업 디렉토리: .tasks/timeslot_selector_250115
- ToT 후보: 3개 분석 → 최적 후보 선택 (점수: 87/100)
- EARS 요구사항: 12개 (Functional 8개, Non-Functional 4개)
- 설계 패턴: Atomic Design + Jotai
- 구현 Phase: 5단계

📁 생성된 파일:
- 00_decision.yaml (ToT 분석 결과)
- 01_requirements.md (EARS 요구사항)
- 02_design.md (기술 설계)
- 03_plan.md (단계별 계획)
- 04_guideline.md (코딩 가이드)

📋 요구사항 요약:
- REQ-F-001: 시간대 다중 선택 (High)
- REQ-F-002: 드래그 선택 지원 (High)
- REQ-NF-001: 모바일 반응형 (Medium)

⏱️ 실행 시간: 45초

💡 다음 단계:
1. 요구사항 검토: cat .tasks/timeslot_selector_250115/01_requirements.md
2. 설계 확인: cat .tasks/timeslot_selector_250115/02_design.md
3. 구현 시작: /execute .tasks/timeslot_selector_250115
```

## ❌ 실패 시 출력

```
❌ 요구사항 문서 생성 실패

🔍 원인:
- 입력 부족 (< 5 단어)
- 또는: .tasks/ 디렉토리 생성 권한 없음
- 또는: 필수 스킬 누락 (tot-requirements-engine, ears-documenter)

💡 해결 방법:
1. 더 상세한 입력 제공:
   /requirements "상세 요구사항: 사용자가 [기능], [제약 조건], [기대 효과]"

2. 디렉토리 권한 확인:
   mkdir -p .tasks
   chmod u+w .tasks

3. 대화형 모드 시작:
   /requirements
   (질문에 답변하며 요구사항 구체화)

4. 스킬 복원:
   git checkout .claude/skills/tot-requirements-engine/
   git checkout .claude/skills/ears-documenter/
   git checkout .claude/skills/design-architect/
   git checkout .claude/skills/task-and-progress/

📚 추가 도움말: 사전 확인 섹션 및 대화형 모드 활용
```
