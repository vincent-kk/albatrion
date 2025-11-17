#!/bin/bash

# run-quality-check.sh
# @canard/schema-form 플러그인용 코드 품질 자동 검사 스크립트
#
# 사용법:
#   ./run-quality-check.sh [target-dir] [options]
#
# 예시:
#   ./run-quality-check.sh src/
#   ./run-quality-check.sh src/ --strict
#   ./run-quality-check.sh src/ --json > quality-report.json

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# 기본 설정
DEFAULT_TARGET="src/"
STRICT_MODE=false
JSON_OUTPUT=false
VERBOSE=false
MIN_SCORE=70

# 품질 가중치 (knowledge/quality-standards.md 참고)
WEIGHT_COMPLEXITY=0.15
WEIGHT_FUNCTION_LENGTH=0.08
WEIGHT_FILE_SIZE=0.07
WEIGHT_NESTING_DEPTH=0.10
WEIGHT_DUPLICATION=0.12
WEIGHT_TYPE_COVERAGE=0.18
WEIGHT_NAMING=0.10
WEIGHT_COMMENTS=0.08
WEIGHT_ERROR_HANDLING=0.07
WEIGHT_TESTING=0.05

# 도움말 표시
show_help() {
  cat << EOF
${BLUE}코드 품질 자동 검사 스크립트${NC}

${GREEN}사용법:${NC}
  $0 [target-dir] [options]

${GREEN}인자:${NC}
  target-dir     검사할 디렉토리 [기본값: src/]

${GREEN}옵션:${NC}
  -h, --help           도움말 표시
  -v, --verbose        상세 출력
  -s, --strict         엄격 모드 (최소 점수 80점)
  -j, --json           JSON 형식으로 출력
  -m, --min-score N    최소 품질 점수 설정 (기본값: 70)
  --no-color           색상 출력 비활성화

${GREEN}예시:${NC}
  # src/ 디렉토리 검사
  $0 src/

  # 엄격 모드로 검사
  $0 src/ --strict

  # JSON 형식으로 결과 저장
  $0 src/ --json > quality-report.json

  # 최소 점수 85점으로 검사
  $0 src/ --min-score 85

${GREEN}품질 메트릭:${NC}
  - Cyclomatic Complexity (가중치: 15%)
  - Function Length (가중치: 8%)
  - File Size (가중치: 7%)
  - Nesting Depth (가중치: 10%)
  - Code Duplication (가중치: 12%)
  - Type Coverage (가중치: 18%)
  - Naming Quality (가중치: 10%)
  - Comment Density (가중치: 8%)
  - Error Handling (가중치: 7%)
  - Test Coverage (가중치: 5%)

${GREEN}품질 등급:${NC}
  90-100: Excellent (S등급)
  80-89:  Good (A등급)
  70-79:  Acceptable (B등급)
  60-69:  Needs Improvement (C등급)
  0-59:   Poor (F등급)

EOF
}

# 옵션 파싱
while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      show_help
      exit 0
      ;;
    -v|--verbose)
      VERBOSE=true
      shift
      ;;
    -s|--strict)
      STRICT_MODE=true
      MIN_SCORE=80
      shift
      ;;
    -j|--json)
      JSON_OUTPUT=true
      shift
      ;;
    -m|--min-score)
      MIN_SCORE="$2"
      shift 2
      ;;
    --no-color)
      RED=''
      GREEN=''
      YELLOW=''
      BLUE=''
      CYAN=''
      MAGENTA=''
      NC=''
      shift
      ;;
    *)
      if [ -z "$TARGET_DIR" ]; then
        TARGET_DIR="$1"
      else
        echo -e "${RED}오류: 알 수 없는 인자 '$1'${NC}"
        show_help
        exit 1
      fi
      shift
      ;;
  esac
done

# 기본값 설정
TARGET_DIR="${TARGET_DIR:-$DEFAULT_TARGET}"

