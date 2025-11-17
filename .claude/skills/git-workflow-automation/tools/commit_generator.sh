#!/bin/bash
# commit_generator.sh - 커밋 메시지 자동 생성 스크립트
#
# 사용법: commit_generator.sh <task_id> <type>
# 예시: commit_generator.sh 2.3 feature
# 예시: commit_generator.sh 2.3 docs

set -euo pipefail

TASK_ID="${1:-}"
COMMIT_TYPE="${2:-feature}"

if [[ -z "$TASK_ID" ]]; then
  echo "Error: Task ID required"
  echo "Usage: $0 <task_id> <type>"
  echo "Example: $0 2.3 feature"
  echo "Example: $0 2.3 docs"
  exit 1
fi

# =============================================================================
# Step 1: 작업 정보 추출
# =============================================================================

PLAN_FILE=".tasks/current/03_plan.md"

if [ ! -f "$PLAN_FILE" ]; then
  # Fallback: 다른 위치 탐색
  PLAN_FILE=$(find .tasks -name "03_plan.md" | head -1)

  if [ -z "$PLAN_FILE" ]; then
    echo "Error: 03_plan.md not found"
    exit 1
  fi
fi

# 작업 블록 추출 (작업 ID부터 다음 작업 또는 Phase까지)
TASK_BLOCK=$(awk "/^- \[ \] $TASK_ID:/,/^- \[ \] [0-9]/ {print; if (/^- \[ \] [0-9]/ && !/^- \[ \] $TASK_ID:/) exit}" "$PLAN_FILE")

if [ -z "$TASK_BLOCK" ]; then
  echo "Error: Task $TASK_ID not found in $PLAN_FILE"
  exit 1
fi

# 필드 추출
TASK_TITLE=$(echo "$TASK_BLOCK" | grep "^- \[ \] $TASK_ID:" | sed "s/^- \[ \] $TASK_ID: //")
TASK_FILES=$(echo "$TASK_BLOCK" | grep -A 5 "파일:" | grep "^  -" | sed "s/^  - //")
TASK_CONTENT=$(echo "$TASK_BLOCK" | grep -A 10 "내용:" | grep "^  -" | sed "s/^  - //" | head -3)
TASK_METHOD=$(echo "$TASK_BLOCK" | grep -A 10 "방법:" | grep "^  -" | sed "s/^  - //" | head -3)
TASK_REQ=$(echo "$TASK_BLOCK" | grep "Requirements:" | sed "s/.*Requirements: //")

# =============================================================================
# Step 2: Type 결정
# =============================================================================

TYPE="feat"

if [ "$COMMIT_TYPE" = "docs" ]; then
  TYPE="docs"
else
  # 파일 확장자 및 키워드로 Type 추론
  if echo "$TASK_FILES" | grep -q "test\|spec"; then
    TYPE="test"
  elif echo "$TASK_TITLE" | grep -iq "fix\|bug"; then
    TYPE="fix"
  elif echo "$TASK_TITLE" | grep -iq "refactor"; then
    TYPE="refactor"
  elif echo "$TASK_TITLE" | grep -iq "perf\|performance\|optimize"; then
    TYPE="perf"
  elif echo "$TASK_FILES" | grep -q "eslint\|prettier\|tsconfig"; then
    TYPE="build"
  else
    TYPE="feat"
  fi
fi

# =============================================================================
# Step 3: Scope 추출
# =============================================================================

SCOPE=""

# 파일 경로에서 Scope 추출
FIRST_FILE=$(echo "$TASK_FILES" | head -1)

if echo "$FIRST_FILE" | grep -q "packages/"; then
  # Monorepo 패키지명 추출
  SCOPE=$(echo "$FIRST_FILE" | sed -E "s|packages/([^/]+)/.*|\1|")
elif echo "$FIRST_FILE" | grep -q "src/"; then
  # src 하위 디렉토리 추출
  SCOPE=$(echo "$FIRST_FILE" | sed -E "s|src/([^/]+)/.*|\1|")
fi

# 작업 제목에서 Scope 추론 (fallback)
if [ -z "$SCOPE" ]; then
  if echo "$TASK_TITLE" | grep -iq "button\|form\|modal\|컴포넌트"; then
    SCOPE="ui"
  elif echo "$TASK_TITLE" | grep -iq "auth\|인증"; then
    SCOPE="auth"
  elif echo "$TASK_TITLE" | grep -iq "api\|graphql"; then
    SCOPE="api"
  elif echo "$TASK_TITLE" | grep -iq "util\|helper"; then
    SCOPE="utils"
  fi
fi

# =============================================================================
# Step 4: Subject 생성
# =============================================================================

# 작업 제목을 소문자로 변환하고 정제
SUBJECT=$(echo "$TASK_TITLE" | tr '[:upper:]' '[:lower:]' | sed -E "s/(구현|작성|추가|수정|생성)//g" | xargs)

# 동사 추가 (Type에 따라)
case "$TYPE" in
  feat)
    if ! echo "$SUBJECT" | grep -q "^add\|^implement\|^create"; then
      SUBJECT="implement $SUBJECT"
    fi
    ;;
  fix)
    if ! echo "$SUBJECT" | grep -q "^fix\|^resolve"; then
      SUBJECT="fix $SUBJECT"
    fi
    ;;
  refactor)
    if ! echo "$SUBJECT" | grep -q "^refactor\|^improve"; then
      SUBJECT="refactor $SUBJECT"
    fi
    ;;
  docs)
    if ! echo "$SUBJECT" | grep -q "^add\|^update"; then
      SUBJECT="add $SUBJECT"
    fi
    ;;
  test)
    if ! echo "$SUBJECT" | grep -q "^add\|^update"; then
      SUBJECT="add tests for $SUBJECT"
    fi
    ;;
esac

# 50자 제한
if [ ${#SUBJECT} -gt 50 ]; then
  SUBJECT=$(echo "$SUBJECT" | cut -c 1-47)...
fi

# =============================================================================
# Step 5: Body 생성 (옵션)
# =============================================================================

BODY=""

if [ "$COMMIT_TYPE" = "feature" ]; then
  # 내용(Content) 필드를 Body로 변환
  while IFS= read -r line; do
    BODY="${BODY}- $line\n"
  done <<< "$TASK_CONTENT"

  # 방법(Method) 필드 추가 (옵션)
  if [ -n "$TASK_METHOD" ]; then
    BODY="${BODY}\n"
    while IFS= read -r line; do
      BODY="${BODY}- $line\n"
    done <<< "$TASK_METHOD"
  fi
fi

# 요구사항 참조 추가
if [ -n "$TASK_REQ" ]; then
  BODY="${BODY}\nRelates to: $TASK_REQ"
fi

# Task ID 참조
BODY="${BODY}\nTask: $TASK_ID"

# =============================================================================
# Step 6: 메시지 조합
# =============================================================================

# Header (Type + Scope + Subject)
if [ -n "$SCOPE" ]; then
  HEADER="$TYPE($SCOPE): $SUBJECT"
else
  HEADER="$TYPE: $SUBJECT"
fi

# Full message (Header + Body)
if [ -n "$BODY" ]; then
  MESSAGE="$HEADER

$(echo -e "$BODY")"
else
  MESSAGE="$HEADER"
fi

# =============================================================================
# 출력
# =============================================================================

echo "$MESSAGE"
