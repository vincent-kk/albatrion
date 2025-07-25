# @canard/schema-form 사용 가이드 작성 계획서

## 📋 개요

### 목적

`@canard/schema-form` 패키지를 처음 사용하는 개발자를 위한 체계적이고 실용적인 가이드 작성

### 대상 독자

- React 개발 경험이 있는 프론트엔드 개발자
- JSON Schema에 대한 기본 이해가 있는 개발자
- 동적 폼 생성이 필요한 프로젝트를 진행하는 개발자

### 핵심 가치 제안

- **선언적 폼 생성**: JSON Schema만으로 복잡한 폼 구조 정의
- **강력한 검증 시스템**: 플러그인 기반의 유연한 검증 체계
- **높은 확장성**: FormTypeInput을 통한 커스텀 컴포넌트 지원
- **타입 안전성**: TypeScript 완벽 지원

## 🏗 가이드 구조

### 1. 시작하기 (Getting Started)

#### 1.1 소개 및 개념

```markdown
# @canard/schema-form이란?

## 핵심 개념

- JSON Schema 기반 폼 렌더링
- 노드 시스템 아키텍처
- 플러그인 생태계
- FormTypeInput 확장성

## 왜 schema-form을 사용해야 하나요?

- 일반 폼 라이브러리와의 차이점
- 적합한 사용 사례
- 장단점 분석
```

#### 1.2 설치 및 설정

```markdown
# 빠른 시작

## 설치

- 기본 패키지 설치
- 검증 플러그인 선택 및 설치
- UI 플러그인 옵션

## 첫 번째 폼 만들기

- 기본 예제 (이름, 나이 입력)
- 값 상태 관리
- 실시간 미리보기
```

### 2. 기본 사용법 (Basic Usage)

#### 2.1 스키마 정의하기

```markdown
# JSON Schema 기초

## 기본 타입

- string: 텍스트 입력
- number: 숫자 입력
- boolean: 체크박스
- object: 중첩 구조
- array: 반복 필드

## 스키마 옵션

- default: 기본값 설정
- enum: 선택 옵션 정의
- required: 필수 필드 지정
- title/description: 레이블과 설명
```

#### 2.2 폼 상태 관리

```markdown
# 폼 데이터 다루기

## 값 읽기와 쓰기

- onChange 핸들러
- defaultValue vs controlled value
- 중첩 객체 처리

## 폼 제어

- FormHandle 사용법
- reset() 메서드
- getValue()/setValue()
- focus()/select()
```

#### 2.3 검증 시스템

```markdown
# 폼 검증

## 검증 플러그인 설정

- AJV 플러그인 등록
- 버전별 차이점 (AJV 6/7/8)

## 검증 모드

- ValidationMode.OnChange
- ValidationMode.OnRequest
- ValidationMode.None

## 에러 표시

- ShowError 옵션
- 커스텀 에러 포맷팅
- 에러 위치 지정
```

### 3. 고급 기능 (Advanced Features)

#### 3.1 조건부 렌더링

```markdown
# 동적 폼 구성

## computed 속성

- watch를 통한 필드 감시
- 조건부 visible/disabled/readOnly
- 복잡한 의존성 처리

## if-then-else 스키마

- JSON Schema 조건문
- 다중 조건 처리
- 성능 최적화 팁
```

#### 3.2 FormTypeInput 시스템

```markdown
# 커스텀 컴포넌트

## FormTypeInput 정의

- test 함수 vs test 객체
- 우선순위 규칙
- Component 구현

## 실전 예제

- 커스텀 날짜 선택기
- 파일 업로드 컴포넌트
- 리치 텍스트 에디터
```

#### 3.3 레이아웃 커스터마이징

```markdown
# 폼 레이아웃

## Form.Render 활용

- JSONPointer로 특정 필드 렌더링
- 커스텀 레이아웃 구성
- 반응형 디자인

## 그룹핑과 섹션

- ObjectNode 활용
- 탭/아코디언 구현
- 마법사 형태 폼
```

### 4. 실전 패턴 (Real-world Patterns)

#### 4.1 복잡한 데이터 구조

```markdown
# 고급 스키마 패턴

## 중첩 배열과 객체

- 다차원 데이터 구조
- 동적 필드 추가/삭제
- 드래그 앤 드롭 정렬

## oneOf/anyOf 활용

- 다형성 데이터 처리
- 타입 선택 UI
- 마이그레이션 전략
```

#### 4.2 성능 최적화

```markdown
# 성능 고려사항

## 대용량 폼 최적화

- 메모이제이션 전략
- 가상화 기법
- 청크 렌더링

## 재렌더링 최소화

- FormTypeInput 최적화
- watch 의존성 관리
- React.memo 활용
```

#### 4.3 통합 시나리오

