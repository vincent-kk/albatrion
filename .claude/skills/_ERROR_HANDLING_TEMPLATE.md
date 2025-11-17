# 스킬 에러 처리 템플릿

이 문서는 모든 스킬에 적용되는 표준 에러 처리 패턴을 정의합니다.

## 에러 심각도 분류 (3-Level Severity)

### severity_high (치명적 오류)
**정의**: 작업 중단이 필요한 치명적 오류

**처리 방식**:
- ❌ 즉시 작업 중단
- 사용자에게 상세 오류 메시지 표시
- 복구 방법 또는 재실행 가이드 제공
- 로그 기록 (선택적)

**일반적인 예시**:
- 필수 입력 데이터 누락
- 파일 시스템 접근 불가 (권한 문제)
- 치명적인 구문 오류 (파싱 실패)
- 필수 도구/라이브러리 미설치
- 스키마 검증 실패 (필수 필드 누락)

**표준 출력 포맷**:
```
❌ 치명적 오류 - {작업명} 중단
오류 유형: {error_type}
오류 상세: {error_details}

→ 조치 방법:
  1. {복구 단계 1}
  2. {복구 단계 2}
  3. {재실행 명령어}

→ 추가 도움말: {documentation_link}
```

### severity_medium (경고 - 기본값 사용)
**정의**: 작업 계속 가능하나 검토가 필요한 경고

**처리 방식**:
- ⚠️ 작업 계속 진행
- 문제 필드를 기본값으로 대체
- 경고 메시지 및 주석 추가
- 사용자에게 검토 요청

**일반적인 예시**:
- 선택적 필드 값 인식 실패
- 알 수 없는 기술 스택/프레임워크
- 잘못된 필드 타입 (변환 가능)
- 권장 패턴 미준수 (동작은 가능)
- 여러 옵션 중 자동 선택

**표준 출력 포맷**:
```
⚠️  경고 - {문제 설명}
영향 범위: {affected_scope}

→ 자동 처리 내용:
  - 문제 필드: {field_name}
  - 기본값 사용: {default_value}
  - 주석 추가: "# ⚠️  WARNING: {warning_message}"

→ 작업 결과: ✅ 완료 (검토 필요)
→ 검토 요청: {items_to_review}
```

### severity_low (정보성 - 자동 처리)
**정의**: 자동 처리 가능한 경미한 문제

**처리 방식**:
- ℹ️ 자동으로 처리
- 경고 표시 없음 (또는 최소한의 정보성 메시지)
- 사용자 개입 불필요
- 조용히 기본값 사용

**일반적인 예시**:
- 선택적 필드 누락 (일반적인 상황)
- 빈 커스텀 명령어 목록
- 미사용 설정 항목
- 포맷팅 자동 수정
- 주석/공백 정리

**표준 출력 포맷**:
```
ℹ️  정보: {간단한 설명} (자동 처리됨)
```
또는 출력 생략

## YAML 형식 에러 정의 템플릿

각 스킬의 SKILL.md에 다음 섹션을 추가합니다:

```yaml
## 에러 처리

error_handling:
  severity_high:
    conditions:
      - {조건 1}
      - {조건 2}
    action: |
      ❌ 치명적 오류 - {작업명} 중단
      → {복구 방법 1}
      → {복구 방법 2}
    examples:
      - condition: {예시 조건}
        message: "{에러 메시지}"
        recovery: "{복구 방법}"

  severity_medium:
    conditions:
      - {조건 1}
      - {조건 2}
    action: |
      ⚠️  경고 - 기본값으로 대체
      1. {처리 단계 1}
      2. {처리 단계 2}
      3. {사용자 검토 요청}
    fallback_values:
      {field_1}: {default_value_1}
      {field_2}: {default_value_2}
    examples:
      - condition: {예시 조건}
        message: "{경고 메시지}"
        fallback: "{사용된 기본값}"

  severity_low:
    conditions:
      - {조건 1}
      - {조건 2}
    action: |
      ℹ️  {정보성 메시지} - 자동 처리
      → {자동 처리 내용}
    examples:
      - condition: {예시 조건}
        auto_handling: "{자동 처리 방법}"
```

