# 최적화 체크리스트

배포 전 성능 최적화 및 품질 검증을 위한 체크리스트입니다.

## 성능 최적화

### 비제어 컴포넌트
- [ ] 모든 Input이 `defaultValue` 사용 (제어 컴포넌트 최소화)
- [ ] Boolean Input이 `defaultChecked` 사용
- [ ] 제어 컴포넌트 사용 시 명확한 이유 문서화

### 이벤트 핸들러
- [ ] 모든 `onChange` 핸들러에 `useHandle` 적용
- [ ] inline 함수 사용 안 함
- [ ] 이벤트 핸들러가 매 렌더링마다 재생성 안 됨

### Props 연산
- [ ] 복잡한 props 연산에 `useMemo` 사용
- [ ] 객체 생성이 `useMemo`로 메모이제이션
- [ ] 단순 연산은 `useMemo` 사용 안 함 (오버헤드 방지)

### Context 구독
- [ ] Context에서 필요한 값만 추출
- [ ] Context 전체 구독 최소화
- [ ] Context 변경이 불필요한 리렌더링 유발 안 함

### ChildNodeComponents
- [ ] `ChildNodeComponents`에 props 전달 안 함
- [ ] 그대로 렌더링 (`<Child />`)
- [ ] 추가/제거 버튼만 UI 스타일링

## 코드 품질

### 타입 안전성
- [ ] 모든 컴포넌트에 명시적 타입 정의
- [ ] `satisfies FormTypeInputDefinition` 사용
- [ ] `any` 타입 사용 최소화
- [ ] 타입 체크 통과 (`yarn type-check`)

### 네이밍
- [ ] 컴포넌트: PascalCase
- [ ] Props 인터페이스: `{ComponentName}Props`
- [ ] Definition: `{ComponentName}Definition`
- [ ] 파일명: 컴포넌트명과 일치

### Import/Export
- [ ] Named export 사용
- [ ] Default export 지양
- [ ] 절대 경로 (외부 패키지) vs 상대 경로 (내부) 구분
- [ ] Barrel export (`index.ts`) 사용

### 주석
- [ ] 복잡한 로직에 주석 추가
- [ ] TSDoc 형식 사용 (함수/타입)
- [ ] TODO/FIXME 주석 정리

## 접근성

### 필수 속성
- [ ] 모든 Input에 `id` 속성
- [ ] 모든 Input에 `name` 속성
- [ ] `required` Input에 `aria-required`
- [ ] 에러 상태에 `aria-invalid`
- [ ] 에러 메시지에 `aria-describedby` 연결

### Label 연결
- [ ] FormLabel의 `htmlFor`와 Input의 `id` 매칭
- [ ] Label 텍스트 명확함
- [ ] 필수 필드 시각적 표시 (`*`)

### 키보드 네비게이션
- [ ] Tab 키로 모든 Input 접근 가능
- [ ] 논리적인 Tab 순서
- [ ] Enter 키로 폼 제출 가능
- [ ] Escape 키로 모달 닫기 (해당 시)

### 스크린 리더
- [ ] 명확한 Label 또는 `aria-label`
- [ ] 에러 메시지가 스크린 리더에 읽힘
- [ ] 그룹화 (`fieldset`, `role="group"`)

## 테스트

### 단위 테스트
- [ ] 각 컴포넌트별 단위 테스트 작성
- [ ] test 조건 검증
- [ ] onChange 핸들러 동작 검증
- [ ] 테스트 통과 (`yarn test`)

### 통합 테스트
- [ ] canard-form과 통합 테스트
- [ ] 실제 폼 동작 확인
- [ ] validation 동작 확인

### 접근성 테스트
- [ ] axe-core 테스트 (선택적)
- [ ] 키보드만으로 네비게이션 테스트
- [ ] 스크린 리더 테스트 (선택적)

## 빌드 및 배포

### 빌드
- [ ] 빌드 성공 (`yarn build`)
- [ ] 타입 체크 통과 (`yarn type-check`)
- [ ] Lint 통과 (`yarn lint`)
- [ ] 빌드 크기 확인 (일반적으로 < 100KB)

### package.json
- [ ] version 적절
- [ ] description 작성
- [ ] keywords 추가
- [ ] repository, author, license 설정
- [ ] files 필드 확인 (dist 포함)
- [ ] exports 필드 확인

### 문서화
- [ ] README.md 작성 (영문)
- [ ] README-ko_kr.md 작성 (한글)
- [ ] 설치 방법 명확
- [ ] 사용 예제 코드 포함
- [ ] LICENSE 파일 존재

### Storybook
- [ ] 주요 컴포넌트 stories 작성
- [ ] Storybook 실행 확인 (`yarn storybook`)
- [ ] 시각적 테스트 (선택적)

## formTypeInputDefinitions 검증

### 순서
- [ ] 구체적 조건 → 일반적 조건 순서
- [ ] Password, Textarea 등이 String보다 앞
- [ ] String, Number, Boolean이 마지막

### test 조건
- [ ] 모든 Definition에 test 존재
- [ ] test가 올바르게 매칭됨
- [ ] 중복 매칭 없음

## 성능 측정

### React DevTools Profiler
- [ ] 주요 컴포넌트 렌더링 측정
- [ ] 불필요한 리렌더링 확인
- [ ] Flamegraph 분석

### Bundle 크기
```bash
# 빌드 크기 확인
du -sh dist/

# gzip 후 크기
gzip -c dist/index.js | wc -c
```

- [ ] dist/ 크기 적절 (< 100KB 권장)
- [ ] tree-shaking 동작 확인

## 최종 체크리스트 (배포 전)

### 필수
- [ ] ✅ 빌드 성공
- [ ] ✅ 타입 체크 통과
- [ ] ✅ Lint 통과
- [ ] ✅ P1 컴포넌트 모두 구현
- [ ] ✅ 기본 렌더러 5개 구현
- [ ] ✅ README 작성

### 권장
- [ ] ⚠️ P2 컴포넌트 일부 구현
- [ ] ⚠️ 단위 테스트 작성
- [ ] ⚠️ Storybook stories 작성
- [ ] ⚠️ 접근성 검증
- [ ] ⚠️ 성능 최적화 적용

### 선택
- [ ] 📝 통합 테스트
- [ ] 📝 E2E 테스트
- [ ] 📝 CHANGELOG 작성
- [ ] 📝 마이그레이션 가이드

---

**통과 기준**:
- 필수 항목: 100% 완료
- 권장 항목: 80% 이상
- 선택 항목: 프로젝트 상황에 따라

**배포 가능 조건**:
- 필수 항목 모두 완료
- 권장 항목 80% 이상 완료
- 테스트 통과율 80% 이상 (테스트 작성 시)

