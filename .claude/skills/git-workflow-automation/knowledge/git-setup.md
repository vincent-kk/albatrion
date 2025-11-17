# Git 사전 설정 프로토콜

## 실행 시점

모든 작업 실행 전 (`execution-engine` 시작 전) 자동 실행

## 4단계 검증 체크리스트

### 1. Node 버전 관리 (nvm)

**목적**: 프로젝트 요구 Node 버전과 환경 일치 보장

**자동 실행 로직**:
```bash
# .nvmrc 파일 존재 확인
if [ -f .nvmrc ]; then
  REQUIRED_VERSION=$(cat .nvmrc)
  CURRENT_VERSION=$(nvm current)

  if [ "$CURRENT_VERSION" != "$REQUIRED_VERSION" ]; then
    echo "→ Node 버전 전환: $CURRENT_VERSION → $REQUIRED_VERSION"
    nvm use

    # 설치되지 않은 경우
    if [ $? -ne 0 ]; then
      echo "⚠️ Node $REQUIRED_VERSION 설치 필요"
      echo "   실행: nvm install $REQUIRED_VERSION"
      exit 1  # 사용자 개입 필요
    fi
  else
    echo "✓ Node 버전 일치: $CURRENT_VERSION"
  fi
else
  echo "⚠️ .nvmrc 파일 없음 - 현재 버전 사용: $(nvm current)"
fi
```

**자율 vs 사용자 개입**:
```yaml
autonomous:
  - .nvmrc 존재 + 버전 설치됨 → nvm use 자동 실행

user_intervention:
  - .nvmrc 버전 미설치 → nvm install 안내 후 대기
  - .nvmrc 없음 → 경고만 출력, 계속 진행
```

---

### 2. Git 저장소 동기화

**목적**: 최신 원격 변경사항 반영 및 충돌 사전 감지

**동기화 프로토콜**:
```bash
# Step 1: 원격 정보 가져오기
git fetch origin

# Step 2: 현재 상태 확인
git status --porcelain

# Step 3: Uncommitted 변경사항 검사
if [ -n "$(git status --porcelain)" ]; then
  echo "⚠️ Uncommitted 변경사항 감지"
  echo "   작업 전 커밋 또는 stash 필요"
  exit 1  # 사용자 개입 필요
fi

# Step 4: Pull with rebase
CURRENT_BRANCH=$(git branch --show-current)
git pull --rebase origin "$CURRENT_BRANCH"

if [ $? -ne 0 ]; then
  echo "🚨 Merge 충돌 발생"
  echo "   충돌 해결 후 다시 시도"
  git rebase --abort  # 안전하게 중단
  exit 1  # 사용자 개입 필요
fi

echo "✓ Git 동기화 완료"
```

**충돌 처리**:
```yaml
no_conflict:
  - git pull --rebase 성공 → 자동 진행

conflict_detected:
  - 충돌 파일 리스트 출력
  - git rebase --abort 실행
  - 사용자에게 수동 해결 요청
  - 해결 후 재실행 안내
```

---

### 3. 의존성 동기화

**목적**: package.json 및 yarn.lock 변경사항 반영

**자동 감지 로직**:
```bash
# Step 1: yarn.lock 변경 감지
LOCK_CHANGED=$(git diff HEAD@{1} HEAD --name-only | grep -c "yarn.lock")

if [ "$LOCK_CHANGED" -gt 0 ]; then
  echo "→ yarn.lock 변경 감지 - 의존성 재설치"
  yarn install

  if [ $? -ne 0 ]; then
    echo "🚨 yarn install 실패"
    exit 1
  fi

  echo "✓ 의존성 설치 완료"
else
  echo "✓ yarn.lock 변경 없음"
fi

# Step 2: package.json 변경 감지 (옵션)
PKG_CHANGED=$(git diff HEAD@{1} HEAD --name-only | grep -c "package.json")

if [ "$PKG_CHANGED" -gt 0 ] && [ "$LOCK_CHANGED" -eq 0 ]; then
  echo "⚠️ package.json 변경되었으나 yarn.lock는 변경 없음"
  echo "   yarn install 실행 권장"

  # 자동 실행 (안전)
  yarn install
fi
```

**yarn.lock 충돌 처리**:
```bash
# yarn.lock 충돌 감지
if git diff --name-only --diff-filter=U | grep -q "yarn.lock"; then
  echo "🚨 yarn.lock 충돌 발생"
  echo ""
  echo "해결 방법:"
  echo "1. git checkout --ours yarn.lock    # 현재 브랜치 우선"
  echo "2. git checkout --theirs yarn.lock  # 원격 브랜치 우선"
  echo "3. yarn install                      # 재생성"
  echo "4. git add yarn.lock"
  echo "5. git rebase --continue"
  exit 1
fi
```

