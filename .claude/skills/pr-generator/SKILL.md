# PR Generator Skill

## 역할
코드 변경사항 분석 및 리뷰 결과를 바탕으로 Pull Request 메타데이터(제목, 설명)를 생성하고, GitHub CLI를 통해 실제 PR을 발행하는 전문가입니다.

## 핵심 책임
1. **PR 제목 생성**: 변경 유형과 범위에 맞는 형식화된 제목 작성
2. **PR 설명 생성**: 구조화된 템플릿 기반 상세 설명 작성
3. **GitHub PR 생성**: gh CLI를 통한 실제 PR 발행
4. **결과 검증**: 생성된 PR의 성공 여부 확인 및 URL 제공

## 입력 데이터

### 필수 입력
```typescript
interface PRGeneratorInput {
  // git-change-analyzer 출력
  changes: {
    analysisMode: "commit" | "branch" | "staged";
    totalCommits: number;
    filesChanged: number;
    linesAdded: number;
    linesDeleted: number;
    files: Array<{
      path: string;
      type: string;
      changeType: string;
      diff: string;
    }>;
  };

  // code-quality-reviewer 출력
  review: {
    breakingChanges: string[];
    newFeatures: string[];
    bugFixes: string[];
    refactorings: string[];
    testRecommendations: string[];
    affectedPackages: string[];
  };

  // 브랜치 정보
  sourceBranch: string;
  targetBranch: string; // 기본값: "master"
}
```

## 출력 데이터

```typescript
interface PRGeneratorOutput {
  success: boolean;
  prUrl?: string;
  prNumber?: number;
  title: string;
  body: string;
  error?: string;
}
```

## 작동 방식

### 1단계: PR 제목 생성

`knowledge/pr-title-format.md` 규칙에 따라 제목 생성:

```
[<변경유형>](<범위>): <간결한 설명>
```

**변경 유형 우선순위**:
1. Breaking Change 있음 → `[Breaking]`
2. 새 기능 추가 → `[Feat]` 또는 `[Feature]`
3. 버그 수정 → `[Fix]`
4. 리팩토링만 → `[Refactor]`
5. 문서만 변경 → `[Docs]`
6. 테스트만 추가 → `[Test]`
7. 빌드/설정 변경 → `[Chore]`

**범위 결정**:
- 단일 패키지 변경 → 패키지명 (예: `schema-form`)
- 다중 패키지 변경 → 주요 패키지 또는 `monorepo`
- 전역 설정 변경 → `root` 또는 `config`

### 2단계: PR 설명 생성

`knowledge/pr-description-template.md`를 기반으로 구조화된 설명 작성:

```markdown
## 📋 TL;DR
[한 줄 요약]

## 🔄 변경사항 분석

### ✨ 새로운 기능
[새로운 기능 목록]

### 🐛 버그 수정
[버그 수정 목록]

### 🚀 개선사항
[리팩토링/성능 개선 목록]

### 💥 Breaking Changes (해당시)
[Breaking changes와 마이그레이션 가이드]

## 🔍 주요 변경 파일
[변경된 주요 파일 목록과 설명]

## 🧪 테스트 확인사항
[테스트 체크리스트]

## 📦 영향받는 패키지
[영향받는 패키지 목록]

---

🤖 이 PR은 자동화된 분석을 통해 생성되었습니다.
```

### 3단계: GitHub PR 생성

`tools/create-github-pr.sh` 스크립트를 실행하여 PR 생성:

1. **브랜치 푸시 확인**
   ```bash
   git push -u origin <source-branch>
   ```

2. **PR 생성**
   ```bash
   gh pr create \
     --title "<생성된 제목>" \
     --body "<생성된 설명>" \
     --base <target-branch> \
     --head <source-branch>
   ```

3. **결과 파싱**
   - 성공 시: PR URL 추출
   - 실패 시: 에러 메시지 파싱

## 사용 예시

### 입력
```json
{
  "changes": {
    "analysisMode": "branch",
    "filesChanged": 8,
    "linesAdded": 245,
    "linesDeleted": 32
  },
  "review": {
    "breakingChanges": [],
    "newFeatures": ["비동기 검증 기능"],
    "bugFixes": [],
    "refactorings": ["검증 로직 분리"]
  },
  "sourceBranch": "feature/async-validation",
  "targetBranch": "master"
}
```

### 출력
```json
{
  "success": true,
  "prUrl": "https://github.com/vincent-kk/albatrion/pull/123",
  "prNumber": 123,
  "title": "[Feat](schema-form): Add async validation support",
  "body": "## 📋 TL;DR\n비동기 검증 기능 추가...",
  "error": null
}
```

## 에러 처리

### 브랜치 푸시 실패
- **원인**: 원격 브랜치 없음 또는 권한 부족
- **대응**: 에러 메시지와 함께 수동 푸시 명령 제안

### PR 생성 실패
- **원인**: 동일 PR 이미 존재, 충돌, gh CLI 미설치
- **대응**: 구체적 에러 메시지 제공 및 해결 방법 안내

### GitHub CLI 미설치
- **원인**: `gh` 명령어 찾을 수 없음
- **대응**: 설치 가이드 링크 제공

## 의존성

### 필수
- Git 2.0+
- GitHub CLI (`gh`) 2.0+
- 유효한 GitHub 인증 (`gh auth login`)

### 선택
- `jq`: JSON 파싱 (대안: grep/sed)

## 제약 조건

