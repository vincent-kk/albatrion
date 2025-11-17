# Pull Request 리뷰 체크리스트

PR 생성 맥락에서 코드 품질 리뷰 시 사용하는 체크리스트입니다.

## 1. Breaking Changes 감지 규칙

### 1.1 API 시그니처 변경
- ✅ **확인 항목**:
  - 함수 파라미터 추가/삭제/순서 변경
  - 함수 반환 타입 변경
  - 클래스 메서드 시그니처 변경
  - 인터페이스 필드 변경

- 🔍 **감지 방법**:
  ```typescript
  // Breaking: 필수 파라미터 추가
  - function createUser(name: string): User
  + function createUser(name: string, email: string): User

  // Non-breaking: 선택적 파라미터 추가
  - function createUser(name: string): User
  + function createUser(name: string, email?: string): User
  ```

### 1.2 내보내기(Export) 변경
- ✅ **확인 항목**:
  - 공개 API 제거
  - export 문 삭제
  - 모듈 구조 변경

- 🚨 **위험 신호**:
  - `export` 키워드 삭제
  - `index.ts` 파일의 re-export 변경
  - 패키지 진입점 변경

### 1.3 타입 정의 변경
- ✅ **확인 항목**:
  - 인터페이스 필드 제거
  - 타입 제약 강화 (string → 'a' | 'b')
  - 제네릭 타입 파라미터 변경

- 🔍 **감지 방법**:
  ```typescript
  // Breaking: 필드 제거
  interface User {
    name: string;
  - email: string;
  }

  // Breaking: 타입 제약 강화
  - type Status = string;
  + type Status = 'active' | 'inactive';
  ```

### 1.4 기본값 변경
- ✅ **확인 항목**:
  - 함수 기본 파라미터 변경
  - 환경 변수 기본값 변경
  - 설정 파일 기본값 변경

## 2. 버전 업데이트 필요성 판단

### 2.1 Semantic Versioning 규칙
- **Major (x.0.0)**: Breaking changes 있음
- **Minor (0.x.0)**: 새 기능 추가 (하위 호환)
- **Patch (0.0.x)**: 버그 수정만

### 2.2 판단 기준
```yaml
breaking_changes_detected: MAJOR
new_features_added: MINOR
bug_fixes_only: PATCH
refactoring_only: PATCH
documentation_only: PATCH
```

## 3. 문서 업데이트 필요성

### 3.1 README.md 업데이트 필요 시점
- ✅ 새로운 공개 API 추가
- ✅ 기존 API 사용법 변경
- ✅ 설치/설정 방법 변경
- ✅ 새로운 기능 추가

### 3.2 CHANGELOG.md 업데이트
- ✅ 모든 사용자 영향 변경사항
- ✅ Breaking changes (별도 섹션)
- ✅ 새로운 기능
- ✅ 버그 수정

### 3.3 API 문서 업데이트
- ✅ JSDoc/TSDoc 주석 추가/수정
- ✅ 예제 코드 업데이트
- ✅ 타입 정의 문서화

## 4. 테스트 범위 제안

### 4.1 단위 테스트 필요 시점
- ✅ 새로운 함수/클래스 추가
- ✅ 기존 로직 변경
- ✅ 엣지 케이스 처리 추가

### 4.2 통합 테스트 필요 시점
- ✅ API 엔드포인트 추가/변경
- ✅ 데이터베이스 스키마 변경
- ✅ 외부 서비스 연동 변경

### 4.3 회귀 테스트 시나리오
- ✅ Breaking changes 있을 때 기존 사용 패턴 테스트
- ✅ 성능 영향이 있는 변경
- ✅ 보안 관련 변경

## 5. 의존성 변경 검토

### 5.1 확인 항목
- ✅ package.json dependencies 변경
- ✅ peerDependencies 추가/변경
- ✅ 라이브러리 버전 업그레이드

### 5.2 위험 요소
- 🚨 Major 버전 업그레이드
- 🚨 새로운 peerDependency 추가
- 🚨 필수 의존성으로 전환 (devDep → dep)

## 6. 성능 영향 평가

### 6.1 성능 저하 우려 신호
- 🚨 O(n²) 이상 알고리즘 도입
- 🚨 동기 I/O 작업 추가
- 🚨 대용량 데이터 메모리 로드
- 🚨 불필요한 반복 루프 추가

### 6.2 성능 측정 권장 상황
- ✅ 핵심 경로(critical path) 변경
- ✅ 데이터 구조 변경
- ✅ 캐싱 로직 변경

## 7. 보안 검토

### 7.1 필수 확인 항목
- ✅ 사용자 입력 검증
- ✅ SQL 인젝션 가능성
- ✅ XSS 취약점
- ✅ 인증/인가 로직 변경
- ✅ 민감 정보 로깅 여부

### 7.2 의존성 보안
- ✅ 취약점 알려진 패키지 사용
- ✅ 오래된 버전 의존성
- ✅ 신뢰할 수 없는 소스

## 8. 모노레포 특화 검토

### 8.1 패키지 간 영향도
- ✅ 공유 유틸리티 변경 시 모든 패키지 영향도 평가
- ✅ 타입 정의 변경 시 의존 패키지 확인
- ✅ Workspace 의존성 버전 일관성

### 8.2 빌드/배포 영향
- ✅ 빌드 설정 변경 (tsconfig, rollup 등)
- ✅ 패키지 진입점 변경
- ✅ 번들 크기 증가 여부

## 출력 예시

```markdown
## 🔍 PR 영향도 분석

### 💥 Breaking Changes
- ❌ **없음**: 하위 호환성 유지

### 🧪 권장 테스트 범위
- [ ] 비동기 검증 기능 단위 테스트
- [ ] 기존 동기 검증 회귀 테스트
- [ ] 통합 테스트: 폼 제출 시나리오

### 📦 영향받는 패키지
- `@canard/schema-form`: 새로운 기능 추가 (Minor 버전 업)
- `@canard/schema-form-react-plugin`: 타입 정의 업데이트 필요

### 📝 문서 업데이트 필요
- [ ] README.md: 비동기 검증 예제 추가
- [ ] CHANGELOG.md: 새 기능 항목 추가
- [ ] API 문서: AsyncValidator 인터페이스 설명

### ⚡ 성능 영향
- ✅ **영향 없음**: 기존 동기 검증 성능 유지
- ℹ️ 비동기 검증은 선택적 기능
```

## 참고 자료
- [Semantic Versioning 2.0.0](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Keep a Changelog](https://keepachangelog.com/)