---

### 4. 브랜치 검증

**목적**: main/master 직접 작업 방지, feature 브랜치 권장

**검증 로직**:
```bash
CURRENT_BRANCH=$(git branch --show-current)

# main/master 체크
if [[ "$CURRENT_BRANCH" == "main" || "$CURRENT_BRANCH" == "master" ]]; then
  echo "🚨 경고: $CURRENT_BRANCH 브랜치에서 작업 중"
  echo ""
  echo "권장 사항:"
  echo "1. Feature 브랜치 생성"
  echo "   git checkout -b feature/your-feature-name"
  echo ""
  echo "계속 진행하시겠습니까? (y/N)"

  # 사용자 입력 대기 (자동화 환경에서는 스킵 가능)
  read -r RESPONSE
  if [[ ! "$RESPONSE" =~ ^[Yy]$ ]]; then
    echo "작업 중단"
    exit 1
  fi
fi

# 브랜치명 패턴 검증 (옵션)
if [[ ! "$CURRENT_BRANCH" =~ ^(feature|fix|refactor|chore)/ ]]; then
  echo "⚠️ 브랜치명이 권장 패턴을 따르지 않습니다"
  echo "   권장: feature/*, fix/*, refactor/*, chore/*"
  echo "   현재: $CURRENT_BRANCH"
  # 경고만 출력, 계속 진행
fi

echo "✓ 브랜치 검증 완료: $CURRENT_BRANCH"
```

**브랜치 네이밍 가이드**:
```yaml
recommended_patterns:
  feature: "feature/add-button-component"
  fix: "fix/authentication-bug"
  refactor: "refactor/split-api-module"
  chore: "chore/update-dependencies"
  docs: "docs/update-readme"
  test: "test/add-integration-tests"

discouraged:
  - "my-branch" (너무 일반적)
  - "temp" (목적 불명확)
  - "fix-bug" (구체성 부족)
```

---

## 전체 실행 순서

```bash
#!/bin/bash
# git_setup.sh - 전체 프로토콜

set -e  # 에러 발생 시 즉시 종료

echo "=== Git 사전 설정 시작 ==="
echo ""

# 1. Node 버전 관리
echo "→ Step 1: Node 버전 확인"
[nvm 검증 로직]

# 2. Git 동기화
echo "→ Step 2: Git 저장소 동기화"
[git pull 로직]

# 3. 의존성 동기화
echo "→ Step 3: 의존성 확인"
[yarn install 로직]

# 4. 브랜치 검증
echo "→ Step 4: 브랜치 확인"
[브랜치 검증 로직]

echo ""
echo "✅ 사전 설정 완료"
echo "==================================="
```

---

## 에러 복구 전략

### nvm 에러
```bash
Error: nvm: command not found

해결:
1. nvm 설치 확인: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
2. 셸 재시작: source ~/.bashrc (또는 ~/.zshrc)
3. nvm 버전 확인: nvm --version
```

### Git 충돌
```bash
Error: Merge conflict in <file>

해결:
1. 충돌 파일 확인: git status
2. 충돌 수동 해결 (에디터에서)
3. 해결 후 스테이징: git add <file>
4. Rebase 계속: git rebase --continue

또는 취소:
git rebase --abort
```

### yarn 에러
```bash
Error: yarn install failed

해결:
1. 캐시 정리: yarn cache clean
2. node_modules 삭제: rm -rf node_modules
3. 재설치: yarn install

또는 lock 재생성:
rm yarn.lock
yarn install
```

---

## 자율 실행 vs 사용자 개입 요약

### ✅ 자율 실행 (Autonomous)
- nvm use (.nvmrc 버전 설치됨)
- git pull --rebase (충돌 없음)
- yarn install (lock 변경 감지)
- 브랜치 검증 (feature/* 패턴)

### 🛑 사용자 개입 필요 (User Intervention)
- nvm install (버전 미설치)
- Merge 충돌 해결
- main/master 브랜치 작업 확인
- yarn.lock 충돌 해결
- Uncommitted 변경사항 처리

---

> **Best Practice**: 작업 시작 전 항상 `git_setup.sh` 실행
> **Automation**: CI/CD 환경에서도 동일한 프로토콜 적용 가능
