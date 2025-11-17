# 개발 단계 상세 가이드

@canard/schema-form 플러그인 개발의 5단계 프로세스입니다.

## Phase 1: 설계 및 검증 (1-2일)

### 목표
UI 라이브러리 호환성 분석 및 설계 완료

### 작업 목록

#### 1.1 UI 라이브러리 분석
- [ ] 공식 문서 읽기
- [ ] 주요 컴포넌트 목록 작성
- [ ] 비제어 컴포넌트 지원 확인 (`defaultValue`, `defaultChecked`)

#### 1.2 호환성 매트릭스 작성
- [ ] Schema Form 요구사항 vs UI 컴포넌트 매핑
- [ ] 호환성 등급 판정 (✅ / ⚠️ / ❌)
- [ ] 우선순위 결정 (P1-P4)

#### 1.3 타입 설계
- [ ] Context 타입 정의 (`size`, `variant` 등)
- [ ] UI 라이브러리 특수 Props 확인

#### 1.4 package.json 초안
- [ ] 의존성 버전 조사
- [ ] peerDependencies 정의

### 완료 조건
- [ ] 호환성 매트릭스 완성
- [ ] Context 타입 정의 완성
- [ ] P1 컴포넌트 최소 3개 이상 매핑 확인

### 산출물
- `DESIGN.md` (호환성 매트릭스)
- `src/type.ts` (초안)

---

## Phase 2: 기본 인프라 (2-3일)

### 목표
프로젝트 기본 구조 및 빌드 환경 구축

### 작업 목록

#### 2.1 프로젝트 설정
- [ ] `package.json` 작성
- [ ] `tsconfig.json` 설정
- [ ] `rollup.config.mjs` 설정
- [ ] `vite.config.ts` (테스트) 설정
- [ ] `eslint.config.js` 설정

#### 2.2 의존성 설치
```bash
yarn install
```

#### 2.3 타입 정의
- [ ] `src/type.ts` 완성 (Context 타입)
- [ ] export 추가

#### 2.4 기본 렌더러 구현
- [ ] `src/renderers/FormGroup.tsx`
- [ ] `src/renderers/FormLabel.tsx`
- [ ] `src/renderers/FormInput.tsx`
- [ ] `src/renderers/FormError.tsx`
- [ ] `src/renderers/formatError.ts`

#### 2.5 플러그인 메인 export
- [ ] `src/index.ts` 작성
- [ ] `plugin` 객체 정의

#### 2.6 빌드 테스트
```bash
yarn build
yarn type-check
```

### 완료 조건
- [ ] 빌드 성공
- [ ] 타입 체크 통과
- [ ] 렌더러 5개 구현 완료
- [ ] `dist/` 폴더에 산출물 생성

### 산출물
- `src/index.ts`
- `src/type.ts`
- `src/renderers/*`
- `dist/` (빌드 결과)

---

## Phase 3: 핵심 컴포넌트 (3-5일)

### 목표
필수 FormTypeInput 컴포넌트 구현

### 작업 순서 (우선순위 기반)

#### 3.1 Priority 1: 기본 Input (1-2일)

**String 입력**:
- [ ] `src/formTypeInputs/FormTypeInputString.tsx`
- [ ] test: `{ type: 'string' }`
- [ ] 비제어 컴포넌트 (`defaultValue`)

**Number 입력**:
- [ ] `src/formTypeInputs/FormTypeInputNumber.tsx`
- [ ] test: `{ type: ['number', 'integer'] }`

**Boolean**:
- [ ] `src/formTypeInputs/FormTypeInputBoolean.tsx`
- [ ] test: `{ type: 'boolean' }`

#### 3.2 Priority 2: 특수 Format/FormType (1-2일)

**Textarea**:
- [ ] `src/formTypeInputs/FormTypeInputTextarea.tsx`
- [ ] test: `{ type: 'string', format: 'textarea' }`
- [ ] **배열 앞쪽에 배치** (String보다 먼저)

**Password**:
- [ ] `src/formTypeInputs/FormTypeInputPassword.tsx`
- [ ] test: `{ type: 'string', format: 'password' }`
- [ ] **배열 앞쪽에 배치**

**Date** (UI 라이브러리 지원 시):
- [ ] `src/formTypeInputs/FormTypeInputDate.tsx`
- [ ] test: `{ type: 'string', format: 'date' }`
- [ ] 값 변환 (string ↔ Date)

#### 3.3 Priority 3: Enum 및 구조 (1-2일)

**String Enum**:
- [ ] `src/formTypeInputs/FormTypeInputStringEnum.tsx`
- [ ] test: 함수 형태 (enum 체크)
- [ ] Select/Dropdown 사용