## 스킬별 에러 시나리오 작성 가이드

### Step 1: 스킬 작업 흐름 분석
1. 스킬의 주요 작업 단계 나열
2. 각 단계에서 발생 가능한 오류 식별
3. 오류의 영향도 평가

### Step 2: 심각도 분류
각 오류를 severity_high/medium/low로 분류:
- **작업 중단 필요?** → severity_high
- **기본값으로 대체 가능?** → severity_medium
- **자동 처리 가능?** → severity_low

### Step 3: 복구 전략 정의
- **severity_high**: 재실행 가이드, 전제조건 확인
- **severity_medium**: 기본값 목록, 검토 항목
- **severity_low**: 자동 처리 로직

### Step 4: 예시 작성
실제 발생 가능한 시나리오를 구체적으로 작성

## 일반적인 에러 카테고리

### 1. 파일 시스템 에러
```yaml
file_system_errors:
  severity_high:
    - 필수 파일 읽기 실패 (권한 없음)
    - 필수 디렉토리 접근 불가
    - 디스크 공간 부족 (쓰기 실패)
  severity_medium:
    - 선택적 파일 누락 (기본 템플릿 사용)
    - 파일 인코딩 불일치 (자동 변환 시도)
  severity_low:
    - 임시 파일 정리 실패
    - 캐시 파일 없음 (새로 생성)
```

### 2. 데이터 검증 에러
```yaml
validation_errors:
  severity_high:
    - 필수 필드 누락
    - 데이터 타입 불일치 (변환 불가)
    - 스키마 검증 실패
  severity_medium:
    - 선택적 필드 타입 불일치 (변환 가능)
    - 범위 초과 (최대/최소값으로 조정)
    - 알 수 없는 enum 값 (기본값 사용)
  severity_low:
    - 공백 문자 포함 (자동 trim)
    - 대소문자 불일치 (자동 정규화)
```

### 3. 의존성 에러
```yaml
dependency_errors:
  severity_high:
    - 필수 도구 미설치 (yarn, git, node)
    - 필수 라이브러리 누락
    - 버전 호환성 문제 (major 버전 불일치)
  severity_medium:
    - 권장 도구 미설치 (대체 도구 사용)
    - minor 버전 차이 (경고 표시)
  severity_low:
    - patch 버전 차이 (무시)
    - 선택적 플러그인 없음
```

### 4. 구문/포맷 에러
```yaml
syntax_errors:
  severity_high:
    - JSON/YAML 파싱 실패
    - TypeScript 컴파일 에러
    - 정규식 구문 오류
  severity_medium:
    - Lint 규칙 위반 (자동 수정 가능)
    - 포맷팅 불일치 (Prettier 적용)
  severity_low:
    - 불필요한 공백 (자동 제거)
    - 주석 포맷 불일치 (자동 정리)
```

### 5. 네트워크/외부 API 에러
```yaml
network_errors:
  severity_high:
    - API 인증 실패 (키 없음/만료)
    - 필수 리소스 다운로드 실패
    - 타임아웃 (재시도 실패)
  severity_medium:
    - 선택적 리소스 다운로드 실패 (캐시 사용)
    - Rate limit 초과 (대기 후 재시도)
  severity_low:
    - 이미지 최적화 서비스 실패 (원본 사용)
    - CDN 접속 느림 (로컬 폴백)
```

## 에러 메시지 작성 원칙

### 1. 명확성 (Clarity)
- ❌ "오류가 발생했습니다"
- ✅ "package.json 파일을 찾을 수 없습니다 (경로: ./package.json)"

### 2. 실행 가능성 (Actionability)
- ❌ "설정이 잘못되었습니다"
- ✅ "package.json의 'name' 필드가 필요합니다. 추가 후 재실행하세요."

### 3. 컨텍스트 제공 (Context)
- ❌ "타입 에러"
- ✅ "tech_stack.frontend.framework 필드의 값이 string이어야 하는데 number입니다 (현재값: 123)"

### 4. 복구 경로 제시 (Recovery Path)
- ❌ "실패했습니다"
- ✅ "실패: yarn install을 먼저 실행하세요 → 명령어: yarn install"

## 에러 로깅 (선택적)

