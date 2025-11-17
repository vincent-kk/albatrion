# 자동화된 Pull Request 생성 가이드

## 역할

Pull Request 생성을 요청받으면, 현재 브랜치의 변경사항을 자동으로 분석하여 코드 리뷰를 수행하고, 그 결과를 바탕으로 master 브랜치로의 PR을 생성합니다.

## 프로젝트 구조 이해

이 프로젝트는 다음 패키지들로 구성되어 있습니다:

- `@albatrion/aileron`: 성능 최적화 유틸리티 라이브러리
- `@albatrion/canard/schema-form`: JSON Schema 기반 폼 라이브러리
- `@albatrion/canard/schema-form-*-plugin`: 다양한 UI 라이브러리 플러그인
- `@albatrion/lerx/promise-modal`: Promise 기반 모달 시스템
- `@albatrion/winglet/*`: 공통 유틸리티 라이브러리

## 자동화 워크플로우

### 1단계: 브랜치 분석 모드 결정

현재 브랜치가 master인지 확인하고 분석 모드를 결정:

- **현재 브랜치가 master가 아닌 경우**: 브랜치 비교 모드 (current branch vs master)
- **현재 브랜치가 master인 경우**: 스테이징된 변경사항 분석 모드

### 2단계: 변경사항 수집 및 코드 리뷰 수행

분석 모드에 따라 적절한 git 명령어를 사용하여 변경사항을 수집하고, code-review.mdc 가이드라인에 따라 포괄적인 코드 리뷰를 수행합니다.

#### 브랜치 비교 모드 (current != master)

```bash
# 브랜치 간 차이점 분석
git log master..HEAD --oneline --stat
git diff master..HEAD --unified=3
git diff master..HEAD --name-only

# 분기점 확인
git merge-base master HEAD
git log $(git merge-base master HEAD)..HEAD --oneline
```

#### 스테이징된 변경사항 분석 모드 (current == master)

```bash
# 스테이징된 변경사항 분석
git diff --cached --unified=3
git diff --cached --name-only
git status --porcelain
```

### 3단계: 코드 리뷰 생성

code-review.mdc의 가이드라인에 따라 다음 형식으로 코드 리뷰를 생성:

- **단순 리팩토링**: 로직 변경 없는 구조적 변경사항
- **로직 변경사항**: 비즈니스 로직 및 알고리즘 수정사항
- **파일 이동/순서 변경**: 구조적 재배치
- **상세 변경 내역**: 새로운 기능, 버그 수정 등

### 4단계: PR 제목 및 설명 생성

분석된 변경사항을 바탕으로 PR 제목과 설명을 자동 생성:

#### PR 제목 형식

```
[<변경 목적별 그룹핑>](<변경범위>): <변경내용 정리>
```

**예시**:

- `[Fix/Feat](schema-form): input handling and parser improvements`
- `[Refactor](schema-form): Async strategy methods and dependency optimization`
- `[Feat](promise-modal): Add queue-based modal management system`

#### PR 설명 구조

```markdown
## 📋 TL;DR

한 줄 요약: 이 PR의 핵심 변경사항

## 🔄 변경사항 분석

### ✨ 새로운 기능

- **기능명**: 간단한 설명
- **다른 기능**: 간단한 설명

### 🐛 버그 수정

- **수정사항**: 문제 해결 내용
- **영향도**: 사용자에게 미치는 영향

### 🚀 개선사항

- **성능**: 성능 향상 내용
- **리팩토링**: 코드 구조 개선

### 💥 Breaking Changes (해당시)

- **변경사항**: 기존 API 변경 내용
- **마이그레이션**: 업데이트 방법

## 🔍 주요 변경 파일

- `packages/xxx/src/component.ts`: 주요 로직 변경
- `packages/yyy/src/types.ts`: 타입 정의 업데이트

## 🧪 테스트 확인사항

- [ ] 기존 기능 회귀 테스트
- [ ] 새로운 기능 동작 확인
- [ ] TypeScript 컴파일 성공
- [ ] 린트 검사 통과

## 📦 영향받는 패키지

- `@canard/schema-form`: 버전 x.x.x → x.x.x
- `@winglet/common-utils`: 새로운 유틸리티 추가

---

🤖 이 PR은 자동화된 분석을 통해 생성되었습니다.
```

### 5단계: GitHub PR 생성

GitHub CLI를 사용하여 실제 PR을 생성:

```bash
# 브랜치가 원격에 푸시되어 있는지 확인
git push -u origin <current-branch>

# PR 생성
gh pr create --title "PR 제목" --body "$(cat <<'EOF'
PR 설명 내용
EOF
)" --base master --head <current-branch>
```

## 자동화 실행 가이드

사용자가 "PR 생성해줘" 또는 "Create PR" 등의 요청을 하면:

1. **자동 브랜치 분석**: 현재 상태를 파악하고 적절한 분석 모드 선택
2. **자동 코드 리뷰**: 변경사항을 포괄적으로 분석하여 리뷰 문서 생성
3. **자동 PR 내용 생성**: 리뷰 결과를 바탕으로 PR 제목과 설명 작성
4. **자동 PR 생성**: GitHub CLI를 통해 실제 PR 생성
5. **결과 확인**: 생성된 PR 링크와 요약 정보 제공

## 품질 보장 원칙

### 분석의 정확성

- **사실 기반**: 실제 git diff와 commit 메시지를 기반으로 분석
- **맥락 고려**: 전체적인 변경사항의 맥락을 파악하여 메타 관점에서 요약
- **영향도 평가**: 브레이킹 체인지, 새로운 기능, 버그 수정 등의 영향도 정확히 분류

### PR 내용의 명확성

- **간결성**: 핵심 변경사항에 집중하여 명확하고 간결하게 작성
- **구조화**: 일관된 형식으로 정보를 구조화하여 리뷰어가 쉽게 이해할 수 있도록 구성
- **실행 가능성**: 실제 검토가 필요한 부분과 테스트 확인사항을 명확히 제시

### 자동화의 신뢰성

- **검증 단계**: PR 생성 전 필수 검사 항목 확인 (lint, typecheck, test)
- **오류 처리**: 분석 중 오류 발생시 적절한 대안 제시
- **사용자 확인**: 중요한 변경사항의 경우 사용자에게 확인 요청

## 추가 기능

### Mermaid 다이어그램 자동 생성

변경사항의 적합도가 50% 이상인 경우, 다음 다이어그램 자동 생성:

- **시퀀스 다이어그램**: 동작 흐름 변경
- **플로우차트**: 로직 흐름 변경
- **클래스 다이어그램**: 구조적 변경

### 스마트 라벨링

변경사항 유형에 따른 자동 라벨 제안:

- `enhancement`: 새로운 기능
- `bug`: 버그 수정
- `refactor`: 리팩토링
- `breaking-change`: 브레이킹 체인지
- `documentation`: 문서 변경

---

이 가이드를 통해 사용자는 간단한 명령 하나로 포괄적인 분석과 함께 고품질의 PR을 자동으로 생성할 수 있습니다.
