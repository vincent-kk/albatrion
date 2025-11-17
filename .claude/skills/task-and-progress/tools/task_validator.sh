#!/bin/bash

# task_validator.sh
# 03_plan.md 작업 형식 검증 스크립트

set -e

# 색상 코드
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 기본 경로 설정
PLAN_FILE="03_plan.md"
REQ_FILE="01_requirements.md"

# 사용법 표시
usage() {
    cat << EOF
Usage: $0 [OPTIONS] <task_directory>

03_plan.md의 5-Field 형식과 요구사항 ID 참조를 검증합니다.

5-Field 형식:
  - **파일**: {파일 경로}
  - **내용**: {작업 내용}
  - **방법**: {구현 방법}
  - **완료**: [ ]
  - **Requirements**: {REQ-ID 목록}

OPTIONS:
    -h, --help              도움말 표시
    -v, --verbose           상세 출력
    -s, --strict            엄격 모드 (경고도 에러로 처리)
    --skip-req-check        요구사항 ID 검증 건너뛰기

EXAMPLES:
    $0 .tasks/timeslot_selector_250115
    $0 -v .tasks/timeslot_selector_250115
    $0 --strict .tasks/timeslot_selector_250115

EXIT CODES:
    0 - 검증 성공
    1 - 에러 발견
    2 - 경고 발견 (strict 모드에서만)

EOF
    exit 1
}

# 인자 파싱
VERBOSE=0
STRICT=0
SKIP_REQ_CHECK=0

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            usage
            ;;
        -v|--verbose)
            VERBOSE=1
            shift
            ;;
        -s|--strict)
            STRICT=1
            shift
            ;;
        --skip-req-check)
            SKIP_REQ_CHECK=1
            shift
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

REQ_PATH="$TASK_DIR/$REQ_FILE"

# 에러 및 경고 카운터
ERROR_COUNT=0
WARNING_COUNT=0

# verbose 출력 함수
verbose() {
    if [ $VERBOSE -eq 1 ]; then
        echo -e "${BLUE}[INFO]${NC} $1"
    fi
}

# 에러 출력 함수
error() {
    echo -e "${RED}[ERROR]${NC} $1"
    ((ERROR_COUNT++))
}

# 경고 출력 함수
warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    ((WARNING_COUNT++))
}

# 5-Field 필수 필드 체크
check_required_fields() {
    local task_num="$1"
    local content="$2"

    verbose "작업 $task_num 필드 검증 중..."

    # 필수 필드 배열
    local required_fields=("파일" "내용" "방법" "완료" "Requirements")

    for field in "${required_fields[@]}"; do
        if ! echo "$content" | grep -q "^\- \*\*$field\*\*:"; then
            error "작업 $task_num: 필수 필드 '$field' 누락"
        fi
    done
}

# 파일 경로 검증
check_file_path() {
    local task_num="$1"
    local file_path="$2"

    if [ -z "$file_path" ] || [ "$file_path" = "**파일**: " ]; then
        error "작업 $task_num: 파일 경로가 비어있습니다"
        return
    fi

    # 상대 경로 패턴 체크 (src/, packages/ 등)
    if [[ ! "$file_path" =~ ^(src/|packages/|tests?/|scripts?/|tools?/|docs?/) ]]; then
        warning "작업 $task_num: 파일 경로가 표준 디렉토리로 시작하지 않습니다: $file_path"
    fi
}

