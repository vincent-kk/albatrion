#!/bin/bash

##
# Coverage Analyzer Tool
#
# 테스트 커버리지를 분석하고 목표 미달 파일을 식별합니다.
#
# Usage:
#   ./coverage_analyzer.sh [threshold]
#
# Examples:
#   ./coverage_analyzer.sh          # 기본 임계값 70% 사용
#   ./coverage_analyzer.sh 80       # 임계값 80% 사용
##

set -euo pipefail

# 기본 임계값
THRESHOLD=${1:-70}

echo "🔍 Running test coverage analysis with threshold: ${THRESHOLD}%"
echo "================================================"

# 커버리지 실행
yarn test --coverage --reporter=json --reporter=text > /dev/null 2>&1 || true

# 커버리지 리포트 경로
COVERAGE_REPORT="coverage/coverage-summary.json"

if [[ ! -f "$COVERAGE_REPORT" ]]; then
  echo "❌ Error: Coverage report not found at $COVERAGE_REPORT"
  echo "   Please run 'yarn test --coverage' first"
  exit 1
fi

echo ""
echo "📊 Coverage Summary:"
echo "-------------------"

# jq로 전체 요약 추출
jq -r '.total | "Statements: \(.statements.pct)%\nBranches:   \(.branches.pct)%\nFunctions:  \(.functions.pct)%\nLines:      \(.lines.pct)%"' \
  "$COVERAGE_REPORT"

echo ""
echo "⚠️  Files Below Threshold (< ${THRESHOLD}%):"
echo "-------------------------------------------"

# 목표 미달 파일 추출
BELOW_THRESHOLD=$(jq -r --arg threshold "$THRESHOLD" '
  .[] |
  select(
    .statements.pct < ($threshold | tonumber) or
    .branches.pct < ($threshold | tonumber) or
    .functions.pct < ($threshold | tonumber) or
    .lines.pct < ($threshold | tonumber)
  ) |
  "\(.path | split("/") | .[-2:] | join("/"))  Statements: \(.statements.pct)%  Lines: \(.lines.pct)%"
' "$COVERAGE_REPORT" | sort)

if [[ -z "$BELOW_THRESHOLD" ]]; then
  echo "✅ All files meet the coverage threshold!"
else
  echo "$BELOW_THRESHOLD"
  echo ""
  echo "📝 Total files below threshold: $(echo "$BELOW_THRESHOLD" | wc -l | xargs)"
fi

echo ""
echo "📈 Coverage by Category:"
echo "------------------------"

# 카테고리별 분류
echo ""
echo "🔧 Utils (should be >= 80%):"
jq -r '.[] | select(.path | contains("/utils/")) | "\(.path | split("/") | .[-1])  \(.statements.pct)%"' \
  "$COVERAGE_REPORT" | head -10

echo ""
echo "🎨 Components (should be >= 60%):"
jq -r '.[] | select(.path | contains("/components/")) | "\(.path | split("/") | .[-1])  \(.statements.pct)%"' \
  "$COVERAGE_REPORT" | head -10

echo ""
echo "🪝 Hooks (should be >= 70%):"
jq -r '.[] | select(.path | contains("/hooks/")) | "\(.path | split("/") | .[-1])  \(.statements.pct)%"' \
  "$COVERAGE_REPORT" | head -10

echo ""
echo "================================================"
echo "✅ Coverage analysis complete!"
echo ""
echo "💡 Next steps:"
echo "   1. Add tests for files below threshold"
echo "   2. Run 'yarn test {filename}' to test individually"
echo "   3. Check coverage/index.html for detailed report"
