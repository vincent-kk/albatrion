#!/bin/bash
# git_setup.sh - Git 사전 설정 자동화 스크립트
#
# 사용법: git_setup.sh
# 실행 시점: execution-engine 시작 전
#
# 기능:
# 1. Node 버전 관리 (nvm)
# 2. Git 저장소 동기화 (git pull)
# 3. 의존성 동기화 (yarn install)
# 4. 브랜치 검증

set -euo pipefail

echo "=== Git 사전 설정 시작 ==="
echo ""

# =============================================================================
# Step 1: Node 버전 관리
# =============================================================================

echo "→ Step 1: Node 버전 확인"

if [ -f .nvmrc ]; then
  REQUIRED_VERSION=$(cat .nvmrc)
  CURRENT_VERSION=$(nvm current 2>/dev/null || echo "none")

  if [ "$CURRENT_VERSION" != "v$REQUIRED_VERSION" ] && [ "$CURRENT_VERSION" != "$REQUIRED_VERSION" ]; then
    echo "  → Node 버전 전환: $CURRENT_VERSION → $REQUIRED_VERSION"

    nvm use 2>&1 | grep -v "is not installed" || {
      echo ""
      echo "⚠️ Node $REQUIRED_VERSION 설치 필요"
      echo "   실행: nvm install $REQUIRED_VERSION"
      echo ""
      exit 1
    }

    echo "  ✓ Node 버전 전환 완료: $(nvm current)"
  else
    echo "  ✓ Node 버전 일치: $CURRENT_VERSION"
  fi
else
  echo "  ⚠️ .nvmrc 파일 없음 - 현재 버전 사용: $(nvm current 2>/dev/null || node --version)"
fi

echo ""

# =============================================================================
# Step 2: Git 저장소 동기화
# =============================================================================

echo "→ Step 2: Git 저장소 동기화"

# 원격 정보 가져오기
git fetch origin --quiet

# Uncommitted 변경사항 검사
if [ -n "$(git status --porcelain)" ]; then
  echo ""
  echo "⚠️ Uncommitted 변경사항 감지"
  echo "   작업 전 커밋 또는 stash 필요:"
  echo ""
  git status --short
  echo ""
  echo "   → git stash (임시 저장)"
  echo "   → git commit -am 'WIP' (작업 중 커밋)"
  echo ""
  exit 1
fi

# Pull with rebase
CURRENT_BRANCH=$(git branch --show-current)
echo "  → 현재 브랜치: $CURRENT_BRANCH"

git pull --rebase origin "$CURRENT_BRANCH" --quiet 2>&1 | grep -v "Already up to date" || {
  # Rebase 충돌 감지
  if [ -d .git/rebase-merge ] || [ -d .git/rebase-apply ]; then
    echo ""
    echo "🚨 Merge 충돌 발생"
    echo ""
    echo "충돌 파일:"
    git status --short | grep "^UU"
    echo ""
    echo "해결 방법:"
    echo "1. 충돌 파일 수동 해결 (에디터에서)"
    echo "2. git add <resolved_file>"
    echo "3. git rebase --continue"
    echo ""
    echo "또는 취소:"
    echo "  git rebase --abort"
    echo ""

    git rebase --abort 2>/dev/null
    exit 1
  fi
}

echo "  ✓ Git 동기화 완료"
echo ""

# =============================================================================
# Step 3: 의존성 동기화
# =============================================================================

echo "→ Step 3: 의존성 확인"

# yarn.lock 변경 감지
LOCK_CHANGED=$(git diff HEAD@{1} HEAD --name-only 2>/dev/null | grep -c "yarn.lock" || echo "0")

if [ "$LOCK_CHANGED" -gt 0 ]; then
  echo "  → yarn.lock 변경 감지 - 의존성 재설치"

  yarn install --silent 2>&1 | grep -v "success" || {
    echo ""
    echo "🚨 yarn install 실패"
    echo ""
    exit 1
  }

  echo "  ✓ 의존성 설치 완료"
else
  # package.json 변경 감지 (옵션)
  PKG_CHANGED=$(git diff HEAD@{1} HEAD --name-only 2>/dev/null | grep -c "package.json" || echo "0")

  if [ "$PKG_CHANGED" -gt 0 ]; then
    echo "  ⚠️ package.json 변경되었으나 yarn.lock는 변경 없음"
    echo "     yarn install 실행 권장"
    echo ""

    # 안전하게 yarn install 실행
    yarn install --silent --check-files 2>&1 | grep -v "success" || true
    echo "  ✓ 의존성 확인 완료"
  else
    echo "  ✓ yarn.lock 변경 없음"
  fi
fi

# yarn.lock 충돌 검사
if git diff --name-only --diff-filter=U 2>/dev/null | grep -q "yarn.lock"; then
  echo ""
  echo "🚨 yarn.lock 충돌 발생"
  echo ""
  echo "해결 방법:"
  echo "1. git checkout --ours yarn.lock    # 현재 브랜치 우선"
  echo "2. git checkout --theirs yarn.lock  # 원격 브랜치 우선"
  echo "3. yarn install                      # 재생성"
  echo "4. git add yarn.lock"
  echo "5. git rebase --continue"
  echo ""
  exit 1
fi

echo ""

# =============================================================================
# Step 4: 브랜치 검증
# =============================================================================

echo "→ Step 4: 브랜치 확인"

CURRENT_BRANCH=$(git branch --show-current)

# main/master 체크
if [[ "$CURRENT_BRANCH" == "main" || "$CURRENT_BRANCH" == "master" ]]; then
  echo ""
  echo "🚨 경고: $CURRENT_BRANCH 브랜치에서 작업 중"
  echo ""
  echo "권장 사항:"
  echo "  Feature 브랜치 생성:"
  echo "  git checkout -b feature/your-feature-name"
  echo ""
  echo "계속 진행하시겠습니까? (y/N)"

  # CI 환경에서는 자동 진행
  if [ -n "${CI:-}" ]; then
    echo "  → CI 환경 감지, 계속 진행"
  else
    read -r RESPONSE
    if [[ ! "$RESPONSE" =~ ^[Yy]$ ]]; then
      echo "작업 중단"
      exit 1
    fi
  fi
fi

# 브랜치명 패턴 검증 (경고만)
if [[ ! "$CURRENT_BRANCH" =~ ^(feature|fix|refactor|chore|docs|test)/ ]]; then
  echo "  ⚠️ 브랜치명이 권장 패턴을 따르지 않습니다"
  echo "     권장: feature/*, fix/*, refactor/*, chore/*"
  echo "     현재: $CURRENT_BRANCH"
  echo ""
fi

echo "  ✓ 브랜치 검증 완료: $CURRENT_BRANCH"
echo ""

# =============================================================================
# 완료
# =============================================================================

echo "========================================="
echo "✅ 사전 설정 완료"
echo "========================================="
echo ""
echo "환경 정보:"
echo "  Node: $(node --version)"
echo "  Yarn: $(yarn --version)"
echo "  Branch: $CURRENT_BRANCH"
echo "  Clean: $(git status --porcelain | wc -l | xargs) uncommitted changes"
echo ""
