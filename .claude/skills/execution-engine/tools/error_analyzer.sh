#!/bin/bash
# error_analyzer.sh - 에러 타입 분류 및 복구 옵션 생성

# 사용법: error_analyzer.sh <error_message>
# 예시: error_analyzer.sh "Cannot find module '@/components/Button'"

set -euo pipefail

ERROR_MSG="${1:-}"

if [[ -z "$ERROR_MSG" ]]; then
  echo "Error: Error message required"
  echo "Usage: $0 <error_message>"
  exit 1
fi

# =============================================================================
# 에러 타입 감지
# =============================================================================

detect_error_type() {
  local error="$1"

  if [[ "$error" =~ "Cannot find module" ]]; then
    echo "Type A: Import Error"
  elif [[ "$error" =~ "is not defined" ]]; then
    echo "Type A: Syntax Error"
  elif [[ "$error" =~ "Type.*is not assignable" ]]; then
    echo "Type B: Logic/Type Error"
  elif [[ "$error" =~ "Module not found" ]]; then
    echo "Type C: Dependency Error"
  elif [[ "$error" =~ "Test.*failed" ]]; then
    echo "Type D: Test Failure"
  else
    echo "Unknown Error Type"
  fi
}

# =============================================================================
# 복구 옵션 생성
# =============================================================================

generate_recovery_options() {
  local error_type="$1"
  local error_msg="$2"

  echo "=== Recovery Options ==="

  case "$error_type" in
    "Type A: Import Error")
      echo "Option A: Fix import path (Score: 90)"
      echo "  - Use fileSearch to locate module"
      echo "  - Update import path"
      echo ""
      echo "Option B: Use alternative component (Score: 76)"
      echo "  - Search for similar components"
      echo "  - Update import"
      echo ""
      echo "Option C: Create missing module (Score: 68)"
      echo "  - Check requirements"
      echo "  - Generate module"
      ;;

    "Type C: Dependency Error")
      echo "Option A: Install missing dependency (Score: 95)"
      echo "  - Extract package name"
      echo "  - Run: yarn add <package>"
      ;;

    *)
      echo "Option A: Manual review required"
      ;;
  esac
}

# =============================================================================
# Main Execution
# =============================================================================

echo "Analyzing error: $ERROR_MSG"
echo ""

ERROR_TYPE=$(detect_error_type "$ERROR_MSG")
echo "Detected: $ERROR_TYPE"
echo ""

generate_recovery_options "$ERROR_TYPE" "$ERROR_MSG"