```markdown
# 다른 라이브러리와 통합

## UI 프레임워크 통합

- Ant Design 플러그인
- Material-UI 플러그인
- 커스텀 UI 라이브러리

## 상태 관리 통합

- Redux/MobX 연동
- React Query 활용
- 폼 데이터 영속성
```

### 5. API 레퍼런스 (API Reference)

#### 5.1 컴포넌트 API

```markdown
# 컴포넌트 레퍼런스

## Form 컴포넌트

- Props 상세 설명
- 제네릭 타입 활용
- 이벤트 핸들러

## Form.Render

- 선택적 렌더링
- Props 전달
- 사용 예제
```

#### 5.2 Hook API

```markdown
# 커스텀 훅

## useFormSubmit

- 제출 로직 구현
- 로딩 상태 관리
- 에러 처리

## useVirtualNodeError

- 가상 노드 에러 처리
- 커스텀 검증 로직
```

#### 5.3 타입 정의

```markdown
# TypeScript 타입

## 핵심 타입

- JsonSchema
- FormHandle
- SchemaNode
- FormTypeInputProps

## 유틸리티 타입

- InferJsonSchema
- InferValueType
- 제네릭 활용법
```

### 6. 예제 모음 (Examples)

#### 6.1 기본 예제

- 로그인 폼
- 회원가입 폼
- 설문조사 폼
- 주소 입력 폼

#### 6.2 고급 예제

- 동적 설문 생성기
- 제품 등록 폼
- 다단계 신청서
- 실시간 협업 폼

#### 6.3 실제 사용 사례

- 관리자 대시보드 설정
- API 스키마 기반 폼
- 다국어 지원 폼
- 접근성 고려 폼

## 📝 작성 지침

### 톤 앤 매너

- **친근하고 실용적인 어조**: 기술적 정확성을 유지하면서도 이해하기 쉽게
- **단계별 접근**: 초보자도 따라할 수 있는 점진적 난이도
- **실전 중심**: 이론보다는 실제 사용 예제 중심

### 코드 예제 원칙

1. **완전한 예제**: 복사해서 바로 실행 가능한 코드
2. **TypeScript 우선**: 타입 안전성을 보여주는 예제
3. **주석 활용**: 중요한 부분에 한글 주석 추가
4. **점진적 복잡도**: 간단한 예제에서 복잡한 예제로

### 시각적 요소

- **다이어그램**: 노드 시스템, 데이터 흐름 설명
- **스크린샷**: 실제 렌더링된 폼 UI
- **인터랙티브 데모**: CodeSandbox 임베드
- **비교 표**: 플러그인 선택, 옵션 비교

## 🚀 실행 계획

### Phase 1: 기초 콘텐츠 (1주)

- [ ] 시작하기 섹션 완성
- [ ] 기본 사용법 작성
- [ ] 첫 5개 기본 예제 구현

### Phase 2: 핵심 기능 (1주)

- [ ] 검증 시스템 상세 가이드
- [ ] 조건부 렌더링 문서화
- [ ] FormTypeInput 시스템 설명

### Phase 3: 고급 주제 (1주)

- [ ] 성능 최적화 가이드
- [ ] 복잡한 사용 사례
- [ ] 통합 시나리오

### Phase 4: 완성 및 검토 (3일)

- [ ] API 레퍼런스 정리
- [ ] 예제 코드 검증
- [ ] 전체 문서 리뷰

## 📊 성공 지표

### 정량적 지표

- **문서 완성도**: 계획된 섹션의 100% 작성
- **예제 커버리지**: 20개 이상의 실행 가능한 예제
- **API 문서화**: 모든 public API 문서화

### 정성적 지표

- **초보자 친화성**: 5분 안에 첫 폼 생성 가능
- **실용성**: 실제 프로젝트에 바로 적용 가능한 예제
- **명확성**: 복잡한 개념의 쉬운 설명

## 🎯 핵심 메시지

1. **"JSON Schema만 있으면 폼이 만들어집니다"**

   - 선언적 접근의 강력함
   - 빠른 개발 속도

2. **"복잡한 요구사항도 간단하게"**

   - FormTypeInput으로 무한한 확장성
   - 조건부 로직의 우아한 처리

3. **"타입 안전한 폼 개발"**
   - TypeScript 완벽 지원
   - 런타임 검증과 컴파일 타임 안전성

## 📚 참고 자료

### 내부 자료

- `/coverage/*.stories.tsx`: 24개의 스토리북 예제
- `README.md`: 1,600줄의 기존 문서
- TypeScript 정의 파일들

### 외부 참고

- JSON Schema 공식 문서
- React Hook Form 문서 (벤치마킹)
- Formik 문서 (비교 분석용)

## 🔄 지속적 개선

### 피드백 수집

- 사용자 질문 패턴 분석
- 자주 묻는 질문 섹션 추가
- 실제 사용 사례 수집

### 업데이트 계획

- 분기별 새로운 예제 추가
- 버전 업데이트 시 마이그레이션 가이드
- 커뮤니티 기여 예제 통합