# 내용 필드 검증
check_content_field() {
    local task_num="$1"
    local content="$2"

    if [ -z "$content" ] || [ "$content" = "**내용**: " ]; then
        error "작업 $task_num: 내용이 비어있습니다"
        return
    fi

    # 내용이 너무 짧은지 체크 (10자 미만)
    local len=${#content}
    if [ $len -lt 10 ]; then
        warning "작업 $task_num: 내용이 너무 짧습니다 ($len 자)"
    fi
}

# 방법 필드 검증
check_method_field() {
    local task_num="$1"
    local method="$2"

    if [ -z "$method" ] || [ "$method" = "**방법**: " ]; then
        error "작업 $task_num: 방법이 비어있습니다"
        return
    fi

    # 방법이 단계별로 작성되었는지 체크 (1., 2., 3. 패턴)
    if ! echo "$method" | grep -qE '^\s+[0-9]+\.'; then
        warning "작업 $task_num: 방법이 단계별로 작성되지 않았습니다"
    fi
}

# 완료 체크박스 검증
check_completion_checkbox() {
    local task_num="$1"
    local checkbox="$2"

    # 유효한 체크박스 형식: [ ], [x], [~]
    if ! echo "$checkbox" | grep -qE '^\- \*\*완료\*\*: \[([ x~])\]'; then
        error "작업 $task_num: 완료 체크박스 형식이 올바르지 않습니다"
        return
    fi

    # 날짜 형식 검증 (있는 경우)
    if echo "$checkbox" | grep -qE '\[x\].*[0-9]{4}-[0-9]{2}-[0-9]{2}'; then
        verbose "작업 $task_num: 완료 날짜 기록됨"
    fi
}

# Requirements ID 검증
check_requirements_ids() {
    local task_num="$1"
    local req_ids="$2"

    if [ -z "$req_ids" ] || [ "$req_ids" = "**Requirements**: " ]; then
        error "작업 $task_num: Requirements ID가 비어있습니다"
        return
    fi

    # REQ-ID 형식 체크 (REQ-F-001, REQ-NF-010 등)
    if ! echo "$req_ids" | grep -qE 'REQ-(F|NF)-[0-9]+'; then
        error "작업 $task_num: Requirements ID 형식이 올바르지 않습니다: $req_ids"
        return
    fi

    # 01_requirements.md와 대조 (파일이 있는 경우)
    if [ $SKIP_REQ_CHECK -eq 0 ] && [ -f "$REQ_PATH" ]; then
        # 쉼표로 분리된 각 REQ-ID 검증
        IFS=',' read -ra IDS <<< "$req_ids"
        for req_id in "${IDS[@]}"; do
            # 공백 제거
            req_id=$(echo "$req_id" | xargs)

            if ! grep -q "^#### $req_id" "$REQ_PATH"; then
                warning "작업 $task_num: Requirements ID '$req_id'가 $REQ_FILE에 없습니다"
            fi
        done
    fi
}

# 작업 크기 검증 (예상 시간)
check_task_size() {
    local task_num="$1"
    local content="$2"

    # 예상 시간 필드 찾기 (선택적)
    if echo "$content" | grep -qE '\*\*예상 시간\*\*: [0-9]+(\.[0-9]+)?시간'; then
        local hours=$(echo "$content" | grep -oP '예상 시간\*\*: \K[0-9]+(\.[0-9]+)?')

        # 1-4시간 범위 권장
        if (( $(echo "$hours < 1" | bc -l) )); then
            warning "작업 $task_num: 예상 시간이 너무 짧습니다 ($hours 시간) - 다른 작업과 병합 고려"
        elif (( $(echo "$hours > 4" | bc -l) )); then
            warning "작업 $task_num: 예상 시간이 너무 깁니다 ($hours 시간) - 더 작은 작업으로 분해 고려"
        fi
    fi
}

# 작업 번호 중복 체크
check_duplicate_task_numbers() {
    verbose "작업 번호 중복 검증 중..."

    local task_numbers=$(grep -oP '^### \K[0-9]+\.[0-9]+' "$PLAN_PATH" | sort)
    local duplicates=$(echo "$task_numbers" | uniq -d)

    if [ -n "$duplicates" ]; then
        error "중복된 작업 번호 발견: $duplicates"
    fi
}

# Phase 구조 검증
check_phase_structure() {
    verbose "Phase 구조 검증 중..."

    # Phase 헤더 찾기 (## Phase X:)
    local phases=$(grep -c '^## Phase [0-9]\+:' "$PLAN_PATH" || echo "0")

    if [ $phases -eq 0 ]; then
        warning "Phase 구조가 없습니다. Phase로 작업을 그룹화하는 것을 권장합니다."
    fi
}

# 메인 검증 실행
main() {
    echo -e "${BLUE}=== 03_plan.md 검증 시작 ===${NC}"
    echo ""

    verbose "파일: $PLAN_PATH"

    # Phase 구조 검증
    check_phase_structure

    # 작업 번호 중복 검증
    check_duplicate_task_numbers

    # 각 작업 섹션 추출 및 검증
    local current_task=""
    local current_content=""
    local in_task=0

    while IFS= read -r line; do
        # 작업 헤더 감지 (### X.Y)
        if echo "$line" | grep -qE '^### [0-9]+\.[0-9]+'; then
            # 이전 작업 처리
            if [ $in_task -eq 1 ] && [ -n "$current_task" ]; then
                check_required_fields "$current_task" "$current_content"

                # 개별 필드 추출 및 검증
                local file_path=$(echo "$current_content" | grep -oP '^\- \*\*파일\*\*: \K.*' || echo "")
                local content=$(echo "$current_content" | grep -oP '^\- \*\*내용\*\*: \K.*' || echo "")
                local method=$(echo "$current_content" | grep -A 10 '^\- \*\*방법\*\*:' || echo "")
                local checkbox=$(echo "$current_content" | grep '^\- \*\*완료\*\*:' || echo "")
                local req_ids=$(echo "$current_content" | grep -oP '^\- \*\*Requirements\*\*: \K.*' || echo "")

                check_file_path "$current_task" "$file_path"
                check_content_field "$current_task" "$content"
                check_method_field "$current_task" "$method"
                check_completion_checkbox "$current_task" "$checkbox"
                check_requirements_ids "$current_task" "$req_ids"
                check_task_size "$current_task" "$current_content"
            fi

            # 새 작업 시작
            current_task=$(echo "$line" | grep -oP '^### \K[0-9]+\.[0-9]+')
            current_content=""
            in_task=1
        elif [ $in_task -eq 1 ]; then
            # 다음 섹션 헤더(## 또는 ###)를 만나면 중단
            if echo "$line" | grep -qE '^##'; then
                in_task=0
            else
                current_content+="$line"$'\n'
            fi
        fi
    done < "$PLAN_PATH"

    # 마지막 작업 처리
    if [ $in_task -eq 1 ] && [ -n "$current_task" ]; then
        check_required_fields "$current_task" "$current_content"

        local file_path=$(echo "$current_content" | grep -oP '^\- \*\*파일\*\*: \K.*' || echo "")
        local content=$(echo "$current_content" | grep -oP '^\- \*\*내용\*\*: \K.*' || echo "")
        local method=$(echo "$current_content" | grep -A 10 '^\- \*\*방법\*\*:' || echo "")
        local checkbox=$(echo "$current_content" | grep '^\- \*\*완료\*\*:' || echo "")
        local req_ids=$(echo "$current_content" | grep -oP '^\- \*\*Requirements\*\*: \K.*' || echo "")

        check_file_path "$current_task" "$file_path"
        check_content_field "$current_task" "$content"
        check_method_field "$current_task" "$method"
        check_completion_checkbox "$current_task" "$checkbox"
        check_requirements_ids "$current_task" "$req_ids"
        check_task_size "$current_task" "$current_content"
    fi

    # 결과 출력
    echo ""
    echo -e "${BLUE}=== 검증 완료 ===${NC}"
    echo -e "  에러: ${RED}$ERROR_COUNT${NC}"
    echo -e "  경고: ${YELLOW}$WARNING_COUNT${NC}"
    echo ""

    # 종료 코드 결정
    if [ $ERROR_COUNT -gt 0 ]; then
        echo -e "${RED}✗ 검증 실패 - 에러를 수정해주세요${NC}"
        exit 1
    elif [ $STRICT -eq 1 ] && [ $WARNING_COUNT -gt 0 ]; then
        echo -e "${YELLOW}✗ 검증 실패 (strict 모드) - 경고를 수정해주세요${NC}"
        exit 2
    else
        echo -e "${GREEN}✓ 검증 성공${NC}"
        exit 0
    fi
}

main
