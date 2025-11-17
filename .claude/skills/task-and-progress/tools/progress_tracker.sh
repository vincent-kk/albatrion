#!/bin/bash

# progress_tracker.sh
# 진행 상황 자동 추적 및 업데이트 스크립트

set -e

# 색상 코드
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 기본 경로 설정
TASKS_DIR="${TASKS_DIR:-.tasks}"
PLAN_FILE="03_plan.md"
LOG_FILE="progress_log.md"

# 사용법 표시
usage() {
    cat << EOF
Usage: $0 [OPTIONS] <task_directory>

진행 상황을 추적하고 progress_log.md를 업데이트합니다.

OPTIONS:
    -h, --help              도움말 표시
    -v, --verbose           상세 출력
    -d, --date DATE         특정 날짜 지정 (YYYY-MM-DD)
    --start-date DATE       프로젝트 시작일 지정 (YYYY-MM-DD)

EXAMPLES:
    $0 .tasks/timeslot_selector_250115
    $0 -d 2024-01-16 .tasks/timeslot_selector_250115
    $0 --start-date 2024-01-15 .tasks/timeslot_selector_250115

EOF
    exit 1
}

# 인자 파싱
VERBOSE=0
SPECIFIC_DATE=""
START_DATE=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            usage
            ;;
        -v|--verbose)
            VERBOSE=1
            shift
            ;;
        -d|--date)
            SPECIFIC_DATE="$2"
            shift 2
            ;;
        --start-date)
            START_DATE="$2"
            shift 2
            ;;
        *)
            TASK_DIR="$1"
            shift
            ;;
    esac
done

# task_directory 필수 체크
if [ -z "$TASK_DIR" ]; then
    echo -e "${RED}Error: task_directory가 지정되지 않았습니다.${NC}"
    usage
fi

# 디렉토리 존재 확인
if [ ! -d "$TASK_DIR" ]; then
    echo -e "${RED}Error: 디렉토리를 찾을 수 없습니다: $TASK_DIR${NC}"
    exit 1
fi

# plan 파일 존재 확인
PLAN_PATH="$TASK_DIR/$PLAN_FILE"
if [ ! -f "$PLAN_PATH" ]; then
    echo -e "${RED}Error: $PLAN_FILE을 찾을 수 없습니다: $PLAN_PATH${NC}"
    exit 1
fi

LOG_PATH="$TASK_DIR/$LOG_FILE"

# 현재 날짜 (또는 지정된 날짜)
if [ -n "$SPECIFIC_DATE" ]; then
    CURRENT_DATE="$SPECIFIC_DATE"
else
    CURRENT_DATE=$(date +%Y-%m-%d)
fi

# verbose 출력 함수
verbose() {
    if [ $VERBOSE -eq 1 ]; then
        echo -e "${BLUE}[INFO]${NC} $1"
    fi
}

# 완료 작업 수 계산
count_completed() {
    grep -c '^\- \[x\]' "$PLAN_PATH" || echo "0"
}

# 전체 작업 수 계산 (모든 ### 작업 헤더)
count_total() {
    grep -c '^### [0-9]\+\.[0-9]\+' "$PLAN_PATH" || echo "0"
}

# 진행 중 작업 수 계산
count_in_progress() {
    grep -c '^\- \[~\]' "$PLAN_PATH" || echo "0"
}

# 오늘 완료한 작업 찾기 (YYYY-MM-DD 완료 표시)
today_completed_tasks() {
    grep "^\- \[x\].*$CURRENT_DATE" "$PLAN_PATH" | sed 's/^- \[x\] //' || echo ""
}

# 시작일 찾기
find_start_date() {
    if [ -n "$START_DATE" ]; then
        echo "$START_DATE"
    else
        # progress_log.md에서 첫 날짜 찾기
        if [ -f "$LOG_PATH" ]; then
            grep -oP '## \[\K[0-9]{4}-[0-9]{2}-[0-9]{2}' "$LOG_PATH" | head -1 || echo "$CURRENT_DATE"
        else
            echo "$CURRENT_DATE"
        fi
    fi
}

# 경과 일수 계산
days_elapsed() {
    local start="$1"
    local current="$2"

    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        local start_sec=$(date -j -f "%Y-%m-%d" "$start" +%s)
        local current_sec=$(date -j -f "%Y-%m-%d" "$current" +%s)
    else
        # Linux
        local start_sec=$(date -d "$start" +%s)
        local current_sec=$(date -d "$current" +%s)
    fi

    local diff_sec=$((current_sec - start_sec))
    local days=$((diff_sec / 86400 + 1))  # +1 to include first day
    echo $days
}

# Velocity 계산
calculate_velocity() {
    local completed=$1
    local days=$2

    if [ $days -eq 0 ]; then
        echo "0.0"
    else
        echo "scale=1; $completed / $days" | bc
    fi
}