# 대상 디렉토리 존재 확인
if [ ! -d "$TARGET_DIR" ]; then
  echo -e "${RED}오류: 디렉토리를 찾을 수 없습니다: $TARGET_DIR${NC}"
  exit 1
fi

# 필요한 도구 확인
check_requirements() {
  local missing_tools=()

  if ! command -v eslint &> /dev/null; then
    missing_tools+=("eslint")
  fi

  if ! command -v tsc &> /dev/null; then
    missing_tools+=("typescript")
  fi

  if [ ${#missing_tools[@]} -gt 0 ]; then
    echo -e "${YELLOW}경고: 다음 도구가 설치되지 않았습니다:${NC}"
    for tool in "${missing_tools[@]}"; do
      echo "  - $tool"
    done
    echo ""
    echo "일부 검사가 제한될 수 있습니다."
    echo ""
  fi
}

check_requirements

# JSON 출력 시작
if [ "$JSON_OUTPUT" = true ]; then
  echo "{"
  echo "  \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\","
  echo "  \"target\": \"$TARGET_DIR\","
  echo "  \"metrics\": {"
fi

# 1. Cyclomatic Complexity 검사
check_complexity() {
  if [ "$VERBOSE" = true ]; then
    echo -e "${BLUE}[1/10] Cyclomatic Complexity 검사 중...${NC}"
  fi

  # ESLint complexity 규칙 사용
  local complexity_violations=0
  if command -v eslint &> /dev/null; then
    complexity_violations=$(eslint "$TARGET_DIR" --rule 'complexity: [error, 10]' --format json 2>/dev/null | \
      jq '[.[] | .messages[]] | length' || echo "0")
  fi

  # 점수 계산 (위반 없음 = 100점)
  local score=100
  if [ "$complexity_violations" -gt 0 ]; then
    score=$((100 - complexity_violations * 5))
    if [ $score -lt 0 ]; then score=0; fi
  fi

  echo "$score"
}

# 2. Function Length 검사
check_function_length() {
  if [ "$VERBOSE" = true ]; then
    echo -e "${BLUE}[2/10] Function Length 검사 중...${NC}"
  fi

  # max-lines-per-function 규칙 사용
  local violations=0
  if command -v eslint &> /dev/null; then
    violations=$(eslint "$TARGET_DIR" --rule 'max-lines-per-function: [error, 50]' --format json 2>/dev/null | \
      jq '[.[] | .messages[]] | length' || echo "0")
  fi

  local score=100
  if [ "$violations" -gt 0 ]; then
    score=$((100 - violations * 10))
    if [ $score -lt 0 ]; then score=0; fi
  fi

  echo "$score"
}

# 3. File Size 검사
check_file_size() {
  if [ "$VERBOSE" = true ]; then
    echo -e "${BLUE}[3/10] File Size 검사 중...${NC}"
  fi

  # 300줄 이상인 파일 찾기
  local large_files=0
  while IFS= read -r file; do
    local lines=$(wc -l < "$file" | tr -d ' ')
    if [ "$lines" -gt 300 ]; then
      ((large_files++))
    fi
  done < <(find "$TARGET_DIR" -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx")

  local score=100
  if [ "$large_files" -gt 0 ]; then
    score=$((100 - large_files * 15))
    if [ $score -lt 0 ]; then score=0; fi
  fi

  echo "$score"
}

# 4. Nesting Depth 검사
check_nesting_depth() {
  if [ "$VERBOSE" = true ]; then
    echo -e "${BLUE}[4/10] Nesting Depth 검사 중...${NC}"
  fi

  # max-depth 규칙 사용
  local violations=0
  if command -v eslint &> /dev/null; then
    violations=$(eslint "$TARGET_DIR" --rule 'max-depth: [error, 3]' --format json 2>/dev/null | \
      jq '[.[] | .messages[]] | length' || echo "0")
  fi

  local score=100
  if [ "$violations" -gt 0 ]; then
    score=$((100 - violations * 10))
    if [ $score -lt 0 ]; then score=0; fi
  fi

  echo "$score"
}

# 5. Code Duplication 검사
check_duplication() {
  if [ "$VERBOSE" = true ]; then
    echo -e "${BLUE}[5/10] Code Duplication 검사 중...${NC}"
  fi

  # jscpd 또는 간단한 중복 검사
  local duplication_score=90  # 기본값

  # TODO: jscpd 통합 시 실제 중복률 계산
  # if command -v jscpd &> /dev/null; then
  #   duplication_rate=$(jscpd "$TARGET_DIR" --format json | jq '.statistics.total.percentage')
  #   duplication_score=$((100 - duplication_rate))
  # fi

  echo "$duplication_score"
}

# 6. Type Coverage 검사
check_type_coverage() {
  if [ "$VERBOSE" = true ]; then
    echo -e "${BLUE}[6/10] Type Coverage 검사 중...${NC}"
  fi

  # TypeScript 타입 검사
  local type_errors=0
  if command -v tsc &> /dev/null; then
    type_errors=$(tsc --noEmit --pretty false 2>&1 | grep -c "error TS" || echo "0")
  fi

  local score=100
  if [ "$type_errors" -gt 0 ]; then
    score=$((100 - type_errors * 3))
    if [ $score -lt 0 ]; then score=0; fi
  fi

  echo "$score"
}

# 7. Naming Quality 검사
check_naming() {
  if [ "$VERBOSE" = true ]; then
    echo -e "${BLUE}[7/10] Naming Quality 검사 중...${NC}"
  fi

  # camelcase, naming-convention 규칙 사용
  local violations=0
  if command -v eslint &> /dev/null; then
    violations=$(eslint "$TARGET_DIR" --rule 'camelcase: error' --format json 2>/dev/null | \
      jq '[.[] | .messages[]] | length' || echo "0")
  fi

  local score=100
  if [ "$violations" -gt 0 ]; then
    score=$((100 - violations * 5))
    if [ $score -lt 0 ]; then score=0; fi
  fi

  echo "$score"
}

# 8. Comment Density 검사
check_comments() {
  if [ "$VERBOSE" = true ]; then
    echo -e "${BLUE}[8/10] Comment Density 검사 중...${NC}"
  fi

  local total_lines=0
  local comment_lines=0

  while IFS= read -r file; do
    local file_lines=$(wc -l < "$file" | tr -d ' ')
    local file_comments=$(grep -c "^\s*\/\/" "$file" || echo "0")
    total_lines=$((total_lines + file_lines))
    comment_lines=$((comment_lines + file_comments))
  done < <(find "$TARGET_DIR" -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx")

  local density=0
  if [ "$total_lines" -gt 0 ]; then
    density=$((comment_lines * 100 / total_lines))
  fi

  # 이상적인 주석 밀도: 10-20%
  local score=100
  if [ "$density" -lt 5 ]; then
    score=50
  elif [ "$density" -lt 10 ]; then
    score=70
  elif [ "$density" -gt 30 ]; then
    score=80
  fi

  echo "$score"
}

# 9. Error Handling 검사
check_error_handling() {
  if [ "$VERBOSE" = true ]; then
    echo -e "${BLUE}[9/10] Error Handling 검사 중...${NC}"
  fi

  # try-catch, error boundary 존재 확인
  local total_functions=0
  local functions_with_error_handling=0

  while IFS= read -r file; do
    local func_count=$(grep -c "function\|const.*=.*=>.*{" "$file" || echo "0")
    local try_count=$(grep -c "try\s*{" "$file" || echo "0")
    total_functions=$((total_functions + func_count))
    functions_with_error_handling=$((functions_with_error_handling + try_count))
  done < <(find "$TARGET_DIR" -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx")

  local coverage=0
  if [ "$total_functions" -gt 0 ]; then
    coverage=$((functions_with_error_handling * 100 / total_functions))
  fi

  # 에러 핸들링 커버리지를 점수로 변환
  local score=$coverage

  echo "$score"
}

# 10. Test Coverage 검사
check_test_coverage() {
  if [ "$VERBOSE" = true ]; then
    echo -e "${BLUE}[10/10] Test Coverage 검사 중...${NC}"
  fi

  # vitest coverage 결과 파싱
  local coverage=0
  if [ -f "coverage/coverage-summary.json" ]; then
    coverage=$(jq '.total.lines.pct' coverage/coverage-summary.json 2>/dev/null || echo "0")
  fi

  echo "$coverage"
}

# 모든 메트릭 검사 실행
echo -e "${CYAN}=== 코드 품질 검사 시작 ===${NC}"
echo ""

complexity_score=$(check_complexity)
function_length_score=$(check_function_length)
file_size_score=$(check_file_size)
nesting_score=$(check_nesting_depth)
duplication_score=$(check_duplication)
type_coverage_score=$(check_type_coverage)
naming_score=$(check_naming)
comments_score=$(check_comments)
error_handling_score=$(check_error_handling)
test_coverage_score=$(check_test_coverage)

# 가중 평균 계산
calculate_weighted_score() {
  local total=$(awk "BEGIN {
    printf \"%.2f\",
    $complexity_score * $WEIGHT_COMPLEXITY +
    $function_length_score * $WEIGHT_FUNCTION_LENGTH +
    $file_size_score * $WEIGHT_FILE_SIZE +
    $nesting_score * $WEIGHT_NESTING_DEPTH +
    $duplication_score * $WEIGHT_DUPLICATION +
    $type_coverage_score * $WEIGHT_TYPE_COVERAGE +
    $naming_score * $WEIGHT_NAMING +
    $comments_score * $WEIGHT_COMMENTS +
    $error_handling_score * $WEIGHT_ERROR_HANDLING +
    $test_coverage_score * $WEIGHT_TESTING
  }")
  echo "$total"
}

total_score=$(calculate_weighted_score)

# 등급 결정
get_grade() {
  local score=$1
  local int_score=${score%.*}

  if [ "$int_score" -ge 90 ]; then
    echo "S (Excellent)"
  elif [ "$int_score" -ge 80 ]; then
    echo "A (Good)"
  elif [ "$int_score" -ge 70 ]; then
    echo "B (Acceptable)"
  elif [ "$int_score" -ge 60 ]; then
    echo "C (Needs Improvement)"
  else
    echo "F (Poor)"
  fi
}

grade=$(get_grade "$total_score")

# JSON 출력
if [ "$JSON_OUTPUT" = true ]; then
  cat << EOF
    "complexity": { "score": $complexity_score, "weight": $WEIGHT_COMPLEXITY },
    "functionLength": { "score": $function_length_score, "weight": $WEIGHT_FUNCTION_LENGTH },
    "fileSize": { "score": $file_size_score, "weight": $WEIGHT_FILE_SIZE },
    "nestingDepth": { "score": $nesting_score, "weight": $WEIGHT_NESTING_DEPTH },
    "duplication": { "score": $duplication_score, "weight": $WEIGHT_DUPLICATION },
    "typeCoverage": { "score": $type_coverage_score, "weight": $WEIGHT_TYPE_COVERAGE },
    "naming": { "score": $naming_score, "weight": $WEIGHT_NAMING },
    "comments": { "score": $comments_score, "weight": $WEIGHT_COMMENTS },
    "errorHandling": { "score": $error_handling_score, "weight": $WEIGHT_ERROR_HANDLING },
    "testCoverage": { "score": $test_coverage_score, "weight": $WEIGHT_TESTING }
  },
  "totalScore": $total_score,
  "grade": "$grade",
  "passed": $([ "${total_score%.*}" -ge "$MIN_SCORE" ] && echo "true" || echo "false")
}
EOF
else
  # 일반 출력
  echo -e "${CYAN}=== 품질 메트릭 ===${NC}"
  echo ""
  printf "  ${BLUE}%-25s${NC} %3d/100 (가중치: %.0f%%)\n" "Cyclomatic Complexity" "$complexity_score" "$(awk "BEGIN {print $WEIGHT_COMPLEXITY * 100}")"
  printf "  ${BLUE}%-25s${NC} %3d/100 (가중치: %.0f%%)\n" "Function Length" "$function_length_score" "$(awk "BEGIN {print $WEIGHT_FUNCTION_LENGTH * 100}")"
  printf "  ${BLUE}%-25s${NC} %3d/100 (가중치: %.0f%%)\n" "File Size" "$file_size_score" "$(awk "BEGIN {print $WEIGHT_FILE_SIZE * 100}")"
  printf "  ${BLUE}%-25s${NC} %3d/100 (가중치: %.0f%%)\n" "Nesting Depth" "$nesting_score" "$(awk "BEGIN {print $WEIGHT_NESTING_DEPTH * 100}")"
  printf "  ${BLUE}%-25s${NC} %3d/100 (가중치: %.0f%%)\n" "Code Duplication" "$duplication_score" "$(awk "BEGIN {print $WEIGHT_DUPLICATION * 100}")"
  printf "  ${BLUE}%-25s${NC} %3d/100 (가중치: %.0f%%)\n" "Type Coverage" "$type_coverage_score" "$(awk "BEGIN {print $WEIGHT_TYPE_COVERAGE * 100}")"
  printf "  ${BLUE}%-25s${NC} %3d/100 (가중치: %.0f%%)\n" "Naming Quality" "$naming_score" "$(awk "BEGIN {print $WEIGHT_NAMING * 100}")"
  printf "  ${BLUE}%-25s${NC} %3d/100 (가중치: %.0f%%)\n" "Comment Density" "$comments_score" "$(awk "BEGIN {print $WEIGHT_COMMENTS * 100}")"
  printf "  ${BLUE}%-25s${NC} %3d/100 (가중치: %.0f%%)\n" "Error Handling" "$error_handling_score" "$(awk "BEGIN {print $WEIGHT_ERROR_HANDLING * 100}")"
  printf "  ${BLUE}%-25s${NC} %3d/100 (가중치: %.0f%%)\n" "Test Coverage" "$test_coverage_score" "$(awk "BEGIN {print $WEIGHT_TESTING * 100}")"
  echo ""
  echo -e "${CYAN}=== 종합 평가 ===${NC}"
  echo ""
  printf "  ${MAGENTA}총점:${NC} %.2f/100\n" "$total_score"
  printf "  ${MAGENTA}등급:${NC} %s\n" "$grade"
  echo ""

  # 최소 점수 확인
  int_total_score=${total_score%.*}
  if [ "$int_total_score" -ge "$MIN_SCORE" ]; then
    echo -e "${GREEN}✓ 품질 검사 통과 (최소 점수: $MIN_SCORE)${NC}"
    exit_code=0
  else
    echo -e "${RED}✗ 품질 검사 실패 (최소 점수: $MIN_SCORE, 현재: $int_total_score)${NC}"
    exit_code=1
  fi

  # 개선 제안
  echo ""
  echo -e "${YELLOW}개선 제안:${NC}"
  echo ""

  if [ "$complexity_score" -lt 70 ]; then
    echo "  • 복잡도 감소: 함수를 더 작은 단위로 분리하세요"
  fi

  if [ "$function_length_score" -lt 70 ]; then
    echo "  • 함수 길이 단축: 50줄 이하로 리팩토링하세요"
  fi

  if [ "$type_coverage_score" -lt 70 ]; then
    echo "  • 타입 커버리지 개선: 모든 타입 에러를 수정하세요"
  fi

  if [ "$test_coverage_score" -lt 70 ]; then
    echo "  • 테스트 커버리지 향상: 단위 테스트를 추가하세요"
  fi

  echo ""
  exit $exit_code
fi