스킬이 복잡하거나 디버깅이 필요한 경우:

```typescript
interface ErrorLog {
  timestamp: string;
  skillName: string;
  severity: 'high' | 'medium' | 'low';
  errorType: string;
  errorMessage: string;
  context: Record<string, any>;
  stackTrace?: string;
}

// 로그 파일: .claude/skills/{skill-name}/logs/errors.jsonl
```

## 통합 가이드

### 기존 스킬에 에러 처리 추가

1. **SKILL.md 업데이트**:
   - `## 에러 처리` 섹션 추가
   - 위 YAML 템플릿 사용
   - 스킬별 구체적인 에러 시나리오 작성

2. **도구 스크립트 업데이트** (해당 시):
   - 에러 심각도 판단 로직 추가
   - 표준 출력 포맷 적용
   - Exit code 설정 (high=1, medium=0, low=0)

3. **knowledge/ 문서 업데이트** (해당 시):
   - 에러 복구 방법 상세 설명
   - 트러블슈팅 가이드

4. **테스트 케이스 추가** (선택적):
   - 각 severity 레벨 에러 재현 테스트
   - 복구 전략 검증

### 새 스킬 작성 시

SKILL.md 템플릿에 `## 에러 처리` 섹션을 기본 포함하여 작성

## 예시: test-generator 스킬 에러 처리

```yaml
## 에러 처리

error_handling:
  severity_high:
    conditions:
      - 소스 파일이 존재하지 않음
      - 소스 파일 읽기 권한 없음
      - 테스트 디렉토리 생성 실패 (권한 문제)
      - 컴포넌트 타입 파싱 실패 (심각한 구문 오류)
    action: |
      ❌ 치명적 오류 - 테스트 생성 중단
      → 소스 파일 경로 확인: {source_file}
      → 파일 존재 여부 및 권한 확인
      → 재실행 명령어: ./generate-tests.sh {corrected_path}
    examples:
      - condition: "소스 파일 없음"
        message: "❌ 오류: 소스 파일을 찾을 수 없습니다: src/NonExistent.tsx"
        recovery: "파일 경로를 확인하고 재실행하세요"

  severity_medium:
    conditions:
      - 컴포넌트 타입 감지 실패 (구문은 정상)
      - 테스트 파일이 이미 존재 (덮어쓰기 확인)
      - FormTypeInput 패턴 미발견 (일반 컴포넌트로 처리)
    action: |
      ⚠️  경고 - 기본 템플릿으로 대체
      1. 컴포넌트 타입을 "Unknown"으로 설정
      2. 범용 테스트 템플릿 사용
      3. 생성된 테스트 파일 검토 요청
    fallback_values:
      component_type: "Unknown"
      test_template: "generic_component_test"
    examples:
      - condition: "컴포넌트 타입 미감지"
        message: "⚠️  경고: FormTypeInput 패턴을 찾을 수 없습니다 (src/MyComponent.tsx)"
        fallback: "범용 컴포넌트 테스트 템플릿 사용"

  severity_low:
    conditions:
      - 선택적 props 미발견
      - 주석 포맷 불일치
      - import 경로 자동 보정
    action: |
      ℹ️  자동 처리 - 기본 테스트 케이스 생성
      → 필수 props만 포함한 기본 테스트 작성
    examples:
      - condition: "선택적 props 없음"
        auto_handling: "필수 props만 포함한 기본 테스트 생성"
```

---

## 체크리스트: 스킬에 에러 처리 추가

- [ ] SKILL.md에 `## 에러 처리` 섹션 추가
- [ ] severity_high 조건 및 복구 방법 정의
- [ ] severity_medium 조건 및 기본값 정의
- [ ] severity_low 조건 정의
- [ ] 각 severity 레벨별 최소 2개 예시 작성
- [ ] 에러 메시지가 명확성/실행가능성/컨텍스트/복구경로 원칙 준수
- [ ] 도구 스크립트에 에러 처리 로직 반영 (해당 시)
- [ ] knowledge/ 문서에 트러블슈팅 섹션 추가 (해당 시)

---

> **작성일**: 2024-11-17
> **버전**: 1.0
> **참조**: yaml-generator/SKILL.md (lines 247-293)