# 예상 완료일 계산
estimate_completion_date() {
    local remaining=$1
    local velocity=$2
    local current="$3"

    if (( $(echo "$velocity <= 0" | bc -l) )); then
        echo "N/A"
        return
    fi

    local days_remaining=$(echo "scale=0; $remaining / $velocity" | bc)

    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        date -j -v+${days_remaining}d -f "%Y-%m-%d" "$current" +%Y-%m-%d
    else
        # Linux
        date -d "$current + $days_remaining days" +%Y-%m-%d
    fi
}

# 이전 로그 읽기 (누적 데이터용)
get_previous_cumulative() {
    if [ -f "$LOG_PATH" ]; then
        grep -oP 'Cumulative\*\*: \K[0-9]+' "$LOG_PATH" | tail -1 || echo "0"
    else
        echo "0"
    fi
}

# 메인 실행
main() {
    verbose "진행 상황 추적 시작: $TASK_DIR"

    # 통계 계산
    total=$(count_total)
    completed=$(count_completed)
    in_progress=$(count_in_progress)
    pending=$((total - completed - in_progress))

    verbose "전체 작업: $total"
    verbose "완료: $completed"
    verbose "진행중: $in_progress"
    verbose "대기: $pending"

    # 진행률 계산
    if [ $total -eq 0 ]; then
        progress=0
    else
        progress=$(echo "scale=1; $completed * 100 / $total" | bc)
    fi

    # 시작일 및 경과 일수
    start_date=$(find_start_date)
    days=$(days_elapsed "$start_date" "$CURRENT_DATE")

    verbose "시작일: $start_date"
    verbose "경과 일수: $days"

    # Velocity 계산
    velocity=$(calculate_velocity $completed $days)

    verbose "Velocity: $velocity 작업/일"

    # 남은 작업 및 예상 완료일
    remaining=$((total - completed))
    estimated_end=$(estimate_completion_date $remaining $velocity "$CURRENT_DATE")

    verbose "예상 완료일: $estimated_end"

    # 오늘 완료한 작업 목록
    today_tasks=$(today_completed_tasks)

    # 이전 누적 완료 (어제까지)
    prev_cumulative=$(get_previous_cumulative)

    # 오늘 완료한 작업 수 (증분)
    today_count=$(echo "$today_tasks" | grep -c '^' || echo "0")
    if [ "$today_tasks" = "" ]; then
        today_count=0
    fi

    # progress_log.md 업데이트
    echo -e "${GREEN}✓ progress_log.md 업데이트 중...${NC}"

    # 기존 로그가 있으면 날짜 중복 체크
    if [ -f "$LOG_PATH" ]; then
        if grep -q "## \[$CURRENT_DATE\]" "$LOG_PATH"; then
            verbose "날짜 $CURRENT_DATE 로그가 이미 존재합니다. 업데이트하지 않습니다."
            echo -e "${YELLOW}⚠ $CURRENT_DATE 로그가 이미 존재합니다.${NC}"
            exit 0
        fi
    else
        # 로그 파일이 없으면 헤더 생성
        cat > "$LOG_PATH" << EOF
# 진행 상황 로그

EOF
    fi

    # 새 로그 엔트리 추가
    cat >> "$LOG_PATH" << EOF
## [$CURRENT_DATE] Day $days

### 완료 ✅
EOF

    if [ -n "$today_tasks" ] && [ "$today_tasks" != "" ]; then
        echo "$today_tasks" | while IFS= read -r task; do
            echo "- $task" >> "$LOG_PATH"
        done
    else
        echo "- 없음" >> "$LOG_PATH"
    fi

    cat >> "$LOG_PATH" << EOF

### 진행 중 🚧
EOF

    # 진행 중인 작업 찾기
    grep '^\- \[~\]' "$PLAN_PATH" | sed 's/^- \[~\] /- /' >> "$LOG_PATH" || echo "- 없음" >> "$LOG_PATH"

    cat >> "$LOG_PATH" << EOF

### 블로커 🚨
- 없음

### 이슈 ⚠️
- 없음

### 학습 내용 📚
- (수동 기록 필요)

### 진행률 📊
- **Today**: $today_count/$total 완료 ($(echo "scale=1; $today_count * 100 / $total" | bc)%)
- **Cumulative**: $completed/$total 완료 ($progress%)
- **Velocity**: $velocity 작업/일
- **예상 완료**: $estimated_end ($(echo "$remaining / $velocity" | bc) 일 남음)

### 다음 계획 📅
- (수동 기록 필요)

---

EOF

    echo -e "${GREEN}✓ progress_log.md 업데이트 완료${NC}"
    echo ""
    echo -e "${BLUE}=== 진행 현황 ===${NC}"
    echo -e "  완료: ${GREEN}$completed${NC}/$total ($progress%)"
    echo -e "  Velocity: ${BLUE}$velocity${NC} 작업/일"
    echo -e "  예상 완료: ${YELLOW}$estimated_end${NC}"
}

main
