# Albatrion Monorepo Documentation Plan

모노레포 전체 패키지를 위한 통합 문서 사이트 구축 계획서

## 📋 프로젝트 개요

### 목표
- 모노레포 내 모든 패키지를 위한 통합 문서 사이트 구축
- React Hook Form(https://react-hook-form.com/) 수준의 사용자 친화적인 경험 제공
- 실제 동작하는 인터랙티브 예제 제공
- 패키지 간 연관성 및 통합 사용법 가이드

### 대상 패키지
- **@canard/*** (7개): JSON Schema 폼 라이브러리 및 플러그인들
- **@lerx/*** (1개): Promise 기반 모달 라이브러리
- **@winglet/*** (6개): 유틸리티 라이브러리들

## 🏗 전체 아키텍처

### 디렉토리 구조
```
/Users/Vincent/Workspace/albatrion/
├── docs/                           # Docusaurus 프로젝트 루트
│   ├── docusaurus.config.js
│   ├── src/
│   │   ├── components/             # 커스텀 React 컴포넌트
│   │   ├── css/                    # 스타일시트
│   │   └── pages/                  # 정적 페이지
│   ├── docs/                       # 문서 콘텐츠
│   │   ├── canard/                 # @canard/* 패키지들
│   │   │   ├── schema-form/        # 메인 폼 라이브러리
│   │   │   └── plugins/            # 폼 플러그인들
│   │   ├── lerx/                   # @lerx/* 패키지들
│   │   │   └── promise-modal/      # Promise 모달 라이브러리
│   │   ├── winglet/                # @winglet/* 패키지들
│   │   │   ├── common-utils/       # 공통 유틸리티
│   │   │   ├── data-loader/        # 데이터 로더
│   │   │   ├── json/               # JSON 유틸리티
│   │   │   ├── json-schema/        # JSON Schema 유틸리티
│   │   │   ├── react-utils/        # React 유틸리티
│   │   │   └── style-utils/        # 스타일 유틸리티
│   │   ├── guides/                 # 통합 가이드
│   │   │   ├── getting-started/    # 시작하기
│   │   │   ├── monorepo-usage/     # 모노레포 패키지 조합 사용법
│   │   │   └── migration/          # 마이그레이션 가이드
│   │   └── examples/               # 패키지 조합 예제
│   ├── blog/                       # 블로그 (선택적)
│   └── static/                     # 정적 자산
└── packages/                       # 기존 패키지들
```

### 메인 네비게이션 구조
```
Navigation:
├── Home                            # 랜딩 페이지
├── Getting Started                 # 빠른 시작 가이드
├── Canard                          # @canard/* 패키지들
│   ├── Schema Form                 # 메인 폼 라이브러리
│   │   ├── Introduction
│   │   ├── Guides
│   │   ├── API Reference
│   │   └── Examples
│   └── Plugins                     # 폼 플러그인들
│       ├── Validator Plugins (AJV 6/7/8)
│       └── UI Plugins (Antd, MUI, Antd-Mobile)
├── Lerx                           # @lerx/* 패키지들
│   └── Promise Modal              # Promise 기반 모달
│       ├── Introduction
│       ├── Guides
│       ├── API Reference
│       └── Examples
├── Winglet                        # @winglet/* 패키지들
│   ├── Common Utils               # 공통 유틸리티
│   ├── Data Loader               # 데이터 로더
│   ├── JSON Utils                # JSON 유틸리티
│   ├── JSON Schema               # JSON Schema 유틸리티
│   ├── React Utils               # React 유틸리티
│   └── Style Utils               # 스타일 유틸리티
├── Integration Examples           # 패키지 조합 사용 예제
└── API Reference                  # 전체 API 레퍼런스
```

### 개별 패키지 문서 구조 (예: canard/schema-form)
```
docs/canard/schema-form/
├── intro/
│   ├── installation.md            # 설치 및 초기 설정
│   ├── quick-start.md              # 5분 빠른 시작
│   └── concepts.md                 # 핵심 개념
├── guides/
│   ├── basic-usage.md              # 기본 사용법
│   ├── validation.md               # 검증 시스템
│   ├── conditional-fields.md       # 조건부 필드
│   ├── custom-components.md        # 커스텀 컴포넌트
│   └── form-submission.md          # 폼 제출 처리
├── advanced/
│   ├── complex-layouts.md          # 복잡한 레이아웃
│   ├── performance.md              # 성능 최적화
│   ├── typescript.md               # TypeScript 활용
│   └── plugin-development.md       # 플러그인 개발
├── api/
│   ├── components.md               # 컴포넌트 API
│   ├── hooks.md                    # 커스텀 훅들
│   └── types.md                    # TypeScript 타입
└── examples/
    ├── basic-forms.md              # 기본 폼 예제
    ├── dynamic-forms.md            # 동적 폼 예제
    └── real-world.md               # 실제 사용 사례
```

## 🚀 Phase별 실행 계획

### Phase 1: 기반 구축 (Week 1-2)

#### 1.1 Docusaurus 프로젝트 초기화
**목표**: 모노레포 통합 문서 사이트 기본 구조 완료

**작업 항목**:
- [ ] Docusaurus 3.x 초기화
- [ ] 모노레포 연동 (Yarn Workspaces)
- [ ] 3개 브랜드 네임스페이스 기본 설정 (canard, lerx, winglet)
- [ ] 통합 브랜딩 설정 (Albatrion 브랜드 + 개별 패키지 아이덴티티)
- [ ] GitHub Pages 또는 Vercel 배포 설정

**예상 시간**: 3-4일

**핵심 설정**:
```javascript
// docusaurus.config.js 주요 설정
module.exports = {
  title: 'Albatrion',
  tagline: 'Modern TypeScript libraries for React applications',
  url: 'https://albatrion.dev',
  baseUrl: '/',
  organizationName: 'vincent-kk',
  projectName: 'albatrion',
  themeConfig: {
    navbar: {
      title: 'Albatrion',
      items: [
        { to: '/docs/guides/getting-started', label: 'Getting Started', position: 'left' },
        {
          label: 'Canard',
          position: 'left',
          items: [
            { to: '/docs/canard/schema-form/intro/installation', label: 'Schema Form' },
            { to: '/docs/canard/plugins/overview', label: 'Plugins' },
          ],
        },
        { to: '/docs/lerx/promise-modal/intro/installation', label: 'Lerx', position: 'left' },
        {
          label: 'Winglet',
          position: 'left',
          items: [
            { to: '/docs/winglet/common-utils/intro/installation', label: 'Common Utils' },
            { to: '/docs/winglet/react-utils/intro/installation', label: 'React Utils' },
            { to: '/docs/winglet/json/intro/installation', label: 'JSON Utils' },
            // ... 다른 winglet 패키지들
          ],
        },
        { to: '/docs/examples', label: 'Examples', position: 'left' },
        { to: '/api', label: 'API', position: 'left' },
      ],
    },
  },
};
```

#### 1.2 브랜딩 및 디자인 시스템
**목표**: 일관된 시각적 아이덴티티 구축

**작업 항목**:
- [ ] 색상 팔레트 정의
- [ ] 타이포그래피 설정
- [ ] 커스텀 CSS 변수
- [ ] 반응형 디자인 확인

### Phase 2: 핵심 콘텐츠 작성 (Week 3-4)

#### 2.1 홈페이지 및 랜딩 (우선순위: 최고)
**목표**: 모노레포 전체의 가치 제안 및 패키지 생태계 소개

**핵심 메시지**:
- "Modern TypeScript libraries for React applications"
- "Modular, performant, and developer-friendly"
- "Complete form solutions, utility libraries, and modal systems"
- "Built for monorepo architecture with seamless integration"

**패키지별 하이라이트**:
- **@canard/**: "Build powerful forms with JSON Schema"
- **@lerx/**: "Promise-based modal management" 
- **@winglet/**: "Essential TypeScript utilities"

**포함 요소**:
- [ ] Hero 섹션 (모노레포 전체 가치 제안)
- [ ] 3개 브랜드 소개 섹션 (canard, lerx, winglet)
- [ ] 각 패키지별 대표 예제 (CodeSandbox 임베드)
- [ ] 패키지 간 통합 사용 시나리오
- [ ] 빠른 시작 가이드 링크

#### 2.2 통합 빠른 시작 가이드
**목표**: 패키지별 5분 내 시작하기 + 통합 사용 시나리오

**각 브랜드별 빠른 시작**:

1. **@canard/schema-form 시작하기** (5분)
   ```bash
   yarn add @canard/schema-form @canard/schema-form-ajv8-plugin
   ```

2. **@lerx/promise-modal 시작하기** (3분)
   ```bash
   yarn add @lerx/promise-modal
   ```

3. **@winglet/* 유틸리티 시작하기** (2분)
   ```bash
   yarn add @winglet/common-utils @winglet/react-utils
   ```

4. **통합 사용 시나리오** (10분)
   ```tsx
   // schema-form + promise-modal + winglet 조합 예제
   import { Form } from '@canard/schema-form';
   import { alert } from '@lerx/promise-modal';
   import { debounce } from '@winglet/common-utils';
   ```

#### 2.3 핵심 개념 문서
**목표**: 라이브러리의 핵심 아키텍처 이해

**다룰 개념들**:
- [ ] JSON Schema 기반 폼 생성
- [ ] Node 시스템 (StringNode, ObjectNode 등)
- [ ] Plugin 아키텍처
- [ ] FormTypeInput 시스템
- [ ] JSONPointer 네비게이션

### Phase 3: 패키지별 기본 가이드 (Week 4-6)

#### 3.1 @canard/schema-form 기본 가이드
**섹션 구성**:

1. **간단한 폼**
   - 텍스트, 숫자, 불린 필드
   - 필수 필드 설정
   - 기본값 설정

2. **복잡한 데이터 구조**
   - 중첩 객체
   - 배열 필드
   - oneOf/anyOf 스키마

3. **폼 상태 관리**
   - onChange 핸들러
   - 값 읽기/쓰기
   - 폼 리셋

#### 3.2 @lerx/promise-modal 기본 가이드
**섹션 구성**:

1. **기본 모달 사용법**
   - alert, confirm, prompt
   - Promise 기반 API
   - 이벤트 핸들링

2. **커스텀 모달**
   - 커스텀 컴포넌트
   - 애니메이션 설정
   - 스타일링

#### 3.3 @winglet/* 유틸리티 가이드
**각 패키지별 기본 사용법**:

1. **common-utils**: 배열, 객체, 함수 유틸리티
2. **react-utils**: 커스텀 훅, HOC, 컴포넌트
3. **json**: JSONPointer, JSONPatch 조작
4. **json-schema**: 스키마 탐색 및 변환
5. **data-loader**: 배칭 및 캐싱
6. **style-utils**: CSS 관리 및 스타일링

#### 3.4 패키지 간 통합 가이드
**통합 시나리오**:

1. **Form + Modal 통합**
   ```tsx
   // 폼 제출 후 모달로 결과 표시
   import { Form } from '@canard/schema-form';
   import { alert } from '@lerx/promise-modal';
   ```

2. **Utilities 조합 사용**
   ```tsx
   // winglet 유틸리티들을 조합한 복잡한 폼 로직
   import { debounce } from '@winglet/common-utils';
   import { useMemorize } from '@winglet/react-utils';
   ```

3. **전체 통합 예제**
   - 실제 프로덕션 수준의 예제
   - 패키지 간 최적 조합 패턴

#### 3.5 인터랙티브 예제 개발
**구현 방식**:
- CodeSandbox 템플릿 생성
- 실시간 결과 미리보기
- 다운로드 가능한 예제 코드

**예제 카테고리**:
- [ ] @canard/* 기본 폼들
- [ ] @lerx/* 모달 시나리오들
- [ ] @winglet/* 유틸리티 조합들
- [ ] 패키지 간 통합 예제들
- [ ] 실제 프로덕션 사용 사례

### Phase 4: 고급 기능 및 API 문서화 (Week 7-9)

#### 4.1 조건부 필드 (Conditional Fields)
**다룰 내용**:
- `computed` 속성 활용법
- `watch` 패턴으로 필드 간 연동
- `if-then-else` JSON Schema
- 복잡한 조건부 로직

**예제**:
```tsx
const conditionalSchema = {
  type: 'object',
  properties: {
    userType: { type: 'string', enum: ['admin', 'user'] },
    adminSettings: {
      type: 'object',
      computed: {
        watch: '../userType',
        visible: "../userType === 'admin'"
      }
    }
  }
};
```

#### 4.2 커스텀 컴포넌트 개발
**커버할 주제**:
- FormTypeInput 시스템 이해
- 우선순위 규칙
- 테스트 함수 vs 테스트 객체
- 커스텀 렌더러 개발

#### 4.3 복잡한 레이아웃
**내용**:
- `Form.Render` 컴포넌트 활용
- JSONPointer 네비게이션
- 커스텀 레이아웃 패턴
- 성능 최적화 팁

### Phase 5: 패키지별 고급 기능 (Week 9-10)

#### 5.1 @canard/* 고급 기능
**플러그인 에코시스템**:

1. **UI 플러그인 가이드**
   - Ant Design 플러그인
   - Material-UI 플러그인  
   - Ant Design Mobile 플러그인

2. **Validator 플러그인**
   - AJV 6/7/8 플러그인 비교
   - 커스텀 검증기 개발

3. **플러그인 개발 가이드**
   - 플러그인 인터페이스
   - 등록 및 배포

#### 5.2 @lerx/* 고급 기능
**고급 모달 패턴**:
- 중첩 모달 관리
- 애니메이션 커스터마이징
- 모달 상태 관리

#### 5.3 @winglet/* 고급 사용법
**패키지별 고급 패턴**:
- Performance 최적화 패턴
- 메모리 관리
- 대용량 데이터 처리

### Phase 6: 통합 및 완성도 향상 (Week 10-11)

#### 6.1 통합 API 레퍼런스
**전체 모노레포 API 문서화**:

1. **자동 생성 시스템**
   - TypeScript 타입에서 문서 추출
   - 각 패키지별 Props 테이블
   - 메서드 시그니처 문서화

2. **패키지별 API 섹션**
   - @canard/* API 레퍼런스
   - @lerx/* API 레퍼런스  
   - @winglet/* API 레퍼런스

3. **크로스 레퍼런스**
   - 패키지 간 의존성 매핑
   - 통합 사용 시 타입 호환성

#### 6.2 통합 성능 가이드
**모노레포 전체 최적화**:

1. **번들 최적화**
   - Tree shaking 전략
   - 패키지별 번들 크기 관리
   - 의존성 중복 제거

2. **런타임 성능**
   - 메모리 사용 최적화
   - 렌더링 성능 (React 관련 패키지)
   - 비동기 처리 최적화

#### 6.3 마이그레이션 및 호환성
**다양한 마이그레이션 시나리오**:

1. **외부 라이브러리에서 전환**
   - React Hook Form → @canard/schema-form
   - React Modal → @lerx/promise-modal
   - Lodash → @winglet/common-utils

2. **버전 업그레이드**
   - 각 패키지별 업그레이드 가이드
   - Breaking changes 문서화

## 🛠 기술 스택 및 도구

### 핵심 기술
- **Docusaurus 3.x**: 메인 문서 플랫폼
- **MDX**: React 컴포넌트가 포함된 마크다운
- **TypeScript**: 타입 안전성
- **React**: 인터랙티브 컴포넌트

### 개발 도구
- **CodeSandbox**: 라이브 코드 에디터
- **Algolia DocSearch**: 검색 기능
- **Mermaid**: 다이어그램 생성
- **Prism**: 코드 하이라이팅

### 배포 및 호스팅
- **GitHub Actions**: CI/CD
- **Vercel** 또는 **GitHub Pages**: 호스팅
- **Custom Domain**: `schema-form.canard.dev`

## 📊 콘텐츠 소스 및 리소스

### 기존 자료 활용
1. **README.md** (1,600+ 라인)
   - 기본 사용법
   - API 인터페이스
   - 예제 코드

2. **Storybook 예제들** (24개 스토리)
   - 실제 동작 예제
   - 다양한 사용 사례
   - 코드 스니펫

3. **TypeScript 정의**
   - API 시그니처
   - 타입 정보
   - JSDoc 주석

4. **테스트 케이스**
   - 엣지 케이스 처리
   - 예상 동작 검증

### 새로 제작할 콘텐츠
1. **튜토리얼 시리즈**
   - 단계별 학습 과정
   - 실습 중심 접근

2. **Best Practices**
   - 실제 프로덕션 경험
   - 성능 최적화 팁

3. **비교 문서**
   - 다른 폼 라이브러리와 비교
   - 플러그인 선택 가이드

## 📈 성공 지표 및 KPI

### 정량적 지표
- **페이지 뷰**: 월 1,000+ 순 방문자
- **문서 완성도**: 90%+ 커버리지
- **사용자 피드백**: 평균 4.5/5 별점
- **검색 성능**: 평균 응답 시간 < 200ms

### 정성적 지표
- 신규 사용자 온보딩 시간 단축
- 개발자 경험 개선
- 커뮤니티 참여도 증가
- 이슈 해결 시간 단축

## 🚦 위험 요소 및 대응 방안

### 기술적 위험
1. **복잡한 예제 구현**
   - **위험**: 라이브 예제가 제대로 동작하지 않을 수 있음
   - **대응**: 단계별 테스트, CodeSandbox 템플릿 사전 검증

2. **성능 이슈**
   - **위험**: 대용량 문서 사이트 로딩 속도
   - **대응**: 코드 스플리팅, 이미지 최적화, CDN 활용

### 콘텐츠 위험
1. **기술 변화**
   - **위험**: 라이브러리 업데이트로 문서 불일치
   - **대응**: 자동화된 예제 테스트, 버전별 문서 관리

2. **복잡성 관리**
   - **위험**: 너무 복잡한 설명으로 사용자 이탈
   - **대응**: 단계별 난이도 조절, 시각적 자료 활용

## 📅 세부 일정표 (11주 계획)

### Week 1-2 (Phase 1: 기반 구축)
- [ ] **Week 1**: Docusaurus 초기화, 모노레포 연동, 기본 네비게이션
- [ ] **Week 2**: 브랜딩 설정, 배포 파이프라인, 홈페이지 기본 구조

### Week 3-4 (Phase 2: 핵심 콘텐츠)
- [ ] **Week 3**: 통합 랜딩 페이지, 패키지별 소개 섹션
- [ ] **Week 4**: 빠른 시작 가이드, 기본 개념 문서

### Week 4-6 (Phase 3: 패키지별 기본 가이드)
- [ ] **Week 4-5**: @canard/schema-form 기본 가이드
- [ ] **Week 5**: @lerx/promise-modal 기본 가이드
- [ ] **Week 6**: @winglet/* 패키지들 기본 가이드
- [ ] **Week 6**: 패키지 간 통합 가이드

### Week 7-9 (Phase 4: 고급 기능)
- [ ] **Week 7**: @canard/* 고급 기능 및 플러그인 시스템
- [ ] **Week 8**: @lerx/* & @winglet/* 고급 사용법
- [ ] **Week 9**: 실제 사용 사례 및 복잡한 통합 예제

### Week 9-10 (Phase 5: 패키지별 심화)
- [ ] **Week 9**: 각 패키지별 고급 패턴 및 최적화
- [ ] **Week 10**: 플러그인 개발, 확장성 가이드

### Week 10-11 (Phase 6: 완성도 향상)
- [ ] **Week 10**: 통합 API 레퍼런스, 성능 가이드
- [ ] **Week 11**: 마이그레이션 가이드, 최종 검토 및 배포

## 💡 향후 확장 계획

### 1차 완성 후 추가 기능들

#### 커뮤니티 기능
1. **블로그 섹션**
   - 패키지 업데이트 소식
   - 실제 사용 사례 공유
   - 모노레포 관리 경험 공유
   - 기술 심화 블로그

2. **기여 가이드**
   - 모노레포 개발 환경 설정
   - 패키지별 기여 방법
   - 코드 스타일 가이드
   - PR 및 이슈 템플릿

#### 고급 기능들
1. **검색 기능 고도화**
   - 패키지별 필터링
   - 코드 예제 검색
   - API 메서드 검색

2. **인터랙티브 요소 확장**
   - 패키지 조합 시뮬레이터
   - 성능 비교 도구
   - 번들 크기 계산기

### 다른 모노레포 패키지 추가 시
- 확장 가능한 구조로 설계되어 있어 새 패키지 추가 용이
- 네임스페이스별 독립적인 문서 관리
- 통합 검색 및 크로스 레퍼런스 자동 연동

---

**📝 Note**: 이 계획서는 진행 상황에 따라 유연하게 조정될 수 있으며, 사용자 피드백을 바탕으로 우선순위를 재조정할 예정입니다.