- PR 제목 최대 길이: 72자
- PR 설명 최대 길이: 제한 없음 (권장: 500줄 이내)
- 브랜치명 제약: GitHub 브랜치 네이밍 규칙 준수

## 품질 보장

### 제목 품질
- ✅ 형식 준수: `[Type](scope): description`
- ✅ 명확성: 변경 내용을 정확히 반영
- ✅ 간결성: 72자 이내

### 설명 품질
- ✅ 구조화: 템플릿 섹션 모두 포함
- ✅ 완전성: 모든 주요 변경사항 기술
- ✅ 명확성: 리뷰어가 이해하기 쉬운 언어

### 실행 안정성
- ✅ 재시도 로직: 네트워크 오류 시 3회 재시도
- ✅ 타임아웃: 30초 이내 응답 없으면 중단
- ✅ 롤백 가능: PR 생성 실패 시 상태 복원

## 통합 워크플로우

```
사용자: /pr

1. git-change-analyzer 실행
   → 변경사항 수집 및 구조화

2. code-quality-reviewer 실행
   → 코드 품질 + PR 맥락 리뷰

3. pr-generator 실행 (이 스킬)
   → PR 제목/설명 생성
   → GitHub PR 생성
   → 결과 반환

4. 사용자에게 응답
   → PR URL 및 요약 제공
```

## 참고 자료

- `knowledge/pr-title-format.md`: 제목 형식 규칙
- `knowledge/pr-description-template.md`: 설명 템플릿
- `tools/create-github-pr.sh`: GitHub CLI 래퍼 스크립트
- [GitHub CLI 문서](https://cli.github.com/manual/)
- [Conventional Commits](https://www.conventionalcommits.org/)

## 에러 처리

```yaml
error_handling:
  severity_high:
    conditions:
      - gh CLI 미설치 또는 인증 실패
      - Git repository가 아님
      - 원격 repository가 설정되지 않음 (no remote)
      - 소스 브랜치가 존재하지 않음
      - 대상 브랜치가 존재하지 않음 (target branch)
      - 변경사항 없음 (empty diff)
    action: |
      ❌ 치명적 오류 - PR 생성 중단
      → gh CLI 설치 확인: gh --version
      → gh 인증 확인: gh auth status
      → Git repository 확인: git status
      → 원격 확인: git remote -v
      → 브랜치 확인: git branch -a
      → 재실행 명령어: gh pr create --base {target} --head {source}
    examples:
      - condition: "gh CLI 미설치"
        message: "❌ 오류: gh 명령을 찾을 수 없습니다"
        recovery: "GitHub CLI 설치: brew install gh (macOS) 또는 https://cli.github.com"
      - condition: "gh 인증 실패"
        message: "❌ 오류: GitHub 인증이 필요합니다"
        recovery: "인증 실행: gh auth login"
      - condition: "변경사항 없음"
        message: "❌ 오류: 소스 브랜치와 대상 브랜치가 동일합니다 (변경사항 없음)"
        recovery: "변경사항 커밋 후 재실행: git add . && git commit -m 'message' && git push"

  severity_medium:
    conditions:
      - 변경 유형 자동 감지 실패 (애매한 변경)
      - 영향받은 패키지 감지 실패 (monorepo)
      - 리뷰어 자동 할당 실패
      - 라벨 자동 할당 실패
      - Draft PR 여부 판단 불가
    action: |
      ⚠️  경고 - 기본값으로 PR 생성
      1. 변경 유형: [Chore] (기본값)
      2. 범위: root (기본값)
      3. 리뷰어: 자동 할당 생략 (PR 생성 후 수동 추가)
      4. 라벨: 없음 (PR 생성 후 수동 추가)
      5. Draft: false (일반 PR로 생성)
      6. PR 설명에 경고 추가:
         > ⚠️  WARNING: PR 메타데이터를 자동으로 설정할 수 없었습니다
         > → 제목, 라벨, 리뷰어를 수동으로 확인해주세요
    fallback_values:
      change_type: "[Chore]"
      scope: "root"
      reviewers: []
      labels: []
      draft: false
    examples:
      - condition: "변경 유형 불명확"
        message: "⚠️  경고: 변경 유형을 자동으로 판단할 수 없습니다 (Feature + Refactor 혼재)"
        fallback: "[Chore] 사용 → PR 제목 수동 수정 권장"
      - condition: "리뷰어 할당 실패"
        message: "⚠️  경고: CODEOWNERS 파일을 찾을 수 없습니다"
        fallback: "리뷰어 없이 PR 생성 → GitHub UI에서 수동 추가"

  severity_low:
    conditions:
      - PR 템플릿 파일 누락 (.github/pull_request_template.md)
      - 이슈 번호 자동 연결 실패 (commit message에 없음)
      - 스크린샷 자동 추가 실패
      - 체크리스트 자동 생성 실패
    action: |
      ℹ️  정보: 선택적 항목 생략 - PR 생성 진행
      → PR 템플릿 없이 기본 템플릿 사용
      → 이슈 연결 생략 (PR 설명에 "Closes #xxx" 수동 추가 가능)
      → 스크린샷 없이 PR 생성
      → 체크리스트 없이 간단한 설명만 포함
    examples:
      - condition: "PR 템플릿 없음"
        auto_handling: "기본 템플릿 사용 (TL;DR, 변경사항, 체크리스트)"
      - condition: "이슈 연결 실패"
        auto_handling: "이슈 번호 없이 PR 생성 (필요시 수동으로 'Closes #123' 추가)"
```
