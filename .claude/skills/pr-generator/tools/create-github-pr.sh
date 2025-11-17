#!/usr/bin/env bash

# create-github-pr.sh
# GitHub CLI를 사용하여 Pull Request를 생성하는 래퍼 스크립트

set -euo pipefail

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 로깅 함수
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

# 사용법 출력
usage() {
    cat << EOF
Usage: $0 --title TITLE --body BODY --base BASE --head HEAD [OPTIONS]

Required:
  --title TITLE    PR 제목
  --body BODY      PR 설명 (마크다운 형식)
  --base BASE      타겟 브랜치 (예: master, main)
  --head HEAD      소스 브랜치 (현재 브랜치)

Optional:
  --draft          Draft PR로 생성
  --help           이 도움말 출력

Examples:
  $0 --title "[Feat] Add async validation" \\
     --body "## Changes..." \\
     --base master \\
     --head feature/async-validation

  $0 --title "[Fix] Bug fix" \\
     --body "\$(cat pr-body.md)" \\
     --base main \\
     --head bugfix/issue-123 \\
     --draft
EOF
}

# 파라미터 파싱
TITLE=""
BODY=""
BASE=""
HEAD=""
DRAFT=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --title)
            TITLE="$2"
            shift 2
            ;;
        --body)
            BODY="$2"
            shift 2
            ;;
        --base)
            BASE="$2"
            shift 2
            ;;
        --head)
            HEAD="$2"
            shift 2
            ;;
        --draft)
            DRAFT=true
            shift
            ;;
        --help)
            usage
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# 필수 파라미터 검증
if [[ -z "$TITLE" || -z "$BODY" || -z "$BASE" || -z "$HEAD" ]]; then
    log_error "Missing required parameters"
    usage
    exit 1
fi

# GitHub CLI 설치 확인
if ! command -v gh &> /dev/null; then
    log_error "GitHub CLI (gh) is not installed"
    echo ""
    echo "Install instructions:"
    echo "  macOS:   brew install gh"
    echo "  Linux:   https://github.com/cli/cli/blob/trunk/docs/install_linux.md"
    echo "  Windows: https://github.com/cli/cli/releases"
    exit 1
fi

# GitHub CLI 인증 확인
if ! gh auth status &> /dev/null; then
    log_error "GitHub CLI is not authenticated"
    echo ""
    echo "Please run: gh auth login"
    exit 1
fi

# Git 저장소 확인
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    log_error "Not a git repository"
    exit 1
fi

# 브랜치 존재 확인
if ! git show-ref --verify --quiet "refs/heads/$HEAD"; then
    log_error "Source branch '$HEAD' does not exist"
    exit 1
fi

# 현재 브랜치 확인
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "$HEAD" ]]; then
    log_warn "Current branch ($CURRENT_BRANCH) differs from HEAD ($HEAD)"
    log_info "Switching to $HEAD..."
    git checkout "$HEAD"
fi

# 원격 브랜치 푸시 확인 및 푸시
log_info "Checking remote branch..."

if ! git ls-remote --exit-code --heads origin "$HEAD" &> /dev/null; then
    log_info "Remote branch not found. Pushing $HEAD to origin..."

    if ! git push -u origin "$HEAD"; then
        log_error "Failed to push branch to remote"
        exit 1
    fi

    log_info "Branch pushed successfully"
else
    log_info "Remote branch exists. Checking if up-to-date..."

    # 로컬과 원격 차이 확인
    LOCAL=$(git rev-parse "$HEAD")
    REMOTE=$(git rev-parse "origin/$HEAD")

    if [[ "$LOCAL" != "$REMOTE" ]]; then
        log_warn "Local and remote branches differ"
        log_info "Pushing latest changes..."

        if ! git push origin "$HEAD"; then
            log_error "Failed to push changes to remote"
            exit 1
        fi

        log_info "Changes pushed successfully"
    else
        log_info "Branch is up-to-date with remote"
    fi
fi

# PR 생성
log_info "Creating Pull Request..."

# Draft 플래그 처리
DRAFT_FLAG=""
if [[ "$DRAFT" == true ]]; then
    DRAFT_FLAG="--draft"
    log_info "Creating as draft PR"
fi

# PR 생성 (재시도 로직 포함)
MAX_RETRIES=3
RETRY_COUNT=0

while [[ $RETRY_COUNT -lt $MAX_RETRIES ]]; do
    if PR_URL=$(gh pr create \
        --title "$TITLE" \
        --body "$BODY" \
        --base "$BASE" \
        --head "$HEAD" \
        $DRAFT_FLAG \
        2>&1); then

        log_info "Pull Request created successfully!"
        echo ""
        echo "PR URL: $PR_URL"

        # PR 번호 추출
        if [[ "$PR_URL" =~ /pull/([0-9]+) ]]; then
            PR_NUMBER="${BASH_REMATCH[1]}"
            echo "PR Number: #$PR_NUMBER"
        fi

        exit 0
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))

        # 에러 메시지 분석
        if echo "$PR_URL" | grep -q "already exists"; then
            log_error "PR already exists for this branch"
            echo ""
            echo "Existing PR:"
            gh pr list --head "$HEAD" --base "$BASE"
            exit 1
        elif echo "$PR_URL" | grep -q "No commits between"; then
            log_error "No commits between $BASE and $HEAD"
            echo ""
            echo "The branches are identical. No changes to create a PR."
            exit 1
        elif echo "$PR_URL" | grep -q "GraphQL"; then
            log_warn "GitHub API error (attempt $RETRY_COUNT/$MAX_RETRIES)"

            if [[ $RETRY_COUNT -lt $MAX_RETRIES ]]; then
                SLEEP_TIME=$((RETRY_COUNT * 2))
                log_info "Retrying in $SLEEP_TIME seconds..."
                sleep "$SLEEP_TIME"
            fi
        else
            log_error "Failed to create PR"
            echo ""
            echo "Error details:"
            echo "$PR_URL"
            exit 1
        fi
    fi
done

log_error "Failed to create PR after $MAX_RETRIES attempts"
exit 1