**Array**:
- [ ] `src/formTypeInputs/FormTypeInputArray.tsx`
- [ ] test: `{ type: 'array' }`
- [ ] `ChildNodeComponents` 렌더링
- [ ] 추가/제거 버튼 UI

#### 3.4 formTypeInputDefinitions 통합
- [ ] `src/formTypeInputs/index.ts` 작성
- [ ] **우선순위 순서 정렬** (구체적 → 일반적)
- [ ] export 추가

### 완료 조건
- [ ] P1 컴포넌트 3개 모두 구현
- [ ] P2 컴포넌트 선택적 구현
- [ ] formTypeInputDefinitions 순서 올바름
- [ ] 단위 테스트 작성 (선택적)

### 산출물
- `src/formTypeInputs/*.tsx` (컴포넌트들)
- `src/formTypeInputs/index.ts`

---

## Phase 4: 고급 기능 및 문서화 (2-3일)

### 목표
추가 컴포넌트 및 완전한 문서화

### 작업 목록

#### 4.1 추가 컴포넌트 (선택적)
- [ ] Radio Group
- [ ] Slider
- [ ] Color Picker
- [ ] 기타 특수 컴포넌트

#### 4.2 README 작성
- [ ] `README.md` (영문)
  - Installation
  - Usage
  - Components
  - Examples
- [ ] `README-ko_kr.md` (한글)
  - 설치
  - 사용법
  - 컴포넌트
  - 예제

#### 4.3 Storybook Stories
- [ ] `coverage/*.stories.tsx` 작성
- [ ] 각 컴포넌트별 stories
- [ ] Storybook 실행 확인

#### 4.4 예제 코드
```tsx
// README에 포함할 예제
import { Form } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-mui-plugin';

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string', label: 'Name' },
    age: { type: 'number', label: 'Age' },
  },
};

<Form schema={schema} plugin={plugin} />
```

#### 4.5 package.json 최종 확인
- [ ] version 확인
- [ ] description 작성
- [ ] keywords 추가
- [ ] repository, author, license 설정

### 완료 조건
- [ ] README 작성 완료 (영문 + 한글)
- [ ] Storybook stories 작성
- [ ] 예제 코드 동작 확인
- [ ] package.json 완성

### 산출물
- `README.md`
- `README-ko_kr.md`
- `coverage/*.stories.tsx`

---

## Phase 5: 최적화 및 검증 (1-2일)

### 목표
성능 최적화 및 배포 준비

### 작업 목록

#### 5.1 성능 최적화 체크리스트
- [ ] 비제어 컴포넌트 사용 확인
- [ ] `useHandle` 적용 확인
- [ ] `useMemo` 적용 확인
- [ ] Context 구독 최소화
- [ ] ChildNodeComponents props 전달 안 함

#### 5.2 접근성 검증
- [ ] 모든 Input에 `id`, `name` 속성
- [ ] `aria-required`, `aria-invalid` 적용
- [ ] Label과 Input `htmlFor` 연결
- [ ] axe-core 테스트 (선택적)
```bash
yarn test:a11y
```

#### 5.3 통합 테스트
- [ ] canard-form과 통합 테스트
- [ ] 실제 폼 동작 확인
- [ ] validation 동작 확인

#### 5.4 빌드 최종 확인
```bash
yarn build
yarn type-check
```

- [ ] 빌드 성공
- [ ] 타입 체크 통과
- [ ] 빌드 크기 확인 (`dist/` 크기)

#### 5.5 배포 준비
- [ ] `LICENSE` 파일 확인
- [ ] `.npmignore` 또는 `package.json` files 설정
- [ ] CHANGELOG 작성 (선택적)

### 완료 조건
- [ ] 성능 최적화 체크리스트 100% 완료
- [ ] 접근성 테스트 통과
- [ ] 통합 테스트 통과
- [ ] 빌드 크기 적절 (일반적으로 < 100KB)

### 산출물
- 최적화된 `dist/`
- `CHANGELOG.md` (선택적)

---

## 일정 예시

**총 기간**: 약 2-3주

| Phase | 기간 | 누적 |
|-------|------|------|
| Phase 1 | 1-2일 | 2일 |
| Phase 2 | 2-3일 | 5일 |
| Phase 3 | 3-5일 | 10일 |
| Phase 4 | 2-3일 | 13일 |
| Phase 5 | 1-2일 | 15일 |

**여유 기간**: 3-6일 추가 (문제 해결, 리뷰 등)

**최종**: 약 3주 (15-21일)

