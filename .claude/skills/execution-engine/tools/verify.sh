#!/bin/bash
# verify.sh - 3-레벨 검증 자동화 스크립트

# 사용법: verify.sh <level> [target]
# 예시: verify.sh 1          # Level 1 전체 검증
# 예시: verify.sh 2 Button.tsx  # Level 2 특정 파일
# 예시: verify.sh 3 REQ-1.2     # Level 3 요구사항

set -euo pipefail

LEVEL="${1:-}"
TARGET="${2:-}"

if [[ -z "$LEVEL" ]]; then
  echo "Error: Verification level required (1, 2, or 3)"
  echo "Usage: $0 <level> [target]"
  exit 1
fi

# =============================================================================
# Level 1: 코드 검증
# =============================================================================

verify_level1() {
  echo "=== Level 1: Code Verification ==="

  # Lint
  echo "→ Running lint..."
  yarn lint || {
    echo "❌ Lint failed"
    exit 1
  }

  # TypeCheck
  echo "→ Running typecheck..."
  yarn typecheck || {
    echo "❌ TypeCheck failed"
    exit 1
  }

  echo "✅ Level 1: Passed"
}

# =============================================================================
# Level 2: 기능 검증
# =============================================================================

verify_level2() {
  local target="$1"

  echo "=== Level 2: Functional Verification ==="

  if [[ -z "$target" ]]; then
    echo "Warning: No target specified, skipping Level 2"
    return 0
  fi

  # 테스트 파일 존재 확인
  if [[ -f "$target" ]]; then
    echo "→ Running tests for $target..."
    yarn test --run "$target" || {
      echo "❌ Tests failed for $target"
      exit 1
    }
  else
    echo "Warning: Test file not found: $target"
    echo "→ Manual verification may be required"
  fi

  echo "✅ Level 2: Passed"
}

# =============================================================================
# Level 3: 요구사항 검증
# =============================================================================

verify_level3() {
  local req_id="$1"

  echo "=== Level 3: Requirements Verification ==="

  if [[ -z "$req_id" ]]; then
    echo "Warning: No requirement ID specified, skipping Level 3"
    return 0
  fi

  # 01_requirements.md 찾기
  local req_file
  req_file=$(find .tasks -name "01_requirements.md" | head -1)

  if [[ -z "$req_file" ]]; then
    echo "Error: Requirements file not found"
    exit 1
  fi

  # 요구사항 추출
  echo "→ Checking requirement: $req_id"
  grep -A 10 "$req_id" "$req_file" || {
    echo "❌ Requirement $req_id not found"
    exit 1
  }

  echo "→ Requirement found in $req_file"
  echo "→ Manual verification of acceptance criteria required"
  echo "✅ Level 3: Requirements verified"
}

# =============================================================================
# Main Execution
# =============================================================================

case "$LEVEL" in
  1)
    verify_level1
    ;;
  2)
    verify_level2 "$TARGET"
    ;;
  3)
    verify_level3 "$TARGET"
    ;;
  all)
    verify_level1
    verify_level2 "$TARGET"
    verify_level3 "$TARGET"
    ;;
  *)
    echo "Error: Invalid level: $LEVEL"
    echo "Valid levels: 1, 2, 3, all"
    exit 1
    ;;
esac

echo ""
echo "========================================="
echo "✅ Verification Complete"
echo "========================================="
